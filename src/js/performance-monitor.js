export class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }

    measurePageLoad() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                const timing = window.performance.timing;
                this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
                this.metrics.domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                this.logMetrics();
            });
        }
    }

    measureFirstContentfulPaint() {
        const paint = window.performance.getEntriesByType('paint')
            .find(entry => entry.name === 'first-contentful-paint');
        if (paint) {
            this.metrics.fcp = paint.startTime;
        }
    }

    logMetrics() {
        console.log('Performance Metrics:', this.metrics);
        // Envoyer à Analytics
        if (window.analytics) {
            window.analytics.logEvent('performance_metrics', this.metrics);
        }
    }
} 