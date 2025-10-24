import rateLimit from 'express-rate-limit';
import { Request } from 'express';
export declare const defaultRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const passwordChangeRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const apiRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const uploadRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const notificationRateLimit: import("express-rate-limit").RateLimitRequestHandler;
interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: Request) => string;
}
export declare const createRateLimit: (options?: RateLimitOptions) => import("express-rate-limit").RateLimitRequestHandler;
export { rateLimit };
export default defaultRateLimit;
//# sourceMappingURL=rate-limit.middleware.d.ts.map