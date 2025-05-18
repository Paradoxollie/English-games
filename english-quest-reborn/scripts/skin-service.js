import { authService } from './auth-service.js';

class SkinService {
  constructor() {
    // Utiliser les vrais chemins d'accès aux assets d'avatar
    this.defaultSkins = {
      head: [
        { id: 'default_boy', name: 'Garçon', price: 0, image: 'assets/avatars/heads/default_boy.png' },
        { id: 'default_girl', name: 'Fille', price: 0, image: 'assets/avatars/heads/default_girl.png' },
        { id: 'bear', name: 'Ours', price: 100, image: 'assets/avatars/heads/bear.png' }
      ],
      body: [
        { id: 'default_boy', name: 'Garçon', price: 0, image: 'assets/avatars/bodies/default_boy.png' },
        { id: 'default_girl', name: 'Fille', price: 0, image: 'assets/avatars/bodies/default_girl.png' },
        { id: 'bear', name: 'Ours', price: 200, image: 'assets/avatars/bodies/bear.png' }
      ],
      accessory: [
        { id: 'none', name: 'Aucun', price: 0, image: 'assets/avatars/accessories/none.png' }
      ],
      background: [
        { id: 'default', name: 'Défaut', price: 0, image: 'assets/avatars/backgrounds/default.png' }
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
      const updatedInventory = [...userData.inventory, { id: skinId, type: skinType }];
      
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
    const hasSkin = userData.inventory.some(item => item.id === skinId && item.type === skinType);
    if (!hasSkin) {
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
    if (!avatar) {
      return 'assets/avatars/heads/default_boy.png'; // Avatar par défaut
    }

    // Retourner l'URL de la tête (partie principale visible sur l'avatar dans le header)
    const headType = avatar.head || 'default_boy';
    return `assets/avatars/heads/${headType}.png`;
  }
}

export const skinService = new SkinService(); 