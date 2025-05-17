/**
 * Service de gestion des scores pour English Quest Reborn
 * Centralise toutes les opérations liées aux scores des jeux
 */

import { db } from '../../config/firebase-config.js';
import { collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getCurrentUser, getUserFromFirestore, updateUserInFirestore } from './user.service.js';

// Nom de la collection principale des scores
const SCORES_COLLECTION = 'game_scores';

/**
 * Enregistre un nouveau score
 * @param {string} gameId - Identifiant du jeu
 * @param {number} score - Score obtenu
 * @param {Object} additionalData - Données supplémentaires (niveau, temps, etc.)
 * @returns {Promise<Object|null>} Score enregistré ou null
 */
export async function saveScore(gameId, score, additionalData = {}) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error('Impossible d\'enregistrer le score: aucun utilisateur connecté');
      return null;
    }
    
    const scoreData = {
      gameId,
      userId: currentUser.userId,
      username: currentUser.username,
      score,
      timestamp: new Date().toISOString(),
      ...additionalData
    };
    
    const docRef = await addDoc(collection(db, SCORES_COLLECTION), scoreData);
    
    // Ajouter l'ID du document au score
    scoreData.id = docRef.id;
    
    // Attribuer les récompenses
    await awardRewardsForScore(gameId, score, currentUser.userId);
    
    return scoreData;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du score:', error);
    return null;
  }
}

/**
 * Récupère les meilleurs scores pour un jeu
 * @param {string} gameId - Identifiant du jeu
 * @param {number} limit - Nombre maximum de scores à récupérer
 * @returns {Promise<Array>} Liste des meilleurs scores
 */
export async function getTopScores(gameId, maxResults = 10) {
  try {
    const q = query(
      collection(db, SCORES_COLLECTION),
      where('gameId', '==', gameId),
      orderBy('score', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    
    const scores = [];
    querySnapshot.forEach(doc => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return scores;
  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs scores:', error);
    
    // Si c'est une erreur d'index manquant ou en cours de création
    if (error.code === 'failed-precondition' && 
        (error.message.includes('requires an index') || 
         error.message.includes('currently building'))) {
      console.warn('Index composite en cours de création. Utilisation d\'un index temporaire en mémoire...');
      
      // Solution alternative : récupérer tous les scores et filtrer/trier en mémoire
      const allScoresSnapshot = await getDocs(collection(db, SCORES_COLLECTION));
      const allScores = [];
      allScoresSnapshot.forEach(doc => {
        const scoreData = doc.data();
        if (scoreData.gameId === gameId) {
          allScores.push({
            id: doc.id,
            ...scoreData
          });
        }
      });
      
      // Trier les scores en mémoire
      return allScores
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
    }
    
    return [];
  }
}

/**
 * Récupère les meilleurs scores d'un utilisateur pour un jeu
 * @param {string} gameId - Identifiant du jeu
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {number} limit - Nombre maximum de scores à récupérer
 * @returns {Promise<Array>} Liste des meilleurs scores de l'utilisateur
 */
export async function getUserTopScores(gameId, userId, maxResults = 5) {
  try {
    const q = query(
      collection(db, SCORES_COLLECTION),
      where('gameId', '==', gameId),
      where('userId', '==', userId),
      orderBy('score', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    
    const scores = [];
    querySnapshot.forEach(doc => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return scores;
  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs scores de l\'utilisateur:', error);
    
    // Si c'est une erreur d'index manquant ou en cours de création
    if (error.code === 'failed-precondition' && 
        (error.message.includes('requires an index') || 
         error.message.includes('currently building'))) {
      console.warn('Index composite en cours de création. Utilisation d\'un index temporaire en mémoire...');
      
      // Solution alternative : récupérer tous les scores et filtrer/trier en mémoire
      const allScoresSnapshot = await getDocs(collection(db, SCORES_COLLECTION));
      const allScores = [];
      allScoresSnapshot.forEach(doc => {
        const scoreData = doc.data();
        if (scoreData.gameId === gameId && scoreData.userId === userId) {
          allScores.push({
            id: doc.id,
            ...scoreData
          });
        }
      });
      
      // Trier les scores en mémoire
      return allScores
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
    }
    
    return [];
  }
}

/**
 * Récupère le meilleur score d'un utilisateur pour un jeu
 * @param {string} gameId - Identifiant du jeu
 * @param {string} userId - Identifiant de l'utilisateur
 * @returns {Promise<Object|null>} Meilleur score ou null
 */
export async function getUserBestScore(gameId, userId) {
  try {
    const scores = await getUserTopScores(gameId, userId, 1);
    return scores.length > 0 ? scores[0] : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du meilleur score de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Supprime un score
 * @param {string} scoreId - Identifiant du score
 * @returns {Promise<boolean>} Succès de la suppression
 */
export async function deleteScore(scoreId) {
  try {
    await deleteDoc(doc(db, SCORES_COLLECTION, scoreId));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du score:', error);
    return false;
  }
}

/**
 * Met à jour un score
 * @param {string} scoreId - Identifiant du score
 * @param {Object} scoreData - Données à mettre à jour
 * @returns {Promise<boolean>} Succès de la mise à jour
 */
export async function updateScore(scoreId, scoreData) {
  try {
    await updateDoc(doc(db, SCORES_COLLECTION, scoreId), scoreData);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du score:', error);
    return false;
  }
}

/**
 * Attribue des récompenses pour un score
 * @param {string} gameId - Identifiant du jeu
 * @param {number} score - Score obtenu
 * @param {string} userId - Identifiant de l'utilisateur
 * @returns {Promise<Object|null>} Récompenses attribuées ou null
 */
async function awardRewardsForScore(gameId, score, userId) {
  try {
    // Récupérer le meilleur score de l'utilisateur
    const bestScore = await getUserBestScore(gameId, userId);
    // Récompenses de base pour avoir joué
    let xpReward = 10;
    let coinsReward = 10;
    // Bonus si c'est un nouveau record personnel
    if (!bestScore || score > bestScore.score) {
      xpReward += 20;
      coinsReward += 20;
    }
    // Bonus si c'est dans le top 3 des meilleurs scores
    const topScores = await getTopScores(gameId, 3);
    const isInTop3 = topScores.some(s => s.userId === userId && s.score === score);
    if (isInTop3) {
      xpReward += 50;
      coinsReward += 50;
    }
    // Récupérer l'utilisateur
    const user = await getUserFromFirestore(userId);
    if (!user) {
      console.error('Utilisateur non trouvé pour attribution des récompenses');
      return null;
    }
    // Mettre à jour les champs xp et coins
    const newXp = (user.xp || 0) + xpReward;
    const newCoins = (user.coins || 0) + coinsReward;
    await updateUserInFirestore(user.username, { ...user, xp: newXp, coins: newCoins });
    return {
      xpReward,
      coinsReward
    };
  } catch (error) {
    console.error('Erreur lors de l\'attribution des récompenses:', error);
    return null;
  }
}

/**
 * Migre les scores des anciennes collections vers la nouvelle
 * @param {Array} gameCollections - Liste des anciennes collections de scores
 * @returns {Promise<Object>} Résultat de la migration
 */
export async function migrateScores(gameCollections) {
  try {
    let totalMigrated = 0;
    const results = {};
    
    for (const collection of gameCollections) {
      try {
        // Extraire l'ID du jeu du nom de la collection
        const gameId = collection.replace('_scores', '');
        
        // Récupérer tous les scores de l'ancienne collection
        const scoresSnapshot = await getDocs(collection(db, collection));
        
        let migratedCount = 0;
        
        // Migrer chaque score
        for (const scoreDoc of scoresSnapshot.docs) {
          const scoreData = scoreDoc.data();
          
          // Créer le nouveau format de score
          const newScore = {
            gameId,
            userId: scoreData.userId || 'unknown',
            username: scoreData.name || 'Unknown Player',
            score: scoreData.score || 0,
            timestamp: scoreData.timestamp || new Date().toISOString(),
            // Conserver les données supplémentaires
            ...Object.keys(scoreData)
              .filter(key => !['userId', 'name', 'score', 'timestamp'].includes(key))
              .reduce((obj, key) => {
                obj[key] = scoreData[key];
                return obj;
              }, {})
          };
          
          // Ajouter à la nouvelle collection
          await addDoc(collection(db, SCORES_COLLECTION), newScore);
          migratedCount++;
        }
        
        results[collection] = migratedCount;
        totalMigrated += migratedCount;
      } catch (error) {
        console.error(`Erreur lors de la migration de la collection ${collection}:`, error);
        results[collection] = 'error';
      }
    }
    
    return {
      totalMigrated,
      details: results
    };
  } catch (error) {
    console.error('Erreur lors de la migration des scores:', error);
    return {
      totalMigrated: 0,
      error: error.message
    };
  }
}

export default {
  saveScore,
  getTopScores,
  getUserTopScores,
  getUserBestScore,
  deleteScore,
  updateScore,
  migrateScores
};
