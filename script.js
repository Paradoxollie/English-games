import { initMobileMenu } from './src/utils/mobileMenu.js';
import { initFirebase } from './firebase-init.js';
import { initThemeManager } from './src/utils/themeManager.js';
import { initVisitCounter } from './visit-counter.js';

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

// Structure des données des jeux
const featuredGames = [
    {
        title: "Brew Your Words",
        description: "Mix and match words to create perfect sentences",
        image: "./images/brew-your-words.webp",
        url: "./brew-your-words.html"
    },
    {
        title: "Memory Matrix",
        description: "Test your memory with English vocabulary",
        image: "/images/matrix-game.webp",
        url: "/memory-matrix.html"
    },
    {
        title: "Word Bubbles",
        description: "Pop word bubbles and improve your vocabulary",
        image: "/images/word-bubbles.webp",
        url: "/word-bubbles.html"
    }
];

const latestCourses = [
    {
        title: "Grammar Basics",
        description: "Master the fundamentals of English grammar",
        image: "./images/grammar-basics.webp",
        url: "./courses/grammar-basics.html"
    },
    // ... autres cours
];

function loadCarouselContent() {
    // Charger les jeux
    const gamesContent = document.querySelector('.featured-games .carousel-content');
    if (gamesContent) {
        gamesContent.innerHTML = featuredGames.map(game => `
            <div class="carousel-card">
                <img src="${game.image}" alt="${game.title}">
                <div class="card-content">
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                </div>
            </div>
        `).join('');
    }

    // Charger les cours
    const coursesContent = document.querySelector('.latest-courses .carousel-content');
    if (coursesContent) {
        coursesContent.innerHTML = latestCourses.map(course => `
            <div class="carousel-card">
                <img src="${course.image}" alt="${course.title}">
                <div class="card-content">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                </div>
            </div>
        `).join('');
    }
}

// Fonction pour gérer les carousels
function initCarousels() {
    document.querySelectorAll('.carousel-container').forEach(carousel => {
        const content = carousel.querySelector('.carousel-content');
        const prevBtn = carousel.querySelector('.carousel-arrow.prev');
        const nextBtn = carousel.querySelector('.carousel-arrow.next');

        prevBtn.addEventListener('click', () => {
            content.scrollBy({ left: -300, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            content.scrollBy({ left: 300, behavior: 'smooth' });
        });
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initFirebase();
    initThemeManager();
    initVisitCounter();
    loadCarouselContent();
    initCarousels();
});