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
    console.log("[ProfileJs] init() CALLED. Attempting to initialize authService...");
    const initialUser = await authService.init(); // Attend la promesse de init
    console.log("[ProfileJs] authService.init() COMPLETED. Initial user from authService.init():", initialUser);
    
    // Récupérer à nouveau au cas où notifyListeners aurait mis à jour entre-temps, ou utiliser initialUser.
    const currentUser = authService.getCurrentUser(); 
    console.log("[ProfileJs] currentUser from authService.getCurrentUser() after init:", currentUser);
    
    // Vérifier si l'utilisateur est connecté
    if (!currentUser) { // La vérification principale
      console.warn("[ProfileJs] currentUser is NULL or undefined. Redirecting to login.html");
      window.location.href = 'login.html';
      return;
    }

    console.log("[ProfileJs] User IS connected. Username:", currentUser.username);
    
    // Charger le profil
    await loadProfile(currentUser);

    // Initialiser les onglets
    initTabs();

    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    console.log("[ProfileJs] Profile page initialization successful.");
  } catch (error) {
    console.error("[ProfileJs] CRITICAL ERROR during profile page init:", error);
    // Optionnel : rediriger vers une page d'erreur ou login si l'initialisation échoue de manière critique
    // window.location.href = 'login.html'; 
  }
}

/**
 * Chargement du profil utilisateur
 */
async function loadProfile(userData) {
  try {
    console.log("Chargement du profil pour l'utilisateur:", userData.username);
    
    if (!userData) {
      console.error("Impossible de charger les données utilisateur (données non fournies à loadProfile)");
      window.location.href = 'login.html';
      return;
    }
    
    console.log("Données utilisateur pour le profil:", userData);
    
    // Mettre à jour les informations du profil
    username.textContent = userData.username || 'Aventurier';
    userEmail.textContent = userData.email || 'Email non disponible';
    userLevel.textContent = userData.level || 1;
    userXP.textContent = `${userData.xp || 0} XP`;
    userCoins.textContent = `${userData.coins || 0} pièces`;
    
    // Mettre à jour l'avatar complet
    updateAvatarDisplay(userData.avatar);
    
    // Charger l'inventaire
    await loadInventory(userData);
    
    // Charger les succès
    loadAchievements(userData.achievements || []);
    
    // Mettre à jour les paramètres
    updateSettings(userData.settings);

    // Afficher le lien vers le panneau d'administration si l'utilisateur est admin
    if (userData.isAdmin) {
      const adminPanelLinkContainer = document.getElementById('adminPanelLinkContainer');
      if (adminPanelLinkContainer) {
        adminPanelLinkContainer.style.display = 'block';
      }
    }
    
    console.log("Profil chargé avec succès");
  } catch (error) {
    console.error("Erreur lors du chargement du profil:", error);
  }
}

/**
 * Mettre à jour l'affichage de l'avatar
 */
function updateAvatarDisplay(avatar) {
  console.log("Mise à jour de l'affichage de l'avatar avec:", avatar);
  
  try {
    // Avatar par défaut si aucun avatar n'est fourni
    if (!avatar) {
      userAvatarHead.src = 'assets/avatars/heads/default_boy.png';
      userAvatarBody.src = 'assets/avatars/bodies/default_boy.png';
      userAvatarBackground.src = 'assets/avatars/backgrounds/default.png';
      
      // Cache l'accessoire s'il n'y en a pas
      if (userAvatarAccessory.querySelector('img')) {
        userAvatarAccessory.querySelector('img').style.display = 'none';
      } else {
        userAvatarAccessory.style.display = 'none';
      }
      
      console.log("Avatar par défaut appliqué");
      return;
    }

    // Mettre à jour chaque partie de l'avatar
    const headType = avatar.head || 'default_boy';
    const bodyType = avatar.body || 'default_boy';
    const bgType = avatar.background || 'default';
    
    console.log("Types d'avatar:", { head: headType, body: bodyType, background: bgType, accessory: avatar.accessory });
    
    // Mise à jour des images
    userAvatarHead.src = `assets/avatars/heads/${headType}.png`;
    userAvatarBody.src = `assets/avatars/bodies/${bodyType}.png`;
    userAvatarBackground.src = `assets/avatars/backgrounds/${bgType}.png`;
    
    // Gestion des erreurs d'image
    userAvatarHead.onerror = function() {
      console.error("Erreur de chargement de l'image de tête:", this.src);
      this.src = 'assets/avatars/heads/default_boy.png';
    };
    
    userAvatarBody.onerror = function() {
      console.error("Erreur de chargement de l'image de corps:", this.src);
      this.src = 'assets/avatars/bodies/default_boy.png';
    };
    
    userAvatarBackground.onerror = function() {
      console.error("Erreur de chargement de l'arrière-plan:", this.src);
      this.src = 'assets/avatars/backgrounds/default.png';
    };
    
    // Gestion de l'accessoire
    const accessoryImgElement = userAvatarAccessory.querySelector('img');
    
    if (avatar.accessory && avatar.accessory !== 'none') {
      if (accessoryImgElement) {
        accessoryImgElement.src = `assets/avatars/accessories/${avatar.accessory}.png`;
        accessoryImgElement.style.display = 'block';
        userAvatarAccessory.style.display = 'block';
        
        accessoryImgElement.onerror = function() {
          console.error("Erreur de chargement de l'accessoire:", this.src);
          this.style.display = 'none';
        };
      } else {
        console.error("Élément image d'accessoire non trouvé");
      }
    } else {
      // Pas d'accessoire équipé
      if (accessoryImgElement) {
        accessoryImgElement.style.display = 'none';
      }
      // On garde le conteneur visible car il a une couleur/bordure
    }
    
    console.log("Avatar mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    // Fallback vers l'avatar par défaut en cas d'erreur
    userAvatarHead.src = 'assets/avatars/heads/default_boy.png';
    userAvatarBody.src = 'assets/avatars/bodies/default_boy.png';
    userAvatarBackground.src = 'assets/avatars/backgrounds/default.png';
    
    if (userAvatarAccessory.querySelector('img')) {
      userAvatarAccessory.querySelector('img').style.display = 'none';
    } else {
      userAvatarAccessory.style.display = 'none';
    }
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
async function loadInventory(userData) {
  try {
    console.log("Chargement de l'inventaire...");
    inventoryGrid.innerHTML = '<p>Chargement de l\'inventaire...</p>';

    if (!userData || !skinService) {
      console.error("Données utilisateur ou SkinService non disponibles pour charger l'inventaire.");
      inventoryGrid.innerHTML = '<p>Erreur lors du chargement de l\'inventaire.</p>';
      return;
    }

    const allSkins = await skinService.getAllSkins();
    const userInventory = userData.inventory || [];
    const userEquipped = userData.avatar || {};
    
    console.log("Skins disponibles:", JSON.stringify(allSkins));
    console.log("Types de skins disponibles:", Object.keys(allSkins));
    console.log("Inventaire actuel:", JSON.stringify(userInventory));
    
    // Vider la grille d'inventaire
    inventoryGrid.innerHTML = '';
    
    // Si l'inventaire est vide et pas de skins disponibles
    if (Object.keys(allSkins).length === 0) {
      inventoryGrid.innerHTML = '<p>Aucun item dans votre inventaire pour le moment.</p>';
      return;
    }
    
    // Afficher toutes les clés disponibles
    const availableTypes = Object.keys(allSkins);
    console.log("Types disponibles:", availableTypes);
    
    // Créer les sections pour chaque type de skin
    Object.entries(allSkins).forEach(([type, skins]) => {
      console.log(`Traitement du type: ${type} avec ${skins.length} skins`);
      
      // Créer la section
      const section = document.createElement('div');
      section.className = 'inventory-section';
      section.innerHTML = `
        <h3>${getTypeName(type)}</h3>
        <div class="skin-grid" id="skin-grid-${type}"></div>
      `;
      
      const skinGrid = section.querySelector(`.skin-grid`);
      
      // Ajouter chaque skin
      skins.forEach(skin => {
        // Vérifier si l'utilisateur possède le skin
        const owned = userInventory.some(item => item.id === skin.id && item.type === type);
        // Vérifier si le skin est équipé
        const equipped = userEquipped[type] === skin.id;
        
        console.log(`Skin: ${skin.id} (${type}) - Owned: ${owned}, Equipped: ${equipped}`);
        
        // Créer l'élément de skin
        const skinItem = document.createElement('div');
        skinItem.className = `inventory-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;
        
        // Choisir l'image de fallback en fonction du type
        const fallbackImage = type === 'head' ? 'assets/avatars/heads/default_boy.png' : 
                             type === 'body' ? 'assets/avatars/bodies/default_boy.png' :
                             type === 'accessory' ? 'assets/avatars/accessories/none.png' : 
                             'assets/avatars/backgrounds/default.png';
        
        skinItem.innerHTML = `
          <img src="${skin.image}" alt="${skin.name}" onerror="this.src='${fallbackImage}'">
          <h4>${skin.name}</h4>
          <p>${skin.price} pièces</p>
          ${owned ? 
            `<button class="btn-equip" data-skin-id="${skin.id}" data-skin-type="${type}">${equipped ? 'Équipé' : 'Équiper'}</button>` : 
            `<button class="btn-buy" data-skin-id="${skin.id}" data-skin-type="${type}">Acheter</button>`
          }
        `;
        
        skinGrid.appendChild(skinItem);
      });
      
      inventoryGrid.appendChild(section);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons
    setupInventoryButtons();
    
    console.log("Inventaire chargé avec succès");
  } catch (error) {
    console.error("Erreur lors du chargement de l'inventaire:", error);
    inventoryGrid.innerHTML = `<p>Erreur lors du chargement de l'inventaire: ${error.message}</p>`;
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
  // Boutons d'achat
  document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', async () => {
      const skinId = button.dataset.skinId;
      const skinType = button.dataset.skinType;
      
      try {
        const result = await skinService.buySkin(skinId, skinType);
        if (result.success) {
          alert(`Vous avez acheté ${result.skin.name} avec succès !`);
          await loadInventory();
          await loadProfile();
        } else {
          alert(result.error || "Erreur lors de l'achat du skin");
        }
      } catch (error) {
        console.error("Erreur lors de l'achat du skin:", error);
        alert("Une erreur est survenue lors de l'achat");
      }
    });
  });
  
  // Boutons d'équipement
  document.querySelectorAll('.btn-equip').forEach(button => {
    button.addEventListener('click', async () => {
      const skinId = button.dataset.skinId;
      const skinType = button.dataset.skinType;
      
      try {
        const result = await skinService.equipSkin(skinId, skinType);
        if (result.success) {
          await loadInventory();
          await loadProfile();
        } else {
          alert(result.error || "Erreur lors de l'équipement du skin");
        }
      } catch (error) {
        console.error("Erreur lors de l'équipement du skin:", error);
        alert("Une erreur est survenue lors de l'équipement");
      }
    });
  });
}

/**
 * Chargement des succès
 */
function loadAchievements(userAchievements = []) {
  try {
    console.log("Chargement des succès...");
    
    // Vider la liste des succès
    achievementList.innerHTML = '';
    
    // Si aucun succès n'est disponible
    if (defaultAchievements.length === 0 && userAchievements.length === 0) {
      achievementList.innerHTML = '<p>Aucun succès disponible pour le moment.</p>';
      return;
    }
    
    // Fusionner les succès par défaut avec ceux de l'utilisateur
    const mergedAchievements = [...defaultAchievements];
    
    // Mettre à jour les succès avec ceux de l'utilisateur
    userAchievements.forEach(userAchievement => {
      const index = mergedAchievements.findIndex(a => a.id === userAchievement.id);
      if (index !== -1) {
        mergedAchievements[index].unlocked = userAchievement.unlocked;
        mergedAchievements[index].unlockedAt = userAchievement.unlockedAt;
      } else {
        mergedAchievements.push(userAchievement);
      }
    });
    
    // Créer l'élément HTML pour chaque succès
    mergedAchievements.forEach(achievement => {
    const achievementItem = document.createElement('div');
      achievementItem.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;

    achievementItem.innerHTML = `
      <div class="achievement-icon">
        <i class="${achievement.icon}"></i>
      </div>
        <div class="achievement-info">
          <h3>${achievement.title}</h3>
          <p>${achievement.description}</p>
          ${achievement.unlocked && achievement.unlockedAt ? 
            `<span class="achievement-date">Débloqué le ${new Date(achievement.unlockedAt).toLocaleDateString()}</span>` : 
            ''}
        </div>
        ${!achievement.unlocked ? '<div class="achievement-locked"><i class="fas fa-lock"></i></div>' : ''}
      `;
      
      achievementList.appendChild(achievementItem);
    });
    
    console.log("Succès chargés avec succès");
  } catch (error) {
    console.error("Erreur lors du chargement des succès:", error);
  }
}

/**
 * Mise à jour des paramètres
 */
function updateSettings(settings = {}) {
  try {
    console.log("Mise à jour des paramètres...");
    
    // Valeurs par défaut
    const defaultSettings = {
      theme: 'dark',
      notifications: true,
      sound: true
    };
    
    // Fusionner avec les paramètres par défaut
    const mergedSettings = { ...defaultSettings, ...settings };
    
    // Mettre à jour les toggles
    themeToggle.checked = mergedSettings.theme === 'dark';
    notificationsToggle.checked = mergedSettings.notifications;
    soundToggle.checked = mergedSettings.sound;
    
    console.log("Paramètres mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error);
  }
}

/**
 * Configuration des écouteurs d'événements
 */
function setupEventListeners() {
  try {
    console.log("Configuration des écouteurs d'événements...");
    
    // Paramètres
    themeToggle.addEventListener('change', async () => {
      try {
        await authService.updateProfile({
          settings: {
            theme: themeToggle.checked ? 'dark' : 'light'
          }
        });
        
        // Mettre à jour le thème
        document.body.classList.toggle('light-theme', !themeToggle.checked);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du thème:", error);
        themeToggle.checked = !themeToggle.checked;
      }
    });
    
    notificationsToggle.addEventListener('change', async () => {
      try {
        await authService.updateProfile({
          settings: {
            notifications: notificationsToggle.checked
          }
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour des notifications:", error);
        notificationsToggle.checked = !notificationsToggle.checked;
      }
    });
    
    soundToggle.addEventListener('change', async () => {
      try {
        await authService.updateProfile({
          settings: {
            sound: soundToggle.checked
          }
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour du son:", error);
        soundToggle.checked = !soundToggle.checked;
      }
    });
    
    console.log("Écouteurs d'événements configurés avec succès");
  } catch (error) {
    console.error("Erreur lors de la configuration des écouteurs d'événements:", error);
  }
}

// Initialiser la page au chargement du DOM
document.addEventListener('DOMContentLoaded', init);
