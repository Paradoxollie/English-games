// Jeu Speed Verb Challenge
document.addEventListener('DOMContentLoaded', function() {
    // Données des verbes irréguliers - maintenant chargées depuis verb-data.js
    // L'objet verbData est maintenant disponible globalement
    
    // Vérifier que verbData est chargé
    if (!window.verbData) {
        console.error("Verb data not loaded! Make sure verb-data.js is included before this script.");
        alert("Erreur: Les données des verbes n'ont pas été chargées. Veuillez rafraîchir la page.");
        return;
    }

    // Variables du jeu
    let score = 0;
    let timeLeft = 90;
    let timerInterval = null;
    let currentVerb = "";
    let difficulty = "1";
    let playerLevel = 1;
    let playerXP = 0;
    let xpToNextLevel = 100;
    let correctStreak = 0;
    let highestStreak = 0;
    let comboMultiplier = 1;
    let verbsCompleted = 0;
    
    // NOUVEAU: Variable pour suivre si un changement de verbe est en cours
    let verbChangeInProgress = false;
    
    // NOUVEAU: Variable pour suivre le dernier verbe affiché
    let lastDisplayedVerb = "";
    
    // NOUVEAU: Variable pour compter les appels à displayVerb
    let displayVerbCallCount = 0;
    
    // NOUVEAU: Variable pour protéger contre les interférences externes
    let gameInstanceId = "SVG_" + Math.random().toString(36).substring(2, 9);
    console.log(`🔐 Instance de jeu créée avec ID: ${gameInstanceId}`);
    
    // Éléments du DOM
    const elements = {
        // États du jeu
        gameStates: {
            start: document.getElementById('game-start'),
            playing: document.getElementById('game-playing'),
            gameOver: document.getElementById('game-over')
        },
        
        // Boutons
        startButton: document.getElementById('start-game-btn'),
        checkButton: document.getElementById('check-answer-btn'),
        skipButton: document.getElementById('skip-verb-btn'),
        saveScoreButton: document.getElementById('save-score-btn'),
        playAgainButton: document.getElementById('play-again-btn'),
        
        // Affichage du jeu
        currentVerbDisplay: document.getElementById('current-verb'),
        verbTranslation: document.getElementById('verb-translation'),
        verbFormInputs: document.getElementById('verb-form-inputs'),
        feedbackMessage: document.getElementById('feedback-message'),
        
        // HUD
        playerLevelDisplay: document.getElementById('player-level'),
        playerScoreDisplay: document.getElementById('player-score'),
        timeLeftDisplay: document.getElementById('time-left'),
        comboDisplay: document.getElementById('combo-multiplier'),
        xpProgressBar: document.getElementById('xp-progress'),
        
        // Game over
        finalScoreValue: document.getElementById('final-score-value'),
        finalLevelDisplay: document.getElementById('final-level'),
        verbsCompletedDisplay: document.getElementById('verbs-completed'),
        highestComboDisplay: document.getElementById('highest-combo'),
        playerNameInput: document.getElementById('player-name'),
        
        // Leaderboard
        leaderboardBody: document.getElementById('leaderboard-body')
    };
    
    // Initialiser les effets visuels
    const gameEffects = new GameEffects();
    
    // Fonction pour changer l'état du jeu
    function setGameState(state) {
        // Cacher tous les états
        Object.values(elements.gameStates).forEach(el => {
            if (el) el.classList.remove('active');
        });
        
        // Afficher l'état demandé
        if (elements.gameStates[state]) {
            elements.gameStates[state].classList.add('active');
        }
    }
    
    // Fonction pour jouer un son
    function playSound(soundName) {
        // Ignorer si les fichiers audio ne sont pas disponibles
        console.log(`Sound would play: ${soundName}`);
        return;
    }
    
    // Fonction pour démarrer le jeu
    function startGame() {
        console.log("Starting game...");
        
        // NOUVEAU: Vérifier si un changement de verbe est déjà en cours
        if (verbChangeInProgress) {
            console.log("⛔ BLOQUÉ: Un changement de verbe est déjà en cours, démarrage ignoré");
            return;
        }
        
        // Marquer le début du changement
        verbChangeInProgress = true;
        console.log("🔒 Verrouillage activé: début du démarrage du jeu");
        
        // Récupérer le niveau de difficulté
        const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
        difficultyOptions.forEach(option => {
            if (option.checked) {
                difficulty = option.value;
            }
        });
        
        // Réinitialiser les variables de jeu
        score = 0;
        timeLeft = 90;
        playerLevel = 1;
        playerXP = 0;
        xpToNextLevel = 100;
        correctStreak = 0;
        highestStreak = 0;
        comboMultiplier = 1;
        verbsCompleted = 0;
        displayVerbCallCount = 0;
        
        // Mettre à jour l'affichage
        updateHUD();
        
        // Changer l'état du jeu
        setGameState('playing');
        
        // NOUVEAU: Désactiver les boutons pendant le démarrage
        const checkButton = document.getElementById('check-answer-btn');
        const skipButton = document.getElementById('skip-verb-btn');
        
        if (checkButton) checkButton.disabled = true;
        if (skipButton) skipButton.disabled = true;
        
        // NOUVEAU: Utiliser setTimeout pour éviter les appels multiples
        setTimeout(() => {
            // Afficher un verbe
            verbChangeInProgress = false; // Réinitialiser avant d'appeler displayVerb
            console.log("🔓 Verrouillage désactivé: jeu prêt à démarrer");
            
            // Afficher le premier verbe
            displayVerb();
            
            // Réactiver les boutons
            if (checkButton) checkButton.disabled = false;
            if (skipButton) skipButton.disabled = false;
            
            // Démarrer le timer
            startTimer();
            
            console.log("Game started!");
        }, 500);
        
        // Déclencher l'événement pour les effets visuels
        document.dispatchEvent(new CustomEvent('gameStart'));
    }
    
    // Fonction pour afficher un verbe aléatoire
    function displayVerb() {
        // Incrémenter le compteur d'appels
        displayVerbCallCount++;
        const currentCallCount = displayVerbCallCount;
        
        console.log(`[CALL #${currentCallCount}] displayVerb appelé`);
        
        // NOUVEAU: Vérifier si un changement de verbe est déjà en cours
        if (verbChangeInProgress) {
            console.log(`[CALL #${currentCallCount}] ⛔ BLOQUÉ: Un changement de verbe est déjà en cours, ignoré`);
            return;
        }
        
        // NOUVEAU: Vérifier si c'est le premier appel (pour éviter les appels multiples au démarrage)
        const isFirstCall = currentCallCount === 1;
        
        // Marquer le début du changement
        verbChangeInProgress = true;
        console.log(`[CALL #${currentCallCount}] 🔒 Verrouillage activé: début du changement de verbe`);
        
        // Désactiver les boutons pendant le changement
        const checkButton = document.getElementById('check-answer-btn');
        const skipButton = document.getElementById('skip-verb-btn');
        
        if (checkButton) checkButton.disabled = true;
        if (skipButton) skipButton.disabled = true;
        
        // Obtenir un verbe aléatoire
        const verbKeys = Object.keys(verbData);
        const newVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
        
        console.log(`[CALL #${currentCallCount}] Nouveau verbe sélectionné: "${newVerb}" (ancien: "${currentVerb}")`);
        
        // Sauvegarder le dernier verbe affiché
        lastDisplayedVerb = currentVerb;
        
        // Mettre à jour le verbe courant
        currentVerb = newVerb;
        
        // Afficher le verbe
        if (elements.currentVerbDisplay) {
            elements.currentVerbDisplay.textContent = currentVerb;
        }
        
        if (elements.verbTranslation) {
            elements.verbTranslation.textContent = `(${verbData[currentVerb][2]})`;
        }
        
        // Créer les champs de saisie selon la difficulté
        if (elements.verbFormInputs) {
            elements.verbFormInputs.innerHTML = '';
            
            if (difficulty === "1" || difficulty === "3") {
                // Champ pour le passé simple
                const pastSimpleContainer = document.createElement('div');
                pastSimpleContainer.className = 'input-group';
                
                const pastSimpleLabel = document.createElement('label');
                pastSimpleLabel.textContent = 'Past Simple:';
                pastSimpleLabel.setAttribute('for', 'past-simple');
                
                const pastSimpleInput = document.createElement('input');
                pastSimpleInput.type = 'text';
                pastSimpleInput.id = 'past-simple';
                pastSimpleInput.className = 'verb-input';
                pastSimpleInput.setAttribute('autocomplete', 'off');
                
                pastSimpleContainer.appendChild(pastSimpleLabel);
                pastSimpleContainer.appendChild(pastSimpleInput);
                elements.verbFormInputs.appendChild(pastSimpleContainer);
            }
            
            if (difficulty === "2" || difficulty === "3") {
                // Champ pour le participe passé
                const pastParticipleContainer = document.createElement('div');
                pastParticipleContainer.className = 'input-group';
                
                const pastParticipleLabel = document.createElement('label');
                pastParticipleLabel.textContent = 'Past Participle:';
                pastParticipleLabel.setAttribute('for', 'past-participle');
                
                const pastParticipleInput = document.createElement('input');
                pastParticipleInput.type = 'text';
                pastParticipleInput.id = 'past-participle';
                pastParticipleInput.className = 'verb-input';
                pastParticipleInput.setAttribute('autocomplete', 'off');
                
                pastParticipleContainer.appendChild(pastParticipleLabel);
                pastParticipleContainer.appendChild(pastParticipleInput);
                elements.verbFormInputs.appendChild(pastParticipleContainer);
            }
            
            // Focus sur le premier champ
            const firstInput = elements.verbFormInputs.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }
        
        // NOUVEAU: Délai plus long pour le premier verbe
        const unlockDelay = isFirstCall ? 1000 : 500;
        
        // NOUVEAU: Marquer la fin du changement après un délai
        setTimeout(() => {
            verbChangeInProgress = false;
            console.log(`[CALL #${currentCallCount}] 🔓 Verrouillage désactivé: changement de verbe terminé`);
            
            // Réactiver les boutons
            if (checkButton) checkButton.disabled = false;
            if (skipButton) skipButton.disabled = false;
        }, unlockDelay);
    }
    
    // Fonction pour vérifier si une réponse est correcte, en tenant compte des alternatives
    function isCorrectAnswer(userAnswer, correctAnswer) {
        // Normaliser les réponses (minuscules, sans espaces superflus)
        userAnswer = userAnswer.trim().toLowerCase();
        correctAnswer = correctAnswer.trim().toLowerCase();
        
        // Si les réponses sont identiques, c'est correct
        if (userAnswer === correctAnswer) {
            return true;
        }
        
        // Vérifier les alternatives (séparées par /)
        if (correctAnswer.includes('/')) {
            const alternatives = correctAnswer.split('/').map(alt => alt.trim());
            return alternatives.includes(userAnswer);
        }
        
        return false;
    }
    
    // Fonction pour vérifier la réponse
    function checkAnswer() {
        console.log("Vérification de la réponse...");
        
        // NOUVEAU: Ne pas vérifier si un changement de verbe est en cours
        if (verbChangeInProgress) {
            console.log("⛔ BLOQUÉ: Un changement de verbe est en cours, vérification ignorée");
            return;
        }
        
        // Récupérer les valeurs saisies par l'utilisateur
        let userPastSimple = '';
        let userPastParticiple = '';
        let isCorrect = false;
        
        const pastSimpleInput = document.getElementById('past-simple');
        if (pastSimpleInput) {
            userPastSimple = pastSimpleInput.value.trim().toLowerCase();
        }
        
        const pastParticipleInput = document.getElementById('past-participle');
        if (pastParticipleInput) {
            userPastParticiple = pastParticipleInput.value.trim().toLowerCase();
        }
        
        // IMPORTANT: Ne pas continuer si les champs requis sont vides
        if ((difficulty === "1" || difficulty === "3") && userPastSimple === '') {
            console.log("Champ 'Past Simple' vide, ne pas vérifier la réponse");
            showFeedback(false, "Veuillez entrer le passé simple");
            return;
        }
        
        if ((difficulty === "2" || difficulty === "3") && userPastParticiple === '') {
            console.log("Champ 'Past Participle' vide, ne pas vérifier la réponse");
            showFeedback(false, "Veuillez entrer le participe passé");
            return;
        }
        
        // Vérifier que le verbe actuel existe dans les données
        if (!verbData[currentVerb]) {
            console.error(`Le verbe "${currentVerb}" n'existe pas dans les données!`);
            showFeedback(false, "Erreur: Verbe inconnu. Passez au suivant.");
            setTimeout(() => {
                displayVerb();
            }, 1500);
            return;
        }
        
        // Récupérer les réponses correctes
        const correctPastSimple = verbData[currentVerb][0].toLowerCase();
        const correctPastParticiple = verbData[currentVerb][1].toLowerCase();
        
        console.log("Vérification pour le verbe:", currentVerb);
        console.log("Réponses de l'utilisateur:", { userPastSimple, userPastParticiple });
        console.log("Réponses correctes:", { correctPastSimple, correctPastParticiple });
        
        // Vérifier la réponse selon la difficulté
        if (difficulty === "1") {
            // Niveau 1: seulement le passé simple
            isCorrect = isCorrectAnswer(userPastSimple, correctPastSimple);
            console.log("Difficulté 1 - Passé simple:", isCorrect ? "CORRECT" : "INCORRECT");
        } else if (difficulty === "2") {
            // Niveau 2: seulement le participe passé
            isCorrect = isCorrectAnswer(userPastParticiple, correctPastParticiple);
            console.log("Difficulté 2 - Participe passé:", isCorrect ? "CORRECT" : "INCORRECT");
        } else {
            // Niveau 3: les deux formes
            const pastSimpleCorrect = isCorrectAnswer(userPastSimple, correctPastSimple);
            const pastParticipleCorrect = isCorrectAnswer(userPastParticiple, correctPastParticiple);
            isCorrect = pastSimpleCorrect && pastParticipleCorrect;
            
            console.log("Difficulté 3 - Passé simple:", pastSimpleCorrect ? "CORRECT" : "INCORRECT");
            console.log("Difficulté 3 - Participe passé:", pastParticipleCorrect ? "CORRECT" : "INCORRECT");
            console.log("Difficulté 3 - Résultat final:", isCorrect ? "CORRECT" : "INCORRECT");
        }
        
        // Désactiver les boutons pendant le feedback
        const checkButton = document.getElementById('check-answer-btn');
        const skipButton = document.getElementById('skip-verb-btn');
        
        if (checkButton) checkButton.disabled = true;
        if (skipButton) skipButton.disabled = true;
        
        // NOUVEAU: Marquer le début du changement
        verbChangeInProgress = true;
        console.log("🔒 Verrouillage activé: début du traitement de la réponse");
        
        // Gérer la réponse
        if (isCorrect) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer();
        }
        
        // Sauvegarder le verbe actuel pour vérifier qu'il ne change pas
        const currentVerbBeforeChange = currentVerb;
        
        // Afficher un nouveau verbe après un délai
        setTimeout(() => {
            console.log(`Changement de verbe: "${currentVerbBeforeChange}" -> nouveau verbe`);
            
            // NOUVEAU: Vérifier que le verbe n'a pas déjà changé
            if (currentVerb === currentVerbBeforeChange) {
                verbChangeInProgress = false; // Réinitialiser avant d'appeler displayVerb
                console.log("🔓 Verrouillage désactivé: prêt pour le prochain verbe");
                displayVerb();
            } else {
                console.log("⚠️ Le verbe a déjà changé, pas besoin d'appeler displayVerb à nouveau");
                verbChangeInProgress = false;
            }
            
            // Réactiver les boutons
            if (checkButton) checkButton.disabled = false;
            if (skipButton) skipButton.disabled = false;
        }, 1500);
    }
    
    // Fonction pour gérer une réponse correcte
    function handleCorrectAnswer() {
        // Incrémenter le streak et le multiplicateur
        correctStreak++;
        if (correctStreak > highestStreak) {
            highestStreak = correctStreak;
        }
        
        comboMultiplier = 1 + (correctStreak * 0.1);
        
        // Calculer les points selon la difficulté
        let points = parseInt(difficulty);
        points = Math.round(points * comboMultiplier);
        
        // Ajouter les points au score
        score += points;
        
        // Incrémenter le compteur de verbes complétés
        verbsCompleted++;
        
        // Ajouter de l'expérience
        addExperience(points * 5);
        
        // Mettre à jour l'affichage
        updateHUD();
        
        // Afficher un message de réussite
        showFeedback(true, `Correct ! +${points} points`);
        
        // Effet visuel de réussite
        const inputElement = document.querySelector('.verb-input');
        const gameContainer = document.querySelector('.game-universe');
        const verbDisplay = document.getElementById('current-verb');
        
        if (inputElement && gameEffects) {
            gameEffects.successEffect(inputElement);
        }
        
        // Animations supplémentaires pour une réponse correcte
        if (verbDisplay) {
            verbDisplay.classList.add('success-pulse');
            setTimeout(() => {
                verbDisplay.classList.remove('success-pulse');
            }, 1000);
        }
        
        // CORRECTION: Vérifier si la fonction createSuccessParticles existe avant de l'appeler
        if (gameContainer && typeof createSuccessParticles === 'function') {
            createSuccessParticles(20 + (correctStreak * 5));
        } else {
            console.log("Effet de particules ignoré (fonction non disponible)");
        }
        
        // Déclencher l'événement pour les effets visuels
        document.dispatchEvent(new CustomEvent('correctAnswer'));
    }
    
    // Function to show error animation
    function showErrorAnimation() {
        console.log("Showing error animation");
        
        // Ajouter la classe d'erreur à la carte du verbe
        const verbCard = document.querySelector('.verb-card');
        if (verbCard) {
            verbCard.classList.add('error');
            
            // Retirer la classe après l'animation
            setTimeout(() => {
                verbCard.classList.remove('error');
            }, 600);
        }
        
        // Créer l'effet de flash d'erreur qui couvre tout l'écran
        const errorFlash = document.createElement('div');
        errorFlash.className = 'error-flash';
        document.body.appendChild(errorFlash);
        
        // Supprimer l'élément flash après l'animation
        setTimeout(() => {
            if (errorFlash && errorFlash.parentNode) {
                errorFlash.parentNode.removeChild(errorFlash);
            }
        }, 500);
        
        // Ajouter l'effet de tremblement à l'interface du jeu
        const gameInterface = document.querySelector('.game-interface');
        if (gameInterface) {
            gameInterface.classList.add('screen-shake');
            
            // Retirer la classe après l'animation
            setTimeout(() => {
                gameInterface.classList.remove('screen-shake');
            }, 500);
        }
        
        // Jouer le son d'erreur
        playSound('error');
    }
    
    // Fonction pour gérer une réponse incorrecte
    function handleIncorrectAnswer() {
        console.log("Handling incorrect answer");
        
        // Réduire le temps restant comme pénalité (5 secondes)
        timeLeft = Math.max(1, timeLeft - 5);
        
        // Montrer l'animation d'erreur
        showErrorAnimation();
        
        // Afficher le feedback
        showFeedback(false, "Incorrect! Essayez encore.");
        
        // Vider les champs d'entrée (mais pas tous pour que le joueur n'ait pas à tout retaper)
        const currentInputField = document.activeElement;
        if (currentInputField && currentInputField.classList.contains('verb-input')) {
            currentInputField.value = '';
        }
        
        // Mettre à jour l'affichage
        updateHUD();
        
        // Déclencher l'événement pour les effets visuels
        document.dispatchEvent(new CustomEvent('incorrectAnswer'));
    }
    
    // Fonction pour passer un verbe
    function skipVerb() {
        console.log("Bannissement du verbe...");
        
        // NOUVEAU: Ne pas sauter si un changement de verbe est en cours
        if (verbChangeInProgress) {
            console.log("⛔ BLOQUÉ: Un changement de verbe est en cours, bannissement ignoré");
            return;
        }
        
        // Désactiver les boutons pendant l'animation
        const checkButton = document.getElementById('check-answer-btn');
        const skipButton = document.getElementById('skip-verb-btn');
        
        if (checkButton) checkButton.disabled = true;
        if (skipButton) skipButton.disabled = true;
        
        // NOUVEAU: Marquer le début du changement
        verbChangeInProgress = true;
        console.log("🔒 Verrouillage activé: début du bannissement");
        
        // Réinitialiser le streak et le multiplicateur
        correctStreak = 0;
        comboMultiplier = 1;
        
        // Mettre à jour l'affichage
        updateHUD();
        
        // Afficher un message de bannissement
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.innerHTML = `<span class="skip-message">Verbe banni !</span>`;
            feedbackElement.classList.add('skip');
            
            // Afficher le feedback
            feedbackElement.style.opacity = '1';
            feedbackElement.style.transform = 'translateY(0)';
            
            // Masquer le feedback après un délai
            setTimeout(() => {
                feedbackElement.style.opacity = '0';
                feedbackElement.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    feedbackElement.innerHTML = '';
                    feedbackElement.classList.remove('skip');
                }, 500);
            }, 1500);
        }
        
        // Effet visuel de bannissement
        const verbDisplay = document.getElementById('current-verb');
        if (verbDisplay && gameEffects) {
            verbDisplay.classList.add('banish-animation');
            setTimeout(() => {
                verbDisplay.classList.remove('banish-animation');
            }, 1000);
        }
        
        // Sauvegarder le verbe actuel pour vérifier qu'il ne change pas
        const currentVerbBeforeChange = currentVerb;
        
        // Afficher un nouveau verbe après un délai
        setTimeout(() => {
            console.log(`Changement de verbe: "${currentVerbBeforeChange}" -> nouveau verbe`);
            
            // NOUVEAU: Vérifier que le verbe n'a pas déjà changé
            if (currentVerb === currentVerbBeforeChange) {
                verbChangeInProgress = false; // Réinitialiser avant d'appeler displayVerb
                console.log("🔓 Verrouillage désactivé: prêt pour le prochain verbe");
                displayVerb();
            } else {
                console.log("⚠️ Le verbe a déjà changé, pas besoin d'appeler displayVerb à nouveau");
                verbChangeInProgress = false;
            }
            
            // Réactiver les boutons
            if (checkButton) checkButton.disabled = false;
            if (skipButton) skipButton.disabled = false;
        }, 1000);
    }
    
    // Fonction pour afficher un message de feedback
    function showFeedback(isCorrect, message) {
        const feedbackElement = document.getElementById('feedback-message');
        if (!feedbackElement) return;
        
        if (isCorrect) {
            feedbackElement.innerHTML = `<span class="success-message">${message}</span>`;
            feedbackElement.classList.add('success');
        } else {
            feedbackElement.innerHTML = `<span class="error-message">${message}</span>`;
            feedbackElement.classList.add('error');
        }
        
        // Afficher le feedback
        feedbackElement.style.opacity = '1';
        feedbackElement.style.transform = 'translateY(0)';
        
        // Masquer le feedback après un délai
        setTimeout(() => {
            feedbackElement.style.opacity = '0';
            feedbackElement.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                feedbackElement.innerHTML = '';
                feedbackElement.classList.remove('success', 'error');
            }, 500);
        }, 2000);
    }
    
    // Fonction pour mettre à jour le HUD
    function updateHUD() {
        if (elements.playerLevelDisplay) {
            elements.playerLevelDisplay.textContent = playerLevel;
        }
        
        if (elements.playerScoreDisplay) {
            elements.playerScoreDisplay.textContent = score;
        }
        
        if (elements.timeLeftDisplay) {
            elements.timeLeftDisplay.textContent = timeLeft;
            
            // Ajouter une classe d'urgence si le temps est presque écoulé
            if (timeLeft <= 10) {
                elements.timeLeftDisplay.classList.add('time-warning');
            } else {
                elements.timeLeftDisplay.classList.remove('time-warning');
            }
        }
        
        if (elements.comboDisplay) {
            elements.comboDisplay.textContent = `x${comboMultiplier.toFixed(1)}`;
        }
        
        if (elements.xpProgressBar) {
            const progressPercent = (playerXP / xpToNextLevel) * 100;
            elements.xpProgressBar.style.width = `${progressPercent}%`;
        }
    }
    
    // Fonction pour ajouter de l'expérience
    function addExperience(xp) {
        // Ajouter l'XP
        playerXP += xp;
        
        // Vérifier si le joueur monte de niveau
        if (playerXP >= xpToNextLevel) {
            levelUp();
        }
        
        // Mettre à jour la barre d'XP avec animation
        const xpProgress = document.getElementById('xp-progress');
        if (xpProgress) {
            // Sauvegarder l'ancienne valeur pour l'animation
            const oldWidth = parseFloat(xpProgress.style.width || '0');
            const newWidth = (playerXP / xpToNextLevel) * 100;
            
            // Ajouter la classe d'animation
            xpProgress.classList.add('xp-bar-pulse');
            
            // Mettre à jour la largeur
            xpProgress.style.width = `${newWidth}%`;
            
            // Retirer la classe d'animation après un délai
            setTimeout(() => {
                xpProgress.classList.remove('xp-bar-pulse');
            }, 1000);
        }
    }
    
    // Fonction pour monter de niveau
    function levelUp() {
        // Incrémenter le niveau
        playerLevel++;
        
        // Réinitialiser l'XP
        playerXP -= xpToNextLevel;
        
        // Augmenter l'XP nécessaire pour le prochain niveau
        xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
        
        // Bonus de temps
        timeLeft += 10;
        
        // Mettre à jour l'affichage
        updateHUD();
        
        // Afficher une notification de montée de niveau
        showLevelUpNotification(playerLevel);
        
        // Effet visuel de montée de niveau
        if (gameEffects) {
            gameEffects.levelUpEffect();
        }
        
        // Déclencher l'événement pour les effets visuels
        document.dispatchEvent(new CustomEvent('levelUp', { 
            detail: { level: playerLevel } 
        }));
    }
    
    // Fonction pour afficher une notification de montée de niveau
    function showLevelUpNotification(level) {
        const achievementContainer = document.getElementById('achievements-container');
        if (!achievementContainer) return;
        
        const achievement = document.createElement('div');
        achievement.className = 'achievement';
        
        achievement.innerHTML = `
            <div class="achievement-title">
                <span class="achievement-icon">⭐</span>
                Niveau Supérieur !
            </div>
            <div class="achievement-desc">Vous avez atteint le niveau ${level}. Nouveaux pouvoirs débloqués !</div>
        `;
        
        achievementContainer.appendChild(achievement);
        
        // Supprimer la notification après l'animation
        setTimeout(() => {
            achievement.remove();
        }, 5000);
    }
    
    // Fonction pour démarrer le timer
    function startTimer() {
        // Arrêter le timer existant
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Démarrer un nouveau timer
        timerInterval = setInterval(() => {
            // Décrémenter le temps
            timeLeft--;
            
            // Mettre à jour l'affichage
            if (elements.timeLeftDisplay) {
                elements.timeLeftDisplay.textContent = timeLeft;
                
                // Ajouter une classe d'urgence si le temps est presque écoulé
                if (timeLeft <= 10) {
                    elements.timeLeftDisplay.classList.add('time-warning');
                } else {
                    elements.timeLeftDisplay.classList.remove('time-warning');
                }
            }
            
            // Vérifier si le temps est écoulé
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }
    
    // Fonction pour terminer le jeu
    function endGame() {
        // Arrêter le timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        console.log("Jeu terminé !");
        
        // Mise à jour des statistiques finales
        if (elements.finalScoreValue) {
            elements.finalScoreValue.textContent = score;
        }
        
        if (elements.finalLevelDisplay) {
            elements.finalLevelDisplay.textContent = playerLevel;
        }
        
        if (elements.verbsCompletedDisplay) {
            elements.verbsCompletedDisplay.textContent = verbsCompleted;
        }
        
        if (elements.highestComboDisplay) {
            elements.highestComboDisplay.textContent = `x${(1 + highestStreak * 0.1).toFixed(1)}`;
        }
        
        // Afficher les bonnes réponses pour le verbe actuel
        showCurrentVerbAnswers();
        
        // Changer l'état du jeu vers Game Over
        setGameState('gameOver');
        
        // Focus sur le champ de nom
        if (elements.playerNameInput) {
            elements.playerNameInput.focus();
        }
        
        // NOUVEAU: Utiliser notre système de leaderboard dédié
        if (window.SpeedVerbLeaderboard) {
            console.log("Using dedicated SpeedVerbLeaderboard system");
            
            // Initialiser le leaderboard s'il ne l'est pas déjà
            if (!SpeedVerbLeaderboard.leaderboardTable) {
                SpeedVerbLeaderboard.init('speed-verb-leaderboard');
            } else {
                // Sinon, juste recharger les scores
                SpeedVerbLeaderboard.loadScores();
            }
        } else {
            console.error("SpeedVerbLeaderboard not available");
            // Fallback sur notre méthode locale
            loadLeaderboard();
        }
        
        // Déclencher l'événement pour les effets visuels
        document.dispatchEvent(new CustomEvent('gameEnd'));
    }
    
    // Nouvelle fonction pour afficher les réponses correctes
    function showCurrentVerbAnswers() {
        // Créer un élément pour afficher les réponses correctes
        const answersContainer = document.createElement('div');
        answersContainer.className = 'correct-answers-container';
        
        // Obtenir les réponses correctes pour le verbe actuel
        const infinitive = currentVerb;
        const pastSimple = verbData[currentVerb][0];
        const pastParticiple = verbData[currentVerb][1];
        const translation = verbData[currentVerb][2];
        
        // Contenu HTML avec les réponses correctes
        answersContainer.innerHTML = `
            <h3 class="answers-title">Réponses correctes pour "${infinitive}" (${translation})</h3>
            <div class="answers-grid">
                <div class="answer-item">
                    <span class="answer-label">Infinitif:</span>
                    <span class="answer-value">${infinitive}</span>
                </div>
                <div class="answer-item">
                    <span class="answer-label">Passé Simple:</span>
                    <span class="answer-value">${pastSimple}</span>
                </div>
                <div class="answer-item">
                    <span class="answer-label">Participe Passé:</span>
                    <span class="answer-value">${pastParticiple}</span>
                </div>
            </div>
            <p class="answers-note">N'oubliez pas de mémoriser ces verbes irréguliers pour votre prochain essai !</p>
        `;
        
        // Ajouter un bouton pour fermer
        const closeButton = document.createElement('button');
        closeButton.className = 'close-answers-btn';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(answersContainer);
        });
        
        answersContainer.appendChild(closeButton);
        
        // Ajouter au body avec une animation
        document.body.appendChild(answersContainer);
        
        // Retirer automatiquement après 5 secondes
        setTimeout(() => {
            if (document.body.contains(answersContainer)) {
                // Ajouter une classe pour l'animation de sortie
                answersContainer.classList.add('fade-out');
                
                // Supprimer après l'animation
                setTimeout(() => {
                    if (document.body.contains(answersContainer)) {
                        document.body.removeChild(answersContainer);
                    }
                }, 500);
            }
        }, 5000);
    }
    
    // Fonction pour sauvegarder le score
    function saveScore() {
        // Récupérer le nom du joueur
        const playerName = elements.playerNameInput ? 
            elements.playerNameInput.value.trim() : 'Joueur Anonyme';
        
        console.log("Saving score with player name:", playerName);
        
        // NOUVEAU: Utiliser notre système de leaderboard dédié
        if (window.SpeedVerbLeaderboard) {
            console.log("Using dedicated SpeedVerbLeaderboard system to save score");
            const saveResult = SpeedVerbLeaderboard.saveScore(
                playerName,
                score,
                playerLevel,
                verbsCompleted,
                difficulty
            );
            
            if (saveResult) {
                // Réinitialiser le jeu après un délai pour que l'utilisateur voie le message
                setTimeout(() => {
                    resetGame();
                }, 1500);
            }
        } else {
            console.error("SpeedVerbLeaderboard not available, using fallback method");
            
            // CODE FALLBACK: Sauvegarder directement dans Firebase
            if (window.firebase && window.firebase.firestore) {
                const db = window.firebase.firestore();
                
                // Ajouter le score à la base de données
                db.collection('speed_verb_scores').add({
                    playerName: playerName || 'Joueur Anonyme',
                    score: score,
                    level: playerLevel,
                    verbsCompleted: verbsCompleted,
                    difficulty: difficulty,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    // Afficher un message de succès
                    console.log('Score saved successfully!');
                    alert('Score sauvegardé avec succès !');
                    
                    // Réinitialiser le jeu
                    resetGame();
                })
                .catch(error => {
                    console.error('Error saving score:', error);
                    alert('Erreur: Le score n\'a pas pu être sauvegardé. Veuillez réessayer.');
                });
            } else {
                console.error('Firebase not available');
                alert('Erreur: Firebase n\'est pas disponible. Le score n\'a pas pu être sauvegardé.');
            }
        }
    }
    
    // Fonction pour réinitialiser le jeu
    function resetGame() {
        // Réinitialiser les variables
        score = 0;
        timeLeft = 90;
        playerLevel = 1;
        playerXP = 0;
        xpToNextLevel = 100;
        correctStreak = 0;
        highestStreak = 0;
        comboMultiplier = 1;
        verbsCompleted = 0;
        
        // Changer l'état du jeu
        setGameState('start');
    }
    
    // Fonction pour charger le leaderboard
    function loadLeaderboard() {
        const leaderboardBody = elements.leaderboardBody;
        if (!leaderboardBody) {
            console.error("Leaderboard body element not found");
            return;
        }
        
        // Afficher un message de chargement
        leaderboardBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="4">Loading top scores...</td>
            </tr>
        `;
        
        console.log("Trying to load leaderboard from Firebase...");
        
        // Récupérer directement la collection via window.db
        if (window.db) {
            try {
                console.log("Firebase DB instance available, fetching scores...");
                
                window.db.collection("speed_verb_scores")
                    .orderBy("score", "desc")
                    .limit(5)
                    .get()
                    .then((querySnapshot) => {
                        console.log("Scores fetched successfully:", querySnapshot.size);
                        
                        // Vider le tableau
                        leaderboardBody.innerHTML = '';
                        
                        // Vérifier s'il y a des scores
                        if (querySnapshot.empty) {
                            leaderboardBody.innerHTML = `
                                <tr class="empty-row">
                                    <td colspan="4">No scores yet. Be the first to play!</td>
                                </tr>
                            `;
                            return;
                        }
                        
                        // Ajouter chaque score au tableau
                        let rank = 1;
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            console.log("Score data:", data);
                            
                            const row = document.createElement('tr');
                            row.className = `rank-${rank <= 3 ? rank : 'other'}`;
                            
                            // Récupérer le nom du joueur avec double vérification
                            const playerDisplayName = data.playerName || data.name || 'Anonymous';
                            
                            // Formater la date
                            let dateStr = 'N/A';
                            if (data.timestamp) {
                                try {
                                    const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                                    dateStr = date.toLocaleDateString();
                                } catch (e) {
                                    console.error("Error formatting date:", e);
                                }
                            }
                            
                            // Créer les cellules
                            row.innerHTML = `
                                <td class="rank">${rank}</td>
                                <td class="champion">${playerDisplayName}</td>
                                <td class="score">${data.score}</td>
                                <td class="date">${dateStr}</td>
                            `;
                            
                            leaderboardBody.appendChild(row);
                            rank++;
                        });
                    })
                    .catch((error) => {
                        console.error("Error loading top scores:", error);
                        useTestData();
                    });
            } catch (error) {
                console.error("Error accessing Firebase:", error);
                useTestData();
            }
        } else {
            console.warn("Firebase DB not available, using test data");
            useTestData();
        }
        
        // Fonction pour utiliser des données de test
        function useTestData() {
            console.log("Using test data for leaderboard");
            
            // Données de test pour simuler un leaderboard
            const mockData = [
                { name: "Wizard123", score: 950, date: "2024-01-15" },
                { name: "VerbMaster", score: 820, date: "2024-01-20" },
                { name: "EnglishKnight", score: 780, date: "2024-01-18" },
                { name: "GrammarHero", score: 720, date: "2024-01-22" },
                { name: "WordSmith", score: 690, date: "2024-01-17" }
            ];
            
            // Vider le tableau et ajouter les données de test
            leaderboardBody.innerHTML = '';
            
            let rank = 1;
            mockData.forEach(data => {
                const row = document.createElement('tr');
                row.className = `rank-${rank <= 3 ? rank : 'other'}`;
                
                // Créer les cellules
                row.innerHTML = `
                    <td class="rank">${rank}</td>
                    <td class="champion">${data.name}</td>
                    <td class="score">${data.score}</td>
                    <td class="date">${data.date}</td>
                `;
                
                leaderboardBody.appendChild(row);
                rank++;
            });
        }
    }
    
    // Fonction pour ajouter les écouteurs d'événements
    function addEventListeners() {
        // Bouton de démarrage
        if (elements.startButton) {
            elements.startButton.addEventListener('click', startGame);
        }
        
        // Bouton de vérification
        const checkButton = document.getElementById('check-answer-btn');
        if (checkButton) {
            console.log("Bouton 'Lancer le Sort' trouvé, ajout de l'écouteur d'événement");
            checkButton.addEventListener('click', function(e) {
                e.preventDefault();
                checkAnswer();
            });
        } else {
            console.error("Bouton 'Lancer le Sort' non trouvé");
        }
        
        // Bouton de skip
        const skipButton = document.getElementById('skip-verb-btn');
        if (skipButton) {
            console.log("Bouton 'Bannir' trouvé, ajout de l'écouteur d'événement");
            skipButton.addEventListener('click', function(e) {
                e.preventDefault();
                skipVerb();
            });
        } else {
            console.error("Bouton 'Bannir' non trouvé");
        }
        
        // Bouton de sauvegarde du score
        if (elements.saveScoreButton) {
            elements.saveScoreButton.addEventListener('click', saveScore);
        }
        
        // Bouton de rejouer
        if (elements.playAgainButton) {
            elements.playAgainButton.addEventListener('click', resetGame);
        }
        
        // Écouteur pour la touche Entrée
        document.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const activeState = Object.keys(elements.gameStates).find(
                    state => elements.gameStates[state] && elements.gameStates[state].classList.contains('active')
                );
                
                if (activeState === 'playing') {
                    checkAnswer();
                } else if (activeState === 'gameOver' && document.activeElement === elements.playerNameInput) {
                    saveScore();
                }
            }
        });
    }
    
    // NOUVEAU: Fonction pour protéger contre les interférences externes
    function protectGameState() {
        console.log("🛡️ Activation de la protection contre les interférences externes");
        
        // Sauvegarder les fonctions originales
        const originalDisplayVerb = window.displayVerb;
        const originalCheckAnswer = window.checkAnswer;
        const originalSkipVerb = window.skipVerb;
        
        // Vérifier si des fonctions globales existent et les remplacer
        if (window.displayVerb && window.displayVerb !== displayVerb) {
            console.warn("⚠️ Détection d'une fonction displayVerb externe, protection activée");
            window.displayVerb = function() {
                console.log("🛡️ Tentative d'appel externe à displayVerb bloquée");
                return;
            };
        }
        
        if (window.checkAnswer && window.checkAnswer !== checkAnswer) {
            console.warn("⚠️ Détection d'une fonction checkAnswer externe, protection activée");
            window.checkAnswer = function() {
                console.log("🛡️ Tentative d'appel externe à checkAnswer bloquée");
                return;
            };
        }
        
        if (window.skipVerb && window.skipVerb !== skipVerb) {
            console.warn("⚠️ Détection d'une fonction skipVerb externe, protection activée");
            window.skipVerb = function() {
                console.log("🛡️ Tentative d'appel externe à skipVerb bloquée");
                return;
            };
        }
        
        // Créer une fonction createSuccessParticles si elle n'existe pas
        if (typeof window.createSuccessParticles !== 'function') {
            window.createSuccessParticles = function(count) {
                console.log(`Effet de particules simulé (${count} particules)`);
            };
        }
        
        // NOUVEAU: Protection spécifique contre consolidated-fix.js
        // Rechercher et désactiver le script consolidated-fix.js
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src && script.src.includes('consolidated-fix.js')) {
                console.warn("🚨 Script consolidated-fix.js détecté! Tentative de désactivation...");
                
                // Tenter de désactiver le script
                try {
                    // Méthode 1: Remplacer le src
                    script.src = "";
                    
                    // Méthode 2: Supprimer le script
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    
                    console.log("✅ Script consolidated-fix.js désactivé avec succès");
                } catch (error) {
                    console.error("❌ Échec de la désactivation du script:", error);
                }
            }
        });
        
        // NOUVEAU: Surveiller l'ajout de nouveaux scripts
        const scriptObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(node => {
                        if (node.tagName === 'SCRIPT' && node.src && node.src.includes('consolidated-fix.js')) {
                            console.warn("🚨 Tentative d'ajout du script consolidated-fix.js détectée!");
                            node.src = "";
                            if (node.parentNode) {
                                node.parentNode.removeChild(node);
                            }
                        }
                    });
                }
            });
        });
        
        // Observer les changements dans le document
        scriptObserver.observe(document, { childList: true, subtree: true });
        
        // NOUVEAU: Neutraliser les fonctions spécifiques de consolidated-fix.js
        if (window.consolidated_fix) {
            console.warn("🚨 Objet consolidated_fix détecté, neutralisation...");
            window.consolidated_fix = { disabled: true };
        }
        
        // NOUVEAU: Intercepter les appels à setTimeout qui pourraient changer les verbes
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = function(callback, delay, ...args) {
            if (typeof callback === 'function' && callback.toString().includes('verbe')) {
                console.warn("🚨 Tentative de changement de verbe via setTimeout détectée et bloquée");
                return 0; // ID fictif
            }
            return originalSetTimeout(callback, delay, ...args);
        };
        
        console.log("✅ Protection contre les interférences externes activée");
    }
    
    // Initialiser le jeu
    function init() {
        console.log("🚀 Initialisation du jeu Speed Verb Challenge...");
        
        // NOUVEAU: Protéger contre les interférences externes
        protectGameState();
        
        // NOUVEAU: Vérifier s'il y a déjà un jeu en cours
        if (window.speedVerbGameInstance) {
            console.warn("⚠️ Une instance de jeu existe déjà, nettoyage...");
            // Nettoyer l'ancienne instance si nécessaire
        }
        
        // Enregistrer cette instance
        window.speedVerbGameInstance = gameInstanceId;
        
        // Ajouter les écouteurs d'événements
        addEventListeners();
        
        // NOUVEAU: Initialiser notre système de leaderboard dédié
        if (window.SpeedVerbLeaderboard) {
            console.log("Initializing dedicated SpeedVerbLeaderboard system");
            SpeedVerbLeaderboard.init('speed-verb-leaderboard');
        } else {
            console.error("SpeedVerbLeaderboard not available, using fallback method");
            loadLeaderboard();
        }
        
        // NOUVEAU: Vérifier si consolidated-fix.js est chargé après l'initialisation
        setTimeout(() => {
            const scripts = document.querySelectorAll('script');
            let consolidatedFixFound = false;
            
            scripts.forEach(script => {
                if (script.src && script.src.includes('consolidated-fix.js')) {
                    consolidatedFixFound = true;
                }
            });
            
            if (consolidatedFixFound) {
                console.warn("🚨 consolidated-fix.js est toujours présent après l'initialisation!");
                alert("Attention: Un script externe (consolidated-fix.js) interfère avec le jeu. Certaines fonctionnalités peuvent ne pas fonctionner correctement.");
            } else {
                console.log("✅ Aucune interférence de consolidated-fix.js détectée");
            }
        }, 1000);
        
        console.log("✅ Initialisation terminée");
    }
    
    // Démarrer le jeu
    init();
}); 