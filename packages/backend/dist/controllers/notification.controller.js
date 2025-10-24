"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const notification_service_1 = __importDefault(require("../services/notification/notification.service"));
const email_service_1 = __importDefault(require("../services/notification/email.service"));
const sms_service_1 = __importDefault(require("../services/notification/sms.service"));
const push_service_1 = __importDefault(require("../services/notification/push.service"));
class NotificationController {
    notificationService;
    emailService;
    smsService;
    pushService;
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
        this.notificationService = new notification_service_1.default(prisma);
        this.emailService = new email_service_1.default();
        this.smsService = new sms_service_1.default();
        this.pushService = new push_service_1.default();
    }
    sendNotification = async (req, res) => {
        try {
            const { userId, type, title, message, data, channels, priority } = req.body;
            if (!userId || !type || !title || !message) {
                res.status(400).json({
                    success: false,
                    error: 'userId, type, title, and message are required'
                });
                return;
            }
            if (req.user?.role !== 'admin' && req.user?.userId !== userId) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
                return;
            }
            const notificationRequest = {
                userId,
                type,
                title,
                message,
                data,
                channels,
                priority
            };
            const result = await this.notificationService.sendNotification(notificationRequest);
            if (result.success) {
                res.json({
                    success: true,
                    notificationId: result.notificationId,
                    message: 'Notification sent successfully'
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.default.error('Send notification error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    sendBulkNotifications = async (req, res) => {
        try {
            const { notifications } = req.body;
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Admin permissions required'
                });
                return;
            }
            if (!Array.isArray(notifications) || notifications.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'notifications array is required'
                });
                return;
            }
            for (const notification of notifications) {
                if (!notification.userId || !notification.type || !notification.title || !notification.message) {
                    res.status(400).json({
                        success: false,
                        error: 'Each notification must have userId, type, title, and message'
                    });
                    return;
                }
            }
            const result = await this.notificationService.sendBulkNotifications(notifications);
            res.json({
                success: true,
                results: result.results,
                successCount: result.successCount,
                totalCount: notifications.length,
                message: `${result.successCount}/${notifications.length} notifications sent successfully`
            });
        }
        catch (error) {
            logger_1.default.error('Send bulk notifications error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    getUserNotifications = async (req, res) => {
        try {
            const userId = req.params.userId || req.user?.userId;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
                return;
            }
            if (req.user?.role !== 'admin' && req.user?.userId !== userId) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const unreadOnly = req.query.unreadOnly === 'true';
            const type = req.query.type;
            const result = await this.notificationService.getUserNotifications(userId, {
                page,
                limit,
                unreadOnly,
                type
            });
            res.json({
                success: true,
                data: result.notifications,
                pagination: result.pagination
            });
        }
        catch (error) {
            logger_1.default.error('Get user notifications error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    markAsRead = async (req, res) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const success = await this.notificationService.markAsRead(notificationId, userId);
            if (success) {
                res.json({
                    success: true,
                    message: 'Notification marked as read'
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: 'Failed to mark notification as read'
                });
            }
        }
        catch (error) {
            logger_1.default.error('Mark notification as read error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    markAllAsRead = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const count = await this.notificationService.markAllAsRead(userId);
            res.json({
                success: true,
                message: `${count} notifications marked as read`
            });
        }
        catch (error) {
            logger_1.default.error('Mark all notifications as read error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    getNotificationStats = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const stats = await this.notificationService.getNotificationStats(userId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            logger_1.default.error('Get notification stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    updatePreferences = async (req, res) => {
        try {
            const userId = req.user?.userId;
            const preferences = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const success = await this.notificationService.updateUserPreferences(userId, preferences);
            if (success) {
                res.json({
                    success: true,
                    message: 'Notification preferences updated'
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: 'Failed to update preferences'
                });
            }
        }
        catch (error) {
            logger_1.default.error('Update notification preferences error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    sendEmail = async (req, res) => {
        try {
            const { to, subject, html, text, template, templateData } = req.body;
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Admin permissions required'
                });
                return;
            }
            if (!to || !subject || (!html && !text && !template)) {
                res.status(400).json({
                    success: false,
                    error: 'to, subject, and content (html/text/template) are required'
                });
                return;
            }
            const result = await this.emailService.sendEmail({
                to,
                subject,
                html,
                text,
                template,
                templateData
            });
            if (result.success) {
                res.json({
                    success: true,
                    messageId: result.messageId,
                    provider: result.provider,
                    message: 'Email sent successfully'
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.default.error('Send email error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    sendSMS = async (req, res) => {
        try {
            const { phoneNumber, message, reference } = req.body;
            const userId = req.user?.userId;
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Admin permissions required'
                });
                return;
            }
            if (!phoneNumber || !message) {
                res.status(400).json({
                    success: false,
                    error: 'phoneNumber and message are required'
                });
                return;
            }
            const result = await this.smsService.sendSMS({
                phoneNumber,
                message,
                userId,
                reference
            });
            if (result.success) {
                res.json({
                    success: true,
                    messageId: result.messageId,
                    provider: result.provider,
                    cost: result.cost,
                    message: 'SMS sent successfully'
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.default.error('Send SMS error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    sendPushNotification = async (req, res) => {
        try {
            const { token, title, body, data, icon, image, clickAction, priority } = req.body;
            const userId = req.user?.userId;
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Admin permissions required'
                });
                return;
            }
            if (!token || !title || !body) {
                res.status(400).json({
                    success: false,
                    error: 'token, title, and body are required'
                });
                return;
            }
            const result = Array.isArray(token)
                ? await this.pushService.sendToMultipleTokens({
                    token,
                    title,
                    body,
                    data,
                    userId,
                    icon,
                    image,
                    clickAction,
                    priority
                })
                : await this.pushService.sendToToken({
                    token,
                    title,
                    body,
                    data,
                    userId,
                    icon,
                    image,
                    clickAction,
                    priority
                });
            if (result.success) {
                res.json({
                    success: true,
                    messageId: result.messageId,
                    successCount: result.successCount,
                    failureCount: result.failureCount,
                    failedTokens: result.failedTokens,
                    message: 'Push notification sent successfully'
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.default.error('Send push notification error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    getServicesStatus = async (req, res) => {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'Admin permissions required'
                });
                return;
            }
            const emailStatus = this.emailService.getStatus();
            const smsStatus = this.smsService.getStatus();
            const pushStatus = this.pushService.getStatus();
            res.json({
                success: true,
                data: {
                    email: emailStatus,
                    sms: smsStatus,
                    push: pushStatus
                }
            });
        }
        catch (error) {
            logger_1.default.error('Get services status error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
    registerDeviceToken = async (req, res) => {
        try {
            const { token, platform, deviceId } = req.body;
            const userId = req.user?.userId;
            if (!userId || !token) {
                res.status(400).json({
                    success: false,
                    error: 'token is required'
                });
                return;
            }
            const isValid = await this.pushService.validateToken(token);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid device token'
                });
                return;
            }
            await this.prisma.device.upsert({
                where: {
                    userId_deviceId: {
                        userId,
                        deviceId: deviceId || token
                    }
                },
                update: {
                    pushToken: token,
                    platform: platform || 'WEB',
                    lastUsedAt: new Date(),
                    isActive: true,
                    version: '1.0.0'
                },
                create: {
                    userId,
                    deviceId: deviceId || token,
                    pushToken: token,
                    platform: platform || 'WEB',
                    version: '1.0.0',
                    lastUsedAt: new Date(),
                    isActive: true
                }
            });
            res.json({
                success: true,
                message: 'Device token registered successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Register device token error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
}
exports.NotificationController = NotificationController;
exports.default = NotificationController;
//# sourceMappingURL=notification.controller.js.map