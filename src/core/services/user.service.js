/**
 * Service de gestion des utilisateurs pour English Quest Reborn
 * Centralise toutes les opérations liées aux utilisateurs
 */

import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { createNewUser, addXpToUser, addCoinsToUser, isUserAdmin } from '../models/user.model.js';

// Nom de la collection principale des utilisateurs
const USERS_COLLECTION = 'users';

// Clé de stockage local pour les utilisateurs
const USERS_STORAGE_KEY = 'english_quest_users';
const CURRENT_USER_STORAGE_KEY = 'english_quest_current_user';

// État global des utilisateurs
let currentUser = null;
let allUsers = {};
let isInitialized = false;

// Liste des écouteurs pour les changements d'utilisateur
const userChangeListeners = [];

/**
 * Initialise le service utilisateur
 * @returns {Promise<void>}
 */
export async function initializeUserService() {
  if (isInitialized) return;

  console.log('Initialisation du service utilisateur...');

  // Charger les utilisateurs depuis le stockage local
  loadUsersFromLocalStorage();

  // Écouter les changements d'état d'authentification
  const auth = getAuth();
  onAuthStateChanged(auth, handleAuthStateChange);

  isInitialized = true;
  console.log('Service utilisateur initialisé');
}

/**
 * Gère les changements d'état d'authentification
 * @param {Object} user - Utilisateur Firebase
 */
async function handleAuthStateChange(user) {
  if (user) {
    console.log(`Utilisateur connecté: ${user.uid}`);

    // Charger le profil utilisateur depuis Firestore
    const userProfile = await getUserFromFirestore(user.uid);

    if (userProfile) {
      // Mettre à jour l'utilisateur courant
      currentUser = userProfile;

      // Mettre à jour le stockage local
      saveCurrentUserToLocalStorage(currentUser);

      // Notifier les écouteurs
      notifyUserChangeListeners();
    } else {
      console.warn(`Profil utilisateur non trouvé pour ${user.uid}`);
    }
  } else {
    console.log('Utilisateur déconnecté');
    currentUser = null;
    saveCurrentUserToLocalStorage(null);
    notifyUserChangeListeners();
  }
}

/**
 * Récupère un utilisateur depuis Firestore
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Profil utilisateur ou null
 */
export async function getUserFromFirestore(userId) {
  try {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        ...userData,
        userId: userDoc.id
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Récupère tous les utilisateurs depuis Firestore
 * @returns {Promise<Object>} Objet contenant tous les utilisateurs
 */
export async function getAllUsersFromFirestore() {
  try {
    const db = getFirestore();
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));

    const users = {};
    usersSnapshot.forEach(doc => {
      users[doc.id] = {
        ...doc.data(),
        userId: doc.id
      };
    });

    return users;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return {};
  }
}

/**
 * Crée un nouvel utilisateur dans Firestore
 * @param {string} userId - ID de l'utilisateur
 * @param {string} username - Nom d'utilisateur
 * @returns {Promise<Object|null>} Utilisateur créé ou null
 */
export async function createUserInFirestore(userId, username) {
  try {
    // Vérifier si le nom d'utilisateur est disponible
    const isAvailable = await isUsernameAvailable(username);
    if (!isAvailable) {
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }

    // Créer un nouvel utilisateur
    const newUser = createNewUser(userId, username);

    // Enregistrer dans Firestore
    const db = getFirestore();
    await setDoc(doc(db, USERS_COLLECTION, userId), newUser);

    // Mettre à jour les utilisateurs locaux
    allUsers[userId] = newUser;
    saveUsersToLocalStorage();

    return newUser;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Met à jour un utilisateur dans Firestore
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} userData - Données à mettre à jour
 * @returns {Promise<boolean>} Succès de la mise à jour
 */
export async function updateUserInFirestore(userId, userData) {
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await getUserFromFirestore(userId);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // SÉCURITÉ: Empêcher la modification des droits d'administrateur
    // Seul Ollie peut être administrateur
    if (userData.hasOwnProperty('isAdmin')) {
      const isOllie = existingUser.username && existingUser.username.toLowerCase() === 'ollie';
      userData.isAdmin = isOllie;
    }

    // Mettre à jour dans Firestore
    const db = getFirestore();
    await updateDoc(doc(db, USERS_COLLECTION, userId), userData);

    // Mettre à jour les utilisateurs locaux
    allUsers[userId] = {
      ...existingUser,
      ...userData
    };
    saveUsersToLocalStorage();

    // Si c'est l'utilisateur courant, mettre à jour
    if (currentUser && currentUser.userId === userId) {
      currentUser = allUsers[userId];
      saveCurrentUserToLocalStorage(currentUser);
      notifyUserChangeListeners();
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return false;
  }
}

/**
 * Vérifie si un nom d'utilisateur est disponible
 * @param {string} username - Nom d'utilisateur à vérifier
 * @returns {Promise<boolean>} Disponibilité du nom d'utilisateur
 */
export async function isUsernameAvailable(username) {
  try {
    const db = getFirestore();
    const q = query(
      collection(db, USERS_COLLECTION),
      where('username', '==', username)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Erreur lors de la vérification du nom d\'utilisateur:', error);
    return false;
  }
}

/**
 * Ajoute de l'XP à un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} xpAmount - Quantité d'XP à ajouter
 * @returns {Promise<Object|null>} Résultat avec l'utilisateur mis à jour et les informations de niveau
 */
export async function addXpToUserById(userId, xpAmount) {
  try {
    // Récupérer l'utilisateur
    const user = await getUserFromFirestore(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Ajouter l'XP
    const result = addXpToUser(user, xpAmount);

    // Mettre à jour l'utilisateur
    await updateUserInFirestore(userId, result.user);

    return result;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'XP:', error);
    return null;
  }
}

/**
 * Ajoute des pièces à un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} coinsAmount - Quantité de pièces à ajouter
 * @returns {Promise<Object|null>} Utilisateur mis à jour
 */
export async function addCoinsToUserById(userId, coinsAmount) {
  try {
    // Récupérer l'utilisateur
    const user = await getUserFromFirestore(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Ajouter les pièces
    const updatedUser = addCoinsToUser(user, coinsAmount);

    // Mettre à jour l'utilisateur
    await updateUserInFirestore(userId, updatedUser);

    return updatedUser;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de pièces:', error);
    return null;
  }
}

/**
 * Charge les utilisateurs depuis le stockage local
 */
function loadUsersFromLocalStorage() {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    allUsers = usersJson ? JSON.parse(usersJson) : {};

    const currentUserJson = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs depuis le stockage local:', error);
    allUsers = {};
    currentUser = null;
  }
}

/**
 * Enregistre les utilisateurs dans le stockage local
 */
function saveUsersToLocalStorage() {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des utilisateurs dans le stockage local:', error);
  }
}

/**
 * Enregistre l'utilisateur courant dans le stockage local
 * @param {Object|null} user - Utilisateur courant
 */
function saveCurrentUserToLocalStorage(user) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'utilisateur courant dans le stockage local:', error);
  }
}

/**
 * Ajoute un écouteur pour les changements d'utilisateur
 * @param {Function} listener - Fonction à appeler lors d'un changement
 */
export function addUserChangeListener(listener) {
  if (typeof listener === 'function' && !userChangeListeners.includes(listener)) {
    userChangeListeners.push(listener);
  }
}

/**
 * Supprime un écouteur pour les changements d'utilisateur
 * @param {Function} listener - Fonction à supprimer
 */
export function removeUserChangeListener(listener) {
  const index = userChangeListeners.indexOf(listener);
  if (index !== -1) {
    userChangeListeners.splice(index, 1);
  }
}

/**
 * Notifie tous les écouteurs d'un changement d'utilisateur
 */
function notifyUserChangeListeners() {
  userChangeListeners.forEach(listener => {
    try {
      listener(currentUser);
    } catch (error) {
      console.error('Erreur dans un écouteur de changement d\'utilisateur:', error);
    }
  });
}

/**
 * Récupère l'utilisateur courant
 * @returns {Object|null} Utilisateur courant
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Récupère tous les utilisateurs
 * @returns {Object} Tous les utilisateurs
 */
export function getAllUsers() {
  return { ...allUsers };
}

/**
 * Vérifie si l'utilisateur courant est administrateur
 * @returns {boolean} Vrai si l'utilisateur est administrateur
 */
export function isCurrentUserAdmin() {
  // Vérifier si l'utilisateur est Ollie
  if (currentUser && currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
    return true;
  }

  // Vérifier le flag isAdmin
  return currentUser && currentUser.isAdmin === true;
}

export default {
  initializeUserService,
  getUserFromFirestore,
  getAllUsersFromFirestore,
  createUserInFirestore,
  updateUserInFirestore,
  isUsernameAvailable,
  addXpToUserById,
  addCoinsToUserById,
  getCurrentUser,
  getAllUsers,
  isCurrentUserAdmin,
  addUserChangeListener,
  removeUserChangeListener
};
