"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getS3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const sharp_1 = __importDefault(require("sharp"));
const environment_1 = require("../../config/environment");
const logger_1 = __importDefault(require("../../utils/logger"));
class AWSS3Service {
    s3Client;
    bucketName;
    region;
    cloudFrontDomain;
    constructor() {
        if (!environment_1.config.aws) {
            throw new Error('AWS configuration is not provided. Please set AWS environment variables.');
        }
        this.bucketName = environment_1.config.aws.s3Bucket;
        this.region = environment_1.config.aws.region;
        this.cloudFrontDomain = environment_1.config.aws.cloudFrontDomain;
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: environment_1.config.aws.accessKeyId,
                secretAccessKey: environment_1.config.aws.secretAccessKey,
            },
        });
        logger_1.default.info(`AWS S3 Service initialized - Bucket: ${this.bucketName}, Region: ${this.region}`);
    }
    async uploadFile(file, options = {}) {
        try {
            this.validateFile(file, options);
            const { folder = 'uploads', generateThumbnail = false, maxWidth, maxHeight, quality = 85, } = options;
            const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
            const key = `${folder}/${uniqueFileName}`;
            let processedBuffer = file.buffer;
            let finalMimeType = file.mimetype;
            if (file.mimetype.startsWith('image/')) {
                const sharpInstance = (0, sharp_1.default)(file.buffer);
                const metadata = await sharpInstance.metadata();
                if (maxWidth || maxHeight) {
                    sharpInstance.resize(maxWidth, maxHeight, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    });
                }
                if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
                    processedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
                }
                else if (file.mimetype === 'image/png') {
                    processedBuffer = await sharpInstance.png({ compressionLevel: 6 }).toBuffer();
                }
                else {
                    processedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
                    finalMimeType = 'image/jpeg';
                }
                logger_1.default.info(`Image processed: ${metadata.width}x${metadata.height} -> ${processedBuffer.length} bytes`);
            }
            const uploadParams = {
                Bucket: this.bucketName,
                Key: key,
                Body: processedBuffer,
                ContentType: finalMimeType,
                CacheControl: 'max-age=31536000',
                Metadata: {
                    originalName: file.originalname,
                    uploadDate: new Date().toISOString(),
                },
            };
            const upload = new lib_storage_1.Upload({
                client: this.s3Client,
                params: uploadParams,
            });
            const result = await upload.done();
            const url = await this.getSignedUrl(key);
            let thumbnailKey;
            let thumbnailUrl;
            if (generateThumbnail && file.mimetype.startsWith('image/')) {
                const thumbnailBuffer = await (0, sharp_1.default)(file.buffer)
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
                const thumbnailUpload = new lib_storage_1.Upload({
                    client: this.s3Client,
                    params: thumbnailUploadParams,
                });
                await thumbnailUpload.done();
                thumbnailUrl = await this.getSignedUrl(thumbnailKey);
                logger_1.default.info(`Thumbnail created: ${thumbnailKey}`);
            }
            const uploadResult = {
                key,
                url,
                size: processedBuffer.length,
                mimeType: finalMimeType,
                originalName: file.originalname,
                thumbnailKey,
                thumbnailUrl,
            };
            logger_1.default.info(`File uploaded successfully: ${key} (${uploadResult.size} bytes)`);
            return uploadResult;
        }
        catch (error) {
            logger_1.default.error('File upload error:', error);
            throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteFile(key) {
        try {
            const deleteParams = {
                Bucket: this.bucketName,
                Key: key,
            };
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand(deleteParams));
            logger_1.default.info(`File deleted: ${key}`);
        }
        catch (error) {
            logger_1.default.error(`File deletion error for ${key}:`, error);
            throw new Error(`File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteFiles(keys) {
        try {
            const deletePromises = keys.map(key => this.deleteFile(key));
            await Promise.all(deletePromises);
            logger_1.default.info(`${keys.length} files deleted successfully`);
        }
        catch (error) {
            logger_1.default.error('Bulk file deletion error:', error);
            throw error;
        }
    }
    async getSignedUrl(key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            return signedUrl;
        }
        catch (error) {
            logger_1.default.error(`Get signed URL error for ${key}:`, error);
            throw new Error(`Get signed URL failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFileInfo(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const response = await this.s3Client.send(command);
            return {
                size: response.ContentLength || 0,
                lastModified: response.LastModified || new Date(),
                contentType: response.ContentType || 'application/octet-stream',
            };
        }
        catch (error) {
            if (error instanceof Error && error.name === 'NotFound') {
                return null;
            }
            logger_1.default.error(`Get file info error for ${key}:`, error);
            throw error;
        }
    }
    async fileExists(key) {
        const info = await this.getFileInfo(key);
        return info !== null;
    }
    async generateUploadUrl(fileName, contentType, folder = 'uploads', expiresIn = 3600) {
        try {
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
            const key = `${folder}/${uniqueFileName}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
                CacheControl: 'max-age=31536000',
                Metadata: {
                    originalName: fileName,
                    uploadDate: new Date().toISOString(),
                },
            });
            const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            return {
                uploadUrl,
                key,
            };
        }
        catch (error) {
            logger_1.default.error('Generate upload URL error:', error);
            throw new Error(`Generate upload URL failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    validateFile(file, options) {
        const { allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ], maxSize = 10 * 1024 * 1024, } = options;
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`File type not allowed: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
        }
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            const fileSizeMB = file.size / (1024 * 1024);
            throw new Error(`File too large: ${fileSizeMB.toFixed(2)}MB. Maximum allowed: ${maxSizeMB.toFixed(2)}MB`);
        }
        if (!file.originalname || file.originalname.length > 255) {
            throw new Error('Invalid file name');
        }
    }
    getPublicUrl(key) {
        if (this.cloudFrontDomain) {
            return `https://${this.cloudFrontDomain}/${key}`;
        }
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }
    async getStorageStats() {
        logger_1.default.info('Storage stats requested - implement database tracking for better performance');
        return {
            totalFiles: 0,
            totalSize: 0,
            byType: {},
        };
    }
}
let s3ServiceInstance = null;
const getS3Service = () => {
    if (!environment_1.config.aws) {
        return null;
    }
    if (!s3ServiceInstance) {
        s3ServiceInstance = new AWSS3Service();
    }
    return s3ServiceInstance;
};
exports.getS3Service = getS3Service;
exports.default = exports.getS3Service;
//# sourceMappingURL=aws-s3.service.js.map