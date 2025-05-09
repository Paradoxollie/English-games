/**
 * Service de gestion des jeux
 * Gère les données et la logique des jeux
 */

import { games as mockGames, courses as mockCourses } from '../data/mock-data.js';

class GameService {
  constructor(firebase, authService) {
    this.db = firebase ? firebase.firestore() : null;
    this.authService = authService;
    this.games = [];
    this.courses = [];
  }

  /**
   * Initialise le service
   * @returns {Promise} - Promesse résolue lorsque l'initialisation est terminée
   */
  async init() {
    try {
      // Charger les jeux et les cours
      await Promise.all([
        this.loadGames(),
        this.loadCourses()
      ]);

      return {
        games: this.games,
        courses: this.courses
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service de jeu:', error);

      // Utiliser des données factices en cas d'erreur
      this.games = mockGames;
      this.courses = mockCourses;

      return {
        games: this.games,
        courses: this.courses
      };
    }
  }

  /**
   * Charge les jeux depuis Firestore ou utilise des données factices
   * @returns {Promise<Array>} - Promesse résolue avec les jeux
   */
  async loadGames() {
    try {
      // En mode développement, utiliser directement les données factices
      if (!this.db) {
        this.games = mockGames;
        return this.games;
      }

      const snapshot = await this.db.collection('games')
        .orderBy('order')
        .get();

      this.games = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return this.games;
    } catch (error) {
      console.error('Erreur lors du chargement des jeux:', error);

      // Utiliser des données factices en cas d'erreur
      this.games = mockGames;
      return this.games;
    }
  }

  /**
   * Charge les cours depuis Firestore ou utilise des données factices
   * @returns {Promise<Array>} - Promesse résolue avec les cours
   */
  async loadCourses() {
    try {
      // En mode développement, utiliser directement les données factices
      if (!this.db) {
        this.courses = mockCourses;
        return this.courses;
      }

      const snapshot = await this.db.collection('courses')
        .orderBy('order')
        .get();

      this.courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return this.courses;
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);

      // Utiliser des données factices en cas d'erreur
      this.courses = mockCourses;
      return this.courses;
    }
  }

  /**
   * Obtient un jeu par son ID
   * @param {string} gameId - ID du jeu
   * @returns {Object|null} - Jeu ou null si non trouvé
   */
  getGameById(gameId) {
    return this.games.find(game => game.id === gameId) || null;
  }

  /**
   * Obtient un cours par son ID
   * @param {string} courseId - ID du cours
   * @returns {Object|null} - Cours ou null si non trouvé
   */
  getCourseById(courseId) {
    return this.courses.find(course => course.id === courseId) || null;
  }

  /**
   * Obtient les jeux par catégorie
   * @param {string} category - Catégorie des jeux
   * @returns {Array} - Jeux de la catégorie
   */
  getGamesByCategory(category) {
    return this.games.filter(game => game.category === category);
  }

  /**
   * Obtient les cours par niveau
   * @param {string} level - Niveau des cours
   * @returns {Array} - Cours du niveau
   */
  getCoursesByLevel(level) {
    return this.courses.filter(course => course.level === level);
  }

  /**
   * Obtient les données de jeu pour un utilisateur
   * @param {string} gameId - ID du jeu
   * @returns {Promise<Object|null>} - Données de jeu ou null
   */
  async getUserGameData(gameId) {
    if (!this.authService || !this.authService.isLoggedIn() || !this.authService.hasProfile()) {
      return null;
    }

    try {
      const uid = this.authService.currentUser.uid;
      const doc = await this.db.collection('userGameData')
        .doc(`${uid}_${gameId}`)
        .get();

      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de jeu:', error);
      return null;
    }
  }

  /**
   * Enregistre les données de jeu pour un utilisateur
   * @param {string} gameId - ID du jeu
   * @param {Object} data - Données à enregistrer
   * @returns {Promise<Object>} - Promesse résolue avec les données enregistrées
   */
  async saveUserGameData(gameId, data) {
    if (!this.authService || !this.authService.isLoggedIn() || !this.authService.hasProfile()) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const uid = this.authService.currentUser.uid;
      const docId = `${uid}_${gameId}`;

      // Vérifier si les données existent déjà
      const doc = await this.db.collection('userGameData').doc(docId).get();

      const gameData = {
        uid,
        gameId,
        updatedAt: new Date(),
        ...data
      };

      if (doc.exists) {
        // Mettre à jour les données existantes
        await this.db.collection('userGameData').doc(docId).update(gameData);
      } else {
        // Créer de nouvelles données
        gameData.createdAt = new Date();
        await this.db.collection('userGameData').doc(docId).set(gameData);
      }

      return {
        id: docId,
        ...gameData
      };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données de jeu:', error);
      throw error;
    }
  }

  /**
   * Obtient les données de secours pour les jeux
   * @returns {Array} - Jeux de secours
   */
  getBackupGames() {
    return [
      {
        id: 'speed-verb-challenge',
        title: 'Speed Verb Challenge',
        description: 'Test your knowledge of irregular verbs! Type as many verbs as you can in 90 seconds!',
        image: './assets/images/speed-challenge.webp',
        url: './speed-verb-challenge.html',
        difficulty: 'legendary',
        tags: ['Verbs', 'Time Trial', 'Grammar'],
        icon: '⚔️',
        order: 1,
        category: 'grammar'
      },
      {
        id: 'word-memory-game',
        title: 'Word Memory Game',
        description: 'Challenge your memory and vocabulary! Match pairs of words and their meanings.',
        image: './assets/images/word-memory-game.webp',
        url: './word-memory-game.html',
        difficulty: 'intermediate',
        tags: ['Vocabulary', 'Memory', 'Fun'],
        icon: '🎯',
        order: 2,
        category: 'vocabulary'
      },
      {
        id: 'memory-matrix',
        title: 'Memory Matrix',
        description: 'Train your spatial memory with this grid-based challenge. Remember the patterns!',
        image: './assets/images/matrix-game.webp',
        url: './memory-matrix.html',
        difficulty: 'hard',
        tags: ['Memory', 'Pattern', 'Focus'],
        icon: '🧩',
        order: 3,
        category: 'memory'
      },
      {
        id: 'lost-in-migration',
        title: 'Lost in Migration',
        description: 'Guide the birds in the right direction while learning English directions and commands!',
        image: './assets/images/lost-in-migration.webp',
        url: './lost-in-migration.html',
        difficulty: 'easy',
        tags: ['Directions', 'Focus', 'Fun'],
        icon: '🦅',
        order: 4,
        category: 'focus'
      },
      {
        id: 'brew-your-words',
        title: 'Brew Your Words',
        description: 'Mix and match ingredients to create magical potions while learning new vocabulary!',
        image: './assets/images/brew-your-words.webp',
        url: './brew-your-words.html',
        difficulty: 'intermediate',
        tags: ['Vocabulary', 'Creative', 'Magic'],
        icon: '🧪',
        order: 5,
        category: 'vocabulary'
      },
      {
        id: 'enigma-scroll',
        title: 'Enigma Scroll',
        description: 'Uncover the mysteries of the enchanted scroll! Test your English skills by solving magical word puzzles in this epic fantasy adventure!',
        image: './assets/images/enigma-scroll.webp',
        url: './enigma-scroll-nature.html',
        difficulty: 'epic',
        tags: ['Puzzles', 'Vocabulary', 'Adventure'],
        icon: '📜',
        order: 6,
        category: 'adventure'
      },
      {
        id: 'whisper-trials',
        title: 'Whisper Trials',
        description: 'Test your listening skills in this atmospheric sound-based challenge!',
        image: './assets/images/whisper-trials.webp',
        url: './whisper-trials.html',
        difficulty: 'legendary',
        tags: ['Listening', 'Focus', 'Immersive'],
        icon: '👂',
        order: 7,
        category: 'listening'
      },
      {
        id: 'word-bubbles',
        title: 'Word Bubbles',
        description: 'Challenge your typing and vocabulary skills! Type the correct words as they fall before time runs out.',
        image: './assets/images/word-bubbles.webp',
        url: './wow-bubbles.html',
        difficulty: 'rare',
        tags: ['Typing', 'Speed', 'Vocabulary'],
        icon: '🫧',
        order: 8,
        category: 'typing'
      },
      {
        id: 'echoes-of-lexicon',
        title: 'Echoes of Lexicon',
        description: 'Journey through a mystical world where words have power. Build your vocabulary!',
        image: './assets/images/echoes-lexicon.webp',
        url: './echoes-of-lexicon.html',
        difficulty: 'hard',
        tags: ['Vocabulary', 'Adventure', 'Story'],
        icon: '📚',
        order: 9,
        category: 'adventure'
      }
    ];
  }

  /**
   * Obtient les données de secours pour les cours
   * @returns {Array} - Cours de secours
   */
  getBackupCourses() {
    return [
      {
        id: 'conditional',
        title: 'The Conditional',
        description: 'Master the different forms and usage of the conditional with this comprehensive guide.',
        image: './assets/images/conditionnel-course.webp',
        url: './conditional-course.html',
        level: 'advanced',
        tags: ['Grammar', 'Advanced', 'Conditional'],
        icon: '🎯',
        order: 1
      },
      {
        id: 'superlative',
        title: 'The Superlative',
        description: 'Learn the art of comparison and reach the pinnacle of excellence with superlatives.',
        image: './assets/images/superlative.webp',
        url: './superlative.html',
        level: 'intermediate',
        tags: ['Grammar', 'Comparison', 'Superlative'],
        icon: '📊',
        order: 2
      },
      {
        id: 'comparative',
        title: 'Comparative',
        description: 'Face off against fierce grammar guardians and claim your place as the true Grammar Champion.',
        image: './assets/images/comparative.webp',
        url: './comparative.html',
        level: 'intermediate',
        tags: ['Grammar', 'Comparison', 'Comparative'],
        icon: '⚖️',
        order: 3
      },
      {
        id: 'since-for',
        title: 'Since and For',
        description: 'Prove your worth as the ultimate Time Master in the realm of English.',
        image: './assets/images/for-since.webp',
        url: './for-and-since.html',
        level: 'intermediate',
        tags: ['Time', 'Duration', 'Prepositions'],
        icon: '⏳',
        order: 4
      },
      {
        id: 'modals',
        title: 'Modals Mastery',
        description: 'Devenez le Maître des Arcanes Modaux et manipulez la puissance des verbes anglais.',
        image: './assets/images/modaux.webp',
        url: './modaux.html',
        level: 'advanced',
        tags: ['Modals', 'Verbs', 'Advanced'],
        icon: '🔮',
        order: 5
      }
    ];
  }
}

export default GameService;
