/**
 * Service d'administration pour English Quest Reborn
 * Gère les fonctionnalités d'administration et la gestion des utilisateurs
 */

import { queryDocuments, getDocument, updateDocument, setDocument } from '@core/services/firebase.service';
import { collections } from '@core/config/firebase.config';

/**
 * Récupère tous les utilisateurs depuis Firestore
 * @returns {Promise<Array>} Liste des utilisateurs
 */
export async function getAllUsers() {
  try {
    console.log("Récupération de tous les utilisateurs depuis Firestore...");
    
    // Récupérer tous les profils utilisateurs
    const profiles = await queryDocuments(collections.PROFILES);
    console.log(`${profiles.length} profils utilisateurs récupérés`);
    
    // Récupérer tous les utilisateurs de la collection users (pour compatibilité)
    const users = await queryDocuments(collections.USERS);
    console.log(`${users.length} utilisateurs récupérés`);
    
    // Fusionner les deux collections
    const allUsers = [...profiles];
    
    // Ajouter les utilisateurs qui ne sont pas déjà dans les profils
    for (const user of users) {
      const existingProfile = profiles.find(profile => profile.userId === user.id);
      if (!existingProfile) {
        allUsers.push({
          ...user,
          userId: user.id
        });
      }
    }
    
    console.log(`Total: ${allUsers.length} utilisateurs uniques récupérés`);
    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param {Object} user - L'utilisateur à vérifier
 * @returns {boolean} Vrai si l'utilisateur est administrateur
 */
export function isAdmin(user) {
  // SÉCURITÉ CRITIQUE: Vérification spéciale pour Ollie (seul administrateur autorisé)
  if (user && user.username && user.username.toLowerCase() === 'ollie') {
    console.log("Compte Ollie détecté - Privilèges administrateur accordés automatiquement");
    return true;
  }
  
  // Vérifier la propriété isAdmin
  return user && user.isAdmin === true;
}

/**
 * Met à jour les droits d'administration d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {boolean} isAdminValue - Nouvelle valeur des droits d'administration
 * @param {string} currentUsername - Nom d'utilisateur de l'utilisateur actuel
 * @returns {Promise<Object>} L'utilisateur mis à jour
 */
export async function updateAdminRights(userId, isAdminValue, currentUsername) {
  try {
    // Vérifier si l'utilisateur actuel est Ollie
    if (!currentUsername || currentUsername.toLowerCase() !== 'ollie') {
      console.error("Seul Ollie peut modifier les droits d'administration");
      throw new Error("Vous n'avez pas les droits pour effectuer cette action");
    }
    
    // Récupérer l'utilisateur
    const user = await getDocument(collections.PROFILES, userId);
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    
    // Vérifier si c'est Ollie
    if (user.username && user.username.toLowerCase() === 'ollie') {
      console.log("Protection des privilèges administrateur pour Ollie");
      
      // On ne peut pas retirer les droits d'administration à Ollie
      if (!isAdminValue) {
        throw new Error("Vous ne pouvez pas retirer vos propres droits d'administration");
      }
      
      // Mettre à jour l'utilisateur (même si ça ne change rien)
      return await updateDocument(collections.PROFILES, userId, {
        isAdmin: true
      });
    }
    
    // Mettre à jour les droits d'administration
    console.log(`Modification des droits d'administration pour ${user.username}: ${isAdminValue}`);
    return await updateDocument(collections.PROFILES, userId, {
      isAdmin: isAdminValue
    });
  } catch (error) {
    console.error("Erreur lors de la modification des droits d'administration:", error);
    throw error;
  }
}

/**
 * Supprime un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} currentUsername - Nom d'utilisateur de l'utilisateur actuel
 * @returns {Promise<boolean>} Vrai si l'utilisateur a été supprimé
 */
export async function deleteUser(userId, currentUsername) {
  try {
    // Vérifier si l'utilisateur actuel est administrateur
    if (!currentUsername || currentUsername.toLowerCase() !== 'ollie') {
      console.error("Seul Ollie peut supprimer des utilisateurs");
      throw new Error("Vous n'avez pas les droits pour effectuer cette action");
    }
    
    // Récupérer l'utilisateur
    const user = await getDocument(collections.PROFILES, userId);
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    
    // Vérifier si c'est Ollie
    if (user.username && user.username.toLowerCase() === 'ollie') {
      console.error("Vous ne pouvez pas supprimer le compte Ollie");
      throw new Error("Vous ne pouvez pas supprimer le compte administrateur principal");
    }
    
    // Supprimer l'utilisateur
    console.log(`Suppression de l'utilisateur ${user.username}`);
    
    // Marquer l'utilisateur comme supprimé plutôt que de le supprimer réellement
    return await updateDocument(collections.PROFILES, userId, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUsername
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
}

export default {
  getAllUsers,
  isAdmin,
  updateAdminRights,
  deleteUser
};
