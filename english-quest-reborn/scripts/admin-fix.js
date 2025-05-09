/**
 * English Quest - Script de correction pour l'administration
 * Ce script force les privilèges administrateur pour le compte Ollie et ajoute un onglet d'administration directement
 */

// Fonction pour forcer les privilèges administrateur pour Ollie
function forceOllieAdmin() {
  console.log("Tentative de forcer les privilèges administrateur pour Ollie...");

  try {
    // Vérifier si l'utilisateur est connecté
    const currentUserJson = localStorage.getItem('english_quest_current_user');
    if (!currentUserJson) {
      console.log("Aucun utilisateur connecté");
      return false;
    }

    // Récupérer l'utilisateur courant
    const currentUser = JSON.parse(currentUserJson);
    console.log("Utilisateur courant:", currentUser);

    // Vérifier si c'est Ollie
    if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
      console.log("Compte Ollie détecté, forçage des privilèges administrateur");

      // Forcer les privilèges administrateur
      currentUser.isAdmin = true;

      // Sauvegarder l'utilisateur courant
      localStorage.setItem('english_quest_current_user', JSON.stringify(currentUser));
      console.log("Privilèges administrateur forcés pour Ollie dans english_quest_current_user");

      // Mettre à jour l'utilisateur dans la liste des utilisateurs
      const usersJson = localStorage.getItem('english_quest_users');
      if (usersJson) {
        try {
          const users = JSON.parse(usersJson);
          const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

          if (userId) {
            users[userId].isAdmin = true;
            localStorage.setItem('english_quest_users', JSON.stringify(users));
            console.log("Privilèges administrateur forcés pour Ollie dans english_quest_users");
          }
        } catch (e) {
          console.error("Erreur lors de la mise à jour dans english_quest_users:", e);
        }
      }

      // Mettre à jour l'utilisateur dans l'ancienne liste des utilisateurs
      const oldUsersJson = localStorage.getItem('users');
      if (oldUsersJson) {
        try {
          const oldUsers = JSON.parse(oldUsersJson);
          const userId = Object.keys(oldUsers).find(id => oldUsers[id].username === currentUser.username);

          if (userId) {
            oldUsers[userId].isAdmin = true;
            localStorage.setItem('users', JSON.stringify(oldUsers));
            console.log("Privilèges administrateur forcés pour Ollie dans users");
          }
        } catch (e) {
          console.error("Erreur lors de la mise à jour dans users:", e);
        }
      }

      // Mettre à jour le profil local
      const profileJson = localStorage.getItem('userProfile');
      if (profileJson) {
        try {
          const profile = JSON.parse(profileJson);
          if (profile.username === currentUser.username) {
            profile.isAdmin = true;
            localStorage.setItem('userProfile', JSON.stringify(profile));
            console.log("Privilèges administrateur forcés pour Ollie dans userProfile");
          }
        } catch (e) {
          console.error("Erreur lors de la mise à jour dans userProfile:", e);
        }
      }

      console.log("Privilèges administrateur forcés avec succès pour Ollie");
      return true;
    } else {
      console.log("L'utilisateur courant n'est pas Ollie");
      return false;
    }
  } catch (error) {
    console.error("Erreur lors du forçage des privilèges administrateur:", error);
    return false;
  }
}

// Fonction pour ajouter l'onglet d'administration directement
function addAdminTabDirectly() {
  console.log("Ajout direct de l'onglet d'administration...");

  try {
    // Vérifier si l'onglet d'administration existe déjà
    if (document.querySelector('.profile-tab[data-tab="admin"]')) {
      console.log("L'onglet d'administration existe déjà");
      return;
    }

    // Récupérer le conteneur des onglets
    const tabsContainer = document.querySelector('.profile-tabs');
    if (!tabsContainer) {
      console.error("Conteneur d'onglets non trouvé");
      return;
    }

    // Récupérer le conteneur de contenu
    const contentContainer = document.querySelector('.profile-content > .container');
    if (!contentContainer) {
      console.error("Conteneur de contenu non trouvé");
      return;
    }

    console.log("Conteneurs trouvés, ajout de l'onglet d'administration");

    // Créer l'onglet d'administration
    const adminTab = document.createElement('button');
    adminTab.className = 'profile-tab';
    adminTab.dataset.tab = 'admin';
    adminTab.textContent = 'Administration';

    // Ajouter l'onglet au conteneur
    tabsContainer.appendChild(adminTab);

    // Créer le contenu de l'onglet d'administration
    const adminContent = document.createElement('div');
    adminContent.className = 'profile-tab-content';
    adminContent.id = 'admin-content';

    adminContent.innerHTML = `
      <div class="profile-section">
        <h2 class="section-title">Gestion des utilisateurs</h2>
        <div class="admin-users">
          <div class="admin-search">
            <input type="text" id="user-search" placeholder="Rechercher un utilisateur...">
            <button id="search-btn" class="btn btn-primary">
              <i class="fas fa-search"></i> Rechercher
            </button>
          </div>
          <div class="admin-users-list" id="users-list">
            <!-- La liste des utilisateurs sera chargée dynamiquement -->
            <p>Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2 class="section-title">Outils d'administration</h2>
        <div class="admin-tools">
          <button id="unlock-all-skins-btn" class="btn btn-primary">
            <i class="fas fa-unlock-alt"></i> Débloquer tous les skins
          </button>
          <button id="reset-all-users-btn" class="btn btn-danger">
            <i class="fas fa-trash-alt"></i> Réinitialiser tous les utilisateurs
          </button>
        </div>
      </div>
    `;

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

      // Charger la liste des utilisateurs
      loadUsersList();
    });

    console.log("Onglet d'administration ajouté avec succès");

    // Ajouter un badge d'administrateur
    const usernameElement = document.getElementById('profile-username');
    if (usernameElement && !usernameElement.querySelector('.admin-badge')) {
      // Créer le badge
      const badge = document.createElement('span');
      badge.className = 'admin-badge';
      badge.innerHTML = '<i class="fas fa-crown"></i> Admin';
      badge.style.marginLeft = '10px';
      badge.style.backgroundColor = '#e74c3c';
      badge.style.color = 'white';
      badge.style.padding = '3px 8px';
      badge.style.borderRadius = '10px';
      badge.style.fontSize = '0.8rem';

      // Ajouter le badge après le nom d'utilisateur
      usernameElement.appendChild(badge);
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'onglet d'administration:", error);
  }
}

// Fonction pour charger la liste des utilisateurs
function loadUsersList() {
  console.log("Chargement de la liste des utilisateurs...");

  try {
    const usersListContainer = document.getElementById('users-list');
    if (!usersListContainer) {
      console.error("Conteneur de liste d'utilisateurs non trouvé");
      return;
    }

    // Récupérer tous les utilisateurs
    const users = getAllUsers();
    console.log("Utilisateurs récupérés:", users);

    // Vider le conteneur
    usersListContainer.innerHTML = '';

    // Si aucun utilisateur, afficher un message
    if (Object.keys(users).length === 0) {
      usersListContainer.innerHTML = `
        <div class="empty-users">
          <p>Aucun utilisateur trouvé.</p>
        </div>
      `;
      return;
    }

    // Créer la table des utilisateurs
    const table = document.createElement('table');
    table.className = 'admin-users-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';

    // Créer l'en-tête de la table
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Nom d'utilisateur</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Niveau</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">XP</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Pièces</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Dernière connexion</th>
      </tr>
    `;

    // Créer le corps de la table
    const tbody = document.createElement('tbody');

    // Ajouter chaque utilisateur à la table
    Object.values(users).forEach(user => {
      const tr = document.createElement('tr');

      // Ajouter la classe 'admin' si l'utilisateur est un administrateur
      if (user.isAdmin) {
        tr.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
      }

      tr.innerHTML = `
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">
          ${user.username} ${user.isAdmin ? '<span style="background-color: #e74c3c; color: white; padding: 2px 5px; border-radius: 5px; font-size: 0.7rem;"><i class="fas fa-crown"></i></span>' : ''}
        </td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${user.level || 1}</td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${user.xp || 0}</td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${user.coins || 0}</td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais'}</td>
      `;

      // Ajouter la ligne à la table
      tbody.appendChild(tr);
    });

    // Ajouter l'en-tête et le corps à la table
    table.appendChild(thead);
    table.appendChild(tbody);

    // Ajouter la table au conteneur
    usersListContainer.appendChild(table);
  } catch (error) {
    console.error("Erreur lors du chargement de la liste des utilisateurs:", error);
  }
}

// Fonction pour récupérer tous les utilisateurs
function getAllUsers() {
  console.log("Récupération de tous les utilisateurs...");

  try {
    // Créer un objet pour stocker tous les utilisateurs
    const allUsers = {};

    // Récupérer les utilisateurs de la clé principale
    const usersJson = localStorage.getItem('english_quest_users');
    if (usersJson) {
      try {
        const users = JSON.parse(usersJson);
        Object.assign(allUsers, users);
      } catch (e) {
        console.error("Erreur lors de la récupération des utilisateurs de english_quest_users:", e);
      }
    }

    // Récupérer les utilisateurs de l'ancienne clé
    const oldUsersJson = localStorage.getItem('users');
    if (oldUsersJson) {
      try {
        const oldUsers = JSON.parse(oldUsersJson);
        Object.assign(allUsers, oldUsers);
      } catch (e) {
        console.error("Erreur lors de la récupération des utilisateurs de users:", e);
      }
    }

    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les utilisateurs:", error);
    return {};
  }
}

// Variable pour suivre si l'onglet d'administration a déjà été ajouté
let adminTabAdded = false;

// Ajouter un bouton de débogage pour forcer les privilèges administrateur
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initialisation du script admin-fix.js...");

  // Vérifier si nous sommes sur la page de profil
  if (window.location.pathname.includes('profile.html')) {
    console.log("Page de profil détectée");

    // Créer le bouton de débogage
    const debugButton = document.createElement('button');
    debugButton.id = 'force-admin-btn';
    debugButton.className = 'btn btn-primary';
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '20px';
    debugButton.style.right = '20px';
    debugButton.style.zIndex = '9999';
    debugButton.style.padding = '10px 15px';
    debugButton.style.backgroundColor = '#e74c3c';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '5px';
    debugButton.style.cursor = 'pointer';
    debugButton.innerHTML = '<i class="fas fa-crown"></i> Forcer Admin';

    // Ajouter l'écouteur d'événement
    debugButton.addEventListener('click', function() {
      forceOllieAdmin();
      // Ajouter l'onglet d'administration directement sans recharger la page
      addAdminTabDirectly();
    });

    // Ajouter le bouton au document
    document.body.appendChild(debugButton);

    // Vérifier si l'onglet d'administration existe déjà
    if (!document.querySelector('.profile-tab[data-tab="admin"]')) {
      // Exécuter automatiquement la fonction si l'utilisateur est Ollie
      setTimeout(function() {
        forceOllieAdmin();
        // Ajouter l'onglet d'administration directement
        addAdminTabDirectly();
      }, 1000);
    }
  }
});

// Exécuter la fonction une seule fois au chargement initial
if (!adminTabAdded) {
  adminTabAdded = true;

  // Forcer les privilèges administrateur sans recharger la page
  forceOllieAdmin();

  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Vérifier si l'onglet d'administration existe déjà
      if (!document.querySelector('.profile-tab[data-tab="admin"]')) {
        addAdminTabDirectly();
      }
    });
  } else {
    // Le DOM est déjà chargé
    // Vérifier si l'onglet d'administration existe déjà
    if (!document.querySelector('.profile-tab[data-tab="admin"]')) {
      setTimeout(addAdminTabDirectly, 500);
    }
  }
}
