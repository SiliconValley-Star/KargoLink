import { PrismaClient } from '@prisma/client';
export interface NotificationRequest {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    channels?: {
        push?: boolean;
        sms?: boolean;
        email?: boolean;
        inApp?: boolean;
    };
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}
export interface NotificationPreferences {
    pushNotifications: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    inAppNotifications: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
}
export declare class NotificationService {
    private prisma;
    constructor(prisma: PrismaClient);
    sendNotification(request: NotificationRequest): Promise<{
        success: boolean;
        notificationId?: string;
        error?: string;
    }>;
    sendBulkNotifications(requests: NotificationRequest[]): Promise<{
        success: boolean;
        results: Array<{
            success: boolean;
            notificationId?: string;
            error?: string;
        }>;
        successCount: number;
    }>;
    getUserNotifications(userId: string, options?: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
        type?: string;
    }): Promise<{
        notifications: {
            type: import(".prisma/client").$Enums.NotificationType;
            message: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
            title: string;
            channels: import(".prisma/client").$Enums.NotificationChannel[];
            read: boolean;
            readAt: Date | null;
            clicked: boolean;
            clickedAt: Date | null;
            sentAt: Date | null;
            deliveryStatus: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    markAsRead(notificationId: string, userId: string): Promise<boolean>;
    markAllAsRead(userId: string): Promise<number>;
    getNotificationStats(userId: string): Promise<{
        total: number;
        unread: number;
        byType: Record<string, {
            total: number;
            unread: number;
        }>;
    }>;
    updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<boolean>;
    private getUserPreferences;
    private isNotificationAllowed;
    private mapNotificationType;
    private getChannelsToUse;
    private sendToChannels;
}
export default NotificationService;
//# sourceMappingURL=notification.service.d.ts.map