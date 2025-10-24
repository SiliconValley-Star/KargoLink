"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceUtils = exports.performanceMonitor = exports.CargoLinkPerformanceMonitor = void 0;
class CargoLinkPerformanceMonitor {
    metrics = {
        loadTime: 0,
        renderTime: 0,
        interactionTime: 0,
    };
    thresholds = {
        loadTime: 2000,
        renderTime: 100,
        interactionTime: 50,
        memoryUsage: 100,
    };
    measurePageLoad() {
        return new Promise((resolve) => {
            if (typeof window === 'undefined') {
                resolve(0);
                return;
            }
            window.addEventListener('load', () => {
                const loadTime = performance.now();
                this.metrics.loadTime = loadTime;
                resolve(loadTime);
            });
        });
    }
    measureRenderTime(componentName, renderFn) {
        const startTime = performance.now();
        renderFn();
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        console.log(`🎯 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
        this.metrics.renderTime = renderTime;
        return renderTime;
    }
    measureInteraction(interactionName, interactionFn) {
        return new Promise(async (resolve) => {
            const startTime = performance.now();
            try {
                await interactionFn();
            }
            catch (error) {
                console.error(`Interaction "${interactionName}" failed:`, error);
            }
            const endTime = performance.now();
            const interactionTime = endTime - startTime;
            console.log(`⚡ ${interactionName} response time: ${interactionTime.toFixed(2)}ms`);
            this.metrics.interactionTime = interactionTime;
            resolve(interactionTime);
        });
    }
    getMemoryUsage() {
        if (typeof window === 'undefined' || !('memory' in performance)) {
            return undefined;
        }
        const memoryInfo = performance.memory;
        const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
        this.metrics.memoryUsage = usedMB;
        return usedMB;
    }
    getCoreWebVitals() {
        return new Promise((resolve) => {
            const vitals = {};
            if (typeof window === 'undefined') {
                resolve({});
                return;
            }
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        vitals.FCP = entry.startTime;
                    }
                });
            }).observe({ entryTypes: ['paint'] });
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    vitals.LCP = lastEntry.startTime;
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    vitals.FID = entry.processingStart - entry.startTime;
                });
            }).observe({ entryTypes: ['first-input'] });
            setTimeout(() => resolve(vitals), 3000);
        });
    }
    getPerformanceScore() {
        let score = 100;
        const recommendations = [];
        if (this.metrics.loadTime > this.thresholds.loadTime) {
            score -= 25;
            recommendations.push('⚡ Optimize bundle size and implement code splitting');
        }
        if (this.metrics.renderTime > this.thresholds.renderTime) {
            score -= 20;
            recommendations.push('🎯 Optimize component rendering with React.memo and useMemo');
        }
        if (this.metrics.interactionTime > this.thresholds.interactionTime) {
            score -= 20;
            recommendations.push('🔄 Implement debouncing and optimize event handlers');
        }
        if (this.metrics.memoryUsage && this.metrics.memoryUsage > this.thresholds.memoryUsage) {
            score -= 15;
            recommendations.push('🧠 Optimize memory usage and prevent memory leaks');
        }
        const rating = score >= 90 ? 'excellent' :
            score >= 70 ? 'good' :
                score >= 50 ? 'needs-improvement' : 'poor';
        return { score, rating, recommendations };
    }
    generateReport() {
        const { score, rating, recommendations } = this.getPerformanceScore();
        return `
🚀 CargoLink Performance Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Overall Score: ${score}/100 (${rating.toUpperCase()})

⏱️  Metrics:
   • Load Time: ${this.metrics.loadTime.toFixed(2)}ms
   • Render Time: ${this.metrics.renderTime.toFixed(2)}ms  
   • Interaction Time: ${this.metrics.interactionTime.toFixed(2)}ms
   ${this.metrics.memoryUsage ? `• Memory Usage: ${this.metrics.memoryUsage.toFixed(2)}MB` : ''}

${recommendations.length > 0 ? `
💡 Recommendations:
${recommendations.map(rec => `   ${rec}`).join('\n')}
` : '✅ Performance is excellent!'}

🎯 Targets:
   • Load Time: < ${this.thresholds.loadTime}ms
   • Render Time: < ${this.thresholds.renderTime}ms
   • Interaction Time: < ${this.thresholds.interactionTime}ms
   • Memory Usage: < ${this.thresholds.memoryUsage}MB
    `;
    }
    getMetrics() {
        return { ...this.metrics };
    }
}
exports.CargoLinkPerformanceMonitor = CargoLinkPerformanceMonitor;
exports.performanceMonitor = new CargoLinkPerformanceMonitor();
exports.performanceUtils = {
    measureExecutionTime: (name, fn) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    },
    debounce: (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },
    throttle: (func, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
};
//# sourceMappingURL=performance.js.map