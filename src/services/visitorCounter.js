import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

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
        } catch (error) {
            console.error('Error initializing visitor counter:', error);
            this.handleError(error);
        }
    }

    async updateVisitStats() {
        const todayRef = doc(db, 'visits', this.today);
        const statsRef = doc(db, 'visits', 'stats');

        const todayDoc = await getDoc(todayRef);
        
        if (!todayDoc.exists()) {
            await setDoc(todayRef, {
                count: 1,
                visitors: [this.visitorId],
                firstVisit: this.today,
                lastVisit: this.today
            });
        } else {
            const data = todayDoc.data();
            if (!data.visitors.includes(this.visitorId)) {
                await updateDoc(todayRef, {
                    count: increment(1),
                    visitors: arrayUnion(this.visitorId),
                    lastVisit: this.today
                });
            }
        }

        // Mettre à jour les stats globales
        const statsDoc = await getDoc(statsRef);
        if (statsDoc.exists()) {
            const stats = statsDoc.data();
            if (!stats.allVisitors || !stats.allVisitors.includes(this.visitorId)) {
                await updateDoc(statsRef, {
                    totalVisits: increment(1),
                    allVisitors: arrayUnion(this.visitorId)
                });
            }
        } else {
            await setDoc(statsRef, {
                totalVisits: 1,
                allVisitors: [this.visitorId]
            });
        }
    }

    async displayStats() {
        const element = document.getElementById('visit-stats');
        if (!element) return;

        try {
            const todayDoc = await getDoc(doc(db, 'visits', this.today));
            const statsDoc = await getDoc(doc(db, 'visits', 'stats'));
            
            const todayData = todayDoc.exists() ? todayDoc.data() : { count: 0, visitors: [] };
            const statsData = statsDoc.exists() ? statsDoc.data() : { totalVisits: 0, allVisitors: [] };

            element.innerHTML = `
                <div class="counter-container">
                    <div class="counter-item">
                        <span class="counter-label">Total Visits</span>
                        <span class="counter-value">${statsData.totalVisits.toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Today</span>
                        <span class="counter-value">${todayData.count.toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Unique</span>
                        <span class="counter-value">${statsData.allVisitors.length.toLocaleString()}</span>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error displaying stats:', error);
            element.innerHTML = '<p class="text-red-500">Error loading stats</p>';
        }
    }

    handleError(error) {
        console.error('Visitor counter error:', error);
        const element = document.getElementById('visit-stats');
        if (element) {
            element.innerHTML = '<p class="text-red-500">Error loading stats</p>';
        }
    }
}

export const visitorCounter = new VisitorCounter(); 