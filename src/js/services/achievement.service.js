/**
 * Service de gestion des succès pour English Quest Reborn
 */

// Service de gestion des succès
import { db } from '../../config/firebase.config.js';
import { 
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    updateDoc
} from 'firebase/firestore';
import { getCurrentProfile } from './auth.service.js';

// Clés de stockage
const STORAGE_KEYS = {
    ACHIEVEMENTS: 'achievements'
};

// Liste des succès disponibles
const AVAILABLE_ACHIEVEMENTS = [
    {
        id: 'first_game',
        name: 'Premier pas',
        description: 'Jouer à votre premier jeu',
        icon: 'first_game',
        condition: (stats) => stats.totalGames >= 1
    },
    {
        id: 'score_100',
        name: 'Scoreur débutant',
        description: 'Atteindre un score de 100 points',
        icon: 'score_100',
        condition: (stats) => stats.highestScore >= 100
    },
    {
        id: 'score_500',
        name: 'Scoreur confirmé',
        description: 'Atteindre un score de 500 points',
        icon: 'score_500',
        condition: (stats) => stats.highestScore >= 500
    },
    {
        id: 'score_1000',
        name: 'Maître du score',
        description: 'Atteindre un score de 1000 points',
        icon: 'score_1000',
        condition: (stats) => stats.highestScore >= 1000
    },
    {
        id: 'games_10',
        name: 'Joueur régulier',
        description: 'Jouer à 10 parties',
        icon: 'games_10',
        condition: (stats) => stats.totalGames >= 10
    },
    {
        id: 'games_50',
        name: 'Joueur assidu',
        description: 'Jouer à 50 parties',
        icon: 'games_50',
        condition: (stats) => stats.totalGames >= 50
    },
    {
        id: 'games_100',
        name: 'Joueur passionné',
        description: 'Jouer à 100 parties',
        icon: 'games_100',
        condition: (stats) => stats.totalGames >= 100
    },
    {
        id: 'perfect_game',
        name: 'Partie parfaite',
        description: 'Obtenir un score parfait dans un jeu',
        icon: 'perfect_game',
        condition: (stats) => stats.perfectGames >= 1
    }
];

/**
 * Charge les succès de l'utilisateur
 * @returns {Promise<Array>} Les succès de l'utilisateur
 */
export async function loadUserAchievements() {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            throw new Error('Utilisateur non authentifié');
        }

        const achievementsRef = collection(db, 'achievements');
        const q = query(
            achievementsRef,
            where('userId', '==', profile.uid)
        );

        const querySnapshot = await getDocs(q);
        const achievements = [];

        querySnapshot.forEach((doc) => {
            achievements.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sauvegarder dans le localStorage
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

        return achievements;
    } catch (error) {
        console.error('Erreur lors du chargement des succès:', error);
        return [];
    }
}

/**
 * Vérifie et débloque les nouveaux succès
 * @param {Object} stats - Les statistiques de l'utilisateur
 * @returns {Promise<Array>} Les nouveaux succès débloqués
 */
export async function checkAndUnlockAchievements(stats) {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            throw new Error('Utilisateur non authentifié');
        }

        const currentAchievements = await loadUserAchievements();
        const unlockedAchievementIds = currentAchievements.map(a => a.id);
        const newlyUnlocked = [];

        for (const achievement of AVAILABLE_ACHIEVEMENTS) {
            if (!unlockedAchievementIds.includes(achievement.id) && achievement.condition(stats)) {
                const achievementData = {
                    userId: profile.uid,
                    achievementId: achievement.id,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    unlockedAt: new Date().toISOString()
                };

                const docRef = await addDoc(collection(db, 'achievements'), achievementData);
                newlyUnlocked.push({
                    id: docRef.id,
                    ...achievementData
                });
            }
        }

        if (newlyUnlocked.length > 0) {
            // Mettre à jour le localStorage
            const allAchievements = [...currentAchievements, ...newlyUnlocked];
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(allAchievements));

            // Dispatcher un événement pour les nouveaux succès
            const event = new CustomEvent('achievementsUnlocked', {
                detail: { achievements: newlyUnlocked }
            });
            window.dispatchEvent(event);
        }

        return newlyUnlocked;
    } catch (error) {
        console.error('Erreur lors de la vérification des succès:', error);
        return [];
    }
}

/**
 * Récupère le nombre total de succès débloqués
 * @returns {Promise<number>} Le nombre de succès débloqués
 */
export async function getUnlockedAchievementsCount() {
    try {
        const achievements = await loadUserAchievements();
        return achievements.length;
    } catch (error) {
        console.error('Erreur lors du comptage des succès:', error);
        return 0;
    }
}

/**
 * Récupère le pourcentage de progression des succès
 * @returns {Promise<number>} Le pourcentage de progression (0-100)
 */
export async function getAchievementsProgress() {
    try {
        const unlockedCount = await getUnlockedAchievementsCount();
        const totalCount = AVAILABLE_ACHIEVEMENTS.length;
        return (unlockedCount / totalCount) * 100;
    } catch (error) {
        console.error('Erreur lors du calcul de la progression:', error);
        return 0;
    }
} 