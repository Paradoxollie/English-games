/**
 * Script pour explorer toutes les collections Firebase et trouver tous les utilisateurs
 */

// Configuration
const COMMON_USER_PROPERTIES = [
  'username',
  'displayName',
  'email',
  'name',
  'firstName',
  'lastName',
  'level',
  'xp',
  'coins',
  'avatar'
];

// Fonction pour vérifier si Firebase est initialisé
function checkFirebaseInitialized() {
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded");
    return false;
  }

  if (!window.db) {
    try {
      // Initialiser Firebase si ce n'est pas déjà fait
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      // Initialiser Firestore
      window.db = firebase.firestore();
      console.log("Firebase initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      return false;
    }
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
    // Récupérer toutes les collections
    const collections = await window.db.listCollections();
    
    console.log("Collections trouvées:", collections.length);
    
    // Parcourir toutes les collections
    for (const collection of collections) {
      console.log(`Collection: ${collection.id}`);
      
      // Récupérer tous les documents de la collection
      const snapshot = await window.db.collection(collection.id).get();
      
      console.log(`Documents dans ${collection.id}: ${snapshot.size}`);
      
      // Parcourir tous les documents
      snapshot.forEach(doc => {
        console.log(`Document ${doc.id} dans ${collection.id}:`, doc.data());
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'exploration des collections:", error);
    
    // Si listCollections n'est pas disponible, explorer les collections connues
    await exploreKnownCollections();
  }
}

// Fonction pour explorer les collections connues
async function exploreKnownCollections() {
  console.log("Exploration des collections connues...");
  
  // Liste des collections connues à explorer
  const knownCollections = [
    'users',
    'profiles',
    'players',
    'accounts',
    'userProfiles',
    'game_users',
    'english_quest_users',
    'auth_users',
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
        
        // Vérifier si c'est un utilisateur
        const data = doc.data();
        if (isUserDocument(data)) {
          console.log(`Utilisateur trouvé dans ${collectionId}: ${data.username || data.displayName || data.email || doc.id}`);
        }
      });
    } catch (collectionError) {
      console.error(`Erreur lors de l'exploration de la collection ${collectionId}:`, collectionError);
    }
  }
}

// Fonction pour vérifier si un document est un utilisateur
function isUserDocument(data) {
  if (!data || typeof data !== 'object') return false;
  
  // Vérifier si le document a des propriétés communes aux utilisateurs
  for (const property of COMMON_USER_PROPERTIES) {
    if (data[property] !== undefined) {
      return true;
    }
  }
  
  return false;
}

// Fonction pour explorer les sous-collections d'un document
async function exploreSubcollections(collectionId, documentId) {
  console.log(`Exploration des sous-collections de ${collectionId}/${documentId}...`);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return;
  }
  
  try {
    // Récupérer toutes les sous-collections
    const subcollections = await window.db.collection(collectionId).doc(documentId).listCollections();
    
    console.log(`Sous-collections trouvées pour ${collectionId}/${documentId}:`, subcollections.length);
    
    // Parcourir toutes les sous-collections
    for (const subcollection of subcollections) {
      console.log(`Sous-collection: ${subcollection.id}`);
      
      // Récupérer tous les documents de la sous-collection
      const snapshot = await window.db.collection(collectionId).doc(documentId).collection(subcollection.id).get();
      
      console.log(`Documents dans ${collectionId}/${documentId}/${subcollection.id}: ${snapshot.size}`);
      
      // Parcourir tous les documents
      snapshot.forEach(doc => {
        console.log(`Document ${doc.id} dans ${collectionId}/${documentId}/${subcollection.id}:`, doc.data());
      });
    }
  } catch (error) {
    console.error(`Erreur lors de l'exploration des sous-collections de ${collectionId}/${documentId}:`, error);
  }
}

// Fonction pour explorer les utilisateurs Firebase Auth
async function exploreFirebaseAuth() {
  console.log("Exploration des utilisateurs Firebase Auth...");
  
  if (!checkFirebaseInitialized() || !firebase.auth) {
    console.error("Firebase Auth not initialized");
    return;
  }
  
  try {
    // Récupérer l'utilisateur actuel
    const currentUser = firebase.auth().currentUser;
    
    if (currentUser) {
      console.log("Utilisateur actuel:", currentUser);
    } else {
      console.log("Aucun utilisateur connecté");
    }
  } catch (error) {
    console.error("Erreur lors de l'exploration des utilisateurs Firebase Auth:", error);
  }
}

// Fonction pour explorer les utilisateurs anonymes
async function exploreAnonymousUsers() {
  console.log("Exploration des utilisateurs anonymes...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return;
  }
  
  try {
    // Récupérer tous les documents de la collection users
    const snapshot = await window.db.collection('users').get();
    
    console.log(`Documents dans users: ${snapshot.size}`);
    
    // Parcourir tous les documents
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Vérifier si c'est un utilisateur anonyme
      if (data.isAnonymous) {
        console.log(`Utilisateur anonyme trouvé: ${doc.id}`);
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'exploration des utilisateurs anonymes:", error);
  }
}

// Fonction pour exécuter l'exploration complète
async function runExploration() {
  console.log("Exécution de l'exploration complète...");
  
  // Explorer toutes les collections
  await exploreAllCollections();
  
  // Explorer les utilisateurs Firebase Auth
  await exploreFirebaseAuth();
  
  // Explorer les utilisateurs anonymes
  await exploreAnonymousUsers();
  
  console.log("Exploration complète terminée");
}

// Ajouter un bouton d'exploration à la page
function addExplorationButton() {
  const button = document.createElement('button');
  button.textContent = 'Explorer Firebase';
  button.style.position = 'fixed';
  button.style.bottom = '140px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#3498db';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.padding = '10px 20px';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  
  button.addEventListener('click', async function() {
    if (confirm("Voulez-vous explorer toutes les collections Firebase ? Cette opération peut prendre du temps.")) {
      await runExploration();
      alert("Exploration terminée. Consultez la console pour voir les résultats.");
    }
  });
  
  document.body.appendChild(button);
}

// Initialiser l'exploration
document.addEventListener('DOMContentLoaded', function() {
  addExplorationButton();
});
