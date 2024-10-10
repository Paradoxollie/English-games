// Configuration Firebase
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

// Game variables
let currentLevel = 1;
let score = 0;
let timer;
let currentVerb;
let skippedVerbs = [];

// DOM elements
const verbDisplay = document.getElementById('verb-display');
const verbTranslation = document.getElementById('verb-translation');
const inputContainer = document.getElementById('input-container');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const skippedVerbsContainer = document.getElementById('skipped-verbs');
const skippedVerbsList = document.getElementById('skipped-verbs-list');

// Event listeners
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('check-answer').addEventListener('click', checkAnswer);
document.getElementById('skip').addEventListener('click', skipVerb);
document.getElementById('level-1').addEventListener('click', () => setLevel(1));
document.getElementById('level-2').addEventListener('click', () => setLevel(2));
document.getElementById('level-3').addEventListener('click', () => setLevel(3));

// Game functions
function startGame() {
    // Reset game state
    score = 0;
    skippedVerbs = [];
    updateScore();
    clearInterval(timer);
    
    // Start timer
    let timeLeft = 90;
    timerDisplay.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Display first verb
    displayNewVerb();
}

function displayNewVerb() {
    // TODO: Implement verb selection logic
    // For now, we'll use a placeholder
    currentVerb = {
        infinitive: "to go",
        translation: "aller",
        pastSimple: "went",
        pastParticiple: "gone"
    };

    verbDisplay.textContent = currentVerb.infinitive;
    verbTranslation.textContent = currentVerb.translation;

    // Clear previous inputs
    inputContainer.innerHTML = '';

    // Create input fields
    const pastSimpleInput = createInputField("Past Simple");
    const pastParticipleInput = createInputField("Past Participle");

    inputContainer.appendChild(pastSimpleInput);
    inputContainer.appendChild(pastParticipleInput);
}

function createInputField(label) {
    const div = document.createElement('div');
    const labelElement = document.createElement('label');
    labelElement.textContent = label + ": ";
    const input = document.createElement('input');
    input.type = 'text';
    div.appendChild(labelElement);
    div.appendChild(input);
    return div;
}

function checkAnswer() {
    const inputs = inputContainer.querySelectorAll('input');
    const pastSimple = inputs[0].value.trim().toLowerCase();
    const pastParticiple = inputs[1].value.trim().toLowerCase();

    if (pastSimple === currentVerb.pastSimple && pastParticiple === currentVerb.pastParticiple) {
        score += currentLevel;
        updateScore();
        displayNewVerb();
    } else {
        // TODO: Implement incorrect answer feedback
        console.log("Incorrect answer");
    }
}

function skipVerb() {
    skippedVerbs.push(currentVerb);
    updateSkippedVerbsList();
    displayNewVerb();
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateSkippedVerbsList() {
    skippedVerbsContainer.style.display = 'block';
    const li = document.createElement('li');
    li.textContent = `${currentVerb.infinitive} (${currentVerb.translation})`;
    skippedVerbsList.appendChild(li);
}

function setLevel(level) {
    currentLevel = level;
    // TODO: Implement level-specific logic if needed
}

function endGame() {
    clearInterval(timer);
    // TODO: Implement end game logic (save score, display final score, etc.)
    saveScore(score);
    loadTopScores();
}

function saveScore(score) {
    const playerName = localStorage.getItem('playerName') || prompt("Enter your name for the leaderboard:");
    if (playerName) {
        localStorage.setItem('playerName', playerName);
        db.collection("speed_verb_challenge_scores").add({
            name: playerName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("Score saved successfully");
            loadTopScores();
        })
        .catch((error) => {
            console.error("Error saving score: ", error);
        });
    }
}

function loadTopScores() {
    db.collection("speed_verb_challenge_scores")
        .orderBy("score", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const li = document.createElement("li");
                li.textContent = `${doc.data().name}: ${doc.data().score}`;
                topScoresList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Error loading top scores: ", error);
        });
}

// Load top scores when the page loads
document.addEventListener('DOMContentLoaded', loadTopScores);