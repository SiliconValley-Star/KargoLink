export interface PushNotificationRequest {
    token: string | string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    userId?: string;
    icon?: string;
    image?: string;
    clickAction?: string;
    badge?: number;
    sound?: string;
    priority?: 'normal' | 'high';
}
export interface PushNotificationResponse {
    success: boolean;
    messageId?: string;
    error?: string;
    successCount?: number;
    failureCount?: number;
    failedTokens?: string[];
}
export declare class PushNotificationService {
    private isInitialized;
    constructor();
    private initializeFirebase;
    isAvailable(): boolean;
    sendToToken(request: PushNotificationRequest): Promise<PushNotificationResponse>;
    sendToMultipleTokens(request: PushNotificationRequest): Promise<PushNotificationResponse>;
    sendToTopic(topic: string, request: Omit<PushNotificationRequest, 'token'>): Promise<PushNotificationResponse>;
    subscribeToTopic(tokens: string | string[], topic: string): Promise<boolean>;
    unsubscribeFromTopic(tokens: string | string[], topic: string): Promise<boolean>;
    validateToken(token: string): Promise<boolean>;
    private buildMessage;
    getStatus(): {
        available: boolean;
        initialized: boolean;
        projectId?: string;
    };
}
export declare class PushNotificationTemplates {
    static shipmentUpdate(trackingNumber: string, status: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'>;
    static paymentConfirmation(amount: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'>;
    static newMessage(senderName: string, message: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'>;
    static promotionalOffer(title: string, description: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'>;
    static systemMaintenance(maintenanceTime: string): Pick<PushNotificationRequest, 'title' | 'body' | 'data'>;
}
export default PushNotificationService;
//# sourceMappingURL=push.service.d.ts.map