/**
 * Universal Mobile Auth Manager
 * Gère la synchronisation des boutons d'authentification mobile sur toutes les pages
 * Version: 1.0.0
 */

class UniversalMobileAuth {
  constructor() {
    this.isInitialized = false;
    this.debug = true;
    this.syncInterval = null;
    this.retryCount = 0;
    this.maxRetries = 10;
  }

  log(message, type = 'info') {
    if (!this.debug) return;
    const prefix = '🔗 [UniversalMobileAuth]';
    switch (type) {
      case 'error':
        console.error(`${prefix} ❌`, message);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️`, message);
        break;
      case 'success':
        console.log(`${prefix} ✅`, message);
        break;
      default:
        console.log(`${prefix}`, message);
    }
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

  // Synchroniser l'état des boutons
  syncAuthButtons() {
    const detection = this.detectElements();
    
    if (!detection.hasDesktopButtons || !detection.hasMobileButtons) {
      this.log('Éléments manquants pour la synchronisation', 'warn');
      return false;
    }

    const { elements } = detection;

    try {
      // Synchroniser connexion
      if (elements.loginButton && elements.mobileLoginButton) {
        const isLoginVisible = window.getComputedStyle(elements.loginButton).display !== 'none';
        const mobileLoginLi = elements.mobileLoginButton.parentElement;
        
        if (mobileLoginLi) {
          mobileLoginLi.style.display = isLoginVisible ? 'block' : 'none';
        }
        elements.mobileLoginButton.style.display = isLoginVisible ? 'block' : 'none';
      }

      // Synchroniser profil
      if (elements.profileButton && elements.mobileProfileButton) {
        const isProfileVisible = window.getComputedStyle(elements.profileButton).display !== 'none';
        const mobileProfileLi = elements.mobileProfileButton.parentElement;
        
        if (mobileProfileLi) {
          mobileProfileLi.style.display = isProfileVisible ? 'block' : 'none';
        }
        elements.mobileProfileButton.style.display = isProfileVisible ? 'block' : 'none';
      }

      // Gérer déconnexion (visible seulement si connecté)
      if (elements.mobileLogoutButton) {
        const isUserConnected = elements.profileButton && 
                               window.getComputedStyle(elements.profileButton).display !== 'none';
        const mobileLogoutLi = elements.mobileLogoutButton.parentElement;
        
        if (mobileLogoutLi) {
          mobileLogoutLi.style.display = isUserConnected ? 'block' : 'none';
        }
        elements.mobileLogoutButton.style.display = isUserConnected ? 'block' : 'none';
      }

      return true;
    } catch (error) {
      this.log(`Erreur lors de la synchronisation: ${error.message}`, 'error');
      return false;
    }
  }

  // Initialiser le menu mobile
  initMobileMenu() {
    const detection = this.detectElements();
    
    if (!detection.hasMenuSystem) {
      this.log('Système de menu non détecté', 'warn');
      return false;
    }

    const { elements } = detection;

    try {
      // Toggle du menu mobile
      elements.menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        this.log('Toggle menu clicked');
        
        elements.menuToggle.classList.toggle('active');
        elements.nav.classList.toggle('active');
        
        if (elements.nav.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
          this.log('Menu ouvert');
        } else {
          document.body.style.overflow = 'auto';
          this.log('Menu fermé');
        }
      });

      // Fermer le menu sur clic de lien
      const navLinks = elements.nav.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.log('Lien cliqué, fermeture menu');
          this.closeMenu();
        });
      });

      // Fermer le menu sur clic en dehors
      document.addEventListener('click', (event) => {
        if (!elements.menuToggle.contains(event.target) && 
            !elements.nav.contains(event.target) && 
            elements.nav.classList.contains('active')) {
          this.log('Clic extérieur, fermeture menu');
          this.closeMenu();
        }
      });

      // Fermer le menu au redimensionnement
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          this.closeMenu();
        }
      });

      this.log('Menu mobile initialisé', 'success');
      return true;
    } catch (error) {
      this.log(`Erreur initialisation menu: ${error.message}`, 'error');
      return false;
    }
  }

  // Fermer le menu
  closeMenu() {
    const elements = this.detectElements().elements;
    if (elements.menuToggle && elements.nav) {
      elements.menuToggle.classList.remove('active');
      elements.nav.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  // Configurer la déconnexion
  initLogoutHandler() {
    const elements = this.detectElements().elements;
    
    if (!elements.mobileLogoutButton) {
      this.log('Bouton de déconnexion mobile non trouvé', 'warn');
      return false;
    }

    elements.mobileLogoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.log('Déconnexion via menu mobile');
      
      // Utiliser le service d'authentification si disponible
      if (window.authService && typeof window.authService.logout === 'function') {
        window.authService.logout();
      } else {
        // Fallback manuel
        this.log('Fallback déconnexion manuelle');
        localStorage.removeItem('english_quest_current_user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('englishQuestUserId');
      }
      
      // Fermer le menu et rediriger
      this.closeMenu();
      
      setTimeout(() => {
        window.location.href = window.location.pathname.includes('/') ? '../index.html' : 'index.html';
      }, 300);
    });

    this.log('Gestionnaire de déconnexion configuré', 'success');
    return true;
  }

  // Observer les changements des boutons desktop
  observeDesktopButtons() {
    const elements = this.detectElements().elements;
    
    if (!elements.loginButton || !elements.profileButton) {
      this.log('Boutons desktop non trouvés pour observation', 'warn');
      return false;
    }

    const observer = new MutationObserver(() => {
      this.syncAuthButtons();
    });

    // Observer les changements de style
    observer.observe(elements.loginButton, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
    
    observer.observe(elements.profileButton, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });

    this.log('Observateurs configurés pour les boutons desktop', 'success');
    return true;
  }

  // Synchronisation périodique de secours
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncAuthButtons();
    }, 2000);

    this.log('Synchronisation périodique démarrée (2s)', 'success');
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
    
    // Forcer l'affichage d'un message visible pour debug
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: red;
      color: white;
      padding: 5px;
      z-index: 99999;
      font-size: 12px;
    `;
    debugDiv.textContent = '🔧 UniversalMobileAuth ACTIF';
    document.body.appendChild(debugDiv);
    
    // Attendre un peu que la page soit prête
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = await this.attemptInit();
    
    // Mettre à jour le debug
    debugDiv.textContent = result ? '✅ UniversalMobileAuth OK' : '❌ UniversalMobileAuth ERREUR';
    debugDiv.style.background = result ? 'green' : 'red';
    
    // Enlever le debug après 5 secondes
    setTimeout(() => {
      if (debugDiv.parentNode) {
        debugDiv.parentNode.removeChild(debugDiv);
      }
    }, 5000);
    
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