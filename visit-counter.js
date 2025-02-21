import { initFirebase } from './firebase-init.js';

export function initVisitCounter() {
    const { database } = initFirebase();
    const visitorCountRef = database.ref('visitorCount');
    const visitorCountElement = document.getElementById('visitor-count');

    // Gestion des erreurs
    if (!visitorCountElement) return;

    // Afficher un message de chargement plus informatif
    visitorCountElement.textContent = "Counting...";

    // Incrémente le compteur
    visitorCountRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
    }).then(() => {
        // Transaction réussie
        console.log("Visit counted successfully");
    }).catch(error => {
        console.error("Error counting visit:", error);
        visitorCountElement.textContent = "Visit counting unavailable";
    });

    // Affiche le compteur
    visitorCountRef.on('value', (snapshot) => {
        const count = snapshot.val();
        if (count !== null) {
            visitorCountElement.textContent = count.toLocaleString();
        } else {
            visitorCountElement.textContent = "No visits yet";
        }
    }, (error) => {
        console.error("Error fetching visitor count:", error);
        visitorCountElement.textContent = "Counter unavailable";
    });
}