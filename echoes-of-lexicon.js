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

const startButton = document.createElement('button');
startButton.id = 'start-game';
startButton.textContent = 'Start';

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

// Charger filtered_words.json depuis l'adresse spécifiée
fetch('https://www.englishquest.me/data/filtered_words.json')
    .then(response => response.json())
    .then(data => {
        // Vérifier si data.words existe et est un tableau
        if (data.words && Array.isArray(data.words)) {
            // Convertir le tableau en un objet pour une recherche rapide
            wordList = data.words.reduce((acc, word) => {
                acc[word.toLowerCase()] = true;
                return acc;
            }, {});
        } else {
            console.error("Format de JSON inattendu.");
        }

        console.log("Mots chargés :", Object.keys(wordList).length);
        initializeGame();
    })
    .catch(error => console.error("Erreur de chargement des mots :", error));

    document.addEventListener('DOMContentLoaded', () => {
        loadTopScores();
    });

// Générer des lettres avec équilibre voyelles/consonnes + bonus
function generateBalancedLetters() {
    const vowels = 'aaaaeeeeiiiioou';
    const consonants = 'bbccddffgghjkllmmnnppqrrssttvwxyzz';
    const letters = [];
    
    // Génère exactement 6 lettres principales (2 voyelles, 4 consonnes)
    for (let i = 0; i < 2; i++) {
        let vowel;
        do {
            vowel = vowels[Math.floor(Math.random() * vowels.length)];
        } while (letters.includes(vowel));
        letters.push(vowel);
    }

    for (let i = 0; i < 4; i++) {
        let consonant;
        do {
            consonant = consonants[Math.floor(Math.random() * consonants.length)];
        } while (letters.includes(consonant));
        letters.push(consonant);
    }
    
    // Génère une lettre bonus unique
    let bonus;
    do {
        bonus = (vowels + consonants)[Math.floor(Math.random() * (vowels.length + consonants.length))];
    } while (letters.includes(bonus));
    
    return { mainLetters: letters, bonusLetter: bonus };
}

function initializeGame() {
    const { mainLetters, bonusLetter: bonus } = generateBalancedLetters();
    letters = mainLetters;
    bonusLetter = bonus;
    
    otherLettersEl.innerHTML = ''; // Vide le conteneur

    letters.forEach(letter => {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter';
        letterDiv.textContent = letter.toUpperCase();
        otherLettersEl.appendChild(letterDiv);
    });

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
    timerDisplay.textContent = `Time left: ${timer}s`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
            timerDisplay.textContent = `Time left: ${timer}s`;
        } else {
            endGame();
        }
    }, 1000);
}

// Mise à jour de la fonction endGame pour gérer les scores
function endGame(success) {
    clearInterval(timerInterval);
    wordList.innerHTML = '';
    const message = success 
        ? `Congratulations! You finished with a score of ${score}!` 
        : `Game Over! Final score: ${score}`;
    messageElement.innerText = message;
    document.getElementById('start-button').style.display = 'inline-block';
    document.getElementById('start-button').innerText = 'Play Again';
    
    // Sauvegarder le score
    saveScoreToFirebase(score);
}


function resetGame() {
    score = 0;
    health = 10;
    gameActive = false;
    usedWords.clear();
    scoreDisplay.textContent = `Score: ${score}`;
    messageEl.textContent = "";
    submitWordButton.disabled = true;
    currentWordEl.disabled = true;
    currentWordEl.value = "";
    timerDisplay.textContent = `Time left: 90s`;
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
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateHealth() {
    healthBarEl.style.width = `${health * 10}%`;
    if (health <= 0) {
        endGame();
        messageEl.textContent = 'Game over! Try again.';
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
   
async function loadTopScores() {
    const db = firebase.firestore();
    const scoresRef = db.collection("echoes_of_lexicon_scores").orderBy("score", "desc").limit(10);
    const snapshot = await scoresRef.get();
    const topScoresList = document.getElementById("top-scores-list");
    topScoresList.innerHTML = "";

    snapshot.forEach(doc => {
        const scoreData = doc.data();
        const scoreItem = document.createElement("li");
        scoreItem.textContent = `${scoreData.name}: ${scoreData.score}`;
        topScoresList.appendChild(scoreItem);
    });
}

function saveScoreToFirebase(playerName, score) {
    const db = firebase.firestore();
    return db.collection("echoes_of_lexicon_scores").add({
        name: playerName,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}