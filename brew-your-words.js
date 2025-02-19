// Données du jeu
const gameData = {
    score: 0,
    level: 1,
    timeLeft: 90,
    timer: null,
    isPlaying: false,
    activeClients: [],
    clientGenerationTimer: null
};

// Images des clients
const customerImages = [
    "images/customer_1.jpg",
    "images/customer_2.jpg",
    "images/customer_3.jpg",
    "images/customer_4.jpg"
];

// Phrases du jeu avec niveaux de difficulté
const phrases = [
    { english: "By the way,", french: "Au fait,", difficulty: 1 },
    { english: "As far as I know,", french: "Autant que je sache,", difficulty: 1 },
    { english: "That’s a good idea!", french: "C'est une bonne idée !", difficulty: 1 },
    { english: "It depends.", french: "Ça dépend.", difficulty: 1 },
    { english: "No worries!", french: "Pas de souci !", difficulty: 1 },
    { english: "It doesn’t matter.", french: "Ce n'est pas grave.", difficulty: 1 },
    { english: "I don’t mind.", french: "Ça ne me dérange pas.", difficulty: 1 },
    { english: "Let me think.", french: "Laissez-moi réfléchir.", difficulty: 1 },
    { english: "Sounds good!", french: "Ça me va !", difficulty: 1 },
    { english: "I have no idea.", french: "Je n'en ai aucune idée.", difficulty: 1 },

    // Niveau 2 - Expressions courantes et phrases utiles
    { english: "I see what you mean.", french: "Je vois ce que tu veux dire.", difficulty: 2 },
    { english: "That makes sense.", french: "Ça a du sens.", difficulty: 2 },
    { english: "To be honest,", french: "Pour être honnête,", difficulty: 2 },
    { english: "If I were you, I would...", french: "Si j'étais toi, je...", difficulty: 2 },
    { english: "I haven't thought about it.", french: "Je n'y ai pas pensé.", difficulty: 2 },
    { english: "You’re absolutely right!", french: "Tu as tout à fait raison !", difficulty: 2 },
    { english: "It’s not worth it.", french: "Ça n'en vaut pas la peine.", difficulty: 2 },
    { english: "I’m not sure about that.", french: "Je ne suis pas sûr de ça.", difficulty: 2 },
    { english: "I didn't expect that!", french: "Je ne m'y attendais pas !", difficulty: 2 },
    { english: "Let’s agree to disagree.", french: "On va dire qu'on n'est pas d'accord.", difficulty: 2 },

    // Niveau 3 - Expressions plus avancées et idiomatiques
    { english: "Let’s get straight to the point.", french: "Allons droit au but.", difficulty: 3 },
    { english: "That’s easier said than done.", french: "C'est plus facile à dire qu'à faire.", difficulty: 3 },
    { english: "At the end of the day,", french: "Au bout du compte,", difficulty: 3 },
    { english: "I couldn’t care less.", french: "Je m’en fiche complètement.", difficulty: 3 },
    { english: "I’m on the fence about it.", french: "J'hésite à ce sujet.", difficulty: 3 },
    { english: "I wouldn't bet on it.", french: "Je n'y mettrais pas ma main à couper.", difficulty: 3 },
    { english: "You took the words right out of my mouth.", french: "Tu as dit exactement ce que je pensais.", difficulty: 3 },
    { english: "No pain, no gain.", french: "On n’a rien sans rien.", difficulty: 3 },
    { english: "Let’s call it a day.", french: "On s’arrête là pour aujourd’hui.", difficulty: 3 },
    { english: "It’s a no-brainer.", french: "C'est évident.", difficulty: 3 }
];

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les éléments du DOM
    const startButton = document.getElementById('start-button');
    const clientQueue = document.getElementById('client-queue');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('global-timer');
    const gameOverModal = document.getElementById('game-over-modal');
    const scoreForm = document.getElementById('score-form');

    // Fonction pour réinitialiser le jeu
function resetGame() {
        // Réinitialiser les données du jeu
        gameData.score = 0;
        gameData.level = 1;
        gameData.timeLeft = 90;
        gameData.isPlaying = true;
        gameData.activeClients = [];

        // Arrêter tous les timers existants
        if (gameData.timer) clearInterval(gameData.timer);
        if (gameData.clientGenerationTimer) clearInterval(gameData.clientGenerationTimer);

        // Nettoyer l'interface
        if (clientQueue) clientQueue.innerHTML = '';
        if (gameOverModal) gameOverModal.classList.remove('active');
        
        // Mettre à jour l'affichage
        updateDisplay();
        
        // Cacher le bouton de démarrage
        if (startButton) startButton.style.display = 'none';
    }

    // Fonction pour démarrer le jeu
function startGame() {
    resetGame();
        startTimer();
        startRandomClientGeneration();
    }

    // Fonction pour générer des clients de manière aléatoire
    function startRandomClientGeneration() {
        // Générer le premier client immédiatement
        generateNewClient();

        // Configurer la génération aléatoire
        function scheduleNextClient() {
            const minDelay = 5000; // 2 secondes minimum
            const maxDelay = 8000; // 5 secondes maximum
            const delay = Math.random() * (maxDelay - minDelay) + minDelay;

            setTimeout(() => {
                if (gameData.isPlaying) {
                    generateNewClient();
                    scheduleNextClient();
                }
            }, delay);
        }

        scheduleNextClient();
    }

    // Fonction pour générer un nouveau client
    function generateNewClient() {
        if (!gameData.isPlaying || gameData.activeClients.length >= 4) return;

        // Déterminer le nombre de commandes (1-3) basé sur le niveau
        const orderCount = Math.min(Math.floor(Math.random() * gameData.level) + 1, 3);
        const orders = [];

        // Sélectionner des phrases aléatoires pour les commandes
        for (let i = 0; i < orderCount; i++) {
            const availablePhrases = phrases.filter(p => p.difficulty <= gameData.level);
            const randomPhrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
            orders.push(randomPhrase);
        }

        // Ajuster le temps en fonction du nombre de commandes
        const timePerOrder = 10; // 10 secondes par commande
        const clientTime = orderCount * timePerOrder;

        const client = {
            id: Date.now(),
            orders: orders,
            image: customerImages[Math.floor(Math.random() * customerImages.length)],
            timeLeft: clientTime, // 10s pour 1 commande, 20s pour 2, 30s pour 3
            mistakes: 0,
            completedOrders: 0
        };

        gameData.activeClients.push(client);
        createClientElement(client);
        startClientTimer(client);
    }

    // Fonction pour créer l'élément client
    function createClientElement(client) {
        if (!clientQueue) return;

    const clientElement = document.createElement('div');
        clientElement.className = 'client';
    clientElement.id = `client-${client.id}`;
        
        let ordersHTML = client.orders.map((order, index) => `
            <div class="order ${client.completedOrders > index ? 'completed' : ''}" data-order-index="${index}">
                <div class="client-phrase">${order.english}</div>
                <div class="translation-options"></div>
            </div>
        `).join('');

    clientElement.innerHTML = `
            <img src="${client.image}" alt="Customer" class="client-avatar">
            <div class="client-content">
                <div class="orders-container">${ordersHTML}</div>
                <div class="client-timer">${client.timeLeft}s</div>
            </div>
        `;

        // Créer les options de traduction pour chaque commande
        client.orders.forEach((order, index) => {
            const optionsContainer = clientElement.querySelector(`[data-order-index="${index}"] .translation-options`);
            createTranslationOptions(client, order, index, optionsContainer);
        });

    clientQueue.appendChild(clientElement);
    }

    // Fonction pour créer les options de traduction
    function createTranslationOptions(client, order, orderIndex, container) {
        let options = [order.french];
        while (options.length < 3) {
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            if (!options.includes(randomPhrase.french)) {
                options.push(randomPhrase.french);
            }
        }

        options = options.sort(() => Math.random() - 0.5);

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'translation-option';
            button.textContent = option;
            button.addEventListener('click', () => handleTranslation(client, order, orderIndex, option));
            container.appendChild(button);
        });
    }

    // Fonction pour gérer la traduction
    function handleTranslation(client, order, orderIndex, answer) {
        const isCorrect = answer === order.french;
        
        if (isCorrect) {
            client.completedOrders++;
            showFeedback('Correct!', 'success', client.id);
            
            // Marquer la commande comme complétée
            const orderElement = document.querySelector(`#client-${client.id} [data-order-index="${orderIndex}"]`);
            if (orderElement) {
                orderElement.classList.add('completed');
            }

            // Si toutes les commandes sont complétées
            if (client.completedOrders === client.orders.length) {
                gameData.score += Math.ceil(client.timeLeft * client.orders.length);
                removeClient(client);
                
                // Augmenter le niveau tous les 5 clients satisfaits
                if (gameData.score > gameData.level * 50) {
                    gameData.level = Math.min(gameData.level + 1, 3);
                }
            }
        } else {
            client.mistakes++;
            gameData.score = Math.max(0, gameData.score - 5);
            showFeedback('Incorrect!', 'error', client.id);
            
            if (client.mistakes >= 3) {
                removeClient(client);
            }
        }

        updateDisplay();
    }

    // Fonction pour démarrer le timer d'un client
    function startClientTimer(client) {
        const timer = setInterval(() => {
            client.timeLeft--;
            updateClientTimer(client);
            
            if (client.timeLeft <= 0) {
                clearInterval(timer);
                gameData.score = Math.max(0, gameData.score - 10);
                removeClient(client);
                updateDisplay();
            }
            }, 1000);
        }
        
    // Fonction pour mettre à jour le timer d'un client
    function updateClientTimer(client) {
        const timerElement = document.querySelector(`#client-${client.id} .client-timer`);
        if (timerElement) {
            timerElement.textContent = `${client.timeLeft}s`;
        }
    }

    // Fonction pour retirer un client
    function removeClient(client) {
        const clientElement = document.getElementById(`client-${client.id}`);
        if (clientElement) {
            clientElement.classList.add('leaving');
            setTimeout(() => clientElement.remove(), 500);
        }
        gameData.activeClients = gameData.activeClients.filter(c => c.id !== client.id);
    }

    // Fonction pour afficher le feedback
    function showFeedback(message, type, clientId) {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message feedback-${type}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1000);
    }

    // Fonction pour mettre à jour l'affichage
    function updateDisplay() {
        if (scoreDisplay) scoreDisplay.textContent = gameData.score;
        if (timerDisplay) timerDisplay.textContent = gameData.timeLeft;
    }

    // Fonction pour démarrer le timer
    function startTimer() {
        if (gameData.timer) clearInterval(gameData.timer);
        
        gameData.timer = setInterval(() => {
            gameData.timeLeft--;
            if (timerDisplay) timerDisplay.textContent = gameData.timeLeft;
            
            if (gameData.timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // Fonction pour terminer le jeu
    function endGame() {
        gameData.isPlaying = false;
        if (gameData.timer) clearInterval(gameData.timer);
        if (gameOverModal) gameOverModal.classList.add('active');
        if (startButton) startButton.style.display = 'block';
    }

    // Gestionnaire pour le formulaire de score
    if (scoreForm) {
        scoreForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const playerName = document.getElementById('player-name')?.value;
            if (playerName) {
                saveScore(playerName);
            }
        });
    }

    // Fonction pour sauvegarder le score
    function saveScore(playerName) {
    db.collection("brewYourWordsScores").add({
        name: playerName,
            score: gameData.score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            if (gameOverModal) gameOverModal.classList.remove('active');
            loadTopScores();
        });
    }

    // Fonction pour charger les meilleurs scores
    function loadTopScores() {
        const topScoresList = document.getElementById('top-scores-list');
        if (!topScoresList) return;

    db.collection("brewYourWordsScores")
        .orderBy("score", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
                topScoresList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                    const li = document.createElement('li');
                li.textContent = `${doc.data().name}: ${doc.data().score}`;
                topScoresList.appendChild(li);
            });
            });
    }

    // Initialisation
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    loadTopScores();
});



