// Variables de jeu
const gameContainer = document.getElementById('word-box');
const scoreDisplay = document.getElementById('score-display');
const wordInput = document.getElementById('current-word');
const submitButton = document.getElementById('submit-word');
const startResetButton = document.getElementById('start-reset');
const messageDisplay = document.getElementById('message');
const topScoresList = document.getElementById('top-scores-list');
const modeSelect = document.getElementById('game-mode');

let score = 0;
let gameRunning = false;
let usedWords = new Set();
let currentLetters = '';
let gameInterval;
let fallingBubbles = [];
let bubbleAnimations = new Map();
let baseSpeed = 1;
let speedMultiplier = 1;
let gameStartTime;
let gameMode = 'normal';

// Initialisation du mode de jeu
modeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    if (gameRunning) resetGame();
});

// Fonction pour obtenir un mot aléatoire et sa définition via une API
async function fetchRandomWord() {
    try {
        // Étape 1 : Obtenir un mot aléatoire avec l'API de mots aléatoires
        const wordResponse = await fetch('https://random-word-api.herokuapp.com/word?number=1');
        const [word] = await wordResponse.json();

        // Étape 2 : Obtenir la définition du mot via DictionaryAPI
        const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const definitionData = await definitionResponse.json();

        // Vérifie si une définition existe pour le mot
        let definition = "Définition introuvable.";
        if (Array.isArray(definitionData) && definitionData[0]?.meanings[0]?.definitions[0]?.definition) {
            definition = definitionData[0].meanings[0].definitions[0].definition;
        }

        return { word, definition };
    } catch (error) {
        console.error('Erreur lors de la récupération du mot ou de la définition:', error);
        return { word: null, definition: null };
    }
}


function updateSpeed() {
    const gameTimeInSeconds = (Date.now() - gameStartTime) / 1000;
    speedMultiplier = 1 + (gameTimeInSeconds / 60) * 0.3; // Modifie ici pour ralentir
    return baseSpeed * speedMultiplier;
}

// Choisit une lettre aléatoire pour le mode Normal
// Fréquences des lettres proportionnelles au nombre de mots possibles
const letterFrequencies = {
    A: 20, B: 8, C: 12, D: 10, E: 25, F: 6, G: 8, H: 8, I: 18,
    J: 2, K: 4, L: 12, M: 10, N: 15, O: 15, P: 10, Q: 2, R: 15,
    S: 18, T: 15, U: 8, V: 4, W: 6, X: 2, Y: 6, Z: 2
};
function chooseLetter() {
    const letterPool = Object.entries(letterFrequencies)
        .flatMap(([letter, frequency]) => Array(frequency).fill(letter));
    return letterPool[Math.floor(Math.random() * letterPool.length)];
}

// Crée une bulle avec une lettre ou un mot selon le mode de jeu
async function createBubble() {
    if (!gameRunning) return;

    const bubble = document.createElement('div');
    bubble.classList.add('word');
    
    if (gameMode === 'training') {
        const wordData = await fetchRandomWord();
        if (!wordData) return;
        
        const { word, definition } = wordData;
        bubble.textContent = word;
        bubble.dataset.word = word;
        bubble.dataset.definition = definition;
        bubble.style.fontSize = '20px';
        bubble.style.padding = '10px 15px';
        bubble.style.minWidth = '100px';
    } else {
        const letter = chooseLetter();
        bubble.textContent = letter;
        bubble.dataset.word = letter;
        bubble.style.fontSize = '24px';
        bubble.style.padding = '10px 20px';
    }

    const bubbleWidth = gameMode === 'training' ? 150 : 50;
    const maxX = gameContainer.clientWidth - bubbleWidth;
    bubble.style.left = `${Math.max(0, Math.min(maxX, Math.random() * maxX))}px`;
    bubble.style.top = `-50px`;

    gameContainer.appendChild(bubble);
    if (gameMode === 'normal') currentLetters += bubble.dataset.word;
    fallingBubbles.push(bubble);

    startBubbleAnimation(bubble);
}

// Animation de descente de la bulle
function startBubbleAnimation(bubble) {
    let currentSpeed = updateSpeed();
    const fallAnimation = setInterval(() => {
        if (!gameRunning) {
            clearInterval(fallAnimation);
            return;
        }

        currentSpeed = updateSpeed();
        const currentTop = parseFloat(bubble.style.top);
        const containerHeight = gameContainer.clientHeight;

        if (currentTop < containerHeight - 50) {
            bubble.style.top = `${currentTop + currentSpeed * (gameMode === 'training' ? 0.7 : 1)}px`;
        } else {
            clearInterval(fallAnimation);
            if (gameRunning) gameOver();
        }
    }, 50);

    bubbleAnimations.set(bubble, fallAnimation);
}

// Génère les bulles selon le mode
async function generateBubbles() {
    if (gameRunning) await createBubble();
}

// Vérifie si le mot saisi est correct
async function checkWord() {
    if (!gameRunning) return;
    const submittedWord = wordInput.value.trim().toLowerCase();
    wordInput.value = '';

    if (gameMode === 'training') {
        const matchingBubble = fallingBubbles.find(bubble => 
            bubble.dataset.word.toLowerCase() === submittedWord
        );
        
        if (matchingBubble) {
            const wordScore = Math.pow(submittedWord.length, 1.5) * 10;
            if (gameMode !== 'training') score += Math.floor(wordScore)
            scoreDisplay.textContent = `Score: ${score}`;
            
            showMessage(`+${Math.floor(wordScore)} points! Definition: ${matchingBubble.dataset.definition}`, '#4CAF50', 5000);
            removeUsedBubble(matchingBubble.dataset.word);
        } else {
            showMessage("Mot incorrect !", 'red');
        }
    } else {
        if (submittedWord.length < 3) {
            showMessage("Les mots doivent contenir au moins 3 lettres !", 'red');
            return;
        }
        const firstLetter = submittedWord.charAt(0).toUpperCase();
        if (!currentLetters.includes(firstLetter)) {
            showMessage("Utilisez une des lettres en descente!", 'red');
            return;
        }

        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${submittedWord}`);
        const data = await response.json();
        if (Array.isArray(data)) {
            handleValidWord(submittedWord, firstLetter);
        } else {
            showMessage("Mot non valide en anglais!", 'red');
        }
    }
}

// Gère un mot correct
function handleValidWord(word, firstLetter) {
    if (usedWords.has(word)) {
        showMessage("Mot déjà utilisé!", 'red');
        return;
    }
    usedWords.add(word);
    
    removeUsedBubble(firstLetter);
    currentLetters = currentLetters.replace(firstLetter, '');

    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;
    showMessage("+10 points!", '#4CAF50');
}

// Supprime une bulle utilisée en mode normal ou training
function removeUsedBubble(content) {
    fallingBubbles = fallingBubbles.filter(bubble => {
        if (bubble.dataset.word === content || bubble.textContent === content) {
            const animation = bubbleAnimations.get(bubble);
            clearInterval(animation);
            gameContainer.removeChild(bubble);
            return false;
        }
        return true;
    });
}

// Montre un message temporaire
function showMessage(text, color = 'white', duration = 2000) {
    messageDisplay.style.color = color;
    messageDisplay.textContent = text;
    setTimeout(() => {
        if (gameRunning) messageDisplay.textContent = '';
    }, duration);
}

// Démarre le jeu
function startGame() {
    gameContainer.innerHTML = '';
    gameRunning = true;
    score = 0;
    usedWords.clear();
    currentLetters = '';
    baseSpeed = 1;
    gameStartTime = Date.now();

    scoreDisplay.textContent = 'Score: 0';
    messageDisplay.textContent = '';
    loadTopScores(); // Garde cette ligne

    generateBubbles();
    gameInterval = setInterval(generateBubbles, 3000);
}
// Ajoutez aussi une mise à jour des scores lors du changement de mode :
if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
        if (gameRunning) {
            if (confirm("Changing mode will reset the current game. Continue?")) {
                gameMode = e.target.value;
                resetGame();
            } else {
                e.target.value = gameMode;
            }
        } else {
            gameMode = e.target.value;
            loadTopScores(); // Ajouter cette ligne pour mettre à jour les scores quand on change de mode
        }
    });
}
// Réinitialise le jeu
function resetGame() {
    gameContainer.innerHTML = '';
    gameRunning = false;
    fallingBubbles = [];
    clearInterval(gameInterval);
    startGame();
}

// Fin du jeu
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    saveScoreToFirebase(score);
    showMessage(`Fin du jeu ! Score final : ${score}`, 'white', 0);
}

// Sauvegarde le score dans Firebase
function saveScoreToFirebase(finalScore) {
    const playerName = prompt("Enter your name to save your score:");
    if (!playerName) return;

    if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();

        db.collection("word_bubbles_scores").add({
            name: playerName,
            score: finalScore,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            mode: gameMode
        })
        .then(() => loadTopScores())
        .catch((error) => console.error("Erreur en sauvegardant le score:", error));
    }
}

// Charge les meilleurs scores
function loadTopScores() {
    const topScoresList = document.getElementById('top-scores-list');
    if (!topScoresList) return;

    if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();

        // Version simplifiée en attendant la création de l'index
        db.collection("word_bubbles_scores")
            .orderBy("score", "desc")
            .limit(10)
            .get()
            .then((querySnapshot) => {
                topScoresList.innerHTML = `<h3>Top Scores (${gameMode} mode)</h3>`;

                if (querySnapshot.empty) {
                    const li = document.createElement("li");
                    li.textContent = "Aucun score";
                    topScoresList.appendChild(li);
                    return;
                }

                // Filtrer les scores par mode côté client
                const scores = [];
                querySnapshot.forEach((doc) => {
                    const scoreData = doc.data();
                    if (scoreData.mode === gameMode) {
                        scores.push(scoreData);
                    }
                });

                scores.sort((a, b) => b.score - a.score).slice(0, 10).forEach(scoreData => {
                    const li = document.createElement("li");
                    li.textContent = `${scoreData.name}: ${scoreData.score}`;
                    topScoresList.appendChild(li);
                });

                if (scores.length === 0) {
                    const li = document.createElement("li");
                    li.textContent = "Aucun score pour ce mode";
                    topScoresList.appendChild(li);
                }
            })
            .catch((error) => {
                console.error("Erreur en chargeant les scores:", error);
                topScoresList.innerHTML = "<h3>Top Scores</h3><li>Erreur de chargement des scores</li>";
            });
    } else {
        topScoresList.innerHTML = "<h3>Top Scores</h3><li>Scores indisponibles</li>";
    }
}
// Événements
submitButton.addEventListener('click', checkWord);
startResetButton.addEventListener('click', () => gameRunning ? resetGame() : startGame());
wordInput.addEventListener('keydown', (e) => e.key === 'Enter' && checkWord());


document.addEventListener('DOMContentLoaded', () => {
    loadTopScores(); // Charge les scores au chargement de la page
});