// État de la boutique
let shopItems = [];
let userCoins = 0;

// Initialisation de la boutique
async function loadShopItems() {
    const user = await getCurrentUser();
    if (!user) return;

    // Charger les pièces de l'utilisateur
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
        userCoins = userDoc.data().coins || 0;
        document.getElementById('coins').textContent = userCoins;
    }

    // Charger tous les items disponibles
    shopItems = [];
    Object.entries(avatarConfig).forEach(([category, items]) => {
        Object.entries(items).forEach(([id, item]) => {
            shopItems.push({
                id,
                ...item
            });
        });
    });

    // Filtrer les items déjà possédés
    const userInventory = userDoc.data().inventory || [];
    shopItems = shopItems.filter(item => !userInventory.includes(item.id));

    // Afficher les items
    displayShopItems();
}

// Afficher les items de la boutique
function displayShopItems(filter = 'all') {
    const shopGrid = document.getElementById('shopItems');
    shopGrid.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? shopItems 
        : shopItems.filter(item => item.type === filter);

    filteredItems.forEach(item => {
        const itemElement = createShopItemElement(item);
        shopGrid.appendChild(itemElement);
    });
}

// Créer un élément d'item de boutique
function createShopItemElement(item) {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.dataset.id = item.id;
    div.dataset.type = item.type;

    div.innerHTML = `
        <div class="shop-item-image">
            <img src="${item.path}" alt="${item.name}">
        </div>
        <div class="shop-item-info">
            <h3 class="shop-item-name">${item.name}</h3>
            <div class="shop-item-price">
                <i class="fas fa-coins"></i>
                <span>${item.price}</span>
            </div>
            <button class="btn btn-primary btn-sm" ${userCoins < item.price ? 'disabled' : ''}>
                Acheter
            </button>
        </div>
    `;

    const buyButton = div.querySelector('button');
    buyButton.addEventListener('click', () => purchaseItem(item));

    return div;
}

// Acheter un item
async function purchaseItem(item) {
    const user = await getCurrentUser();
    if (!user) return;

    if (userCoins < item.price) {
        alert('Vous n\'avez pas assez de pièces !');
        return;
    }

    try {
        // Mettre à jour l'inventaire et les pièces de l'utilisateur
        await db.collection('users').doc(user.uid).update({
            inventory: firebase.firestore.FieldValue.arrayUnion(item.id),
            coins: firebase.firestore.FieldValue.increment(-item.price)
        });

        // Mettre à jour l'interface
        userCoins -= item.price;
        document.getElementById('coins').textContent = userCoins;

        // Retirer l'item de la boutique
        shopItems = shopItems.filter(shopItem => shopItem.id !== item.id);
        displayShopItems();

        // Mettre à jour l'inventaire
        loadInventory();

        alert('Achat réussi !');
    } catch (error) {
        console.error('Erreur lors de l\'achat:', error);
        alert('Erreur lors de l\'achat. Veuillez réessayer.');
    }
}

// Gestionnaire de filtres
document.querySelectorAll('.shop-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Mettre à jour l'état actif des boutons
        document.querySelectorAll('.shop-filters .filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');

        // Filtrer les items
        displayShopItems(btn.dataset.filter);
    });
}); 