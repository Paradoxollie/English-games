/**
 * English Quest - Profile Script
 * Gère la page de profil utilisateur
 */

// Centralisation Firebase v9+ modulaire
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

// Données de l'utilisateur
let userData = null;

// Données des succès
const achievements = [
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

// Données des activités récentes (vide par défaut)
const recentActivities = [];

// Données des jeux favoris (vide par défaut)
const favoriteGames = [];

// Initialiser la page
document.addEventListener('DOMContentLoaded', function() {
  // Récupérer les données de l'utilisateur
  userData = getCurrentUser();

  if (!userData) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    window.location.href = 'auth.html';
    return;
  }

  // Mettre à jour la date de dernière connexion
  updateLastLoginDate();

  // Initialiser les onglets
  initTabs();

  // Charger les données du profil
  loadProfileData();

  // Charger les succès
  loadAchievements();

  // Charger les activités récentes
  loadRecentActivities();

  // Charger les jeux favoris
  loadFavoriteGames();

  // Initialiser les paramètres
  initSettings();

  // Initialiser les actions du compte
  initAccountActions();
});

// Initialiser les onglets
function initTabs() {
  const tabs = document.querySelectorAll('.profile-tab');
  const tabContents = document.querySelectorAll('.profile-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Retirer la classe active de tous les onglets et contenus
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Ajouter la classe active à l'onglet cliqué
      tab.classList.add('active');

      // Afficher le contenu correspondant
      const tabId = tab.dataset.tab + '-content';
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Charger les données du profil
function loadProfileData() {
  console.log("Chargement des données du profil pour:", userData.username);

  // S'assurer que les données importantes sont présentes
  userData.coins = userData.coins || 0;
  userData.xp = userData.xp || 0;
  userData.level = userData.level || 1;

  // Mettre à jour le nom d'utilisateur
  const usernameElement = document.getElementById('profile-username');
  if (usernameElement) {
    usernameElement.textContent = userData.username || 'Aventurier';
  }

  // Mettre à jour le niveau
  const level = userData.level || 1;
  const userLevelElement = document.getElementById('user-level');
  if (userLevelElement) {
    userLevelElement.textContent = level;
  }

  const currentLevelElement = document.getElementById('current-level');
  if (currentLevelElement) {
    currentLevelElement.textContent = level;
  }

  const nextLevelElement = document.getElementById('next-level');
  if (nextLevelElement) {
    nextLevelElement.textContent = level + 1;
  }

  // Mettre à jour l'XP
  const xp = userData.xp || 0;
  const requiredXp = calculateRequiredXp(level);
  const progress = Math.min(100, (xp / requiredXp) * 100);

  const userXpElement = document.getElementById('user-xp');
  if (userXpElement) {
    userXpElement.textContent = xp;
  }

  const currentXpElement = document.getElementById('current-xp');
  if (currentXpElement) {
    currentXpElement.textContent = xp;
  }

  const requiredXpElement = document.getElementById('required-xp');
  if (requiredXpElement) {
    requiredXpElement.textContent = requiredXp;
  }

  const xpProgressElement = document.getElementById('xp-progress');
  if (xpProgressElement) {
    xpProgressElement.style.width = progress + '%';
  }

  // Mettre à jour les pièces
  const userCoinsElement = document.getElementById('user-coins');
  if (userCoinsElement) {
    userCoinsElement.textContent = userData.coins || 0;
  }

  // Mettre à jour le rang
  const userRankElement = document.getElementById('user-rank');
  if (userRankElement) {
    userRankElement.textContent = calculateRank(level);
  }

  // S'assurer que les statistiques existent
  if (!userData.stats) {
    userData.stats = {
      gamesPlayed: 0,
      gamesWon: 0,
      coursesCompleted: 0,
      timeSpent: 0
    };
  }

  // Mettre à jour les statistiques
  const gamesPlayedElement = document.getElementById('games-played');
  if (gamesPlayedElement) {
    gamesPlayedElement.textContent = userData.stats.gamesPlayed || 0;
  }

  const gamesWonElement = document.getElementById('games-won');
  if (gamesWonElement) {
    gamesWonElement.textContent = userData.stats.gamesWon || 0;
  }

  const coursesCompletedElement = document.getElementById('courses-completed');
  if (coursesCompletedElement) {
    coursesCompletedElement.textContent = userData.stats.coursesCompleted || 0;
  }

  const timePlayedElement = document.getElementById('time-played');
  if (timePlayedElement) {
    timePlayedElement.textContent = formatTime(userData.stats.timeSpent || 0);
  }

  console.log("Données du profil chargées avec succès");
}

// Charger les succès
function loadAchievements() {
  const achievementList = document.getElementById('achievementList');
  if (!achievementList) return;

  achievementList.innerHTML = '';
  
  achievements.forEach(achievement => {
    const achievementElement = document.createElement('div');
    achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    achievementElement.innerHTML = `
      <i class="${achievement.icon}"></i>
      <div class="achievement-info">
        <h4>${achievement.title}</h4>
        <p>${achievement.description}</p>
      </div>
      <div class="achievement-status">
        ${achievement.unlocked ? '<i class="fas fa-check"></i>' : '<i class="fas fa-lock"></i>'}
      </div>
    `;
    achievementList.appendChild(achievementElement);
  });
}

// Charger les activités récentes
function loadRecentActivities() {
  const activitiesList = document.getElementById('recent-activities');
  if (!activitiesList) return;

  // Vider la liste
  activitiesList.innerHTML = '';

  // Récupérer les activités de l'utilisateur ou utiliser les activités par défaut
  const userActivities = userData.activities || recentActivities;

  // Si aucune activité, afficher un message
  if (userActivities.length === 0) {
    activitiesList.innerHTML = `
      <div class="activity-empty">
        <p>Aucune activité récente. Commencez à jouer pour voir votre progression !</p>
      </div>
    `;
    return;
  }

  // Ajouter chaque activité à la liste
  userActivities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';

    activityItem.innerHTML = `
      <div class="activity-icon">
        <i class="${activity.icon}"></i>
      </div>
      <div class="activity-info">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-description">${activity.description}</div>
      </div>
      <div class="activity-time">${formatDate(activity.time)}</div>
    `;

    activitiesList.appendChild(activityItem);
  });
}

// Charger les jeux favoris
function loadFavoriteGames() {
  const favoritesList = document.getElementById('favorite-games');
  if (!favoritesList) return;

  // Vider la liste
  favoritesList.innerHTML = '';

  // Récupérer les jeux favoris de l'utilisateur
  const userFavorites = userData.favoriteGames || [];

  // Si aucun jeu favori, afficher un message
  if (userFavorites.length === 0) {
    favoritesList.innerHTML = `
      <div class="empty-favorites">
        <p>Vous n'avez pas encore de jeux favoris. Jouez à des jeux pour les ajouter à vos favoris !</p>
      </div>
    `;
    return;
  }

  // Ajouter chaque jeu favori à la liste
  userFavorites.forEach(game => {
    const gameItem = document.createElement('div');
    gameItem.className = 'favorite-item';

    gameItem.innerHTML = `
      <div class="favorite-image">
        <img src="${game.image || 'assets/icons/default-game.webp'}" alt="${game.title}">
      </div>
      <div class="favorite-content">
        <h3 class="favorite-title">${game.title}</h3>
        <p class="favorite-description">${game.description || 'Aucune description disponible'}</p>
        <div class="favorite-stats">
          <span><i class="fas fa-gamepad"></i> ${game.playCount || 0} parties</span>
          <span><i class="fas fa-trophy"></i> ${game.bestScore || 0} points</span>
        </div>
      </div>
    `;

    favoritesList.appendChild(gameItem);
  });
}

// Initialiser les paramètres
function initSettings() {
  const settingsForm = document.getElementById('settings-form');
  if (!settingsForm) return;

  // Remplir le formulaire avec les données de l'utilisateur
  document.getElementById('username').value = userData.username || '';

  // Gérer la soumission du formulaire
  settingsForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Vérifier que le nom d'utilisateur n'est pas vide
    if (!username) {
      alert('Le nom d\'utilisateur ne peut pas être vide');
      return;
    }

    // Si un nouveau mot de passe est fourni, vérifier qu'il correspond à la confirmation
    if (newPassword && newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    // Mettre à jour les données de l'utilisateur
    userData.username = username;

    // Si un nouveau mot de passe est fourni, le mettre à jour
    if (newPassword) {
      userData.password = newPassword;
    }

    // Sauvegarder les modifications
    saveUserData();

    // Afficher un message de succès
    alert('Vos paramètres ont été enregistrés avec succès');
  });

  // Gérer les toggles de préférences
  document.getElementById('sound-toggle').addEventListener('change', function() {
    userData.settings = userData.settings || {};
    userData.settings.sound = this.checked;
    saveUserData();
  });

  document.getElementById('music-toggle').addEventListener('change', function() {
    userData.settings = userData.settings || {};
    userData.settings.music = this.checked;
    saveUserData();
  });

  document.getElementById('notifications-toggle').addEventListener('change', function() {
    userData.settings = userData.settings || {};
    userData.settings.notifications = this.checked;
    saveUserData();
  });

  // Initialiser les toggles avec les valeurs sauvegardées
  if (userData.settings) {
    document.getElementById('sound-toggle').checked = userData.settings.sound !== false;
    document.getElementById('music-toggle').checked = userData.settings.music !== false;
    document.getElementById('notifications-toggle').checked = userData.settings.notifications !== false;
  }
}

// Initialiser les actions du compte
function initAccountActions() {
  // Gérer la déconnexion
  document.getElementById('logout-btn').addEventListener('click', function() {
    logoutUser();
  });

  // Gérer la suppression du compte
  document.getElementById('delete-account-btn').addEventListener('click', function() {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      // Supprimer l'utilisateur du stockage local
      const users = getUsers();
      const userId = Object.keys(users).find(id => users[id].username === userData.username);

      if (userId) {
        delete users[userId];
        saveUsers(users);
      }

      // Déconnecter l'utilisateur
      logoutUser();
    }
  });
}

// Sauvegarder les données de l'utilisateur
async function saveUserData() {
  if (!userData || !userData.username) {
    console.error("Impossible de sauvegarder : utilisateur non défini");
    return;
  }
  try {
    // Mettre à jour dans Firestore
    await updateUserInFirestore(userData.username, userData);
    // Mettre à jour la session locale
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log("Données utilisateur sauvegardées avec succès dans Firestore pour:", userData.username);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données utilisateur dans Firestore:", error);
  }
}

// Calculer l'XP requis pour le niveau suivant
function calculateRequiredXp(level) {
  return level * 100;
}

// Calculer le rang en fonction du niveau
function calculateRank(level) {
  if (level < 5) return 'Novice';
  if (level < 10) return 'Apprenti';
  if (level < 15) return 'Adepte';
  if (level < 20) return 'Expert';
  if (level < 25) return 'Maître';
  if (level < 30) return 'Grand Maître';
  return 'Légende';
}

// Formater le temps de jeu
function formatTime(minutes) {
  if (minutes < 60) {
    return minutes + ' min';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return hours + 'h';
  }

  return hours + 'h ' + remainingMinutes + 'min';
}

// Mettre à jour la date de dernière connexion
function updateLastLoginDate() {
  if (!userData) return;

  // Mettre à jour la date de dernière connexion
  userData.lastLogin = new Date().toISOString();

  // Sauvegarder l'utilisateur
  saveUserData();

  console.log("Date de dernière connexion mise à jour dans le profil:", userData.lastLogin);
}

// Formater une date
function formatDate(dateString) {
  // Utiliser la date actuelle réelle comme référence
  const currentDate = new Date();
  const date = new Date(dateString);

  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    return "Date inconnue";
  }

  // Vérifier si l'utilisateur est actuellement connecté
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.lastLogin) {
    const userLastLogin = new Date(currentUser.lastLogin);
    const dateToCheck = new Date(dateString);

    // Si les dates sont proches (moins de 5 minutes d'écart), considérer comme "Maintenant"
    const diffMs = Math.abs(userLastLogin - dateToCheck);
    if (diffMs < 5 * 60 * 1000) { // 5 minutes en millisecondes
      return 'Maintenant';
    }
  }

  const diffMs = currentDate - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'À l\'instant';
  }

  if (diffMin < 60) {
    return `Il y a ${diffMin} min`;
  }

  if (diffHour < 24) {
    return `Il y a ${diffHour} h`;
  }

  if (diffDay === 0) {
    return 'Aujourd\'hui';
  }

  if (diffDay === 1) {
    return 'Hier';
  }

  if (diffDay < 7) {
    return `Il y a ${diffDay} jours`;
  }

  // Format de date français (JJ/MM/AAAA)
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Initialisation
async function init() {
  await authService.init();
  
  if (!authService.currentUser) {
    window.location.href = 'login.html';
    return;
  }

  loadProfile();
  setupEventListeners();
}

// Chargement du profil
async function loadProfile() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const userData = await authService.loadUserData();
    if (!userData) {
      console.error('Impossible de charger les données utilisateur');
      return;
    }

    // Mettre à jour les informations du profil
    document.getElementById('username').textContent = userData.username || 'Aventurier';
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('userLevel').textContent = `Niveau ${userData.level || 1}`;
    document.getElementById('userXP').textContent = `${userData.xp || 0} XP`;
    document.getElementById('userCoins').textContent = `${userData.coins || 0} pièces`;

    // Mettre à jour l'avatar
    const avatarUrl = userData.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    document.getElementById('userAvatar').src = avatarUrl;

    // Charger l'inventaire
    await loadInventory();

    // Charger les succès
    loadAchievements();

  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
  }
}

// Chargement de l'inventaire
async function loadInventory() {
  const userData = await authService.loadUserData();
  const inventory = userData?.inventory || [];
  const availableSkins = skinService.getAvailableSkins();

  // Vider la grille
  inventoryGrid.innerHTML = '';

  // Créer les sections pour chaque type de skin
  Object.entries(availableSkins).forEach(([type, skins]) => {
    const section = document.createElement('div');
    section.className = 'inventory-section';
    section.innerHTML = `
      <h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
      <div class="skin-grid"></div>
    `;

    const skinGrid = section.querySelector('.skin-grid');
    skins.forEach(skin => {
      const owned = inventory.some(s => s.id === skin.id && s.type === type);
      const equipped = userData.avatar?.[type] === skin.id;

      const skinElement = document.createElement('div');
      skinElement.className = `skin-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;
      skinElement.innerHTML = `
        <img src="${skin.image}" alt="${skin.name}">
        <h4>${skin.name}</h4>
        <p>${skin.price} pièces</p>
        ${owned ? 
          `<button class="btn-equip" data-skin-id="${skin.id}" data-skin-type="${type}">
            ${equipped ? 'Équipé' : 'Équiper'}
          </button>` :
          `<button class="btn-buy" data-skin-id="${skin.id}" data-skin-type="${type}">
            Acheter
          </button>`
        }
      `;

      skinGrid.appendChild(skinElement);
    });

    inventoryGrid.appendChild(section);
  });

  // Ajouter les écouteurs d'événements pour les boutons
  document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', async () => {
      const skinId = button.dataset.skinId;
      const skinType = button.dataset.skinType;
      
      const result = await skinService.buySkin(skinId, skinType);
      if (result.success) {
        alert('Achat réussi !');
        await loadInventory();
        await loadProfile();
      } else {
        alert(result.error);
      }
    });
  });

  document.querySelectorAll('.btn-equip').forEach(button => {
    button.addEventListener('click', async () => {
      const skinId = button.dataset.skinId;
      const skinType = button.dataset.skinType;
      
      const result = await skinService.equipSkin(skinId, skinType);
      if (result.success) {
        await loadInventory();
        await loadProfile();
      } else {
        alert(result.error);
      }
    });
  });
}

// Mettre à jour les succès
function updateAchievements(achievements) {
  const achievementList = document.getElementById('achievementList');
  if (!achievementList) return;

  achievementList.innerHTML = '';
  
  achievements.forEach(achievement => {
    const achievementElement = document.createElement('div');
    achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    achievementElement.innerHTML = `
      <i class="${achievement.icon}"></i>
      <div class="achievement-info">
        <h4>${achievement.title}</h4>
        <p>${achievement.description}</p>
      </div>
      <div class="achievement-status">
        ${achievement.unlocked ? '<i class="fas fa-check"></i>' : '<i class="fas fa-lock"></i>'}
      </div>
    `;
    achievementList.appendChild(achievementElement);
  });
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
  // Gestion des onglets
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      
      // Mise à jour des classes actives
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Upload d'avatar
  avatarUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await authService.uploadAvatar(file);
      if (result.success) {
        userAvatar.src = result.avatarUrl;
      } else {
        console.error('Erreur lors de l\'upload de l\'avatar:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
    }
  });

  // Paramètres
  settingsForm.addEventListener('change', async (e) => {
    const setting = e.target.id.replace('Toggle', '');
    const value = e.target.checked;

    try {
      await authService.updateProfile({
        settings: {
          [setting]: value
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      // Revenir à l'état précédent
      e.target.checked = !value;
    }
  });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', init);
