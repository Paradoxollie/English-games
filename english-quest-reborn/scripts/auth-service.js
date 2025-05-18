import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxQYxQYxQYxQYxQYxQYxQYxQYxQYxQYxQ",
  authDomain: "english-quest-reborn.firebaseapp.com",
  projectId: "english-quest-reborn",
  storageBucket: "english-quest-reborn.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

class AuthService {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.storage = storage;
    this.currentUser = null;
    this.userData = null;
  }

  // Initialisation du service
  async init() {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          this.currentUser = user;
          await this.loadUserData();
        } else {
          this.currentUser = null;
          this.userData = null;
        }
        resolve();
      });
    });
  }

  // Chargement des données utilisateur
  async loadUserData() {
    if (!this.currentUser) return null;
    
    try {
      const userDoc = await getDoc(doc(this.db, 'users', this.currentUser.uid));
      if (userDoc.exists()) {
        this.userData = userDoc.data();
        return this.userData;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      return null;
    }
  }

  // Connexion
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.currentUser = userCredential.user;
      await this.loadUserData();
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Inscription
  async register(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      this.currentUser = userCredential.user;

      // Création du profil utilisateur
      await updateProfile(this.currentUser, { displayName: username });
      
      // Création du document utilisateur dans Firestore
      await setDoc(doc(this.db, 'users', this.currentUser.uid), {
        username,
        email,
        createdAt: new Date().toISOString(),
        level: 1,
        xp: 0,
        coins: 0,
        avatar: null,
        inventory: [],
        achievements: [],
        settings: {
          theme: 'dark',
          notifications: true,
          sound: true
        }
      });

      await this.loadUserData();
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Déconnexion
  async logout() {
    try {
      await signOut(this.auth);
      this.currentUser = null;
      this.userData = null;
      return { success: true };
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Mise à jour du profil
  async updateProfile(data) {
    if (!this.currentUser) return { success: false, error: 'Non authentifié' };

    try {
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      await updateDoc(userRef, data);
      await this.loadUserData();
      return { success: true, userData: this.userData };
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Upload d'avatar
  async uploadAvatar(file) {
    if (!this.currentUser) return { success: false, error: 'Non authentifié' };

    try {
      const storageRef = ref(this.storage, `avatars/${this.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await this.updateProfile({ avatar: downloadURL });
      return { success: true, avatarUrl: downloadURL };
    } catch (error) {
      console.error('Erreur d\'upload d\'avatar:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error) {
      console.error('Erreur de réinitialisation du mot de passe:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Gestion des erreurs
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Aucun compte ne correspond à cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/weak-password': 'Le mot de passe est trop faible',
      'auth/invalid-email': 'Email invalide',
      'auth/operation-not-allowed': 'Opération non autorisée',
      'auth/too-many-requests': 'Trop de tentatives, veuillez réessayer plus tard'
    };
    return errorMessages[errorCode] || 'Une erreur est survenue';
  }
}

// Export d'une instance unique
export const authService = new AuthService(); 