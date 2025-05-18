/**
 * Service de gestion des avatars pour English Quest Reborn
 * Gère la personnalisation des avatars et l'achat de skins
 */

import { db, COLLECTIONS } from './auth.service.js';
import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Types d'avatars disponibles
const AVATAR_TYPES = {
    HEAD: 'head',
    BODY: 'body',
    ACCESSORY: 'accessory',
    BACKGROUND: 'background'
};

// Skins disponibles par type
const AVAILABLE_SKINS = {
    head: [
        'default_boy',
        'default_girl',
        'wizard_hat',
        'knight_helmet',
        'ninja_mask',
        'crown',
        'pirate_hat'
    ],
    body: [
        'default_boy',
        'default_girl',
        'wizard_robe',
        'knight_armor',
        'ninja_suit',
        'royal_robe',
        'pirate_coat'
    ],
    accessory: [
        'none',
        'sword',
        'wand',
        'shield',
        'bow',
        'dagger',
        'staff'
    ],
    background: [
        'default',
        'forest',
        'castle',
        'dungeon',
        'beach',
        'mountain',
        'space'
    ]
};

// Prix des skins (en pièces)
const SKIN_PRICES = {
    head: {
        default_boy: 0,
        default_girl: 0,
        wizard_hat: 500,
        knight_helmet: 750,
        ninja_mask: 1000,
        crown: 2000,
        pirate_hat: 1500
    },
    body: {
        default_boy: 0,
        default_girl: 0,
        wizard_robe: 500,
        knight_armor: 750,
        ninja_suit: 1000,
        royal_robe: 2000,
        pirate_coat: 1500
    },
    accessory: {
        none: 0,
        sword: 300,
        wand: 400,
        shield: 500,
        bow: 600,
        dagger: 700,
        staff: 800
    },
    background: {
        default: 0,
        forest: 400,
        castle: 600,
        dungeon: 800,
        beach: 1000,
        mountain: 1200,
        space: 1500
    }
};

/**
 * Récupère l'avatar actuel de l'utilisateur
 */
export async function getCurrentAvatar(userId) {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (!userDoc.exists()) {
            throw new Error('Utilisateur non trouvé');
        }
        return userDoc.data().avatar;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'avatar:', error);
        throw error;
    }
}

/**
 * Récupère les skins disponibles pour l'utilisateur
 */
export async function getAvailableSkins(userId) {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (!userDoc.exists()) {
            throw new Error('Utilisateur non trouvé');
        }
        return userDoc.data().skins;
    } catch (error) {
        console.error('Erreur lors de la récupération des skins:', error);
        throw error;
    }
}

/**
 * Change une partie de l'avatar
 */
export async function changeAvatarPart(userId, type, skinId) {
    try {
        // Vérifier si le type est valide
        if (!AVATAR_TYPES[type.toUpperCase()]) {
            throw new Error('Type d\'avatar invalide');
        }

        // Vérifier si l'utilisateur possède le skin
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (!userDoc.exists()) {
            throw new Error('Utilisateur non trouvé');
        }

        const userData = userDoc.data();
        if (!userData.skins[type].includes(skinId)) {
            throw new Error('Skin non disponible');
        }

        // Mettre à jour l'avatar
        const avatar = { ...userData.avatar };
        avatar[type] = skinId;

        await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
            avatar: avatar
        });

        return avatar;
    } catch (error) {
        console.error('Erreur lors du changement d\'avatar:', error);
        throw error;
    }
}

/**
 * Achète un nouveau skin
 */
export async function buySkin(userId, type, skinId) {
    try {
        // Vérifier si le type est valide
        if (!AVATAR_TYPES[type.toUpperCase()]) {
            throw new Error('Type d\'avatar invalide');
        }

        // Vérifier si le skin existe
        if (!AVAILABLE_SKINS[type].includes(skinId)) {
            throw new Error('Skin non disponible');
        }

        // Récupérer les données de l'utilisateur
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (!userDoc.exists()) {
            throw new Error('Utilisateur non trouvé');
        }

        const userData = userDoc.data();

        // Vérifier si l'utilisateur possède déjà le skin
        if (userData.skins[type].includes(skinId)) {
            throw new Error('Vous possédez déjà ce skin');
        }

        // Vérifier si l'utilisateur a assez de pièces
        const price = SKIN_PRICES[type][skinId];
        if (userData.coins < price) {
            throw new Error('Pas assez de pièces');
        }

        // Mettre à jour les skins et les pièces
        const skins = { ...userData.skins };
        skins[type].push(skinId);

        await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
            skins: skins,
            coins: userData.coins - price
        });

        return {
            skins: skins,
            coins: userData.coins - price
        };
    } catch (error) {
        console.error('Erreur lors de l\'achat du skin:', error);
        throw error;
    }
}

/**
 * Récupère les informations sur un skin
 */
export function getSkinInfo(type, skinId) {
    return {
        id: skinId,
        type: type,
        price: SKIN_PRICES[type][skinId],
        available: AVAILABLE_SKINS[type].includes(skinId)
    };
}

/**
 * Récupère tous les skins disponibles
 */
export function getAllAvailableSkins() {
    return AVAILABLE_SKINS;
}

/**
 * Récupère tous les prix des skins
 */
export function getAllSkinPrices() {
    return SKIN_PRICES;
} 