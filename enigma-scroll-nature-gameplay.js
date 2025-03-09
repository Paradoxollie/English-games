// ===== ENIGMAN SCROLLS - NATURE MMORPG GAMEPLAY =====
// Extensions de gameplay pour le thème MMORPG nature

// État du jeu étendu
const gameExtension = {
    level: 1,
    wordsFound: 0,
    powerUps: {
        hint: 3,
        time: 2,
        skip: 1
    },
    timeRemaining: 60,
    timer: null,
    combo: 0,
    maxCombo: 0
};

// Fonction pour initialiser les extensions de gameplay
function initGameExtensions() {
    // Mettre à jour l'affichage initial
    updateLevelDisplay();
    updateWordsFoundDisplay();
    updatePowerUpCounts();
    
    // Démarrer le timer
    startTimer();
    
    // Ajouter des écouteurs d'événements pour les power-ups
    setupPowerUps();
}

// Fonction pour mettre à jour l'affichage du niveau
function updateLevelDisplay() {
    const levelElement = document.getElementById('level');
    if (levelElement) {
        levelElement.textContent = gameExtension.level;
    }
}

// Fonction pour mettre à jour l'affichage des mots trouvés
function updateWordsFoundDisplay() {
    const wordsFoundElement = document.getElementById('words-found');
    if (wordsFoundElement) {
        wordsFoundElement.textContent = gameExtension.wordsFound;
    }
}

// Fonction pour mettre à jour l'affichage des power-ups
function updatePowerUpCounts() {
    // Mettre à jour les compteurs de power-ups dans l'interface
    updatePowerUpCount('hint-power', gameExtension.powerUps.hint);
    updatePowerUpCount('time-power', gameExtension.powerUps.time);
    updatePowerUpCount('skip-power', gameExtension.powerUps.skip);
}

// Fonction pour mettre à jour le compteur d'un power-up spécifique
function updatePowerUpCount(id, count) {
    const powerUp = document.getElementById(id);
    if (!powerUp) return;
    
    // Vérifier si le compteur existe déjà
    let counter = powerUp.querySelector('.power-up-counter');
    
    if (!counter) {
        // Créer le compteur s'il n'existe pas
        counter = document.createElement('div');
        counter.className = 'power-up-counter';
        powerUp.appendChild(counter);
    }
    
    // Mettre à jour le compteur
    counter.textContent = `x${count}`;
    
    // Désactiver le power-up si le compteur est à 0
    if (count <= 0) {
        powerUp.classList.add('power-up-disabled');
    } else {
        powerUp.classList.remove('power-up-disabled');
    }
}

// Fonction pour configurer les power-ups
function setupPowerUps() {
    // Power-up d'indice
    document.getElementById('hint-power').addEventListener('click', function() {
        if (gameExtension.powerUps.hint <= 0) return;
        
        // Utiliser le power-up
        gameExtension.powerUps.hint--;
        updatePowerUpCounts();
        
        // Effet visuel
        this.classList.add('power-up-used');
        setTimeout(() => {
            this.classList.remove('power-up-used');
        }, 500);
        
        // Révéler une lettre aléatoire
        revealRandomLetter();
    });
    
    // Power-up de temps
    document.getElementById('time-power').addEventListener('click', function() {
        if (gameExtension.powerUps.time <= 0) return;
        
        // Utiliser le power-up
        gameExtension.powerUps.time--;
        updatePowerUpCounts();
        
        // Effet visuel
        this.classList.add('power-up-used');
        setTimeout(() => {
            this.classList.remove('power-up-used');
        }, 500);
        
        // Ajouter du temps
        addExtraTime(30);
    });
    
    // Power-up de saut
    document.getElementById('skip-power').addEventListener('click', function() {
        if (gameExtension.powerUps.skip <= 0) return;
        
        // Utiliser le power-up
        gameExtension.powerUps.skip--;
        updatePowerUpCounts();
        
        // Effet visuel
        this.classList.add('power-up-used');
        setTimeout(() => {
            this.classList.remove('power-up-used');
        }, 500);
        
        // Passer au mot suivant
        skipCurrentWord();
    });
}

// Fonction pour révéler une lettre aléatoire
function revealRandomLetter() {
    // Vérifier si le jeu est en cours
    if (gameState.gameStatus !== 'playing') return;
    
    // Obtenir les indices des lettres non révélées
    const currentGuessArray = gameState.currentGuess.split('');
    const hiddenIndices = [];
    
    for (let i = 1; i < gameState.currentWord.length; i++) {
        if (currentGuessArray[i] !== gameState.currentWord[i]) {
            hiddenIndices.push(i);
        }
    }
    
    // S'il n'y a pas de lettres cachées, ne rien faire
    if (hiddenIndices.length === 0) {
        natureEffects.enhanceMessage("Toutes les lettres sont déjà révélées !", "warning");
        return;
    }
    
    // Choisir un indice aléatoire parmi les lettres cachées
    const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
    
    // Révéler la lettre
    currentGuessArray[randomIndex] = gameState.currentWord[randomIndex];
    gameState.currentGuess = currentGuessArray.join('');
    
    // Mettre à jour l'affichage
    renderGrid();
    
    // Effet visuel
    const cells = document.querySelectorAll('.word-cell');
    const cell = cells[randomIndex + (gameState.guesses.length * gameState.currentWord.length)];
    
    if (cell) {
        cell.classList.add('correct');
        cell.classList.add('correct-animation');
        
        // Créer un événement personnalisé pour l'animation de particules
        const rect = cell.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        natureEffects.addParticleEffect(x, y, '#2e8b57');
        
        setTimeout(() => {
            cell.classList.remove('correct-animation');
        }, 500);
    }
    
    // Message
    natureEffects.enhanceMessage("Une lettre a été révélée !", "success");
}

// Fonction pour ajouter du temps supplémentaire
function addExtraTime(seconds) {
    gameExtension.timeRemaining += seconds;
    
    // Effet visuel
    const timeElement = document.getElementById('time-remaining');
    if (timeElement) {
        timeElement.classList.add('time-added');
        setTimeout(() => {
            timeElement.classList.remove('time-added');
        }, 1000);
    }
    
    // Message
    natureEffects.enhanceMessage(`+${seconds} secondes ajoutées !`, "success");
}

// Fonction pour passer au mot suivant
function skipCurrentWord() {
    // Vérifier si le jeu est en cours
    if (gameState.gameStatus !== 'playing') return;
    
    // Effet visuel
    natureEffects.enhanceMessage(`Mot passé : ${gameState.currentWord}`, "info");
    
    // Passer au mot suivant
    setTimeout(() => {
        startNewWord();
    }, 1500);
}

// Fonction pour démarrer le timer
function startTimer() {
    // Créer l'élément de temps s'il n'existe pas
    if (!document.getElementById('time-remaining')) {
        const statsContainer = document.querySelector('.game-stats');
        if (statsContainer) {
            const timeItem = document.createElement('div');
            timeItem.className = 'stat-item';
            timeItem.innerHTML = `
                <span class="stat-label">Temps</span>
                <span class="stat-value" id="time-remaining">${gameExtension.timeRemaining}</span>
            `;
            statsContainer.appendChild(timeItem);
        }
    }
    
    // Démarrer le timer
    gameExtension.timer = setInterval(() => {
        gameExtension.timeRemaining--;
        
        // Mettre à jour l'affichage
        const timeElement = document.getElementById('time-remaining');
        if (timeElement) {
            timeElement.textContent = gameExtension.timeRemaining;
            
            // Ajouter une classe d'alerte si le temps est faible
            if (gameExtension.timeRemaining <= 10) {
                timeElement.classList.add('time-low');
            } else {
                timeElement.classList.remove('time-low');
            }
        }
        
        // Vérifier si le temps est écoulé
        if (gameExtension.timeRemaining <= 0) {
            clearInterval(gameExtension.timer);
            handleTimeUp();
        }
    }, 1000);
}

// Fonction pour gérer la fin du temps
function handleTimeUp() {
    // Vérifier si le jeu est en cours
    if (gameState.gameStatus !== 'playing') return;
    
    // Mettre à jour le statut du jeu
    gameState.gameStatus = 'lost';
    
    // Message
    natureEffects.enhanceMessage(`Temps écoulé ! Le mot était : ${gameState.currentWord}`, "error");
    
    // Effet visuel
    const gameFrame = document.querySelector('.game-frame');
    if (gameFrame) {
        natureEffects.addShakeEffect(gameFrame);
    }
    
    // Proposer de rejouer
    setTimeout(() => {
        promptForScore();
        addPlayAgainButton();
    }, 2000);
}

// Fonction pour augmenter le niveau
function levelUp() {
    gameExtension.level++;
    updateLevelDisplay();
    
    // Ajouter des power-ups en fonction du niveau
    if (gameExtension.level % 3 === 0) {
        gameExtension.powerUps.hint++;
        natureEffects.enhanceMessage("Vous avez gagné un indice supplémentaire !", "success");
    }
    
    if (gameExtension.level % 5 === 0) {
        gameExtension.powerUps.time++;
        natureEffects.enhanceMessage("Vous avez gagné du temps supplémentaire !", "success");
    }
    
    if (gameExtension.level % 10 === 0) {
        gameExtension.powerUps.skip++;
        natureEffects.enhanceMessage("Vous avez gagné un saut de mot !", "success");
    }
    
    updatePowerUpCounts();
    
    // Effet visuel de niveau supérieur
    natureEffects.addLevelUpEffect();
}

// Fonction pour gérer un mot trouvé
function handleWordFound() {
    // Incrémenter le compteur de mots trouvés
    gameExtension.wordsFound++;
    updateWordsFoundDisplay();
    
    // Incrémenter le combo
    gameExtension.combo++;
    if (gameExtension.combo > gameExtension.maxCombo) {
        gameExtension.maxCombo = gameExtension.combo;
    }
    
    // Ajouter des points bonus en fonction du combo
    const comboBonus = Math.min(gameExtension.combo * 2, 20);
    gameState.score += comboBonus;
    
    // Mettre à jour l'affichage du score
    document.getElementById("score").textContent = gameState.score;
    
    // Effet visuel de combo
    if (gameExtension.combo > 1) {
        showComboEffect(gameExtension.combo);
    }
    
    // Vérifier si le joueur doit monter de niveau
    if (gameExtension.wordsFound % 5 === 0) {
        levelUp();
    }
    
    // Ajouter du temps en fonction du niveau
    const timeBonus = Math.max(5, 20 - gameExtension.level);
    gameExtension.timeRemaining += timeBonus;
    
    // Effet visuel de vague
    natureEffects.addWordCompleteEffect();
}

// Fonction pour afficher l'effet de combo
function showComboEffect(combo) {
    const comboElement = document.createElement('div');
    comboElement.className = 'combo-effect';
    comboElement.textContent = `Combo x${combo}!`;
    
    document.body.appendChild(comboElement);
    
    // Animation
    setTimeout(() => {
        comboElement.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        comboElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(comboElement);
        }, 500);
    }, 2000);
}

// Fonction pour gérer un mot incorrect
function handleIncorrectWord() {
    // Réinitialiser le combo
    gameExtension.combo = 0;
    
    // Effet visuel
    const gameFrame = document.querySelector('.game-frame');
    if (gameFrame) {
        natureEffects.addShakeEffect(gameFrame);
    }
}

// Fonction pour étendre le jeu original
function extendOriginalGame() {
    // Sauvegarder les fonctions originales
    const originalHandleCorrectGuess = handleCorrectGuess;
    const originalHandleGameOver = handleGameOver;
    const originalStartNewWord = startNewWord;
    
    // Remplacer la fonction de gestion de mot correct
    window.handleCorrectGuess = async function() {
        await originalHandleCorrectGuess();
        handleWordFound();
    };
    
    // Remplacer la fonction de game over
    window.handleGameOver = async function() {
        await originalHandleGameOver();
        clearInterval(gameExtension.timer);
    };
    
    // Remplacer la fonction de nouveau mot
    window.startNewWord = async function() {
        await originalStartNewWord();
        // Réinitialiser le timer si nécessaire
        if (gameExtension.timer) {
            clearInterval(gameExtension.timer);
            gameExtension.timeRemaining = 60 + (gameExtension.level * 5);
            startTimer();
        }
    };
}

// Initialiser les extensions lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les styles pour les nouvelles fonctionnalités
    addExtensionStyles();
    
    // Initialiser les extensions de gameplay
    setTimeout(() => {
        initGameExtensions();
        extendOriginalGame();
    }, 500); // Délai pour s'assurer que le jeu original est initialisé
});

// Fonction pour ajouter les styles des extensions
function addExtensionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .power-up-counter {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: var(--nature-gold);
            color: var(--nature-dark);
            font-size: 0.8rem;
            font-weight: bold;
            padding: 2px 5px;
            border-radius: 10px;
            box-shadow: 0 0 5px var(--glow-gold);
        }
        
        .power-up-disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .time-added {
            animation: timeAdded 1s ease;
        }
        
        .time-low {
            color: #f44336 !important;
            animation: timeLow 1s infinite;
        }
        
        .combo-effect {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            color: var(--nature-gold);
            font-family: var(--font-title);
            font-size: 3rem;
            font-weight: bold;
            text-shadow: 0 0 10px var(--glow-gold), 0 0 20px var(--glow-green);
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: all 0.5s ease;
        }
        
        .combo-effect.show {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        
        @keyframes timeAdded {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); color: var(--success); }
            100% { transform: scale(1); }
        }
        
        @keyframes timeLow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
} 