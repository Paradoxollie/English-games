/**
 * Interface utilisateur pour le jeu Enigma Scroll
 * Gère les interactions avec l'interface et les animations
 */

// Classe principale pour gérer l'interface utilisateur
const GameUI = {
  // Éléments du DOM
  gameContainer: null,
  gameArea: null,
  wordGrid: null,
  keyboard: null,
  startButton: null,
  rulesButton: null,
  inGameRulesButton: null,
  difficultyButtons: null,

  // Éléments d'affichage
  levelDisplay: null,
  scoreDisplay: null,
  timeDisplay: null,
  comboDisplay: null,

  // Power-ups
  powerUps: null,
  hintCount: null,
  timeCount: null,
  skipCount: null,

  // Modales
  rulesModal: null,
  gameOverModal: null,
  wordFoundModal: null,
  eventModal: null,

  // Callbacks
  onKeyPress: null,
  onEnter: null,
  onDelete: null,
  onPowerUp: null,
  onStartGame: null,
  onDifficultyChange: null,

  // État de l'interface
  selectedDifficulty: 'intermediate',
  initialized: false,

  /**
   * Initialise l'interface utilisateur
   */
  init: function() {
    if (this.initialized) return;

    // Récupérer les éléments du DOM
    this.gameContainer = document.getElementById('enigma-scroll-container');
    this.gameArea = document.getElementById('game-area');
    this.wordGrid = document.getElementById('word-grid');
    this.keyboard = document.getElementById('keyboard');
    this.startButton = document.getElementById('start-game-button');
    this.rulesButton = document.getElementById('show-rules-button');
    this.inGameRulesButton = document.getElementById('in-game-rules-button');
    this.difficultyButtons = document.querySelectorAll('.difficulty-btn');

    // Éléments d'affichage
    this.levelDisplay = document.getElementById('level-display');
    this.scoreDisplay = document.getElementById('score-display');
    this.timeDisplay = document.getElementById('time-display');
    this.comboDisplay = document.getElementById('combo-display');

    // Power-ups
    this.powerUps = document.querySelectorAll('.power-up');
    this.hintCount = document.getElementById('hint-count');
    this.timeCount = document.getElementById('time-count');
    this.skipCount = document.getElementById('skip-count');

    // Modales
    this.rulesModal = document.getElementById('rulesModal');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.wordFoundModal = document.getElementById('wordFoundModal');
    this.eventModal = document.getElementById('eventModal');

    this.setupEventListeners();
    this.setupModals();

    // S'assurer que la modale des règles est masquée au démarrage
    if (this.rulesModal) {
      this.rulesModal.classList.remove('show');
    }

    this.initialized = true;
    console.log('🖥️ Interface utilisateur initialisée');
  },

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners: function() {
    // Bouton de démarrage
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        if (this.onStartGame) {
          this.onStartGame(this.selectedDifficulty);
        }
      });
    }

    // Bouton des règles du jeu (menu principal)
    if (this.rulesButton) {
      this.rulesButton.addEventListener('click', () => {
        this.showRulesModal();
      });
    }

    // Bouton des règles du jeu (en jeu)
    if (this.inGameRulesButton) {
      this.inGameRulesButton.addEventListener('click', () => {
        this.showRulesModal();
      });
    }

    // Boutons de difficulté
    this.difficultyButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Retirer la classe active de tous les boutons
        this.difficultyButtons.forEach(btn => btn.classList.remove('active'));

        // Ajouter la classe active au bouton cliqué
        button.classList.add('active');

        // Mettre à jour la difficulté sélectionnée
        this.selectedDifficulty = button.dataset.difficulty;

        if (this.onDifficultyChange) {
          this.onDifficultyChange(this.selectedDifficulty);
        }
      });
    });

    // Power-ups
    this.powerUps.forEach(powerUp => {
      powerUp.addEventListener('click', () => {
        const type = powerUp.dataset.power;

        if (this.onPowerUp) {
          this.onPowerUp(type);
        }
      });
    });

    // Clavier virtuel
    if (this.keyboard) {
      const keys = this.keyboard.querySelectorAll('.key-btn');

      keys.forEach(key => {
        key.addEventListener('click', () => {
          const keyValue = key.textContent.trim();

          if (keyValue === 'ENTER') {
            if (this.onEnter) this.onEnter();
          } else if (key.classList.contains('key-delete')) {
            if (this.onDelete) this.onDelete();
          } else {
            if (this.onKeyPress) this.onKeyPress(keyValue);
          }

          // Ajouter un effet de clic
          key.classList.add('key-pressed');
          setTimeout(() => {
            key.classList.remove('key-pressed');
          }, 100);
        });
      });
    }

    // Clavier physique
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        if (this.onEnter) this.onEnter();
      } else if (event.key === 'Backspace') {
        if (this.onDelete) this.onDelete();
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        if (this.onKeyPress) this.onKeyPress(event.key.toUpperCase());
      }
    });
  },

  /**
   * Configure les modales
   */
  setupModals: function() {
    // Fermeture des modales
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        this.hideModal(modal);
      });
    });

    // Bouton pour fermer les règles
    const closeRulesButton = document.getElementById('closeRulesButton');
    if (closeRulesButton) {
      closeRulesButton.addEventListener('click', () => {
        this.hideModal(this.rulesModal);
        // Ne lance pas le jeu, permet à l'utilisateur de choisir sa difficulté
      });
    }

    // Bouton pour rejouer
    const playAgainButton = document.getElementById('playAgainButton');
    if (playAgainButton) {
      playAgainButton.addEventListener('click', () => {
        this.hideModal(this.gameOverModal);

        if (this.onStartGame) {
          this.onStartGame(this.selectedDifficulty);
        }
      });
    }

    // Bouton pour retourner au menu
    const backToMenuButton = document.getElementById('backToMenuButton');
    if (backToMenuButton) {
      backToMenuButton.addEventListener('click', () => {
        this.hideModal(this.gameOverModal);
        this.showGameIntro();
      });
    }

    // Bouton pour passer au mot suivant
    const nextWordButton = document.getElementById('nextWordButton');
    if (nextWordButton) {
      nextWordButton.addEventListener('click', () => {
        this.hideModal(this.wordFoundModal);
      });
    }

    // Boutons d'événement
    const acceptEventButton = document.getElementById('acceptEventButton');
    const declineEventButton = document.getElementById('declineEventButton');

    if (acceptEventButton) {
      acceptEventButton.addEventListener('click', () => {
        this.hideModal(this.eventModal);
        // Le callback sera défini lors de l'affichage de la modale
      });
    }

    if (declineEventButton) {
      declineEventButton.addEventListener('click', () => {
        this.hideModal(this.eventModal);
        // Le callback sera défini lors de l'affichage de la modale
      });
    }
  },

  /**
   * Affiche la modale des règles
   */
  showRulesModal: function() {
    this.showModal(this.rulesModal);
  },

  /**
   * Affiche la modale de fin de partie
   */
  showGameOverModal: function(stats) {
    // Mettre à jour les statistiques
    document.getElementById('final-score').textContent = stats.score;
    document.getElementById('words-found').textContent = stats.wordsFound;
    document.getElementById('max-combo').textContent = `x${stats.maxCombo}`;
    document.getElementById('total-time').textContent = `${stats.totalTime}s`;

    // Mettre à jour les récompenses
    document.getElementById('coins-reward').textContent = `+${stats.coinsEarned}`;
    document.getElementById('xp-reward').textContent = `+${stats.xpEarned} XP`;

    // Afficher/masquer le nouveau record
    const newHighScoreElement = document.getElementById('new-high-score');
    if (stats.isNewHighScore) {
      newHighScoreElement.style.display = 'block';
    } else {
      newHighScoreElement.style.display = 'none';
    }

    // Afficher le dernier mot si la partie s'est terminée par un échec
    const lastWordContainer = document.getElementById('last-word-container');
    const lastWordElement = document.getElementById('last-word');

    if (stats.lastWord && stats.reason === 'failed') {
      lastWordElement.textContent = stats.lastWord;
      lastWordContainer.style.display = 'block';
    } else {
      lastWordContainer.style.display = 'none';
    }

    this.showModal(this.gameOverModal);
  },

  /**
   * Affiche la modale de mot trouvé
   */
  showWordFoundModal: function(word, definition, points, timeBonus) {
    document.getElementById('revealed-word').textContent = word;
    document.getElementById('word-definition').textContent = definition || 'Définition non disponible';
    document.getElementById('points-earned').textContent = `+${points}`;
    document.getElementById('time-bonus').textContent = `+${timeBonus}s`;

    this.showModal(this.wordFoundModal);
  },

  /**
   * Affiche la modale d'événement
   */
  showEventModal: function(event, onAccept, onDecline) {
    document.getElementById('event-description').innerHTML = event.description;

    // Stocker les callbacks
    const acceptButton = document.getElementById('acceptEventButton');
    const declineButton = document.getElementById('declineEventButton');

    if (acceptButton) {
      const oldClickHandler = acceptButton.onclick;
      acceptButton.onclick = (e) => {
        if (oldClickHandler) oldClickHandler(e);
        if (onAccept) onAccept();
      };
    }

    if (declineButton) {
      const oldClickHandler = declineButton.onclick;
      declineButton.onclick = (e) => {
        if (oldClickHandler) oldClickHandler(e);
        if (onDecline) onDecline();
      };
    }

    this.showModal(this.eventModal);
  },

  /**
   * Affiche une modale
   */
  showModal: function(modal) {
    if (!modal) return;

    modal.classList.add('show');
  },

  /**
   * Cache une modale
   */
  hideModal: function(modal) {
    if (!modal) return;

    modal.classList.remove('show');
  },

  /**
   * Affiche l'introduction du jeu et cache la zone de jeu
   */
  showGameIntro: function() {
    // Masquer l'état de jeu actif
    const activeState = document.querySelector('.game-state.active');
    if (activeState) {
      activeState.classList.remove('active');
    }

    // Afficher l'écran d'accueil
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
      welcomeScreen.classList.add('active');
    }

    // S'assurer que la zone de jeu est masquée
    if (this.gameArea) {
      this.gameArea.style.display = 'none';
    }
  },

  /**
   * Affiche la zone de jeu et cache l'introduction
   */
  showGameArea: function() {
    // Masquer l'état de jeu actif
    const activeState = document.querySelector('.game-state.active');
    if (activeState) {
      activeState.classList.remove('active');
    }

    // Afficher la zone de jeu
    if (this.gameArea) {
      this.gameArea.style.display = 'block';
      this.gameArea.classList.add('active');
    }
  },

  /**
   * Crée la grille de jeu
   */
  createGrid: function(rows, cols) {
    if (!this.wordGrid) return;

    // Vider la grille
    this.wordGrid.innerHTML = '';

    // Créer les lignes et cellules
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.className = 'grid-row';

      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = i;
        cell.dataset.col = j;

        row.appendChild(cell);
      }

      this.wordGrid.appendChild(row);
    }
  },

  /**
   * Met à jour une cellule de la grille
   */
  updateCell: function(row, col, letter, state) {
    const cell = this.wordGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    // Mettre à jour le contenu
    cell.textContent = letter;

    // Mettre à jour l'état
    cell.className = 'grid-cell';

    if (letter) {
      cell.classList.add('filled');
    }

    if (state) {
      cell.classList.add(state);
    }
  },

  /**
   * Met à jour l'état d'une touche du clavier
   */
  updateKey: function(letter, state) {
    if (!this.keyboard) return;

    const key = Array.from(this.keyboard.querySelectorAll('.key-btn'))
      .find(key => key.textContent.trim() === letter);

    if (!key) return;

    // Retirer les états précédents
    key.classList.remove('correct', 'present', 'absent');

    // Ajouter le nouvel état
    if (state) {
      key.classList.add(state);
    }
  },

  /**
   * Met à jour l'affichage du niveau
   */
  updateLevel: function(level) {
    if (this.levelDisplay) {
      this.levelDisplay.textContent = level;
    }
  },

  /**
   * Met à jour l'affichage du score
   */
  updateScore: function(score) {
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = score;
    }
  },

  /**
   * Met à jour l'affichage du temps
   */
  updateTime: function(time) {
    if (this.timeDisplay) {
      this.timeDisplay.textContent = time;
    }
  },

  /**
   * Met à jour l'affichage du combo
   */
  updateCombo: function(combo) {
    if (this.comboDisplay) {
      this.comboDisplay.textContent = `x${combo}`;
    }
  },

  /**
   * Met à jour l'affichage des power-ups
   */
  updatePowerUps: function(powerUps) {
    if (this.hintCount) {
      this.hintCount.textContent = powerUps.hint;
    }

    if (this.timeCount) {
      this.timeCount.textContent = powerUps.time;
    }

    if (this.skipCount) {
      this.skipCount.textContent = powerUps.skip;
    }
  },

  /**
   * Affiche un message de notification
   */
  showNotification: function(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Ajouter au conteneur
    const container = document.createElement('div');
    container.className = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';

    // Vérifier si le conteneur existe déjà
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
      notificationContainer = container;
      document.body.appendChild(notificationContainer);
    }

    // Ajouter la notification
    notificationContainer.appendChild(notification);

    // Animer l'entrée
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Supprimer après un délai
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';

      setTimeout(() => {
        notification.remove();

        // Supprimer le conteneur s'il est vide
        if (notificationContainer.children.length === 0) {
          notificationContainer.remove();
        }
      }, 300);
    }, 3000);
  },

  /**
   * Affiche un effet de secousse sur la grille
   */
  shakeGrid: function() {
    if (!this.wordGrid) return;

    this.wordGrid.classList.add('shake');

    setTimeout(() => {
      this.wordGrid.classList.remove('shake');
    }, 500);
  },

  /**
   * Affiche un effet de victoire
   */
  showVictoryEffect: function() {
    // Ajouter une classe temporaire au conteneur du jeu
    if (this.gameContainer) {
      this.gameContainer.classList.add('victory-effect');

      setTimeout(() => {
        this.gameContainer.classList.remove('victory-effect');
      }, 2000);
    }
  },

  /**
   * Nettoie l'interface
   */
  cleanup: function() {
    // Réinitialiser les éléments
    if (this.wordGrid) {
      this.wordGrid.innerHTML = '';
    }

    // Réinitialiser les états des touches
    if (this.keyboard) {
      const keys = this.keyboard.querySelectorAll('.key-btn');
      keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
      });
    }

    // Masquer les modales
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      this.hideModal(modal);
    });
  }
};

// Ajouter des styles CSS pour l'interface
document.addEventListener('DOMContentLoaded', () => {
  // Créer un élément de style
  const style = document.createElement('style');

  // Définir les styles pour les notifications et les animations
  style.textContent = `
    .notification-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .notification {
      background-color: rgba(26, 36, 50, 0.9);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transform: translateX(100%);
      transition: opacity 0.3s ease, transform 0.3s ease;
      max-width: 300px;
    }

    .notification-info {
      border-left: 4px solid #1565c0;
    }

    .notification-success {
      border-left: 4px solid #2e7d32;
    }

    .notification-warning {
      border-left: 4px solid #f9a825;
    }

    .notification-error {
      border-left: 4px solid #e53935;
    }

    .shake {
      animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    @keyframes shake {
      10%, 90% {
        transform: translateX(-2px);
      }
      20%, 80% {
        transform: translateX(4px);
      }
      30%, 50%, 70% {
        transform: translateX(-6px);
      }
      40%, 60% {
        transform: translateX(6px);
      }
    }

    .victory-effect {
      animation: victory-pulse 2s ease;
    }

    @keyframes victory-pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
      }
      50% {
        box-shadow: 0 0 30px 10px rgba(46, 125, 50, 0.7);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
      }
    }

    .key-pressed {
      transform: scale(0.95);
      opacity: 0.8;
    }
  `;

  // Ajouter au document
  document.head.appendChild(style);
});
