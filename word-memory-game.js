const wordBank = [
"time", "person", "year", "way", "day", "thing", "man", "world", "life", "hand",
"part", "child", "eye", "woman", "place", "work", "week", "case", "point", "government",
"company", "number", "group", "problem", "fact", "system", "program", "question", "night", "word",
"home", "water", "room", "mother", "area", "money", "story", "month", "right", "study",
"book", "job", "business", "issue", "side", "kind", "head", "house", "service", "friend",
"power", "hour", "game", "line", "end", "member", "law", "car", "city", "community", "name",
"president", "team", "minute", "idea", "body", "information", "back", "parent", "face", "others",
"level", "office", "door", "health", "person", "art", "war", "history", "party", "result",
"change", "morning", "reason", "research", "girl", "guy", "food", "authority", "education", "foot",
"voice", "price", "decision", "communication", "skill", "plan", "goal", "experience", "product",
"relationship", "market", "policy", "process", "action", "effort", "performance", "technology", "development", "opportunity",
"and", "but", "so", "because", "however", "therefore", "although", "meanwhile", "moreover", "furthermore",
"nevertheless", "consequently", "besides", "otherwise", "instead", "thus", "yet", "still", "beside", "then"

];

let currentLevel = 1; // Niveau actuel du jeu
let maxLevel = 10; // Nombre maximum de niveaux
let wordsToRemember = []; // Liste des mots à mémoriser
let enteredWords = []; // Liste des mots saisis par l'utilisateur
let score = 0; // Score du joueur
let timerInterval; // Intervalle pour le compte à rebours

// Fonction pour démarrer le jeu
function startGame() {
    document.getElementById("message").innerText = "";
    document.getElementById("word-list").style.display = "block";
    document.getElementById("input-container").style.display = "none";
    document.getElementById("start-button").style.display = "none"; // Cache le bouton de départ
    enteredWords = []; // Réinitialise les mots saisis

    // Générer les mots à mémoriser selon le niveau actuel
    const wordCount = currentLevel * 5; // Niveau 1 = 5 mots, Niveau 2 = 10 mots, etc.
    wordsToRemember = generateWords(wordCount);
    document.getElementById("word-list").innerText = wordsToRemember.join(" ");
    document.getElementById("timer").innerText = "30"; // Réinitialiser le temps
    startTimer(30); // Commencer le compte à rebours de 30 secondes
}

// Génère une liste de mots aléatoires en fonction du nombre requis
function generateWords(count) {
    let words = [];
    while (words.length < count) {
        const randomIndex = Math.floor(Math.random() * wordBank.length);
        const word = wordBank[randomIndex];
        if (!words.includes(word)) { // Évite les doublons
            words.push(word);
        }
    }
    return words;
}

// Démarre le timer de compte à rebours
function startTimer(seconds) {
    let timeLeft = seconds;
    document.getElementById("timer").innerText = timeLeft; // Affiche le temps restant
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            hideWords(); // Cache les mots quand le temps est écoulé
        }
    }, 1000);
}

// Cache la liste de mots et affiche le champ d'entrée
function hideWords() {
    document.getElementById("word-list").style.display = "none";
    document.getElementById("input-container").style.display = "block";
    generateInputBoxes(wordsToRemember.length);
}

// Génère des boîtes de saisie pour chaque mot
function generateInputBoxes(count) {
    const inputBoxes = document.getElementById("input-boxes");
    inputBoxes.innerHTML = ""; // Effacer les boîtes précédentes
    for (let i = 0; i < count; i++) {
        const inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.className = "input-box";
        inputBox.id = `input-${i}`;
        inputBoxes.appendChild(inputBox);
    }
}

// Vérifie tous les mots saisis et affiche le résultat
function checkWords() {
    // Récupère les mots saisis dans les boîtes de saisie
    enteredWords = [];
    for (let i = 0; i < wordsToRemember.length; i++) {
        const inputBox = document.getElementById(`input-${i}`);
        const enteredWord = inputBox.value.trim().toLowerCase();
        if (enteredWord && !enteredWords.includes(enteredWord)) { // Évite les doublons
            enteredWords.push(enteredWord);
        }
    }

    // Vérifie combien de mots saisis sont corrects et présents dans la liste de départ
    const correctWords = enteredWords.filter(word => wordsToRemember.includes(word));
    const correctCount = correctWords.length;

    if (correctCount === wordsToRemember.length) {
        // Si tout est correct, passer au niveau suivant
        currentLevel++;
        document.getElementById("message").innerText = `Well done! You've passed Level ${currentLevel - 1}. Moving to Level ${currentLevel}.`;
        document.getElementById("level").innerText = currentLevel;

        if (currentLevel > maxLevel) {
            document.getElementById("message").innerText = `Congratulations! You've completed the game with a score of ${score + correctCount}!`;
            document.getElementById("start-button").innerText = "Restart Game";
            document.getElementById("start-button").style.display = "block"; // Affiche le bouton de redémarrage
            currentLevel = 1;
            score = 0;
        } else {
            score += correctCount;
            startGame(); // Démarrer le prochain niveau
        }
    } else {
        // Si les mots ne sont pas tous corrects, fin du jeu
        document.getElementById("message").innerText = `Game over! You got ${correctCount} out of ${wordsToRemember.length} words correct. Final Score: ${score + correctCount}.`;
        document.getElementById("start-button").innerText = "Restart Game";
        document.getElementById("start-button").style.display = "block"; // Affiche le bouton de redémarrage
        currentLevel = 1;
        score = 0;
    }
}
// Désactiver les raccourcis clavier (Ctrl+C, Ctrl+V, Ctrl+X)
document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey && (event.key === 'c' || event.key === 'v' || event.key === 'x')) || (event.metaKey && (event.key === 'c' || event.key === 'v' || event.key === 'x'))) {
        event.preventDefault();
    }
});

// Désactiver le clic droit pour éviter le copier-coller
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
