// Assumes firebaseServiceInstance and authService are available on window or imported if modularized.

const SpeedVerbLeaderboard = {
    leaderboardBody: null,
    leaderboardIdInternal: 'speed-verb-challenge', // Game ID for this leaderboard instance

    init(elementId) { // elementId is the ID of the tbody for the leaderboard
        this.leaderboardBody = document.getElementById(elementId);
        if (!this.leaderboardBody) {
            console.error(\`[SVL] Leaderboard tbody element with ID '\${elementId}' not found.\`);
            return;
        }
        console.log(\`[SVL] Initialized for \${this.leaderboardIdInternal}\`);
        this.loadScores(); // Initial load

        // Optional: Listen for auth changes to refresh or get player name
        window.authService?.subscribeToAuthState(auth => {
            if (auth.isAuthenticated) this.loadScores(); // Refresh if user logs in
        });
    },

    async getPlayerInfo() {
        const authState = window.authService?.getAuthState();
        if (authState?.isAuthenticated && authState.profile) {
            return { 
                userId: authState.profile.userId, 
                playerName: authState.profile.username || 'Joueur Anonyme' 
            };
        }
        return { userId: null, playerName: 'Joueur Anonyme' };
    },

    async loadScores() {
        if (!this.leaderboardBody) return;
        this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="loading-scores">Chargement des scores...</td></tr>';

        try {
            // Using firebaseServiceInstance to query Firestore
            const scoresQuery = window.firebaseServiceInstance.db.collection('game_scores')
                .where('gameId', '==', this.leaderboardIdInternal)
                .orderBy('score', 'desc')
                .limit(10);
            
            const querySnapshot = await scoresQuery.get();

            if (querySnapshot.empty) {
                this.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aucun score. Soyez le premier !</td></tr>';
                return;
            }

            let html = '';
            let rank = 1;
            const playerInfo = await this.getPlayerInfo();

            querySnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp ? new Date(data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp).toLocaleDateString() : 'N/A';
                
                let rankClass = '';
                if (rank === 1) rankClass = 'rank-gold';
                else if (rank === 2) rankClass = 'rank-silver';
                else if (rank === 3) rankClass = 'rank-bronze';

                const isCurrentPlayer = playerInfo.userId && data.userId === playerInfo.userId;
                if (isCurrentPlayer) rankClass += ' current-player';

                html += \`
                    <tr class="\${rankClass}">
                        <td class="rank-cell">\${rank}</td>
                        <td class="player-cell">\${data.playerName || 'Anonyme'} \${isCurrentPlayer ? '(Vous)' : ''}</td>
                        <td class="score-cell">\${data.score}</td>
                        <td class="date-cell">\${date}</td>
                    </tr>
                \`;
                rank++;
            });
            this.leaderboardBody.innerHTML = html;
        } catch (error) {
            console.error("[SVL] Error loading scores:", error);
            this.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Erreur chargement scores.</td></tr>';
        }
    },

    async saveScore(currentScore, currentLevel, verbsCompletedCount, gameDifficulty) {
        const playerInfo = await this.getPlayerInfo();

        if (!playerInfo.userId) {
            console.warn("[SVL] User not authenticated, cannot save score to server.");
            // Optionally, save to localStorage here if offline support is robustly needed
            // For now, we just prevent server save.
            alert("Vous devez être connecté pour sauvegarder votre score en ligne.");
            return false; 
        }

        const scoreData = {
            userId: playerInfo.userId,
            playerName: playerInfo.playerName,
            gameId: this.leaderboardIdInternal,
            score: currentScore,
            level: currentLevel, // Player's level at time of game
            verbsCompleted: verbsCompletedCount,
            difficulty: gameDifficulty,
            timestamp: new Date() // firebase.service.addScore will handle server timestamp if needed
        };

        try {
            // Use firebaseServiceInstance.addScore
            // addScore in firebase.service.js should handle setDoc with auto-ID to 'game_scores'
            await window.firebaseServiceInstance.addScore(scoreData);
            console.log("[SVL] Score submission attempted for user:", playerInfo.playerName, scoreData);
            this.loadScores(); // Refresh leaderboard
            
            // Check if it's a high score (optional, can be complex)
            // For simplicity, this check is removed from here. Game can show "New High Score!" based on local comparison.
            
            // Dispatch event that speed-verb-challenge.js listens for
            document.dispatchEvent(new CustomEvent('scoreSubmitted', {
                detail: { success: true, playerName: playerInfo.playerName, score: currentScore, isHighScore: false, offline: false }
            }));
            return true;
        } catch (error) {
            console.error("[SVL] Error saving score via firebaseServiceInstance:", error);
            // Dispatch event with error
             document.dispatchEvent(new CustomEvent('scoreSubmitted', {
                detail: { success: false, error: error.message, offline: !(window.navigator.onLine) }
            }));
            return false;
        }
    },

    // isHighScore can be complex and might be better handled by comparing to currently loaded scores
    // or a dedicated Cloud Function if strictness is needed.
    // For client-side, a simple check against loaded scores:
    async isHighScore(score) {
        if (!this.leaderboardBody || this.leaderboardBody.firstChild?.textContent.includes("Aucun score")) {
            return true; // If leaderboard is empty, any score is a high score
        }
        // This is a naive check, assumes leaderboard scores are loaded and sorted.
        const rows = this.leaderboardBody.querySelectorAll('tr');
        if (rows.length < 10) return true; // Automatically a high score if less than 10 scores
        const lastScoreCell = rows[rows.length - 1]?.querySelector('.score-cell');
        if (lastScoreCell) {
            return score > parseInt(lastScoreCell.textContent);
        }
        return true; // Default to true if cannot determine
    }
};

window.SpeedVerbLeaderboard = SpeedVerbLeaderboard; // Make it global if other scripts expect this
