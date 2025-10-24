import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging, Message, BatchResponse } from 'firebase-admin/messaging';
import { config } from '../../config/environment';
import logger from '../../utils/logger';

interface PushNotificationRequest {
  userDevices: Array<{ deviceToken: string; platform: 'ios' | 'android' }>;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  action?: {
    type: 'open_screen' | 'open_url';
    payload: string;
  };
}

interface PushNotificationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  error?: string;
  invalidTokens?: string[];
}

export class FirebaseService {
  private messaging: any;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      // Check if Firebase app is already initialized
      if (getApps().length === 0) {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };

        if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
          logger.warn('Firebase credentials not properly configured. Push notifications will be disabled.');
          return;
        }

        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.projectId,
        });
      }

      this.messaging = getMessaging();
      this.isInitialized = true;
      logger.info('Firebase service initialized successfully');
    } catch (error) {
      logger.error('Firebase initialization error:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendPushNotification(request: PushNotificationRequest): Promise<PushNotificationResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        error: 'Firebase not initialized'
      };
    }

    try {
      const tokens = request.userDevices.map(device => device.deviceToken);
      
      if (tokens.length === 0) {
        return {
          success: false,
          successCount: 0,
          failureCount: 0,
          error: 'No device tokens provided'
        };
      }

      // Prepare the multicast message with proper typing
      const message: any = {
        notification: {
          title: request.title,
          body: request.body,
        },
        data: request.data,
        tokens: tokens,
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#1976D2',
            sound: 'default',
            channelId: 'cargolink_notifications',
            priority: 'high' as any,
            ...(request.imageUrl && { imageUrl: request.imageUrl })
          },
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: request.title,
                body: request.body,
              },
              sound: 'default',
              badge: 1,
              'content-available': 1,
            },
          },
          headers: {
            'apns-priority': '10',
            'apns-push-type': 'alert',
          },
          ...(request.imageUrl && {
            fcmOptions: {
              imageUrl: request.imageUrl,
            }
          })
        },
      };

      // Send to multiple tokens
      const response: BatchResponse = await this.messaging.sendMulticast(message);
      
      // Process results
      const invalidTokens: string[] = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && tokens[idx]) {
            const errorCode = resp.error?.code;
            if (errorCode === 'messaging/invalid-registration-token' ||
                errorCode === 'messaging/registration-token-not-registered') {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
      }

      logger.info('Push notification sent', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length,
        invalidTokens: invalidTokens.length
      });

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens: invalidTokens.length > 0 ? invalidTokens : undefined
      };

    } catch (error) {
      logger.error('Push notification error:', error);
      return {
        success: false,
        successCount: 0,
        failureCount: request.userDevices.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send push notification to a single device
   */
  async sendSinglePushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    const result = await this.sendPushNotification({
      userDevices: [{ deviceToken, platform: 'android' }],
      title,
      body,
      data
    });

    return {
      success: result.success,
      error: result.error
    };
  }

  /**
   * Send topic-based notification
   */
  async sendTopicNotification(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Firebase not initialized'
      };
    }

    try {
      const message: Message = {
        notification: {
          title,
          body,
        },
        data,
        topic,
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#1976D2',
            sound: 'default',
            channelId: 'cargolink_notifications',
            priority: 'high' as any,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const messageId = await this.messaging.send(message);
      
      logger.info(`Topic notification sent to ${topic}:`, { messageId });
      
      return {
        success: true,
        messageId
      };

    } catch (error) {
      logger.error(`Topic notification error for ${topic}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Subscribe device to topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      await this.messaging.subscribeToTopic(tokens, topic);
      logger.info(`${tokens.length} tokens subscribed to topic: ${topic}`);
      return { success: true };
    } catch (error) {
      logger.error(`Topic subscription error for ${topic}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unsubscribe device from topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      await this.messaging.unsubscribeFromTopic(tokens, topic);
      logger.info(`${tokens.length} tokens unsubscribed from topic: ${topic}`);
      return { success: true };
    } catch (error) {
      logger.error(`Topic unsubscription error for ${topic}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate device token
   */
  async validateToken(token: string): Promise<{ valid: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { valid: false, error: 'Firebase not initialized' };
    }

    try {
      // Try to send a dry-run message to validate token
      await this.messaging.send({
        token,
        data: { test: 'validation' }
      }, true); // dry-run flag

      return { valid: true };
    } catch (error: any) {
      const errorCode = error.code;
      if (errorCode === 'messaging/invalid-registration-token' || 
          errorCode === 'messaging/registration-token-not-registered') {
        return { valid: false };
      }
      
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get service status
   */
  getStatus(): { initialized: boolean; ready: boolean } {
    return {
      initialized: this.isInitialized,
      ready: this.isInitialized && !!this.messaging
    };
  }
}

export default FirebaseService;