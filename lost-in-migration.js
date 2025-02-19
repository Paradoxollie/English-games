// Variables globales
let level = 1;
let score = 0;
let timerInterval;
let difficultyMultiplier = 1;
let pointsPerLevel = 1;
let words = [];
let usedWords = new Set();
let currentTheme = "";
let initialTime = 30;
let isTransitioning = false;
let wordIntervals = [];
let moveSpeed = {
    easy: { min: 1, max: 2 },
    medium: { min: 2, max: 3 },
    hard: { min: 3, max: 4 }
};

// Thèmes et mots associés
const themes = {
    "Animals": [
        "lion", "tiger", "elephant", "giraffe", "zebra", "rhinoceros", "hippopotamus", "kangaroo", "panda", "koala", 
        "gorilla", "chimpanzee", "leopard", "jaguar", "wolf", "bear", "deer", "antelope", "buffalo", "camel", 
        "fox", "lynx", "otter", "sloth", "cheetah", "coyote", "moose", "reindeer", "walrus", "seal",
        "ferret", "badger", "hedgehog", "armadillo", "mole", "squirrel", "beaver", "opossum", "raccoon", "skunk",
        "bat", "hyena", "bison", "gazelle", "wolverine", "porcupine", "boar", "muskox", "aardvark", "meerkat"
    ],
    "Professions": [
        "doctor", "teacher", "engineer", "lawyer", "architect", "nurse", "pilot", "chef", "dentist", "electrician",
        "plumber", "mechanic", "programmer", "scientist", "accountant", "journalist", "photographer", "designer", "painter", "musician",
        "firefighter", "paramedic", "police officer", "astronaut", "biologist", "geologist", "pharmacist", "veterinarian", "psychologist", "economist",
        "translator", "surgeon", "carpenter", "bartender", "blacksmith", "butcher", "cashier", "driver", "gardener", "jeweler",
        "judge", "librarian", "magician", "mechanic", "meteorologist", "optician", "pilot", "politician", "sailor", "therapist"
    ],
    "Sports": [
        "football", "basketball", "tennis", "volleyball", "baseball", "cricket", "hockey", "rugby", "golf", "swimming",
        "boxing", "wrestling", "athletics", "cycling", "skiing", "skating", "surfing", "climbing", "rowing", "sailing",
        "karate", "judo", "taekwondo", "archery", "badminton", "bowling", "canoeing", "fencing", "gymnastics", "handball",
        "ice hockey", "kayaking", "lacrosse", "motocross", "paddleboarding", "paragliding", "parkour", "ping pong", "polo", "powerlifting",
        "racing", "rock climbing", "scuba diving", "snowboarding", "speed skating", "triathlon", "ultimate frisbee", "water polo", "weightlifting", "wushu"
    ],
    "Food": [
        "pizza", "burger", "pasta", "sushi", "salad", "sandwich", "steak", "chicken", "rice", "bread",
        "cheese", "soup", "noodles", "fish", "vegetables", "fruits", "dessert", "cake", "ice cream", "chocolate",
        "croissant", "pancake", "muffin", "bagel", "lasagna", "quiche", "taco", "burrito", "paella", "risotto",
        "omelette", "sausage", "kebab", "curry", "dumplings", "hotdog", "pudding", "waffles", "macaron", "donut",
        "smoothie", "milkshake", "yogurt", "popcorn", "honey", "jam", "barbecue", "fondue", "gratin", "fajitas"
    ],
    "Countries": [
        "france", "spain", "italy", "germany", "england", "portugal", "netherlands", "belgium", "sweden", "norway",
        "denmark", "finland", "ireland", "scotland", "greece", "austria", "switzerland", "poland", "russia", "ukraine",
        "china", "japan", "south korea", "india", "pakistan", "indonesia", "thailand", "vietnam", "philippines", "malaysia",
        "egypt", "south africa", "morocco", "tunisia", "algeria", "turkey", "iran", "iraq", "saudi arabia", "israel",
        "australia", "new zealand", "canada", "mexico", "brazil", "argentina", "chile", "colombia", "peru", "venezuela"
    ],
    "Instruments": [
        "piano", "guitar", "violin", "drums", "trumpet", "saxophone", "flute", "clarinet", "cello", "harp",
        "accordion", "harmonica", "trombone", "bass", "banjo", "ukulele", "mandolin", "organ", "synthesizer", "xylophone",
        "bagpipes", "balalaika", "bongo", "conga", "djembe", "didgeridoo", "dulcimer", "erhu", "euphonium", "glockenspiel",
        "gong", "harpsichord", "jaw harp", "kalimba", "koto", "lute", "lyre", "marimba", "melodica", "ocarina",
        "pan flute", "santoor", "sitar", "steel drum", "tabla", "theremin", "timpani", "triangle", "vibraphone", "zither"
    ],
    "Adjectives": [
        "big", "small", "fast", "slow", "hot", "cold", "happy", "sad", "angry", "calm",
        "old", "young", "strong", "weak", "bright", "dark", "heavy", "light", "soft", "hard",
        "clean", "dirty", "rich", "poor", "expensive", "cheap", "easy", "difficult", "long", "short",
        "new", "old-fashioned", "kind", "mean", "friendly", "rude", "quiet", "loud", "beautiful", "ugly",
        "tired", "energetic", "early", "late", "healthy", "sick", "warm", "cool", "curious", "boring"
    ],
    "Verbs": [
        "run", "walk", "jump", "sit", "stand", "write", "read", "speak", "listen", "hear",
        "see", "watch", "touch", "feel", "smell", "taste", "open", "close", "eat", "drink",
        "buy", "sell", "give", "take", "ask", "answer", "call", "talk", "tell", "show",
        "build", "destroy", "push", "pull", "climb", "fall", "think", "learn", "remember", "forget",
        "sleep", "wake", "start", "stop", "play", "work", "win", "lose", "choose", "change"
    ],
    "Household Objects": [
        "chair", "table", "sofa", "bed", "lamp", "door", "window", "curtain", "carpet", "mirror",
        "clock", "radio", "television", "remote", "computer", "phone", "keyboard", "mouse", "book", "shelf",
        "fridge", "oven", "microwave", "toaster", "blender", "sink", "faucet", "shower", "bathtub", "towel",
        "pillow", "blanket", "mattress", "wardrobe", "drawer", "broom", "mop", "vacuum", "bucket", "laundry",
        "hanger", "iron", "dishwasher", "washing machine", "dryer", "fan", "heater", "air conditioner", "stove", "cupboard"
    ],
    "Clothing": [
        "shirt", "t-shirt", "blouse", "sweater", "jacket", "coat", "pants", "jeans", "shorts", "skirt",
        "dress", "suit", "tie", "scarf", "gloves", "hat", "cap", "shoes", "boots", "sandals",
        "sneakers", "socks", "belt", "watch", "glasses", "sunglasses", "handbag", "backpack", "wallet", "earrings",
        "necklace", "bracelet", "ring", "leggings", "stockings", "pajamas", "underwear", "swimsuit", "raincoat", "hoodie",
        "overalls", "uniform", "beanie", "flip-flops", "vest", "turtleneck", "mittens", "tracksuit", "slippers", "parka"
    ],
    "Transportation": [
        "car", "bus", "train", "bicycle", "motorcycle", "airplane", "helicopter", "boat", "ship", "submarine",
        "truck", "van", "taxi", "tram", "subway", "scooter", "rollerblades", "skateboard", "ferry", "hot air balloon",
        "spaceship", "yacht", "canoe", "kayak", "hoverboard", "cruise", "ambulance", "fire truck", "police car", "racing car",
        "tractor", "cart", "wheelchair", "gondola", "rickshaw", "sled", "segway", "dirt bike", "limousine", "pickup truck",
        "monorail", "cable car", "bullet train", "motorboat", "jet ski", "caravan", "trolley", "electric bike", "moped", "zeppelin"
    ]
};

// Fonction de mise à jour du score
function updateScore() {
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    if (scoreElement) scoreElement.textContent = score;
    if (levelElement) levelElement.textContent = level;
}

// Fonction de démarrage du timer
function startTimer(duration) {
    const timerElement = document.getElementById('time-left');
    let timeLeft = duration;
    
    clearInterval(timerInterval);
    
    if (timerElement) timerElement.textContent = timeLeft;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timerElement) timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// Fonction de réinitialisation du jeu
function resetGame() {
    clearInterval(timerInterval);
    wordIntervals.forEach(interval => clearInterval(interval));
    wordIntervals = [];
    
    const wordList = document.getElementById('word-list');
    const messageEl = document.getElementById('message');
    const explanationEl = document.getElementById('explanation');
    const startButton = document.getElementById('start-button');
    const themeEl = document.getElementById('current-theme');
    
    if (wordList) wordList.innerHTML = '';
    if (messageEl) messageEl.innerText = '';
    if (explanationEl) explanationEl.innerText = '';
    if (themeEl) themeEl.innerText = '';
    if (startButton) startButton.style.display = 'block';
    
    level = 1;
    score = 0;
    usedWords.clear();
    updateScore();
}

// Fonction de démarrage du jeu
function startGame() {
    resetGame();
    setDifficulty();
    loadLevel();
    startTimer(initialTime);
}

// Configuration de la difficulté
function setDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    switch(difficulty) {
        case 'easy':
            difficultyMultiplier = 1;
            pointsPerLevel = 20;
            initialTime = 60;
            break;
        case 'medium':
            difficultyMultiplier = 1.5;
            pointsPerLevel = 30;
            initialTime = 45;
            break;
        case 'hard':
            difficultyMultiplier = 2;
            pointsPerLevel = 40;
            initialTime = 30;
            break;
    }
}

// Chargement d'un niveau
function loadLevel() {
    if (isTransitioning) return;
    
    // Sélection d'un thème aléatoire
    const themeKeys = Object.keys(themes);
    let newTheme;
    do {
        newTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    } while (newTheme === currentTheme);
    
    currentTheme = newTheme;
    document.getElementById('current-theme').innerText = `Theme: ${currentTheme}`;
    
    // Sélection des mots du thème
    const themeWords = [...themes[currentTheme]];
    
    // Nombre de mots à afficher (augmente avec le niveau)
    const numWords = Math.min(6 + Math.floor(level/3), 12);
    
    // Sélection aléatoire de mots du thème principal
    words = shuffleArray(themeWords).slice(0, numWords - 1);
    
    // Sélection de l'intrus
    const otherThemes = themeKeys.filter(theme => theme !== currentTheme);
    const randomTheme = otherThemes[Math.floor(Math.random() * otherThemes.length)];
    const intruderWords = themes[randomTheme];
    const intruder = intruderWords[Math.floor(Math.random() * intruderWords.length)];
    
    // Ajout de l'intrus aux mots
    words.push(intruder);
    
    // Mélange final des mots
    words = shuffleArray(words);
    
    // Affichage des mots
    displayWords(words, intruder);
}

// Affichage des mots
function displayWords(words, intruder) {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    wordIntervals.forEach(interval => clearInterval(interval));
    wordIntervals = [];
    
    const difficulty = document.getElementById('difficulty').value;
    
    words.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        if (word === intruder) {
            wordElement.classList.add('intruder');
        }
        wordElement.textContent = word;
        
        // Ajout initial au DOM pour obtenir les dimensions
        wordList.appendChild(wordElement);
        
        // Calcul des limites après l'ajout au DOM
    const wordWidth = wordElement.offsetWidth;
    const wordHeight = wordElement.offsetHeight;
        const containerWidth = wordList.offsetWidth - wordWidth;
        const containerHeight = wordList.offsetHeight - wordHeight;
        
        // Position initiale aléatoire
        wordElement.style.left = `${Math.random() * containerWidth}px`;
        wordElement.style.top = `${Math.random() * containerHeight}px`;
        
        // Direction initiale aléatoire avec vitesse basée sur la difficulté
        const speed = moveSpeed[difficulty].min + 
                     Math.random() * (moveSpeed[difficulty].max - moveSpeed[difficulty].min);
        const angle = Math.random() * 2 * Math.PI;
        const direction = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        if (word === intruder) {
            wordElement.addEventListener('click', () => handleCorrectClick(word));
        } else {
            wordElement.addEventListener('click', () => handleIncorrectClick(word));
        }
        
        // Animation de déplacement
        const interval = setInterval(() => {
            if (!isTransitioning) {
                let left = parseFloat(wordElement.style.left);
                let top = parseFloat(wordElement.style.top);
                
                // Mise à jour de la position
                left += direction.x;
                top += direction.y;
                
                // Gestion des rebonds sur les bords
                if (left <= 0) {
                    left = 0;
                    direction.x = Math.abs(direction.x);
                } else if (left >= containerWidth) {
                    left = containerWidth;
                    direction.x = -Math.abs(direction.x);
                }
                
                if (top <= 0) {
                    top = 0;
                    direction.y = Math.abs(direction.y);
                } else if (top >= containerHeight) {
                    top = containerHeight;
                    direction.y = -Math.abs(direction.y);
                }
                
                wordElement.style.left = `${left}px`;
                wordElement.style.top = `${top}px`;
            }
        }, 16); // ~60 FPS
        
        wordIntervals.push(interval);
    });
}

// Gestion des clics
function handleCorrectClick(word) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    const wordElement = event.target;
    wordElement.classList.add('found');
    
    const points = Math.round(pointsPerLevel * difficultyMultiplier);
    score += points;
    updateScore();
    
    document.getElementById('message').innerText = `Correct! +${points} points`;
    document.getElementById('explanation').innerText = `"${word}" n'appartient pas au thème "${currentTheme}"`;
    
    setTimeout(() => {
    level++;
        isTransitioning = false;
    loadLevel();
    }, 2000);
}

function handleIncorrectClick(word) {
    if (isTransitioning) return;
    
    document.getElementById('message').innerText = 'Incorrect! Try again.';
    document.getElementById('explanation').innerText = `"${word}" appartient bien au thème "${currentTheme}"`;
    
    score = Math.max(0, score - 15);
    updateScore();
}

// Fonctions utilitaires
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Gestion de fin de partie
function endGame() {
    isTransitioning = true;
    wordIntervals.forEach(interval => clearInterval(interval));
    wordIntervals = [];
    document.getElementById('word-list').innerHTML = '';
    document.getElementById('message').innerText = `Game Over! Final Score: ${score}`;
    promptForScore();
}

function promptForScore() {
    const playerName = prompt("Enter your name for the leaderboard:");
    if (playerName) {
        saveScore(playerName, score);
    }
}

// Gestion des scores
function saveScore(playerName, score) {
        db.collection("lost_in_migration_scores").add({
            name: playerName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            loadTopScores();
        document.getElementById('start-button').style.display = 'block';
        })
        .catch((error) => {
        console.error("Error saving score:", error);
        });
}

function loadTopScores() {
    db.collection("lost_in_migration_scores")
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

// Gestion du redimensionnement
window.addEventListener('resize', () => {
    if (document.getElementById('word-list').children.length > 0) {
        const words = [...document.getElementById('word-list').children];
        words.forEach(word => {
            const containerWidth = document.getElementById('word-list').offsetWidth - 100;
            const containerHeight = document.getElementById('word-list').offsetHeight - 50;
            word.style.left = `${Math.random() * containerWidth}px`;
            word.style.top = `${Math.random() * containerHeight}px`;
        });
    }
});
