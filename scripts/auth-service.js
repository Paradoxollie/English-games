import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
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
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
  authDomain: "english-games-41017.firebaseapp.com",
  databaseURL: "https://english-games-41017-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "english-games-41017",
  storageBucket: "english-games-41017.appspot.com",
  messagingSenderId: "452279652544",
  appId: "1:452279652544:web:916f93e0ab29183e739d25",
  measurementId: "G-RMCQTMKDVP"
};

// Initialisation Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully.");
} catch (e) {
  if (e.code === 'duplicate-app') {
    console.log("Firebase app already initialized. Getting existing instance.");
    // Firebase v9+ automatically handles this by returning the existing app if initialized with the same name
    // or if getApps().length > 0, you can get it via getApp()
    // For simplicity here, we rely on initializeApp's behavior for named apps (default here)
    // or we can assume the first call succeeded if we reach here in a module script context
    // and subsequent calls to getAuth(), getFirestore() will use the default app.
    // However, to be explicit if 'app' is needed by getFirestore(app) and getStorage(app):
    const existingApps = getApps(); // Make sure to import getApps
    if (existingApps.length > 0) {
      app = getApp(); // Make sure to import getApp
      console.log("Using existing Firebase app instance.");
    } else {
      // This case should ideally not happen if initializeApp threw 'duplicate-app'
      console.error("Firebase duplicate app error, but no existing app found. This is unexpected.");
      // Fallback or re-throw, depending on desired error handling
      app = initializeApp(firebaseConfig); // Try again (might still throw)
    }
  } else {
    console.error("Error initializing Firebase:", e);
    // Handle other initialization errors
    throw e; // Re-throw if it's a critical error
  }
}

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
    this.listeners = new Set();
  }

  // Récupérer l'utilisateur courant
  getCurrentUser() {
    return this.currentUser;
  }

  // Initialisation du service
  async init() {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, async (user) => {
        console.log("État d'authentification changé:", user ? `${user.email} connecté` : "Déconnecté");
        
        if (user) {
          this.currentUser = user;
          await this.loadUserData();
        } else {
          // Si pas d'utilisateur Firebase, vérifier s'il y a un utilisateur dans localStorage
          const userId = localStorage.getItem('userId');
          if (userId) {
            await this.loadUserDataFromLocalId(userId);
          } else {
            this.currentUser = null;
            this.userData = null;
          }
        }
        
        this.notifyListeners();
        resolve(this.currentUser);
      });
    });
  }

  // Charger les données utilisateur depuis Firebase
  async loadUserData() {
    if (!this.currentUser) return null;
    
    try {
      console.log("Chargement des données pour:", this.currentUser.uid);
      const userDoc = await getDoc(doc(this.db, 'users', this.currentUser.uid));
      
      if (userDoc.exists()) {
        this.userData = userDoc.data();
        console.log("Données utilisateur chargées:", this.userData);
        return this.userData;
      }
      
      // Si les données n'existent pas encore, créons-les
      if (this.currentUser.email) {
        const newUserData = {
          username: this.currentUser.displayName || this.currentUser.email.split('@')[0],
          email: this.currentUser.email,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          level: 1,
          xp: 0,
          coins: 100,
          isAdmin: false,
          avatar: {
            head: 'default_boy',
            body: 'default_boy',
            accessory: 'none',
            background: 'default'
          },
          inventory: [
            { id: 'default_boy', type: 'head' },
            { id: 'default_girl', type: 'head' },
            { id: 'default_boy', type: 'body' },
            { id: 'default_girl', type: 'body' },
            { id: 'none', type: 'accessory' },
            { id: 'default', type: 'background' }
          ],
          achievements: [],
          settings: {
            theme: 'dark',
            notifications: true,
            sound: true
          }
        };
        
        await setDoc(doc(this.db, 'users', this.currentUser.uid), newUserData);
        this.userData = newUserData;
        console.log("Nouveau profil utilisateur créé");
        return this.userData;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      return null;
    }
  }

  // Charger les données utilisateur depuis un ID local (sans authentification Firebase)
  async loadUserDataFromLocalId(userId) {
    try {
      console.log("Chargement des données pour ID local:", userId);
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (userDoc.exists()) {
        this.userData = userDoc.data();
        // Créer un objet utilisateur simulé pour la compatibilité
        this.currentUser = {
          uid: userId,
          email: this.userData.email || null,
          displayName: this.userData.username || null,
          // Ajouter d'autres propriétés nécessaires ici
          isLocalUser: true
        };
        console.log("Données utilisateur local chargées:", this.userData);
        return this.userData;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur local:', error);
      return null;
    }
  }

  // Connexion avec email/mot de passe (méthode Firebase)
  async loginWithEmail(email, password) {
    try {
      console.log("Tentative de connexion avec email:", email);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.currentUser = userCredential.user;
      await this.loadUserData();
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Erreur de connexion avec email:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Connexion avec nom d'utilisateur/mot de passe (méthode personnalisée)
  async loginWithUsername(username, password) {
    try {
      console.log("Tentative de connexion avec nom d'utilisateur:", username);
      
      // Rechercher l'utilisateur par son nom d'utilisateur
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("Utilisateur non trouvé:", username);
        return { 
          success: false, 
          error: 'Nom d\'utilisateur ou mot de passe incorrect'
        };
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Vérifier le mot de passe
      if (userData.password !== password) {
        console.log("Mot de passe incorrect pour:", username);
        return { 
          success: false, 
          error: 'Nom d\'utilisateur ou mot de passe incorrect'
        };
      }

      // Mettre à jour la dernière connexion
      await updateDoc(doc(this.db, 'users', userDoc.id), {
        lastLogin: new Date().toISOString()
      });

      // Stocker l'ID utilisateur dans le localStorage
      localStorage.setItem('userId', userDoc.id);
      
      // Définir l'utilisateur actuel
      this.currentUser = {
        uid: userDoc.id,
        email: userData.email || null,
        displayName: userData.username,
        isLocalUser: true
      };
      
      this.userData = userData;
      this.notifyListeners();
      
      console.log("Connexion réussie pour:", username);
      return { 
        success: true, 
        user: this.currentUser
      };
    } catch (error) {
      console.error('Erreur de connexion avec nom d\'utilisateur:', error);
      return { 
        success: false, 
        error: 'Une erreur est survenue lors de la connexion'
      };
    }
  }

  // Connexion générique (détecte automatiquement email ou nom d'utilisateur)
  async login(usernameOrEmail, password) {
    console.log("Tentative de connexion avec:", usernameOrEmail);
    
    // Vérifier si c'est un email (contient @)
    if (usernameOrEmail.includes('@')) {
      return this.loginWithEmail(usernameOrEmail, password);
    } else {
      return this.loginWithUsername(usernameOrEmail, password);
    }
  }

  // Inscription avec email/mot de passe (méthode Firebase)
  async registerWithEmail(email, password, username) {
    try {
      console.log("Tentative d'inscription avec email:", email);
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      this.currentUser = userCredential.user;

      // Mise à jour du profil avec le nom d'utilisateur
      await updateProfile(this.currentUser, { displayName: username });
      
      // Création du document utilisateur dans Firestore
      await this.createUserProfile(username, email);
      
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Erreur d\'inscription avec email:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Inscription avec nom d'utilisateur/mot de passe (méthode personnalisée)
  async registerWithUsername(username, password) {
    try {
      console.log("Tentative d'inscription avec nom d'utilisateur:", username);
      
      // Vérifier si le nom d'utilisateur est déjà pris
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return { 
          success: false, 
          error: 'Ce nom d\'utilisateur est déjà pris'
        };
      }

      // Créer un nouveau document utilisateur
      const userRef = doc(collection(this.db, 'users'));
      const userData = {
        username: username,
        password: password, // Note: Dans un environnement de production, il faudrait hasher le mot de passe
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        level: 1,
        xp: 0,
        coins: 100,
        isAdmin: false,
        avatar: {
          head: 'default_boy',
          body: 'default_boy',
          accessory: 'none',
          background: 'default'
        },
        inventory: [
          { id: 'default_boy', type: 'head' },
          { id: 'default_girl', type: 'head' },
          { id: 'default_boy', type: 'body' },
          { id: 'default_girl', type: 'body' },
          { id: 'none', type: 'accessory' },
          { id: 'default', type: 'background' }
        ],
        achievements: [],
        settings: {
          theme: 'dark',
          notifications: true,
          sound: true
        }
      };

      await setDoc(userRef, userData);
      
      // Stocker l'ID utilisateur dans le localStorage
      localStorage.setItem('userId', userRef.id);
      
      // Définir l'utilisateur actuel
      this.currentUser = {
        uid: userRef.id,
        displayName: username,
        isLocalUser: true
      };
      
      this.userData = userData;
      this.notifyListeners();
      
      console.log("Inscription réussie pour:", username);
      return { 
        success: true, 
        user: this.currentUser
      };
    } catch (error) {
      console.error('Erreur d\'inscription avec nom d\'utilisateur:', error);
      return { 
        success: false, 
        error: 'Une erreur est survenue lors de l\'inscription'
      };
    }
  }

  // Inscription générique
  async register(usernameOrEmail, password, username) {
    // Si le troisième paramètre est défini, c'est un email
    if (username) {
      return this.registerWithEmail(usernameOrEmail, password, username);
    } else {
      return this.registerWithUsername(usernameOrEmail, password);
    }
  }

  // Création du profil utilisateur dans Firestore
  async createUserProfile(username, email = null) {
    if (!this.currentUser) return;
    
    try {
      console.log("Création du profil utilisateur pour:", username);
      
      const userData = {
        username: username,
        email: email || null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        level: 1,
        xp: 0,
        coins: 100,
        isAdmin: false,
        avatar: {
          head: 'default_boy',
          body: 'default_boy',
          accessory: 'none',
          background: 'default'
        },
        inventory: [
          { id: 'default_boy', type: 'head' },
          { id: 'default_girl', type: 'head' },
          { id: 'default_boy', type: 'body' },
          { id: 'default_girl', type: 'body' },
          { id: 'none', type: 'accessory' },
          { id: 'default', type: 'background' }
        ],
        achievements: [],
        settings: {
          theme: 'dark',
          notifications: true,
          sound: true
        }
      };
      
      await setDoc(doc(this.db, 'users', this.currentUser.uid), userData);
      this.userData = userData;
      console.log("Profil utilisateur créé avec succès");
    } catch (error) {
      console.error('Erreur lors de la création du profil utilisateur:', error);
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    try {
      console.log("Tentative de déconnexion");
      
      // Si c'est un utilisateur Firebase, utiliser signOut
      if (this.currentUser && !this.currentUser.isLocalUser) {
        await signOut(this.auth);
      }
      
      // Dans tous les cas, nettoyer le localStorage et l'état
      localStorage.removeItem('userId');
      this.currentUser = null;
      this.userData = null;
      this.notifyListeners();
      
      console.log("Déconnexion réussie");
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
      console.log("Mise à jour du profil pour:", this.currentUser.uid);
      console.log("Données à mettre à jour:", data);
      
      // S'assurer que nous avons un document utilisateur valide
      if (!this.currentUser.uid) {
        console.error("UID utilisateur manquant lors de la mise à jour du profil");
        return { success: false, error: 'Identifiant utilisateur manquant' };
      }
      
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      
      // Vérifier si le document utilisateur existe
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        console.error("Document utilisateur non trouvé lors de la mise à jour");
        return { success: false, error: 'Profil utilisateur introuvable' };
      }
      
      // Effectuer la mise à jour
      await updateDoc(userRef, data);
      
      // Recharger les données utilisateur
      await this.loadUserData();
      
      console.log("Profil mis à jour avec succès");
      return { success: true, userData: this.userData };
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      return { 
        success: false, 
        error: error.message || this.getErrorMessage(error.code) || 'Une erreur inconnue est survenue'
      };
    }
  }

  // Upload d'avatar
  async uploadAvatar(file) {
    if (!this.currentUser) return { success: false, error: 'Non authentifié' };

    try {
      console.log("Upload d'avatar pour:", this.currentUser.uid);
      
      const storageRef = ref(this.storage, `avatars/${this.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await this.updateProfile({ 
        avatar: {
          ...this.userData.avatar,
          custom: downloadURL
        }
      });
      
      console.log("Avatar uploadé avec succès:", downloadURL);
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
      console.log("Demande de réinitialisation de mot de passe pour:", email);
      await sendPasswordResetEmail(this.auth, email);
      console.log("Email de réinitialisation envoyé");
      return { success: true };
    } catch (error) {
      console.error('Erreur de réinitialisation du mot de passe:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Ajout d'un écouteur pour les changements d'état d'authentification
  addAuthStateListener(listener) {
    this.listeners.add(listener);
    // L'appel immédiat est redondant car init() s'en charge et auth-header.js met à jour l'UI après init.
    // if (listener) listener(this.currentUser); 
  }

  // Suppression d'un écouteur
  removeAuthStateListener(listener) {
    this.listeners.delete(listener);
  }

  // Notifier tous les écouteurs
  notifyListeners() {
    this.listeners.forEach(listener => {
      if (listener) listener(this.currentUser);
    });
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