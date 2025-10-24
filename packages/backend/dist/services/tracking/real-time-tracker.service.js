"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeTracker = exports.TrackingStatus = void 0;
const websocket_service_1 = require("../websocket/websocket.service");
const notification_service_1 = require("../notification/notification.service");
const redis_1 = __importDefault(require("../../config/redis"));
const logger_1 = __importDefault(require("../../utils/logger"));
const client_1 = require("@prisma/client");
var TrackingStatus;
(function (TrackingStatus) {
    TrackingStatus["CREATED"] = "created";
    TrackingStatus["PICKED_UP"] = "picked_up";
    TrackingStatus["IN_TRANSIT"] = "in_transit";
    TrackingStatus["AT_HUB"] = "at_hub";
    TrackingStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    TrackingStatus["DELIVERED"] = "delivered";
    TrackingStatus["FAILED_DELIVERY"] = "failed_delivery";
    TrackingStatus["RETURNED"] = "returned";
    TrackingStatus["CANCELLED"] = "cancelled";
    TrackingStatus["EXCEPTION"] = "exception";
})(TrackingStatus || (exports.TrackingStatus = TrackingStatus = {}));
class RealTimeTracker {
    wsService;
    notificationService;
    activeSubscriptions = new Map();
    driverLocations = new Map();
    constructor() {
        this.wsService = websocket_service_1.webSocketService;
        const prisma = new client_1.PrismaClient();
        this.notificationService = new notification_service_1.NotificationService(prisma);
        this.initializeEventHandlers();
    }
    initializeEventHandlers() {
        this.wsService.on('connection', (socket) => {
            logger_1.default.info('New tracking client connected', { socketId: socket.id });
            socket.on('subscribe_tracking', (data) => {
                this.handleTrackingSubscription(socket, data);
            });
            socket.on('unsubscribe_tracking', (data) => {
                this.handleTrackingUnsubscription(socket.id, data.trackingNumbers);
            });
            socket.on('disconnect', () => {
                this.handleClientDisconnect(socket.id);
            });
        });
    }
    async handleTrackingSubscription(socket, data) {
        try {
            const { trackingNumbers, userId } = data;
            const subscription = {
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
                const currentStatus = await this.getCurrentTrackingStatus(trackingNumber);
                if (currentStatus) {
                    socket.emit('tracking_update', currentStatus);
                }
            }
            await redis_1.default.set(`tracking:subscription:${socket.id}`, subscription, { ttl: 86400, tags: ['tracking', 'subscriptions'] });
            socket.emit('subscription_confirmed', { trackingNumbers });
            logger_1.default.info('Tracking subscription created', { userId, trackingNumbers });
        }
        catch (error) {
            logger_1.default.error('Failed to handle tracking subscription:', error);
            socket.emit('subscription_error', { error: 'Failed to subscribe to tracking updates' });
        }
    }
    handleTrackingUnsubscription(socketId, trackingNumbers) {
        try {
            for (const trackingNumber of trackingNumbers) {
                const subscriptions = this.activeSubscriptions.get(trackingNumber);
                if (subscriptions) {
                    const filtered = subscriptions.filter(sub => sub.socketId !== socketId);
                    if (filtered.length > 0) {
                        this.activeSubscriptions.set(trackingNumber, filtered);
                    }
                    else {
                        this.activeSubscriptions.delete(trackingNumber);
                    }
                }
            }
            redis_1.default.delete(`tracking:subscription:${socketId}`);
            logger_1.default.info('Tracking unsubscription processed', { socketId, trackingNumbers });
        }
        catch (error) {
            logger_1.default.error('Failed to handle tracking unsubscription:', error);
        }
    }
    handleClientDisconnect(socketId) {
        try {
            for (const [trackingNumber, subscriptions] of this.activeSubscriptions) {
                const filtered = subscriptions.filter(sub => sub.socketId !== socketId);
                if (filtered.length > 0) {
                    this.activeSubscriptions.set(trackingNumber, filtered);
                }
                else {
                    this.activeSubscriptions.delete(trackingNumber);
                }
            }
            redis_1.default.delete(`tracking:subscription:${socketId}`);
            logger_1.default.info('Client disconnected, subscriptions cleaned up', { socketId });
        }
        catch (error) {
            logger_1.default.error('Error cleaning up client subscriptions:', error);
        }
    }
    async broadcastTrackingUpdate(update) {
        try {
            const { trackingNumber } = update;
            const subscriptions = this.activeSubscriptions.get(trackingNumber);
            if (!subscriptions || subscriptions.length === 0) {
                logger_1.default.debug('No active subscriptions for tracking update', { trackingNumber });
                return;
            }
            await redis_1.default.set(`tracking:status:${trackingNumber}`, update, { ttl: 86400, tags: ['tracking', 'status'] });
            for (const subscription of subscriptions) {
                try {
                    this.wsService.emitToSocket(subscription.socketId, 'tracking_update', {
                        ...update,
                        subscriptionId: subscription.userId
                    });
                    if (subscription.notificationPreferences.push) {
                        await this.sendTrackingNotification(subscription.userId, update);
                    }
                }
                catch (error) {
                    logger_1.default.error('Failed to send update to subscriber:', error);
                }
            }
            logger_1.default.info('Tracking update broadcasted', {
                trackingNumber,
                status: update.status,
                subscribers: subscriptions.length
            });
        }
        catch (error) {
            logger_1.default.error('Failed to broadcast tracking update:', error);
        }
    }
    async updateDriverLocation(locationUpdate) {
        try {
            const { trackingNumber } = locationUpdate;
            this.driverLocations.set(trackingNumber, locationUpdate);
            await redis_1.default.set(`tracking:location:${trackingNumber}`, locationUpdate, { ttl: 3600, tags: ['tracking', 'location'] });
            const subscriptions = this.activeSubscriptions.get(trackingNumber);
            if (subscriptions) {
                for (const subscription of subscriptions) {
                    this.wsService.emitToSocket(subscription.socketId, 'location_update', locationUpdate);
                }
            }
            logger_1.default.debug('Driver location updated', {
                trackingNumber,
                location: `${locationUpdate.latitude},${locationUpdate.longitude}`
            });
        }
        catch (error) {
            logger_1.default.error('Failed to update driver location:', error);
        }
    }
    async getCurrentTrackingStatus(trackingNumber) {
        try {
            const cached = await redis_1.default.get(`tracking:status:${trackingNumber}`);
            if (cached) {
                return cached;
            }
            return null;
        }
        catch (error) {
            logger_1.default.error('Failed to get current tracking status:', error);
            return null;
        }
    }
    async sendTrackingNotification(userId, update) {
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
        }
        catch (error) {
            logger_1.default.error('Failed to send tracking notification:', error);
        }
    }
    generateNotificationMessage(update) {
        const statusMessages = {
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
    async getTrackingAnalytics() {
        try {
            const activeSubscriptions = Array.from(this.activeSubscriptions.values())
                .reduce((total, subs) => total + subs.length, 0);
            const totalTrackingNumbers = this.activeSubscriptions.size;
            const recentUpdateKeys = await redis_1.default.keys('tracking:status:*');
            const recentUpdates = [];
            const statusDistribution = {};
            for (const key of recentUpdateKeys.slice(0, 50)) {
                const update = await redis_1.default.get(key);
                if (update) {
                    recentUpdates.push(update);
                    statusDistribution[update.status] = (statusDistribution[update.status] || 0) + 1;
                }
            }
            recentUpdates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return {
                activeSubscriptions,
                totalTrackingNumbers,
                statusDistribution,
                recentUpdates: recentUpdates.slice(0, 20)
            };
        }
        catch (error) {
            logger_1.default.error('Failed to get tracking analytics:', error);
            return {
                activeSubscriptions: 0,
                totalTrackingNumbers: 0,
                statusDistribution: {},
                recentUpdates: []
            };
        }
    }
    async healthCheck() {
        try {
            const wsConnections = this.wsService.getConnectionCount();
            const totalSubscriptions = Array.from(this.activeSubscriptions.values())
                .reduce((total, subs) => total + subs.length, 0);
            const cacheHealth = await redis_1.default.healthCheck();
            let status = 'healthy';
            if (!cacheHealth) {
                status = 'critical';
            }
            else if (wsConnections === 0 && totalSubscriptions > 0) {
                status = 'warning';
            }
            return {
                status,
                connections: wsConnections,
                subscriptions: totalSubscriptions,
                cache: cacheHealth
            };
        }
        catch (error) {
            logger_1.default.error('Tracking service health check failed:', error);
            return {
                status: 'critical',
                connections: 0,
                subscriptions: 0,
                cache: false
            };
        }
    }
}
exports.RealTimeTracker = RealTimeTracker;
exports.default = new RealTimeTracker();
//# sourceMappingURL=real-time-tracker.service.js.map