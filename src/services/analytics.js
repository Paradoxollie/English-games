export const trackEvent = (eventName, params = {}) => {
    try {
        gtag('event', eventName, {
            ...params,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Analytics error:', error);
    }
}; 