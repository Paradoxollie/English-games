// Configuration Firebase (déjà présente dans le HTML)
const db = firebase.firestore();

// Fonction pour formater les scores selon le type de jeu
function formatScore(score, gameType) {
    switch(gameType) {
        case 'speed_verb_scores':
            return `${score} pts`;
        case 'word_memory_game_scores':
            return `${score} pairs`;
        case 'memory_matrix_scores':
            return `Level ${score}`;
        case 'lost_in_migration_scores':
            return `${score} birds`;
        case 'brewYourWordsScores':
            return `${score} potions`;
        case 'whisper_trials_scores':
            return `${score} words`;
        case 'word_bubbles_scores':
            return `${score} bubbles`;
        case 'echoes_lexicon_scores':
            return `${score} echoes`;
        case 'enigma_scroll_scores':
            return `${score} scrolls`;
        default:
            return score;
    }
}

// Fonction pour formater la date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

// Fonction pour créer une ligne de score avec animation
function createScoreRow(data, rank, gameType) {
    const row = document.createElement('tr');
    row.className = `rank-${rank}`;
    
    const formattedScore = formatScore(data.score, gameType);
    const formattedDate = formatDate(data.timestamp);
    
    row.innerHTML = `
        <td class="rank">${rank}</td>
        <td class="champion">${data.name || 'Anonymous'}</td>
        <td class="score">${formattedScore}</td>
        <td class="date">${formattedDate}</td>
    `;
    
    return row;
}

// Fonction pour charger les scores avec gestion d'erreur et états de chargement
async function loadGameScores(collectionName, tableId) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    
    // Afficher l'état de chargement
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center py-8">
                <div class="loading-spinner"></div>
                <p class="text-gray-400 mt-2">Loading scores...</p>
            </td>
        </tr>
    `;
    
    try {
        const querySnapshot = await db.collection(collectionName)
            .orderBy("score", "desc")
            .limit(3)
            .get();
        
        // Effacer le message de chargement
        tableBody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-400">
                        No scores yet. Be the first to play!
                    </td>
                </tr>
            `;
            return;
        }
        
        let rank = 1;
        querySnapshot.forEach((doc) => {
            const scoreRow = createScoreRow(doc.data(), rank, collectionName);
            tableBody.appendChild(scoreRow);
            rank++;
        });
        
    } catch (error) {
        console.error(`Error loading ${collectionName} scores:`, error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-8 text-red-500">
                    Error loading scores. Please try again later.
                </td>
            </tr>
        `;
    }
}

// Ajouter les styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(201, 170, 113, 0.1);
        border-left-color: var(--quest-red);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Chargement des scores au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const games = [
        { collection: "speed_verb_scores", tableId: "speed-verb-leaderboard" },
        { collection: "word_memory_game_scores", tableId: "memory-game-leaderboard" },
        { collection: "memory_matrix_scores", tableId: "matrix-game-leaderboard" },
        { collection: "lost_in_migration_scores", tableId: "migration-leaderboard" },
        { collection: "brewYourWordsScores", tableId: "brew-words-leaderboard" },
        { collection: "enigma_scroll_scores", tableId: "enigma-scroll-leaderboard" },
        { collection: "whisper_trials_scores", tableId: "whisper-trials-leaderboard" },
        { collection: "word_bubbles_scores", tableId: "word-bubbles-leaderboard" },
        { collection: "echoes_lexicon_scores", tableId: "echoes-lexicon-leaderboard" }
    ];
    
    games.forEach(game => loadGameScores(game.collection, game.tableId));
}); 