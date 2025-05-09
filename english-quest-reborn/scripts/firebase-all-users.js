/**
 * English Quest - Firebase All Users Script
 * Récupère tous les utilisateurs de toutes les sources possibles
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

// Récupérer tous les utilisateurs de toutes les sources possibles
async function getAllPossibleUsers() {
  console.log("Récupération de tous les utilisateurs de toutes les sources possibles...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return {};
  }
  
  try {
    // Créer un objet pour stocker tous les utilisateurs
    const allUsers = {};
    
    // Récupérer les utilisateurs de la collection 'users'
    try {
      const usersSnapshot = await window.db.collection('users').get();
      console.log(`Documents dans 'users': ${usersSnapshot.size}`);
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData && userData.username) {
          allUsers[doc.id] = {
            id: doc.id,
            source: 'users',
            ...userData
          };
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de 'users':", error);
    }
    
    // Récupérer les utilisateurs de la collection 'auth'
    try {
      const authSnapshot = await window.db.collection('auth').get();
      console.log(`Documents dans 'auth': ${authSnapshot.size}`);
      
      authSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData && userData.username && !allUsers[doc.id]) {
          allUsers[doc.id] = {
            id: doc.id,
            source: 'auth',
            ...userData
          };
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de 'auth':", error);
    }
    
    // Récupérer les utilisateurs de la collection 'profiles'
    try {
      const profilesSnapshot = await window.db.collection('profiles').get();
      console.log(`Documents dans 'profiles': ${profilesSnapshot.size}`);
      
      profilesSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData && userData.username && !allUsers[doc.id]) {
          allUsers[doc.id] = {
            id: doc.id,
            source: 'profiles',
            ...userData
          };
        } else if (userData && userData.username && allUsers[doc.id]) {
          // Fusionner les données
          allUsers[doc.id] = {
            ...allUsers[doc.id],
            ...userData,
            source: allUsers[doc.id].source + '+profiles'
          };
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de 'profiles':", error);
    }
    
    // Récupérer les utilisateurs de la collection 'game_users'
    try {
      const gameUsersSnapshot = await window.db.collection('game_users').get();
      console.log(`Documents dans 'game_users': ${gameUsersSnapshot.size}`);
      
      gameUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData && userData.username && !allUsers[doc.id]) {
          allUsers[doc.id] = {
            id: doc.id,
            source: 'game_users',
            ...userData
          };
        } else if (userData && userData.username && allUsers[doc.id]) {
          // Fusionner les données
          allUsers[doc.id] = {
            ...allUsers[doc.id],
            ...userData,
            source: allUsers[doc.id].source + '+game_users'
          };
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de 'game_users':", error);
    }
    
    // Récupérer les utilisateurs de la collection 'english_quest_users'
    try {
      const eqUsersSnapshot = await window.db.collection('english_quest_users').get();
      console.log(`Documents dans 'english_quest_users': ${eqUsersSnapshot.size}`);
      
      eqUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData && userData.username && !allUsers[doc.id]) {
          allUsers[doc.id] = {
            id: doc.id,
            source: 'english_quest_users',
            ...userData
          };
        } else if (userData && userData.username && allUsers[doc.id]) {
          // Fusionner les données
          allUsers[doc.id] = {
            ...allUsers[doc.id],
            ...userData,
            source: allUsers[doc.id].source + '+english_quest_users'
          };
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de 'english_quest_users':", error);
    }
    
    // Récupérer les utilisateurs de la collection 'players'
    try {
      const playersSnapshot = await window.db.collection('players').get();
      console.log(`Documents dans 'players': ${playersSnapshot.size}`);
      
      playersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData && userData.username && !allUsers[doc.id]) {
          allUsers[doc.id] = {
            id: doc.id,
            source: 'players',
            ...userData
          };
        } else if (userData && userData.username && allUsers[doc.id]) {
          // Fusionner les données
          allUsers[doc.id] = {
            ...allUsers[doc.id],
            ...userData,
            source: allUsers[doc.id].source + '+players'
          };
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de 'players':", error);
    }
    
    // Récupérer les utilisateurs de la collection 'accounts'
    try {
      const accountsSnapshot = await window.db.collection('accounts').get();
      console.log(`Documents dans 'accounts': ${accountsSnapshot.size}`);
      
      accountsSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData && userData.username && !allUsers[doc.id]) {
          allUsers[doc.id] = {
            id: doc.id,
            source: 'accounts',
            ...userData
          };
        } else if (userData && userData.username && allUsers[doc.id]) {
          // Fusionner les données
          allUsers[doc.id] = {
            ...allUsers[doc.id],
            ...userData,
            source: allUsers[doc.id].source + '+accounts'
          };
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de 'accounts':", error);
    }
    
    // Récupérer les utilisateurs de la collection 'user_data'
    try {
      const userDataSnapshot = await window.db.collection('user_data').get();
      console.log(`Documents dans 'user_data': ${userDataSnapshot.size}`);
      
      userDataSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData && userData.username && !allUsers[doc.id]) {
          allUsers[doc.id] = {
            id: doc.id,
            source: 'user_data',
            ...userData
          };
        } else if (userData && userData.username && allUsers[doc.id]) {
          // Fusionner les données
          allUsers[doc.id] = {
            ...allUsers[doc.id],
            ...userData,
            source: allUsers[doc.id].source + '+user_data'
          };
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs de 'user_data':", error);
    }
    
    console.log("Tous les utilisateurs récupérés:", allUsers);
    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les utilisateurs:", error);
    return {};
  }
}

// Mettre à jour un utilisateur dans sa collection d'origine
async function updateUserInOriginalCollection(userId, userData) {
  console.log("Mise à jour de l'utilisateur dans sa collection d'origine:", userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Récupérer l'utilisateur pour connaître sa source
    const allUsers = await getAllPossibleUsers();
    const user = allUsers[userId];
    
    if (!user) {
      console.error("Utilisateur non trouvé:", userId);
      return false;
    }
    
    // Déterminer la collection d'origine
    let collection = 'users'; // Par défaut
    
    if (user.source) {
      // Si la source contient plusieurs collections, prendre la première
      const sources = user.source.split('+');
      collection = sources[0];
    }
    
    console.log(`Mise à jour de l'utilisateur dans la collection '${collection}'`);
    
    // Supprimer la propriété 'source' avant la mise à jour
    const cleanUserData = { ...userData };
    delete cleanUserData.source;
    delete cleanUserData.id;
    
    // Mettre à jour l'utilisateur
    await window.db.collection(collection).doc(userId).update(cleanUserData);
    
    console.log("Utilisateur mis à jour avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return false;
  }
}

// Rendre les fonctions disponibles globalement
window.getAllPossibleUsers = getAllPossibleUsers;
window.updateUserInOriginalCollection = updateUserInOriginalCollection;
