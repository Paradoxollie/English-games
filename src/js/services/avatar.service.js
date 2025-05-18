/**
 * Service de gestion des avatars pour English Quest Reborn
 */

import { db } from '../../config/firebase.config.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getCurrentProfile } from './auth.service.js';

// Clés de stockage
const STORAGE_KEYS = {
    AVATARS: 'english_quest_avatars',
    CURRENT_AVATAR: 'english_quest_current_avatar'
};

// Liste des avatars disponibles
const AVAILABLE_AVATARS = [
    {
        id: 'default',
        name: 'Avatar par défaut',
        description: 'L\'avatar par défaut',
        price: 0,
        unlocked: true,
        path: '/assets/avatars/default.png'
    },
    {
        id: 'wizard',
        name: 'Le Magicien',
        description: 'Un magicien mystérieux',
        price: 100,
        unlocked: false,
        path: '/assets/avatars/wizard.png'
    },
    {
        id: 'knight',
        name: 'Le Chevalier',
        description: 'Un chevalier courageux',
        price: 200,
        unlocked: false,
        path: '/assets/avatars/knight.png'
    },
    {
        id: 'ninja',
        name: 'Le Ninja',
        description: 'Un ninja silencieux',
        price: 300,
        unlocked: false,
        path: '/assets/avatars/ninja.png'
    },
    {
        id: 'robot',
        name: 'Le Robot',
        description: 'Un robot futuriste',
        price: 400,
        unlocked: false,
        path: '/assets/avatars/robot.png'
    },
    {
        id: 'alien',
        name: 'L\'Alien',
        description: 'Un extraterrestre curieux',
        price: 500,
        unlocked: false,
        path: '/assets/avatars/alien.png'
    }
];

/**
 * Charge les avatars disponibles pour l'utilisateur
 * @returns {Promise<Array>} Les avatars disponibles
 */
export async function loadAvailableAvatars() {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            return AVAILABLE_AVATARS;
        }

        // Récupérer les avatars débloqués depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', profile.uid));
        const userData = userDoc.data();
        const unlockedAvatars = userData?.unlockedAvatars || ['default'];

        // Mettre à jour la liste des avatars disponibles
        return AVAILABLE_AVATARS.map(avatar => ({
            ...avatar,
            unlocked: unlockedAvatars.includes(avatar.id)
        }));
    } catch (error) {
        console.error('Erreur lors du chargement des avatars:', error);
        return AVAILABLE_AVATARS;
    }
}

/**
 * Met à jour l'avatar de l'utilisateur
 * @param {string} avatarId - L'identifiant de l'avatar
 * @returns {Promise<Object>} L'avatar mis à jour
 */
export async function updateUserAvatar(avatarId) {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            throw new Error('Utilisateur non authentifié');
        }

        // Vérifier si l'avatar existe
        const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
        if (!avatar) {
            throw new Error('Avatar non trouvé');
        }

        // Vérifier si l'avatar est débloqué
        const userDoc = await getDoc(doc(db, 'users', profile.uid));
        const userData = userDoc.data();
        const unlockedAvatars = userData?.unlockedAvatars || ['default'];

        if (!unlockedAvatars.includes(avatarId)) {
            throw new Error('Avatar non débloqué');
        }

        // Mettre à jour l'avatar dans Firestore
        await updateDoc(doc(db, 'users', profile.uid), {
            currentAvatar: avatarId,
            updatedAt: new Date().toISOString()
        });

        // Mettre à jour le localStorage
        localStorage.setItem(STORAGE_KEYS.CURRENT_AVATAR, avatarId);

        // Déclencher un événement de mise à jour
        const event = new CustomEvent('avatar-updated', {
            detail: { avatar }
        });
        document.dispatchEvent(event);

        return avatar;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'avatar:', error);
        throw error;
    }
}

/**
 * Débloque un avatar
 * @param {string} avatarId - L'identifiant de l'avatar
 * @returns {Promise<Object>} L'avatar débloqué
 */
export async function unlockAvatar(avatarId) {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            throw new Error('Utilisateur non authentifié');
        }

        // Vérifier si l'avatar existe
        const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
        if (!avatar) {
            throw new Error('Avatar non trouvé');
        }

        // Vérifier si l'utilisateur a assez de pièces
        if (profile.coins < avatar.price) {
            throw new Error('Pas assez de pièces');
        }

        // Récupérer les avatars débloqués
        const userDoc = await getDoc(doc(db, 'users', profile.uid));
        const userData = userDoc.data();
        const unlockedAvatars = userData?.unlockedAvatars || ['default'];

        // Vérifier si l'avatar est déjà débloqué
        if (unlockedAvatars.includes(avatarId)) {
            return avatar;
        }

        // Mettre à jour dans Firestore
        await updateDoc(doc(db, 'users', profile.uid), {
            unlockedAvatars: [...unlockedAvatars, avatarId],
            coins: profile.coins - avatar.price,
            updatedAt: new Date().toISOString()
        });

        // Déclencher un événement de déblocage
        const event = new CustomEvent('avatar-unlocked', {
            detail: { avatar }
        });
        document.dispatchEvent(event);

        return avatar;
    } catch (error) {
        console.error('Erreur lors du déblocage de l\'avatar:', error);
        throw error;
    }
}

/**
 * Récupère l'avatar actuel de l'utilisateur
 * @returns {Promise<Object>} L'avatar actuel
 */
export async function getCurrentAvatar() {
    try {
        const profile = getCurrentProfile();
        if (!profile) {
            return AVAILABLE_AVATARS[0];
        }

        const userDoc = await getDoc(doc(db, 'users', profile.uid));
        const userData = userDoc.data();
        const currentAvatarId = userData?.currentAvatar || 'default';

        const avatar = AVAILABLE_AVATARS.find(a => a.id === currentAvatarId);
        return avatar || AVAILABLE_AVATARS[0];
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'avatar actuel:', error);
        return AVAILABLE_AVATARS[0];
    }
} 