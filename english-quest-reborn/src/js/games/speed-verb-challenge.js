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
let gameEffects = null; // Initialiser gameEffects à null
let verbDisplayTime = 0; // Timestamp quand un verbe est affiché

// Variables pour les événements
let nextEventTime = 0;
let eventActive = false;
let currentEvent = null;
let eventTimer = null;
let eventVerbsCompleted = 0;

// Liste des événements possibles - uniquement temps et combo
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
        effect: function() {
            // Effet appliqué dans updateComboMultiplier
        }
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
        effect: function() {
            // Effet appliqué dans checkAnswer
        }
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
        effect: function() {
            // Le timer ne décrémente pas pendant la durée de l'effet
            // Implémenté dans startTimer
        }
    }
];

// Référence aux éléments du DOM
const elements = {
    // États du jeu
    gameStates: {
        welcome: document.getElementById('welcome-screen'),
        playing: document.getElementById('playing'),
        gameOver: document.getElementById('game-over')
    },

    // Boutons
    startGameBtn: document.getElementById('start-game-btn'),
    checkAnswerBtn: document.getElementById('check-answer-btn'),
    skipVerbBtn: document.getElementById('skip-verb-btn'),
    saveScoreBtn: document.getElementById('save-score-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    showRulesBtn: document.getElementById('show-rules-btn'),
    closeRulesBtn: document.getElementById('close-rules-btn'),

    // Affichage du verbe
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

    // Réponses du verbe actuel
    currentVerbAnswer: document.getElementById('current-verb-answer'),

    // Modal des règles
    rulesModal: document.getElementById('rules-modal'),

    // Leaderboard
    leaderboardBody: document.getElementById('leaderboard-body')
};

/**
 * Initialisation du jeu
 */
function initGame() {
    console.log("Initialisation du jeu Speed Verb Challenge");

    // Vérifier l'état de connexion de l'utilisateur
    try {
        getPlayerName();
        console.log("Nom du joueur récupéré");

        // Afficher le nom de l'utilisateur dans l'interface
        const playerNameElements = document.querySelectorAll('.player-name');
        playerNameElements.forEach(element => {
            element.textContent = currentUser;
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
    }

    // Vérifier si les données des verbes sont disponibles
    if (window.verbData) {
        // Utiliser les données des verbes globales
        console.log(`${Object.keys(window.verbData).length} verbes chargés`);
    } else {
        console.error("Erreur: Les données des verbes n'ont pas été trouvées");
        // Fallback sur un petit ensemble de verbes
        window.verbData = {
            "be": ["was/were", "been", "être"],
            "begin": ["began", "begun", "commencer"],
            "break": ["broke", "broken", "casser"],
            "bring": ["brought", "brought", "apporter"],
            "do": ["did", "done", "faire"],
            "go": ["went", "gone", "aller"],
            "have": ["had", "had", "avoir"],
            "see": ["saw", "seen", "voir"],
            "take": ["took", "taken", "prendre"],
            "write": ["wrote", "written", "écrire"]
        };
    }

    // Initialiser les effets visuels
    if (window.GameEffects) {
        gameEffects = new GameEffects();
        console.log("Effets visuels initialisés");
    }

    // Ajouter les écouteurs d'événements
    addEventListeners();

    // Initialiser le leaderboard
    initLeaderboard();

    // Protéger contre les interférences externes
    protectGameState();

    console.log("Jeu initialisé avec succès");
}

/**
 * Protège le jeu contre les interférences externes
 */
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

    // Enregistrer cette instance
    window.speedVerbGameInstance = gameInstanceId;
}

/**
 * Ajoute les écouteurs d'événements aux éléments du jeu
 */
function addEventListeners() {
    // Bouton de démarrage
    if (elements.startGameBtn) {
        elements.startGameBtn.addEventListener('click', startGame);
    }

    // Bouton de vérification de réponse
    if (elements.checkAnswerBtn) {
        elements.checkAnswerBtn.addEventListener('click', checkAnswer);
    }

    // Bouton pour passer un verbe
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

    // Boutons pour les règles
    if (elements.showRulesBtn) {
        elements.showRulesBtn.addEventListener('click', showRules);
    }

    if (elements.closeRulesBtn) {
        elements.closeRulesBtn.addEventListener('click', hideRules);
    }

    // Écouteur pour la touche Entrée
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const activeState = Object.keys(elements.gameStates).find(
                state => elements.gameStates[state] && elements.gameStates[state].classList.contains('active')
            );

            if (activeState === 'playing') {
                checkAnswer();
                e.preventDefault(); // Empêcher le comportement par défaut
            } else if (activeState === 'gameOver') {
                saveScore();
                e.preventDefault(); // Empêcher le comportement par défaut
            }
        }
    });

    // Ajouter des écouteurs d'événements pour les champs de saisie
    document.addEventListener('input', function(event) {
        // Vérifier si c'est un champ de saisie du jeu
        if (event.target.classList.contains('verb-input')) {
            // Mettre le texte en minuscules
            event.target.value = event.target.value.toLowerCase();
        }
    });

    // Ajouter des écouteurs pour le focus des champs
    document.addEventListener('focusin', function(event) {
        // Vérifier si c'est un champ de saisie du jeu
        if (event.target.classList.contains('verb-input')) {
            // Sélectionner tout le texte
            event.target.select();
        }
    });

    // Écouteur pour les options de difficulté
    const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
    difficultyOptions.forEach(option => {
        option.addEventListener('change', function() {
            difficulty = this.value;
            console.log(`Difficulté changée: ${difficulty}`);
        });
    });
}

/**
 * Initialise le leaderboard
 */
function initLeaderboard() {
    // Utiliser le système de leaderboard dédié si disponible
    if (window.SpeedVerbLeaderboard) {
        console.log("Initialisation du système de leaderboard dédié");
        SpeedVerbLeaderboard.init('speed-verb-leaderboard');
    } else {
        console.log("Système de leaderboard dédié non disponible, utilisation du système par défaut");
        loadLeaderboard();
    }
}

/**
 * Charge le leaderboard depuis Firebase
 */
function loadLeaderboard() {
    console.log("Chargement du leaderboard");

    if (!elements.leaderboardBody) {
        console.error("Élément leaderboardBody non trouvé");
        return;
    }

    elements.leaderboardBody.innerHTML = '<tr><td colspan="4" class="loading-scores">Invocation des archives ancestrales...</td></tr>';

    // Vérifier si Firebase est disponible
    if (window.firebase && window.firebase.firestore) {
        const db = window.firebase.firestore();

        db.collection("speed_verb_scores")
            .orderBy("score", "desc")
            .limit(10)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aucun score trouvé. Soyez le premier à inscrire votre nom !</td></tr>';
                    return;
                }

                let html = '';
                let rank = 1;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'Date inconnue';

                    html += `
                    <tr>
                        <td class="rank-cell">${rank}</td>
                        <td class="player-cell">${data.playerName || data.name || 'Anonyme'}</td>
                        <td class="score-cell">${data.score}</td>
                        <td class="date-cell">${date}</td>
                    </tr>
                    `;
                    rank++;
                });

                elements.leaderboardBody.innerHTML = html;
            })
            .catch((error) => {
                console.error("Erreur lors du chargement des scores:", error);
                elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Erreur lors du chargement des scores.</td></tr>';
            });
    } else {
        console.error("Firebase n'est pas disponible");
        elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Service de scores indisponible.</td></tr>';
    }
}

/**
 * Démarre le jeu
 */
function startGame() {
    console.log("Démarrage du jeu");

    // Réinitialiser les variables du jeu
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

    // Récupérer la difficulté sélectionnée
    const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
    difficultyOptions.forEach(option => {
        if (option.checked) {
            difficulty = option.value;
        }
    });

    console.log(`Difficulté sélectionnée: ${difficulty}`);

    // Mettre à jour l'affichage
    updateHUD();

    // Changer l'état du jeu
    setGameState('playing');

    // Démarrer le timer
    startTimer();

    // Afficher le premier verbe
    displayVerb();

    // Utiliser les effets visuels pour le démarrage du jeu
    if (gameEffects) {
        gameEffects.gameStartEffect();
    }
}

/**
 * Démarre le timer du jeu
 */
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Initialiser le prochain événement
    nextEventTime = 15 + Math.floor(Math.random() * 15); // Entre 15 et 30 secondes

    timerInterval = setInterval(() => {
        // Ne pas décrémenter le temps si l'événement "time_freeze" est actif
        if (!(eventActive && currentEvent && currentEvent.id === 'time_freeze')) {
            timeLeft--;
        }

        if (elements.timeLeftDisplay) {
            elements.timeLeftDisplay.textContent = timeLeft;

            // Ajouter une classe d'alerte lorsque le temps est faible
            if (timeLeft <= 10) {
                elements.timeLeftDisplay.classList.add('time-warning');
            } else {
                elements.timeLeftDisplay.classList.remove('time-warning');
            }

            // Ajouter une classe spéciale si le temps est figé
            if (eventActive && currentEvent && currentEvent.id === 'time_freeze') {
                elements.timeLeftDisplay.classList.add('time-frozen');
            } else {
                elements.timeLeftDisplay.classList.remove('time-frozen');
            }
        }

        // Vérifier si c'est le moment de déclencher un événement
        if (!eventActive && timeLeft === nextEventTime) {
            triggerRandomEvent();
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

/**
 * Déclenche un événement aléatoire avec mini-défi
 */
function triggerRandomEvent() {
    // Sélectionner un événement aléatoire
    const randomIndex = Math.floor(Math.random() * gameEvents.length);
    currentEvent = gameEvents[randomIndex];

    console.log(`Mini-défi proposé: ${currentEvent.name}`);

    // Afficher le mini-défi
    showChallengeNotification(currentEvent);

    // Activer l'événement mais pas encore son effet
    eventActive = true;

    // Initialiser les variables de suivi du défi
    window.currentChallenge = {
        id: currentEvent.id,
        type: currentEvent.challenge.type,
        target: currentEvent.challenge.target,
        progress: 0,
        startTime: Date.now(),
        completed: false
    };

    // Planifier le prochain événement si celui-ci n'est pas complété
    setTimeout(() => {
        if (!window.currentChallenge.completed) {
            console.log("Mini-défi non complété dans le temps imparti");
            eventActive = false;
            window.currentChallenge = null;

            // Planifier le prochain événement
            nextEventTime = timeLeft - (10 + Math.floor(Math.random() * 20)); // Entre 10 et 30 secondes plus tard
            if (nextEventTime < 5) {
                nextEventTime = 5; // Au moins 5 secondes avant la fin
            }
        }
    }, 30000); // 30 secondes pour compléter le défi
}

/**
 * Affiche une notification de mini-défi
 * @param {Object} event - L'événement à afficher
 */
function showChallengeNotification(event) {
    // Créer un élément pour afficher le défi
    const challengeElement = document.createElement('div');
    challengeElement.className = 'challenge-notification';
    challengeElement.innerHTML = `
        <div class="challenge-header">
            <span class="challenge-icon">🎯</span>
            <span class="challenge-title">Mini-Défi</span>
        </div>
        <div class="challenge-content">
            <p class="challenge-description">${event.challenge.description}</p>
            <div class="challenge-reward">
                <span class="reward-icon">🎁</span>
                <span class="reward-text">Récompense: ${event.description}</span>
            </div>
        </div>
    `;

    // Ajouter l'élément au DOM
    document.body.appendChild(challengeElement);

    // Ajouter une classe pour l'animation d'entrée
    setTimeout(() => {
        challengeElement.classList.add('show');
    }, 100);

    // Supprimer l'élément après un délai
    setTimeout(() => {
        challengeElement.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(challengeElement)) {
                document.body.removeChild(challengeElement);
            }
        }, 500);
    }, 5000);
}

/**
 * Vérifie si le joueur a complété le mini-défi actuel
 * @param {Object} params - Paramètres spécifiques au type de défi
 * @returns {boolean} - Vrai si le défi est complété
 */
function checkChallengeCompletion(params) {
    if (!window.currentChallenge || window.currentChallenge.completed) {
        return false;
    }

    let isCompleted = false;

    switch (window.currentChallenge.type) {
        case 'streak':
            // Défi de streak: obtenir X bonnes réponses d'affilée
            if (params.streak >= window.currentChallenge.target) {
                isCompleted = true;
            }
            break;

        case 'speed':
            // Défi de vitesse: répondre correctement en moins de X secondes
            if (params.isCorrect && params.responseTime <= window.currentChallenge.target) {
                isCompleted = true;
            }
            break;

        case 'difficulty':
            // Défi de difficulté: compléter un verbe difficile
            if (params.isCorrect && params.difficulty === window.currentChallenge.target) {
                isCompleted = true;
            }
            break;

        case 'consecutive':
            // Défi de consécutivité: compléter X verbes consécutifs sans erreur
            if (params.isCorrect) {
                window.currentChallenge.progress++;
                if (window.currentChallenge.progress >= window.currentChallenge.target) {
                    isCompleted = true;
                }
            } else {
                // Réinitialiser le progrès en cas d'erreur
                window.currentChallenge.progress = 0;
            }
            break;
    }

    if (isCompleted) {
        completeChallengeAndApplyReward();
    }

    return isCompleted;
}

/**
 * Complète le défi actuel et applique la récompense
 */
function completeChallengeAndApplyReward() {
    if (!window.currentChallenge || !eventActive) {
        return;
    }

    // Marquer le défi comme complété
    window.currentChallenge.completed = true;

    // Trouver l'événement correspondant
    const event = gameEvents.find(e => e.id === window.currentChallenge.id);
    if (!event) {
        return;
    }

    console.log(`Mini-défi complété: ${event.name}`);

    // Afficher une notification de réussite
    showEventNotification(event);

    // Appliquer l'effet immédiat si c'est un bonus de temps
    if (event.id === 'extra_time') {
        event.effect();
        eventActive = false;
    } else if (event.duration > 0) {
        // Démarrer le timer pour les événements avec durée
        let eventTimeLeft = event.duration;

        // Créer un élément pour afficher le temps restant
        const eventTimerElement = document.createElement('div');
        eventTimerElement.className = 'event-timer';
        eventTimerElement.innerHTML = `<span>${event.name}</span> <span class="time-left">${eventTimeLeft}s</span>`;
        document.body.appendChild(eventTimerElement);

        // Démarrer le timer
        eventTimer = setInterval(() => {
            eventTimeLeft--;

            // Mettre à jour l'affichage
            const timeLeftElement = eventTimerElement.querySelector('.time-left');
            if (timeLeftElement) {
                timeLeftElement.textContent = `${eventTimeLeft}s`;
            }

            // Fin de l'événement
            if (eventTimeLeft <= 0) {
                clearInterval(eventTimer);
                eventActive = false;
                window.currentChallenge = null;

                // Supprimer l'élément d'affichage
                if (document.body.contains(eventTimerElement)) {
                    document.body.removeChild(eventTimerElement);
                }

                // Planifier le prochain événement
                nextEventTime = timeLeft - (10 + Math.floor(Math.random() * 20)); // Entre 10 et 30 secondes plus tard
                if (nextEventTime < 5) {
                    nextEventTime = 5; // Au moins 5 secondes avant la fin
                }
            }
        }, 1000);
    }
}

/**
 * Affiche une notification d'événement
 * @param {Object} event - L'événement à afficher
 */
function showEventNotification(event) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `event-notification ${event.type}`;

    // Icône selon le type d'événement
    const icon = event.type === 'bonus' ? '🎁' : '⚡';

    notification.innerHTML = `
        <div class="event-icon">${icon}</div>
        <div class="event-content">
            <h3>${event.name}</h3>
            <p>${event.description}</p>
        </div>
    `;

    // Ajouter au DOM
    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Supprimer après un délai
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

/**
 * Met à jour l'affichage du temps
 */
function updateTimeDisplay() {
    if (elements.timeLeftDisplay) {
        elements.timeLeftDisplay.textContent = timeLeft;
    }
}

/**
 * Affiche un nouveau verbe aléatoire
 */
function displayVerb() {
    // Éviter les appels multiples pendant le changement de verbe
    if (verbChangeInProgress) {
        console.log("⚠️ Changement de verbe déjà en cours, appel ignoré");
        return;
    }

    // Compteur d'appels pour le débogage
    const currentCallCount = (window.verbChangeCallCount || 0) + 1;
    window.verbChangeCallCount = currentCallCount;

    console.log(`[CALL #${currentCallCount}] Affichage d'un nouveau verbe`);

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
    const verbKeys = Object.keys(window.verbData);
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
        // Cacher la traduction en mode Maître
        if (difficulty === "3") {
            elements.verbTranslation.textContent = "";
            elements.verbTranslation.style.display = "none";
        } else {
            elements.verbTranslation.textContent = `(${window.verbData[currentVerb][2]})`;
            elements.verbTranslation.style.display = "block";
        }
    }

    // Créer les champs de saisie selon la difficulté
    if (elements.verbFormInputs) {
        elements.verbFormInputs.innerHTML = '';

        // Passé simple (toujours affiché)
        const pastSimpleGroup = document.createElement('div');
        pastSimpleGroup.className = 'verb-input-group';

        const pastSimpleLabel = document.createElement('label');
        pastSimpleLabel.className = 'verb-input-label';
        pastSimpleLabel.textContent = 'Prétérit (Past Simple)';

        const pastSimpleInput = document.createElement('input');
        pastSimpleInput.type = 'text';
        pastSimpleInput.className = 'verb-input';
        pastSimpleInput.id = 'past-simple-input';
        pastSimpleInput.placeholder = 'Ex: went, saw, took...';
        pastSimpleInput.autocomplete = 'off';
        pastSimpleInput.autocapitalize = 'off';
        pastSimpleInput.spellcheck = false;

        pastSimpleGroup.appendChild(pastSimpleLabel);
        pastSimpleGroup.appendChild(pastSimpleInput);
        elements.verbFormInputs.appendChild(pastSimpleGroup);

        // Participe passé (affiché en mode Adepte et Maître)
        if (difficulty !== "1") {
            const pastParticipleGroup = document.createElement('div');
            pastParticipleGroup.className = 'verb-input-group';

            const pastParticipleLabel = document.createElement('label');
            pastParticipleLabel.className = 'verb-input-label';
            pastParticipleLabel.textContent = 'Participe Passé (Past Participle)';

            const pastParticipleInput = document.createElement('input');
            pastParticipleInput.type = 'text';
            pastParticipleInput.className = 'verb-input';
            pastParticipleInput.id = 'past-participle-input';
            pastParticipleInput.placeholder = 'Ex: gone, seen, taken...';
            pastParticipleInput.autocomplete = 'off';
            pastParticipleInput.autocapitalize = 'off';
            pastParticipleInput.spellcheck = false;

            pastParticipleGroup.appendChild(pastParticipleLabel);
            pastParticipleGroup.appendChild(pastParticipleInput);
            elements.verbFormInputs.appendChild(pastParticipleGroup);
        }

        // Traduction (affichée uniquement en mode Maître)
        if (difficulty === "3") {
            const translationGroup = document.createElement('div');
            translationGroup.className = 'verb-input-group';

            const translationLabel = document.createElement('label');
            translationLabel.className = 'verb-input-label';
            translationLabel.textContent = 'Traduction en français';

            const translationInput = document.createElement('input');
            translationInput.type = 'text';
            translationInput.className = 'verb-input';
            translationInput.id = 'translation-input';
            translationInput.placeholder = 'Ex: aller, voir, prendre...';
            translationInput.autocomplete = 'off';
            translationInput.autocapitalize = 'off';
            translationInput.spellcheck = false;

            translationGroup.appendChild(translationLabel);
            translationGroup.appendChild(translationInput);
            elements.verbFormInputs.appendChild(translationGroup);
        }

        // Focus sur le premier champ
        setTimeout(() => {
            const firstInput = document.querySelector('.verb-input');
            if (firstInput) {
                firstInput.focus();
                firstInput.value = ''; // S'assurer que le champ est vide
            }
        }, 100);
    }

    // Réactiver les boutons après un court délai
    setTimeout(() => {
        if (checkButton) checkButton.disabled = false;
        if (skipButton) skipButton.disabled = false;

        // Enregistrer le temps d'affichage du verbe pour mesurer le temps de réponse
        verbDisplayTime = Date.now();

        // Marquer la fin du changement
        verbChangeInProgress = false;
        console.log(`[CALL #${currentCallCount}] 🔓 Verrouillage désactivé: fin du changement de verbe`);
    }, 300);
}

/**
 * Vérifie la réponse de l'utilisateur
 */
function checkAnswer() {
    // Éviter les vérifications pendant le changement de verbe
    if (verbChangeInProgress) {
        console.log("⚠️ Changement de verbe en cours, vérification ignorée");
        return;
    }

    console.log("Vérification de la réponse");

    // Récupérer les réponses de l'utilisateur
    const pastSimpleInput = document.getElementById('past-simple-input');
    const pastParticipleInput = document.getElementById('past-participle-input');
    const translationInput = document.getElementById('translation-input');

    if (!pastSimpleInput) {
        console.error("Champ de saisie du passé simple non trouvé");
        return;
    }

    const userPastSimple = pastSimpleInput.value.trim().toLowerCase();
    const userPastParticiple = pastParticipleInput ? pastParticipleInput.value.trim().toLowerCase() : null;
    const userTranslation = translationInput ? translationInput.value.trim().toLowerCase() : null;

    // Récupérer les réponses correctes
    const correctPastSimple = window.verbData[currentVerb][0].toLowerCase();
    const correctPastParticiple = window.verbData[currentVerb][1].toLowerCase();
    const correctTranslation = window.verbData[currentVerb][2].toLowerCase();

    // Vérifier si les réponses sont correctes
    let isCorrect = false;

    // Gérer les verbes avec plusieurs formes possibles (séparées par /)
    const pastSimpleOptions = correctPastSimple.split('/').map(opt => opt.trim());
    const pastParticipleOptions = correctPastParticiple.split('/').map(opt => opt.trim());
    const translationOptions = correctTranslation.split('/').map(opt => opt.trim());

    // Vérifier le passé simple
    const isPastSimpleCorrect = pastSimpleOptions.includes(userPastSimple);

    // Vérifier le participe passé si nécessaire
    let isPastParticipleCorrect = true;
    if (difficulty !== "1") {
        isPastParticipleCorrect = pastParticipleOptions.includes(userPastParticiple);
    }

    // Vérifier la traduction si nécessaire
    let isTranslationCorrect = true;
    if (difficulty === "3" && translationInput) {
        isTranslationCorrect = translationOptions.includes(userTranslation);
    }

    // Déterminer si la réponse globale est correcte
    isCorrect = isPastSimpleCorrect && isPastParticipleCorrect && isTranslationCorrect;

    // Calculer le temps de réponse si c'est une bonne réponse
    const responseTime = isCorrect ? (Date.now() - verbDisplayTime) / 1000 : 0;

    // Traiter la réponse
    if (isCorrect) {
        // Mettre à jour le streak et le combo
        correctStreak++;
        if (correctStreak > highestStreak) {
            highestStreak = correctStreak;
        }

        // Calculer le multiplicateur de combo
        comboMultiplier = 1 + (correctStreak * 0.1);

        // Vérifier si le défi actuel est complété
        if (window.currentChallenge && eventActive) {
            checkChallengeCompletion({
                isCorrect: true,
                streak: correctStreak,
                responseTime: responseTime,
                difficulty: difficulty
            });
        }

        // Calculer les points selon la difficulté
        let points = parseInt(difficulty);
        points = Math.round(points * comboMultiplier);

        // Appliquer les effets des événements actifs
        if (eventActive && currentEvent) {
            if (currentEvent.id === 'combo_boost') {
                points = Math.round(points * 1.5); // Bonus de 50% sur les points
            } else if (currentEvent.id === 'double_points') {
                points = points * 2; // Points doublés
            }
        }

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
        if (inputElement && gameEffects) {
            gameEffects.successEffect(inputElement);
        } else if (inputElement) {
            inputElement.classList.add('correct-answer');
            setTimeout(() => {
                inputElement.classList.remove('correct-answer');
            }, 1000);
        }

        // Vider les champs de saisie
        const pastSimpleInput = document.getElementById('past-simple-input');
        const pastParticipleInput = document.getElementById('past-participle-input');
        const translationInput = document.getElementById('translation-input');

        if (pastSimpleInput) {
            pastSimpleInput.value = '';
        }

        if (pastParticipleInput) {
            pastParticipleInput.value = '';
        }

        if (translationInput) {
            translationInput.value = '';
        }

        // Afficher un nouveau verbe après un court délai
        setTimeout(() => {
            displayVerb();
        }, 800);
    } else {
        // Réinitialiser le streak et le combo
        correctStreak = 0;
        comboMultiplier = 1;

        // Vérifier si le défi actuel est affecté par une réponse incorrecte
        if (window.currentChallenge && eventActive) {
            checkChallengeCompletion({
                isCorrect: false,
                streak: 0,
                responseTime: 0,
                difficulty: difficulty
            });
        }

        // Mettre à jour l'affichage
        updateHUD();

        // Afficher un message d'erreur
        let errorMessage = "Incorrect ! ";

        if (!isPastSimpleCorrect) {
            errorMessage += `Le prétérit est "${correctPastSimple}". `;
        }

        if (difficulty !== "1" && !isPastParticipleCorrect) {
            errorMessage += `Le participe passé est "${correctPastParticiple}". `;
        }

        if (difficulty === "3" && !isTranslationCorrect) {
            errorMessage += `La traduction est "${correctTranslation}". `;
        }

        showFeedback(false, errorMessage);

        // Effet visuel d'erreur
        const inputElement = document.querySelector('.verb-input');

        if (inputElement && gameEffects) {
            gameEffects.errorEffect(inputElement);
        } else if (inputElement) {
            inputElement.classList.add('incorrect-answer');
            setTimeout(() => {
                inputElement.classList.remove('incorrect-answer');
            }, 1000);
        }

        // Vider les champs après un court délai
        setTimeout(() => {
            const pastSimpleInput = document.getElementById('past-simple-input');
            const pastParticipleInput = document.getElementById('past-participle-input');
            const translationInput = document.getElementById('translation-input');

            if (pastSimpleInput) {
                pastSimpleInput.value = '';
            }

            if (pastParticipleInput) {
                pastParticipleInput.value = '';
            }

            if (translationInput) {
                translationInput.value = '';
            }
        }, 1500);
    }
}

/**
 * Passe au verbe suivant
 */
function skipVerb() {
    // Éviter les sauts pendant le changement de verbe
    if (verbChangeInProgress) {
        console.log("⚠️ Changement de verbe en cours, saut ignoré");
        return;
    }

    console.log("Verbe passé:", currentVerb);

    // Ajouter le verbe à la liste des verbes passés
    skippedVerbs.push({
        verb: currentVerb,
        pastSimple: window.verbData[currentVerb][0],
        pastParticiple: window.verbData[currentVerb][1],
        translation: window.verbData[currentVerb][2]
    });

    // Réinitialiser le streak et le combo
    correctStreak = 0;
    comboMultiplier = 1;

    // Mettre à jour l'affichage
    updateHUD();

    // Afficher un message
    showFeedback(false, `Verbe passé. Le prétérit est "${window.verbData[currentVerb][0]}" et le participe passé est "${window.verbData[currentVerb][1]}".`);

    // Effet visuel de saut
    if (gameEffects) {
        gameEffects.skipEffect();
    }

    // Vider les champs de saisie
    const pastSimpleInput = document.getElementById('past-simple-input');
    const pastParticipleInput = document.getElementById('past-participle-input');
    const translationInput = document.getElementById('translation-input');

    if (pastSimpleInput) {
        pastSimpleInput.value = '';
    }

    if (pastParticipleInput) {
        pastParticipleInput.value = '';
    }

    if (translationInput) {
        translationInput.value = '';
    }

    // Afficher un nouveau verbe après un court délai
    setTimeout(() => {
        displayVerb();
    }, 1000);
}

/**
 * Ajoute de l'expérience au joueur
 * @param {number} xp - Quantité d'XP à ajouter
 */
function addExperience(xp) {
    playerXP += xp;

    // Vérifier si le joueur monte de niveau
    while (playerXP >= xpToNextLevel) {
        playerXP -= xpToNextLevel;
        playerLevel++;
        xpToNextLevel = Math.floor(100 * Math.pow(1.5, playerLevel - 1));

        // Effet de montée de niveau
        if (elements.playerLevelDisplay) {
            elements.playerLevelDisplay.classList.add('level-up-effect');
            setTimeout(() => {
                elements.playerLevelDisplay.classList.remove('level-up-effect');
            }, 1000);
        }

        console.log(`Niveau supérieur ! Vous êtes maintenant niveau ${playerLevel}`);
        showFeedback(true, `Niveau supérieur ! Vous êtes maintenant niveau ${playerLevel}`);
    }

    // Mettre à jour la barre de progression
    updateXPBar();
}

/**
 * Met à jour la barre de progression d'XP
 */
function updateXPBar() {
    if (elements.xpProgressBar) {
        const progress = (playerXP / xpToNextLevel) * 100;
        elements.xpProgressBar.style.width = `${progress}%`;
    }
}

/**
 * Met à jour l'affichage du HUD
 */
function updateHUD() {
    if (elements.playerScoreDisplay) {
        elements.playerScoreDisplay.textContent = score;
    }

    if (elements.playerLevelDisplay) {
        elements.playerLevelDisplay.textContent = playerLevel;
    }

    if (elements.timeLeftDisplay) {
        elements.timeLeftDisplay.textContent = timeLeft;
    }

    if (elements.comboDisplay) {
        elements.comboDisplay.textContent = `x${comboMultiplier.toFixed(1)}`;

        // Ajouter une classe spéciale pour les combos élevés
        if (comboMultiplier >= 1.5) {
            elements.comboDisplay.classList.add('high-combo');
        } else {
            elements.comboDisplay.classList.remove('high-combo');
        }
    }

    // Mettre à jour la barre de progression
    updateXPBar();
}

/**
 * Vérifie si le joueur atteint un palier de streak pour obtenir un bonus
 * @param {number} streak - Le nombre de bonnes réponses consécutives
 */
function checkStreakBonus(streak) {
    // Définir les paliers de streak et leurs récompenses (uniquement XP, pas de pièces d'or)
    const streakBonuses = [
        { streak: 5, message: "🔥 5 bonnes réponses d'affilée ! Combo x1.5" },
        { streak: 10, message: "🔥🔥 10 bonnes réponses d'affilée ! Combo x2.0" },
        { streak: 15, message: "🔥🔥🔥 15 bonnes réponses d'affilée ! Combo x2.5" },
        { streak: 20, message: "🔥🔥🔥🔥 20 bonnes réponses d'affilée ! Combo x3.0" },
        { streak: 25, message: "🔥🔥🔥🔥🔥 25 bonnes réponses d'affilée ! Combo x3.5" },
        { streak: 30, xp: 30, message: "🏆 30 bonnes réponses d'affilée ! Combo x4.0 et +30 XP" },
        { streak: 40, xp: 40, message: "🏆🏆 40 bonnes réponses d'affilée ! Combo x5.0 et +40 XP" },
        { streak: 50, xp: 50, message: "🏆🏆🏆 50 bonnes réponses d'affilée ! Combo x6.0 et +50 XP" }
    ];

    // Vérifier si le streak actuel correspond à un palier
    const bonus = streakBonuses.find(b => b.streak === streak);

    if (bonus) {
        // Afficher un message spécial
        showFeedback(true, bonus.message);

        // Ajouter un effet visuel spécial
        if (gameEffects) {
            gameEffects.streakBonusEffect();
        }

        // Ajouter de l'XP si applicable
        if (window.RewardSystem && bonus.xp) {
            window.RewardSystem.addXP(bonus.xp, 'Speed Verb Challenge - Streak Bonus');
        }

        // Jouer un son spécial si disponible
        playSound('streak-bonus');

        // Vérifier si le défi actuel est complété
        if (window.currentChallenge && eventActive && window.currentChallenge.type === 'streak') {
            checkChallengeCompletion({
                isCorrect: true,
                streak: streak,
                responseTime: 0,
                difficulty: difficulty
            });
        }
    }
}

/**
 * Joue un son si disponible
 * @param {string} soundName - Le nom du son à jouer
 */
function playSound(soundName) {
    if (window.GameSounds && typeof window.GameSounds.play === 'function') {
        window.GameSounds.play(soundName);
    }
}

/**
 * Affiche un message de feedback
 * @param {boolean} success - Si le message est un succès ou un échec
 * @param {string} message - Le message à afficher
 */
function showFeedback(success, message) {
    if (elements.feedbackMessage) {
        elements.feedbackMessage.textContent = message;
        elements.feedbackMessage.className = success ? 'feedback-message success-message' : 'feedback-message error-message';

        // Réinitialiser l'animation
        void elements.feedbackMessage.offsetWidth;
        elements.feedbackMessage.classList.add('animate-feedback');

        // Supprimer la classe d'animation après la fin de l'animation
        setTimeout(() => {
            elements.feedbackMessage.classList.remove('animate-feedback');
        }, 2000);
    }
}

/**
 * Change l'état du jeu
 * @param {string} state - L'état à afficher ('welcome', 'playing', 'gameOver')
 */
function setGameState(state) {
    // Cacher tous les états
    Object.keys(elements.gameStates).forEach(key => {
        if (elements.gameStates[key]) {
            elements.gameStates[key].classList.remove('active');
        }
    });

    // Afficher l'état demandé
    if (elements.gameStates[state]) {
        elements.gameStates[state].classList.add('active');
    }
}

/**
 * Affiche les règles du jeu
 */
function showRules() {
    if (elements.rulesModal) {
        elements.rulesModal.classList.add('active');
    }
}

/**
 * Cache les règles du jeu
 */
function hideRules() {
    if (elements.rulesModal) {
        elements.rulesModal.classList.remove('active');
    }
}

/**
 * Termine le jeu
 */
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

    // Utiliser le système de leaderboard dédié si disponible
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
        console.log("SpeedVerbLeaderboard not available");
        // Fallback sur notre méthode locale
        loadLeaderboard();
    }

    // Effet de fin de jeu
    if (gameEffects) {
        gameEffects.gameOverEffect();
    }

    // Récompenser le joueur avec 10 pièces d'or pour avoir terminé une partie
    if (window.RewardSystem) {
        // Récompense de base pour avoir joué
        window.RewardSystem.addCoins(10, 'Speed Verb Challenge - Partie terminée');

        // Ajouter de l'XP basée sur le score
        const xpAmount = Math.floor(score / 5);
        if (xpAmount > 0) {
            window.RewardSystem.addXP(xpAmount, 'Speed Verb Challenge - Partie terminée');
        }

        // Afficher un message
        showFeedback(true, `🎮 Partie terminée ! Vous gagnez 10 pièces d'or et ${xpAmount} XP !`);

        console.log(`Récompenses attribuées: 10 pièces d'or et ${xpAmount} XP`);

        // Vérifier si c'est un high score et attribuer la récompense
        checkIfHighScore(score).then(isHighScore => {
            if (isHighScore) {
                console.log("High score détecté à la fin du jeu");
                // Attribuer la récompense pour le high score
                rewardHighScore(score, window.firebaseConnectionState && !window.firebaseConnectionState.isOnline);
            }
        });
    }
}

/**
 * Affiche les réponses correctes pour le verbe actuel
 */
function showCurrentVerbAnswers() {
    if (elements.currentVerbAnswer && lastDisplayedVerb && window.verbData[lastDisplayedVerb]) {
        const verb = lastDisplayedVerb;
        const pastSimple = window.verbData[verb][0];
        const pastParticiple = window.verbData[verb][1];
        const translation = window.verbData[verb][2];

        elements.currentVerbAnswer.innerHTML = `
            <strong>${verb}</strong> -
            Passé Simple: <strong>${pastSimple}</strong>,
            Participe Passé: <strong>${pastParticiple}</strong>,
            Traduction: <strong>${translation}</strong>
        `;
    }
}

/**
 * Sauvegarde le score du joueur
 * Utilise le nom du profil utilisateur ou le nom stocké localement
 */
function saveScore() {
    console.log("Sauvegarde du score");

    // Désactiver le bouton pendant la sauvegarde
    if (elements.saveScoreBtn) {
        elements.saveScoreBtn.disabled = true;
        elements.saveScoreBtn.textContent = "Sauvegarde en cours...";
    }

    // Récupérer le nom du joueur depuis le profil utilisateur
    let playerName = getPlayerName();
    console.log("Nom du joueur pour la sauvegarde du score:", playerName);

    // S'assurer que le nom n'est pas vide
    if (!playerName || playerName.trim() === '') {
        playerName = 'Joueur ' + Math.floor(Math.random() * 1000);
        localStorage.setItem('playerName', playerName);
    }

    console.log("Saving score with player name:", playerName);

    // Vérifier si c'est un high score
    checkIfHighScore(score).then(isHighScore => {
        // Ajouter une classe spéciale au bouton si c'est un high score
        if (isHighScore && elements.saveScoreBtn) {
            elements.saveScoreBtn.classList.add('save-score-effect');
        }

        // Utiliser le système de leaderboard dédié si disponible
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
                // Afficher un message de succès
                const successMessage = isHighScore
                    ? "🏆 Nouveau record ! Score sauvegardé avec succès !"
                    : "Score sauvegardé avec succès !";

                showFeedback(true, successMessage);

                // Ne pas récompenser le joueur ici, car la récompense est déjà attribuée à la fin du jeu
                // La fonction rewardHighScore est appelée dans endGame()

                // Réinitialiser le jeu après un délai pour que l'utilisateur voie le message
                setTimeout(() => {
                    resetGame();
                }, 2000);
            }
        } else {
            console.log("SpeedVerbLeaderboard not available, using fallback method");

            // CODE FALLBACK: Sauvegarder directement dans Firebase
            if (window.firebase && window.firebase.firestore) {
                const db = window.firebase.firestore();

                // Ajouter le score à la base de données
                db.collection('speed_verb_scores').add({
                    playerName: playerName,
                    score: score,
                    level: playerLevel,
                    verbsCompleted: verbsCompleted,
                    difficulty: difficulty,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    highScore: isHighScore
                })
                .then(() => {
                    // Afficher un message de succès
                    console.log('Score saved successfully!');

                    const successMessage = isHighScore
                        ? "🏆 Nouveau record ! Score sauvegardé avec succès !"
                        : "Score sauvegardé avec succès !";

                    showFeedback(true, successMessage);

                    // Ne pas récompenser le joueur ici, car la récompense est déjà attribuée à la fin du jeu
                    // La fonction rewardHighScore est appelée dans endGame()

                    // Réinitialiser le jeu après un délai
                    setTimeout(() => {
                        resetGame();
                    }, 2000);
                })
                .catch(error => {
                    console.error('Error saving score:', error);
                    showFeedback(false, "Erreur: Le score n'a pas pu être sauvegardé. Veuillez réessayer.");

                    // Réactiver le bouton en cas d'erreur
                    if (elements.saveScoreBtn) {
                        elements.saveScoreBtn.disabled = false;
                        elements.saveScoreBtn.textContent = "Inscrire mon score";
                    }
                });
            } else {
                console.error("Firebase not available");
                showFeedback(false, "Erreur: Service de scores indisponible.");

                // Réactiver le bouton en cas d'erreur
                if (elements.saveScoreBtn) {
                    elements.saveScoreBtn.disabled = false;
                    elements.saveScoreBtn.textContent = "Inscrire mon score";
                }
            }
        }
    });
}

/**
 * Vérifie si le score est un high score
 * @param {number} score - Le score à vérifier
 * @returns {Promise<boolean>} - Promesse résolue avec un booléen indiquant si c'est un high score
 */
function checkIfHighScore(score) {
    return new Promise((resolve) => {
        // Utiliser le système de leaderboard dédié si disponible
        if (window.SpeedVerbLeaderboard && typeof window.SpeedVerbLeaderboard.isHighScore === 'function') {
            window.SpeedVerbLeaderboard.isHighScore(score)
                .then(isHighScore => {
                    resolve(isHighScore);
                })
                .catch(() => {
                    // En cas d'erreur, supposer que c'est un high score
                    resolve(true);
                });
        } else {
            // Vérifier manuellement si c'est un high score
            if (window.firebase && window.firebase.firestore) {
                const db = window.firebase.firestore();

                db.collection("speed_verb_scores")
                    .orderBy("score", "desc")
                    .limit(10)
                    .get()
                    .then((querySnapshot) => {
                        // Si moins de 10 scores, c'est automatiquement un high score
                        if (querySnapshot.size < 10) {
                            resolve(true);
                            return;
                        }

                        // Récupérer le score le plus bas du top 10
                        let lowestScore = Infinity;
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            if (data.score < lowestScore) {
                                lowestScore = data.score;
                            }
                        });

                        // Comparer avec le score actuel
                        resolve(score > lowestScore);
                    })
                    .catch(() => {
                        // En cas d'erreur, supposer que c'est un high score
                        resolve(true);
                    });
            } else {
                // Si Firebase n'est pas disponible, supposer que c'est un high score
                resolve(true);
            }
        }
    });
}

/**
 * Récupère le nom du joueur depuis le profil utilisateur ou le localStorage
 * @returns {string} - Le nom du joueur
 */
function getPlayerName() {
    // Variable pour stocker si c'est le premier appel
    if (window._getPlayerNameCalled === undefined) {
        window._getPlayerNameCalled = true;
    } else {
        // Si ce n'est pas le premier appel, utiliser la valeur en cache si disponible
        if (window._cachedPlayerName) {
            return window._cachedPlayerName;
        }
    }

    // Forcer la vérification de l'utilisateur dans localStorage avant d'utiliser getCurrentUser
    try {
        const userJson = localStorage.getItem('english_quest_current_user');
        if (userJson) {
            const user = JSON.parse(userJson);
            // Ne pas afficher les données sensibles

            if (user && user.username && user.username !== 'Joueur') {
                // Stocker en cache pour les appels futurs
                window._cachedPlayerName = user.username;
                return user.username;
            }
        }
    } catch (e) {
        console.warn("Erreur lors de la récupération du profil depuis localStorage");
    }

    // Utiliser la fonction getCurrentUser modifiée
    if (typeof window.getCurrentUser === 'function') {
        try {
            const currentUser = window.getCurrentUser();

            if (currentUser && currentUser.username && currentUser.username !== 'Joueur') {
                // Stocker en cache pour les appels futurs
                window._cachedPlayerName = currentUser.username;
                return currentUser.username;
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à getCurrentUser");
        }
    }

    // Vérifier si un profil local existe
    try {
        const localProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (localProfile && localProfile.username && localProfile.username !== 'Joueur') {
            // Stocker en cache pour les appels futurs
            window._cachedPlayerName = localProfile.username;
            return localProfile.username;
        }
    } catch (e) {
        console.warn("Erreur lors de la récupération du profil local");
    }

    // Vérifier si nous avons un utilisateur connecté avec un profil
    if (window.authState && window.authState.profile && window.authState.profile.username && window.authState.profile.username !== 'Joueur') {
        // Stocker en cache pour les appels futurs
        window._cachedPlayerName = window.authState.profile.username;
        return window.authState.profile.username;
    }

    // Si l'utilisateur est connecté, utiliser son nom d'utilisateur
    if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
        const user = window.firebase.auth().currentUser;
        if (user.displayName) {
            // Stocker en cache pour les appels futurs
            window._cachedPlayerName = user.displayName;
            return user.displayName;
        }
        // Si pas de displayName, utiliser l'email sans le domaine
        if (user.email && user.email !== 'anonymous@example.com') {
            const username = user.email.split('@')[0];
            // Stocker en cache pour les appels futurs
            window._cachedPlayerName = username;
            return username;
        }
    }

    // En dernier recours, utiliser le nom stocké localement ou un nom par défaut
    const storedName = localStorage.getItem('playerName');
    if (storedName && storedName !== 'Joueur') {
        // Stocker en cache pour les appels futurs
        window._cachedPlayerName = storedName;
        return storedName;
    }

    // Stocker en cache pour les appels futurs
    window._cachedPlayerName = 'Joueur';
    return 'Joueur';
}

/**
 * Récompense le joueur pour un high score
 * @param {number} score - Le score obtenu
 * @param {boolean} offline - Si le high score est en mode hors ligne
 */
function rewardHighScore(score, offline = false) {
    console.log(`Récompense pour high score: ${score} points${offline ? ' (hors ligne)' : ''}`);

    // Vérifier si la récompense a déjà été attribuée pour cette session de jeu
    if (window.highScoreRewardGiven) {
        console.log("Récompense pour high score déjà attribuée pour cette session, ignoré.");
        return;
    }

    // Marquer que la récompense a été attribuée pour cette session
    window.highScoreRewardGiven = true;

    // Ajouter un événement personnalisé pour informer le système de récompense
    // Mais ne pas utiliser cet événement pour attribuer des récompenses (pour éviter les doublons)
    const event = new CustomEvent('highScoreAchieved', {
        detail: {
            game: 'speed-verb-challenge',
            score: score,
            timestamp: new Date(),
            offline: offline,
            rewardAlreadyGiven: true // Indiquer que la récompense est déjà gérée
        }
    });

    document.dispatchEvent(event);

    // Utiliser le système de récompense si disponible
    if (window.RewardSystem) {
        try {
            // Ne récompenser le joueur que s'il n'est pas hors ligne
            if (!offline) {
                // Récompenser le joueur avec 100 pièces d'or pour un high score en ligne
                window.RewardSystem.addCoins(100, 'Speed Verb Challenge - High Score');

                // Récompenser le joueur avec de l'XP (basé sur le score)
                const xpAmount = Math.floor(score / 2);
                window.RewardSystem.addXP(xpAmount, 'Speed Verb Challenge - High Score');

                // Afficher un message spécial
                showFeedback(true, `🏆 Nouveau record ! Vous gagnez 100 pièces d'or et ${xpAmount} XP !`);

                console.log(`Récompenses pour high score attribuées: 100 pièces d'or et ${xpAmount} XP`);
            } else {
                // Message pour les scores hors ligne
                showFeedback(true, `🏆 Nouveau record hors ligne ! Connectez-vous pour gagner des récompenses.`);
            }

            // Ajouter un effet visuel spécial
            if (gameEffects) {
                gameEffects.streakBonusEffect();
            }
        } catch (error) {
            console.warn("Erreur lors de l'attribution des récompenses:", error);
            showFeedback(true, `🏆 Nouveau record ! Les récompenses seront disponibles quand vous serez en ligne.`);
        }
    } else {
        console.warn("Système de récompense non disponible");
        showFeedback(true, `🏆 Nouveau record ! Les récompenses seront disponibles quand vous serez en ligne.`);
    }
}

/**
 * Récupère le nom du joueur depuis le profil utilisateur
 * @returns {string} Le nom du joueur
 */
function getPlayerNameFromProfile() {
    // Vérifier d'abord si un nom est stocké dans le localStorage
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
        console.log("Nom récupéré depuis localStorage:", storedName);
        return storedName;
    }

    // Utiliser la fonction getCurrentUser qui gère tous les cas
    try {
        if (typeof window.getCurrentUser === 'function') {
            const currentUser = window.getCurrentUser();
            if (currentUser && currentUser.username) {
                const playerName = currentUser.username;
                console.log("Nom récupéré depuis getCurrentUser:", playerName);
                // Stocker le nom pour les futures utilisations
                localStorage.setItem('playerName', playerName);
                return playerName;
            }
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du nom du joueur:", error);
    }

    // Fallback si getCurrentUser n'est pas disponible
    try {
        // Vérifier si l'état d'authentification est disponible
        if (window.authState && window.authState.profile) {
            const profile = window.authState.profile;
            if (profile.username || profile.displayName) {
                const playerName = profile.username || profile.displayName;
                console.log("Nom récupéré depuis authState:", playerName);
                // Stocker le nom pour les futures utilisations
                localStorage.setItem('playerName', playerName);
                return playerName;
            }
        }

        // Vérifier si Firebase Auth est disponible directement
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const user = firebase.auth().currentUser;
                if (user && (user.displayName || user.email)) {
                    const playerName = user.displayName || user.email.split('@')[0];
                    console.log("Nom récupéré depuis Firebase Auth direct:", playerName);
                    // Stocker le nom pour les futures utilisations
                    localStorage.setItem('playerName', playerName);
                    return playerName;
                }
            } catch (firebaseError) {
                console.error("Erreur Firebase Auth:", firebaseError);
            }
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du nom du joueur (fallback):", error);
    }

    // Demander le nom à l'utilisateur si aucune méthode ne fonctionne
    try {
        const promptName = prompt("Entrez votre nom pour le classement:", "Joueur");
        if (promptName && promptName.trim() !== "") {
            const filteredName = promptName.trim().substring(0, 20); // Limiter à 20 caractères
            console.log("Nom saisi par l'utilisateur:", filteredName);
            // Stocker le nom pour les futures utilisations
            localStorage.setItem('playerName', filteredName);
            return filteredName;
        }
    } catch (promptError) {
        console.error("Erreur lors de la demande du nom:", promptError);
    }

    // Nom par défaut si aucune méthode ne fonctionne
    const defaultName = 'Joueur ' + Math.floor(Math.random() * 1000);
    console.log("Aucun nom d'utilisateur trouvé, utilisation du nom par défaut:", defaultName);
    // Stocker le nom par défaut pour les futures utilisations
    localStorage.setItem('playerName', defaultName);
    return defaultName;
}

/**
 * Réinitialise le jeu
 */
function resetGame() {
    console.log("Réinitialisation du jeu");

    // Réinitialiser les variables
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

    // Réinitialiser le compteur d'appels
    window.verbChangeCallCount = 0;

    // Réinitialiser le flag de récompense pour high score
    window.highScoreRewardGiven = false;

    // Revenir à l'écran d'accueil
    setGameState('welcome');

    // Effet de réinitialisation
    if (gameEffects) {
        gameEffects.resetEffect();
    }
}

// Écouter l'événement de soumission de score
document.addEventListener('scoreSubmitted', function(event) {
    const { success, playerName, score, isHighScore, offline } = event.detail;

    if (success) {
        // Afficher un message de succès
        const offlineText = offline ? ' (hors ligne)' : '';
        const successMessage = isHighScore
            ? `🏆 Nouveau record${offlineText} ! Score sauvegardé avec succès !`
            : `Score sauvegardé avec succès${offlineText} !`;

        showFeedback(true, successMessage);

        // Récompenser le joueur si c'est un high score
        if (isHighScore && typeof rewardHighScore === 'function') {
            rewardHighScore(score, offline);
        }

        // Réinitialiser le jeu après un délai pour que l'utilisateur voie le message
        setTimeout(() => {
            resetGame();
        }, 3000);
    } else {
        // Afficher un message d'erreur
        showFeedback(false, "Erreur: Le score n'a pas pu être sauvegardé. Veuillez réessayer.");
    }
});

// Initialiser le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', initGame);
