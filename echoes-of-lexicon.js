// Variables de jeu
let letters = [];
let bonusLetter = '';
let score = 0;
let health = 10;
let timer = 90;
let timerInterval;
let gameActive = false;
let usedWords = new Set();
let wordList = {}; // Stocke les mots

// Récupération des éléments DOM
const centralLetterEl = document.getElementById('central-letter');
const otherLettersEl = document.getElementById('other-letters');
const currentWordEl = document.createElement('input');
currentWordEl.id = 'current-word';
currentWordEl.type = 'text';
currentWordEl.placeholder = 'Type your word here...';

const submitWordButton = document.createElement('button');
submitWordButton.id = 'submit-word';
submitWordButton.textContent = 'Submit';
submitWordButton.className = 'quest-button';

const startButton = document.createElement('button');
startButton.id = 'start-game';
startButton.textContent = 'Start';
startButton.className = 'quest-button';

// Ajout des éléments au conteneur de contrôles
const gameControls = document.getElementById('game-controls');
gameControls.innerHTML = '';
gameControls.appendChild(currentWordEl);
gameControls.appendChild(submitWordButton);
gameControls.appendChild(startButton);

const scoreDisplay = document.getElementById('score-display');
const messageEl = document.getElementById('message');
const healthBarEl = document.getElementById('health-bar');
const timerDisplay = document.getElementById('timer-display');
const foundWordsList = document.getElementById('found-words-list');

// Charger les mots
fetch('https://www.englishquest.me/data/filtered_words.json')
    .then(response => response.json())
    .then(data => {
        if (data.words && Array.isArray(data.words)) {
            wordList = data.words.reduce((acc, word) => {
                acc[word.toLowerCase()] = true;
                return acc;
            }, {});
            console.log("Mots chargés :", Object.keys(wordList).length);
        }
    })
    .catch(error => console.error("Erreur de chargement des mots :", error));

// Générer des lettres
function generateBalancedLetters() {
    const vowels = 'aaaaeeeeiiiioou';
    const consonants = 'bbccddffgghjkllmmnnppqrrssttvwxyzz';
    const letters = [];
    
    // 2 voyelles, 4 consonnes
    for (let i = 0; i < 2; i++) {
        letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    for (let i = 0; i < 4; i++) {
        letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
    }
    
    // Lettre bonus
    const bonus = (Math.random() < 0.5 ? vowels : consonants)[Math.floor(Math.random() * (Math.random() < 0.5 ? vowels.length : consonants.length))];
    
    return { mainLetters: letters, bonusLetter: bonus };
}

// Initialiser le jeu
function initializeGame() {
    const { mainLetters, bonusLetter: bonus } = generateBalancedLetters();
    letters = mainLetters;
    bonusLetter = bonus;
    
    otherLettersEl.innerHTML = '';
    
    // Afficher les lettres principales
    letters.forEach(letter => {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter';
        letterDiv.textContent = letter.toUpperCase();
        otherLettersEl.appendChild(letterDiv);
    });

    // Afficher la lettre bonus
    const bonusLetterDiv = document.createElement('div');
    bonusLetterDiv.className = 'letter bonus';
    bonusLetterDiv.textContent = bonusLetter.toUpperCase();
    otherLettersEl.appendChild(bonusLetterDiv);

    updateScore();
    updateHealth();
}

// Fonction de validation des mots
function isValidWord(word) {
    if (!word || word.length < 3) return false;
    word = word.toLowerCase().trim();

    // Vérifie que le mot est dans wordList et n'a pas été utilisé
    if (!wordList[word] || usedWords.has(word)) return false;

    // Vérifie que le mot peut être formé avec les lettres affichées
    const availableLetters = [...letters, bonusLetter];
    const letterCount = {};

    // Compte les occurrences de chaque lettre dans availableLetters
    availableLetters.forEach(letter => {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    });

    // Vérifie chaque lettre du mot pour voir si elle est disponible
    for (const letter of word) {
        if (!letterCount[letter]) return false;
        letterCount[letter]--;
    }

    return true;
}

// Démarrer le timer
function startTimer() {
    timer = 90;
    updateTimer();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        updateTimer();
        if (timer <= 0) endGame(false);
    }, 1000);
}

// Mise à jour de la fonction endGame pour gérer les scores
function endGame(success) {
    clearInterval(timerInterval);
    otherLettersEl.innerHTML = '';
    const message = success 
        ? `Congratulations! You finished with a score of ${score}!` 
        : `Game Over! Final score: ${score}`;
    messageEl.innerText = message;
    document.getElementById('start-game').style.display = 'inline-block';
    document.getElementById('start-game').innerText = 'Play Again';
    
    // Sauvegarder le score
    saveScoreToFirebase(score);
}

function resetGame() {
    score = 0;
    health = 10;
    gameActive = false;
    usedWords.clear();
    updateScore();
    messageEl.textContent = "";
    submitWordButton.disabled = true;
    currentWordEl.disabled = true;
    currentWordEl.value = "";
    foundWordsList.innerHTML = "";
    updateHealth();
}

function startGame() {
    resetGame();
    gameActive = true;
    submitWordButton.disabled = false;
    currentWordEl.disabled = false;
    initializeGame();
    startTimer();
    messageEl.textContent = "Game started! Good luck!";
}

// Soumettre un mot
async function submitWord() {
    if (!gameActive) return;

    const word = currentWordEl.value.toLowerCase().trim();
    if (isValidWord(word)) {
        usedWords.add(word);

        // Calcul des points
        let points = word.length;
        if (word.includes(bonusLetter)) {
            points *= 3;
        }
        score += points;

        // Appel à l'API pour récupérer la définition
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = await response.json();
            const definition = Array.isArray(data) ? data[0].meanings[0].definitions[0].definition : "No definition available.";
            messageEl.textContent = `Correct! +${points} points. Definition: ${definition}`;
        } catch (error) {
            console.error("Error fetching definition:", error);
            messageEl.textContent = `Correct! +${points} points. Definition: Not available.`;
        }

        updateScore();
    } else {
        score -= 1;
        health -= 1;
        messageEl.textContent = 'Invalid word!';
        updateHealth();
        updateScore();
    }
    currentWordEl.value = '';
}

function updateScore() {
    scoreDisplay.innerHTML = `<span>Score: ${score}</span>`;
}

function updateHealth() {
    healthBarEl.style.width = `${health * 10}%`;
    if (health <= 0) {
        endGame(false);
    }
}

// Événements
submitWordButton.addEventListener('click', submitWord);
currentWordEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitWord();
});
startButton.addEventListener('click', startGame);

// Fonction pour sauvegarder le score dans Firebase
function saveScoreToFirebase(finalScore) {
    const playerName = localStorage.getItem('playerName') || prompt("Enter your name for the leaderboard:");
    if (playerName) {
        localStorage.setItem('playerName', playerName);
        db.collection("echoes_of_lexicon_scores").add({
            name: playerName,
            score: finalScore,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("Score saved successfully");
            loadTopScores();
        })
        .catch((error) => {
            console.error("Error saving score:", error);
        });
    }
}

function loadTopScores() {
    const topScoresContainer = document.getElementById('top-scores');
    topScoresContainer.innerHTML = '<h3>Top Scores</h3>';
    const scoresList = document.createElement('ul');
    scoresList.id = 'top-scores-list';
    topScoresContainer.appendChild(scoresList);

    db.collection("echoes_of_lexicon_scores")
        .orderBy("score", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
            scoresList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const scoreData = doc.data();
                const scoreItem = document.createElement('li');
                scoreItem.textContent = `${scoreData.name}: ${scoreData.score}`;
                scoresList.appendChild(scoreItem);
            });
        })
        .catch((error) => {
            console.error("Error loading top scores:", error);
            scoresList.innerHTML = '<li>Error loading scores</li>';
        });
}

// Fonction pour mettre à jour le timer
function updateTimer() {
    timerDisplay.innerHTML = `<span>Time: ${timer}s</span>`;
}

// Fonction pour ajouter un mot trouvé
function addFoundWord(word) {
    const wordElement = document.createElement('div');
    wordElement.className = 'found-word';
    wordElement.textContent = word;
    foundWordsList.appendChild(wordElement);
}

// Style pour les top scores
function updateTopScores(scores) {
    const topScoresList = document.getElementById('top-scores-list');
    topScoresList.innerHTML = '';
    scores.forEach(score => {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'bg-black/40 p-4 rounded border border-quest-blue/30 text-quest-blue';
        scoreElement.textContent = `${score.name}: ${score.score}`;
        topScoresList.appendChild(scoreElement);
    });
}

// Initialisation
resetGame();

// À la fin du fichier, après resetGame()
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    loadTopScores();
});