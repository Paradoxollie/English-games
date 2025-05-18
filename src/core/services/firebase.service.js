/**
 * Service Firebase pour English Quest Reborn
 * Gère l'initialisation et les interactions avec Firebase
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
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
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';
import { firebaseConfig } from '../../config/app.config.js';

console.log('Initializing Firebase with config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log('Firebase initialized successfully');

class FirebaseService {
    constructor() {
        this.auth = auth;
        this.db = db;
        this.analytics = analytics;
        console.log('FirebaseService instance created');
    }

    // Authentication methods
    async register(username, password) {
        try {
            console.log('Registering user:', username);
            // Créer l'utilisateur avec email (username@english-quest.com)
            const email = `${username}@english-quest.com`;
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created:', userCredential.user.uid);
            
            // Créer le document utilisateur dans Firestore
            const userData = {
                username,
                isAdmin: false,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            console.log('Creating user document with data:', userData);
            await setDoc(doc(db, 'users', userCredential.user.uid), userData);
            console.log('User document created successfully');

            return userCredential.user;
        } catch (error) {
            console.error('Error in register:', error);
            throw error;
        }
    }

    async login(username, password) {
        try {
            console.log('Logging in user:', username);
            // Vérifier d'abord si l'utilisateur existe dans Firestore
            const usersQuery = query(collection(db, 'users'), where('username', '==', username));
            const usersSnapshot = await getDocs(usersQuery);
            
            if (usersSnapshot.empty) {
                throw new Error('Utilisateur non trouvé');
            }

            // Récupérer l'ID de l'utilisateur
            const userDoc = usersSnapshot.docs[0];
            const userId = userDoc.id;

            // Essayer de se connecter avec l'email généré
            const email = `${username}@english-quest.com`;
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in:', userCredential.user.uid);
            
            // Mettre à jour la dernière connexion
            await updateDoc(doc(db, 'users', userId), {
                lastLogin: new Date().toISOString()
            });
            console.log('Last login updated');

            return userCredential.user;
        } catch (error) {
            console.error('Error in login:', error);
            if (error.message === 'Utilisateur non trouvé') {
                throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
            }
            throw new Error('Erreur de connexion. Veuillez réessayer.');
        }
    }

    async logout() {
        try {
            console.log('Logging out user');
            await signOut(auth);
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error in logout:', error);
            throw error;
        }
    }

    onAuthStateChange(callback) {
        console.log('Setting up auth state change listener');
        return onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed:', user ? user.uid : 'no user');
            callback(user);
        });
    }

    // User management methods
    async getUserData(userId) {
        try {
            console.log('Getting user data for:', userId);
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.exists() ? userDoc.data() : null;
            console.log('User data retrieved:', userData);
            return userData;
        } catch (error) {
            console.error('Error in getUserData:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            console.log('Getting all users');
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Retrieved users:', users);
            return users;
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw error;
        }
    }

    // Score management methods
    async getUserScores(userId) {
        try {
            console.log('Getting scores for user:', userId);
            const scoresQuery = query(
                collection(db, 'scores'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc')
            );
            const scoresSnapshot = await getDocs(scoresQuery);
            const scores = scoresSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Retrieved scores:', scores);
            return scores;
        } catch (error) {
            console.error('Error in getUserScores:', error);
            throw error;
        }
    }

    async getAllScores(limit = 100) {
        try {
            console.log('Getting all scores');
            const scoresQuery = query(
                collection(db, 'scores'),
                orderBy('timestamp', 'desc'),
                limit(limit)
            );
            const scoresSnapshot = await getDocs(scoresQuery);
            const scores = scoresSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Retrieved scores:', scores);
            return scores;
        } catch (error) {
            console.error('Error in getAllScores:', error);
            throw error;
        }
    }

    async addScore(userId, gameId, score, metadata = {}) {
        try {
            console.log('Adding score:', { userId, gameId, score, metadata });
            const scoreData = {
                userId,
                gameId,
                score,
                timestamp: new Date().toISOString(),
                ...metadata
            };
            await setDoc(doc(collection(db, 'scores')), scoreData);
            console.log('Score added successfully');
        } catch (error) {
            console.error('Error in addScore:', error);
            throw error;
        }
    }

    // Admin methods
    async isUserAdmin(userId) {
        try {
            console.log('Checking if user is admin:', userId);
            const userDoc = await getDoc(doc(db, 'users', userId));
            const isAdmin = userDoc.exists() && userDoc.data().isAdmin === true;
            console.log('Is user admin:', isAdmin);
            return isAdmin;
        } catch (error) {
            console.error('Error in isUserAdmin:', error);
            throw error;
        }
    }

    async setUserAdmin(userId, isAdmin) {
        try {
            console.log('Setting admin status for user:', userId, 'to:', isAdmin);
            await updateDoc(doc(db, 'users', userId), { isAdmin });
            console.log('Admin status updated successfully');
        } catch (error) {
            console.error('Error in setUserAdmin:', error);
            throw error;
        }
    }
}

// Create and export a single instance
const firebaseService = new FirebaseService();
export default firebaseService;
