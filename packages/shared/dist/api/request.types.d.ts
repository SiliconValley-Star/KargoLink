import { SortOptions, DateRange } from '../types/common.types';
export interface BaseRequest {
    requestId?: string;
    timestamp?: string;
}
export interface PaginationRequest {
    page?: number;
    limit?: number;
}
export interface SearchRequest {
    query?: string;
    filters?: Record<string, any>;
    sort?: SortOptions;
}
export interface ListRequest extends PaginationRequest, SearchRequest {
    dateRange?: DateRange;
}
export interface LoginRequest extends BaseRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    deviceInfo?: {
        deviceId: string;
        platform: 'web' | 'mobile' | 'desktop';
        userAgent?: string;
    };
}
export interface RegisterRequest extends BaseRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'customer' | 'carrier';
    accountType: 'individual' | 'business';
    termsAccepted: boolean;
    marketingConsent?: boolean;
    referralCode?: string;
}
export interface PasswordResetRequest extends BaseRequest {
    email: string;
}
export interface ChangePasswordRequest extends BaseRequest {
    currentPassword: string;
    newPassword: string;
}
export interface VerifyEmailRequest extends BaseRequest {
    token: string;
}
export interface VerifyPhoneRequest extends BaseRequest {
    phone: string;
    code: string;
}
export interface SendSMSCodeRequest extends BaseRequest {
    phone: string;
}
export interface RefreshTokenRequest extends BaseRequest {
    refreshToken: string;
}
export interface UpdateProfileRequest extends BaseRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
}
export interface CreateAddressRequest extends BaseRequest {
    title: string;
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    neighborhood?: string;
    postalCode: string;
    country: string;
    phone: string;
    email?: string;
    isDefault?: boolean;
}
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
    id: string;
}
export interface GetQuotesRequest extends BaseRequest {
    pickupCity: string;
    deliveryCity: string;
    weight: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    serviceType: 'standard' | 'express' | 'same_day' | 'next_day';
    specialServices?: string[];
    declaredValue?: number;
}
export interface CreateQuoteRequest extends BaseRequest {
    shipmentId: string;
    baseCost: number;
    currency: string;
    serviceType: 'standard' | 'express' | 'same_day' | 'next_day';
    estimatedPickupDate: string;
    estimatedDeliveryDate: string;
    notes?: string;
    validUntil: string;
}
export interface AcceptQuoteRequest extends BaseRequest {
    quoteId: string;
    paymentMethodId?: string;
}
export interface UpdateShipmentStatusRequest extends BaseRequest {
    status: string;
    location?: {
        name: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    notes?: string;
    images?: string[];
}
export interface TrackShipmentRequest extends BaseRequest {
    trackingNumber: string;
}
export interface FileUploadRequest extends BaseRequest {
    file: File | Buffer;
    fileName: string;
    mimeType: string;
    category: 'avatar' | 'document' | 'shipment' | 'vehicle' | 'other';
    isPublic?: boolean;
}
export interface BulkOperationRequest<T> extends BaseRequest {
    operations: T[];
    validateOnly?: boolean;
}
export interface ExportDataRequest extends BaseRequest {
    format: 'csv' | 'xlsx' | 'pdf';
    dateRange?: DateRange;
    filters?: Record<string, any>;
    columns?: string[];
}
export interface WebhookRequest extends BaseRequest {
    event: string;
    data: Record<string, any>;
    signature?: string;
}
export interface CreateRequest<T> extends BaseRequest {
    data: T;
}
export interface UpdateRequest<T> extends BaseRequest {
    id: string;
    data: Partial<T>;
}
export interface DeleteRequest extends BaseRequest {
    id: string;
    reason?: string;
    hardDelete?: boolean;
}
export interface BatchRequest<T> extends BaseRequest {
    requests: T[];
    continueOnError?: boolean;
}
//# sourceMappingURL=request.types.d.ts.map