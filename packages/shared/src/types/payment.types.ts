import { BaseEntity, ID, Money } from './common.types';

/**
 * Payment methods supported by the platform
 */
export type PaymentMethod = 
  | 'credit_card'      // Kredi kartı
  | 'debit_card'       // Banka kartı
  | 'bank_transfer'    // Banka havalesi
  | 'mobile_payment'   // Mobil ödeme (Papara, İninal vs.)
  | 'digital_wallet'   // Dijital cüzdan
  | 'cash_on_delivery' // Kapıda ödeme
  | 'corporate_account' // Kurumsal hesap
  | 'installment'      // Taksit
  | 'crypto';          // Kripto para

/**
 * Payment status throughout the lifecycle
 */
export type PaymentStatus = 
  | 'pending'          // Beklemede
  | 'processing'       // İşleniyor
  | 'completed'        // Tamamlandı
  | 'failed'           // Başarısız
  | 'cancelled'        // İptal edildi
  | 'refunded'         // İade edildi
  | 'partially_refunded' // Kısmi iade
  | 'disputed'         // İhtilafta
  | 'expired';         // Süresi doldu

/**
 * Payment providers/gateways
 */
export type PaymentProvider = 
  | 'iyzico'           // İyzico
  | 'paytr'            // PayTR
  | 'stripe'           // Stripe (international)
  | 'paypal'           // PayPal
  | 'masterpass'       // Masterpass
  | 'bkm_express'      // BKM Express
  | 'garanti_pay'      // Garanti Pay
  | 'akbank_pay'       // Akbank Pay
  | 'yapay'            // Yapı Kredi Pay
  | 'halkbank_pay';    // Halkbank Pay

/**
 * Card information (tokenized)
 */
export interface PaymentCard {
  id: ID;
  userId: ID;
  token: string;          // Tokenized card number
  maskedNumber: string;   // **** **** **** 1234
  brand: 'visa' | 'mastercard' | 'amex' | 'troy' | 'other';
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  nickname?: string;      // "İş kartım", "Kişisel kart" vs.
  createdAt: string;
  lastUsedAt?: string;
  
  // Provider specific info
  providerToken?: string;
  providerId: PaymentProvider;
  
  // Security
  cvcToken?: string;      // Tokenized CVC
  billingAddress?: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

/**
 * Bank account for bank transfers
 */
export interface BankAccount {
  id: ID;
  userId: ID;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  iban: string;
  accountHolder: string;
  nickname?: string;
  isDefault: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Payment transaction
 */
export interface Payment extends BaseEntity {
  // Basic Information
  transactionId: string;
  referenceNumber?: string;
  
  // Related Entities
  shipmentId?: ID;
  userId: ID;
  
  // Amount & Currency
  amount: Money;
  originalAmount?: Money; // If currency conversion happened
  exchangeRate?: number;
  
  // Payment Details
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  
  // Provider Information
  providerTransactionId?: string;
  providerReferenceId?: string;
  providerStatus?: string;
  
  // Payment Instrument
  cardId?: ID;
  card?: PaymentCard;
  bankAccountId?: ID;
  bankAccount?: BankAccount;
  
  // Installment Information
  installmentCount?: number;
  installmentAmount?: Money;
  
  // Fees & Costs
  fees: {
    platform: Money;      // Platform commission
    provider: Money;      // Payment provider fee
    bank: Money;          // Bank charges
    total: Money;         // Total fees
  };
  
  // Net amounts
  grossAmount: Money;     // amount + fees
  netAmount: Money;       // amount - platform_commission
  
  // Timing
  paidAt?: string;
  processedAt?: string;
  settledAt?: string;
  expiresAt?: string;
  
  // Security
  ipAddress?: string;
  userAgent?: string;
  
  // Customer Information
  billingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    country: string;
    postalCode: string;
  };
  
  // Refund Information
  refunds: PaymentRefund[];
  refundableAmount: Money;
  
  // Fraud & Security
  riskScore?: number;
  fraudCheck?: {
    passed: boolean;
    score: number;
    reasons?: string[];
  };
  
  // 3D Secure
  threeDS?: {
    enabled: boolean;
    version?: string;
    status?: 'success' | 'failed' | 'not_applicable';
    authenticationValue?: string;
  };
  
  // Additional Information
  description?: string;
  metadata?: Record<string, any>;
  
  // Failure Information
  failureReason?: string;
  failureCode?: string;
  
  // Reconciliation
  reconciled: boolean;
  reconciledAt?: string;
  bankStatementReference?: string;
}

/**
 * Payment refund
 */
export interface PaymentRefund extends BaseEntity {
  paymentId: ID;
  amount: Money;
  reason: string;
  status: PaymentStatus;
  
  // Provider Information
  providerRefundId?: string;
  
  // Timing
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  
  // Initiator
  initiatedBy: ID; // User or admin who initiated refund
  autoRefund: boolean; // Was it automatically processed?
  
  // Additional
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Payment intent (for pre-authorization)
 */
export interface PaymentIntent extends BaseEntity {
  amount: Money;
  method: PaymentMethod;
  provider: PaymentProvider;
  status: 'created' | 'confirmed' | 'cancelled' | 'expired';
  
  // Related
  userId: ID;
  shipmentId?: ID;
  
  // Client secret for frontend
  clientSecret: string;
  
  // Configuration
  captureMethod: 'automatic' | 'manual';
  confirmationMethod: 'automatic' | 'manual';
  
  // Payment method details
  paymentMethodId?: ID;
  
  // Expiration
  expiresAt: string;
  
  // Confirmation
  confirmedAt?: string;
  capturedAt?: string;
  
  // Additional
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Installment plan
 */
export interface InstallmentPlan {
  bankName: string;
  cardType: 'credit' | 'debit';
  installments: {
    count: number;
    rate: number;        // Interest rate
    monthlyAmount: Money;
    totalAmount: Money;
    available: boolean;
  }[];
}

/**
 * Payment method configuration
 */
export interface PaymentMethodConfig {
  method: PaymentMethod;
  provider: PaymentProvider;
  enabled: boolean;
  
  // Limits
  minAmount?: Money;
  maxAmount?: Money;
  dailyLimit?: Money;
  monthlyLimit?: Money;
  
  // Fees
  fixedFee?: Money;
  percentageFee?: number;
  
  // Features
  supports3DS: boolean;
  supportsInstallment: boolean;
  supportsRefund: boolean;
  supportsPartialRefund: boolean;
  
  // Timing
  settlementDays: number;
  
  // Configuration
  config: Record<string, any>;
  
  // Availability
  availableCountries: string[];
  availableCurrencies: string[];
}

/**
 * Wallet/balance for users
 */
export interface Wallet extends BaseEntity {
  userId: ID;
  balance: Money;
  
  // Limits
  dailySpendLimit: Money;
  monthlySpendLimit: Money;
  
  // Status
  isActive: boolean;
  isFrozen: boolean;
  frozenReason?: string;
  frozenAt?: string;
  
  // Verification
  isVerified: boolean;
  verifiedAt?: string;
  verificationLevel: 'basic' | 'enhanced' | 'full';
}

/**
 * Wallet transaction
 */
export interface WalletTransaction extends BaseEntity {
  walletId: ID;
  userId: ID;
  
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee' | 'commission';
  amount: Money;
  balanceAfter: Money;
  
  // Related
  paymentId?: ID;
  shipmentId?: ID;
  
  // Description
  description: string;
  reference?: string;
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  processedAt?: string;
  
  // Additional
  metadata?: Record<string, any>;
}

/**
 * Payment request for creating new payment
 */
export interface CreatePaymentRequest {
  amount: Money;
  method: PaymentMethod;
  provider?: PaymentProvider;
  
  // Related entities
  shipmentId?: ID;
  
  // Payment method details
  cardId?: ID;
  bankAccountId?: ID;
  
  // New payment method data
  cardData?: {
    number: string;
    expiryMonth: number;
    expiryYear: number;
    cvc: string;
    holderName: string;
  };
  
  // Installment
  installmentCount?: number;
  
  // Customer info
  billingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    country: string;
    postalCode: string;
  };
  
  // Additional options
  saveCard?: boolean;
  description?: string;
  returnUrl?: string; // For redirects
  webhookUrl?: string; // For callbacks
  metadata?: Record<string, any>;
}

/**
 * Payment creation response
 */
export interface PaymentCreationResponse {
  payment: Payment;
  requiresAction?: boolean;
  actionUrl?: string;
  actionData?: Record<string, any>;
  clientSecret?: string;
}

/**
 * Payout to carriers
 */
export interface Payout extends BaseEntity {
  carrierId: ID;
  amount: Money;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Period
  periodStart: string;
  periodEnd: string;
  
  // Breakdown
  breakdown: {
    grossEarnings: Money;
    platformCommission: Money;
    fees: Money;
    adjustments: Money;
    netAmount: Money;
  };
  
  // Bank details
  bankAccount: {
    accountHolder: string;
    bankName: string;
    iban: string;
    swift?: string;
  };
  
  // Provider details
  provider: PaymentProvider;
  providerPayoutId?: string;
  
  // Timing
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  expectedAt?: string; // When carrier should receive money
  
  // Failure
  failureReason?: string;
  
  // Documentation
  invoiceUrl?: string;
  receiptUrl?: string;
  
  // Related shipments
  shipmentIds: ID[];
}