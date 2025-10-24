export interface PerformanceMetrics {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    memoryUsage?: number;
    networkLatency?: number;
    bundleSize?: number;
}
export interface PerformanceThresholds {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    memoryUsage: number;
}
export declare class CargoLinkPerformanceMonitor {
    private metrics;
    private thresholds;
    measurePageLoad(): Promise<number>;
    measureRenderTime(componentName: string, renderFn: () => void): number;
    measureInteraction(interactionName: string, interactionFn: () => Promise<void> | void): Promise<number>;
    getMemoryUsage(): number | undefined;
    getCoreWebVitals(): Promise<{
        FCP?: number;
        LCP?: number;
        FID?: number;
        CLS?: number;
    }>;
    getPerformanceScore(): {
        score: number;
        rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
        recommendations: string[];
    };
    generateReport(): string;
    getMetrics(): PerformanceMetrics;
}
export declare const performanceMonitor: CargoLinkPerformanceMonitor;
export declare const performanceUtils: {
    measureExecutionTime: <T>(name: string, fn: () => T) => T;
    debounce: <T extends (...args: any[]) => void>(func: T, wait: number) => (...args: Parameters<T>) => void;
    throttle: <T extends (...args: any[]) => void>(func: T, limit: number) => (...args: Parameters<T>) => void;
};
//# sourceMappingURL=performance.d.ts.map