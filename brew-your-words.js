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
    }, 10000);
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



// Modification de la fonction removeClient pour vérifier le minimum
function removeClient(clientId) {
    activeClients = activeClients.filter(c => c.id !== clientId);
    const clientElement = document.getElementById(`client-${clientId}`);
    if (clientElement) {
        clientElement.remove();
    }
    
    // Vérifier et maintenir le minimum après la suppression
    checkMinimumClients();
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
    const client = activeClients.find(c => c.id === clientId);  // Récupère le client
    client.timer = setInterval(() => {
        if (time <= 0) {
            clearInterval(client.timer);  // Arrête le timer de ce client
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

// Mise à jour de la fonction checkAnswer pour la gestion cohérente des erreurs
function checkAnswer(answer, clientId, phraseId) {
    const client = activeClients.find(c => c.id === clientId);
    const clientPhrase = client.clientPhrases.find(p => p.id === phraseId);

    // Normaliser les chaînes pour la comparaison
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrectTranslation = clientPhrase.correctTranslation.trim().toLowerCase();

    if (normalizedAnswer === normalizedCorrectTranslation) {
        // Réponse correcte
        clientPhrase.completed = true;
        const phraseElement = document.getElementById(phraseId);
        if (phraseElement) {
            phraseElement.style.backgroundColor = '#2ECC71'; // Vert pour correct
            phraseElement.querySelectorAll('button').forEach(btn => btn.disabled = true);
        }
        
        // Vérifier si toutes les phrases sont complétées
        if (client.clientPhrases.every(p => p.completed)) {
            completeClient(clientId);
        }
    } else {
        // Réponse incorrecte
        client.errors++;
        score = Math.max(0, score - 5);
        updateScore();
        
        const clientElement = document.getElementById(`client-${clientId}`);
        if (clientElement) {
            clientElement.style.backgroundColor = '#E74C3C'; // Rouge pour incorrect
            
            // Remettre la couleur normale après 1 seconde
            setTimeout(() => {
                clientElement.style.backgroundColor = '';
            }, 1000);
        }
        
        messageElement.innerText = `Incorrect translation for client #${clientId}.`;

        // Faire échouer la commande après 2 erreurs
        if (client.errors >= 2) {
            setTimeout(() => {
                failOrder(clientId);
            }, 1000);
        }
    }
}

// Compléter la commande d'un client
function completeClient(clientId) {
    if (!gameActive) return;  // Ne fait rien si le jeu est terminé
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

// Modification de la fonction failOrder pour ajouter un nouveau client
function failOrder(clientId) {
    if (!gameActive) return;
    
    // Pénalité de score
    score = Math.max(0, score - 10);
    updateScore();
    
    // Message d'échec
    messageElement.innerText = `Failed to complete the order for client #${clientId}.`;
    
    // Supprimer le client actuel
    removeClient(clientId);
    
    // Ajouter un nouveau client pour remplacer celui qui a échoué
    addNewClient();
    
    // Vérifier le minimum de clients après tout
    checkMinimumClients();
}

// Fonction pour vérifier et maintenir le minimum de clients
function checkMinimumClients() {
    if (activeClients.length === 0 && gameActive) {
        console.log("Aucun client actif, ajout d'un nouveau client");
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
        { phrase: "Nevertheless", correctTranslation: "Neanmoins", options: ["Neanmoins", "Maintenant", "Pour toujours"], time: 8 },
        { phrase: "However", correctTranslation: "Cependant", options: ["Cependant", "Jamais", "Aujourd'hui"], time: 9 },
        { phrase: "Therefore", correctTranslation: "Par consequent", options: ["Par consequent", "Par hasard", "Avec plaisir"], time: 11 },
        { phrase: "Moreover", correctTranslation: "De plus", options: ["De plus", "De moins", "Au revoir"], time: 10 },
        { phrase: "According to", correctTranslation: "Selon", options: ["Selon", "Avant", "Apres"], time: 8 },
        { phrase: "Furthermore", correctTranslation: "En outre", options: ["En outre", "En dessous", "En retard"], time: 7 },
        { phrase: "Due to", correctTranslation: "En raison de", options: ["En raison de", "Pour le plaisir", "Dans la joie"], time: 9 },
        { phrase: "As a result", correctTranslation: "Par consequent", options: ["Par consequent", "Par accident", "Par amour"], time: 12 },
        { phrase: "In order to", correctTranslation: "Afin de", options: ["Afin de", "Derriere", "Devant"], time: 9 },
        { phrase: "Unless", correctTranslation: "A moins que", options: ["A moins que", "Plus tard", "Bientot"], time: 7 },
        { phrase: "Even though", correctTranslation: "Meme si", options: ["Meme si", "Plus tard", "Hier soir"], time: 8 },
        { phrase: "As soon as", correctTranslation: "Des que", options: ["Des que", "Pour jamais", "Sans fin"], time: 9 },
        { phrase: "By the time", correctTranslation: "D'ici a ce que", options: ["D'ici a ce que", "Pour toujours", "Sans limite"], time: 10 },
        { phrase: "Once in a while", correctTranslation: "De temps en temps", options: ["De temps en temps", "Pour toujours", "Sans arret"], time: 9 },
        { phrase: "To sum up", correctTranslation: "Pour resumer", options: ["Pour resumer", "Pour commencer", "Pour le plaisir"], time: 8 },
        { phrase: "For instance", correctTranslation: "Par exemple", options: ["Par exemple", "Par magie", "Par chance"], time: 9 },
        { phrase: "In other words", correctTranslation: "En d'autres termes", options: ["En d'autres termes", "En silence", "En secret"], time: 9 },
        { phrase: "Rather than", correctTranslation: "Plutot que", options: ["Plutot que", "Jamais que", "Toujours que"], time: 9 },
        { phrase: "From now on", correctTranslation: "Desormais", options: ["Desormais", "Autrefois", "Jadis"], time: 9 },
        { phrase: "By no means", correctTranslation: "En aucun cas", options: ["En aucun cas", "En tout temps", "Pour toujours"], time: 9 },
        { phrase: "In case", correctTranslation: "Au cas ou", options: ["Au cas ou", "En secret", "Par hasard"], time: 9 },
        { phrase: "In my opinion", correctTranslation: "A mon avis", options: ["A mon avis", "A mon gout", "A ma faim"], time: 7 },
        { phrase: "To be honest", correctTranslation: "Pour etre honnete", options: ["Pour etre honnete", "Pour etre drole", "Pour etre gentil"], time: 8 },
        { phrase: "Without a doubt", correctTranslation: "Sans aucun doute", options: ["Sans aucun doute", "Sans aucun plaisir", "Sans aucune joie"], time: 10 },
        { phrase: "Step by step", correctTranslation: "Pas a pas", options: ["Pas a pas", "Vite fait", "D'un coup"], time: 10 },
        { phrase: "Under these circumstances", correctTranslation: "Dans ces circonstances", options: ["Dans ces circonstances", "Dans ces moments", "Dans ces endroits"], time: 9 },
        { phrase: "As well as", correctTranslation: "Aussi bien que", options: ["Aussi bien que", "Aussi mal que", "Aussi vite que"], time: 10 },
        { phrase: "All things considered", correctTranslation: "Tout bien considere", options: ["Tout bien considere", "Tout bien mange", "Tout bien dormi"], time: 9 },
        { phrase: "On the contrary", correctTranslation: "Au contraire", options: ["Au contraire", "Au dessus", "Au dessous"], time: 9 },
        { phrase: "As a last resort", correctTranslation: "En dernier recours", options: ["En dernier recours", "En premier choix", "En plein milieu"], time: 9 },
        { phrase: "In spite of", correctTranslation: "En depit de", options: ["En depit de", "En faveur de", "En riant de"], time: 9 },
        { phrase: "As far as I know", correctTranslation: "Pour autant que je sache", options: ["Pour autant que je sache", "Pour autant que je mange", "Pour autant que je dorme"], time: 10 },
        { phrase: "In the meantime", correctTranslation: "Entre-temps", options: ["Entre-temps", "Pour toujours", "Sans arret"], time: 8 },
        { phrase: "Although", correctTranslation: "Bien que", options: ["Bien que", "Mal que", "Sans que"], time: 7 },
        { phrase: "In addition", correctTranslation: "En plus", options: ["En plus", "En moins", "En dormant"], time: 8 },
        { phrase: "On the other hand", correctTranslation: "D'un autre cote", options: ["D'un autre cote", "D'un autre monde", "D'un autre pays"], time: 9 },
        { phrase: "At least", correctTranslation: "Au moins", options: ["Au moins", "Au plus", "Au mieux"], time: 7 },
        { phrase: "At most", correctTranslation: "Au plus", options: ["Au plus", "Au pire", "Au mieux"], time: 7 },
        { phrase: "Besides", correctTranslation: "D'ailleurs", options: ["D'ailleurs", "D'ici", "De la-bas"], time: 8 },
        { phrase: "Meanwhile", correctTranslation: "Pendant ce temps", options: ["Pendant ce temps", "Apres ce temps", "Avant ce temps"], time: 9 },
        { phrase: "Otherwise", correctTranslation: "Sinon", options: ["Sinon", "Alors", "Donc"], time: 7 },
        { phrase: "Similarly", correctTranslation: "De meme", options: ["De meme", "De moins", "De plus"], time: 8 },
        { phrase: "Subsequently", correctTranslation: "Par la suite", options: ["Par la suite", "Par hasard", "Par chance"], time: 9 },
        { phrase: "That is to say", correctTranslation: "C'est-a-dire", options: ["C'est-a-dire", "C'est-a-faire", "C'est-a-voir"], time: 10 },
        { phrase: "Yet", correctTranslation: "Pourtant", options: ["Pourtant", "Maintenant", "Toujours"], time: 6 },
        { phrase: "Indeed", correctTranslation: "En effet", options: ["En effet", "En fait", "En plus"], time: 7 },
        { phrase: "Hence", correctTranslation: "Donc", options: ["Donc", "Puis", "Alors"], time: 6 },
        { phrase: "Nonetheless", correctTranslation: "Toutefois", options: ["Toutefois", "Toujours", "Parfois"], time: 8 },
        { phrase: "Given that", correctTranslation: "Etant donne que", options: ["Etant donne que", "Etant fait que", "Etant vu que"], time: 9 },
        { phrase: "As though", correctTranslation: "Comme si", options: ["Comme si", "Comme ca", "Comme quoi"], time: 8 },
        { phrase: "In fact", correctTranslation: "En realite", options: ["En realite", "En verite", "En secret"], time: 8 },
        { phrase: "Actually", correctTranslation: "En fait", options: ["En fait", "En vrai", "En plus"], time: 7 },
        { phrase: "Likewise", correctTranslation: "De meme", options: ["De meme", "De moins", "De plus"], time: 7 },
        { phrase: "Apart from", correctTranslation: "Mis a part", options: ["Mis a part", "Mis ensemble", "Mis de cote"], time: 8 },
        { phrase: "Except for", correctTranslation: "A l'exception de", options: ["A l'exception de", "A l'inclusion de", "A l'attention de"], time: 9 },
        { phrase: "Instead of", correctTranslation: "Au lieu de", options: ["Au lieu de", "A la place de", "En face de"], time: 8 },
        { phrase: "Despite", correctTranslation: "Malgre", options: ["Malgre", "Grace a", "Pour"], time: 7 },
        { phrase: "Provided that", correctTranslation: "A condition que", options: ["A condition que", "Au moment que", "A l'instant que"], time: 9 },
        { phrase: "Since", correctTranslation: "Puisque", options: ["Puisque", "Lorsque", "Quand"], time: 7 },
        { phrase: "First and foremost", correctTranslation: "Avant tout", options: ["Avant tout", "Apres tout", "Par tout"], time: 9 },
        { phrase: "With regard to", correctTranslation: "En ce qui concerne", options: ["En ce qui concerne", "En ce qui mange", "En ce qui dort"], time: 10 },
        { phrase: "By the same token", correctTranslation: "De la meme facon", options: ["De la meme facon", "De la meme couleur", "De la meme taille"], time: 11 },
        { phrase: "In essence", correctTranslation: "En substance", options: ["En substance", "En apparence", "En surface"], time: 8 },
        { phrase: "For fear of", correctTranslation: "De peur de", options: ["De peur de", "De joie de", "De chance de"], time: 8 },
        { phrase: "Owing to", correctTranslation: "En raison de", options: ["En raison de", "En faveur de", "En honneur de"], time: 9 },
        { phrase: "Accordingly", correctTranslation: "Par consequent", options: ["Par consequent", "Par hasard", "Par chance"], time: 10 },
        { phrase: "Incidentally", correctTranslation: "Par ailleurs", options: ["Par ailleurs", "Par ici", "Par la"], time: 9 },
        { phrase: "Conversely", correctTranslation: "Inversement", options: ["Inversement", "Pareillement", "Egalement"], time: 8 },
        { phrase: "Practically", correctTranslation: "Pratiquement", options: ["Pratiquement", "Theoriquement", "Mystiquement"], time: 9 },
        { phrase: "Alternatively", correctTranslation: "Autrement", options: ["Autrement", "Maintenant", "Rapidement"], time: 9 },
        { phrase: "Granted that", correctTranslation: "Certes", options: ["Certes", "Jamais", "Toujours"], time: 8 },
        { phrase: "Beforehand", correctTranslation: "Au prealable", options: ["Au prealable", "Au final", "Au hasard"], time: 9 },
        { phrase: "Thereafter", correctTranslation: "Par la suite", options: ["Par la suite", "Par erreur", "Par chance"], time: 8 },
        { phrase: "To this end", correctTranslation: "A cette fin", options: ["A cette fin", "A ce debut", "A ce moment"], time: 9 },
        { phrase: "Primarily", correctTranslation: "Principalement", options: ["Principalement", "Rarement", "Jamais"], time: 9 },
        { phrase: "Invariably", correctTranslation: "Invariablement", options: ["Invariablement", "Variablement", "Rarement"], time: 10 },
        { phrase: "In reality", correctTranslation: "En realite", options: ["En realite", "En imagination", "En reve"], time: 8 },
        { phrase: "Occasionally", correctTranslation: "De temps a autre", options: ["De temps a autre", "Tout le temps", "Sans arret"], time: 10 },
        { phrase: "Supposedly", correctTranslation: "Supposement", options: ["Supposement", "Certainement", "Evidemment"], time: 9 },
        { phrase: "Ultimately", correctTranslation: "En fin de compte", options: ["En fin de compte", "Au debut", "Au milieu"], time: 9 },
        { phrase: "In parallel", correctTranslation: "En parallele", options: ["En parallele", "En opposition", "En conflit"], time: 8 },
        { phrase: "All at once", correctTranslation: "Tout d'un coup", options: ["Tout d'un coup", "Petit a petit", "Lentement"], time: 9 },
        { phrase: "As a matter of fact", correctTranslation: "En fait", options: ["En fait", "En reve", "En theorie"], time: 10 },
        { phrase: "To begin with", correctTranslation: "Pour commencer", options: ["Pour commencer", "Pour finir", "Pour continuer"], time: 9 },
        { phrase: "Not to mention", correctTranslation: "Sans parler de", options: ["Sans parler de", "En parlant de", "Pour parler de"], time: 10 },
        { phrase: "On balance", correctTranslation: "Tout compte fait", options: ["Tout compte fait", "Sans compter", "Mal compte"], time: 9 },
        { phrase: "In doing so", correctTranslation: "Ce faisant", options: ["Ce faisant", "Ce voyant", "Ce disant"], time: 8 },
        { phrase: "Put differently", correctTranslation: "Dit autrement", options: ["Dit autrement", "Dit pareil", "Dit ainsi"], time: 9 },
        { phrase: "Under normal circumstances", correctTranslation: "En temps normal", options: ["En temps normal", "En temps special", "En temps rare"], time: 11 },
    { phrase: "In all likelihood", correctTranslation: "Selon toute vraisemblance", options: ["Selon toute vraisemblance", "Selon toute apparence", "Selon tout hasard"], time: 12 },
    { phrase: "At any rate", correctTranslation: "En tout cas", options: ["En tout cas", "En aucun cas", "Dans le cas"], time: 8 },
    { phrase: "To that effect", correctTranslation: "A cet effet", options: ["A cet effet", "A cette cause", "A ce propos"], time: 9 },
    { phrase: "In the event of", correctTranslation: "En cas de", options: ["En cas de", "Au lieu de", "Au moment de"], time: 9 },
    { phrase: "By all means", correctTranslation: "A tout prix", options: ["A tout prix", "Sans prix", "Pour rien"], time: 8 },
    { phrase: "For the purpose of", correctTranslation: "Dans le but de", options: ["Dans le but de", "Sans le but de", "Avec l'idee de"], time: 10 },
    { phrase: "In the long term", correctTranslation: "A long terme", options: ["A long terme", "A court terme", "Sans terme"], time: 9 },
    { phrase: "At the outset", correctTranslation: "Des le depart", options: ["Des le depart", "A l'arrivee", "Au milieu"], time: 9 },
    { phrase: "On account of", correctTranslation: "A cause de", options: ["A cause de", "Grace a", "Pour"], time: 8 },
    { phrase: "Broadly speaking", correctTranslation: "En gros", options: ["En gros", "En detail", "En bref"], time: 9 },
    { phrase: "All things being equal", correctTranslation: "Toutes choses egales", options: ["Toutes choses egales", "Toutes choses differentes", "Toutes choses melangees"], time: 11 },
    { phrase: "In this regard", correctTranslation: "A cet egard", options: ["A cet egard", "A ce sujet", "A cette fin"], time: 9 },
    { phrase: "In a sense", correctTranslation: "Dans un sens", options: ["Dans un sens", "Sans sens", "Pour un sens"], time: 8 },
    { phrase: "On the basis of", correctTranslation: "Sur la base de", options: ["Sur la base de", "Sur le sommet de", "Sur le cote de"], time: 9 },
    { phrase: "In conjunction with", correctTranslation: "En liaison avec", options: ["En liaison avec", "En conflit avec", "En opposition avec"], time: 10 },
    { phrase: "As far as possible", correctTranslation: "Dans la mesure du possible", options: ["Dans la mesure du possible", "Dans l'impossibilite de", "Sans possibilite de"], time: 11 },
    { phrase: "In any event", correctTranslation: "En tout etat de cause", options: ["En tout etat de cause", "Sans aucune cause", "Pour toute cause"], time: 10 },
    { phrase: "With reference to", correctTranslation: "En reference a", options: ["En reference a", "Sans reference a", "Pour reference a"], time: 10 },
    { phrase: "On reflection", correctTranslation: "A la reflexion", options: ["A la reflexion", "Sans reflexion", "Pour reflexion"], time: 9 },
    { phrase: "In brief", correctTranslation: "En bref", options: ["En bref", "En long", "En detail"], time: 7 }
        
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

    // Calcul du temps en fonction du nombre de phrases
    const baseTime = 2; // Temps de base augmenté
    const timePerPhrase = 5; // Temps supplémentaire par phrase
    const totalTime = baseTime + (timePerPhrase * numPhrases);

    return { 
        id: id, 
        clientPhrases: clientPhrases, 
        time: totalTime, // Temps dynamique basé sur le nombre de phrases
        errors: 0
    };
}

// Mettre à jour le score
function updateScore() {
    document.getElementById('score').innerText = score;
}
let finalScore = null;  // Variable globale pour capturer le score final

function endGame(success) {
    clearInterval(globalTimerInterval);  // Arrêter le timer global
    clearInterval(clientGenerationInterval);  // Arrêter la génération de nouveaux clients

    // Arrêter les timers de chaque commande en cours
    activeClients.forEach(client => {
        if (client.timer) {
            clearInterval(client.timer);  // Assurez-vous que chaque timer client est arrêté
        }
    });

    // Désactiver toutes les interactions avec les clients restants
    activeClients.forEach(client => {
        client.clientPhrases.forEach(phrase => {
            const phraseElement = document.getElementById(phrase.id);
            if (phraseElement) {
                phraseElement.querySelectorAll('button').forEach(btn => btn.disabled = true);
            }
        });
    });

    // Capture et verrouille le score final
    finalScore = score;  // Capture la valeur actuelle du score au moment de la fin du jeu
    console.log("Score final capturé :", finalScore);

    // Afficher le message de fin
    const message = success ? "Congratulations, you won!" : "Game Over!";
    messageElement.innerText = message;

    // Vider la file des clients et réactiver le bouton start
    clientQueue.innerHTML = '';
    document.getElementById('start-button').style.display = 'block';

    // Afficher le score final capturé
    document.getElementById('final-score').textContent = finalScore;

    // Afficher le formulaire de sauvegarde du score
    document.getElementById('end-game').style.display = 'block';

    // Écouter la soumission du formulaire pour sauvegarder le score capturé
    document.getElementById('name-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const playerName = document.getElementById('player-name').value;

        // Sauvegarder le score capturé au moment de la fin du jeu
        saveScore(playerName, finalScore);
    });
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
    if (typeof score !== 'number' || isNaN(score)) {
        console.error("Invalid score:", score);
        document.getElementById('save-message').textContent = 'Error: Invalid score.';
        return;
    }

    db.collection("brewYourWordsScores").add({
        name: playerName,
        score: score,  // Vérifie que score est bien un nombre ici
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        document.getElementById('save-message').textContent = 'Score saved successfully!';
        fetchTopScores();
    })
    .catch((error) => {
        document.getElementById('save-message').textContent = 'Error saving score: ' + error;
    });
}


// 3. Fonction fetchTopScores modifiée
function fetchTopScores() {
    db.collection("brewYourWordsScores")
        .orderBy("score", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = ""; // Vide la liste avant de la remplir

            querySnapshot.forEach((doc) => {
                const li = document.createElement("li");
                li.textContent = `${doc.data().name}: ${doc.data().score}`;
                topScoresList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Error loading top scores: ", error);
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
// Ajoute cette fonction pour finir le jeu et montrer le formulaire
function endGame() {
    // Vérifie que le score est valide avant de l'afficher
    if (typeof score !== 'number' || isNaN(score)) {
        console.error("Invalid score:", score);
        document.getElementById('final-score').textContent = 'Error: Invalid score.';
        return;
    }

    // Affiche le score final
    document.getElementById('final-score').textContent = score;

    // Affiche le formulaire pour entrer le nom du joueur
    document.getElementById('end-game').style.display = 'block';

    // Cache les autres éléments du jeu
    document.getElementById('game-container').style.display = 'none';

    // Écoute le formulaire de soumission du nom
    document.getElementById('name-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const playerName = document.getElementById('player-name').value;

        // Sauvegarder le score dans la base de données
        saveScore(playerName, score);
    });
}


// Fonction pour sauvegarder le score dans la base de données
function saveScore(playerName, finalScore) {
    // Vérifie que le score est bien un nombre valide avant de l'enregistrer
    if (typeof finalScore !== 'number' || isNaN(finalScore)) {
        console.error("Invalid score:", finalScore);
        document.getElementById('save-message').textContent = 'Error: Invalid score.';
        return;
    }

    db.collection("brewYourWordsScores").add({
        name: playerName,
        score: finalScore,  // Utilise la variable finalScore capturée
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Utilise Firebase pour le timestamp
    })
    .then(() => {
        document.getElementById('save-message').textContent = 'Score saved successfully!';
        fetchTopScores();  // Recharge le tableau des scores
    })
    .catch((error) => {
        document.getElementById('save-message').textContent = 'Error saving score: ' + error;
    });
}


