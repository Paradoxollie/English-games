// Assurez-vous que Firebase est initialisé avant d'utiliser ce script
const db = firebase.firestore();
const visitsRef = db.collection('visits');
const statsDoc = visitsRef.doc('stats');

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

    const visitorDoc = visitsRef.doc(visitorId);
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
    statsDoc.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const today = new Date().toISOString().split('T')[0];
            const statsElement = document.getElementById('visit-stats');
            if (statsElement) {
                statsElement.innerHTML = `
                    <p>Visiteurs uniques aujourd'hui : ${data.dailyUniqueVisitors[today] || 0}</p>
                    <p>Total des visiteurs uniques : ${data.totalUniqueVisitors || 0}</p>
                `;
            }
        }
    }).catch(error => {
        console.error("Erreur lors de la récupération des statistiques :", error);
    });
}

// Incrémenter le compteur et afficher les stats lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    incrementUniqueVisitCount()
        .then(() => displayVisitStats())
        .catch(error => {
            console.error("Erreur lors de l'incrémentation du compteur de visites :", error);
        });
});