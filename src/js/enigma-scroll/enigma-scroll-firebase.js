/**
 * Gestion de Firebase pour Enigma Scroll
 */
window.EnigmaScrollFirebase = (function() {
    // Vérifier si Firebase est disponible
    if (!window.firebase || !window.firebase.firestore) {
        console.warn("Firebase n'est pas disponible pour Enigma Scroll");
        return {
            isAvailable: false,
            saveScore: function() {
                return Promise.reject(new Error("Firebase n'est pas disponible"));
            },
            getScores: function() {
                return Promise.reject(new Error("Firebase n'est pas disponible"));
            }
        };
    }

    // Référence à Firestore
    const db = firebase.firestore();

    /**
     * Sauvegarde un score dans Firebase
     * @param {number} score - Le score à sauvegarder
     * @param {Object} scoreData - Les données complètes du score
     * @returns {Promise} - Une promesse qui se résout lorsque le score est sauvegardé
     */
    function saveScore(score, scoreData = {}) {
        // Vérifier si nous sommes connectés
        if (!window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
            console.warn("Hors ligne, impossible de sauvegarder le score en ligne");
            return Promise.reject(new Error("Hors ligne"));
        }

        // Vérifier si le score est valide
        if (!score || score <= 0) {
            console.warn("Score invalide, sauvegarde annulée");
            return Promise.reject(new Error("Score invalide"));
        }

        // Récupérer le nom d'utilisateur
        const username = scoreData.username || localStorage.getItem('eq_username') || 'Anonyme';

        // Préparer les données du score
        const data = {
            playerName: username,
            username: username,
            score: score,
            gameId: "enigma-scroll",
            game: "enigma-scroll",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            difficulty: scoreData.difficulty || "intermediate",
            wordsFound: scoreData.wordsFound || 0,
            maxCombo: scoreData.maxCombo || 1,
            totalTime: scoreData.totalTime || 0
        };

        console.log("Sauvegarde du score en ligne:", data);

        // Sauvegarder le score dans Firestore
        return db.collection("game_scores").add(data)
            .then(docRef => {
                console.log("Score sauvegardé avec l'ID:", docRef.id);

                // Marquer le score local comme synchronisé
                try {
                    const localScores = JSON.parse(localStorage.getItem('localScores')) || [];
                    const updatedScores = localScores.map(localScore => {
                        if (localScore.score === score &&
                            localScore.playerName === username &&
                            localScore.gameId === "enigma-scroll" &&
                            localScore.syncStatus === "pending") {
                            return {
                                ...localScore,
                                syncStatus: "synced",
                                docId: docRef.id
                            };
                        }
                        return localScore;
                    });
                    localStorage.setItem('localScores', JSON.stringify(updatedScores));
                } catch (error) {
                    console.warn("Erreur lors de la mise à jour du statut de synchronisation:", error);
                }

                return docRef.id;
            })
            .catch(error => {
                console.error("Erreur lors de la sauvegarde du score:", error);
                throw error;
            });
    }

    /**
     * Récupère les scores depuis Firebase
     * @param {string} timeFrame - Période ('daily', 'weekly', 'alltime')
     * @param {number} limit - Nombre maximum de scores à récupérer
     * @returns {Promise<Array>} - Une promesse qui se résout avec les scores
     */
    function getScores(timeFrame = 'alltime', limit = 10) {
        // Vérifier si nous sommes connectés
        if (!window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
            console.warn("Hors ligne, impossible de récupérer les scores en ligne");
            return Promise.reject(new Error("Hors ligne"));
        }

        console.log(`Récupération des scores pour la période: ${timeFrame}`);

        // Construire la requête
        let query = db.collection("game_scores")
            .where("gameId", "==", "enigma-scroll");

        // Ajouter des filtres en fonction de la période
        if (timeFrame === 'daily') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            query = query.where("timestamp", ">=", yesterday);
        } else if (timeFrame === 'weekly') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            query = query.where("timestamp", ">=", lastWeek);
        }

        // Ne pas utiliser orderBy pour éviter l'erreur d'index
        // Nous trierons les résultats côté client

        // Récupérer plus de résultats pour avoir suffisamment de données à trier
        // Nous limiterons ensuite côté client
        const resultsToFetch = Math.min(100, limit * 5); // Récupérer plus de résultats pour le tri
        query = query.limit(resultsToFetch);

        // Exécuter la requête
        return query.get()
            .then(querySnapshot => {
                const scores = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    scores.push({
                        id: doc.id,
                        playerName: data.playerName || data.username || 'Anonyme',
                        score: data.score || 0,
                        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
                        difficulty: data.difficulty || 'intermediate',
                        wordsFound: data.wordsFound || 0,
                        maxCombo: data.maxCombo || 1
                    });
                });

                // Trier les scores par score décroissant côté client
                scores.sort((a, b) => b.score - a.score);

                // Limiter le nombre de résultats
                const limitedScores = scores.slice(0, limit);

                console.log(`Récupéré ${scores.length} scores, limité à ${limitedScores.length} après tri`);

                return limitedScores;
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des scores:", error);
                throw error;
            });
    }

    /**
     * Importe des scores historiques dans Firebase
     * @param {Array} scores - Liste des scores à importer
     * @returns {Promise} - Une promesse qui se résout lorsque les scores sont importés
     */
    function importHistoricalScores(scores) {
        // Vérifier si nous sommes connectés
        if (!window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
            console.warn("Hors ligne, impossible d'importer les scores historiques");
            return Promise.reject(new Error("Hors ligne"));
        }

        // Vérifier si les scores sont valides
        if (!scores || !Array.isArray(scores) || scores.length === 0) {
            console.warn("Scores invalides, importation annulée");
            return Promise.reject(new Error("Scores invalides"));
        }

        console.log(`Importation de ${scores.length} scores historiques`);

        // Utiliser un lot pour les opérations en masse
        const batch = db.batch();

        // Ajouter chaque score au lot
        scores.forEach(score => {
            const docRef = db.collection("game_scores").doc();
            batch.set(docRef, {
                playerName: score.playerName,
                username: score.playerName,
                score: score.score,
                gameId: "enigma-scroll",
                game: "enigma-scroll",
                timestamp: firebase.firestore.Timestamp.fromDate(
                    typeof score.timestamp === 'string'
                        ? new Date(score.timestamp)
                        : (score.timestamp instanceof Date
                            ? score.timestamp
                            : new Date())
                ),
                difficulty: score.difficulty || "intermediate",
                wordsFound: score.wordsFound || Math.floor(score.score / 10),
                maxCombo: score.maxCombo || Math.floor(Math.random() * 5) + 1,
                isHistorical: true
            });
        });

        // Exécuter le lot
        return batch.commit()
            .then(() => {
                console.log(`${scores.length} scores historiques importés avec succès`);
                return scores.length;
            })
            .catch(error => {
                console.error("Erreur lors de l'importation des scores historiques:", error);
                throw error;
            });
    }

    // API publique
    return {
        isAvailable: true,
        saveScore,
        getScores,
        importHistoricalScores
    };
})();
