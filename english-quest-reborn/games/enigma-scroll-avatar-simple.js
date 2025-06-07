/**
 * ENIGMA SCROLL AVATAR SYSTEM - VERSION ULTRA-REACTIVE
 * Système d'avatar spécialement conçu pour Enigma Scroll
 * Version améliorée avec réactivité maximale à tous les événements !
 */

class EnigmaScrollAvatar {
  constructor() {
    console.log('🎯 [EnigmaAvatar] Initialisation ULTRA-RÉACTIVE...');
    this.avatar = null;
    this.isInitialized = false;
    this.currentScore = 0;
    this.currentCombo = 1;
    this.previousScore = 0;
    this.previousCombo = 1;
    this.isReacting = false;
    this.gameEnded = false;
    this.lastLetterCount = 0;
    this.lastAttempt = 0;
    this.gameStarted = false;
    this.powerUpsUsed = {};
    this.letterTypingCount = 0;
    this.consecutiveCorrectLetters = 0;
    this.wordValidationAttempts = 0;
    this.lastScore = 0;
    this.lastCombo = 0;
    this.lastTimeLeft = 0;
    this.lastAttempts = 0;
    this.lastGridState = '';
    this.messageQueue = [];
    this.reactionQueue = [];
    this.currentPhrase = '';
    this.typingCounter = 0; // Pour espacer les réactions de frappe
    this.lastWordSubmission = 0; // Pour éviter les doublons
    
    // 🎯 NOUVELLES PHRASES ULTRA-RÉACTIVES
    this.phrases = {
      // Réactions aux lettres tapées
      letterTyping: [
        'Nice typing! ✍️', 'Keep writing! 📝', 'Looking good! 👀', 'Type away! ⌨️',
        'Letter by letter! 🔤', 'Building words! 🏗️', 'Spell it out! ✨', 'Write on! 📖'
      ],
      
      // Réactions à la suppression
      letterDeleting: [
        'Rethinking? 🤔', 'Second thoughts? 💭', 'Backspacing! ⬅️', 'Fixing it up! 🔧',
        'Edit mode! ✏️', 'Perfecting! 🎯', 'Correcting! ✅', 'Adjusting! 🔄'
      ],
      
      // Réactions au clic sur les lettres du clavier
      keyboardClick: [
        'Click click! 🖱️', 'Tap tap! 👆', 'Keyboard master! ⌨️', 'Letter picker! 🎯',
        'Clicking away! 💫', 'Touch typing! 👍', 'Key selection! 🔑', 'Button pusher! 🎮'
      ],
      
      // Réactions à la validation de mot
      wordSubmission: [
        'Here we go! 🚀', 'Moment of truth! ⏰', 'Fingers crossed! 🤞', 'Let\'s see! 👀',
        'Submit time! ⚡', 'Testing word! 🧪', 'Word check! ✔️', 'Validation mode! 🔍'
      ],
      
      scoreGood: [
        'Nice work! 👍', 'Well done! ⭐', 'Good job! 🎯', 'Excellent! 💪',
        'Keep it up! 🚀', 'You got it! ✨', 'Smart move! 🧠', 'Brilliant! 💎',
        'Awesome! 🌟', 'Perfect! 🎉', 'Outstanding! 👏', 'Superb! 🏆'
      ],
      scoreExcellent: [
        'AMAZING! 🔥', 'FANTASTIC! 🌟', 'INCREDIBLE! ⚡', 'OUTSTANDING! 👑',
        'PHENOMENAL! 💥', 'SPECTACULAR! 🎉', 'MIND-BLOWING! 🤯', 'LEGENDARY! 🏆',
        'EXTRAORDINARY! ✨', 'MAGNIFICENT! 🎭', 'SENSATIONAL! 🎪', 'STUPENDOUS! 🎨'
      ],
      combo: [
        'Combo streak! 🔥', 'On fire! ⚡', 'Unstoppable! 💪', 'Chain master! ⛓️',
        'Rolling hot! 🌶️', 'Streak king! 👑', 'Combo genius! 🧠', 'Fire mode! 🚀',
        'Hot streak! 🌟', 'Chain reaction! ⚡', 'Combo fever! 🔥', 'Streak master! 👑'
      ],
      comboMega: [
        'COMBO MADNESS! 🔥👑', 'YOU\'RE ON FIRE! ⚡🌟', 'UNSTOPPABLE FORCE! 💥💪',
        'COMBO LEGEND! 🏆⚡', 'STREAK MASTER! 🚀🔥', 'ABSOLUTELY INSANE! 🤯💎',
        'COMBO EXPLOSION! 💥🎉', 'STREAK CHAMPION! 👑🔥', 'MEGA COMBO! 🚀👑'
      ],
      
      // 🎯 NOUVELLES RÉACTIONS POWER-UPS
      powerUpUsed: [
        'Power up activated! ⚡', 'Boost mode! 🚀', 'Special power! ✨', 'Enhanced! 💫',
        'Powered up! 🔋', 'Super mode! 🦸‍♂️', 'Ability used! 🎯', 'Skill activated! 🧠'
      ],
      
      // Réactions spécifiques aux power-ups
      hintUsed: [
        'Hint revealed! 💡', 'Clue time! 🔍', 'Help is here! 🆘', 'Mystery solved! 🕵️‍♂️',
        'Enlightenment! ✨', 'Guidance given! 🧭', 'Tip delivered! 📝', 'Secret revealed! 🗝️'
      ],
      skipUsed: [
        'Skipping ahead! ⏭️', 'Next challenge! 🎯', 'Moving on! 🚶‍♂️', 'Fresh start! 🌱',
        'New opportunity! 🌟', 'Onwards! ⬆️', 'Different path! 🛤️', 'Skip mode! ⚡'
      ],
      timeBoostUsed: [
        'Time extended! ⏰', 'More time! ⏱️', 'Clock boosted! 🕐', 'Extra seconds! ⏳',
        'Time gift! 🎁', 'Clock magic! 🪄', 'Time boost! 🚀', 'Extended play! ⏰'
      ],
      
      // Réactions à l'encouragement
      encouragement: [
        'You can do it! 💪', 'Keep trying! 🎯', 'Don\'t give up! 🚀',
        'Stay focused! 🧠', 'Push forward! ⚡', 'Believe in yourself! ⭐',
        'Almost there! 🎊', 'You\'re close! 🎯', 'Keep going! 💪', 'Never quit! 🔥'
      ],
      
      // Messages d'erreur améliorés
      invalidWord: [
        'Oops! Try again! 🤔', 'Not quite! 😅', 'Almost! Keep going! 💪', 'Try different! 🔄',
        'Hmm, not this one! 🤷‍♂️', 'Different word! 📖', 'Keep searching! 🔍', 'Try again! 🎯'
      ],
      
      incompleteWord: [
        'Need more letters! ✍️', 'Fill it up! 📝', 'Complete the word! 🎯', 'More typing! ⌨️',
        'Keep writing! 📖', 'Add more letters! 🔤', 'Finish the word! ✅', 'Type more! 💻'
      ],
      
      timeWarning: [
        'Time running out! ⏰', 'Hurry up! 🏃‍♂️', 'Clock ticking! ⏱️', 'Move fast! ⚡',
        'Time pressure! ⏰💨', 'Speed up! 🚀', 'Quick thinking! ⚡🧠', 'Racing time! 🏁'
      ],
      timeCritical: [
        'FINAL SECONDS! 🚨', 'NOW OR NEVER! ⏰💥', 'LAST CHANCE! 🔥⏱️',
        'TIME\'S UP SOON! ⚡🚨', 'CRITICAL MOMENT! 💥⏰', 'FINAL PUSH! 🚀🔥'
      ],
      
      // Messages de début et fin de partie améliorés
      gameStart: [
        'Let\'s solve puzzles! 🧩', 'Ready for words! 📚', 'Game time! 🎮', 'Adventure begins! 🗺️',
        'Word quest starts! ⚔️', 'Puzzle mode on! 🧠', 'Let\'s crack codes! 🔓', 'Mind games! 🎯'
      ],
      
      gameEnd: {
        excellent: ['MASTERFUL PERFORMANCE! 🏆👑', 'WORD WIZARD! 🧙‍♂️✨', 'PUZZLE CHAMPION! 🥇🎯', 'GENIUS LEVEL! 🧠💎'],
        good: ['WELL PLAYED! 🎉👏', 'GREAT EFFORT! 💪⭐', 'NICE GAME! 🎮✨', 'SOLID WORK! 👍🎯'],
        average: ['GOOD TRY! 👍🎯', 'KEEP PRACTICING! 📚💪', 'NOT BAD! ⭐🚀', 'DECENT EFFORT! 💪⭐'],
        poor: ['BETTER LUCK NEXT TIME! 🍀', 'PRACTICE MAKES PERFECT! 📖', 'TRY AGAIN! 🔄💪', 'KEEP LEARNING! 📚🎯']
      }
    };
    
    // 🔥 Configuration utilisateur des skins
    this.userSkins = this.getUserSkinChoices();
    
    // 📊 Surveillance des performances
    this.performanceMetrics = {
      averageTime: 0,
      averageScore: 0,
      streak: 0,
      wordsFound: 0
    };
    
    console.log('🎮 [EnigmaAvatar] Initialisation système avatar ULTRA-RÉACTIF...');
    this.init();
  }
  
  init() {
    // 0. Configurer l'écouteur d'authentification pour les skins
    this.setupAuthListener();
    
    // 1. Créer l'avatar immédiatement
    this.createAvatar();
    
    // 2. Attendre un peu puis démarrer les observateurs
    setTimeout(() => {
      this.startWatching();
      this.setupGameEventListeners(); // 🎯 NOUVELLE FONCTION
      this.isInitialized = true;
      console.log('✅ [EnigmaAvatar] Système ULTRA-RÉACTIF initialisé!');
      
      // Message de bienvenue plus engageant
      const greetings = this.phrases.gameStart;
      this.showMessage(this.getRandomPhrase(greetings), 3000);
      this.playAnimation('physicalHop');
    }, 1000);
  }
  
  // 🔐 Configurer l'écouteur d'authentification pour les changements de skins
  setupAuthListener() {
    console.log('🔐 [EnigmaAvatar] Configuration de l\'écouteur d\'authentification...');
    
    // Écouter les changements via le service d'authentification
    if (window.authService && typeof window.authService.addAuthStateListener === 'function') {
      window.authService.addAuthStateListener((user) => {
        console.log('🔄 [EnigmaAvatar] Changement d\'authentification détecté:', user);
        
        if (user && user.avatar) {
          console.log('🎨 [EnigmaAvatar] Nouveaux skins utilisateur détectés, mise à jour...');
          this.userSkins = this.getUserSkinChoices();
          this.createAvatar(); // Recréer l'avatar avec les nouveaux skins
        }
      });
    }
  }
  
  createAvatar() {
    console.log('🎨 [EnigmaAvatar] Création avatar...');
    
    // Supprimer ancien avatar
    const existing = document.getElementById('enigma-avatar');
    if (existing) existing.remove();
    
    // Récupérer les chemins des images selon les choix utilisateur
    const imagePaths = this.getAvatarImagePaths();
    console.log('🖼️ [EnigmaAvatar] Chemins des images:', imagePaths);
    
    // Créer nouvel avatar
    const avatar = document.createElement('div');
    avatar.id = 'enigma-avatar';
    
    // Appliquer l'arrière-plan choisi par l'utilisateur
    const backgroundStyle = this.userSkins.background !== 'default' 
      ? `background-image: url('${imagePaths.background}'); background-size: cover; background-position: center; border-radius: 15px;`
      : '';
    
    avatar.style.cssText = `
      position: fixed !important;
      top: 10vh !important;
      right: 5vw !important;
      width: 80px !important;
      height: 120px !important;
      z-index: 99999 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: none !important;
      transition: all 0.3s ease;
      animation: gentle-living-breathing 2.5s ease-in-out infinite, 
                 page-wandering 20s ease-in-out infinite,
                 subtle-avatar-glow 4s ease-in-out infinite;
      ${backgroundStyle}
    `;
    
    avatar.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%;">
        <!-- Container pour animations de réaction -->
        <div id="avatar-reaction-container" style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        ">
          <!-- Corps (selon choix utilisateur) -->
          <img src="${imagePaths.body}" 
               style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 70%; height: auto; z-index: 5;"
               onerror="console.error('🚨 Corps non trouvé:', this.src); this.src='../assets/avatars/bodies/default_boy.png';">
          
          <!-- Tête (selon choix utilisateur) -->
          <img src="${imagePaths.head}" 
               style="position: absolute; top: 31%; left: 50%; transform: translateX(-50%); width: 50%; height: auto; z-index: 10;"
               onerror="console.error('🚨 Tête non trouvée:', this.src); this.src='../assets/avatars/heads/default_boy.png';">
          
          <!-- Accessoire (selon choix utilisateur - peut être un GIF) -->
          <div style="position: absolute; top: 30%; right: 15%; width: 25%; height: 25%; z-index: 15;">
            <img src="${imagePaths.accessory}" 
                 style="width: 100%; height: 100%; object-fit: contain;"
                 onerror="console.error('🚨 Accessoire non trouvé:', this.src); this.src='../assets/avatars/accessories/default.gif';">
          </div>
        </div>
        
        <!-- Bulle de dialogue -->
        <div id="avatar-speech" style="
          position: absolute;
          top: -85px;
          left: -80px;
          width: 200px;
          background: linear-gradient(145deg, #2c3e50, #34495e);
          color: white;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          white-space: normal;
          word-wrap: break-word;
          line-height: 1.3;
          display: none;
          z-index: 20;
          box-shadow: 0 6px 15px rgba(0,0,0,0.4);
          min-height: 35px;
          max-width: 220px;
        ">
          <div style="
            position: absolute;
            bottom: -8px;
            right: 30px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #34495e;
          "></div>
        </div>
        
        <!-- Effets -->
        <div id="avatar-effects" style="
          position: absolute;
          top: 15%;
          left: -30px;
          transform: none;
          font-size: 20px;
          z-index: 25;
          text-shadow: 0 0 10px rgba(255,255,255,0.8);
        "></div>
        
        <!-- Aura -->
        <div id="avatar-aura" style="
          position: absolute;
          top: -10%;
          left: -10%;
          right: -10%;
          bottom: -10%;
          border-radius: 50%;
          z-index: 1;
          transition: all 0.5s ease;
        "></div>
      </div>
    `;
    
    document.body.appendChild(avatar);
    this.avatar = avatar;
    
    console.log('✅ [EnigmaAvatar] Avatar créé!');
  }
  
  startWatching() {
    console.log('👀 [EnigmaAvatar] Démarrage surveillance...');
    
    // Surveiller le score toutes les 300ms (plus réactif)
    setInterval(() => {
      this.checkScore();
    }, 300);
    
    // Surveiller le combo toutes les 300ms (plus réactif)
    setInterval(() => {
      this.checkCombo();
    }, 300);
    
    // Surveiller le temps toutes les 500ms (plus réactif)
    setInterval(() => {
      this.checkTime();
      this.checkGameEnd();
    }, 500);
    
    // 🎯 Surveillance réduite des tentatives seulement
    setInterval(() => {
      this.checkGameAttempts();
    }, 1000);
    
    // 🎨 Surveiller les changements de skins utilisateur toutes les 30 secondes (réduit la fréquence)
    setInterval(() => {
      this.updateAvatarSkins();
    }, 30000);
    
    // Surveiller les messages du jeu
    this.watchGameMessages();
    
    console.log('✅ [EnigmaAvatar] Surveillance ULTRA-RÉACTIVE active!');
  }
  
  // 🎯 NOUVELLE FONCTION : Configuration des écouteurs d'événements
  setupGameEventListeners() {
    console.log('🎧 [EnigmaAvatar] Configuration des écouteurs d\'événements...');
    
    // 1. Écouter les clics sur le clavier virtuel
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-key]') || event.target.closest('[data-key]')) {
        const key = event.target.getAttribute('data-key') || event.target.closest('[data-key]').getAttribute('data-key');
        if (key && key !== 'Enter' && key !== 'Backspace') {
          this.reactToKeyboardClick(key);
        } else if (key === 'Enter') {
          this.reactToWordSubmission();
        } else if (key === 'Backspace') {
          this.reactToLetterDeletion();
        }
      }
      
      // 2. Écouter les clics sur les power-ups
      if (event.target.matches('.power-up') || event.target.closest('.power-up')) {
        const powerUpElement = event.target.closest('.power-up');
        const powerUpType = powerUpElement.getAttribute('data-type');
        this.reactToPowerUp(powerUpType);
      }
      
      // 3. Écouter les clics sur les boutons de difficulté
      if (event.target.matches('[onclick*="startGame"]') || event.target.closest('[onclick*="startGame"]')) {
        setTimeout(() => {
          this.reactToGameStart();
        }, 500);
      }
      
      // 4. Écouter les clics sur "Nouveau Jeu"
      if (event.target.matches('[onclick*="newGame"]') || event.target.closest('[onclick*="newGame"]')) {
        setTimeout(() => {
          this.reactToNewGame();
        }, 300);
      }
    });
    
    // 5. Écouter les événements clavier physique
    document.addEventListener('keydown', (event) => {
      if (event.key.match(/^[a-zA-Z]$/)) {
        this.reactToKeyboardClick(event.key.toUpperCase());
      } else if (event.key === 'Enter') {
        this.reactToWordSubmission();
      } else if (event.key === 'Backspace') {
        this.reactToLetterDeletion();
      }
    });
    
    // 6. Observer les changements dans la grille de jeu
    const wordGrid = document.getElementById('word-grid');
    if (wordGrid) {
      const gridObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            this.checkGridChanges();
          }
        });
      });
      
      gridObserver.observe(wordGrid, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
    
    console.log('✅ [EnigmaAvatar] Écouteurs d\'événements configurés!');
  }
  
  // 🎯 NOUVELLES FONCTIONS DE RÉACTION
  
  // Réaction au clic sur le clavier (ultra-réduite)
  reactToKeyboardClick(key) {
    // 🎯 RÉACTION ULTRA-RÉDUITE - Presque jamais
    this.letterTypingCount++;
    
    // Réagir très rarement (seulement toutes les 20-30 lettres)
    if (this.letterTypingCount % (20 + Math.floor(Math.random() * 10)) === 0) {
      if (Math.random() < 0.1) { // Seulement 10% de chance
        const message = this.getRandomPhrase(this.phrases.keyboardClick);
        this.showMessage(message, 1000);
        
        console.log(`⌨️ [EnigmaAvatar] Réaction clavier ultra-rare: ${key}`);
      }
    }
  }
  
  // Réaction à la suppression de lettre (désactivée)
  reactToLetterDeletion() {
    // 🎯 RÉACTION DÉSACTIVÉE pour réduire le spam
    // Plus de réaction aux suppressions de lettres
    console.log('⬅️ [EnigmaAvatar] Suppression détectée (réaction désactivée)');
  }
  
  // Réaction à la soumission de mot (anticipation)
  reactToWordSubmission() {
    this.wordValidationAttempts++;
    
    // Animation d'anticipation avec nouvelle animation
    const message = this.getRandomPhrase(this.phrases.wordSubmission);
    this.showMessage(message, 2000);
    this.playAnimation('physicalFlash'); // Animation de flash pour l'anticipation
    this.showEffects('🚀');
    this.showAura('success', 1500);
    
    console.log('🚀 [EnigmaAvatar] Réaction soumission mot');
  }
  
  // Réaction aux power-ups
  reactToPowerUp(powerUpType) {
    if (this.isReacting) return;
    this.isReacting = true;
    
    let message, effects, animation;
    
    switch(powerUpType) {
      case 'hint':
        message = this.getRandomPhrase(this.phrases.hintUsed);
        effects = '💡';
        animation = 'physicalClap';
        break;
      case 'skip':
        message = this.getRandomPhrase(this.phrases.skipUsed);
        effects = '⏭️';
        animation = 'physicalHop';
        break;
      case 'time':
        message = this.getRandomPhrase(this.phrases.timeBoostUsed);
        effects = '⏰';
        animation = 'physicalVictoryDance';
        break;
      default:
        message = this.getRandomPhrase(this.phrases.powerUpUsed);
        effects = '⚡';
        animation = 'physicalPump';
    }
    
    this.showMessage(message, 2500);
    this.playAnimation(animation);
    this.showEffects(effects);
    this.showAura('fire', 3000);
    
    console.log(`⚡ [EnigmaAvatar] Réaction power-up: ${powerUpType}`);
    
    setTimeout(() => {
      this.isReacting = false;
    }, 2000);
  }
  
  // Réaction au démarrage de jeu
  reactToGameStart() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    
    const message = this.getRandomPhrase(this.phrases.gameStart);
    this.showMessage(message, 3000);
    this.playAnimation('physicalVictoryDance');
    this.showEffects('🎮');
    this.showAura('victory', 4000);
    
    console.log('🎮 [EnigmaAvatar] Réaction démarrage jeu');
  }
  
  // Réaction au nouveau jeu
  reactToNewGame() {
    this.gameStarted = false;
    this.letterTypingCount = 0;
    this.wordValidationAttempts = 0;
    
    this.showMessage('Fresh start! 🌟', 2000);
    this.playAnimation('physicalHop');
    this.showEffects('🔄');
    
    console.log('🔄 [EnigmaAvatar] Réaction nouveau jeu');
  }
  
  // Vérifier les changements dans la grille
  checkGridChanges() {
    // Compter les lettres actuellement dans la grille
    const filledCells = document.querySelectorAll('.grid-cell.filled');
    const currentLetterCount = filledCells.length;
    
    // Si plus de lettres qu'avant
    if (currentLetterCount > this.lastLetterCount) {
      // Réagir de temps en temps à la frappe
      if (Math.random() < 0.3) {
        const message = this.getRandomPhrase(this.phrases.letterTyping);
        this.showMessage(message, 1200);
        this.showEffects('✍️');
      }
    }
    
    this.lastLetterCount = currentLetterCount;
  }
  
  // Vérifier les tentatives de jeu (encouragement intelligent)
  checkGameAttempts() {
    const attemptsElement = document.getElementById('attempts-display');
    if (!attemptsElement) return;
    
    const attemptsText = attemptsElement.textContent || '0/0';
    const currentAttempt = parseInt(attemptsText.split('/')[0]) || 0;
    const maxAttempts = parseInt(attemptsText.split('/')[1]) || 6;
    
    if (currentAttempt > this.lastAttempt) {
      // Analyser la situation pour un encouragement adapté
      const isStrugglingPlayer = currentAttempt >= Math.floor(maxAttempts * 0.7);
      const averageScore = this.currentScore / Math.max(this.wordValidationAttempts, 1);
      const needsEncouragement = isStrugglingPlayer || averageScore < 10;
      
      if (needsEncouragement && Math.random() < 0.8) {
        // Encouragement fort pour les joueurs en difficulté
        const message = "Keep fighting! You can do this! 🔥";
        this.showMessage(message, 2500);
        this.playAnimation('physicalGlow');
        this.showEffects('💪🔥');
        this.showAura('success', 2000);
      } else if (Math.random() < 0.3) {
        // Encouragement léger pour les autres
        const message = this.getRandomPhrase(this.phrases.encouragement);
        this.showMessage(message, 1800);
        this.playAnimation('physicalNod');
        this.showEffects('👍');
      }
      
      this.lastAttempt = currentAttempt;
    }
  }
  
  checkScore() {
    const scoreElement = document.getElementById('score-display');
    if (!scoreElement) return;
    
    const newScore = parseInt(scoreElement.textContent) || 0;
    
    if (newScore > this.currentScore) {
      const diff = newScore - this.currentScore;
      console.log(`📈 [EnigmaAvatar] Score: ${this.currentScore} → ${newScore} (+${diff})`);
      
      this.currentScore = newScore;
      this.reactToScoreIncrease(diff);
    }
  }
  
  checkCombo() {
    const comboElement = document.getElementById('combo-display');
    if (!comboElement) return;
    
    const comboText = comboElement.textContent || '1x';
    const newCombo = parseInt(comboText.replace('x', '')) || 1;
    
    if (newCombo > this.currentCombo) {
      console.log(`🔥 [EnigmaAvatar] Combo: ${this.currentCombo} → ${newCombo}`);
      
      this.currentCombo = newCombo;
      this.reactToCombo(newCombo);
    } else if (newCombo < this.currentCombo) {
      // Combo reset
      this.currentCombo = newCombo;
    }
  }
  
  checkTime() {
    const timeElement = document.getElementById('time-display');
    if (!timeElement) return;
    
    const timeLeft = parseInt(timeElement.textContent) || 0;
    
    // Réagir quand le temps devient critique
    if (timeLeft === 30) {
      const message = this.getRandomPhrase(this.phrases.timeWarning);
      this.showMessage(message, 2000);
      this.playAnimation('physicalTilt');
    } else if (timeLeft === 10) {
      const message = this.getRandomPhrase(this.phrases.timeCritical);
      this.showMessage(message, 2000);
      this.playAnimation('physicalShake');
      this.showAura('fire', 3000);
    } else if (timeLeft === 5) {
      this.showMessage('5 SECONDS LEFT! 🚨', 2000);
      this.playAnimation('physicalPanicWave');
      this.showAura('fire', 5000);
    }
  }
  
  watchGameMessages() {
    // Observer les messages du jeu
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1 && node.classList.contains('game-message')) {
                const messageText = node.textContent || '';
                this.reactToGameMessage(messageText);
              }
            });
          }
        });
      });
      
      observer.observe(messageContainer, { childList: true });
      console.log('👀 [EnigmaAvatar] Surveillance messages activée');
    }
  }
  
  reactToScoreIncrease(points) {
    // 🎯 SYSTÈME ADAPTATIF BASÉ SUR LA PERFORMANCE
    console.log(`🎯 [EnigmaAvatar] Réaction score +${points}`);
    
    // Analyser la performance globale
    const averageScore = this.currentScore / Math.max(this.wordValidationAttempts, 1);
    const isPerformingWell = averageScore > 15 && this.currentCombo > 1;
    const isPerformingPoorly = averageScore < 8 || this.wordValidationAttempts > 5;
    
    let message, animation, effects, aura, duration;
    
    if (points >= 50) {
      // Excellente performance - Célébration majeure
      message = this.getRandomPhrase(this.phrases.scoreExcellent) + ` +${points}!`;
      animation = 'physicalSpin'; // 🎯 Utilisation des nouvelles animations
      effects = '🔥✨🏆';
      aura = { type: 'victory', duration: 5000 };
      duration = 4000;
    } else if (points >= 25) {
      // Bonne performance - Célébration moyenne
      message = this.getRandomPhrase(this.phrases.scoreGood) + ` +${points}!`;
      animation = isPerformingWell ? 'physicalBounce' : 'physicalVictoryDance';
      effects = '⭐🎉⭐';
      aura = { type: 'success', duration: 3500 };
      duration = 3000;
    } else if (points >= 15) {
      // Performance correcte
      message = this.getRandomPhrase(this.phrases.scoreGood) + ` +${points}!`;
      animation = 'physicalPump';
      effects = '⭐💫';
      aura = { type: 'success', duration: 2500 };
      duration = 2500;
    } else if (points >= 5) {
      // Performance modeste - Encouragement adapté
      if (isPerformingPoorly) {
        message = "Keep trying! +" + points + " points! 💪";
        animation = 'physicalNod';
        effects = '💪';
        aura = { type: 'success', duration: 2000 };
      } else {
        message = "Good start! +" + points + " points! 👍";
        animation = 'physicalHop';
        effects = '✨';
        aura = null;
      }
      duration = 2000;
    } else {
      // Faible score - Encouragement fort
      message = "Don't give up! +" + points + " points! 🌟";
      animation = 'physicalWiggle';
      effects = '🌟';
      aura = { type: 'success', duration: 1500 };
      duration = 2000;
    }
    
    // Appliquer toutes les réactions
    this.showMessage(message, duration);
    this.playAnimation(animation);
    this.showEffects(effects);
    if (aura) {
      this.showAura(aura.type, aura.duration);
    }
    
    // Cooldown adapté à la performance
    this.isReacting = true;
    setTimeout(() => {
      this.isReacting = false;
    }, Math.min(duration * 0.6, 1200));
  }
  
  reactToCombo(combo) {
    // 🎯 SYSTÈME COMBO SPECTACULAIRE AVEC NOUVELLES ANIMATIONS
    console.log(`🔥 [EnigmaAvatar] Réaction combo x${combo}`);
    
    let message, animation, effects, aura, duration;
    
    if (combo >= 7) {
      // Combo légendaire - Animation la plus spectaculaire
      message = this.getRandomPhrase(this.phrases.comboMega) + ` x${combo}!`;
      animation = 'physicalSpin'; // Rotation complète
      effects = '🔥💥🏆';
      aura = { type: 'fire', duration: 6000 };
      duration = 5000;
    } else if (combo >= 5) {
      // Super combo - Animation impressionnante
      message = this.getRandomPhrase(this.phrases.comboMega) + ` x${combo}!`;
      animation = 'physicalBounce'; // Rebonds énergiques
      effects = '🔥⚡🔥';
      aura = { type: 'fire', duration: 4500 };
      duration = 4000;
    } else if (combo >= 3) {
      // Bon combo - Animation notable
      message = this.getRandomPhrase(this.phrases.combo) + ` x${combo}!`;
      animation = 'physicalFloat'; // Flottement magique
      effects = '⭐✨⭐';
      aura = { type: 'success', duration: 3500 };
      duration = 3000;
    } else if (combo >= 2) {
      // Début de combo - Animation encourageante
      message = `Combo x${combo}! Keep going! 🎯`;
      animation = 'physicalZoom'; // Zoom dramatique
      effects = '🎯⭐';
      aura = { type: 'success', duration: 2500 };
      duration = 2500;
    } else {
      // Premier essai - Encouragement léger
      message = 'Good start! Keep it up! 💪';
      animation = 'physicalWave'; // Vague douce
      effects = '💪';
      aura = null;
      duration = 1800;
    }
    
    // Appliquer toutes les réactions
    this.showMessage(message, duration);
    this.playAnimation(animation);
    this.showEffects(effects);
    if (aura) {
      this.showAura(aura.type, aura.duration);
    }
    
    // Cooldown réduit pour les combos
    this.isReacting = true;
    setTimeout(() => {
      this.isReacting = false;
    }, Math.min(duration * 0.4, 800));
  }
  
  reactToGameMessage(message) {
    console.log(`📢 [EnigmaAvatar] Message du jeu: ${message}`);
    
    // 🎯 RÉACTIONS ULTRA-AMÉLIORÉES AUX MESSAGES
    
    if (message.includes('Invalid') || message.includes('non valide') || message.includes('Mot non valide')) {
      // Analyser la performance pour adapter l'encouragement
      const needsMoreEncouragement = this.wordValidationAttempts > 3 || this.currentScore < 20;
      
      if (needsMoreEncouragement) {
        this.showMessage("Don't worry! Try another word! 💪", 2500);
        this.playAnimation('physicalWiggle');
        this.showEffects('💪🌟');
      } else {
        const encourageMsg = this.getRandomPhrase(this.phrases.invalidWord);
        this.showMessage(encourageMsg, 2000);
        this.playAnimation('physicalTilt');
        this.showEffects('🤔');
      }
    } 
    else if (message.includes('Incomplete') || message.includes('incomplet') || message.includes('Mot incomplet')) {
      const incompleteMsg = this.getRandomPhrase(this.phrases.incompleteWord);
      this.showMessage(incompleteMsg, 2000);
      this.playAnimation('physicalNod');
      this.showEffects('✍️');
    } 
    else if (message.includes('Time') || message.includes('Temps') || message.includes('écoulé')) {
      this.showMessage('Time\'s up! 😅', 3000);
      this.playAnimation('physicalDroop');
      this.showEffects('⏰');
      this.showAura('fire', 2000);
    } 
    else if (message.includes('Excellent') || message.includes('Bravo') || message.includes('Félicitations')) {
      const excellentMsg = this.getRandomPhrase(this.phrases.scoreExcellent);
      this.showMessage(excellentMsg, 3000);
      this.playAnimation('physicalVictoryDance');
      this.showAura('victory', 4000);
      this.showEffects('🎉');
    }
    else if (message.includes('Score') || message.includes('points')) {
      // Réagir aux messages de score
      const scoreMsg = this.getRandomPhrase(this.phrases.scoreGood);
      this.showMessage(scoreMsg, 2500);
      this.playAnimation('physicalPump');
      this.showEffects('⭐');
      this.showAura('success', 3000);
    }
    else if (message.includes('Nouveau') || message.includes('New') || message.includes('partie')) {
      // Nouveau jeu/partie
      const startMsg = this.getRandomPhrase(this.phrases.gameStart);
      this.showMessage(startMsg, 2500);
      this.playAnimation('physicalHop');
      this.showEffects('🎮');
    }
    else if (message.includes('Dommage') || message.includes('perdu') || message.includes('mot était')) {
      // Partie perdue
      const encourageMsg = this.getRandomPhrase(this.phrases.encouragement);
      this.showMessage(encourageMsg, 3000);
      this.playAnimation('physicalDroop');
      this.showEffects('😔');
      this.showAura('fire', 2000);
    }
    else if (message.includes('mot') && message.includes('lettres')) {
      // Nouveau mot annoncé
      this.showMessage('New challenge! 🎯', 2000);
      this.playAnimation('physicalClap');
      this.showEffects('🧩');
    }
  }
  
  showMessage(text, duration = 3000) {
    const bubble = document.getElementById('avatar-speech');
    if (!bubble) return;
    
    bubble.textContent = text;
    bubble.style.display = 'block';
    
    console.log(`💬 [EnigmaAvatar] Message: ${text}`);
    
    setTimeout(() => {
      bubble.style.display = 'none';
    }, duration);
  }
  
  playAnimation(animationType) {
    if (!this.avatar) return;
    
    console.log(`🎭 [EnigmaAvatar] Animation: ${animationType}`);
    
    // Trouver le container de réaction - JAMAIS toucher à l'avatar principal !
    const reactionContainer = document.getElementById('avatar-reaction-container');
    if (!reactionContainer) {
      console.log('❌ [EnigmaAvatar] Container de réaction non trouvé');
      return;
    }
    
    // 🎭 ANIMATIONS ULTRA-ÉTENDUES
    const animations = {
      // Animations existantes améliorées
      'physicalHop': 'enigma-hop 0.8s ease-in-out 2',
      'physicalPump': 'enigma-pump 0.6s ease-in-out 3',
      'physicalDance': 'enigma-dance 2s ease-in-out 1',
      'physicalVictoryDance': 'enigma-victory 2.5s ease-in-out 1',
      'physicalFireDance': 'enigma-fire 2s ease-in-out 1',
      'physicalClap': 'enigma-clap 1s ease-in-out 2',
      'physicalTilt': 'enigma-tilt 0.6s ease-in-out 3',
      'physicalShake': 'enigma-shake 0.6s ease-in-out 4',
      'physicalNod': 'enigma-nod 0.8s ease-in-out 2',
      'physicalDroop': 'enigma-droop 1.5s ease-in-out 1',
      'physicalPanicWave': 'enigma-panic 0.5s ease-in-out infinite',
      
      // 🎯 NOUVELLES ANIMATIONS RÉACTIVES
      'physicalBounce': 'enigma-bounce 0.7s ease-in-out 2',
      'physicalSpin': 'enigma-spin 1.5s ease-in-out 1',
      'physicalWiggle': 'enigma-wiggle 0.8s ease-in-out 2',
      'physicalGlow': 'enigma-glow 1s ease-in-out 2',
      'physicalFloat': 'enigma-float 2s ease-in-out 1',
      'physicalZoom': 'enigma-zoom 0.6s ease-in-out 1',
      'physicalFlash': 'enigma-flash 0.4s ease-in-out 3',
      'physicalWave': 'enigma-wave 1.2s ease-in-out 1'
    };
    
    const reactionAnimation = animations[animationType] || animations['physicalHop'];
    
    // Appliquer l'animation UNIQUEMENT au container de réaction
    reactionContainer.style.animation = reactionAnimation;
    
    console.log(`✅ [EnigmaAvatar] Animation ${animationType} appliquée au container`);
    
    // Nettoyer l'animation du container après
    setTimeout(() => {
      if (reactionContainer) {
        reactionContainer.style.animation = '';
        console.log(`🧹 [EnigmaAvatar] Animation ${animationType} nettoyée`);
      }
    }, 3000);
  }
  
  showEffects(emoji) {
    const effects = document.getElementById('avatar-effects');
    if (!effects) return;
    
    effects.textContent = emoji;
    effects.style.display = 'block';
    effects.style.animation = 'floating-effects 2s ease-in-out';
    
    setTimeout(() => {
      effects.style.display = 'none';
      effects.style.animation = '';
    }, 2000);
  }
  
  showAura(type, duration = 3000) {
    const aura = document.getElementById('avatar-aura');
    if (!aura) return;
    
    // Reset aura
    aura.style.background = '';
    aura.style.animation = '';
    
    // Types d'auras
    const auras = {
      'success': 'radial-gradient(circle, rgba(46, 204, 113, 0.4), rgba(22, 160, 133, 0.1))',
      'fire': 'radial-gradient(circle, rgba(231, 76, 60, 0.5), rgba(192, 57, 43, 0.2))',
      'victory': 'radial-gradient(circle, rgba(255, 215, 0, 0.6), rgba(255, 193, 7, 0.3))'
    };
    
    aura.style.background = auras[type] || auras['success'];
    aura.style.animation = `enigma-aura-${type} 0.5s ease-in-out infinite alternate`;
    
    console.log(`✨ [EnigmaAvatar] Aura: ${type}`);
    
    setTimeout(() => {
      aura.style.background = '';
      aura.style.animation = '';
    }, duration);
  }
  
  // Méthode pour phrases aléatoires
  getRandomPhrase(phraseArray) {
    return phraseArray[Math.floor(Math.random() * phraseArray.length)];
  }
  
  // Détection de fin de partie
  checkGameEnd() {
    const timeElement = document.getElementById('time-display');
    if (!timeElement) return;
    
    const timeLeft = parseInt(timeElement.textContent) || 0;
    
    // Détecter fin de partie
    if (timeLeft === 0 && !this.gameEnded) {
      this.gameEnded = true;
      this.handleGameEnd();
    }
  }
  
  // Réaction de fin de partie
  handleGameEnd() {
    console.log('🏁 [EnigmaAvatar] Fin de partie détectée');
    
    // Évaluer la performance basée sur le score
    let performance;
    if (this.currentScore >= 200) {
      performance = 'excellent';
    } else if (this.currentScore >= 100) {
      performance = 'good';
    } else if (this.currentScore >= 50) {
      performance = 'average';
    } else {
      performance = 'poor';
    }
    
    // Message de fin adapté
    const endMessage = this.getRandomPhrase(this.phrases.gameEnd[performance]);
    
    setTimeout(() => {
      this.showMessage(endMessage, 5000);
      this.playAnimation('physicalVictoryDance');
      this.showAura('victory', 6000);
      this.showEffects('🏁🎉🏆');
    }, 1000);
  }
  
  // Méthodes publiques pour tests manuels
  testMessage() {
    this.showMessage('Test message! 🧪', 3000);
  }
  
  testAnimation() {
    this.playAnimation('physicalVictoryDance');
  }
  
  testReaction() {
    this.reactToScoreIncrease(25);
  }
  
  // 🎨 Nouvelle fonction pour récupérer les choix de skins de l'utilisateur
  getUserSkinChoices() {
    console.log('🎨 [EnigmaAvatar] Récupération des skins utilisateur...');
    
    try {
      // 1. Méthode compatible avec firebase-config.js et auth-state.js
      if (typeof getCurrentUser === 'function') {
        const currentUser = getCurrentUser();
        console.log('🔐 [EnigmaAvatar] Utilisateur via getCurrentUser():', currentUser);
        
        if (currentUser && currentUser.avatar) {
          console.log('🎭 [EnigmaAvatar] Avatar utilisateur trouvé via getCurrentUser():', currentUser.avatar);
          return this.validateAndNormalizeAvatarData(currentUser.avatar);
        }
      }
      
      // 2. Essayer depuis window.authState (auth-state.js)
      if (window.authState && window.authState.profile && window.authState.profile.avatar) {
        console.log('🎭 [EnigmaAvatar] Avatar trouvé via authState:', window.authState.profile.avatar);
        return this.validateAndNormalizeAvatarData(window.authState.profile.avatar);
      }
      
      // 3. Essayer de récupérer depuis le localStorage avec toutes les clés possibles
      const localStorageKeys = [
        'english_quest_current_user',
        'englishQuestUserId', // Pour récupérer l'ID et chercher les données
        'currentUser', // Ancienne clé
        'userProfile'
      ];
      
      for (const key of localStorageKeys) {
        try {
          const storedData = localStorage.getItem(key);
          if (storedData && storedData !== 'undefined' && storedData !== 'null') {
            if (key === 'englishQuestUserId') {
              // C'est un ID, essayer de récupérer les données utilisateur
              console.log('🔍 [EnigmaAvatar] ID utilisateur trouvé:', storedData);
              // Essayer de récupérer les données via les autres méthodes
              continue;
            } else {
              const userData = JSON.parse(storedData);
              console.log(`👤 [EnigmaAvatar] Données utilisateur trouvées via ${key}:`, userData);
              
              if (userData.avatar) {
                console.log('🎭 [EnigmaAvatar] Avatar utilisateur trouvé:', userData.avatar);
                return this.validateAndNormalizeAvatarData(userData.avatar);
              }
            }
          }
        } catch (parseError) {
          console.warn(`⚠️ [EnigmaAvatar] Erreur parsing ${key}:`, parseError);
        }
      }
      
      // 4. Essayer via englishQuestUserId avec récupération Firestore
      const userId = localStorage.getItem('englishQuestUserId');
      if (userId && userId !== 'undefined' && userId !== 'null' && typeof firebase !== 'undefined' && firebase.firestore) {
        console.log('🔍 [EnigmaAvatar] ID utilisateur trouvé, récupération Firestore:', userId);
        
        // Récupérer les données utilisateur depuis Firestore
        firebase.firestore().collection('users').doc(userId).get()
          .then(doc => {
            if (doc.exists) {
              const userData = doc.data();
              console.log('👤 [EnigmaAvatar] Données utilisateur récupérées depuis Firestore:', userData);
              
              if (userData.avatar) {
                console.log('🎭 [EnigmaAvatar] Avatar trouvé dans Firestore:', userData.avatar);
                this.userSkins = this.validateAndNormalizeAvatarData(userData.avatar);
                this.createAvatar(); // Recréer l'avatar avec les bons skins
                
                // Sauvegarder l'utilisateur complet dans localStorage pour universal-mobile-auth.js
                const fullUser = {
                  uid: userId,
                  id: userId,
                  username: userData.username,
                  displayName: userData.displayName || userData.username,
                  avatar: userData.avatar,
                  ...userData
                };
                
                try {
                  localStorage.setItem('english_quest_current_user', JSON.stringify(fullUser));
                  console.log('💾 [EnigmaAvatar] Utilisateur complet sauvegardé dans localStorage');
                } catch (error) {
                  console.warn('⚠️ [EnigmaAvatar] Erreur sauvegarde localStorage:', error);
                }
              }
            } else {
              console.warn('⚠️ [EnigmaAvatar] Aucun document utilisateur trouvé pour:', userId);
            }
          })
          .catch(error => console.warn('⚠️ [EnigmaAvatar] Erreur Firestore:', error));
      }
      
      // 5. Essayer Firebase Auth directement si disponible (fallback)
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        const firebaseUser = firebase.auth().currentUser;
        console.log('🔥 [EnigmaAvatar] Utilisateur Firebase trouvé (fallback):', firebaseUser.uid);
        
        // Si on n'a pas déjà récupéré via l'étape 4, essayer ici
        if (!userId || userId === 'undefined' || userId === 'null') {
          if (firebase.firestore) {
            firebase.firestore().collection('users').doc(firebaseUser.uid).get()
              .then(doc => {
                if (doc.exists) {
                  const userData = doc.data();
                  if (userData.avatar) {
                    console.log('🎭 [EnigmaAvatar] Avatar trouvé dans Firestore (fallback):', userData.avatar);
                    this.userSkins = this.validateAndNormalizeAvatarData(userData.avatar);
                    this.createAvatar(); // Recréer l'avatar avec les bons skins
                  }
                }
              })
              .catch(error => console.warn('⚠️ [EnigmaAvatar] Erreur Firestore (fallback):', error));
          }
        }
      }
      
      // 5. Essayer d'autres sources de données utilisateur
      if (window.userData && window.userData.avatar) {
        console.log('🌍 [EnigmaAvatar] Avatar depuis window.userData:', window.userData.avatar);
        return this.validateAndNormalizeAvatarData(window.userData.avatar);
      }
      
      // 6. Chercher dans d'autres variables globales possibles
      if (window.currentUser && window.currentUser.avatar) {
        console.log('🌐 [EnigmaAvatar] Avatar depuis window.currentUser:', window.currentUser.avatar);
        return this.validateAndNormalizeAvatarData(window.currentUser.avatar);
      }
      
      // 7. Valeurs par défaut si aucune donnée trouvée
      console.log('⚠️ [EnigmaAvatar] Aucun avatar utilisateur trouvé, utilisation des valeurs par défaut');
      return this.getDefaultAvatarSkins();
      
    } catch (error) {
      console.error('❌ [EnigmaAvatar] Erreur lors de la récupération des skins:', error);
      return this.getDefaultAvatarSkins();
    }
  }
  
  // 🔧 Valider et normaliser les données d'avatar
  validateAndNormalizeAvatarData(avatarData) {
    console.log('🔍 [EnigmaAvatar] Validation des données avatar:', avatarData);
    
    const validated = {
      head: avatarData.head || 'default_boy',
      body: avatarData.body || 'default_boy', 
      accessory: avatarData.accessory || 'default',
      background: avatarData.background || 'default'
    };
    
    // Normaliser l'accessoire (convertir 'none' en 'default')
    if (validated.accessory === 'none') {
      validated.accessory = 'default';
    }
    
    console.log('✅ [EnigmaAvatar] Données avatar validées:', validated);
    return validated;
  }
  
  // 🎭 Skins par défaut
  getDefaultAvatarSkins() {
    return {
      head: 'default_boy',
      body: 'default_boy',
      accessory: 'default',
      background: 'default'
    };
  }
  
  // 🖼️ Construire les chemins des images selon les choix utilisateur
  getAvatarImagePaths() {
    const basePath = '../assets/avatars/';
    
    // 🔧 Fonction de mapping pour corriger les noms Firestore vers les vrais fichiers
    const mapSkinName = (skinName, type) => {
      // Mapping pour les têtes
      if (type === 'head') {
        if (skinName === 'bear_head') return 'bear';
        if (skinName === 'default_girl_head') return 'default_girl';
        if (skinName === 'default_boy_head') return 'default_boy';
        // Enlever le suffixe _head s'il existe
        return skinName.replace('_head', '');
      }
      
      // Mapping pour les corps
      if (type === 'body') {
        if (skinName === 'bear_body') return 'bear';
        if (skinName === 'default_girl_body') return 'default_girl';
        if (skinName === 'default_boy_body') return 'default_boy';
        // Enlever le suffixe _body s'il existe
        return skinName.replace('_body', '');
      }
      
      // Mapping pour les backgrounds
      if (type === 'background') {
        if (skinName === 'default_background') return 'default';
        // Enlever le suffixe _background s'il existe
        return skinName.replace('_background', '');
      }
      
      // Mapping pour les accessoires (sans changement généralement)
      if (type === 'accessory') {
        if (skinName === 'none' || !skinName) return 'default';
        return skinName;
      }
      
      return skinName;
    };
    
    const headFile = mapSkinName(this.userSkins.head, 'head');
    const bodyFile = mapSkinName(this.userSkins.body, 'body');
    const backgroundFile = mapSkinName(this.userSkins.background, 'background');
    const accessoryFile = mapSkinName(this.userSkins.accessory, 'accessory');
    
    console.log('🔧 [EnigmaAvatar] Mapping des skins:', {
      original: this.userSkins,
      mapped: { headFile, bodyFile, backgroundFile, accessoryFile }
    });
    
    return {
      head: `${basePath}heads/${headFile}.png`,
      body: `${basePath}bodies/${bodyFile}.png`,
      accessory: `${basePath}accessories/${accessoryFile}.gif`,
      background: `${basePath}backgrounds/${backgroundFile}.png`
    };
  }
  
  // 🔄 Mettre à jour l'avatar si les skins changent en temps réel
  updateAvatarSkins() {
    console.log('🔄 [EnigmaAvatar] Mise à jour des skins...');
    
    const newSkins = this.getUserSkinChoices();
    
    // Vérifier si les skins ont changé
    const skinsChanged = JSON.stringify(this.userSkins) !== JSON.stringify(newSkins);
    
    if (skinsChanged) {
      console.log('🎨 [EnigmaAvatar] Skins modifiés, mise à jour de l\'avatar...');
      this.userSkins = newSkins;
      
      // Recréer l'avatar avec les nouveaux skins
      if (this.avatar) {
        this.createAvatar();
      }
      
      return true;
    }
    
    return false;
  }
  
  // 🎛️ Fonction publique pour forcer la mise à jour depuis l'extérieur
  refreshUserSkins() {
    console.log('🎛️ [EnigmaAvatar] Rafraîchissement forcé des skins utilisateur...');
    return this.updateAvatarSkins();
  }
}

// CSS Animations pour l'avatar
const avatarCSS = `
<style id="enigma-avatar-animations">
/* Animation de respiration - seulement luminosité et échelle */
@keyframes gentle-living-breathing {
  0% { 
    filter: brightness(1);
    opacity: 1;
  }
  25% { 
    filter: brightness(1.05);
    opacity: 0.95;
  }
  50% { 
    filter: brightness(1.08);
    opacity: 0.9;
  }
  75% { 
    filter: brightness(1.05);
    opacity: 0.95;
  }
  100% { 
    filter: brightness(1);
    opacity: 1;
  }
}

/* Animation de balade sur la page - utilise transform pour les déplacements */
@keyframes page-wandering {
  0% { 
    transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
  }
  12.5% { 
    transform: translateY(-50px) translateX(-80px) scale(1.01) rotate(0.3deg);
  }
  25% { 
    transform: translateY(50px) translateX(-160px) scale(1.02) rotate(-0.5deg);
  }
  37.5% { 
    transform: translateY(150px) translateX(-240px) scale(1.01) rotate(0.7deg);
  }
  50% { 
    transform: translateY(250px) translateX(-320px) scale(1.03) rotate(0deg);
  }
  62.5% { 
    transform: translateY(350px) translateX(-240px) scale(1.02) rotate(-0.4deg);
  }
  75% { 
    transform: translateY(450px) translateX(-160px) scale(1.01) rotate(0.6deg);
  }
  87.5% { 
    transform: translateY(250px) translateX(-80px) scale(1.01) rotate(-0.3deg);
  }
  100% { 
    transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
  }
}

/* Animation de lueur autour de l'avatar (sans cadre) */
@keyframes subtle-avatar-glow {
  0%, 100% { 
    filter: drop-shadow(0 0 8px rgba(46, 204, 113, 0.3));
  }
  25% { 
    filter: drop-shadow(0 0 15px rgba(52, 152, 219, 0.4));
  }
  50% { 
    filter: drop-shadow(0 0 20px rgba(155, 89, 182, 0.5));
  }
  75% { 
    filter: drop-shadow(0 0 15px rgba(241, 196, 15, 0.4));
  }
}

@keyframes enigma-hop {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.05); }
}

@keyframes enigma-pump {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes enigma-dance {
  0%, 100% { transform: translateX(0) rotate(0deg) scale(1); }
  25% { transform: translateX(-5px) rotate(-8deg) scale(1.05); }
  50% { transform: translateX(5px) rotate(8deg) scale(1.1); }
  75% { transform: translateX(-3px) rotate(-4deg) scale(1.05); }
}

/* Animations physiques niveaux */
@keyframes physicalBounceLevel1 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

@keyframes physicalBounceLevel2 {
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-15px) scale(1.03); }
  50% { transform: translateY(-30px) scale(1.08); }
  75% { transform: translateY(-15px) scale(1.03); }
}

@keyframes physicalBounceLevel3 {
  0%, 100% { transform: translateY(0) scale(1); }
  20% { transform: translateY(-25px) scale(1.05); }
  40% { transform: translateY(-40px) scale(1.1); }
  60% { transform: translateY(-35px) scale(1.08); }
  80% { transform: translateY(-20px) scale(1.05); }
}

@keyframes physicalSpinLevel1 {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.05); }
}

@keyframes physicalSpinLevel2 {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.03); }
  50% { transform: rotate(180deg) scale(1.08); }
  75% { transform: rotate(270deg) scale(1.05); }
}

@keyframes physicalSpinLevel3 {
  0%, 100% { transform: rotate(0deg) scale(1); }
  20% { transform: rotate(72deg) scale(1.02); }
  40% { transform: rotate(144deg) scale(1.05); }
  60% { transform: rotate(216deg) scale(1.08); }
  80% { transform: rotate(288deg) scale(1.05); }
}

@keyframes physicalJump {
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-15px) scale(0.95); }
  50% { transform: translateY(-35px) scale(1.1); }
  75% { transform: translateY(-15px) scale(0.95); }
}

/* Animations génériques pour compatibilité */
@keyframes physicalBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-25px) scale(1.05); }
}

@keyframes physicalSpin {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.05); }
}

@keyframes enigma-victory {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  20% { transform: translateY(-10px) rotate(-10deg) scale(1.1); }
  40% { transform: translateY(-5px) rotate(10deg) scale(1.15); }
  60% { transform: translateY(-15px) rotate(-5deg) scale(1.1); }
  80% { transform: translateY(-8px) rotate(5deg) scale(1.08); }
}

@keyframes enigma-fire {
  0%, 100% { transform: rotate(0deg) scale(1); filter: hue-rotate(0deg); }
  25% { transform: rotate(-10deg) scale(1.1); filter: hue-rotate(45deg); }
  50% { transform: rotate(10deg) scale(1.15); filter: hue-rotate(90deg); }
  75% { transform: rotate(-5deg) scale(1.08); filter: hue-rotate(135deg); }
}

@keyframes enigma-clap {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-3deg); }
  75% { transform: scale(1.1) rotate(3deg); }
}

@keyframes enigma-tilt {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-10deg); }
}

@keyframes enigma-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes enigma-nod {
  0%, 100% { transform: rotateX(0deg); }
  50% { transform: rotateX(-10deg); }
}

@keyframes enigma-droop {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(5px) scale(0.95); }
}

@keyframes enigma-panic {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.02); }
}

@keyframes enigma-aura-success {
  0% { opacity: 0.4; transform: scale(1); }
  100% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes enigma-aura-fire {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes enigma-aura-victory {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0.9; transform: scale(1.1); }
}

/* Animation pour les émotes flottantes */
@keyframes floating-effects {
  0% { 
    transform: translateY(0px) scale(0.8); 
    opacity: 0.8; 
  }
  25% { 
    transform: translateY(-3px) scale(1.0); 
    opacity: 1; 
  }
  50% { 
    transform: translateY(-5px) scale(1.1); 
    opacity: 1; 
  }
  75% { 
    transform: translateY(-3px) scale(1.0); 
    opacity: 0.9; 
  }
  100% { 
    transform: translateY(0px) scale(0.8); 
    opacity: 0.6; 
  }
}

/* 🎭 NOUVELLES ANIMATIONS ULTRA-RÉACTIVES */
/* 🎯 ANIMATIONS SPECTACULAIRES CORRIGÉES */
@keyframes enigma-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-15px) scale(1.08); }
  50% { transform: translateY(-8px) scale(1.12); }
  75% { transform: translateY(-12px) scale(1.06); }
}

@keyframes enigma-spin {
  0% { transform: rotate(0deg) scale(1) translateY(0); }
  25% { transform: rotate(90deg) scale(1.1) translateY(-5px); }
  50% { transform: rotate(180deg) scale(1.15) translateY(-8px); }
  75% { transform: rotate(270deg) scale(1.1) translateY(-5px); }
  100% { transform: rotate(360deg) scale(1) translateY(0); }
}

@keyframes enigma-wiggle {
  0%, 100% { transform: rotate(0deg) translateX(0) scale(1); }
  15% { transform: rotate(-8deg) translateX(-3px) scale(1.02); }
  30% { transform: rotate(8deg) translateX(3px) scale(1.04); }
  45% { transform: rotate(-6deg) translateX(-2px) scale(1.02); }
  60% { transform: rotate(6deg) translateX(2px) scale(1.02); }
  75% { transform: rotate(-4deg) translateX(-1px) scale(1.01); }
}

@keyframes enigma-glow {
  0%, 100% { 
    filter: drop-shadow(0 0 8px rgba(46, 204, 113, 0.6)) brightness(1); 
    transform: scale(1);
  }
  25% { 
    filter: drop-shadow(0 0 15px rgba(52, 152, 219, 0.8)) brightness(1.1); 
    transform: scale(1.03);
  }
  50% { 
    filter: drop-shadow(0 0 25px rgba(241, 196, 15, 1.0)) brightness(1.3); 
    transform: scale(1.08);
  }
  75% { 
    filter: drop-shadow(0 0 18px rgba(155, 89, 182, 0.9)) brightness(1.2); 
    transform: scale(1.05);
  }
}

@keyframes enigma-float {
  0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
  20% { transform: translateY(-10px) scale(1.02) rotate(1deg); }
  40% { transform: translateY(-6px) scale(1.04) rotate(-1deg); }
  60% { transform: translateY(-12px) scale(1.03) rotate(2deg); }
  80% { transform: translateY(-4px) scale(1.01) rotate(-0.5deg); }
}

@keyframes enigma-zoom {
  0% { transform: scale(1) rotate(0deg); }
  30% { transform: scale(1.25) rotate(5deg); }
  60% { transform: scale(1.4) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes enigma-flash {
  0%, 100% { 
    opacity: 1; 
    filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.3)); 
    transform: scale(1);
  }
  25% { 
    opacity: 0.7; 
    filter: brightness(1.8) drop-shadow(0 0 20px rgba(255,255,255,0.8)); 
    transform: scale(1.05);
  }
  50% { 
    opacity: 0.9; 
    filter: brightness(2.2) drop-shadow(0 0 30px rgba(255,255,255,1.0)); 
    transform: scale(1.1);
  }
  75% { 
    opacity: 0.8; 
    filter: brightness(1.6) drop-shadow(0 0 15px rgba(255,255,255,0.7)); 
    transform: scale(1.03);
  }
}

@keyframes enigma-wave {
  0%, 100% { transform: rotateZ(0deg) translateY(0) scale(1); }
  20% { transform: rotateZ(-4deg) translateY(-3px) scale(1.02); }
  40% { transform: rotateZ(4deg) translateY(-6px) scale(1.04); }
  60% { transform: rotateZ(-3deg) translateY(-4px) scale(1.03); }
  80% { transform: rotateZ(2deg) translateY(-2px) scale(1.01); }
}
</style>
`;

// Injecter les CSS
document.head.insertAdjacentHTML('beforeend', avatarCSS);

// Initialisation automatique
let enigmaAvatar = null;

// Fonction d'initialisation robuste
function initializeEnigmaAvatar() {
  console.log('🚀 [EnigmaAvatar] Initialisation...');
  
  try {
    enigmaAvatar = new EnigmaScrollAvatar();
    enigmaAvatar.init(); // ⚠️ IMPORTANT: Appeler init() !
    
    // Exposer pour les tests et l'intégration
    window.enigmaAvatar = enigmaAvatar;
    
    console.log('✅ [EnigmaAvatar] Avatar initialisé avec succès!');
    console.log('🎯 [EnigmaAvatar] Skins utilisateur:', enigmaAvatar.userSkins);
    return true;
    
  } catch (error) {
    console.error('❌ [EnigmaAvatar] Erreur lors de l\'initialisation:', error);
    return false;
  }
}

// Diagnostics d'URL
console.log('🔍 [EnigmaAvatar] URL actuelle:', window.location.href);
console.log('🔍 [EnigmaAvatar] Détection:', {
  'enigma-scroll': window.location.href.includes('enigma-scroll'),
  'test-avatar': window.location.href.includes('test-avatar'),
  'test-user-skins': window.location.href.includes('test-user-skins')
});

// Auto-start pour Enigma Scroll et pages de test
const isCompatiblePage = window.location.href.includes('enigma-scroll') || 
                         window.location.href.includes('test-avatar') || 
                         window.location.href.includes('test-user-skins');

console.log('🎯 [EnigmaAvatar] Page compatible:', isCompatiblePage);

if (isCompatiblePage) {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 [EnigmaAvatar] Page compatible détectée - démarrage automatique...');
    console.log('🎮 [EnigmaAvatar] DOM chargé, initialisation...');
    
    // Initialisation immédiate puis retry si échec
    if (!initializeEnigmaAvatar()) {
      console.log('🔄 [EnigmaAvatar] Première tentative échouée, retry dans 500ms...');
      setTimeout(() => {
        if (!initializeEnigmaAvatar()) {
          console.log('🔄 [EnigmaAvatar] Deuxième tentative échouée, retry dans 1000ms...');
          setTimeout(initializeEnigmaAvatar, 1000);
        }
      }, 500);
    }
  });
} else {
  // Démarrage forcé pour toute autre page - pour compatibilité maximale
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 [EnigmaAvatar] Démarrage forcé du système avatar...');
    
    // Délai réduit pour le mode forcé
    setTimeout(() => {
      initializeEnigmaAvatar();
    }, 300);
  });
}

// Export pour usage externe
window.EnigmaScrollAvatar = EnigmaScrollAvatar;

// 🎛️ Fonctions globales pour l'intégration avec d'autres systèmes
window.refreshEnigmaAvatarSkins = function() {
  if (enigmaAvatar && enigmaAvatar.isInitialized) {
    console.log('🌐 [EnigmaAvatar] Rafraîchissement des skins depuis l\'extérieur...');
    return enigmaAvatar.refreshUserSkins();
  } else if (enigmaAvatar) {
    console.warn('⚠️ [EnigmaAvatar] Avatar en cours d\'initialisation, retry dans 500ms...');
    setTimeout(() => window.refreshEnigmaAvatarSkins(), 500);
    return false;
  } else {
    console.warn('⚠️ [EnigmaAvatar] Avatar non initialisé pour le rafraîchissement');
    return false;
  }
};

// 🎨 Fonction pour forcer la mise à jour de l'avatar après changement de profil
window.updateEnigmaAvatarFromProfile = function(avatarData) {
  if (enigmaAvatar && enigmaAvatar.isInitialized && avatarData) {
    console.log('🎨 [EnigmaAvatar] Mise à jour depuis données de profil:', avatarData);
    enigmaAvatar.userSkins = enigmaAvatar.validateAndNormalizeAvatarData(avatarData);
    if (enigmaAvatar.avatar) {
      enigmaAvatar.createAvatar();
    }
    return true;
  } else if (enigmaAvatar && avatarData) {
    console.log('⏳ [EnigmaAvatar] Avatar en cours d\'initialisation, tentative dans 500ms...');
    setTimeout(() => window.updateEnigmaAvatarFromProfile(avatarData), 500);
    return false;
  } else {
    console.warn('⚠️ [EnigmaAvatar] Avatar non disponible ou données manquantes');
    return false;
  }
};

// 🔧 Fonction pour forcer l'initialisation
window.forceInitEnigmaAvatar = function() {
  console.log('🔧 [EnigmaAvatar] Initialisation forcée demandée...');
  return initializeEnigmaAvatar();
}; 