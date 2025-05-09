/**
 * Enigma Scroll - Jeu de mots mystérieux
 * Version améliorée pour English Quest Reborn
 */

// État du jeu
const gameState = {
  // Paramètres du jeu
  difficulty: 'intermediate',
  maxAttempts: 6,
  timeLimit: 120, // Augmenté de 60 à 120 secondes

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
  timeRemaining: 120, // Augmenté de 60 à 120 secondes
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
  GameUI.init();

  // Configurer les callbacks de l'interface
  setupUICallbacks();

  // Initialiser les effets visuels
  GameEffects.init();

  // Charger les données utilisateur
  loadUserData();

  // Initialiser le leaderboard
  setTimeout(() => {
    if (window.EnigmaScrollLeaderboard && typeof window.EnigmaScrollLeaderboard.init === 'function') {
      window.EnigmaScrollLeaderboard.init('enigma-scroll-leaderboard');
      console.log('Leaderboard initialisé depuis enigma-scroll.js');
    } else {
      console.warn('Leaderboard non disponible');
    }
  }, 1000);

  // Afficher la modale des règles au chargement
  setTimeout(() => {
    GameUI.showRulesModal();
  }, 500);
}

/**
 * Configure les callbacks de l'interface utilisateur
 */
function setupUICallbacks() {
  // Callback pour le démarrage du jeu
  GameUI.onStartGame = (difficulty) => {
    startGame(difficulty);
  };

  // Callback pour le changement de difficulté
  GameUI.onDifficultyChange = (difficulty) => {
    gameState.difficulty = difficulty;
    console.log(`Difficulté changée: ${difficulty}`);
  };

  // Callback pour l'appui sur une touche
  GameUI.onKeyPress = (key) => {
    handleKeyInput(key);
  };

  // Callback pour l'appui sur Entrée
  GameUI.onEnter = () => {
    handleEnter();
  };

  // Callback pour l'appui sur Supprimer
  GameUI.onDelete = () => {
    handleDelete();
  };

  // Callback pour l'utilisation d'un power-up
  GameUI.onPowerUp = (type) => {
    usePowerUp(type);
  };
}

/**
 * Charge les données utilisateur
 */
function loadUserData() {
  // Essayer de récupérer le nom d'utilisateur depuis toutes les sources possibles
  let username = null;

  // 1. Essayer de récupérer depuis localStorage simple (priorité la plus élevée)
  const storedUsername = localStorage.getItem('eq_username');
  if (storedUsername) {
    username = storedUsername;
    console.log(`Utilisateur chargé depuis eq_username: ${username}`);
  }

  // 2. Essayer de récupérer depuis l'objet utilisateur English Quest
  if (!username) {
    const userJson = localStorage.getItem('english_quest_current_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.username) {
          username = user.username;
          console.log(`Utilisateur chargé depuis english_quest_current_user: ${username}`);
        }
      } catch (error) {
        console.warn("Erreur lors de la récupération de l'utilisateur depuis english_quest_current_user:", error);
      }
    }
  }

  // 3. Essayer de récupérer depuis Firebase
  if (!username && window.firebase && window.firebase.auth) {
    const user = window.firebase.auth().currentUser;
    if (user) {
      username = user.displayName || user.email || null;
      if (username) {
        console.log(`Utilisateur chargé depuis Firebase: ${username}`);
      }
    }
  }

  // Mettre à jour le nom d'utilisateur dans gameState
  if (username) {
    gameState.username = username;

    // Sauvegarder le nom d'utilisateur dans localStorage pour les futures utilisations
    localStorage.setItem('eq_username', username);
  } else {
    console.warn("Aucun nom d'utilisateur trouvé, utilisation du nom par défaut:", gameState.username);
  }

  // Essayer de récupérer l'ID utilisateur depuis le stockage local
  const storedUserId = localStorage.getItem('eq_userId');
  if (storedUserId) {
    gameState.userId = storedUserId;
  } else if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
    gameState.userId = window.firebase.auth().currentUser.uid;
    localStorage.setItem('eq_userId', gameState.userId);
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

  console.log(`Nom d'utilisateur final: ${gameState.username}`);
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
  GameUI.showGameArea();

  // Créer la grille en fonction de la difficulté
  const wordLength = getWordLengthForDifficulty(gameState.difficulty);
  GameUI.createGrid(gameState.maxAttempts, wordLength);

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
  GameUI.createGrid(gameState.maxAttempts, wordLength);

  // Réinitialiser les états des touches du clavier
  resetKeyboardState();

  // Donner automatiquement la première lettre du mot
  const firstLetter = gameState.currentWord.charAt(0);
  gameState.currentGuess = firstLetter;

  // Mettre à jour l'affichage pour montrer la première lettre
  setTimeout(() => {
    updateGuessDisplay();

    // Marquer la cellule comme indice de façon permanente
    const cell = document.querySelector(`[data-row="0"][data-col="0"]`);
    if (cell) {
      cell.classList.add('hint');
      cell.setAttribute('data-hint', 'true');
      GameUI.updateCell(0, 0, firstLetter, 'hint');
    }

    // Mettre à jour l'état de la touche du clavier
    GameUI.updateKey(firstLetter, 'hint');

    // Afficher une notification
    GameUI.showNotification(`Indice : le mot commence par la lettre ${firstLetter}`, 'info');
  }, 500);

  // Vérifier s'il faut déclencher un événement aléatoire
  checkForRandomEvent();
}

/**
 * Obtient la longueur du mot en fonction de la difficulté
 */
function getWordLengthForDifficulty(difficulty) {
  // Utiliser directement l'implémentation locale pour éviter les boucles infinies
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
  GameUI.updateTime(gameState.timeRemaining);

  // Démarrer un nouveau timer
  gameState.timerInterval = setInterval(() => {
    // Décrémenter le temps restant
    gameState.timeRemaining--;
    gameState.totalTime++;

    // Mettre à jour l'affichage
    GameUI.updateTime(gameState.timeRemaining);

    // Vérifier si le temps est écoulé
    if (gameState.timeRemaining <= 0) {
      endGame('timeout');
    }

    // Avertissement de temps faible
    if (gameState.timeRemaining === 10) {
      GameUI.showNotification('Plus que 10 secondes !', 'warning');
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
async function handleEnter() {
  // Vérifier si le jeu est en cours
  if (gameState.gameStatus !== 'playing') return;

  // Vérifier si la tentative est complète
  const wordLength = gameState.currentWord.length;
  if (gameState.currentGuess.length !== wordLength) {
    GameUI.showNotification('Mot incomplet !', 'warning');
    GameUI.shakeGrid();
    return;
  }

  // Afficher un indicateur de chargement
  GameUI.showNotification('Vérification du mot...', 'info');

  try {
    // Vérifier si le mot est valide (appel asynchrone)
    const isValid = await isValidWord(gameState.currentGuess, gameState.difficulty);

    if (!isValid) {
      GameUI.showNotification('Mot non reconnu !', 'error');
      GameUI.shakeGrid();
      return;
    }

    // Ajouter la tentative à la liste
    gameState.guesses.push(gameState.currentGuess);

    // Vérifier la tentative
    checkGuess();

    // Réinitialiser la tentative actuelle
    gameState.currentGuess = '';
  } catch (error) {
    console.error("Erreur lors de la vérification du mot:", error);
    GameUI.showNotification('Erreur lors de la vérification du mot. Réessayez.', 'error');
    GameUI.shakeGrid();
  }
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

  // Stocker les indices explicites qui ont été révélés par le power-up d'indice
  // Cette information n'est pas stockée dans l'état du jeu, donc nous devons la recréer
  // en vérifiant les cellules qui ont l'attribut data-hint="true"
  const revealedHints = [];
  for (let i = 0; i < wordLength; i++) {
    const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
    if (cell && cell.getAttribute('data-hint') === 'true') {
      revealedHints.push(i);
    }
  }

  // Mettre à jour chaque cellule de la ligne actuelle
  for (let i = 0; i < wordLength; i++) {
    const letter = i < gameState.currentGuess.length ? gameState.currentGuess[i] : '';

    // Vérifier si cette position a été explicitement révélée comme un indice
    const isRevealedHint = revealedHints.includes(i);

    // Si c'est un indice révélé, conserver le style d'indice, sinon utiliser un style normal
    if (isRevealedHint) {
      GameUI.updateCell(currentRow, i, letter, 'hint');
    } else {
      GameUI.updateCell(currentRow, i, letter, '');
    }
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
      GameUI.updateCell(currentRow, i, guess[i], 'correct');
      GameUI.updateKey(guess[i], 'correct');
      checkedIndices[i] = true;

      // Effet visuel pour une lettre correcte
      const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
      if (cell) {
        GameEffects.correctLetterEffect(cell);
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
        GameUI.updateCell(currentRow, i, guess[i], 'present');
        GameUI.updateKey(guess[i], 'present');
        checkedIndices[j] = true;
        found = true;

        // Effet visuel pour une lettre présente
        const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
        if (cell) {
          GameEffects.presentLetterEffect(cell);
        }

        break;
      }
    }

    // Si la lettre n'est pas présente
    if (!found) {
      GameUI.updateCell(currentRow, i, guess[i], 'absent');
      GameUI.updateKey(guess[i], 'absent');

      // Effet visuel pour une lettre absente
      const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
      if (cell) {
        // Ajouter une classe pour s'assurer que la lettre est bien marquée comme absente
        cell.classList.add('absent');
      }
    }
  }

  // S'assurer que toutes les cellules ont été mises à jour
  for (let i = 0; i < word.length; i++) {
    const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
    if (cell && !cell.classList.contains('correct') && !cell.classList.contains('present') && !cell.classList.contains('absent')) {
      // Si la cellule n'a pas de classe de statut, la marquer comme absente
      GameUI.updateCell(currentRow, i, guess[i] || '', 'absent');
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

  // Ajouter du temps bonus (augmenté de 10 à 15 secondes de base)
  const timeBonusAmount = Math.floor(15 * difficultyMultiplier);
  gameState.timeRemaining += timeBonusAmount;

  // Mettre à jour l'affichage
  updateDisplay();

  // Effet de victoire
  GameUI.showVictoryEffect();
  GameEffects.celebrationEffect();

  // Afficher la modale de mot trouvé
  const definition = getWordDefinition(gameState.currentWord);
  GameUI.showWordFoundModal(gameState.currentWord, definition, pointsEarned, timeBonusAmount);

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
}

/**
 * Utilise un power-up
 */
function usePowerUp(type) {
  // Vérifier si le jeu est en cours
  if (gameState.gameStatus !== 'playing') return;

  // Vérifier si le power-up est disponible
  if (gameState.powerUps[type] <= 0) {
    GameUI.showNotification(`Vous n'avez plus de power-up ${type} !`, 'warning');
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
  GameUI.updatePowerUps(gameState.powerUps);
}

/**
 * Utilise le power-up d'indice
 */
function useHintPowerUp() {
  const word = gameState.currentWord;
  const currentRow = gameState.guesses.length;

  // Récupérer la tentative actuelle sous forme de tableau
  let currentGuessArray = [];
  if (gameState.currentGuess) {
    currentGuessArray = gameState.currentGuess.split('');
  }

  // Compléter le tableau avec des espaces vides si nécessaire
  while (currentGuessArray.length < word.length) {
    currentGuessArray.push('');
  }

  // Trouver les indices déjà révélés
  const revealedIndices = [];
  for (let i = 0; i < word.length; i++) {
    const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
    if (cell && cell.getAttribute('data-hint') === 'true') {
      revealedIndices.push(i);
    }
  }

  console.log("Indices déjà révélés:", revealedIndices);

  // Trouver les indices disponibles (non révélés et différents de la première lettre)
  let availableIndices = [];
  for (let i = 0; i < word.length; i++) {
    // Ignorer la première lettre (toujours révélée au début)
    if (i === 0) {
      console.log("Ignoré l'indice 0 (première lettre)");
      continue;
    }

    // Ignorer les indices déjà révélés
    if (revealedIndices.includes(i)) {
      console.log(`Ignoré l'indice ${i} (déjà révélé)`);
      continue;
    }

    // Vérifier si cette lettre a déjà été révélée dans les tentatives précédentes
    let alreadyRevealed = false;
    for (let j = 0; j < gameState.guesses.length; j++) {
      const prevGuess = gameState.guesses[j];
      if (i < prevGuess.length && prevGuess[i] === word[i]) {
        alreadyRevealed = true;
        console.log(`Ignoré l'indice ${i} (déjà révélé dans une tentative précédente)`);
        break;
      }
    }

    // Vérifier si cette position a déjà une lettre correcte dans la tentative actuelle
    if (i < currentGuessArray.length && currentGuessArray[i] === word[i]) {
      alreadyRevealed = true;
      console.log(`Ignoré l'indice ${i} (déjà correct dans la tentative actuelle)`);
    }

    if (!alreadyRevealed) {
      availableIndices.push(i);
      console.log(`Ajouté l'indice ${i} aux indices disponibles`);
    }
  }

  console.log("Indices disponibles:", availableIndices);

  // S'il n'y a pas d'indice disponible
  if (availableIndices.length === 0) {
    GameUI.showNotification('Aucun indice disponible !', 'warning');
    return;
  }

  // Choisir un indice aléatoire parmi les disponibles
  let randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  let revealedLetter = word[randomIndex];

  console.log(`Indice choisi: lettre ${revealedLetter} à la position ${randomIndex + 1}`);

  // Vérifier que l'indice n'est pas la première lettre
  if (randomIndex === 0) {
    console.error("ERREUR: L'indice choisi est la première lettre malgré les vérifications!");
    // Si par erreur on a choisi la première lettre, essayer de choisir un autre indice
    const otherIndices = availableIndices.filter(idx => idx !== 0);
    if (otherIndices.length > 0) {
      const newRandomIndex = otherIndices[Math.floor(Math.random() * otherIndices.length)];
      console.log(`Correction: nouvel indice choisi à la position ${newRandomIndex + 1}`);
      randomIndex = newRandomIndex;
      revealedLetter = word[randomIndex];
    } else {
      console.log("Pas d'autre indice disponible que la première lettre.");
      GameUI.showNotification('Aucun indice disponible !', 'warning');
      return;
    }
  }

  // Placer la lettre révélée à la bonne position dans la tentative actuelle
  currentGuessArray[randomIndex] = revealedLetter;

  // Convertir le tableau en chaîne
  gameState.currentGuess = currentGuessArray.join('').trim();

  console.log(`Nouvelle tentative après indice: "${gameState.currentGuess}"`);

  // Mettre à jour l'affichage de toutes les cellules
  updateGuessDisplay();

  // Marquer la cellule comme indice de façon permanente
  const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${randomIndex}"]`);
  if (cell) {
    cell.classList.add('hint');
    cell.setAttribute('data-hint', 'true');
    GameUI.updateCell(currentRow, randomIndex, revealedLetter, 'hint');
  }

  // Mettre à jour l'état de la touche du clavier
  GameUI.updateKey(revealedLetter, 'hint');

  GameUI.showNotification(`Indice : la lettre ${revealedLetter} est à la position ${randomIndex + 1}`, 'info');
}

/**
 * Utilise le power-up de temps
 */
function useTimePowerUp() {
  // Ajouter du temps (augmenté de 30 à 45 secondes)
  gameState.timeRemaining += 45;

  // Mettre à jour l'affichage
  GameUI.updateTime(gameState.timeRemaining);

  GameUI.showNotification('45 secondes ajoutées !', 'success');
}

/**
 * Utilise le power-up de saut
 */
function useSkipPowerUp() {
  // Révéler le mot actuel
  GameUI.showNotification(`Le mot était : ${gameState.currentWord}`, 'info');

  // Passer au mot suivant
  startNewWord();

  GameUI.showNotification('Mot suivant !', 'success');
}

/**
 * Met à jour l'affichage du jeu
 */
function updateDisplay() {
  GameUI.updateLevel(gameState.level);
  GameUI.updateScore(gameState.score);
  GameUI.updateTime(gameState.timeRemaining);
  GameUI.updateCombo(gameState.combo);
  GameUI.updatePowerUps(gameState.powerUps);
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
        GameUI.updateCombo(gameState.combo);
        GameUI.showNotification('Combo doublé !', 'success');
      },
      decline: () => {
        GameUI.showNotification('Événement refusé', 'info');
      }
    },
    {
      name: 'time_challenge',
      description: 'Défi de temps ! Trouvez le mot en moins de 30 secondes pour gagner un bonus de 200 points.',
      accept: () => {
        // Réduire le temps
        const originalTime = gameState.timeRemaining;
        gameState.timeRemaining = Math.min(gameState.timeRemaining, 30);
        GameUI.updateTime(gameState.timeRemaining);

        // Ajouter un écouteur pour vérifier si le mot est trouvé dans le temps imparti
        const checkTimeChallenge = () => {
          if (gameState.gameStatus === 'won') {
            // Le joueur a réussi le défi
            gameState.score += 200;
            GameUI.updateScore(gameState.score);
            GameUI.showNotification('Défi réussi ! +200 points', 'success');
          } else {
            // Le joueur a échoué
            GameUI.showNotification('Défi échoué !', 'error');

            // Restaurer le temps original moins le temps écoulé
            const timeElapsed = originalTime - gameState.timeRemaining;
            gameState.timeRemaining = Math.max(0, originalTime - timeElapsed);
            GameUI.updateTime(gameState.timeRemaining);
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
        GameUI.showNotification('Défi refusé', 'info');
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
        GameUI.updatePowerUps(gameState.powerUps);

        GameUI.showNotification(`Power-up ${randomPowerUp} obtenu !`, 'success');
      },
      decline: () => {
        GameUI.showNotification('Bonus refusé', 'info');
      }
    }
  ];

  // Choisir un événement aléatoire
  const randomEvent = events[Math.floor(Math.random() * events.length)];

  // Marquer l'événement comme actif
  gameState.eventActive = true;

  // Afficher la modale d'événement
  GameUI.showEventModal(randomEvent, randomEvent.accept, randomEvent.decline);
}

/**
 * Sauvegarde le score du joueur
 */
function savePlayerScore() {
  console.log('Sauvegarde du score du joueur');

  // Vérifier si le score est valide
  if (!gameState.score) {
    console.warn('Score invalide, sauvegarde annulée');
    return;
  }

  // Préparer les données du score
  const scoreData = {
    score: gameState.score,
    wordsFound: gameState.wordsFound,
    maxCombo: gameState.maxCombo,
    difficulty: gameState.difficulty,
    totalTime: gameState.totalTime
  };

  // Sauvegarder localement d'abord
  try {
    // Préparer les données du score
    const scoreData = {
      username: gameState.username,
      playerName: gameState.username, // Pour compatibilité avec le nouveau format
      score: gameState.score,
      wordsFound: gameState.wordsFound,
      maxCombo: gameState.maxCombo,
      difficulty: gameState.difficulty,
      timestamp: new Date().toISOString(),
      offline: true,
      syncStatus: 'pending',
      gameId: 'enigma-scroll' // Identifiant du jeu pour le nouveau format
    };

    // 1. Sauvegarder dans le format de l'ancienne version
    const oldLocalScores = JSON.parse(localStorage.getItem('enigma_scroll_local_scores')) || [];
    oldLocalScores.push(scoreData);
    oldLocalScores.sort((a, b) => b.score - a.score);
    const limitedOldScores = oldLocalScores.slice(0, 20);
    localStorage.setItem('enigma_scroll_local_scores', JSON.stringify(limitedOldScores));

    // 2. Sauvegarder dans le format spécifique à Enigma Scroll
    const enigmaScores = JSON.parse(localStorage.getItem('enigma_scroll_scores')) || [];
    enigmaScores.push(scoreData);
    enigmaScores.sort((a, b) => b.score - a.score);
    const limitedEnigmaScores = enigmaScores.slice(0, 20);
    localStorage.setItem('enigma_scroll_scores', JSON.stringify(limitedEnigmaScores));

    // 3. Sauvegarder dans le nouveau format commun
    const newLocalScores = JSON.parse(localStorage.getItem('localScores')) || [];
    newLocalScores.push(scoreData);
    newLocalScores.sort((a, b) => b.score - a.score);
    const limitedNewScores = newLocalScores.slice(0, 50); // Plus de scores dans le format commun
    localStorage.setItem('localScores', JSON.stringify(limitedNewScores));

    console.log('Score sauvegardé localement dans tous les formats');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde locale du score:', error);
  }

  // Sauvegarder en ligne si possible
  if (window.EnigmaScrollFirebase && window.EnigmaScrollFirebase.isAvailable) {
    // Préparer les données du score pour Firebase
    const firebaseScoreData = {
      username: gameState.username,
      score: gameState.score,
      wordsFound: gameState.wordsFound,
      maxCombo: gameState.maxCombo,
      difficulty: gameState.difficulty,
      totalTime: gameState.totalTime
    };

    window.EnigmaScrollFirebase.saveScore(gameState.score, firebaseScoreData)
      .then(() => {
        console.log('Score sauvegardé en ligne avec succès');

        // Rafraîchir le leaderboard
        if (window.EnigmaScrollLeaderboard && typeof window.EnigmaScrollLeaderboard.loadScores === 'function') {
          window.EnigmaScrollLeaderboard.loadScores();
        }
      })
      .catch(error => {
        console.error('Erreur lors de la sauvegarde en ligne du score:', error);
      });
  } else {
    console.warn('Module Firebase pour Enigma Scroll non disponible, score sauvegardé localement uniquement');
  }
}

/**
 * Termine le jeu
 * @param {string} reason - Raison de la fin du jeu ('timeout', 'failed', 'quit')
 */
function endGame(reason) {
  // Arrêter le timer
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }

  // Mettre à jour le statut du jeu
  gameState.gameStatus = 'over';

  // Sauvegarder les statistiques
  saveGameStats();

  // Sauvegarder le score
  savePlayerScore();

  // Calculer les récompenses
  const coinsEarned = Math.min(100, gameState.score / 10);
  const xpEarned = gameState.score;

  // Vérifier si c'est un nouveau record
  const isNewHighScore = gameState.score > gameState.highScore;
  if (isNewHighScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('eq_enigma_highscore', gameState.highScore.toString());
    console.log(`Nouveau meilleur score: ${gameState.highScore}`);
  }

  // Afficher la modale de fin de jeu
  GameUI.showGameOverModal({
    score: gameState.score,
    wordsFound: gameState.wordsFound,
    maxCombo: gameState.maxCombo,
    totalTime: gameState.totalTime,
    coinsEarned,
    xpEarned,
    isNewHighScore,
    reason: reason,
    lastWord: gameState.currentWord
  });

  // Afficher un message en fonction de la raison
  if (reason === 'timeout') {
    GameUI.showNotification('Temps écoulé !', 'warning');
  } else if (reason === 'failed') {
    GameUI.showNotification(`Le mot était : ${gameState.currentWord}`, 'error');
  }

  // Rafraîchir le leaderboard
  if (window.EnigmaScrollLeaderboard && typeof window.EnigmaScrollLeaderboard.loadScores === 'function') {
    setTimeout(() => {
      window.EnigmaScrollLeaderboard.loadScores();
    }, 1000);
  }
}

// Initialiser le jeu lorsque la page est chargée
document.addEventListener('DOMContentLoaded', function() {
  initGame();
});
