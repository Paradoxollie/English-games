/**
 * Service d'authentification unifié pour English Quest Reborn
 * Gère l'état d'authentification et les redirections de manière cohérente
 */

// État global de l'authentification
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
    USER: 'english_quest_current_user',
    USER_ID: 'english_quest_user_id'
};

// Pages publiques qui ne nécessitent pas d'authentification
const PUBLIC_PAGES = [
    'index.html',
    'login.html',
    'register.html',
    'new-index.html',
    ''
];

/**
 * Initialise le service d'authentification
 */
export function initAuth() {
    if (authState.initialized) {
        return authState;
    }

    console.log('Initialisation du service d\'authentification');

    // Vérifier si un utilisateur est déjà connecté
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (storedUser && userId) {
        try {
            const userProfile = JSON.parse(storedUser);
            authState.isAuthenticated = true;
            authState.user = { uid: userId };
            authState.profile = userProfile;
        } catch (error) {
            console.error('Erreur lors du parsing du profil utilisateur:', error);
            clearAuthState();
        }
    }

    authState.loading = false;
    authState.initialized = true;
    dispatchAuthEvent();

    return authState;
}

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean} True si l'utilisateur est authentifié
 */
export function isAuthenticated() {
    return authState.isAuthenticated && authState.profile !== null;
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
    return authState.profile !== null;
}

/**
 * Met à jour le profil utilisateur
 * @param {Object} profileData - Les données du profil à mettre à jour
 * @returns {Promise<Object>} Le profil mis à jour
 */
export async function updateProfile(profileData) {
    if (!isAuthenticated()) {
        throw new Error('Utilisateur non authentifié');
    }

    try {
        // Mettre à jour le profil local
        const updatedProfile = {
            ...authState.profile,
            ...profileData,
            updatedAt: new Date()
        };

        // Sauvegarder dans le localStorage
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedProfile));

        // Mettre à jour l'état
        authState.profile = updatedProfile;
        dispatchAuthEvent();

        return updatedProfile;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        throw error;
    }
}

/**
 * Déconnecte l'utilisateur
 */
export function logout() {
    clearAuthState();
    window.location.href = 'index.html';
}

/**
 * Vérifie si la page actuelle nécessite une authentification
 * @returns {boolean} True si l'authentification est requise
 */
export function requiresAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    return !PUBLIC_PAGES.includes(currentPage);
}

/**
 * Redirige vers la page de connexion si nécessaire
 */
export function checkAuthAndRedirect() {
    if (requiresAuth() && !isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

/**
 * Nettoie l'état d'authentification
 */
function clearAuthState() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    authState.isAuthenticated = false;
    authState.user = null;
    authState.profile = null;
    authState.error = null;
}

/**
 * Déclenche un événement de changement d'état d'authentification
 */
function dispatchAuthEvent() {
    const event = new CustomEvent('auth-state-changed', {
        detail: { ...authState }
    });
    document.dispatchEvent(event);
}

// Initialiser l'authentification au chargement
initAuth();

// Vérifier l'authentification et rediriger si nécessaire
checkAuthAndRedirect(); 