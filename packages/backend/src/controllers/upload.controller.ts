import { Request, Response } from 'express';
import { getS3Service, UploadResult, MulterFile } from '../services/storage/aws-s3.service';
import logger from '../utils/logger';

export class UploadController {
  /**
   * S3 service'in hazır olup olmadığını kontrol et
   */
  private static getS3ServiceOrError(res: Response) {
    const s3Service = getS3Service();
    if (!s3Service) {
      res.status(503).json({
        error: 'Storage service unavailable',
        message: 'AWS S3 service is not configured',
        code: 'STORAGE_SERVICE_UNAVAILABLE',
      });
      return null;
    }
    return s3Service;
  }

  /**
   * Tek dosya yükleme
   */
  static async uploadSingle(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      if (!req.file) {
        res.status(400).json({
          error: 'No file provided',
          message: 'Please provide a file to upload',
          code: 'NO_FILE_PROVIDED',
        });
        return;
      }

      // Upload options from query parameters
      const options = {
        folder: (req.query.folder as string) || 'uploads',
        generateThumbnail: req.query.generateThumbnail === 'true',
        maxWidth: req.query.maxWidth ? parseInt(req.query.maxWidth as string) : undefined,
        maxHeight: req.query.maxHeight ? parseInt(req.query.maxHeight as string) : undefined,
        quality: req.query.quality ? parseInt(req.query.quality as string) : undefined,
      };

      const uploadResult = await s3Service.uploadFile(req.file as MulterFile, options);

      logger.info(`File uploaded successfully: ${uploadResult.key} by user ${req.user?.userId}`);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: uploadResult,
      });
    } catch (error) {
      logger.error('Single file upload error:', error);
      
      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'UPLOAD_FAILED',
      });
    }
  }

  /**
   * Çoklu dosya yükleme
   */
  static async uploadMultiple(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({
          error: 'No files provided',
          message: 'Please provide files to upload',
          code: 'NO_FILES_PROVIDED',
        });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const options = {
        folder: (req.query.folder as string) || 'uploads',
        generateThumbnail: req.query.generateThumbnail === 'true',
        maxWidth: req.query.maxWidth ? parseInt(req.query.maxWidth as string) : undefined,
        maxHeight: req.query.maxHeight ? parseInt(req.query.maxHeight as string) : undefined,
        quality: req.query.quality ? parseInt(req.query.quality as string) : undefined,
      };

      // Upload all files concurrently
      const uploadPromises = files.map(file => 
        s3Service.uploadFile(file as MulterFile, options)
      );

      const uploadResults = await Promise.all(uploadPromises);

      logger.info(`${uploadResults.length} files uploaded successfully by user ${req.user?.userId}`);

      res.status(201).json({
        success: true,
        message: `${uploadResults.length} files uploaded successfully`,
        data: uploadResults,
      });
    } catch (error) {
      logger.error('Multiple file upload error:', error);
      
      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'UPLOAD_FAILED',
      });
    }
  }

  /**
   * Avatar yükleme (özel işlem)
   */
  static async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      if (!req.file) {
        res.status(400).json({
          error: 'No file provided',
          message: 'Please provide an avatar image to upload',
          code: 'NO_FILE_PROVIDED',
        });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      // Avatar için özel ayarlar
      const options = {
        folder: `avatars/${userId}`,
        generateThumbnail: true,
        maxWidth: 400,
        maxHeight: 400,
        quality: 85,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 2 * 1024 * 1024, // 2MB
      };

      const uploadResult = await s3Service.uploadFile(req.file as MulterFile, options);

      // TODO: Update user profile with new avatar URL in database
      // await userService.updateProfile(userId, { profileImage: uploadResult.url });

      logger.info(`Avatar uploaded successfully for user ${userId}: ${uploadResult.key}`);

      res.status(201).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatarUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          key: uploadResult.key,
        },
      });
    } catch (error) {
      logger.error('Avatar upload error:', error);
      
      res.status(500).json({
        error: 'Avatar upload failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'AVATAR_UPLOAD_FAILED',
      });
    }
  }

  /**
   * Dokuman yükleme (gönderi için)
   */
  static async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      if (!req.file) {
        res.status(400).json({
          error: 'No file provided',
          message: 'Please provide a document to upload',
          code: 'NO_FILE_PROVIDED',
        });
        return;
      }

      const shipmentId = req.params.shipmentId || req.body.shipmentId;
      if (!shipmentId) {
        res.status(400).json({
          error: 'Shipment ID required',
          message: 'Please provide a shipment ID',
          code: 'SHIPMENT_ID_REQUIRED',
        });
        return;
      }

      // Dokuman için özel ayarlar
      const options = {
        folder: `documents/shipments/${shipmentId}`,
        allowedTypes: [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        maxSize: 10 * 1024 * 1024, // 10MB
      };

      const uploadResult = await s3Service.uploadFile(req.file as MulterFile, options);

      // TODO: Save document reference to shipment in database
      // await shipmentService.addDocument(shipmentId, uploadResult);

      logger.info(`Document uploaded for shipment ${shipmentId}: ${uploadResult.key} by user ${req.user?.userId}`);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          documentUrl: uploadResult.url,
          key: uploadResult.key,
          fileName: uploadResult.originalName,
          fileSize: uploadResult.size,
          fileType: uploadResult.mimeType,
        },
      });
    } catch (error) {
      logger.error('Document upload error:', error);
      
      res.status(500).json({
        error: 'Document upload failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'DOCUMENT_UPLOAD_FAILED',
      });
    }
  }

  /**
   * Dosya silme
   */
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      const { key } = req.params;
      
      if (!key) {
        res.status(400).json({
          error: 'File key required',
          message: 'Please provide a file key to delete',
          code: 'FILE_KEY_REQUIRED',
        });
        return;
      }

      // Decode URL-encoded key
      const decodedKey = decodeURIComponent(key);

      // Check if file exists
      const fileExists = await s3Service.fileExists(decodedKey);
      if (!fileExists) {
        res.status(404).json({
          error: 'File not found',
          message: 'The specified file does not exist',
          code: 'FILE_NOT_FOUND',
        });
        return;
      }

      await s3Service.deleteFile(decodedKey);

      logger.info(`File deleted: ${decodedKey} by user ${req.user?.userId}`);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      logger.error('File deletion error:', error);
      
      res.status(500).json({
        error: 'File deletion failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'DELETE_FAILED',
      });
    }
  }

  /**
   * Çoklu dosya silme
   */
  static async deleteFiles(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      const { keys } = req.body;
      
      if (!keys || !Array.isArray(keys) || keys.length === 0) {
        res.status(400).json({
          error: 'File keys required',
          message: 'Please provide an array of file keys to delete',
          code: 'FILE_KEYS_REQUIRED',
        });
        return;
      }

      // Decode all keys
      const decodedKeys = keys.map(key => decodeURIComponent(key));

      await s3Service.deleteFiles(decodedKeys);

      logger.info(`${decodedKeys.length} files deleted by user ${req.user?.userId}`);

      res.status(200).json({
        success: true,
        message: `${decodedKeys.length} files deleted successfully`,
      });
    } catch (error) {
      logger.error('Multiple file deletion error:', error);
      
      res.status(500).json({
        error: 'File deletion failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'DELETE_FAILED',
      });
    }
  }

  /**
   * Dosya bilgilerini getir
   */
  static async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      const { key } = req.params;
      
      if (!key) {
        res.status(400).json({
          error: 'File key required',
          message: 'Please provide a file key',
          code: 'FILE_KEY_REQUIRED',
        });
        return;
      }

      const decodedKey = decodeURIComponent(key);
      const fileInfo = await s3Service.getFileInfo(decodedKey);

      if (!fileInfo) {
        res.status(404).json({
          error: 'File not found',
          message: 'The specified file does not exist',
          code: 'FILE_NOT_FOUND',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          key: decodedKey,
          size: fileInfo.size,
          lastModified: fileInfo.lastModified,
          contentType: fileInfo.contentType,
          publicUrl: s3Service.getPublicUrl(decodedKey),
        },
      });
    } catch (error) {
      logger.error('Get file info error:', error);
      
      res.status(500).json({
        error: 'Failed to get file info',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'GET_FILE_INFO_FAILED',
      });
    }
  }

  /**
   * Signed URL oluştur
   */
  static async getSignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      const { key } = req.params;
      const { expiresIn } = req.query;
      
      if (!key) {
        res.status(400).json({
          error: 'File key required',
          message: 'Please provide a file key',
          code: 'FILE_KEY_REQUIRED',
        });
        return;
      }

      const decodedKey = decodeURIComponent(key);
      const expires = expiresIn ? parseInt(expiresIn as string) : 3600; // 1 hour default

      const signedUrl = await s3Service.getSignedUrl(decodedKey, expires);

      res.status(200).json({
        success: true,
        data: {
          key: decodedKey,
          signedUrl,
          expiresIn: expires,
          expiresAt: new Date(Date.now() + expires * 1000).toISOString(),
        },
      });
    } catch (error) {
      logger.error('Get signed URL error:', error);
      
      res.status(500).json({
        error: 'Failed to generate signed URL',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SIGNED_URL_FAILED',
      });
    }
  }

  /**
   * Upload için presigned URL oluştur
   */
  static async generateUploadUrl(req: Request, res: Response): Promise<void> {
    try {
      const s3Service = UploadController.getS3ServiceOrError(res);
      if (!s3Service) return;

      const { fileName, contentType } = req.body;
      const { folder, expiresIn } = req.query;
      
      if (!fileName || !contentType) {
        res.status(400).json({
          error: 'Missing parameters',
          message: 'Please provide fileName and contentType',
          code: 'MISSING_PARAMETERS',
        });
        return;
      }

      const uploadFolder = (folder as string) || 'uploads';
      const expires = expiresIn ? parseInt(expiresIn as string) : 3600;

      const result = await s3Service.generateUploadUrl(fileName, contentType, uploadFolder, expires);

      res.status(200).json({
        success: true,
        data: {
          uploadUrl: result.uploadUrl,
          key: result.key,
          expiresIn: expires,
          expiresAt: new Date(Date.now() + expires * 1000).toISOString(),
        },
      });
    } catch (error) {
      logger.error('Generate upload URL error:', error);
      
      res.status(500).json({
        error: 'Failed to generate upload URL',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'GENERATE_UPLOAD_URL_FAILED',
      });
    }
  }
}

export default UploadController;