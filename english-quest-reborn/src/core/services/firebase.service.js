/**
 * Service Firebase pour English Quest Reborn
 * Gère l'initialisation et les interactions de bas niveau avec Firebase.
 * L'authentification de plus haut niveau et la gestion de profil sont dans auth.service.js.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword, 
    createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc,
    query,
    where,
    orderBy,
    limit
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAnalytics, logEvent as firebaseLogEvent } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';
// Assuming firebaseConfig is correctly exported from firebase-config.js
import { firebaseConfig } from '../../config/firebase-config.js'; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const authInstance = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Domain for internal email construction, can be used by auth.service.js
export const INTERNAL_EMAIL_DOMAIN = 'eqr.internal';

class FirebaseService {
    constructor() {
        this.auth = authInstance;
        this.db = db;
        this.analytics = analytics;
    }

    // Raw Firebase Auth operations, expecting fully formed email
    async _createUserWithEmailAndPassword(email, password) {
        return firebaseCreateUserWithEmailAndPassword(this.auth, email, password);
    }

    async _signInWithEmailAndPassword(email, password) {
        return firebaseSignInWithEmailAndPassword(this.auth, email, password);
    }

    async _signOut() {
        return firebaseSignOut(this.auth);
    }

    _onAuthStateChanged(callback) {
        return onAuthStateChanged(this.auth, callback);
    }
    
    // Firestore methods for PROFILES collection
    async getProfile(userId) {
        const profileDocRef = doc(this.db, 'PROFILES', userId);
        const profileDoc = await getDoc(profileDocRef);
        return profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } : null;
    }

    async getAllProfiles() {
        const profilesSnapshot = await getDocs(collection(this.db, 'PROFILES'));
        return profilesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async createProfile(userId, profileData) {
        const profileDocRef = doc(this.db, 'PROFILES', userId);
        return setDoc(profileDocRef, profileData);
    }

    async updateProfile(userId, data) {
        const profileDocRef = doc(this.db, 'PROFILES', userId);
        return updateDoc(profileDocRef, data);
    }

    // Score management methods (collection: 'scores')
    async getUserScores(userId) {
        const scoresQuery = query(
            collection(this.db, 'scores'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );
        const scoresSnapshot = await getDocs(scoresQuery);
        return scoresSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async getAllScores(max = 100) {
        const scoresQuery = query(
            collection(this.db, 'scores'),
            orderBy('timestamp', 'desc'),
            limit(max)
        );
        const scoresSnapshot = await getDocs(scoresQuery);
        return scoresSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async addScore(scoreData) { 
        const scoresCollectionRef = collection(this.db, 'scores');
        return setDoc(doc(scoresCollectionRef), scoreData); // Firestore auto-generates ID
    }

    // Admin specific methods related to profiles
    async isUserAdmin(userId) {
        const profile = await this.getProfile(userId);
        return profile ? profile.isAdmin === true : false;
    }

    async setUserAdminStatus(userId, isAdmin) {
        return this.updateProfile(userId, { isAdmin });
    }

    // Analytics
    logEvent(eventName, eventParams) {
      firebaseLogEvent(this.analytics, eventName, eventParams);
    }
}

const firebaseServiceInstance = new FirebaseService();
export default firebaseServiceInstance;

// Exported wrapper functions for Firebase Auth, to be used by auth.service.js
export const createUserWithEmailAndPasswordFirebase = async (email, password) => {
  // Pass the auth instance from this module
  return firebaseServiceInstance._createUserWithEmailAndPassword(email, password);
};

export const signInWithEmailAndPasswordFirebase = async (email, password) => {
  // Pass the auth instance from this module
  return firebaseServiceInstance._signInWithEmailAndPassword(email, password);
};

export const signOutUser = async () => {
  return firebaseServiceInstance._signOut();
};

export const subscribeToAuthChanges = (callback) => {
  return firebaseServiceInstance._onAuthStateChanged(callback);
};

// Export getAuth and getFirestore for direct access if absolutely needed elsewhere,
// though preferably other services would go via firebaseServiceInstance methods.
export const getFirebaseAuth = () => firebaseServiceInstance.auth;
export const getFirestoreDb = () => firebaseServiceInstance.db;
