"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    BCRYPT_ROUNDS: zod_1.z.coerce.number().default(12),
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:3000,http://localhost:3001'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.coerce.number().default(100),
    MAX_FILE_SIZE: zod_1.z.coerce.number().default(10485760),
    REDIS_URL: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().optional(),
    SMS_API_KEY: zod_1.z.string().optional(),
    SMS_API_SECRET: zod_1.z.string().optional(),
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    AWS_REGION: zod_1.z.string().optional(),
    AWS_S3_BUCKET: zod_1.z.string().optional(),
    AWS_CLOUDFRONT_DOMAIN: zod_1.z.string().optional(),
    IYZICO_API_KEY: zod_1.z.string().optional(),
    IYZICO_SECRET_KEY: zod_1.z.string().optional(),
    PAYTR_MERCHANT_ID: zod_1.z.string().optional(),
    PAYTR_MERCHANT_KEY: zod_1.z.string().optional(),
    PAYTR_MERCHANT_SALT: zod_1.z.string().optional(),
    YURTICI_API_KEY: zod_1.z.string().optional(),
    ARAS_API_KEY: zod_1.z.string().optional(),
    MNG_API_KEY: zod_1.z.string().optional(),
    DHL_API_KEY: zod_1.z.string().optional(),
    UPS_API_KEY: zod_1.z.string().optional(),
    ENABLE_SWAGGER: zod_1.z.string().default('true').transform(val => val === 'true'),
    ENABLE_RATE_LIMITING: zod_1.z.string().default('true').transform(val => val === 'true'),
    ENABLE_REQUEST_LOGGING: zod_1.z.string().default('true').transform(val => val === 'true'),
});
function validateEnv() {
    try {
        if (process.env.NODE_ENV === 'test') {
            process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-minimum-32-characters-long-for-security';
            process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-minimum-32-characters-long-security';
            process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/cargolink_test';
        }
        const env = envSchema.parse(process.env);
        return env;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('❌ Invalid environment variables:');
            error.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            });
            if (process.env.NODE_ENV !== 'test') {
                process.exit(1);
            }
            throw error;
        }
        throw error;
    }
}
const env = validateEnv();
exports.config = {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    database: {
        url: env.DATABASE_URL,
    },
    jwt: {
        secret: env.JWT_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
    },
    security: {
        bcryptRounds: env.BCRYPT_ROUNDS,
    },
    corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    rateLimit: {
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
    upload: {
        maxFileSize: env.MAX_FILE_SIZE,
    },
    features: {
        swagger: env.ENABLE_SWAGGER,
        rateLimiting: env.ENABLE_RATE_LIMITING,
        requestLogging: env.ENABLE_REQUEST_LOGGING,
    },
    monitoring: {
        logLevel: env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
    redis: env.REDIS_URL ? {
        url: env.REDIS_URL,
    } : undefined,
    email: env.SMTP_HOST ? {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.EMAIL_FROM,
    } : undefined,
    sms: env.SMS_API_KEY ? {
        apiKey: env.SMS_API_KEY,
        apiSecret: env.SMS_API_SECRET,
    } : undefined,
    aws: env.AWS_ACCESS_KEY_ID ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION,
        s3Bucket: env.AWS_S3_BUCKET,
        cloudFrontDomain: env.AWS_CLOUDFRONT_DOMAIN,
    } : undefined,
    payment: {
        iyzico: env.IYZICO_API_KEY ? {
            apiKey: env.IYZICO_API_KEY,
            secretKey: env.IYZICO_SECRET_KEY,
        } : undefined,
        paytr: env.PAYTR_MERCHANT_ID ? {
            merchantId: env.PAYTR_MERCHANT_ID,
            merchantKey: env.PAYTR_MERCHANT_KEY,
            merchantSalt: env.PAYTR_MERCHANT_SALT,
        } : undefined,
    },
    cargo: {
        yurtici: env.YURTICI_API_KEY ? { apiKey: env.YURTICI_API_KEY } : undefined,
        aras: env.ARAS_API_KEY ? { apiKey: env.ARAS_API_KEY } : undefined,
        mng: env.MNG_API_KEY ? { apiKey: env.MNG_API_KEY } : undefined,
        dhl: env.DHL_API_KEY ? { apiKey: env.DHL_API_KEY } : undefined,
        ups: env.UPS_API_KEY ? { apiKey: env.UPS_API_KEY } : undefined,
    },
};
//# sourceMappingURL=environment.js.map