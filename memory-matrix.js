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
    { word: "accurate", definition: "Free from errors or mistakes; exact and correct in every detail." },
    { word: "adequate", definition: "Sufficient for a specific requirement; acceptable in quantity or quality." },
    { word: "allocate", definition: "To distribute resources or duties for a particular purpose." },
    { word: "anticipate", definition: "To expect or predict something in advance, often with preparation." },
    { word: "assess", definition: "To evaluate or estimate the nature, ability, or quality of something." },
    { word: "benefit", definition: "An advantage or profit gained from something." },
    { word: "coherent", definition: "Logical and consistent; forming a unified whole that makes sense." },
    { word: "comprehensive", definition: "Complete and thorough; covering all or nearly all aspects of something." },
    { word: "contribute", definition: "To give something (such as money or time) in order to achieve a common goal." },
    { word: "convince", definition: "To persuade someone to do or believe something by presenting strong arguments." },
    { word: "criticize", definition: "To point out the faults or problems of someone or something in a disapproving way." },
    { word: "diverse", definition: "Showing a great deal of variety; very different or distinct." },
    { word: "emphasize", definition: "To give special importance or prominence to something in speaking or writing." },
    { word: "enhance", definition: "To improve the quality, value, or extent of something." },
    { word: "establish", definition: "To set up or create something on a firm or permanent basis." },
    { word: "evident", definition: "Clearly seen or understood; obvious and easy to notice." },
    { word: "fluctuate", definition: "To rise and fall irregularly in number or amount." },
    { word: "generate", definition: "To produce or create something, especially energy or ideas." },
    { word: "hypothesis", definition: "A proposed explanation based on limited evidence, used as a starting point for further investigation." },
    { word: "implement", definition: "To put into effect or carry out a plan, decision, or idea." },
    { word: "indicate", definition: "To point out or show something, typically as a sign or signal." },
    { word: "interpret", definition: "To explain the meaning of information, words, or actions." },
    { word: "investigate", definition: "To carry out research or study into a subject to discover facts or information." },
    { word: "justify", definition: "To show or prove to be right or reasonable." },
    { word: "maintain", definition: "To keep something in good condition by checking or repairing it regularly." },
    { word: "neglect", definition: "To fail to care for or give proper attention to something or someone." },
    { word: "obtain", definition: "To get or acquire something, usually through effort or skill." },
    { word: "perceive", definition: "To become aware or conscious of something through the senses." },
    { word: "potential", definition: "Having the capacity to develop into something in the future; latent ability." },
    { word: "propose", definition: "To put forward an idea, plan, or suggestion for consideration or discussion." },
    { word: "recommend", definition: "To suggest that something is good or suitable for a particular purpose." },
    { word: "relevant", definition: "Closely connected or appropriate to what is being considered or discussed." },
    { word: "reside", definition: "To live in a particular place, typically for a prolonged period." },
    { word: "restrict", definition: "To limit the amount or range of something." },
    { word: "secure", definition: "To make safe or protect from danger or harm." },
    { word: "significant", definition: "Important, noteworthy, or worthy of attention." },
    { word: "specific", definition: "Clearly defined or identified; distinct from others." },
    { word: "structure", definition: "The arrangement of and relations between the parts of something complex." },
    { word: "sufficient", definition: "Enough to meet the needs of a situation or proposed goal." },
    { word: "sustain", definition: "To support or maintain something over a period of time." },
    { word: "transition", definition: "The process or period of changing from one state or condition to another." },
    { word: "ultimate", definition: "The final or most important aim or result of a process." },
    { word: "vary", definition: "To change or alter in form, appearance, or nature." },
    { word: "widespread", definition: "Found or distributed over a large area or number of people." },
    { word: "persevere", definition: "To continue in a course of action despite difficulty or delay in achieving success." },
    { word: "assumption", definition: "A thing that is accepted as true or as certain to happen, without proof." },
    { word: "compensate", definition: "To give something in recognition of loss, suffering, or injury incurred." },
    { word: "controversial", definition: "Giving rise to public disagreement; likely to provoke an argument." },
    { word: "accompany", definition: "To go somewhere with someone as a companion or escort." },
    { word: "facilitate", definition: "To make an action or process easier or help it move forward." },
    { word: "acquire", definition: "To obtain something through effort or experience." },
    { word: "adjust", definition: "To change something slightly to make it more suitable or accurate." },
    { word: "advocate", definition: "To publicly support or recommend a particular cause or policy." },
    { word: "allocate", definition: "To distribute resources or duties for a particular purpose." },
    { word: "anticipate", definition: "To expect or predict something and prepare for it." },
    { word: "aspire", definition: "To have a strong desire to achieve something or to become someone." },
    { word: "assume", definition: "To accept something to be true without proof." },
    { word: "attain", definition: "To succeed in achieving something, especially after much effort." },
    { word: "collaborate", definition: "To work jointly with others, especially in an intellectual endeavor." },
    { word: "compile", definition: "To collect information from different sources and arrange it in a book or report." },
    { word: "concede", definition: "To admit that something is true or valid after first resisting it." },
    { word: "conform", definition: "To comply with rules, standards, or laws." },
    { word: "constrain", definition: "To restrict or limit someone or something." },
    { word: "contradict", definition: "To state the opposite of a statement made by someone else." },
    { word: "convey", definition: "To communicate or express something, with or without words." },
    { word: "deduce", definition: "To draw a conclusion based on information and reasoning." },
    { word: "depict", definition: "To show or represent by drawing, painting, or describing in words." },
    { word: "derive", definition: "To obtain something from a specified source." },
    { word: "devote", definition: "To give time, effort, or resources to a particular task or purpose." },
    { word: "differentiate", definition: "To recognize or identify differences between two or more things." },
    { word: "diminish", definition: "To make something become less in size, importance, or value." },
    { word: "displace", definition: "To force someone or something to move from its usual place or position." },
    { word: "distribute", definition: "To give or deliver something to people." },
    { word: "emerge", definition: "To move out of or away from something and become visible or apparent." },
    { word: "enforce", definition: "To ensure compliance with a law, rule, or obligation." },
    { word: "enhance", definition: "To intensify, increase, or improve the quality or value of something." },
    { word: "ensure", definition: "To make certain that something happens or is the case." },
    { word: "exploit", definition: "To use something or someone in a way that helps you, often unfairly." },
    { word: "expose", definition: "To reveal something hidden or make it known." },
    { word: "facilitate", definition: "To make an action or process easier or help bring about a result." },
    { word: "foster", definition: "To encourage the development or growth of ideas or feelings." },
    { word: "illustrate", definition: "To explain or make something clear by using examples, pictures, or diagrams." },
    { word: "imitate", definition: "To copy someone’s actions, behavior, or appearance." },
    { word: "impose", definition: "To force something unwelcome or unfamiliar to be accepted or put in place." },
    { word: "integrate", definition: "To combine one thing with another to make a whole." },
    { word: "intervene", definition: "To come between disputing parties to prevent or alter a result." },
    { word: "isolate", definition: "To set something or someone apart from others." },
    { word: "manipulate", definition: "To control or influence someone or something in a clever or skillful way." },
    { word: "mediate", definition: "To try to end a dispute between two or more people or groups." },
    { word: "modify", definition: "To change something slightly, usually to improve it or make it more acceptable." },
    { word: "monitor", definition: "To observe and check the progress or quality of something over a period of time." },
    { word: "negate", definition: "To nullify or make ineffective." },
    { word: "obstruct", definition: "To block or get in the way of something." },
    { word: "overcome", definition: "To successfully deal with or gain control of a problem or difficulty." },
    { word: "perceive", definition: "To become aware or conscious of something through the senses." },
    { word: "persuade", definition: "To cause someone to do or believe something through reasoning or argument." },
    { word: "prioritize", definition: "To designate or treat something as more important than other things." },
    { word: "reinforce", definition: "To strengthen or support, especially with additional materials or help." },
    { word: "safeguard", definition: "To protect something or someone from harm or damage." },
    { word: "simplify", definition: "To make something less complicated or easier to understand." },
    { word: "speculate", definition: "To form a theory or conjecture about a subject without firm evidence." },
    { word: "suppress", definition: "To put an end to something by force or prevent it from being expressed." },
    { word: "accelerate", definition: "To increase speed or cause something to happen faster than expected." },
    { word: "accommodate", definition: "To provide lodging or sufficient space for someone or something." },
    { word: "accomplish", definition: "To achieve or complete a task successfully." },
    { word: "accumulate", definition: "To gather or collect something over time, often in large amounts." },
    { word: "acknowledge", definition: "To accept or recognize the truth or existence of something." },
    { word: "adapt", definition: "To change something to make it suitable for a new purpose or situation." },
    { word: "administer", definition: "To manage or oversee the execution of something, such as a business or organization." },
    { word: "advocate", definition: "To support or argue in favor of a particular cause or policy." },
    { word: "alleviate", definition: "To make a problem or pain less severe or more bearable." },
    { word: "analyze", definition: "To examine something in detail to understand it better or to draw conclusions." },
    { word: "anticipate", definition: "To expect or look forward to something happening." },
    { word: "apologize", definition: "To express regret or sorrow for a mistake or wrongdoing." },
    { word: "appreciate", definition: "To recognize the value, significance, or importance of something or someone." },
    { word: "approach", definition: "To come near or nearer to something in distance or time." },
    { word: "approve", definition: "To officially accept or agree to something." },
    { word: "articulate", definition: "To express an idea or feeling clearly and effectively." },
    { word: "ascertain", definition: "To find out or discover something with certainty through investigation." },
    { word: "assert", definition: "To state a fact or belief confidently and forcefully." },
    { word: "assign", definition: "To allocate a task or responsibility to someone." },
    { word: "assure", definition: "To tell someone something confidently to dispel doubts or fears." },
    { word: "augment", definition: "To make something greater in size, quantity, or value." },
    { word: "authorize", definition: "To give official permission or approval for something." },
    { word: "boost", definition: "To increase or improve something in a positive way." },
    { word: "clarify", definition: "To make something easier to understand by giving more details or simpler explanations." },
    { word: "collaborate", definition: "To work together with one or more people to achieve a common goal." },
    { word: "comply", definition: "To act in accordance with rules, standards, or demands." },
    { word: "conserve", definition: "To protect or preserve something, especially the environment or cultural heritage." },
    { word: "consolidate", definition: "To combine several things into a more effective or coherent whole." },
    { word: "contemplate", definition: "To think deeply about something for a long time." },
    { word: "contradict", definition: "To state the opposite of what someone else has said or believed." },
    { word: "convert", definition: "To change the form, character, or function of something." },
    { word: "decrease", definition: "To make something become smaller or less in size, amount, or number." },
    { word: "dedicate", definition: "To devote time, effort, or resources to a particular task or purpose." },
    { word: "demonstrate", definition: "To show or prove something clearly through examples or evidence." },
    { word: "depreciate", definition: "To reduce in value over a period of time." },
    { word: "detect", definition: "To discover or identify the presence or existence of something." },
    { word: "dictate", definition: "To lay down rules or give orders with authority." },
    { word: "disclose", definition: "To reveal or make known information that was previously secret or unknown." },
    { word: "divert", definition: "To cause something to change direction or be used for a different purpose." },
    { word: "elaborate", definition: "To explain something in more detail or expand on an idea." },
    { word: "eliminate", definition: "To remove or get rid of something completely." },
    { word: "endorse", definition: "To publicly support or approve of something or someone." },
    { word: "eradicate", definition: "To completely destroy or remove something, especially something negative." },
    { word: "evaluate", definition: "To form an opinion of the amount, value, or quality of something after careful consideration." },
    { word: "exaggerate", definition: "To describe something as being larger, better, or worse than it really is." },
    { word: "expand", definition: "To increase in size, number, or importance." },
    { word: "extract", definition: "To remove or take out something, especially by effort or force." },
    { word: "facilitate", definition: "To make an action or process easier or help it progress." },
    { word: "fascinate", definition: "To attract and hold someone's attention intensely." },
    { word: "formulate", definition: "To create or prepare something systematically or according to a plan." },
    { word: "generate", definition: "To cause something to exist or come into being." },
    { word: "hesitate", definition: "To pause or hold back in uncertainty or unwillingness." },
    { word: "implement", definition: "To put a decision, plan, or agreement into effect." },
    { word: "implicate", definition: "To show someone or something to be involved in a crime or undesirable situation." },
    { word: "induce", definition: "To bring about or give rise to something, often intentionally." },
    { word: "inhibit", definition: "To prevent or slow down an action, process, or behavior." },
    { word: "initiate", definition: "To begin or start something, especially an important process or activity." },
    { word: "inquire", definition: "To ask for information from someone or investigate something." },
    { word: "insight", definition: "The ability to understand deeply and accurately the true nature of something." },
    { word: "integrate", definition: "To combine one thing with another so that they become a whole." },
    { word: "intensify", definition: "To increase in degree, strength, or severity." },
    { word: "interfere", definition: "To get involved in a situation where one is not wanted or needed." },
    { word: "interpret", definition: "To explain or understand the meaning of something in a particular way." },
    { word: "intervene", definition: "To become involved in a situation in order to change or prevent an outcome." },
    { word: "intimidate", definition: "To frighten or overawe someone, especially to make them do something." },
    { word: "invest", definition: "To put money, time, or energy into something with the hope of future benefit." },
    { word: "justify", definition: "To show or prove to be right, reasonable, or valid." },
    { word: "liberate", definition: "To set someone or something free from a situation or restriction." },
    { word: "maintain", definition: "To keep something in good condition or to continue at the same level." },
    { word: "mediate", definition: "To try to end a disagreement between people or groups by talking to them." },
    { word: "minimize", definition: "To reduce something, especially something undesirable, to the smallest possible amount or degree." },
    { word: "mitigate", definition: "To make something less severe, serious, or painful." },
    { word: "motivate", definition: "To provide someone with a reason or incentive to do something." },
    { word: "negotiate", definition: "To try to reach an agreement through discussion and compromise." },
    { word: "oblige", definition: "To require someone to do something by law, necessity, or moral obligation." },
    { word: "omit", definition: "To leave out or exclude something, either intentionally or unintentionally." },
    { word: "oppose", definition: "To disapprove of or resist something actively." },
    { word: "overcome", definition: "To succeed in dealing with a problem or difficulty." },
    { word: "perceive", definition: "To become aware of or understand something through the senses or the mind." },
    { word: "persist", definition: "To continue in a course of action despite difficulty or opposition." },
    { word: "portray", definition: "To depict or describe someone or something in a particular way." },
    { word: "presume", definition: "To suppose something is the case based on probability or assumption." },
    { word: "proclaim", definition: "To announce something publicly or officially." },
    { word: "prohibit", definition: "To formally forbid something by law, rule, or authority." },
    { word: "provoke", definition: "To stimulate or incite someone to feel or do something, often through strong emotions." },
    { word: "reassure", definition: "To say or do something to remove doubts or fears from someone." },
    { word: "refine", definition: "To improve something by making small changes or removing impurities." },
    { word: "reinforce", definition: "To strengthen or support something, especially with additional resources or support." },
    { word: "reiterate", definition: "To say or do something again to emphasize a point." },
    { word: "resolve", definition: "To find a solution to a problem or conflict." },
    { word: "restrict", definition: "To limit or control the size, amount, or range of something." },
    { word: "retain", definition: "To keep possession of something or continue to have something." },
    { word: "reveal", definition: "To make something known that was previously secret or hidden." },
    { word: "simplify", definition: "To make something easier to understand or less complicated." },
    { word: "specify", definition: "To state something in an explicit and detailed manner." },
    { word: "stimulate", definition: "To encourage or arouse interest, enthusiasm, or activity in someone or something." },
    { word: "substitute", definition: "To replace one thing with another, usually something of a similar kind." },
    { word: "succeed", definition: "To achieve a desired goal or outcome, especially after effort." },
    { word: "suppress", definition: "To prevent something from being expressed or known." },
    { word: "sustain", definition: "To keep something going over a period of time or maintain at a certain level." },
    { word: "terminate", definition: "To bring something to an end or to end something formally." },
    { word: "undertake", definition: "To commit oneself to begin and complete a task or responsibility." },
    { word: "utilize", definition: "To make practical and effective use of something." },
    { word: "verify", definition: "To make sure or demonstrate that something is true, accurate, or justified." },

];

// Configuration du jeu
let selectedWord = null;
let selectedDefinition = null;
let score = 0;
let timerInterval;
let timeLeft = 60;
let currentMatrix = [];
let gameOver = false;
let roundsPlayed = 0;
let maxRounds = 5;
let penalty = 5;

// Démarrage du jeu
function startGame() {
    score = 0;
    roundsPlayed = 0;
    gameOver = false;
    timeLeft = 60;
    document.getElementById("start-button").style.display = "none";
    // Démarrer le timer une seule fois au début du jeu
    startTimer();
    startNewRound();
}

// Démarrage d'un nouveau round
function startNewRound() {
    if (roundsPlayed >= maxRounds || timeLeft <= 0) {
        endGame();
        return;
    }

    selectedWord = null;
    selectedDefinition = null;
    document.getElementById("score").innerText = score;
    document.getElementById("message").innerText = "";

    generateMatrix();
    displayWordsAndDefinitions();
    roundsPlayed++;
}

// Génération de la matrice de mots et définitions
function generateMatrix() {
    const selectedWords = [...vocabularyBank]
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);

    currentMatrix = selectedWords.map(word => ({
        word: word.word,
        correctDefinition: word.definition
    }));

    // Mélanger les définitions pour l'affichage
    const shuffledDefinitions = [...currentMatrix]
        .map(item => item.correctDefinition)
        .sort(() => 0.5 - Math.random());

    currentMatrix.forEach((item, index) => {
        item.displayedDefinition = shuffledDefinitions[index];
    });
}

// Affichage des mots et définitions
function displayWordsAndDefinitions() {
    const wordContainer = document.getElementById("word-container");
    const definitionContainer = document.getElementById("definition-container");
    wordContainer.innerHTML = "";
    definitionContainer.innerHTML = "";

    // Afficher les mots
    currentMatrix.forEach((item, index) => {
        const wordElement = document.createElement("div");
        wordElement.className = "word-item";
        wordElement.textContent = item.word;
        wordElement.dataset.index = index;
        wordElement.onclick = () => selectWord(item.word, wordElement);
        wordContainer.appendChild(wordElement);
    });

    // Afficher les définitions mélangées
    currentMatrix.forEach((item, index) => {
        const definitionElement = document.createElement("div");
        definitionElement.className = "definition-item";
        definitionElement.textContent = item.displayedDefinition;
        definitionElement.dataset.index = index;
        definitionElement.onclick = () => selectDefinition(item.displayedDefinition, definitionElement);
        definitionContainer.appendChild(definitionElement);
    });
}

// Sélection d'un mot
function selectWord(word, element) {
    // Réinitialiser les couleurs de tous les mots
    document.querySelectorAll('.word-item').forEach(el => {
        el.style.backgroundColor = "#333";
    });
    
    element.style.backgroundColor = "#4CAF50";
    selectedWord = word;
    checkMatch();
}

// Sélection d'une définition
function selectDefinition(definition, element) {
    // Réinitialiser les couleurs de toutes les définitions
    document.querySelectorAll('.definition-item').forEach(el => {
        el.style.backgroundColor = "#333";
    });
    
    element.style.backgroundColor = "#4CAF50";
    selectedDefinition = definition;
    checkMatch();
}

// Vérification de l'association
function checkMatch() {
    if (selectedWord && selectedDefinition) {
        const wordObject = currentMatrix.find(item => item.word === selectedWord);
        
        if (wordObject && wordObject.correctDefinition === selectedDefinition) {
            // Bonne association
            score += 10;
            document.getElementById("score").innerText = score;
            
            // Masquer les éléments associés
            const wordElements = document.querySelectorAll('.word-item');
            const definitionElements = document.querySelectorAll('.definition-item');
            
            wordElements.forEach(el => {
                if (el.textContent === selectedWord) {
                    el.style.visibility = 'hidden';
                }
            });
            
            definitionElements.forEach(el => {
                if (el.textContent === selectedDefinition) {
                    el.style.visibility = 'hidden';
                }
            });
            
            document.getElementById("message").innerText = "Correct! +10 points";
            document.getElementById("message").style.color = "#4CAF50";
            
            // Vérifier si tous les mots sont associés
            const remainingWords = document.querySelectorAll('.word-item:not([style*="visibility: hidden"])');
            if (remainingWords.length === 0 && timeLeft > 0) {
                setTimeout(() => {
                    if (roundsPlayed < maxRounds) {
                        startNewRound();
                    } else {
                        endGame();
                    }
                }, 1000);
            }
        } else {
            // Mauvaise association
            score -= penalty;
            if (score < 0) score = 0;
            document.getElementById("score").innerText = score;
            document.getElementById("message").innerText = "Incorrect! -5 points";
            document.getElementById("message").style.color = "#ff4444";
        }
        
        // Réinitialiser les sélections
        setTimeout(() => {
            if (!gameOver) {
                selectedWord = null;
                selectedDefinition = null;
                document.querySelectorAll('.word-item, .definition-item').forEach(el => {
                    if (el.style.visibility !== 'hidden') {
                        el.style.backgroundColor = "#333";
                    }
                });
                document.getElementById("message").innerText = "";
            }
        }, 1000);
    }
}

// Gestion du timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// Fin du jeu
function endGame() {
    gameOver = true;
    clearInterval(timerInterval);
    
    let message = "Game Over! ";
    if (timeLeft <= 0) {
        message += "Time's up! ";
    } else if (roundsPlayed >= maxRounds) {
        message += "All rounds completed! ";
    }
    message += `Final score: ${score}`;
    
    document.getElementById("message").innerText = message;
    document.getElementById("start-button").style.display = "block";
    
    // Demander le nom du joueur et sauvegarder le score
    const playerName = prompt("Enter your name to save your score:");
    if (playerName) {
        saveScore(playerName, score);
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById("game-controls");
    startButton.textContent = "Start Game";
    startButton.id = "start-button";
    startButton.onclick = startGame;
});
// Charger les meilleurs scores depuis Firebase
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
            console.error("Error loading top scores: ", error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTopScores();
    document.getElementById("start-button").addEventListener("click", startGame);
});