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
  }

  async saveScore(gameId, score, extra = {}) {
    const user = authService.getCurrentUser();
    if (!user || !user.uid) {
      throw new Error('Utilisateur non connecté - impossible d\'enregistrer le score');
    }

    const username = user.username || user.displayName || 'Player';

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
    return rows;
  }

  async getUserBest(gameId, userId) {
    const q = query(
      collection(this.db, 'game_scores'),
      where('gameId', '==', gameId),
      where('userId', '==', userId),
      orderBy('score', 'desc'),
      fbLimit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}

export const scoreService = new ScoreService();
window.scoreService = scoreService;

console.log('✅ [ScoreService] Initialisé');


