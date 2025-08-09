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

    // Boot lightweight AI Brain when available
    try {
      this.brain = new AvatarBrain(this, { tts: false });
    } catch (e) {
      console.warn('[AvatarBrain] init skipped:', e);
    }
  }

  async init() {
    console.log('🚀 [Avatar] Initialisation système avatar gaming...');
    
    // 1. Détection des capacités
    this.detectDeviceCapabilities();
    
    // 2. FORCE RELOAD du profil en priorité pour Enigma Scroll
    if (window.location.href.includes('enigma-scroll')) {
      console.log('🎮 [Avatar] Jeu Enigma Scroll détecté - FORCE RELOAD du profil...');
      await this.forceReloadProfileForEnigmaScroll();
      
      // Attendre un peu pour que tout soit bien chargé
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 3. Charger les données utilisateur
    await this.loadUserData();
    
    // 4. NOUVEAU: Créer l'interface avatar DIRECTEMENT
    console.log('🎨 [Avatar] Création interface avatar...');
    this.createAvatarInterface();
    
    // 5. FORCE: Créer aussi l'Ultra Adventurer pour les tests
    console.log('🏃‍♂️ [Avatar] FORCE création Ultra Adventurer...');
    setTimeout(() => {
      this.createUltraReactiveMiniAdventurer();
      
      // Vérifier que l'avatar est créé
      setTimeout(() => {
        const avatar = document.getElementById('ultra-adventurer');
        if (avatar) {
          console.log('✅ [Avatar] Ultra Adventurer créé avec succès:', avatar);
          console.log('📍 [Avatar] Position:', avatar.getBoundingClientRect());
        } else {
          console.error('❌ [Avatar] Ultra Adventurer PAS créé!');
          // Retry immédiatement
          this.createUltraReactiveMiniAdventurer();
        }
      }, 1000);
    }, 500);
    
    // 6. Démarrer les systèmes
    this.startEngagementTracking();
    this.setupGameDetection();
    
    console.log('✅ [Avatar] Système avatar gaming initialisé!');
    return this;
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
            
            // NOUVEAU: Force le rechargement du profil si on est dans Enigma Scroll
            if (window.location.pathname.includes('enigma-scroll')) {
              console.log('🎮 [Avatar] Enigma Scroll détecté - rechargement FORCÉ du profil...');
              await this.forceReloadProfileForEnigmaScroll();
            }
            
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

  async forceReloadProfileForEnigmaScroll() {
    if (!window.location.href.includes('enigma-scroll')) {
      return;
    }

    console.log('🔄 [Avatar] FORCE RELOAD profile pour Enigma Scroll...');
    
    try {
      // 1. Nettoyer le cache existant
      this.avatarData = null;
      
      // 2. Essayer toutes les sources possibles
      let profileData = null;
      
      // SOURCE 1: authService (priorité)
      if (window.authService && typeof window.authService.getCurrentUser === 'function') {
        console.log('📡 [Avatar] Tentative authService...');
        try {
          const authUser = window.authService.getCurrentUser();
          if (authUser) {
            console.log('✅ [Avatar] Utilisateur authService trouvé:', authUser.username || authUser.displayName);
            
            // Charger le profil complet depuis authService
            if (window.authService.loadUserProfile) {
              profileData = await window.authService.loadUserProfile(authUser.uid);
              if (profileData) {
                console.log('✅ [Avatar] Profil authService complet:', profileData);
              }
            } else {
              profileData = authUser;
            }
          }
        } catch (error) {
          console.warn('⚠️ [Avatar] Erreur authService:', error);
        }
      }
      
      // SOURCE 2: Firebase direct
      if (!profileData && typeof firebase !== 'undefined' && firebase.firestore) {
        console.log('🔥 [Avatar] Tentative Firebase direct...');
        try {
          const userId = localStorage.getItem('englishQuestUserId') || 
                         localStorage.getItem('english_quest_current_user_id');
          
          if (userId && userId !== 'undefined' && userId !== 'null') {
            const db = firebase.firestore();
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (userDoc.exists) {
              profileData = { uid: userId, ...userDoc.data() };
              console.log('✅ [Avatar] Profil Firebase direct:', profileData);
            }
          }
        } catch (error) {
          console.warn('⚠️ [Avatar] Erreur Firebase direct:', error);
        }
      }
      
      // SOURCE 3: inventoryService
      if (!profileData && window.inventoryService) {
        console.log('🎒 [Avatar] Tentative inventoryService...');
        try {
          const inventory = await window.inventoryService.getUserInventory();
          if (inventory && inventory.equipped) {
            profileData = {
              avatar: inventory.equipped,
              username: 'Joueur'
            };
            console.log('✅ [Avatar] Profil inventoryService:', profileData);
          }
        } catch (error) {
          console.warn('⚠️ [Avatar] Erreur inventoryService:', error);
        }
      }
      
      // SOURCE 4: localStorage complet
      if (!profileData) {
        console.log('💾 [Avatar] Scan localStorage complet...');
        const keys = [
          'english_quest_current_user',
          'currentUser',
          'englishQuestUserProfile',
          'userProfile',
          'enigmaScrollProfile'
        ];
        
        for (const key of keys) {
          try {
            const data = localStorage.getItem(key);
            if (data && data !== 'undefined' && data !== 'null') {
              const parsed = JSON.parse(data);
              if (parsed && (parsed.avatar || parsed.username || parsed.displayName)) {
                profileData = parsed;
                console.log(`✅ [Avatar] Profil localStorage (${key}):`, profileData);
                break;
              }
            }
          } catch (e) {
            // Ignorer les erreurs de parsing
          }
        }
      }
      
      // 3. Appliquer les données trouvées
      if (profileData) {
        console.log('🎨 [Avatar] Application profil trouvé:', profileData);
        
        // Forcer la mise à jour de l'avatar
        this.avatarData = {
          username: profileData.username || profileData.displayName || 'Joueur',
          level: profileData.level || 1,
          xp: profileData.xp || 0,
          avatar: profileData.avatar || {}
        };
        
        // Si l'avatar a des données mais pas la structure complète
        if (profileData.avatar) {
          Object.assign(this.avatarData.avatar, profileData.avatar);
        }
        
        // Sauvegarder pour la prochaine fois
        localStorage.setItem('enigmaScrollProfile', JSON.stringify(this.avatarData));
        
        // Recréer l'avatar avec les nouvelles données
        this.recreateAvatar();
        
        console.log('✅ [Avatar] Profil appliqué avec succès!');
        return this.avatarData;
      } else {
        console.warn('⚠️ [Avatar] Aucun profil trouvé, utilisation profil par défaut');
        this.avatarData = this.createDemoUser();
        return this.avatarData;
      }
      
    } catch (error) {
      console.error('❌ [Avatar] Erreur lors du force reload profile:', error);
      this.avatarData = this.createDemoUser();
      return this.avatarData;
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
    // Détecter Enigma Scroll SANS RÉCURSION
    if (window.location.pathname.includes('enigma-scroll')) {
      this.initEnigmaScrollIntegration();
      document.body.setAttribute('data-game', 'enigma-scroll');
    }
    
    // Autres jeux peuvent être ajoutés ici
    if (window.location.pathname.includes('speed-verb')) {
      document.body.setAttribute('data-game', 'speed-verb');
    }
    
    // Observer les changements de score génériques
    this.observeScoreChanges();
  }

  initEnigmaScrollIntegration() {
    console.log('🎮 [Avatar] Initialisation Enigma Scroll - VERSION ULTRA-CORRIGÉE');
    
    // Force restart fresh pour éviter les boucles
    this.isEnigmaScrollInit = true;
    
    // Créer l'avatar s'il n'existe pas
    if (!document.getElementById('ultra-adventurer')) {
      console.log('🏃‍♂️ [Avatar] Avatar non trouvé, création immédiate...');
      this.createUltraReactiveMiniAdventurer();
    }
    
    // Attendre que l'avatar soit créé puis configurer les observateurs
    setTimeout(() => {
      // Vérifier que l'avatar existe
      const adventurer = document.getElementById('ultra-adventurer');
      if (adventurer) {
        console.log('✅ [Avatar] Avatar trouvé, configuration des observateurs...');
        this.observeEnigmaScrollElements();
        
        // Test de l'avatar
        setTimeout(() => {
          this.showSpeechBubble('Avatar ready! Let\'s start the game!', 2500);
          this.triggerPhysicalAnimation('physicalHop');
          console.log('🎯 [Avatar] Test de l\'avatar effectué');
        }, 2000);
      } else {
        console.error('❌ [Avatar] Avatar toujours non trouvé après création');
        // Retry
        this.createUltraReactiveMiniAdventurer();
      }
    }, 1000);
    
    console.log('✅ [Avatar] Enigma Scroll integration initialized');
  }

  setupSimpleEnigmaScrollMotivation() {
    // Observer les éléments de jeu spécifiques SANS RÉCURSION
    this.observeEnigmaScrollElements();
    
    // Feedback simple
    this.startSimpleEnigmaScrollFeedback();
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
    
    const avatar = document.getElementById('ultra-adventurer');
    if (!avatar) return;
    
    if (scoreDiff >= 50) {
      this.showSpeechBubble(`EXCELLENT ! +${scoreDiff} points ! 🔥`, 3000);
      this.triggerPhysicalAnimation('physicalVictoryDance');
      this.changeAura('victory', 4000);
    } else if (scoreDiff >= 20) {
      this.showSpeechBubble(`Bien joué ! +${scoreDiff} points ! 👏`, 2500);
      this.triggerPhysicalAnimation('physicalPump');
      this.changeAura('success', 3000);
    } else {
      this.showSpeechBubble(`+${scoreDiff} points ! Continue ! ⭐`, 2000);
      this.triggerPhysicalAnimation('physicalHop');
    }
  }

  handleComboChange(comboValue) {
    console.log(`🔥 [Avatar] Combo: x${comboValue}`);
    
    const avatar = document.getElementById('ultra-adventurer');
    if (!avatar) return;
    
    if (comboValue >= 5) {
      this.showSpeechBubble(`COMBO x${comboValue} ! TU ES EN FEU ! 🔥👑`, 4000);
      this.triggerPhysicalAnimation('physicalFireDance');
      this.changeAura('fire', 5000);
    } else if (comboValue >= 3) {
      this.showSpeechBubble(`Super combo x${comboValue} ! 💪⚡`, 3000);
      this.triggerPhysicalAnimation('physicalDance');
      this.changeAura('success', 3500);
    } else if (comboValue >= 2) {
      this.showSpeechBubble(`Combo x${comboValue} ! Maintiens le rythme ! 🎯`, 2500);
      this.triggerPhysicalAnimation('physicalClap');
    }
  }

  handleTimeChange(timeLeft) {
    const avatar = document.getElementById('ultra-adventurer');
    if (!avatar) return;
    
    if (timeLeft <= 10 && timeLeft > 0) {
      this.showSpeechBubble(`${timeLeft}s ! DÉPÊCHE-TOI ! ⏰💨`, 2000);
      this.triggerPhysicalAnimation('physicalPanicWave');
      this.changeAura('fire', 2000);
    } else if (timeLeft <= 30) {
      this.showSpeechBubble(`Plus que ${timeLeft}s ! Concentre-toi ! 🎯`, 2500);
      this.triggerPhysicalAnimation('physicalTilt');
    }
  }

  handleAttemptsChange(current, max) {
    const avatar = document.getElementById('ultra-adventurer');
    if (!avatar) return;
    
    const remaining = max - current;
    
    if (remaining <= 1) {
      this.showSpeechBubble('DERNIÈRE CHANCE ! Donne tout ! 💪🔥', 3000);
      this.triggerPhysicalAnimation('physicalShake');
      this.changeAura('fire', 4000);
    } else if (remaining <= 2) {
      this.showSpeechBubble(`Plus que ${remaining} tentatives ! 🎯`, 2500);
      this.triggerPhysicalAnimation('physicalNod');
    }
  }

  startSimpleEnigmaScrollFeedback() {
    console.log('💬 [Avatar] Démarrage feedback Enigma Scroll simple...');
    
    // Feedback périodique simplifié pour maintenir l'engagement
    setInterval(() => {
      if (this.isGameActive()) {
        this.provideSimpleFeedback();
      }
    }, 20000); // Toutes les 20 secondes (moins fréquent)
  }

  provideSimpleFeedback() {
    const feedbackMessages = [
      "Continue comme ça ! 💪",
      "Tu fais du bon travail ! 👏", 
      "Reste concentré ! 🎯",
      "Excellent effort ! ⭐",
      "Tu progresses bien ! 📈"
    ];
    
    const randomMessage = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
    this.showReaction(randomMessage, 'thinking', 3000);
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
      // Supprimer l'ancien avatar pour le recréer avec les bonnes données
      console.log('🔄 [Avatar] Avatar existant trouvé, suppression pour recréation...');
      document.getElementById('ultra-adventurer').remove();
    }
    
    console.log('🏃‍♂️ Création Mini Adventurer ULTRA-RÉACTIF avec profil:', this.currentUser?.avatar);
    
    // NOUVEAU: Forcer le rechargement des données utilisateur avant création
    this.forceReloadUserDataSync();
    
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
    
    // Forcer le positionnement visible
    adventurerContainer.style.position = 'fixed';
    adventurerContainer.style.top = '100px';
    adventurerContainer.style.right = '30px';
    adventurerContainer.style.zIndex = '1200';
    adventurerContainer.style.opacity = '1';
    adventurerContainer.style.visibility = 'visible';
    adventurerContainer.style.display = 'block';
    
    document.body.appendChild(adventurerContainer);
    
    // Marquer comme visible
    this.isVisible = true;
    
    // Démarrer les comportements
    this.startUltraReactiveBehavior();
    
    console.log('✅ Ultra-Reactive Mini Adventurer créé avec succès et positionné !');
    
    // NOUVEAU: Vérifier après 2 secondes que l'avatar est bien visible
    setTimeout(() => {
      this.verifyAvatarVisibility();
    }, 2000);
  }

  // NOUVELLE FONCTION: Rechargement synchrone des données utilisateur
  forceReloadUserDataSync() {
    console.log('🔄 [Avatar] Force reload synchrone des données utilisateur...');
    
    // Essayer toutes les sources possibles dans l'ordre de priorité
    const sources = [
      {
        name: 'english_quest_current_user',
        getData: () => {
          const data = localStorage.getItem('english_quest_current_user');
          return data ? JSON.parse(data) : null;
        }
      },
      {
        name: 'currentUser', 
        getData: () => {
          const data = localStorage.getItem('currentUser');
          return data ? JSON.parse(data) : null;
        }
      },
      {
        name: 'authService',
        getData: () => {
          return window.authService?.getCurrentUser?.();
        }
      },
      {
        name: 'enigmaScrollProfile',
        getData: () => {
          const data = localStorage.getItem('enigmaScrollProfile');
          return data ? JSON.parse(data) : null;
        }
      }
    ];
    
    for (const source of sources) {
      try {
        const userData = source.getData();
        if (userData && (userData.avatar || userData.username || userData.displayName)) {
          console.log(`✅ [Avatar] Données trouvées via ${source.name}:`, userData);
          
          // Mettre à jour this.currentUser avec les données complètes
          this.currentUser = {
            username: userData.username || userData.displayName || 'Joueur',
            level: userData.level || 1,
            xp: userData.xp || 0,
            avatar: userData.avatar || {
              head: 'default_boy',
              body: 'default_boy',
              accessory: 'default',
              background: 'forest'
            }
          };
          
          console.log('🎨 [Avatar] Données utilisateur mises à jour:', this.currentUser);
          return true;
        }
      } catch (error) {
        console.warn(`⚠️ [Avatar] Erreur avec source ${source.name}:`, error);
      }
    }
    
    console.warn('⚠️ [Avatar] Aucune donnée utilisateur trouvée, utilisation profil par défaut');
    this.currentUser = this.createDemoUser();
    return false;
  }

  verifyAvatarVisibility() {
    const adventurer = document.getElementById('ultra-adventurer');
    if (!adventurer) {
      console.error('❌ [Avatar] Avatar non trouvé après création ! Recréation...');
      this.createUltraReactiveMiniAdventurer();
      return;
    }
    
    const rect = adventurer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('⚠️ [Avatar] Avatar invisible après création ! Correction...');
      this.forceAvatarVisibility(adventurer);
    } else {
      console.log('✅ [Avatar] Avatar vérifié et visible:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left
      });
    }
  }

  generateAvatarDisplayHTML() {
    // NOUVELLE MÉTHODE: Essayer de recharger les données utilisateur à la volée
    let user = this.currentUser;
    
    // Si pas de données utilisateur ou données par défaut, essayer de recharger
    if (!user || !user.avatar || user.username === 'Aventurier') {
      console.log('🔄 [Avatar] Rechargement données utilisateur pour HTML...');
      
      // Essayer plusieurs sources de données
      const sources = [
        () => {
          const data = localStorage.getItem('english_quest_current_user');
          return data ? JSON.parse(data) : null;
        },
        () => {
          const data = localStorage.getItem('currentUser');
          return data ? JSON.parse(data) : null;
        },
        () => {
          return window.authService?.getCurrentUser?.();
        },
        () => {
          const data = localStorage.getItem('enigmaScrollProfile');
          return data ? JSON.parse(data) : null;
        }
      ];
      
      for (const source of sources) {
        try {
          const userData = source();
          if (userData && (userData.avatar || userData.username)) {
            console.log('✅ [Avatar] Données utilisateur trouvées pour HTML:', userData);
            user = userData;
            this.currentUser = userData; // Mettre à jour aussi l'instance
            break;
          }
        } catch (e) {
          // Ignorer les erreurs
        }
      }
    }
    
    // Si toujours pas de données, utiliser le profil par défaut mais avec log
    if (!user) {
      console.warn('⚠️ [Avatar] Aucune donnée utilisateur trouvée, utilisation profil démo');
      user = this.createDemoUser();
    }
    
    const avatar = user.avatar || {};
    
    console.log('🎨 [Avatar] Génération HTML avec avatar:', avatar);
    console.log('👤 [Avatar] Utilisateur:', user.username || user.displayName || 'Inconnu');
    
    // Construire les chemins d'images correctement
    const getAvatarPath = (type, value) => {
      if (!value || value === 'none') return null;
      // Si c'est déjà un chemin complet, l'utiliser tel quel
      if (value.includes('/') || value.includes('.')) {
        return value;
      }
      
      // CORRECTION CRITIQUE: bodies au lieu de bodys
      if (type === 'body') {
        return `../assets/avatars/bodies/${value}.png`;
      }
      
      // Pour les autres types (head, accessory, etc.)
      return `../assets/avatars/${type}s/${value}.png`;
    };
    
    const bodyPath = getAvatarPath('body', avatar.body) || '../assets/avatars/bodies/default_boy.png';
    const headPath = getAvatarPath('head', avatar.head) || '../assets/avatars/heads/default_boy.png';
    
    console.log('🖼️ [Avatar] Chemins images CORRIGÉS:');
    console.log('  - Corps:', bodyPath);
    console.log('  - Tête:', headPath);
    console.log('  - Accessoire:', avatar.accessory);
    
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
    
    const finalHTML = `
      <div class="avatar-display-ultra">
        <!-- Corps -->
        <img src="${bodyPath}" 
             alt="Avatar Body" 
             class="avatar-body-ultra"
             onerror="this.src='../assets/avatars/bodies/default_boy.png'; console.warn('[Avatar] Corps échoué:', this.src);"
             onload="console.log('[Avatar] Corps chargé:', this.src);">
        
        <!-- Tête COLLÉE au corps -->
        <img src="${headPath}" 
             alt="Avatar Head" 
             class="avatar-head-ultra"
             onerror="this.src='../assets/avatars/heads/default_boy.png'; console.warn('[Avatar] Tête échouée:', this.src);"
             onload="console.log('[Avatar] Tête chargée:', this.src);">
        
        <!-- Accessoire GIF -->
        ${accessoryHTML}
      </div>
    `;
    
    console.log('✅ [Avatar] HTML généré avec succès');
    return finalHTML;
  }

  startUltraReactiveBehavior() {
    console.log('🎮 [Avatar] Démarrage comportement ultra-réactif...');
    
    // Démarrer l'animation idle
    this.startIdleAnimations();
    
    // Démarrer le watchdog de visibilité
    this.startVisibilityWatchdog();
    
    // Démarrer les réactions de jeu
    this.setupUltraGameReactions();
    
    // NOUVEAU: Démarrer le système de mouvement intelligent
    this.startIntelligentMovement();
    
    // Observer l'état du jeu
    this.setupUltraGameObservers();
    
    console.log('✅ [Avatar] Comportement ultra-réactif actif');
  }

  // NOUVEAU: Système de mouvement intelligent
  startIntelligentMovement() {
    console.log('🚶‍♂️ [Avatar] Démarrage mouvement intelligent...');
    
    this.movementTimer = null;
    this.currentPosition = 'safe-top-right'; // Position par défaut
    this.lastGameActivity = Date.now();
    this.isMoving = false;
    
    // Positions sûres selon le jeu
    this.safePositions = {
      'enigma-scroll': [
        'safe-top-right',    // Position par défaut - ne gêne pas les mots
        'safe-bottom-right', // En bas à droite - loin du clavier
        'safe-center-right'  // Milieu droite - neutre
      ],
      'default': [
        'safe-top-right',
        'safe-bottom-right',
        'safe-top-left',
        'safe-center-right'
      ]
    };
    
    // Surveiller l'activité du jeu
    this.observeGameActivity();
    
    // Premier mouvement après 10 secondes d'inactivité
    setTimeout(() => {
      this.scheduleNextMovement();
    }, 10000);
  }

  observeGameActivity() {
    // Surveiller les interactions utilisateur
    const activityEvents = ['click', 'keydown', 'touchstart', 'mousemove'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.lastGameActivity = Date.now();
        
        // Si l'avatar est en mouvement pendant l'activité, l'arrêter
        if (this.isMoving) {
          this.pauseMovement();
        }
      }, { passive: true });
    });
  }

  scheduleNextMovement() {
    if (this.movementTimer) {
      clearTimeout(this.movementTimer);
    }
    
    // Attendre 15-30 secondes d'inactivité avant de bouger
    const inactivityDelay = 15000 + Math.random() * 15000;
    
    this.movementTimer = setTimeout(() => {
      this.checkAndMove();
    }, inactivityDelay);
  }

  checkAndMove() {
    const timeSinceActivity = Date.now() - this.lastGameActivity;
    
    // Ne bouger que si pas d'activité récente (5 secondes minimum)
    if (timeSinceActivity < 5000) {
      console.log('🚶‍♂️ [Avatar] Activité récente détectée, report du mouvement');
      this.scheduleNextMovement();
      return;
    }
    
    // Vérifier si le jeu est actif
    if (this.isGameActiveNow()) {
      console.log('🚶‍♂️ [Avatar] Jeu actif, report du mouvement');
      this.scheduleNextMovement();
      return;
    }
    
    this.moveToRandomSafePosition();
  }

  isGameActiveNow() {
    // Vérifier si Enigma Scroll est en cours
    const gameStatus = document.querySelector('#gameStatus')?.textContent;
    const timeLeft = document.querySelector('#timeLeft')?.textContent;
    
    if (gameStatus && gameStatus.includes('en cours')) {
      return true;
    }
    
    if (timeLeft && parseInt(timeLeft) > 0) {
      return true;
    }
    
    // Vérifier s'il y a des lettres sélectionnées
    const selectedLetters = document.querySelectorAll('.letter.selected');
    if (selectedLetters.length > 0) {
      return true;
    }
    
    return false;
  }

  moveToRandomSafePosition() {
    const avatar = document.getElementById('ultra-adventurer');
    if (!avatar) return;
    
    console.log('🚶‍♂️ [Avatar] Démarrage mouvement doux...');
    
    // Déterminer les positions sûres selon le jeu
    const gameType = window.location.href.includes('enigma-scroll') ? 'enigma-scroll' : 'default';
    const positions = this.safePositions[gameType];
    
    // Choisir une position différente de la actuelle
    const availablePositions = positions.filter(pos => pos !== this.currentPosition);
    const newPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    // Marquer comme en mouvement
    this.isMoving = true;
    avatar.classList.add('moving');
    
    // Changer de position
    avatar.classList.remove(this.currentPosition);
    avatar.classList.add(newPosition);
    this.currentPosition = newPosition;
    
    console.log(`🚶‍♂️ [Avatar] Mouvement vers: ${newPosition}`);
    
    // Arrêter l'état "en mouvement" après la transition
    setTimeout(() => {
      avatar.classList.remove('moving');
      avatar.classList.add('idle-breathing');
      this.isMoving = false;
      
      // Programmer le prochain mouvement
      this.scheduleNextMovement();
    }, 4000); // Durée de la transition CSS
  }

  pauseMovement() {
    const avatar = document.getElementById('ultra-adventurer');
    if (!avatar) return;
    
    avatar.classList.remove('moving');
    this.isMoving = false;
    
    if (this.movementTimer) {
      clearTimeout(this.movementTimer);
    }
    
    // Reprogrammer le mouvement après un délai
    setTimeout(() => {
      this.scheduleNextMovement();
    }, 10000);
  }

  startVisibilityWatchdog() {
    console.log('👁️ [Avatar] Démarrage surveillance visibilité RENFORCÉE...');
    
    // Vérifier toutes les 3 secondes (plus fréquent) si l'avatar est visible
    this.visibilityTimer = setInterval(() => {
      const adventurer = document.getElementById('ultra-adventurer');
      if (!adventurer) {
        console.warn('⚠️ [Avatar] Avatar disparu ! Recréation immédiate...');
        this.recreateAvatar();
        return;
      }
      
      // Vérifier si l'avatar est réellement visible
      const rect = adventurer.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       adventurer.style.display !== 'none' &&
                       adventurer.style.visibility !== 'hidden' &&
                       parseFloat(adventurer.style.opacity) !== 0;
      
      if (!isVisible) {
        console.warn('⚠️ [Avatar] Avatar invisible ! Restauration forcée...');
        this.forceAvatarVisibility(adventurer);
      }
      
      // Vérifier la position STRICTEMENT (éviter qu'il soit hors écran)
      const isOutOfBounds = rect.left < -50 || rect.top < 0 || 
                           rect.right > window.innerWidth + 50 || 
                           rect.bottom > window.innerHeight + 50;
      
      if (isOutOfBounds) {
        console.warn('⚠️ [Avatar] Avatar hors limites ! Repositionnement sécurisé...', {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight
        });
        this.repositionAvatarSafely(adventurer);
      }
      
      // NOUVEAU: Vérifier que l'avatar n'est pas bloqué dans une animation figée
      const computedStyle = window.getComputedStyle(adventurer);
      if (computedStyle.transform === 'none' && computedStyle.animation === 'none') {
        // L'avatar semble figé, lui donner une animation d'idle
        this.restartIdleAnimation(adventurer);
      }
      
    }, 3000); // Toutes les 3 secondes
  }

  forceAvatarVisibility(adventurer) {
    console.log('👁️ [Avatar] FORCE visibilité complète...');
    
    // Forcer ABSOLUMENT la visibilité
    adventurer.style.display = 'block !important';
    adventurer.style.visibility = 'visible !important';
    adventurer.style.opacity = '1 !important';
    adventurer.style.zIndex = '1200 !important';
    adventurer.style.pointerEvents = 'auto';
    
    // Vérifier que toutes les classes CSS sont présentes
    if (!adventurer.classList.contains('ultra-reactive-adventurer')) {
      adventurer.classList.add('ultra-reactive-adventurer');
    }
    
    // Animation de réapparition spectaculaire
    adventurer.style.animation = 'fadeInAvatar 1s ease-in-out';
    
    // Ajouter une aura temporaire pour signaler la correction
    const tempAura = document.createElement('div');
    tempAura.style.cssText = `
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      border: 2px solid #00ff00;
      border-radius: 50%;
      animation: visibilityAlert 2s ease-in-out;
      pointer-events: none;
      z-index: 1199;
    `;
    adventurer.appendChild(tempAura);
    
    setTimeout(() => {
      if (tempAura.parentNode) {
        tempAura.remove();
      }
    }, 2000);
    
    console.log('✅ [Avatar] Visibilité FORCÉE avec succès');
  }

  restartIdleAnimation(adventurer) {
    console.log('💤 [Avatar] Redémarrage animation idle...');
    
    const avatarDisplay = adventurer.querySelector('.adventurer-avatar-ultra');
    if (avatarDisplay) {
      // Supprimer l'animation actuelle
      avatarDisplay.style.animation = 'none';
      
      // Forcer un reflow
      avatarDisplay.offsetHeight;
      
      // Redémarrer l'animation idle
      avatarDisplay.style.animation = 'adventurerIdle 4s ease-in-out infinite';
    }
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

    console.log('🔤 [Avatar] Configuration observateur VALIDATIONS (pas lettres individuelles)...');
    
    // Observer SEULEMENT les validations de mots et résultats importants
    const wordGrid = document.getElementById('word-grid') || document.querySelector('.word-grid');
    if (!wordGrid) {
      console.warn('⚠️ [Avatar] Grille de mots non trouvée');
      return;
    }

    this.letterObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        // Observer seulement les changements de classes (correct, present, absent)
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const cell = mutation.target;
          if (cell.classList.contains('grid-cell')) {
            
            // Vérifier si c'est la fin d'une validation (toute la ligne a des classes)
            const row = cell.getAttribute('data-row');
            if (row !== null) {
              const rowCells = document.querySelectorAll(`[data-row="${row}"].grid-cell`);
              const allCellsHaveState = Array.from(rowCells).every(c => 
                c.classList.contains('correct') || 
                c.classList.contains('present') || 
                c.classList.contains('absent')
              );
              
              if (allCellsHaveState) {
                console.log('✅ [Avatar] Validation de mot détectée pour ligne:', row);
                
                // Analyser le résultat de la ligne
                const correctCount = Array.from(rowCells).filter(c => c.classList.contains('correct')).length;
                const presentCount = Array.from(rowCells).filter(c => c.classList.contains('present')).length;
                const word = Array.from(rowCells).map(c => c.textContent).join('');
                
                if (correctCount === rowCells.length) {
                  // Mot entièrement correct
                  this.triggerAdventureReaction('wordCorrect', { word, correctCount });
                } else if (correctCount > 0 || presentCount > 0) {
                  // Mot partiellement correct
                  this.triggerAdventureReaction('wordPartial', { word, correctCount, presentCount });
                } else {
                  // Mot complètement faux
                  this.triggerAdventureReaction('wordWrong', { word });
                }
              }
            }
          }
        }
      });
    });

    // Observer avec options pour les changements de classes
    this.letterObserver.observe(wordGrid, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true
    });

    // Observer les entrées clavier pour réactions légères
    this.setupKeyboardObserver();
  }

  setupKeyboardObserver() {
    console.log('⌨️ [Avatar] Configuration observateur clavier (réactions légères)...');
    
    // Observer seulement les événements importants du clavier
    document.addEventListener('keydown', (event) => {
      if (!this.isGameActive()) return;
      
      const key = event.key.toUpperCase();
      
      // SEULEMENT Enter et effacement (pas chaque lettre)
      if (key === 'ENTER') {
        this.triggerAdventureReaction('wordSubmitted', { source: 'keyboard' });
      } else if (key === 'BACKSPACE') {
        // Réaction très légère pour l'effacement
        this.triggerAdventureReaction('letterErased', { source: 'keyboard' });
      }
      // Plus de réaction à chaque lettre tapée
    });

    // Observer les clics sur le clavier virtuel
    const keyboard = document.getElementById('keyboard') || document.querySelector('.keyboard');
    if (keyboard) {
      keyboard.addEventListener('click', (event) => {
        if (!this.isGameActive()) return;
        
        const button = event.target.closest('.key-btn');
        if (button) {
          const keyText = button.textContent.trim();
          
          // SEULEMENT les actions importantes
          if (keyText === 'ENTER') {
            this.triggerAdventureReaction('wordSubmitted', { source: 'virtual' });
          } else if (keyText === '⌫') {
            this.triggerAdventureReaction('letterErased', { source: 'virtual' });
          }
          // Plus de réaction à chaque lettre
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

  /**
   * Déclenche une réaction d'aventure ULTRA-SIMPLIFIÉE
   * FIXÉ pour éviter les erreurs en boucle
   */
  triggerAdventureReaction(eventType, data = {}) {
    try {
      console.log(`🎭 [Avatar] SIMPLE Adventure reaction: ${eventType}`, data);
      
      const avatar = document.querySelector('#ultra-adventurer');
      if (!avatar) return false;
      // Notify AI brain
      if (this.notifyBrain) {
        this.notifyBrain(eventType, data);
      }
      
      // Réactions ULTRA-SIMPLIFIÉES sans méthodes complexes
      switch (eventType) {
        case 'word_correct':
        case 'word_found':
          this.triggerPhysicalReaction('hop', '0.8s', 2);
          this.showSpeechBubble('Great!', 2000);
          this.changeAura('success', 3000);
        break;
        
        case 'word_invalid':
        case 'word_incorrect':
          this.triggerPhysicalReaction('shake', '0.5s', 3);
          this.showSpeechBubble('Try again!', 2000);
        break;
        
        case 'combo':
        case 'streak':
          // Réaction combo SIMPLIFIÉE
          this.triggerPhysicalReaction('pump', '0.6s', 2);
          this.showSpeechBubble('Combo!', 1500);
          this.changeAura('fire', 2000);
        break;
        
        case 'level_up':
        case 'achievement':
          this.triggerPhysicalReaction('dance', '2s', 2);
          this.showSpeechBubble('Level Up!', 3000);
          this.changeAura('victory', 4000);
        break;
        
        case 'game_start':
          this.triggerPhysicalReaction('nod', '0.5s', 1);
          this.showSpeechBubble('Let\'s go!', 2000);
        break;
        
        case 'game_over':
          this.triggerPhysicalReaction('droop', '1s', 1);
          this.showSpeechBubble('Good try!', 2500);
        break;
        
        case 'powerup_used':
          this.triggerPhysicalReaction('pump', '0.5s', 1);
          this.showSpeechBubble('Power up!', 1500);
          this.changeAura('success', 2000);
        break;
        
      default:
          // Réaction par défaut très simple
          this.triggerPhysicalReaction('gentle', '1s', 1);
          this.showSpeechBubble('Nice!', 1500);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ [Avatar] Erreur réaction aventure:', error);
      return false;
    }
  }

  /**
   * Observer ULTRA-SIMPLIFIÉ pour éviter les boucles infinies
   */
  observeGameEvents() {
    try {
      console.log('👁️ [Avatar] Observer SIMPLIFIÉ activé');
      
      // Throttle pour éviter les appels excessifs
      let lastEventTime = 0;

  // Méthodes simplifiées pour éviter les erreurs
  createDefaultSpectacle() {
    console.log('🎭 [Avatar] Creating default spectacle (simplified)');
    this.changeAura('success', 2000);
    return true;
  }
  
  createChampionAura() {
    console.log('🏆 [Avatar] Creating champion aura (simplified)');
    this.changeAura('victory', 4000);
    return true;
  }
  
  createComboTrail() {
    console.log('🔥 [Avatar] Creating combo trail (simplified)');
    this.changeAura('fire', 2500);
    return true;
  }
  
  createFireTrail() {
    console.log('🔥 [Avatar] Creating fire trail (simplified)');
    this.changeAura('fire', 3000);
    return true;
  }
  
  createPowerExplosion() {
    console.log('💥 [Avatar] Creating power explosion (simplified)');
    this.changeAura('victory', 3500);
    return true;
  }
  
  /**
   * Nettoie toutes les animations - VERSION ULTRA-ROBUSTE
   */
  clearAllAnimations() {
    try {
      console.log('🧹 [Avatar] Nettoyage COMPLET animations...');
      
      const avatar = document.querySelector('#ultra-adventurer');
      if (avatar) {
        // Reset complet des animations
        avatar.style.animation = '';
        avatar.style.transform = '';
        avatar.style.filter = '';
        avatar.className = avatar.className.replace(/\s*(physical-\w+|spectacle-\w+)\s*/g, ' ');
        
        // Nettoyer l'aura
        this.clearAura();
        
        // Cacher les bulles
        const bubble = avatar.querySelector('.adventure-speech-bubble');
        if (bubble) {
          bubble.style.display = 'none';
        }
        
        console.log('✅ [Avatar] Animations nettoyées');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ [Avatar] Erreur nettoyage animations:', error);
      return false;
    }
  }

  /**
   * Nettoie l'aura
   */
  clearAura() {
    try {
      const avatar = document.querySelector('#ultra-adventurer');
      if (avatar) {
        const aura = avatar.querySelector('.adventure-aura');
        if (aura) {
          aura.className = 'adventure-aura';
          aura.style.background = '';
          aura.style.animation = '';
        }
      }
    } catch (error) {
      console.error('❌ [Avatar] Erreur nettoyage aura:', error);
    }
  }

  /**
   * Affiche une bulle de dialogue
   */
  showSpeechBubble(text, duration = 3000) {
    try {
      const avatar = document.querySelector('#ultra-adventurer');
      if (!avatar) return;
      
      const bubble = avatar.querySelector('.adventure-speech-bubble');
      if (bubble) {
        bubble.textContent = text;
        bubble.style.display = 'block';
        
    setTimeout(() => {
          bubble.style.display = 'none';
        }, duration);
        
        console.log(`💬 [Avatar] Bulle: ${text}`);
      }
    } catch (error) {
      console.error('❌ [Avatar] Erreur bulle:', error);
    }
  }

  /**
   * Déclenche une animation physique
   */
  triggerPhysicalAnimation(animationType) {
    try {
      const avatar = document.querySelector('#ultra-adventurer');
      if (!avatar) return;
      
      // Nettoyer anciennes animations
      avatar.className = avatar.className.replace(/\s*animation-\w+/g, '');
      
      // Mapping des alias vers des classes existantes (évite les classes manquantes)
      const animationMap = {
        physicalHop: 'physicalBounce',
        physicalDance: 'physicalVictoryDance',
        physicalClap: 'physicalPump',
        physicalTilt: 'physicalWiggle',
        physicalShake: 'physicalFlash',
        physicalFireDance: 'physicalVictoryDance'
      };
      const resolved = animationMap[animationType] || animationType;
      
      // Ajouter nouvelle animation
      avatar.classList.add(`animation-${resolved}`);
      
      // Auto-nettoyage après animation
      setTimeout(() => {
        avatar.classList.remove(`animation-${resolved}`);
      }, 3000);
      
      console.log(`🎭 [Avatar] Animation: ${animationType} -> ${resolved}`);
    } catch (error) {
      console.error('❌ [Avatar] Erreur animation:', error);
    }
  }

  /**
   * Change l'aura de l'avatar
   */
  changeAura(type, duration = 3000) {
    try {
      const avatar = document.querySelector('#ultra-adventurer');
      if (!avatar) return;
      
      const aura = avatar.querySelector('.adventure-aura');
      if (aura) {
        // Nettoyer ancienne aura
    aura.className = 'adventure-aura';
    
        // Appliquer nouvelle aura
        aura.classList.add(`${type}-aura`);
        
        // Auto-nettoyage
    setTimeout(() => {
      aura.className = 'adventure-aura';
    }, duration);
        
        console.log(`✨ [Avatar] Aura: ${type}`);
      }
    } catch (error) {
      console.error('❌ [Avatar] Erreur aura:', error);
    }
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

// Exposer la classe et l'instance globalement
window.GameAvatarIntegration = GameAvatarIntegration;
window.gameAvatarIntegration = null;

// Auto-initialisation FORCÉE (sauf si désactivée)
document.addEventListener('DOMContentLoaded', () => {
  if (window.DISABLE_GAME_AVATAR_INTEGRATION) {
    console.log('🚫 [Avatar] Auto-initialisation désactivée par flag');
    return;
  }
  console.log('🚀 [Avatar] DOM loaded - Initialisation FORCÉE');
  
  // Attendre un peu que les autres scripts se chargent
  setTimeout(() => {
    if (!window.gameAvatarIntegration) {
      console.log('🚀 [Avatar] Création instance avatar...');
      window.gameAvatarIntegration = new GameAvatarIntegration({
        gameType: 'auto-detect',
        mobileOptimized: true,
        contextualResponses: true
      });
    } else {
      console.log('🔄 [Avatar] Instance existante détectée, redémarrage...');
      
      // Forcer la recréation de l'avatar
      window.gameAvatarIntegration.createUltraReactiveMiniAdventurer();
      
      // Si on est sur Enigma Scroll, configurer immédiatement
      if (window.location.href.includes('enigma-scroll')) {
        setTimeout(() => {
          window.gameAvatarIntegration.initEnigmaScrollIntegration();
        }, 1000);
      }
    }
  }, 1000);
});

// DOUBLE SÉCURITÉ: Si la page est déjà chargée (sauf si désactivée)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (window.DISABLE_GAME_AVATAR_INTEGRATION) {
    console.log('🚫 [Avatar] Initialisation immédiate désactivée par flag');
  } else {
    console.log('🚀 [Avatar] Page déjà chargée - Initialisation immédiate');
  
  setTimeout(() => {
    if (!window.gameAvatarIntegration) {
      window.gameAvatarIntegration = new GameAvatarIntegration({
        gameType: 'auto-detect',
        mobileOptimized: true,
        contextualResponses: true
      });
    }
    
    // Forcer Enigma Scroll si nécessaire
    if (window.location.href.includes('enigma-scroll')) {
      setTimeout(() => {
        if (window.gameAvatarIntegration && !window.gameAvatarIntegration.isEnigmaScrollInit) {
          window.gameAvatarIntegration.initEnigmaScrollIntegration();
        }
      }, 2000);
    }
  }, 500);
  }
}

// Couche de compatibilité universelle pour l'API window.enigmaAvatar
// S'active uniquement si aucune autre implémentation ne l'a déjà créée
(function installEnigmaAvatarCompatibility() {
  if (window.enigmaAvatar) return;

  const ensureIntegration = () => {
    if (!window.gameAvatarIntegration) {
      try {
        window.gameAvatarIntegration = new GameAvatarIntegration({
          gameType: 'auto-detect',
          mobileOptimized: true,
          contextualResponses: true
        });
      } catch (e) {
        console.warn('[Avatar Bridge] Impossible d\'initialiser GameAvatarIntegration:', e);
      }
    }
    return window.gameAvatarIntegration;
  };

  const show = (text, duration = 2500) => {
    const gi = ensureIntegration();
    gi && gi.showSpeechBubble && gi.showSpeechBubble(text, duration);
  };

  const anim = (type) => {
    const gi = ensureIntegration();
    gi && gi.triggerPhysicalAnimation && gi.triggerPhysicalAnimation(type);
  };

  const aura = (type, duration = 3000) => {
    const gi = ensureIntegration();
    gi && gi.changeAura && gi.changeAura(type, duration);
  };

  window.enigmaAvatar = {
    reactToKeyboardClick: () => {},
    reactToLetterDeletion: () => anim('physicalNod'),
    reactToWordSubmission: () => { show('Let\'s see! 👀', 1800); anim('physicalPump'); },
    reactToPowerUp: (type) => {
      switch (type) {
        case 'hint':
          show('Hint revealed! 💡', 2000); anim('physicalClap'); aura('success', 2000); break;
        case 'skip':
          show('Skipping ahead! ⏭️', 2000); anim('physicalHop'); break;
        case 'time':
          show('Time extended! ⏰', 2000); anim('physicalVictoryDance'); aura('victory', 3000); break;
        default:
          show('Power up! ⚡', 1800); anim('physicalPump'); aura('success', 2000);
      }
    },
    reactToGameStart: () => { show('Game time! 🎮', 2200); anim('physicalVictoryDance'); },
    reactToNewGame: () => { show('Fresh start! 🌟', 1800); anim('physicalHop'); },
    reactToScoreIncrease: (points) => {
      if (points >= 50) { show(`AMAZING! +${points}! 🔥`, 3200); anim('physicalSpin'); aura('victory', 4000); }
      else if (points >= 25) { show(`Excellent! +${points}! ⭐`, 2600); anim('physicalPump'); aura('success', 3000); }
      else if (points >= 15) { show(`Good job! +${points}! 👍`, 2200); anim('physicalHop'); aura('success', 2200); }
      else if (points >= 5) { show(`Nice! +${points}! ✨`, 2000); anim('physicalHop'); }
      else { show(`Keep going! +${points}! 🌟`, 1800); anim('physicalWiggle'); }
    },
    reactToCombo: (combo) => {
      if (combo >= 7) { show(`COMBO x${combo}! 🔥👑`, 3500); anim('physicalSpin'); aura('fire', 4500); }
      else if (combo >= 5) { show(`Combo x${combo}! 🚀`, 2800); anim('physicalBounce'); aura('fire', 3500); }
      else if (combo >= 3) { show(`Streak x${combo}! ✨`, 2400); anim('physicalDance'); aura('success', 2800); }
      else if (combo >= 2) { show(`Combo x${combo}! 🎯`, 2000); anim('physicalClap'); }
      else { show('Good start! 💪', 1600); anim('physicalWave'); }
    },
    reactToGameMessage: (message = '') => {
      const m = String(message).toLowerCase();
      if (m.includes('non valide') || m.includes('invalid')) { show('Try again! 🤔', 2000); anim('physicalTilt'); }
      else if (m.includes('incomplet') || m.includes('incomplete')) { show('Complete the word! ✍️', 2000); anim('physicalNod'); }
      else if (m.includes('temps') || m.includes('time')) { show('Time\'s up! ⏰', 2200); anim('physicalDroop'); aura('fire', 2000); }
      else if (m.includes('félicitations') || m.includes('bravo') || m.includes('congrats')) { show('Great! 🎉', 2500); anim('physicalVictoryDance'); aura('victory', 3500); }
      else { show(message, 2000); }
    },
    playAnimation: (animationType) => anim(animationType),
    showMessage: (text, duration) => show(text, duration),
    isInitialized: true
  };

  console.log('✅ [Avatar Bridge] API window.enigmaAvatar installée (compatibilité globale)');
})();

// Export pour usage externe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameAvatarIntegration;
} 

// =====================
// Lightweight adaptive Avatar Brain
// =====================
class AvatarBrain {
  constructor(integration, options = {}) {
    this.integration = integration;
    this.options = { tts: false, language: 'fr', ...options };
    this.state = {
      mood: 'neutral', // neutral | happy | excited | focused | tired
      streak: 0,
      lastInteractionAt: Date.now(),
      energy: 70, // 0-100
      tipsLevel: 0,
    };

    // Bind bridge
    integration.notifyBrain = (eventType, data) => this.onEvent(eventType, data);

    // Periodic behaviors
    this._interval = setInterval(() => this.tick(), 15000);
  }

  destroy() { try { clearInterval(this._interval); } catch(_) {} }

  speak(text) {
    try {
      if (this.options.tts && 'speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = this.options.language.startsWith('fr') ? 'fr-FR' : 'en-US';
        speechSynthesis.speak(utter);
      }
      this.integration.showSpeechBubble?.(text, 2200);
    } catch (_) { /* ignore */ }
  }

  setMood(mood) {
    this.state.mood = mood;
    const auraMap = { happy: 'success', excited: 'victory', focused: 'success', tired: 'fire', neutral: '' };
    const aura = auraMap[mood] || '';
    if (aura) this.integration.changeAura?.(aura, 1800);
  }

  animate(kind = 'gentle') {
    const map = { gentle: 'physicalWiggle', happy: 'physicalHop', excited: 'physicalVictoryDance', focused: 'physicalNod', tired: 'physicalDroop' };
    this.integration.triggerPhysicalAnimation?.(map[kind] || map.gentle);
  }

  rewardSmall() {
    const msgs = ['Bien joué ! ⭐','Continue comme ça ! 💪','Super ! ✨'];
    this.speak(msgs[Math.floor(Math.random() * msgs.length)]);
    this.animate('happy');
  }

  rewardBig() {
    const msgs = ['INCROYABLE ! 🔥','Tu déchires ! 👑','Champion ! 🏆'];
    this.speak(msgs[Math.floor(Math.random() * msgs.length)]);
    this.animate('excited');
    this.setMood('excited');
  }

  encourage() {
    const msgs = ['On s’\u00accroche ! 🎯','Réfléchis à une autre combinaison… 🧠','Tu y es presque ! ✨'];
    this.speak(msgs[Math.floor(Math.random() * msgs.length)]);
    this.setMood('focused');
    this.animate('focused');
  }

  tipIfNeeded() {
    if (this.state.tipsLevel <= 0) return;
    const tips = [
      'Essaie une autre terminaison…',
      'Pense aux préfixes et suffixes !',
      'Regarde les lettres déjà correctes pour guider ton choix.',
    ];
    this.speak(tips[(this.state.tipsLevel - 1) % tips.length]);
  }

  miniChallenge() {
    const prompts = ['Trouve un mot en 20s pour gagner un bonus ! ⏱️','Fais un combo x3 ! 🚀','Deux mots corrects d’affilée et je danse ! 💃'];
    this.speak(prompts[Math.floor(Math.random() * prompts.length)]);
  }

  onEvent(eventType, data) {
    this.state.lastInteractionAt = Date.now();
    switch (eventType) {
      case 'scoreSmallGain':
        this.state.streak++;
        this.state.energy = Math.min(100, this.state.energy + 3);
        if (data.isBig) this.rewardBig();
        else if (data.isMedium) { this.rewardSmall(); this.tipIfNeeded(); }
        else this.rewardSmall();
        if (this.state.streak % 5 === 0) this.miniChallenge();
        break;
      case 'combo':
        this.state.streak += (data.combo || 1);
        (data.isFire ? this.rewardBig() : this.rewardSmall());
        break;
      case 'comboBroken':
      case 'wordWrong':
      case 'wrongWord':
        this.state.streak = 0;
        this.state.energy = Math.max(0, this.state.energy - 5);
        this.encourage();
        break;
      case 'timeRunningOut':
        this.setMood('focused');
        this.speak(`Plus que ${data.timeLeft}s, reste concentré ! ⏰`);
        break;
      case 'victory':
      case 'wordCorrect':
        this.rewardSmall();
        break;
      case 'gameStart':
        this.setMood('happy');
        this.speak('C’est parti ! 🎮');
        break;
      case 'powerUpUsed':
        this.speak('Power up ! ⚡');
        this.animate('happy');
        break;
      default:
        if (Math.random() < 0.3) this.animate('gentle');
    }
  }

  tick() {
    const idleSec = (Date.now() - this.state.lastInteractionAt) / 1000;
    if (idleSec > 45) {
      this.state.energy = Math.max(0, this.state.energy - 2);
      if (Math.random() < 0.6) this.encourage();
      if (this.state.energy < 30 && this.state.tipsLevel < 2) this.state.tipsLevel++;
    }
    if (Math.random() < 0.25) {
      const fun = [
        'Je peux faire une danse si tu gagnes +20 points ! 💃',
        'On tente un combo ? 🔥',
        'Astuce: observe la position des lettres correctes 👀',
      ];
      this.speak(fun[Math.floor(Math.random() * fun.length)]);
    }
  }
}