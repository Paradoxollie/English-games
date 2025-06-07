/**
 * Script de gestion du profil utilisateur pour English Quest Reborn
 * Gère l'affichage et la modification du profil utilisateur
 */

import { getAuthState, logout } from './services/auth.service.js';
import { getUserProfileWithAvatar, updateUserAvatar, purchaseSkin, getAvailableSkinsForUser } from './services/profile.service.js';
import { getUserScores } from './services/user.service.js';

// État du profil
let profileState = {
    user: null,
    profile: null,
    scores: [],
    availableSkins: {},
    loading: true,
    error: null
};

// Éléments DOM
let profileTabs;
let profileSections;
let avatarPreview;
let skinSelectors;
let purchaseButtons;

// Initialiser la page de profil
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initialisation de la page de profil');

    // Vérifier si l'utilisateur est connecté en vérifiant le localStorage
    const storedUser = localStorage.getItem('english_quest_current_user');

    if (!storedUser) {
        console.log('Utilisateur non connecté, redirection vers la page de connexion d\'urgence');
        window.location.href = 'emergency-login.html';
        return;
    }

    // Récupérer le profil utilisateur
    const userProfile = JSON.parse(storedUser);

    // Initialiser les éléments DOM
    initDomElements();

    // Charger les données du profil
    await loadProfileData(userProfile.id || userProfile.userId);

    // Initialiser les écouteurs d'événements
    initEventListeners();

    // Afficher les données du profil
    displayProfileData();
});

// Initialiser les éléments DOM
function initDomElements() {
    profileTabs = document.querySelectorAll('.profile-tab');
    profileSections = document.querySelectorAll('.profile-section');
    avatarPreview = document.getElementById('avatar-preview');
    skinSelectors = document.querySelectorAll('.skin-selector');
    purchaseButtons = document.querySelectorAll('.purchase-button');
}

// Charger les données du profil
async function loadProfileData(userId) {
    console.log('Chargement des données du profil:', userId);

    try {
        // Afficher un indicateur de chargement
        showLoading();

        // Récupérer le profil utilisateur
        const profile = await getUserProfileWithAvatar(userId);

        // Récupérer les scores de l'utilisateur
        const scores = await getUserScores(userId, null, 10);

        // Récupérer les skins disponibles
        const { availableSkins } = await getAvailableSkinsForUser(userId);

        // Mettre à jour l'état
        profileState = {
            user: { uid: userId },
            profile,
            scores,
            availableSkins,
            loading: false,
            error: null
        };

        console.log('Données du profil chargées:', profileState);
    } catch (error) {
        console.error('Erreur lors du chargement des données du profil:', error);

        // Mettre à jour l'état
        profileState.loading = false;
        profileState.error = error.message;

        // Afficher l'erreur
        showError(error.message);
    }
}

// Initialiser les écouteurs d'événements
function initEventListeners() {
    // Gestion des onglets
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Gestion des sélecteurs de skin
    skinSelectors.forEach(selector => {
        selector.addEventListener('change', () => {
            updateAvatarPreview();
        });
    });

    // Gestion des boutons d'achat
    purchaseButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const skinType = button.dataset.skinType;
            const skinId = button.dataset.skinId;

            await purchaseSkinHandler(skinType, skinId);
        });
    });

    // Gestion du bouton de sauvegarde de l'avatar
    const saveAvatarButton = document.getElementById('save-avatar');
    if (saveAvatarButton) {
        saveAvatarButton.addEventListener('click', saveAvatar);
    }

    // Gestion du bouton de déconnexion
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Supprimer l'utilisateur du localStorage
            localStorage.removeItem('english_quest_current_user');
            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        });
    }
}

// Afficher les données du profil
function displayProfileData() {
    console.log('Affichage des données du profil');

    if (profileState.loading) {
        return;
    }

    if (profileState.error) {
        showError(profileState.error);
        return;
    }

    const { profile, scores } = profileState;

    // Masquer l'indicateur de chargement
    hideLoading();

    // Afficher les informations de base
    document.querySelectorAll('.profile-username').forEach(el => {
        el.textContent = profile.username;
    });

    document.querySelectorAll('.profile-level').forEach(el => {
        el.textContent = profile.level || 1;
    });

    document.querySelectorAll('.profile-xp').forEach(el => {
        el.textContent = profile.xp || 0;
    });

    document.querySelectorAll('.profile-coins').forEach(el => {
        el.textContent = profile.coins || 0;
    });

    // Calculer l'XP requis pour le niveau suivant
    const requiredXp = (profile.level || 1) * 100;
    const currentXp = profile.xp || 0;
    const xpPercentage = Math.min(100, Math.floor((currentXp / requiredXp) * 100));

    // Mettre à jour la barre de progression
    const xpBar = document.querySelector('.xp-bar-progress');
    if (xpBar) {
        xpBar.style.width = xpPercentage + '%';
    }

    document.querySelectorAll('.xp-text').forEach(el => {
        el.textContent = `${currentXp}/${requiredXp} XP`;
    });

    // Afficher l'avatar
    displayAvatar();

    // Afficher les scores
    displayScores();

    // Afficher les skins disponibles
    displayAvailableSkins();
}

// Afficher l'avatar
function displayAvatar() {
    console.log('Affichage de l\'avatar');

    const { profile } = profileState;

    if (!profile || !profile.avatar) {
        return;
    }

    // Mettre à jour les sélecteurs de skin
    skinSelectors.forEach(selector => {
        const skinType = selector.dataset.skinType;
        const skinValue = profile.avatar[skinType];

        if (skinValue) {
            selector.value = skinValue;
        }
    });

    // Mettre à jour l'aperçu de l'avatar
    updateAvatarPreview();
}

// Mettre à jour l'aperçu de l'avatar
function updateAvatarPreview() {
    console.log('Mise à jour de l\'aperçu de l\'avatar');

    if (!avatarPreview) {
        return;
    }

    // Récupérer les valeurs des sélecteurs
    const head = document.querySelector('.skin-selector[data-skin-type="head"]')?.value;
    const body = document.querySelector('.skin-selector[data-skin-type="body"]')?.value;
    const accessory = document.querySelector('.skin-selector[data-skin-type="accessory"]')?.value;
    const background = document.querySelector('.skin-selector[data-skin-type="background"]')?.value;

    // Construire l'avatar
    avatarPreview.innerHTML = '';

    // Ajouter l'arrière-plan
    if (background && background !== 'none') {
        const backgroundElement = document.createElement('div');
        backgroundElement.className = 'avatar-background';
        backgroundElement.style.backgroundImage = `url('assets/images/avatars/backgrounds/${background}.png')`;
        avatarPreview.appendChild(backgroundElement);
    }

    // Ajouter le corps
    if (body && body !== 'none') {
        const bodyElement = document.createElement('div');
        bodyElement.className = 'avatar-body';
        bodyElement.style.backgroundImage = `url('assets/images/avatars/bodies/${body}.png')`;
        avatarPreview.appendChild(bodyElement);
    }

    // Ajouter la tête
    if (head && head !== 'none') {
        const headElement = document.createElement('div');
        headElement.className = 'avatar-head';
        headElement.style.backgroundImage = `url('assets/images/avatars/heads/${head}.png')`;
        avatarPreview.appendChild(headElement);
    }

    // Ajouter l'accessoire
    if (accessory && accessory !== 'none') {
        const accessoryElement = document.createElement('div');
        accessoryElement.className = 'avatar-accessory';
        accessoryElement.style.backgroundImage = `url('assets/images/avatars/accessories/${accessory}.png')`;
        avatarPreview.appendChild(accessoryElement);
    }
}

// Afficher les scores
function displayScores() {
    console.log('Affichage des scores');

    const { scores } = profileState;

    // Récupérer le conteneur des scores
    const scoresContainer = document.getElementById('scores-container');

    if (!scoresContainer) {
        return;
    }

    // Vider le conteneur
    scoresContainer.innerHTML = '';

    // Afficher un message si aucun score
    if (!scores || scores.length === 0) {
        scoresContainer.innerHTML = '<p class="no-scores">Aucun score enregistré</p>';
        return;
    }

    // Créer un tableau pour les scores
    const table = document.createElement('table');
    table.className = 'scores-table';

    // Créer l'en-tête du tableau
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Jeu</th>
            <th>Score</th>
            <th>Difficulté</th>
            <th>Date</th>
        </tr>
    `;
    table.appendChild(thead);

    // Créer le corps du tableau
    const tbody = document.createElement('tbody');

    // Ajouter chaque score
    scores.forEach(score => {
        const tr = document.createElement('tr');

        // Formater la date
        const date = score.timestamp ? new Date(score.timestamp.seconds * 1000) : new Date();
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        // Formater le nom du jeu
        const gameNames = {
            'speed_verb_challenge': 'Speed Verb Challenge',
            'enigma_scroll': 'Enigma Scroll',
            'word_memory': 'Word Memory',
            'memory_matrix': 'Memory Matrix',
            'lost_in_migration': 'Lost in Migration',
            'brew_your_words': 'Brew Your Words',
            'whisper_trials': 'Whisper Trials'
        };

        const gameName = gameNames[score.gameId] || score.gameId;

        tr.innerHTML = `
            <td>${gameName}</td>
            <td>${score.score}</td>
            <td>${score.difficulty || 'Normal'}</td>
            <td>${formattedDate}</td>
        `;

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    scoresContainer.appendChild(table);
}

// Afficher les skins disponibles
function displayAvailableSkins() {
    console.log('Affichage des skins disponibles');

    const { profile, availableSkins } = profileState;

    // Récupérer le conteneur des skins
    const skinsContainer = document.getElementById('skins-container');

    if (!skinsContainer) {
        return;
    }

    // Vider le conteneur
    skinsContainer.innerHTML = '';

    // Afficher un message si aucun skin disponible
    if (!availableSkins || Object.keys(availableSkins).length === 0) {
        skinsContainer.innerHTML = '<p class="no-skins">Aucun skin disponible à l\'achat</p>';
        return;
    }

    // Créer une section pour chaque type de skin
    for (const skinType in availableSkins) {
        const skins = availableSkins[skinType];

        // Vérifier s'il y a des skins disponibles pour ce type
        if (Object.keys(skins).length === 0) {
            continue;
        }

        // Créer la section
        const section = document.createElement('div');
        section.className = 'skins-section';

        // Ajouter le titre
        const title = document.createElement('h3');
        title.textContent = getSkinTypeTitle(skinType);
        section.appendChild(title);

        // Créer la grille de skins
        const grid = document.createElement('div');
        grid.className = 'skins-grid';

        // Ajouter chaque skin
        for (const skinId in skins) {
            const price = skins[skinId];

            // Créer la carte de skin
            const card = document.createElement('div');
            card.className = 'skin-card';

            // Ajouter l'image du skin
            const image = document.createElement('div');
            image.className = 'skin-image';
            image.style.backgroundImage = `url('assets/images/avatars/${skinType}s/${skinId}.png')`;
            card.appendChild(image);

            // Ajouter le nom du skin
            const name = document.createElement('div');
            name.className = 'skin-name';
            name.textContent = getSkinName(skinId);
            card.appendChild(name);

            // Ajouter le prix du skin
            const priceElement = document.createElement('div');
            priceElement.className = 'skin-price';
            priceElement.innerHTML = `<span class="coin-icon">🪙</span> ${price}`;
            card.appendChild(priceElement);

            // Ajouter le bouton d'achat
            const button = document.createElement('button');
            button.className = 'purchase-button';
            button.textContent = 'Acheter';
            button.dataset.skinType = skinType;
            button.dataset.skinId = skinId;

            // Désactiver le bouton si l'utilisateur n'a pas assez de pièces
            if (profile.coins < price) {
                button.disabled = true;
                button.title = 'Vous n\'avez pas assez de pièces';
            }

            // Ajouter l'écouteur d'événement
            button.addEventListener('click', async () => {
                await purchaseSkinHandler(skinType, skinId);
            });

            card.appendChild(button);

            // Ajouter la carte à la grille
            grid.appendChild(card);
        }

        section.appendChild(grid);
        skinsContainer.appendChild(section);
    }
}

// Obtenir le titre d'un type de skin
function getSkinTypeTitle(skinType) {
    const titles = {
        head: 'Têtes',
        body: 'Corps',
        accessory: 'Accessoires',
        background: 'Arrière-plans'
    };

    return titles[skinType] || skinType;
}

// Obtenir le nom d'un skin
function getSkinName(skinId) {
    const names = {
        default_boy: 'Garçon',
        default_girl: 'Fille',
        bear: 'Ours',
        none: 'Aucun',
        default: 'Défaut'
    };

    return names[skinId] || skinId;
}

// Gérer l'achat d'un skin
async function purchaseSkinHandler(skinType, skinId) {
    console.log(`Achat du skin ${skinId} de type ${skinType}`);

    try {
        // Afficher un indicateur de chargement
        showLoading();

        // Acheter le skin
        const result = await purchaseSkin(profileState.user.uid, skinType, skinId);

        // Mettre à jour l'état
        profileState.profile = result.profile;

        // Recharger les skins disponibles
        const { availableSkins } = await getAvailableSkinsForUser(profileState.user.uid);
        profileState.availableSkins = availableSkins;

        // Afficher un message de succès
        showSuccess(result.message);

        // Mettre à jour l'affichage
        displayProfileData();
    } catch (error) {
        console.error('Erreur lors de l\'achat du skin:', error);

        // Afficher l'erreur
        showError(error.message);

        // Masquer l'indicateur de chargement
        hideLoading();
    }
}

// Sauvegarder l'avatar
async function saveAvatar() {
    console.log('Sauvegarde de l\'avatar');

    try {
        // Récupérer les valeurs des sélecteurs
        const head = document.querySelector('.skin-selector[data-skin-type="head"]')?.value;
        const body = document.querySelector('.skin-selector[data-skin-type="body"]')?.value;
        const accessory = document.querySelector('.skin-selector[data-skin-type="accessory"]')?.value;
        const background = document.querySelector('.skin-selector[data-skin-type="background"]')?.value;

        // Vérifier que les valeurs sont valides
        if (!head || !body) {
            showError('Veuillez sélectionner une tête et un corps');
            return;
        }

        // Afficher un indicateur de chargement
        showLoading();

        // Mettre à jour l'avatar
        const updatedProfile = await updateUserAvatar(profileState.user.uid, {
            head,
            body,
            accessory: accessory || 'none',
            background: background || 'default'
        });

        // Mettre à jour l'état
        profileState.profile = updatedProfile;

        // 🎮 Notifier l'avatar du jeu Enigma Scroll des changements
        const avatarData = {
            head,
            body,
            accessory: accessory || 'none',
            background: background || 'default'
        };
        
        // Mettre à jour le localStorage pour persistence
        const storedUser = localStorage.getItem('english_quest_current_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.avatar = avatarData;
            localStorage.setItem('english_quest_current_user', JSON.stringify(userData));
            console.log('🎨 [Profile] Avatar mis à jour dans localStorage:', avatarData);
        }
        
        // Notifier l'avatar du jeu si la fonction globale existe
        if (typeof window.updateEnigmaAvatarFromProfile === 'function') {
            const success = window.updateEnigmaAvatarFromProfile(avatarData);
            if (success) {
                console.log('🎮 [Profile] Avatar du jeu Enigma Scroll mis à jour avec succès');
            }
        } else if (typeof window.refreshEnigmaAvatarSkins === 'function') {
            // Fallback: demander un rafraîchissement
            window.refreshEnigmaAvatarSkins();
            console.log('🔄 [Profile] Rafraîchissement de l\'avatar Enigma Scroll demandé');
        }

        // Afficher un message de succès
        showSuccess('Avatar sauvegardé avec succès');

        // Mettre à jour l'affichage
        displayProfileData();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'avatar:', error);

        // Afficher l'erreur
        showError(error.message);

        // Masquer l'indicateur de chargement
        hideLoading();
    }
}

// Changer d'onglet
function switchTab(tabName) {
    console.log('Changement d\'onglet:', tabName);

    // Retirer la classe active de tous les onglets et sections
    profileTabs.forEach(t => t.classList.remove('active'));
    profileSections.forEach(s => s.classList.remove('active'));

    // Ajouter la classe active à l'onglet spécifié
    const tab = document.querySelector(`.profile-tab[data-tab="${tabName}"]`);
    if (tab) {
        tab.classList.add('active');
    }

    // Afficher la section correspondante
    const section = document.querySelector(`.profile-section[data-section="${tabName}"]`);
    if (section) {
        section.classList.add('active');
    }
}

// Afficher un indicateur de chargement
function showLoading() {
    // Créer l'indicateur de chargement s'il n'existe pas
    let loadingIndicator = document.querySelector('.loading-indicator');

    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner"></div><span>Chargement...</span>';
        document.body.appendChild(loadingIndicator);
    }

    // Afficher l'indicateur
    loadingIndicator.style.display = 'flex';
}

// Masquer l'indicateur de chargement
function hideLoading() {
    const loadingIndicator = document.querySelector('.loading-indicator');

    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Afficher un message d'erreur
function showError(message) {
    // Créer le message d'erreur
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    // Ajouter le message à la page
    document.body.appendChild(errorElement);

    // Supprimer le message après 5 secondes
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Afficher un message de succès
function showSuccess(message) {
    // Créer le message de succès
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;

    // Ajouter le message à la page
    document.body.appendChild(successElement);

    // Supprimer le message après 5 secondes
    setTimeout(() => {
        successElement.remove();
    }, 5000);
}
