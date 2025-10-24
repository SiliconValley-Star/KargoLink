// Auth types (excluding User to avoid conflict)
export type {
  AuthTokens,
  AuthState,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyPhoneRequest,
  UpdateProfileRequest,
  JWTPayload,
  LoginResponse,
  RegisterResponse,
  AuthResponse
} from './types/auth';

// User types (primary User interface)
export * from './types/user.types';

// Common types (primary Address interface)
export * from './types/common.types';

// Cargo service types
export * from './types/cargo-service.types';

// Import types for later use
import type { Address } from './types/auth';

// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Shipment types
export interface Shipment {
  id: string;
  trackingNumber: string;
  senderId: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  originAddress: Address;
  destinationAddress: Address;
  packageDetails: PackageDetails;
  selectedCarrier: CarrierQuote;
  status: ShipmentStatus;
  totalCost: number;
  paymentStatus: PaymentStatus;
  estimatedDelivery: string;
  actualDelivery?: string;
  notes?: string;
  insuranceValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageDetails {
  type: PackageType;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  description: string;
  quantity: number;
  specialRequirements?: SpecialRequirement[];
}

export enum PackageType {
  DOCUMENT = 'DOCUMENT',
  PARCEL = 'PARCEL',
  FOOD = 'FOOD',
  FRAGILE = 'FRAGILE',
  LIQUID = 'LIQUID',
  ELECTRONICS = 'ELECTRONICS',
  TEXTILE = 'TEXTILE',
  AUTOMOTIVE = 'AUTOMOTIVE',
  INDUSTRIAL = 'INDUSTRIAL',
  OTHER = 'OTHER',
}

export enum SpecialRequirement {
  COLD_CHAIN = 'COLD_CHAIN',
  FRAGILE_HANDLING = 'FRAGILE_HANDLING',
  EXPRESS_DELIVERY = 'EXPRESS_DELIVERY',
  INSURANCE_REQUIRED = 'INSURANCE_REQUIRED',
  SIGNATURE_REQUIRED = 'SIGNATURE_REQUIRED',
  WEEKEND_DELIVERY = 'WEEKEND_DELIVERY',
  MORNING_DELIVERY = 'MORNING_DELIVERY',
  EVENING_DELIVERY = 'EVENING_DELIVERY',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  QUOTED = 'QUOTED',
  BOOKED = 'BOOKED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
}

// Carrier types
export interface Carrier {
  id: string;
  name: string;
  code: string;
  type: CarrierType;
  logo?: string;
  isActive: boolean;
  supportedServices: CarrierService[];
  coverageAreas: string[];
  website?: string;
  contactInfo?: ContactInfo;
  rating?: number;
  reviewCount?: number;
}

export enum CarrierType {
  CORPORATE = 'CORPORATE',
  INDIVIDUAL = 'INDIVIDUAL',
  PARTNER = 'PARTNER',
}

export interface CarrierService {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  estimatedDays: {
    min: number;
    max: number;
  };
  features: string[];
}

export enum ServiceType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  OVERNIGHT = 'OVERNIGHT',
  SAME_DAY = 'SAME_DAY',
  INTERNATIONAL = 'INTERNATIONAL',
}

export interface ContactInfo {
  phone: string;
  email: string;
  address?: Address;
  workingHours?: string;
}

export interface CarrierQuote {
  carrierId: string;
  carrierName: string;
  service: CarrierService;
  price: number;
  currency: string;
  estimatedDelivery: string;
  insuranceIncluded: boolean;
  insuranceValue?: number;
  features: string[];
  validUntil: string;
}

// Tracking types
export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  description: string;
  location?: Address;
  timestamp: string;
  carrierNote?: string;
}

export interface TrackingInfo {
  shipmentId: string;
  trackingNumber: string;
  currentStatus: ShipmentStatus;
  estimatedDelivery: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  carrierTrackingUrl?: string;
}

// Payment types
export interface Payment {
  id: string;
  shipmentId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerTransactionId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum PaymentProvider {
  IYZICO = 'IYZICO',
  PAYTR = 'PAYTR',
  STRIPE = 'STRIPE',
  INTERNAL = 'INTERNAL',
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  SHIPMENT_UPDATE = 'SHIPMENT_UPDATE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  DELIVERY_REMINDER = 'DELIVERY_REMINDER',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
}

// Validation schemas (basic interfaces for now)
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Constants
export const CURRENCY = {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export const WEIGHT_UNITS = {
  KG: 'kg',
  G: 'g',
  LB: 'lb',
} as const;

export const DIMENSION_UNITS = {
  CM: 'cm',
  M: 'm',
  IN: 'in',
  FT: 'ft',
} as const;

// Address interface for shipment creation
export interface ShipmentAddress {
  street: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ShipmentCreateResponse {
  shipment: Shipment;
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface PaymentRequest {
  shipmentId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardHolderName: string;
  };
}

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  errorMessage?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface RefundResponse {
  refundId: string;
  status: 'SUCCESS' | 'FAILED';
  amount: number;
  processedAt: string;
}

export interface PaymentWebhook {
  eventType: string;
  paymentId: string;
  status: PaymentStatus;
  timestamp: string;
  data: Record<string, any>;
}

export interface InstallmentInfo {
  installmentNumber: number;
  totalAmount: number;
  installmentAmount: number;
  interestRate: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}


// Service aliases for backward compatibility
export type ServicePaymentProvider = PaymentProvider;
export type ServiceCurrency = typeof CURRENCY[keyof typeof CURRENCY];
export type ServicePaymentMethod = PaymentMethod;

// Export UI Components, Theme System, Animation System, and Performance Utils
export * from './components/index';
export * from './animations/index';
export * from './utils/performance';