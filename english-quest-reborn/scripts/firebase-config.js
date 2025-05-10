/**
 * English Quest - Configuration Firebase
 * Centralise la configuration Firebase pour toute l'application
 */

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
  authDomain: "english-games-41017.firebaseapp.com",
  projectId: "english-games-41017",
  storageBucket: "english-games-41017.appspot.com",
  messagingSenderId: "452279652544",
  appId: "1:452279652544:web:916f93e0ab29183e739d25",
  measurementId: "G-RMCQTMKDVP",
  databaseURL: "https://english-games-41017-default-rtdb.europe-west1.firebasedatabase.app"
};

// Collections Firestore
const collections = {
  USERS: 'users',
  PROFILES: 'profiles',
  GAMES: 'games',
  COURSES: 'courses',
  PROGRESS: 'progress',
  SCORES: 'game_scores', // Collection standardisée pour tous les scores
  LEADERBOARDS: 'leaderboards',
  BATTLES: 'battles',
  ACHIEVEMENTS: 'achievements',
  QUESTS: 'quests',
  STATS: 'stats',
  VISITS: 'visits'
};

// Noms des clés localStorage
const LOCALSTORAGE_KEYS = {
  USERS: 'english_quest_users',
  CURRENT_USER: 'english_quest_current_user',
  LEGACY_USERS: 'users',
  LEGACY_CURRENT_USER: 'currentUser',
  USER_PROFILE: 'userProfile'
};

// Structure des documents utilisateurs
const userStructure = {
  // Informations de base
  username: '',
  displayName: '',
  email: null,
  createdAt: null, // Timestamp serveur
  lastLogin: null, // Timestamp serveur

  // Progression
  level: 1,
  xp: 0,
  coins: 100,

  // Statistiques
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    coursesCompleted: 0,
    totalScore: 0,
    totalXp: 0,
    timeSpent: 0
  },

  // Progression
  completedGames: [],
  completedCourses: [],

  // Préférences
  settings: {
    theme: 'dark',
    notifications: true,
    sound: true,
    music: true,
    language: 'fr'
  }
};

// Configuration de l'authentification
const authConfig = {
  // Méthodes d'authentification activées
  methods: {
    anonymous: true,
    emailPassword: false,
    google: false,
    facebook: false
  },

  // Stockage des informations d'authentification
  persistence: 'local', // 'local', 'session', 'none'

  // Redirection après authentification
  redirectUrl: 'new-index.html'
};

// Initialiser Firebase
function initializeFirebase() {
  if (typeof firebase !== 'undefined') {
    try {
      // Vérifier si Firebase est déjà initialisé
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
      } else {
        console.log("Firebase already initialized");
      }

      // Initialiser Firestore
      const db = firebase.firestore();

      // Initialiser Auth
      const auth = firebase.auth();

      // Initialiser Analytics si disponible
      let analytics = null;
      if (typeof firebase.analytics === 'function') {
        analytics = firebase.analytics();
      }

      // Rendre les instances disponibles globalement
      window.db = db;
      window.auth = auth;
      window.analytics = analytics;

      return { db, auth, analytics };
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      return null;
    }
  } else {
    console.error("Firebase SDK not loaded");
    return null;
  }
}

// Vérifier si l'utilisateur est administrateur
function isUserAdmin(user) {
  if (!user) return false;

  // Vérifier si l'utilisateur est Ollie
  if (user.username && user.username.toLowerCase() === 'ollie') {
    return true;
  }

  // Vérifier le flag isAdmin
  return user.isAdmin === true;
}

// Récupérer l'utilisateur actuel depuis localStorage
function getCurrentUser() {
  try {
    // Essayer d'abord la nouvelle clé
    let currentUser = localStorage.getItem(LOCALSTORAGE_KEYS.CURRENT_USER);
    if (currentUser) {
      return JSON.parse(currentUser);
    }

    // Essayer ensuite l'ancienne clé
    currentUser = localStorage.getItem(LOCALSTORAGE_KEYS.LEGACY_CURRENT_USER);
    if (currentUser) {
      return JSON.parse(currentUser);
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur actuel:", error);
    return null;
  }
}

// Récupérer un utilisateur par son ID depuis Firebase
async function getUserById(userId) {
  if (!window.db) {
    initializeFirebase();
  }

  try {
    const userDoc = await window.db.collection(collections.USERS).doc(userId).get();

    if (userDoc.exists) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }

    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur (ID: ${userId}):`, error);
    return null;
  }
}

// Récupérer un utilisateur par son nom d'utilisateur depuis Firebase
async function getUserByUsername(username) {
  if (!window.db) {
    initializeFirebase();
  }

  try {
    const usersSnapshot = await window.db.collection(collections.USERS)
      .where('username', '==', username)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }

    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur (Username: ${username}):`, error);
    return null;
  }
}

// Mettre à jour un utilisateur dans Firebase
async function updateUser(userId, userData) {
  if (!window.db) {
    initializeFirebase();
  }

  try {
    await window.db.collection(collections.USERS).doc(userId).update({
      ...userData,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Utilisateur mis à jour (ID: ${userId})`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur (ID: ${userId}):`, error);
    return false;
  }
}

// Enregistrer un score dans Firebase
async function saveScore(gameId, score, userId, username) {
  if (!window.db) {
    initializeFirebase();
  }

  try {
    // Créer un nouveau document dans la collection des scores
    await window.db.collection(collections.SCORES).add({
      gameId: gameId,
      score: score,
      userId: userId,
      username: username,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Score enregistré pour ${username} (${gameId}: ${score})`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du score pour ${username} (${gameId}: ${score}):`, error);
    return false;
  }
}

// Récupérer les meilleurs scores pour un jeu
async function getTopScores(gameId, limit = 10) {
  if (!window.db) {
    initializeFirebase();
  }

  try {
    const scoresSnapshot = await window.db.collection(collections.SCORES)
      .where('gameId', '==', gameId)
      .orderBy('score', 'desc')
      .limit(limit)
      .get();

    const scores = [];

    scoresSnapshot.forEach(doc => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return scores;
  } catch (error) {
    console.error(`Erreur lors de la récupération des meilleurs scores pour ${gameId}:`, error);
    return [];
  }
}

// Rendre les configurations et fonctions disponibles globalement
window.firebaseConfig = firebaseConfig;
window.collections = collections;
window.userStructure = userStructure;
window.authConfig = authConfig;
window.LOCALSTORAGE_KEYS = LOCALSTORAGE_KEYS;
window.initializeFirebase = initializeFirebase;
window.isUserAdmin = isUserAdmin;
window.getCurrentUser = getCurrentUser;
window.getUserById = getUserById;
window.getUserByUsername = getUserByUsername;
window.updateUser = updateUser;
window.saveScore = saveScore;
window.getTopScores = getTopScores;

// Initialiser Firebase automatiquement
document.addEventListener('DOMContentLoaded', function() {
  initializeFirebase();
});
