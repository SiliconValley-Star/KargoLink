import { Request, Response } from 'express';
import { PaymentServiceManager } from '../services/payment/PaymentServiceManager';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare class PaymentController {
    private readonly paymentServiceManager;
    private readonly logger;
    constructor(paymentServiceManager: PaymentServiceManager);
    initializePayment: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    verifyPayment: (req: Request, res: Response) => Promise<void>;
    getPaymentStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    processWebhook: (req: Request, res: Response) => Promise<void>;
    getInstallmentOptions: (req: Request, res: Response) => Promise<void>;
    getProviders: (req: Request, res: Response) => Promise<void>;
    getMetrics: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=payment.controller.d.ts.map