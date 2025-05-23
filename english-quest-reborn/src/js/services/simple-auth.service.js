/**
 * Service d'authentification simplifié pour English Quest Reborn
 * Utilise uniquement Firestore et localStorage pour gérer l'authentification
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';

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
const analytics = getAnalytics(app);

// Collections Firestore
const COLLECTIONS = {
    USERS: 'users',
    SCORES: 'game_scores'
};

// État de l'authentification
let authState = {
    initialized: false,
    isAuthenticated: false,
    user: null,
    profile: null,
    loading: false,
    error: null
};

/**
 * Initialise le service d'authentification
 */
export function initAuth() {
    console.log('Initialisation du service d\'authentification simplifié');

    if (authState.initialized) {
        console.log('Service d\'authentification déjà initialisé');
        return authState;
    }

    // Mettre à jour l'état
    authState.initialized = true;
    authState.loading = true;

    // Vérifier si l'utilisateur est déjà connecté (localStorage)
    const storedUser = localStorage.getItem('english_quest_current_user');

    if (storedUser) {
        try {
            const userProfile = JSON.parse(storedUser);
            console.log('Utilisateur trouvé dans localStorage:', userProfile);

            // Mettre à jour l'état
            authState.isAuthenticated = true;
            authState.user = { uid: userProfile.id || userProfile.userId };
            authState.profile = userProfile;
            authState.loading = false;

            // Vérifier si le profil existe toujours dans Firestore
            setTimeout(async () => {
                try {
                    const userId = userProfile.id || userProfile.userId;
                    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));

                    if (userDoc.exists()) {
                        console.log('Profil utilisateur vérifié dans Firestore');

                        // Mettre à jour la date de dernière connexion
                        try {
                            await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
                                lastLogin: serverTimestamp()
                            });
                            console.log('Date de dernière connexion mise à jour');
                        } catch (updateError) {
                            console.error('Erreur lors de la mise à jour de la date de connexion:', updateError);
                            // Continuer malgré l'erreur
                        }
                    } else {
                        console.warn('Profil utilisateur non trouvé dans Firestore, recréation...');

                        // Recréer le profil dans Firestore
                        try {
                            await setDoc(doc(db, COLLECTIONS.USERS, userId), {
                                ...userProfile,
                                userId: userId,
                                lastLogin: serverTimestamp()
                            });
                            console.log('Profil utilisateur recréé dans Firestore');
                        } catch (setDocError) {
                            console.error('Erreur lors de la recréation du profil:', setDocError);
                            // Continuer malgré l'erreur
                        }
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification du profil:', error);
                    // Continuer malgré l'erreur
                }
            }, 1000); // Délai pour éviter de bloquer le chargement initial
        } catch (error) {
            console.error('Erreur lors du parsing du profil utilisateur:', error);

            // Réinitialiser l'état
            authState.isAuthenticated = false;
            authState.user = null;
            authState.profile = null;
            authState.loading = false;

            // Supprimer l'utilisateur du localStorage
            localStorage.removeItem('english_quest_current_user');
        }
    } else {
        // Aucun utilisateur connecté
        authState.isAuthenticated = false;
        authState.user = null;
        authState.profile = null;
        authState.loading = false;

        console.log('Aucun utilisateur connecté');
    }

    // Déclencher l'événement d'authentification
    dispatchAuthEvent();

    return authState;
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function logout() {
    console.log('Déconnexion de l\'utilisateur');

    try {
        // Réinitialiser l'état
        authState.isAuthenticated = false;
        authState.user = null;
        authState.profile = null;

        // Supprimer l'utilisateur du localStorage
        localStorage.removeItem('english_quest_current_user');

        // Déclencher l'événement d'authentification
        dispatchAuthEvent();

        console.log('Utilisateur déconnecté avec succès');

        // Rediriger vers la page d'accueil
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
    }
}

/**
 * Connecte un utilisateur existant
 * @param {string} username - Nom d'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Promise<Object>} - Profil utilisateur
 */
export async function login(username, password) {
    console.log('Connexion de l\'utilisateur:', username);

    try {
        // Rechercher l'utilisateur par nom d'utilisateur
        const userQuery = query(
            collection(db, COLLECTIONS.USERS),
            where('username', '==', username)
        );

        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
            // Si c'est Ollie et que le compte n'existe pas, on le crée
            if (username.toLowerCase() === 'ollie' && (password === 'admin' || password === 'Imyets182!')) {
                console.log('Création du compte administrateur Ollie');
                
                // Générer un ID utilisateur unique
                const userId = 'admin_' + Date.now();
                
                // Créer le profil administrateur
                const userProfile = {
                    userId: userId,
                    username: 'Ollie',
                    password: password,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    level: 30,
                    xp: 3000,
                    coins: 10000,
                    isAdmin: true,
                    avatar: {
                        head: 'default_boy',
                        body: 'default_boy',
                        accessory: 'none',
                        background: 'default'
                    },
                    skins: {
                        head: ['default_boy', 'default_girl', 'bear'],
                        body: ['default_boy', 'default_girl', 'bear'],
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
                
                // Enregistrer le profil dans Firestore
                await setDoc(doc(db, COLLECTIONS.USERS, userId), userProfile);
                
                console.log('Profil administrateur créé avec succès');
                
                // Mettre à jour l'état
                const profile = {
                    ...userProfile,
                    id: userId
                };
                
                authState.isAuthenticated = true;
                authState.user = { uid: userId };
                authState.profile = profile;
                
                // Stocker l'utilisateur dans localStorage
                localStorage.setItem('english_quest_current_user', JSON.stringify(profile));
                
                // Déclencher l'événement d'authentification
                dispatchAuthEvent();
                
                return profile;
            } else {
                throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
            }
        }

        // Récupérer le document utilisateur
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Vérifier le mot de passe
        if (userData.password !== password) {
            throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
        }

        console.log('Utilisateur trouvé:', userData);

        // Mettre à jour la date de dernière connexion
        try {
            await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
                lastLogin: serverTimestamp()
            });
            console.log('Date de dernière connexion mise à jour');
        } catch (updateError) {
            console.error('Erreur lors de la mise à jour de la date de connexion:', updateError);
            // Continuer malgré l'erreur
        }

        // Mettre à jour l'état
        const profile = {
            ...userData,
            id: userDoc.id
        };

        authState.isAuthenticated = true;
        authState.user = { uid: userDoc.id };
        authState.profile = profile;

        // Stocker l'utilisateur dans localStorage
        localStorage.setItem('english_quest_current_user', JSON.stringify(profile));

        // Déclencher l'événement d'authentification
        dispatchAuthEvent();

        return profile;
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
    }
}

/**
 * Inscrit un nouvel utilisateur
 * @param {string} username - Nom d'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Promise<Object>} - Profil utilisateur
 */
export async function register(username, password) {
    console.log('Inscription d\'un nouvel utilisateur:', username);

    try {
        // Vérifier si le nom d'utilisateur est disponible
        const userQuery = query(
            collection(db, COLLECTIONS.USERS),
            where('username', '==', username)
        );

        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
            throw new Error('Ce nom d\'utilisateur est déjà utilisé');
        }

        // Générer un ID utilisateur unique
        const userId = 'user_' + Date.now();

        // Créer le profil utilisateur
        const userProfile = {
            userId: userId,
            username: username,
            password: password,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            level: 1,
            xp: 0,
            coins: 0,
            isAdmin: username.toLowerCase() === 'ollie',
            avatar: {
                head: 'default_boy',
                body: 'default_boy',
                accessory: 'none',
                background: 'default'
            },
            skins: {
                head: ['default_boy', 'default_girl'],
                body: ['default_boy', 'default_girl'],
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

        // Si c'est Ollie, débloquer tous les skins
        if (username.toLowerCase() === 'ollie') {
            userProfile.skins.head.push('bear');
            userProfile.skins.body.push('bear');
            userProfile.coins = 10000;
            userProfile.level = 30;
            userProfile.xp = 3000;
        }

        // Enregistrer le profil dans Firestore
        await setDoc(doc(db, COLLECTIONS.USERS, userId), userProfile);

        console.log('Profil utilisateur créé avec succès');

        // Mettre à jour l'état
        const profile = {
            ...userProfile,
            id: userId
        };

        authState.isAuthenticated = true;
        authState.user = { uid: userId };
        authState.profile = profile;

        // Stocker l'utilisateur dans localStorage
        localStorage.setItem('english_quest_current_user', JSON.stringify(profile));

        // Déclencher l'événement d'authentification
        dispatchAuthEvent();

        // Enregistrer l'événement d'inscription
        try {
            logEvent(analytics, 'sign_up', {
                method: 'custom'
            });
        } catch (analyticsError) {
            console.error('Erreur lors de l\'enregistrement de l\'événement d\'inscription:', analyticsError);
            // Ignorer l'erreur
        }

        return profile;
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        throw error;
    }
}

/**
 * Récupère l'état d'authentification actuel
 * @returns {Object} - État d'authentification
 */
export function getAuthState() {
    return authState;
}

/**
 * Déclenche un événement d'authentification
 */
function dispatchAuthEvent() {
    const event = new CustomEvent('auth-state-changed', {
        detail: authState
    });

    document.dispatchEvent(event);
}

// Exporter les fonctions et objets
export {
    db,
    analytics,
    COLLECTIONS
};

// Initialiser le service d'authentification
initAuth();
