import { authService } from './auth-service.js';

class SkinService {
  constructor() {
    this.defaultSkins = {
      head: [
        { id: 'default_boy_head', name: 'Garçon', price: 0, image: 'assets/avatars/heads/default_boy.png' },
        { id: 'default_girl_head', name: 'Fille', price: 0, image: 'assets/avatars/heads/default_girl.png' },
        { id: 'bear_head', name: 'Ours', price: 100, image: 'assets/avatars/heads/bear.png' }
      ],
      body: [
        { id: 'default_boy_body', name: 'Garçon', price: 0, image: 'assets/avatars/bodies/default_boy.png' },
        { id: 'default_girl_body', name: 'Fille', price: 0, image: 'assets/avatars/bodies/default_girl.png' },
        { id: 'bear_body', name: 'Ours', price: 100, image: 'assets/avatars/bodies/bear.png' }
      ],
      accessory: [
        { id: 'none', name: 'Aucun', price: 0 }
      ],
      background: [
        { id: 'default_background', name: 'Défaut', price: 0, image: 'assets/avatars/backgrounds/default.png' }
      ]
    };
  }

  getAvailableSkins() {
    return this.defaultSkins;
  }

  async buySkin(skinId, skinType) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      const skinToBuy = this.defaultSkins[skinType]?.find(s => s.id === skinId);
      if (!skinToBuy) {
        return { success: false, error: 'Skin non trouvé' };
      }

      const currentInventory = JSON.parse(JSON.stringify(user.inventory || { skins: {}, items: [] }));
      if (!currentInventory.skins) currentInventory.skins = {};
      if (!currentInventory.skins[skinType]) currentInventory.skins[skinType] = [];

      const alreadyOwned = currentInventory.skins[skinType].includes(skinId);
      if (alreadyOwned) {
        return { success: false, error: 'Vous possédez déjà ce skin' };
      }

      if (user.coins < skinToBuy.price) {
        return { success: false, error: 'Pas assez de pièces' };
      }

      currentInventory.skins[skinType].push(skinId);
      const newCoins = user.coins - skinToBuy.price;

      await authService.updateProfile({
        inventory: currentInventory,
        coins: newCoins
      });
      
      return { success: true, skin: skinToBuy };

    } catch (error) {
      console.error('SkinService Buy Error:', error);
      return { success: false, error: 'Erreur lors de l\'achat: ' + (error.message || 'Erreur inconnue') };
    }
  }

  async equipSkin(skinId, skinType) {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      const ownedSkinsForType = user.inventory?.skins?.[skinType] || [];
      const isDefaultFreeSkin = this.defaultSkins[skinType]?.find(s => s.id === skinId && s.price === 0);

      if (!ownedSkinsForType.includes(skinId) && !isDefaultFreeSkin) {
        return { success: false, error: 'Vous ne possédez pas ce skin' };
      }

      const currentAvatar = user.avatar || {};
      const updatedAvatar = { ...currentAvatar, [skinType]: skinId };

      await authService.updateProfile({
        avatar: updatedAvatar
      });
      return { success: true, avatar: updatedAvatar };
    } catch (error) {
      console.error('SkinService Equip Error:', error);
      return { success: false, error: 'Erreur lors de l\'équipement: ' + (error.message || 'Erreur inconnue') };
    }
  }

  generateAvatarUrl(avatar) {
    // This is a simplified version for header or small displays
    const user = authService.getCurrentUser();
    let defaultHeadId = 'default_boy_head';
    // A profile.gender field could be used here for a better default
    if (user?.gender === 'female' && this.defaultSkins.head.find(s => s.id === 'default_girl_head')) {
        defaultHeadId = 'default_girl_head';
    }
    
    const headIdToUse = avatar?.head || defaultHeadId;
    const headSkin = this.defaultSkins.head.find(s => s.id === headIdToUse);
    
    return headSkin ? headSkin.image : 'assets/avatars/heads/default_boy.png';
  }
}

export const skinService = new SkinService();
