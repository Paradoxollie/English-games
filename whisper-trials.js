// Variables de jeu et timer
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer');
const wordInput = document.getElementById('current-word');
const submitButton = document.getElementById('submit-word');
const playSoundButton = document.getElementById('play-sound');
const modeSelect = document.getElementById('game-mode');
const startGameButton = document.getElementById('start-game');
let messageDisplay = document.getElementById('message');
let score = 0;
let gameRunning = false;
let gameMode = 'easy';
let currentWord = '';
let timeRemaining = 60; // Temps en secondes
let timerInterval;
let scoreSaved = false; // Ajoute cette variable

// Initialisation du mode de jeu
modeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
});

function startGame() {
    // Arrêter tout timer existant
    clearInterval(timerInterval);
    
    gameRunning = true;
    score = 0;
    scoreSaved = false;
    timeRemaining = 60;
    scoreDisplay.textContent = 'Score: 0';
    timerDisplay.textContent = `Time: ${timeRemaining}s`;
    messageDisplay.textContent = '';
    fetchRandomWord();
    startTimer();
}

// Modification de la fonction startTimer
function startTimer() {
    // S'assurer qu'il n'y a pas de timer en cours
    clearInterval(timerInterval);
    
    if (!gameRunning) return;

    timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame();
            return;
        }
        timeRemaining--;
        timerDisplay.textContent = `Time: ${timeRemaining}s`;
    }, 1000);
}

// Modification de la fonction endGame
function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    timeRemaining = 0; // Forcer le timer à 0
    timerDisplay.textContent = `Time: ${timeRemaining}s`;
    showMessage(`Game Over! Final Score: ${score}`, 'red');

    if (!scoreSaved) {
        scoreSaved = true;
        setTimeout(() => {
            saveScoreToFirebase(score);
        }, 100);
    }
}

// Modification de la fonction resetGame
function resetGame() {
    clearInterval(timerInterval);
    gameRunning = false;
    timeRemaining = 60;
    startGame();
}

// Vérification du mot saisi
function checkWord() {
    const submittedWord = wordInput.value.trim().toLowerCase();
    wordInput.value = '';

    if (submittedWord === currentWord) {
        score += calculatePoints();
        scoreDisplay.textContent = `Score: ${score}`;
        showMessage(`+${calculatePoints()} points!`, '#4CAF50');
        fetchRandomWord(); // Passe au mot suivant si correct
    } else {
        showMessage(`Incorrect! The correct word was: "${currentWord}"`, 'red'); // Affiche la bonne réponse
        setTimeout(fetchRandomWord, 2000); // Passe au mot suivant après un délai
    }
}

// Fonction pour calculer les points en fonction de la difficulté
function calculatePoints() {
    switch (gameMode) {
        case 'easy': return 1;
        case 'normal': return 2;
        case 'hard': return 3;
        default: return 1;
    }
}

// Réinitialisation du jeu
function resetGame() {
    clearInterval(timerInterval); // Arrête le timer précédent
    gameRunning = false;
    startGame();
}

// Affiche un message temporaire pour le joueur
function showMessage(text, color = 'white', duration = 2000) {
    messageDisplay.style.color = color;
    messageDisplay.textContent = text;
    setTimeout(() => {
        if (gameRunning) messageDisplay.textContent = '';
    }, duration);
}

// Fonction pour récupérer un mot aléatoire selon le niveau de difficulté
function fetchRandomWord() {
    const easyWords = [
        "cat", "dog", "sun", "fish", "bird", "house", "tree", "car", "book", "water",
        "food", "day", "night", "apple", "milk", "ball", "cake", "cow", "duck", "egg",
        "farm", "hand", "hat", "kid", "leg", "map", "moon", "nose", "pen", "rain",
        "run", "shoe", "star", "toy", "van", "web", "wind", "year", "boat", "cup",
        "face", "fire", "gift", "hill", "iron", "key", "lamp", "note", "page", "park",
        "rain", "salt", "soap", "tree", "wall", "yard", "bell", "cheese", "dress", "ear",
        "frog", "gate", "ice", "lake", "net", "pear", "rock", "sand", "tent", "wave",
        "wood", "door", "flag", "lock", "pot", "seed", "tent", "vase", "wind", "cloud",
        "stone", "rope", "dish", "corn", "drum", "foam", "grid", "hill", "king", "mint",
        "nest", "owl", "pool", "quiz", "safe", "tape", "wine", "acid", "bell", "card",
        "coin", "dice", "ear", "farm", "goat", "hen", "ice", "jam", "kite", "leaf",
        "mile", "note", "oven", "page", "quiz", "rain", "soap", "toad", "vine", "wood",
        "zone", "beef", "chip", "duck", "fork", "gate", "herb", "joke", "kite", "lime",
        "mile", "nail", "oven", "pond", "rain", "seal", "tide", "veil", "whip", "yard",
        "barn", "cape", "dust", "echo", "flag", "grip", "hail", "iris", "jazz", "knee",
        "lava", "mesh", "numb", "omen", "plug", "reef", "soil", "turf", "void", "wish",
        "ally", "band", "chef", "door", "elf", "foil", "grid", "hive", "isle", "jeep",
        "keep", "lamp", "mint", "note", "omen", "pond", "raft", "soap", "tilt", "veil",
        "arch", "beam", "crab", "dome", "etch", "fizz", "golf", "hoof", "icon", "jade",
        "kite", "lace", "mask", "nest", "obey", "plow", "reed", "seed", "tent", "vast",
        "aqua", "boat", "camp", "dash", "echo", "fish", "gold", "hood", "ice", "jade",
        "knot", "lamp", "mask", "nest", "omen", "park", "reed", "sink", "test", "view",
        "wave", "yard", "zone", "bark", "cash", "dusk", "flag", "gaze", "hoof", "iron",
        "jazz", "kite", "loop", "mask", "navy", "omen", "palm", "reef", "sock", "twin",
        "arch", "bead", "coin", "dust", "echo", "farm", "gold", "hill", "inch", "jade",
        "kite", "lace", "mask", "nest", "omen", "pond", "raft", "seed", "tent", "view",
        "wood", "zinc", "bark", "clay", "dome", "elf", "foil", "gaze", "hook", "iris",
        "jazz", "keep", "lamp", "mint", "note", "omen", "pond", "raft", "seed", "tent",
        "vein", "wave", "yarn", "zone", "bark", "cave", "drum", "echo", "flag", "gaze",
        "hoof", "iris", "jazz", "kite", "lamp", "mint", "nest", "omen", "pond", "reef",
        "sock", "tile", "veil", "wing", "axis", "barn", "clay", "dust", "echo", "fire",
        "gold", "hoof", "inch", "jade", "kite", "lamp", "mint", "nest", "omen", "park",
        "reef", "sock", "tile", "veil", "wing", "yarn", "arch", "beam", "coin", "dust",
        "echo", "fire", "gold", "hill", "inch", "jade", "kite", "lamp", "mint", "nest",
        "omen", "park", "reef", "sock", "tile", "veil", "wing", "yarn", "arch", "beam",
        "coin", "dust", "echo", "fire", "gold", "hill", "inch", "jade", "kite", "lamp",
        "mint", "nest", "omen", "park", "reef", "sock", "tile", "veil", "wing", "yarn",
        "arch", "beam", "coin", "dust", "echo", "fire", "gold", "hill", "inch", "jade",
        "kite", "lamp", "mint", "nest", "omen", "park", "reef", "sock", "tile", "veil",
        "wing", "yarn", "arch", "beam", "coin", "dust", "echo", "fire", "gold", "hill",
        "inch", "jade", "kite", "lamp", "mint", "nest", "omen", "park", "reef", "sock"
    ];
    
    const mediumWords = [
        "table", "window", "garden", "river", "cloud", "storm", "bridge", "forest", "street", "school",
        "market", "mountain", "island", "desert", "jungle", "ocean", "valley", "castle", "palace", "station",
        "airport", "village", "city", "country", "border", "harbor", "museum", "theater", "library", "kitchen",
        "dinner", "breakfast", "lunch", "snack", "beach", "island", "journey", "vacation", "holiday", "spring",
        "summer", "autumn", "winter", "artist", "painter", "doctor", "nurse", "teacher", "student", "engineer",
        "scientist", "author", "writer", "editor", "musician", "singer", "dancer", "actor", "farmer", "worker",
        "manager", "director", "assistant", "electricity", "battery", "circuit", "button", "switch", "machine",
        "computer", "internet", "keyboard", "monitor", "screen", "mouse", "printer", "speaker", "camera", "smartphone",
        "tablet", "robot", "vehicle", "engine", "motor", "bicycle", "motorcycle", "helicopter", "airplane", "parachute",
        "rocket", "submarine", "satellite", "planet", "galaxy", "universe", "solar", "system", "moonlight", "sunshine",
        "raindrop", "snowflake", "thunder", "lightning", "tornado", "hurricane", "cyclone", "volcano", "earthquake", "flood",
        "avalanche", "landslide", "erosion", "drought", "famine", "puzzle", "mystery", "adventure", "journey", "expedition",
        "race", "contest", "tournament", "battle", "war", "conflict", "debate", "discussion", "argument", "friendship",
        "family", "neighbor", "relative", "brother", "sister", "cousin", "nephew", "niece", "uncle", "aunt",
        "grandmother", "grandfather", "parents", "childhood", "youth", "adulthood", "retirement", "memory", "dream", "wish",
        "fortune", "luck", "destiny", "faith", "hope", "charity", "patience", "kindness", "honesty", "courage",
        "bravery", "strength", "intelligence", "wisdom", "knowledge", "education", "learning", "study", "reading", "writing",
        "drawing", "painting", "sculpture", "craft", "ceramic", "woodwork", "metalwork", "glasswork", "fashion", "design",
        "clothing", "accessory", "jewelry", "ring", "necklace", "bracelet", "earring", "wallet", "purse", "handbag",
        "backpack", "suitcase", "luggage", "umbrella", "glove", "scarf", "hat", "helmet", "boot", "sandal",
        "sneaker", "shoe", "sock", "towel", "blanket", "pillow", "sheet", "mattress", "chair", "sofa",
        "carpet", "rug", "curtain", "mirror", "window", "door", "ceiling", "wall", "floor", "garden",
        "patio", "garage", "attic", "basement", "hallway", "corridor", "stairs", "balcony", "roof", "chimney",
        "fireplace", "oven", "microwave", "refrigerator", "freezer", "dishwasher", "sink", "faucet", "shower", "bathtub",
        "toilet", "brush", "comb", "razor", "towel", "soap", "shampoo", "perfume", "deodorant", "makeup",
        "toothbrush", "toothpaste", "floss", "mirror", "clothes", "shoes", "dress", "skirt", "blouse", "shirt",
        "jacket", "coat", "pants", "shorts", "sweater", "gloves", "belt", "scarf", "hat", "socks",
        "pajamas", "boots", "suit", "tie", "umbrella", "wallet", "key", "lock", "bag", "ring",
        "bracelet", "necklace", "earring", "watch", "clock", "calendar", "agenda", "schedule", "appointment", "meeting",
        "conference", "presentation", "project", "task", "deadline", "goal", "achievement", "success", "failure", "mistake",
        "problem", "solution", "idea", "inspiration", "creativity", "imagination", "passion", "hobby", "interest", "activity",
        "exercise", "gym", "workout", "training", "jogging", "running", "walking", "hiking", "biking", "swimming",
        "yoga", "meditation", "dance", "music", "song", "instrument", "guitar", "piano", "drum", "violin",
        "trumpet", "flute", "saxophone", "band", "choir", "concert", "theater", "movie", "film", "cinema",
        "camera", "video", "photography", "picture", "image", "painting", "drawing", "sketch", "sculpture", "architecture",
        "building", "house", "apartment", "hotel", "office", "school", "university", "hospital", "clinic", "store",
        "shop", "mall", "market", "restaurant", "cafe", "bar", "club", "pub", "bakery", "library",
        "museum", "gallery", "station", "airport", "port", "dock", "pier", "bridge", "tunnel", "highway",
        "road", "street", "path", "trail", "park", "garden", "forest", "jungle", "mountain", "hill",
        "valley", "canyon", "river", "lake", "pond", "ocean", "sea", "beach", "shore", "coast",
        "island", "peninsula", "desert", "plain", "plateau", "savannah", "tundra", "arctic", "climate", "weather"
    ];
    
    const hardWords = [
        "psychology", "architecture", "philosophy", "environment", "government", "infrastructure", "constitution", "revolution", "renaissance", "civilization",
        "anthropology", "sociology", "archaeology", "linguistics", "geology", "astronomy", "astrophysics", "biotechnology", "neuroscience", "metamorphosis",
        "nanotechnology", "cryptography", "thermodynamics", "quantum", "mechanics", "relativity", "cosmology", "electromagnetism", "hypothesis", "algorithm",
        "paradigm", "anomaly", "phenomenon", "epistemology", "ontology", "semantics", "syntax", "morphology", "calculus", "trigonometry",
        "hematology", "oncology", "cardiology", "neurology", "immunology", "pathology", "anatomy", "physiology", "dermatology", "endocrinology",
        "rheumatology", "psychiatry", "pharmacology", "toxicology", "bioinformatics", "virology", "bacteriology", "entomology", "paleontology", "botany",
        "zoology", "genomics", "cytology", "evolution", "ecosystem", "biodiversity", "photosynthesis", "respiration", "mitochondria", "chromosome",
        "molecule", "isotope", "compound", "catalyst", "enzyme", "nucleotide", "polymer", "electrolysis", "oxidation", "equilibrium",
        "stoichiometry", "titration", "spectroscopy", "chromatography", "pharmacodynamics", "pharmacokinetics", "hematopoiesis", "immunoassay", "neurotransmitter", "psychoanalysis",
        "psychotherapy", "cognitive", "behavioral", "neuroplasticity", "transcendental", "existential", "phenomenology", "dialectic", "utilitarianism", "deontology",
        "epistemological", "metaphysical", "postmodernism", "existentialism", "utilitarian", "deconstruction", "hermeneutics", "iconoclast", "pedagogy", "heuristics",
        "algorithmic", "cryptanalysis", "cybersecurity", "cybernetics", "informatics", "datastructure", "blockchain", "cryptocurrency", "machinelearning", "artificialintelligence",
        "neuralnetwork", "deepneural", "quantumcomputing", "thermodynamic", "nonlinear", "relativistic", "astrophysics", "hydrodynamics", "biomechanics", "bioengineering",
        "therapeutics", "oncogenesis", "chemotherapy", "radiotherapy", "pharmacogenomics", "bioengineering", "neuroendocrine", "psychoneuroimmunology", "behavioralpsychology", "quantitative",
        "neurophysiology", "neuropsychiatry", "cerebellum", "hypothalamus", "occipital", "cerebral", "subconscious", "introspection", "catharsis", "psychosomatic",
        "sublimation", "transference", "projection", "countertransference", "repression", "libido", "id", "ego", "superego", "reconstruction",
        "historiography", "anthropocentric", "ethnocentrism", "polytheistic", "monotheistic", "agnosticism", "theodicy", "eschatology", "transcendentalism", "empiricism",
        "rationalism", "scholasticism", "existentialist", "utilitarian", "transcendent", "pantheism", "agnostic", "syncretism", "apocryphal", "hagiography",
        "mythology", "iconography", "symbolism", "allegory", "metaphor", "narrative", "epic", "tragedy", "comedy", "satire",
        "aesthetics", "avantgarde", "grotesque", "chiaroscuro", "juxtaposition", "absurdism", "nihilism", "existential", "poststructural", "antagonist",
        "protagonist", "epitome", "paragon", "misogyny", "misanthropy", "xenophobia", "ethnocentrism", "chauvinism", "eugenics", "genocide",
        "diaspora", "hegemony", "imperialism", "colonialism", "repatriation", "reconciliation", "totalitarianism", "authoritarian", "bureaucracy", "aristocracy",
        "theocracy", "oligarchy", "democracy", "republic", "constitutional", "federalism", "anarchy", "dictatorship", "propaganda", "ideology",
        "feminism", "socialism", "capitalism", "communism", "libertarian", "conservatism", "liberalism", "neoliberalism", "nationalism", "globalization",
        "privatization", "industrialization", "urbanization", "ecology", "geopolitics", "biopolitics", "socialcontract", "machiavellian", "utilitarian", "rationalization",
        "bureaucratization", "mobilization", "revolutionary", "insurrection", "civilrights", "apartheid", "segregation", "emancipation", "suffrage", "enfranchisement",
        "legislation", "jurisprudence", "litigation", "arbitration", "mediation", "conglomerate", "cartography", "hydrology", "seismology", "mineralogy",
        "geophysics", "oceanography", "limnology", "cryosphere", "lithosphere", "atmosphere", "ionosphere", "biosphere", "ecosphere", "troposphere",
        "stratosphere", "mesosphere", "exosphere", "biosynthesis", "bioluminescence", "bioremediation", "biohazard", "microbial", "probiotic", "phytoplankton",
        "zooplankton", "endangered", "extinction", "depletion", "sustainability", "biodiversity", "conservation", "deforestation", "desertification", "acidification",
        "ozone", "permafrost", "hydrocarbon", "fossilfuel", "biodegradable", "nonrenewable", "recyclable", "biomass", "photovoltaic", "geothermal",
        "hydroelectric", "bioengineering", "bacteriophage", "antibacterial", "antimicrobial", "antibiotic", "antiviral", "immunotherapy", "chemoprevention", "prophylaxis",
        "vaccination", "inoculation", "immunization", "titration", "tincture", "morphology", "geochemistry", "biogeography", "paleoclimatology", "ethnobotany",
        "ethnopharmacology", "biocontrol", "agroforestry", "agroecology", "urbanecology", "landscapearchitecture", "environmentalscience", "climatology", "meteorology", "ecotoxicology",
        "geomorphology", "oceanology", "spaceweather", "astrobiology", "astrochemistry", "astroecology", "astrogeology", "astrohydrology", "planetology", "exoplanet",
        "biosignature", "astrocartography", "extraterrestrial", "bioastronautics", "cosmochemistry", "planetaryscience", "geosystems", "astrography", "paleontology", "xenobiology",
        "extraterrestrial", "astroengineering", "interstellar", "transgalactic", "astrogeophysics", "cosmogenesis", "astrovirology", "thermodynamics", "spectroscopy", "quantummechanics",
        "hydraulics", "electrochemistry", "materialscience", "biocompatibility", "therapeutics", "cardiovascular", "transplantation", "neuroscience", "telemedicine", "radiology",
        "diagnostics", "pharmacology", "toxicology", "biostatistics", "epidemiology", "biomedical"
        ];
    

    let wordList;
    if (gameMode === 'easy') {
        wordList = easyWords;
    } else if (gameMode === 'normal') {
        wordList = mediumWords;
    } else if (gameMode === 'hard') {
        wordList = hardWords;
    }

    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWord = wordList[randomIndex];
    playWordSound(currentWord);
}

// Fonction pour lire le mot à l'utilisateur
function playWordSound(word) {
    if (!window.speechSynthesis) {
        alert("Votre navigateur ne supporte pas la synthèse vocale.");
        return;
    }

    const accents = ["en-US", "en-GB", "en-AU", "en-CA", "en-IN"];
    const selectedAccent = accents[Math.floor(Math.random() * accents.length)];
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = selectedAccent;
    utterance.rate = 1.1;
    utterance.pitch = 1.2;

    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.lang === selectedAccent && voice.name.includes("Google")) || 
                              voices.find(voice => voice.lang === selectedAccent);

        utterance.voice = selectedVoice || null;
        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    window.speechSynthesis.speak(utterance);
}

// Sauvegarde du score dans Firebase
function saveScoreToFirebase(finalScore) {
    const playerName = prompt("Enter your name to save your score:");
    if (!playerName) return;

    if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();
        db.collection("whisper_trials_scores").add({
            name: playerName,
            score: finalScore,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => loadTopScores())
          .catch((error) => console.error("Erreur en sauvegardant le score:", error));
    }
}

// Chargement des meilleurs scores depuis Firebase
function loadTopScores() {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();
        db.collection("whisper_trials_scores")
          .orderBy("score", "desc")
          .limit(10)
          .get()
          .then((querySnapshot) => {
              const topScoresList = document.getElementById("top-scores-list");
              topScoresList.innerHTML = "";
              querySnapshot.forEach((doc) => {
                  const scoreData = doc.data();
                  const li = document.createElement("li");
                  li.textContent = `${scoreData.name}: ${scoreData.score}`;
                  topScoresList.appendChild(li);
              });
          })
          .catch((error) => {
              console.error("Erreur en chargeant les scores:", error);
          });
    }
}

// Événements pour le son et la soumission de mot
playSoundButton.addEventListener('click', () => playWordSound(currentWord));
submitButton.addEventListener('click', checkWord);
wordInput.addEventListener('keydown', (e) => e.key === 'Enter' && checkWord());

startGameButton.addEventListener('click', () => {
    loadTopScores();
    startGame();
});
// Charger les scores dès le chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadTopScores(); // Charge uniquement les scores
    // Ne pas démarrer le jeu automatiquement
});

// Démarre le jeu uniquement lorsque l'utilisateur clique sur "Start Game"
startGameButton.addEventListener('click', () => {
    startGame(); // Démarre le jeu
});
