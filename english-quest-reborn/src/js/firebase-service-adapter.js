/**
 * Firebase Service Adapter
 * Expose firebaseServiceInstance globally for backward compatibility
 * This bridges the gap between the new modular architecture and the old global approach
 */

(function() {
    'use strict';

    // Simple FirebaseService implementation using Firebase v8 (global firebase object)
    class FirebaseServiceAdapter {
        constructor() {
            // Vérifier si Firebase est disponible
            if (typeof firebase === 'undefined') {
                console.warn('[Firebase Adapter] Firebase global object not available');
                this.db = null;
                this.auth = null;
                return;
            }

            try {
                this.db = firebase.firestore();
                this.auth = firebase.auth();
                console.log('[Firebase Adapter] Firebase services initialized');
            } catch (error) {
                console.error('[Firebase Adapter] Error initializing Firebase services:', error);
                this.db = null;
                this.auth = null;
            }
        }

        // Score management methods
        async addScore(scoreData) {
            if (!this.db) {
                throw new Error('Firestore not available');
            }

            try {
                // Utiliser la collection 'game_scores' comme dans la nouvelle architecture
                const docRef = await this.db.collection('game_scores').add({
                    ...scoreData,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('[Firebase Adapter] Score added with ID:', docRef.id);
                return docRef;
            } catch (error) {
                console.error('[Firebase Adapter] Error adding score:', error);
                throw error;
            }
        }

        // Profile management methods
        async getProfile(userId) {
            if (!this.db) {
                throw new Error('Firestore not available');
            }

            try {
                const doc = await this.db.collection('PROFILES').doc(userId).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } catch (error) {
                console.error('[Firebase Adapter] Error getting profile:', error);
                throw error;
            }
        }

        async updateProfile(userId, data) {
            if (!this.db) {
                throw new Error('Firestore not available');
            }

            try {
                await this.db.collection('PROFILES').doc(userId).update(data);
                console.log('[Firebase Adapter] Profile updated for user:', userId);
            } catch (error) {
                console.error('[Firebase Adapter] Error updating profile:', error);
                throw error;
            }
        }

        async createProfile(userId, profileData) {
            if (!this.db) {
                throw new Error('Firestore not available');
            }

            try {
                await this.db.collection('PROFILES').doc(userId).set(profileData);
                console.log('[Firebase Adapter] Profile created for user:', userId);
            } catch (error) {
                console.error('[Firebase Adapter] Error creating profile:', error);
                throw error;
            }
        }

        // Auth state change listener
        onAuthStateChanged(callback) {
            if (!this.auth) {
                console.warn('[Firebase Adapter] Auth not available for state changes');
                return () => {}; // Return empty unsubscribe function
            }

            return this.auth.onAuthStateChanged(callback);
        }

        // Analytics
        logEvent(eventName, eventParams) {
            try {
                if (firebase.analytics) {
                    firebase.analytics().logEvent(eventName, eventParams);
                }
            } catch (error) {
                console.warn('[Firebase Adapter] Analytics not available:', error);
            }
        }
    }

    // Function to initialize and expose the adapter
    function initializeFirebaseServiceAdapter() {
        // Only initialize if firebase is available and not already initialized
        if (typeof firebase !== 'undefined' && !window.firebaseServiceInstance) {
            try {
                window.firebaseServiceInstance = new FirebaseServiceAdapter();
                console.log('[Firebase Adapter] firebaseServiceInstance exposed globally');
                
                // Trigger event to notify other scripts
                document.dispatchEvent(new CustomEvent('firebaseServiceReady', {
                    detail: { instance: window.firebaseServiceInstance }
                }));
            } catch (error) {
                console.error('[Firebase Adapter] Error initializing adapter:', error);
            }
        }
    }

    // Try to initialize immediately if Firebase is already loaded
    if (typeof firebase !== 'undefined') {
        initializeFirebaseServiceAdapter();
    } else {
        // Wait for Firebase to be loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Try again after DOM is loaded
            setTimeout(initializeFirebaseServiceAdapter, 100);
        });

        // Also try when the window loads
        window.addEventListener('load', () => {
            setTimeout(initializeFirebaseServiceAdapter, 100);
        });
    }

    // Listen for Firebase ready event if it exists
    document.addEventListener('firebaseOnline', initializeFirebaseServiceAdapter);

})(); 