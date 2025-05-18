/**
 * Service de gestion des scores pour English Quest Reborn
 */

// Service de gestion des scores
import { db } from '../../config/firebase.config.js';
import { 
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { getCurrentProfile } from './auth.service.js';

// Clés de stockage
const STORAGE_KEYS = {
    SCORES: 'scores'
};

/**
 * Charge les scores de l'utilisateur
 * @returns {Promise<Array>} Les scores de l'utilisateur
 */
export async function loadUserScores() {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            throw new Error('Utilisateur non authentifié');
        }

        const scoresRef = collection(db, 'scores');
        const q = query(
            scoresRef,
            where('userId', '==', profile.uid),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const scores = [];

        querySnapshot.forEach((doc) => {
            scores.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sauvegarder dans le localStorage
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));

        return scores;
    } catch (error) {
        console.error('Erreur lors du chargement des scores:', error);
        return [];
    }
}

/**
 * Enregistre un nouveau score
 * @param {string} game - Le nom du jeu
 * @param {number} value - La valeur du score
 * @returns {Promise<Object>} Le score enregistré
 */
export async function saveScore(game, value) {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            throw new Error('Utilisateur non authentifié');
        }

        const scoreData = {
            userId: profile.uid,
            game: game,
            value: value,
            date: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'scores'), scoreData);
        const score = {
            id: docRef.id,
            ...scoreData
        };

        // Mettre à jour le localStorage
        const scores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');
        scores.unshift(score);
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));

        return score;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du score:', error);
        throw error;
    }
}

/**
 * Supprime un score
 * @param {string} scoreId - L'identifiant du score à supprimer
 * @returns {Promise<void>}
 */
export async function deleteScore(scoreId) {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            throw new Error('Utilisateur non authentifié');
        }

        await deleteDoc(doc(db, 'scores', scoreId));

        // Mettre à jour le localStorage
        const scores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES) || '[]');
        const updatedScores = scores.filter(score => score.id !== scoreId);
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(updatedScores));

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du score:', error);
        throw error;
    }
}

/**
 * Récupère le meilleur score pour un jeu
 * @param {string} game - Le nom du jeu
 * @returns {Promise<Object|null>} Le meilleur score ou null
 */
export async function getBestScore(game) {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            throw new Error('Utilisateur non authentifié');
        }

        const scoresRef = collection(db, 'scores');
        const q = query(
            scoresRef,
            where('userId', '==', profile.uid),
            where('game', '==', game),
            orderBy('value', 'desc'),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('Erreur lors de la récupération du meilleur score:', error);
        return null;
    }
} 