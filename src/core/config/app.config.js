/**
 * Configuration principale de l'application
 */

// Configuration par défaut
const defaultConfig = {
  appName: 'English Quest Reborn',
  version: '1.0.0',
  debug: false,
  apiEndpoint: 'https://api.english-quest.com',
  assetsPath: '/src/assets',
  defaultTheme: 'medieval-dark',
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en'],
  features: {
    battles: true,
    leaderboard: true,
    achievements: true,
    quests: true,
    guilds: false,
    tournaments: false
  },
  game: {
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'expert', 'legendary'],
    xpMultipliers: {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2,
      expert: 3,
      legendary: 5
    },
    levelUpFormula: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
    maxLevel: 100
  },
  ui: {
    animations: true,
    sounds: true,
    tooltips: true,
    darkMode: true,
    highContrast: false,
    fontSize: 'medium'
  },
  storage: {
    prefix: 'eq_',
    useLocalStorage: true,
    useSessionStorage: true,
    useIndexedDB: true
  }
};

// Instance de configuration
let appConfig = { ...defaultConfig };

/**
 * Initialise la configuration de l'application
 * @param {Object} userConfig - Configuration fournie par l'utilisateur
 * @returns {Object} La configuration fusionnée
 */
export function initializeApp(userConfig = {}) {
  // Fusionner la configuration par défaut avec celle de l'utilisateur
  appConfig = {
    ...defaultConfig,
    ...userConfig,
    features: {
      ...defaultConfig.features,
      ...(userConfig.features || {})
    },
    game: {
      ...defaultConfig.game,
      ...(userConfig.game || {})
    },
    ui: {
      ...defaultConfig.ui,
      ...(userConfig.ui || {})
    },
    storage: {
      ...defaultConfig.storage,
      ...(userConfig.storage || {})
    }
  };

  // Appliquer les configurations spécifiques à l'environnement
  if (import.meta.env.DEV) {
    appConfig.debug = true;
  }

  // Initialiser les variables CSS globales
  updateCSSVariables();

  return appConfig;
}

/**
 * Met à jour les variables CSS en fonction de la configuration
 */
function updateCSSVariables() {
  const root = document.documentElement;
  
  // Thème
  root.dataset.theme = appConfig.defaultTheme;
  
  // Mode sombre
  if (appConfig.ui.darkMode) {
    root.classList.add('dark-mode');
  } else {
    root.classList.remove('dark-mode');
  }
  
  // Contraste élevé
  if (appConfig.ui.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
  
  // Taille de police
  root.dataset.fontSize = appConfig.ui.fontSize;
}

/**
 * Récupère la configuration actuelle
 * @returns {Object} La configuration actuelle
 */
export function getConfig() {
  return { ...appConfig };
}

/**
 * Met à jour la configuration
 * @param {Object} newConfig - Nouvelles valeurs de configuration
 * @returns {Object} La configuration mise à jour
 */
export function updateConfig(newConfig) {
  appConfig = {
    ...appConfig,
    ...newConfig,
    features: {
      ...appConfig.features,
      ...(newConfig.features || {})
    },
    game: {
      ...appConfig.game,
      ...(newConfig.game || {})
    },
    ui: {
      ...appConfig.ui,
      ...(newConfig.ui || {})
    },
    storage: {
      ...appConfig.storage,
      ...(newConfig.storage || {})
    }
  };
  
  // Mettre à jour les variables CSS
  updateCSSVariables();
  
  return appConfig;
}

export default {
  initializeApp,
  getConfig,
  updateConfig
};
