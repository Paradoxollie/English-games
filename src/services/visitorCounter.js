import { db } from '../config/firebase-config.js';

export class VisitorCounter {
    constructor() {
        this.statsRef = db.ref('stats'); // Gardons l'ancienne référence
        this.today = new Date().toISOString().split('T')[0];
    }

    async countVisit() {
        const clientId = this.getClientId();
        
        try {
            await this.statsRef.transaction((stats) => {
                if (!stats) stats = { total: 0, daily: {}, unique: {} };
                
                // Incrémente le total
                stats.total = (stats.total || 0) + 1;
                
                // Compte journalier
                if (!stats.daily[this.today]) stats.daily[this.today] = 0;
                stats.daily[this.today]++;
                
                // Visiteurs uniques
                if (!stats.unique[clientId]) {
                    stats.unique[clientId] = true;
                    stats.uniqueCount = (stats.uniqueCount || 0) + 1;
                }
                
                return stats;
            });
        } catch (error) {
            console.error('Error updating visitor count:', error);
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

    async displayCount(element) {
        if (!element) return;

        try {
            const snapshot = await this.statsRef.once('value');
            const stats = snapshot.val();
            
            if (stats) {
                element.innerHTML = `
                    <div class="counter-container">
                        <div class="counter-item">
                            <span class="counter-label">Total Visits</span>
                            <span class="counter-value">${stats.total.toLocaleString()}</span>
                        </div>
                        <div class="counter-item">
                            <span class="counter-label">Today</span>
                            <span class="counter-value">${(stats.daily[this.today] || 0).toLocaleString()}</span>
                        </div>
                        <div class="counter-item">
                            <span class="counter-label">Unique</span>
                            <span class="counter-value">${(stats.uniqueCount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error fetching visitor count:', error);
            element.innerHTML = '<p class="text-red-500">Error loading visitor stats</p>';
        }
    }
} 