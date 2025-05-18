/**
 * Service de gestion des scores pour English Quest Reborn
 */

// Clés de stockage
const STORAGE_KEYS = {
    SCORES: 'english_quest_scores'
};

/**
 * Charge les scores de l'utilisateur
 * @returns {Promise<Array>} Les scores de l'utilisateur
 */
export async function loadUserScores() {
    try {
        // Récupérer les scores depuis le localStorage
        const scoresJson = localStorage.getItem(STORAGE_KEYS.SCORES);
        if (!scoresJson) {
            return [];
        }

        const scores = JSON.parse(scoresJson);
        return scores.sort((a, b) => new Date(b.date) - new Date(a.date));
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
        // Récupérer les scores existants
        const scores = await loadUserScores();

        // Créer le nouveau score
        const newScore = {
            id: Date.now().toString(),
            game,
            value,
            date: new Date().toISOString()
        };

        // Ajouter le nouveau score
        scores.unshift(newScore);

        // Sauvegarder les scores
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));

        return newScore;
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du score:', error);
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
        // Récupérer les scores existants
        const scores = await loadUserScores();

        // Filtrer le score à supprimer
        const updatedScores = scores.filter(score => score.id !== scoreId);

        // Sauvegarder les scores mis à jour
        localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(updatedScores));
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
        const scores = await loadUserScores();
        const gameScores = scores.filter(score => score.game === game);
        
        if (gameScores.length === 0) {
            return null;
        }

        return gameScores.reduce((best, current) => 
            current.value > best.value ? current : best
        );
    } catch (error) {
        console.error('Erreur lors de la récupération du meilleur score:', error);
        return null;
    }
} 