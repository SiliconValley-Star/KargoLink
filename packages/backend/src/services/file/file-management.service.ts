import { PrismaClient, File, FileType, FileStatus, StorageProvider } from '@prisma/client';
import { createHash } from 'crypto';
import path from 'path';
import { getS3Service, MulterFile } from '../storage/aws-s3.service';
import logger from '../../utils/logger';

export interface CreateFileData {
  originalName: string;
  mimeType: string;
  size: number;
  type: FileType;
  category?: string;
  tags?: string[];
  uploadedById?: string;
  uploadSource?: string;
  metadata?: any;
  isPublic?: boolean;
  expiresAt?: Date;
}

export interface FileSearchOptions {
  type?: FileType;
  category?: string;
  tags?: string[];
  uploadedById?: string;
  status?: FileStatus;
  isPublic?: boolean;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'size' | 'downloadCount' | 'lastAccessedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface FileWithAssociations extends File {
  associations?: Array<{
    entityType: string;
    entityId: string;
    fieldName?: string;
    purpose?: string;
  }>;
}

class FileManagementService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Yeni dosya kaydı oluştur
   */
  async createFile(data: CreateFileData, buffer?: Buffer): Promise<File> {
    try {
      // Hash hesapla
      const hash = buffer ? this.calculateHash(buffer) : '';
      
      // Duplicate kontrolü
      if (hash) {
        const existingFile = await this.prisma.file.findUnique({
          where: { hash }
        });

        if (existingFile && existingFile.status === 'ACTIVE') {
          logger.info('Duplicate file found, returning existing file', {
            hash,
            existingFileId: existingFile.id,
            originalName: data.originalName
          });
          return existingFile;
        }
      }

      // Dosya adı ve path oluştur
      const fileName = this.generateFileName(data.originalName);
      const filePath = this.generateFilePath(data.type, fileName);
      
      // S3'e upload
      let s3Result = null;
      if (buffer) {
        const s3Service = getS3Service();
        if (s3Service) {
          const multerFile: MulterFile = {
            buffer,
            originalname: data.originalName,
            mimetype: data.mimeType,
            size: data.size,
            fieldname: 'file',
            encoding: '7bit'
          };
          
          s3Result = await s3Service.uploadFile(multerFile, {
            folder: path.dirname(filePath),
            generateThumbnail: data.type === 'IMAGE',
            maxWidth: 2048,
            maxHeight: 2048,
            quality: 85,
            allowedTypes: [data.mimeType],
            maxSize: 50 * 1024 * 1024 // 50MB
          });
        }
      }

      // Database'e kaydet
      const file = await this.prisma.file.create({
        data: {
          key: s3Result?.key || filePath,
          originalName: data.originalName,
          fileName,
          mimeType: data.mimeType,
          size: BigInt(data.size),
          hash,
          type: data.type,
          category: data.category,
          tags: data.tags || [],
          provider: StorageProvider.AWS_S3,
          bucketName: process.env.AWS_S3_BUCKET!,
          path: filePath,
          url: s3Result?.url || '',
          isPublic: data.isPublic || false,
          status: FileStatus.ACTIVE,
          metadata: data.metadata || {},
          uploadedById: data.uploadedById,
          uploadSource: data.uploadSource || 'web',
          expiresAt: data.expiresAt,
          uploadedAt: new Date()
        }
      });

      logger.info('File created successfully', {
        fileId: file.id,
        originalName: file.originalName,
        size: file.size.toString(),
        type: file.type
      });

      return file;
    } catch (error) {
      logger.error('Error creating file record', {
        originalName: data.originalName,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Dosya bilgilerini güncelle
   */
  async updateFile(
    fileId: string, 
    data: Partial<Pick<File, 'category' | 'tags' | 'metadata' | 'isPublic' | 'expiresAt'>>
  ): Promise<File> {
    const updateData: any = {
      ...data,
      updatedAt: new Date()
    };
    
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata as any;
    }
    
    const file = await this.prisma.file.update({
      where: { id: fileId },
      data: updateData
    });

    logger.info('File updated', { fileId, updatedFields: Object.keys(data) });
    return file;
  }

  /**
   * Dosyayı sil (soft delete)
   */
  async deleteFile(fileId: string, hardDelete: boolean = false): Promise<void> {
    try {
      const file = await this.prisma.file.findUnique({
        where: { id: fileId }
      });

      if (!file) {
        throw new Error('File not found');
      }

      if (hardDelete) {
        // S3'ten sil
        const s3Service = getS3Service();
        if (s3Service) {
          await s3Service.deleteFile(file.key);
        }

        // Database'ten sil
        await this.prisma.file.delete({
          where: { id: fileId }
        });
      } else {
        // Soft delete
        await this.prisma.file.update({
          where: { id: fileId },
          data: {
            status: FileStatus.DELETED,
            deletedAt: new Date()
          }
        });
      }

      logger.info('File deleted', { fileId, hardDelete });
    } catch (error) {
      logger.error('Error deleting file', {
        fileId,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Dosya ara
   */
  async searchFiles(options: FileSearchOptions = {}): Promise<{
    files: File[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      type,
      category,
      tags,
      uploadedById,
      status = FileStatus.ACTIVE,
      isPublic,
      fromDate,
      toDate,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const where: any = {
      status,
      deletedAt: null
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (tags && tags.length > 0) where.tags = { hasSome: tags };
    if (uploadedById) where.uploadedById = uploadedById;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      this.prisma.file.count({ where })
    ]);

    return {
      files,
      total,
      hasMore: offset + limit < total
    };
  }

  /**
   * Dosya detayını getir
   */
  async getFileById(fileId: string): Promise<FileWithAssociations | null> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        associations: {
          select: {
            entityType: true,
            entityId: true,
            fieldName: true,
            purpose: true
          }
        },
        shares: {
          where: { isActive: true },
          select: {
            id: true,
            token: true,
            permissions: true,
            expiresAt: true,
            downloadCount: true
          }
        }
      }
    }) as any;

    return file;
  }

  /**
   * Dosyayı key ile bul
   */
  async getFileByKey(key: string): Promise<File | null> {
    return await this.prisma.file.findUnique({
      where: { key }
    });
  }

  /**
   * Dosya ilişkilendir
   */
  async associateFile(fileId: string, associations: Array<{
    entityType: string;
    entityId: string;
    fieldName?: string;
    purpose?: string;
    displayOrder?: number;
  }>): Promise<void> {
    await this.prisma.fileAssociation.createMany({
      data: associations.map(assoc => ({
        fileId,
        ...assoc
      }))
    });

    logger.info('File associations created', { fileId, associationCount: associations.length });
  }

  /**
   * Dosya ilişkisini kaldır
   */
  async removeFileAssociation(fileId: string, entityType: string, entityId: string): Promise<void> {
    await this.prisma.fileAssociation.deleteMany({
      where: {
        fileId,
        entityType,
        entityId
      }
    });
  }

  /**
   * Entity'nin dosyalarını getir
   */
  async getEntityFiles(entityType: string, entityId: string): Promise<File[]> {
    const associations = await this.prisma.fileAssociation.findMany({
      where: {
        entityType,
        entityId,
        file: {
          status: FileStatus.ACTIVE,
          deletedAt: null
        }
      },
      include: {
        file: true
      },
      orderBy: { displayOrder: 'asc' }
    });

    return associations.map(assoc => assoc.file).filter(Boolean);
  }

  /**
   * Dosya erişim logunu kaydet
   */
  async logFileAccess(
    fileId: string, 
    action: string, 
    userId?: string, 
    metadata?: any
  ): Promise<void> {
    await this.prisma.fileAccessLog.create({
      data: {
        fileId,
        userId,
        action,
        metadata: metadata || {},
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        referer: metadata?.referer,
        responseStatus: metadata?.responseStatus,
        bytesServed: metadata?.bytesServed ? BigInt(metadata.bytesServed) : null,
        duration: metadata?.duration
      }
    });
  }

  /**
   * Dosya istatistiklerini güncelle
   */
  async incrementDownloadCount(fileId: string): Promise<void> {
    await this.prisma.file.update({
      where: { id: fileId },
      data: {
        downloadCount: { increment: 1 },
        lastAccessedAt: new Date()
      }
    });
  }

  /**
   * Süresi dolmuş dosyları temizle
   */
  async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await this.prisma.file.findMany({
      where: {
        expiresAt: {
          lte: new Date()
        },
        status: FileStatus.ACTIVE,
        autoCleanup: true
      }
    });

    let cleanedCount = 0;
    for (const file of expiredFiles) {
      try {
        await this.deleteFile(file.id, true);
        cleanedCount++;
      } catch (error) {
        logger.error('Error cleaning up expired file', {
          fileId: file.id,
          error: error instanceof Error ? error.message : error
        });
      }
    }

    logger.info('Expired files cleanup completed', { cleanedCount });
    return cleanedCount;
  }

  /**
   * Dosya boyutu istatistikleri
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: string;
    byType: Record<FileType, { count: number; size: string }>;
    byMonth: Array<{ month: string; count: number; size: string }>;
  }> {
    const stats = await this.prisma.file.groupBy({
      by: ['type'],
      where: {
        status: FileStatus.ACTIVE,
        deletedAt: null
      },
      _count: true,
      _sum: {
        size: true
      }
    });

    const totalFiles = await this.prisma.file.count({
      where: {
        status: FileStatus.ACTIVE,
        deletedAt: null
      }
    });

    const totalSizeResult = await this.prisma.file.aggregate({
      where: {
        status: FileStatus.ACTIVE,
        deletedAt: null
      },
      _sum: {
        size: true
      }
    });

    const byType = stats.reduce((acc, stat) => {
      acc[stat.type] = {
        count: stat._count,
        size: this.formatBytes(Number(stat._sum.size || 0))
      };
      return acc;
    }, {} as Record<FileType, { count: number; size: string }>);

    return {
      totalFiles,
      totalSize: this.formatBytes(Number(totalSizeResult._sum.size || 0)),
      byType,
      byMonth: [] // TODO: Implement monthly stats
    };
  }

  /**
   * Helper: Hash hesapla
   */
  private calculateHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Helper: Dosya adı oluştur
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    
    return `${baseName}_${timestamp}_${random}${ext}`;
  }

  /**
   * Helper: Dosya path'i oluştur
   */
  private generateFilePath(type: FileType, fileName: string): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const day = new Date().getDate().toString().padStart(2, '0');
    
    return `${type.toLowerCase()}/${year}/${month}/${day}/${fileName}`;
  }

  /**
   * Helper: Byte formatla
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export { FileManagementService };