import { db } from './firebase-init.js';

function initVisitCounter() {
    const visitorCountElement = document.getElementById('visitor-count');
    if (!visitorCountElement) return;

    const today = new Date().toISOString().split('T')[0];
    const statsRef = db.ref('visitors');

    // Générer un ID unique pour le visiteur
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
    }

    // Mettre à jour les statistiques
    statsRef.transaction((stats) => {
        if (!stats) stats = { total: 0, daily: {}, unique: {} };
        
        stats.total = (stats.total || 0) + 1;
        
        if (!stats.daily[today]) stats.daily[today] = 0;
        stats.daily[today]++;
        
        if (!stats.unique[visitorId]) {
            stats.unique[visitorId] = true;
            stats.uniqueCount = (stats.uniqueCount || 0) + 1;
        }

        return stats;
    });

    // Afficher les compteurs
    statsRef.on('value', (snapshot) => {
        const stats = snapshot.val();
        if (stats) {
            visitorCountElement.innerHTML = `
                <div class="counter-container">
                    <div class="counter-item">
                        <span class="counter-label">Total Visits</span>
                        <span class="counter-value">${stats.total.toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Today</span>
                        <span class="counter-value">${(stats.daily[today] || 0).toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Unique</span>
                        <span class="counter-value">${stats.uniqueCount.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }
    });
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initVisitCounter);