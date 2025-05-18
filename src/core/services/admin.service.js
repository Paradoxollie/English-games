/**
 * Service d'administration pour English Quest Reborn
 * Gère les fonctionnalités d'administration du site
 */

import { db } from '../../config/firebase-config.js';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getCurrentUser, isCurrentUserAdmin, getAllUsersFromFirestore } from './user.service.js';

// Nom de la collection principale des utilisateurs
const USERS_COLLECTION = 'users';

/**
 * Vérifie si l'utilisateur courant a les droits d'administration
 * @returns {boolean} Vrai si l'utilisateur est administrateur
 * @throws {Error} Si l'utilisateur n'est pas administrateur
 */
function checkAdminRights() {
  if (!isCurrentUserAdmin()) {
    throw new Error('Accès non autorisé: droits d\'administrateur requis');
  }
  return true;
}

/**
 * Récupère tous les utilisateurs pour l'administration
 * @returns {Promise<Array>} Liste des utilisateurs
 */
export async function getAllUsersForAdmin() {
  try {
    console.log('[Admin] Récupération de tous les utilisateurs depuis Firestore...');
    const users = await getAllUsersFromFirestore();
    console.log(`[Admin] Utilisateurs récupérés: ${Object.keys(users).length}`);
    return Object.values(users);
  } catch (error) {
    console.error('[Admin] Erreur lors de la récupération des utilisateurs pour l\'administration:', error);
    throw error;
  }
}

/**
 * Met à jour un utilisateur (administration)
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} userData - Données à mettre à jour
 * @returns {Promise<boolean>} Succès de la mise à jour
 */
export async function updateUserAsAdmin(userId, userData) {
  try {
    // Vérifier si l'utilisateur existe
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    // SÉCURITÉ: Vérifier si on essaie de modifier les droits d'administrateur
    if (userData.hasOwnProperty('isAdmin')) {
      const currentUser = getCurrentUser();
      // Seul Ollie peut modifier les droits d'administrateur
      if (currentUser.username.toLowerCase() !== 'ollie') {
        throw new Error('Seul Ollie peut modifier les droits d\'administrateur');
      }
      // Vérifier si on essaie de retirer les droits d'Ollie
      const existingUser = userDoc.data();
      if (existingUser.username.toLowerCase() === 'ollie' && userData.isAdmin === false) {
        throw new Error('Impossible de retirer les droits d\'administrateur à Ollie');
      }
    }
    // Mettre à jour l'utilisateur
    await updateDoc(doc(db, USERS_COLLECTION, userId), userData);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur (admin):', error);
    throw error;
  }
}

/**
 * Supprime un utilisateur (administration)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} Succès de la suppression
 */
export async function deleteUserAsAdmin(userId) {
  try {
    // Vérifier les droits d'administration
    checkAdminRights();
    
    // Vérifier si l'utilisateur existe
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // SÉCURITÉ: Empêcher la suppression d'Ollie
    const userData = userDoc.data();
    if (userData.username.toLowerCase() === 'ollie') {
      throw new Error('Impossible de supprimer le compte Ollie');
    }
    
    // Supprimer l'utilisateur
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    
    // Supprimer également les scores associés
    const scoresQuery = query(
      collection(db, 'game_scores'),
      where('userId', '==', userId)
    );
    
    const scoresSnapshot = await getDocs(scoresQuery);
    const deletePromises = [];
    
    scoresSnapshot.forEach(scoreDoc => {
      deletePromises.push(deleteDoc(doc(db, 'game_scores', scoreDoc.id)));
    });
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur (admin):', error);
    throw error;
  }
}

/**
 * Ajoute de l'XP à un utilisateur (administration)
 * @param {string} userId - ID de l'utilisateur
 * @param {number} xpAmount - Quantité d'XP à ajouter
 * @returns {Promise<Object>} Résultat avec l'utilisateur mis à jour et les informations de niveau
 */
export async function addXpToUserAsAdmin(userId, xpAmount) {
  try {
    // Vérifier les droits d'administration
    checkAdminRights();
    
    // Vérifier si l'utilisateur existe
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Récupérer les données de l'utilisateur
    const userData = userDoc.data();
    
    // Calculer le nouveau niveau et l'XP
    let xp = (userData.xp || 0) + xpAmount;
    let level = userData.level || 1;
    let leveledUp = false;
    
    // Fonction pour calculer l'XP nécessaire pour le niveau suivant
    const xpForNextLevel = (lvl) => Math.floor(100 * Math.pow(1.5, lvl - 1));
    
    // Vérifier si l'utilisateur monte de niveau
    while (xp >= xpForNextLevel(level)) {
      xp -= xpForNextLevel(level);
      level += 1;
      leveledUp = true;
    }
    
    // Mettre à jour l'utilisateur
    const updatedData = {
      xp,
      level,
      stats: {
        ...(userData.stats || {}),
        totalXp: ((userData.stats && userData.stats.totalXp) || 0) + xpAmount
      }
    };
    
    await updateDoc(doc(db, USERS_COLLECTION, userId), updatedData);
    
    return {
      userId,
      leveledUp,
      oldLevel: userData.level,
      newLevel: level,
      xp
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'XP (admin):', error);
    throw error;
  }
}

/**
 * Ajoute des pièces à un utilisateur (administration)
 * @param {string} userId - ID de l'utilisateur
 * @param {number} coinsAmount - Quantité de pièces à ajouter
 * @returns {Promise<Object>} Utilisateur mis à jour
 */
export async function addCoinsToUserAsAdmin(userId, coinsAmount) {
  try {
    // Vérifier les droits d'administration
    checkAdminRights();
    
    // Vérifier si l'utilisateur existe
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Récupérer les données de l'utilisateur
    const userData = userDoc.data();
    
    // Calculer le nouveau montant de pièces
    const coins = (userData.coins || 0) + coinsAmount;
    
    // Mettre à jour l'utilisateur
    await updateDoc(doc(db, USERS_COLLECTION, userId), { coins });
    
    return {
      userId,
      coins
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de pièces (admin):', error);
    throw error;
  }
}

/**
 * Accorde des droits d'administrateur à un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {boolean} isAdmin - Valeur des droits d'administrateur
 * @returns {Promise<boolean>} Succès de la mise à jour
 */
export async function setUserAdminRights(userId, isAdmin) {
  try {
    const currentUser = getCurrentUser();
    // SÉCURITÉ: Seul Ollie peut modifier les droits d'administrateur
    if (currentUser.username.toLowerCase() !== 'ollie') {
      throw new Error('Seul Ollie peut modifier les droits d\'administrateur');
    }
    // Vérifier si l'utilisateur existe
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }
    // Récupérer les données de l'utilisateur
    const userData = userDoc.data();
    // SÉCURITÉ: Empêcher de retirer les droits d'Ollie
    if (userData.username.toLowerCase() === 'ollie' && isAdmin === false) {
      throw new Error('Impossible de retirer les droits d\'administrateur à Ollie');
    }
    // Mettre à jour les droits d'administrateur
    await updateDoc(doc(db, USERS_COLLECTION, userId), { isAdmin });
    return true;
  } catch (error) {
    console.error('Erreur lors de la modification des droits d\'administrateur:', error);
    throw error;
  }
}

/**
 * Récupère les statistiques globales du site
 * @returns {Promise<Object>} Statistiques globales
 */
export async function getGlobalStats() {
  try {
    // Vérifier les droits d'administration
    checkAdminRights();
    
    // Récupérer le nombre d'utilisateurs
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const userCount = usersSnapshot.size;
    
    // Récupérer le nombre de scores
    const scoresSnapshot = await getDocs(collection(db, 'game_scores'));
    const scoreCount = scoresSnapshot.size;
    
    // Calculer d'autres statistiques
    let totalXp = 0;
    let totalCoins = 0;
    let adminCount = 0;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      totalXp += userData.xp || 0;
      totalCoins += userData.coins || 0;
      if (userData.isAdmin) {
        adminCount++;
      }
    });
    
    return {
      userCount,
      scoreCount,
      totalXp,
      totalCoins,
      adminCount
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques globales:', error);
    throw error;
  }
}

export default {
  getAllUsersForAdmin,
  updateUserAsAdmin,
  deleteUserAsAdmin,
  addXpToUserAsAdmin,
  addCoinsToUserAsAdmin,
  setUserAdminRights,
  getGlobalStats
};
