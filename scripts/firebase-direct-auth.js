/**
 * English Quest - Firebase Direct Auth Script
 * Récupère les utilisateurs directement depuis Firebase Authentication et Firestore
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

  if (!firebase.firestore) {
    console.error("Firebase Firestore not loaded");
    return false;
  }

  return true;
}

// Récupérer tous les utilisateurs de Firebase
async function getAllFirebaseUsers() {
  console.log("Récupération de tous les utilisateurs depuis Firebase...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return {};
  }
  
  try {
    // Récupérer les utilisateurs depuis Firestore
    const db = firebase.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    // Créer un objet pour stocker tous les utilisateurs
    const allUsers = {};
    
    // Parcourir tous les utilisateurs
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      allUsers[doc.id] = {
        id: doc.id,
        source: 'firebase',
        ...userData
      };
    });
    
    console.log("Utilisateurs récupérés depuis Firebase:", allUsers);
    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis Firebase:", error);
    return {};
  }
}

// Supprimer un utilisateur local
function deleteLocalUser(userId) {
  console.log("Suppression de l'utilisateur local:", userId);
  
  try {
    // Récupérer tous les utilisateurs locaux
    const localUsers = {};
    
    // Récupérer les utilisateurs depuis english_quest_users
    try {
      const eqUsersJson = localStorage.getItem('english_quest_users');
      if (eqUsersJson) {
        const eqUsers = JSON.parse(eqUsersJson);
        Object.assign(localUsers, eqUsers);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs depuis english_quest_users:", error);
    }
    
    // Récupérer les utilisateurs depuis users
    try {
      const oldUsersJson = localStorage.getItem('users');
      if (oldUsersJson) {
        const oldUsers = JSON.parse(oldUsersJson);
        Object.assign(localUsers, oldUsers);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs depuis users:", error);
    }
    
    // Vérifier si l'utilisateur existe
    if (!localUsers[userId]) {
      console.error("Utilisateur local non trouvé:", userId);
      return false;
    }
    
    // Supprimer l'utilisateur
    delete localUsers[userId];
    
    // Sauvegarder les modifications
    localStorage.setItem('english_quest_users', JSON.stringify(localUsers));
    localStorage.setItem('users', JSON.stringify(localUsers));
    
    console.log("Utilisateur local supprimé avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur local:", error);
    return false;
  }
}

// Supprimer un utilisateur Firebase
async function deleteFirebaseUser(userId) {
  console.log("Suppression de l'utilisateur Firebase:", userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Supprimer l'utilisateur dans Firestore
    const db = firebase.firestore();
    await db.collection('users').doc(userId).delete();
    
    console.log("Utilisateur Firebase supprimé avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur Firebase:", error);
    return false;
  }
}

// Supprimer un utilisateur (local et Firebase)
async function deleteUserCompletely(userId) {
  console.log("Suppression complète de l'utilisateur:", userId);
  
  // Supprimer l'utilisateur local
  const localSuccess = deleteLocalUser(userId);
  
  // Supprimer l'utilisateur Firebase
  let firebaseSuccess = false;
  try {
    firebaseSuccess = await deleteFirebaseUser(userId);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur Firebase:", error);
  }
  
  return localSuccess || firebaseSuccess;
}

// Récupérer tous les utilisateurs (locaux et Firebase)
async function getAllUsersComplete() {
  console.log("Récupération de tous les utilisateurs (locaux et Firebase)...");
  
  // Récupérer les utilisateurs locaux
  const localUsers = {};
  
  // Récupérer les utilisateurs depuis english_quest_users
  try {
    const eqUsersJson = localStorage.getItem('english_quest_users');
    if (eqUsersJson) {
      const eqUsers = JSON.parse(eqUsersJson);
      Object.keys(eqUsers).forEach(userId => {
        localUsers[userId] = {
          ...eqUsers[userId],
          source: 'local'
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
        if (!localUsers[userId]) {
          localUsers[userId] = {
            ...oldUsers[userId],
            source: 'local'
          };
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis users:", error);
  }
  
  // Récupérer les utilisateurs Firebase
  let firebaseUsers = {};
  try {
    firebaseUsers = await getAllFirebaseUsers();
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs Firebase:", error);
  }
  
  // Fusionner les utilisateurs
  const allUsers = { ...localUsers };
  
  // Ajouter les utilisateurs Firebase
  Object.keys(firebaseUsers).forEach(userId => {
    if (!allUsers[userId]) {
      allUsers[userId] = firebaseUsers[userId];
    } else {
      // Fusionner les données
      allUsers[userId] = {
        ...allUsers[userId],
        ...firebaseUsers[userId],
        source: 'local+firebase'
      };
    }
  });
  
  console.log("Tous les utilisateurs récupérés:", allUsers);
  return allUsers;
}

// Forcer la synchronisation avec Firebase
async function forceSyncWithFirebase() {
  console.log("Forçage de la synchronisation avec Firebase...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Récupérer tous les utilisateurs
    const allUsers = await getAllUsersComplete();
    
    // Afficher un message de confirmation
    alert(`Synchronisation réussie ! ${Object.keys(allUsers).length} utilisateurs trouvés.`);
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la synchronisation avec Firebase:", error);
    alert("Erreur lors de la synchronisation avec Firebase: " + error.message);
    return false;
  }
}

// Rendre les fonctions disponibles globalement
window.getAllFirebaseUsers = getAllFirebaseUsers;
window.deleteLocalUser = deleteLocalUser;
window.deleteFirebaseUser = deleteFirebaseUser;
window.deleteUserCompletely = deleteUserCompletely;
window.getAllUsersComplete = getAllUsersComplete;
window.forceSyncWithFirebase = forceSyncWithFirebase;
