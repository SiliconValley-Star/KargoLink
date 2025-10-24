import { Server as HTTPServer } from 'http';
import { ShipmentStatus } from '@cargolink/shared';
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
declare class WebSocketService {
    private io;
    private connectedUsers;
    private userSubscriptions;
    initialize(httpServer: HTTPServer): void;
    private setupMiddleware;
    private setupEventHandlers;
    private handleConnection;
    private handleShipmentSubscription;
    private handleShipmentUnsubscription;
    private handleLocationUpdate;
    private handleDriverStatusUpdate;
    private handleDisconnection;
    broadcastTrackingUpdate(shipmentId: string, update: TrackingUpdate): void;
    broadcastStatusChange(shipmentId: string, status: ShipmentStatus, message?: string): void;
    sendNotificationToUser(userId: string, notification: {
        type: string;
        title: string;
        message: string;
        data?: any;
    }): void;
    private sendCurrentShipmentStatus;
    private getAddressFromCoordinates;
    private mapDriverStatusToShipmentStatus;
    private authenticateSocketToken;
    private getStatusMessage;
    getConnectionStats(): {
        connectedUsers: number;
        totalSubscriptions: number;
        activeRooms: number;
    };
}
export declare const webSocketService: WebSocketService;
export {};
//# sourceMappingURL=websocket.service.d.ts.map