/**
 * English Quest - Admin Script
 * Gère les fonctionnalités d'administration
 */

// Liste des administrateurs (noms d'utilisateur) - SEUL OLLIE DOIT ÊTRE ADMINISTRATEUR
const ADMIN_USERNAMES = ['Ollie'];

// Utiliser la clé de stockage définie dans local-auth.js
// Ne pas redéclarer USERS_STORAGE_KEY car elle est déjà définie dans local-auth.js

// Récupérer tous les utilisateurs
function getUsers() {
  // Utiliser la clé correcte pour récupérer les utilisateurs
  const usersJson = localStorage.getItem('english_quest_users');
  console.log("Récupération des utilisateurs avec la clé: english_quest_users");
  console.log("Données brutes:", usersJson);
  const users = usersJson ? JSON.parse(usersJson) : {};
  console.log("Utilisateurs récupérés:", users);
  return users;
}

// Récupérer les utilisateurs de toutes les sources possibles
function getAllUsersFromAllSources() {
  console.log("Récupération des utilisateurs de toutes les sources possibles");

  // Créer un objet pour stocker tous les utilisateurs
  const allUsers = {};

  // Récupérer les utilisateurs de la clé principale
  const mainUsersJson = localStorage.getItem('english_quest_users');
  if (mainUsersJson) {
    try {
      const mainUsers = JSON.parse(mainUsersJson);
      console.log("Utilisateurs trouvés dans la clé principale:", Object.keys(mainUsers).length);

      // Ajouter les utilisateurs à l'objet global
      Object.assign(allUsers, mainUsers);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de la clé principale:", error);
    }
  }

  // Récupérer les utilisateurs de la clé 'users' (ancienne version)
  const oldUsersJson = localStorage.getItem('users');
  if (oldUsersJson) {
    try {
      const oldUsers = JSON.parse(oldUsersJson);
      console.log("Utilisateurs trouvés dans l'ancienne clé:", Object.keys(oldUsers).length);

      // Ajouter les utilisateurs à l'objet global
      Object.assign(allUsers, oldUsers);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de l'ancienne clé:", error);
    }
  }

  // Récupérer l'utilisateur courant
  const currentUserJson = localStorage.getItem('english_quest_current_user');
  if (currentUserJson) {
    try {
      const currentUser = JSON.parse(currentUserJson);
      console.log("Utilisateur courant trouvé:", currentUser.username);

      // Ajouter l'utilisateur courant à l'objet global s'il n'existe pas déjà
      if (currentUser.id && !allUsers[currentUser.id]) {
        allUsers[currentUser.id] = currentUser;
      } else if (currentUser.username) {
        // Créer un ID pour l'utilisateur courant s'il n'en a pas
        const userId = 'user_' + Math.random().toString(36).substr(2, 9);
        allUsers[userId] = currentUser;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur courant:", error);
    }
  }

  // Parcourir toutes les clés de localStorage pour trouver d'autres utilisateurs
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Ignorer les clés déjà traitées
    if (key === USERS_STORAGE_KEY || key === 'users' || key === 'english_quest_current_user') {
      continue;
    }

    // Vérifier si la clé contient 'user' ou 'profile'
    if (key.includes('user') || key.includes('profile')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key));
        console.log("Données utilisateur trouvées dans la clé:", key, userData);

        // Vérifier si les données contiennent un nom d'utilisateur
        if (userData && userData.username) {
          // Créer un ID pour l'utilisateur s'il n'en a pas
          const userId = userData.id || ('user_' + Math.random().toString(36).substr(2, 9));

          // Vérifier si l'utilisateur existe déjà
          let userExists = false;
          for (const existingUserId in allUsers) {
            if (allUsers[existingUserId].username === userData.username) {
              userExists = true;
              break;
            }
          }

          // Ajouter l'utilisateur s'il n'existe pas déjà
          if (!userExists) {
            allUsers[userId] = userData;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données de la clé:", key, error);
      }
    }
  }

  console.log("Tous les utilisateurs récupérés:", allUsers);
  return allUsers;
}

// Sauvegarder tous les utilisateurs
function saveUsers(users) {
  localStorage.setItem('english_quest_users', JSON.stringify(users));
  console.log("Utilisateurs sauvegardés avec la clé: english_quest_users");
}

// Vérifier si l'utilisateur est un administrateur
function isAdmin(username) {
  console.log("Vérification des privilèges administrateur pour:", username);

  if (!username) {
    console.log("Nom d'utilisateur non fourni");
    return false;
  }

  // SÉCURITÉ CRITIQUE: Vérification spéciale pour Ollie (seul administrateur autorisé)
  // Cette vérification est prioritaire et ne peut pas être contournée
  if (username.toLowerCase() === 'ollie') {
    console.log("Compte Ollie détecté - Privilèges administrateur accordés automatiquement");
    return true;
  }

  // Utiliser la fonction isUserAdmin si disponible
  if (typeof isUserAdmin === 'function') {
    try {
      // Récupérer tous les utilisateurs
      const users = getUsers();

      // Rechercher l'utilisateur par nom d'utilisateur (insensible à la casse)
      for (const userId in users) {
        const user = users[userId];
        if (user.username && user.username.toLowerCase() === username.toLowerCase()) {
          // Vérifier avec isUserAdmin
          const isAdminResult = isUserAdmin(user);
          console.log("Vérification avec isUserAdmin pour", username, ":", isAdminResult);
          return isAdminResult;
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification avec isUserAdmin:", error);
    }
  }

  // Vérifier si l'utilisateur a la propriété isAdmin à true
  try {
    // Récupérer tous les utilisateurs
    const users = getUsers();

    // Rechercher l'utilisateur par nom d'utilisateur (insensible à la casse)
    for (const userId in users) {
      const user = users[userId];
      if (user.username && user.username.toLowerCase() === username.toLowerCase()) {
        // Si ce n'est pas Ollie, vérifier strictement la propriété isAdmin
        console.log("Utilisateur trouvé, vérification stricte de la propriété isAdmin:", user.isAdmin);
        return user.isAdmin === true;
      }
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de isAdmin:", error);
  }

  // Par défaut, refuser les privilèges administrateur
  console.log("L'utilisateur n'est pas un administrateur");
  return false;
}

// Récupérer l'utilisateur courant à partir de toutes les sources possibles
function getCurrentUserFromAllSources() {
  console.log("Récupération de l'utilisateur courant à partir de toutes les sources possibles");

  // Essayer d'abord la clé standard
  const currentUserJson = localStorage.getItem('english_quest_current_user');
  if (currentUserJson) {
    try {
      const currentUser = JSON.parse(currentUserJson);
      console.log("Utilisateur courant trouvé dans la clé standard:", currentUser);
      return currentUser;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur courant:", error);
    }
  }

  // Essayer ensuite la clé 'userProfile'
  const userProfileJson = localStorage.getItem('userProfile');
  if (userProfileJson) {
    try {
      const userProfile = JSON.parse(userProfileJson);
      console.log("Profil utilisateur trouvé:", userProfile);
      return userProfile;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil utilisateur:", error);
    }
  }

  // Parcourir toutes les clés de localStorage pour trouver un utilisateur courant
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Ignorer les clés déjà traitées
    if (key === 'english_quest_current_user' || key === 'userProfile') {
      continue;
    }

    // Vérifier si la clé contient 'current' ou 'user'
    if (key.includes('current') || key.includes('user')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key));
        console.log("Données utilisateur trouvées dans la clé:", key, userData);

        // Vérifier si les données contiennent un nom d'utilisateur
        if (userData && userData.username) {
          return userData;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données de la clé:", key, error);
      }
    }
  }

  // Si aucun utilisateur courant n'est trouvé, essayer de récupérer l'utilisateur 'Ollie'
  const users = getAllUsersFromAllSources();
  for (const userId in users) {
    const user = users[userId];
    if (user.username && user.username.toLowerCase() === 'ollie') {
      console.log("Utilisateur 'Ollie' trouvé:", user);
      return user;
    }
  }

  console.log("Aucun utilisateur courant trouvé");
  return null;
}

// Cette initialisation a été remplacée par celle à la fin du fichier

// Ajouter un badge d'administrateur
function addAdminBadge() {
  const usernameElement = document.getElementById('profile-username');

  if (usernameElement) {
    // Créer le badge
    const badge = document.createElement('span');
    badge.className = 'admin-badge';
    badge.innerHTML = '<i class="fas fa-crown"></i> Admin';

    // Ajouter le badge après le nom d'utilisateur
    usernameElement.appendChild(badge);
  }
}

// Ajouter l'onglet d'administration
function addAdminTab() {
  const tabsContainer = document.querySelector('.profile-tabs');
  const contentContainer = document.querySelector('.profile-content > .container');

  if (!tabsContainer || !contentContainer) {
    return;
  }

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

  // Initialiser les écouteurs d'événements pour les outils d'administration
  initAdminTools();
}

// Initialiser les outils d'administration
function initAdminTools() {
  // Écouteur pour le bouton de recherche
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('user-search');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function() {
      loadUsersList(searchInput.value);
    });

    searchInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        loadUsersList(searchInput.value);
      }
    });
  }

  // Écouteur pour le bouton de déblocage de tous les skins
  const unlockAllSkinsBtn = document.getElementById('unlock-all-skins-btn');

  if (unlockAllSkinsBtn) {
    unlockAllSkinsBtn.addEventListener('click', function() {
      if (confirm('Êtes-vous sûr de vouloir débloquer tous les skins pour votre compte ?')) {
        unlockAllSkins();
        alert('Tous les skins ont été débloqués avec succès !');
      }
    });
  }

  // Écouteur pour le bouton de réinitialisation de tous les utilisateurs
  const resetAllUsersBtn = document.getElementById('reset-all-users-btn');

  if (resetAllUsersBtn) {
    resetAllUsersBtn.addEventListener('click', function() {
      if (confirm('ATTENTION : Cette action va supprimer tous les utilisateurs sauf les administrateurs. Êtes-vous sûr de vouloir continuer ?')) {
        resetAllUsers();
        alert('Tous les utilisateurs ont été réinitialisés avec succès !');
        loadUsersList();
      }
    });
  }
}

// Charger la liste des utilisateurs
function loadUsersList(searchTerm = '') {
  console.log("Chargement de la liste des utilisateurs...");
  const usersListContainer = document.getElementById('users-list');

  if (!usersListContainer) {
    console.error("Conteneur de liste d'utilisateurs non trouvé");
    return;
  }

  // Récupérer tous les utilisateurs de toutes les sources possibles
  const users = getAllUsersFromAllSources();
  console.log("Tous les utilisateurs récupérés:", users);

  // Filtrer les utilisateurs si un terme de recherche est fourni
  const filteredUsers = Object.values(users).filter(user => {
    if (!searchTerm) {
      return true;
    }

    return user.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  console.log("Utilisateurs filtrés:", filteredUsers);

  // Vider le conteneur
  usersListContainer.innerHTML = '';

  // Si aucun utilisateur, afficher un message détaillé
  if (filteredUsers.length === 0) {
    usersListContainer.innerHTML = `
      <div class="empty-users">
        <p>Aucun utilisateur trouvé.</p>
        <p class="debug-info">Vérifiez la console pour plus d'informations.</p>
        <button id="create-test-user" class="btn btn-primary">Créer un utilisateur de test</button>
      </div>
    `;

    // Ajouter un écouteur d'événement pour le bouton de création d'utilisateur de test
    const createTestUserBtn = document.getElementById('create-test-user');
    if (createTestUserBtn) {
      createTestUserBtn.addEventListener('click', function() {
        createTestUser();
        loadUsersList(); // Recharger la liste après la création
      });
    }

    return;
  }

  // Créer la table des utilisateurs
  const table = document.createElement('table');
  table.className = 'admin-users-table';

  // Créer l'en-tête de la table
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Nom d'utilisateur</th>
      <th>Niveau</th>
      <th>XP</th>
      <th>Pièces</th>
      <th>Dernière connexion</th>
      <th>Actions</th>
    </tr>
  `;

  // Créer le corps de la table
  const tbody = document.createElement('tbody');

  // Ajouter chaque utilisateur à la table
  filteredUsers.forEach(user => {
    const tr = document.createElement('tr');

    // Ajouter la classe 'admin' si l'utilisateur est un administrateur
    if (isAdmin(user.username)) {
      tr.classList.add('admin-user');
    }

    tr.innerHTML = `
      <td>${user.username} ${isAdmin(user.username) ? '<span class="admin-badge"><i class="fas fa-crown"></i></span>' : ''}</td>
      <td>${user.level || 1}</td>
      <td>${user.xp || 0}</td>
      <td>${user.coins || 0}</td>
      <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais'}</td>
      <td>
        <button class="btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" data-id="${user.id}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;

    // Ajouter la ligne à la table
    tbody.appendChild(tr);
  });

  // Ajouter l'en-tête et le corps à la table
  table.appendChild(thead);
  table.appendChild(tbody);

  // Ajouter la table au conteneur
  usersListContainer.appendChild(table);

  // Ajouter les écouteurs d'événements pour les boutons d'action
  initUserActions();
}

// Initialiser les actions sur les utilisateurs
function initUserActions() {
  // Écouteurs pour les boutons de modification
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', function() {
      const userId = this.dataset.id;
      editUser(userId);
    });
  });

  // Écouteurs pour les boutons de suppression
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', function() {
      const userId = this.dataset.id;
      deleteUser(userId);
    });
  });
}

// Modifier un utilisateur
function editUser(userId) {
  // Récupérer tous les utilisateurs de toutes les sources possibles
  const users = getAllUsersFromAllSources();

  // Récupérer l'utilisateur à modifier
  const user = users[userId];

  if (!user) {
    alert('Utilisateur non trouvé');
    return;
  }

  // Créer le modal d'édition
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'edit-user-modal';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Modifier l'utilisateur ${user.username}</h2>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-user-form">
          <div class="form-group">
            <label for="edit-username">Nom d'utilisateur</label>
            <input type="text" id="edit-username" value="${user.username}" ${isAdmin(user.username) ? 'disabled' : ''}>
          </div>
          <div class="form-group">
            <label for="edit-level">Niveau</label>
            <input type="number" id="edit-level" value="${user.level || 1}" min="1">
          </div>
          <div class="form-group">
            <label for="edit-xp">XP</label>
            <input type="number" id="edit-xp" value="${user.xp || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="edit-coins">Pièces</label>
            <input type="number" id="edit-coins" value="${user.coins || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="edit-admin">Administrateur</label>
            <input type="checkbox" id="edit-admin" ${isAdmin(user.username) ? 'checked' : ''}>
          </div>

          <div class="form-group">
            <h3>Ajouter des récompenses</h3>
            <div class="reward-actions">
              <div class="reward-action">
                <label for="add-coins">Ajouter des pièces</label>
                <div class="reward-input-group">
                  <input type="number" id="add-coins" value="0" min="0">
                  <button type="button" class="btn btn-primary" id="btn-add-coins" data-id="${userId}">Ajouter</button>
                </div>
              </div>
              <div class="reward-action">
                <label for="add-xp">Ajouter de l'XP</label>
                <div class="reward-input-group">
                  <input type="number" id="add-xp" value="0" min="0">
                  <button type="button" class="btn btn-primary" id="btn-add-xp" data-id="${userId}">Ajouter</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-edit">Annuler</button>
        <button class="btn btn-primary" id="save-edit" data-id="${userId}">Enregistrer</button>
      </div>
    </div>
  `;

  // Ajouter le modal au document
  document.body.appendChild(modal);

  // Afficher le modal
  modal.style.display = 'block';

  // Écouteur pour le bouton de fermeture
  modal.querySelector('.close-modal').addEventListener('click', function() {
    document.body.removeChild(modal);
  });

  // Écouteur pour le bouton d'annulation
  modal.querySelector('#cancel-edit').addEventListener('click', function() {
    document.body.removeChild(modal);
  });

  // Écouteur pour le bouton d'ajout de pièces
  modal.querySelector('#btn-add-coins').addEventListener('click', function() {
    const coinsToAdd = parseInt(document.getElementById('add-coins').value);
    if (coinsToAdd > 0) {
      addCoins(userId, coinsToAdd);
      document.getElementById('edit-coins').value = user.coins || 0;
      document.getElementById('add-coins').value = 0;
    }
  });

  // Écouteur pour le bouton d'ajout d'XP
  modal.querySelector('#btn-add-xp').addEventListener('click', function() {
    const xpToAdd = parseInt(document.getElementById('add-xp').value);
    if (xpToAdd > 0) {
      addXP(userId, xpToAdd);
      document.getElementById('edit-xp').value = user.xp || 0;
      document.getElementById('edit-level').value = user.level || 1;
      document.getElementById('add-xp').value = 0;
    }
  });

  // Écouteur pour le bouton de sauvegarde
  modal.querySelector('#save-edit').addEventListener('click', function() {
    // Récupérer les valeurs du formulaire
    const username = document.getElementById('edit-username').value;
    const level = parseInt(document.getElementById('edit-level').value);
    const xp = parseInt(document.getElementById('edit-xp').value);
    const coins = parseInt(document.getElementById('edit-coins').value);
    const isAdminChecked = document.getElementById('edit-admin').checked;

    // Vérifier que le nom d'utilisateur n'est pas vide
    if (!username) {
      alert('Le nom d\'utilisateur ne peut pas être vide');
      return;
    }

    // Mettre à jour l'utilisateur
    user.username = username;
    user.level = level;
    user.xp = xp;
    user.coins = coins;

    // SÉCURITÉ CRITIQUE: Gestion des droits d'administration
    // Récupérer l'utilisateur courant
    const currentUser = getCurrentUser();

    // Vérifier si l'utilisateur courant est Ollie
    if (currentUser && currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
      console.log("Modification des droits d'administration par Ollie");

      // Ollie peut modifier les droits d'administration des autres utilisateurs
      if (username.toLowerCase() === 'ollie') {
        // Ollie ne peut pas retirer ses propres droits d'administration
        user.isAdmin = true;

        // S'assurer que Ollie est dans la liste des administrateurs
        if (!ADMIN_USERNAMES.includes('Ollie')) {
          ADMIN_USERNAMES.push('Ollie');
        }

        // Afficher un message si Ollie essaie de retirer ses propres droits
        if (!isAdminChecked) {
          alert("Vous ne pouvez pas retirer vos propres droits d'administration.");
        }
      } else {
        // Ollie peut modifier les droits d'administration des autres utilisateurs
        user.isAdmin = isAdminChecked;

        // Mettre à jour la liste des administrateurs
        const index = ADMIN_USERNAMES.indexOf(username);
        if (isAdminChecked && index === -1) {
          ADMIN_USERNAMES.push(username);
        } else if (!isAdminChecked && index !== -1) {
          ADMIN_USERNAMES.splice(index, 1);
        }

        // Enregistrer l'action dans la console
        console.log(`Ollie a ${isAdminChecked ? 'donné' : 'retiré'} les droits d'administration à ${username}`);
      }
    } else {
      // Les autres utilisateurs ne peuvent pas modifier les droits d'administration
      if (username.toLowerCase() === 'ollie') {
        // Forcer les droits d'administration pour Ollie
        user.isAdmin = true;

        // S'assurer que Ollie est dans la liste des administrateurs
        if (!ADMIN_USERNAMES.includes('Ollie')) {
          ADMIN_USERNAMES.push('Ollie');
        }
      } else {
        // Conserver les droits d'administration actuels
        // Ne pas forcer à false pour permettre à Ollie de gérer les droits

        // Afficher un message d'avertissement si quelqu'un essaie de modifier les droits d'administration
        if (user.isAdmin !== isAdminChecked) {
          alert("AVERTISSEMENT DE SÉCURITÉ: Seul le compte Ollie peut modifier les droits d'administration. Cette tentative a été bloquée et enregistrée.");
          console.warn("Tentative de modification des droits d'administration détectée et bloquée", {
            username: username,
            attemptedAction: isAdminChecked ? "donner des droits admin" : "retirer des droits admin",
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Sauvegarder les modifications
    users[userId] = user;
    saveUsers(users);

    // Mettre à jour l'utilisateur courant si c'est le même utilisateur
    const loggedInUser = getCurrentUser();
    if (loggedInUser && loggedInUser.username === user.username) {
      setCurrentUser(user);
    }

    // Fermer le modal
    document.body.removeChild(modal);

    // Recharger la liste des utilisateurs
    loadUsersList();
  });
}

// Ajouter des pièces à un utilisateur
function addCoins(userId, amount) {
  // Récupérer tous les utilisateurs de toutes les sources possibles
  const users = getAllUsersFromAllSources();

  // Récupérer l'utilisateur
  const user = users[userId];

  if (!user) {
    console.error("Utilisateur non trouvé");
    return;
  }

  console.log(`Ajout de ${amount} pièces à l'utilisateur ${user.username}`);

  // Vérifier si l'utilisateur actuel est un administrateur
  const currentUser = getCurrentUser();
  if (!currentUser || !isAdmin(currentUser.username)) {
    console.error("Seuls les administrateurs peuvent ajouter des pièces");
    alert("Vous n'avez pas les droits pour effectuer cette action");
    return;
  }

  // Initialiser les pièces si nécessaire
  user.coins = user.coins || 0;

  // Ajouter les pièces
  user.coins += amount;

  console.log(`Nouveau solde: ${user.coins} pièces`);

  // Sauvegarder les modifications
  users[userId] = user;
  saveUsers(users);

  // Mettre à jour l'utilisateur courant si c'est le même utilisateur
  if (currentUser.username === user.username) {
    setCurrentUser(user);

    // Mettre à jour l'affichage du profil si nous sommes sur la page de profil
    const userCoinsElement = document.getElementById('user-coins');
    if (userCoinsElement) {
      userCoinsElement.textContent = user.coins;
    }
  }

  // Mettre à jour l'affichage dans le modal d'édition
  const editCoinsInput = document.getElementById('edit-coins');
  if (editCoinsInput) {
    editCoinsInput.value = user.coins;
  }

  // Afficher une notification
  alert(`${amount} pièces ajoutées avec succès à ${user.username} !`);
}

// Ajouter de l'XP à un utilisateur
function addXP(userId, amount) {
  // Récupérer tous les utilisateurs de toutes les sources possibles
  const users = getAllUsersFromAllSources();

  // Récupérer l'utilisateur
  const user = users[userId];

  if (!user) {
    console.error("Utilisateur non trouvé");
    return;
  }

  console.log(`Ajout de ${amount} XP à l'utilisateur ${user.username}`);

  // Vérifier si l'utilisateur actuel est un administrateur
  const currentUser = getCurrentUser();
  if (!currentUser || !isAdmin(currentUser.username)) {
    console.error("Seuls les administrateurs peuvent ajouter de l'XP");
    alert("Vous n'avez pas les droits pour effectuer cette action");
    return;
  }

  // Initialiser l'XP et le niveau si nécessaire
  user.xp = user.xp || 0;
  user.level = user.level || 1;

  // Ajouter l'XP
  user.xp += amount;

  // Vérifier si le joueur monte de niveau
  let leveledUp = false;
  let levelsGained = 0;

  while (true) {
    const xpToNextLevel = calculateRequiredXp(user.level);

    if (user.xp >= xpToNextLevel) {
      user.xp -= xpToNextLevel;
      user.level++;
      leveledUp = true;
      levelsGained++;
    } else {
      break;
    }
  }

  console.log(`Nouveau niveau: ${user.level}, XP: ${user.xp}`);

  // Sauvegarder les modifications
  users[userId] = user;
  saveUsers(users);

  // Mettre à jour l'utilisateur courant si c'est le même utilisateur
  if (currentUser.username === user.username) {
    setCurrentUser(user);

    // Mettre à jour l'affichage du profil si nous sommes sur la page de profil
    const userXpElement = document.getElementById('user-xp');
    if (userXpElement) {
      userXpElement.textContent = user.xp;
    }

    const userLevelElement = document.getElementById('user-level');
    if (userLevelElement) {
      userLevelElement.textContent = user.level;
    }

    const currentLevelElement = document.getElementById('current-level');
    if (currentLevelElement) {
      currentLevelElement.textContent = user.level;
    }

    const nextLevelElement = document.getElementById('next-level');
    if (nextLevelElement) {
      nextLevelElement.textContent = user.level + 1;
    }

    const xpProgressElement = document.getElementById('xp-progress');
    if (xpProgressElement) {
      const requiredXp = calculateRequiredXp(user.level);
      const progress = Math.min(100, (user.xp / requiredXp) * 100);
      xpProgressElement.style.width = progress + '%';
    }

    const currentXpElement = document.getElementById('current-xp');
    if (currentXpElement) {
      currentXpElement.textContent = user.xp;
    }

    const requiredXpElement = document.getElementById('required-xp');
    if (requiredXpElement) {
      requiredXpElement.textContent = calculateRequiredXp(user.level);
    }

    const userRankElement = document.getElementById('user-rank');
    if (userRankElement) {
      userRankElement.textContent = calculateRank(user.level);
    }
  }

  // Mettre à jour l'affichage dans le modal d'édition
  const editXpInput = document.getElementById('edit-xp');
  if (editXpInput) {
    editXpInput.value = user.xp;
  }

  const editLevelInput = document.getElementById('edit-level');
  if (editLevelInput) {
    editLevelInput.value = user.level;
  }

  // Afficher une notification
  if (leveledUp) {
    alert(`${amount} XP ajoutés avec succès à ${user.username} ! Le joueur a gagné ${levelsGained} niveau(x) et est maintenant niveau ${user.level} !`);
  } else {
    alert(`${amount} XP ajoutés avec succès à ${user.username} !`);
  }
}

// Calculer l'XP requis pour le niveau suivant
function calculateRequiredXp(level) {
  return level * 100;
}

// Calculer le rang en fonction du niveau
function calculateRank(level) {
  if (level >= 30) return 'Légende';
  if (level >= 25) return 'Maître';
  if (level >= 20) return 'Expert';
  if (level >= 15) return 'Vétéran';
  if (level >= 10) return 'Adepte';
  if (level >= 5) return 'Apprenti';
  return 'Novice';
}

// Supprimer un utilisateur
function deleteUser(userId) {
  // Récupérer tous les utilisateurs de toutes les sources possibles
  const users = getAllUsersFromAllSources();

  // Récupérer l'utilisateur à supprimer
  const user = users[userId];

  if (!user) {
    alert('Utilisateur non trouvé');
    return;
  }

  // Vérifier si l'utilisateur est un administrateur
  if (isAdmin(user.username)) {
    alert('Vous ne pouvez pas supprimer un administrateur');
    return;
  }

  // Demander confirmation
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`)) {
    // Supprimer l'utilisateur
    delete users[userId];

    // Sauvegarder les modifications
    saveUsers(users);

    // Recharger la liste des utilisateurs
    loadUsersList();
  }
}

// Débloquer tous les skins pour l'utilisateur courant
function unlockAllSkins() {
  console.log("Débloquage des skins depuis admin.js...");

  // Vérifier si la fonction existe dans admin-fix.js
  if (window.unlockAllSkins_original) {
    console.log("Utilisation de la fonction unlockAllSkins_original");
    return window.unlockAllSkins_original();
  }

  // Récupérer l'utilisateur courant en utilisant notre fonction robuste
  const currentUser = getCurrentUserFromAllSources();

  if (!currentUser) {
    console.error("Aucun utilisateur connecté");
    return;
  }

  // Vérifier si les skins sont déjà débloqués
  if (currentUser.hasAllSkins && currentUser.skinsUnlocked) {
    console.log("Les skins sont déjà débloqués pour cet utilisateur");
    return;
  }

  // Initialiser les skins débloqués si nécessaire
  if (!currentUser.skins) {
    currentUser.skins = {};
  }

  try {
    // S'assurer que le skin d'ours est inclus explicitement
    currentUser.skins = {
      head: ['default_boy', 'default_girl', 'bear'],
      body: ['default_boy', 'default_girl', 'bear'],
      accessory: ['none'],
      background: ['default']
    };

    // Marquer que tous les skins sont débloqués
    currentUser.hasAllSkins = true;
    currentUser.skinsUnlocked = true;

    // Sauvegarder les modifications
    const users = getUsers();
    const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

    if (userId) {
      users[userId] = currentUser;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      console.log("Tous les skins ont été débloqués avec succès");
    } else {
      console.error("Impossible de trouver l'utilisateur pour sauvegarder les skins débloqués");
    }

    // Mettre à jour l'affichage sans recharger la page
    if (typeof updateSkinCatalog === 'function') {
      updateSkinCatalog();
    }

    if (typeof loadInventorySkins === 'function') {
      loadInventorySkins('all');
    }

    if (typeof loadShopSkins === 'function') {
      loadShopSkins();
    }

  } catch (error) {
    console.error("Erreur lors du débloquage des skins:", error);
  }
}

// Réinitialiser tous les utilisateurs (sauf les administrateurs)
function resetAllUsers() {
  // Récupérer tous les utilisateurs de toutes les sources possibles
  const users = getAllUsersFromAllSources();

  // Filtrer les utilisateurs pour ne garder que les administrateurs
  const adminUsers = {};

  Object.keys(users).forEach(userId => {
    const user = users[userId];

    if (isAdmin(user.username)) {
      adminUsers[userId] = user;
    }
  });

  // Sauvegarder les modifications
  saveUsers(adminUsers);
}

// Ajouter des styles CSS pour l'administration
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');

  style.textContent = `
    /* Badge d'administrateur */
    .admin-badge {
      display: inline-block;
      margin-left: 0.5rem;
      padding: 0.2rem 0.5rem;
      background-color: #ff9800;
      color: white;
      border-radius: 0.25rem;
      font-size: 0.8rem;
      font-weight: bold;
    }

    /* Table des utilisateurs */
    .admin-users-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .admin-users-table th,
    .admin-users-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .admin-users-table th {
      background-color: rgba(255, 255, 255, 0.05);
      font-weight: bold;
    }

    .admin-users-table tr:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .admin-users-table .admin-user {
      background-color: rgba(255, 165, 0, 0.1);
    }

    /* Boutons d'action */
    .btn-edit,
    .btn-delete {
      padding: 0.25rem 0.5rem;
      margin-right: 0.25rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-edit {
      background-color: #2ecc71;
      color: white;
    }

    .btn-delete {
      background-color: #e74c3c;
      color: white;
    }

    .btn-edit:hover {
      background-color: #27ae60;
    }

    .btn-delete:hover {
      background-color: #c0392b;
    }

    /* Recherche d'utilisateurs */
    .admin-search {
      display: flex;
      margin-bottom: 1rem;
    }

    .admin-search input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-md);
      color: var(--color-text);
      font-size: 1rem;
      margin-right: 0.5rem;
    }

    .admin-search input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    /* Outils d'administration */
    .admin-tools {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Modal d'édition */
    #edit-user-modal .modal-content {
      max-width: 500px;
    }

    #edit-user-form .form-group {
      margin-bottom: 1rem;
    }

    #edit-user-form label {
      display: block;
      margin-bottom: 0.5rem;
    }

    #edit-user-form input[type="text"],
    #edit-user-form input[type="number"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius-md);
      color: var(--color-text);
      font-size: 1rem;
    }

    #edit-user-form input[type="checkbox"] {
      margin-right: 0.5rem;
    }

    #edit-user-form input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Styles pour les actions de récompense */
    .reward-actions {
      margin-top: 1rem;
    }

    .reward-action {
      margin-bottom: 0.5rem;
    }

    .reward-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .reward-input-group input {
      flex: 1;
    }

    .reward-input-group button {
      min-width: 100px;
    }
  `;

  document.head.appendChild(style);
});

// Créer un utilisateur de test pour le débogage
function createTestUser() {
  console.log("Création d'un utilisateur de test...");

  // Récupérer les utilisateurs existants
  const users = getUsers();

  // Créer un utilisateur de test
  const testUser = {
    username: "TestUser" + Math.floor(Math.random() * 1000),
    xp: 100,
    level: 1,
    gold: 500,
    coins: 500,
    inventory: {
      heads: ["default-boy", "default-girl"],
      bodies: ["default-boy", "default-boy"]
    },
    selectedSkin: {
      head: "default-boy",
      body: "default-boy"
    },
    registrationDate: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  // Ajouter l'utilisateur à la liste
  users[testUser.username] = testUser;

  // Sauvegarder les utilisateurs
  saveUsers(users);

  console.log("Utilisateur de test créé:", testUser);
  alert("Utilisateur de test créé: " + testUser.username);

  return testUser;
}

// Initialiser le module d'administration
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initialisation du module d'administration...");

  try {
    // Utiliser directement la fonction getCurrentUser de local-auth.js
    let currentUser = null;
    if (typeof getCurrentUser === 'function') {
      currentUser = getCurrentUser();
    } else {
      currentUser = getCurrentUserFromAllSources();
    }

    console.log("Utilisateur actuel:", currentUser);

    if (!currentUser) {
      console.log("Aucun utilisateur connecté");
      return;
    }

    // Vérification spéciale pour Ollie
    if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
      console.log("Compte Ollie détecté, forçage des privilèges administrateur");

      // Marquer l'utilisateur comme administrateur
      currentUser.isAdmin = true;

      // Ajouter le badge d'administrateur
      addAdminBadge();

      // Ajouter l'onglet d'administration
      addAdminTab();

      // Charger la liste des utilisateurs après un court délai
      setTimeout(function() {
        if (document.getElementById('admin-content')) {
          loadUsersList();
        }
      }, 500);

      return;
    }

    // Vérifier si l'utilisateur est un administrateur
    if (isAdmin(currentUser.username)) {
      console.log("Utilisateur administrateur détecté:", currentUser.username);

      // Ajouter le badge d'administrateur
      addAdminBadge();

      // Ajouter l'onglet d'administration
      addAdminTab();

      // Charger la liste des utilisateurs après un court délai
      setTimeout(function() {
        if (document.getElementById('admin-content')) {
          loadUsersList();
        }
      }, 500);
    } else {
      console.log("L'utilisateur n'est pas un administrateur");
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation du module d'administration:", error);
  }
});
