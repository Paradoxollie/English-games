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
  SCORES: 'scores',
  LEADERBOARDS: 'leaderboards',
  BATTLES: 'battles',
  ACHIEVEMENTS: 'achievements',
  QUESTS: 'quests',
  STATS: 'stats',
  VISITS: 'visits'
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

// Rendre les configurations et fonctions disponibles globalement
window.firebaseConfig = firebaseConfig;
window.collections = collections;
window.userStructure = userStructure;
window.authConfig = authConfig;
window.initializeFirebase = initializeFirebase;

// Initialiser Firebase automatiquement
document.addEventListener('DOMContentLoaded', function() {
  initializeFirebase();
});
