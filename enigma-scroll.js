// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.appspot.com",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Game State
const gameState = {
    currentWord: '',
    currentGuess: '',
    guesses: [],
    gameStatus: 'playing',
    score: 0,
    maxAttempts: 6,
    usedWords: new Set()
};

const customWords = ["about", "above", "abuse", "actor", "adapt", "admit", "adopt", "adult", "after", "again", "agent", "agree", "ahead", "album", "alive", "allow", "alone", "along", "alter", "among", "anger", "angle", "angry", "apart", "apple", "apply", "argue", "arise", "armed", "Asian", "aside", "asset", "avoid", "award", "aware", "awful", "badly", "basic", "basis", "beach", "begin", "being", "below", "bench", "Bible", "birth", "black", "blade", "blame", "blind", "block", "blood", "board", "brain", "brand", "bread", "break", "brick", "brief", "bring", "broad", "brown", "brush", "build", "bunch", "buyer", "cabin", "cable", "carry", "catch", "cause", "chain", "chair", "chart", "chase", "cheap", "check", "cheek", "chest", "chief", "child", "civil", "claim", "class", "clean", "clear", "climb", "clock", "close", "cloud", "coach", "coast", "color", "couch", "could", "count", "court", "cover", "crack", "craft", "crash", "crazy", "cream", "crime", "cross", "crowd", "cycle", "daily", "dance", "death", "delay", "depth", "dirty", "doubt", "dozen", "draft", "drama", "dream", "dress", "drink", "drive", "eager", "early", "earth", "eight", "elect", "elite", "empty", "enemy", "enjoy", "enter", "entry", "equal", "error", "essay", "event", "every", "exact", "exist", "extra", "faith", "false", "fault", "favor", "fence", "fewer", "fiber", "field", "fifth", "fifty", "fight", "final", "first", "flame", "flesh", "float", "floor", "focus", "force", "forth", "found", "frame", "fresh", "front", "fruit", "fully", "funny", "ghost", "giant", "given", "glass", "glove", "grade", "grain", "grand", "grant", "grass", "grave", "great", "green", "group", "guard", "guess", "guest", "guide", "habit", "happy", "heart", "heavy", "hello", "honey", "honor", "horse", "hotel", "house", "human", "humor", "ideal", "image", "imply", "index", "inner", "Iraqi", "Irish", "issue", "joint", "judge", "juice", "knife", "knock", "label", "labor", "large", "later", "Latin", "laugh", "layer", "learn", "least", "leave", "legal", "lemon", "level", "light", "limit", "local", "loose", "lover", "lower", "lucky", "lunch", "major", "maker", "marry", "match", "maybe", "mayor", "media", "metal", "meter", "might", "minor", "model", "money", "month", "moral", "motor", "mount", "mouse", "mouth", "movie", "music", "naked", "nerve", "never", "newly", "night", "noise", "north", "novel", "nurse", "occur", "ocean", "offer", "often", "onion", "order", "other", "ought", "owner", "paint", "panel", "paper", "party", "patch", "pause", "peace", "phase", "phone", "photo", "piano", "piece", "pilot", "pitch", "place", "plane", "plant", "plate", "point", "porch", "pound", "power", "press", "price", "pride", "prime", "print", "prior", "proof", "proud", "prove", "quick", "quiet", "quite", "quote", "radio", "raise", "range", "rapid", "ratio", "reach", "react", "ready", "refer", "relax", "reply", "rifle", "right", "river", "rough", "round", "route", "rural", "salad", "sales", "sauce", "scale", "scene", "scope", "score", "seize", "sense", "serve", "seven", "shade", "shake", "shall", "shape", "share", "sharp", "sheet", "shelf", "shell", "shift", "shine", "shirt", "shock", "shoot", "shore", "short", "shout", "shrug", "sight", "since", "skill", "slave", "sleep", "slice", "slide", "small", "smart", "smell", "smile", "smoke", "solar", "solid", "solve", "sorry", "sound", "south", "space", "speak", "speed", "spend", "split", "sport", "staff", "stage", "stair", "stake", "stand", "stare", "start", "state", "steal", "steel", "stick", "still", "stock", "stone", "store", "storm", "story", "strip", "study", "stuff", "style", "sugar", "super", "swear", "sweep", "sweet", "swing", "table", "taste", "teach", "terms", "thank", "their", "theme", "there", "these", "thick", "thing", "think", "third", "those", "three", "throw", "tight", "tired", "title", "today", "tooth", "topic", "total", "touch", "tough", "tower", "trace", "track", "trade", "trail", "train", "treat", "trend", "trial", "tribe", "trick", "troop", "truck", "truly", "trust", "truth", "twice", "uncle", "under", "union", "until", "upper", "urban", "usual", "value", "video", "virus", "visit", "vital", "voice", "voter", "waste", "watch", "water", "weigh", "wheel", "where", "which", "while", "white", "whole", "whose", "woman", "works", "world", "worry", "worth", "would", "wound", "write", "wrong", "yield", "young", "yours", "youth"];

// Fonction pour obtenir un mot aléatoire à partir de la liste personnalisée
async function getRandomWord() {
    // Choisit un mot aléatoire dans la liste
    const word = customWords[Math.floor(Math.random() * customWords.length)];
    return word.toUpperCase();
}

async function initGame() {
    resetGameState();
    await startNewWord();
    loadTopScores();
}

function resetGameState() {
    gameState.score = 0;
    gameState.usedWords.clear();
    gameState.gameStatus = 'playing';
    document.getElementById("score").textContent = "0";
}

async function startNewWord() {
    resetKeyboardColors(); // Réinitialise les couleurs du clavier
    gameState.currentWord = await getRandomWord();
    gameState.currentGuess = '';
    gameState.guesses = [];
    gameState.gameStatus = 'playing';
    renderGrid();
    updateMessage('Devinez le mot ! La première lettre est révélée.');
}




function prepareNextGuess(lockedLetters) {
    // On garde les lettres correctes des essais précédents
    gameState.currentGuess = lockedLetters.join('');
}

async function getWordDefinition(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        if (response.ok) {
            const data = await response.json();
            const definition = data[0].meanings[0].definitions[0].definition;
            return definition;
        } else {
            return "Definition not found.";
        }
    } catch (error) {
        console.error("Error fetching definition:", error);
        return "Definition not available.";
    }
}

async function handleCorrectGuess() {
    gameState.score += 10;
    const definition = await getWordDefinition(gameState.currentWord);
    const translation = await getWordTranslation(gameState.currentWord);
    updateMessage(`Bravo ! Vous avez trouvé le mot : ${gameState.currentWord}. +10 points. Définition : ${definition}. Traduction : ${translation}`);
    document.getElementById("score").textContent = gameState.score;
    gameState.gameStatus = 'won';
    setTimeout(startNewWord, 2000);
}

async function handleGameOver() {
    gameState.gameStatus = 'lost';
    const definition = await getWordDefinition(gameState.currentWord);
    const translation = await getWordTranslation(gameState.currentWord);
    updateMessage(`Game Over! Le mot était ${gameState.currentWord}. Définition : ${definition}. Traduction : ${translation}. Score: ${gameState.score}`);
    promptForScore();
    addPlayAgainButton();
}


function prepareNextGuess() {
    const lastGuess = gameState.guesses[gameState.guesses.length - 1].guess;

    // Verrouille uniquement les lettres correctement placées
    const lockedLetters = Array.from(gameState.currentWord).map((letter, i) =>
        (i === 0 || lastGuess[i] === letter) ? letter : '.'
    );

    // Met à jour la tentative courante avec uniquement les lettres correctement placées
    gameState.currentGuess = lockedLetters.join('');
    renderGrid();  // Rafraîchir la grille pour que seules les lettres correctes s'affichent
}



function renderGrid() {
    const grid = document.getElementById("word-grid");
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

function createCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'word-cell';

    if (row < gameState.guesses.length) {
        // Affiche les lettres des essais précédents
        const { guess } = gameState.guesses[row];
        const letter = guess[col];
        cell.textContent = letter;

        // Applique le style aux lettres selon leur statut (correct, present, incorrect)
        setCellStyle(cell, letter, col);
    } else if (row === gameState.guesses.length) {
        // Affiche la tentative en cours
        if (col === 0) {
            cell.textContent = gameState.currentWord[0]; // Toujours afficher la première lettre
            cell.classList.add('correct'); // Marque la première lettre comme correcte
        } else {
            const currentGuessLetter = gameState.currentGuess[col];
            cell.textContent = currentGuessLetter || '.'; // Affiche les lettres validées ou des points
        }
    }

    return cell;
}



function setCellStyle(cell, letter, col) {
    if (letter === gameState.currentWord[col]) {
        cell.classList.add('correct'); // Lettre correctement placée
    } else if (gameState.currentWord.includes(letter)) {
        cell.classList.add('present'); // Lettre présente mais mal placée
    } else {
        cell.classList.add('incorrect'); // Lettre incorrecte
    }
}

function handleKeyInput(key) {
    if (gameState.gameStatus !== 'playing') return;

    const currentGuessArray = gameState.currentGuess.split('');

    // Toujours maintenir la première lettre verrouillée
    currentGuessArray[0] = gameState.currentWord[0]; 

    // Remplacer les lettres successivement après la première (index 1)
    for (let i = 1; i < gameState.currentWord.length; i++) {
        if (!currentGuessArray[i] || currentGuessArray[i] === '.') {
            currentGuessArray[i] = key;
            break;  // Arrêter après avoir ajouté une lettre
        }
    }

    gameState.currentGuess = currentGuessArray.join('');
    renderGrid();  // Mets à jour l'affichage de la grille
}



function handleDelete() {
    if (gameState.gameStatus !== 'playing') return;
    
    const currentGuessArray = gameState.currentGuess.split('');
    // Find last non-empty position that isn't the first letter of first turn
    for (let i = currentGuessArray.length - 1; i >= 0; i--) {
        if (currentGuessArray[i] && !isLetterLocked(i)) {
            currentGuessArray[i] = '';
            gameState.currentGuess = currentGuessArray.join('');
            renderGrid();
            break;
        }
    }
}

function findNextEmptyIndex() {
    const guessArray = gameState.currentGuess.split('');
    for (let i = 1; i < gameState.currentWord.length; i++) {  // On commence à l'index 1 pour ignorer la première lettre
        if (guessArray[i] === '.' || guessArray[i] === '') {
            return i;  // Trouve le premier index vide ou point
        }
    }
    return -1;
}


function findLastModifiableIndex() {
    const guessArray = gameState.currentGuess.split('');
    for (let i = gameState.currentWord.length - 1; i >= 0; i--) {
        if (!isLetterLocked(i) && guessArray[i] && guessArray[i] !== '') {
            return i;
        }
    }
    return -1;
}

function isLetterLocked(index) {
    // Only lock the first letter on the first turn
    if (gameState.guesses.length === 0 && index === 0) return true;
    return false;
}

async function promptForScore() {
    const playerName = prompt("Entrez votre nom pour sauvegarder votre score :");
    if (playerName) {
        await saveScore(playerName, gameState.score);
    }
}

async function saveScore(playerName, score) {
    try {
        await db.collection("enigma_scroll_scores").add({
            name: playerName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        await loadTopScores();
    } catch (error) {
        console.error("Error saving score: ", error);
    }
}

async function loadTopScores() {
    const topScoresElement = document.getElementById("top-scores");
    topScoresElement.innerHTML = "<h3>Top 5 Scores</h3><ul id='top-scores-list'></ul>";
    
    try {
        const querySnapshot = await db.collection("enigma_scroll_scores")
            .orderBy("score", "desc")
            .limit(5)
            .get();

        const topScoresList = document.getElementById("top-scores-list");
        topScoresList.innerHTML = "";
        querySnapshot.forEach(doc => {
            const li = document.createElement("li");
            li.textContent = `${doc.data().name}: ${doc.data().score}`;
            topScoresList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading top scores: ", error);
    }
}

function updateMessage(text) {
    const messageElement = document.getElementById("message");
    if (text.includes('Définition')) {
        messageElement.textContent = text; // Affiche la définition
    } else if (!messageElement.textContent.includes('Définition')) {
        messageElement.textContent = text; // Affiche uniquement si pas de définition
    }
}

function addPlayAgainButton() {
    const button = document.createElement('button');
    button.textContent = "Rejouer";
    button.onclick = initGame;
    button.className = "control-button";
    document.getElementById("message").appendChild(button);
}




// Fonction pour initialiser le clavier virtuel
function initializeVirtualKeyboard() {
    const keyboard = document.getElementById('keyboard');
    if (!keyboard) return;
    
    keyboard.addEventListener('click', handleButtonClick); // Ajoute un seul écouteur
}

// Gère les clics sur le clavier virtuel
function handleButtonClick(event) {
    if (gameState.gameStatus !== 'playing') return;

    const button = event.target;
    if (button.tagName === 'BUTTON') {
        const key = button.textContent;
        if (key === '←') {
            handleDelete();
        } else if (key === 'Enter') {
            handleGuess();
        } else if (/^[A-Z]$/.test(key)) {
            handleKeyInput(key);
        }
    }
}

// Fonction principale qui initialise le jeu et le clavier
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    initializeVirtualKeyboard(); // Active le clavier virtuel ici
});


// Event Listeners
document.addEventListener('DOMContentLoaded', initGame);

document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    
    if (key === 'BACKSPACE' || key === '←') {
        handleDelete();
    } else if (key === 'ENTER') {
        handleGuess();
    } else if (/^[A-Z]$/.test(key)) {
        handleKeyInput(key);
    }
});


async function isValidWord(word) {
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
function updateKeyboardColors(guess) {
    guess.split('').forEach((letter, index) => {
        const buttons = document.querySelectorAll('#keyboard button');
        buttons.forEach((button) => {
            if (button.textContent === letter) {
                button.classList.remove('correct', 'present', 'incorrect'); // Enlève les classes pour éviter les conflits

                if (letter === gameState.currentWord[index]) {
                    button.classList.add('correct'); // Lettre correctement placée
                } else if (gameState.currentWord.includes(letter)) {
                    button.classList.add('present'); // Lettre présente mais mal placée
                } else {
                    button.classList.add('incorrect'); // Lettre absente
                }
            }
        });
    });
}

function submitGuess(guess) {
    // Vérifier le mot complet
    const completeGuess = gameState.currentWord[0] + guess.slice(1);
    
    // Ajouter la tentative
    gameState.guesses.push({ guess: completeGuess });
    
    // Vérification immédiate du mot
    if (completeGuess === gameState.currentWord) {
        handleCorrectGuess();
        return;
    } 
    
    if (gameState.guesses.length >= gameState.maxAttempts) {
        handleGameOver();
        return;
    }
    
    // Préparer pour le prochain essai
    const lockedLetters = Array.from(gameState.currentWord).map((letter, i) =>
        (i === 0 || completeGuess[i] === letter) ? letter : '.'
    );
    gameState.currentGuess = lockedLetters.join('');
    
    renderGrid();

    updateKeyboardColors(guess); 
}

async function handleGuess() {
    if (gameState.gameStatus !== 'playing') return;

    const cleanGuess = gameState.currentGuess.trim().toUpperCase();

    if (cleanGuess.length !== gameState.currentWord.length) {
        updateMessage(`Le mot doit faire ${gameState.currentWord.length} lettres !`);
        return;
    }

    // Appeler la fonction pour vérifier si le mot existe via l'API
    const isValid = await isValidWord(cleanGuess);
    if (!isValid) {
        updateMessage("Ce mot n'existe pas. Réessayez !");
        return;  // Ne valide pas le mot s'il n'existe pas
    }

    // Si le mot est valide, soumets la réponse
    submitGuess(cleanGuess);
}
function resetKeyboardColors() {
    const buttons = document.querySelectorAll('#keyboard button');
    buttons.forEach(button => {
        button.classList.remove('correct', 'present', 'incorrect');
    });
}
async function getWordTranslation(word) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|fr`);
        if (response.ok) {
            const data = await response.json();
            return data.responseData.translatedText || "Translation not available.";
        } else {
            return "Translation not available.";
        }
    } catch (error) {
        console.error("Error fetching translation:", error);
        return "Translation not available.";
    }
}
