/**
 * Enigma Scroll - Jeu de mots mystérieux
 * Version améliorée pour English Quest Reborn
 */

// État du jeu - Accessible globalement pour le leaderboard
window.gameState = {
  // Paramètres du jeu
  difficulty: 'intermediate',
  maxAttempts: 6,
  timeLimit: 60,

  // État actuel
  currentWord: '',
  currentGuess: '',
  guesses: [],
  gameStatus: 'waiting', // 'waiting', 'playing', 'won', 'lost'

  // Progression
  level: 1,
  score: 0,
  wordsFound: 0,
  combo: 1,
  maxCombo: 1,

  // Temps
  timeRemaining: 60,
  timerInterval: null,
  totalTime: 0,

  // Power-ups
  powerUps: {
    hint: 3,
    time: 2,
    skip: 1
  },

  // Événements
  eventChance: 0.2,
  eventActive: false,

  // Utilisateur
  username: 'Invité',
  userId: null,

  // Historique
  usedWords: new Set(),
  highScore: 0
};

/**
 * Initialise le jeu
 */
function initGame() {
  console.log('🎮 Initialisation du jeu Enigma Scroll');

  // Initialiser l'interface utilisateur
  gameUI.init();

  // Configurer les callbacks de l'interface
  setupUICallbacks();

  // Initialiser les effets visuels
  gameEffects.init();

  // Charger les données utilisateur
  loadUserData();

  // Initialiser le leaderboard
  if (window.EnigmaScrollLeaderboard && typeof window.EnigmaScrollLeaderboard.init === 'function') {
    window.EnigmaScrollLeaderboard.init('enigma-scroll-leaderboard');
    console.log('Leaderboard initialisé');
  } else {
    console.warn('Leaderboard non disponible');
  }

  // Afficher la modale des règles au chargement
  setTimeout(() => {
    gameUI.showRulesModal();
  }, 500);
}

/**
 * Configure les callbacks de l'interface utilisateur
 */
function setupUICallbacks() {
  // Callback pour le démarrage du jeu
  gameUI.onStartGame = (difficulty) => {
    startGame(difficulty);
  };

  // Callback pour le changement de difficulté
  gameUI.onDifficultyChange = (difficulty) => {
    gameState.difficulty = difficulty;
    console.log(`Difficulté changée: ${difficulty}`);
  };

  // Callback pour l'appui sur une touche
  gameUI.onKeyPress = (key) => {
    handleKeyInput(key);
  };

  // Callback pour l'appui sur Entrée
  gameUI.onEnter = () => {
    handleEnter();
  };

  // Callback pour l'appui sur Supprimer
  gameUI.onDelete = () => {
    handleDelete();
  };

  // Callback pour l'utilisation d'un power-up
  gameUI.onPowerUp = (type) => {
    usePowerUp(type);
  };
}

/**
 * Charge les données utilisateur
 */
function loadUserData() {
  // Essayer de récupérer le nom d'utilisateur depuis le stockage local
  const storedUsername = localStorage.getItem('eq_username');
  if (storedUsername) {
    gameState.username = storedUsername;
    console.log(`Utilisateur chargé: ${gameState.username}`);
  }

  // Essayer de récupérer l'ID utilisateur depuis le stockage local
  const storedUserId = localStorage.getItem('eq_userId');
  if (storedUserId) {
    gameState.userId = storedUserId;
  }

  // Essayer de récupérer le meilleur score
  const storedHighScore = localStorage.getItem('eq_enigma_highscore');
  if (storedHighScore) {
    gameState.highScore = parseInt(storedHighScore, 10);
    console.log(`Meilleur score chargé: ${gameState.highScore}`);
  }

  // Mettre à jour l'affichage du nom d'utilisateur
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = gameState.username;
  }
}

/**
 * Démarre une nouvelle partie
 */
function startGame(difficulty) {
  console.log(`Démarrage du jeu en difficulté: ${difficulty}`);

  // Mettre à jour la difficulté
  gameState.difficulty = difficulty || gameState.difficulty;

  // Réinitialiser l'état du jeu
  resetGameState();

  // Afficher la zone de jeu
  gameUI.showGameArea();

  // Créer la grille en fonction de la difficulté
  const wordLength = getWordLengthForDifficulty(gameState.difficulty);
  gameUI.createGrid(gameState.maxAttempts, wordLength);

  // Choisir un mot aléatoire
  startNewWord();

  // Démarrer le timer
  startTimer();

  // Mettre à jour l'affichage
  updateDisplay();

  // Changer le statut du jeu
  gameState.gameStatus = 'playing';
}

/**
 * Réinitialise l'état du jeu
 */
function resetGameState() {
  gameState.currentWord = '';
  gameState.currentGuess = '';
  gameState.guesses = [];
  gameState.gameStatus = 'waiting';
  gameState.level = 1;
  gameState.score = 0;
  gameState.wordsFound = 0;
  gameState.combo = 1;
  gameState.maxCombo = 1;
  gameState.timeRemaining = gameState.timeLimit;
  gameState.totalTime = 0;
  gameState.usedWords.clear();
  gameState.eventActive = false;

  // Réinitialiser les power-ups
  gameState.powerUps = {
    hint: 3,
    time: 2,
    skip: 1
  };

  // Arrêter le timer s'il est en cours
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

/**
 * Démarre un nouveau mot
 */
function startNewWord() {
  // Réinitialiser la tentative actuelle
  gameState.currentGuess = '';
  gameState.guesses = [];

  // Obtenir un nouveau mot
  const wordLength = getWordLengthForDifficulty(gameState.difficulty);
  let newWord;

  do {
    newWord = getRandomWord(gameState.difficulty);
  } while (gameState.usedWords.has(newWord));

  gameState.currentWord = newWord;
  gameState.usedWords.add(newWord);

  console.log(`Nouveau mot: ${gameState.currentWord} (${wordLength} lettres)`);

  // Créer une nouvelle grille
  gameUI.createGrid(gameState.maxAttempts, wordLength);

  // Réinitialiser les états des touches du clavier
  resetKeyboardState();

  // Vérifier s'il faut déclencher un événement aléatoire
  checkForRandomEvent();
}

/**
 * Obtient la longueur du mot en fonction de la difficulté
 */
function getWordLengthForDifficulty(difficulty) {
  switch (difficulty) {
    case 'beginner':
      return 4;
    case 'intermediate':
      return 5;
    case 'advanced':
      return 7;
    case 'expert':
      return 9;
    case 'legendary':
      return 10;
    default:
      return 5;
  }
}

/**
 * Réinitialise l'état du clavier
 */
function resetKeyboardState() {
  const keys = document.querySelectorAll('.key-btn');
  keys.forEach(key => {
    key.classList.remove('correct', 'present', 'absent');
  });
}

/**
 * Démarre le timer
 */
function startTimer() {
  // Arrêter le timer existant s'il y en a un
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  // Mettre à jour l'affichage initial
  gameUI.updateTime(gameState.timeRemaining);

  // Démarrer un nouveau timer
  gameState.timerInterval = setInterval(() => {
    // Décrémenter le temps restant
    gameState.timeRemaining--;
    gameState.totalTime++;

    // Mettre à jour l'affichage
    gameUI.updateTime(gameState.timeRemaining);

    // Vérifier si le temps est écoulé
    if (gameState.timeRemaining <= 0) {
      endGame('timeout');
    }

    // Avertissement de temps faible
    if (gameState.timeRemaining === 10) {
      gameUI.showNotification('Plus que 10 secondes !', 'warning');
    }
  }, 1000);
}

/**
 * Gère l'entrée d'une lettre
 */
function handleKeyInput(key) {
  // Vérifier si le jeu est en cours
  if (gameState.gameStatus !== 'playing') return;

  // Vérifier si la tentative actuelle est complète
  const wordLength = gameState.currentWord.length;
  if (gameState.currentGuess.length >= wordLength) return;

  // Ajouter la lettre à la tentative actuelle
  gameState.currentGuess += key.toUpperCase();

  // Mettre à jour l'affichage
  updateGuessDisplay();
}

/**
 * Gère l'appui sur la touche Entrée
 */
function handleEnter() {
  // Vérifier si le jeu est en cours
  if (gameState.gameStatus !== 'playing') return;

  // Vérifier si la tentative est complète
  const wordLength = gameState.currentWord.length;
  if (gameState.currentGuess.length !== wordLength) {
    gameUI.showNotification('Mot incomplet !', 'warning');
    gameUI.shakeGrid();
    return;
  }

  // Vérifier si le mot est valide
  if (!isValidWord(gameState.currentGuess, gameState.difficulty)) {
    gameUI.showNotification('Mot non reconnu !', 'error');
    gameUI.shakeGrid();
    return;
  }

  // Ajouter la tentative à la liste
  gameState.guesses.push(gameState.currentGuess);

  // Vérifier la tentative
  checkGuess();

  // Réinitialiser la tentative actuelle
  gameState.currentGuess = '';
}

/**
 * Gère l'appui sur la touche Supprimer
 */
function handleDelete() {
  // Vérifier si le jeu est en cours
  if (gameState.gameStatus !== 'playing') return;

  // Vérifier si la tentative est vide
  if (gameState.currentGuess.length === 0) return;

  // Supprimer la dernière lettre
  gameState.currentGuess = gameState.currentGuess.slice(0, -1);

  // Mettre à jour l'affichage
  updateGuessDisplay();
}

/**
 * Met à jour l'affichage de la tentative actuelle
 */
function updateGuessDisplay() {
  const currentRow = gameState.guesses.length;
  const wordLength = gameState.currentWord.length;

  // Mettre à jour chaque cellule de la ligne actuelle
  for (let i = 0; i < wordLength; i++) {
    const letter = i < gameState.currentGuess.length ? gameState.currentGuess[i] : '';
    gameUI.updateCell(currentRow, i, letter, '');
  }
}

/**
 * Vérifie la tentative actuelle
 */
function checkGuess() {
  const currentRow = gameState.guesses.length - 1;
  const guess = gameState.guesses[currentRow];
  const word = gameState.currentWord;

  // Tableau pour suivre les lettres déjà vérifiées
  const checkedIndices = new Array(word.length).fill(false);

  // Premier passage : marquer les lettres correctes
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === word[i]) {
      gameUI.updateCell(currentRow, i, guess[i], 'correct');
      gameUI.updateKey(guess[i], 'correct');
      checkedIndices[i] = true;

      // Effet visuel pour une lettre correcte
      const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
      if (cell) {
        gameEffects.correctLetterEffect(cell);
      }
    }
  }

  // Deuxième passage : marquer les lettres présentes mais mal placées
  for (let i = 0; i < guess.length; i++) {
    if (checkedIndices[i]) continue;

    let found = false;

    // Vérifier si la lettre est présente ailleurs dans le mot
    for (let j = 0; j < word.length; j++) {
      if (!checkedIndices[j] && guess[i] === word[j]) {
        gameUI.updateCell(currentRow, i, guess[i], 'present');
        gameUI.updateKey(guess[i], 'present');
        checkedIndices[j] = true;
        found = true;

        // Effet visuel pour une lettre présente
        const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
        if (cell) {
          gameEffects.presentLetterEffect(cell);
        }

        break;
      }
    }

    // Si la lettre n'est pas présente
    if (!found) {
      gameUI.updateCell(currentRow, i, guess[i], 'absent');
      gameUI.updateKey(guess[i], 'absent');
    }
  }

  // Vérifier si le mot a été trouvé
  if (guess === word) {
    wordFound();
  } else if (gameState.guesses.length >= gameState.maxAttempts) {
    // Si le nombre maximum de tentatives est atteint
    endGame('failed');
  }
}

/**
 * Gère la découverte d'un mot
 */
function wordFound() {
  // Mettre à jour le statut du jeu
  gameState.gameStatus = 'won';

  // Mettre à jour les statistiques
  gameState.wordsFound++;

  // Calculer les points gagnés
  const basePoints = 100;
  const difficultyMultiplier = getDifficultyMultiplier(gameState.difficulty);
  const attemptBonus = (gameState.maxAttempts - gameState.guesses.length + 1) * 10;
  const timeBonus = Math.min(30, gameState.timeRemaining);
  const comboMultiplier = gameState.combo;

  const pointsEarned = Math.floor((basePoints + attemptBonus) * difficultyMultiplier * comboMultiplier);

  // Mettre à jour le score
  gameState.score += pointsEarned;

  // Augmenter le combo
  gameState.combo++;
  gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);

  // Ajouter du temps bonus
  const timeBonusAmount = Math.floor(10 * difficultyMultiplier);
  gameState.timeRemaining += timeBonusAmount;

  // Mettre à jour l'affichage
  updateDisplay();

  // Effet de victoire
  gameUI.showVictoryEffect();
  gameEffects.celebrationEffect();

  // Afficher la modale de mot trouvé
  const definition = getWordDefinition(gameState.currentWord);
  gameUI.showWordFoundModal(gameState.currentWord, definition, pointsEarned, timeBonusAmount);

  // Passer au niveau suivant
  gameState.level++;

  // Préparer le prochain mot après la fermeture de la modale
  setTimeout(() => {
    if (gameState.gameStatus === 'won') {
      startNewWord();
      gameState.gameStatus = 'playing';
    }
  }, 2000);
}

/**
 * Obtient le multiplicateur de difficulté
 */
function getDifficultyMultiplier(difficulty) {
  switch (difficulty) {
    case 'beginner':
      return 1;
    case 'intermediate':
      return 1.5;
    case 'advanced':
      return 2;
    case 'expert':
      return 3;
    case 'legendary':
      return 5;
    default:
      return 1;
  }
}

/**
 * Obtient la définition d'un mot (simulé)
 */
function getWordDefinition(word) {
  // Dans une version réelle, on pourrait utiliser une API de dictionnaire
  return `Un mot anglais de ${word.length} lettres.`;
}

/**
 * Termine la partie
 */
function endGame(reason) {
  // Arrêter le timer
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }

  // Mettre à jour le statut du jeu
  gameState.gameStatus = 'ended';

  // Calculer les récompenses
  const coinsEarned = Math.min(100, gameState.score / 10);
  const xpEarned = gameState.score;

  // Vérifier si c'est un nouveau record
  const isNewHighScore = gameState.score > gameState.highScore;
  if (isNewHighScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('eq_enigma_highscore', gameState.highScore.toString());
  }

  // Sauvegarder les statistiques
  saveGameStats();

  // Afficher la modale de fin de partie
  gameUI.showGameOverModal({
    score: gameState.score,
    wordsFound: gameState.wordsFound,
    maxCombo: gameState.maxCombo,
    totalTime: gameState.totalTime,
    coinsEarned,
    xpEarned,
    isNewHighScore
  });

  // Afficher un message en fonction de la raison
  if (reason === 'timeout') {
    gameUI.showNotification('Temps écoulé !', 'warning');
  } else if (reason === 'failed') {
    gameUI.showNotification(`Le mot était : ${gameState.currentWord}`, 'error');
  }
}

/**
 * Sauvegarde les statistiques de jeu
 */
function saveGameStats() {
  // Sauvegarder localement
  const stats = {
    lastPlayed: new Date().toISOString(),
    highScore: gameState.highScore,
    totalWordsFound: (parseInt(localStorage.getItem('eq_enigma_totalWords') || '0', 10) + gameState.wordsFound),
    gamesPlayed: (parseInt(localStorage.getItem('eq_enigma_gamesPlayed') || '0', 10) + 1)
  };

  localStorage.setItem('eq_enigma_stats', JSON.stringify(stats));
  localStorage.setItem('eq_enigma_totalWords', stats.totalWordsFound.toString());
  localStorage.setItem('eq_enigma_gamesPlayed', stats.gamesPlayed.toString());

  console.log('Statistiques sauvegardées localement');

  // Sauvegarder dans Firebase si disponible
  if (window.EnigmaScrollFirebase && typeof window.EnigmaScrollFirebase.saveScore === 'function') {
    const gameData = {
      difficulty: gameState.difficulty,
      wordsFound: gameState.wordsFound,
      maxCombo: gameState.maxCombo,
      totalTime: gameState.totalTime
    };

    window.EnigmaScrollFirebase.saveScore(gameState.score, gameData)
      .then(() => {
        console.log('Score sauvegardé dans Firebase');

        // Mettre à jour le classement
        if (window.EnigmaScrollLeaderboard && typeof window.EnigmaScrollLeaderboard.loadScores === 'function') {
          window.EnigmaScrollLeaderboard.loadScores('alltime');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la sauvegarde du score:', error);
      });
  } else {
    console.warn('EnigmaScrollFirebase non disponible, score non sauvegardé en ligne');

    // Sauvegarder localement via le leaderboard si disponible
    if (window.EnigmaScrollLeaderboard && typeof window.EnigmaScrollLeaderboard.saveScore === 'function') {
      const scoreData = {
        username: gameState.username || 'Anonyme',
        score: gameState.score,
        difficulty: gameState.difficulty,
        wordsFound: gameState.wordsFound,
        maxCombo: gameState.maxCombo,
        timestamp: new Date().toISOString()
      };

      window.EnigmaScrollLeaderboard.saveScore(scoreData);
    }
  }
}

/**
 * Utilise un power-up
 */
function usePowerUp(type) {
  // Vérifier si le jeu est en cours
  if (gameState.gameStatus !== 'playing') return;

  // Vérifier si le power-up est disponible
  if (gameState.powerUps[type] <= 0) {
    gameUI.showNotification(`Vous n'avez plus de power-up ${type} !`, 'warning');
    return;
  }

  // Utiliser le power-up
  switch (type) {
    case 'hint':
      useHintPowerUp();
      break;
    case 'time':
      useTimePowerUp();
      break;
    case 'skip':
      useSkipPowerUp();
      break;
  }

  // Décrémenter le compteur
  gameState.powerUps[type]--;

  // Mettre à jour l'affichage
  gameUI.updatePowerUps(gameState.powerUps);
}

/**
 * Utilise le power-up d'indice
 */
function useHintPowerUp() {
  const word = gameState.currentWord;
  const guess = gameState.currentGuess;
  const currentRow = gameState.guesses.length;

  // Trouver une lettre non révélée
  let availableIndices = [];

  for (let i = 0; i < word.length; i++) {
    // Si la position est déjà remplie dans la tentative actuelle, passer
    if (i < guess.length) continue;

    // Vérifier si cette lettre a déjà été révélée dans les tentatives précédentes
    let alreadyRevealed = false;

    for (let j = 0; j < gameState.guesses.length; j++) {
      const prevGuess = gameState.guesses[j];
      if (i < prevGuess.length && prevGuess[i] === word[i]) {
        alreadyRevealed = true;
        break;
      }
    }

    if (!alreadyRevealed) {
      availableIndices.push(i);
    }
  }

  // S'il n'y a pas de lettre disponible
  if (availableIndices.length === 0) {
    gameUI.showNotification('Aucun indice disponible !', 'warning');
    return;
  }

  // Choisir une lettre aléatoire parmi les disponibles
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  const revealedLetter = word[randomIndex];

  // Mettre à jour la tentative actuelle
  let newGuess = gameState.currentGuess;
  while (newGuess.length < randomIndex) {
    newGuess += ' ';
  }
  newGuess = newGuess.substring(0, randomIndex) + revealedLetter + newGuess.substring(randomIndex + 1);
  gameState.currentGuess = newGuess.trim();

  // Mettre à jour l'affichage
  updateGuessDisplay();

  // Marquer la cellule comme indice
  gameUI.updateCell(currentRow, randomIndex, revealedLetter, 'hint');

  gameUI.showNotification(`Indice : la lettre ${revealedLetter} est à la position ${randomIndex + 1}`, 'info');
}

/**
 * Utilise le power-up de temps
 */
function useTimePowerUp() {
  // Ajouter du temps
  gameState.timeRemaining += 30;

  // Mettre à jour l'affichage
  gameUI.updateTime(gameState.timeRemaining);

  gameUI.showNotification('30 secondes ajoutées !', 'success');
}

/**
 * Utilise le power-up de saut
 */
function useSkipPowerUp() {
  // Révéler le mot actuel
  gameUI.showNotification(`Le mot était : ${gameState.currentWord}`, 'info');

  // Passer au mot suivant
  startNewWord();

  gameUI.showNotification('Mot suivant !', 'success');
}

/**
 * Met à jour l'affichage du jeu
 */
function updateDisplay() {
  gameUI.updateLevel(gameState.level);
  gameUI.updateScore(gameState.score);
  gameUI.updateTime(gameState.timeRemaining);
  gameUI.updateCombo(gameState.combo);
  gameUI.updatePowerUps(gameState.powerUps);
}

/**
 * Vérifie s'il faut déclencher un événement aléatoire
 */
function checkForRandomEvent() {
  // Si un événement est déjà actif, ne pas en déclencher un nouveau
  if (gameState.eventActive) return;

  // Probabilité de déclencher un événement
  if (Math.random() < gameState.eventChance) {
    triggerRandomEvent();
  }
}

/**
 * Déclenche un événement aléatoire
 */
function triggerRandomEvent() {
  // Liste des événements possibles
  const events = [
    {
      name: 'combo_boost',
      description: 'Boost de combo ! Votre multiplicateur de combo est doublé pour le prochain mot.',
      accept: () => {
        gameState.combo *= 2;
        gameUI.updateCombo(gameState.combo);
        gameUI.showNotification('Combo doublé !', 'success');
      },
      decline: () => {
        gameUI.showNotification('Événement refusé', 'info');
      }
    },
    {
      name: 'time_challenge',
      description: 'Défi de temps ! Trouvez le mot en moins de 30 secondes pour gagner un bonus de 200 points.',
      accept: () => {
        // Réduire le temps
        const originalTime = gameState.timeRemaining;
        gameState.timeRemaining = Math.min(gameState.timeRemaining, 30);
        gameUI.updateTime(gameState.timeRemaining);

        // Ajouter un écouteur pour vérifier si le mot est trouvé dans le temps imparti
        const checkTimeChallenge = () => {
          if (gameState.gameStatus === 'won') {
            // Le joueur a réussi le défi
            gameState.score += 200;
            gameUI.updateScore(gameState.score);
            gameUI.showNotification('Défi réussi ! +200 points', 'success');
          } else {
            // Le joueur a échoué
            gameUI.showNotification('Défi échoué !', 'error');

            // Restaurer le temps original moins le temps écoulé
            const timeElapsed = originalTime - gameState.timeRemaining;
            gameState.timeRemaining = Math.max(0, originalTime - timeElapsed);
            gameUI.updateTime(gameState.timeRemaining);
          }

          // Désactiver l'événement
          gameState.eventActive = false;
        };

        // Vérifier après 30 secondes ou si le statut du jeu change
        const interval = setInterval(() => {
          if (gameState.gameStatus !== 'playing' || gameState.timeRemaining <= 0) {
            clearInterval(interval);
            checkTimeChallenge();
          }
        }, 1000);
      },
      decline: () => {
        gameUI.showNotification('Défi refusé', 'info');
      }
    },
    {
      name: 'bonus_powerup',
      description: 'Bonus de power-up ! Acceptez pour recevoir un power-up aléatoire supplémentaire.',
      accept: () => {
        // Choisir un power-up aléatoire
        const powerUps = ['hint', 'time', 'skip'];
        const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];

        // Ajouter le power-up
        gameState.powerUps[randomPowerUp]++;
        gameUI.updatePowerUps(gameState.powerUps);

        gameUI.showNotification(`Power-up ${randomPowerUp} obtenu !`, 'success');
      },
      decline: () => {
        gameUI.showNotification('Bonus refusé', 'info');
      }
    }
  ];

  // Choisir un événement aléatoire
  const randomEvent = events[Math.floor(Math.random() * events.length)];

  // Marquer l'événement comme actif
  gameState.eventActive = true;

  // Afficher la modale d'événement
  gameUI.showEventModal(randomEvent, randomEvent.accept, randomEvent.decline);
}

// Initialiser le jeu lorsque la page est chargée
document.addEventListener('DOMContentLoaded', initGame);
