// Référence à la base de données
const db = firebase.database();
const statsRef = db.ref('visit-stats');

function initVisitCounter() {
    const visitorCountElement = document.getElementById('visitor-count');
    if (!visitorCountElement) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Générer un ID unique pour le visiteur
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
    }

    // Vérifier les données existantes avant la mise à jour
    statsRef.once('value', (snapshot) => {
        const existingStats = snapshot.val() || {};
        console.log("Anciennes statistiques:", existingStats); // Pour déboguer

        // Mettre à jour les statistiques en préservant les anciennes données
        statsRef.transaction((stats) => {
            stats = stats || existingStats || { total: 0, daily: {}, unique: {}, uniqueCount: 0 };
            
            // Incrémenter le total
            stats.total = (stats.total || 0) + 1;
            
            // Mettre à jour les visites journalières
            if (!stats.daily) stats.daily = {};
            if (!stats.daily[today]) stats.daily[today] = 0;
            stats.daily[today]++;
            
            // Mettre à jour les visiteurs uniques
            if (!stats.unique) stats.unique = {};
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
                console.log("Statistiques actuelles:", stats); // Pour déboguer
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
                            <span class="counter-value">${(stats.uniqueCount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                `;
            }
        });
    });
}

// Initialiser le compteur
document.addEventListener('DOMContentLoaded', initVisitCounter);