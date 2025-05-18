/**
 * Utilitaire de migration des données pour English Quest Reborn
 * Permet de migrer les données des anciennes collections vers les nouvelles
 */

import { db } from '../../config/firebase-config.js';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, query, where, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { createNewUser } from '../models/user.model.js';

// Collections
const OLD_USERS_COLLECTION = 'profiles';
const NEW_USERS_COLLECTION = 'users';
const OLD_SCORES_COLLECTIONS = [
  'speed_verb_challenge_scores',
  'enigma_scroll_scores',
  'word_memory_game_scores',
  'memory_matrix_scores',
  'lost_in_migration_scores',
  'brewYourWordsScores',
  'whisper_trials_scores',
  'word_bubbles_scores',
  'echoes_lexicon_scores'
];
const NEW_SCORES_COLLECTION = 'game_scores';

/**
 * Migre les utilisateurs des anciennes collections vers la nouvelle
 * @returns {Promise<Object>} Résultat de la migration
 */
export async function migrateUsers() {
  try {
    const db = getFirestore();
    let migratedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Récupérer tous les utilisateurs de l'ancienne collection
    const usersSnapshot = await getDocs(collection(db, OLD_USERS_COLLECTION));

    // Récupérer tous les utilisateurs de la nouvelle collection
    const existingUsersSnapshot = await getDocs(collection(db, NEW_USERS_COLLECTION));
    const existingUserIds = new Set();
    const existingUsernames = new Set();

    existingUsersSnapshot.forEach(doc => {
      existingUserIds.add(doc.id);
      const userData = doc.data();
      if (userData.username) {
        existingUsernames.add(userData.username.toLowerCase());
      }
    });

    // Migrer chaque utilisateur
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Vérifier si l'utilisateur existe déjà
        if (existingUserIds.has(userId)) {
          console.log(`L'utilisateur ${userId} existe déjà, mise à jour`);

          // Récupérer l'utilisateur existant
          const existingUserDoc = await getDoc(doc(db, NEW_USERS_COLLECTION, userId));
          const existingUserData = existingUserDoc.data();

          // Fusionner les données
          const mergedData = {
            ...existingUserData,
            username: existingUserData.username || userData.name || `user_${userId.substring(0, 6)}`,
            displayName: existingUserData.displayName || userData.name || existingUserData.username || `user_${userId.substring(0, 6)}`,
            level: existingUserData.level || userData.level || 1,
            xp: existingUserData.xp || userData.xp || 0,
            coins: existingUserData.coins || userData.coins || 100,
            stats: { ...(userData.stats || {}), ...(existingUserData.stats || {}) },
            settings: { ...(userData.settings || {}), ...(existingUserData.settings || {}) },
            inventory: {
              ...(userData.inventory || {}),
              ...(existingUserData.inventory || {}),
              skins: {
                ...(userData.inventory?.skins || {}),
                ...(existingUserData.inventory?.skins || {})
              }
            },
            lastLogin: new Date().toISOString()
          };

          // S'assurer que seul Ollie est administrateur
          if (mergedData.username.toLowerCase() === 'ollie') {
            mergedData.isAdmin = true;
          }

          // Mettre à jour l'utilisateur
          await updateDoc(doc(db, NEW_USERS_COLLECTION, userId), mergedData);
          migratedCount++;
          continue;
        }

        // Vérifier si le nom d'utilisateur existe déjà
        const username = userData.name || `user_${userId.substring(0, 6)}`;
        if (existingUsernames.has(username.toLowerCase())) {
          console.log(`Le nom d'utilisateur ${username} existe déjà, ajout d'un suffixe`);
          userData.name = `${username}_${Math.floor(Math.random() * 1000)}`;
        }

        // Créer le nouvel utilisateur
        const newUser = createNewUser(userId, userData.name || `user_${userId.substring(0, 6)}`);

        // Copier les données existantes
        if (userData.xp) newUser.xp = userData.xp;
        if (userData.level) newUser.level = userData.level;
        if (userData.coins) newUser.coins = userData.coins;
        if (userData.isAdmin) newUser.isAdmin = userData.isAdmin === true;

        // Assurer que seul Ollie est administrateur
        if (newUser.username.toLowerCase() !== 'ollie') {
          newUser.isAdmin = false;
        } else {
          newUser.isAdmin = true;
        }

        // Copier les skins si disponibles
        if (userData.inventory && userData.inventory.skins) {
          newUser.inventory.skins = {
            ...newUser.inventory.skins,
            ...userData.inventory.skins
          };
        }

        // Enregistrer dans la nouvelle collection
        await setDoc(doc(db, NEW_USERS_COLLECTION, userId), newUser);
        migratedCount++;

        // Ajouter le nom d'utilisateur à la liste des existants
        existingUsernames.add(newUser.username.toLowerCase());
      } catch (error) {
        console.error(`Erreur lors de la migration de l'utilisateur ${userDoc.id}:`, error);
        errorCount++;
        errors.push({
          userId: userDoc.id,
          error: error.message
        });
      }
    }

    return {
      migratedCount,
      errorCount,
      errors
    };
  } catch (error) {
    console.error('Erreur lors de la migration des utilisateurs:', error);
    return {
      migratedCount: 0,
      errorCount: 1,
      errors: [error.message]
    };
  }
}

/**
 * Migre les scores des anciennes collections vers la nouvelle
 * @returns {Promise<Object>} Résultat de la migration
 */
export async function migrateScores() {
  try {
    const db = getFirestore();
    let totalMigrated = 0;
    let totalErrors = 0;
    const results = {};

    // Récupérer tous les utilisateurs de la nouvelle collection
    const usersSnapshot = await getDocs(collection(db, NEW_USERS_COLLECTION));
    const userMap = new Map();

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      userMap.set(doc.id, userData);
    });

    for (const collectionName of OLD_SCORES_COLLECTIONS) {
      try {
        // Extraire l'ID du jeu du nom de la collection
        const gameId = collectionName.replace('_scores', '');

        // Récupérer tous les scores de l'ancienne collection
        const scoresSnapshot = await getDocs(collection(db, collectionName));

        let migratedCount = 0;
        let errorCount = 0;

        // Migrer chaque score
        for (const scoreDoc of scoresSnapshot.docs) {
          try {
            const scoreData = scoreDoc.data();

            // Vérifier si l'utilisateur existe
            const userId = scoreData.userId || 'unknown';
            const user = userMap.get(userId);

            // Créer le nouveau format de score
            const newScore = {
              gameId,
              userId,
              username: user ? user.username : (scoreData.name || scoreData.playerName || scoreData.username || 'Unknown Player'),
              score: scoreData.score || 0,
              timestamp: scoreData.timestamp || new Date().toISOString(),
              difficulty: scoreData.difficulty || 'normal',
              level: scoreData.level || 1,
              // Conserver les données supplémentaires
              ...Object.keys(scoreData)
                .filter(key => !['userId', 'name', 'playerName', 'username', 'score', 'timestamp', 'difficulty', 'level'].includes(key))
                .reduce((obj, key) => {
                  obj[key] = scoreData[key];
                  return obj;
                }, {})
            };

            // Vérifier si le score existe déjà
            const existingScoreQuery = query(
              collection(db, NEW_SCORES_COLLECTION),
              where('gameId', '==', gameId),
              where('userId', '==', userId),
              where('score', '==', newScore.score),
              where('timestamp', '==', newScore.timestamp)
            );

            const existingScores = await getDocs(existingScoreQuery);

            if (existingScores.empty) {
              // Ajouter à la nouvelle collection
              await addDoc(collection(db, NEW_SCORES_COLLECTION), newScore);
              migratedCount++;
            } else {
              console.log(`Score déjà migré, ignoré: ${gameId} - ${userId} - ${newScore.score}`);
            }
          } catch (error) {
            console.error(`Erreur lors de la migration du score ${scoreDoc.id}:`, error);
            errorCount++;
          }
        }

        results[collectionName] = {
          migratedCount,
          errorCount
        };

        totalMigrated += migratedCount;
        totalErrors += errorCount;
      } catch (error) {
        console.error(`Erreur lors de la migration de la collection ${collectionName}:`, error);
        results[collectionName] = {
          migratedCount: 0,
          errorCount: 1,
          error: error.message
        };
        totalErrors++;
      }
    }

    return {
      totalMigrated,
      totalErrors,
      details: results
    };
  } catch (error) {
    console.error('Erreur lors de la migration des scores:', error);
    return {
      totalMigrated: 0,
      totalErrors: 1,
      error: error.message
    };
  }
}

/**
 * Vérifie et corrige les données des utilisateurs
 * @returns {Promise<Object>} Résultat des corrections
 */
export async function checkAndFixUserData() {
  try {
    const db = getFirestore();
    let fixedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Récupérer tous les utilisateurs
    const usersSnapshot = await getDocs(collection(db, NEW_USERS_COLLECTION));

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        let needsUpdate = false;
        const updates = {};

        // Vérifier et corriger les droits admin
        if (userData.isAdmin !== undefined) {
          const shouldBeAdmin = userData.username.toLowerCase() === 'ollie';
          if (userData.isAdmin !== shouldBeAdmin) {
            updates.isAdmin = shouldBeAdmin;
            needsUpdate = true;
          }
        }

        // Vérifier et corriger les champs obligatoires
        if (!userData.username) {
          updates.username = `user_${userDoc.id.substring(0, 6)}`;
          needsUpdate = true;
        }

        if (!userData.displayName) {
          updates.displayName = userData.username || `user_${userDoc.id.substring(0, 6)}`;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await updateDoc(doc(db, NEW_USERS_COLLECTION, userDoc.id), updates);
          fixedCount++;
        }
      } catch (error) {
        console.error(`Erreur lors de la correction de l'utilisateur ${userDoc.id}:`, error);
        errorCount++;
        errors.push({
          userId: userDoc.id,
          error: error.message
        });
      }
    }

    return {
      fixedCount,
      errorCount,
      errors
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des données utilisateurs:', error);
    return {
      fixedCount: 0,
      errorCount: 1,
      errors: [error.message]
    };
  }
}

/**
 * Exécute toutes les migrations et corrections
 * @returns {Promise<Object>} Résultat complet des migrations
 */
export async function runAllMigrations() {
  console.log('Démarrage des migrations...');
  
  // 1. Migrer les utilisateurs
  console.log('Migration des utilisateurs...');
  const usersResult = await migrateUsers();
  console.log('Migration des utilisateurs terminée:', usersResult);
  
  // 2. Migrer les scores
  console.log('Migration des scores...');
  const scoresResult = await migrateScores();
  console.log('Migration des scores terminée:', scoresResult);
  
  // 3. Vérifier et corriger les données
  console.log('Vérification et correction des données...');
  const fixResult = await checkAndFixUserData();
  console.log('Vérification et correction terminée:', fixResult);
  
  return {
    users: usersResult,
    scores: scoresResult,
    fixes: fixResult
  };
}

export default {
  migrateUsers,
  migrateScores,
  checkAndFixUserData,
  runAllMigrations
};
