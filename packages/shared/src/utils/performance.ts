// CargoLink Performance Monitoring System
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  networkLatency?: number;
  bundleSize?: number;
}

export interface PerformanceThresholds {
  loadTime: number;        // Target: < 2000ms
  renderTime: number;      // Target: < 100ms  
  interactionTime: number; // Target: < 50ms
  memoryUsage: number;     // Target: < 100MB
}

export class CargoLinkPerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
  };

  private thresholds: PerformanceThresholds = {
    loadTime: 2000,      // 2 seconds
    renderTime: 100,     // 100ms
    interactionTime: 50, // 50ms
    memoryUsage: 100,    // 100MB
  };

  // Measure page load performance
  measurePageLoad(): Promise<number> {
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

  // Measure component render time
  measureRenderTime(componentName: string, renderFn: () => void): number {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`🎯 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
    this.metrics.renderTime = renderTime;
    
    return renderTime;
  }

  // Measure user interaction response time
  measureInteraction(interactionName: string, interactionFn: () => Promise<void> | void): Promise<number> {
    return new Promise(async (resolve) => {
      const startTime = performance.now();
      
      try {
        await interactionFn();
      } catch (error) {
        console.error(`Interaction "${interactionName}" failed:`, error);
      }
      
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      console.log(`⚡ ${interactionName} response time: ${interactionTime.toFixed(2)}ms`);
      this.metrics.interactionTime = interactionTime;
      
      resolve(interactionTime);
    });
  }

  // Get memory usage (if available)
  getMemoryUsage(): number | undefined {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return undefined;
    }

    const memoryInfo = (performance as any).memory;
    const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
    this.metrics.memoryUsage = usedMB;
    
    return usedMB;
  }

  // Monitor Core Web Vitals
  getCoreWebVitals(): Promise<{
    FCP?: number;  // First Contentful Paint
    LCP?: number;  // Largest Contentful Paint  
    FID?: number;  // First Input Delay
    CLS?: number;  // Cumulative Layout Shift
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};

      if (typeof window === 'undefined') {
        resolve({});
        return;
      }

      // Measure FCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.FCP = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['paint'] });

      // Measure LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          vitals.LCP = lastEntry.startTime;
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          vitals.FID = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });

      // Return after a short delay to collect metrics
      setTimeout(() => resolve(vitals), 3000);
    });
  }

  // Performance health check
  getPerformanceScore(): {
    score: number;
    rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    recommendations: string[];
  } {
    let score = 100;
    const recommendations: string[] = [];

    // Check load time
    if (this.metrics.loadTime > this.thresholds.loadTime) {
      score -= 25;
      recommendations.push('⚡ Optimize bundle size and implement code splitting');
    }

    // Check render time
    if (this.metrics.renderTime > this.thresholds.renderTime) {
      score -= 20;
      recommendations.push('🎯 Optimize component rendering with React.memo and useMemo');
    }

    // Check interaction time
    if (this.metrics.interactionTime > this.thresholds.interactionTime) {
      score -= 20;
      recommendations.push('🔄 Implement debouncing and optimize event handlers');
    }

    // Check memory usage
    if (this.metrics.memoryUsage && this.metrics.memoryUsage > this.thresholds.memoryUsage) {
      score -= 15;
      recommendations.push('🧠 Optimize memory usage and prevent memory leaks');
    }

    const rating = 
      score >= 90 ? 'excellent' :
      score >= 70 ? 'good' :
      score >= 50 ? 'needs-improvement' : 'poor';

    return { score, rating, recommendations };
  }

  // Generate performance report
  generateReport(): string {
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

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Global performance monitor instance
export const performanceMonitor = new CargoLinkPerformanceMonitor();

// Performance utilities
export const performanceUtils = {
  // Measure execution time of any function
  measureExecutionTime: <T>(name: string, fn: () => T): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  // Debounce function for performance optimization
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance optimization
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
};