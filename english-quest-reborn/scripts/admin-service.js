/**
 * Service d'administration pour English Quest Reborn
 * Gère les fonctionnalités d'administration et la gestion des utilisateurs
 */

// Récupérer tous les utilisateurs depuis Firestore
async function getAllUsersFromFirebase() {
  try {
    console.log("Récupération de tous les utilisateurs depuis Firestore...");
    
    if (!window.db) {
      console.error("Firebase not initialized");
      return [];
    }
    
    // Liste des collections à vérifier
    const collections = ['users', 'profiles'];
    const allUsers = [];
    
    // Parcourir toutes les collections
    for (const collectionName of collections) {
      try {
        // Récupérer tous les documents de la collection
        const snapshot = await window.db.collection(collectionName).get();
        
        console.log(`Documents dans ${collectionName}: ${snapshot.size}`);
        
        // Parcourir tous les documents
        snapshot.forEach(doc => {
          const userData = doc.data();
          userData.id = doc.id;
          userData.source = collectionName;
          
          // Vérifier si l'utilisateur existe déjà dans la liste
          const existingUserIndex = allUsers.findIndex(user => 
            (user.username && userData.username && user.username.toLowerCase() === userData.username.toLowerCase())
          );
          
          if (existingUserIndex === -1) {
            allUsers.push(userData);
          } else {
            // Fusionner les données
            allUsers[existingUserIndex] = { ...allUsers[existingUserIndex], ...userData };
          }
        });
      } catch (error) {
        console.error(`Erreur lors de la récupération des utilisateurs de ${collectionName}:`, error);
      }
    }
    
    console.log(`Total: ${allUsers.length} utilisateurs uniques récupérés depuis Firebase`);
    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
}

// Récupérer tous les utilisateurs (Firebase + localStorage)
async function getAllUsers() {
  try {
    // Récupérer les utilisateurs de Firebase
    const firebaseUsers = await getAllUsersFromFirebase();
    
    // Récupérer les utilisateurs de localStorage
    const localUsers = getAllUsersFromLocalStorage();
    
    // Fusionner les deux listes
    const allUsers = [...firebaseUsers];
    
    // Ajouter les utilisateurs locaux qui ne sont pas déjà dans la liste
    for (const localUser of localUsers) {
      const existingUserIndex = allUsers.findIndex(user => 
        (user.username && localUser.username && user.username.toLowerCase() === localUser.username.toLowerCase())
      );
      
      if (existingUserIndex === -1) {
        allUsers.push(localUser);
      }
    }
    
    console.log(`Total: ${allUsers.length} utilisateurs uniques récupérés (Firebase + localStorage)`);
    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
}

// Récupérer tous les utilisateurs depuis localStorage
function getAllUsersFromLocalStorage() {
  try {
    console.log("Récupération des utilisateurs depuis localStorage...");
    
    // Créer un objet pour stocker tous les utilisateurs
    const allUsers = [];
    
    // Récupérer les utilisateurs de la clé principale
    const mainUsersJson = localStorage.getItem('english_quest_users');
    if (mainUsersJson) {
      try {
        const mainUsers = JSON.parse(mainUsersJson);
        console.log("Utilisateurs trouvés dans la clé principale:", Object.keys(mainUsers).length);
        
        // Ajouter les utilisateurs à l'objet global
        Object.values(mainUsers).forEach(user => {
          user.source = 'localStorage';
          allUsers.push(user);
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs de la clé principale:", error);
      }
    }
    
    // Récupérer l'utilisateur courant
    const currentUserJson = localStorage.getItem('english_quest_current_user');
    if (currentUserJson) {
      try {
        const currentUser = JSON.parse(currentUserJson);
        console.log("Utilisateur courant trouvé:", currentUser.username);
        
        // Vérifier si l'utilisateur existe déjà dans la liste
        const existingUserIndex = allUsers.findIndex(user => 
          (user.username && currentUser.username && user.username.toLowerCase() === currentUser.username.toLowerCase())
        );
        
        if (existingUserIndex === -1) {
          currentUser.source = 'localStorage_current';
          allUsers.push(currentUser);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur courant:", error);
      }
    }
    
    console.log(`Total: ${allUsers.length} utilisateurs uniques récupérés depuis localStorage`);
    return allUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis localStorage:", error);
    return [];
  }
}

// Vérifier si un utilisateur est administrateur
function isAdmin(user) {
  // SÉCURITÉ CRITIQUE: Vérification spéciale pour Ollie (seul administrateur autorisé)
  if (user && user.username && user.username.toLowerCase() === 'ollie') {
    console.log("Compte Ollie détecté - Privilèges administrateur accordés automatiquement");
    return true;
  }
  
  // Vérifier la propriété isAdmin
  return user && user.isAdmin === true;
}

// Mettre à jour les droits d'administration d'un utilisateur
async function updateAdminRights(userId, isAdminValue, currentUsername) {
  try {
    // Vérifier si l'utilisateur actuel est Ollie
    if (!currentUsername || currentUsername.toLowerCase() !== 'ollie') {
      console.error("Seul Ollie peut modifier les droits d'administration");
      throw new Error("Vous n'avez pas les droits pour effectuer cette action");
    }
    
    // Récupérer l'utilisateur
    let user = null;
    
    // Vérifier d'abord dans Firebase
    if (window.db) {
      try {
        // Essayer dans la collection 'profiles'
        const profileDoc = await window.db.collection('profiles').doc(userId).get();
        if (profileDoc.exists) {
          user = profileDoc.data();
          user.id = profileDoc.id;
          user.source = 'profiles';
        } else {
          // Essayer dans la collection 'users'
          const userDoc = await window.db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            user = userDoc.data();
            user.id = userDoc.id;
            user.source = 'users';
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur depuis Firebase:", error);
      }
    }
    
    // Si l'utilisateur n'est pas trouvé dans Firebase, chercher dans localStorage
    if (!user) {
      const localUsers = getAllUsersFromLocalStorage();
      user = localUsers.find(u => u.id === userId);
    }
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    
    // Vérifier si c'est Ollie
    if (user.username && user.username.toLowerCase() === 'ollie') {
      console.log("Protection des privilèges administrateur pour Ollie");
      
      // On ne peut pas retirer les droits d'administration à Ollie
      if (!isAdminValue) {
        throw new Error("Vous ne pouvez pas retirer vos propres droits d'administration");
      }
      
      // Mettre à jour l'utilisateur (même si ça ne change rien)
      user.isAdmin = true;
    } else {
      // Mettre à jour les droits d'administration
      console.log(`Modification des droits d'administration pour ${user.username}: ${isAdminValue}`);
      user.isAdmin = isAdminValue;
    }
    
    // Mettre à jour l'utilisateur dans Firebase
    if (window.db && user.source && user.id) {
      try {
        await window.db.collection(user.source).doc(user.id).update({
          isAdmin: user.isAdmin
        });
        console.log(`Droits d'administration mis à jour dans Firebase pour ${user.username}`);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des droits d'administration dans Firebase:", error);
      }
    }
    
    // Mettre à jour l'utilisateur dans localStorage
    try {
      const localUsers = JSON.parse(localStorage.getItem('english_quest_users') || '{}');
      if (localUsers[userId]) {
        localUsers[userId].isAdmin = user.isAdmin;
        localStorage.setItem('english_quest_users', JSON.stringify(localUsers));
        console.log(`Droits d'administration mis à jour dans localStorage pour ${user.username}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des droits d'administration dans localStorage:", error);
    }
    
    return user;
  } catch (error) {
    console.error("Erreur lors de la modification des droits d'administration:", error);
    throw error;
  }
}

// Rendre les fonctions disponibles globalement
window.adminService = {
  getAllUsers,
  isAdmin,
  updateAdminRights
};
