/**
 * Service d'authentification RGPD-compliant
 * Permet l'authentification anonyme et la création de profils utilisateurs
 * sans nécessiter d'adresse email
 */

class AuthService {
  constructor(firebase) {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.currentUser = null;
    this.userProfile = null;
    
    // Écouter les changements d'état d'authentification
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile();
      } else {
        this.userProfile = null;
      }
    });
  }
  
  /**
   * Connecte l'utilisateur de manière anonyme
   * @returns {Promise} Promesse résolue avec l'utilisateur connecté
   */
  async signInAnonymously() {
    try {
      const userCredential = await this.auth.signInAnonymously();
      return userCredential.user;
    } catch (error) {
      console.error('Erreur lors de la connexion anonyme:', error);
      throw error;
    }
  }
  
  /**
   * Vérifie si un nom d'utilisateur est disponible
   * @param {string} username - Le nom d'utilisateur à vérifier
   * @returns {Promise<boolean>} Promesse résolue avec true si le nom est disponible
   */
  async isUsernameAvailable(username) {
    try {
      const normalizedUsername = username.toLowerCase().trim();
      const snapshot = await this.db.collection('userProfiles')
        .where('usernameLower', '==', normalizedUsername)
        .get();
      
      return snapshot.empty;
    } catch (error) {
      console.error('Erreur lors de la vérification du nom d\'utilisateur:', error);
      throw error;
    }
  }
  
  /**
   * Crée un profil utilisateur avec un nom d'utilisateur unique
   * @param {string} username - Le nom d'utilisateur choisi
   * @param {Object} additionalData - Données supplémentaires facultatives
   * @returns {Promise} Promesse résolue avec le profil créé
   */
  async createUserProfile(username, additionalData = {}) {
    if (!this.currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    
    try {
      // Vérifier si le nom d'utilisateur est disponible
      const isAvailable = await this.isUsernameAvailable(username);
      if (!isAvailable) {
        throw new Error('Ce nom d\'utilisateur est déjà pris');
      }
      
      // Créer le profil utilisateur
      const normalizedUsername = username.toLowerCase().trim();
      const userProfile = {
        uid: this.currentUser.uid,
        username: username.trim(),
        usernameLower: normalizedUsername,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        // Données RGPD minimales
        settings: {
          notifications: false,
          shareStats: true,
          appearInLeaderboard: true
        },
        // Données de jeu
        stats: {
          totalGamesPlayed: 0,
          totalScore: 0,
          highestScore: 0,
          achievements: []
        },
        // Données supplémentaires
        ...additionalData
      };
      
      // Enregistrer dans Firestore
      await this.db.collection('userProfiles').doc(this.currentUser.uid).set(userProfile);
      
      this.userProfile = userProfile;
      return userProfile;
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  }
  
  /**
   * Charge le profil de l'utilisateur actuel
   * @returns {Promise} Promesse résolue avec le profil utilisateur
   */
  async loadUserProfile() {
    if (!this.currentUser) {
      return null;
    }
    
    try {
      const doc = await this.db.collection('userProfiles').doc(this.currentUser.uid).get();
      
      if (doc.exists) {
        this.userProfile = doc.data();
        return this.userProfile;
      } else {
        this.userProfile = null;
        return null;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour le profil de l'utilisateur
   * @param {Object} data - Les données à mettre à jour
   * @returns {Promise} Promesse résolue lorsque la mise à jour est terminée
   */
  async updateUserProfile(data) {
    if (!this.currentUser || !this.userProfile) {
      throw new Error('Utilisateur non connecté ou profil non chargé');
    }
    
    try {
      // Si le nom d'utilisateur est modifié, vérifier sa disponibilité
      if (data.username && data.username !== this.userProfile.username) {
        const isAvailable = await this.isUsernameAvailable(data.username);
        if (!isAvailable) {
          throw new Error('Ce nom d\'utilisateur est déjà pris');
        }
        data.usernameLower = data.username.toLowerCase().trim();
      }
      
      // Mettre à jour dans Firestore
      await this.db.collection('userProfiles').doc(this.currentUser.uid).update({
        ...data,
        updatedAt: new Date()
      });
      
      // Recharger le profil
      await this.loadUserProfile();
      
      return this.userProfile;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }
  
  /**
   * Déconnecte l'utilisateur
   * @returns {Promise} Promesse résolue lorsque la déconnexion est terminée
   */
  async signOut() {
    try {
      await this.auth.signOut();
      this.currentUser = null;
      this.userProfile = null;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }
  
  /**
   * Supprime le compte utilisateur et toutes ses données
   * @returns {Promise} Promesse résolue lorsque la suppression est terminée
   */
  async deleteAccount() {
    if (!this.currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    
    try {
      // Supprimer le profil
      await this.db.collection('userProfiles').doc(this.currentUser.uid).delete();
      
      // Supprimer les scores
      const scoresSnapshot = await this.db.collection('scores')
        .where('uid', '==', this.currentUser.uid)
        .get();
      
      const batch = this.db.batch();
      scoresSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      // Supprimer le compte
      await this.currentUser.delete();
      
      this.currentUser = null;
      this.userProfile = null;
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      throw error;
    }
  }
  
  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean} True si l'utilisateur est connecté
   */
  isLoggedIn() {
    return !!this.currentUser;
  }
  
  /**
   * Vérifie si l'utilisateur a un profil
   * @returns {boolean} True si l'utilisateur a un profil
   */
  hasProfile() {
    return !!this.userProfile;
  }
  
  /**
   * Obtient le nom d'utilisateur actuel
   * @returns {string|null} Le nom d'utilisateur ou null
   */
  getUsername() {
    return this.userProfile ? this.userProfile.username : null;
  }
  
  /**
   * Enregistre un score pour l'utilisateur
   * @param {string} gameId - L'identifiant du jeu
   * @param {number} score - Le score obtenu
   * @param {Object} gameData - Données supplémentaires du jeu
   * @returns {Promise} Promesse résolue avec le score enregistré
   */
  async saveScore(gameId, score, gameData = {}) {
    if (!this.currentUser || !this.userProfile) {
      throw new Error('Utilisateur non connecté ou profil non chargé');
    }
    
    try {
      // Créer l'objet score
      const scoreData = {
        uid: this.currentUser.uid,
        username: this.userProfile.username,
        gameId,
        score,
        timestamp: new Date(),
        ...gameData
      };
      
      // Enregistrer dans Firestore
      const scoreRef = await this.db.collection('scores').add(scoreData);
      
      // Mettre à jour les statistiques de l'utilisateur
      const userStats = this.userProfile.stats || {};
      const updates = {
        'stats.totalGamesPlayed': (userStats.totalGamesPlayed || 0) + 1,
        'stats.totalScore': (userStats.totalScore || 0) + score,
        'stats.highestScore': Math.max(userStats.highestScore || 0, score),
        'lastGamePlayed': gameId,
        'lastPlayedAt': new Date()
      };
      
      await this.db.collection('userProfiles').doc(this.currentUser.uid).update(updates);
      
      // Recharger le profil
      await this.loadUserProfile();
      
      return { id: scoreRef.id, ...scoreData };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du score:', error);
      throw error;
    }
  }
  
  /**
   * Obtient les meilleurs scores pour un jeu
   * @param {string} gameId - L'identifiant du jeu
   * @param {number} limit - Le nombre maximum de scores à récupérer
   * @returns {Promise<Array>} Promesse résolue avec les scores
   */
  async getTopScores(gameId, limit = 10) {
    try {
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
      throw error;
    }
  }
  
  /**
   * Obtient les scores de l'utilisateur actuel
   * @param {string} gameId - L'identifiant du jeu (optionnel)
   * @param {number} limit - Le nombre maximum de scores à récupérer
   * @returns {Promise<Array>} Promesse résolue avec les scores
   */
  async getUserScores(gameId = null, limit = 10) {
    if (!this.currentUser) {
      return [];
    }
    
    try {
      let query = this.db.collection('scores')
        .where('uid', '==', this.currentUser.uid)
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
      throw error;
    }
  }
}

export default AuthService;
