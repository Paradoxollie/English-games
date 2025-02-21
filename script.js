import { initMobileMenu } from './src/utils/mobileMenu.js';
import { initFirebase } from './firebase-init.js';
import { initThemeManager } from './src/utils/themeManager.js';
import { initVisitCounter } from './visit-counter.js';
import { games, courses } from './src/data/games.js';

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

// Fonction pour créer une carte de jeu
function createGameCard(game) {
    return `
        <div class="quest-card">
            <div class="quest-card-banner h-32">
                <img src="${game.image}" alt="${game.title}" class="w-full h-full object-cover">
                <div class="quest-difficulty ${game.difficulty}">${game.difficulty}</div>
            </div>
            <div class="quest-card-content p-4">
                <h3 class="text-xl font-bold text-quest-gold mb-2">${game.title}</h3>
                <p class="text-sm text-gray-300 mb-3">${game.description}</p>
                <div class="quest-tags flex flex-wrap gap-2 mb-3">
                    ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="${game.url}" class="quest-button flex items-center justify-center">
                    <span class="quest-button-icon mr-2">${game.icon}</span>
                    <span>Play Now</span>
                </a>
            </div>
        </div>
    `;
}

// Fonction pour créer une carte de cours
function createCourseCard(course) {
    return `
        <div class="training-card">
            <div class="training-card-banner h-32">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover">
                <div class="training-level ${course.level}">${course.level}</div>
            </div>
            <div class="training-card-content p-4">
                <h3 class="text-xl font-bold text-quest-gold mb-2">${course.title}</h3>
                <p class="text-sm text-gray-300 mb-3">${course.description}</p>
                <div class="training-tags flex flex-wrap gap-2 mb-3">
                    ${course.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="${course.url}" class="training-button flex items-center justify-center">
                    <span class="training-button-icon mr-2">${course.icon}</span>
                    <span>Start Training</span>
                </a>
            </div>
        </div>
    `;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateCarousel(container, items, currentIndex) {
    const currentItem = items[currentIndex];
    
    container.style.opacity = '0';
    setTimeout(() => {
        container.innerHTML = currentItem.difficulty ? 
            createGameCard(currentItem) : 
            createCourseCard(currentItem);
        container.style.opacity = '1';
    }, 500);
}

function initializeCarousels() {
    const gamesContainer = document.querySelector('.quest-grid');
    const coursesContainer = document.querySelector('.training-grid');
    
    // Mélanger les tableaux
    const shuffledGames = shuffleArray([...games]);
    const shuffledCourses = shuffleArray([...courses]);
    
    let gameIndex = 0;
    let courseIndex = 0;

    // Initialiser les carousels
    if (gamesContainer) {
        updateCarousel(gamesContainer, shuffledGames, gameIndex);
        setInterval(() => {
            gameIndex = (gameIndex + 1) % shuffledGames.length;
            updateCarousel(gamesContainer, shuffledGames, gameIndex);
        }, 5000); // Changé à 5 secondes
    }

    if (coursesContainer) {
        updateCarousel(coursesContainer, shuffledCourses, courseIndex);
        setInterval(() => {
            courseIndex = (courseIndex + 1) % shuffledCourses.length;
            updateCarousel(coursesContainer, shuffledCourses, courseIndex);
        }, 5000);
    }
}

// Mise à jour des styles pour une transition fluide
const styles = `
    .quest-grid, .training-grid {
        transition: opacity 0.5s ease-in-out;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .quest-card, .training-card {
        width: 100%;
        max-width: 400px;
    }
`;

// Ajouter les styles au document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialisation
document.addEventListener('DOMContentLoaded', initializeCarousels);