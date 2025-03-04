/**
 * Système de leaderboard dédié au jeu Speed Verb Challenge
 * Cette solution est complètement autonome et ne dépend pas d'autres systèmes
 */

console.log("Loading speed-verb-leaderboard.js");

// Objet global pour la gestion des scores
const SpeedVerbLeaderboard = {
    // Collection de scores dans Firebase
    collectionName: 'speed_verb_scores',
    
    // Référence vers le tableau HTML du leaderboard
    leaderboardTable: null,
    
    // Données locales (utilisées si Firebase n'est pas disponible)
    localScores: [],
    
    // Initialiser le leaderboard
    init: function(tableId) {
        console.log(`Initializing Speed Verb Leaderboard with tableId: ${tableId}`);
        
        // CORRECTION: Chercher d'abord le tableau par ID
        this.leaderboardTable = document.getElementById(tableId);
        
        // Si non trouvé, chercher par sélecteur de classe
        if (!this.leaderboardTable) {
            console.log(`Table with ID '${tableId}' not found, trying to find by class...`);
            this.leaderboardTable = document.querySelector('.leaderboard-table');
        }
        
        // Si toujours pas trouvé, chercher n'importe quelle table
        if (!this.leaderboardTable) {
            console.log("Still no table found, trying to find any table...");
            this.leaderboardTable = document.querySelector('table');
        }
        
        // Vérification finale
        if (!this.leaderboardTable) {
            console.error("No leaderboard table found in the document");
            return false;
        }
        
        console.log("Leaderboard table found:", this.leaderboardTable);
        
        // Trouver le corps du tableau
        this.leaderboardBody = this.leaderboardTable.querySelector('tbody');
        if (!this.leaderboardBody) {
            console.error("Leaderboard body not found");
            
            // Créer un tbody s'il n'existe pas
            this.leaderboardBody = document.createElement('tbody');
            this.leaderboardBody.id = 'leaderboard-body';
            this.leaderboardTable.appendChild(this.leaderboardBody);
            console.log("Created new tbody element");
        }
        
        // Charger les meilleurs scores
        this.loadScores();
        
        console.log("Speed Verb Leaderboard initialized successfully");
        return true;
    },
    
    // Charger les scores depuis Firebase ou utiliser des données locales
    loadScores: function() {
        console.log("Loading scores for Speed Verb Challenge...");
        
        if (!this.leaderboardBody) {
            console.error("Leaderboard body is not initialized");
            return;
        }
        
        // Afficher un message de chargement
        this.leaderboardBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="4">Chargement des meilleurs scores...</td>
            </tr>
        `;
        
        // Vérifier si Firebase est disponible
        if (this.isFirebaseAvailable()) {
            console.log("Firebase is available, loading scores from database...");
            this.loadScoresFromFirebase();
        } else {
            console.warn("Firebase is not available, using local scores...");
            this.loadLocalScores();
        }
    },
    
    // Vérifier si Firebase est disponible
    isFirebaseAvailable: function() {
        const firebaseExists = typeof firebase !== 'undefined';
        const firestoreExists = firebaseExists && typeof firebase.firestore === 'function';
        const dbExists = window.db || (firestoreExists && firebase.firestore());
        
        console.log("Firebase availability check:", {
            firebaseExists,
            firestoreExists,
            dbExists
        });
        
        return firebaseExists && firestoreExists && dbExists;
    },
    
    // Charger les scores depuis Firebase
    loadScoresFromFirebase: function() {
        try {
            // Récupérer la référence à Firestore
            const db = window.db || firebase.firestore();
            
            console.log("Attempting to query collection:", this.collectionName);
            
            // Récupérer les scores
            db.collection(this.collectionName)
                .orderBy("score", "desc")
                .limit(10)
                .get()
                .then((querySnapshot) => {
                    console.log(`Received ${querySnapshot.size} scores from Firebase`);
                    
                    // Vérifier s'il y a des scores
                    if (querySnapshot.empty) {
                        this.showEmptyLeaderboard();
                        return;
                    }
                    
                    // Convertir les données et les stocker localement
                    this.localScores = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        console.log("Score data:", data);
                        
                        this.localScores.push({
                            id: doc.id,
                            playerName: data.playerName || data.name || 'Joueur Anonyme',
                            score: data.score || 0,
                            level: data.level || 1,
                            timestamp: data.timestamp ? 
                                (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : 
                                new Date()
                        });
                    });
                    
                    // Afficher les scores
                    this.displayScores(this.localScores);
                })
                .catch((error) => {
                    console.error("Error loading scores from Firebase:", error);
                    this.loadLocalScores();
                });
        } catch (error) {
            console.error("Exception when loading scores from Firebase:", error);
            this.loadLocalScores();
        }
    },
    
    // Charger les scores locaux (utilisés si Firebase n'est pas disponible)
    loadLocalScores: function() {
        console.log("Loading local scores...");
        
        // Vérifier si nous avons déjà des scores locaux
        if (this.localScores && this.localScores.length > 0) {
            console.log("Using existing local scores");
            this.displayScores(this.localScores);
            return;
        }
        
        // Essayer de récupérer les scores depuis localStorage
        try {
            const savedScores = localStorage.getItem('speedVerbScores');
            if (savedScores) {
                this.localScores = JSON.parse(savedScores);
                console.log("Loaded scores from localStorage");
            }
        } catch (e) {
            console.error("Error loading scores from localStorage:", e);
        }
        
        // Si nous n'avons toujours pas de scores, utiliser des données de test
        if (!this.localScores || this.localScores.length === 0) {
            console.log("Using mock data for leaderboard");
            this.localScores = [
                { playerName: "MageVerbale", score: 950, level: 8, timestamp: new Date(Date.now() - 5 * 86400000) },
                { playerName: "GrammaireHero", score: 820, level: 7, timestamp: new Date(Date.now() - 10 * 86400000) },
                { playerName: "VerbMaster", score: 780, level: 6, timestamp: new Date(Date.now() - 2 * 86400000) },
                { playerName: "WordWizard", score: 720, level: 5, timestamp: new Date(Date.now() - 15 * 86400000) },
                { playerName: "LanguageKnight", score: 690, level: 5, timestamp: new Date(Date.now() - 7 * 86400000) }
            ];
            
            // Sauvegarder dans localStorage pour la prochaine fois
            try {
                localStorage.setItem('speedVerbScores', JSON.stringify(this.localScores));
            } catch (e) {
                console.error("Error saving to localStorage:", e);
            }
        }
        
        // Afficher les scores
        this.displayScores(this.localScores);
    },
    
    // Afficher un leaderboard vide
    showEmptyLeaderboard: function() {
        if (!this.leaderboardBody) return;
        
        this.leaderboardBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="4">Aucun score enregistré. Soyez le premier à jouer !</td>
            </tr>
        `;
    },
    
    // Afficher les scores dans le tableau
    displayScores: function(scores) {
        if (!this.leaderboardBody) return;
        
        console.log("Displaying scores:", scores);
        
        // Trier les scores (par précaution)
        scores.sort((a, b) => b.score - a.score);
        
        // Vider le tableau
        this.leaderboardBody.innerHTML = '';
        
        // Ajouter chaque score
        let rank = 1;
        scores.forEach(score => {
            const row = document.createElement('tr');
            row.className = `rank-${rank <= 3 ? rank : 'other'}`;
            
            // Formater la date
            let dateStr = 'N/A';
            try {
                dateStr = score.timestamp.toLocaleDateString();
            } catch (e) {
                console.error("Error formatting date:", e);
            }
            
            // Créer les cellules
            row.innerHTML = `
                <td class="rank">${rank}</td>
                <td class="champion">${score.playerName}</td>
                <td class="score">${score.score}</td>
                <td class="date">${dateStr}</td>
            `;
            
            this.leaderboardBody.appendChild(row);
            rank++;
        });
    },
    
    // Sauvegarder un nouveau score
    saveScore: function(playerName, score, level, verbsCompleted, difficulty) {
        console.log(`Saving score: ${score} for player: ${playerName}`);
        
        // Valider les données
        playerName = playerName || 'Joueur Anonyme';
        score = parseInt(score) || 0;
        level = parseInt(level) || 1;
        
        // Créer l'objet de score
        const scoreData = {
            playerName: playerName,
            score: score,
            level: level,
            verbsCompleted: verbsCompleted || 0,
            difficulty: difficulty || '1',
            timestamp: new Date()
        };
        
        // Ajouter à nos scores locaux
        this.localScores.push(scoreData);
        
        // Trier et limiter les scores
        this.localScores.sort((a, b) => b.score - a.score);
        if (this.localScores.length > 20) {
            this.localScores = this.localScores.slice(0, 20);
        }
        
        // Sauvegarder dans localStorage
        try {
            localStorage.setItem('speedVerbScores', JSON.stringify(this.localScores));
        } catch (e) {
            console.error("Error saving to localStorage:", e);
        }
        
        // Sauvegarder dans Firebase si disponible
        if (this.isFirebaseAvailable()) {
            try {
                const db = window.db || firebase.firestore();
                
                // Préparer les données pour Firebase
                const firebaseData = {
                    playerName: playerName,
                    score: score,
                    level: level,
                    verbsCompleted: verbsCompleted || 0,
                    difficulty: difficulty || '1',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                console.log("Saving score to Firebase collection:", this.collectionName);
                
                // Ajouter à la collection
                db.collection(this.collectionName)
                    .add(firebaseData)
                    .then(docRef => {
                        console.log("Score saved to Firebase with ID:", docRef.id);
                        alert("Score sauvegardé avec succès !");
                        
                        // Recharger les scores pour afficher le nouveau
                        this.loadScoresFromFirebase();
                    })
                    .catch(error => {
                        console.error("Error saving score to Firebase:", error);
                        alert("Le score a été sauvegardé localement, mais n'a pas pu être envoyé au serveur.");
                        
                        // Afficher les scores locaux à la place
                        this.displayScores(this.localScores);
                    });
            } catch (error) {
                console.error("Exception when saving score to Firebase:", error);
                alert("Le score a été sauvegardé localement, mais n'a pas pu être envoyé au serveur.");
                
                // Afficher les scores locaux à la place
                this.displayScores(this.localScores);
            }
        } else {
            console.warn("Firebase not available, score saved locally only");
            alert("Score sauvegardé localement !");
            
            // Afficher les scores mis à jour
            this.displayScores(this.localScores);
        }
        
        return true;
    }
};

// Exporter l'objet globalement
window.SpeedVerbLeaderboard = SpeedVerbLeaderboard; 