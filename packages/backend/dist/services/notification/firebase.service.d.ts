interface PushNotificationRequest {
    userDevices: Array<{
        deviceToken: string;
        platform: 'ios' | 'android';
    }>;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
    action?: {
        type: 'open_screen' | 'open_url';
        payload: string;
    };
}
interface PushNotificationResult {
    success: boolean;
    successCount: number;
    failureCount: number;
    error?: string;
    invalidTokens?: string[];
}
export declare class FirebaseService {
    private messaging;
    private isInitialized;
    constructor();
    private initialize;
    sendPushNotification(request: PushNotificationRequest): Promise<PushNotificationResult>;
    sendSinglePushNotification(deviceToken: string, title: string, body: string, data?: Record<string, string>): Promise<{
        success: boolean;
        error?: string;
    }>;
    sendTopicNotification(topic: string, title: string, body: string, data?: Record<string, string>): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    subscribeToTopic(tokens: string[], topic: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    unsubscribeFromTopic(tokens: string[], topic: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    validateToken(token: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
    getStatus(): {
        initialized: boolean;
        ready: boolean;
    };
}
export default FirebaseService;
//# sourceMappingURL=firebase.service.d.ts.map