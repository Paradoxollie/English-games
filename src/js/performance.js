class PerformanceOptimizer {
    constructor() {
        this.metrics = {};
    }

    // Lazy loading des images
    setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Cache des scores
    setupScoreCache() {
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        let scoreCache = {};

        return async (gameId) => {
            if (scoreCache[gameId]?.timestamp > Date.now() - CACHE_DURATION) {
                return scoreCache[gameId].data;
            }

            const scores = await db.collection(gameId).orderBy('score', 'desc').limit(10).get();
            scoreCache[gameId] = {
                timestamp: Date.now(),
                data: scores
            };
            return scores;
        };
    }

    // Monitoring des performances
    measurePerformance() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                const timing = window.performance.timing;
                const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                analytics.logEvent('performance_metrics', {
                    page_load_time: pageLoadTime
                });
            });
        }
    }
}

// Rendre la classe disponible globalement
window.PerformanceOptimizer = PerformanceOptimizer; 