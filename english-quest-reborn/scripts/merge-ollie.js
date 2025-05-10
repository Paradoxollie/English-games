/**
 * Script pour fusionner les comptes Ollie
 * Ce script identifie tous les comptes Ollie et les fusionne en un seul
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

// Fonction pour trouver tous les comptes Ollie
async function findOllieAccounts() {
  console.log("Recherche de tous les comptes Ollie...");
  
  const ollieAccounts = [];
  
  // Vérifier Firebase
  if (checkFirebaseInitialized()) {
    try {
      // Rechercher dans la collection users
      const usersSnapshot = await window.db.collection('users').get();
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.username && userData.username.toLowerCase() === 'ollie') {
          ollieAccounts.push({
            id: doc.id,
            source: 'users',
            data: userData
          });
          console.log(`Compte Ollie trouvé dans Firebase (users): ${doc.id}`);
        }
      });
      
      // Rechercher dans la collection profiles
      const profilesSnapshot = await window.db.collection('profiles').get();
      profilesSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.username && userData.username.toLowerCase() === 'ollie') {
          ollieAccounts.push({
            id: doc.id,
            source: 'profiles',
            data: userData
          });
          console.log(`Compte Ollie trouvé dans Firebase (profiles): ${doc.id}`);
        }
      });
    } catch (error) {
      console.error("Erreur lors de la recherche dans Firebase:", error);
    }
  }
  
  // Vérifier localStorage
  try {
    // Vérifier english_quest_users
    const englishQuestUsers = JSON.parse(localStorage.getItem('english_quest_users') || '{}');
    Object.entries(englishQuestUsers).forEach(([id, userData]) => {
      if (userData.username && userData.username.toLowerCase() === 'ollie') {
        ollieAccounts.push({
          id,
          source: 'english_quest_users',
          data: userData
        });
        console.log(`Compte Ollie trouvé dans localStorage (english_quest_users): ${id}`);
      }
    });
    
    // Vérifier users
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    Object.entries(users).forEach(([id, userData]) => {
      if (userData.username && userData.username.toLowerCase() === 'ollie') {
        ollieAccounts.push({
          id,
          source: 'users_local',
          data: userData
        });
        console.log(`Compte Ollie trouvé dans localStorage (users): ${id}`);
      }
    });
    
    // Vérifier english_quest_current_user
    const currentUser = JSON.parse(localStorage.getItem('english_quest_current_user') || '{}');
    if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
      ollieAccounts.push({
        id: currentUser.id || 'current_user',
        source: 'english_quest_current_user',
        data: currentUser
      });
      console.log(`Compte Ollie trouvé dans localStorage (english_quest_current_user): ${currentUser.id || 'current_user'}`);
    }
  } catch (error) {
    console.error("Erreur lors de la recherche dans localStorage:", error);
  }
  
  console.log(`Total: ${ollieAccounts.length} comptes Ollie trouvés`);
  return ollieAccounts;
}

// Fonction pour fusionner les comptes Ollie
async function mergeOllieAccounts() {
  console.log("Fusion des comptes Ollie...");
  
  // Trouver tous les comptes Ollie
  const ollieAccounts = await findOllieAccounts();
  
  if (ollieAccounts.length <= 1) {
    console.log("Pas besoin de fusionner les comptes Ollie");
    return;
  }
  
  // Choisir le compte principal (préférer celui de Firebase)
  const mainAccount = ollieAccounts.find(account => account.source === 'users') || 
                     ollieAccounts.find(account => account.source === 'profiles') || 
                     ollieAccounts[0];
  
  console.log(`Compte principal choisi: ${mainAccount.id} (${mainAccount.source})`);
  
  // Fusionner les données
  const mergedData = { ...mainAccount.data };
  mergedData.isAdmin = true; // S'assurer que le compte est admin
  
  // Fusionner les données des autres comptes
  for (const account of ollieAccounts) {
    if (account.id === mainAccount.id && account.source === mainAccount.source) continue;
    
    console.log(`Fusion des données de ${account.id} (${account.source})`);
    
    // Fusionner les propriétés de base
    mergedData.level = Math.max(mergedData.level || 1, account.data.level || 1);
    mergedData.xp = Math.max(mergedData.xp || 0, account.data.xp || 0);
    mergedData.coins = Math.max(mergedData.coins || 0, account.data.coins || 0);
    
    // Fusionner les skins si disponibles
    if (account.data.skins && mergedData.skins) {
      for (const skinType in account.data.skins) {
        if (!mergedData.skins[skinType]) {
          mergedData.skins[skinType] = [];
        }
        
        if (Array.isArray(account.data.skins[skinType])) {
          for (const skin of account.data.skins[skinType]) {
            if (!mergedData.skins[skinType].includes(skin)) {
              mergedData.skins[skinType].push(skin);
            }
          }
        }
      }
    }
    
    // Fusionner les achievements si disponibles
    if (Array.isArray(account.data.achievements) && Array.isArray(mergedData.achievements)) {
      for (const achievement of account.data.achievements) {
        const existingAchievement = mergedData.achievements.find(a => a.id === achievement.id);
        if (!existingAchievement) {
          mergedData.achievements.push(achievement);
        }
      }
    }
  }
  
  // Mettre à jour le compte principal dans Firebase
  if (mainAccount.source === 'users' || mainAccount.source === 'profiles') {
    try {
      await window.db.collection(mainAccount.source).doc(mainAccount.id).update({
        ...mergedData,
        isAdmin: true,
        lastUpdated: new Date()
      });
      console.log(`Compte principal mis à jour dans Firebase: ${mainAccount.id} (${mainAccount.source})`);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte principal dans Firebase:`, error);
    }
  }
  
  // Mettre à jour localStorage
  try {
    // Mettre à jour english_quest_users
    const englishQuestUsers = JSON.parse(localStorage.getItem('english_quest_users') || '{}');
    englishQuestUsers[mainAccount.id] = { ...mergedData, id: mainAccount.id, isAdmin: true };
    localStorage.setItem('english_quest_users', JSON.stringify(englishQuestUsers));
    
    // Mettre à jour users
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[mainAccount.id] = { ...mergedData, id: mainAccount.id, isAdmin: true };
    localStorage.setItem('users', JSON.stringify(users));
    
    // Mettre à jour english_quest_current_user
    localStorage.setItem('english_quest_current_user', JSON.stringify({ ...mergedData, id: mainAccount.id, isAdmin: true }));
    
    console.log("Compte principal mis à jour dans localStorage");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compte principal dans localStorage:", error);
  }
  
  // Supprimer les autres comptes
  for (const account of ollieAccounts) {
    if (account.id === mainAccount.id && account.source === mainAccount.source) continue;
    
    console.log(`Suppression du compte ${account.id} (${account.source})`);
    
    // Supprimer de Firebase
    if (account.source === 'users' || account.source === 'profiles') {
      try {
        await window.db.collection(account.source).doc(account.id).delete();
        console.log(`Compte supprimé de Firebase: ${account.id} (${account.source})`);
      } catch (error) {
        console.error(`Erreur lors de la suppression du compte de Firebase:`, error);
      }
    }
    
    // Supprimer de localStorage
    if (account.source === 'english_quest_users' || account.source === 'users_local') {
      try {
        const storageKey = account.source === 'english_quest_users' ? 'english_quest_users' : 'users';
        const storage = JSON.parse(localStorage.getItem(storageKey) || '{}');
        delete storage[account.id];
        localStorage.setItem(storageKey, JSON.stringify(storage));
        console.log(`Compte supprimé de localStorage: ${account.id} (${account.source})`);
      } catch (error) {
        console.error(`Erreur lors de la suppression du compte de localStorage:`, error);
      }
    }
  }
  
  console.log("Fusion des comptes Ollie terminée");
  return mainAccount.id;
}

// Exécuter la fusion
mergeOllieAccounts().then(mainAccountId => {
  console.log(`Fusion terminée. Compte principal: ${mainAccountId}`);
  alert("Les comptes Ollie ont été fusionnés avec succès. Veuillez recharger la page.");
}).catch(error => {
  console.error("Erreur lors de la fusion des comptes Ollie:", error);
  alert("Une erreur s'est produite lors de la fusion des comptes Ollie. Veuillez consulter la console pour plus de détails.");
});
