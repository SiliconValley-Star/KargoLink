import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import sharp from 'sharp';
import { config } from '../../config/environment';
import logger from '../../utils/logger';

// Multer file interface
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
}

export interface UploadOptions {
  folder?: string;
  generateThumbnail?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  allowedTypes?: string[];
  maxSize?: number; // bytes
}

class AWSS3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;
  private cloudFrontDomain?: string;

  constructor() {
    if (!config.aws) {
      throw new Error('AWS configuration is not provided. Please set AWS environment variables.');
    }

    this.bucketName = config.aws.s3Bucket;
    this.region = config.aws.region;
    this.cloudFrontDomain = config.aws.cloudFrontDomain;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });

    logger.info(`AWS S3 Service initialized - Bucket: ${this.bucketName}, Region: ${this.region}`);
  }

  /**
   * Upload dosya S3'e yükle
   */
  async uploadFile(
    file: MulterFile,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Dosya validasyonu
      this.validateFile(file, options);

      const {
        folder = 'uploads',
        generateThumbnail = false,
        maxWidth,
        maxHeight,
        quality = 85,
      } = options;

      // Benzersiz dosya adı oluştur
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      let processedBuffer = file.buffer;
      let finalMimeType = file.mimetype;

      // Görüntü dosyalarını işle
      if (file.mimetype.startsWith('image/')) {
        const sharpInstance = sharp(file.buffer);
        const metadata = await sharpInstance.metadata();

        // Boyut sınırlaması varsa uygula
        if (maxWidth || maxHeight) {
          sharpInstance.resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        // JPEG formatına çevir ve kalite ayarla
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
          processedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
        } else if (file.mimetype === 'image/png') {
          processedBuffer = await sharpInstance.png({ compressionLevel: 6 }).toBuffer();
        } else {
          // Diğer formatları JPEG'e çevir
          processedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
          finalMimeType = 'image/jpeg';
        }

        logger.info(`Image processed: ${metadata.width}x${metadata.height} -> ${processedBuffer.length} bytes`);
      }

      // Ana dosyayı yükle
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: processedBuffer,
        ContentType: finalMimeType,
        CacheControl: 'max-age=31536000', // 1 yıl cache
        Metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
        },
      };

      const upload = new Upload({
        client: this.s3Client,
        params: uploadParams,
      });

      const result = await upload.done();
      const url = await this.getSignedUrl(key);

      let thumbnailKey: string | undefined;
      let thumbnailUrl: string | undefined;

      // Thumbnail oluştur
      if (generateThumbnail && file.mimetype.startsWith('image/')) {
        const thumbnailBuffer = await sharp(file.buffer)
          .resize(300, 300, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 70 })
          .toBuffer();

        thumbnailKey = `thumbnails/${uniqueFileName}`;
        
        const thumbnailUploadParams = {
          Bucket: this.bucketName,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
          CacheControl: 'max-age=31536000',
          Metadata: {
            originalName: file.originalname,
            uploadDate: new Date().toISOString(),
            isThumbnail: 'true',
          },
        };

        const thumbnailUpload = new Upload({
          client: this.s3Client,
          params: thumbnailUploadParams,
        });

        await thumbnailUpload.done();
        thumbnailUrl = await this.getSignedUrl(thumbnailKey);

        logger.info(`Thumbnail created: ${thumbnailKey}`);
      }

      const uploadResult: UploadResult = {
        key,
        url,
        size: processedBuffer.length,
        mimeType: finalMimeType,
        originalName: file.originalname,
        thumbnailKey,
        thumbnailUrl,
      };

      logger.info(`File uploaded successfully: ${key} (${uploadResult.size} bytes)`);
      return uploadResult;

    } catch (error) {
      logger.error('File upload error:', error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Dosya sil
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
      logger.info(`File deleted: ${key}`);
    } catch (error) {
      logger.error(`File deletion error for ${key}:`, error);
      throw new Error(`File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Birden fazla dosya sil
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      const deletePromises = keys.map(key => this.deleteFile(key));
      await Promise.all(deletePromises);
      logger.info(`${keys.length} files deleted successfully`);
    } catch (error) {
      logger.error('Bulk file deletion error:', error);
      throw error;
    }
  }

  /**
   * Signed URL al
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      logger.error(`Get signed URL error for ${key}:`, error);
      throw new Error(`Get signed URL failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Dosya bilgilerini al
   */
  async getFileInfo(key: string): Promise<{ size: number; lastModified: Date; contentType: string } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFound') {
        return null;
      }
      logger.error(`Get file info error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Dosya var mı kontrol et
   */
  async fileExists(key: string): Promise<boolean> {
    const info = await this.getFileInfo(key);
    return info !== null;
  }

  /**
   * Upload presigned URL oluştur
   */
  async generateUploadUrl(
    fileName: string,
    contentType: string,
    folder: string = 'uploads',
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string }> {
    try {
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        CacheControl: 'max-age=31536000',
        Metadata: {
          originalName: fileName,
          uploadDate: new Date().toISOString(),
        },
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      return {
        uploadUrl,
        key,
      };
    } catch (error) {
      logger.error('Generate upload URL error:', error);
      throw new Error(`Generate upload URL failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Dosya validasyonu
   */
  private validateFile(file: MulterFile, options: UploadOptions): void {
    const {
      allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      maxSize = 10 * 1024 * 1024, // 10MB default
    } = options;

    // Dosya tipi kontrolü
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type not allowed: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Dosya boyutu kontrolü
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      const fileSizeMB = file.size / (1024 * 1024);
      throw new Error(`File too large: ${fileSizeMB.toFixed(2)}MB. Maximum allowed: ${maxSizeMB.toFixed(2)}MB`);
    }

    // Dosya adı kontrolü
    if (!file.originalname || file.originalname.length > 255) {
      throw new Error('Invalid file name');
    }
  }

  /**
   * Public URL oluştur (CloudFront varsa)
   */
  getPublicUrl(key: string): string {
    if (this.cloudFrontDomain) {
      return `https://${this.cloudFrontDomain}/${key}`;
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Storage istatistikleri
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<string, { count: number; size: number }>;
  }> {
    // Bu bir S3 listObjectsV2 operasyonu gerektirir
    // Büyük bucket'lar için pahalı olabileceği için, 
    // bu bilgileri veritabanında tutmak daha mantıklı
    logger.info('Storage stats requested - implement database tracking for better performance');
    
    return {
      totalFiles: 0,
      totalSize: 0,
      byType: {},
    };
  }
}

// Lazy loading için s3Service instance'ı
let s3ServiceInstance: AWSS3Service | null = null;

export const getS3Service = (): AWSS3Service | null => {
  if (!config.aws) {
    return null;
  }
  
  if (!s3ServiceInstance) {
    s3ServiceInstance = new AWSS3Service();
  }
  
  return s3ServiceInstance;
};

export default getS3Service;