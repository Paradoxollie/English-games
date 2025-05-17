/**
 * Service de gestion des utilisateurs pour English Quest Reborn
 * Gère les profils utilisateurs, les scores et les statistiques
 */

import { db, COLLECTIONS } from './auth.service.js';
import { 
    doc, 
    getDoc, 
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Récupère le profil utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Profil utilisateur
 */
export async function getUserProfile(userId) {
    console.log('Récupération du profil utilisateur:', userId);
    
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        
        if (!userDoc.exists()) {
            console.log('Profil utilisateur non trouvé');
            return null;
        }
        
        const userData = userDoc.data();
        console.log('Profil utilisateur récupéré:', userData);
        
        return {
            ...userData,
            id: userDoc.id
        };
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        throw error;
    }
}

/**
 * Met à jour le profil utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} profileData - Données du profil à mettre à jour
 * @returns {Promise<Object>} - Profil utilisateur mis à jour
 */
export async function updateUserProfile(userId, profileData) {
    console.log('Mise à jour du profil utilisateur:', userId);
    
    try {
        // Vérifier si l'utilisateur existe
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        
        if (!userDoc.exists()) {
            throw new Error('Profil utilisateur non trouvé');
        }
        
        const userData = userDoc.data();
        
        // Préparer les données à mettre à jour
        const updateData = { ...profileData };
        
        // SÉCURITÉ CRITIQUE: Empêcher la modification des privilèges administrateur
        // Seul Ollie peut être administrateur
        if ('isAdmin' in updateData) {
            // Vérifier si c'est Ollie
            if (userData.username && userData.username.toLowerCase() === 'ollie') {
                // Forcer isAdmin à true pour Ollie
                updateData.isAdmin = true;
                console.log("Protection des privilèges administrateur pour Ollie");
            } else {
                // Supprimer la tentative de modification des droits d'administrateur
                delete updateData.isAdmin;
                console.log("Tentative non autorisée de modification des droits d'administrateur bloquée");
            }
        }
        
        // Mettre à jour le profil
        await updateDoc(doc(db, COLLECTIONS.USERS, userId), updateData);
        
        console.log('Profil utilisateur mis à jour avec succès');
        
        // Récupérer le profil mis à jour
        return await getUserProfile(userId);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        throw error;
    }
}

/**
 * Ajoute des pièces au profil utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} amount - Nombre de pièces à ajouter
 * @returns {Promise<Object>} - Profil utilisateur mis à jour
 */
export async function addCoins(userId, amount) {
    console.log(`Ajout de ${amount} pièces à l'utilisateur:`, userId);
    
    try {
        // Récupérer le profil utilisateur
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
            throw new Error('Profil utilisateur non trouvé');
        }
        
        // Calculer le nouveau solde
        const currentCoins = userProfile.coins || 0;
        const newCoins = currentCoins + amount;
        
        // Mettre à jour le profil
        return await updateUserProfile(userId, {
            coins: newCoins
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de pièces:', error);
        throw error;
    }
}

/**
 * Ajoute de l'expérience au profil utilisateur et gère la montée de niveau
 * @param {string} userId - ID de l'utilisateur
 * @param {number} amount - Quantité d'XP à ajouter
 * @returns {Promise<Object>} - Profil utilisateur mis à jour avec informations de niveau
 */
export async function addExperience(userId, amount) {
    console.log(`Ajout de ${amount} XP à l'utilisateur:`, userId);
    
    try {
        // Récupérer le profil utilisateur
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
            throw new Error('Profil utilisateur non trouvé');
        }
        
        // Calculer la nouvelle expérience
        const currentXp = userProfile.xp || 0;
        const currentLevel = userProfile.level || 1;
        let newXp = currentXp + amount;
        let newLevel = currentLevel;
        let leveledUp = false;
        
        // Vérifier si l'utilisateur monte de niveau
        const xpRequiredForNextLevel = calculateRequiredXp(currentLevel);
        
        if (newXp >= xpRequiredForNextLevel) {
            newLevel = currentLevel + 1;
            newXp = newXp - xpRequiredForNextLevel;
            leveledUp = true;
            
            console.log(`L'utilisateur ${userId} est monté au niveau ${newLevel}`);
        }
        
        // Mettre à jour le profil
        const updatedProfile = await updateUserProfile(userId, {
            xp: newXp,
            level: newLevel
        });
        
        // Retourner le profil mis à jour avec l'information de montée de niveau
        return {
            profile: updatedProfile,
            leveledUp,
            oldLevel: currentLevel,
            newLevel
        };
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'expérience:', error);
        throw error;
    }
}

/**
 * Calcule l'XP requis pour le niveau suivant
 * @param {number} level - Niveau actuel
 * @returns {number} - XP requis pour le niveau suivant
 */
export function calculateRequiredXp(level) {
    return level * 100;
}

/**
 * Enregistre un score de jeu
 * @param {string} userId - ID de l'utilisateur
 * @param {string} gameId - ID du jeu
 * @param {number} score - Score obtenu
 * @param {Object} metadata - Métadonnées supplémentaires
 * @returns {Promise<Object>} - Document de score créé
 */
export async function saveGameScore(userId, gameId, score, metadata = {}) {
    console.log(`Enregistrement du score ${score} pour le jeu ${gameId} de l'utilisateur ${userId}`);
    
    try {
        // Récupérer le profil utilisateur
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
            throw new Error('Profil utilisateur non trouvé');
        }
        
        // Créer le document de score
        const scoreData = {
            userId,
            username: userProfile.username,
            gameId,
            score,
            timestamp: serverTimestamp(),
            ...metadata
        };
        
        // Ajouter le score à la collection
        const scoreRef = doc(collection(db, COLLECTIONS.SCORES));
        await setDoc(scoreRef, scoreData);
        
        console.log('Score enregistré avec succès');
        
        // Mettre à jour les statistiques de l'utilisateur
        const stats = userProfile.stats || {};
        stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
        stats.totalScore = (stats.totalScore || 0) + score;
        
        // Mettre à jour le profil
        await updateUserProfile(userId, {
            stats
        });
        
        return {
            id: scoreRef.id,
            ...scoreData
        };
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du score:', error);
        throw error;
    }
}

/**
 * Récupère les meilleurs scores pour un jeu
 * @param {string} gameId - ID du jeu
 * @param {number} limit - Nombre de scores à récupérer
 * @returns {Promise<Array>} - Liste des meilleurs scores
 */
export async function getTopScores(gameId, limit = 10) {
    console.log(`Récupération des ${limit} meilleurs scores pour le jeu ${gameId}`);
    
    try {
        // Créer la requête
        const scoresQuery = query(
            collection(db, COLLECTIONS.SCORES),
            where('gameId', '==', gameId),
            orderBy('score', 'desc'),
            limit(limit)
        );
        
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
 * Récupère les scores d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} gameId - ID du jeu (optionnel)
 * @param {number} limit - Nombre de scores à récupérer
 * @returns {Promise<Array>} - Liste des scores de l'utilisateur
 */
export async function getUserScores(userId, gameId = null, limit = 10) {
    console.log(`Récupération des scores de l'utilisateur ${userId}`);
    
    try {
        // Créer la requête de base
        let scoresQuery;
        
        if (gameId) {
            // Requête pour un jeu spécifique
            scoresQuery = query(
                collection(db, COLLECTIONS.SCORES),
                where('userId', '==', userId),
                where('gameId', '==', gameId),
                orderBy('timestamp', 'desc'),
                limit(limit)
            );
        } else {
            // Requête pour tous les jeux
            scoresQuery = query(
                collection(db, COLLECTIONS.SCORES),
                where('userId', '==', userId),
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
