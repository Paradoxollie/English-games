/**
 * English Quest - Outils de débogage
 * Fonctions utiles pour le débogage
 */

// Réinitialiser le choix de genre
function resetGenderChoice() {
  // Récupérer l'utilisateur courant
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("Réinitialisation du choix de genre pour", currentUser.username);

  // Réinitialiser hasSelectedGender
  currentUser.hasSelectedGender = false;

  // Sauvegarder les modifications
  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

  if (userId) {
    users[userId] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    console.log("Choix de genre réinitialisé avec succès");

    // Recharger la page
    window.location.reload();
  } else {
    console.error("Impossible de trouver l'utilisateur");
  }
}

// Afficher les informations de débogage
function showDebugInfo() {
  // Récupérer l'utilisateur courant
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("Informations de débogage pour", currentUser.username);
  console.log("hasSelectedGender:", currentUser.hasSelectedGender);
  console.log("hasAllSkins:", currentUser.hasAllSkins);
  console.log("skinsUnlocked:", currentUser.skinsUnlocked);
  console.log("isAdmin:", currentUser.isAdmin);
  console.log("Avatar:", currentUser.avatar);
  console.log("Skins débloqués:", currentUser.skins);
  console.log("Pièces:", currentUser.coins);

  // Afficher les informations dans une alerte
  alert(`
    Utilisateur: ${currentUser.username}
    hasSelectedGender: ${currentUser.hasSelectedGender}
    hasAllSkins: ${currentUser.hasAllSkins}
    skinsUnlocked: ${currentUser.skinsUnlocked}
    isAdmin: ${currentUser.isAdmin}
    Pièces: ${currentUser.coins}
    Avatar tête: ${currentUser.avatar.head}
    Avatar corps: ${currentUser.avatar.body}
  `);
}

// Réinitialiser les skins débloqués
function resetSkinsUnlocked() {
  // Récupérer l'utilisateur courant
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("Réinitialisation des skins débloqués pour", currentUser.username);

  // Réinitialiser les propriétés liées aux skins
  currentUser.skinsUnlocked = false;

  // Sauvegarder les modifications
  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

  if (userId) {
    users[userId] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    console.log("Skins débloqués réinitialisés avec succès");

    // Recharger la page
    if (confirm("Skins débloqués réinitialisés avec succès. Voulez-vous recharger la page ?")) {
      window.location.reload();
    }
  } else {
    console.error("Impossible de trouver l'utilisateur");
  }
}

// Débloquer spécifiquement les skins d'ours
function unlockBearSkins() {
  // Récupérer l'utilisateur courant
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("Débloquage des skins d'ours pour", currentUser.username);

  // Initialiser les skins débloqués si nécessaire
  if (!currentUser.skins) {
    currentUser.skins = {
      head: ['default_boy', 'default_girl'],
      body: ['default_boy', 'default_girl'],
      accessory: ['none'],
      background: ['default']
    };
  }

  // S'assurer que les skins d'ours sont débloqués
  if (!currentUser.skins.head.includes('bear')) {
    currentUser.skins.head.push('bear');
  }

  if (!currentUser.skins.body.includes('bear')) {
    currentUser.skins.body.push('bear');
  }

  // Sauvegarder les modifications
  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

  if (userId) {
    users[userId] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    console.log("Skins d'ours débloqués avec succès");
    alert("Skins d'ours débloqués avec succès ! Vous pouvez maintenant les équiper dans votre inventaire.");

    // Recharger la page
    window.location.reload();
  } else {
    console.error("Impossible de trouver l'utilisateur");
  }
}

// Ajouter un million de pièces d'or
function addMillionCoins() {
  // Récupérer l'utilisateur courant
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("Ajout d'un million de pièces pour", currentUser.username);

  // Ajouter un million de pièces
  currentUser.coins = (currentUser.coins || 0) + 1000000;

  // Sauvegarder les modifications
  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

  if (userId) {
    users[userId] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    console.log("Un million de pièces ajoutées avec succès");
    alert(`Félicitations ! Vous avez maintenant ${currentUser.coins.toLocaleString()} pièces d'or !`);

    // Mettre à jour l'affichage des pièces si possible
    const userCoinsElement = document.getElementById('user-coins');
    if (userCoinsElement) {
      userCoinsElement.textContent = currentUser.coins.toLocaleString();
    }
  } else {
    console.error("Impossible de trouver l'utilisateur");
  }
}

// Acheter tous les skins disponibles
function buyAllSkins() {
  // Récupérer l'utilisateur courant
  const currentUser = getCurrentUser();

  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }

  console.log("Achat de tous les skins pour", currentUser.username);

  // Créer un catalogue de skins minimal si skinCatalog n'est pas disponible
  let catalog = {};

  if (typeof skinCatalog === 'undefined') {
    console.log("Le catalogue de skins n'est pas disponible, utilisation d'un catalogue minimal");

    // Catalogue minimal avec les skins de base et les skins d'ours
    catalog = {
      head: [
        { id: 'default_boy', price: 0 },
        { id: 'default_girl', price: 0 },
        { id: 'bear', price: 500 }
      ],
      body: [
        { id: 'default_boy', price: 0 },
        { id: 'default_girl', price: 0 },
        { id: 'bear', price: 500 }
      ],
      accessory: [
        { id: 'none', price: 0 }
      ],
      background: [
        { id: 'default', price: 0 }
      ]
    };
  } else {
    catalog = skinCatalog;
  }

  // Initialiser les skins débloqués si nécessaire
  if (!currentUser.skins) {
    currentUser.skins = {
      head: ['default_boy', 'default_girl'],
      body: ['default_boy', 'default_girl'],
      accessory: ['none'],
      background: ['default']
    };
  }

  // Parcourir toutes les catégories du catalogue
  let totalCost = 0;

  Object.keys(catalog).forEach(category => {
    // Parcourir tous les skins de la catégorie
    catalog[category].forEach(skin => {
      // Si le skin n'est pas déjà débloqué et a un prix
      if (!currentUser.skins[category].includes(skin.id) && skin.price > 0) {
        // Ajouter le skin à la liste des skins débloqués
        currentUser.skins[category].push(skin.id);

        // Ajouter le coût du skin au coût total
        totalCost += skin.price;
      }
    });
  });

  // S'assurer que les skins d'ours sont débloqués
  if (!currentUser.skins.head.includes('bear')) {
    currentUser.skins.head.push('bear');
  }

  if (!currentUser.skins.body.includes('bear')) {
    currentUser.skins.body.push('bear');
  }

  // Sauvegarder les modifications
  const users = getUsers();
  const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

  if (userId) {
    users[userId] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    console.log("Tous les skins ont été achetés avec succès");
    alert(`Félicitations ! Vous avez débloqué tous les skins disponibles pour un coût total de ${totalCost} pièces d'or.`);

    // Recharger la page pour appliquer les changements
    window.location.reload();
  } else {
    console.error("Impossible de trouver l'utilisateur");
  }
}

// Créer des utilisateurs de test pour la galerie
function createTestUsers() {
  try {
    if (!confirm("Voulez-vous créer 15 utilisateurs de test pour la galerie ?")) {
      return;
    }

    console.log("Création d'utilisateurs de test");

    // Récupérer les utilisateurs existants en utilisant la fonction getUsers()
    const users = getUsers();

    console.log("Utilisateurs existants:", users);

    // Noms aléatoires pour les utilisateurs de test
    const firstNames = ["Emma", "Lucas", "Léa", "Hugo", "Chloé", "Louis", "Inès", "Jules", "Sarah", "Noah", "Jade", "Théo", "Manon", "Raphaël", "Camille", "Liam", "Zoé", "Ethan", "Lina", "Gabriel"];
    const lastNames = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "Roux", "Fournier", "Girard", "Bonnet", "Dupont"];

    // Options d'avatar
    const headOptions = ["default_boy", "default_girl", "bear"];
    const bodyOptions = ["default_boy", "default_girl", "bear"];

    // Compteur d'utilisateurs créés
    let createdCount = 0;

    // Créer 15 utilisateurs de test
    for (let i = 1; i <= 15; i++) {
      // Générer un nom aléatoire
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName}${Math.floor(Math.random() * 100)}`;

      // Vérifier si l'utilisateur existe déjà
      if (getUserByUsername(username)) {
        continue;
      }

      // Générer un avatar aléatoire avec une chance d'avoir un skin d'ours
      const isBoy = Math.random() > 0.5;
      let head = isBoy ? "default_boy" : "default_girl";
      let body = isBoy ? "default_boy" : "default_girl";

      // 20% de chance d'avoir un skin d'ours
      if (Math.random() < 0.2) {
        head = "bear";
        body = "bear";
      }

      // Générer des statistiques aléatoires
      const level = Math.floor(Math.random() * 20) + 1; // Niveau entre 1 et 20
      const xp = level * 100 + Math.floor(Math.random() * 100);
      const coins = Math.floor(Math.random() * 10000);

      // Générer des jeux et cours complétés aléatoires
      const completedGames = [];
      const completedCourses = [];

      const numGames = Math.floor(Math.random() * 5);
      for (let j = 0; j < numGames; j++) {
        completedGames.push(`game_${j + 1}`);
      }

      const numCourses = Math.floor(Math.random() * 3);
      for (let j = 0; j < numCourses; j++) {
        completedCourses.push(`course_${j + 1}`);
      }

      // Créer l'utilisateur
      const user = new User(username, "password123");

      // Mettre à jour les propriétés de l'utilisateur
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = `${username.toLowerCase()}@example.com`;
      user.isAdmin = false;
      user.lastLogin = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
      user.level = level;
      user.xp = xp;
      user.coins = coins;
      user.completedGames = completedGames;
      user.completedCourses = completedCourses;
      user.avatar = {
        head: head,
        body: body,
        accessory: "none",
        background: "default"
      };
      user.skins = {
        head: ["default_boy", "default_girl", head],
        body: ["default_boy", "default_girl", body],
        accessory: ["none"],
        background: ["default"]
      };
      user.hasSelectedGender = true;
      user.skinsUnlocked = head === "bear"; // Les utilisateurs avec des skins d'ours ont débloqué tous les skins

      // Ajouter l'utilisateur à la liste
      users[user.id] = user;
      createdCount++;
    }

    // Sauvegarder les utilisateurs
    saveUsers(users);

    console.log("Utilisateurs de test créés avec succès:", createdCount);
    alert(`${createdCount} utilisateurs de test ont été créés avec succès. La page va être rechargée.`);

    // Recharger la page
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de la création des utilisateurs de test:", error);
    alert("Erreur lors de la création des utilisateurs de test: " + error.message);
  }
}

// Réinitialiser complètement le localStorage
function resetLocalStorage() {
  if (confirm("Attention ! Cette action va supprimer toutes vos données (utilisateurs, progression, etc.). Êtes-vous sûr de vouloir continuer ?")) {
    console.log("Réinitialisation du localStorage");

    // Supprimer toutes les données du localStorage
    localStorage.clear();

    console.log("localStorage réinitialisé avec succès");

    // Recharger la page
    alert("localStorage réinitialisé avec succès. La page va être rechargée.");
    window.location.reload();
  }
}

// Ajouter un bouton de débogage
document.addEventListener('DOMContentLoaded', function() {
  // Créer le bouton de débogage
  const debugButton = document.createElement('div');
  debugButton.style.position = 'fixed';
  debugButton.style.bottom = '10px';
  debugButton.style.right = '10px';
  debugButton.style.zIndex = '9999';
  debugButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  debugButton.style.color = 'white';
  debugButton.style.padding = '5px 10px';
  debugButton.style.borderRadius = '5px';
  debugButton.style.cursor = 'pointer';
  debugButton.style.fontSize = '12px';
  debugButton.textContent = 'Debug';

  // Ajouter le menu de débogage
  const debugMenu = document.createElement('div');
  debugMenu.style.position = 'fixed';
  debugMenu.style.bottom = '40px';
  debugMenu.style.right = '10px';
  debugMenu.style.zIndex = '9999';
  debugMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  debugMenu.style.color = 'white';
  debugMenu.style.padding = '10px';
  debugMenu.style.borderRadius = '5px';
  debugMenu.style.display = 'none';
  debugMenu.style.flexDirection = 'column';
  debugMenu.style.gap = '5px';

  // Ajouter les options de débogage
  debugMenu.innerHTML = `
    <div style="cursor: pointer; padding: 5px;" onclick="resetGenderChoice()">Réinitialiser choix de genre</div>
    <div style="cursor: pointer; padding: 5px;" onclick="showDebugInfo()">Afficher infos de débogage</div>
    <div style="cursor: pointer; padding: 5px;" onclick="resetSkinsUnlocked()">Réinitialiser skins débloqués</div>
    <div style="cursor: pointer; padding: 5px; color: #9c27b0;" onclick="unlockBearSkins()">Débloquer skins d'ours</div>
    <div style="cursor: pointer; padding: 5px; color: #ffc107;" onclick="addMillionCoins()">Ajouter 1 million de pièces</div>
    <div style="cursor: pointer; padding: 5px; color: #4caf50;" onclick="buyAllSkins()">Acheter tous les skins</div>
    <div style="cursor: pointer; padding: 5px; color: #2196f3;" onclick="createTestUsers()">Créer utilisateurs de test</div>
    <div style="cursor: pointer; padding: 5px; color: #ff5555;" onclick="resetLocalStorage()">Réinitialiser localStorage</div>
  `;

  // Ajouter les éléments au document
  document.body.appendChild(debugButton);
  document.body.appendChild(debugMenu);

  // Ajouter l'écouteur d'événement pour afficher/masquer le menu
  debugButton.addEventListener('click', function() {
    if (debugMenu.style.display === 'none') {
      debugMenu.style.display = 'flex';
    } else {
      debugMenu.style.display = 'none';
    }
  });
});
