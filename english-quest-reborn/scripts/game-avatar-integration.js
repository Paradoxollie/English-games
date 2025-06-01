/**
 * English Quest - Game Avatar Integration System ULTRA-MOBILE
 * Système d'avatar ultra-intégré pour cours et jeux
 * Focus: Mobile-first, engagement utilisateur maximum
 */

class GameAvatarIntegration {
  constructor(options = {}) {
    this.options = {
      gameType: 'general',
      showXP: true,
      showReactions: true,
      autoPositioning: true,
      mobileOptimized: true,
      contextualResponses: true,
      courseIntegration: true,
      ...options
    };
    
    this.currentUser = null;
    this.avatarContainer = null;
    this.reactionQueue = [];
    this.isReacting = false;
    this.performanceLevel = 'normal';
    
    // Nouveaux: Système d'engagement mobile
    this.engagementLevel = 0;
    this.sessionTime = 0;
    this.lastInteraction = Date.now();
    this.touchStartTime = 0;
    
    // Mobile gesture detection
    this.touchStartPos = { x: 0, y: 0 };
    this.isTouchDevice = 'ontouchstart' in window;
    
    this.init();
  }

  async init() {
    console.log('🎭 [Avatar Integration] Initialisation système ultra-mobile...');
    
    // Détecter le type de device et optimiser en conséquence
    this.detectDeviceCapabilities();
    
    // Charger les données utilisateur
    await this.loadUserData();
    
    if (!this.currentUser) {
      console.warn('⚠️ [Avatar Integration] Utilisateur non connecté - mode démo activé');
      this.createDemoUser();
    }
    
    // Créer l'interface selon le contexte
    this.createAvatarInterface();
    
    // NOUVEAU: Créer les composants intégrés
    setTimeout(() => {
      this.createIntegratedAvatarComponents();
    }, 500);
    
    // Configurer les interactions tactiles pour mobile
    this.setupMobileInteractions();
    
    // Démarrer les systèmes d'engagement
    this.startEngagementTracking();
    
    // Auto-détection des jeux pour réactions contextuelles
    this.setupGameDetection();
    
    console.log('✅ [Avatar Integration] Système ultra-mobile prêt !');
  }

  detectDeviceCapabilities() {
    // Détection avancée des capacités mobile
    this.deviceInfo = {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTablet: /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768,
      supportsTouch: 'ontouchstart' in window,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1
      },
      connection: navigator.connection?.effectiveType || 'unknown',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches
    };
    
    // Ajuster les performances selon le device
    if (this.deviceInfo.isMobile && this.deviceInfo.connection === 'slow-2g') {
      this.performanceLevel = 'low';
    } else if (this.deviceInfo.isTablet) {
      this.performanceLevel = 'high';
    }
    
    console.log('📱 [Avatar] Device détecté:', this.deviceInfo);
  }

  createDemoUser() {
    console.log('👤 [Avatar] Création utilisateur démo avec accessoire par défaut');
    this.currentUser = {
      username: 'Aventurier',
      level: 1,
      xp: 42,
      avatar: {
        head: 'default_boy',
        body: 'default_boy', 
        accessory: 'default', // Accessoire GIF par défaut
        background: 'forest'
      }
    };
    return this.currentUser;
  }

  async loadUserData() {
    try {
      console.log('🔍 [Avatar] Chargement données utilisateur...');
      
      // Système de chargement multi-sources amélioré
      const sources = [
        () => localStorage.getItem('english_quest_current_user'),
        () => localStorage.getItem('currentUser'),
        () => window.authService?.getCurrentUser?.(),
        () => window.authService?.currentUser
      ];
      
      for (const source of sources) {
        try {
          const userData = source();
          if (userData) {
            if (typeof userData === 'string') {
              this.currentUser = JSON.parse(userData);
            } else {
              this.currentUser = userData;
            }
            
            console.log('✅ [Avatar] Données utilisateur brutes:', this.currentUser);
            
            // Charger l'équipement actuel depuis l'inventaire
            await this.loadEquippedItems();
            
            // Valider et normaliser les données avatar
            this.normalizeAvatarData();
            console.log('✅ [Avatar] Avatar final:', this.currentUser.avatar);
            console.log('✅ [Avatar] Utilisateur chargé:', this.currentUser.username || 'Utilisateur');
            return;
          }
        } catch (e) {
          console.warn('⚠️ [Avatar] Erreur source utilisateur:', e);
        }
      }
      
      // Si aucune source ne fonctionne, créer un utilisateur démo
      console.warn('⚠️ [Avatar] Aucune donnée utilisateur trouvée, création utilisateur démo');
      this.createDemoUser();
      
    } catch (error) {
      console.error('❌ [Avatar] Erreur chargement utilisateur:', error);
      this.createDemoUser();
    }
  }

  async loadEquippedItems() {
    try {
      console.log('🎒 [Avatar] Tentative chargement équipement...');
      
      // MÉTHODE 1: Vérifier dans les données utilisateur actuelles
      if (this.currentUser && this.currentUser.avatar) {
        console.log('👤 [Avatar] Avatar existant dans currentUser:', this.currentUser.avatar);
        
        // Si l'avatar a des données, les garder
        if (this.currentUser.avatar.head || this.currentUser.avatar.body || this.currentUser.avatar.accessory) {
          console.log('✅ [Avatar] Données avatar trouvées dans currentUser');
          return;
        }
      }
      
      // MÉTHODE 2: Charger depuis localStorage directement
      try {
        const profileData = localStorage.getItem('english_quest_current_user');
        if (profileData) {
          const userData = JSON.parse(profileData);
          console.log('📦 [Avatar] Données brutes localStorage:', userData);
          
          if (userData.avatar) {
            console.log('🎭 [Avatar] Avatar trouvé dans localStorage:', userData.avatar);
            this.currentUser.avatar = { ...userData.avatar };
            return;
          }
        }
      } catch (e) {
        console.warn('⚠️ [Avatar] Erreur lecture localStorage:', e);
      }
      
      // MÉTHODE 3: Service d'inventaire
      if (window.inventoryService && typeof window.inventoryService.getEquippedItems === 'function') {
        console.log('🎒 [Avatar] Tentative via inventoryService...');
        const equippedItems = await window.inventoryService.getEquippedItems();
        
        if (equippedItems && Object.keys(equippedItems).length > 0) {
          console.log('✅ [Avatar] Équipement trouvé:', equippedItems);
          
          // Mettre à jour l'avatar avec les éléments équipés
          if (!this.currentUser.avatar) this.currentUser.avatar = {};
          
          if (equippedItems.head) {
            this.currentUser.avatar.head = equippedItems.head;
            console.log('👤 [Avatar] Tête équipée:', equippedItems.head);
          }
          if (equippedItems.body) {
            this.currentUser.avatar.body = equippedItems.body;
            console.log('👕 [Avatar] Corps équipé:', equippedItems.body);
          }
          if (equippedItems.accessory) {
            this.currentUser.avatar.accessory = equippedItems.accessory;
            console.log('🎩 [Avatar] Accessoire équipé:', equippedItems.accessory);
          }
          if (equippedItems.background) {
            this.currentUser.avatar.background = equippedItems.background;
            console.log('🏞️ [Avatar] Arrière-plan équipé:', equippedItems.background);
          }
          return;
        }
      }
      
      // MÉTHODE 4: Forcer un refresh depuis le profil
      console.log('🔄 [Avatar] Tentative rechargement profil...');
      await this.forceProfileReload();
      
    } catch (error) {
      console.error('❌ [Avatar] Erreur chargement équipement:', error);
    }
  }

  async forceProfileReload() {
    try {
      // Essayer de récupérer les données depuis l'API ou les services
      if (window.authService && window.authService.currentUser) {
        console.log('🔄 [Avatar] Rechargement via authService...');
        const currentUser = window.authService.currentUser;
        
        if (currentUser.avatar) {
          console.log('✅ [Avatar] Avatar trouvé via authService:', currentUser.avatar);
          this.currentUser.avatar = { ...currentUser.avatar };
          return;
        }
      }
      
      // Essayer avec les données Firebase si disponible
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        console.log('🔄 [Avatar] Tentative Firebase...');
        const uid = firebase.auth().currentUser.uid;
        const db = firebase.firestore();
        
        try {
          const doc = await db.collection('users').doc(uid).get();
          if (doc.exists) {
            const userData = doc.data();
            console.log('📄 [Avatar] Données Firebase récupérées:', userData);
            
            if (userData.avatar) {
              console.log('✅ [Avatar] Avatar trouvé dans Firebase:', userData.avatar);
              this.currentUser.avatar = { ...userData.avatar };
              
              // Sauvegarder en localStorage pour la prochaine fois
              localStorage.setItem('english_quest_current_user', JSON.stringify(this.currentUser));
              return;
            }
          }
        } catch (firebaseError) {
          console.warn('⚠️ [Avatar] Erreur Firebase:', firebaseError);
        }
      }
      
      console.warn('⚠️ [Avatar] Impossible de recharger le profil, utilisation des défauts');
    } catch (error) {
      console.error('❌ [Avatar] Erreur rechargement profil:', error);
    }
  }

  normalizeAvatarData() {
    if (!this.currentUser.avatar) {
      this.currentUser.avatar = {
        head: 'default_boy',
        body: 'default_boy',
        accessory: 'none',
        background: 'forest'
      };
    }
    
    // Assurer les valeurs par défaut
    const defaults = {
      head: 'default_boy',
      body: 'default_boy', 
      accessory: 'none',
      background: 'forest'
    };
    
    Object.keys(defaults).forEach(key => {
      if (!this.currentUser.avatar[key]) {
        this.currentUser.avatar[key] = defaults[key];
      }
    });
  }

  createAvatarInterface() {
    // Supprimer avatar existant
    const existing = document.querySelector('.game-mini-avatar');
    if (existing) existing.remove();
    
    // Créer nouveau conteneur avec design mobile-first
    this.avatarContainer = document.createElement('div');
    this.avatarContainer.className = 'game-mini-avatar';
    this.avatarContainer.id = 'gameAvatarWidget';
    
    // Ajouter attributs d'accessibilité
    this.avatarContainer.setAttribute('role', 'complementary');
    this.avatarContainer.setAttribute('aria-label', 'Avatar du joueur et informations');
    this.avatarContainer.setAttribute('tabindex', '0');
    
    // Générer le contenu HTML
    this.avatarContainer.innerHTML = this.generateMiniAvatarHTML();
    
    // Déterminer la position selon le contexte
    this.positionAvatar();
    
    // Ajouter au DOM
    document.body.appendChild(this.avatarContainer);
    
    // Configuration spéciale pour mobile
    if (this.deviceInfo.isMobile) {
      this.optimizeForMobile();
    }
    
    // Démarrer les animations
    setTimeout(() => this.startIdleAnimations(), 1000);
  }

  positionAvatar() {
    const path = window.location.pathname;
    
    if (path.includes('/games/')) {
      // Position fixe pour les jeux
      this.avatarContainer.style.position = 'fixed';
      
      // Position adaptative selon la taille d'écran
      if (this.deviceInfo.isMobile) {
        this.avatarContainer.style.top = '15px';
        this.avatarContainer.style.right = '15px';
        this.avatarContainer.style.zIndex = '1500';
      } else {
        this.avatarContainer.style.top = '20px';
        this.avatarContainer.style.right = '20px';
        this.avatarContainer.style.zIndex = '1000';
      }
      
    } else if (path.includes('/courses/') || path.includes('/course/')) {
      // Mode intégré pour les cours
      this.avatarContainer.classList.add('lesson-mode');
      
      // Chercher un bon emplacement dans le contenu
      const courseContent = document.querySelector('.course-content, .lesson-content, main, .container');
      if (courseContent) {
        courseContent.insertBefore(this.avatarContainer, courseContent.firstChild);
        this.avatarContainer.style.position = 'relative';
      }
      
    } else {
      // Position par défaut
      this.avatarContainer.style.position = 'fixed';
      this.avatarContainer.style.top = '20px';
      this.avatarContainer.style.right = '20px';
    }
  }

  optimizeForMobile() {
    // Optimisations spécifiques mobile
    this.avatarContainer.style.touchAction = 'manipulation';
    this.avatarContainer.style.webkitTapHighlightColor = 'transparent';
    
    // Réduire les animations si connexion lente
    if (this.deviceInfo.connection === 'slow-2g' || this.performanceLevel === 'low') {
      this.avatarContainer.style.animationDuration = '0.1s';
      this.avatarContainer.style.transitionDuration = '0.1s';
    }
    
    // Ajuster la taille selon l'orientation
    const updateSize = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      if (isLandscape && window.innerWidth < 768) {
        this.avatarContainer.style.width = 'min(20vh, 100px)';
      } else {
        this.avatarContainer.style.width = 'min(25vw, 120px)';
      }
    };
    
    updateSize();
    window.addEventListener('orientationchange', updateSize);
    window.addEventListener('resize', updateSize);
  }

  setupMobileInteractions() {
    if (!this.avatarContainer) return;
    
    // Gestes tactiles avancés
    this.avatarContainer.addEventListener('touchstart', (e) => {
      this.touchStartTime = Date.now();
      this.touchStartPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }, { passive: true });
    
    this.avatarContainer.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - this.touchStartTime;
      const touch = e.changedTouches[0];
      const distance = Math.sqrt(
        Math.pow(touch.clientX - this.touchStartPos.x, 2) +
        Math.pow(touch.clientY - this.touchStartPos.y, 2)
      );
      
      // Tap court = interaction normale
      if (touchDuration < 300 && distance < 10) {
        this.handleAvatarTap();
      }
      // Tap long = menu contexte (future feature)
      else if (touchDuration > 800 && distance < 10) {
        this.handleAvatarLongTap();
      }
      
    }, { passive: true });
    
    // Interactions clavier pour accessibilité
    this.avatarContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleAvatarTap();
      }
    });
    
    // Hover pour desktop
    if (!this.deviceInfo.isMobile) {
      this.avatarContainer.addEventListener('mouseenter', () => {
        this.showQuickInfo();
      });
      
      this.avatarContainer.addEventListener('mouseleave', () => {
        this.hideQuickInfo();
      });
    }
  }

  handleAvatarTap() {
    console.log('👆 [Avatar] Interaction utilisateur');
    this.lastInteraction = Date.now();
    this.engagementLevel = Math.min(this.engagementLevel + 1, 10);
    
    // Effet visuel de tap
    this.avatarContainer.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.avatarContainer.style.transform = '';
    }, 150);
    
    // Réaction contextuelle
    const reactions = [
      'Salut ! 👋',
      'Comment ça va ? 😊',
      'Tu progresses bien ! 🌟',
      'Continue comme ça ! 💪',
      'Tu es fantastique ! ✨'
    ];
    
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    this.showReaction(randomReaction, 'happy');
    
    // Animation spéciale pour l'engagement
    this.triggerEmotion('happy');
  }

  handleAvatarLongTap() {
    console.log('👆📱 [Avatar] Long tap détecté');
    // Future: Menu contextuel avec options avatar
    this.showReaction('Menu bientôt disponible ! 🔧', 'thinking');
  }

  generateMiniAvatarHTML() {
    const avatar = this.currentUser.avatar;
    const userName = this.currentUser.username || this.currentUser.displayName || 'Joueur';
    const level = this.currentUser.level || 1;
    const xp = this.currentUser.xp || 0;
    
    return `
      <div class="mini-avatar-display avatar-container">
        <img src="../assets/avatars/backgrounds/${avatar.background}.png" 
             alt="Background" 
             class="avatar-background"
             onerror="this.style.display='none'">
        <img src="../assets/avatars/bodies/${avatar.body}.png" 
             alt="Body" 
             class="avatar-body" 
             id="gameMiniAvatarBody"
             onerror="this.src='../assets/avatars/bodies/default_boy.png'">
        <img src="../assets/avatars/heads/${avatar.head}.png" 
             alt="Head" 
             class="avatar-head" 
             id="gameMiniAvatarHead"
             onerror="this.src='../assets/avatars/heads/default_boy.png'">
        <div class="avatar-accessory" id="gameMiniAvatarAccessory">
          <img src="../assets/avatars/accessories/${avatar.accessory}.gif" 
               alt="Accessory" 
               width="100%" 
               height="100%"
               onerror="this.style.display='none'">
        </div>
      </div>
      
      ${this.options.showXP ? `
        <div class="mini-avatar-info">
          <div class="mini-avatar-name">${userName}</div>
          <div class="mini-avatar-level">Niveau ${level}</div>
          <div class="mini-avatar-xp-bar">
            <div class="xp-fill" style="width: ${(xp % 100)}%"></div>
          </div>
        </div>
      ` : ''}
      
      <div class="mini-avatar-status">
        <div class="status-indicator idle">●</div>
        <div class="reaction-text"></div>
      </div>
      
      ${this.deviceInfo.isMobile ? `
        <div class="mobile-engagement-indicator" style="
          position: absolute;
          top: -5px;
          left: -5px;
          width: 15px;
          height: 15px;
          background: linear-gradient(45deg, #2ecc71, #3498db);
          border-radius: 50%;
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
        "></div>
      ` : ''}
    `;
  }

  // Système d'engagement pour mobile
  startEngagementTracking() {
    setInterval(() => {
      this.sessionTime++;
      
      // Réduire l'engagement si pas d'interaction
      const timeSinceInteraction = Date.now() - this.lastInteraction;
      if (timeSinceInteraction > 30000) { // 30 secondes
        this.engagementLevel = Math.max(0, this.engagementLevel - 0.1);
      }
      
      // Encouragements selon l'engagement
      if (this.sessionTime % 120 === 0 && this.engagementLevel < 3) { // Chaque 2 minutes
        this.encourageUser();
      }
      
    }, 1000);
  }

  encourageUser() {
    const encouragements = [
      'Hey ! Tu es toujours là ? 👀',
      'Prêt pour un défi ? 💪',
      'Ta progression est importante ! 📈',
      'Allez, encore un effort ! 🌟',
      'Tu peux le faire ! 🚀'
    ];
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.showReaction(randomEncouragement, 'thinking');
    
    // Animation d'attention
    this.avatarContainer.style.animation = 'attention-pulse 1s ease-in-out 3';
  }

  // Système de détection automatique des jeux
  setupGameDetection() {
    // Détecter Enigma Scroll
    if (window.location.pathname.includes('enigma-scroll')) {
      this.setupEnigmaScrollIntegration();
      document.body.setAttribute('data-game', 'enigma-scroll');
    }
    
    // Autres jeux peuvent être ajoutés ici
    if (window.location.pathname.includes('speed-verb')) {
      document.body.setAttribute('data-game', 'speed-verb');
    }
    
    // Observer les changements de score génériques
    this.observeScoreChanges();
  }

  setupEnigmaScrollIntegration() {
    console.log('🎮 [Avatar] Configuration Enigma Scroll avec système motivant');
    
    this.setupGameDetection();
    this.observeGameProgress();
    this.observeScoreChanges();
    
    // Nouveau système de motivation dynamique
    this.setupEnigmaScrollMotivation();
  }

  setupEnigmaScrollMotivation() {
    // Observer les éléments de jeu spécifiques
    this.observeEnigmaScrollElements();
    
    // Système de feedback en temps réel
    this.startEnigmaScrollFeedback();
  }

  observeEnigmaScrollElements() {
    // Observer le score pour déclencher la motivation
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
      this.previousScore = 0;
      
      const scoreObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const newScore = parseInt(scoreDisplay.textContent) || 0;
            if (newScore > this.previousScore) {
              const scoreDiff = newScore - this.previousScore;
              this.handleScoreIncrease(scoreDiff, newScore);
            }
            this.previousScore = newScore;
          }
        });
      });
      
      scoreObserver.observe(scoreDisplay, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    // Observer le combo
    const comboDisplay = document.getElementById('combo-display');
    if (comboDisplay) {
      const comboObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const comboText = comboDisplay.textContent;
            const comboValue = parseInt(comboText.replace('x', '')) || 1;
            this.handleComboChange(comboValue);
          }
        });
      });
      
      comboObserver.observe(comboDisplay, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    // Observer le temps
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
      const timeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const timeLeft = parseInt(timeDisplay.textContent) || 0;
            this.handleTimeChange(timeLeft);
          }
        });
      });
      
      timeObserver.observe(timeDisplay, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    // Observer les tentatives
    const attemptsDisplay = document.getElementById('attempts-display');
    if (attemptsDisplay) {
      const attemptsObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const attemptsText = attemptsDisplay.textContent;
            const [current, max] = attemptsText.split('/').map(x => parseInt(x));
            this.handleAttemptsChange(current, max);
          }
        });
      });
      
      attemptsObserver.observe(attemptsDisplay, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  handleScoreIncrease(scoreDiff, totalScore) {
    console.log(`📈 [Avatar] Score augmenté de ${scoreDiff}, total: ${totalScore}`);
    
    if (scoreDiff >= 50) {
      this.updateMotivationalState('breakthrough', {
        text: `EXCELLENT ! +${scoreDiff} points ! 🔥`
      });
    } else if (scoreDiff >= 20) {
      this.updateMotivationalState('focus', {
        text: `Bien joué ! +${scoreDiff} points ! 👏`
      });
    } else {
      this.updateMotivationalState('ready', {
        text: `+${scoreDiff} points ! Continue ! ⭐`
      });
    }
    
    // Suggestions de skins basées sur le score
    if (totalScore >= 500) {
      this.suggestSkinUpgrade('mastery');
    } else if (totalScore >= 200) {
      this.suggestSkinUpgrade('breakthrough');
    }
  }

  handleComboChange(comboValue) {
    console.log(`🔥 [Avatar] Combo: x${comboValue}`);
    
    if (comboValue >= 5) {
      this.updateMotivationalState('mastery', {
        text: `COMBO x${comboValue} ! TU ES EN FEU ! 🔥👑`
      });
    } else if (comboValue >= 3) {
      this.updateMotivationalState('breakthrough', {
        text: `Super combo x${comboValue} ! 💪⚡`
      });
    } else if (comboValue >= 2) {
      this.updateMotivationalState('focus', {
        text: `Combo x${comboValue} ! Maintiens le rythme ! 🎯`
      });
    }
  }

  handleTimeChange(timeLeft) {
    if (timeLeft <= 10 && timeLeft > 0) {
      this.updateMotivationalState('struggle', {
        text: `${timeLeft}s ! DÉPÊCHE-TOI ! ⏰💨`
      });
    } else if (timeLeft <= 30) {
      this.updateMotivationalState('focus', {
        text: `Plus que ${timeLeft}s ! Concentre-toi ! 🎯`
      });
    }
  }

  handleAttemptsChange(current, max) {
    const remaining = max - current;
    
    if (remaining <= 1) {
      this.updateMotivationalState('struggle', {
        text: 'DERNIÈRE CHANCE ! Donne tout ! 💪🔥'
      });
    } else if (remaining <= 2) {
      this.updateMotivationalState('focus', {
        text: `Plus que ${remaining} tentatives ! 🎯`
      });
    }
  }

  startEnigmaScrollFeedback() {
    // Feedback périodique pour maintenir l'engagement
    setInterval(() => {
      if (this.isGameActive()) {
        this.providePereiodicFeedback();
      }
    }, 15000); // Toutes les 15 secondes
  }

  providePereiodicFeedback() {
    const feedbacks = [
      'Tu progresses bien ! 🌟',
      'Chaque mot compte ! 📚',
      'Ton niveau s\'améliore ! 📈',
      'Continue comme ça ! 💪',
      'Tu es sur la bonne voie ! 🎯'
    ];
    
    const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
    this.updateMotivationalState('ready', { text: randomFeedback });
  }

  isGameActive() {
    const gameArea = document.getElementById('game-area');
    return gameArea && !gameArea.classList.contains('hidden');
  }

  observeGameProgress() {
    // Observer le score pour adapter l'état émotionnel
    const scoreElement = document.querySelector('#score-display');
    if (scoreElement) {
      let lastScore = parseInt(scoreElement.textContent) || 0;
      
      const observer = new MutationObserver(() => {
        const newScore = parseInt(scoreElement.textContent) || 0;
        if (newScore > lastScore) {
          const increase = newScore - lastScore;
          // Plus le gain est important, plus l'effort est récompensé
          const effortLevel = Math.min(100, 30 + (increase * 2));
          
          if (this.updateBattleState) {
            this.updateBattleState('winning', { 
              text: `+${increase} points ! 🎯`, 
              effort: effortLevel,
              emotion: '🔥'
            });
          }
        }
        lastScore = newScore;
      });
      
      observer.observe(scoreElement, { childList: true, characterData: true, subtree: true });
    }
    
    // Observer le combo pour l'état émotionnel
    const comboElement = document.querySelector('#combo-display');
    if (comboElement) {
      const observer = new MutationObserver(() => {
        const comboText = comboElement.textContent;
        const comboValue = parseInt(comboText.replace('x', '')) || 1;
        
        if (comboValue > 1 && this.updateBattleState) {
          const effortLevel = Math.min(100, 40 + (comboValue * 10));
          this.updateBattleState('winning', { 
            text: `Combo ${comboText} ! 🔥`, 
            effort: effortLevel,
            emotion: '🚀'
          });
        }
      });
      
      observer.observe(comboElement, { childList: true, characterData: true, subtree: true });
    }
    
    // Observer le temps pour l'urgence
    const timeElement = document.querySelector('#time-display');
    if (timeElement) {
      const observer = new MutationObserver(() => {
        const timeLeft = parseInt(timeElement.textContent) || 0;
        
        if (timeLeft < 20 && timeLeft > 0 && this.updateBattleState) {
          // Temps critique = effort maximum
          this.updateBattleState('struggling', { 
            text: `Plus que ${timeLeft}s ! ⏰`, 
            effort: 90,
            emotion: '😰'
          });
        } else if (timeLeft > 60 && this.updateBattleState) {
          // Beaucoup de temps = état détendu
          this.updateBattleState('thinking', { 
            text: 'Prends ton temps... 😌', 
            effort: 20,
            emotion: '😌'
          });
        }
      });
      
      observer.observe(timeElement, { childList: true, characterData: true, subtree: true });
    }
  }

  observeScoreChanges() {
    // Observer les changements de score dans différents éléments
    const scoreElements = [
      '#score-display',
      '#words-found-stat',
      '#total-score-stat',
      '.score',
      '.points'
    ];
    
    scoreElements.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        let lastScore = parseInt(element.textContent) || 0;
        
        const observer = new MutationObserver(() => {
          const newScore = parseInt(element.textContent) || 0;
          if (newScore > lastScore) {
            const increase = newScore - lastScore;
            this.showReaction(`+${increase} points ! 🎯`, 'happy');
            this.triggerEmotion('happy');
          }
          lastScore = newScore;
        });
        
        observer.observe(element, { childList: true, characterData: true, subtree: true });
      }
    });
  }

  // Reste des méthodes... (identique mais optimisé)
  showReaction(text, emotion = 'thinking', duration = 2500) {
    if (!this.options.showReactions) return;
    
    this.reactionQueue.push({ text, emotion, duration });
    
    if (!this.isReacting) {
      this.processReactionQueue();
    }
  }

  async processReactionQueue() {
    if (this.reactionQueue.length === 0) {
      this.isReacting = false;
      return;
    }
    
    this.isReacting = true;
    const { text, emotion, duration } = this.reactionQueue.shift();
    
    const reactionElement = this.avatarContainer?.querySelector('.reaction-text');
    const statusElement = this.avatarContainer?.querySelector('.status-indicator');
    
    if (reactionElement && statusElement) {
      // Afficher la réaction
      reactionElement.textContent = text;
      reactionElement.classList.add('show');
      
      // Changer le statut
      statusElement.className = `status-indicator ${emotion}`;
      
      // Animation d'engagement mobile
      if (this.deviceInfo.isMobile) {
        const engagementIndicator = this.avatarContainer.querySelector('.mobile-engagement-indicator');
        if (engagementIndicator) {
          engagementIndicator.style.opacity = '1';
          engagementIndicator.style.transform = 'scale(1)';
          setTimeout(() => {
            engagementIndicator.style.opacity = '0';
            engagementIndicator.style.transform = 'scale(0)';
          }, 1000);
        }
      }
      
      // Masquer après délai
      setTimeout(() => {
        reactionElement.classList.remove('show');
        statusElement.className = 'status-indicator idle';
        
        // Traiter la prochaine réaction
        setTimeout(() => this.processReactionQueue(), 500);
      }, duration);
    }
  }

  triggerEmotion(emotion) {
    const head = document.getElementById('gameMiniAvatarHead');
    const body = document.getElementById('gameMiniAvatarBody');
    
    if (head && body) {
      // Animation selon l'émotion
      switch(emotion) {
        case 'happy':
          head.style.animation = 'bounce 0.6s ease-in-out 2';
          break;
        case 'excited':
          body.style.animation = 'wobble 0.8s ease-in-out 2';
          break;
        case 'thinking':
          head.style.animation = 'tilt 1s ease-in-out 2';
          break;
        case 'sad':
          head.style.animation = 'droop 0.8s ease-in-out 1';
          break;
      }
      
      // Reset animation
      setTimeout(() => {
        head.style.animation = '';
        body.style.animation = '';
      }, 2000);
    }
  }

  triggerCelebration() {
    console.log('🎉 [Avatar] Célébration !');
    
    // Animation complète de célébration
    this.avatarContainer.style.animation = 'celebration-bounce 1.5s ease-in-out';
    
    // Effet spécial mobile
    if (this.deviceInfo.isMobile && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
    
    setTimeout(() => {
      this.avatarContainer.style.animation = '';
    }, 1500);
  }

  startIdleAnimations() {
    if (this.performanceLevel === 'low' || this.deviceInfo.reducedMotion) return;
    
    // Animations subtiles en idle
    setInterval(() => {
      if (!this.isReacting && Math.random() < 0.3) {
        const head = document.getElementById('gameMiniAvatarHead');
        if (head) {
          head.style.animation = 'idle-blink 0.3s ease-in-out';
          setTimeout(() => head.style.animation = '', 300);
        }
      }
    }, 8000);
  }

  // Méthodes publiques pour intégration externe
  updateUserData(userData) {
    this.currentUser = { ...this.currentUser, ...userData };
    this.normalizeAvatarData();
    
    if (this.avatarContainer) {
      this.avatarContainer.innerHTML = this.generateMiniAvatarHTML();
      this.setupMobileInteractions();
    }
  }

  showCustomMessage(message, emotion = 'thinking') {
    this.showReaction(message, emotion);
  }

  celebrate() {
    this.triggerCelebration();
  }

  setPerformanceMode(mode) {
    this.performanceLevel = mode;
    if (mode === 'low') {
      // Désactiver les animations coûteuses
      this.avatarContainer.style.animationDuration = '0.1s';
    }
  }

  // NOUVEAU: Créer directement le Mini Aventurier ultra-réactif
  createIntegratedAvatarComponents() {
    // Supprimer les anciens avatars
    this.removeOldAvatars();
    
    // Créer directement le Mini Aventurier
    this.createUltraReactiveMiniAdventurer();
  }

  removeOldAvatars() {
    // Supprimer tous les anciens avatars
    const oldAvatars = document.querySelectorAll('.game-mini-avatar, .avatar-motivational-center, .avatar-learning-motivator, .avatar-game-battle, .avatar-learning-buddy, .wandering-pet-avatar, .floating-buddy-avatar, .corner-assistant-avatar, .mini-adventurer-avatar');
    oldAvatars.forEach(avatar => avatar.remove());
  }

  createUltraReactiveMiniAdventurer() {
    if (document.getElementById('ultra-adventurer')) {
      return;
    }
    
    console.log('🏃‍♂️ Création Mini Adventurer ULTRA-RÉACTIF');
    
    // Créer le container principal
    const adventurerContainer = document.createElement('div');
    adventurerContainer.className = 'ultra-reactive-adventurer';
    adventurerContainer.id = 'ultra-adventurer';
    adventurerContainer.innerHTML = `
      <div class="adventurer-avatar-ultra">
        ${this.generateAvatarDisplayHTML()}
      </div>
      <div class="adventure-effects-ultra" id="adventureEffectsUltra"></div>
      <div class="adventure-speech-bubble" id="adventureSpeech" style="display: none;"></div>
      <div class="adventure-aura" id="adventureAura"></div>
    `;
    
    document.body.appendChild(adventurerContainer);
    
    // Démarrer les comportements
    this.startUltraReactiveBehavior();
    
    console.log('✅ Ultra-Reactive Mini Adventurer créé avec succès !');
  }

  generateAvatarDisplayHTML() {
    const user = this.currentUser || this.createDemoUser();
    const avatar = user.avatar || {};
    
    // Construire les chemins d'images correctement
    const getAvatarPath = (type, value) => {
      if (!value || value === 'none') return null;
      // Si c'est déjà un chemin complet, l'utiliser tel quel
      if (value.includes('/') || value.includes('.')) {
        return value;
      }
      // Sinon, construire le chemin avec l'extension
      return `../assets/avatars/${type}s/${value}.png`;
    };
    
    const bodyPath = getAvatarPath('body', avatar.body) || '../assets/avatars/bodies/default_boy.png';
    const headPath = getAvatarPath('head', avatar.head) || '../assets/avatars/heads/default_boy.png';
    
    // Logique d'accessoire EXACTE du profil
    let accessoryHTML = '';
    console.log('[Avatar] Accessoire dans données:', avatar.accessory);
    
    if (avatar.accessory === 'default') {
      // Accessoire par défaut = GIF animé
      console.log('[Avatar] Affichage accessoire par défaut (GIF)');
      accessoryHTML = `
        <div class="avatar-accessory-ultra">
          <img src="../assets/avatars/accessories/default.gif" 
               alt="Animated Accessory" 
               style="width: 100%; height: 100%; display: block; object-fit: contain; opacity: 1;"
               onerror="console.warn('[Avatar] GIF échoué, fallback PNG'); this.src='../assets/avatars/accessories/default.png';"
               onload="console.log('[Avatar] Accessoire GIF chargé avec succès');">
        </div>`;
    } else if (avatar.accessory && avatar.accessory !== 'none') {
      // Autre accessoire
      console.log('[Avatar] Affichage autre accessoire:', avatar.accessory);
      accessoryHTML = `
        <div class="avatar-accessory-ultra">
          <img src="${getAvatarPath('accessory', avatar.accessory)}" 
               alt="Accessory" 
               style="width: 100%; height: 100%; display: block; object-fit: contain; opacity: 1;"
               onerror="console.warn('[Avatar] Accessoire échoué:', this.src); this.style.display='none';"
               onload="console.log('[Avatar] Accessoire chargé:', this.src);">
        </div>`;
    }
    
    return `
      <div class="avatar-display-ultra">
        <!-- Corps -->
        <img src="${bodyPath}" 
             alt="Avatar Body" 
             class="avatar-body-ultra"
             onerror="this.src='../assets/avatars/bodies/default_boy.png'">
        
        <!-- Tête COLLÉE au corps -->
        <img src="${headPath}" 
             alt="Avatar Head" 
             class="avatar-head-ultra"
             onerror="this.src='../assets/avatars/heads/default_boy.png'">
        
        <!-- Accessoire GIF -->
        ${accessoryHTML}
      </div>
    `;
  }

  startUltraReactiveBehavior() {
    console.log('🚀 [Avatar] Démarrage comportement ultra-réactif...');
    
    // Configurer les réactions de jeu
    this.setupUltraGameReactions();
    
    // Mouvement aléatoire intelligent
    setTimeout(() => {
      this.moveAdventurerRandomly();
    }, 3000);
    
    // Animation idle de base
    this.startIdleAnimation();
    
    // NOUVEAU: Surveillance continue de la visibilité
    this.startVisibilityWatchdog();
    
    console.log('✅ [Avatar] Système ultra-réactif opérationnel');
  }

  startVisibilityWatchdog() {
    console.log('👁️ [Avatar] Démarrage surveillance visibilité...');
    
    // Vérifier toutes les 5 secondes si l'avatar est visible
    this.visibilityTimer = setInterval(() => {
      const adventurer = document.getElementById('ultra-adventurer');
      if (!adventurer) {
        console.warn('⚠️ [Avatar] Avatar disparu ! Tentative de récréation...');
        this.recreateAvatar();
        return;
      }
      
      // Vérifier si l'avatar est réellement visible
      const rect = adventurer.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       adventurer.style.display !== 'none' &&
                       adventurer.style.visibility !== 'hidden' &&
                       adventurer.style.opacity !== '0';
      
      if (!isVisible) {
        console.warn('⚠️ [Avatar] Avatar invisible ! Tentative de restauration...');
        this.restoreAvatarVisibility(adventurer);
      }
      
      // Vérifier la position (éviter qu'il soit hors écran)
      if (rect.left < -100 || rect.top < -100 || 
          rect.left > window.innerWidth || rect.top > window.innerHeight) {
        console.warn('⚠️ [Avatar] Avatar hors écran ! Repositionnement...');
        this.repositionAvatarSafely(adventurer);
      }
      
    }, 5000);
  }

  recreateAvatar() {
    console.log('🔄 [Avatar] Recréation avatar...');
    
    // Supprimer l'ancien s'il existe
    const oldAvatar = document.getElementById('ultra-adventurer');
    if (oldAvatar) {
      oldAvatar.remove();
    }
    
    // Recréer l'avatar
    this.createUltraReactiveMiniAdventurer();
    
    // Redémarrer les observateurs
    setTimeout(() => {
      this.setupUltraGameObservers();
      console.log('✅ [Avatar] Avatar recréé avec succès');
    }, 500);
  }

  restoreAvatarVisibility(adventurer) {
    console.log('👁️ [Avatar] Restauration visibilité...');
    
    // Forcer la visibilité
    adventurer.style.display = 'block';
    adventurer.style.visibility = 'visible';
    adventurer.style.opacity = '1';
    adventurer.style.zIndex = '1200';
    
    // Vérifier que les classes CSS sont présentes
    if (!adventurer.classList.contains('ultra-reactive-adventurer')) {
      adventurer.classList.add('ultra-reactive-adventurer');
    }
    
    // Animation de réapparition
    adventurer.style.animation = 'fadeInAvatar 0.5s ease-in-out';
    
    console.log('✅ [Avatar] Visibilité restaurée');
  }

  repositionAvatarSafely(adventurer) {
    console.log('📍 [Avatar] Repositionnement sécurisé...');
    
    // Position de secours au centre droit
    adventurer.style.position = 'fixed';
    adventurer.style.top = '30%';
    adventurer.style.right = '20px';
    adventurer.style.left = 'auto';
    adventurer.style.bottom = 'auto';
    adventurer.style.transform = 'none';
    
    // Animation de glissement vers la nouvelle position
    adventurer.style.transition = 'all 1s ease-in-out';
    
    console.log('✅ [Avatar] Avatar repositionné en sécurité');
  }

  // Améliorer isGameActive pour plus de robustesse
  isGameActive() {
    // Vérifications multiples pour s'assurer que le jeu est actif
    const gameArea = document.getElementById('game-area');
    const welcomeScreen = document.getElementById('welcome-screen');
    
    // Le jeu est actif si game-area est visible et welcome-screen est caché
    const gameAreaVisible = gameArea && !gameArea.classList.contains('hidden') && 
                           gameArea.style.display !== 'none';
    const welcomeHidden = welcomeScreen && (welcomeScreen.classList.contains('hidden') || 
                         welcomeScreen.style.display === 'none');
    
    // Vérifier aussi s'il y a une grille active
    const wordGrid = document.getElementById('word-grid') || document.querySelector('.word-grid');
    const hasActiveGrid = wordGrid && wordGrid.children.length > 0;
    
    const isActive = gameAreaVisible && welcomeHidden && hasActiveGrid;
    
    if (!isActive) {
      console.log('ℹ️ [Avatar] Jeu inactif - gameArea:', gameAreaVisible, 'welcomeHidden:', welcomeHidden, 'hasGrid:', hasActiveGrid);
    }
    
    return isActive;
  }

  setupUltraGameReactions() {
    const path = window.location.pathname;
    
    if (path.includes('/games/')) {
      this.setupUltraGameObservers();
    } else if (path.includes('/courses/')) {
      this.setupUltraCourseObservers();
    }
  }

  setupUltraGameObservers() {
    console.log('🎮 [Avatar] Configuration observations ultra-réactives');
    
    // 1. Observer le SCORE
    this.observeScore();
    
    // 2. Observer le COMBO
    this.observeCombo();
    
    // 3. Observer le TEMPS
    this.observeTime();
    
    // 4. Observer les TENTATIVES
    this.observeAttempts();
    
    // 5. Observer les MESSAGES popup
    this.observeMessages();
    
    // 6. Observer les LETTRES tapées
    this.observeLetters();
    
    // 7. Observer les POWER-UPS
    this.observePowerUps();
    
    // 8. Observer l'état du JEU
    this.observeGameState();
  }

  observeScore() {
    const scoreDisplay = document.getElementById('score-display');
    if (!scoreDisplay) return;
    
    this.previousScore = 0;
    
    const scoreObserver = new MutationObserver(() => {
      const newScore = parseInt(scoreDisplay.textContent) || 0;
      const scoreDiff = newScore - this.previousScore;
      
      if (scoreDiff > 0) {
        this.triggerAdventureReaction('scoreSmallGain', { 
          amount: scoreDiff, 
          total: newScore,
          isSmall: scoreDiff < 20,
          isMedium: scoreDiff >= 20 && scoreDiff < 50,
          isBig: scoreDiff >= 50
        });
      }
      
      this.previousScore = newScore;
    });
    
    scoreObserver.observe(scoreDisplay, { childList: true, subtree: true, characterData: true });
  }

  observeCombo() {
    const comboDisplay = document.getElementById('combo-display');
    if (!comboDisplay) return;
    
    this.previousCombo = 1;
    
    const comboObserver = new MutationObserver(() => {
      const comboText = comboDisplay.textContent;
      const newCombo = parseInt(comboText.replace('x', '')) || 1;
      
      if (newCombo > this.previousCombo) {
        this.triggerAdventureReaction('combo', { 
          combo: newCombo,
          isStreak: newCombo >= 3,
          isFire: newCombo >= 5
        });
      } else if (newCombo < this.previousCombo) {
        this.triggerAdventureReaction('comboBroken', { previousCombo: this.previousCombo });
      }
      
      this.previousCombo = newCombo;
    });
    
    comboObserver.observe(comboDisplay, { childList: true, subtree: true, characterData: true });
  }

  observeTime() {
    const timeDisplay = document.getElementById('time-display');
    if (!timeDisplay) return;
    
    const timeObserver = new MutationObserver(() => {
      const timeLeft = parseInt(timeDisplay.textContent) || 0;
      
      if (timeLeft <= 10 && timeLeft > 0) {
        this.triggerAdventureReaction('timeRunningOut', { timeLeft });
      } else if (timeLeft <= 30 && timeLeft > 10) {
        this.triggerAdventureReaction('timeLow', { timeLeft });
      }
    });
    
    timeObserver.observe(timeDisplay, { childList: true, subtree: true, characterData: true });
  }

  observeAttempts() {
    const attemptsDisplay = document.getElementById('attempts-display');
    if (!attemptsDisplay) return;
    
    const attemptsObserver = new MutationObserver(() => {
      const attemptsText = attemptsDisplay.textContent;
      const [current, max] = attemptsText.split('/').map(n => parseInt(n));
      
      if (current >= max - 1) {
        this.triggerAdventureReaction('attemptFailed', { current, max });
      } else if (current >= max - 2) {
        this.triggerAdventureReaction('pressureMounting', { current, max });
      }
    });
    
    attemptsObserver.observe(attemptsDisplay, { childList: true, subtree: true, characterData: true });
  }

  observeMessages() {
    const gameObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.classList?.contains('popup-message')) {
              const message = node.textContent.toLowerCase();
              
              if (message.includes('félicitations') || message.includes('bravo')) {
                this.triggerAdventureReaction('victory', { message });
              } else if (message.includes('écoulé') || message.includes('perdu')) {
                this.triggerAdventureReaction('defeat', { message });
              } else if (message.includes('invalide')) {
                this.triggerAdventureReaction('wrongWord', { message });
              } else if (message.includes('incomplet')) {
                this.triggerAdventureReaction('incomplete', { message });
              } else if (message.includes('nouveau mot')) {
                this.triggerAdventureReaction('newWord', { message });
              }
            }
          });
        }
      });
    });
    
    gameObserver.observe(document.body, { childList: true, subtree: true });
  }

  observeLetters() {
    if (this.letterObserver) {
      this.letterObserver.disconnect();
    }

    console.log('🔤 [Avatar] Configuration observateur lettres...');
    
    // Observer TOUTE la grille de jeu
    const wordGrid = document.getElementById('word-grid') || document.querySelector('.word-grid');
    if (!wordGrid) {
      console.warn('⚠️ [Avatar] Grille de mots non trouvée');
      return;
    }

    this.letterObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // Nouvelles cellules ajoutées
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.classList.contains('grid-cell')) {
              console.log('➕ [Avatar] Nouvelle cellule détectée');
            }
          });
        }
        
        if (mutation.type === 'characterData' || 
            (mutation.type === 'childList' && mutation.target.classList.contains('grid-cell'))) {
          const cell = mutation.target.classList.contains('grid-cell') 
            ? mutation.target 
            : mutation.target.parentElement;
            
          if (cell && cell.classList.contains('grid-cell')) {
            const letter = cell.textContent.trim();
            console.log(`📝 [Avatar] Lettre détectée: "${letter}" dans cellule`, cell);
            
            // Réagir à la frappe
            if (letter && letter.length === 1) {
              this.triggerAdventureReaction('letterTyped', { letter });
            }
          }
        }
        
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const cell = mutation.target;
          if (cell.classList.contains('grid-cell')) {
            console.log('🎨 [Avatar] Changement classe cellule:', cell.className);
            
            // Détecter les changements d'état
            if (cell.classList.contains('correct')) {
              this.triggerAdventureReaction('letterCorrect', { 
                letter: cell.textContent.trim() 
              });
            } else if (cell.classList.contains('present')) {
              this.triggerAdventureReaction('letterPresent', { 
                letter: cell.textContent.trim() 
              });
            } else if (cell.classList.contains('absent')) {
              this.triggerAdventureReaction('letterAbsent', { 
                letter: cell.textContent.trim() 
              });
            }
          }
        }
      });
    });

    // Observer avec options complètes
    this.letterObserver.observe(wordGrid, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class'],
      characterDataOldValue: true
    });

    // OBSERVATEUR SUPPLÉMENTAIRE: Observer les entrées clavier directement
    this.setupKeyboardObserver();
  }

  setupKeyboardObserver() {
    console.log('⌨️ [Avatar] Configuration observateur clavier...');
    
    // Observer les événements clavier du document
    document.addEventListener('keydown', (event) => {
      if (!this.isGameActive()) return;
      
      const key = event.key.toUpperCase();
      console.log(`⌨️ [Avatar] Touche pressée: ${key}`);
      
      // Lettres A-Z
      if (key.match(/^[A-Z]$/)) {
        this.triggerAdventureReaction('letterTyped', { letter: key, source: 'keyboard' });
      }
      // Enter
      else if (key === 'ENTER') {
        this.triggerAdventureReaction('wordSubmitted', { source: 'keyboard' });
      }
      // Backspace
      else if (key === 'BACKSPACE') {
        this.triggerAdventureReaction('letterErased', { source: 'keyboard' });
      }
    });

    // Observer les clics sur le clavier virtuel
    const keyboard = document.getElementById('keyboard') || document.querySelector('.keyboard');
    if (keyboard) {
      keyboard.addEventListener('click', (event) => {
        if (!this.isGameActive()) return;
        
        const button = event.target.closest('.key-btn');
        if (button) {
          const keyText = button.textContent.trim();
          console.log(`🖱️ [Avatar] Clic clavier virtuel: ${keyText}`);
          
          if (keyText.match(/^[A-Z]$/)) {
            this.triggerAdventureReaction('letterTyped', { letter: keyText, source: 'virtual' });
          } else if (keyText === 'ENTER') {
            this.triggerAdventureReaction('wordSubmitted', { source: 'virtual' });
          } else if (keyText === '⌫') {
            this.triggerAdventureReaction('letterErased', { source: 'virtual' });
          }
        }
      });
    }
  }

  observePowerUps() {
    document.querySelectorAll('.power-up').forEach(powerUp => {
      powerUp.addEventListener('click', () => {
        const type = powerUp.dataset.type;
        this.triggerAdventureReaction('powerUpUsed', { type });
      });
    });
  }

  observeGameState() {
    // Observer les changements d'écran de jeu
    const gameArea = document.getElementById('game-area');
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (gameArea && welcomeScreen) {
      const stateObserver = new MutationObserver(() => {
        if (!gameArea.classList.contains('hidden')) {
          this.triggerAdventureReaction('gameStart', {});
        }
      });
      
      stateObserver.observe(gameArea, { attributes: true, attributeFilter: ['class'] });
      stateObserver.observe(welcomeScreen, { attributes: true, attributeFilter: ['class'] });
    }
  }

  triggerAdventureReaction(eventType, data = {}) {
    if (!this.isVisible) return;
    
    const reactions = {
      // ====== ÉVÉNEMENTS POSITIFS ======
      scoreSmallGain: {
        animations: ['adventurerJumpJoy', 'adventurerCelebration'],
        effects: ['sparkles', 'stars'],
        category: 'positive',
        speechBubbles: ['Nice!', 'Bien joué!', 'Super!', 'Excellent!'],
        aura: { color: 'success', duration: 2000 }
      },
      
      scoreMediumGain: {
        animations: ['adventurerSpinCelebration', 'adventurerEnergeticSway'],
        effects: ['lightning', 'stars'],
        category: 'positive',
        speechBubbles: ['Fantastique!', 'Incroyable!', 'Bravo!', 'Wow!'],
        aura: { color: 'success', duration: 3000 }
      },
      
      scoreBigGain: {
        animations: ['adventurerVictoryExplosion', 'adventurerBigCelebration'],
        effects: ['celebration', 'lightning'],
        category: 'positive',
        speechBubbles: ['EXCELLENT!', 'PARFAIT!', 'GÉNIE!', 'INCROYABLE!'],
        aura: { color: 'victory', duration: 4000 }
      },
      
      letterCorrect: {
        animations: ['adventurerJumpJoy'],
        effects: ['sparkles'],
        category: 'positive',
        speechBubbles: ['Correct!', 'Oui!', 'Parfait!'],
        aura: { color: 'success', duration: 1500 }
      },
      
      powerUpUsed: {
        animations: ['adventurerMagicSpin', 'adventurerSpinCelebration'],
        effects: ['lightning', 'stars'],
        category: 'positive',
        speechBubbles: ['Pouvoir activé!', 'Magic!', 'Super pouvoir!'],
        aura: { color: 'fire', duration: 2500 }
      },
      
      // ====== ÉVÉNEMENTS NÉGATIFS ======
      timeRunningOut: {
        animations: ['adventurerFrantic', 'adventurerPanic'],
        effects: ['stress', 'sweat'],
        category: 'negative',
        speechBubbles: ['Vite!', 'Dépêche!', 'Plus de temps!', 'Panic!'],
        aura: { color: 'panic', duration: 2000 }
      },
      
      letterAbsent: {
        animations: ['adventurerSadness', 'adventurerDeflation'],
        effects: ['confusion', 'sweat'],
        category: 'negative',
        speechBubbles: ['Oups...', 'Pas ça...', 'Raté...'],
        aura: { color: 'error', duration: 1500 }
      },
      
      attemptFailed: {
        animations: ['adventurerCollapse', 'adventurerStress'],
        effects: ['tired', 'confusion'],
        category: 'negative',
        speechBubbles: ['Ah non...', 'Dommage...', 'Essaie encore!'],
        aura: { color: 'error', duration: 2000 }
      },
      
      gameOver: {
        animations: ['adventurerCollapse', 'adventurerSadness'],
        effects: ['tired', 'stress'],
        category: 'negative',
        speechBubbles: ['Game Over...', 'Recommençons!', 'Plus de chance!'],
        aura: { color: 'error', duration: 3000 }
      },
      
      // ====== ÉVÉNEMENTS NEUTRES ======
      letterTyped: {
        animations: ['adventurerConcentration'],
        effects: ['thinking', 'focus'],
        category: 'neutral',
        speechBubbles: ['Réfléchissons...', 'Hmm...', 'Voyons...'],
        aura: { color: 'focus', duration: 1000 }
      },
      
      letterPresent: {
        animations: ['adventurerReflection', 'adventurerConcentration'],
        effects: ['thinking', 'focus'],
        category: 'neutral',
        speechBubbles: ['Presque!', 'Bonne lettre!', 'Mauvaise place!'],
        aura: { color: 'warning', duration: 1500 }
      },
      
      moving: {
        animations: ['adventurerWalk', 'adventurerEnergeticSway'],
        effects: ['thinking'],
        category: 'neutral',
        speechBubbles: ['En exploration!', 'Je bouge!', 'Nouvelle position!'],
        aura: { color: 'focus', duration: 1000 }
      }
    };

    const reaction = reactions[eventType];
    if (!reaction) {
      console.warn(`⚠️ [Avatar] Réaction inconnue: ${eventType}`);
      return;
    }

    console.log(`🎭 [Avatar] Réaction: ${eventType}`, data);

    // 1. Animation corporelle
    if (reaction.animations) {
      const randomAnimation = reaction.animations[Math.floor(Math.random() * reaction.animations.length)];
      this.triggerAnimation(randomAnimation, 2000);
    }

    // 2. Effet visuel
    if (reaction.effects) {
      const randomEffect = reaction.effects[Math.floor(Math.random() * reaction.effects.length)];
      this.applyVisualEffect(randomEffect, reaction.category);
    }

    // 3. Bulle de dialogue
    if (reaction.speechBubbles) {
      const randomBubble = reaction.speechBubbles[Math.floor(Math.random() * reaction.speechBubbles.length)];
      this.showSpeechBubble(randomBubble, 2000);
    }

    // 4. Aura colorée
    if (reaction.aura) {
      this.changeAura(reaction.aura.color, reaction.aura.duration);
    }
  }

  showSpeechBubble(text, duration) {
    const speechBubble = document.getElementById('adventureSpeech');
    speechBubble.textContent = text;
    speechBubble.style.display = 'block';
    speechBubble.style.animation = 'speechBubbleAppear 0.3s ease-out';
    
    setTimeout(() => {
      speechBubble.style.display = 'none';
    }, duration);
  }

  changeAura(color, duration) {
    const aura = document.getElementById('adventureAura');
    aura.className = `adventure-aura ${color}-aura`;
    
    setTimeout(() => {
      aura.className = 'adventure-aura';
    }, duration);
  }

  triggerAnimation(animation, duration) {
    const adventurer = document.querySelector('.adventurer-avatar-ultra');
    if (adventurer) {
      adventurer.style.animation = animation;
      
      setTimeout(() => {
        adventurer.style.animation = '';
      }, duration);
    }
  }

  applyVisualEffect(effect, category) {
    const effects = document.querySelector('.adventure-effects-ultra');
    if (effects) {
      effects.className = `adventure-effects-ultra ${category}-${effect}`;
      
      setTimeout(() => {
        effects.className = 'adventure-effects-ultra';
      }, 2500);
    }
  }

  moveAdventurerRandomly() {
    const adventurer = document.getElementById('ultra-adventurer');
    if (!adventurer) return;
    
    // Définir les zones sûres (où l'avatar ne gêne jamais)
    const safeZones = this.calculateSafeZones();
    const randomZone = safeZones[Math.floor(Math.random() * safeZones.length)];
    
    console.log(`🚶‍♂️ [Avatar] Mouvement vers zone sûre:`, randomZone);
    
    // Animation de transition fluide
    adventurer.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    adventurer.style.top = randomZone.top;
    adventurer.style.left = randomZone.left;
    adventurer.style.right = 'auto';
    adventurer.style.bottom = 'auto';
    
    // Déclencher réaction de mouvement
    this.triggerAdventureReaction('moving', { zone: randomZone.name });
    
    // Programmer le prochain mouvement
    setTimeout(() => {
      this.moveAdventurerRandomly();
    }, Math.random() * 10000 + 8000); // Entre 8-18 secondes
  }

  calculateSafeZones() {
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const isMobile = viewWidth <= 768;
    
    // Zones sûres qui évitent les éléments UI importants
    const safeZones = [];
    
    if (isMobile) {
      // Sur mobile, rester sur les bords pour ne pas gêner
      safeZones.push(
        { name: 'top-right', top: '15px', left: 'auto', right: '15px' },
        { name: 'top-left', top: '15px', left: '15px', right: 'auto' },
        { name: 'middle-right', top: '40%', left: 'auto', right: '10px' },
        { name: 'bottom-right', top: 'auto', bottom: '15px', left: 'auto', right: '15px' }
      );
    } else {
      // Sur desktop, plus de liberté de mouvement
      safeZones.push(
        { name: 'top-right', top: '20px', left: 'auto', right: '20px' },
        { name: 'top-left', top: '20px', left: '20px', right: 'auto' },
        { name: 'middle-right', top: '30%', left: 'auto', right: '20px' },
        { name: 'middle-left', top: '35%', left: '20px', right: 'auto' },
        { name: 'bottom-right', top: 'auto', bottom: '20px', left: 'auto', right: '20px' },
        { name: 'bottom-left', top: 'auto', bottom: '20px', left: '20px', right: 'auto' },
        { name: 'center-right', top: '50%', left: 'auto', right: '20px' }
      );
    }
    
    return safeZones;
  }

  startIdleAnimation() {
    const adventurer = document.querySelector('.adventurer-avatar-ultra');
    if (!adventurer) return;
    
    adventurer.style.animation = 'adventurerIdle 4s ease-in-out infinite';
  }

  destroy() {
    console.log('🧹 [Avatar] Destruction instance...');
    
    // Arrêter tous les timers
    if (this.visibilityTimer) {
      clearInterval(this.visibilityTimer);
      this.visibilityTimer = null;
    }
    
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
    
    // Arrêter tous les observateurs
    if (this.gameObserver) {
      this.gameObserver.disconnect();
      this.gameObserver = null;
    }
    
    if (this.letterObserver) {
      this.letterObserver.disconnect();
      this.letterObserver = null;
    }
    
    if (this.scoreObserver) {
      this.scoreObserver.disconnect();
      this.scoreObserver = null;
    }
    
    // Supprimer l'avatar du DOM
    const adventurer = document.getElementById('ultra-adventurer');
    if (adventurer) {
      adventurer.remove();
    }
    
    // Nettoyer les références
    this.currentUser = null;
    this.isVisible = false;
    
    console.log('✅ [Avatar] Instance détruite proprement');
  }
}

// Styles CSS additionnels pour les nouvelles animations
const additionalStyles = `
  @keyframes attention-pulse {
    0%, 100% { transform: scale(1); border-color: var(--color-primary); }
    50% { transform: scale(1.1); border-color: var(--color-warning); }
  }
  
  @keyframes celebration-bounce {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.2) rotate(-5deg); }
    50% { transform: scale(1.3) rotate(5deg); }
    75% { transform: scale(1.2) rotate(-2deg); }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-8px) scale(1.1); }
  }
  
  @keyframes wobble {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
  }
  
  @keyframes tilt {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(10deg); }
  }
  
  @keyframes droop {
    0% { transform: translateY(0); }
    100% { transform: translateY(3px); }
  }
  
  @keyframes idle-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

// Injecter les styles
if (!document.getElementById('gameAvatarStyles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'gameAvatarStyles';
  styleSheet.textContent = additionalStyles;
  document.head.appendChild(styleSheet);
}

// Instance globale
window.gameAvatarIntegration = null;

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gameAvatarIntegration) {
    console.log('🚀 [Avatar] Auto-initialisation système ultra-mobile');
    window.gameAvatarIntegration = new GameAvatarIntegration({
      gameType: 'auto-detect',
      mobileOptimized: true,
      contextualResponses: true
    });
  }
});

// Export pour usage externe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameAvatarIntegration;
} 