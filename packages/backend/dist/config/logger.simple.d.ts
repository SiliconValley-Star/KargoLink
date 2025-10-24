export declare const logger: {
    info: (message: string, meta?: any) => void;
    error: (message: string, error?: any) => void;
    warn: (message: string, meta?: any) => void;
    debug: (message: string, meta?: any) => void;
    child: (meta: any) => {
        info: (message: string, extraMeta?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, extraMeta?: any) => void;
        debug: (message: string, extraMeta?: any) => void;
    };
};
export declare const loggerStream: {
    write: (message: string) => void;
};
export declare const addRequestId: (requestId: string) => {
    info: (message: string, extraMeta?: any) => void;
    error: (message: string, error?: any) => void;
    warn: (message: string, extraMeta?: any) => void;
    debug: (message: string, extraMeta?: any) => void;
};
export declare const loggers: {
    auth: {
        info: (message: string, extraMeta?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, extraMeta?: any) => void;
        debug: (message: string, extraMeta?: any) => void;
    };
    api: {
        info: (message: string, extraMeta?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, extraMeta?: any) => void;
        debug: (message: string, extraMeta?: any) => void;
    };
    database: {
        info: (message: string, extraMeta?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, extraMeta?: any) => void;
        debug: (message: string, extraMeta?: any) => void;
    };
    payment: {
        info: (message: string, extraMeta?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, extraMeta?: any) => void;
        debug: (message: string, extraMeta?: any) => void;
    };
    cargo: {
        info: (message: string, extraMeta?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, extraMeta?: any) => void;
        debug: (message: string, extraMeta?: any) => void;
    };
    email: {
        info: (message: string, extraMeta?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, extraMeta?: any) => void;
        debug: (message: string, extraMeta?: any) => void;
    };
    sms: {
        info: (message: string, extraMeta?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, extraMeta?: any) => void;
        debug: (message: string, extraMeta?: any) => void;
    };
};
export default logger;
//# sourceMappingURL=logger.simple.d.ts.map