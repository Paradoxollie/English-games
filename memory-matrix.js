// Désactiver la console pour la sécurité
console.log = console.warn = console.error = function() {};

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
    authDomain: "english-games-41017.firebaseapp.com",
    projectId: "english-games-41017",
    storageBucket: "english-games-41017.appspot.com",
    messagingSenderId: "452279652544",
    appId: "1:452279652544:web:916f93e0ab29183e739d25",
    measurementId: "G-RMCQTMKDVP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const vocabularyBank = [
    { word: "achieve", definition: "Réussir quelque chose après des efforts." },
    { word: "advice", definition: "Une recommandation pour aider quelqu’un." },
    { word: "allow", definition: "Donner la permission de faire quelque chose." },
    { word: "answer", definition: "Répondre à une question ou une demande." },
    { word: "apply", definition: "Faire une demande officielle (emploi, école, etc.)." },
    { word: "arrange", definition: "Organiser ou préparer quelque chose." },
    { word: "ask", definition: "Poser une question ou demander quelque chose." },
    { word: "avoid", definition: "Éviter une situation ou une action." },
    { word: "believe", definition: "Penser que quelque chose est vrai." },
    { word: "borrow", definition: "Prendre temporairement quelque chose à quelqu’un." },
    { word: "build", definition: "Construire ou créer quelque chose." },
    { word: "change", definition: "Modifier ou rendre différent." },
    { word: "choose", definition: "Sélectionner parmi plusieurs options." },
    { word: "communicate", definition: "Partager des informations avec quelqu’un." },
    { word: "compare", definition: "Observer les différences et les similarités." },
    { word: "complain", definition: "Exprimer son mécontentement." },
    { word: "concentrate", definition: "Faire attention et se focaliser sur quelque chose." },
    { word: "confirm", definition: "Vérifier et approuver quelque chose." },
    { word: "consider", definition: "Penser à une possibilité avant de décider." },
    { word: "continue", definition: "Ne pas arrêter une action." },
    { word: "correct", definition: "Rendre juste ou corriger une erreur." },
    { word: "decide", definition: "Faire un choix après réflexion." },
    { word: "describe", definition: "Expliquer comment est quelque chose." },
    { word: "discuss", definition: "Parler avec quelqu’un d’un sujet." },
    { word: "discover", definition: "Trouver quelque chose de nouveau." },
    { word: "encourage", definition: "Motiver ou soutenir quelqu’un." },
    { word: "explain", definition: "Rendre quelque chose clair et compréhensible." },
    { word: "express", definition: "Montrer ses pensées ou ses émotions." },
    { word: "fail", definition: "Ne pas réussir quelque chose." },
    { word: "follow", definition: "Aller derrière ou respecter une règle." },
    { word: "forget", definition: "Ne plus se rappeler de quelque chose." },
    { word: "guess", definition: "Donner une réponse sans être sûr." },
    { word: "help", definition: "Assister ou apporter son soutien." },
    { word: "improve", definition: "Rendre quelque chose meilleur." },
    { word: "inform", definition: "Donner des informations à quelqu’un." },
    { word: "introduce", definition: "Présenter une personne ou une idée." },
    { word: "learn", definition: "Acquérir de nouvelles connaissances." },
    { word: "listen", definition: "Faire attention aux sons et aux paroles." },
    { word: "mention", definition: "Parler brièvement de quelque chose." },
    { word: "notice", definition: "Remarquer quelque chose." },
    { word: "offer", definition: "Proposer ou donner quelque chose." },
    { word: "organize", definition: "Mettre en ordre ou préparer." },
    { word: "participate", definition: "Prendre part à une activité." },
    { word: "persuade", definition: "Convaincre quelqu’un de faire ou croire quelque chose." },
    { word: "plan", definition: "Préparer à l’avance." },
    { word: "practise", definition: "S’entraîner pour s’améliorer." },
    { word: "prefer", definition: "Aimer quelque chose plus qu’une autre chose." },
    { word: "prepare", definition: "Se mettre en condition pour quelque chose." },
    { word: "prevent", definition: "Empêcher quelque chose d’arriver." },
    { word: "promise", definition: "Dire que l’on fera quelque chose avec certitude." },
    { word: "pronounce", definition: "Dire un mot correctement." },
    { word: "protect", definition: "Garder en sécurité contre un danger." },
    { word: "realize", definition: "Comprendre soudainement quelque chose." },
    { word: "recognize", definition: "Se rappeler de quelqu’un ou quelque chose." },
    { word: "reduce", definition: "Diminuer en quantité ou en intensité." },
    { word: "refuse", definition: "Dire non à quelque chose." },
    { word: "remember", definition: "Se souvenir de quelque chose." },
    { word: "repeat", definition: "Dire ou faire encore une fois." },
    { word: "replace", definition: "Mettre une chose à la place d’une autre." },
    { word: "reply", definition: "Répondre à une question ou un message." },
    { word: "request", definition: "Demander poliment quelque chose." },
    { word: "respect", definition: "Montrer de l’estime envers quelqu’un." },
    { word: "respond", definition: "Réagir à une question ou un événement." },
    { word: "review", definition: "Revoir pour s’améliorer ou se rappeler." },
    { word: "say", definition: "Exprimer quelque chose oralement." },
    { word: "search", definition: "Chercher quelque chose." },
    { word: "select", definition: "Choisir une option." },
    { word: "send", definition: "Faire parvenir un message ou un objet." },
    { word: "share", definition: "Donner une partie de quelque chose aux autres." },
    { word: "show", definition: "Faire voir quelque chose." },
    { word: "speak", definition: "Utiliser des mots pour communiquer." },
    { word: "spell", definition: "Épeler un mot correctement." },
    { word: "study", definition: "Apprendre en travaillant sur un sujet." },
    { word: "suggest", definition: "Donner une idée ou un conseil." },
    { word: "support", definition: "Aider ou défendre une cause." },
    { word: "talk", definition: "Communiquer avec quelqu’un en parlant." },
    { word: "teach", definition: "Apprendre quelque chose à quelqu’un." },
    { word: "tell", definition: "Dire quelque chose à quelqu’un." },
    { word: "test", definition: "Vérifier les connaissances de quelqu’un." },
    { word: "thank", definition: "Exprimer sa gratitude." },
    { word: "translate", definition: "Changer des mots d’une langue à une autre." },
    { word: "try", definition: "Faire un effort pour réussir quelque chose." },
    { word: "understand", definition: "Saisir la signification de quelque chose." },
    { word: "use", definition: "Employer quelque chose pour un but précis." },
    { word: "watch", definition: "Regarder attentivement quelque chose." },
    { word: "write", definition: "Produire du texte avec des mots." },
    { word: "accept", definition: "Dire oui à une proposition ou une situation." },
    { word: "adapt", definition: "Changer pour mieux s’ajuster à une situation." },
    { word: "add", definition: "Mettre quelque chose en plus." },
    { word: "admit", definition: "Reconnaître que quelque chose est vrai." },
    { word: "agree", definition: "Être d’accord avec quelqu’un ou quelque chose." },
    { word: "analyse", definition: "Examiner quelque chose en détail." },
    { word: "announce", definition: "Faire connaître une information publiquement." },
    { word: "arrive", definition: "Atteindre un lieu." },
    { word: "assist", definition: "Aider quelqu’un dans une tâche." },
    { word: "assume", definition: "Penser que quelque chose est vrai sans preuve." },
    { word: "attend", definition: "Être présent à un événement." },
    { word: "attract", definition: "Attirer l’attention ou l’intérêt de quelqu’un." },
    { word: "behave", definition: "Agir d’une certaine manière." },
    { word: "belong", definition: "Faire partie d’un groupe ou d’un endroit." },
    { word: "breathe", definition: "Prendre et expulser de l’air par les poumons." },
    { word: "celebrate", definition: "Fêter un événement spécial." },
    { word: "change", definition: "Modifier ou devenir différent." },
    { word: "choose", definition: "Sélectionner parmi plusieurs options." },
    { word: "collect", definition: "Rassembler plusieurs objets ou informations." },
    { word: "compete", definition: "Jouer contre quelqu’un pour gagner." },
    { word: "compliment", definition: "Dire quelque chose de positif sur quelqu’un." },
    { word: "conclude", definition: "Terminer ou arriver à une décision." },
    { word: "confirm", definition: "Vérifier que quelque chose est correct." },
    { word: "connect", definition: "Joindre deux choses ensemble." },
    { word: "contain", definition: "Avoir quelque chose à l’intérieur." },
    { word: "cooperate", definition: "Travailler ensemble pour un objectif commun." },
    { word: "deliver", definition: "Apporter quelque chose à un endroit." },
    { word: "depend", definition: "Être influencé par quelque chose d’autre." },
    { word: "describe", definition: "Donner des détails sur quelque chose." },
    { word: "design", definition: "Créer un plan ou une structure." },
    { word: "develop", definition: "Faire grandir ou améliorer quelque chose." },
    { word: "discover", definition: "Trouver quelque chose de nouveau." },
    { word: "divide", definition: "Séparer en plusieurs parties." },
    { word: "earn", definition: "Recevoir de l’argent en travaillant." },
    { word: "educate", definition: "Donner des connaissances à quelqu’un." },
    { word: "enjoy", definition: "Prendre du plaisir à faire quelque chose." },
    { word: "enter", definition: "Aller dans un endroit." },
    { word: "establish", definition: "Créer ou fonder quelque chose." },
    { word: "estimate", definition: "Faire une approximation d’une quantité." },
    { word: "examine", definition: "Observer attentivement pour comprendre." },
    { word: "explore", definition: "Voyager ou chercher de nouvelles choses." },
    { word: "fail", definition: "Ne pas réussir quelque chose." },
    { word: "feed", definition: "Donner de la nourriture à quelqu’un ou un animal." },
    { word: "focus", definition: "Faire attention à quelque chose en particulier." },
    { word: "forgive", definition: "Ne plus être fâché contre quelqu’un." },
    { word: "handle", definition: "Gérer une situation ou un problème." },
    { word: "increase", definition: "Faire grandir ou devenir plus important." },
    { word: "introduce", definition: "Présenter quelqu’un ou quelque chose." },
    { word: "invite", definition: "Demander à quelqu’un de venir." }

];

// Variables globales
let score = 0;
let timeLeft = 60;
let timerInterval;
let selectedWord = null;
let selectedDefinition = null;
let gameOver = false;
let roundsPlayed = 0;
const maxRounds = 5;
let currentWords = [];
let currentDefinitions = [];

// Fonction pour démarrer le jeu
function startGame() {
    // Réinitialisation
    score = 0;
    timeLeft = 60;
    gameOver = false;
    roundsPlayed = 0;
    document.getElementById('score').innerText = score;
    document.getElementById('start-button').style.display = 'none';
    
    // Démarrer le premier round
    startNewRound();
    startTimer();
}

// Fonction pour démarrer un nouveau round
function startNewRound() {
    clearSelections();
    const wordContainer = document.getElementById('word-container');
    const definitionContainer = document.getElementById('definition-container');
    wordContainer.innerHTML = '';
    definitionContainer.innerHTML = '';

    // Sélectionner 4 mots aléatoires
    const selectedPairs = selectRandomPairs(4);
    currentWords = selectedPairs.map(pair => pair.word);
    currentDefinitions = selectedPairs.map(pair => pair.definition);

    // Mélanger les définitions
    const shuffledDefinitions = [...currentDefinitions].sort(() => Math.random() - 0.5);

    // Créer et afficher les éléments
    currentWords.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-item';
        wordElement.textContent = word;
        wordElement.onclick = () => selectWord(wordElement, word);
        wordContainer.appendChild(wordElement);
    });

    shuffledDefinitions.forEach(definition => {
        const definitionElement = document.createElement('div');
        definitionElement.className = 'definition-item';
        definitionElement.textContent = definition;
        definitionElement.onclick = () => selectDefinition(definitionElement, definition);
        definitionContainer.appendChild(definitionElement);
    });
}

// Fonction pour sélectionner des paires aléatoires
function selectRandomPairs(count) {
    const shuffled = [...vocabularyBank].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Gestion des sélections
function selectWord(element, word) {
    if (gameOver) return;
    clearWordSelections();
    selectedWord = word;
    element.classList.add('selected');
    checkMatch();
}

function selectDefinition(element, definition) {
    if (gameOver) return;
    clearDefinitionSelections();
    selectedDefinition = definition;
    element.classList.add('selected');
    checkMatch();
}

// Vérification des correspondances
function checkMatch() {
    if (!selectedWord || !selectedDefinition) return;

    const wordIndex = currentWords.indexOf(selectedWord);
    const correctDefinition = currentDefinitions[wordIndex];

            const wordElements = document.querySelectorAll('.word-item');
            const definitionElements = document.querySelectorAll('.definition-item');
            
    if (selectedDefinition === correctDefinition) {
        // Correspondance correcte
        score += 10;
        wordElements[wordIndex].classList.add('correct');
        definitionElements[Array.from(definitionElements).findIndex(el => el.textContent === selectedDefinition)].classList.add('correct');
        
        if (document.querySelectorAll('.correct').length === currentWords.length * 2) {
            roundsPlayed++;
                    if (roundsPlayed < maxRounds) {
                setTimeout(startNewRound, 1000);
                    } else {
                        endGame();
                    }
            }
        } else {
        // Correspondance incorrecte
        score = Math.max(0, score - 5);
    }

    document.getElementById('score').innerText = score;
    clearSelections();
}

// Fonctions utilitaires
function clearSelections() {
                selectedWord = null;
                selectedDefinition = null;
    clearWordSelections();
    clearDefinitionSelections();
}

function clearWordSelections() {
    document.querySelectorAll('.word-item').forEach(el => {
        if (!el.classList.contains('correct')) {
            el.classList.remove('selected');
        }
    });
}

function clearDefinitionSelections() {
    document.querySelectorAll('.definition-item').forEach(el => {
        if (!el.classList.contains('correct')) {
            el.classList.remove('selected');
        }
    });
}

// Gestion du timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time-left').innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Fin du jeu
function endGame() {
    gameOver = true;
    clearInterval(timerInterval);
    document.getElementById('start-button').style.display = 'block';
    
    const playerName = prompt("Enter your name for the leaderboard:");
    if (playerName) {
        saveScore(playerName, score);
    }
}

// Gestion des scores
function saveScore(playerName, score) {
    db.collection("memory_matrix_scores").add({
        name: playerName,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        loadTopScores();
    })
    .catch((error) => {
        console.error("Error saving score:", error);
    });
}

function loadTopScores() {
    db.collection("memory_matrix_scores")
        .orderBy("score", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const li = document.createElement("li");
                li.textContent = `${doc.data().name}: ${doc.data().score}`;
                topScoresList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Error loading scores:", error);
        });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadTopScores();
    document.getElementById('start-button').addEventListener('click', startGame);
});