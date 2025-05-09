/**
 * Fonctions d'aide Firebase pour le jeu Enigma Scroll
 */

// Constantes
const GAME_ID = 'enigma-scroll';

/**
 * Sauvegarde un score dans Firebase
 * @param {number} score - Le score à sauvegarder
 * @param {Object} gameData - Données supplémentaires du jeu
 * @returns {Promise} - Promesse résolue lorsque le score est sauvegardé
 */
function saveScore(score, gameData = {}) {
  // Vérifier si Firebase est disponible et connecté
  if (!window.firebase || !window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
    console.log("Firebase non disponible ou hors ligne, score sauvegardé localement uniquement");
    return Promise.resolve();
  }

  // Vérifier si l'utilisateur est connecté
  const auth = firebase.auth();
  if (!auth || !auth.currentUser) {
    console.log("Utilisateur non connecté, score sauvegardé localement uniquement");
    return Promise.resolve();
  }

  // Récupérer les informations de l'utilisateur
  const userId = auth.currentUser.uid;
  const username = auth.currentUser.displayName || "Joueur";

  // Préparer les données du score
  const scoreData = {
    userId,
    username,
    gameId: GAME_ID,
    game: GAME_ID, // Pour compatibilité
    score,
    difficulty: gameData.difficulty || 'intermediate',
    wordsFound: gameData.wordsFound || 0,
    maxCombo: gameData.maxCombo || 1,
    totalTime: gameData.totalTime || 0,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Sauvegarder dans Firestore - utiliser la même collection que Speed Verb Challenge
  return firebase.firestore().collection('game_scores').add(scoreData)
    .then((docRef) => {
      console.log("Score sauvegardé dans Firebase avec ID:", docRef.id);

      // Mettre à jour le meilleur score de l'utilisateur si nécessaire
      return updateUserBestScore(userId, score, gameData.difficulty);
    })
    .catch(error => {
      console.error("Erreur lors de la sauvegarde du score:", error);
    });
}

/**
 * Met à jour le meilleur score de l'utilisateur si nécessaire
 * @param {string} userId - ID de l'utilisateur
 * @param {number} score - Score actuel
 * @param {string} difficulty - Niveau de difficulté
 * @returns {Promise} - Promesse résolue lorsque le meilleur score est mis à jour
 */
function updateUserBestScore(userId, score, difficulty) {
  const db = firebase.firestore();
  const userRef = db.collection('users').doc(userId);

  return userRef.get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        const bestScores = userData.bestScores || {};
        const gameScores = bestScores[GAME_ID] || {};
        const currentBest = gameScores[difficulty] || 0;

        // Mettre à jour uniquement si le nouveau score est meilleur
        if (score > currentBest) {
          // Créer la structure si elle n'existe pas
          if (!bestScores[GAME_ID]) {
            bestScores[GAME_ID] = {};
          }

          bestScores[GAME_ID][difficulty] = score;

          return userRef.update({ bestScores });
        }
      } else {
        // Créer un nouveau document utilisateur avec le score
        const bestScores = {
          [GAME_ID]: {
            [difficulty]: score
          }
        };

        return userRef.set({
          userId,
          bestScores,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    })
    .catch(error => {
      console.error("Erreur lors de la mise à jour du meilleur score:", error);
    });
}

/**
 * Récupère les meilleurs scores
 * @param {string} timeFrame - Période ('daily', 'weekly', 'alltime')
 * @param {string} difficulty - Niveau de difficulté
 * @param {number} limit - Nombre de scores à récupérer
 * @returns {Promise<Array>} - Promesse résolue avec les scores
 */
function getTopScores(timeFrame = 'alltime', difficulty = 'intermediate', limit = 10) {
  // Vérifier si Firebase est disponible et connecté
  if (!window.firebase || !window.firebaseConnectionState || !window.firebaseConnectionState.isOnline) {
    console.log("Firebase non disponible ou hors ligne, impossible de récupérer les scores");
    return Promise.resolve([]);
  }

  const db = firebase.firestore();

  // Utiliser la collection générale et filtrer par jeu
  return db.collection('game_scores')
    .where('gameId', '==', GAME_ID)
    .orderBy('score', 'desc')
    .limit(limit)
    .get()
    .then(snapshot => {
      // Convertir les documents en objets
      let scores = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username,
          score: data.score,
          difficulty: data.difficulty,
          wordsFound: data.wordsFound,
          maxCombo: data.maxCombo,
          gameId: data.gameId,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
        };
      });

      // Filtrer par période si nécessaire
      if (timeFrame !== 'alltime') {
        const now = new Date();
        let startDate;

        if (timeFrame === 'daily') {
          // Aujourd'hui à minuit
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (timeFrame === 'weekly') {
          // Il y a 7 jours
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
        }

        scores = scores.filter(score => score.timestamp >= startDate);
      }

      // Filtrer par difficulté côté client si spécifiée
      if (difficulty) {
        scores = scores.filter(score => score.difficulty === difficulty);
      }

      // Limiter le nombre de résultats
      return scores.slice(0, limit);
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des scores:", error);
      return [];
    });
}

// Exporter les fonctions
window.EnigmaScrollFirebase = {
  saveScore,
  getTopScores
};
