export interface SMSRequest {
    phoneNumber: string;
    message: string;
    userId?: string;
    reference?: string;
}
export interface SMSResponse {
    success: boolean;
    messageId?: string;
    error?: string;
    provider?: string;
    cost?: number;
}
export interface SMSProvider {
    name: string;
    sendSMS: (request: SMSRequest) => Promise<SMSResponse>;
    isAvailable: () => boolean;
}
export declare class SMSService {
    private providers;
    private primaryProvider;
    constructor();
    private initializeProviders;
    sendSMS(request: SMSRequest): Promise<SMSResponse>;
    sendBulkSMS(requests: SMSRequest[]): Promise<SMSResponse[]>;
    getStatus(): {
        available: boolean;
        primaryProvider: string | null;
        availableProviders: string[];
    };
    switchProvider(providerName: string): boolean;
    private isValidPhoneNumber;
    private maskPhoneNumber;
    static formatMessage(template: string, variables: Record<string, string>): string;
    static getCharacterCount(message: string): {
        length: number;
        smsCount: number;
        encoding: 'GSM' | 'UCS2';
    };
}
export default SMSService;
//# sourceMappingURL=sms.service.d.ts.map