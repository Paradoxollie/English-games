/**
 * Module pour intégrer les fonctionnalités d'administration dans la page de profil
 */

import { initAdminFeatures } from '@features/admin/admin-tab.js';

// Initialiser les fonctionnalités d'administration lorsque la page est chargée
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initialisation des fonctionnalités d'administration...");
  
  // Attendre que le profil soit chargé
  const profileLoadedInterval = setInterval(function() {
    const profileUsername = document.getElementById('profile-username');
    
    if (profileUsername) {
      clearInterval(profileLoadedInterval);
      console.log("Profil chargé, initialisation des fonctionnalités d'administration...");
      
      // Initialiser les fonctionnalités d'administration
      initAdminFeatures();
    }
  }, 500);
  
  // Arrêter l'intervalle après 10 secondes si le profil n'est pas chargé
  setTimeout(function() {
    clearInterval(profileLoadedInterval);
  }, 10000);
});
