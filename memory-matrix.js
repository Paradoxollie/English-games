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
    
    // ... Add more words and definitions here
];

let currentLevel = 1;
let maxLevel = 10;
let matrixSize = 3; // Commencer avec une grille 3x3
let score = 0;
let timerInterval;
let currentMatrix = [];
let studyTime = 30; // 30 secondes pour étudier
let guessTime = 30; // 1 minute pour replacer les mots

function startGame() {
    resetGame();
    generateMatrix();
    displayMatrixWithWords();
    startStudyPhase();
    document.getElementById("start-button").innerText = "Reset Game";
    document.getElementById("check-button").style.display = "none";
}

function resetGame() {
    // Annule l'intervalle de temps s'il existe
    clearInterval(timerInterval);
    
    // Remet à zéro les variables de jeu
    currentLevel = 1; // Reset au niveau 1
    score = 0; // Remet le score à 0
    currentMatrix = [];

    // Réinitialise les éléments d'affichage
    document.getElementById("level").innerText = currentLevel;
    document.getElementById("message").innerText = "Game reset! Click 'Start Game' to play.";
    document.getElementById("matrix-container").innerHTML = "";
    document.getElementById("word-bank").innerHTML = "";
    
    // Réaffiche le bouton start
    document.getElementById("start-button").style.display = "inline-block";
    document.getElementById("start-button").innerText = "Start Game"; // Change le texte du bouton à "Start Game"
    
    // Cache le bouton de vérification (si visible)
    document.getElementById("check-button").style.display = "none";

    // Remet l'input container à l'état initial (optionnel)
    document.getElementById("input-container").style.display = "none";
}

// Ajoute une vérification du texte du bouton pour basculer entre démarrer et réinitialiser
document.getElementById("start-button").addEventListener("click", () => {
    if (document.getElementById("start-button").innerText === "Reset Game") {
        resetGame(); // Réinitialise le jeu
    } else {
        startGame(); // Démarre le jeu
    }
});


function generateMatrix() {
    const wordCount = Math.pow(matrixSize, 2);
    const shuffled = vocabularyBank.sort(() => 0.5 - Math.random());
    currentMatrix = shuffled.slice(0, wordCount);
}

function displayMatrixWithWords() {
    const matrixContainer = document.getElementById("matrix-container");
    matrixContainer.innerHTML = "";
    matrixContainer.style.display = "grid";
    matrixContainer.style.gridTemplateColumns = `repeat(${matrixSize}, 1fr)`;
    matrixContainer.style.gap = "10px";

    currentMatrix.forEach((item, index) => {
        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        cell.innerHTML = `
            <div class="definition">${item.definition}</div>
            <div class="word-slot" data-index="${index}">
                <div class="word">${item.word}</div>
            </div>
        `;
        cell.style.padding = "10px";
        cell.style.border = "1px solid #fff";
        cell.style.textAlign = "center";
        cell.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        matrixContainer.appendChild(cell);
    });
}

function startStudyPhase() {
    document.getElementById("message").innerText = "Study the words and their definitions!";
    startTimer(studyTime, startGuessPhase);
}

function startGuessPhase() {
    document.getElementById("message").innerText = "Now, place the words back in their correct positions!";
    hideWords();
    displayWordBank();
    setupDragAndDrop();
    startTimer(guessTime, checkAnswers);
}

function startTimer(seconds, callback) {
    let timeLeft = seconds;
    const timeLeftElement = document.getElementById("time-left");
    timeLeftElement.innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            callback();
        }
    }, 1000);
}

function startGuessPhase() {
    document.getElementById("message").innerText = "Now, place the words back in their correct positions!";
    hideWords();
    displayWordBank();
    setupDragAndDrop();
    startTimer(guessTime, checkAnswers);
}

function hideWords() {
    const words = document.querySelectorAll(".matrix-cell .word");
    words.forEach(word => {
        word.style.display = "none";
    });
}

function displayWordBank() {
    const wordBank = document.getElementById("word-bank");
    wordBank.innerHTML = "";
    wordBank.style.display = "flex";
    wordBank.style.flexWrap = "wrap";
    wordBank.style.justifyContent = "center";
    wordBank.style.marginTop = "20px";

    const shuffledWords = [...currentMatrix].sort(() => 0.5 - Math.random());

    shuffledWords.forEach((item, index) => {
        const wordElement = document.createElement("div");
        wordElement.className = "word-bank-item";
        wordElement.id = `word-${index}`;
        wordElement.draggable = true;
        wordElement.textContent = item.word;
        wordElement.addEventListener('dragstart', drag);
        wordBank.appendChild(wordElement);
    });
}

function createWordElement(word, isFromBank = false) {
    const wordElement = document.createElement('div');
    wordElement.textContent = word;
    wordElement.className = isFromBank ? 'word-bank-item' : 'word';
    wordElement.draggable = true;
    wordElement.addEventListener('dragstart', drag);
    return wordElement;
}

function setupDragAndDrop() {
    const wordSlots = document.querySelectorAll('.word-slot');
    const wordBankItems = document.querySelectorAll('.word-bank-item');
    
    wordSlots.forEach(slot => {
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('drop', drop);
    });

    wordBankItems.forEach(item => {
        item.addEventListener('dragstart', drag);
    });

    const wordBank = document.getElementById('word-bank');
    wordBank.addEventListener('dragover', dragOver);
    wordBank.addEventListener('drop', dropToBank);
}

function drag(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.dataTransfer.setData('sourceId', e.target.id);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const sourceId = e.dataTransfer.getData('sourceId');
    const targetSlot = e.target.closest('.word-slot');

    if (!targetSlot) return;

    const sourceElement = document.getElementById(sourceId);
    if (!sourceElement) return;

    // If the word is already in a slot, remove it from that slot
    const currentSlot = sourceElement.closest('.word-slot');
    if (currentSlot) {
        currentSlot.removeChild(sourceElement);
    }

    // If there's already a word in the target slot, move it back to the word bank
    const existingWord = targetSlot.querySelector('.word');
    if (existingWord) {
        const wordBank = document.getElementById('word-bank');
        wordBank.appendChild(existingWord);
    }

    // Move the dragged word to the new slot
    targetSlot.appendChild(sourceElement);
}

function startTimer(seconds, callback) {
    let timeLeft = seconds;
    const timeLeftElement = document.getElementById("time-left");
    timeLeftElement.innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            callback();
        }
    }, 1000);
}

function checkAnswers() {
    clearInterval(timerInterval);
    let correctAnswers = 0;
    const cells = document.querySelectorAll('.matrix-cell');
    
    cells.forEach((cell, index) => {
        const wordSlot = cell.querySelector('.word-slot');
        const placedWord = wordSlot.querySelector('.word-bank-item');
        const placedWordText = placedWord ? placedWord.textContent.trim().toLowerCase() : '';
        const correctWord = currentMatrix[index].word.toLowerCase();
        
        if (placedWordText && placedWordText === correctWord) {
            correctAnswers++;
            cell.style.backgroundColor = "rgba(0, 255, 0, 0.3)"; // Vert pour correct
        } else {
            cell.style.backgroundColor = "rgba(255, 0, 0, 0.3)"; // Rouge pour incorrect ou vide
        }
    });

    score += correctAnswers;
    updateScore();

    if (correctAnswers === currentMatrix.length) {
        currentLevel++;
        if (currentLevel > maxLevel) {
            endGame();
        } else {
            document.getElementById("message").innerText = `Well done! You've passed Level ${currentLevel - 1}. Moving to Level ${currentLevel}.`;
            document.getElementById("level").innerText = currentLevel;
            matrixSize = Math.min(matrixSize + 1, 5);
            setTimeout(startGame, 2000);
        }
    } else {
        endGame();
    }
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById("message").innerText = `Game Over. Final Score: ${score}`;
    document.getElementById("start-button").style.display = "inline-block";
    document.getElementById("start-button").innerText = "New Game";
    document.getElementById("check-button").style.display = "none";
    document.getElementById("input-container").style.display = "none";
    saveScore(score);
    // Ajoute un affichage pour le bouton Reset si nécessaire
}

function displayWordBank() {
    const wordBank = document.getElementById("word-bank");
    wordBank.innerHTML = "";
    wordBank.style.display = "flex";
    wordBank.style.flexWrap = "wrap";
    wordBank.style.justifyContent = "center";
    wordBank.style.marginTop = "20px";

    const shuffledWords = [...currentMatrix].sort(() => 0.5 - Math.random());

    shuffledWords.forEach((item, index) => {
        const wordElement = document.createElement("div");
        wordElement.className = "word-bank-item";
        wordElement.id = `word-${index}`;
        wordElement.draggable = true;
        wordElement.textContent = item.word;
        wordElement.addEventListener('dragstart', drag);
        wordBank.appendChild(wordElement);
    });
}

// Assurez-vous que cette fonction est appelée au début de chaque niveau
function setupDragAndDrop() {
    const wordSlots = document.querySelectorAll('.word-slot');
    const wordBankItems = document.querySelectorAll('.word-bank-item');
    
    wordSlots.forEach(slot => {
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('drop', drop);
    });

    wordBankItems.forEach(item => {
        item.addEventListener('dragstart', drag);
    });

    const wordBank = document.getElementById('word-bank');
    wordBank.addEventListener('dragover', dragOver);
    wordBank.addEventListener('drop', dropToBank);
}

function dropToBank(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const sourceId = e.dataTransfer.getData('sourceId');
    const wordElement = document.getElementById(sourceId);

    if (wordElement && !e.target.contains(wordElement)) {
        e.target.appendChild(wordElement);
    }
}

function loadTopScores() {
    db.collection("memory_matrix_scores")
        .orderBy("score", "desc") // Trie les scores par ordre décroissant
        .limit(5) // Limite à 5 meilleurs scores
        .get()
        .then((querySnapshot) => {
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = ""; // Vide la liste avant de la remplir

            querySnapshot.forEach((doc) => {
                const li = document.createElement("li");
                li.textContent = `${doc.data().name}: ${doc.data().score}`; // Affiche le nom et le score
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
    document.getElementById("check-button").addEventListener("click", checkAnswers);
});

// Désactiver les raccourcis clavier et le clic droit
document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey && (event.key === 'c' || event.key === 'v' || event.key === 'x')) || 
        (event.metaKey && (event.key === 'c' || event.key === 'v' || event.key === 'x'))) {
        event.preventDefault();
    }
});

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
