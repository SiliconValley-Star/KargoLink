export declare const config: {
    nodeEnv: "development" | "production" | "test";
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
    };
    security: {
        bcryptRounds: number;
    };
    corsOrigins: string[];
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    upload: {
        maxFileSize: number;
    };
    features: {
        swagger: boolean;
        rateLimiting: boolean;
        requestLogging: boolean;
    };
    monitoring: {
        logLevel: string;
    };
    redis: {
        url: string;
    } | undefined;
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    } | undefined;
    sms: {
        apiKey: string;
        apiSecret: string;
    } | undefined;
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        s3Bucket: string;
        cloudFrontDomain: string | undefined;
    } | undefined;
    payment: {
        iyzico: {
            apiKey: string;
            secretKey: string;
        } | undefined;
        paytr: {
            merchantId: string;
            merchantKey: string;
            merchantSalt: string;
        } | undefined;
    };
    cargo: {
        yurtici: {
            apiKey: string;
        } | undefined;
        aras: {
            apiKey: string;
        } | undefined;
        mng: {
            apiKey: string;
        } | undefined;
        dhl: {
            apiKey: string;
        } | undefined;
        ups: {
            apiKey: string;
        } | undefined;
    };
};
//# sourceMappingURL=environment.d.ts.map