"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketService = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../../utils/logger");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const shared_1 = require("@cargolink/shared");
class WebSocketService {
    io;
    connectedUsers = new Map();
    userSubscriptions = new Map();
    initialize(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || "*",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        this.setupMiddleware();
        this.setupEventHandlers();
        logger_1.dbLogger.info('WebSocket service initialized');
    }
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const user = await this.authenticateSocketToken(token);
                socket.data.user = user;
                next();
            }
            catch (error) {
                logger_1.dbLogger.error('WebSocket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }
    handleConnection(socket) {
        const user = socket.data.user;
        const userId = user.userId;
        this.connectedUsers.set(userId, socket);
        logger_1.dbLogger.info(`User ${user.email} connected via WebSocket`);
        if (!this.userSubscriptions.has(userId)) {
            this.userSubscriptions.set(userId, new Set());
        }
        socket.on('subscribe_shipment', (data) => {
            this.handleShipmentSubscription(socket, data.shipmentId);
        });
        socket.on('unsubscribe_shipment', (data) => {
            this.handleShipmentUnsubscription(socket, data.shipmentId);
        });
        socket.on('location_update', (data) => {
            this.handleLocationUpdate(socket, data);
        });
        socket.on('driver_status_update', (data) => {
            this.handleDriverStatusUpdate(socket, data);
        });
        socket.on('disconnect', () => {
            this.handleDisconnection(socket);
        });
        socket.emit('connected', {
            message: 'CargoLink WebSocket bağlantısı kuruldu',
            timestamp: new Date().toISOString()
        });
    }
    handleShipmentSubscription(socket, shipmentId) {
        const user = socket.data.user;
        const userId = user.userId;
        socket.join(`shipment:${shipmentId}`);
        const userSubs = this.userSubscriptions.get(userId);
        if (userSubs) {
            userSubs.add(shipmentId);
        }
        logger_1.dbLogger.info(`User ${user.email} subscribed to shipment ${shipmentId}`);
        this.sendCurrentShipmentStatus(socket, shipmentId);
    }
    handleShipmentUnsubscription(socket, shipmentId) {
        const user = socket.data.user;
        const userId = user.userId;
        socket.leave(`shipment:${shipmentId}`);
        const userSubs = this.userSubscriptions.get(userId);
        if (userSubs) {
            userSubs.delete(shipmentId);
        }
        logger_1.dbLogger.info(`User ${user.email} unsubscribed from shipment ${shipmentId}`);
    }
    async handleLocationUpdate(socket, data) {
        const user = socket.data.user;
        if (user.role !== 'CARRIER' && user.role !== 'ADMIN') {
            socket.emit('error', { message: 'Permission denied' });
            return;
        }
        const trackingUpdate = {
            shipmentId: data.shipmentId,
            trackingNumber: `CL${data.shipmentId.slice(-8)}`,
            status: shared_1.ShipmentStatus.IN_TRANSIT,
            location: {
                lat: data.location.lat,
                lng: data.location.lng,
                address: await this.getAddressFromCoordinates(data.location.lat, data.location.lng)
            },
            timestamp: new Date().toISOString(),
            message: 'Konum güncellendi'
        };
        this.broadcastTrackingUpdate(data.shipmentId, trackingUpdate);
        logger_1.dbLogger.info(`Location update for shipment ${data.shipmentId}:`, data.location);
    }
    handleDriverStatusUpdate(socket, data) {
        const user = socket.data.user;
        if (user.role !== 'CARRIER' && user.role !== 'ADMIN') {
            socket.emit('error', { message: 'Permission denied' });
            return;
        }
        const trackingUpdate = {
            shipmentId: data.shipmentId,
            trackingNumber: `CL${data.shipmentId.slice(-8)}`,
            status: this.mapDriverStatusToShipmentStatus(data.status),
            timestamp: new Date().toISOString(),
            message: data.message || 'Durum güncellendi'
        };
        this.broadcastTrackingUpdate(data.shipmentId, trackingUpdate);
        logger_1.dbLogger.info(`Driver status update for shipment ${data.shipmentId}:`, data);
    }
    handleDisconnection(socket) {
        const user = socket.data.user;
        const userId = user.userId;
        this.connectedUsers.delete(userId);
        this.userSubscriptions.delete(userId);
        logger_1.dbLogger.info(`User ${user.email} disconnected from WebSocket`);
    }
    broadcastTrackingUpdate(shipmentId, update) {
        this.io.to(`shipment:${shipmentId}`).emit('tracking_update', update);
        logger_1.dbLogger.info(`Broadcasting tracking update for shipment ${shipmentId}`);
    }
    broadcastStatusChange(shipmentId, status, message) {
        const update = {
            shipmentId,
            trackingNumber: `CL${shipmentId.slice(-8)}`,
            status,
            timestamp: new Date().toISOString(),
            message: message || this.getStatusMessage(status)
        };
        this.broadcastTrackingUpdate(shipmentId, update);
    }
    sendNotificationToUser(userId, notification) {
        const userSocket = this.connectedUsers.get(userId);
        if (userSocket) {
            userSocket.emit('notification', notification);
        }
    }
    async sendCurrentShipmentStatus(socket, shipmentId) {
        try {
            const mockUpdate = {
                shipmentId,
                trackingNumber: `CL${shipmentId.slice(-8)}`,
                status: shared_1.ShipmentStatus.IN_TRANSIT,
                timestamp: new Date().toISOString(),
                message: 'Gönderi taşıma sürecinde',
                estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            socket.emit('tracking_update', mockUpdate);
        }
        catch (error) {
            logger_1.dbLogger.error('Error sending current shipment status:', error);
        }
    }
    async getAddressFromCoordinates(lat, lng) {
        return `Konum: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    mapDriverStatusToShipmentStatus(driverStatus) {
        const statusMap = {
            'picked_up': shared_1.ShipmentStatus.PICKED_UP,
            'in_transit': shared_1.ShipmentStatus.IN_TRANSIT,
            'out_for_delivery': shared_1.ShipmentStatus.OUT_FOR_DELIVERY,
            'delivered': shared_1.ShipmentStatus.DELIVERED,
            'failed_delivery': shared_1.ShipmentStatus.OUT_FOR_DELIVERY,
            'returned': shared_1.ShipmentStatus.RETURNED
        };
        return statusMap[driverStatus] || shared_1.ShipmentStatus.IN_TRANSIT;
    }
    async authenticateSocketToken(token) {
        try {
            const cleanToken = token.replace('Bearer ', '');
            const decoded = jsonwebtoken_1.default.verify(cleanToken, process.env.JWT_SECRET || 'fallback-secret');
            return {
                userId: decoded.sub,
                email: decoded.email,
                role: decoded.role
            };
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    getStatusMessage(status) {
        const messages = {
            [shared_1.ShipmentStatus.PENDING]: 'Gönderi hazırlanıyor',
            [shared_1.ShipmentStatus.QUOTED]: 'Fiyat teklifi alındı',
            [shared_1.ShipmentStatus.BOOKED]: 'Gönderi rezerve edildi',
            [shared_1.ShipmentStatus.PICKED_UP]: 'Gönderi toplandı',
            [shared_1.ShipmentStatus.IN_TRANSIT]: 'Gönderi taşıma sürecinde',
            [shared_1.ShipmentStatus.OUT_FOR_DELIVERY]: 'Teslimat için yolda',
            [shared_1.ShipmentStatus.DELIVERED]: 'Gönderi teslim edildi',
            [shared_1.ShipmentStatus.CANCELLED]: 'Gönderi iptal edildi',
            [shared_1.ShipmentStatus.RETURNED]: 'Gönderi iade edildi',
            [shared_1.ShipmentStatus.LOST]: 'Gönderi kayboldu',
            [shared_1.ShipmentStatus.DAMAGED]: 'Gönderi hasar gördü'
        };
        return messages[status] || 'Durum güncellendi';
    }
    getConnectionStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            totalSubscriptions: Array.from(this.userSubscriptions.values())
                .reduce((sum, subs) => sum + subs.size, 0),
            activeRooms: this.io.sockets.adapter.rooms.size
        };
    }
}
exports.webSocketService = new WebSocketService();
//# sourceMappingURL=websocket.service.js.map