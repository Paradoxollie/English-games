/**
 * Service d'authentification unifié pour English Quest Reborn
 * Gère l'état d'authentification et les redirections de manière cohérente
 */

import { auth, db } from '../../config/firebase.config.js';
import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from 'firebase/firestore';

// État global d'authentification
const authState = {
    isAuthenticated: false,
    user: null,
    profile: null,
    loading: true,
    error: null,
    initialized: false
};

// Clés de stockage
const STORAGE_KEYS = {
    USER: 'user',
    PROFILE: 'profile'
};

// Pages publiques qui ne nécessitent pas d'authentification
const PUBLIC_PAGES = [
    '/',
    '/index.html',
    '/login.html',
    '/register.html',
    '/about.html',
    '/contact.html'
];

/**
 * Initialise le service d'authentification
 */
export async function initAuth() {
    if (authState.initialized) return;

    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Utilisateur connecté
                authState.user = user;
                authState.isAuthenticated = true;

                // Charger le profil utilisateur
                try {
                    const profileDoc = await getDoc(doc(db, 'users', user.uid));
                    if (profileDoc.exists()) {
                        authState.profile = profileDoc.data();
                        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(authState.profile));
                    }
                } catch (error) {
                    console.error('Erreur lors du chargement du profil:', error);
                    authState.error = error;
                }
            } else {
                // Utilisateur déconnecté
                authState.user = null;
                authState.profile = null;
                authState.isAuthenticated = false;
                localStorage.removeItem(STORAGE_KEYS.USER);
                localStorage.removeItem(STORAGE_KEYS.PROFILE);
            }

            authState.loading = false;
            authState.initialized = true;
            dispatchAuthEvent();
            resolve();
        });
    });
}

/**
 * Connecte un utilisateur
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe
 * @returns {Promise<Object>} L'utilisateur connecté
 */
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
    }
}

/**
 * Crée un nouveau compte utilisateur
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe
 * @param {string} username - Le nom d'utilisateur
 * @returns {Promise<Object>} L'utilisateur créé
 */
export async function register(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Créer le profil utilisateur
        const profileData = {
            uid: user.uid,
            email: user.email,
            username: username,
            createdAt: new Date().toISOString(),
            level: 1,
            xp: 0,
            coins: 0,
            currentAvatar: 'default',
            unlockedAvatars: ['default'],
            settings: {
                notifications: true,
                sound: true,
                music: true
            }
        };

        await setDoc(doc(db, 'users', user.uid), profileData);
        return user;
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        throw error;
    }
}

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean} True si l'utilisateur est authentifié
 */
export function isAuthenticated() {
    return authState.isAuthenticated;
}

/**
 * Récupère l'état d'authentification actuel
 * @returns {Object} L'état d'authentification
 */
export function getAuthState() {
    return { ...authState };
}

/**
 * Récupère le profil de l'utilisateur actuel
 * @returns {Object|null} Le profil utilisateur ou null
 */
export function getCurrentProfile() {
    return authState.profile;
}

/**
 * Vérifie si l'utilisateur a un profil
 * @returns {boolean} True si l'utilisateur a un profil
 */
export function hasProfile() {
    return !!authState.profile;
}

/**
 * Met à jour le profil utilisateur
 * @param {Object} profileData - Les données du profil à mettre à jour
 * @returns {Promise<Object>} Le profil mis à jour
 */
export async function updateProfile(profileData) {
    if (!authState.user) {
        throw new Error('Utilisateur non authentifié');
    }

    try {
        const userRef = doc(db, 'users', authState.user.uid);
        await updateDoc(userRef, profileData);
        
        // Mettre à jour l'état local
        authState.profile = { ...authState.profile, ...profileData };
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(authState.profile));
        
        dispatchAuthEvent();
        return authState.profile;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        throw error;
    }
}

/**
 * Déconnecte l'utilisateur
 */
export async function logout() {
    try {
        await signOut(auth);
        clearAuthState();
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
    }
}

/**
 * Vérifie si la page actuelle nécessite une authentification
 * @returns {boolean} True si l'authentification est requise
 */
export function requiresAuth() {
    const currentPath = window.location.pathname;
    return !PUBLIC_PAGES.includes(currentPath);
}

/**
 * Redirige vers la page de connexion si nécessaire
 */
export function checkAuthAndRedirect() {
    if (requiresAuth() && !isAuthenticated()) {
        window.location.href = '/login.html';
    }
}

/**
 * Nettoie l'état d'authentification
 */
function clearAuthState() {
    authState.isAuthenticated = false;
    authState.user = null;
    authState.profile = null;
    authState.error = null;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    dispatchAuthEvent();
}

/**
 * Déclenche un événement de changement d'état d'authentification
 */
function dispatchAuthEvent() {
    const event = new CustomEvent('authStateChanged', {
        detail: { ...authState }
    });
    window.dispatchEvent(event);
}

// Initialiser l'authentification et vérifier la redirection au chargement
initAuth().then(() => {
    checkAuthAndRedirect();
}); 