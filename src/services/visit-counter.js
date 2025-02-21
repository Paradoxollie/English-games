import { db } from '../config/firebase-config';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { trackEvent } from './analytics';

class VisitorCounter {
    constructor() {
        this.visitorId = this.getOrCreateVisitorId();
        this.today = new Date().toISOString().split('T')[0];
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
            trackEvent('page_visit', { page: window.location.pathname });
        } catch (error) {
            console.error('Error initializing visitor counter:', error);
            this.handleError(error);
        }
    }

    async updateVisitStats() {
        const visitsRef = doc(db, 'visits', 'stats');
        const visitsDoc = await getDoc(visitsRef);

        if (!visitsDoc.exists()) {
            await setDoc(visitsRef, {
                totalVisits: 1,
                uniqueVisitors: [this.visitorId],
                dailyVisits: { [this.today]: 1 },
                lastUpdated: new Date()
            });
        } else {
            await updateDoc(visitsRef, {
                totalVisits: increment(1),
                uniqueVisitors: arrayUnion(this.visitorId),
                [`dailyVisits.${this.today}`]: increment(1),
                lastUpdated: new Date()
            });
        }
    }

    async displayStats() {
        const element = document.getElementById('visitor-count');
        if (!element) return;

        try {
            const visitsRef = doc(db, 'visits', 'stats');
            const visitsDoc = await getDoc(visitsRef);
            const data = visitsDoc.data();

            element.innerHTML = `
                <div class="counter-container">
                    <div class="counter-item">
                        <span class="counter-label">Total Visits</span>
                        <span class="counter-value">${data.totalVisits.toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Today</span>
                        <span class="counter-value">${(data.dailyVisits[this.today] || 0).toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Unique</span>
                        <span class="counter-value">${data.uniqueVisitors.length.toLocaleString()}</span>
                    </div>
                </div>
            `;
        } catch (error) {
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

export const visitorCounter = new VisitorCounter(); 