export declare enum CargoServiceProvider {
    PTT = "ptt",
    YURTICI = "yurtici",
    ARAS = "aras",
    MNG = "mng",
    SURAT = "surat",
    UPS = "ups",
    DHL = "dhl",
    FEDEX = "fedex",
    TNT = "tnt",
    CEVA = "ceva",
    TNT_EXPRESS = "tnt_express",
    SF_EXPRESS = "sf_express",
    DB_SCHENKER = "db_schenker",
    MAERSK = "maersk",
    JAPAN_POST = "japan_post",
    ROYAL_MAIL = "royal_mail",
    HERMES = "hermes",
    DPKG = "dpkg",
    CHRONOPOST = "chronopost",
    CORREOS = "correos"
}
export declare enum CargoServiceType {
    STANDARD = "standard",
    EXPRESS = "express",
    OVERNIGHT = "overnight",
    ECONOMY = "economy",
    PREMIUM = "premium"
}
export declare enum CargoPackageType {
    DOCUMENT = "document",
    PACKAGE = "package",
    ENVELOPE = "envelope",
    BOX = "box",
    TUBE = "tube",
    PAK = "pak"
}
export interface CargoAddress {
    country: string;
    city: string;
    district: string;
    neighborhood?: string;
    postalCode: string;
    address: string;
    fullName: string;
    phone: string;
    email?: string;
}
export interface CargoPackage {
    width: number;
    height: number;
    length: number;
    weight: number;
    value: number;
    description: string;
    type: CargoPackageType;
    quantity: number;
}
export interface QuoteRequest {
    fromAddress: CargoAddress;
    toAddress: CargoAddress;
    packages: CargoPackage[];
    serviceType?: CargoServiceType;
    pickupDate?: string;
    deliveryDate?: string;
    specialServices?: SpecialService[];
    insuranceValue?: number;
    codAmount?: number;
}
export interface SpecialService {
    type: 'insurance' | 'cod' | 'signature' | 'weekend_delivery' | 'priority';
    value?: number;
    description?: string;
}
export interface CargoQuoteResponse {
    success: boolean;
    provider: CargoServiceProvider;
    quotes: CargoQuote[];
    error?: string;
    requestId?: string;
    timestamp: string;
}
export interface CargoQuote {
    id: string;
    provider: CargoServiceProvider;
    serviceName: string;
    serviceType: CargoServiceType;
    price: Price;
    estimatedDeliveryDays: number;
    estimatedPickupDate?: string;
    estimatedDeliveryDate?: string;
    features: CargoQuoteFeature[];
    restrictions?: string[];
    validUntil: string;
    trackingCapable: boolean;
    insuranceIncluded: boolean;
    codSupported: boolean;
}
export interface Price {
    basePrice: number;
    taxAmount: number;
    fuelSurcharge?: number;
    additionalFees: AdditionalFee[];
    totalPrice: number;
    currency: 'TRY';
}
export interface AdditionalFee {
    name: string;
    amount: number;
    description?: string;
}
export interface CargoQuoteFeature {
    name: string;
    description: string;
    included: boolean;
    additionalCost?: number;
}
export interface TrackingRequest {
    trackingNumber: string;
    provider: CargoServiceProvider;
}
export interface CargoTrackingResponse {
    success: boolean;
    provider: CargoServiceProvider;
    trackingNumber: string;
    status: TrackingStatus;
    events: CargoTrackingEvent[];
    currentLocation?: string;
    estimatedDeliveryDate?: string;
    actualDeliveryDate?: string;
    error?: string;
    timestamp: string;
}
export declare enum TrackingStatus {
    CREATED = "created",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    EXCEPTION = "exception",
    RETURNED = "returned"
}
export interface CargoTrackingEvent {
    timestamp: string;
    status: TrackingStatus;
    location: string;
    description: string;
    notes?: string;
}
export interface ShipmentCreateRequest {
    fromAddress: CargoAddress;
    toAddress: CargoAddress;
    packages: CargoPackage[];
    serviceType: CargoServiceType;
    selectedQuoteId: string;
    pickupDate?: string;
    specialInstructions?: string;
    references?: ShipmentReference[];
    notifications?: NotificationPreferences;
}
export interface ShipmentReference {
    type: 'invoice' | 'po' | 'customer' | 'internal';
    value: string;
}
export interface NotificationPreferences {
    email?: string;
    sms?: string;
    notifyOnPickup: boolean;
    notifyOnDelivery: boolean;
    notifyOnException: boolean;
}
export interface ShipmentCreateResponse {
    success: boolean;
    provider: CargoServiceProvider;
    shipment?: CreatedShipment;
    error?: string;
    timestamp: string;
}
export interface CreatedShipment {
    trackingNumber: string;
    provider: CargoServiceProvider;
    serviceType: CargoServiceType;
    status: TrackingStatus;
    createdAt: string;
    estimatedPickupDate?: string;
    estimatedDeliveryDate?: string;
    totalCost: number;
    currency: 'TRY';
    labels?: ShipmentLabel[];
}
export interface ShipmentLabel {
    format: 'PDF' | 'PNG' | 'ZPL';
    size: 'A4' | '4x6' | '6x8';
    url?: string;
    content?: string;
}
export interface CargoServiceConfig {
    provider: CargoServiceProvider;
    name: string;
    apiEndpoint: string;
    apiKey: string;
    apiSecret?: string;
    username?: string;
    password?: string;
    sandbox: boolean;
    enabled: boolean;
    supportedServices: CargoServiceType[];
    supportedCountries: string[];
    maxWeight: number;
    maxDimensions: {
        width: number;
        height: number;
        length: number;
    };
    features: {
        tracking: boolean;
        insurance: boolean;
        cod: boolean;
        signature: boolean;
        weekendDelivery: boolean;
    };
    rateLimits: {
        requestsPerMinute: number;
        requestsPerHour: number;
    };
}
export interface CargoServiceError {
    code: string;
    message: string;
    provider: CargoServiceProvider;
    originalError?: any;
    retryable: boolean;
    timestamp: string;
}
export declare enum CargoErrorCode {
    CONNECTION_FAILED = "CONNECTION_FAILED",
    TIMEOUT = "TIMEOUT",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    API_KEY_EXPIRED = "API_KEY_EXPIRED",
    INVALID_ADDRESS = "INVALID_ADDRESS",
    UNSUPPORTED_SERVICE = "UNSUPPORTED_SERVICE",
    PACKAGE_TOO_HEAVY = "PACKAGE_TOO_HEAVY",
    PACKAGE_TOO_LARGE = "PACKAGE_TOO_LARGE",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    NO_QUOTES_AVAILABLE = "NO_QUOTES_AVAILABLE",
    QUOTE_EXPIRED = "QUOTE_EXPIRED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    PARSING_ERROR = "PARSING_ERROR"
}
export type CargoServiceResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: CargoServiceError;
};
export interface YurticiConfig extends CargoServiceConfig {
    provider: CargoServiceProvider.YURTICI;
    customerId?: string;
}
export interface ArasConfig extends CargoServiceConfig {
    provider: CargoServiceProvider.ARAS;
    merchantId?: string;
}
export interface MngConfig extends CargoServiceConfig {
    provider: CargoServiceProvider.MNG;
    customerId?: string;
}
//# sourceMappingURL=cargo-service.types.d.ts.map