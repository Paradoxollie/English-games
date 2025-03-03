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

// Initialiser Firestore
const db = firebase.firestore();

// Initialiser Analytics
const analytics = firebase.analytics();

// Rendre les instances disponibles globalement
window.db = db;
window.analytics = analytics;

// Vérifier que Firebase est correctement initialisé
console.log("Firebase initialized successfully:", window.db ? true : false);

// Tester la connexion à la base de données
window.db.collection('speed_verb_scores').limit(1).get()
    .then(() => console.log("Firebase DB connection test: SUCCESS"))
    .catch(error => console.error("Firebase DB connection test: FAILED", error));

// Version simplifiée de la fonction (pas d'export)
function initFirebase() {
    return {
        app: firebase.app(),
        database: firebase.database(),
        analytics: firebase.analytics()
    };
}