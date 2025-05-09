/**
 * Gestion de l'état d'authentification pour English Quest Reborn
 * Permet de récupérer le profil de l'utilisateur connecté
 */

// État global de l'authentification
window.authState = {
    isAuthenticated: false,
    profile: null,
    loading: true,
    error: null
};

/**
 * Initialise l'écouteur d'état d'authentification
 */
function initAuthStateListener() {
    console.log("Initialisation de l'écouteur d'état d'authentification");

    // Vérifier si Firebase est disponible
    if (typeof firebase === 'undefined') {
        console.error("Firebase n'est pas disponible");
        window.authState.loading = false;
        window.authState.error = "Firebase n'est pas disponible";
        return;
    }

    // Vérifier si Firebase Auth est disponible
    try {
        if (!firebase.auth) {
            console.error("Firebase Auth n'est pas disponible");
            window.authState.loading = false;
            window.authState.error = "Firebase Auth n'est pas disponible";
            return;
        }
    } catch (error) {
        console.error("Erreur lors de l'accès à Firebase Auth:", error);
        window.authState.loading = false;
        window.authState.error = "Erreur lors de l'accès à Firebase Auth";
        return;
    }

    // Écouter les changements d'état d'authentification
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log("Utilisateur connecté:", user.uid);

            // Mettre à jour l'état d'authentification
            window.authState.isAuthenticated = true;

            // Récupérer le profil de l'utilisateur depuis Firestore
            fetchUserProfile(user.uid);
        } else {
            console.log("Aucun utilisateur connecté");

            // Réinitialiser l'état d'authentification
            window.authState.isAuthenticated = false;
            window.authState.profile = null;
            window.authState.loading = false;
        }
    });
}

/**
 * Récupère le profil de l'utilisateur depuis Firestore
 * @param {string} uid - L'identifiant de l'utilisateur
 */
function fetchUserProfile(uid) {
    console.log("Récupération du profil utilisateur:", uid);

    // Vérifier si Firestore est disponible
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.error("Firestore n'est pas disponible");
        window.authState.loading = false;
        window.authState.error = "Firestore n'est pas disponible";
        return;
    }

    // Récupérer le profil depuis Firestore
    firebase.firestore().collection('users').doc(uid).get()
        .then(doc => {
            if (doc.exists) {
                console.log("Profil utilisateur récupéré avec succès");
                window.authState.profile = doc.data();
            } else {
                console.log("Aucun profil utilisateur trouvé");
                window.authState.profile = {
                    username: firebase.auth().currentUser.displayName || firebase.auth().currentUser.email.split('@')[0],
                    createdAt: new Date()
                };
            }

            window.authState.loading = false;
        })
        .catch(error => {
            console.error("Erreur lors de la récupération du profil utilisateur:", error);
            window.authState.loading = false;
            window.authState.error = error.message;
        });
}

/**
 * Récupère l'utilisateur actuellement connecté
 * @returns {Object} L'utilisateur connecté ou un utilisateur anonyme
 */
function getCurrentUser() {
    // Vérifier d'abord si un utilisateur est connecté dans localStorage (local-auth.js)
    try {
        const CURRENT_USER_KEY = 'english_quest_current_user';
        const userJson = localStorage.getItem(CURRENT_USER_KEY);

        if (userJson) {
            const localUser = JSON.parse(userJson);
            console.log("Utilisateur trouvé dans localStorage");

            if (localUser && localUser.username) {
                return {
                    uid: localUser.id || localUser.uid || 'local-' + Math.random().toString(36).substring(2, 15),
                    username: localUser.username,
                    displayName: localUser.displayName || localUser.username,
                    email: localUser.email || 'user@example.com',
                    isLocalUser: true
                };
            }
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur depuis localStorage:", error);
    }

    // Vérifier si l'utilisateur est authentifié via authState
    if (window.authState.isAuthenticated && window.authState.profile) {
        return window.authState.profile;
    }

    // Vérifier si Firebase Auth est disponible directement
    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const user = firebase.auth().currentUser;
            if (user) {
                return {
                    uid: user.uid,
                    username: user.displayName || (user.email ? user.email.split('@')[0] : 'Joueur'),
                    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Joueur'),
                    email: user.email || 'anonymous@example.com'
                };
            }
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur Firebase:", error);
    }

    // Retourner un utilisateur anonyme par défaut
    return {
        uid: 'anonymous-' + Math.random().toString(36).substring(2, 15),
        username: 'Joueur',
        displayName: 'Joueur',
        email: 'anonymous@example.com',
        isAnonymous: true
    };
}

// Rendre la fonction disponible globalement
window.getCurrentUser = getCurrentUser;

// Initialiser l'écouteur d'état d'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', initAuthStateListener);
