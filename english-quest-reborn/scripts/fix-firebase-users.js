/**
 * Script de correction avancé pour résoudre les problèmes d'utilisateurs dans Firebase
 * Ce script va :
 * 1. Fusionner tous les comptes Ollie en un seul
 * 2. Extraire les utilisateurs depuis la collection scores
 * 3. Créer des profils utilisateurs pour tous les joueurs
 * 4. S'assurer que seul Ollie a des droits d'administrateur
 */

// Configuration
const FIREBASE_COLLECTIONS = [
  'users',
  'profiles',
  'scores'
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
        console.log(`Aucun document trouvé dans la collection ${collectionName}`);
        continue;
      }
      
      console.log(`Documents trouvés dans la collection ${collectionName}: ${snapshot.size}`);
      
      // Parcourir tous les documents
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Si c'est la collection scores, extraire les noms d'utilisateurs
        if (collectionName === 'scores') {
          if (data.name) {
            const username = data.name;
            const userId = `extracted_${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            
            if (!allUsers[userId]) {
              allUsers[userId] = {
                id: userId,
                username: username,
                displayName: username,
                source: 'scores',
                level: 1,
                xp: 0,
                coins: 0,
                isAdmin: false,
                createdAt: data.timestamp || new Date().toISOString(),
                lastLogin: data.timestamp || new Date().toISOString()
              };
              console.log(`Utilisateur extrait des scores: ${username} (ID: ${userId})`);
            }
          }
        } else {
          // Pour les autres collections, ajouter directement l'utilisateur
          data.id = doc.id;
          data.source = collectionName;
          
          if (data.username || data.displayName) {
            allUsers[doc.id] = data;
            console.log(`Utilisateur trouvé: ${data.username || data.displayName || 'Sans nom'} (ID: ${doc.id}, Source: ${collectionName})`);
          }
        }
      });
    } catch (error) {
      console.error(`Erreur lors de la vérification de la collection ${collectionName}:`, error);
    }
  }
  
  console.log(`Total: ${Object.keys(allUsers).length} utilisateurs uniques récupérés depuis Firebase`);
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
  
  console.log(`Total: ${Object.keys(allUsers).length} utilisateurs uniques récupérés depuis localStorage`);
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
  
  // S'assurer que le compte principal a des droits d'administrateur
  mainOllieAccount.isAdmin = true;
  
  // Fusionner les données des autres comptes Ollie
  for (const account of ollieAccounts) {
    if (account.id === mainOllieAccount.id) continue;
    
    console.log(`Fusion du compte Ollie: ID=${account.id}, Source=${account.source}`);
    
    // Fusionner les données
    mainOllieAccount.level = Math.max(mainOllieAccount.level || 1, account.level || 1);
    mainOllieAccount.xp = Math.max(mainOllieAccount.xp || 0, account.xp || 0);
    mainOllieAccount.coins = Math.max(mainOllieAccount.coins || 0, account.coins || 0);
    
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
        skins: mainOllieAccount.skins
      });
      console.log(`Compte Ollie principal mis à jour dans Firebase: ID=${mainOllieAccount.id}, Source=${mainOllieAccount.source}`);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte Ollie principal dans Firebase: ID=${mainOllieAccount.id}, Source=${mainOllieAccount.source}`, error);
    }
  }
  
  // Mettre à jour localStorage
  try {
    // Mettre à jour english_quest_users
    const englishQuestUsers = JSON.parse(localStorage.getItem('english_quest_users') || '{}');
    englishQuestUsers[mainOllieAccount.id] = { ...mainOllieAccount, source: 'english_quest_users' };
    localStorage.setItem('english_quest_users', JSON.stringify(englishQuestUsers));
    
    // Mettre à jour users
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[mainOllieAccount.id] = { ...mainOllieAccount, source: 'users' };
    localStorage.setItem('users', JSON.stringify(users));
    
    // Mettre à jour english_quest_current_user
    localStorage.setItem('english_quest_current_user', JSON.stringify({ ...mainOllieAccount, source: 'english_quest_current_user' }));
    
    // Mettre à jour currentUser
    localStorage.setItem('currentUser', JSON.stringify({ ...mainOllieAccount, source: 'currentUser' }));
    
    console.log("Compte Ollie principal mis à jour dans localStorage");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compte Ollie principal dans localStorage:", error);
  }
  
  console.log("Fusion des comptes Ollie terminée");
  return mainOllieAccount;
}

// Fonction pour créer des profils utilisateurs pour tous les joueurs
async function createUserProfiles(allUsers) {
  console.log("Création de profils utilisateurs pour tous les joueurs...");
  
  if (!checkFirebaseInitialized()) {
    console.error("Firebase not initialized");
    return;
  }
  
  // Parcourir tous les utilisateurs
  for (const userId in allUsers) {
    const user = allUsers[userId];
    
    // Vérifier si l'utilisateur existe déjà dans la collection users
    try {
      const userDoc = await window.db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        // Créer un nouveau profil utilisateur
        const newUser = {
          username: user.username || user.displayName || 'Player',
          displayName: user.displayName || user.username || 'Player',
          level: user.level || 1,
          xp: user.xp || 0,
          coins: user.coins || 0,
          isAdmin: user.username && user.username.toLowerCase() === 'ollie',
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || new Date().toISOString()
        };
        
        // Ajouter le profil à Firebase
        await window.db.collection('users').doc(userId).set(newUser);
        console.log(`Profil utilisateur créé pour ${newUser.username} (ID: ${userId})`);
      } else {
        // Mettre à jour le profil existant
        const userData = userDoc.data();
        
        // S'assurer que seul Ollie a des droits d'administrateur
        const isOllie = userData.username && userData.username.toLowerCase() === 'ollie';
        
        await window.db.collection('users').doc(userId).update({
          isAdmin: isOllie
        });
        
        console.log(`Profil utilisateur mis à jour pour ${userData.username} (ID: ${userId})`);
      }
    } catch (error) {
      console.error(`Erreur lors de la création/mise à jour du profil utilisateur pour ${user.username || 'Sans nom'} (ID: ${userId}):`, error);
    }
  }
  
  console.log("Création de profils utilisateurs terminée");
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
  
  // Créer des profils utilisateurs pour tous les joueurs
  await createUserProfiles(allUsers);
  
  console.log("Correction complète terminée");
  
  // Recharger la page
  if (confirm("Correction terminée. Voulez-vous recharger la page pour voir les changements ?")) {
    window.location.reload();
  }
}

// Ajouter un bouton de correction à la page
function addFixButton() {
  const button = document.createElement('button');
  button.textContent = 'Corriger Firebase';
  button.style.position = 'fixed';
  button.style.bottom = '200px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#ff5722';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.padding = '10px 20px';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  
  button.addEventListener('click', async function() {
    if (confirm("Voulez-vous corriger les problèmes d'utilisateurs dans Firebase ? Cette opération va fusionner les comptes Ollie et créer des profils pour tous les joueurs.")) {
      await runFix();
    }
  });
  
  document.body.appendChild(button);
}

// Initialiser la correction
document.addEventListener('DOMContentLoaded', function() {
  addFixButton();
});
