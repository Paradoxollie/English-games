// Système de leaderboard pour Enigma Scroll - Compatible avec firebaseServiceInstance

window.EnigmaScrollLeaderboard = {
    leaderboardBody: null, // Le tbody où les lignes du leaderboard sont injectées
    leaderboardId: 'enigma-scroll', // ID du jeu
    initialized: false,
    currentDifficultyForDisplay: 'intermediate', // 'all' pour afficher toutes les difficultés
    currentScoreType: 'local', // 'local' ou 'online'

    init(bodyId) { // bodyId est l'ID du TBODY pour les lignes du leaderboard
        if (typeof bodyId === 'string') {
            this.leaderboardBody = document.getElementById(bodyId);
        } else if (bodyId && bodyId.tagName) {
            this.leaderboardBody = bodyId;
        } else {
            // Fallback : chercher automatiquement le tbody du leaderboard
            this.leaderboardBody = document.querySelector('#enigma-scroll-leaderboard tbody');
        }

        if (!this.leaderboardBody) {
            console.error(`[ESL] Leaderboard body element not found with ID '${bodyId}' ou fallback`);
            return false;
        }

        this.initialized = true;
        this.setupToggleButtons();
        
        // Charger les scores locaux par défaut
        this.loadScores();
        
        console.log(`[ESL] Leaderboard initialized with body element:`, this.leaderboardBody);
        return true;
    },

    setupToggleButtons() {
        const localBtn = document.getElementById('local-scores-btn');
        const onlineBtn = document.getElementById('online-scores-btn');
        
        if (localBtn && onlineBtn) {
            localBtn.addEventListener('click', () => {
                this.switchToLocalScores();
            });
            
            onlineBtn.addEventListener('click', () => {
                this.switchToOnlineScores();
            });
        }
    },

    switchToLocalScores() {
        const localBtn = document.getElementById('local-scores-btn');
        const onlineBtn = document.getElementById('online-scores-btn');
        
        if (localBtn && onlineBtn) {
            localBtn.classList.add('active');
            onlineBtn.classList.remove('active');
        }
        
        this.currentScoreType = 'local';
        this.displayLocalScores();
    },

    switchToOnlineScores() {
        const localBtn = document.getElementById('local-scores-btn');
        const onlineBtn = document.getElementById('online-scores-btn');
        
        if (localBtn && onlineBtn) {
            onlineBtn.classList.add('active');
            localBtn.classList.remove('active');
        }
        
        this.currentScoreType = 'online';
        this.loadOnlineScores();
    },

    setupLeaderboardTabs() {
        const tabs = document.querySelectorAll('.leaderboard-area .leaderboard-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const timeFrame = tab.dataset.tab; // 'daily', 'weekly', 'alltime'
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
        if (!this.initialized || !this.leaderboardBody) {
            console.error("[ESL] Leaderboard not initialized or body element missing.");
            return;
        }
        
        // Mettre à jour la difficulté actuelle si une nouvelle est fournie
        if (difficulty) this.currentDifficultyForDisplay = difficulty;

        // Charger les scores selon le type sélectionné
        if (this.currentScoreType === 'local') {
            this.displayLocalScores();
        } else {
            this.loadOnlineScores(timeFrame, difficulty);
        }
    },

    async loadOnlineScores(timeFrame = 'alltime', difficulty = null) {
        this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="loading-scores">Chargement des scores en ligne...</td></tr>';
        
        try {
            // Attendre un peu que Firebase soit disponible
            let retryCount = 0;
            const maxRetries = 5;
            
            while (retryCount < maxRetries) {
                if (window.EnigmaScrollFirebase && window.EnigmaScrollFirebase.isAvailable) {
                    console.log(`[ESL] Firebase disponible après ${retryCount + 1} tentative(s)`);
                    break;
                }
                
                console.log(`[ESL] Attente de Firebase... tentative ${retryCount + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1000ms
                retryCount++;
            }
            
            // Vérifier si EnigmaScrollFirebase est disponible après les tentatives
            if (!window.EnigmaScrollFirebase || !window.EnigmaScrollFirebase.isAvailable) {
                console.warn("[ESL] Firebase non disponible après plusieurs tentatives, basculement vers scores locaux");
                this.switchToLocalScores();
                return;
            }

            // Les scores sont récupérés via EnigmaScrollFirebase.getTopScores
            // Ne pas filtrer par difficulté pour éviter les problèmes d'index Firebase
            const scores = await window.EnigmaScrollFirebase.getTopScores(timeFrame, null, 15);

            if (!scores || scores.length === 0) {
                this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="leaderboard-empty">Aucun score en ligne à afficher. Soyez le premier !</td></tr>';
                return;
            }

            this.displayScores(scores);

        } catch (error) {
            console.error("[ESL] Error loading online scores:", error);
            this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="leaderboard-error">Erreur lors du chargement des scores en ligne</td></tr>';
        }
    },

    // Fonction pour filtrer les utilisateurs de test
    isRealUser(username) {
        const testUsers = [
            'testuser', 'test user', 'test', 'demo', 'guest', 'invité', 
            'anonyme', 'anonymous', 'admin', 'default', 'user', 'player',
            'exemple', 'example', 'sample', 'fake', 'dummy'
        ];
        
        if (!username || username.trim() === '') {
            return false;
        }
        
        const lowerUsername = username.toLowerCase().trim();
        
        // Exclure les noms d'utilisateurs de test
        if (testUsers.includes(lowerUsername)) {
            return false;
        }
        
        // Exclure les noms qui commencent par "test"
        if (lowerUsername.startsWith('test')) {
            return false;
        }
        
        // Exclure les noms très courts ou génériques
        if (lowerUsername.length < 3) {
            return false;
        }
        
        return true;
    },

    displayScores(scores) {
        if (!this.leaderboardBody) {
            console.error("[ESL] Leaderboard body element not found.");
            return;
        }

        if (!scores || scores.length === 0) {
            this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="no-scores">Aucun score disponible pour le moment.</td></tr>';
            return;
        }

        // Filtrer pour ne garder que les vrais utilisateurs
        const realUserScores = scores.filter(score => this.isRealUser(score.username));
        
        if (realUserScores.length === 0) {
            this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="no-scores">Aucun score de vrais joueurs pour le moment.</td></tr>';
            return;
        }

        // Générer le HTML pour les scores
        let html = '';
        
        realUserScores.forEach((score, index) => {
            const rank = index + 1;
            const date = score.timestamp ? new Date(score.timestamp).toLocaleDateString() : 'N/A';
            const difficulty = score.difficulty || 'intermediate';
            
            let rankClass = '';
            if (rank === 1) rankClass = 'rank-gold';
            else if (rank === 2) rankClass = 'rank-silver';
            else if (rank === 3) rankClass = 'rank-bronze';
            
            html += `
                <tr class="leaderboard-row ${rankClass}">
                    <td class="rank">${rank}</td>
                    <td class="player-name">
                        ${score.username || 'Anonyme'}
                        <div class="player-details">
                            <span class="difficulty ${difficulty}">${difficulty}</span>
                            <span class="words-found">${score.wordsFound || 0} mots</span>
                        </div>
                    </td>
                    <td class="score">${score.score || 0}</td>
                    <td class="date">${date}</td>
                </tr>
            `;
        });
        
        this.leaderboardBody.innerHTML = html;
    },

    displayLocalScores() {
        this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="loading-scores">Chargement de vos scores...</td></tr>';
        
        try {
            // Récupérer les scores locaux
            const localScores = JSON.parse(localStorage.getItem('localScores') || '[]');
            const enigmaScores = localScores.filter(score => score.gameId === 'enigma-scroll');
            
            if (enigmaScores.length === 0) {
                this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="no-scores">Aucun score local disponible. Jouez pour en créer !</td></tr>';
                return;
            }

            // Trier par score décroissant et prendre les 10 meilleurs
            enigmaScores.sort((a, b) => b.score - a.score);
            const topScores = enigmaScores.slice(0, 10);

            this.displayScores(topScores);
        } catch (error) {
            console.error("[ESL] Erreur lors de l'affichage des scores locaux:", error);
            this.leaderboardBody.innerHTML = '<tr><td colspan="4" class="leaderboard-error">Erreur lors du chargement des scores locaux</td></tr>';
        }
    },

    // saveScore est maintenant principalement géré par enigma-scroll.js appelant EnigmaScrollFirebase.saveScore
    async saveScore(scoreData) {
        if (window.EnigmaScrollFirebase && typeof window.EnigmaScrollFirebase.saveScore === 'function') {
            try {
                // S'assurer que gameId fait partie de scoreData s'il n'y est pas déjà
                scoreData.gameId = scoreData.gameId || this.leaderboardId;
                await window.EnigmaScrollFirebase.saveScore(scoreData.score, scoreData);
                
                // Rafraîchir les scores selon le type actuel
                this.loadScores();
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

console.log("EnigmaScrollLeaderboard chargé et prêt"); 