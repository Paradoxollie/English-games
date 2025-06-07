/**
 * Speed Verb Challenge - English Quest Reborn
 * Un jeu pour tester la connaissance des verbes irréguliers anglais
 * Version améliorée avec intégration du profil utilisateur
 */

// Variables globales
let score = 0;
let timeLeft = 90;
let timerInterval;
let currentVerb = "";
let lastDisplayedVerb = "";
let skippedVerbs = [];
let playerLevel = 1; // This might be derived from profile or just for game session
let playerXP = 0;    // This might be derived from profile or just for game session
let xpToNextLevel = 100;
let correctStreak = 0;
let highestStreak = 0;
let comboMultiplier = 1;
let verbsCompleted = 0;
let difficulty = "1";
let verbChangeInProgress = false;
let gameInstanceId = Math.random().toString(36).substring(2, 15);
let gameEffects = null; 
let verbDisplayTime = 0; 

// Variables pour les événements
let nextEventTime = 0;
let eventActive = false;
let currentEvent = null;
let eventTimer = null;
let eventVerbsCompleted = 0;

const gameEvents = [
    {
        id: 'extra_time',
        name: 'Temps Bonus',
        description: '+20 secondes ajoutées au chronomètre !',
        duration: 0,
        type: 'bonus',
        challenge: {
            type: 'streak',
            target: 3,
            description: 'Obtenez 3 bonnes réponses d\'affilée pour gagner du temps supplémentaire !'
        },
        effect: function() {
            timeLeft += 20;
            updateTimeDisplay();
        }
    },
    {
        id: 'combo_boost',
        name: 'Combo Boosté',
        description: 'Votre multiplicateur de combo augmente plus rapidement pendant 20 secondes !',
        duration: 20,
        type: 'bonus',
        challenge: {
            type: 'speed',
            target: 5,
            description: 'Répondez correctement en moins de 5 secondes pour booster votre combo !'
        },
        effect: function() { /* Applied in updateComboMultiplier */ }
    },
    {
        id: 'double_points',
        name: 'Points Doublés',
        description: 'Vos points sont doublés pendant 15 secondes !',
        duration: 15,
        type: 'bonus',
        challenge: {
            type: 'difficulty',
            target: 'hard',
            description: 'Complétez un verbe difficile pour doubler vos points !'
        },
        effect: function() { /* Applied in checkAnswer */ }
    },
    {
        id: 'time_freeze',
        name: 'Temps Figé',
        description: 'Le temps est figé pendant 10 secondes !',
        duration: 10,
        type: 'bonus',
        challenge: {
            type: 'consecutive',
            target: 2,
            description: 'Complétez 2 verbes consécutifs sans erreur pour figer le temps !'
        },
        effect: function() { /* Implemented in startTimer */ }
    }
];

const elements = {
    gameStates: {
        welcome: document.getElementById('welcome-screen'),
        playing: document.getElementById('playing'),
        gameOver: document.getElementById('game-over')
    },
    startGameBtn: document.getElementById('start-game-btn'),
    checkAnswerBtn: document.getElementById('check-answer-btn'),
    skipVerbBtn: document.getElementById('skip-verb-btn'),
    saveScoreBtn: document.getElementById('save-score-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    showRulesBtn: document.getElementById('show-rules-btn'),
    closeRulesBtn: document.getElementById('close-rules-btn'),
    currentVerbDisplay: document.getElementById('current-verb'),
    verbTranslation: document.getElementById('verb-translation'),
    verbFormInputs: document.getElementById('verb-form-inputs'),
    feedbackMessage: document.getElementById('feedback-message'),
    playerLevelDisplay: document.getElementById('player-level'),
    playerScoreDisplay: document.getElementById('player-score'),
    timeLeftDisplay: document.getElementById('time-left'),
    comboDisplay: document.getElementById('combo-multiplier'),
    xpProgressBar: document.getElementById('xp-progress'),
    finalScoreValue: document.getElementById('final-score-value'),
    finalLevelDisplay: document.getElementById('final-level'),
    verbsCompletedDisplay: document.getElementById('verbs-completed'),
    highestComboDisplay: document.getElementById('highest-combo'),
    currentVerbAnswer: document.getElementById('current-verb-answer'),
    rulesModal: document.getElementById('rules-modal'),
    leaderboardBody: document.getElementById('leaderboard-body')
};

function getPlayerName() {
    try {
        const authState = window.authService?.getAuthState();
        if (authState?.profile?.username) {
            return authState.profile.username;
        }
    } catch (e) {
        console.warn("Error accessing authService for player name:", e);
    }
    return 'Joueur Anonyme'; // Fallback
}

function initGame() {
    console.log("Initialisation du jeu Speed Verb Challenge");
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
        document.body.classList.add('is-mobile-device');
        optimizeForMobile();
    }

    const playerName = getPlayerName(); // Use the new refactored function
    console.log("Nom du joueur récupéré:", playerName);
    const playerNameElements = document.querySelectorAll('.player-name');
    playerNameElements.forEach(element => {
        element.textContent = playerName;
    });

    if (window.verbData) {
        console.log(`${Object.keys(window.verbData).length} verbes chargés`);
    } else {
        console.error("Erreur: Les données des verbes n'ont pas été trouvées. Utilisation d'un ensemble de secours.");
        window.verbData = { /* Fallback verbs as before */ };
    }

    if (window.GameEffects) {
        gameEffects = new GameEffects();
        if (isMobile && gameEffects.reduceEffects) gameEffects.reduceEffects();
        console.log("Effets visuels initialisés");
    }

    addEventListeners();
    initLeaderboard();
    protectGameState();
    console.log("Jeu initialisé avec succès");
}

function optimizeForMobile() {
    // Optimisations pour mobile
    if (document.body.classList.contains('is-mobile-device')) {
        // Réduire la taille des polices
        document.documentElement.style.setProperty('--base-font-size', '14px');
        
        // Optimiser les interactions tactiles
        const gameButtons = document.querySelectorAll('.game-button');
        gameButtons.forEach(btn => {
            btn.style.minHeight = '48px';
            btn.style.fontSize = '16px';
        });
        
        // Optimiser les inputs
        const inputs = document.querySelectorAll('.verb-input');
        inputs.forEach(input => {
            input.style.fontSize = '16px'; // Éviter le zoom sur iOS
        });
    }
}

function protectGameState() {
    // Empêcher les tricheries
    let gameStateChangeCount = 0;
    const originalSetGameState = setGameState;
    
    window.setGameState = function(state) {
        gameStateChangeCount++;
        if (gameStateChangeCount > 10) {
            console.warn('Trop de changements d\'état détectés');
            return;
        }
        return originalSetGameState(state);
    };
    
    // Protéger contre les manipulations de score
    Object.defineProperty(window, 'score', {
        get: function() { return score; },
        set: function(val) { 
            console.warn('Tentative de modification du score détectée');
            return false;
        }
    });
}
function addEventListeners() {
    // Gestion des boutons de difficulté
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            difficultyBtns.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            // Mettre à jour la difficulté
            difficulty = this.getAttribute('data-difficulty');
            console.log('Difficulté sélectionnée:', difficulty);
        });
    });

    // Bouton pour commencer le jeu
    if (elements.startGameBtn) {
        elements.startGameBtn.addEventListener('click', function() {
            console.log('Démarrage du jeu avec difficulté:', difficulty);
            startGame();
        });
    }

    // Bouton pour vérifier la réponse
    if (elements.checkAnswerBtn) {
        elements.checkAnswerBtn.addEventListener('click', checkAnswer);
    }

    // Bouton pour passer le verbe
    if (elements.skipVerbBtn) {
        elements.skipVerbBtn.addEventListener('click', skipVerb);
    }

    // Bouton pour sauvegarder le score
    if (elements.saveScoreBtn) {
        elements.saveScoreBtn.addEventListener('click', saveScore);
    }

    // Bouton pour rejouer
    if (elements.playAgainBtn) {
        elements.playAgainBtn.addEventListener('click', resetGame);
    }

    // Bouton pour afficher les règles (optionnel)
    if (elements.showRulesBtn) {
        elements.showRulesBtn.addEventListener('click', showRules);
    }

    // Bouton pour fermer les règles (optionnel)
    if (elements.closeRulesBtn) {
        elements.closeRulesBtn.addEventListener('click', hideRules);
    }

    // Gestion des entrées clavier dans le jeu
    document.addEventListener('keydown', function(e) {
        // Valider avec Entrée
        if (e.key === 'Enter' && elements.checkAnswerBtn && !elements.checkAnswerBtn.disabled) {
            e.preventDefault();
            checkAnswer();
        }
        // Passer avec Escape
        else if (e.key === 'Escape' && elements.skipVerbBtn && !elements.skipVerbBtn.disabled) {
            e.preventDefault();
            skipVerb();
        }
    });

    console.log('Gestionnaires d\'événements ajoutés avec succès');
}

function initLeaderboard() {
    if (window.SpeedVerbLeaderboard && typeof window.SpeedVerbLeaderboard.init === 'function') {
        console.log("Initialisation du système de leaderboard dédié SpeedVerbLeaderboard");
        window.SpeedVerbLeaderboard.init('speed-verb-leaderboard'); // Assuming 'speed-verb-leaderboard' is the table ID
    } else {
        console.log("Système SpeedVerbLeaderboard non disponible, utilisation de loadLeaderboard local.");
        loadLeaderboard();
    }
}

async function loadLeaderboard() {
    console.log("Chargement du leaderboard via firebaseServiceInstance");
    if (!elements.leaderboardBody) {
        console.error("Élément leaderboardBody non trouvé");
        return;
    }
    elements.leaderboardBody.innerHTML = '<tr><td colspan="4" class="loading-scores">Chargement des scores...</td></tr>';

    if (window.firebaseServiceInstance && window.firebaseServiceInstance.db) {
        try {
            const querySnapshot = await window.firebaseServiceInstance.db.collection('game_scores')
                .where('gameId', '==', 'speed-verb-challenge')
                .orderBy('score', 'desc')
                .limit(10)
                .get();

            if (querySnapshot.empty) {
                elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aucun score trouvé.</td></tr>';
                return;
            }
            let html = '';
            let rank = 1;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.timestamp ? new Date(data.timestamp.seconds ? data.timestamp.toDate() : data.timestamp).toLocaleDateString() : 'Date inconnue';
                html += `<tr>
                    <td class="rank-cell">${rank}</td>
                    <td class="player-cell">${data.playerName || 'Anonyme'}</td>
                    <td class="score-cell">${data.score}</td>
                    <td class="date-cell">${date}</td>
                </tr>`;
                rank++;
            });
            elements.leaderboardBody.innerHTML = html;
        } catch (error) {
            console.error("Erreur lors du chargement des scores via firebaseServiceInstance:", error);
            elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Erreur de chargement des scores.</td></tr>';
        }
    } else {
        console.error("firebaseServiceInstance ou firebaseServiceInstance.db non disponible");
        elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Service de scores indisponible.</td></tr>';
    }
}

function startGame() {
    score = 0;
    timeLeft = 90;
    skippedVerbs = [];
    playerLevel = 1;
    playerXP = 0;
    xpToNextLevel = 100;
    correctStreak = 0;
    highestStreak = 0;
    comboMultiplier = 1;
    verbsCompleted = 0;
    
    // Récupérer la difficulté depuis le bouton actif
    const activeDifficultyBtn = document.querySelector('.difficulty-btn.active');
    if (activeDifficultyBtn) {
        difficulty = activeDifficultyBtn.getAttribute('data-difficulty');
    }
    console.log('Démarrage du jeu avec difficulté:', difficulty);
    
    updateHUD();
    setGameState('playing');
    startTimer();
    displayVerb();
    if (gameEffects) gameEffects.gameStartEffect();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    nextEventTime = 15 + Math.floor(Math.random() * 15);
    timerInterval = setInterval(() => {
        if (!(eventActive && currentEvent && currentEvent.id === 'time_freeze')) timeLeft--;
        updateTimeDisplay();
        if (!eventActive && timeLeft === nextEventTime) triggerRandomEvent();
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function updateTimeDisplay() {
    if (elements.timeLeftDisplay) {
        elements.timeLeftDisplay.textContent = timeLeft;
        elements.timeLeftDisplay.classList.toggle('time-warning', timeLeft <= 10);
        elements.timeLeftDisplay.classList.toggle('time-frozen', eventActive && currentEvent && currentEvent.id === 'time_freeze');
    }
}

function triggerRandomEvent() {
    const randomIndex = Math.floor(Math.random() * gameEvents.length);
    currentEvent = gameEvents[randomIndex];
    showChallengeNotification(currentEvent);
    eventActive = true;
    window.currentChallenge = { id: currentEvent.id, type: currentEvent.challenge.type, target: currentEvent.challenge.target, progress: 0, startTime: Date.now(), completed: false };
    setTimeout(() => {
        if (window.currentChallenge && !window.currentChallenge.completed) {
            eventActive = false; window.currentChallenge = null;
            nextEventTime = timeLeft - (10 + Math.floor(Math.random() * 20));
            if (nextEventTime < 5) nextEventTime = 5;
        }
    }, 30000);
}

function showChallengeNotification(event) {
    const challengeElement = document.createElement('div');
    challengeElement.className = 'challenge-notification';
    challengeElement.innerHTML = `<div class="challenge-header"><span class="challenge-icon">🎯</span><span class="challenge-title">Mini-Défi</span></div><div class="challenge-content"><p class="challenge-description">${event.challenge.description}</p><div class="challenge-reward"><span class="reward-icon">🎁</span><span class="reward-text">Récompense: ${event.description}</span></div></div>`;
    document.body.appendChild(challengeElement);
    setTimeout(() => challengeElement.classList.add('show'), 100);
    setTimeout(() => {
        challengeElement.classList.remove('show');
        setTimeout(() => { if (document.body.contains(challengeElement)) document.body.removeChild(challengeElement); }, 500);
    }, 5000);
}

function checkChallengeCompletion(params) {
    if (!window.currentChallenge || window.currentChallenge.completed) return false;
    let isCompleted = false;
    switch (window.currentChallenge.type) {
        case 'streak': if (params.streak >= window.currentChallenge.target) isCompleted = true; break;
        case 'speed': if (params.isCorrect && params.responseTime <= window.currentChallenge.target) isCompleted = true; break;
        case 'difficulty': if (params.isCorrect && params.difficulty === window.currentChallenge.target) isCompleted = true; break;
        case 'consecutive':
            if (params.isCorrect) { window.currentChallenge.progress++; if (window.currentChallenge.progress >= window.currentChallenge.target) isCompleted = true; }
            else window.currentChallenge.progress = 0;
            break;
    }
    if (isCompleted) completeChallengeAndApplyReward();
    return isCompleted;
}

function completeChallengeAndApplyReward() {
    if (!window.currentChallenge || !eventActive) return;
    window.currentChallenge.completed = true;
    const event = gameEvents.find(e => e.id === window.currentChallenge.id);
    if (!event) return;
    showEventNotification(event);
    if (event.id === 'extra_time') { event.effect(); eventActive = false; }
    else if (event.duration > 0) {
        let eventTimeLeft = event.duration;
        const eventTimerElement = document.createElement('div');
        eventTimerElement.className = 'event-timer';
        eventTimerElement.innerHTML = `<span>${event.name}</span> <span class="time-left">${eventTimeLeft}s</span>`;
        document.body.appendChild(eventTimerElement);
        eventTimer = setInterval(() => {
            eventTimeLeft--;
            const timeLeftElement = eventTimerElement.querySelector('.time-left');
            if (timeLeftElement) timeLeftElement.textContent = `${eventTimeLeft}s`;
            if (eventTimeLeft <= 0) {
                clearInterval(eventTimer); eventActive = false; window.currentChallenge = null;
                if (document.body.contains(eventTimerElement)) document.body.removeChild(eventTimerElement);
                nextEventTime = timeLeft - (10 + Math.floor(Math.random() * 20));
                if (nextEventTime < 5) nextEventTime = 5;
            }
        }, 1000);
    }
}

function showEventNotification(event) {
    const notification = document.createElement('div');
    notification.className = `event-notification ${event.type}`;
    const icon = event.type === 'bonus' ? '🎁' : '⚡';
    notification.innerHTML = `<div class="event-icon">${icon}</div><div class="event-content"><h3>${event.name}</h3><p>${event.description}</p></div>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => { if(document.body.contains(notification)) document.body.removeChild(notification); }, 500);
    }, 5000);
}

function displayVerb() {
    if (verbChangeInProgress) return;
    verbChangeInProgress = true;
    if (elements.checkAnswerBtn) elements.checkAnswerBtn.disabled = true;
    if (elements.skipVerbBtn) elements.skipVerbBtn.disabled = true;
    const verbKeys = Object.keys(window.verbData);
    currentVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
    if (elements.currentVerbDisplay) elements.currentVerbDisplay.textContent = currentVerb;
    if (elements.verbTranslation) {
        if (difficulty === "3") { elements.verbTranslation.textContent = ""; elements.verbTranslation.style.display = "none"; }
        else { elements.verbTranslation.textContent = `(${window.verbData[currentVerb][2]})`; elements.verbTranslation.style.display = "block"; }
    }
    if (elements.verbFormInputs) {
        elements.verbFormInputs.innerHTML = '';
        // Past Simple
        const psGroup = document.createElement('div'); psGroup.className = 'verb-input-group';
        psGroup.innerHTML = `<label class="verb-input-label">Prétérit (Past Simple)</label><input type="text" class="verb-input" id="past-simple-input" placeholder="Ex: went, saw..." autocomplete="off" autocapitalize="off" spellcheck="false">`;
        elements.verbFormInputs.appendChild(psGroup);
        // Past Participle
        if (difficulty !== "1") {
            const ppGroup = document.createElement('div'); ppGroup.className = 'verb-input-group';
            ppGroup.innerHTML = `<label class="verb-input-label">Participe Passé (Past Participle)</label><input type="text" class="verb-input" id="past-participle-input" placeholder="Ex: gone, seen..." autocomplete="off" autocapitalize="off" spellcheck="false">`;
            elements.verbFormInputs.appendChild(ppGroup);
        }
        // Translation
        if (difficulty === "3") {
            const trGroup = document.createElement('div'); trGroup.className = 'verb-input-group';
            trGroup.innerHTML = `<label class="verb-input-label">Traduction en français</label><input type="text" class="verb-input" id="translation-input" placeholder="Ex: aller, voir..." autocomplete="off" autocapitalize="off" spellcheck="false">`;
            elements.verbFormInputs.appendChild(trGroup);
        }
        setTimeout(() => { const firstInput = document.querySelector('.verb-input'); if (firstInput) { firstInput.focus(); firstInput.value = '';} }, 100);
    }
    setTimeout(() => {
        if (elements.checkAnswerBtn) elements.checkAnswerBtn.disabled = false;
        if (elements.skipVerbBtn) elements.skipVerbBtn.disabled = false;
        verbDisplayTime = Date.now();
        verbChangeInProgress = false;
    }, 300);
}

function checkAnswer() {
    if (verbChangeInProgress) return;
    const pastSimpleInput = document.getElementById('past-simple-input');
    const pastParticipleInput = document.getElementById('past-participle-input');
    const translationInput = document.getElementById('translation-input');
    if (!pastSimpleInput) return;
    const userPastSimple = pastSimpleInput.value.trim().toLowerCase();
    const userPastParticiple = pastParticipleInput ? pastParticipleInput.value.trim().toLowerCase() : null;
    const userTranslation = translationInput ? translationInput.value.trim().toLowerCase() : null;
    const correctPastSimple = window.verbData[currentVerb][0].toLowerCase();
    const correctPastParticiple = window.verbData[currentVerb][1].toLowerCase();
    const correctTranslation = window.verbData[currentVerb][2].toLowerCase();
    const pastSimpleOptions = correctPastSimple.split('/').map(opt => opt.trim());
    const pastParticipleOptions = correctPastParticiple.split('/').map(opt => opt.trim());
    const translationOptions = correctTranslation.split('/').map(opt => opt.trim());
    const isPastSimpleCorrect = pastSimpleOptions.includes(userPastSimple);
    let isPastParticipleCorrect = true; if (difficulty !== "1") isPastParticipleCorrect = pastParticipleOptions.includes(userPastParticiple);
    let isTranslationCorrect = true; if (difficulty === "3" && translationInput) isTranslationCorrect = translationOptions.includes(userTranslation);
    const isCorrect = isPastSimpleCorrect && isPastParticipleCorrect && isTranslationCorrect;
    const responseTime = isCorrect ? (Date.now() - verbDisplayTime) / 1000 : 0;

    if (isCorrect) {
        correctStreak++; if (correctStreak > highestStreak) highestStreak = correctStreak;
        comboMultiplier = 1 + (correctStreak * 0.1);
        if (window.currentChallenge && eventActive) checkChallengeCompletion({isCorrect: true, streak: correctStreak, responseTime: responseTime, difficulty: difficulty});
        let points = parseInt(difficulty); points = Math.round(points * comboMultiplier);
        if (eventActive && currentEvent) {
            if (currentEvent.id === 'combo_boost') points = Math.round(points * 1.5);
            else if (currentEvent.id === 'double_points') points = points * 2;
        }
        score += points; verbsCompleted++; addExperience(points * 5); updateHUD();
        showFeedback(true, `Correct ! +${points} points`);
        const inputEl = document.querySelector('.verb-input');
        if (inputEl && gameEffects) gameEffects.successEffect(inputEl); else if (inputEl) { inputEl.classList.add('correct-answer'); setTimeout(() => inputEl.classList.remove('correct-answer'), 1000); }
        if(pastSimpleInput) pastSimpleInput.value = ''; if(pastParticipleInput) pastParticipleInput.value = ''; if(translationInput) translationInput.value = '';
        setTimeout(displayVerb, 800);
    } else {
        correctStreak = 0; comboMultiplier = 1;
        if (window.currentChallenge && eventActive) checkChallengeCompletion({isCorrect: false, streak: 0, responseTime: 0, difficulty: difficulty});
        updateHUD();
        let errMsg = "Incorrect ! ";
        if (!isPastSimpleCorrect) errMsg += `Prétérit: "${correctPastSimple}". `;
        if (difficulty !== "1" && !isPastParticipleCorrect) errMsg += `Part. Passé: "${correctPastParticiple}". `;
        if (difficulty === "3" && !isTranslationCorrect) errMsg += `Traduction: "${correctTranslation}". `;
        showFeedback(false, errMsg);
        const inputEl = document.querySelector('.verb-input');
        if (inputEl && gameEffects) gameEffects.errorEffect(inputEl); else if (inputEl) { inputEl.classList.add('incorrect-answer'); setTimeout(() => inputEl.classList.remove('incorrect-answer'), 1000); }
        setTimeout(() => { if(pastSimpleInput) pastSimpleInput.value = ''; if(pastParticipleInput) pastParticipleInput.value = ''; if(translationInput) translationInput.value = ''; }, 1500);
    }
}

function skipVerb() {
    if (verbChangeInProgress) return;
    skippedVerbs.push({ verb: currentVerb, pastSimple: window.verbData[currentVerb][0], pastParticiple: window.verbData[currentVerb][1], translation: window.verbData[currentVerb][2]});
    correctStreak = 0; comboMultiplier = 1; updateHUD();
    showFeedback(false, `Passé. Prétérit: "${window.verbData[currentVerb][0]}", Part. Passé: "${window.verbData[currentVerb][1]}".`);
    if (gameEffects) gameEffects.skipEffect();
    const psInput = document.getElementById('past-simple-input'); if(psInput) psInput.value = '';
    const ppInput = document.getElementById('past-participle-input'); if(ppInput) ppInput.value = '';
    const trInput = document.getElementById('translation-input'); if(trInput) trInput.value = '';
    setTimeout(displayVerb, 1000);
}

function addExperience(xp) {
    playerXP += xp;
    while (playerXP >= xpToNextLevel) {
        playerXP -= xpToNextLevel; playerLevel++;
        xpToNextLevel = Math.floor(100 * Math.pow(1.5, playerLevel - 1));
        if (elements.playerLevelDisplay) { elements.playerLevelDisplay.classList.add('level-up-effect'); setTimeout(() => elements.playerLevelDisplay.classList.remove('level-up-effect'), 1000); }
        showFeedback(true, `Niveau supérieur ! Vous êtes niveau ${playerLevel}`);
    }
    updateXPBar();
}

function updateXPBar() { if (elements.xpProgressBar) elements.xpProgressBar.style.width = `${(playerXP / xpToNextLevel) * 100}%`; }

function updateHUD() {
    if (elements.playerScoreDisplay) elements.playerScoreDisplay.textContent = score;
    if (elements.playerLevelDisplay) elements.playerLevelDisplay.textContent = playerLevel;
    if (elements.timeLeftDisplay) elements.timeLeftDisplay.textContent = timeLeft;
    if (elements.comboDisplay) { elements.comboDisplay.textContent = `x${comboMultiplier.toFixed(1)}`; elements.comboDisplay.classList.toggle('high-combo', comboMultiplier >= 1.5); }
    updateXPBar();
}

function checkStreakBonus(streak) {
    const bonuses = [ { streak: 5, msg: "🔥 Combo x1.5" }, { streak: 10, msg: "🔥🔥 Combo x2.0" }, { streak: 30, xp: 30, msg: "🏆 Combo x4.0 & +30 XP" } ]; // Simplified
    const bonus = bonuses.find(b => b.streak === streak);
    if (bonus) {
        showFeedback(true, bonus.msg); if (gameEffects) gameEffects.streakBonusEffect();
        if (window.RewardSystem && bonus.xp) window.RewardSystem.addXP(bonus.xp, 'Speed Verb Challenge - Streak');
        playSound('streak-bonus');
        if (window.currentChallenge && eventActive && window.currentChallenge.type === 'streak') checkChallengeCompletion({isCorrect: true, streak: streak, responseTime: 0, difficulty: difficulty});
    }
}

function playSound(soundName) { if (window.GameSounds && typeof window.GameSounds.play === 'function') window.GameSounds.play(soundName); }

function showFeedback(success, message) {
    if (elements.feedbackMessage) {
        elements.feedbackMessage.textContent = message;
        elements.feedbackMessage.className = `feedback-message ${success ? 'success-message' : 'error-message'}`;
        void elements.feedbackMessage.offsetWidth; elements.feedbackMessage.classList.add('animate-feedback');
        setTimeout(() => elements.feedbackMessage.classList.remove('animate-feedback'), 2000);
    }
}

function setGameState(state) {
    Object.keys(elements.gameStates).forEach(key => { if (elements.gameStates[key]) elements.gameStates[key].classList.remove('active'); });
    if (elements.gameStates[state]) elements.gameStates[state].classList.add('active');
}

function showRules() { if (elements.rulesModal) elements.rulesModal.classList.add('active'); }
function hideRules() { if (elements.rulesModal) elements.rulesModal.classList.remove('active'); }

function endGame() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (elements.finalScoreValue) elements.finalScoreValue.textContent = score;
    if (elements.finalLevelDisplay) elements.finalLevelDisplay.textContent = playerLevel;
    if (elements.verbsCompletedDisplay) elements.verbsCompletedDisplay.textContent = verbsCompleted;
    if (elements.highestComboDisplay) elements.highestComboDisplay.textContent = `x${(1 + highestStreak * 0.1).toFixed(1)}`;
    showCurrentVerbAnswers(); setGameState('gameOver');
    if (window.SpeedVerbLeaderboard) { if (!SpeedVerbLeaderboard.leaderboardTable) SpeedVerbLeaderboard.init('speed-verb-leaderboard'); else SpeedVerbLeaderboard.loadScores(); }
    else { loadLeaderboard(); }
    if (gameEffects) gameEffects.gameOverEffect();
    if (window.RewardSystem) {
        window.RewardSystem.addCoins(10, 'Speed Verb Challenge - Game End');
        const xpFromScore = Math.floor(score / 5);
        if (xpFromScore > 0) window.RewardSystem.addXP(xpFromScore, 'Speed Verb Challenge - Game End');
        showFeedback(true, `Partie finie ! +10 pièces & +${xpFromScore} XP !`);
        checkIfHighScore(score).then(isHighScore => { if (isHighScore) rewardHighScore(score); });
    }
}

function showCurrentVerbAnswers() {
    if (elements.currentVerbAnswer && lastDisplayedVerb && window.verbData[lastDisplayedVerb]) {
        const v = lastDisplayedVerb; const d = window.verbData[v];
        elements.currentVerbAnswer.innerHTML = `<strong>${v}</strong> - Prétérit: <strong>${d[0]}</strong>, Part. Passé: <strong>${d[1]}</strong>, Trad.: <strong>${d[2]}</strong>`;
    }
}

function rewardHighScore(score, offline = false) {
    if (window.highScoreRewardGiven) return;
    window.highScoreRewardGiven = true;
    const event = new CustomEvent('highScoreAchieved', { detail: { game: 'speed-verb-challenge', score: score, timestamp: new Date(), offline: offline, rewardAlreadyGiven: true }});
    document.dispatchEvent(event);
    if (window.RewardSystem) {
        try {
            if (!offline) {
                window.RewardSystem.addCoins(100, 'Speed Verb Challenge - High Score');
                const xpAmount = Math.floor(score / 2);
                window.RewardSystem.addXP(xpAmount, 'Speed Verb Challenge - High Score');
                showFeedback(true, `🏆 Record ! +100 pièces & +${xpAmount} XP !`);
            } else { showFeedback(true, `🏆 Record hors ligne ! Connectez-vous pour les récompenses.`); }
            if (gameEffects) gameEffects.streakBonusEffect();
        } catch (error) { console.warn("Erreur récompense high score:", error); showFeedback(true, `🏆 Record ! Récompenses avec connexion.`); }
    } else { showFeedback(true, `🏆 Record ! Récompenses avec connexion.`); }
}

function resetGame() {
    score = 0; timeLeft = 90; skippedVerbs = []; playerLevel = 1; playerXP = 0; xpToNextLevel = 100;
    correctStreak = 0; highestStreak = 0; comboMultiplier = 1; verbsCompleted = 0;
    window.verbChangeCallCount = 0; window.highScoreRewardGiven = false;
    setGameState('welcome');
    if (gameEffects) gameEffects.resetEffect();
}

document.addEventListener('scoreSubmitted', function(event) {
    const { success, playerName, score, isHighScore, offline } = event.detail;
    if (success) {
        const offlineText = offline ? ' (hors ligne)' : '';
        const successMessage = isHighScore ? `🏆 Record${offlineText} ! Score sauvegardé !` : `Score sauvegardé${offlineText} !`;
        showFeedback(true, successMessage);
        if (isHighScore && typeof rewardHighScore === 'function') rewardHighScore(score, offline);
        setTimeout(resetGame, 3000);
    } else { showFeedback(false, "Erreur: Score non sauvegardé. Réessayez."); }
});

document.addEventListener('DOMContentLoaded', initGame);
console.log("Speed Verb Challenge script loaded.");
