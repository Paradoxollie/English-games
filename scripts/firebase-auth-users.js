/**
 * English Quest - Firebase Auth Users Script
 * Récupère les utilisateurs directement depuis Firebase Authentication
 */

// Vérifier si Firebase est initialisé
function checkFirebaseInitialized() {
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded");
    return false;
  }

  if (!firebase.auth) {
    console.error("Firebase Auth not loaded");
    return false;
  }

  return true;
}

// Récupérer tous les utilisateurs de Firebase Auth
async function getAllAuthUsers() {
  console.log("Récupération de tous les utilisateurs depuis Firebase Auth...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return {};
  }
  
  try {
    // Récupérer l'utilisateur actuellement connecté
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
      console.error("Aucun utilisateur connecté à Firebase Auth");
      return {};
    }
    
    console.log("Utilisateur Firebase Auth connecté:", currentUser.uid);
    
    // Récupérer les utilisateurs depuis Firestore
    const db = firebase.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log("Aucun utilisateur trouvé dans Firestore");
      return {};
    }
    
    // Créer un objet pour stocker tous les utilisateurs
    const allUsers = {};
    
    // Parcourir tous les utilisateurs
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      allUsers[doc.id] = {
        id: doc.id,
        source: 'firebase_auth',
        ...userData
      };
    });
    
    console.log("Utilisateurs récupérés depuis Firebase Auth:", allUsers);
    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis Firebase Auth:", error);
    return {};
  }
}

// Récupérer les utilisateurs locaux et Firebase
async function getAllUsersFromAllSources() {
  console.log("Récupération des utilisateurs de toutes les sources...");
  
  // Récupérer les utilisateurs locaux
  const localUsers = getLocalUsers();
  console.log("Utilisateurs locaux:", localUsers);
  
  // Récupérer les utilisateurs Firebase
  let firebaseUsers = {};
  
  try {
    if (typeof getAllPossibleUsers === 'function') {
      firebaseUsers = await getAllPossibleUsers();
    } else if (typeof getAllRealUsers === 'function') {
      firebaseUsers = await getAllRealUsers();
    } else if (typeof getAllAuthUsers === 'function') {
      firebaseUsers = await getAllAuthUsers();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs Firebase:", error);
  }
  
  console.log("Utilisateurs Firebase:", firebaseUsers);
  
  // Fusionner les utilisateurs
  const allUsers = { ...localUsers };
  
  // Ajouter les utilisateurs Firebase qui n'existent pas déjà localement
  Object.keys(firebaseUsers).forEach(userId => {
    const firebaseUser = firebaseUsers[userId];
    
    // Vérifier si l'utilisateur existe déjà localement
    const existsLocally = Object.values(localUsers).some(localUser => 
      localUser.username && firebaseUser.username && 
      localUser.username.toLowerCase() === firebaseUser.username.toLowerCase()
    );
    
    if (!existsLocally) {
      allUsers[userId] = firebaseUser;
    }
  });
  
  console.log("Tous les utilisateurs fusionnés:", allUsers);
  return allUsers;
}

// Récupérer les utilisateurs locaux
function getLocalUsers() {
  console.log("Récupération des utilisateurs locaux...");
  
  const users = {};
  
  // Récupérer les utilisateurs depuis english_quest_users
  try {
    const eqUsersJson = localStorage.getItem('english_quest_users');
    if (eqUsersJson) {
      const eqUsers = JSON.parse(eqUsersJson);
      Object.keys(eqUsers).forEach(userId => {
        users[userId] = {
          ...eqUsers[userId],
          source: 'english_quest_users'
        };
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis english_quest_users:", error);
  }
  
  // Récupérer les utilisateurs depuis users
  try {
    const oldUsersJson = localStorage.getItem('users');
    if (oldUsersJson) {
      const oldUsers = JSON.parse(oldUsersJson);
      Object.keys(oldUsers).forEach(userId => {
        if (!users[userId]) {
          users[userId] = {
            ...oldUsers[userId],
            source: 'users'
          };
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis users:", error);
  }
  
  return users;
}

// Vérifier si un utilisateur est administrateur
function isUserAdmin(user) {
  if (!user) return false;
  
  // Vérifier si c'est Ollie (toujours administrateur)
  if (user.username && user.username.toLowerCase() === 'ollie') {
    return true;
  }
  
  // Vérifier la propriété isAdmin
  return user.isAdmin === true;
}

// Rendre les fonctions disponibles globalement
window.getAllAuthUsers = getAllAuthUsers;
window.getAllUsersFromAllSources = getAllUsersFromAllSources;
window.getLocalUsers = getLocalUsers;
window.isUserAdmin = isUserAdmin;
