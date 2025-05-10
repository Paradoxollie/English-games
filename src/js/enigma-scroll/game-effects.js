/**
 * Effets visuels et animations pour le jeu Enigma Scroll
 */

// Classe principale pour gérer les effets visuels
const GameEffects = {
  particles: [],
  leaves: [],
  initialized: false,

  /**
   * Initialise tous les effets visuels
   */
  init: function() {
    if (this.initialized) return;

    this.createForestMist();
    this.createFloatingLeaves();
    this.setupParticlesContainer();

    this.initialized = true;
    console.log('✨ Effets visuels initialisés');
  },

  /**
   * Crée l'effet de brume de forêt
   */
  createForestMist: function() {
    const mistElement = document.getElementById('forest-mist');
    if (!mistElement) return;

    // Animation de la brume
    mistElement.style.opacity = '0.4';
  },

  /**
   * Crée les feuilles flottantes
   */
  createFloatingLeaves: function() {
    const leavesContainer = document.getElementById('floating-leaves');
    if (!leavesContainer) return;

    // Créer 20 feuilles
    for (let i = 0; i < 20; i++) {
      this.createLeaf(leavesContainer);
    }
  },

  /**
   * Crée une feuille flottante
   */
  createLeaf: function(container) {
    const leaf = document.createElement('div');
    leaf.className = 'floating-leaf';

    // Propriétés aléatoires
    const size = Math.random() * 20 + 10; // 10-30px
    const posX = Math.random() * 100; // 0-100%
    const delay = Math.random() * 10; // 0-10s
    const duration = Math.random() * 10 + 15; // 15-25s

    // Appliquer les styles
    leaf.style.width = `${size}px`;
    leaf.style.height = `${size}px`;
    leaf.style.left = `${posX}%`;
    leaf.style.animationDelay = `${delay}s`;
    leaf.style.animationDuration = `${duration}s`;

    // Choisir une forme de feuille aléatoire
    const leafType = Math.floor(Math.random() * 3) + 1;
    leaf.classList.add(`leaf-type-${leafType}`);

    // Ajouter au conteneur
    container.appendChild(leaf);
    this.leaves.push(leaf);

    return leaf;
  },

  /**
   * Configure le conteneur de particules
   */
  setupParticlesContainer: function() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    // Nettoyer le conteneur
    container.innerHTML = '';
  },

  /**
   * Crée une explosion de particules à une position donnée
   */
  createParticleExplosion: function(x, y, color = '#2e7d32', count = 30) {
    const container = document.getElementById('particles-container');
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      // Position initiale
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      // Couleur
      particle.style.backgroundColor = color;

      // Taille aléatoire
      const size = Math.random() * 6 + 2; // 2-8px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Direction aléatoire
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 5 + 2; // 2-7px par frame
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      // Ajouter au DOM
      container.appendChild(particle);

      // Animer la particule
      this.animateParticle(particle, vx, vy);
    }
  },

  /**
   * Anime une particule
   */
  animateParticle: function(particle, vx, vy) {
    let x = parseInt(particle.style.left);
    let y = parseInt(particle.style.top);
    let opacity = 1;
    let gravity = 0.1;

    const animate = () => {
      // Mettre à jour la position
      x += vx;
      y += vy;
      vy += gravity; // Ajouter la gravité

      // Mettre à jour l'opacité
      opacity -= 0.02;

      // Appliquer les changements
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.opacity = opacity;

      // Continuer l'animation ou supprimer la particule
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Effet de secousse pour un élément
   */
  shakeElement: function(element, intensity = 5, duration = 500) {
    if (!element) return;

    const originalPosition = {
      x: element.offsetLeft,
      y: element.offsetTop
    };

    const startTime = Date.now();

    const shake = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < duration) {
        // Calculer le déplacement aléatoire
        const xOffset = (Math.random() - 0.5) * intensity * 2;
        const yOffset = (Math.random() - 0.5) * intensity * 2;

        // Appliquer le déplacement
        element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

        // Continuer l'animation
        requestAnimationFrame(shake);
      } else {
        // Remettre à la position d'origine
        element.style.transform = 'translate(0, 0)';
      }
    };

    requestAnimationFrame(shake);
  },

  /**
   * Effet de pulsation pour un élément
   */
  pulseElement: function(element, scale = 1.2, duration = 300) {
    if (!element) return;

    // Sauvegarder la transition originale
    const originalTransition = element.style.transition;

    // Appliquer la nouvelle transition
    element.style.transition = `transform ${duration}ms ease-in-out`;

    // Agrandir
    element.style.transform = `scale(${scale})`;

    // Revenir à la taille normale après la durée spécifiée
    setTimeout(() => {
      element.style.transform = 'scale(1)';

      // Restaurer la transition originale après l'animation
      setTimeout(() => {
        element.style.transition = originalTransition;
      }, duration);
    }, duration);
  },

  /**
   * Effet de confettis pour célébrer une victoire
   */
  celebrationEffect: function() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    // Créer des confettis à différentes positions
    const colors = ['#2e7d32', '#7b1fa2', '#1565c0', '#f9a825', '#e53935'];

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.5;
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.createParticleExplosion(x, y, color, 20);
      }, i * 300);
    }
  },

  /**
   * Effet de succès pour une lettre correcte
   */
  correctLetterEffect: function(element) {
    if (!element) return;

    // Ajouter une classe temporaire pour l'animation
    element.classList.add('correct-animation');

    // Créer des particules
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    this.createParticleExplosion(x, y, '#2e7d32', 15);

    // Retirer la classe après l'animation
    setTimeout(() => {
      element.classList.remove('correct-animation');
    }, 1000);
  },

  /**
   * Effet pour une lettre présente mais mal placée
   */
  presentLetterEffect: function(element) {
    if (!element) return;

    // Ajouter une classe temporaire pour l'animation
    element.classList.add('present-animation');

    // Créer des particules
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    this.createParticleExplosion(x, y, '#f9a825', 10);

    // Retirer la classe après l'animation
    setTimeout(() => {
      element.classList.remove('present-animation');
    }, 1000);
  },

  /**
   * Nettoie tous les effets
   */
  cleanup: function() {
    // Nettoyer les particules
    const container = document.getElementById('particles-container');
    if (container) {
      container.innerHTML = '';
    }

    // Nettoyer les feuilles
    this.leaves.forEach(leaf => leaf.remove());
    this.leaves = [];

    this.initialized = false;
  }
};

// Ajouter des styles CSS pour les effets
document.addEventListener('DOMContentLoaded', () => {
  // Créer un élément de style
  const style = document.createElement('style');

  // Définir les styles pour les particules et les feuilles
  style.textContent = `
    .particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }

    .floating-leaf {
      position: absolute;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.6;
      pointer-events: none;
      top: -30px;
      animation: leaf-fall linear infinite;
    }

    .leaf-type-1 {
      background: radial-gradient(circle at center, rgba(46, 125, 50, 0.8), rgba(46, 125, 50, 0.2));
      border-radius: 50% 20% 50% 20%;
      transform: rotate(45deg);
    }

    .leaf-type-2 {
      background: radial-gradient(circle at center, rgba(123, 31, 162, 0.8), rgba(123, 31, 162, 0.2));
      border-radius: 20% 50% 20% 50%;
      transform: rotate(-45deg);
    }

    .leaf-type-3 {
      background: radial-gradient(circle at center, rgba(21, 101, 192, 0.8), rgba(21, 101, 192, 0.2));
      border-radius: 50%;
      transform: rotate(30deg);
    }

    @keyframes leaf-fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.6;
      }
      90% {
        opacity: 0.6;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }

    .correct-animation {
      animation: correct-pulse 0.5s ease-in-out;
    }

    .present-animation {
      animation: present-pulse 0.5s ease-in-out;
    }

    @keyframes correct-pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7);
      }
      50% {
        transform: scale(1.1);
        box-shadow: 0 0 0 10px rgba(46, 125, 50, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
      }
    }

    @keyframes present-pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(249, 168, 37, 0.7);
      }
      50% {
        transform: scale(1.1);
        box-shadow: 0 0 0 10px rgba(249, 168, 37, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(249, 168, 37, 0);
      }
    }
  `;

  // Ajouter au document
  document.head.appendChild(style);
});
