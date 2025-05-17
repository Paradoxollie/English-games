/**
 * Module d'administration des scores pour English Quest
 * Permet à l'administrateur de gérer les scores des joueurs
 */

import firebaseService from '../core/services/firebase.service.js';
import { collection, getDocs, orderBy, query, limit, doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const AdminScores = {
    // Propriétés
    isAdmin: false,
    adminUsername: 'Ollie', // Nom d'utilisateur de l'administrateur
    isInitialized: false,

    /**
     * Initialise le module d'administration des scores
     */
    init() {
        // Vérifier si l'utilisateur est l'administrateur
        this.checkAdminStatus();

        // Si déjà initialisé, ne pas continuer
        if (this.isInitialized) {
            return;
        }

        // Marquer comme initialisé
        this.isInitialized = true;

        // Ajouter un écouteur pour la touche secrète (Ctrl+Alt+A)
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.altKey && event.key === 'a') {
                this.toggleAdminPanel();
            }
        });

        console.log("Module d'administration des scores initialisé");
    },

    /**
     * Vérifie si l'utilisateur actuel est l'administrateur
     */
    checkAdminStatus() {
        try {
            // Récupérer l'utilisateur actuel depuis localStorage
            const userJson = localStorage.getItem('english_quest_current_user');
            if (userJson) {
                const user = JSON.parse(userJson);

                // Vérifier si c'est l'administrateur par nom d'utilisateur
                if (user && user.username === this.adminUsername) {
                    this.isAdmin = true;
                    console.log("Statut d'administrateur vérifié");
                    return;
                }

                // Vérifier si l'utilisateur a le rôle d'administrateur
                if (user && user.isAdmin === true) {
                    this.isAdmin = true;
                    console.log("Statut d'administrateur vérifié (par rôle)");
                    return;
                }
            }

            // Si on arrive ici, l'utilisateur n'est pas administrateur
            this.isAdmin = false;
            console.log("Statut d'administrateur vérifié (non admin)");
        } catch (error) {
            console.error("Erreur lors de la vérification du statut d'administrateur:", error);
            this.isAdmin = false;
        }
    },

    /**
     * Récupère le nom d'utilisateur actuel
     * @returns {string} Le nom d'utilisateur
     */
    getCurrentUsername() {
        // Essayer de récupérer depuis le localStorage
        try {
            const userJson = localStorage.getItem('english_quest_current_user');
            if (userJson) {
                const user = JSON.parse(userJson);
                if (user && user.username) {
                    return user.username;
                }
            }
        } catch (e) {
            console.warn("Erreur lors de la récupération du profil depuis localStorage");
        }

        // Essayer de récupérer depuis getCurrentUser
        if (typeof window.getCurrentUser === 'function') {
            try {
                const currentUser = window.getCurrentUser();
                if (currentUser && currentUser.username) {
                    return currentUser.username;
                }
            } catch (error) {
                console.error("Erreur lors de l'appel à getCurrentUser");
            }
        }

        return null;
    },

    /**
     * Affiche ou masque le panneau d'administration
     */
    toggleAdminPanel() {
        // Vérifier si l'utilisateur est l'administrateur
        if (!this.isAdmin) {
            console.warn("Accès non autorisé au panneau d'administration");
            return;
        }

        // Vérifier si le panneau existe déjà
        let adminPanel = document.getElementById('admin-scores-panel');

        if (adminPanel) {
            // Si le panneau existe, le supprimer
            adminPanel.remove();
            console.log("Panneau d'administration fermé");
        } else {
            // Sinon, créer le panneau
            this.createAdminPanel();
        }
    },

    /**
     * Crée le panneau d'administration
     */
    createAdminPanel() {
        // Créer le panneau
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-scores-panel';
        adminPanel.className = 'admin-panel';

        // Ajouter le contenu du panneau
        adminPanel.innerHTML = `
            <div class="admin-panel-header">
                <h2>Administration des Scores</h2>
                <button id="close-admin-panel" class="close-button">&times;</button>
            </div>
            <div class="admin-panel-content">
                <div class="admin-section">
                    <h3>Scores en ligne</h3>
                    <div class="admin-scores-list" id="admin-online-scores">
                        <div class="loading">Chargement des scores...</div>
                    </div>
                </div>
                <div class="admin-section">
                    <h3>Scores locaux</h3>
                    <div class="admin-scores-list" id="admin-local-scores">
                        <div class="loading">Chargement des scores...</div>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le style CSS
        const style = document.createElement('style');
        style.textContent = `
            .admin-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                background-color: #1a1a1a;
                border: 2px solid #4CAF50;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                z-index: 9999;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .admin-panel-header {
                background-color: #2a2a2a;
                padding: 10px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #4CAF50;
            }

            .admin-panel-header h2 {
                margin: 0;
                color: #4CAF50;
                font-size: 1.2rem;
            }

            .close-button {
                background: none;
                border: none;
                color: #fff;
                font-size: 1.5rem;
                cursor: pointer;
            }

            .admin-panel-content {
                padding: 15px;
                overflow-y: auto;
                max-height: calc(80vh - 50px);
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .admin-section {
                background-color: #2a2a2a;
                border-radius: 5px;
                padding: 10px;
            }

            .admin-section h3 {
                margin-top: 0;
                color: #4CAF50;
                font-size: 1rem;
                border-bottom: 1px solid #444;
                padding-bottom: 5px;
            }

            .admin-scores-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .admin-score-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                border-bottom: 1px solid #333;
            }

            .admin-score-item:hover {
                background-color: #333;
            }

            .admin-score-info {
                flex: 1;
            }

            .admin-score-actions {
                display: flex;
                gap: 5px;
            }

            .admin-button {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 0.8rem;
            }

            .admin-button:hover {
                background-color: #45a049;
            }

            .admin-button.delete {
                background-color: #f44336;
            }

            .admin-button.delete:hover {
                background-color: #d32f2f;
            }

            .admin-edit-form {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 10px;
                background-color: #333;
                border-radius: 5px;
                margin-top: 10px;
            }

            .admin-form-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .admin-form-group label {
                font-size: 0.8rem;
                color: #ccc;
            }

            .admin-form-group input {
                padding: 5px;
                background-color: #444;
                border: 1px solid #555;
                color: white;
                border-radius: 3px;
            }

            .admin-form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 10px;
            }

            .loading {
                color: #ccc;
                font-style: italic;
                padding: 10px;
                text-align: center;
            }
        `;

        // Ajouter le panneau et le style au document
        document.body.appendChild(style);
        document.body.appendChild(adminPanel);

        // Ajouter les écouteurs d'événements
        document.getElementById('close-admin-panel').addEventListener('click', () => {
            adminPanel.remove();
        });

        // Charger les scores
        this.loadOnlineScores();
        this.loadLocalScores();

        console.log("Panneau d'administration créé");
    },

    /**
     * Charge les scores en ligne
     */
    loadOnlineScores() {
        const container = document.getElementById('admin-online-scores');
        if (!container) return;
        // Charger les scores depuis Firestore v9+
        const q = query(collection(db, 'speed_verb_scores'), orderBy('score', 'desc'), limit(20));
        getDocs(q)
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    container.innerHTML = '<div class="empty">Aucun score en ligne trouvé</div>';
                    return;
                }
                let html = '';
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'Date inconnue';

                    // Déterminer le nom du joueur (vérifier tous les champs possibles)
                    let playerName = 'Anonyme';
                    if (data.playerName) {
                        playerName = data.playerName;
                    } else if (data.name) {
                        playerName = data.name;
                    } else if (data.username) {
                        playerName = data.username;
                    } else if (data.displayName) {
                        playerName = data.displayName;
                    }

                    // Afficher l'ID utilisateur s'il est disponible
                    const userId = data.userId ? `<span class="user-id">(ID: ${data.userId})</span>` : '';

                    html += `
                        <div class="admin-score-item" data-id="${doc.id}" data-type="online">
                            <div class="admin-score-info">
                                <strong>${playerName}</strong> ${userId}<br>
                                <span>${data.score} points</span> -
                                <span>${date}</span>
                            </div>
                            <div class="admin-score-actions">
                                <button class="admin-button edit-score" data-id="${doc.id}" data-type="online">Éditer</button>
                                <button class="admin-button delete delete-score" data-id="${doc.id}" data-type="online">Supprimer</button>
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;

                // Ajouter les écouteurs d'événements
                this.addScoreEventListeners('online');
            })
            .catch((error) => {
                container.innerHTML = `<div class="error">Erreur lors du chargement des scores: ${error.message}</div>`;
            });
    },

    /**
     * Charge les scores locaux
     */
    loadLocalScores() {
        const container = document.getElementById('admin-local-scores');

        if (!container) {
            return;
        }

        // Récupérer les scores depuis le localStorage
        try {
            const localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            if (localScores.length === 0) {
                container.innerHTML = '<div class="empty">Aucun score local trouvé</div>';
                return;
            }

            // Trier les scores par ordre décroissant
            localScores.sort((a, b) => b.score - a.score);

            let html = '';

            localScores.forEach((score, index) => {
                const date = new Date(score.timestamp).toLocaleDateString();

                html += `
                    <div class="admin-score-item" data-index="${index}" data-type="local">
                        <div class="admin-score-info">
                            <strong>${score.playerName || 'Anonyme'}</strong> -
                            <span>${score.score} points</span> -
                            <span>${date}</span>
                            ${score.offline ? '<span class="offline-badge">hors ligne</span>' : ''}
                        </div>
                        <div class="admin-score-actions">
                            <button class="admin-button edit-score" data-index="${index}" data-type="local">Éditer</button>
                            <button class="admin-button delete delete-score" data-index="${index}" data-type="local">Supprimer</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Ajouter les écouteurs d'événements
            this.addScoreEventListeners('local');
        } catch (error) {
            console.error("Erreur lors du chargement des scores locaux:", error);
            container.innerHTML = `<div class="error">Erreur: ${error.message}</div>`;
        }
    },

    /**
     * Ajoute les écouteurs d'événements aux boutons d'édition et de suppression
     * @param {string} type - Le type de scores ('online' ou 'local')
     */
    addScoreEventListeners(type) {
        // Écouteurs pour les boutons d'édition
        document.querySelectorAll(`.edit-score[data-type="${type}"]`).forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                const index = event.target.getAttribute('data-index');

                if (type === 'online') {
                    this.editOnlineScore(id);
                } else {
                    this.editLocalScore(index);
                }
            });
        });

        // Écouteurs pour les boutons de suppression
        document.querySelectorAll(`.delete-score[data-type="${type}"]`).forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                const index = event.target.getAttribute('data-index');

                if (type === 'online') {
                    this.deleteOnlineScore(id);
                } else {
                    this.deleteLocalScore(index);
                }
            });
        });
    },

    /**
     * Édite un score en ligne
     * @param {string} id - L'ID du document Firebase
     */
    async editOnlineScore(id) {
        // Récupérer le score depuis Firestore v9+
        try {
            const scoreDoc = await getDoc(doc(db, 'speed_verb_scores', id));
            if (!scoreDoc.exists()) {
                alert("Score non trouvé");
                return;
            }
            const data = scoreDoc.data();
            // Créer le formulaire d'édition
            const scoreItem = document.querySelector(`.admin-score-item[data-id="${id}"][data-type="online"]`);
            if (!scoreItem) return;
            if (scoreItem.querySelector('.admin-edit-form')) return;
            const form = document.createElement('div');
            form.className = 'admin-edit-form';
            form.innerHTML = `
                <div class="admin-form-group">
                    <label for="edit-name-${id}">Nom du joueur</label>
                    <input type="text" id="edit-name-${id}" value="${data.playerName || ''}">
                </div>
                <div class="admin-form-group">
                    <label for="edit-score-${id}">Score</label>
                    <input type="number" id="edit-score-${id}" value="${data.score || 0}">
                </div>
                <div class="admin-form-actions">
                    <button class="admin-button cancel-edit" data-id="${id}" data-type="online">Annuler</button>
                    <button class="admin-button save-edit" data-id="${id}" data-type="online">Enregistrer</button>
                </div>
            `;
            scoreItem.appendChild(form);
            form.querySelector('.cancel-edit').addEventListener('click', () => {
                form.remove();
            });
            form.querySelector('.save-edit').addEventListener('click', async () => {
                const newName = document.getElementById(`edit-name-${id}`).value;
                const newScore = parseInt(document.getElementById(`edit-score-${id}`).value);
                try {
                    await updateDoc(doc(db, 'speed_verb_scores', id), {
                        playerName: newName,
                        score: newScore
                    });
                    alert("Score mis à jour avec succès");
                    form.remove();
                    this.loadOnlineScores();
                } catch (error) {
                    console.error("Erreur lors de la mise à jour du score:", error);
                    alert(`Erreur: ${error.message}`);
                }
            });
        } catch (error) {
            console.error("Erreur lors de la récupération du score:", error);
            alert(`Erreur: ${error.message}`);
        }
    },

    /**
     * Édite un score local
     * @param {number} index - L'index du score dans le tableau
     */
    editLocalScore(index) {
        // Récupérer les scores depuis le localStorage
        try {
            const localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            if (index < 0 || index >= localScores.length) {
                alert("Score non trouvé");
                return;
            }

            const score = localScores[index];

            // Créer le formulaire d'édition
            const scoreItem = document.querySelector(`.admin-score-item[data-index="${index}"][data-type="local"]`);

            if (!scoreItem) {
                return;
            }

            // Vérifier si le formulaire existe déjà
            if (scoreItem.querySelector('.admin-edit-form')) {
                return;
            }

            const form = document.createElement('div');
            form.className = 'admin-edit-form';
            form.innerHTML = `
                <div class="admin-form-group">
                    <label for="edit-name-local-${index}">Nom du joueur</label>
                    <input type="text" id="edit-name-local-${index}" value="${score.playerName || ''}">
                </div>
                <div class="admin-form-group">
                    <label for="edit-score-local-${index}">Score</label>
                    <input type="number" id="edit-score-local-${index}" value="${score.score || 0}">
                </div>
                <div class="admin-form-actions">
                    <button class="admin-button cancel-edit" data-index="${index}" data-type="local">Annuler</button>
                    <button class="admin-button save-edit" data-index="${index}" data-type="local">Enregistrer</button>
                </div>
            `;

            // Ajouter le formulaire
            scoreItem.appendChild(form);

            // Ajouter les écouteurs d'événements
            form.querySelector('.cancel-edit').addEventListener('click', () => {
                form.remove();
            });

            form.querySelector('.save-edit').addEventListener('click', () => {
                const newName = document.getElementById(`edit-name-local-${index}`).value;
                const newScore = parseInt(document.getElementById(`edit-score-local-${index}`).value);

                // Mettre à jour le score
                localScores[index].playerName = newName;
                localScores[index].score = newScore;

                // Sauvegarder les scores
                localStorage.setItem('localScores', JSON.stringify(localScores));

                alert("Score mis à jour avec succès");
                form.remove();
                this.loadLocalScores();
            });
        } catch (error) {
            console.error("Erreur lors de l'édition du score local:", error);
            alert(`Erreur: ${error.message}`);
        }
    },

    /**
     * Supprime un score en ligne
     * @param {string} id - L'ID du document Firebase
     */
    async deleteOnlineScore(id) {
        // Demander confirmation
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce score ?")) {
            return;
        }
        try {
            await deleteDoc(doc(db, 'speed_verb_scores', id));
            alert("Score supprimé avec succès");
            this.loadOnlineScores();
        } catch (error) {
            console.error("Erreur lors de la suppression du score:", error);
            alert(`Erreur: ${error.message}`);
        }
    },

    /**
     * Supprime un score local
     * @param {number} index - L'index du score dans le tableau
     */
    deleteLocalScore(index) {
        // Récupérer les scores depuis le localStorage
        try {
            const localScores = JSON.parse(localStorage.getItem('localScores')) || [];

            if (index < 0 || index >= localScores.length) {
                alert("Score non trouvé");
                return;
            }

            // Demander confirmation
            if (!confirm("Êtes-vous sûr de vouloir supprimer ce score ?")) {
                return;
            }

            // Supprimer le score
            localScores.splice(index, 1);

            // Sauvegarder les scores
            localStorage.setItem('localScores', JSON.stringify(localScores));

            alert("Score supprimé avec succès");
            this.loadLocalScores();
        } catch (error) {
            console.error("Erreur lors de la suppression du score local:", error);
            alert(`Erreur: ${error.message}`);
        }
    }
};

// Initialiser le module au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    AdminScores.init();
});

// Exporter le module
window.AdminScores = AdminScores;
