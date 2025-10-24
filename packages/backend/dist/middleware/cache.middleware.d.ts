import { Request, Response, NextFunction } from 'express';
export interface CacheConfig {
    ttl?: number;
    tags?: string[];
    keyGenerator?: (req: Request) => string;
    condition?: (req: Request, res: Response) => boolean;
    skipOnError?: boolean;
}
export declare const apiCache: (config?: CacheConfig) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cacheRoutes: {
    short: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    medium: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    long: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    veryLong: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    user: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    public: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    tracking: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    pricing: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    stats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export declare const invalidateCache: (tags: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const clearAllCache: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const warmCache: (routes: Array<{
    path: string;
    method?: string;
}>) => Promise<void>;
export declare const cacheHealthCheck: () => Promise<{
    connected: boolean;
    stats: any;
    performance: {
        hit: number;
        miss: number;
        hitRate: string;
    };
}>;
declare const _default: {
    apiCache: (config?: CacheConfig) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cacheRoutes: {
        short: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        medium: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        long: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        veryLong: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        user: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        public: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        tracking: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        pricing: (req: Request, res: Response, next: NextFunction) => Promise<void>;
        stats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    };
    invalidateCache: (tags: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    clearAllCache: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    warmCache: (routes: Array<{
        path: string;
        method?: string;
    }>) => Promise<void>;
    cacheHealthCheck: () => Promise<{
        connected: boolean;
        stats: any;
        performance: {
            hit: number;
            miss: number;
            hitRate: string;
        };
    }>;
};
export default _default;
//# sourceMappingURL=cache.middleware.d.ts.map