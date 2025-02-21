import { initFirebase } from './firebase-init.js';

export function initVisitCounter() {
    const database = firebase.database();
    const statsRef = database.ref('stats');
    const visitorCountElement = document.getElementById('visitor-count');
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Gestion des erreurs
    if (!visitorCountElement) return;

    // Afficher un message de chargement plus informatif
    visitorCountElement.textContent = "Counting...";

    // Mise à jour des compteurs
    statsRef.transaction((currentStats) => {
        const newStats = currentStats || { total: 0, daily: {} };
        newStats.total = (newStats.total || 0) + 1;
        newStats.daily = newStats.daily || {};
        newStats.daily[today] = (newStats.daily[today] || 0) + 1;
        return newStats;
    }).then(() => {
        // Transaction réussie
        console.log("Visit counted successfully");
    }).catch(error => {
        console.error("Error counting visit:", error);
        visitorCountElement.textContent = "Visit counting unavailable";
    });

    // Affichage des compteurs
    statsRef.on('value', (snapshot) => {
        const stats = snapshot.val();
        if (stats) {
            visitorCountElement.innerHTML = `
                <div class="counter-container">
                    <div class="counter-item">
                        <span class="counter-label">Total Visitors:</span>
                        <span class="counter-value">${stats.total.toLocaleString()}</span>
                    </div>
                    <div class="counter-item">
                        <span class="counter-label">Today's Visitors:</span>
                        <span class="counter-value">${(stats.daily[today] || 0).toLocaleString()}</span>
                    </div>
                </div>
            `;
        } else {
            visitorCountElement.textContent = "No visits yet";
        }
    }, (error) => {
        console.error("Error fetching visitor count:", error);
        visitorCountElement.textContent = "Counter unavailable";
    });
}