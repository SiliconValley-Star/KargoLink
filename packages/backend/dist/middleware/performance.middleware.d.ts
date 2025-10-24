import { Request, Response, NextFunction } from 'express';
export interface PerformanceMetrics {
    responseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    statusCode: number;
    method: string;
    path: string;
    timestamp: number;
    userId?: string;
    userAgent?: string;
    ip: string;
}
export interface PerformanceConfig {
    logSlowRequests?: boolean;
    slowRequestThreshold?: number;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    sampleRate?: number;
}
export declare const performanceMonitor: (config?: PerformanceConfig) => (req: Request, res: Response, next: NextFunction) => void;
export declare const getPerformanceStats: (timeframe?: "hour" | "day" | "week") => Promise<any>;
export declare const getSystemMetrics: () => {
    timestamp: number;
    uptime: number;
    memory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        heapUsagePercent: number;
    };
    cpu: {
        user: number;
        system: number;
    };
};
export declare const performanceHealthCheck: () => Promise<{
    status: "healthy" | "warning" | "critical";
    checks: {
        memory: {
            status: string;
            value: number;
            threshold: number;
        };
        avgResponseTime: {
            status: string;
            value: any;
            threshold: number;
        };
        errorRate: {
            status: string;
            value: number;
            threshold: number;
        };
    };
    systemMetrics: {
        timestamp: number;
        uptime: number;
        memory: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
            heapUsagePercent: number;
        };
        cpu: {
            user: number;
            system: number;
        };
    };
    stats: any;
}>;
export declare const adaptiveRateLimit: (config?: {
    maxResponseTime?: number;
    maxCpuUsage?: number;
    maxMemoryUsage?: number;
}) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    performanceMonitor: (config?: PerformanceConfig) => (req: Request, res: Response, next: NextFunction) => void;
    getPerformanceStats: (timeframe?: "hour" | "day" | "week") => Promise<any>;
    getSystemMetrics: () => {
        timestamp: number;
        uptime: number;
        memory: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
            heapUsagePercent: number;
        };
        cpu: {
            user: number;
            system: number;
        };
    };
    performanceHealthCheck: () => Promise<{
        status: "healthy" | "warning" | "critical";
        checks: {
            memory: {
                status: string;
                value: number;
                threshold: number;
            };
            avgResponseTime: {
                status: string;
                value: any;
                threshold: number;
            };
            errorRate: {
                status: string;
                value: number;
                threshold: number;
            };
        };
        systemMetrics: {
            timestamp: number;
            uptime: number;
            memory: {
                rss: number;
                heapTotal: number;
                heapUsed: number;
                external: number;
                heapUsagePercent: number;
            };
            cpu: {
                user: number;
                system: number;
            };
        };
        stats: any;
    }>;
    adaptiveRateLimit: (config?: {
        maxResponseTime?: number;
        maxCpuUsage?: number;
        maxMemoryUsage?: number;
    }) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default _default;
//# sourceMappingURL=performance.middleware.d.ts.map