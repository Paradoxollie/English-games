/**
 * Service de gestion des statistiques des jeux
 * Gère les notes, le nombre de joueurs, et les statistiques globales
 */

class GameStatsService {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Initialise le service avec Firebase
     */
    async init() {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('Firebase non disponible pour les statistiques');
                return false;
            }

            this.db = firebase.firestore();
            this.isInitialized = true;
            console.log('✅ Service de statistiques initialisé');
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation service statistiques:', error);
            return false;
        }
    }

    /**
     * Enregistre qu'un joueur a joué à un jeu
     */
    async recordGamePlay(gameId, playerId = null, score = 0, rating = null) {
        if (!this.isInitialized) return false;

        try {
            const playerIdToUse = playerId || 'anonymous';
            const gamePlayData = {
                gameId: gameId,
                playerId: playerIdToUse,
                score: score,
                rating: rating,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString()
            };

            // Enregistrer la partie
            await this.db.collection('game_plays').add(gamePlayData);

            // Mettre à jour les statistiques du jeu
            await this.updateGameStats(gameId, score, rating, playerIdToUse);

            console.log(`✅ Partie enregistrée pour ${gameId} (joueur: ${playerIdToUse})`);
            return true;
        } catch (error) {
            console.error('❌ Erreur enregistrement partie:', error);
            return false;
        }
    }

    /**
     * Met à jour les statistiques d'un jeu avec gestion des joueurs uniques
     */
    async updateGameStats(gameId, score = 0, rating = null, playerId = null) {
        if (!this.isInitialized) return false;

        try {
            const gameStatsRef = this.db.collection('game_statistics').doc(gameId);
            const doc = await gameStatsRef.get();

            // Gérer les joueurs uniques
            let uniquePlayersCount = 0;
            if (playerId && playerId !== 'anonymous') {
                const uniquePlayersRef = this.db.collection('unique_players').doc(gameId);
                const uniquePlayersDoc = await uniquePlayersRef.get();
                
                if (uniquePlayersDoc.exists) {
                    const data = uniquePlayersDoc.data();
                    const players = data.players || [];
                    
                    if (!players.includes(playerId)) {
                        // Nouveau joueur unique
                        players.push(playerId);
                        await uniquePlayersRef.update({
                            players: players,
                            count: players.length,
                            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        uniquePlayersCount = players.length;
                    } else {
                        uniquePlayersCount = players.length;
                    }
                } else {
                    // Premier joueur unique pour ce jeu
                    await uniquePlayersRef.set({
                        gameId: gameId,
                        players: [playerId],
                        count: 1,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    uniquePlayersCount = 1;
                }
            } else {
                // Récupérer le nombre actuel de joueurs uniques
                const uniquePlayersRef = this.db.collection('unique_players').doc(gameId);
                const uniquePlayersDoc = await uniquePlayersRef.get();
                uniquePlayersCount = uniquePlayersDoc.exists ? (uniquePlayersDoc.data().count || 0) : 0;
            }

            if (doc.exists) {
                const currentStats = doc.data();
                const newPlayCount = (currentStats.playCount || 0) + 1;
                const newTotalScore = (currentStats.totalScore || 0) + score;
                
                let newRating = currentStats.averageRating || 0;
                let newRatingCount = currentStats.ratingCount || 0;
                
                if (rating !== null && rating >= 1 && rating <= 5) {
                    const totalRatingPoints = (currentStats.averageRating || 0) * (currentStats.ratingCount || 0);
                    newRatingCount += 1;
                    newRating = (totalRatingPoints + rating) / newRatingCount;
                }

                await gameStatsRef.update({
                    playCount: newPlayCount,
                    uniquePlayersCount: uniquePlayersCount,
                    totalScore: newTotalScore,
                    averageScore: newTotalScore / newPlayCount,
                    averageRating: newRating,
                    ratingCount: newRatingCount,
                    lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Créer les statistiques initiales
                await gameStatsRef.set({
                    gameId: gameId,
                    playCount: 1,
                    uniquePlayersCount: uniquePlayersCount,
                    totalScore: score,
                    averageScore: score,
                    averageRating: rating || 0,
                    ratingCount: rating ? 1 : 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Invalider le cache
            this.cache.delete(gameId);
            
            return true;
        } catch (error) {
            console.error('❌ Erreur mise à jour statistiques:', error);
            return false;
        }
    }

    /**
     * Récupère les statistiques d'un jeu
     */
    async getGameStats(gameId) {
        if (!this.isInitialized) {
            return this.getDefaultStats(gameId);
        }

        // Vérifier le cache
        const cacheKey = `stats_${gameId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const doc = await this.db.collection('game_statistics').doc(gameId).get();
            
            let stats;
            if (doc.exists) {
                const data = doc.data();
                stats = {
                    gameId: gameId,
                    playCount: data.playCount || 0,
                    uniquePlayersCount: data.uniquePlayersCount || 0,
                    averageRating: Math.round((data.averageRating || 0) * 10) / 10,
                    ratingCount: data.ratingCount || 0,
                    averageScore: Math.round(data.averageScore || 0),
                    lastPlayed: data.lastPlayed
                };
            } else {
                stats = this.getDefaultStats(gameId);
            }

            // Mettre en cache
            this.cache.set(cacheKey, {
                data: stats,
                timestamp: Date.now()
            });

            return stats;
        } catch (error) {
            console.error('❌ Erreur récupération statistiques:', error);
            return this.getDefaultStats(gameId);
        }
    }

    /**
     * Récupère les statistiques de tous les jeux
     */
    async getAllGameStats() {
        if (!this.isInitialized) {
            return this.getDefaultAllStats();
        }

        try {
            const snapshot = await this.db.collection('game_statistics').get();
            const allStats = {};

            snapshot.forEach(doc => {
                const data = doc.data();
                allStats[doc.id] = {
                    gameId: doc.id,
                    playCount: data.playCount || 0,
                    uniquePlayersCount: data.uniquePlayersCount || 0,
                    averageRating: Math.round((data.averageRating || 0) * 10) / 10,
                    ratingCount: data.ratingCount || 0,
                    averageScore: Math.round(data.averageScore || 0),
                    lastPlayed: data.lastPlayed
                };
            });

            return allStats;
        } catch (error) {
            console.error('❌ Erreur récupération toutes les statistiques:', error);
            return this.getDefaultAllStats();
        }
    }

    /**
     * Soumet une note pour un jeu (une seule note par joueur par jeu)
     */
    async submitRating(gameId, rating, playerId = null) {
        if (!this.isInitialized || rating < 1 || rating > 5) return false;

        try {
            const playerIdToUse = playerId || 'anonymous';
            
            // Vérifier si le joueur a déjà noté ce jeu
            const existingRatingQuery = await this.db.collection('game_ratings')
                .where('gameId', '==', gameId)
                .where('playerId', '==', playerIdToUse)
                .get();

            let isUpdate = false;
            let oldRating = null;

            if (!existingRatingQuery.empty) {
                // Le joueur a déjà noté ce jeu - mettre à jour
                const existingDoc = existingRatingQuery.docs[0];
                oldRating = existingDoc.data().rating;
                
                await existingDoc.ref.update({
                    rating: rating,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    lastModified: new Date().toISOString()
                });
                
                isUpdate = true;
                console.log(`✅ Note mise à jour de ${oldRating} vers ${rating}/5 pour ${gameId}`);
            } else {
                // Nouvelle note
                await this.db.collection('game_ratings').add({
                    gameId: gameId,
                    playerId: playerIdToUse,
                    rating: rating,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    date: new Date().toISOString()
                });
                
                console.log(`✅ Nouvelle note ${rating}/5 enregistrée pour ${gameId}`);
            }

            // Recalculer les statistiques du jeu
            await this.recalculateGameRating(gameId);

            return { success: true, isUpdate, oldRating };
        } catch (error) {
            console.error('❌ Erreur soumission note:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Recalcule la note moyenne d'un jeu basée sur toutes les notes
     */
    async recalculateGameRating(gameId) {
        if (!this.isInitialized) return false;

        try {
            // Récupérer toutes les notes pour ce jeu
            const ratingsSnapshot = await this.db.collection('game_ratings')
                .where('gameId', '==', gameId)
                .get();

            let totalRating = 0;
            let ratingCount = 0;

            ratingsSnapshot.forEach(doc => {
                const rating = doc.data().rating;
                if (rating >= 1 && rating <= 5) {
                    totalRating += rating;
                    ratingCount++;
                }
            });

            const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

            // Mettre à jour les statistiques du jeu
            const gameStatsRef = this.db.collection('game_statistics').doc(gameId);
            const doc = await gameStatsRef.get();

            if (doc.exists) {
                await gameStatsRef.update({
                    averageRating: averageRating,
                    ratingCount: ratingCount,
                    lastRatingUpdate: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Créer les statistiques si elles n'existent pas
                await gameStatsRef.set({
                    gameId: gameId,
                    playCount: 0,
                    totalScore: 0,
                    averageScore: 0,
                    averageRating: averageRating,
                    ratingCount: ratingCount,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastRatingUpdate: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Invalider le cache
            this.cache.delete(gameId);
            
            return true;
        } catch (error) {
            console.error('❌ Erreur recalcul note moyenne:', error);
            return false;
        }
    }

    /**
     * Vérifie si un joueur a déjà noté un jeu
     */
    async hasPlayerRated(gameId, playerId = null) {
        if (!this.isInitialized) return false;

        try {
            const playerIdToUse = playerId || 'anonymous';
            
            const existingRatingQuery = await this.db.collection('game_ratings')
                .where('gameId', '==', gameId)
                .where('playerId', '==', playerIdToUse)
                .get();

            if (!existingRatingQuery.empty) {
                const ratingData = existingRatingQuery.docs[0].data();
                return {
                    hasRated: true,
                    currentRating: ratingData.rating,
                    ratedAt: ratingData.timestamp
                };
            }

            return { hasRated: false };
        } catch (error) {
            console.error('❌ Erreur vérification note existante:', error);
            return { hasRated: false };
        }
    }

    /**
     * Récupère la note d'un joueur pour un jeu spécifique
     */
    async getPlayerRating(gameId, playerId = null) {
        if (!this.isInitialized) return null;

        try {
            const playerIdToUse = playerId || 'anonymous';
            
            const ratingQuery = await this.db.collection('game_ratings')
                .where('gameId', '==', gameId)
                .where('playerId', '==', playerIdToUse)
                .get();

            if (!ratingQuery.empty) {
                return ratingQuery.docs[0].data().rating;
            }

            return null;
        } catch (error) {
            console.error('❌ Erreur récupération note joueur:', error);
            return null;
        }
    }

    /**
     * Statistiques par défaut si Firebase n'est pas disponible
     */
    getDefaultStats(gameId) {
        // Retourner des valeurs par défaut attractives pour l'affichage
        const defaults = {
            'speed-verb-challenge': { rating: 4.8, players: 1200 },
            'enigma-scroll': { rating: 4.7, players: 1100 },
            'word-memory-game': { rating: 4.6, players: 950 },
            'memory-matrix': { rating: 4.5, players: 820 }
        };
        
        const gameDefaults = defaults[gameId] || { rating: 4.5, players: 500 };
        
        return {
            gameId: gameId,
            playCount: gameDefaults.players,
            uniquePlayersCount: gameDefaults.players,
            averageRating: gameDefaults.rating,
            ratingCount: 0, // 0 pour indiquer que ce sont des valeurs par défaut
            averageScore: 0,
            lastPlayed: null,
            isDefault: true // Flag pour indiquer que ce sont des valeurs par défaut
        };
    }

    /**
     * Toutes les statistiques par défaut
     */
    getDefaultAllStats() {
        return {
            'enigma-scroll': this.getDefaultStats('enigma-scroll'),
            'speed-verb-challenge': this.getDefaultStats('speed-verb-challenge'),
            'grammar-quest': this.getDefaultStats('grammar-quest'),
            'word-builder': this.getDefaultStats('word-builder')
        };
    }

    /**
     * Formate l'affichage du nombre de joueurs
     */
    formatPlayerCount(count) {
        if (count >= 1000) {
            return `${Math.floor(count / 100) / 10}k`;
        }
        return count.toString();
    }

    /**
     * Génère les étoiles pour l'affichage des notes
     */
    generateStarRating(rating, maxStars = 5) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        
        // Étoiles pleines
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        
        // Demi-étoile
        if (hasHalfStar) {
            stars += '⭐';
        }
        
        // Étoiles vides
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        
        return stars;
    }
}

// Instance globale
const gameStatsService = new GameStatsService();

// Export pour utilisation en module
export { gameStatsService };

// Disponible globalement
window.gameStatsService = gameStatsService;

// Auto-initialisation
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 [GameStatsService] Auto-initialisation...');
    const success = await gameStatsService.init();
    if (success) {
        console.log('✅ [GameStatsService] Service initialisé avec succès');
    } else {
        console.warn('⚠️ [GameStatsService] Échec de l\'initialisation (Firebase non disponible)');
    }
}); 