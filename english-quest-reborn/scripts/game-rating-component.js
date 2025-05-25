/**
 * Composant de notation pour les jeux
 * Permet aux utilisateurs de noter les jeux directement depuis les cartes
 */

class GameRatingComponent {
    constructor() {
        this.ratings = new Map(); // Cache des notes soumises
    }

    /**
     * Crée l'interface de notation pour un jeu
     */
    createRatingInterface(gameId, currentRating = 0, ratingCount = 0) {
        const ratingHtml = `
            <div class="game-rating-interface" data-game-id="${gameId}">
                <div class="rating-display">
                    <div class="stars-display">
                        ${this.generateStarsDisplay(currentRating)}
                    </div>
                    <span class="rating-text">${currentRating > 0 ? currentRating.toFixed(1) : '0'}/5</span>
                    <span class="rating-count">(${ratingCount})</span>
                </div>
                <div class="rating-input" style="display: none;">
                    <div class="stars-input">
                        ${this.generateStarsInput(gameId)}
                    </div>
                    <div class="rating-actions">
                        <button class="btn-submit-rating" data-game-id="${gameId}">✓</button>
                        <button class="btn-cancel-rating" data-game-id="${gameId}">✕</button>
                    </div>
                </div>
                <button class="btn-rate-game" data-game-id="${gameId}">
                    <i class="fas fa-star"></i> Noter
                </button>
            </div>
        `;
        return ratingHtml;
    }

    /**
     * Génère l'affichage des étoiles (lecture seule)
     */
    generateStarsDisplay(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star star-filled"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt star-half"></i>';
            } else {
                stars += '<i class="far fa-star star-empty"></i>';
            }
        }
        return stars;
    }

    /**
     * Génère les étoiles interactives pour la notation
     */
    generateStarsInput(gameId) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="far fa-star star-input" data-rating="${i}" data-game-id="${gameId}"></i>`;
        }
        return stars;
    }

    /**
     * Initialise les événements pour toutes les interfaces de notation
     */
    initializeEvents() {
        document.addEventListener('click', (e) => {
            // Bouton "Noter ce jeu"
            if (e.target.closest('.btn-rate-game')) {
                const gameId = e.target.closest('.btn-rate-game').dataset.gameId;
                this.showRatingInput(gameId);
            }

            // Étoiles de notation
            if (e.target.classList.contains('star-input')) {
                const rating = parseInt(e.target.dataset.rating);
                const gameId = e.target.dataset.gameId;
                this.highlightStars(gameId, rating);
            }

            // Bouton soumettre
            if (e.target.closest('.btn-submit-rating')) {
                const gameId = e.target.closest('.btn-submit-rating').dataset.gameId;
                this.submitRating(gameId);
            }

            // Bouton annuler
            if (e.target.closest('.btn-cancel-rating')) {
                const gameId = e.target.closest('.btn-cancel-rating').dataset.gameId;
                this.hideRatingInput(gameId);
            }
        });

        // Survol des étoiles
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('star-input')) {
                const rating = parseInt(e.target.dataset.rating);
                const gameId = e.target.dataset.gameId;
                this.highlightStars(gameId, rating);
            }
        });

        // Sortie de survol
        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('star-input')) {
                const gameId = e.target.dataset.gameId;
                const selectedRating = this.getSelectedRating(gameId);
                this.highlightStars(gameId, selectedRating);
            }
        });
    }

    /**
     * Affiche l'interface de notation
     */
    showRatingInput(gameId) {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (ratingInterface) {
            ratingInterface.querySelector('.rating-display').style.display = 'none';
            ratingInterface.querySelector('.btn-rate-game').style.display = 'none';
            ratingInterface.querySelector('.rating-input').style.display = 'block';
        }
    }

    /**
     * Cache l'interface de notation
     */
    hideRatingInput(gameId) {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (ratingInterface) {
            ratingInterface.querySelector('.rating-display').style.display = 'block';
            ratingInterface.querySelector('.btn-rate-game').style.display = 'block';
            ratingInterface.querySelector('.rating-input').style.display = 'none';
            this.resetStars(gameId);
        }
    }

    /**
     * Met en surbrillance les étoiles
     */
    highlightStars(gameId, rating) {
        const stars = document.querySelectorAll(`[data-game-id="${gameId}"] .star-input`);
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star star-input star-highlighted';
            } else {
                star.className = 'far fa-star star-input';
            }
        });
        
        // Stocker la note sélectionnée
        this.setSelectedRating(gameId, rating);
    }

    /**
     * Remet à zéro les étoiles
     */
    resetStars(gameId) {
        const stars = document.querySelectorAll(`[data-game-id="${gameId}"] .star-input`);
        stars.forEach(star => {
            star.className = 'far fa-star star-input';
        });
        this.setSelectedRating(gameId, 0);
    }

    /**
     * Stocke la note sélectionnée
     */
    setSelectedRating(gameId, rating) {
        this.ratings.set(gameId, rating);
    }

    /**
     * Récupère la note sélectionnée
     */
    getSelectedRating(gameId) {
        return this.ratings.get(gameId) || 0;
    }

    /**
     * Soumet la note
     */
    async submitRating(gameId) {
        const rating = this.getSelectedRating(gameId);
        
        if (rating === 0) {
            this.showMessage(gameId, 'Veuillez sélectionner une note', 'error');
            return;
        }

        try {
            let playerId = null;
            if (window.authService && window.authService.currentUser) {
                playerId = window.authService.currentUser.uid || window.authService.currentUser.id;
            }

            if (window.gameStatsService) {
                const success = await window.gameStatsService.submitRating(gameId, rating, playerId);
                
                if (success) {
                    this.showMessage(gameId, `Merci ! Vous avez noté le jeu ${rating}/5 ⭐`, 'success');
                    this.hideRatingInput(gameId);
                    
                    // Mettre à jour l'affichage après un délai
                    setTimeout(() => {
                        this.updateGameRatingDisplay(gameId);
                    }, 1000);
                } else {
                    this.showMessage(gameId, 'Erreur lors de l\'envoi de la note', 'error');
                }
            } else {
                this.showMessage(gameId, 'Service de notation non disponible', 'error');
            }
        } catch (error) {
            console.error('Erreur soumission note:', error);
            this.showMessage(gameId, 'Erreur lors de l\'envoi de la note', 'error');
        }
    }

    /**
     * Affiche un message temporaire
     */
    showMessage(gameId, message, type = 'info') {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!ratingInterface) return;

        // Supprimer les anciens messages
        const existingMessage = ratingInterface.querySelector('.rating-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Créer le nouveau message
        const messageDiv = document.createElement('div');
        messageDiv.className = `rating-message rating-message-${type}`;
        messageDiv.textContent = message;
        
        ratingInterface.appendChild(messageDiv);

        // Supprimer le message après 3 secondes
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    /**
     * Met à jour l'affichage de la note d'un jeu
     */
    async updateGameRatingDisplay(gameId) {
        if (!window.gameStatsService) return;

        try {
            const stats = await window.gameStatsService.getGameStats(gameId);
            const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
            
            if (ratingInterface) {
                const starsDisplay = ratingInterface.querySelector('.stars-display');
                const ratingText = ratingInterface.querySelector('.rating-text');
                const ratingCount = ratingInterface.querySelector('.rating-count');
                
                if (starsDisplay) {
                    starsDisplay.innerHTML = this.generateStarsDisplay(stats.averageRating);
                }
                if (ratingText) {
                    ratingText.textContent = `${stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'Pas de note'}/5`;
                }
                if (ratingCount) {
                    ratingCount.textContent = `(${stats.ratingCount} avis)`;
                }
            }
        } catch (error) {
            console.error('Erreur mise à jour affichage note:', error);
        }
    }

    /**
     * Ajoute les styles CSS nécessaires
     */
    addStyles() {
        if (document.getElementById('game-rating-styles')) return;

        const styles = `
            <style id="game-rating-styles">
                .game-rating-interface {
                    margin-top: 0.5rem;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 0.375rem;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    font-size: 0.85rem;
                }

                .rating-display {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.25rem;
                    margin-bottom: 0.375rem;
                    flex-wrap: wrap;
                }

                .stars-display, .stars-input {
                    display: flex;
                    gap: 0.1rem;
                }

                .stars-display i, .stars-input i {
                    font-size: 0.9rem;
                }

                .star-filled {
                    color: #f39c12;
                }

                .star-half {
                    color: #f39c12;
                }

                .star-empty {
                    color: #555;
                }

                .star-input {
                    cursor: pointer;
                    transition: color 0.2s ease;
                    font-size: 1rem;
                }

                .star-input:hover {
                    color: #f39c12;
                }

                .star-highlighted {
                    color: #f39c12 !important;
                }

                .rating-text {
                    font-weight: 600;
                    color: var(--color-text-primary);
                    font-size: 0.8rem;
                    white-space: nowrap;
                }

                .rating-count {
                    font-size: 0.75rem;
                    color: var(--color-text-secondary);
                    opacity: 0.8;
                }

                .rating-input {
                    text-align: center;
                }

                .rating-actions {
                    display: flex;
                    gap: 0.375rem;
                    justify-content: center;
                    margin-top: 0.5rem;
                }

                .btn-submit-rating, .btn-cancel-rating {
                    padding: 0.25rem 0.5rem;
                    border: none;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    min-width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-submit-rating {
                    background: var(--color-primary);
                    color: white;
                }

                .btn-submit-rating:hover {
                    background: var(--color-secondary);
                }

                .btn-cancel-rating {
                    background: transparent;
                    color: var(--color-text-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .btn-cancel-rating:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .btn-rate-game {
                    width: 100%;
                    padding: 0.375rem 0.5rem;
                    background: transparent;
                    border: 1px solid var(--color-primary);
                    color: var(--color-primary);
                    border-radius: 0.25rem;
                    cursor: pointer;
                    font-size: 0.75rem;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                    font-weight: 500;
                }

                .btn-rate-game:hover {
                    background: rgba(243, 156, 18, 0.1);
                    border-color: var(--color-secondary);
                }

                .rating-message {
                    margin-top: 0.375rem;
                    padding: 0.375rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    text-align: center;
                    line-height: 1.2;
                }

                .rating-message-success {
                    background: rgba(39, 174, 96, 0.2);
                    border: 1px solid #27ae60;
                    color: #27ae60;
                }

                .rating-message-error {
                    background: rgba(231, 76, 60, 0.2);
                    border: 1px solid #e74c3c;
                    color: #e74c3c;
                }

                /* Responsive pour mobile */
                @media (max-width: 768px) {
                    .game-rating-interface {
                        padding: 0.375rem;
                        margin-top: 0.375rem;
                    }

                    .rating-display {
                        font-size: 0.8rem;
                        gap: 0.2rem;
                    }

                    .stars-display i, .stars-input i {
                        font-size: 0.85rem;
                    }

                    .rating-text {
                        font-size: 0.75rem;
                    }

                    .rating-count {
                        font-size: 0.7rem;
                    }

                    .btn-rate-game {
                        font-size: 0.7rem;
                        padding: 0.3rem 0.4rem;
                    }

                    .btn-submit-rating, .btn-cancel-rating {
                        min-width: 24px;
                        height: 24px;
                        font-size: 0.75rem;
                    }
                }

                /* Styles spéciaux pour les cartes featured */
                .featured-game .game-rating-interface {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Instance globale
const gameRatingComponent = new GameRatingComponent();

// Export pour utilisation en module
export { gameRatingComponent };

// Disponible globalement
window.gameRatingComponent = gameRatingComponent; 