import { Address, BaseEntity, Contact, Dimensions, FileInfo, ID, Money } from './common.types';
import { User } from './user.types';
export type ShipmentStatus = 'draft' | 'pending_quotes' | 'quotes_received' | 'carrier_selected' | 'payment_pending' | 'payment_completed' | 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delivery_failed' | 'returned' | 'cancelled' | 'dispute' | 'refunded';
export type PackageType = 'document' | 'package' | 'pallet' | 'bulk' | 'liquid' | 'vehicle' | 'furniture' | 'appliance' | 'other';
export type CargoCategory = 'general' | 'food' | 'pharmaceutical' | 'electronics' | 'textile' | 'automotive' | 'construction' | 'chemical' | 'hazardous' | 'fragile' | 'frozen' | 'fresh' | 'livestock' | 'artwork' | 'jewelry' | 'documents';
export type ServiceType = 'standard' | 'express' | 'same_day' | 'next_day' | 'scheduled' | 'white_glove';
export interface SpecialServices {
    coldChain: boolean;
    fragileHandling: boolean;
    insurance: boolean;
    signatureRequired: boolean;
    ageVerification: boolean;
    weekendDelivery: boolean;
    appointmentDelivery: boolean;
    assembly: boolean;
    unpacking: boolean;
    oldItemRemoval: boolean;
}
export interface Package {
    id: ID;
    description: string;
    packageType: PackageType;
    category: CargoCategory;
    dimensions: Dimensions;
    value: Money;
    quantity: number;
    barcode?: string;
    serialNumber?: string;
    images?: FileInfo[];
    specialInstructions?: string;
    requiresSpecialHandling: boolean;
}
export interface TimePreference {
    date: string;
    timeSlot?: {
        startTime: string;
        endTime: string;
    };
    isFlexible: boolean;
    alternatives?: string[];
}
export interface Quote extends BaseEntity {
    id: ID;
    shipmentId: ID;
    carrierId: ID;
    carrier: {
        id: ID;
        name: string;
        rating: number;
        logo?: string;
        isVerified: boolean;
        responseTime: number;
    };
    baseCost: Money;
    additionalCosts: {
        insurance?: Money;
        fuelSurcharge?: Money;
        specialServices?: Money;
        taxes?: Money;
    };
    totalCost: Money;
    serviceType: ServiceType;
    estimatedPickupDate: string;
    estimatedDeliveryDate: string;
    transitDays: number;
    termsAndConditions?: string;
    validUntil: string;
    notes?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    respondedAt?: string;
    trackingIncluded: boolean;
    insuranceIncluded: boolean;
    signatureRequired: boolean;
}
export interface TrackingEvent extends BaseEntity {
    shipmentId: ID;
    status: ShipmentStatus;
    title: string;
    description: string;
    location?: {
        name: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    timestamp: string;
    images?: FileInfo[];
    signature?: FileInfo;
    contactPerson?: Contact;
    metadata?: Record<string, any>;
}
export interface Shipment extends BaseEntity {
    trackingNumber: string;
    reference?: string;
    senderId: ID;
    sender: User;
    recipientId?: ID;
    recipient?: User;
    pickupAddress: Address;
    deliveryAddress: Address;
    packages: Package[];
    totalWeight: number;
    totalValue: Money;
    category: CargoCategory;
    serviceType: ServiceType;
    specialServices: SpecialServices;
    pickupPreference: TimePreference;
    deliveryPreference: TimePreference;
    estimatedPickupDate?: string;
    estimatedDeliveryDate?: string;
    actualPickupDate?: string;
    actualDeliveryDate?: string;
    selectedCarrierId?: ID;
    selectedCarrier?: User;
    selectedQuoteId?: ID;
    selectedQuote?: Quote;
    quotes: Quote[];
    status: ShipmentStatus;
    trackingEvents: TrackingEvent[];
    totalCost?: Money;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentId?: string;
    paidAt?: string;
    instructions?: string;
    notes?: string;
    customerNotes?: string;
    internalNotes?: string;
    invoices: FileInfo[];
    packingList?: FileInfo;
    customsDeclaration?: FileInfo;
    otherDocuments: FileInfo[];
    insuranceValue?: Money;
    insurancePolicyNumber?: string;
    claimId?: ID;
    customerRating?: number;
    carrierRating?: number;
    customerReview?: string;
    carrierReview?: string;
    cancellationReason?: string;
    cancelledBy?: ID;
    cancelledAt?: string;
    returnReason?: string;
    returnedAt?: string;
    requiresCustoms: boolean;
    customsValue?: Money;
    commodityCode?: string;
    exportLicense?: string;
}
export interface CreateShipmentRequest {
    reference?: string;
    recipientId?: ID;
    pickupAddress: Partial<Address>;
    deliveryAddress: Partial<Address>;
    packages: Omit<Package, 'id'>[];
    category: CargoCategory;
    serviceType: ServiceType;
    specialServices: Partial<SpecialServices>;
    pickupPreference: TimePreference;
    deliveryPreference: TimePreference;
    instructions?: string;
    requiresCustoms?: boolean;
    customsValue?: Money;
    commodityCode?: string;
}
export interface UpdateShipmentRequest {
    reference?: string;
    packages?: Omit<Package, 'id'>[];
    serviceType?: ServiceType;
    specialServices?: Partial<SpecialServices>;
    pickupPreference?: TimePreference;
    deliveryPreference?: TimePreference;
    instructions?: string;
    customerNotes?: string;
}
export interface ShipmentFilters {
    status?: ShipmentStatus[];
    serviceType?: ServiceType[];
    category?: CargoCategory[];
    carrierId?: ID;
    senderId?: ID;
    recipientId?: ID;
    pickupCity?: string[];
    deliveryCity?: string[];
    dateRange?: {
        startDate: string;
        endDate: string;
    };
    valueRange?: {
        min: number;
        max: number;
        currency: string;
    };
    trackingNumber?: string;
    reference?: string;
}
export interface ShipmentStats {
    total: number;
    byStatus: Record<ShipmentStatus, number>;
    byCategory: Record<CargoCategory, number>;
    byServiceType: Record<ServiceType, number>;
    totalValue: Money;
    averageTransitTime: number;
    onTimeDeliveryRate: number;
    customerSatisfaction: number;
}
export interface DeliveryAttempt extends BaseEntity {
    shipmentId: ID;
    attemptNumber: number;
    scheduledDate: string;
    actualDate?: string;
    status: 'scheduled' | 'successful' | 'failed' | 'rescheduled';
    failureReason?: string;
    recipientNote?: string;
    carrierNote?: string;
    signature?: FileInfo;
    photos?: FileInfo[];
    location?: {
        latitude: number;
        longitude: number;
    };
    contactAttempts: {
        method: 'phone' | 'email' | 'sms' | 'doorbell';
        timestamp: string;
        successful: boolean;
        note?: string;
    }[];
}
export interface ShipmentNotification extends BaseEntity {
    shipmentId: ID;
    userId: ID;
    type: 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delivery_failed' | 'delayed';
    title: string;
    message: string;
    channels: ('push' | 'email' | 'sms')[];
    sentAt?: string;
    readAt?: string;
    clickedAt?: string;
}
//# sourceMappingURL=shipment.types.d.ts.map