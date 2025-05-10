/**
 * Script pour la page d'administration
 * Gère l'affichage et la gestion des utilisateurs, des scores et des statistiques
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Importer les services
import { initializeUserService, getCurrentUser, isCurrentUserAdmin } from '../core/services/user.service.js';
import { getAllUsersForAdmin, updateUserAsAdmin, deleteUserAsAdmin, addXpToUserAsAdmin, addCoinsToUserAsAdmin, setUserAdminRights, getGlobalStats } from '../core/services/admin.service.js';
import { getTopScores, deleteScore } from '../core/services/score.service.js';
import { migrateUsers, migrateScores, checkAndFixUserData, runAllMigrations } from '../core/utils/data-migration.js';

// Variables globales
let currentUser = null;
let isAdmin = false;

// Éléments DOM
const adminAccessDenied = document.querySelector('.admin-access-denied');
const adminContent = document.querySelector('.admin-content');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const usersTableBody = document.getElementById('users-table-body');
const scoresTableBody = document.getElementById('scores-table-body');
const userSearch = document.getElementById('user-search');
const userSearchButton = document.getElementById('user-search-button');
const showAdminsOnly = document.getElementById('show-admins-only');
const refreshUsersButton = document.getElementById('refresh-users-button');
const gameSelect = document.getElementById('game-select');
const scoreSearch = document.getElementById('score-search');
const scoreSearchButton = document.getElementById('score-search-button');
const refreshScoresButton = document.getElementById('refresh-scores-button');
const refreshStatsButton = document.getElementById('refresh-stats-button');
const migrateDataButton = document.getElementById('migrate-data-button');
const checkDataButton = document.getElementById('check-data-button');
const resetAdminRightsButton = document.getElementById('reset-admin-rights-button');
const toolResultContent = document.getElementById('tool-result-content');
const editUserModal = document.getElementById('edit-user-modal');
const deleteUserModal = document.getElementById('delete-user-modal');
const deleteScoreModal = document.getElementById('delete-score-modal');
const editUserForm = document.getElementById('edit-user-form');
const deleteUserForm = document.getElementById('delete-user-form');
const deleteScoreForm = document.getElementById('delete-score-form');
const closeModalButtons = document.querySelectorAll('.close-modal, .close-modal-button');
const logoutButton = document.getElementById('logout-button');
const userInfo = document.querySelector('.user-info');
const userDropdown = document.querySelector('.user-dropdown');

// Indicateurs de chargement
const usersLoading = document.getElementById('users-loading');
const scoresLoading = document.getElementById('scores-loading');
const statsLoading = document.getElementById('stats-loading');
const usersError = document.getElementById('users-error');
const scoresError = document.getElementById('scores-error');
const statsError = document.getElementById('stats-error');
const retryUsersButton = document.getElementById('retry-users-button');
const retryScoresButton = document.getElementById('retry-scores-button');
const retryStatsButton = document.getElementById('retry-stats-button');

// Statistiques
const userCount = document.getElementById('user-count');
const scoreCount = document.getElementById('score-count');
const totalXp = document.getElementById('total-xp');
const totalCoins = document.getElementById('total-coins');

/**
 * Initialise la page d'administration
 */
async function initAdminPage() {
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
async function handleAuthStateChange(user) {
  if (user) {
    // Récupérer l'utilisateur courant
    currentUser = getCurrentUser();
    
    if (currentUser) {
      // Vérifier si l'utilisateur est administrateur
      isAdmin = isCurrentUserAdmin();
      
      // Mettre à jour l'interface utilisateur
      updateUserInterface();
      
      // Charger les données initiales
      if (isAdmin) {
        loadUsers();
        loadScores();
        loadStats();
      }
    } else {
      // Rediriger vers la page de connexion
      window.location.href = 'login.html';
    }
  } else {
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
  }
}

/**
 * Met à jour l'interface utilisateur en fonction des droits d'administration
 */
function updateUserInterface() {
  // Mettre à jour les informations utilisateur
  const username = document.querySelector('.username');
  const userAvatar = document.querySelector('.user-avatar img');
  
  if (currentUser) {
    username.textContent = currentUser.username;
    
    // Mettre à jour l'avatar
    if (currentUser.inventory && currentUser.inventory.skins) {
      const headSkin = currentUser.inventory.skins.head[0] || 'default_boy';
      userAvatar.src = `assets/images/avatars/${headSkin}.png`;
    }
  } else {
    username.textContent = 'Non connecté';
    userAvatar.src = 'assets/images/avatars/default_boy.png';
  }
  
  // Afficher ou masquer le panneau d'administration
  if (isAdmin) {
    adminAccessDenied.classList.add('hidden');
    adminContent.classList.remove('hidden');
  } else {
    adminAccessDenied.classList.remove('hidden');
    adminContent.classList.add('hidden');
  }
}

/**
 * Ajoute les écouteurs d'événements
 */
function addEventListeners() {
  // Onglets
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Désactiver tous les onglets
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Activer l'onglet sélectionné
      button.classList.add('active');
      document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
    });
  });
  
  // Recherche d'utilisateurs
  userSearchButton.addEventListener('click', () => {
    loadUsers();
  });
  
  userSearch.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      loadUsers();
    }
  });
  
  // Filtre d'administrateurs
  showAdminsOnly.addEventListener('change', () => {
    loadUsers();
  });
  
  // Actualisation des utilisateurs
  refreshUsersButton.addEventListener('click', () => {
    loadUsers();
  });
  
  // Recherche de scores
  scoreSearchButton.addEventListener('click', () => {
    loadScores();
  });
  
  scoreSearch.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      loadScores();
    }
  });
  
  // Changement de jeu
  gameSelect.addEventListener('change', () => {
    loadScores();
  });
  
  // Actualisation des scores
  refreshScoresButton.addEventListener('click', () => {
    loadScores();
  });
  
  // Actualisation des statistiques
  refreshStatsButton.addEventListener('click', () => {
    loadStats();
  });
  
  // Outils d'administration
  migrateDataButton.addEventListener('click', async () => {
    try {
      migrateDataButton.disabled = true;
      migrateDataButton.textContent = 'Migration en cours...';
      
      const result = await runAllMigrations();
      
      toolResultContent.textContent = JSON.stringify(result, null, 2);
      document.getElementById('tool-result').classList.remove('hidden');
    } catch (error) {
      console.error('Erreur lors de la migration des données:', error);
      toolResultContent.textContent = `Erreur: ${error.message}`;
      document.getElementById('tool-result').classList.remove('hidden');
    } finally {
      migrateDataButton.disabled = false;
      migrateDataButton.textContent = 'Lancer la migration';
    }
  });
  
  checkDataButton.addEventListener('click', async () => {
    try {
      checkDataButton.disabled = true;
      checkDataButton.textContent = 'Vérification en cours...';
      
      const result = await checkAndFixUserData();
      
      toolResultContent.textContent = JSON.stringify(result, null, 2);
      document.getElementById('tool-result').classList.remove('hidden');
    } catch (error) {
      console.error('Erreur lors de la vérification des données:', error);
      toolResultContent.textContent = `Erreur: ${error.message}`;
      document.getElementById('tool-result').classList.remove('hidden');
    } finally {
      checkDataButton.disabled = false;
      checkDataButton.textContent = 'Vérifier les données';
    }
  });
  
  resetAdminRightsButton.addEventListener('click', async () => {
    try {
      resetAdminRightsButton.disabled = true;
      resetAdminRightsButton.textContent = 'Réinitialisation en cours...';
      
      // Récupérer tous les utilisateurs
      const users = await getAllUsersForAdmin();
      
      let fixedCount = 0;
      const issues = [];
      
      // Vérifier chaque utilisateur
      for (const user of users) {
        try {
          // Vérifier les droits d'administrateur
          if (user.username && user.username.toLowerCase() === 'ollie' && !user.isAdmin) {
            await setUserAdminRights(user.userId, true);
            fixedCount++;
            issues.push(`Correction des droits d'administrateur pour Ollie (${user.userId})`);
          } else if (user.username && user.username.toLowerCase() !== 'ollie' && user.isAdmin) {
            await setUserAdminRights(user.userId, false);
            fixedCount++;
            issues.push(`Retrait des droits d'administrateur pour ${user.username} (${user.userId})`);
          }
        } catch (error) {
          console.error(`Erreur lors de la vérification de l'utilisateur ${user.userId}:`, error);
          issues.push(`Erreur pour ${user.userId}: ${error.message}`);
        }
      }
      
      const result = {
        fixedCount,
        issues
      };
      
      toolResultContent.textContent = JSON.stringify(result, null, 2);
      document.getElementById('tool-result').classList.remove('hidden');
      
      // Recharger les utilisateurs
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des droits d\'administrateur:', error);
      toolResultContent.textContent = `Erreur: ${error.message}`;
      document.getElementById('tool-result').classList.remove('hidden');
    } finally {
      resetAdminRightsButton.disabled = false;
      resetAdminRightsButton.textContent = 'Réinitialiser';
    }
  });
  
  // Formulaires
  editUserForm.addEventListener('submit', handleEditUserSubmit);
  deleteUserForm.addEventListener('submit', handleDeleteUserSubmit);
  deleteScoreForm.addEventListener('submit', handleDeleteScoreSubmit);
  
  // Fermeture des modals
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      editUserModal.style.display = 'none';
      deleteUserModal.style.display = 'none';
      deleteScoreModal.style.display = 'none';
    });
  });
  
  // Fermeture des modals en cliquant à l'extérieur
  window.addEventListener('click', (event) => {
    if (event.target === editUserModal) {
      editUserModal.style.display = 'none';
    } else if (event.target === deleteUserModal) {
      deleteUserModal.style.display = 'none';
    } else if (event.target === deleteScoreModal) {
      deleteScoreModal.style.display = 'none';
    }
  });
  
  // Boutons de réessai
  retryUsersButton.addEventListener('click', () => {
    loadUsers();
  });
  
  retryScoresButton.addEventListener('click', () => {
    loadScores();
  });
  
  retryStatsButton.addEventListener('click', () => {
    loadStats();
  });
  
  // Déconnexion
  logoutButton.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  });
  
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
 * Charge les utilisateurs
 */
async function loadUsers() {
  try {
    // Afficher l'indicateur de chargement
    usersLoading.classList.remove('hidden');
    usersError.classList.add('hidden');
    usersTableBody.innerHTML = '';
    
    // Récupérer les filtres
    const searchQuery = userSearch.value.trim().toLowerCase();
    const adminsOnly = showAdminsOnly.checked;
    
    // Récupérer tous les utilisateurs
    const users = await getAllUsersForAdmin();
    
    // Filtrer les utilisateurs
    const filteredUsers = users.filter(user => {
      // Filtre de recherche
      const matchesSearch = !searchQuery || 
        (user.username && user.username.toLowerCase().includes(searchQuery)) || 
        (user.userId && user.userId.toLowerCase().includes(searchQuery));
      
      // Filtre d'administrateurs
      const matchesAdminFilter = !adminsOnly || user.isAdmin;
      
      return matchesSearch && matchesAdminFilter;
    });
    
    // Trier les utilisateurs par nom d'utilisateur
    filteredUsers.sort((a, b) => {
      return (a.username || '').localeCompare(b.username || '');
    });
    
    // Afficher les utilisateurs
    filteredUsers.forEach(user => {
      const row = document.createElement('tr');
      
      // Formater la date de dernière connexion
      const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais';
      
      row.innerHTML = `
        <td>${user.userId.substring(0, 8)}...</td>
        <td>${user.username || 'Sans nom'}</td>
        <td>${user.level || 1}</td>
        <td>${user.xp || 0}</td>
        <td>${user.coins || 0}</td>
        <td>${user.isAdmin ? 'Oui' : 'Non'}</td>
        <td>${lastLogin}</td>
        <td>
          <button class="btn btn-small btn-primary edit-user" data-id="${user.userId}">Modifier</button>
          <button class="btn btn-small btn-danger delete-user" data-id="${user.userId}">Supprimer</button>
        </td>
      `;
      
      usersTableBody.appendChild(row);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons d'action
    document.querySelectorAll('.edit-user').forEach(button => {
      button.addEventListener('click', () => {
        openEditUserModal(button.dataset.id);
      });
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
      button.addEventListener('click', () => {
        openDeleteUserModal(button.dataset.id);
      });
    });
    
    // Masquer l'indicateur de chargement
    usersLoading.classList.add('hidden');
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    usersLoading.classList.add('hidden');
    usersError.classList.remove('hidden');
  }
}

/**
 * Charge les scores
 */
async function loadScores() {
  try {
    // Afficher l'indicateur de chargement
    scoresLoading.classList.remove('hidden');
    scoresError.classList.add('hidden');
    scoresTableBody.innerHTML = '';
    
    // Récupérer les filtres
    const gameId = gameSelect.value;
    const searchQuery = scoreSearch.value.trim().toLowerCase();
    
    // Récupérer les scores
    const scores = await getTopScores(gameId, 100);
    
    // Filtrer les scores
    const filteredScores = scores.filter(score => {
      return !searchQuery || 
        (score.username && score.username.toLowerCase().includes(searchQuery)) || 
        (score.userId && score.userId.toLowerCase().includes(searchQuery));
    });
    
    // Afficher les scores
    filteredScores.forEach(score => {
      const row = document.createElement('tr');
      
      // Formater la date
      const date = score.timestamp ? new Date(score.timestamp).toLocaleString() : 'Inconnue';
      
      row.innerHTML = `
        <td>${score.id.substring(0, 8)}...</td>
        <td>${score.username || 'Inconnu'}</td>
        <td>${score.score || 0}</td>
        <td>${date}</td>
        <td>
          <button class="btn btn-small btn-danger delete-score" data-id="${score.id}">Supprimer</button>
        </td>
      `;
      
      scoresTableBody.appendChild(row);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons d'action
    document.querySelectorAll('.delete-score').forEach(button => {
      button.addEventListener('click', () => {
        openDeleteScoreModal(button.dataset.id);
      });
    });
    
    // Masquer l'indicateur de chargement
    scoresLoading.classList.add('hidden');
  } catch (error) {
    console.error('Erreur lors du chargement des scores:', error);
    scoresLoading.classList.add('hidden');
    scoresError.classList.remove('hidden');
  }
}

/**
 * Charge les statistiques
 */
async function loadStats() {
  try {
    // Afficher l'indicateur de chargement
    statsLoading.classList.remove('hidden');
    statsError.classList.add('hidden');
    
    // Récupérer les statistiques
    const stats = await getGlobalStats();
    
    // Afficher les statistiques
    userCount.textContent = stats.userCount || 0;
    scoreCount.textContent = stats.scoreCount || 0;
    totalXp.textContent = stats.totalXp || 0;
    totalCoins.textContent = stats.totalCoins || 0;
    
    // Masquer l'indicateur de chargement
    statsLoading.classList.add('hidden');
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    statsLoading.classList.add('hidden');
    statsError.classList.remove('hidden');
  }
}

/**
 * Ouvre la modal de modification d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 */
async function openEditUserModal(userId) {
  try {
    // Récupérer l'utilisateur
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Remplir le formulaire
      document.getElementById('edit-user-id').value = userId;
      document.getElementById('edit-username').value = userData.username || '';
      document.getElementById('edit-level').value = userData.level || 1;
      document.getElementById('edit-xp').value = userData.xp || 0;
      document.getElementById('edit-coins').value = userData.coins || 0;
      document.getElementById('edit-admin').checked = userData.isAdmin || false;
      
      // Afficher la modal
      editUserModal.style.display = 'block';
    } else {
      alert('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    alert(`Erreur: ${error.message}`);
  }
}

/**
 * Ouvre la modal de suppression d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 */
async function openDeleteUserModal(userId) {
  try {
    // Récupérer l'utilisateur
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Remplir le formulaire
      document.getElementById('delete-user-id').value = userId;
      document.getElementById('delete-username').textContent = userData.username || 'Sans nom';
      document.getElementById('delete-level').textContent = userData.level || 1;
      
      // Afficher la modal
      deleteUserModal.style.display = 'block';
    } else {
      alert('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    alert(`Erreur: ${error.message}`);
  }
}

/**
 * Ouvre la modal de suppression d'un score
 * @param {string} scoreId - ID du score
 */
async function openDeleteScoreModal(scoreId) {
  try {
    // Récupérer le score
    const scoreDoc = await getDoc(doc(db, 'game_scores', scoreId));
    
    if (scoreDoc.exists()) {
      const scoreData = scoreDoc.data();
      
      // Remplir le formulaire
      document.getElementById('delete-score-id').value = scoreId;
      document.getElementById('delete-score-username').textContent = scoreData.username || 'Inconnu';
      document.getElementById('delete-score-value').textContent = scoreData.score || 0;
      document.getElementById('delete-score-date').textContent = scoreData.timestamp ? new Date(scoreData.timestamp).toLocaleString() : 'Inconnue';
      
      // Afficher la modal
      deleteScoreModal.style.display = 'block';
    } else {
      alert('Score non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du score:', error);
    alert(`Erreur: ${error.message}`);
  }
}

/**
 * Gère la soumission du formulaire de modification d'un utilisateur
 * @param {Event} event - Événement de soumission
 */
async function handleEditUserSubmit(event) {
  event.preventDefault();
  
  try {
    const userId = document.getElementById('edit-user-id').value;
    const username = document.getElementById('edit-username').value;
    const level = parseInt(document.getElementById('edit-level').value);
    const xp = parseInt(document.getElementById('edit-xp').value);
    const coins = parseInt(document.getElementById('edit-coins').value);
    const isAdmin = document.getElementById('edit-admin').checked;
    
    // Mettre à jour l'utilisateur
    await updateUserAsAdmin(userId, {
      username,
      level,
      xp,
      coins,
      isAdmin
    });
    
    // Fermer la modal
    editUserModal.style.display = 'none';
    
    // Recharger les utilisateurs
    loadUsers();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    alert(`Erreur: ${error.message}`);
  }
}

/**
 * Gère la soumission du formulaire de suppression d'un utilisateur
 * @param {Event} event - Événement de soumission
 */
async function handleDeleteUserSubmit(event) {
  event.preventDefault();
  
  try {
    const userId = document.getElementById('delete-user-id').value;
    
    // Supprimer l'utilisateur
    await deleteUserAsAdmin(userId);
    
    // Fermer la modal
    deleteUserModal.style.display = 'none';
    
    // Recharger les utilisateurs
    loadUsers();
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    alert(`Erreur: ${error.message}`);
  }
}

/**
 * Gère la soumission du formulaire de suppression d'un score
 * @param {Event} event - Événement de soumission
 */
async function handleDeleteScoreSubmit(event) {
  event.preventDefault();
  
  try {
    const scoreId = document.getElementById('delete-score-id').value;
    
    // Supprimer le score
    await deleteScore(scoreId);
    
    // Fermer la modal
    deleteScoreModal.style.display = 'none';
    
    // Recharger les scores
    loadScores();
  } catch (error) {
    console.error('Erreur lors de la suppression du score:', error);
    alert(`Erreur: ${error.message}`);
  }
}

// Initialiser la page d'administration
document.addEventListener('DOMContentLoaded', initAdminPage);
