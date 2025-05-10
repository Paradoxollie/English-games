/**
 * Gestion de l'état de connexion à Firebase
 * Permet de suivre si l'application est connectée à Firebase
 */

// Objet global pour suivre l'état de connexion
window.firebaseConnectionState = {
  isOnline: false,
  lastOnlineTime: null,
  listeners: []
};

// Initialiser la détection de connexion une fois Firebase chargé
document.addEventListener('DOMContentLoaded', () => {
  // Attendre que Firebase soit initialisé
  const checkFirebase = setInterval(() => {
    if (window.firebase && window.firebase.database) {
      clearInterval(checkFirebase);
      initConnectionDetection();
    }
  }, 100);
});

/**
 * Initialise la détection de connexion à Firebase
 */
function initConnectionDetection() {
  try {
    const connectedRef = firebase.database().ref('.info/connected');
    
    connectedRef.on('value', (snap) => {
      const isConnected = snap.val() === true;
      window.firebaseConnectionState.isOnline = isConnected;
      
      if (isConnected) {
        window.firebaseConnectionState.lastOnlineTime = new Date();
        console.log('État de connexion: En ligne');
      } else {
        console.log('État de connexion: Hors ligne');
      }
      
      // Notifier les listeners
      window.firebaseConnectionState.listeners.forEach(listener => {
        try {
          listener(isConnected);
        } catch (error) {
          console.error('Erreur dans un listener de connexion:', error);
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la détection de connexion:', error);
  }
}

/**
 * Ajoute un listener pour les changements d'état de connexion
 * @param {Function} callback - Fonction appelée lors d'un changement d'état
 * @returns {number} - ID du listener pour pouvoir le supprimer
 */
window.firebaseConnectionState.addListener = function(callback) {
  if (typeof callback === 'function') {
    this.listeners.push(callback);
    return this.listeners.length - 1;
  }
  return -1;
};

/**
 * Supprime un listener
 * @param {number} id - ID du listener à supprimer
 */
window.firebaseConnectionState.removeListener = function(id) {
  if (id >= 0 && id < this.listeners.length) {
    this.listeners.splice(id, 1);
  }
};
