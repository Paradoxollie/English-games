/**
 * English Quest - Authentication Script
 * Gère la connexion et l'inscription des utilisateurs avec Firebase
 */

// Variables globales
let auth, db;

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
      console.log("Firebase initialized in auth.js");
    }

    // Récupérer les instances Firebase
    auth = firebase.auth();
    db = firebase.firestore();

    console.log("Auth initialized in auth.js:", !!auth);

    // Initialiser les écouteurs d'événements pour les formulaires
    initFormListeners();
  } catch (error) {
    console.error("Error initializing Firebase in auth.js:", error);
  }
});

// Éléments DOM
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form-container');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const passwordInput = document.getElementById('registerPassword');
const passwordStrength = document.getElementById('passwordStrength');
const strengthText = document.getElementById('strengthText');

/**
 * Initialise les écouteurs d'événements pour les formulaires
 */
function initFormListeners() {
  // Fonction pour changer d'onglet
  function switchTab(tabName) {
    // Retirer la classe active de tous les onglets et formulaires
    authTabs.forEach(t => t.classList.remove('active'));
    authForms.forEach(f => f.classList.remove('active'));

    // Ajouter la classe active à l'onglet spécifié
    const tab = document.querySelector(`.auth-tab[data-tab="${tabName}"]`);
    if (tab) {
      tab.classList.add('active');
    }

    // Afficher le formulaire correspondant
    const formId = tabName + '-form';
    const form = document.getElementById(formId);
    if (form) {
      form.classList.add('active');
    }
  }

  // Vérifier les paramètres d'URL pour l'onglet initial
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');

  if (tabParam === 'register') {
    switchTab('register');
  } else {
    switchTab('login');
  }

  // Gestion des onglets
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Initialiser les écouteurs pour les formulaires de connexion et d'inscription
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);

    // Ajouter l'écouteur pour la vérification de la force du mot de passe
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
      passwordInput.addEventListener('input', checkPasswordStrength);
    }
  }
}

/**
 * Vérifie la force du mot de passe
 */
function checkPasswordStrength() {
  if (!passwordInput || !passwordStrength || !strengthText) return;

  const password = passwordInput.value;
  let strength = 0;
  let feedback = '';

  // Longueur minimale
  if (password.length >= 8) {
    strength += 25;
  }

  // Contient des chiffres
  if (/\d/.test(password)) {
    strength += 25;
  }

  // Contient des lettres minuscules et majuscules
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    strength += 25;
  }

  // Contient des caractères spéciaux
  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 25;
  }

  // Mettre à jour la barre de progression
  passwordStrength.style.width = strength + '%';

  // Définir la couleur en fonction de la force
  if (strength < 25) {
    passwordStrength.style.backgroundColor = '#e74c3c'; // Rouge
    feedback = 'Très faible';
  } else if (strength < 50) {
    passwordStrength.style.backgroundColor = '#e67e22'; // Orange
    feedback = 'Faible';
  } else if (strength < 75) {
    passwordStrength.style.backgroundColor = '#f1c40f'; // Jaune
    feedback = 'Moyen';
  } else {
    passwordStrength.style.backgroundColor = '#2ecc71'; // Vert
    feedback = 'Fort';
  }

  strengthText.textContent = 'Force du mot de passe: ' + feedback;
}

/**
 * Gère la soumission du formulaire de connexion
 * @param {Event} e - Événement de soumission
 */
async function handleLogin(e) {
  e.preventDefault();

  // Récupérer les valeurs du formulaire
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  const loginForm = document.getElementById('loginForm');

  if (!username || !password) {
    showError(loginForm, 'Veuillez remplir tous les champs');
    return;
  }

  try {
    // Définir la persistance en fonction de "Se souvenir de moi"
    const persistenceType = rememberMe
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;

    await auth.setPersistence(persistenceType);

    console.log("Tentative de connexion avec nom d'utilisateur:", username);

    // Rechercher l'utilisateur dans Firestore par nom d'utilisateur
    const usersSnapshot = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw new Error("Nom d'utilisateur ou mot de passe incorrect");
    }

    // Récupérer le document utilisateur
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Vérifier le mot de passe
    if (userData.password !== password) {
      throw new Error("Nom d'utilisateur ou mot de passe incorrect");
    }

    // Connexion anonyme avec Firebase
    const userCredential = await auth.signInAnonymously();

    // Mettre à jour la date de dernière connexion
    await db.collection('users').doc(userDoc.id).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Rediriger vers la page d'accueil
    window.location.href = 'new-index.html';
  } catch (error) {
    // Afficher l'erreur détaillée
    console.error("Erreur de connexion détaillée:", error);

    // Personnaliser le message d'erreur pour le rendre plus convivial
    let errorMessage = "Erreur de connexion: " + error.message;

    // Traduire les messages d'erreur courants
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
    }

    showError(loginForm, errorMessage);
  }
}

/**
 * Gère la soumission du formulaire d'inscription
 * @param {Event} e - Événement de soumission
 */
async function handleRegister(e) {
  e.preventDefault();

  // Récupérer les valeurs du formulaire
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const agreeTerms = document.getElementById('agreeTerms').checked;
  const registerForm = document.getElementById('registerForm');

  if (!username || !password || !confirmPassword) {
    showError(registerForm, 'Veuillez remplir tous les champs');
    return;
  }

  // Vérifier que le nom d'utilisateur ne contient que des caractères alphanumériques
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    showError(registerForm, 'Le nom d\'utilisateur ne doit contenir que des lettres et des chiffres');
    return;
  }

  // Vérifier que le nom d'utilisateur a une longueur minimale
  if (username.length < 3) {
    showError(registerForm, 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
    return;
  }

  // Vérifier que les mots de passe correspondent
  if (password !== confirmPassword) {
    showError(registerForm, 'Les mots de passe ne correspondent pas');
    return;
  }

  // Vérifier que les conditions sont acceptées
  if (!agreeTerms) {
    showError(registerForm, 'Vous devez accepter les conditions d\'utilisation');
    return;
  }

  try {
    console.log("Tentative de création de compte anonyme");

    // Créer un compte anonyme avec Firebase
    const userCredential = await auth.signInAnonymously();
    console.log("Compte anonyme créé:", userCredential.user.uid);

    // Préparer les données utilisateur
    const userData = {
      username: username,
      displayName: username,
      isAnonymous: true,
      password: password, // Stocké pour permettre une connexion ultérieure
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      level: 1,
      xp: 0,
      coins: 100,
      completedGames: [],
      completedCourses: []
    };

    // Ajouter les informations de l'utilisateur dans Firestore
    await db.collection('users').doc(userCredential.user.uid).set(userData);

    // Mettre à jour le profil de l'utilisateur si possible
    try {
      await userCredential.user.updateProfile({
        displayName: username
      });
    } catch (profileError) {
      console.warn("Impossible de mettre à jour le profil:", profileError);
    }

    // Afficher un message de succès
    showSuccess(registerForm, 'Compte créé avec succès ! Redirection...');

    // Rediriger vers la page d'accueil après 2 secondes
    setTimeout(() => {
      window.location.href = 'new-index.html';
    }, 2000);
  } catch (error) {
    // Afficher l'erreur détaillée
    console.error("Erreur d'inscription détaillée:", error);

    // Personnaliser le message d'erreur pour le rendre plus convivial
    let errorMessage = "Erreur d'inscription: " + error.message;

    // Traduire les messages d'erreur courants
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Le nom d'utilisateur contient des caractères non autorisés.";
    }

    showError(registerForm, errorMessage);
  }
}

// Suppression des méthodes d'authentification sociale

// Fonctions utilitaires
function showError(form, message) {
  // Supprimer les messages d'erreur existants
  const existingError = form.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Créer un nouvel élément pour le message d'erreur
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message visible';
  errorElement.textContent = message;

  // Ajouter le message d'erreur au formulaire
  form.appendChild(errorElement);
}

function showSuccess(form, message) {
  // Supprimer les messages existants
  const existingMessages = form.querySelectorAll('.error-message, .success-message');
  existingMessages.forEach(msg => msg.remove());

  // Créer un nouvel élément pour le message de succès
  const successElement = document.createElement('div');
  successElement.className = 'success-message visible';
  successElement.textContent = message;

  // Ajouter le message de succès au formulaire
  form.prepend(successElement);
}

// Vérifier si l'utilisateur est déjà connecté
auth.onAuthStateChanged(user => {
  if (user) {
    // Mettre à jour l'interface utilisateur pour les utilisateurs connectés
    const loginButtons = document.querySelectorAll('.btn-login');
    loginButtons.forEach(button => {
      button.textContent = 'Mon Profil';
      button.href = 'profile.html';
    });
  }
});
