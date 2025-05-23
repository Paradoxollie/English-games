/**
 * Configuration Firebase pour English Quest Reborn
 * Ce fichier centralise toutes les configurations Firebase
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Configuration Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.appspot.com",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP"
};

console.log('Initialisation de Firebase avec la configuration:', firebaseConfig);

let app, auth, db;

try {
    app = initializeApp(firebaseConfig);
    console.log('Application Firebase initialisée avec succès');
    
    auth = getAuth(app);
    console.log('Service d\'authentification initialisé');
    
    db = getFirestore(app);
    console.log('Service Firestore initialisé');
} catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase:', error);
    throw error;
}

export { app, auth, db };

// Collections Firestore
export const collections = {
    // Collections principales
    USERS: 'users',                    // Collection principale des utilisateurs
    PROFILES: 'profiles',              // Collection des profils utilisateurs (ancienne)
    GAME_SCORES: 'game_scores',        // Collection standardisée pour tous les scores
    
    // Collections de scores spécifiques (anciennes)
    SPEED_VERB_SCORES: 'speed_verb_scores',
    ENIGMA_SCROLL_SCORES: 'enigma_scroll_scores',
    WORD_MEMORY_SCORES: 'word_memory_game_scores',
    MATRIX_SCORES: 'memory_matrix_scores',
    MIGRATION_SCORES: 'lost_in_migration_scores',
    BREW_WORDS_SCORES: 'brewYourWordsScores',
    WHISPER_TRIALS_SCORES: 'whisper_trials_scores',
    WORD_BUBBLES_SCORES: 'word_bubbles_scores',
    ECHOES_LEXICON_SCORES: 'echoes_lexicon_scores',
    
    // Autres collections
    GAMES: 'games',
    COURSES: 'courses',
    PROGRESS: 'progress',
    LEADERBOARDS: 'leaderboards',
    BATTLES: 'battles',
    ACHIEVEMENTS: 'achievements',
    QUESTS: 'quests',
    STATS: 'stats',
    VISITS: 'visits'
};

// Clés localStorage
export const LOCALSTORAGE_KEYS = {
    // Clés principales
    USERS: 'english_quest_users',
    CURRENT_USER: 'english_quest_current_user',
    
    // Clés anciennes (pour compatibilité)
    LEGACY_USERS: 'users',
    LEGACY_CURRENT_USER: 'currentUser',
    USER_PROFILE: 'userProfile',
    
    // Clés de scores locaux
    LOCAL_SCORES: 'localScores',
    SPEED_VERB_SCORES: 'speedVerbScores',
    ENIGMA_SCROLL_SCORES: 'enigmaScrollScores',
    WORD_BUBBLES_SCORES: 'wordBubblesScores'
};

// Structure des données utilisateur
export const userStructure = {
    // Informations de base
    userId: '',                // ID unique de l'utilisateur (généré par Firebase)
    username: '',              // Nom d'utilisateur (unique)
    displayName: '',           // Nom d'affichage (peut être identique au nom d'utilisateur)
    isAdmin: false,            // Indique si l'utilisateur est administrateur
    
    // Progression
    level: 1,                  // Niveau de l'utilisateur
    xp: 0,                     // Points d'expérience
    coins: 0,                // Pièces d'or
    
    // Statistiques
    stats: {
        gamesPlayed: 0,        // Nombre de parties jouées
        gamesWon: 0,           // Nombre de parties gagnées
        coursesCompleted: 0,   // Nombre de cours terminés
        totalScore: 0,         // Score total
        totalXp: 0,            // XP total gagné
        timeSpent: 0           // Temps passé sur le site
    },
    
    // Préférences
    settings: {
        theme: 'dark',         // Thème de l'interface
        notifications: true,   // Notifications activées
        sound: true,           // Son activé
        music: true,           // Musique activée
        language: 'fr'         // Langue de l'interface
    },
    
    // Inventaire
    inventory: {
        skins: {
            head: ['default_boy', 'default_girl'],  // Skins de tête
            body: ['default_boy', 'default_girl'],  // Skins de corps
            accessory: ['none'],                    // Accessoires
            background: ['default']                 // Arrière-plans
        },
        items: []              // Objets
    },
    
    // Succès
    achievements: [],          // Succès débloqués
    
    // Dates
    createdAt: '',             // Date de création du compte
    lastLogin: '',             // Date de dernière connexion
    
    // Autres
    hasSelectedGender: false   // Indique si l'utilisateur a choisi son genre
};

// Structure des données de score
export const scoreStructure = {
    // Informations de base
    gameId: '',                // Identifiant du jeu
    userId: '',                // Identifiant de l'utilisateur
    username: '',              // Nom d'utilisateur
    score: 0,                  // Score obtenu
    timestamp: '',             // Date et heure
    
    // Informations supplémentaires
    difficulty: 'normal',      // Difficulté du jeu
    level: 1,                  // Niveau du jeu
    time: 0,                   // Temps de jeu
    
    // Données spécifiques au jeu
    gameData: {}               // Données spécifiques au jeu
};

// Vérifier si un utilisateur est administrateur
export function isUserAdmin(user) {
    if (!user) return false;
    
    // Vérifier si l'utilisateur est Ollie
    if (user.username && user.username.toLowerCase() === 'ollie') {
        return true;
    }
    
    // Vérifier le flag isAdmin
    return user.isAdmin === true;
}

export default {
    firebaseConfig,
    collections,
    LOCALSTORAGE_KEYS,
    userStructure,
    scoreStructure,
    isUserAdmin
};
