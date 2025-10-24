import { Request, Response } from 'express';
export declare class UploadController {
    private static getS3ServiceOrError;
    static uploadSingle(req: Request, res: Response): Promise<void>;
    static uploadMultiple(req: Request, res: Response): Promise<void>;
    static uploadAvatar(req: Request, res: Response): Promise<void>;
    static uploadDocument(req: Request, res: Response): Promise<void>;
    static deleteFile(req: Request, res: Response): Promise<void>;
    static deleteFiles(req: Request, res: Response): Promise<void>;
    static getFileInfo(req: Request, res: Response): Promise<void>;
    static getSignedUrl(req: Request, res: Response): Promise<void>;
    static generateUploadUrl(req: Request, res: Response): Promise<void>;
}
export default UploadController;
//# sourceMappingURL=upload.controller.d.ts.map