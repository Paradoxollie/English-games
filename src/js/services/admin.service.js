/**
 * Service d'administration pour English Quest Reborn
 * Gère les fonctionnalités d'administration
 * IMPORTANT: Ce service ne doit être utilisé que par les administrateurs
 */

import { db, COLLECTIONS } from './auth.service.js';
import { getUserProfile, updateUserProfile } from './user.service.js';
import { 
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    deleteDoc,
    doc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Vérifie si l'utilisateur est un administrateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<boolean>} - True si l'utilisateur est un administrateur
 */
export async function isAdmin(userId) {
    console.log('Vérification des privilèges administrateur pour:', userId);
    
    try {
        // Récupérer le profil utilisateur
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
            return false;
        }
        
        // Vérifier si l'utilisateur est un administrateur
        return userProfile.isAdmin === true;
    } catch (error) {
        console.error('Erreur lors de la vérification des privilèges administrateur:', error);
        return false;
    }
}

/**
 * Récupère tous les utilisateurs
 * @param {string} currentUserId - ID de l'utilisateur actuel (administrateur)
 * @returns {Promise<Array>} - Liste des utilisateurs
 */
export async function getAllUsers(currentUserId) {
    console.log('Récupération de tous les utilisateurs');
    
    try {
        // Vérifier si l'utilisateur est un administrateur
        const isUserAdmin = await isAdmin(currentUserId);
        
        if (!isUserAdmin) {
            throw new Error('Vous n\'avez pas les privilèges nécessaires pour effectuer cette action');
        }
        
        // Récupérer tous les utilisateurs
        const usersQuery = query(
            collection(db, COLLECTIONS.USERS),
            orderBy('lastLogin', 'desc')
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        
        // Transformer les résultats
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`${users.length} utilisateurs récupérés`);
        
        return users;
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        throw error;
    }
}

/**
 * Supprime un utilisateur
 * @param {string} currentUserId - ID de l'utilisateur actuel (administrateur)
 * @param {string} userId - ID de l'utilisateur à supprimer
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export async function deleteUser(currentUserId, userId) {
    console.log(`Suppression de l'utilisateur ${userId}`);
    
    try {
        // Vérifier si l'utilisateur est un administrateur
        const isUserAdmin = await isAdmin(currentUserId);
        
        if (!isUserAdmin) {
            throw new Error('Vous n\'avez pas les privilèges nécessaires pour effectuer cette action');
        }
        
        // Récupérer le profil de l'utilisateur à supprimer
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
            throw new Error('Utilisateur non trouvé');
        }
        
        // Vérifier si c'est Ollie
        if (userProfile.username && userProfile.username.toLowerCase() === 'ollie') {
            throw new Error('Vous ne pouvez pas supprimer le compte administrateur principal');
        }
        
        // Marquer l'utilisateur comme supprimé plutôt que de le supprimer réellement
        await updateUserProfile(userId, {
            isDeleted: true,
            deletedAt: new Date().toISOString(),
            deletedBy: currentUserId
        });
        
        console.log(`Utilisateur ${userId} marqué comme supprimé`);
        
        return {
            success: true,
            message: `L'utilisateur ${userProfile.username} a été supprimé`
        };
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        throw error;
    }
}

/**
 * Met à jour les privilèges administrateur d'un utilisateur
 * @param {string} currentUserId - ID de l'utilisateur actuel (administrateur)
 * @param {string} userId - ID de l'utilisateur à mettre à jour
 * @param {boolean} isAdmin - Nouveau statut administrateur
 * @returns {Promise<Object>} - Résultat de la mise à jour
 */
export async function updateAdminRights(currentUserId, userId, isAdmin) {
    console.log(`Mise à jour des privilèges administrateur de l'utilisateur ${userId} à ${isAdmin}`);
    
    try {
        // Vérifier si l'utilisateur actuel est un administrateur
        const isCurrentUserAdmin = await isAdmin(currentUserId);
        
        if (!isCurrentUserAdmin) {
            throw new Error('Vous n\'avez pas les privilèges nécessaires pour effectuer cette action');
        }
        
        // Récupérer le profil de l'utilisateur à mettre à jour
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
            throw new Error('Utilisateur non trouvé');
        }
        
        // Vérifier si c'est Ollie
        if (userProfile.username && userProfile.username.toLowerCase() === 'ollie') {
            // On ne peut pas retirer les privilèges administrateur à Ollie
            if (!isAdmin) {
                throw new Error('Vous ne pouvez pas retirer les privilèges administrateur au compte principal');
            }
        }
        
        // Mettre à jour les privilèges administrateur
        await updateUserProfile(userId, {
            isAdmin
        });
        
        console.log(`Privilèges administrateur de l'utilisateur ${userId} mis à jour à ${isAdmin}`);
        
        return {
            success: true,
            message: `Les privilèges administrateur de ${userProfile.username} ont été ${isAdmin ? 'accordés' : 'retirés'}`
        };
    } catch (error) {
        console.error('Erreur lors de la mise à jour des privilèges administrateur:', error);
        throw error;
    }
}

/**
 * Récupère tous les scores
 * @param {string} currentUserId - ID de l'utilisateur actuel (administrateur)
 * @param {string} gameId - ID du jeu (optionnel)
 * @param {number} limit - Nombre de scores à récupérer
 * @returns {Promise<Array>} - Liste des scores
 */
export async function getAllScores(currentUserId, gameId = null, limit = 100) {
    console.log('Récupération de tous les scores');
    
    try {
        // Vérifier si l'utilisateur est un administrateur
        const isUserAdmin = await isAdmin(currentUserId);
        
        if (!isUserAdmin) {
            throw new Error('Vous n\'avez pas les privilèges nécessaires pour effectuer cette action');
        }
        
        // Créer la requête
        let scoresQuery;
        
        if (gameId) {
            // Requête pour un jeu spécifique
            scoresQuery = query(
                collection(db, COLLECTIONS.SCORES),
                where('gameId', '==', gameId),
                orderBy('score', 'desc'),
                limit(limit)
            );
        } else {
            // Requête pour tous les jeux
            scoresQuery = query(
                collection(db, COLLECTIONS.SCORES),
                orderBy('timestamp', 'desc'),
                limit(limit)
            );
        }
        
        // Exécuter la requête
        const scoresSnapshot = await getDocs(scoresQuery);
        
        // Transformer les résultats
        const scores = scoresSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`${scores.length} scores récupérés`);
        
        return scores;
    } catch (error) {
        console.error('Erreur lors de la récupération des scores:', error);
        throw error;
    }
}

/**
 * Supprime un score
 * @param {string} currentUserId - ID de l'utilisateur actuel (administrateur)
 * @param {string} scoreId - ID du score à supprimer
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export async function deleteScore(currentUserId, scoreId) {
    console.log(`Suppression du score ${scoreId}`);
    
    try {
        // Vérifier si l'utilisateur est un administrateur
        const isUserAdmin = await isAdmin(currentUserId);
        
        if (!isUserAdmin) {
            throw new Error('Vous n\'avez pas les privilèges nécessaires pour effectuer cette action');
        }
        
        // Supprimer le score
        await deleteDoc(doc(db, COLLECTIONS.SCORES, scoreId));
        
        console.log(`Score ${scoreId} supprimé`);
        
        return {
            success: true,
            message: 'Le score a été supprimé'
        };
    } catch (error) {
        console.error('Erreur lors de la suppression du score:', error);
        throw error;
    }
}
