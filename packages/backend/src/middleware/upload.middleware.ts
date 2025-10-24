import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError, HTTP_STATUS } from './errorHandler';
import logger from '../utils/logger';

// File type configurations
export const FILE_TYPES = {
  IMAGE: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  },
  DOCUMENT: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['.pdf', '.doc', '.docx']
  },
  ARCHIVE: {
    mimeTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
    maxSize: 20 * 1024 * 1024, // 20MB
    extensions: ['.zip', '.rar', '.7z']
  },
  AVATAR: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    extensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  INVOICE: {
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    extensions: ['.pdf', '.jpg', '.jpeg', '.png']
  }
};

// Upload destinations
const UPLOAD_PATHS = {
  TEMP: 'uploads/temp',
  AVATARS: 'uploads/avatars',
  DOCUMENTS: 'uploads/documents',
  INVOICES: 'uploads/invoices',
  SHIPMENT_DOCS: 'uploads/shipments',
  IDENTITY: 'uploads/identity',
  COMPANY_DOCS: 'uploads/companies'
};

// Ensure upload directories exist
Object.values(UPLOAD_PATHS).forEach(uploadPath => {
  const fullPath = path.join(process.cwd(), uploadPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

/**
 * Generate unique filename
 */
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 20);
  
  return `${baseName}_${timestamp}_${random}${ext}`;
};

/**
 * Multer storage configuration
 */
const createStorage = (destination: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), destination);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileName = generateFileName(file.originalname);
      cb(null, fileName);
    }
  });
};

/**
 * File filter function
 */
const createFileFilter = (allowedTypes: string[], allowedExtensions: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check MIME type
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      ));
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new AppError(
        `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      ));
    }

    cb(null, true);
  };
};

/**
 * Create multer upload middleware
 */
const createUploadMiddleware = (
  destination: string,
  fileType: keyof typeof FILE_TYPES,
  fieldName: string,
  maxCount: number = 1
) => {
  const config = FILE_TYPES[fileType];
  
  return multer({
    storage: createStorage(destination),
    fileFilter: createFileFilter(config.mimeTypes, config.extensions),
    limits: {
      fileSize: config.maxSize,
      files: maxCount
    }
  });
};

/**
 * Avatar upload middleware
 */
export const uploadAvatar: RequestHandler = createUploadMiddleware(
  UPLOAD_PATHS.AVATARS,
  'AVATAR',
  'avatar'
).single('avatar');

/**
 * Document upload middleware (multiple files)
 */
export const uploadDocuments: RequestHandler = createUploadMiddleware(
  UPLOAD_PATHS.DOCUMENTS,
  'DOCUMENT',
  'documents',
  5
).array('documents', 5);

/**
 * Single document upload
 */
export const uploadSingleDocument: RequestHandler = createUploadMiddleware(
  UPLOAD_PATHS.DOCUMENTS,
  'DOCUMENT',
  'document'
).single('document');

/**
 * Invoice upload middleware
 */
export const uploadInvoice: RequestHandler = createUploadMiddleware(
  UPLOAD_PATHS.INVOICES,
  'INVOICE',
  'invoice'
).single('invoice');

/**
 * Shipment documents upload
 */
export const uploadShipmentDocs: RequestHandler = createUploadMiddleware(
  UPLOAD_PATHS.SHIPMENT_DOCS,
  'DOCUMENT',
  'shipmentDocs',
  10
).array('shipmentDocs', 10);

/**
 * Identity document upload
 */
export const uploadIdentityDoc: RequestHandler = createUploadMiddleware(
  UPLOAD_PATHS.IDENTITY,
  'IMAGE',
  'identityDoc',
  2
).array('identityDoc', 2);

/**
 * Company documents upload
 */
export const uploadCompanyDocs: RequestHandler = createUploadMiddleware(
  UPLOAD_PATHS.COMPANY_DOCS,
  'DOCUMENT',
  'companyDocs',
  10
).array('companyDocs', 10);

/**
 * Generic image upload
 */
export const uploadImages: RequestHandler = createUploadMiddleware(
  UPLOAD_PATHS.TEMP,
  'IMAGE',
  'images',
  10
).array('images', 10);

/**
 * Mixed file upload (for complex forms)
 */
export const uploadMixed: RequestHandler = multer({
  storage: createStorage(UPLOAD_PATHS.TEMP),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
    files: 20
  },
  fileFilter: (req, file, cb) => {
    // Allow all common file types for mixed uploads
    const allowedTypes = [
      ...FILE_TYPES.IMAGE.mimeTypes,
      ...FILE_TYPES.DOCUMENT.mimeTypes,
      ...FILE_TYPES.ARCHIVE.mimeTypes
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError(
        `Unsupported file type: ${file.mimetype}`,
        HTTP_STATUS.BAD_REQUEST
      ));
    }

    cb(null, true);
  }
}).any();

/**
 * File validation middleware
 */
export const validateUploadedFiles = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files && !req.file) {
    return next(new AppError('No files uploaded', HTTP_STATUS.BAD_REQUEST));
  }

  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

  // Additional file validations
  for (const file of files) {
    if (!file) continue;

    // Check if file was actually uploaded
    if (!fs.existsSync(file.path)) {
      return next(new AppError('File upload failed', HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }

    // Check actual file size (sometimes differs from reported size)
    const stats = fs.statSync(file.path);
    if (stats.size === 0) {
      fs.unlinkSync(file.path); // Delete empty file
      return next(new AppError('Empty file uploaded', HTTP_STATUS.BAD_REQUEST));
    }

    // Log file upload
    logger.info('File uploaded successfully', {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      userId: (req as any).user?.id
    });
  }

  next();
};

/**
 * Clean up temporary files middleware
 */
export const cleanupTempFiles = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function(data: any): Response {
    // Clean up temp files after response is sent
    if (req.files || req.file) {
      const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
      
      files.forEach(file => {
        if (file && file.path && file.path.includes('temp')) {
          fs.unlink(file.path, (err) => {
            if (err) {
              logger.warn('Failed to delete temp file:', {
                path: file.path,
                error: err.message
              });
            }
          });
        }
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * File size formatter
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type from MIME type
 */
export const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'archive';
  return 'other';
};

/**
 * File upload error handler
 */
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let status = HTTP_STATUS.BAD_REQUEST;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size allowed is ${formatFileSize(error.field === 'avatar' ? FILE_TYPES.AVATAR.maxSize : 10 * 1024 * 1024)}`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = `Too many files uploaded`;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected field: ${error.field}`;
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts';
        break;
    }

    logger.error('Multer upload error:', {
      code: error.code,
      field: error.field,
      message: error.message,
      userId: (req as any).user?.id
    });

    return next(new AppError(message, status));
  }

  next(error);
};

/**
 * Secure file access middleware
 */
export const secureFileAccess = (req: Request, res: Response, next: NextFunction) => {
  const filePath = req.params.path;
  
  // Prevent directory traversal attacks
  if (filePath && (filePath.includes('..') || filePath.includes('/') || filePath.includes('\\'))) {
    return next(new AppError('Invalid file path', HTTP_STATUS.BAD_REQUEST));
  }

  // Add user authorization checks here based on file type/location
  // For example, users should only access their own files
  
  next();
};

const uploadMiddleware: {
  uploadAvatar: RequestHandler;
  uploadDocuments: RequestHandler;
  uploadSingleDocument: RequestHandler;
  uploadInvoice: RequestHandler;
  uploadShipmentDocs: RequestHandler;
  uploadIdentityDoc: RequestHandler;
  uploadCompanyDocs: RequestHandler;
  uploadImages: RequestHandler;
  uploadMixed: RequestHandler;
  validateUploadedFiles: (req: Request, res: Response, next: NextFunction) => void;
  cleanupTempFiles: (req: Request, res: Response, next: NextFunction) => void;
  handleUploadError: (error: any, req: Request, res: Response, next: NextFunction) => void;
  secureFileAccess: (req: Request, res: Response, next: NextFunction) => void;
  formatFileSize: (bytes: number) => string;
  getFileCategory: (mimeType: string) => string;
  FILE_TYPES: typeof FILE_TYPES;
  UPLOAD_PATHS: typeof UPLOAD_PATHS;
} = {
  uploadAvatar,
  uploadDocuments,
  uploadSingleDocument,
  uploadInvoice,
  uploadShipmentDocs,
  uploadIdentityDoc,
  uploadCompanyDocs,
  uploadImages,
  uploadMixed,
  validateUploadedFiles,
  cleanupTempFiles,
  handleUploadError,
  secureFileAccess,
  formatFileSize,
  getFileCategory,
  FILE_TYPES,
  UPLOAD_PATHS
};

export default uploadMiddleware;