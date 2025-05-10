/**
 * Service d'authentification pour English Quest Reborn
 * Gère l'inscription, la connexion et la gestion des utilisateurs
 */

import { v4 as uuidv4 } from 'uuid';
import { getAuth, signInAnonymous, signOutUser, subscribeToAuthChanges } from '@core/services/firebase.service';
import { setDocument, getDocument, updateDocument } from '@core/services/firebase.service';
import { collections } from '@core/config/firebase.config';
import { getConfig } from '@core/config/app.config';
import { logAnalyticsEvent } from '@core/services/firebase.service';

// État de l'authentification
let authState = {
  initialized: false,
  isAuthenticated: false,
  user: null,
  profile: null,
  loading: false,
  error: null
};

// Callbacks pour les changements d'état
const authStateListeners = new Set();

/**
 * Initialise le service d'authentification
 * @returns {Promise<Object>} L'état d'authentification initial
 */
export async function initializeAuth() {
  try {
    authState.loading = true;
    notifyListeners();

    // S'abonner aux changements d'état d'authentification
    subscribeToAuthChanges(handleAuthStateChange);

    // Vérifier s'il y a un utilisateur déjà connecté
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      await handleAuthStateChange(currentUser);
    } else {
      // Si l'authentification anonyme est activée, connecter automatiquement
      if (getConfig().authConfig?.methods?.anonymous) {
        await signInAnonymous();
      } else {
        authState.loading = false;
        authState.initialized = true;
        notifyListeners();
      }
    }

    return authState;
  } catch (error) {
    console.error('Failed to initialize auth service:', error);
    authState.error = error.message;
    authState.loading = false;
    authState.initialized = true;
    notifyListeners();
    throw error;
  }
}

/**
 * Gère les changements d'état d'authentification
 * @param {Object} user - L'utilisateur Firebase
 */
async function handleAuthStateChange(user) {
  try {
    if (user) {
      // Utilisateur connecté
      authState.isAuthenticated = true;
      authState.user = user;

      // Récupérer ou créer le profil utilisateur
      const profile = await getOrCreateUserProfile(user.uid);
      authState.profile = profile;

      // Enregistrer l'événement de connexion
      logAnalyticsEvent('login', {
        method: user.isAnonymous ? 'anonymous' : 'custom',
        user_id: user.uid
      });
    } else {
      // Utilisateur déconnecté
      authState.isAuthenticated = false;
      authState.user = null;
      authState.profile = null;
    }

    authState.loading = false;
    authState.initialized = true;
    notifyListeners();
  } catch (error) {
    console.error('Error handling auth state change:', error);
    authState.error = error.message;
    authState.loading = false;
    authState.initialized = true;
    notifyListeners();
  }
}

/**
 * Récupère ou crée le profil utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Le profil utilisateur
 */
async function getOrCreateUserProfile(userId) {
  try {
    // Vérifier si le profil existe déjà
    const existingProfile = await getDocument(collections.PROFILES, userId);

    if (existingProfile) {
      return existingProfile;
    }

    // Créer un nouveau profil
    const randomUsername = `Player${Math.floor(Math.random() * 10000)}`;
    const newProfile = {
      userId,
      username: randomUsername,
      displayName: '',
      avatar: '/src/assets/images/default-avatar.png',
      level: 1,
      xp: 0,
      coins: 0,
      gems: 0,
      inventory: [],
      achievements: [],
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        battlesParticipated: 0,
        battlesWon: 0,
        questsCompleted: 0,
        totalScore: 0,
        totalXp: 0,
        timeSpent: 0
      },
      settings: {
        theme: getConfig().defaultTheme,
        notifications: true,
        sound: true,
        music: true,
        language: getConfig().defaultLanguage
      },
      // SÉCURITÉ CRITIQUE: S'assurer que les nouveaux utilisateurs ne sont jamais administrateurs
      // Seul Ollie peut être administrateur
      isAdmin: false, // Par défaut, aucun utilisateur n'est administrateur
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Enregistrer le profil dans Firestore
    const savedProfile = await setDocument(collections.PROFILES, userId, newProfile);

    // Enregistrer l'événement de création de profil
    logAnalyticsEvent('sign_up', {
      method: 'anonymous',
      user_id: userId
    });

    return savedProfile;
  } catch (error) {
    console.error('Error getting or creating user profile:', error);
    throw error;
  }
}

/**
 * Crée un compte utilisateur avec un nom d'utilisateur
 * @param {string} username - Nom d'utilisateur
 * @returns {Promise<Object>} L'utilisateur créé
 */
export async function createUserWithUsername(username) {
  try {
    authState.loading = true;
    notifyListeners();

    // Vérifier si l'utilisateur est déjà connecté
    if (authState.isAuthenticated) {
      throw new Error('User already authenticated');
    }

    // Connecter anonymement
    const user = await signInAnonymous();

    // Créer le profil avec le nom d'utilisateur
    const profile = await getOrCreateUserProfile(user.uid);

    // Préparer les données de mise à jour
    const updateData = {
      username,
      displayName: username
    };

    // SÉCURITÉ CRITIQUE: Vérifier si c'est Ollie pour lui donner des privilèges d'administrateur
    // Seul Ollie peut être administrateur
    if (username.toLowerCase() === 'ollie') {
      console.log("Compte Ollie détecté, attribution des privilèges administrateur");
      updateData.isAdmin = true;
    } else {
      // S'assurer explicitement que les autres utilisateurs ne sont pas administrateurs
      updateData.isAdmin = false;
      console.log(`Compte ${username} créé sans privilèges administrateur`);
    }

    // Mettre à jour le profil avec les données préparées
    await updateDocument(collections.PROFILES, user.uid, updateData);

    // Mettre à jour le profil local
    authState.profile = {
      ...profile,
      username,
      displayName: username
    };

    authState.loading = false;
    notifyListeners();

    return { user, profile: authState.profile };
  } catch (error) {
    console.error('Error creating user with username:', error);
    authState.error = error.message;
    authState.loading = false;
    notifyListeners();
    throw error;
  }
}

/**
 * Met à jour le profil utilisateur
 * @param {Object} profileData - Données du profil à mettre à jour
 * @returns {Promise<Object>} Le profil mis à jour
 */
export async function updateUserProfile(profileData) {
  try {
    if (!authState.isAuthenticated || !authState.user) {
      throw new Error('User not authenticated');
    }

    authState.loading = true;
    notifyListeners();

    // Vérifier si l'utilisateur essaie de modifier les droits d'administrateur
    const profileDataToUpdate = { ...profileData };

    // SÉCURITÉ CRITIQUE: Protection contre la modification des droits d'administrateur
    if ('isAdmin' in profileDataToUpdate) {
      // Récupérer le profil actuel pour vérifier le nom d'utilisateur
      const currentProfile = await getDocument(collections.PROFILES, authState.user.uid);

      // Seul Ollie peut être administrateur, et on ne peut pas lui retirer ce droit
      if (currentProfile && currentProfile.username && currentProfile.username.toLowerCase() === 'ollie') {
        // Forcer isAdmin à true pour Ollie
        profileDataToUpdate.isAdmin = true;
        console.log("Protection des privilèges administrateur pour Ollie");
      } else {
        // Supprimer la tentative de modification des droits d'administrateur
        delete profileDataToUpdate.isAdmin;
        console.log("Tentative non autorisée de modification des droits d'administrateur bloquée");
      }
    }

    // Mettre à jour le profil dans Firestore
    const updatedProfile = await updateDocument(
      collections.PROFILES,
      authState.user.uid,
      profileDataToUpdate
    );

    // Mettre à jour le profil local
    authState.profile = updatedProfile;
    authState.loading = false;
    notifyListeners();

    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    authState.error = error.message;
    authState.loading = false;
    notifyListeners();
    throw error;
  }
}

/**
 * Déconnecte l'utilisateur actuel
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    if (!authState.isAuthenticated) {
      return;
    }

    authState.loading = true;
    notifyListeners();

    await signOutUser();

    // La mise à jour de l'état sera gérée par le listener d'authentification
  } catch (error) {
    console.error('Error logging out:', error);
    authState.error = error.message;
    authState.loading = false;
    notifyListeners();
    throw error;
  }
}

/**
 * Génère un identifiant unique pour un utilisateur anonyme
 * @returns {string} Identifiant unique
 */
export function generateAnonymousId() {
  return uuidv4();
}

/**
 * Récupère l'état d'authentification actuel
 * @returns {Object} État d'authentification
 */
export function getAuthState() {
  return { ...authState };
}

/**
 * S'abonne aux changements d'état d'authentification
 * @param {Function} listener - Fonction à appeler lors des changements
 * @returns {Function} Fonction pour se désabonner
 */
export function subscribeToAuthState(listener) {
  authStateListeners.add(listener);

  // Appeler immédiatement avec l'état actuel
  listener({ ...authState });

  // Retourner une fonction pour se désabonner
  return () => {
    authStateListeners.delete(listener);
  };
}

/**
 * Notifie tous les listeners des changements d'état
 */
function notifyListeners() {
  const state = { ...authState };
  authStateListeners.forEach(listener => {
    try {
      listener(state);
    } catch (error) {
      console.error('Error in auth state listener:', error);
    }
  });
}

export default {
  initializeAuth,
  createUserWithUsername,
  updateUserProfile,
  logout,
  getAuthState,
  subscribeToAuthState
};
