/**
 * Moniteur de performance
 * Surveille et analyse les performances de l'application
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: null,
      firstPaint: null,
      firstContentfulPaint: null,
      domInteractive: null,
      domComplete: null
    };
    
    this.marks = {};
    this.measures = {};
    
    // Initialiser
    this.init();
  }
  
  /**
   * Initialise le moniteur de performance
   */
  init() {
    // Vérifier si l'API Performance est disponible
    if (!window.performance) {
      console.warn('L\'API Performance n\'est pas disponible dans ce navigateur.');
      return;
    }
    
    // Écouter l'événement load
    window.addEventListener('load', () => {
      this.capturePageLoadMetrics();
    });
    
    // Observer les peintures
    this.observePaints();
  }
  
  /**
   * Capture les métriques de chargement de page
   */
  capturePageLoadMetrics() {
    // Obtenir les métriques de navigation
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    
    if (navigationTiming) {
      this.metrics.pageLoad = navigationTiming.loadEventEnd - navigationTiming.startTime;
      this.metrics.domInteractive = navigationTiming.domInteractive - navigationTiming.startTime;
      this.metrics.domComplete = navigationTiming.domComplete - navigationTiming.startTime;
    }
    
    // Envoyer les métriques
    this.sendMetrics();
  }
  
  /**
   * Observe les événements de peinture
   */
  observePaints() {
    // Vérifier si l'API PerformanceObserver est disponible
    if (!window.PerformanceObserver) {
      return;
    }
    
    // Observer les peintures
    const paintObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.name === 'first-paint') {
          this.metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    });
    
    paintObserver.observe({ entryTypes: ['paint'] });
  }
  
  /**
   * Crée un marqueur de performance
   * @param {string} name - Nom du marqueur
   */
  mark(name) {
    if (!window.performance || !performance.mark) {
      return;
    }
    
    const markName = `app_${name}`;
    performance.mark(markName);
    this.marks[name] = markName;
  }
  
  /**
   * Crée une mesure de performance entre deux marqueurs
   * @param {string} name - Nom de la mesure
   * @param {string} startMark - Nom du marqueur de début
   * @param {string} endMark - Nom du marqueur de fin
   */
  measure(name, startMark, endMark) {
    if (!window.performance || !performance.measure) {
      return;
    }
    
    const measureName = `app_${name}`;
    const startMarkName = this.marks[startMark];
    const endMarkName = this.marks[endMark];
    
    if (!startMarkName || !endMarkName) {
      console.warn(`Marqueurs non trouvés pour la mesure ${name}`);
      return;
    }
    
    performance.measure(measureName, startMarkName, endMarkName);
    this.measures[name] = measureName;
    
    // Obtenir la durée
    const entries = performance.getEntriesByName(measureName);
    if (entries.length > 0) {
      const duration = entries[0].duration;
      console.log(`Mesure ${name}: ${duration.toFixed(2)}ms`);
    }
  }
  
  /**
   * Envoie les métriques de performance
   */
  sendMetrics() {
    // En production, envoyer les métriques à un service d'analyse
    if (process.env.NODE_ENV === 'production') {
      // Exemple: envoyer à Google Analytics
      if (window.gtag) {
        gtag('event', 'performance', {
          'event_category': 'Performance',
          'event_label': 'Page Load',
          'value': Math.round(this.metrics.pageLoad)
        });
      }
    }
    
    // Afficher les métriques dans la console
    console.log('Métriques de performance:', this.metrics);
  }
  
  /**
   * Obtient toutes les métriques
   * @returns {Object} - Métriques de performance
   */
  getMetrics() {
    return this.metrics;
  }
  
  /**
   * Obtient une métrique spécifique
   * @param {string} name - Nom de la métrique
   * @returns {number|null} - Valeur de la métrique
   */
  getMetric(name) {
    return this.metrics[name] || null;
  }
}

export default PerformanceMonitor;
