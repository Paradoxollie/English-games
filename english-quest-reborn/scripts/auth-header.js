/**
 * Script pour gérer l'affichage du header en fonction de l'état d'authentification
 */

import { authService } from './auth-service.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Initialiser le service d'authentification
  await authService.init();
  
  // Récupérer les éléments du menu utilisateur
  const userMenu = document.getElementById('userMenu');
  const loginButton = document.getElementById('loginButton');
  const profileButton = document.getElementById('profileButton');
  
  if (!userMenu) return;

  // Fonction pour mettre à jour l'interface
  function updateUI(user) {
    if (user) {
      // L'utilisateur est connecté
      if (loginButton) loginButton.style.display = 'none';
      if (profileButton) {
        profileButton.style.display = 'inline-block';
        profileButton.textContent = user.displayName || 'Mon Profil';
      }
    } else {
      // L'utilisateur n'est pas connecté
      if (loginButton) loginButton.style.display = 'inline-block';
      if (profileButton) profileButton.style.display = 'none';
    }
  }

  // Mettre à jour l'UI avec l'état initial
  updateUI(authService.currentUser);

  // Écouter les changements d'état d'authentification
  const auth = authService.auth;
  auth.onAuthStateChanged(user => {
    updateUI(user);
  });
});
