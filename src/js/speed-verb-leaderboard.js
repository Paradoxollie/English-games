/**
 * Système de leaderboard dédié pour le jeu Speed Verb Challenge
 * Gère l'affichage et la sauvegarde des scores
 */
const SpeedVerbLeaderboard = {
    // Propriétés
    leaderboardTable: null,
    leaderboardBody: null,
    leaderboardId: null,

    /**
     * Initialise le leaderboard
     * @param {string} tableId - L'ID de la table du leaderboard
     */
    init(tableId) {
        console.log(`Initialisation du leaderboard avec l'ID: ${tableId}`);

        // Vérifier l'état de connexion de l'utilisateur
        try {
            this.getPlayerName();
            console.log("Nom du joueur récupéré pour le leaderboard");

            // Afficher le nom de l'utilisateur dans l'interface
            const playerNameElements = document.querySelectorAll('.player-name');
            playerNameElements.forEach(element => {
                element.textContent = currentUser;
            });
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur pour le leaderboard:", error);
        }

        this.leaderboardId = tableId;
        this.leaderboardTable = document.getElementById(tableId);

        if (!this.leaderboardTable) {
            console.error(`Élément leaderboard avec l'ID ${tableId} non trouvé`);
            return false;
        }

        this.leaderboardBody = this.leaderboardTable.querySelector('tbody');

        if (!this.leaderboardBody) {
            console.error("Corps du tableau de leaderboard non trouvé");
            return false;
        }

        // Vérifier si le leaderboard est déjà initialisé
        if (this.initialized) {
            console.log("Leaderboard déjà initialisé, rechargement des scores");
            this.loadLocalScores(); // Charger les scores locaux par défaut
            return true;
        }

        // Marquer comme initialisé
        this.initialized = true;

        // Configurer les écouteurs d'événements pour la connexion
        this.setupConnectionListeners();

        // Ajouter un écouteur pour les mises à jour de score
        window.addEventListener('scoreUpdated', (event) => {
            console.log("Score mis à jour, rechargement du leaderboard");
            // Toujours charger les scores locaux après une mise à jour
            this.loadLocalScores();
        });

        // Charger les scores locaux par défaut
        console.log("Chargement des scores locaux par défaut");
        this.loadLocalScores();

        // S'assurer que le bouton affiche "Voir les scores en ligne"
        setTimeout(() => {
            const button = document.getElementById('toggle-local-scores');
            if (button) {
                button.classList.add('showing-local');
                const buttonText = button.querySelector('.button-text');
                if (buttonText) {
                    buttonText.textContent = 'Voir les scores en ligne';
                }
            }
        }, 100);

        return true;
    },

    /**
     * Configure les écouteurs d'événements pour la connexion
     */
    setupConnectionListeners() {
        // Écouteur pour la reconnexion
        document.addEventListener('firebaseOnline', () => {
            console.log("Connexion Firebase rétablie, synchronisation des scores");
            this.syncPendingScores();
            this.loadScores();
        });

        // Écouteur pour la déconnexion
        document.addEventListener('firebaseOffline', () => {
            console.log("Connexion Firebase perdue, passage en mode hors ligne");
            this.loadLocalScores();
        });
    },

    /**
     * Charge les scores depuis Firebase ou le stockage local
     */
    loadScores() {
        console.log("Chargement des scores du leaderboard");

        if (!this.leaderboardBody) {
            console.error("Corps du tableau de leaderboard non initialisé");
            return false;
        }

        // Par défaut, charger les scores locaux d'abord
        this.loadLocalScores();

        // Ajouter le bouton pour basculer vers les scores en ligne
        this.addLocalScoresButton();

        // S'assurer que le bouton affiche "Voir les scores en ligne"
        setTimeout(() => {
            const button = document.getElementById('toggle-local-scores');
            if (button) {
                button.classList.add('showing-local');
                const buttonText = button.querySelector('.button-text');
                if (buttonText) {
                    buttonText.textContent = 'Voir les scores en ligne';
                }
            }
        }, 100);

        return true;
    },

    /**
     * Charge les scores en ligne depuis Firebase
     */
    loadOnlineScores() {
        console.log("Chargement des scores en ligne");

        if (!this.leaderboardBody) {
            console.error("Corps du tableau de leaderboard non initialisé");
            return false;
        }

        // Afficher un message de chargement
        this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="loading-scores">Invocation des archives ancestrales...</td></tr>';

        // Vérifier si nous sommes en mode hors ligne
        const isOfflineMode = window.firebaseConnectionState && !window.firebaseConnectionState.isOnline;

        if (isOfflineMode) {
            console.log("Mode hors ligne détecté, chargement des scores locaux");
            this.loadLocalScores();
            return true;
        }

        // Essayer de charger les scores depuis Firebase
        try {
            // Vérifier si Firebase est disponible et connecté
            if (window.firebase && window.firebase.firestore) {
                const db = window.firebase.firestore();

                db.collection("speed_verb_scores")
                    .orderBy("score", "desc")
                    .limit(10)
                    .get()
                    .then((querySnapshot) => {
                        if (querySnapshot.empty) {
                            // Si aucun score en ligne, essayer les scores locaux
                            console.log("Aucun score en ligne, chargement des scores locaux");
                            this.loadLocalScores();
                            return;
                        }

                        let html = '';
                        let rank = 1;
                        let onlineScores = [];

                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'Date inconnue';

                            // Stocker le score pour une fusion potentielle avec les scores locaux
                            onlineScores.push({
                                id: doc.id,
                                playerName: data.playerName || data.name || 'Anonyme',
                                score: data.score,
                                timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
                                offline: false
                            });

                            // Ajouter des classes spéciales pour les 3 premiers
                            let rankClass = '';
                            let medalIcon = '';

                            if (rank === 1) {
                                rankClass = 'rank-gold';
                                medalIcon = '🥇 ';
                            } else if (rank === 2) {
                                rankClass = 'rank-silver';
                                medalIcon = '🥈 ';
                            } else if (rank === 3) {
                                rankClass = 'rank-bronze';
                                medalIcon = '🥉 ';
                            }

                            // Récupérer le nom du joueur actuel pour le mettre en évidence
                            const currentPlayerName = this.getPlayerName();
                            const playerName = data.playerName || data.name || 'Anonyme';
                            const isCurrentPlayer = currentPlayerName && playerName === currentPlayerName;
                            const playerClass = isCurrentPlayer ? 'current-player' : '';

                            html += `
                            <tr class="${rankClass} ${playerClass}">
                                <td class="rank-cell">${rank}</td>
                                <td class="player-cell">${medalIcon}${playerName}${isCurrentPlayer ? ' (vous)' : ''}</td>
                                <td class="score-cell">${data.score}</td>
                                <td class="date-cell">${date}</td>
                            </tr>
                            `;
                            rank++;
                        });

                        // Stocker les scores en ligne dans le localStorage pour une utilisation hors ligne
                        this.storeOnlineScores(onlineScores);

                        // Afficher les scores
                        this.leaderboardBody.innerHTML = html;

                        // Ajouter un bouton pour voir les scores locaux
                        this.addLocalScoresButton();

                        // S'assurer que le bouton affiche "Voir mes scores locaux"
                        setTimeout(() => {
                            const button = document.getElementById('toggle-local-scores');
                            if (button) {
                                button.classList.remove('showing-local');
                                const buttonText = button.querySelector('.button-text');
                                if (buttonText) {
                                    buttonText.textContent = 'Voir mes scores locaux';
                                }
                            }
                        }, 100);
                    })
                    .catch((error) => {
                        console.warn("Erreur lors du chargement des scores en ligne:", error);
                        // En cas d'erreur, charger les scores locaux
                        this.loadLocalScores();
                    });
            } else {
                console.warn("Firebase n'est pas disponible, utilisation des scores locaux");
                this.loadLocalScores();
            }
        } catch (error) {
            console.warn("Erreur lors de l'accès à Firebase:", error);
            this.loadLocalScores();
        }

        return true;
    },

    /**
     * Stocke les scores en ligne dans le localStorage
     * @param {Array} scores - Les scores à stocker
     */
    storeOnlineScores(scores) {
        try {
            localStorage.setItem('onlineScores', JSON.stringify(scores));
        } catch (error) {
            console.warn("Erreur lors du stockage des scores en ligne:", error);
        }
    },

    /**
     * Ajoute un bouton pour voir les scores locaux ou en ligne
     */
    addLocalScoresButton() {
        // Vérifier s'il y a des scores locaux
        const localScores = JSON.parse(localStorage.getItem('localScores')) || [];

        if (localScores.length === 0) {
            return;
        }

        // Vérifier si le bouton existe déjà
        if (document.getElementById('toggle-local-scores')) {
            // Mettre à jour le texte du bouton pour s'assurer qu'il est correct
            const button = document.getElementById('toggle-local-scores');
            const buttonText = button.querySelector('.button-text');

            // Vérifier si nous affichons actuellement les scores locaux
            const isShowingLocalScores = this.isShowingLocalScores();

            if (isShowingLocalScores) {
                buttonText.textContent = 'Voir les scores en ligne';
                button.classList.add('showing-local');
            } else {
                buttonText.textContent = 'Voir mes scores locaux';
                button.classList.remove('showing-local');
            }

            return;
        }

        // Supprimer tous les conteneurs de boutons existants
        const existingContainers = document.querySelectorAll('.local-scores-button-container');
        existingContainers.forEach(container => {
            container.remove();
        });

        // Créer le bouton avec le texte approprié
        // Par défaut, nous affichons les scores locaux au chargement initial
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'local-scores-button-container';
        buttonContainer.innerHTML = `
            <button id="toggle-local-scores" class="game-button secondary-button showing-local">
                <span class="button-text">Voir les scores en ligne</span>
            </button>
        `;

        // Ajouter le bouton après le tableau
        const leaderboardContainer = document.getElementById('speed-verb-leaderboard');
        if (leaderboardContainer) {
            leaderboardContainer.appendChild(buttonContainer);

            // Ajouter l'écouteur d'événement
            document.getElementById('toggle-local-scores').addEventListener('click', () => {
                this.toggleLocalScores();
            });
        }
    },

    /**
     * Bascule entre les scores en ligne et locaux
     */
    toggleLocalScores() {
        const button = document.getElementById('toggle-local-scores');

        if (!button) {
            console.warn("Bouton de scores locaux non trouvé");
            return;
        }

        if (button.classList.contains('showing-local')) {
            // Revenir aux scores en ligne
            console.log("Basculement vers les scores en ligne");
            this.loadOnlineScores();
            button.classList.remove('showing-local');
            button.querySelector('.button-text').textContent = 'Voir mes scores locaux';
        } else {
            // Afficher les scores locaux
            console.log("Basculement vers les scores locaux");
            this.loadLocalScores();
            button.classList.add('showing-local');
            button.querySelector('.button-text').textContent = 'Voir les scores en ligne';
        }
    },

    /**
     * Vérifie si les scores affichés sont les scores locaux
     * @returns {boolean} - Vrai si les scores locaux sont affichés
     */
    isShowingLocalScores() {
        const button = document.getElementById('toggle-local-scores');
        return button && button.classList.contains('showing-local');
    },

    /**
     * Charge les scores depuis le stockage local
     */
    loadLocalScores() {
        console.log("Chargement des scores locaux");

        try {
            // Récupérer les scores locaux
            let localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            // Récupérer les scores en ligne stockés localement
            let onlineScores = JSON.parse(localStorage.getItem('onlineScores')) || [];

            // Vérifier s'il y a un score actuel à ajouter
            const currentScore = this.getCurrentScore();
            if (currentScore) {
                // Vérifier si le score existe déjà
                const scoreExists = localScores.some(score =>
                    score.playerName === currentScore.playerName &&
                    score.score === currentScore.score &&
                    Math.abs(new Date(score.timestamp).getTime() - new Date(currentScore.timestamp).getTime()) < 1000
                );

                if (!scoreExists) {
                    // Ajouter le score actuel aux scores locaux
                    currentScore.offline = true;
                    currentScore.syncStatus = 'pending';
                    localScores.push(currentScore);
                    localStorage.setItem('localScores', JSON.stringify(localScores));
                    console.log("Score actuel ajouté aux scores locaux");
                }
            }

            // Si aucun score local, créer un score de démonstration
            if (localScores.length === 0) {
                const demoScore = {
                    playerName: "Vous",
                    score: 100,
                    level: 1,
                    verbsCompleted: 10,
                    difficulty: "normal",
                    timestamp: new Date().toISOString(),
                    offline: true,
                    syncStatus: 'pending',
                    isDemo: true
                };

                localScores.push(demoScore);
                localStorage.setItem('localScores', JSON.stringify(localScores));
                console.log("Score de démonstration ajouté");
            }

            // Fusionner les scores locaux et en ligne
            let allScores = [...localScores];

            // Ajouter un titre au tableau
            let titleHtml = '<tr class="leaderboard-title-row"><td colspan="4">Mes scores locaux</td></tr>';

            // Trier les scores par ordre décroissant
            allScores.sort((a, b) => b.score - a.score);

            // Limiter à 10 scores
            allScores = allScores.slice(0, 10);

            let html = titleHtml;
            let rank = 1;

            if (allScores.length === 0) {
                html += '<tr><td colspan="4" style="text-align: center;">Aucun score trouvé. Soyez le premier à jouer !</td></tr>';
            } else {
                allScores.forEach(data => {
                    // Convertir la date si nécessaire
                    let dateObj;
                    try {
                        if (typeof data.timestamp === 'string') {
                            dateObj = new Date(data.timestamp);
                        } else if (data.timestamp instanceof Date) {
                            dateObj = data.timestamp;
                        } else {
                            dateObj = new Date();
                        }
                    } catch (e) {
                        dateObj = new Date();
                    }

                    const date = dateObj.toLocaleDateString();

                    // Ajouter des classes spéciales pour les 3 premiers
                    let rankClass = '';
                    let medalIcon = '';

                    if (rank === 1) {
                        rankClass = 'rank-gold';
                        medalIcon = '🥇 ';
                    } else if (rank === 2) {
                        rankClass = 'rank-silver';
                        medalIcon = '🥈 ';
                    } else if (rank === 3) {
                        rankClass = 'rank-bronze';
                        medalIcon = '🥉 ';
                    }

                    // Ajouter une classe pour les scores récents
                    const isRecent = (Date.now() - dateObj.getTime()) < 24 * 60 * 60 * 1000; // Moins de 24h
                    if (isRecent) {
                        rankClass += ' recent-score';
                    }

                    // Ajouter une classe pour le score de démonstration
                    if (data.isDemo) {
                        rankClass += ' demo-score';
                    }

                    // Déterminer le statut de synchronisation
                    let syncStatus = '';
                    if (data.offline) {
                        if (data.syncStatus === 'synced') {
                            syncStatus = '<span class="sync-status synced">✓</span>';
                        } else if (data.syncStatus === 'failed') {
                            syncStatus = '<span class="sync-status failed">✗</span>';
                        } else {
                            syncStatus = '<span class="sync-status pending">⟳</span>';
                        }
                    }

                    // Vérifier si c'est le joueur actuel
                    const currentPlayerName = this.getPlayerName();
                    const playerName = data.playerName || data.name || 'Anonyme';
                    const isCurrentPlayer = currentPlayerName && playerName === currentPlayerName;
                    const playerClass = isCurrentPlayer ? 'current-player' : '';

                    html += `
                    <tr class="${rankClass} ${playerClass}">
                        <td class="rank-cell">${rank}</td>
                        <td class="player-cell">${medalIcon}${playerName}${isCurrentPlayer ? ' (vous)' : ''} ${data.offline ? '<span class="offline-badge">hors ligne</span>' : ''}</td>
                        <td class="score-cell">${data.score}</td>
                        <td class="date-cell">${date} ${isRecent ? '🆕' : ''} ${syncStatus}</td>
                    </tr>
                    `;
                    rank++;
                });
            }

            // Ajouter un message d'information sur le mode hors ligne
            if (window.firebaseConnectionState && !window.firebaseConnectionState.isOnline) {
                // Vérifier si nous sommes en mode hors ligne permanent
                const isPermanentOffline = localStorage.getItem('firebaseOfflineMode') === 'true';

                html += `
                <tr class="offline-info-row ${isPermanentOffline ? 'permanent-offline' : ''}">
                    <td colspan="4">
                        <div class="offline-info">
                            <span class="offline-icon">${isPermanentOffline ? '⚠️' : '🔄'}</span>
                            <span class="offline-text">
                                ${isPermanentOffline
                                    ? 'Mode hors ligne permanent activé. Les scores ne seront pas synchronisés.'
                                    : 'Mode hors ligne temporaire. Les scores seront synchronisés lorsque la connexion sera rétablie.'}
                            </span>
                            ${isPermanentOffline
                                ? '<button id="reset-offline-mode" class="reset-offline-button">Réinitialiser</button>'
                                : ''}
                        </div>
                    </td>
                </tr>
                `;

                // Ajouter un écouteur d'événement pour le bouton de réinitialisation
                setTimeout(() => {
                    const resetButton = document.getElementById('reset-offline-mode');
                    if (resetButton) {
                        resetButton.addEventListener('click', () => {
                            // Réinitialiser le mode hors ligne permanent
                            localStorage.removeItem('firebaseOfflineMode');
                            alert('Mode hors ligne réinitialisé. La page va être rechargée pour appliquer les changements.');
                            // Recharger la page pour réinitialiser Firebase
                            window.location.reload();
                        });
                    }
                }, 100);
            }

            this.leaderboardBody.innerHTML = html;

            // Mettre à jour le bouton existant ou en créer un nouveau si nécessaire
            if (onlineScores.length > 0) {
                let button = document.getElementById('toggle-local-scores');

                if (!button) {
                    // Créer le bouton s'il n'existe pas
                    this.addLocalScoresButton();
                    button = document.getElementById('toggle-local-scores');
                }

                if (button) {
                    button.classList.add('showing-local');
                    button.querySelector('.button-text').textContent = 'Voir les scores en ligne';
                }
            }

        } catch (error) {
            console.error("Erreur lors du chargement des scores locaux:", error);
            this.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Erreur lors du chargement des scores.</td></tr>';
        }
    },

    /**
     * Récupère le score actuel s'il existe
     * @returns {Object|null} Le score actuel ou null
     */
    getCurrentScore() {
        // Vérifier si le score est stocké dans la session
        const scoreStr = sessionStorage.getItem('currentScore');
        if (scoreStr) {
            try {
                const score = JSON.parse(scoreStr);

                // Vérifier si le score est valide
                if (score && typeof score === 'object' && score.score && score.playerName) {
                    console.log("Score actuel trouvé");
                    return score;
                } else {
                    console.warn("Score actuel invalide:", score);
                }
            } catch (e) {
                console.error("Erreur lors de la lecture du score actuel:", e);
            }
        }

        // Si aucun score n'est trouvé dans la session, essayer de récupérer le dernier score local
        try {
            const localScores = JSON.parse(localStorage.getItem('localScores')) || [];
            if (localScores.length > 0) {
                // Trier par date décroissante
                localScores.sort((a, b) => {
                    const dateA = new Date(a.timestamp);
                    const dateB = new Date(b.timestamp);
                    return dateB - dateA;
                });

                // Récupérer le score le plus récent
                const latestScore = localScores[0];
                console.log("Dernier score local utilisé");
                return latestScore;
            }
        } catch (e) {
            console.error("Erreur lors de la lecture des scores locaux:", e);
        }

        // Si aucun score n'est trouvé, créer un score par défaut
        const defaultScore = {
            playerName: "Vous",
            score: 100,
            level: 1,
            verbsCompleted: 10,
            difficulty: "normal",
            timestamp: new Date().toISOString(),
            offline: true,
            syncStatus: 'pending',
            isDefault: true
        };

        console.log("Score par défaut créé");
        return defaultScore;
    },

    /**
     * Sauvegarde un score dans le leaderboard
     * @param {string} playerName - Le nom du joueur
     * @param {number} score - Le score du joueur
     * @param {number} level - Le niveau atteint
     * @param {number} verbsCompleted - Le nombre de verbes complétés
     * @param {string} difficulty - La difficulté choisie
     * @returns {boolean} - Succès ou échec de la sauvegarde
     */
    saveScore(playerName, score, level, verbsCompleted, difficulty) {
        // Si le nom du joueur n'est pas fourni ou est 'Joueur', utiliser la fonction getPlayerName
        if (!playerName || playerName === 'Joueur') {
            playerName = this.getPlayerName();
            console.log("Nom du joueur récupéré via getPlayerName");
        }

        console.log(`Sauvegarde du score: ${score} points`);

        // Créer l'objet score
        const scoreData = {
            playerName: playerName,
            score: score,
            level: level,
            verbsCompleted: verbsCompleted,
            difficulty: difficulty,
            timestamp: new Date().toISOString(),
            offline: false,
            syncStatus: 'pending' // Pour suivre l'état de synchronisation
        };

        // Stocker le score actuel dans la session pour pouvoir l'afficher immédiatement
        sessionStorage.setItem('currentScore', JSON.stringify(scoreData));

        // Vérifier si nous sommes en mode hors ligne
        const isOfflineMode = window.firebaseConnectionState && !window.firebaseConnectionState.isOnline;

        if (isOfflineMode) {
            console.log("Mode hors ligne détecté, sauvegarde locale uniquement");
            scoreData.offline = true;
            this.saveScoreLocally(scoreData);
            return true;
        }

        // Essayer de sauvegarder en ligne
        try {
            // Vérifier si Firebase est disponible
            if (window.firebase && window.firebase.firestore) {
                const db = window.firebase.firestore();

                // Récupérer l'ID utilisateur si disponible
                let userId = null;
                if (window.firebase.auth && window.firebase.auth().currentUser) {
                    userId = window.firebase.auth().currentUser.uid;
                } else if (window.authState && window.authState.profile) {
                    userId = window.authState.profile.uid;
                }

                scoreData.userId = userId;

                // Ajouter le score à la base de données
                db.collection('speed_verb_scores').add({
                    playerName: playerName,
                    userId: userId,
                    score: score,
                    level: level,
                    verbsCompleted: verbsCompleted,
                    difficulty: difficulty,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then((docRef) => {
                    console.log('Score sauvegardé avec succès en ligne !', docRef.id);

                    // Marquer le score comme synchronisé
                    scoreData.syncStatus = 'synced';
                    scoreData.docId = docRef.id;

                    // Stocker également dans le stockage local pour référence
                    this.addToSyncedScores(scoreData);

                    // Recharger le leaderboard
                    this.loadScores();

                    // Vérifier si c'est un high score et déclencher l'événement approprié
                    this.isHighScore(score).then(isHighScore => {
                        if (isHighScore) {
                            console.log("C'est un nouveau record !");

                            // Déclencher l'événement highScoreAchieved pour les récompenses
                            // Mais indiquer que la récompense est déjà gérée par la fonction rewardHighScore
                            const highScoreEvent = new CustomEvent('highScoreAchieved', {
                                detail: {
                                    game: 'speed-verb-challenge',
                                    score: score,
                                    timestamp: new Date(),
                                    offline: false,
                                    rewardAlreadyGiven: true // Indiquer que la récompense est déjà gérée
                                }
                            });
                            document.dispatchEvent(highScoreEvent);
                        }

                        // Déclencher un événement de succès
                        const event = new CustomEvent('scoreSubmitted', {
                            detail: {
                                success: true,
                                playerName: playerName,
                                score: score,
                                isHighScore: isHighScore,
                                offline: false
                            }
                        });
                        document.dispatchEvent(event);
                    });

                    // Synchroniser les scores locaux en attente
                    this.syncPendingScores();
                })
                .catch(error => {
                    console.warn('Erreur lors de la sauvegarde du score en ligne:', error);
                    // Sauvegarder localement en cas d'erreur
                    this.saveScoreLocally(scoreData);
                });

                return true;
            } else {
                console.warn("Firebase n'est pas disponible, sauvegarde locale");
                this.saveScoreLocally(scoreData);
                return true;
            }
        } catch (error) {
            console.warn("Erreur lors de l'accès à Firebase:", error);
            this.saveScoreLocally(scoreData);
            return true;
        }
    },

    /**
     * Ajoute un score à la liste des scores synchronisés
     * @param {Object} scoreData - Les données du score
     */
    addToSyncedScores(scoreData) {
        try {
            // Récupérer les scores synchronisés existants
            let syncedScores = JSON.parse(localStorage.getItem('syncedScores')) || [];

            // Ajouter le nouveau score
            syncedScores.push(scoreData);

            // Limiter à 50 scores
            if (syncedScores.length > 50) {
                syncedScores = syncedScores.slice(0, 50);
            }

            // Sauvegarder
            localStorage.setItem('syncedScores', JSON.stringify(syncedScores));
        } catch (error) {
            console.warn("Erreur lors de l'ajout aux scores synchronisés:", error);
        }
    },

    /**
     * Synchronise les scores en attente lorsque la connexion est rétablie
     */
    syncPendingScores() {
        // Vérifier si nous sommes en ligne
        if (!window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
            console.log("Mode hors ligne, synchronisation reportée");
            return;
        }

        console.log("Tentative de synchronisation des scores en attente");

        try {
            // Récupérer les scores locaux
            let localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            // Filtrer les scores en attente de synchronisation
            // Exclure les scores de démonstration et par défaut
            const pendingScores = localScores.filter(score =>
                score.offline &&
                score.syncStatus !== 'synced' &&
                score.syncStatus !== 'syncing' &&
                !score.isDemo &&
                !score.isDefault
            );

            if (pendingScores.length === 0) {
                console.log("Aucun score en attente de synchronisation");
                return;
            }

            console.log(`${pendingScores.length} scores à synchroniser`);

            // Marquer les scores comme en cours de synchronisation
            localScores = localScores.map(score => {
                if (score.offline &&
                    score.syncStatus !== 'synced' &&
                    score.syncStatus !== 'syncing' &&
                    !score.isDemo &&
                    !score.isDefault) {
                    return { ...score, syncStatus: 'syncing' };
                }
                return score;
            });

            localStorage.setItem('localScores', JSON.stringify(localScores));

            // Ajouter un timeout global pour la synchronisation
            const syncTimeout = setTimeout(() => {
                console.warn("Timeout de synchronisation atteint, certains scores peuvent ne pas avoir été synchronisés");

                // Marquer les scores toujours en cours de synchronisation comme ayant échoué
                this.markTimedOutScores();

                // Recharger les scores pour afficher les statuts mis à jour
                this.loadLocalScores();
            }, 15000);

            // Compteur pour suivre les synchronisations terminées
            let completedSyncs = 0;

            // Synchroniser chaque score avec un délai entre les requêtes pour éviter de surcharger Firebase
            pendingScores.forEach((score, index) => {
                setTimeout(() => {
                    this.syncScore(score)
                        .then(() => {
                            completedSyncs++;
                            if (completedSyncs === pendingScores.length) {
                                clearTimeout(syncTimeout);
                                console.log("Synchronisation des scores terminée");

                                // Recharger les scores pour afficher les statuts mis à jour
                                this.loadLocalScores();

                                // Déclencher un événement pour informer l'application
                                document.dispatchEvent(new CustomEvent('scoresSynced'));
                            }
                        })
                        .catch(error => {
                            console.error("Erreur lors de la synchronisation d'un score:", error);
                            completedSyncs++;
                            if (completedSyncs === pendingScores.length) {
                                clearTimeout(syncTimeout);
                                console.log("Synchronisation des scores terminée avec des erreurs");

                                // Recharger les scores pour afficher les statuts mis à jour
                                this.loadLocalScores();
                            }
                        });
                }, index * 500); // Espacer les requêtes de 500ms
            });
        } catch (error) {
            console.warn("Erreur lors de la synchronisation des scores en attente:", error);

            // Recharger les scores pour afficher les statuts mis à jour
            this.loadLocalScores();
        }
    },

    /**
     * Marque les scores dont la synchronisation a expiré comme ayant échoué
     */
    markTimedOutScores() {
        try {
            // Récupérer les scores locaux
            let localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            // Marquer les scores en cours de synchronisation comme ayant échoué
            let updated = false;
            localScores = localScores.map(score => {
                if (score.syncStatus === 'syncing') {
                    updated = true;
                    return { ...score, syncStatus: 'failed' };
                }
                return score;
            });

            if (updated) {
                localStorage.setItem('localScores', JSON.stringify(localScores));
                console.log("Scores en timeout marqués comme ayant échoué");
            }
        } catch (error) {
            console.warn("Erreur lors du marquage des scores en timeout:", error);
        }
    },

    /**
     * Synchronise un score spécifique avec Firebase
     * @param {Object} scoreData - Les données du score à synchroniser
     * @returns {Promise} - Promesse résolue lorsque la synchronisation est terminée
     */
    syncScore(scoreData) {
        return new Promise((resolve, reject) => {
            if (!window.firebase || !window.firebase.firestore) {
                console.warn("Firebase n'est pas disponible, impossible de synchroniser");
                this.updateSyncedScoreStatus(scoreData, 'failed');
                reject(new Error("Firebase n'est pas disponible"));
                return;
            }

            if (!window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
                console.warn("Mode hors ligne, impossible de synchroniser");
                this.updateSyncedScoreStatus(scoreData, 'pending');
                reject(new Error("Mode hors ligne"));
                return;
            }

            // Vérifier si le score est un score de démonstration ou par défaut
            if (scoreData.isDemo || scoreData.isDefault) {
                console.log("Score de démonstration ou par défaut, pas de synchronisation");
                this.updateSyncedScoreStatus(scoreData, 'synced');
                resolve();
                return;
            }

            const db = window.firebase.firestore();

            // Récupérer l'ID utilisateur si disponible
            let userId = null;
            if (window.firebase.auth && window.firebase.auth().currentUser) {
                userId = window.firebase.auth().currentUser.uid;
            } else if (window.authState && window.authState.profile) {
                userId = window.authState.profile.uid;
            }

            // Préparer les données pour Firebase
            const firestoreData = {
                playerName: scoreData.playerName,
                userId: userId || scoreData.userId,
                score: scoreData.score,
                level: scoreData.level || 1,
                verbsCompleted: scoreData.verbsCompleted || 0,
                difficulty: scoreData.difficulty || 'normal',
                originalTimestamp: scoreData.timestamp,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                wasOffline: true
            };

            // Ajouter un timeout pour cette opération spécifique
            const addPromise = db.collection('speed_verb_scores').add(firestoreData);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Timeout d'ajout de score")), 5000);
            });

            // Utiliser Promise.race pour limiter le temps d'attente
            Promise.race([addPromise, timeoutPromise])
                .then((docRef) => {
                    console.log(`Score synchronisé avec succès: ${scoreData.score} points`);

                    // Mettre à jour le statut du score local
                    this.updateSyncedScoreStatus(scoreData, 'synced', docRef ? docRef.id : null);

                    // Résoudre la promesse
                    resolve();
                })
                .catch(error => {
                    console.warn(`Erreur lors de la synchronisation du score: ${scoreData.score} points`, error);

                    // Marquer comme échec de synchronisation
                    this.updateSyncedScoreStatus(scoreData, 'failed');

                    // Rejeter la promesse
                    reject(error);
                });
        });
    },

    /**
     * Met à jour le statut de synchronisation d'un score local
     * @param {Object} scoreData - Les données du score
     * @param {string} status - Le nouveau statut ('synced', 'failed', etc.)
     * @param {string} docId - L'ID du document Firebase (si disponible)
     */
    updateSyncedScoreStatus(scoreData, status, docId = null) {
        try {
            // Récupérer les scores locaux
            let localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            // Trouver et mettre à jour le score
            let updated = false;
            localScores = localScores.map(score => {
                // Identifier le score par ses propriétés uniques
                // Utiliser une comparaison plus souple pour les timestamps
                const scoreMatch = score.playerName === scoreData.playerName &&
                                  score.score === scoreData.score;

                const timestampMatch = score.timestamp === scoreData.timestamp ||
                                      (score.timestamp && scoreData.timestamp &&
                                       Math.abs(new Date(score.timestamp).getTime() -
                                                new Date(scoreData.timestamp).getTime()) < 1000);

                if (scoreMatch && timestampMatch) {
                    updated = true;
                    return {
                        ...score,
                        syncStatus: status,
                        docId: docId || score.docId,
                        lastSyncAttempt: new Date().toISOString()
                    };
                }
                return score;
            });

            // Sauvegarder les scores mis à jour
            if (updated) {
                localStorage.setItem('localScores', JSON.stringify(localScores));
                console.log(`Statut du score mis à jour: ${status}`);
            } else {
                console.warn("Score non trouvé pour la mise à jour du statut:", scoreData);
            }
        } catch (error) {
            console.warn("Erreur lors de la mise à jour du statut de synchronisation:", error);
        }
    },

    /**
     * Sauvegarde un score localement
     * @param {Object} scoreData - Les données du score
     */
    saveScoreLocally(scoreData) {
        try {
            // Marquer comme hors ligne
            scoreData.offline = true;

            // S'assurer que le statut de synchronisation est défini
            if (!scoreData.syncStatus) {
                scoreData.syncStatus = 'pending';
            }

            // Récupérer les scores existants
            let localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            // Vérifier si le score existe déjà
            const scoreExists = localScores.some(score =>
                score.playerName === scoreData.playerName &&
                score.score === scoreData.score &&
                score.timestamp === scoreData.timestamp
            );

            if (!scoreExists) {
                // Ajouter le nouveau score
                localScores.push(scoreData);

                // Trier par score décroissant
                localScores.sort((a, b) => b.score - a.score);

                // Limiter à 50 scores maximum
                if (localScores.length > 50) {
                    localScores = localScores.slice(0, 50);
                }

                // Sauvegarder
                localStorage.setItem('localScores', JSON.stringify(localScores));

                console.log('Score sauvegardé localement avec succès !');
            } else {
                console.log('Score déjà existant localement, pas de sauvegarde nécessaire');
            }

            // Recharger le leaderboard
            this.loadLocalScores();

            // Vérifier si c'est un high score local
            const isHighScore = this.isLocalHighScore(scoreData.score);

            if (isHighScore) {
                console.log("C'est un nouveau record local !");

                // Déclencher l'événement highScoreAchieved pour les récompenses
                // Mais indiquer que la récompense est déjà gérée par la fonction rewardHighScore
                const highScoreEvent = new CustomEvent('highScoreAchieved', {
                    detail: {
                        game: 'speed-verb-challenge',
                        score: scoreData.score,
                        timestamp: new Date(),
                        offline: true,
                        rewardAlreadyGiven: true // Indiquer que la récompense est déjà gérée
                    }
                });
                document.dispatchEvent(highScoreEvent);
            }

            // Déclencher un événement de succès
            const event = new CustomEvent('scoreSubmitted', {
                detail: {
                    success: true,
                    playerName: scoreData.playerName,
                    score: scoreData.score,
                    isHighScore: isHighScore,
                    offline: true
                }
            });
            document.dispatchEvent(event);

            // Afficher un message de synchronisation
            if (window.firebaseConnectionState && !window.firebaseConnectionState.isOnline) {
                // Créer ou mettre à jour l'indicateur de synchronisation
                this.showSyncIndicator(scoreData.score);
            }

        } catch (error) {
            console.error('Erreur lors de la sauvegarde locale du score:', error);

            // Déclencher un événement d'échec
            const event = new CustomEvent('scoreSubmitted', {
                detail: {
                    success: false,
                    error: error.message,
                    offline: true
                }
            });
            document.dispatchEvent(event);
        }
    },

    /**
     * Affiche un indicateur de synchronisation
     * @param {number} score - Le score qui sera synchronisé
     */
    showSyncIndicator(score) {
        // Vérifier si l'indicateur existe déjà
        let syncIndicator = document.getElementById('sync-indicator');

        if (!syncIndicator) {
            // Créer l'indicateur
            syncIndicator = document.createElement('div');
            syncIndicator.id = 'sync-indicator';
            syncIndicator.className = 'sync-indicator';
            document.body.appendChild(syncIndicator);
        }

        // Mettre à jour le contenu
        syncIndicator.innerHTML = `
            <div class="sync-icon">🔄</div>
            <div class="sync-message">
                <div class="sync-title">Score sauvegardé localement</div>
                <div class="sync-details">Score de ${score} points sera synchronisé lorsque la connexion sera rétablie</div>
            </div>
            <div class="sync-close" onclick="this.parentNode.classList.remove('show')">×</div>
        `;

        // Afficher l'indicateur
        syncIndicator.classList.add('show');

        // Masquer après un délai
        setTimeout(() => {
            if (syncIndicator) {
                syncIndicator.classList.remove('show');
            }
        }, 5000);
    },

    /**
     * Vérifie si un score est un high score local
     * @param {number} score - Le score à vérifier
     * @returns {boolean} - True si c'est un high score local
     */
    isLocalHighScore(score) {
        try {
            // Récupérer les scores locaux
            const localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            // Si moins de 10 scores, c'est automatiquement un high score
            if (localScores.length < 10) {
                return true;
            }

            // Trier par score décroissant
            localScores.sort((a, b) => b.score - a.score);

            // Prendre les 10 premiers
            const top10 = localScores.slice(0, 10);

            // Vérifier si le score est supérieur au score le plus bas du top 10
            const lowestScore = top10[top10.length - 1].score;

            return score > lowestScore;
        } catch (error) {
            console.error('Erreur lors de la vérification du high score local:', error);
            // En cas d'erreur, on suppose que c'est un high score
            return true;
        }
    },

    /**
     * Vérifie si un score est suffisamment élevé pour entrer dans le leaderboard
     * @param {number} score - Le score à vérifier
     * @returns {Promise<boolean>} - Promesse résolue avec un booléen indiquant si le score est suffisamment élevé
     */
    /**
     * Récupère le nom du joueur depuis le profil utilisateur ou le localStorage
     * @returns {string} - Le nom du joueur
     */
    getPlayerName() {
        // Variable pour stocker si c'est le premier appel
        if (this._getPlayerNameCalled === undefined) {
            this._getPlayerNameCalled = true;
        } else {
            // Si ce n'est pas le premier appel, utiliser la valeur en cache si disponible
            if (this._cachedPlayerName) {
                return this._cachedPlayerName;
            }
        }

        // Forcer la vérification de l'utilisateur dans localStorage avant d'utiliser getCurrentUser
        try {
            const userJson = localStorage.getItem('english_quest_current_user');
            if (userJson) {
                const user = JSON.parse(userJson);
                // Afficher uniquement le nom d'utilisateur, pas les données sensibles

                if (user && user.username && user.username !== 'Joueur') {
                    // Stocker en cache pour les appels futurs
                    this._cachedPlayerName = user.username;
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
                    this._cachedPlayerName = currentUser.username;
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
                this._cachedPlayerName = localProfile.username;
                return localProfile.username;
            }
        } catch (e) {
            console.warn("Erreur lors de la récupération du profil local");
        }

        // Vérifier si nous avons un utilisateur connecté avec un profil
        if (window.authState && window.authState.profile && window.authState.profile.username && window.authState.profile.username !== 'Joueur') {
            // Stocker en cache pour les appels futurs
            this._cachedPlayerName = window.authState.profile.username;
            return window.authState.profile.username;
        }

        // Si l'utilisateur est connecté, utiliser son nom d'utilisateur
        if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
            const user = window.firebase.auth().currentUser;
            if (user.displayName) {
                // Stocker en cache pour les appels futurs
                this._cachedPlayerName = user.displayName;
                return user.displayName;
            }
            // Si pas de displayName, utiliser l'email sans le domaine
            if (user.email && user.email !== 'anonymous@example.com') {
                const username = user.email.split('@')[0];
                // Stocker en cache pour les appels futurs
                this._cachedPlayerName = username;
                return username;
            }
        }

        // En dernier recours, utiliser le nom stocké localement ou un nom par défaut
        const storedName = localStorage.getItem('playerName');
        if (storedName && storedName !== 'Joueur') {
            // Stocker en cache pour les appels futurs
            this._cachedPlayerName = storedName;
            return storedName;
        }

        // Stocker en cache pour les appels futurs
        this._cachedPlayerName = 'Joueur';
        return 'Joueur';
    },

    isHighScore(score) {
        return new Promise((resolve, reject) => {
            try {
                // Vérifier si Firebase est disponible
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
                        .catch((error) => {
                            console.warn("Erreur lors de la vérification du high score en ligne:", error);
                            // En cas d'erreur, vérifier le high score local
                            resolve(this.isLocalHighScore(score));
                        });
                } else {
                    console.warn("Firebase n'est pas disponible, vérification du high score local");
                    // Vérifier le high score local
                    resolve(this.isLocalHighScore(score));
                }
            } catch (error) {
                console.warn("Erreur lors de l'accès à Firebase:", error);
                // Vérifier le high score local
                resolve(this.isLocalHighScore(score));
            }
        });
    }
};

// Rendre l'objet disponible globalement
window.SpeedVerbLeaderboard = SpeedVerbLeaderboard;
