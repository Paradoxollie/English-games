/**
 * Word Bubbles - Thème World of Warcraft
 * Un jeu de mots magique où les joueurs doivent taper les mots qui apparaissent
 * dans des orbes magiques avant qu'ils n'atteignent le bas de l'écran.
 */

// Variables globales
let gameCanvas;
let ctx;
let gameActive = false;
let score = 0;
let level = 1;
let lives = 3;
let timeRemaining = 60;
let gameTimer = null;
let orbs = [];
let words = [];
let usedWords = new Set();
let currentWord = '';

// Configuration des bulles
let MIN_ORBS = 2;  // Nombre minimum de bulles à l'écran
let MAX_ORBS = 6; // Nombre maximum de bulles à l'écran
let orbSpawnTimer = null; // Référence au timer pour contrôler la génération de bulles

// Nouvelles variables pour les fonctionnalités avancées
let difficulty = 'normal'; // 'easy', 'normal', 'hard'
let activeBonus = null;
let bonusDuration = 0;
let comboCount = 0;
let lastWordTime = 0;
let specialEventActive = false;
let specialEventTimer = null;
let achievements = [];

// Constantes pour les bonus et événements
const BONUS_TYPES = {
    DOUBLE_POINTS: 'double_points',
    SLOW_MOTION: 'slow_motion',
    EXTRA_LIFE: 'extra_life',
    FREEZE_TIME: 'freeze_time',
    LETTER_BOMB: 'letter_bomb'
};

const SPECIAL_EVENTS = {
    LETTER_RAIN: 'letter_rain',
    GOLDEN_LETTER: 'golden_letter',
    WORD_RUSH: 'word_rush',
    CHALLENGE_ROUND: 'challenge_round'
};

// Éléments DOM
let wordInput;
let startButton;
let helpButton;
let restartButton;
let scoreValue;
let levelValue;
let livesValue;
let timeValue;
let finalScore;
let finalLevel;
let helpModal;
let gameOverModal;
let closeButtons;
let difficultySelector;
let bonusIndicator;
let comboIndicator;

// Charger la liste de mots depuis le fichier JSON
fetch('data/filtered_words.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Vérifier que data.words existe et est un tableau
        if (!data.words || !Array.isArray(data.words)) {
            throw new Error('Format de données invalide: la propriété "words" est manquante ou n\'est pas un tableau');
        }
        
        // Filtrer les mots trop courts et les convertir en majuscules
        words = data.words
            .filter(word => word.length >= 3) // Ne garder que les mots de 3 lettres ou plus
            .map(word => word.toUpperCase());
        
        console.log(`${words.length} mots chargés avec succès`);
        
        // Activer le bouton de démarrage une fois les mots chargés
        if (startButton) {
            startButton.disabled = false;
        }
    })
    .catch(error => {
        console.error('Erreur lors du chargement des mots:', error);
        // En cas d'erreur, utiliser une petite liste de mots de secours
        words = [
            "APPLE", "BEACH", "CHAIR", "DANCE", "EAGLE", "FLAME", "GRAPE", "HOUSE",
            "IMAGE", "JUICE", "KNIFE", "LEMON", "MOUSE", "NIGHT", "OCEAN", "PIANO",
            "QUEEN", "RIVER", "SNAKE", "TABLE", "UNCLE", "VOICE", "WATER", "YOUTH"
        ];
        console.log("Liste de secours chargée avec " + words.length + " mots");
        
        // Activer le bouton de démarrage même avec la liste de secours
        if (startButton) {
            startButton.disabled = false;
        }
    });

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    init();
    // Affichage de l'écran d'aide au premier chargement avec un délai
    setTimeout(() => {
        showHelp();
    }, 1000);
});

/**
 * Initialise le jeu
 */
function init() {
    console.log("Initialisation du jeu...");
    
    // Récupérer les éléments du DOM
    gameCanvas = document.getElementById('gameCanvas');
    ctx = gameCanvas.getContext('2d');
    wordInput = document.getElementById('wordInput');
    startButton = document.getElementById('startButton');
    helpButton = document.getElementById('helpButton');
    restartButton = document.getElementById('restartButton');
    scoreValue = document.getElementById('scoreValue');
    levelValue = document.getElementById('levelValue');
    livesValue = document.getElementById('livesValue');
    timeValue = document.getElementById('timeValue');
    finalScore = document.getElementById('finalScore');
    finalLevel = document.getElementById('finalLevel');
    helpModal = document.getElementById('helpModal');
    gameOverModal = document.getElementById('gameOverModal');
    closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
    difficultySelector = document.getElementById('difficultySelector');
    bonusIndicator = document.getElementById('bonusIndicator');
    comboIndicator = document.getElementById('comboIndicator');
    
    console.log("Modales:", helpModal, gameOverModal);
    
    // Créer les éléments manquants
    if (!bonusIndicator) {
        bonusIndicator = document.createElement('div');
        bonusIndicator.id = 'bonusIndicator';
        bonusIndicator.className = 'bonus-indicator';
        bonusIndicator.style.display = 'none';
        document.querySelector('.game-container').appendChild(bonusIndicator);
    }
    
    if (!comboIndicator) {
        comboIndicator = document.createElement('div');
        comboIndicator.id = 'comboIndicator';
        comboIndicator.className = 'combo-indicator';
        comboIndicator.style.display = 'none';
        document.querySelector('.game-container').appendChild(comboIndicator);
    }
    
    if (!difficultySelector) {
        // Créer le sélecteur de difficulté
        const controlsContainer = document.querySelector('.game-controls');
        
        if (controlsContainer) {
            // Créer un conteneur pour le sélecteur
            const difficultyContainer = document.createElement('div');
            difficultyContainer.className = 'difficulty-container';
            
            // Créer le sélecteur
            difficultySelector = document.createElement('select');
            difficultySelector.id = 'difficultySelector';
            difficultySelector.className = 'difficulty-selector';
            
            const options = [
                { value: 'easy', text: 'Facile' },
                { value: 'normal', text: 'Normal' },
                { value: 'hard', text: 'Difficile' }
            ];
            
            options.forEach(option => {
                const optElement = document.createElement('option');
                optElement.value = option.value;
                optElement.textContent = option.text;
                if (option.value === 'normal') {
                    optElement.selected = true;
                }
                difficultySelector.appendChild(optElement);
            });
            
            const difficultyLabel = document.createElement('label');
            difficultyLabel.htmlFor = 'difficultySelector';
            difficultyLabel.textContent = 'Difficulté:';
            
            difficultyContainer.appendChild(difficultyLabel);
            difficultyContainer.appendChild(difficultySelector);
            
            // Ajouter le conteneur au début des contrôles
            const firstChild = controlsContainer.firstChild;
            if (firstChild) {
                controlsContainer.insertBefore(difficultyContainer, firstChild);
            } else {
                controlsContainer.appendChild(difficultyContainer);
            }
        }
    }
    
    // Configurer le cadre du jeu
    const gameFrame = document.querySelector('.game-frame');
    if (gameFrame) {
        // S'assurer que le cadre est vide au démarrage
        gameFrame.innerHTML = '';
        console.log("Cadre du jeu configuré");
    }
    
    // Initialiser les gestionnaires d'événements
    initModalHandlers();
    
    // Gestionnaire d'événement pour la saisie de mots
    wordInput.addEventListener('keydown', checkWord);
    
    // Gestionnaire d'événement pour le bouton de démarrage
    startButton.addEventListener('click', startGame);
    
    // Gestionnaire d'événement pour le bouton d'aide
    helpButton.addEventListener('click', showHelp);
    
    // Gestionnaire d'événement pour le bouton de redémarrage
    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    }
    
    // Gestionnaire d'événement pour le sélecteur de difficulté
    if (difficultySelector) {
        difficultySelector.addEventListener('change', function() {
            difficulty = this.value;
            console.log(`Difficulté changée à: ${difficulty}`);
        });
    }
    
    // Initialiser les effets d'ambiance
    initAmbientEffects();
    
    // Désactiver l'entrée de texte au démarrage
    wordInput.disabled = true;
    
    // Afficher l'aide au démarrage après un court délai
    setTimeout(showHelp, 1000);
    
    console.log("Initialisation terminée");
}

/**
 * Redimensionne le canvas pour qu'il s'adapte à son conteneur
 */
function resizeCanvas() {
    if (!gameCanvas) return;
    
    const container = gameCanvas.parentElement;
    gameCanvas.width = container.clientWidth;
    gameCanvas.height = 500; // Hauteur fixe ou adaptative selon vos besoins
}

/**
 * Initialise les gestionnaires d'événements pour les modales
 */
function initModalHandlers() {
    console.log("Initialisation des gestionnaires de modales...");
    
    // Gestionnaires pour les boutons de fermeture
    if (closeButtons && closeButtons.length > 0) {
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log("Bouton fermer cliqué");
                closeModals();
            });
        });
    } else {
        console.warn("Aucun bouton de fermeture trouvé");
    }
    
    // Fermer les modales en cliquant à l'extérieur du contenu
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            // Si le clic est sur la modale elle-même (pas son contenu)
            if (event.target === modal) {
                closeModals();
            }
        });
    });
    
    // Fermer les modales avec la touche Echap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModals();
        }
    });
}

/**
 * Affiche la modale d'aide
 */
function showHelp() {
    console.log("Affichage de la modale d'aide");
    
    if (!helpModal) {
        console.error("La modale d'aide n'a pas été trouvée");
        return;
    }
    
    // Fermer d'abord toutes les modales
    closeModals();
    
    // Afficher la modale d'aide
    helpModal.classList.add('show');
    helpModal.style.display = 'flex';
    
    // Désactiver le jeu pendant que la modale est affichée
    if (gameActive) {
        // Sauvegarder l'état du jeu pour le reprendre après
        const wasActive = gameActive;
        gameActive = false;
        
        // Réactiver le jeu quand la modale est fermée
        const onModalClose = () => {
            helpModal.removeEventListener('hidden', onModalClose);
            if (wasActive) {
                gameActive = true;
                // Reprendre l'animation des orbes
                animateOrbs();
            }
        };
        
        helpModal.addEventListener('hidden', onModalClose);
    }
}

/**
 * Affiche les scores récents dans un élément HTML
 */
function displayRecentScores(containerId, limit = 3) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Conteneur de scores récents ${containerId} non trouvé`);
        return;
    }
    
    const scores = getScores();
    
    if (scores.length === 0) {
        container.innerHTML = '<p class="no-scores">Aucun score enregistré pour le moment.</p>';
        return;
    }
    
    // Limiter le nombre de scores à afficher
    const recentScores = scores.slice(0, limit);
    
    // Créer un tableau HTML pour afficher les scores
    let html = `
        <table class="scores-table">
            <thead>
                <tr>
                    <th>Joueur</th>
                    <th>Score</th>
                    <th>Niveau</th>
                    <th>Difficulté</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    recentScores.forEach((score) => {
        const date = new Date(score.date);
        const formattedDate = `${date.toLocaleDateString()}`;
        const difficultyName = getDifficultyName(score.difficulty);
        const playerName = score.name || "Anonyme";
        
        html += `
            <tr>
                <td>${playerName}</td>
                <td>${score.score}</td>
                <td>${score.level}</td>
                <td>${difficultyName}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

/**
 * Affiche la modale de fin de jeu
 */
function showGameOver() {
    console.log("Affichage de la modale de fin de jeu");
    
    // Fermer d'abord toutes les autres modales
    closeModals();
    
    // Mettre à jour les scores finaux
    if (finalScore) {
        finalScore.textContent = score;
    } else {
        console.warn("Élément finalScore non trouvé");
    }
    
    if (finalLevel) {
        finalLevel.textContent = level;
    } else {
        console.warn("Élément finalLevel non trouvé");
    }
    
    try {
        // Sauvegarder le score dans les top scores
        saveScore(score, level, difficulty);
        
        // Demander le nom du joueur et soumettre le score au leaderboard global
        const playerName = submitScoreToGlobalLeaderboard(score, level, difficulty);
        
        // Afficher le nom du joueur dans la modale
        const playerNameElement = document.getElementById('playerName');
        if (playerNameElement) {
            playerNameElement.textContent = playerName;
        }
        
        // Afficher le top score
        const topScore = getTopScore();
        const topScoreElement = document.getElementById('topScore');
        if (topScoreElement) {
            topScoreElement.textContent = topScore;
        } else {
            console.warn("Élément topScore non trouvé");
        }
        
        // Afficher les scores récents
        displayRecentScores('recentScores');
    } catch (error) {
        console.error("Erreur lors de la gestion des scores:", error);
    }
    
    // Afficher la modale
    if (gameOverModal) {
        // Forcer le style display à flex
        gameOverModal.style.display = 'flex';
        gameOverModal.classList.add('show');
        
        // S'assurer que la modale est visible
        gameOverModal.style.opacity = '1';
        gameOverModal.style.visibility = 'visible';
        gameOverModal.style.zIndex = '1000';
        
        console.log("Modale de fin de jeu affichée");
    } else {
        console.error("La modale de fin de jeu n'a pas été trouvée");
    }
    
    // Ajouter un gestionnaire d'événement pour le bouton de redémarrage
    const restartBtn = document.getElementById('restartButton');
    if (restartBtn) {
        // Supprimer les gestionnaires existants pour éviter les doublons
        restartBtn.removeEventListener('click', restartGame);
        // Ajouter le nouveau gestionnaire
        restartBtn.addEventListener('click', restartGame);
    }
}

/**
 * Ferme toutes les modales
 */
function closeModals() {
    console.log("Fermeture de toutes les modales");
    
    // Fermer la modale d'aide
    if (helpModal) {
        helpModal.classList.remove('show');
        helpModal.style.display = 'none';
        
        // Déclencher l'événement 'hidden'
        const event = new Event('hidden');
        helpModal.dispatchEvent(event);
    }
    
    // Fermer la modale de fin de jeu
    if (gameOverModal) {
        gameOverModal.classList.remove('show');
        gameOverModal.style.display = 'none';
    }
    
    // Fermer toutes les autres modales potentielles
    const allModals = document.querySelectorAll('.modal');
    allModals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
}

/**
 * Démarre une nouvelle partie
 */
function startGame() {
    console.log("Démarrage du jeu");
    
    // Vérifier que les mots sont chargés
    if (words.length === 0) {
        console.error("La liste de mots n'est pas encore chargée");
        showMessage("Chargement des mots en cours, veuillez patienter...");
        return;
    }
    
    // Récupérer la difficulté sélectionnée
    if (difficultySelector) {
        difficulty = difficultySelector.value;
    }
    
    // Réinitialisation des variables de jeu
    gameActive = true;
    score = 0;
    level = 1;
    lives = 3;
    timeRemaining = 60;
    orbs = [];
    usedWords.clear();
    activeBonus = null;
    bonusDuration = 0;
    comboCount = 0;
    lastWordTime = 0;
    specialEventActive = false;
    specialEventTimer = null;
    
    // Ajuster le temps selon la difficulté
    switch (difficulty) {
        case 'easy':
            timeRemaining = 90; // Plus de temps en mode facile
            lives = 5; // Plus de vies
            break;
        case 'normal':
            timeRemaining = 60;
            lives = 3;
            break;
        case 'hard':
            timeRemaining = 45; // Moins de temps en mode difficile
            lives = 2; // Moins de vies
            break;
    }
    
    // Mise à jour de l'interface
    updateUI();
    
    // Fermer les modales
    closeModals();
    
    // Activation/désactivation des boutons
    if (startButton) startButton.disabled = true;
    if (wordInput) {
        wordInput.disabled = false;
        wordInput.value = '';
        wordInput.focus();
    }
    
    // Masquer les indicateurs
    if (bonusIndicator) bonusIndicator.style.display = 'none';
    if (comboIndicator) comboIndicator.style.display = 'none';
    
    // Vider le cadre du jeu
    const gameFrame = document.querySelector('.game-frame');
    if (gameFrame) {
        gameFrame.innerHTML = '';
    }
    
    // Afficher un message de début de partie
    showMessage(`Mode ${getDifficultyName(difficulty)} - Bonne chance !`);
    
    // Lancer la première vérification pour générer des orbes
    checkAndSpawnOrbs();
    
    // Démarrer l'animation des orbes
    animateOrbs();
    
    // Démarrer le timer
    startTimer();
}

/**
 * Met à jour l'interface utilisateur
 */
function updateUI() {
    scoreValue.textContent = score;
    levelValue.textContent = level;
    livesValue.textContent = lives;
    timeValue.textContent = timeRemaining;
}

/**
 * Génère un nouvel orbe magique
 */
function spawnOrb() {
    if (!gameActive) return;
    
    // Vérifier si nous avons atteint le nombre maximum d'orbes
    if (orbs.length >= MAX_ORBS) {
        console.log(`Limite d'orbes atteinte (${orbs.length}/${MAX_ORBS}). Attente avant d'en générer d'autres.`);
        // Planifier une nouvelle vérification après un délai
        orbSpawnTimer = setTimeout(checkAndSpawnOrbs, 1000);
        return;
    }
    
    // Générer une lettre aléatoire
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    
    // Vérifier s'il existe des mots disponibles commençant par cette lettre
    const availableWords = words.filter(word => 
        word.startsWith(letter) && !usedWords.has(word)
    );
    
    // Si aucun mot disponible avec cette lettre, réessayer avec une autre lettre
    if (availableWords.length === 0) {
        setTimeout(spawnOrb, 100);
        return;
    }
    
    // Déterminer le type d'orbe (feu, glace, ou spécial)
    let orbType = Math.random() < 0.5 ? 'fire' : 'frost';
    let isSpecial = false;
    let bonusType = null;
    
    // Chance de générer un orbe spécial (5% de chance, augmente avec le niveau)
    const specialChance = 0.05 + (level * 0.01);
    if (Math.random() < specialChance) {
        isSpecial = true;
        // Choisir un type de bonus aléatoire
        const bonusKeys = Object.keys(BONUS_TYPES);
        bonusType = BONUS_TYPES[bonusKeys[Math.floor(Math.random() * bonusKeys.length)]];
    }
    
    // Créer l'élément orbe
    const orb = document.createElement('div');
    orb.className = `magic-orb ${orbType}`;
    
    if (isSpecial) {
        orb.classList.add('special-orb');
        orb.dataset.bonusType = bonusType;
        
        // Ajouter un effet visuel selon le type de bonus
        switch (bonusType) {
            case BONUS_TYPES.DOUBLE_POINTS:
                orb.classList.add('bonus-double-points');
                break;
            case BONUS_TYPES.SLOW_MOTION:
                orb.classList.add('bonus-slow-motion');
                break;
            case BONUS_TYPES.EXTRA_LIFE:
                orb.classList.add('bonus-extra-life');
                break;
            case BONUS_TYPES.FREEZE_TIME:
                orb.classList.add('bonus-freeze-time');
                break;
            case BONUS_TYPES.LETTER_BOMB:
                orb.classList.add('bonus-letter-bomb');
                break;
        }
    }
    
    // Calculer la position dans le cadre du jeu
    const gameFrame = document.querySelector('.game-frame');
    if (!gameFrame) {
        console.error("Cadre du jeu non trouvé");
        return;
    }
    
    const frameRect = gameFrame.getBoundingClientRect();
    
    // Position horizontale aléatoire à l'intérieur du cadre
    const xPos = Math.random() * (frameRect.width - 80) + 40;
    orb.style.position = 'absolute';
    orb.style.left = `${xPos}px`;
    orb.style.top = '0px';
    
    // Ajouter une animation d'entrée
    orb.style.animation = `orbEnter 0.5s ease-out, rotate ${5 + Math.random() * 5}s linear infinite`;
    
    // Ajouter la lettre à l'orbe
    const letterSpan = document.createElement('span');
    letterSpan.className = 'orb-letter';
    letterSpan.textContent = letter;
    orb.appendChild(letterSpan);
    
    // Ajouter l'orbe au cadre du jeu
    gameFrame.appendChild(orb);
    
    // Définir la vitesse de descente selon la difficulté
    let baseSpeed;
    let levelMultiplier;
    
    switch (difficulty) {
        case 'easy':
            baseSpeed = 0.05; // Extrêmement lent (réduit de 0.1 à 0.05)
            levelMultiplier = 0.01; // Progression très douce (réduit de 0.05 à 0.01)
            break;
        case 'normal':
            baseSpeed = 0.08; // Très lent (réduit de 0.15 à 0.08)
            levelMultiplier = 0.02; // Progression douce (réduit de 0.08 à 0.02)
            break;
        case 'hard':
            baseSpeed = 0.12; // Lent (réduit de 0.2 à 0.12)
            levelMultiplier = 0.03; // Progression modérée (réduit de 0.1 à 0.03)
            break;
        default:
            baseSpeed = 0.08;
            levelMultiplier = 0.02;
    }
    
    // Appliquer le bonus de ralentissement si actif
    if (activeBonus === BONUS_TYPES.SLOW_MOTION) {
        baseSpeed *= 0.5;
        levelMultiplier *= 0.5;
    }
    
    // Ralentir davantage les orbes spéciaux
    if (isSpecial) {
        baseSpeed *= 0.7; // Les orbes spéciaux sont 30% plus lents
    }
    
    // Ralentir encore plus les orbes pendant l'événement "pluie de lettres"
    if (specialEventActive && specialEventTimer === SPECIAL_EVENTS.LETTER_RAIN) {
        baseSpeed *= 0.5; // Les orbes de la pluie de lettres sont 50% plus lents
    }
    
    // Calculer la vitesse finale avec une progression logarithmique pour une accélération très douce
    // Utiliser Math.log pour que l'augmentation de vitesse soit de moins en moins importante à mesure que le niveau augmente
    const levelFactor = 1 + (Math.log(level) / Math.log(10)) * levelMultiplier;
    const speed = baseSpeed * levelFactor;
    
    console.log(`Niveau ${level}: Vitesse de base = ${baseSpeed}, Facteur de niveau = ${levelFactor}, Vitesse finale = ${speed}`);
    
    // Stocker les informations de l'orbe
    const orbInfo = {
        element: orb,
        letter: letter,
        speed: speed,
        type: orbType,
        position: { x: xPos, y: 0 },
        isSpecial: isSpecial,
        bonusType: bonusType
    };
    
    orbs.push(orbInfo);
    
    console.log(`Orbe créé avec la lettre: ${letter}${isSpecial ? ` (Bonus: ${bonusType})` : ''}`);
    
    // Calculer le délai pour le prochain orbe
    let nextSpawnTime;
    
    switch (difficulty) {
        case 'easy':
            nextSpawnTime = Math.max(5000, 5500 - (level * 50));
            break;
        case 'normal':
            nextSpawnTime = Math.max(4000, 4500 - (level * 50));
            break;
        case 'hard':
            nextSpawnTime = Math.max(3500, 4000 - (level * 50));
            break;
        default:
            nextSpawnTime = Math.max(4000, 4500 - (level * 50));
    }
    
    // Réduire le délai pendant l'événement spécial "Word Rush"
    if (specialEventActive && specialEventTimer === SPECIAL_EVENTS.WORD_RUSH) {
        nextSpawnTime *= 0.8; // Réduit de 0.7 à 0.8 pour être moins agressif
    }
    
    // Augmenter le délai pendant l'événement "pluie de lettres"
    if (specialEventActive && specialEventTimer === SPECIAL_EVENTS.LETTER_RAIN) {
        nextSpawnTime *= 1.5; // Plus de temps entre les orbes pendant la pluie de lettres
    }
    
    // Planifier la prochaine vérification de génération d'orbes
    if (gameActive) {
        orbSpawnTimer = setTimeout(checkAndSpawnOrbs, nextSpawnTime);
    }
}

/**
 * Vérifie le nombre d'orbes actuel et en génère de nouveaux si nécessaire
 */
function checkAndSpawnOrbs() {
    if (!gameActive) return;
    
    // Si nous avons moins que le minimum requis d'orbes, en créer immédiatement
    if (orbs.length < MIN_ORBS) {
        console.log(`Trop peu d'orbes (${orbs.length}/${MIN_ORBS}), génération immédiate.`);
        spawnOrb();
        return;
    }
    
    // Si nous n'avons pas atteint le maximum, générer un nouvel orbe
    if (orbs.length < MAX_ORBS) {
        spawnOrb();
    } else {
        // Sinon, attendre et vérifier à nouveau plus tard
        orbSpawnTimer = setTimeout(checkAndSpawnOrbs, 1000);
    }
}

/**
 * Anime les orbes magiques
 */
function animateOrbs() {
    if (!gameActive) return;
    
    const gameFrame = document.querySelector('.game-frame');
    const frameRect = gameFrame.getBoundingClientRect();
    
    // Déplacer chaque orbe vers le bas
    for (let i = orbs.length - 1; i >= 0; i--) {
        const orb = orbs[i];
        const element = orb.element;
        
        // Mettre à jour la position
        const currentTop = parseFloat(element.style.top) || 0;
        const newTop = currentTop + orb.speed;
        element.style.top = `${newTop}px`;
        
        // Vérifier si l'orbe a atteint le bas
        if (newTop > frameRect.height - 80) {
            // L'orbe a atteint le bas, perdre une vie
            loseLife();
            removeOrb(orb);
            orbs.splice(i, 1);
            
            // Vérifier si nous avons besoin de générer plus d'orbes
            if (orbs.length < MIN_ORBS && !orbSpawnTimer) {
                orbSpawnTimer = setTimeout(checkAndSpawnOrbs, 500);
            }
        }
    }
    
    // Continuer l'animation
    requestAnimationFrame(animateOrbs);
}

/**
 * Supprime un orbe du jeu
 */
function removeOrb(orb) {
    if (orb && orb.element) {
        // Créer un effet de disparition
        createOrbDisappearEffect(orb);
        
        // Supprimer l'élément du DOM
        orb.element.remove();
    }
}

/**
 * Crée un effet visuel lorsqu'un orbe disparaît
 */
function createOrbDisappearEffect(orb) {
    // Créer un élément pour l'effet
    const effect = document.createElement('div');
    effect.className = `spell-effect ${orb.type === 'fire' ? 'explosion' : 'frost-nova'}`;
    effect.style.position = 'absolute';
    effect.style.left = orb.element.style.left;
    effect.style.top = orb.element.style.top;
    
    // Ajouter l'effet au cadre du jeu
    const gameFrame = document.querySelector('.game-frame');
    gameFrame.appendChild(effect);
    
    // Supprimer l'effet après l'animation
    setTimeout(() => {
        effect.remove();
    }, 1000);
}

/**
 * Vérifie si le mot saisi commence par la lettre d'un orbe
 */
function checkWord(event) {
    // Vérifier si la touche Entrée a été pressée
    if (event && event.key === 'Enter') {
        // Empêcher le comportement par défaut de la touche Entrée
        event.preventDefault();
        
        // Récupérer et nettoyer l'entrée
        const input = wordInput.value.toUpperCase().trim();
        
        // Vérifier si l'entrée est vide
        if (!input || input.length < 2) {
            // Mot trop court
            showIncorrectEffect();
            // Vider l'entrée immédiatement
            wordInput.value = '';
            return;
        }
        
        // Vérifier si le mot existe dans la liste
        if (!words.includes(input)) {
            showIncorrectEffect();
            // Vider l'entrée après un court délai
            setTimeout(() => {
                wordInput.value = '';
                // Remettre le focus sur le champ de saisie
                wordInput.focus();
            }, 300);
            return;
        }
        
        // Vérifier si le mot a déjà été utilisé
        if (usedWords.has(input)) {
            showIncorrectEffect();
            // Vider l'entrée après un court délai
            setTimeout(() => {
                wordInput.value = '';
                // Remettre le focus sur le champ de saisie
                wordInput.focus();
            }, 300);
            return;
        }
        
        // Variable pour suivre si un orbe correspondant a été trouvé
        let orbFound = false;
        
        // Rechercher un orbe dont la lettre correspond à la première lettre du mot saisi
        for (let i = 0; i < orbs.length; i++) {
            const orbLetter = orbs[i].letter.toUpperCase();
            const firstLetter = input.charAt(0);
            
            if (orbLetter === firstLetter) {
                // Marquer qu'un orbe a été trouvé
                orbFound = true;
                
                // Ajouter le mot à la liste des mots utilisés
                usedWords.add(input);
                
                // Vérifier le combo (mots trouvés rapidement à la suite)
                const now = Date.now();
                if (now - lastWordTime < 3000) { // 3 secondes pour maintenir un combo
                    comboCount++;
                    updateComboDisplay();
                } else {
                    comboCount = 1;
                    updateComboDisplay();
                }
                lastWordTime = now;
                
                // Mot valide commençant par la lettre de l'orbe
                const points = calculatePoints(orbs[i], input);
                
                // Appliquer les bonuses
                let finalPoints = points;
                
                // Bonus de combo (10% par niveau de combo, à partir de 2)
                if (comboCount >= 2) {
                    const comboMultiplier = 1 + ((comboCount - 1) * 0.1);
                    finalPoints = Math.floor(finalPoints * comboMultiplier);
                }
                
                // Bonus de points doublés
                if (activeBonus === BONUS_TYPES.DOUBLE_POINTS) {
                    finalPoints *= 2;
                }
                
                // Ajouter les points au score
                score += finalPoints;
                
                // Vérifier si c'est un orbe spécial
                if (orbs[i].isSpecial) {
                    activateBonus(orbs[i].bonusType);
                }
                
                // Afficher un effet de points
                showPointsEffect(orbs[i], finalPoints);
                
                // Supprimer l'orbe
                removeOrb(orbs[i]);
                orbs.splice(i, 1);
                
                // Réinitialiser l'entrée immédiatement
                wordInput.value = '';
                
                // Remettre le focus sur le champ de saisie
                wordInput.focus();
                
                // Mettre à jour l'interface
                updateUI();
                
                // Vérifier si le niveau doit augmenter (tous les 100 points)
                if (score >= level * 100) {
                    levelUp();
                }
                
                // Sortir de la boucle dès qu'un orbe correspondant est trouvé
                break;
            }
        }
        
        // Si aucun orbe correspondant n'a été trouvé
        if (!orbFound) {
            comboCount = 0;
            updateComboDisplay();
            
            score = Math.max(0, score - 5);
            updateUI();
            showIncorrectEffect();
            
            // Réinitialiser l'entrée après un court délai
            setTimeout(() => {
                wordInput.value = '';
                // Remettre le focus sur le champ de saisie
                wordInput.focus();
            }, 300);
        }
    }
}

/**
 * Met à jour l'affichage du combo
 */
function updateComboDisplay() {
    if (!comboIndicator) return;
    
    if (comboCount >= 2) {
        comboIndicator.textContent = `Combo x${comboCount}`;
        comboIndicator.style.display = 'block';
        
        // Animation de pulse
        comboIndicator.classList.remove('pulse-animation');
        void comboIndicator.offsetWidth; // Force reflow
        comboIndicator.classList.add('pulse-animation');
    } else {
        comboIndicator.style.display = 'none';
    }
}

/**
 * Active un bonus
 */
function activateBonus(bonusType) {
    // Désactiver le bonus précédent
    if (activeBonus) {
        deactivateBonus(activeBonus);
    }
    
    // Activer le nouveau bonus
    activeBonus = bonusType;
    bonusDuration = 10; // 10 secondes par défaut
    
    // Afficher l'indicateur de bonus
    if (bonusIndicator) {
        bonusIndicator.textContent = getBonusDisplayName(bonusType);
        bonusIndicator.style.display = 'block';
        
        // Ajouter une classe CSS selon le type de bonus
        bonusIndicator.className = 'bonus-indicator';
        bonusIndicator.classList.add(`bonus-${bonusType}`);
    }
    
    // Appliquer l'effet du bonus
    switch (bonusType) {
        case BONUS_TYPES.DOUBLE_POINTS:
            // Déjà géré dans calculatePoints
            break;
            
        case BONUS_TYPES.SLOW_MOTION:
            // Ralentir tous les orbes existants
            orbs.forEach(orb => {
                orb.speed *= 0.5;
            });
            break;
            
        case BONUS_TYPES.EXTRA_LIFE:
            lives = Math.min(lives + 1, 5); // Maximum 5 vies
            updateUI();
            showMessage("Vie supplémentaire !");
            break;
            
        case BONUS_TYPES.FREEZE_TIME:
            // Arrêter le décompte du temps
            if (gameTimer) {
                clearInterval(gameTimer);
                gameTimer = null;
            }
            break;
            
        case BONUS_TYPES.LETTER_BOMB:
            // Faire exploser tous les orbes de même type
            const randomLetter = orbs.length > 0 ? 
                orbs[Math.floor(Math.random() * orbs.length)].letter : null;
                
            if (randomLetter) {
                const bombedOrbs = orbs.filter(orb => orb.letter === randomLetter);
                bombedOrbs.forEach(orb => {
                    score += 10;
                    showPointsEffect(orb, 10);
                    removeOrb(orb);
                });
                
                // Retirer les orbes explosés du tableau
                orbs = orbs.filter(orb => orb.letter !== randomLetter);
                updateUI();
                
                showMessage(`Explosion de la lettre ${randomLetter} !`);
            }
            
            // Ce bonus est instantané, donc on le désactive immédiatement
            setTimeout(() => {
                deactivateBonus(BONUS_TYPES.LETTER_BOMB);
            }, 100);
            break;
    }
    
    // Démarrer le timer pour désactiver le bonus
    if (bonusType !== BONUS_TYPES.EXTRA_LIFE && bonusType !== BONUS_TYPES.LETTER_BOMB) {
        setTimeout(() => {
            deactivateBonus(bonusType);
        }, bonusDuration * 1000);
        
        // Mettre à jour le timer de bonus
        updateBonusTimer();
    }
    
    console.log(`Bonus activé: ${bonusType} pour ${bonusDuration} secondes`);
}

/**
 * Désactive un bonus
 */
function deactivateBonus(bonusType) {
    if (activeBonus !== bonusType) return;
    
    // Annuler l'effet du bonus
    switch (bonusType) {
        case BONUS_TYPES.FREEZE_TIME:
            // Redémarrer le timer
            if (!gameTimer) {
                startTimer();
            }
            break;
    }
    
    // Masquer l'indicateur de bonus
    if (bonusIndicator) {
        bonusIndicator.style.display = 'none';
    }
    
    activeBonus = null;
    bonusDuration = 0;
    
    console.log(`Bonus désactivé: ${bonusType}`);
}

/**
 * Met à jour le timer de bonus
 */
function updateBonusTimer() {
    if (!activeBonus || bonusDuration <= 0) return;
    
    bonusDuration -= 1;
    
    if (bonusIndicator) {
        bonusIndicator.textContent = `${getBonusDisplayName(activeBonus)} (${bonusDuration}s)`;
    }
    
    if (bonusDuration > 0) {
        setTimeout(updateBonusTimer, 1000);
    } else {
        deactivateBonus(activeBonus);
    }
}

/**
 * Retourne le nom d'affichage d'un bonus
 */
function getBonusDisplayName(bonusType) {
    switch (bonusType) {
        case BONUS_TYPES.DOUBLE_POINTS:
            return "Points x2";
        case BONUS_TYPES.SLOW_MOTION:
            return "Ralenti";
        case BONUS_TYPES.EXTRA_LIFE:
            return "Vie +1";
        case BONUS_TYPES.FREEZE_TIME:
            return "Temps figé";
        case BONUS_TYPES.LETTER_BOMB:
            return "Explosion";
        default:
            return "Bonus";
    }
}

/**
 * Affiche un message temporaire
 */
function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'game-message';
    message.textContent = text;
    
    const gameFrame = document.querySelector('.game-frame');
    gameFrame.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('fade-out');
        setTimeout(() => {
            message.remove();
        }, 500);
    }, 2000);
}

/**
 * Calcule les points gagnés pour un orbe
 */
function calculatePoints(orb, word) {
    // Si c'est un orbe doré, retourner sa valeur spéciale
    if (orb.isGolden) {
        return orb.value || 100;
    }
    
    // Si c'est un orbe de défi, retourner sa valeur spéciale
    if (orb.isChallenge) {
        return orb.value || 30;
    }
    
    // Points de base selon la longueur du mot (bonus exponentiel pour les mots longs)
    const basePoints = Math.pow(word.length, 2) * 3;
    
    // Bonus selon la vitesse de l'orbe
    const speedBonus = Math.floor(orb.speed * 15);
    
    // Bonus selon la position verticale (plus haut = plus de points)
    const element = orb.element;
    const top = parseFloat(element.style.top) || 0;
    const gameFrame = document.querySelector('.game-frame');
    const frameHeight = gameFrame.getBoundingClientRect().height;
    const positionBonus = Math.floor((1 - (top / frameHeight)) * 30);
    
    // Bonus pour les mots très longs (8 lettres ou plus)
    const lengthBonus = word.length >= 8 ? 50 : 0;
    
    // Bonus pour les événements spéciaux
    let eventBonus = 0;
    if (specialEventActive) {
        switch (specialEventTimer) {
            case SPECIAL_EVENTS.WORD_RUSH:
                eventBonus = 20; // Bonus pendant la frénésie de mots
                break;
        }
    }
    
    // Bonus pour les orbes spéciaux
    let specialBonus = 0;
    if (orb.isSpecial) {
        specialBonus = 25;
    }
    
    return basePoints + speedBonus + positionBonus + lengthBonus + eventBonus + specialBonus;
}

/**
 * Affiche un effet visuel pour les points gagnés
 */
function showPointsEffect(orb, points) {
    // Créer un élément pour l'effet de points
    const effect = document.createElement('div');
    effect.className = 'points-effect';
    effect.textContent = `+${points}`;
    
    // Positionner l'effet près de l'orbe
    effect.style.position = 'absolute';
    effect.style.left = orb.element.style.left;
    effect.style.top = orb.element.style.top;
    
    // Ajouter l'effet au cadre du jeu
    const gameFrame = document.querySelector('.game-frame');
    gameFrame.appendChild(effect);
    
    // Supprimer l'effet après l'animation
    setTimeout(() => {
        effect.remove();
    }, 1000);
    
    // Ajouter un effet visuel pour le mot trouvé
    const wordEffect = document.createElement('div');
    wordEffect.className = 'spell-effect hit';
    wordEffect.style.position = 'absolute';
    wordEffect.style.left = orb.element.style.left;
    wordEffect.style.top = orb.element.style.top;
    
    // Ajouter l'effet au cadre du jeu
    gameFrame.appendChild(wordEffect);
    
    // Supprimer l'effet après l'animation
    setTimeout(() => {
        wordEffect.remove();
    }, 1000);
}

/**
 * Affiche un effet visuel pour un mot incorrect
 */
function showIncorrectEffect() {
    // Ajouter une classe pour l'effet de secousse
    wordInput.classList.add('shake');
    
    // Supprimer la classe après l'animation
    setTimeout(() => {
        wordInput.classList.remove('shake');
    }, 500);
}

/**
 * Perd une vie et vérifie si la partie est terminée
 */
function loseLife() {
    lives--;
    
    // Effet visuel pour la perte de vie
    const livesElement = document.getElementById('livesValue');
    livesElement.classList.add('life-lost');
    setTimeout(() => {
        livesElement.classList.remove('life-lost');
    }, 1000);
    
    // Mise à jour de l'interface
    updateUI();
    
    // Vérifier si la partie est terminée
    if (lives <= 0) {
        endGame(false);
    }
}

/**
 * Mélange un tableau (algorithme de Fisher-Yates)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Démarre le timer de jeu
 */
function startTimer() {
    // Créer un nouveau timer
    gameTimer = setInterval(() => {
        if (!gameActive) return;
        
        timeRemaining--;
        updateUI();
        
        // Vérifier si le temps est écoulé
        if (timeRemaining <= 0) {
            endGame(true);
        }
        
        // Augmenter le niveau toutes les 20 secondes
        if (timeRemaining % 20 === 0 && timeRemaining > 0) {
            level++;
            updateUI();
            
            // Effet visuel pour le changement de niveau
            const levelElement = document.getElementById('levelValue');
            levelElement.classList.add('highlight');
            setTimeout(() => {
                levelElement.classList.remove('highlight');
            }, 1000);
        }
    }, 1000);
}

/**
 * Termine la partie
 */
function endGame(victory = false) {
    console.log("Fin de la partie, victoire:", victory);
    
    // S'assurer que le jeu est bien arrêté
    gameActive = false;
    
    // Arrêter le timer
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    // Supprimer tous les orbes
    orbs.forEach(orb => removeOrb(orb));
    orbs = [];
    
    // Mise à jour de l'interface
    if (startButton) startButton.disabled = false;
    if (wordInput) wordInput.disabled = true;
    
    // Supprimer l'écouteur d'événement pour la saisie de mots
    if (wordInput) {
        wordInput.removeEventListener('keydown', checkWord);
        wordInput.removeEventListener('keypress', checkWord);
    }
    
    // Désactiver les bonus actifs
    if (activeBonus) {
        deactivateBonus(activeBonus);
    }
    
    // Terminer les événements spéciaux
    if (specialEventActive) {
        endSpecialEvent();
    }
    
    // Arrêter les timers
    clearTimeout(orbSpawnTimer);
    orbSpawnTimer = null;
    
    // Petit délai avant d'afficher la modale pour s'assurer que tout est bien nettoyé
    setTimeout(() => {
        // Afficher la modale de fin de jeu
        showGameOver();
    }, 500);
}

/**
 * Initialise les effets d'ambiance
 */
function initAmbientEffects() {
    // Création des particules flottantes
    const particles = document.querySelector('.floating-particles');
    if (particles) {
        // Vider le conteneur de particules existantes
        particles.innerHTML = '';
        
        // Créer des particules de feu et de glace
        for (let i = 0; i < 15; i++) {
            // Particule de feu
            const fireparticle = document.createElement('div');
            fireparticle.classList.add('particle', 'fire');
            fireparticle.style.left = `${Math.random() * 100}%`;
            fireparticle.style.top = `${Math.random() * 100}%`;
            fireparticle.style.animationDelay = `${Math.random() * 5}s`;
            fireparticle.style.animationDuration = `${10 + Math.random() * 10}s`;
            particles.appendChild(fireparticle);
            
            // Particule de glace
            const iceparticle = document.createElement('div');
            iceparticle.classList.add('particle', 'ice');
            iceparticle.style.left = `${Math.random() * 100}%`;
            iceparticle.style.top = `${Math.random() * 100}%`;
            iceparticle.style.animationDelay = `${Math.random() * 5}s`;
            iceparticle.style.animationDuration = `${10 + Math.random() * 10}s`;
            particles.appendChild(iceparticle);
        }
    }
    
    // Création des étoiles scintillantes
    const stars = document.querySelector('.twinkling-stars');
    if (stars) {
        // Vider le conteneur d'étoiles existantes
        stars.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            
            // Déterminer aléatoirement si c'est une étoile de feu, de glace ou normale
            const starType = Math.random();
            if (starType < 0.33) {
                star.classList.add('star', 'fire');
            } else if (starType < 0.66) {
                star.classList.add('star', 'ice');
            } else {
                star.classList.add('star');
            }
            
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.width = `${1 + Math.random() * 3}px`;
            star.style.height = star.style.width;
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.animationDuration = `${2 + Math.random() * 3}s`;
            stars.appendChild(star);
        }
    }
    
    console.log("Effets d'ambiance initialisés");
}

/**
 * Redémarre le jeu
 */
function restartGame() {
    closeModals();
    startGame();
}

/**
 * Augmente le niveau et déclenche des effets
 */
function levelUp() {
    level++;
    
    // Ajouter du temps supplémentaire (plus de temps aux niveaux supérieurs)
    const timeBonus = Math.min(20, 10 + Math.floor(level / 2)); // Entre 10 et 20 secondes selon le niveau
    timeRemaining += timeBonus;
    
    // Mettre à jour l'interface
    updateUI();
    
    // Afficher un effet visuel
    const levelUpEffect = document.createElement('div');
    levelUpEffect.className = 'level-up-effect';
    levelUpEffect.textContent = `Niveau ${level} ! +${timeBonus}s`;
    
    const gameFrame = document.querySelector('.game-frame');
    gameFrame.appendChild(levelUpEffect);
    
    setTimeout(() => {
        levelUpEffect.classList.add('fade-out');
        setTimeout(() => {
            levelUpEffect.remove();
        }, 500);
    }, 2000);
    
    // Chance de déclencher un événement spécial (20% de chance)
    if (level > 1 && Math.random() < 0.2) {
        triggerSpecialEvent();
    }
    
    console.log(`Niveau augmenté à ${level}, +${timeBonus} secondes ajoutées`);
    
    // Afficher un message pour encourager le joueur
    const messages = [
        "Excellent !",
        "Continuez comme ça !",
        "Vous êtes en forme !",
        "Impressionnant !",
        "Magnifique !",
        "Superbe !",
        "Fantastique !",
        "Incroyable !"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showMessage(randomMessage);
}

/**
 * Déclenche un événement spécial
 */
function triggerSpecialEvent() {
    // Si un événement est déjà actif, ne pas en déclencher un nouveau
    if (specialEventActive) return;
    
    // Choisir un événement aléatoire
    const eventKeys = Object.keys(SPECIAL_EVENTS);
    const eventType = SPECIAL_EVENTS[eventKeys[Math.floor(Math.random() * eventKeys.length)]];
    
    specialEventActive = true;
    specialEventTimer = eventType;
    
    // Durée de l'événement (15 secondes par défaut)
    const eventDuration = 15;
    
    // Afficher un message pour l'événement
    let eventMessage = "";
    
    // Appliquer l'effet de l'événement
    switch (eventType) {
        case SPECIAL_EVENTS.LETTER_RAIN:
            eventMessage = "Pluie de lettres !";
            // Générer plusieurs orbes rapidement
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (gameActive) spawnOrb();
                }, i * 500);
            }
            break;
            
        case SPECIAL_EVENTS.GOLDEN_LETTER:
            eventMessage = "Lettre dorée !";
            // Créer un orbe doré spécial qui vaut beaucoup de points
            createGoldenOrb();
            break;
            
        case SPECIAL_EVENTS.WORD_RUSH:
            eventMessage = "Frénésie de mots !";
            // Déjà géré dans spawnOrb (génération plus rapide)
            break;
            
        case SPECIAL_EVENTS.CHALLENGE_ROUND:
            eventMessage = "Défi spécial !";
            // Créer un défi avec plusieurs orbes de la même lettre
            createChallengeRound();
            break;
    }
    
    // Afficher un message pour l'événement
    showEventMessage(eventMessage, eventType);
    
    // Terminer l'événement après la durée spécifiée
    setTimeout(() => {
        endSpecialEvent();
    }, eventDuration * 1000);
    
    console.log(`Événement spécial déclenché: ${eventType} pour ${eventDuration} secondes`);
}

/**
 * Termine l'événement spécial en cours
 */
function endSpecialEvent() {
    if (!specialEventActive) return;
    
    specialEventActive = false;
    specialEventTimer = null;
    
    // Afficher un message de fin d'événement
    showMessage("Fin de l'événement spécial");
    
    console.log("Événement spécial terminé");
}

/**
 * Affiche un message d'événement spécial
 */
function showEventMessage(text, eventType) {
    const eventMessage = document.createElement('div');
    eventMessage.className = 'event-message';
    eventMessage.classList.add(`event-${eventType}`);
    eventMessage.textContent = text;
    
    const gameFrame = document.querySelector('.game-frame');
    gameFrame.appendChild(eventMessage);
    
    // Animation d'entrée
    eventMessage.style.animation = 'eventMessageEnter 0.5s forwards';
    
    setTimeout(() => {
        // Animation de sortie
        eventMessage.style.animation = 'eventMessageExit 0.5s forwards';
        setTimeout(() => {
            eventMessage.remove();
        }, 500);
    }, 3000);
}

/**
 * Crée un orbe doré spécial
 */
function createGoldenOrb() {
    if (!gameActive) return;
    
    // Générer une lettre aléatoire
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    
    // Créer l'élément orbe
    const orb = document.createElement('div');
    orb.className = 'magic-orb golden-orb';
    
    // Calculer la position dans le cadre du jeu
    const gameFrame = document.querySelector('.game-frame');
    const frameRect = gameFrame.getBoundingClientRect();
    
    // Position horizontale aléatoire à l'intérieur du cadre
    const xPos = Math.random() * (frameRect.width - 80) + 40;
    orb.style.position = 'absolute';
    orb.style.left = `${xPos}px`;
    orb.style.top = '0px';
    
    // Ajouter une animation spéciale
    orb.style.animation = `orbEnter 0.5s ease-out, goldenPulse 1s infinite alternate, rotate ${5 + Math.random() * 5}s linear infinite`;
    
    // Ajouter la lettre à l'orbe
    const letterSpan = document.createElement('span');
    letterSpan.className = 'orb-letter golden-letter';
    letterSpan.textContent = letter;
    orb.appendChild(letterSpan);
    
    // Ajouter l'orbe au cadre du jeu
    gameFrame.appendChild(orb);
    
    // Vitesse plus lente pour l'orbe doré
    const speed = 0.2;
    
    // Stocker les informations de l'orbe
    const orbInfo = {
        element: orb,
        letter: letter,
        speed: speed,
        type: 'golden',
        position: { x: xPos, y: 0 },
        isSpecial: true,
        isGolden: true,
        value: 100 // Valeur spéciale pour l'orbe doré
    };
    
    orbs.push(orbInfo);
    
    console.log(`Orbe doré créé avec la lettre: ${letter}`);
}

/**
 * Crée un défi avec plusieurs orbes de la même lettre
 */
function createChallengeRound() {
    if (!gameActive) return;
    
    // Générer une lettre aléatoire
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    
    // Vérifier s'il existe des mots disponibles commençant par cette lettre
    const availableWords = words.filter(word => 
        word.startsWith(letter) && !usedWords.has(word)
    );
    
    // Si aucun mot disponible avec cette lettre, choisir une autre lettre
    if (availableWords.length < 3) {
        setTimeout(createChallengeRound, 100);
        return;
    }
    
    // Créer plusieurs orbes avec la même lettre
    const numOrbs = 3 + Math.floor(Math.random() * 3); // 3 à 5 orbes
    
    for (let i = 0; i < numOrbs; i++) {
        setTimeout(() => {
            if (!gameActive) return;
            
            // Créer l'élément orbe
            const orb = document.createElement('div');
            orb.className = 'magic-orb challenge-orb';
            
            // Calculer la position dans le cadre du jeu
            const gameFrame = document.querySelector('.game-frame');
            const frameRect = gameFrame.getBoundingClientRect();
            
            // Position horizontale aléatoire à l'intérieur du cadre
            const xPos = Math.random() * (frameRect.width - 80) + 40;
            orb.style.position = 'absolute';
            orb.style.left = `${xPos}px`;
            orb.style.top = '0px';
            
            // Ajouter une animation spéciale
            orb.style.animation = `orbEnter 0.5s ease-out, challengePulse 1.5s infinite alternate, rotate ${5 + Math.random() * 5}s linear infinite`;
            
            // Ajouter la lettre à l'orbe
            const letterSpan = document.createElement('span');
            letterSpan.className = 'orb-letter challenge-letter';
            letterSpan.textContent = letter;
            orb.appendChild(letterSpan);
            
            // Ajouter l'orbe au cadre du jeu
            gameFrame.appendChild(orb);
            
            // Vitesse variable pour les orbes du défi
            const speed = 0.3 + (Math.random() * 0.2);
            
            // Stocker les informations de l'orbe
            const orbInfo = {
                element: orb,
                letter: letter,
                speed: speed,
                type: 'challenge',
                position: { x: xPos, y: 0 },
                isSpecial: true,
                isChallenge: true,
                value: 30 // Valeur spéciale pour les orbes du défi
            };
            
            orbs.push(orbInfo);
            
            console.log(`Orbe de défi créé avec la lettre: ${letter}`);
        }, i * 800); // Espacer la création des orbes
    }
}

/**
 * Retourne le nom d'affichage d'une difficulté
 */
function getDifficultyName(difficultyValue) {
    switch (difficultyValue) {
        case 'easy':
            return "Facile";
        case 'normal':
            return "Normal";
        case 'hard':
            return "Difficile";
        default:
            return "Normal";
    }
}

/**
 * Envoie le score au système de leaderboard global
 */
function submitScoreToGlobalLeaderboard(score, level, difficulty) {
    try {
        // Toujours demander le nom du joueur à la fin de chaque partie
        let playerName = prompt("Entrez votre nom pour le classement:", localStorage.getItem('playerName') || "");
        
        // Si l'utilisateur annule, utiliser le nom précédent ou "Anonyme"
        if (playerName === null) {
            playerName = localStorage.getItem('playerName') || "Anonyme";
        } else if (playerName.trim() === "") {
            playerName = "Anonyme";
        } else {
            // Sauvegarder le nom pour les prochaines parties
            localStorage.setItem('playerName', playerName);
        }
        
        console.log(`Envoi du score de ${playerName} au leaderboard global`);
        
        // Vérifier si Firebase est disponible
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            // Créer l'objet score
            const scoreData = {
                name: playerName,
                score: Number(score), // S'assurer que le score est un nombre
                level: Number(level), // S'assurer que le niveau est un nombre
                difficulty: difficulty,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                game: "word_bubbles", // Identifiant spécifique pour ce jeu
                date: new Date().toISOString() // Ajouter une date au format ISO pour compatibilité
            };
            
            console.log("Données du score à envoyer:", scoreData);
            
            // Envoyer le score à Firestore
            firebase.firestore().collection("word_bubbles_scores")
                .add(scoreData)
                .then((docRef) => {
                    console.log("Score envoyé avec succès au leaderboard global avec ID:", docRef.id);
                    showMessage("Score envoyé au classement global !");
                })
                .catch((error) => {
                    console.error("Erreur lors de l'envoi du score:", error);
                    showMessage("Erreur lors de l'envoi du score");
                });
                
            // Essayer également d'envoyer au classement général
            firebase.firestore().collection("all_games_scores")
                .add({
                    ...scoreData,
                    gameTitle: "Word Bubbles"
                })
                .then(() => {
                    console.log("Score envoyé au classement général");
                })
                .catch((error) => {
                    console.error("Erreur lors de l'envoi au classement général:", error);
                });
        } else {
            console.log("Firebase n'est pas disponible, score sauvegardé localement uniquement");
            
            // Sauvegarder le score localement avec le nom du joueur
            const localScore = {
                name: playerName,
                score: Number(score),
                level: Number(level),
                difficulty: difficulty,
                date: new Date().toISOString()
            };
            
            // Sauvegarder dans le localStorage
            let globalScores = JSON.parse(localStorage.getItem('wordBubblesGlobalScores') || '[]');
            globalScores.push(localScore);
            globalScores.sort((a, b) => b.score - a.score);
            if (globalScores.length > 10) globalScores = globalScores.slice(0, 10);
            localStorage.setItem('wordBubblesGlobalScores', JSON.stringify(globalScores));
            
            showMessage("Score sauvegardé localement");
        }
        
        return playerName;
    } catch (error) {
        console.error("Erreur lors de la soumission du score global:", error);
        return "Anonyme";
    }
}

/**
 * Sauvegarde un score dans le localStorage
 */
function saveScore(score, level, difficulty) {
    // Récupérer les scores existants
    let scores = getScores();
    
    // Récupérer le nom du joueur (ou utiliser "Anonyme" par défaut)
    const playerName = localStorage.getItem('playerName') || "Anonyme";
    
    // Ajouter le nouveau score
    const newScore = {
        name: playerName,
        score: score,
        level: level,
        difficulty: difficulty,
        date: new Date().toISOString(),
        // Générer un ID unique pour ce score
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    };
    
    scores.push(newScore);
    
    // Trier les scores par ordre décroissant
    scores.sort((a, b) => b.score - a.score);
    
    // Limiter à 10 scores maximum
    if (scores.length > 10) {
        scores = scores.slice(0, 10);
    }
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('wordBubblesScores', JSON.stringify(scores));
    
    console.log(`Score sauvegardé: ${score} points, niveau ${level}, difficulté ${difficulty}, joueur: ${playerName}`);
    
    return newScore;
}

/**
 * Récupère tous les scores du localStorage
 */
function getScores() {
    const scoresJson = localStorage.getItem('wordBubblesScores');
    if (!scoresJson) {
        return [];
    }
    
    try {
        return JSON.parse(scoresJson);
    } catch (e) {
        console.error("Erreur lors de la récupération des scores:", e);
        return [];
    }
}

/**
 * Récupère le meilleur score
 */
function getTopScore() {
    const scores = getScores();
    if (scores.length === 0) {
        return 0;
    }
    
    return scores[0].score;
}

/**
 * Affiche les top scores dans un élément HTML
 */
function displayTopScores(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Conteneur de scores ${containerId} non trouvé`);
        return;
    }
    
    const scores = getScores();
    
    if (scores.length === 0) {
        container.innerHTML = '<p class="no-scores">Aucun score enregistré pour le moment.</p>';
        return;
    }
    
    // Créer un tableau HTML pour afficher les scores
    let html = `
        <table class="scores-table">
            <thead>
                <tr>
                    <th>Rang</th>
                    <th>Joueur</th>
                    <th>Score</th>
                    <th>Niveau</th>
                    <th>Difficulté</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    scores.forEach((score, index) => {
        const date = new Date(score.date);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        const difficultyName = getDifficultyName(score.difficulty);
        const playerName = score.name || "Anonyme";
        
        html += `
            <tr class="${index === 0 ? 'top-score' : ''}">
                <td>${index + 1}</td>
                <td>${playerName}</td>
                <td>${score.score}</td>
                <td>${score.level}</td>
                <td>${difficultyName}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}
