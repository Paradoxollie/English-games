/**
 * Module pour ajouter un onglet d'administration au profil utilisateur
 */

// Ajouter un onglet d'administration au profil utilisateur
function addAdminTab() {
  // Récupérer l'utilisateur actuel
  const currentUser = getCurrentUser();

  // Vérifier si l'utilisateur est administrateur
  if (!currentUser || !(window.adminUsersService && window.adminUsersService.isAdmin(currentUser)) && !(window.adminService && window.adminService.isAdmin(currentUser))) {
    console.log("L'utilisateur n'est pas administrateur, onglet d'administration non ajouté");
    return;
  }

  console.log("Ajout de l'onglet d'administration pour", currentUser.username);

  // Récupérer les éléments du DOM
  const tabsContainer = document.querySelector('.profile-tabs');
  const contentContainer = document.querySelector('.profile-content > .container');

  if (!tabsContainer || !contentContainer) {
    console.error("Conteneurs d'onglets ou de contenu non trouvés");
    return;
  }

  // Vérifier si l'onglet existe déjà
  if (document.querySelector('.profile-tab[data-tab="admin"]')) {
    console.log("L'onglet d'administration existe déjà");
    return;
  }

  // Créer l'onglet d'administration
  const adminTab = document.createElement('button');
  adminTab.className = 'profile-tab';
  adminTab.dataset.tab = 'admin';
  adminTab.innerHTML = '<i class="fas fa-shield-alt"></i> Administration';

  // Ajouter l'onglet au conteneur
  tabsContainer.appendChild(adminTab);

  // Créer le contenu de l'onglet d'administration
  const adminContent = document.createElement('div');
  adminContent.className = 'profile-tab-content';
  adminContent.id = 'admin-content';

  // Ajouter le contenu au conteneur
  contentContainer.appendChild(adminContent);

  // Ajouter l'écouteur d'événement pour l'onglet
  adminTab.addEventListener('click', function() {
    // Retirer la classe active de tous les onglets et contenus
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));

    // Ajouter la classe active à l'onglet d'administration
    adminTab.classList.add('active');
    adminContent.classList.add('active');

    // Initialiser le panneau d'administration
    initAdminPanel(adminContent);
  });

  console.log("Onglet d'administration ajouté avec succès");
}

// Ajouter un badge d'administrateur au nom d'utilisateur
function addAdminBadge() {
  // Récupérer l'élément du nom d'utilisateur
  const usernameElement = document.getElementById('profile-username');

  if (!usernameElement) {
    console.error("Élément de nom d'utilisateur non trouvé");
    return;
  }

  // Vérifier si le badge existe déjà
  if (usernameElement.querySelector('.admin-badge')) {
    console.log("Le badge d'administrateur existe déjà");
    return;
  }

  // Créer le badge
  const badge = document.createElement('span');
  badge.className = 'admin-badge';
  badge.innerHTML = '<i class="fas fa-crown"></i> Admin';

  // Ajouter le badge après le nom d'utilisateur
  usernameElement.appendChild(badge);

  console.log("Badge d'administrateur ajouté avec succès");
}

// Initialiser les fonctionnalités d'administration
function initAdminFeatures() {
  // Récupérer l'utilisateur actuel
  const currentUser = getCurrentUser();

  // Vérifier si l'utilisateur est connecté
  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("Vérification des droits d'administration pour", currentUser.username);

  // Vérification spéciale pour Ollie
  if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
    console.log("Compte Ollie détecté, forçage des privilèges administrateur");

    // Forcer les droits d'administration
    currentUser.isAdmin = true;

    // Sauvegarder l'utilisateur
    setCurrentUser(currentUser);

    // Ajouter le badge d'administrateur
    addAdminBadge();

    // Ajouter l'onglet d'administration
    addAdminTab();

    return;
  }

  // Vérifier si l'utilisateur est administrateur
  const isUserAdmin = (window.adminUsersService && window.adminUsersService.isAdmin(currentUser)) ||
                     (window.adminService && window.adminService.isAdmin(currentUser));

  if (isUserAdmin) {
    console.log("Utilisateur administrateur détecté:", currentUser.username);

    // Ajouter le badge d'administrateur
    addAdminBadge();

    // Ajouter l'onglet d'administration
    addAdminTab();
  } else {
    console.log("L'utilisateur n'est pas administrateur");
  }
}

// Initialiser le panneau d'administration
async function initAdminPanel(container) {
  if (!container) return;

  // Afficher un message de chargement
  container.innerHTML = `
    <div class="admin-panel">
      <h2>Panneau d'administration</h2>
      <div class="admin-loading">
        <p>Chargement des utilisateurs...</p>
      </div>
    </div>
  `;

  try {
    // Récupérer tous les utilisateurs avec le nouveau service
    const usersObj = await window.adminUsersService.getAllUsers();

    // Convertir l'objet en tableau
    const users = Object.values(usersObj);

    // Afficher le panneau d'administration
    renderAdminPanel(container, users);
  } catch (error) {
    console.error("Erreur lors de l'initialisation du panneau d'administration:", error);

    // Afficher un message d'erreur
    container.innerHTML = `
      <div class="admin-panel">
        <h2>Panneau d'administration</h2>
        <div class="admin-error">
          <p>Erreur lors du chargement des utilisateurs: ${error.message}</p>
          <button id="retry-admin-btn" class="btn btn-primary">
            <i class="fas fa-sync"></i> Réessayer
          </button>
        </div>
      </div>
    `;

    // Ajouter l'écouteur d'événement pour le bouton de réessai
    const retryBtn = document.getElementById('retry-admin-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => initAdminPanel(container));
    }
  }
}

// Afficher le panneau d'administration
function renderAdminPanel(container, users) {
  if (!container) return;

  // Créer le contenu du panneau d'administration
  container.innerHTML = `
    <div class="admin-panel">
      <h2>Panneau d'administration</h2>

      <div class="admin-search">
        <input type="text" id="admin-search-input" placeholder="Rechercher un utilisateur...">
        <button id="admin-search-btn" class="btn btn-primary">
          <i class="fas fa-search"></i> Rechercher
        </button>
      </div>

      <div class="admin-users-container">
        <div id="admin-users-list" class="admin-users-list">
          <!-- La liste des utilisateurs sera chargée dynamiquement -->
        </div>
      </div>
    </div>
  `;

  // Ajouter les écouteurs d'événements
  const searchInput = document.getElementById('admin-search-input');
  const searchBtn = document.getElementById('admin-search-btn');

  if (searchInput && searchBtn) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        renderUsersList(users, searchTerm);
      }
    });

    searchBtn.addEventListener('click', () => {
      const searchTerm = searchInput.value.trim();
      renderUsersList(users, searchTerm);
    });
  }

  // Afficher la liste des utilisateurs
  renderUsersList(users);
}

// Afficher la liste des utilisateurs
function renderUsersList(users, searchTerm = '') {
  const listElement = document.getElementById('admin-users-list');

  if (!listElement) return;

  // Filtrer les utilisateurs si un terme de recherche est fourni
  const filteredUsers = searchTerm
    ? users.filter(user =>
        user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  // Si aucun utilisateur, afficher un message
  if (filteredUsers.length === 0) {
    listElement.innerHTML = `
      <div class="admin-empty">
        <p>Aucun utilisateur trouvé.</p>
      </div>
    `;
    return;
  }

  // Créer la table des utilisateurs
  listElement.innerHTML = `
    <table class="admin-users-table">
      <thead>
        <tr>
          <th>Nom d'utilisateur</th>
          <th>Niveau</th>
          <th>XP</th>
          <th>Pièces</th>
          <th>Source</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="admin-users-tbody"></tbody>
    </table>
  `;

  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  // Ajouter chaque utilisateur à la table
  filteredUsers.forEach(user => {
    const tr = document.createElement('tr');

    // Ajouter la classe 'admin' si l'utilisateur est un administrateur
    if (window.adminService.isAdmin(user)) {
      tr.classList.add('admin-user');
    }

    tr.innerHTML = `
      <td>${user.username || 'Sans nom'} ${window.adminService.isAdmin(user) ? '<span class="admin-badge"><i class="fas fa-crown"></i></span>' : ''}</td>
      <td>${user.level || 1}</td>
      <td>${user.xp || 0}</td>
      <td>${user.coins || 0}</td>
      <td>${user.source || 'Inconnu'}</td>
      <td>
        <button class="btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" data-id="${user.id}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Ajouter les écouteurs d'événements pour les boutons d'action
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.dataset.id;
      const user = filteredUsers.find(u => u.id === userId);
      if (user) {
        editUser(user);
      }
    });
  });

  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.dataset.id;
      const user = filteredUsers.find(u => u.id === userId);
      if (user) {
        deleteUser(user);
      }
    });
  });
}

// Initialiser les fonctionnalités d'administration lorsque la page est chargée
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initialisation des fonctionnalités d'administration...");

  // Attendre que le profil soit chargé
  const profileLoadedInterval = setInterval(function() {
    const profileUsername = document.getElementById('profile-username');

    if (profileUsername) {
      clearInterval(profileLoadedInterval);
      console.log("Profil chargé, initialisation des fonctionnalités d'administration...");

      // Initialiser les fonctionnalités d'administration
      initAdminFeatures();
    }
  }, 500);

  // Arrêter l'intervalle après 10 secondes si le profil n'est pas chargé
  setTimeout(function() {
    clearInterval(profileLoadedInterval);
  }, 10000);
});
