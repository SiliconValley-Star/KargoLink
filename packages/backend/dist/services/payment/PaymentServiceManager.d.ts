import { PaymentRequest, PaymentResponse, RefundRequest, RefundResponse, PaymentWebhook, InstallmentInfo, PaymentServiceConfig, PaymentServiceResult, ServicePaymentProvider } from '@cargolink/shared/src/types/payment-service.types';
import { PaymentServiceMetrics } from './BasePaymentService';
export declare class PaymentServiceManager {
    private readonly services;
    private readonly configs;
    private readonly metrics;
    private readonly logger;
    constructor(configs: PaymentServiceConfig[]);
    private initializeServices;
    private createPaymentService;
    private initializeMetrics;
    initializePayment(request: PaymentRequest, preferredProvider?: ServicePaymentProvider): Promise<PaymentServiceResult<PaymentResponse>>;
    verifyPayment(paymentId: string, provider: ServicePaymentProvider, verificationData: Record<string, any>): Promise<PaymentServiceResult<PaymentResponse>>;
    getPaymentStatus(paymentId: string, provider: ServicePaymentProvider): Promise<PaymentServiceResult<PaymentResponse>>;
    refundPayment(request: RefundRequest, provider: ServicePaymentProvider): Promise<PaymentServiceResult<RefundResponse>>;
    processWebhook(provider: ServicePaymentProvider, headers: Record<string, string>, body: any): Promise<PaymentServiceResult<PaymentWebhook>>;
    getInstallmentOptions(amount: number, currency: string, provider?: ServicePaymentProvider, cardBin?: string): Promise<PaymentServiceResult<InstallmentInfo[]>>;
    private selectOptimalProvider;
    private getService;
    private updateMetrics;
    healthCheck(): Promise<Record<ServicePaymentProvider, PaymentServiceResult<{
        status: string;
        responseTime: number;
    }>>>;
    getMetrics(): Record<ServicePaymentProvider, PaymentServiceMetrics>;
    getAvailableProviders(): ServicePaymentProvider[];
    getProviderConfig(provider: ServicePaymentProvider): PaymentServiceConfig | undefined;
    setProviderStatus(provider: ServicePaymentProvider, enabled: boolean): boolean;
}
//# sourceMappingURL=PaymentServiceManager.d.ts.map