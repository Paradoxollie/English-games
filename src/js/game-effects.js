/**
 * Classe pour gérer les effets visuels du jeu Speed Verb Challenge
 */
class GameEffects {
    constructor() {
        // Éléments du DOM
        this.gameContainer = document.querySelector('.game-universe');
        this.verbCard = document.querySelector('.verb-card');
        this.gameButtons = document.querySelectorAll('.game-button');
        
        // Initialiser les effets
        this.initializeBackgroundEffects();
        this.initializeButtonEffects();
        this.initializeCardEffects();
        this.addEventListeners();
        
        console.log("Effets de jeu initialisés");
    }
    
    addEventListeners() {
        // Écouter les événements de jeu
        document.addEventListener('correctAnswer', () => this.showSuccessEffect());
        document.addEventListener('incorrectAnswer', () => this.showErrorEffect());
        document.addEventListener('levelUp', (e) => this.showLevelUpEffect(e.detail.level));
        document.addEventListener('gameStart', () => this.showGameStartEffect());
        document.addEventListener('gameEnd', () => this.showGameEndEffect());
        
        // Écouter les événements de survol pour les boutons
        this.gameButtons.forEach(button => {
            button.addEventListener('mouseenter', () => this.buttonHoverEffect(button));
            button.addEventListener('mouseleave', () => this.buttonLeaveEffect(button));
        });
    }
    
    // Effets de fond
    initializeBackgroundEffects() {
        // Créer des étoiles en arrière-plan
        this.createStarfield();
        
        // Ajouter un effet de brume animée
        this.createFogEffect();
    }
    
    createStarfield() {
        const bgScene = document.getElementById('bg-scene');
        if (!bgScene) return;
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = `${Math.random() * 2 + 1}px`;
            star.style.height = star.style.width;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.animationDuration = `${Math.random() * 5 + 5}s`;
            
            bgScene.appendChild(star);
        }
    }
    
    createFogEffect() {
        const fogElement = document.querySelector('.magic-fog');
        if (!fogElement) return;
        
        // Ajouter des couches de brume
        for (let i = 0; i < 3; i++) {
            const fogLayer = document.createElement('div');
            fogLayer.className = 'fog-layer';
            fogLayer.style.opacity = `${0.1 + i * 0.05}`;
            fogLayer.style.animationDelay = `${i * 2}s`;
            fogLayer.style.animationDuration = `${20 + i * 5}s`;
            
            fogElement.appendChild(fogLayer);
        }
    }
    
    // Effets de boutons
    initializeButtonEffects() {
        this.gameButtons.forEach(button => {
            // Ajouter un effet de lueur
            const glow = document.createElement('div');
            glow.className = 'button-glow-effect';
            button.appendChild(glow);
            
            // Ajouter des runes flottantes
            if (button.classList.contains('primary-button')) {
                this.addFloatingRunesToButton(button);
            }
        });
    }
    
    addFloatingRunesToButton(button) {
        for (let i = 0; i < 3; i++) {
            const rune = document.createElement('div');
            rune.className = 'button-rune';
            rune.style.left = `${20 + i * 25}%`;
            rune.style.animationDelay = `${i * 0.5}s`;
            button.appendChild(rune);
        }
    }
    
    buttonHoverEffect(button) {
        button.classList.add('button-hover-effect');
    }
    
    buttonLeaveEffect(button) {
        button.classList.remove('button-hover-effect');
    }
    
    // Effets de cartes
    initializeCardEffects() {
        if (!this.verbCard) return;
        
        // Désactivation de l'effet de profondeur 3D pour une meilleure expérience utilisateur
        // Les cartes restent statiques au passage de la souris
        console.log('Effets 3D des cartes désactivés pour améliorer l\'expérience utilisateur');
    }
    
    card3DEffect(e) {
        // Méthode désactivée pour éviter le mouvement des cartes
        return;
    }
    
    resetCard3DEffect() {
        // Méthode désactivée pour éviter le mouvement des cartes
        return;
    }
    
    // Effets d'événements de jeu
    successEffect(element) {
        if (!element) return;
        
        // Ajouter une classe pour l'animation
        element.classList.add('correct-answer');
        
        // Créer des particules de succès
        this.createParticles(element, 'success-particle', 15);
        
        // Jouer un son de succès si disponible
        if (window.playSound) {
            window.playSound('success');
        }
        
        // Retirer la classe après l'animation
        setTimeout(() => {
            element.classList.remove('correct-answer');
        }, 1000);
    }
    
    errorEffect(element) {
        if (!element) return;
        
        // Ajouter une classe pour l'animation
        element.classList.add('incorrect-answer');
        
        // Créer des particules d'erreur
        this.createParticles(element, 'error-particle', 10);
        
        // Jouer un son d'erreur si disponible
        if (window.playSound) {
            window.playSound('error');
        }
        
        // Retirer la classe après l'animation
        setTimeout(() => {
            element.classList.remove('incorrect-answer');
        }, 1000);
    }
    
    skipEffect() {
        const verbDisplay = document.getElementById('current-verb');
        if (!verbDisplay) return;
        
        // Ajouter une classe pour l'animation
        verbDisplay.classList.add('skip-effect');
        
        // Créer des particules de saut
        this.createParticles(verbDisplay, 'skip-particle', 8);
        
        // Jouer un son de saut si disponible
        if (window.playSound) {
            window.playSound('skip');
        }
        
        // Retirer la classe après l'animation
        setTimeout(() => {
            verbDisplay.classList.remove('skip-effect');
        }, 1000);
    }
    
    levelUpEffect() {
        const levelDisplay = document.getElementById('player-level');
        if (!levelDisplay) return;
        
        // Ajouter une classe pour l'animation
        levelDisplay.classList.add('level-up-effect');
        
        // Créer des particules de montée de niveau
        this.createParticles(levelDisplay, 'level-up-particle', 20);
        
        // Jouer un son de montée de niveau si disponible
        if (window.playSound) {
            window.playSound('levelUp');
        }
        
        // Retirer la classe après l'animation
        setTimeout(() => {
            levelDisplay.classList.remove('level-up-effect');
        }, 2000);
    }
    
    gameStartEffect() {
        const portal = document.getElementById('enhanced-portal');
        if (!portal) return;
        
        // Activer l'effet de portail
        portal.classList.add('active');
        
        // Jouer un son de démarrage si disponible
        if (window.playSound) {
            window.playSound('gameStart');
        }
        
        // Désactiver l'effet après l'animation
        setTimeout(() => {
            portal.classList.remove('active');
        }, 2000);
    }
    
    gameOverEffect() {
        const gameOverPanel = document.getElementById('game-over');
        if (!gameOverPanel) return;
        
        // Ajouter une classe pour l'animation
        gameOverPanel.classList.add('game-over-effect');
        
        // Jouer un son de fin de jeu si disponible
        if (window.playSound) {
            window.playSound('gameOver');
        }
        
        // Retirer la classe après l'animation
        setTimeout(() => {
            gameOverPanel.classList.remove('game-over-effect');
        }, 2000);
    }
    
    resetEffect() {
        const welcomeScreen = document.getElementById('welcome-screen');
        if (!welcomeScreen) return;
        
        // Ajouter une classe pour l'animation
        welcomeScreen.classList.add('reset-effect');
        
        // Jouer un son de réinitialisation si disponible
        if (window.playSound) {
            window.playSound('reset');
        }
        
        // Retirer la classe après l'animation
        setTimeout(() => {
            welcomeScreen.classList.remove('reset-effect');
        }, 1000);
    }
    
    // Utilitaires
    createParticles(element, className, count) {
        if (!element || !this.gameContainer) return;
        
        const rect = element.getBoundingClientRect();
        const containerRect = this.gameContainer.getBoundingClientRect();
        
        // Position relative à l'élément parent
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${className}`;
            
            // Position initiale
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Propriétés aléatoires
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const size = 5 + Math.random() * 10;
            const duration = 1 + Math.random() * 2;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Ajouter au conteneur
            this.gameContainer.appendChild(particle);
            
            // Animer la particule
            const animation = particle.animate(
                [
                    {
                        transform: `translate(0, 0) scale(1)`,
                        opacity: 1
                    },
                    {
                        transform: `translate(${Math.cos(angle) * speed * 50}px, ${Math.sin(angle) * speed * 50}px) scale(0)`,
                        opacity: 0
                    }
                ],
                {
                    duration: duration * 1000,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    fill: 'forwards'
                }
            );
            
            // Supprimer la particule après l'animation
            animation.onfinish = () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            };
        }
    }
}

// Rendre la classe disponible globalement
window.GameEffects = GameEffects;
