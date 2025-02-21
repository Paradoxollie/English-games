// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.firebasestorage.app",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP",
    databaseURL: "https://english-games-41017-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.database();

export function initFirebase() {
    return {
        app: firebase.app(),
        database: firebase.database(),
        analytics: firebase.analytics()
    };
}