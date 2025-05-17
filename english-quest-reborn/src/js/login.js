/**
 * Script pour la page de connexion
 * Gère la connexion et l'inscription des utilisateurs
 */

import { db } from '../config/firebase-config.js';
import { collection, query, where, getDocs, setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { initializeUserService } from '../core/services/user.service.js';

console.log('Initialisation de la page de connexion...');

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
  try {
    await initializeUserService();
    addEventListeners();
    console.log('Connexion/inscription par pseudo + mot de passe prête.');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la page:', error);
  }
}

function addEventListeners() {
  loginTab.addEventListener('click', showLoginForm);
  registerTab.addEventListener('click', showRegisterForm);
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
}

function showLoginForm() {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginContent.classList.add('active');
  registerContent.classList.remove('active');
}

function showRegisterForm() {
  loginTab.classList.remove('active');
  registerTab.classList.add('active');
  loginContent.classList.remove('active');
  registerContent.classList.add('active');
}

function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

function hideError(element) {
  element.textContent = '';
  element.style.display = 'none';
}

// Connexion par pseudo + mot de passe
async function handleLogin(event) {
  event.preventDefault();
  hideError(loginError);
  loginButton.disabled = true;
  loginButton.textContent = 'Connexion en cours...';

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      showError(loginError, 'Nom d\'utilisateur ou mot de passe incorrect.');
      loginButton.disabled = false;
      loginButton.textContent = 'Se connecter';
      return;
    }

    let userData;
    querySnapshot.forEach(docSnap => {
      userData = docSnap.data();
      userData.userId = docSnap.id;
    });

    if (!userData || userData.password !== password) {
      showError(loginError, 'Nom d\'utilisateur ou mot de passe incorrect.');
      loginButton.disabled = false;
      loginButton.textContent = 'Se connecter';
      return;
    }

    // Connexion réussie
    localStorage.setItem('currentUser', JSON.stringify(userData));
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    showError(loginError, 'Erreur lors de la connexion. Veuillez réessayer.');
    loginButton.disabled = false;
    loginButton.textContent = 'Se connecter';
  }
}

// Inscription par pseudo + mot de passe
async function handleRegister(event) {
  event.preventDefault();
  hideError(registerError);
  registerButton.disabled = true;
  registerButton.textContent = 'Inscription en cours...';

  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;

  try {
    // Vérifier que le pseudo n'existe pas déjà
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      showError(registerError, 'Ce nom d\'utilisateur est déjà pris.');
      registerButton.disabled = false;
      registerButton.textContent = 'S\'inscrire';
      return;
    }

    // Créer le nouvel utilisateur
    const newUser = {
      username,
      password, // Pour la prod, il faudrait hasher le mot de passe !
      isAdmin: false,
      level: 1,
      xp: 0,
      // ... autres champs par défaut si besoin
    };

    await setDoc(doc(db, 'users', username), newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    showError(registerError, 'Erreur lors de l\'inscription. Veuillez réessayer.');
    registerButton.disabled = false;
    registerButton.textContent = 'S\'inscrire';
  }
}

document.addEventListener('DOMContentLoaded', initLoginPage);
