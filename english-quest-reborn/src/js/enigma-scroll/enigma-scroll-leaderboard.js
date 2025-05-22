// Assumes EnigmaScrollFirebase and authService are globally available.

window.EnigmaScrollLeaderboard = {
    leaderboardContent: null, // The div where leaderboard HTML is injected
    leaderboardId: 'enigma-scroll', // Game ID, used if needed by a generic display func
    initialized: false,
    currentDifficultyForDisplay: 'intermediate', // Default or last selected

    init(contentId) { // contentId is the ID of the DIV for leaderboard content
        this.leaderboardContent = document.getElementById(contentId);
        if (!this.leaderboardContent) {
            console.error(\`[ESL] Leaderboard content element with ID '\${contentId}' not found.\`);
            return;
        }
        console.log(\`[ESL] Initialized for \${this.leaderboardId}\`);
        this.initialized = true;
        this.loadScores(); // Initial load for default timeframe/difficulty

        // Optional: Listen for auth changes to refresh or get player name
        window.authService?.subscribeToAuthState(auth => {
            if (auth.isAuthenticated) this.loadScores(); 
        });
        
        // Setup tabs if they exist (from enigma-scroll index.html)
        this.setupLeaderboardTabs();
    },

    setupLeaderboardTabs() {
        const tabs = document.querySelectorAll('.leaderboard-area .leaderboard-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const timeFrame = tab.dataset.tab; // 'daily', 'weekly', 'alltime'
                // Potentially add difficulty selector interaction here if needed
                this.loadScores(timeFrame, this.currentDifficultyForDisplay);
            });
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

    async loadScores(timeFrame = 'alltime', difficulty = this.currentDifficultyForDisplay) {
        if (!this.initialized || !this.leaderboardContent) {
            console.error("[ESL] Leaderboard not initialized or content element missing.");
            return;
        }
        this.leaderboardContent.innerHTML = '<div class="leaderboard-loading">Chargement des scores...</div>';
        
        // Update current difficulty if a new one is passed
        if (difficulty) this.currentDifficultyForDisplay = difficulty;

        try {
            // Scores are fetched via EnigmaScrollFirebase.getTopScores, which uses firebaseServiceInstance
            const scores = await window.EnigmaScrollFirebase.getTopScores(timeFrame, this.currentDifficultyForDisplay, 10);

            if (!scores || scores.length === 0) {
                this.leaderboardContent.innerHTML = '<div class="leaderboard-empty">Aucun score à afficher. Soyez le premier !</div>';
                return;
            }

            let html = \`
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th class="rank-header">Rang</th>
                            <th class="player-header">Joueur</th>
                            <th class="score-header">Score</th>
                            <th class="difficulty-header">Difficulté</th>
                            <th class="date-header">Date</th>
                        </tr>
                    </thead>
                    <tbody>
            \`;
            
            const playerInfo = await this.getPlayerInfo();
            let rank = 1;

            scores.forEach(scoreEntry => {
                const date = scoreEntry.timestamp ? new Date(scoreEntry.timestamp).toLocaleDateString() : 'N/A';
                let rankClass = '';
                if (rank === 1) rankClass = 'rank-gold';
                else if (rank === 2) rankClass = 'rank-silver';
                else if (rank === 3) rankClass = 'rank-bronze';

                const isCurrentPlayer = playerInfo.userId && scoreEntry.userId === playerInfo.userId;
                if (isCurrentPlayer) rankClass += ' current-player';

                html += \`
                    <tr class="\${rankClass}">
                        <td class="rank-cell">\${rank}</td>
                        <td class="player-cell">\${scoreEntry.username || 'Anonyme'} \${isCurrentPlayer ? '(Vous)' : ''}</td>
                        <td class="score-cell">\${scoreEntry.score}</td>
                        <td class="difficulty-cell">\${scoreEntry.difficulty || 'N/A'}</td>
                        <td class="date-cell">\${date}</td>
                    </tr>
                \`;
                rank++;
            });

            html += '</tbody></table>';
            this.leaderboardContent.innerHTML = html;

        } catch (error) {
            console.error("[ESL] Error loading scores:", error);
            this.leaderboardContent.innerHTML = '<div class="leaderboard-error">Erreur lors du chargement des scores.</div>';
        }
    },

    // saveScore is now primarily handled by enigma-scroll.js calling EnigmaScrollFirebase.saveScore,
    // which then calls firebaseServiceInstance.addScore.
    // This leaderboard script is now mainly for display.
    // If EnigmaScrollLeaderboard.saveScore was called externally, it should delegate.
    async saveScore(scoreData) { // scoreData should come from game logic
        if (window.EnigmaScrollFirebase && typeof window.EnigmaScrollFirebase.saveScore === 'function') {
            try {
                // Ensure gameId is part of scoreData if not already
                scoreData.gameId = scoreData.gameId || this.leaderboardId;
                await window.EnigmaScrollFirebase.saveScore(scoreData.score, scoreData); // Pass score and then full gameData object
                this.loadScores(); // Refresh after saving
                return true;
            } catch (error) {
                console.error("[ESL] Error delegating score saving:", error);
                return false;
            }
        } else {
            console.error("[ESL] EnigmaScrollFirebase.saveScore is not available.");
            return false;
        }
    }
};

window.EnigmaScrollLeaderboard = EnigmaScrollLeaderboard;
// Note: enigma-scroll.js should call EnigmaScrollLeaderboard.init('leaderboard-content');
// where 'leaderboard-content' is the ID of the div meant to display the table.
// The HTML for Enigma Scroll has <div id="leaderboard-content" class="leaderboard-content">.
// This script assumes init() is called with the correct ID for the content area.
