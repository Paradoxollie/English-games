// ===== THREE.JS POUR WORD BUBBLES =====
// Script pour gérer les effets 3D du jeu Word Bubbles

// Variables globales Three.js
let scene, camera, renderer;
let orbs = [];
let clock;
let gameActive = false;

// Initialisation de Three.js
function initThree() {
    // Récupérer le conteneur
    const container = document.getElementById('gameCanvas');
    if (!container) {
        console.error("Canvas 'gameCanvas' non trouvé");
        return false;
    }
    
    console.log("Canvas trouvé, dimensions:", container.clientWidth, "x", container.clientHeight);
    
    // Créer la scène
    scene = new THREE.Scene();
    
    // Créer la caméra
    const aspectRatio = container.clientWidth / container.clientHeight || 2;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.z = 15;
    
    // Créer le renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        canvas: container
    });
    
    // Définir la taille du renderer
    if (container.clientWidth > 0 && container.clientHeight > 0) {
        renderer.setSize(container.clientWidth, container.clientHeight);
    } else {
        // Valeurs par défaut si les dimensions ne sont pas disponibles
        renderer.setSize(800, 500);
    }
    
    renderer.setClearColor(0x000000, 0);
    
    // Ajouter des lumières
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Ajouter un fond d'étoiles
    addStarryBackground();
    
    // Initialiser l'horloge
    clock = new THREE.Clock();
    
    // Configurer les écouteurs d'événements
    window.addEventListener('resize', onResize);
    
    // Démarrer la boucle d'animation
    animate();
    
    console.log("Three.js initialisé avec succès");
    return true;
}

// Ajouter un fond d'étoiles
function addStarryBackground() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = -50 + Math.random() * 20;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Fonction de redimensionnement
function onResize() {
    const container = document.getElementById('gameCanvas');
    if (!container || !camera || !renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}

// Boucle d'animation
function animate() {
    requestAnimationFrame(animate);
    
    if (!scene || !camera || !renderer) return;
    
    // Calculer le delta time
    const delta = clock ? clock.getDelta() : 0.016;
    
    // Animer les orbes
    animateOrbs(delta);
    
    // Rendre la scène
    renderer.render(scene, camera);
}

// Animation des orbes
function animateOrbs(delta) {
    if (!orbs || orbs.length === 0) return;
    
    for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];
        
        // Faire descendre l'orbe
        orb.position.y -= 0.02;
        
        // Rotation légère
        orb.rotation.x += 0.005;
        orb.rotation.y += 0.005;
        
        // Si l'orbe sort de l'écran, le supprimer
        if (orb.position.y < -10) {
            scene.remove(orb);
            orbs.splice(i, 1);
            i--;
        }
    }
}

// Création d'un orbe avec un mot
function createOrb(word) {
    // Créer un groupe pour contenir l'orbe et le texte
    const orbGroup = new THREE.Group();
    
    // Position aléatoire en haut de l'écran
    const x = Math.random() * 16 - 8;
    const y = 10;
    const z = Math.random() * 5 - 2.5;
    orbGroup.position.set(x, y, z);
    
    // Créer la sphère
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.6, 0.8, 0.5),
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    orbGroup.add(sphere);
    
    // Créer le texte
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    // Fond transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Texte
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'white';
    context.fillText(word, canvas.width / 2, canvas.height / 2);
    
    // Créer la texture
    const texture = new THREE.CanvasTexture(canvas);
    
    // Créer le sprite
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 1, 1);
    sprite.position.z = 1;
    orbGroup.add(sprite);
    
    // Ajouter à la scène et au tableau
    scene.add(orbGroup);
    orbs.push(orbGroup);
    
    // Stocker le mot dans les données utilisateur
    orbGroup.userData = { word: word };
    
    return orbGroup;
}

// Création de plusieurs orbes
function createOrbs(count, words) {
    for (let i = 0; i < count; i++) {
        if (words && words.length > 0) {
            const word = words[Math.floor(Math.random() * words.length)];
            createOrb(word);
        }
    }
}

// Suppression d'un orbe
function removeOrb(orb) {
    const index = orbs.indexOf(orb);
    if (index > -1) {
        scene.remove(orb);
        orbs.splice(index, 1);
    }
}

// Suppression de tous les orbes
function clearOrbs() {
    for (let i = orbs.length - 1; i >= 0; i--) {
        scene.remove(orbs[i]);
    }
    orbs = [];
}

// Démarrage du jeu
function startThreeGame(wordsList) {
    gameActive = true;
    clearOrbs();
    createOrbs(8, wordsList);
}

// Arrêt du jeu
function stopThreeGame() {
    gameActive = false;
    clearOrbs();
}

// Exportation des fonctions
window.ThreeBubbles = {
    init: initThree,
    start: startThreeGame,
    stop: stopThreeGame,
    createOrb: createOrb,
    removeOrb: removeOrb,
    clearOrbs: clearOrbs,
    orbs: orbs  // Exposer le tableau d'orbes
}; 