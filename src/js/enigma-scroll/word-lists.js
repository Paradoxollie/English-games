/**
 * Listes de mots pour le jeu Enigma Scroll
 * Organisées par niveau de difficulté
 */

// Mots de 4 lettres (Débutant)
const BEGINNER_WORDS = [
  "ABLE", "ACID", "AGED", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALL",
  "BAND", "BANK", "BASE", "BATH", "BEAR", "BEAT", "BEEN", "BEER", "BELL", "BELT",
  "BEST", "BILL", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BOMB", "BOND", "BONE",
  "BOOK", "BORN", "BOTH", "BOWL", "BUSY", "CAKE", "CALL", "CALM", "CAME", "CAMP",
  "CARD", "CARE", "CASE", "CASH", "CAST", "CELL", "CHAT", "CITY", "CLUB", "COAL",
  "COAT", "CODE", "COLD", "COME", "COOK", "COOL", "COPE", "COPY", "CORE", "COST",
  "CREW", "CROP", "DARK", "DATA", "DATE", "DAWN", "DAYS", "DEAD", "DEAL", "DEAR",
  "DEBT", "DEEP", "DENY", "DESK", "DIAL", "DIET", "DIRT", "DISH", "DISK", "DOES",
  "DONE", "DOOR", "DOSE", "DOWN", "DRAW", "DROP", "DRUG", "DUAL", "DUKE", "DUST",
  "DUTY", "EACH", "EARN", "EASE", "EAST", "EASY", "EDGE", "ELSE", "EVEN", "EVER",
  "EVIL", "EXIT", "FACE", "FACT", "FADE", "FAIL", "FAIR", "FALL", "FARM", "FAST",
  "FATE", "FEAR", "FEED", "FEEL", "FEET", "FELL", "FELT", "FILE", "FILL", "FILM"
];

// Mots de 5 lettres (Intermédiaire)
const INTERMEDIATE_WORDS = [
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN",
  "AGENT", "AGREE", "AHEAD", "ALBUM", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER",
  "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARGUE", "ARISE", "ARMED", "ASIDE", "ASSET",
  "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "AWFUL", "BACON", "BADGE", "BADLY", "BAKER",
  "BASES", "BASIC", "BASIS", "BEACH", "BEGAN", "BEGIN", "BEGUN", "BEING", "BELOW", "BENCH",
  "BILLY", "BIRTH", "BLACK", "BLAME", "BLIND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH",
  "BOUND", "BRAIN", "BRAND", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE",
  "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CARRY", "CATCH", "CAUSE", "CHAIN",
  "CHAIR", "CHART", "CHECK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOSE", "CIVIL", "CLAIM",
  "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "COACH", "COAST", "COULD", "COUNT",
  "COURT", "COVER", "CRAFT", "CRASH", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CURVE",
  "CYCLE", "DAILY", "DANCE", "DATED", "DEALT", "DEATH", "DEBUT", "DELAY", "DEPTH", "DOING",
  "DOUBT", "DOZEN", "DRAFT", "DRAMA", "DRAWN", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE",
  "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY",
  "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH",
  "FALSE", "FAULT", "FIBER", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED",
  "FLASH", "FLEET", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND",
  "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN",
  "GLASS", "GLOBE", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRASS", "GREAT", "GREEN",
  "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HAPPY", "HARRY", "HEART"
];

// Mots de 7 lettres (Avancé)
const ADVANCED_WORDS = [
  "ABANDON", "ABILITY", "ABSENCE", "ACADEMY", "ACCOUNT", "ACCUSE", "ACHIEVE", "ACQUIRE", "ADDRESS", "ADVANCE",
  "ADVERSE", "ADVISED", "ADVISER", "AGAINST", "AIRLINE", "AIRPORT", "ALCOHOL", "ALLEGED", "ALLIANCE", "ALLOWED",
  "ALREADY", "AMAZING", "ANCIENT", "ANOTHER", "ANXIETY", "ANXIOUS", "ANYBODY", "ANYTIME", "ANYWAY", "APPROVE",
  "ARRANGE", "ARRIVAL", "ARTICLE", "ARTIST", "ARTWORK", "ASSAULT", "ATHLETE", "ATTEMPT", "ATTRACT", "AVERAGE",
  "AWESOME", "BALANCE", "BANKING", "BARRIER", "BATTERY", "BEDROOM", "BELIEVE", "BENEFIT", "BETWEEN", "BIOLOGY",
  "BIRTHDAY", "BISCUIT", "BLANKET", "BLESSING", "BOOKING", "BOREDOM", "BOTHERED", "BRACKET", "BREAKFAST", "BREATHE",
  "BRILLIANT", "BROTHER", "BROWSER", "BUILDING", "BUSINESS", "CABINET", "CAMPING", "CAPABLE", "CAPITAL", "CAPTAIN",
  "CAPTURE", "CAREFUL", "CARRIER", "CAUTION", "CEILING", "CENTRAL", "CENTURY", "CERTAIN", "CHAMBER", "CHANNEL",
  "CHAPTER", "CHARITY", "CHICKEN", "CHILDREN", "CHIMNEY", "CHOICE", "CHRONIC", "CIRCUIT", "CITIZEN", "CLARITY",
  "CLASSIC", "CLIMATE", "CLOSELY", "CLOTHES", "CLUSTER", "COASTAL", "COCONUT", "COLLECT", "COLLEGE", "COMBINE",
  "COMFORT", "COMMAND", "COMMENT", "COMPANY", "COMPARE", "COMPETE", "COMPLEX", "CONCEPT", "CONCERN", "CONCERT",
  "CONDUCT", "CONFIRM", "CONNECT", "CONSENT", "CONSIST", "CONTACT", "CONTAIN", "CONTENT", "CONTEST", "CONTEXT",
  "CONTROL", "CONVERT", "COOKING", "CORRECT", "CORRUPT", "COTTAGE", "COUNCIL", "COUNTER", "COUNTRY", "COURAGE",
  "COUSIN", "COVERED", "CRACKER", "CREATED", "CREATIVE", "CRICKET", "CRIMINAL", "CRITICAL", "CRUCIAL", "CRYSTAL",
  "CULTURE", "CURIOUS", "CURRENT", "CUSTOMER", "CUSTOMS", "CUTTING", "CYCLING", "DANCER", "DANCING", "DANGER"
];

// Mots de 9 lettres (Expert)
const EXPERT_WORDS = [
  "ABANDONED", "ABILITIES", "ABOLITION", "ABORTION", "ABRUPTNESS", "ABSOLUTELY", "ABSOLUTION", "ABSORPTION", "ABUNDANCE", "ACADEMICS",
  "ACADEMIES", "ACCEPTING", "ACCESSORY", "ACCIDENTS", "ACCLAIMED", "ACCORDING", "ACCOUNTANT", "ACCOUNTING", "ACCUSATION", "ACHIEVING",
  "ACQUAINTED", "ACQUIRING", "ADDICTION", "ADDRESSED", "ADMIRABLE", "ADMISSION", "ADMITTING", "ADOLESCENT", "ADVANCING", "ADVANTAGE",
  "ADVENTURE", "ADVERTISE", "AESTHETIC", "AFFECTING", "AFFECTION", "AFFILIATE", "AFFIRMING", "AFTERMATH", "AFTERNOON", "AGGREGATE",
  "AGREEMENT", "ALGORITHM", "ALIGNMENT", "ALLERGIES", "ALLOWANCE", "ALONGSIDE", "ALTERNATE", "AMAZEMENT", "AMBIGUOUS", "AMBITIOUS",
  "AMENDMENT", "AMUSEMENT", "ANALYZING", "ANCESTRAL", "ANIMATION", "ANNOTATED", "ANONYMOUS", "ANSWERING", "ANTARCTIC", "ANTHOLOGY",
  "ANTIBODIES", "ANTICIPATE", "ANTIQUATED", "APARTMENT", "APOLOGETIC", "APPEALING", "APPEARING", "APPLAUDED", "APPLIANCE", "APPOINTED",
  "APPRAISING", "APPROACH", "APPROVING", "ARBITRARY", "ARCHITECT", "ARGUMENTS", "ARITHMETIC", "ARMAMENTS", "ARRANGING", "ARROGANCE",
  "ARTIFICIAL", "ASCENSION", "ASPIRATION", "ASSAULTING", "ASSERTIVE", "ASSESSING", "ASSISTANT", "ASSOCIATE", "ASSUMPTION", "ASSURANCE",
  "ASTRONAUT", "ASTRONOMY", "ATMOSPHERE", "ATTACHING", "ATTACKING", "ATTAINING", "ATTEMPTED", "ATTENDING", "ATTENTION", "ATTITUDES",
  "ATTRACTED", "ATTRIBUTE", "AUTHENTIC", "AUTHORITY", "AUTHORIZE", "AUTOMATIC", "AVAILABLE", "AVALANCHE", "AWAKENING", "AWARENESS",
  "AWKWARDLY", "BABYSITTER", "BACHELOR", "BACKPACKER", "BACKWARDS", "BACTERIAL", "BADMINTON", "BALANCING", "BANDWAGON", "BANKRUPTCY",
  "BARBECUE", "BAREFOOT", "BARGAINING", "BARRICADE", "BASICALLY", "BATTALION", "BATTERIES", "BEAUTIFUL", "BECOMING", "BEGINNING",
  "BEHAVIORAL", "BELIEVING", "BELONGING", "BENCHMARK", "BENEFICIAL", "BENEVOLENT", "BETRAYING", "BEVERAGES", "BICYCLING", "BILATERAL",
  "BILLIONAIRE", "BIOGRAPHY", "BIOLOGICAL", "BIRTHPLACE", "BLACKBERRY", "BLACKBOARD", "BLAMELESS", "BLANKETLY", "BLASPHEMY", "BLESSINGS"
];

// Mots de 10 lettres (Légendaire)
const LEGENDARY_WORDS = [
  "ABACTERIAL", "ABANDONERS", "ABANDONING", "ABANDONMENT", "ABASEMENTS", "ABASHMENTS", "ABATEMENTS", "ABBREVIATE", "ABDICATION", "ABDOMINALS",
  "ABDUCTORS", "ABERRATION", "ABHORRENCE", "ABIDINGNESS", "ABIOGENIST", "ABJECTIONS", "ABJURATION", "ABLATIVELY", "ABNEGATION", "ABNORMALLY",
  "ABOLISHING", "ABOMINABLE", "ABORIGINAL", "ABORTIVELY", "ABOVEBOARD", "ABRASIVELY", "ABRIDGMENT", "ABROGATING", "ABRUPTNESS", "ABSCONDING",
  "ABSOLUTION", "ABSOLUTISM", "ABSORBABLE", "ABSORBENCY", "ABSORPTION", "ABSTENTION", "ABSTINENCE", "ABSTRACTLY", "ABSURDNESS", "ABUNDANTLY",
  "ACCELERATE", "ACCEPTABLE", "ACCEPTANCE", "ACCESSIBLE", "ACCIDENTAL", "ACCOMPLISH", "ACCORDANCE", "ACCOUNTING", "ACCREDITED", "ACCURATELY",
  "ACCUSATION", "ACCUSTOMED", "ACHIEVABLE", "ACIDIFYING", "ACQUAINTED", "ACQUIESCED", "ACQUITTING", "ACROBATICS", "ACTIONABLE", "ACTIVATION",
  "ACTIVITIES", "ACTIVENESS", "ACUTENESS", "ADAPTATION", "ADDITIONAL", "ADDRESSING", "ADEQUATELY", "ADHERENTLY", "ADHESIVELY", "ADJUSTMENT",
  "ADMIRATION", "ADMISSIBLE", "ADMITTANCE", "ADMONISHED", "ADMONITION", "ADOLESCENT", "ADOPTIVELY", "ADORNMENTS", "ADRENALINE", "ADROITNESS",
  "ADSORPTION", "ADULTERATE", "ADULTEROUS", "ADUMBRATED", "ADVANTAGED", "ADVENTURES", "ADVERTISED", "ADVISEMENT", "ADVOCATING", "AEROBATICS",
  "AERONAUTIC", "AESTHETICS", "AFFABILITY", "AFFECTEDLY", "AFFECTIONS", "AFFILIATED", "AFFLICTING", "AFFORDABLE", "AFICIONADO", "AFTERGLOW",
  "AFTERIMAGE", "AFTERNOONS", "AFTERWARDS", "AGGRAVATED", "AGGRESSION", "AGITATIONS", "AGONIZEDLY", "AGREEINGLY", "AGREEMENTS", "AGRICULTURE",
  "AHISTORICAL", "AIRBRUSHES", "AIRLIFTING", "AIRWORTHINESS", "ALARMINGLY", "ALCHEMICAL", "ALCOHOLICS", "ALCOHOLISM", "ALERTNESS", "ALGORITHMS",
  "ALIENATING", "ALIENATION", "ALIGNMENTS", "ALLEGATION", "ALLEGIANCE", "ALLEGORIST", "ALLEVIATED", "ALLIGATORS", "ALLOCATING", "ALLOCATION",
  "ALLOTMENTS", "ALLOWANCES", "ALLUREMENT", "ALPHABETIC", "ALTERATION", "ALTERNATED", "ALTOGETHER", "ALTRUISTIC", "AMALGAMATE", "AMANUENSIS",
  "AMATEURISH", "AMAZEMENTS", "AMBASSADOR", "AMBIDEXTROUS", "AMBIGUITIES", "AMBIVALENT", "AMBULANCES", "AMELIORATE", "AMENDMENTS", "AMIABILITY"
];

// Listes de mots par difficulté
const wordLists = {
  beginner: BEGINNER_WORDS,
  intermediate: INTERMEDIATE_WORDS,
  advanced: ADVANCED_WORDS,
  expert: EXPERT_WORDS,
  legendary: LEGENDARY_WORDS
};

/**
 * Obtient une liste de mots en fonction de la difficulté
 * @param {string} difficulty - Niveau de difficulté
 * @returns {Array} Liste de mots
 */
function getWordList(difficulty) {
  return wordLists[difficulty] || INTERMEDIATE_WORDS;
}

/**
 * Obtient un mot aléatoire d'une liste
 * @param {string} difficulty - Niveau de difficulté
 * @returns {string} Mot aléatoire
 */
function getRandomWord(difficulty) {
  const list = getWordList(difficulty);
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Vérifie si un mot est un mot anglais valide via l'API Dictionary
 * @param {string} word - Mot à vérifier
 * @returns {Promise<boolean>} Promesse résolue avec true si le mot existe
 */
async function isEnglishWord(word) {
  try {
    // Appel à l'API pour vérifier si le mot existe
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    if (response.ok) {
      const data = await response.json();
      return data.length > 0;  // Le mot existe s'il y a une réponse
    } else {
      return false;  // Si le mot n'existe pas, la réponse de l'API est invalide
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du mot via l'API:", error);

    // En cas d'erreur d'API, vérifier dans nos listes locales
    const normalizedWord = word.toUpperCase().trim();

    // Vérifier dans toutes les listes
    for (const list of Object.values(wordLists)) {
      if (list.includes(normalizedWord)) {
        return true;
      }
    }

    return false;  // Si le mot n'est pas dans nos listes, on considère qu'il n'existe pas
  }
}

/**
 * Cache pour stocker les résultats de vérification des mots
 * Cela évite de faire des appels API répétés pour les mêmes mots
 */
const wordValidationCache = {};

/**
 * Vérifie si un mot est valide (présent dans nos listes ou via l'API)
 * @param {string} word - Mot à vérifier
 * @param {string} difficulty - Niveau de difficulté (optionnel)
 * @returns {Promise<boolean>} Promesse résolue avec true si le mot est valide
 */
async function isValidWord(word, difficulty) {
  // Normaliser le mot (majuscules, sans espaces)
  const normalizedWord = word.toUpperCase().trim();

  // Vérifier si le mot est vide
  if (!normalizedWord) {
    return false;
  }

  // Vérifier si la longueur du mot correspond à la difficulté
  if (difficulty) {
    const expectedLength = getWordLengthForDifficulty(difficulty);
    if (normalizedWord.length !== expectedLength) {
      return false;
    }
  }

  // Vérifier dans le cache
  if (wordValidationCache[normalizedWord] !== undefined) {
    return wordValidationCache[normalizedWord];
  }

  // Vérifier dans les listes de mots (pour la compatibilité)
  if (difficulty) {
    const list = getWordList(difficulty);
    if (list.includes(normalizedWord)) {
      wordValidationCache[normalizedWord] = true;
      return true;
    }
  } else {
    // Sinon, vérifier dans toutes les listes
    for (const list of Object.values(wordLists)) {
      if (list.includes(normalizedWord)) {
        wordValidationCache[normalizedWord] = true;
        return true;
      }
    }
  }

  // Si le mot n'est pas dans nos listes, vérifier via l'API
  const isValid = await isEnglishWord(normalizedWord);
  wordValidationCache[normalizedWord] = isValid;
  return isValid;
}

/**
 * Obtient la longueur attendue des mots pour une difficulté donnée
 * @param {string} difficulty - Niveau de difficulté
 * @returns {number} Longueur attendue des mots
 */
function getWordLengthForDifficulty(difficulty) {
  switch (difficulty) {
    case 'beginner':
      return 4;
    case 'intermediate':
      return 5;
    case 'advanced':
      return 7;
    case 'expert':
      return 9;
    case 'legendary':
      return 10;
    default:
      return 5;
  }
}

// Exporter les fonctions pour les rendre accessibles globalement
window.getWordList = getWordList;
window.getRandomWord = getRandomWord;
window.isValidWord = isValidWord;
window.isEnglishWord = isEnglishWord;
window.getWordLengthForDifficulty = getWordLengthForDifficulty;
