class VisitorCounter {
    constructor() {
        this.db = firebase.database();
        this.statsRef = this.db.ref('visitorStats');
        this.today = new Date().toISOString().split('T')[0];
    }

    async countVisit() {
        const clientId = this.getClientId();
        const updates = {};

        // Mise à jour du total des visiteurs uniques
        const totalRef = await this.statsRef.child('totalUnique').once('value');
        const totalVisitors = totalRef.val() || {};
        if (!totalVisitors[clientId]) {
            totalVisitors[clientId] = true;
            updates['totalUnique'] = totalVisitors;
        }

        // Mise à jour des visiteurs uniques du jour
        const dailyRef = await this.statsRef.child(`daily/${this.today}`).once('value');
        const dailyVisitors = dailyRef.val() || {};
        if (!dailyVisitors[clientId]) {
            dailyVisitors[clientId] = true;
            updates[`daily/${this.today}`] = dailyVisitors;
        }

        if (Object.keys(updates).length > 0) {
            await this.statsRef.update(updates);
        }

        this.updateDisplay();
    }

    async updateDisplay() {
        const visitorCountElement = document.getElementById('visitor-count');
        if (!visitorCountElement) return;

        try {
            const snapshot = await this.statsRef.once('value');
            const stats = snapshot.val();
            
            if (stats) {
                const totalCount = stats.totalUnique ? Object.keys(stats.totalUnique).length : 0;
                const todayCount = stats.daily && stats.daily[this.today] 
                    ? Object.keys(stats.daily[this.today]).length 
                    : 0;

                visitorCountElement.innerHTML = `
                    <div class="counter-item">
                        <span class="counter-value">${totalCount.toLocaleString()}</span> total
                        <span class="counter-separator">|</span>
                        <span class="counter-value">${todayCount.toLocaleString()}</span> today
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error updating display:', error);
            visitorCountElement.textContent = 'Counter unavailable';
        }
    }

    getClientId() {
        let clientId = localStorage.getItem('visitorId');
        if (!clientId) {
            clientId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitorId', clientId);
        }
        return clientId;
    }
}

// Initialisation
export function initVisitorCounter() {
    const counter = new VisitorCounter();
    counter.countVisit();
} 