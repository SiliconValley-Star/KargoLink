"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManagementService = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
const aws_s3_service_1 = require("../storage/aws-s3.service");
const logger_1 = __importDefault(require("../../utils/logger"));
class FileManagementService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createFile(data, buffer) {
        try {
            const hash = buffer ? this.calculateHash(buffer) : '';
            if (hash) {
                const existingFile = await this.prisma.file.findUnique({
                    where: { hash }
                });
                if (existingFile && existingFile.status === 'ACTIVE') {
                    logger_1.default.info('Duplicate file found, returning existing file', {
                        hash,
                        existingFileId: existingFile.id,
                        originalName: data.originalName
                    });
                    return existingFile;
                }
            }
            const fileName = this.generateFileName(data.originalName);
            const filePath = this.generateFilePath(data.type, fileName);
            let s3Result = null;
            if (buffer) {
                const s3Service = (0, aws_s3_service_1.getS3Service)();
                if (s3Service) {
                    const multerFile = {
                        buffer,
                        originalname: data.originalName,
                        mimetype: data.mimeType,
                        size: data.size,
                        fieldname: 'file',
                        encoding: '7bit'
                    };
                    s3Result = await s3Service.uploadFile(multerFile, {
                        folder: path_1.default.dirname(filePath),
                        generateThumbnail: data.type === 'IMAGE',
                        maxWidth: 2048,
                        maxHeight: 2048,
                        quality: 85,
                        allowedTypes: [data.mimeType],
                        maxSize: 50 * 1024 * 1024
                    });
                }
            }
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
                    provider: client_1.StorageProvider.AWS_S3,
                    bucketName: process.env.AWS_S3_BUCKET,
                    path: filePath,
                    url: s3Result?.url || '',
                    isPublic: data.isPublic || false,
                    status: client_1.FileStatus.ACTIVE,
                    metadata: data.metadata || {},
                    uploadedById: data.uploadedById,
                    uploadSource: data.uploadSource || 'web',
                    expiresAt: data.expiresAt,
                    uploadedAt: new Date()
                }
            });
            logger_1.default.info('File created successfully', {
                fileId: file.id,
                originalName: file.originalName,
                size: file.size.toString(),
                type: file.type
            });
            return file;
        }
        catch (error) {
            logger_1.default.error('Error creating file record', {
                originalName: data.originalName,
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }
    async updateFile(fileId, data) {
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        if (data.metadata !== undefined) {
            updateData.metadata = data.metadata;
        }
        const file = await this.prisma.file.update({
            where: { id: fileId },
            data: updateData
        });
        logger_1.default.info('File updated', { fileId, updatedFields: Object.keys(data) });
        return file;
    }
    async deleteFile(fileId, hardDelete = false) {
        try {
            const file = await this.prisma.file.findUnique({
                where: { id: fileId }
            });
            if (!file) {
                throw new Error('File not found');
            }
            if (hardDelete) {
                const s3Service = (0, aws_s3_service_1.getS3Service)();
                if (s3Service) {
                    await s3Service.deleteFile(file.key);
                }
                await this.prisma.file.delete({
                    where: { id: fileId }
                });
            }
            else {
                await this.prisma.file.update({
                    where: { id: fileId },
                    data: {
                        status: client_1.FileStatus.DELETED,
                        deletedAt: new Date()
                    }
                });
            }
            logger_1.default.info('File deleted', { fileId, hardDelete });
        }
        catch (error) {
            logger_1.default.error('Error deleting file', {
                fileId,
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }
    async searchFiles(options = {}) {
        const { type, category, tags, uploadedById, status = client_1.FileStatus.ACTIVE, isPublic, fromDate, toDate, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const where = {
            status,
            deletedAt: null
        };
        if (type)
            where.type = type;
        if (category)
            where.category = category;
        if (tags && tags.length > 0)
            where.tags = { hasSome: tags };
        if (uploadedById)
            where.uploadedById = uploadedById;
        if (isPublic !== undefined)
            where.isPublic = isPublic;
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate)
                where.createdAt.gte = fromDate;
            if (toDate)
                where.createdAt.lte = toDate;
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
    async getFileById(fileId) {
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
        });
        return file;
    }
    async getFileByKey(key) {
        return await this.prisma.file.findUnique({
            where: { key }
        });
    }
    async associateFile(fileId, associations) {
        await this.prisma.fileAssociation.createMany({
            data: associations.map(assoc => ({
                fileId,
                ...assoc
            }))
        });
        logger_1.default.info('File associations created', { fileId, associationCount: associations.length });
    }
    async removeFileAssociation(fileId, entityType, entityId) {
        await this.prisma.fileAssociation.deleteMany({
            where: {
                fileId,
                entityType,
                entityId
            }
        });
    }
    async getEntityFiles(entityType, entityId) {
        const associations = await this.prisma.fileAssociation.findMany({
            where: {
                entityType,
                entityId,
                file: {
                    status: client_1.FileStatus.ACTIVE,
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
    async logFileAccess(fileId, action, userId, metadata) {
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
    async incrementDownloadCount(fileId) {
        await this.prisma.file.update({
            where: { id: fileId },
            data: {
                downloadCount: { increment: 1 },
                lastAccessedAt: new Date()
            }
        });
    }
    async cleanupExpiredFiles() {
        const expiredFiles = await this.prisma.file.findMany({
            where: {
                expiresAt: {
                    lte: new Date()
                },
                status: client_1.FileStatus.ACTIVE,
                autoCleanup: true
            }
        });
        let cleanedCount = 0;
        for (const file of expiredFiles) {
            try {
                await this.deleteFile(file.id, true);
                cleanedCount++;
            }
            catch (error) {
                logger_1.default.error('Error cleaning up expired file', {
                    fileId: file.id,
                    error: error instanceof Error ? error.message : error
                });
            }
        }
        logger_1.default.info('Expired files cleanup completed', { cleanedCount });
        return cleanedCount;
    }
    async getStorageStats() {
        const stats = await this.prisma.file.groupBy({
            by: ['type'],
            where: {
                status: client_1.FileStatus.ACTIVE,
                deletedAt: null
            },
            _count: true,
            _sum: {
                size: true
            }
        });
        const totalFiles = await this.prisma.file.count({
            where: {
                status: client_1.FileStatus.ACTIVE,
                deletedAt: null
            }
        });
        const totalSizeResult = await this.prisma.file.aggregate({
            where: {
                status: client_1.FileStatus.ACTIVE,
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
        }, {});
        return {
            totalFiles,
            totalSize: this.formatBytes(Number(totalSizeResult._sum.size || 0)),
            byType,
            byMonth: []
        };
    }
    calculateHash(buffer) {
        return (0, crypto_1.createHash)('sha256').update(buffer).digest('hex');
    }
    generateFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = path_1.default.extname(originalName);
        const baseName = path_1.default.basename(originalName, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 20);
        return `${baseName}_${timestamp}_${random}${ext}`;
    }
    generateFilePath(type, fileName) {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const day = new Date().getDate().toString().padStart(2, '0');
        return `${type.toLowerCase()}/${year}/${month}/${day}/${fileName}`;
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
exports.FileManagementService = FileManagementService;
//# sourceMappingURL=file-management.service.js.map