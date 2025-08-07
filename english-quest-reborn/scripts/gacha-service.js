// Gacha Service - client-side bridge to Cloud Function performGachaDraw
import { authService } from './auth-service.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js';

class GachaService {
  constructor() {
    this.isCalling = false;
  }

  async draw({ count = 1 } = {}) {
    const user = authService.getCurrentUser();
    if (!user || !user.uid) return { success: false, error: 'Utilisateur non connecté' };

    try {
      this.isCalling = true;
      const functions = getFunctions();
      const callable = httpsCallable(functions, 'performGachaDraw');
      const { data: result } = await callable({ uid: user.uid, count });

      // Rafraîchir le profil pour refléter monnaies/inventaire
      await authService.refreshUser();

      return { success: true, ...result };
    } catch (error) {
      console.error('[GachaService] draw error:', error);
      return { success: false, error: error.message };
    } finally {
      this.isCalling = false;
    }
  }

  // no-op: using firebase httpsCallable
}

export const gachaService = new GachaService();
window.gachaService = gachaService;

console.log('✅ [GachaService] Initialisé');


