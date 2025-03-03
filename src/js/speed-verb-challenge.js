// Jeu Speed Verb Challenge
document.addEventListener('DOMContentLoaded', function() {
    // Données des verbes irréguliers
    const verbData = {
        "become": ["became", "become", "devenir"],
        "begin": ["began", "begun", "commencer"],
        "break": ["broke", "broken", "casser"],
        "bring": ["brought", "brought", "apporter"],
        "build": ["built", "built", "construire"],
        "buy": ["bought", "bought", "acheter"],
        "catch": ["caught", "caught", "attraper"],
        "choose": ["chose", "chosen", "choisir"],
        "come": ["came", "come", "venir"],
        "cost": ["cost", "cost", "coûter"],
        "cut": ["cut", "cut", "couper"],
        "do": ["did", "done", "faire"],
        "draw": ["drew", "drawn", "dessiner"],
        "drink": ["drank", "drunk", "boire"],
        "drive": ["drove", "driven", "conduire"],
        "eat": ["ate", "eaten", "manger"],
        "fall": ["fell", "fallen", "tomber"],
        "feel": ["felt", "felt", "ressentir"],
        "fight": ["fought", "fought", "se battre"],
        "find": ["found", "found", "trouver"],
        "fly": ["flew", "flown", "voler"],
        "forget": ["forgot", "forgotten", "oublier"],
        "forgive": ["forgave", "forgiven", "pardonner"],
        "freeze": ["froze", "frozen", "geler"],
        "get": ["got", "gotten", "obtenir"],
        "give": ["gave", "given", "donner"],
        "go": ["went", "gone", "aller"],
        "grow": ["grew", "grown", "grandir"],
        "have": ["had", "had", "avoir"],
        "hear": ["heard", "heard", "entendre"],
        "hide": ["hid", "hidden", "cacher"],
        "hit": ["hit", "hit", "frapper"],
        "hold": ["held", "held", "tenir"],
        "hurt": ["hurt", "hurt", "blesser"],
        "keep": ["kept", "kept", "garder"],
        "know": ["knew", "known", "savoir"],
        "learn": ["learnt", "learnt", "apprendre"],
        "leave": ["left", "left", "partir"],
        "lend": ["lent", "lent", "prêter"],
        "let": ["let", "let", "laisser"],
        "lie": ["lay", "lain", "s'allonger"],
        "lose": ["lost", "lost", "perdre"],
        "make": ["made", "made", "faire"],
        "mean": ["meant", "meant", "signifier"],
        "meet": ["met", "met", "rencontrer"],
        "pay": ["paid", "paid", "payer"],
        "put": ["put", "put", "mettre"],
        "read": ["read", "read", "lire"],
        "ride": ["rode", "ridden", "monter"],
        "ring": ["rang", "rung", "sonner"],
        "rise": ["rose", "risen", "se lever"],
        "run": ["ran", "run", "courir"],
        "say": ["said", "said", "dire"],
        "see": ["saw", "seen", "voir"],
        "sell": ["sold", "sold", "vendre"],
        "send": ["sent", "sent", "envoyer"],
        "set": ["set", "set", "mettre"],
        "shake": ["shook", "shaken", "secouer"],
        "shine": ["shone", "shone", "briller"],
        "shoot": ["shot", "shot", "tirer"],
        "show": ["showed", "shown", "montrer"],
        "shut": ["shut", "shut", "fermer"],
        "sing": ["sang", "sung", "chanter"],
        "sink": ["sank", "sunk", "couler"],
        "sit": ["sat", "sat", "s'asseoir"],
        "sleep": ["slept", "slept", "dormir"],
        "speak": ["spoke", "spoken", "parler"],
        "spend": ["spent", "spent", "dépenser"],
        "stand": ["stood", "stood", "se tenir debout"],
        "steal": ["stole", "stolen", "voler"],
        "stick": ["stuck", "stuck", "coller"],
        "swim": ["swam", "swum", "nager"],
        "take": ["took", "taken", "prendre"],
        "teach": ["taught", "taught", "enseigner"],
        "tell": ["told", "told", "dire"],
        "think": ["thought", "thought", "penser"],
        "throw": ["threw", "thrown", "jeter"],
        "understand": ["understood", "understood", "comprendre"],
        "wake": ["woke", "woken", "se réveiller"],
        "wear": ["wore", "worn", "porter"],
        "win": ["won", "won", "gagner"],
        "write": ["wrote", "written", "écrire"]
    };

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
        
        // Mettre à jour l'affichage
        updateHUD();
        
        // Changer l'état du jeu
        setGameState('playing');
        
        // Afficher un verbe
        displayVerb();
        
        // Démarrer le timer
        startTimer();
        
        console.log("Game started!");
    }
    
    // Fonction pour afficher un verbe aléatoire
    function displayVerb() {
        // Obtenir un verbe aléatoire
        const verbKeys = Object.keys(verbData);
        currentVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
        
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
    }
    
    // Fonction pour vérifier la réponse
    function checkAnswer() {
        console.log("Vérification de la réponse...");
        
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
        
        // Vérifier la réponse selon la difficulté
        if (difficulty === "1") {
            // Niveau 1: seulement le passé simple
            isCorrect = userPastSimple === verbData[currentVerb][0];
        } else if (difficulty === "2") {
            // Niveau 2: seulement le participe passé
            isCorrect = userPastParticiple === verbData[currentVerb][1];
        } else {
            // Niveau 3: les deux formes
            isCorrect = userPastSimple === verbData[currentVerb][0] && userPastParticiple === verbData[currentVerb][1];
        }
        
        // Gérer la réponse
        if (isCorrect) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer();
        }
        
        // Afficher un nouveau verbe
        setTimeout(() => {
            displayVerb();
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
        
        // Créer un effet de particules de succès dans tout l'écran
        if (gameContainer) {
            createSuccessParticles(20 + (correctStreak * 5));
        }
    }
    
    // Fonction pour gérer une réponse incorrecte
    function handleIncorrectAnswer() {
        // Réinitialiser le streak et le multiplicateur
        correctStreak = 0;
        comboMultiplier = 1;
        
        // Mettre à jour l'affichage
        updateHUD();
        
        // Afficher un message d'erreur
        let correctAnswer = '';
        
        if (difficulty === "1") {
            correctAnswer = verbData[currentVerb][0];
        } else if (difficulty === "2") {
            correctAnswer = verbData[currentVerb][1];
        } else {
            correctAnswer = `${verbData[currentVerb][0]} / ${verbData[currentVerb][1]}`;
        }
        
        showFeedback(false, correctAnswer);
        
        // Effet visuel d'échec
        const inputElement = document.querySelector('.verb-input');
        const verbDisplay = document.getElementById('current-verb');
        const gamePanel = document.querySelector('.gameplay-panel');
        
        if (inputElement && gameEffects) {
            gameEffects.failureEffect(inputElement);
        }
        
        // Animations supplémentaires pour une réponse incorrecte
        if (verbDisplay) {
            verbDisplay.classList.add('error-shake');
            setTimeout(() => {
                verbDisplay.classList.remove('error-shake');
            }, 1000);
        }
        
        // Effet de tremblement sur tout le panneau de jeu
        if (gamePanel) {
            gamePanel.classList.add('error-panel-flash');
            setTimeout(() => {
                gamePanel.classList.remove('error-panel-flash');
            }, 500);
        }
    }
    
    // Fonction pour passer un verbe
    function skipVerb() {
        console.log("Bannissement du verbe...");
        
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
        
        // Afficher un nouveau verbe
        setTimeout(() => {
            displayVerb();
        }, 800);
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
            elements.playerNameInput.value.trim() : 'Anonymous';
        
        // Vérifier si Firebase est disponible
        if (window.firebase && window.firebase.firestore) {
            const db = window.firebase.firestore();
            
            // Ajouter le score à la base de données
            db.collection('speed_verb_scores').add({
                name: playerName || 'Anonymous',
                score: score,
                level: playerLevel,
                verbsCompleted: verbsCompleted,
                difficulty: difficulty,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                // Afficher un message de succès
                alert('Score saved successfully!');
                
                // Recharger le leaderboard
                loadLeaderboard();
                
                // Réinitialiser le jeu
                resetGame();
            })
            .catch(error => {
                console.error('Error saving score:', error);
                alert('Error saving score. Please try again.');
            });
        } else {
            console.error('Firebase not available');
            alert('Error: Firebase not available. Score could not be saved.');
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
        if (!leaderboardBody) return;
        
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
                            
                            // Formater la date
                            let dateStr = 'N/A';
                            if (data.timestamp) {
                                try {
                                    const date = data.timestamp.toDate();
                                    dateStr = date.toLocaleDateString();
                                } catch (e) {
                                    console.error("Error formatting date:", e);
                                }
                            }
                            
                            // Créer les cellules
                            row.innerHTML = `
                                <td class="rank">${rank}</td>
                                <td class="champion">${data.name || 'Anonymous'}</td>
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
    
    // Initialiser le jeu
    function init() {
        // Charger le leaderboard
        loadLeaderboard();
        
        // Ajouter les écouteurs d'événements
        addEventListeners();
    }
    
    // Démarrer le jeu
    init();
}); 