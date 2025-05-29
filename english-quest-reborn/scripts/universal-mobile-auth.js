/**
 * Universal Mobile Auth Manager
 * Gère la synchronisation des boutons d'authentification mobile sur toutes les pages
 * Version: 1.0.0
 */

class UniversalMobileAuth {
  constructor() {
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 10;
    this.syncInterval = null;
    this.elements = {};
    this.observer = null;
    
    // Injecter les styles CSS manquants
    this.injectRequiredStyles();
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [UniversalMobileAuth] ${message}`);
  }

  // Injecter les styles CSS critiques pour le menu mobile
  injectRequiredStyles() {
    const style = document.createElement('style');
    style.id = 'universal-mobile-auth-styles';
    style.textContent = `
      /* Forcer la logique mobile/desktop pour les boutons d'authentification */
      @media (min-width: 769px) {
        .mobile-only {
          display: none !important;
        }
        .menu-toggle {
          display: none !important;
        }
        .nav {
          display: flex !important;
          position: static !important;
          background: none !important;
          border: none !important;
          padding: 0 !important;
          transform: none !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      }
      
      @media (max-width: 768px) {
        /* Cacher les boutons desktop sur mobile */
        .user-menu .btn-login {
          display: none !important;
        }
        
        /* Afficher les boutons mobile */
        .mobile-only {
          display: block !important;
        }
        
        /* Menu toggle visible */
        .menu-toggle {
          display: block !important;
        }
        
        /* Menu mobile fermé par défaut */
        .nav {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(18, 18, 18, 0.98);
          border-top: 1px solid rgba(46, 204, 113, 0.2);
          padding: 1rem;
          z-index: 999;
        }
        
        /* Menu mobile ouvert */
        .nav.active {
          display: block !important;
        }
        
        /* Navigation mobile */
        .nav-list {
          flex-direction: column !important;
          gap: 1rem !important;
          text-align: center !important;
        }
        
        .nav-link {
          display: block !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          background: #1e1e1e !important;
          transition: all 0.3s ease !important;
          color: rgba(255, 255, 255, 0.7) !important;
          text-decoration: none !important;
        }
        
        .nav-link:hover {
          background: #2a2a2a !important;
          color: #2ecc71 !important;
          transform: translateY(-2px) !important;
        }
      }
    `;
    
    // Injecter les styles dans le head
    document.head.appendChild(style);
    this.log('Styles CSS injectés', 'success');
  }

  // Détecter les éléments nécessaires
  detectElements() {
    const elements = {
      // Boutons desktop
      loginButton: document.getElementById('loginButton'),
      profileButton: document.getElementById('profileButton'),
      
      // Boutons mobile
      mobileLoginButton: document.getElementById('mobileLoginButton'),
      mobileProfileButton: document.getElementById('mobileProfileButton'),
      mobileLogoutButton: document.getElementById('mobileLogoutButton'),
      
      // Navigation
      menuToggle: document.querySelector('.menu-toggle'),
      nav: document.querySelector('.nav')
    };

    const hasDesktopButtons = elements.loginButton && elements.profileButton;
    const hasMobileButtons = elements.mobileLoginButton && elements.mobileProfileButton && elements.mobileLogoutButton;
    const hasMenuSystem = elements.menuToggle && elements.nav;

    this.log(`Éléments détectés - Desktop: ${hasDesktopButtons}, Mobile: ${hasMobileButtons}, Menu: ${hasMenuSystem}`);
    
    return {
      elements,
      hasDesktopButtons,
      hasMobileButtons,
      hasMenuSystem,
      isReady: hasDesktopButtons && hasMobileButtons && hasMenuSystem
    };
  }

  // Synchroniser l'état des boutons d'authentification
  syncAuthButtons() {
    const detection = this.detectElements();
    
    if (!detection.hasDesktopButtons || !detection.hasMobileButtons) {
      this.log('Éléments manquants pour la synchronisation', 'warn');
      return false;
    }

    const { elements } = detection;

    try {
      // Détecter l'état d'authentification de manière plus robuste
      let isUserConnected = false;
      let detectionMethod = 'none';
      
      // Méthode 1: Vérifier via les classes/styles des boutons desktop
      if (elements.profileButton && elements.loginButton) {
        const profileVisible = elements.profileButton.style.display !== 'none' && 
                              !elements.profileButton.hasAttribute('hidden') &&
                              elements.profileButton.offsetParent !== null;
        const loginVisible = elements.loginButton.style.display !== 'none' && 
                             !elements.loginButton.hasAttribute('hidden') &&
                             elements.loginButton.offsetParent !== null;
        
        isUserConnected = profileVisible && !loginVisible;
        detectionMethod = 'desktop-buttons';
        
        this.log(`🔍 État détecté via boutons desktop - Profil: ${profileVisible}, Login: ${loginVisible}, Connecté: ${isUserConnected}`, 'info');
      }
      
      // Méthode 2: Vérifier via localStorage (backup)
      if (!isUserConnected) {
        const currentUser = localStorage.getItem('english_quest_current_user') || 
                           localStorage.getItem('currentUser');
        if (currentUser && currentUser !== 'null' && currentUser !== 'undefined') {
          try {
            const user = JSON.parse(currentUser);
            isUserConnected = user && (user.uid || user.id || user.username);
            detectionMethod = 'localStorage';
            this.log(`🔍 État détecté via localStorage: ${isUserConnected} (${detectionMethod})`, 'info');
          } catch (e) {
            this.log(`❌ Erreur parsing localStorage: ${e.message}`, 'warn');
          }
        }
      }

      // Afficher le résultat de détection
      this.log(`🎯 RÉSULTAT FINAL: Utilisateur ${isUserConnected ? 'CONNECTÉ' : 'NON CONNECTÉ'} (méthode: ${detectionMethod})`, isUserConnected ? 'success' : 'info');

      // Appliquer la logique selon l'état
      if (isUserConnected) {
        // Utilisateur connecté : montrer profil et déconnexion, cacher connexion
        this.log('👤 Configuration boutons mobile pour utilisateur connecté', 'success');
        
        // Cacher connexion mobile
        if (elements.mobileLoginButton) {
          const mobileLoginLi = elements.mobileLoginButton.parentElement;
          if (mobileLoginLi) mobileLoginLi.style.display = 'none';
          elements.mobileLoginButton.style.display = 'none';
        }
        
        // Montrer profil mobile
        if (elements.mobileProfileButton) {
          const mobileProfileLi = elements.mobileProfileButton.parentElement;
          if (mobileProfileLi) mobileProfileLi.style.display = 'block';
          elements.mobileProfileButton.style.display = 'block';
        }
        
        // Montrer déconnexion mobile
        if (elements.mobileLogoutButton) {
          const mobileLogoutLi = elements.mobileLogoutButton.parentElement;
          if (mobileLogoutLi) mobileLogoutLi.style.display = 'block';
          elements.mobileLogoutButton.style.display = 'block';
        }
      } else {
        // Utilisateur non connecté : montrer connexion, cacher profil et déconnexion
        this.log('🚪 Configuration boutons mobile pour utilisateur non connecté', 'info');
        
        // Montrer connexion mobile
        if (elements.mobileLoginButton) {
          const mobileLoginLi = elements.mobileLoginButton.parentElement;
          if (mobileLoginLi) mobileLoginLi.style.display = 'block';
          elements.mobileLoginButton.style.display = 'block';
        }
        
        // Cacher profil mobile
        if (elements.mobileProfileButton) {
          const mobileProfileLi = elements.mobileProfileButton.parentElement;
          if (mobileProfileLi) mobileProfileLi.style.display = 'none';
          elements.mobileProfileButton.style.display = 'none';
        }
        
        // Cacher déconnexion mobile
        if (elements.mobileLogoutButton) {
          const mobileLogoutLi = elements.mobileLogoutButton.parentElement;
          if (mobileLogoutLi) mobileLogoutLi.style.display = 'none';
          elements.mobileLogoutButton.style.display = 'none';
        }
      }

      this.log(`✅ Synchronisation terminée: boutons ${isUserConnected ? 'connecté' : 'non connecté'} affichés`, 'success');
      return true;
    } catch (error) {
      this.log(`Erreur lors de la synchronisation: ${error.message}`, 'error');
      return false;
    }
  }

  // Initialiser le menu mobile avec gestion forcée
  initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (!menuToggle || !nav) {
      this.log('Éléments menu toggle ou nav introuvables', 'warning');
      return false;
    }

    // Forcer l'état initial du menu (fermé)
    nav.classList.remove('active');
    
    // Nettoyer les anciens event listeners
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
    
    // Ajouter le nouveau event listener
    newMenuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.log('Burger menu cliqué !', 'success');
      
      // Toggle avec force brute
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
        nav.style.display = 'none';
        this.log('Menu fermé', 'success');
      } else {
        nav.classList.add('active');
        nav.style.display = 'block';
        this.log('Menu ouvert', 'success');
      }
    });
    
    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !newMenuToggle.contains(e.target)) {
        nav.classList.remove('active');
        nav.style.display = 'none';
      }
    });
    
    // Fermer le menu sur les liens internes
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        nav.style.display = 'none';
      });
    });
    
    this.log('Menu mobile initialisé avec succès', 'success');
    return true;
  }

  // Configurer la déconnexion mobile
  initLogoutHandler() {
    const elements = this.detectElements().elements;
    
    if (!elements.mobileLogoutButton) {
      this.log('Bouton de déconnexion mobile non trouvé', 'warn');
      return false;
    }

    elements.mobileLogoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      this.log('🚪 Déconnexion mobile demandée', 'info');
      
      try {
        // Nettoyer le localStorage
        localStorage.removeItem('english_quest_current_user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('englishQuestUserId');
        
        // Déclencher la déconnexion via auth-service si disponible
        if (window.authService && typeof window.authService.logout === 'function') {
          window.authService.logout();
        }
        
        // Fermer le menu mobile
        const nav = document.querySelector('.nav');
        if (nav) {
          nav.classList.remove('active');
          nav.style.display = 'none';
        }
        
        // Forcer la synchronisation immédiate
        setTimeout(() => {
          this.syncAuthButtons();
          this.log('🔄 Synchronisation forcée après déconnexion', 'success');
        }, 100);
        
        // Rediriger vers la page de connexion
        setTimeout(() => {
          window.location.href = window.location.pathname.includes('/') ? 'login.html' : 'login.html';
        }, 500);
        
      } catch (error) {
        this.log(`Erreur lors de la déconnexion: ${error.message}`, 'error');
      }
    });

    this.log('Handler de déconnexion mobile configuré', 'success');
    return true;
  }

  // Observer les changements sur les boutons desktop
  observeDesktopButtons() {
    const detection = this.detectElements();
    
    if (!detection.hasDesktopButtons) {
      this.log('Pas de boutons desktop à observer', 'warn');
      return false;
    }

    const { elements } = detection;
    
    // Observer les changements avec MutationObserver
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldSync = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'hidden' ||
             mutation.attributeName === 'class')) {
          shouldSync = true;
        }
      });
      
      if (shouldSync) {
        this.log('🔄 Changement détecté sur les boutons desktop, re-synchronisation...', 'info');
        setTimeout(() => this.syncAuthButtons(), 100);
      }
    });

    // Observer les boutons desktop
    [elements.loginButton, elements.profileButton].forEach(button => {
      if (button) {
        this.observer.observe(button, {
          attributes: true,
          attributeFilter: ['style', 'hidden', 'class']
        });
      }
    });

    // Observer aussi les changements dans localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      originalSetItem.call(localStorage, key, value);
      
      if (key === 'english_quest_current_user' || key === 'currentUser') {
        this.log('🔄 Changement localStorage détecté, re-synchronisation...', 'info');
        setTimeout(() => this.syncAuthButtons(), 200);
      }
    };

    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = (key) => {
      originalRemoveItem.call(localStorage, key);
      
      if (key === 'english_quest_current_user' || key === 'currentUser') {
        this.log('🔄 Suppression localStorage détectée, re-synchronisation...', 'info');
        setTimeout(() => this.syncAuthButtons(), 200);
      }
    };

    this.log('Observer configuré pour les boutons desktop et localStorage', 'success');
    return true;
  }

  // Démarrer la synchronisation périodique
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    let lastAuthState = null;
    
    this.syncInterval = setInterval(() => {
      try {
        // Détecter l'état actuel
        const currentUser = localStorage.getItem('english_quest_current_user') || 
                           localStorage.getItem('currentUser');
        const currentAuthState = currentUser && currentUser !== 'null' && currentUser !== 'undefined' ? 'connected' : 'disconnected';
        
        // Synchroniser seulement si l'état a changé
        if (lastAuthState !== currentAuthState) {
          this.log(`🔄 Changement d'état détecté: ${lastAuthState} → ${currentAuthState}`, 'info');
          this.syncAuthButtons();
          lastAuthState = currentAuthState;
        }
      } catch (error) {
        this.log(`Erreur lors de la vérification périodique: ${error.message}`, 'warn');
      }
    }, 2000); // Vérifier toutes les 2 secondes
    
    this.log('Synchronisation périodique démarrée (toutes les 2s)', 'success');
  }

  // Arrêter la synchronisation périodique
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.log('Synchronisation périodique arrêtée');
    }
  }

  // Tentative d'initialisation avec retry
  async attemptInit() {
    return new Promise((resolve) => {
      const tryInit = () => {
        this.retryCount++;
        this.log(`Tentative d'initialisation ${this.retryCount}/${this.maxRetries}`);
        
        const detection = this.detectElements();
        
        if (detection.isReady) {
          // Tout est prêt, initialiser
          const menuOk = this.initMobileMenu();
          const logoutOk = this.initLogoutHandler();
          const observerOk = this.observeDesktopButtons();
          
          // Synchronisation initiale
          setTimeout(() => this.syncAuthButtons(), 500);
          setTimeout(() => this.syncAuthButtons(), 1500);
          setTimeout(() => this.syncAuthButtons(), 3000);
          
          // Démarrer la synchronisation périodique
          this.startPeriodicSync();
          
          this.isInitialized = true;
          this.log('Initialisation réussie', 'success');
          resolve(true);
          
        } else if (this.retryCount < this.maxRetries) {
          // Retry après 500ms
          setTimeout(tryInit, 500);
        } else {
          this.log('Échec initialisation après maximum de tentatives', 'error');
          resolve(false);
        }
      };
      
      tryInit();
    });
  }

  // Initialisation principale
  async init() {
    if (this.isInitialized) {
      this.log('Déjà initialisé');
      return true;
    }

    this.log('🚀 DÉMARRAGE INITIALISATION UNIVERSELLE...');
    
    // Attendre un peu que la page soit prête
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = await this.attemptInit();
    
    this.log(result ? '✅ UniversalMobileAuth initialisé avec succès' : '❌ Échec initialisation UniversalMobileAuth');
    
    return result;
  }

  // Nettoyage
  destroy() {
    this.stopPeriodicSync();
    this.isInitialized = false;
    this.log('Service détruit');
  }
}

// Instance globale
window.universalMobileAuth = new UniversalMobileAuth();

// Auto-initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      window.universalMobileAuth.init();
    }, 100);
  });
} else {
  // DOM déjà prêt
  setTimeout(() => {
    window.universalMobileAuth.init();
  }, 100);
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UniversalMobileAuth;
} 