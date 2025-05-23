import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
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
    serverTimestamp,
    deleteField
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
// import bcrypt from './lib/bcrypt.min.js'; // Removed import, bcrypt is now global via dcodeIO.bcrypt
import { firebaseConfig } from '../src/config/app.config.js'; // Corrected path

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const saltRounds = 10;

const USER_ID_KEY = 'englishQuestUserId';
const IS_ADMIN_KEY = 'englishQuestIsAdmin';

class AuthService {
    constructor() {
        this.db = db;
        this.currentUser = null;
        this.userData = null;
        this.listeners = new Set();
        this.initPromise = null; // Pour la refactorisation de init()
        // _initializeFromLocalStorage() n'est plus appelé directement ici, init() le gère.
        console.log("[AuthService] Constructor: instance created.");
    }

    _initializeFromLocalStorage() {
        // Cette méthode est maintenant intégrée dans la logique de la promesse de init()
        // pour s'assurer que l'initialisation est bien attendue.
        // Le code original a été déplacé et adapté dans la nouvelle fonction init().
        // On pourrait garder une version de cette fonction si elle est appelée ailleurs,
        // mais pour l'instant, init() prend en charge le flux de chargement initial.
        console.log("[AuthService] _initializeFromLocalStorage CALLED (mais la logique principale est dans init).");
    }

    getCurrentUser() {
        console.log("[AuthService] getCurrentUser() CALLED. Returning:", this.currentUser);
        return this.currentUser;
    }

    async init() {
      console.log("[AuthService] init() CALLED");
      if (!this.initPromise) {
          console.log("[AuthService] init() - Creating new initPromise.");
          this.initPromise = new Promise((resolve) => {
              const localUserId = localStorage.getItem(USER_ID_KEY);
              console.log(`[AuthService] init() - userId from localStorage: '${localUserId}'`);

              if (localUserId && localUserId !== "undefined" && localUserId !== "null") {
                  console.log(`[AuthService] init() - Attempting to load user data for userId: ${localUserId}`);
                  this.loadUserData(localUserId)
                      .then(userData => {
                          console.log(`[AuthService] init() - userData from loadUserData for ${localUserId}:`, userData);
                          if (userData) {
                              this.currentUser = { uid: localUserId, ...userData };
                              this.userData = userData; // Conserver pour compatibilité si nécessaire
                              console.log("[AuthService] init() - currentUser SET from localStorage:", this.currentUser);
                          } else {
                              console.warn(`[AuthService] init() - No userData returned for stored userId: ${localUserId}. Clearing localStorage.`);
                              localStorage.removeItem(USER_ID_KEY);
                              localStorage.removeItem(IS_ADMIN_KEY);
                              this.currentUser = null;
                              this.userData = null;
                          }
                          this.notifyListeners();
                          resolve(this.currentUser);
                      })
                      .catch(error => {
                          console.error(`[AuthService] init() - Error in loadUserData promise for userId ${localUserId}:`, error);
                          localStorage.removeItem(USER_ID_KEY);
                          localStorage.removeItem(IS_ADMIN_KEY);
                          this.currentUser = null;
                          this.userData = null;
                          this.notifyListeners();
                          resolve(null); // Résoudre avec null en cas d'erreur
                      });
              } else {
                  console.log("[AuthService] init() - No valid userId found in localStorage. Setting currentUser to null.");
                  this.currentUser = null;
                  this.userData = null;
                  this.notifyListeners(); 
                  resolve(null);
              }
          });
      } else {
        console.log("[AuthService] init() - Returning existing initPromise.");
      }
      return this.initPromise;
    }

    async loadUserData(userId) {
        if (!userId) return null;
        try {
            const userDocRef = doc(this.db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const data = userDoc.data();
                console.log("User data loaded for", userId, data.username);
                return data;
            }
            console.warn("No user data found for userId:", userId);
            return null;
        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    }

    async login(username, password) { // Simplified, only username login
        console.log(`[AuthService] login() CALLED for username: ${username}`);
        if (!username || !password) {
            return { success: false, error: "Username and password are required." };
        }
        try {
            const usersRef = collection(this.db, 'users');
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, error: "Invalid username or password." };
            }

            const userDocSnapshot = querySnapshot.docs[0];
            const userData = userDocSnapshot.data();
            const userId = userDocSnapshot.id;

            let passwordMatch = false;

            if (userData.hashedPassword) {
                passwordMatch = await dcodeIO.bcrypt.compare(password, userData.hashedPassword);
            } else if (userData.password) { // Legacy plaintext password
                if (userData.password === password) {
                    passwordMatch = true;
                    console.log(`User ${username} (ID: ${userId}) logged in with plaintext password. Migrating...`);
                    const newHashedPassword = await dcodeIO.bcrypt.hash(password, saltRounds);
                    await updateDoc(doc(this.db, 'users', userId), {
                        hashedPassword: newHashedPassword,
                        password: deleteField(),
                        lastPasswordUpdate: serverTimestamp()
                    });
                    console.log(`User ${username} (ID: ${userId}) migrated to hashed password.`);
                    // Update userData in memory after migration for current session
                    userData.hashedPassword = newHashedPassword;
                    delete userData.password;
                } else {
                    passwordMatch = false;
                }
            } else {
                return { success: false, error: "User account issue: No password configured." };
            }

            if (!passwordMatch) {
                return { success: false, error: "Invalid username or password." };
            }

            // Login successful
            this.currentUser = { uid: userId, ...userData };
            this.userData = userData; // for compatibility
            localStorage.setItem(USER_ID_KEY, userId);
            localStorage.setItem(IS_ADMIN_KEY, userData.isAdmin ? 'true' : 'false');
            console.log(`[AuthService] login() - User ID ${userId} and isAdmin ${userData.isAdmin} stored in localStorage.`);
            
            await updateDoc(doc(this.db, 'users', userId), { lastLogin: serverTimestamp() });
            this.notifyListeners();
            console.log("Login successful for:", username);
            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || "An internal error occurred during login." };
        }
    }

    async register(username, password) { // Simplified, only username registration
        console.log(`[AuthService] register() CALLED for username: ${username}`);
        if (!username || !password) {
            return { success: false, error: "Username and password are required." };
        }
        if (password.length < 6) {
            return { success: false, error: "Password must be at least 6 characters long." };
        }

        try {
            const usersRef = collection(this.db, 'users');
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return { success: false, error: "Username already taken." };
            }

            const hashedPassword = await dcodeIO.bcrypt.hash(password, saltRounds);
            const userId = doc(usersRef).id; // Generate a new unique ID for the user

            const newUser = {
                username: username,
                hashedPassword: hashedPassword,
                isAdmin: false,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                level: 1,
                xp: 0,
                coins: 100,
                pendingXP: 0,
                pendingCoins: 0,
                avatar: {
                    head: 'default_boy_head',
                    body: 'default_boy_body',
                    accessory: 'none',
                    background: 'default_background'
                },
                inventory: {
                    skins: {
                        head: ['default_boy_head', 'default_girl_head'],
                        body: ['default_boy_body', 'default_girl_body'],
                        accessory: ['none'],
                        background: ['default_background']
                    },
                    items: []
                },
                achievements: [],
                settings: {
                    theme: 'dark',
                    notifications: true,
                    sound: true
                }
            };

            await setDoc(doc(this.db, 'users', userId), newUser);

            // Login the new user
            this.currentUser = { uid: userId, ...newUser };
            this.userData = newUser; // for compatibility
            localStorage.setItem(USER_ID_KEY, userId);
            localStorage.setItem(IS_ADMIN_KEY, newUser.isAdmin ? 'true' : 'false');
            console.log(`[AuthService] register() - User ID ${userId} and isAdmin ${newUser.isAdmin} stored in localStorage.`);
            this.notifyListeners();
            console.log("Registration successful for:", username);
            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || "An internal error occurred during registration." };
        }
    }

    async logout() {
        console.log("[AuthService] logout() CALLED.");
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(IS_ADMIN_KEY);
        console.log("[AuthService] logout() - localStorage cleared.");
        this.currentUser = null;
        this.userData = null;
        this.notifyListeners();
        console.log("Logout successful");
        return { success: true };
    }

    async updateProfile(data) {
        console.log("[AuthService] updateProfile() CALLED with data:", data);
        if (!this.currentUser || !this.currentUser.uid) {
            console.warn("[AuthService] updateProfile() - Not authenticated");
            return { success: false, error: 'Not authenticated' };
        }
        try {
            console.log(`[AuthService] updateProfile() - Updating document for user: ${this.currentUser.uid}`);
            await updateDoc(doc(this.db, 'users', this.currentUser.uid), data);
            console.log("[AuthService] updateProfile() - Firebase document updated successfully");
            
            // Re-fetch or merge data to update local state
            console.log("[AuthService] updateProfile() - Reloading user data from Firebase...");
            const updatedUserData = await this.loadUserData(this.currentUser.uid);
            console.log("[AuthService] updateProfile() - Fresh data loaded:", updatedUserData);
            
            if (updatedUserData) {
                const oldInventory = this.currentUser.inventory;
                this.currentUser = { uid: this.currentUser.uid, ...updatedUserData };
                this.userData = updatedUserData;
                
                console.log("[AuthService] updateProfile() - Old inventory:", oldInventory);
                console.log("[AuthService] updateProfile() - New inventory:", updatedUserData.inventory);
                
                // Update isAdmin in localStorage if it changed (though not typical via this method)
                if (typeof updatedUserData.isAdmin !== 'undefined') {
                    localStorage.setItem(IS_ADMIN_KEY, updatedUserData.isAdmin ? 'true' : 'false');
                }
                this.notifyListeners();
                console.log("[AuthService] updateProfile() - Local state updated and listeners notified");
            } else {
                console.warn("[AuthService] updateProfile() - Failed to reload user data after update");
            }
            console.log("Profile updated for:", this.currentUser.username);
            return { success: true, userData: this.currentUser };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message || "Profile update failed." };
        }
    }
    
    // Listener methods
    addAuthStateListener(listener) {
        this.listeners.add(listener);
        // Exécute immédiatement le listener avec l'état actuel
        // Peut-être attendre que initPromise soit résolue si l'état n'est pas encore fiable
        if (this.initPromise) {
            this.initPromise.then(() => listener(this.currentUser));
        } else {
             // Si init n'a pas encore été appelé, le listener sera notifié lorsque init se terminera
             // ou lorsque l'état changera via login/logout.
             // Pour l'instant, on peut l'appeler avec l'état potentiellement non initialisé.
            listener(this.currentUser);
        }
        console.log("[AuthService] addAuthStateListener() - Listener added. Total listeners:", this.listeners.size);
    }

    removeAuthStateListener(listener) {
        this.listeners.delete(listener);
        console.log("[AuthService] removeAuthStateListener() - Listener removed. Total listeners:", this.listeners.size);
    }

    notifyListeners() {
        console.log("[AuthService] notifyListeners() CALLED. Notifying", this.listeners.size, "listeners with user:", this.currentUser);
        this.listeners.forEach(listener => {
            try {
                listener(this.currentUser);
            } catch (error) {
                console.error("[AuthService] Error in one of the auth state listeners:", error);
            }
        });
    }

    // No getErrorMessage needed as Firebase Auth errors are not directly exposed now

    // Nouvelle méthode pour forcer le rechargement des données utilisateur
    async refreshUser() {
      console.log("[AuthService] refreshUser() CALLED - forcing fresh data load");
      const localUserId = localStorage.getItem(USER_ID_KEY);
      
      if (!localUserId || localUserId === "undefined" || localUserId === "null") {
        console.warn("[AuthService] refreshUser() - No valid userId in localStorage");
        this.currentUser = null;
        this.userData = null;
        this.notifyListeners();
        return null;
      }

      try {
        console.log(`[AuthService] refreshUser() - Loading fresh data for userId: ${localUserId}`);
        const userData = await this.loadUserData(localUserId);
        
        if (userData) {
          this.currentUser = { uid: localUserId, ...userData };
          this.userData = userData;
          console.log("[AuthService] refreshUser() - Fresh data loaded:", this.currentUser);
          this.notifyListeners();
          return this.currentUser;
        } else {
          console.warn(`[AuthService] refreshUser() - No userData returned for userId: ${localUserId}`);
          localStorage.removeItem(USER_ID_KEY);
          localStorage.removeItem(IS_ADMIN_KEY);
          this.currentUser = null;
          this.userData = null;
          this.notifyListeners();
          return null;
        }
      } catch (error) {
        console.error(`[AuthService] refreshUser() - Error loading fresh data:`, error);
        return null;
      }
    }
}

export const authService = new AuthService(); 