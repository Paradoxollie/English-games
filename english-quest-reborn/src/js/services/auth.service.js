/**
 * Service d'authentification simplifié pour English Quest Reborn
 * Gère l'inscription et la connexion des élèves sans email
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    collection
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    databaseURL: "https://english-games-41017-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.appspot.com",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections Firestore
const COLLECTIONS = {
    USERS: 'users'
};

// État de l'authentification
let authState = {
    initialized: false,
    isAuthenticated: false,
    user: null,
    profile: null,
    loading: true,
    error: null
};

// Écouteurs d'événements
const authStateListeners = new Set();

/**
 * Initialise le service d'authentification
 */
export function initAuth() {
    if (authState.initialized) {
        return authState;
    }

    // Vérifier si un utilisateur est déjà connecté
    const userId = localStorage.getItem('userId');
    if (userId) {
        // Récupérer les informations de l'utilisateur
        getDoc(doc(db, COLLECTIONS.USERS, userId))
            .then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    authState.isAuthenticated = true;
                    authState.user = { uid: userId };
                    authState.profile = { ...userData, id: userId };
                } else {
                    // Si l'utilisateur n'existe plus, le déconnecter
                    localStorage.removeItem('userId');
                }
                authState.loading = false;
                dispatchAuthEvent();
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du profil:', error);
                authState.error = error;
                authState.loading = false;
                dispatchAuthEvent();
            });
    } else {
        authState.loading = false;
        dispatchAuthEvent();
    }

    authState.initialized = true;
    return authState;
}

/**
 * Crée un nouveau profil utilisateur
 */
async function createUserProfile(username, password) {
    try {
        // Vérifier si le nom d'utilisateur est déjà pris
        const available = await isUsernameAvailable(username);
        if (!available) {
            throw { code: 'username-taken', message: 'Ce nom d\'utilisateur est déjà pris' };
        }

        const userProfile = {
            username: username,
            password: password, // Note: Dans un environnement de production, il faudrait hasher le mot de passe
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            level: 1,
            xp: 0,
            coins: 0,
            isAdmin: false,
            avatar: {
                head: 'default_boy',
                body: 'default_boy',
                accessory: 'none',
                background: 'default'
            },
            skins: {
                head: ['default_boy'],
                body: ['default_boy'],
                accessory: ['none'],
                background: ['default']
            },
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                coursesCompleted: 0,
                totalScore: 0,
                timeSpent: 0
            },
            settings: {
                theme: 'dark',
                notifications: true,
                sound: true,
                music: true,
                language: 'fr'
            }
        };

        // Créer un nouveau document utilisateur avec un ID généré
        const userRef = doc(collection(db, COLLECTIONS.USERS));
        await setDoc(userRef, userProfile);
        
        // Mettre à jour l'état d'authentification
        authState.isAuthenticated = true;
        authState.user = { uid: userRef.id };
        authState.profile = { ...userProfile, id: userRef.id };
        
        // Stocker l'ID utilisateur dans le localStorage
        localStorage.setItem('userId', userRef.id);
        
        dispatchAuthEvent();
        return userRef.id;
    } catch (error) {
        console.error('Erreur lors de la création du profil:', error);
        throw error;
    }
}

/**
 * Vérifie si un nom d'utilisateur est disponible
 */
async function isUsernameAvailable(username) {
    try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    } catch (error) {
        console.error('Erreur lors de la vérification du nom d\'utilisateur:', error);
        throw error;
    }
}

/**
 * Inscrit un nouvel utilisateur
 */
export async function register(username, password) {
    try {
        // Validation des données
        if (!username || username.length < 3) {
            throw { code: 'invalid-username', message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' };
        }
        if (!password || password.length < 6) {
            throw { code: 'invalid-password', message: 'Le mot de passe doit contenir au moins 6 caractères' };
        }

        // Créer le profil utilisateur dans Firestore
        const userId = await createUserProfile(username, password);
        return userId;
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        throw error;
    }
}

/**
 * Connecte un utilisateur
 */
export async function login(username, password) {
    try {
        // Rechercher l'utilisateur par son nom d'utilisateur
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw { code: 'user-not-found', message: 'Nom d\'utilisateur ou mot de passe incorrect' };
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // Vérifier le mot de passe
        if (userData.password !== password) {
            throw { code: 'wrong-password', message: 'Nom d\'utilisateur ou mot de passe incorrect' };
        }

        // Mettre à jour la dernière connexion
        await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
            lastLogin: serverTimestamp()
        });

        // Mettre à jour l'état d'authentification
        authState.isAuthenticated = true;
        authState.user = { uid: userDoc.id };
        authState.profile = { ...userData, id: userDoc.id };
        
        // Stocker l'ID utilisateur dans le localStorage
        localStorage.setItem('userId', userDoc.id);
        
        dispatchAuthEvent();
        return userDoc.id;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
    }
}

/**
 * Déconnecte l'utilisateur
 */
export async function logout() {
    try {
        // Réinitialiser l'état d'authentification
        authState.isAuthenticated = false;
        authState.user = null;
        authState.profile = null;
        
        // Supprimer l'ID utilisateur du localStorage
        localStorage.removeItem('userId');
        
        dispatchAuthEvent();
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
    }
}

/**
 * Récupère l'état actuel de l'authentification
 */
export function getAuthState() {
    return { ...authState };
}

/**
 * Ajoute un écouteur pour les changements d'état d'authentification
 */
export function onAuthStateChange(listener) {
    authStateListeners.add(listener);
    return () => authStateListeners.delete(listener);
}

/**
 * Notifie tous les écouteurs d'un changement d'état
 */
function dispatchAuthEvent() {
    const state = { ...authState };
    authStateListeners.forEach(listener => listener(state));
}

// Exporter les fonctions et objets
export {
    db,
    COLLECTIONS
};

// Initialiser le service d'authentification
initAuth();
