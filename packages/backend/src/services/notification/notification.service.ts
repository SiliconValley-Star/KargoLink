import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

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

/**
 * Simple Notification Service
 * This is a simplified version that works with the current Prisma schema
 */
export class NotificationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Send notification to user
   */
  async sendNotification(request: NotificationRequest): Promise<{
    success: boolean;
    notificationId?: string;
    error?: string;
  }> {
    try {
      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: request.userId },
        include: {
          devices: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get user preferences from notificationSettings JSON field
      const preferences = this.getUserPreferences(user.notificationSettings as any);

      // Check if notification is allowed
      if (!this.isNotificationAllowed(request.type, preferences)) {
        logger.info(`Notification blocked by user preferences`, {
          userId: request.userId,
          type: request.type
        });
        return { success: true }; // Not an error, user chose not to receive
      }

      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId: request.userId,
          type: this.mapNotificationType(request.type),
          title: request.title,
          message: request.message,
          data: JSON.stringify(request.data || {}),
          channels: JSON.stringify(this.getChannelsToUse(request.channels, preferences)),
          read: false
        }
      });

      // Send to different channels
      const results = await this.sendToChannels(notification, request, user, preferences);

      // Update notification with delivery status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          deliveryStatus: JSON.stringify(results),
          sentAt: new Date()
        }
      });

      logger.info(`Notification sent successfully`, {
        notificationId: notification.id,
        userId: request.userId,
        type: request.type,
        results
      });

      return {
        success: true,
        notificationId: notification.id
      };

    } catch (error) {
      logger.error('Notification service error:', {
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

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(requests: NotificationRequest[]): Promise<{
    success: boolean;
    results: Array<{ success: boolean; notificationId?: string; error?: string }>;
    successCount: number;
  }> {
    const results: Array<{ success: boolean; notificationId?: string; error?: string }> = [];

    logger.info(`Sending bulk notifications: ${requests.length} messages`);

    for (const request of requests) {
      try {
        const result = await this.sendNotification(request);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    logger.info(`Bulk notifications completed: ${successCount}/${requests.length} sent successfully`);

    return {
      success: successCount > 0,
      results,
      successCount
    };
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: string;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { userId };
    
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

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.notification.update({
        where: {
          id: notificationId,
          userId // Ensure user can only mark their own notifications
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return true;
    } catch (error) {
      logger.error('Failed to mark notification as read:', {
        notificationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
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
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: string) {
    const stats = await this.prisma.notification.groupBy({
      by: ['type', 'read'],
      where: { userId },
      _count: true
    });

    const result = {
      total: 0,
      unread: 0,
      byType: {} as Record<string, { total: number; unread: number }>
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

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const currentSettings = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { notificationSettings: true }
      });

      const currentPrefs = this.getUserPreferences(currentSettings?.notificationSettings as any);
      const newPrefs = { ...currentPrefs, ...preferences };

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          notificationSettings: JSON.stringify(newPrefs)
        }
      });

      return true;
    } catch (error) {
      logger.error('Failed to update notification preferences:', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private getUserPreferences(settings: any): NotificationPreferences {
    let parsedSettings: any = {};
    
    if (typeof settings === 'string') {
      try {
        parsedSettings = JSON.parse(settings);
      } catch (e) {
        parsedSettings = {};
      }
    } else if (settings) {
      parsedSettings = settings;
    }
    
    return {
      pushNotifications: parsedSettings?.pushNotifications ?? true,
      smsNotifications: parsedSettings?.smsNotifications ?? false,
      emailNotifications: parsedSettings?.emailNotifications ?? true,
      inAppNotifications: parsedSettings?.inAppNotifications ?? true,
      quietHoursStart: parsedSettings?.quietHoursStart,
      quietHoursEnd: parsedSettings?.quietHoursEnd
    };
  }

  private isNotificationAllowed(type: string, preferences: NotificationPreferences): boolean {
    // Basic permission check - can be extended based on type
    switch (type) {
      case 'system':
      case 'urgent':
        return true; // Always allow system and urgent notifications
      case 'promotion':
        return preferences.emailNotifications; // Promotional only if email is enabled
      default:
        return preferences.inAppNotifications; // Default to in-app preference
    }
  }

  private mapNotificationType(type: string): any {
    // Map custom types to Prisma enum values
    const typeMapping: Record<string, string> = {
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

  private getChannelsToUse(requestedChannels: any, preferences: NotificationPreferences): any[] {
    const channels: any[] = [];

    // Always include in-app if enabled
    if (preferences.inAppNotifications) {
      channels.push('IN_APP');
    }

    // Add other channels based on preferences and request
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

  private async sendToChannels(notification: any, request: NotificationRequest, user: any, preferences: NotificationPreferences) {
    const results: any = {};

    // For now, just log what would be sent
    // In the future, integrate with actual push/email/SMS services
    
    if (preferences.pushNotifications && user.devices?.length > 0) {
      logger.info(`Would send push notification to ${user.devices.length} devices`, {
        userId: user.id,
        title: request.title
      });
      results.push = { success: true, devices: user.devices.length };
    }

    if (preferences.emailNotifications) {
      logger.info(`Would send email notification`, {
        userId: user.id,
        email: user.email,
        subject: request.title
      });
      results.email = { success: true };
    }

    if (preferences.smsNotifications && user.phone) {
      logger.info(`Would send SMS notification`, {
        userId: user.id,
        phone: user.phone.slice(-4)
      });
      results.sms = { success: true };
    }

    return results;
  }
}

export default NotificationService;