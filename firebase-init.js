// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
    // Vos configurations Firebase ici
    apiKey: "votre-api-key",
    authDomain: "votre-auth-domain",
    databaseURL: "votre-database-url", // Important pour le compteur
    projectId: "votre-project-id",
    storageBucket: "votre-storage-bucket",
    messagingSenderId: "votre-messaging-sender-id",
    appId: "votre-app-id"
};

export function initFirebase() {
    return {
        app: firebase.app(),
        database: firebase.database(),
        analytics: firebase.analytics()
    };
}