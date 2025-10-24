export interface EmailRequest {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
    attachments?: EmailAttachment[];
    userId?: string;
    template?: string;
    templateData?: Record<string, any>;
}
export interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    path?: string;
    cid?: string;
}
export interface EmailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
    provider?: string;
}
export interface EmailProvider {
    name: string;
    sendEmail: (request: EmailRequest) => Promise<EmailResponse>;
    isAvailable: () => boolean;
}
export declare class EmailTemplates {
    static welcome(name: string, activationLink: string): {
        subject: string;
        html: string;
        text: string;
    };
    static passwordReset(name: string, resetLink: string): {
        subject: string;
        html: string;
        text: string;
    };
    static shipmentUpdate(name: string, trackingNumber: string, status: string, details: string): {
        subject: string;
        html: string;
        text: string;
    };
    static paymentConfirmation(name: string, amount: string, transactionId: string): {
        subject: string;
        html: string;
        text: string;
    };
}
export declare class EmailService {
    private providers;
    private primaryProvider;
    constructor();
    private initializeProviders;
    sendEmail(request: EmailRequest): Promise<EmailResponse>;
    sendBulkEmails(requests: EmailRequest[]): Promise<EmailResponse[]>;
    getStatus(): {
        available: boolean;
        primaryProvider: string | null;
        availableProviders: string[];
    };
    switchProvider(providerName: string): boolean;
    private isValidEmail;
    private maskEmails;
    private processTemplate;
}
export default EmailService;
//# sourceMappingURL=email.service.d.ts.map