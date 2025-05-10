/**
 * Script de diagnostic pour identifier tous les utilisateurs et résoudre les problèmes d'administration
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
        
        console.log(`Utilisateur trouvé: ${userData.username || 'Sans nom'} (ID: ${doc.id}, Source: ${collectionName})`);
      });
    } catch (error) {
      console.error(`Erreur lors de la vérification de la collection ${collectionName}:`, error);
    }
  }
  
  console.log("Tous les utilisateurs Firebase:", allUsers);
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
            
            console.log(`Utilisateur trouvé: ${userData.username || 'Sans nom'} (ID: ${userId}, Source: ${key})`);
          });
        } else {
          // Si c'est un utilisateur unique
          if (parsedData.username) {
            const userId = parsedData.id || `local_${Date.now()}`;
            parsedData.id = userId;
            parsedData.source = key;
            
            allUsers[userId] = parsedData;
            
            console.log(`Utilisateur trouvé: ${parsedData.username} (ID: ${userId}, Source: ${key})`);
          }
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification de la clé ${key}:`, error);
    }
  }
  
  console.log("Tous les utilisateurs localStorage:", allUsers);
  return allUsers;
}

// Fonction pour identifier les comptes Ollie
function identifyOllieAccounts(allUsers) {
  console.log("Identification des comptes Ollie...");
  
  const ollieAccounts = [];
  
  // Parcourir tous les utilisateurs
  Object.values(allUsers).forEach(user => {
    if (user.username && user.username.toLowerCase() === 'ollie') {
      ollieAccounts.push(user);
      console.log(`Compte Ollie trouvé: ID=${user.id}, Source=${user.source}`);
    }
  });
  
  console.log(`${ollieAccounts.length} comptes Ollie trouvés`);
  return ollieAccounts;
}

// Fonction pour identifier les utilisateurs avec des droits d'administrateur
function identifyAdminUsers(allUsers) {
  console.log("Identification des utilisateurs avec des droits d'administrateur...");
  
  const adminUsers = [];
  
  // Parcourir tous les utilisateurs
  Object.values(allUsers).forEach(user => {
    if (user.isAdmin === true) {
      adminUsers.push(user);
      console.log(`Utilisateur admin trouvé: ${user.username || 'Sans nom'} (ID: ${user.id}, Source: ${user.source})`);
    }
  });
  
  console.log(`${adminUsers.length} utilisateurs admin trouvés`);
  return adminUsers;
}

// Fonction pour exécuter le diagnostic complet
async function runUserDiagnostic() {
  console.log("Exécution du diagnostic utilisateur...");
  
  // Récupérer tous les utilisateurs
  const firebaseUsers = await getAllFirebaseUsers();
  const localUsers = getAllLocalUsers();
  
  // Fusionner les utilisateurs
  const allUsers = { ...firebaseUsers, ...localUsers };
  
  // Identifier les comptes Ollie
  const ollieAccounts = identifyOllieAccounts(allUsers);
  
  // Identifier les utilisateurs avec des droits d'administrateur
  const adminUsers = identifyAdminUsers(allUsers);
  
  // Afficher un résumé
  console.log("=== RÉSUMÉ DU DIAGNOSTIC ===");
  console.log(`Nombre total d'utilisateurs: ${Object.keys(allUsers).length}`);
  console.log(`Nombre de comptes Ollie: ${ollieAccounts.length}`);
  console.log(`Nombre d'utilisateurs admin: ${adminUsers.length}`);
  
  // Retourner les résultats
  return {
    allUsers,
    firebaseUsers,
    localUsers,
    ollieAccounts,
    adminUsers
  };
}

// Fonction pour corriger les problèmes d'administration
async function fixAdminIssues(diagnosticResults) {
  console.log("Correction des problèmes d'administration...");
  
  const { allUsers, ollieAccounts, adminUsers } = diagnosticResults;
  
  // 1. S'assurer qu'il n'y a qu'un seul compte Ollie avec des droits d'administrateur
  if (ollieAccounts.length > 0) {
    console.log("Correction des comptes Ollie...");
    
    // Choisir le compte Ollie principal (préférer celui de Firebase)
    const mainOllieAccount = ollieAccounts.find(account => account.source === 'users') || 
                            ollieAccounts.find(account => account.source === 'profiles') || 
                            ollieAccounts[0];
    
    console.log(`Compte Ollie principal choisi: ID=${mainOllieAccount.id}, Source=${mainOllieAccount.source}`);
    
    // S'assurer que le compte Ollie principal a des droits d'administrateur
    if (!mainOllieAccount.isAdmin) {
      console.log("Attribution des droits d'administrateur au compte Ollie principal");
      mainOllieAccount.isAdmin = true;
      
      // Mettre à jour dans Firebase si possible
      if (mainOllieAccount.source === 'users' || mainOllieAccount.source === 'profiles') {
        try {
          await window.db.collection(mainOllieAccount.source).doc(mainOllieAccount.id).update({
            isAdmin: true
          });
          console.log("Droits d'administrateur mis à jour dans Firebase");
        } catch (error) {
          console.error("Erreur lors de la mise à jour des droits d'administrateur dans Firebase:", error);
        }
      }
    }
    
    // Mettre à jour dans localStorage
    try {
      // Mettre à jour dans english_quest_users
      const englishQuestUsers = JSON.parse(localStorage.getItem('english_quest_users') || '{}');
      if (englishQuestUsers[mainOllieAccount.id]) {
        englishQuestUsers[mainOllieAccount.id].isAdmin = true;
        localStorage.setItem('english_quest_users', JSON.stringify(englishQuestUsers));
        console.log("Droits d'administrateur mis à jour dans english_quest_users");
      }
      
      // Mettre à jour dans users
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[mainOllieAccount.id]) {
        users[mainOllieAccount.id].isAdmin = true;
        localStorage.setItem('users', JSON.stringify(users));
        console.log("Droits d'administrateur mis à jour dans users");
      }
      
      // Mettre à jour l'utilisateur courant si c'est Ollie
      const currentUser = JSON.parse(localStorage.getItem('english_quest_current_user') || '{}');
      if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
        currentUser.isAdmin = true;
        localStorage.setItem('english_quest_current_user', JSON.stringify(currentUser));
        console.log("Droits d'administrateur mis à jour dans english_quest_current_user");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des droits d'administrateur dans localStorage:", error);
    }
  }
  
  // 2. Retirer les droits d'administrateur des autres utilisateurs
  if (adminUsers.length > 0) {
    console.log("Retrait des droits d'administrateur des utilisateurs non-Ollie...");
    
    for (const user of adminUsers) {
      if (user.username && user.username.toLowerCase() !== 'ollie') {
        console.log(`Retrait des droits d'administrateur de l'utilisateur ${user.username} (ID: ${user.id}, Source: ${user.source})`);
        
        user.isAdmin = false;
        
        // Mettre à jour dans Firebase si possible
        if (user.source === 'users' || user.source === 'profiles') {
          try {
            await window.db.collection(user.source).doc(user.id).update({
              isAdmin: false
            });
            console.log("Droits d'administrateur retirés dans Firebase");
          } catch (error) {
            console.error("Erreur lors du retrait des droits d'administrateur dans Firebase:", error);
          }
        }
        
        // Mettre à jour dans localStorage
        try {
          // Mettre à jour dans english_quest_users
          const englishQuestUsers = JSON.parse(localStorage.getItem('english_quest_users') || '{}');
          if (englishQuestUsers[user.id]) {
            englishQuestUsers[user.id].isAdmin = false;
            localStorage.setItem('english_quest_users', JSON.stringify(englishQuestUsers));
            console.log("Droits d'administrateur retirés dans english_quest_users");
          }
          
          // Mettre à jour dans users
          const users = JSON.parse(localStorage.getItem('users') || '{}');
          if (users[user.id]) {
            users[user.id].isAdmin = false;
            localStorage.setItem('users', JSON.stringify(users));
            console.log("Droits d'administrateur retirés dans users");
          }
        } catch (error) {
          console.error("Erreur lors du retrait des droits d'administrateur dans localStorage:", error);
        }
      }
    }
  }
  
  console.log("Correction des problèmes d'administration terminée");
}

// Ajouter un bouton de diagnostic à la page
function addDiagnosticButton() {
  const button = document.createElement('button');
  button.textContent = 'Diagnostic Utilisateurs';
  button.style.position = 'fixed';
  button.style.bottom = '80px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#e74c3c';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.padding = '10px 20px';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  
  button.addEventListener('click', async function() {
    const diagnosticResults = await runUserDiagnostic();
    
    // Demander si l'utilisateur veut corriger les problèmes
    if (confirm("Voulez-vous corriger les problèmes d'administration ?")) {
      await fixAdminIssues(diagnosticResults);
      alert("Correction terminée. Veuillez recharger la page pour voir les changements.");
    }
  });
  
  document.body.appendChild(button);
}

// Initialiser le diagnostic
document.addEventListener('DOMContentLoaded', function() {
  addDiagnosticButton();
});
