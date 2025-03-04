/**
 * Données des verbes irréguliers pour le jeu Speed Verb Challenge
 * Format: verbData[infinitif] = [passé simple, participe passé, traduction]
 */

console.log("Loading verb-data.js");

// Données des verbes irréguliers
const verbData = {
    "be": ["was/were", "been", "être"],
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
    "feel": ["felt", "felt", "sentir"],
    "find": ["found", "found", "trouver"],
    "fly": ["flew", "flown", "voler"],
    "forget": ["forgot", "forgotten", "oublier"],
    "get": ["got", "got/gotten", "obtenir"],
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
    "lead": ["led", "led", "mener"],
    "learn": ["learned/learnt", "learned/learnt", "apprendre"],
    "leave": ["left", "left", "quitter"],
    "lend": ["lent", "lent", "prêter"],
    "let": ["let", "let", "laisser"],
    "lie": ["lay", "lain", "être allongé"],
    "lose": ["lost", "lost", "perdre"],
    "make": ["made", "made", "fabriquer"],
    "mean": ["meant", "meant", "signifier"],
    "meet": ["met", "met", "rencontrer"],
    "pay": ["paid", "paid", "payer"],
    "put": ["put", "put", "mettre"],
    "read": ["read", "read", "lire"],
    "ride": ["rode", "ridden", "chevaucher"],
    "ring": ["rang", "rung", "sonner"],
    "rise": ["rose", "risen", "s'élever"],
    "run": ["ran", "run", "courir"],
    "say": ["said", "said", "dire"],
    "see": ["saw", "seen", "voir"],
    "sell": ["sold", "sold", "vendre"],
    "send": ["sent", "sent", "envoyer"],
    "set": ["set", "set", "fixer"],
    "shake": ["shook", "shaken", "secouer"],
    "shine": ["shone", "shone", "briller"],
    "shoot": ["shot", "shot", "tirer"],
    "show": ["showed", "shown", "montrer"],
    "shut": ["shut", "shut", "fermer"],
    "sing": ["sang", "sung", "chanter"],
    "sit": ["sat", "sat", "s'asseoir"],
    "sleep": ["slept", "slept", "dormir"],
    "speak": ["spoke", "spoken", "parler"],
    "spend": ["spent", "spent", "dépenser"],
    "stand": ["stood", "stood", "se tenir debout"],
    "steal": ["stole", "stolen", "voler (dérober)"],
    "swim": ["swam", "swum", "nager"],
    "take": ["took", "taken", "prendre"],
    "teach": ["taught", "taught", "enseigner"],
    "tell": ["told", "told", "raconter"],
    "think": ["thought", "thought", "penser"],
    "throw": ["threw", "thrown", "lancer"],
    "understand": ["understood", "understood", "comprendre"],
    "wake": ["woke", "woken", "réveiller"],
    "wear": ["wore", "worn", "porter (vêtement)"],
    "win": ["won", "won", "gagner"],
    "write": ["wrote", "written", "écrire"]
};

// Validation des données des verbes
console.log("Validating verb data...");
let validationErrors = 0;

for (const verb in verbData) {
    const data = verbData[verb];
    
    // Vérifier que chaque entrée a 3 éléments
    if (!Array.isArray(data) || data.length !== 3) {
        console.error(`Format incorrect pour le verbe "${verb}": ${JSON.stringify(data)}`);
        validationErrors++;
        continue;
    }
    
    // Vérifier que les formes sont des chaînes de caractères
    if (typeof data[0] !== 'string' || typeof data[1] !== 'string' || typeof data[2] !== 'string') {
        console.error(`Types incorrects pour le verbe "${verb}": ${JSON.stringify(data)}`);
        validationErrors++;
    }
    
    // Vérifier que les formes ne sont pas vides
    if (data[0].trim() === '' || data[1].trim() === '' || data[2].trim() === '') {
        console.error(`Formes vides pour le verbe "${verb}": ${JSON.stringify(data)}`);
        validationErrors++;
    }
}

if (validationErrors > 0) {
    console.error(`${validationErrors} erreurs trouvées dans les données des verbes!`);
} else {
    console.log("Validation des verbes terminée: aucune erreur trouvée.");
}

// Exporter les données globalement
window.verbData = verbData; 