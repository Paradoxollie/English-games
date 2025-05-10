/**
 * English Quest - Firebase Diagnostic Script
 * Script de diagnostic pour comprendre la structure de Firebase
 */

// Vérifier si Firebase est initialisé
function checkFirebaseInitialized() {
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded");
    return false;
  }

  if (!window.db) {
    console.log("Firebase not initialized yet, initializing...");
    const result = initializeFirebase();
    return !!result;
  }

  return true;
}

// Fonction pour explorer toutes les collections Firebase
async function exploreAllCollections() {
  console.log("Exploration de toutes les collections Firebase...");

  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return;
  }

  try {
    // Liste des collections connues à explorer
    const knownCollections = [
      'users',
      'profiles',
      'scores',
      'games',
      'courses',
      'progress',
      'leaderboards',
      'battles',
      'achievements',
      'quests',
      'stats',
      'visits'
    ];

    console.log("Collections connues à explorer:", knownCollections.length);

    // Parcourir toutes les collections connues
    for (const collectionId of knownCollections) {
      console.log(`Collection: ${collectionId}`);

      try {
        // Récupérer tous les documents de la collection
        const snapshot = await window.db.collection(collectionId).get();

        console.log(`Documents dans ${collectionId}: ${snapshot.size}`);

        // Parcourir tous les documents
        snapshot.forEach(doc => {
          console.log(`Document ${doc.id} dans ${collectionId}:`, doc.data());
        });
      } catch (collectionError) {
        console.error(`Erreur lors de l'exploration de la collection ${collectionId}:`, collectionError);
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'exploration des collections:", error);
  }
}

// Fonction pour explorer une collection spécifique
async function exploreCollection(collectionName) {
  console.log(`Exploration de la collection ${collectionName}...`);

  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return;
  }

  try {
    // Récupérer tous les documents de la collection
    const snapshot = await window.db.collection(collectionName).get();

    console.log(`Documents dans ${collectionName}: ${snapshot.size}`);

    // Parcourir tous les documents
    snapshot.forEach(doc => {
      console.log(`Document ${doc.id} dans ${collectionName}:`, doc.data());
    });
  } catch (error) {
    console.error(`Erreur lors de l'exploration de la collection ${collectionName}:`, error);
  }
}

// Fonction pour explorer toutes les collections liées aux utilisateurs
async function exploreAllUserCollections() {
  console.log("Exploration de toutes les collections liées aux utilisateurs...");

  // Liste des collections potentielles liées aux utilisateurs
  const userCollections = [
    'users',
    'profiles',
    'players',
    'accounts',
    'game_users',
    'english_quest_users',
    'auth',
    'authentication',
    'user_data',
    'user_profiles',
    'user_accounts',
    'user_auth',
    'user_authentication',
    'user_info',
    'user_information',
    'user_details',
    'user_stats',
    'user_statistics',
    'user_progress',
    'user_achievements',
    'user_inventory',
    'user_settings',
    'user_preferences',
    'user_config',
    'user_configuration',
    'user_options',
    'user_customization',
    'user_personalization',
    'user_data_v1',
    'user_data_v2',
    'user_data_v3',
    'user_data_v4',
    'user_data_v5'
  ];

  for (const collection of userCollections) {
    await exploreCollection(collection);
  }
}

// Fonction pour afficher les résultats dans l'interface
function displayDiagnosticResults(results) {
  // Créer un élément pour afficher les résultats
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'diagnostic-results';
  resultsContainer.style.backgroundColor = '#1e1e1e';
  resultsContainer.style.color = '#fff';
  resultsContainer.style.padding = '20px';
  resultsContainer.style.borderRadius = '5px';
  resultsContainer.style.margin = '20px';
  resultsContainer.style.maxHeight = '500px';
  resultsContainer.style.overflow = 'auto';
  resultsContainer.style.fontFamily = 'monospace';
  resultsContainer.style.fontSize = '14px';
  resultsContainer.style.lineHeight = '1.5';
  resultsContainer.style.whiteSpace = 'pre-wrap';
  resultsContainer.style.position = 'fixed';
  resultsContainer.style.top = '20px';
  resultsContainer.style.right = '20px';
  resultsContainer.style.zIndex = '9999';
  resultsContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

  // Ajouter un bouton pour fermer les résultats
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Fermer';
  closeButton.style.backgroundColor = '#e74c3c';
  closeButton.style.color = '#fff';
  closeButton.style.border = 'none';
  closeButton.style.padding = '5px 10px';
  closeButton.style.borderRadius = '3px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.marginBottom = '10px';
  closeButton.addEventListener('click', () => {
    resultsContainer.remove();
  });

  // Ajouter le bouton et les résultats au conteneur
  resultsContainer.appendChild(closeButton);
  resultsContainer.appendChild(document.createTextNode(results));

  // Ajouter le conteneur à la page
  document.body.appendChild(resultsContainer);
}

// Fonction pour exécuter le diagnostic complet
async function runFullDiagnostic() {
  console.log("Exécution du diagnostic complet...");

  // Rediriger les logs vers une variable
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  let logs = '';

  console.log = function() {
    logs += Array.from(arguments).join(' ') + '\n';
    originalConsoleLog.apply(console, arguments);
  };

  console.error = function() {
    logs += 'ERROR: ' + Array.from(arguments).join(' ') + '\n';
    originalConsoleError.apply(console, arguments);
  };

  try {
    // Vérifier l'initialisation de Firebase
    logs += "=== VÉRIFICATION DE L'INITIALISATION DE FIREBASE ===\n";
    logs += "Firebase initialisé: " + checkFirebaseInitialized() + "\n\n";

    // Explorer toutes les collections liées aux utilisateurs
    logs += "=== EXPLORATION DES COLLECTIONS LIÉES AUX UTILISATEURS ===\n";
    await exploreAllUserCollections();

    // Explorer toutes les collections
    logs += "\n=== EXPLORATION DE TOUTES LES COLLECTIONS ===\n";
    await exploreAllCollections();
  } catch (error) {
    logs += "ERREUR FATALE: " + error.message + "\n";
    logs += error.stack + "\n";
  } finally {
    // Restaurer les fonctions de log originales
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    // Afficher les résultats
    displayDiagnosticResults(logs);
  }
}

// Ajouter un bouton de diagnostic à la page
function addDiagnosticButton() {
  const button = document.createElement('button');
  button.textContent = 'Diagnostic Firebase';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#3498db';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.padding = '10px 20px';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';

  button.addEventListener('click', runFullDiagnostic);

  document.body.appendChild(button);
}

// Initialiser le diagnostic
document.addEventListener('DOMContentLoaded', function() {
  addDiagnosticButton();
});

// Rendre les fonctions disponibles globalement
window.exploreAllCollections = exploreAllCollections;
window.exploreCollection = exploreCollection;
window.exploreAllUserCollections = exploreAllUserCollections;
window.runFullDiagnostic = runFullDiagnostic;
