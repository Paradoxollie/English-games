/**
 * Listes de mots pour le jeu Enigma Scroll
 * Organisées par niveau de difficulté
 */

// Mots de 4 lettres (Débutant)
const BEGINNER_WORDS = [
  "ABLE", "ACID", "AGED", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALL",
  "BAND", "BANK", "BASE", "BATH", "BEAR", "BEAT", "BEEN", "BEER", "BELL", "BELT",
  "BEST", "BILL", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BOMB", "BOND", "BONE"
];

// Mots de 5 lettres (Intermédiaire)
const INTERMEDIATE_WORDS = [
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN",
  "AGENT", "AGREE", "AHEAD", "ALBUM", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER",
  "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARGUE", "ARISE", "ARMED", "ASIDE", "ASSET"
];

// Mots de 7 lettres (Avancé)
const ADVANCED_WORDS = [
  "ABANDON", "ABILITY", "ABSENCE", "ACADEMY", "ACCOUNT", "ACCUSE", "ACHIEVE", "ACQUIRE", "ADDRESS", "ADVANCE",
  "ADVERSE", "ADVISED", "ADVISER", "AGAINST", "AIRLINE", "AIRPORT", "ALCOHOL", "ALLEGED", "ALLIANCE", "ALLOWED"
];

// Mots de 9 lettres (Expert)
const EXPERT_WORDS = [
  "ABANDONED", "ABILITIES", "ABOLITION", "ABORTION", "ABRUPTNESS", "ABSOLUTELY", "ABSOLUTION", "ABSORPTION", "ABUNDANCE", "ACADEMICS",
  "ACADEMIES", "ACCEPTING", "ACCESSORY", "ACCIDENTS", "ACCLAIMED", "ACCORDING", "ACCOUNTANT", "ACCOUNTING", "ACCUSATION", "ACHIEVING"
];

// Mots de 10 lettres (Légendaire)
const LEGENDARY_WORDS = [
  "ABACTERIAL", "ABANDONERS", "ABANDONING", "ABANDONMENT", "ABASEMENTS", "ABASHMENTS", "ABATEMENTS", "ABBREVIATE", "ABDICATION", "ABDOMINALS",
  "ABDUCTORS", "ABERRATION", "ABHORRENCE", "ABIDINGNESS", "ABIOGENIST", "ABJECTIONS", "ABJURATION", "ABLATIVELY", "ABNEGATION", "ABNORMALLY"
];

// Exporter toutes les listes
export const wordLists = {
  beginner: BEGINNER_WORDS,
  intermediate: INTERMEDIATE_WORDS,
  advanced: ADVANCED_WORDS,
  expert: EXPERT_WORDS,
  legendary: LEGENDARY_WORDS
};

// Fonction pour obtenir une liste de mots en fonction de la difficulté
export function getWordList(difficulty) {
  return wordLists[difficulty] || INTERMEDIATE_WORDS;
}

// Fonction pour obtenir un mot aléatoire d'une liste
export function getRandomWord(difficulty) {
  const list = getWordList(difficulty);
  return list[Math.floor(Math.random() * list.length)];
}

// Fonction pour vérifier si un mot est valide (présent dans nos listes)
export function isValidWord(word, difficulty) {
  // Si une difficulté est spécifiée, vérifier uniquement dans cette liste
  if (difficulty) {
    const list = getWordList(difficulty);
    return list.includes(word.toUpperCase());
  }
  
  // Sinon, vérifier dans toutes les listes
  return Object.values(wordLists).some(list => 
    list.includes(word.toUpperCase())
  );
}
