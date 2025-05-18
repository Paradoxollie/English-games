/**
 * Service de gestion des succès pour English Quest Reborn
 */

// Clés de stockage
const STORAGE_KEYS = {
    ACHIEVEMENTS: 'english_quest_achievements'
};

// Liste des succès disponibles
const AVAILABLE_ACHIEVEMENTS = [
    {
        id: 'first_game',
        name: 'Première partie',
        description: 'Jouez votre première partie',
        icon: 'first_game',
        condition: (stats) => stats.totalGamesPlayed >= 1
    },
    {
        id: 'score_100',
        name: 'Score de 100',
        description: 'Atteignez un score de 100 points',
        icon: 'score_100',
        condition: (stats) => stats.highestScore >= 100
    },
    {
        id: 'score_500',
        name: 'Score de 500',
        description: 'Atteignez un score de 500 points',
        icon: 'score_500',
        condition: (stats) => stats.highestScore >= 500
    },
    {
        id: 'score_1000',
        name: 'Score de 1000',
        description: 'Atteignez un score de 1000 points',
        icon: 'score_1000',
        condition: (stats) => stats.highestScore >= 1000
    },
    {
        id: 'games_10',
        name: 'Joueur régulier',
        description: 'Jouez 10 parties',
        icon: 'games_10',
        condition: (stats) => stats.totalGamesPlayed >= 10
    },
    {
        id: 'games_50',
        name: 'Joueur assidu',
        description: 'Jouez 50 parties',
        icon: 'games_50',
        condition: (stats) => stats.totalGamesPlayed >= 50
    },
    {
        id: 'games_100',
        name: 'Joueur expert',
        description: 'Jouez 100 parties',
        icon: 'games_100',
        condition: (stats) => stats.totalGamesPlayed >= 100
    }
];

/**
 * Charge les succès de l'utilisateur
 * @returns {Promise<Array>} Les succès de l'utilisateur
 */
export async function loadUserAchievements() {
    try {
        // Récupérer les succès depuis le localStorage
        const achievementsJson = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
        if (!achievementsJson) {
            return [];
        }

        const achievements = JSON.parse(achievementsJson);
        return achievements.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
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
        // Récupérer les succès existants
        const unlockedAchievements = await loadUserAchievements();
        const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

        // Vérifier les nouveaux succès
        const newAchievements = AVAILABLE_ACHIEVEMENTS
            .filter(achievement => !unlockedIds.has(achievement.id) && achievement.condition(stats))
            .map(achievement => ({
                ...achievement,
                unlockedAt: new Date().toISOString()
            }));

        if (newAchievements.length > 0) {
            // Ajouter les nouveaux succès
            const updatedAchievements = [...unlockedAchievements, ...newAchievements];

            // Sauvegarder les succès
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));

            // Déclencher un événement pour les nouveaux succès
            const event = new CustomEvent('achievements-unlocked', {
                detail: { achievements: newAchievements }
            });
            document.dispatchEvent(event);
        }

        return newAchievements;
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
        return Math.round((unlockedCount / AVAILABLE_ACHIEVEMENTS.length) * 100);
    } catch (error) {
        console.error('Erreur lors du calcul de la progression:', error);
        return 0;
    }
} 