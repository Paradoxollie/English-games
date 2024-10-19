let level = 1;
let score = 0;
let globalTime = 90; // Timer général de 90 secondes
let globalTimerInterval;
let activeClients = [];  // Liste des clients en attente
let clientGenerationInterval;
const clientQueue = document.getElementById('client-queue');
const messageElement = document.getElementById('message');
const globalTimerElement = document.getElementById('global-timer');

// Tableau d'images pour les clients
const customerImages = [
    "images/customer_1.jpg",
    "images/customer_2.jpg",
    "images/customer_3.jpg",
    "images/customer_4.jpg"
];

// Réinitialiser le jeu
function resetGame() {
    clearInterval(globalTimerInterval);
    clearInterval(clientGenerationInterval);
    clientQueue.innerHTML = '';
    messageElement.innerText = '';
    document.getElementById('start-button').style.display = 'none';
    level = 1;
    score = 0;
    globalTime = 90;
    activeClients = [];
    updateScore();
}

// Démarrer le jeu avec le timer global
function startGame() {
    console.log("Le jeu commence");
    resetGame();
    addNewClient(); // Ajouter le premier client
    startGlobalTimer(globalTime);
    startClientGeneration(); // Commencer la génération continue de clients
}

let clientIdCounter = 0;

function generateClientId() {
    clientIdCounter++;
    return clientIdCounter;
}

function addNewClient() {
    console.log("Ajout d'un nouveau client");
    const newClient = generateClient(generateClientId());
    activeClients.push(newClient);
    displayClient(newClient);
}

function startGame() {
    console.log("Le jeu commence");
    resetGame();
    addNewClient(); // Ajouter le premier client
    startGlobalTimer(globalTime);
    startClientGeneration();
}

function startClientGeneration() {
    console.log("Démarrage de la génération de clients");
    clientGenerationInterval = setInterval(() => {
        addNewClient();
    }, 5000);
}

let gameActive = true;

function completeClient(clientId) {
    if (!gameActive) return; // Ne pas modifier si le jeu est terminé
    const client = activeClients.find(c => c.id === clientId);
    score += 10 * client.clientPhrases.length; // Bonus pour chaque phrase correcte
    updateScore();
    messageElement.innerText = `Order completed for client #${clientId}!`;
    removeClient(clientId);
    addNewClient(); // Ajouter un nouveau client
}

function failOrder(clientId) {
    if (!gameActive) return; // Ne pas modifier si le jeu est terminé
    score -= 10; // Malus supplémentaire
    updateScore();
    messageElement.innerText = `Failed to complete the order for client #${clientId}.`;
    removeClient(clientId);
    addNewClient(); // Ajouter un nouveau client
}


// Supprimer une commande complétée ou échouée
function removeClient(clientId) {
    activeClients = activeClients.filter(c => c.id !== clientId);
    const clientElement = document.getElementById(`client-${clientId}`);
    if (clientElement) {
        clientElement.remove();
    }
}

// Afficher chaque client dans une boîte séparée avec un timer pour chaque commande
function displayClient(client) {
    console.log("Affichage du client", client.id);
    const clientElement = document.createElement('div');
    clientElement.id = `client-${client.id}`;
    clientElement.classList.add('client-box');
    
    // Sélectionner une image de client aléatoire
    const randomImage = customerImages[Math.floor(Math.random() * customerImages.length)];
    
    const phrasesHTML = client.clientPhrases.map(clientPhrase => `
        <div class="bubble" id="${clientPhrase.id}">
            <p>${clientPhrase.phrase}</p>
            ${clientPhrase.options.map(opt => `<button onclick="checkAnswer('${opt}', ${client.id}, '${clientPhrase.id}')">${opt}</button>`).join('')}
        </div>`).join('');

    clientElement.innerHTML = `
        <img src="${randomImage}" class="client-icon">
        ${phrasesHTML}
        <div class="timer" id="timer-${client.id}">${client.time} s</div>
    `;
    clientQueue.appendChild(clientElement);

    startOrderTimer(client.id, client.time);
}

// Supprimer une commande complétée ou échouée
function removeClient(clientId) {
    activeClients = activeClients.filter(c => c.id !== clientId);
    const clientElement = document.getElementById(`client-${clientId}`);
    if (clientElement) {
        clientElement.remove();
    }
}

// Démarrer un timer pour chaque commande
function startOrderTimer(clientId, time) {
    const timerElement = document.getElementById(`timer-${clientId}`);
    const interval = setInterval(() => {
        if (time <= 0) {
            clearInterval(interval);
            failOrder(clientId);
        } else {
            time--;
            timerElement.innerText = `${time} s`;
        }
    }, 1000);
}

// Gérer une commande échouée (temps écoulé ou trop d'erreurs)
function failOrder(clientId) {
    score -= 10; // Malus supplémentaire pour une commande échouée
    updateScore();
    messageElement.innerText = `Failed to complete the order for client #${clientId}.`;
    removeClient(clientId);
}

// Vérifier la réponse sélectionnée pour une phrase spécifique
function checkAnswer(answer, clientId, phraseId) {
    const client = activeClients.find(c => c.id === clientId);
    const clientPhrase = client.clientPhrases.find(p => p.id === phraseId);

    // Normaliser les chaînes pour la comparaison
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrectTranslation = clientPhrase.correctTranslation.trim().toLowerCase();

    if (normalizedAnswer === normalizedCorrectTranslation) {
        clientPhrase.completed = true;
        const phraseElement = document.getElementById(phraseId);
        if (phraseElement) {
            phraseElement.style.backgroundColor = 'lightgreen';
            phraseElement.querySelectorAll('button').forEach(btn => btn.disabled = true);
        } else {
            console.error(`Phrase element with id ${phraseId} not found.`);
        }
        // Vérifier si toutes les phrases de la commande sont complétées
        if (client.clientPhrases.every(p => p.completed)) {
            completeClient(clientId);
        }
    } else {
        client.errors++; // Incrémenter le compteur d'erreurs
        score -= 5;  // Malus en cas de mauvaise réponse
        updateScore();
        
        const clientElement = document.getElementById(`client-${clientId}`);
        clientElement.style.backgroundColor = 'lightcoral'; // Changer la couleur de fond en rouge
        
        messageElement.innerText = `Incorrect translation for client #${clientId}.`;

        // Faire disparaître la commande après 3 erreurs
        if (client.errors >= 2) {
            setTimeout(() => {
                failOrder(clientId);
            }, 1000); // Attendre 1 seconde avant de faire disparaître la commande
        } else {
            // Remettre la couleur de fond normale après 1 seconde
            setTimeout(() => {
                clientElement.style.backgroundColor = '';
            }, 1000);
        }
    }
}

// Compléter la commande d'un client
function completeClient(clientId) {
    const client = activeClients.find(c => c.id === clientId);
    score += 10 * client.clientPhrases.length; // Bonus pour chaque phrase correcte
    updateScore();
    messageElement.innerText = `Order completed for client #${clientId}!`;
    removeClient(clientId);

    // Ajouter aléatoirement 1 ou 2 nouveaux clients
    const newClientsCount = Math.floor(Math.random() * 2) + 1; // 1 ou 2
    for (let i = 0; i < newClientsCount; i++) {
        addNewClient();
    }
}



// Fonction pour mélanger un tableau
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Générer un client avec un nombre aléatoire de phrases (1 à 3)
function generateClient(id) {
    const phrases = [
        { phrase: "Advantage", correctTranslation: "Avantage", options: ["Avantage", "Desavantage", "Benefice"], time: 9 },
        { phrase: "Nevertheless", correctTranslation: "Neanmoins", options: ["Neanmoins", "Toutefois", "Parce que"], time: 8 },
        { phrase: "Eventually", correctTranslation: "Finalement", options: ["Finalement", "Bientot", "Prochainement"], time: 10 },
        { phrase: "Despite", correctTranslation: "Malgre", options: ["Malgre", "Grace a", "En raison de"], time: 7 },
        { phrase: "However", correctTranslation: "Cependant", options: ["Cependant", "Toujours", "Parce que"], time: 9 },
        { phrase: "Although", correctTranslation: "Bien que", options: ["Bien que", "Parce que", "Puisque"], time: 8 },
        { phrase: "Therefore", correctTranslation: "Par consequent", options: ["Par consequent", "Neanmoins", "Car"], time: 11 },
        { phrase: "Moreover", correctTranslation: "De plus", options: ["De plus", "En outre", "Par contre"], time: 10 },
        { phrase: "Consequently", correctTranslation: "En consequence", options: ["En consequence", "Cependant", "Neanmoins"], time: 10 },
        { phrase: "According to", correctTranslation: "Selon", options: ["Selon", "Contre", "Avec"], time: 8 },
        { phrase: "In spite of", correctTranslation: "En depit de", options: ["En depit de", "Grace a", "Malgre"], time: 9 },
        { phrase: "Furthermore", correctTranslation: "En outre", options: ["En outre", "De plus", "A cote"], time: 7 },
        { phrase: "In addition to", correctTranslation: "En plus de", options: ["En plus de", "En dehors de", "A cause de"], time: 9 },
        { phrase: "On the other hand", correctTranslation: "D un autre cote", options: ["D un autre cote", "Par ailleurs", "Ainsi"], time: 11 },
        { phrase: "Due to", correctTranslation: "En raison de", options: ["En raison de", "Grace a", "En depit de"], time: 9 },
        { phrase: "As a result", correctTranslation: "Par consequent", options: ["Par consequent", "Ainsi", "En revanche"], time: 12 },
        { phrase: "Despite the fact", correctTranslation: "Bien que", options: ["Bien que", "Malgre", "Car"], time: 8 },
        { phrase: "In order to", correctTranslation: "Afin de", options: ["Afin de", "Pour", "Avec"], time: 9 },
        { phrase: "Unless", correctTranslation: "A moins que", options: ["A moins que", "Si", "Bien que"], time: 7 },
        { phrase: "Even though", correctTranslation: "Meme si", options: ["Meme si", "Bien que", "Car"], time: 8 },
        { phrase: "Regardless of", correctTranslation: "Independamment de", options: ["Independamment de", "En raison de", "Malgre"], time: 10 },
        { phrase: "As soon as", correctTranslation: "Des que", options: ["Des que", "Lorsque", "Si"], time: 9 },
        { phrase: "Provided that", correctTranslation: "A condition que", options: ["A condition que", "Si", "Parce que"], time: 11 },
        { phrase: "By the time", correctTranslation: "D ici a ce que", options: ["D ici a ce que", "Lorsque", "Avant"], time: 10 },
        { phrase: "Once in a while", correctTranslation: "De temps en temps", options: ["De temps en temps", "Jamais", "Toujours"], time: 9 },
        { phrase: "On condition that", correctTranslation: "A condition que", options: ["A condition que", "Si", "Lorsque"], time: 10 },
        { phrase: "On the whole", correctTranslation: "Dans l ensemble", options: ["Dans l ensemble", "Partiellement", "Completement"], time: 8 },
        { phrase: "In contrast to", correctTranslation: "Contrairement a", options: ["Contrairement a", "A cause de", "Grace a"], time: 9 },
        { phrase: "In terms of", correctTranslation: "En termes de", options: ["En termes de", "Au niveau de", "A propos de"], time: 10 },
        { phrase: "When it comes to", correctTranslation: "Quand il s agit de", options: ["Quand il s agit de", "Dans le cas ou", "Lorsque"], time: 10 },
        { phrase: "Not to mention", correctTranslation: "Sans parler de", options: ["Sans parler de", "Grace a", "De plus"], time: 8 },
        { phrase: "To sum up", correctTranslation: "Pour resumer", options: ["Pour resumer", "En consequence", "Cependant"], time: 8 },
        { phrase: "To put it simply", correctTranslation: "Pour simplifier", options: ["Pour simplifier", "Pour clarifier", "En resume"], time: 9 },
        { phrase: "For instance", correctTranslation: "Par exemple", options: ["Par exemple", "Ainsi", "En resume"], time: 9 },
        { phrase: "That being said", correctTranslation: "Cela dit", options: ["Cela dit", "En conclusion", "Toutefois"], time: 10 },
        { phrase: "In other words", correctTranslation: "En d autres termes", options: ["En d autres termes", "Pour resumer", "Car"], time: 9 },
        { phrase: "To a certain extent", correctTranslation: "Dans une certaine mesure", options: ["Dans une certaine mesure", "Completement", "Rarement"], time: 10 },
        { phrase: "Even if", correctTranslation: "Meme si", options: ["Meme si", "Car", "Ainsi"], time: 8 },
        { phrase: "Rather than", correctTranslation: "Plutot que", options: ["Plutot que", "Au lieu de", "Si"], time: 9 },
        { phrase: "As far as", correctTranslation: "En ce qui concerne", options: ["En ce qui concerne", "Dans le cadre de", "Concernant"], time: 10 },
        { phrase: "At the same time", correctTranslation: "En meme temps", options: ["En meme temps", "Pendant", "Apres"], time: 9 },
        { phrase: "In the meantime", correctTranslation: "Entre-temps", options: ["Entre-temps", "Cependant", "Pendant"], time: 8 },
        { phrase: "For the time being", correctTranslation: "Pour le moment", options: ["Pour le moment", "Actuellement", "Bientot"], time: 10 },
        { phrase: "From now on", correctTranslation: "Desormais", options: ["Desormais", "Prochainement", "Recemment"], time: 9 },
        { phrase: "By no means", correctTranslation: "En aucun cas", options: ["En aucun cas", "Peut-etre", "Certainement"], time: 9 },
        { phrase: "As well as", correctTranslation: "Aussi bien que", options: ["Aussi bien que", "En plus de", "Au moins de"], time: 10 },
        { phrase: "In case", correctTranslation: "Au cas ou", options: ["Au cas ou", "Bien que", "Si"], time: 9 },
        { phrase: "In the long run", correctTranslation: "A long terme", options: ["A long terme", "En fin de compte", "A court terme"], time: 9 },
        { phrase: "More often than not", correctTranslation: "Le plus souvent", options: ["Le plus souvent", "Rarement", "Toujours"], time: 9 },
        { phrase: "In my opinion", correctTranslation: "A mon avis", options: ["A mon avis", "En fait", "En outre"], time: 7 },
        { phrase: "As far as I know", correctTranslation: "Autant que je sache", options: ["Autant que je sache", "Grace a", "A condition que"], time: 9 },
        { phrase: "To be honest", correctTranslation: "Pour etre honnete", options: ["Pour etre honnete", "Finalement", "Evidemment"], time: 8 },
        { phrase: "Without a doubt", correctTranslation: "Sans aucun doute", options: ["Sans aucun doute", "Malheureusement", "Avec hesitation"], time: 10 },
        { phrase: "All of a sudden", correctTranslation: "Tout a coup", options: ["Tout a coup", "Petit a petit", "Malheureusement"], time: 9 },
        { phrase: "Without hesitation", correctTranslation: "Sans hesitation", options: ["Sans hesitation", "Avec peur", "Avec doute"], time: 8 },
        { phrase: "Little by little", correctTranslation: "Petit a petit", options: ["Petit a petit", "Tout a coup", "Immediatement"], time: 9 },
        { phrase: "Step by step", correctTranslation: "Pas a pas", options: ["Pas a pas", "En une fois", "Soudainement"], time: 10 },
        { phrase: "At the end of the day", correctTranslation: "Au final", options: ["Au final", "En revanche", "Cependant"], time: 9 },
        { phrase: "To a certain degree", correctTranslation: "Dans une certaine mesure", options: ["Dans une certaine mesure", "Absolument", "Rarement"], time: 9 },
        { phrase: "For the sake of", correctTranslation: "Pour le bien de", options: ["Pour le bien de", "A cause de", "Malgre"], time: 8 },
        { phrase: "On behalf of", correctTranslation: "Au nom de", options: ["Au nom de", "A cause de", "Par contre"], time: 8 },
        { phrase: "It is worth noting", correctTranslation: "Il est a noter", options: ["Il est a noter", "En conclusion", "En resume"], time: 9 },
        { phrase: "In other respects", correctTranslation: "Sur d autres aspects", options: ["Sur d autres aspects", "Sur ces bases", "Sur cette condition"], time: 10 },
        { phrase: "Be that as it may", correctTranslation: "Quoi qu il en soit", options: ["Quoi qu il en soit", "En revanche", "En d autres termes"], time: 10 },
        { phrase: "There is no doubt", correctTranslation: "Il n y a aucun doute", options: ["Il n y a aucun doute", "Il y a un doute", "A ce sujet"], time: 8 },
        { phrase: "As I said before", correctTranslation: "Comme je l ai dit avant", options: ["Comme je l ai dit avant", "Comme je dirais", "Comme c est le cas"], time: 8 },
        { phrase: "In the same vein", correctTranslation: "Dans la meme ligne", options: ["Dans la meme ligne", "Dans le meme ordre", "Dans cette direction"], time: 9 },
        { phrase: "It should be noted", correctTranslation: "Il faut noter", options: ["Il faut noter", "Il est a noter", "C est a dire"], time: 9 },
        { phrase: "At your convenience", correctTranslation: "A votre convenance", options: ["A votre convenance", "A votre place", "En votre faveur"], time: 10 },
        { phrase: "For the most part", correctTranslation: "Pour la plupart", options: ["Pour la plupart", "Dans certains cas", "Dans tous les cas"], time: 8 },
        { phrase: "In the context of", correctTranslation: "Dans le contexte de", options: ["Dans le contexte de", "Dans le cadre de", "Par rapport a"], time: 9 },
        { phrase: "For the purpose of", correctTranslation: "Dans le but de", options: ["Dans le but de", "A des fins de", "A cause de"], time: 9 },
        { phrase: "In the aftermath of", correctTranslation: "A la suite de", options: ["A la suite de", "En depit de", "Par consequent"], time: 10 },
        { phrase: "In light of", correctTranslation: "A la lumiere de", options: ["A la lumiere de", "En depit de", "Grace a"], time: 9 },
        { phrase: "As a general rule", correctTranslation: "En regle generale", options: ["En regle generale", "Par consequence", "Par hasard"], time: 9 },
        { phrase: "In no way", correctTranslation: "En aucune maniere", options: ["En aucune maniere", "De toute maniere", "Sans doute"], time: 9 },
        { phrase: "At first glance", correctTranslation: "A premiere vue", options: ["A premiere vue", "A la fin", "A tout moment"], time: 9 },
        { phrase: "All things considered", correctTranslation: "Tout bien considere", options: ["Tout bien considere", "En tout cas", "A vrai dire"], time: 9 },
        { phrase: "For better or for worse", correctTranslation: "Pour le meilleur ou pour le pire", options: ["Pour le meilleur ou pour le pire", "A bon ou a mauvais", "Pour de bon"], time: 10 },
        { phrase: "On the contrary", correctTranslation: "Au contraire", options: ["Au contraire", "En revanche", "De l autre cote"], time: 9 },
        { phrase: "In the midst of", correctTranslation: "Au milieu de", options: ["Au milieu de", "Au cours de", "En marge de"], time: 8 },
        { phrase: "As a last resort", correctTranslation: "En dernier recours", options: ["En dernier recours", "A la fin", "En conclusion"], time: 9 },
        { phrase: "Under no circumstances", correctTranslation: "En aucun cas", options: ["En aucun cas", "Dans tous les cas", "Dans ce cas"], time: 9 },
        { phrase: "To some extent", correctTranslation: "Dans une certaine mesure", options: ["Dans une certaine mesure", "Partiellement", "Completement"], time: 9 },
        { phrase: "Out of the blue", correctTranslation: "Sans prevenir", options: ["Sans prevenir", "Tout a coup", "Petit a petit"], time: 8 },
        { phrase: "For the time being", correctTranslation: "Pour le moment", options: ["Pour le moment", "Desormais", "A jamais"], time: 8 },
        { phrase: "For instance", correctTranslation: "Par exemple", options: ["Par exemple", "En resume", "En revanche"], time: 7 },
        { phrase: "All of a sudden", correctTranslation: "Tout a coup", options: ["Tout a coup", "Petit a petit", "Graduellement"], time: 8 },
        { phrase: "As far as", correctTranslation: "Autant que", options: ["Autant que", "A cause de", "Parce que"], time: 9 },
        { phrase: "To be honest", correctTranslation: "Pour etre honnete", options: ["Pour etre honnete", "En resume", "En depit de"], time: 7 },
        { phrase: "For the purpose of", correctTranslation: "Dans le but de", options: ["Dans le but de", "A cause de", "Pour le bien de"], time: 9 },
        { phrase: "More or less", correctTranslation: "Plus ou moins", options: ["Plus ou moins", "En fin de compte", "Sans doute"], time: 8 },
        { phrase: "Under these circumstances", correctTranslation: "Dans ces circonstances", options: ["Dans ces circonstances", "Dans tous les cas", "Dans ce cadre"], time: 9 },
        { phrase: "With all due respect", correctTranslation: "Avec tout le respect", options: ["Avec tout le respect", "Avec hesitation", "Avec honneur"], time: 8 },
        { phrase: "For what it's worth", correctTranslation: "Pour ce que ca vaut", options: ["Pour ce que ca vaut", "Pour le meilleur ou pour le pire", "Pour de bon"], time: 9 },
        { phrase: "By the way", correctTranslation: "Au fait", options: ["Au fait", "En fait", "De toute facon"], time: 7 },
        { phrase: "In the same way", correctTranslation: "De la meme facon", options: ["De la meme facon", "A tout moment", "A la fois"], time: 8 },
        { phrase: "After all", correctTranslation: "Apres tout", options: ["Apres tout", "Tout bien considere", "A la suite"], time: 7 },
    
    ];
    

    const numPhrases = Math.floor(Math.random() * 3) + 1; // 1 à 3 phrases
    const clientPhrases = [];
    const usedPhrases = new Set();

    while (clientPhrases.length < numPhrases) {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        const randomPhrase = phrases[randomIndex];
        
        if (!usedPhrases.has(randomIndex)) {
            usedPhrases.add(randomIndex);
            const shuffledOptions = shuffleArray([...randomPhrase.options]);
            clientPhrases.push({
                ...randomPhrase,
                options: shuffledOptions,
                completed: false,
                id: `phrase-${id}-${randomIndex}` // Identifiant unique pour chaque phrase
            });
        }
    }

    return { 
        id: id, 
        clientPhrases: clientPhrases, 
        time: 30 + (numPhrases * 5),
        errors: 0 // Initialiser le compteur d'erreurs
    };
}

// Mettre à jour le score
function updateScore() {
    document.getElementById('score').innerText = score;
}

// Terminer le jeu
function endGame(success) {
    // Arrêter le timer global et la génération de clients
    clearInterval(globalTimerInterval);
    clearInterval(clientGenerationInterval);

    // Désactiver toutes les interactions avec les clients restants
    activeClients.forEach(client => {
        client.clientPhrases.forEach(phrase => {
            const phraseElement = document.getElementById(phrase.id);
            if (phraseElement) {
                phraseElement.querySelectorAll('button').forEach(btn => btn.disabled = true);
                fetchTopScores();
            }
        });
    });

    // Message de fin de partie
    const message = success ? "Congratulations, you won!" : "Game Over!";
    messageElement.innerText = message;

    // Vider la file des clients et masquer le bouton start
    clientQueue.innerHTML = '';
    document.getElementById('start-button').style.display = 'block';

    // Sauvegarder le score final
    saveScore('PlayerName', score);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé, attachement de l'événement au bouton de démarrage");
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error("Le bouton de démarrage n'a pas été trouvé");
    }
});
function startGlobalTimer(time) {
    const timerElement = document.getElementById('time-remaining');
    globalTimerInterval = setInterval(() => {
        if (time <= 0) {
            clearInterval(globalTimerInterval);
            endGame(false); // Terminer le jeu si le temps est écoulé
        } else {
            time--;
            timerElement.innerText = `${time} s`; // Afficher le temps restant
        }
    }, 1000); // Décrémenter toutes les secondes
}

function handlePhraseClick(selectedPhrase) {

    if (selectedPhrase === correctPhrase) {
        // Action quand la réponse est correcte
        console.log("Bonne réponse !");
        selectedPhrase.style.backgroundColor = 'green';
        // Code pour valider la commande et passer à la suivante
    } else {
        // Action quand la réponse est incorrecte
        console.log("Mauvaise réponse !");
        selectedPhrase.style.backgroundColor = 'red';
    }
}


// Initialiser Firebase (assurez-vous de remplacer avec vos vraies clés)
const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.appspot.com",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP"
};
// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const COLLECTION_NAME = "brewYourWordsScores";

// 2. Fonction saveScore modifiée
function saveScore(playerName, score) {
    console.log(`Tentative d'enregistrement du score : ${playerName} - ${score}`);
    return db.collection(COLLECTION_NAME).add({
        name: playerName,
        score: score,
        date: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log(`Score enregistré avec succès ! ID du document : ${docRef.id}`);
        return fetchTopScores();
    })
    .catch((error) => {
        console.error("Erreur lors de l'enregistrement du score : ", error);
        alert(`Erreur lors de l'enregistrement du score : ${error.message}`);
    });
}

// 3. Fonction fetchTopScores modifiée
function fetchTopScores() {
    console.log("Tentative de récupération des top scores");
    return db.collection(COLLECTION_NAME)
        .orderBy("score", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
            console.log(`Nombre de documents récupérés : ${querySnapshot.size}`);
            const topScoresElement = document.getElementById('top-scores');
            topScoresElement.innerHTML = '<h2>Top Scores</h2>';

            if (querySnapshot.empty) {
                console.log("Aucun score trouvé dans la base de données");
                topScoresElement.innerHTML += '<p>Aucun score enregistré pour le moment.</p>';
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log(`Score récupéré : ${data.name} - ${data.score}`);
                    topScoresElement.innerHTML += `<p>${data.name}: ${data.score} points</p>`;
                });
            }
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération des scores : ", error);
            alert(`Erreur lors de la récupération des scores : ${error.message}`);
            const topScoresElement = document.getElementById('top-scores');
            topScoresElement.innerHTML = '<h2>Top Scores</h2><p>Impossible de charger les scores.</p>';
        });
}

// 4. Fonction endGame modifiée
function endGame(success) {
    clearInterval(globalTimerInterval);
    clearInterval(clientGenerationInterval);

    const message = success ? "Congratulations, you won!" : "Game Over!";
    messageElement.innerText = message;
    
    clientQueue.innerHTML = '';
    document.getElementById('start-button').style.display = 'block';

    // Enregistrer le score avec un nom de joueur généré aléatoirement
    const playerName = "Player" + Math.floor(Math.random() * 1000);
    console.log(`Fin du jeu. Enregistrement du score pour ${playerName}: ${score}`);
    saveScore(playerName, score)
        .then(() => fetchTopScores())
        .catch(error => console.error("Erreur lors de la fin du jeu : ", error));
}

// 5. Ajouter un listener pour charger les scores au démarrage
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé, chargement des top scores");
    fetchTopScores();
    
    // Autres initialisations...
});

