import { PrismaClient, File, FileType, FileStatus } from '@prisma/client';
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
declare class FileManagementService {
    private prisma;
    constructor(prisma: PrismaClient);
    createFile(data: CreateFileData, buffer?: Buffer): Promise<File>;
    updateFile(fileId: string, data: Partial<Pick<File, 'category' | 'tags' | 'metadata' | 'isPublic' | 'expiresAt'>>): Promise<File>;
    deleteFile(fileId: string, hardDelete?: boolean): Promise<void>;
    searchFiles(options?: FileSearchOptions): Promise<{
        files: File[];
        total: number;
        hasMore: boolean;
    }>;
    getFileById(fileId: string): Promise<FileWithAssociations | null>;
    getFileByKey(key: string): Promise<File | null>;
    associateFile(fileId: string, associations: Array<{
        entityType: string;
        entityId: string;
        fieldName?: string;
        purpose?: string;
        displayOrder?: number;
    }>): Promise<void>;
    removeFileAssociation(fileId: string, entityType: string, entityId: string): Promise<void>;
    getEntityFiles(entityType: string, entityId: string): Promise<File[]>;
    logFileAccess(fileId: string, action: string, userId?: string, metadata?: any): Promise<void>;
    incrementDownloadCount(fileId: string): Promise<void>;
    cleanupExpiredFiles(): Promise<number>;
    getStorageStats(): Promise<{
        totalFiles: number;
        totalSize: string;
        byType: Record<FileType, {
            count: number;
            size: string;
        }>;
        byMonth: Array<{
            month: string;
            count: number;
            size: string;
        }>;
    }>;
    private calculateHash;
    private generateFileName;
    private generateFilePath;
    private formatBytes;
}
export { FileManagementService };
//# sourceMappingURL=file-management.service.d.ts.map