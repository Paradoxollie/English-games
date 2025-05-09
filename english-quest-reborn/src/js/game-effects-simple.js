/**
 * Effets visuels simplifiés pour le jeu Speed Verb Challenge
 * Version légère sans Three.js pour une meilleure performance
 */

class GameEffects {
    /**
     * Initialise les effets visuels
     */
    constructor() {
        console.log("Effets visuels simplifiés initialisés");
    }

    /**
     * Effet de démarrage du jeu
     */
    gameStartEffect() {
        console.log("Effet de démarrage du jeu");
        // Pas d'effet visuel complexe
    }

    /**
     * Effet de réussite
     * @param {HTMLElement} element - L'élément sur lequel appliquer l'effet
     */
    successEffect(element) {
        if (!element) return;

        element.classList.add('correct-answer');
        setTimeout(() => {
            element.classList.remove('correct-answer');
        }, 1000);
    }

    /**
     * Effet d'erreur
     * @param {HTMLElement} element - L'élément sur lequel appliquer l'effet
     */
    errorEffect(element) {
        if (!element) return;

        element.classList.add('incorrect-answer');
        setTimeout(() => {
            element.classList.remove('incorrect-answer');
        }, 1000);
    }

    /**
     * Effet de saut de verbe
     */
    skipEffect() {
        console.log("Effet de saut de verbe");
        // Pas d'effet visuel complexe
    }

    /**
     * Effet de montée de niveau
     */
    levelUpEffect() {
        const levelDisplay = document.getElementById('player-level');
        if (levelDisplay) {
            levelDisplay.classList.add('level-up-effect');
            setTimeout(() => {
                levelDisplay.classList.remove('level-up-effect');
            }, 1000);
        }
    }

    /**
     * Effet de fin de jeu
     */
    gameOverEffect() {
        console.log("Effet de fin de jeu");
        // Pas d'effet visuel complexe
    }

    /**
     * Effet de réinitialisation du jeu
     */
    resetEffect() {
        console.log("Effet de réinitialisation du jeu");
        // Pas d'effet visuel complexe
    }

    /**
     * Effet de bonus de streak
     */
    streakBonusEffect() {
        console.log("Effet de bonus de streak");

        // Créer un élément pour l'animation
        const streakBonus = document.createElement('div');
        streakBonus.className = 'streak-bonus-effect';
        streakBonus.innerHTML = '🔥 COMBO 🔥';
        document.body.appendChild(streakBonus);

        // Animer l'élément
        setTimeout(() => {
            streakBonus.classList.add('show');
        }, 10);

        // Supprimer l'élément après l'animation
        setTimeout(() => {
            streakBonus.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(streakBonus);
            }, 500);
        }, 2000);

        // Ajouter un effet de flash sur l'écran
        const flashEffect = document.createElement('div');
        flashEffect.className = 'flash-effect';
        document.body.appendChild(flashEffect);

        // Animer le flash
        setTimeout(() => {
            flashEffect.classList.add('show');
            setTimeout(() => {
                flashEffect.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(flashEffect);
                }, 300);
            }, 100);
        }, 10);
    }
}

// Rendre la classe disponible globalement
window.GameEffects = GameEffects;
