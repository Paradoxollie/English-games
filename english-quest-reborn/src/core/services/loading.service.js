/**
 * Service de gestion du chargement de l'application
 * Gère l'écran de chargement et le suivi de la progression
 */

// État du chargement
let loadingState = {
  isLoading: false,
  progress: 0,
  message: '',
  error: null,
  startTime: null,
  endTime: null
};

// Éléments DOM
let loadingScreen;
let progressBar;
let loadingText;

/**
 * Initialise le gestionnaire de chargement
 */
function init() {
  // Récupérer les éléments DOM
  loadingScreen = document.getElementById('loading-screen');
  progressBar = document.getElementById('loading-progress');
  loadingText = document.querySelector('.loading-screen__text');
  
  if (!loadingScreen || !progressBar || !loadingText) {
    console.warn('Loading screen elements not found in the DOM');
  }
}

/**
 * Démarre le chargement
 */
function start() {
  loadingState = {
    isLoading: true,
    progress: 0,
    message: 'Initialisation...',
    error: null,
    startTime: Date.now(),
    endTime: null
  };
  
  if (!loadingScreen) {
    init();
  }
  
  if (loadingScreen) {
    loadingScreen.style.display = 'flex';
    updateDOM();
  }
}

/**
 * Met à jour la progression du chargement
 * @param {number} progress - Pourcentage de progression (0-100)
 * @param {string} message - Message à afficher
 */
function updateProgress(progress, message = '') {
  loadingState.progress = Math.min(Math.max(progress, 0), 100);
  
  if (message) {
    loadingState.message = message;
  }
  
  updateDOM();
}

/**
 * Signale une erreur de chargement
 * @param {string} errorMessage - Message d'erreur
 */
function error(errorMessage) {
  loadingState.error = errorMessage;
  loadingState.message = 'Une erreur est survenue';
  
  updateDOM();
  
  // Ajouter la classe d'erreur
  if (loadingScreen) {
    loadingScreen.classList.add('loading-screen--error');
  }
}

/**
 * Termine le chargement
 */
function complete() {
  loadingState.progress = 100;
  loadingState.isLoading = false;
  loadingState.endTime = Date.now();
  loadingState.message = 'Chargement terminé';
  
  updateDOM();
  
  // Masquer l'écran de chargement avec une animation
  if (loadingScreen) {
    loadingScreen.classList.add('loading-screen--complete');
    
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      loadingScreen.classList.remove('loading-screen--complete');
    }, 500);
  }
  
  // Calculer le temps de chargement
  const loadTime = (loadingState.endTime - loadingState.startTime) / 1000;
  console.log(`Application loaded in ${loadTime.toFixed(2)} seconds`);
}

/**
 * Met à jour les éléments DOM avec l'état actuel
 */
function updateDOM() {
  if (!loadingScreen) {
    return;
  }
  
  // Mettre à jour la barre de progression
  if (progressBar) {
    progressBar.style.width = `${loadingState.progress}%`;
  }
  
  // Mettre à jour le texte
  if (loadingText) {
    loadingText.textContent = loadingState.error || loadingState.message;
  }
}

/**
 * Récupère l'état actuel du chargement
 * @returns {Object} État du chargement
 */
function getState() {
  return { ...loadingState };
}

// Exporter le gestionnaire de chargement
export const loadingManager = {
  start,
  updateProgress,
  error,
  complete,
  getState
};

export default loadingManager;
