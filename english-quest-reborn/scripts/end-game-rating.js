/**
 * Composant de notation en fin de partie
 * Permet aux joueurs de noter le jeu après avoir terminé une partie
 */

class EndGameRating {
    constructor() {
        this.currentGameId = null;
        this.currentPlayerId = null;
        this.isVisible = false;
    }

    /**
     * Affiche l'interface de notation en fin de partie
     */
    async showRating(gameId, playerId = null, gameTitle = "ce jeu") {
        this.currentGameId = gameId;
        this.currentPlayerId = playerId;

        // Vérifier si le joueur a déjà noté ce jeu
        let existingRating = null;
        if (window.gameStatsService) {
            const playerRating = await window.gameStatsService.getPlayerRating(gameId, playerId);
            existingRating = playerRating;
        }

        // Créer l'interface
        this.createRatingInterface(gameTitle, existingRating);
        this.isVisible = true;
    }

    /**
     * Crée l'interface de notation
     */
    createRatingInterface(gameTitle, existingRating = null) {
        // Supprimer l'interface existante si elle existe
        this.hideRating();

        const ratingHtml = `
            <div id="end-game-rating-overlay" class="rating-overlay">
                <div class="rating-modal">
                    <div class="rating-header">
                        <h3>Comment avez-vous trouvé ${gameTitle} ?</h3>
                        ${existingRating ? `<p class="existing-rating">Votre note actuelle : ${existingRating}/5 ⭐</p>` : ''}
                        <p class="rating-subtitle">Votre avis nous aide à améliorer l'expérience !</p>
                    </div>
                    
                    <div class="rating-stars">
                        ${this.generateStarsInput()}
                    </div>
                    
                    <div class="rating-labels">
                        <span class="rating-label" data-rating="1">Décevant</span>
                        <span class="rating-label" data-rating="2">Moyen</span>
                        <span class="rating-label" data-rating="3">Bien</span>
                        <span class="rating-label" data-rating="4">Très bien</span>
                        <span class="rating-label" data-rating="5">Excellent</span>
                    </div>
                    
                    <div class="rating-actions">
                        <button id="submit-rating-btn" class="btn-submit-rating" disabled>
                            ${existingRating ? 'Modifier ma note' : 'Noter le jeu'}
                        </button>
                        <button id="skip-rating-btn" class="btn-skip-rating">
                            ${existingRating ? 'Garder ma note' : 'Passer'}
                        </button>
                    </div>
                    
                    <div id="rating-message" class="rating-message" style="display: none;"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', ratingHtml);
        
        // Ajouter les styles
        this.addStyles();
        
        // Initialiser les événements
        this.initializeEvents();
        
        // Pré-sélectionner la note existante si elle existe
        if (existingRating) {
            this.selectRating(existingRating);
        }
    }

    /**
     * Génère les étoiles interactives
     */
    generateStarsInput() {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="far fa-star rating-star" data-rating="${i}"></i>`;
        }
        return stars;
    }

    /**
     * Initialise les événements
     */
    initializeEvents() {
        const overlay = document.getElementById('end-game-rating-overlay');
        if (!overlay) return;

        // Événements des étoiles
        const stars = overlay.querySelectorAll('.rating-star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.selectRating(rating);
            });

            star.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(rating);
            });
        });

        // Réinitialiser au survol des labels
        const labels = overlay.querySelectorAll('.rating-label');
        labels.forEach(label => {
            label.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(rating);
            });

            label.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.selectRating(rating);
            });
        });

        // Réinitialiser quand on sort de la zone
        overlay.addEventListener('mouseleave', () => {
            const selectedRating = this.getSelectedRating();
            this.highlightStars(selectedRating);
        });

        // Bouton soumettre
        const submitBtn = document.getElementById('submit-rating-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitRating());
        }

        // Bouton passer
        const skipBtn = document.getElementById('skip-rating-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.hideRating());
        }

        // Fermer en cliquant sur l'overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideRating();
            }
        });

        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideRating();
            }
        });
    }

    /**
     * Sélectionne une note
     */
    selectRating(rating) {
        const overlay = document.getElementById('end-game-rating-overlay');
        if (!overlay) return;

        // Marquer la note sélectionnée
        overlay.dataset.selectedRating = rating;
        
        // Mettre à jour l'affichage
        this.highlightStars(rating);
        
        // Activer le bouton de soumission
        const submitBtn = document.getElementById('submit-rating-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }

        // Mettre en surbrillance le label correspondant
        const labels = overlay.querySelectorAll('.rating-label');
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
    highlightStars(rating) {
        const overlay = document.getElementById('end-game-rating-overlay');
        if (!overlay) return;

        const stars = overlay.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star rating-star highlighted';
            } else {
                star.className = 'far fa-star rating-star';
            }
        });
    }

    /**
     * Récupère la note sélectionnée
     */
    getSelectedRating() {
        const overlay = document.getElementById('end-game-rating-overlay');
        return overlay ? parseInt(overlay.dataset.selectedRating || 0) : 0;
    }

    /**
     * Soumet la note
     */
    async submitRating() {
        const rating = this.getSelectedRating();
        
        if (rating === 0) {
            this.showMessage('Veuillez sélectionner une note', 'error');
            return;
        }

        const submitBtn = document.getElementById('submit-rating-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';
        }

        try {
            if (window.gameStatsService) {
                const result = await window.gameStatsService.submitRating(
                    this.currentGameId, 
                    rating, 
                    this.currentPlayerId
                );
                
                if (result.success) {
                    const message = result.isUpdate 
                        ? `Note mise à jour : ${rating}/5 ⭐` 
                        : `Merci ! Vous avez noté le jeu ${rating}/5 ⭐`;
                    
                    this.showMessage(message, 'success');
                    
                    // Déclencher la mise à jour des statistiques sur la page
                    this.triggerStatsUpdate();
                    
                    // Fermer après 2 secondes
                    setTimeout(() => {
                        this.hideRating();
                    }, 2000);
                } else {
                    this.showMessage('Erreur lors de l\'envoi de la note', 'error');
                }
            } else {
                this.showMessage('Service de notation non disponible', 'error');
            }
        } catch (error) {
            console.error('Erreur soumission note:', error);
            this.showMessage('Erreur lors de l\'envoi de la note', 'error');
        }

        // Réactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Noter le jeu';
        }
    }

    /**
     * Affiche un message
     */
    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('rating-message');
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
     * Cache l'interface de notation
     */
    hideRating() {
        const overlay = document.getElementById('end-game-rating-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.isVisible = false;
        this.currentGameId = null;
        this.currentPlayerId = null;
    }

    /**
     * Déclenche la mise à jour des statistiques sur la page
     */
    triggerStatsUpdate() {
        // Émettre un événement personnalisé pour notifier la page
        const event = new CustomEvent('gameRatingUpdated', {
            detail: {
                gameId: this.currentGameId,
                playerId: this.currentPlayerId
            }
        });
        window.dispatchEvent(event);
        
        console.log('🔄 [EndGameRating] Événement de mise à jour des stats déclenché');
    }

    /**
     * Ajoute les styles CSS
     */
    addStyles() {
        if (document.getElementById('end-game-rating-styles')) return;

        const styles = `
            <style id="end-game-rating-styles">
                .rating-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                }

                .rating-modal {
                    background: var(--color-surface, #1e1e1e);
                    border-radius: 1rem;
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    animation: ratingModalAppear 0.3s ease-out;
                }

                @keyframes ratingModalAppear {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .rating-header h3 {
                    color: var(--color-text-primary, #ffffff);
                    margin-bottom: 0.5rem;
                    font-size: 1.5rem;
                }

                .existing-rating {
                    color: var(--color-primary, #2ecc71);
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .rating-subtitle {
                    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
                    margin-bottom: 2rem;
                    font-size: 0.9rem;
                }

                .rating-stars {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .rating-star {
                    font-size: 2.5rem;
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
                    margin-bottom: 2rem;
                    gap: 0.5rem;
                }

                .rating-label {
                    font-size: 0.8rem;
                    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    transition: all 0.2s ease;
                    flex: 1;
                    text-align: center;
                }

                .rating-label:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--color-text-primary, #ffffff);
                }

                .rating-label.selected {
                    background: var(--color-primary, #2ecc71);
                    color: white;
                    font-weight: 600;
                }

                .rating-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .btn-submit-rating {
                    background: var(--color-primary, #2ecc71);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    min-width: 120px;
                }

                .btn-submit-rating:hover:not(:disabled) {
                    background: var(--color-secondary, #27ae60);
                    transform: translateY(-2px);
                }

                .btn-submit-rating:disabled {
                    background: #666;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-skip-rating {
                    background: transparent;
                    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-skip-rating:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--color-text-primary, #ffffff);
                }

                .rating-message {
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .rating-message.success {
                    background: rgba(39, 174, 96, 0.2);
                    border: 1px solid #27ae60;
                    color: #27ae60;
                }

                .rating-message.error {
                    background: rgba(231, 76, 60, 0.2);
                    border: 1px solid #e74c3c;
                    color: #e74c3c;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .rating-modal {
                        padding: 1.5rem;
                        margin: 1rem;
                    }

                    .rating-stars {
                        gap: 0.25rem;
                    }

                    .rating-star {
                        font-size: 2rem;
                    }

                    .rating-labels {
                        flex-direction: column;
                        gap: 0.25rem;
                    }

                    .rating-actions {
                        flex-direction: column;
                    }

                    .btn-submit-rating,
                    .btn-skip-rating {
                        width: 100%;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Instance globale
const endGameRating = new EndGameRating();

// Export pour utilisation en module
export { endGameRating };

// Disponible globalement
window.endGameRating = endGameRating; 