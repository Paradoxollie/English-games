/**
 * Service de récompenses pour les jeux English Quest
 * Utilise le nouveau authService pour sauvegarder les gains
 */

import { authService } from './auth-service.js';

class RewardService {
    constructor() {
        this.authService = authService;
    }

    /**
     * Donne des récompenses à l'utilisateur connecté
     * @param {Object} rewards - Les récompenses à donner { xp, coins }
     * @param {boolean} isTopScore - Si c'est un score record
     * @param {string} gameType - Type de jeu (pour les statistiques)
     */
    async giveRewards(rewards = { xp: 1, coins: 1 }, isTopScore = false, gameType = 'game') {
        try {
            console.log(`🎁 [RewardService] Attribution des récompenses:`, rewards);

            // Vérifier que l'utilisateur est connecté
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser || !currentUser.uid) {
                console.warn('❌ [RewardService] Pas d\'utilisateur connecté pour donner des récompenses');
                throw new Error('Utilisateur non connecté');
            }

            console.log(`✅ [RewardService] Utilisateur connecté: ${currentUser.username}`);

            // Appliquer le multiplicateur pour les scores records
            const finalRewards = isTopScore ? {
                xp: rewards.xp * 20,
                coins: rewards.coins * 20
            } : rewards;

            // Préparer les données de mise à jour
            const updateData = {
                xp: (currentUser.xp || 0) + finalRewards.xp,
                coins: (currentUser.coins || 0) + finalRewards.coins,
                lastPlayed: new Date().toISOString()
            };

            // Ajouter les statistiques de jeu si disponibles
            if (gameType) {
                const gameStats = currentUser.gameStats || {};
                const currentGameStats = gameStats[gameType] || { played: 0, won: 0, totalScore: 0 };
                
                updateData.gameStats = {
                    ...gameStats,
                    [gameType]: {
                        played: currentGameStats.played + 1,
                        won: currentGameStats.won + (isTopScore ? 1 : 0),
                        totalScore: currentGameStats.totalScore + finalRewards.xp,
                        lastPlayed: new Date().toISOString()
                    }
                };
            }

            console.log(`🔄 [RewardService] Mise à jour du profil avec:`, updateData);

            // Sauvegarder via le authService
            const result = await this.authService.updateProfile(updateData);

            if (result.success) {
                console.log(`✅ [RewardService] Récompenses sauvegardées: +${finalRewards.xp} XP, +${finalRewards.coins} coins`);
                
                // Afficher le message de récompense
                const message = isTopScore 
                    ? `🏆 RECORD ! +${finalRewards.xp} ⭐ XP et +${finalRewards.coins} 🪙 coins !`
                    : `🎮 Partie terminée ! +${finalRewards.xp} ⭐ XP et +${finalRewards.coins} 🪙 coins`;
                
                this.showRewardMessage(message, isTopScore);

                return {
                    success: true,
                    rewards: finalRewards,
                    newTotals: {
                        xp: updateData.xp,
                        coins: updateData.coins
                    }
                };
            } else {
                throw new Error(result.error || 'Erreur lors de la sauvegarde');
            }

        } catch (error) {
            console.error('❌ [RewardService] Erreur lors de l\'attribution des récompenses:', error);
            
            // Message d'erreur à l'utilisateur
            this.showRewardMessage('❌ Erreur lors de la sauvegarde des récompenses', false, 'error');
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Affiche un message de récompense à l'utilisateur
     * @param {string} message - Message à afficher
     * @param {boolean} isTopScore - Si c'est un score record
     * @param {string} type - Type de message ('success', 'error', 'info')
     */
    showRewardMessage(message, isTopScore = false, type = 'success') {
        // Créer un élément de notification
        const notification = document.createElement('div');
        notification.className = `reward-notification ${type} ${isTopScore ? 'top-score' : ''}`;
        notification.innerHTML = `
            <div class="reward-content">
                <div class="reward-icon">
                    ${isTopScore ? '🏆' : type === 'error' ? '❌' : '🎮'}
                </div>
                <div class="reward-text">${message}</div>
            </div>
        `;

        // Styles pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${isTopScore ? 'linear-gradient(135deg, #f39c12, #e67e22)' : type === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #2ecc71, #27ae60)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Exo 2', sans-serif;
            font-weight: 600;
            max-width: 350px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            border: 2px solid rgba(255,255,255,0.2);
        `;

        // Ajouter au DOM
        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animation de sortie et suppression
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, isTopScore ? 6000 : 4000); // Plus long pour les records
    }

    /**
     * Donne des récompenses pour une partie d'Enigma Scroll
     * @param {boolean} isTopScore - Si c'est un score record
     * @param {number} score - Score obtenu
     */
    async giveEnigmaScrollRewards(isTopScore = false, score = 0) {
        const baseRewards = { xp: 1, coins: 1 };
        return await this.giveRewards(baseRewards, isTopScore, 'enigma-scroll');
    }

    /**
     * Donne des récompenses pour Speed Verb Challenge
     * @param {boolean} isTopScore - Si c'est un score record
     * @param {number} score - Score obtenu
     */
    async giveSpeedVerbRewards(isTopScore = false, score = 0) {
        const baseRewards = { xp: 2, coins: 1 }; // Plus d'XP pour ce jeu
        return await this.giveRewards(baseRewards, isTopScore, 'speed-verb');
    }

    /**
     * Vérifie si l'utilisateur peut recevoir des récompenses
     */
    canGiveRewards() {
        const currentUser = this.authService.getCurrentUser();
        return !!(currentUser && currentUser.uid);
    }

    /**
     * Obtient les statistiques de jeu de l'utilisateur
     * @param {string} gameType - Type de jeu
     */
    getGameStats(gameType) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !currentUser.gameStats) {
            return { played: 0, won: 0, totalScore: 0 };
        }

        return currentUser.gameStats[gameType] || { played: 0, won: 0, totalScore: 0 };
    }
}

// Créer et exporter l'instance
export const rewardService = new RewardService();

// Exposer globalement pour les scripts non-module
window.rewardService = rewardService;

console.log('✅ [RewardService] Service de récompenses initialisé'); 