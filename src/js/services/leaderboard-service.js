/**
 * Service de gestion des classements
 * Gère l'enregistrement et la récupération des scores
 */

import { scores as mockScores } from '../data/mock-scores.js';

class LeaderboardService {
  constructor(firebase, authService) {
    this.db = firebase ? firebase.firestore() : null;
    this.authService = authService;
    this.mockScores = mockScores;
  }

  /**
   * Enregistre un score
   * @param {string} gameId - Identifiant du jeu
   * @param {number} score - Score obtenu
   * @param {Object} gameData - Données supplémentaires du jeu
   * @returns {Promise<Object>} - Promesse résolue avec les données du score
   */
  async saveScore(gameId, score, gameData = {}) {
    try {
      // Si l'utilisateur est connecté, utiliser le service d'authentification
      if (this.authService && this.authService.isLoggedIn() && this.authService.hasProfile()) {
        return await this.authService.saveScore(gameId, score, gameData);
      }

      // Sinon, demander un nom d'utilisateur temporaire
      const username = this.getTemporaryUsername();
      if (!username) {
        throw new Error('Nom d\'utilisateur requis pour enregistrer le score');
      }

      // Créer l'objet score
      const scoreData = {
        username,
        gameId,
        score,
        timestamp: new Date(),
        isTemporary: true,
        ...gameData
      };

      // Enregistrer dans Firestore
      const scoreRef = await this.db.collection('scores').add(scoreData);

      return { id: scoreRef.id, ...scoreData };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du score:', error);
      throw error;
    }
  }

  /**
   * Obtient un nom d'utilisateur temporaire
   * @returns {string|null} - Nom d'utilisateur ou null si annulé
   */
  getTemporaryUsername() {
    // Récupérer le nom stocké localement
    let username = localStorage.getItem('temporaryUsername');

    // Si aucun nom n'est stocké, demander à l'utilisateur
    if (!username) {
      username = prompt('Entrez votre nom pour le classement:');

      // Si l'utilisateur annule, retourner null
      if (!username) {
        return null;
      }

      // Filtrer le nom pour éviter les contenus inappropriés
      username = this.filterUsername(username);

      // Stocker le nom localement
      localStorage.setItem('temporaryUsername', username);
    }

    return username;
  }

  /**
   * Filtre un nom d'utilisateur pour éviter les contenus inappropriés
   * @param {string} username - Nom d'utilisateur à filtrer
   * @returns {string} - Nom d'utilisateur filtré
   */
  filterUsername(username) {
    // Liste de mots inappropriés à filtrer
    const inappropriateWords = [
      'badword1', 'badword2', 'badword3'
      // Ajoutez d'autres mots inappropriés ici
    ];

    // Filtrer les mots inappropriés
    let filteredName = username.trim();
    inappropriateWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filteredName = filteredName.replace(regex, '*'.repeat(word.length));
    });

    // Limiter la longueur
    filteredName = filteredName.substring(0, 20);

    return filteredName;
  }

  /**
   * Obtient les meilleurs scores pour un jeu
   * @param {string} gameId - Identifiant du jeu
   * @param {number} limit - Nombre maximum de scores à récupérer
   * @returns {Promise<Array>} - Promesse résolue avec les scores
   */
  async getTopScores(gameId, limit = 10) {
    try {
      // En mode développement, utiliser les données factices
      if (!this.db) {
        return this.mockScores
          .filter(score => score.gameId === gameId)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }

      const snapshot = await this.db.collection('scores')
        .where('gameId', '==', gameId)
        .orderBy('score', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des scores:', error);

      // Utiliser les données factices en cas d'erreur
      return this.mockScores
        .filter(score => score.gameId === gameId)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }
  }

  /**
   * Obtient les scores récents pour un jeu
   * @param {string} gameId - Identifiant du jeu
   * @param {number} limit - Nombre maximum de scores à récupérer
   * @returns {Promise<Array>} - Promesse résolue avec les scores
   */
  async getRecentScores(gameId, limit = 10) {
    try {
      // En mode développement, utiliser les données factices
      if (!this.db) {
        return this.mockScores
          .filter(score => score.gameId === gameId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
      }

      const snapshot = await this.db.collection('scores')
        .where('gameId', '==', gameId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des scores récents:', error);

      // Utiliser les données factices en cas d'erreur
      return this.mockScores
        .filter(score => score.gameId === gameId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
  }

  /**
   * Obtient les scores d'un utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} gameId - Identifiant du jeu (optionnel)
   * @param {number} limit - Nombre maximum de scores à récupérer
   * @returns {Promise<Array>} - Promesse résolue avec les scores
   */
  async getUserScores(username, gameId = null, limit = 10) {
    try {
      // En mode développement, utiliser les données factices
      if (!this.db) {
        let filteredScores = this.mockScores.filter(score => score.username === username);

        if (gameId) {
          filteredScores = filteredScores.filter(score => score.gameId === gameId);
        }

        return filteredScores
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
      }

      let query = this.db.collection('scores')
        .where('username', '==', username)
        .orderBy('timestamp', 'desc');

      if (gameId) {
        query = query.where('gameId', '==', gameId);
      }

      const snapshot = await query.limit(limit).get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des scores de l\'utilisateur:', error);

      // Utiliser les données factices en cas d'erreur
      let filteredScores = this.mockScores.filter(score => score.username === username);

      if (gameId) {
        filteredScores = filteredScores.filter(score => score.gameId === gameId);
      }

      return filteredScores
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
  }

  /**
   * Obtient le meilleur score d'un utilisateur pour un jeu
   * @param {string} username - Nom d'utilisateur
   * @param {string} gameId - Identifiant du jeu
   * @returns {Promise<Object|null>} - Promesse résolue avec le score ou null
   */
  async getUserBestScore(username, gameId) {
    try {
      // En mode développement, utiliser les données factices
      if (!this.db) {
        const userScores = this.mockScores
          .filter(score => score.username === username && score.gameId === gameId)
          .sort((a, b) => b.score - a.score);

        return userScores.length > 0 ? userScores[0] : null;
      }

      const snapshot = await this.db.collection('scores')
        .where('username', '==', username)
        .where('gameId', '==', gameId)
        .orderBy('score', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du meilleur score:', error);

      // Utiliser les données factices en cas d'erreur
      const userScores = this.mockScores
        .filter(score => score.username === username && score.gameId === gameId)
        .sort((a, b) => b.score - a.score);

      return userScores.length > 0 ? userScores[0] : null;
    }
  }

  /**
   * Obtient le classement d'un utilisateur pour un jeu
   * @param {string} username - Nom d'utilisateur
   * @param {string} gameId - Identifiant du jeu
   * @returns {Promise<number|null>} - Promesse résolue avec le rang ou null
   */
  async getUserRank(username, gameId) {
    try {
      // En mode développement, utiliser les données factices
      if (!this.db) {
        // Obtenir le meilleur score de l'utilisateur
        const userScores = this.mockScores
          .filter(score => score.username === username && score.gameId === gameId)
          .sort((a, b) => b.score - a.score);

        if (userScores.length === 0) {
          return null;
        }

        const bestScore = userScores[0];

        // Compter le nombre de scores supérieurs
        const betterScores = this.mockScores
          .filter(score => score.gameId === gameId && score.score > bestScore.score);

        // Le rang est le nombre de scores supérieurs + 1
        return betterScores.length + 1;
      }

      // Obtenir le meilleur score de l'utilisateur
      const bestScore = await this.getUserBestScore(username, gameId);
      if (!bestScore) {
        return null;
      }

      // Compter le nombre de scores supérieurs
      const snapshot = await this.db.collection('scores')
        .where('gameId', '==', gameId)
        .where('score', '>', bestScore.score)
        .get();

      // Le rang est le nombre de scores supérieurs + 1
      return snapshot.size + 1;
    } catch (error) {
      console.error('Erreur lors de la récupération du rang:', error);

      // Utiliser les données factices en cas d'erreur
      // Obtenir le meilleur score de l'utilisateur
      const userScores = this.mockScores
        .filter(score => score.username === username && score.gameId === gameId)
        .sort((a, b) => b.score - a.score);

      if (userScores.length === 0) {
        return null;
      }

      const bestScore = userScores[0];

      // Compter le nombre de scores supérieurs
      const betterScores = this.mockScores
        .filter(score => score.gameId === gameId && score.score > bestScore.score);

      // Le rang est le nombre de scores supérieurs + 1
      return betterScores.length + 1;
    }
  }

  /**
   * Formate un score pour l'affichage
   * @param {Object} score - Objet score
   * @returns {Object} - Score formaté
   */
  formatScore(score) {
    return {
      ...score,
      formattedDate: this.formatDate(score.timestamp),
      formattedScore: this.formatNumber(score.score)
    };
  }

  /**
   * Formate une date pour l'affichage
   * @param {Date} date - Date à formater
   * @returns {string} - Date formatée
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formate un nombre pour l'affichage
   * @param {number} number - Nombre à formater
   * @returns {string} - Nombre formaté
   */
  formatNumber(number) {
    return number.toLocaleString();
  }
}

export default LeaderboardService;
