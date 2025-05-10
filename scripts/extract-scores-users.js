/**
 * Script pour extraire les utilisateurs de la collection "scores" et les ajouter à la collection "users"
 */

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

// Fonction pour extraire les utilisateurs de la collection "scores"
async function extractUsersFromScores() {
  console.log("Extraction des utilisateurs de la collection 'scores'...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return;
  }
  
  try {
    // Récupérer tous les documents de la collection "scores"
    const snapshot = await window.db.collection('scores').get();
    
    console.log(`Documents dans scores: ${snapshot.size}`);
    
    // Créer un objet pour stocker les utilisateurs uniques
    const uniqueUsers = {};
    
    // Parcourir tous les documents
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Vérifier si le document a un nom d'utilisateur
      if (data.name) {
        const username = data.name;
        
        // Ajouter l'utilisateur à l'objet des utilisateurs uniques
        if (!uniqueUsers[username]) {
          uniqueUsers[username] = {
            username: username,
            displayName: username,
            level: 1,
            xp: 0,
            coins: 0,
            isAdmin: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            stats: {
              gamesPlayed: 0,
              gamesWon: 0,
              coursesCompleted: 0,
              timeSpent: 0
            },
            avatar: {
              head: 'default_boy',
              body: 'default_boy',
              accessory: 'none',
              background: 'default'
            },
            skins: {
              head: ['default_boy', 'default_girl'],
              body: ['default_boy', 'default_girl'],
              accessory: ['none'],
              background: ['default']
            },
            hasSelectedGender: true
          };
          
          console.log(`Utilisateur unique trouvé: ${username}`);
        }
      }
    });
    
    console.log(`Nombre d'utilisateurs uniques trouvés: ${Object.keys(uniqueUsers).length}`);
    
    // Vérifier si l'utilisateur actuel est Ollie
    const currentUser = JSON.parse(localStorage.getItem('english_quest_current_user') || '{}');
    if (!currentUser.username || currentUser.username.toLowerCase() !== 'ollie') {
      console.error("Seul Ollie peut ajouter des utilisateurs à la collection 'users'");
      alert("Seul Ollie peut ajouter des utilisateurs à la collection 'users'");
      return;
    }
    
    // Demander confirmation
    if (!confirm(`Voulez-vous ajouter ${Object.keys(uniqueUsers).length} utilisateurs à la collection 'users' ?`)) {
      return;
    }
    
    // Ajouter les utilisateurs à la collection "users"
    let addedCount = 0;
    for (const username in uniqueUsers) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const userQuery = await window.db.collection('users').where('username', '==', username).get();
        
        if (userQuery.empty) {
          // Générer un ID unique
          const userId = `user_${Math.random().toString(36).substr(2, 8)}`;
          
          // Ajouter l'utilisateur à la collection "users"
          await window.db.collection('users').doc(userId).set({
            ...uniqueUsers[username],
            userId: userId
          });
          
          console.log(`Utilisateur ajouté: ${username} (ID: ${userId})`);
          addedCount++;
        } else {
          console.log(`L'utilisateur ${username} existe déjà`);
        }
      } catch (error) {
        console.error(`Erreur lors de l'ajout de l'utilisateur ${username}:`, error);
      }
    }
    
    console.log(`${addedCount} utilisateurs ajoutés à la collection 'users'`);
    alert(`${addedCount} utilisateurs ajoutés à la collection 'users'`);
    
    // Recharger la page
    if (confirm("Voulez-vous recharger la page pour voir les changements ?")) {
      window.location.reload();
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction des utilisateurs:", error);
    alert("Erreur lors de l'extraction des utilisateurs: " + error.message);
  }
}

// Ajouter un bouton pour extraire les utilisateurs
function addExtractButton() {
  const button = document.createElement('button');
  button.textContent = 'Extraire Utilisateurs des Scores';
  button.style.position = 'fixed';
  button.style.bottom = '140px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#2ecc71';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.padding = '10px 20px';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  
  button.addEventListener('click', extractUsersFromScores);
  
  document.body.appendChild(button);
}

// Initialiser l'extraction
document.addEventListener('DOMContentLoaded', function() {
  addExtractButton();
});
