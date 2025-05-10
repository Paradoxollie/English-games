/**
 * Modèle de données utilisateur pour English Quest Reborn
 * Définit la structure standard des données utilisateur
 */

/**
 * Structure standard d'un utilisateur
 * @typedef {Object} User
 * @property {string} userId - ID unique de l'utilisateur (généré par Firebase)
 * @property {string} username - Nom d'utilisateur (unique)
 * @property {string} displayName - Nom d'affichage (peut être identique au nom d'utilisateur)
 * @property {boolean} isAdmin - Indique si l'utilisateur est administrateur
 * @property {number} level - Niveau de l'utilisateur
 * @property {number} xp - Points d'expérience
 * @property {number} coins - Pièces d'or
 * @property {Object} stats - Statistiques de l'utilisateur
 * @property {Object} settings - Paramètres de l'utilisateur
 * @property {Object} inventory - Inventaire de l'utilisateur
 * @property {Array} achievements - Succès débloqués
 * @property {string} createdAt - Date de création du compte
 * @property {string} lastLogin - Date de dernière connexion
 */

/**
 * Crée un nouvel utilisateur avec les valeurs par défaut
 * @param {string} userId - ID unique de l'utilisateur
 * @param {string} username - Nom d'utilisateur
 * @returns {User} Nouvel utilisateur
 */
export function createNewUser(userId, username) {
  return {
    userId,
    username,
    displayName: username,
    isAdmin: username.toLowerCase() === 'ollie', // Seul Ollie est administrateur
    level: 1,
    xp: 0,
    coins: 100,
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      coursesCompleted: 0,
      totalScore: 0,
      totalXp: 0,
      timeSpent: 0
    },
    settings: {
      theme: 'dark',
      notifications: true,
      sound: true,
      music: true,
      language: 'fr'
    },
    inventory: {
      skins: {
        head: ['default_boy', 'default_girl'],
        body: ['default_boy', 'default_girl'],
        accessory: ['none'],
        background: ['default']
      },
      items: []
    },
    achievements: [
      {
        id: 'first_login',
        title: 'Premier pas',
        description: 'Se connecter pour la première fois',
        unlockedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    hasSelectedGender: false
  };
}

/**
 * Calcule l'XP nécessaire pour passer au niveau suivant
 * @param {number} level - Niveau actuel
 * @returns {number} XP nécessaire
 */
export function calculateXpForNextLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Ajoute de l'XP à un utilisateur et gère la montée de niveau
 * @param {User} user - Utilisateur
 * @param {number} xpAmount - Quantité d'XP à ajouter
 * @returns {Object} Résultat avec l'utilisateur mis à jour et les informations de niveau
 */
export function addXpToUser(user, xpAmount) {
  // Copier l'utilisateur pour ne pas modifier l'original
  const updatedUser = { ...user };
  
  // Ajouter l'XP
  updatedUser.xp += xpAmount;
  
  // Mettre à jour les statistiques
  updatedUser.stats = {
    ...updatedUser.stats,
    totalXp: (updatedUser.stats.totalXp || 0) + xpAmount
  };
  
  // Vérifier si l'utilisateur monte de niveau
  let leveledUp = false;
  let oldLevel = updatedUser.level;
  
  while (updatedUser.xp >= calculateXpForNextLevel(updatedUser.level)) {
    updatedUser.xp -= calculateXpForNextLevel(updatedUser.level);
    updatedUser.level += 1;
    leveledUp = true;
  }
  
  return {
    user: updatedUser,
    leveledUp,
    oldLevel,
    newLevel: updatedUser.level
  };
}

/**
 * Ajoute des pièces à un utilisateur
 * @param {User} user - Utilisateur
 * @param {number} coinsAmount - Quantité de pièces à ajouter
 * @returns {User} Utilisateur mis à jour
 */
export function addCoinsToUser(user, coinsAmount) {
  // Copier l'utilisateur pour ne pas modifier l'original
  const updatedUser = { ...user };
  
  // Ajouter les pièces
  updatedUser.coins += coinsAmount;
  
  return updatedUser;
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param {User} user - Utilisateur à vérifier
 * @returns {boolean} Vrai si l'utilisateur est administrateur
 */
export function isUserAdmin(user) {
  // Seul Ollie peut être administrateur
  return user && user.username && user.username.toLowerCase() === 'ollie' && user.isAdmin === true;
}

export default {
  createNewUser,
  calculateXpForNextLevel,
  addXpToUser,
  addCoinsToUser,
  isUserAdmin
};
