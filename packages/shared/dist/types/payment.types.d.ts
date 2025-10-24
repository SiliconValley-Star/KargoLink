import { BaseEntity, ID, Money } from './common.types';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'mobile_payment' | 'digital_wallet' | 'cash_on_delivery' | 'corporate_account' | 'installment' | 'crypto';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded' | 'disputed' | 'expired';
export type PaymentProvider = 'iyzico' | 'paytr' | 'stripe' | 'paypal' | 'masterpass' | 'bkm_express' | 'garanti_pay' | 'akbank_pay' | 'yapay' | 'halkbank_pay';
export interface PaymentCard {
    id: ID;
    userId: ID;
    token: string;
    maskedNumber: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'troy' | 'other';
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    isDefault: boolean;
    nickname?: string;
    createdAt: string;
    lastUsedAt?: string;
    providerToken?: string;
    providerId: PaymentProvider;
    cvcToken?: string;
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
export interface Payment extends BaseEntity {
    transactionId: string;
    referenceNumber?: string;
    shipmentId?: ID;
    userId: ID;
    amount: Money;
    originalAmount?: Money;
    exchangeRate?: number;
    method: PaymentMethod;
    provider: PaymentProvider;
    status: PaymentStatus;
    providerTransactionId?: string;
    providerReferenceId?: string;
    providerStatus?: string;
    cardId?: ID;
    card?: PaymentCard;
    bankAccountId?: ID;
    bankAccount?: BankAccount;
    installmentCount?: number;
    installmentAmount?: Money;
    fees: {
        platform: Money;
        provider: Money;
        bank: Money;
        total: Money;
    };
    grossAmount: Money;
    netAmount: Money;
    paidAt?: string;
    processedAt?: string;
    settledAt?: string;
    expiresAt?: string;
    ipAddress?: string;
    userAgent?: string;
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
    refunds: PaymentRefund[];
    refundableAmount: Money;
    riskScore?: number;
    fraudCheck?: {
        passed: boolean;
        score: number;
        reasons?: string[];
    };
    threeDS?: {
        enabled: boolean;
        version?: string;
        status?: 'success' | 'failed' | 'not_applicable';
        authenticationValue?: string;
    };
    description?: string;
    metadata?: Record<string, any>;
    failureReason?: string;
    failureCode?: string;
    reconciled: boolean;
    reconciledAt?: string;
    bankStatementReference?: string;
}
export interface PaymentRefund extends BaseEntity {
    paymentId: ID;
    amount: Money;
    reason: string;
    status: PaymentStatus;
    providerRefundId?: string;
    requestedAt: string;
    processedAt?: string;
    completedAt?: string;
    initiatedBy: ID;
    autoRefund: boolean;
    notes?: string;
    metadata?: Record<string, any>;
}
export interface PaymentIntent extends BaseEntity {
    amount: Money;
    method: PaymentMethod;
    provider: PaymentProvider;
    status: 'created' | 'confirmed' | 'cancelled' | 'expired';
    userId: ID;
    shipmentId?: ID;
    clientSecret: string;
    captureMethod: 'automatic' | 'manual';
    confirmationMethod: 'automatic' | 'manual';
    paymentMethodId?: ID;
    expiresAt: string;
    confirmedAt?: string;
    capturedAt?: string;
    description?: string;
    metadata?: Record<string, any>;
}
export interface InstallmentPlan {
    bankName: string;
    cardType: 'credit' | 'debit';
    installments: {
        count: number;
        rate: number;
        monthlyAmount: Money;
        totalAmount: Money;
        available: boolean;
    }[];
}
export interface PaymentMethodConfig {
    method: PaymentMethod;
    provider: PaymentProvider;
    enabled: boolean;
    minAmount?: Money;
    maxAmount?: Money;
    dailyLimit?: Money;
    monthlyLimit?: Money;
    fixedFee?: Money;
    percentageFee?: number;
    supports3DS: boolean;
    supportsInstallment: boolean;
    supportsRefund: boolean;
    supportsPartialRefund: boolean;
    settlementDays: number;
    config: Record<string, any>;
    availableCountries: string[];
    availableCurrencies: string[];
}
export interface Wallet extends BaseEntity {
    userId: ID;
    balance: Money;
    dailySpendLimit: Money;
    monthlySpendLimit: Money;
    isActive: boolean;
    isFrozen: boolean;
    frozenReason?: string;
    frozenAt?: string;
    isVerified: boolean;
    verifiedAt?: string;
    verificationLevel: 'basic' | 'enhanced' | 'full';
}
export interface WalletTransaction extends BaseEntity {
    walletId: ID;
    userId: ID;
    type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee' | 'commission';
    amount: Money;
    balanceAfter: Money;
    paymentId?: ID;
    shipmentId?: ID;
    description: string;
    reference?: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    processedAt?: string;
    metadata?: Record<string, any>;
}
export interface CreatePaymentRequest {
    amount: Money;
    method: PaymentMethod;
    provider?: PaymentProvider;
    shipmentId?: ID;
    cardId?: ID;
    bankAccountId?: ID;
    cardData?: {
        number: string;
        expiryMonth: number;
        expiryYear: number;
        cvc: string;
        holderName: string;
    };
    installmentCount?: number;
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
    saveCard?: boolean;
    description?: string;
    returnUrl?: string;
    webhookUrl?: string;
    metadata?: Record<string, any>;
}
export interface PaymentCreationResponse {
    payment: Payment;
    requiresAction?: boolean;
    actionUrl?: string;
    actionData?: Record<string, any>;
    clientSecret?: string;
}
export interface Payout extends BaseEntity {
    carrierId: ID;
    amount: Money;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    periodStart: string;
    periodEnd: string;
    breakdown: {
        grossEarnings: Money;
        platformCommission: Money;
        fees: Money;
        adjustments: Money;
        netAmount: Money;
    };
    bankAccount: {
        accountHolder: string;
        bankName: string;
        iban: string;
        swift?: string;
    };
    provider: PaymentProvider;
    providerPayoutId?: string;
    requestedAt: string;
    processedAt?: string;
    completedAt?: string;
    expectedAt?: string;
    failureReason?: string;
    invoiceUrl?: string;
    receiptUrl?: string;
    shipmentIds: ID[];
}
//# sourceMappingURL=payment.types.d.ts.map