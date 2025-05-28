/**
 * Script de mise à jour pour intégrer le nouveau système de notation simplifié
 * Remplace l'ancien système complexe par le nouveau système simple
 */

class RatingSystemUpdater {
    constructor() {
        this.ratingSystem = null;
    }

    /**
     * Initialise le système de mise à jour
     */
    async init() {
        // Attendre que le système de notation soit disponible
        if (window.simpleRatingSystem) {
            this.ratingSystem = window.simpleRatingSystem;
            await this.ratingSystem.init();
            console.log('✅ Système de notation mis à jour initialisé');
            return true;
        } else {
            console.warn('⚠️ Système de notation simplifié non disponible');
            return false;
        }
    }

    /**
     * Met à jour toutes les cartes de jeux avec les vraies statistiques
     */
    async updateAllGameCards() {
        if (!this.ratingSystem) {
            console.warn('Système de notation non initialisé');
            return;
        }

        console.log('🔄 Mise à jour de toutes les cartes de jeux...');

        try {
            // Récupérer toutes les statistiques
            const allStats = await this.ratingSystem.getAllGameStats();
            console.log('📊 Statistiques récupérées:', allStats);

            // Mettre à jour chaque jeu
            for (const [gameId, stats] of Object.entries(allStats)) {
                await this.updateGameCard(gameId, stats);
            }

            console.log('✅ Toutes les cartes de jeux mises à jour');
        } catch (error) {
            console.error('❌ Erreur mise à jour cartes:', error);
        }
    }

    /**
     * Met à jour une carte de jeu spécifique
     */
    async updateGameCard(gameId, stats) {
        console.log(`🎮 Mise à jour ${gameId}:`, stats);

        if (gameId === 'speed-verb-challenge') {
            // Jeu vedette Speed Verb Challenge
            const featuredRating = document.querySelector('.featured-game .game-stats .game-stat:last-child span');
            if (featuredRating) {
                if (stats.ratingCount > 0) {
                    featuredRating.textContent = `${stats.averageRating}/5 ⭐ (${stats.ratingCount})`;
                    console.log(`✅ Speed Verb (vedette) - Note réelle: ${stats.averageRating}/5 (${stats.ratingCount} avis)`);
                } else {
                    featuredRating.textContent = `${stats.averageRating}/5 ⭐`;
                    console.log(`✅ Speed Verb (vedette) - Note par défaut: ${stats.averageRating}/5`);
                }
            }
        } else {
            // Autres jeux - chercher par titre
            const gameCards = document.querySelectorAll('.game-card');
            for (const card of gameCards) {
                const title = card.querySelector('.game-title');
                if (title && this.gameMatchesCard(gameId, title.textContent)) {
                    const ratingSpan = card.querySelector('.game-stats .game-stat:last-child span');
                    if (ratingSpan) {
                        if (stats.ratingCount > 0) {
                            ratingSpan.textContent = `${stats.averageRating}/5`;
                            console.log(`✅ ${gameId} - Note réelle: ${stats.averageRating}/5 (${stats.ratingCount} avis)`);
                        } else {
                            ratingSpan.textContent = `${stats.averageRating}/5`;
                            console.log(`✅ ${gameId} - Note par défaut: ${stats.averageRating}/5`);
                        }
                    }
                    break;
                }
            }
        }
    }

    /**
     * Vérifie si un jeu correspond à une carte
     */
    gameMatchesCard(gameId, cardTitle) {
        const matches = {
            'enigma-scroll': 'Enigma Scroll',
            'word-memory-game': 'Word Memory',
            'memory-matrix': 'Memory Matrix'
        };
        
        return cardTitle.includes(matches[gameId] || '');
    }

    /**
     * Écoute les mises à jour de notation en temps réel
     */
    setupRealTimeUpdates() {
        window.addEventListener('gameRatingUpdated', async (event) => {
            console.log('🌟 Mise à jour de notation détectée:', event.detail);
            
            // Attendre un peu pour que Firebase se mette à jour
            setTimeout(async () => {
                const gameId = event.detail.gameId;
                if (gameId && this.ratingSystem) {
                    console.log(`🔄 Rechargement des stats pour ${gameId}`);
                    const updatedStats = await this.ratingSystem.getGameStats(gameId);
                    await this.updateGameCard(gameId, updatedStats);
                    
                    // Afficher une notification de mise à jour
                    this.showUpdateNotification(gameId, updatedStats);
                }
            }, 1500);
        });
    }

    /**
     * Affiche une notification de mise à jour
     */
    showUpdateNotification(gameId, stats) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: 'Exo 2', sans-serif;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        const gameName = gameId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-star" style="font-size: 1.2rem;"></i>
                <div>
                    <div style="font-size: 0.9rem; margin-bottom: 2px;">Note mise à jour !</div>
                    <div style="font-size: 0.8rem; opacity: 0.9;">${gameName}: ${stats.averageRating}/5 ⭐</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animer l'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animer la sortie et supprimer
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Supprime l'ancien système de notation
     */
    removeOldRatingSystem() {
        // Supprimer les anciens scripts et styles
        const oldElements = [
            '#end-game-rating-styles',
            '#game-stats-styles'
        ];

        oldElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.remove();
                console.log(`🗑️ Supprimé: ${selector}`);
            }
        });

        // Supprimer les anciennes interfaces de notation
        const oldInterfaces = document.querySelectorAll('.end-game-rating-overlay, .old-rating-interface');
        oldInterfaces.forEach(element => {
            element.remove();
        });

        console.log('🧹 Ancien système de notation nettoyé');
    }

    /**
     * Ajoute l'interface de notation sur les pages de jeux
     */
    addRatingInterfaceToGamePages() {
        // Détecter si on est sur une page de jeu
        const gamePageIndicators = [
            'enigma-scroll-main.html',
            'speed-verb-challenge.html',
            'word-memory-game.html',
            'memory-matrix.html'
        ];

        const currentPage = window.location.pathname;
        let gameId = null;

        // Identifier le jeu actuel
        if (currentPage.includes('enigma-scroll')) {
            gameId = 'enigma-scroll';
        } else if (currentPage.includes('speed-verb')) {
            gameId = 'speed-verb-challenge';
        } else if (currentPage.includes('word-memory')) {
            gameId = 'word-memory-game';
        } else if (currentPage.includes('memory-matrix')) {
            gameId = 'memory-matrix';
        }

        if (gameId) {
            console.log(`🎮 Page de jeu détectée: ${gameId}`);
            
            // Chercher un conteneur approprié pour l'interface de notation
            let container = document.querySelector('.game-interface, .sidebar, .game-content');
            
            if (!container) {
                // Créer un conteneur si nécessaire
                container = document.createElement('div');
                container.id = 'rating-container';
                container.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    max-width: 300px;
                `;
                document.body.appendChild(container);
            }

            // Ajouter l'interface de notation
            if (this.ratingSystem) {
                setTimeout(() => {
                    this.ratingSystem.createRatingInterface(gameId, `#${container.id || 'rating-container'}`);
                }, 1000);
            }
        }
    }
}

// Créer une instance globale
window.ratingSystemUpdater = new RatingSystemUpdater();

// Initialiser automatiquement
document.addEventListener('DOMContentLoaded', async () => {
    const updater = window.ratingSystemUpdater;
    
    // Attendre que le système de notation soit prêt
    let attempts = 0;
    const maxAttempts = 10;
    
    const waitForRatingSystem = async () => {
        if (window.simpleRatingSystem && window.simpleRatingSystem.isInitialized) {
            console.log('🎯 Système de notation détecté, initialisation...');
            
            await updater.init();
            updater.removeOldRatingSystem();
            updater.setupRealTimeUpdates();
            
            // Mettre à jour les cartes sur les pages index et games
            if (window.location.pathname.includes('index.html') || 
                window.location.pathname.includes('games.html') || 
                window.location.pathname.endsWith('/')) {
                await updater.updateAllGameCards();
            }
            
            // Ajouter l'interface de notation sur les pages de jeux
            updater.addRatingInterfaceToGamePages();
            
            console.log('✅ Système de notation mis à jour et opérationnel');
            return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
            console.log(`⏳ Attente du système de notation... (${attempts}/${maxAttempts})`);
            setTimeout(waitForRatingSystem, 500);
        } else {
            console.warn('⚠️ Timeout: Système de notation non disponible');
        }
    };
    
    // Démarrer l'attente
    setTimeout(waitForRatingSystem, 100);
});

// Exporter pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RatingSystemUpdater;
} 