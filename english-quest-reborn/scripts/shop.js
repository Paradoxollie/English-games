// État de la boutique
let shopItems = [];
let userCoins = 0;

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (user) {
        await loadShopItems(user.uid);
        initializeShopUI();
    }
});

// Chargement des items de la boutique
async function loadShopItems(userId) {
    try {
        // Récupérer les pièces de l'utilisateur
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            userCoins = userDoc.data().coins || 0;
            document.getElementById('userCoins').textContent = userCoins;
        }

        // Récupérer l'inventaire de l'utilisateur
        const inventory = userDoc.data().inventory || [];
        
        // Filtrer les items déjà possédés
        shopItems = [
            ...avatarConfig.heads,
            ...avatarConfig.bodies,
            ...avatarConfig.accessories,
            ...avatarConfig.backgrounds
        ].filter(item => !inventory.includes(item.id));

        displayShopItems();
    } catch (error) {
        console.error('Erreur lors du chargement de la boutique:', error);
    }
}

// Initialisation de l'interface de la boutique
function initializeShopUI() {
    // Gestion des filtres
    const filterButtons = document.querySelectorAll('.shop-filters .filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayShopItems(button.dataset.filter);
        });
    });
}

// Affichage des items de la boutique
function displayShopItems(filter = 'all') {
    const shopGrid = document.getElementById('shopItems');
    if (!shopGrid) return;

    shopGrid.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? shopItems 
        : shopItems.filter(item => item.rarity === filter);

    filteredItems.forEach(item => {
        const itemElement = createShopItemElement(item);
        shopGrid.appendChild(itemElement);
    });
}

// Création d'un élément d'item de boutique
function createShopItemElement(item) {
    const div = document.createElement('div');
    div.className = `shop-item rarity-${item.rarity}`;
    
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    
    const info = document.createElement('div');
    info.className = 'shop-item-info';
    
    const name = document.createElement('div');
    name.className = 'shop-item-name';
    name.textContent = item.name;
    
    const price = document.createElement('div');
    price.className = 'shop-item-price';
    price.innerHTML = `<i class="fas fa-coins"></i> ${item.price}`;
    
    const buyButton = document.createElement('button');
    buyButton.className = 'buy-btn';
    buyButton.textContent = 'Acheter';
    buyButton.disabled = userCoins < item.price;
    buyButton.addEventListener('click', () => purchaseItem(item));
    
    info.appendChild(name);
    info.appendChild(price);
    
    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(buyButton);
    
    return div;
}

// Achat d'un item
async function purchaseItem(item) {
    const user = await getCurrentUser();
    if (!user) return;

    try {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        const currentCoins = userData.coins || 0;
        
        if (currentCoins < item.price) {
            alert('Vous n\'avez pas assez de pièces !');
            return;
        }
        
        // Mettre à jour l'inventaire et les pièces
        await userRef.update({
            coins: currentCoins - item.price,
            inventory: [...(userData.inventory || []), item.id]
        });
        
        // Mettre à jour l'interface
        userCoins = currentCoins - item.price;
        document.getElementById('userCoins').textContent = userCoins;
        
        // Retirer l'item de la boutique
        shopItems = shopItems.filter(i => i.id !== item.id);
        displayShopItems();
        
        alert('Achat réussi !');
    } catch (error) {
        console.error('Erreur lors de l\'achat:', error);
        alert('Une erreur est survenue lors de l\'achat.');
    }
} 