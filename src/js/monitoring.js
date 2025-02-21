class MonitoringService {
    constructor() {
        this.metrics = {
            errors: [],
            performance: {},
            userActions: []
        };
    }

    trackError(error, context) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        };
        
        this.metrics.errors.push(errorData);
        
        // Envoyer à Sentry
        if (window.Sentry) {
            Sentry.captureException(error, {
                extra: context
            });
        }

        // Envoyer à Analytics
        if (window.analytics) {
            analytics.logEvent('error_occurred', errorData);
        }
    }

    trackPerformance(metric) {
        this.metrics.performance[metric.name] = metric.value;
        
        if (window.analytics) {
            analytics.logEvent('performance_metric', metric);
        }
    }

    trackUserAction(action, data) {
        const actionData = {
            action,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.metrics.userActions.push(actionData);
        
        if (window.analytics) {
            analytics.logEvent('user_action', actionData);
        }
    }

    getMetrics() {
        return {
            errors: this.metrics.errors.length,
            performance: this.metrics.performance,
            userActions: this.metrics.userActions.length
        };
    }
}

window.MonitoringService = MonitoringService; 