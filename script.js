// Liste de mots inappropriés à filtrer
const inappropriateWords = ['badword1', 'badword2', 'badword3']; // Ajoutez vos mots inappropriés ici

// Fonction pour filtrer les noms
function filterName(name) {
    let filteredName = name.toLowerCase();
    inappropriateWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredName = filteredName.replace(regex, '*'.repeat(word.length));
    });
    return filteredName;
}

// Fonction pour obtenir le nom du joueur
function getPlayerName() {
    let playerName = localStorage.getItem('playerName');
    if (!playerName) {
        playerName = prompt("Enter your name for the leaderboard:");
        if (playerName) {
            playerName = filterName(playerName);
            localStorage.setItem('playerName', playerName);
        }
    }
    return playerName;
}

// Enregistre le score dans Firebase
function saveScore(score, difficulty) {
    const playerName = getPlayerName();
    if (!playerName) {
        console.log("Score not saved: No player name provided");
        return;
    }

    const scoresRef = database.ref('scores/' + difficulty);
    scoresRef.push({
        name: playerName,
        score: score,
        timestamp: Date.now()
    }).then(() => {
        console.log("Score enregistré avec succès !");
    }).catch((error) => {
        console.error("Erreur lors de l'enregistrement du score : ", error);
    });
}

// Charge les scores depuis Firebase
function loadScores() {
    const difficulty = document.getElementById("difficulty").value;
    const scoresRef = database.ref('scores/' + difficulty);
    scoresRef.orderByChild('score').limitToLast(5).on('value', (snapshot) => {
        const scores = [];
        snapshot.forEach((childSnapshot) => {
            scores.push({
                name: childSnapshot.val().name,
                score: childSnapshot.val().score
            });
        });
        updateTopScoresDisplay(scores.reverse());
    });
}

// Affiche les scores dans le tableau
function updateTopScoresDisplay(scores) {
    const topScoresList = document.getElementById("top-scores-list");
    topScoresList.innerHTML = "";
    scores.forEach(score => {
        const li = document.createElement("li");
        li.textContent = `${score.name}: ${score.score}`;
        topScoresList.appendChild(li);
    });
}

// Charger les scores quand la page est chargée
window.onload = () => {
    loadScores();
}

// Gestion du démarrage et de la fin du jeu (exemple)
function startSpeedVerbChallenge() {
    alert("Speed Verb Challenge will start soon!");
}

function startFillInTheGaps() {
    alert("Fill in the Gaps game will start soon!");
}

// Exemple de structure pour le démarrage d'un jeu (à compléter avec tes fonctionnalités existantes)
function startGame() {
    let score = 0;
    let timeLeft = 90;
    let timerInterval;

    // Initialisation du jeu
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame(score);
        }
    }, 1000);

    // Affichage d'un verbe aléatoire ou autre logique de jeu
}

// Exemple de fin de jeu (à compléter selon ton besoin)
function endGame(score) {
    clearInterval(timerInterval);
    document.getElementById("start-button").disabled = false;

    const difficulty = document.getElementById("difficulty").value;
    saveScore(score, difficulty);  // Enregistrer le score en fonction du niveau

    alert("Game Over! Your score: " + score);
}