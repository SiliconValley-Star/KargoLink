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
    maxSize?: number;
}
declare class AWSS3Service {
    private s3Client;
    private bucketName;
    private region;
    private cloudFrontDomain?;
    constructor();
    uploadFile(file: MulterFile, options?: UploadOptions): Promise<UploadResult>;
    deleteFile(key: string): Promise<void>;
    deleteFiles(keys: string[]): Promise<void>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    getFileInfo(key: string): Promise<{
        size: number;
        lastModified: Date;
        contentType: string;
    } | null>;
    fileExists(key: string): Promise<boolean>;
    generateUploadUrl(fileName: string, contentType: string, folder?: string, expiresIn?: number): Promise<{
        uploadUrl: string;
        key: string;
    }>;
    private validateFile;
    getPublicUrl(key: string): string;
    getStorageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        byType: Record<string, {
            count: number;
            size: number;
        }>;
    }>;
}
export declare const getS3Service: () => AWSS3Service | null;
export default getS3Service;
//# sourceMappingURL=aws-s3.service.d.ts.map