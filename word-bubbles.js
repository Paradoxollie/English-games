/**
 * Word Bubbles 3D - English Quest
 * Un jeu immersif pour apprendre l'anglais dans un univers MMORPG
 */

// ===== INITIALISATION THREE.JS =====
let scene, camera, renderer;
let bubbleObjects = []; // Objets 3D pour les bulles
let raycaster, mouse;
let clock = new THREE.Clock();
let fontLoader = new THREE.FontLoader(); // Ajout d'un chargeur de police pour le texte 3D

// ===== VARIABLES DE JEU =====
const gameContainer = document.getElementById('word-box');
const scoreDisplay = document.getElementById('score-display');
const timeDisplay = document.getElementById('time-display');
const comboDisplay = document.getElementById('combo-display');
const wordInput = document.getElementById('current-word');
const submitButton = document.getElementById('submit-word');
const startResetButton = document.getElementById('start-reset');
const messageDisplay = document.getElementById('message');
const topScoresList = document.getElementById('top-scores-list');
const modeSelect = document.getElementById('game-mode');
const difficultySelect = document.getElementById('difficulty-level');
const tutorialModal = document.getElementById('tutorial-modal');
const rewardModal = document.getElementById('reward-modal');
const particlesOverlay = document.getElementById('particles-overlay');

// ===== DONNÉES DU JEU =====
let wordsList = []; // Liste des mots pour le jeu

// État du jeu
let score = 0;
let combo = 1;
let maxCombo = 1;
let gameRunning = false;
let usedWords = new Set();
let currentLetters = '';
let gameInterval;
let activeBubbles = [];
let gameStartTime;
let currentTime = 0;
let gameMode = 'normal';
let difficulty = 'medium';
let difficultySettings = {
    easy: { bubbleSpeed: 0.7, spawnRate: 4000, maxBubbles: 5 },
    medium: { bubbleSpeed: 1, spawnRate: 3000, maxBubbles: 8 },
    hard: { bubbleSpeed: 1.3, spawnRate: 2000, maxBubbles: 12 }
};

// ===== INITIALISATION DU JEU =====
function initGame() {
    console.log("Initialisation du jeu...");
    
    // Vérifier si le conteneur de jeu existe
    const gameContainer = document.getElementById('word-box');
    if (!gameContainer) {
        console.error("Conteneur de jeu 'word-box' non trouvé");
        alert("Erreur: Conteneur de jeu non trouvé. Veuillez rafraîchir la page.");
        return;
    }
    
    console.log("Conteneur de jeu trouvé");
    
    // Initialiser les références aux éléments DOM
    const scoreDisplay = document.getElementById('score-display');
    const timeDisplay = document.getElementById('time-display');
    const comboDisplay = document.getElementById('combo-display');
    const wordInput = document.getElementById('current-word');
    const submitButton = document.getElementById('submit-word');
    const startResetButton = document.getElementById('start-reset');
    const messageDisplay = document.getElementById('message');
    
    // Vérifier si les éléments essentiels existent
    if (!startResetButton) {
        console.error("Bouton de démarrage non trouvé");
        alert("Erreur d'initialisation du jeu : bouton de démarrage manquant");
        return;
    }
    
    // Initialiser Three.js
    console.log("Initialisation de Three.js...");
    initThreeJS();
    
    // Vérifier si Three.js a été correctement initialisé
    if (!scene || !camera || !renderer) {
        console.error("Échec de l'initialisation de Three.js");
        alert("Erreur: Three.js n'a pas pu être initialisé. Veuillez rafraîchir la page.");
        return;
    }
    
    console.log("Three.js initialisé avec succès");
    
    // Charger les mots
    console.log("Chargement des mots...");
    loadWords().then(() => {
        console.log(`${wordsList.length} mots chargés avec succès`);
        if (typeof showNotification === 'function') {
            showNotification(`${wordsList.length} mots chargés`, "success");
        }
    }).catch(error => {
        console.error("Erreur lors du chargement des mots:", error);
        if (typeof showNotification === 'function') {
            showNotification("Erreur lors du chargement des mots", "error");
        }
    });
    
    // Configurer les écouteurs d'événements
    console.log("Configuration des écouteurs d'événements...");
    window.addEventListener('resize', onWindowResize, false);
    
    // Configurer les écouteurs d'événements pour le renderer
    if (renderer && renderer.domElement) {
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('click', onBubbleClick, false);
        console.log("Écouteurs d'événements ajoutés au renderer");
    } else {
        console.error("Renderer non disponible pour ajouter des écouteurs d'événements");
    }
    
    // Configurer les boutons
    if (startResetButton) {
        startResetButton.addEventListener('click', function() {
            if (gameRunning) {
                resetGame();
            } else {
                startGame();
            }
        });
        console.log("Écouteur d'événement ajouté au bouton de démarrage/réinitialisation");
    }
    
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            if (typeof checkWord === 'function') {
                checkWord();
            }
        });
        console.log("Écouteur d'événement ajouté au bouton de soumission");
    }
    
    if (wordInput) {
        wordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && typeof checkWord === 'function') {
                checkWord();
            }
        });
        console.log("Écouteur d'événement ajouté au champ de saisie");
    }
    
    // Configurer les sélecteurs de mode et difficulté
    const modeSelect = document.getElementById('game-mode');
    const difficultySelect = document.getElementById('difficulty-level');
    
    if (modeSelect) {
        modeSelect.addEventListener('change', resetGame);
        console.log("Écouteur d'événement ajouté au sélecteur de mode");
    } else {
        console.error("Sélecteur de mode non trouvé");
    }
    
    if (difficultySelect) {
        difficultySelect.addEventListener('change', resetGame);
        console.log("Écouteur d'événement ajouté au sélecteur de difficulté");
    } else {
        console.error("Sélecteur de difficulté non trouvé");
    }
    
    // Initialiser l'état du jeu
    resetGame();
    
    // Afficher un message de bienvenue
    if (typeof showNotification === 'function') {
        showNotification("Bienvenue dans Word Bubbles 3D !", "info", 5000);
    }
    
    console.log("Jeu initialisé avec succès");
}

// ===== INITIALISATION THREE.JS =====
function initThreeJS() {
    console.log("Initialisation de Three.js...");
    
    // Vérifier si le conteneur existe
    const container = document.getElementById('word-box');
    if (!container) {
        console.error("Conteneur 'word-box' non trouvé");
        alert("Erreur: Conteneur de jeu non trouvé. Veuillez recharger la page.");
        return false;
    }
    
    console.log("Conteneur trouvé, dimensions:", container.clientWidth, "x", container.clientHeight);
    
    // Vérifier les dimensions du conteneur
    if (container.clientWidth < 100 || container.clientHeight < 100) {
        console.error("Dimensions du conteneur trop petites:", container.clientWidth, "x", container.clientHeight);
        container.style.height = "400px"; // Forcer une hauteur minimale
        console.log("Hauteur du conteneur forcée à 400px");
    }
    
    // Créer la scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e); // Fond bleu très foncé pour meilleur contraste
    
    // Créer la caméra
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    
    // Créer le renderer avec des options améliorées
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Activer les ombres
    
    // Vider le conteneur avant d'ajouter le renderer
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Ajouter le renderer au conteneur
    container.appendChild(renderer.domElement);
    console.log("Renderer ajouté au conteneur");
    
    // Initialiser le raycaster pour la détection des clics
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Ajouter des lumières plus intenses pour meilleure visibilité
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Lumière ambiante plus claire
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Plus intense
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Ajouter une lumière ponctuelle pour les reflets
    const pointLight = new THREE.PointLight(0x4169E1, 1, 100); // Bleu royal
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);
    
    // Initialiser l'horloge pour les animations
    clock = new THREE.Clock();
    
    // Initialiser le tableau des bulles
    bubbleObjects = [];
    
    // Ajouter un objet de test pour vérifier que la scène fonctionne
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0x440000,
        specular: 0xffffff,
        shininess: 50
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0); // Positionner au centre
    scene.add(cube);
    console.log("Cube de test ajouté à la scène (rouge, 2x2x2)");
    
    // Ajouter du texte au cube pour tester la visibilité du texte
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;
    
    // Fond blanc
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texte noir
    context.font = 'bold 200px Arial';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('TEST', canvas.width/2, canvas.height/2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3, 3, 1);
    cube.add(sprite);
    console.log("Texte de test ajouté au cube");
    
    // Ajouter les écouteurs d'événements directement sur le renderer
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onBubbleClick, false);
    console.log("Écouteurs d'événements ajoutés au renderer");
    
    // Rendre la scène une fois pour vérifier
    renderer.render(scene, camera);
    console.log("Three.js initialisé avec succès");
    
    return true; // Indiquer que l'initialisation a réussi
}

// ===== FONCTIONS D'ANIMATION =====
function animate() {
    // Vérifier si les objets nécessaires existent
    if (!renderer || !scene || !camera) {
        console.error("Objets Three.js manquants pour l'animation");
        return;
    }
    
    // Continuer l'animation
    requestAnimationFrame(animate);
    
    // Calculer le delta time pour des animations fluides
    const delta = clock.getDelta();
    
    // Animer les bulles
    if (typeof animateBubbles === 'function' && bubbleObjects && bubbleObjects.length > 0) {
        animateBubbles(delta);
    }
    
    // Faire tourner le cube de test s'il existe
    scene.children.forEach(child => {
        if (child.geometry && child.geometry.type === 'BoxGeometry') {
            child.rotation.x += 0.01;
            child.rotation.y += 0.01;
        }
    });
    
    // Effectuer le rendu
    try {
        renderer.render(scene, camera);
    } catch (error) {
        console.error("Erreur lors du rendu:", error);
    }
}

function animateBubbles(delta) {
    if (!clock || !bubbleObjects || bubbleObjects.length === 0) {
        return;
    }
    
    const time = clock.getElapsedTime();
    
    // Animation des bulles
    bubbleObjects.forEach((bubble, index) => {
        if (!bubble || !bubble.userData) return;
        
        if (bubble.userData.active) {
            // Rotation légère pour effet 3D
            bubble.rotation.x += 0.002;
            bubble.rotation.y += 0.003;
            
            // Animation de flottement
            const floatSpeed = 0.5 + Math.random() * 0.5;
            const floatAmplitude = 0.05;
            bubble.position.y += Math.sin(time * floatSpeed + index) * floatAmplitude * delta;
            
            // Animation de pulsation
            const pulseSpeed = 1.5; // Vitesse de pulsation
            const pulseAmplitude = 0.05; // Amplitude de pulsation
            const pulseFactor = 1 + Math.sin(time * pulseSpeed + index) * pulseAmplitude;
            
            // Récupérer l'échelle initiale
            const baseScale = bubble.userData.initialScale || 1;
            
            // Appliquer l'échelle
            bubble.scale.set(baseScale * pulseFactor, baseScale * pulseFactor, baseScale * pulseFactor);
            
            // Déplacement vers le bas selon la difficulté
            let speed = 1.0; // Vitesse par défaut
            
            // Récupérer la difficulté actuelle
            const difficultyElement = document.getElementById('difficulty-level');
            if (difficultyElement) {
                const difficulty = difficultyElement.value;
                const difficultySettings = {
                    easy: { bubbleSpeed: 0.5 },
                    medium: { bubbleSpeed: 1.0 },
                    hard: { bubbleSpeed: 1.5 }
                };
                
                if (difficultySettings[difficulty]) {
                    speed = difficultySettings[difficulty].bubbleSpeed;
                }
            }
            
            // Appliquer la vitesse de descente
            if (bubble.userData.speed !== undefined) {
                bubble.position.y -= speed * delta * bubble.userData.speed;
            } else {
                bubble.position.y -= speed * delta;
            }
            
            // Vérification si la bulle est sortie de l'écran
            if (bubble.position.y < -10) {
                if (typeof gameRunning !== 'undefined' && gameRunning && typeof gameOver === 'function') {
                    gameOver();
                }
            }
        }
    });
}

// ===== GESTION DES ÉVÉNEMENTS =====
function onWindowResize() {
    console.log("Redimensionnement de la fenêtre...");
    
    // Vérifier si les objets nécessaires existent
    if (!camera || !renderer) {
        console.error("Objets Three.js manquants pour le redimensionnement");
        return;
    }
    
    // Récupérer le conteneur
    const container = document.getElementById('word-box');
    if (!container) {
        console.error("Conteneur 'word-box' non trouvé");
        return;
    }
    
    // Récupérer les nouvelles dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    console.log(`Nouvelles dimensions: ${width}x${height}`);
    
    // Mettre à jour la caméra
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Mettre à jour le renderer
    renderer.setSize(width, height);
    
    console.log("Redimensionnement terminé");
}

function onMouseMove(event) {
    // Vérifier si les objets nécessaires existent
    if (!mouse || !renderer) return;
    
    // Calculer la position de la souris en coordonnées normalisées (-1 à +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onBubbleClick(event) {
    console.log("Clic détecté");
    
    // Vérifier si le jeu est actif
    if (!gameRunning) {
        console.log("Le jeu n'est pas en cours, clic ignoré");
        return;
    }
    
    // Vérifier si tous les objets nécessaires existent
    if (!raycaster || !mouse || !camera || !scene || !bubbleObjects || bubbleObjects.length === 0) {
        console.error("Objets manquants pour la détection de clic");
        return;
    }
    
    // Calculer la position de la souris en coordonnées normalisées (-1 à +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    console.log(`Position de la souris: (${mouse.x.toFixed(2)}, ${mouse.y.toFixed(2)})`);
    
    // Mettre à jour le raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Calculer les intersections avec les bulles
    const intersects = raycaster.intersectObjects(bubbleObjects);
    console.log(`Nombre d'intersections: ${intersects.length}`);
    
    // Si une bulle est cliquée
    if (intersects.length > 0) {
        const clickedBubble = intersects[0].object;
        console.log("Bulle cliquée:", clickedBubble);
        
        // Vérifier si la bulle a des données utilisateur
        if (!clickedBubble.userData) {
            console.error("La bulle n'a pas de données utilisateur");
            return;
        }
        
        // Récupérer la lettre de la bulle
        const letter = clickedBubble.userData.content;
        console.log(`Lettre de la bulle: ${letter}`);
        
        // Ajouter la lettre au champ de saisie
        if (wordInput) {
            wordInput.value += letter;
            wordInput.focus();
        }
        
        // Créer une explosion de particules à la position de la bulle
        if (typeof createParticleExplosion === 'function') {
            createParticleExplosion(clickedBubble.position.clone(), 0x4CAF50);
        }
        
        // Supprimer la bulle de la scène
        scene.remove(clickedBubble);
        
        // Supprimer la bulle du tableau
        const index = bubbleObjects.indexOf(clickedBubble);
        if (index !== -1) {
            bubbleObjects.splice(index, 1);
        }
        
        console.log(`Lettre ${letter} ajoutée. Bulles restantes: ${bubbleObjects.length}`);
    } else {
        console.log("Aucune bulle cliquée");
    }
}

// ===== CHARGEMENT DES DONNÉES =====
async function loadWords() {
    try {
        console.log("Chargement des mots...");
        
        // Liste de mots prédéfinie pour éviter les problèmes CORS
        wordsList = [
            "apple", "banana", "cat", "dog", "elephant", "fish", "giraffe", "house", "ice", "jungle",
            "kite", "lion", "monkey", "nest", "orange", "penguin", "queen", "rabbit", "snake", "tiger",
            "umbrella", "violin", "whale", "xylophone", "yellow", "zebra", "ant", "bear", "cow", "duck",
            "eagle", "fox", "goat", "horse", "iguana", "jaguar", "koala", "leopard", "mouse", "newt",
            "owl", "pig", "quail", "raccoon", "sheep", "turtle", "unicorn", "vulture", "wolf", "yak",
            "book", "chair", "desk", "egg", "flower", "glass", "hat", "ink", "jar", "key",
            "lamp", "map", "nail", "ocean", "pen", "quilt", "ring", "sun", "tree", "vase",
            "water", "box", "yarn", "zipper", "car", "door", "earth", "fire", "gold", "heart",
            "island", "jelly", "king", "leaf", "moon", "night", "oak", "paper", "queen", "river",
            "star", "time", "universe", "valley", "window", "year", "zone", "cloud", "dream", "energy"
        ];
        
        console.log(`${wordsList.length} mots chargés avec succès`);
        return wordsList;
    } catch (error) {
        console.error("Erreur lors du chargement des mots:", error);
        
        // En cas d'erreur, utiliser une liste de secours plus petite
        wordsList = ["cat", "dog", "fish", "bird", "tree", "book", "car", "sun", "moon", "star"];
        console.log("Utilisation de la liste de secours de mots");
        return wordsList;
    }
}

// ===== CRÉATION DES BULLES =====
function createBubble3D(content, definition = '') {
    console.log(`Création d'une bulle avec le contenu: ${content}`);
    
    // Création de la géométrie de la bulle
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Création d'un matériau plus visible et moins transparent
    const material = new THREE.MeshPhongMaterial({
        color: 0x4169E1,         // Couleur bleu royal
        transparent: true,
        opacity: 0.85,            // Moins transparent
        shininess: 80,
        specular: 0xffffff,       // Reflet blanc
        emissive: 0x1E3A8A,       // Émission bleue pour un effet de brillance
        emissiveIntensity: 0.3
    });
    
    // Création de la bulle
    const bubble = new THREE.Mesh(geometry, material);
    
    // Position aléatoire
    const posX = (Math.random() - 0.5) * 10;
    const posY = Math.random() * 5 + 10; // Commencer au-dessus de l'écran
    const posZ = (Math.random() - 0.5) * 5;
    bubble.position.set(posX, posY, posZ);
    console.log(`Position de la bulle: (${posX.toFixed(2)}, ${posY.toFixed(2)}, ${posZ.toFixed(2)})`);
    
    // Taille plus grande pour une meilleure visibilité
    const scale = Math.random() * 0.3 + 1.0; // Augmentation de la taille minimale
    bubble.scale.set(scale, scale, scale);
    
    // Rotation aléatoire
    bubble.rotation.x = Math.random() * Math.PI;
    bubble.rotation.y = Math.random() * Math.PI;
    
    // Ajout du texte à la bulle
    addTextToBubble(bubble, content);
    
    // Données utilisateur pour le suivi
    bubble.userData = {
        content: content,
        definition: definition,
        active: true,
        offset: Math.random() * 10,
        speed: Math.random() * 0.5 + 0.75, // Vitesse aléatoire
        initialScale: scale
    };
    
    // Ajout d'un effet de brillance (glow)
    addGlowEffect(bubble);
    
    // Ajouter la bulle à la scène immédiatement
    scene.add(bubble);
    bubbleObjects.push(bubble);
    
    console.log(`Bulle créée et ajoutée à la scène. Total: ${bubbleObjects.length}`);
    
    return bubble;
}

function addTextToBubble(bubble, text) {
    console.log(`Ajout du texte "${text}" à une bulle`);
    
    // Suppression des anciens sprites s'ils existent
    bubble.children.forEach(child => {
        if (child.isSprite) {
            bubble.remove(child);
        }
    });

    // Création d'un canvas pour le texte
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;
    
    // Fond transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner un cercle comme fond de la bulle
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2.2;
    
    // Dégradé radial pour le fond de la bulle - plus contrasté
    const gradient = context.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');  // Blanc au centre
    gradient.addColorStop(1, 'rgba(200, 220, 255, 0.85)');  // Bleu très clair aux bords
    
    // Dessiner le cercle avec le dégradé
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    
    // Ajouter un contour brillant plus épais
    context.lineWidth = 20;
    context.strokeStyle = 'rgba(65, 105, 225, 0.9)'; // Bleu royal
    context.stroke();
    
    // Ajouter un halo lumineux
    context.beginPath();
    context.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    context.lineWidth = 10;
    context.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    context.stroke();
    
    // Configuration du texte - plus grand et plus gras
    const fontSize = text.length > 1 ? 240 : 320; // Taille de police plus grande
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Ajouter une ombre plus prononcée pour meilleure lisibilité
    context.shadowColor = 'rgba(0, 0, 0, 0.9)';
    context.shadowBlur = 20;
    context.shadowOffsetX = 6;
    context.shadowOffsetY = 6;
    
    // Dessiner le contour du texte plus épais
    context.strokeStyle = 'black';
    context.lineWidth = 16;
    context.strokeText(text.toUpperCase(), centerX, centerY);
    
    // Texte en couleur foncée pour contraster avec le fond clair
    context.fillStyle = '#000080'; // Bleu marine foncé
    context.fillText(text.toUpperCase(), centerX, centerY);
    
    // Création de la texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Création du matériau pour le sprite
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 1
    });
    
    // Création et configuration du sprite - plus grand
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.0, 3.0, 1); // Augmentation de la taille
    
    // Ajout du sprite à la bulle
    bubble.add(sprite);
    
    // Ajout d'un effet de brillance
    const glowMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.4, // Plus visible
        color: 0x4169E1 // Bleu royal pour la brillance
    });
    
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(3.5, 3.5, 1); // Plus grand que le sprite principal
    bubble.add(glowSprite);
    
    console.log(`Texte ajouté à la bulle: "${text}"`);
}

// Fonction pour ajouter un effet de brillance à une bulle
function addGlowEffect(bubble) {
    // Création d'une sphère légèrement plus grande pour l'effet de brillance
    const glowGeometry = new THREE.SphereGeometry(1.15, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4169E1, // Bleu royal pour correspondre au thème
        transparent: true,
        opacity: 0.5, // Plus visible
        side: THREE.BackSide
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.set(bubble.scale.x, bubble.scale.y, bubble.scale.z);
    bubble.add(glowMesh);
    
    // Ajout d'un second effet de brillance plus large
    const outerGlowGeometry = new THREE.SphereGeometry(1.3, 32, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF, // Blanc pour un effet lumineux
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
    });
    
    const outerGlowMesh = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    outerGlowMesh.scale.set(bubble.scale.x, bubble.scale.y, bubble.scale.z);
    bubble.add(outerGlowMesh);
}

// ===== EFFETS VISUELS =====
function createParticleExplosion(position, color = 0xc9aa71) {
    console.log("Création d'une explosion de particules");
    
    // Vérifier si la scène existe
    if (!scene) {
        console.error("La scène n'existe pas, impossible de créer des particules");
        return;
    }
    
    // Nombre de particules
    const particleCount = 30;
    
    // Créer un groupe pour contenir toutes les particules
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);
    
    // Créer les particules
    for (let i = 0; i < particleCount; i++) {
        // Géométrie de la particule
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        
        // Matériau de la particule
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        // Créer la particule
        const particle = new THREE.Mesh(geometry, material);
        
        // Position initiale (à la position de l'explosion)
        particle.position.copy(position);
        
        // Vélocité aléatoire
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            ),
            size: Math.random() * 0.2 + 0.1,
            life: 1.0 // Durée de vie (1.0 = 100%)
        };
        
        // Ajouter la particule au groupe
        particleGroup.add(particle);
    }
    
    // Fonction d'animation pour les particules
    const animate = () => {
        // Vérifier si le groupe existe encore
        if (!particleGroup || !particleGroup.parent) {
            return;
        }
        
        // Vérifier s'il reste des particules
        if (particleGroup.children.length === 0) {
            scene.remove(particleGroup);
            return;
        }
        
        // Animer chaque particule
        for (let i = particleGroup.children.length - 1; i >= 0; i--) {
            const particle = particleGroup.children[i];
            
            // Mettre à jour la position
            particle.position.add(particle.userData.velocity);
            
            // Réduire la taille et l'opacité
            particle.userData.life -= 0.02;
            const scale = particle.userData.size * particle.userData.life;
            particle.scale.set(scale, scale, scale);
            
            if (particle.material) {
                particle.material.opacity = particle.userData.life;
            }
            
            // Supprimer la particule si sa durée de vie est écoulée
            if (particle.userData.life <= 0) {
                if (particle.material) particle.material.dispose();
                if (particle.geometry) particle.geometry.dispose();
                particleGroup.remove(particle);
            }
        }
        
        // Continuer l'animation
        requestAnimationFrame(animate);
    };
    
    // Démarrer l'animation
    animate();
}

// Fonction pour afficher le texte de combo
function showComboText(combo, position) {
    console.log(`Affichage du combo x${combo}`);
    
    // Vérifier si la scène existe
    if (!scene) {
        console.error("La scène n'existe pas, impossible d'afficher le combo");
        return;
    }
    
    // Créer un canvas pour le texte
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;
    
    // Fond transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Texte du combo
    const comboText = `COMBO x${combo}`;
    
    // Configurer le style du texte
    context.font = 'bold 80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Ajouter une ombre
    context.shadowColor = 'rgba(0, 0, 0, 0.8)';
    context.shadowBlur = 15;
    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;
    
    // Dessiner le contour
    context.strokeStyle = 'black';
    context.lineWidth = 8;
    context.strokeText(comboText, canvas.width/2, canvas.height/2);
    
    // Dessiner le texte
    // Couleur basée sur le niveau de combo
    let color;
    if (combo >= 5) {
        color = '#FF4500'; // Orange-rouge pour les grands combos
    } else if (combo >= 3) {
        color = '#FFA500'; // Orange pour les combos moyens
    } else {
        color = '#FFD700'; // Or pour les petits combos
    }
    
    context.fillStyle = color;
    context.fillText(comboText, canvas.width/2, canvas.height/2);
    
    // Créer la texture
    const texture = new THREE.CanvasTexture(canvas);
    
    // Créer le matériau
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 1
    });
    
    // Créer le sprite
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.position.y += 2; // Positionner au-dessus de la bulle
    sprite.scale.set(5, 2.5, 1);
    
    // Ajouter à la scène
    scene.add(sprite);
    
    // Animation du sprite
    const animate = () => {
        // Vérifier si le sprite existe encore
        if (!sprite || !sprite.parent) {
            return;
        }
        
        // Déplacer vers le haut
        sprite.position.y += 0.05;
        
        // Réduire l'opacité
        if (sprite.material) {
            sprite.material.opacity -= 0.02;
            
            // Supprimer quand il devient invisible
            if (sprite.material.opacity <= 0) {
                scene.remove(sprite);
                if (sprite.material.map) sprite.material.map.dispose();
                sprite.material.dispose();
                return;
            }
        }
        
        // Continuer l'animation
        requestAnimationFrame(animate);
    };
    
    // Démarrer l'animation
    animate();
}

// ===== GESTION DU TEMPS =====
function updateGameTime() {
    // Vérifier si le jeu est actif
    if (!gameRunning) {
        clearInterval(gameInterval);
        return;
    }
    
    // Vérifier si l'élément d'affichage existe
    if (!timeDisplay) {
        console.error("Élément d'affichage du temps non trouvé");
        return;
    }
    
    // Calculer le temps écoulé
    const currentTimeMs = Date.now();
    const elapsedSeconds = Math.floor((currentTimeMs - startTime) / 1000);
    currentTime = elapsedSeconds;
    
    // Formater le temps (minutes:secondes)
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Mettre à jour l'affichage
    timeDisplay.textContent = `Temps: ${formattedTime}`;
}

// ===== AFFICHAGE DES MESSAGES =====
function showMessage(text, color = 'white', duration = 2000) {
    messageDisplay.style.color = color;
    messageDisplay.textContent = text;
    
    // Animation avec GSAP
    gsap.fromTo(messageDisplay, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3 }
    );
    
    if (duration > 0) {
        setTimeout(() => {
            if (gameRunning) {
                gsap.to(messageDisplay, { 
                    opacity: 0, 
                    duration: 0.3,
                    onComplete: () => { messageDisplay.textContent = ''; }
                });
            }
        }, duration);
    }
}

// ===== GÉNÉRATION ET GESTION DES BULLES =====
async function generateBubbles() {
    console.log("Génération de bulles...");
    
    // Vérifier si le jeu est actif
    if (!gameRunning) {
        console.log("Le jeu n'est pas actif, pas de génération de bulles");
        return;
    }
    
    // Vérifier si la scène existe
    if (!scene) {
        console.error("La scène n'existe pas, impossible de générer des bulles");
        return;
    }
    
    // Nombre de bulles à générer selon la difficulté
    let maxBubbles = 8; // Valeur par défaut
    
    // Vérifier si l'élément existe avant d'accéder à sa valeur
    const difficultyElement = document.getElementById('difficulty-level');
    if (difficultyElement) {
        const difficulty = difficultyElement.value;
        const difficultySettings = {
            easy: { maxBubbles: 5 },
            medium: { maxBubbles: 8 },
            hard: { maxBubbles: 12 }
        };
        
        // Utiliser la valeur du paramètre de difficulté si disponible
        if (difficultySettings[difficulty]) {
            maxBubbles = difficultySettings[difficulty].maxBubbles;
        }
    }
    
    // Si on a déjà assez de bulles actives, ne pas en générer de nouvelles
    const activeBubbleCount = bubbleObjects.filter(b => b.userData && b.userData.active).length;
    console.log(`Bulles actives: ${activeBubbleCount}/${maxBubbles}`);
    
    if (activeBubbleCount >= maxBubbles) {
        console.log("Nombre maximum de bulles atteint, pas de génération de nouvelles bulles");
        
        // Planifier la prochaine vérification
        setTimeout(generateBubbles, 1000);
        return;
    }
    
    // Générer une nouvelle bulle
    const letter = chooseLetter();
    console.log(`Génération d'une bulle avec la lettre: ${letter}`);
    
    // Créer la bulle 3D
    createBubble3D(letter);
    
    // Planifier la génération de la prochaine bulle
    const nextBubbleTime = Math.random() * 2000 + 1000; // Entre 1 et 3 secondes
    setTimeout(generateBubbles, nextBubbleTime);
}

// Fonction pour choisir une lettre avec une distribution pondérée
function chooseLetter() {
    // Fréquences des lettres proportionnelles au nombre de mots possibles
    const letterFrequencies = {
        A: 20, B: 8, C: 12, D: 10, E: 25, F: 6, G: 8, H: 8, I: 18,
        J: 2, K: 4, L: 12, M: 10, N: 15, O: 15, P: 10, Q: 2, R: 15,
        S: 18, T: 15, U: 8, V: 4, W: 6, X: 2, Y: 6, Z: 2
    };
    
    const letterPool = Object.entries(letterFrequencies)
        .flatMap(([letter, frequency]) => Array(frequency).fill(letter));
    
    return letterPool[Math.floor(Math.random() * letterPool.length)];
}

// ===== VÉRIFICATION DES MOTS =====
async function checkWord() {
    // Vérifier si le jeu est actif
    if (!gameRunning) return;
    
    // Récupérer le mot saisi
    const submittedWord = wordInput.value.trim().toLowerCase();
    
    // Vérifier si le mot est vide
    if (!submittedWord) {
        showNotification("Veuillez entrer un mot", "warning");
        return;
    }
    
    // Vérifier si le mot a déjà été utilisé
    if (usedWords.has(submittedWord)) {
        showNotification("Mot déjà utilisé !", "warning");
        shakeInput();
        return;
    }
    
    // Vérifier si le mot est dans la liste
    if (wordsList.includes(submittedWord)) {
        // Mot valide
        usedWords.add(submittedWord);
        
        // Calculer le score
        const wordScore = submittedWord.length * 10;
        score += wordScore * combo;
        
        // Mettre à jour le combo
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        
        // Mettre à jour l'affichage
        scoreDisplay.textContent = `Score: ${score}`;
        comboDisplay.textContent = `Combo: x${combo}`;
        
        // Afficher un message de succès
        showNotification(`+${wordScore * combo} points !`, "success");
        
        // Vider le champ de saisie
        wordInput.value = '';
        
        // Créer une explosion de particules au centre
        if (typeof createParticleExplosion === 'function') {
            createParticleExplosion(new THREE.Vector3(0, 0, 0), 0x4CAF50);
        }
        
        // Afficher le texte de combo
        if (combo > 1 && typeof showComboText === 'function') {
            showComboText(combo, new THREE.Vector3(0, 0, 0));
        }
    } else {
        // Mot invalide
        showNotification("Mot invalide !", "error");
        shakeInput();
        
        // Réinitialiser le combo
        combo = 1;
        comboDisplay.textContent = `Combo: x${combo}`;
    }
}

// Animation de secousse pour l'input en cas d'erreur
function shakeInput() {
    // Vérifier si l'élément existe
    if (!wordInput) return;
    
    // Ajouter la classe d'animation
    wordInput.classList.add('shake');
    
    // Supprimer la classe après l'animation
    setTimeout(() => {
        wordInput.classList.remove('shake');
    }, 500);
    
    // Vider le champ de saisie
    wordInput.value = '';
    wordInput.focus();
}

// ===== DÉMARRAGE ET GESTION DU JEU =====
function startGame() {
    console.log("Démarrage du jeu...");
    
    // Vérifier si les mots sont chargés
    if (wordsList.length === 0) {
        console.log("Aucun mot chargé, chargement en cours...");
        showNotification("Chargement des mots en cours...", "warning");
        loadWords().then(() => {
            if (wordsList.length > 0) {
                console.log(`${wordsList.length} mots chargés, démarrage du jeu...`);
                startGame(); // Réessayer après le chargement
            } else {
                console.error("Impossible de charger les mots");
                showNotification("Impossible de charger les mots. Veuillez rafraîchir la page.", "error");
            }
        });
        return;
    }
    
    // Vérifier si les éléments DOM nécessaires existent
    if (!startResetButton || !scoreDisplay || !comboDisplay || !timeDisplay || !wordInput) {
        console.error("Éléments DOM manquants pour démarrer le jeu");
        showNotification("Erreur d'initialisation du jeu", "error");
        return;
    }
    
    // Vérifier si Three.js est initialisé
    if (!scene || !camera || !renderer) {
        console.error("Three.js n'est pas initialisé");
        showNotification("Initialisation de Three.js...", "warning");
        
        // Essayer de réinitialiser Three.js
        console.log("Tentative d'initialisation de Three.js...");
        const success = initThreeJS();
        
        // Vérifier à nouveau
        if (!success || !scene || !camera || !renderer) {
            console.error("Échec de l'initialisation de Three.js");
            showNotification("Erreur critique: Three.js non disponible. Veuillez rafraîchir la page.", "error");
            return;
        }
        
        console.log("Three.js initialisé avec succès");
    }
    
    // Vérifier le conteneur de jeu
    const container = document.getElementById('word-box');
    if (!container) {
        console.error("Conteneur 'word-box' non trouvé");
        showNotification("Erreur: Conteneur de jeu non trouvé", "error");
        return;
    }
    
    // Vérifier les dimensions du conteneur
    if (container.clientWidth < 100 || container.clientHeight < 100) {
        console.warn("Dimensions du conteneur trop petites:", container.clientWidth, "x", container.clientHeight);
        container.style.height = "400px"; // Forcer une hauteur minimale
        console.log("Hauteur du conteneur forcée à 400px");
        
        // Mettre à jour le renderer avec les nouvelles dimensions
        if (renderer) {
            renderer.setSize(container.clientWidth, container.clientHeight);
            if (camera) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
            }
        }
    }
    
    // Réinitialiser l'état du jeu
    resetGame();
    
    // Mettre à jour l'interface
    if (startResetButton) {
        startResetButton.textContent = 'Réinitialiser';
        startResetButton.classList.remove('btn-primary');
        startResetButton.classList.add('btn-danger');
    }
    
    // Activer le jeu
    gameRunning = true;
    
    // Démarrer le chronomètre
    startTime = Date.now();
    gameInterval = setInterval(updateGameTime, 1000);
    
    // Générer les premières bulles
    console.log("Génération des premières bulles...");
    generateBubbles();
    
    // Créer des particules de démarrage
    if (typeof createParticleExplosion === 'function') {
        console.log("Création des particules de démarrage...");
        createParticleExplosion(new THREE.Vector3(0, 0, 0), 0x4CAF50);
    }
    
    // Afficher un message de démarrage
    showNotification("C'est parti !", "success");
    
    // Activer le champ de saisie
    if (wordInput) {
        wordInput.disabled = false;
        wordInput.focus();
    }
    
    // Démarrer l'animation
    if (typeof animate === 'function') {
        console.log("Démarrage de l'animation...");
        animate();
    } else {
        console.error("Fonction d'animation non trouvée");
        showNotification("Erreur: Animation non disponible", "error");
    }
    
    console.log("Jeu démarré !");
}

// Fonction pour afficher une notification à l'utilisateur
function showNotification(message, type = 'info', duration = 3000) {
    // Créer l'élément de notification s'il n'existe pas déjà
    let notification = document.getElementById('game-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'game-notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(notification);
    }
    
    // Définir le style en fonction du type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.backgroundColor = '#F44336';
            notification.style.color = 'white';
            break;
        case 'warning':
            notification.style.backgroundColor = '#FF9800';
            notification.style.color = 'white';
            break;
        default: // info
            notification.style.backgroundColor = '#2196F3';
            notification.style.color = 'white';
    }
    
    // Définir le message
    notification.textContent = message;
    notification.style.opacity = '1';
    
    // Faire disparaître la notification après la durée spécifiée
    clearTimeout(notification.timeoutId);
    notification.timeoutId = setTimeout(() => {
        notification.style.opacity = '0';
    }, duration);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Vérification de Firebase
    checkFirebaseInitialization();
    
    // Initialisation du jeu
    initGame();
    
    // Charger les meilleurs scores
    loadTopScores();
    
    // Afficher un message de bienvenue
    showNotification('Bienvenue dans Word Bubbles 3D !', 'info', 4000);
    
    // Ajout d'un écouteur pour les changements de mode/difficulté
    modeSelect.addEventListener('change', loadTopScores);
    difficultySelect.addEventListener('change', loadTopScores);
});

// Fonction pour vérifier l'initialisation de Firebase
function checkFirebaseInitialization() {
    // Variable globale pour indiquer si Firebase est disponible
    window.firebaseAvailable = false;
    
    try {
        // Vérifier si Firebase est défini
        if (typeof firebase === 'undefined') {
            console.warn("Firebase n'est pas défini. Les scores ne seront pas sauvegardés.");
            showNotification("Mode hors ligne : les scores ne seront pas sauvegardés", "warning", 5000);
            return false;
        }
        
        // Vérifier si Firestore est disponible
        if (typeof firebase.firestore === 'undefined') {
            console.warn("Firebase Firestore n'est pas disponible. Les scores ne seront pas sauvegardés.");
            showNotification("Mode hors ligne : les scores ne seront pas sauvegardés", "warning", 5000);
            return false;
        }
        
        // Essayer d'accéder à Firestore
        const db = firebase.firestore();
        if (!db) {
            console.warn("Impossible d'accéder à Firestore. Les scores ne seront pas sauvegardés.");
            showNotification("Mode hors ligne : les scores ne seront pas sauvegardés", "warning", 5000);
            return false;
        }
        
        // Si tout est OK, Firebase est disponible
        window.firebaseAvailable = true;
        console.log("Firebase initialisé avec succès.");
        return true;
    } catch (error) {
        console.error("Erreur lors de l'initialisation de Firebase:", error);
        showNotification("Mode hors ligne : les scores ne seront pas sauvegardés", "warning", 5000);
        return false;
    }
}

// Fonction pour mettre à jour les statistiques
function updateStats(finalScore, maxCombo, gameTime) {
    try {
        // Récupérer les statistiques existantes
        let stats = JSON.parse(localStorage.getItem('wordBubblesStats')) || {
            gamesPlayed: 0,
            totalScore: 0,
            highScore: 0,
            bestCombo: 0,
            fastestGame: Infinity
        };
        
        // Mettre à jour les statistiques
        stats.gamesPlayed++;
        stats.totalScore += finalScore;
        stats.highScore = Math.max(stats.highScore, finalScore);
        stats.bestCombo = Math.max(stats.bestCombo, maxCombo);
        
        // Mettre à jour le temps le plus rapide (seulement si le score est > 0)
        if (finalScore > 0 && gameTime < stats.fastestGame) {
            stats.fastestGame = gameTime;
        }
        
        // Sauvegarder les statistiques
        localStorage.setItem('wordBubblesStats', JSON.stringify(stats));
        
        // Afficher un message si un record a été battu
        if (finalScore >= stats.highScore) {
            showNotification("Nouveau record de score !", "success", 4000);
        }
        
        if (maxCombo >= stats.bestCombo) {
            showNotification("Nouveau record de combo !", "success", 4000);
        }
        
        if (finalScore > 0 && gameTime <= stats.fastestGame) {
            showNotification("Nouveau record de temps !", "success", 4000);
        }
        
        console.log("Statistiques mises à jour:", stats);
    } catch (error) {
        console.error("Erreur lors de la mise à jour des statistiques:", error);
        showNotification("Erreur lors de la mise à jour des statistiques", "error");
    }
}

// ===== GESTION DE LA FIN DU JEU ET RÉINITIALISATION =====
function resetGame() {
    console.log("Réinitialisation du jeu...");
    
    // Arrêter le jeu
    gameRunning = false;
    
    // Arrêter le chronomètre
    clearInterval(gameInterval);
    
    // Réinitialiser les variables de jeu
    score = 0;
    combo = 1;
    maxCombo = 1;
    currentTime = 0;
    startTime = 0;
    
    // Vider les tableaux de suivi
    usedWords = new Set();
    
    // Réinitialiser l'interface
    if (scoreDisplay) scoreDisplay.textContent = 'Score: 0';
    if (comboDisplay) comboDisplay.textContent = 'Combo: x1';
    if (timeDisplay) timeDisplay.textContent = 'Temps: 0:00';
    if (wordInput) {
        wordInput.value = '';
        wordInput.disabled = true;
    }
    
    // Réinitialiser le bouton
    if (startResetButton) {
        startResetButton.textContent = 'Démarrer';
        startResetButton.classList.remove('btn-danger');
        startResetButton.classList.add('btn-primary');
    }
    
    // Nettoyer la scène 3D
    clearScene();
    
    // Afficher un message
    showNotification("Jeu réinitialisé", "info");
    
    console.log("Jeu réinitialisé");
}

// Fonction pour nettoyer la scène 3D
function clearScene() {
    console.log("Nettoyage de la scène...");
    
    // Vérifier si la scène existe
    if (!scene) {
        console.error("La scène n'existe pas");
        return;
    }
    
    // Supprimer toutes les bulles de la scène
    if (bubbleObjects && bubbleObjects.length > 0) {
        bubbleObjects.forEach(bubble => {
            // Supprimer tous les enfants (sprites, etc.)
            while (bubble.children.length > 0) {
                const child = bubble.children[0];
                bubble.remove(child);
                
                // Disposer des géométries et matériaux si nécessaire
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
            
            // Supprimer la bulle de la scène
            scene.remove(bubble);
            
            // Disposer des géométries et matériaux
            if (bubble.geometry) bubble.geometry.dispose();
            if (bubble.material) {
                if (Array.isArray(bubble.material)) {
                    bubble.material.forEach(material => material.dispose());
                } else {
                    bubble.material.dispose();
                }
            }
        });
        
        // Vider le tableau des bulles
        bubbleObjects = [];
    }
    
    console.log("Scène nettoyée");
}

function gameOver() {
    // Vérifier si le jeu est déjà terminé
    if (!gameRunning) return;
    
    console.log("Fin du jeu");
    
    // Arrêter le jeu
    gameRunning = false;
    
    // Arrêter le chronomètre
    clearInterval(gameInterval);
    
    // Afficher un message de fin de jeu
    showNotification("Partie terminée !", "error", 5000);
    
    // Mettre à jour l'interface
    if (startResetButton) {
        startResetButton.textContent = 'Démarrer';
        startResetButton.classList.remove('btn-danger');
        startResetButton.classList.add('btn-primary');
    }
    
    // Désactiver le champ de saisie
    if (wordInput) {
        wordInput.disabled = true;
    }
    
    // Créer des particules de fin de jeu
    if (typeof createParticleExplosion === 'function') {
        for (let i = 0; i < 5; i++) {
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            createParticleExplosion(position, 0xff0000);
        }
    }
    
    // Sauvegarder le score
    if (score > 0 && typeof saveScoreToFirebase === 'function') {
        setTimeout(() => {
            if (confirm("Voulez-vous sauvegarder votre score?")) {
                saveScoreToFirebase(score, maxCombo, currentTime);
            }
        }, 1000);
    }
    
    // Nettoyer la scène après un délai
    setTimeout(() => {
        clearScene();
    }, 3000);
}

// ===== SAUVEGARDE DES SCORES =====
function saveScoreToFirebase(finalScore, maxCombo, gameTime) {
    console.log(`Tentative de sauvegarde du score: ${finalScore}`);
    
    // Vérifier si Firebase est disponible
    if (!window.firebase || !window.firebaseAvailable) {
        console.log("Score non sauvegardé : Firebase n'est pas disponible");
        showNotification("Mode hors ligne : score non sauvegardé", "warning");
        return Promise.resolve(); // Retourner une promesse résolue pour la compatibilité
    }
    
    // Demande du nom du joueur
    const playerName = prompt("Entrez votre nom pour sauvegarder votre score:");
    if (!playerName) {
        showNotification("Sauvegarde annulée", "info");
        return Promise.resolve();
    }
    
    try {
        const db = firebase.firestore();
        const currentMode = document.getElementById('game-mode')?.value || 'normal';
        const currentDifficulty = document.getElementById('difficulty-level')?.value || 'medium';
        
        return db.collection("word-bubbles-scores").add({
            playerName: playerName,
            score: finalScore,
            combo: maxCombo,
            gameTime: gameTime,
            mode: currentMode,
            difficulty: currentDifficulty,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("Score sauvegardé avec succès !");
            showNotification("Score sauvegardé !", "success");
            // Recharger les meilleurs scores après la sauvegarde
            if (typeof loadTopScores === 'function') {
                loadTopScores();
            }
        })
        .catch((error) => {
            console.error("Erreur lors de la sauvegarde du score:", error);
            showNotification("Erreur lors de la sauvegarde du score", "error");
        });
    } catch (error) {
        console.error("Erreur lors de l'accès à Firebase:", error);
        showNotification("Impossible de sauvegarder le score", "error");
        return Promise.resolve(); // Retourner une promesse résolue pour la compatibilité
    }
}