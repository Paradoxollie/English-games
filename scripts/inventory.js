// État de l'inventaire
let inventoryItems = [];

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (user) {
        await loadInventory(user.uid);
        initializeInventoryUI();
    }
});

// Chargement de l'inventaire
async function loadInventory(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const inventory = userDoc.data().inventory || [];
            
            // Récupérer tous les items possédés
            inventoryItems = [
                ...avatarConfig.heads,
                ...avatarConfig.bodies,
                ...avatarConfig.accessories,
                ...avatarConfig.backgrounds
            ].filter(item => inventory.includes(item.id));

            displayInventoryItems();
        }
    } catch (error) {
        console.error('Erreur lors du chargement de l\'inventaire:', error);
    }
}

// Initialisation de l'interface de l'inventaire
function initializeInventoryUI() {
    // Gestion des filtres
    const filterButtons = document.querySelectorAll('.inventory-filters .filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayInventoryItems(button.dataset.filter);
        });
    });
}

// Affichage des items de l'inventaire
function displayInventoryItems(filter = 'all') {
    const inventoryGrid = document.getElementById('inventoryItems');
    if (!inventoryGrid) return;

    inventoryGrid.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? inventoryItems 
        : inventoryItems.filter(item => item.type === filter);

    filteredItems.forEach(item => {
        const itemElement = createInventoryItemElement(item);
        inventoryGrid.appendChild(itemElement);
    });
}

// Création d'un élément d'item d'inventaire
function createInventoryItemElement(item) {
    const div = document.createElement('div');
    div.className = `inventory-item rarity-${item.rarity}`;
    
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    
    const info = document.createElement('div');
    info.className = 'inventory-item-info';
    
    const name = document.createElement('div');
    name.className = 'inventory-item-name';
    name.textContent = item.name;
    
    const type = document.createElement('div');
    type.className = 'inventory-item-type';
    type.textContent = getTypeLabel(item.type);
    
    const equipButton = document.createElement('button');
    equipButton.className = 'equip-btn';
    equipButton.textContent = 'Équiper';
    equipButton.addEventListener('click', () => equipItem(item));
    
    info.appendChild(name);
    info.appendChild(type);
    
    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(equipButton);
    
    return div;
}

// Équiper un item
async function equipItem(item) {
    const user = await getCurrentUser();
    if (!user) return;

    try {
        // Mettre à jour l'avatar de l'utilisateur
        await db.collection('users').doc(user.uid).update({
            [`avatar.${item.type}`]: item.id
        });

        // Mettre à jour l'aperçu de l'avatar
        currentAvatar[item.type] = item.id;
        updateAvatarPreview();

        alert('Item équipé avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'équipement:', error);
        alert('Une erreur est survenue lors de l\'équipement.');
    }
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