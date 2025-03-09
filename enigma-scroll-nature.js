// ===== ENIGMAN SCROLLS - NATURE MMORPG THEME =====
// Animations et effets pour le thème MMORPG nature

// Fonction pour initialiser les effets visuels
function initNatureEffects() {
    createForestMist();
    createFloatingLeaves();
    createFireflies();
    addFrameDecorations();
    initLetterAnimations();
}

// Création de la brume de forêt
function createForestMist() {
    const mistElement = document.createElement('div');
    mistElement.className = 'forest-mist';
    document.body.appendChild(mistElement);
}

// Création des feuilles flottantes
function createFloatingLeaves() {
    const leavesContainer = document.createElement('div');
    leavesContainer.className = 'floating-leaves';
    document.body.appendChild(leavesContainer);
    
    // Définir différentes formes de feuilles
    const leafTypes = [
        // Feuille simple
        'M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M12,6C15.31,6 18,8.69 18,12C18,15.31 15.31,18 12,18C8.69,18 6,15.31 6,12C6,8.69 8.69,6 12,6M12,8C9.79,8 8,9.79 8,12C8,14.21 9.79,16 12,16C14.21,16 16,14.21 16,12C16,9.79 14.21,8 12,8Z',
        // Feuille de chêne
        'M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z',
        // Feuille de trèfle
        'M7,21C5.67,21 4.5,19.83 4.5,18.5C4.5,17.17 5.67,16 7,16C8.33,16 9.5,17.17 9.5,18.5C9.5,19.83 8.33,21 7,21M7,18C6.45,18 6,18.45 6,19C6,19.55 6.45,20 7,20C7.55,20 8,19.55 8,19C8,18.45 7.55,18 7,18M17,15C15.67,15 14.5,13.83 14.5,12.5C14.5,11.17 15.67,10 17,10C18.33,10 19.5,11.17 19.5,12.5C19.5,13.83 18.33,15 17,15M17,12C16.45,12 16,12.45 16,13C16,13.55 16.45,14 17,14C17.55,14 18,13.55 18,13C18,12.45 17.55,12 17,12M12,10C10.67,10 9.5,8.83 9.5,7.5C9.5,6.17 10.67,5 12,5C13.33,5 14.5,6.17 14.5,7.5C14.5,8.83 13.33,10 12,10M12,7C11.45,7 11,7.45 11,8C11,8.55 11.45,9 12,9C12.55,9 13,8.55 13,8C13,7.45 12.55,7 12,7Z',
        // Feuille d'érable
        'M21.79,13L16,16L17,18L13,17.25V21H11V17.25L7,18L8,16L2.21,13L3.21,11.27L1.61,8L5.21,7.77L6.21,6L9.63,9.9L8,5H10L12,2L14,5H16L14.37,9.9L17.79,6L18.79,7.73L22.39,7.96L20.79,11.19L21.79,13Z',
        // Feuille de fougère
        'M7,21C5.67,21 4.5,19.83 4.5,18.5C4.5,17.17 5.67,16 7,16C8.33,16 9.5,17.17 9.5,18.5C9.5,19.83 8.33,21 7,21M17,15C15.67,15 14.5,13.83 14.5,12.5C14.5,11.17 15.67,10 17,10C18.33,10 19.5,11.17 19.5,12.5C19.5,13.83 18.33,15 17,15M12,10C10.67,10 9.5,8.83 9.5,7.5C9.5,6.17 10.67,5 12,5C13.33,5 14.5,6.17 14.5,7.5C14.5,8.83 13.33,10 12,10Z'
    ];
    
    // Définir différentes couleurs de feuilles
    const leafColors = [
        '%232e8b57', // Vert émeraude
        '%231a5130', // Vert foncé
        '%234682b4', // Bleu acier
        '%23228B22', // Vert forêt
        '%23556B2F', // Vert olive foncé
        '%238B4513'  // Marron
    ];
    
    // Ajouter 30 feuilles avec des positions et délais aléatoires
    for (let i = 0; i < 30; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        
        // Position aléatoire
        leaf.style.left = `${Math.random() * 100}vw`;
        leaf.style.top = `${Math.random() * 100}vh`;
        
        // Taille aléatoire
        const size = 15 + Math.random() * 25;
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size}px`;
        
        // Rotation aléatoire
        const rotation = Math.random() * 360;
        leaf.style.transform = `rotate(${rotation}deg)`;
        
        // Délai et durée d'animation aléatoires
        leaf.style.animationDelay = `${Math.random() * 15}s`;
        leaf.style.animationDuration = `${20 + Math.random() * 40}s`;
        
        // Type de feuille aléatoire
        const leafType = leafTypes[Math.floor(Math.random() * leafTypes.length)];
        const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
        const opacity = 0.3 + Math.random() * 0.4;
        
        leaf.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${leafType}" fill="${leafColor}" opacity="${opacity}"/></svg>')`;
        
        // Ajouter une classe d'animation aléatoire
        const animationClass = Math.random() > 0.5 ? 'leaf-float-1' : 'leaf-float-2';
        leaf.classList.add(animationClass);
        
        leavesContainer.appendChild(leaf);
    }
}

// Création des lucioles
function createFireflies() {
    const firefliesContainer = document.createElement('div');
    firefliesContainer.className = 'fireflies';
    document.body.appendChild(firefliesContainer);
    
    // Ajouter 40 lucioles avec des positions et délais aléatoires
    for (let i = 0; i < 40; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        
        // Position aléatoire
        firefly.style.left = `${Math.random() * 100}vw`;
        firefly.style.top = `${Math.random() * 100}vh`;
        
        // Taille aléatoire
        const size = 2 + Math.random() * 3;
        firefly.style.width = `${size}px`;
        firefly.style.height = `${size}px`;
        
        // Propriétés pour l'animation fluide
        firefly.dataset.vx = (Math.random() * 2 - 1) * 0.2; // Vitesse horizontale
        firefly.dataset.vy = (Math.random() * 2 - 1) * 0.2; // Vitesse verticale
        firefly.dataset.ax = 0; // Accélération horizontale
        firefly.dataset.ay = 0; // Accélération verticale
        
        // Délai d'animation aléatoire pour le clignotement
        firefly.style.animationDelay = `${Math.random() * 10}s`;
        firefly.style.animationDuration = `${3 + Math.random() * 4}s`;
        
        // Couleur aléatoire (entre or et vert)
        const hue = 60 + Math.random() * 60; // Entre jaune et vert
        const saturation = 80 + Math.random() * 20; // Saturation élevée
        const lightness = 70 + Math.random() * 20; // Luminosité élevée
        
        firefly.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        firefly.style.boxShadow = `0 0 ${5 + Math.random() * 10}px 2px hsl(${hue}, ${saturation}%, ${lightness - 10}%)`;
        firefly.style.opacity = 0.2 + Math.random() * 0.6;
        
        firefliesContainer.appendChild(firefly);
    }
    
    // Animation fluide pour déplacer les lucioles avec requestAnimationFrame
    let lastTime = performance.now();
    
    function animateFireflies(currentTime) {
        // Calculer le delta time pour une animation indépendante du framerate
        const deltaTime = (currentTime - lastTime) / 16; // Normaliser à ~60fps
        lastTime = currentTime;
        
        const fireflies = document.querySelectorAll('.firefly');
        fireflies.forEach(firefly => {
            // Récupérer les propriétés actuelles
            let x = parseFloat(firefly.style.left);
            let y = parseFloat(firefly.style.top);
            let vx = parseFloat(firefly.dataset.vx);
            let vy = parseFloat(firefly.dataset.vy);
            let ax = parseFloat(firefly.dataset.ax);
            let ay = parseFloat(firefly.dataset.ay);
            
            // Mettre à jour l'accélération (mouvement aléatoire)
            ax = (Math.random() * 2 - 1) * 0.01;
            ay = (Math.random() * 2 - 1) * 0.01;
            
            // Mettre à jour la vitesse
            vx += ax * deltaTime;
            vy += ay * deltaTime;
            
            // Limiter la vitesse
            const maxSpeed = 0.3;
            const speed = Math.sqrt(vx * vx + vy * vy);
            if (speed > maxSpeed) {
                vx = (vx / speed) * maxSpeed;
                vy = (vy / speed) * maxSpeed;
            }
            
            // Appliquer un amortissement
            vx *= 0.99;
            vy *= 0.99;
            
            // Mettre à jour la position
            x += vx * deltaTime;
            y += vy * deltaTime;
            
            // Rebondir sur les bords
            if (x < 0) {
                x = 0;
                vx = -vx * 0.5;
            } else if (x > 100) {
                x = 100;
                vx = -vx * 0.5;
            }
            
            if (y < 0) {
                y = 0;
                vy = -vy * 0.5;
            } else if (y > 100) {
                y = 100;
                vy = -vy * 0.5;
            }
            
            // Stocker les nouvelles valeurs
            firefly.style.left = `${x}vw`;
            firefly.style.top = `${y}vh`;
            firefly.dataset.vx = vx;
            firefly.dataset.vy = vy;
            firefly.dataset.ax = ax;
            firefly.dataset.ay = ay;
        });
        
        // Continuer l'animation
        requestAnimationFrame(animateFireflies);
    }
    
    // Démarrer l'animation
    requestAnimationFrame(animateFireflies);
}

// Ajout des décorations de cadre
function addFrameDecorations() {
    const gameFrame = document.querySelector('.game-frame');
    if (!gameFrame) return;
    
    // Vérifier si les décorations existent déjà
    if (gameFrame.querySelector('.frame-decoration')) return;
    
    // Ajouter les décorations aux coins
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    positions.forEach(position => {
        const decoration = document.createElement('div');
        decoration.className = `frame-decoration ${position}`;
        gameFrame.appendChild(decoration);
    });
}

// Initialisation des animations pour les lettres
function initLetterAnimations() {
    // Ajouter une classe pour les animations
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('word-cell')) {
            e.target.classList.add('correct-animation');
            setTimeout(() => {
                e.target.classList.remove('correct-animation');
            }, 500);
        }
    });
}

// Initialiser les effets lorsque la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les effets visuels
    initNatureEffects();
    
    // S'assurer que les règles s'affichent au chargement
    console.log("DOM chargé, préparation de l'affichage des règles...");
    
    // Laisser le temps aux éléments de se charger
    setTimeout(() => {
        // Vérifier si la modale des règles existe
        const rulesModal = document.getElementById('rulesModal');
        if (rulesModal) {
            console.log("Affichage de la modale des règles depuis nature.js");
            rulesModal.classList.add('show');
            rulesModal.style.display = 'flex';
            rulesModal.style.opacity = '1';
            rulesModal.style.visibility = 'visible';
            rulesModal.style.zIndex = '9999';
        } else {
            console.error("La modale des règles n'a pas été trouvée dans nature.js");
        }
        
        // Ajouter un bouton d'aide si nécessaire
        const gameIntro = document.querySelector('.game-intro');
        if (gameIntro && !document.querySelector('.help-button')) {
            const helpButton = document.createElement('button');
            helpButton.className = 'help-button';
            helpButton.innerHTML = '<span class="help-icon">?</span> Règles du jeu';
            helpButton.addEventListener('click', function() {
                console.log("Affichage des règles depuis le bouton d'aide dans nature.js");
                const rulesModal = document.getElementById('rulesModal');
                if (rulesModal) {
                    rulesModal.classList.add('show');
                    rulesModal.style.display = 'flex';
                    rulesModal.style.opacity = '1';
                    rulesModal.style.visibility = 'visible';
                    rulesModal.style.zIndex = '9999';
                }
            });
            
            // Ajouter le bouton après le titre
            const h2 = gameIntro.querySelector('h2');
            if (h2) {
                h2.insertAdjacentElement('afterend', helpButton);
            } else {
                gameIntro.appendChild(helpButton);
            }
        }
    }, 800);
}); 