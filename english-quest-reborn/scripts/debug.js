/**
 * English Quest - Système de débogage avancé (Admin uniquement)
 * Fonctions utiles pour le débogage et l'administration
 */

// Vérifier si l'utilisateur actuel est admin
function isCurrentUserAdmin() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Vérifier si c'est Ollie (super admin)
    if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
      return true;
    }
    
    // Vérifier la propriété isAdmin
    return currentUser.isAdmin === true;
  } catch (error) {
    console.error('Erreur lors de la vérification admin:', error);
    return false;
  }
}

// === FONCTIONS DE GESTION DES UTILISATEURS ===

// Réinitialiser le choix de genre
function resetGenderChoice() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("Réinitialisation du choix de genre pour", currentUser.username);
  currentUser.hasSelectedGender = false;

  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

  if (userId) {
    users[userId] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log("Choix de genre réinitialisé avec succès");
    window.location.reload();
  } else {
    console.error("Impossible de trouver l'utilisateur");
  }
}

// Afficher les informations de débogage détaillées
function showDebugInfo() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  const debugInfo = {
    'Utilisateur': currentUser.username,
    'ID': currentUser.id,
    'Email': currentUser.email || 'Non défini',
    'Niveau': currentUser.level || 0,
    'XP': currentUser.xp || 0,
    'Pièces': currentUser.coins || 0,
    'Admin': currentUser.isAdmin ? 'Oui' : 'Non',
    'Genre sélectionné': currentUser.hasSelectedGender ? 'Oui' : 'Non',
    'Avatar tête': currentUser.avatar?.head || 'Non défini',
    'Avatar corps': currentUser.avatar?.body || 'Non défini',
    'Skins débloqués': currentUser.skinsUnlocked ? 'Oui' : 'Non',
    'Jeux complétés': currentUser.completedGames?.length || 0,
    'Cours complétés': currentUser.completedCourses?.length || 0,
    'Dernière connexion': currentUser.lastLogin || 'Jamais'
  };

  console.log("=== INFORMATIONS DE DÉBOGAGE ===");
  Object.entries(debugInfo).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  // Afficher dans une alerte formatée
  const alertText = Object.entries(debugInfo)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  alert(`=== INFORMATIONS DE DÉBOGAGE ===\n\n${alertText}`);
}

// === FONCTIONS DE GESTION DES RÉCOMPENSES ===

// Ajouter de l'XP
function addXP(amount = 1000) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  const oldXP = currentUser.xp || 0;
  currentUser.xp = oldXP + amount;
  
  // Recalculer le niveau
  currentUser.level = Math.floor(currentUser.xp / 100) + 1;

  saveCurrentUser(currentUser);
  console.log(`+${amount} XP ajoutés. Total: ${currentUser.xp} XP (Niveau ${currentUser.level})`);
  alert(`+${amount} XP ajoutés !\nTotal: ${currentUser.xp} XP (Niveau ${currentUser.level})`);
  
  // Mettre à jour l'affichage si possible
  updateUserDisplay();
}

// Ajouter des pièces
function addCoins(amount = 10000) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  const oldCoins = currentUser.coins || 0;
  currentUser.coins = oldCoins + amount;

  saveCurrentUser(currentUser);
  console.log(`+${amount} pièces ajoutées. Total: ${currentUser.coins} pièces`);
  alert(`+${amount} pièces ajoutées !\nTotal: ${currentUser.coins.toLocaleString()} pièces`);
  
  // Mettre à jour l'affichage si possible
  updateUserDisplay();
}

// Réinitialiser les récompenses d'un cours
function resetCourseRewards(courseName = 'conditional-course') {
  const key = `${courseName}-game-state`;
  const savedState = localStorage.getItem(key);
  
  if (savedState) {
    try {
      const gameState = JSON.parse(savedState);
      if (gameState.rewardsGiven) {
        gameState.rewardsGiven = {
          sections: [],
          finalQuiz: false
        };
        localStorage.setItem(key, JSON.stringify(gameState));
        console.log(`Récompenses du cours ${courseName} réinitialisées`);
        alert(`Récompenses du cours ${courseName} réinitialisées avec succès !`);
      } else {
        alert(`Aucune donnée de récompenses trouvée pour ${courseName}`);
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      alert('Erreur lors de la réinitialisation des récompenses');
    }
  } else {
    alert(`Aucune sauvegarde trouvée pour ${courseName}`);
  }
}

// === FONCTIONS DE GESTION DES SKINS ===

// Débloquer tous les skins
function unlockAllSkins() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  // Initialiser les skins si nécessaire
  if (!currentUser.skins) {
    currentUser.skins = {
      head: [],
      body: [],
      accessory: [],
      background: []
    };
  }

  // Liste complète des skins disponibles
  const allSkins = {
    head: ['default_boy', 'default_girl', 'bear', 'cat', 'robot', 'wizard', 'ninja'],
    body: ['default_boy', 'default_girl', 'bear', 'cat', 'robot', 'wizard', 'ninja'],
    accessory: ['none', 'glasses', 'hat', 'crown', 'mask'],
    background: ['default', 'forest', 'space', 'underwater', 'castle']
  };

  // Débloquer tous les skins
  Object.keys(allSkins).forEach(category => {
    currentUser.skins[category] = [...allSkins[category]];
  });

  currentUser.skinsUnlocked = true;
  saveCurrentUser(currentUser);
  
  console.log("Tous les skins ont été débloqués");
  alert("Tous les skins ont été débloqués avec succès !");
  window.location.reload();
}

// Réinitialiser les skins
function resetSkins() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  currentUser.skins = {
    head: ['default_boy', 'default_girl'],
    body: ['default_boy', 'default_girl'],
    accessory: ['none'],
    background: ['default']
  };
  currentUser.skinsUnlocked = false;

  saveCurrentUser(currentUser);
  console.log("Skins réinitialisés");
  alert("Skins réinitialisés avec succès !");
  window.location.reload();
}

// === FONCTIONS DE GESTION DES DONNÉES ===

// Créer des utilisateurs de test
function createTestUsers() {
  if (!confirm("Voulez-vous créer 15 utilisateurs de test pour la galerie ?")) {
    return;
  }

  try {
    const users = getUsers();
    const firstNames = ["Emma", "Lucas", "Léa", "Hugo", "Chloé", "Louis", "Inès", "Jules", "Sarah", "Noah", "Jade", "Théo", "Manon", "Raphaël", "Camille"];
    const lastNames = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau"];
    
    let createdCount = 0;

    for (let i = 1; i <= 15; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName}${Math.floor(Math.random() * 100)}`;

      if (getUserByUsername(username)) continue;

      const isBoy = Math.random() > 0.5;
      const level = Math.floor(Math.random() * 20) + 1;
      const xp = level * 100 + Math.floor(Math.random() * 100);
      const coins = Math.floor(Math.random() * 10000);

      const user = new User(username, "password123");
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = `${username.toLowerCase()}@example.com`;
      user.level = level;
      user.xp = xp;
      user.coins = coins;
      user.avatar = {
        head: isBoy ? "default_boy" : "default_girl",
        body: isBoy ? "default_boy" : "default_girl",
        accessory: "none",
        background: "default"
      };
      user.hasSelectedGender = true;

      users[user.id] = user;
      createdCount++;
    }

    saveUsers(users);
    console.log(`${createdCount} utilisateurs de test créés`);
    alert(`${createdCount} utilisateurs de test créés avec succès !`);
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de la création des utilisateurs de test:", error);
    alert("Erreur lors de la création des utilisateurs de test: " + error.message);
  }
}

// Nettoyer les données corrompues
function cleanCorruptedData() {
  if (!confirm("Voulez-vous nettoyer les données corrompues ? Cette action peut supprimer des données invalides.")) {
    return;
  }

  try {
    const users = getUsers();
    let cleanedCount = 0;

    Object.keys(users).forEach(userId => {
      const user = users[userId];
      let needsCleaning = false;

      // Vérifier et corriger les propriétés manquantes
      if (!user.id) {
        user.id = userId;
        needsCleaning = true;
      }
      if (typeof user.level !== 'number') {
        user.level = 1;
        needsCleaning = true;
      }
      if (typeof user.xp !== 'number') {
        user.xp = 0;
        needsCleaning = true;
      }
      if (typeof user.coins !== 'number') {
        user.coins = 0;
        needsCleaning = true;
      }
      if (!user.avatar) {
        user.avatar = {
          head: 'default_boy',
          body: 'default_boy',
          accessory: 'none',
          background: 'default'
        };
        needsCleaning = true;
      }

      if (needsCleaning) {
        users[userId] = user;
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      saveUsers(users);
      console.log(`${cleanedCount} utilisateurs nettoyés`);
      alert(`${cleanedCount} utilisateurs ont été nettoyés avec succès !`);
    } else {
      alert("Aucune donnée corrompue trouvée !");
    }
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    alert("Erreur lors du nettoyage des données: " + error.message);
  }
}

// Exporter les données
function exportData() {
  try {
    const data = {
      users: getUsers(),
      currentUser: getCurrentUser(),
      timestamp: new Date().toISOString(),
      version: '2.0'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `english-quest-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log("Données exportées avec succès");
    alert("Données exportées avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    alert("Erreur lors de l'export des données: " + error.message);
  }
}

// Réinitialiser complètement le localStorage
function resetLocalStorage() {
  if (confirm("⚠️ ATTENTION ! Cette action va supprimer TOUTES vos données (utilisateurs, progression, etc.). Êtes-vous absolument sûr de vouloir continuer ?")) {
    if (confirm("Dernière chance ! Voulez-vous vraiment tout supprimer ? Cette action est IRRÉVERSIBLE !")) {
      console.log("Réinitialisation complète du localStorage");
      localStorage.clear();
      alert("localStorage réinitialisé avec succès. La page va être rechargée.");
      window.location.reload();
    }
  }
}

// === FONCTIONS UTILITAIRES ===

// Sauvegarder l'utilisateur actuel
function saveCurrentUser(user) {
  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === user.username);
  
  if (userId) {
    users[userId] = user;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

// Mettre à jour l'affichage utilisateur
function updateUserDisplay() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  // Mettre à jour les éléments d'affichage si ils existent
  const elements = {
    'user-coins': currentUser.coins?.toLocaleString(),
    'user-xp': currentUser.xp,
    'user-level': currentUser.level
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element && value !== undefined) {
      element.textContent = value;
    }
  });
}

// === INTERFACE DE DÉBOGAGE ===

// Créer l'interface de débogage
function createDebugInterface() {
  // Vérifier si l'utilisateur est admin
  if (!isCurrentUserAdmin()) {
    console.log("🔒 Interface de débogage réservée aux administrateurs");
    return;
  }

  console.log("🛠️ Chargement de l'interface de débogage admin");

  // Créer le bouton de débogage
  const debugButton = document.createElement('div');
  debugButton.id = 'debug-button';
  debugButton.innerHTML = '🛠️ Admin';
  debugButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    padding: 12px 16px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.2);
    font-family: 'Exo 2', sans-serif;
  `;

  // Effet hover
  debugButton.addEventListener('mouseenter', () => {
    debugButton.style.transform = 'translateY(-2px)';
    debugButton.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
  });

  debugButton.addEventListener('mouseleave', () => {
    debugButton.style.transform = 'translateY(0)';
    debugButton.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
  });

  // Créer le menu de débogage
  const debugMenu = document.createElement('div');
  debugMenu.id = 'debug-menu';
  debugMenu.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 20px;
    border-radius: 15px;
    display: none;
    flex-direction: column;
    gap: 8px;
    min-width: 280px;
    max-height: 70vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: 'Exo 2', sans-serif;
  `;

  // Titre du menu
  const menuTitle = document.createElement('div');
  menuTitle.innerHTML = '🛠️ <strong>Interface Admin</strong>';
  menuTitle.style.cssText = `
    font-size: 16px;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
  `;
  debugMenu.appendChild(menuTitle);

  // Sections du menu
  const sections = [
    {
      title: '👤 Gestion Utilisateur',
      color: '#3498db',
      items: [
        { text: 'Infos de débogage', func: 'showDebugInfo()' },
        { text: 'Réinitialiser genre', func: 'resetGenderChoice()' }
      ]
    },
    {
      title: '💰 Récompenses',
      color: '#f39c12',
      items: [
        { text: '+1000 XP', func: 'addXP(1000)' },
        { text: '+10K pièces', func: 'addCoins(10000)' },
        { text: 'Reset récompenses cours', func: 'resetCourseRewards()' }
      ]
    },
    {
      title: '🎨 Skins & Avatar',
      color: '#9b59b6',
      items: [
        { text: 'Débloquer tous les skins', func: 'unlockAllSkins()' },
        { text: 'Réinitialiser skins', func: 'resetSkins()' }
      ]
    },
    {
      title: '🗄️ Gestion Données',
      color: '#2ecc71',
      items: [
        { text: 'Créer utilisateurs test', func: 'createTestUsers()' },
        { text: 'Nettoyer données corrompues', func: 'cleanCorruptedData()' },
        { text: 'Exporter données', func: 'exportData()' }
      ]
    },
    {
      title: '⚠️ Actions Dangereuses',
      color: '#e74c3c',
      items: [
        { text: 'RESET COMPLET', func: 'resetLocalStorage()' }
      ]
    }
  ];

  // Créer les sections
  sections.forEach(section => {
    // Titre de section
    const sectionTitle = document.createElement('div');
    sectionTitle.innerHTML = section.title;
    sectionTitle.style.cssText = `
      font-weight: bold;
      color: ${section.color};
      margin: 10px 0 5px 0;
      font-size: 14px;
    `;
    debugMenu.appendChild(sectionTitle);

    // Items de section
    section.items.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.innerHTML = item.text;
      menuItem.style.cssText = `
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 8px;
        transition: all 0.2s ease;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.05);
        margin: 2px 0;
      `;

      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.background = section.color;
        menuItem.style.transform = 'translateX(5px)';
      });

      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.background = 'rgba(255, 255, 255, 0.05)';
        menuItem.style.transform = 'translateX(0)';
      });

      menuItem.addEventListener('click', () => {
        try {
          eval(item.func);
        } catch (error) {
          console.error('Erreur lors de l\'exécution:', error);
          alert('Erreur lors de l\'exécution: ' + error.message);
        }
      });

      debugMenu.appendChild(menuItem);
    });
  });

  // Ajouter les éléments au DOM
  document.body.appendChild(debugButton);
  document.body.appendChild(debugMenu);

  // Gestion de l'affichage du menu
  let menuVisible = false;
  debugButton.addEventListener('click', () => {
    menuVisible = !menuVisible;
    debugMenu.style.display = menuVisible ? 'flex' : 'none';
  });

  // Fermer le menu en cliquant ailleurs
  document.addEventListener('click', (e) => {
    if (!debugButton.contains(e.target) && !debugMenu.contains(e.target)) {
      menuVisible = false;
      debugMenu.style.display = 'none';
    }
  });

  console.log("✅ Interface de débogage admin chargée");
}

// Initialiser l'interface de débogage quand le DOM est prêt
document.addEventListener('DOMContentLoaded', createDebugInterface);

// Si le DOM est déjà chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createDebugInterface);
} else {
  createDebugInterface();
}
