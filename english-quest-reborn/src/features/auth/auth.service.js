// auth.service.js refactored for username/password with internal email

import { 
  signOutUser, 
  subscribeToAuthChanges,
  createUserWithEmailAndPasswordFirebase,
  signInWithEmailAndPasswordFirebase
} from '@core/services/firebase.service.js'; 

import firebaseServiceInstance, { INTERNAL_EMAIL_DOMAIN } from '@core/services/firebase.service.js';
import { getConfig } from '@core/config/app.config.js';
import { createNewUser } from '@core/models/user.model.js';

let authState = {
  initialized: false,
  isAuthenticated: false,
  user: null,
  profile: null,
  loading: false,
  error: null
};

const authStateListeners = new Set();
let pendingDisplayNameForNewUserProfile = null;

export async function initializeAuth() {
  try {
    authState.loading = true;
    notifyListeners();
    subscribeToAuthChanges(handleAuthStateChange);

    const auth = firebaseServiceInstance.auth;
    const currentUser = auth.currentUser;

    if (currentUser) {
      await handleAuthStateChange(currentUser);
    } else {
      authState.loading = false;
      authState.initialized = true;
      notifyListeners();
    }
    return authState;
  } catch (error) {
    console.error('Auth Service Init Error:', error);
    authState.error = error.message;
    authState.loading = false;
    authState.initialized = true;
    notifyListeners();
    throw error;
  }
}

async function handleAuthStateChange(firebaseUser) {
  try {
    if (firebaseUser) {
      authState.isAuthenticated = true;
      authState.user = firebaseUser;
      
      const displayName = pendingDisplayNameForNewUserProfile || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Player');
      const profile = await getOrCreateUserProfile(firebaseUser.uid, displayName, firebaseUser.email);
      authState.profile = profile;
      pendingDisplayNameForNewUserProfile = null;

      firebaseServiceInstance.logEvent('login', {
        method: 'username_password',
        user_id: firebaseUser.uid
      });
    } else {
      authState.isAuthenticated = false;
      authState.user = null;
      authState.profile = null;
    }
    authState.loading = false;
    authState.initialized = true;
    notifyListeners();
  } catch (error) {
    console.error('Auth State Change Error:', error);
    authState.error = error.message;
    authState.loading = false;
    authState.initialized = true;
    pendingDisplayNameForNewUserProfile = null;
    notifyListeners();
  }
}

async function getOrCreateUserProfile(userId, displayName, internalEmail) {
  try {
    const existingProfile = await firebaseServiceInstance.getProfile(userId);
    if (existingProfile) {
      await firebaseServiceInstance.updateProfile(userId, { lastLogin: new Date().toISOString() });
      return existingProfile;
    }

    const newProfileData = createNewUser(userId, displayName);
    newProfileData.email = internalEmail; 

    await firebaseServiceInstance.createProfile(userId, newProfileData);
    firebaseServiceInstance.logEvent('sign_up', {
      method: 'username_password',
      user_id: userId
    });
    return await firebaseServiceInstance.getProfile(userId);
  } catch (error) {
    console.error('Get/Create Profile Error:', error);
    throw error;
  }
}

export async function registerWithEmailPassword(loginUsername, password, displayName) {
  try {
    authState.loading = true;
    notifyListeners();
    pendingDisplayNameForNewUserProfile = displayName;
    const internalEmail = `${loginUsername.toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`; 
    
    await createUserWithEmailAndPasswordFirebase(internalEmail, password);
    
    await new Promise((resolve, reject) => {
      const unsubscribe = subscribeToAuthState(newState => {
        if (!newState.loading && newState.profile) {
          unsubscribe();
          resolve();
        } else if (!newState.loading && newState.error) {
          unsubscribe();
          reject(new Error(newState.error)); // Reject promise if authState has error
        }
      });
    });
    
    return { user: authState.user, profile: authState.profile };
  } catch (error) {
    console.error('Registration Error:', error.message);
    authState.error = error.message;
    authState.loading = false;
    pendingDisplayNameForNewUserProfile = null;
    notifyListeners();
    throw error;
  }
}

export async function loginWithEmailPassword(loginUsername, password) {
  try {
    authState.loading = true;
    notifyListeners();
    const internalEmail = `${loginUsername.toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`;
    await signInWithEmailAndPasswordFirebase(internalEmail, password);

    await new Promise((resolve, reject) => {
      const unsubscribe = subscribeToAuthState(newState => {
        if (!newState.loading && newState.profile) {
          unsubscribe();
          resolve();
        } else if (!newState.loading && newState.error) {
          unsubscribe();
          reject(new Error(newState.error));
        }
      });
    });
        
    return { user: authState.user, profile: authState.profile };
  } catch (error) {
    console.error('Login Error:', error.message);
    authState.error = error.message;
    authState.loading = false;
    notifyListeners();
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  try {
    if (!authState.isAuthenticated || !authState.user) {
      throw new Error('User not authenticated for profile update');
    }
    authState.loading = true;
    notifyListeners();

    const profileDataToUpdate = { ...profileData };
    const currentProfileUsername = authState.profile?.username;

    if ('isAdmin' in profileDataToUpdate && currentProfileUsername?.toLowerCase() !== 'ollie') {
        delete profileDataToUpdate.isAdmin;
        console.warn("Attempt to modify isAdmin by non-Ollie user blocked.");
    } else if ('isAdmin' in profileDataToUpdate && currentProfileUsername?.toLowerCase() === 'ollie') {
        profileDataToUpdate.isAdmin = true; 
    }

    await firebaseServiceInstance.updateProfile(authState.user.uid, { ...profileDataToUpdate, lastLogin: new Date().toISOString() });
    authState.profile = await firebaseServiceInstance.getProfile(authState.user.uid);
    authState.loading = false;
    notifyListeners();
    return authState.profile;
  } catch (error) {
    console.error('Update Profile Error:', error);
    authState.error = error.message;
    authState.loading = false;
    notifyListeners();
    throw error;
  }
}

export async function logout() {
  try {
    if (!authState.isAuthenticated) return;
    authState.loading = true;
    notifyListeners();
    await signOutUser(); 
  } catch (error) {
    console.error('Logout Error:', error);
    authState.error = error.message;
    authState.loading = false;
    notifyListeners();
    throw error;
  }
}

export function getAuthState() {
  return { ...authState };
}

export function subscribeToAuthState(listener) {
  authStateListeners.add(listener);
  listener({ ...authState }); 
  return () => {
    authStateListeners.delete(listener);
  };
}

function notifyListeners() {
  const state = { ...authState };
  authStateListeners.forEach(listener => {
    try {
      listener(state);
    } catch (error) {
      console.error('Listener Error:', error);
    }
  });
}

export default {
  initializeAuth,
  registerWithEmailPassword,
  loginWithEmailPassword,
  updateUserProfile,
  logout,
  getAuthState,
  subscribeToAuthState
};
