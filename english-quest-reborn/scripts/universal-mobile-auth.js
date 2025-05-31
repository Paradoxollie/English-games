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
    this.isSyncing = false; // Protection contre les boucles
    this.lastSyncTime = 0; // Timestamp de la dernière sync
    this.syncCooldown = 1000; // Cooldown de 1 seconde entre les syncs
    
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
    // Protection contre les boucles infinies
    const now = Date.now();
    if (this.isSyncing || (now - this.lastSyncTime) < this.syncCooldown) {
      this.log(`🚫 Sync ignorée (cooldown: ${this.syncCooldown}ms, dernière: ${now - this.lastSyncTime}ms ago)`, 'warning');
      return false;
    }
    
    this.isSyncing = true;
    this.lastSyncTime = now;
    
    const detection = this.detectElements();
    
    if (!detection.hasDesktopButtons || !detection.hasMobileButtons) {
      this.log('❌ Éléments manquants pour la synchronisation', 'warn');
      this.log(`Desktop: ${detection.hasDesktopButtons}, Mobile: ${detection.hasMobileButtons}`, 'warn');
      return false;
    }

    const { elements } = detection;

    try {
      // Détecter l'état d'authentification avec plusieurs méthodes
      let isUserConnected = false;
      let detectionMethod = 'none';
      
      // Méthode 1: localStorage (plus fiable)
      const currentUserNew = localStorage.getItem('english_quest_current_user');
      const currentUserOld = localStorage.getItem('currentUser');
      
      if (currentUserNew && currentUserNew !== 'null' && currentUserNew !== 'undefined') {
        try {
          const user = JSON.parse(currentUserNew);
          isUserConnected = user && (user.uid || user.id || user.username);
          detectionMethod = 'localStorage-new';
          this.log(`🔍 Détection via localStorage NEW: ${isUserConnected} - Données: ${JSON.stringify(user)}`, 'info');
        } catch (e) {
          this.log(`❌ Erreur parsing localStorage NEW: ${e.message}`, 'warn');
        }
      }
      
      if (!isUserConnected && currentUserOld && currentUserOld !== 'null' && currentUserOld !== 'undefined') {
        try {
          const user = JSON.parse(currentUserOld);
          isUserConnected = user && (user.uid || user.id || user.username);
          detectionMethod = 'localStorage-old';
          this.log(`🔍 Détection via localStorage OLD: ${isUserConnected} - Données: ${JSON.stringify(user)}`, 'info');
        } catch (e) {
          this.log(`❌ Erreur parsing localStorage OLD: ${e.message}`, 'warn');
        }
      }
      
      // Méthode 2: Vérifier via les styles des boutons desktop (backup)
      if (!isUserConnected && elements.profileButton && elements.loginButton) {
        const profileStyle = window.getComputedStyle(elements.profileButton);
        const loginStyle = window.getComputedStyle(elements.loginButton);
        
        const profileVisible = profileStyle.display !== 'none' && elements.profileButton.offsetParent !== null;
        const loginVisible = loginStyle.display !== 'none' && elements.loginButton.offsetParent !== null;
        
        isUserConnected = profileVisible && !loginVisible;
        detectionMethod = 'desktop-buttons';
        
        this.log(`🔍 Détection via boutons desktop - Profil visible: ${profileVisible}, Login visible: ${loginVisible}, Connecté: ${isUserConnected}`, 'info');
      }

      // Afficher le résultat de détection
      this.log(`🎯 RÉSULTAT FINAL: Utilisateur ${isUserConnected ? 'CONNECTÉ' : 'NON CONNECTÉ'} (méthode: ${detectionMethod})`, isUserConnected ? 'success' : 'info');

      // Appliquer la logique avec force brute
      if (isUserConnected) {
        // Utilisateur connecté : cacher connexion, montrer profil et déconnexion
        this.log('👤 Configuration boutons pour utilisateur CONNECTÉ', 'success');
        
        // DESKTOP: Forcer l'affichage correct
        if (elements.loginButton) {
          elements.loginButton.style.display = 'none';
          elements.loginButton.setAttribute('hidden', 'true');
        }
        if (elements.profileButton) {
          elements.profileButton.style.display = 'inline-flex';
          elements.profileButton.removeAttribute('hidden');
        }
        
        // MOBILE: Configuration boutons
        if (elements.mobileLoginButton) {
          const mobileLoginLi = elements.mobileLoginButton.parentElement;
          if (mobileLoginLi) mobileLoginLi.style.display = 'none';
          elements.mobileLoginButton.style.display = 'none';
        }
        
        if (elements.mobileProfileButton) {
          const mobileProfileLi = elements.mobileProfileButton.parentElement;
          if (mobileProfileLi) mobileProfileLi.style.display = 'block';
          elements.mobileProfileButton.style.display = 'block';
          elements.mobileProfileButton.removeAttribute('hidden');
        }
        
        if (elements.mobileLogoutButton) {
          const mobileLogoutLi = elements.mobileLogoutButton.parentElement;
          if (mobileLogoutLi) mobileLogoutLi.style.display = 'block';
          elements.mobileLogoutButton.style.display = 'block';
          elements.mobileLogoutButton.removeAttribute('hidden');
        }
        
      } else {
        // Utilisateur non connecté : montrer connexion, cacher profil et déconnexion
        this.log('🚪 Configuration boutons pour utilisateur NON CONNECTÉ', 'info');
        
        // DESKTOP: Forcer l'affichage correct
        if (elements.loginButton) {
          elements.loginButton.style.display = 'inline-flex';
          elements.loginButton.removeAttribute('hidden');
        }
        if (elements.profileButton) {
          elements.profileButton.style.display = 'none';
          elements.profileButton.setAttribute('hidden', 'true');
        }
        
        // MOBILE: Configuration boutons
        if (elements.mobileLoginButton) {
          const mobileLoginLi = elements.mobileLoginButton.parentElement;
          if (mobileLoginLi) mobileLoginLi.style.display = 'block';
          elements.mobileLoginButton.style.display = 'block';
          elements.mobileLoginButton.removeAttribute('hidden');
        }
        
        if (elements.mobileProfileButton) {
          const mobileProfileLi = elements.mobileProfileButton.parentElement;
          if (mobileProfileLi) mobileProfileLi.style.display = 'none';
          elements.mobileProfileButton.style.display = 'none';
        }
        
        if (elements.mobileLogoutButton) {
          const mobileLogoutLi = elements.mobileLogoutButton.parentElement;
          if (mobileLogoutLi) mobileLogoutLi.style.display = 'none';
          elements.mobileLogoutButton.style.display = 'none';
        }
      }

      this.log(`✅ Synchronisation terminée: mode ${isUserConnected ? 'CONNECTÉ' : 'NON CONNECTÉ'} appliqué`, 'success');
      this.isSyncing = false; // Libérer le flag
      return true;
    } catch (error) {
      this.log(`❌ Erreur lors de la synchronisation: ${error.message}`, 'error');
      this.isSyncing = false; // Libérer le flag même en cas d'erreur
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
      // Ignorer les mutations si nous sommes en train de synchroniser
      if (this.isSyncing) {
        return;
      }
      
      let shouldSync = false;
      
      mutations.forEach((mutation) => {
        // Ignorer les changements de style que nous avons nous-mêmes faits
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'hidden' ||
             mutation.attributeName === 'class')) {
          
          // Vérifier si c'est un changement externe (pas le nôtre)
          const target = mutation.target;
          if (target && (target.id === 'loginButton' || target.id === 'profileButton')) {
            // Vérifier si le changement semble venir d'un autre script
            const now = Date.now();
            if ((now - this.lastSyncTime) > 2000) { // Seulement si ça fait plus de 2 secondes
              shouldSync = true;
            }
          }
        }
      });
      
      if (shouldSync) {
        this.log('🔄 Changement externe détecté sur les boutons desktop, re-synchronisation...', 'info');
        setTimeout(() => this.syncAuthButtons(), 500); // Délai plus long
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

    this.log('Observer configuré pour les boutons desktop (avec protection)', 'success');
    return true;
  }

  // Démarrer la synchronisation périodique
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    let lastAuthState = null;
    let syncCount = 0;
    
    // Synchroniser immédiatement puis périodiquement
    this.syncAuthButtons();
    
    this.syncInterval = setInterval(() => {
      syncCount++;
      
      try {
        // Détecter l'état actuel via localStorage (plus fiable)
        const currentUser = localStorage.getItem('english_quest_current_user') || 
                           localStorage.getItem('currentUser');
        const currentAuthState = currentUser && currentUser !== 'null' && currentUser !== 'undefined' ? 'connected' : 'disconnected';
        
        // Log périodique réduit
        if (syncCount % 30 === 0) { // Log toutes les 60 secondes au lieu de 20
          this.log(`🔄 [Sync #${syncCount}] État auth: ${currentAuthState}`, 'info');
        }
        
        // Synchroniser seulement si l'état a changé OU tous les 2 minutes (force refresh)
        if (lastAuthState !== currentAuthState || syncCount % 60 === 0) { // 60 = 2 minutes
          if (lastAuthState !== currentAuthState) {
            this.log(`🔄 Changement d'état détecté: ${lastAuthState} → ${currentAuthState}`, 'info');
          } else {
            this.log(`🔄 Synchronisation forcée périodique (#${syncCount})`, 'info');
          }
          
          this.syncAuthButtons();
          lastAuthState = currentAuthState;
        }
      } catch (error) {
        this.log(`Erreur lors de la vérification périodique: ${error.message}`, 'warn');
      }
    }, 2000); // Toujours vérifier toutes les 2 secondes
    
    this.log('Synchronisation périodique démarrée (réduite pour moins de spam)', 'success');
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

  // Fonction de test manuel (accessible depuis la console)
  testSync() {
    this.log('🧪 TEST MANUEL DE SYNCHRONISATION', 'info');
    this.log('📍 Éléments détectés:', 'info');
    
    const detection = this.detectElements();
    console.log('Detection result:', detection);
    
    this.log('🔄 Lancement synchronisation...', 'info');
    const result = this.syncAuthButtons();
    
    this.log(`📊 Résultat test: ${result ? 'SUCCÈS' : 'ÉCHEC'}`, result ? 'success' : 'error');
    return result;
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