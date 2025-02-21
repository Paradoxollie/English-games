import { PerformanceMonitor } from './performance-monitor';
import { AccessibilityManager } from './accessibility';
import { LazyLoader } from './lazy-loader';
import { initSentry, logError } from '../config/sentry-config';
import { CarouselManager } from './carousel-manager';

class AppInitializer {
    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
        this.accessibilityManager = new AccessibilityManager();
        this.lazyLoader = new LazyLoader();
        this.carouselManager = new CarouselManager();
    }

    init() {
        try {
            // Initialiser Sentry
            initSentry();

            // Mesurer les performances
            this.performanceMonitor.measurePageLoad();
            this.performanceMonitor.measureFirstContentfulPaint();

            // Configurer le lazy loading
            this.setupLazyLoading();

            // Initialiser l'accessibilité
            this.accessibilityManager.setupARIA();

            // Initialiser les carousels
            this.carouselManager.updateDisplays();
            setInterval(() => this.carouselManager.updateDisplays(), 5000);

        } catch (error) {
            logError(error, { context: 'AppInitialization' });
        }
    }

    setupLazyLoading() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(element => {
            this.lazyLoader.observe(element, element.dataset.lazy);
        });
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppInitializer();
    app.init();
}); 