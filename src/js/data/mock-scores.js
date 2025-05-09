/**
 * Données factices pour les scores
 */

// Générer une date aléatoire dans les 30 derniers jours
function randomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  
  return now;
}

// Noms d'utilisateurs factices
const usernames = [
  'DragonSlayer',
  'WordWizard',
  'GrammarKnight',
  'LexiconMaster',
  'SyntaxHero',
  'VerbVoyager',
  'NounNinja',
  'AdjectiveAce',
  'PronounPro',
  'TenseTracker',
  'PhraseFinder',
  'ClauseChampion',
  'ArticleArcher',
  'PrepositionPro',
  'ConjunctionCrusader'
];

// Générer des scores factices pour un jeu
function generateScores(gameId, count = 20) {
  const scores = [];
  
  for (let i = 0; i < count; i++) {
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const baseScore = Math.floor(Math.random() * 5000) + 1000;
    const multiplier = Math.random() * 0.5 + 0.75; // Entre 0.75 et 1.25
    
    scores.push({
      id: `score-${gameId}-${i}`,
      gameId,
      username,
      score: Math.floor(baseScore * multiplier),
      timestamp: randomDate(),
      isTemporary: Math.random() > 0.7, // 30% de scores temporaires
      gameData: {
        level: Math.floor(Math.random() * 5) + 1,
        time: Math.floor(Math.random() * 120) + 60,
        accuracy: Math.floor(Math.random() * 30) + 70
      }
    });
  }
  
  // Trier par score décroissant
  return scores.sort((a, b) => b.score - a.score);
}

// Générer des scores pour tous les jeux
export const scores = [
  ...generateScores('speed-verb-challenge', 25),
  ...generateScores('word-bubbles', 20),
  ...generateScores('grammar-matrix', 15),
  ...generateScores('word-memory', 30),
  ...generateScores('lost-in-migration', 18),
  ...generateScores('whisper-trials', 12)
];
