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

let score = 0;
let timeLeft = 90;
let timerInterval;
let currentVerb = "";
let skippedVerbs = [];

const verbs = {
    "become": ["became", "become", "devenir"],
    "begin": ["began", "begun", "commencer"],
    "break": ["broke", "broken", "casser"],
    "bring": ["brought", "brought", "apporter"],
    "build": ["built", "built", "construire"],
    "buy": ["bought", "bought", "acheter"],
    "catch": ["caught", "caught", "attraper"],
    "choose": ["chose", "chosen", "choisir"],
    "come": ["came", "come", "venir"],
    "cost": ["cost", "cost", "coûter"],
    "cut": ["cut", "cut", "couper"],
    "do": ["did", "done", "faire"],
    "draw": ["drew", "drawn", "dessiner"],
    "drink": ["drank", "drunk", "boire"],
    "drive": ["drove", "driven", "conduire"],
    "eat": ["ate", "eaten", "manger"],
    "fall": ["fell", "fallen", "tomber"],
    "feel": ["felt", "felt", "ressentir"],
    "fight": ["fought", "fought", "se battre"],
    "find": ["found", "found", "trouver"],
    "fly": ["flew", "flown", "voler"],
    "forget": ["forgot", "forgotten", "oublier"],
    "forgive": ["forgave", "forgiven", "pardonner"],
    "freeze": ["froze", "frozen", "geler"],
    "get": ["got", "gotten", "obtenir"],
    "give": ["gave", "given", "donner"],
    "go": ["went", "gone", "aller"],
    "grow": ["grew", "grown", "grandir"],
    "have": ["had", "had", "avoir"],
    "hear": ["heard", "heard", "entendre"],
    "hide": ["hid", "hidden", "cacher"],
    "hit": ["hit", "hit", "frapper"],
    "hold": ["held", "held", "tenir"],
    "hurt": ["hurt", "hurt", "blesser"],
    "keep": ["kept", "kept", "garder"],
    "know": ["knew", "known", "savoir"],
    "learn": ["learnt", "learnt", "apprendre"],
    "leave": ["left", "left", "partir"],
    "lend": ["lent", "lent", "prêter"],
    "let": ["let", "let", "laisser"],
    "lie": ["lay", "lain", "s'allonger"],
    "lose": ["lost", "lost", "perdre"],
    "make": ["made", "made", "faire"],
    "mean": ["meant", "meant", "signifier"],
    "meet": ["met", "met", "rencontrer"],
    "pay": ["paid", "paid", "payer"],
    "put": ["put", "put", "mettre"],
    "read": ["read", "read", "lire"],
    "ride": ["rode", "ridden", "monter"],
    "ring": ["rang", "rung", "sonner"],
    "rise": ["rose", "risen", "se lever"],
    "run": ["ran", "run", "courir"],
    "say": ["said", "said", "dire"],
    "see": ["saw", "seen", "voir"],
    "sell": ["sold", "sold", "vendre"],
    "send": ["sent", "sent", "envoyer"],
    "set": ["set", "set", "mettre"],
    "shake": ["shook", "shaken", "secouer"],
    "shine": ["shone", "shone", "briller"],
    "shoot": ["shot", "shot", "tirer"],
    "show": ["showed", "shown", "montrer"],
    "shut": ["shut", "shut", "fermer"],
    "sing": ["sang", "sung", "chanter"],
    "sink": ["sank", "sunk", "couler"],
    "sit": ["sat", "sat", "s'asseoir"],
    "sleep": ["slept", "slept", "dormir"],
    "speak": ["spoke", "spoken", "parler"],
    "spend": ["spent", "spent", "dépenser"],
    "stand": ["stood", "stood", "se tenir debout"],
    "steal": ["stole", "stolen", "voler"],
    "stick": ["stuck", "stuck", "coller"],
    "swim": ["swam", "swum", "nager"],
    "take": ["took", "taken", "prendre"],
    "teach": ["taught", "taught", "enseigner"],
    "tell": ["told", "told", "dire"],
    "think": ["thought", "thought", "penser"],
    "throw": ["threw", "thrown", "jeter"],
    "understand": ["understood", "understood", "comprendre"],
    "wake": ["woke", "woken", "se réveiller"],
    "wear": ["wore", "worn", "porter"],
    "win": ["won", "won", "gagner"],
    "write": ["wrote", "written", "écrire"],
    "bend": ["bent", "bent", "plier"],
    "bet": ["bet", "bet", "parier"],
    "bind": ["bound", "bound", "lier"],
    "bleed": ["bled", "bled", "saigner"],
    "blow": ["blew", "blown", "souffler"],
    "broadcast": ["broadcast", "broadcast", "diffuser"],
    "burn": ["burnt", "burnt", "brûler"],
    "burst": ["burst", "burst", "éclater"],
    "creep": ["crept", "crept", "ramper"],
    "deal": ["dealt", "dealt", "distribuer"],
    "dig": ["dug", "dug", "creuser"],
    "dream": ["dreamt", "dreamt/dreamed", "rêver"],
    "dwell": ["dwelt", "dwelt", "habiter"],
    "feed": ["fed", "fed", "nourrir"],
    "flee": ["fled", "fled", "fuir"],
    "forbid": ["forbade", "forbidden", "interdire"],
    "grind": ["ground", "ground", "moudre"],
    "hang": ["hung", "hung", "pendre"],
    "kneel": ["knelt", "knelt", "s'agenouiller"],
    "lean": ["leant", "leant", "se pencher"],
    "leap": ["leapt", "leapt", "sauter"],
    "light": ["lit", "lit", "allumer"],
    "prove": ["proved", "proven", "prouver"],
    "quit": ["quit", "quit", "quitter"],
    "seek": ["sought", "sought", "chercher"],
    "shine": ["shone", "shone", "briller"],
    "shoot": ["shot", "shot", "tirer"],
    "smell": ["smelt", "smelt", "sentir"],
    "spell": ["spelled", "spelled", "épeler"],
    "spill": ["spilt", "spilt", "renverser"],
    "spit": ["spit", "spit", "cracher"],
    "spin": ["spun", "spun", "tourner"],
    "split": ["split", "split", "diviser"],
    "spoil": ["spoilt", "spoilt", "gâcher"],
    "spread": ["spread", "spread", "répandre"],
    "spring": ["sprang", "sprung", "sauter"],
    "stand": ["stood", "stood", "se tenir debout"],
    "steal": ["stole", "stolen", "voler"],
    "stick": ["stuck", "stuck", "coller"],
    "sting": ["stung", "stung", "piquer"],
    "stink": ["stank", "stunk", "puer"],
    "strike": ["struck", "struck", "frapper"],
    "swear": ["swore", "sworn", "jurer"],
    "sweep": ["swept", "swept", "balayer"],
    "swell": ["swelled", "swollen", "gonfler"],
    "swing": ["swung", "swung", "balancer"],
    "tear": ["tore", "torn", "déchirer"],
    "throw": ["threw", "thrown", "jeter"],
    "understand": ["understood", "understood", "comprendre"],
    "upset": ["upset", "upset", "contrarier"],
    "wake": ["woke", "woken", "se réveiller"],
    "wear": ["wore", "worn", "porter"],
    "weep": ["wept", "wept", "pleurer"],
    "wet": ["wet", "wet", "mouiller"],
    "wind": ["wound", "wound", "enrouler"],
    "withdraw": ["withdrew", "withdrawn", "retirer"],
    "withstand": ["withstood", "withstood", "résister"],
    "write": ["wrote", "written", "écrire"],
    "bend": ["bent", "bent", "plier"],
    "bet": ["bet", "bet", "parier"],
    "bind": ["bound", "bound", "lier"],
    "bleed": ["bled", "bled", "saigner"],
    "blow": ["blew", "blown", "souffler"],
    "breed": ["bred", "bred", "élever"],
    "broadcast": ["broadcast", "broadcast", "diffuser"],
    "burst": ["burst", "burst", "éclater"],
    "creep": ["crept", "crept", "ramper"],
    "deal": ["dealt", "dealt", "distribuer"],
    "dig": ["dug", "dug", "creuser"],
    "dream": ["dreamt", "dreamt", "rêver"],
    "drink": ["drank", "drunk", "boire"],
    "dwell": ["dwelt", "dwelt", "habiter"],
    "feed": ["fed", "fed", "nourrir"],
    "fight": ["fought", "fought", "se battre"],
    "find": ["found", "found", "trouver"],
    "flee": ["fled", "fled", "fuir"],
    "fling": ["flung", "flung", "jeter"],
    "fly": ["flew", "flown", "voler"],
    "forbid": ["forbade", "forbidden", "interdire"],
    "forgive": ["forgave", "forgiven", "pardonner"],
    "forsake": ["forsook", "forsaken", "abandonner"],
    "freeze": ["froze", "frozen", "geler"],
    "get": ["got", "gotten", "obtenir"],
    "give": ["gave", "given", "donner"],
    "go": ["went", "gone", "aller"],
    "grind": ["ground", "ground", "moudre"],
    "grow": ["grew", "grown", "grandir"],
    "hang": ["hung", "hung", "pendre"],
    "have": ["had", "had", "avoir"],
    "hear": ["heard", "heard", "entendre"],
    "hide": ["hid", "hidden", "cacher"],
    "hold": ["held", "held", "tenir"],
    "hurt": ["hurt", "hurt", "blesser"],
    "kneel": ["knelt", "knelt", "s'agenouiller"],
    "lay": ["laid", "laid", "poser"],
    "lead": ["led", "led", "mener"],
    "lean": ["leant", "leant", "se pencher"],
    "leap": ["leapt", "leapt", "sauter"],
    "learn": ["learnt", "learnt", "apprendre"],
    "leave": ["left", "left", "partir"],
    "lend": ["lent", "lent", "prêter"],
    "let": ["let", "let", "laisser"],
    "lie (down)": ["lay", "lain", "s'allonger"],
    "light": ["lit", "lit", "allumer"],
    "lose": ["lost", "lost", "perdre"],
    "make": ["made", "made", "faire"],
    "mean": ["meant", "meant", "signifier"],
    "meet": ["met", "met", "rencontrer"],
    "mow": ["mowed", "mown/mowed", "tondre"],
    "pay": ["paid", "paid", "payer"],
    "prove": ["proved", "proven", "prouver"],
    "put": ["put", "put", "mettre"],
    "quit": ["quit", "quit", "quitter"],
    "read": ["read", "read", "lire"],
    "ride": ["rode", "ridden", "monter"],
    "ring": ["rang", "rung", "sonner"],
    "rise": ["rose", "risen", "se lever"],
    "run": ["ran", "run", "courir"],
    "say": ["said", "said", "dire"],
    "see": ["saw", "seen", "voir"],
    "sell": ["sold", "sold", "vendre"],
    "send": ["sent", "sent", "envoyer"],
    "set": ["set", "set", "mettre"],
    "shake": ["shook", "shaken", "secouer"],
    "shine": ["shone", "shone", "briller"],
    "shoot": ["shot", "shot", "tirer"],
    "show": ["showed", "shown", "montrer"],
    "shut": ["shut", "shut", "fermer"],
    "sing": ["sang", "sung", "chanter"],
    "sink": ["sank", "sunk", "couler"],
    "sit": ["sat", "sat", "s'asseoir"],
    "sleep": ["slept", "slept", "dormir"],
    "slide": ["slid", "slid", "glisser"],
    "speak": ["spoke", "spoken", "parler"],
    "spend": ["spent", "spent", "dépenser"],
    "spill": ["spilt", "spilt", "renverser"],
    "spin": ["spun", "spun", "tourner"],
    "split": ["split", "split", "diviser"],
    "spread": ["spread", "spread", "répandre"],
    "spring": ["sprang", "sprung", "sauter"],
    "stand": ["stood", "stood", "se tenir debout"],
    "steal": ["stole", "stolen", "voler"],
    "stick": ["stuck", "stuck", "coller"],
    "sting": ["stung", "stung", "piquer"],
    "stink": ["stank", "stunk", "puer"],
    "strike": ["struck", "struck", "frapper"],
    "swear": ["swore", "sworn", "jurer"],
    "sweep": ["swept", "swept", "balayer"],
    "swell": ["swelled", "swollen", "gonfler"],
    "swing": ["swung", "swung", "balancer"],
    "take": ["took", "taken", "prendre"],
    "teach": ["taught", "taught", "enseigner"],
    "tell": ["told", "told", "dire"],
    "think": ["thought", "thought", "penser"],
    "throw": ["threw", "thrown", "jeter"],
    "understand": ["understood", "understood", "comprendre"],
    "upset": ["upset", "upset", "contrarier"],
    "wake": ["woke", "woken", "se réveiller"],
    "wear": ["wore", "worn", "porter"],
    "weep": ["wept", "wept", "pleurer"],
    "wet": ["wet/wetted", "wet/wetted", "mouiller"],
    "win": ["won", "won", "gagner"],
    "wind": ["wound", "wound", "enrouler"],
    "withdraw": ["withdrew", "withdrawn", "retirer"],
    "withstand": ["withstood", "withstood", "résister"],
    "write": ["wrote", "written", "écrire"],
    "wring": ["wrung", "wrung", "tordre"],
    "plead": ["pled", "pled", "plaider"],
    "prove": ["proved", "proven", "prouver"],
    "broadcast": ["broadcast", "broadcast", "diffuser"],
    "input": ["input", "input", "entrer des données"],
    "forecast": ["forecast", "forecast", "prévoir"],
    "forecast": ["forecast", "forecast", "prévoir"],
    "foresee": ["foresaw", "foreseen", "prévoir"],
    "foretell": ["foretold", "foretold", "prédire"],
    "offset": ["offset", "offset", "compenser"],
    "output": ["output", "output", "produire"],
    "reset": ["reset", "reset", "réinitialiser"],
    "overshoot": ["overshot", "overshot", "dépasser"],
    "oversee": ["oversaw", "overseen", "superviser"],
    "overhear": ["overheard", "overheard", "entendre par accident"],
    "redo": ["redid", "redone", "refaire"],
    "overcome": ["overcame", "overcome", "surmonter"],
    "withdraw": ["withdrew", "withdrawn", "retirer"],
    "outdo": ["outdid", "outdone", "surpasser"],
    "shrink": ["shrank", "shrunk", "rétrécir"]
};

function startGame() {
    console.log("Starting game");
    score = 0;
    timeLeft = 90;
    skippedVerbs = [];
    document.getElementById("score-value").textContent = "0";
    document.getElementById("time-left").textContent = "90";
    document.querySelectorAll(".verb-input").forEach(input => input.disabled = false);
    document.getElementById("start-button").disabled = true;
    document.getElementById("check-button").disabled = false;
    document.getElementById("skip-button").disabled = false;
    document.getElementById("skipped-verbs").style.display = "none";
    timerInterval = setInterval(updateTimer, 1000);
    displayVerb();
}

function updateTimer() {
    timeLeft--;
    document.getElementById("time-left").textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

function getRandomVerb() {
    const keys = Object.keys(verbs);
    return keys[Math.floor(Math.random() * keys.length)];
}

function displayVerb() {
    currentVerb = getRandomVerb();
    const difficulty = document.getElementById("difficulty").value;
    const inputContainer = document.getElementById("input-container");
    inputContainer.innerHTML = "";

    document.getElementById("verb-display").textContent = `${currentVerb}`;
    document.getElementById("verb-translation").textContent = `${verbs[currentVerb][2]}`;

    if (difficulty === "1") {
        const input = createInput("past-simple", "Past Simple:", false);
        inputContainer.appendChild(input);
    } else if (difficulty === "2") {
        const input = createInput("past-participle", "Past Participle:", false);
        inputContainer.appendChild(input);
    } else if (difficulty === "3") {
        const input1 = createInput("past-simple", "Past Simple:", false);
        const input2 = createInput("past-participle", "Past Participle:", false);
        inputContainer.appendChild(input1);
        inputContainer.appendChild(input2);
    }

    inputContainer.querySelector("input").focus();
}

function createInput(id, labelText, disabled) {
    const div = document.createElement("div");
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.className = "verb-input";
    input.placeholder = `Type ${labelText.toLowerCase()}`;
    input.disabled = disabled;
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkVerb();
        }
    });
    div.appendChild(label);
    div.appendChild(input);
    return div;
}

function checkVerb() {
    const pastSimpleInput = document.getElementById("past-simple") ? document.getElementById("past-simple").value.trim() : "";
    const pastParticipleInput = document.getElementById("past-participle") ? document.getElementById("past-participle").value.trim() : "";
    const correctForms = verbs[currentVerb];

    let isCorrect = true;

    const difficulty = document.getElementById("difficulty").value;

    if (difficulty === "1") {
        if (!pastSimpleInput || pastSimpleInput.toLowerCase() !== correctForms[0].toLowerCase()) {
            isCorrect = false;
        }
    }

    if (difficulty === "2") {
        if (!pastParticipleInput || pastParticipleInput.toLowerCase() !== correctForms[1].toLowerCase()) {
            isCorrect = false;
        }
    }

    if (difficulty === "3") {
        if (!pastSimpleInput || pastSimpleInput.toLowerCase() !== correctForms[0].toLowerCase()) {
            isCorrect = false;
        }
        if (!pastParticipleInput || pastParticipleInput.toLowerCase() !== correctForms[1].toLowerCase()) {
            isCorrect = false;
        }
    }

    if (isCorrect) {
        const points = parseInt(difficulty);
        score += points;
        document.getElementById("score-value").textContent = score;
        displayVerb();
    } else {
        document.getElementById("input-container").classList.add("shake");

        setTimeout(() => {
            document.getElementById("input-container").classList.remove("shake");
        }, 500);
    }
}

function skipVerb() {
    skippedVerbs.push({
        verb: currentVerb,
        pastSimple: verbs[currentVerb][0],
        pastParticiple: verbs[currentVerb][1]
    });
    displayVerb();
    
}

function endGame() {
    console.log("endGame function called. Final score:", score);
    clearInterval(timerInterval);
    document.querySelectorAll(".verb-input").forEach(input => input.disabled = true);
    document.getElementById("start-button").disabled = false;
    document.getElementById("check-button").disabled = true;
    document.getElementById("skip-button").disabled = true;

    alert("Game Over! Your final score is: " + score);

    if (skippedVerbs.length > 0) {
        const skippedVerbsList = document.getElementById("skipped-verbs-list");
        skippedVerbsList.innerHTML = "";
        skippedVerbs.forEach(verbInfo => {
            const listItem = document.createElement("li");
            listItem.textContent = `${verbInfo.verb} - Past Simple: ${verbInfo.pastSimple}, Past Participle: ${verbInfo.pastParticiple}`;
            skippedVerbsList.appendChild(listItem);
        });
        document.getElementById("skipped-verbs").style.display = "block";
    } else {
        console.log("No skipped verbs");
    }

    console.log("Calling saveScore function");
    saveScore(score);
    skippedVerbs = [];
}

function saveScore(score) {
    console.log("saveScore function called with score:", score);
    
    let playerName = localStorage.getItem('playerName');
    console.log("Player name from localStorage:", playerName);
    
    if (!playerName) {
        playerName = prompt("Enter your name for the leaderboard:");
        console.log("Player entered name:", playerName);
        
        if (playerName) {
            localStorage.setItem('playerName', playerName);
            console.log("Player name saved to localStorage");
        } else {
            console.log("Player did not enter a name");
            return; // Exit the function if no name was entered
        }
    }
    
    console.log("Attempting to save score to database");
    db.collection("speed_verb_scores").add({
        name: playerName,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Score saved successfully");
        loadTopScores();
    })
    .catch((error) => {
        console.error("Error saving score: ", error);
    });
}

function loadTopScores() {
    db.collection("speed_verb_scores")
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

document.addEventListener('DOMContentLoaded', (event) => {
    loadTopScores();
});

// Appeler cette fonction au chargement de la page
document.addEventListener('DOMContentLoaded', (event) => {
    loadTopScores();
    // ... autres initialisations ...
});
  
  document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded");
    loadTopScores();
    const startButton = document.getElementById("start-button");
    const checkButton = document.getElementById("check-button");
    const skipButton = document.getElementById("skip-button");
    
    if (startButton) {
        startButton.addEventListener("click", startGame);
    } else {
        console.error("Start button not found in the DOM");
    }
    
    if (checkButton) {
        checkButton.addEventListener("click", checkVerb);
    } else {
        console.error("Check button not found in the DOM");
    }
    
    if (skipButton) {  // Ajoute cette vérification et l'événement pour le bouton "Skip"
        skipButton.addEventListener("click", skipVerb);
    } else {
        console.error("Skip button not found in the DOM");
    }
});