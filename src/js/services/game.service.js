/**
 * Service de gestion des jeux pour English Quest Reborn
 * Gère les scores, les récompenses et les statistiques des jeux
 */

import { db, COLLECTIONS } from './auth.service.js';
import { getUserProfile, updateUserProfile, addCoins, addExperience } from './user.service.js';
import { 
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Configuration des récompenses par jeu
const GAME_REWARDS = {
    'speed_verb_challenge': {
        xp: {
            easy: 10,
            medium: 20,
            hard: 30,
            master: 50
        },
        coins: {
            completion: 10,
            topScore: 100
        }
    },
    'enigma_scroll': {
        xp: {
            easy: 10,
            medium: 20,
            hard: 30
        },
        coins: {
            completion: 10,
            topScore: 100
        }
    },
    'word_memory': {
        xp: {
            easy: 10,
            medium: 20,
            hard: 30
        },
        coins: {
            completion: 10,
            topScore: 100
        }
    },
    'memory_matrix': {
        xp: {
            easy: 10,
            medium: 20,
            hard: 30
        },
        coins: {
            completion: 10,
            topScore: 100
        }
    },
    'lost_in_migration': {
        xp: {
            easy: 10,
            medium: 20,
            hard: 30
        },
        coins: {
            completion: 10,
            topScore: 100
        }
    },
    'brew_your_words': {
        xp: {
            easy: 10,
            medium: 20,
            hard: 30
        },
        coins: {
            completion: 10,
            topScore: 100
        }
    },
    'whisper_trials': {
        xp: {
            easy: 10,
            medium: 20,
            hard: 30
        },
        coins: {
            completion: 10,
            topScore: 100
        }
    }
};

/**
 * Enregistre un score de jeu et attribue les récompenses
 * @param {string} userId - ID de l'utilisateur
 * @param {string} gameId - ID du jeu
 * @param {number} score - Score obtenu
 * @param {string} difficulty - Difficulté du jeu
 * @param {Object} metadata - Métadonnées supplémentaires
 * @returns {Promise<Object>} - Résultat de l'enregistrement
 */
export async function saveGameScore(userId, gameId, score, difficulty = 'medium', metadata = {}) {
    console.log(`Enregistrement du score ${score} pour le jeu ${gameId} (${difficulty}) de l'utilisateur ${userId}`);
    
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
            difficulty,
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
        
        // Attribuer les récompenses
        const rewards = await awardGameRewards(userId, gameId, score, difficulty);
        
        return {
            scoreId: scoreRef.id,
            score: scoreData,
            rewards
        };
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du score:', error);
        throw error;
    }
}

/**
 * Attribue les récompenses pour un jeu terminé
 * @param {string} userId - ID de l'utilisateur
 * @param {string} gameId - ID du jeu
 * @param {number} score - Score obtenu
 * @param {string} difficulty - Difficulté du jeu
 * @returns {Promise<Object>} - Récompenses attribuées
 */
async function awardGameRewards(userId, gameId, score, difficulty) {
    console.log(`Attribution des récompenses pour le jeu ${gameId} (${difficulty}) avec un score de ${score}`);
    
    try {
        const rewards = {
            xp: 0,
            coins: 0,
            isTopScore: false
        };
        
        // Récupérer la configuration des récompenses pour ce jeu
        const gameRewards = GAME_REWARDS[gameId] || {
            xp: { easy: 10, medium: 20, hard: 30 },
            coins: { completion: 10, topScore: 100 }
        };
        
        // Attribuer l'XP en fonction de la difficulté
        const xpReward = gameRewards.xp[difficulty] || gameRewards.xp.medium;
        rewards.xp = xpReward;
        
        // Attribuer les pièces pour avoir terminé le jeu
        rewards.coins = gameRewards.coins.completion;
        
        // Vérifier si c'est un meilleur score
        const isTopScore = await checkIfTopScore(userId, gameId, score);
        
        if (isTopScore) {
            // Attribuer des pièces supplémentaires pour un meilleur score
            rewards.coins += gameRewards.coins.topScore;
            rewards.isTopScore = true;
        }
        
        // Ajouter les récompenses au profil utilisateur
        const xpResult = await addExperience(userId, rewards.xp);
        await addCoins(userId, rewards.coins);
        
        // Ajouter les informations de niveau
        if (xpResult.leveledUp) {
            rewards.leveledUp = true;
            rewards.oldLevel = xpResult.oldLevel;
            rewards.newLevel = xpResult.newLevel;
        }
        
        console.log('Récompenses attribuées:', rewards);
        
        return rewards;
    } catch (error) {
        console.error('Erreur lors de l\'attribution des récompenses:', error);
        throw error;
    }
}

/**
 * Vérifie si le score est dans le top 10 des meilleurs scores
 * @param {string} userId - ID de l'utilisateur
 * @param {string} gameId - ID du jeu
 * @param {number} score - Score à vérifier
 * @returns {Promise<boolean>} - True si c'est un top score
 */
async function checkIfTopScore(userId, gameId, score) {
    console.log(`Vérification si ${score} est un top score pour le jeu ${gameId}`);
    
    try {
        // Récupérer les 10 meilleurs scores
        const topScoresQuery = query(
            collection(db, COLLECTIONS.SCORES),
            where('gameId', '==', gameId),
            orderBy('score', 'desc'),
            limit(10)
        );
        
        const topScoresSnapshot = await getDocs(topScoresQuery);
        
        // Si moins de 10 scores, c'est automatiquement un top score
        if (topScoresSnapshot.size < 10) {
            return true;
        }
        
        // Vérifier si le score est meilleur que le plus bas des top scores
        const topScores = topScoresSnapshot.docs.map(doc => doc.data().score);
        const lowestTopScore = Math.min(...topScores);
        
        return score > lowestTopScore;
    } catch (error) {
        console.error('Erreur lors de la vérification du top score:', error);
        return false;
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
 * Récupère les scores d'un utilisateur pour un jeu
 * @param {string} userId - ID de l'utilisateur
 * @param {string} gameId - ID du jeu
 * @param {number} limit - Nombre de scores à récupérer
 * @returns {Promise<Array>} - Liste des scores de l'utilisateur
 */
export async function getUserScores(userId, gameId, limit = 10) {
    console.log(`Récupération des scores de l'utilisateur ${userId} pour le jeu ${gameId}`);
    
    try {
        // Créer la requête
        const scoresQuery = query(
            collection(db, COLLECTIONS.SCORES),
            where('userId', '==', userId),
            where('gameId', '==', gameId),
            orderBy('timestamp', 'desc'),
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
