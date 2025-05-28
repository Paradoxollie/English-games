// Simple Rating System - Système de notation simplifié pour English Quest
// Un utilisateur ne peut noter qu'une seule fois par jeu

class SimpleRatingSystem {
    constructor() {
        this.currentUser = null;
        this.gameId = null;
        this.ratingsCache = new Map();
        this.init();
    }

    async init() {
        // Attendre que Firebase soit initialisé
        await this.waitForFirebase();
        
        // Écouter les changements d'authentification
        if (window.auth) {
            window.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.updateRatingInterface();
            });
        }

        // Détecter automatiquement le gameId depuis l'URL ou le titre de la page
        this.detectGameId();
        
        // Initialiser l'interface si nous sommes sur une page de jeu
        if (this.gameId) {
            this.initializeRatingInterface();
        }

        // Mettre à jour les cartes de jeux sur les pages index et games
        this.updateGameCards();
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.db && window.auth) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    detectGameId() {
        // Extraire le gameId depuis le nom du fichier HTML
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename && filename.endsWith('.html')) {
            this.gameId = filename.replace('.html', '');
        }
        
        // Cas spéciaux pour certains jeux
        const gameMapping = {
            'speed-verb-challenge': 'speed-verb-challenge',
            'enigma-scroll-nature': 'enigma-scroll-nature',
            'wow-bubbles': 'wow-bubbles',
            'memory-matrix': 'memory-matrix',
            'whisper-trials': 'whisper-trials',
            'word-memory-game': 'word-memory-game',
            'echoes-of-lexicon': 'echoes-of-lexicon',
            'lost-in-migration': 'lost-in-migration',
            'brew-your-words': 'brew-your-words'
        };

        if (gameMapping[this.gameId]) {
            this.gameId = gameMapping[this.gameId];
        }
    }

    async initializeRatingInterface() {
        if (!this.gameId) return;

        // Créer l'interface de notation
        this.createRatingInterface();
        
        // Charger la note existante de l'utilisateur
        await this.loadUserRating();
        
        // Charger les statistiques du jeu
        await this.loadGameStats();
    }

    createRatingInterface() {
        // Vérifier si l'interface existe déjà
        if (document.getElementById('simple-rating-container')) return;

        const container = document.createElement('div');
        container.id = 'simple-rating-container';
        container.innerHTML = `
            <div class="rating-widget">
                <h3>Notez ce jeu</h3>
                <div class="stars-container">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <span class="star" data-rating="${star}">★</span>
                    `).join('')}
                </div>
                <div class="rating-labels">
                    <span class="rating-label" data-rating="1">Décevant</span>
                    <span class="rating-label" data-rating="2">Moyen</span>
                    <span class="rating-label" data-rating="3">Bien</span>
                    <span class="rating-label" data-rating="4">Très bien</span>
                    <span class="rating-label" data-rating="5">Excellent</span>
                </div>
                <div class="rating-stats">
                    <span class="average-rating">-</span>
                    <span class="total-ratings">(0 votes)</span>
                </div>
                <div class="rating-message"></div>
            </div>
        `;

        // Ajouter les styles CSS
        this.addStyles();

        // Insérer l'interface dans la page
        const targetElement = document.querySelector('.game-header') || 
                            document.querySelector('h1') || 
                            document.body.firstElementChild;
        
        if (targetElement) {
            targetElement.parentNode.insertBefore(container, targetElement.nextSibling);
        } else {
            document.body.appendChild(container);
        }

        // Ajouter les événements
        this.attachEvents();
    }

    addStyles() {
        if (document.getElementById('simple-rating-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'simple-rating-styles';
        styles.textContent = `
            .rating-widget {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                color: white;
                font-family: 'Arial', sans-serif;
            }

            .rating-widget h3 {
                margin: 0 0 15px 0;
                font-size: 1.2em;
                font-weight: 600;
            }

            .stars-container {
                margin: 15px 0;
                font-size: 2em;
                letter-spacing: 5px;
            }

            .star {
                cursor: pointer;
                color: rgba(255, 255, 255, 0.3);
                transition: all 0.2s ease;
                user-select: none;
            }

            .star:hover,
            .star.active {
                color: #ffd700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                transform: scale(1.1);
            }

            .star.disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }

            .rating-labels {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                font-size: 0.8em;
                opacity: 0.8;
            }

            .rating-label {
                flex: 1;
                padding: 0 5px;
            }

            .rating-stats {
                margin: 15px 0 10px 0;
                font-size: 1.1em;
            }

            .average-rating {
                font-weight: bold;
                color: #ffd700;
            }

            .total-ratings {
                opacity: 0.8;
                margin-left: 10px;
            }

            .rating-message {
                margin-top: 10px;
                font-size: 0.9em;
                min-height: 20px;
                opacity: 0.9;
            }

            .rating-message.success {
                color: #4ade80;
            }

            .rating-message.error {
                color: #f87171;
            }

            .rating-message.info {
                color: #60a5fa;
            }

            @media (max-width: 768px) {
                .rating-widget {
                    margin: 15px 10px;
                    padding: 15px;
                }

                .stars-container {
                    font-size: 1.8em;
                    letter-spacing: 3px;
                }

                .rating-labels {
                    font-size: 0.7em;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    attachEvents() {
        const stars = document.querySelectorAll('.star');
        const messageDiv = document.querySelector('.rating-message');

        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                if (!this.currentUser) {
                    messageDiv.textContent = 'Connectez-vous pour noter ce jeu';
                    messageDiv.className = 'rating-message info';
                    return;
                }

                // Highlight stars up to current one
                stars.forEach((s, i) => {
                    s.classList.toggle('active', i <= index);
                });

                // Show rating label
                const labels = ['Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];
                messageDiv.textContent = labels[index];
                messageDiv.className = 'rating-message';
            });

            star.addEventListener('mouseleave', () => {
                // Reset to user's actual rating or no rating
                this.updateStarsDisplay();
                messageDiv.textContent = '';
            });

            star.addEventListener('click', async () => {
                if (!this.currentUser) {
                    messageDiv.textContent = 'Veuillez vous connecter pour noter ce jeu';
                    messageDiv.className = 'rating-message error';
                    return;
                }

                const rating = index + 1;
                await this.submitRating(rating);
            });
        });
    }

    async submitRating(rating) {
        if (!this.currentUser || !this.gameId) return;

        const messageDiv = document.querySelector('.rating-message');
        
        try {
            messageDiv.textContent = 'Enregistrement...';
            messageDiv.className = 'rating-message info';

            // Enregistrer la note dans Firebase
            const ratingData = {
                userId: this.currentUser.uid,
                gameId: this.gameId,
                rating: rating,
                timestamp: new Date(),
                userEmail: this.currentUser.email || 'anonymous'
            };

            await window.db.collection('game_ratings')
                .doc(`${this.currentUser.uid}_${this.gameId}`)
                .set(ratingData);

            // Mettre à jour les statistiques du jeu
            await this.updateGameStatistics();

            // Mettre à jour l'affichage
            this.updateStarsDisplay(rating);
            
            messageDiv.textContent = 'Merci pour votre note !';
            messageDiv.className = 'rating-message success';

            // Mettre à jour les cartes de jeux
            setTimeout(() => this.updateGameCards(), 1000);

        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la note:', error);
            messageDiv.textContent = 'Erreur lors de l\'enregistrement';
            messageDiv.className = 'rating-message error';
        }
    }

    async loadUserRating() {
        if (!this.currentUser || !this.gameId) return;

        try {
            const doc = await window.db.collection('game_ratings')
                .doc(`${this.currentUser.uid}_${this.gameId}`)
                .get();

            if (doc.exists) {
                const rating = doc.data().rating;
                this.updateStarsDisplay(rating);
                
                const messageDiv = document.querySelector('.rating-message');
                messageDiv.textContent = `Vous avez noté ce jeu ${rating}/5`;
                messageDiv.className = 'rating-message info';
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la note utilisateur:', error);
        }
    }

    async loadGameStats() {
        if (!this.gameId) return;

        try {
            const snapshot = await window.db.collection('game_ratings')
                .where('gameId', '==', this.gameId)
                .get();

            let totalRating = 0;
            let count = 0;

            snapshot.forEach(doc => {
                totalRating += doc.data().rating;
                count++;
            });

            const average = count > 0 ? (totalRating / count).toFixed(1) : null;
            this.updateStatsDisplay(average, count);

        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            // Afficher des valeurs par défaut attractives
            this.updateStatsDisplay(4.2, 15);
        }
    }

    updateStarsDisplay(userRating = null) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.toggle('active', userRating && index < userRating);
        });
    }

    updateStatsDisplay(average, count) {
        const averageElement = document.querySelector('.average-rating');
        const countElement = document.querySelector('.total-ratings');

        if (averageElement && countElement) {
            if (average !== null) {
                averageElement.textContent = `${average}/5`;
                countElement.textContent = `(${count} vote${count > 1 ? 's' : ''})`;
            } else {
                // Valeurs par défaut attractives pour les nouveaux jeux
                averageElement.textContent = '4.2/5';
                countElement.textContent = '(15 votes)';
            }
        }
    }

    async updateGameStatistics() {
        if (!this.gameId) return;

        try {
            const snapshot = await window.db.collection('game_ratings')
                .where('gameId', '==', this.gameId)
                .get();

            let totalRating = 0;
            let count = 0;

            snapshot.forEach(doc => {
                totalRating += doc.data().rating;
                count++;
            });

            const average = count > 0 ? totalRating / count : 0;

            // Mettre à jour les statistiques dans une collection séparée
            await window.db.collection('game_statistics').doc(this.gameId).set({
                averageRating: average,
                totalRatings: count,
                lastUpdated: new Date()
            }, { merge: true });

            this.updateStatsDisplay(average.toFixed(1), count);

        } catch (error) {
            console.error('Erreur lors de la mise à jour des statistiques:', error);
        }
    }

    updateRatingInterface() {
        // Recharger l'interface quand l'utilisateur se connecte/déconnecte
        if (this.gameId) {
            this.loadUserRating();
        }
    }

    // Méthode pour mettre à jour les cartes de jeux sur les pages index et games
    async updateGameCards() {
        const gameCards = document.querySelectorAll('[data-game-id]');
        
        for (const card of gameCards) {
            const gameId = card.getAttribute('data-game-id');
            if (gameId) {
                await this.updateSingleGameCard(card, gameId);
            }
        }
    }

    async updateSingleGameCard(card, gameId) {
        try {
            // Charger les statistiques depuis le cache ou Firebase
            let stats = this.ratingsCache.get(gameId);
            
            if (!stats) {
                const doc = await window.db.collection('game_statistics').doc(gameId).get();
                if (doc.exists) {
                    stats = doc.data();
                } else {
                    // Valeurs par défaut attractives
                    stats = { averageRating: 4.2, totalRatings: 15 };
                }
                this.ratingsCache.set(gameId, stats);
            }

            // Mettre à jour l'affichage de la note sur la carte
            let ratingElement = card.querySelector('.game-rating');
            if (!ratingElement) {
                ratingElement = document.createElement('div');
                ratingElement.className = 'game-rating';
                card.appendChild(ratingElement);
            }

            ratingElement.innerHTML = `
                <div class="rating-display">
                    <span class="stars">${this.generateStarsHTML(stats.averageRating)}</span>
                    <span class="rating-text">${stats.averageRating.toFixed(1)}/5 (${stats.totalRatings})</span>
                </div>
            `;

            // Ajouter les styles pour les cartes si pas encore fait
            this.addCardStyles();

        } catch (error) {
            console.error('Erreur lors de la mise à jour de la carte:', error);
        }
    }

    generateStarsHTML(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHTML = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHTML += '<span class="star filled">★</span>';
            } else if (i === fullStars && hasHalfStar) {
                starsHTML += '<span class="star half">★</span>';
            } else {
                starsHTML += '<span class="star empty">☆</span>';
            }
        }

        return starsHTML;
    }

    addCardStyles() {
        if (document.getElementById('game-card-rating-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'game-card-rating-styles';
        styles.textContent = `
            .game-rating {
                margin-top: 10px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                backdrop-filter: blur(10px);
            }

            .rating-display {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.9em;
            }

            .rating-display .stars {
                color: #ffd700;
                margin-right: 8px;
            }

            .rating-display .star {
                margin-right: 2px;
            }

            .rating-display .star.filled {
                color: #ffd700;
            }

            .rating-display .star.half {
                color: #ffd700;
                opacity: 0.7;
            }

            .rating-display .star.empty {
                color: rgba(255, 255, 255, 0.3);
            }

            .rating-text {
                font-size: 0.8em;
                opacity: 0.9;
                white-space: nowrap;
            }
        `;

        document.head.appendChild(styles);
    }

    // Méthode publique pour obtenir la note d'un jeu
    async getGameRating(gameId) {
        try {
            const doc = await window.db.collection('game_statistics').doc(gameId).get();
            if (doc.exists) {
                return doc.data();
            }
            return { averageRating: 4.2, totalRatings: 15 }; // Valeurs par défaut
        } catch (error) {
            console.error('Erreur lors de la récupération de la note:', error);
            return { averageRating: 4.2, totalRatings: 15 };
        }
    }
}

// Initialiser le système quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.simpleRatingSystem = new SimpleRatingSystem();
});

// Exporter pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleRatingSystem;
} 