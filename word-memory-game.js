// Désactiver la console
console.log = console.warn = console.error = function() {};

// Tentative de détection et de blocage des outils de développement
setInterval(function(){
    debugger;
}, 100);

// Commencer directement avec les variables du jeu
let level = 1;
let score = 0;
let timeLeft = 30;
let timerInterval;
let currentWords = [];
let isGameRunning = false;

// Utiliser l'instance db globale de firebase-init.js
const db = firebase.firestore();

const wordBank = [
    "time", "person", "year", "thing", "world", "life", "hand", "part", "child", "eye",
    "woman", "place", "work", "week", "case", "point", "government", "company", "number", "group",
    "problem", "fact", "night", "house", "water", "mother", "father", "country", "school", "family",
    "system", "question", "friend", "state", "story", "money", "market", "policy", "study", "issue",
    "result", "body", "reason", "moment", "history", "social", "office", "power", "order", "change",
    "force", "morning", "value", "health", "decision", "process", "sense", "service", "area", "table",
    "center", "condition", "control", "knowledge", "research", "evidence", "action", "position", "effect", "society",
    "minute", "quality", "project", "chance", "example", "product", "teacher", "choice", "development", "language",
    "purpose", "nature", "opinion", "technology", "subject", "culture", "practice", "truth", "meaning", "energy",
    "difference", "future", "community", "opportunity", "experience", "ability", "movement", "moment", "direction", "situation",
    "management", "character", "interest", "communication", "education", "responsibility", "understanding", "relationship", "knowledge", "improvement",
    "economy", "population", "president", "industry", "experience", "opinion", "analysis", "security", "strategy", "customer",
    "individual", "discussion", "government", "investment", "knowledge", "education", "performance", "environment", "technology", "situation", "development",
    "understanding", "communication", "relationship", "application", "responsibility", "organization", "perspective", "community", "leadership", "motivation",
    "difference", "influence", "expression", "improvement", "measurement", "opportunity", "conclusion", "inspiration", "direction", "comparison",
    "expectation", "reflection", "experience", "realization", "negotiation", "interaction", "perception", "generation", "recognition", "observation",
    "recommendation", "innovation", "presentation", "appreciation", "satisfaction", "celebration", "interpretation", "participation", "definition", "explanation",
    "representation", "contribution", "cooperation", "evaluation", "identification", "simplification", "clarification", "modification", "acceleration", "confirmation",
    "implementation", "transformation", "participation", "complication", "organization", "collaboration", "administration", "regulation", "standardization", "verification",
    "appreciation", "investigation", "documentation", "specification", "classification", "illustration", "authentication", "interpretation", "conversation", "publication",
    "destination", "manifestation", "reproduction", "notification", "intervention", "qualification", "constitution", "determination", "revolution", "elaboration",
    "agreement", "attention", "attitude", "behavior", "challenge", "collection", "competition", "connection", "creativity", "curiosity",
    "decision", "direction", "discovery", "education", "efficiency", "emotion", "employment", "entertainment", "equipment", "evaluation",
    "excitement", "expectation", "explanation", "flexibility", "foundation", "friendship", "frustration", "function", "generation", "happiness",
    "imagination", "importance", "impression", "independence", "information", "innovation", "inspiration", "interaction", "investment", "invitation",
    "leadership", "limitation", "management", "motivation", "movement", "negotiation", "observation", "opportunity", "organization", "participation",
    "performance", "perception", "permission", "perspective", "possibility", "preparation", "presentation", "prevention", "productivity", "profession",
    "progress", "protection", "publication", "qualification", "reaction", "realization", "recommendation", "reflection", "relationship", "relaxation",
    "reliability", "reputation", "requirement", "resolution", "resource", "responsibility", "satisfaction", "situation", "solution", "stability",
    "structure", "substance", "suggestion", "supervision", "support", "technology", "tendency", "tension", "tradition", "transformation",
    "understanding", "university", "variation", "verification", "victory", "visibility", "volunteer", "wonder", "workshop", "youth"

];

let maxLevel = 10;
let wordsToRemember = [];

function resetGame() {
    console.log("Resetting game...");
    clearInterval(timerInterval);
    wordsToRemember = [];
    document.getElementById("level").innerText = level;
    document.getElementById("message").innerText = "";
    document.getElementById("word-list").innerHTML = "";
    document.getElementById("input-container").innerHTML = "";
    console.log("Game reset complete.");
}

function startGame() {
    console.log("Starting game...");
    console.log("Current level:", level);
    console.log("Current score:", score);
    
    resetGame();
    
    const wordListElement = document.getElementById("word-list");
    const inputContainerElement = document.getElementById("input-container");
    const startButtonElement = document.getElementById("start-button");
    const checkButtonElement = document.getElementById("check-button");
    const timeLeftElement = document.getElementById("time-left");
    
    if (wordListElement) wordListElement.style.display = "block";
    if (inputContainerElement) inputContainerElement.style.display = "none";
    if (startButtonElement) startButtonElement.style.display = "none";
    if (checkButtonElement) checkButtonElement.style.display = "none";

    const wordCount = Math.min(level + 2, 15);
    console.log(`Generating ${wordCount} words for level ${level}`);
    wordsToRemember = generateWords(wordCount);
    console.log("Words to remember:", wordsToRemember);
    
    if (wordListElement) {
        wordListElement.innerHTML = wordsToRemember.map((word, index) => {
            return `<span class="memory-word">${word}</span>`;
        }).join('');
    }
    if (timeLeftElement) timeLeftElement.innerText = "20";
    
    updateScore(); // Assurez-vous que le score est correctement affiché
    startTimer(20);
    console.log("Game started successfully. Score:", score);
}
  
function generateWords(count) {
    let words = [];
    while (words.length < count) {
        const randomIndex = Math.floor(Math.random() * wordBank.length);
        const word = wordBank[randomIndex];
        if (!words.includes(word)) {
            words.push(word);
        }
    }
    return words;
}
  
function hideWords() {
    console.log("Hiding words and showing input boxes");
    clearInterval(timerInterval);
    
    const timeLeftElement = document.getElementById("time-left");
    const wordListElement = document.getElementById("word-list");
    const gameContainer = document.getElementById("game-container");
    
    if (timeLeftElement) timeLeftElement.innerText = "0";
    if (wordListElement) wordListElement.style.display = "none";
    
    // Créer ou réinitialiser le conteneur d'entrée
    let inputContainerElement = document.getElementById("input-container");
    if (!inputContainerElement) {
        inputContainerElement = document.createElement("div");
        inputContainerElement.id = "input-container";
        gameContainer.appendChild(inputContainerElement);
    }
    inputContainerElement.style.display = "block";
    inputContainerElement.innerHTML = ''; // Nettoyer le contenu existant
    
    // Créer la div pour les boîtes d'entrée
    const inputBoxesElement = document.createElement("div");
    inputBoxesElement.id = "input-boxes";
    inputContainerElement.appendChild(inputBoxesElement);
    
    // Créer le bouton de vérification
    const checkButton = document.createElement("button");
    checkButton.id = "check-button";
    checkButton.textContent = "Check Words";
    checkButton.onclick = checkWords;
    inputContainerElement.appendChild(checkButton);
    
    generateInputBoxes(wordsToRemember.length);
}

function generateInputBoxes(count) {
    console.log(`Generating ${count} input boxes`);
    const inputBoxesElement = document.getElementById("input-boxes");
    if (!inputBoxesElement) {
        console.error("Element with id 'input-boxes' not found");
        return;
    }
    inputBoxesElement.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.className = "input-box";
        inputBox.id = `input-${i}`;
        inputBoxesElement.appendChild(inputBox);
    }
}

function startTimer(seconds) {
    console.log(`Starting timer with ${seconds} seconds`);
    let timeLeft = seconds;
    const timeLeftElement = document.getElementById("time-left");
    if (timeLeftElement) timeLeftElement.innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeftElement) timeLeftElement.innerText = timeLeft;
        if (timeLeft <= 0) {
            console.log("Timer reached 0, hiding words");
            clearInterval(timerInterval);
            hideWords();
        }
    }, 1000);
}
  
function checkWords() {
    console.log("Checking words...");
    const enteredWords = Array.from(document.getElementsByClassName("input-box")).map(input => input.value.trim().toLowerCase());
    const correctWords = enteredWords.filter(word => wordsToRemember.includes(word));
    const newPoints = correctWords.length;

    score += newPoints;
    updateScore(); // Mise à jour du score affiché

    console.log(`Correct words: ${correctWords.length}/${wordsToRemember.length}`);

    if (correctWords.length === wordsToRemember.length) {
        // Tous les mots sont corrects
        level++;
        if (level > maxLevel) {
            endGame();
        } else {
            document.getElementById("message").innerText = `Well done! You've passed Level ${level - 1}. Moving to Level ${level}.`;
            document.getElementById("level").innerText = level;
            setTimeout(() => {
                startGame(); // Démarrer le niveau suivant après un court délai
            }, 2000);
        }
    } else {
        // Certains mots sont incorrects
        document.getElementById("message").innerText = `You got ${newPoints} out of ${wordsToRemember.length} words correct. Game Over. Final Score: ${score}`;
        document.getElementById("start-button").style.display = "inline-block";
        document.getElementById("start-button").innerText = "New Game";
        document.getElementById("check-button").style.display = "none";
        saveScore(score);  // Save the score when the game is lost
    }
}

function newGame() {
    console.log("Starting new game...");
    if (score > 0) {
        saveScore(score);
    }
    level = 1;
    score = 0;
    updateScore();
    startGame();
}

// Assurez-vous que le bouton "Start Game" appelle newGame et non startGame
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded");
    loadTopScores();
    const startButton = document.getElementById("start-button");
    
    if (startButton) {
        startButton.addEventListener("click", newGame);  // Changed from startGame to newGame
    } else {
        console.error("Start button not found in the DOM");
    }
    

});

function updateScore() {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.textContent = score;
    } else {
        console.error("Score element not found");
    }
    console.log("Score updated:", score);
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById("message").innerText = `Congratulations! You've completed all levels. Final Score: ${score}`;
    document.getElementById("start-button").style.display = "inline-block";
    document.getElementById("start-button").innerText = "Play Again";
    document.getElementById("check-button").style.display = "none";
    document.getElementById("input-container").style.display = "none";
    
    console.log("Game ended. Saving final score:", score);
    saveScore(score);
}

function saveScore(score) {
    const playerName = localStorage.getItem('playerName') || prompt("Enter your name for the leaderboard:");
    if (playerName) {
        localStorage.setItem('playerName', playerName);
        db.collection("word_memory_game_scores").add({
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
    db.collection("word_memory_game_scores")
        .orderBy("score", "desc") // Trie les scores par ordre décroissant
        .limit(5) // Limite à 5 meilleurs scores
        .get()
        .then((querySnapshot) => {
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = ""; // Vide la liste avant de la remplir

            querySnapshot.forEach((doc) => {
                const li = document.createElement("li");
                li.textContent = `${doc.data().name}: ${doc.data().score}`; // Affiche le nom et le score
                topScoresList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Error loading top scores: ", error);
        });
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadTopScores();
});

// Appeler cette fonction au chargement de la page
document.addEventListener('DOMContentLoaded', (event) => {
    loadTopScores();
    // ... autres initialisations ...
});
  
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded");
    loadTopScores();
    const startButton = document.getElementById("start-button");
    const checkButton = document.getElementById("check-button");
    
    if (startButton) {
        startButton.addEventListener("click", startGame);
    } else {
        console.error("Start button not found in the DOM");
    }
    
    if (checkButton) {
        checkButton.addEventListener("click", checkWords);
    } else {
        console.error("Check button not found in the DOM");
    }
});
  
// Désactiver les raccourcis clavier et le clic droit
document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey && (event.key === 'c' || event.key === 'v' || event.key === 'x')) || 
        (event.metaKey && (event.key === 'c' || event.key === 'v' || event.key === 'x'))) {
        event.preventDefault();
    }
});
  
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

// Ajouter après les autres event listeners
document.getElementById('reset-button').addEventListener('click', () => {
    // Réinitialiser toutes les variables du jeu
    level = 1;
    score = 0;
    clearInterval(timerInterval);
    
    // Réinitialiser l'affichage
    document.getElementById("level").innerText = level;
    document.getElementById("score").innerText = score;
    document.getElementById("time-left").innerText = "30";
    document.getElementById("message").innerText = "";
    document.getElementById("word-list").innerHTML = "";
    document.getElementById("input-container").style.display = "none";
    
    // Réactiver le bouton start
    const startButton = document.getElementById("start-button");
    startButton.style.display = "inline-block";
    startButton.innerText = "Start Game";
    
    // Recharger les meilleurs scores
    loadTopScores();
});