import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';
import NotificationService, { NotificationRequest } from '../services/notification/notification.service';
import EmailService from '../services/notification/email.service';
import SMSService from '../services/notification/sms.service';
import PushNotificationService from '../services/notification/push.service';
import { TokenPayload } from '../services/auth.service';

interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Notification Controller
 * Handles all notification-related API endpoints
 */
export class NotificationController {
  private notificationService: NotificationService;
  private emailService: EmailService;
  private smsService: SMSService;
  private pushService: PushNotificationService;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.notificationService = new NotificationService(prisma);
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.pushService = new PushNotificationService();
  }

  /**
   * Send notification to user
   */
  sendNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, type, title, message, data, channels, priority } = req.body;

      // Validate required fields
      if (!userId || !type || !title || !message) {
        res.status(400).json({
          success: false,
          error: 'userId, type, title, and message are required'
        });
        return;
      }

      // Check permissions
      if (req.user?.role !== 'admin' && req.user?.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      const notificationRequest: NotificationRequest = {
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
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Send notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Send bulk notifications
   */
  sendBulkNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { notifications } = req.body;

      // Check admin permissions
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

      // Validate each notification
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

    } catch (error) {
      logger.error('Send bulk notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Get user notifications
   */
  getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.user?.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      // Check permissions
      if (req.user?.role !== 'admin' && req.user?.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';
      const type = req.query.type as string;

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

    } catch (error) {
      logger.error('Get user notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Mark notification as read
   */
  markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
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
      
      // @ts-ignore - userId is guaranteed to be string after null check
      const success = await this.notificationService.markAsRead(notificationId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Notification marked as read'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to mark notification as read'
        });
      }

    } catch (error) {
      logger.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Mark all notifications as read
   */
  markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
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

    } catch (error) {
      logger.error('Mark all notifications as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Get notification statistics
   */
  getNotificationStats = async (req: AuthRequest, res: Response): Promise<void> => {
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

    } catch (error) {
      logger.error('Get notification stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Update user notification preferences
   */
  updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
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
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to update preferences'
        });
      }

    } catch (error) {
      logger.error('Update notification preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Send email directly
   */
  sendEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { to, subject, html, text, template, templateData } = req.body;

      // Check admin permissions for direct email sending
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
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Send email error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Send SMS directly
   */
  sendSMS = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { phoneNumber, message, reference } = req.body;
      const userId = req.user?.userId;

      // Check admin permissions for direct SMS sending
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
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Send SMS error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Send push notification directly
   */
  sendPushNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { token, title, body, data, icon, image, clickAction, priority } = req.body;
      const userId = req.user?.userId;

      // Check admin permissions for direct push notification sending
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
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Send push notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Get notification services status
   */
  getServicesStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Check admin permissions
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

    } catch (error) {
      logger.error('Get services status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Register device token for push notifications
   */
  registerDeviceToken = async (req: AuthRequest, res: Response): Promise<void> => {
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

      // Validate token
      const isValid = await this.pushService.validateToken(token);
      
      if (!isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid device token'
        });
        return;
      }

      // Save device token to database
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

    } catch (error) {
      logger.error('Register device token error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}

export default NotificationController;