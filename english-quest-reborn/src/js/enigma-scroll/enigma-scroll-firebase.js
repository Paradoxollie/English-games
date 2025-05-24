/**
 * Gestion de Firebase pour Enigma Scroll
 * Adapté pour utiliser firebaseServiceInstance comme Speed Verb Challenge
 */
window.EnigmaScrollFirebase = (function() {
    console.log("EnigmaScrollFirebase initialisé - vérification de firebaseServiceInstance à l'utilisation");

    // Fonction pour vérifier dynamiquement la disponibilité
    function checkFirebaseAvailability() {
        return window.firebaseServiceInstance && window.firebaseServiceInstance.db;
    }

    /**
     * Récupère les informations du joueur actuel
     */
    async function getPlayerInfo() {
        const authState = window.authService?.getAuthState();
        if (authState?.isAuthenticated && authState.profile) {
            return { 
                userId: authState.profile.userId, 
                playerName: authState.profile.username || 'Joueur Anonyme' 
            };
        }
        return { userId: null, playerName: 'Joueur Anonyme' };
    }

    /**
     * Sauvegarde un score dans Firebase
     * @param {number} score - Le score à sauvegarder
     * @param {Object} gameData - Les données complètes du jeu
     * @returns {Promise} - Une promesse qui se résout lorsque le score est sauvegardé
     */
    async function saveScore(score, gameData = {}) {
        if (!checkFirebaseAvailability()) {
            console.warn("[ESF] firebaseServiceInstance n'est pas disponible");
            throw new Error("Service Firebase non disponible");
        }

        const playerInfo = await getPlayerInfo();

        if (!playerInfo.userId) {
            console.warn("[ESF] User not authenticated, cannot save score to server.");
            alert("Vous devez être connecté pour sauvegarder votre score en ligne.");
            return false; 
        }

        // Vérifier si le score est valide
        if (!score || score <= 0) {
            console.warn("Score invalide, sauvegarde annulée");
            return Promise.reject(new Error("Score invalide"));
        }

        const scoreData = {
            userId: playerInfo.userId,
            playerName: playerInfo.playerName,
            gameId: 'enigma-scroll',
            score: score,
            difficulty: gameData.difficulty || 'intermediate',
            wordsFound: gameData.wordsFound || 0,
            maxCombo: gameData.maxCombo || 1,
            totalTime: gameData.totalTime || 0,
            timestamp: new Date()
        };

        console.log("Sauvegarde du score Enigma Scroll:", scoreData);

        try {
            // Utiliser firebaseServiceInstance.addScore comme Speed Verb Challenge
            await window.firebaseServiceInstance.addScore(scoreData);
            console.log("[ESF] Score submission successful for user:", playerInfo.playerName, scoreData);
            
            // Dispatch event similaire à Speed Verb Challenge
            document.dispatchEvent(new CustomEvent('scoreSubmitted', {
                detail: { success: true, playerName: playerInfo.playerName, score: score, isHighScore: false, offline: false }
            }));
            return true;
        } catch (error) {
            console.error("[ESF] Error saving score via firebaseServiceInstance:", error);
            // Dispatch event avec erreur
            document.dispatchEvent(new CustomEvent('scoreSubmitted', {
                detail: { success: false, error: error.message, offline: !(window.navigator.onLine) }
            }));
            return false;
        }
    }

    /**
     * Récupère les meilleurs scores depuis Firebase
     * @param {string} timeFrame - Période ('daily', 'weekly', 'alltime')
     * @param {string} difficulty - Difficulté ('easy', 'intermediate', 'hard')
     * @param {number} limit - Nombre maximum de scores à récupérer
     * @returns {Promise<Array>} - Une promesse qui se résout avec les scores
     */
    async function getTopScores(timeFrame = 'alltime', difficulty = null, limit = 10) {
        if (!checkFirebaseAvailability()) {
            console.warn("[ESF] firebaseServiceInstance n'est pas disponible pour getTopScores");
            throw new Error("Service Firebase non disponible");
        }

        try {
            console.log(`Récupération des scores Enigma Scroll pour la période: ${timeFrame}, difficulté: ${difficulty}`);

            // Simplifier la requête pour éviter les problèmes d'index composé Firebase
            // On récupère plus de scores et on filtre côté client
            const fetchLimit = Math.max(50, limit * 3); // Récupérer plus pour compenser le filtrage
            
            let query = window.firebaseServiceInstance.db.collection('game_scores')
                .where('gameId', '==', 'enigma-scroll')
                .orderBy('score', 'desc')
                .limit(fetchLimit);

            const querySnapshot = await query.get();
            let scores = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();
                scores.push({
                    id: doc.id,
                    userId: data.userId,
                    username: data.playerName || 'Anonyme',
                    score: data.score || 0,
                    timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : new Date(),
                    difficulty: data.difficulty || 'intermediate',
                    wordsFound: data.wordsFound || 0,
                    maxCombo: data.maxCombo || 1
                });
            });

            // Client-side filtering for timeframe
            if (timeFrame !== 'alltime') {
                const now = new Date();
                let startDate;
                if (timeFrame === 'daily') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                } else if (timeFrame === 'weekly') {
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
                }
                if (startDate) {
                    scores = scores.filter(score => score.timestamp >= startDate);
                }
            }

            // Client-side filtering for difficulty
            if (difficulty && difficulty !== 'all') {
                scores = scores.filter(score => score.difficulty === difficulty);
            }

            // Re-trier par score décroissant et limiter au nombre demandé
            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, limit);

            console.log(`Récupéré ${scores.length} scores Enigma Scroll`);
            return scores;

        } catch (error) {
            console.error("Erreur lors de la récupération des scores Enigma Scroll:", error);
            throw error;
        }
    }

    /**
     * Importe des scores historiques depuis l'ancienne version
     * @param {Array} scores - Liste des scores à importer
     * @returns {Promise} - Une promesse qui se résout lorsque les scores sont importés
     */
    async function importHistoricalScores(scores) {
        if (!checkFirebaseAvailability()) {
            console.warn("[ESF] firebaseServiceInstance n'est pas disponible pour importHistoricalScores");
            throw new Error("Service Firebase non disponible");
        }

        const playerInfo = await getPlayerInfo();

        if (!playerInfo.userId) {
            console.warn("Utilisateur non connecté, impossible d'importer les scores historiques");
            return Promise.reject(new Error("Utilisateur non connecté"));
        }

        if (!scores || !Array.isArray(scores) || scores.length === 0) {
            console.warn("Scores invalides, importation annulée");
            return Promise.reject(new Error("Scores invalides"));
        }

        console.log(`Importation de ${scores.length} scores historiques Enigma Scroll`);

        try {
            // Traiter les scores un par un pour éviter les problèmes de batch
            for (const score of scores) {
                const scoreData = {
                    userId: playerInfo.userId,
                    playerName: score.playerName || score.username || playerInfo.playerName,
                    gameId: 'enigma-scroll',
                    score: score.score,
                    difficulty: score.difficulty || 'intermediate',
                    wordsFound: score.wordsFound || 0,
                    maxCombo: score.maxCombo || 1,
                    totalTime: score.totalTime || 0,
                    timestamp: score.timestamp ? new Date(score.timestamp) : new Date()
                };

                await window.firebaseServiceInstance.addScore(scoreData);
            }

            console.log("Importation des scores historiques Enigma Scroll terminée");
            return true;
        } catch (error) {
            console.error("Erreur lors de l'importation des scores historiques:", error);
            throw error;
        }
    }

    // Interface publique
    return {
        get isAvailable() {
            return checkFirebaseAvailability();
        },
        saveScore: saveScore,
        getTopScores: getTopScores,
        importHistoricalScores: importHistoricalScores
    };
})();

console.log("EnigmaScrollFirebase chargé avec firebaseServiceInstance");
