/**
 * Script d'authentification pour English Quest Reborn
 * Gère les formulaires de connexion et d'inscription
 */

import { login, register, getAuthState } from './services/auth.service.js';

// Éléments DOM
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form-container');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const passwordInput = document.getElementById('registerPassword');
const passwordStrength = document.getElementById('passwordStrength');
const strengthText = document.getElementById('strengthText');

// Initialiser les écouteurs d'événements
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation des formulaires d\'authentification');
    initTabs();
    initForms();
    
    // Vérifier si l'utilisateur est déjà connecté
    const authState = getAuthState();
    if (authState.isAuthenticated) {
        console.log('Utilisateur déjà connecté, redirection vers la page d\'accueil');
        window.location.href = 'index.html';
    }
});

// Initialiser les onglets
function initTabs() {
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
}

// Initialiser les formulaires
function initForms() {
    // Initialiser le formulaire de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialiser le formulaire d'inscription
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Ajouter l'écouteur pour la vérification de la force du mot de passe
        if (passwordInput) {
            passwordInput.addEventListener('input', checkPasswordStrength);
        }
    }
}

// Gérer la soumission du formulaire de connexion
async function handleLogin(e) {
    e.preventDefault();
    
    // Récupérer les valeurs du formulaire
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showError(loginForm, 'Veuillez remplir tous les champs');
        return;
    }
    
    try {
        // Afficher un indicateur de chargement
        showLoading(loginForm);
        
        // Connecter l'utilisateur
        await login(username, password);
        
        // Rediriger vers la page d'accueil
        window.location.href = 'index.html';
    } catch (error) {
        // Masquer l'indicateur de chargement
        hideLoading(loginForm);
        
        // Afficher l'erreur
        showError(loginForm, error.message);
    }
}

// Gérer la soumission du formulaire d'inscription
async function handleRegister(e) {
    e.preventDefault();
    
    // Récupérer les valeurs du formulaire
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
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
        // Afficher un indicateur de chargement
        showLoading(registerForm);
        
        // Créer un nouvel utilisateur
        await register(username, password);
        
        // Afficher un message de succès
        showSuccess(registerForm, 'Compte créé avec succès ! Redirection...');
        
        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        // Masquer l'indicateur de chargement
        hideLoading(registerForm);
        
        // Afficher l'erreur
        showError(registerForm, error.message);
    }
}

// Vérifier la force du mot de passe
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

// Afficher un message d'erreur
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

// Afficher un message de succès
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

// Afficher un indicateur de chargement
function showLoading(form) {
    // Supprimer les indicateurs de chargement existants
    const existingLoading = form.querySelector('.loading-indicator');
    if (existingLoading) {
        existingLoading.remove();
    }
    
    // Créer un nouvel élément pour l'indicateur de chargement
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.innerHTML = '<div class="spinner"></div><span>Chargement...</span>';
    
    // Ajouter l'indicateur de chargement au formulaire
    form.appendChild(loadingElement);
    
    // Désactiver le bouton de soumission
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
    }
}

// Masquer l'indicateur de chargement
function hideLoading(form) {
    // Supprimer les indicateurs de chargement existants
    const existingLoading = form.querySelector('.loading-indicator');
    if (existingLoading) {
        existingLoading.remove();
    }
    
    // Activer le bouton de soumission
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
    }
}
