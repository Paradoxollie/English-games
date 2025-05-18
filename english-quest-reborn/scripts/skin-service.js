import { authService } from './auth-service.js';

class SkinService {
  constructor() {
    this.defaultSkins = {
      head: [
        { id: 'default_boy', name: 'Garçon', price: 0, image: 'assets/avatars/heads/default_boy.png' },
        { id: 'default_girl', name: 'Fille', price: 0, image: 'assets/avatars/heads/default_girl.png' },
        { id: 'bear', name: 'Ours', price: 100, image: 'assets/avatars/heads/bear.png' },
        { id: 'fox', name: 'Renard', price: 150, image: 'assets/avatars/heads/fox.png' },
        { id: 'cat', name: 'Chat', price: 200, image: 'assets/avatars/heads/cat.png' }
      ],
      body: [
        { id: 'default_boy', name: 'Garçon', price: 0, image: 'assets/avatars/bodies/default_boy.png' },
        { id: 'default_girl', name: 'Fille', price: 0, image: 'assets/avatars/bodies/default_girl.png' },
        { id: 'knight', name: 'Chevalier', price: 200, image: 'assets/avatars/bodies/knight.png' },
        { id: 'wizard', name: 'Magicien', price: 250, image: 'assets/avatars/bodies/wizard.png' },
        { id: 'ninja', name: 'Ninja', price: 300, image: 'assets/avatars/bodies/ninja.png' }
      ],
      accessory: [
        { id: 'none', name: 'Aucun', price: 0, image: 'assets/avatars/accessories/none.png' },
        { id: 'hat', name: 'Chapeau', price: 100, image: 'assets/avatars/accessories/hat.png' },
        { id: 'glasses', name: 'Lunettes', price: 150, image: 'assets/avatars/accessories/glasses.png' },
        { id: 'crown', name: 'Couronne', price: 500, image: 'assets/avatars/accessories/crown.png' }
      ],
      background: [
        { id: 'default', name: 'Défaut', price: 0, image: 'assets/avatars/backgrounds/default.png' },
        { id: 'forest', name: 'Forêt', price: 200, image: 'assets/avatars/backgrounds/forest.png' },
        { id: 'castle', name: 'Château', price: 300, image: 'assets/avatars/backgrounds/castle.png' },
        { id: 'space', name: 'Espace', price: 400, image: 'assets/avatars/backgrounds/space.png' }
      ]
    };
  }

  // Obtenir tous les skins disponibles
  getAvailableSkins() {
    return this.defaultSkins;
  }

  // Obtenir les skins possédés par l'utilisateur
  async getUserSkins() {
    const userData = await authService.loadUserData();
    return userData?.inventory || [];
  }

  // Acheter un skin
  async buySkin(skinId, skinType) {
    const userData = await authService.loadUserData();
    if (!userData) return { success: false, error: 'Utilisateur non connecté' };

    const skin = this.defaultSkins[skinType].find(s => s.id === skinId);
    if (!skin) return { success: false, error: 'Skin non trouvé' };

    // Vérifier si l'utilisateur possède déjà le skin
    if (userData.inventory.some(s => s.id === skinId && s.type === skinType)) {
      return { success: false, error: 'Vous possédez déjà ce skin' };
    }

    // Vérifier si l'utilisateur a assez de pièces
    if (userData.coins < skin.price) {
      return { success: false, error: 'Pas assez de pièces' };
    }

    try {
      // Ajouter le skin à l'inventaire
      const updatedInventory = [...userData.inventory, { ...skin, type: skinType }];
      
      // Mettre à jour le profil
      await authService.updateProfile({
        inventory: updatedInventory,
        coins: userData.coins - skin.price
      });

      return { success: true, skin };
    } catch (error) {
      console.error('Erreur lors de l\'achat du skin:', error);
      return { success: false, error: 'Erreur lors de l\'achat' };
    }
  }

  // Équiper un skin
  async equipSkin(skinId, skinType) {
    const userData = await authService.loadUserData();
    if (!userData) return { success: false, error: 'Utilisateur non connecté' };

    // Vérifier si l'utilisateur possède le skin
    const ownedSkin = userData.inventory.find(s => s.id === skinId && s.type === skinType);
    if (!ownedSkin) {
      return { success: false, error: 'Vous ne possédez pas ce skin' };
    }

    try {
      // Mettre à jour l'avatar
      const currentAvatar = userData.avatar || {};
      const updatedAvatar = { ...currentAvatar, [skinType]: skinId };

      await authService.updateProfile({
        avatar: updatedAvatar
      });

      return { success: true, avatar: updatedAvatar };
    } catch (error) {
      console.error('Erreur lors de l\'équipement du skin:', error);
      return { success: false, error: 'Erreur lors de l\'équipement' };
    }
  }

  // Générer l'URL de l'avatar complet
  generateAvatarUrl(avatar) {
    if (!avatar) return 'assets/avatars/default-avatar.png';

    const { head = 'default_boy', body = 'default_boy', accessory = 'none', background = 'default' } = avatar;
    
    // Dans une implémentation réelle, vous devriez avoir une image composite
    // Pour l'instant, nous utilisons juste l'image de la tête
    return `assets/avatars/heads/${head}.png`;
  }
}

export const skinService = new SkinService(); 