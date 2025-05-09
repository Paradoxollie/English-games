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

      // Activer l'onglet d'administration s'il existe déjà
      const adminTab = document.querySelector('.profile-tab[data-tab="admin"]');
      const adminContent = document.getElementById('admin-content');

      if (adminTab && adminContent) {
        // Retirer la classe active de tous les onglets et contenus
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));

        // Ajouter la classe active à l'onglet d'administration
        adminTab.classList.add('active');
        adminContent.classList.add('active');

        // Charger la liste des utilisateurs
        loadUsersList();
      }

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
    adminTab.className = 'profile-tab active'; // Actif par défaut
    adminTab.dataset.tab = 'admin';
    adminTab.textContent = 'Administration';

    // Ajouter l'onglet au conteneur
    tabsContainer.appendChild(adminTab);

    // Créer le contenu de l'onglet d'administration
    const adminContent = document.createElement('div');
    adminContent.className = 'profile-tab-content active'; // Actif par défaut
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
          <button id="add-test-user-btn" class="btn btn-success">
            <i class="fas fa-user-plus"></i> Ajouter un utilisateur de test
          </button>
        </div>
      </div>
    `;

    // Ajouter le contenu au conteneur
    contentContainer.appendChild(adminContent);

    // Désactiver tous les autres onglets
    document.querySelectorAll('.profile-tab').forEach(tab => {
      if (tab !== adminTab) {
        tab.classList.remove('active');
      }
    });

    // Désactiver tous les autres contenus
    document.querySelectorAll('.profile-tab-content').forEach(content => {
      if (content !== adminContent) {
        content.classList.remove('active');
      }
    });

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

    // Ajouter les écouteurs d'événements pour les boutons d'administration
    const unlockAllSkinsBtn = document.getElementById('unlock-all-skins-btn');
    if (unlockAllSkinsBtn) {
      unlockAllSkinsBtn.addEventListener('click', function() {
        unlockAllSkins();
      });
    }

    const resetAllUsersBtn = document.getElementById('reset-all-users-btn');
    if (resetAllUsersBtn) {
      resetAllUsersBtn.addEventListener('click', function() {
        if (confirm('ATTENTION : Cette action va supprimer tous les utilisateurs sauf les administrateurs. Êtes-vous sûr de vouloir continuer ?')) {
          resetAllUsers();
        }
      });
    }

    const addTestUserBtn = document.getElementById('add-test-user-btn');
    if (addTestUserBtn) {
      addTestUserBtn.addEventListener('click', function() {
        createTestUser();
        setTimeout(loadUsersList, 500);
      });
    }

    // Ajouter l'écouteur d'événement pour la recherche
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

    // Charger la liste des utilisateurs
    loadUsersList();
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'onglet d'administration:", error);
  }
}

// Fonction pour charger la liste des utilisateurs
async function loadUsersList(searchTerm = '') {
  console.log("Chargement de la liste des utilisateurs...");

  try {
    const usersListContainer = document.getElementById('users-list');
    if (!usersListContainer) {
      console.error("Conteneur de liste d'utilisateurs non trouvé");
      return;
    }

    // Afficher un message de chargement
    usersListContainer.innerHTML = `
      <div class="loading-users">
        <p>Chargement des utilisateurs depuis Firebase...</p>
      </div>
    `;

    // Récupérer tous les utilisateurs depuis toutes les sources
    let users = {};

    // Utiliser la nouvelle fonction getAllUsersFromAllSources qui combine toutes les sources
    if (typeof getAllUsersFromAllSources === 'function') {
      console.log("Utilisation de getAllUsersFromAllSources pour récupérer les utilisateurs de toutes les sources");
      users = await getAllUsersFromAllSources();
    }
    // Fallback sur les autres fonctions si disponibles
    else if (typeof getAllPossibleUsers === 'function') {
      console.log("Utilisation de getAllPossibleUsers pour récupérer les utilisateurs");
      users = await getAllPossibleUsers();
    }
    else if (typeof getAllRealUsers === 'function') {
      console.log("Utilisation de getAllRealUsers pour récupérer les utilisateurs");
      users = await getAllRealUsers();
    }
    else if (typeof getAllAuthUsers === 'function') {
      console.log("Utilisation de getAllAuthUsers pour récupérer les utilisateurs");
      users = await getAllAuthUsers();
    }
    else if (typeof getAllFirebaseData === 'function') {
      console.log("Utilisation de getAllFirebaseData pour récupérer les utilisateurs");
      users = await getAllFirebaseData();
    } else {
      // Fallback sur les utilisateurs locaux
      console.log("Utilisation des utilisateurs locaux");
      users = getLocalUsers ? getLocalUsers() : getAllUsers();
    }

    // Si aucun utilisateur n'a été trouvé, essayer de récupérer les utilisateurs de toutes les collections
    if (Object.keys(users).length === 0 || Object.keys(users).length === 1) {
      console.log("Peu ou pas d'utilisateurs trouvés, tentative de récupération de toutes les collections...");

      // Essayer d'explorer toutes les collections pour trouver des utilisateurs
      if (typeof exploreAllCollections === 'function') {
        await exploreAllCollections();
      }

      // Réessayer avec getAllPossibleUsers
      if (typeof getAllPossibleUsers === 'function') {
        console.log("Réessai avec getAllPossibleUsers");
        users = await getAllPossibleUsers();
      }

      // Réessayer avec getAllAuthUsers
      if (Object.keys(users).length <= 1 && typeof getAllAuthUsers === 'function') {
        console.log("Réessai avec getAllAuthUsers");
        const authUsers = await getAllAuthUsers();
        users = { ...users, ...authUsers };
      }

      // Ajouter les utilisateurs locaux si nécessaire
      if (Object.keys(users).length <= 1) {
        console.log("Ajout des utilisateurs locaux");
        const localUsers = getLocalUsers ? getLocalUsers() : getAllUsers();
        users = { ...users, ...localUsers };
      }
    }

    console.log("Utilisateurs récupérés:", users);

    // Filtrer les utilisateurs si un terme de recherche est fourni
    const filteredUsers = Object.values(users).filter(user => {
      if (!searchTerm) {
        return true;
      }

      return user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Vider le conteneur
    usersListContainer.innerHTML = '';

    // Si aucun utilisateur, afficher un message
    if (filteredUsers.length === 0) {
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
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Admin</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Actions</th>
      </tr>
    `;

    // Créer le corps de la table
    const tbody = document.createElement('tbody');

    // Ajouter chaque utilisateur à la table
    filteredUsers.forEach(user => {
      const tr = document.createElement('tr');

      // Ajouter la classe 'admin' si l'utilisateur est un administrateur
      if (user.isAdmin) {
        tr.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
      }

      tr.innerHTML = `
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">
          ${user.username}
        </td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${user.level || 1}</td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${user.xp || 0}</td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${user.coins || 0}</td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais'}</td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">
          ${user.isAdmin ?
            '<span style="background-color: #e74c3c; color: white; padding: 5px 8px; border-radius: 5px; font-weight: bold;"><i class="fas fa-crown"></i> OUI</span>' :
            '<span style="background-color: #6c757d; color: white; padding: 5px 8px; border-radius: 5px;">NON</span>'}
        </td>
        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">
          <div class="admin-actions">
            <button class="btn btn-sm btn-primary edit-user-btn" data-userid="${user.id}" style="margin-right: 5px; padding: 3px 8px; font-size: 0.8rem;">
              <i class="fas fa-edit"></i> Éditer
            </button>
            <button class="btn btn-sm btn-success add-xp-btn" data-userid="${user.id}" style="margin-right: 5px; padding: 3px 8px; font-size: 0.8rem;">
              <i class="fas fa-plus"></i> XP
            </button>
            <button class="btn btn-sm btn-warning add-coins-btn" data-userid="${user.id}" style="margin-right: 5px; padding: 3px 8px; font-size: 0.8rem;">
              <i class="fas fa-coins"></i> Pièces
            </button>
            ${!user.isAdmin ? `
              <button class="btn btn-sm btn-danger delete-user-btn" data-userid="${user.id}" style="padding: 3px 8px; font-size: 0.8rem;">
                <i class="fas fa-trash-alt"></i> Supprimer
              </button>
            ` : ''}
          </div>
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
    document.querySelectorAll('.edit-user-btn').forEach(button => {
      button.addEventListener('click', function() {
        const userId = this.dataset.userid;
        editUser(userId);
      });
    });

    document.querySelectorAll('.add-xp-btn').forEach(button => {
      button.addEventListener('click', function() {
        const userId = this.dataset.userid;
        addXP(userId);
      });
    });

    document.querySelectorAll('.add-coins-btn').forEach(button => {
      button.addEventListener('click', function() {
        const userId = this.dataset.userid;
        addCoins(userId);
      });
    });

    document.querySelectorAll('.delete-user-btn').forEach(button => {
      button.addEventListener('click', function() {
        const userId = this.dataset.userid;
        deleteUser(userId);
      });
    });
  } catch (error) {
    console.error("Erreur lors du chargement de la liste des utilisateurs:", error);

    // Afficher un message d'erreur
    const usersListContainer = document.getElementById('users-list');
    if (usersListContainer) {
      usersListContainer.innerHTML = `
        <div class="error-users">
          <p>Erreur lors du chargement des utilisateurs: ${error.message}</p>
          <button id="retry-load-users" class="btn btn-primary">
            <i class="fas fa-sync"></i> Réessayer
          </button>
        </div>
      `;

      // Ajouter l'écouteur d'événement pour le bouton de réessai
      const retryButton = document.getElementById('retry-load-users');
      if (retryButton) {
        retryButton.addEventListener('click', function() {
          loadUsersList(searchTerm);
        });
      }
    }
  }
}

// Fonction pour éditer un utilisateur
async function editUser(userId) {
  console.log("Édition de l'utilisateur:", userId);

  try {
    // Récupérer tous les utilisateurs depuis Firebase
    let users = {};
    let user = null;

    // Vérifier si la fonction Firebase est disponible
    if (typeof getAllFirebaseData === 'function') {
      users = await getAllFirebaseData();
      user = users[userId];
    } else {
      // Fallback sur les utilisateurs locaux
      users = getAllUsers();
      user = users[userId];
    }

    if (!user) {
      console.error("Utilisateur non trouvé:", userId);
      alert("Utilisateur non trouvé. Veuillez rafraîchir la liste des utilisateurs.");
      return;
    }

    // Créer le formulaire d'édition
    const form = document.createElement('div');
    form.className = 'edit-user-form';
    form.style.backgroundColor = '#f8f9fa';
    form.style.padding = '20px';
    form.style.borderRadius = '10px';
    form.style.marginTop = '20px';
    form.style.marginBottom = '20px';

    form.innerHTML = `
      <h3 style="margin-top: 0;">Éditer l'utilisateur: ${user.username}</h3>
      <div style="margin-bottom: 15px;">
        <label for="edit-username" style="display: block; margin-bottom: 5px;">Nom d'utilisateur:</label>
        <input type="text" id="edit-username" value="${user.username}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="edit-level" style="display: block; margin-bottom: 5px;">Niveau:</label>
        <input type="number" id="edit-level" value="${user.level || 1}" min="1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="edit-xp" style="display: block; margin-bottom: 5px;">XP:</label>
        <input type="number" id="edit-xp" value="${user.xp || 0}" min="0" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="edit-coins" style="display: block; margin-bottom: 5px;">Pièces:</label>
        <input type="number" id="edit-coins" value="${user.coins || 0}" min="0" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      <div style="margin-bottom: 15px;">
        <label for="edit-admin" style="display: block; margin-bottom: 5px;">Administrateur:</label>
        <input type="checkbox" id="edit-admin" ${user.isAdmin ? 'checked' : ''} style="margin-right: 5px;">
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button id="cancel-edit-btn" class="btn btn-secondary" style="margin-right: 10px; padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Annuler</button>
        <button id="save-edit-btn" class="btn btn-primary" style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Enregistrer</button>
      </div>
    `;

    // Ajouter le formulaire avant la liste des utilisateurs
    const usersListContainer = document.getElementById('users-list');
    if (usersListContainer) {
      usersListContainer.parentNode.insertBefore(form, usersListContainer);

      // Masquer la liste des utilisateurs
      usersListContainer.style.display = 'none';
    }

    // Ajouter les écouteurs d'événements pour les boutons
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', function() {
        // Supprimer le formulaire
        form.remove();

        // Afficher la liste des utilisateurs
        if (usersListContainer) {
          usersListContainer.style.display = 'block';
        }
      });
    }

    const saveEditBtn = document.getElementById('save-edit-btn');
    if (saveEditBtn) {
      saveEditBtn.addEventListener('click', async function() {
        // Afficher un indicateur de chargement
        saveEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        saveEditBtn.disabled = true;

        try {
          // Récupérer les valeurs du formulaire
          const username = document.getElementById('edit-username').value;
          const level = parseInt(document.getElementById('edit-level').value);
          const xp = parseInt(document.getElementById('edit-xp').value);
          const coins = parseInt(document.getElementById('edit-coins').value);
          const isAdmin = document.getElementById('edit-admin').checked;

          // Créer l'objet de mise à jour
          const userData = {
            username: username,
            level: level,
            xp: xp,
            coins: coins,
            isAdmin: isAdmin
          };

          // Mettre à jour l'utilisateur dans Firebase
          let success = false;

          // Vérifier si la fonction updateUserInOriginalCollection est disponible (priorité maximale)
          if (typeof updateUserInOriginalCollection === 'function') {
            console.log("Utilisation de updateUserInOriginalCollection pour mettre à jour l'utilisateur dans sa collection d'origine");
            success = await updateUserInOriginalCollection(userId, userData);
          }
          // Vérifier si la fonction updateRealUser est disponible
          else if (typeof updateRealUser === 'function') {
            console.log("Utilisation de updateRealUser pour mettre à jour l'utilisateur");
            success = await updateRealUser(userId, userData);

            // Mettre à jour les droits d'administration séparément
            if (success && typeof setAdminRights === 'function') {
              await setAdminRights(userId, isAdmin);
            }
          }
          // Fallback sur l'ancienne fonction si disponible
          else if (typeof updateFirebaseUser === 'function') {
            console.log("Utilisation de updateFirebaseUser pour mettre à jour l'utilisateur");
            success = await updateFirebaseUser(userId, userData);
          } else {
            // Fallback sur la sauvegarde locale
            console.log("Utilisation de la sauvegarde locale pour mettre à jour l'utilisateur");
            user.username = username;
            user.level = level;
            user.xp = xp;
            user.coins = coins;
            user.isAdmin = isAdmin;

            success = saveUsers(users);
          }

          if (success) {
            // Supprimer le formulaire
            form.remove();

            // Afficher la liste des utilisateurs
            if (usersListContainer) {
              usersListContainer.style.display = 'block';
            }

            // Recharger la liste des utilisateurs
            await loadUsersList();

            // Afficher un message de succès
            alert("Utilisateur mis à jour avec succès.");
          } else {
            alert("Erreur lors de la mise à jour de l'utilisateur. Veuillez réessayer.");

            // Réactiver le bouton
            saveEditBtn.innerHTML = 'Enregistrer';
            saveEditBtn.disabled = false;
          }
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
          alert("Erreur lors de la mise à jour de l'utilisateur: " + error.message);

          // Réactiver le bouton
          saveEditBtn.innerHTML = 'Enregistrer';
          saveEditBtn.disabled = false;
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'édition de l'utilisateur:", error);
    alert("Erreur lors de l'édition de l'utilisateur: " + error.message);
  }
}

// Fonction pour ajouter de l'XP à un utilisateur
async function addXP(userId) {
  console.log("Ajout d'XP à l'utilisateur:", userId);

  try {
    // Récupérer tous les utilisateurs depuis Firebase
    let users = {};
    let user = null;

    // Vérifier si la fonction Firebase est disponible
    if (typeof getAllFirebaseData === 'function') {
      users = await getAllFirebaseData();
      user = users[userId];
    } else {
      // Fallback sur les utilisateurs locaux
      users = getAllUsers();
      user = users[userId];
    }

    if (!user) {
      console.error("Utilisateur non trouvé:", userId);
      alert("Utilisateur non trouvé. Veuillez rafraîchir la liste des utilisateurs.");
      return;
    }

    // Demander la quantité d'XP à ajouter
    const xpToAdd = prompt(`Combien d'XP voulez-vous ajouter à ${user.username}?`, "100");
    if (xpToAdd === null) {
      return;
    }

    // Convertir en nombre
    const xp = parseInt(xpToAdd);
    if (isNaN(xp)) {
      alert("Veuillez entrer un nombre valide.");
      return;
    }

    // Ajouter l'XP
    let success = false;

    // Vérifier si la nouvelle fonction est disponible
    if (typeof addXPToRealUser === 'function') {
      console.log("Utilisation de addXPToRealUser pour ajouter de l'XP");
      success = await addXPToRealUser(userId, xp);
    }
    // Fallback sur l'ancienne fonction si disponible
    else if (typeof addXPToFirebaseUser === 'function') {
      console.log("Utilisation de addXPToFirebaseUser pour ajouter de l'XP");
      success = await addXPToFirebaseUser(userId, xp);
    } else {
      // Fallback sur la sauvegarde locale
      console.log("Utilisation de la sauvegarde locale pour ajouter de l'XP");
      user.xp = (user.xp || 0) + xp;
      user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
      success = saveUsers(users);
    }

    if (success) {
      // Recharger la liste des utilisateurs
      await loadUsersList();

      // Afficher un message de confirmation
      alert(`${xp} XP ajoutés à ${user.username}.`);
    } else {
      alert("Erreur lors de l'ajout d'XP. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout d'XP:", error);
    alert("Erreur lors de l'ajout d'XP: " + error.message);
  }
}

// Fonction pour ajouter des pièces à un utilisateur
async function addCoins(userId) {
  console.log("Ajout de pièces à l'utilisateur:", userId);

  try {
    // Récupérer tous les utilisateurs depuis Firebase
    let users = {};
    let user = null;

    // Vérifier si la fonction Firebase est disponible
    if (typeof getAllFirebaseData === 'function') {
      users = await getAllFirebaseData();
      user = users[userId];
    } else {
      // Fallback sur les utilisateurs locaux
      users = getAllUsers();
      user = users[userId];
    }

    if (!user) {
      console.error("Utilisateur non trouvé:", userId);
      alert("Utilisateur non trouvé. Veuillez rafraîchir la liste des utilisateurs.");
      return;
    }

    // Demander la quantité de pièces à ajouter
    const coinsToAdd = prompt(`Combien de pièces voulez-vous ajouter à ${user.username}?`, "100");
    if (coinsToAdd === null) {
      return;
    }

    // Convertir en nombre
    const coins = parseInt(coinsToAdd);
    if (isNaN(coins)) {
      alert("Veuillez entrer un nombre valide.");
      return;
    }

    // Ajouter les pièces
    let success = false;

    // Vérifier si la nouvelle fonction est disponible
    if (typeof addCoinsToRealUser === 'function') {
      console.log("Utilisation de addCoinsToRealUser pour ajouter des pièces");
      success = await addCoinsToRealUser(userId, coins);
    }
    // Fallback sur l'ancienne fonction si disponible
    else if (typeof addCoinsToFirebaseUser === 'function') {
      console.log("Utilisation de addCoinsToFirebaseUser pour ajouter des pièces");
      success = await addCoinsToFirebaseUser(userId, coins);
    } else {
      // Fallback sur la sauvegarde locale
      console.log("Utilisation de la sauvegarde locale pour ajouter des pièces");
      user.coins = (user.coins || 0) + coins;
      success = saveUsers(users);
    }

    if (success) {
      // Recharger la liste des utilisateurs
      await loadUsersList();

      // Afficher un message de confirmation
      alert(`${coins} pièces ajoutées à ${user.username}.`);
    } else {
      alert("Erreur lors de l'ajout de pièces. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de pièces:", error);
    alert("Erreur lors de l'ajout de pièces: " + error.message);
  }
}

// Fonction pour supprimer un utilisateur
async function deleteUser(userId) {
  console.log("Suppression de l'utilisateur:", userId);

  try {
    // Récupérer tous les utilisateurs depuis Firebase
    let users = {};
    let user = null;

    // Vérifier si la fonction Firebase est disponible
    if (typeof getAllFirebaseData === 'function') {
      users = await getAllFirebaseData();
      user = users[userId];
    } else {
      // Fallback sur les utilisateurs locaux
      users = getAllUsers();
      user = users[userId];
    }

    if (!user) {
      console.error("Utilisateur non trouvé:", userId);
      alert("Utilisateur non trouvé. Veuillez rafraîchir la liste des utilisateurs.");
      return;
    }

    // Demander confirmation
    if (!confirm(`ATTENTION : Cette action est irréversible. Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username}?`)) {
      return;
    }

    // Supprimer l'utilisateur
    let success = false;

    // Vérifier si la nouvelle fonction est disponible
    if (typeof deleteRealUser === 'function') {
      console.log("Utilisation de deleteRealUser pour supprimer l'utilisateur");
      success = await deleteRealUser(userId);
    }
    // Fallback sur l'ancienne fonction si disponible
    else if (typeof deleteFirebaseUser === 'function') {
      console.log("Utilisation de deleteFirebaseUser pour supprimer l'utilisateur");
      success = await deleteFirebaseUser(userId);
    } else {
      // Fallback sur la sauvegarde locale
      console.log("Utilisation de la sauvegarde locale pour supprimer l'utilisateur");
      delete users[userId];
      success = saveUsers(users);
    }

    if (success) {
      // Recharger la liste des utilisateurs
      await loadUsersList();

      // Afficher un message de confirmation
      alert(`L'utilisateur ${user.username} a été supprimé avec succès.`);
    } else {
      alert("Erreur lors de la suppression de l'utilisateur. Veuillez réessayer.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    alert("Erreur lors de la suppression de l'utilisateur: " + error.message);
  }
}

// Fonction pour débloquer tous les skins
async function unlockAllSkins() {
  console.log("Débloquage de tous les skins...");

  try {
    // Récupérer l'utilisateur courant
    const currentUserJson = localStorage.getItem('english_quest_current_user');
    if (!currentUserJson) {
      console.error("Aucun utilisateur connecté");
      return;
    }

    const currentUser = JSON.parse(currentUserJson);

    // Vérifier si les skins sont déjà débloqués
    if (currentUser.hasAllSkins && currentUser.skinsUnlocked) {
      console.log("Les skins sont déjà débloqués pour cet utilisateur");
      console.log("Aucune action nécessaire");
      return;
    }

    // Débloquer tous les skins
    currentUser.hasAllSkins = true;
    currentUser.skinsUnlocked = true;

    // Sauvegarder les modifications
    localStorage.setItem('english_quest_current_user', JSON.stringify(currentUser));

    // Mettre à jour l'utilisateur dans Firebase si possible
    let success = false;

    if (typeof updateFirebaseUser === 'function' && currentUser.id) {
      // Mettre à jour l'utilisateur dans Firebase
      const userData = {
        hasAllSkins: true,
        skinsUnlocked: true
      };

      success = await updateFirebaseUser(currentUser.id, userData);
    } else {
      // Fallback sur la sauvegarde locale
      const users = getAllUsers();
      const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

      if (userId) {
        users[userId].hasAllSkins = true;
        users[userId].skinsUnlocked = true;
        success = saveUsers(users);
      }
    }

    console.log("Tous les skins ont été débloqués avec succès");

    // Mettre à jour l'interface utilisateur sans recharger la page
    if (typeof updateAvatarCatalog === 'function') {
      updateAvatarCatalog();
    }
  } catch (error) {
    console.error("Erreur lors du débloquage des skins:", error);
  }
}

// Fonction pour réinitialiser tous les utilisateurs
function resetAllUsers() {
  console.log("Réinitialisation de tous les utilisateurs...");

  try {
    // Récupérer tous les utilisateurs
    const users = getAllUsers();

    // Créer un nouvel objet pour stocker les administrateurs
    const admins = {};

    // Parcourir tous les utilisateurs
    for (const userId in users) {
      const user = users[userId];

      // Conserver uniquement les administrateurs
      if (user.isAdmin) {
        admins[userId] = user;
      }
    }

    // Sauvegarder les modifications
    saveUsers(admins);

    // Recharger la liste des utilisateurs
    loadUsersList();

    // Afficher un message de confirmation
    alert("Tous les utilisateurs ont été réinitialisés. Seuls les administrateurs ont été conservés.");
  } catch (error) {
    console.error("Erreur lors de la réinitialisation des utilisateurs:", error);
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

// Fonction pour sauvegarder tous les utilisateurs
function saveUsers(users) {
  console.log("Sauvegarde de tous les utilisateurs...");

  try {
    // Sauvegarder dans la clé principale
    localStorage.setItem('english_quest_users', JSON.stringify(users));
    console.log("Utilisateurs sauvegardés dans english_quest_users");

    // Sauvegarder dans l'ancienne clé pour la compatibilité
    localStorage.setItem('users', JSON.stringify(users));
    console.log("Utilisateurs sauvegardés dans users");

    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des utilisateurs:", error);
    return false;
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
