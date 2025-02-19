// Utilise l'instance db globale au lieu d'en créer une nouvelle
document.addEventListener('DOMContentLoaded', function() {
    const statsDoc = db.collection('visits').doc('stats');
    
    // Fonction pour générer un ID unique pour le visiteur
    function generateVisitorId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Fonction pour obtenir ou créer l'ID du visiteur
    function getVisitorId() {
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = generateVisitorId();
            localStorage.setItem('visitorId', visitorId);
        }
        return visitorId;
    }

    // Fonction pour incrémenter les compteurs de visiteurs uniques
    async function incrementUniqueVisitCount() {
        const visitorId = getVisitorId();
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

        const visitorDoc = db.collection('visits').doc(visitorId);
        const visitorData = (await visitorDoc.get()).data() || {};

        let updateTotalVisits = false;
        let updateDailyVisits = false;

        if (!visitorData.firstVisit) {
            updateTotalVisits = true;
            visitorData.firstVisit = today;
        }

        if (visitorData.lastVisit !== today) {
            updateDailyVisits = true;
            visitorData.lastVisit = today;
        }

        await visitorDoc.set(visitorData);

        if (updateTotalVisits || updateDailyVisits) {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(statsDoc);
                if (!doc.exists) {
                    transaction.set(statsDoc, { totalUniqueVisitors: 1, dailyUniqueVisitors: { [today]: 1 } });
                } else {
                    const data = doc.data();
                    let newTotalVisitors = data.totalUniqueVisitors || 0;
                    let dailyVisitors = data.dailyUniqueVisitors || {};

                    if (updateTotalVisits) {
                        newTotalVisitors++;
                    }
                    
                    if (updateDailyVisits) {
                        dailyVisitors[today] = (dailyVisitors[today] || 0) + 1;
                    }

                    transaction.update(statsDoc, { 
                        totalUniqueVisitors: newTotalVisitors,
                        dailyUniqueVisitors: dailyVisitors
                    });
                }
            });
        }
    }

    // Fonction pour afficher les statistiques sur la page
    function displayVisitStats() {
        const today = new Date().toISOString().split('T')[0];
        const statsElement = document.getElementById('visit-stats');
        
        if (statsElement) {
            statsDoc.get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    statsElement.innerHTML = `
                        <div class="text-quest-gold/70 mt-1 font-medieval">
                            <p>Visiteurs uniques aujourd'hui : ${data.dailyUniqueVisitors[today] || 0}</p>
                            <p>Total des visiteurs uniques : ${data.totalUniqueVisitors || 0}</p>
                        </div>
                    `;
                }
            }).catch(error => {
                console.error("Erreur lors de la récupération des statistiques :", error);
            });
        }
    }

    // Incrémenter le compteur et afficher les stats
    incrementUniqueVisitCount()
        .then(() => {
            displayVisitStats();
            // Rafraîchir les stats toutes les minutes
            setInterval(displayVisitStats, 60000);
        })
        .catch(error => {
            console.error("Erreur:", error);
        });
});