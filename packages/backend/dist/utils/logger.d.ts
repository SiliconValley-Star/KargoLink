import winston from 'winston';
declare const logger: winston.Logger;
export declare const httpLogger: winston.Logger;
export declare const dbLogger: winston.Logger;
export declare const paymentLogger: winston.Logger;
export declare const securityLogger: winston.Logger;
export declare const integrationLogger: winston.Logger;
export declare const loggerHelpers: {
    logRequest: (req: any, res: any, responseTime: number) => void;
    logDbOperation: (operation: string, table: string, duration: number, userId?: string) => void;
    logPayment: (transactionId: string, amount: number, currency: string, userId: string, status: string) => void;
    logSecurityEvent: (event: string, userId?: string, ip?: string, details?: any) => void;
    logIntegration: (provider: string, endpoint: string, method: string, statusCode: number, duration: number, success: boolean) => void;
    logUserAction: (userId: string, action: string, resource: string, details?: any) => void;
    logSystemEvent: (event: string, details?: any) => void;
};
export default logger;
//# sourceMappingURL=logger.d.ts.map