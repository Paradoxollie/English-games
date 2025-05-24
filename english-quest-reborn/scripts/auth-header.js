/**
 * Script pour gérer l'affichage du header en fonction de l'état d'authentification
 */

document.addEventListener('DOMContentLoaded', async function() {
  console.log("Initialisation du header d'authentification...");
  
  // Système d'authentification simple pour le mode standalone
  const simpleAuth = {
    getCurrentUser: async function() {
      try {
        // Utiliser la même logique que le service principal
        const userId = localStorage.getItem('englishQuestUserId');
        console.log('🔍 [Auth Header] ID utilisateur récupéré:', userId);
        
        if (!userId || userId === "undefined" || userId === "null") {
          console.log('❌ [Auth Header] Aucun ID utilisateur valide trouvé');
          return null;
        }
        
        // Si window.authService est disponible, l'utiliser pour récupérer les données complètes
        if (window.authService && typeof window.authService.loadUserData === 'function') {
          console.log('🔄 [Auth Header] Utilisation de authService.loadUserData');
          try {
            const userData = await window.authService.loadUserData(userId);
            if (userData) {
              console.log('✅ [Auth Header] Données utilisateur récupérées:', userData.username || userData.displayName || 'Utilisateur');
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
        
      } catch (e) {
        console.warn('❌ [Auth Header] Erreur lecture session:', e);
        return null;
      }
    },
    logout: function() {
      localStorage.removeItem('englishQuestUserId');
      localStorage.removeItem('englishQuestIsAdmin');
      console.log('🚪 [Auth Header] Session supprimée');
    },
    addAuthStateListener: function(callback) {
      // Simple polling pour détecter les changements
      let lastUserId = localStorage.getItem('englishQuestUserId');
      setInterval(async () => {
        const currentUserId = localStorage.getItem('englishQuestUserId');
        const userChanged = (lastUserId && !currentUserId) || (!lastUserId && currentUserId) || 
                           (lastUserId !== currentUserId);
        if (userChanged) {
          console.log('🔄 [Auth Header] Changement d\'état détecté');
          lastUserId = currentUserId;
          const currentUser = await this.getCurrentUser();
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
    
    console.log("🔄 Mise à jour de l'UI avec l'utilisateur:", user ? (user.displayName || user.username || user.email || "Utilisateur connecté") : "Déconnecté");
    
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
        
        // Mettre à jour le texte du bouton (nom d'utilisateur ou texte par défaut)
        if (user.displayName) {
          profileButton.textContent = user.displayName;
        } else if (user.username) {
          profileButton.textContent = user.username;
        } else if (user.email) {
          profileButton.textContent = user.email.split('@')[0];
        } else {
          profileButton.textContent = 'Mon Profil';
        }
        
        console.log("✅ Bouton de profil affiché avec le texte:", profileButton.textContent);
        
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
  console.log('👤 [Auth Header] Utilisateur initial récupéré:', currentUser ? 'Connecté' : 'Déconnecté');
  await updateUI(currentUser);
  console.log("✅ Interface initialisée avec l'état d'authentification actuel");

  // Ajouter un écouteur pour les changements d'état d'authentification
  authService.addAuthStateListener(updateUI);
  console.log("👂 Écouteur d'état d'authentification ajouté");
});
