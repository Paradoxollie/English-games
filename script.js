import { initMobileMenu } from './src/utils/mobileMenu.js';
import { initFirebase } from './firebase-init.js';
import { initThemeManager } from './src/utils/themeManager.js';
import { initVisitCounter } from './visit-counter.js';
import { games, courses } from './src/data/content.js';
import { Carousel } from './src/js/carousel.js';

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

// Styles globaux
const styles = `
    .game-card, .course-card {
        width: 280px;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid #c9aa71;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .card-banner {
        position: relative;
        height: 100px;
    }

    .card-image {
        width: 100%;
        height: 100px;
        object-fit: cover;
    }

    .card-difficulty, .card-level {
        position: absolute;
        bottom: 4px;
        right: 4px;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        background: rgba(0, 0, 0, 0.7);
        color: #c9aa71;
    }

    .tag {
        font-size: 0.7rem;
        padding: 2px 6px;
        background: rgba(201, 170, 113, 0.2);
        border: 1px solid #c9aa71;
        border-radius: 9999px;
        color: #c9aa71;
    }

    #game-display, #course-display {
        transition: opacity 0.3s ease;
    }
`;

function createCard(item, isGame = true) {
    return `
        <div class="${isGame ? 'game-card' : 'course-card'}">
            <div class="card-banner">
                <img src="${item.image}" alt="${item.title}" class="card-image">
                <div class="card-${isGame ? 'difficulty' : 'level'} ${isGame ? item.difficulty : item.level}">
                    ${isGame ? item.difficulty : item.level}
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-bold text-quest-gold mb-2">${item.title}</h3>
                <p class="text-sm text-gray-300 mb-2">${item.description}</p>
                <div class="flex flex-wrap gap-1 mb-2">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="${item.url}" class="quest-button flex items-center justify-center">
                    <span class="mr-2">${item.icon}</span>
                    <span>${isGame ? 'Play Now' : 'Start Training'}</span>
                </a>
            </div>
        </div>
    `;
}

function initializeDisplays() {
    // Ajouter les styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Initialiser l'affichage des jeux
    const gameDisplay = document.getElementById('game-display');
    let availableGames = [...games];
    let displayedGames = [];

    function updateGameDisplay() {
        if (availableGames.length === 0) {
            availableGames = [...displayedGames];
            displayedGames = [];
        }
        const randomIndex = Math.floor(Math.random() * availableGames.length);
        const game = availableGames.splice(randomIndex, 1)[0];
        displayedGames.push(game);

        gameDisplay.style.opacity = '0';
        setTimeout(() => {
            gameDisplay.innerHTML = createCard(game, true);
            gameDisplay.style.opacity = '1';
        }, 300);
    }

    // Initialiser l'affichage des cours
    const courseDisplay = document.getElementById('course-display');
    let availableCourses = [...courses];
    let displayedCourses = [];

    function updateCourseDisplay() {
        if (availableCourses.length === 0) {
            availableCourses = [...displayedCourses];
            displayedCourses = [];
        }
        const randomIndex = Math.floor(Math.random() * availableCourses.length);
        const course = availableCourses.splice(randomIndex, 1)[0];
        displayedCourses.push(course);

        courseDisplay.style.opacity = '0';
        setTimeout(() => {
            courseDisplay.innerHTML = createCard(course, false);
            courseDisplay.style.opacity = '1';
        }, 300);
    }

    // Premier affichage
    if (gameDisplay) updateGameDisplay();
    if (courseDisplay) updateCourseDisplay();

    // Mettre à jour toutes les 5 secondes
    setInterval(updateGameDisplay, 5000);
    setInterval(updateCourseDisplay, 5000);
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new Carousel('game-carousel', games, true);
    new Carousel('course-carousel', courses, false);
});