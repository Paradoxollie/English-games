/**
 * English Quest - Firebase Admin Script
 * Gère les fonctionnalités d'administration avec Firebase
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

// Récupérer tous les utilisateurs depuis Firebase
async function getAllFirebaseUsers() {
  console.log("Récupération de tous les utilisateurs depuis Firebase...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return {};
  }
  
  try {
    // Récupérer les utilisateurs depuis la collection 'users'
    const usersSnapshot = await window.db.collection(collections.USERS).get();
    
    if (usersSnapshot.empty) {
      console.log("Aucun utilisateur trouvé dans Firebase");
      return {};
    }
    
    // Créer un objet pour stocker tous les utilisateurs
    const allUsers = {};
    
    // Parcourir tous les utilisateurs
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      allUsers[doc.id] = {
        id: doc.id,
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

// Récupérer tous les profils depuis Firebase
async function getAllFirebaseProfiles() {
  console.log("Récupération de tous les profils depuis Firebase...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return {};
  }
  
  try {
    // Récupérer les profils depuis la collection 'profiles'
    const profilesSnapshot = await window.db.collection(collections.PROFILES).get();
    
    if (profilesSnapshot.empty) {
      console.log("Aucun profil trouvé dans Firebase");
      return {};
    }
    
    // Créer un objet pour stocker tous les profils
    const allProfiles = {};
    
    // Parcourir tous les profils
    profilesSnapshot.forEach(doc => {
      const profileData = doc.data();
      allProfiles[doc.id] = {
        id: doc.id,
        ...profileData
      };
    });
    
    console.log("Profils récupérés depuis Firebase:", allProfiles);
    return allProfiles;
  } catch (error) {
    console.error("Erreur lors de la récupération des profils depuis Firebase:", error);
    return {};
  }
}

// Récupérer tous les utilisateurs et profils depuis Firebase
async function getAllFirebaseData() {
  console.log("Récupération de toutes les données depuis Firebase...");
  
  try {
    // Récupérer les utilisateurs et les profils
    const [users, profiles] = await Promise.all([
      getAllFirebaseUsers(),
      getAllFirebaseProfiles()
    ]);
    
    // Fusionner les utilisateurs et les profils
    const allData = { ...users };
    
    // Ajouter les profils qui ne sont pas déjà dans les utilisateurs
    for (const profileId in profiles) {
      if (!allData[profileId]) {
        allData[profileId] = profiles[profileId];
      } else {
        // Fusionner les données du profil avec l'utilisateur existant
        allData[profileId] = {
          ...allData[profileId],
          ...profiles[profileId]
        };
      }
    }
    
    console.log("Toutes les données récupérées depuis Firebase:", allData);
    return allData;
  } catch (error) {
    console.error("Erreur lors de la récupération des données depuis Firebase:", error);
    return {};
  }
}

// Mettre à jour un utilisateur dans Firebase
async function updateFirebaseUser(userId, userData) {
  console.log("Mise à jour de l'utilisateur dans Firebase:", userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Mettre à jour l'utilisateur dans la collection 'users'
    await window.db.collection(collections.USERS).doc(userId).update(userData);
    
    console.log("Utilisateur mis à jour avec succès dans Firebase");
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur dans Firebase:", error);
    return false;
  }
}

// Supprimer un utilisateur dans Firebase
async function deleteFirebaseUser(userId) {
  console.log("Suppression de l'utilisateur dans Firebase:", userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Supprimer l'utilisateur dans la collection 'users'
    await window.db.collection(collections.USERS).doc(userId).delete();
    
    // Supprimer également le profil s'il existe
    try {
      await window.db.collection(collections.PROFILES).doc(userId).delete();
    } catch (error) {
      console.log("Profil non trouvé ou erreur lors de la suppression:", error);
    }
    
    console.log("Utilisateur supprimé avec succès dans Firebase");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur dans Firebase:", error);
    return false;
  }
}

// Ajouter de l'XP à un utilisateur dans Firebase
async function addXPToFirebaseUser(userId, xpToAdd) {
  console.log(`Ajout de ${xpToAdd} XP à l'utilisateur dans Firebase:`, userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Récupérer l'utilisateur actuel
    const userDoc = await window.db.collection(collections.USERS).doc(userId).get();
    
    if (!userDoc.exists) {
      console.error("Utilisateur non trouvé dans Firebase");
      return false;
    }
    
    const userData = userDoc.data();
    
    // Calculer la nouvelle XP et le nouveau niveau
    const newXP = (userData.xp || 0) + xpToAdd;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    
    // Mettre à jour l'utilisateur
    await window.db.collection(collections.USERS).doc(userId).update({
      xp: newXP,
      level: newLevel,
      'stats.totalXp': firebase.firestore.FieldValue.increment(xpToAdd)
    });
    
    console.log(`${xpToAdd} XP ajoutés avec succès à l'utilisateur dans Firebase. Nouveau niveau: ${newLevel}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'XP à l'utilisateur dans Firebase:", error);
    return false;
  }
}

// Ajouter des pièces à un utilisateur dans Firebase
async function addCoinsToFirebaseUser(userId, coinsToAdd) {
  console.log(`Ajout de ${coinsToAdd} pièces à l'utilisateur dans Firebase:`, userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Mettre à jour l'utilisateur
    await window.db.collection(collections.USERS).doc(userId).update({
      coins: firebase.firestore.FieldValue.increment(coinsToAdd)
    });
    
    console.log(`${coinsToAdd} pièces ajoutées avec succès à l'utilisateur dans Firebase`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout de pièces à l'utilisateur dans Firebase:", error);
    return false;
  }
}

// Rendre les fonctions disponibles globalement
window.getAllFirebaseUsers = getAllFirebaseUsers;
window.getAllFirebaseProfiles = getAllFirebaseProfiles;
window.getAllFirebaseData = getAllFirebaseData;
window.updateFirebaseUser = updateFirebaseUser;
window.deleteFirebaseUser = deleteFirebaseUser;
window.addXPToFirebaseUser = addXPToFirebaseUser;
window.addCoinsToFirebaseUser = addCoinsToFirebaseUser;
