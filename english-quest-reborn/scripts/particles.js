/**
 * Script pour générer des particules et effets visuels gaming
 */

document.addEventListener('DOMContentLoaded', function() {
  // Tous les effets visuels ont été désactivés selon la demande du client
  // pour une interface plus propre et professionnelle
});

/**
 * Crée les conteneurs pour les effets visuels
 */
function createVisualEffects() {
  const hero = document.querySelector('.hero');

  if (!hero) return;

  // Conteneur de particules
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles-container';
  hero.appendChild(particlesContainer);

  // Grille numérique
  const digitalGrid = document.createElement('div');
  digitalGrid.className = 'digital-grid';
  hero.appendChild(digitalGrid);

  // Pluie de code
  const codeRain = document.createElement('div');
  codeRain.className = 'code-rain';
  hero.appendChild(codeRain);

  // Conteneur d'hexagones
  const hexContainer = document.createElement('div');
  hexContainer.className = 'hex-container';
  hero.appendChild(hexContainer);
}

/**
 * Génère des particules animées
 */
function generateParticles() {
  const container = document.querySelector('.particles-container');

  if (!container) return;

  // Nombre de particules (réduit pour un effet plus subtil)
  const particleCount = 15;

  // Créer les particules
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Taille aléatoire (plus petite pour un effet plus subtil)
    const size = Math.random() * 3 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Position aléatoire
    const posX = Math.random() * 100;
    particle.style.left = `${posX}%`;

    // Animation plus lente et douce
    const duration = Math.random() * 15 + 15;
    const delay = Math.random() * 5;

    particle.style.animation = `floatUp ${duration}s linear ${delay}s infinite, floatSide ${duration * 1.5}s ease-in-out ${delay}s infinite`;

    // Ajouter la particule
    container.appendChild(particle);
  }
}

/**
 * Fonction pour l'effet de pluie de code - désactivée pour un design plus inclusif
 */
function generateCodeRain() {
  // Cette fonction a été désactivée pour rendre le design plus inclusif et professionnel
  return;
}

/**
 * Génère des bulles flottantes mignonnes
 */
function generateHexagons() {
  const container = document.querySelector('.hex-container');

  if (!container) return;

  // Nombre de bulles
  const bubbleCount = 20;

  // Créer les bulles
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'hex'; // Gardons le même nom de classe pour compatibilité

    // Position aléatoire
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    bubble.style.left = `${posX}%`;
    bubble.style.top = `${posY}%`;

    // Animation
    const duration = Math.random() * 10 + 10; // Animation plus lente
    const delay = Math.random() * 5;

    bubble.style.animation = `bubbleFloat ${duration}s ease-in-out ${delay}s infinite`;

    // Ajouter la bulle
    container.appendChild(bubble);
  }
}
