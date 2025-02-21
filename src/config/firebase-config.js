/**
 * @file firebase-config.js
 * @description Configuration centralisée de Firebase
 */

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.appspot.com",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

// Export pour utilisation dans d'autres fichiers
window.db = db;
window.analytics = analytics;

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