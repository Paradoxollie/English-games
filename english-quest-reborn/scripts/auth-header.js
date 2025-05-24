/**
 * Script pour gérer l'affichage du header en fonction de l'état d'authentification
 */

document.addEventListener('DOMContentLoaded', async function() {
  console.log("Initialisation du header d'authentification...");
  
  // Attendre que authService soit disponible (il sera chargé par auth-service.js)
  let authService = null;
  let attempts = 0;
  const maxAttempts = 50;
  
  while (!authService && attempts < maxAttempts) {
    if (window.authService) {
      authService = window.authService;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  if (!authService) {
    console.error("authService non disponible après", maxAttempts, "tentatives");
    return;
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
  function updateUI(user) {
    console.log("Mise à jour de l'UI avec l'utilisateur:", user ? (user.displayName || user.email || user.username || "Utilisateur connecté") : "Déconnecté");
    
        // Supprimer les boutons de déconnexion existants pour éviter les doublons    const existingLogoutButton = document.getElementById('logoutButton');    if (existingLogoutButton) {      existingLogoutButton.remove();    }
    
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
          console.log("Clic sur le bouton de déconnexion");
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
  const currentUser = authService.getCurrentUser();
  updateUI(currentUser);
  console.log("Interface initialisée avec l'état d'authentification actuel");

  // Ajouter un écouteur pour les changements d'état d'authentification
  authService.addAuthStateListener(updateUI);
  console.log("Écouteur d'état d'authentification ajouté");
});
