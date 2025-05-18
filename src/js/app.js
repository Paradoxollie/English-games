/**
 * Script principal de l'application English Quest Reborn
 * Initialise l'application et gère les fonctionnalités communes
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { auth, firebaseConfig } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { initializeUserService, getCurrentUser, addUserChangeListener } from '../core/services/user.service.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Variables globales
let currentUser = null;

/**
 * Initialise l'application
 */
async function initApp() {
  console.log('Initialisation de l\'application...');
  
  // Initialiser le service utilisateur
  await initializeUserService();
  
  // Écouter les changements d'état d'authentification
  onAuthStateChanged(auth, handleAuthStateChange);
  
  // Ajouter un écouteur pour les changements d'utilisateur
  addUserChangeListener(handleUserChange);
  
  // Initialiser les éléments communs
  initCommonElements();
  
  console.log('Application initialisée');
}

/**
 * Gère les changements d'état d'authentification
 * @param {Object} user - Utilisateur Firebase
 */
function handleAuthStateChange(user) {
  if (user) {
    console.log(`Utilisateur connecté: ${user.uid}`);
  } else {
    console.log('Utilisateur déconnecté');
    
    // Rediriger vers la page de connexion si nécessaire
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'register.html', 'new-index.html', 'index.html', ''];
    
    if (!publicPages.includes(currentPage)) {
      window.location.href = 'login.html';
    }
  }
}

/**
 * Gère les changements d'utilisateur
 * @param {Object} user - Utilisateur
 */
function handleUserChange(user) {
  currentUser = user;
  updateUserInterface();
}

/**
 * Met à jour l'interface utilisateur
 */
function updateUserInterface() {
  // Mettre à jour les informations utilisateur dans le header
  const userInfoElements = document.querySelectorAll('.user-info');
  
  userInfoElements.forEach(element => {
    const usernameElement = element.querySelector('.username');
    const avatarElement = element.querySelector('.user-avatar img');
    
    if (usernameElement && avatarElement) {
      if (currentUser) {
        // Mettre à jour le nom d'utilisateur
        usernameElement.textContent = currentUser.username;
        
        // Mettre à jour l'avatar
        if (currentUser.inventory && currentUser.inventory.skins && currentUser.inventory.skins.head) {
          const headSkin = currentUser.inventory.skins.head[0] || 'default_boy';
          avatarElement.src = `assets/images/avatars/${headSkin}.png`;
        }
      } else {
        usernameElement.textContent = 'Non connecté';
        avatarElement.src = 'assets/images/avatars/default_boy.png';
      }
    }
  });
  
  // Mettre à jour les boutons de connexion/déconnexion
  const loginButtons = document.querySelectorAll('.login-button');
  const logoutButtons = document.querySelectorAll('.logout-button, #logout-button');
  const profileLinks = document.querySelectorAll('.profile-link');
  const adminLinks = document.querySelectorAll('.admin-link');
  
  if (currentUser) {
    // Utilisateur connecté
    loginButtons.forEach(button => button.style.display = 'none');
    logoutButtons.forEach(button => button.style.display = 'block');
    profileLinks.forEach(link => link.style.display = 'block');
    
    // Afficher le lien d'administration si l'utilisateur est administrateur
    if (currentUser.isAdmin) {
      adminLinks.forEach(link => link.style.display = 'block');
    } else {
      adminLinks.forEach(link => link.style.display = 'none');
    }
  } else {
    // Utilisateur déconnecté
    loginButtons.forEach(button => button.style.display = 'block');
    logoutButtons.forEach(button => button.style.display = 'none');
    profileLinks.forEach(link => link.style.display = 'none');
    adminLinks.forEach(link => link.style.display = 'none');
  }
}

/**
 * Initialise les éléments communs de l'interface
 */
function initCommonElements() {
  // Menu mobile
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
  
  // Menu utilisateur
  const userInfoElements = document.querySelectorAll('.user-info');
  const userDropdowns = document.querySelectorAll('.user-dropdown');
  
  userInfoElements.forEach((element, index) => {
    if (userDropdowns[index]) {
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        userDropdowns[index].classList.toggle('active');
      });
    }
  });
  
  // Fermer le menu utilisateur en cliquant à l'extérieur
  document.addEventListener('click', () => {
    userDropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  });
  
  // Boutons de déconnexion
  const logoutButtons = document.querySelectorAll('.logout-button, #logout-button');
  
  logoutButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      try {
        await signOut(auth);
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    });
  });
}

/**
 * Récupère l'utilisateur courant
 * @returns {Object|null} Utilisateur courant
 */
export function getUser() {
  return currentUser;
}

/**
 * Vérifie si l'utilisateur est connecté
 * @returns {boolean} Vrai si l'utilisateur est connecté
 */
export function isLoggedIn() {
  return currentUser !== null;
}

/**
 * Vérifie si l'utilisateur est administrateur
 * @returns {boolean} Vrai si l'utilisateur est administrateur
 */
export function isAdmin() {
  return currentUser && currentUser.isAdmin === true;
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', initApp);

export default {
  getUser,
  isLoggedIn,
  isAdmin
};
