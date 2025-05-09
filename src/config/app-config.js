/**
 * Configuration globale de l'application English Quest
 */
const AppConfig = {
  // Informations sur le site
  site: {
    name: 'English Quest',
    description: 'Learn English through interactive games and courses',
    version: '2.0.0',
    language: 'fr',
    supportedLanguages: ['fr', 'en']
  },
  
  // Thèmes et couleurs
  theme: {
    colors: {
      gold: '#c9aa71',
      blue: '#71a9c9',
      green: '#71c99a',
      red: '#c97171',
      purple: '#9a71c9',
      dark: '#0f172a',
      light: '#ffffff'
    },
    fonts: {
      primary: 'Cinzel, serif',
      secondary: 'MedievalSharp, cursive',
      text: 'Spectral, serif'
    }
  },
  
  // Paramètres Firebase
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
  },
  
  // Paramètres des jeux
  games: {
    defaultTimeLimit: 90,
    leaderboardLimit: 10,
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'legendary']
  },
  
  // Paramètres utilisateur
  user: {
    storageKeys: {
      username: 'eq_username',
      preferences: 'eq_preferences',
      progress: 'eq_progress',
      lastLogin: 'eq_last_login'
    },
    defaultSettings: {
      soundEnabled: true,
      musicEnabled: true,
      highContrast: false,
      textSize: 'medium'
    }
  },
  
  // Paramètres de performance
  performance: {
    imageLazyLoadOffset: '100px',
    cacheExpiration: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
    maxCacheSize: 50 * 1024 * 1024 // 50 MB
  },
  
  // Paramètres d'accessibilité
  accessibility: {
    minContrastRatio: 4.5,
    focusOutlineWidth: '3px',
    focusOutlineColor: '#71a9c9',
    animationReducedMotion: 'reduce'
  }
};

export default AppConfig;
