/**
 * Composant de gestion des comptes utilisateurs
 * Gère les profils utilisateurs conformes au RGPD sans adresse email
 */

class UserAccount {
  /**
   * Constructeur
   * @param {AuthService} authService - Service d'authentification
   */
  constructor(authService) {
    this.authService = authService;
    this.profileContainer = null;
    this.settingsContainer = null;
    this.deleteAccountBtn = null;
    this.logoutBtn = null;
    
    // Initialiser les événements
    this.initEvents();
  }
  
  /**
   * Initialise les événements
   */
  initEvents() {
    // Bouton de déconnexion
    document.addEventListener('click', (e) => {
      if (e.target.matches('#logout-btn')) {
        this.logout();
      }
    });
    
    // Bouton de suppression de compte
    document.addEventListener('click', (e) => {
      if (e.target.matches('#delete-account-btn')) {
        this.confirmDeleteAccount();
      }
    });
    
    // Formulaire de mise à jour du profil
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#profile-form')) {
        e.preventDefault();
        this.updateProfile(e.target);
      }
    });
    
    // Formulaire de mise à jour des paramètres
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#settings-form')) {
        e.preventDefault();
        this.updateSettings(e.target);
      }
    });
  }
  
  /**
   * Rend le profil utilisateur
   * @param {string} containerId - ID du conteneur
   */
  renderProfile(containerId) {
    this.profileContainer = document.getElementById(containerId);
    
    if (!this.profileContainer) {
      console.error(`Conteneur avec l'ID "${containerId}" non trouvé.`);
      return;
    }
    
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn() || !this.authService.hasProfile()) {
      this.renderLoginPrompt(this.profileContainer);
      return;
    }
    
    // Obtenir le profil
    const profile = this.authService.userProfile;
    
    // Créer le HTML
    this.profileContainer.innerHTML = `
      <div class="user-profile">
        <div class="user-profile__header">
          <div class="user-profile__avatar">
            <div class="user-profile__avatar-text">${this.getInitials(profile.username)}</div>
          </div>
          <div class="user-profile__info">
            <h2 class="user-profile__name">${profile.username}</h2>
            <p class="user-profile__joined">Membre depuis ${this.formatDate(profile.createdAt)}</p>
          </div>
        </div>
        
        <div class="user-profile__stats">
          <div class="user-profile__stat">
            <span class="user-profile__stat-value">${profile.stats?.totalGamesPlayed || 0}</span>
            <span class="user-profile__stat-label">Parties jouées</span>
          </div>
          <div class="user-profile__stat">
            <span class="user-profile__stat-value">${profile.stats?.highestScore || 0}</span>
            <span class="user-profile__stat-label">Meilleur score</span>
          </div>
          <div class="user-profile__stat">
            <span class="user-profile__stat-value">${profile.stats?.achievements?.length || 0}</span>
            <span class="user-profile__stat-label">Succès</span>
          </div>
        </div>
        
        <div class="user-profile__actions">
          <button id="edit-profile-btn" class="btn btn-outline-primary">Modifier le profil</button>
          <button id="logout-btn" class="btn btn-outline-primary">Déconnexion</button>
        </div>
        
        <form id="profile-form" class="user-profile__form" style="display: none;">
          <div class="form-group">
            <label for="username-input" class="form-label">Nom d'utilisateur</label>
            <input type="text" id="username-input" class="form-control" 
                   value="${profile.username}" minlength="3" maxlength="20" required>
            <div class="form-feedback" id="username-feedback"></div>
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn btn-primary">Enregistrer</button>
            <button type="button" id="cancel-edit-btn" class="btn btn-outline-primary">Annuler</button>
          </div>
        </form>
      </div>
    `;
    
    // Ajouter les événements
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const profileForm = document.getElementById('profile-form');
    const usernameInput = document.getElementById('username-input');
    
    editProfileBtn.addEventListener('click', () => {
      editProfileBtn.style.display = 'none';
      profileForm.style.display = 'block';
    });
    
    cancelEditBtn.addEventListener('click', () => {
      editProfileBtn.style.display = 'inline-block';
      profileForm.style.display = 'none';
      usernameInput.value = profile.username;
    });
    
    // Validation du nom d'utilisateur
    usernameInput.addEventListener('input', async () => {
      const usernameFeedback = document.getElementById('username-feedback');
      const username = usernameInput.value.trim();
      
      // Réinitialiser le feedback
      usernameFeedback.textContent = '';
      usernameFeedback.className = 'form-feedback';
      
      // Vérifier la longueur
      if (username.length < 3) {
        usernameFeedback.textContent = 'Le nom doit contenir au moins 3 caractères';
        usernameFeedback.className = 'form-feedback error';
        return;
      }
      
      // Vérifier les caractères
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        usernameFeedback.textContent = 'Utilisez uniquement des lettres, chiffres et underscore';
        usernameFeedback.className = 'form-feedback error';
        return;
      }
      
      // Si le nom n'a pas changé, ne pas vérifier la disponibilité
      if (username === profile.username) {
        return;
      }
      
      // Vérifier la disponibilité
      try {
        const isAvailable = await this.authService.isUsernameAvailable(username);
        
        if (!isAvailable) {
          usernameFeedback.textContent = 'Ce nom est déjà pris';
          usernameFeedback.className = 'form-feedback error';
        } else {
          usernameFeedback.textContent = 'Nom disponible!';
          usernameFeedback.className = 'form-feedback success';
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du nom:', error);
        usernameFeedback.textContent = 'Erreur lors de la vérification';
        usernameFeedback.className = 'form-feedback error';
      }
    });
  }
  
  /**
   * Rend les paramètres utilisateur
   * @param {string} containerId - ID du conteneur
   */
  renderSettings(containerId) {
    this.settingsContainer = document.getElementById(containerId);
    
    if (!this.settingsContainer) {
      console.error(`Conteneur avec l'ID "${containerId}" non trouvé.`);
      return;
    }
    
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn() || !this.authService.hasProfile()) {
      this.renderLoginPrompt(this.settingsContainer);
      return;
    }
    
    // Obtenir le profil
    const profile = this.authService.userProfile;
    const settings = profile.settings || {};
    
    // Créer le HTML
    this.settingsContainer.innerHTML = `
      <div class="user-settings">
        <h2 class="user-settings__title">Paramètres du compte</h2>
        
        <form id="settings-form" class="user-settings__form">
          <div class="form-group">
            <label class="form-switch">
              <input type="checkbox" id="notifications-checkbox" 
                     ${settings.notifications ? 'checked' : ''}>
              <span class="switch-text">Recevoir des notifications</span>
            </label>
            <div class="form-text">Recevez des notifications sur les nouveaux jeux et cours.</div>
          </div>
          
          <div class="form-group">
            <label class="form-switch">
              <input type="checkbox" id="share-stats-checkbox" 
                     ${settings.shareStats ? 'checked' : ''}>
              <span class="switch-text">Partager mes statistiques</span>
            </label>
            <div class="form-text">Partagez vos statistiques de jeu avec la communauté.</div>
          </div>
          
          <div class="form-group">
            <label class="form-switch">
              <input type="checkbox" id="leaderboard-checkbox" 
                     ${settings.appearInLeaderboard ? 'checked' : ''}>
              <span class="switch-text">Apparaître dans les classements</span>
            </label>
            <div class="form-text">Votre nom apparaîtra dans les classements publics.</div>
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn btn-primary">Enregistrer</button>
          </div>
        </form>
        
        <div class="user-settings__danger-zone">
          <h3 class="user-settings__subtitle">Zone de danger</h3>
          <p class="user-settings__text">
            La suppression de votre compte est irréversible et supprimera toutes vos données.
          </p>
          <button id="delete-account-btn" class="btn btn-danger">Supprimer mon compte</button>
        </div>
      </div>
    `;
  }
  
  /**
   * Rend une invite de connexion
   * @param {HTMLElement} container - Conteneur
   */
  renderLoginPrompt(container) {
    container.innerHTML = `
      <div class="login-prompt">
        <h2 class="login-prompt__title">Connectez-vous pour accéder à cette fonctionnalité</h2>
        <p class="login-prompt__text">
          Créez un compte ou connectez-vous pour accéder à votre profil et vos paramètres.
        </p>
        <button id="login-prompt-btn" class="btn btn-primary">Se connecter</button>
      </div>
    `;
    
    // Ajouter l'événement
    const loginPromptBtn = document.getElementById('login-prompt-btn');
    loginPromptBtn.addEventListener('click', () => {
      // Ouvrir le modal d'authentification
      const event = new CustomEvent('open-auth-modal');
      document.dispatchEvent(event);
    });
  }
  
  /**
   * Met à jour le profil utilisateur
   * @param {HTMLFormElement} form - Formulaire
   */
  async updateProfile(form) {
    const usernameInput = form.querySelector('#username-input');
    const username = usernameInput.value.trim();
    const usernameFeedback = document.getElementById('username-feedback');
    
    // Vérifier si le nom d'utilisateur est valide
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameFeedback.textContent = 'Nom d\'utilisateur invalide';
      usernameFeedback.className = 'form-feedback error';
      return;
    }
    
    // Vérifier si le nom d'utilisateur est disponible
    if (username !== this.authService.userProfile.username) {
      try {
        const isAvailable = await this.authService.isUsernameAvailable(username);
        
        if (!isAvailable) {
          usernameFeedback.textContent = 'Ce nom est déjà pris';
          usernameFeedback.className = 'form-feedback error';
          return;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du nom:', error);
        usernameFeedback.textContent = 'Erreur lors de la vérification';
        usernameFeedback.className = 'form-feedback error';
        return;
      }
    }
    
    // Mettre à jour le profil
    try {
      await this.authService.updateUserProfile({
        username
      });
      
      // Afficher un message de succès
      usernameFeedback.textContent = 'Profil mis à jour avec succès!';
      usernameFeedback.className = 'form-feedback success';
      
      // Mettre à jour l'affichage
      setTimeout(() => {
        this.renderProfile(this.profileContainer.id);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      usernameFeedback.textContent = 'Erreur lors de la mise à jour du profil';
      usernameFeedback.className = 'form-feedback error';
    }
  }
  
  /**
   * Met à jour les paramètres utilisateur
   * @param {HTMLFormElement} form - Formulaire
   */
  async updateSettings(form) {
    const notificationsCheckbox = form.querySelector('#notifications-checkbox');
    const shareStatsCheckbox = form.querySelector('#share-stats-checkbox');
    const leaderboardCheckbox = form.querySelector('#leaderboard-checkbox');
    
    // Mettre à jour les paramètres
    try {
      await this.authService.updateUserProfile({
        settings: {
          notifications: notificationsCheckbox.checked,
          shareStats: shareStatsCheckbox.checked,
          appearInLeaderboard: leaderboardCheckbox.checked
        }
      });
      
      // Afficher un message de succès
      const settingsForm = document.getElementById('settings-form');
      const successMessage = document.createElement('div');
      successMessage.className = 'form-feedback success';
      successMessage.textContent = 'Paramètres mis à jour avec succès!';
      settingsForm.appendChild(successMessage);
      
      // Supprimer le message après 3 secondes
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      
      // Afficher un message d'erreur
      const settingsForm = document.getElementById('settings-form');
      const errorMessage = document.createElement('div');
      errorMessage.className = 'form-feedback error';
      errorMessage.textContent = 'Erreur lors de la mise à jour des paramètres';
      settingsForm.appendChild(errorMessage);
      
      // Supprimer le message après 3 secondes
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    }
  }
  
  /**
   * Déconnecte l'utilisateur
   */
  async logout() {
    try {
      await this.authService.signOut();
      
      // Rediriger vers la page d'accueil
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
  
  /**
   * Confirme la suppression du compte
   */
  confirmDeleteAccount() {
    // Créer le modal de confirmation
    const modal = document.createElement('div');
    modal.className = 'modal confirm-modal';
    modal.id = 'confirm-delete-modal';
    
    modal.innerHTML = `
      <div class="modal__overlay" tabindex="-1" data-micromodal-close>
        <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <header class="modal__header">
            <h2 class="modal__title" id="confirm-delete-title">
              Supprimer le compte
            </h2>
            <button class="modal__close" aria-label="Fermer" data-micromodal-close></button>
          </header>
          <main class="modal__content">
            <div class="confirm-modal__icon confirm-modal__icon--danger">⚠️</div>
            <h3 class="confirm-modal__title">Êtes-vous sûr de vouloir supprimer votre compte ?</h3>
            <p class="confirm-modal__message">
              Cette action est irréversible et supprimera toutes vos données, y compris vos scores et vos progrès.
            </p>
            <div class="confirm-modal__actions">
              <button id="confirm-delete-btn" class="btn btn-danger">Supprimer définitivement</button>
              <button class="btn btn-outline-primary" data-micromodal-close>Annuler</button>
            </div>
          </main>
        </div>
      </div>
    `;
    
    // Ajouter le modal au body
    document.body.appendChild(modal);
    
    // Ouvrir le modal
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    
    // Ajouter les événements
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const closeButtons = modal.querySelectorAll('[data-micromodal-close]');
    
    confirmDeleteBtn.addEventListener('click', async () => {
      try {
        await this.authService.deleteAccount();
        
        // Fermer le modal
        this.closeModal(modal);
        
        // Rediriger vers la page d'accueil
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        
        // Afficher un message d'erreur
        const message = document.querySelector('.confirm-modal__message');
        message.textContent = 'Une erreur s\'est produite lors de la suppression du compte. Veuillez réessayer.';
        message.style.color = 'var(--color-error)';
      }
    });
    
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.closeModal(modal);
      });
    });
    
    // Fermeture avec la touche Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        this.closeModal(modal);
      }
    });
  }
  
  /**
   * Ferme un modal
   * @param {HTMLElement} modal - Modal
   */
  closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    
    // Supprimer le modal après l'animation
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
  
  /**
   * Obtient les initiales d'un nom
   * @param {string} name - Nom
   * @returns {string} - Initiales
   */
  getInitials(name) {
    return name
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }
  
  /**
   * Formate une date
   * @param {Date|string|number} date - Date
   * @returns {string} - Date formatée
   */
  formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  }
}

export default UserAccount;
