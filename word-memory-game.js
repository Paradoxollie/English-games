// Désactiver la console
console.log = console.warn = console.error = function() {};

// Tentative de détection et de blocage des outils de développement
setInterval(function(){
    debugger;
}, 100);
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
  
  let currentLevel = 1;
  let maxLevel = 10;
  let wordsToRemember = [];
  let score = 0;
  let timerInterval;
  
  function resetGame() {
    console.log("Resetting game...");
    clearInterval(timerInterval);
    wordsToRemember = [];
    document.getElementById("level").innerText = currentLevel;
    document.getElementById("message").innerText = "";
    document.getElementById("word-list").innerHTML = "";
    document.getElementById("input-container").innerHTML = "";
    console.log("Game reset complete.");
}

function startGame() {
    console.log("Starting game...");
    console.log("Current level:", currentLevel);
    console.log("Current score:", score);
    
    resetGame();
    
    const wordListElement = document.getElementById("word-list");
    const inputContainerElement = document.getElementById("input-container");
    const startButtonElement = document.getElementById("start-button");
    const checkButtonElement = document.getElementById("check-button");
    const timeLeftElement = document.getElementById("time-left");
    
    if (wordListElement) wordListElement.style.display = "block";
    if (inputContainerElement) inputContainerElement.style.display = "none";
    if (startButtonElement) startButtonElement.style.display = "none";
    if (checkButtonElement) checkButtonElement.style.display = "none";

    const wordCount = Math.min(currentLevel + 2, 15);
    console.log(`Generating ${wordCount} words for level ${currentLevel}`);
    wordsToRemember = generateWords(wordCount);
    console.log("Words to remember:", wordsToRemember);
    
    if (wordListElement) wordListElement.innerText = wordsToRemember.join(" ");
    if (timeLeftElement) timeLeftElement.innerText = "20";
    
    updateScore(); // Assurez-vous que le score est correctement affiché
    startTimer(20);
    console.log("Game started successfully. Score:", score);
}
  
  function generateWords(count) {
      let words = [];
      while (words.length < count) {
          const randomIndex = Math.floor(Math.random() * wordBank.length);
          const word = wordBank[randomIndex];
          if (!words.includes(word)) {
              words.push(word);
          }
      }
      return words;
  }
  
  function hideWords() {
    console.log("Hiding words and showing input boxes");
    clearInterval(timerInterval);
    
    const timeLeftElement = document.getElementById("time-left");
    const wordListElement = document.getElementById("word-list");
    const gameContainer = document.getElementById("game-container");
    
    if (timeLeftElement) timeLeftElement.innerText = "0";
    if (wordListElement) wordListElement.style.display = "none";
    
    // Créer ou réinitialiser le conteneur d'entrée
    let inputContainerElement = document.getElementById("input-container");
    if (!inputContainerElement) {
        inputContainerElement = document.createElement("div");
        inputContainerElement.id = "input-container";
        gameContainer.appendChild(inputContainerElement);
    }
    inputContainerElement.style.display = "block";
    inputContainerElement.innerHTML = ''; // Nettoyer le contenu existant
    
    // Créer la div pour les boîtes d'entrée
    const inputBoxesElement = document.createElement("div");
    inputBoxesElement.id = "input-boxes";
    inputContainerElement.appendChild(inputBoxesElement);
    
    // Créer le bouton de vérification
    const checkButton = document.createElement("button");
    checkButton.id = "check-button";
    checkButton.textContent = "Check Words";
    checkButton.onclick = checkWords;
    inputContainerElement.appendChild(checkButton);
    
    generateInputBoxes(wordsToRemember.length);
}

function generateInputBoxes(count) {
    console.log(`Generating ${count} input boxes`);
    const inputBoxesElement = document.getElementById("input-boxes");
    if (!inputBoxesElement) {
        console.error("Element with id 'input-boxes' not found");
        return;
    }
    inputBoxesElement.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.className = "input-box";
        inputBox.id = `input-${i}`;
        inputBoxesElement.appendChild(inputBox);
    }
}

function startTimer(seconds) {
    console.log(`Starting timer with ${seconds} seconds`);
    let timeLeft = seconds;
    const timeLeftElement = document.getElementById("time-left");
    if (timeLeftElement) timeLeftElement.innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeftElement) timeLeftElement.innerText = timeLeft;
        if (timeLeft <= 0) {
            console.log("Timer reached 0, hiding words");
            clearInterval(timerInterval);
            hideWords();
        }
    }, 1000);
}
  
  function generateInputBoxes(count) {
      console.log(`Generating ${count} input boxes`);
      const inputBoxes = document.getElementById("input-boxes");
      inputBoxes.innerHTML = "";
      for (let i = 0; i < count; i++) {
          const inputBox = document.createElement("input");
          inputBox.type = "text";
          inputBox.className = "input-box";
          inputBox.id = `input-${i}`;
          inputBoxes.appendChild(inputBox);
      }
  }
  
  function checkWords() {
    console.log("Checking words...");
    const enteredWords = Array.from(document.getElementsByClassName("input-box")).map(input => input.value.trim().toLowerCase());
    const correctWords = enteredWords.filter(word => wordsToRemember.includes(word));
    const newPoints = correctWords.length;

    score += newPoints;
    updateScore(); // Mise à jour du score affiché

    console.log(`Correct words: ${correctWords.length}/${wordsToRemember.length}`);

    if (correctWords.length === wordsToRemember.length) {
        // Tous les mots sont corrects
        currentLevel++;
        if (currentLevel > maxLevel) {
            endGame();
        } else {
            document.getElementById("message").innerText = `Well done! You've passed Level ${currentLevel - 1}. Moving to Level ${currentLevel}.`;
            document.getElementById("level").innerText = currentLevel;
            setTimeout(() => {
                startGame(); // Démarrer le niveau suivant après un court délai
            }, 2000);
        }
    } else {
        // Certains mots sont incorrects
        document.getElementById("message").innerText = `You got ${newPoints} out of ${wordsToRemember.length} words correct. Game Over. Final Score: ${score}`;
        document.getElementById("start-button").style.display = "inline-block";
        document.getElementById("start-button").innerText = "New Game";
        document.getElementById("check-button").style.display = "none";
        saveScore(score);  // Save the score when the game is lost
    }
}
function newGame() {
    console.log("Starting new game...");
    if (score > 0) {
        saveScore(score);
    }
    currentLevel = 1;
    score = 0;
    updateScore();
    startGame();
}

// Assurez-vous que le bouton "Start Game" appelle newGame et non startGame
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded");
    loadTopScores();
    const startButton = document.getElementById("start-button");
    
    if (startButton) {
        startButton.addEventListener("click", newGame);  // Changed from startGame to newGame
    } else {
        console.error("Start button not found in the DOM");
    }
    

});
function updateScore() {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.textContent = score;
    } else {
        console.error("Score element not found");
    }
    console.log("Score updated:", score);
}
function endGame() {
    clearInterval(timerInterval);
    document.getElementById("message").innerText = `Congratulations! You've completed all levels. Final Score: ${score}`;
    document.getElementById("start-button").style.display = "inline-block";
    document.getElementById("start-button").innerText = "Play Again";
    document.getElementById("check-button").style.display = "none";
    document.getElementById("input-container").style.display = "none";
    
    console.log("Game ended. Saving final score:", score);
    saveScore(score);
}


function saveScore(score) {
    console.log("Saving score:", score);
    db.collection("word_memory_scores").add({
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
    db.collection("word_memory_scores")
        .orderBy("score", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const li = document.createElement("li");
                li.textContent = doc.data().score;
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
    
    if (startButton) {
        startButton.addEventListener("click", startGame);
    } else {
        console.error("Start button not found in the DOM");
    }
    
    if (checkButton) {
        checkButton.addEventListener("click", checkWords);
    } else {
        console.error("Check button not found in the DOM");
    }
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