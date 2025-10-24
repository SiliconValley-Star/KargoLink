import { Request, Response } from 'express';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    static refresh(req: Request, res: Response): Promise<void>;
    static logout(req: Request, res: Response): Promise<void>;
    static profile(req: Request, res: Response): Promise<void>;
    static updateProfile(req: Request, res: Response): Promise<void>;
    static changePassword(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map