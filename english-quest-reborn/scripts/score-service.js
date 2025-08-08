import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit as fbLimit,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { firebaseConfig } from '../src/config/app.config.js';
import { authService } from './auth-service.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class ScoreService {
  constructor() {
    this.db = db;
    this.bannedUsernames = [
      'player', 'test', 'testuser', 'demo', 'guest', 'anonymous', 'anon',
      'invite', 'invité', 'utilisateur', 'visiteur', 'anonyme', 'user', 'joueur'
    ];
  }

  isValidUsername(name) {
    if (!name) return false;
    const n = String(name).trim();
    if (n.length < 3) return false;
    const lower = n.toLowerCase();
    // Exact banned
    if (this.bannedUsernames.includes(lower)) return false;
    // Common placeholders/prefixes (e.g., "player 1", "guest_42", "invité 645")
    const bannedPrefixes = [
      'player', 'guest', 'invité', 'invite', 'utilisateur', 'visiteur', 'anonymous', 'anonyme', 'test', 'user', 'joueur'
    ];
    for (const prefix of bannedPrefixes) {
      if (lower.startsWith(prefix + ' ') || lower.startsWith(prefix + '_') || lower.startsWith(prefix + '-') || lower === prefix) {
        return false;
      }
    }
    // allow alnum, space, underscore, dash, accented; reject weird junk
    const re = /^[\p{L}\p{N} _\-']{3,30}$/u;
    return re.test(n);
  }

  async saveScore(gameId, score, extra = {}) {
    const user = authService.getCurrentUser();
    if (!user || !user.uid) {
      throw new Error('Utilisateur non connecté - impossible d\'enregistrer le score');
    }

    const username = user.username || user.displayName || '';
    if (!this.isValidUsername(username)) {
      throw new Error('Nom d\'utilisateur invalide: veuillez configurer un pseudo valide dans votre profil');
    }

    const payload = {
      gameId,
      userId: user.uid,
      username,
      score: Number(score) || 0,
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString(),
      ...extra
    };

    await addDoc(collection(this.db, 'game_scores'), payload);
    return { success: true };
  }

  async getTopScores(gameId, limit = 20) {
    const q = query(
      collection(this.db, 'game_scores'),
      where('gameId', '==', gameId),
      orderBy('score', 'desc'),
      fbLimit(limit)
    );
    const snap = await getDocs(q);
    const rows = [];
    snap.forEach(doc => rows.push({ id: doc.id, ...doc.data() }));
    // Filtrer les pseudos bannis côté client pour l'affichage
    const filtered = rows.filter(r => this.isValidUsername(r.username));
    return filtered;
  }

  async getUserBest(gameId, userId) {
    // Éviter l'index composite requis (gameId + userId + orderBy score)
    // On récupère les scores de l'utilisateur pour ce jeu et on calcule le meilleur côté client
    const q = query(
      collection(this.db, 'game_scores'),
      where('gameId', '==', gameId),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    let best = null;
    snap.forEach(d => {
      const row = { id: d.id, ...d.data() };
      if (!best || (Number(row.score) || 0) > (Number(best.score) || 0)) best = row;
    });
    return best;
  }
}

export const scoreService = new ScoreService();
window.scoreService = scoreService;

console.log('✅ [ScoreService] Initialisé');


