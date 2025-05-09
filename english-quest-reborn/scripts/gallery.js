/**
 * English Quest - Galerie des avatars
 * Script pour gérer la galerie des avatars des joueurs
 */

// Variables globales
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
let usersPerPage = 12;
let currentSort = 'recent';
let searchQuery = '';

// Éléments DOM
const galleryGrid = document.getElementById('avatars-gallery');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const sortSelect = document.getElementById('sort-select');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');
const avatarModal = document.getElementById('avatar-modal');
const closeModal = document.querySelector('.close-modal');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initialisation de la galerie des avatars");

  // Vérifier si tous les éléments DOM nécessaires sont présents
  if (!galleryGrid) {
    console.error("Élément avatars-gallery non trouvé");
    return;
  }

  if (!searchInput || !searchButton || !sortSelect || !prevPageButton || !nextPageButton || !pageIndicator || !avatarModal || !closeModal) {
    console.error("Certains éléments DOM nécessaires n'ont pas été trouvés");
    return;
  }

  // Vérifier si l'utilisateur est connecté
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("Utilisateur non connecté, redirection vers auth.html");
    window.location.href = 'auth.html';
    return;
  }

  console.log("Utilisateur connecté:", currentUser.username);

  // Initialiser l'avatar de l'utilisateur dans le header
  initHeaderAvatar();

  // Mettre à jour la date de dernière connexion de l'utilisateur courant
  updateCurrentUserLastLogin();

  // Charger tous les utilisateurs
  loadAllUsers();

  // Ajouter les écouteurs d'événements
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });

  sortSelect.addEventListener('change', handleSort);

  prevPageButton.addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      displayUsers();
    }
  });

  nextPageButton.addEventListener('click', function() {
    if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
      currentPage++;
      displayUsers();
    }
  });

  closeModal.addEventListener('click', function() {
    avatarModal.style.display = 'none';
  });

  window.addEventListener('click', function(event) {
    if (event.target === avatarModal) {
      avatarModal.style.display = 'none';
    }
  });

  // Ajouter l'écouteur pour le bouton de déconnexion
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
      window.location.href = 'auth.html';
    });
  }

  console.log("Initialisation de la galerie terminée");
});

// Initialiser l'avatar de l'utilisateur dans le header
function initHeaderAvatar() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.avatar) return;

  const headerAvatar = document.getElementById('header-avatar');
  if (!headerAvatar) return;

  const avatarHead = headerAvatar.querySelector('.avatar-head');
  const avatarBody = headerAvatar.querySelector('.avatar-body');
  const avatarAccessory = headerAvatar.querySelector('.avatar-accessory');
  const avatarBackground = headerAvatar.querySelector('.avatar-background');

  if (avatarHead && currentUser.avatar.head) {
    avatarHead.style.backgroundImage = `url('assets/avatars/heads/${currentUser.avatar.head}.png')`;
  }

  if (avatarBody && currentUser.avatar.body) {
    avatarBody.style.backgroundImage = `url('assets/avatars/bodies/${currentUser.avatar.body}.png')`;
  }

  if (avatarAccessory && currentUser.avatar.accessory) {
    avatarAccessory.style.backgroundImage = currentUser.avatar.accessory !== 'none'
      ? `url('assets/avatars/accessories/${currentUser.avatar.accessory}.png')`
      : 'none';
  }

  if (avatarBackground && currentUser.avatar.background) {
    avatarBackground.style.backgroundImage = `url('assets/avatars/backgrounds/${currentUser.avatar.background}.png')`;
  }

  // Afficher le nombre de pièces
  const userCoinsElement = document.getElementById('user-coins');
  if (userCoinsElement && currentUser.coins !== undefined) {
    userCoinsElement.textContent = currentUser.coins.toLocaleString();
  }
}

// Charger tous les utilisateurs
function loadAllUsers() {
  // Afficher le spinner de chargement
  galleryGrid.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Chargement des avatars...</p>
    </div>
  `;

  try {
    // Récupérer tous les utilisateurs
    const users = getUsers();

    if (!users || Object.keys(users).length === 0) {
      console.log("Aucun utilisateur trouvé dans le localStorage");
      galleryGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users-slash"></i>
          <h3>Aucun joueur trouvé</h3>
          <p>Il n'y a pas encore d'utilisateurs enregistrés.</p>
        </div>
      `;
      return;
    }

    console.log("Utilisateurs chargés:", users);

    // Convertir l'objet users en tableau
    allUsers = Object.values(users);

    // Filtrer et trier les utilisateurs
    filterAndSortUsers();

    // Afficher les utilisateurs
    displayUsers();
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    galleryGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Erreur</h3>
        <p>Une erreur s'est produite lors du chargement des utilisateurs.</p>
      </div>
    `;
  }
}

// Filtrer et trier les utilisateurs
function filterAndSortUsers() {
  // Filtrer les utilisateurs en fonction de la recherche
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUsers = allUsers.filter(user =>
      user.username.toLowerCase().includes(query)
    );
  } else {
    filteredUsers = [...allUsers];
  }

  // Trier les utilisateurs
  switch (currentSort) {
    case 'recent':
      filteredUsers.sort((a, b) => {
        let dateA, dateB;

        try {
          dateA = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
          if (isNaN(dateA.getTime())) dateA = new Date(0);
        } catch (e) {
          dateA = new Date(0);
        }

        try {
          dateB = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
          if (isNaN(dateB.getTime())) dateB = new Date(0);
        } catch (e) {
          dateB = new Date(0);
        }

        return dateB - dateA;
      });
      break;
    case 'level':
      filteredUsers.sort((a, b) => (b.level || 1) - (a.level || 1));
      break;
    case 'alphabetical':
      filteredUsers.sort((a, b) => a.username.localeCompare(b.username));
      break;
  }

  // Réinitialiser la page courante
  currentPage = 1;
}

// Afficher les utilisateurs
function displayUsers() {
  // Calculer les indices de début et de fin pour la pagination
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = Math.min(startIndex + usersPerPage, filteredUsers.length);

  // Récupérer les utilisateurs de la page courante
  const usersToDisplay = filteredUsers.slice(startIndex, endIndex);

  // Vider la grille
  galleryGrid.innerHTML = '';

  // Si aucun utilisateur n'est trouvé
  if (usersToDisplay.length === 0) {
    galleryGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-user-slash"></i>
        <h3>Aucun joueur trouvé</h3>
        <p>Essayez de modifier vos critères de recherche.</p>
      </div>
    `;

    // Désactiver les boutons de pagination
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
    pageIndicator.textContent = 'Page 0 / 0';

    return;
  }

  // Créer une carte pour chaque utilisateur
  usersToDisplay.forEach(user => {
    const card = createAvatarCard(user);
    galleryGrid.appendChild(card);
  });

  // Mettre à jour la pagination
  updatePagination();
}

// Créer une carte d'avatar pour un utilisateur
function createAvatarCard(user) {
  if (!user || !user.username) {
    console.error("Utilisateur invalide:", user);
    return document.createElement('div'); // Retourner un div vide en cas d'erreur
  }

  const card = document.createElement('div');
  card.className = 'avatar-card';
  card.setAttribute('data-username', user.username);

  // Formater la date de dernière connexion
  let lastLogin;
  try {
    lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
  } catch (e) {
    console.warn("Date de dernière connexion invalide pour", user.username);
    lastLogin = null;
  }
  const formattedDate = formatDate(lastLogin || new Date());

  // Déterminer les valeurs par défaut pour l'avatar
  const defaultHead = user.avatar?.head || 'default_boy';
  const defaultBody = user.avatar?.body || 'default_boy';
  const defaultBackground = user.avatar?.background || 'default';
  const accessoryStyle = user.avatar?.accessory && user.avatar.accessory !== 'none'
    ? `background-image: url('assets/avatars/accessories/${user.avatar.accessory}.png')`
    : 'background-image: none';

  // Créer le HTML de la carte
  card.innerHTML = `
    <div class="avatar-card-header">
      <h3>${user.username}</h3>
    </div>
    <div class="avatar-card-body">
      <div class="avatar-display">
        <div class="avatar-background" style="background-image: url('assets/avatars/backgrounds/${defaultBackground}.png');"></div>
        <div class="avatar-body" style="background-image: url('assets/avatars/bodies/${defaultBody}.png');"></div>
        <div class="avatar-head" style="background-image: url('assets/avatars/heads/${defaultHead}.png');"></div>
        <div class="avatar-accessory" style="${accessoryStyle}"></div>
      </div>
    </div>
    <div class="avatar-card-footer">
      <div class="avatar-level-badge">${user.level || 1}</div>
      <div class="avatar-last-seen">Dernière connexion: ${formattedDate}</div>
    </div>
  `;

  // Ajouter une classe pour les effets spéciaux sur les skins d'ours
  if (defaultHead === 'bear' || defaultBody === 'bear') {
    card.classList.add('bear-skin');
  }

  // Ajouter un écouteur d'événement pour ouvrir le modal
  card.addEventListener('click', function() {
    openAvatarModal(user);
  });

  return card;
}

// Ouvrir le modal d'avatar
function openAvatarModal(user) {
  if (!user || !user.username) {
    console.error("Utilisateur invalide pour le modal:", user);
    return;
  }

  try {
    // Mettre à jour les informations du modal
    document.getElementById('modal-username').textContent = user.username;
    document.getElementById('modal-level').textContent = user.level || 1;
    document.getElementById('modal-xp').textContent = user.xp || 0;
    document.getElementById('modal-games').textContent = user.completedGames?.length || 0;
    document.getElementById('modal-courses').textContent = user.completedCourses?.length || 0;

    // Formater la date de dernière connexion
    let lastLogin;
    try {
      lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    } catch (e) {
      console.warn("Date de dernière connexion invalide pour", user.username);
      lastLogin = null;
    }
    document.getElementById('modal-last-login').textContent = formatDate(lastLogin || new Date());

    // Déterminer les valeurs par défaut pour l'avatar
    const defaultHead = user.avatar?.head || 'default_boy';
    const defaultBody = user.avatar?.body || 'default_boy';
    const defaultBackground = user.avatar?.background || 'default';

    // Mettre à jour l'avatar
    const avatarDisplay = avatarModal.querySelector('.avatar-display');
    if (!avatarDisplay) {
      console.error("Élément avatar-display non trouvé dans le modal");
      return;
    }

    const avatarHead = avatarDisplay.querySelector('.avatar-head');
    const avatarBody = avatarDisplay.querySelector('.avatar-body');
    const avatarAccessory = avatarDisplay.querySelector('.avatar-accessory');
    const avatarBackground = avatarDisplay.querySelector('.avatar-background');
    const avatarLevel = avatarDisplay.querySelector('.avatar-level');

    if (avatarHead) {
      avatarHead.style.backgroundImage = `url('assets/avatars/heads/${defaultHead}.png')`;
    }

    if (avatarBody) {
      avatarBody.style.backgroundImage = `url('assets/avatars/bodies/${defaultBody}.png')`;
    }

    if (avatarAccessory) {
      avatarAccessory.style.backgroundImage = user.avatar?.accessory && user.avatar.accessory !== 'none'
        ? `url('assets/avatars/accessories/${user.avatar.accessory}.png')`
        : 'none';
    }

    if (avatarBackground) {
      avatarBackground.style.backgroundImage = `url('assets/avatars/backgrounds/${defaultBackground}.png')`;
    }

    if (avatarLevel) {
      avatarLevel.textContent = user.level || 1;
    }

    // Ajouter une classe pour les effets spéciaux sur les skins d'ours
    const modalContent = avatarModal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.remove('bear-skin');
      if (defaultHead === 'bear' || defaultBody === 'bear') {
        modalContent.classList.add('bear-skin');
      }
    }

    // Afficher le modal
    avatarModal.style.display = 'block';
  } catch (error) {
    console.error("Erreur lors de l'ouverture du modal:", error);
  }
}

// Mettre à jour la pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Mettre à jour l'indicateur de page
  pageIndicator.textContent = `Page ${currentPage} / ${totalPages}`;

  // Activer/désactiver les boutons de pagination
  prevPageButton.disabled = currentPage <= 1;
  nextPageButton.disabled = currentPage >= totalPages;
}

// Gérer la recherche
function handleSearch() {
  searchQuery = searchInput.value.trim();
  filterAndSortUsers();
  displayUsers();
}

// Gérer le tri
function handleSort() {
  currentSort = sortSelect.value;
  filterAndSortUsers();
  displayUsers();
}

// Formater une date
function formatDate(date) {
  // Vérifier si la date est valide
  if (!date || isNaN(date.getTime())) {
    return "Date inconnue";
  }

  // Vérifier si l'utilisateur est actuellement connecté
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.lastLogin) {
    const userLastLogin = new Date(currentUser.lastLogin);
    const dateToCheck = new Date(date);

    // Si les dates sont proches (moins de 5 minutes d'écart), considérer comme "Maintenant"
    const diffMs = Math.abs(userLastLogin - dateToCheck);
    if (diffMs < 5 * 60 * 1000) { // 5 minutes en millisecondes
      return 'Maintenant';
    }
  }

  // Calculer la différence avec la date actuelle
  const currentDate = new Date();
  const diffMs = currentDate - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // Afficher des formats relatifs pour les dates récentes
  if (diffSec < 60) {
    return 'À l\'instant';
  }

  if (diffMin < 60) {
    return `Il y a ${diffMin} min`;
  }

  if (diffHour < 24) {
    return `Il y a ${diffHour} h`;
  }

  if (diffDay === 0) {
    return 'Aujourd\'hui';
  }

  if (diffDay === 1) {
    return 'Hier';
  }

  if (diffDay < 7) {
    return `Il y a ${diffDay} jours`;
  }

  // Format de date standard pour les dates plus anciennes
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Fonction pour rafraîchir la galerie (appelée périodiquement)
function refreshGallery() {
  // Sauvegarder l'état actuel
  const currentScrollPosition = window.scrollY;

  // Mettre à jour la date de dernière connexion de l'utilisateur courant
  updateCurrentUserLastLogin();

  // Recharger les utilisateurs
  loadAllUsers();

  // Restaurer la position de défilement
  window.scrollTo(0, currentScrollPosition);
}

// Fonction pour mettre à jour la date de dernière connexion de l'utilisateur courant
function updateCurrentUserLastLogin() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  // Mettre à jour la date de dernière connexion
  currentUser.lastLogin = new Date().toISOString();

  // Sauvegarder l'utilisateur courant
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  // Mettre à jour l'utilisateur dans la liste des utilisateurs
  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

  if (userId) {
    users[userId] = currentUser;
    saveUsers(users);
    console.log("Date de dernière connexion mise à jour dans la galerie:", currentUser.lastLogin);
  }
}

// Rafraîchir la galerie toutes les 60 secondes
setInterval(refreshGallery, 60000);
