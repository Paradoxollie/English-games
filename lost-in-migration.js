let level = 1;
let score = 0;
let timerInterval;
let difficultyMultiplier = 1;
let pointsPerLevel = 1;
let words = [];
let usedWords = new Set();
let currentTheme = "";
let initialTime = 30;
let isTransitioning = false; // Nouvelle variable pour empêcher les clics multiples
const wordList = document.getElementById('word-list');
const messageElement = document.getElementById('message');
const explanationElement = document.getElementById('explanation');

function resetGame() {
    clearInterval(timerInterval);
    wordList.innerHTML = '';
    messageElement.innerText = '';
    explanationElement.innerText = '';
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('current-theme').innerText = '';
    level = 1;
    score = 0; // Réinitialisation du score à 0
    usedWords.clear();
    updateScore();
}

function startGame() {
    resetGame();
    setDifficulty();
    loadLevel();
    startTimer(initialTime);
}

function setDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    if (difficulty === 'easy') {
        difficultyMultiplier = 0.3;
        pointsPerLevel = 1;
        initialTime = 30; // Plus de temps en mode facile
    } else if (difficulty === 'medium') {
        difficultyMultiplier = 0.5;
        pointsPerLevel = 2;
        initialTime = 20; // Temps moyen en mode normal
    } else if (difficulty === 'hard') {
        difficultyMultiplier = 0.75;
        pointsPerLevel = 3;
        initialTime = 10; // Moins de temps en mode difficile
    }
}
function loadLevel() {
    wordList.innerHTML = '';
    words = generateWordsByTheme(level);

    if (!words || words.length === 0) {
        endGame(true);
        return;
    }

    document.getElementById('current-theme').innerText = `Thème actuel : ${currentTheme}`;
    isTransitioning = false; // Réinitialiser l'état de transition au début de chaque niveau

    words.forEach((wordObject) => {
        const wordElement = document.createElement('span');
        wordElement.innerText = wordObject.word;
        wordElement.classList.add('word');
        wordElement.style.position = 'absolute';

        wordList.appendChild(wordElement);
        positionWord(wordElement);

        moveElementRebounding(wordElement);
        wordElement.addEventListener('click', () => handleWordClick(wordObject, wordElement));
    });
}

function handleWordClick(wordObject, wordElement) {
    if (isTransitioning) return; // Ignorer les clics pendant la transition
    isTransitioning = true; // Commencer la transition

    if (wordObject.isIntruder) {
        score += pointsPerLevel;
        updateScore();
        showExplanation(true, wordObject.word, wordObject.explanation);
        wordElement.style.backgroundColor = 'green'; // Feedback visuel
        setTimeout(() => {
            nextLevel();
            startTimer(initialTime);
        }, 1500); // Réduire le délai à 1.5 secondes
    } else {
        showExplanation(false, wordObject.word, wordObject.explanation);
        wordElement.style.backgroundColor = 'red'; // Feedback visuel
        setTimeout(() => endGame(false), 1500); // Réduire le délai à 1.5 secondes
    }
}

function showExplanation(isCorrect, word, explanation) {
    const status = isCorrect ? "Correct" : "Incorrect";
    explanationElement.innerHTML = `
        <strong>${status} !</strong><br>
        Mot : ${word}<br>
        Explication : ${explanation}
    `;
}

function nextLevel() {
    level++;
    loadLevel();
    startTimer(initialTime);
}

function endGame(success) {
    clearInterval(timerInterval);
    wordList.innerHTML = '';
    const message = success 
        ? `Félicitations ! Vous avez terminé le jeu avec un score de ${score} !` 
        : `Game Over! Votre score final : ${score}`;
    messageElement.innerText = message;
    document.getElementById('start-button').style.display = 'inline-block';
    document.getElementById('start-button').innerText = 'Rejouer';
    isTransitioning = false; // Réinitialiser l'état de transition
}
function generateWordsByTheme(level) {
    const themes = [
        {
            theme: "Orthographe",
            correctWords: [
                { word: "accommodate", explanation: "Mot correctement orthographié : deux 'c' et deux 'm'." },
                { word: "acknowledgment", explanation: "Mot correctement orthographié sans 'e' après le 'g'." },
                { word: "address", explanation: "Mot correctement orthographié avec deux 'd' et deux 's'." },
                { word: "advice", explanation: "'Advice' est le nom, 'advise' est le verbe." },
                { word: "apparently", explanation: "Mot correctement orthographié avec deux 'p'." },
                { word: "argument", explanation: "Mot correctement orthographié sans 'e' après le 'u'." },
                { word: "believe", explanation: "Mot correctement orthographié : 'i' avant 'e' sauf après 'c'." },
                { word: "beginning", explanation: "Mot correctement orthographié avec deux 'n'." },
                { word: "business", explanation: "Mot correctement orthographié avec 'i' après le 's'." },
                { word: "calendar", explanation: "Mot correctement orthographié se terminant par 'ar'." },
                { word: "collectible", explanation: "Mot correctement orthographié avec 'ible' à la fin." },
                { word: "committed", explanation: "Mot correctement orthographié avec deux 'm' et deux 't'." },
                { word: "conscientious", explanation: "Mot correctement orthographié avec 'sc'." },
                { word: "definite", explanation: "Mot correctement orthographié avec 'ite' à la fin." },
                { word: "discipline", explanation: "Mot correctement orthographié avec 'sc'." },
                { word: "embarrass", explanation: "Mot correctement orthographié avec deux 'r' et deux 's'." },
                { word: "exceed", explanation: "Mot correctement orthographié avec deux 'e'." },
                { word: "existence", explanation: "Mot correctement orthographié avec 'ence' à la fin." },
                { word: "experience", explanation: "Mot correctement orthographié avec 'ence' à la fin." },
                { word: "familiar", explanation: "Mot correctement orthographié avec 'iar' à la fin." },
                { word: "foreign", explanation: "Mot correctement orthographié avec 'ei'." },
                { word: "grateful", explanation: "Mot correctement orthographié, pas de 'e' après le 't'." },
                { word: "harass", explanation: "Mot correctement orthographié avec un seul 'r' et deux 's'." },
                { word: "height", explanation: "Mot correctement orthographié avec 'e' avant 'i'." },
                { word: "immediately", explanation: "Mot correctement orthographié avec deux 'm'." },
                { word: "independent", explanation: "Mot correctement orthographié avec 'ent' à la fin." },
                { word: "interrupt", explanation: "Mot correctement orthographié avec deux 'r'." },
                { word: "jewelry", explanation: "Mot correctement orthographié sans 'l' supplémentaire." },
                { word: "knowledge", explanation: "Mot correctement orthographié avec 'dge' à la fin." },
                { word: "library", explanation: "Mot correctement orthographié avec deux 'r'." },
                { word: "maintenance", explanation: "Mot correctement orthographié avec 'ten' au milieu." },
                { word: "misspell", explanation: "Mot correctement orthographié avec deux 's' et deux 'l'." },
                { word: "necessary", explanation: "Mot correctement orthographié avec un 'c' et deux 's'." },
                { word: "noticeable", explanation: "Mot correctement orthographié avec 'e' avant 'able'." },
                { word: "occasionally", explanation: "Mot correctement orthographié avec deux 'c' et deux 'l'." },
                { word: "occurrence", explanation: "Mot correctement orthographié avec deux 'c' et deux 'r'." },
                { word: "pastime", explanation: "Mot correctement orthographié sans double 's'." },
                { word: "persistent", explanation: "Mot correctement orthographié avec 'ent' à la fin." },
                { word: "pharaoh", explanation: "Mot correctement orthographié avec 'ph' au début." },
                { word: "piece", explanation: "Mot correctement orthographié : 'i' avant 'e'." },
                { word: "playwright", explanation: "Mot correctement orthographié avec 'wright'." },
                { word: "possession", explanation: "Mot correctement orthographié avec deux 's'." },
                { word: "potato", explanation: "Mot correctement orthographié sans 'e' à la fin au singulier." },
                { word: "privilege", explanation: "Mot correctement orthographié avec 'lege' à la fin." },
                { word: "pronunciation", explanation: "Mot correctement orthographié sans 'o' après 'n'." },
                { word: "questionnaire", explanation: "Mot correctement orthographié avec deux 'n'." },
                { word: "receive", explanation: "Mot correctement orthographié : 'e' avant 'i' après 'c'." },
                { word: "recommend", explanation: "Mot correctement orthographié avec deux 'm'." },
                { word: "repetition", explanation: "Mot correctement orthographié avec 'e' après 'p'." },
                { word: "rhyme", explanation: "Mot correctement orthographié avec 'h'." },
                { word: "rhythm", explanation: "Mot correctement orthographié avec 'h' et sans voyelles entre 'th' et 'm'." },
                { word: "schedule", explanation: "Mot correctement orthographié avec 'ch'." },
                { word: "separate", explanation: "Mot correctement orthographié avec 'a' au milieu." },
                { word: "successful", explanation: "Mot correctement orthographié avec deux 'c' et deux 's'." },
                { word: "supersede", explanation: "Mot correctement orthographié avec 'sede' à la fin." },
                { word: "tomorrow", explanation: "Mot correctement orthographié avec deux 'r'." },
                { word: "unforeseen", explanation: "Mot correctement orthographié avec deux 'e' à la fin." },
                { word: "unnecessary", explanation: "Mot correctement orthographié avec deux 'n' et un 'c'." },
                { word: "weird", explanation: "Mot correctement orthographié : exception à la règle 'i before e'." },
                { word: "acceptable", explanation: "Mot correctement orthographié avec 'able' à la fin." },
                { word: "acquire", explanation: "Mot correctement orthographié avec 'cqu'." },
                { word: "amateur", explanation: "Mot correctement orthographié avec 'eur' à la fin." },
                { word: "apparent", explanation: "Mot correctement orthographié avec deux 'p'." },
                { word: "argument", explanation: "Mot correctement orthographié sans 'e' après le 'u'." },
                { word: "atheist", explanation: "Mot correctement orthographié avec 'e' après 'h'." },
                { word: "balance", explanation: "Mot correctement orthographié avec 'an' au milieu." },
                { word: "beginning", explanation: "Mot correctement orthographié avec deux 'n'." },
                { word: "bizarre", explanation: "Mot correctement orthographié avec deux 'z' et deux 'r'." },
                { word: "bureaucracy", explanation: "Mot correctement orthographié avec 'eau' au milieu." },
                { word: "category", explanation: "Mot correctement orthographié avec 'e' après 't'." },
                { word: "cemetery", explanation: "Mot correctement orthographié avec trois 'e'." },
                { word: "committee", explanation: "Mot correctement orthographié avec deux 'm' et deux 't'." },
                { word: "consensus", explanation: "Mot correctement orthographié sans 'c' après 's'." },
                { word: "convenience", explanation: "Mot correctement orthographié avec 'ience' à la fin." },
                { word: "curiosity", explanation: "Mot correctement orthographié avec 'ios' au milieu." },
                { word: "definite", explanation: "Mot correctement orthographié avec 'ite' à la fin." },
                { word: "desperate", explanation: "Mot correctement orthographié avec 'ate' à la fin." },
                { word: "dilemma", explanation: "Mot correctement orthographié avec deux 'm'." },
                { word: "disappear", explanation: "Mot correctement orthographié avec deux 'p'." },
                { word: "ecstasy", explanation: "Mot correctement orthographié avec 'sy' à la fin." },
                { word: "embarrass", explanation: "Mot correctement orthographié avec deux 'r' et deux 's'." },
                { word: "environment", explanation: "Mot correctement orthographié avec 'n' après 'o'." },
                { word: "exaggerate", explanation: "Mot correctement orthographié avec deux 'g'." },
                { word: "existence", explanation: "Mot correctement orthographié avec 'ence' à la fin." },
                { word: "fiery", explanation: "Mot correctement orthographié avec 'ie' inversé." },
                { word: "friend", explanation: "Mot correctement orthographié avec 'i' avant 'e'." },
                { word: "guidance", explanation: "Mot correctement orthographié avec 'an' au milieu." },
                { word: "hierarchy", explanation: "Mot correctement orthographié avec 'ie' au début." },
                { word: "humorous", explanation: "Mot correctement orthographié avec 'or' au milieu." },
                { word: "innocent", explanation: "Mot correctement orthographié avec 'nn'." },
                { word: "intelligence", explanation: "Mot correctement orthographié avec 'ence' à la fin." },
                { word: "its", explanation: "Possessif sans apostrophe." },
                { word: "it's", explanation: "Contraction de 'it is' avec apostrophe." },
                { word: "knowledge", explanation: "Mot correctement orthographié avec 'dge' à la fin." },
                { word: "leisure", explanation: "Mot correctement orthographié avec 'eis'." },
                { word: "license", explanation: "Mot correctement orthographié avec 'c' avant 'e'." },
                { word: "maintenance", explanation: "Mot correctement orthographié avec 'ten' au milieu." },
                { word: "maneuver", explanation: "Mot correctement orthographié avec 'eu'." },
                { word: "medieval", explanation: "Mot correctement orthographié avec 'ie' au milieu." },
                { word: "mischievous", explanation: "Mot correctement orthographié avec 'ie' inversé." },
                { word: "neighbor", explanation: "Mot correctement orthographié avec 'eigh'." },
                { word: "noticeable", explanation: "Mot correctement orthographié avec 'e' avant 'able'." },
                { word: "occasion", explanation: "Mot correctement orthographié avec deux 'c'." },
                { word: "occasionally", explanation: "Mot correctement orthographié avec deux 'c' et deux 'l'." },
                { word: "occurrence", explanation: "Mot correctement orthographié avec deux 'c' et deux 'r'." },
                { word: "parliament", explanation: "Mot correctement orthographié avec 'ia' au milieu." },
                { word: "perseverance", explanation: "Mot correctement orthographié avec 'ver' au milieu." },
                { word: "privilege", explanation: "Mot correctement orthographié avec 'lege' à la fin." },
                { word: "publicly", explanation: "Mot correctement orthographié sans 'e' après 'c'." },
                { word: "receipt", explanation: "Mot correctement orthographié avec 'p' muet." },
                { word: "recommend", explanation: "Mot correctement orthographié avec deux 'm'." },
                { word: "relevant", explanation: "Mot correctement orthographié avec 'ant' à la fin." },
                { word: "restaurant", explanation: "Mot correctement orthographié avec 'au' au milieu." },
                { word: "schedule", explanation: "Mot correctement orthographié avec 'ch'." },
                { word: "separate", explanation: "Mot correctement orthographié avec 'a' au milieu." },
                { word: "sergeant", explanation: "Mot correctement orthographié avec 'gea' au milieu." },
                { word: "threshold", explanation: "Mot correctement orthographié avec 'sh' au milieu." },
                { word: "twelfth", explanation: "Mot correctement orthographié avec 'fth' à la fin." },
                { word: "tyranny", explanation: "Mot correctement orthographié avec deux 'n'." },
                { word: "until", explanation: "Mot correctement orthographié avec un seul 'l'." },
                { word: "vacuum", explanation: "Mot correctement orthographié avec deux 'u'." },
            ],
            intruderWords: [
                { word: "definately", explanation: "Orthographe incorrecte. La forme correcte est 'definitely'." },
                { word: "recieve", explanation: "Orthographe incorrecte. La forme correcte est 'receive' ('e' avant 'i' après 'c')." },
                { word: "seperate", explanation: "Orthographe incorrecte. La forme correcte est 'separate'." },
                { word: "accomodate", explanation: "Orthographe incorrecte. La forme correcte est 'accommodate' (deux 'c' et deux 'm')." },
                { word: "conscientous", explanation: "Orthographe incorrecte. La forme correcte est 'conscientious'." },
                { word: "occured", explanation: "Orthographe incorrecte. La forme correcte est 'occurred' (deux 'r')." },
                { word: "untill", explanation: "Orthographe incorrecte. La forme correcte est 'until' (un seul 'l')." },
                { word: "wich", explanation: "Orthographe incorrecte. La forme correcte est 'which'." },
                { word: "begining", explanation: "Orthographe incorrecte. La forme correcte est 'beginning' (deux 'n')." },
                { word: "beleive", explanation: "Orthographe incorrecte. La forme correcte est 'believe' ('i' avant 'e')." },
                { word: "goverment", explanation: "Orthographe incorrecte. La forme correcte est 'government'." },
                { word: "thier", explanation: "Orthographe incorrecte. La forme correcte est 'their'." },
                { word: "freind", explanation: "Orthographe incorrecte. La forme correcte est 'friend'." },
                { word: "harrass", explanation: "Orthographe incorrecte. La forme correcte est 'harass' (un seul 'r')." },
                { word: "adress", explanation: "Orthographe incorrecte. La forme correcte est 'address' (deux 'd')." },
                { word: "writting", explanation: "Orthographe incorrecte. La forme correcte est 'writing' (un seul 't')." },
                { word: "publically", explanation: "Orthographe incorrecte. La forme correcte est 'publicly'." },
                { word: "succesful", explanation: "Orthographe incorrecte. La forme correcte est 'successful' (deux 's')." },
                { word: "commited", explanation: "Orthographe incorrecte. La forme correcte est 'committed' (deux 't')." },
                { word: "occurence", explanation: "Orthographe incorrecte. La forme correcte est 'occurrence' (deux 'r')." },
                { word: "tommorow", explanation: "Orthographe incorrecte. La forme correcte est 'tomorrow'." },
                { word: "embarass", explanation: "Orthographe incorrecte. La forme correcte est 'embarrass' (deux 'r' et deux 's')." },
                { word: "calender", explanation: "Orthographe incorrecte. La forme correcte est 'calendar'." },
                { word: "alot", explanation: "Orthographe incorrecte. La forme correcte est 'a lot' (deux mots séparés)." },
                { word: "existance", explanation: "Orthographe incorrecte. La forme correcte est 'existence' ('ence' à la fin)." },
                { word: "definate", explanation: "Orthographe incorrecte. La forme correcte est 'definite'." },
                { word: "bizzare", explanation: "Orthographe incorrecte. La forme correcte est 'bizarre'." },
                { word: "relize", explanation: "Orthographe incorrecte. La forme correcte est 'realize'." },
                { word: "nieghbor", explanation: "Orthographe incorrecte. La forme correcte est 'neighbor'." },
                { word: "enviroment", explanation: "Orthographe incorrecte. La forme correcte est 'environment'." },
                { word: "feiry", explanation: "Orthographe incorrecte. La forme correcte est 'fiery'." },
                { word: "gaurd", explanation: "Orthographe incorrecte. La forme correcte est 'guard'." },
                { word: "arguement", explanation: "Orthographe incorrecte. La forme correcte est 'argument'." },
                { word: "guidence", explanation: "Orthographe incorrecte. La forme correcte est 'guidance'." },
                { word: "hieght", explanation: "Orthographe incorrecte. La forme correcte est 'height'." },
                { word: "knowlege", explanation: "Orthographe incorrecte. La forme correcte est 'knowledge'." },
                { word: "lightening", explanation: "Orthographe incorrecte pour 'lightning' (éclair)." },
                { word: "miniture", explanation: "Orthographe incorrecte. La forme correcte est 'miniature'." },
                { word: "neccessary", explanation: "Orthographe incorrecte. La forme correcte est 'necessary'." },
                { word: "perseverence", explanation: "Orthographe incorrecte. La forme correcte est 'perseverance'." },
                { word: "privelege", explanation: "Orthographe incorrecte. La forme correcte est 'privilege'." },
                { word: "restaraunt", explanation: "Orthographe incorrecte. La forme correcte est 'restaurant'." },
                { word: "speach", explanation: "Orthographe incorrecte. La forme correcte est 'speech'." },
                { word: "twelth", explanation: "Orthographe incorrecte. La forme correcte est 'twelfth'." },
                { word: "wierd", explanation: "Orthographe incorrecte. La forme correcte est 'weird'." },
                { word: "acquaintence", explanation: "Orthographe incorrecte. La forme correcte est 'acquaintance'." },
                { word: "foriegn", explanation: "Orthographe incorrecte. La forme correcte est 'foreign'." },
                { word: "grammer", explanation: "Orthographe incorrecte. La forme correcte est 'grammar'." },
                { word: "concious", explanation: "Orthographe incorrecte. La forme correcte est 'conscious'." },
            ],
        },        
        {
            theme: "faux amis",
            correctWords: [
                { word: "actually", explanation: "Signifie 'en fait', pas 'actuellement' (currently)." },
                { word: "advertisement", explanation: "Signifie 'publicité', pas 'avertissement' (warning)." },
                { word: "agenda", explanation: "Signifie 'ordre du jour', pas 'agenda' (diary ou planner)." },
                { word: "attend", explanation: "Signifie 'assister à', pas 'attendre' (wait)." },
                { word: "bachelor", explanation: "Signifie 'célibataire', pas 'bachelier' (graduate)." },
                { word: "bless", explanation: "Signifie 'bénir', pas 'blesser' (injure ou hurt)." },
                { word: "cave", explanation: "Signifie 'grotte', pas 'cave' (cellar ou basement)." },
                { word: "chance", explanation: "Signifie 'hasard' ou 'opportunité', pas 'chance' (luck)." },
                { word: "college", explanation: "Signifie 'université', pas 'collège' (middle school)." },
                { word: "comprehensive", explanation: "Signifie 'complet' ou 'exhaustif', pas 'compréhensif' (understanding)." },
                { word: "conductor", explanation: "Signifie 'chef d'orchestre' ou 'contrôleur', pas 'conducteur' (driver)." },
                { word: "deception", explanation: "Signifie 'tromperie', pas 'déception' (disappointment)." },
                { word: "delay", explanation: "Signifie 'retard', pas 'délai' (deadline ou time limit)." },
                { word: "demand", explanation: "Signifie 'exiger', pas 'demander' (ask for)." },
                { word: "engaged", explanation: "Signifie 'fiancé' ou 'occupé' (ligne téléphonique), pas 'engagé' (committed)." },
                { word: "eventually", explanation: "Signifie 'finalement', pas 'éventuellement' (possibly)." },
                { word: "fabric", explanation: "Signifie 'tissu', pas 'fabrique' (factory)." },
                { word: "fortune", explanation: "Signifie 'richesse' ou 'chance', pas 'fortune' (en français, sens plus restreint)." },
                { word: "gentle", explanation: "Signifie 'doux' ou 'délicat', pas 'gentil' (kind)." },
                { word: "hazard", explanation: "Signifie 'danger' ou 'risque', pas 'hasard' (chance)." },
                { word: "injury", explanation: "Signifie 'blessure', pas 'injure' (insult)." },
                { word: "lecture", explanation: "Signifie 'cours magistral' ou 'conférence', pas 'lecture' (reading)." },
                { word: "library", explanation: "Signifie 'bibliothèque', pas 'librairie' (bookstore)." },
                { word: "location", explanation: "Signifie 'emplacement', pas 'location' (rental)." },
                { word: "medicine", explanation: "Signifie 'médicament', pas 'médecine' (medical studies)." },
                { word: "parent", explanation: "Signifie 'père ou mère', pas 'parent' (relative)." },
                { word: "phrase", explanation: "Signifie 'expression' ou 'groupe de mots', pas 'phrase' (sentence)." },
                { word: "photograph", explanation: "Signifie 'photographie', pas 'photographe' (photographer)." },
                { word: "preservative", explanation: "Signifie 'conservateur' (additif alimentaire), pas 'préservatif' (condom)." },
                { word: "sensible", explanation: "Signifie 'raisonnable' ou 'sensé', pas 'sensible' (sensitive)." },
                { word: "sympathetic", explanation: "Signifie 'compatissant', pas 'sympathique' (nice ou friendly)." },
                { word: "terrific", explanation: "Signifie 'formidable' ou 'génial', pas 'terrifiant' (terrifying)." },
                { word: "vacation", explanation: "Signifie 'vacances', pas 'vacation' (session ou fee en contexte juridique)." },
                { word: "billion", explanation: "Signifie 'milliard', pas 'billion' (en français, 'billion' = mille milliards)." },
                { word: "suit", explanation: "Signifie 'costume', pas 'suite' (sequence ou hotel suite)." },
                { word: "habit", explanation: "Signifie 'habitude', pas 'habit' (clothes)." },
                { word: "carpet", explanation: "Signifie 'tapis', pas 'carpette' (small rug)." },
                { word: "chair", explanation: "Signifie 'chaise', pas 'chair' (flesh)." },
                { word: "coin", explanation: "Signifie 'pièce de monnaie', pas 'coin' (corner)." },
                { word: "command", explanation: "Signifie 'ordonner', pas 'commander' (order food)." },
                { word: "deputy", explanation: "Signifie 'adjoint' ou 'représentant', pas 'député' (Member of Parliament)." },
                { word: "editor", explanation: "Signifie 'rédacteur en chef', pas 'éditeur' (publisher)." },
                { word: "evidence", explanation: "Signifie 'preuve', pas 'évidence' (obviousness)." },
                { word: "fabricate", explanation: "Signifie 'fabriquer' ou 'inventer', pas 'fabriquer' uniquement au sens matériel." },
                { word: "fastidious", explanation: "Signifie 'méticuleux' ou 'difficile à satisfaire', pas 'fastidieux' (tedious)." },
                { word: "grape", explanation: "Signifie 'raisin', pas 'grappe' (bunch)." },
                { word: "inhabit", explanation: "Signifie 'habiter', pas 'inhabit' (n'existe pas en anglais)." },
                { word: "journey", explanation: "Signifie 'voyage', pas 'journée' (day)." },
                { word: "lecture", explanation: "Signifie 'conférence', pas 'lecture' (reading)." },
                { word: "library", explanation: "Rappel : signifie 'bibliothèque', pas 'librairie'." },
                { word: "location", explanation: "Signifie 'emplacement', pas 'location' (rental)." },
                { word: "magazine", explanation: "Signifie 'revue', pas 'magasin' (shop ou store)." },
                { word: "manifestation", explanation: "Signifie 'expression' ou 'démonstration', pas 'manifestation' (demonstration)." },
                { word: "novel", explanation: "Signifie 'roman', pas 'nouvelle' (short story)." },
                { word: "office", explanation: "Signifie 'bureau', pas 'office' religieux." },
                { word: "parent", explanation: "Rappel : signifie 'père ou mère', pas 'parent' au sens large." },
                { word: "photographer", explanation: "Signifie 'photographe', pas 'photographie' (photograph)." },
                { word: "physician", explanation: "Signifie 'médecin', pas 'physicien' (physicist)." },
                { word: "pneumonia", explanation: "Signifie 'pneumonie', attention à la prononciation." },
                { word: "proper", explanation: "Signifie 'correct' ou 'approprié', pas 'propre' (clean)." },
                { word: "resign", explanation: "Signifie 'démissionner', pas 'resigner' (to sign again)." },
                { word: "sensible", explanation: "Rappel : signifie 'raisonnable', pas 'sensible'." },
                { word: "support", explanation: "Signifie 'soutenir', pas 'supporter' (tolerate)." },
                { word: "vacancy", explanation: "Signifie 'poste vacant', pas 'vacance'." },
                { word: "wagon", explanation: "Signifie 'chariot', pas 'wagon' ferroviaire (carriage ou coach)." },
                { word: "abuse", explanation: "Signifie 'maltraitance' ou 'insulte', pas 'abus' (overuse)." },
                { word: "achieve", explanation: "Signifie 'accomplir', pas 'achever' (to finish off)." },
                { word: "affluent", explanation: "Signifie 'riche', pas 'affluent' (tributary)." },
                { word: "attorney", explanation: "Signifie 'avocat', pas 'notaire' (notary)." },
                { word: "billion", explanation: "Rappel : en anglais, 'billion' = 'milliard'." },
                { word: "blouse", explanation: "Signifie 'chemisier', pas 'blouse' (smock)." },
                { word: "bride", explanation: "Signifie 'mariée', pas 'bride' (bridle)." },
                { word: "candor", explanation: "Signifie 'franchise', pas 'candide' (naive)." },
                { word: "carpet", explanation: "Rappel : signifie 'tapis', pas 'carpette'." },
                { word: "chance", explanation: "Rappel : signifie 'hasard', pas 'chance'." },
                { word: "choke", explanation: "Signifie 's'étouffer', pas 'choquer' (shock)." },
                { word: "coin", explanation: "Rappel : signifie 'pièce de monnaie', pas 'coin'." },
                { word: "commander", explanation: "Signifie 'officier', pas 'commander' (order)." },
                { word: "comprehensive", explanation: "Rappel : signifie 'complet', pas 'compréhensif'." },
                { word: "deception", explanation: "Rappel : signifie 'tromperie', pas 'déception'." },
                { word: "definite", explanation: "Signifie 'défini' ou 'certain', pas 'définitif' (final)." },
                { word: "delusion", explanation: "Signifie 'illusion', pas 'désillusion' (disillusion)." },
                { word: "disposable", explanation: "Signifie 'jetable', pas 'disponible' (available)." },
                { word: "engaged", explanation: "Rappel : signifie 'fiancé' ou 'occupé'." },
                { word: "eventually", explanation: "Rappel : signifie 'finalement', pas 'éventuellement'." },
                { word: "evidence", explanation: "Rappel : signifie 'preuves', pas 'évidence'." },
                { word: "fabric", explanation: "Rappel : signifie 'tissu', pas 'fabrique'." },
                { word: "facility", explanation: "Signifie 'installations', pas 'facilité' (ease)." },
                { word: "injure", explanation: "Signifie 'blesser', pas 'injurier' (to insult)." },
                { word: "journey", explanation: "Rappel : signifie 'voyage', pas 'journée'." },
                { word: "lecture", explanation: "Rappel : signifie 'conférence', pas 'lecture'." },
                { word: "library", explanation: "Rappel : signifie 'bibliothèque', pas 'librairie'." },
                { word: "luxury", explanation: "Signifie 'luxe', pas 'luxure' (lust)." },
                { word: "manifestation", explanation: "Rappel : signifie 'expression', pas 'manifestation'." },
                { word: "medicine", explanation: "Rappel : signifie 'médicament', pas 'médecine'." },
                { word: "novel", explanation: "Rappel : signifie 'roman', pas 'nouvelle'." },
                { word: "office", explanation: "Rappel : signifie 'bureau', pas 'office' religieux." },
                { word: "parent", explanation: "Rappel : signifie 'père ou mère', pas 'parent' (relative)." },
                { word: "photograph", explanation: "Rappel : signifie 'photographie', pas 'photographe'." },
                { word: "physician", explanation: "Rappel : signifie 'médecin', pas 'physicien'." },
                { word: "policy", explanation: "Signifie 'politique' (règle), pas 'police' (police force)." },
                { word: "precise", explanation: "Signifie 'précis', pas 'préciser' (to specify)." },
                { word: "prescribe", explanation: "Signifie 'prescrire', pas 'proscrire' (proscribe)." },
                { word: "pretend", explanation: "Signifie 'faire semblant', pas 'prétendre' (claim)." },
                { word: "prohibit", explanation: "Signifie 'interdire', pas 'prohiber' (rare en français)." },
                { word: "proper", explanation: "Rappel : signifie 'approprié', pas 'propre'." },
                { word: "réaliser", explanation: "En anglais 'realize' signifie 'se rendre compte', pas 'réaliser' au sens de 'faire'." },
                { word: "resign", explanation: "Rappel : signifie 'démissionner', pas 'resigner'." },
                { word: "resume", explanation: "Rappel : signifie 'reprendre', pas 'résumer'." },
                { word: "store", explanation: "Rappel : signifie 'magasin', pas 'store' (blind)." },
                { word: "support", explanation: "Rappel : signifie 'soutenir', pas 'supporter' (tolerate)." },
                { word: "sympathetic", explanation: "Rappel : signifie 'compatissant', pas 'sympathique'." },
                { word: "vacancy", explanation: "Rappel : signifie 'poste vacant', pas 'vacance'." },
                { word: "wagon", explanation: "Rappel : signifie 'chariot', pas 'wagon' ferroviaire." },
                { word: "witness", explanation: "Signifie 'témoin', pas 'vitre' (window pane)." },
                // Ajoutez plus de mots si nécessaire...
            ],
            intruderWords: [
                { word: "computer", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "banana", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "mountain", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "pencil", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "music", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "river", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "garden", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "window", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "bottle", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
                { word: "ocean", explanation: "Mot anglais courant, pas un faux ami pour les francophones." },
            ],
        }, 
        {
            theme: "mammifères terrestres",
            correctWords: [
                { word: "lion", explanation: "Mammifère carnivore de la famille des félidés." },
                { word: "tiger", explanation: "Grand félidé rayé d'Asie." },
                { word: "elephant", explanation: "Grand mammifère herbivore avec une trompe." },
                { word: "horse", explanation: "Mammifère domestique utilisé pour le transport." },
                { word: "dog", explanation: "Mammifère domestique, compagnon fidèle de l'homme." },
                { word: "cat", explanation: "Petit mammifère domestique apprécié pour sa compagnie." },
                { word: "whale", explanation: "Grand mammifère marin." },
                { word: "dolphin", explanation: "Mammifère marin intelligent connu pour ses sauts." },
                { word: "bat", explanation: "Seul mammifère capable de voler." },
                { word: "kangaroo", explanation: "Mammifère marsupial sauteur d'Australie." },
                { word: "koala", explanation: "Mammifère marsupial qui se nourrit de feuilles d'eucalyptus." },
                { word: "giraffe", explanation: "Mammifère au long cou, le plus grand animal terrestre." },
                { word: "rhinoceros", explanation: "Grand mammifère avec une ou deux cornes sur le nez." },
                { word: "hippopotamus", explanation: "Mammifère semi-aquatique d'Afrique." },
                { word: "bear", explanation: "Grand mammifère omnivore avec une fourrure épaisse." },
                { word: "wolf", explanation: "Mammifère carnivore, ancêtre du chien domestique." },
                { word: "fox", explanation: "Petit mammifère carnivore au pelage roux." },
                { word: "monkey", explanation: "Mammifère primate généralement arboricole." },
                { word: "chimpanzee", explanation: "Primate intelligent, proche parent de l'homme." },
                { word: "gorilla", explanation: "Plus grand primate vivant, originaire d'Afrique." },
                { word: "orangutan", explanation: "Primate arboricole d'Asie du Sud-Est." },
                { word: "lemur", explanation: "Primate endémique de Madagascar." },
                { word: "otter", explanation: "Mammifère semi-aquatique, excellent nageur." },
                { word: "beaver", explanation: "Mammifère constructeur de barrages en bois." },
                { word: "squirrel", explanation: "Petit mammifère arboricole avec une queue touffue." },
                { word: "rabbit", explanation: "Mammifère herbivore aux longues oreilles." },
                { word: "hare", explanation: "Semblable au lapin, mais plus grand et plus rapide." },
                { word: "deer", explanation: "Mammifère herbivore aux bois ramifiés." },
                { word: "moose", explanation: "Le plus grand des cervidés, appelé élan en Europe." },
                { word: "elk", explanation: "Nom nord-américain pour le wapiti." },
                { word: "buffalo", explanation: "Grand bovidé, également appelé bison en Amérique." },
                { word: "cow", explanation: "Femelle du bœuf, élevée pour le lait et la viande." },
                { word: "sheep", explanation: "Mammifère domestique élevé pour sa laine." },
                { word: "goat", explanation: "Mammifère domestique connu pour sa curiosité." },
                { word: "pig", explanation: "Mammifère omnivore domestique élevé pour sa viande." },
                { word: "camel", explanation: "Mammifère du désert avec une ou deux bosses." },
                { word: "llama", explanation: "Mammifère domestiqué des Andes, utilisé comme bête de somme." },
                { word: "alpaca", explanation: "Élevé pour sa laine fine dans les Andes." },
                { word: "leopard", explanation: "Félin tacheté d'Afrique et d'Asie." },
                { word: "cheetah", explanation: "Le plus rapide des animaux terrestres." },
                { word: "jaguar", explanation: "Grand félin d'Amérique du Sud." },
                { word: "hyena", explanation: "Mammifère carnivore connu pour son rire." },
                { word: "wombat", explanation: "Marsupial fouisseur d'Australie." },
                { word: "platypus", explanation: "Mammifère ovipare au bec de canard." },
                { word: "echidna", explanation: "Mammifère ovipare couvert de piquants." },
                { word: "porcupine", explanation: "Rongeur avec des piquants défensifs." },
                { word: "hedgehog", explanation: "Petit mammifère nocturne avec des épines." },
                { word: "mole", explanation: "Petit mammifère fouisseur vivant sous terre." },
                { word: "badger", explanation: "Mammifère omnivore avec des marques faciales." },
                { word: "weasel", explanation: "Petit carnivore au corps long et mince." },
                { word: "ferret", explanation: "Domestiqué pour la chasse aux rongeurs." },
                { word: "skunk", explanation: "Connu pour son odeur nauséabonde en cas de menace." },
                { word: "raccoon", explanation: "Mammifère omnivore avec des marques noires autour des yeux." },
                { word: "opossum", explanation: "Seul marsupial d'Amérique du Nord." },
                { word: "sloth", explanation: "Mammifère arboricole extrêmement lent." },
                { word: "anteater", explanation: "Se nourrit principalement de fourmis et de termites." },
                { word: "armadillo", explanation: "Mammifère à carapace dure." },
                { word: "pangolin", explanation: "Mammifère écailleux qui se nourrit de fourmis." },
                { word: "tapir", explanation: "Mammifère avec un nez préhensile." },
                { word: "manatee", explanation: "Mammifère marin herbivore." },
                { word: "walrus", explanation: "Mammifère marin avec de longues défenses." },
                { word: "seal", explanation: "Mammifère marin avec des nageoires." },
                { word: "mongoose", explanation: "Carnivore connu pour chasser les serpents." },
                { word: "meerkat", explanation: "Petit mammifère vivant en groupes dans le désert." },
                { word: "gibbon", explanation: "Primate arboricole sans queue." },
                { word: "donkey", explanation: "Mammifère domestique utilisé pour le transport." },
                { word: "zebra", explanation: "Équine africaine avec des rayures noires et blanches." },
                { word: "antelope", explanation: "Groupe d'herbivores aux cornes creuses." },
                { word: "gazelle", explanation: "Petite antilope gracieuse d'Afrique et d'Asie." },
                { word: "panda", explanation: "Mammifère chinois mangeur de bambou." },
                { word: "porpoise", explanation: "Petit cétacé ressemblant au dauphin." },
                { word: "mouse", explanation: "Petit rongeur à longue queue." },
                { word: "rat", explanation: "Rongeur plus grand qu'une souris." },
                { word: "beaver", explanation: "Rongeur constructeur de barrages." },
                { word: "narwhal", explanation: "Cétacé arctique avec une défense torsadée." },
                { word: "reindeer", explanation: "Cervidé des régions arctiques, domestiqué." },
                { word: "bull", explanation: "Mâle de l'espèce bovine." },
                { word: "yak", explanation: "Bovin des hautes montagnes d'Asie." },
                { word: "bison", explanation: "Grand bovidé d'Amérique du Nord." },
                { word: "chevrotain", explanation: "Petit ruminant aussi appelé cerf-souris." },
                { word: "pronghorn", explanation: "Antilope nord-américaine à cornes fourchues." },
                { word: "okapi", explanation: "Parent de la girafe avec des rayures sur les jambes." },
                { word: "kudu", explanation: "Antilope africaine aux cornes spiralées." },
                { word: "springbok", explanation: "Antilope connue pour ses sauts spectaculaires." },
                { word: "dugong", explanation: "Mammifère marin proche du lamantin." },
                { word: "ermine", explanation: "Mustélidé dont la fourrure devient blanche en hiver." },
                { word: "lynx", explanation: "Félin sauvage avec des pinceaux sur les oreilles." },
                { word: "mink", explanation: "Mustélidé à la fourrure prisée." },
                { word: "wolverine", explanation: "Grand mustélidé robuste et solitaire." },
                { word: "lemming", explanation: "Petit rongeur des régions arctiques." },
                { word: "vole", explanation: "Petit rongeur ressemblant à une souris." },
                { word: "hare", explanation: "Déjà mentionné, cousin du lapin." },
                { word: "marmot", explanation: "Grand rongeur vivant en montagne." },
                { word: "capybara", explanation: "Plus grand rongeur du monde, originaire d'Amérique du Sud." },
                { word: "wallaby", explanation: "Petit marsupial sauteur d'Australie." },
                { word: "possum", explanation: "Marsupial d'Australie, différent de l'opossum." },
                { word: "tasmanian devil", explanation: "Marsupial carnivore de Tasmanie." },
                { word: "quokka", explanation: "Petit marsupial australien souriant." },
                { word: "harp seal", explanation: "Phoque du Groenland au dos arqué." },
                { word: "sea lion", explanation: "Pinnipède avec de petites oreilles externes." },
                { word: "otter", explanation: "Déjà mentionné, mammifère semi-aquatique joueur." },
                { word: "mole", explanation: "Déjà mentionné, vit sous terre." },
                { word: "hedgehog", explanation: "Déjà mentionné, nocturne à épines." },
                { word: "platypus", explanation: "Déjà mentionné, unique mammifère venimeux ovipare." },
                { word: "echidna", explanation: "Déjà mentionné, aussi appelé fourmilier épineux." },
                { word: "aardvark", explanation: "Mammifère africain mangeur de termites." },
                { word: "squirrel monkey", explanation: "Petit singe d'Amérique du Sud." },
                { word: "lemur", explanation: "Déjà mentionné, vit à Madagascar." },
                { word: "macaque", explanation: "Primate asiatique parfois sacré." },
                { word: "proboscis monkey", explanation: "Singe asiatique au grand nez." },
                { word: "colobus", explanation: "Singe africain sans pouce opposable." },
                { word: "sloth bear", explanation: "Ours insectivore d'Inde." },
                { word: "sun bear", explanation: "Plus petit des ours, vit en Asie du Sud-Est." },
                { word: "polar bear", explanation: "Grand ours blanc de l'Arctique." },
                { word: "panda", explanation: "Déjà mentionné, grand panda noir et blanc." },
                { word: "red panda", explanation: "Petit mammifère arboricole d'Asie." },
                { word: "otter shrew", explanation: "Petit mammifère africain semi-aquatique." },
                { word: "water vole", explanation: "Rongeur vivant près des cours d'eau." },
                { word: "gazelle", explanation: "Déjà mentionné, antilope gracieuse." },
                { word: "impala", explanation: "Antilope africaine agile." },
                { word: "cheetah", explanation: "Déjà mentionné, le guépard rapide." },
                // Ajoutez plus de mammifères si nécessaire pour atteindre 100 mots.
            ],
            intruderWords: [
                { word: "crocodile", explanation: "Reptile, pas un mammifère." },
                { word: "turtle", explanation: "Reptile avec une carapace." },
                { word: "snake", explanation: "Reptile sans pattes." },
                { word: "frog", explanation: "Amphibien, pas un mammifère." },
                { word: "salamander", explanation: "Amphibien à peau humide." },
                { word: "shark", explanation: "Poisson cartilagineux." },
                { word: "octopus", explanation: "Mollusque céphalopode à huit bras." },
                { word: "squid", explanation: "Mollusque céphalopode à dix bras." },
                { word: "lobster", explanation: "Crustacé marin à pinces." },
                { word: "crab", explanation: "Crustacé à carapace dure." },
                { word: "jellyfish", explanation: "Cnidaire gélatineux." },
                { word: "starfish", explanation: "Échinoderme en forme d'étoile." },
                { word: "penguin", explanation: "Oiseau marin incapable de voler." },
                { word: "ostrich", explanation: "Grand oiseau coureur d'Afrique." },
                { word: "eagle", explanation: "Oiseau de proie majestueux." },
                { word: "parrot", explanation: "Oiseau coloré capable de parler." },
                { word: "swan", explanation: "Grand oiseau aquatique gracieux." },
                { word: "cuttlefish", explanation: "Mollusque céphalopode avec une coquille interne." },
                { word: "shrimp", explanation: "Petit crustacé marin." },
                { word: "coral", explanation: "Animal marin formant des récifs." },
            ],
        },
        {
            theme: "verbes irréguliers",
            correctWords: [
                { word: "be", explanation: "Verbe irrégulier : 'be' - 'was/were' - 'been'." },
                { word: "become", explanation: "Verbe irrégulier : 'become' - 'became' - 'become'." },
                { word: "begin", explanation: "Verbe irrégulier : 'begin' - 'began' - 'begun'." },
                { word: "bend", explanation: "Verbe irrégulier : 'bend' - 'bent' - 'bent'." },
                { word: "bet", explanation: "Verbe irrégulier identique aux trois formes : 'bet' - 'bet' - 'bet'." },
                { word: "bite", explanation: "Verbe irrégulier : 'bite' - 'bit' - 'bitten'." },
                { word: "bleed", explanation: "Verbe irrégulier : 'bleed' - 'bled' - 'bled'." },
                { word: "blow", explanation: "Verbe irrégulier : 'blow' - 'blew' - 'blown'." },
                { word: "break", explanation: "Verbe irrégulier : 'break' - 'broke' - 'broken'." },
                { word: "bring", explanation: "Verbe irrégulier : 'bring' - 'brought' - 'brought'." },
                { word: "build", explanation: "Verbe irrégulier : 'build' - 'built' - 'built'." },
                { word: "burn", explanation: "Verbe irrégulier : 'burn' - 'burnt/burned' - 'burnt/burned'." },
                { word: "buy", explanation: "Verbe irrégulier : 'buy' - 'bought' - 'bought'." },
                { word: "catch", explanation: "Verbe irrégulier : 'catch' - 'caught' - 'caught'." },
                { word: "choose", explanation: "Verbe irrégulier : 'choose' - 'chose' - 'chosen'." },
                { word: "come", explanation: "Verbe irrégulier : 'come' - 'came' - 'come'." },
                { word: "cost", explanation: "Verbe irrégulier identique aux trois formes : 'cost' - 'cost' - 'cost'." },
                { word: "cut", explanation: "Verbe irrégulier identique aux trois formes : 'cut' - 'cut' - 'cut'." },
                { word: "deal", explanation: "Verbe irrégulier : 'deal' - 'dealt' - 'dealt'." },
                { word: "dig", explanation: "Verbe irrégulier : 'dig' - 'dug' - 'dug'." },
                { word: "do", explanation: "Verbe irrégulier : 'do' - 'did' - 'done'." },
                { word: "draw", explanation: "Verbe irrégulier : 'draw' - 'drew' - 'drawn'." },
                { word: "dream", explanation: "Verbe irrégulier : 'dream' - 'dreamt/dreamed' - 'dreamt/dreamed'." },
                { word: "drink", explanation: "Verbe irrégulier : 'drink' - 'drank' - 'drunk'." },
                { word: "drive", explanation: "Verbe irrégulier : 'drive' - 'drove' - 'driven'." },
                { word: "eat", explanation: "Verbe irrégulier : 'eat' - 'ate' - 'eaten'." },
                { word: "fall", explanation: "Verbe irrégulier : 'fall' - 'fell' - 'fallen'." },
                { word: "feed", explanation: "Verbe irrégulier : 'feed' - 'fed' - 'fed'." },
                { word: "feel", explanation: "Verbe irrégulier : 'feel' - 'felt' - 'felt'." },
                { word: "fight", explanation: "Verbe irrégulier : 'fight' - 'fought' - 'fought'." },
                { word: "find", explanation: "Verbe irrégulier : 'find' - 'found' - 'found'." },
                { word: "fly", explanation: "Verbe irrégulier : 'fly' - 'flew' - 'flown'." },
                { word: "forget", explanation: "Verbe irrégulier : 'forget' - 'forgot' - 'forgotten'." },
                { word: "forgive", explanation: "Verbe irrégulier : 'forgive' - 'forgave' - 'forgiven'." },
                { word: "freeze", explanation: "Verbe irrégulier : 'freeze' - 'froze' - 'frozen'." },
                { word: "get", explanation: "Verbe irrégulier : 'get' - 'got' - 'got/gotten'." },
                { word: "give", explanation: "Verbe irrégulier : 'give' - 'gave' - 'given'." },
                { word: "go", explanation: "Verbe irrégulier : 'go' - 'went' - 'gone'." },
                { word: "grow", explanation: "Verbe irrégulier : 'grow' - 'grew' - 'grown'." },
                { word: "hang", explanation: "Verbe irrégulier : 'hang' - 'hung' - 'hung'." },
                { word: "have", explanation: "Verbe irrégulier : 'have' - 'had' - 'had'." },
                { word: "hear", explanation: "Verbe irrégulier : 'hear' - 'heard' - 'heard'." },
                { word: "hide", explanation: "Verbe irrégulier : 'hide' - 'hid' - 'hidden'." },
                { word: "hit", explanation: "Verbe irrégulier identique aux trois formes : 'hit' - 'hit' - 'hit'." },
                { word: "hold", explanation: "Verbe irrégulier : 'hold' - 'held' - 'held'." },
                { word: "hurt", explanation: "Verbe irrégulier identique aux trois formes : 'hurt' - 'hurt' - 'hurt'." },
                { word: "keep", explanation: "Verbe irrégulier : 'keep' - 'kept' - 'kept'." },
                { word: "know", explanation: "Verbe irrégulier : 'know' - 'knew' - 'known'." },
                { word: "lay", explanation: "Verbe irrégulier : 'lay' - 'laid' - 'laid'." },
                { word: "lead", explanation: "Verbe irrégulier : 'lead' - 'led' - 'led'." },
                { word: "leave", explanation: "Verbe irrégulier : 'leave' - 'left' - 'left'." },
                { word: "lend", explanation: "Verbe irrégulier : 'lend' - 'lent' - 'lent'." },
                { word: "let", explanation: "Verbe irrégulier identique aux trois formes : 'let' - 'let' - 'let'." },
                { word: "lie", explanation: "Verbe irrégulier : 'lie' (s'allonger) - 'lay' - 'lain'." },
                { word: "light", explanation: "Verbe irrégulier : 'light' - 'lit/lighted' - 'lit/lighted'." },
                { word: "lose", explanation: "Verbe irrégulier : 'lose' - 'lost' - 'lost'." },
                { word: "make", explanation: "Verbe irrégulier : 'make' - 'made' - 'made'." },
                { word: "mean", explanation: "Verbe irrégulier : 'mean' - 'meant' - 'meant'." },
                { word: "meet", explanation: "Verbe irrégulier : 'meet' - 'met' - 'met'." },
                { word: "pay", explanation: "Verbe irrégulier : 'pay' - 'paid' - 'paid'." },
                { word: "put", explanation: "Verbe irrégulier identique aux trois formes : 'put' - 'put' - 'put'." },
                { word: "read", explanation: "Verbe irrégulier : 'read' - 'read' (prononcé 'red') - 'read' (prononcé 'red')." },
                { word: "ride", explanation: "Verbe irrégulier : 'ride' - 'rode' - 'ridden'." },
                { word: "ring", explanation: "Verbe irrégulier : 'ring' - 'rang' - 'rung'." },
                { word: "rise", explanation: "Verbe irrégulier : 'rise' - 'rose' - 'risen'." },
                { word: "run", explanation: "Verbe irrégulier : 'run' - 'ran' - 'run'." },
                { word: "say", explanation: "Verbe irrégulier : 'say' - 'said' - 'said'." },
                { word: "see", explanation: "Verbe irrégulier : 'see' - 'saw' - 'seen'." },
                { word: "sell", explanation: "Verbe irrégulier : 'sell' - 'sold' - 'sold'." },
                { word: "send", explanation: "Verbe irrégulier : 'send' - 'sent' - 'sent'." },
                { word: "set", explanation: "Verbe irrégulier identique aux trois formes : 'set' - 'set' - 'set'." },
                { word: "shake", explanation: "Verbe irrégulier : 'shake' - 'shook' - 'shaken'." },
                { word: "shine", explanation: "Verbe irrégulier : 'shine' - 'shone' - 'shone'." },
                { word: "shoot", explanation: "Verbe irrégulier : 'shoot' - 'shot' - 'shot'." },
                { word: "show", explanation: "Verbe irrégulier : 'show' - 'showed' - 'shown/showed'." },
                { word: "shut", explanation: "Verbe irrégulier identique aux trois formes : 'shut' - 'shut' - 'shut'." },
                { word: "sing", explanation: "Verbe irrégulier : 'sing' - 'sang' - 'sung'." },
                { word: "sink", explanation: "Verbe irrégulier : 'sink' - 'sank' - 'sunk'." },
                { word: "sit", explanation: "Verbe irrégulier : 'sit' - 'sat' - 'sat'." },
                { word: "sleep", explanation: "Verbe irrégulier : 'sleep' - 'slept' - 'slept'." },
                { word: "speak", explanation: "Verbe irrégulier : 'speak' - 'spoke' - 'spoken'." },
                { word: "spend", explanation: "Verbe irrégulier : 'spend' - 'spent' - 'spent'." },
                { word: "stand", explanation: "Verbe irrégulier : 'stand' - 'stood' - 'stood'." },
                { word: "steal", explanation: "Verbe irrégulier : 'steal' - 'stole' - 'stolen'." },
                { word: "stick", explanation: "Verbe irrégulier : 'stick' - 'stuck' - 'stuck'." },
                { word: "swear", explanation: "Verbe irrégulier : 'swear' - 'swore' - 'sworn'." },
                { word: "swim", explanation: "Verbe irrégulier : 'swim' - 'swam' - 'swum'." },
                { word: "take", explanation: "Verbe irrégulier : 'take' - 'took' - 'taken'." },
                { word: "teach", explanation: "Verbe irrégulier : 'teach' - 'taught' - 'taught'." },
                { word: "tear", explanation: "Verbe irrégulier : 'tear' - 'tore' - 'torn'." },
                { word: "tell", explanation: "Verbe irrégulier : 'tell' - 'told' - 'told'." },
                { word: "think", explanation: "Verbe irrégulier : 'think' - 'thought' - 'thought'." },
                { word: "throw", explanation: "Verbe irrégulier : 'throw' - 'threw' - 'thrown'." },
                { word: "understand", explanation: "Verbe irrégulier : 'understand' - 'understood' - 'understood'." },
                { word: "wake", explanation: "Verbe irrégulier : 'wake' - 'woke' - 'woken'." },
                { word: "wear", explanation: "Verbe irrégulier : 'wear' - 'wore' - 'worn'." },
                { word: "win", explanation: "Verbe irrégulier : 'win' - 'won' - 'won'." },
                { word: "write", explanation: "Verbe irrégulier : 'write' - 'wrote' - 'written'." },
                { word: "beat", explanation: "Verbe irrégulier : 'beat' - 'beat' - 'beaten'." },
                { word: "behold", explanation: "Verbe irrégulier : 'behold' - 'beheld' - 'beheld'." },
                { word: "bind", explanation: "Verbe irrégulier : 'bind' - 'bound' - 'bound'." },
                { word: "breed", explanation: "Verbe irrégulier : 'breed' - 'bred' - 'bred'." },
                { word: "broadcast", explanation: "Verbe irrégulier identique : 'broadcast' - 'broadcast' - 'broadcast'." },
                { word: "burst", explanation: "Verbe irrégulier identique : 'burst' - 'burst' - 'burst'." },
                { word: "creep", explanation: "Verbe irrégulier : 'creep' - 'crept' - 'crept'." },
                { word: "dive", explanation: "Verbe irrégulier (US) : 'dive' - 'dove/dived' - 'dived'." },
                { word: "forbid", explanation: "Verbe irrégulier : 'forbid' - 'forbade' - 'forbidden'." },
                { word: "grind", explanation: "Verbe irrégulier : 'grind' - 'ground' - 'ground'." },
                { word: "leap", explanation: "Verbe irrégulier : 'leap' - 'leapt/leaped' - 'leapt/leaped'." },
                { word: "mow", explanation: "Verbe irrégulier : 'mow' - 'mowed' - 'mown/mowed'." },
                { word: "prove", explanation: "Verbe irrégulier : 'prove' - 'proved' - 'proven/proved'." },
                { word: "seek", explanation: "Verbe irrégulier : 'seek' - 'sought' - 'sought'." },
                { word: "sew", explanation: "Verbe irrégulier : 'sew' - 'sewed' - 'sewn/sewed'." },
                { word: "shrink", explanation: "Verbe irrégulier : 'shrink' - 'shrank' - 'shrunk'." },
                { word: "slide", explanation: "Verbe irrégulier : 'slide' - 'slid' - 'slid'." },
                { word: "sting", explanation: "Verbe irrégulier : 'sting' - 'stung' - 'stung'." },
                { word: "strive", explanation: "Verbe irrégulier : 'strive' - 'strove' - 'striven'." },
                { word: "sweep", explanation: "Verbe irrégulier : 'sweep' - 'swept' - 'swept'." },
                { word: "swell", explanation: "Verbe irrégulier : 'swell' - 'swelled' - 'swollen/swelled'." },
                { word: "swing", explanation: "Verbe irrégulier : 'swing' - 'swung' - 'swung'." },
                { word: "weave", explanation: "Verbe irrégulier : 'weave' - 'wove' - 'woven'." },
                { word: "wring", explanation: "Verbe irrégulier : 'wring' - 'wrung' - 'wrung'." },
                // Ajoutez plus de verbes irréguliers si nécessaire pour atteindre 100 mots.
            ],
            intruderWords: [
                { word: "accept", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "believe", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "call", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "deliver", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "enjoy", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "finish", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "help", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "listen", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "move", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "open", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "play", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "rain", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "smile", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "talk", explanation: "Verbe régulier, pas un verbe irrégulier." },
                { word: "wait", explanation: "Verbe régulier, pas un verbe irrégulier." },
            ],
        },                       
    ];
 // Sélectionner le thème en fonction du niveau
 const selectedTheme = themes[level % themes.length]; 
 currentTheme = selectedTheme.theme;

 // Sélectionner les mots corrects
 let correctWords = selectedTheme.correctWords.slice(0, 3); // Par exemple, on prend 3 mots corrects

 // Sélectionner un intrus
 let intruder = selectedTheme.intruderWords[Math.floor(Math.random() * selectedTheme.intruderWords.length)];

 // Mélanger les mots corrects
 correctWords = shuffleArray(correctWords);

 // Ajouter l'intrus
 correctWords.push(intruder);

 return correctWords.map((word) => ({
     word: word.word,
     explanation: word.explanation,
     isIntruder: word === intruder
 }));
}
    let numberOfWords = Math.min(3 + level, 10);

    let availableThemes = themes.filter(theme => {
        let availableCorrectWords = theme.correctWords.filter(word => !usedWords.has(word.word));
        let availableIntruderWords = theme.intruderWords.filter(word => !usedWords.has(word.word));
        return availableCorrectWords.length >= numberOfWords - 1 && availableIntruderWords.length > 0;
    });

    if (availableThemes.length === 0) {
        return [];
    }

    let selectedTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    currentTheme = selectedTheme.theme;

    let correctWords = selectedTheme.correctWords.filter(word => !usedWords.has(word.word));
    correctWords = correctWords.slice(0, numberOfWords - 1);

    let intruderWords = selectedTheme.intruderWords.filter(word => !usedWords.has(word.word));
    let intruderWord = intruderWords[Math.floor(Math.random() * intruderWords.length)];

    correctWords.forEach(word => usedWords.add(word.word));
    usedWords.add(intruderWord.word);

    let wordsArray = correctWords.map(word => ({ ...word, isIntruder: false }));
    wordsArray.push({ ...intruderWord, isIntruder: true });

    return shuffleArray(wordsArray);


function showExplanation(isCorrect, word, explanation) {
    const status = isCorrect ? "Correct" : "Incorrect";
    explanationElement.innerHTML = `
        <strong>${status} !</strong><br>
        Mot : ${word}<br>
        Explication : ${explanation}
    `;
}

function positionWord(element) {
    const wordWidth = element.offsetWidth;
    const wordHeight = element.offsetHeight;
    const maxTop = window.innerHeight - wordHeight;
    const maxLeft = window.innerWidth - wordWidth;
    
    const top = Math.random() * maxTop;
    const left = Math.random() * maxLeft;
    
    element.style.top = `${top}px`;
    element.style.left = `${left}px`;
}

function moveElementRebounding(element) {
    let speedX = (Math.random() * 1.5 + 0.5) * difficultyMultiplier * (Math.random() > 0.5 ? 1 : -1);
    let speedY = (Math.random() * 1.5 + 0.5) * difficultyMultiplier * (Math.random() > 0.5 ? 1 : -1);

    function move() {
        if (!element.isConnected) return; // Arrêter le mouvement si l'élément n'est plus dans le DOM

        const rect = element.getBoundingClientRect();
        let newLeft = rect.left + speedX;
        let newTop = rect.top + speedY;

        // Vérifier et ajuster les limites
        if (newLeft < 0) {
            newLeft = 0;
            speedX *= -1;
        } else if (newLeft + rect.width > window.innerWidth) {
            newLeft = window.innerWidth - rect.width;
            speedX *= -1;
        }

        if (newTop < 0) {
            newTop = 0;
            speedY *= -1;
        } else if (newTop + rect.height > window.innerHeight) {
            newTop = window.innerHeight - rect.height;
            speedY *= -1;
        }

        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;

        requestAnimationFrame(move);
    }
    move();
}

function loadLevel() {
    wordList.innerHTML = '';
    words = generateWordsByTheme(level);

    if (!words || words.length === 0) {
        endGame(true);
        return;
    }

    document.getElementById('current-theme').innerText = `Thème actuel : ${currentTheme}`;
    isTransitioning = false;

    words.forEach((wordObject) => {
        const wordElement = document.createElement('span');
        wordElement.innerText = wordObject.word;
        wordElement.classList.add('word');
        wordElement.style.position = 'absolute';
        wordElement.style.userSelect = 'none'; // Empêcher la sélection du texte
        wordElement.style.cursor = 'pointer'; // Changer le curseur en pointeur pour indiquer qu'il est cliquable

        wordList.appendChild(wordElement);
        positionWord(wordElement);

        moveElementRebounding(wordElement);
        
        // Utiliser addEventListener au lieu de onclick
        wordElement.addEventListener('click', (event) => {
            event.stopPropagation(); // Empêcher la propagation de l'événement
            if (!isTransitioning) {
                handleWordClick(wordObject, wordElement);
            }
        });
    });
}

function startTimer(seconds) {
    let timeLeft = seconds;
    document.getElementById('time-left').innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time-left').innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function nextLevel() {
    level++;
    loadLevel();
    startTimer(30);
}

function updateScore() {
    document.getElementById('score').innerText = score;
}

function endGame(success) {
    clearInterval(timerInterval);
    wordList.innerHTML = '';
    const message = success ? `Félicitations ! Vous avez terminé le jeu avec un score de ${score} !` : `Game Over! Votre score : ${score}`;
    messageElement.innerText = message;
    document.getElementById('start-button').style.display = 'inline-block';
    document.getElementById('start-button').innerText = 'Rejouer';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document.getElementById('start-button').addEventListener('click', startGame);

// Configuration Firebase (assurez-vous d'avoir les bonnes configurations)
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

// ... (reste du code existant)

function endGame(success) {
    clearInterval(timerInterval);
    wordList.innerHTML = '';
    const message = success 
        ? `Félicitations ! Vous avez terminé le jeu avec un score de ${score} !` 
        : `Game Over! Votre score final : ${score}`;
    messageElement.innerText = message;
    document.getElementById('start-button').style.display = 'inline-block';
    document.getElementById('start-button').innerText = 'Rejouer';
    isTransitioning = false;
    
    saveScore(score);  // Sauvegarder le score
}

function saveScore(score) {
    const playerName = localStorage.getItem('playerName') || prompt("Entrez votre nom pour le classement :");
    if (playerName) {
        localStorage.setItem('playerName', playerName);
        db.collection("lost_in_migration_scores").add({
            name: playerName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("Score sauvegardé avec succès");
            loadTopScores();
        })
        .catch((error) => {
            console.error("Erreur lors de la sauvegarde du score : ", error);
        });
    }
}

function loadTopScores() {
    db.collection("lost_in_migration_scores")
        .orderBy("score", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
            const topScoresList = document.getElementById("top-scores-list");
            topScoresList.innerHTML = "<h3>Top 5 Scores :</h3>";
            querySnapshot.forEach((doc) => {
                const scoreData = doc.data();
                const li = document.createElement("li");
                li.textContent = `${scoreData.name}: ${scoreData.score}`;
                topScoresList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Erreur lors du chargement des top scores : ", error);
        });
}

// Appeler cette fonction au chargement de la page
document.addEventListener('DOMContentLoaded', (event) => {
    loadTopScores();
    // ... autres initialisations ...
});
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
