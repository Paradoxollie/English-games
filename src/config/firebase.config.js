// Configuration Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "english-quest-reborn.firebaseapp.com",
    projectId: "english-quest-reborn",
    storageBucket: "english-quest-reborn.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    measurementId: "G-XXXXXXXXXX"
};

// Initialiser Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    if (error.code === 'app/duplicate-app') {
        app = getApp();
    } else {
        throw error;
    }
}

// Exporter les services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 