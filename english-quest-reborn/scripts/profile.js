/**
 * English Quest - Profile Script
 * Gère la page de profil utilisateur
 */

import { authService } from './auth-service.js';
import { skinService } from './skin-service.js';
import { levelService } from './level-service.js';

// État pour éviter les boucles infinies
let isUpdatingAvatar = false;
let isLoadingInventory = false;

// Éléments du DOM
const userAvatarHead = document.getElementById('userAvatarHead');
const userAvatarBody = document.getElementById('userAvatarBody');
const userAvatarBackground = document.getElementById('userAvatarBackground');
const userAvatarAccessory = document.getElementById('userAvatarAccessory');
const username = document.getElementById('username');
const userEmail = document.getElementById('userEmail');
const userLevel = document.getElementById('userLevel');
const userXP = document.getElementById('userXP');
const userCoins = document.getElementById('userCoins');
const inventoryGrid = document.getElementById('inventoryGrid');
const achievementList = document.getElementById('achievementList');
const settingsForm = document.getElementById('settingsForm');
const themeToggle = document.getElementById('themeToggle');
const notificationsToggle = document.getElementById('notificationsToggle');
const soundToggle = document.getElementById('soundToggle');
const userPendingXP = document.getElementById('userPendingXP'); // Added
const userPendingCoins = document.getElementById('userPendingCoins'); // Added

// Nouveaux éléments pour le système de niveaux
const levelBadge = document.getElementById('levelBadge');
const xpText = document.getElementById('xpText');
const xpProgressFill = document.getElementById('xpProgressFill');
const nextLevelInfo = document.getElementById('nextLevelInfo');
const xpSimulatorInput = document.getElementById('xpSimulatorInput');
const simulateXPButton = document.getElementById('simulateXPButton');
const simulationResult = document.getElementById('simulationResult');
const milestonesList = document.getElementById('milestonesList');
const levelChart = document.getElementById('levelChart');

// Onglets
const tabs = document.querySelectorAll('.profile-tab');
const tabContents = document.querySelectorAll('.tab-content');

// Succès par défaut
const defaultAchievements = [
  {
    id: 'first_login',
    title: 'Premier pas',
    description: 'Se connecter pour la première fois',
    icon: 'fas fa-door-open',
    unlocked: true
  },
  {
    id: 'first_game',
    title: 'Apprenti joueur',
    description: 'Jouer à votre premier jeu',
    icon: 'fas fa-gamepad',
    unlocked: false
  },
  {
    id: 'first_course',
    title: 'Étudiant curieux',
    description: 'Suivre votre premier cours',
    icon: 'fas fa-book',
    unlocked: false
  },
  {
    id: 'win_game',
    title: 'Première victoire',
    description: 'Gagner votre premier jeu',
    icon: 'fas fa-trophy',
    unlocked: false
  },
  {
    id: 'complete_course',
    title: 'Diplômé',
    description: 'Terminer votre premier cours',
    icon: 'fas fa-graduation-cap',
    unlocked: false
  },
  {
    id: 'reach_level_5',
    title: 'Progression',
    description: 'Atteindre le niveau 5',
    icon: 'fas fa-level-up-alt',
    unlocked: false
  },
  {
    id: 'reach_level_10',
    title: 'Dévouement',
    description: 'Atteindre le niveau 10',
    icon: 'fas fa-star',
    unlocked: false
  },
  {
    id: 'reach_level_20',
    title: 'Maîtrise',
    description: 'Atteindre le niveau 20',
    icon: 'fas fa-crown',
    unlocked: false
  },
  {
    id: 'play_10_games',
    title: 'Joueur régulier',
    description: 'Jouer à 10 jeux différents',
    icon: 'fas fa-dice',
    unlocked: false
  },
  {
    id: 'complete_5_courses',
    title: 'Érudit',
    description: 'Terminer 5 cours différents',
    icon: 'fas fa-book-reader',
    unlocked: false
  },
  {
    id: 'win_streak_3',
    title: 'Sur une lancée',
    description: 'Gagner 3 jeux d\'affilée',
    icon: 'fas fa-fire',
    unlocked: false
  },
  {
    id: 'collect_1000_coins',
    title: 'Fortuné',
    description: 'Collecter 1000 pièces',
    icon: 'fas fa-coins',
    unlocked: false
  }
];

/**
 * Initialisation de la page
 */
async function init() {
  try {
    await authService.init(); // Use the new init method
    const user = authService.getCurrentUser(); // Use getCurrentUser instead of getAuthState

    if (!user) {
      console.warn("[ProfileJs] User not authenticated. Redirecting to login.html");
      window.location.href = 'login.html';
      return;
    }
    
    console.log("[ProfileJs] User IS connected. Username:", user.username);
    await loadProfile(user);
    initTabs();
    setupEventListeners();
    console.log("[ProfileJs] Profile page initialization successful.");
  } catch (error) {
    console.error("[ProfileJs] CRITICAL ERROR during profile page init:", error);
    window.location.href = 'login.html'; 
  }
}

/**
 * Chargement du profil utilisateur
 */
async function loadProfile(profileData) {
  try {
    if (!profileData) {
      console.warn("[ProfileJs] loadProfile called without profileData. Redirecting.");
      window.location.href = 'login.html'; 
      return;
    }

    // Ensure global DOM element variables are used (username, userEmail, etc.)
    // DOM elements are: username, userEmail, userLevel, userXP, userCoins
    if (username) username.textContent = profileData.username || 'Aventurier';
    
    // Fix: Instead of showing "Internal ID not set", hide the email field or show username
    if (userEmail) {
      if (profileData.email && profileData.email !== '') {
        userEmail.textContent = profileData.email;
        userEmail.style.display = 'block';
      } else {
        // Hide the email display if no email is available
        userEmail.style.display = 'none';
        // Or alternatively, show the username again:
        // userEmail.textContent = profileData.username || 'Aventurier';
      }
    }
    
    // Mise à jour des statistiques avec le système de niveaux
    const currentXP = profileData.xp || 0;
    const progressInfo = levelService.getXPForNextLevel(currentXP);
    
    if (userLevel) userLevel.textContent = progressInfo.currentLevel;
    if (userXP) userXP.textContent = `${currentXP} XP`;
    if (userCoins) userCoins.textContent = `${profileData.coins || 0} pièces`;
    
    // Add these lines:
    if (userPendingXP) userPendingXP.textContent = `${profileData.pendingXP || 0} XP`;
    if (userPendingCoins) userPendingCoins.textContent = `${profileData.pendingCoins || 0} pièces`;
    
    // Mise à jour de l'affichage de progression XP
    updateXPDisplay(currentXP, progressInfo);
    
    // S'assurer que l'avatar a des valeurs par défaut si pas définies
    const avatarToDisplay = {
      head: profileData.avatar?.head || 'default_boy_head',
      body: profileData.avatar?.body || 'default_boy_body', 
      background: profileData.avatar?.background || 'default_background',
      accessory: profileData.avatar?.accessory || 'default'
    };
    
    console.log("[ProfileJs] Loading profile with avatar:", avatarToDisplay);
    updateAvatarDisplay(avatarToDisplay); 
    await loadInventory(profileData); // loadInventory will also take profileData
    loadAchievements(profileData.achievements || []);
    updateSettingsUI(profileData.settings); // Fixed function name
    
    // Charger les données de progression
    loadMilestones(progressInfo.currentLevel);
    loadLevelChart();

    // Assuming adminPanelLinkContainer is defined globally or fetched if needed
    const adminPanelLinkContainer = document.getElementById('adminPanelLinkContainer'); 
    if (adminPanelLinkContainer) {
      adminPanelLinkContainer.style.display = profileData.isAdmin ? 'block' : 'none';
    }

    // 🎮 Notifier l'avatar du jeu Enigma Scroll des changements
    notifyEnigmaAvatarUpdate(avatarToDisplay);
  } catch (error) {
    console.error("[ProfileJs] Error loading profile:", error);
  }
}

/**
 * Mettre à jour l'affichage de l'avatar
 */
function updateAvatarDisplay(avatarData) {
  // Protection contre les appels multiples simultanés
  if (isUpdatingAvatar) {
    console.log("[ProfileJs] updateAvatarDisplay already in progress, skipping");
    return;
  }
  
  isUpdatingAvatar = true;
  console.log("[ProfileJs] Updating avatar display with data:", avatarData);
  
  try {
    const skins = skinService.getAvailableSkins();
    const defaultHeadId = 'default_boy_head';
    const defaultBodyId = 'default_boy_body';
    const defaultBackgroundId = 'default_background';
    const defaultAccessoryId = 'default';

    let headId = avatarData?.head || defaultHeadId;
    let bodyId = avatarData?.body || defaultBodyId;
    let backgroundId = avatarData?.background || defaultBackgroundId;
    let accessoryId = avatarData?.accessory || defaultAccessoryId;
    
    // Migration: convert old "none" accessory to new "default"
    if (accessoryId === 'none') {
      accessoryId = 'default';
    }

    console.log("[ProfileJs] Avatar parts:", { headId, bodyId, backgroundId, accessoryId });

    const headSkin = skins.head.find(s => s.id === headId) || skins.head.find(s => s.id === defaultHeadId);
    const bodySkin = skins.body.find(s => s.id === bodyId) || skins.body.find(s => s.id === defaultBodyId);
    const backgroundSkin = skins.background.find(s => s.id === backgroundId) || skins.background.find(s => s.id === defaultBackgroundId);
    const accessorySkin = skins.accessory.find(s => s.id === accessoryId);

    // Update head
    if (userAvatarHead && headSkin) {
      userAvatarHead.src = headSkin.image;
      console.log("[ProfileJs] Updated head to:", headSkin.image);
    } else if (userAvatarHead) {
      userAvatarHead.src = 'assets/avatars/heads/default_boy.png';
    }

    // Update body
    if (userAvatarBody && bodySkin) {
      userAvatarBody.src = bodySkin.image;
      console.log("[ProfileJs] Updated body to:", bodySkin.image);
    } else if (userAvatarBody) {
      userAvatarBody.src = 'assets/avatars/bodies/default_boy.png';
    }
    
    // Update background
    const avatarContainer = document.getElementById('userAvatarContainer');
    if (avatarContainer && backgroundSkin) {
      avatarContainer.style.backgroundImage = `url('${backgroundSkin.image}')`;
      console.log("[ProfileJs] Updated background to:", backgroundSkin.image);
    } else if (avatarContainer) {
      avatarContainer.style.backgroundImage = `url('assets/avatars/backgrounds/default.png')`;
    }
    
    // Hide the original background img element
    if (userAvatarBackground) userAvatarBackground.style.display = 'none';

    // Handle accessory - completely reset and rebuild
    if (userAvatarAccessory) {
      console.log("[ProfileJs] Processing accessory:", accessoryId, accessorySkin);
      
      // Clear any existing content
      userAvatarAccessory.innerHTML = '';
      
      // Always show the container
      userAvatarAccessory.style.display = 'block';
      
      if (accessoryId === 'default') {
        // For "default" accessory, show the animated GIF image
        console.log("[ProfileJs] Accessory set to 'default' - adding animated GIF");
        const accessoryImg = document.createElement('img');
        accessoryImg.src = 'assets/avatars/accessories/default.gif';
        accessoryImg.alt = 'Animated Accessory';
        accessoryImg.style.width = '100%';
        accessoryImg.style.height = '100%';
        accessoryImg.style.objectFit = 'contain';
        accessoryImg.style.display = 'block';
        accessoryImg.style.opacity = '1';
        
        accessoryImg.onerror = function() {
          console.warn("[ProfileJs] Failed to load animated accessory, fallback to PNG");
          this.src = 'assets/avatars/accessories/default.png';
        };
        
        accessoryImg.onload = function() {
          console.log("[ProfileJs] Animated accessory loaded successfully");
        };
        
        userAvatarAccessory.appendChild(accessoryImg);
      } else if (accessorySkin && accessorySkin.image) {
        // Create and add image for real accessories
        const accessoryImg = document.createElement('img');
        accessoryImg.src = accessorySkin.image;
        accessoryImg.alt = 'Accessory';
        accessoryImg.style.width = '100%';
        accessoryImg.style.height = '100%';
        accessoryImg.style.objectFit = 'contain';
        accessoryImg.style.display = 'block';
        accessoryImg.style.opacity = '1'; // Full opacity for real accessories
        
        accessoryImg.onerror = function() {
          console.warn("[ProfileJs] Failed to load accessory image:", accessorySkin.image);
          this.style.display = 'none';
        };
        
        accessoryImg.onload = function() {
          console.log("[ProfileJs] Accessory image loaded successfully:", accessorySkin.image);
        };
        
        userAvatarAccessory.appendChild(accessoryImg);
        console.log("[ProfileJs] Added accessory image:", accessorySkin.image);
      } else {
        console.warn("[ProfileJs] Unknown accessory or missing image:", accessoryId);
      }
    }

  } catch (error) {
    console.error("[ProfileJs] Error updating avatar display:", error);
    // Robust fallback
    if (userAvatarHead) userAvatarHead.src = 'assets/avatars/heads/default_boy.png';
    if (userAvatarBody) userAvatarBody.src = 'assets/avatars/bodies/default_boy.png';
    const avatarContainer = document.getElementById('userAvatarContainer');
    if (avatarContainer) avatarContainer.style.backgroundImage = `url('assets/avatars/backgrounds/default.png')`;
    if (userAvatarAccessory) {
      userAvatarAccessory.innerHTML = '';
      userAvatarAccessory.style.display = 'block';
    }
  } finally {
    // Toujours libérer le verrou
    isUpdatingAvatar = false;
  }
}

/**
 * Mettre à jour l'affichage de progression XP
 */
function updateXPDisplay(currentXP, progressInfo) {
  if (!progressInfo) return;
  
  try {
    // Mise à jour du badge de niveau
    if (levelBadge) {
      levelBadge.textContent = `Niveau ${progressInfo.currentLevel}`;
    }
    
    // Mise à jour du texte XP
    if (xpText) {
      if (progressInfo.isMaxLevel) {
        xpText.textContent = `${currentXP} XP (Niveau Max)`;
      } else {
        xpText.textContent = `${progressInfo.xpProgress} / ${progressInfo.xpNeeded} XP`;
      }
    }
    
    // Mise à jour de la barre de progression
    if (xpProgressFill) {
      const percentage = progressInfo.isMaxLevel ? 100 : progressInfo.progressPercentage;
      xpProgressFill.style.width = `${percentage}%`;
    }
    
    // Mise à jour du texte niveau suivant
    if (nextLevelInfo) {
      if (progressInfo.isMaxLevel) {
        nextLevelInfo.textContent = 'Niveau maximum atteint !';
        nextLevelInfo.style.color = 'var(--color-primary)';
      } else {
        nextLevelInfo.textContent = `${progressInfo.xpRemaining} XP pour le niveau ${progressInfo.nextLevel}`;
        nextLevelInfo.style.color = 'var(--color-text-secondary)';
      }
    }
    
    console.log('[ProfileJs] XP Display updated:', progressInfo);
  } catch (error) {
    console.error('[ProfileJs] Error updating XP display:', error);
  }
}

/**
 * Charger les paliers de déblocage
 */
function loadMilestones(currentLevel) {
  if (!milestonesList) return;
  
  const milestones = levelService.getUnlockMilestones();
  milestonesList.innerHTML = '';
  
  milestones.forEach(milestone => {
    const milestoneCard = document.createElement('div');
    
    let cardClass = 'milestone-card';
    if (currentLevel >= milestone.level) {
      cardClass += ' unlocked';
    } else if (currentLevel === milestone.level - 1) {
      cardClass += ' current';
    } else {
      cardClass += ' locked';
    }
    
    milestoneCard.className = cardClass;
    milestoneCard.innerHTML = `
      <div class="milestone-level">Niveau ${milestone.level}</div>
      <div class="milestone-description">${milestone.description}</div>
    `;
    
    milestonesList.appendChild(milestoneCard);
  });
}

/**
 * Charger le tableau des niveaux
 */
function loadLevelChart() {
  if (!levelChart) return;
  
  const chart = levelService.getLevelChart(20);
  
  let tableHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: var(--color-primary); color: white;">
          <th style="padding: 0.5rem; border: 1px solid #ddd;">Niveau</th>
          <th style="padding: 0.5rem; border: 1px solid #ddd;">XP Total</th>
          <th style="padding: 0.5rem; border: 1px solid #ddd;">XP pour ce niveau</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  chart.forEach(row => {
    tableHTML += `
      <tr style="background: ${row.level % 2 === 0 ? 'var(--color-background)' : 'transparent'};">
        <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: center; font-weight: bold;">${row.level}</td>
        <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: center;">${row.totalXP.toLocaleString()}</td>
        <td style="padding: 0.5rem; border: 1px solid #ddd; text-align: center;">${row.xpForThisLevel.toLocaleString()}</td>
      </tr>
    `;
  });
  
  tableHTML += '</tbody></table>';
  levelChart.innerHTML = tableHTML;
}

/**
 * Simuler un gain d'XP
 */
function simulateXPGain() {
  const xpToAdd = parseInt(xpSimulatorInput?.value || 0);
  if (xpToAdd <= 0) {
    if (simulationResult) {
      simulationResult.textContent = 'Veuillez entrer un montant d\'XP valide';
      simulationResult.style.color = '#e74c3c';
    }
    return;
  }
  
  const user = authService.getCurrentUser();
  if (!user) return;
  
  const currentXP = user.xp || 0;
  const simulation = levelService.simulateXPGain(currentXP, xpToAdd);
  
  if (simulationResult) {
    let resultText = `${xpToAdd} XP → `;
    
    if (simulation.leveledUp) {
      resultText += `🎉 Niveau ${simulation.beforeLevel} → ${simulation.afterLevel}`;
      if (simulation.levelsGained > 1) {
        resultText += ` (+${simulation.levelsGained} niveaux !)`;
      }
      simulationResult.style.color = 'var(--color-primary)';
    } else {
      resultText += `Reste niveau ${simulation.afterLevel}`;
      simulationResult.style.color = 'var(--color-text-secondary)';
    }
    
    simulationResult.textContent = resultText;
  }
}

/**
 * Initialiser les onglets
 */
function initTabs() {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Retirer la classe active de tous les onglets et contenus
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Ajouter la classe active à l'onglet cliqué
      tab.classList.add('active');

      // Trouver et activer le contenu correspondant
      const tabId = tab.getAttribute('data-tab');
      const tabContent = document.getElementById(tabId);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
}

/**
 * Créer un élément de skin pour l'inventaire
 */
function createSkinElement(skin, category, isOwned, isEquipped = false) {
  const user = authService.getCurrentUser();
  const equippedSkinId = user?.avatar?.[category] || 'default';
  isEquipped = isEquipped || (skin.id === equippedSkinId);

  // Vérifier le niveau requis
  const userLevel = levelService.calculateLevel(user?.xp || 0);
  const requiredLevel = skin.minLevel || 1;
  const isLocked = userLevel < requiredLevel;

  const skinElement = document.createElement('div');
  let className = `inventory-item ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`;
  if (isLocked) {
    className += ' locked';
  }
  skinElement.className = className;
  
  let buttonHTML = '';
  if (isLocked) {
    buttonHTML = `<div class="level-requirement">Niveau ${requiredLevel} requis</div>`;
  } else if (!isOwned) {
    buttonHTML = `<button class="btn-buy" data-skin-id="${skin.id}" data-skin-type="${category}">
                    Acheter (${skin.price} pièces)
                  </button>`;
  } else {
    buttonHTML = `<button class="btn-equip ${isEquipped ? 'disabled' : ''}" 
                           data-skin-id="${skin.id}" 
                           data-skin-type="${category}"
                           ${isEquipped ? 'disabled' : ''}>
                    ${isEquipped ? 'Équipé' : 'Équiper'}
                  </button>`;
  }
  
  skinElement.innerHTML = `
    ${isLocked ? '<div class="lock-icon"><i class="fas fa-lock"></i></div>' : ''}
    <img src="${skin.image}" alt="${skin.name}" onerror="this.src='assets/avatars/default.png'">
    <h4>${skin.name}</h4>
    <p>${skin.price === 0 ? 'Gratuit' : `${skin.price} pièces`}</p>
    ${buttonHTML}
  `;
  
  return skinElement;
}

/**
 * Chargement de l'inventaire
 */
async function loadInventory(profileData) {
  // Protection contre les chargements multiples simultanés
  if (isLoadingInventory) {
    console.log("[ProfileJs] loadInventory already in progress, skipping");
    return;
  }
  
  isLoadingInventory = true;
  
  try {
    // Ensure global DOM element 'inventoryGrid' is used
    if (!inventoryGrid) {
        console.error("[ProfileJs] inventoryGrid DOM element not found.");
        return;
    }
    inventoryGrid.innerHTML = '<p>Chargement de l\'inventaire...</p>';

    if (!profileData) {
      console.error("[ProfileJs] No profileData provided");
      inventoryGrid.innerHTML = '<p>Erreur: Données utilisateur non disponibles pour l\'inventaire.</p>';
      return;
    }

    const allSkinCategories = skinService.getAvailableSkins();
    const userOwnedSkinsData = profileData.inventory?.skins || {}; 
    const userEquippedSkins = profileData.avatar || {}; 
    
    inventoryGrid.innerHTML = ''; // Clear loading message

    // Create sections for each skin category
    Object.keys(allSkinCategories).forEach(category => {
        // Create a section for this category
        const categorySection = document.createElement('div');
        categorySection.className = 'inventory-section';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = getTypeName(category);
        categorySection.appendChild(categoryTitle);
        
        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'skin-grid';
        categoryGrid.id = `${category}-options`;
        
        // Get user's inventory - handle both old and new formats
        let ownedSkins = [];
        if (profileData.inventory) {
            if (Array.isArray(profileData.inventory)) {
                // Old format: array of objects - convert on the fly
                ownedSkins = profileData.inventory
                    .filter(item => item.type === category)
                    .map(item => {
                        // Map old IDs to new IDs
                        let skinId = item.id;
                        if (item.id === 'default_girl' && category === 'head') skinId = 'default_girl_head';
                        if (item.id === 'default_boy' && category === 'head') skinId = 'default_boy_head';
                        if (item.id === 'default_girl' && category === 'body') skinId = 'default_girl_body';
                        if (item.id === 'default_boy' && category === 'body') skinId = 'default_boy_body';
                        if (item.id === 'default' && category === 'background') skinId = 'default_background';
                        if (item.id === 'none' && category === 'accessory') skinId = 'default';
                        return skinId;
                    });
            } else if (profileData.inventory.skins && profileData.inventory.skins[category]) {
                // New format: object with skins
                ownedSkins = profileData.inventory.skins[category];
            }
        }

        allSkinCategories[category].forEach(skin => {
            const isOwned = ownedSkins.includes(skin.id) || skin.price === 0;
            const isEquipped = userEquippedSkins[category] === skin.id;
            const skinElement = createSkinElement(skin, category, isOwned, isEquipped);
            categoryGrid.appendChild(skinElement);
        });
        
        categorySection.appendChild(categoryGrid);
        inventoryGrid.appendChild(categorySection);
    });
    
    setupInventoryButtons();
  } catch (error) {
    console.error("[ProfileJs] Error loading inventory:", error);
    if (inventoryGrid) inventoryGrid.innerHTML = `<p>Erreur lors du chargement de l'inventaire: ${error.message}</p>`;
  } finally {
    // Toujours libérer le verrou
    isLoadingInventory = false;
  }
}

/**
 * Obtenir un nom lisible pour le type de skin
 */
function getTypeName(type) {
  const typeNames = {
    'head': 'Têtes',
    'body': 'Corps',
    'accessory': 'Accessoires',
    'background': 'Arrière-plans'
  };
  return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Configuration des boutons d'inventaire
 */
function setupInventoryButtons() {
  // Supprimer les anciens event listeners pour éviter les doublons
  document.querySelectorAll('.btn-buy').forEach(button => {
    // Cloner le bouton pour supprimer tous les event listeners existants
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
  });
  
  document.querySelectorAll('.btn-equip').forEach(button => {
    // Cloner le bouton pour supprimer tous les event listeners existants
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
  });

  // Ajouter les nouveaux event listeners
  document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', async (e) => {
      const targetButton = e.currentTarget;
      
      // Protection contre les clics multiples
      if (targetButton.disabled || targetButton.dataset.processing) {
        console.log("[ProfileJs] Button already processing, ignoring click");
        return;
      }
      
      targetButton.disabled = true;
      targetButton.dataset.processing = 'true';
      const originalText = targetButton.textContent;
      targetButton.textContent = 'Achat en cours...';
      
      const skinId = targetButton.dataset.skinId;
      const skinType = targetButton.dataset.skinType;
      
      try {
        console.log("[ProfileJs] Buying skin:", skinId, skinType);
        const result = await skinService.buySkin(skinId, skinType);
        if (result.success) {
          alert(`Achat réussi: ${result.skin.name}`);
          
          // Attendre et forcer un rafraîchissement complet des données
          setTimeout(async () => {
            console.log("[ProfileJs] Refreshing user data after purchase...");
            
            // Essayer plusieurs fois si nécessaire pour s'assurer que les données sont synchronisées
            let attempts = 0;
            const maxAttempts = 3;
            let refreshedProfile = null;
            
            while (attempts < maxAttempts && !refreshedProfile) {
              attempts++;
              console.log(`[ProfileJs] Refresh attempt ${attempts}/${maxAttempts}`);
              
              try {
                refreshedProfile = await authService.refreshUser();
                
                if (refreshedProfile) {
                  // Vérifier si l'objet acheté est maintenant dans l'inventaire
                  const ownedSkinsForType = refreshedProfile.inventory?.skins?.[skinType] || [];
                  const isNowOwned = ownedSkinsForType.includes(skinId);
                  
                  console.log("[ProfileJs] After refresh - owned skins for", skinType, ":", ownedSkinsForType);
                  console.log("[ProfileJs] Is", skinId, "now owned?", isNowOwned);
                  
                  if (isNowOwned) {
                    console.log("[ProfileJs] Purchase confirmed in inventory, updating display");
                    await loadProfile(refreshedProfile);
                    break; // Sortir de la boucle, mission accomplie
                  } else if (attempts < maxAttempts) {
                    console.warn("[ProfileJs] Purchase not yet reflected in inventory, retrying...");
                    refreshedProfile = null; // Forcer une nouvelle tentative
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde supplémentaire
                  }
                } else if (attempts < maxAttempts) {
                  console.warn("[ProfileJs] Failed to refresh user data, retrying...");
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde supplémentaire
                }
              } catch (error) {
                console.error("[ProfileJs] Error during refresh attempt", attempts, ":", error);
                if (attempts < maxAttempts) {
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre avant de réessayer
                }
              }
            }
            
            if (!refreshedProfile) {
              console.warn("[ProfileJs] All refresh attempts failed, reloading page");
              window.location.reload();
            }
          }, 2000); // Augmenté à 2 secondes pour laisser plus de temps à Firebase
        } else {
          alert(result.error || "Erreur lors de l'achat.");
        }
      } catch (error) {
        console.error('[ProfileJs] Exception during buy:', error);
        alert("Exception lors de l'achat: " + error.message);
      } finally {
        targetButton.disabled = false;
        targetButton.textContent = originalText;
        delete targetButton.dataset.processing;
      }
    });
  });
  
  document.querySelectorAll('.btn-equip').forEach(button => {
    button.addEventListener('click', async (e) => {
      const targetButton = e.currentTarget;
      
      // Protection contre les clics multiples
      if (targetButton.disabled || targetButton.dataset.processing) {
        console.log("[ProfileJs] Button already processing, ignoring click");
        return;
      }
      
      targetButton.disabled = true;
      targetButton.dataset.processing = 'true';
      const originalText = targetButton.textContent;
      targetButton.textContent = 'Équipement...';
      
      const skinId = targetButton.dataset.skinId;
      const skinType = targetButton.dataset.skinType;
      
      try {
        console.log("[ProfileJs] Equipping skin:", skinId, skinType);
        const result = await skinService.equipSkin(skinId, skinType);
        if (result.success) {
           // Attendre et forcer un rafraîchissement complet des données
           setTimeout(async () => {
             console.log("[ProfileJs] Refreshing user data after equip...");
             
             // Essayer plusieurs fois si nécessaire pour s'assurer que les données sont synchronisées
             let attempts = 0;
             const maxAttempts = 3;
             let refreshedProfile = null;
             
             while (attempts < maxAttempts && !refreshedProfile) {
               attempts++;
               console.log(`[ProfileJs] Refresh attempt ${attempts}/${maxAttempts}`);
               
               try {
                 refreshedProfile = await authService.refreshUser();
                 
                 if (refreshedProfile) {
                   // Vérifier si l'objet est maintenant équipé
                   const equippedSkin = refreshedProfile.avatar?.[skinType];
                   const isNowEquipped = equippedSkin === skinId;
                   
                   console.log("[ProfileJs] After refresh - equipped", skinType, ":", equippedSkin);
                   console.log("[ProfileJs] Is", skinId, "now equipped?", isNowEquipped);
                   
                   if (isNowEquipped) {
                     console.log("[ProfileJs] Equipment confirmed, updating display");
                     await loadProfile(refreshedProfile);
                     break; // Sortir de la boucle, mission accomplie
                   } else if (attempts < maxAttempts) {
                     console.warn("[ProfileJs] Equipment not yet reflected, retrying...");
                     refreshedProfile = null; // Forcer une nouvelle tentative
                     await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde supplémentaire
                   }
                 } else if (attempts < maxAttempts) {
                   console.warn("[ProfileJs] Failed to refresh user data, retrying...");
                   await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde supplémentaire
                 }
               } catch (error) {
                 console.error("[ProfileJs] Error during refresh attempt", attempts, ":", error);
                 if (attempts < maxAttempts) {
                   await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre avant de réessayer
                 }
               }
             }
             
             if (!refreshedProfile) {
               console.warn("[ProfileJs] All refresh attempts failed, reloading page");
               window.location.reload();
             }
           }, 2000); // Augmenté à 2 secondes pour laisser plus de temps à Firebase
        } else {
          alert(result.error || "Erreur lors de l'équipement.");
        }
      } catch (error) {
        console.error('[ProfileJs] Exception during equip:', error);
        alert("Exception lors de l'équipement: " + error.message);
      } finally {
        targetButton.disabled = false;
        targetButton.textContent = originalText;
        delete targetButton.dataset.processing;
      }
    });
  });
}

/**
 * Chargement des succès
 */
function loadAchievements(userAchievements = []) {
  try {
    if (!achievementList) return;
    achievementList.innerHTML = ''; // Clear previous
    const achievementsToDisplay = JSON.parse(JSON.stringify(defaultAchievements)); // Deep copy defaults

    (userAchievements || []).forEach(userAch => {
      const existingAch = achievementsToDisplay.find(da => da.id === userAch.id);
      if (existingAch) {
        existingAch.unlocked = userAch.unlocked;
        existingAch.unlockedAt = userAch.unlockedAt;
      } else {
        // Optional: if user can have achievements not in default list
        // achievementsToDisplay.push(userAch); 
      }
    });

    achievementsToDisplay.forEach(ach => {
      const item = document.createElement('div');
      item.className = `achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`;
      item.innerHTML = `
        <div class="achievement-icon"><i class="${ach.icon || 'fas fa-question-circle'}"></i></div>
        <div class="achievement-info">
          <h3>${ach.title}</h3><p>${ach.description}</p>
          ${ach.unlocked && ach.unlockedAt ? `<span class="achievement-date">Débloqué le ${new Date(ach.unlockedAt).toLocaleDateString()}</span>` : ''}
        </div>
        ${!ach.unlocked ? '<div class="achievement-locked"><i class="fas fa-lock"></i></div>' : ''}
      `;
      achievementList.appendChild(item);
    });
  } catch (error) {
    console.error("[ProfileJs] Error loading achievements:", error);
  }
}

/**
 * Mise à jour des paramètres
 */
function updateSettingsUI(settings = {}) { // Ensure this is the correct name
  try {
    const currentSettings = { theme: 'dark', notifications: true, sound: true, ...settings };
    if(themeToggle) themeToggle.checked = currentSettings.theme === 'dark';
    if(notificationsToggle) notificationsToggle.checked = currentSettings.notifications;
    if(soundToggle) soundToggle.checked = currentSettings.sound;
    document.body.classList.toggle('light-theme', currentSettings.theme !== 'dark');
  } catch (error) {
    console.error("[ProfileJs] Error updating settings display:", error);
  }
}

/**
 * Configuration des écouteurs d'événements
 */
function setupEventListeners() {
  try {
    if(themeToggle) themeToggle.addEventListener('change', async () => {
      const newTheme = themeToggle.checked ? 'dark' : 'light';
      const profile = authService.getCurrentUser();
      if(profile?.settings) {
        try {
          await authService.updateProfile({ settings: { ...profile.settings, theme: newTheme } });
          document.body.classList.toggle('light-theme', !themeToggle.checked);
        } catch (e) { console.error('Error saving theme', e); /* Revert UI? */ }
      }
    });
    
    if(notificationsToggle) notificationsToggle.addEventListener('change', async () => {
       const profile = authService.getCurrentUser();
       if(profile?.settings) {
         try {
          await authService.updateProfile({ settings: { ...profile.settings, notifications: notificationsToggle.checked } });
         } catch (e) { console.error('Error saving notification settings', e); /* Revert UI? */ }
       }
    });
    
    if(soundToggle) soundToggle.addEventListener('change', async () => {
      const profile = authService.getCurrentUser();
      if(profile?.settings) {
        try {
          await authService.updateProfile({ settings: { ...profile.settings, sound: soundToggle.checked } });
        } catch (e) { console.error('Error saving sound settings', e); /* Revert UI? */ }
      }
    });
    
    // Event listener pour le simulateur XP
    if (simulateXPButton) {
      simulateXPButton.addEventListener('click', simulateXPGain);
    }
    
    if (xpSimulatorInput) {
      xpSimulatorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          simulateXPGain();
        }
      });
    }
  } catch (error) {
    console.error("[ProfileJs] Error setting up settings listeners:", error);
  }
}

// 🎮 Notifier l'avatar du jeu Enigma Scroll des changements
function notifyEnigmaAvatarUpdate(avatarData) {
  try {
    // 1. Mettre à jour le localStorage pour persistence
    const storedUser = localStorage.getItem('english_quest_current_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      userData.avatar = avatarData;
      localStorage.setItem('english_quest_current_user', JSON.stringify(userData));
      console.log('[ProfileJs] Avatar mis à jour dans localStorage:', avatarData);
    }
    
    // 2. Notifier l'avatar du jeu si la fonction globale existe
    if (typeof window.updateEnigmaAvatarFromProfile === 'function') {
      const success = window.updateEnigmaAvatarFromProfile(avatarData);
      if (success) {
        console.log('[ProfileJs] Avatar du jeu Enigma Scroll mis à jour avec succès');
      }
    } else if (typeof window.refreshEnigmaAvatarSkins === 'function') {
      // Fallback: demander un rafraîchissement
      window.refreshEnigmaAvatarSkins();
      console.log('[ProfileJs] Rafraîchissement de l\'avatar Enigma Scroll demandé');
    }
    
    // 3. Notifier d'autres systèmes si nécessaire
    if (window.enigmaAvatar && typeof window.enigmaAvatar.refreshUserSkins === 'function') {
      window.enigmaAvatar.refreshUserSkins();
      console.log('[ProfileJs] Rafraîchissement direct de l\'avatar Enigma Scroll');
    }
    
  } catch (error) {
    console.error('[ProfileJs] Erreur lors de la notification avatar:', error);
  }
}

// Initialiser la page au chargement du DOM
document.addEventListener('DOMContentLoaded', init);
