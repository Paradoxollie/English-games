class AccessibilityManager {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupARIA();
        this.setupReducedMotion();
    }

    setupKeyboardNavigation() {
        // Gestion de la navigation au clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
    }

    setupARIA() {
        // Ajouter des rôles ARIA
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.classList.contains('active')) {
                link.setAttribute('aria-current', 'page');
            }
        });

        document.querySelectorAll('.game-card').forEach((card, index) => {
            card.setAttribute('role', 'article');
            card.setAttribute('aria-labelledby', `game-title-${index}`);
        });
    }

    setupReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-duration', '0.001s');
        }
    }
}

// Rendre la classe disponible globalement
window.AccessibilityManager = AccessibilityManager; 