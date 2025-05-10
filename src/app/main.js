/**
 * English Quest Reborn - Point d'entrée principal
 * Application moderne et compétitive pour l'apprentissage de l'anglais
 */

import { initializeApp } from '@core/config/app.config';
import { initializeFirebase } from '@core/services/firebase.service';
import { initializeAuth } from '@features/auth/auth.service';
import { initializeRouter } from '@core/services/router.service';
import { initializeUI } from '@shared/ui/ui.service';
import { initializeGameEngine } from '@core/services/game-engine.service';
import { initializeAudio } from '@core/services/audio.service';
import { initializeProgressSystem } from '@core/services/progress.service';
import { initializeLeaderboard } from '@features/leaderboard/leaderboard.service';
import { initializeBattleSystem } from '@features/battle/battle.service';
import { loadingManager } from '@core/services/loading.service';

// Configuration globale
const CONFIG = {
  debug: true,
  version: '1.0.0',
  apiEndpoint: 'https://api.english-quest.com',
  assetsPath: '/src/assets',
  defaultTheme: 'medieval-dark'
};

/**
 * Initialisation de l'application
 */
async function initApp() {
  try {
    // Démarrer le gestionnaire de chargement
    loadingManager.start();
    loadingManager.updateProgress(10, 'Initialisation...');

    // Initialiser l'application
    const app = initializeApp(CONFIG);
    loadingManager.updateProgress(20, 'Configuration chargée');

    // Initialiser Firebase
    await initializeFirebase();
    loadingManager.updateProgress(30, 'Services connectés');

    // Initialiser l'authentification
    await initializeAuth();
    loadingManager.updateProgress(40, 'Authentification prête');

    // Initialiser le moteur de jeu
    await initializeGameEngine();
    loadingManager.updateProgress(50, 'Moteur de jeu chargé');

    // Initialiser le système audio
    await initializeAudio();
    loadingManager.updateProgress(60, 'Système audio prêt');

    // Initialiser le système de progression
    await initializeProgressSystem();
    loadingManager.updateProgress(70, 'Système de progression initialisé');

    // Initialiser le tableau des scores
    await initializeLeaderboard();
    loadingManager.updateProgress(80, 'Classements chargés');

    // Initialiser le système de combat
    await initializeBattleSystem();
    loadingManager.updateProgress(90, 'Système de combat prêt');

    // Initialiser l'interface utilisateur
    await initializeUI();
    loadingManager.updateProgress(95, 'Interface utilisateur prête');

    // Initialiser le routeur
    const router = await initializeRouter();
    loadingManager.updateProgress(100, 'Application prête');

    // Terminer le chargement
    setTimeout(() => {
      loadingManager.complete();
      router.navigateToHome();
    }, 500);

    // Exposer l'application en mode debug
    if (CONFIG.debug) {
      window.EnglishQuest = {
        app,
        router,
        version: CONFIG.version
      };
      console.log(`English Quest Reborn v${CONFIG.version} initialized in debug mode`);
    }

    return app;
  } catch (error) {
    loadingManager.error('Une erreur est survenue lors du chargement de l\'application');
    console.error('Application initialization failed:', error);
    
    // Afficher une erreur à l'utilisateur
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.innerHTML = `
        <div class="error-screen">
          <h1>Oups ! Une erreur est survenue</h1>
          <p>Nous n'avons pas pu charger l'application. Veuillez réessayer ultérieurement.</p>
          <button onclick="window.location.reload()">Réessayer</button>
        </div>
      `;
    }
    
    throw error;
  }
}

// Démarrer l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', initApp);

// Gérer les erreurs non capturées
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  loadingManager.error('Une erreur inattendue est survenue');
});

// Exporter pour les tests
export { initApp, CONFIG };
