/**
 * Configuration Firebase pour English Quest Reborn
 */

// Configuration Firebase
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBXBZb_JnN_MxRub9QgH9FsZyUz_ZLFSxs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "english-quest.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "english-quest",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "english-quest.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RMCQTMKDVP"
};

// Collections Firestore
export const collections = {
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

// Règles de sécurité Firestore
export const securityRules = {
  // Les utilisateurs peuvent lire leur propre profil
  userProfile: 'request.auth != null && request.auth.uid == userId',
  
  // Les scores sont publics en lecture mais seulement modifiables par l'utilisateur
  scores: {
    read: true,
    write: 'request.auth != null && request.auth.uid == userId'
  },
  
  // Les statistiques globales sont publiques en lecture
  stats: {
    read: true,
    write: false
  }
};

// Configuration de l'authentification
export const authConfig = {
  // Durée de session en millisecondes (24 heures)
  sessionDuration: 24 * 60 * 60 * 1000,
  
  // Méthodes d'authentification activées
  methods: {
    anonymous: true,
    emailPassword: false,
    google: false,
    facebook: false,
    twitter: false,
    github: false
  },
  
  // URL de redirection après authentification
  redirectUrl: '/profile',
  
  // URL de redirection après déconnexion
  signOutRedirectUrl: '/',
  
  // Stockage des informations d'authentification
  persistence: 'local', // 'local', 'session', 'none'
};

export default {
  firebaseConfig,
  collections,
  securityRules,
  authConfig
};
