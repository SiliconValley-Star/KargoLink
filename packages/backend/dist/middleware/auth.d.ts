import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@cargolink/shared';
export interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        id: string;
        email: string;
        role: UserRole;
        isVerified: boolean;
    };
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuthMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (...allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireVerification: (req: Request, res: Response, next: NextFunction) => void;
export declare const apiKeyAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireOwnership: (resourceIdField?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const userRateLimit: (maxRequests: number, windowMs: number) => (req: Request, res: Response, next: NextFunction) => void;
export default authMiddleware;
//# sourceMappingURL=auth.d.ts.map