/**
 * Leaderboard functionality for Speed Verb Challenge
 * Handles saving and retrieving player scores using Firebase
 */

console.log("Loading leaderboard.js");

// Reference to the Firestore database
let db;

// Initialize Firebase and Firestore
function initFirebase() {
    console.log("Initializing Firebase from leaderboard.js");
    
    // First check if db is already available globally
    if (window.db) {
        console.log("Using globally available db reference");
        db = window.db;
        return true;
    }
    
    // Check if Firebase is already initialized
    if (typeof firebase !== 'undefined') {
        try {
            if (!firebase.apps.length) {
                if (typeof firebaseConfig !== 'undefined') {
                    firebase.initializeApp(firebaseConfig);
                    console.log("Firebase initialized with config");
                } else {
                    console.error("Firebase config not found!");
                    return false;
                }
            } else {
                console.log("Firebase already initialized");
            }
            
            db = firebase.firestore();
            window.db = db; // Make it globally available
            console.log("Firestore reference created");
            return true;
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            return false;
        }
    } else {
        console.error("Firebase SDK not loaded!");
        return false;
    }
}

// Save player score to the leaderboard
function saveScore(gameType, playerName, score) {
    if (!db && !initFirebase()) {
        console.error("Failed to initialize Firebase for saving score");
        return Promise.reject("Firebase initialization failed");
    }
    
    // Ensure valid inputs
    if (!gameType || typeof score !== 'number') {
        console.error("Invalid parameters for saveScore:", { gameType, playerName, score });
        return Promise.reject("Invalid parameters");
    }
    
    console.log(`Saving score: ${playerName} - ${score} for ${gameType}`);
    
    try {
        // Create a timestamp for sorting
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        // IMPORTANT: Use the original collection name directly
        return db.collection(gameType)
            .add({
                playerName: playerName || "Anonymous",
                score: score,
                timestamp: timestamp
            })
            .then(() => {
                console.log("Score saved successfully!");
                return true;
            })
            .catch((error) => {
                console.error("Error saving score: ", error);
                return false;
            });
    } catch (error) {
        console.error("Exception in saveScore:", error);
        return Promise.reject(error);
    }
}

// Get top scores for a specific game type
function getTopScores(gameType, limit = 10) {
    if (!db && !initFirebase()) {
        console.error("Failed to initialize Firebase for getting scores");
        return Promise.reject("Firebase initialization failed");
    }
    
    // Fallback to mock data if gameType is missing
    if (!gameType) {
        console.error("Invalid gameType for getTopScores");
        return Promise.resolve(getMockData());
    }
    
    console.log(`Getting top ${limit} scores for ${gameType}`);
    
    try {
        // IMPORTANT: Use the collection name directly
        return db.collection(gameType)
            .orderBy('score', 'desc')
            .limit(limit)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot) {
                    console.error("Query snapshot is null or undefined");
                    return getMockData();
                }
                
                console.log(`Query returned ${querySnapshot.size} results`);
                
                const scores = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    scores.push({
                        id: doc.id,
                        playerName: data.playerName || "Anonymous",
                        score: data.score,
                        timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
                    });
                });
                
                if (scores.length === 0) {
                    console.log("No scores found, returning mock data");
                    return getMockData();
                }
                
                console.log(`Retrieved ${scores.length} scores`);
                return scores;
            })
            .catch((error) => {
                console.error("Error getting top scores: ", error);
                return getMockData();
            });
    } catch (error) {
        console.error("Exception in getTopScores:", error);
        return Promise.resolve(getMockData());
    }
}

// Helper to get mock data
function getMockData() {
    return [
        { id: 'mock1', playerName: 'GrammarWizard', score: 950, timestamp: new Date() },
        { id: 'mock2', playerName: 'VerbMaster', score: 850, timestamp: new Date() },
        { id: 'mock3', playerName: 'SpellCaster', score: 780, timestamp: new Date() },
        { id: 'mock4', playerName: 'WordSmith', score: 720, timestamp: new Date() },
        { id: 'mock5', playerName: 'LexiconHero', score: 690, timestamp: new Date() }
    ];
}

// Load and display game scores in a specific element
function loadGameScores(gameType, elementId) {
    console.log(`Loading scores for ${gameType} into element ${elementId}`);
    
    const leaderboardElement = document.getElementById(elementId);
    if (!leaderboardElement) {
        console.error(`Element with ID ${elementId} not found`);
        return;
    }

    // Set loading message
    leaderboardElement.innerHTML = '<div class="loading-scores">Invocation des archives ancestrales...</div>';
    
    getTopScores(gameType)
        .then((scores) => {
            // Clear current leaderboard
            leaderboardElement.innerHTML = '';
            
            if (scores.length === 0) {
                leaderboardElement.innerHTML = '<div class="no-scores">Aucun score trouvé. Soyez le premier!</div>';
                return;
            }

            // Create leaderboard table
            const table = document.createElement('table');
            table.className = 'leaderboard-table';
            
            // Create header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th>Rang</th>
                <th>Joueur</th>
                <th>Score</th>
                <th>Date</th>
            `;
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create body
            const tbody = document.createElement('tbody');
            scores.forEach((scoreData, index) => {
                const row = document.createElement('tr');
                const rankCell = document.createElement('td');
                const nameCell = document.createElement('td');
                const scoreCell = document.createElement('td');
                const dateCell = document.createElement('td');
                
                rankCell.textContent = index + 1;
                nameCell.textContent = scoreData.playerName || 'Anonymous';
                scoreCell.textContent = scoreData.score;
                
                // Format the date
                let dateStr = 'N/A';
                try {
                    if (scoreData.timestamp) {
                        const date = new Date(scoreData.timestamp);
                        if (!isNaN(date)) {
                            dateStr = date.toLocaleDateString();
                        }
                    }
                } catch (e) {
                    console.error("Error formatting date:", e);
                }
                dateCell.textContent = dateStr;
                
                // Add medal for top 3
                if (index < 3) {
                    const medalClass = ['gold', 'silver', 'bronze'][index];
                    rankCell.innerHTML = `<span class="medal ${medalClass}">${index + 1}</span>`;
                }
                
                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(scoreCell);
                row.appendChild(dateCell);
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            
            leaderboardElement.appendChild(table);
            console.log("Scores displayed successfully");
        })
        .catch((error) => {
            console.error('Error loading scores:', error);
            leaderboardElement.innerHTML = '<div class="error-message">Erreur lors du chargement des scores</div>';
        });
}

// Show score submission form
function showScoreForm(score, onSubmit) {
    console.log(`Showing score form for score: ${score}`);
    
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = 'score-modal';
    modal.innerHTML = `
        <div class="score-form-container">
            <h2>Nouveau Record!</h2>
            <p>Votre score: <span class="highlight-score">${score}</span></p>
            <form id="score-submit-form">
                <div class="input-group">
                    <label for="player-name">Entrez votre nom:</label>
                    <input type="text" id="player-name" class="verb-input" maxlength="20" required>
                </div>
                <div class="verb-actions">
                    <button type="submit" class="primary-button">Sauvegarder</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus the input
    setTimeout(() => {
        const nameInput = document.getElementById('player-name');
        if (nameInput) nameInput.focus();
    }, 100);
    
    // Handle form submission
    document.getElementById('score-submit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const playerName = document.getElementById('player-name').value.trim();
        if (playerName) {
            modal.remove();
            if (typeof onSubmit === 'function') {
                onSubmit(playerName);
            }
        }
    });
}

// Submit score with player name
function submitScore(gameType, score) {
    if (typeof score !== 'number') {
        score = parseInt(score) || 0;
    }
    
    console.log(`Submitting score for ${gameType}: ${score}`);
    showScoreForm(score, (playerName) => {
        saveScore(gameType, playerName, score)
            .then((success) => {
                if (success) {
                    console.log("Score saved, reloading leaderboard");
                    // Reload leaderboard after submission
                    loadGameScores(gameType, `${gameType}-leaderboard`);
                } else {
                    console.error("Failed to save score");
                }
            });
    });
}

// Check if score qualifies for leaderboard
function checkHighScore(gameType, score, callback) {
    if (typeof score !== 'number') {
        score = parseInt(score) || 0;
    }
    
    console.log(`Checking if score ${score} qualifies for ${gameType} leaderboard`);
    getTopScores(gameType)
        .then((scores) => {
            // If we have less than 10 scores, any score qualifies
            if (scores.length < 10) {
                console.log("Less than 10 scores, score qualifies");
                callback(true);
                return;
            }
            
            // Check if score is higher than the lowest score
            const lowestScore = scores[scores.length - 1].score;
            const qualifies = score > lowestScore;
            console.log(`Score ${qualifies ? 'qualifies' : 'does not qualify'} (${score} vs lowest ${lowestScore})`);
            callback(qualifies);
        })
        .catch(() => {
            // If there's an error, assume it qualifies
            console.error("Error checking high score, assuming it qualifies");
            callback(true);
        });
}

// Add styles for the leaderboard
function addLeaderboardStyles() {
    const styleId = 'leaderboard-styles';
    if (document.getElementById(styleId)) {
        console.log("Leaderboard styles already added");
        return;
    }
    
    console.log("Adding leaderboard styles");
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
        .leaderboard-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: rgba(16, 24, 45, 0.6);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(90, 120, 190, 0.3);
        }
        
        .leaderboard-table th,
        .leaderboard-table td {
            padding: 12px 15px;
            text-align: center;
            border-bottom: 1px solid rgba(90, 120, 190, 0.2);
        }
        
        .leaderboard-table th {
            background: rgba(25, 35, 60, 0.8);
            color: #fff;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .leaderboard-table tr:nth-child(even) {
            background: rgba(20, 30, 55, 0.5);
        }
        
        .leaderboard-table tr:hover {
            background: rgba(33, 150, 243, 0.2);
        }
        
        .medal {
            display: inline-block;
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            border-radius: 50%;
            font-weight: bold;
            color: #000;
        }
        
        .medal.gold {
            background: linear-gradient(135deg, #ffd700, #ffb900);
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
        }
        
        .medal.silver {
            background: linear-gradient(135deg, #e0e0e0, #c0c0c0);
            box-shadow: 0 0 10px rgba(192, 192, 192, 0.7);
        }
        
        .medal.bronze {
            background: linear-gradient(135deg, #cd7f32, #a05a2c);
            box-shadow: 0 0 10px rgba(205, 127, 50, 0.7);
        }
        
        .score-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .score-form-container {
            background: linear-gradient(135deg, rgba(23, 32, 57, 0.95), rgba(12, 17, 30, 0.98));
            border-radius: 8px;
            border: 1px solid rgba(90, 120, 190, 0.5);
            padding: 30px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 0 20px rgba(33, 150, 243, 0.5);
            transform-style: preserve-3d;
            animation: formAppear 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        @keyframes formAppear {
            from { transform: translateY(30px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        .highlight-score {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--accent-gold);
            text-shadow: 0 0 10px var(--accent-gold-glow);
        }
        
        .no-scores {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #a0a0c0;
        }
        
        .loading-scores {
            text-align: center;
            padding: 20px;
            color: #a0a0c0;
            font-style: italic;
        }
        
        .error-message {
            text-align: center;
            padding: 20px;
            color: var(--error-color);
            font-weight: bold;
        }
    `;
    document.head.appendChild(styleEl);
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Leaderboard.js: DOM loaded, initializing leaderboard");
    
    // Add leaderboard styles
    addLeaderboardStyles();
    
    // Initialize Firebase
    initFirebase();
    
    // Log initialization status
    console.log("Leaderboard system initialized");
    
    // If a leaderboard container exists, load scores
    const leaderboardElement = document.getElementById('speed-verb-leaderboard');
    if (leaderboardElement) {
        console.log("Found leaderboard container, loading initial scores");
        setTimeout(() => {
            loadGameScores('speed_verb_scores', 'speed-verb-leaderboard');
        }, 500); // Give Firebase a little time to initialize
    }
});

// Expose the functions globally
window.loadGameScores = loadGameScores;
window.submitScore = submitScore;
window.checkHighScore = checkHighScore; 