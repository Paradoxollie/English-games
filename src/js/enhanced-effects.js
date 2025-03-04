/**
 * Enhanced Effects for Speed Verb Challenge
 * Adds advanced 3D effects, animations, and visual feedback
 */

// Classe principale pour les effets améliorés
class EnhancedEffects {
    constructor() {
        this.initialized = false;
        this.particleContainer = document.getElementById('particles-container');
        this.portalElement = document.getElementById('enhanced-portal');
        this.verbCard = document.getElementById('verb-card');
        this.gameButtons = document.querySelectorAll('.game-button');
        
        // Configuration des particules
        this.particleColors = {
            success: '#22c55e',
            error: '#ef4444',
            magic: '#3b82f6',
            gold: '#ffd700'
        };
        
        // Initialiser les effets
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        // Ajouter les écouteurs d'événements
        this.addEventListeners();
        
        // Initialiser les effets de base
        this.initializeBackgroundEffects();
        this.initializeButtonEffects();
        this.initializeCardEffects();
        
        // Marquer comme initialisé
        this.initialized = true;
        console.log('Enhanced effects initialized');
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
            fogLayer.style.animationDelay = `${i * 5}s`;
            fogLayer.style.animationDuration = `${30 + i * 10}s`;
            
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
        const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ'];
        const runeContainer = document.createElement('div');
        runeContainer.className = 'button-runes-container';
        
        for (let i = 0; i < 3; i++) {
            const rune = document.createElement('span');
            rune.className = 'button-rune';
            rune.textContent = runes[Math.floor(Math.random() * runes.length)];
            rune.style.animationDelay = `${i * 0.5}s`;
            runeContainer.appendChild(rune);
        }
        
        button.appendChild(runeContainer);
    }
    
    buttonHoverEffect(button) {
        // Créer un effet de particules autour du bouton
        this.createParticlesAround(button, 10, this.particleColors.magic);
        
        // Ajouter une classe pour l'animation
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
    
    // Effets de feedback
    showSuccessEffect() {
        if (!this.verbCard) return;
        
        // Ajouter une classe pour l'animation
        this.verbCard.classList.add('success-effect');
        setTimeout(() => {
            this.verbCard.classList.remove('success-effect');
        }, 1000);
        
        // Créer des particules
        this.createParticlesAround(this.verbCard, 30, this.particleColors.success);
        
        // Ajouter un flash de lumière
        this.createLightFlash(this.particleColors.success);
    }
    
    showErrorEffect() {
        if (!this.verbCard) return;
        
        // Ajouter une classe pour l'animation
        this.verbCard.classList.add('error-effect');
        setTimeout(() => {
            this.verbCard.classList.remove('error-effect');
        }, 1000);
        
        // Créer des particules
        this.createParticlesAround(this.verbCard, 15, this.particleColors.error);
        
        // Ajouter un effet de secousse à l'écran
        document.body.classList.add('screen-shake');
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 500);
    }
    
    showLevelUpEffect(level) {
        // Activer l'effet de portail
        if (this.portalElement) {
            this.portalElement.classList.add('active');
            setTimeout(() => {
                this.portalElement.classList.remove('active');
            }, 3000);
        }
        
        // Créer des particules dorées
        this.createParticlesExplosion(50, this.particleColors.gold);
        
        // Ajouter un flash de lumière
        this.createLightFlash(this.particleColors.gold);
    }
    
    showGameStartEffect() {
        // Activer l'effet de portail
        if (this.portalElement) {
            this.portalElement.classList.add('active');
            setTimeout(() => {
                this.portalElement.classList.remove('active');
            }, 2000);
        }
        
        // Créer des particules
        this.createParticlesExplosion(30, this.particleColors.magic);
    }
    
    showGameEndEffect() {
        // Créer des particules
        this.createParticlesExplosion(50, this.particleColors.gold);
        
        // Ajouter un flash de lumière
        this.createLightFlash(this.particleColors.gold);
    }
    
    // Utilitaires pour les effets
    createParticlesAround(element, count, color) {
        if (!this.particleContainer || !element) return;
        
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Position aléatoire autour de l'élément
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 20 + 10;
            const x = Math.cos(angle) * distance + rect.left + rect.width / 2;
            const y = Math.sin(angle) * distance + rect.top + rect.height / 2;
            
            // Taille et couleur
            const size = Math.random() * 6 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            
            // Position
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Animation
            particle.style.animation = `particleFade ${Math.random() * 1 + 0.5}s ease-out forwards`;
            
            // Ajouter au conteneur
            this.particleContainer.appendChild(particle);
            
            // Supprimer après l'animation
            setTimeout(() => {
                if (particle.parentNode === this.particleContainer) {
                    this.particleContainer.removeChild(particle);
                }
            }, 1500);
        }
    }
    
    createParticlesExplosion(count, color) {
        if (!this.particleContainer) return;
        
        // Position centrale
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle explosion-particle';
            
            // Taille et couleur
            const size = Math.random() * 8 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            
            // Position initiale
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            
            // Direction aléatoire
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 50;
            const destX = Math.cos(angle) * distance + centerX;
            const destY = Math.sin(angle) * distance + centerY;
            
            // Animation
            particle.animate([
                { left: `${centerX}px`, top: `${centerY}px`, opacity: 1, transform: 'scale(1)' },
                { left: `${destX}px`, top: `${destY}px`, opacity: 0, transform: 'scale(0)' }
            ], {
                duration: Math.random() * 1000 + 1000,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'forwards'
            });
            
            // Ajouter au conteneur
            this.particleContainer.appendChild(particle);
            
            // Supprimer après l'animation
            setTimeout(() => {
                if (particle.parentNode === this.particleContainer) {
                    this.particleContainer.removeChild(particle);
                }
            }, 2000);
        }
    }
    
    createLightFlash(color) {
        const flash = document.createElement('div');
        flash.className = 'light-flash';
        flash.style.backgroundColor = color;
        document.body.appendChild(flash);
        
        // Animation
        flash.animate([
            { opacity: 0 },
            { opacity: 0.3 },
            { opacity: 0 }
        ], {
            duration: 500,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        // Supprimer après l'animation
        setTimeout(() => {
            if (flash.parentNode === document.body) {
                document.body.removeChild(flash);
            }
        }, 500);
    }
}

// Initialiser les effets améliorés lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter les styles nécessaires
    addEnhancedStyles();
    
    // Créer l'instance des effets améliorés
    window.gameEffects = new EnhancedEffects();
    
    // Dispatcher des événements personnalisés pour les tests
    const testEffects = false;
    if (testEffects) {
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('correctAnswer'));
        }, 2000);
        
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('incorrectAnswer'));
        }, 4000);
        
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('levelUp', { detail: { level: 2 } }));
        }, 6000);
    }
});

// Ajouter les styles CSS nécessaires
function addEnhancedStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Styles pour les effets améliorés */
        .light-flash {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
        }
        
        .star {
            position: absolute;
            background-color: #fff;
            border-radius: 50%;
            animation: starTwinkle ease-in-out infinite;
        }
        
        @keyframes starTwinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        .fog-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 30% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 70%),
                radial-gradient(ellipse at 70% 60%, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
            animation: fogMove linear infinite;
        }
        
        @keyframes fogMove {
            0% { transform: translateX(-20%) translateY(0); }
            50% { transform: translateX(0) translateY(-10%); }
            100% { transform: translateX(20%) translateY(0); }
        }
        
        .button-glow-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: inherit;
            pointer-events: none;
            background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .button-hover-effect .button-glow-effect {
            opacity: 1;
        }
        
        .button-runes-container {
            position: absolute;
            bottom: -15px;
            left: 0;
            width: 100%;
            text-align: center;
            pointer-events: none;
        }
        
        .button-rune {
            display: inline-block;
            margin: 0 5px;
            color: var(--primary-color);
            text-shadow: 0 0 5px var(--primary-glow);
            animation: runeFloat 2s ease-in-out infinite;
        }
        
        @keyframes runeFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        
        .card-glare {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: inherit;
            pointer-events: none;
            z-index: 1;
        }
        
        .success-effect {
            animation: successPulse 1s ease-out;
        }
        
        @keyframes successPulse {
            0% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
            50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.7); }
            100% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
        }
        
        .error-effect {
            animation: errorShake 0.5s ease-in-out;
        }
        
        @keyframes errorShake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
        
        .screen-shake {
            animation: screenShakeEffect 0.5s ease-in-out;
        }
        
        @keyframes screenShakeEffect {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        
        .explosion-particle {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
        }
        
        .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            z-index: 100;
            box-shadow: 0 0 10px currentColor;
        }
    `;
    
    document.head.appendChild(styleElement);
} 