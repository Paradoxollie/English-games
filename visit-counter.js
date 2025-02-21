class VisitorCounter {
    constructor() {
        if (!window.db) {
            console.error('Firebase not initialized');
            return;
        }
        this.visitorId = this.getOrCreateVisitorId();
        this.today = new Date().toISOString().split('T')[0];
        this.db = window.db;
    }

    getOrCreateVisitorId() {
        let id = localStorage.getItem('visitorId');
        if (!id) {
            id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('visitorId', id);
        }
        return id;
    }

    async initialize() {
        try {
            await this.updateVisitStats();
            await this.displayStats();
        } catch (error) {
            console.error('Error initializing visitor counter:', error);
            this.handleError(error);
        }
    }

    async updateVisitStats() {
        try {
            if (!this.db) return;
            const visitsRef = this.db.collection('visits').doc('stats');
            const visitsDoc = await visitsRef.get();

            if (!visitsDoc.exists) {
                await visitsRef.set({
                    totalVisits: 1,
                    uniqueVisitors: [this.visitorId],
                    dailyVisits: { [this.today]: 1 },
                    lastUpdated: new Date()
                });
            } else {
                const data = visitsDoc.data();
                const todayVisits = (data.dailyVisits?.[this.today] || 0) + 1;
                
                await visitsRef.update({
                    totalVisits: firebase.firestore.FieldValue.increment(1),
                    uniqueVisitors: firebase.firestore.FieldValue.arrayUnion(this.visitorId),
                    [`dailyVisits.${this.today}`]: todayVisits,
                    lastUpdated: new Date()
                });
            }
        } catch (error) {
            console.error('Error updating visit stats:', error);
        }
    }

    async displayStats() {
        try {
            if (!this.db) return;
            const element = document.getElementById('visitor-count');
            if (!element) return;

            const visitsRef = this.db.collection('visits').doc('stats');
            const visitsDoc = await visitsRef.get();
            const data = visitsDoc.data();

            element.innerHTML = `
                <div class="counter-container">
                    <div class="counter-item">
                        <span class="counter-label text-quest-gold">Total Visits</span>
                        <span class="counter-value text-white">${data.totalVisits.toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label text-quest-gold">Today's Visits</span>
                        <span class="counter-value text-white">${(data.dailyVisits[this.today] || 0).toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label text-quest-gold">Unique Visitors</span>
                        <span class="counter-value text-white">${data.uniqueVisitors.length.toLocaleString()}</span>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error displaying stats:', error);
            this.handleError(error);
        }
    }

    handleError(error) {
        const element = document.getElementById('visitor-count');
        if (element) {
            element.innerHTML = '<p class="text-red-500">Error loading stats</p>';
        }
    }
}

// Initialiser le compteur quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const counter = new VisitorCounter();
        counter.initialize();
    }, 1000); // Attendre que Firebase soit complètement initialisé
});