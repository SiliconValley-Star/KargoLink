import winston from 'winston';
export declare const logger: winston.Logger;
export declare const loggerStream: {
    write: (message: string) => void;
};
export declare const addRequestId: (requestId: string) => winston.Logger;
export declare const loggers: {
    auth: winston.Logger;
    api: winston.Logger;
    database: winston.Logger;
    payment: winston.Logger;
    cargo: winston.Logger;
    email: winston.Logger;
    sms: winston.Logger;
};
export default logger;
//# sourceMappingURL=logger.d.ts.map