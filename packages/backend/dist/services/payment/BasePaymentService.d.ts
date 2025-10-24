import { PaymentRequest, PaymentResponse, RefundRequest, RefundResponse, PaymentWebhook, InstallmentInfo, PaymentServiceConfig, PaymentServiceResult, PaymentError, ServicePaymentProvider, ServicePaymentStatus } from '@cargolink/shared/src/types/payment-service.types';
import logger from '../../utils/logger';
export declare abstract class BasePaymentService {
    protected readonly config: PaymentServiceConfig;
    protected readonly logger: typeof logger;
    protected readonly provider: ServicePaymentProvider;
    constructor(config: PaymentServiceConfig);
    abstract initializePayment(request: PaymentRequest): Promise<PaymentServiceResult<PaymentResponse>>;
    abstract verifyPayment(paymentId: string, verificationData: Record<string, any>): Promise<PaymentServiceResult<PaymentResponse>>;
    abstract getPaymentStatus(paymentId: string): Promise<PaymentServiceResult<PaymentResponse>>;
    abstract refundPayment(request: RefundRequest): Promise<PaymentServiceResult<RefundResponse>>;
    abstract processWebhook(headers: Record<string, string>, body: any): Promise<PaymentServiceResult<PaymentWebhook>>;
    abstract getInstallmentOptions(amount: number, currency: string, cardBin?: string): Promise<PaymentServiceResult<InstallmentInfo[]>>;
    getConfig(): PaymentServiceConfig;
    getProvider(): ServicePaymentProvider;
    isEnabled(): boolean;
    supportsCurrency(currency: string): boolean;
    supportsPaymentMethod(method: string): boolean;
    validateAmount(amount: number): PaymentServiceResult<boolean>;
    calculateCommission(amount: number): number;
    protected generateTransactionId(): string;
    protected logPaymentOperation(operation: string, paymentId: string, data?: any, error?: any): void;
    protected handleApiError(error: any, operation: string): PaymentError;
    protected abstract validateWebhookSignature(headers: Record<string, string>, body: any): boolean;
    protected createPaymentResponse(paymentId: string, orderId: string, status: ServicePaymentStatus, amount: number, currency: string, additionalData?: Partial<PaymentResponse>): PaymentResponse;
    protected sanitizeForLog(data: any): any;
    protected checkRateLimit(identifier: string): Promise<boolean>;
    healthCheck(): Promise<PaymentServiceResult<{
        status: string;
        responseTime: number;
    }>>;
    protected abstract performHealthCheck(): Promise<void>;
}
export interface PaymentServiceFactory {
    createPaymentService(config: PaymentServiceConfig): BasePaymentService;
    getSupportedProviders(): ServicePaymentProvider[];
}
export interface PaymentServiceMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastRequestTime?: string;
    errorRate: number;
}
//# sourceMappingURL=BasePaymentService.d.ts.map