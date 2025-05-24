// Assumes firebaseServiceInstance and authService are globally available.

const ENIGMA_SCROLL_GAME_ID = 'enigma-scroll';

async function saveScore(score, gameData = {}) {
  const authState = window.authService?.getAuthState();
  if (!authState?.isAuthenticated || !authState.profile) {
    console.warn("[EnigmaFirebaseHelper] User not authenticated. Cannot save score online.");
    return Promise.reject(new Error("User not authenticated"));
  }

  const { userId, username } = authState.profile;

  const scoreData = {
    userId,
    playerName: username, // Using profile's username as playerName for consistency
    gameId: ENIGMA_SCROLL_GAME_ID,
    score: parseInt(score) || 0,
    difficulty: gameData.difficulty || 'intermediate',
    wordsFound: gameData.wordsFound || 0,
    maxCombo: gameData.maxCombo || 1,
    totalTime: gameData.totalTime || 0,
    timestamp: new Date() // Client-side timestamp; firebaseServiceInstance.addScore might use server ts
  };

  try {
    // firebaseServiceInstance.addScore should handle writing to 'game_scores'
    const docRef = await window.firebaseServiceInstance.addScore(scoreData); 
    console.log("[EnigmaFirebaseHelper] Score saved via firebaseService. ID:", docRef?.id);
    
    // Update user's best score for this game/difficulty
    await updateUserBestScore(userId, scoreData.score, scoreData.difficulty);
    return docRef; // Return the docRef or some success indicator
  } catch (error) {
    console.error("[EnigmaFirebaseHelper] Error saving score:", error);
    throw error; // Re-throw to be caught by caller
  }
}

async function updateUserBestScore(userId, currentScore, difficulty) {
  if (!userId) return;

  try {
    const profile = await window.firebaseServiceInstance.getProfile(userId);
    if (profile) {
      const bestScores = profile.bestScores || {};
      if (!bestScores[ENIGMA_SCROLL_GAME_ID]) {
        bestScores[ENIGMA_SCROLL_GAME_ID] = {};
      }
      
      const currentBest = bestScores[ENIGMA_SCROLL_GAME_ID][difficulty] || 0;

      if (currentScore > currentBest) {
        bestScores[ENIGMA_SCROLL_GAME_ID][difficulty] = currentScore;
        await window.firebaseServiceInstance.updateProfile(userId, { bestScores });
        console.log(`[EnigmaFirebaseHelper] Updated best score for ${difficulty}: ${currentScore}`);
      }
    } else {
      // Profile might not exist if called out of sync, though unlikely with auth guard on saveScore
      console.warn(`[EnigmaFirebaseHelper] Profile not found for userId: ${userId} when updating best score.`);
      // Optionally, create a basic best score entry if profile is created later
      // For now, we assume profile exists if user is authenticated.
    }
  } catch (error) {
    console.error("[EnigmaFirebaseHelper] Error updating user best score:", error);
    // Non-critical error, don't need to re-throw and break main flow
  }
}

async function getTopScores(timeFrame = 'alltime', difficulty = null, limit = 10) {
  if (!window.firebaseServiceInstance || !window.firebaseServiceInstance.db) {
    console.warn("[EnigmaFirebaseHelper] firebaseServiceInstance not available. Cannot fetch scores.");
    return Promise.resolve([]);
  }

  try {
    // Simplifier la requête pour éviter les problèmes d'index composé Firebase
    // On récupère plus de scores et on filtre côté client
    const fetchLimit = Math.max(50, limit * 3); // Récupérer plus pour compenser le filtrage
    
    let query = window.firebaseServiceInstance.db.collection('game_scores')
      .where('gameId', '==', ENIGMA_SCROLL_GAME_ID)
      .orderBy('score', 'desc')
      .limit(fetchLimit);
    
    const snapshot = await query.get();
    let scores = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.playerName, // Use playerName from score data
        score: data.score,
        difficulty: data.difficulty,
        wordsFound: data.wordsFound,
        maxCombo: data.maxCombo,
        gameId: data.gameId,
        timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : new Date()
      };
    });

    // Client-side filtering for timeframe
    if (timeFrame !== 'alltime') {
      const now = new Date();
      let startDate;
      if (timeFrame === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (timeFrame === 'weekly') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      }
      if (startDate) {
        scores = scores.filter(score => score.timestamp >= startDate);
      }
    }

    // Client-side filtering for difficulty
    if (difficulty && difficulty !== 'all') {
        scores = scores.filter(score => score.difficulty === difficulty);
    }

    // Re-trier par score décroissant et limiter au nombre demandé
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, limit);

    return scores;

  } catch (error) {
    console.error("[EnigmaFirebaseHelper] Error fetching top scores:", error);
    return []; // Return empty array on error
  }
}

window.EnigmaScrollFirebase = {
  saveScore,
  getTopScores,
  isAvailable: true // Add a flag to indicate it's available/refactored
};
