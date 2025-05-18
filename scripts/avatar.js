/**
 * English Quest - Avatar Script
 * Gère la personnalisation des avatars et les skins
 */

// Données de l'utilisateur (partagées avec profile.js)
// La variable userData est déclarée dans profile.js

// Configuration des avatars
const avatarConfig = {
    heads: [
        { id: 'default_boy', name: 'Garçon', type: 'head', rarity: 'common', price: 0, image: 'assets/images/avatars/heads/default_boy.svg' },
        { id: 'default_girl', name: 'Fille', type: 'head', rarity: 'common', price: 0, image: 'assets/images/avatars/heads/default_girl.svg' },
        { id: 'bear', name: 'Ours', type: 'head', rarity: 'rare', price: 1000, image: 'assets/images/avatars/heads/bear.svg' }
    ],
    bodies: [
        { id: 'default_boy', name: 'T-shirt', type: 'body', rarity: 'common', price: 0, image: 'assets/images/avatars/bodies/default_boy.svg' },
        { id: 'default_girl', name: 'Robe', type: 'body', rarity: 'common', price: 0, image: 'assets/images/avatars/bodies/default_girl.svg' },
        { id: 'bear', name: 'Ours', type: 'body', rarity: 'rare', price: 1000, image: 'assets/images/avatars/bodies/bear.svg' }
    ],
    accessories: [
        { id: 'none', name: 'Aucun', type: 'accessory', rarity: 'common', price: 0, image: 'assets/images/avatars/accessories/none.svg' },
        { id: 'glasses', name: 'Lunettes', type: 'accessory', rarity: 'common', price: 500, image: 'assets/images/avatars/accessories/glasses.svg' }
    ],
    backgrounds: [
        { id: 'classroom', name: 'Salle de classe', type: 'background', rarity: 'common', price: 0, image: 'assets/images/avatars/backgrounds/classroom.svg' },
        { id: 'forest', name: 'Forêt', type: 'background', rarity: 'rare', price: 800, image: 'assets/images/avatars/backgrounds/forest.svg' }
    ]
};

// État initial de l'avatar
let currentAvatar = {
    head: 'default_boy',
    body: 'default_boy',
    accessory: 'none',
    background: 'classroom'
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (user) {
        await loadUserAvatar(user.uid);
        initializeAvatarUI();
        updateAvatarPreview();
    }
});

// Initialisation de l'interface utilisateur
function initializeAvatarUI() {
    // Initialisation des options de personnalisation
    Object.keys(avatarConfig).forEach(category => {
        const container = document.getElementById(`${category}Options`);
        if (container) {
            avatarConfig[category].forEach(item => {
                const optionElement = createOptionElement(item);
                container.appendChild(optionElement);
            });
        }
    });

    // Gestion de la navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const sections = document.querySelectorAll('.profile-section');
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(button.dataset.section).classList.add('active');
        });
    });
}

// Création d'un élément d'option
function createOptionElement(item) {
    const div = document.createElement('div');
    div.className = `option-item ${item.rarity}`;
    div.dataset.id = item.id;
    div.dataset.type = item.type;
    
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    
    div.appendChild(img);
    
    div.addEventListener('click', () => selectOption(item));
    
    return div;
}

// Sélection d'une option
function selectOption(item) {
    currentAvatar[item.type] = item.id;
    updateAvatarPreview();
    saveAvatar();
}

// Mise à jour de l'aperçu de l'avatar
function updateAvatarPreview() {
    const preview = document.getElementById('avatarPreview');
    if (preview) {
        const head = avatarConfig.heads.find(h => h.id === currentAvatar.head);
        const body = avatarConfig.bodies.find(b => b.id === currentAvatar.body);
        const accessory = avatarConfig.accessories.find(a => a.id === currentAvatar.accessory);
        const background = avatarConfig.backgrounds.find(bg => bg.id === currentAvatar.background);

        // Création de l'image composite
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Chargement des images
        Promise.all([
            loadImage(background.image),
            loadImage(body.image),
            loadImage(head.image),
            accessory.id !== 'none' ? loadImage(accessory.image) : Promise.resolve(null)
        ]).then(([bgImg, bodyImg, headImg, accImg]) => {
            ctx.drawImage(bgImg, 0, 0, 200, 200);
            ctx.drawImage(bodyImg, 0, 0, 200, 200);
            ctx.drawImage(headImg, 0, 0, 200, 200);
            if (accImg) {
                ctx.drawImage(accImg, 0, 0, 200, 200);
            }
            preview.src = canvas.toDataURL();
        });
    }
}

// Chargement d'une image
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Sauvegarde de l'avatar
async function saveAvatar() {
    const user = await getCurrentUser();
    if (user) {
        try {
            await db.collection('users').doc(user.uid).update({
                avatar: currentAvatar
            });
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'avatar:', error);
        }
    }
}

// Chargement de l'avatar de l'utilisateur
async function loadUserAvatar(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().avatar) {
            currentAvatar = userDoc.data().avatar;
        }
    } catch (error) {
        console.error('Erreur lors du chargement de l\'avatar:', error);
    }
}

// Récupération de l'utilisateur courant
async function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

// Catalogue des skins disponibles
const skinCatalog = {
  head: [
    { id: 'default_boy', name: 'Garçon', rarity: 'common', price: 0, image: 'assets/avatars/heads/default_boy.png', unlocked: true },
    { id: 'default_girl', name: 'Fille', rarity: 'common', price: 0, image: 'assets/avatars/heads/default_girl.png', unlocked: true },
    { id: 'bear', name: 'Tête d\'Ours', rarity: 'epic', price: 500, image: 'assets/avatars/heads/bear.png', unlocked: false }
  ],
  body: [
    { id: 'default_boy', name: 'Corps Garçon', rarity: 'common', price: 0, image: 'assets/avatars/bodies/default_boy.png', unlocked: true },
    { id: 'default_girl', name: 'Corps Fille', rarity: 'common', price: 0, image: 'assets/avatars/bodies/default_girl.png', unlocked: true },
    { id: 'bear', name: 'Corps d\'Ours', rarity: 'epic', price: 500, image: 'assets/avatars/bodies/bear.png', unlocked: false }
  ],
  accessory: [
    { id: 'none', name: 'Aucun', rarity: 'common', price: 0, image: 'assets/avatars/accessories/none.png', unlocked: true }
  ],
  background: [
    { id: 'default', name: 'Défaut', rarity: 'common', price: 0, image: 'assets/avatars/backgrounds/default.png', unlocked: true }
  ]
};

// Initialiser la page
document.addEventListener('DOMContentLoaded', function() {
  // Récupérer les données de l'utilisateur
  userData = getCurrentUser();

  if (!userData) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    window.location.href = 'auth.html';
    return;
  }

  // Initialiser l'avatar de l'utilisateur
  initUserAvatar();

  // Initialiser le modal de personnalisation
  initAvatarModal();

  // Initialiser l'inventaire des skins
  initSkinInventory();

  // Initialiser la boutique des skins
  initSkinShop();
});

// Initialiser l'avatar de l'utilisateur
function initUserAvatar() {
  console.log("Initialisation de l'avatar utilisateur pour:", userData.username);

  // Récupérer l'avatar de l'utilisateur ou utiliser les valeurs par défaut
  if (userData.avatar) {
    console.log("Avatar trouvé pour l'utilisateur");
    currentAvatar = userData.avatar;
  } else {
    console.log("Aucun avatar trouvé, création d'un avatar par défaut");
    // Créer un avatar par défaut
    userData.avatar = { ...currentAvatar };
    saveUserData();
  }

  // Initialiser les skins débloqués si nécessaire
  if (!userData.skins) {
    console.log("Initialisation des skins débloqués");
    userData.skins = {
      head: ['default'],
      body: ['default'],
      accessory: ['none'],
      background: ['default']
    };
    saveUserData();
  }

  // Vérifier si l'utilisateur est un administrateur mais n'a pas encore tous les skins débloqués
  if ((userData.isAdmin === true || userData.hasAllSkins === true) && !userData.skinsUnlocked) {
    console.log("Utilisateur admin ou ayant tous les skins débloqués - premier débloquage");
    // Débloquer tous les skins
    unlockAllSkinsForUser();
    // Marquer que les skins ont été débloqués pour éviter une boucle infinie
    userData.skinsUnlocked = true;
    saveUserData();
  }

  // Mettre à jour le catalogue des skins avec les skins débloqués par l'utilisateur
  updateSkinCatalog();

  // Afficher l'avatar actuel
  updateAvatarDisplay();

  // Ajouter un écouteur d'événement pour le bouton de personnalisation
  const customizeButton = document.getElementById('customize-avatar');
  if (customizeButton) {
    customizeButton.addEventListener('click', function() {
      openAvatarModal();
    });
  } else {
    console.error("Bouton de personnalisation non trouvé");
  }
}

// Mettre à jour le catalogue des skins avec les skins débloqués par l'utilisateur
function updateSkinCatalog() {
  console.log("Mise à jour du catalogue des skins");

  // Vérifier si l'utilisateur est un administrateur ou a tous les skins débloqués
  const isAdmin = userData.isAdmin === true;
  const hasAllSkins = userData.hasAllSkins === true;

  // Parcourir toutes les catégories
  Object.keys(skinCatalog).forEach(category => {
    // Si l'utilisateur a des skins dans cette catégorie
    if (userData.skins && userData.skins[category]) {
      // Parcourir tous les skins du catalogue
      skinCatalog[category].forEach(skin => {
        // Marquer le skin comme débloqué s'il est dans la liste des skins de l'utilisateur
        // ou si l'utilisateur est un administrateur ou a tous les skins débloqués
        if (userData.skins[category].includes(skin.id) || isAdmin || hasAllSkins) {
          skin.unlocked = true;

          // S'assurer que le skin est dans la liste des skins débloqués de l'utilisateur
          if ((isAdmin || hasAllSkins) && !userData.skins[category].includes(skin.id)) {
            userData.skins[category].push(skin.id);
          }
        }
      });
    }
  });

  // Si l'utilisateur est un administrateur ou a tous les skins débloqués,
  // s'assurer que le skin d'ours est débloqué
  if (isAdmin || hasAllSkins) {
    // S'assurer que les skins d'ours sont débloqués
    if (!userData.skins.head.includes('bear')) {
      userData.skins.head.push('bear');
    }

    if (!userData.skins.body.includes('bear')) {
      userData.skins.body.push('bear');
    }

    // Marquer les skins d'ours comme débloqués dans le catalogue
    const bearHeadSkin = skinCatalog.head.find(skin => skin.id === 'bear');
    const bearBodySkin = skinCatalog.body.find(skin => skin.id === 'bear');

    if (bearHeadSkin) bearHeadSkin.unlocked = true;
    if (bearBodySkin) bearBodySkin.unlocked = true;
  }

  console.log("Catalogue des skins mis à jour");
}

// Mettre à jour l'affichage de l'avatar
function updateAvatarDisplay() {
  // Récupérer les éléments d'avatar
  const currentAvatarElement = document.getElementById('current-avatar');
  const avatarPreviewElement = document.getElementById('avatar-preview');

  if (currentAvatarElement) {
    // Créer l'avatar
    currentAvatarElement.innerHTML = createAvatarHTML(currentAvatar);
  }

  if (avatarPreviewElement) {
    // Créer l'aperçu de l'avatar
    avatarPreviewElement.innerHTML = createAvatarHTML(currentAvatar);
  }
}

// Créer le HTML pour l'avatar
function createAvatarHTML(avatar) {
  // Récupérer les skins sélectionnés
  const head = getSkinById('head', avatar.head);
  const body = getSkinById('body', avatar.body);
  const accessory = getSkinById('accessory', avatar.accessory);
  const background = getSkinById('background', avatar.background);

  // Logs supprimés pour des raisons de sécurité

  // Créer le HTML avec des images de secours si les images ne sont pas trouvées
  return `
    <div class="avatar-background" style="background-color: #333; background-image: url('${background.image}')"></div>
    <div class="avatar-body" style="background-image: url('${body.image}')"></div>
    <div class="avatar-head" style="background-image: url('${head.image}')"></div>
    ${accessory.id !== 'none' ? `<div class="avatar-accessory" style="background-image: url('${accessory.image}')"></div>` : ''}
  `;
}

// Récupérer un skin par son ID
function getSkinById(category, id) {
  // Rechercher le skin dans le catalogue
  const skin = skinCatalog[category].find(skin => skin.id === id);

  // Si le skin n'est pas trouvé, utiliser le skin par défaut
  if (!skin) {
    return skinCatalog[category][0];
  }

  return skin;
}

// Initialiser le modal de personnalisation
function initAvatarModal() {
  const modal = document.getElementById('avatar-modal');
  const closeBtn = document.querySelector('.close-modal');
  const saveBtn = document.getElementById('save-avatar');
  const resetBtn = document.getElementById('reset-avatar');

  if (!modal) return;

  // Fermer le modal
  closeBtn.addEventListener('click', function() {
    closeAvatarModal();
  });

  // Fermer le modal en cliquant en dehors du contenu
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeAvatarModal();
    }
  });

  // Sauvegarder les modifications
  saveBtn.addEventListener('click', function() {
    // Mettre à jour l'avatar de l'utilisateur
    userData.avatar = { ...currentAvatar };

    // Sauvegarder les modifications
    saveUserData();

    // Mettre à jour l'affichage de l'avatar
    updateAvatarDisplay();

    // Fermer le modal
    closeAvatarModal();
  });

  // Réinitialiser l'avatar
  resetBtn.addEventListener('click', function() {
    // Réinitialiser l'avatar
    currentAvatar = {
      head: 'default',
      body: 'default',
      accessory: 'none',
      background: 'default'
    };

    // Mettre à jour l'affichage de l'avatar
    updateAvatarDisplay();

    // Mettre à jour la sélection dans le modal
    updateModalSelection();
  });

  // Charger les options d'avatar
  loadAvatarOptions();
}

// Ouvrir le modal de personnalisation
function openAvatarModal() {
  const modal = document.getElementById('avatar-modal');
  if (!modal) return;

  // Afficher le modal
  modal.style.display = 'block';

  // Mettre à jour la sélection dans le modal
  updateModalSelection();
}

// Fermer le modal de personnalisation
function closeAvatarModal() {
  const modal = document.getElementById('avatar-modal');
  if (!modal) return;

  // Masquer le modal
  modal.style.display = 'none';
}

// Charger les options d'avatar
function loadAvatarOptions() {
  // Charger les options pour chaque catégorie
  loadCategoryOptions('head');
  loadCategoryOptions('body');
  loadCategoryOptions('accessory');
  loadCategoryOptions('background');
}

// Charger les options pour une catégorie
function loadCategoryOptions(category) {
  const container = document.getElementById(`${category}-items`);
  if (!container) return;

  // Vider le conteneur
  container.innerHTML = '';

  // Ajouter chaque option à la liste
  skinCatalog[category].forEach(skin => {
    // Vérifier si le skin est débloqué
    const isUnlocked = skin.unlocked || (userData.skins && userData.skins[category] && userData.skins[category].includes(skin.id));

    // Créer l'élément d'option
    const optionElement = document.createElement('div');
    optionElement.className = `avatar-item ${currentAvatar[category] === skin.id ? 'selected' : ''} ${isUnlocked ? '' : 'locked'}`;
    optionElement.dataset.id = skin.id;
    optionElement.dataset.category = category;

    // Ajouter l'image
    optionElement.innerHTML = `
      <img src="${skin.image}" alt="${skin.name}">
      ${!isUnlocked ? '<div class="avatar-item-locked"><i class="fas fa-lock"></i></div>' : ''}
    `;

    // Ajouter un écouteur d'événement pour la sélection
    if (isUnlocked) {
      optionElement.addEventListener('click', function() {
        // Mettre à jour l'avatar
        currentAvatar[category] = skin.id;

        // Mettre à jour l'affichage de l'avatar
        updateAvatarDisplay();

        // Mettre à jour la sélection dans le modal
        updateModalSelection();
      });
    }

    // Ajouter l'option au conteneur
    container.appendChild(optionElement);
  });
}

// Mettre à jour la sélection dans le modal
function updateModalSelection() {
  // Mettre à jour la sélection pour chaque catégorie
  updateCategorySelection('head');
  updateCategorySelection('body');
  updateCategorySelection('accessory');
  updateCategorySelection('background');
}

// Mettre à jour la sélection pour une catégorie
function updateCategorySelection(category) {
  const container = document.getElementById(`${category}-items`);
  if (!container) return;

  // Retirer la classe 'selected' de toutes les options
  container.querySelectorAll('.avatar-item').forEach(item => {
    item.classList.remove('selected');
  });

  // Ajouter la classe 'selected' à l'option sélectionnée
  const selectedOption = container.querySelector(`.avatar-item[data-id="${currentAvatar[category]}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }
}

// Initialiser l'inventaire des skins
function initSkinInventory() {
  const inventoryContainer = document.getElementById('skins-inventory');
  if (!inventoryContainer) return;

  // Initialiser les filtres
  initInventoryFilters();

  // Charger les skins
  loadInventorySkins('all');
}

// Initialiser les filtres de l'inventaire
function initInventoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Retirer la classe 'active' de tous les boutons
      filterButtons.forEach(btn => btn.classList.remove('active'));

      // Ajouter la classe 'active' au bouton cliqué
      button.classList.add('active');

      // Charger les skins correspondant au filtre
      loadInventorySkins(button.dataset.filter);
    });
  });
}

// Charger les skins de l'inventaire
function loadInventorySkins(filter) {
  const inventoryContainer = document.getElementById('skins-inventory');
  if (!inventoryContainer) return;

  // Vider le conteneur
  inventoryContainer.innerHTML = '';

  // Récupérer les skins débloqués
  const unlockedSkins = [];

  // Parcourir toutes les catégories
  Object.keys(skinCatalog).forEach(category => {
    // Si un filtre est appliqué et que ce n'est pas 'all', ignorer les autres catégories
    if (filter !== 'all' && filter !== category) return;

    // Parcourir tous les skins de la catégorie
    skinCatalog[category].forEach(skin => {
      // Vérifier si le skin est débloqué
      const isUnlocked = skin.unlocked || (userData.skins && userData.skins[category] && userData.skins[category].includes(skin.id));

      // Si le skin est débloqué, l'ajouter à la liste
      if (isUnlocked) {
        unlockedSkins.push({
          ...skin,
          category,
          equipped: currentAvatar[category] === skin.id
        });
      }
    });
  });

  // Si aucun skin n'est débloqué, afficher un message
  if (unlockedSkins.length === 0) {
    inventoryContainer.innerHTML = `
      <div class="empty-inventory">
        <p>Vous n'avez pas encore de skins dans cette catégorie. Visitez la boutique pour en acheter !</p>
      </div>
    `;
    return;
  }

  // Ajouter chaque skin à l'inventaire
  unlockedSkins.forEach(skin => {
    const skinElement = document.createElement('div');
    skinElement.className = 'skin-item';
    skinElement.setAttribute('data-id', skin.id);

    skinElement.innerHTML = `
      <div class="skin-image">
        <img src="${skin.image}" alt="${skin.name}">
        ${skin.equipped ? '<div class="skin-equipped"><i class="fas fa-check"></i></div>' : ''}
      </div>
      <div class="skin-content">
        <h3 class="skin-title">${skin.name}</h3>
        <div class="skin-rarity ${skin.rarity}">${capitalizeFirstLetter(skin.rarity)}</div>
        <button class="btn-equip ${skin.equipped ? 'equipped' : ''}" data-category="${skin.category}" data-id="${skin.id}">
          ${skin.equipped ? 'Équipé' : 'Équiper'}
        </button>
      </div>
    `;

    // Ajouter un écouteur d'événement pour le bouton d'équipement
    skinElement.querySelector('.btn-equip').addEventListener('click', function() {
      // Mettre à jour l'avatar
      currentAvatar[skin.category] = skin.id;

      // Mettre à jour l'affichage de l'avatar
      updateAvatarDisplay();

      // Mettre à jour l'avatar de l'utilisateur
      userData.avatar = { ...currentAvatar };

      // Sauvegarder les modifications
      saveUserData();

      // Recharger l'inventaire
      loadInventorySkins(filter);
    });

    // Ajouter le skin à l'inventaire
    inventoryContainer.appendChild(skinElement);
  });
}

// Initialiser la boutique des skins
function initSkinShop() {
  const shopContainer = document.getElementById('skins-shop');
  if (!shopContainer) return;

  // Charger les skins de la boutique
  loadShopSkins();
}

// Charger les skins de la boutique
function loadShopSkins() {
  const shopContainer = document.getElementById('skins-shop');
  if (!shopContainer) return;

  // Vider le conteneur
  shopContainer.innerHTML = '';

  // Récupérer les skins disponibles à l'achat
  const availableSkins = [];

  // Parcourir toutes les catégories
  Object.keys(skinCatalog).forEach(category => {
    // Parcourir tous les skins de la catégorie
    skinCatalog[category].forEach(skin => {
      // Ignorer les skins gratuits
      if (skin.price === 0) return;

      // Vérifier si le skin est déjà débloqué
      const isUnlocked = skin.unlocked || (userData.skins && userData.skins[category] && userData.skins[category].includes(skin.id));

      // Si le skin n'est pas débloqué, l'ajouter à la liste
      if (!isUnlocked) {
        availableSkins.push({
          ...skin,
          category
        });
      }
    });
  });

  // Si aucun skin n'est disponible, afficher un message
  if (availableSkins.length === 0) {
    shopContainer.innerHTML = `
      <div class="empty-shop">
        <p>Vous avez débloqué tous les skins disponibles. Félicitations !</p>
      </div>
    `;
    return;
  }

  // Ajouter chaque skin à la boutique
  availableSkins.forEach(skin => {
    const skinElement = document.createElement('div');
    skinElement.className = 'skin-item';
    skinElement.setAttribute('data-id', skin.id);

    // Vérifier si l'utilisateur a assez de pièces pour acheter le skin
    const canAfford = (userData.coins || 0) >= skin.price;

    skinElement.innerHTML = `
      <div class="skin-image">
        <img src="${skin.image}" alt="${skin.name}">
      </div>
      <div class="skin-content">
        <h3 class="skin-title">${skin.name}</h3>
        <div class="skin-rarity ${skin.rarity}">${capitalizeFirstLetter(skin.rarity)}</div>
        <div class="skin-price">
          <i class="fas fa-coins"></i>
          <span>${skin.price}</span>
        </div>
        <button class="buy-btn" data-category="${skin.category}" data-id="${skin.id}" data-price="${skin.price}" ${!canAfford ? 'disabled' : ''}>
          ${canAfford ? 'Acheter' : 'Pas assez de pièces'}
        </button>
      </div>
    `;

    // Ajouter un écouteur d'événement pour le bouton d'achat
    if (canAfford) {
      skinElement.querySelector('.buy-btn').addEventListener('click', function() {
        // Acheter le skin
        buySkin(skin.category, skin.id, skin.price);
      });
    }

    // Ajouter le skin à la boutique
    shopContainer.appendChild(skinElement);
  });
}

// Acheter un skin
function buySkin(category, id, price) {
  // Vérifier si l'utilisateur a assez de pièces
  if ((userData.coins || 0) < price) {
    alert('Vous n\'avez pas assez de pièces pour acheter ce skin');
    return;
  }

  // Déduire le prix des pièces de l'utilisateur
  userData.coins -= price;

  // Ajouter le skin à l'inventaire de l'utilisateur
  if (!userData.skins) {
    userData.skins = {};
  }

  if (!userData.skins[category]) {
    userData.skins[category] = [];
  }

  userData.skins[category].push(id);

  // Sauvegarder les modifications
  saveUserData();

  // Mettre à jour l'affichage des pièces
  document.getElementById('user-coins').textContent = userData.coins;

  // Recharger la boutique
  loadShopSkins();

  // Recharger l'inventaire
  loadInventorySkins('all');

  // Afficher un message de succès
  alert(`Vous avez acheté le skin "${getSkinById(category, id).name}" avec succès !`);
}

// Sauvegarder les données de l'utilisateur
function saveUserData() {
  // Récupérer tous les utilisateurs
  const users = getUsers();

  // Trouver l'ID de l'utilisateur actuel
  const userId = Object.keys(users).find(id => users[id].username === userData.username);

  if (userId) {
    // Mettre à jour les données de l'utilisateur
    users[userId] = userData;

    // Sauvegarder les modifications
    saveUsers(users);

    // Mettre à jour l'utilisateur courant
    setCurrentUser(userData);
  }
}

// Mettre en majuscule la première lettre d'une chaîne
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Débloquer tous les skins pour l'utilisateur actuel
function unlockAllSkinsForUser() {
  console.log("Débloquage de tous les skins pour l'utilisateur");

  // Initialiser les skins débloqués si nécessaire
  if (!userData.skins) {
    userData.skins = {};
  }

  // S'assurer que le skin d'ours est inclus explicitement
  userData.skins = {
    head: ['default_boy', 'default_girl', 'bear'],
    body: ['default_boy', 'default_girl', 'bear'],
    accessory: ['none'],
    background: ['default']
  };

  // Parcourir toutes les catégories du catalogue pour s'assurer que tous les skins sont débloqués
  Object.keys(skinCatalog).forEach(category => {
    // Récupérer tous les IDs de skins pour cette catégorie
    const skinIds = skinCatalog[category].map(skin => skin.id);

    // S'assurer que tous les skins sont dans la liste des skins débloqués
    skinIds.forEach(id => {
      if (!userData.skins[category].includes(id)) {
        userData.skins[category].push(id);
      }
    });
  });

  // Marquer que tous les skins sont débloqués
  userData.hasAllSkins = true;
  userData.skinsUnlocked = true;

  // Sauvegarder les modifications
  saveUserData();

  console.log("Tous les skins ont été débloqués pour l'utilisateur:", userData.skins);
}
