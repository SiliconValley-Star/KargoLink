import { Request, Response, NextFunction, RequestHandler } from 'express';
export declare const FILE_TYPES: {
    IMAGE: {
        mimeTypes: string[];
        maxSize: number;
        extensions: string[];
    };
    DOCUMENT: {
        mimeTypes: string[];
        maxSize: number;
        extensions: string[];
    };
    ARCHIVE: {
        mimeTypes: string[];
        maxSize: number;
        extensions: string[];
    };
    AVATAR: {
        mimeTypes: string[];
        maxSize: number;
        extensions: string[];
    };
    INVOICE: {
        mimeTypes: string[];
        maxSize: number;
        extensions: string[];
    };
};
declare const UPLOAD_PATHS: {
    TEMP: string;
    AVATARS: string;
    DOCUMENTS: string;
    INVOICES: string;
    SHIPMENT_DOCS: string;
    IDENTITY: string;
    COMPANY_DOCS: string;
};
export declare const uploadAvatar: RequestHandler;
export declare const uploadDocuments: RequestHandler;
export declare const uploadSingleDocument: RequestHandler;
export declare const uploadInvoice: RequestHandler;
export declare const uploadShipmentDocs: RequestHandler;
export declare const uploadIdentityDoc: RequestHandler;
export declare const uploadCompanyDocs: RequestHandler;
export declare const uploadImages: RequestHandler;
export declare const uploadMixed: RequestHandler;
export declare const validateUploadedFiles: (req: Request, res: Response, next: NextFunction) => void;
export declare const cleanupTempFiles: (req: Request, res: Response, next: NextFunction) => void;
export declare const formatFileSize: (bytes: number) => string;
export declare const getFileCategory: (mimeType: string) => string;
export declare const handleUploadError: (error: any, req: Request, res: Response, next: NextFunction) => void;
export declare const secureFileAccess: (req: Request, res: Response, next: NextFunction) => void;
declare const uploadMiddleware: {
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
};
export default uploadMiddleware;
//# sourceMappingURL=upload.middleware.d.ts.map