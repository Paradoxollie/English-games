/**
 * @file firebase-config.js
 * @description Configuration centralisée de Firebase
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js';

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBXBZb_JnN_MxRub9QgH9FsZyUz_ZLFSxs",
    authDomain: "english-quest.firebaseapp.com",
    projectId: "english-quest",
    storageBucket: "english-quest.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    measurementId: "G-RMCQTMKDVP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Rendre disponible globalement
window.db = db;
window.analytics = analytics;

// Configuration de Firestore
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    merge: true
});

db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
            console.warn('The current browser does not support persistence.');
        }
    });

export { app, auth, db, analytics, firebaseConfig };

// Documentation des exports
/**
 * @exports db - Instance Firestore
 * @exports analytics - Instance Analytics
 */

// Créer des règles Firestore
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les scores
    match /speed_verb_scores/{document} {
      allow read;  // Tout le monde peut lire
      allow write: if request.resource.data.score is number 
                   && request.resource.data.name is string;
    }
    // Règles pour les visites
    match /visits/{document} {
      allow read;
      allow write: if request.resource.data.lastUpdated is timestamp;
    }
  }
}
`; 