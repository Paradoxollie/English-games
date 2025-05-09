/**
 * English Quest - Firebase Users Script
 * Gère la récupération et la gestion des utilisateurs depuis Firebase
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
async function getAllRealUsers() {
  console.log("Récupération de tous les utilisateurs réels depuis Firebase...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return {};
  }
  
  try {
    // Récupérer les utilisateurs depuis la collection 'users'
    const usersSnapshot = await window.db.collection('users').get();
    
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
    
    console.log("Utilisateurs réels récupérés depuis Firebase:", allUsers);
    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis Firebase:", error);
    return {};
  }
}

// Mettre à jour un utilisateur dans Firebase
async function updateRealUser(userId, userData) {
  console.log("Mise à jour de l'utilisateur réel dans Firebase:", userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Mettre à jour l'utilisateur dans la collection 'users'
    await window.db.collection('users').doc(userId).update(userData);
    
    console.log("Utilisateur réel mis à jour avec succès dans Firebase");
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur dans Firebase:", error);
    return false;
  }
}

// Supprimer un utilisateur dans Firebase
async function deleteRealUser(userId) {
  console.log("Suppression de l'utilisateur réel dans Firebase:", userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Supprimer l'utilisateur dans la collection 'users'
    await window.db.collection('users').doc(userId).delete();
    
    console.log("Utilisateur réel supprimé avec succès dans Firebase");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur dans Firebase:", error);
    return false;
  }
}

// Ajouter de l'XP à un utilisateur dans Firebase
async function addXPToRealUser(userId, xpToAdd) {
  console.log(`Ajout de ${xpToAdd} XP à l'utilisateur réel dans Firebase:`, userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Récupérer l'utilisateur actuel
    const userDoc = await window.db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error("Utilisateur réel non trouvé dans Firebase");
      return false;
    }
    
    const userData = userDoc.data();
    
    // Calculer la nouvelle XP et le nouveau niveau
    const newXP = (userData.xp || 0) + xpToAdd;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    
    // Mettre à jour l'utilisateur
    await window.db.collection('users').doc(userId).update({
      xp: newXP,
      level: newLevel
    });
    
    console.log(`${xpToAdd} XP ajoutés avec succès à l'utilisateur réel dans Firebase. Nouveau niveau: ${newLevel}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'XP à l'utilisateur réel dans Firebase:", error);
    return false;
  }
}

// Ajouter des pièces à un utilisateur dans Firebase
async function addCoinsToRealUser(userId, coinsToAdd) {
  console.log(`Ajout de ${coinsToAdd} pièces à l'utilisateur réel dans Firebase:`, userId);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Récupérer l'utilisateur actuel
    const userDoc = await window.db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error("Utilisateur réel non trouvé dans Firebase");
      return false;
    }
    
    const userData = userDoc.data();
    
    // Calculer le nouveau solde de pièces
    const newCoins = (userData.coins || 0) + coinsToAdd;
    
    // Mettre à jour l'utilisateur
    await window.db.collection('users').doc(userId).update({
      coins: newCoins
    });
    
    console.log(`${coinsToAdd} pièces ajoutées avec succès à l'utilisateur réel dans Firebase. Nouveau solde: ${newCoins}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout de pièces à l'utilisateur réel dans Firebase:", error);
    return false;
  }
}

// Modifier les droits d'administration d'un utilisateur dans Firebase
async function setAdminRights(userId, isAdmin) {
  console.log(`Modification des droits d'administration pour l'utilisateur ${userId}: ${isAdmin}`);
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return false;
  }
  
  try {
    // Mettre à jour l'utilisateur dans la collection 'users'
    await window.db.collection('users').doc(userId).update({
      isAdmin: isAdmin
    });
    
    console.log(`Droits d'administration modifiés avec succès pour l'utilisateur ${userId}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la modification des droits d'administration:", error);
    return false;
  }
}

// Rendre les fonctions disponibles globalement
window.getAllRealUsers = getAllRealUsers;
window.updateRealUser = updateRealUser;
window.deleteRealUser = deleteRealUser;
window.addXPToRealUser = addXPToRealUser;
window.addCoinsToRealUser = addCoinsToRealUser;
window.setAdminRights = setAdminRights;
