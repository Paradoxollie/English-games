// ===== ENIGMAN SCROLLS - DÉBOGAGE =====
// Script pour résoudre les problèmes de fonctionnement du jeu

// Fonction pour vérifier si les dépendances sont chargées
function checkDependencies() {
    console.log('Vérification des dépendances...');
    
    // Vérifier si Firebase est chargé
    if (typeof firebase === 'undefined') {
        console.error('Firebase n\'est pas chargé !');
        return false;
    }
    
    // Vérifier si le jeu original est chargé
    if (typeof gameState === 'undefined') {
        console.error('Le jeu original n\'est pas chargé correctement !');
        return false;
    }
    
    // Vérifier si les effets nature sont chargés
    if (typeof natureEffects === 'undefined') {
        console.error('Les effets nature ne sont pas chargés !');
        return false;
    }
    
    console.log('Toutes les dépendances sont chargées correctement.');
    return true;
}

// Fonction pour initialiser le jeu manuellement
function initializeGame() {
    console.log('Initialisation manuelle du jeu...');
    
    try {
        // Réinitialiser l'état du jeu
        if (typeof gameState !== 'undefined') {
            gameState.currentWord = '';
            gameState.currentGuess = '';
            gameState.guesses = [];
            gameState.gameStatus = 'playing';
            gameState.score = 0;
            gameState.maxAttempts = 6;
            gameState.usedWords = new Set();
            
            console.log('État du jeu réinitialisé.');
        }
        
        // Initialiser le jeu
        if (typeof initGame === 'function') {
            initGame();
            console.log('Jeu initialisé avec succès.');
        } else {
            console.error('La fonction initGame n\'existe pas !');
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du jeu :', error);
    }
}

// Fonction pour corriger les écouteurs d'événements
function fixEventListeners() {
    console.log('Correction des écouteurs d\'événements...');
    
    try {
        // Supprimer les écouteurs d'événements existants
        const keyboardButtons = document.querySelectorAll('.enigma-keyboard button');
        keyboardButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
        
        // Ajouter de nouveaux écouteurs d'événements
        const newKeyboardButtons = document.querySelectorAll('.enigma-keyboard button');
        newKeyboardButtons.forEach(button => {
            button.addEventListener('click', function() {
                const key = this.textContent;
                
                if (key === 'Enter') {
                    handleEnter();
                } else if (key === '←') {
                    handleDelete();
                } else {
                    handleKeyInput(key);
                }
                
                // Ajouter un effet de clic
                this.classList.add('button-click');
                setTimeout(() => {
                    this.classList.remove('button-click');
                }, 200);
            });
        });
        
        console.log('Écouteurs d\'événements corrigés.');
    } catch (error) {
        console.error('Erreur lors de la correction des écouteurs d\'événements :', error);
    }
}

// Fonction pour gérer l'entrée
function handleEnter() {
    console.log('Gestion de l\'entrée...');
    
    try {
        // Vérifier si le mot est complet
        if (gameState.currentGuess.length !== gameState.currentWord.length) {
            console.log('Le mot n\'est pas complet.');
            return;
        }
        
        // Vérifier si le mot est correct
        if (gameState.currentGuess === gameState.currentWord) {
            console.log('Mot correct !');
            handleCorrectGuess();
        } else {
            console.log('Mot incorrect.');
            // Ajouter la tentative
            gameState.guesses.push({
                guess: gameState.currentGuess,
                result: evaluateGuess(gameState.currentGuess)
            });
            
            // Vérifier si le jeu est terminé
            if (gameState.guesses.length >= gameState.maxAttempts) {
                handleGameOver();
            } else {
                // Préparer la prochaine tentative
                prepareNextGuess();
                renderGrid();
                updateKeyboardColors();
            }
        }
    } catch (error) {
        console.error('Erreur lors de la gestion de l\'entrée :', error);
    }
}

// Fonction pour évaluer une tentative
function evaluateGuess(guess) {
    const result = [];
    const word = gameState.currentWord;
    
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === word[i]) {
            result.push('correct');
        } else if (word.includes(guess[i])) {
            result.push('present');
        } else {
            result.push('incorrect');
        }
    }
    
    return result;
}

// Fonction pour mettre à jour les couleurs du clavier
function updateKeyboardColors() {
    const keyboardButtons = document.querySelectorAll('.enigma-keyboard button');
    const letterStatus = {};
    
    // Réinitialiser les classes
    keyboardButtons.forEach(button => {
        button.classList.remove('correct', 'present', 'incorrect');
    });
    
    // Collecter le statut de chaque lettre
    gameState.guesses.forEach(({ guess, result }) => {
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i];
            const status = result[i];
            
            // Ne pas déclasser une lettre (correct > present > incorrect)
            if (!letterStatus[letter] || 
                (letterStatus[letter] === 'incorrect' && status !== 'incorrect') ||
                (letterStatus[letter] === 'present' && status === 'correct')) {
                letterStatus[letter] = status;
            }
        }
    });
    
    // Appliquer les classes
    keyboardButtons.forEach(button => {
        const letter = button.textContent;
        if (letterStatus[letter]) {
            button.classList.add(letterStatus[letter]);
        }
    });
}

// Fonction pour déboguer le jeu
function debugGame() {
    console.log('Débogage du jeu...');
    
    // Vérifier les dépendances
    if (!checkDependencies()) {
        console.error('Problème avec les dépendances. Tentative de correction...');
        
        // Charger les scripts manquants si nécessaire
        if (typeof firebase === 'undefined') {
            loadScript('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
            loadScript('https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js');
        }
    }
    
    // Initialiser le jeu manuellement
    initializeGame();
    
    // Corriger les écouteurs d'événements
    fixEventListeners();
    
    console.log('Débogage terminé.');
}

// Fonction pour charger un script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Exécuter le débogage lorsque la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page chargée. Démarrage du débogage...');
    
    // Attendre un peu pour s'assurer que tous les scripts sont chargés
    setTimeout(debugGame, 1000);
});

function checkWord(word) {
    if (isWordCorrect(word)) {
        // console.log('Mot correct !');
        return true;
    } else {
        // console.log('Mot incorrect.');
        return false;
    }
} 