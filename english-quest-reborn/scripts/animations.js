/**
 * English Quest - Animations
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les animations
  initAnimations();
});

/**
 * Initialise les animations
 */
function initAnimations() {
  // Créer des particules
  createParticles();
  
  // Animer le texte du héros
  animateHeroText();
  
  // Animer les décorations
  animateDecorations();
}

/**
 * Crée des particules flottantes
 */
function createParticles() {
  const particlesOverlay = document.querySelector('.particles-overlay');
  
  if (!particlesOverlay) return;
  
  // Nombre de particules
  const particleCount = 50;
  
  // Créer les particules
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Taille aléatoire
    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Position aléatoire
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    
    // Opacité aléatoire
    const opacity = Math.random() * 0.5 + 0.1;
    particle.style.opacity = opacity;
    
    // Durée d'animation aléatoire
    const duration = Math.random() * 20 + 10;
    particle.style.animationDuration = `${duration}s`;
    
    // Délai d'animation aléatoire
    const delay = Math.random() * 5;
    particle.style.animationDelay = `${delay}s`;
    
    // Ajouter la particule
    particlesOverlay.appendChild(particle);
  }
}

/**
 * Anime le texte du héros
 */
function animateHeroText() {
  const heroTitle = document.querySelector('.hero-title-main');
  const heroSubtitle = document.querySelector('.hero-title-sub');
  const heroDescription = document.querySelector('.hero-description');
  const heroActions = document.querySelector('.hero-actions');
  
  if (heroTitle) {
    heroTitle.classList.add('fade-in-down');
  }
  
  if (heroSubtitle) {
    setTimeout(() => {
      heroSubtitle.classList.add('fade-in-down');
    }, 300);
  }
  
  if (heroDescription) {
    setTimeout(() => {
      heroDescription.classList.add('fade-in');
    }, 600);
  }
  
  if (heroActions) {
    setTimeout(() => {
      heroActions.classList.add('fade-in-up');
    }, 900);
  }
}

/**
 * Anime les décorations
 */
function animateDecorations() {
  const decorations = document.querySelectorAll('.hero-decoration');
  
  if (decorations.length > 0) {
    decorations.forEach(decoration => {
      decoration.classList.add('fade-in');
    });
  }
}

/**
 * Effet de parallaxe pour le fond
 */
window.addEventListener('scroll', function() {
  const scrollPosition = window.scrollY;
  
  // Parallaxe pour le fond
  document.body.style.backgroundPosition = `center ${scrollPosition * 0.05}px`;
  
  // Parallaxe pour les décorations
  const decorations = document.querySelectorAll('.hero-decoration');
  if (decorations.length > 0) {
    decorations.forEach(decoration => {
      const speed = decoration.classList.contains('hero-decoration-left') ? 0.1 : -0.1;
      decoration.style.transform = `translateY(${scrollPosition * speed}px)`;
    });
  }
});

/**
 * Animation au survol des boutons
 */
const buttons = document.querySelectorAll('.btn');
if (buttons.length > 0) {
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.classList.add('pulse');
    });
    
    button.addEventListener('mouseleave', function() {
      this.classList.remove('pulse');
    });
  });
}

/**
 * Animation au survol des cartes
 */
const cards = document.querySelectorAll('.game-card, .course-card, .feature-card');
if (cards.length > 0) {
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('glow');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('glow');
    });
  });
}
