import {Platform, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {webSocketClient} from '../websocket/websocket.client';

// Mock notification library interfaces
// In real app, these would come from @react-native-firebase/messaging or similar
interface FCMToken {
  token: string;
  platform: 'ios' | 'android';
}

interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    shipmentId?: string;
    trackingNumber?: string;
    type?: string;
    action?: string;
  };
}

interface NotificationPermission {
  status: 'granted' | 'denied' | 'not_determined';
  alert: boolean;
  badge: boolean;
  sound: boolean;
}

export interface LocalNotification {
  id: string;
  title: string;
  message: string;
  type: 'shipment_update' | 'delivery_notification' | 'system' | 'promotion';
  timestamp: string;
  isRead: boolean;
  data?: any;
}

class NotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;
  private notificationHandlers: Map<string, Function> = new Map();
  private localNotifications: LocalNotification[] = [];

  // Initialize notification service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      await this.requestPermissions();
      
      // Get FCM token
      await this.getFCMToken();
      
      // Set up listeners
      this.setupNotificationHandlers();
      
      // Load cached notifications
      await this.loadLocalNotifications();
      
      this.isInitialized = true;
      console.log('📱 Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<NotificationPermission> {
    try {
      // Mock permission request - in real app, use firebase messaging
      const mockPermission: NotificationPermission = {
        status: 'granted',
        alert: true,
        badge: true,
        sound: true
      };

      await AsyncStorage.setItem('notification_permissions', JSON.stringify(mockPermission));
      return mockPermission;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return {
        status: 'denied',
        alert: false,
        badge: false,
        sound: false
      };
    }
  }

  // Get FCM token
  async getFCMToken(): Promise<string | null> {
    try {
      // Mock FCM token generation
      const mockToken = `fcm_token_${Platform.OS}_${Date.now()}`;
      this.fcmToken = mockToken;
      
      await AsyncStorage.setItem('fcm_token', mockToken);
      console.log('🔑 FCM Token obtained:', mockToken.substring(0, 20) + '...');
      
      return mockToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  // Set up notification event handlers
  private setupNotificationHandlers() {
    // Listen to WebSocket notifications
    webSocketClient.on('notification', this.handleWebSocketNotification);
    
    // Mock foreground message handler
    this.onForegroundMessage(this.handleForegroundNotification);
    
    // Mock background message handler
    this.onBackgroundMessage(this.handleBackgroundNotification);
    
    // Mock notification opened handler
    this.onNotificationOpened(this.handleNotificationOpened);
  }

  // Handle WebSocket notifications
  private handleWebSocketNotification = (notification: any) => {
    const localNotification: LocalNotification = {
      id: Date.now().toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'system',
      timestamp: new Date().toISOString(),
      isRead: false,
      data: notification.data
    };

    this.addLocalNotification(localNotification);
    this.showLocalNotification(localNotification);
  };

  // Mock methods for notification handling (in real app, these would be from Firebase)
  private onForegroundMessage(handler: (payload: NotificationPayload) => void) {
    // Mock foreground message listener
    console.log('📱 Foreground message listener set up');
  }

  private onBackgroundMessage(handler: (payload: NotificationPayload) => void) {
    // Mock background message listener  
    console.log('📱 Background message listener set up');
  }

  private onNotificationOpened(handler: (notification: any) => void) {
    // Mock notification opened listener
    console.log('📱 Notification opened listener set up');
  }

  // Handle foreground notifications
  private handleForegroundNotification = (payload: NotificationPayload) => {
    console.log('📱 Foreground notification:', payload);
    
    // Show alert in foreground
    Alert.alert(
      payload.title,
      payload.body,
      [
        {text: 'Kapat', style: 'cancel'},
        {
          text: 'Görüntüle',
          onPress: () => this.handleNotificationAction(payload)
        }
      ]
    );
    
    // Add to local notifications
    const localNotification: LocalNotification = {
      id: Date.now().toString(),
      title: payload.title,
      message: payload.body,
      type: payload.data?.type as any || 'system',
      timestamp: new Date().toISOString(),
      isRead: false,
      data: payload.data
    };
    
    this.addLocalNotification(localNotification);
  };

  // Handle background notifications
  private handleBackgroundNotification = (payload: NotificationPayload) => {
    console.log('📱 Background notification:', payload);
    
    // Add to local notifications for when app is opened
    const localNotification: LocalNotification = {
      id: Date.now().toString(),
      title: payload.title,
      message: payload.body,
      type: payload.data?.type as any || 'system',
      timestamp: new Date().toISOString(),
      isRead: false,
      data: payload.data
    };
    
    this.addLocalNotification(localNotification);
  };

  // Handle notification opened (when user taps notification)
  private handleNotificationOpened = (notification: any) => {
    console.log('📱 Notification opened:', notification);
    this.handleNotificationAction(notification);
  };

  // Handle notification actions (navigation, etc.)
  private handleNotificationAction(payload: NotificationPayload | any) {
    const data = payload.data || payload;
    
    if (data?.shipmentId || data?.trackingNumber) {
      // Navigate to tracking screen
      this.notifyHandlers('navigate_to_tracking', {
        shipmentId: data.shipmentId,
        trackingNumber: data.trackingNumber
      });
    } else if (data?.type === 'promotion') {
      // Navigate to promotions
      this.notifyHandlers('navigate_to_promotions', data);
    }
  }

  // Local notification management
  private async addLocalNotification(notification: LocalNotification) {
    this.localNotifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.localNotifications.length > 100) {
      this.localNotifications = this.localNotifications.slice(0, 100);
    }
    
    await this.saveLocalNotifications();
    this.notifyHandlers('new_notification', notification);
  }

  private showLocalNotification(notification: LocalNotification) {
    // Mock local notification display
    console.log('🔔 Showing notification:', notification.title);
  }

  private async loadLocalNotifications() {
    try {
      const stored = await AsyncStorage.getItem('local_notifications');
      if (stored) {
        this.localNotifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load local notifications:', error);
    }
  }

  private async saveLocalNotifications() {
    try {
      await AsyncStorage.setItem(
        'local_notifications', 
        JSON.stringify(this.localNotifications)
      );
    } catch (error) {
      console.error('Failed to save local notifications:', error);
    }
  }

  // Public methods for managing notifications

  // Get all notifications
  getNotifications(): LocalNotification[] {
    return [...this.localNotifications];
  }

  // Get unread notification count
  getUnreadCount(): number {
    return this.localNotifications.filter(n => !n.isRead).length;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.localNotifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      await this.saveLocalNotifications();
      this.notifyHandlers('notification_read', notification);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    let hasChanges = false;
    this.localNotifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      await this.saveLocalNotifications();
      this.notifyHandlers('all_notifications_read', null);
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const index = this.localNotifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      const deleted = this.localNotifications.splice(index, 1)[0];
      await this.saveLocalNotifications();
      this.notifyHandlers('notification_deleted', deleted);
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    this.localNotifications = [];
    await this.saveLocalNotifications();
    this.notifyHandlers('all_notifications_cleared', null);
  }

  // Send test notification (for development)
  async sendTestNotification(): Promise<void> {
    const testNotification: LocalNotification = {
      id: Date.now().toString(),
      title: 'Test Bildirimi',
      message: 'Bu bir test bildirimidir.',
      type: 'system',
      timestamp: new Date().toISOString(),
      isRead: false,
      data: {test: true}
    };

    await this.addLocalNotification(testNotification);
    this.showLocalNotification(testNotification);
  }

  // Event handlers
  onNewNotification(handler: (notification: LocalNotification) => void) {
    this.notificationHandlers.set('new_notification', handler);
  }

  onNotificationRead(handler: (notification: LocalNotification) => void) {
    this.notificationHandlers.set('notification_read', handler);
  }

  onNavigateToTracking(handler: (data: any) => void) {
    this.notificationHandlers.set('navigate_to_tracking', handler);
  }

  onNavigateToPromotions(handler: (data: any) => void) {
    this.notificationHandlers.set('navigate_to_promotions', handler);
  }

  // Utility methods
  private notifyHandlers(event: string, data: any) {
    const handler = this.notificationHandlers.get(event);
    if (handler) {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    }
  }

  // Cleanup
  destroy() {
    webSocketClient.off('notification', this.handleWebSocketNotification);
    this.notificationHandlers.clear();
    console.log('📱 Notification service destroyed');
  }

  // Getters
  get token(): string | null {
    return this.fcmToken;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// React Hook for notifications
export const useNotifications = () => {
  return {
    service: notificationService,
    notifications: notificationService.getNotifications(),
    unreadCount: notificationService.getUnreadCount(),
    markAsRead: (id: string) => notificationService.markAsRead(id),
    markAllAsRead: () => notificationService.markAllAsRead(),
    deleteNotification: (id: string) => notificationService.deleteNotification(id),
    clearAll: () => notificationService.clearAllNotifications(),
  };
};

export default notificationService;