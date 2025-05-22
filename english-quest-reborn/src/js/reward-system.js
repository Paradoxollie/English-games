// Assumes authService is available on window or correctly imported where RewardSystem is used.

window.RewardSystem = {
    async addCoins(amount, source) {
        console.log(\`[RewardSystem] Attempting to add \${amount} PENDING coins from \${source}\`);
        const authState = window.authService?.getAuthState(); 
        if (!authState?.isAuthenticated || !authState.profile) {
            console.warn("[RewardSystem] User not authenticated for addCoins. Storing pending coins offline.");
            this.storeOfflineReward('pendingCoins', amount, source); // Store as pendingCoins
            this.showRewardNotification(\`+\${amount} pièces en attente (hors ligne)\`, 'success');
            return false; 
        }

        const profile = authState.profile;
        const newPendingCoins = (profile.pendingCoins || 0) + amount;

        try {
            await window.authService.updateUserProfile({ pendingCoins: newPendingCoins });
            console.log(\`[RewardSystem] pendingCoins update attempted for \${profile.username}. New pendingCoins: \${newPendingCoins}.\`);
            this.showRewardNotification(\`+\${amount} pièces en attente\`, 'success');
            return true;
        } catch (error) {
            console.error(\`[RewardSystem] Error updating pendingCoins for \${profile.username}: \${error.message}. Storing offline.\`);
            this.storeOfflineReward('pendingCoins', amount, source);
            this.showRewardNotification(\`+\${amount} pièces en attente (hors ligne - erreur)\`, 'success');
            return false;
        }
    },

    async addXP(amount, source) {
        console.log(\`[RewardSystem] Attempting to add \${amount} PENDING XP from \${source}\`);
        const authState = window.authService?.getAuthState();
        if (!authState?.isAuthenticated || !authState.profile) {
            console.warn("[RewardSystem] User not authenticated for addXP. Storing pending XP offline.");
            this.storeOfflineReward('pendingXP', amount, source); // Store as pendingXP
            this.showRewardNotification(\`+\${amount} XP en attente (hors ligne)\`, 'success');
            return false;
        }

        const profile = authState.profile;
        const newPendingXP = (profile.pendingXP || 0) + amount;

        try {
            // Level-up logic is REMOVED here. It will be handled by admin panel when approving pendingXP.
            await window.authService.updateUserProfile({ pendingXP: newPendingXP });
            console.log(\`[RewardSystem] pendingXP update attempted for \${profile.username}. New pendingXP: \${newPendingXP}.\`);
            this.showRewardNotification(\`+\${amount} XP en attente\`, 'success');
            return true;
        } catch (error) {
            console.error(\`[RewardSystem] Error updating pendingXP for \${profile.username}: \${error.message}. Storing offline.\`);
            this.storeOfflineReward('pendingXP', amount, source);
            this.showRewardNotification(\`+\${amount} XP en attente (hors ligne - erreur)\`, 'success');
            return false;
        }
    },

    storeOfflineReward(type, amount, source) { // type will now be 'pendingCoins' or 'pendingXP'
        try {
            let offlineRewards = JSON.parse(localStorage.getItem('offlineRewards_eqr')) || [];
            offlineRewards.push({ type, amount, source, timestamp: new Date().toISOString() });
            localStorage.setItem('offlineRewards_eqr', JSON.stringify(offlineRewards));
            console.log(\`[RewardSystem] Stored offline: \${amount} \${type} from \${source}\`);
        } catch (e) {
            console.error("[RewardSystem] Error storing offline reward:", e);
        }
    },

    showRewardNotification(message, type) {
        let container = document.getElementById('reward-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'reward-notifications';
            container.style.position = 'fixed'; container.style.top = '20px'; container.style.right = '20px'; container.style.zIndex = '1050';
            document.body.appendChild(container);
        }
        const notif = document.createElement('div');
        notif.className = \`reward-notification \${type}\`;
        notif.textContent = message;
        notif.style.padding = '10px 20px'; notif.style.marginBottom = '10px'; notif.style.borderRadius = '5px';
        notif.style.color = 'white'; notif.style.minWidth = '200px';
        if(type === 'success') notif.style.backgroundColor = 'green';
        else if(type === 'error') notif.style.backgroundColor = 'red';
        else if(type === 'level-up') notif.style.backgroundColor = 'blue'; // Will be used by admin panel later
        else notif.style.backgroundColor = 'gray';

        container.appendChild(notif);
        setTimeout(() => { notif.remove(); }, 5000);
    },

    async processOfflineRewards() {
        let offlineRewards = JSON.parse(localStorage.getItem('offlineRewards_eqr')) || [];
        if (offlineRewards.length === 0) return;

        console.log('[RewardSystem] Processing offline rewards for pending system...', offlineRewards);
        let stillOffline = []; 

        for (const reward of offlineRewards) {
            let success = false;
            // Types are now 'pendingCoins', 'pendingXP'
            if (reward.type === 'pendingCoins') {
                success = await this.addCoins(reward.amount, reward.source + " (offline sync)");
            } else if (reward.type === 'pendingXP') {
                success = await this.addXP(reward.amount, reward.source + " (offline sync)");
            }
            // Removed 'levelUp' offline type as level up is admin-driven now

            if (!success) {
                stillOffline.push(reward); 
            }
        }
        localStorage.setItem('offlineRewards_eqr', JSON.stringify(stillOffline));
        if (stillOffline.length < offlineRewards.length) {
             this.showRewardNotification('Récompenses hors ligne (en attente) synchronisées!', 'success');
        }
        if (stillOffline.length > 0) {
            this.showRewardNotification(\`\${stillOffline.length} récompenses hors ligne (en attente) n'ont pas pu être synchronisées.\`, 'error');
        }
    }
};

// Consider when to call processOfflineRewards. 
// It should be after authService is initialized and user is logged in.
// Example: document.addEventListener('authInitializedAndUserPresent', () => window.RewardSystem.processOfflineRewards());

console.log("RewardSystem refactored for pendingXP/pendingCoins.");
