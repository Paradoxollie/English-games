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
            const gamePlayData = {
                gameId: gameId,
                playerId: playerId || 'anonymous',
                score: score,
                rating: rating,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString()
            };

            // Enregistrer la partie
            await this.db.collection('game_plays').add(gamePlayData);

            // Mettre à jour les statistiques du jeu
            await this.updateGameStats(gameId, score, rating);

            console.log(`✅ Partie enregistrée pour ${gameId}`);
            return true;
        } catch (error) {
            console.error('❌ Erreur enregistrement partie:', error);
            return false;
        }
    }

    /**
     * Met à jour les statistiques d'un jeu
     */
    async updateGameStats(gameId, score = 0, rating = null) {
        if (!this.isInitialized) return false;

        try {
            const gameStatsRef = this.db.collection('game_statistics').doc(gameId);
            const doc = await gameStatsRef.get();

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
     * Soumet une note pour un jeu
     */
    async submitRating(gameId, rating, playerId = null) {
        if (!this.isInitialized || rating < 1 || rating > 5) return false;

        try {
            // Enregistrer la note
            await this.db.collection('game_ratings').add({
                gameId: gameId,
                playerId: playerId || 'anonymous',
                rating: rating,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString()
            });

            // Mettre à jour les statistiques
            await this.updateGameStats(gameId, 0, rating);

            console.log(`✅ Note ${rating}/5 enregistrée pour ${gameId}`);
            return true;
        } catch (error) {
            console.error('❌ Erreur soumission note:', error);
            return false;
        }
    }

    /**
     * Statistiques par défaut si Firebase n'est pas disponible
     */
    getDefaultStats(gameId) {
        // Retourner 0 pour les vraies statistiques, pas de fausses données
        return {
            gameId: gameId,
            playCount: 0,
            averageRating: 0,
            ratingCount: 0,
            averageScore: 0,
            lastPlayed: null
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