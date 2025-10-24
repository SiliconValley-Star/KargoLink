import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TokenPayload } from '../services/auth.service';
interface AuthRequest extends Request {
    user?: TokenPayload;
}
export declare class NotificationController {
    private notificationService;
    private emailService;
    private smsService;
    private pushService;
    private prisma;
    constructor(prisma: PrismaClient);
    sendNotification: (req: AuthRequest, res: Response) => Promise<void>;
    sendBulkNotifications: (req: AuthRequest, res: Response) => Promise<void>;
    getUserNotifications: (req: AuthRequest, res: Response) => Promise<void>;
    markAsRead: (req: AuthRequest, res: Response) => Promise<void>;
    markAllAsRead: (req: AuthRequest, res: Response) => Promise<void>;
    getNotificationStats: (req: AuthRequest, res: Response) => Promise<void>;
    updatePreferences: (req: AuthRequest, res: Response) => Promise<void>;
    sendEmail: (req: AuthRequest, res: Response) => Promise<void>;
    sendSMS: (req: AuthRequest, res: Response) => Promise<void>;
    sendPushNotification: (req: AuthRequest, res: Response) => Promise<void>;
    getServicesStatus: (req: AuthRequest, res: Response) => Promise<void>;
    registerDeviceToken: (req: AuthRequest, res: Response) => Promise<void>;
}
export default NotificationController;
//# sourceMappingURL=notification.controller.d.ts.map