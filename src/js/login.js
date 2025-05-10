/**
 * Script pour la page de connexion
 * Gère la connexion et l'inscription des utilisateurs
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';
import { initializeUserService, createUserInFirestore, getUserFromFirestore, isUsernameAvailable } from '../core/services/user.service.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Éléments DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginContent = document.getElementById('login-content');
const registerContent = document.getElementById('register-content');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');

/**
 * Initialise la page de connexion
 */
async function initLoginPage() {
  // Initialiser le service utilisateur
  await initializeUserService();
  
  // Écouter les changements d'état d'authentification
  onAuthStateChanged(auth, handleAuthStateChange);
  
  // Ajouter les écouteurs d'événements
  addEventListeners();
}

/**
 * Gère les changements d'état d'authentification
 * @param {Object} user - Utilisateur Firebase
 */
function handleAuthStateChange(user) {
  if (user) {
    // Vérifier si l'utilisateur a un profil
    checkUserProfile(user.uid);
  }
}

/**
 * Vérifie si l'utilisateur a un profil
 * @param {string} userId - ID de l'utilisateur
 */
async function checkUserProfile(userId) {
  try {
    const userProfile = await getUserFromFirestore(userId);
    
    if (userProfile) {
      // Rediriger vers la page d'accueil
      window.location.href = 'new-index.html';
    } else {
      // Afficher le formulaire d'inscription
      showRegisterForm();
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du profil utilisateur:', error);
    showError(loginError, 'Une erreur s\'est produite. Veuillez réessayer.');
  }
}

/**
 * Ajoute les écouteurs d'événements
 */
function addEventListeners() {
  // Onglets
  loginTab.addEventListener('click', showLoginForm);
  registerTab.addEventListener('click', showRegisterForm);
  
  // Formulaire de connexion
  loginForm.addEventListener('submit', handleLogin);
  
  // Formulaire d'inscription
  registerForm.addEventListener('submit', handleRegister);
}

/**
 * Affiche le formulaire de connexion
 */
function showLoginForm() {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginContent.classList.add('active');
  registerContent.classList.remove('active');
}

/**
 * Affiche le formulaire d'inscription
 */
function showRegisterForm() {
  loginTab.classList.remove('active');
  registerTab.classList.add('active');
  loginContent.classList.remove('active');
  registerContent.classList.add('active');
}

/**
 * Gère la connexion
 * @param {Event} event - Événement de soumission
 */
async function handleLogin(event) {
  event.preventDefault();
  
  try {
    // Masquer les erreurs
    hideError(loginError);
    
    // Désactiver le bouton
    loginButton.disabled = true;
    loginButton.textContent = 'Connexion en cours...';
    
    // Connexion anonyme
    await signInAnonymously(auth);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    showError(loginError, 'Une erreur s\'est produite lors de la connexion. Veuillez réessayer.');
    
    // Réactiver le bouton
    loginButton.disabled = false;
    loginButton.textContent = 'Se connecter';
  }
}

/**
 * Gère l'inscription
 * @param {Event} event - Événement de soumission
 */
async function handleRegister(event) {
  event.preventDefault();
  
  try {
    // Masquer les erreurs
    hideError(registerError);
    
    // Récupérer les données du formulaire
    const username = document.getElementById('register-username').value.trim();
    
    // Valider les données
    if (!username) {
      showError(registerError, 'Veuillez entrer un nom d\'utilisateur.');
      return;
    }
    
    // Vérifier si le nom d'utilisateur est disponible
    const isAvailable = await isUsernameAvailable(username);
    
    if (!isAvailable) {
      showError(registerError, 'Ce nom d\'utilisateur est déjà pris. Veuillez en choisir un autre.');
      return;
    }
    
    // Désactiver le bouton
    registerButton.disabled = true;
    registerButton.textContent = 'Inscription en cours...';
    
    // Récupérer l'utilisateur courant
    const user = auth.currentUser;
    
    if (!user) {
      // Connexion anonyme si l'utilisateur n'est pas connecté
      await signInAnonymously(auth);
    }
    
    // Créer le profil utilisateur
    await createUserInFirestore(auth.currentUser.uid, username);
    
    // Rediriger vers la page d'accueil
    window.location.href = 'new-index.html';
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    showError(registerError, 'Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer.');
    
    // Réactiver le bouton
    registerButton.disabled = false;
    registerButton.textContent = 'S\'inscrire';
  }
}

/**
 * Affiche une erreur
 * @param {HTMLElement} element - Élément d'erreur
 * @param {string} message - Message d'erreur
 */
function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

/**
 * Masque une erreur
 * @param {HTMLElement} element - Élément d'erreur
 */
function hideError(element) {
  element.textContent = '';
  element.style.display = 'none';
}

// Initialiser la page de connexion
document.addEventListener('DOMContentLoaded', initLoginPage);
