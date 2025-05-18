/**
 * Service de gestion des avatars pour English Quest Reborn
 */

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
        unlocked: true
    },
    {
        id: 'wizard',
        name: 'Le Magicien',
        description: 'Un magicien mystérieux',
        price: 100,
        unlocked: false
    },
    {
        id: 'knight',
        name: 'Le Chevalier',
        description: 'Un chevalier courageux',
        price: 200,
        unlocked: false
    },
    {
        id: 'ninja',
        name: 'Le Ninja',
        description: 'Un ninja silencieux',
        price: 300,
        unlocked: false
    },
    {
        id: 'robot',
        name: 'Le Robot',
        description: 'Un robot futuriste',
        price: 400,
        unlocked: false
    },
    {
        id: 'alien',
        name: 'L\'Alien',
        description: 'Un extraterrestre curieux',
        price: 500,
        unlocked: false
    }
];

/**
 * Charge les avatars disponibles pour l'utilisateur
 * @returns {Promise<Array>} Les avatars disponibles
 */
export async function loadAvailableAvatars() {
    try {
        // Récupérer les avatars débloqués depuis le localStorage
        const unlockedAvatarsJson = localStorage.getItem(STORAGE_KEYS.AVATARS);
        const unlockedAvatars = unlockedAvatarsJson ? JSON.parse(unlockedAvatarsJson) : ['default'];

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
        // Vérifier si l'avatar existe
        const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
        if (!avatar) {
            throw new Error('Avatar non trouvé');
        }

        // Vérifier si l'avatar est débloqué
        const unlockedAvatarsJson = localStorage.getItem(STORAGE_KEYS.AVATARS);
        const unlockedAvatars = unlockedAvatarsJson ? JSON.parse(unlockedAvatarsJson) : ['default'];

        if (!unlockedAvatars.includes(avatarId)) {
            throw new Error('Avatar non débloqué');
        }

        // Mettre à jour l'avatar courant
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
        // Vérifier si l'avatar existe
        const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
        if (!avatar) {
            throw new Error('Avatar non trouvé');
        }

        // Récupérer les avatars débloqués
        const unlockedAvatarsJson = localStorage.getItem(STORAGE_KEYS.AVATARS);
        const unlockedAvatars = unlockedAvatarsJson ? JSON.parse(unlockedAvatarsJson) : ['default'];

        // Vérifier si l'avatar est déjà débloqué
        if (unlockedAvatars.includes(avatarId)) {
            return avatar;
        }

        // Ajouter l'avatar aux avatars débloqués
        unlockedAvatars.push(avatarId);
        localStorage.setItem(STORAGE_KEYS.AVATARS, JSON.stringify(unlockedAvatars));

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
        const avatarId = localStorage.getItem(STORAGE_KEYS.CURRENT_AVATAR) || 'default';
        const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
        return avatar || AVAILABLE_AVATARS[0];
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'avatar actuel:', error);
        return AVAILABLE_AVATARS[0];
    }
} 