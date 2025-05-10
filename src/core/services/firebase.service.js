/**
 * Service Firebase pour English Quest Reborn
 * Gère l'initialisation et les interactions avec Firebase
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { firebaseConfig, collections } from '@core/config/firebase.config';
import { getConfig } from '@core/config/app.config';

// Variables pour stocker les instances Firebase
let firebaseApp;
let firebaseAuth;
let firebaseFirestore;
let firebaseAnalytics;

/**
 * Initialise Firebase et ses services
 * @returns {Object} Les instances Firebase initialisées
 */
export async function initializeFirebase() {
  try {
    // Initialiser l'application Firebase
    firebaseApp = initializeApp(firebaseConfig);
    
    // Initialiser Firestore
    firebaseFirestore = getFirestore(firebaseApp);
    
    // Initialiser Authentication
    firebaseAuth = getAuth(firebaseApp);
    
    // Initialiser Analytics
    if (typeof window !== 'undefined') {
      firebaseAnalytics = getAnalytics(firebaseApp);
      
      // Enregistrer la visite
      logEvent(firebaseAnalytics, 'app_open', {
        app_version: getConfig().version
      });
    }
    
    console.log('Firebase initialized successfully');
    
    return {
      app: firebaseApp,
      auth: firebaseAuth,
      firestore: firebaseFirestore,
      analytics: firebaseAnalytics
    };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

/**
 * Récupère l'instance Firestore
 * @returns {Object} L'instance Firestore
 */
export function getFirestore() {
  if (!firebaseFirestore) {
    throw new Error('Firestore not initialized. Call initializeFirebase first.');
  }
  return firebaseFirestore;
}

/**
 * Récupère l'instance Auth
 * @returns {Object} L'instance Auth
 */
export function getAuth() {
  if (!firebaseAuth) {
    throw new Error('Auth not initialized. Call initializeFirebase first.');
  }
  return firebaseAuth;
}

/**
 * Récupère l'instance Analytics
 * @returns {Object} L'instance Analytics
 */
export function getAnalytics() {
  if (!firebaseAnalytics) {
    throw new Error('Analytics not initialized. Call initializeFirebase first.');
  }
  return firebaseAnalytics;
}

/**
 * Crée ou met à jour un document dans Firestore
 * @param {string} collectionName - Nom de la collection
 * @param {string} docId - ID du document
 * @param {Object} data - Données à enregistrer
 * @param {boolean} merge - Fusionner avec les données existantes
 * @returns {Promise<Object>} Le document créé ou mis à jour
 */
export async function setDocument(collectionName, docId, data, merge = true) {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    
    // Ajouter un timestamp de mise à jour
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    // Si c'est une création, ajouter un timestamp de création
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      dataWithTimestamp.createdAt = serverTimestamp();
    }
    
    await setDoc(docRef, dataWithTimestamp, { merge });
    
    // Récupérer le document mis à jour
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Met à jour un document dans Firestore
 * @param {string} collectionName - Nom de la collection
 * @param {string} docId - ID du document
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Le document mis à jour
 */
export async function updateDocument(collectionName, docId, data) {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    
    // Ajouter un timestamp de mise à jour
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataWithTimestamp);
    
    // Récupérer le document mis à jour
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Récupère un document depuis Firestore
 * @param {string} collectionName - Nom de la collection
 * @param {string} docId - ID du document
 * @returns {Promise<Object|null>} Le document ou null s'il n'existe pas
 */
export async function getDocument(collectionName, docId) {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Récupère des documents depuis Firestore avec une requête
 * @param {string} collectionName - Nom de la collection
 * @param {Array} conditions - Conditions de la requête (field, operator, value)
 * @returns {Promise<Array>} Les documents correspondants
 */
export async function queryDocuments(collectionName, conditions = []) {
  try {
    const db = getFirestore();
    const collectionRef = collection(db, collectionName);
    
    // Construire la requête
    let queryRef = collectionRef;
    if (conditions.length > 0) {
      const queryConstraints = conditions.map(([field, operator, value]) => 
        where(field, operator, value)
      );
      queryRef = query(collectionRef, ...queryConstraints);
    }
    
    // Exécuter la requête
    const querySnapshot = await getDocs(queryRef);
    
    // Transformer les résultats
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * S'abonne aux changements d'un document
 * @param {string} collectionName - Nom de la collection
 * @param {string} docId - ID du document
 * @param {Function} callback - Fonction à appeler lors des changements
 * @returns {Function} Fonction pour se désabonner
 */
export function subscribeToDocument(collectionName, docId, callback) {
  const db = getFirestore();
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback({ id: docSnapshot.id, ...docSnapshot.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to document in ${collectionName}:`, error);
    throw error;
  });
}

/**
 * S'abonne aux changements d'une requête
 * @param {string} collectionName - Nom de la collection
 * @param {Array} conditions - Conditions de la requête (field, operator, value)
 * @param {Function} callback - Fonction à appeler lors des changements
 * @returns {Function} Fonction pour se désabonner
 */
export function subscribeToQuery(collectionName, conditions = [], callback) {
  const db = getFirestore();
  const collectionRef = collection(db, collectionName);
  
  // Construire la requête
  let queryRef = collectionRef;
  if (conditions.length > 0) {
    const queryConstraints = conditions.map(([field, operator, value]) => 
      where(field, operator, value)
    );
    queryRef = query(collectionRef, ...queryConstraints);
  }
  
  return onSnapshot(queryRef, (querySnapshot) => {
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    callback(results);
  }, (error) => {
    console.error(`Error subscribing to query in ${collectionName}:`, error);
    throw error;
  });
}

/**
 * Connecte un utilisateur anonymement
 * @returns {Promise<Object>} L'utilisateur connecté
 */
export async function signInAnonymous() {
  try {
    const auth = getAuth();
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
}

/**
 * Déconnecte l'utilisateur actuel
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  try {
    const auth = getAuth();
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * S'abonne aux changements d'état d'authentification
 * @param {Function} callback - Fonction à appeler lors des changements
 * @returns {Function} Fonction pour se désabonner
 */
export function subscribeToAuthChanges(callback) {
  const auth = getAuth();
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  }, (error) => {
    console.error('Auth state change error:', error);
    throw error;
  });
}

/**
 * Enregistre un événement dans Analytics
 * @param {string} eventName - Nom de l'événement
 * @param {Object} eventParams - Paramètres de l'événement
 */
export function logAnalyticsEvent(eventName, eventParams = {}) {
  try {
    const analytics = getAnalytics();
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error(`Error logging analytics event ${eventName}:`, error);
    // Ne pas propager l'erreur pour éviter d'interrompre le flux de l'application
  }
}

export default {
  initializeFirebase,
  getFirestore,
  getAuth,
  getAnalytics,
  setDocument,
  updateDocument,
  getDocument,
  queryDocuments,
  subscribeToDocument,
  subscribeToQuery,
  signInAnonymous,
  signOutUser,
  subscribeToAuthChanges,
  logAnalyticsEvent
};
