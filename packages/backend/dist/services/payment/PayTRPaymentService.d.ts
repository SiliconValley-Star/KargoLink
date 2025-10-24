import { BasePaymentService } from './BasePaymentService';
import { PaymentRequest, PaymentResponse, RefundRequest, RefundResponse, PaymentWebhook, InstallmentInfo, PayTRConfig, PaymentServiceResult } from '@cargolink/shared/src/types/payment-service.types';
export declare class PayTRPaymentService extends BasePaymentService {
    private readonly apiClient;
    protected readonly config: PayTRConfig;
    constructor(config: PayTRConfig);
    initializePayment(request: PaymentRequest): Promise<PaymentServiceResult<PaymentResponse>>;
    verifyPayment(paymentId: string, verificationData: Record<string, any>): Promise<PaymentServiceResult<PaymentResponse>>;
    getPaymentStatus(paymentId: string): Promise<PaymentServiceResult<PaymentResponse>>;
    refundPayment(request: RefundRequest): Promise<PaymentServiceResult<RefundResponse>>;
    processWebhook(headers: Record<string, string>, body: any): Promise<PaymentServiceResult<PaymentWebhook>>;
    getInstallmentOptions(amount: number, currency: string, cardBin?: string): Promise<PaymentServiceResult<InstallmentInfo[]>>;
    private buildPayTRPaymentRequest;
    private buildUserBasket;
    private verifyPayTRHash;
    private parseFormData;
    private mapPayTRStatusToServiceStatus;
    private mapPayTREventToWebhookEvent;
    private validatePaymentRequest;
    protected validateWebhookSignature(headers: Record<string, string>, body: any): boolean;
    protected performHealthCheck(): Promise<void>;
}
//# sourceMappingURL=PayTRPaymentService.d.ts.map