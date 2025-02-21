import * as Sentry from "@sentry/browser";

export function initSentry() {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
        integrations: [
            new Sentry.BrowserTracing(),
        ],
        beforeSend(event) {
            // Personnaliser les événements avant l'envoi
            if (event.exception) {
                Sentry.showReportDialog({ eventId: event.event_id });
            }
            return event;
        },
    });
}

export function logError(error, context = {}) {
    Sentry.captureException(error, {
        extra: context
    });
} 