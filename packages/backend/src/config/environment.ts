import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // File Uploads
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB

  // Redis
  REDIS_URL: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // SMS
  SMS_API_KEY: z.string().optional(),
  SMS_API_SECRET: z.string().optional(),

  // File Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_CLOUDFRONT_DOMAIN: z.string().optional(),

  // Third-party APIs
  IYZICO_API_KEY: z.string().optional(),
  IYZICO_SECRET_KEY: z.string().optional(),
  PAYTR_MERCHANT_ID: z.string().optional(),
  PAYTR_MERCHANT_KEY: z.string().optional(),
  PAYTR_MERCHANT_SALT: z.string().optional(),

  // Cargo APIs
  YURTICI_API_KEY: z.string().optional(),
  ARAS_API_KEY: z.string().optional(),
  MNG_API_KEY: z.string().optional(),
  DHL_API_KEY: z.string().optional(),
  UPS_API_KEY: z.string().optional(),

  // Features
  ENABLE_SWAGGER: z.string().default('true').transform(val => val === 'true'),
  ENABLE_RATE_LIMITING: z.string().default('true').transform(val => val === 'true'),
  ENABLE_REQUEST_LOGGING: z.string().default('true').transform(val => val === 'true'),
});

function validateEnv() {
  try {
    // Test ortamı için default değerler ayarla
    if (process.env.NODE_ENV === 'test') {
      process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-minimum-32-characters-long-for-security';
      process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-minimum-32-characters-long-security';
      process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/cargolink_test';
    }
    
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.issues.forEach((issue: any) => {
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

export const config = {
  // Server
  nodeEnv: env.NODE_ENV,
  port: env.PORT,

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
  },

  // Security
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
  },

  // CORS
  corsOrigins: env.CORS_ORIGINS.split(',').map((origin: string) => origin.trim()),

  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // File Uploads
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
  },

  // Features
  features: {
    swagger: env.ENABLE_SWAGGER,
    rateLimiting: env.ENABLE_RATE_LIMITING,
    requestLogging: env.ENABLE_REQUEST_LOGGING,
  },

  // Monitoring
  monitoring: {
    logLevel: env.NODE_ENV === 'production' ? 'warn' : 'info',
  },

  // Optional services
  redis: env.REDIS_URL ? {
    url: env.REDIS_URL,
  } : undefined,

  email: env.SMTP_HOST ? {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT!,
    user: env.SMTP_USER!,
    pass: env.SMTP_PASS!,
    from: env.EMAIL_FROM!,
  } : undefined,

  sms: env.SMS_API_KEY ? {
    apiKey: env.SMS_API_KEY,
    apiSecret: env.SMS_API_SECRET!,
  } : undefined,

  aws: env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    region: env.AWS_REGION!,
    s3Bucket: env.AWS_S3_BUCKET!,
    cloudFrontDomain: env.AWS_CLOUDFRONT_DOMAIN,
  } : undefined,

  payment: {
    iyzico: env.IYZICO_API_KEY ? {
      apiKey: env.IYZICO_API_KEY,
      secretKey: env.IYZICO_SECRET_KEY!,
    } : undefined,
    paytr: env.PAYTR_MERCHANT_ID ? {
      merchantId: env.PAYTR_MERCHANT_ID,
      merchantKey: env.PAYTR_MERCHANT_KEY!,
      merchantSalt: env.PAYTR_MERCHANT_SALT!,
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