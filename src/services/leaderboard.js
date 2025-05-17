import { db } from '../config/firebase-config';
import { collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { trackEvent } from './analytics';

class LeaderboardService {
    constructor() {
        this.collections = {
            speedVerb: "speed_verb_scores",
            wordMemory: "word_memory_game_scores",
            matrix: "memory_matrix_scores",
            migration: "lost_in_migration_scores",
            brewWords: "brewYourWordsScores",
            whisperTrials: "whisper_trials_scores",
            wordBubbles: "word_bubbles_scores",
            echoesLexicon: "echoes_lexicon_scores",
            enigmaScroll: "enigma_scroll_scores"
        };
    }

    formatScore(score, gameType) {
        const formats = {
            [this.collections.speedVerb]: `${score} pts`,
            [this.collections.wordMemory]: `${score} pairs`,
            [this.collections.matrix]: `Level ${score}`,
            [this.collections.migration]: `${score} birds`,
            [this.collections.brewWords]: `${score} potions`,
            [this.collections.whisperTrials]: `${score} words`,
            [this.collections.wordBubbles]: `${score} bubbles`,
            [this.collections.echoesLexicon]: `${score} echoes`,
            [this.collections.enigmaScroll]: `${score} scrolls`
        };
        return formats[gameType] || score;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR');
    }

    async loadGameScores(collectionName, tableId) {
        const tableBody = document.getElementById(tableId);
        if (!tableBody) return;

        try {
            const scoresRef = collection(db, collectionName);
            const q = query(scoresRef, orderBy("score", "desc"), limit(3));
            const querySnapshot = await getDocs(q);

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
                const data = doc.data();
                const row = document.createElement('tr');
                row.className = `rank-${rank}`;
                
                row.innerHTML = `
                    <td class="rank">${rank}</td>
                    <td class="champion">${data.name || 'Anonymous'}</td>
                    <td class="score">${this.formatScore(data.score, collectionName)}</td>
                    <td class="date">${this.formatDate(data.timestamp)}</td>
                `;
                
                tableBody.appendChild(row);
                rank++;
            });

            trackEvent('leaderboard_loaded', { game: collectionName });
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

    initialize() {
        Object.values(this.collections).forEach(collection => {
            this.loadGameScores(collection, `${collection.replace(/_/g, '-')}-leaderboard`);
        });
    }
}

export const leaderboardService = new LeaderboardService(); 