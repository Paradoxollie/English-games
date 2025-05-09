/**
 * Composant Modal d'authentification
 * Gère l'inscription et la connexion des utilisateurs
 */

class AuthModal {
  constructor(authService) {
    this.authService = authService;
    this.modalElement = null;
    this.isOpen = false;
    this.onLoginSuccess = null;
    
    this.createModal();
  }
  
  /**
   * Crée l'élément modal dans le DOM
   */
  createModal() {
    // Créer l'élément modal s'il n'existe pas déjà
    if (document.getElementById('auth-modal')) {
      this.modalElement = document.getElementById('auth-modal');
      return;
    }
    
    // Créer la structure du modal
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'auth-modal-title');
    
    modal.innerHTML = `
      <div class="modal__overlay" tabindex="-1" data-micromodal-close>
        <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <header class="modal__header">
            <h2 class="modal__title" id="auth-modal-title">
              Créer un compte aventurier
            </h2>
            <button class="modal__close" aria-label="Fermer" data-micromodal-close></button>
          </header>
          <main class="modal__content" id="auth-modal-content">
            <div class="auth-steps">
              <!-- Étape 1: Bienvenue -->
              <div class="auth-step" id="auth-step-welcome" data-step="welcome">
                <div class="auth-step__content">
                  <h3 class="auth-step__title">Bienvenue dans English Quest!</h3>
                  <p class="auth-step__description">
                    Créez un compte pour sauvegarder vos scores, suivre votre progression
                    et apparaître dans les classements.
                  </p>
                  <p class="auth-step__description">
                    <strong>Aucune adresse email requise!</strong> Nous respectons votre vie privée.
                  </p>
                </div>
                <div class="auth-step__actions">
                  <button class="btn btn-primary" id="auth-start-btn">Commencer l'aventure</button>
                  <button class="btn btn-outline-primary" data-micromodal-close>Plus tard</button>
                </div>
              </div>
              
              <!-- Étape 2: Création du profil -->
              <div class="auth-step" id="auth-step-profile" data-step="profile" style="display: none;">
                <div class="auth-step__content">
                  <h3 class="auth-step__title">Créez votre identité</h3>
                  <p class="auth-step__description">
                    Choisissez un nom d'aventurier unique qui vous représentera dans le monde d'English Quest.
                  </p>
                  
                  <div class="form-group">
                    <label for="username-input" class="form-label">Nom d'aventurier</label>
                    <input type="text" id="username-input" class="form-control" 
                           placeholder="Ex: BraveKnight42" minlength="3" maxlength="20" required>
                    <div class="form-text">Entre 3 et 20 caractères, lettres et chiffres uniquement.</div>
                    <div class="form-feedback" id="username-feedback"></div>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-checkbox">
                      <input type="checkbox" id="terms-checkbox" required>
                      <span class="checkbox-text">
                        J'accepte les <a href="/terms.html" target="_blank">conditions d'utilisation</a>
                        et la <a href="/privacy.html" target="_blank">politique de confidentialité</a>
                      </span>
                    </label>
                  </div>
                </div>
                <div class="auth-step__actions">
                  <button class="btn btn-primary" id="create-profile-btn" disabled>Créer mon profil</button>
                  <button class="btn btn-outline-primary" id="back-to-welcome-btn">Retour</button>
                </div>
              </div>
              
              <!-- Étape 3: Confirmation -->
              <div class="auth-step" id="auth-step-success" data-step="success" style="display: none;">
                <div class="auth-step__content">
                  <div class="auth-success-icon">🎉</div>
                  <h3 class="auth-step__title">Félicitations, <span id="success-username"></span>!</h3>
                  <p class="auth-step__description">
                    Votre compte a été créé avec succès. Vous pouvez maintenant profiter pleinement
                    de toutes les fonctionnalités d'English Quest!
                  </p>
                </div>
                <div class="auth-step__actions">
                  <button class="btn btn-primary" id="start-playing-btn">Commencer à jouer</button>
                </div>
              </div>
              
              <!-- Étape d'erreur -->
              <div class="auth-step" id="auth-step-error" data-step="error" style="display: none;">
                <div class="auth-step__content">
                  <div class="auth-error-icon">❌</div>
                  <h3 class="auth-step__title">Oups! Une erreur s'est produite</h3>
                  <p class="auth-step__description" id="error-message">
                    Nous n'avons pas pu créer votre compte. Veuillez réessayer.
                  </p>
                </div>
                <div class="auth-step__actions">
                  <button class="btn btn-primary" id="try-again-btn">Réessayer</button>
                  <button class="btn btn-outline-primary" data-micromodal-close>Fermer</button>
                </div>
              </div>
            </div>
          </main>
          <footer class="modal__footer">
            <p class="modal__footer-text">
              Déjà un compte? <button class="btn-link" id="login-btn">Se connecter</button>
            </p>
          </footer>
        </div>
      </div>
    `;
    
    // Ajouter le modal au body
    document.body.appendChild(modal);
    this.modalElement = modal;
    
    // Initialiser les événements
    this.initEvents();
  }
  
  /**
   * Initialise les événements du modal
   */
  initEvents() {
    // Bouton de démarrage
    const startBtn = document.getElementById('auth-start-btn');
    startBtn.addEventListener('click', () => this.showStep('profile'));
    
    // Bouton de retour
    const backBtn = document.getElementById('back-to-welcome-btn');
    backBtn.addEventListener('click', () => this.showStep('welcome'));
    
    // Bouton de création de profil
    const createProfileBtn = document.getElementById('create-profile-btn');
    createProfileBtn.addEventListener('click', () => this.createProfile());
    
    // Bouton de démarrage du jeu
    const startPlayingBtn = document.getElementById('start-playing-btn');
    startPlayingBtn.addEventListener('click', () => {
      this.close();
      if (typeof this.onLoginSuccess === 'function') {
        this.onLoginSuccess();
      }
    });
    
    // Bouton de nouvelle tentative
    const tryAgainBtn = document.getElementById('try-again-btn');
    tryAgainBtn.addEventListener('click', () => this.showStep('profile'));
    
    // Bouton de connexion
    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('click', () => this.showLoginForm());
    
    // Validation du nom d'utilisateur
    const usernameInput = document.getElementById('username-input');
    usernameInput.addEventListener('input', () => this.validateUsername());
    
    // Validation des conditions
    const termsCheckbox = document.getElementById('terms-checkbox');
    termsCheckbox.addEventListener('change', () => this.validateForm());
    
    // Fermeture du modal
    const closeButtons = this.modalElement.querySelectorAll('[data-micromodal-close]');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => this.close());
    });
    
    // Fermeture en cliquant sur l'overlay
    const overlay = this.modalElement.querySelector('.modal__overlay');
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.close();
      }
    });
    
    // Fermeture avec la touche Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  /**
   * Affiche une étape spécifique du modal
   * @param {string} step - L'étape à afficher
   */
  showStep(step) {
    const steps = this.modalElement.querySelectorAll('.auth-step');
    steps.forEach(stepElement => {
      if (stepElement.dataset.step === step) {
        stepElement.style.display = 'block';
      } else {
        stepElement.style.display = 'none';
      }
    });
    
    // Réinitialiser les formulaires si on revient à l'étape de profil
    if (step === 'profile') {
      const usernameInput = document.getElementById('username-input');
      const termsCheckbox = document.getElementById('terms-checkbox');
      const usernameFeedback = document.getElementById('username-feedback');
      
      usernameFeedback.textContent = '';
      usernameFeedback.className = 'form-feedback';
      
      // Ne pas réinitialiser les valeurs si on revient de l'étape d'erreur
      if (this.currentStep !== 'error') {
        usernameInput.value = '';
        termsCheckbox.checked = false;
      }
      
      this.validateForm();
    }
    
    this.currentStep = step;
  }
  
  /**
   * Valide le nom d'utilisateur
   */
  async validateUsername() {
    const usernameInput = document.getElementById('username-input');
    const usernameFeedback = document.getElementById('username-feedback');
    const username = usernameInput.value.trim();
    
    // Réinitialiser le feedback
    usernameFeedback.textContent = '';
    usernameFeedback.className = 'form-feedback';
    
    // Vérifier la longueur
    if (username.length < 3) {
      usernameFeedback.textContent = 'Le nom doit contenir au moins 3 caractères';
      usernameFeedback.className = 'form-feedback error';
      this.validateForm();
      return false;
    }
    
    // Vérifier les caractères
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameFeedback.textContent = 'Utilisez uniquement des lettres, chiffres et underscore';
      usernameFeedback.className = 'form-feedback error';
      this.validateForm();
      return false;
    }
    
    // Vérifier la disponibilité
    try {
      const isAvailable = await this.authService.isUsernameAvailable(username);
      
      if (!isAvailable) {
        usernameFeedback.textContent = 'Ce nom est déjà pris';
        usernameFeedback.className = 'form-feedback error';
        this.validateForm();
        return false;
      }
      
      usernameFeedback.textContent = 'Nom disponible!';
      usernameFeedback.className = 'form-feedback success';
      this.validateForm();
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du nom:', error);
      usernameFeedback.textContent = 'Erreur lors de la vérification';
      usernameFeedback.className = 'form-feedback error';
      this.validateForm();
      return false;
    }
  }
  
  /**
   * Valide le formulaire complet
   */
  validateForm() {
    const usernameInput = document.getElementById('username-input');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const createProfileBtn = document.getElementById('create-profile-btn');
    const usernameFeedback = document.getElementById('username-feedback');
    
    const usernameValid = usernameInput.value.trim().length >= 3 && 
                         /^[a-zA-Z0-9_]+$/.test(usernameInput.value.trim()) &&
                         usernameFeedback.className.includes('success');
    
    const termsAccepted = termsCheckbox.checked;
    
    createProfileBtn.disabled = !(usernameValid && termsAccepted);
  }
  
  /**
   * Crée le profil utilisateur
   */
  async createProfile() {
    const usernameInput = document.getElementById('username-input');
    const createProfileBtn = document.getElementById('create-profile-btn');
    const username = usernameInput.value.trim();
    
    // Désactiver le bouton pendant le traitement
    createProfileBtn.disabled = true;
    createProfileBtn.innerHTML = '<span class="spinner"></span> Création en cours...';
    
    try {
      // Connecter l'utilisateur anonymement s'il ne l'est pas déjà
      if (!this.authService.isLoggedIn()) {
        await this.authService.signInAnonymously();
      }
      
      // Créer le profil
      const profile = await this.authService.createUserProfile(username);
      
      // Afficher l'étape de succès
      document.getElementById('success-username').textContent = profile.username;
      this.showStep('success');
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      
      // Afficher l'erreur
      document.getElementById('error-message').textContent = error.message || 'Une erreur s\'est produite lors de la création du profil.';
      this.showStep('error');
    } finally {
      // Réactiver le bouton
      createProfileBtn.disabled = false;
      createProfileBtn.innerHTML = 'Créer mon profil';
    }
  }
  
  /**
   * Affiche le formulaire de connexion
   */
  showLoginForm() {
    // Remplacer le contenu du modal
    const modalContent = document.getElementById('auth-modal-content');
    const modalTitle = document.getElementById('auth-modal-title');
    const modalFooter = this.modalElement.querySelector('.modal__footer');
    
    modalTitle.textContent = 'Connexion';
    
    modalContent.innerHTML = `
      <div class="auth-login-form">
        <p class="auth-step__description">
          Entrez votre nom d'aventurier pour vous connecter à votre compte.
        </p>
        
        <div class="form-group">
          <label for="login-username" class="form-label">Nom d'aventurier</label>
          <input type="text" id="login-username" class="form-control" 
                 placeholder="Votre nom d'aventurier" required>
          <div class="form-feedback" id="login-feedback"></div>
        </div>
        
        <div class="auth-step__actions">
          <button class="btn btn-primary" id="login-submit-btn">Se connecter</button>
          <button class="btn btn-outline-primary" id="back-to-signup-btn">Créer un compte</button>
        </div>
      </div>
    `;
    
    modalFooter.innerHTML = `
      <p class="modal__footer-text">
        Pas encore de compte? <button class="btn-link" id="signup-btn">S'inscrire</button>
      </p>
    `;
    
    // Initialiser les événements
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    loginSubmitBtn.addEventListener('click', () => this.login());
    
    const backToSignupBtn = document.getElementById('back-to-signup-btn');
    backToSignupBtn.addEventListener('click', () => this.resetModal());
    
    const signupBtn = document.getElementById('signup-btn');
    signupBtn.addEventListener('click', () => this.resetModal());
  }
  
  /**
   * Tente de connecter l'utilisateur
   */
  async login() {
    const usernameInput = document.getElementById('login-username');
    const loginFeedback = document.getElementById('login-feedback');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const username = usernameInput.value.trim();
    
    // Réinitialiser le feedback
    loginFeedback.textContent = '';
    loginFeedback.className = 'form-feedback';
    
    // Vérifier que le nom n'est pas vide
    if (!username) {
      loginFeedback.textContent = 'Veuillez entrer votre nom d\'aventurier';
      loginFeedback.className = 'form-feedback error';
      return;
    }
    
    // Désactiver le bouton pendant le traitement
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerHTML = '<span class="spinner"></span> Connexion...';
    
    try {
      // TODO: Implémenter la connexion par nom d'utilisateur
      // Cette fonctionnalité nécessite une implémentation côté serveur
      // Pour l'instant, nous allons simplement afficher un message d'erreur
      
      loginFeedback.textContent = 'Fonctionnalité en cours de développement';
      loginFeedback.className = 'form-feedback error';
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      loginFeedback.textContent = error.message || 'Une erreur s\'est produite lors de la connexion.';
      loginFeedback.className = 'form-feedback error';
    } finally {
      // Réactiver le bouton
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.innerHTML = 'Se connecter';
    }
  }
  
  /**
   * Réinitialise le modal à son état initial
   */
  resetModal() {
    // Recréer le modal
    this.modalElement.remove();
    this.createModal();
    
    // Afficher l'étape de bienvenue
    this.showStep('welcome');
  }
  
  /**
   * Ouvre le modal
   * @param {Function} onSuccess - Fonction à appeler après une connexion réussie
   */
  open(onSuccess = null) {
    if (onSuccess) {
      this.onLoginSuccess = onSuccess;
    }
    
    this.modalElement.classList.add('is-open');
    this.modalElement.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.isOpen = true;
    
    // Afficher l'étape appropriée
    if (this.authService.isLoggedIn() && this.authService.hasProfile()) {
      // L'utilisateur est déjà connecté
      this.close();
      if (typeof this.onLoginSuccess === 'function') {
        this.onLoginSuccess();
      }
    } else {
      // Afficher l'étape de bienvenue
      this.showStep('welcome');
    }
  }
  
  /**
   * Ferme le modal
   */
  close() {
    this.modalElement.classList.remove('is-open');
    this.modalElement.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    this.isOpen = false;
  }
}

export default AuthModal;
