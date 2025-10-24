import admin from 'firebase-admin';
import logger from '../../utils/logger';
import { config } from '../../config/environment';

export interface PushNotificationRequest {
  token: string | string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  userId?: string;
  icon?: string;
  image?: string;
  clickAction?: string;
  badge?: number;
  sound?: string;
  priority?: 'normal' | 'high';
}

export interface PushNotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  successCount?: number;
  failureCount?: number;
  failedTokens?: string[];
}

/**
 * Firebase Cloud Messaging Push Notification Service
 */
export class PushNotificationService {
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      if (admin.apps.length === 0) {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        
        if (!serviceAccount) {
          logger.warn('Firebase service account key not found. Push notifications will be disabled.');
          return;
        }

        const credentials = JSON.parse(serviceAccount);
        
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
          projectId: credentials.project_id
        });

        this.isInitialized = true;
        logger.info('Firebase Admin SDK initialized successfully');
      } else {
        this.isInitialized = true;
        logger.info('Firebase Admin SDK already initialized');
      }
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if push notification service is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Send push notification to single token
   */
  async sendToToken(request: PushNotificationRequest): Promise<PushNotificationResponse> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Push notification service not initialized'
      };
    }

    if (Array.isArray(request.token)) {
      throw new Error('Use sendToMultipleTokens for multiple tokens');
    }

    const startTime = Date.now();

    try {
      const messagePayload = this.buildMessage(request);
      const message: admin.messaging.TokenMessage = {
        ...messagePayload,
        token: request.token
      };

      const response = await admin.messaging().send(message);
      
      const duration = Date.now() - startTime;

      logger.info('Push notification sent successfully', {
        messageId: response,
        duration,
        userId: request.userId,
        title: request.title
      });

      return {
        success: true,
        messageId: response
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Push notification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        userId: request.userId,
        title: request.title
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push notification failed'
      };
    }
  }

  /**
   * Send push notification to multiple tokens
   */
  async sendToMultipleTokens(request: PushNotificationRequest): Promise<PushNotificationResponse> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Push notification service not initialized'
      };
    }

    if (!Array.isArray(request.token)) {
      throw new Error('Token must be an array for multiple tokens');
    }

    const startTime = Date.now();

    try {
      const messagePayload = this.buildMessage(request);
      const message: admin.messaging.MulticastMessage = {
        ...messagePayload,
        tokens: request.token
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      const duration = Date.now() - startTime;
      const failedTokens: string[] = [];

      // Collect failed tokens
      response.responses.forEach((resp: admin.messaging.SendResponse, idx: number) => {
        if (!resp.success && Array.isArray(request.token) && request.token[idx]) {
          failedTokens.push(request.token[idx]);
        }
      });

      logger.info('Bulk push notification completed', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        duration,
        userId: request.userId,
        title: request.title
      });

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Bulk push notification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        userId: request.userId,
        title: request.title
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk push notification failed'
      };
    }
  }

  /**
   * Send to topic (for broadcast messages)
   */
  async sendToTopic(topic: string, request: Omit<PushNotificationRequest, 'token'>): Promise<PushNotificationResponse> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Push notification service not initialized'
      };
    }

    const startTime = Date.now();

    try {
      const messagePayload = this.buildMessage(request as PushNotificationRequest);
      const message: admin.messaging.TopicMessage = {
        ...messagePayload,
        topic
      };

      const response = await admin.messaging().send(message);
      
      const duration = Date.now() - startTime;

      logger.info('Topic push notification sent successfully', {
        topic,
        messageId: response,
        duration,
        title: request.title
      });

      return {
        success: true,
        messageId: response
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Topic push notification failed:', {
        topic,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        title: request.title
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Topic push notification failed'
      };
    }
  }

  /**
   * Subscribe token to topic
   */
  async subscribeToTopic(tokens: string | string[], topic: string): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      await admin.messaging().subscribeToTopic(tokenArray, topic);
      
      logger.info(`Subscribed ${tokenArray.length} tokens to topic: ${topic}`);
      return true;
    } catch (error) {
      logger.error('Failed to subscribe to topic:', error);
      return false;
    }
  }

  /**
   * Unsubscribe token from topic
   */
  async unsubscribeFromTopic(tokens: string | string[], topic: string): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      await admin.messaging().unsubscribeFromTopic(tokenArray, topic);
      
      logger.info(`Unsubscribed ${tokenArray.length} tokens from topic: ${topic}`);
      return true;
    } catch (error) {
      logger.error('Failed to unsubscribe from topic:', error);
      return false;
    }
  }

  /**
   * Validate FCM token
   */
  async validateToken(token: string): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const message: admin.messaging.TokenMessage = {
        token,
        data: { test: 'validation' }
      };
      await admin.messaging().send(message, true); // Dry run mode
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Build FCM message from request
   */
  private buildMessage(request: PushNotificationRequest): Omit<admin.messaging.TokenMessage, 'token'> {
    const message: Omit<admin.messaging.TokenMessage, 'token'> = {
      notification: {
        title: request.title,
        body: request.body,
        imageUrl: request.image
      },
      data: request.data || {},
      android: {
        notification: {
          icon: request.icon || 'ic_notification',
          color: '#2563EB', // CargoLink brand color
          sound: request.sound || 'default',
          priority: request.priority === 'high' ? 'high' : 'default',
          clickAction: request.clickAction
        }
      },
      apns: {
        payload: {
          aps: {
            badge: request.badge,
            sound: request.sound || 'default',
            'mutable-content': 1
          }
        },
        fcmOptions: {
          imageUrl: request.image
        }
      },
      webpush: {
        notification: {
          icon: request.icon || '/icons/notification-icon.png',
          image: request.image,
          badge: '/icons/badge.png',
          requireInteraction: request.priority === 'high',
          actions: request.clickAction ? [
            {
              action: 'open',
              title: 'Aç'
            }
          ] : undefined
        },
        fcmOptions: {
          link: request.clickAction
        }
      }
    };

    return message;
  }

  /**
   * Get service status
   */
  getStatus(): {
    available: boolean;
    initialized: boolean;
    projectId?: string;
  } {
    try {
      const app = admin.app();
      return {
        available: this.isInitialized,
        initialized: this.isInitialized,
        projectId: app.options.projectId
      };
    } catch {
      return {
        available: false,
        initialized: false
      };
    }
  }
}

/**
 * Push Notification Templates
 */
export class PushNotificationTemplates {
  static shipmentUpdate(trackingNumber: string, status: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'> {
    return {
      title: 'Kargo Durumu Güncellendi',
      body: `${trackingNumber} numaralı kargonuz ${status} durumuna geçti`,
      data: {
        type: 'shipment_update',
        trackingNumber,
        status
      }
    };
  }

  static paymentConfirmation(amount: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'> {
    return {
      title: 'Ödeme Onaylandı',
      body: `${amount} tutarındaki ödemeniz başarıyla alındı`,
      data: {
        type: 'payment_confirmation',
        amount
      }
    };
  }

  static newMessage(senderName: string, message: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'> {
    return {
      title: `${senderName} size mesaj gönderdi`,
      body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: {
        type: 'new_message',
        sender: senderName
      }
    };
  }

  static promotionalOffer(title: string, description: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'> {
    return {
      title,
      body: description,
      data: {
        type: 'promotion',
        category: 'offer'
      }
    };
  }

  static systemMaintenance(maintenanceTime: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'> {
    return {
      title: 'Sistem Bakımı',
      body: `Sistem bakımı ${maintenanceTime} tarihinde gerçekleştirilecektir`,
      data: {
        type: 'system_maintenance',
        maintenanceTime
      }
    };
  }
}

export default PushNotificationService;