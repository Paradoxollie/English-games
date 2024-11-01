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
     "able", "about", "above", "abuse", "acid", "act", "actor", "adapt", "add", "admit", "adopt", "adult", "after", "again", "age", "agent", "ago", "agree", "ahead", "aid", "aide", "AIDS", "aim", "air", "album", "alive", "all", "allow", "ally", "alone", "along", "also", "alter", "among", "and", "anger", "angle", "angry", "any", "apart", "apple", "apply", "Arab", "area", "argue", "arise", "arm", "armed", "army", "art", "Asian", "aside", "ask", "asset", "auto", "avoid", "award", "aware", "away", "awful", "baby", "back", "bad", "badly", "bag", "bake", "ball", "ban", "band", "bank", "bar", "base", "basic", "basis", "beach", "bean", "bear", "beat", "bed", "beer", "begin", "being", "bell", "below", "belt", "bench", "bend", "best", "bet", "Bible", "big", "bike", "bill", "bind", "bird", "birth", "bit", "bite", "black", "blade", "blame", "blind", "block", "blood", "blow", "blue", "board", "boat", "body", "bomb", "bond", "bone", "book", "boom", "boot", "born", "boss", "both", "bowl", "box", "boy", "brain", "brand", "bread", "break", "brick", "brief", "bring", "broad", "brown", "brush", "buck", "build", "bunch", "burn", "bury", "bus", "busy", "but", "buy", "buyer", "cabin", "cable", "cake", "call", "camp", "can", "cap", "car", "card", "care", "carry", "case", "cash", "cast", "cat", "catch", "cause", "cell", "CEO", "chain", "chair", "chart", "chase", "cheap", "check", "cheek", "chef", "chest", "chief", "child", "chip", "cite", "city", "civil", "claim", "class", "clean", "clear", "climb", "clock", "close", "cloud", "club", "clue", "coach", "coal", "coast", "coat", "code", "cold", "color", "come", "cook", "cool", "cop", "cope", "copy", "core", "corn", "cost", "couch", "could", "count", "court", "cover", "cow", "crack", "craft", "crash", "crazy", "cream", "crew", "crime", "crop", "cross", "crowd", "cry", "cup", "cut", "cycle", "dad", "daily", "dance", "dare", "dark", "data", "date", "day", "dead", "deal", "dear", "death", "debt", "deck", "deep", "deer", "delay", "deny", "depth", "desk", "die", "diet", "dig", "dirt", "dirty", "dish", "DNA", "dog", "door", "doubt", "down", "dozen", "draft", "drag", "drama", "draw", "dream", "dress", "drink", "drive", "drop", "drug", "dry", "due", "dust", "duty", "each", "eager", "ear", "early", "earn", "earth", "ease", "east", "easy", "eat", "edge", "egg", "eight", "elect", "elite", "else", "empty", "end", "enemy", "enjoy", "enter", "entry", "equal", "era", "error", "essay", "etc", "even", "event", "ever", "every", "exact", "exist", "extra", "eye", "face", "fact", "fade", "fail", "fair", "faith", "fall", "false", "fan", "far", "farm", "fast", "fat", "fate", "fault", "favor", "fear", "fee", "feed", "feel", "fence", "few", "fewer", "fiber", "field", "fifth", "fifty", "fight", "file", "fill", "film", "final", "find", "fine", "fire", "firm", "first", "fish", "fit", "five", "fix", "flag", "flame", "flat", "flee", "flesh", "float", "floor", "flow", "fly", "focus", "folk", "food", "foot", "for", "force", "form", "forth", "found", "four", "frame", "free", "fresh", "from", "front", "fruit", "fuel", "full", "fully", "fun", "fund", "funny", "gain", "game", "gang", "gap", "gas", "gate", "gay", "gaze", "gear", "gene", "get", "ghost", "giant", "gift", "girl", "give", "given", "glad", "glass", "glove", "goal", "God", "gold", "golf", "good", "grab", "grade", "grain", "grand", "grant", "grass", "grave", "gray", "great", "green", "group", "grow", "guard", "guess", "guest", "guide", "gun", "guy", "habit", "hair", "half", "hall", "hand", "hang", "happy", "hard", "hat", "hate", "have", "head", "hear", "heart", "heat", "heavy", "heel", "hell", "hello", "help", "her", "here", "hero", "hey", "hide", "high", "hill", "him", "hip", "hire", "his", "hit", "hold", "hole", "holy", "home", "honey", "honor", "hope", "horse", "host", "hot", "hotel", "hour", "house", "how", "huge", "human", "humor", "hurt", "ice", "idea", "ideal", "ill", "image", "imply", "index", "inner", "into", "Iraqi", "Irish", "iron", "issue", "item", "its", "jail", "jet", "Jew", "job", "join", "joint", "joke", "joy", "judge", "juice", "jump", "jury", "just", "keep", "key", "kick", "kid", "kill", "kind", "king", "kiss", "knee", "knife", "knock", "know", "lab", "label", "labor", "lack", "lady", "lake", "land", "lap", "large", "last", "late", "later", "Latin", "laugh", "law", "lawn", "lay", "layer", "lead", "leaf", "lean", "learn", "least", "leave", "left", "leg", "legal", "lemon", "less", "let", "level", "lie", "life", "lift", "light", "like", "limit", "line", "link", "lip", "list", "live", "load", "loan", "local", "lock", "long", "look", "loose", "lose", "loss", "lost", "lot", "lots", "loud", "love", "lover", "low", "lower", "luck", "lucky", "lunch", "lung", "mad", "mail", "main", "major", "make", "maker", "male", "mall", "man", "many", "map", "mark", "marry", "mask", "mass", "match", "math", "may", "maybe", "mayor", "meal", "mean", "meat", "media", "meet", "menu", "mere", "mess", "metal", "meter", "might", "milk", "mind", "mine", "minor", "miss", "mix", "mode", "model", "mom", "money", "month", "mood", "moon", "moral", "more", "most", "motor", "mount", "mouse", "mouth", "move", "movie", "Mrs", "much", "music", "must", "myth", "naked", "name", "near", "neck", "need", "nerve", "net", "never", "new", "newly", "news", "next", "nice", "night", "nine", "nod", "noise", "none", "nor", "north", "nose", "not", "note", "novel", "now", "n't", "nurse", "nut", "occur", "ocean", "odd", "odds", "off", "offer", "often", "oil", "okay", "old", "once", "one", "onion", "only", "onto", "open", "order", "other", "ought", "our", "out", "oven", "over", "owe", "own", "owner", "pace", "pack", "page", "pain", "paint", "pair", "pale", "palm", "pan", "panel", "pant", "paper", "park", "part", "party", "pass", "past", "patch", "path", "pause", "pay", "peace", "peak", "peer", "per", "pet", "phase", "phone", "photo", "piano", "pick", "pie", "piece", "pile", "pilot", "pine", "pink", "pipe", "pitch", "place", "plan", "plane", "plant", "plate", "play", "plot", "plus", "poem", "poet", "point", "pole", "poll", "pool", "poor", "pop", "porch", "port", "pose", "post", "pot", "pound", "pour", "power", "pray", "press", "price", "pride", "prime", "print", "prior", "proof", "proud", "prove", "pull", "pure", "push", "put", "quick", "quiet", "quit", "quite", "quote", "race", "radio", "rail", "rain", "raise", "range", "rank", "rapid", "rare", "rate", "ratio", "raw", "reach", "react", "read", "ready", "real", "red", "refer", "relax", "rely", "reply", "rest", "rice", "rich", "rid", "ride", "rifle", "right", "ring", "rise", "risk", "river", "road", "rock", "role", "roll", "roof", "room", "root", "rope", "rose", "rough", "round", "route", "row", "rub", "rule", "run", "rural", "rush", "sad", "safe", "sake", "salad", "sale", "sales", "salt", "same", "sand", "sauce", "save", "say", "scale", "scene", "scope", "score", "sea", "seat", "see", "seed", "seek", "seem", "seize", "self", "sell", "send", "sense", "serve", "set", "seven", "sex", "shade", "shake", "shall", "shape", "share", "sharp", "she", "sheet", "shelf", "shell", "shift", "shine", "ship", "shirt", "shit", "shock", "shoe", "shoot", "shop", "shore", "short", "shot", "shout", "show", "shrug", "shut", "sick", "side", "sigh", "sight", "sign", "sin", "since", "sing", "sink", "sir", "sit", "site", "six", "size", "ski", "skill", "skin", "sky", "slave", "sleep", "slice", "slide", "slip", "slow", "small", "smart", "smell", "smile", "smoke", "snap", "snow", "soft", "soil", "solar", "solid", "solve", "some", "son", "song", "soon", "sorry", "sort", "soul", "sound", "soup", "south", "space", "speak", "speed", "spend", "spin", "split", "sport", "spot", "staff", "stage", "stair", "stake", "stand", "star", "stare", "start", "state", "stay", "steal", "steel", "step", "stick", "still", "stir", "stock", "stone", "stop", "store", "storm", "story", "strip", "study", "stuff", "style", "such", "sue", "sugar", "suit", "sun", "super", "sure", "swear", "sweep", "sweet", "swim", "swing", "table", "tail", "take", "tale", "talk", "tall", "tank", "tap", "tape", "task", "taste", "tax", "tea", "teach", "team", "tear", "teen", "tell", "ten", "tend", "tent", "term", "terms", "test", "text", "than", "thank", "that", "the", "their", "them", "theme", "then", "there", "these", "they", "thick", "thin", "thing", "think", "third", "this", "those", "three", "throw", "thus", "tie", "tight", "time", "tiny", "tip", "tire", "tired", "title", "today", "toe", "tone", "too", "tool", "tooth", "top", "topic", "toss", "total", "touch", "tough", "tour", "tower", "town", "toy", "trace", "track", "trade", "trail", "train", "treat", "tree", "trend", "trial", "tribe", "trick", "trip", "troop", "truck", "true", "truly", "trust", "truth", "try", "tube", "turn", "twice", "twin", "two", "type", "ugly", "uncle", "under", "union", "unit", "until", "upon", "upper", "urban", "urge", "use", "used", "user", "usual", "value", "vary", "vast", "very", "via", "video", "view", "virus", "visit", "vital", "voice", "vote", "voter", "wage", "wait", "wake", "walk", "wall", "want", "war", "warm", "warn", "wash", "waste", "watch", "water", "wave", "way", "weak", "wear", "week", "weigh", "well", "west", "wet", "what", "wheel", "when", "where", "which", "while", "white", "who", "whole", "whom", "whose", "why", "wide", "wife", "wild", "will", "win", "wind", "wine", "wing", "wipe", "wire", "wise", "wish", "with", "woman", "wood", "word", "work", "works", "world", "worry", "worth", "would", "wound", "wrap", "write", "wrong", "yard", "yeah", "year", "yell", "yes", "yet", "yield", "you", "young", "your", "yours", "youth", "zone"
    ];
    
    const mediumWords = [
       "abandon", "ability", "abortion", "about", "above", "abroad", "absence", "absolute", "absorb", "abuse", "academic", "accept", "access", "accident", "account", "accurate", "accuse", "achieve", "acquire", "across", "action", "active", "activist", "activity", "actor", "actress", "actual", "actually", "adapt", "addition", "address", "adequate", "adjust", "admire", "admit", "adopt", "adult", "advance", "advanced", "advice", "advise", "adviser", "advocate", "affair", "affect", "afford", "afraid", "African", "after", "again", "against", "agency", "agenda", "agent", "agree", "ahead", "aircraft", "airline", "airport", "album", "alcohol", "alive", "alliance", "allow", "almost", "alone", "along", "already", "alter", "although", "always", "amazing", "American", "among", "amount", "analysis", "analyst", "analyze", "ancient", "anger", "angle", "angry", "animal", "announce", "annual", "another", "answer", "anxiety", "anybody", "anymore", "anyone", "anything", "anyway", "anywhere", "apart", "apparent", "appeal", "appear", "apple", "apply", "appoint", "approach", "approval", "approve", "argue", "argument", "arise", "armed", "around", "arrange", "arrest", "arrival", "arrive", "article", "artist", "artistic", "Asian", "aside", "asleep", "aspect", "assault", "assert", "assess", "asset", "assign", "assist", "assume", "assure", "athlete", "athletic", "attach", "attack", "attempt", "attend", "attitude", "attorney", "attract", "audience", "author", "average", "avoid", "award", "aware", "awful", "badly", "balance", "barely", "barrel", "barrier", "baseball", "basic", "basis", "basket", "bathroom", "battery", "battle", "beach", "beauty", "because", "become", "bedroom", "before", "begin", "behavior", "behind", "being", "belief", "believe", "belong", "below", "bench", "beneath", "benefit", "beside", "besides", "better", "between", "beyond", "Bible", "billion", "birth", "birthday", "black", "blade", "blame", "blanket", "blind", "block", "blood", "board", "bombing", "border", "borrow", "bother", "bottle", "bottom", "boundary", "brain", "branch", "brand", "bread", "break", "breast", "breath", "breathe", "brick", "bridge", "brief", "briefly", "bright", "bring", "British", "broad", "broken", "brother", "brown", "brush", "budget", "build", "building", "bullet", "bunch", "burden", "business", "butter", "button", "buyer", "cabin", "cabinet", "cable", "camera", "campaign", "campus", "Canadian", "cancer", "capable", "capacity", "capital", "captain", "capture", "carbon", "career", "careful", "carrier", "carry", "catch", "category", "Catholic", "cause", "ceiling", "center", "central", "century", "ceremony", "certain", "chain", "chair", "chairman", "chamber", "champion", "chance", "change", "changing", "channel", "chapter", "charge", "charity", "chart", "chase", "cheap", "check", "cheek", "cheese", "chemical", "chest", "chicken", "chief", "child", "Chinese", "choice", "choose", "church", "circle", "citizen", "civil", "civilian", "claim", "class", "classic", "clean", "clear", "clearly", "client", "climate", "climb", "clinic", "clinical", "clock", "close", "closely", "closer", "clothes", "clothing", "cloud", "cluster", "coach", "coast", "coffee", "collapse", "collect", "college", "colonial", "color", "column", "combine", "comedy", "comfort", "command", "comment", "commit", "common", "company", "compare", "compete", "complain", "complete", "complex", "compose", "computer", "concept", "concern", "concert", "conclude", "concrete", "conduct", "confirm", "conflict", "confront", "Congress", "connect", "consider", "consist", "constant", "consume", "consumer", "contact", "contain", "content", "contest", "context", "continue", "contract", "contrast", "control", "convert", "convince", "cookie", "cooking", "corner", "correct", "cotton", "couch", "could", "council", "count", "counter", "country", "county", "couple", "courage", "course", "court", "cousin", "cover", "coverage", "crack", "craft", "crash", "crazy", "cream", "create", "creation", "creative", "creature", "credit", "crime", "criminal", "crisis", "criteria", "critic", "critical", "cross", "crowd", "crucial", "cultural", "culture", "curious", "current", "custom", "customer", "cycle", "daily", "damage", "dance", "danger", "darkness", "daughter", "dealer", "death", "debate", "decade", "decide", "decision", "declare", "decline", "decrease", "deeply", "defeat", "defend", "defense", "deficit", "define", "degree", "delay", "deliver", "delivery", "demand", "Democrat", "depend", "depict", "depth", "deputy", "derive", "describe", "desert", "deserve", "design", "designer", "desire", "despite", "destroy", "detail", "detailed", "detect", "develop", "device", "devote", "dialogue", "differ", "digital", "dining", "dinner", "direct", "directly", "director", "dirty", "disagree", "disaster", "discover", "discuss", "disease", "dismiss", "disorder", "display", "dispute", "distance", "distant", "distinct", "district", "diverse", "divide", "division", "divorce", "doctor", "document", "domestic", "dominant", "dominate", "double", "doubt", "downtown", "dozen", "draft", "drama", "dramatic", "drawing", "dream", "dress", "drink", "drive", "driver", "during", "eager", "early", "earnings", "earth", "easily", "eastern", "economic", "economy", "edition", "editor", "educate", "educator", "effect", "effort", "eight", "either", "elderly", "elect", "election", "electric", "element", "elite", "e-mail", "embrace", "emerge", "emission", "emotion", "emphasis", "employ", "employee", "employer", "empty", "enable", "enemy", "energy", "engage", "engine", "engineer", "English", "enhance", "enjoy", "enormous", "enough", "ensure", "enter", "entire", "entirely", "entrance", "entry", "episode", "equal", "equally", "error", "escape", "essay", "estate", "estimate", "ethics", "ethnic", "European", "evaluate", "evening", "event", "every", "everyday", "everyone", "evidence", "evolve", "exact", "exactly", "examine", "example", "exceed", "except", "exchange", "exciting", "exercise", "exhibit", "exist", "existing", "expand", "expect", "expense", "expert", "explain", "explode", "explore", "expose", "exposure", "express", "extend", "extent", "external", "extra", "extreme", "fabric", "facility", "factor", "factory", "faculty", "failure", "fairly", "faith", "false", "familiar", "family", "famous", "fantasy", "farmer", "fashion", "father", "fault", "favor", "favorite", "feature", "federal", "feeling", "fellow", "female", "fence", "fewer", "fiber", "fiction", "field", "fifteen", "fifth", "fifty", "fight", "fighter", "fighting", "figure", "final", "finally", "finance", "finding", "finger", "finish", "first", "fishing", "fitness", "flame", "flavor", "flesh", "flight", "float", "floor", "flower", "focus", "follow", "football", "force", "foreign", "forest", "forever", "forget", "formal", "former", "formula", "forth", "fortune", "forward", "found", "founder", "fourth", "frame", "freedom", "freeze", "French", "frequent", "fresh", "friend", "friendly", "front", "fruit", "fully", "function", "funding", "funeral", "funny", "future", "galaxy", "gallery", "garage", "garden", "garlic", "gather", "gender", "general", "generate", "genetic", "gently", "German", "gesture", "ghost", "giant", "gifted", "given", "glance", "glass", "global", "glove", "golden", "governor", "grade", "graduate", "grain", "grand", "grant", "grass", "grave", "great", "greatest", "green", "grocery", "ground", "group", "growing", "growth", "guard", "guess", "guest", "guide", "guilty", "habit", "habitat", "handful", "handle", "happen", "happy", "hardly", "headline", "health", "healthy", "hearing", "heart", "heaven", "heavily", "heavy", "height", "hello", "helpful", "heritage", "herself", "highly", "highway", "himself", "historic", "history", "holiday", "homeless", "honest", "honey", "honor", "horizon", "horror", "horse", "hospital", "hotel", "house", "housing", "however", "human", "humor", "hundred", "hungry", "hunter", "hunting", "husband", "ideal", "identify", "identity", "ignore", "illegal", "illness", "image", "imagine", "impact", "imply", "impose", "impress", "improve", "incident", "include", "income", "increase", "indeed", "index", "Indian", "indicate", "industry", "infant", "inform", "initial", "injury", "inner", "innocent", "inquiry", "inside", "insight", "insist", "inspire", "install", "instance", "instead", "intend", "intense", "interest", "internal", "Internet", "invasion", "invest", "investor", "invite", "involve", "involved", "Iraqi", "Irish", "Islamic", "island", "Israeli", "issue", "Italian", "itself", "jacket", "Japanese", "Jewish", "joint", "journal", "journey", "judge", "judgment", "juice", "junior", "justice", "justify", "killer", "killing", "kitchen", "knife", "knock", "label", "labor", "language", "large", "largely", "later", "Latin", "latter", "laugh", "launch", "lawsuit", "lawyer", "layer", "leader", "leading", "league", "learn", "learning", "least", "leather", "leave", "legacy", "legal", "legend", "lemon", "length", "lesson", "letter", "level", "liberal", "library", "license", "lifetime", "light", "likely", "limit", "limited", "listen", "literary", "little", "living", "local", "locate", "location", "loose", "lovely", "lover", "lower", "lucky", "lunch", "machine", "magazine", "mainly", "maintain", "major", "majority", "maker", "makeup", "manage", "manager", "manner", "margin", "market", "marriage", "married", "marry", "massive", "master", "match", "material", "matter", "maybe", "mayor", "meaning", "measure", "media", "medical", "medicine", "medium", "meeting", "member", "memory", "mental", "mention", "merely", "message", "metal", "meter", "method", "Mexican", "middle", "might", "military", "million", "minister", "minor", "minority", "minute", "miracle", "mirror", "missile", "mission", "mistake", "mixture", "mm-hmm", "model", "moderate", "modern", "modest", "moment", "money", "monitor", "month", "moral", "moreover", "morning", "mortgage", "mostly", "mother", "motion", "motor", "mount", "mountain", "mouse", "mouth", "movement", "movie", "multiple", "murder", "muscle", "museum", "music", "musical", "musician", "Muslim", "mutual", "myself", "mystery", "naked", "narrow", "nation", "national", "native", "natural", "nature", "nearby", "nearly", "negative", "neighbor", "neither", "nerve", "nervous", "network", "never", "newly", "night", "nobody", "noise", "normal", "normally", "north", "northern", "nothing", "notice", "notion", "novel", "nowhere", "nuclear", "number", "numerous", "nurse", "object", "observe", "observer", "obtain", "obvious", "occasion", "occupy", "occur", "ocean", "offense", "offer", "office", "officer", "official", "often", "Olympic", "ongoing", "onion", "online", "opening", "operate", "operator", "opinion", "opponent", "oppose", "opposite", "option", "orange", "order", "ordinary", "organic", "organize", "origin", "original", "other", "others", "ought", "outcome", "outside", "overall", "overcome", "overlook", "owner", "package", "painful", "paint", "painter", "painting", "panel", "paper", "parent", "parking", "partly", "partner", "party", "passage", "passion", "patch", "patient", "pattern", "pause", "payment", "peace", "penalty", "people", "pepper", "perceive", "perfect", "perform", "perhaps", "period", "permit", "person", "personal", "persuade", "phase", "phone", "photo", "phrase", "physical", "piano", "picture", "piece", "pilot", "pitch", "place", "plane", "planet", "planning", "plant", "plastic", "plate", "platform", "player", "please", "pleasure", "plenty", "pocket", "poetry", "point", "police", "policy", "politics", "popular", "porch", "portion", "portrait", "portray", "position", "positive", "possess", "possible", "possibly", "potato", "pound", "poverty", "powder", "power", "powerful", "practice", "prayer", "predict", "prefer", "pregnant", "prepare", "presence", "present", "preserve", "press", "pressure", "pretend", "pretty", "prevent", "previous", "price", "pride", "priest", "primary", "prime", "print", "prior", "priority", "prison", "prisoner", "privacy", "private", "probably", "problem", "proceed", "process", "produce", "producer", "product", "profile", "profit", "program", "progress", "project", "promise", "promote", "prompt", "proof", "proper", "properly", "property", "proposal", "propose", "proposed", "prospect", "protect", "protein", "protest", "proud", "prove", "provide", "provider", "province", "public", "publicly", "publish", "purchase", "purpose", "pursue", "qualify", "quality", "quarter", "question", "quick", "quickly", "quiet", "quietly", "quite", "quote", "racial", "radical", "radio", "raise", "range", "rapid", "rapidly", "rarely", "rather", "rating", "ratio", "reach", "react", "reaction", "reader", "reading", "ready", "reality", "realize", "really", "reason", "recall", "receive", "recent", "recently", "recipe", "record", "recover", "recovery", "recruit", "reduce", "refer", "reflect", "reform", "refugee", "refuse", "regard", "regime", "region", "regional", "register", "regular", "regulate", "reject", "relate", "relation", "relative", "relax", "release", "relevant", "relief", "religion", "remain", "remember", "remind", "remote", "remove", "repeat", "replace", "reply", "report", "reporter", "request", "require", "research", "resemble", "resident", "resist", "resolve", "resort", "resource", "respect", "respond", "response", "restore", "result", "retain", "retire", "return", "reveal", "revenue", "review", "rhythm", "rifle", "right", "river", "romantic", "rough", "roughly", "round", "route", "routine", "running", "rural", "Russian", "sacred", "safety", "salad", "salary", "sales", "sample", "sanction", "satisfy", "sauce", "saving", "scale", "scandal", "scared", "scenario", "scene", "schedule", "scheme", "scholar", "school", "science", "scope", "score", "scream", "screen", "script", "search", "season", "second", "secret", "section", "sector", "secure", "security", "segment", "seize", "select", "Senate", "senator", "senior", "sense", "sentence", "separate", "sequence", "series", "serious", "serve", "service", "session", "setting", "settle", "seven", "several", "severe", "sexual", "shade", "shadow", "shake", "shall", "shape", "share", "sharp", "sheet", "shelf", "shell", "shelter", "shift", "shine", "shirt", "shock", "shoot", "shooting", "shopping", "shore", "short", "shortly", "should", "shoulder", "shout", "shower", "shrug", "sight", "signal", "silence", "silent", "silver", "similar", "simple", "simply", "since", "singer", "single", "sister", "skill", "slave", "sleep", "slice", "slide", "slight", "slightly", "slowly", "small", "smart", "smell", "smile", "smoke", "smooth", "soccer", "social", "society", "software", "solar", "soldier", "solid", "solution", "solve", "somebody", "somehow", "someone", "somewhat", "sorry", "sound", "source", "south", "southern", "Soviet", "space", "Spanish", "speak", "speaker", "special", "species", "specific", "speech", "speed", "spend", "spending", "spirit", "split", "sport", "spread", "spring", "square", "squeeze", "stable", "staff", "stage", "stair", "stake", "stand", "standard", "standing", "stare", "start", "state", "station", "status", "steady", "steal", "steel", "stick", "still", "stock", "stomach", "stone", "storage", "store", "storm", "story", "straight", "strange", "stranger", "strategy", "stream", "street", "strength", "stress", "stretch", "strike", "string", "strip", "stroke", "strong", "strongly", "struggle", "student", "studio", "study", "stuff", "stupid", "style", "subject", "submit", "succeed", "success", "sudden", "suddenly", "suffer", "sugar", "suggest", "suicide", "summer", "summit", "super", "supply", "support", "suppose", "supposed", "Supreme", "surely", "surface", "surgery", "surprise", "surround", "survey", "survival", "survive", "survivor", "suspect", "sustain", "swear", "sweep", "sweet", "swing", "switch", "symbol", "symptom", "system", "table", "tactic", "talent", "target", "taste", "taxpayer", "teach", "teacher", "teaching", "teaspoon", "teenager", "tendency", "tennis", "tension", "terms", "terrible", "terror", "testify", "testing", "thank", "thanks", "theater", "their", "theme", "theory", "therapy", "there", "these", "thick", "thing", "think", "thinking", "third", "thirty", "those", "though", "thought", "thousand", "threat", "threaten", "three", "throat", "through", "throw", "ticket", "tight", "tired", "tissue", "title", "tobacco", "today", "together", "tomato", "tomorrow", "tongue", "tonight", "tooth", "topic", "total", "totally", "touch", "tough", "tourist", "toward", "towards", "tower", "trace", "track", "trade", "traffic", "tragedy", "trail", "train", "training", "transfer", "travel", "treat", "treaty", "trend", "trial", "tribe", "trick", "troop", "trouble", "truck", "truly", "trust", "truth", "tunnel", "twelve", "twenty", "twice", "typical", "ultimate", "unable", "uncle", "under", "undergo", "uniform", "union", "unique", "United", "universe", "unknown", "unless", "unlike", "unlikely", "until", "unusual", "upper", "urban", "useful", "usual", "usually", "utility", "vacation", "valley", "valuable", "value", "variable", "variety", "various", "vehicle", "venture", "version", "versus", "vessel", "veteran", "victim", "victory", "video", "viewer", "village", "violate", "violence", "violent", "virtue", "virus", "visible", "vision", "visit", "visitor", "visual", "vital", "voice", "volume", "voter", "wander", "warning", "waste", "watch", "water", "wealth", "wealthy", "weapon", "weather", "wedding", "weekend", "weekly", "weigh", "weight", "welcome", "welfare", "western", "whatever", "wheel", "whenever", "where", "whereas", "whether", "which", "while", "whisper", "white", "whole", "whose", "widely", "willing", "window", "winner", "winter", "wisdom", "withdraw", "within", "without", "witness", "woman", "wonder", "wooden", "worker", "working", "works", "workshop", "world", "worried", "worry", "worth", "would", "wound", "write", "writer", "writing", "wrong", "yellow", "yield", "young", "yours", "yourself", "youth"
    ];
    
    const hardWords = [
"abortion", "absolute", "absolutely", "academic", "accident", "accompany", "accomplish", "according", "accurate", "achievement", "acknowledge", "activist", "activity", "actually", "addition", "additional", "adequate", "adjustment", "administration", "administrator", "admission", "adolescent", "advanced", "advantage", "adventure", "advertising", "advocate", "African-American", "afternoon", "aggressive", "agreement", "agricultural", "aircraft", "alliance", "alternative", "although", "American", "analysis", "anniversary", "announce", "anticipate", "anything", "anywhere", "apartment", "apparent", "apparently", "appearance", "application", "appointment", "appreciate", "approach", "appropriate", "approval", "approximately", "architect", "argument", "arrangement", "artistic", "assessment", "assignment", "assistance", "assistant", "associate", "association", "assumption", "athletic", "atmosphere", "attention", "attitude", "attorney", "attractive", "attribute", "audience", "authority", "available", "awareness", "background", "baseball", "basically", "basketball", "bathroom", "beautiful", "beginning", "behavior", "biological", "birthday", "boundary", "boyfriend", "breakfast", "brilliant", "building", "business", "calculate", "campaign", "Canadian", "candidate", "capability", "capacity", "carefully", "category", "Catholic", "celebrate", "celebration", "celebrity", "ceremony", "certainly", "chairman", "challenge", "champion", "championship", "changing", "character", "characteristic", "characterize", "chemical", "childhood", "chocolate", "cholesterol", "Christian", "Christmas", "cigarette", "circumstance", "civilian", "classroom", "clinical", "clothing", "coalition", "cognitive", "collapse", "colleague", "collection", "collective", "colonial", "combination", "comfortable", "commander", "commercial", "commission", "commitment", "committee", "communicate", "communication", "community", "comparison", "competition", "competitive", "competitor", "complain", "complaint", "complete", "completely", "complicated", "component", "composition", "comprehensive", "computer", "concentrate", "concentration", "concerned", "conclude", "conclusion", "concrete", "condition", "conference", "confidence", "confident", "conflict", "confront", "confusion", "Congress", "congressional", "connection", "consciousness", "consensus", "consequence", "conservative", "consider", "considerable", "consideration", "consistent", "constant", "constantly", "constitute", "constitutional", "construct", "construction", "consultant", "consumer", "consumption", "container", "contemporary", "continue", "continued", "contract", "contrast", "contribute", "contribution", "controversial", "controversy", "convention", "conventional", "conversation", "conviction", "convince", "cooperation", "corporate", "corporation", "correspondent", "counselor", "coverage", "creation", "creative", "creature", "criminal", "criteria", "critical", "criticism", "criticize", "cultural", "currently", "curriculum", "customer", "dangerous", "darkness", "daughter", "decision", "decrease", "defendant", "defensive", "definitely", "definition", "delivery", "democracy", "Democrat", "democratic", "demonstrate", "demonstration", "department", "dependent", "depending", "depression", "describe", "description", "designer", "desperate", "destruction", "detailed", "determine", "developing", "development", "dialogue", "difference", "different", "differently", "difficult", "difficulty", "dimension", "direction", "directly", "director", "disability", "disagree", "disappear", "disaster", "discipline", "discourse", "discover", "discovery", "discrimination", "discussion", "disorder", "distance", "distinct", "distinction", "distinguish", "distribute", "distribution", "district", "diversity", "division", "document", "domestic", "dominant", "dominate", "downtown", "dramatic", "dramatically", "earnings", "economic", "economics", "economist", "education", "educational", "educator", "effective", "effectively", "efficiency", "efficient", "election", "electric", "electricity", "electronic", "elementary", "eliminate", "elsewhere", "emergency", "emission", "emotional", "emphasis", "emphasize", "employee", "employer", "employment", "encounter", "encourage", "enforcement", "engineer", "engineering", "enormous", "enterprise", "entertainment", "entirely", "entrance", "environment", "environmental", "equipment", "especially", "essential", "essentially", "establish", "establishment", "estimate", "European", "evaluate", "evaluation", "eventually", "everybody", "everyday", "everyone", "everything", "everywhere", "evidence", "evolution", "examination", "excellent", "exception", "exchange", "exciting", "executive", "exercise", "exhibition", "existence", "existing", "expansion", "expectation", "expensive", "experience", "experiment", "explanation", "explosion", "exposure", "expression", "extension", "extensive", "external", "extraordinary", "extremely", "facility", "familiar", "favorite", "fighting", "financial", "following", "football", "formation", "foundation", "framework", "frequency", "frequent", "frequently", "friendly", "friendship", "frustration", "function", "fundamental", "furniture", "furthermore", "generally", "generate", "generation", "gentleman", "girlfriend", "government", "governor", "gradually", "graduate", "grandfather", "grandmother", "greatest", "guarantee", "guideline", "headline", "headquarters", "helicopter", "heritage", "highlight", "historian", "historic", "historical", "homeless", "hospital", "household", "hypothesis", "identification", "identify", "identity", "illustrate", "imagination", "immediate", "immediately", "immigrant", "immigration", "implement", "implication", "importance", "important", "impossible", "impression", "impressive", "improvement", "incentive", "incident", "including", "incorporate", "increase", "increased", "increasing", "increasingly", "incredible", "independence", "independent", "indicate", "indication", "individual", "industrial", "industry", "infection", "inflation", "influence", "information", "ingredient", "initially", "initiative", "innocent", "instance", "institution", "institutional", "instruction", "instructor", "instrument", "insurance", "intellectual", "intelligence", "intensity", "intention", "interaction", "interest", "interested", "interesting", "internal", "international", "Internet", "interpret", "interpretation", "intervention", "interview", "introduce", "introduction", "invasion", "investigate", "investigation", "investigator", "investment", "investor", "involved", "involvement", "Japanese", "journalist", "judgment", "knowledge", "laboratory", "landscape", "language", "leadership", "learning", "legislation", "legitimate", "lifestyle", "lifetime", "limitation", "literally", "literary", "literature", "location", "long-term", "magazine", "maintain", "maintenance", "majority", "management", "manufacturer", "manufacturing", "marketing", "marriage", "material", "meanwhile", "measurement", "mechanism", "medication", "medicine", "membership", "military", "minister", "minority", "moderate", "moreover", "mortgage", "motivation", "mountain", "movement", "multiple", "musician", "narrative", "national", "naturally", "necessarily", "necessary", "negative", "negotiate", "negotiation", "neighbor", "neighborhood", "nevertheless", "newspaper", "nomination", "nonetheless", "normally", "northern", "numerous", "objective", "obligation", "observation", "observer", "obviously", "occasion", "occasionally", "occupation", "offensive", "official", "operating", "operation", "operator", "opponent", "opportunity", "opposite", "opposition", "ordinary", "organization", "organize", "orientation", "original", "originally", "otherwise", "ourselves", "overcome", "overlook", "painting", "Palestinian", "participant", "participate", "participation", "particular", "particularly", "partnership", "passenger", "perceive", "percentage", "perception", "perfectly", "performance", "permanent", "permission", "personal", "personality", "personally", "personnel", "perspective", "persuade", "phenomenon", "philosophy", "photograph", "photographer", "physical", "physically", "physician", "planning", "platform", "pleasure", "political", "politically", "politician", "politics", "pollution", "population", "portrait", "position", "positive", "possibility", "possible", "possibly", "potential", "potentially", "powerful", "practical", "practice", "precisely", "preference", "pregnancy", "pregnant", "preparation", "prescription", "presence", "presentation", "preserve", "president", "presidential", "pressure", "previous", "previously", "primarily", "principal", "principle", "priority", "prisoner", "probably", "procedure", "producer", "production", "profession", "professional", "professor", "progress", "prominent", "properly", "property", "proportion", "proposal", "proposed", "prosecutor", "prospect", "protection", "provider", "province", "provision", "psychological", "psychologist", "psychology", "publication", "publicly", "publisher", "punishment", "purchase", "quarterback", "question", "reaction", "reasonable", "recently", "recognition", "recognize", "recommend", "recommendation", "recording", "recovery", "reduction", "reference", "reflection", "regarding", "regardless", "regional", "register", "regularly", "regulate", "regulation", "reinforce", "relation", "relationship", "relative", "relatively", "relevant", "religion", "religious", "remaining", "remarkable", "remember", "repeatedly", "reporter", "represent", "representation", "representative", "Republican", "reputation", "requirement", "research", "researcher", "resemble", "reservation", "resident", "resistance", "resolution", "resource", "respondent", "response", "responsibility", "responsible", "restaurant", "restriction", "retirement", "revolution", "romantic", "sanction", "satellite", "satisfaction", "scenario", "schedule", "scholarship", "scientific", "scientist", "secretary", "security", "selection", "sensitive", "sentence", "separate", "sequence", "seriously", "settlement", "shooting", "shopping", "shoulder", "significance", "significant", "significantly", "similarly", "situation", "slightly", "so-called", "software", "solution", "somebody", "something", "sometimes", "somewhat", "somewhere", "sophisticated", "southern", "specialist", "specific", "specifically", "spending", "spiritual", "spokesman", "stability", "standard", "standing", "statement", "statistics", "straight", "stranger", "strategic", "strategy", "strength", "strengthen", "strongly", "structure", "struggle", "subsequent", "substance", "substantial", "successful", "successfully", "suddenly", "sufficient", "suggestion", "supporter", "supposed", "surprise", "surprised", "surprising", "surprisingly", "surround", "survival", "survivor", "tablespoon", "taxpayer", "teaching", "teaspoon", "technical", "technique", "technology", "teenager", "telephone", "telescope", "television", "temperature", "temporary", "tendency", "terrible", "territory", "terrorism", "terrorist", "testimony", "themselves", "therefore", "thinking", "thousand", "threaten", "throughout", "together", "tomorrow", "tournament", "tradition", "traditional", "training", "transfer", "transform", "transformation", "transition", "translate", "transportation", "treatment", "tremendous", "typically", "ultimate", "ultimately", "understand", "understanding", "unfortunately", "universal", "universe", "university", "unlikely", "vacation", "valuable", "variable", "variation", "vegetable", "violation", "violence", "virtually", "volunteer", "vulnerable", "whatever", "whenever", "widespread", "withdraw", "wonderful", "workshop", "yesterday", "yourself"
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
          .limit(5)
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
