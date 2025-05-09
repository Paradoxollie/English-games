/**
 * Composant de panneau d'administration pour English Quest Reborn
 * Permet de gérer les utilisateurs et les fonctionnalités d'administration
 */

import { getAllUsers, isAdmin, updateAdminRights, deleteUser } from './admin.service.js';
import { getAuthState } from '@features/auth/auth.service.js';

class AdminPanel {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.isLoading = false;
    this.searchTerm = '';
    this.container = null;
  }
  
  /**
   * Initialise le panneau d'administration
   * @param {HTMLElement} container - Conteneur pour le panneau d'administration
   */
  async init(container) {
    this.container = container;
    
    // Récupérer l'utilisateur actuel
    const authState = getAuthState();
    this.currentUser = authState.profile;
    
    // Vérifier si l'utilisateur est administrateur
    if (!this.currentUser || !isAdmin(this.currentUser)) {
      this.renderAccessDenied();
      return;
    }
    
    // Afficher le panneau d'administration
    this.renderPanel();
    
    // Charger les utilisateurs
    await this.loadUsers();
  }
  
  /**
   * Affiche un message d'accès refusé
   */
  renderAccessDenied() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="admin-access-denied">
        <h2>Accès refusé</h2>
        <p>Vous n'avez pas les droits nécessaires pour accéder au panneau d'administration.</p>
        <p>Seul l'utilisateur "Ollie" peut accéder à cette fonctionnalité.</p>
      </div>
    `;
  }
  
  /**
   * Affiche le panneau d'administration
   */
  renderPanel() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="admin-panel">
        <h2>Panneau d'administration</h2>
        
        <div class="admin-search">
          <input type="text" id="admin-search-input" placeholder="Rechercher un utilisateur...">
          <button id="admin-search-btn" class="btn btn-primary">
            <i class="fas fa-search"></i> Rechercher
          </button>
        </div>
        
        <div class="admin-users-container">
          <div id="admin-users-loading" class="admin-loading">
            <p>Chargement des utilisateurs...</p>
          </div>
          
          <div id="admin-users-list" class="admin-users-list"></div>
        </div>
      </div>
    `;
    
    // Ajouter les écouteurs d'événements
    this.addEventListeners();
  }
  
  /**
   * Ajoute les écouteurs d'événements
   */
  addEventListeners() {
    const searchInput = document.getElementById('admin-search-input');
    const searchBtn = document.getElementById('admin-search-btn');
    
    if (searchInput && searchBtn) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.searchTerm = searchInput.value.trim();
          this.renderUsers();
        }
      });
      
      searchBtn.addEventListener('click', () => {
        this.searchTerm = searchInput.value.trim();
        this.renderUsers();
      });
    }
  }
  
  /**
   * Charge les utilisateurs depuis le service
   */
  async loadUsers() {
    try {
      this.isLoading = true;
      this.renderLoadingState();
      
      // Récupérer tous les utilisateurs
      this.users = await getAllUsers();
      
      this.isLoading = false;
      this.renderUsers();
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      this.isLoading = false;
      this.renderError(error.message);
    }
  }
  
  /**
   * Affiche l'état de chargement
   */
  renderLoadingState() {
    const loadingElement = document.getElementById('admin-users-loading');
    const listElement = document.getElementById('admin-users-list');
    
    if (loadingElement && listElement) {
      loadingElement.style.display = 'block';
      listElement.style.display = 'none';
    }
  }
  
  /**
   * Affiche une erreur
   * @param {string} message - Message d'erreur
   */
  renderError(message) {
    const loadingElement = document.getElementById('admin-users-loading');
    const listElement = document.getElementById('admin-users-list');
    
    if (loadingElement && listElement) {
      loadingElement.style.display = 'none';
      listElement.style.display = 'block';
      
      listElement.innerHTML = `
        <div class="admin-error">
          <p>Erreur lors du chargement des utilisateurs: ${message}</p>
          <button id="admin-retry-btn" class="btn btn-primary">
            <i class="fas fa-sync"></i> Réessayer
          </button>
        </div>
      `;
      
      // Ajouter l'écouteur d'événement pour le bouton de réessai
      const retryBtn = document.getElementById('admin-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this.loadUsers());
      }
    }
  }
  
  /**
   * Affiche la liste des utilisateurs
   */
  renderUsers() {
    const loadingElement = document.getElementById('admin-users-loading');
    const listElement = document.getElementById('admin-users-list');
    
    if (!loadingElement || !listElement) return;
    
    loadingElement.style.display = 'none';
    listElement.style.display = 'block';
    
    // Filtrer les utilisateurs si un terme de recherche est fourni
    const filteredUsers = this.searchTerm
      ? this.users.filter(user => 
          user.username && user.username.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      : this.users;
    
    // Si aucun utilisateur, afficher un message
    if (filteredUsers.length === 0) {
      listElement.innerHTML = `
        <div class="admin-empty">
          <p>Aucun utilisateur trouvé.</p>
        </div>
      `;
      return;
    }
    
    // Créer la table des utilisateurs
    listElement.innerHTML = `
      <table class="admin-users-table">
        <thead>
          <tr>
            <th>Nom d'utilisateur</th>
            <th>Niveau</th>
            <th>XP</th>
            <th>Pièces</th>
            <th>Dernière connexion</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="admin-users-tbody"></tbody>
      </table>
    `;
    
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;
    
    // Ajouter chaque utilisateur à la table
    filteredUsers.forEach(user => {
      const tr = document.createElement('tr');
      
      // Ajouter la classe 'admin' si l'utilisateur est un administrateur
      if (isAdmin(user)) {
        tr.classList.add('admin-user');
      }
      
      tr.innerHTML = `
        <td>${user.username || 'Sans nom'} ${isAdmin(user) ? '<span class="admin-badge"><i class="fas fa-crown"></i></span>' : ''}</td>
        <td>${user.level || 1}</td>
        <td>${user.xp || 0}</td>
        <td>${user.coins || 0}</td>
        <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais'}</td>
        <td>
          <button class="btn-edit" data-id="${user.userId || user.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" data-id="${user.userId || user.id}"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons d'action
    this.addUserActionListeners();
  }
  
  /**
   * Ajoute les écouteurs d'événements pour les boutons d'action
   */
  addUserActionListeners() {
    // Écouteurs pour les boutons de modification
    document.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.dataset.id;
        this.editUser(userId);
      });
    });
    
    // Écouteurs pour les boutons de suppression
    document.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.dataset.id;
        this.confirmDeleteUser(userId);
      });
    });
  }
  
  /**
   * Ouvre le modal d'édition d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  editUser(userId) {
    // Trouver l'utilisateur
    const user = this.users.find(u => (u.userId || u.id) === userId);
    
    if (!user) {
      alert('Utilisateur non trouvé');
      return;
    }
    
    // Créer le modal d'édition
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'edit-user-modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Modifier l'utilisateur ${user.username || 'Sans nom'}</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="edit-user-form">
            <div class="form-group">
              <label for="edit-username">Nom d'utilisateur</label>
              <input type="text" id="edit-username" value="${user.username || ''}" ${user.username && user.username.toLowerCase() === 'ollie' ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label for="edit-level">Niveau</label>
              <input type="number" id="edit-level" value="${user.level || 1}" min="1">
            </div>
            <div class="form-group">
              <label for="edit-xp">XP</label>
              <input type="number" id="edit-xp" value="${user.xp || 0}" min="0">
            </div>
            <div class="form-group">
              <label for="edit-coins">Pièces</label>
              <input type="number" id="edit-coins" value="${user.coins || 0}" min="0">
            </div>
            <div class="form-group">
              <label for="edit-admin">Administrateur</label>
              <input type="checkbox" id="edit-admin" ${isAdmin(user) ? 'checked' : ''} ${user.username && user.username.toLowerCase() === 'ollie' ? 'disabled' : ''}>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-edit">Annuler</button>
          <button class="btn btn-primary" id="save-edit" data-id="${user.userId || user.id}">Enregistrer</button>
        </div>
      </div>
    `;
    
    // Ajouter le modal au document
    document.body.appendChild(modal);
    
    // Afficher le modal
    modal.style.display = 'block';
    
    // Ajouter les écouteurs d'événements
    this.addModalEventListeners(modal, user);
  }
  
  /**
   * Ajoute les écouteurs d'événements au modal
   * @param {HTMLElement} modal - Élément modal
   * @param {Object} user - Utilisateur en cours d'édition
   */
  addModalEventListeners(modal, user) {
    // Écouteur pour le bouton de fermeture
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Écouteur pour le bouton d'annulation
    modal.querySelector('#cancel-edit').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Écouteur pour le bouton de sauvegarde
    modal.querySelector('#save-edit').addEventListener('click', async () => {
      // TODO: Implémenter la sauvegarde des modifications
      document.body.removeChild(modal);
    });
  }
  
  /**
   * Demande confirmation avant de supprimer un utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  confirmDeleteUser(userId) {
    // Trouver l'utilisateur
    const user = this.users.find(u => (u.userId || u.id) === userId);
    
    if (!user) {
      alert('Utilisateur non trouvé');
      return;
    }
    
    // Vérifier si c'est Ollie
    if (user.username && user.username.toLowerCase() === 'ollie') {
      alert('Vous ne pouvez pas supprimer le compte administrateur principal');
      return;
    }
    
    // Demander confirmation
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username || 'Sans nom'} ?`)) {
      this.deleteUser(userId);
    }
  }
  
  /**
   * Supprime un utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  async deleteUser(userId) {
    try {
      // Supprimer l'utilisateur
      await deleteUser(userId, this.currentUser.username);
      
      // Recharger les utilisateurs
      await this.loadUsers();
      
      // Afficher un message de succès
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      alert(`Erreur: ${error.message}`);
    }
  }
}

export default AdminPanel;
