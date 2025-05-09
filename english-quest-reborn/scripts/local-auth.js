/**
 * English Quest - Système d'authentification local
 * Gère la connexion et l'inscription des utilisateurs en utilisant localStorage
 */

// Clé pour le stockage des utilisateurs dans localStorage
const USERS_STORAGE_KEY = 'english_quest_users';
const CURRENT_USER_KEY = 'english_quest_current_user';

// Structure de données pour les utilisateurs
class User {
  constructor(username, password) {
    this.id = generateUniqueId();
    this.username = username;
    this.displayName = username;
    this.password = password; // Dans une application réelle, il faudrait hasher le mot de passe
    this.createdAt = new Date('2025-05-01T10:30:00').toISOString(); // Date actuelle (1er mai 2025)
    this.lastLogin = new Date('2025-05-01T10:30:00').toISOString(); // Date actuelle (1er mai 2025)
    this.level = 1;
    this.xp = 0;
    this.coins = 0; // Les joueurs commencent avec 0 pièce
    this.completedGames = [];
    this.completedCourses = [];
  }
}

// Générer un ID unique
function generateUniqueId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Récupérer tous les utilisateurs
function getUsers() {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : {};
}

// Sauvegarder tous les utilisateurs
function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Récupérer un utilisateur par nom d'utilisateur
function getUserByUsername(username) {
  const users = getUsers();

  // Rechercher l'utilisateur par nom d'utilisateur (insensible à la casse)
  const userId = Object.keys(users).find(id =>
    users[id].username.toLowerCase() === username.toLowerCase()
  );

  return userId ? users[userId] : null;
}

// Créer un nouvel utilisateur
function createUser(username, password) {
  // Vérifier si l'utilisateur existe déjà
  if (getUserByUsername(username)) {
    throw new Error("Ce nom d'utilisateur est déjà utilisé");
  }

  // Créer un nouvel utilisateur
  const user = new User(username, password);

  // Initialiser les données du profil
  user.stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    coursesCompleted: 0,
    timeSpent: 0
  };

  // Initialiser l'avatar
  user.avatar = {
    head: 'default_boy', // Utiliser la tête de garçon par défaut
    body: 'default_boy', // Utiliser le corps de garçon par défaut
    accessory: 'none',
    background: 'default'
  };

  // Initialiser les skins débloqués
  user.skins = {
    head: ['default_boy', 'default_girl'], // Les deux options de tête sont débloquées
    body: ['default_boy', 'default_girl'], // Les deux options de corps sont débloquées
    accessory: ['none'],
    background: ['default']
  };

  // Initialiser la propriété hasSelectedGender à false pour forcer l'affichage du modal de sélection
  user.hasSelectedGender = false;

  // Initialiser les succès
  user.achievements = [
    {
      id: 'first_login',
      title: 'Premier pas',
      description: 'Se connecter pour la première fois',
      unlocked: true,
      unlockedAt: new Date('2025-05-01T10:30:00').toISOString() // Date actuelle (1er mai 2025)
    }
  ];

  // Initialiser les activités récentes
  user.activities = [
    {
      id: 1,
      type: 'achievement',
      title: 'Premier pas',
      description: 'Vous avez débloqué un nouveau succès',
      time: new Date('2025-05-01T10:30:00').toISOString(), // Date actuelle (1er mai 2025)
      icon: 'fas fa-trophy'
    }
  ];

  // Ajouter l'utilisateur à la liste
  const users = getUsers();
  users[user.id] = user;
  saveUsers(users);

  return user;
}

// Connecter un utilisateur
function loginUser(username, password) {
  // Récupérer l'utilisateur
  const user = getUserByUsername(username);

  // Vérifier si l'utilisateur existe
  if (!user) {
    throw new Error("Nom d'utilisateur ou mot de passe incorrect");
  }

  // Vérifier le mot de passe
  if (user.password !== password) {
    throw new Error("Nom d'utilisateur ou mot de passe incorrect");
  }

  // Mettre à jour la date de dernière connexion avec la date actuelle
  user.lastLogin = new Date().toISOString();
  console.log("Date de dernière connexion mise à jour:", user.lastLogin);

  // Vérifier si c'est le compte Ollie et lui donner des privilèges d'administrateur
  if (username === 'Ollie') {
    // S'assurer que l'utilisateur a tous les skins débloqués
    if (!user.skins) {
      user.skins = {};
    }

    // S'assurer que tous les skins sont débloqués pour Ollie
    if (!user.skins.head || !user.skins.body) {
      user.skins = {
        head: ['default_boy', 'default_girl', 'bear'],
        body: ['default_boy', 'default_girl', 'bear'],
        accessory: ['none'],
        background: ['default']
      };
    } else {
      // S'assurer que les skins d'ours sont débloqués
      if (!user.skins.head.includes('bear')) {
        user.skins.head.push('bear');
      }

      if (!user.skins.body.includes('bear')) {
        user.skins.body.push('bear');
      }
    }

    // Marquer que tous les skins sont débloqués
    user.hasAllSkins = true;
    user.skinsUnlocked = true;

    // Ajouter le rôle d'administrateur si ce n'est pas déjà fait
    user.isAdmin = true;

    // Initialiser les valeurs par défaut seulement si elles n'existent pas encore
    if (user.coins === undefined) {
      user.coins = 10000;
    }

    if (user.level === undefined) {
      user.level = 30;
    }

    if (user.xp === undefined) {
      user.xp = 3000;
    }
  }

  // Sauvegarder les modifications
  const users = getUsers();
  users[user.id] = user;
  saveUsers(users);

  // Sauvegarder l'utilisateur courant
  setCurrentUser(user);

  return user;
}

// Déconnecter l'utilisateur
function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);

  // Mettre à jour l'interface utilisateur
  updateUI();

  // Rediriger vers la page d'accueil
  // Déterminer la page d'accueil en fonction de l'URL actuelle
  const currentPath = window.location.pathname;

  // Si nous sommes dans un sous-dossier (comme /games/), remonter d'un niveau
  if (currentPath.includes('/games/') || currentPath.includes('/courses/')) {
    window.location.href = '../index.html';
  } else {
    window.location.href = 'index.html';
  }
}

// Récupérer l'utilisateur courant
function getCurrentUser() {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

// Définir l'utilisateur courant
function setCurrentUser(user) {
  if (!user) return;

  // S'assurer que l'utilisateur a toutes les propriétés nécessaires
  user.coins = user.coins || 0;
  user.xp = user.xp || 0;
  user.level = user.level || 1;

  // Mettre à jour la date de dernière connexion à chaque fois que l'utilisateur est défini comme courant
  user.lastLogin = new Date().toISOString();
  console.log("Date de dernière connexion mise à jour dans setCurrentUser:", user.lastLogin);

  // S'assurer que l'utilisateur a la propriété hasSelectedGender
  if (user.hasSelectedGender === undefined) {
    user.hasSelectedGender = false;

    // Vérifier si l'utilisateur a déjà un avatar cohérent
    if (user.avatar) {
      const head = user.avatar.head;
      const body = user.avatar.body;

      // Si l'utilisateur a déjà un avatar cohérent (tête et corps du même genre)
      if ((head === 'default_girl' && body === 'default_girl') ||
          (head === 'default_boy' && body === 'default_boy')) {
        user.hasSelectedGender = true;
      }
    }
  }

  // S'assurer que l'utilisateur a un avatar
  if (!user.avatar) {
    user.avatar = {
      head: 'default_boy',
      body: 'default_boy',
      accessory: 'none',
      background: 'default'
    };
  }

  // S'assurer que l'utilisateur a des skins
  if (!user.skins) {
    user.skins = {
      head: ['default_boy', 'default_girl'],
      body: ['default_boy', 'default_girl'],
      accessory: ['none'],
      background: ['default']
    };
  }

  // S'assurer que l'utilisateur a des statistiques
  if (!user.stats) {
    user.stats = {
      gamesPlayed: 0,
      gamesWon: 0,
      coursesCompleted: 0,
      timeSpent: 0
    };
  }

  // Mettre à jour l'utilisateur dans la liste des utilisateurs
  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === user.username);

  if (userId) {
    users[userId] = user;
    saveUsers(users);
  }

  // Sauvegarder l'utilisateur courant dans le localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  console.log("Utilisateur courant défini:", user.username);

  // Mettre à jour également le profil local pour la compatibilité
  const profile = {
    coins: user.coins,
    xp: user.xp,
    level: user.level,
    username: user.username
  };

  localStorage.setItem('userProfile', JSON.stringify(profile));
}

// Mettre à jour l'interface utilisateur
function updateUI() {
  const currentUser = getCurrentUser();

  // Déterminer le préfixe de chemin en fonction de l'URL actuelle
  const currentPath = window.location.pathname;
  const isInSubfolder = currentPath.includes('/games/') || currentPath.includes('/courses/');
  const pathPrefix = isInSubfolder ? '../' : '';

  // Mettre à jour les boutons de connexion/inscription
  const loginButtons = document.querySelectorAll('.btn-login');
  const registerButtons = document.querySelectorAll('.btn-register');
  const userMenus = document.querySelectorAll('.user-menu');

  if (currentUser) {
    // Utilisateur connecté
    loginButtons.forEach(button => {
      button.textContent = 'Profil';
      button.href = pathPrefix + 'profile.html';
    });

    registerButtons.forEach(button => {
      button.textContent = 'Déconnexion';
      button.href = '#';
      // Supprimer les anciens écouteurs d'événements pour éviter les doublons
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
      });
    });

    // Mettre à jour le menu utilisateur si présent
    userMenus.forEach(menu => {
      // Vérifier si le menu contient déjà un élément avec la classe 'user-avatar'
      if (!menu.querySelector('.user-avatar') && currentUser.displayName) {
        // Créer un avatar utilisateur
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.textContent = currentUser.displayName.charAt(0).toUpperCase();

        // Ajouter l'avatar au menu
        menu.prepend(avatar);
      }
    });

    // Mettre à jour les informations de l'utilisateur dans l'interface
    const usernameElements = document.querySelectorAll('.user-username');
    usernameElements.forEach(element => {
      element.textContent = currentUser.username;
    });

    const coinElements = document.querySelectorAll('.user-coins');
    coinElements.forEach(element => {
      element.textContent = currentUser.coins || 0;
    });

    const xpElements = document.querySelectorAll('.user-xp');
    xpElements.forEach(element => {
      element.textContent = currentUser.xp || 0;
    });

    const levelElements = document.querySelectorAll('.user-level');
    levelElements.forEach(element => {
      element.textContent = currentUser.level || 1;
    });

  } else {
    // Utilisateur déconnecté
    loginButtons.forEach(button => {
      button.textContent = 'Connexion';
      button.href = pathPrefix + 'auth.html?tab=login';
    });

    registerButtons.forEach(button => {
      button.textContent = 'Inscription';
      button.href = pathPrefix + 'auth.html?tab=register';
    });

    // Supprimer les avatars utilisateur
    document.querySelectorAll('.user-avatar').forEach(avatar => {
      avatar.remove();
    });
  }

  // Mettre à jour tous les liens de navigation pour qu'ils pointent vers les bonnes pages
  if (isInSubfolder) {
    // Si nous sommes dans un sous-dossier, mettre à jour les liens pour remonter d'un niveau
    document.querySelectorAll('a[href="index.html"]').forEach(link => {
      link.href = '../index.html';
    });

    document.querySelectorAll('a[href="profile.html"]').forEach(link => {
      link.href = '../profile.html';
    });

    document.querySelectorAll('a[href="gallery.html"]').forEach(link => {
      link.href = '../gallery.html';
    });

    document.querySelectorAll('a[href="auth.html"]').forEach(link => {
      link.href = '../auth.html';
    });
  }
}

// Initialiser l'interface utilisateur au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  updateUI();
});

// Rendre les fonctions disponibles globalement
window.createUser = createUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.updateUI = updateUI;
