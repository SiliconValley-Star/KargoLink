import {Server as HTTPServer} from 'http';
import {Server as SocketIOServer, Socket} from 'socket.io';
import {dbLogger as logger} from '../../utils/logger';
import jwt from 'jsonwebtoken';

// Local ShipmentStatus enum (replaces @cargolink/shared)
enum ShipmentStatus {
  DRAFT = 'DRAFT',
  PENDING_QUOTES = 'PENDING_QUOTES',
  QUOTES_RECEIVED = 'QUOTES_RECEIVED',
  CARRIER_SELECTED = 'CARRIER_SELECTED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
  DISPUTE = 'DISPUTE',
  REFUNDED = 'REFUNDED',
  PENDING = 'PENDING',
  QUOTED = 'QUOTED',
  BOOKED = 'BOOKED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED'
}

export interface TrackingUpdate {
  shipmentId: string;
  trackingNumber: string;
  status: ShipmentStatus;
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

export interface SocketUser {
  userId: string;
  email: string;
  role: string;
}

class WebSocketService {
  private io!: SocketIOServer;
  private connectedUsers: Map<string, Socket> = new Map();
  private userSubscriptions: Map<string, Set<string>> = new Map(); // userId -> shipmentIds

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('WebSocket service initialized');
  }

  private setupMiddleware() {
    // Authentication middleware for WebSocket
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const user = await this.authenticateSocketToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket) {
    const user: SocketUser = socket.data.user;
    const userId = user.userId;

    // Store user connection
    this.connectedUsers.set(userId, socket);
    logger.info(`User ${user.email} connected via WebSocket`);

    // Initialize user subscriptions if not exists
    if (!this.userSubscriptions.has(userId)) {
      this.userSubscriptions.set(userId, new Set());
    }

    // Handle shipment tracking subscription
    socket.on('subscribe_shipment', (data: {shipmentId: string}) => {
      this.handleShipmentSubscription(socket, data.shipmentId);
    });

    // Handle shipment tracking unsubscription
    socket.on('unsubscribe_shipment', (data: {shipmentId: string}) => {
      this.handleShipmentUnsubscription(socket, data.shipmentId);
    });

    // Handle location updates (for carriers/drivers)
    socket.on('location_update', (data: {
      shipmentId: string;
      location: {lat: number; lng: number};
      heading?: number;
      speed?: number;
    }) => {
      this.handleLocationUpdate(socket, data);
    });

    // Handle driver status updates
    socket.on('driver_status_update', (data: {
      shipmentId: string;
      status: string;
      message?: string;
    }) => {
      this.handleDriverStatusUpdate(socket, data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'CargoLink WebSocket bağlantısı kuruldu',
      timestamp: new Date().toISOString()
    });
  }

  private handleShipmentSubscription(socket: Socket, shipmentId: string) {
    const user: SocketUser = socket.data.user;
    const userId = user.userId;

    // Add to room for this shipment
    socket.join(`shipment:${shipmentId}`);
    
    // Add to user subscriptions
    const userSubs = this.userSubscriptions.get(userId);
    if (userSubs) {
      userSubs.add(shipmentId);
    }

    logger.info(`User ${user.email} subscribed to shipment ${shipmentId}`);

    // Send current shipment status if available
    this.sendCurrentShipmentStatus(socket, shipmentId);
  }

  private handleShipmentUnsubscription(socket: Socket, shipmentId: string) {
    const user: SocketUser = socket.data.user;
    const userId = user.userId;

    // Remove from room
    socket.leave(`shipment:${shipmentId}`);
    
    // Remove from user subscriptions
    const userSubs = this.userSubscriptions.get(userId);
    if (userSubs) {
      userSubs.delete(shipmentId);
    }

    logger.info(`User ${user.email} unsubscribed from shipment ${shipmentId}`);
  }

  private async handleLocationUpdate(socket: Socket, data: {
    shipmentId: string;
    location: {lat: number; lng: number};
    heading?: number;
    speed?: number;
  }) {
    const user: SocketUser = socket.data.user;
    
    // Verify user has permission to update this shipment
    if (user.role !== 'CARRIER' && user.role !== 'ADMIN') {
      socket.emit('error', {message: 'Permission denied'});
      return;
    }

    // Broadcast location update to all subscribers
    const trackingUpdate: TrackingUpdate = {
      shipmentId: data.shipmentId,
      trackingNumber: `CL${data.shipmentId.slice(-8)}`, // Mock tracking number
      status: ShipmentStatus.IN_TRANSIT,
      location: {
        lat: data.location.lat,
        lng: data.location.lng,
        address: await this.getAddressFromCoordinates(data.location.lat, data.location.lng)
      },
      timestamp: new Date().toISOString(),
      message: 'Konum güncellendi'
    };

    this.broadcastTrackingUpdate(data.shipmentId, trackingUpdate);
    
    logger.info(`Location update for shipment ${data.shipmentId}:`, data.location);
  }

  private handleDriverStatusUpdate(socket: Socket, data: {
    shipmentId: string;
    status: string;
    message?: string;
  }) {
    const user: SocketUser = socket.data.user;
    
    // Verify user has permission
    if (user.role !== 'CARRIER' && user.role !== 'ADMIN') {
      socket.emit('error', {message: 'Permission denied'});
      return;
    }

    const trackingUpdate: TrackingUpdate = {
      shipmentId: data.shipmentId,
      trackingNumber: `CL${data.shipmentId.slice(-8)}`,
      status: this.mapDriverStatusToShipmentStatus(data.status),
      timestamp: new Date().toISOString(),
      message: data.message || 'Durum güncellendi'
    };

    this.broadcastTrackingUpdate(data.shipmentId, trackingUpdate);
    
    logger.info(`Driver status update for shipment ${data.shipmentId}:`, data);
  }

  private handleDisconnection(socket: Socket) {
    const user: SocketUser = socket.data.user;
    const userId = user.userId;

    // Remove from connected users
    this.connectedUsers.delete(userId);
    
    // Clean up subscriptions
    this.userSubscriptions.delete(userId);

    logger.info(`User ${user.email} disconnected from WebSocket`);
  }

  // Public methods for broadcasting updates
  
  public broadcastTrackingUpdate(shipmentId: string, update: TrackingUpdate) {
    // Broadcast to all users subscribed to this shipment
    this.io.to(`shipment:${shipmentId}`).emit('tracking_update', update);
    
    logger.info(`Broadcasting tracking update for shipment ${shipmentId}`);
  }

  public broadcastStatusChange(shipmentId: string, status: ShipmentStatus, message?: string) {
    const update: TrackingUpdate = {
      shipmentId,
      trackingNumber: `CL${shipmentId.slice(-8)}`,
      status,
      timestamp: new Date().toISOString(),
      message: message || this.getStatusMessage(status)
    };

    this.broadcastTrackingUpdate(shipmentId, update);
  }

  public sendNotificationToUser(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit('notification', notification);
    }
  }

  private async sendCurrentShipmentStatus(socket: Socket, shipmentId: string) {
    try {
      // Here you would typically fetch current status from database
      // For now, sending a mock status
      const mockUpdate: TrackingUpdate = {
        shipmentId,
        trackingNumber: `CL${shipmentId.slice(-8)}`,
        status: ShipmentStatus.IN_TRANSIT,
        timestamp: new Date().toISOString(),
        message: 'Gönderi taşıma sürecinde',
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // +1 day
      };

      socket.emit('tracking_update', mockUpdate);
    } catch (error) {
      logger.error('Error sending current shipment status:', error);
    }
  }

  private async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    // Mock geocoding - in real app, use Google Maps or similar API
    return `Konum: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  private mapDriverStatusToShipmentStatus(driverStatus: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      'picked_up': ShipmentStatus.PICKED_UP,
      'in_transit': ShipmentStatus.IN_TRANSIT,
      'out_for_delivery': ShipmentStatus.OUT_FOR_DELIVERY,
      'delivered': ShipmentStatus.DELIVERED,
      'failed_delivery': ShipmentStatus.OUT_FOR_DELIVERY,
      'returned': ShipmentStatus.RETURNED
    };

    return statusMap[driverStatus] || ShipmentStatus.IN_TRANSIT;
  }

  private async authenticateSocketToken(token: string) {
    try {
      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      return {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private getStatusMessage(status: ShipmentStatus): string {
    const messages: Record<ShipmentStatus, string> = {
      [ShipmentStatus.DRAFT]: 'Taslak oluşturuldu',
      [ShipmentStatus.PENDING_QUOTES]: 'Teklif bekleniyor',
      [ShipmentStatus.QUOTES_RECEIVED]: 'Teklifler alındı',
      [ShipmentStatus.CARRIER_SELECTED]: 'Taşıyıcı seçildi',
      [ShipmentStatus.PAYMENT_PENDING]: 'Ödeme bekleniyor',
      [ShipmentStatus.PAYMENT_COMPLETED]: 'Ödeme tamamlandı',
      [ShipmentStatus.PICKUP_SCHEDULED]: 'Toplama zamanlandı',
      [ShipmentStatus.PICKED_UP]: 'Gönderi toplandı',
      [ShipmentStatus.IN_TRANSIT]: 'Gönderi taşıma sürecinde',
      [ShipmentStatus.OUT_FOR_DELIVERY]: 'Teslimat için yolda',
      [ShipmentStatus.DELIVERED]: 'Gönderi teslim edildi',
      [ShipmentStatus.DELIVERY_FAILED]: 'Teslimat başarısız',
      [ShipmentStatus.RETURNED]: 'Gönderi iade edildi',
      [ShipmentStatus.CANCELLED]: 'Gönderi iptal edildi',
      [ShipmentStatus.DISPUTE]: 'Anlaşmazlık var',
      [ShipmentStatus.REFUNDED]: 'İade edildi',
      [ShipmentStatus.PENDING]: 'Gönderi hazırlanıyor',
      [ShipmentStatus.QUOTED]: 'Fiyat teklifi alındı',
      [ShipmentStatus.BOOKED]: 'Gönderi rezerve edildi',
      [ShipmentStatus.LOST]: 'Gönderi kayboldu',
      [ShipmentStatus.DAMAGED]: 'Gönderi hasar gördü'
    };

    return messages[status] || 'Durum güncellendi';
  }

  // Get statistics
  public getConnectionStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalSubscriptions: Array.from(this.userSubscriptions.values())
        .reduce((sum, subs) => sum + subs.size, 0),
      activeRooms: this.io.sockets.adapter.rooms.size
    };
  }
}

export const webSocketService = new WebSocketService();