"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
const logger_1 = __importDefault(require("../../utils/logger"));
class FirebaseService {
    messaging;
    isInitialized = false;
    constructor() {
        this.initialize();
    }
    initialize() {
        try {
            if ((0, app_1.getApps)().length === 0) {
                const serviceAccount = {
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                };
                if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
                    logger_1.default.warn('Firebase credentials not properly configured. Push notifications will be disabled.');
                    return;
                }
                (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)(serviceAccount),
                    projectId: serviceAccount.projectId,
                });
            }
            this.messaging = (0, messaging_1.getMessaging)();
            this.isInitialized = true;
            logger_1.default.info('Firebase service initialized successfully');
        }
        catch (error) {
            logger_1.default.error('Firebase initialization error:', error);
            this.isInitialized = false;
        }
    }
    async sendPushNotification(request) {
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
            const message = {
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
                        priority: 'high',
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
            const response = await this.messaging.sendMulticast(message);
            const invalidTokens = [];
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
            logger_1.default.info('Push notification sent', {
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
        }
        catch (error) {
            logger_1.default.error('Push notification error:', error);
            return {
                success: false,
                successCount: 0,
                failureCount: request.userDevices.length,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async sendSinglePushNotification(deviceToken, title, body, data) {
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
    async sendTopicNotification(topic, title, body, data) {
        if (!this.isInitialized) {
            return {
                success: false,
                error: 'Firebase not initialized'
            };
        }
        try {
            const message = {
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
                        priority: 'high',
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
            logger_1.default.info(`Topic notification sent to ${topic}:`, { messageId });
            return {
                success: true,
                messageId
            };
        }
        catch (error) {
            logger_1.default.error(`Topic notification error for ${topic}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async subscribeToTopic(tokens, topic) {
        if (!this.isInitialized) {
            return { success: false, error: 'Firebase not initialized' };
        }
        try {
            await this.messaging.subscribeToTopic(tokens, topic);
            logger_1.default.info(`${tokens.length} tokens subscribed to topic: ${topic}`);
            return { success: true };
        }
        catch (error) {
            logger_1.default.error(`Topic subscription error for ${topic}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async unsubscribeFromTopic(tokens, topic) {
        if (!this.isInitialized) {
            return { success: false, error: 'Firebase not initialized' };
        }
        try {
            await this.messaging.unsubscribeFromTopic(tokens, topic);
            logger_1.default.info(`${tokens.length} tokens unsubscribed from topic: ${topic}`);
            return { success: true };
        }
        catch (error) {
            logger_1.default.error(`Topic unsubscription error for ${topic}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async validateToken(token) {
        if (!this.isInitialized) {
            return { valid: false, error: 'Firebase not initialized' };
        }
        try {
            await this.messaging.send({
                token,
                data: { test: 'validation' }
            }, true);
            return { valid: true };
        }
        catch (error) {
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
    getStatus() {
        return {
            initialized: this.isInitialized,
            ready: this.isInitialized && !!this.messaging
        };
    }
}
exports.FirebaseService = FirebaseService;
exports.default = FirebaseService;
//# sourceMappingURL=firebase.service.js.map