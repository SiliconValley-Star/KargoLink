"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationTemplates = exports.PushNotificationService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const logger_1 = __importDefault(require("../../utils/logger"));
class PushNotificationService {
    isInitialized = false;
    constructor() {
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            if (firebase_admin_1.default.apps.length === 0) {
                const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
                if (!serviceAccount) {
                    logger_1.default.warn('Firebase service account key not found. Push notifications will be disabled.');
                    return;
                }
                const credentials = JSON.parse(serviceAccount);
                firebase_admin_1.default.initializeApp({
                    credential: firebase_admin_1.default.credential.cert(credentials),
                    projectId: credentials.project_id
                });
                this.isInitialized = true;
                logger_1.default.info('Firebase Admin SDK initialized successfully');
            }
            else {
                this.isInitialized = true;
                logger_1.default.info('Firebase Admin SDK already initialized');
            }
        }
        catch (error) {
            logger_1.default.error('Failed to initialize Firebase Admin SDK:', error);
            this.isInitialized = false;
        }
    }
    isAvailable() {
        return this.isInitialized;
    }
    async sendToToken(request) {
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
            const message = {
                ...messagePayload,
                token: request.token
            };
            const response = await firebase_admin_1.default.messaging().send(message);
            const duration = Date.now() - startTime;
            logger_1.default.info('Push notification sent successfully', {
                messageId: response,
                duration,
                userId: request.userId,
                title: request.title
            });
            return {
                success: true,
                messageId: response
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.default.error('Push notification failed:', {
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
    async sendToMultipleTokens(request) {
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
            const message = {
                ...messagePayload,
                tokens: request.token
            };
            const response = await firebase_admin_1.default.messaging().sendEachForMulticast(message);
            const duration = Date.now() - startTime;
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && Array.isArray(request.token) && request.token[idx]) {
                    failedTokens.push(request.token[idx]);
                }
            });
            logger_1.default.info('Bulk push notification completed', {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.default.error('Bulk push notification failed:', {
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
    async sendToTopic(topic, request) {
        if (!this.isInitialized) {
            return {
                success: false,
                error: 'Push notification service not initialized'
            };
        }
        const startTime = Date.now();
        try {
            const messagePayload = this.buildMessage(request);
            const message = {
                ...messagePayload,
                topic
            };
            const response = await firebase_admin_1.default.messaging().send(message);
            const duration = Date.now() - startTime;
            logger_1.default.info('Topic push notification sent successfully', {
                topic,
                messageId: response,
                duration,
                title: request.title
            });
            return {
                success: true,
                messageId: response
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.default.error('Topic push notification failed:', {
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
    async subscribeToTopic(tokens, topic) {
        if (!this.isInitialized) {
            return false;
        }
        try {
            const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
            await firebase_admin_1.default.messaging().subscribeToTopic(tokenArray, topic);
            logger_1.default.info(`Subscribed ${tokenArray.length} tokens to topic: ${topic}`);
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to subscribe to topic:', error);
            return false;
        }
    }
    async unsubscribeFromTopic(tokens, topic) {
        if (!this.isInitialized) {
            return false;
        }
        try {
            const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
            await firebase_admin_1.default.messaging().unsubscribeFromTopic(tokenArray, topic);
            logger_1.default.info(`Unsubscribed ${tokenArray.length} tokens from topic: ${topic}`);
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to unsubscribe from topic:', error);
            return false;
        }
    }
    async validateToken(token) {
        if (!this.isInitialized) {
            return false;
        }
        try {
            const message = {
                token,
                data: { test: 'validation' }
            };
            await firebase_admin_1.default.messaging().send(message, true);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    buildMessage(request) {
        const message = {
            notification: {
                title: request.title,
                body: request.body,
                imageUrl: request.image
            },
            data: request.data || {},
            android: {
                notification: {
                    icon: request.icon || 'ic_notification',
                    color: '#2563EB',
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
    getStatus() {
        try {
            const app = firebase_admin_1.default.app();
            return {
                available: this.isInitialized,
                initialized: this.isInitialized,
                projectId: app.options.projectId
            };
        }
        catch {
            return {
                available: false,
                initialized: false
            };
        }
    }
}
exports.PushNotificationService = PushNotificationService;
class PushNotificationTemplates {
    static shipmentUpdate(trackingNumber, status) {
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
    static paymentConfirmation(amount) {
        return {
            title: 'Ödeme Onaylandı',
            body: `${amount} tutarındaki ödemeniz başarıyla alındı`,
            data: {
                type: 'payment_confirmation',
                amount
            }
        };
    }
    static newMessage(senderName, message) {
        return {
            title: `${senderName} size mesaj gönderdi`,
            body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
            data: {
                type: 'new_message',
                sender: senderName
            }
        };
    }
    static promotionalOffer(title, description) {
        return {
            title,
            body: description,
            data: {
                type: 'promotion',
                category: 'offer'
            }
        };
    }
    static systemMaintenance(maintenanceTime) {
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
exports.PushNotificationTemplates = PushNotificationTemplates;
exports.default = PushNotificationService;
//# sourceMappingURL=push.service.js.map