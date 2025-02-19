class GameManager {
    constructor(options = {}) {
        this.gameId = options.gameId;
        this.initialTime = options.time || 60;
        this.score = 0;
        this.timer = null;
        this.db = firebase.firestore();
        this.isRunning = false;
        this.callbacks = {
            onTimeUpdate: () => {},
            onGameOver: () => {},
            onScoreUpdate: () => {}
        };
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    startTimer() {
        if (this.isRunning) return;
        
        let timeLeft = this.initialTime;
        this.isRunning = true;

        this.timer = setInterval(() => {
            timeLeft--;
            this.callbacks.onTimeUpdate(timeLeft);

            if (timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.callbacks.onGameOver(this.score);
    }

    updateScore(points) {
        this.score += points;
        this.callbacks.onScoreUpdate(this.score);
    }

    async saveScore(playerName) {
        try {
            await this.db.collection(`${this.gameId}_scores`).add({
                name: playerName,
                score: this.score,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error saving score:', error);
            return false;
        }
    }

    async loadTopScores() {
        try {
            const snapshot = await this.db.collection(`${this.gameId}_scores`)
                .orderBy("score", "desc")
                .limit(5)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading scores:', error);
            return [];
        }
    }

    reset() {
        clearInterval(this.timer);
        this.score = 0;
        this.isRunning = false;
    }
}

export default GameManager; 