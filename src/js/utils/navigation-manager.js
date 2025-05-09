/**
 * Gestionnaire de navigation
 * Gère la navigation et les transitions entre les pages
 */

class NavigationManager {
  constructor() {
    this.currentPath = window.location.pathname;
    this.isNavigating = false;
    
    // Initialiser
    this.init();
  }
  
  /**
   * Initialise le gestionnaire de navigation
   */
  init() {
    // Intercepter les clics sur les liens
    document.addEventListener('click', (e) => {
      // Vérifier si c'est un lien
      const link = e.target.closest('a');
      
      if (link && this.shouldInterceptLink(link)) {
        e.preventDefault();
        this.navigateTo(link.href);
      }
    });
    
    // Intercepter les événements de navigation
    window.addEventListener('popstate', (e) => {
      this.handlePopState(e);
    });
    
    // Initialiser le menu mobile
    this.initMobileMenu();
  }
  
  /**
   * Vérifie si un lien doit être intercepté
   * @param {HTMLAnchorElement} link - Élément de lien
   * @returns {boolean} - True si le lien doit être intercepté
   */
  shouldInterceptLink(link) {
    // Ne pas intercepter les liens externes
    if (link.target === '_blank' || link.rel === 'external') {
      return false;
    }
    
    // Ne pas intercepter les liens vers d'autres domaines
    if (link.hostname !== window.location.hostname) {
      return false;
    }
    
    // Ne pas intercepter les liens avec des attributs de téléchargement
    if (link.hasAttribute('download')) {
      return false;
    }
    
    // Ne pas intercepter les liens avec des attributs data-no-intercept
    if (link.dataset.noIntercept !== undefined) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Navigue vers une URL
   * @param {string} url - URL de destination
   * @param {boolean} pushState - Si true, ajoute une entrée dans l'historique
   */
  async navigateTo(url, pushState = true) {
    // Éviter la navigation pendant une navigation en cours
    if (this.isNavigating) {
      return;
    }
    
    this.isNavigating = true;
    
    try {
      // Obtenir le chemin
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Ne rien faire si c'est la même page
      if (path === this.currentPath) {
        this.isNavigating = false;
        return;
      }
      
      // Ajouter la classe de transition
      document.body.classList.add('page-transition');
      
      // Attendre la fin de l'animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mettre à jour l'historique
      if (pushState) {
        window.history.pushState({ path }, '', url);
      }
      
      // Charger la nouvelle page
      window.location.href = url;
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      
      // En cas d'erreur, naviguer normalement
      window.location.href = url;
    } finally {
      this.isNavigating = false;
    }
  }
  
  /**
   * Gère l'événement popstate
   * @param {PopStateEvent} e - Événement popstate
   */
  handlePopState(e) {
    // Obtenir le chemin
    const path = e.state?.path || window.location.pathname;
    
    // Naviguer sans ajouter d'entrée dans l'historique
    this.navigateTo(path, false);
  }
  
  /**
   * Initialise le menu mobile
   */
  initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        // Basculer la classe active
        mobileMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Mettre à jour l'attribut aria-expanded
        const isExpanded = mobileMenu.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        
        // Empêcher le défilement du body si le menu est ouvert
        document.body.style.overflow = isExpanded ? 'hidden' : '';
      });
      
      // Fermer le menu lors d'un clic sur un lien
      mobileMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          mobileMenu.classList.remove('active');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }
  }
  
  /**
   * Fait défiler la page vers un élément
   * @param {string} selector - Sélecteur de l'élément
   * @param {Object} options - Options de défilement
   */
  scrollToElement(selector, options = {}) {
    const element = document.querySelector(selector);
    
    if (element) {
      // Options par défaut
      const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        offset: 0
      };
      
      // Fusionner les options
      const scrollOptions = { ...defaultOptions, ...options };
      
      // Calculer la position
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - scrollOptions.offset;
      
      // Faire défiler
      window.scrollTo({
        top: offsetPosition,
        behavior: scrollOptions.behavior
      });
    }
  }
}

export default NavigationManager;
