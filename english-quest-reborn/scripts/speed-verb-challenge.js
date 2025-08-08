/**
 * Speed Verb Challenge - English Quest Reborn
 * Version corrigée qui fonctionne correctement
 */

// Variables globales
let score = 0;
let timeLeft = 90;
let timerInterval;
let currentVerb = "";
let lastDisplayedVerb = "";
let skippedVerbs = [];
let playerLevel = 1;
let playerXP = 0;
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

// Éléments DOM - seront initialisés une fois le DOM prêt
let elements = {};

function initElements() {
    elements = {
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
        currentVerbDisplay: document.getElementById('current-verb'),
        verbTranslation: document.getElementById('verb-translation'),
        verbFormInputs: document.getElementById('verb-form-inputs'),
        feedbackMessage: document.getElementById('feedback-message'),
        playerLevelDisplay: document.getElementById('player-level'),
        playerScoreDisplay: document.getElementById('player-score'),
        timeLeftDisplay: document.getElementById('time-left'),
        comboDisplay: document.getElementById('combo-multiplier'),
        finalScoreValue: document.getElementById('final-score-value'),
        finalLevelDisplay: document.getElementById('final-level'),
        verbsCompletedDisplay: document.getElementById('verbs-completed'),
        highestComboDisplay: document.getElementById('highest-combo'),
        leaderboardBody: document.getElementById('leaderboard-body'),
        btnLocalScores: document.getElementById('local-scores-btn'),
        btnOnlineScores: document.getElementById('online-scores-btn')
    };
    
    console.log('Éléments DOM initialisés:', {
        startGameBtn: !!elements.startGameBtn,
        difficultyBtns: document.querySelectorAll('.difficulty-btn').length,
        welcomeScreen: !!elements.gameStates.welcome
    });
}

// ===== Classement (harmonisé avec Enigma) =====
async function loadOnlineLeaderboard() {
    const tbody = elements.leaderboardBody || document.getElementById('leaderboard-body');
    if (!tbody) return;
    try {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; opacity:.7; padding:10px;">Chargement...</td></tr>';
        if (window.scoreService && typeof window.scoreService.getTopScores === 'function') {
            const rows = await window.scoreService.getTopScores('speed-verb-challenge', 20);
            tbody.innerHTML = '';
            rows.forEach((row, idx) => {
                const tr = document.createElement('tr');
                if (idx === 0) tr.className = 'rank-gold';
                else if (idx === 1) tr.className = 'rank-silver';
                else if (idx === 2) tr.className = 'rank-bronze';
                tr.innerHTML = `
                  <td>${idx+1}</td>
                  <td>${row.username}</td>
                  <td style="text-align:right;">${row.score || 0}</td>
                  <td>${new Date(row.createdDate || Date.now()).toLocaleDateString()}</td>`;
                tbody.appendChild(tr);
            });
            if (!rows.length) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; opacity:.7; padding:10px;">Aucun score</td></tr>';
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; opacity:.7; padding:10px;">Service indisponible</td></tr>';
        }
    } catch (e) {
        console.warn('[SpeedVerb] leaderboard error:', e);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#e74c3c; padding:10px;">Erreur de chargement</td></tr>';
    }
}

async function loadUserBestLeaderboard() {
    const tbody = elements.leaderboardBody || document.getElementById('leaderboard-body');
    if (!tbody) return;
    const user = (window.authService && window.authService.getCurrentUser && window.authService.getCurrentUser()) || null;
    if (!user || !user.uid) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; opacity:.7; padding:10px;">Connectez-vous pour voir vos scores</td></tr>';
        return;
    }
    try {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; opacity:.7; padding:10px;">Chargement...</td></tr>';
        if (window.scoreService && typeof window.scoreService.getUserBest === 'function') {
            const row = await window.scoreService.getUserBest('speed-verb-challenge', user.uid);
            tbody.innerHTML = '';
            if (row) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                  <td>—</td>
                  <td>${row.username}</td>
                  <td style="text-align:right;">${row.score || 0}</td>
                  <td>${new Date(row.createdDate || Date.now()).toLocaleDateString()}</td>`;
                tbody.appendChild(tr);
            } else {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; opacity:.7; padding:10px;">Aucun score</td></tr>';
            }
        }
    } catch (e) {
        console.warn('[SpeedVerb] user best error:', e);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#e74c3c; padding:10px;">Erreur de chargement</td></tr>';
    }
}

function setupLeaderboardButtons() {
    const btnLocal = elements.btnLocalScores || document.getElementById('local-scores-btn');
    const btnOnline = elements.btnOnlineScores || document.getElementById('online-scores-btn');
    if (!btnLocal || !btnOnline) return;
    btnLocal.addEventListener('click', () => {
        btnLocal.classList.add('active');
        btnOnline.classList.remove('active');
        loadUserBestLeaderboard();
    });
    btnOnline.addEventListener('click', () => {
        btnOnline.classList.add('active');
        btnLocal.classList.remove('active');
        loadOnlineLeaderboard();
    });
    // Valeur par défaut: Mondial
    btnOnline.classList.add('active');
    btnLocal.classList.remove('active');
    loadOnlineLeaderboard();
}

function addEventListeners() {
    console.log('🔗 Ajout des gestionnaires d\'événements...');
    
    // Gestion des boutons de difficulté
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    console.log('📊 Boutons de difficulté trouvés:', difficultyBtns.length);
    
    difficultyBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            console.log('🎯 Clic sur bouton de difficulté:', this.getAttribute('data-difficulty'));
            // Retirer la classe active de tous les boutons
            difficultyBtns.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            // Mettre à jour la difficulté
            difficulty = this.getAttribute('data-difficulty');
            console.log('✅ Difficulté sélectionnée:', difficulty);
        });
        console.log(`Gestionnaire ajouté sur bouton ${index + 1}`);
    });

    // Bouton pour commencer le jeu
    if (elements.startGameBtn) {
        console.log('🎮 Ajout événement sur bouton démarrer');
        elements.startGameBtn.addEventListener('click', function() {
            console.log('🚀 Clic sur démarrer le jeu');
            startGame();
        });
    } else {
        console.error('❌ Bouton de démarrage non trouvé!');
    }

    // Bouton pour vérifier la réponse
    if (elements.checkAnswerBtn) {
        elements.checkAnswerBtn.addEventListener('click', checkAnswer);
        console.log('✅ Gestionnaire ajouté sur bouton vérifier');
    }

    // Bouton pour passer le verbe
    if (elements.skipVerbBtn) {
        elements.skipVerbBtn.addEventListener('click', skipVerb);
        console.log('✅ Gestionnaire ajouté sur bouton passer');
    }

    // Bouton pour rejouer
    if (elements.playAgainBtn) {
        elements.playAgainBtn.addEventListener('click', resetGame);
        console.log('✅ Gestionnaire ajouté sur bouton rejouer');
    }

    // Gestion des entrées clavier
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && elements.checkAnswerBtn && !elements.checkAnswerBtn.disabled) {
            e.preventDefault();
            checkAnswer();
        }
        else if (e.key === 'Escape' && elements.skipVerbBtn && !elements.skipVerbBtn.disabled) {
            e.preventDefault();
            skipVerb();
        }
    });

    console.log('✅ Tous les gestionnaires d\'événements ajoutés');
}

function startGame() {
    console.log('🎮 Démarrage du jeu...');
    
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
    console.log('📊 Démarrage du jeu avec difficulté:', difficulty);
    
    updateHUD();
    setGameState('playing');
    startTimer();
    displayVerb();
    if (window.emitGameEvent) emitGameEvent('start');
}

function setGameState(state) {
    console.log('🔄 Changement d\'état vers:', state);
    Object.keys(elements.gameStates).forEach(key => {
        if (elements.gameStates[key]) {
            elements.gameStates[key].classList.remove('active');
        }
    });
    if (elements.gameStates[state]) {
        elements.gameStates[state].classList.add('active');
        console.log('✅ État activé:', state);
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimeDisplay();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    console.log('⏰ Timer démarré');
}

function updateTimeDisplay() {
    if (elements.timeLeftDisplay) {
        elements.timeLeftDisplay.textContent = timeLeft;
        elements.timeLeftDisplay.classList.toggle('time-warning', timeLeft <= 10);
    }
}

function updateHUD() {
    if (elements.playerScoreDisplay) elements.playerScoreDisplay.textContent = score;
    if (elements.playerLevelDisplay) elements.playerLevelDisplay.textContent = playerLevel;
    if (elements.timeLeftDisplay) elements.timeLeftDisplay.textContent = timeLeft;
    if (elements.comboDisplay) {
        elements.comboDisplay.textContent = `x${comboMultiplier.toFixed(1)}`;
        elements.comboDisplay.classList.toggle('high-combo', comboMultiplier >= 1.5);
    }
}

function displayVerb() {
    if (verbChangeInProgress) return;
    verbChangeInProgress = true;
    
    if (elements.checkAnswerBtn) elements.checkAnswerBtn.disabled = true;
    if (elements.skipVerbBtn) elements.skipVerbBtn.disabled = true;
    
    // Vérifier que les données des verbes sont disponibles
    if (!window.verbData || Object.keys(window.verbData).length === 0) {
        console.error('❌ Aucune donnée de verbe disponible!');
        showFeedback(false, 'Erreur: Données des verbes non chargées');
        return;
    }
    
    const verbKeys = Object.keys(window.verbData);
    currentVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
    lastDisplayedVerb = currentVerb;
    
    console.log('📖 Affichage du verbe:', currentVerb);
    
    if (elements.currentVerbDisplay) {
        elements.currentVerbDisplay.textContent = currentVerb;
    }
    
    if (elements.verbTranslation) {
        if (difficulty === "3") {
            elements.verbTranslation.textContent = "";
            elements.verbTranslation.style.display = "none";
        } else {
            elements.verbTranslation.textContent = `(${window.verbData[currentVerb][2]})`;
            elements.verbTranslation.style.display = "block";
        }
    }
    
    // Générer les inputs selon la difficulté
    if (elements.verbFormInputs) {
        elements.verbFormInputs.innerHTML = '';
        
        // Past Simple (toujours présent)
        const psGroup = document.createElement('div');
        psGroup.className = 'verb-input-group';
        psGroup.innerHTML = `
            <label class="verb-input-label">Prétérit (Past Simple)</label>
            <input type="text" class="verb-input" id="past-simple-input" 
                   placeholder="Ex: went, saw..." autocomplete="off" 
                   autocapitalize="off" spellcheck="false">
        `;
        elements.verbFormInputs.appendChild(psGroup);
        
        // Past Participle (difficulté 2 et 3)
        if (difficulty !== "1") {
            const ppGroup = document.createElement('div');
            ppGroup.className = 'verb-input-group';
            ppGroup.innerHTML = `
                <label class="verb-input-label">Participe Passé (Past Participle)</label>
                <input type="text" class="verb-input" id="past-participle-input" 
                       placeholder="Ex: gone, seen..." autocomplete="off" 
                       autocapitalize="off" spellcheck="false">
            `;
            elements.verbFormInputs.appendChild(ppGroup);
        }
        
        // Translation (difficulté 3 uniquement)
        if (difficulty === "3") {
            const trGroup = document.createElement('div');
            trGroup.className = 'verb-input-group';
            trGroup.innerHTML = `
                <label class="verb-input-label">Traduction en français</label>
                <input type="text" class="verb-input" id="translation-input" 
                       placeholder="Ex: aller, voir..." autocomplete="off" 
                       autocapitalize="off" spellcheck="false">
            `;
            elements.verbFormInputs.appendChild(trGroup);
        }
        
        // Focus sur le premier input
        setTimeout(() => {
            const firstInput = document.querySelector('.verb-input');
            if (firstInput) {
                firstInput.focus();
                firstInput.value = '';
            }
        }, 50);
    }
    
    setTimeout(() => {
        if (elements.checkAnswerBtn) elements.checkAnswerBtn.disabled = false;
        if (elements.skipVerbBtn) elements.skipVerbBtn.disabled = false;
        verbDisplayTime = Date.now();
        verbChangeInProgress = false;
    }, 100);
}

function checkAnswer() {
    if (verbChangeInProgress) return;
    
    console.log('🔍 Vérification de la réponse...');
    
    const pastSimpleInput = document.getElementById('past-simple-input');
    const pastParticipleInput = document.getElementById('past-participle-input');
    const translationInput = document.getElementById('translation-input');
    
    if (!pastSimpleInput) {
        console.error('❌ Input past simple non trouvé');
        return;
    }
    
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
    let isPastParticipleCorrect = true;
    if (difficulty !== "1") {
        isPastParticipleCorrect = pastParticipleOptions.includes(userPastParticiple);
    }
    let isTranslationCorrect = true;
    if (difficulty === "3" && translationInput) {
        isTranslationCorrect = translationOptions.includes(userTranslation);
    }
    
    const isCorrect = isPastSimpleCorrect && isPastParticipleCorrect && isTranslationCorrect;
    
    if (isCorrect) {
        correctStreak++;
        if (correctStreak > highestStreak) highestStreak = correctStreak;
        comboMultiplier = 1 + (correctStreak * 0.1);
        
        let points = parseInt(difficulty);
        points = Math.round(points * comboMultiplier);
        
        score += points;
        verbsCompleted++;
        
        updateHUD();
        if (window.emitGameEvent) emitGameEvent('score', { points });
        showFeedback(true, `Correct ! +${points} points`);
        
        // Animation de succès
        const inputEl = document.querySelector('.verb-input');
        if (inputEl) {
            inputEl.classList.add('correct-answer');
            setTimeout(() => inputEl.classList.remove('correct-answer'), 500);
        }
        
        // Animation de score
        if (elements.playerScoreDisplay) {
            elements.playerScoreDisplay.classList.add('score-pulse');
            setTimeout(() => elements.playerScoreDisplay.classList.remove('score-pulse'), 500);
        }
        
        // Vider les inputs
        if (pastSimpleInput) pastSimpleInput.value = '';
        if (pastParticipleInput) pastParticipleInput.value = '';
        if (translationInput) translationInput.value = '';
        
        setTimeout(displayVerb, 300);
    } else {
        correctStreak = 0;
        comboMultiplier = 1;
        updateHUD();
        
        let errMsg = "❌ Incorrect !\n";
        if (!isPastSimpleCorrect) errMsg += `✅ Prétérit: "${correctPastSimple}"\n`;
        if (difficulty !== "1" && !isPastParticipleCorrect) errMsg += `✅ Participe passé: "${correctPastParticiple}"\n`;
        if (difficulty === "3" && !isTranslationCorrect) errMsg += `✅ Traduction: "${correctTranslation}"\n`;
        errMsg += `\n📝 Verbe: ${currentVerb}`;
        
        showFeedback(false, errMsg);
        
        // Animation d'erreur
        const inputEl = document.querySelector('.verb-input');
        if (inputEl) {
            inputEl.classList.add('incorrect-answer');
            setTimeout(() => inputEl.classList.remove('incorrect-answer'), 500);
        }
        
        setTimeout(() => {
            if (pastSimpleInput) pastSimpleInput.value = '';
            if (pastParticipleInput) pastParticipleInput.value = '';
            if (translationInput) translationInput.value = '';
        }, 800);
    }
}

function skipVerb() {
    if (verbChangeInProgress) return;
    
    console.log('⏭️ Verbe passé:', currentVerb);
    
    skippedVerbs.push({
        verb: currentVerb,
        pastSimple: window.verbData[currentVerb][0],
        pastParticiple: window.verbData[currentVerb][1],
        translation: window.verbData[currentVerb][2]
    });
    
    correctStreak = 0;
    comboMultiplier = 1;
    updateHUD();
    
    showFeedback(false, `Passé. Prétérit: "${window.verbData[currentVerb][0]}", Part. Passé: "${window.verbData[currentVerb][1]}".`);
    
    const psInput = document.getElementById('past-simple-input');
    const ppInput = document.getElementById('past-participle-input');
    const trInput = document.getElementById('translation-input');
    
    if (psInput) psInput.value = '';
    if (ppInput) ppInput.value = '';
    if (trInput) trInput.value = '';
    
    setTimeout(displayVerb, 500);
}

function showFeedback(success, message) {
    if (elements.feedbackMessage) {
        elements.feedbackMessage.textContent = message;
        elements.feedbackMessage.className = `feedback-message ${success ? 'success-message' : 'error-message'}`;
        elements.feedbackMessage.style.display = 'block';
        elements.feedbackMessage.style.opacity = '1';
        void elements.feedbackMessage.offsetWidth;
        elements.feedbackMessage.classList.add('animate-feedback');
        
        // Garder le message plus longtemps pour les erreurs
        const timeout = success ? 2000 : 4000;
        setTimeout(() => {
            elements.feedbackMessage.classList.remove('animate-feedback');
            setTimeout(() => {
                if (elements.feedbackMessage) {
                    elements.feedbackMessage.style.opacity = '0';
                }
            }, 500);
        }, timeout);
    }
    console.log(success ? '✅' : '❌', message);
}

async function endGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (elements.finalScoreValue) elements.finalScoreValue.textContent = score;
    if (elements.finalLevelDisplay) elements.finalLevelDisplay.textContent = playerLevel;
    if (elements.verbsCompletedDisplay) elements.verbsCompletedDisplay.textContent = verbsCompleted;
    if (elements.highestComboDisplay) elements.highestComboDisplay.textContent = `x${(1 + highestStreak * 0.1).toFixed(1)}`;
    
    setGameState('gameOver');
    console.log('🏁 Fin de jeu - Score:', score);
    if (window.emitGameEvent) emitGameEvent('end', { score });

    // Sauvegarde score en ligne + Récompenses + stats + notation fin de partie
    try {
        if (window.scoreService && typeof window.scoreService.saveScore === 'function') {
            const extra = {
                highestStreak,
                verbsCompleted,
                difficulty
            };
            await window.scoreService.saveScore('speed-verb-challenge', score, extra);
        }
        const isTopScore = highestStreak >= 10 || score >= 150;
        if (window.rewardService && typeof window.rewardService.giveRewards === 'function') {
            const xpGain = Math.max(5, Math.floor(score / 2) + Math.floor(highestStreak * 1.5));
            const coinsGain = Math.max(3, Math.floor(score / 3) + Math.floor(comboMultiplier));
            window.rewardService.giveRewards({ xp: xpGain, coins: coinsGain }, isTopScore, 'speed-verb-challenge');
        }
        if (window.gameStatsService && typeof window.gameStatsService.recordGamePlay === 'function') {
            const userId = (window.authService && window.authService.getCurrentUser && window.authService.getCurrentUser()?.uid) || null;
            window.gameStatsService.recordGamePlay('speed-verb-challenge', userId, score, null);
        }
        if (window.endGameRating && typeof window.endGameRating.showRating === 'function') {
            const userId = (window.authService && window.authService.getCurrentUser && window.authService.getCurrentUser()?.uid) || null;
            setTimeout(() => window.endGameRating.showRating('speed-verb-challenge', userId, 'Speed Verb Challenge'), 600);
        }
    } catch (e) {
        console.warn('⚠️ [SpeedVerb] Récompenses/notation:', e);
    }
}

function resetGame() {
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
    
    setGameState('welcome');
    console.log('🔄 Jeu réinitialisé');
}

function initGame() {
    console.log("🚀 Initialisation du jeu Speed Verb Challenge");
    
    // Initialiser les éléments DOM
    initElements();
    
    // Vérifier les données des verbes
    if (window.verbData) {
        console.log(`📚 ${Object.keys(window.verbData).length} verbes chargés`);
    } else {
        console.error("❌ Erreur: Les données des verbes n'ont pas été trouvées.");
        console.log("🔄 Tentative de rechargement des données...");
        // Petit délai pour permettre aux scripts de se charger
        setTimeout(() => {
            if (window.verbData) {
                console.log(`📚 ${Object.keys(window.verbData).length} verbes chargés après délai`);
                finishInit();
            } else {
                console.error("❌ Impossible de charger les données des verbes");
            }
        }, 500);
        return;
    }
    
    finishInit();

    // Harmoniser le classement avec Enigma
    setupLeaderboardButtons();
}

function finishInit() {
    // Ajouter les gestionnaires d'événements
    addEventListeners();
    
    console.log("✅ Jeu initialisé avec succès");
}

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM déjà chargé
    initGame();
}

console.log("📜 Speed Verb Challenge script chargé"); 