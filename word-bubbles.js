// Variables de jeu
const gameContainer = document.getElementById('word-box');
const scoreDisplay = document.getElementById('score-display');
const wordInput = document.getElementById('current-word');
const submitButton = document.getElementById('submit-word');
const startResetButton = document.getElementById('start-reset');
const messageDisplay = document.getElementById('message');
const topScoresList = document.getElementById('top-scores-list');

let score = 0;
let gameRunning = false;
let usedWords = new Set();
let currentLetters = '';
let gameInterval; // Contrôle de la génération des bulles
let fallingBubbles = []; // Suivi des bulles en chute

// Fonction pour choisir une lettre en fonction de sa fréquence
const letterFrequencies = {
    A: 8, B: 2, C: 3, D: 4, E: 9, F: 2, G: 2, H: 2, I: 7,
    J: 1, K: 1, L: 4, M: 3, N: 6, O: 6, P: 2, Q: 1, R: 6,
    S: 7, T: 8, U: 3, V: 1, W: 2, X: 1, Y: 2, Z: 1
};

function chooseLetter() {
    const letterPool = Object.entries(letterFrequencies)
        .flatMap(([letter, frequency]) => Array(frequency).fill(letter));
    return letterPool[Math.floor(Math.random() * letterPool.length)];
}

// Fonction pour créer une bulle
function createBubble(letter) {
    const bubble = document.createElement('div');
    bubble.classList.add('word');
    bubble.textContent = letter;
    const xPosition = Math.random() * (gameContainer.clientWidth - 50);
    bubble.style.left = `${xPosition}px`;
    bubble.style.top = `-50px`;

    gameContainer.appendChild(bubble);
    currentLetters += letter;
    fallingBubbles.push(bubble); // Ajouter la bulle à la liste des bulles en chute

    let fallSpeed = 1;
    const fallAnimation = setInterval(() => {
        let currentTop = parseFloat(bubble.style.top);
        if (currentTop < gameContainer.clientHeight - 50) {
            bubble.style.top = `${currentTop + fallSpeed}px`;
        } else {
            clearInterval(fallAnimation);
            gameOver();  // Arrête le jeu si une bulle atteint le bas
        }
    }, 50);
}

function generateBubbles() {
    const randomLetter = chooseLetter();
    createBubble(randomLetter);
}

// Fonction pour vérifier les mots soumis
function checkWord() {
    const submittedWord = wordInput.value.toLowerCase();
    const firstLetter = submittedWord.charAt(0).toUpperCase();

    // Ne pas accepter les mots de moins de 3 lettres
    if (submittedWord.length < 3) {
        messageDisplay.style.color = 'red';
        messageDisplay.textContent = "Words must be at least 3 letters long!";
        wordInput.value = '';
        return;
    }

    // Vérifie si le mot commence par une lettre valide
    if (!currentLetters.includes(firstLetter)) {
        messageDisplay.style.color = 'red';
        messageDisplay.textContent = 'The word does not start with a valid letter!';
        wordInput.value = '';
        return;
    }

    // Vérifie si le mot a déjà été utilisé
    if (usedWords.has(submittedWord + firstLetter)) {
        messageDisplay.style.color = 'red';
        messageDisplay.textContent = 'Word already used for this letter!';
        wordInput.value = '';
        return;
    }

    // Vérifie la validité du mot via l'API et filtre par catégories
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${submittedWord}`)
        .then(response => response.json())
        .then(data => {
            if (data.title !== "No Definitions Found") {
                score += 10 * submittedWord.length;
                scoreDisplay.textContent = `Score: ${score}`;
                usedWords.add(submittedWord + firstLetter);
                wordInput.value = '';
                messageDisplay.textContent = '';  // Réinitialise le message en cas de succès
                removeUsedLetters(firstLetter); // Supprimer les bulles avec la lettre correspondante
                currentLetters = currentLetters.replace(firstLetter, ''); // Retirer la lettre utilisée
            } else {
                messageDisplay.style.color = 'red';
                messageDisplay.textContent = 'Invalid word!';
            }
        })
        .catch(error => {
            console.error('Error fetching from Dictionary API:', error);
            messageDisplay.style.color = 'red';
            messageDisplay.textContent = 'Error with Dictionary API';
        });
}

function removeUsedLetters(letter) {
    fallingBubbles = fallingBubbles.filter(bubble => {
        if (bubble.textContent === letter) {
            gameContainer.removeChild(bubble);
            return false;
        }
        return true;
    });
}

function gameOver() {
    clearInterval(gameInterval); // Arrête la génération des bulles
    messageDisplay.textContent = `Game Over! Your score is ${score}.`;
    gameRunning = false;

    // Demander le nom du joueur pour enregistrer le score
    saveScoreToFirebase(score);
}

function saveScoreToFirebase(score) {
    const playerName = prompt("Enter your name to save your score:");
    if (playerName) {
        db.collection("word_bubbles_scores").add({
            name: playerName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            loadTopScores(); // Recharge les scores
            resetGame(); // Réinitialise le jeu après enregistrement
        });
    }
}

function loadTopScores() {
    topScoresList.innerHTML = "";
    db.collection("word_bubbles_scores").orderBy("score", "desc").limit(10)
        .get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const li = document.createElement("li");
                li.textContent = `${doc.data().name}: ${doc.data().score}`;
                topScoresList.appendChild(li);
            });
        });
}

// Démarre le jeu
function startGame() {
    gameRunning = true;
    score = 0;
    usedWords.clear();
    fallingBubbles = [];
    scoreDisplay.textContent = `Score: 0`;
    messageDisplay.textContent = '';
    currentLetters = '';

    // Génération régulière des bulles toutes les 3 secondes
    generateBubbles();
    gameInterval = setInterval(generateBubbles, 3000);
}

// Réinitialise le jeu
function resetGame() {
    gameContainer.innerHTML = '';
    if (gameRunning) {
        clearInterval(gameInterval);
    }
    startGame();
}

// Écouteurs d'événements
submitButton.addEventListener('click', checkWord);
startResetButton.addEventListener('click', () => {
    if (!gameRunning) {
        startGame();
    } else {
        resetGame();
    }
});
wordInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        checkWord();
    }
});
