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
import bcrypt from './lib/bcrypt.min.js';
import { firebaseConfig } from '../config/app.config.js'; // Ensure this path is correct

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const saltRounds = 10;

const USER_ID_KEY = 'englishQuestUserId';
const IS_ADMIN_KEY = 'englishQuestIsAdmin';

class AuthService {
    constructor() {
        this.db = db;
        this.currentUser = null; // Will store { uid, username, isAdmin, ...other Firestore data }
        this.userData = null; // Redundant with currentUser if currentUser holds all data
        this.listeners = new Set();
        this._initializeFromLocalStorage();
    }

    _initializeFromLocalStorage() {
        const userId = localStorage.getItem(USER_ID_KEY);
        if (userId) {
            // Attempt to load user data. If successful, user is considered logged in.
            this.loadUserData(userId).then((userData) => {
                if (userData) {
                    this.currentUser = { uid: userId, ...userData };
                    this.userData = userData; // Keep for compatibility if used elsewhere
                    this.notifyListeners();
                }
            });
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async init() {
      // Initialization is now handled by constructor and _initializeFromLocalStorage
      // We ensure listeners are notified once initial state is determined.
      // If user was found in localStorage, loadUserData would have notified.
      // If not, notify with null state.
      if (!this.currentUser) {
          this.notifyListeners();
      }
      return Promise.resolve(this.currentUser);
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
                passwordMatch = await bcrypt.compare(password, userData.hashedPassword);
            } else if (userData.password) { // Legacy plaintext password
                if (userData.password === password) {
                    passwordMatch = true;
                    console.log(`User ${username} (ID: ${userId}) logged in with plaintext password. Migrating...`);
                    const newHashedPassword = await bcrypt.hash(password, saltRounds);
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

            const hashedPassword = await bcrypt.hash(password, saltRounds);
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

            await setDoc(doc(this.db, 'users', userId), newUser);

            // Login the new user
            this.currentUser = { uid: userId, ...newUser };
            this.userData = newUser; // for compatibility
            localStorage.setItem(USER_ID_KEY, userId);
            localStorage.setItem(IS_ADMIN_KEY, newUser.isAdmin ? 'true' : 'false');
            this.notifyListeners();
            console.log("Registration successful for:", username);
            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || "An internal error occurred during registration." };
        }
    }

    async logout() {
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(IS_ADMIN_KEY);
        this.currentUser = null;
        this.userData = null;
        this.notifyListeners();
        console.log("Logout successful");
        return { success: true };
    }

    async updateProfile(data) {
        if (!this.currentUser || !this.currentUser.uid) {
            return { success: false, error: 'Not authenticated' };
        }
        try {
            await updateDoc(doc(this.db, 'users', this.currentUser.uid), data);
            // Re-fetch or merge data to update local state
            const updatedUserData = await this.loadUserData(this.currentUser.uid);
            if (updatedUserData) {
                this.currentUser = { uid: this.currentUser.uid, ...updatedUserData };
                this.userData = updatedUserData;
                // Update isAdmin in localStorage if it changed (though not typical via this method)
                if (typeof updatedUserData.isAdmin !== 'undefined') {
                    localStorage.setItem(IS_ADMIN_KEY, updatedUserData.isAdmin ? 'true' : 'false');
                }
                this.notifyListeners();
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
        // Immediately notify with current state upon adding listener
        if (listener) listener(this.currentUser);
    }

    removeAuthStateListener(listener) {
        this.listeners.delete(listener);
    }

    notifyListeners() {
        this.listeners.forEach(listener => {
            if (listener) listener(this.currentUser);
        });
    }

    // No getErrorMessage needed as Firebase Auth errors are not directly exposed now
}

export const authService = new AuthService(); 