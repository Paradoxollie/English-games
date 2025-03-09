// Variables globales
let score = 0;
let timeLeft = 90;
let timerInterval;
let currentVerb = "";
let skippedVerbs = [];
let playerLevel = 1;
let playerXP = 0;
let xpToNextLevel = 100;
let correctStreak = 0;
let comboMultiplier = 1;
let gameEnhancer;
let verbParticles;
let magicPortal;

// Fonction pour initialiser la modale des règles
function initRulesModal() {
    // Afficher la modale des règles au chargement
    showRulesModal();
    
    // Gestionnaire pour le bouton d'aide
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
        helpButton.addEventListener('click', showRulesModal);
    }
    
    // Gestionnaires pour les boutons de fermeture
    const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Fermer les modales en cliquant à l'extérieur du contenu
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModals();
            }
        });
    });
    
    // Fermer les modales avec la touche Echap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModals();
        }
    });
}

// Fonction pour afficher la modale des règles
function showRulesModal() {
    const rulesModal = document.getElementById('rulesModal');
    if (!rulesModal) return;
    
    // Fermer d'abord toutes les modales
    closeModals();
    
    // Afficher la modale des règles
    rulesModal.classList.add('show');
    rulesModal.style.display = 'flex';
    rulesModal.style.opacity = '1';
    rulesModal.style.visibility = 'visible';
    
    console.log("Modale des règles affichée");
}

// Fonction pour fermer toutes les modales
function closeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal) {
            modal.classList.remove('show');
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            
            setTimeout(() => {
                if (!modal.classList.contains('show')) {
                    modal.style.display = 'none';
                }
            }, 500);
        }
    });
    
    console.log("Modales fermées");
}

// Liste des verbes
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
    console.log("Démarrage du jeu");
    score = 0;
    timeLeft = 90;
    skippedVerbs = [];
    
    document.getElementById("score-value").textContent = "0";
    document.getElementById("time-left").textContent = "90";
    
    document.getElementById("start-button").disabled = true;
    document.getElementById("check-button").disabled = false;
    document.getElementById("skip-button").disabled = false;
    
    timerInterval = setInterval(updateTimer, 1000);
    displayVerb();
    
    // Réinitialiser les statistiques de progression
    correctStreak = 0;
    comboMultiplier = 1;
    updateHUD();
    
    // Ajouter un portail magique
    if (gameEnhancer) {
        const portalPosition = new THREE.Vector3(0, 0, -10);
        magicPortal = gameEnhancer.addMagicPortal(portalPosition, {
            radius: 3,
            color: 0xffd700,
            intensity: 1.2
        });
    }
    
    // Ajouter des verbes flottants en 3D
    if (gameEnhancer) {
        const randomVerbs = verbs.slice(0, 10).map(v => v.infinitive);
        gameEnhancer.addFloatingElements(randomVerbs, {
            color: 0xffd700,
            fontSize: 0.15
        });
    }
}

function updateTimer() {
    timeLeft--;
    document.getElementById("time-left").textContent = timeLeft;
    
    // Ajouter un effet d'urgence quand le temps est presque écoulé
    if (timeLeft <= 10) {
        document.getElementById('timer').classList.add('timer-warning');
    }
    
    if (timeLeft <= 0) {
        endGame();
    }
}

function getRandomVerb() {
    const keys = Object.keys(verbs);
    return keys[Math.floor(Math.random() * keys.length)];
}

function displayVerb() {
    // Obtenir un verbe aléatoire
    const verbKeys = Object.keys(verbs);
    currentVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
    
    // Afficher le verbe
    document.getElementById("verb-display").textContent = currentVerb;
    document.getElementById("verb-translation").textContent = verbs[currentVerb][2];
    
    // Créer les champs de saisie
    const inputContainer = document.getElementById("input-container");
    inputContainer.innerHTML = "";
    
    // Récupérer le niveau de difficulté
    const difficulty = document.getElementById("difficulty").value;
    
    if (difficulty === "1") {
        // Niveau 1: seulement le passé simple
        const pastSimpleLabel = document.createElement("label");
        pastSimpleLabel.textContent = "Past Simple:";
        pastSimpleLabel.setAttribute("for", "past-simple");
        inputContainer.appendChild(pastSimpleLabel);
        
        const pastSimpleInput = document.createElement("input");
        pastSimpleInput.type = "text";
        pastSimpleInput.id = "past-simple";
        pastSimpleInput.className = "verb-input";
        pastSimpleInput.setAttribute("autocomplete", "off");
        inputContainer.appendChild(pastSimpleInput);
        
        // Focus sur le champ
        pastSimpleInput.focus();
    } else if (difficulty === "2") {
        // Niveau 2: seulement le participe passé
        const pastParticipleLabel = document.createElement("label");
        pastParticipleLabel.textContent = "Past Participle:";
        pastParticipleLabel.setAttribute("for", "past-participle");
        inputContainer.appendChild(pastParticipleLabel);
        
        const pastParticipleInput = document.createElement("input");
        pastParticipleInput.type = "text";
        pastParticipleInput.id = "past-participle";
        pastParticipleInput.className = "verb-input";
        pastParticipleInput.setAttribute("autocomplete", "off");
        inputContainer.appendChild(pastParticipleInput);
        
        // Focus sur le champ
        pastParticipleInput.focus();
    } else {
        // Niveau 3: les deux formes
        // Créer le champ pour le passé simple
        const pastSimpleLabel = document.createElement("label");
        pastSimpleLabel.textContent = "Past Simple:";
        pastSimpleLabel.setAttribute("for", "past-simple");
        inputContainer.appendChild(pastSimpleLabel);
        
        const pastSimpleInput = document.createElement("input");
        pastSimpleInput.type = "text";
        pastSimpleInput.id = "past-simple";
        pastSimpleInput.className = "verb-input";
        pastSimpleInput.setAttribute("autocomplete", "off");
        inputContainer.appendChild(pastSimpleInput);
        
        // Créer le champ pour le participe passé
        const pastParticipleLabel = document.createElement("label");
        pastParticipleLabel.textContent = "Past Participle:";
        pastParticipleLabel.setAttribute("for", "past-participle");
        inputContainer.appendChild(pastParticipleLabel);
        
        const pastParticipleInput = document.createElement("input");
        pastParticipleInput.type = "text";
        pastParticipleInput.id = "past-participle";
        pastParticipleInput.className = "verb-input";
        pastParticipleInput.setAttribute("autocomplete", "off");
        inputContainer.appendChild(pastParticipleInput);
        
        // Focus sur le premier champ
        pastSimpleInput.focus();
    }
}

function checkVerb() {
    const difficulty = document.getElementById("difficulty").value;
    let isCorrect = false;
    let correctAnswer = "";
    
    // Vérifier selon le niveau de difficulté
    if (difficulty === "1") {
        const pastSimpleInput = document.getElementById("past-simple").value.trim().toLowerCase();
        const correctPastSimple = verbs[currentVerb][0].toLowerCase();
        
        isCorrect = pastSimpleInput === correctPastSimple;
        correctAnswer = correctPastSimple;
    } else if (difficulty === "2") {
        const pastParticipleInput = document.getElementById("past-participle").value.trim().toLowerCase();
        const correctPastParticiple = verbs[currentVerb][1].toLowerCase();
        
        isCorrect = pastParticipleInput === correctPastParticiple;
        correctAnswer = correctPastParticiple;
    } else {
        const pastSimpleInput = document.getElementById("past-simple").value.trim().toLowerCase();
        const pastParticipleInput = document.getElementById("past-participle").value.trim().toLowerCase();
        
        const correctPastSimple = verbs[currentVerb][0].toLowerCase();
        const correctPastParticiple = verbs[currentVerb][1].toLowerCase();
        
        isCorrect = pastSimpleInput === correctPastSimple && pastParticipleInput === correctPastParticiple;
        correctAnswer = `${correctPastSimple} / ${correctPastParticiple}`;
    }

    if (isCorrect) {
        // Augmenter le combo
        correctStreak++;
        comboMultiplier = 1 + (correctStreak * 0.1); // +10% par réponse correcte consécutive
        
        // Calculer les points avec le multiplicateur
        const basePoints = parseInt(difficulty);
        const pointsWithCombo = Math.round(basePoints * comboMultiplier);
        
        // Ajouter les points au score
        score += pointsWithCombo;
        
        // Ajouter de l'XP
        addExperience(pointsWithCombo * 5);
        
        // Effet de particules pour la bonne réponse
        if (gameEnhancer) {
            const inputElement = document.querySelector('.verb-input');
            inputElement.classList.add('correct-answer');
            setTimeout(() => {
                inputElement.classList.remove('correct-answer');
            }, 100);
        }
        
        document.getElementById("score-value").textContent = score;
        displayVerb();
        
        // Effet d'animation pour le score
        const scoreElement = document.getElementById('score-value');
        scoreElement.classList.add('score-increase');
        setTimeout(() => {
            scoreElement.classList.remove('score-increase');
        }, 500);
        
        // Afficher un message avec animation
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Correct! Well done!";
        messageElement.className = "message-correct message-show";
        setTimeout(() => {
            messageElement.classList.remove('message-show');
        }, 2000);
    } else {
        // Réinitialiser le combo
        correctStreak = 0;
        comboMultiplier = 1;
        
        // Effet de verre brisé
        const inputContainer = document.getElementById("input-container");
        inputContainer.classList.add("shatter-effect");
        setTimeout(() => {
            inputContainer.classList.remove("shatter-effect");
        }, 1000);
        
        document.getElementById("input-container").classList.add("shake");

        setTimeout(() => {
            document.getElementById("input-container").classList.remove("shake");
        }, 500);
        
        // Afficher un message d'erreur avec animation
        const messageElement = document.getElementById('message');
        messageElement.textContent = `Incorrect. The correct answer is: ${correctAnswer}`;
        messageElement.className = "message-incorrect message-show";
        setTimeout(() => {
            messageElement.classList.remove('message-show');
        }, 2000);
    }
    
    // Mettre à jour le HUD
    updateHUD();
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
    window.db.collection("speed_verb_scores").add({
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
    console.log("Chargement des meilleurs scores...");
    window.db.collection("speed_verb_scores")
        .orderBy("score", "desc") // Trie les scores par ordre décroissant
        .limit(5) // Limite à 5 meilleurs scores
        .get()
        .then((querySnapshot) => {
            console.log("Scores récupérés:", querySnapshot.size);
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = ""; // Vide la liste avant de la remplir

            let rank = 1;
            querySnapshot.forEach((doc) => {
                const li = document.createElement("li");
                li.className = `rank-${rank <= 3 ? rank : 'other'}`;
                const scoreData = doc.data();
                
                // Créer la structure du tableau comme dans leaderboard.html
                const rankCell = document.createElement('td');
                rankCell.className = 'rank';
                rankCell.textContent = rank;
                
                const nameCell = document.createElement('td');
                nameCell.className = 'champion';
                nameCell.textContent = scoreData.name || 'Anonymous';
                
                const scoreCell = document.createElement('td');
                scoreCell.className = 'score';
                scoreCell.textContent = scoreData.score;
                
                const dateCell = document.createElement('td');
                dateCell.className = 'date';
                if (scoreData.timestamp) {
                    const date = new Date(scoreData.timestamp.seconds * 1000);
                    dateCell.textContent = date.toLocaleDateString();
                } else {
                    dateCell.textContent = 'N/A';
                }
                
                li.appendChild(rankCell);
                li.appendChild(nameCell);
                li.appendChild(scoreCell);
                li.appendChild(dateCell);
                
                topScoresList.appendChild(li);
                rank++;
            });
            
            // Si aucun score n'est trouvé
            if (querySnapshot.empty) {
                const li = document.createElement("li");
                li.innerHTML = `<td colspan="4" class="text-center py-8 text-gray-400">
                    No scores yet. Be the first to play!
                </td>`;
                topScoresList.appendChild(li);
            }
        })
        .catch((error) => {
            console.error("Error loading top scores: ", error);
            // Afficher un message d'erreur dans la liste
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = `<li><td colspan="4" class="text-center py-8 text-red-500">
                Error loading scores. Please try again later.
            </td></li>`;
        });
}

// Fonction pour initialiser les effets visuels
function initVisualEffects() {
    // Référencer l'instance de GameEnhancer créée dans le HTML
    if (window.gameEnhancerInstance) {
        gameEnhancer = window.gameEnhancerInstance;
    }
    
    // Ajouter des classes pour les effets 3D
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.classList.add('verb-input');
    });
    
    // Autres effets visuels...
    loadTopScores();
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', (event) => {
    const startButton = document.getElementById("start-button");
    const checkButton = document.getElementById("check-button");
    const skipButton = document.getElementById("skip-button");

    if (startButton) startButton.addEventListener("click", startGame);
    if (checkButton) checkButton.addEventListener("click", checkVerb);
    if (skipButton) skipButton.addEventListener("click", skipVerb);
    
    // Initialiser les animations et effets
    initVisualEffects();
    
    // Initialiser la modale des règles
    initRulesModal();
    
    // Dynamiser les éléments interactifs
    document.getElementById('verb-display').classList.add('interactive-element');
    document.getElementById('verb-translation').classList.add('interactive-element');
});

// Fonction pour mettre à jour le HUD
function updateHUD() {
    document.getElementById('score-value').textContent = score;
    document.getElementById('time-left').textContent = timeLeft;
    document.getElementById('level-value').textContent = playerLevel;
    document.getElementById('streak-value').textContent = correctStreak;
    document.getElementById('combo-value').textContent = `x${comboMultiplier.toFixed(1)}`;
    
    // Mettre à jour la barre de progression
    const progressPercent = (playerXP / xpToNextLevel) * 100;
    document.getElementById('xp-progress').style.width = `${progressPercent}%`;
}

// Fonction pour ajouter de l'expérience
function addExperience(xp) {
    playerXP += xp;
    
    // Vérifier si le joueur monte de niveau
    if (playerXP >= xpToNextLevel) {
        levelUp();
    }
    
    updateHUD();
}

// Fonction pour monter de niveau
function levelUp() {
    playerLevel++;
    playerXP -= xpToNextLevel;
    xpToNextLevel = Math.floor(xpToNextLevel * 1.5); // Augmenter l'XP nécessaire
    
    // Effet visuel de montée de niveau
    const levelUpElement = document.createElement('div');
    levelUpElement.className = 'level-up-effect';
    levelUpElement.textContent = `LEVEL UP! ${playerLevel}`;
    document.querySelector('.game-container').appendChild(levelUpElement);
    
    setTimeout(() => {
        levelUpElement.remove();
    }, 3000);
    
    // Bonus de temps pour la montée de niveau
    timeLeft += 10;
    document.getElementById('time-left').textContent = timeLeft;
    
    // Effet de particules spécial
    if (gameEnhancer) {
        const levelIndicator = document.querySelector('.level-indicator');
        gameEnhancer.emitParticles(
            levelIndicator.getBoundingClientRect(),
            { count: 100, color: 0xffd700, size: 0.15, spread: 2 }
        );
    }
}