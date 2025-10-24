"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureFileAccess = exports.handleUploadError = exports.getFileCategory = exports.formatFileSize = exports.cleanupTempFiles = exports.validateUploadedFiles = exports.uploadMixed = exports.uploadImages = exports.uploadCompanyDocs = exports.uploadIdentityDoc = exports.uploadShipmentDocs = exports.uploadInvoice = exports.uploadSingleDocument = exports.uploadDocuments = exports.uploadAvatar = exports.FILE_TYPES = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errorHandler_1 = require("./errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
exports.FILE_TYPES = {
    IMAGE: {
        mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 5 * 1024 * 1024,
        extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    },
    DOCUMENT: {
        mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSize: 10 * 1024 * 1024,
        extensions: ['.pdf', '.doc', '.docx']
    },
    ARCHIVE: {
        mimeTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
        maxSize: 20 * 1024 * 1024,
        extensions: ['.zip', '.rar', '.7z']
    },
    AVATAR: {
        mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 2 * 1024 * 1024,
        extensions: ['.jpg', '.jpeg', '.png', '.webp']
    },
    INVOICE: {
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        maxSize: 5 * 1024 * 1024,
        extensions: ['.pdf', '.jpg', '.jpeg', '.png']
    }
};
const UPLOAD_PATHS = {
    TEMP: 'uploads/temp',
    AVATARS: 'uploads/avatars',
    DOCUMENTS: 'uploads/documents',
    INVOICES: 'uploads/invoices',
    SHIPMENT_DOCS: 'uploads/shipments',
    IDENTITY: 'uploads/identity',
    COMPANY_DOCS: 'uploads/companies'
};
Object.values(UPLOAD_PATHS).forEach(uploadPath => {
    const fullPath = path_1.default.join(process.cwd(), uploadPath);
    if (!fs_1.default.existsSync(fullPath)) {
        fs_1.default.mkdirSync(fullPath, { recursive: true });
    }
});
const generateFileName = (originalName) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path_1.default.extname(originalName);
    const baseName = path_1.default.basename(originalName, ext)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 20);
    return `${baseName}_${timestamp}_${random}${ext}`;
};
const createStorage = (destination) => {
    return multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path_1.default.join(process.cwd(), destination);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const fileName = generateFileName(file.originalname);
            cb(null, fileName);
        }
    });
};
const createFileFilter = (allowedTypes, allowedExtensions) => {
    return (req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new errorHandler_1.AppError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, errorHandler_1.HTTP_STATUS.BAD_REQUEST));
        }
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            return cb(new errorHandler_1.AppError(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`, errorHandler_1.HTTP_STATUS.BAD_REQUEST));
        }
        cb(null, true);
    };
};
const createUploadMiddleware = (destination, fileType, fieldName, maxCount = 1) => {
    const config = exports.FILE_TYPES[fileType];
    return (0, multer_1.default)({
        storage: createStorage(destination),
        fileFilter: createFileFilter(config.mimeTypes, config.extensions),
        limits: {
            fileSize: config.maxSize,
            files: maxCount
        }
    });
};
exports.uploadAvatar = createUploadMiddleware(UPLOAD_PATHS.AVATARS, 'AVATAR', 'avatar').single('avatar');
exports.uploadDocuments = createUploadMiddleware(UPLOAD_PATHS.DOCUMENTS, 'DOCUMENT', 'documents', 5).array('documents', 5);
exports.uploadSingleDocument = createUploadMiddleware(UPLOAD_PATHS.DOCUMENTS, 'DOCUMENT', 'document').single('document');
exports.uploadInvoice = createUploadMiddleware(UPLOAD_PATHS.INVOICES, 'INVOICE', 'invoice').single('invoice');
exports.uploadShipmentDocs = createUploadMiddleware(UPLOAD_PATHS.SHIPMENT_DOCS, 'DOCUMENT', 'shipmentDocs', 10).array('shipmentDocs', 10);
exports.uploadIdentityDoc = createUploadMiddleware(UPLOAD_PATHS.IDENTITY, 'IMAGE', 'identityDoc', 2).array('identityDoc', 2);
exports.uploadCompanyDocs = createUploadMiddleware(UPLOAD_PATHS.COMPANY_DOCS, 'DOCUMENT', 'companyDocs', 10).array('companyDocs', 10);
exports.uploadImages = createUploadMiddleware(UPLOAD_PATHS.TEMP, 'IMAGE', 'images', 10).array('images', 10);
exports.uploadMixed = (0, multer_1.default)({
    storage: createStorage(UPLOAD_PATHS.TEMP),
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 20
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            ...exports.FILE_TYPES.IMAGE.mimeTypes,
            ...exports.FILE_TYPES.DOCUMENT.mimeTypes,
            ...exports.FILE_TYPES.ARCHIVE.mimeTypes
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new errorHandler_1.AppError(`Unsupported file type: ${file.mimetype}`, errorHandler_1.HTTP_STATUS.BAD_REQUEST));
        }
        cb(null, true);
    }
}).any();
const validateUploadedFiles = (req, res, next) => {
    if (!req.files && !req.file) {
        return next(new errorHandler_1.AppError('No files uploaded', errorHandler_1.HTTP_STATUS.BAD_REQUEST));
    }
    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
    for (const file of files) {
        if (!file)
            continue;
        if (!fs_1.default.existsSync(file.path)) {
            return next(new errorHandler_1.AppError('File upload failed', errorHandler_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
        const stats = fs_1.default.statSync(file.path);
        if (stats.size === 0) {
            fs_1.default.unlinkSync(file.path);
            return next(new errorHandler_1.AppError('Empty file uploaded', errorHandler_1.HTTP_STATUS.BAD_REQUEST));
        }
        logger_1.default.info('File uploaded successfully', {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            userId: req.user?.id
        });
    }
    next();
};
exports.validateUploadedFiles = validateUploadedFiles;
const cleanupTempFiles = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        if (req.files || req.file) {
            const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
            files.forEach(file => {
                if (file && file.path && file.path.includes('temp')) {
                    fs_1.default.unlink(file.path, (err) => {
                        if (err) {
                            logger_1.default.warn('Failed to delete temp file:', {
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
exports.cleanupTempFiles = cleanupTempFiles;
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
const getFileCategory = (mimeType) => {
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType.startsWith('video/'))
        return 'video';
    if (mimeType.startsWith('audio/'))
        return 'audio';
    if (mimeType === 'application/pdf')
        return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('word'))
        return 'document';
    if (mimeType.includes('sheet') || mimeType.includes('excel'))
        return 'spreadsheet';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed'))
        return 'archive';
    return 'other';
};
exports.getFileCategory = getFileCategory;
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        let message = 'File upload error';
        let status = errorHandler_1.HTTP_STATUS.BAD_REQUEST;
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = `File too large. Maximum size allowed is ${(0, exports.formatFileSize)(error.field === 'avatar' ? exports.FILE_TYPES.AVATAR.maxSize : 10 * 1024 * 1024)}`;
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
        logger_1.default.error('Multer upload error:', {
            code: error.code,
            field: error.field,
            message: error.message,
            userId: req.user?.id
        });
        return next(new errorHandler_1.AppError(message, status));
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
const secureFileAccess = (req, res, next) => {
    const filePath = req.params.path;
    if (filePath && (filePath.includes('..') || filePath.includes('/') || filePath.includes('\\'))) {
        return next(new errorHandler_1.AppError('Invalid file path', errorHandler_1.HTTP_STATUS.BAD_REQUEST));
    }
    next();
};
exports.secureFileAccess = secureFileAccess;
const uploadMiddleware = {
    uploadAvatar: exports.uploadAvatar,
    uploadDocuments: exports.uploadDocuments,
    uploadSingleDocument: exports.uploadSingleDocument,
    uploadInvoice: exports.uploadInvoice,
    uploadShipmentDocs: exports.uploadShipmentDocs,
    uploadIdentityDoc: exports.uploadIdentityDoc,
    uploadCompanyDocs: exports.uploadCompanyDocs,
    uploadImages: exports.uploadImages,
    uploadMixed: exports.uploadMixed,
    validateUploadedFiles: exports.validateUploadedFiles,
    cleanupTempFiles: exports.cleanupTempFiles,
    handleUploadError: exports.handleUploadError,
    secureFileAccess: exports.secureFileAccess,
    formatFileSize: exports.formatFileSize,
    getFileCategory: exports.getFileCategory,
    FILE_TYPES: exports.FILE_TYPES,
    UPLOAD_PATHS
};
exports.default = uploadMiddleware;
//# sourceMappingURL=upload.middleware.js.map