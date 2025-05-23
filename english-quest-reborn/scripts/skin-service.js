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
        { id: 'none', name: 'Aucun', price: 0, image: 'assets/avatars/accessories/none.png' },
        { id: 'test_accessory', name: 'Test', price: 50, image: 'assets/avatars/heads/bear.png' }
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
      console.log(`[SkinService] ===== STARTING PURCHASE =====`);
      console.log(`[SkinService] Starting purchase: ${skinId} (${skinType})`);
      
      const user = authService.getCurrentUser();
      if (!user) {
        console.log(`[SkinService] ERROR: User not connected`);
        return { success: false, error: 'Utilisateur non connecté' };
      }
      console.log(`[SkinService] Current user:`, user);
      console.log(`[SkinService] Current user coins: ${user.coins}`);
      console.log(`[SkinService] Current user inventory:`, JSON.stringify(user.inventory, null, 2));

      const skinToBuy = this.defaultSkins[skinType]?.find(s => s.id === skinId);
      if (!skinToBuy) {
        console.log(`[SkinService] ERROR: Skin not found: ${skinId} in ${skinType}`);
        return { success: false, error: 'Skin non trouvé' };
      }
      console.log(`[SkinService] Skin to buy:`, skinToBuy);

      const currentInventory = JSON.parse(JSON.stringify(user.inventory || { skins: {}, items: [] }));
      console.log(`[SkinService] Initial inventory copy:`, JSON.stringify(currentInventory, null, 2));
      
      if (!currentInventory.skins) {
        console.log(`[SkinService] Creating skins object`);
        currentInventory.skins = {};
      }
      if (!currentInventory.skins[skinType]) {
        console.log(`[SkinService] Creating ${skinType} array`);
        currentInventory.skins[skinType] = [];
      }

      console.log(`[SkinService] Current inventory for ${skinType}:`, currentInventory.skins[skinType]);

      const alreadyOwned = currentInventory.skins[skinType].includes(skinId);
      if (alreadyOwned) {
        console.log(`[SkinService] ERROR: Already owned: ${skinId}`);
        return { success: false, error: 'Vous possédez déjà ce skin' };
      }

      if (user.coins < skinToBuy.price) {
        console.log(`[SkinService] ERROR: Not enough coins: ${user.coins} < ${skinToBuy.price}`);
        return { success: false, error: 'Pas assez de pièces' };
      }

      console.log(`[SkinService] Adding ${skinId} to ${skinType} inventory...`);
      currentInventory.skins[skinType].push(skinId);
      const newCoins = user.coins - skinToBuy.price;

      console.log(`[SkinService] New inventory for ${skinType}:`, currentInventory.skins[skinType]);
      console.log(`[SkinService] New coins: ${newCoins}`);
      console.log(`[SkinService] Complete new inventory:`, JSON.stringify(currentInventory, null, 2));

      const updateData = {
        inventory: currentInventory,
        coins: newCoins
      };
      console.log(`[SkinService] Updating profile with:`, JSON.stringify(updateData, null, 2));

      const updateResult = await authService.updateProfile(updateData);
      console.log(`[SkinService] Update result:`, updateResult);
      
      if (updateResult.success) {
        console.log(`[SkinService] ===== PURCHASE SUCCESSFUL =====`);
        console.log(`[SkinService] Purchase successful for ${skinId}`);
        
        // Let's verify the updated user data
        const verifyUser = authService.getCurrentUser();
        console.log(`[SkinService] Verification - Updated user inventory:`, JSON.stringify(verifyUser.inventory, null, 2));
        console.log(`[SkinService] Verification - Updated user coins:`, verifyUser.coins);
        
        return { success: true, skin: skinToBuy };
      } else {
        console.error(`[SkinService] ERROR: Update failed:`, updateResult);
        return { success: false, error: updateResult.error || 'Erreur lors de la mise à jour' };
      }

    } catch (error) {
      console.error('[SkinService] EXCEPTION in buySkin:', error);
      console.error('[SkinService] Error stack:', error.stack);
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
