/**
 * Word Bubbles 3D - English Quest
 * Un jeu immersif pour apprendre l'anglais dans un univers MMORPG
 */

// Vérifier si Three.js est correctement chargé
console.log("Chargement de word-bubbles.js...");
if (typeof THREE === 'undefined') {
    console.error("Three.js n'est pas chargé. Le jeu ne fonctionnera pas correctement.");
    alert("Erreur: Three.js n'est pas chargé. Veuillez rafraîchir la page ou vérifier votre connexion internet.");
} else {
    console.log("Three.js est correctement chargé:", THREE.REVISION);
}

// ===== INITIALISATION THREE.JS =====
let scene, camera, renderer;
let bubbleObjects = []; // Objets 3D pour les bulles
let raycaster, mouse;
let clock = new THREE.Clock();
let fontLoader = new THREE.FontLoader(); // Ajout d'un chargeur de police pour le texte 3D

// ===== VARIABLES DE JEU =====
// Remplacer les anciennes références par les nouvelles
const gameContainer = document.getElementById('gameCanvas');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('timer');
const livesDisplay = document.getElementById('lives');
const wordInput = document.getElementById('wordInput');
const submitButton = document.getElementById('submitButton');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const helpButton = document.getElementById('helpButton');
const accuracyDisplay = document.getElementById('accuracy');
const accuracyBar = document.getElementById('accuracyBar');
const speedDisplay = document.getElementById('speed');
const speedBar = document.getElementById('speedBar');
const capturedWordsContainer = document.getElementById('capturedWords');

// Variables d'état du jeu
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let gameTimer = null;
let bubbleGeneratorTimer = null; // Timer pour générer des bulles périodiquement
let score = 0;
let combo = 0;
let timeLeft = 60;
let wordsList = []; // Liste des mots pour le jeu

// Paramètres d'animation avancés
const ANIMATION_PARAMS = {
    // Paramètres de mouvement
    FLOAT_AMPLITUDE: { MIN: 0.05, MAX: 0.15 },
    FLOAT_FREQUENCY: { MIN: 0.5, MAX: 1.2 },
    ROTATION_SPEED: { MIN: 0.001, MAX: 0.005 },
    
    // Paramètres de difficulté
    SPEED_FACTORS: {
        easy: { BASE: 0.2, VARIANCE: 0.1, MAX_SPEED: 0.4 },
        medium: { BASE: 0.4, VARIANCE: 0.15, MAX_SPEED: 0.7 },
        hard: { BASE: 0.6, VARIANCE: 0.2, MAX_SPEED: 1.0 }
    },
    
    // Paramètres d'effets visuels
    PULSE: {
        SPEED: { MIN: 0.8, MAX: 1.5 },
        AMPLITUDE: { MIN: 0.05, MAX: 0.12 }
    },
    
    // Paramètres de comportement
    AVOIDANCE_RADIUS: 2.5,
    AVOIDANCE_STRENGTH: 0.3,
    ATTRACTION_STRENGTH: 0.05,
    
    // Paramètres de durée de vie
    MIN_LIFETIME: 15, // Secondes minimum avant de pouvoir sortir de l'écran
    
    // Paramètres d'entrée en scène
    ENTRY_DURATION: 2.0,
    ENTRY_BOUNCE_HEIGHT: 0.8
};

// ===== INITIALISATION DU JEU =====
function initGame() {
    console.log("Initialisation du jeu...");
    
    // Vérifier si le conteneur de jeu existe
    const gameCanvas = document.getElementById('gameCanvas');
    console.log("Canvas de jeu 'gameCanvas' trouvé:", !!gameCanvas);
    if (!gameCanvas) {
        console.error("Canvas de jeu 'gameCanvas' non trouvé");
        alert("Erreur: Conteneur de jeu non trouvé. Veuillez rafraîchir la page.");
        return;
    }
    
    console.log("Canvas de jeu trouvé, dimensions:", gameCanvas.clientWidth, "x", gameCanvas.clientHeight);
    
    // Initialiser les références aux éléments DOM
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('timer');
    const livesDisplay = document.getElementById('lives');
    const wordInput = document.getElementById('wordInput');
    const submitButton = document.getElementById('submitButton');
    const startButton = document.getElementById('startButton');
    
    // Vérifier si les éléments essentiels existent
    console.log("Éléments DOM trouvés:", {
        scoreDisplay: !!scoreDisplay,
        timeDisplay: !!timeDisplay,
        livesDisplay: !!livesDisplay,
        wordInput: !!wordInput,
        submitButton: !!submitButton,
        startButton: !!startButton
    });
    
    if (!startButton) {
        console.error("Bouton de démarrage non trouvé");
        alert("Erreur d'initialisation du jeu : bouton de démarrage manquant");
        return;
    }
    
    // Initialiser Three.js
    console.log("Initialisation de Three.js...");
    const threeJsInitialized = initThreeJS();
    console.log("Three.js initialisé:", threeJsInitialized);
    
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
    });
    
    // Configurer les écouteurs d'événements
    console.log("Configuration des écouteurs d'événements...");
    
    // Configurer le bouton de démarrage
    if (startButton) {
        startButton.addEventListener('click', function() {
            console.log("Bouton start cliqué, état du jeu:", gameRunning);
            if (!gameRunning) {
                startGame();
            }
        });
        console.log("Écouteur d'événement ajouté au bouton start");
    }
    
    // Configurer le bouton de pause
    if (pauseButton) {
        pauseButton.addEventListener('click', function() {
            console.log("Bouton pause cliqué");
            togglePause();
        });
        console.log("Écouteur d'événement ajouté au bouton pause");
    }
    
    // Configurer le bouton d'aide
    if (helpButton) {
        helpButton.addEventListener('click', function() {
            console.log("Bouton aide cliqué");
            showHelp();
        });
        console.log("Écouteur d'événement ajouté au bouton aide");
    }
    
    // Configurer le bouton de soumission
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            console.log("Bouton de soumission cliqué");
            if (typeof checkWord === 'function') {
                checkWord();
            } else {
                console.error("La fonction checkWord n'est pas définie");
            }
        });
        console.log("Écouteur d'événement ajouté au bouton de soumission");
    }
    
    // Configurer le champ de saisie
    if (wordInput) {
        wordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log("Touche Entrée pressée dans le champ de saisie");
                if (typeof checkWord === 'function') {
                    checkWord();
                } else {
                    console.error("La fonction checkWord n'est pas définie");
                }
            }
        });
        console.log("Écouteur d'événement ajouté au champ de saisie");
    }
    
    // Afficher un message de bienvenue
    if (typeof showNotification === 'function') {
        showNotification("Bienvenue dans Word Bubbles: The Arcane Lexicon !", "info", 5000);
    }
    
    console.log("Initialisation du jeu terminée avec succès");
}

// ===== INITIALISATION THREE.JS =====
function initThreeJS() {
    console.log("Initialisation de Three.js...");
    
    // Vérifier si Three.js est disponible
    if (typeof THREE === 'undefined') {
        console.error("Three.js n'est pas disponible");
        alert("Erreur: Three.js n'est pas disponible. Veuillez rafraîchir la page.");
        return false;
    }
    
    // Vérifier si le conteneur existe
    const container = document.getElementById('gameCanvas');
    if (!container) {
        console.error("Canvas 'gameCanvas' non trouvé");
        alert("Erreur: Canvas de jeu non trouvé. Veuillez recharger la page.");
        return false;
    }
    
    console.log("Canvas trouvé, dimensions:", container.clientWidth, "x", container.clientHeight);
    
    // Vérifier les dimensions du conteneur
    if (container.clientWidth < 100 || container.clientHeight < 100) {
        console.error("Dimensions du conteneur trop petites:", container.clientWidth, "x", container.clientHeight);
        container.style.height = "400px"; // Forcer une hauteur minimale
        console.log("Hauteur du conteneur ajustée à 400px");
    }
    
    try {
        // Créer la scène
        scene = new THREE.Scene();
        console.log("Scène créée");
        
        // Ajouter un fond élégant à la scène
        const bgGeometry = new THREE.PlaneGeometry(100, 100);
        const bgTexture = createGradientTexture(
            [
                { stop: 0.0, color: new THREE.Color(0x0a1832) },
                { stop: 0.5, color: new THREE.Color(0x152a4a) },
                { stop: 1.0, color: new THREE.Color(0x0a1832) }
            ]
        );
        const bgMaterial = new THREE.MeshBasicMaterial({
            map: bgTexture,
            transparent: true,
            opacity: 0.8
        });
        const background = new THREE.Mesh(bgGeometry, bgMaterial);
        background.position.z = -10;
        scene.add(background);
        
        // Ajouter des particules d'ambiance subtiles
        addSubtleBackgroundParticles();
        
        // Créer la caméra
        const aspectRatio = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        camera.position.z = 15;
        console.log("Caméra créée");
        
        // Créer le renderer
        renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Vider le conteneur avant d'ajouter le renderer
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        container.appendChild(renderer.domElement);
        console.log("Renderer créé et ajouté au conteneur");
        
        // Créer le raycaster pour l'interaction
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        console.log("Raycaster créé");
        
        // Ajouter des lumières
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x6495ED, 1, 100); // Bleu cornflower
        pointLight.position.set(0, 0, 10);
        scene.add(pointLight);
        console.log("Lumières ajoutées à la scène");
        
        // Configurer les écouteurs d'événements pour le renderer
        window.addEventListener('resize', onWindowResize, false);
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('click', onBubbleClick, false);
        console.log("Écouteurs d'événements ajoutés");
        
        // Initialiser l'horloge pour les animations
        if (!clock) {
            clock = new THREE.Clock();
        }
        
        // Initialiser le chargeur de police
        if (!fontLoader) {
            fontLoader = new THREE.FontLoader();
        }
        
        // Démarrer la boucle d'animation
        animate();
        console.log("Boucle d'animation démarrée");
        
        // Rendre la scène une fois pour vérifier
        renderer.render(scene, camera);
        
        return true;
    } catch (error) {
        console.error("Erreur lors de l'initialisation de Three.js:", error);
        alert("Erreur: Three.js n'a pas pu être initialisé. Veuillez recharger la page.");
        return false;
    }
}

/**
 * Crée une texture de dégradé
 * @param {Array} colorStops - Tableau d'objets {stop, color}
 * @returns {THREE.CanvasTexture} La texture créée
 */
function createGradientTexture(colorStops) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    
    colorStops.forEach(stop => {
        gradient.addColorStop(stop.stop, `rgb(${Math.floor(stop.color.r * 255)}, ${Math.floor(stop.color.g * 255)}, ${Math.floor(stop.color.b * 255)})`);
    });
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    return new THREE.CanvasTexture(canvas);
}

/**
 * Ajoute des particules subtiles en arrière-plan
 */
function addSubtleBackgroundParticles() {
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        // Position aléatoire dans un espace 3D large mais plat
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = -9 + Math.random() * 2; // Juste devant le fond
        
        // Taille aléatoire
        sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Créer une texture pour les particules
    const particleTexture = createParticleTexture(true); // Version plus subtile
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.3,
        map: particleTexture,
        transparent: true,
        opacity: 0.4,
        color: 0x6495ED, // Bleu cornflower
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Stocker les particules pour l'animation
    scene.userData.backgroundParticles = particles;
}

// Fonction pour ajouter un effet de halo lumineux à une lettre
function addLetterGlowEffect(letterGroup) {
    // Créer un disque de halo principal
    const glowGeometry = new THREE.CircleGeometry(1.5, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4d80e4,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    const glowDisc = new THREE.Mesh(glowGeometry, glowMaterial);
    glowDisc.rotation.x = Math.PI / 2;
    glowDisc.position.z = 0.03;
    letterGroup.add(glowDisc);
    
    // Créer un halo extérieur plus grand
    const outerGlowGeometry = new THREE.CircleGeometry(2.0, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3366cc,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    
    const outerGlowDisc = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    outerGlowDisc.rotation.x = Math.PI / 2;
    outerGlowDisc.position.z = 0.02;
    letterGroup.add(outerGlowDisc);
    
    // Créer un halo lointain encore plus grand
    const farGlowGeometry = new THREE.CircleGeometry(2.5, 32);
    const farGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a4db2,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    const farGlowDisc = new THREE.Mesh(farGlowGeometry, farGlowMaterial);
    farGlowDisc.rotation.x = Math.PI / 2;
    farGlowDisc.position.z = 0.01;
    letterGroup.add(farGlowDisc);
    
    // Ajouter un effet de lens flare
    const lensFlareGeometry = new THREE.CircleGeometry(0.8, 16);
    const lensFlareMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    
    const lensFlare = new THREE.Mesh(lensFlareGeometry, lensFlareMaterial);
    lensFlare.rotation.x = Math.PI / 2;
    lensFlare.position.z = -0.2;
    letterGroup.add(lensFlare);
    
    // Stocker les éléments de halo dans userData pour l'animation
    letterGroup.userData.glowElements = {
        mainGlow: glowDisc,
        outerGlow: outerGlowDisc,
        farGlow: farGlowDisc,
        lensFlare: lensFlare
    };
    
    return letterGroup;
}

// Fonction pour ajouter un terrain de style fantasy/MMORPG
function addFantasyTerrain() {
    // Créer un terrain stylisé avec une géométrie plane
    const terrainGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    
    // Créer un matériau pour le terrain avec une texture de base
    const terrainMaterial = new THREE.MeshStandardMaterial({
        color: 0x223344,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    
    // Créer le mesh du terrain
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2; // Orienter horizontalement
    terrain.position.y = -15; // Positionner en bas de la scène
    terrain.receiveShadow = true;
    
    // Ajouter un effet de grille lumineux pour simuler un terrain magique
    const gridGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x3366ff,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -14.9; // Légèrement au-dessus du terrain
    
    // Ajouter le terrain et la grille à la scène
    scene.add(terrain);
    scene.add(grid);
    
    // Stocker les références pour l'animation
    scene.userData.terrain = terrain;
    scene.userData.grid = grid;
    
    // Ajouter des cristaux flottants
    const crystalCount = 8;
    
    for (let i = 0; i < crystalCount; i++) {
        // Créer un cristal avec une géométrie d'octaèdre
        const crystalGeometry = new THREE.OctahedronGeometry(Math.random() * 0.5 + 0.5, 0);
        
        // Matériau cristallin semi-transparent
        const crystalMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(Math.random() * 0.3, Math.random() * 0.3 + 0.5, Math.random() * 0.5 + 0.5),
            roughness: 0.2,
            metalness: 0.9,
            transparent: true,
            opacity: 0.7,
            transmission: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        
        // Positionner aléatoirement autour de la scène
        const angle = (i / crystalCount) * Math.PI * 2;
        const radius = Math.random() * 10 + 20;
        crystal.position.x = Math.cos(angle) * radius;
        crystal.position.y = Math.sin(Math.random() * Math.PI * 2) * 5 - 10;
        crystal.position.z = Math.sin(angle) * radius;
        
        // Rotation aléatoire
        crystal.rotation.x = Math.random() * Math.PI;
        crystal.rotation.y = Math.random() * Math.PI;
        crystal.rotation.z = Math.random() * Math.PI;
        
        // Ajouter des données pour l'animation
        crystal.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: Math.random() * 0.5 + 0.5,
            floatHeight: Math.random() * 0.5 + 0.5,
            initialY: crystal.position.y
        };
        
        scene.add(crystal);
        
        // Stocker les cristaux pour l'animation
        if (!scene.userData.crystals) {
            scene.userData.crystals = [];
        }
        scene.userData.crystals.push(crystal);
    }
    
    // Ajouter des piliers mystiques
    const pillarCount = 5;
    
    for (let i = 0; i < pillarCount; i++) {
        // Créer un pilier avec une géométrie cylindrique
        const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.7, 10, 8);
        
        // Matériau pour le pilier
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x334455,
            roughness: 0.7,
            metalness: 0.3,
            emissive: 0x112233,
            emissiveIntensity: 0.5
        });
        
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        
        // Positionner les piliers en cercle autour de la scène
        const angle = (i / pillarCount) * Math.PI * 2;
        const radius = 30;
        pillar.position.x = Math.cos(angle) * radius;
        pillar.position.y = -10; // Base au niveau du sol
        pillar.position.z = Math.sin(angle) * radius;
        
        // Ajouter un effet lumineux au sommet du pilier
        const glowGeometry = new THREE.SphereGeometry(1, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x66aaff,
            transparent: true,
            opacity: 0.7
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 5; // Positionner au sommet du pilier
        
        pillar.add(glow);
        scene.add(pillar);
        
        // Stocker les piliers pour l'animation
        if (!scene.userData.pillars) {
            scene.userData.pillars = [];
        }
        scene.userData.pillars.push(pillar);
    }
}

// Fonction pour créer une texture de lens flare
function createLensFlareTexture(variation = 0) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    // Fond transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Créer un dégradé radial pour le lens flare
    const gradient = context.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    
    // Couleurs légèrement différentes selon la variation
    const r = 255;
    const g = 255 - variation * 50;
    const b = 255 - variation * 100;
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
    gradient.addColorStop(0.1, `rgba(${r}, ${g}, ${b}, 0.6)`);
    gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.4)`);
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.2)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.1)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    // Dessiner le cercle avec le dégradé
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    context.fill();
    
    // Ajouter quelques rayons de lumière si c'est le lens flare principal
    if (variation < 0.1) {
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        
        for (let i = 0; i < 6; i++) {
            context.rotate(Math.PI / 3);
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(canvas.width, 0);
            
            const rayGradient = context.createLinearGradient(0, 0, canvas.width, 0);
            rayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            rayGradient.addColorStop(0.1, 'rgba(200, 220, 255, 0.2)');
            rayGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.05)');
            rayGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
            
            context.strokeStyle = rayGradient;
            context.lineWidth = 5;
            context.stroke();
        }
        
        context.restore();
    }
    
    // Créer la texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

// Fonction pour ajouter un effet de particules 3D à une lettre
function addParticlesEffect(letterGroup) {
    // Créer des particules qui orbitent autour de la lettre
    const particlesCount = 15;
    const particlesGeometry = new THREE.BufferGeometry();
    
    // Matériau scintillant pour les particules
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.08,
        transparent: true,
        opacity: 0.7,
        map: createParticleTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Positions des particules en orbite
    const particlesPositions = [];
    const particlesSpeeds = [];
    const particlesRadii = [];
    const particlesPhases = [];
    
    for (let i = 0; i < particlesCount; i++) {
        // Rayon de l'orbite
        const radius = 1.3 + Math.random() * 0.7;
        particlesRadii.push(radius);
        
        // Phase initiale aléatoire
        const phase = Math.random() * Math.PI * 2;
        particlesPhases.push(phase);
        
        // Vitesse de rotation aléatoire
        const speed = 0.5 + Math.random() * 1.5;
        particlesSpeeds.push(speed);
        
        // Position initiale sur l'orbite
        const x = Math.cos(phase) * radius;
        const y = Math.sin(phase) * radius;
        const z = (Math.random() - 0.5) * 0.5;
        
        particlesPositions.push(x, y, z);
    }
    
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesPositions, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.rotation.x = Math.PI / 2; // Orienter les particules correctement
    letterGroup.add(particles);
    
    // Stocker les données des particules pour l'animation
    letterGroup.userData.particles = {
        points: particles,
        speeds: particlesSpeeds,
        radii: particlesRadii,
        phases: particlesPhases
    };
}

// Fonction pour ajouter un effet de lens flare
function addLensFlare(x, y, z) {
    // Créer une texture pour le lens flare
    const lensFlareTexture = createLensFlareTexture();
    
    // Créer un sprite pour le lens flare principal
    const spriteMaterial = new THREE.SpriteMaterial({
        map: lensFlareTexture,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 4, 1);
    sprite.position.set(x, y, z);
    scene.add(sprite);
    
    // Ajouter des halos supplémentaires
    addLensFlareElement(60, 0.6, x * 0.8, y * 0.8, z * 0.8);
    addLensFlareElement(70, 0.3, x * 0.6, y * 0.6, z * 0.6);
    addLensFlareElement(120, 0.2, x * 0.4, y * 0.4, z * 0.4);
    addLensFlareElement(140, 0.1, x * 0.2, y * 0.2, z * 0.2);
    
    // Stocker les lens flares dans la scène pour l'animation
    if (!scene.userData.lensFlares) {
        scene.userData.lensFlares = [];
    }
    scene.userData.lensFlares.push(sprite);
}

// Fonction pour ajouter un élément de lens flare
function addLensFlareElement(size, opacity, x, y, z) {
    // Créer une texture pour le lens flare
    const lensFlareTexture = createLensFlareTexture(0.7); // Variation de la texture
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: lensFlareTexture,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, 1);
    sprite.position.set(x, y, z);
    scene.add(sprite);
    
    // Stocker les lens flares dans la scène pour l'animation
    if (!scene.userData.lensFlares) {
        scene.userData.lensFlares = [];
    }
    scene.userData.lensFlares.push(sprite);
}

// Fonction pour ajouter des particules d'ambiance
function addAmbientParticles() {
    // Créer un système de particules pour simuler de la poussière magique
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    
    // Créer les positions des particules
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Générer des particules dans un volume sphérique
    for (let i = 0; i < particleCount; i++) {
        // Position aléatoire dans une sphère
        const radius = 30 * Math.cbrt(Math.random()); // Distribution uniforme dans le volume
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta) - 5; // Centré un peu plus bas
        const z = radius * Math.cos(phi);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Couleur aléatoire avec dominante bleue
        colors[i * 3] = Math.random() * 0.3;       // R
        colors[i * 3 + 1] = Math.random() * 0.5;   // G
        colors[i * 3 + 2] = 0.5 + Math.random() * 0.5; // B
        
        // Taille aléatoire
        sizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    // Ajouter les attributs à la géométrie
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Créer une texture pour les particules
    const particleTexture = createParticleTexture();
    
    // Créer le matériau des particules
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        map: particleTexture,
        transparent: true,
        opacity: 0.6,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });
    
    // Créer le système de particules
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Stocker les particules pour l'animation
    scene.userData.ambientParticles = {
        points: particles,
        initialPositions: positions.slice(),
        velocities: new Float32Array(particleCount * 3).map(() => (Math.random() - 0.5) * 0.02)
    };
}

/**
 * Crée une texture de particule
 * @param {boolean} subtle - Si true, crée une particule plus subtile pour le fond
 * @returns {THREE.CanvasTexture} La texture créée
 */
function createParticleTexture(subtle = false) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    
    // Fond transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Créer un dégradé radial pour la particule
    const gradient = context.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    
    if (subtle) {
        // Version plus subtile pour les particules de fond
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        gradient.addColorStop(0.2, 'rgba(200, 220, 255, 0.5)');
        gradient.addColorStop(0.4, 'rgba(150, 180, 255, 0.3)');
        gradient.addColorStop(0.6, 'rgba(100, 150, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(50, 100, 255, 0)');
    } else {
        // Version standard pour les effets de particules
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.2, 'rgba(200, 220, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(150, 180, 255, 0.6)');
    gradient.addColorStop(0.6, 'rgba(100, 150, 255, 0.3)');
    gradient.addColorStop(0.8, 'rgba(50, 100, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 50, 255, 0)');
    }
    
    // Dessiner le cercle avec le dégradé
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    context.fill();
    
    // Créer la texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

// Fonction pour ajouter des anneaux de profondeur à une lettre
function addDepthRings(letterGroup) {
    // Ajouter plusieurs anneaux à différentes profondeurs pour créer un effet 3D
    const ringColors = [
        { color: 0x3366cc, emissive: 0x0033cc, z: -0.1, inner: 0.9, outer: 0.95 },
        { color: 0x1a4db2, emissive: 0x002299, z: -0.2, inner: 0.8, outer: 0.85 },
        { color: 0x0a3399, emissive: 0x001166, z: -0.3, inner: 0.7, outer: 0.75 },
        { color: 0x052680, emissive: 0x000033, z: -0.4, inner: 0.6, outer: 0.65 }
    ];
    
    ringColors.forEach(ringData => {
        const depthRingGeometry = new THREE.RingGeometry(ringData.inner, ringData.outer, 64);
        const depthRingMaterial = new THREE.MeshPhongMaterial({
            color: ringData.color,
            emissive: ringData.emissive,
            emissiveIntensity: 0.5,
            shininess: 100,
            specular: 0x3333ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        const depthRing = new THREE.Mesh(depthRingGeometry, depthRingMaterial);
        depthRing.rotation.x = Math.PI / 2;
        depthRing.position.z = ringData.z;
        letterGroup.add(depthRing);
    });
    
    // Ajouter un disque de fond pour compléter l'effet de profondeur
    const backDiscGeometry = new THREE.CircleGeometry(0.6, 64);
    const backDiscMaterial = new THREE.MeshPhongMaterial({
        color: 0x000033,
        emissive: 0x000022,
        emissiveIntensity: 0.5,
        shininess: 80,
        specular: 0x222266,
        side: THREE.DoubleSide
    });
    
    const backDisc = new THREE.Mesh(backDiscGeometry, backDiscMaterial);
    backDisc.rotation.x = Math.PI / 2;
    backDisc.position.z = -0.5;
    letterGroup.add(backDisc);
    
    return letterGroup;
}

// ===== FONCTIONS D'ANIMATION =====
function animate() {
    // Vérifier si les objets nécessaires existent
    if (!renderer || !scene || !camera) {
        console.error("Objets nécessaires pour l'animation non disponibles");
        return;
    }
    
    // Demander la prochaine frame d'animation
    requestAnimationFrame(animate);
    
    // Calculer le delta time
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    // Mettre à jour le temps du shader de fond
    if (scene.children[0] && scene.children[0].material && scene.children[0].material.uniforms) {
        scene.children[0].material.uniforms.time.value = elapsedTime;
    }
    
    // Animer les bulles
    animateBubbles(delta);
    
    // Animer les particules d'arrière-plan
    if (scene.userData.backgroundParticles) {
        const particles = scene.userData.backgroundParticles;
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Mouvement subtil des particules
            positions[i] += Math.sin(elapsedTime * 0.2 + i) * 0.001;
            positions[i + 1] += Math.cos(elapsedTime * 0.15 + i) * 0.001;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Faire scintiller légèrement les particules
        if (particles.material) {
            particles.material.opacity = 0.3 + Math.sin(elapsedTime * 0.5) * 0.1;
        }
    }
    
    // Rendre la scène
    renderer.render(scene, camera);
}

// Fonction pour animer les éléments du décor MMORPG
function animateMMORPGElements(delta, elapsedTime) {
    // Animer la grille du terrain
    if (scene.userData.grid) {
        scene.userData.grid.rotation.z += 0.0005 * delta * 60;
    }
    
    // Animer les cristaux flottants
    if (scene.userData.crystals) {
        scene.userData.crystals.forEach(crystal => {
            // Rotation continue
            crystal.rotation.x += crystal.userData.rotationSpeed.x * delta * 60;
            crystal.rotation.y += crystal.userData.rotationSpeed.y * delta * 60;
            crystal.rotation.z += crystal.userData.rotationSpeed.z * delta * 60;
            
            // Mouvement de flottement
            const floatOffset = Math.sin(elapsedTime * crystal.userData.floatSpeed) * crystal.userData.floatHeight;
            crystal.position.y = crystal.userData.initialY + floatOffset;
            
            // Effet de pulsation
            const scale = 1 + Math.sin(elapsedTime * 0.5 + crystal.userData.floatSpeed) * 0.05;
            crystal.scale.set(scale, scale, scale);
        });
    }
    
    // Animer les piliers mystiques
    if (scene.userData.pillars) {
        scene.userData.pillars.forEach((pillar, index) => {
            // Trouver la sphère lumineuse au sommet du pilier
            const glow = pillar.children[0];
            if (glow) {
                // Faire pulser la lumière
                const pulseScale = 1 + Math.sin(elapsedTime * 0.7 + index * 0.5) * 0.2;
                glow.scale.set(pulseScale, pulseScale, pulseScale);
                
                // Faire varier l'opacité
                if (glow.material) {
                    glow.material.opacity = 0.5 + Math.sin(elapsedTime * 0.5 + index * 0.7) * 0.2;
                }
            }
            
            // Faire tourner légèrement le pilier
            pillar.rotation.y += 0.001 * delta * 60;
        });
    }
}

// Fonction pour animer les particules ambiantes
function animateAmbientParticles(delta, elapsedTime) {
    if (scene.userData.ambientParticles && scene.userData.ambientParticles.points) {
        const particles = scene.userData.ambientParticles;
        const positions = particles.points.geometry.attributes.position;
        const initialPositions = particles.initialPositions;
        const velocities = particles.velocities;
        
        // Mettre à jour la position de chaque particule
        for (let i = 0; i < positions.count; i++) {
            const i3 = i * 3;
            
            // Mouvement de base
            positions.array[i3] += velocities[i3] * delta * 60;
            positions.array[i3 + 1] += velocities[i3 + 1] * delta * 60;
            positions.array[i3 + 2] += velocities[i3 + 2] * delta * 60;
            
            // Mouvement sinusoïdal supplémentaire
            const xOffset = Math.sin(elapsedTime * 0.5 + i * 0.1) * 0.02;
            const yOffset = Math.cos(elapsedTime * 0.3 + i * 0.05) * 0.02;
            const zOffset = Math.sin(elapsedTime * 0.7 + i * 0.02) * 0.02;
            
            positions.array[i3] += xOffset;
            positions.array[i3 + 1] += yOffset;
            positions.array[i3 + 2] += zOffset;
            
            // Réinitialiser la position si la particule s'éloigne trop
            const distance = Math.sqrt(
                Math.pow(positions.array[i3] - initialPositions[i3], 2) +
                Math.pow(positions.array[i3 + 1] - initialPositions[i3 + 1], 2) +
                Math.pow(positions.array[i3 + 2] - initialPositions[i3 + 2], 2)
            );
            
            if (distance > 10) {
                positions.array[i3] = initialPositions[i3] + (Math.random() - 0.5) * 5;
                positions.array[i3 + 1] = initialPositions[i3 + 1] + (Math.random() - 0.5) * 5;
                positions.array[i3 + 2] = initialPositions[i3 + 2] + (Math.random() - 0.5) * 5;
            }
        }
        
        // Faire scintiller les particules
        if (particles.points.material) {
            particles.points.material.opacity = 0.4 + Math.sin(elapsedTime * 2) * 0.2;
            particles.points.material.size = 0.5 + Math.sin(elapsedTime) * 0.1;
        }
        
        // Indiquer que les positions ont été modifiées
        positions.needsUpdate = true;
    }
}

// Fonction pour démarrer le jeu
function startGame() {
    console.log("Démarrage du jeu...");
    
    // Vérifier si le jeu est déjà en cours
    if (gameRunning) return;
    
    // Vérifier si la liste de mots est chargée
    if (!wordsList || wordsList.length === 0) {
        console.log("Liste de mots vide, chargement...");
        loadWords().then(() => {
            console.log(`${wordsList.length} mots chargés, démarrage du jeu...`);
            startGameAfterWordsLoaded();
        }).catch(error => {
            console.error("Erreur lors du chargement des mots:", error);
            if (typeof showNotification === 'function') {
                showNotification("Erreur lors du chargement des mots", "error");
            }
        });
    } else {
        startGameAfterWordsLoaded();
    }
    
    function startGameAfterWordsLoaded() {
        // Mettre à jour l'état du jeu
        gameRunning = true;
        gamePaused = false;
        gameOver = false;
        
        // Réinitialiser les statistiques
        score = 0;
        level = 1;
        lives = 3;
        timeLeft = 60; // 60 secondes par défaut
        totalAttempts = 0;
        correctAttempts = 0;
        typingSpeed = 0;
        capturedWords = [];
        startTime = Date.now();
        
        // Mettre à jour l'interface
        startButton.disabled = true;
        pauseButton.disabled = false;
        wordInput.disabled = false;
        submitButton.disabled = false;
        wordInput.focus();
        
        // Mettre à jour l'affichage
        updateStats();
        updateCapturedWords();
        
        // Vider le champ de saisie
            wordInput.value = '';
        
        // Démarrer le jeu Three.js
        if (window.ThreeBubbles) {
            window.ThreeBubbles.start(wordsList);
        }
        
        // Démarrer le timer
        console.log("Démarrage du timer...");
        if (gameTimer) {
            clearInterval(gameTimer);
            console.log("Timer précédent effacé");
        }
        gameTimer = setInterval(updateGameTime, 1000);
        console.log("Nouveau timer démarré");
        
        // Démarrer le générateur de bulles périodique
        if (bubbleGeneratorTimer) {
            clearInterval(bubbleGeneratorTimer);
        }
        
        // Définir l'intervalle pour générer de nouvelles bulles
        bubbleGeneratorTimer = setInterval(() => {
            if (gameRunning && !gamePaused && !gameOver && window.ThreeBubbles) {
                // Créer une nouvelle bulle
                const word = wordsList[Math.floor(Math.random() * wordsList.length)];
                window.ThreeBubbles.createOrb(word);
                console.log("Nouvelle bulle générée automatiquement");
            }
        }, 5000);
        
        // Notification de démarrage
        if (typeof showNotification === 'function') {
            showNotification(`Le jeu commence ! Tapez les mots qui apparaissent dans les orbes magiques.`, "success");
        }
        
        console.log("Jeu démarré avec succès");
    }
}

// Fonction pour mettre à jour les statistiques affichées
function updateStats() {
    // Mettre à jour le score
    if (scoreDisplay) {
        scoreDisplay.textContent = score;
    }
    
    // Mettre à jour le niveau
    if (document.getElementById('level')) {
        document.getElementById('level').textContent = level;
    }
    
    // Mettre à jour le temps
    if (timeDisplay) {
        timeDisplay.textContent = timeLeft;
    }
    
    // Mettre à jour les vies
    if (livesDisplay) {
        livesDisplay.textContent = lives;
    }
    
    // Mettre à jour la précision
    if (accuracyDisplay && accuracyBar) {
        const accuracyValue = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
        accuracyDisplay.textContent = accuracyValue + '%';
        accuracyBar.style.width = accuracyValue + '%';
    }
    
    // Mettre à jour la vitesse de frappe
    if (speedDisplay && speedBar) {
        const timeElapsed = (Date.now() - startTime) / 60000; // en minutes
        const speedValue = timeElapsed > 0 ? Math.round(correctAttempts / timeElapsed) : 0;
        speedDisplay.textContent = speedValue + ' mpm';
        speedBar.style.width = Math.min(speedValue * 2, 100) + '%';
    }
}

// Fonction pour mettre à jour la liste des mots capturés
function updateCapturedWords() {
    if (!capturedWordsContainer) return;
    
    capturedWordsContainer.innerHTML = '';
    
    if (capturedWords.length === 0) {
        capturedWordsContainer.innerHTML = '<div class="empty-list-message">Aucun mot capturé</div>';
        return;
    }
    
    // Affichage des 10 derniers mots capturés
    const wordsToShow = capturedWords.slice(0, 10);
    wordsToShow.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'captured-word';
        wordElement.textContent = word;
        capturedWordsContainer.appendChild(wordElement);
    });
}

// Fonction pour mettre à jour le temps de jeu
function updateGameTime() {
    if (!gameRunning || gamePaused || gameOver) {
        return;
    }
    
    timeLeft--;
    
    // Mettre à jour l'affichage du temps
    if (timeDisplay) {
        timeDisplay.textContent = timeLeft;
        
        // Ajouter une classe pour l'animation lorsque le temps est faible
        if (timeLeft <= 10) {
            timeDisplay.classList.add('time-low');
        } else {
            timeDisplay.classList.remove('time-low');
        }
    }
    
    // Vérifier si le temps est écoulé
    if (timeLeft <= 0) {
        endGame();
    }
}

// Fonction pour vérifier le mot saisi
function checkWord() {
    console.log("Vérification du mot saisi...");
    
    // Vérifier si le jeu est en cours
    if (!gameRunning || gamePaused || gameOver) {
        console.log("Le jeu n'est pas en cours, impossible de vérifier le mot");
        if (typeof showNotification === 'function') {
            showNotification("Le jeu n'est pas en cours", "warning");
        }
        return;
    }
    
    // Récupérer le mot saisi
    if (!wordInput) {
        console.error("Champ de saisie non trouvé");
        return;
    }
    
    const word = wordInput.value.trim().toLowerCase();
    console.log("Mot saisi :", word);
    
    // Vérifier si le mot est vide
    if (word.length === 0) {
        console.log("Aucun mot saisi");
        return;
    }
    
    totalAttempts++;
    let wordFound = false;
    let matchedOrb = null;
    
    // Vérifier si le mot correspond à un orbe
    if (window.ThreeBubbles && window.ThreeBubbles.orbs) {
        for (let i = 0; i < window.ThreeBubbles.orbs.length; i++) {
            const orb = window.ThreeBubbles.orbs[i];
            if (orb.userData && orb.userData.word && orb.userData.word.toLowerCase() === word) {
                wordFound = true;
                matchedOrb = orb;
                break;
            }
        }
    }
    
    if (wordFound && matchedOrb) {
        // Mot trouvé
        correctAttempts++;
        
        // Ajout du score
        const pointsEarned = 10 + (level * 5);
        score += pointsEarned;
        
        // Ajout du mot capturé
        capturedWords.unshift(word);
        updateCapturedWords();
        
        // Effet visuel pour l'orbe capturé
        if (matchedOrb.position) {
            createCaptureEffect(matchedOrb.position.x, matchedOrb.position.y, pointsEarned);
        }
        
        // Supprimer l'orbe
        if (window.ThreeBubbles) {
            window.ThreeBubbles.removeOrb(matchedOrb);
        }
        
        // Notification de succès
        if (typeof showNotification === 'function') {
            showNotification(`Mot correct : +${pointsEarned} points !`, "success");
        }
    } else {
        // Mot non trouvé
        if (typeof showNotification === 'function') {
            showNotification(`Mot non trouvé dans les orbes`, "error");
        }
    }
    
    // Mise à jour des statistiques
    updateStats();
    
    // Vérification du niveau
    checkLevelUp();
    
    // Réinitialisation du champ de saisie
    wordInput.value = '';
    
    // Effet visuel pour le résultat
    if (wordFound) {
        wordInput.classList.add('correct');
        setTimeout(() => wordInput.classList.remove('correct'), 500);
    } else {
        wordInput.classList.add('shake');
        setTimeout(() => wordInput.classList.remove('shake'), 500);
    }
}

// Vérification du passage au niveau supérieur
function checkLevelUp() {
    const scoreThreshold = level * 100;
    
    if (score >= scoreThreshold) {
        level++;
        timeLeft += 30; // Bonus de temps
        
        // Mise à jour des statistiques
    updateStats();
    
        // Affichage de la modale de niveau supérieur
        showLevelUpModal();
    }
}

// Fonction pour terminer le jeu
function endGame() {
    console.log("Fin du jeu");
    
    // Arrêter le timer
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    // Arrêter le générateur de bulles
    if (bubbleGeneratorTimer) {
        clearInterval(bubbleGeneratorTimer);
        bubbleGeneratorTimer = null;
        console.log("Générateur de bulles arrêté");
    }
    
    // Mettre à jour l'état du jeu
    gameRunning = false;
    gameOver = true;
    
    // Mettre à jour l'interface
    startButton.disabled = false;
    pauseButton.disabled = true;
    wordInput.disabled = true;
    submitButton.disabled = true;
    
    // Arrêter le jeu Three.js
    if (window.ThreeBubbles) {
        window.ThreeBubbles.stop();
    }
    
    // Affichage de la modale de fin de jeu
    showGameOverModal();
}

// Mise en pause du jeu
function togglePause() {
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        pauseButton.querySelector('.button-text').textContent = 'Reprendre';
        wordInput.disabled = true;
        submitButton.disabled = true;
    } else {
        pauseButton.querySelector('.button-text').textContent = 'Pause';
        wordInput.disabled = false;
        submitButton.disabled = false;
        wordInput.focus();
    }
}

// Affichage de la modale de fin de jeu
function showGameOverModal() {
    const modal = document.getElementById('gameOverModal');
    
    // Mise à jour des statistiques finales
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalWords').textContent = capturedWords.length;
    
    // Affichage de la modale
    modal.style.display = 'block';
}

// Affichage de la modale de niveau supérieur
function showLevelUpModal() {
    const modal = document.getElementById('levelUpModal');
    
    // Mise à jour des informations
    document.getElementById('newLevel').textContent = level;
    
    // Détermination de la récompense débloquée
    let rewardName, rewardDescription, rewardIcon;
    
    switch (level) {
        case 2:
            rewardName = 'Boost de vitesse';
            rewardDescription = 'Augmente temporairement votre vitesse de frappe, vous permettant de saisir les mots plus rapidement.';
            rewardIcon = 'speed-boost';
            break;
        case 3:
            rewardName = 'Gel du temps';
            rewardDescription = 'Arrête temporairement la descente des orbes, vous donnant plus de temps pour saisir les mots.';
            rewardIcon = 'time-freeze';
            break;
        case 4:
            rewardName = 'Révélation';
            rewardDescription = 'Révèle automatiquement un mot difficile, le faisant disparaître de l\'écran.';
            rewardIcon = 'word-reveal';
            break;
        case 5:
            rewardName = 'Vie supplémentaire';
            rewardDescription = 'Vous accorde une vie supplémentaire, vous permettant de faire une erreur de plus.';
            rewardIcon = 'extra-life';
            break;
        default:
            rewardName = 'Bonus de temps';
            rewardDescription = 'Vous avez gagné 30 secondes supplémentaires!';
            rewardIcon = 'time-freeze';
    }
    
    document.getElementById('rewardName').textContent = rewardName;
    document.getElementById('rewardDescription').textContent = rewardDescription;
    document.getElementById('unlockedReward').className = `reward-icon large ${rewardIcon}`;
    
    // Mise à jour de l'affichage des récompenses débloquées
    updateUnlockedRewards();
    
    // Affichage de la modale
    modal.style.display = 'block';
    
    // Mise en pause du jeu
    gamePaused = true;
}

// Affichage de la modale d'aide
function showHelp() {
    const modal = document.getElementById('helpModal');
    modal.style.display = 'block';
    
    // Réinitialisation des onglets
    switchTab('basics');
}

// Changement d'onglet dans l'aide
function switchTab(tabId) {
    // Désactivation de tous les onglets
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Activation de l'onglet sélectionné
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}Tab`).classList.add('active');
}

// Fermeture des modales
function closeModal() {
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('levelUpModal').style.display = 'none';
    document.getElementById('helpModal').style.display = 'none';
    
    // Reprise du jeu si en pause à cause du niveau supérieur
    if (gameRunning && gamePaused) {
        gamePaused = false;
        wordInput.disabled = false;
        submitButton.disabled = false;
        wordInput.focus();
    }
}

/**
 * Charge la liste des mots depuis un fichier JSON.
 * @returns {Promise} Une promesse qui se résout lorsque les mots sont chargés.
 */
async function loadWords() {
    try {
        const response = await fetch('https://www.englishquest.me/data/filtered_words.json');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.words && Array.isArray(data.words)) {
            // Filtrer les mots pour ne garder que ceux de longueur appropriée
            wordsList = data.words
                .filter(word => word.length >= 3 && word.length <= 12)
                .map(word => word.toLowerCase());
            
            console.log(`${wordsList.length} mots chargés et filtrés`);
            return wordsList;
        } else {
            throw new Error("Format de données invalide");
        }
    } catch (error) {
        console.error("Erreur lors du chargement des mots:", error);
        // Charger une liste de secours en cas d'échec
        wordsList = [
            "game", "play", "word", "bubble", "score", "level", "time", 
            "bonus", "point", "combo", "letter", "spell", "language",
            "grammar", "syntax", "phrase", "sentence", "learn", "education",
            "knowledge", "vocabulary", "dictionary", "meaning", "definition"
        ];
        console.log("Liste de secours chargée avec " + wordsList.length + " mots");
        return wordsList;
    }
}

/**
 * Fonction de débogage pour vérifier l'état global du jeu
 */
function debugGameState() {
    console.group("État du jeu");
    
    // Vérifier les variables Three.js
    console.log("Variables Three.js:", {
        scene: !!scene,
        camera: !!camera,
        renderer: !!renderer,
        clock: !!clock,
        fontLoader: !!fontLoader,
        bubbleObjects: bubbleObjects ? bubbleObjects.length : 0
    });
    
    // Vérifier les variables d'état du jeu
    console.log("État du jeu:", {
        gameRunning,
        gamePaused,
        gameOver,
        gameTimer: !!gameTimer,
        score,
        combo,
        timeLeft
    });
    
    // Vérifier les éléments DOM
    const elements = {
        wordBox: !!document.getElementById('word-box'),
        scoreDisplay: !!document.getElementById('score-display'),
        timeDisplay: !!document.getElementById('time-display'),
        comboDisplay: !!document.getElementById('combo-display'),
        wordInput: !!document.getElementById('current-word'),
        submitButton: !!document.getElementById('submit-word'),
        startResetButton: !!document.getElementById('start-reset'),
        messageDisplay: !!document.getElementById('message')
    };
    console.log("Éléments DOM:", elements);
    
    // Vérifier les fonctions essentielles
    const functions = {
        initGame: typeof initGame === 'function',
        initThreeJS: typeof initThreeJS === 'function',
        startGame: typeof startGame === 'function',
        resetGame: typeof resetGame === 'function',
        checkWord: typeof checkWord === 'function',
        updateGameTime: typeof updateGameTime === 'function',
        generateBubbles: typeof generateBubbles === 'function',
        animate: typeof animate === 'function',
        showNotification: typeof showNotification === 'function'
    };
    console.log("Fonctions essentielles:", functions);
    
    // Vérifier la liste de mots
    console.log("Liste de mots:", wordsList ? wordsList.length : 0);
    
    console.groupEnd();
}

// Appeler la fonction de débogage après l'initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé, initialisation du jeu...");
    initGame();
    
    // Ajouter un délai pour s'assurer que tout est initialisé
    setTimeout(() => {
        debugGameState();
        
        // Ajouter un écouteur d'événement de débogage sur le bouton de démarrage
        const startResetButton = document.getElementById('start-reset');
        if (startResetButton) {
            startResetButton.addEventListener('click', function() {
                console.log("Bouton start/reset cliqué, débogage avant action:");
                debugGameState();
            });
        }
        
        // Configurer le bouton de débogage
        const debugButton = document.getElementById('debug-button');
        if (debugButton) {
            debugButton.addEventListener('click', function() {
                console.log("Bouton de débogage cliqué");
                testGame();
            });
        }
    }, 1000);
});

/**
 * Affiche une notification à l'utilisateur.
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification (success, error, warning, info)
 * @param {number} duration - Durée d'affichage en ms (0 pour ne pas disparaître automatiquement)
 */
function showNotification(message, type = 'info', duration = 3000) {
    console.log(`Notification (${type}): ${message}`);
    
    // Créer l'élément de notification s'il n'existe pas déjà
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
        document.body.appendChild(notificationContainer);
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    
    // Styles de base
    notification.style.padding = '12px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    notification.style.fontSize = '14px';
    notification.style.fontWeight = 'bold';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    
    // Styles selon le type
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
        case 'info':
        default:
            notification.style.backgroundColor = '#2196F3';
            notification.style.color = 'white';
            break;
    }
    
    // Ajouter au conteneur
    notificationContainer.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Disparition automatique
    if (duration > 0) {
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(50px)';
            
            // Supprimer après l'animation
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    // Clic pour fermer
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    return notification;
}

/**
 * Génère des orbes magiques (bulles) dans la scène 3D.
 * @param {number} count - Nombre d'orbes à générer (par défaut 8)
 */
function generateBubbles(count = 8) {
    console.log(`Génération de ${count} orbes magiques...`);
    
    // Vérifier si la scène existe
    if (!scene) {
        console.error("Impossible de générer des orbes : scène non initialisée");
        return;
    }
    
    // Vérifier si la liste de mots est chargée
    if (!wordsList || wordsList.length === 0) {
        console.error("Liste de mots vide, impossible de générer des orbes");
        return;
    }
    
    // Créer de nouveaux orbes
    for (let i = 0; i < count; i++) {
        try {
            // Choisir un mot aléatoire
            const word = wordsList[Math.floor(Math.random() * wordsList.length)];
            
            // Créer un groupe pour contenir l'orbe et le texte
            const bubbleGroup = new THREE.Group();
            
            // Position en haut de l'écran avec distribution uniforme horizontale
            // Diviser l'espace horizontal en sections égales pour une distribution uniforme
            const sectionWidth = 16 / count; // Largeur totale divisée par le nombre d'orbes
            const sectionIndex = i % count; // Index de la section pour cet orbe
            // Position x au centre de la section avec une petite variation aléatoire
            const x = -8 + (sectionIndex * sectionWidth) + (sectionWidth * 0.5) + (Math.random() * 0.5 - 0.25);
            const y = 10 + Math.random() * 5; // Commencer au-dessus de l'écran
            const z = -5 + (Math.random() * 2 - 1); // Profondeur variable pour effet 3D
            bubbleGroup.position.set(x, y, z);
            
            // Créer l'orbe (sphère)
            const size = 1.2 + Math.random() * 0.4; // Taille plus grande
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            
            // Choisir une couleur arcane aléatoire
            const hue = 0.6 + Math.random() * 0.2; // Teinte entre bleu et violet
            const saturation = 0.7 + Math.random() * 0.3; // Saturation élevée
            const lightness = 0.5 + Math.random() * 0.2; // Luminosité moyenne à élevée
            const color = new THREE.Color().setHSL(hue, saturation, lightness);
            
            // Matériau semi-transparent avec effet de brillance
            const material = new THREE.MeshPhysicalMaterial({
                color: color,
                transparent: true,
                opacity: 0.6, // Plus transparent
                roughness: 0.1, // Plus lisse
                metalness: 0.2,
                clearcoat: 0.8, // Plus brillant
                clearcoatRoughness: 0.1,
                transmission: 0.4, // Plus de transmission
                ior: 1.5,
                side: THREE.DoubleSide
            });
            
            const bubble = new THREE.Mesh(geometry, material);
            
            // Ajouter des données personnalisées à l'orbe
            bubble.userData = {
                word: word,
                originalColor: color.clone(),
                originalSize: size,
                fallSpeed: 0.01 + Math.random() * 0.008, // Vitesse de chute plus lente
                rotationSpeed: 0.002 + Math.random() * 0.003, // Rotation plus lente
                wobbleOffset: Math.random() * Math.PI * 2,
                points: 10 + Math.floor(Math.random() * 20), // Points variables
                // Paramètres pour le mouvement flottant
                floatAmplitude: 0.02 + Math.random() * 0.02,
                floatFrequency: 0.5 + Math.random() * 0.5,
                floatPhase: Math.random() * Math.PI * 2
            };
            
            // Ajouter l'orbe au groupe
            bubbleGroup.add(bubble);
            
            // Créer un effet de halo autour de l'orbe
            const haloGeometry = new THREE.SphereGeometry(size * 1.2, 32, 32);
            const haloMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            const halo = new THREE.Mesh(haloGeometry, haloMaterial);
            bubbleGroup.add(halo);
            
            // Créer un texte pour le mot
            const textSprite = createTextSprite(word, { 
                size: size * 1.5, // Taille augmentée pour être plus visible
                color: 0xffffff, // Blanc pur
                fontSize: 100, // Police plus grande
                bold: true // Gras pour plus de visibilité
            });
            
            // Positionner le texte au centre de l'orbe, légèrement devant
            textSprite.position.set(0, 0, size * 0.5);
            bubbleGroup.add(textSprite);
            
            // Ajouter une rotation aléatoire initiale
            bubbleGroup.rotation.x = Math.random() * Math.PI * 2;
            bubbleGroup.rotation.y = Math.random() * Math.PI * 2;
            bubbleGroup.rotation.z = Math.random() * Math.PI * 2;
            
            // Ajouter le groupe à la scène et au tableau
            scene.add(bubbleGroup);
            bubbleObjects.push(bubbleGroup);
            
            console.log(`Orbe magique créé pour le mot "${word}" avec ${bubble.userData.points} points`);
            
        } catch (error) {
            console.error("Erreur lors de la création d'un orbe magique:", error);
        }
    }
    
    console.log(`${bubbleObjects.length} orbes magiques générés avec succès`);
}

/**
 * Anime les orbes magiques (bulles) dans la scène 3D.
 * @param {number} delta - Temps écoulé depuis la dernière frame en secondes
 */
function animateBubbles(delta) {
    // Vérifier si des orbes existent
    if (!bubbleObjects || bubbleObjects.length === 0) {
        return;
    }
    
    // Récupérer le niveau de difficulté pour ajuster la vitesse
    const difficultySelect = document.getElementById('difficulty-level');
    let speedMultiplier = 1.0; // Multiplicateur de vitesse par défaut (medium)
    
    if (difficultySelect) {
        const difficulty = difficultySelect.value;
        if (difficulty === 'easy') {
            speedMultiplier = 0.7; // Plus lent en mode facile
        } else if (difficulty === 'hard') {
            speedMultiplier = 1.5; // Plus rapide en mode difficile
        }
    }
    
    // Temps écoulé pour les animations
    const elapsedTime = clock.getElapsedTime();
    
    // Animer chaque orbe
    for (let i = 0; i < bubbleObjects.length; i++) {
        const bubbleGroup = bubbleObjects[i];
        
        // Vérifier si le groupe existe
        if (!bubbleGroup) continue;
        
        // Récupérer l'orbe principal (premier enfant du groupe)
        const bubble = bubbleGroup.children[0];
        if (!bubble) continue;
        
        // Récupérer les données de l'orbe
        const userData = bubble.userData;
        if (!userData) continue;
        
        // Faire descendre l'orbe (ajuster la vitesse en fonction de la difficulté)
        const fallSpeed = (userData.fallSpeed || 0.01) * speedMultiplier;
        bubbleGroup.position.y -= fallSpeed * delta * 60;
        
        // Mouvement flottant latéral (effet de dérive)
        if (userData.floatAmplitude && userData.floatFrequency && userData.floatPhase) {
            const floatOffset = Math.sin(elapsedTime * userData.floatFrequency + userData.floatPhase) * userData.floatAmplitude;
            bubbleGroup.position.x += floatOffset * delta * 60;
            
            // Petit mouvement en profondeur aussi
            const depthOffset = Math.cos(elapsedTime * userData.floatFrequency * 0.7 + userData.floatPhase) * userData.floatAmplitude * 0.5;
            bubbleGroup.position.z += depthOffset * delta * 60;
        }
        
        // Rotation très légère pour un effet subtil mais professionnel
        const rotationSpeed = (userData.rotationSpeed || 0.002);
        bubbleGroup.rotation.y += rotationSpeed * delta * 60;
        bubbleGroup.rotation.x += rotationSpeed * 0.5 * delta * 60;
        
        // Effet de pulsation subtile
        if (bubble.scale) {
            const pulseSpeed = 0.3; // Plus lent
            const pulseAmount = 0.03; // Plus subtil
            const pulseFactor = 1 + Math.sin(elapsedTime * pulseSpeed + userData.wobbleOffset) * pulseAmount;
        bubble.scale.set(pulseFactor, pulseFactor, pulseFactor);
            
            // Appliquer aussi au halo
            if (bubbleGroup.children.length > 1 && bubbleGroup.children[1].scale) {
                const halo = bubbleGroup.children[1];
                halo.scale.set(pulseFactor * 1.1, pulseFactor * 1.1, pulseFactor * 1.1);
            }
        }
        
        // Effet de brillance qui varie avec le temps
        if (bubble.material) {
            // Opacité fixe pour l'orbe principal
            bubble.material.opacity = 0.6;
            
            // Faire varier l'opacité du halo
            if (bubbleGroup.children.length > 1 && bubbleGroup.children[1].material) {
                const halo = bubbleGroup.children[1];
            const opacityVariation = 0.1;
                halo.material.opacity = 0.2 + Math.sin(elapsedTime * 0.3 + userData.wobbleOffset) * opacityVariation;
            }
            
            // Faire varier légèrement la couleur
            const originalColor = userData.originalColor;
            if (originalColor) {
                const hueShift = Math.sin(elapsedTime * 0.1 + userData.wobbleOffset) * 0.03; // Variation plus subtile
                const color = new THREE.Color().copy(originalColor);
                
                // Convertir en HSL, modifier la teinte, puis reconvertir
                const hsl = {};
                color.getHSL(hsl);
                hsl.h += hueShift;
                color.setHSL(hsl.h, hsl.s, hsl.l);
                
                bubble.material.color.copy(color);
                
                // Appliquer aussi au halo
                if (bubbleGroup.children.length > 1 && bubbleGroup.children[1].material) {
                    bubbleGroup.children[1].material.color.copy(color);
                }
            }
        }
        
        // Vérifier si l'orbe a atteint le bas de l'écran
        if (bubbleGroup.position.y < -10) {
            // Au lieu de terminer le jeu, replacer l'orbe en haut avec une nouvelle lettre
            if (gameRunning && !gameOver) {
                // Choisir une nouvelle lettre
                const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                const commonLetters = ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U'];
                
                let letter;
                if (Math.random() < 0.7) {
                    letter = commonLetters[Math.floor(Math.random() * commonLetters.length)];
                } else {
                    letter = letters[Math.floor(Math.random() * letters.length)];
                }
                
                // Mettre à jour la lettre dans l'orbe
                if (bubble.userData) {
                    bubble.userData.letter = letter;
                }
                
                // Mettre à jour le texte de l'orbe (3ème enfant du groupe)
                if (bubbleGroup.children.length > 2) {
                    const textSprite = bubbleGroup.children[2];
                    scene.remove(textSprite);
                    bubbleGroup.remove(textSprite);
                    
                    // Créer un nouveau sprite de texte
                    const size = bubble.userData.originalSize || 1;
                    const newTextSprite = createTextSprite(letter, { 
                        size: size * 1.5,
                        color: 0xffffff,
                        fontSize: 100,
                        bold: true
                    });
                    
                    // Positionner le texte au centre de l'orbe, légèrement devant
                    newTextSprite.position.set(0, 0, size * 0.5);
                    bubbleGroup.add(newTextSprite);
                }
                
                // Repositionner l'orbe en haut avec une position X aléatoire
                bubbleGroup.position.y = 10 + Math.random() * 5;
                bubbleGroup.position.x = (Math.random() * 16) - 8;
                bubbleGroup.position.z = -5 + (Math.random() * 2 - 1); // Profondeur variable
                
                // Réinitialiser la rotation pour éviter l'accumulation
                bubbleGroup.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                );
            }
        }
    }
}

/**
 * Gère le redimensionnement de la fenêtre
 */
function onWindowResize() {
    const container = document.getElementById('word-box');
    if (!container || !camera || !renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    
    console.log("Fenêtre redimensionnée:", width, "x", height);
}

/**
 * Gère le mouvement de la souris
 * @param {Event} event - L'événement de mouvement de souris
 */
function onMouseMove(event) {
    if (!renderer) return;
    
    // Calculer la position de la souris en coordonnées normalisées (-1 à +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

/**
 * Gère le clic sur une bulle
 * @param {Event} event - L'événement de clic
 */
function onBubbleClick(event) {
    if (!scene || !camera || !raycaster || !bubbleObjects || !gameRunning || gamePaused || gameOver) return;
    
    // Mettre à jour le raycaster avec la position de la souris
    raycaster.setFromCamera(mouse, camera);
    
    // Vérifier l'intersection avec les bulles
    const intersects = raycaster.intersectObjects(bubbleObjects, true);
    
    if (intersects.length > 0) {
        // Trouver la bulle parente
        let bubbleGroup = intersects[0].object;
        while (bubbleGroup.parent && bubbleGroup.parent !== scene) {
            bubbleGroup = bubbleGroup.parent;
        }
        
        // Vérifier si c'est une bulle valide
        if (bubbleGroup && bubbleGroup.children && bubbleGroup.children[0] && bubbleGroup.children[0].userData) {
            const bubbleData = bubbleGroup.children[0].userData;
            const word = bubbleData.word;
            
            console.log("Bulle cliquée:", word);
            
            // Remplir le champ de saisie avec le mot
            const wordInput = document.getElementById('current-word');
            if (wordInput) {
                wordInput.value = word;
                wordInput.focus();
            }
            
            // Mettre en évidence la bulle
            if (bubbleGroup.children[0].material) {
                const originalColor = bubbleGroup.children[0].material.color.clone();
                bubbleGroup.children[0].material.color.set(0xffff00); // Jaune vif
                
                // Restaurer la couleur d'origine après un court délai
                setTimeout(() => {
                    if (bubbleGroup.children[0].material) {
                        bubbleGroup.children[0].material.color.copy(originalColor);
                    }
                }, 300);
            }
        }
    }
}

/**
 * Fonction pour tester directement le jeu
 */
function testGame() {
    console.group("Test du jeu");
    
    // Vérifier l'état initial
    console.log("État initial:");
    debugGameState();
    
    // Réinitialiser l'état du jeu
    gameRunning = false;
    gamePaused = false;
    gameOver = false;
    
    // Initialiser Three.js manuellement si nécessaire
    if (!scene || !camera || !renderer) {
        console.log("Initialisation manuelle de Three.js...");
        initThreeJS();
    }
    
    // Charger les mots si nécessaire
    if (!wordsList || wordsList.length === 0) {
        console.log("Chargement manuel des mots...");
        loadWords().then(() => {
            console.log(`${wordsList.length} mots chargés manuellement`);
            continueTest();
        }).catch(error => {
            console.error("Erreur lors du chargement manuel des mots:", error);
            // Utiliser une liste de secours
            wordsList = [
                "test", "debug", "game", "play", "word", "bubble", "score", 
                "level", "time", "bonus", "point", "combo", "letter", "spell"
            ];
            console.log("Liste de secours chargée avec " + wordsList.length + " mots");
            continueTest();
        });
    } else {
        continueTest();
    }
    
    function continueTest() {
        // Afficher une notification de test
        if (typeof showNotification === 'function') {
            showNotification("Mode test activé", "info", 3000);
        }
        
        // Démarrer le jeu manuellement
        console.log("Démarrage manuel du jeu...");
        startGame();
        
        // Vérifier l'état après démarrage
        console.log("État après démarrage:");
        debugGameState();
        
        // Simuler la soumission d'un mot
        setTimeout(() => {
            console.log("Simulation de la soumission d'un mot...");
            const wordInput = document.getElementById('current-word');
            if (wordInput) {
                // Utiliser un mot de la liste
                const testWord = wordsList[0] || "test";
                wordInput.value = testWord;
                console.log(`Mot de test: "${testWord}"`);
                
                // Appeler checkWord
                if (typeof checkWord === 'function') {
                    checkWord();
                    console.log("Fonction checkWord appelée");
                } else {
                    console.error("Fonction checkWord non disponible");
                }
            } else {
                console.error("Champ de saisie non trouvé");
            }
            
            // Vérifier l'état après soumission
            console.log("État après soumission:");
            debugGameState();
            
            // Tester la génération de bulles
            setTimeout(() => {
                console.log("Test de la génération de bulles...");
                if (typeof generateBubbles === 'function') {
                    generateBubbles(5);
                    console.log("Fonction generateBubbles appelée");
                } else {
                    console.error("Fonction generateBubbles non disponible");
                }
                
                // Vérifier l'état final
                console.log("État final:");
                debugGameState();
                
                // Afficher un message de fin de test
                if (typeof showNotification === 'function') {
                    showNotification("Test terminé", "success", 3000);
                }
            }, 1000);
        }, 1000);
    }
    
    console.groupEnd();
}

// Ajouter un raccourci clavier pour tester le jeu (Ctrl+Alt+T)
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.altKey && event.key === 't') {
        console.log("Raccourci de test activé");
        testGame();
    }
});

/**
 * Crée un effet visuel lorsqu'une bulle éclate
 * @param {THREE.Vector3} position - Position de la bulle
 * @param {string} letter - Lettre contenue dans la bulle
 */
function createBubblePopEffect(position, letter) {
    // Vérifier si la scène existe
    if (!scene) return;
    
    // Nombre de particules pour l'effet
    const particleCount = 20;
    
    // Créer un groupe pour contenir toutes les particules
    const particleGroup = new THREE.Group();
    particleGroup.position.copy(position);
    
    // Créer des particules qui s'éloignent du centre
    for (let i = 0; i < particleCount; i++) {
        // Créer une petite sphère pour chaque particule
        const size = 0.1 + Math.random() * 0.2;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        
        // Couleur aléatoire vive
        const hue = Math.random();
        const saturation = 0.8 + Math.random() * 0.2;
        const lightness = 0.6 + Math.random() * 0.3;
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        
        // Matériau brillant
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color.clone().multiplyScalar(0.5),
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geometry, material);
        
        // Position aléatoire autour du centre
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 0.1;
        
        particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
        particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
        particle.position.z = radius * Math.cos(phi);
        
        // Vitesse aléatoire
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
            ),
            rotationSpeed: new THREE.Vector3(
                Math.random() * 0.2,
                Math.random() * 0.2,
                Math.random() * 0.2
            ),
            life: 1.0 // Durée de vie initiale
        };
        
        particleGroup.add(particle);
    }
    
    // Ajouter le groupe à la scène
    scene.add(particleGroup);
    
    // Créer une animation pour les particules
    const animateParticles = () => {
        // Réduire la durée de vie de chaque particule
        let allDead = true;
        
        particleGroup.children.forEach(particle => {
            // Mettre à jour la position
            particle.position.add(particle.userData.velocity);
            
            // Faire tourner la particule
            particle.rotation.x += particle.userData.rotationSpeed.x;
            particle.rotation.y += particle.userData.rotationSpeed.y;
            particle.rotation.z += particle.userData.rotationSpeed.z;
            
            // Réduire la durée de vie
            particle.userData.life -= 0.02;
            
            // Mettre à jour l'opacité
            if (particle.material) {
                particle.material.opacity = particle.userData.life;
            }
            
            // Vérifier si la particule est encore vivante
            if (particle.userData.life > 0) {
                allDead = false;
            }
        });
        
        // Si toutes les particules sont mortes, supprimer le groupe
        if (allDead) {
            scene.remove(particleGroup);
            
            // Nettoyer les ressources
            particleGroup.children.forEach(particle => {
                if (particle.geometry) particle.geometry.dispose();
                if (particle.material) particle.material.dispose();
            });
        } else {
            // Continuer l'animation
            requestAnimationFrame(animateParticles);
        }
    };
    
    // Démarrer l'animation
    animateParticles();
}

/**
 * Crée un sprite de texte simple (alternative à TextGeometry)
 * @param {string} text - Le texte à afficher
 * @param {Object} options - Options de configuration
 * @returns {THREE.Sprite} Le sprite créé
 */
function createTextSprite(text, options = {}) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = options.size || 0.5;
    const color = options.color || 0xffffff;
    const fontSize = options.fontSize || 40;
    const bold = options.bold || false;
    
    // Configurer le canvas avec une taille plus grande pour une meilleure résolution
    canvas.width = 512;
    canvas.height = 512;
    
    // Fond transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurer le texte avec une police plus élégante
    const fontWeight = bold ? '700' : '500';
    // Utiliser une police plus élégante et moderne
    context.font = `${fontWeight} ${fontSize}px "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Pas d'effet de flou
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    
    // Dessiner un contour épais pour une meilleure lisibilité
    context.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    context.lineWidth = 10;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    
    // Remplir le texte avec la couleur spécifiée
    context.fillStyle = `rgb(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255})`;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Créer la texture avec une meilleure qualité
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16; // Améliore la netteté à différents angles
    
    // Créer le matériau
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false, // Assure que le texte est toujours visible
        depthWrite: false // Empêche les problèmes de profondeur
    });
    
    // Créer le sprite avec un ratio d'aspect correct pour éviter la déformation
    const sprite = new THREE.Sprite(material);
    
    // Calculer le ratio d'aspect pour éviter la déformation
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2; // Approximation de la hauteur basée sur la taille de police
    const aspectRatio = textWidth / textHeight;
    
    // Appliquer le ratio d'aspect pour éviter la déformation
    sprite.scale.set(size * 5 * aspectRatio, size * 5, 1);
    
    return sprite;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM chargé, initialisation du jeu...");
    
    // Initialiser les variables globales
    gameCanvas = document.getElementById('gameCanvas');
    ctx = gameCanvas ? gameCanvas.getContext('2d') : null;
    wordInput = document.getElementById('wordInput');
    submitButton = document.getElementById('submitButton');
    startButton = document.getElementById('startButton');
    pauseButton = document.getElementById('pauseButton');
    helpButton = document.getElementById('helpButton');
    
    // Vérifier si les éléments essentiels existent
    if (!gameCanvas) {
        console.error("Canvas de jeu 'gameCanvas' non trouvé");
        alert("Erreur: Canvas de jeu non trouvé. Veuillez rafraîchir la page.");
        return;
    }
    
    // Ajustement de la taille du canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialiser les événements
    if (startButton) {
        startButton.addEventListener('click', function() {
            console.log("Bouton Commencer cliqué");
            startGame();
        });
    }
    
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }
    
    if (helpButton) {
        helpButton.addEventListener('click', showHelp);
    }
    
    if (submitButton) {
        submitButton.addEventListener('click', checkWord);
    }
    
    if (wordInput) {
        wordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkWord();
            }
        });
    }
    
    // Initialiser les modales
    document.getElementById('restartButton')?.addEventListener('click', function() {
        closeModal();
        startGame();
    });
    
    document.getElementById('shareButton')?.addEventListener('click', shareScore);
    document.getElementById('continueButton')?.addEventListener('click', closeModal);
    document.getElementById('closeHelpButton')?.addEventListener('click', closeModal);
    
    // Initialiser les onglets d'aide
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Affichage initial
    updateStats();
    
    // Charger les mots
    loadWords().then(() => {
        console.log(`${wordsList.length} mots chargés avec succès`);
    }).catch(error => {
        console.error("Erreur lors du chargement des mots:", error);
        // Charger une liste de secours en cas d'échec
        wordsList = [
            "game", "play", "word", "bubble", "score", "level", "time", 
            "bonus", "point", "combo", "letter", "spell", "language",
            "grammar", "syntax", "phrase", "sentence", "learn", "education",
            "knowledge", "vocabulary", "dictionary", "meaning", "definition"
        ];
        console.log("Liste de secours chargée avec " + wordsList.length + " mots");
    });
    
    console.log("Initialisation du jeu terminée avec succès");
});

// Fonction pour redimensionner le canvas
function resizeCanvas() {
    if (!gameCanvas) return;
    
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) return;
    
    const rect = gameArea.getBoundingClientRect();
    gameCanvas.width = rect.width;
    gameCanvas.height = rect.height - document.querySelector('.input-area')?.offsetHeight || 0;
    
    // Redessiner les orbes si le jeu est actif
    if (gameActive && scene && camera && renderer) {
        renderer.setSize(gameCanvas.width, gameCanvas.height);
        camera.aspect = gameCanvas.width / gameCanvas.height;
        camera.updateProjectionMatrix();
        drawOrbs();
    }
}

// Fonction pour partager le score
function shareScore() {
    const text = `J'ai obtenu un score de ${score} au niveau ${level} dans Word Bubbles: The Arcane Lexicon!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Word Bubbles: The Arcane Lexicon',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
        prompt('Copiez ce texte pour partager votre score:', text);
    }
}

// Mise à jour des récompenses débloquées
function updateUnlockedRewards() {
    const rewardItems = document.querySelectorAll('.reward-item');
    
    // Déverrouillage des récompenses en fonction du niveau
    for (let i = 0; i < rewardItems.length; i++) {
        if (i < level - 1) {
            rewardItems[i].classList.remove('locked');
        }
    }
    
    // Mise à jour du niveau de maîtrise
    const masteryIcons = document.querySelectorAll('.mastery-icon');
    const masteryDescription = document.querySelector('.mastery-description');
    
    // Réinitialisation
    masteryIcons.forEach(icon => icon.classList.remove('active'));
    
    // Détermination du niveau de maîtrise
    let masteryLevel = 0;
    let masteryText = '';
    
    if (level >= 5) {
        masteryLevel = 4;
        masteryText = 'Maître';
    } else if (level >= 4) {
        masteryLevel = 3;
        masteryText = 'Expert';
    } else if (level >= 3) {
        masteryLevel = 2;
        masteryText = 'Adepte';
    } else if (level >= 2) {
        masteryLevel = 1;
        masteryText = 'Apprenti';
    } else {
        masteryLevel = 0;
        masteryText = 'Novice';
    }
    
    // Activation de l'icône correspondante
    if (masteryIcons[masteryLevel]) {
        masteryIcons[masteryLevel].classList.add('active');
    }
    
    if (masteryDescription) {
        masteryDescription.textContent = masteryText;
    }
}

// Fonction pour créer un effet de capture
function createCaptureEffect(x, y, points) {
    // Création de particules
    for (let i = 0; i < 20; i++) {
        createParticle(x, y);
    }
    
    // Affichage du score gagné
    const scorePopup = document.createElement('div');
    scorePopup.className = 'score-popup';
    scorePopup.textContent = '+' + points;
    scorePopup.style.left = x + 'px';
    scorePopup.style.top = y + 'px';
    
    document.querySelector('.game-area')?.appendChild(scorePopup);
    
    // Suppression après l'animation
    setTimeout(() => {
        scorePopup.remove();
    }, 1500);
}

// Création d'une particule
function createParticle(x, y, color = 'rgba(255, 213, 79, 0.8)') {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = color;
    
    // Animation aléatoire
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    const size = Math.random() * 6 + 2;
    
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    document.querySelector('.game-area')?.appendChild(particle);
    
    // Animation de la particule
    let posX = x;
    let posY = y;
    let alpha = 1;
    const gravity = 0.1;
    let velocityY = -speed * Math.sin(angle);
    const velocityX = speed * Math.cos(angle);
    
    const particleInterval = setInterval(() => {
        posX += velocityX;
        velocityY += gravity;
        posY += velocityY;
        alpha -= 0.02;
        
        particle.style.left = posX + 'px';
        particle.style.top = posY + 'px';
        particle.style.opacity = alpha;
        
        if (alpha <= 0) {
            clearInterval(particleInterval);
            particle.remove();
        }
    }, 20);
}

// Fonction pour dessiner les orbes
function drawOrbs() {
    if (!scene || !camera || !renderer) return;
    
    // Rendre la scène
    renderer.render(scene, camera);
}

// ===== AMÉLIORATIONS DE L'INTERFACE UTILISATEUR =====

// Initialisation des particules flottantes pour l'ambiance
function initFloatingParticles() {
    console.log("Initialisation des particules flottantes...");
    
    // Créer le conteneur s'il n'existe pas déjà
    let particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) {
        particlesContainer = document.createElement('div');
        particlesContainer.className = 'floating-particles';
        document.body.appendChild(particlesContainer);
    }
    
    // Créer 20 particules
    for (let i = 0; i < 20; i++) {
        createFloatingParticle(particlesContainer);
    }
}

// Création d'une particule flottante d'ambiance
function createFloatingParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Position aléatoire
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const size = Math.random() * 6 + 2; // Taille entre 2px et 8px
    const duration = Math.random() * 10 + 10; // Durée entre 10s et 20s
    const delay = Math.random() * 5; // Délai entre 0s et 5s
    
    particle.style.left = `${posX}%`;
    particle.style.bottom = `${-10}%`; // Commence en dessous de l'écran
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.opacity = (Math.random() * 0.3 + 0.1).toString(); // Opacité entre 0.1 et 0.4
    
    // Animation personnalisée
    particle.style.animation = `float-particle ${duration}s ${delay}s infinite linear`;
    
    container.appendChild(particle);
    
    // Recréer la particule après qu'elle ait terminé son animation
    setTimeout(() => {
        particle.remove();
        createFloatingParticle(container);
    }, (duration + delay) * 1000);
}

// Fonction pour initialiser les éléments de l'interface
function initUI() {
    console.log("Initialisation de l'interface utilisateur...");
    
    // Ajuster le padding du contenu principal en fonction de la hauteur du header et footer
    function adjustContentPadding() {
        const header = document.querySelector('.game-header');
        const footer = document.querySelector('.game-footer');
        const main = document.querySelector('.game-main');
        
        if (header && main) {
            const headerHeight = header.offsetHeight;
            main.style.paddingTop = `${headerHeight + 30}px`;
        }
        
        if (footer && main) {
            const footerHeight = footer.offsetHeight;
            main.style.paddingBottom = `${footerHeight + 30}px`;
        }
    }
    
    // Ajuster le padding initial et lors du redimensionnement
    adjustContentPadding();
    window.addEventListener('resize', adjustContentPadding);
    
    // Ajouter un effet de survol pour les éléments de navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-3px)';
            link.style.textShadow = '0 0 10px var(--glow-gold)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0)';
            link.style.textShadow = 'none';
        });
    });
}

// Initialiser l'interface et les particules au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM chargé, initialisation des améliorations d'interface...");
    
    // Initialiser les particules flottantes
    initFloatingParticles();
    
    // Initialiser l'interface utilisateur
    initUI();
});