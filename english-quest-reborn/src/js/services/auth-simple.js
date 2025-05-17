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
    USERS: 'users',
    SCORES: 'game_scores'
};

// État de l'authentification
let authState = {
    initialized: false,
    isAuthenticated: false,
    user: null,
    profile: null
};

/**
 * Initialise le service d'authentification
 */
export function initAuth() {
    console.log('Initialisation du service d\'authentification simplifié');

    if (authState.initialized) {
        return authState;
    }

    // Mettre à jour l'état
    authState.initialized = true;

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
        } catch (error) {
            console.error('Erreur lors du parsing du profil utilisateur:', error);
            localStorage.removeItem('english_quest_current_user');
        }
    }

    return authState;
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function logout() {
    console.log('Déconnexion de l\'utilisateur');

    // Réinitialiser l'état
    authState.isAuthenticated = false;
    authState.user = null;
    authState.profile = null;

    // Supprimer l'utilisateur du localStorage
    localStorage.removeItem('english_quest_current_user');

    // Rediriger vers la page d'accueil
    window.location.href = 'index.html';
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
                        body: 'default_boy'
                    },
                    skins: {
                        head: ['default_boy', 'default_girl', 'bear'],
                        body: ['default_boy', 'default_girl', 'bear']
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
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la date de connexion:', error);
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

        return profile;
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
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

// Exporter les fonctions et objets
export {
    db,
    COLLECTIONS
};

// Initialiser le service d'authentification
initAuth();
