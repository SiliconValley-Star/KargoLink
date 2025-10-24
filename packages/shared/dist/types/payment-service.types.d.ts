export declare enum ServicePaymentProvider {
    IYZICO = "iyzico",
    PAYTR = "paytr",
    STRIPE = "stripe",
    PAYPAL = "paypal"
}
export declare enum ServicePaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    BANK_TRANSFER = "bank_transfer",
    DIGITAL_WALLET = "digital_wallet",
    CASH_ON_DELIVERY = "cash_on_delivery"
}
export declare enum ServicePaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded",
    PARTIALLY_REFUNDED = "partially_refunded"
}
export declare enum ServiceCurrency {
    TRY = "TRY",
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP"
}
export declare enum RefundReason {
    CUSTOMER_REQUEST = "customer_request",
    SHIPMENT_CANCELLED = "shipment_cancelled",
    SERVICE_ISSUE = "service_issue",
    FRAUD_PREVENTION = "fraud_prevention",
    DUPLICATE_PAYMENT = "duplicate_payment"
}
export interface PaymentRequest {
    orderId: string;
    amount: number;
    currency: ServiceCurrency;
    description: string;
    customer: PaymentCustomer;
    billingAddress: PaymentAddress;
    shippingAddress?: PaymentAddress;
    basketItems: PaymentBasketItem[];
    paymentMethod?: ServicePaymentMethod;
    installmentCount?: number;
    paymentGroup?: string;
    successUrl: string;
    failureUrl: string;
    webhookUrl?: string;
    metadata?: Record<string, any>;
}
export interface PaymentResponse {
    success: boolean;
    provider: ServicePaymentProvider;
    paymentId: string;
    orderId: string;
    status: ServicePaymentStatus;
    amount: number;
    currency: ServiceCurrency;
    providerPaymentId?: string;
    providerResponse?: any;
    paymentUrl?: string;
    threeDSecure?: {
        required: boolean;
        redirectUrl?: string;
        htmlContent?: string;
    };
    error?: PaymentError;
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
    identityNumber?: string;
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
export declare enum PaymentWebhookEvent {
    PAYMENT_SUCCESS = "payment.success",
    PAYMENT_FAILED = "payment.failed",
    PAYMENT_CANCELLED = "payment.cancelled",
    REFUND_SUCCESS = "refund.success",
    REFUND_FAILED = "refund.failed",
    CHARGEBACK = "chargeback"
}
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
    netAmount: number;
}
export interface PaymentServiceConfig {
    provider: ServicePaymentProvider;
    name: string;
    enabled: boolean;
    sandbox: boolean;
    apiKey: string;
    secretKey: string;
    merchantId?: string;
    baseUrl: string;
    webhookUrl?: string;
    supportedCurrencies: ServiceCurrency[];
    supportedPaymentMethods: ServicePaymentMethod[];
    supports3DSecure: boolean;
    supportsInstallments: boolean;
    supportsRefunds: boolean;
    minAmount: number;
    maxAmount: number;
    maxInstallmentCount: number;
    commissionRate: number;
    fixedCommission?: number;
    webhookSecretKey?: string;
    allowedIPs?: string[];
    rateLimits: {
        requestsPerMinute: number;
        requestsPerHour: number;
    };
}
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
export type PaymentServiceResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: PaymentError;
};
export interface PaymentAnalytics {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalVolume: number;
    currency: ServiceCurrency;
    averageTransactionAmount: number;
    successRate: number;
    paymentMethodBreakdown: {
        method: ServicePaymentMethod;
        count: number;
        volume: number;
    }[];
    providerBreakdown: {
        provider: ServicePaymentProvider;
        count: number;
        volume: number;
        successRate: number;
    }[];
    totalCommissionEarned: number;
    averageCommissionRate: number;
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
//# sourceMappingURL=payment-service.types.d.ts.map