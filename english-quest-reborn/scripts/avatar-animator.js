/**
 * English Quest - Avatar Animator System
 * Système d'animation d'avatars 2.5D sans coût
 * Animations CSS + JavaScript avancées
 */

class AvatarAnimator {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      enableIdle: true,
      enableEmotions: true,
      enableParticles: true,
      enableMiniMode: false,
      animationSpeed: 1,
      ...options
    };
    
    this.currentEmotion = 'idle';
    this.isAnimating = false;
    this.idleTimer = null;
    this.blinkTimer = null;
    this.breathTimer = null;
    
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.error('Avatar container not found');
      return;
    }
    
    // Ajouter les classes CSS nécessaires
    this.container.classList.add('avatar-animated');
    if (this.options.enableMiniMode) {
      this.container.classList.add('avatar-mini');
    }
    
    // Créer la structure d'animation
    this.createAnimationStructure();
    
    // Démarrer les animations idle
    if (this.options.enableIdle) {
      this.startIdleAnimations();
    }
    
    // Initialiser les effets de particules
    if (this.options.enableParticles) {
      this.initParticleSystem();
    }
    
    console.log('🎭 Avatar Animator initialized');
  }
  
  createAnimationStructure() {
    // Envelopper les éléments existants pour les animations
    const head = this.container.querySelector('.avatar-head, #userAvatarHead');
    const body = this.container.querySelector('.avatar-body, #userAvatarBody');
    const accessory = this.container.querySelector('.avatar-accessory, #userAvatarAccessory');
    
    if (head) {
      this.wrapElement(head, 'head');
    }
    if (body) {
      this.wrapElement(body, 'body');
    }
    if (accessory) {
      this.wrapElement(accessory, 'accessory');
    }
    
    // Créer l'overlay d'émotions
    this.createEmotionOverlay();
    
    // Créer le conteneur de particules
    this.createParticleContainer();
  }
  
  wrapElement(element, type) {
    const wrapper = document.createElement('div');
    wrapper.className = `avatar-${type}-wrapper avatar-animatable`;
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    
    // Ajouter les propriétés d'animation
    wrapper.style.transform = 'translateZ(0)'; // Force hardware acceleration
    wrapper.style.willChange = 'transform';
  }
  
  createEmotionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'avatar-emotion-overlay';
    overlay.innerHTML = `
      <div class="emotion-bubble">
        <div class="emotion-icon">😊</div>
      </div>
      <div class="emotion-sparkles">
        <div class="sparkle"></div>
        <div class="sparkle"></div>
        <div class="sparkle"></div>
      </div>
    `;
    this.container.appendChild(overlay);
    this.emotionOverlay = overlay;
  }
  
  createParticleContainer() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'avatar-particles';
    this.container.appendChild(particleContainer);
    this.particleContainer = particleContainer;
  }
  
  startIdleAnimations() {
    this.startBreathing();
    this.startBlinking();
    this.startIdleMovements();
  }
  
  startBreathing() {
    const body = this.container.querySelector('.avatar-body-wrapper, .avatar-body, #userAvatarBody');
    if (body) {
      body.classList.add('breathing');
    }
  }
  
  startBlinking() {
    const head = this.container.querySelector('.avatar-head-wrapper, .avatar-head, #userAvatarHead');
    if (!head) return;
    
    const blink = () => {
      if (this.currentEmotion === 'idle' && !this.isAnimating) {
        head.classList.add('blinking');
        setTimeout(() => head.classList.remove('blinking'), 150);
      }
      
      // Prochain clignement dans 2-6 secondes
      this.blinkTimer = setTimeout(blink, 2000 + Math.random() * 4000);
    };
    
    blink();
  }
  
  startIdleMovements() {
    const container = this.container;
    
    const idleMove = () => {
      if (this.currentEmotion === 'idle' && !this.isAnimating) {
        const movements = ['sway-left', 'sway-right', 'nod', 'slight-turn'];
        const movement = movements[Math.floor(Math.random() * movements.length)];
        
        container.classList.add(`idle-${movement}`);
        setTimeout(() => container.classList.remove(`idle-${movement}`), 1000);
      }
      
      // Prochain mouvement dans 5-10 secondes
      this.idleTimer = setTimeout(idleMove, 5000 + Math.random() * 5000);
    };
    
    idleMove();
  }
  
  // Système d'émotions
  playEmotion(emotion, duration = 3000, options = {}) {
    if (this.isAnimating && !options.force) return;
    
    console.log(`🎭 Playing emotion: ${emotion}`);
    
    this.isAnimating = true;
    this.currentEmotion = emotion;
    
    // Nettoyer les animations précédentes
    this.clearCurrentAnimations();
    
    // Appliquer la nouvelle émotion
    this.container.classList.add(`emotion-${emotion}`);
    
    // Afficher l'icône d'émotion
    this.showEmotionIcon(emotion);
    
    // Ajouter des particules si nécessaire
    if (this.options.enableParticles) {
      this.triggerEmotionParticles(emotion);
    }
    
    // Retour à l'idle après la durée
    setTimeout(() => {
      this.container.classList.remove(`emotion-${emotion}`);
      this.hideEmotionIcon();
      this.currentEmotion = 'idle';
      this.isAnimating = false;
    }, duration);
  }
  
  showEmotionIcon(emotion) {
    const emotionIcons = {
      happy: '😊',
      excited: '🤩',
      celebrating: '🎉',
      thinking: '🤔',
      surprised: '😲',
      sad: '😢',
      confused: '😕',
      angry: '😠',
      love: '😍',
      sleepy: '😴'
    };
    
    const bubble = this.emotionOverlay.querySelector('.emotion-bubble');
    const icon = this.emotionOverlay.querySelector('.emotion-icon');
    
    icon.textContent = emotionIcons[emotion] || '😊';
    bubble.classList.add('show');
    
    setTimeout(() => bubble.classList.remove('show'), 2000);
  }
  
  hideEmotionIcon() {
    const bubble = this.emotionOverlay.querySelector('.emotion-bubble');
    bubble.classList.remove('show');
  }
  
  triggerEmotionParticles(emotion) {
    const particleConfigs = {
      happy: { color: '#FFD700', count: 8, type: 'hearts' },
      excited: { color: '#FF6B6B', count: 12, type: 'stars' },
      celebrating: { color: '#4ECDC4', count: 15, type: 'confetti' },
      thinking: { color: '#95E1D3', count: 5, type: 'bubbles' }
    };
    
    const config = particleConfigs[emotion] || particleConfigs.happy;
    this.createParticles(config);
  }
  
  createParticles(config) {
    for (let i = 0; i < config.count; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = `particle particle-${config.type}`;
        particle.style.setProperty('--particle-color', config.color);
        
        // Position aléatoire autour de l'avatar
        const angle = (Math.PI * 2 * i) / config.count;
        const radius = 30 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        particle.style.setProperty('--start-x', `${x}px`);
        particle.style.setProperty('--start-y', `${y}px`);
        
        this.particleContainer.appendChild(particle);
        
        // Supprimer après l'animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 2000);
      }, i * 100);
    }
  }
  
  clearCurrentAnimations() {
    const emotionClasses = [
      'emotion-happy', 'emotion-excited', 'emotion-celebrating',
      'emotion-thinking', 'emotion-surprised', 'emotion-sad',
      'emotion-confused', 'emotion-angry', 'emotion-love', 'emotion-sleepy'
    ];
    
    emotionClasses.forEach(cls => {
      this.container.classList.remove(cls);
    });
  }
  
  // Méthodes pour intégration dans les jeux
  onGameEvent(eventType, data = {}) {
    switch (eventType) {
      case 'correct_answer':
        this.playEmotion('happy', 2000);
        break;
      case 'wrong_answer':
        this.playEmotion('sad', 1500);
        break;
      case 'level_up':
        this.playEmotion('celebrating', 4000);
        break;
      case 'thinking':
        this.playEmotion('thinking', 3000);
        break;
      case 'game_start':
        this.playEmotion('excited', 2000);
        break;
      case 'game_win':
        this.playEmotion('celebrating', 5000);
        break;
      case 'surprise':
        this.playEmotion('surprised', 2000);
        break;
    }
  }
  
  // Méthodes utilitaires
  setAnimationSpeed(speed) {
    this.options.animationSpeed = speed;
    this.container.style.setProperty('--animation-speed', speed);
  }
  
  enableMiniMode() {
    this.container.classList.add('avatar-mini');
    this.options.enableMiniMode = true;
  }
  
  disableMiniMode() {
    this.container.classList.remove('avatar-mini');
    this.options.enableMiniMode = false;
  }
  
  pause() {
    this.container.classList.add('avatar-paused');
    clearTimeout(this.idleTimer);
    clearTimeout(this.blinkTimer);
  }
  
  resume() {
    this.container.classList.remove('avatar-paused');
    if (this.options.enableIdle) {
      this.startIdleAnimations();
    }
  }
  
  destroy() {
    this.pause();
    // Nettoyer les éléments ajoutés
    const overlay = this.container.querySelector('.avatar-emotion-overlay');
    const particles = this.container.querySelector('.avatar-particles');
    
    if (overlay) overlay.remove();
    if (particles) particles.remove();
    
    // Supprimer les classes
    this.container.classList.remove('avatar-animated', 'avatar-mini');
    
    console.log('🎭 Avatar Animator destroyed');
  }
}

// Gestionnaire global d'avatars
class AvatarManager {
  constructor() {
    this.avatars = new Map();
    this.globalOptions = {
      enableIdle: true,
      enableEmotions: true,
      enableParticles: true
    };
  }
  
  createAvatar(selector, options = {}) {
    const finalOptions = { ...this.globalOptions, ...options };
    const animator = new AvatarAnimator(selector, finalOptions);
    
    const id = this.generateId();
    this.avatars.set(id, animator);
    
    return { id, animator };
  }
  
  getAvatar(id) {
    return this.avatars.get(id);
  }
  
  removeAvatar(id) {
    const animator = this.avatars.get(id);
    if (animator) {
      animator.destroy();
      this.avatars.delete(id);
    }
  }
  
  broadcast(eventType, data = {}) {
    this.avatars.forEach(animator => {
      animator.onGameEvent(eventType, data);
    });
  }
  
  generateId() {
    return 'avatar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Instance globale
window.AvatarManager = new AvatarManager();
window.AvatarAnimator = AvatarAnimator;

// Auto-initialisation pour les avatars existants
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser l'avatar du profil
  const profileAvatar = document.querySelector('#userAvatarContainer, .avatar-container');
  if (profileAvatar) {
    window.AvatarManager.createAvatar(profileAvatar, {
      enableIdle: true,
      enableEmotions: true,
      enableParticles: true
    });
    console.log('🎭 Profile avatar initialized');
  }
});

console.log('🎭 Avatar Animation System loaded'); 