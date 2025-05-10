/**
 * Script de migration des données
 * Permet de migrer les données des anciennes collections vers les nouvelles
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, addDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
import { initializeUserService, getCurrentUser, isCurrentUserAdmin } from '../core/services/user.service.js';
import { runAllMigrations, migrateUsers, migrateScores, checkAndFixUserData } from '../core/utils/data-migration.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Éléments DOM
const migrateUsersButton = document.getElementById('migrate-users-button');
const migrateScoresButton = document.getElementById('migrate-scores-button');
const checkDataButton = document.getElementById('check-data-button');
const runAllButton = document.getElementById('run-all-button');
const resultContainer = document.getElementById('result-container');
const resultContent = document.getElementById('result-content');
const accessDenied = document.getElementById('access-denied');
const migrationTools = document.getElementById('migration-tools');

// Variables globales
let isAdmin = false;

/**
 * Initialise la page de migration
 */
async function initMigrationPage() {
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
    // Vérifier si l'utilisateur est administrateur
    const currentUser = getCurrentUser();
    isAdmin = currentUser && isCurrentUserAdmin();
    
    // Mettre à jour l'interface utilisateur
    updateUserInterface();
  } else {
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
  }
}

/**
 * Met à jour l'interface utilisateur
 */
function updateUserInterface() {
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
  migrateUsersButton.addEventListener('click', handleMigrateUsers);
  migrateScoresButton.addEventListener('click', handleMigrateScores);
  checkDataButton.addEventListener('click', handleCheckData);
  runAllButton.addEventListener('click', handleRunAll);
}

/**
 * Gère la migration des utilisateurs
 */
async function handleMigrateUsers() {
  try {
    // Vérifier les droits d'administration
    if (!isAdmin) {
      showResult('Accès refusé: droits d\'administrateur requis');
      return;
    }
    
    // Désactiver le bouton
    migrateUsersButton.disabled = true;
    migrateUsersButton.textContent = 'Migration en cours...';
    
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
    migrateUsersButton.textContent = 'Migrer les utilisateurs';
  }
}

/**
 * Gère la migration des scores
 */
async function handleMigrateScores() {
  try {
    // Vérifier les droits d'administration
    if (!isAdmin) {
      showResult('Accès refusé: droits d\'administrateur requis');
      return;
    }
    
    // Désactiver le bouton
    migrateScoresButton.disabled = true;
    migrateScoresButton.textContent = 'Migration en cours...';
    
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
    migrateScoresButton.textContent = 'Migrer les scores';
  }
}

/**
 * Gère la vérification des données
 */
async function handleCheckData() {
  try {
    // Vérifier les droits d'administration
    if (!isAdmin) {
      showResult('Accès refusé: droits d\'administrateur requis');
      return;
    }
    
    // Désactiver le bouton
    checkDataButton.disabled = true;
    checkDataButton.textContent = 'Vérification en cours...';
    
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
    checkDataButton.textContent = 'Vérifier les données';
  }
}

/**
 * Gère l'exécution de toutes les migrations
 */
async function handleRunAll() {
  try {
    // Vérifier les droits d'administration
    if (!isAdmin) {
      showResult('Accès refusé: droits d\'administrateur requis');
      return;
    }
    
    // Désactiver le bouton
    runAllButton.disabled = true;
    runAllButton.textContent = 'Migration en cours...';
    
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
    runAllButton.textContent = 'Exécuter toutes les migrations';
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

// Initialiser la page de migration
document.addEventListener('DOMContentLoaded', initMigrationPage);
