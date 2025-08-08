/**
 * Enigma Scroll - Jeu de mots style Wordle
 * Version corrigee sans caracteres corrompus
 */

// Configuration du jeu
const DIFFICULTIES = {
  4: { wordLength: 4, maxAttempts: 5 },
  5: { wordLength: 5, maxAttempts: 6 },
  6: { wordLength: 6, maxAttempts: 7 }
};

// 🎯 SYSTÈME DE GÉNÉRATION INTELLIGENT DE MOTS ULTRA-DIVERSIFIÉ
class IntelligentWordGenerator {
  constructor() {
    this.usedWords = new Set();
    this.recentWords = new Map(); // Par longueur de mot
    this.maxRecentWords = 50; // Éviter les répétitions récentes
    this.sessionWords = new Set(); // Mots utilisés dans cette session
    this.ready = false;
    this.lastWordsByLength = new Map();
    
    // Initialiser les pools de mots récents
    for (let length = 4; length <= 6; length++) {
      this.recentWords.set(length, []);
      this.lastWordsByLength.set(length, new Set());
    }
    
    this.initializeWordGenerator();
  }
  
  async initializeWordGenerator() {
    console.log('🎯 Initialisation du générateur de mots ultra-diversifié...');
    
    // Attendre que le système de validation soit chargé
    let attempts = 0;
    while (!window.COMPREHENSIVE_ENGLISH_WORDS && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (window.COMPREHENSIVE_ENGLISH_WORDS) {
      this.ready = true;
      const totalWords = Object.values(window.COMPREHENSIVE_ENGLISH_WORDS).reduce((a, b) => a + b.length, 0);
      console.log(`✅ Générateur prêt avec ${totalWords} mots disponibles`);
      
      // Afficher le nombre de mots par longueur
      for (let length = 4; length <= 6; length++) {
        const count = window.COMPREHENSIVE_ENGLISH_WORDS[length]?.length || 0;
        console.log(`📊 Mots de ${length} lettres: ${count}`);
      }
    } else {
      console.warn('⚠️ Base de mots complète non disponible, utilisation du fallback');
      this.setupFallbackWords();
    }
  }
  
  setupFallbackWords() {
    // Base de mots étendue de secours
    this.fallbackWords = {
      4: [
        "ABLE", "ACID", "AGED", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALL", "BAND", "BANK", "BASE", "BATH", "BEAR", "BEAT", "BEEN", "BEER", "BELL", "BELT",
        "BEST", "BIKE", "BILL", "BIRD", "BITE", "BLOW", "BLUE", "BOAT", "BODY", "BONE", "BOOK", "BOOT", "BORN", "BOTH", "BOWL", "BOYS", "BULK", "BURN", "BUSY", "BYTE",
        "CAFE", "CAGE", "CAKE", "CALL", "CALM", "CAME", "CAMP", "CARD", "CARE", "CARS", "CASE", "CASH", "CAST", "CATS", "CAVE", "CELL", "CHAT", "CHIP", "CITY", "CLAD",
        "CLAY", "CLIP", "CLUB", "COAL", "COAT", "CODE", "COIN", "COLD", "COME", "COOK", "COOL", "COPY", "CORD", "CORN", "COST", "COZY", "CREW", "CROP", "CROW", "CUBE",
        "CURE", "CUTE", "CUTS", "CYAN", "DARK", "DATA", "DATE", "DAWN", "DAYS", "DEAD", "DEAL", "DEAR", "DEBT", "DECK", "DEEP", "DEER", "DEMO", "DESK", "DIAL", "DICE",
        "DIED", "DIET", "DIME", "DIRT", "DISH", "DOCK", "DOES", "DOGS", "DONE", "DOOR", "DOTS", "DOWN", "DRAW", "DREW", "DROP", "DRUG", "DRUM", "DUCK", "DUDE", "DULL",
        "DUMP", "DUST", "DUTY", "EACH", "EARL", "EARN", "EARS", "EAST", "EASY", "EATS", "ECHO", "EDGE", "EDIT", "EGGS", "ELSE", "EMIT", "ENDS", "EPIC", "EVEN", "EVER",
        "EVIL", "EXAM", "EXIT", "EYES", "FACE", "FACT", "FAIL", "FAIR", "FALL", "FAME", "FANS", "FARM", "FAST", "FATE", "FEAR", "FEED", "FEEL", "FEET", "FELL", "FELT"
      ],
      5: [
        "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "ALBUM", "ALLOW", "ALONE", "ALONG", "ALTER",
        "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARGUE", "ARISE", "ARMED", "ASIDE", "ASSET", "AVOID", "AWAKE", "AWARD", "AWARE", "BADLY", "BASIC",
        "BEACH", "BEGAN", "BEGIN", "BEING", "BENCH", "BIRTH", "BLACK", "BLAME", "BLANK", "BLIND", "BLOCK", "BLOOD", "BLOWN", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN",
        "BRAND", "BRAVE", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUNCH", "BURST", "BUYER", "CABLE", "CACHE", "CALIF",
        "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHAOS", "CHARM", "CHART", "CHASE", "CHEAP", "CHECK", "CHESS", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOSE", "CIVIL",
        "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLIMB", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH",
        "CRAZY", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CURVE", "CYCLE", "DAILY", "DANCE", "DATED", "DEALT", "DEATH", "DEBUT", "DELAY", "DEPTH", "DOING",
        "DONOR", "DOUBT", "DOZEN", "DRAFT", "DRAMA", "DRANK", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE"
      ],
      6: [
        "ACCEPT", "ACCESS", "ACCORD", "ACROSS", "ACTION", "ACTIVE", "ACTUAL", "ADVICE", "ADVISE", "AFFAIR", "AFFECT", "AFFORD", "AFRAID", "AFRICA", "AGENCY", "AGENDA",
        "AGREED", "AHEAD", "AIRLINE", "AIRPORT", "ALARM", "ALBUM", "ALERT", "ALIEN", "ALIGN", "ALIKE", "ALIVE", "ALLOW", "ALMOST", "ALONE", "ALONG", "ALTER", "ALWAYS",
        "AMAZED", "AMOUNT", "AMUSED", "ANCHOR", "ANIMAL", "ANNUAL", "ANSWER", "ANYONE", "ANYWAY", "APPEAR", "ARCADE", "ARCHER", "ARGUE", "ARISEN", "AROUND", "ARREST",
        "ARRIVE", "ARTIST", "ASPECT", "ASSERT", "ASSESS", "ASSIST", "ASSUME", "ASSURE", "ATTACH", "ATTACK", "ATTEND", "AUGUST", "AUTHOR", "AUTUMN", "AVENUE", "BACKED",
        "BACKUP", "BADGER", "BARELY", "BARREL", "BATTLE", "BEACON", "BEARER", "BEATEN", "BEAUTY", "BECAME", "BECOME", "BEETLE", "BEFORE", "BEHALF", "BEHAVE", "BEHIND",
        "BELIEF", "BELONG", "BELOVED", "BERLIN", "BESIDE", "BETTER", "BEYOND", "BINARY", "BISHOP", "BITTER", "BLAMED", "BLANKS", "BLAZER", "BLENDS", "BLOCKS", "BLONDE"
      ]
    };
    this.ready = true;
    console.log('✅ Générateur de mots fallback prêt');
  }
  
  getWordList(length) {
    if (window.COMPREHENSIVE_ENGLISH_WORDS && window.COMPREHENSIVE_ENGLISH_WORDS[length]) {
      return window.COMPREHENSIVE_ENGLISH_WORDS[length];
    }
    return this.fallbackWords[length] || [];
  }
  
  async generateRandomWord(length) {
    if (!this.ready) {
      console.log('⏳ Générateur pas encore prêt, attente...');
      await this.initializeWordGenerator();
    }
    
    const wordList = this.getWordList(length);
    if (!wordList || wordList.length === 0) {
      console.warn(`⚠️ Aucun mot disponible pour la longueur ${length}`);
      return "WORLD"; // Fallback de sécurité
    }
    
    const recentForLength = this.recentWords.get(length) || [];
    const lastWordsForLength = this.lastWordsByLength.get(length) || new Set();
    
    // Filtrer les mots déjà utilisés récemment
    let availableWords = wordList.filter(word => 
      !recentForLength.includes(word) && 
      !lastWordsForLength.has(word) &&
      !this.sessionWords.has(word)
    );
    
    // Si trop peu de mots disponibles, réinitialiser partiellement
    if (availableWords.length < 10) {
      console.log(`🔄 Réinitialisation partielle des mots de ${length} lettres`);
      recentForLength.splice(0, Math.floor(recentForLength.length / 2));
      lastWordsForLength.clear();
      
      availableWords = wordList.filter(word => 
        !recentForLength.includes(word) && 
        !this.sessionWords.has(word)
      );
    }
    
    // Si encore trop peu, utiliser tous les mots
    if (availableWords.length < 5) {
      console.log(`🆘 Utilisation de tous les mots de ${length} lettres`);
      availableWords = wordList;
      recentForLength.length = 0;
      lastWordsForLength.clear();
    }
    
    // Sélectionner un mot aléatoire
    const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Mettre à jour les listes de suivi
    recentForLength.push(selectedWord);
    if (recentForLength.length > this.maxRecentWords) {
      recentForLength.shift();
    }
    
    lastWordsForLength.add(selectedWord);
    this.sessionWords.add(selectedWord);
    
    console.log(`🎯 Mot généré: ${selectedWord} (${availableWords.length} mots disponibles)`);
    return selectedWord;
  }
  
  resetSession() {
    this.sessionWords.clear();
    console.log('🔄 Session de mots réinitialisée');
  }
  
  getStats() {
    const stats = {};
    for (let length = 4; length <= 6; length++) {
      const totalWords = this.getWordList(length).length;
      const recentCount = (this.recentWords.get(length) || []).length;
      const sessionCount = Array.from(this.sessionWords).filter(w => w.length === length).length;
      
      stats[length] = {
        total: totalWords,
        recent: recentCount,
        session: sessionCount,
        available: totalWords - recentCount - sessionCount
      };
    }
    return stats;
  }
}

// Initialiser le générateur intelligent
const wordGenerator = new IntelligentWordGenerator();

// État du jeu
let gameState = {
  selectedDifficulty: null,
  wordLength: 5,
  maxAttempts: 6,
  currentWord: '',
  currentRow: 0,
  currentCol: 0,
  gameActive: false,
  score: 0,
  combo: 1,
  wordsFound: 0,
  timeLeft: 90,
  powerUps: {
    hint: 3,
    time: 2,
    skip: 1
  },
  keyboardState: {},
  validatingWord: false,
  sessionStarted: false,
  bestCombo: 1
};

let gameTimer = null;

// Initialisation du système de scores
window.enigmaScrollGame = {
  init: function() {
    console.log('Système de scores Enigma Scroll initialisé');
  },
  saveScore: function(score, user, wordsFound, difficulty) {
    console.log(`Score sauvegardé: ${score} points, ${wordsFound} mots trouvés, difficulté ${difficulty}`);
    // Sauvegarder en local storage
    const scores = JSON.parse(localStorage.getItem('enigmaScrollMainScores') || '[]');
    scores.push({
      score: score,
      wordsFound: wordsFound,
      difficulty: difficulty,
      date: new Date().toISOString()
    });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('enigmaScrollMainScores', JSON.stringify(scores.slice(0, 10)));
  }
};

// Fonctions utilitaires
function showMessage(text, type = 'info', duration = 2000) {
  console.log(`Message ${type}: ${text}`);
  
  const container = document.getElementById('message-container');
  if (!container) return;
  
  const message = document.createElement('div');
  message.className = `game-message ${type}`;
  message.textContent = text;
  
  container.appendChild(message);
  
  setTimeout(() => {
    if (message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }, duration);
}

function updateDisplay() {
  document.getElementById('score-display').textContent = gameState.score;
  document.getElementById('combo-display').textContent = `${gameState.combo}x`;
  document.getElementById('time-display').textContent = gameState.timeLeft;
  document.getElementById('attempts-display').textContent = `${gameState.currentRow}/${gameState.maxAttempts}`;
  document.getElementById('words-found-stat').textContent = gameState.wordsFound;
  document.getElementById('best-combo-stat').textContent = gameState.bestCombo;
  document.getElementById('total-score-stat').textContent = gameState.score;
  
  // Mettre à jour les power-ups
  document.getElementById('hint-count').textContent = gameState.powerUps.hint;
  document.getElementById('time-count').textContent = gameState.powerUps.time;
  document.getElementById('skip-count').textContent = gameState.powerUps.skip;
  
  // Mettre à jour les états des power-ups
  updatePowerUpStates();
}

function updatePowerUpStates() {
  document.querySelectorAll('.power-up').forEach(powerUp => {
    const type = powerUp.dataset.type;
    const count = gameState.powerUps[type];
    
    if (count <= 0) {
      powerUp.classList.add('disabled');
    } else {
      powerUp.classList.remove('disabled');
    }
  });
}

function createGrid() {
  const grid = document.getElementById('word-grid');
  grid.innerHTML = '';
  
  for (let row = 0; row < gameState.maxAttempts; row++) {
    const rowElement = document.createElement('div');
    rowElement.className = 'grid-row';
    
    for (let col = 0; col < gameState.wordLength; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      rowElement.appendChild(cell);
    }
    
    grid.appendChild(rowElement);
  }
}

function addLetter(letter) {
  if (gameState.currentCol < gameState.wordLength) {
    const cell = document.querySelector(
      `[data-row="${gameState.currentRow}"][data-col="${gameState.currentCol}"]`
    );
    if (cell) {
      cell.textContent = letter;
      cell.classList.add('filled');
      gameState.currentCol++;
      
      // 🎯 NOTIFICATION AVATAR - Lettre tapée
      try {
        if (window.enigmaAvatar && window.enigmaAvatar.reactToKeyboardClick) {
          window.enigmaAvatar.reactToKeyboardClick(letter);
        }
      } catch (error) {
        console.warn('⚠️ [Enigma Scroll] Erreur notification avatar lettre:', error);
      }
    }
  }
}

function deleteLetter() {
  if (gameState.currentCol > 0) {
    gameState.currentCol--;
    const cell = document.querySelector(
      `[data-row="${gameState.currentRow}"][data-col="${gameState.currentCol}"]`
    );
    if (cell) {
      cell.textContent = '';
      cell.classList.remove('filled');
      
      // 🎯 NOTIFICATION AVATAR - Lettre supprimée
      try {
        if (window.enigmaAvatar && window.enigmaAvatar.reactToLetterDeletion) {
          window.enigmaAvatar.reactToLetterDeletion();
        }
      } catch (error) {
        console.warn('⚠️ [Enigma Scroll] Erreur notification avatar suppression:', error);
      }
    }
  }
}

async function submitWord() {
  if (gameState.currentCol !== gameState.wordLength) {
    showMessage('Mot incomplet !', 'warning');
    return;
  }
  
  if (gameState.validatingWord) return;
  
  gameState.validatingWord = true;
  
  // Récupérer le mot tapé
  const currentWord = [];
  for (let col = 0; col < gameState.wordLength; col++) {
    const cell = document.querySelector(
      `[data-row="${gameState.currentRow}"][data-col="${col}"]`
    );
    currentWord.push(cell.textContent);
  }
  
  const word = currentWord.join('');
  console.log(`Vérification du mot: ${word}`);
  
  // Validation du mot (version simplifiée)
  const isValidWord = await validateWord(word);
  
  if (!isValidWord) {
    showMessage('Mot non valide !', 'error');
    gameState.validatingWord = false;
    
    // 🎯 NOTIFICATION AVATAR - Mot invalide
    try {
      if (window.enigmaAvatar) {
        window.enigmaAvatar.reactToGameMessage('Mot non valide !');
      }
    } catch (error) {
      console.warn('⚠️ [Enigma Scroll] Erreur notification avatar mot invalide:', error);
    }
    
    return;
  }
  
  // Vérifier si c'est le bon mot
  const isCorrect = word === gameState.currentWord;
  
  // Appliquer les couleurs
  applyWordColors(word, gameState.currentWord, gameState.currentRow);
  
  if (isCorrect) {
    endGame(true, 'Félicitations ! Mot trouvé !');
  } else {
    gameState.currentRow++;
    gameState.currentCol = 0;
    
    // 🎯 NOTIFICATION AVATAR ULTRA-RÉACTIF - Mot incorrect
    try {
      if (window.enigmaAvatar) {
        console.log('🎮 [Enigma Scroll] Notification avatar - mot incorrect');
        window.enigmaAvatar.reactToGameMessage('Mot non valide !');
      }
    } catch (error) {
      console.warn('⚠️ [Enigma Scroll] Erreur notification avatar incorrect:', error);
    }
    
    if (gameState.currentRow >= gameState.maxAttempts) {
      endGame(false, `Dommage ! Le mot était : ${gameState.currentWord}`);
    }
  }
  
  gameState.validatingWord = false;
  updateDisplay();
}

async function validateWord(word) {
  // Utiliser le nouveau système de validation ultra-complet
  if (typeof window.validateWordComprehensive === 'function') {
    console.log(`🔍 Validation avec système ultra-complet: ${word}`);
    return await window.validateWordComprehensive(word, gameState.wordLength);
  }
  
  // Fallback au système original si le nouveau n'est pas chargé
  console.warn('⚠️ Système ultra-complet non disponible, utilisation fallback');
  
  // Vérifier d'abord la longueur et les caractères
  if (word.length !== gameState.wordLength || !/^[A-Z]+$/.test(word)) {
    return false;
  }
  
  // Liste de base réduite pour le fallback
  const BASIC_WORDS = {
    4: ["ABLE", "BACK", "BALL", "BANK", "BASE", "BEAR", "BEAT", "BEEN", "BEST", "BIRD", "BLUE", "BOAT", "BODY", "BOOK", "CALL", "CAME", "CARE", "CASE", "COME", "COOL", "DARK", "DATA", "DATE", "DEAL", "DOES", "DONE", "DOOR", "DOWN", "EACH", "EVEN", "EVER", "EYES", "FACE", "FACT", "FALL", "FEEL", "FIND", "FIRE", "FISH", "FOOD", "FOUR", "FREE", "FROM", "GAME", "GIVE", "GOES", "GOOD", "HAND", "HAVE", "HEAD", "HELP", "HERE", "HIGH", "HOME", "HOPE", "HOUR", "JUST", "KEEP", "KIND", "KNOW", "LAST", "LEFT", "LIFE", "LIKE", "LINE", "LIVE", "LONG", "LOOK", "LOVE", "MADE", "MAKE", "MANY", "MEAN", "MORE", "MOST", "MOVE", "MUCH", "NAME", "NEED", "NEXT", "ONLY", "OPEN", "OVER", "PART", "PLAY", "REAL", "SAID", "SAME", "SEEM", "SHOW", "SIDE", "SOME", "TAKE", "TELL", "THAT", "THEM", "THEY", "THIS", "TIME", "TREE", "TURN", "VERY", "WANT", "WATER", "WELL", "WERE", "WHAT", "WHEN", "WILL", "WITH", "WORD", "WORK", "YEAR", "YOUR"],
    5: ["ABOUT", "AFTER", "AGAIN", "BEING", "BRING", "BUILD", "CARRY", "COULD", "DOING", "EVERY", "FIRST", "FOUND", "GOING", "GREAT", "GROUP", "HAPPY", "HOUSE", "LARGE", "LAUGH", "LEARN", "LEAVE", "LIGHT", "MUSIC", "NEVER", "OTHER", "PEACE", "PLACE", "POWER", "RIGHT", "SMALL", "SOUND", "SPACE", "START", "STILL", "STUDY", "THEIR", "THERE", "THESE", "THINK", "THREE", "UNDER", "UNTIL", "WATER", "WHERE", "WHICH", "WHILE", "WORLD", "WOULD", "WRITE", "YOUNG"],
    6: ["ALWAYS", "ANSWER", "AROUND", "BECOME", "BEFORE", "BETTER", "CHANGE", "COMING", "DURING", "ENERGY", "FAMILY", "FRIEND", "FUTURE", "HAPPEN", "LISTEN", "MOMENT", "MOTHER", "NATURE", "PEOPLE", "PLEASE", "SCHOOL", "SIMPLE", "SPIRIT", "STRONG", "SUMMER", "SYSTEM", "TRAVEL", "WINTER", "WONDER"]
  };
  
  const words = BASIC_WORDS[word.length];
  if (words && words.includes(word)) {
    console.log(`✅ Mot validé (fallback): ${word}`);
    return true;
  }

  console.log(`❌ Mot rejeté (fallback): ${word}`);
  return false;
}

function applyWordColors(guessedWord, targetWord, row) {
  const targetLetters = targetWord.split('');
  const guessedLetters = guessedWord.split('');
  const letterCounts = {};
  
  // Compter les lettres dans le mot cible
  targetLetters.forEach(letter => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  });
  
  // Première passe : marquer les lettres correctes
  const cellStates = new Array(gameState.wordLength).fill('absent');
  
  for (let i = 0; i < guessedLetters.length; i++) {
    if (guessedLetters[i] === targetLetters[i]) {
      cellStates[i] = 'correct';
      letterCounts[guessedLetters[i]]--;
    }
  }
  
  // Deuxième passe : marquer les lettres présentes
  for (let i = 0; i < guessedLetters.length; i++) {
    if (cellStates[i] === 'absent') {
      if (letterCounts[guessedLetters[i]] > 0) {
        cellStates[i] = 'present';
        letterCounts[guessedLetters[i]]--;
      }
    }
  }
  
  // Appliquer les couleurs aux cellules
  for (let i = 0; i < gameState.wordLength; i++) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
    if (cell) {
      cell.classList.add(cellStates[i]);
    }
    
    // Mettre à jour le clavier
    const letter = guessedLetters[i];
    updateKeyboardState(letter, cellStates[i]);
  }
}

function updateKeyboardState(letter, state) {
  const currentState = gameState.keyboardState[letter];
  
  // Priorité : correct > present > absent
  if (!currentState || 
      (state === 'correct') ||
      (state === 'present' && currentState !== 'correct')) {
    gameState.keyboardState[letter] = state;
    
    // Mettre à jour l'apparence de la touche
    const keyButton = document.querySelector(`[data-key="${letter}"]`);
    if (keyButton) {
      keyButton.classList.remove('correct', 'present', 'absent');
      keyButton.classList.add(state);
    }
  }
}

async function startGame(difficulty) {
  gameState.selectedDifficulty = difficulty;
  const config = DIFFICULTIES[difficulty];
  gameState.wordLength = config.wordLength;
  gameState.maxAttempts = config.maxAttempts;
  gameState.currentRow = 0;
  gameState.currentCol = 0;
  gameState.gameActive = true;
  gameState.timeLeft = 90;
  gameState.keyboardState = {};
  gameState.validatingWord = false;
  
  // Réinitialiser le score seulement au début d'une nouvelle session
  if (!gameState.sessionStarted) {
    gameState.score = 0;
    gameState.combo = 1;
    gameState.wordsFound = 0;
    gameState.bestCombo = 1;
    gameState.sessionStarted = true;
    console.log('Nouvelle session de jeu - Score remis à zéro');
  }
  
  // Reset des couleurs du clavier pour chaque nouveau mot
  resetKeyboardColors();
  
  // 🎯 GÉNÉRATION INTELLIGENTE DE MOT ULTRA-DIVERSIFIÉE
  try {
    gameState.currentWord = await wordGenerator.generateRandomWord(gameState.wordLength);
    console.log(`🎯 Mot intelligent généré: ${gameState.currentWord} (${gameState.wordLength} lettres)`);
    
    // Afficher les statistiques de diversité
    const stats = wordGenerator.getStats();
    console.log(`📊 Stats mots ${gameState.wordLength} lettres:`, stats[gameState.wordLength]);
  } catch (error) {
    console.warn('⚠️ Erreur génération intelligente, utilisation fallback:', error);
    // Fallback de sécurité
    const fallbackWords = ['WORLD', 'GAMES', 'PLAYER', 'LOVING', 'HOPING', 'WORKED'];
    gameState.currentWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  }
  
  // Interface
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('game-area').classList.remove('hidden');
  
  createGrid();
  updateDisplay();
  startTimer();
  
  showMessage(`Nouvelle partie ! Mot de ${gameState.wordLength} lettres`, 'success');
  if (window.emitGameEvent) emitGameEvent('start');
  
  // 🎯 NOTIFICATION AVATAR ULTRA-RÉACTIF - Démarrage de jeu
  try {
    if (window.enigmaAvatar && window.enigmaAvatar.reactToGameStart) {
      console.log('🎮 [Enigma Scroll] Notification avatar - jeu démarré!');
      window.enigmaAvatar.reactToGameStart();
    }
  } catch (error) {
    console.warn('⚠️ [Enigma Scroll] Erreur notification avatar démarrage:', error);
  }
}

async function endGame(won, message) {
  gameState.gameActive = false;
  gameState.validatingWord = false;
  stopTimer();
  
  let finalScore = gameState.score;
  
  if (won) {
    // Système de points simplifié
    const baseDifficultyScore = {
      4: 10,
      5: 15,
      6: 20
    };
    
    const baseScore = baseDifficultyScore[gameState.wordLength] || 15;
    const timeBonus = Math.min(Math.floor(gameState.timeLeft / 6), 15);
    const attemptsUsed = gameState.currentRow + 1;
    const attemptBonus = Math.max(0, (gameState.maxAttempts - attemptsUsed) * 2);
    
    const rawScore = baseScore + timeBonus + attemptBonus;
    const comboMultiplier = 1 + Math.min(gameState.combo - 1, 1.5) * 0.1;
    const totalScore = Math.floor(rawScore * comboMultiplier);
    
    gameState.score += totalScore;
    finalScore = gameState.score;
    gameState.combo++;
    gameState.wordsFound++;
    
    if (gameState.combo > gameState.bestCombo) {
      gameState.bestCombo = gameState.combo;
    }
    
    // 🎯 NOTIFICATIONS - avatar + events bus
    try {
      if (window.enigmaAvatar) {
        console.log('🎮 [Enigma Scroll] Notification avatar - mot trouvé!');
        
        // Mettre à jour le tracker de performance
        if (window.playerPerformanceTracker) {
          window.playerPerformanceTracker.updateScore(totalScore);
          window.playerPerformanceTracker.updateCombo(gameState.combo);
          window.playerPerformanceTracker.wordsFound = gameState.wordsFound;
          
          const currentLevel = window.playerPerformanceTracker.getPerformanceLevel();
          console.log(`📊 [Performance] Niveau: ${currentLevel}, Score moyen: ${window.playerPerformanceTracker.averageScore.toFixed(1)}, Mots: ${gameState.wordsFound}`);
        }
        
        window.enigmaAvatar.reactToScoreIncrease(totalScore);
        if (gameState.combo > 2) {
          setTimeout(() => {
            window.enigmaAvatar.reactToComboAchieved(gameState.combo);
          }, 500);
        }
      }
      if (window.emitGameEvent) emitGameEvent('score', { points: totalScore });
      if (gameState.combo > 2 && window.emitGameEvent) emitGameEvent('combo', { combo: gameState.combo });
    } catch (error) {
      console.warn('⚠️ [Enigma Scroll] Erreur notification avatar:', error);
    }
    
    // Sauvegarder le score
    window.enigmaScrollGame.saveScore(
      finalScore,
      null,
      gameState.wordsFound,
      gameState.wordLength
    );

    // Sauvegarde score en ligne + Récompenses + notation fin de partie
    try {
      if (window.scoreService && typeof window.scoreService.saveScore === 'function') {
        const extra = {
          wordsFound: gameState.wordsFound,
          bestCombo: gameState.bestCombo,
          wordLength: gameState.wordLength
        };
        await window.scoreService.saveScore('enigma-scroll', finalScore, extra);
      }
      // Récompenses intelligentes (XP/coins). Bonus si meilleur combo élevé
      const isTopScore = gameState.bestCombo >= 8 || totalScore >= 50;
      if (window.rewardService && typeof window.rewardService.giveRewards === 'function') {
        const xpGain = Math.max(5, Math.floor(totalScore / 2) + gameState.wordsFound * 2);
        const coinsGain = Math.max(3, Math.floor(totalScore / 3) + Math.floor(gameState.combo));
        window.rewardService.giveRewards({ xp: xpGain, coins: coinsGain }, isTopScore, 'enigma-scroll');
      }
      // Enregistrement de la partie pour les stats globales
      if (window.gameStatsService && typeof window.gameStatsService.recordGamePlay === 'function') {
        const userId = (window.authService && window.authService.getCurrentUser && window.authService.getCurrentUser()?.uid) || null;
        window.gameStatsService.recordGamePlay('enigma-scroll', userId, finalScore, null);
      }
      // Overlay de notation
      if (window.endGameRating && typeof window.endGameRating.showRating === 'function') {
        const userId = (window.authService && window.authService.getCurrentUser && window.authService.getCurrentUser()?.uid) || null;
        setTimeout(() => window.endGameRating.showRating('enigma-scroll', userId, 'Enigma Scroll'), 600);
      }
    } catch (e) {
      console.warn('⚠️ [Enigma Scroll] Récompenses/notation: ', e);
    }
    
    showMessage(`${message} Score: +${totalScore}`, 'success', 3000);
    
    // Vérifier si temps écoulé
    if (gameState.timeLeft <= 0) {
      showMessage('Temps écoulé ! Partie terminée', 'warning', 3000);
      endGameSession();
    } else {
      // Continuer avec un nouveau mot
      setTimeout(() => {
        if (gameState.selectedDifficulty) {
          showMessage('Nouveau mot !', 'info', 1000);
          setTimeout(() => {
            startGame(gameState.selectedDifficulty);
          }, 500);
        }
      }, 2000);
    }
  } else {
    // Partie perdue
    finalScore = gameState.score;
    
    // 🎯 NOTIFICATIONS - avatar + events bus
    try {
      if (window.enigmaAvatar) {
        console.log('🎮 [Enigma Scroll] Notification avatar - défaite');
        window.enigmaAvatar.reactToGameMessage('Essayez encore !');
      }
      if (window.emitGameEvent) emitGameEvent('end', { score: finalScore, message });
    } catch (error) {
      console.warn('⚠️ [Enigma Scroll] Erreur notification avatar défaite:', error);
    }
    
    window.enigmaScrollGame.saveScore(
      finalScore,
      null,
      gameState.wordsFound,
      gameState.wordLength
    );
    try {
      if (window.scoreService && typeof window.scoreService.saveScore === 'function') {
        const extra = {
          wordsFound: gameState.wordsFound,
          bestCombo: gameState.bestCombo,
          wordLength: gameState.wordLength
        };
        await window.scoreService.saveScore('enigma-scroll', finalScore, extra);
      }
      if (window.gameStatsService && typeof window.gameStatsService.recordGamePlay === 'function') {
        const userId = (window.authService && window.authService.getCurrentUser && window.authService.getCurrentUser()?.uid) || null;
        window.gameStatsService.recordGamePlay('enigma-scroll', userId, finalScore, null);
      }
      if (window.endGameRating && typeof window.endGameRating.showRating === 'function') {
        const userId = (window.authService && window.authService.getCurrentUser && window.authService.getCurrentUser()?.uid) || null;
        setTimeout(() => window.endGameRating.showRating('enigma-scroll', userId, 'Enigma Scroll'), 600);
      }
    } catch (e) {
      console.warn('⚠️ [Enigma Scroll] Récompenses/notation: ', e);
    }
    
    gameState.combo = 1;
    showMessage(message, 'error', 3000);
    endGameSession();
  }
  
  updateDisplay();
}

function endGameSession() {
  gameState.sessionStarted = false;
  
  console.log('Session terminée - Score final:', gameState.score);
  
  // Afficher le bouton nouveau jeu
  setTimeout(() => {
    document.getElementById('new-game-button').style.display = 'inline-flex';
  }, 2000);
}

function startTimer() {
  if (gameTimer) clearInterval(gameTimer);
  
  gameTimer = setInterval(() => {
    gameState.timeLeft--;
    updateDisplay();
    
    if (gameState.timeLeft <= 0) {
      endGame(false, 'Temps écoulé !');
    }
  }, 1000);
}

function stopTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function resetKeyboardColors() {
  document.querySelectorAll('.key-btn').forEach(key => {
    key.classList.remove('correct', 'present', 'absent');
  });
  gameState.keyboardState = {};
}

function newGame() {
  document.getElementById('new-game-button').style.display = 'none';
  
  // Réinitialiser complètement la session pour une nouvelle partie
  gameState.sessionStarted = false;
  gameState.score = 0;
  gameState.combo = 1;
  gameState.wordsFound = 0;
  gameState.bestCombo = 1;
  
  // 🎯 RÉINITIALISER LE GÉNÉRATEUR DE MOTS POUR NOUVELLE SESSION
  wordGenerator.resetSession();
  console.log('🔄 Nouvelle session - Générateur de mots réinitialisé');
  
  // Réinitialiser les power-ups
  gameState.powerUps = {
    hint: 3,
    time: 2,
    skip: 1
  };
  
  console.log('Réinitialisation complète pour nouvelle partie');
  
  if (gameState.selectedDifficulty) {
    startGame(gameState.selectedDifficulty);
  }
}

function usePowerUp(type) {
  if (gameState.powerUps[type] <= 0 || !gameState.gameActive) {
    showMessage('Power-up non disponible !', 'warning');
    return;
  }
  
  gameState.powerUps[type]--;
  
  // 🎯 NOTIFICATION AVATAR - Power-up utilisé
  try {
    if (window.enigmaAvatar && window.enigmaAvatar.reactToPowerUp) {
      window.enigmaAvatar.reactToPowerUp(type);
    }
  } catch (error) {
    console.warn('⚠️ [Enigma Scroll] Erreur notification avatar power-up:', error);
  }
  
  switch (type) {
    case 'hint':
      giveHint();
      break;
    case 'time':
      gameState.timeLeft += 30;
      showMessage('+30 secondes !', 'info');
      break;
    case 'skip':
      skipCurrentWord();
      break;
  }
  
  updateDisplay();
}

function giveHint() {
  // Révéler une lettre aléatoire du mot
  const emptyPositions = [];
  for (let col = 0; col < gameState.wordLength; col++) {
    const cell = document.querySelector(
      `[data-row="${gameState.currentRow}"][data-col="${col}"]`
    );
    if (!cell.textContent) {
      emptyPositions.push(col);
    }
  }
  
  if (emptyPositions.length > 0) {
    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    const letter = gameState.currentWord[randomPos];
    
    const cell = document.querySelector(
      `[data-row="${gameState.currentRow}"][data-col="${randomPos}"]`
    );
    cell.textContent = letter;
    cell.classList.add('filled', 'hint');
    
    showMessage(`Indice : ${letter} à la position ${randomPos + 1}`, 'info');
  }
}

function skipCurrentWord() {
  // Passer au mot suivant sans pénalité
  showMessage(`Le mot était : ${gameState.currentWord}`, 'info', 3000);
  
  setTimeout(() => {
    if (gameState.selectedDifficulty) {
      startGame(gameState.selectedDifficulty);
    }
  }, 1500);
}

function handleKeyPress(key) {
  if (!gameState.gameActive || gameState.validatingWord) return;
  
  if (key === 'ENTER') {
    submitWord();
  } else if (key === '⌫' || key === 'BACKSPACE') {
    deleteLetter();
  } else if (key.match(/^[A-Z]$/)) {
    addLetter(key);
  }
}

// Initialisation du DOM
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser le système de scores
  window.enigmaScrollGame.init();
  
  // Sélection de difficulté
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const difficulty = this.dataset.difficulty;
      gameState.selectedDifficulty = difficulty;
    });
  });
  
  // Bouton commencer
  document.getElementById('start-game-button').addEventListener('click', function() {
    if (!gameState.selectedDifficulty) {
      showMessage('Veuillez sélectionner une difficulté !', 'warning');
      return;
    }
    
    // Réinitialiser complètement la session au démarrage
    gameState.sessionStarted = false;
    gameState.score = 0;
    gameState.combo = 1;
    gameState.wordsFound = 0;
    gameState.bestCombo = 1;
    
    gameState.powerUps = {
      hint: 3,
      time: 2,
      skip: 1
    };
    
    console.log('Démarrage nouvelle session de jeu');
    startGame(gameState.selectedDifficulty);
  });
  
  // Power-ups
  document.querySelectorAll('.power-up').forEach(item => {
    item.addEventListener('click', function() {
      const type = this.dataset.type;
      usePowerUp(type);
    });
  });
  
  // Clavier virtuel
  document.querySelectorAll('.key-btn').forEach(key => {
    key.addEventListener('click', function() {
      const keyText = this.textContent;
      handleKeyPress(keyText);
    });
  });
  
  // Clavier physique
  document.addEventListener('keydown', function(e) {
    const key = e.key.toUpperCase();
    
    // Power-ups avec touches numériques
    if (key === '1') { usePowerUp('hint'); return; }
    if (key === '2') { usePowerUp('time'); return; }
    if (key === '3') { usePowerUp('skip'); return; }
    
    handleKeyPress(key);
  });
  
  // Nouveau jeu
  document.getElementById('new-game-button').addEventListener('click', newGame);
  
  console.log('Jeu Enigma Scroll initialisé !');
  console.log('Raccourcis: 1=Indice, 2=Temps, 3=Passer');
}); 