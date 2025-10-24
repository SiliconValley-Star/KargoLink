/**
 * Payment Service Integration Types
 * For İyzico, PayTR and other payment gateways
 */

import { PaymentMethod, PaymentProvider, PaymentStatus } from './payment.types';
import { Currency } from './common.types';

// =============================================================================
// SERVICE-SPECIFIC ENUMS
// =============================================================================

export enum ServicePaymentProvider {
  IYZICO = 'iyzico',
  PAYTR = 'paytr',
  STRIPE = 'stripe',
  PAYPAL = 'paypal'
}

export enum ServicePaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CASH_ON_DELIVERY = 'cash_on_delivery'
}

export enum ServicePaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum ServiceCurrency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

export enum RefundReason {
  CUSTOMER_REQUEST = 'customer_request',
  SHIPMENT_CANCELLED = 'shipment_cancelled',
  SERVICE_ISSUE = 'service_issue',
  FRAUD_PREVENTION = 'fraud_prevention',
  DUPLICATE_PAYMENT = 'duplicate_payment'
}

// =============================================================================
// PAYMENT REQUEST & RESPONSE INTERFACES
// =============================================================================

export interface PaymentRequest {
  // Order Information
  orderId: string;
  amount: number;
  currency: ServiceCurrency;
  description: string;
  
  // Customer Information
  customer: PaymentCustomer;
  
  // Billing & Shipping Address
  billingAddress: PaymentAddress;
  shippingAddress?: PaymentAddress;
  
  // Basket Items (for detailed payment tracking)
  basketItems: PaymentBasketItem[];
  
  // Payment Options
  paymentMethod?: ServicePaymentMethod;
  installmentCount?: number; // Taksit sayısı
  paymentGroup?: string; // İyzico payment group
  
  // Callback URLs
  successUrl: string;
  failureUrl: string;
  
  // Webhook URL for payment notifications
  webhookUrl?: string;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  provider: ServicePaymentProvider;
  
  // Payment Information
  paymentId: string;
  orderId: string;
  status: ServicePaymentStatus;
  amount: number;
  currency: ServiceCurrency;
  
  // Provider Specific
  providerPaymentId?: string;
  providerResponse?: any;
  
  // Payment URL (for redirect-based payments)
  paymentUrl?: string;
  
  // 3D Secure Information
  threeDSecure?: {
    required: boolean;
    redirectUrl?: string;
    htmlContent?: string;
  };
  
  // Error Information
  error?: PaymentError;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paidAt?: string;
  processedAt?: string;
}

export interface PaymentCustomer {
  id?: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  identityNumber?: string; // TC Kimlik No
  registrationDate?: string;
  lastLoginDate?: string;
}

export interface PaymentAddress {
  contactName: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
  country: string;
}

export interface PaymentBasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: 'PHYSICAL' | 'VIRTUAL';
  unitPrice: number;
  quantity: number;
  subMerchantKey?: string;
  subMerchantPrice?: number;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

// =============================================================================
// WEBHOOK & NOTIFICATION INTERFACES
// =============================================================================

export interface PaymentWebhook {
  provider: ServicePaymentProvider;
  eventType: PaymentWebhookEvent;
  paymentId: string;
  orderId: string;
  status: ServicePaymentStatus;
  amount: number;
  currency: ServiceCurrency;
  timestamp: string;
  signature?: string;
  rawData: any;
}

export enum PaymentWebhookEvent {
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_CANCELLED = 'payment.cancelled',
  REFUND_SUCCESS = 'refund.success',
  REFUND_FAILED = 'refund.failed',
  CHARGEBACK = 'chargeback'
}

// =============================================================================
// REFUND INTERFACES
// =============================================================================

export interface RefundRequest {
  paymentId: string;
  amount: number;
  currency: ServiceCurrency;
  reason: RefundReason;
  description?: string;
  metadata?: Record<string, any>;
}

export interface RefundResponse {
  success: boolean;
  provider: ServicePaymentProvider;
  refundId: string;
  paymentId: string;
  amount: number;
  currency: ServiceCurrency;
  status: ServicePaymentStatus;
  providerRefundId?: string;
  error?: PaymentError;
  createdAt: string;
}

// =============================================================================
// INSTALLMENT & COMMISSION INTERFACES
// =============================================================================

export interface InstallmentInfo {
  bankName: string;
  bankCode: string;
  cardType: 'CREDIT' | 'DEBIT';
  cardAssociation: 'VISA' | 'MASTERCARD' | 'AMEX' | 'TROY';
  installments: InstallmentOption[];
}

export interface InstallmentOption {
  count: number;
  interestRate: number;
  installmentPrice: number;
  totalPrice: number;
  bankCommissionRate?: number;
  merchantCommissionRate?: number;
}

export interface CommissionInfo {
  totalAmount: number;
  cargoAmount: number;
  platformCommissionRate: number;
  platformCommissionAmount: number;
  paymentProviderCommissionRate: number;
  paymentProviderCommissionAmount: number;
  netAmount: number; // Kargo firmasına gidecek miktar
}

// =============================================================================
// PAYMENT SERVICE CONFIGURATION
// =============================================================================

export interface PaymentServiceConfig {
  provider: ServicePaymentProvider;
  name: string;
  enabled: boolean;
  sandbox: boolean;
  
  // API Credentials
  apiKey: string;
  secretKey: string;
  merchantId?: string;
  
  // API Endpoints
  baseUrl: string;
  webhookUrl?: string;
  
  // Supported Features
  supportedCurrencies: ServiceCurrency[];
  supportedPaymentMethods: ServicePaymentMethod[];
  supports3DSecure: boolean;
  supportsInstallments: boolean;
  supportsRefunds: boolean;
  
  // Limits
  minAmount: number;
  maxAmount: number;
  maxInstallmentCount: number;
  
  // Commission & Pricing
  commissionRate: number; // Platform commission rate (e.g., 0.025 = 2.5%)
  fixedCommission?: number; // Fixed commission amount
  
  // Security
  webhookSecretKey?: string;
  allowedIPs?: string[];
  
  // Rate Limits
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// =============================================================================
// PROVIDER-SPECIFIC CONFIGURATIONS
// =============================================================================

export interface IyzicoConfig extends PaymentServiceConfig {
  provider: ServicePaymentProvider.IYZICO;
  conversationId?: string;
  locale?: 'tr' | 'en';
}

export interface PayTRConfig extends PaymentServiceConfig {
  provider: ServicePaymentProvider.PAYTR;
  merchantOid?: string;
  merchantOkUrl?: string;
  merchantFailUrl?: string;
  userBasket?: string;
  userIp?: string;
  timeoutLimit?: number;
  debugMode?: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type PaymentServiceResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: PaymentError;
};

// =============================================================================
// PAYMENT ANALYTICS & REPORTING
// =============================================================================

export interface PaymentAnalytics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalVolume: number;
  currency: ServiceCurrency;
  averageTransactionAmount: number;
  successRate: number;
  
  // By Payment Method
  paymentMethodBreakdown: {
    method: ServicePaymentMethod;
    count: number;
    volume: number;
  }[];
  
  // By Provider
  providerBreakdown: {
    provider: ServicePaymentProvider;
    count: number;
    volume: number;
    successRate: number;
  }[];
  
  // Commission Information
  totalCommissionEarned: number;
  averageCommissionRate: number;
  
  // Time Period
  periodStart: string;
  periodEnd: string;
}

export interface PaymentSummary {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: ServiceCurrency;
  status: ServicePaymentStatus;
  provider: ServicePaymentProvider;
  paymentMethod: ServicePaymentMethod;
  customerEmail: string;
  createdAt: string;
  paidAt?: string;
  refundedAmount?: number;
  commissionAmount: number;
}