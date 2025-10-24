import io, {Socket} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, AppStateStatus} from 'react-native';

export interface TrackingUpdate {
  shipmentId: string;
  trackingNumber: string;
  status: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  message: string;
  estimatedDelivery?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
}

export interface WebSocketNotification {
  type: string;
  title: string;
  message: string;
  data?: any;
}

type EventCallback = (data: any) => void;

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventCallbacks: Map<string, EventCallback[]> = new Map();
  private subscribedShipments: Set<string> = new Set();

  // Configuration
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = __DEV__ 
      ? 'http://localhost:3001'  // Development
      : 'https://api.cargolink.com';  // Production
    
    this.setupAppStateHandler();
  }

  private appStateSubscription: any = null;

  private setupAppStateHandler() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && !this.socket?.connected) {
      this.connect();
    } else if (nextAppState === 'background' && this.socket?.connected) {
      // Keep connection alive in background for notifications
      // Could implement heartbeat here if needed
    }
  };

  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(this.baseUrl, {
        auth: {
          token: `Bearer ${token}`
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        forceNew: true
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        this.socket!.on('connect', () => {
          console.log('✅ WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Re-subscribe to previous shipments
          this.resubscribeToShipments();
          
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          this.isConnecting = false;
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Max reconnection attempts reached'));
          }
        });
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connected', (data) => {
      console.log('📱 WebSocket welcome message:', data.message);
      this.emit('connection_established', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📱 WebSocket disconnected:', reason);
      this.emit('connection_lost', {reason});
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`📱 WebSocket reconnected after ${attemptNumber} attempts`);
      this.emit('connection_restored', {attempts: attemptNumber});
    });

    // Tracking events
    this.socket.on('tracking_update', (update: TrackingUpdate) => {
      console.log('📍 Tracking update received:', update);
      this.emit('tracking_update', update);
    });

    // Notification events
    this.socket.on('notification', (notification: WebSocketNotification) => {
      console.log('🔔 Notification received:', notification);
      this.emit('notification', notification);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.emit('error', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscribedShipments.clear();
    this.eventCallbacks.clear();
    this.isConnecting = false;
    console.log('📱 WebSocket disconnected manually');
  }

  // Event subscription methods
  on(event: string, callback: EventCallback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Shipment tracking methods
  async subscribeToShipment(shipmentId: string): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    this.socket!.emit('subscribe_shipment', {shipmentId});
    this.subscribedShipments.add(shipmentId);
    
    console.log(`📦 Subscribed to shipment: ${shipmentId}`);
  }

  unsubscribeFromShipment(shipmentId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_shipment', {shipmentId});
    }
    
    this.subscribedShipments.delete(shipmentId);
    console.log(`📦 Unsubscribed from shipment: ${shipmentId}`);
  }

  private resubscribeToShipments() {
    this.subscribedShipments.forEach(shipmentId => {
      this.socket!.emit('subscribe_shipment', {shipmentId});
    });
    
    if (this.subscribedShipments.size > 0) {
      console.log(`📦 Re-subscribed to ${this.subscribedShipments.size} shipments`);
    }
  }

  // Driver/Carrier methods (for future use)
  updateLocation(shipmentId: string, location: {lat: number; lng: number}, heading?: number, speed?: number) {
    if (this.socket?.connected) {
      this.socket.emit('location_update', {
        shipmentId,
        location,
        heading,
        speed
      });
    }
  }

  updateDriverStatus(shipmentId: string, status: string, message?: string) {
    if (this.socket?.connected) {
      this.socket.emit('driver_status_update', {
        shipmentId,
        status,
        message
      });
    }
  }

  // Connection status
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get connectionState(): 'connected' | 'connecting' | 'disconnected' {
    if (this.socket?.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  // Utility methods
  getSubscribedShipments(): string[] {
    return Array.from(this.subscribedShipments);
  }

  async reconnect(): Promise<void> {
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before reconnecting
    return this.connect();
  }

  // Cleanup
  destroy() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.disconnect();
  }
}

// Export singleton instance
export const webSocketClient = new WebSocketClient();

// React Hook for WebSocket functionality
export const useWebSocket = () => {
  return {
    client: webSocketClient,
    connect: () => webSocketClient.connect(),
    disconnect: () => webSocketClient.disconnect(),
    isConnected: webSocketClient.isConnected,
    connectionState: webSocketClient.connectionState,
    subscribeToShipment: (shipmentId: string) => webSocketClient.subscribeToShipment(shipmentId),
    unsubscribeFromShipment: (shipmentId: string) => webSocketClient.unsubscribeFromShipment(shipmentId),
  };
};

export default webSocketClient;