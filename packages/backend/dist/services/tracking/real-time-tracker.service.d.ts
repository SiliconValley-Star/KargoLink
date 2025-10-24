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
export declare enum TrackingStatus {
    CREATED = "created",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    AT_HUB = "at_hub",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    FAILED_DELIVERY = "failed_delivery",
    RETURNED = "returned",
    CANCELLED = "cancelled",
    EXCEPTION = "exception"
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
declare class RealTimeTracker {
    private wsService;
    private notificationService;
    private activeSubscriptions;
    private driverLocations;
    constructor();
    private initializeEventHandlers;
    private handleTrackingSubscription;
    private handleTrackingUnsubscription;
    private handleClientDisconnect;
    broadcastTrackingUpdate(update: TrackingUpdate): Promise<void>;
    updateDriverLocation(locationUpdate: LocationUpdate): Promise<void>;
    private getCurrentTrackingStatus;
    private sendTrackingNotification;
    private generateNotificationMessage;
    getTrackingAnalytics(): Promise<{
        activeSubscriptions: number;
        totalTrackingNumbers: number;
        statusDistribution: Record<string, number>;
        recentUpdates: TrackingUpdate[];
    }>;
    healthCheck(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        connections: number;
        subscriptions: number;
        cache: boolean;
    }>;
}
declare const _default: RealTimeTracker;
export default _default;
export { RealTimeTracker };
//# sourceMappingURL=real-time-tracker.service.d.ts.map