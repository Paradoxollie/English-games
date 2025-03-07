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

// Charger la liste de mots depuis le fichier JSON
fetch('data/filtered_words.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // S'assurer que data.words est un tableau
        if (!data.words || !Array.isArray(data.words)) {
            throw new Error('Format de données invalide: data.words doit être un tableau');
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
    
    // Récupération des éléments DOM
    gameCanvas = document.getElementById('gameCanvas');
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
    
    console.log("Modales:", helpModal, gameOverModal);
    
    // Vérification que tous les éléments sont présents
    if (!gameCanvas || !wordInput || !startButton || !helpButton) {
        console.error('Éléments DOM manquants. Vérifiez que tous les éléments nécessaires sont présents dans le HTML.');
        return;
    }
    
    // Initialisation du canvas
    ctx = gameCanvas.getContext('2d');
    resizeCanvas();
    
    // Ajout des écouteurs d'événements
    window.addEventListener('resize', resizeCanvas);
    
    startButton.addEventListener('click', () => {
        // Vérifier que la liste de mots est chargée
        if (words.length === 0) {
            console.error('La liste de mots n\'est pas encore chargée');
            return;
        }
        startGame();
        console.log("Bouton Commencer cliqué");
    });
    
    helpButton.addEventListener('click', () => {
        showHelp();
        console.log("Bouton Aide cliqué");
    });
    
    // Ajouter l'écouteur d'événement pour la saisie de mots
    wordInput.addEventListener('keypress', checkWord);
    
    // Initialisation des gestionnaires pour les modales
    initModalHandlers();
    
    // S'assurer que le cadre du jeu est correctement configuré
    const gameFrame = document.querySelector('.game-frame');
    if (gameFrame) {
        gameFrame.style.position = 'relative';
        gameFrame.style.overflow = 'hidden';
        console.log("Cadre du jeu configuré");
    }
    
    // Initialisation des effets d'ambiance
    initAmbientEffects();
    
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
    
    // Fermer les modales en cliquant sur le bouton de fermeture
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModals();
            console.log("Bouton fermer cliqué");
        });
    });
    
    // Fermer les modales en cliquant en dehors du contenu
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                closeModals();
                console.log("Clic en dehors de la modale");
            }
        });
    });
    
    // Gestionnaire pour le bouton de redémarrage
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            restartGame();
            console.log("Bouton Rejouer cliqué");
        });
    }
}

/**
 * Affiche la modale d'aide
 */
function showHelp() {
    console.log("Affichage de la modale d'aide");
    if (helpModal) {
        helpModal.style.display = 'flex';
        helpModal.classList.add('show');
    } else {
        console.error("La modale d'aide n'a pas été trouvée");
    }
}

/**
 * Affiche la modale de fin de jeu
 */
function showGameOver() {
    console.log("Affichage de la modale de fin de jeu");
    // Mettre à jour les scores finaux
    if (finalScore) {
        finalScore.textContent = score;
    }
    if (finalLevel) {
        finalLevel.textContent = level;
    }
    gameOverModal.classList.add('show');
}

/**
 * Ferme toutes les modales
 */
function closeModals() {
    console.log("Fermeture de toutes les modales");
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });
}

/**
 * Démarre une nouvelle partie
 */
function startGame() {
    console.log("Démarrage du jeu");
    
    // Réinitialisation des variables de jeu
    gameActive = true;
    score = 0;
    level = 1;
    lives = 3;
    timeRemaining = 60;
    orbs = [];
    usedWords.clear();
    
    // Mise à jour de l'interface
    updateUI();
    
    // Fermer les modales
    closeModals();
    
    // Activation/désactivation des boutons
    startButton.disabled = true;
    wordInput.disabled = false;
    wordInput.value = '';
    wordInput.focus();
    
    // Démarrer la génération d'orbes
    spawnOrb();
    
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
    
    // Déterminer le type d'orbe (feu, glace)
    const orbType = Math.random() < 0.5 ? 'fire' : 'frost';
    
    // Créer l'élément orbe
    const orb = document.createElement('div');
    orb.className = `magic-orb ${orbType}`;
    
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
    orb.style.animation = `orbEnter 0.5s ease-out, rotate ${5 + Math.random() * 5}s linear infinite, pulse ${2 + Math.random() * 2}s infinite alternate`;
    
    // Ajouter la lettre à l'orbe
    const letterSpan = document.createElement('span');
    letterSpan.className = 'orb-letter';
    letterSpan.textContent = letter;
    orb.appendChild(letterSpan);
    
    // Ajouter l'orbe au cadre du jeu
    gameFrame.appendChild(orb);
    
    // Définir la vitesse de descente (plus lente au début, augmente progressivement)
    const baseSpeed = 0.3; // Vitesse de base plus lente
    const levelMultiplier = 0.15; // Augmentation plus douce par niveau
    const speed = baseSpeed + (level * levelMultiplier);
    
    // Stocker les informations de l'orbe
    const orbInfo = {
        element: orb,
        letter: letter,
        speed: speed,
        type: orbType,
        position: { x: xPos, y: 0 }
    };
    
    orbs.push(orbInfo);
    
    console.log(`Orbe créé avec la lettre: ${letter}`);
    
    // Planifier la création du prochain orbe (délai plus long)
    const nextSpawnTime = Math.max(2000, 2500 - (level * 100)); // Délai minimum de 2 secondes
    if (gameActive) {
        setTimeout(spawnOrb, nextSpawnTime);
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
        const input = wordInput.value.toUpperCase().trim();
        
        if (input.length < 2) {
            // Mot trop court
            showIncorrectEffect();
            return;
        }
        
        // Vérifier si le mot existe dans la liste
        if (!words.includes(input)) {
            showIncorrectEffect();
            return;
        }
        
        // Vérifier si le mot a déjà été utilisé
        if (usedWords.has(input)) {
            showIncorrectEffect();
            return;
        }
        
        // Rechercher un orbe dont la lettre correspond à la première lettre du mot saisi
        for (let i = 0; i < orbs.length; i++) {
            const orbLetter = orbs[i].letter.toUpperCase();
            const firstLetter = input.charAt(0);
            
            if (orbLetter === firstLetter) {
                // Ajouter le mot à la liste des mots utilisés
                usedWords.add(input);
                
                // Mot valide commençant par la lettre de l'orbe
                const points = calculatePoints(orbs[i], input);
                score += points;
                
                // Afficher un effet de points
                showPointsEffect(orbs[i], points);
                
                // Supprimer l'orbe
                removeOrb(orbs[i]);
                orbs.splice(i, 1);
                
                // Réinitialiser l'entrée
                wordInput.value = '';
                
                // Mettre à jour l'interface
                updateUI();
                
                return;
            }
        }
        
        // Aucun orbe correspondant trouvé
        score = Math.max(0, score - 5);
        updateUI();
        showIncorrectEffect();
        
        // Réinitialiser l'entrée après un court délai
        setTimeout(() => {
            wordInput.value = '';
        }, 300);
    }
}

/**
 * Calcule les points gagnés pour un orbe
 */
function calculatePoints(orb, word) {
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
    
    return basePoints + speedBonus + positionBonus + lengthBonus;
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
    startButton.disabled = false;
    wordInput.disabled = true;
    
    // Supprimer l'écouteur d'événement pour la saisie de mots
    wordInput.removeEventListener('keypress', checkWord);
    
    // Afficher la modale de fin de jeu
    showGameOver();
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
