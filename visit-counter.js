class VisitorCounter {
    constructor() {
        this.visitorId = this.getOrCreateVisitorId();
        this.today = new Date().toISOString().split('T')[0];
        this.db = firebase.firestore();
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
        console.log('Initializing visitor counter...');
        try {
            await this.updateVisitStats();
            await this.displayStats();
        } catch (error) {
            console.error('Error initializing visitor counter:', error);
            this.handleError(error);
        }
    }

    async updateVisitStats() {
        console.log('Updating visit stats...');
        const visitsRef = this.db.collection('visits').doc('stats');
        const visitsDoc = await visitsRef.get();

        if (!visitsDoc.exists) {
            console.log('Creating new stats document...');
            await visitsRef.set({
                totalVisits: 1,
                uniqueVisitors: [this.visitorId],
                dailyVisits: { [this.today]: 1 },
                lastUpdated: new Date()
            });
        } else {
            console.log('Updating existing stats...');
            const data = visitsDoc.data();
            const todayVisits = (data.dailyVisits?.[this.today] || 0) + 1;
            
            await visitsRef.update({
                totalVisits: firebase.firestore.FieldValue.increment(1),
                uniqueVisitors: firebase.firestore.FieldValue.arrayUnion(this.visitorId),
                [`dailyVisits.${this.today}`]: todayVisits,
                lastUpdated: new Date()
            });
        }
    }

    async displayStats() {
        console.log('Displaying stats...');
        const element = document.getElementById('visitor-count');
        if (!element) {
            console.log('Counter element not found');
            return;
        }

        try {
            const visitsRef = this.db.collection('visits').doc('stats');
            const visitsDoc = await visitsRef.get();
            const data = visitsDoc.data();
            console.log('Stats data:', data);

            element.innerHTML = `
                <div class="counter-container">
                    <div class="counter-item">
                        <span class="counter-label">Total Visits</span>
                        <span class="counter-value">${data.totalVisits.toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Today's Visits</span>
                        <span class="counter-value">${(data.dailyVisits[this.today] || 0).toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Unique Visitors</span>
                        <span class="counter-value">${data.uniqueVisitors.length.toLocaleString()}</span>
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
    const counter = new VisitorCounter();
    counter.initialize();
});