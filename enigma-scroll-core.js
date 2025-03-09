// ===== ENIGMAN SCROLLS - CORE FUNCTIONALITY =====
// Fonctionnalités de base du jeu

// État du jeu
const gameState = {
    currentWord: '',
    currentGuess: '',
    guesses: [],
    gameStatus: 'waiting', // 'waiting', 'playing', 'won', 'lost'
    score: 0,
    maxAttempts: 6,
    usedWords: new Set(),
    timeRemaining: 60,
    timerInterval: null,
    gameStarted: false,
    powerUps: {
        hint: 3,    // Nombre d'utilisations restantes pour l'indice
        time: 2,    // Nombre d'utilisations restantes pour le temps
        skip: 1     // Nombre d'utilisations restantes pour le saut
    }
};

// Liste de mots pour le jeu
const wordList = [
    "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", 
    "AGENT", "AGREE", "AHEAD", "ALBUM", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", 
    "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARGUE", "ARISE", "ARMED", "ASIDE", 
    "ASSET", "AVOID", "AWARD", "AWARE", "AWFUL", "BADLY", "BASIC", "BASIS", "BEACH", "BEGIN", 
    "BEING", "BELOW", "BENCH", "BIRTH", "BLACK", "BLADE", "BLAME", "BLIND", "BLOCK", "BLOOD", 
    "BOARD", "BRAIN", "BRAND", "BREAD", "BREAK", "BRICK", "BRIEF", "BRING", "BROAD", "BROWN", 
    "BRUSH", "BUILD", "BUNCH", "BUYER", "CABIN", "CABLE", "CARRY", "CATCH", "CAUSE", "CHAIN", 
    "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEST", "CHIEF", "CHILD", "CIVIL", 
    "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLIMB", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", 
    "COLOR", "COUCH", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAZY", 
    "CREAM", "CRIME", "CROSS", "CROWD", "CYCLE", "DAILY", "DANCE", "DEATH", "DELAY", "DEPTH", 
    "DIRTY", "DOUBT", "DOZEN", "DRAFT", "DRAMA", "DREAM", "DRESS", "DRINK", "DRIVE", "EAGER", 
    "EARLY", "EARTH", "EIGHT", "ELECT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", 
    "EQUAL", "ERROR", "ESSAY", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", 
    "FAULT", "FAVOR", "FENCE", "FEWER", "FIBER", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", 
    "FIRST", "FLAME", "FLESH", "FLOAT", "FLOOR", "FOCUS", "FORCE", "FORTH", "FOUND", "FRAME", 
    "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GHOST", "GIANT", "GIVEN", "GLASS", "GLOVE", 
    "GRADE", "GRAIN", "GRAND", "GRANT", "GRASS", "GRAVE", "GREAT", "GREEN", "GROUP", "GUARD", 
    "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HEART", "HEAVY", "HELLO", "HONEY", "HONOR", 
    "HORSE", "HOTEL", "HOUSE", "HUMAN", "HUMOR", "IDEAL", "IMAGE", "IMPLY", "INDEX", "INNER"
];

// Liste de mots anglais courants de 5 lettres (liste plus complète)
const commonEnglishWords = [
    "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", 
    "AGENT", "AGREE", "AHEAD", "ALBUM", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", 
    "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARGUE", "ARISE", "ARMED", "ASIDE", 
    "ASSET", "AVOID", "AWARD", "AWARE", "AWFUL", "BADLY", "BASIC", "BASIS", "BEACH", "BEGIN", 
    "BEING", "BELOW", "BENCH", "BIRTH", "BLACK", "BLADE", "BLAME", "BLIND", "BLOCK", "BLOOD", 
    "BOARD", "BRAIN", "BRAND", "BREAD", "BREAK", "BRICK", "BRIEF", "BRING", "BROAD", "BROWN", 
    "BRUSH", "BUILD", "BUNCH", "BUYER", "CABIN", "CABLE", "CARRY", "CATCH", "CAUSE", "CHAIN", 
    "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEST", "CHIEF", "CHILD", "CIVIL", 
    "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLIMB", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", 
    "COLOR", "COUCH", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAZY", 
    "CREAM", "CRIME", "CROSS", "CROWD", "CYCLE", "DAILY", "DANCE", "DEATH", "DELAY", "DEPTH", 
    "DIRTY", "DOUBT", "DOZEN", "DRAFT", "DRAMA", "DREAM", "DRESS", "DRINK", "DRIVE", "EAGER", 
    "EARLY", "EARTH", "EIGHT", "ELECT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", 
    "EQUAL", "ERROR", "ESSAY", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", 
    "FAULT", "FAVOR", "FENCE", "FEWER", "FIBER", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", 
    "FIRST", "FLAME", "FLESH", "FLOAT", "FLOOR", "FOCUS", "FORCE", "FORTH", "FOUND", "FRAME", 
    "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GHOST", "GIANT", "GIVEN", "GLASS", "GLOVE", 
    "GRADE", "GRAIN", "GRAND", "GRANT", "GRASS", "GRAVE", "GREAT", "GREEN", "GROUP", "GUARD", 
    "GUESS", "GUEST", "GUIDE", "HABIT", "HAPPY", "HEART", "HEAVY", "HELLO", "HONEY", "HONOR", 
    "HORSE", "HOTEL", "HOUSE", "HUMAN", "HUMOR", "IDEAL", "IMAGE", "IMPLY", "INDEX", "INNER",
    "ISSUE", "JOINT", "JUDGE", "JUICE", "KNIFE", "KNOCK", "LABEL", "LABOR", "LARGE", "LATER",
    "LAUGH", "LAYER", "LEARN", "LEAST", "LEAVE", "LEGAL", "LEMON", "LEVEL", "LIGHT", "LIMIT",
    "LOCAL", "LOOSE", "LOVER", "LOWER", "LUCKY", "LUNCH", "MAJOR", "MAKER", "MARRY", "MATCH",
    "MAYBE", "MAYOR", "MEDIA", "METAL", "METER", "MIGHT", "MINOR", "MODEL", "MONEY", "MONTH",
    "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAKED", "NERVE", "NEVER",
    "NEWLY", "NIGHT", "NOISE", "NORTH", "NOVEL", "NURSE", "OCCUR", "OCEAN", "OFFER", "OFTEN",
    "ONION", "ORDER", "OTHER", "OUGHT", "OWNER", "PAINT", "PANEL", "PAPER", "PARTY", "PATCH",
    "PAUSE", "PEACE", "PHASE", "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT", "PITCH", "PLACE",
    "PLANE", "PLANT", "PLATE", "POINT", "PORCH", "POUND", "POWER", "PRESS", "PRICE", "PRIDE",
    "PRIME", "PRINT", "PRIOR", "PROOF", "PROUD", "PROVE", "QUICK", "QUIET", "QUITE", "QUOTE",
    "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", "REFER", "RELAX",
    "REPLY", "RIFLE", "RIGHT", "RIVER", "ROUGH", "ROUND", "ROUTE", "RURAL", "SALAD", "SALES",
    "SAUCE", "SCALE", "SCENE", "SCOPE", "SCORE", "SEIZE", "SENSE", "SERVE", "SEVEN", "SHADE",
    "SHAKE", "SHALL", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE",
    "SHIRT", "SHOCK", "SHOOT", "SHORE", "SHORT", "SHOUT", "SHRUG", "SIGHT", "SINCE", "SKILL",
    "SLAVE", "SLEEP", "SLICE", "SLIDE", "SMALL", "SMART", "SMELL", "SMILE", "SMOKE", "SOLAR",
    "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPEAK", "SPEED", "SPEND", "SPLIT",
    "SPORT", "STAFF", "STAGE", "STAIR", "STAKE", "STAND", "STARE", "START", "STATE", "STEAL",
    "STEEL", "STICK", "STILL", "STOCK", "STONE", "STORE", "STORM", "STORY", "STRIP", "STUDY",
    "STUFF", "STYLE", "SUGAR", "SUPER", "SWEAR", "SWEEP", "SWEET", "SWING", "TABLE", "TASTE",
    "TEACH", "TERMS", "THANK", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK",
    "THIRD", "THOSE", "THREE", "THROW", "TIGHT", "TIRED", "TITLE", "TODAY", "TOOTH", "TOPIC",
    "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACE", "TRACK", "TRADE", "TRAIL", "TRAIN", "TREAT",
    "TREND", "TRIAL", "TRIBE", "TRICK", "TROOP", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE",
    "UNCLE", "UNDER", "UNION", "UNTIL", "UPPER", "URBAN", "USUAL", "VALUE", "VIDEO", "VIRUS",
    "VISIT", "VITAL", "VOICE", "VOTER", "WASTE", "WATCH", "WATER", "WEIGH", "WHEEL", "WHERE",
    "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WORKS", "WORLD", "WORRY", "WORTH",
    "WOULD", "WOUND", "WRITE", "WRONG", "YIELD", "YOUNG", "YOURS", "YOUTH", "ZEBRA", "QUEEN",
    "QUICK", "QUACK", "QUILL", "QUILT", "QUEST", "QUARK", "QUART", "QUASH", "QUASI", "QUERY"
];

// Fonction pour obtenir un mot aléatoire
function getRandomWord() {
    // Utiliser la liste plus complète
    const combinedList = [...new Set([...wordList, ...commonEnglishWords])];
    console.log('Nombre total de mots disponibles:', combinedList.length);
    
    let word;
    do {
        word = combinedList[Math.floor(Math.random() * combinedList.length)];
    } while (gameState.usedWords.has(word));
    
    gameState.usedWords.add(word);
    // Ne pas afficher le mot dans la console pour éviter la triche
    return word;
}

// Fonction pour initialiser le jeu
function initGame() {
    // Afficher le nombre de mots disponibles
    console.log('Nombre de mots dans la liste originale:', wordList.length);
    console.log('Nombre de mots dans la liste complète:', commonEnglishWords.length);
    console.log('Exemple de mots:', commonEnglishWords.slice(0, 10));
    
    // Créer la grille de jeu
    renderGrid();
    
    // Configurer le bouton de démarrage
    setupStartButton();
    
    // Initialiser les gestionnaires pour la modale des règles
    initModalHandlers();
    
    // Afficher la modale des règles au chargement de la page
    setTimeout(() => {
        console.log('Affichage de la modale des règles au chargement...');
        const rulesModal = document.getElementById('rulesModal');
        if (rulesModal) {
            rulesModal.classList.add('show');
            rulesModal.style.display = 'flex';
            rulesModal.style.opacity = '1';
            rulesModal.style.visibility = 'visible';
        } else {
            console.error("La modale des règles n'a pas été trouvée dans le DOM");
        }
    }, 500);
}

// Fonction pour configurer le bouton de démarrage
function setupStartButton() {
    const startButton = document.getElementById('start-game-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
}

// Fonction pour démarrer le jeu
function startGame() {
    console.log('Démarrage du jeu...');
    
    // Cacher le bouton de démarrage
    const startButton = document.getElementById('start-game-button');
    if (startButton) {
        startButton.style.display = 'none';
    }
    
    // Afficher la zone de jeu et les power-ups
    const gameArea = document.getElementById('game-area');
    const powerUpsContainer = document.getElementById('power-ups-container');
    
    if (gameArea) {
        gameArea.style.display = 'block';
    }
    
    if (powerUpsContainer) {
        powerUpsContainer.style.display = 'block';
    }
    
    // Réinitialiser l'état du jeu
    resetGameState();
    
    // Démarrer un nouveau mot
    startNewWord();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    // Démarrer le timer
    startTimer();
    
    // Mettre à jour l'affichage des power-ups
    updatePowerUpsDisplay();
    
    // Mettre à jour le statut du jeu
    gameState.gameStatus = 'playing';
    gameState.gameStarted = true;
}

// Fonction pour réinitialiser l'état du jeu
function resetGameState() {
    gameState.score = 0;
    gameState.usedWords.clear();
    gameState.gameStatus = 'waiting';
    gameState.timeRemaining = 60;
    
    // Réinitialiser les power-ups
    gameState.powerUps = {
        hint: 3,
        time: 2,
        skip: 1
    };
    
    // Mettre à jour l'affichage du score
    updateScore();
    updateTimeDisplay();
    updatePowerUpsDisplay();
}

// Fonction pour démarrer un nouveau mot
function startNewWord() {
    console.log('Démarrage d\'un nouveau mot...');
    
    // Réinitialiser les couleurs du clavier
    resetKeyboardColors();
    
    // Obtenir un nouveau mot
    gameState.currentWord = getRandomWord();
    
    // Initialiser la tentative actuelle avec la première lettre du mot
    gameState.currentGuess = gameState.currentWord[0];
    
    gameState.guesses = [];
    gameState.gameStatus = 'playing';
    
    // Ne pas afficher le mot dans la console pour éviter la triche
    
    // Rendre la grille
    renderGrid();
    
    // Mettre à jour le message
    updateMessage('Devine le mot ! La première lettre est révélée.');
}

// Fonction pour démarrer le timer
function startTimer() {
    // Arrêter le timer existant s'il y en a un
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Réinitialiser le temps
    gameState.timeRemaining = 60;
    updateTimeDisplay();
    
    // Démarrer un nouveau timer
    gameState.timerInterval = setInterval(() => {
        // Décrémenter le temps
        gameState.timeRemaining--;
        
        // Mettre à jour l'affichage
        updateTimeDisplay();
        
        // Vérifier si le temps est écoulé
        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

// Fonction pour mettre à jour l'affichage du temps
function updateTimeDisplay() {
    const timeElement = document.getElementById('time-remaining');
    if (timeElement) {
        timeElement.textContent = gameState.timeRemaining;
        
        // Ajouter une classe d'alerte si le temps est faible
        if (gameState.timeRemaining <= 10) {
            timeElement.classList.add('time-low');
        } else {
            timeElement.classList.remove('time-low');
        }
    }
}

// Fonction pour gérer la fin du temps
async function handleTimeUp() {
    // Vérifier si le jeu est en cours
    if (gameState.gameStatus !== 'playing') return;
    
    // Mettre à jour le statut du jeu
    gameState.gameStatus = 'lost';
    
    // Calculer le nombre de mots trouvés
    const wordsFound = Math.floor(gameState.score / 10);
    
    // Mettre à jour le message
    updateMessage(`Temps écoulé ! Le mot était : ${gameState.currentWord}. Score: ${gameState.score}`, true);
    
    // Appeler la fonction de fin de jeu
    endGame(false);
}

// Fonction pour configurer les écouteurs d'événements
function setupEventListeners() {
    console.log('Configuration des écouteurs d\'événements...');
    
    // Supprimer les écouteurs d'événements existants
    const keyboardButtons = document.querySelectorAll('.enigma-keyboard button');
    keyboardButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    
    // Ajouter de nouveaux écouteurs d'événements
    const newKeyboardButtons = document.querySelectorAll('.enigma-keyboard button');
    newKeyboardButtons.forEach(button => {
        button.addEventListener('click', function() {
            const key = this.textContent;
            
            if (key === 'Enter') {
                // Utiliser une fonction asynchrone auto-exécutée
                (async () => {
                    await handleEnter();
                })();
            } else if (key === '←') {
                handleDelete();
            } else {
                handleKeyInput(key);
            }
            
            // Ajouter un effet de clic
            this.classList.add('button-click');
            setTimeout(() => {
                this.classList.remove('button-click');
            }, 200);
        });
    });
    
    // Ajouter un écouteur pour les touches du clavier
    document.addEventListener('keydown', function(event) {
        // Ne réagir que si le jeu est démarré
        if (!gameState.gameStarted) return;
        
        if (event.key === 'Enter') {
            // Utiliser une fonction asynchrone auto-exécutée
            (async () => {
                await handleEnter();
            })();
        } else if (event.key === 'Backspace') {
            handleDelete();
        } else if (/^[A-Za-z]$/.test(event.key)) {
            handleKeyInput(event.key.toUpperCase());
        }
    });
    
    // Configurer les power-ups
    setupPowerUps();
}

// Fonction pour configurer les power-ups
function setupPowerUps() {
    // Power-up d'indice
    const hintPower = document.getElementById('hint-power');
    if (hintPower) {
        hintPower.addEventListener('click', function() {
            if (gameState.gameStatus !== 'playing') return;
            
            // Vérifier s'il reste des utilisations
            if (gameState.powerUps.hint <= 0) {
                updateMessage("Vous n'avez plus d'indices disponibles !", true);
                return;
            }
            
            // Décrémenter le compteur
            gameState.powerUps.hint--;
            
            // Mettre à jour l'affichage
            updatePowerUpsDisplay();
            
            // Effet visuel
            this.classList.add('power-up-used');
            setTimeout(() => {
                this.classList.remove('power-up-used');
            }, 500);
            
            // Révéler une lettre aléatoire
            revealRandomLetter();
        });
    }
    
    // Power-up de temps
    const timePower = document.getElementById('time-power');
    if (timePower) {
        timePower.addEventListener('click', function() {
            if (gameState.gameStatus !== 'playing') return;
            
            // Vérifier s'il reste des utilisations
            if (gameState.powerUps.time <= 0) {
                updateMessage("Vous n'avez plus de temps supplémentaire disponible !", true);
                return;
            }
            
            // Décrémenter le compteur
            gameState.powerUps.time--;
            
            // Mettre à jour l'affichage
            updatePowerUpsDisplay();
            
            // Effet visuel
            this.classList.add('power-up-used');
            setTimeout(() => {
                this.classList.remove('power-up-used');
            }, 500);
            
            // Ajouter du temps
            addExtraTime(30);
        });
    }
    
    // Power-up de saut
    const skipPower = document.getElementById('skip-power');
    if (skipPower) {
        skipPower.addEventListener('click', function() {
            if (gameState.gameStatus !== 'playing') return;
            
            // Vérifier s'il reste des utilisations
            if (gameState.powerUps.skip <= 0) {
                updateMessage("Vous n'avez plus de sauts disponibles !", true);
                return;
            }
            
            // Décrémenter le compteur
            gameState.powerUps.skip--;
            
            // Mettre à jour l'affichage
            updatePowerUpsDisplay();
            
            // Effet visuel
            this.classList.add('power-up-used');
            setTimeout(() => {
                this.classList.remove('power-up-used');
            }, 500);
            
            // Passer au mot suivant
            skipCurrentWord();
        });
    }
}

// Fonction pour révéler une lettre aléatoire
function revealRandomLetter() {
    // Vérifier si le jeu est en cours
    if (gameState.gameStatus !== 'playing') return;
    
    // Obtenir les indices des lettres non révélées
    const currentGuessArray = gameState.currentGuess.split('');
    const hiddenIndices = [];
    
    for (let i = 1; i < gameState.currentWord.length; i++) {
        if (currentGuessArray[i] !== gameState.currentWord[i]) {
            hiddenIndices.push(i);
        }
    }
    
    // S'il n'y a pas de lettres cachées, ne rien faire
    if (hiddenIndices.length === 0) {
        updateMessage("Toutes les lettres sont déjà révélées !", true);
        return;
    }
    
    // Choisir un indice aléatoire parmi les lettres cachées
    const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
    
    // Révéler la lettre
    currentGuessArray[randomIndex] = gameState.currentWord[randomIndex];
    gameState.currentGuess = currentGuessArray.join('');
    
    // Mettre à jour l'affichage
    renderGrid();
    
    // Message
    updateMessage("Une lettre a été révélée !");
}

// Fonction pour ajouter du temps supplémentaire
function addExtraTime(seconds) {
    gameState.timeRemaining += seconds;
    updateTimeDisplay();
    
    // Effet visuel
    const timeElement = document.getElementById('time-remaining');
    if (timeElement) {
        timeElement.classList.add('time-added');
        setTimeout(() => {
            timeElement.classList.remove('time-added');
        }, 1000);
    }
    
    // Message
    updateMessage(`+${seconds} secondes ajoutées !`);
}

// Fonction pour passer au mot suivant
function skipCurrentWord() {
    // Vérifier si le jeu est en cours
    if (gameState.gameStatus !== 'playing') return;
    
    // Message
    updateMessage(`Mot passé : ${gameState.currentWord}`);
    
    // Passer au mot suivant
    setTimeout(() => {
        startNewWord();
    }, 1500);
}

// Fonction pour gérer l'entrée d'une lettre
function handleKeyInput(key) {
    if (gameState.gameStatus !== 'playing') return;
    
    // Vérifier si le mot est complet
    if (gameState.currentGuess.length >= gameState.currentWord.length) return;
    
    // Ajouter la lettre à la tentative actuelle (toujours en majuscules)
    gameState.currentGuess += key.toUpperCase();
    
    // Mettre à jour l'affichage
    renderGrid();
}

// Fonction pour gérer la suppression d'une lettre
function handleDelete() {
    if (gameState.gameStatus !== 'playing') return;
    
    // Vérifier si la tentative est vide ou ne contient que la première lettre
    if (gameState.currentGuess.length <= 1) return;
    
    // Supprimer la dernière lettre
    gameState.currentGuess = gameState.currentGuess.slice(0, -1);
    
    // Mettre à jour l'affichage
    renderGrid();
}

// Fonction pour vérifier si un mot est un mot anglais valide via l'API
async function isEnglishWord(word) {
    try {
        // Appel à l'API pour vérifier si le mot existe
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        if (response.ok) {
            const data = await response.json();
            return data.length > 0;  // Le mot existe s'il y a une réponse
        } else {
            return false;  // Si le mot n'existe pas, la réponse de l'API est invalide
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du mot via l'API:", error);
        return false;  // Si l'API échoue, on considère que le mot n'existe pas
    }
}

// Fonction pour vérifier si un mot est valide
async function isValidWord(word) {
    // Convertir en majuscules pour la comparaison
    word = word.toUpperCase();
    
    // Vérifier si le mot est dans la liste originale
    if (wordList.includes(word)) {
        return true;
    }

    // Vérifier si le mot est dans la liste étendue
    if (commonEnglishWords.includes(word)) {
        return true;
    }
    
    // Si le mot n'est pas dans nos listes, vérifier via l'API
    const isValid = await isEnglishWord(word);
    return isValid;
}

// Fonction pour gérer l'entrée
async function handleEnter() {
    if (gameState.gameStatus !== 'playing') return;
    
    // Vérifier si le mot est complet
    if (gameState.currentGuess.length !== gameState.currentWord.length) {
        updateMessage('Le mot n\'est pas complet !', true);
        return;
    }
    
    // Convertir la tentative en majuscules pour la comparaison
    const guessUpperCase = gameState.currentGuess.toUpperCase();
    
    // Afficher l'indicateur de chargement
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.classList.add('loading');
        updateMessage('Vérification du mot...');
    }
    
    try {
        // Vérifier si le mot est valide
        const isValid = await isValidWord(guessUpperCase);
        
        // Masquer l'indicateur de chargement
        if (messageElement) {
            messageElement.classList.remove('loading');
        }
        
        if (!isValid) {
            updateMessage('Ce mot n\'existe pas dans notre dictionnaire !', true);
            return;
        }
        
        // Vérifier si le mot est correct
        if (guessUpperCase === gameState.currentWord) {
            handleCorrectGuess();
        } else {
            handleIncorrectGuess();
        }
    } catch (error) {
        // En cas d'erreur, masquer l'indicateur de chargement et afficher un message d'erreur
        if (messageElement) {
            messageElement.classList.remove('loading');
        }
        console.error('Erreur lors de la vérification du mot:', error);
        updateMessage('Erreur lors de la vérification du mot. Réessayez.', true);
    }
}

// Fonction pour gérer une tentative correcte
function handleCorrectGuess() {
    // Mettre à jour le statut du jeu
    gameState.gameStatus = 'won';
    
    // Augmenter le score
    gameState.score += 10;
    
    // Ajouter du temps bonus
    addExtraTime(10);
    
    // Mettre à jour le message
    updateMessage(`Bravo ! Vous avez trouvé le mot "${gameState.currentWord}" !`);
    
    // Mettre à jour les couleurs du clavier
    updateKeyboardColors();
    
    // Mettre à jour le score
    updateScore();
    
    // Chance de gagner un power-up supplémentaire (20%)
    if (Math.random() < 0.2) {
        // Choisir aléatoirement un type de power-up
        const powerUpTypes = ['hint', 'time', 'skip'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        // Incrémenter le compteur de ce power-up
        gameState.powerUps[randomType]++;
        
        // Mettre à jour l'affichage des power-ups
        updatePowerUpsDisplay();
        
        // Afficher un message
        updateMessage(`Vous avez gagné un power-up ${randomType === 'hint' ? 'Indice' : randomType === 'time' ? 'Temps' : 'Passer'} supplémentaire !`);
    }
    
    // Démarrer un nouveau mot après un délai
    setTimeout(() => {
        // Si c'est le dernier mot ou si le temps est écoulé, terminer le jeu
        if (gameState.timeRemaining <= 0) {
            handleGameOver(true);
        } else {
            startNewWord();
        }
    }, 2000);
}

// Fonction pour gérer une tentative incorrecte
function handleIncorrectGuess() {
    // Ajouter la tentative à la liste des tentatives
    gameState.guesses.push({
        guess: gameState.currentGuess.toUpperCase(),
        result: evaluateGuess(gameState.currentGuess.toUpperCase())
    });
    
    // Réinitialiser la tentative actuelle en gardant la première lettre
    gameState.currentGuess = gameState.currentWord[0];
    
    // Mettre à jour l'affichage
    renderGrid();
    
    // Mettre à jour les couleurs du clavier
    updateKeyboardColors();
    
    // Vérifier si le jeu est terminé
    if (gameState.guesses.length >= gameState.maxAttempts) {
        handleGameOver();
    } else {
        updateMessage(`Essai ${gameState.guesses.length}/${gameState.maxAttempts}. Essayez encore !`);
    }
}

// Fonction pour gérer la fin du jeu
async function handleGameOver(isWin = false) {
    console.log("Début de la gestion de fin de partie");
    
    // Arrêter le timer s'il est en cours
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
        console.log("Timer arrêté");
    }
    
    // Mettre à jour le statut du jeu
    gameState.gameStatus = isWin ? 'won' : 'lost';
    
    // Calculer le nombre de mots trouvés
    const wordsFound = Math.floor(gameState.score / 10); // Chaque mot correct vaut 10 points
    console.log(`Fin de partie - Score: ${gameState.score}, Mots trouvés: ${wordsFound}`);
    
    // Afficher le message de fin de jeu dans la zone de message
    const message = isWin 
        ? `Bravo ! Vous avez trouvé le mot "${gameState.currentWord}" !` 
        : `Partie terminée ! Le mot était "${gameState.currentWord}".`;
    
    updateMessage(message);
    
    // Appeler la fonction de fin de jeu
    endGame(isWin);
}

// Fonction pour terminer le jeu
async function endGame(isWin = false) {
    console.log("Fin de la partie");
    
    // Arrêter le timer s'il est en cours
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
        console.log("Timer arrêté");
    }
    
    // Mettre à jour l'état du jeu
    gameState.gameStatus = isWin ? 'won' : 'lost';
    
    // Calculer le nombre de mots trouvés
    const wordsFound = Math.floor(gameState.score / 10);
    
    // Afficher le message de fin de jeu dans la zone de message
    const message = isWin 
        ? `Bravo ! Vous avez trouvé le mot "${gameState.currentWord}" !` 
        : `Partie terminée ! Le mot était "${gameState.currentWord}".`;
    
    updateMessage(message);
    
    // S'assurer qu'il n'y a pas de modales actives qui pourraient interférer
    closeModals(false);
    
    // Désactiver les écouteurs d'événements temporairement
    const disableEvents = () => {
        // Désactiver le clavier
        const keyboardButtons = document.querySelectorAll('.enigma-keyboard button');
        keyboardButtons.forEach(button => {
            button.disabled = true;
        });
        
        // Désactiver les power-ups
        const powerUps = document.querySelectorAll('.power-up');
        powerUps.forEach(powerUp => {
            powerUp.classList.add('power-up-disabled');
        });
    };
    
    // Désactiver les interactions
    disableEvents();
    
    // Un délai plus long avant d'afficher la modale
    setTimeout(() => {
        // Pré-initialiser la modale de fin de jeu
        const gameOverModal = document.getElementById('gameOverModal');
        if (gameOverModal) {
            // Forcer la classe persistent pour éviter qu'elle ne se ferme
            gameOverModal.classList.add('persistent');
        }
        
        // Afficher la modale
        showGameOver();
        
        // Garantir que la modale reste visible
        setTimeout(() => {
            if (gameOverModal) {
                gameOverModal.style.display = 'flex';
                gameOverModal.style.opacity = '1';
                gameOverModal.style.visibility = 'visible';
                gameOverModal.classList.add('show');
                gameOverModal.classList.add('persistent');
            }
        }, 100);
    }, 1000);
}

// Fonction pour afficher la modale de fin de jeu
async function showGameOver() {
    console.log("Affichage de la modale de fin de jeu");
    
    // Fermer d'abord toutes les autres modales, sauf la modale de fin de jeu
    closeModals(true);
    
    // Récupérer le nom du joueur depuis le localStorage
    const savedPlayerName = localStorage.getItem('playerName') || "";
    
    // Pré-remplir le champ de saisie du nom avec le nom sauvegardé
    const playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput) {
        playerNameInput.value = savedPlayerName;
    }
    
    // Mettre à jour les scores finaux
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalWordsFound').textContent = Math.floor(gameState.score / 10);
    
    // Récupérer et afficher le meilleur score (depuis le stockage local uniquement)
    try {
        const localScores = getLocalScores();
        if (localScores.length > 0) {
            // Trier par score décroissant
            localScores.sort((a, b) => b.score - a.score);
            document.getElementById('topScore').textContent = localScores[0].score;
        } else {
            document.getElementById('topScore').textContent = "0";
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du meilleur score:", error);
        document.getElementById('topScore').textContent = "0";
    }
    
    // Afficher la modale
    const gameOverModal = document.getElementById('gameOverModal');
    if (gameOverModal) {
        // Assurer que la modale n'est pas déjà visible
        gameOverModal.style.removeProperty('display');
        gameOverModal.style.display = 'flex';
        gameOverModal.classList.add('show');
        
        // Forcer un reflow pour s'assurer que les transitions CSS fonctionnent
        void gameOverModal.offsetWidth;
        
        // Rendre la modale visible
        gameOverModal.style.opacity = '1';
        gameOverModal.style.visibility = 'visible';
        
        // Nettoyer les anciens écouteurs d'événements pour éviter les doublons
        const modalContent = gameOverModal.querySelector('.modal-content');
        if (modalContent) {
            // Empêcher la propagation des clics depuis le contenu de la modale
            const newModalContent = modalContent.cloneNode(true);
            modalContent.parentNode.replaceChild(newModalContent, modalContent);
            
            // Empêcher la fermeture en cliquant sur la modale
            gameOverModal.onclick = function(event) {
                // Empêcher la propagation de l'événement
                event.stopPropagation();
            };
        }
        
        // Configurer le bouton de sauvegarde du score
        const submitScoreButton = gameOverModal.querySelector('#submitScoreButton');
        if (submitScoreButton) {
            submitScoreButton.disabled = false;
            submitScoreButton.textContent = 'Sauvegarder le score';
            
            submitScoreButton.onclick = function(e) {
                // Empêcher la propagation
                e.stopPropagation();
                
                const playerName = document.getElementById('playerNameInput').value.trim();
                if (!playerName) {
                    alert('Veuillez entrer votre nom avant de sauvegarder votre score.');
                    return;
                }
                
                // Désactiver le bouton pendant la sauvegarde
                submitScoreButton.disabled = true;
                submitScoreButton.textContent = 'Sauvegarde en cours...';
                
                try {
                    // Sauvegarder le nom du joueur
                    localStorage.setItem('playerName', playerName);
                    
                    // Soumettre le score (localement uniquement)
                    const scoreData = {
                        name: playerName,
                        score: gameState.score,
                        wordsFound: Math.floor(gameState.score / 10),
                        date: new Date().toISOString()
                    };
                    
                    // Sauvegarder localement
                    saveScoreLocally(scoreData);
                    
                    // Mettre à jour l'affichage des scores
                    displayLocalTopScores();
                    
                    // Mettre à jour le bouton
                    submitScoreButton.textContent = 'Score sauvegardé !';
                    submitScoreButton.disabled = true;
                } catch (error) {
                    console.error("Erreur lors de la sauvegarde du score:", error);
                    submitScoreButton.textContent = 'Erreur - Réessayer';
                    submitScoreButton.disabled = false;
                }
            };
        }
        
        // Configurer le bouton Rejouer
        const playAgainButton = gameOverModal.querySelector('#playAgainButton');
        if (playAgainButton) {
            // S'assurer que le bouton est actif
            playAgainButton.disabled = false;
            
            // Ajouter l'écouteur d'événement
            playAgainButton.onclick = function(e) {
                // Empêcher la propagation de l'événement
                e.stopPropagation();
                
                console.log("Bouton rejouer cliqué");
                
                // Sauvegarder automatiquement le nom du joueur si rempli
                const playerName = document.getElementById('playerNameInput')?.value.trim();
                if (playerName) {
                    localStorage.setItem('playerName', playerName);
                    
                    // Sauvegarder le score automatiquement
                    const scoreData = {
                        name: playerName,
                        score: gameState.score,
                        wordsFound: Math.floor(gameState.score / 10),
                        date: new Date().toISOString()
                    };
                    saveScoreLocally(scoreData);
                }
                
                // Fermer la modale
                closeModals();
                
                // Redémarrer le jeu
                startGame();
            };
        }
        
        // Configurer le bouton de fermeture
        const closeButton = gameOverModal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.onclick = function(e) {
                // Empêcher la propagation
                e.stopPropagation();
                e.preventDefault();
                
                // Fermer toutes les modales
                closeModals();
            };
        }
        
        // Focus sur le champ de saisie du nom s'il est vide
        if (playerNameInput && !playerNameInput.value) {
            playerNameInput.focus();
        }
        
        // Afficher les top scores locaux
        displayLocalTopScores();
        
        console.log("Modale de fin de jeu affichée");
    } else {
        console.error("La modale de fin de jeu n'a pas été trouvée dans le DOM");
    }
}

// Fonction pour fermer toutes les modales
function closeModals(preserveGameOver = false) {
    console.log("Fermeture des modales, preserveGameOver:", preserveGameOver);
    
    // Fermer chaque type de modale spécifiquement pour éviter les erreurs
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        // Si preserveGameOver est vrai et que c'est la modale de jeu terminé, ne pas la fermer
        if (preserveGameOver && modal.id === 'gameOverModal') {
            console.log("Modale de fin de jeu préservée");
            return;
        }
        
        if (modal) {
            modal.classList.remove('show');
            modal.classList.remove('persistent');
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            
            // Utiliser une transition plus longue pour éviter la disparition trop rapide
            setTimeout(() => {
                if (!modal.classList.contains('show')) {
                    modal.style.display = 'none';
                }
            }, 500); // Attendre la fin de la transition
        }
    });
    
    // Supprimer les overlays si présents
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    });
    
    console.log("Modales fermées");
}

// Fonction pour sauvegarder un score localement (fallback)
function saveScoreLocally(scoreData) {
    // Récupérer les scores existants
    let scores = getLocalScores();
    
    // Ajouter le nouveau score
    scores.push({
        ...scoreData,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    });
    
    // Trier les scores par ordre décroissant
    scores.sort((a, b) => b.score - a.score);
    
    // Limiter à 10 scores maximum
    if (scores.length > 10) {
        scores = scores.slice(0, 10);
    }
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('enigmaScrollScores', JSON.stringify(scores));
    
    console.log(`Score sauvegardé localement: ${scoreData.score} points, ${scoreData.wordsFound} mots trouvés, joueur: ${scoreData.name}`);
    
    // Mettre à jour l'affichage des top scores avec les scores locaux
    displayLocalTopScores();
}

// Fonction pour récupérer les scores locaux
function getLocalScores() {
    const scoresJson = localStorage.getItem('enigmaScrollScores');
    if (!scoresJson) {
        return [];
    }
    
    try {
        return JSON.parse(scoresJson);
    } catch (e) {
        console.error("Erreur lors de la récupération des scores locaux:", e);
        return [];
    }
}

// Fonction pour afficher les scores locaux
function displayLocalTopScores(scores) {
    const container = document.getElementById('top-scores-list');
    if (!container) {
        console.error("Conteneur de top scores non trouvé");
        return;
    }
    
    try {
        // Utiliser les scores fournis ou récupérer les scores locaux
        const scoresData = scores || getLocalScores();
        
        if (!scoresData || scoresData.length === 0) {
            container.innerHTML = '<p class="no-scores">Aucun score enregistré pour le moment.</p>';
            return;
        }
        
        // Trier par score décroissant si on utilise les scores locaux
        if (!scores) {
            scoresData.sort((a, b) => b.score - a.score);
        }
        
        // Limiter aux 3 meilleurs scores
        const topScores = scoresData.slice(0, 3);
        
        let html = '';
        let rank = 1;
        
        topScores.forEach(scoreData => {
            // Formater la date si disponible
            let dateStr = "";
            try {
                if (scoreData.date) {
                    const date = new Date(scoreData.date);
                    dateStr = date.toLocaleDateString();
                }
            } catch (e) {
                console.warn("Erreur lors du formatage de la date:", e);
            }
            
            html += `
                <li class="${rank === 1 ? 'top-score' : ''}">
                    <div class="rank">${rank}</div>
                    <div class="player-name">${scoreData.name || "Anonyme"}</div>
                    <div class="player-score">${scoreData.score}</div>
                    <div class="words-found">${scoreData.wordsFound} mots</div>
                </li>
            `;
            rank++;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error("Erreur lors de l'affichage des scores locaux:", error);
        container.innerHTML = '<p class="error-scores">Erreur lors du chargement des scores.</p>';
    }
}

// Fonction pour récupérer et afficher les top scores depuis Firebase
async function fetchAndDisplayTopScores() {
    try {
        // Récupérer les scores locaux
        const localScores = getLocalScores();
        
        // Trier par score décroissant
        localScores.sort((a, b) => b.score - a.score);
        
        // Limiter aux 3 meilleurs scores
        const topScores = localScores.slice(0, 3);
        
        // Afficher les scores
        displayLocalTopScores(topScores);
        
        // Tenter de récupérer les scores depuis Firebase comme bonus
        try {
            const scoresRef = db.collection('scores').doc('enigma-scroll');
            const doc = await scoresRef.get().catch(error => {
                console.warn("Impossible de récupérer les scores depuis Firebase:", error);
                throw error;
            });
            
            if (doc.exists && doc.data().scores) {
                const firebaseScores = doc.data().scores;
                
                // Si on a pu récupérer des scores Firebase, les afficher à la place
                if (firebaseScores.length > 0) {
                    // Limiter aux 3 meilleurs scores
                    const topFirebaseScores = firebaseScores.slice(0, 3);
                    displayLocalTopScores(topFirebaseScores);
                }
            }
        } catch (error) {
            console.warn("Utilisation des scores locaux uniquement:", error);
            // On a déjà affiché les scores locaux, donc rien à faire
        }
    } catch (error) {
        console.error("Erreur lors de la récupération et l'affichage des meilleurs scores:", error);
        // Afficher un message d'erreur dans la liste des scores
        const scoresListElement = document.getElementById('top-scores-list');
        if (scoresListElement) {
            scoresListElement.innerHTML = '<div class="error-scores">Impossible de charger les scores</div>';
        }
    }
}

// Sauvegarde des scores (version simplifiée qui ne tente pas de sauvegarder sur Firebase)
async function submitScore(score, wordsFound, playerName) {
    console.log(`Enregistrement du score de ${playerName}: ${score} points, ${wordsFound} mots trouvés`);
    
    try {
        // Créer l'objet score
        const scoreData = {
            name: playerName || "Anonyme",
            score: score,
            wordsFound: wordsFound,
            date: new Date().toISOString()
        };
        
        // Sauvegarder localement uniquement
        saveScoreLocally(scoreData);
        return true;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du score:", error);
        return false;
    }
}

// Fonction simplifiée qui ne tente plus d'interroger Firebase
function getTopScore() {
    try {
        const localScores = getLocalScores();
        if (localScores.length > 0) {
            // Trier par score décroissant
            localScores.sort((a, b) => b.score - a.score);
            return localScores[0].score;
        }
        return 0;
    } catch (error) {
        console.error("Erreur lors de la récupération du meilleur score:", error);
        return 0;
    }
}

// Fonction simplifiée qui utilise uniquement les scores locaux
async function fetchAndDisplayTopScores() {
    try {
        // Récupérer et afficher uniquement les scores locaux
        const localScores = getLocalScores();
        
        // Trier par score décroissant
        localScores.sort((a, b) => b.score - a.score);
        
        // Limiter aux 3 meilleurs scores
        const topScores = localScores.slice(0, 3);
        
        // Afficher les scores
        displayLocalTopScores(topScores);
    } catch (error) {
        console.error("Erreur lors de la récupération et l'affichage des meilleurs scores:", error);
        // Afficher un message d'erreur dans la liste des scores
        const scoresListElement = document.getElementById('top-scores-list');
        if (scoresListElement) {
            scoresListElement.innerHTML = '<div class="error-scores">Impossible de charger les scores</div>';
        }
    }
}

// Fonction pour évaluer une tentative
function evaluateGuess(guess) {
    const word = gameState.currentWord;
    
    let result = [];
    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        result[i] = getLetterStatus(letter, i, word);
    }
    
    return result;
}

// Fonction pour rendre la grille
function renderGrid() {
    const grid = document.getElementById('word-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let i = 0; i < gameState.maxAttempts; i++) {
        const row = document.createElement('div');
        row.className = 'word-row';
        
        for (let j = 0; j < gameState.currentWord.length; j++) {
            const cell = createCell(i, j);
            row.appendChild(cell);
        }
        
        grid.appendChild(row);
    }
}

// Fonction pour créer une cellule
function createCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'word-cell';
    
    if (row < gameState.guesses.length) {
        // Afficher les lettres des tentatives précédentes
        const { guess, result } = gameState.guesses[row];
        const letter = guess[col];
        cell.textContent = letter;
        
        // Appliquer le style en fonction du résultat
        if (result[col]) {
            cell.classList.add(result[col]);
        }
    } else if (row === gameState.guesses.length) {
        // Afficher la tentative en cours
        if (col < gameState.currentGuess.length) {
            cell.textContent = gameState.currentGuess[col].toUpperCase();
            
            // Marquer la première lettre comme correcte
            if (col === 0) {
                cell.classList.add('correct');
            }
        }
    }
    
    return cell;
}

// Fonction pour mettre à jour les couleurs du clavier
function updateKeyboardColors() {
    const keyboardButtons = document.querySelectorAll('.enigma-keyboard button');
    const letterStatus = {};
    
    // Réinitialiser les classes
    keyboardButtons.forEach(button => {
        button.classList.remove('correct', 'present', 'incorrect');
    });
    
    // Collecter le statut de chaque lettre
    gameState.guesses.forEach(({ guess, result }) => {
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i];
            const status = result[i];
            
            // Ne pas déclasser une lettre (correct > present > incorrect)
            if (!letterStatus[letter] || 
                (letterStatus[letter] === 'incorrect' && status !== 'incorrect') ||
                (letterStatus[letter] === 'present' && status === 'correct')) {
                letterStatus[letter] = status;
            }
        }
    });
    
    // Si le mot est trouvé, marquer toutes les lettres du mot comme correctes
    if (gameState.gameStatus === 'won') {
        for (let i = 0; i < gameState.currentWord.length; i++) {
            letterStatus[gameState.currentWord[i]] = 'correct';
        }
    }
    
    // Appliquer les classes
    keyboardButtons.forEach(button => {
        const letter = button.textContent;
        if (letterStatus[letter]) {
            button.classList.add(letterStatus[letter]);
        }
    });
}

// Fonction pour réinitialiser les couleurs du clavier
function resetKeyboardColors() {
    const keyboardButtons = document.querySelectorAll('.enigma-keyboard button');
    keyboardButtons.forEach(button => {
        button.classList.remove('correct', 'present', 'incorrect');
    });
}

// Fonction pour mettre à jour le message
function updateMessage(message, isError = false) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        
        // Ajouter ou supprimer la classe d'erreur
        if (isError) {
            messageElement.classList.add('message-error');
        } else {
            messageElement.classList.remove('message-error');
        }
    }
}

// Fonction pour mettre à jour le score
function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    }
}

// Fonction pour mettre à jour l'affichage des power-ups
function updatePowerUpsDisplay() {
    // Mettre à jour l'affichage du power-up d'indice
    updatePowerUpDisplay('hint-power', gameState.powerUps.hint);
    
    // Mettre à jour l'affichage du power-up de temps
    updatePowerUpDisplay('time-power', gameState.powerUps.time);
    
    // Mettre à jour l'affichage du power-up de saut
    updatePowerUpDisplay('skip-power', gameState.powerUps.skip);
}

// Fonction pour mettre à jour l'affichage d'un power-up spécifique
function updatePowerUpDisplay(id, count) {
    const powerUp = document.getElementById(id);
    if (!powerUp) return;
    
    // Mettre à jour le compteur
    let counter = powerUp.querySelector('.power-up-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'power-up-counter';
        powerUp.appendChild(counter);
    }
    counter.textContent = `x${count}`;
    
    // Désactiver le power-up si le compteur est à 0
    if (count <= 0) {
        powerUp.classList.add('power-up-disabled');
    } else {
        powerUp.classList.remove('power-up-disabled');
    }
}

// Fonction pour obtenir le statut d'une lettre
function getLetterStatus(letter, position, word) {
    // Si la lettre est à la bonne position
    if (letter === word[position]) {
        return 'correct';
    }
    
    // Si la lettre est présente dans le mot mais à une mauvaise position
    if (word.includes(letter)) {
        // Vérifier si cette lettre n'a pas déjà été comptée
        const letterCount = word.split('').filter(l => l === letter).length;
        const correctPositions = word.split('').filter((l, i) => l === letter && word[i] === letter).length;
        const previousOccurrences = gameState.currentGuess
            .slice(0, position)
            .split('')
            .filter(l => l === letter).length;
        
        if (previousOccurrences < letterCount - correctPositions) {
            return 'present';
        }
    }
    
    // Si la lettre n'est pas dans le mot ou a déjà été comptée
    return 'incorrect';
}

// Fonction pour initialiser les gestionnaires d'événements pour les modales
function initModalHandlers() {
    // Gestionnaires pour les boutons de fermeture
    const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
    if (closeButtons && closeButtons.length > 0) {
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                closeModals();
            });
        });
    }
    
    // Fermer les modales en cliquant à l'extérieur du contenu
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            // Si le clic est sur la modale elle-même (pas son contenu)
            if (event.target === modal) {
                closeModals();
            }
        });
    });
    
    // Fermer les modales avec la touche Echap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModals();
        }
    });
    
    // Ajouter un bouton d'aide dans l'interface
    const gameIntro = document.querySelector('.game-intro');
    if (gameIntro) {
        // Vérifier si le bouton d'aide existe déjà
        let helpButton = document.querySelector('.help-button');
        if (!helpButton) {
            helpButton = document.createElement('button');
            helpButton.className = 'help-button';
            helpButton.innerHTML = '<span class="help-icon">?</span> Règles du jeu';
            helpButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Bouton d'aide cliqué, affichage des règles...");
                showRulesModal();
            });
            
            // Créer un conteneur pour les boutons s'il n'existe pas déjà
            let buttonContainer = gameIntro.querySelector('.button-container');
            if (!buttonContainer) {
                buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';
                buttonContainer.style.display = 'flex';
                buttonContainer.style.justifyContent = 'center';
                buttonContainer.style.gap = '15px';
                buttonContainer.style.marginTop = '20px';
                gameIntro.appendChild(buttonContainer);
            }
            
            // Insérer le bouton d'aide et le bouton de démarrage dans le conteneur
            const startButton = document.getElementById('start-game-button');
            if (startButton && startButton.parentNode) {
                // Retirer le bouton de démarrage de son emplacement actuel
                startButton.parentNode.removeChild(startButton);
                
                // Ajouter les deux boutons au conteneur
                buttonContainer.appendChild(helpButton);
                buttonContainer.appendChild(startButton);
            } else {
                // Si le bouton de démarrage n'existe pas, ajouter simplement le bouton d'aide
                buttonContainer.appendChild(helpButton);
            }
            
            console.log("Bouton d'aide ajouté à l'interface");
        }
    } else {
        console.error("Le conteneur .game-intro n'a pas été trouvé");
    }
}

// Fonction pour afficher la modale des règles
function showRulesModal() {
    const rulesModal = document.getElementById('rulesModal');
    if (!rulesModal) {
        console.error("La modale des règles n'a pas été trouvée dans le DOM");
        return;
    }
    
    console.log("Affichage de la modale des règles...");
    
    // Fermer d'abord toutes les modales
    closeModals();
    
    // Afficher la modale des règles avec toutes les propriétés nécessaires
    rulesModal.classList.add('show');
    rulesModal.style.display = 'flex';
    rulesModal.style.opacity = '1';
    rulesModal.style.visibility = 'visible';
    
    // Ajouter un event listener pour empêcher la propagation des clics
    rulesModal.addEventListener('click', function(event) {
        // Empêcher la fermeture si le clic est à l'intérieur du contenu de la modale
        if (event.target !== rulesModal) {
            event.stopPropagation();
        }
    }, { once: false });
    
    console.log("Modale des règles affichée");
}

// Initialiser le jeu lorsque la page est chargée
document.addEventListener('DOMContentLoaded', initGame); 