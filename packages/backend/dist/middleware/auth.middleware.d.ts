import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../services/auth.service';
import { UserRole } from '@cargolink/shared';
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
            sessionId?: string;
        }
    }
}
export interface AuthenticatedRequest extends Request {
    user: TokenPayload;
    sessionId?: string;
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (allowedRoles: UserRole[] | UserRole) => (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireVerification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireOwnership: (userIdParam?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireActiveUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createAuthChain: (...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authRequired: (req: Request, res: Response, next: NextFunction) => void;
export declare const adminRequired: (req: Request, res: Response, next: NextFunction) => void;
export declare const moderatorRequired: (req: Request, res: Response, next: NextFunction) => void;
export declare const carrierRequired: (req: Request, res: Response, next: NextFunction) => void;
export declare const customerRequired: (req: Request, res: Response, next: NextFunction) => void;
export declare const verifiedRequired: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map