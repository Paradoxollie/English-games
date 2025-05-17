/**
 * Script pour gérer l'affichage du header en fonction de l'état d'authentification
 */

import { getAuthState } from '../src/js/services/simple-auth.service.js';

document.addEventListener('DOMContentLoaded', function() {
  // Récupérer l'état d'authentification
  const authState = getAuthState();

  // Récupérer les éléments du menu utilisateur
  const userMenu = document.querySelector('.user-menu');

  if (!userMenu) return;

  // Vider le menu utilisateur
  while (userMenu.firstChild) {
    userMenu.removeChild(userMenu.firstChild);
  }

  // Créer les éléments en fonction de l'état d'authentification
  if (authState.isAuthenticated) {
    // Créer le lien vers le profil
    const profileLink = document.createElement('a');
    profileLink.href = 'profile-simple.html';
    profileLink.className = 'btn-login';
    profileLink.textContent = authState.profile.username || 'Mon Profil';
    userMenu.appendChild(profileLink);

    // Créer le lien vers l'administration si l'utilisateur est un administrateur
    if (authState.profile.isAdmin) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin-simple.html';
      adminLink.className = 'btn-admin';
      adminLink.textContent = 'Admin';
      adminLink.style.marginLeft = '10px';
      adminLink.style.color = '#e74c3c';
      userMenu.appendChild(adminLink);
    }
  } else {
    // Créer le lien vers la page de connexion
    const loginLink = document.createElement('a');
    loginLink.href = 'login-simple.html';
    loginLink.className = 'btn-login';
    loginLink.textContent = 'Connexion';
    userMenu.appendChild(loginLink);
  }

  // Ajouter le bouton de menu mobile
  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.textContent = '☰';
  userMenu.appendChild(menuToggle);
});
