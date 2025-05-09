/**
 * English Quest - Script d'urgence
 * Ce script désactive temporairement toutes les fonctionnalités problématiques
 */

console.log("Script d'urgence chargé");

// Fonction pour désactiver les fonctionnalités problématiques
function disableProblematicFeatures() {
  console.log("Désactivation des fonctionnalités problématiques...");
  
  try {
    // Désactiver la fonction unlockAllSkins
    if (window.unlockAllSkins) {
      console.log("Désactivation de la fonction unlockAllSkins");
      window.unlockAllSkins_original = window.unlockAllSkins;
      window.unlockAllSkins = function() {
        console.log("Fonction unlockAllSkins désactivée");
        alert("Cette fonctionnalité a été temporairement désactivée pour maintenance.");
        return false;
      };
    }
    
    // Désactiver la fonction forceOllieAdmin
    if (window.forceOllieAdmin) {
      console.log("Désactivation de la fonction forceOllieAdmin");
      window.forceOllieAdmin_original = window.forceOllieAdmin;
      window.forceOllieAdmin = function() {
        console.log("Fonction forceOllieAdmin désactivée");
        return true; // Retourner true pour éviter les erreurs
      };
    }
    
    // Désactiver le rechargement automatique de la page
    console.log("Désactivation du rechargement automatique de la page");
    window.location.reload = function() {
      console.log("Rechargement de la page désactivé");
      return false;
    };
    
    // Désactiver les alertes
    console.log("Désactivation des alertes");
    window.alert_original = window.alert;
    window.alert = function(message) {
      console.log("Alerte désactivée:", message);
      return false;
    };
    
    // Désactiver les confirmations
    console.log("Désactivation des confirmations");
    window.confirm_original = window.confirm;
    window.confirm = function(message) {
      console.log("Confirmation désactivée:", message);
      return true;
    };
    
    // Désactiver les prompts
    console.log("Désactivation des prompts");
    window.prompt_original = window.prompt;
    window.prompt = function(message, defaultValue) {
      console.log("Prompt désactivé:", message);
      return defaultValue;
    };
    
    // Ajouter un bouton d'urgence pour recharger la page
    const emergencyButton = document.createElement('button');
    emergencyButton.id = 'emergency-reload-btn';
    emergencyButton.textContent = 'RECHARGER LA PAGE';
    emergencyButton.style.position = 'fixed';
    emergencyButton.style.top = '10px';
    emergencyButton.style.left = '10px';
    emergencyButton.style.zIndex = '9999';
    emergencyButton.style.padding = '10px 20px';
    emergencyButton.style.backgroundColor = 'red';
    emergencyButton.style.color = 'white';
    emergencyButton.style.fontWeight = 'bold';
    emergencyButton.style.border = 'none';
    emergencyButton.style.borderRadius = '5px';
    emergencyButton.style.cursor = 'pointer';
    
    emergencyButton.addEventListener('click', function() {
      // Utiliser la méthode originale pour recharger la page
      window.location.href = window.location.href;
    });
    
    document.body.appendChild(emergencyButton);
    
    console.log("Fonctionnalités problématiques désactivées avec succès");
    
    // Ajouter un message d'information
    const infoMessage = document.createElement('div');
    infoMessage.id = 'emergency-info';
    infoMessage.textContent = 'Mode d\'urgence activé. Certaines fonctionnalités ont été temporairement désactivées.';
    infoMessage.style.position = 'fixed';
    infoMessage.style.top = '50px';
    infoMessage.style.left = '10px';
    infoMessage.style.zIndex = '9999';
    infoMessage.style.padding = '10px';
    infoMessage.style.backgroundColor = 'yellow';
    infoMessage.style.color = 'black';
    infoMessage.style.fontWeight = 'bold';
    infoMessage.style.border = 'none';
    infoMessage.style.borderRadius = '5px';
    
    document.body.appendChild(infoMessage);
  } catch (error) {
    console.error("Erreur lors de la désactivation des fonctionnalités problématiques:", error);
  }
}

// Exécuter la fonction immédiatement
disableProblematicFeatures();

// Exécuter la fonction à nouveau après un court délai pour s'assurer qu'elle est appliquée
setTimeout(disableProblematicFeatures, 1000);

// Exécuter la fonction à nouveau après un délai plus long pour s'assurer qu'elle est appliquée
setTimeout(disableProblematicFeatures, 3000);
