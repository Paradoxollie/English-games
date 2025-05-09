/**
 * Script pour améliorer la gestion des utilisateurs dans le panneau d'administration
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

// Fonction pour récupérer tous les utilisateurs (Firebase + localStorage)
async function getAllUsers() {
  console.log("Récupération de tous les utilisateurs...");
  
  // Récupérer les utilisateurs de Firebase
  const firebaseUsers = await getAllFirebaseUsers();
  
  // Récupérer les utilisateurs de localStorage
  const localUsers = getAllLocalUsers();
  
  // Fusionner les deux listes
  const allUsers = { ...firebaseUsers };
  
  // Ajouter les utilisateurs locaux qui ne sont pas déjà dans la liste
  Object.entries(localUsers).forEach(([userId, userData]) => {
    if (!allUsers[userId]) {
      allUsers[userId] = userData;
    } else {
      // Fusionner les données
      allUsers[userId] = { ...allUsers[userId], ...userData };
    }
  });
  
  console.log(`Total: ${Object.keys(allUsers).length} utilisateurs uniques récupérés (Firebase + localStorage)`);
  return allUsers;
}

// Fonction pour récupérer tous les utilisateurs de Firebase
async function getAllFirebaseUsers() {
  console.log("Récupération de tous les utilisateurs de Firebase...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return {};
  }
  
  const allUsers = {};
  
  // Liste des collections à vérifier
  const collections = ['users', 'profiles', 'players', 'accounts', 'userProfiles'];
  
  // Parcourir toutes les collections
  for (const collectionName of collections) {
    try {
      console.log(`Vérification de la collection ${collectionName}...`);
      
      // Récupérer tous les documents de la collection
      const snapshot = await window.db.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`Aucun utilisateur trouvé dans la collection ${collectionName}`);
        continue;
      }
      
      console.log(`Utilisateurs trouvés dans la collection ${collectionName}: ${snapshot.size}`);
      
      // Parcourir tous les documents
      snapshot.forEach(doc => {
        const userData = doc.data();
        userData.id = doc.id;
        userData.source = collectionName;
        
        allUsers[doc.id] = userData;
      });
    } catch (error) {
      console.error(`Erreur lors de la vérification de la collection ${collectionName}:`, error);
    }
  }
  
  console.log(`Total: ${Object.keys(allUsers).length} utilisateurs récupérés depuis Firebase`);
  return allUsers;
}

// Fonction pour récupérer tous les utilisateurs de localStorage
function getAllLocalUsers() {
  console.log("Récupération de tous les utilisateurs de localStorage...");
  
  const allUsers = {};
  
  // Liste des clés à vérifier
  const keys = [
    'english_quest_users',
    'users',
    'english_quest_current_user',
    'currentUser',
    'userProfile'
  ];
  
  // Parcourir toutes les clés
  for (const key of keys) {
    try {
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.log(`Aucune donnée trouvée pour la clé ${key}`);
        continue;
      }
      
      console.log(`Données trouvées pour la clé ${key}`);
      
      // Essayer de parser les données
      const parsedData = JSON.parse(data);
      
      // Si c'est un objet avec des utilisateurs
      if (typeof parsedData === 'object' && parsedData !== null) {
        // Si c'est un objet avec des clés qui sont des IDs d'utilisateurs
        if (key === 'english_quest_users' || key === 'users') {
          Object.entries(parsedData).forEach(([userId, userData]) => {
            userData.id = userId;
            userData.source = key;
            
            allUsers[userId] = userData;
          });
        } else {
          // Si c'est un utilisateur unique
          if (parsedData.username) {
            const userId = parsedData.id || `local_${Date.now()}`;
            parsedData.id = userId;
            parsedData.source = key;
            
            allUsers[userId] = parsedData;
          }
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification de la clé ${key}:`, error);
    }
  }
  
  console.log(`Total: ${Object.keys(allUsers).length} utilisateurs récupérés depuis localStorage`);
  return allUsers;
}

// Fonction pour vérifier si un utilisateur est administrateur
function isAdmin(user) {
  // SÉCURITÉ CRITIQUE: Vérification spéciale pour Ollie (seul administrateur autorisé)
  if (user && user.username && user.username.toLowerCase() === 'ollie') {
    console.log("Compte Ollie détecté - Privilèges administrateur accordés automatiquement");
    return true;
  }
  
  // Vérifier la propriété isAdmin
  return user && user.isAdmin === true;
}

// Fonction pour mettre à jour les droits d'administration d'un utilisateur
async function updateAdminRights(userId, isAdminValue, currentUsername) {
  try {
    // Vérifier si l'utilisateur actuel est Ollie
    if (!currentUsername || currentUsername.toLowerCase() !== 'ollie') {
      console.error("Seul Ollie peut modifier les droits d'administration");
      throw new Error("Vous n'avez pas les droits pour effectuer cette action");
    }
    
    // Récupérer tous les utilisateurs
    const allUsers = await getAllUsers();
    
    // Récupérer l'utilisateur
    const user = allUsers[userId];
    
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
    if (checkFirebaseInitialized() && user.source && (user.source === 'users' || user.source === 'profiles')) {
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
      // Mettre à jour dans english_quest_users
      const englishQuestUsers = JSON.parse(localStorage.getItem('english_quest_users') || '{}');
      if (englishQuestUsers[userId]) {
        englishQuestUsers[userId].isAdmin = user.isAdmin;
        localStorage.setItem('english_quest_users', JSON.stringify(englishQuestUsers));
        console.log(`Droits d'administration mis à jour dans english_quest_users pour ${user.username}`);
      }
      
      // Mettre à jour dans users
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[userId]) {
        users[userId].isAdmin = user.isAdmin;
        localStorage.setItem('users', JSON.stringify(users));
        console.log(`Droits d'administration mis à jour dans users pour ${user.username}`);
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

// Fonction pour supprimer un utilisateur
async function deleteUser(userId, currentUsername) {
  try {
    // Vérifier si l'utilisateur actuel est Ollie
    if (!currentUsername || currentUsername.toLowerCase() !== 'ollie') {
      console.error("Seul Ollie peut supprimer des utilisateurs");
      throw new Error("Vous n'avez pas les droits pour effectuer cette action");
    }
    
    // Récupérer tous les utilisateurs
    const allUsers = await getAllUsers();
    
    // Récupérer l'utilisateur
    const user = allUsers[userId];
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    
    // Vérifier si c'est Ollie
    if (user.username && user.username.toLowerCase() === 'ollie') {
      console.error("Vous ne pouvez pas supprimer le compte Ollie");
      throw new Error("Vous ne pouvez pas supprimer le compte administrateur principal");
    }
    
    // Supprimer l'utilisateur de Firebase
    if (checkFirebaseInitialized() && user.source && (user.source === 'users' || user.source === 'profiles')) {
      try {
        await window.db.collection(user.source).doc(user.id).delete();
        console.log(`Utilisateur supprimé de Firebase: ${user.username}`);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur de Firebase:", error);
      }
    }
    
    // Supprimer l'utilisateur de localStorage
    try {
      // Supprimer de english_quest_users
      const englishQuestUsers = JSON.parse(localStorage.getItem('english_quest_users') || '{}');
      if (englishQuestUsers[userId]) {
        delete englishQuestUsers[userId];
        localStorage.setItem('english_quest_users', JSON.stringify(englishQuestUsers));
        console.log(`Utilisateur supprimé de english_quest_users: ${user.username}`);
      }
      
      // Supprimer de users
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[userId]) {
        delete users[userId];
        localStorage.setItem('users', JSON.stringify(users));
        console.log(`Utilisateur supprimé de users: ${user.username}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur de localStorage:", error);
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
}

// Rendre les fonctions disponibles globalement
window.adminUsersService = {
  getAllUsers,
  isAdmin,
  updateAdminRights,
  deleteUser
};
