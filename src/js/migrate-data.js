/**
 * Script pour la page de migration des données
 * Gère la migration des données des anciennes collections vers les nouvelles
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
import { initializeUserService, getCurrentUser, isCurrentUserAdmin } from '../core/services/user.service.js';
import { migrateUsers, migrateScores, checkAndFixUserData, runAllMigrations } from '../core/utils/data-migration.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Éléments DOM
const accessDenied = document.getElementById('access-denied');
const migrationTools = document.getElementById('migration-tools');
const migrateUsersButton = document.getElementById('migrate-users-button');
const migrateScoresButton = document.getElementById('migrate-scores-button');
const checkDataButton = document.getElementById('check-data-button');
const runAllButton = document.getElementById('run-all-button');
const resultContainer = document.getElementById('result-container');
const resultContent = document.getElementById('result-content');
const loadingIndicator = document.getElementById('loading-indicator');
const loadingText = document.getElementById('loading-text');
const logoutButton = document.getElementById('logout-button');
const userInfo = document.querySelector('.user-info');
const userDropdown = document.querySelector('.user-dropdown');

// Variables globales
let currentUser = null;
let isAdmin = false;

/**
 * Initialise la page de migration
 */
async function initMigrationPage() {
  console.log('Initialisation de la page de migration...');
  
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
    console.log(`Utilisateur connecté: ${user.uid}`);
    
    // Vérifier si l'utilisateur est administrateur
    currentUser = getCurrentUser();
    isAdmin = isCurrentUserAdmin();
    
    // Mettre à jour l'interface utilisateur
    updateUserInterface();
  } else {
    console.log('Utilisateur déconnecté');
    
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
  }
}

/**
 * Met à jour l'interface utilisateur
 */
function updateUserInterface() {
  // Mettre à jour les informations utilisateur
  const usernameElement = document.querySelector('.username');
  const userAvatarElement = document.querySelector('.user-avatar img');
  
  if (currentUser) {
    usernameElement.textContent = currentUser.username;
    
    // Mettre à jour l'avatar
    if (currentUser.inventory && currentUser.inventory.skins && currentUser.inventory.skins.head) {
      const headSkin = currentUser.inventory.skins.head[0] || 'default_boy';
      userAvatarElement.src = `assets/images/avatars/${headSkin}.png`;
    }
  }
  
  // Afficher ou masquer les outils de migration
  if (isAdmin) {
    accessDenied.style.display = 'none';
    migrationTools.style.display = 'block';
  } else {
    accessDenied.style.display = 'block';
    migrationTools.style.display = 'none';
  }
}

/**
 * Ajoute les écouteurs d'événements
 */
function addEventListeners() {
  // Boutons de migration
  migrateUsersButton.addEventListener('click', handleMigrateUsers);
  migrateScoresButton.addEventListener('click', handleMigrateScores);
  checkDataButton.addEventListener('click', handleCheckData);
  runAllButton.addEventListener('click', handleRunAll);
  
  // Déconnexion
  logoutButton.addEventListener('click', handleLogout);
  
  // Menu utilisateur
  userInfo.addEventListener('click', () => {
    userDropdown.classList.toggle('active');
  });
  
  // Fermer le menu utilisateur en cliquant à l'extérieur
  document.addEventListener('click', (event) => {
    if (!userInfo.contains(event.target) && !userDropdown.contains(event.target)) {
      userDropdown.classList.remove('active');
    }
  });
}

/**
 * Gère la migration des utilisateurs
 */
async function handleMigrateUsers() {
  if (!isAdmin) {
    showResult('Accès refusé: droits d\'administrateur requis');
    return;
  }
  
  try {
    showLoading('Migration des utilisateurs en cours...');
    
    // Désactiver le bouton
    migrateUsersButton.disabled = true;
    
    // Migrer les utilisateurs
    const result = await migrateUsers();
    
    // Afficher le résultat
    showResult(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Erreur lors de la migration des utilisateurs:', error);
    showResult(`Erreur: ${error.message}`);
  } finally {
    // Réactiver le bouton
    migrateUsersButton.disabled = false;
    hideLoading();
  }
}

/**
 * Gère la migration des scores
 */
async function handleMigrateScores() {
  if (!isAdmin) {
    showResult('Accès refusé: droits d\'administrateur requis');
    return;
  }
  
  try {
    showLoading('Migration des scores en cours...');
    
    // Désactiver le bouton
    migrateScoresButton.disabled = true;
    
    // Migrer les scores
    const result = await migrateScores();
    
    // Afficher le résultat
    showResult(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Erreur lors de la migration des scores:', error);
    showResult(`Erreur: ${error.message}`);
  } finally {
    // Réactiver le bouton
    migrateScoresButton.disabled = false;
    hideLoading();
  }
}

/**
 * Gère la vérification des données
 */
async function handleCheckData() {
  if (!isAdmin) {
    showResult('Accès refusé: droits d\'administrateur requis');
    return;
  }
  
  try {
    showLoading('Vérification des données en cours...');
    
    // Désactiver le bouton
    checkDataButton.disabled = true;
    
    // Vérifier les données
    const result = await checkAndFixUserData();
    
    // Afficher le résultat
    showResult(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Erreur lors de la vérification des données:', error);
    showResult(`Erreur: ${error.message}`);
  } finally {
    // Réactiver le bouton
    checkDataButton.disabled = false;
    hideLoading();
  }
}

/**
 * Gère l'exécution de toutes les migrations
 */
async function handleRunAll() {
  if (!isAdmin) {
    showResult('Accès refusé: droits d\'administrateur requis');
    return;
  }
  
  try {
    showLoading('Exécution de toutes les migrations en cours...');
    
    // Désactiver le bouton
    runAllButton.disabled = true;
    
    // Exécuter toutes les migrations
    const result = await runAllMigrations();
    
    // Afficher le résultat
    showResult(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Erreur lors de l\'exécution de toutes les migrations:', error);
    showResult(`Erreur: ${error.message}`);
  } finally {
    // Réactiver le bouton
    runAllButton.disabled = false;
    hideLoading();
  }
}

/**
 * Gère la déconnexion
 */
async function handleLogout(event) {
  event.preventDefault();
  
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
}

/**
 * Affiche le résultat
 * @param {string} content - Contenu à afficher
 */
function showResult(content) {
  resultContent.textContent = content;
  resultContainer.style.display = 'block';
}

/**
 * Affiche l'indicateur de chargement
 * @param {string} text - Texte à afficher
 */
function showLoading(text) {
  loadingText.textContent = text;
  loadingIndicator.style.display = 'flex';
  resultContainer.style.display = 'none';
}

/**
 * Masque l'indicateur de chargement
 */
function hideLoading() {
  loadingIndicator.style.display = 'none';
}

// Initialiser la page de migration
document.addEventListener('DOMContentLoaded', initMigrationPage);
