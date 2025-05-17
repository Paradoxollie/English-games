/**
 * Script de migration des données pour English Quest Reborn
 * Exécute toutes les migrations et corrections nécessaires
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    databaseURL: "https://english-games-41017-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.appspot.com",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP"
};

// Initialize Firebase
console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('Firebase initialized successfully');

async function migrateData() {
    try {
        console.log('Starting data migration...');

        // 1. Migrate users
        console.log('Fetching users...');
        const usersCollection = collection(db, 'users');
        const oldUsersSnapshot = await getDocs(usersCollection);
        console.log(`Found ${oldUsersSnapshot.size} users to migrate`);

        for (const doc of oldUsersSnapshot.docs) {
            const userData = doc.data();
            console.log(`Migrating user ${doc.id}:`, userData);
            
            // Convertir les anciennes données utilisateur au nouveau format
            const newUserData = {
                username: userData.username || userData.displayName || userData.email?.split('@')[0] || 'user_' + doc.id,
                isAdmin: userData.isAdmin || false,
                createdAt: userData.createdAt || new Date().toISOString(),
                lastLogin: userData.lastLogin || new Date().toISOString(),
                migratedAt: new Date().toISOString()
            };
            
            console.log(`New user data for ${doc.id}:`, newUserData);
            await setDoc(doc.ref, newUserData);
            console.log(`Successfully migrated user ${doc.id}`);
        }

        // 2. Migrate scores
        console.log('Fetching scores...');
        const scoresCollection = collection(db, 'scores');
        const oldScoresSnapshot = await getDocs(scoresCollection);
        console.log(`Found ${oldScoresSnapshot.size} scores to migrate`);

        for (const doc of oldScoresSnapshot.docs) {
            const scoreData = doc.data();
            console.log(`Migrating score ${doc.id}:`, scoreData);
            
            const newScoreData = {
                ...scoreData,
                migratedAt: new Date().toISOString()
            };
            
            console.log(`New score data for ${doc.id}:`, newScoreData);
            await setDoc(doc.ref, newScoreData);
            console.log(`Successfully migrated score ${doc.id}`);
        }

        // 3. Migrate game data
        console.log('Fetching game data...');
        const gamesCollection = collection(db, 'games');
        const oldGamesSnapshot = await getDocs(gamesCollection);
        console.log(`Found ${oldGamesSnapshot.size} games to migrate`);

        for (const doc of oldGamesSnapshot.docs) {
            const gameData = doc.data();
            console.log(`Migrating game ${doc.id}:`, gameData);
            
            const newGameData = {
                ...gameData,
                migratedAt: new Date().toISOString()
            };
            
            console.log(`New game data for ${doc.id}:`, newGameData);
            await setDoc(doc.ref, newGameData);
            console.log(`Successfully migrated game ${doc.id}`);
        }

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Error during data migration:', error);
        throw error;
    }
}

// Run migration
console.log('Starting migration process...');
migrateData()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });

export default migrateData; 