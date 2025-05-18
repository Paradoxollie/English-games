/**
 * English Quest - Profile Script
 * Gère la page de profil utilisateur
 */

import { authService } from './auth-service.js';
import { skinService } from './skin-service.js';

// Éléments du DOM
const userAvatar = document.getElementById('userAvatar');
const username = document.getElementById('username');
const userEmail = document.getElementById('userEmail');
const userLevel = document.getElementById('userLevel');
const userXP = document.getElementById('userXP');
const userCoins = document.getElementById('userCoins');
const avatarUpload = document.getElementById('avatarUpload');
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
    console.log("Initialisation du profil...");
    
    // Initialiser le service d'authentification
    await authService.init();
    
    // Vérifier si l'utilisateur est connecté
    if (!authService.currentUser) {
      console.log("Utilisateur non connecté, redirection vers la page de connexion");
      window.location.href = 'login.html';
      return;
    }
    
    console.log("Utilisateur connecté:", authService.currentUser.email);
    
    // Charger le profil
    await loadProfile();
    
    // Initialiser les onglets
    initTabs();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    console.log("Initialisation terminée avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
}

/**
 * Chargement du profil utilisateur
 */
async function loadProfile() {
  try {
    console.log("Chargement du profil...");
    
    // Charger les données utilisateur
    const userData = await authService.loadUserData();
    if (!userData) {
      console.error("Impossible de charger les données utilisateur");
      return;
    }
    
    console.log("Données utilisateur chargées:", userData);
    
    // Mettre à jour les informations du profil
    username.textContent = userData.username || authService.currentUser.displayName || 'Aventurier';
    userEmail.textContent = userData.email || authService.currentUser.email;
    userLevel.textContent = `Niveau ${userData.level || 1}`;
    userXP.textContent = `${userData.xp || 0} XP`;
    userCoins.textContent = `${userData.coins || 0} pièces`;
    
    // Mettre à jour l'avatar
    userAvatar.src = userData.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    
    // Charger l'inventaire
    await loadInventory();
    
    // Charger les succès
    loadAchievements(userData.achievements || []);
    
    // Mettre à jour les paramètres
    updateSettings(userData.settings);
    
    console.log("Profil chargé avec succès");
  } catch (error) {
    console.error("Erreur lors du chargement du profil:", error);
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
async function loadInventory() {
  try {
    console.log("Chargement de l'inventaire...");
    
    // Récupérer les données utilisateur
    const userData = await authService.loadUserData();
    if (!userData) return;
    
    // Récupérer l'inventaire et les skins disponibles
    const inventory = userData.inventory || [];
    const availableSkins = skinService.getAvailableSkins();
    
    // Vider la grille d'inventaire
    inventoryGrid.innerHTML = '';
    
    // Si l'inventaire est vide
    if (inventory.length === 0 && Object.keys(availableSkins).length === 0) {
      inventoryGrid.innerHTML = '<p>Aucun item dans votre inventaire pour le moment.</p>';
      return;
    }
    
    // Créer les sections pour chaque type de skin
    Object.entries(availableSkins).forEach(([type, skins]) => {
      // Créer la section
      const section = document.createElement('div');
      section.className = 'inventory-section';
      section.innerHTML = `
        <h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        <div class="skin-grid" id="skin-grid-${type}"></div>
      `;
      
      const skinGrid = section.querySelector(`.skin-grid`);
      
      // Ajouter chaque skin
      skins.forEach(skin => {
        // Vérifier si l'utilisateur possède le skin
        const owned = inventory.some(item => item.id === skin.id && item.type === type);
        // Vérifier si le skin est équipé
        const equipped = userData.avatar && userData.avatar[type] === skin.id;
        
        // Créer l'élément de skin
        const skinItem = document.createElement('div');
        skinItem.className = `inventory-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;
        
        skinItem.innerHTML = `
          <img src="${skin.image}" alt="${skin.name}">
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
  }
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
    
    // Upload d'avatar
    avatarUpload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const result = await authService.uploadAvatar(file);
        if (result.success) {
          userAvatar.src = result.avatarUrl;
        } else {
          alert(result.error || "Erreur lors de l'upload de l'avatar");
        }
      } catch (error) {
        console.error("Erreur lors de l'upload de l'avatar:", error);
        alert("Une erreur est survenue lors de l'upload de l'avatar");
      }
    });
    
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
