/**
 * Système de leaderboard dédié pour le jeu Enigma Scroll
 * Gère l'affichage et la sauvegarde des scores
 */
window.EnigmaScrollLeaderboard = {
    // Propriétés
    leaderboardContent: null,
    leaderboardId: null,
    initialized: false,

    /**
     * Initialise le leaderboard
     * @param {string} contentId - L'ID du conteneur du leaderboard
     */
    init(contentId) {
        console.log(`Initialisation du leaderboard avec l'ID: ${contentId}`);

        // Vérifier l'état de connexion de l'utilisateur
        try {
            this.getPlayerName();
            console.log("Nom du joueur récupéré pour le leaderboard");
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur pour le leaderboard:", error);
        }

        this.leaderboardId = contentId;
        this.leaderboardContent = document.getElementById(contentId);

        if (!this.leaderboardContent) {
            console.error(`Élément leaderboard avec l'ID ${contentId} non trouvé`);
            return false;
        }

        // Vérifier si le leaderboard est déjà initialisé
        if (this.initialized) {
            console.log("Leaderboard déjà initialisé, rechargement des scores");
            this.loadScores(); // Charger les scores
            return true;
        }

        // Marquer comme initialisé
        this.initialized = true;

        // Configurer les écouteurs d'événements pour la connexion
        this.setupConnectionListeners();

        // Ajouter un écouteur pour les mises à jour de score
        window.addEventListener('scoreUpdated', (event) => {
            console.log("Score mis à jour, rechargement du leaderboard");
            this.loadScores();
        });

        // Vérifier si nous devons importer les scores historiques
        this.checkAndImportHistoricalScores();

        // Charger les scores
        console.log("Chargement des scores");
        this.loadScores();

        return true;
    },

    /**
     * Vérifie si les scores historiques ont déjà été importés et les importe si nécessaire
     */
    checkAndImportHistoricalScores() {
        // Vérifier si nous avons déjà importé les scores historiques
        const historicalScoresImported = localStorage.getItem('enigma_scroll_historical_scores_imported');

        if (historicalScoresImported === 'true') {
            console.log("Les scores historiques ont déjà été importés");
            return;
        }

        console.log("Importation des scores historiques...");

        // Récupérer tous les scores possibles de l'ancienne version
        const allScores = this.getAllHistoricalScores();

        if (allScores.length === 0) {
            console.warn("Aucun score historique trouvé dans le localStorage");
            return;
        }

        console.log(`${allScores.length} scores historiques trouvés dans le localStorage`);

        // Vérifier si Firebase est disponible
        if (!window.firebase || !window.firebase.firestore) {
            console.warn("Firebase n'est pas disponible, impossible d'importer les scores historiques");
            return;
        }

        // Vérifier si nous sommes connectés
        if (window.firebaseConnectionState && !window.firebaseConnectionState.isOnline) {
            console.warn("Hors ligne, impossible d'importer les scores historiques");
            return;
        }

        // Utiliser le module Firebase spécifique à Enigma Scroll
        if (window.EnigmaScrollFirebase && window.EnigmaScrollFirebase.isAvailable) {
            // Vérifier d'abord si des scores existent déjà
            window.EnigmaScrollFirebase.getScores('alltime', 1)
                .then(scores => {
                    // Si des scores existent déjà, ne pas importer les scores historiques
                    if (scores && scores.length > 0) {
                        console.log(`${scores.length} scores trouvés dans Firestore, pas besoin d'importer les scores historiques`);
                        localStorage.setItem('enigma_scroll_historical_scores_imported', 'true');
                        return;
                    }

                    console.log("Aucun score trouvé dans Firestore, importation des scores historiques");

                    // Limiter le nombre de scores à importer pour éviter de dépasser les limites de Firebase
                    const scoresToImport = allScores.slice(0, 500); // Limiter à 500 scores maximum

                    // Importer les scores historiques
                    window.EnigmaScrollFirebase.importHistoricalScores(scoresToImport)
                        .then(count => {
                            console.log(`${count} scores historiques importés avec succès`);
                            localStorage.setItem('enigma_scroll_historical_scores_imported', 'true');

                            // Recharger les scores
                            this.loadScores();
                        })
                        .catch(error => {
                            console.error("Erreur lors de l'importation des scores historiques:", error);
                        });
                })
                .catch(error => {
                    console.error("Erreur lors de la vérification des scores existants:", error);
                });
        } else {
            console.warn("Module Firebase pour Enigma Scroll non disponible, impossible d'importer les scores historiques");
        }
    },

    /**
     * Récupère tous les scores historiques possibles depuis le localStorage
     * @returns {Array} - Liste de tous les scores historiques
     */
    getAllHistoricalScores() {
        console.log("Récupération de tous les scores historiques possibles");

        let allScores = [];

        // 1. Essayer de récupérer les scores depuis toutes les clés possibles
        const possibleKeys = [
            'enigma_scroll_scores',
            'enigma_scroll_local_scores',
            'enigmaScrollScores',
            'enigma_scroll_scores_old',
            'enigmaScroll_scores',
            'enigmaScroll_leaderboard',
            'enigma_leaderboard',
            'enigma_scores',
            'eq_enigma_scores',
            'leaderboard_enigma',
            'leaderboard_enigma_scroll',
            'scores_enigma',
            'scores_enigma_scroll'
        ];

        for (const key of possibleKeys) {
            try {
                const scores = JSON.parse(localStorage.getItem(key)) || [];
                if (scores.length > 0) {
                    console.log(`${scores.length} scores trouvés dans la clé ${key}`);

                    // Convertir les scores au format standard
                    const convertedScores = scores.map(score => this.convertScoreToStandardFormat(score, key));

                    // Ajouter les scores à la liste
                    allScores = [...allScores, ...convertedScores];
                }
            } catch (error) {
                console.warn(`Erreur lors de la récupération des scores depuis la clé ${key}:`, error);
            }
        }

        // 2. Parcourir toutes les clés du localStorage à la recherche de scores
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            // Ignorer les clés déjà traitées
            if (possibleKeys.includes(key)) {
                continue;
            }

            // Vérifier si la clé contient des mots-clés liés aux scores ou à Enigma Scroll
            if (key && (
                key.includes('score') ||
                key.includes('enigma') ||
                key.includes('leaderboard') ||
                key.includes('scroll')
            )) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));

                    // Vérifier si les données ressemblent à des scores
                    if (Array.isArray(data) && data.length > 0) {
                        console.log(`Données potentielles de score trouvées dans la clé ${key}: ${data.length} éléments`);

                        // Filtrer les éléments qui ressemblent à des scores
                        const potentialScores = data.filter(item => {
                            return (
                                (typeof item === 'object' && (item.score !== undefined || item.points !== undefined)) ||
                                (Array.isArray(item) && item.length >= 2 && (typeof item[1] === 'number' || !isNaN(parseInt(item[1], 10))))
                            );
                        });

                        if (potentialScores.length > 0) {
                            console.log(`${potentialScores.length} scores potentiels trouvés dans la clé ${key}`);

                            // Convertir les scores au format standard
                            const convertedScores = potentialScores.map(score => this.convertScoreToStandardFormat(score, key));

                            // Ajouter les scores à la liste
                            allScores = [...allScores, ...convertedScores];
                        }
                    }
                } catch (error) {
                    // Ignorer les erreurs de parsing
                }
            }
        }

        // 3. Ajouter les scores historiques par défaut si aucun score n'a été trouvé
        if (allScores.length === 0) {
            console.log("Aucun score historique trouvé, utilisation des scores par défaut");

            // Définir les scores historiques par défaut
            const defaultScores = [
                {
                    playerName: "Yochka",
                    score: 240,
                    timestamp: new Date(2025, 0, 21), // 21/01/2025
                    difficulty: "intermediate"
                },
                {
                    playerName: "Victor VW",
                    score: 230,
                    timestamp: new Date(2024, 10, 27), // 27/11/2024
                    difficulty: "intermediate"
                },
                {
                    playerName: "Yochka",
                    score: 190,
                    timestamp: new Date(2024, 10, 27), // 27/11/2024
                    difficulty: "intermediate"
                }
            ];

            allScores = defaultScores;
        }

        // 4. Supprimer les doublons et trier les scores
        const uniqueScores = this.removeDuplicateScores(allScores);

        console.log(`${uniqueScores.length} scores historiques uniques récupérés`);

        return uniqueScores;
    },

    /**
     * Convertit un score au format standard
     * @param {Object|Array} score - Le score à convertir
     * @param {string} source - La source du score
     * @returns {Object} - Le score au format standard
     */
    convertScoreToStandardFormat(score, source) {
        let playerName, scoreValue, timestamp, difficulty, wordsFound, maxCombo;

        if (typeof score === 'object' && !Array.isArray(score)) {
            // Format objet
            playerName = score.username || score.playerName || score.name || score.user || 'Anonyme';
            scoreValue = score.score || score.points || 0;
            timestamp = score.timestamp || score.date || new Date();
            difficulty = score.difficulty || "intermediate";
            wordsFound = score.wordsFound || Math.floor(scoreValue / 10);
            maxCombo = score.maxCombo || Math.floor(Math.random() * 5) + 1;
        } else if (Array.isArray(score) && score.length >= 2) {
            // Format tableau [nom, score, ...]
            playerName = score[0] || 'Anonyme';
            scoreValue = score[1] || 0;
            timestamp = score[2] || new Date();
            difficulty = score[3] || "intermediate";
            wordsFound = score[4] || Math.floor(scoreValue / 10);
            maxCombo = score[5] || Math.floor(Math.random() * 5) + 1;
        } else {
            // Format inconnu, utiliser des valeurs par défaut
            playerName = 'Anonyme';
            scoreValue = 0;
            timestamp = new Date();
            difficulty = "intermediate";
            wordsFound = 0;
            maxCombo = 1;
        }

        // Convertir le score en nombre
        if (typeof scoreValue !== 'number') {
            scoreValue = parseInt(scoreValue, 10) || 0;
        }

        // Convertir la date en objet Date si nécessaire
        if (typeof timestamp === 'string') {
            try {
                timestamp = new Date(timestamp);
            } catch (error) {
                timestamp = new Date();
            }
        } else if (!(timestamp instanceof Date)) {
            timestamp = new Date();
        }

        return {
            playerName,
            score: scoreValue,
            timestamp,
            difficulty,
            wordsFound,
            maxCombo,
            source
        };
    },

    /**
     * Supprime les scores en double et trie les scores
     * @param {Array} scores - Liste de scores
     * @returns {Array} - Liste de scores sans doublons
     */
    removeDuplicateScores(scores) {
        // Supprimer les scores de test et les scores trop bas
        const filteredScores = scores.filter(score => {
            // Ignorer les scores de test (contenant "test" dans le nom du joueur)
            if (score.playerName &&
                (score.playerName.toLowerCase().includes('test') ||
                 score.playerName.toLowerCase().includes('demo') ||
                 score.playerName === 'Anonyme' ||
                 score.playerName === 'Joueur' ||
                 score.playerName === 'Invité')) {
                return false;
            }

            // Ignorer les scores trop bas (moins de 10 points)
            if (score.score < 10) {
                return false;
            }

            return true;
        });

        // Trier les scores par ordre décroissant
        filteredScores.sort((a, b) => b.score - a.score);

        // Supprimer les doublons (même joueur, même score)
        const uniqueScores = [];
        const seen = new Set();

        for (const score of filteredScores) {
            const key = `${score.playerName}-${score.score}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueScores.push(score);
            }
        }

        return uniqueScores;
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
     * Configure les onglets du leaderboard
     */
    setupLeaderboardTabs() {
        const tabs = document.querySelectorAll('.leaderboard-tab');
        if (!tabs.length) return;

        // Toujours charger les scores "alltime"
        this.loadScores('alltime');
    },

    /**
     * Charge les scores depuis Firebase ou le stockage local
     * @param {string} timeFrame - Période ('daily', 'weekly', 'alltime')
     */
    loadScores(timeFrame = 'alltime') {
        console.log(`Chargement des scores du leaderboard pour la période: ${timeFrame}`);

        if (!this.leaderboardContent) {
            console.error("Conteneur du leaderboard non initialisé");
            return false;
        }

        // Afficher un message de chargement
        this.leaderboardContent.innerHTML = '<div class="leaderboard-loading">Chargement des scores...</div>';

        // Charger d'abord les scores locaux en mémoire pour les avoir disponibles
        this.loadLocalScoresInMemory();

        // Vérifier si nous sommes en mode hors ligne
        const isOfflineMode = window.firebaseConnectionState && !window.firebaseConnectionState.isOnline;

        if (isOfflineMode) {
            console.log("Mode hors ligne détecté, chargement des scores locaux");
            this.loadLocalScores();
            return true;
        }

        // Essayer de charger les scores depuis Firebase
        try {
            // Vérifier si le module Firebase spécifique à Enigma Scroll est disponible
            if (window.EnigmaScrollFirebase && window.EnigmaScrollFirebase.isAvailable) {
                console.log("Utilisation du module Firebase spécifique à Enigma Scroll");

                // Récupérer les scores en ligne
                window.EnigmaScrollFirebase.getScores(timeFrame, 10)
                    .then(scores => {
                        if (!scores || scores.length === 0) {
                            // Si aucun score en ligne, afficher les scores historiques
                            console.log("Aucun score en ligne trouvé, affichage des scores historiques");

                            // Récupérer tous les scores historiques possibles
                            const allHistoricalScores = this.getAllHistoricalScores();

                            // Limiter le nombre de scores à afficher
                            const historicalScores = allHistoricalScores.slice(0, 10);

                            // Créer le tableau HTML
                            let html = `
                                <div class="leaderboard-title">Meilleurs scores en ligne</div>
                                <table class="leaderboard-table">
                                    <thead>
                                        <tr>
                                            <th class="rank-header">Rang</th>
                                            <th class="player-header">Joueur</th>
                                            <th class="score-header">Score</th>
                                            <th class="date-header">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                            `;

                            let rank = 1;

                            historicalScores.forEach(data => {
                                const date = data.timestamp.toLocaleDateString();

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

                                // Vérifier si c'est le joueur actuel
                                const currentPlayerName = this.getPlayerName();
                                const playerName = data.playerName;
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

                            html += `
                                    </tbody>
                                </table>
                            `;

                            // Afficher les scores
                            this.leaderboardContent.innerHTML = html;

                            // Ajouter un bouton pour voir les scores locaux
                            this.addLocalScoresButton();

                            return;
                        }

                        console.log(`${scores.length} scores trouvés dans Firestore`);

                        // Les scores sont déjà triés par ordre décroissant et limités à 10
                        const topScores = scores;

                        console.log(`Top 10 scores: ${topScores.length} scores`);

                        // Stocker les scores en ligne localement
                        this.storeOnlineScores(topScores);

                        // Créer le tableau HTML
                        let html = `
                            <div class="leaderboard-title">Meilleurs scores en ligne</div>
                            <table class="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th class="rank-header">Rang</th>
                                        <th class="player-header">Joueur</th>
                                        <th class="score-header">Score</th>
                                        <th class="date-header">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        let rank = 1;

                        topScores.forEach(data => {
                            const date = data.timestamp.toLocaleDateString();

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

                            // Vérifier si c'est le joueur actuel
                            const currentPlayerName = this.getPlayerName();
                            const playerName = data.playerName;
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

                        html += `
                                </tbody>
                            </table>
                        `;

                        // Afficher les scores
                        this.leaderboardContent.innerHTML = html;

                        // Ajouter un bouton pour voir les scores locaux
                        this.addLocalScoresButton();
                    })
                    .catch(error => {
                        console.error("Erreur lors du chargement des scores:", error);

                        // Vérifier si l'erreur concerne un index manquant
                        if (error.message && error.message.includes("requires an index")) {
                            console.log("Erreur d'index Firebase. Pour de meilleures performances, créez l'index en suivant le lien dans l'erreur ci-dessus.");

                            // Ajouter un message dans le leaderboard pour informer l'administrateur
                            if (this.isAdmin()) {
                                this.leaderboardContent.innerHTML = `
                                    <div class="leaderboard-error">
                                        <p>Pour améliorer les performances, veuillez créer un index dans Firebase.</p>
                                        <p>Consultez la console pour plus d'informations.</p>
                                        <button class="game-button secondary-button" id="load-local-scores">
                                            Voir mes scores locaux
                                        </button>
                                    </div>
                                `;

                                // Ajouter un écouteur d'événement pour le bouton
                                const loadLocalButton = document.getElementById('load-local-scores');
                                if (loadLocalButton) {
                                    loadLocalButton.addEventListener('click', () => {
                                        this.loadLocalScores();
                                    });
                                }

                                return;
                            }
                        }

                        // Charger les scores locaux en cas d'erreur
                        this.loadLocalScores();
                    });
            } else {
                console.warn("Firebase n'est pas disponible, création de scores historiques locaux");
                this.createHistoricalScoresLocally();
            }
        } catch (error) {
            console.warn("Erreur lors de l'accès à Firebase:", error);
            this.createHistoricalScoresLocally();
        }
    },

    /**
     * Crée des scores historiques localement et les affiche
     */
    createHistoricalScoresLocally() {
        console.log("Création de scores historiques localement");

        // Vérifier si nous avons déjà créé les scores historiques localement
        const historicalScoresCreated = localStorage.getItem('enigma_scroll_historical_scores_created');

        // Récupérer tous les scores historiques possibles
        const allHistoricalScores = this.getAllHistoricalScores();

        if (historicalScoresCreated !== 'true') {
            // Sauvegarder les scores historiques dans le localStorage
            try {
                // Récupérer les scores existants
                const existingScores = JSON.parse(localStorage.getItem('localScores')) || [];

                // Convertir les scores historiques au format attendu par localScores
                const formattedScores = allHistoricalScores.map(score => ({
                    playerName: score.playerName,
                    score: score.score,
                    timestamp: typeof score.timestamp === 'string' ? score.timestamp : score.timestamp.toISOString(),
                    difficulty: score.difficulty || "intermediate",
                    wordsFound: score.wordsFound || Math.floor(score.score / 10),
                    maxCombo: score.maxCombo || Math.floor(Math.random() * 5) + 1,
                    gameId: "enigma-scroll",
                    isHistorical: true
                }));

                // Ajouter les scores historiques
                const newScores = [...existingScores, ...formattedScores];

                // Trier les scores
                newScores.sort((a, b) => b.score - a.score);

                // Sauvegarder
                localStorage.setItem('localScores', JSON.stringify(newScores));

                // Marquer comme créés
                localStorage.setItem('enigma_scroll_historical_scores_created', 'true');

                console.log(`${formattedScores.length} scores historiques créés localement avec succès`);
            } catch (error) {
                console.error("Erreur lors de la création des scores historiques localement:", error);
            }
        }

        // Limiter le nombre de scores à afficher
        const topScores = allHistoricalScores.slice(0, 10);

        // Créer le tableau HTML
        let html = `
            <div class="leaderboard-title">Meilleurs scores en ligne</div>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th class="rank-header">Rang</th>
                        <th class="player-header">Joueur</th>
                        <th class="score-header">Score</th>
                        <th class="date-header">Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let rank = 1;

        topScores.forEach(data => {
            // Convertir la date en chaîne lisible
            let dateStr;
            try {
                dateStr = data.timestamp instanceof Date
                    ? data.timestamp.toLocaleDateString()
                    : new Date(data.timestamp).toLocaleDateString();
            } catch (e) {
                dateStr = "Date inconnue";
            }

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

            // Vérifier si c'est le joueur actuel
            const currentPlayerName = this.getPlayerName();
            const playerName = data.playerName;
            const isCurrentPlayer = currentPlayerName && playerName === currentPlayerName;
            const playerClass = isCurrentPlayer ? 'current-player' : '';

            html += `
            <tr class="${rankClass} ${playerClass}">
                <td class="rank-cell">${rank}</td>
                <td class="player-cell">${medalIcon}${playerName}${isCurrentPlayer ? ' (vous)' : ''}</td>
                <td class="score-cell">${data.score}</td>
                <td class="date-cell">${dateStr}</td>
            </tr>
            `;
            rank++;
        });

        html += `
                </tbody>
            </table>
            <div class="local-scores-button-container">
                <button id="toggle-local-scores" class="game-button secondary-button">
                    <span class="button-text">Voir mes scores locaux</span>
                </button>
            </div>
        `;

        // Afficher les scores
        this.leaderboardContent.innerHTML = html;

        // Ajouter un écouteur d'événement pour le bouton
        const toggleButton = document.getElementById('toggle-local-scores');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleLocalScores();
            });
        }

        return true;
    },



    /**
     * Stocke les scores en ligne dans le localStorage
     * @param {Array} scores - Les scores à stocker
     */
    storeOnlineScores(scores) {
        try {
            localStorage.setItem('enigma_scroll_online_scores', JSON.stringify(scores));
        } catch (error) {
            console.warn("Erreur lors du stockage des scores en ligne:", error);
        }
    },

    /**
     * Ajoute un bouton pour voir les scores locaux ou en ligne
     */
    addLocalScoresButton() {
        // Vérifier s'il y a des scores locaux
        const localScores = JSON.parse(localStorage.getItem('enigma_scroll_local_scores')) || [];

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
        // Par défaut, nous affichons les scores en ligne au chargement initial
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'local-scores-button-container';
        buttonContainer.innerHTML = `
            <button id="toggle-local-scores" class="game-button secondary-button">
                <span class="button-text">Voir mes scores locaux</span>
            </button>
        `;

        // Ajouter le bouton après le contenu du leaderboard
        if (this.leaderboardContent) {
            this.leaderboardContent.appendChild(buttonContainer);

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

            // Afficher un message de chargement
            this.leaderboardContent.innerHTML = '<div class="leaderboard-loading">Chargement des scores en ligne...</div>';

            // Essayer de charger les scores depuis Firebase
            try {
                // Vérifier si le module Firebase spécifique à Enigma Scroll est disponible
                if (window.EnigmaScrollFirebase && window.EnigmaScrollFirebase.isAvailable) {
                    console.log("Utilisation du module Firebase spécifique à Enigma Scroll");

                    // Récupérer les scores en ligne
                    window.EnigmaScrollFirebase.getScores('alltime', 10)
                        .then(scores => {
                            if (!scores || scores.length === 0) {
                                // Si aucun score en ligne, afficher les scores historiques
                                console.log("Aucun score en ligne trouvé, affichage des scores historiques");

                                // Récupérer tous les scores historiques possibles
                                const allHistoricalScores = this.getAllHistoricalScores();

                                // Limiter le nombre de scores à afficher
                                const historicalScores = allHistoricalScores.slice(0, 10);

                                // Créer le tableau HTML
                                let html = `
                                    <div class="leaderboard-title">Meilleurs scores en ligne</div>
                                    <table class="leaderboard-table">
                                        <thead>
                                            <tr>
                                                <th class="rank-header">Rang</th>
                                                <th class="player-header">Joueur</th>
                                                <th class="score-header">Score</th>
                                                <th class="date-header">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                `;

                                let rank = 1;

                                historicalScores.forEach(data => {
                                    const date = data.timestamp.toLocaleDateString();

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

                                    // Vérifier si c'est le joueur actuel
                                    const currentPlayerName = this.getPlayerName();
                                    const playerName = data.playerName;
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

                                html += `
                                        </tbody>
                                    </table>
                                    <div class="local-scores-button-container">
                                        <button id="toggle-local-scores" class="game-button secondary-button">
                                            <span class="button-text">Voir mes scores locaux</span>
                                        </button>
                                    </div>
                                `;

                                // Afficher les scores
                                this.leaderboardContent.innerHTML = html;

                                // Ajouter un écouteur d'événement pour le bouton
                                const toggleButton = document.getElementById('toggle-local-scores');
                                if (toggleButton) {
                                    toggleButton.addEventListener('click', () => {
                                        this.toggleLocalScores();
                                    });
                                }

                                return;
                            }

                            console.log(`${scores.length} scores trouvés dans Firestore`);

                            // Les scores sont déjà triés par ordre décroissant et limités à 10
                            const topScores = scores;

                            console.log(`Top 10 scores: ${topScores.length} scores`);

                            // Stocker les scores en ligne localement
                            this.storeOnlineScores(topScores);

                            // Créer le tableau HTML
                            let html = `
                                <div class="leaderboard-title">Meilleurs scores en ligne</div>
                                <table class="leaderboard-table">
                                    <thead>
                                        <tr>
                                            <th class="rank-header">Rang</th>
                                            <th class="player-header">Joueur</th>
                                            <th class="score-header">Score</th>
                                            <th class="date-header">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                            `;

                            let rank = 1;

                            topScores.forEach(data => {
                                const date = data.timestamp.toLocaleDateString();

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

                                // Vérifier si c'est le joueur actuel
                                const currentPlayerName = this.getPlayerName();
                                const playerName = data.playerName;
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

                            html += `
                                    </tbody>
                                </table>
                                <div class="local-scores-button-container">
                                    <button id="toggle-local-scores" class="game-button secondary-button">
                                        <span class="button-text">Voir mes scores locaux</span>
                                    </button>
                                </div>
                            `;

                            // Afficher les scores
                            this.leaderboardContent.innerHTML = html;

                            // Ajouter un écouteur d'événement pour le bouton
                            const toggleButton = document.getElementById('toggle-local-scores');
                            if (toggleButton) {
                                toggleButton.addEventListener('click', () => {
                                    this.toggleLocalScores();
                                });
                            }
                        })
                        .catch(error => {
                            console.error("Erreur lors du chargement des scores:", error);

                            // En cas d'erreur, afficher les scores locaux
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

            // Mettre à jour l'état du bouton
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
     * Charge les scores locaux en mémoire sans les afficher
     * Utile pour préparer les données avant de les afficher
     */
    loadLocalScoresInMemory() {
        console.log("Chargement des scores locaux en mémoire");

        try {
            // Récupérer les scores locaux de différentes sources
            let localScores = [];

            // 1. Essayer de récupérer les scores de la nouvelle version
            const newVersionScores = JSON.parse(localStorage.getItem('localScores')) || [];

            // Filtrer pour ne garder que les scores d'Enigma Scroll
            const filteredNewScores = newVersionScores.filter(score =>
                score.gameId === 'enigma-scroll' ||
                !score.gameId // Pour compatibilité avec les anciens scores
            );

            localScores = [...filteredNewScores];

            // 2. Essayer de récupérer les scores de l'ancienne version
            try {
                const oldVersionScores = JSON.parse(localStorage.getItem('enigma_scroll_local_scores')) || [];
                console.log(`Trouvé ${oldVersionScores.length} scores de l'ancienne version`);

                if (oldVersionScores.length > 0) {
                    // Convertir les scores de l'ancienne version au nouveau format
                    const convertedOldScores = oldVersionScores.map(oldScore => ({
                        playerName: oldScore.username || oldScore.playerName || 'Anonyme',
                        score: oldScore.score || 0,
                        wordsFound: oldScore.wordsFound || 0,
                        maxCombo: oldScore.maxCombo || 1,
                        difficulty: oldScore.difficulty || 'intermediate',
                        timestamp: oldScore.timestamp || new Date().toISOString(),
                        offline: true,
                        syncStatus: 'pending',
                        gameId: 'enigma-scroll'
                    }));

                    // Ajouter les scores convertis à la liste
                    localScores = [...localScores, ...convertedOldScores];
                    console.log(`Total des scores après fusion avec l'ancienne version: ${localScores.length}`);

                    // Sauvegarder ces scores dans le nouveau format pour les futures utilisations
                    this.saveScoresToNewFormat(convertedOldScores);
                }
            } catch (error) {
                console.warn("Erreur lors de la récupération des scores de l'ancienne version:", error);
            }

            // 3. Essayer de récupérer les scores spécifiques à Enigma Scroll
            try {
                const enigmaScores = JSON.parse(localStorage.getItem('enigma_scroll_scores')) || [];
                console.log(`Trouvé ${enigmaScores.length} scores spécifiques à Enigma Scroll`);

                if (enigmaScores.length > 0) {
                    // Convertir les scores spécifiques au nouveau format
                    const convertedEnigmaScores = enigmaScores.map(enigmaScore => ({
                        playerName: enigmaScore.username || enigmaScore.playerName || 'Anonyme',
                        score: enigmaScore.score || 0,
                        wordsFound: enigmaScore.wordsFound || 0,
                        maxCombo: enigmaScore.maxCombo || 1,
                        difficulty: enigmaScore.difficulty || 'intermediate',
                        timestamp: enigmaScore.timestamp || new Date().toISOString(),
                        offline: true,
                        syncStatus: 'pending',
                        gameId: 'enigma-scroll'
                    }));

                    // Ajouter les scores convertis à la liste
                    localScores = [...localScores, ...convertedEnigmaScores];
                    console.log(`Total des scores après fusion avec les scores spécifiques: ${localScores.length}`);

                    // Sauvegarder ces scores dans le nouveau format pour les futures utilisations
                    this.saveScoresToNewFormat(convertedEnigmaScores);
                }
            } catch (error) {
                console.warn("Erreur lors de la récupération des scores spécifiques à Enigma Scroll:", error);
            }

            // 4. Essayer de récupérer les scores de l'ancienne version du site
            try {
                // Essayer différentes clés de stockage qui pourraient contenir des scores
                const oldKeys = [
                    'enigmaScrollScores',
                    'enigma_scroll_scores_old',
                    'enigmaScroll_scores',
                    'enigmaScroll_leaderboard',
                    'enigma_leaderboard',
                    'enigma_scores',
                    'eq_enigma_scores'
                ];

                let oldScoresFound = 0;

                for (const key of oldKeys) {
                    try {
                        const oldScores = JSON.parse(localStorage.getItem(key)) || [];
                        if (oldScores.length > 0) {
                            console.log(`Trouvé ${oldScores.length} scores dans la clé ${key}`);
                            oldScoresFound += oldScores.length;

                            // Convertir les scores au nouveau format
                            const convertedScores = oldScores.map(oldScore => {
                                // Essayer de déterminer le format du score
                                let playerName, score, timestamp;

                                if (typeof oldScore === 'object') {
                                    // Format objet
                                    playerName = oldScore.username || oldScore.playerName || oldScore.name || oldScore.user || 'Anonyme';
                                    score = oldScore.score || oldScore.points || 0;
                                    timestamp = oldScore.timestamp || oldScore.date || new Date().toISOString();
                                } else if (Array.isArray(oldScore) && oldScore.length >= 2) {
                                    // Format tableau [nom, score, ...]
                                    playerName = oldScore[0] || 'Anonyme';
                                    score = oldScore[1] || 0;
                                    timestamp = oldScore[2] || new Date().toISOString();
                                } else {
                                    // Format inconnu, utiliser des valeurs par défaut
                                    playerName = 'Anonyme';
                                    score = 0;
                                    timestamp = new Date().toISOString();
                                }

                                return {
                                    playerName,
                                    score: typeof score === 'number' ? score : parseInt(score, 10) || 0,
                                    wordsFound: 0,
                                    maxCombo: 1,
                                    difficulty: 'intermediate',
                                    timestamp: timestamp,
                                    offline: true,
                                    syncStatus: 'pending',
                                    gameId: 'enigma-scroll',
                                    source: key
                                };
                            });

                            // Ajouter les scores convertis à la liste
                            localScores = [...localScores, ...convertedScores];

                            // Sauvegarder ces scores dans le nouveau format
                            this.saveScoresToNewFormat(convertedScores);
                        }
                    } catch (e) {
                        console.warn(`Erreur lors de la récupération des scores depuis la clé ${key}:`, e);
                    }
                }

                console.log(`Total des scores trouvés dans les anciennes clés: ${oldScoresFound}`);
                console.log(`Total des scores après fusion avec toutes les sources: ${localScores.length}`);
            } catch (error) {
                console.warn("Erreur lors de la récupération des scores de l'ancienne version du site:", error);
            }

            // 5. Essayer de récupérer les scores depuis les données brutes du localStorage
            try {
                // Parcourir toutes les clés du localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);

                    // Ignorer les clés déjà traitées
                    if (key === 'localScores' ||
                        key === 'enigma_scroll_local_scores' ||
                        key === 'enigma_scroll_scores' ||
                        key === 'enigma_scroll_online_scores') {
                        continue;
                    }

                    // Vérifier si la clé contient des mots-clés liés aux scores
                    if (key && (key.includes('score') || key.includes('enigma') || key.includes('leaderboard'))) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key));

                            // Vérifier si les données ressemblent à des scores
                            if (Array.isArray(data) && data.length > 0) {
                                console.log(`Trouvé des données potentielles de score dans la clé ${key}: ${data.length} éléments`);

                                // Essayer de convertir les données en scores
                                const potentialScores = data.filter(item => {
                                    return (
                                        (typeof item === 'object' && (item.score !== undefined || item.points !== undefined)) ||
                                        (Array.isArray(item) && item.length >= 2 && (typeof item[1] === 'number' || !isNaN(parseInt(item[1], 10))))
                                    );
                                });

                                if (potentialScores.length > 0) {
                                    console.log(`${potentialScores.length} scores potentiels trouvés dans la clé ${key}`);

                                    // Convertir les scores au nouveau format
                                    const convertedScores = potentialScores.map(item => {
                                        let playerName, score, timestamp;

                                        if (typeof item === 'object') {
                                            playerName = item.username || item.playerName || item.name || item.user || 'Anonyme';
                                            score = item.score || item.points || 0;
                                            timestamp = item.timestamp || item.date || new Date().toISOString();
                                        } else if (Array.isArray(item) && item.length >= 2) {
                                            playerName = item[0] || 'Anonyme';
                                            score = item[1] || 0;
                                            timestamp = item[2] || new Date().toISOString();
                                        } else {
                                            playerName = 'Anonyme';
                                            score = 0;
                                            timestamp = new Date().toISOString();
                                        }

                                        return {
                                            playerName,
                                            score: typeof score === 'number' ? score : parseInt(score, 10) || 0,
                                            wordsFound: 0,
                                            maxCombo: 1,
                                            difficulty: 'intermediate',
                                            timestamp: timestamp,
                                            offline: true,
                                            syncStatus: 'pending',
                                            gameId: 'enigma-scroll',
                                            source: key
                                        };
                                    });

                                    // Ajouter les scores convertis à la liste
                                    localScores = [...localScores, ...convertedScores];

                                    // Sauvegarder ces scores dans le nouveau format
                                    this.saveScoresToNewFormat(convertedScores);
                                }
                            }
                        } catch (e) {
                            // Ignorer les erreurs de parsing
                        }
                    }
                }
            } catch (error) {
                console.warn("Erreur lors de la recherche de scores dans le localStorage:", error);
            }

            // Filtrer les scores de test et les scores trop bas
            const filteredScores = localScores.filter(score => {
                // Ignorer les scores de test (contenant "test" dans le nom du joueur)
                if (score.playerName &&
                    (score.playerName.toLowerCase().includes('test') ||
                     score.playerName.toLowerCase().includes('demo') ||
                     score.playerName === 'Anonyme' ||
                     score.playerName === 'Joueur' ||
                     score.playerName === 'Invité')) {
                    return false;
                }

                // Ignorer les scores trop bas (moins de 10 points)
                if (score.score < 10) {
                    return false;
                }

                return true;
            });

            console.log(`${filteredScores.length} scores après filtrage des scores de test et trop bas`);

            // Trier les scores par ordre décroissant
            filteredScores.sort((a, b) => b.score - a.score);

            // Supprimer les doublons (même joueur, même score, même date)
            const uniqueScores = [];
            const seen = new Set();

            for (const score of filteredScores) {
                const key = `${score.playerName}-${score.score}-${score.timestamp}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueScores.push(score);
                }
            }

            console.log(`${uniqueScores.length} scores uniques après suppression des doublons`);

            // Stocker les scores en mémoire pour une utilisation ultérieure
            this.localScores = uniqueScores;

            return uniqueScores;
        } catch (error) {
            console.error("Erreur lors du chargement des scores locaux en mémoire:", error);
            return [];
        }
    },

    /**
     * Sauvegarde les scores dans le nouveau format
     * @param {Array} scores - Les scores à sauvegarder
     */
    saveScoresToNewFormat(scores) {
        try {
            // Récupérer les scores existants
            const existingScores = JSON.parse(localStorage.getItem('localScores')) || [];

            // Ajouter les nouveaux scores
            const newScores = [...existingScores, ...scores];

            // Trier les scores
            newScores.sort((a, b) => b.score - a.score);

            // Limiter à 50 scores
            const limitedScores = newScores.slice(0, 50);

            // Sauvegarder
            localStorage.setItem('localScores', JSON.stringify(limitedScores));
            console.log(`${scores.length} scores sauvegardés dans le nouveau format`);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des scores dans le nouveau format:", error);
        }
    },

    /**
     * Affiche les scores locaux chargés en mémoire
     */
    displayLocalScores() {
        console.log("Affichage des scores locaux");

        // Si les scores n'ont pas été chargés en mémoire, les charger maintenant
        if (!this.localScores) {
            this.loadLocalScoresInMemory();
        }

        const localScores = this.localScores || [];

        // Limiter à 10 scores
        const displayScores = localScores.slice(0, 10);

        // Créer le tableau HTML
        let html = `
            <div class="leaderboard-title">Mes scores locaux</div>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th class="rank-header">Rang</th>
                        <th class="player-header">Joueur</th>
                        <th class="score-header">Score</th>
                        <th class="date-header">Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let rank = 1;

        if (displayScores.length === 0) {
            html += '<tr><td colspan="4" style="text-align: center;">Aucun score trouvé. Soyez le premier à jouer !</td></tr>';
        } else {
            displayScores.forEach(data => {
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

                // Vérifier si c'est le joueur actuel
                const currentPlayerName = this.getPlayerName();
                const playerName = data.playerName || data.username || 'Anonyme';
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
        }

        html += `
                </tbody>
            </table>
            <div class="local-scores-button-container">
                <button id="toggle-local-scores" class="game-button secondary-button showing-local">
                    <span class="button-text">Voir les scores en ligne</span>
                </button>
            </div>
        `;

        // Afficher les scores
        this.leaderboardContent.innerHTML = html;

        // Ajouter un écouteur d'événement pour le bouton
        const toggleButton = document.getElementById('toggle-local-scores');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleLocalScores();
            });
        }
    },

    /**
     * Charge les scores depuis le stockage local et les affiche
     */
    loadLocalScores() {
        console.log("Chargement et affichage des scores locaux");

        // Charger les scores locaux en mémoire si ce n'est pas déjà fait
        if (!this.localScores) {
            this.loadLocalScoresInMemory();
        }

        // Afficher les scores locaux
        this.displayLocalScores();
    },



    /**
     * Récupère le score actuel
     * @returns {Object|null} - Le score actuel ou null
     */
    getCurrentScore() {
        // Vérifier si le score est disponible dans l'état du jeu
        if (window.gameState && window.gameState.score) {
            return {
                username: this.getPlayerName(),
                score: window.gameState.score,
                wordsFound: window.gameState.wordsFound || 0,
                maxCombo: window.gameState.maxCombo || 1,
                difficulty: window.gameState.difficulty || 'intermediate',
                timestamp: new Date().toISOString()
            };
        }
        return null;
    },

    /**
     * Vérifie si l'utilisateur actuel est administrateur
     * @returns {boolean} - Vrai si l'utilisateur est administrateur
     */
    isAdmin() {
        try {
            // Vérifier si l'utilisateur est "Ollie" (administrateur)
            const username = this.getPlayerName();
            return username === "Ollie";
        } catch (error) {
            console.warn("Erreur lors de la vérification du statut d'administrateur:", error);
            return false;
        }
    },

    /**
     * Récupère le nom du joueur actuel
     * @returns {string} - Le nom du joueur ou "Anonyme"
     */
    getPlayerName() {
        try {
            // Essayer de récupérer depuis le gameState
            if (window.gameState && window.gameState.username) {
                return window.gameState.username;
            }

            // Essayer de récupérer le nom d'utilisateur depuis localStorage
            const userJson = localStorage.getItem('english_quest_current_user');
            if (userJson) {
                const user = JSON.parse(userJson);
                if (user && user.username) {
                    return user.username;
                }
            }

            // Essayer de récupérer depuis localStorage simple
            const storedUsername = localStorage.getItem('eq_username');
            if (storedUsername) {
                return storedUsername;
            }

            // Essayer de récupérer le nom d'utilisateur depuis Firebase
            if (window.firebase && window.firebase.auth) {
                const user = window.firebase.auth().currentUser;
                if (user) {
                    return user.displayName || 'Joueur';
                }
            }
        } catch (error) {
            console.warn("Erreur lors de la récupération du nom du joueur:", error);
        }
        return 'Anonyme';
    },

    /**
     * Synchronise les scores en attente avec Firebase
     */
    syncPendingScores() {
        console.log("Synchronisation des scores en attente");

        // Vérifier si Firebase est disponible et connecté
        if (!window.firebase || !window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
            console.log("Firebase non disponible ou hors ligne, impossible de synchroniser les scores");
            return;
        }

        // Récupérer les scores locaux
        const localScores = JSON.parse(localStorage.getItem('enigma_scroll_local_scores')) || [];
        const pendingScores = localScores.filter(score => score.offline && score.syncStatus === 'pending' && !score.isDemo);

        if (pendingScores.length === 0) {
            console.log("Aucun score en attente à synchroniser");
            return;
        }

        console.log(`${pendingScores.length} scores en attente à synchroniser`);

        // Synchroniser chaque score
        pendingScores.forEach(score => {
            this.saveScoreToFirebase(score)
                .then(() => {
                    // Mettre à jour le statut du score
                    const index = localScores.findIndex(s =>
                        s.username === score.username &&
                        s.score === score.score &&
                        s.timestamp === score.timestamp
                    );

                    if (index !== -1) {
                        localScores[index].syncStatus = 'synced';
                        localStorage.setItem('enigma_scroll_local_scores', JSON.stringify(localScores));
                        console.log(`Score ${score.score} synchronisé avec succès`);
                    }
                })
                .catch(error => {
                    console.error(`Erreur lors de la synchronisation du score ${score.score}:`, error);
                    // Marquer le score comme ayant échoué
                    const index = localScores.findIndex(s =>
                        s.username === score.username &&
                        s.score === score.score &&
                        s.timestamp === score.timestamp
                    );

                    if (index !== -1) {
                        localScores[index].syncStatus = 'failed';
                        localStorage.setItem('enigma_scroll_local_scores', JSON.stringify(localScores));
                    }
                });
        });
    },

    /**
     * Sauvegarde un score dans Firebase
     * @param {Object} score - Le score à sauvegarder
     * @returns {Promise} - Promesse résolue lorsque le score est sauvegardé
     */
    saveScoreToFirebase(score) {
        return new Promise((resolve, reject) => {
            try {
                // Vérifier si Firebase est disponible et connecté
                if (!window.firebase || !window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
                    return reject(new Error("Firebase non disponible ou hors ligne"));
                }

                // Vérifier si l'utilisateur est connecté
                const auth = window.firebase.auth();
                if (!auth || !auth.currentUser) {
                    return reject(new Error("Utilisateur non connecté"));
                }

                // Récupérer les informations de l'utilisateur
                const userId = auth.currentUser.uid;
                const username = auth.currentUser.displayName || score.username || "Joueur";

                // Préparer les données du score
                const scoreData = {
                    userId,
                    username,
                    playerName: username, // Pour compatibilité avec Speed Verb Challenge
                    gameId: 'enigma-scroll',
                    game: 'enigma-scroll',
                    score: score.score,
                    difficulty: score.difficulty || 'intermediate',
                    wordsFound: score.wordsFound || 0,
                    maxCombo: score.maxCombo || 1,
                    timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
                };

                // Sauvegarder dans Firestore - utiliser la même collection que Speed Verb Challenge
                window.firebase.firestore().collection('game_scores').add(scoreData)
                    .then((docRef) => {
                        console.log("Score sauvegardé dans Firebase avec ID:", docRef.id);

                        // Déclencher un événement pour mettre à jour le leaderboard
                        window.dispatchEvent(new CustomEvent('scoreUpdated', {
                            detail: { score: score.score }
                        }));

                        resolve();
                    })
                    .catch(error => {
                        console.error("Erreur lors de la sauvegarde du score:", error);
                        reject(error);
                    });
            } catch (error) {
                console.error("Erreur lors de la sauvegarde du score:", error);
                reject(error);
            }
        });
    }
};

// Initialiser le leaderboard au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // L'initialisation est maintenant gérée par enigma-scroll.js
    console.log('Leaderboard prêt à être initialisé');
});
