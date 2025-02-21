// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDKZKqUxGqg1E3RsxVdYYEp4wxgPxVZQFk",
    authDomain: "english-quest-f7d0f.firebaseapp.com",
    databaseURL: "https://english-quest-f7d0f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "english-quest-f7d0f",
    storageBucket: "english-quest-f7d0f.appspot.com",
    messagingSenderId: "1015257134589",
    appId: "1:1015257134589:web:2d9ba1d1e6b05f0ad914a5"
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