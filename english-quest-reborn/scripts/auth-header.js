/**
 * Script pour gérer l'affichage du header en fonction de l'état d'authentification
 */

document.addEventListener('DOMContentLoaded', async function() {
  console.log("Initialisation du header d'authentification...");
  
  // Clés localStorage exactement comme dans firebase-config.js
  const LOCALSTORAGE_KEYS = {
    USERS: 'english_quest_users',
    CURRENT_USER: 'english_quest_current_user',
    LEGACY_USERS: 'users',
    LEGACY_CURRENT_USER: 'currentUser',
    USER_PROFILE: 'userProfile',
    USER_ID: 'englishQuestUserId'
  };
  
  // Système d'authentification simple pour le mode standalone
  const simpleAuth = {
    getCurrentUser: async function() {
      try {
        console.log('🔍 [Auth Header] Recherche utilisateur avec toutes les méthodes...');
        
        // MÉTHODE 1 : Exactement comme firebase-config.js
        // Essayer d'abord la nouvelle clé
        let userData = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
        if (userData) {
          try {
            const user = JSON.parse(userData);
            console.log('✅ [Auth Header] Utilisateur trouvé via CURRENT_USER:', user.username || user.displayName || 'Utilisateur');
            return user;
          } catch (e) {
            console.warn('⚠️ [Auth Header] Erreur parsing CURRENT_USER:', e);
          }
        }

        // Essayer ensuite l'ancienne clé
        userData = localStorage.getItem(LOCALSTORAGE_KEYS.LEGACY_CURRENT_USER);
        if (userData) {
          try {
            const user = JSON.parse(userData);
            console.log('✅ [Auth Header] Utilisateur trouvé via LEGACY_CURRENT_USER:', user.username || user.displayName || 'Utilisateur');
            return user;
          } catch (e) {
            console.warn('⚠️ [Auth Header] Erreur parsing LEGACY_CURRENT_USER:', e);
          }
        }
        
        // MÉTHODE 2 : Nouvelle approche avec englishQuestUserId
        const userId = localStorage.getItem(LOCALSTORAGE_KEYS.USER_ID);
        if (userId && userId !== "undefined" && userId !== "null") {
          console.log('🔄 [Auth Header] ID utilisateur trouvé, recherche des données:', userId);
          
          // Si window.authService est disponible, l'utiliser pour récupérer les données complètes
          if (window.authService && typeof window.authService.loadUserData === 'function') {
            console.log('🔄 [Auth Header] Utilisation de authService.loadUserData');
            try {
              const userData = await window.authService.loadUserData(userId);
              if (userData) {
                console.log('✅ [Auth Header] Données utilisateur récupérées via authService:', userData.username || userData.displayName || 'Utilisateur');
                return { uid: userId, ...userData };
              }
            } catch (error) {
              console.warn('⚠️ [Auth Header] Erreur loadUserData:', error);
            }
          }
          
          // Fallback : créer un objet utilisateur minimal avec l'ID
          console.log('📝 [Auth Header] Création objet utilisateur minimal');
          return { 
            uid: userId, 
            id: userId,
            username: `Utilisateur ${userId.substring(0, 8)}`,
            displayName: `Utilisateur ${userId.substring(0, 8)}`
          };
        }
        
        console.log('❌ [Auth Header] Aucun utilisateur trouvé');
        return null;
        
      } catch (e) {
        console.warn('❌ [Auth Header] Erreur lecture session:', e);
        return null;
      }
    },
    logout: function() {
      // Nettoyer toutes les clés d'authentification
      localStorage.removeItem(LOCALSTORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(LOCALSTORAGE_KEYS.LEGACY_CURRENT_USER);
      localStorage.removeItem(LOCALSTORAGE_KEYS.USER_ID);
      localStorage.removeItem('englishQuestIsAdmin');
      console.log('🚪 [Auth Header] Session supprimée');
    },
    addAuthStateListener: function(callback) {
      // Simple polling pour détecter les changements
      let lastState = null;
      setInterval(async () => {
        const currentUser = await this.getCurrentUser();
        const currentState = currentUser ? (currentUser.username || currentUser.uid) : null;
        
        if (lastState !== currentState) {
          console.log('🔄 [Auth Header] Changement d\'état détecté');
          lastState = currentState;
          callback(currentUser);
        }
      }, 2000);
    },
    init: async function() {
      console.log('🚀 [Auth Header] Initialisation du système simple');
      return Promise.resolve();
    }
  };

  // Utiliser authService si disponible, sinon utiliser simpleAuth
  let authService = window.authService || simpleAuth;
  
  if (!window.authService) {
    console.log("Utilisation du système d'authentification simplifié");
  } else {
    console.log("✅ Service d'authentification principal détecté");
  }

  // Initialiser le service d'authentification
  await authService.init();
  
  // Récupérer les éléments du menu utilisateur
  const userMenu = document.getElementById('userMenu');
  const loginButton = document.getElementById('loginButton');
  const profileButton = document.getElementById('profileButton');
  
  if (!userMenu) {
    console.warn("Menu utilisateur non trouvé dans la page");
    return;
  }

  // Fonction pour nettoyer et mettre à jour l'interface
  async function updateUI(user) {
    // Si on n'a pas encore d'utilisateur, essayer de le récupérer
    if (!user) {
      user = await authService.getCurrentUser();
    }
    
    console.log("🔄 Mise à jour de l'UI avec l'utilisateur:", user ? (user.username || "Utilisateur connecté") : "Déconnecté");
    
    // Supprimer tous les boutons de déconnexion existants pour éviter les doublons
    const existingLogoutButtons = document.querySelectorAll('[id^="logoutButton"], .btn-logout[id*="logout"]');
    existingLogoutButtons.forEach(btn => {
      if (btn && btn.parentNode) {
        btn.remove();
        console.log('🗑️ Bouton de déconnexion supprimé:', btn.textContent);
      }
    });
    
    if (user) {
      // L'utilisateur est connecté - MASQUER le bouton de connexion
      if (loginButton) {
        loginButton.style.display = 'none';
        console.log("✅ Bouton de connexion masqué");
      }
      
      if (profileButton) {
        profileButton.style.display = 'inline-flex';
        
        // Mettre à jour le texte du bouton EXACTEMENT comme sur la page index
        // Priorité : username UNIQUEMENT (site RGPD sans email)
        let displayText = 'Mon Profil';
        
        if (user.username && user.username !== '') {
          displayText = user.username;
        }
        // Pas d'email dans un site RGPD - directement "Mon Profil" en fallback
        
        profileButton.textContent = displayText;
        console.log("✅ Bouton de profil affiché avec le texte:", displayText);
        
        // Ajouter un bouton de déconnexion
        const logoutButton = document.createElement('a');
        logoutButton.id = 'logoutButton';
        logoutButton.className = 'btn-login';
        logoutButton.style.cssText = 'margin-left: 10px; background: linear-gradient(135deg, #e74c3c, #c0392b); border-color: #e74c3c;';
        logoutButton.textContent = 'Déconnexion';
        logoutButton.href = '#';
        logoutButton.addEventListener('click', async (e) => {
          e.preventDefault();
          console.log("🚪 Clic sur le bouton de déconnexion");
          await authService.logout();
          window.location.reload(); // Recharger pour nettoyer l'état
        });
        
        userMenu.appendChild(logoutButton);
        console.log("✅ Bouton de déconnexion ajouté");
      }
    } else {
      // L'utilisateur n'est pas connecté - AFFICHER le bouton de connexion
      if (loginButton) {
        loginButton.style.display = 'inline-flex';
        console.log("✅ Bouton de connexion affiché");
      }
      
      if (profileButton) {
        profileButton.style.display = 'none';
        console.log("✅ Bouton de profil masqué");
      }
    }
  }

  // Mettre à jour l'UI avec l'état initial
  const currentUser = await authService.getCurrentUser();
  console.log('👤 [Auth Header] Utilisateur initial récupéré:', currentUser ? (currentUser.username || 'Connecté') : 'Déconnecté');
  await updateUI(currentUser);
  console.log("✅ Interface initialisée avec l'état d'authentification actuel");

  // Ajouter un écouteur pour les changements d'état d'authentification
  authService.addAuthStateListener(updateUI);
  console.log("👂 Écouteur d'état d'authentification ajouté");
});
