/**
 * English Quest - Nouveau design
 * Script pour les animations et interactions
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  // Désactivation des animations qui pourraient causer des problèmes
  // initAnimations();

  // Initialiser le menu mobile
  initMobileMenu();

  // Désactivation des effets de survol qui pourraient causer des problèmes
  // initHoverEffects();

  // Désactivation du chargement de progression qui pourrait causer des problèmes
  // simulateProgress();

  // Garantir que les cartes de jeu restent visibles
  ensureCardsVisibility();
});

// Fonction pour garantir que les cartes de jeu restent visibles
function ensureCardsVisibility() {
  // Sélectionner toutes les cartes de jeu
  const gameCards = document.querySelectorAll('.game-card, .featured-game');

  // Appliquer des styles pour garantir la visibilité
  gameCards.forEach(card => {
    card.style.opacity = '1';
    card.style.visibility = 'visible';
    card.style.display = 'block';
  });

  // Sélectionner toutes les images de jeu
  const gameImages = document.querySelectorAll('.game-image, .game-image img');

  // Appliquer des styles pour garantir la visibilité
  gameImages.forEach(image => {
    image.style.opacity = '1';
    image.style.visibility = 'visible';
    image.style.display = 'block';
  });
}

/**
 * Initialise les animations de base
 */
function initAnimations() {
  // Ajouter des classes d'animation aux éléments
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroButtons = document.querySelector('.hero-buttons');

  if (heroTitle) {
    heroTitle.classList.add('fade-in');
    heroTitle.style.opacity = '0';
    heroTitle.style.animation = 'fadeIn 1s ease-out forwards';
  }

  if (heroSubtitle) {
    heroSubtitle.classList.add('fade-in');
    heroSubtitle.style.opacity = '0';
    heroSubtitle.style.animation = 'fadeIn 1s ease-out 0.3s forwards';
  }

  if (heroButtons) {
    heroButtons.classList.add('fade-in');
    heroButtons.style.opacity = '0';
    heroButtons.style.animation = 'fadeIn 1s ease-out 0.6s forwards';
  }

  // Animer les cartes au défilement
  animateOnScroll('.game-card', 'fadeInUp');
  animateOnScroll('.featured-game', 'fadeInUp');
  animateOnScroll('.section-title', 'fadeIn');
  animateOnScroll('.feature-card', 'fadeInUp');
}

/**
 * Initialise le menu mobile
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');

      if (nav.classList.contains('active')) {
        nav.style.display = 'block';
        setTimeout(() => {
          nav.style.opacity = '1';
          nav.style.transform = 'translateY(0)';
        }, 10);
      } else {
        nav.style.opacity = '0';
        nav.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          nav.style.display = 'none';
        }, 300);
      }
    });
  }
}

/**
 * Initialise les effets de survol
 */
function initHoverEffects() {
  // Effet de survol pour les cartes de jeu
  const gameCards = document.querySelectorAll('.game-card');

  gameCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
      this.style.boxShadow = 'var(--shadow-lg), 0 0 20px rgba(0, 229, 255, 0.3)';
      this.style.borderColor = 'var(--color-primary)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
      this.style.borderColor = '';
    });
  });

  // Effet de survol pour les boutons
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    if (button.classList.contains('btn-primary')) {
      button.addEventListener('mouseenter', function() {
        this.style.boxShadow = 'var(--shadow-glow)';
      });

      button.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
      });
    }
  });

  // Effet de survol pour les liens de navigation
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      if (!this.classList.contains('active')) {
        this.style.color = 'var(--color-primary)';
      }
    });

    link.addEventListener('mouseleave', function() {
      if (!this.classList.contains('active')) {
        this.style.color = '';
      }
    });
  });
}

/**
 * Anime les éléments au défilement
 * @param {string} selector - Sélecteur CSS des éléments à animer
 * @param {string} animationClass - Classe d'animation à ajouter
 */
function animateOnScroll(selector, animationClass) {
  const elements = document.querySelectorAll(selector);

  if (elements.length === 0) return;

  // Créer un observateur d'intersection
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Ajouter la classe d'animation
        entry.target.classList.add(animationClass);

        // Arrêter d'observer l'élément
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
  });

  // Observer chaque élément
  elements.forEach(element => {
    element.style.opacity = '0';
    observer.observe(element);
  });
}

/**
 * Simule un chargement de progression
 */
function simulateProgress() {
  // Simuler un chargement pour la barre de progression
  const progressBar = document.getElementById('progress-bar');

  if (progressBar) {
    let width = 0;
    const interval = setInterval(() => {
      if (width >= 100) {
        clearInterval(interval);
      } else {
        width++;
        progressBar.style.width = width + '%';
      }
    }, 20);
  }
}

/**
 * Animations CSS
 */
// Fade In
function fadeIn(element, duration = 1000, delay = 0) {
  if (!element) return;

  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-out ${delay}ms`;

  setTimeout(() => {
    element.style.opacity = '1';
  }, 10);
}

// Fade In Up
function fadeInUp(element, duration = 1000, delay = 0) {
  if (!element) return;

  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`;

  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, 10);
}

// Définir les animations CSS
const animations = {
  fadeIn: {
    keyframes: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    className: 'fade-in',
    cssRule: '.fade-in { animation: fadeIn 1s ease-out forwards; }'
  },
  fadeInUp: {
    keyframes: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    className: 'fade-in-up',
    cssRule: '.fade-in-up { animation: fadeInUp 1s ease-out forwards; }'
  },
  pulse: {
    keyframes: `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `,
    className: 'pulse',
    cssRule: '.pulse { animation: pulse 2s infinite; }'
  },
  glow: {
    keyframes: `
      @keyframes glow {
        0% { box-shadow: 0 0 5px rgba(0, 229, 255, 0.5); }
        50% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.8); }
        100% { box-shadow: 0 0 5px rgba(0, 229, 255, 0.5); }
      }
    `,
    className: 'glow',
    cssRule: '.glow { animation: glow 2s infinite; }'
  }
};

// Ajouter les animations CSS au document
function addAnimationStyles() {
  let styleSheet = document.createElement('style');
  let styles = '';

  // Ajouter chaque animation
  for (const key in animations) {
    styles += animations[key].keyframes + '\n' + animations[key].cssRule + '\n';
  }

  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
