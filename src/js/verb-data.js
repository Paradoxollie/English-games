/**
 * Données des verbes irréguliers pour le jeu Speed Verb Challenge
 * Format: verbData[infinitif] = [passé simple, participe passé, traduction]
 */

console.log("Loading verb-data.js");

// Données des verbes irréguliers
const verbData = {
    "be": ["was/were", "been", "être"],
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
    "smell": ["smelt", "smelt", "sentir"],
    "spell": ["spelled", "spelled", "épeler"],
    "spill": ["spilt", "spilt", "renverser"],
    "spit": ["spit", "spit", "cracher"],
    "spin": ["spun", "spun", "tourner"],
    "split": ["split", "split", "diviser"],
    "spoil": ["spoilt", "spoilt", "gâcher"],
    "spread": ["spread", "spread", "répandre"],
    "spring": ["sprang", "sprung", "sauter"],
    "sting": ["stung", "stung", "piquer"],
    "stink": ["stank", "stunk", "puer"],
    "strike": ["struck", "struck", "frapper"],
    "swear": ["swore", "sworn", "jurer"],
    "sweep": ["swept", "swept", "balayer"],
    "swell": ["swelled", "swollen", "gonfler"],
    "swing": ["swung", "swung", "balancer"],
    "tear": ["tore", "torn", "déchirer"],
    "upset": ["upset", "upset", "contrarier"],
    "weep": ["wept", "wept", "pleurer"],
    "wet": ["wet", "wet", "mouiller"],
    "wind": ["wound", "wound", "enrouler"],
    "withdraw": ["withdrew", "withdrawn", "retirer"],
    "withstand": ["withstood", "withstood", "résister"],
    "wring": ["wrung", "wrung", "tordre"],
    "plead": ["pled", "pled", "plaider"],
    "broadcast": ["broadcast", "broadcast", "diffuser"],
    "input": ["input", "input", "entrer des données"],
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
    "outdo": ["outdid", "outdone", "surpasser"],
    "shrink": ["shrank", "shrunk", "rétrécir"]
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