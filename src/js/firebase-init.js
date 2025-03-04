/**
 * Firebase initialization for Speed Verb Challenge
 */

console.log("Loading firebase-init.js");

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.appspot.com",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP"
};

// Global database reference
let db;

// CORRECTION: Créer un mock pour firebase.analytics AVANT toute utilisation
if (typeof firebase !== 'undefined') {
    if (typeof firebase.analytics !== 'function') {
        console.log("Creating mock for firebase.analytics");
        firebase.analytics = function() {
            console.log("Mock analytics called");
            return {
                logEvent: function() { console.log("Mock logEvent called"); }
            };
        };
    }
}

// Initialize Firebase if it hasn't been initialized yet
function initializeFirebase() {
    console.log("Attempting to initialize Firebase");
    
    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK is not loaded");
        return false;
    }
    
    try {
        if (!firebase.apps.length) {
            console.log("Initializing Firebase app");
            firebase.initializeApp(firebaseConfig);
            
            // CORRECTION: Vérifier à nouveau après l'initialisation
            if (typeof firebase.analytics !== 'function') {
                console.log("Creating mock for firebase.analytics after initialization");
                firebase.analytics = function() {
                    console.log("Mock analytics called (post-init)");
                    return {
                        logEvent: function() { console.log("Mock logEvent called"); }
                    };
                };
            }
            
            if (typeof firebase.firestore === 'function') {
                db = firebase.firestore();
                window.db = db; // Make db globally accessible
                console.log("Firebase initialized successfully");
                return true;
            } else {
                console.error("Firebase Firestore is not available");
                return false;
            }
        } else {
            console.log("Firebase already initialized");
            if (!db && typeof firebase.firestore === 'function') {
                db = firebase.firestore();
                window.db = db;
            }
            return true;
        }
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        return false;
    }
}

// Create a simple backup implementation if Firebase fails
function setupMockFirebase() {
    console.log("Setting up mock Firebase");
    
    // Only set up if Firebase or Firestore isn't available
    if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
        console.log("Real Firebase available, no need for mock");
        return;
    }
    
    // Create firebase object if it doesn't exist
    if (typeof firebase === 'undefined') {
        window.firebase = {};
    }
    
    // FIX: Ajouter un mock de firebase.analytics
    firebase.analytics = function() {
        console.log("Mock analytics called (from setupMockFirebase)");
        return {
            logEvent: function() { console.log("Mock logEvent called"); }
        };
    };
    
    // Minimal implementation for Firestore
    firebase.firestore = function() {
        const mockDb = {
            collection: function(name) {
                console.log(`Mock collection: ${name}`);
                return {
                    add: function(data) {
                        console.log('Mock add:', data);
                        return Promise.resolve({ id: 'mock-' + Date.now() });
                    },
                    orderBy: function(field, direction) {
                        console.log(`Mock orderBy: ${field}, ${direction}`);
                        return {
                            limit: function(limit) {
                                console.log(`Mock limit: ${limit}`);
                                return {
                                    get: function() {
                                        console.log('Mock get called');
                                        return Promise.resolve({
                                            empty: false,
                                            size: 5,
                                            forEach: function(callback) {
                                                for (let i = 0; i < 5; i++) {
                                                    callback({
                                                        id: 'mock-' + i,
                                                        data: function() {
                                                            return {
                                                                name: 'Joueur ' + (i+1),
                                                                playerName: 'Joueur ' + (i+1),
                                                                score: 1000 - i * 100,
                                                                timestamp: new Date(Date.now() - i * 86400000)
                                                            };
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
        return mockDb;
    };
    
    // Mock necessary Firebase APIs
    firebase.apps = [];
    firebase.initializeApp = function() {
        firebase.apps.push({});
        return {};
    };
    
    // Add field value for timestamps
    firebase.firestore.FieldValue = {
        serverTimestamp: function() { return new Date(); }
    };
    
    // Set global db reference
    db = firebase.firestore();
    window.db = db;
    
    console.log("Mock Firebase setup complete");
}

// Try to initialize Firebase on load
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded: Initializing Firebase");
    
    // First try to initialize real Firebase
    if (!initializeFirebase()) {
        // If real Firebase fails, set up mock implementation
        setupMockFirebase();
    }
});

// Run initialization now in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("Document already loaded, initializing Firebase now");
    if (!initializeFirebase()) {
        setupMockFirebase();
    }
}

// Export functions for other scripts
window.initializeFirebase = initializeFirebase;
window.db = db; 