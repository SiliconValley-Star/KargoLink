import { ListQueryParams, SortOptions, DateRange } from '../types/common.types';

/**
 * Base request interface
 */
export interface BaseRequest {
  requestId?: string;
  timestamp?: string;
}

/**
 * Pagination request
 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
}

/**
 * Search request
 */
export interface SearchRequest {
  query?: string;
  filters?: Record<string, any>;
  sort?: SortOptions;
}

/**
 * List request with pagination and search
 */
export interface ListRequest extends PaginationRequest, SearchRequest {
  dateRange?: DateRange;
}

/**
 * Login request
 */
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

/**
 * Register request
 */
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

/**
 * Password reset request
 */
export interface PasswordResetRequest extends BaseRequest {
  email: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest extends BaseRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Verify email request
 */
export interface VerifyEmailRequest extends BaseRequest {
  token: string;
}

/**
 * Verify phone request
 */
export interface VerifyPhoneRequest extends BaseRequest {
  phone: string;
  code: string;
}

/**
 * Send SMS code request
 */
export interface SendSMSCodeRequest extends BaseRequest {
  phone: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest extends BaseRequest {
  refreshToken: string;
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest extends BaseRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

/**
 * Create address request
 */
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

/**
 * Update address request
 */
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string;
}

/**
 * Get quotes request
 */
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

/**
 * Create quote request (for carriers)
 */
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

/**
 * Accept quote request
 */
export interface AcceptQuoteRequest extends BaseRequest {
  quoteId: string;
  paymentMethodId?: string;
}

/**
 * Update shipment status request
 */
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

/**
 * Track shipment request
 */
export interface TrackShipmentRequest extends BaseRequest {
  trackingNumber: string;
}

/**
 * File upload request
 */
export interface FileUploadRequest extends BaseRequest {
  file: File | Buffer;
  fileName: string;
  mimeType: string;
  category: 'avatar' | 'document' | 'shipment' | 'vehicle' | 'other';
  isPublic?: boolean;
}

/**
 * Bulk operation request
 */
export interface BulkOperationRequest<T> extends BaseRequest {
  operations: T[];
  validateOnly?: boolean;
}

/**
 * Export data request
 */
export interface ExportDataRequest extends BaseRequest {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange?: DateRange;
  filters?: Record<string, any>;
  columns?: string[];
}

/**
 * Webhook request
 */
export interface WebhookRequest extends BaseRequest {
  event: string;
  data: Record<string, any>;
  signature?: string;
}

/**
 * Generic create request
 */
export interface CreateRequest<T> extends BaseRequest {
  data: T;
}

/**
 * Generic update request
 */
export interface UpdateRequest<T> extends BaseRequest {
  id: string;
  data: Partial<T>;
}

/**
 * Generic delete request
 */
export interface DeleteRequest extends BaseRequest {
  id: string;
  reason?: string;
  hardDelete?: boolean;
}

/**
 * Batch request
 */
export interface BatchRequest<T> extends BaseRequest {
  requests: T[];
  continueOnError?: boolean;
}