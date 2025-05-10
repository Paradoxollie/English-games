/**
 * Script de correction pour le panneau d'administration
 * Ce script corrige les problèmes liés à l'affichage des utilisateurs et à la gestion des droits d'administrateur
 */

// Fonction pour vérifier si un utilisateur est administrateur
function isUserAdmin(user) {
  if (!user) return false;

  // Vérifier si l'utilisateur est Ollie
  if (user.username && user.username.toLowerCase() === 'ollie') {
    return true;
  }

  // Vérifier le flag isAdmin
  return user.isAdmin === true;
}

// Fonction pour récupérer tous les utilisateurs depuis Firebase
async function getAllUsers() {
  if (!window.db) {
    console.error("Firebase n'est pas initialisé");
    return [];
  }

  try {
    console.log("Récupération de tous les utilisateurs depuis Firebase...");

    // Récupérer tous les utilisateurs de la collection 'users'
    const usersSnapshot = await window.db.collection('users').get();
    const users = [];

    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        userId: doc.id,
        ...doc.data(),
        source: 'users'
      });
    });

    console.log(`${users.length} utilisateurs récupérés depuis la collection 'users'`);

    // Récupérer tous les utilisateurs de la collection 'profiles'
    const profilesSnapshot = await window.db.collection('profiles').get();
    const profiles = [];

    profilesSnapshot.forEach(doc => {
      profiles.push({
        id: doc.id,
        userId: doc.id,
        ...doc.data(),
        source: 'profiles'
      });
    });

    console.log(`${profiles.length} utilisateurs récupérés depuis la collection 'profiles'`);

    // Fusionner les deux collections
    const allUsers = [...users];

    // Ajouter les profils qui n'existent pas déjà dans la liste des utilisateurs
    profiles.forEach(profile => {
      const existingUser = allUsers.find(user => user.id === profile.id);

      if (!existingUser) {
        allUsers.push(profile);
      } else {
        // Fusionner les données
        Object.assign(existingUser, profile);
        existingUser.source = 'users+profiles';
      }
    });

    console.log(`${allUsers.length} utilisateurs au total après fusion`);

    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
}

// Fonction pour mettre à jour le panneau d'administration
async function updateAdminPanel() {
  try {
    // Récupérer tous les utilisateurs
    const users = await getAllUsers();

    // Récupérer le conteneur du panneau d'administration
    const container = document.querySelector('.admin-panel') || document.getElementById('admin-panel');

    if (!container) {
      console.error("Conteneur du panneau d'administration non trouvé");
      return;
    }

    // Créer le contenu du panneau d'administration
    container.innerHTML = `
      <h2>Panneau d'administration</h2>

      <div class="admin-search">
        <input type="text" id="admin-search-input" placeholder="Rechercher un utilisateur...">
        <button id="admin-search-btn" class="btn btn-primary">
          <i class="fas fa-search"></i> Rechercher
        </button>
      </div>

      <div class="admin-users-container">
        <div id="admin-users-list" class="admin-users-list">
          <table class="admin-users-table">
            <thead>
              <tr>
                <th>Nom d'utilisateur</th>
                <th>Niveau</th>
                <th>XP</th>
                <th>Pièces</th>
                <th>Source</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="admin-users-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    // Remplir le tableau des utilisateurs
    const tbody = document.getElementById('admin-users-tbody');

    if (!tbody) {
      console.error("Tableau des utilisateurs non trouvé");
      return;
    }

    // Ajouter chaque utilisateur au tableau
    users.forEach(user => {
      const tr = document.createElement('tr');

      // Ajouter la classe 'admin' si l'utilisateur est un administrateur
      if (isUserAdmin(user)) {
        tr.classList.add('admin-user');
      }

      tr.innerHTML = `
        <td>${user.username || 'Sans nom'} ${isUserAdmin(user) ? '<span class="admin-badge"><i class="fas fa-crown"></i></span>' : ''}</td>
        <td>${user.level || 1}</td>
        <td>${user.xp || 0}</td>
        <td>${user.coins || 0}</td>
        <td>${user.source || 'Inconnu'}</td>
        <td>
          <input type="checkbox" class="admin-checkbox" data-id="${user.id}" ${isUserAdmin(user) ? 'checked' : ''} ${user.username && user.username.toLowerCase() === 'ollie' ? 'disabled' : ''}>
        </td>
        <td>
          <button class="btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" data-id="${user.id}" ${user.username && user.username.toLowerCase() === 'ollie' ? 'disabled' : ''}><i class="fas fa-trash-alt"></i></button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Ajouter les écouteurs d'événements
    addEventListeners();

    console.log("Panneau d'administration mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du panneau d'administration:", error);
  }
}

// Fonction pour ajouter les écouteurs d'événements
function addEventListeners() {
  // Écouteur pour le bouton de recherche
  const searchBtn = document.getElementById('admin-search-btn');
  const searchInput = document.getElementById('admin-search-input');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      filterUsers(searchInput.value);
    });

    searchInput.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        filterUsers(searchInput.value);
      }
    });
  }

  // Écouteurs pour les cases à cocher d'administration
  document.querySelectorAll('.admin-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const userId = checkbox.dataset.id;
      const isAdmin = checkbox.checked;

      try {
        await updateAdminRights(userId, isAdmin);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des droits d'administration:", error);
        alert(`Erreur: ${error.message}`);

        // Rétablir l'état précédent
        checkbox.checked = !isAdmin;
      }
    });
  });

  // Écouteurs pour les boutons de modification
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.dataset.id;
      editUser(userId);
    });
  });

  // Écouteurs pour les boutons de suppression
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.dataset.id;
      confirmDeleteUser(userId);
    });
  });
}

// Fonction pour filtrer les utilisateurs
function filterUsers(searchTerm) {
  const rows = document.querySelectorAll('#admin-users-tbody tr');

  rows.forEach(row => {
    const username = row.querySelector('td:first-child').textContent.toLowerCase();

    if (username.includes(searchTerm.toLowerCase())) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Fonction pour mettre à jour les droits d'administration
async function updateAdminRights(userId, isAdminValue) {
  if (!window.db) {
    console.error("Firebase n'est pas initialisé");
    throw new Error("Firebase n'est pas initialisé");
  }

  try {
    // Récupérer l'utilisateur actuel
    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.username || currentUser.username.toLowerCase() !== 'ollie') {
      throw new Error("Seul Ollie peut modifier les droits d'administration");
    }

    // Récupérer l'utilisateur
    const userDoc = await window.db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new Error("Utilisateur non trouvé");
    }

    const user = {
      id: userDoc.id,
      ...userDoc.data()
    };

    // Vérifier si c'est Ollie
    if (user.username && user.username.toLowerCase() === 'ollie') {
      console.log("Protection des privilèges administrateur pour Ollie");

      // On ne peut pas retirer les droits d'administration à Ollie
      if (!isAdminValue) {
        throw new Error("Vous ne pouvez pas retirer vos propres droits d'administration");
      }

      // Mettre à jour l'utilisateur (même si ça ne change rien)
      await window.db.collection('users').doc(userId).update({
        isAdmin: true
      });

      return user;
    }

    // Mettre à jour les droits d'administration
    console.log(`Modification des droits d'administration pour ${user.username}: ${isAdminValue}`);

    // Mettre à jour dans la collection 'users'
    await window.db.collection('users').doc(userId).update({
      isAdmin: isAdminValue
    });

    // Mettre à jour dans la collection 'profiles' si l'utilisateur existe
    const profileDoc = await window.db.collection('profiles').doc(userId).get();

    if (profileDoc.exists) {
      await window.db.collection('profiles').doc(userId).update({
        isAdmin: isAdminValue
      });
    }

    return user;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des droits d'administration:", error);
    throw error;
  }
}

// Fonction pour récupérer l'utilisateur actuel
function getCurrentUser() {
  try {
    // Essayer d'abord la nouvelle clé
    let currentUser = localStorage.getItem('english_quest_current_user');
    if (currentUser) {
      return JSON.parse(currentUser);
    }

    // Essayer ensuite l'ancienne clé
    currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      return JSON.parse(currentUser);
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur actuel:", error);
    return null;
  }
}

// Fonction pour éditer un utilisateur
async function editUser(userId) {
  try {
    // Récupérer l'utilisateur
    const userDoc = await window.db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      alert("Utilisateur non trouvé");
      return;
    }

    const user = {
      id: userDoc.id,
      ...userDoc.data()
    };

    // Créer le formulaire d'édition
    const form = document.createElement('div');
    form.className = 'admin-edit-form';
    form.innerHTML = `
      <h3>Modifier l'utilisateur ${user.username || 'Sans nom'}</h3>

      <div class="form-group">
        <label for="edit-username">Nom d'utilisateur</label>
        <input type="text" id="edit-username" value="${user.username || ''}" ${user.username && user.username.toLowerCase() === 'ollie' ? 'disabled' : ''}>
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
        <input type="checkbox" id="edit-admin" ${isUserAdmin(user) ? 'checked' : ''} ${user.username && user.username.toLowerCase() === 'ollie' ? 'disabled' : ''}>
      </div>

      <div class="form-actions">
        <button id="edit-save-btn" class="btn btn-primary">Enregistrer</button>
        <button id="edit-cancel-btn" class="btn btn-secondary">Annuler</button>
      </div>
    `;

    // Ajouter le formulaire à la page
    const container = document.querySelector('.admin-panel') || document.getElementById('admin-panel');

    if (!container) {
      alert("Conteneur du panneau d'administration non trouvé");
      return;
    }

    // Sauvegarder le contenu actuel
    const originalContent = container.innerHTML;

    // Afficher le formulaire
    container.innerHTML = '';
    container.appendChild(form);

    // Ajouter les écouteurs d'événements
    document.getElementById('edit-save-btn').addEventListener('click', async () => {
      // Récupérer les valeurs du formulaire
      const username = document.getElementById('edit-username').value;
      const level = parseInt(document.getElementById('edit-level').value) || 1;
      const xp = parseInt(document.getElementById('edit-xp').value) || 0;
      const coins = parseInt(document.getElementById('edit-coins').value) || 0;
      const isAdmin = document.getElementById('edit-admin').checked;

      // Vérifier les valeurs
      if (!username) {
        alert("Le nom d'utilisateur est obligatoire");
        return;
      }

      try {
        // Mettre à jour l'utilisateur
        await updateUser(userId, {
          username,
          level,
          xp,
          coins,
          isAdmin: user.username && user.username.toLowerCase() === 'ollie' ? true : isAdmin
        });

        // Afficher un message de succès
        alert("Utilisateur mis à jour avec succès");

        // Restaurer le contenu original
        container.innerHTML = originalContent;

        // Mettre à jour le panneau d'administration
        await updateAdminPanel();
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        alert(`Erreur: ${error.message}`);
      }
    });

    document.getElementById('edit-cancel-btn').addEventListener('click', () => {
      // Restaurer le contenu original
      container.innerHTML = originalContent;
    });
  } catch (error) {
    console.error("Erreur lors de l'édition de l'utilisateur:", error);
    alert(`Erreur: ${error.message}`);
  }
}

// Fonction pour mettre à jour un utilisateur
async function updateUser(userId, userData) {
  if (!window.db) {
    console.error("Firebase n'est pas initialisé");
    throw new Error("Firebase n'est pas initialisé");
  }

  try {
    // Récupérer l'utilisateur actuel
    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.username || currentUser.username.toLowerCase() !== 'ollie') {
      throw new Error("Seul Ollie peut modifier les utilisateurs");
    }

    // Mettre à jour dans la collection 'users'
    await window.db.collection('users').doc(userId).update({
      ...userData,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Mettre à jour dans la collection 'profiles' si l'utilisateur existe
    const profileDoc = await window.db.collection('profiles').doc(userId).get();

    if (profileDoc.exists) {
      await window.db.collection('profiles').doc(userId).update({
        ...userData,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}

// Fonction pour confirmer la suppression d'un utilisateur
function confirmDeleteUser(userId) {
  // Récupérer l'utilisateur
  const row = document.querySelector(`.btn-delete[data-id="${userId}"]`).closest('tr');
  const username = row.querySelector('td:first-child').textContent.trim();

  // Vérifier si c'est Ollie
  if (username.toLowerCase().includes('ollie')) {
    alert("Vous ne pouvez pas supprimer le compte administrateur principal");
    return;
  }

  // Demander confirmation
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${username} ?`)) {
    deleteUser(userId);
  }
}

// Fonction pour supprimer un utilisateur
async function deleteUser(userId) {
  if (!window.db) {
    console.error("Firebase n'est pas initialisé");
    throw new Error("Firebase n'est pas initialisé");
  }

  try {
    // Récupérer l'utilisateur actuel
    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.username || currentUser.username.toLowerCase() !== 'ollie') {
      throw new Error("Seul Ollie peut supprimer des utilisateurs");
    }

    // Récupérer l'utilisateur
    const userDoc = await window.db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new Error("Utilisateur non trouvé");
    }

    const user = {
      id: userDoc.id,
      ...userDoc.data()
    };

    // Vérifier si c'est Ollie
    if (user.username && user.username.toLowerCase() === 'ollie') {
      throw new Error("Vous ne pouvez pas supprimer le compte administrateur principal");
    }

    // Marquer l'utilisateur comme supprimé plutôt que de le supprimer réellement
    await window.db.collection('users').doc(userId).update({
      isDeleted: true,
      deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
      deletedBy: currentUser.username
    });

    // Marquer l'utilisateur comme supprimé dans la collection 'profiles' si l'utilisateur existe
    const profileDoc = await window.db.collection('profiles').doc(userId).get();

    if (profileDoc.exists) {
      await window.db.collection('profiles').doc(userId).update({
        isDeleted: true,
        deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
        deletedBy: currentUser.username
      });
    }

    // Afficher un message de succès
    alert("Utilisateur supprimé avec succès");

    // Mettre à jour le panneau d'administration
    await updateAdminPanel();

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    alert(`Erreur: ${error.message}`);
    return false;
  }
}

// Fonction pour initialiser le script
function initFixAdminPanel() {
  // Vérifier si Firebase est initialisé
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
    console.error("Firebase n'est pas initialisé");
    return;
  }

  // Vérifier si l'utilisateur actuel est Ollie
  const currentUser = getCurrentUser();

  if (!currentUser || !currentUser.username || currentUser.username.toLowerCase() !== 'ollie') {
    console.error("Seul Ollie peut utiliser ce script");
    return;
  }

  // Mettre à jour le panneau d'administration
  updateAdminPanel();
}

// Exécuter le script si on est dans un navigateur
if (typeof window !== 'undefined') {
  // Ajouter un bouton pour exécuter le script
  const button = document.createElement('button');
  button.textContent = 'Corriger le panneau d\'administration';
  button.style.position = 'fixed';
  button.style.top = '60px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '10px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';

  button.onclick = () => {
    initFixAdminPanel();
  };

  document.body.appendChild(button);
}
