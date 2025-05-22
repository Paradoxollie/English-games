/**
 * English Quest - Profile Script
 * Gère la page de profil utilisateur
 */

import { authService } from './auth-service.js';
import { skinService } from './skin-service.js';

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
    await authService.initializeAuth(); // Changed from authService.init()
    const authState = authService.getAuthState();

    if (!authState.isAuthenticated || !authState.profile) {
      console.warn("[ProfileJs] User not authenticated or profile missing. Redirecting to login.html");
      window.location.href = 'login.html';
      return;
    }
    
    // console.log("[ProfileJs] User IS connected. Username:", authState.profile.username); // Keep console logs if desired
    await loadProfile(authState.profile);
    initTabs();
    setupEventListeners();
    // console.log("[ProfileJs] Profile page initialization successful."); // Keep console logs if desired
  } catch (error) {
    console.error("[ProfileJs] CRITICAL ERROR during profile page init:", error);
    // Optional: window.location.href = 'login.html'; 
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
    // For userEmail, it shows the internal email. This might be okay for admin,
    // but for regular users, it might be better to show profileData.username again or hide it.
    // For now, it displays the internal email as per previous refactor.
    if (userEmail) userEmail.textContent = profileData.email || 'Internal ID not set'; 
    if (userLevel) userLevel.textContent = profileData.level || 1;
    if (userXP) userXP.textContent = `${profileData.xp || 0} XP`;
    if (userCoins) userCoins.textContent = `${profileData.coins || 0} pièces`;
    
    // Add these lines:
    if (userPendingXP) userPendingXP.textContent = `${profileData.pendingXP || 0} XP`;
    if (userPendingCoins) userPendingCoins.textContent = `${profileData.pendingCoins || 0} pièces`;
    
    updateAvatarDisplay(profileData.avatar); 
    await loadInventory(profileData); // loadInventory will also take profileData
    loadAchievements(profileData.achievements || []);
    updateSettings(profileData.settings); // Adjusted to call existing updateSettings function

    // Assuming adminPanelLinkContainer is defined globally or fetched if needed
    const adminPanelLinkContainer = document.getElementById('adminPanelLinkContainer'); 
    if (adminPanelLinkContainer) {
      adminPanelLinkContainer.style.display = profileData.isAdmin ? 'block' : 'none';
    }
  } catch (error) {
    console.error("[ProfileJs] Error loading profile:", error);
  }
}

/**
 * Mettre à jour l'affichage de l'avatar
 */
function updateAvatarDisplay(avatarData) { // avatarData is profile.avatar object {head: 'id', body: 'id', ...}
  try {
    const skins = skinService.getAvailableSkins(); // Get all available skin details
    const defaultHeadId = 'default_boy_head';
    const defaultBodyId = 'default_boy_body';
    const defaultBackgroundId = 'default_background';
    const defaultAccessoryId = 'none';

    const headId = avatarData?.head || defaultHeadId;
    const bodyId = avatarData?.body || defaultBodyId;
    const backgroundId = avatarData?.background || defaultBackgroundId;
    const accessoryId = avatarData?.accessory || defaultAccessoryId;

    const headSkin = skins.head.find(s => s.id === headId) || skins.head.find(s => s.id === defaultHeadId);
    const bodySkin = skins.body.find(s => s.id === bodyId) || skins.body.find(s => s.id === defaultBodyId);
    const backgroundSkin = skins.background.find(s => s.id === backgroundId) || skins.background.find(s => s.id === defaultBackgroundId);
    const accessorySkin = skins.accessory.find(s => s.id === accessoryId) || skins.accessory.find(s => s.id === defaultAccessoryId);

    // Global DOM elements from file: userAvatarHead, userAvatarBody, userAvatarBackground (img), userAvatarAccessory (div)
    // New code expects: userAvatarHead, userAvatarBody, avatarContainer (div for background), userAvatarAccessoryDiv, userAvatarAccessoryImg

    if (userAvatarHead && headSkin) userAvatarHead.src = headSkin.image;
    else if (userAvatarHead) userAvatarHead.src = 'assets/avatars/heads/default_boy.png';

    if (userAvatarBody && bodySkin) userAvatarBody.src = bodySkin.image;
    else if (userAvatarBody) userAvatarBody.src = 'assets/avatars/bodies/default_boy.png';
    
    // Assuming 'avatarContainer' is a new global const that should point to the main avatar display div
    const avatarContainer = document.getElementById('avatarContainer'); // Attempt to get it if not global
    if (avatarContainer && backgroundSkin) {
        avatarContainer.style.backgroundImage = `url('${backgroundSkin.image}')`;
    } else if (avatarContainer) {
        avatarContainer.style.backgroundImage = `url('assets/avatars/backgrounds/default.png')`;
    }
    
    // Hide the original <img> tag for background (userAvatarBackground)
    if(userAvatarBackground) userAvatarBackground.style.display = 'none';

    // userAvatarAccessory is the DIV. We need to find the IMG tag within it.
    const accessoryImgElement = userAvatarAccessory ? userAvatarAccessory.querySelector('img') : null;

    if (userAvatarAccessory && accessoryImgElement) { // userAvatarAccessory is the Div
      if (accessorySkin && accessorySkin.id !== 'none' && accessorySkin.image) {
        accessoryImgElement.src = accessorySkin.image;
        accessoryImgElement.style.display = 'block';
        userAvatarAccessory.style.display = 'block'; 
      } else {
        accessoryImgElement.style.display = 'none';
        // userAvatarAccessory.style.display = 'none'; // Optionally hide div
      }
    }
  } catch (error) {
    console.error("[ProfileJs] Error updating avatar display:", error);
    // Fallback
    if (userAvatarHead) userAvatarHead.src = 'assets/avatars/heads/default_boy.png';
    if (userAvatarBody) userAvatarBody.src = 'assets/avatars/bodies/default_boy.png';
    const avatarContainer = document.getElementById('avatarContainer');
    if (avatarContainer) avatarContainer.style.backgroundImage = `url('assets/avatars/backgrounds/default.png')`;
    const accessoryImgElement = userAvatarAccessory ? userAvatarAccessory.querySelector('img') : null;
    if (accessoryImgElement) accessoryImgElement.style.display = 'none';
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
 * Chargement de l'inventaire
 */
async function loadInventory(profileData) {
  try {
    // Ensure global DOM element 'inventoryGrid' is used
    if (!inventoryGrid) {
        console.error("[ProfileJs] inventoryGrid DOM element not found.");
        return;
    }
    inventoryGrid.innerHTML = '<p>Chargement de l\'inventaire...</p>';

    if (!profileData) {
      inventoryGrid.innerHTML = '<p>Erreur: Données utilisateur non disponibles pour l\'inventaire.</p>';
      return;
    }

    const allSkinCategories = skinService.getAvailableSkins();
    // profileData.inventory.skins should be like { head: ['id1'], body: ['id2'], ... }
    const userOwnedSkinsData = profileData.inventory?.skins || {}; 
    // profileData.avatar should be like { head: 'equippedId1', body: 'equippedId2', ... }
    const userEquippedSkins = profileData.avatar || {}; 
    
    inventoryGrid.innerHTML = ''; // Clear loading message

    Object.entries(allSkinCategories).forEach(([type, skinsInCategory]) => {
      const section = document.createElement('div');
      section.className = 'inventory-section';
      // Ensure getTypeName is available or define it within profile.js
      section.innerHTML = `<h3>${getTypeName(type)}</h3><div class="skin-grid" id="skin-grid-${type}"></div>`;
      const skinGridElement = section.querySelector(`.skin-grid`);
      
      if (Array.isArray(skinsInCategory)) {
        skinsInCategory.forEach(skin => {
          const ownedSkinsForTypeArray = userOwnedSkinsData[type] || [];
          // Items with price 0 are considered owned for equipping purposes.
          const owned = ownedSkinsForTypeArray.includes(skin.id) || skin.price === 0; 
          const equipped = userEquippedSkins[type] === skin.id;
          
          const skinItem = document.createElement('div');
          skinItem.className = `inventory-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;
          
          // Consider a more specific fallback or ensure skin.image is always valid
          const fallbackImage = 'assets/images/placeholder.webp'; 
          
          skinItem.innerHTML = `
            <img src="${skin.image}" alt="${skin.name}" onerror="this.src='${fallbackImage}'">
            <h4>${skin.name}</h4>
            <p>${skin.price} pièces</p>
            ${owned ? 
              `<button class="btn-equip" data-skin-id="${skin.id}" data-skin-type="${type}" ${equipped ? 'disabled' : ''}>${equipped ? 'Équipé' : 'Équiper'}</button>` : 
              `<button class="btn-buy" data-skin-id="${skin.id}" data-skin-type="${type}">Acheter</button>`
            }
          `;
          if (skinGridElement) skinGridElement.appendChild(skinItem);
        });
      }
      inventoryGrid.appendChild(section);
    });
    
    setupInventoryButtons(); // This function should exist in profile.js
  } catch (error) {
    console.error("[ProfileJs] Error loading inventory:", error);
    if (inventoryGrid) inventoryGrid.innerHTML = `<p>Erreur lors du chargement de l'inventaire: ${error.message}</p>`;
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
  document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', async (e) => {
      const targetButton = e.currentTarget;
      targetButton.disabled = true;
      const skinId = targetButton.dataset.skinId;
      const skinType = targetButton.dataset.skinType;
      try {
        const result = await skinService.buySkin(skinId, skinType);
        if (result.success) {
          alert(\`Achat réussi: \${result.skin.name}\`);
          const latestProfile = authService.getAuthState().profile;
          if (latestProfile) {
            await loadProfile(latestProfile); 
          } else {
            console.warn('[ProfileJs] Profile data not immediately available after buy, re-initializing.');
            await init(); 
          }
        } else {
          alert(result.error || "Erreur lors de l'achat.");
        }
      } catch (error) {
        console.error('[ProfileJs] Exception during buy:', error);
        alert("Exception lors de l'achat: " + error.message);
      } finally {
        if (targetButton) targetButton.disabled = false;
      }
    });
  });
  
  document.querySelectorAll('.btn-equip').forEach(button => {
    button.addEventListener('click', async (e) => {
      const targetButton = e.currentTarget;
      targetButton.disabled = true;
      const skinId = targetButton.dataset.skinId;
      const skinType = targetButton.dataset.skinType;
      try {
        const result = await skinService.equipSkin(skinId, skinType);
        if (result.success) {
           const latestProfile = authService.getAuthState().profile;
           if (latestProfile) {
            await loadProfile(latestProfile);
           } else {
            console.warn('[ProfileJs] Profile data not immediately available after equip, re-initializing.');
            await init();
           }
        } else {
          alert(result.error || "Erreur lors de l'équipement.");
        }
      } catch (error) {
        console.error('[ProfileJs] Exception during equip:', error);
        alert("Exception lors de l'équipement: " + error.message);
      } finally {
        if (targetButton) targetButton.disabled = false;
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
      item.className = \`achievement-card \${ach.unlocked ? 'unlocked' : 'locked'}\`;
      item.innerHTML = \`
        <div class="achievement-icon"><i class="\${ach.icon || 'fas fa-question-circle'}"></i></div>
        <div class="achievement-info">
          <h3>\${ach.title}</h3><p>\${ach.description}</p>
          \${ach.unlocked && ach.unlockedAt ? \`<span class="achievement-date">Débloqué le \${new Date(ach.unlockedAt).toLocaleDateString()}</span>\` : ''}
        </div>
        \${!ach.unlocked ? '<div class="achievement-locked"><i class="fas fa-lock"></i></div>' : ''}
      \`;
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
      const profile = authService.getAuthState().profile;
      if(profile?.settings) {
        try {
          await authService.updateUserProfile({ settings: { ...profile.settings, theme: newTheme } });
          document.body.classList.toggle('light-theme', !themeToggle.checked);
        } catch (e) { console.error('Error saving theme', e); /* Revert UI? */ }
      }
    });
    
    if(notificationsToggle) notificationsToggle.addEventListener('change', async () => {
       const profile = authService.getAuthState().profile;
       if(profile?.settings) {
         try {
          await authService.updateUserProfile({ settings: { ...profile.settings, notifications: notificationsToggle.checked } });
         } catch (e) { console.error('Error saving notification settings', e); /* Revert UI? */ }
       }
    });
    
    if(soundToggle) soundToggle.addEventListener('change', async () => {
      const profile = authService.getAuthState().profile;
      if(profile?.settings) {
        try {
          await authService.updateUserProfile({ settings: { ...profile.settings, sound: soundToggle.checked } });
        } catch (e) { console.error('Error saving sound settings', e); /* Revert UI? */ }
      }
    });
  } catch (error) {
    console.error("[ProfileJs] Error setting up settings listeners:", error);
  }
}

// Initialiser la page au chargement du DOM
document.addEventListener('DOMContentLoaded', init);
