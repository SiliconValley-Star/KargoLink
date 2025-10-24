import { webSocketService } from '../websocket/websocket.service';
import { NotificationService } from '../notification/notification.service';
import redisService from '../../config/redis';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client';

export interface TrackingUpdate {
  trackingNumber: string;
  shipmentId: string;
  status: TrackingStatus;
  location: string;
  timestamp: string;
  description: string;
  estimatedDelivery?: string;
  metadata?: Record<string, any>;
}

export interface LocationUpdate {
  trackingNumber: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
}

export enum TrackingStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  AT_HUB = 'at_hub',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  EXCEPTION = 'exception'
}

export interface TrackingSubscription {
  userId: string;
  trackingNumbers: string[];
  socketId: string;
  notificationPreferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

class RealTimeTracker {
  private wsService: any;
  private notificationService: NotificationService;
  private activeSubscriptions: Map<string, TrackingSubscription[]> = new Map();
  private driverLocations: Map<string, LocationUpdate> = new Map();

  constructor() {
    this.wsService = webSocketService;
    // Create a new Prisma client instance for notifications
    const prisma = new PrismaClient();
    this.notificationService = new NotificationService(prisma);
    this.initializeEventHandlers();
  }

  /**
   * Initialize WebSocket event handlers
   */
  private initializeEventHandlers(): void {
    this.wsService.on('connection', (socket: any) => {
      logger.info('New tracking client connected', { socketId: socket.id });
      
      socket.on('subscribe_tracking', (data: { trackingNumbers: string[]; userId: string }) => {
        this.handleTrackingSubscription(socket, data);
      });

      socket.on('unsubscribe_tracking', (data: { trackingNumbers: string[] }) => {
        this.handleTrackingUnsubscription(socket.id, data.trackingNumbers);
      });

      socket.on('disconnect', () => {
        this.handleClientDisconnect(socket.id);
      });
    });
  }

  /**
   * Handle new tracking subscription
   */
  private async handleTrackingSubscription(
    socket: any, 
    data: { trackingNumbers: string[]; userId: string }
  ): Promise<void> {
    try {
      const { trackingNumbers, userId } = data;
      
      // Store subscription
      const subscription: TrackingSubscription = {
        userId,
        trackingNumbers,
        socketId: socket.id,
        notificationPreferences: {
          push: true,
          email: true,
          sms: false
        }
      };

      for (const trackingNumber of trackingNumbers) {
        if (!this.activeSubscriptions.has(trackingNumber)) {
          this.activeSubscriptions.set(trackingNumber, []);
        }
        this.activeSubscriptions.get(trackingNumber)?.push(subscription);

        // Send current status immediately
        const currentStatus = await this.getCurrentTrackingStatus(trackingNumber);
        if (currentStatus) {
          socket.emit('tracking_update', currentStatus);
        }
      }

      // Cache subscription in Redis for persistence
      await redisService.set(
        `tracking:subscription:${socket.id}`,
        subscription,
        { ttl: 86400, tags: ['tracking', 'subscriptions'] }
      );

      socket.emit('subscription_confirmed', { trackingNumbers });
      logger.info('Tracking subscription created', { userId, trackingNumbers });

    } catch (error) {
      logger.error('Failed to handle tracking subscription:', error);
      socket.emit('subscription_error', { error: 'Failed to subscribe to tracking updates' });
    }
  }

  /**
   * Handle tracking unsubscription
   */
  private handleTrackingUnsubscription(socketId: string, trackingNumbers: string[]): void {
    try {
      for (const trackingNumber of trackingNumbers) {
        const subscriptions = this.activeSubscriptions.get(trackingNumber);
        if (subscriptions) {
          const filtered = subscriptions.filter(sub => sub.socketId !== socketId);
          if (filtered.length > 0) {
            this.activeSubscriptions.set(trackingNumber, filtered);
          } else {
            this.activeSubscriptions.delete(trackingNumber);
          }
        }
      }

      // Remove from Redis
      redisService.delete(`tracking:subscription:${socketId}`);
      
      logger.info('Tracking unsubscription processed', { socketId, trackingNumbers });
    } catch (error) {
      logger.error('Failed to handle tracking unsubscription:', error);
    }
  }

  /**
   * Handle client disconnect
   */
  private handleClientDisconnect(socketId: string): void {
    try {
      // Remove all subscriptions for this socket
      for (const [trackingNumber, subscriptions] of this.activeSubscriptions) {
        const filtered = subscriptions.filter(sub => sub.socketId !== socketId);
        if (filtered.length > 0) {
          this.activeSubscriptions.set(trackingNumber, filtered);
        } else {
          this.activeSubscriptions.delete(trackingNumber);
        }
      }

      // Clean up Redis
      redisService.delete(`tracking:subscription:${socketId}`);
      
      logger.info('Client disconnected, subscriptions cleaned up', { socketId });
    } catch (error) {
      logger.error('Error cleaning up client subscriptions:', error);
    }
  }

  /**
   * Broadcast tracking update to subscribers
   */
  public async broadcastTrackingUpdate(update: TrackingUpdate): Promise<void> {
    try {
      const { trackingNumber } = update;
      const subscriptions = this.activeSubscriptions.get(trackingNumber);
      
      if (!subscriptions || subscriptions.length === 0) {
        logger.debug('No active subscriptions for tracking update', { trackingNumber });
        return;
      }

      // Cache the update
      await redisService.set(
        `tracking:status:${trackingNumber}`,
        update,
        { ttl: 86400, tags: ['tracking', 'status'] }
      );

      // Broadcast to WebSocket clients
      for (const subscription of subscriptions) {
        try {
          this.wsService.emitToSocket(subscription.socketId, 'tracking_update', {
            ...update,
            subscriptionId: subscription.userId
          });

          // Send push notification if enabled
          if (subscription.notificationPreferences.push) {
            await this.sendTrackingNotification(subscription.userId, update);
          }
        } catch (error) {
          logger.error('Failed to send update to subscriber:', error);
        }
      }

      logger.info('Tracking update broadcasted', {
        trackingNumber,
        status: update.status,
        subscribers: subscriptions.length
      });

    } catch (error) {
      logger.error('Failed to broadcast tracking update:', error);
    }
  }

  /**
   * Update driver location
   */
  public async updateDriverLocation(locationUpdate: LocationUpdate): Promise<void> {
    try {
      const { trackingNumber } = locationUpdate;
      
      // Store driver location
      this.driverLocations.set(trackingNumber, locationUpdate);
      
      // Cache in Redis
      await redisService.set(
        `tracking:location:${trackingNumber}`,
        locationUpdate,
        { ttl: 3600, tags: ['tracking', 'location'] }
      );

      // Broadcast to subscribers
      const subscriptions = this.activeSubscriptions.get(trackingNumber);
      if (subscriptions) {
        for (const subscription of subscriptions) {
          this.wsService.emitToSocket(subscription.socketId, 'location_update', locationUpdate);
        }
      }

      logger.debug('Driver location updated', {
        trackingNumber,
        location: `${locationUpdate.latitude},${locationUpdate.longitude}`
      });

    } catch (error) {
      logger.error('Failed to update driver location:', error);
    }
  }

  /**
   * Get current tracking status
   */
  private async getCurrentTrackingStatus(trackingNumber: string): Promise<TrackingUpdate | null> {
    try {
      // Try to get from cache first
      const cached = await redisService.get(`tracking:status:${trackingNumber}`);
      if (cached) {
        return cached as TrackingUpdate;
      }

      // TODO: Query from database
      // For now, return null - this would be implemented when database integration is complete
      return null;
    } catch (error) {
      logger.error('Failed to get current tracking status:', error);
      return null;
    }
  }

  /**
   * Send tracking notification
   */
  private async sendTrackingNotification(userId: string, update: TrackingUpdate): Promise<void> {
    try {
      const message = this.generateNotificationMessage(update);
      
      await this.notificationService.sendNotification({
        userId,
        type: 'tracking_update',
        title: 'Gönderi Durumu Güncellendi',
        message,
        data: {
          trackingNumber: update.trackingNumber,
          status: update.status,
          location: update.location
        }
      });

    } catch (error) {
      logger.error('Failed to send tracking notification:', error);
    }
  }

  /**
   * Generate notification message based on status
   */
  private generateNotificationMessage(update: TrackingUpdate): string {
    const statusMessages: Record<TrackingStatus, string> = {
      [TrackingStatus.CREATED]: 'Gönderi oluşturuldu',
      [TrackingStatus.PICKED_UP]: 'Gönderi toplandı',
      [TrackingStatus.IN_TRANSIT]: 'Gönderi yolda',
      [TrackingStatus.AT_HUB]: 'Gönderi dağıtım merkezinde',
      [TrackingStatus.OUT_FOR_DELIVERY]: 'Gönderi teslimat için yola çıktı',
      [TrackingStatus.DELIVERED]: 'Gönderi teslim edildi',
      [TrackingStatus.FAILED_DELIVERY]: 'Teslimat başarısız',
      [TrackingStatus.RETURNED]: 'Gönderi iade edildi',
      [TrackingStatus.CANCELLED]: 'Gönderi iptal edildi',
      [TrackingStatus.EXCEPTION]: 'Gönderi durumunda özel durum'
    };

    const baseMessage = statusMessages[update.status] || 'Gönderi durumu güncellendi';
    const location = update.location ? ` - ${update.location}` : '';
    
    return `${update.trackingNumber}: ${baseMessage}${location}`;
  }

  /**
   * Get tracking analytics
   */
  public async getTrackingAnalytics(): Promise<{
    activeSubscriptions: number;
    totalTrackingNumbers: number;
    statusDistribution: Record<string, number>;
    recentUpdates: TrackingUpdate[];
  }> {
    try {
      const activeSubscriptions = Array.from(this.activeSubscriptions.values())
        .reduce((total, subs) => total + subs.length, 0);
      
      const totalTrackingNumbers = this.activeSubscriptions.size;
      
      // Get recent updates from Redis
      const recentUpdateKeys = await redisService.keys('tracking:status:*');
      const recentUpdates: TrackingUpdate[] = [];
      const statusDistribution: Record<string, number> = {};

      for (const key of recentUpdateKeys.slice(0, 50)) { // Limit to 50 recent updates
        const update = await redisService.get(key) as TrackingUpdate;
        if (update) {
          recentUpdates.push(update);
          statusDistribution[update.status] = (statusDistribution[update.status] || 0) + 1;
        }
      }

      // Sort by timestamp
      recentUpdates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        activeSubscriptions,
        totalTrackingNumbers,
        statusDistribution,
        recentUpdates: recentUpdates.slice(0, 20) // Return last 20 updates
      };

    } catch (error) {
      logger.error('Failed to get tracking analytics:', error);
      return {
        activeSubscriptions: 0,
        totalTrackingNumbers: 0,
        statusDistribution: {},
        recentUpdates: []
      };
    }
  }

  /**
   * Health check for tracking service
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    connections: number;
    subscriptions: number;
    cache: boolean;
  }> {
    try {
      const wsConnections = this.wsService.getConnectionCount();
      const totalSubscriptions = Array.from(this.activeSubscriptions.values())
        .reduce((total, subs) => total + subs.length, 0);
      
      const cacheHealth = await redisService.healthCheck();
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (!cacheHealth) {
        status = 'critical';
      } else if (wsConnections === 0 && totalSubscriptions > 0) {
        status = 'warning';
      }
      
      return {
        status,
        connections: wsConnections,
        subscriptions: totalSubscriptions,
        cache: cacheHealth
      };

    } catch (error) {
      logger.error('Tracking service health check failed:', error);
      return {
        status: 'critical',
        connections: 0,
        subscriptions: 0,
        cache: false
      };
    }
  }
}

// Export singleton instance
export default new RealTimeTracker();
export { RealTimeTracker };