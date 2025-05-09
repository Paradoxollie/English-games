/**
 * Script de correction pour résoudre les problèmes d'utilisateurs et d'administration
 * Ce script va :
 * 1. Fusionner tous les comptes Ollie en un seul
 * 2. Forcer la récupération de tous les utilisateurs depuis Firebase
 * 3. Corriger les problèmes d'affichage dans le panneau d'administration
 */

// Configuration
const FIREBASE_COLLECTIONS = [
  'users',
  'profiles',
  'players',
  'accounts',
  'userProfiles',
  'game_users',
  'english_quest_users',
  'auth_users'
];

const LOCALSTORAGE_KEYS = [
  'english_quest_users',
  'users',
  'english_quest_current_user',
  'currentUser',
  'userProfile'
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

// Fonction pour récupérer tous les utilisateurs de Firebase
async function getAllFirebaseUsers() {
  console.log("Récupération de tous les utilisateurs de Firebase...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return {};
  }
  
  const allUsers = {};
  
  // Parcourir toutes les collections
  for (const collectionName of FIREBASE_COLLECTIONS) {
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
  
  // Parcourir toutes les clés
  for (const key of LOCALSTORAGE_KEYS) {
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

// Fonction pour fusionner les comptes Ollie
async function mergeOllieAccounts(ollieAccounts) {
  console.log("Fusion des comptes Ollie...");
  
  if (ollieAccounts.length <= 1) {
    console.log("Pas besoin de fusionner les comptes Ollie");
    return ollieAccounts[0] || null;
  }
  
  // Choisir le compte Ollie principal (préférer celui de Firebase)
  const mainOllieAccount = ollieAccounts.find(account => account.source === 'users') || 
                          ollieAccounts.find(account => account.source === 'profiles') || 
                          ollieAccounts[0];
  
  console.log(`Compte Ollie principal choisi: ID=${mainOllieAccount.id}, Source=${mainOllieAccount.source}`);
  
  // Fusionner les données des autres comptes Ollie
  for (const account of ollieAccounts) {
    if (account.id === mainOllieAccount.id) continue;
    
    console.log(`Fusion du compte Ollie: ID=${account.id}, Source=${account.source}`);
    
    // Fusionner les données
    mainOllieAccount.level = Math.max(mainOllieAccount.level || 1, account.level || 1);
    mainOllieAccount.xp = Math.max(mainOllieAccount.xp || 0, account.xp || 0);
    mainOllieAccount.coins = Math.max(mainOllieAccount.coins || 0, account.coins || 0);
    mainOllieAccount.isAdmin = true;
    
    // Fusionner les skins
    if (account.skins && mainOllieAccount.skins) {
      for (const skinType in account.skins) {
        if (!mainOllieAccount.skins[skinType]) {
          mainOllieAccount.skins[skinType] = [];
        }
        
        if (Array.isArray(account.skins[skinType])) {
          for (const skin of account.skins[skinType]) {
            if (!mainOllieAccount.skins[skinType].includes(skin)) {
              mainOllieAccount.skins[skinType].push(skin);
            }
          }
        }
      }
    }
    
    // Fusionner les achievements
    if (Array.isArray(account.achievements) && Array.isArray(mainOllieAccount.achievements)) {
      for (const achievement of account.achievements) {
        const existingAchievement = mainOllieAccount.achievements.find(a => a.id === achievement.id);
        if (!existingAchievement) {
          mainOllieAccount.achievements.push(achievement);
        }
      }
    }
    
    // Supprimer le compte Ollie dupliqué
    if (account.source === 'users' || account.source === 'profiles') {
      try {
        await window.db.collection(account.source).doc(account.id).delete();
        console.log(`Compte Ollie supprimé de Firebase: ID=${account.id}, Source=${account.source}`);
      } catch (error) {
        console.error(`Erreur lors de la suppression du compte Ollie de Firebase: ID=${account.id}, Source=${account.source}`, error);
      }
    }
  }
  
  // Mettre à jour le compte Ollie principal dans Firebase
  if (mainOllieAccount.source === 'users' || mainOllieAccount.source === 'profiles') {
    try {
      await window.db.collection(mainOllieAccount.source).doc(mainOllieAccount.id).update({
        level: mainOllieAccount.level,
        xp: mainOllieAccount.xp,
        coins: mainOllieAccount.coins,
        isAdmin: true,
        skins: mainOllieAccount.skins,
        achievements: mainOllieAccount.achievements
      });
      console.log(`Compte Ollie principal mis à jour dans Firebase: ID=${mainOllieAccount.id}, Source=${mainOllieAccount.source}`);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte Ollie principal dans Firebase: ID=${mainOllieAccount.id}, Source=${mainOllieAccount.source}`, error);
    }
  }
  
  // Mettre à jour le compte Ollie principal dans localStorage
  for (const key of LOCALSTORAGE_KEYS) {
    try {
      if (key === 'english_quest_users' || key === 'users') {
        const users = JSON.parse(localStorage.getItem(key) || '{}');
        
        // Supprimer tous les comptes Ollie
        for (const userId in users) {
          if (users[userId].username && users[userId].username.toLowerCase() === 'ollie') {
            delete users[userId];
          }
        }
        
        // Ajouter le compte Ollie principal
        users[mainOllieAccount.id] = {
          ...mainOllieAccount,
          source: key
        };
        
        localStorage.setItem(key, JSON.stringify(users));
        console.log(`Compte Ollie principal mis à jour dans localStorage: ${key}`);
      } else if (key === 'english_quest_current_user' || key === 'currentUser' || key === 'userProfile') {
        const currentUser = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
          localStorage.setItem(key, JSON.stringify({
            ...mainOllieAccount,
            id: mainOllieAccount.id,
            source: key
          }));
          console.log(`Compte Ollie principal mis à jour dans localStorage: ${key}`);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte Ollie principal dans localStorage: ${key}`, error);
    }
  }
  
  console.log("Fusion des comptes Ollie terminée");
  return mainOllieAccount;
}

// Fonction pour forcer la récupération de tous les utilisateurs depuis Firebase
async function forceRefreshUsers() {
  console.log("Forçage de la récupération de tous les utilisateurs depuis Firebase...");
  
  // Récupérer tous les utilisateurs de Firebase
  const firebaseUsers = await getAllFirebaseUsers();
  
  // Mettre à jour les utilisateurs dans localStorage
  try {
    localStorage.setItem('english_quest_users', JSON.stringify(firebaseUsers));
    localStorage.setItem('users', JSON.stringify(firebaseUsers));
    console.log("Utilisateurs mis à jour dans localStorage");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des utilisateurs dans localStorage:", error);
  }
  
  console.log("Récupération forcée des utilisateurs terminée");
  return firebaseUsers;
}

// Fonction pour exécuter la correction complète
async function runFix() {
  console.log("Exécution de la correction complète...");
  
  // Récupérer tous les utilisateurs
  const firebaseUsers = await getAllFirebaseUsers();
  const localUsers = getAllLocalUsers();
  
  // Fusionner les utilisateurs
  const allUsers = { ...firebaseUsers, ...localUsers };
  
  // Identifier les comptes Ollie
  const ollieAccounts = identifyOllieAccounts(allUsers);
  
  // Fusionner les comptes Ollie
  const mainOllieAccount = await mergeOllieAccounts(ollieAccounts);
  
  // Forcer la récupération de tous les utilisateurs depuis Firebase
  await forceRefreshUsers();
  
  console.log("Correction complète terminée");
  
  // Recharger la page
  if (confirm("Correction terminée. Voulez-vous recharger la page pour voir les changements ?")) {
    window.location.reload();
  }
}

// Ajouter un bouton de correction à la page
function addFixButton() {
  const button = document.createElement('button');
  button.textContent = 'Corriger Utilisateurs';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
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
    if (confirm("Voulez-vous corriger les problèmes d'utilisateurs ? Cette opération va fusionner les comptes Ollie et forcer la récupération de tous les utilisateurs.")) {
      await runFix();
    }
  });
  
  document.body.appendChild(button);
}

// Initialiser la correction
document.addEventListener('DOMContentLoaded', function() {
  addFixButton();
});
