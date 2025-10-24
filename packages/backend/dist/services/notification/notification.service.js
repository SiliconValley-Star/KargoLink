"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const logger_1 = __importDefault(require("../../utils/logger"));
class NotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendNotification(request) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: request.userId },
                include: {
                    devices: true
                }
            });
            if (!user) {
                throw new Error('User not found');
            }
            const preferences = this.getUserPreferences(user.notificationSettings);
            if (!this.isNotificationAllowed(request.type, preferences)) {
                logger_1.default.info(`Notification blocked by user preferences`, {
                    userId: request.userId,
                    type: request.type
                });
                return { success: true };
            }
            const notification = await this.prisma.notification.create({
                data: {
                    userId: request.userId,
                    type: this.mapNotificationType(request.type),
                    title: request.title,
                    message: request.message,
                    data: request.data || {},
                    channels: this.getChannelsToUse(request.channels, preferences),
                    read: false
                }
            });
            const results = await this.sendToChannels(notification, request, user, preferences);
            await this.prisma.notification.update({
                where: { id: notification.id },
                data: {
                    deliveryStatus: results,
                    sentAt: new Date()
                }
            });
            logger_1.default.info(`Notification sent successfully`, {
                notificationId: notification.id,
                userId: request.userId,
                type: request.type,
                results
            });
            return {
                success: true,
                notificationId: notification.id
            };
        }
        catch (error) {
            logger_1.default.error('Notification service error:', {
                userId: request.userId,
                type: request.type,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send notification'
            };
        }
    }
    async sendBulkNotifications(requests) {
        const results = [];
        logger_1.default.info(`Sending bulk notifications: ${requests.length} messages`);
        for (const request of requests) {
            try {
                const result = await this.sendNotification(request);
                results.push(result);
            }
            catch (error) {
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        logger_1.default.info(`Bulk notifications completed: ${successCount}/${requests.length} sent successfully`);
        return {
            success: successCount > 0,
            results,
            successCount
        };
    }
    async getUserNotifications(userId, options = {}) {
        const page = options.page || 1;
        const limit = Math.min(options.limit || 20, 100);
        const skip = (page - 1) * limit;
        const where = { userId };
        if (options.unreadOnly) {
            where.read = false;
        }
        if (options.type) {
            where.type = this.mapNotificationType(options.type);
        }
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.notification.count({ where })
        ]);
        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async markAsRead(notificationId, userId) {
        try {
            await this.prisma.notification.update({
                where: {
                    id: notificationId,
                    userId
                },
                data: {
                    read: true,
                    readAt: new Date()
                }
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to mark notification as read:', {
                notificationId,
                userId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }
    async markAllAsRead(userId) {
        try {
            const result = await this.prisma.notification.updateMany({
                where: {
                    userId,
                    read: false
                },
                data: {
                    read: true,
                    readAt: new Date()
                }
            });
            return result.count;
        }
        catch (error) {
            logger_1.default.error('Failed to mark all notifications as read:', {
                userId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return 0;
        }
    }
    async getNotificationStats(userId) {
        const stats = await this.prisma.notification.groupBy({
            by: ['type', 'read'],
            where: { userId },
            _count: true
        });
        const result = {
            total: 0,
            unread: 0,
            byType: {}
        };
        stats.forEach(stat => {
            result.total += stat._count;
            if (!stat.read) {
                result.unread += stat._count;
            }
            const type = stat.type;
            if (!result.byType[type]) {
                result.byType[type] = { total: 0, unread: 0 };
            }
            result.byType[type].total += stat._count;
            if (!stat.read) {
                result.byType[type].unread += stat._count;
            }
        });
        return result;
    }
    async updateUserPreferences(userId, preferences) {
        try {
            const currentSettings = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { notificationSettings: true }
            });
            const currentPrefs = this.getUserPreferences(currentSettings?.notificationSettings);
            const newPrefs = { ...currentPrefs, ...preferences };
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    notificationSettings: newPrefs
                }
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to update notification preferences:', {
                userId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }
    getUserPreferences(settings) {
        return {
            pushNotifications: settings?.pushNotifications ?? true,
            smsNotifications: settings?.smsNotifications ?? false,
            emailNotifications: settings?.emailNotifications ?? true,
            inAppNotifications: settings?.inAppNotifications ?? true,
            quietHoursStart: settings?.quietHoursStart,
            quietHoursEnd: settings?.quietHoursEnd
        };
    }
    isNotificationAllowed(type, preferences) {
        switch (type) {
            case 'system':
            case 'urgent':
                return true;
            case 'promotion':
                return preferences.emailNotifications;
            default:
                return preferences.inAppNotifications;
        }
    }
    mapNotificationType(type) {
        const typeMapping = {
            'order_update': 'INFO',
            'payment': 'SUCCESS',
            'delivery': 'INFO',
            'system': 'SYSTEM',
            'promotion': 'PROMOTION',
            'urgent': 'WARNING',
            'error': 'ERROR'
        };
        return typeMapping[type] || 'INFO';
    }
    getChannelsToUse(requestedChannels, preferences) {
        const channels = [];
        if (preferences.inAppNotifications) {
            channels.push('IN_APP');
        }
        if (requestedChannels?.push && preferences.pushNotifications) {
            channels.push('PUSH');
        }
        if (requestedChannels?.email && preferences.emailNotifications) {
            channels.push('EMAIL');
        }
        if (requestedChannels?.sms && preferences.smsNotifications) {
            channels.push('SMS');
        }
        return channels;
    }
    async sendToChannels(notification, request, user, preferences) {
        const results = {};
        if (preferences.pushNotifications && user.devices?.length > 0) {
            logger_1.default.info(`Would send push notification to ${user.devices.length} devices`, {
                userId: user.id,
                title: request.title
            });
            results.push = { success: true, devices: user.devices.length };
        }
        if (preferences.emailNotifications) {
            logger_1.default.info(`Would send email notification`, {
                userId: user.id,
                email: user.email,
                subject: request.title
            });
            results.email = { success: true };
        }
        if (preferences.smsNotifications && user.phone) {
            logger_1.default.info(`Would send SMS notification`, {
                userId: user.id,
                phone: user.phone.slice(-4)
            });
            results.sms = { success: true };
        }
        return results;
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
//# sourceMappingURL=notification.service.js.map