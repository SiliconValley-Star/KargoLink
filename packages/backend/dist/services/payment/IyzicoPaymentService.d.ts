import { BasePaymentService } from './BasePaymentService';
import { PaymentRequest, PaymentResponse, RefundRequest, RefundResponse, PaymentWebhook, InstallmentInfo, IyzicoConfig, PaymentServiceResult } from '@cargolink/shared/src/types/payment-service.types';
export declare class IyzicoPaymentService extends BasePaymentService {
    private readonly apiClient;
    protected readonly config: IyzicoConfig;
    constructor(config: IyzicoConfig);
    initializePayment(request: PaymentRequest): Promise<PaymentServiceResult<PaymentResponse>>;
    verifyPayment(paymentId: string, verificationData: Record<string, any>): Promise<PaymentServiceResult<PaymentResponse>>;
    getPaymentStatus(paymentId: string): Promise<PaymentServiceResult<PaymentResponse>>;
    refundPayment(request: RefundRequest): Promise<PaymentServiceResult<RefundResponse>>;
    processWebhook(headers: Record<string, string>, body: any): Promise<PaymentServiceResult<PaymentWebhook>>;
    getInstallmentOptions(amount: number, currency: string, cardBin?: string): Promise<PaymentServiceResult<InstallmentInfo[]>>;
    private generateAuthHeader;
    private buildRequestString;
    private flattenObject;
    private generateRandomString;
    private buildIyzicoPaymentRequest;
    private mapIyzicoStatusToServiceStatus;
    private mapIyzicoEventToWebhookEvent;
    private validatePaymentRequest;
    protected validateWebhookSignature(headers: Record<string, string>, body: any): boolean;
    protected performHealthCheck(): Promise<void>;
}
//# sourceMappingURL=IyzicoPaymentService.d.ts.map