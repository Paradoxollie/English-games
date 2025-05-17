/**
 * Service de gestion des utilisateurs pour English Quest Reborn
 * Centralise toutes les opérations liées aux utilisateurs
 */

import { db } from '../../config/firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { createNewUser, addXpToUser, addCoinsToUser, isUserAdmin } from '../models/user.model.js';

// Nom de la collection principale des utilisateurs
const USERS_COLLECTION = 'users';

// Clé de stockage local pour la session courante
const CURRENT_USER_STORAGE_KEY = 'currentUser';

let currentUser = null;
let isInitialized = false;

/**
 * Initialise le service utilisateur (session courante uniquement)
 * @returns {Promise<void>}
 */
export async function initializeUserService() {
  if (isInitialized) return;
  // Charger l'utilisateur courant depuis le stockage local
  loadCurrentUserFromLocalStorage();
  isInitialized = true;
  console.log('Service utilisateur initialisé (session courante)');
}

/**
 * Récupère un utilisateur depuis Firestore
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Profil utilisateur ou null
 */
export async function getUserFromFirestore(userId) {
  try {
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
 * @param {string} username - Nom d'utilisateur (utilisé comme ID)
 * @param {Object} userData - Données utilisateur
 * @returns {Promise<Object|null>} Utilisateur créé ou null
 */
export async function createUserInFirestore(username, userData) {
  try {
    // Vérifier si le nom d'utilisateur est disponible
    const isAvailable = await isUsernameAvailable(username);
    if (!isAvailable) {
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }
    // Enregistrer dans Firestore
    await setDoc(doc(db, USERS_COLLECTION, username), { ...userData, username });
    return { ...userData, username };
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Met à jour un utilisateur dans Firestore
 * @param {string} username - ID/Nom d'utilisateur
 * @param {Object} userData - Données à mettre à jour
 * @returns {Promise<boolean>} Succès de la mise à jour
 */
export async function updateUserInFirestore(username, userData) {
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await getUserFromFirestore(username);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }
    // Mettre à jour dans Firestore
    await updateDoc(doc(db, USERS_COLLECTION, username), userData);
    // Si c'est l'utilisateur courant, mettre à jour la session
    if (currentUser && currentUser.username === username) {
      currentUser = { ...existingUser, ...userData };
      saveCurrentUserToLocalStorage(currentUser);
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
 * Charge l'utilisateur courant depuis le stockage local
 */
function loadCurrentUserFromLocalStorage() {
  try {
    const currentUserJson = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'utilisateur courant depuis le stockage local:', error);
    currentUser = null;
  }
}

/**
 * Enregistre l'utilisateur courant dans le stockage local
 */
function saveCurrentUserToLocalStorage(user) {
  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'utilisateur courant dans le stockage local:', error);
  }
}

/**
 * Retourne l'utilisateur courant
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Vérifie si l'utilisateur courant est admin
 */
export function isCurrentUserAdmin() {
  return currentUser && currentUser.isAdmin === true;
}

