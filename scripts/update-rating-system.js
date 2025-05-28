// Script de mise à jour pour intégrer le nouveau système de notation
// Ce script remplace l'ancien système par le nouveau système simplifié

class RatingSystemUpdater {
    constructor() {
        this.gamesData = [
            { id: 'speed-verb-challenge', name: 'Speed Verb Challenge' },
            { id: 'enigma-scroll-nature', name: 'Enigma Scroll Nature' },
            { id: 'wow-bubbles', name: 'WOW Bubbles' },
            { id: 'memory-matrix', name: 'Memory Matrix' },
            { id: 'whisper-trials', name: 'Whisper Trials' },
            { id: 'word-memory-game', name: 'Word Memory Game' },
            { id: 'echoes-of-lexicon', name: 'Echoes of Lexicon' },
            { id: 'lost-in-migration', name: 'Lost in Migration' },
            { id: 'brew-your-words', name: 'Brew Your Words' }
        ];
        this.init();
    }

    async init() {
        console.log('🔄 Mise à jour du système de notation...');
        
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.performUpdate());
        } else {
            this.performUpdate();
        }
    }

    async performUpdate() {
        try {
            // 1. Nettoyer l'ancien système
            this.cleanOldRatingSystem();
            
            // 2. Ajouter le nouveau système aux pages de jeux
            this.addRatingToGamePages();
            
            // 3. Mettre à jour les cartes de jeux sur index.html et games.html
            this.updateGameCards();
            
            // 4. Ajouter les attributs data-game-id manquants
            this.addGameIdAttributes();
            
            console.log('✅ Système de notation mis à jour avec succès !');
            this.showUpdateNotification();
            
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
        }
    }

    cleanOldRatingSystem() {
        // Supprimer les anciens éléments de notation
        const oldElements = [
            '#end-game-rating',
            '.rating-overlay',
            '.game-rating-modal',
            '.old-rating-system',
            '#rating-modal',
            '.rating-popup'
        ];

        oldElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        // Supprimer les anciens styles
        const oldStyleIds = [
            'end-game-rating-styles',
            'game-stats-styles',
            'old-rating-styles'
        ];

        oldStyleIds.forEach(id => {
            const styleEl = document.getElementById(id);
            if (styleEl) styleEl.remove();
        });

        console.log('🧹 Ancien système de notation nettoyé');
    }

    addRatingToGamePages() {
        // Vérifier si nous sommes sur une page de jeu
        const gamePages = [
            'speed-verb-challenge.html',
            'enigma-scroll-nature.html',
            'wow-bubbles.html',
            'memory-matrix.html',
            'whisper-trials.html',
            'word-memory-game.html',
            'echoes-of-lexicon.html',
            'lost-in-migration.html',
            'brew-your-words.html'
        ];

        const currentPage = window.location.pathname.split('/').pop();
        
        if (gamePages.includes(currentPage)) {
            // Ajouter le script du nouveau système s'il n'est pas déjà présent
            if (!document.querySelector('script[src*="simple-rating-system.js"]')) {
                const script = document.createElement('script');
                script.src = 'scripts/simple-rating-system.js';
                script.defer = true;
                document.head.appendChild(script);
                console.log('📝 Script de notation ajouté à la page de jeu');
            }
        }
    }

    updateGameCards() {
        // Mettre à jour les cartes sur index.html et all-games.html
        const gameCards = document.querySelectorAll('.game-card, .card, [class*="game"]');
        
        gameCards.forEach(card => {
            // Essayer de détecter le jeu depuis le contenu de la carte
            const gameId = this.detectGameFromCard(card);
            
            if (gameId) {
                // Ajouter l'attribut data-game-id
                card.setAttribute('data-game-id', gameId);
                
                // Supprimer les anciens éléments de notation
                const oldRating = card.querySelector('.old-rating, .game-stats, .rating-info');
                if (oldRating) oldRating.remove();
                
                console.log(`🎮 Carte mise à jour pour le jeu: ${gameId}`);
            }
        });
    }

    detectGameFromCard(card) {
        // Essayer de détecter le jeu depuis différents éléments
        const detectionMethods = [
            // Depuis les liens
            () => {
                const link = card.querySelector('a[href*=".html"]');
                if (link) {
                    const href = link.getAttribute('href');
                    const match = href.match(/([^\/]+)\.html/);
                    return match ? match[1] : null;
                }
                return null;
            },
            
            // Depuis les titres
            () => {
                const title = card.querySelector('h2, h3, .title, .game-title');
                if (title) {
                    const titleText = title.textContent.toLowerCase().trim();
                    return this.mapTitleToGameId(titleText);
                }
                return null;
            },
            
            // Depuis les images
            () => {
                const img = card.querySelector('img[src*="game"], img[alt*="game"]');
                if (img) {
                    const src = img.getAttribute('src') || '';
                    const alt = img.getAttribute('alt') || '';
                    return this.mapImageToGameId(src + ' ' + alt);
                }
                return null;
            },
            
            // Depuis les classes CSS
            () => {
                const className = card.className.toLowerCase();
                for (const game of this.gamesData) {
                    if (className.includes(game.id) || className.includes(game.name.toLowerCase().replace(/\s+/g, '-'))) {
                        return game.id;
                    }
                }
                return null;
            }
        ];

        // Essayer chaque méthode de détection
        for (const method of detectionMethods) {
            const gameId = method();
            if (gameId && this.gamesData.find(g => g.id === gameId)) {
                return gameId;
            }
        }

        return null;
    }

    mapTitleToGameId(titleText) {
        const titleMappings = {
            'speed verb challenge': 'speed-verb-challenge',
            'enigma scroll nature': 'enigma-scroll-nature',
            'wow bubbles': 'wow-bubbles',
            'memory matrix': 'memory-matrix',
            'whisper trials': 'whisper-trials',
            'word memory game': 'word-memory-game',
            'echoes of lexicon': 'echoes-of-lexicon',
            'lost in migration': 'lost-in-migration',
            'brew your words': 'brew-your-words'
        };

        return titleMappings[titleText] || null;
    }

    mapImageToGameId(imageInfo) {
        const imageMappings = {
            'speed': 'speed-verb-challenge',
            'verb': 'speed-verb-challenge',
            'enigma': 'enigma-scroll-nature',
            'scroll': 'enigma-scroll-nature',
            'nature': 'enigma-scroll-nature',
            'bubbles': 'wow-bubbles',
            'wow': 'wow-bubbles',
            'memory': 'memory-matrix',
            'matrix': 'memory-matrix',
            'whisper': 'whisper-trials',
            'trials': 'whisper-trials',
            'word': 'word-memory-game',
            'echoes': 'echoes-of-lexicon',
            'lexicon': 'echoes-of-lexicon',
            'migration': 'lost-in-migration',
            'lost': 'lost-in-migration',
            'brew': 'brew-your-words'
        };

        const lowerInfo = imageInfo.toLowerCase();
        for (const [keyword, gameId] of Object.entries(imageMappings)) {
            if (lowerInfo.includes(keyword)) {
                return gameId;
            }
        }

        return null;
    }

    addGameIdAttributes() {
        // Ajouter manuellement les attributs pour les cartes connues
        const knownSelectors = [
            // Sélecteurs spécifiques pour chaque jeu si nécessaire
            { selector: 'a[href="speed-verb-challenge.html"]', gameId: 'speed-verb-challenge' },
            { selector: 'a[href="enigma-scroll-nature.html"]', gameId: 'enigma-scroll-nature' },
            { selector: 'a[href="wow-bubbles.html"]', gameId: 'wow-bubbles' },
            { selector: 'a[href="memory-matrix.html"]', gameId: 'memory-matrix' },
            { selector: 'a[href="whisper-trials.html"]', gameId: 'whisper-trials' },
            { selector: 'a[href="word-memory-game.html"]', gameId: 'word-memory-game' },
            { selector: 'a[href="echoes-of-lexicon.html"]', gameId: 'echoes-of-lexicon' },
            { selector: 'a[href="lost-in-migration.html"]', gameId: 'lost-in-migration' },
            { selector: 'a[href="brew-your-words.html"]', gameId: 'brew-your-words' }
        ];

        knownSelectors.forEach(({ selector, gameId }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Trouver la carte parente
                const card = el.closest('.game-card, .card, [class*="game"], .col-md-4, .col-lg-3');
                if (card && !card.hasAttribute('data-game-id')) {
                    card.setAttribute('data-game-id', gameId);
                    console.log(`🏷️ Attribut data-game-id ajouté: ${gameId}`);
                }
            });
        });
    }

    showUpdateNotification() {
        // Créer une notification de mise à jour
        const notification = document.createElement('div');
        notification.id = 'rating-update-notification';
        notification.innerHTML = `
            <div class="update-notification">
                <div class="notification-content">
                    <span class="notification-icon">✅</span>
                    <span class="notification-text">Système de notation mis à jour !</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            </div>
        `;

        // Ajouter les styles pour la notification
        const notificationStyles = document.createElement('style');
        notificationStyles.textContent = `
            #rating-update-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            }

            .update-notification {
                background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                font-family: Arial, sans-serif;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .notification-icon {
                font-size: 1.2em;
            }

            .notification-text {
                font-weight: 500;
            }

            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5em;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }

            .notification-close:hover {
                opacity: 1;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @media (max-width: 768px) {
                #rating-update-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }
            }
        `;

        document.head.appendChild(notificationStyles);
        document.body.appendChild(notification);

        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
                notificationStyles.remove();
            }
        }, 5000);
    }

    // Méthode pour forcer la mise à jour des cartes
    async forceUpdateCards() {
        if (window.simpleRatingSystem) {
            await window.simpleRatingSystem.updateGameCards();
            console.log('🔄 Cartes de jeux mises à jour manuellement');
        }
    }

    // Méthode pour diagnostiquer les problèmes
    diagnose() {
        console.log('🔍 Diagnostic du système de notation:');
        
        const gameCards = document.querySelectorAll('[data-game-id]');
        console.log(`📊 ${gameCards.length} cartes avec data-game-id trouvées`);
        
        gameCards.forEach(card => {
            const gameId = card.getAttribute('data-game-id');
            console.log(`  - ${gameId}`);
        });

        const ratingElements = document.querySelectorAll('.game-rating');
        console.log(`⭐ ${ratingElements.length} éléments de notation trouvés`);

        const simpleRatingContainer = document.getElementById('simple-rating-container');
        console.log(`🎮 Interface de notation sur page de jeu: ${simpleRatingContainer ? 'Présente' : 'Absente'}`);
    }
}

// Initialiser le système de mise à jour
document.addEventListener('DOMContentLoaded', () => {
    window.ratingSystemUpdater = new RatingSystemUpdater();
    
    // Exposer les méthodes utiles pour le debug
    window.updateRatingCards = () => window.ratingSystemUpdater.forceUpdateCards();
    window.diagnoseRating = () => window.ratingSystemUpdater.diagnose();
});

// Exporter pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RatingSystemUpdater;
} 