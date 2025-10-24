import {apiClient, ApiResponse} from './client';

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'shipment_update' | 'payment' | 'promotional';
  category: 'shipment' | 'payment' | 'account' | 'marketing' | 'system';
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
  appVersion: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  categories: {
    shipment: boolean;
    payment: boolean;
    account: boolean;
    marketing: boolean;
    system: boolean;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
    timezone: string;
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  lastWeekCount: number;
}

export interface SendNotificationRequest {
  title: string;
  message: string;
  type?: Notification['type'];
  category?: Notification['category'];
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  scheduledAt?: string;
  expiresAt?: string;
}

// Notification Service Class
class NotificationService {
  /**
   * Get user notifications with pagination
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    category?: string,
    unreadOnly: boolean = false
  ): Promise<ApiResponse<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
    unreadCount: number;
  }>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (category) {
        params.append('category', category);
      }
      
      if (unreadOnly) {
        params.append('unreadOnly', 'true');
      }

      const response = await apiClient.get(`/notifications?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Bildirimler alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirimler alınamadı');
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<ApiResponse<{count: number}>> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (error: any) {
      console.error('Okunmamış bildirim sayısı alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Okunmamış bildirim sayısı alınamadı');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim okundu olarak işaretleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim okundu olarak işaretlenemedi');
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<ApiResponse<{success: boolean; updatedCount: number}>> {
    try {
      const response = await apiClient.post('/notifications/mark-read', {
        notificationIds,
      });
      return response.data;
    } catch (error: any) {
      console.error('Çoklu bildirim okundu işaretleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirimler okundu olarak işaretlenemedi');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<{success: boolean; updatedCount: number}>> {
    try {
      const response = await apiClient.post('/notifications/mark-all-read');
      return response.data;
    } catch (error: any) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Tüm bildirimler okundu olarak işaretlenemedi');
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim silme hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim silinemedi');
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultipleNotifications(notificationIds: string[]): Promise<ApiResponse<{success: boolean; deletedCount: number}>> {
    try {
      const response = await apiClient.post('/notifications/delete-multiple', {
        notificationIds,
      });
      return response.data;
    } catch (error: any) {
      console.error('Çoklu bildirim silme hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirimler silinemedi');
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<ApiResponse<{success: boolean; deletedCount: number}>> {
    try {
      const response = await apiClient.post('/notifications/clear-all');
      return response.data;
    } catch (error: any) {
      console.error('Tüm bildirimleri temizleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Tüm bildirimler temizlenemedi');
    }
  }

  /**
   * Register push notification token
   */
  async registerPushToken(tokenData: PushNotificationToken): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post('/notifications/register-token', tokenData);
      return response.data;
    } catch (error: any) {
      console.error('Push token kaydetme hatası:', error);
      throw new Error(error.response?.data?.message || 'Push notification token kaydedilemedi');
    }
  }

  /**
   * Unregister push notification token
   */
  async unregisterPushToken(deviceId: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post('/notifications/unregister-token', {deviceId});
      return response.data;
    } catch (error: any) {
      console.error('Push token silme hatası:', error);
      throw new Error(error.response?.data?.message || 'Push notification token silinemedi');
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data;
    } catch (error: any) {
      console.error('Bildirim tercihlerini alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim tercihleri alınamadı');
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim tercihlerini güncelleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim tercihleri güncellenemedi');
    }
  }

  /**
   * Test notification (development only)
   */
  async sendTestNotification(data: SendNotificationRequest): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post('/notifications/test', data);
      return response.data;
    } catch (error: any) {
      console.error('Test bildirimi gönderme hatası:', error);
      throw new Error(error.response?.data?.message || 'Test bildirimi gönderilemedi');
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<ApiResponse<NotificationStats>> {
    try {
      const response = await apiClient.get('/notifications/stats');
      return response.data;
    } catch (error: any) {
      console.error('Bildirim istatistikleri alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim istatistikleri alınamadı');
    }
  }

  /**
   * Subscribe to notification topic
   */
  async subscribeToTopic(topic: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post(`/notifications/topics/${topic}/subscribe`);
      return response.data;
    } catch (error: any) {
      console.error('Konuya abone olma hatası:', error);
      throw new Error(error.response?.data?.message || 'Konuya abone olunamadı');
    }
  }

  /**
   * Unsubscribe from notification topic
   */
  async unsubscribeFromTopic(topic: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post(`/notifications/topics/${topic}/unsubscribe`);
      return response.data;
    } catch (error: any) {
      console.error('Konudan abone olma hatası:', error);
      throw new Error(error.response?.data?.message || 'Konudan abonelik iptal edilemedi');
    }
  }

  /**
   * Get notification template (for custom notifications)
   */
  async getTemplate(templateId: string): Promise<ApiResponse<{
    id: string;
    name: string;
    title: string;
    message: string;
    type: string;
    variables: string[];
  }>> {
    try {
      const response = await apiClient.get(`/notifications/templates/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim şablonu alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim şablonu alınamadı');
    }
  }

  /**
   * Schedule notification (for reminders)
   */
  async scheduleNotification(data: SendNotificationRequest & {
    scheduledAt: string;
    repeatInterval?: 'none' | 'daily' | 'weekly' | 'monthly';
    repeatUntil?: string;
  }): Promise<ApiResponse<{id: string; success: boolean}>> {
    try {
      const response = await apiClient.post('/notifications/schedule', data);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim zamanlama hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim zamanlanamadı');
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.delete(`/notifications/scheduled/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Zamanlanmış bildirimi iptal etme hatası:', error);
      throw new Error(error.response?.data?.message || 'Zamanlanmış bildirim iptal edilemedi');
    }
  }

  /**
   * Get delivery status of a notification
   */
  async getDeliveryStatus(notificationId: string): Promise<ApiResponse<{
    id: string;
    status: 'pending' | 'delivered' | 'failed' | 'expired';
    deliveredAt?: string;
    failureReason?: string;
    attempts: number;
  }>> {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}/delivery-status`);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim teslimat durumu alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim teslimat durumu alınamadı');
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;