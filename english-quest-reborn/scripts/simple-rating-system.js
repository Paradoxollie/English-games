/**
 * Système de notation simplifié pour English Quest
 * Permet aux joueurs de noter chaque jeu une seule fois
 * Affiche les notes sur les cartes de jeux
 */

class SimpleRatingSystem {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.currentUser = null;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Initialise le système de notation
     */
    async init() {
        try {
            // Initialiser Firebase
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase non disponible pour le système de notation');
                return false;
            }

            this.db = firebase.firestore();
            this.isInitialized = true;
            
            // Récupérer l'utilisateur actuel
            this.currentUser = this.getCurrentUser();
            
            console.log('✅ Système de notation simplifié initialisé');
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation système de notation:', error);
            return false;
        }
    }

    /**
     * Récupère l'utilisateur actuel
     */
    getCurrentUser() {
        try {
            // Essayer plusieurs méthodes pour récupérer l'utilisateur
            let user = null;
            
            // Méthode 1: localStorage avec nouvelle clé
            const userData = localStorage.getItem('english_quest_current_user');
            if (userData) {
                try {
                    user = JSON.parse(userData);
                } catch (e) {
                    console.warn('Erreur parsing user data:', e);
                }
            }
            
            // Méthode 2: localStorage avec ancienne clé
            if (!user) {
                const legacyUserData = localStorage.getItem('currentUser');
                if (legacyUserData) {
                    try {
                        user = JSON.parse(legacyUserData);
                    } catch (e) {
                        console.warn('Erreur parsing legacy user data:', e);
                    }
                }
            }
            
            // Méthode 3: authService global
            if (!user && window.authService && window.authService.currentUser) {
                user = window.authService.currentUser;
            }
            
            return user;
        } catch (error) {
            console.error('Erreur récupération utilisateur:', error);
            return null;
        }
    }

    /**
     * Vérifie si l'utilisateur peut noter (connecté)
     */
    canRate() {
        this.currentUser = this.getCurrentUser();
        return this.currentUser && (this.currentUser.uid || this.currentUser.id);
    }

    /**
     * Récupère l'ID de l'utilisateur
     */
    getUserId() {
        if (!this.currentUser) return null;
        return this.currentUser.uid || this.currentUser.id || null;
    }

    /**
     * Vérifie si l'utilisateur a déjà noté un jeu
     */
    async hasUserRated(gameId) {
        if (!this.isInitialized || !this.canRate()) {
            return false;
        }

        try {
            const userId = this.getUserId();
            const ratingQuery = await this.db.collection('game_ratings')
                .where('gameId', '==', gameId)
                .where('userId', '==', userId)
                .limit(1)
                .get();

            return !ratingQuery.empty;
        } catch (error) {
            console.error('Erreur vérification note existante:', error);
            return false;
        }
    }

    /**
     * Récupère la note de l'utilisateur pour un jeu
     */
    async getUserRating(gameId) {
        if (!this.isInitialized || !this.canRate()) {
            return null;
        }

        try {
            const userId = this.getUserId();
            const ratingQuery = await this.db.collection('game_ratings')
                .where('gameId', '==', gameId)
                .where('userId', '==', userId)
                .limit(1)
                .get();

            if (!ratingQuery.empty) {
                return ratingQuery.docs[0].data().rating;
            }
            return null;
        } catch (error) {
            console.error('Erreur récupération note utilisateur:', error);
            return null;
        }
    }

    /**
     * Soumet une note pour un jeu
     */
    async submitRating(gameId, rating) {
        if (!this.isInitialized || !this.canRate()) {
            throw new Error('Vous devez être connecté pour noter un jeu');
        }

        if (rating < 1 || rating > 5) {
            throw new Error('La note doit être entre 1 et 5');
        }

        try {
            const userId = this.getUserId();
            const userName = this.currentUser.username || this.currentUser.displayName || 'Utilisateur';

            // Vérifier si l'utilisateur a déjà noté
            const existingRating = await this.db.collection('game_ratings')
                .where('gameId', '==', gameId)
                .where('userId', '==', userId)
                .limit(1)
                .get();

            if (!existingRating.empty) {
                // Mettre à jour la note existante
                const docRef = existingRating.docs[0].ref;
                await docRef.update({
                    rating: rating,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedDate: new Date().toISOString()
                });
                console.log(`✅ Note mise à jour: ${rating}/5 pour ${gameId}`);
            } else {
                // Créer une nouvelle note
                await this.db.collection('game_ratings').add({
                    gameId: gameId,
                    userId: userId,
                    userName: userName,
                    rating: rating,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdDate: new Date().toISOString()
                });
                console.log(`✅ Nouvelle note: ${rating}/5 pour ${gameId}`);
            }

            // Recalculer les statistiques du jeu
            await this.updateGameStats(gameId);

            // Invalider le cache
            this.cache.delete(`stats_${gameId}`);
            this.cache.delete(`user_rating_${gameId}_${userId}`);

            return { success: true };
        } catch (error) {
            console.error('Erreur soumission note:', error);
            throw error;
        }
    }

    /**
     * Met à jour les statistiques d'un jeu
     */
    async updateGameStats(gameId) {
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

            // Mettre à jour ou créer les statistiques du jeu
            const gameStatsRef = this.db.collection('game_statistics').doc(gameId);
            const doc = await gameStatsRef.get();

            const statsData = {
                averageRating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
                ratingCount: ratingCount,
                lastRatingUpdate: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (doc.exists) {
                await gameStatsRef.update(statsData);
            } else {
                await gameStatsRef.set({
                    gameId: gameId,
                    ...statsData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            console.log(`📊 Stats mises à jour pour ${gameId}: ${averageRating.toFixed(1)}/5 (${ratingCount} avis)`);
            return true;
        } catch (error) {
            console.error('Erreur mise à jour statistiques:', error);
            return false;
        }
    }

    /**
     * Récupère les statistiques d'un jeu
     */
    async getGameStats(gameId) {
        // Vérifier le cache
        const cacheKey = `stats_${gameId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }

        let stats = {
            gameId: gameId,
            averageRating: 0,
            ratingCount: 0,
            isDefault: true
        };

        if (this.isInitialized) {
            try {
                const doc = await this.db.collection('game_statistics').doc(gameId).get();
                
                if (doc.exists) {
                    const data = doc.data();
                    stats = {
                        gameId: gameId,
                        averageRating: data.averageRating || 0,
                        ratingCount: data.ratingCount || 0,
                        isDefault: false
                    };
                }
            } catch (error) {
                console.error('Erreur récupération statistiques:', error);
            }
        }

        // Si pas de données réelles, utiliser des valeurs par défaut attractives
        if (stats.isDefault) {
            const defaults = {
                'speed-verb-challenge': 4.8,
                'enigma-scroll': 4.7,
                'word-memory-game': 4.6,
                'memory-matrix': 4.5
            };
            stats.averageRating = defaults[gameId] || 4.5;
        }

        // Mettre en cache
        this.cache.set(cacheKey, {
            data: stats,
            timestamp: Date.now()
        });

        return stats;
    }

    /**
     * Récupère les statistiques de tous les jeux
     */
    async getAllGameStats() {
        const gameIds = ['speed-verb-challenge', 'enigma-scroll', 'word-memory-game', 'memory-matrix'];
        const allStats = {};

        for (const gameId of gameIds) {
            allStats[gameId] = await this.getGameStats(gameId);
        }

        return allStats;
    }

    /**
     * Crée l'interface de notation pour un jeu
     */
    createRatingInterface(gameId, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`Container ${containerSelector} non trouvé`);
            return;
        }

        // Vérifier si l'utilisateur peut noter
        if (!this.canRate()) {
            container.innerHTML = `
                <div class="rating-interface">
                    <p class="rating-login-message">
                        <i class="fas fa-sign-in-alt"></i>
                        Connectez-vous pour noter ce jeu
                    </p>
                </div>
            `;
            return;
        }

        // Créer l'interface de notation
        container.innerHTML = `
            <div class="rating-interface" data-game-id="${gameId}">
                <div class="rating-header">
                    <h4>Notez ce jeu</h4>
                    <p class="rating-subtitle">Votre avis compte !</p>
                </div>
                <div class="rating-stars" id="rating-stars-${gameId}">
                    ${this.generateStarsHTML(gameId)}
                </div>
                <div class="rating-labels">
                    <span class="rating-label" data-rating="1">Décevant</span>
                    <span class="rating-label" data-rating="2">Moyen</span>
                    <span class="rating-label" data-rating="3">Bien</span>
                    <span class="rating-label" data-rating="4">Très bien</span>
                    <span class="rating-label" data-rating="5">Excellent</span>
                </div>
                <button id="submit-rating-${gameId}" class="btn-submit-rating" disabled>
                    Noter le jeu
                </button>
                <div id="rating-message-${gameId}" class="rating-message" style="display: none;"></div>
            </div>
        `;

        // Initialiser les événements
        this.initializeRatingEvents(gameId);
        
        // Charger la note existante si elle existe
        this.loadExistingRating(gameId);
    }

    /**
     * Génère le HTML des étoiles
     */
    generateStarsHTML(gameId) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<i class="far fa-star rating-star" data-rating="${i}" data-game-id="${gameId}"></i>`;
        }
        return starsHTML;
    }

    /**
     * Initialise les événements de notation
     */
    initializeRatingEvents(gameId) {
        const stars = document.querySelectorAll(`[data-game-id="${gameId}"] .rating-star`);
        const submitBtn = document.getElementById(`submit-rating-${gameId}`);

        // Événements des étoiles
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.selectRating(gameId, rating);
            });

            star.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(gameId, rating);
            });
        });

        // Réinitialiser au survol des labels
        const labels = document.querySelectorAll(`[data-game-id="${gameId}"] .rating-label`);
        labels.forEach(label => {
            label.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(gameId, rating);
            });

            label.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.selectRating(gameId, rating);
            });
        });

        // Bouton soumettre
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmitRating(gameId));
        }

        // Réinitialiser quand on sort de la zone
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (ratingInterface) {
            ratingInterface.addEventListener('mouseleave', () => {
                const selectedRating = this.getSelectedRating(gameId);
                this.highlightStars(gameId, selectedRating);
            });
        }
    }

    /**
     * Sélectionne une note
     */
    selectRating(gameId, rating) {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!ratingInterface) return;

        ratingInterface.dataset.selectedRating = rating;
        this.highlightStars(gameId, rating);

        // Activer le bouton de soumission
        const submitBtn = document.getElementById(`submit-rating-${gameId}`);
        if (submitBtn) {
            submitBtn.disabled = false;
        }

        // Mettre en surbrillance le label correspondant
        const labels = ratingInterface.querySelectorAll('.rating-label');
        labels.forEach(label => {
            if (parseInt(label.dataset.rating) === rating) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
    }

    /**
     * Met en surbrillance les étoiles
     */
    highlightStars(gameId, rating) {
        const stars = document.querySelectorAll(`[data-game-id="${gameId}"] .rating-star`);
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'highlighted');
            } else {
                star.classList.remove('fas', 'highlighted');
                star.classList.add('far');
            }
        });
    }

    /**
     * Récupère la note sélectionnée
     */
    getSelectedRating(gameId) {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        return ratingInterface ? parseInt(ratingInterface.dataset.selectedRating || '0') : 0;
    }

    /**
     * Gère la soumission d'une note
     */
    async handleSubmitRating(gameId) {
        const rating = this.getSelectedRating(gameId);
        
        if (rating === 0) {
            this.showMessage(gameId, 'Veuillez sélectionner une note', 'error');
            return;
        }

        const submitBtn = document.getElementById(`submit-rating-${gameId}`);
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';
        }

        try {
            await this.submitRating(gameId, rating);
            this.showMessage(gameId, `Merci ! Vous avez noté le jeu ${rating}/5 ⭐`, 'success');
            
            // Désactiver l'interface après soumission
            setTimeout(() => {
                this.disableRatingInterface(gameId);
            }, 2000);

            // Déclencher la mise à jour des cartes de jeux
            this.triggerStatsUpdate(gameId);
            
        } catch (error) {
            this.showMessage(gameId, 'Erreur lors de l\'envoi de la note', 'error');
            console.error('Erreur soumission note:', error);
        }

        // Réactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Noter le jeu';
        }
    }

    /**
     * Charge la note existante de l'utilisateur
     */
    async loadExistingRating(gameId) {
        if (!this.canRate()) return;

        try {
            const existingRating = await this.getUserRating(gameId);
            if (existingRating) {
                this.selectRating(gameId, existingRating);
                this.disableRatingInterface(gameId, `Vous avez déjà noté ce jeu : ${existingRating}/5 ⭐`);
            }
        } catch (error) {
            console.error('Erreur chargement note existante:', error);
        }
    }

    /**
     * Désactive l'interface de notation
     */
    disableRatingInterface(gameId, message = 'Merci pour votre note !') {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!ratingInterface) return;

        const submitBtn = document.getElementById(`submit-rating-${gameId}`);
        const stars = ratingInterface.querySelectorAll('.rating-star');
        const labels = ratingInterface.querySelectorAll('.rating-label');

        // Désactiver les interactions
        stars.forEach(star => {
            star.style.pointerEvents = 'none';
            star.style.opacity = '0.7';
        });

        labels.forEach(label => {
            label.style.pointerEvents = 'none';
            label.style.opacity = '0.7';
        });

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = message;
            submitBtn.style.opacity = '0.7';
        }
    }

    /**
     * Affiche un message
     */
    showMessage(gameId, message, type = 'info') {
        const messageDiv = document.getElementById(`rating-message-${gameId}`);
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = `rating-message ${type}`;
        messageDiv.style.display = 'block';

        // Masquer après 3 secondes pour les erreurs
        if (type === 'error') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Déclenche la mise à jour des statistiques sur les cartes
     */
    triggerStatsUpdate(gameId) {
        const event = new CustomEvent('gameRatingUpdated', {
            detail: { gameId: gameId }
        });
        window.dispatchEvent(event);
        console.log(`🔄 Événement de mise à jour déclenché pour ${gameId}`);
    }

    /**
     * Met à jour l'affichage des notes sur les cartes de jeux
     */
    async updateGameCardRating(gameId) {
        const stats = await this.getGameStats(gameId);
        
        // Mettre à jour selon le jeu et la page
        if (gameId === 'speed-verb-challenge') {
            // Jeu vedette
            const featuredRating = document.querySelector('.featured-game .game-stats .game-stat:last-child span');
            if (featuredRating) {
                if (stats.ratingCount > 0) {
                    featuredRating.textContent = `${stats.averageRating}/5 ⭐ (${stats.ratingCount})`;
                } else {
                    featuredRating.textContent = `${stats.averageRating}/5 ⭐`;
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
                        } else {
                            ratingSpan.textContent = `${stats.averageRating}/5`;
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
     * Ajoute les styles CSS nécessaires
     */
    addStyles() {
        if (document.getElementById('simple-rating-styles')) return;

        const styles = `
            <style id="simple-rating-styles">
                .rating-interface {
                    background: var(--color-surface, #1e1e1e);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    text-align: center;
                }

                .rating-header h4 {
                    color: var(--color-text-primary, #ffffff);
                    margin-bottom: 0.5rem;
                    font-size: 1.2rem;
                }

                .rating-subtitle {
                    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                }

                .rating-stars {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin: 1rem 0;
                }

                .rating-star {
                    font-size: 2rem;
                    color: #555;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .rating-star:hover {
                    transform: scale(1.1);
                }

                .rating-star.highlighted {
                    color: #f39c12;
                    text-shadow: 0 0 10px rgba(243, 156, 18, 0.5);
                }

                .rating-labels {
                    display: flex;
                    justify-content: space-between;
                    margin: 1rem 0;
                    gap: 0.5rem;
                }

                .rating-label {
                    font-size: 0.8rem;
                    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    transition: all 0.2s ease;
                }

                .rating-label:hover,
                .rating-label.selected {
                    background: var(--color-primary, #2ecc71);
                    color: var(--color-background, #121212);
                }

                .btn-submit-rating {
                    background: linear-gradient(135deg, var(--color-primary, #2ecc71), var(--color-secondary, #27ae60));
                    color: var(--color-background, #121212);
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 1rem;
                }

                .btn-submit-rating:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
                }

                .btn-submit-rating:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .rating-message {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                }

                .rating-message.success {
                    background: rgba(46, 204, 113, 0.2);
                    color: var(--color-primary, #2ecc71);
                    border: 1px solid var(--color-primary, #2ecc71);
                }

                .rating-message.error {
                    background: rgba(231, 76, 60, 0.2);
                    color: #e74c3c;
                    border: 1px solid #e74c3c;
                }

                .rating-login-message {
                    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
                    font-style: italic;
                    padding: 1rem;
                }

                .rating-login-message i {
                    margin-right: 0.5rem;
                    color: var(--color-primary, #2ecc71);
                }

                @media (max-width: 768px) {
                    .rating-labels {
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                    
                    .rating-label {
                        text-align: center;
                    }
                    
                    .rating-stars {
                        gap: 0.25rem;
                    }
                    
                    .rating-star {
                        font-size: 1.5rem;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Créer une instance globale
window.simpleRatingSystem = new SimpleRatingSystem();
window.SimpleRatingSystem = window.simpleRatingSystem; // Alias avec majuscule pour compatibilité

// Initialiser automatiquement quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async () => {
    await window.simpleRatingSystem.init();
    window.simpleRatingSystem.addStyles();
    console.log('🌟 Système de notation simplifié prêt');
});

// Exporter pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleRatingSystem;
} 