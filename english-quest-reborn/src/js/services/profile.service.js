/**
 * Service de gestion des profils pour English Quest Reborn
 * Gère les profils utilisateurs, les avatars et les skins
 */

import { getUserProfile, updateUserProfile, addCoins } from './user.service.js';
import { getAuth, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

// Prix des skins
const SKIN_PRICES = {
    head: {
        default_boy: 0,
        default_girl: 0,
        bear: 500
    },
    body: {
        default_boy: 0,
        default_girl: 0,
        bear: 500
    },
    accessory: {
        none: 0
    },
    background: {
        default: 0
    }
};

/**
 * Récupère le profil utilisateur avec les informations d'avatar
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Profil utilisateur avec avatar
 */
export async function getUserProfileWithAvatar(userId) {
    console.log('Récupération du profil utilisateur avec avatar:', userId);
    
    try {
        // Récupérer le profil utilisateur
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
            throw new Error('Profil utilisateur non trouvé');
        }
        
        // S'assurer que l'utilisateur a un avatar
        if (!userProfile.avatar) {
            userProfile.avatar = {
                head: 'default_boy',
                body: 'default_boy',
                accessory: 'none',
                background: 'default'
            };
            
            // Mettre à jour le profil
            await updateUserProfile(userId, {
                avatar: userProfile.avatar
            });
        }
        
        // S'assurer que l'utilisateur a des skins
        if (!userProfile.skins) {
            userProfile.skins = {
                head: ['default_boy', 'default_girl'],
                body: ['default_boy', 'default_girl'],
                accessory: ['none'],
                background: ['default']
            };
            
            // Mettre à jour le profil
            await updateUserProfile(userId, {
                skins: userProfile.skins
            });
        }
        
        return userProfile;
    } catch (error) {
        console.error('Erreur lors de la récupération du profil avec avatar:', error);
        throw error;
    }
}

/**
 * Met à jour l'avatar de l'utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} avatarData - Données de l'avatar
 * @returns {Promise<Object>} - Profil utilisateur mis à jour
 */
export async function updateUserAvatar(userId, avatarData) {
    console.log('Mise à jour de l\'avatar de l\'utilisateur:', userId);
    
    try {
        // Récupérer le profil utilisateur
        const userProfile = await getUserProfileWithAvatar(userId);
        
        // Vérifier que l'utilisateur possède les skins demandés
        const skins = userProfile.skins || {};
        
        if (avatarData.head && !skins.head.includes(avatarData.head)) {
            throw new Error(`Vous ne possédez pas le skin de tête "${avatarData.head}"`);
        }
        
        if (avatarData.body && !skins.body.includes(avatarData.body)) {
            throw new Error(`Vous ne possédez pas le skin de corps "${avatarData.body}"`);
        }
        
        if (avatarData.accessory && !skins.accessory.includes(avatarData.accessory)) {
            throw new Error(`Vous ne possédez pas l'accessoire "${avatarData.accessory}"`);
        }
        
        if (avatarData.background && !skins.background.includes(avatarData.background)) {
            throw new Error(`Vous ne possédez pas l'arrière-plan "${avatarData.background}"`);
        }
        
        // Préparer les données de l'avatar
        const avatar = {
            ...userProfile.avatar,
            ...avatarData
        };
        
        // Mettre à jour le profil
        return await updateUserProfile(userId, {
            avatar,
            hasSelectedGender: true
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'avatar:', error);
        throw error;
    }
}

/**
 * Achète un nouveau skin pour l'utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} skinType - Type de skin (head, body, accessory, background)
 * @param {string} skinId - ID du skin
 * @returns {Promise<Object>} - Résultat de l'achat
 */
export async function purchaseSkin(userId, skinType, skinId) {
    console.log(`Achat du skin ${skinId} de type ${skinType} pour l'utilisateur ${userId}`);
    
    try {
        // Récupérer le profil utilisateur
        const userProfile = await getUserProfileWithAvatar(userId);
        
        // Vérifier si l'utilisateur possède déjà ce skin
        const skins = userProfile.skins || {};
        const skinList = skins[skinType] || [];
        
        if (skinList.includes(skinId)) {
            throw new Error(`Vous possédez déjà le skin "${skinId}"`);
        }
        
        // Vérifier si le skin existe
        const skinPrice = SKIN_PRICES[skinType]?.[skinId];
        
        if (skinPrice === undefined) {
            throw new Error(`Le skin "${skinId}" n'existe pas`);
        }
        
        // Vérifier si l'utilisateur a assez de pièces
        const userCoins = userProfile.coins || 0;
        
        if (userCoins < skinPrice) {
            throw new Error(`Vous n'avez pas assez de pièces pour acheter ce skin (${skinPrice} pièces nécessaires)`);
        }
        
        // Mettre à jour les pièces de l'utilisateur
        const newCoins = userCoins - skinPrice;
        
        // Ajouter le skin à la liste des skins de l'utilisateur
        const newSkinList = [...skinList, skinId];
        const newSkins = {
            ...skins,
            [skinType]: newSkinList
        };
        
        // Mettre à jour le profil
        await updateUserProfile(userId, {
            coins: newCoins,
            skins: newSkins
        });
        
        // Récupérer le profil mis à jour
        const updatedProfile = await getUserProfile(userId);
        
        return {
            success: true,
            message: `Vous avez acheté le skin "${skinId}" pour ${skinPrice} pièces`,
            profile: updatedProfile,
            purchase: {
                skinType,
                skinId,
                price: skinPrice
            }
        };
    } catch (error) {
        console.error('Erreur lors de l\'achat du skin:', error);
        throw error;
    }
}

/**
 * Récupère la liste des skins disponibles avec leurs prix
 * @returns {Object} - Liste des skins disponibles
 */
export function getAvailableSkins() {
    return SKIN_PRICES;
}

/**
 * Récupère les skins que l'utilisateur ne possède pas encore
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Liste des skins disponibles à l'achat
 */
export async function getAvailableSkinsForUser(userId) {
    console.log('Récupération des skins disponibles pour l\'utilisateur:', userId);
    
    try {
        // Récupérer le profil utilisateur
        const userProfile = await getUserProfileWithAvatar(userId);
        const userSkins = userProfile.skins || {};
        
        // Préparer la liste des skins disponibles
        const availableSkins = {};
        
        // Pour chaque type de skin
        for (const skinType in SKIN_PRICES) {
            availableSkins[skinType] = {};
            
            // Pour chaque skin de ce type
            for (const skinId in SKIN_PRICES[skinType]) {
                // Vérifier si l'utilisateur possède déjà ce skin
                const userSkinList = userSkins[skinType] || [];
                
                if (!userSkinList.includes(skinId)) {
                    // Ajouter le skin à la liste des skins disponibles
                    availableSkins[skinType][skinId] = SKIN_PRICES[skinType][skinId];
                }
            }
        }
        
        return {
            availableSkins,
            userCoins: userProfile.coins || 0
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des skins disponibles:', error);
        throw error;
    }
}

/**
 * Met à jour le profil de l'utilisateur
 * @param {Object} profileData - Les données du profil à mettre à jour
 * @returns {Promise<void>}
 */
export async function updateProfile(profileData) {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('Utilisateur non authentifié');
        }

        // Mettre à jour le profil Firebase Auth
        if (profileData.username) {
            await updateFirebaseProfile(user, {
                displayName: profileData.username
            });
        }

        // Mettre à jour le profil dans Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            ...profileData,
            updatedAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        throw error;
    }
}

/**
 * Met à jour l'avatar de l'utilisateur
 * @param {Object} avatarData - Les données de l'avatar à mettre à jour
 * @returns {Promise<void>}
 */
export async function updateAvatar(avatarData) {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('Utilisateur non authentifié');
        }

        // Mettre à jour l'avatar dans Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            avatar: avatarData,
            updatedAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'avatar:', error);
        throw error;
    }
}

/**
 * Met à jour les paramètres de l'utilisateur
 * @param {Object} settings - Les paramètres à mettre à jour
 * @returns {Promise<void>}
 */
export async function updateSettings(settings) {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('Utilisateur non authentifié');
        }

        // Mettre à jour les paramètres dans Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            settings: {
                ...settings
            },
            updatedAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des paramètres:', error);
        throw error;
    }
}

/**
 * Met à jour les statistiques de l'utilisateur
 * @param {Object} stats - Les statistiques à mettre à jour
 * @returns {Promise<void>}
 */
export async function updateStats(stats) {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('Utilisateur non authentifié');
        }

        // Mettre à jour les statistiques dans Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            stats: {
                ...stats
            },
            updatedAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
        throw error;
    }
}

/**
 * Met à jour le niveau et l'XP de l'utilisateur
 * @param {number} xp - L'XP à ajouter
 * @returns {Promise<void>}
 */
export async function updateLevelAndXP(xp) {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('Utilisateur non authentifié');
        }

        // Mettre à jour le niveau et l'XP dans Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            xp: xp,
            level: Math.floor(xp / 100) + 1,
            updatedAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du niveau et de l\'XP:', error);
        throw error;
    }
}

/**
 * Met à jour les pièces de l'utilisateur
 * @param {number} coins - Les pièces à ajouter
 * @returns {Promise<void>}
 */
export async function updateCoins(coins) {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('Utilisateur non authentifié');
        }

        // Mettre à jour les pièces dans Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            coins: coins,
            updatedAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des pièces:', error);
        throw error;
    }
}
