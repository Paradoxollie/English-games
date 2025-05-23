/**
 * Script de correction avancé pour résoudre les problèmes de comptes et de Firebase
 * Ce script va :
 * 1. Centraliser la configuration Firebase
 * 2. Fusionner tous les comptes Ollie en un seul
 * 3. Corriger les droits d'administrateur
 * 4. Synchroniser les utilisateurs entre localStorage et Firebase
 * 5. Corriger les liens entre les scores et les utilisateurs
 */

// Configuration
const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  SCORES: 'game_scores',
  LEADERBOARDS: 'leaderboards'
};

const LOCALSTORAGE_KEYS = [
  'english_quest_users',
  'users',
  'english_quest_current_user',
  'currentUser',
  'userProfile'
];

// Vérifier si Firebase est initialisé
function checkFirebaseInitialized() {
  if (!window.firebase) {
    console.error("Firebase n'est pas chargé");
    return false;
  }

  if (!window.firebase.apps || !window.firebase.apps.length) {
    console.error("Firebase n'est pas initialisé");
    return false;
  }

  if (!window.db) {
    try {
      window.db = firebase.firestore();
      console.log("Firestore initialisé manuellement");
    } catch (error) {
      console.error("Erreur lors de l'initialisation manuelle de Firestore:", error);
      return false;
    }
  }

  return true;
}

// Initialiser Firebase si nécessaire
function initializeFirebase() {
  if (window.firebase && (window.firebase.apps && window.firebase.apps.length > 0)) {
    console.log("Firebase déjà initialisé");
    return true;
  }

  try {
    // Configuration Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
      authDomain: "english-games-41017.firebaseapp.com",
      projectId: "english-games-41017",
      storageBucket: "english-games-41017.appspot.com",
      messagingSenderId: "452279652544",
      appId: "1:452279652544:web:916f93e0ab29183e739d25",
      measurementId: "G-RMCQTMKDVP",
      databaseURL: "https://english-games-41017-default-rtdb.europe-west1.firebasedatabase.app"
    };

    // Initialiser Firebase
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    console.log("Firebase initialisé avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase:", error);
    return false;
  }
}

// Récupérer tous les utilisateurs de Firebase
async function getAllFirebaseUsers() {
  console.log("Récupération de tous les utilisateurs de Firebase...");

  if (!checkFirebaseInitialized()) {
    console.error("Firebase non initialisé");
    return {};
  }

  try {
    // Récupérer les utilisateurs depuis la collection 'users'
    const usersSnapshot = await window.db.collection(FIREBASE_COLLECTIONS.USERS).get();
    const users = {};

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users[doc.id] = {
        id: doc.id,
        userId: doc.id,
        source: FIREBASE_COLLECTIONS.USERS,
        ...userData
      };
    });

    // Récupérer les utilisateurs depuis la collection 'profiles'
    const profilesSnapshot = await window.db.collection(FIREBASE_COLLECTIONS.PROFILES).get();

    profilesSnapshot.forEach(doc => {
      const profileData = doc.data();
      if (!users[doc.id]) {
        users[doc.id] = {
          id: doc.id,
          userId: doc.id,
          source: FIREBASE_COLLECTIONS.PROFILES,
          ...profileData
        };
      } else {
        // Fusionner les données
        users[doc.id] = {
          ...users[doc.id],
          ...profileData
        };
      }
    });

    console.log("Utilisateurs récupérés depuis Firebase:", users);
    return users;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis Firebase:", error);
    return {};
  }
}

// Récupérer tous les utilisateurs locaux
function getAllLocalUsers() {
  console.log("Récupération de tous les utilisateurs locaux...");

  const users = {};

  // Récupérer les utilisateurs depuis english_quest_users
  try {
    const eqUsersJson = localStorage.getItem('english_quest_users');
    if (eqUsersJson) {
      const eqUsers = JSON.parse(eqUsersJson);
      Object.keys(eqUsers).forEach(userId => {
        users[userId] = {
          ...eqUsers[userId],
          id: userId,
          userId: userId,
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
            id: userId,
            userId: userId,
            source: 'users'
          };
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis users:", error);
  }

  console.log("Utilisateurs locaux récupérés:", users);
  return users;
}

// Identifier les comptes Ollie
function identifyOllieAccounts(allUsers) {
  console.log("Identification des comptes Ollie...");

  const ollieAccounts = [];

  Object.keys(allUsers).forEach(userId => {
    const user = allUsers[userId];
    if (user.username && user.username.toLowerCase() === 'ollie') {
      ollieAccounts.push({
        id: userId,
        ...user
      });
    }
  });

  console.log(`${ollieAccounts.length} comptes Ollie identifiés:`, ollieAccounts);
  return ollieAccounts;
}

// Fusionner les comptes Ollie
async function mergeOllieAccounts(ollieAccounts) {
  console.log("Fusion des comptes Ollie...");

  if (ollieAccounts.length <= 1) {
    console.log("Pas besoin de fusionner les comptes Ollie");
    return ollieAccounts[0] || null;
  }

  // Choisir le compte Ollie principal (préférer celui de Firebase)
  const mainOllieAccount = ollieAccounts.find(account => account.source === FIREBASE_COLLECTIONS.USERS) ||
                          ollieAccounts.find(account => account.source === FIREBASE_COLLECTIONS.PROFILES) ||
                          ollieAccounts[0];

  console.log(`Compte Ollie principal choisi: ID=${mainOllieAccount.id}, Source=${mainOllieAccount.source}`);

  // S'assurer que le compte principal a des droits d'administrateur
  mainOllieAccount.isAdmin = true;

  // Fusionner les données des autres comptes Ollie
  for (const account of ollieAccounts) {
    if (account.id === mainOllieAccount.id) continue;

    // Fusionner les données
    mainOllieAccount.level = Math.max(mainOllieAccount.level || 1, account.level || 1);
    mainOllieAccount.xp = Math.max(mainOllieAccount.xp || 0, account.xp || 0);
    mainOllieAccount.coins = Math.max(mainOllieAccount.coins || 0, account.coins || 0);

    // Fusionner les skins
    if (account.skins && Array.isArray(account.skins)) {
      if (!mainOllieAccount.skins) mainOllieAccount.skins = [];
      account.skins.forEach(skin => {
        if (!mainOllieAccount.skins.some(s => s.id === skin.id)) {
          mainOllieAccount.skins.push(skin);
        }
      });
    }

    // Supprimer le compte Ollie dupliqué
    if (account.source === FIREBASE_COLLECTIONS.USERS || account.source === FIREBASE_COLLECTIONS.PROFILES) {
      try {
        await window.db.collection(account.source).doc(account.id).delete();
        console.log(`Compte Ollie supprimé de Firebase: ID=${account.id}, Source=${account.source}`);
      } catch (error) {
        console.error(`Erreur lors de la suppression du compte Ollie de Firebase: ID=${account.id}, Source=${account.source}`, error);
      }
    }
  }

  // Mettre à jour le compte Ollie principal dans Firebase
  try {
    // Mettre à jour dans la collection 'users'
    await window.db.collection(FIREBASE_COLLECTIONS.USERS).doc(mainOllieAccount.id).set({
      username: 'Ollie',
      displayName: 'Ollie',
      level: mainOllieAccount.level || 1,
      xp: mainOllieAccount.xp || 0,
      coins: mainOllieAccount.coins || 1000,
      isAdmin: true,
      skins: mainOllieAccount.skins || [],
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Mettre à jour dans la collection 'profiles'
    await window.db.collection(FIREBASE_COLLECTIONS.PROFILES).doc(mainOllieAccount.id).set({
      username: 'Ollie',
      displayName: 'Ollie',
      level: mainOllieAccount.level || 1,
      xp: mainOllieAccount.xp || 0,
      coins: mainOllieAccount.coins || 1000,
      isAdmin: true,
      skins: mainOllieAccount.skins || [],
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log("Compte Ollie principal mis à jour dans Firebase");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compte Ollie principal dans Firebase:", error);
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
          username: 'Ollie',
          displayName: 'Ollie',
          level: mainOllieAccount.level || 1,
          xp: mainOllieAccount.xp || 0,
          coins: mainOllieAccount.coins || 1000,
          isAdmin: true,
          skins: mainOllieAccount.skins || [],
          lastLogin: new Date().toISOString()
        };

        localStorage.setItem(key, JSON.stringify(users));
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte Ollie dans localStorage (${key}):`, error);
    }
  }

  console.log("Fusion des comptes Ollie terminée");
  return mainOllieAccount;
}

// Extraire les utilisateurs depuis la collection scores
async function extractUsersFromScores() {
  console.log("Extraction des utilisateurs depuis la collection scores...");

  if (!checkFirebaseInitialized()) {
    console.error("Firebase non initialisé");
    return {};
  }

  try {
    // Récupérer tous les scores
    const scoresSnapshot = await window.db.collection(FIREBASE_COLLECTIONS.SCORES).get();
    const usernames = new Map();

    // Extraire les noms d'utilisateur uniques
    scoresSnapshot.forEach(doc => {
      const scoreData = doc.data();
      if (scoreData.username || scoreData.playerName) {
        const username = scoreData.username || scoreData.playerName;
        if (!usernames.has(username)) {
          usernames.set(username, {
            username,
            displayName: username,
            scores: [{
              gameId: scoreData.gameId || scoreData.game || 'unknown',
              score: scoreData.score || 0,
              timestamp: scoreData.timestamp || new Date().toISOString()
            }]
          });
        } else {
          const userData = usernames.get(username);
          userData.scores.push({
            gameId: scoreData.gameId || scoreData.game || 'unknown',
            score: scoreData.score || 0,
            timestamp: scoreData.timestamp || new Date().toISOString()
          });
        }
      }
    });

    console.log(`${usernames.size} utilisateurs extraits depuis les scores`);
    return Object.fromEntries(usernames);
  } catch (error) {
    console.error("Erreur lors de l'extraction des utilisateurs depuis les scores:", error);
    return {};
  }
}

// Créer des profils utilisateurs pour tous les joueurs
async function createUserProfiles(allUsers, scoreUsers) {
  console.log("Création de profils utilisateurs pour tous les joueurs...");

  if (!checkFirebaseInitialized()) {
    console.error("Firebase non initialisé");
    return;
  }

  // Fusionner les utilisateurs des scores avec les utilisateurs existants
  const usersToProcess = { ...allUsers };

  // Ajouter les utilisateurs des scores qui n'existent pas déjà
  for (const username in scoreUsers) {
    const scoreUser = scoreUsers[username];

    // Vérifier si l'utilisateur existe déjà
    const existingUser = Object.values(allUsers).find(user =>
      user.username && user.username.toLowerCase() === username.toLowerCase()
    );

    if (!existingUser) {
      // Générer un ID unique
      const userId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      usersToProcess[userId] = {
        id: userId,
        userId: userId,
        username: username,
        displayName: username,
        level: 1,
        xp: 0,
        coins: 0,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        source: 'scores'
      };
    }
  }

  // Traiter chaque utilisateur
  for (const userId in usersToProcess) {
    const user = usersToProcess[userId];

    // Ignorer les utilisateurs sans nom d'utilisateur
    if (!user.username) continue;

    try {
      // Vérifier si l'utilisateur existe déjà dans Firebase
      const userDoc = await window.db.collection(FIREBASE_COLLECTIONS.USERS).doc(userId).get();

      if (!userDoc.exists) {
        // Créer un nouveau profil utilisateur
        const newUser = {
          username: user.username,
          displayName: user.displayName || user.username,
          level: user.level || 1,
          xp: user.xp || 0,
          coins: user.coins || 100,
          isAdmin: user.username.toLowerCase() === 'ollie', // Seul Ollie est admin
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Ajouter le profil à Firebase
        await window.db.collection(FIREBASE_COLLECTIONS.USERS).doc(userId).set(newUser);
        console.log(`Profil utilisateur créé pour ${newUser.username} (ID: ${userId})`);
      } else {
        // Mettre à jour le profil existant
        const userData = userDoc.data();

        // S'assurer que seul Ollie a des droits d'administrateur
        const isOllie = userData.username && userData.username.toLowerCase() === 'ollie';

        await window.db.collection(FIREBASE_COLLECTIONS.USERS).doc(userId).update({
          isAdmin: isOllie,
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Profil utilisateur mis à jour pour ${userData.username} (ID: ${userId})`);
      }
    } catch (error) {
      console.error(`Erreur lors de la création/mise à jour du profil utilisateur pour ${user.username || 'Sans nom'} (ID: ${userId}):`, error);
    }
  }

  console.log("Création de profils utilisateurs terminée");
}

// Corriger les liens entre les scores et les utilisateurs
async function fixScoreUserLinks() {
  console.log("Correction des liens entre les scores et les utilisateurs...");

  if (!checkFirebaseInitialized()) {
    console.error("Firebase non initialisé");
    return;
  }

  try {
    // Récupérer tous les utilisateurs
    const usersSnapshot = await window.db.collection(FIREBASE_COLLECTIONS.USERS).get();
    const users = {};

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.username) {
        users[userData.username.toLowerCase()] = {
          id: doc.id,
          ...userData
        };
      }
    });

    // Récupérer tous les scores
    const scoresSnapshot = await window.db.collection(FIREBASE_COLLECTIONS.SCORES).get();
    const batch = window.db.batch();
    let updateCount = 0;

    scoresSnapshot.forEach(doc => {
      const scoreData = doc.data();
      const username = (scoreData.username || scoreData.playerName || '').toLowerCase();

      if (username && users[username]) {
        // Mettre à jour le score avec l'ID utilisateur
        batch.update(doc.ref, {
          userId: users[username].id,
          username: users[username].username // Utiliser le nom d'utilisateur avec la casse correcte
        });
        updateCount++;

        // Limiter la taille du lot
        if (updateCount >= 500) {
          // Exécuter le lot actuel
          batch.commit().then(() => {
            console.log(`${updateCount} scores mis à jour`);
          });

          // Créer un nouveau lot
          batch = window.db.batch();
          updateCount = 0;
        }
      }
    });

    // Exécuter le dernier lot s'il reste des mises à jour
    if (updateCount > 0) {
      await batch.commit();
      console.log(`${updateCount} scores mis à jour`);
    }

    console.log("Correction des liens entre les scores et les utilisateurs terminée");
  } catch (error) {
    console.error("Erreur lors de la correction des liens entre les scores et les utilisateurs:", error);
  }
}

// Standardiser les collections de scores
async function standardizeScoreCollections() {
  console.log("Standardisation des collections de scores...");

  if (!checkFirebaseInitialized()) {
    console.error("Firebase non initialisé");
    return;
  }

  // Liste des collections de scores à migrer
  const scoreCollections = [
    'speed_verb_scores',
    'word_memory_game_scores',
    'matrix_scores',
    'lost_in_migration_scores',
    'brewYourWordsScores',
    'whisper_trials_scores',
    'word_bubbles_scores',
    'echoes_lexicon_scores',
    'enigma_scroll_scores'
  ];

  try {
    // Migrer chaque collection vers la collection standard
    for (const collection of scoreCollections) {
      console.log(`Migration de la collection ${collection}...`);

      // Récupérer tous les scores de la collection
      const scoresSnapshot = await window.db.collection(collection).get();

      if (scoresSnapshot.empty) {
        console.log(`Collection ${collection} vide, aucune migration nécessaire`);
        continue;
      }

      console.log(`${scoresSnapshot.size} scores trouvés dans la collection ${collection}`);

      // Créer un lot pour les opérations en masse
      let batch = window.db.batch();
      let batchCount = 0;
      let totalMigrated = 0;

      // Traiter chaque score
      for (const doc of scoresSnapshot.docs) {
        const scoreData = doc.data();

        // Déterminer l'ID du jeu à partir du nom de la collection
        let gameId = collection.replace('_scores', '');

        // Cas spéciaux
        if (collection === 'brewYourWordsScores') gameId = 'brew_your_words';

        // Créer un nouveau document dans la collection standard
        const newScoreRef = window.db.collection(FIREBASE_COLLECTIONS.SCORES).doc();

        // Préparer les données du score
        const newScoreData = {
          ...scoreData,
          gameId: gameId,
          game: gameId,
          migratedFrom: collection,
          originalDocId: doc.id,
          migrationTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Ajouter au lot
        batch.set(newScoreRef, newScoreData);
        batchCount++;
        totalMigrated++;

        // Exécuter le lot tous les 500 documents
        if (batchCount >= 500) {
          await batch.commit();
          console.log(`${batchCount} scores migrés`);

          // Réinitialiser le lot
          batch = window.db.batch();
          batchCount = 0;
        }
      }

      // Exécuter le dernier lot s'il reste des documents
      if (batchCount > 0) {
        await batch.commit();
        console.log(`${batchCount} scores migrés`);
      }

      console.log(`Migration de la collection ${collection} terminée, ${totalMigrated} scores migrés`);
    }

    console.log("Standardisation des collections de scores terminée");
  } catch (error) {
    console.error("Erreur lors de la standardisation des collections de scores:", error);
  }
}

// Fonction principale pour exécuter toutes les corrections
async function fixAllFirebaseIssues() {
  console.log("Début de la correction des problèmes Firebase...");

  // Étape 1: Initialiser Firebase
  if (!initializeFirebase()) {
    console.error("Impossible d'initialiser Firebase, arrêt du script");
    return;
  }

  // Étape 2: Récupérer tous les utilisateurs
  const firebaseUsers = await getAllFirebaseUsers();
  const localUsers = getAllLocalUsers();

  // Fusionner les utilisateurs
  const allUsers = { ...localUsers, ...firebaseUsers };

  // Étape 3: Identifier et fusionner les comptes Ollie
  const ollieAccounts = identifyOllieAccounts(allUsers);
  const mainOllieAccount = await mergeOllieAccounts(ollieAccounts);

  // Étape 4: Extraire les utilisateurs depuis les scores
  const scoreUsers = await extractUsersFromScores();

  // Étape 5: Créer des profils utilisateurs pour tous les joueurs
  await createUserProfiles(allUsers, scoreUsers);

  // Étape 6: Corriger les liens entre les scores et les utilisateurs
  await fixScoreUserLinks();

  // Étape 7: Standardiser les collections de scores
  await standardizeScoreCollections();

  console.log("Correction des problèmes Firebase terminée avec succès");

  // Retourner un résumé des opérations
  return {
    usersProcessed: Object.keys(allUsers).length,
    ollieAccountsMerged: ollieAccounts.length,
    scoreUsersExtracted: Object.keys(scoreUsers).length,
    mainOllieAccount: mainOllieAccount ? mainOllieAccount.id : null
  };
}

// Exécuter le script si on est dans un navigateur
if (typeof window !== 'undefined') {
  // Ajouter un bouton pour exécuter le script
  const button = document.createElement('button');
  button.textContent = 'Corriger les problèmes Firebase';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '10px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';

  button.onclick = async () => {
    button.disabled = true;
    button.textContent = 'Correction en cours...';

    try {
      const result = await fixAllFirebaseIssues();
      console.log("Résultat de la correction:", result);
      alert(`Correction terminée avec succès!\n\n${Object.keys(result).map(key => `${key}: ${result[key]}`).join('\n')}`);
    } catch (error) {
      console.error("Erreur lors de la correction:", error);
      alert(`Erreur lors de la correction: ${error.message}`);
    } finally {
      button.disabled = false;
      button.textContent = 'Corriger les problèmes Firebase';
    }
  };

  document.body.appendChild(button);
}
