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

async function getRandomWord() {
    try {
        const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
        const [word] = await response.json();
        return word.toUpperCase();
    } catch (error) {
        console.error('Error fetching word:', error);
        return 'ERROR';
    }
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

function handleCorrectGuess() {
    gameState.score += 10;  // Ajoute 10 points pour chaque mot trouvé
    updateMessage('Bravo ! Vous avez trouvé le mot ! +10 points.');
    document.getElementById("score").textContent = gameState.score;
    gameState.gameStatus = 'won';  // Marque le jeu comme gagné
    setTimeout(startNewWord, 2000);  // Lance un nouveau mot après 2 secondes
}




function handleGameOver() {
    gameState.gameStatus = 'lost';
    updateMessage(`Game Over! Le mot était ${gameState.currentWord}. Score: ${gameState.score}`);
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
    document.getElementById("message").textContent = text;
}

function addPlayAgainButton() {
    const button = document.createElement('button');
    button.textContent = "Rejouer";
    button.onclick = initGame;
    button.className = "control-button";
    document.getElementById("message").appendChild(button);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initGame);

document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    
    if (key === 'BACKSPACE') {
        handleDelete();
    } else if (key === 'ENTER') {
        handleGuess();
    } else if (/^[A-Z]$/.test(key)) {
        handleKeyInput(key);
    }
});
async function isValidWord(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        return response.ok;  // Renvoie true si le mot existe
    } catch (error) {
        console.error('Erreur lors de la vérification via l\'API:', error);
        return false;  // Si l'API échoue, on considère que le mot n'existe pas
    }
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
}

// Simplifier handleGuess
function handleGuess() {
    if (gameState.gameStatus !== 'playing') return;
    
    const cleanGuess = gameState.currentGuess.trim().toUpperCase();
    
    if (cleanGuess.length !== gameState.currentWord.length) {
        updateMessage(`Le mot doit faire ${gameState.currentWord.length} lettres !`);
        return;
    }
    
    submitGuess(cleanGuess);
}