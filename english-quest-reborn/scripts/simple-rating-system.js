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
            
            // Clés localStorage exactement comme dans le système d'authentification
            const LOCALSTORAGE_KEYS = {
                CURRENT_USER: 'english_quest_current_user',
                LEGACY_CURRENT_USER: 'currentUser',
                USER_ID: 'englishQuestUserId'
            };
            
            console.log('🔍 [SimpleRatingSystem] Vérification authentification...');
            
            // Méthode 1: localStorage avec nouvelle clé
            let userData = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
            if (userData && userData !== 'undefined' && userData !== 'null') {
                try {
                    user = JSON.parse(userData);
                    console.log('✅ [SimpleRatingSystem] Utilisateur trouvé via CURRENT_USER:', user.username || user.displayName || 'Utilisateur');
                } catch (e) {
                    console.warn('⚠️ [SimpleRatingSystem] Erreur parsing CURRENT_USER:', e);
                    user = null;
                }
            }
            
            // Méthode 2: localStorage avec ancienne clé
            if (!user) {
                userData = localStorage.getItem(LOCALSTORAGE_KEYS.LEGACY_CURRENT_USER);
                if (userData && userData !== 'undefined' && userData !== 'null') {
                    try {
                        user = JSON.parse(userData);
                        console.log('✅ [SimpleRatingSystem] Utilisateur trouvé via LEGACY_CURRENT_USER:', user.username || user.displayName || 'Utilisateur');
                    } catch (e) {
                        console.warn('⚠️ [SimpleRatingSystem] Erreur parsing LEGACY_CURRENT_USER:', e);
                        user = null;
                    }
                }
            }
            
            // Méthode 3: englishQuestUserId (nouvelle approche)
            if (!user) {
                const userId = localStorage.getItem(LOCALSTORAGE_KEYS.USER_ID);
                if (userId && userId !== "undefined" && userId !== "null") {
                    console.log('🔄 [SimpleRatingSystem] ID utilisateur trouvé, création objet minimal:', userId);
                    
                    // Essayer d'utiliser authService pour récupérer les données complètes
                    if (window.authService && typeof window.authService.loadUserData === 'function') {
                        console.log('🔄 [SimpleRatingSystem] Tentative récupération via authService');
                        try {
                            // Note: loadUserData est async, mais on ne peut pas await ici
                            // On crée un objet minimal pour l'instant
                            user = { 
                                uid: userId, 
                                id: userId,
                                username: `Utilisateur ${userId.substring(0, 8)}`,
                                displayName: `Utilisateur ${userId.substring(0, 8)}`
                            };
                            console.log('✅ [SimpleRatingSystem] Objet utilisateur minimal créé');
                        } catch (error) {
                            console.warn('⚠️ [SimpleRatingSystem] Erreur authService:', error);
                        }
                    } else {
                        // Créer un objet utilisateur minimal avec l'ID
                        user = { 
                            uid: userId, 
                            id: userId,
                            username: `Utilisateur ${userId.substring(0, 8)}`,
                            displayName: `Utilisateur ${userId.substring(0, 8)}`
                        };
                        console.log('✅ [SimpleRatingSystem] Objet utilisateur minimal créé (fallback)');
                    }
                }
            }
            
            // Méthode 4: authService global (fallback)
            if (!user && window.authService && window.authService.currentUser) {
                user = window.authService.currentUser;
                console.log('✅ [SimpleRatingSystem] Utilisateur trouvé via authService global');
            }
            
            // Méthode 5: Vérifier Firebase Auth directement
            if (!user && typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    const firebaseUser = firebase.auth().currentUser;
                    if (firebaseUser) {
                        user = {
                            uid: firebaseUser.uid,
                            id: firebaseUser.uid,
                            username: firebaseUser.displayName || firebaseUser.email || `Utilisateur ${firebaseUser.uid.substring(0, 8)}`,
                            displayName: firebaseUser.displayName || firebaseUser.email || `Utilisateur ${firebaseUser.uid.substring(0, 8)}`,
                            email: firebaseUser.email
                        };
                        console.log('✅ [SimpleRatingSystem] Utilisateur trouvé via Firebase Auth:', user.username);
                    }
                } catch (error) {
                    console.warn('⚠️ [SimpleRatingSystem] Erreur Firebase Auth:', error);
                }
            }
            
            if (user) {
                console.log('✅ [SimpleRatingSystem] Utilisateur final détecté:', {
                    username: user.username || user.displayName || 'Inconnu',
                    uid: user.uid || user.id || 'Pas d\'ID'
                });
            } else {
                console.log('❌ [SimpleRatingSystem] Aucun utilisateur détecté');
                
                // Debug: afficher toutes les clés localStorage pour diagnostic
                console.log('🔍 [SimpleRatingSystem] Debug localStorage:');
                Object.values(LOCALSTORAGE_KEYS).forEach(key => {
                    const value = localStorage.getItem(key);
                    console.log(`  ${key}: ${value ? 'PRÉSENT' : 'ABSENT'} (${value ? value.substring(0, 50) + '...' : 'null'})`);
                });
            }
            
            return user;
        } catch (error) {
            console.error('❌ [SimpleRatingSystem] Erreur récupération utilisateur:', error);
            return null;
        }
    }

    /**
     * Vérifie si l'utilisateur peut noter (connecté)
     */
    canRate() {
        console.log('🔍 [SimpleRatingSystem] Vérification canRate...');
        
        // Toujours récupérer l'utilisateur actuel
        this.currentUser = this.getCurrentUser();
        
        if (!this.currentUser) {
            console.log('❌ [SimpleRatingSystem] canRate: Aucun utilisateur détecté');
            return false;
        }
        
        const userId = this.currentUser.uid || this.currentUser.id;
        if (!userId) {
            console.log('❌ [SimpleRatingSystem] canRate: Utilisateur sans ID valide', this.currentUser);
            return false;
        }
        
        console.log('✅ [SimpleRatingSystem] canRate: Utilisateur peut noter', {
            username: this.currentUser.username || this.currentUser.displayName || 'Inconnu',
            userId: userId
        });
        
        return true;
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

        console.log(`🎮 [SimpleRatingSystem] Création interface pour ${gameId} dans ${containerSelector}`);
        
        // Force une nouvelle vérification de l'authentification
        console.log('🔍 [SimpleRatingSystem] Vérification authentification pour interface...');
        
        // Vérifier si l'utilisateur peut noter (avec logs détaillés)
        const canUserRate = this.canRate();
        console.log(`🔍 [SimpleRatingSystem] Résultat canRate: ${canUserRate}`);
        
        if (!canUserRate) {
            console.log('❌ [SimpleRatingSystem] Utilisateur ne peut pas noter - affichage message connexion');
            container.innerHTML = `
                <div class="rating-interface">
                    <p class="rating-login-message">
                        <i class="fas fa-sign-in-alt"></i>
                        Connectez-vous pour noter ce jeu
                    </p>
                </div>
            `;
            
            // Essayer de re-vérifier l'authentification après un délai
            setTimeout(() => {
                console.log('🔄 [SimpleRatingSystem] Re-vérification authentification après délai...');
                const canUserRateRetry = this.canRate();
                if (canUserRateRetry) {
                    console.log('✅ [SimpleRatingSystem] Authentification détectée en retry - recréation interface');
                    this.createRatingInterface(gameId, containerSelector);
                }
            }, 2000);
            
            return;
        }

        console.log('✅ [SimpleRatingSystem] Utilisateur peut noter - création interface complète');

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
        
        console.log(`✅ [SimpleRatingSystem] Interface créée avec succès pour ${gameId}`);
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
     * Gère la soumission d'une note (nouvelle ou modification)
     */
    async handleSubmitRating(gameId) {
        const rating = this.getSelectedRating(gameId);
        
        if (rating === 0) {
            this.showMessage(gameId, 'Veuillez sélectionner une note', 'error');
            return;
        }

        const submitBtn = document.getElementById(`submit-rating-${gameId}`);
        const isModification = submitBtn && submitBtn.classList.contains('btn-modify-rating');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = isModification ? 'Modification en cours...' : 'Envoi en cours...';
        }

        try {
            // Vérifier si l'utilisateur avait déjà une note
            const previousRating = await this.getUserRating(gameId);
            
            await this.submitRating(gameId, rating);
            
            if (isModification && previousRating) {
                this.showMessage(gameId, `Note modifiée avec succès : ${rating}/5 ⭐ (ancienne note : ${previousRating}/5)`, 'success');
                console.log(`✅ Note modifiée pour ${gameId}: ${previousRating}/5 → ${rating}/5`);
            } else {
                this.showMessage(gameId, `Merci ! Vous avez noté le jeu ${rating}/5 ⭐`, 'success');
                console.log(`✅ Nouvelle note pour ${gameId}: ${rating}/5`);
            }
            
            // Mettre à jour l'interface pour refléter la nouvelle note
            setTimeout(() => {
                this.updateInterfaceAfterRating(gameId, rating);
            }, 1500);

            // Déclencher la mise à jour des cartes de jeux
            this.triggerStatsUpdate(gameId);
            
        } catch (error) {
            this.showMessage(gameId, 'Erreur lors de l\'envoi de la note', 'error');
            console.error('Erreur soumission note:', error);
            
            // Réactiver le bouton en cas d'erreur
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = isModification ? 'Modifier ma note' : 'Noter le jeu';
            }
        }
    }

    /**
     * Met à jour l'interface après qu'une note ait été soumise ou modifiée
     */
    updateInterfaceAfterRating(gameId, newRating) {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!ratingInterface) return;

        // Supprimer l'ancien affichage de note actuelle s'il existe
        const oldDisplay = ratingInterface.querySelector('.current-rating-display');
        if (oldDisplay) {
            oldDisplay.remove();
        }

        // Créer le nouvel affichage
        const submitBtn = document.getElementById(`submit-rating-${gameId}`);
        const messageDiv = document.getElementById(`rating-message-${gameId}`);

        const currentRatingDisplay = document.createElement('div');
        currentRatingDisplay.className = 'current-rating-display';
        currentRatingDisplay.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <strong>Votre note actuelle :</strong>
            </div>
            <div class="rating-value">${newRating}/5 ⭐</div>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.8;">
                Vous pouvez modifier votre note ci-dessus
            </div>
        `;

        // Insérer l'affichage avant le bouton
        if (submitBtn) {
            submitBtn.parentNode.insertBefore(currentRatingDisplay, submitBtn);
            submitBtn.textContent = 'Modifier ma note';
            submitBtn.className = 'btn-modify-rating';
            submitBtn.disabled = false;
        }

        // Masquer le message après un délai
        if (messageDiv) {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 4000);
        }

        console.log(`🔄 Interface mise à jour pour ${gameId} avec la nouvelle note: ${newRating}/5`);
    }

    /**
     * Charge et affiche la note existante de l'utilisateur
     */
    async loadExistingRating(gameId) {
        if (!this.canRate()) return;

        try {
            const existingRating = await this.getUserRating(gameId);
            if (existingRating) {
                this.selectRating(gameId, existingRating);
                this.showExistingRatingInterface(gameId, existingRating);
            }
        } catch (error) {
            console.error('Erreur chargement note existante:', error);
        }
    }

    /**
     * Affiche l'interface pour une note existante avec possibilité de modification
     */
    showExistingRatingInterface(gameId, currentRating) {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!ratingInterface) return;

        const submitBtn = document.getElementById(`submit-rating-${gameId}`);
        const messageDiv = document.getElementById(`rating-message-${gameId}`);

        // Créer l'affichage de la note actuelle
        const currentRatingDisplay = document.createElement('div');
        currentRatingDisplay.className = 'current-rating-display';
        currentRatingDisplay.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <strong>Votre note actuelle :</strong>
            </div>
            <div class="rating-value">${currentRating}/5 ⭐</div>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.8;">
                Vous pouvez modifier votre note ci-dessus
            </div>
        `;

        // Insérer l'affichage avant le bouton
        if (submitBtn) {
            submitBtn.parentNode.insertBefore(currentRatingDisplay, submitBtn);
            submitBtn.textContent = 'Modifier ma note';
            submitBtn.className = 'btn-modify-rating';
        }

        // Masquer le message par défaut
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }

        // Garder les étoiles et labels interactifs pour permettre la modification
        console.log(`✅ Interface de modification affichée pour ${gameId} (note actuelle: ${currentRating}/5)`);
    }

    /**
     * Désactive l'interface de notation (utilisé seulement en cas d'erreur)
     */
    disableRatingInterface(gameId, message = 'Erreur lors du chargement') {
        const ratingInterface = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!ratingInterface) return;

        const submitBtn = document.getElementById(`submit-rating-${gameId}`);
        const stars = ratingInterface.querySelectorAll('.rating-star');
        const labels = ratingInterface.querySelectorAll('.rating-label');

        // Désactiver les interactions
        stars.forEach(star => {
            star.style.pointerEvents = 'none';
            star.style.opacity = '0.5';
        });

        labels.forEach(label => {
            label.style.pointerEvents = 'none';
            label.style.opacity = '0.5';
        });

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = message;
            submitBtn.style.opacity = '0.5';
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
                    border-radius: 0.75rem;
                    padding: 1rem;
                    margin: 0;
                    text-align: center;
                    width: 100%;
                    box-sizing: border-box;
                }

                .rating-header h4 {
                    color: var(--color-text-primary, #ffffff);
                    margin: 0 0 0.5rem 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .rating-subtitle {
                    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
                    margin: 0 0 1rem 0;
                    font-size: 0.85rem;
                }

                .rating-stars {
                    display: flex;
                    justify-content: center;
                    gap: 0.4rem;
                    margin: 1rem 0;
                    flex-wrap: wrap;
                }

                .rating-star {
                    font-size: 1.6rem;
                    color: #555;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                }

                .rating-star:hover {
                    transform: scale(1.1);
                    color: #f39c12;
                }

                .rating-star.highlighted {
                    color: #f39c12;
                    text-shadow: 0 0 8px rgba(243, 156, 18, 0.5);
                }

                .rating-star.selected {
                    color: #f39c12;
                    text-shadow: 0 0 10px rgba(243, 156, 18, 0.7);
                }

                .rating-labels {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.25rem;
                    margin: 0.75rem 0;
                }

                .rating-label {
                    font-size: 0.7rem;
                    color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
                    cursor: pointer;
                    padding: 0.2rem 0.1rem;
                    border-radius: 0.25rem;
                    transition: all 0.2s ease;
                    text-align: center;
                    line-height: 1.2;
                }

                .rating-label:hover,
                .rating-label.selected {
                    background: var(--color-primary, #2ecc71);
                    color: var(--color-background, #121212);
                    font-weight: 600;
                }

                .btn-submit-rating {
                    background: linear-gradient(135deg, var(--color-primary, #2ecc71), var(--color-secondary, #27ae60));
                    color: var(--color-background, #121212);
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.6rem 1.2rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 0.75rem;
                    font-size: 0.9rem;
                    width: 100%;
                    max-width: 200px;
                }

                .btn-submit-rating:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
                }

                .btn-submit-rating:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-modify-rating {
                    background: linear-gradient(135deg, var(--color-warning, #f39c12), var(--color-accent, #f1c40f));
                    color: var(--color-background, #121212);
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.5rem 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 0.5rem;
                    font-size: 0.85rem;
                    width: 100%;
                    max-width: 180px;
                }

                .btn-modify-rating:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
                }

                .rating-message {
                    margin-top: 0.75rem;
                    padding: 0.6rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    font-size: 0.85rem;
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
                    font-size: 0.9rem;
                }

                .rating-login-message i {
                    margin-right: 0.5rem;
                    color: var(--color-primary, #2ecc71);
                }

                .current-rating-display {
                    background: rgba(46, 204, 113, 0.1);
                    border: 1px solid var(--color-primary, #2ecc71);
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    margin: 0.75rem 0;
                    font-size: 0.9rem;
                }

                .current-rating-display .rating-value {
                    color: var(--color-primary, #2ecc71);
                    font-weight: bold;
                    font-size: 1.1rem;
                }

                /* Responsive pour sidebar étroite */
                @media (max-width: 1200px) {
                    .rating-interface {
                        padding: 0.8rem;
                    }
                    
                    .rating-stars {
                        gap: 0.3rem;
                    }
                    
                    .rating-star {
                        font-size: 1.4rem;
                    }
                    
                    .rating-labels {
                        grid-template-columns: repeat(5, 1fr);
                        gap: 0.2rem;
                    }
                    
                    .rating-label {
                        font-size: 0.65rem;
                        padding: 0.15rem 0.05rem;
                    }
                }

                @media (max-width: 768px) {
                    .rating-interface {
                        padding: 1rem;
                    }
                    
                    .rating-labels {
                        grid-template-columns: 1fr;
                        gap: 0.3rem;
                    }
                    
                    .rating-label {
                        font-size: 0.8rem;
                        padding: 0.3rem;
                    }
                    
                    .rating-stars {
                        gap: 0.4rem;
                    }
                    
                    .rating-star {
                        font-size: 1.8rem;
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

// Fonction d'initialisation automatique pour les jeux
async function autoInitializeRatingSystem() {
    try {
        console.log('🌟 [SimpleRatingSystem] Initialisation automatique...');
        
        // Attendre que Firebase soit prêt
        await window.simpleRatingSystem.init();
        window.simpleRatingSystem.addStyles();
        
        // Attendre que l'authentification soit complètement chargée
        console.log('🔐 [SimpleRatingSystem] Attente de l\'authentification...');
        await waitForAuthentication();
        
        // Détecter le jeu actuel depuis l'URL ou le titre
        const currentPath = window.location.pathname;
        let gameId = null;
        let containerId = null;
        
        if (currentPath.includes('enigma-scroll')) {
            gameId = 'enigma-scroll';
            containerId = '#enigma-scroll-rating-container';
        } else if (currentPath.includes('speed-verb-challenge')) {
            gameId = 'speed-verb-challenge';
            containerId = '#speed-verb-challenge-rating-container';
        }
        
        // Si on a détecté un jeu, créer l'interface
        if (gameId && containerId) {
            console.log(`🎮 [SimpleRatingSystem] Jeu détecté: ${gameId}`);
            
            // Attendre que le conteneur soit disponible
            const waitForContainer = () => {
                return new Promise((resolve) => {
                    const checkContainer = () => {
                        const container = document.querySelector(containerId);
                        if (container) {
                            resolve(container);
                        } else {
                            setTimeout(checkContainer, 100);
                        }
                    };
                    checkContainer();
                });
            };
            
            await waitForContainer();
            console.log(`📦 [SimpleRatingSystem] Conteneur trouvé: ${containerId}`);
            
            // Créer l'interface de notation
            window.simpleRatingSystem.createRatingInterface(gameId, containerId);
            console.log(`✅ [SimpleRatingSystem] Interface créée pour ${gameId}`);
        } else {
            console.log('ℹ️ [SimpleRatingSystem] Aucun jeu détecté sur cette page');
        }
        
        console.log('🌟 [SimpleRatingSystem] Système de notation simplifié prêt');
        
    } catch (error) {
        console.error('❌ [SimpleRatingSystem] Erreur lors de l\'initialisation:', error);
    }
}

// Fonction pour attendre que l'authentification soit chargée
function waitForAuthentication() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 30; // 15 secondes maximum
        
        const checkAuth = () => {
            attempts++;
            
            console.log(`🔄 [SimpleRatingSystem] Vérification authentification (${attempts}/${maxAttempts})...`);
            
            // Vérifier si authService est complètement initialisé
            let authServiceReady = false;
            if (window.authService) {
                try {
                    const currentUser = window.authService.getCurrentUser();
                    if (currentUser && (currentUser.uid || currentUser.id)) {
                        console.log('✅ [SimpleRatingSystem] AuthService utilisateur détecté:', currentUser.username || currentUser.displayName || 'Utilisateur');
                        authServiceReady = true;
                    }
                } catch (error) {
                    console.log('⚠️ [SimpleRatingSystem] Erreur authService:', error);
                }
            }
            
            // Vérifier localStorage comme fallback
            let localStorageAuth = false;
            const userData = localStorage.getItem('english_quest_current_user') ||
                           localStorage.getItem('currentUser') ||
                           localStorage.getItem('englishQuestUserId');
            
            if (userData && userData !== 'undefined' && userData !== 'null') {
                console.log('✅ [SimpleRatingSystem] Données localStorage détectées');
                localStorageAuth = true;
            }
            
            // Vérifier Firebase Auth directement
            let firebaseAuthReady = false;
            if (typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    const firebaseUser = firebase.auth().currentUser;
                    if (firebaseUser) {
                        console.log('✅ [SimpleRatingSystem] Firebase Auth utilisateur détecté:', firebaseUser.displayName || firebaseUser.email);
                        firebaseAuthReady = true;
                    }
                } catch (error) {
                    console.log('⚠️ [SimpleRatingSystem] Erreur Firebase Auth:', error);
                }
            }
            
            const hasAuth = authServiceReady || localStorageAuth || firebaseAuthReady;
            
            if (hasAuth) {
                console.log('✅ [SimpleRatingSystem] Authentification confirmée - création interface');
                // Attendre encore un peu pour que tout soit stable
                setTimeout(resolve, 500);
            } else if (attempts >= maxAttempts) {
                console.log('⏰ [SimpleRatingSystem] Timeout authentification - continuation sans utilisateur');
                resolve();
            } else {
                setTimeout(checkAuth, 500);
            }
        };
        
        checkAuth();
    });
}

// Initialiser automatiquement quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitializeRatingSystem);
} else {
    // Le DOM est déjà prêt
    autoInitializeRatingSystem();
}

// Exporter pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleRatingSystem;
} 