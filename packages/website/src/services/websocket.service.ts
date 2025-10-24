"use client";

import io, { Socket } from 'socket.io-client';

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

class WebSocketService {
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
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001'  // Development
      : process.env.NEXT_PUBLIC_API_URL || 'https://api.cargolink.com';  // Production
  }

  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = this.getAuthToken();
      
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
        forceNew: true,
        withCredentials: true
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

        // Timeout fallback
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 15000);
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
      console.log('🌐 WebSocket welcome message:', data.message);
      this.emit('connection_established', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🌐 WebSocket disconnected:', reason);
      this.emit('connection_lost', { reason });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🌐 WebSocket reconnected after ${attemptNumber} attempts`);
      this.emit('connection_restored', { attempts: attemptNumber });
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
    console.log('🌐 WebSocket disconnected manually');
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

    this.socket!.emit('subscribe_shipment', { shipmentId });
    this.subscribedShipments.add(shipmentId);
    
    console.log(`📦 Subscribed to shipment: ${shipmentId}`);
  }

  unsubscribeFromShipment(shipmentId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_shipment', { shipmentId });
    }
    
    this.subscribedShipments.delete(shipmentId);
    console.log(`📦 Unsubscribed from shipment: ${shipmentId}`);
  }

  private resubscribeToShipments() {
    this.subscribedShipments.forEach(shipmentId => {
      this.socket!.emit('subscribe_shipment', { shipmentId });
    });
    
    if (this.subscribedShipments.size > 0) {
      console.log(`📦 Re-subscribed to ${this.subscribedShipments.size} shipments`);
    }
  }

  // Driver/Carrier methods (for admin panel)
  updateLocation(shipmentId: string, location: { lat: number; lng: number }, heading?: number, speed?: number) {
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

  // Authentication token retrieval
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try multiple storage methods
    return (
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token') ||
      document.cookie.split(';')
        .find(row => row.trim().startsWith('access_token='))
        ?.split('=')[1] ||
      null
    );
  }

  // Check if running in browser
  get isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Cleanup
  destroy() {
    this.disconnect();
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

// React Hook for WebSocket functionality
export const useWebSocket = () => {
  const [connectionState, setConnectionState] = React.useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = React.useState<TrackingUpdate | null>(null);
  const [notifications, setNotifications] = React.useState<WebSocketNotification[]>([]);

  React.useEffect(() => {
    const updateConnectionState = () => {
      setConnectionState(webSocketService.connectionState);
    };

    const handleTrackingUpdate = (update: TrackingUpdate) => {
      setLastUpdate(update);
    };

    const handleNotification = (notification: WebSocketNotification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    };

    // Subscribe to events
    webSocketService.on('connection_established', updateConnectionState);
    webSocketService.on('connection_lost', updateConnectionState);
    webSocketService.on('connection_restored', updateConnectionState);
    webSocketService.on('tracking_update', handleTrackingUpdate);
    webSocketService.on('notification', handleNotification);

    // Initial connection attempt
    if (webSocketService.isBrowser && !webSocketService.isConnected) {
      webSocketService.connect().catch(console.error);
    }

    // Cleanup on unmount
    return () => {
      webSocketService.off('connection_established', updateConnectionState);
      webSocketService.off('connection_lost', updateConnectionState);
      webSocketService.off('connection_restored', updateConnectionState);
      webSocketService.off('tracking_update', handleTrackingUpdate);
      webSocketService.off('notification', handleNotification);
    };
  }, []);

  return {
    service: webSocketService,
    connectionState,
    isConnected: connectionState === 'connected',
    lastUpdate,
    notifications,
    connect: () => webSocketService.connect(),
    disconnect: () => webSocketService.disconnect(),
    subscribeToShipment: (shipmentId: string) => webSocketService.subscribeToShipment(shipmentId),
    unsubscribeFromShipment: (shipmentId: string) => webSocketService.unsubscribeFromShipment(shipmentId),
    clearNotifications: () => setNotifications([]),
  };
};

// Import React for the hook
import React from 'react';

export default webSocketService;