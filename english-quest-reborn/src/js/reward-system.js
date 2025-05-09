/**
 * Système de récompenses pour les jeux English Quest
 * Gère l'attribution de pièces d'or et d'XP aux joueurs
 */

// Objet global pour le système de récompenses
window.RewardSystem = {
    /**
     * Ajoute des pièces d'or au profil du joueur
     * @param {number} amount - Quantité de pièces à ajouter
     * @param {string} source - Source de la récompense (nom du jeu)
     * @returns {Promise<boolean>} - Promesse résolue avec un booléen indiquant si l'opération a réussi
     */
    addCoins: function(amount, source) {
        return new Promise((resolve) => {
            console.log(`Ajout de ${amount} pièces d'or depuis ${source}`);

            // Vérifier si Firebase est disponible
            if (!window.firebase || !window.firebase.firestore) {
                console.warn("Firebase n'est pas disponible, utilisation du mode hors ligne");
                // Stocker la récompense localement
                this.storeOfflineReward('coins', amount, source);
                // Mettre à jour le profil local
                this.updateLocalProfile('coins', amount);
                // Afficher un message à l'utilisateur
                this.showRewardNotification(`+${amount} pièces d'or (mode hors ligne)`, 'success');
                resolve(true);
                return;
            }

            // Récupérer l'utilisateur actuel
            const currentUser = this.getCurrentUser();
            if (!currentUser || !currentUser.uid) {
                console.warn("Aucun utilisateur connecté, utilisation du mode hors ligne");
                // Stocker la récompense localement
                this.storeOfflineReward('coins', amount, source);
                // Sauvegarder dans localStorage pour le profil local
                this.updateLocalProfile('coins', amount);
                // Afficher un message à l'utilisateur
                this.showRewardNotification(`+${amount} pièces d'or (mode hors ligne)`, 'success');
                resolve(true);
                return;
            }

            const db = window.firebase.firestore();
            const userRef = db.collection('users').doc(currentUser.uid);

            // Mettre à jour le profil de l'utilisateur
            userRef.get().then((doc) => {
                if (doc.exists) {
                    // Récupérer le nombre actuel de pièces
                    const userData = doc.data();
                    const currentCoins = userData.coins || 0;
                    const newCoins = currentCoins + amount;

                    // Mettre à jour le document
                    userRef.update({
                        coins: newCoins,
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        console.log(`Pièces d'or mises à jour: ${currentCoins} -> ${newCoins}`);

                        // Enregistrer la transaction
                        this.logTransaction(currentUser.uid, 'coins', amount, source);

                        // Afficher un message à l'utilisateur
                        this.showRewardNotification(`+${amount} pièces d'or`, 'success');

                        resolve(true);
                    }).catch((error) => {
                        console.warn("Erreur lors de la mise à jour des pièces d'or:", error);
                        console.log("Utilisation du mode hors ligne");
                        // Stocker la récompense localement
                        this.storeOfflineReward('coins', amount, source);
                        this.showRewardNotification(`+${amount} pièces d'or (mode hors ligne)`, 'success');
                        resolve(true);
                    });
                } else {
                    // Créer un nouveau document pour l'utilisateur
                    userRef.set({
                        uid: currentUser.uid,
                        username: currentUser.username || 'Joueur',
                        coins: amount,
                        xp: 0,
                        level: 1,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        console.log(`Nouveau profil créé avec ${amount} pièces d'or`);

                        // Enregistrer la transaction
                        this.logTransaction(currentUser.uid, 'coins', amount, source);

                        // Afficher un message à l'utilisateur
                        this.showRewardNotification(`+${amount} pièces d'or`, 'success');

                        resolve(true);
                    }).catch((error) => {
                        console.warn("Erreur lors de la création du profil:", error);
                        console.log("Utilisation du mode hors ligne");
                        // Stocker la récompense localement
                        this.storeOfflineReward('coins', amount, source);
                        this.showRewardNotification(`+${amount} pièces d'or (mode hors ligne)`, 'success');
                        resolve(true);
                    });
                }
            }).catch((error) => {
                console.warn("Erreur lors de la récupération du profil:", error);
                console.log("Utilisation du mode hors ligne");
                // Stocker la récompense localement
                this.storeOfflineReward('coins', amount, source);
                this.showRewardNotification(`+${amount} pièces d'or (mode hors ligne)`, 'success');
                resolve(true);
            });
        });
    },

    /**
     * Ajoute de l'expérience au profil du joueur
     * @param {number} amount - Quantité d'XP à ajouter
     * @param {string} source - Source de la récompense (nom du jeu)
     * @returns {Promise<boolean>} - Promesse résolue avec un booléen indiquant si l'opération a réussi
     */
    addXP: function(amount, source) {
        return new Promise((resolve) => {
            console.log(`Ajout de ${amount} XP depuis ${source}`);

            // Vérifier si Firebase est disponible
            if (!window.firebase || !window.firebase.firestore) {
                console.warn("Firebase n'est pas disponible, utilisation du mode hors ligne");
                // Stocker la récompense localement
                this.storeOfflineReward('xp', amount, source);
                // Mettre à jour le profil local
                this.updateLocalProfile('xp', amount);
                // Afficher un message à l'utilisateur
                this.showRewardNotification(`+${amount} XP (mode hors ligne)`, 'success');
                resolve(true);
                return;
            }

            // Récupérer l'utilisateur actuel
            const currentUser = this.getCurrentUser();
            if (!currentUser || !currentUser.uid) {
                console.warn("Aucun utilisateur connecté, utilisation du mode hors ligne");
                // Stocker la récompense localement
                this.storeOfflineReward('xp', amount, source);
                // Sauvegarder dans localStorage pour le profil local
                this.updateLocalProfile('xp', amount);
                // Afficher un message à l'utilisateur
                this.showRewardNotification(`+${amount} XP (mode hors ligne)`, 'success');
                resolve(true);
                return;
            }

            const db = window.firebase.firestore();
            const userRef = db.collection('users').doc(currentUser.uid);

            // Mettre à jour le profil de l'utilisateur
            userRef.get().then((doc) => {
                if (doc.exists) {
                    // Récupérer les données actuelles
                    const userData = doc.data();
                    const currentXP = userData.xp || 0;
                    const currentLevel = userData.level || 1;

                    // Calculer le nouveau XP et le niveau
                    const newXP = currentXP + amount;
                    let newLevel = currentLevel;

                    // Vérifier si le joueur monte de niveau
                    // Formule: 100 * (niveau ^ 1.5) XP pour passer au niveau suivant
                    let xpForNextLevel = Math.floor(100 * Math.pow(currentLevel, 1.5));
                    let leveledUp = false;

                    if (newXP >= xpForNextLevel) {
                        newLevel = currentLevel + 1;
                        leveledUp = true;
                    }

                    // Mettre à jour le document
                    userRef.update({
                        xp: newXP,
                        level: newLevel,
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        console.log(`XP mis à jour: ${currentXP} -> ${newXP}`);
                        if (leveledUp) {
                            console.log(`Niveau augmenté: ${currentLevel} -> ${newLevel}`);
                            // Afficher un message de montée de niveau
                            this.showRewardNotification(`Niveau ${newLevel} atteint !`, 'level-up');
                        }

                        // Enregistrer la transaction
                        this.logTransaction(currentUser.uid, 'xp', amount, source);

                        // Afficher un message à l'utilisateur
                        this.showRewardNotification(`+${amount} XP`, 'success');

                        resolve(true);
                    }).catch((error) => {
                        console.warn("Erreur lors de la mise à jour de l'XP:", error);
                        console.log("Utilisation du mode hors ligne");
                        // Stocker la récompense localement
                        this.storeOfflineReward('xp', amount, source);
                        this.showRewardNotification(`+${amount} XP (mode hors ligne)`, 'success');
                        resolve(true);
                    });
                } else {
                    // Créer un nouveau document pour l'utilisateur
                    userRef.set({
                        uid: currentUser.uid,
                        username: currentUser.username || 'Joueur',
                        coins: 0,
                        xp: amount,
                        level: 1,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        console.log(`Nouveau profil créé avec ${amount} XP`);

                        // Enregistrer la transaction
                        this.logTransaction(currentUser.uid, 'xp', amount, source);

                        // Afficher un message à l'utilisateur
                        this.showRewardNotification(`+${amount} XP`, 'success');

                        resolve(true);
                    }).catch((error) => {
                        console.warn("Erreur lors de la création du profil:", error);
                        console.log("Utilisation du mode hors ligne");
                        // Stocker la récompense localement
                        this.storeOfflineReward('xp', amount, source);
                        this.showRewardNotification(`+${amount} XP (mode hors ligne)`, 'success');
                        resolve(true);
                    });
                }
            }).catch((error) => {
                console.warn("Erreur lors de la récupération du profil:", error);
                console.log("Utilisation du mode hors ligne");
                // Stocker la récompense localement
                this.storeOfflineReward('xp', amount, source);
                this.showRewardNotification(`+${amount} XP (mode hors ligne)`, 'success');
                resolve(true);
            });
        });
    },

    /**
     * Enregistre une transaction dans l'historique
     * @param {string} userId - ID de l'utilisateur
     * @param {string} type - Type de transaction ('coins' ou 'xp')
     * @param {number} amount - Montant de la transaction
     * @param {string} source - Source de la transaction
     */
    logTransaction: function(userId, type, amount, source) {
        try {
            if (!window.firebase || !window.firebase.firestore) {
                console.warn("Firebase n'est pas disponible pour enregistrer la transaction");
                // Stocker la transaction localement
                this.storeOfflineTransaction(userId, type, amount, source);
                return;
            }

            const db = window.firebase.firestore();

            db.collection('transactions').add({
                userId: userId,
                type: type,
                amount: amount,
                source: source,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                offline: false
            }).then(() => {
                console.log(`Transaction enregistrée: ${type} +${amount} depuis ${source}`);
            }).catch((error) => {
                console.warn("Erreur lors de l'enregistrement de la transaction:", error);
                // Stocker la transaction localement en cas d'erreur
                this.storeOfflineTransaction(userId, type, amount, source);
            });
        } catch (error) {
            console.warn("Erreur lors de l'enregistrement de la transaction:", error);
            // Stocker la transaction localement en cas d'erreur
            this.storeOfflineTransaction(userId, type, amount, source);
        }
    },

    /**
     * Stocke une transaction en mode hors ligne
     * @param {string} userId - ID de l'utilisateur
     * @param {string} type - Type de transaction ('coins' ou 'xp')
     * @param {number} amount - Montant de la transaction
     * @param {string} source - Source de la transaction
     */
    storeOfflineTransaction: function(userId, type, amount, source) {
        try {
            // Récupérer les transactions existantes
            let offlineTransactions = JSON.parse(localStorage.getItem('offlineTransactions')) || [];

            // Ajouter la nouvelle transaction
            offlineTransactions.push({
                userId: userId || 'anonymous',
                type: type,
                amount: amount,
                source: source,
                timestamp: new Date().toISOString(),
                offline: true
            });

            // Sauvegarder dans le localStorage
            localStorage.setItem('offlineTransactions', JSON.stringify(offlineTransactions));

            console.log(`Transaction stockée en mode hors ligne: ${type} +${amount} depuis ${source}`);
        } catch (error) {
            console.error("Erreur lors du stockage de la transaction hors ligne:", error);
        }
    },

    /**
     * Stocke une récompense en mode hors ligne
     * @param {string} type - Type de récompense ('coins' ou 'xp')
     * @param {number} amount - Montant de la récompense
     * @param {string} source - Source de la récompense
     */
    storeOfflineReward: function(type, amount, source) {
        try {
            // Récupérer les récompenses existantes
            let offlineRewards = JSON.parse(localStorage.getItem('offlineRewards')) || [];

            // Ajouter la nouvelle récompense
            offlineRewards.push({
                type: type,
                amount: amount,
                source: source,
                timestamp: new Date().toISOString()
            });

            // Sauvegarder dans le localStorage
            localStorage.setItem('offlineRewards', JSON.stringify(offlineRewards));

            console.log(`Récompense stockée en mode hors ligne: ${amount} ${type} depuis ${source}`);

            // Mettre à jour les compteurs locaux
            if (type === 'coins') {
                let localCoins = parseInt(localStorage.getItem('localCoins') || '0');
                localCoins += amount;
                localStorage.setItem('localCoins', localCoins.toString());
                console.log(`Pièces d'or locales: ${localCoins}`);

                // Mettre à jour le profil local
                this.updateLocalProfile('coins', amount);
            } else if (type === 'xp') {
                let localXP = parseInt(localStorage.getItem('localXP') || '0');
                localXP += amount;
                localStorage.setItem('localXP', localXP.toString());
                console.log(`XP local: ${localXP}`);

                // Mettre à jour le profil local
                this.updateLocalProfile('xp', amount);
            }
        } catch (error) {
            console.error("Erreur lors du stockage de la récompense hors ligne:", error);
        }
    },

    /**
     * Récupère l'utilisateur actuellement connecté
     * @returns {Object|null} L'utilisateur connecté ou null
     */
    getCurrentUser: function() {
        // Utiliser la fonction getCurrentUser globale si disponible
        if (typeof window.getCurrentUser === 'function') {
            return window.getCurrentUser();
        }

        // Fallback sur Firebase Auth
        if (window.firebase && window.firebase.auth) {
            const user = window.firebase.auth().currentUser;
            if (user) {
                return {
                    uid: user.uid,
                    username: user.displayName || (user.email ? user.email.split('@')[0] : 'Joueur'),
                    email: user.email || 'anonymous@example.com'
                };
            }
        }

        // Fallback sur authState
        if (window.authState && window.authState.profile) {
            return window.authState.profile;
        }

        return null;
    },

    /**
     * Affiche une notification de récompense à l'utilisateur
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification ('success', 'error', 'level-up')
     */
    showRewardNotification: function(message, type) {
        // Créer l'élément de notification s'il n'existe pas
        let notificationContainer = document.getElementById('reward-notifications');

        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'reward-notifications';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '9999';
            document.body.appendChild(notificationContainer);
        }

        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `reward-notification ${type}`;
        notification.innerHTML = message;

        // Styles de base pour la notification
        notification.style.padding = '12px 20px';
        notification.style.marginBottom = '10px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '16px';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';

        // Styles spécifiques selon le type
        if (type === 'success') {
            notification.style.backgroundColor = '#2ecc71';
            notification.style.color = '#fff';
            notification.style.borderLeft = '5px solid #27ae60';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#e74c3c';
            notification.style.color = '#fff';
            notification.style.borderLeft = '5px solid #c0392b';
        } else if (type === 'level-up') {
            notification.style.backgroundColor = '#3498db';
            notification.style.color = '#fff';
            notification.style.borderLeft = '5px solid #2980b9';
        }

        // Ajouter la notification au conteneur
        notificationContainer.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Supprimer la notification après un délai
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(50px)';

            setTimeout(() => {
                notificationContainer.removeChild(notification);
            }, 300);
        }, 3000);
    },

    /**
     * Met à jour le profil local avec les récompenses
     * @param {string} type - Type de récompense ('coins' ou 'xp')
     * @param {number} amount - Quantité à ajouter
     */
    updateLocalProfile: function(type, amount) {
        try {
            console.log(`Mise à jour du profil local: ${amount} ${type}`);

            // Récupérer l'utilisateur actuel depuis le système d'authentification local
            let currentUser = null;
            if (typeof window.getCurrentUser === 'function') {
                currentUser = window.getCurrentUser();
                console.log("Utilisateur actuel récupéré:", currentUser ? currentUser.username : "Aucun");
            }

            if (!currentUser) {
                console.warn("Aucun utilisateur connecté pour mettre à jour le profil");
                return;
            }

            // Mettre à jour les données de l'utilisateur
            if (type === 'coins') {
                currentUser.coins = (currentUser.coins || 0) + amount;
                console.log(`Pièces d'or mises à jour: ${currentUser.coins}`);
            } else if (type === 'xp') {
                currentUser.xp = (currentUser.xp || 0) + amount;
                currentUser.level = currentUser.level || 1;

                // Vérifier si le joueur monte de niveau
                const xpToNextLevel = Math.floor(100 * Math.pow(1.5, currentUser.level - 1));
                if (currentUser.xp >= xpToNextLevel) {
                    currentUser.xp -= xpToNextLevel;
                    currentUser.level++;
                    console.log(`Niveau supérieur ! Niveau ${currentUser.level}`);

                    // Afficher une notification de montée de niveau
                    this.showRewardNotification(`Niveau ${currentUser.level} atteint !`, 'level-up');
                }

                console.log(`XP mis à jour: ${currentUser.xp}, niveau ${currentUser.level}`);
            }

            // Sauvegarder les modifications dans le système d'authentification local
            if (typeof window.setCurrentUser === 'function') {
                window.setCurrentUser(currentUser);
                console.log("Utilisateur mis à jour dans le système d'authentification local");
            }

            // Mettre à jour également le profil dans la liste des utilisateurs
            if (typeof window.getUsers === 'function' && typeof window.saveUsers === 'function') {
                const users = window.getUsers();
                const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

                if (userId) {
                    users[userId] = currentUser;
                    window.saveUsers(users);
                    console.log("Utilisateur mis à jour dans la liste des utilisateurs");
                }
            }

            // Mettre à jour l'interface utilisateur si nécessaire
            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }

            // Mettre à jour également le profil local pour la compatibilité
            let profile = JSON.parse(localStorage.getItem('userProfile')) || {
                coins: 0,
                xp: 0,
                level: 1,
                username: currentUser.username
            };

            // Mettre à jour le profil local
            if (type === 'coins') {
                profile.coins = currentUser.coins;
            } else if (type === 'xp') {
                profile.xp = currentUser.xp;
                profile.level = currentUser.level;
            }

            // Sauvegarder le profil local
            localStorage.setItem('userProfile', JSON.stringify(profile));
            console.log("Profil local mis à jour");

        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil local:", error);
        }
    }
};

// Ajouter un écouteur d'événement pour les high scores
document.addEventListener('highScoreAchieved', function(event) {
    const detail = event.detail;

    // Ne pas attribuer de récompenses si elles ont déjà été attribuées
    if (detail && detail.game === 'speed-verb-challenge' && !detail.rewardAlreadyGiven) {
        console.log("Récompense pour high score via l'événement highScoreAchieved");

        // Récompenser le joueur avec 100 pièces d'or
        window.RewardSystem.addCoins(100, 'Speed Verb Challenge - High Score');

        // Récompenser le joueur avec de l'XP (basé sur le score)
        const xpAmount = Math.floor(detail.score / 2);
        window.RewardSystem.addXP(xpAmount, 'Speed Verb Challenge - High Score');
    } else if (detail && detail.rewardAlreadyGiven) {
        console.log("Récompense déjà attribuée, ignoré dans l'écouteur d'événement");
    }
});

console.log("Système de récompenses initialisé");
