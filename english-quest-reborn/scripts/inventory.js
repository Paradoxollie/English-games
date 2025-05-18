// État de l'inventaire
let inventoryItems = [];

// Initialisation de l'inventaire
async function loadInventory() {
    const user = await getCurrentUser();
    if (!user) return;

    // Charger l'inventaire de l'utilisateur
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
        const userInventory = userDoc.data().inventory || [];
        
        // Convertir les IDs en objets complets
        inventoryItems = userInventory.map(id => {
            // Chercher l'item dans toutes les catégories
            for (const category of Object.values(avatarConfig)) {
                if (category[id]) {
                    return {
                        id,
                        ...category[id]
                    };
                }
            }
            return null;
        }).filter(item => item !== null);

        // Afficher les items
        displayInventoryItems();
    }
}

// Afficher les items de l'inventaire
function displayInventoryItems(filter = 'all') {
    const inventoryGrid = document.getElementById('inventoryItems');
    inventoryGrid.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? inventoryItems 
        : inventoryItems.filter(item => item.type === filter);

    filteredItems.forEach(item => {
        const itemElement = createInventoryItemElement(item);
        inventoryGrid.appendChild(itemElement);
    });
}

// Créer un élément d'item d'inventaire
function createInventoryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.dataset.id = item.id;
    div.dataset.type = item.type;

    const isEquipped = currentAvatar[item.type] === item.id;

    div.innerHTML = `
        <div class="inventory-item-image">
            <img src="${item.path}" alt="${item.name}">
            ${isEquipped ? '<div class="equipped-badge">Équipé</div>' : ''}
        </div>
        <div class="inventory-item-info">
            <h3 class="inventory-item-name">${item.name}</h3>
            <div class="inventory-item-type">${getTypeLabel(item.type)}</div>
            <button class="btn ${isEquipped ? 'btn-secondary' : 'btn-primary'} btn-sm">
                ${isEquipped ? 'Déséquiper' : 'Équiper'}
            </button>
        </div>
    `;

    const equipButton = div.querySelector('button');
    equipButton.addEventListener('click', () => toggleEquipItem(item));

    return div;
}

// Obtenir le libellé du type d'item
function getTypeLabel(type) {
    const labels = {
        head: 'Tête',
        body: 'Corps',
        accessory: 'Accessoire',
        background: 'Arrière-plan'
    };
    return labels[type] || type;
}

// Équiper/Déséquiper un item
async function toggleEquipItem(item) {
    const isEquipped = currentAvatar[item.type] === item.id;

    if (isEquipped) {
        // Déséquiper l'item
        currentAvatar[item.type] = item.type === 'accessory' ? null : `default_${item.type === 'head' || item.type === 'body' ? 'boy' : 'classroom'}`;
    } else {
        // Équiper l'item
        currentAvatar[item.type] = item.id;
    }

    // Mettre à jour l'interface
    updateAvatarPreview();
    displayInventoryItems();
    saveAvatar();
}

// Gestionnaire de filtres
document.querySelectorAll('.inventory-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Mettre à jour l'état actif des boutons
        document.querySelectorAll('.inventory-filters .filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');

        // Filtrer les items
        displayInventoryItems(btn.dataset.filter);
    });
}); 