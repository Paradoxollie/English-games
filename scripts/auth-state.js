/**
 * English Quest - Gestion de l'état d'authentification
 * Surveille l'état de connexion de l'utilisateur et met à jour l'interface en conséquence
 */

// Variables globales
let auth, db;
let authState = {
  isAuthenticated: false,
  user: null,
  profile: null,
  loading: true
};

// Écouteurs d'événements
const authListeners = [];

// Initialiser l'authentification
document.addEventListener('DOMContentLoaded', function() {
  try {
    // S'assurer que Firebase est initialisé
    if (typeof firebase === 'undefined') {
      console.error("Firebase SDK not loaded");
      return;
    }

    // Initialiser Firebase si ce n'est pas déjà fait
    if (!firebase.apps || !firebase.apps.length) {
      // Utiliser la configuration globale ou une configuration par défaut
      const config = window.firebaseConfig || {
        apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
        authDomain: "english-games-41017.firebaseapp.com",
        projectId: "english-games-41017",
        storageBucket: "english-games-41017.appspot.com",
        messagingSenderId: "452279652544",
        appId: "1:452279652544:web:916f93e0ab29183e739d25",
        measurementId: "G-RMCQTMKDVP",
        databaseURL: "https://english-games-41017-default-rtdb.europe-west1.firebasedatabase.app"
      };

      firebase.initializeApp(config);
      console.log("Firebase initialized in auth-state.js");
    }

    // Récupérer les instances Firebase
    auth = firebase.auth();
    db = firebase.firestore();

    console.log("Auth initialized:", !!auth);

    // Initialiser la surveillance de l'état d'authentification
    if (auth) {
      initAuthStateMonitoring();
    } else {
      console.error("Firebase auth not available");
    }
  } catch (error) {
    console.error("Error initializing Firebase in auth-state.js:", error);
  }
});

/**
 * Ajoute un écouteur pour les changements d'état d'authentification
 * @param {Function} listener - Fonction appelée lors d'un changement d'état
 */
function addAuthStateListener(listener) {
  authListeners.push(listener);

  // Appeler immédiatement avec l'état actuel
  if (!authState.loading) {
    listener(authState);
  }
}

/**
 * Notifie tous les écouteurs d'un changement d'état
 */
function notifyListeners() {
  authListeners.forEach(listener => listener(authState));
}

// Rendre les fonctions disponibles globalement
window.addAuthStateListener = addAuthStateListener;

/**
 * Récupère le profil utilisateur depuis Firestore
 * @param {string} uid - ID de l'utilisateur
 * @returns {Promise<Object>} Profil utilisateur
 */
async function getUserProfile(uid) {
  try {
    console.log("Récupération du profil utilisateur pour:", uid);
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      console.log("Profil utilisateur trouvé");
      return doc.data();
    }
    console.log("Profil utilisateur non trouvé");

    // Si le profil n'existe pas, créer un profil par défaut
    const defaultProfile = {
      username: "Utilisateur" + Math.floor(Math.random() * 10000),
      displayName: "Utilisateur",
      isAnonymous: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      level: 1,
      xp: 0,
      coins: 100,
      completedGames: [],
      completedCourses: []
    };

    // Enregistrer le profil par défaut
    await db.collection('users').doc(uid).set(defaultProfile);
    console.log("Profil utilisateur par défaut créé");

    return defaultProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Initialise la surveillance de l'état d'authentification
 */
function initAuthStateMonitoring() {
  try {
    if (!auth) {
      console.error("Auth n'est pas initialisé dans initAuthStateMonitoring");
      return;
    }

    console.log("Initialisation de la surveillance de l'état d'authentification");

    auth.onAuthStateChanged(async user => {
      console.log("État d'authentification changé:", user ? "Utilisateur connecté" : "Utilisateur déconnecté");

      authState.loading = true;
      notifyListeners();

      if (user) {
        // Utilisateur connecté
        authState.isAuthenticated = true;
        authState.user = user;

        // Récupérer le profil utilisateur
        try {
          authState.profile = await getUserProfile(user.uid);
        } catch (error) {
          console.error("Erreur lors de la récupération du profil utilisateur:", error);
          authState.profile = null;
        }
      } else {
        // Utilisateur déconnecté
        authState.isAuthenticated = false;
        authState.user = null;
        authState.profile = null;
      }

      authState.loading = false;
      notifyListeners();

      // Mettre à jour l'interface utilisateur
      updateUI();
    }, error => {
      console.error("Erreur dans onAuthStateChanged:", error);
    });

    console.log("Surveillance de l'état d'authentification initialisée");
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la surveillance de l'état d'authentification:", error);
  }
}

/**
 * Met à jour l'interface utilisateur en fonction de l'état d'authentification
 */
function updateUI() {
  // Mettre à jour les boutons de connexion/inscription
  const loginButtons = document.querySelectorAll('.btn-login');
  const registerButtons = document.querySelectorAll('.btn-register');
  const userMenus = document.querySelectorAll('.user-menu');

  if (authState.isAuthenticated && authState.user) {
    // Utilisateur connecté
    loginButtons.forEach(button => {
      button.textContent = 'Mon Profil';
      button.href = 'profile.html';
    });

    registerButtons.forEach(button => {
      button.textContent = 'Déconnexion';
      button.href = '#';
      button.addEventListener('click', logout);
    });

    // Mettre à jour le menu utilisateur si présent
    userMenus.forEach(menu => {
      // Vérifier si le menu contient déjà un élément avec la classe 'user-avatar'
      if (!menu.querySelector('.user-avatar')) {
        // Créer un avatar utilisateur
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.textContent = authState.user.displayName ? authState.user.displayName.charAt(0).toUpperCase() : 'U';

        // Ajouter l'avatar au menu
        menu.prepend(avatar);
      }
    });
  } else {
    // Utilisateur déconnecté
    loginButtons.forEach(button => {
      button.textContent = 'Connexion';
      button.href = 'auth.html?tab=login';
    });

    registerButtons.forEach(button => {
      button.textContent = 'Inscription';
      button.href = 'auth.html?tab=register';
    });

    // Supprimer les avatars utilisateur
    document.querySelectorAll('.user-avatar').forEach(avatar => {
      avatar.remove();
    });
  }
}

/**
 * Déconnecte l'utilisateur
 */
async function logout() {
  if (auth) {
    try {
      await auth.signOut();
      window.location.href = 'new-index.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}

// Rendre les fonctions disponibles globalement
window.logout = logout;
window.authState = authState;
