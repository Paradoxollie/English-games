import * as THREE from 'three';

export class GameEnhancer {
  constructor(gameContainer) {
    this.container = document.getElementById(gameContainer);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    this.init();
  }
  
  init() {
    // Configuration du renderer
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);
    
    // Position de la caméra
    this.camera.position.z = 5;
    
    // Gestion du redimensionnement
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Démarrer l'animation
    this.animate();
  }
  
  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
  
  // Méthodes spécifiques pour chaque jeu
  addFloatingElements(elements, options = {}) {
    const defaults = {
      fontSize: 0.2,
      color: 0xffd700,
      fontUrl: './fonts/helvetiker_regular.typeface.json',
      speed: 0.01,
      amplitude: 0.5
    };
    
    const settings = { ...defaults, ...options };
    const loader = new THREE.FontLoader();
    
    loader.load(settings.fontUrl, (font) => {
      elements.forEach((text, index) => {
        const textGeometry = new THREE.TextGeometry(text, {
          font: font,
          size: settings.fontSize,
          height: 0.05,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.01,
          bevelSize: 0.005,
          bevelOffset: 0,
          bevelSegments: 5
        });
        
        const textMaterial = new THREE.MeshStandardMaterial({ 
          color: settings.color,
          emissive: settings.color,
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        // Centrer le texte
        textGeometry.computeBoundingBox();
        textGeometry.center();
        
        // Positionner aléatoirement dans l'espace
        textMesh.position.x = (Math.random() - 0.5) * 10;
        textMesh.position.y = (Math.random() - 0.5) * 5;
        textMesh.position.z = (Math.random() - 0.5) * 5 - 5;
        
        // Ajouter une animation personnalisée
        textMesh.userData = {
          speed: settings.speed,
          amplitude: settings.amplitude,
          originalY: textMesh.position.y,
          time: Math.random() * Math.PI * 2
        };
        
        this.scene.add(textMesh);
      });
    });
  }
  
  createParticleSystem(texture, count = 1000) {
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load(texture);
    
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = count;
    const posArray = new Float32Array(particlesCnt * 3);
    const colorsArray = new Float32Array(particlesCnt * 3);
    
    // Positions et couleurs aléatoires
    for (let i = 0; i < particlesCnt * 3; i++) {
      // Positions
      posArray[i] = (Math.random() - 0.5) * 20;
      
      // Couleurs - variation de violet à or
      if (i % 3 === 0) { // R
        colorsArray[i] = Math.random() * 0.5 + 0.5; // 0.5-1.0
      } else if (i % 3 === 1) { // G
        colorsArray[i] = Math.random() * 0.3; // 0.0-0.3
      } else { // B
        colorsArray[i] = Math.random() * 0.5 + 0.5; // 0.5-1.0
      }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      map: particleTexture,
      transparent: true,
      alphaTest: 0.001,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particleSystem);
    
    // Animation des particules
    particleSystem.userData = { rotationSpeed: 0.001 };
    
    // Ajouter à la boucle d'animation
    const originalAnimate = this.animate;
    this.animate = () => {
      requestAnimationFrame(() => this.animate());
      
      // Animer les particules
      particleSystem.rotation.x += particleSystem.userData.rotationSpeed;
      particleSystem.rotation.y += particleSystem.userData.rotationSpeed * 0.5;
      
      // Animer les textes flottants
      this.scene.children.forEach(child => {
        if (child.userData && child.userData.hasOwnProperty('time')) {
          child.userData.time += child.userData.speed;
          child.position.y = child.userData.originalY + 
                            Math.sin(child.userData.time) * child.userData.amplitude;
          child.rotation.y += 0.01;
        }
      });
      
      this.renderer.render(this.scene, this.camera);
    };
    
    return particleSystem;
  }
  
  // Ajouter un système de particules réactif
  addReactiveParticles(triggerElement, options = {}) {
    const defaults = {
      count: 50,
      color: 0xffd700,
      size: 0.1,
      speed: 0.5,
      spread: 1.5,
      lifetime: 2
    };
    
    const settings = { ...defaults, ...options };
    const particles = [];
    
    // Observer l'élément pour déclencher les particules
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class' && 
            mutation.target.classList.contains('correct-answer')) {
          this.emitParticles(
            mutation.target.getBoundingClientRect(),
            settings
          );
        }
      });
    });
    
    observer.observe(triggerElement, { attributes: true });
    
    return {
      destroy: () => observer.disconnect()
    };
  }
  
  emitParticles(rect, settings) {
    const { count, color, size, speed, spread, lifetime } = settings;
    
    // Convertir la position de l'écran en position 3D
    const position = new THREE.Vector3(
      (rect.left + rect.width/2) / window.innerWidth * 2 - 1,
      - (rect.top + rect.height/2) / window.innerHeight * 2 + 1,
      0
    );
    position.unproject(this.camera);
    
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(size * (0.5 + Math.random() * 0.5), 8, 8);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        metalness: 0.7,
        roughness: 0.3
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      
      // Direction aléatoire
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      );
      particle.velocity.normalize().multiplyScalar(speed * (0.5 + Math.random()));
      
      // Durée de vie
      particle.lifetime = lifetime;
      particle.age = 0;
      
      this.scene.add(particle);
      
      // Ajouter à la liste des particules à animer
      this.particles = this.particles || [];
      this.particles.push(particle);
    }
    
    // Mettre à jour la fonction d'animation
    const originalAnimate = this.animate;
    this.animate = () => {
      requestAnimationFrame(() => this.animate());
      
      // Animer les particules
      if (this.particles && this.particles.length > 0) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.position.add(p.velocity);
          p.age += 0.016; // Approximativement 60 FPS
          
          // Faire tourner la particule
          p.rotation.x += 0.01;
          p.rotation.y += 0.01;
          
          // Faire disparaître progressivement
          if (p.material) {
            p.material.opacity = 1 - (p.age / p.lifetime);
            p.scale.multiplyScalar(0.99);
          }
          
          // Supprimer si trop vieille
          if (p.age >= p.lifetime) {
            this.scene.remove(p);
            this.particles.splice(i, 1);
          }
        }
      }
      
      this.renderer.render(this.scene, this.camera);
    };
  }
  
  // Ajouter un effet de portail magique
  addMagicPortal(position, options = {}) {
    const defaults = {
      radius: 2,
      color: 0xffd700,
      intensity: 1.5,
      rotationSpeed: 0.01
    };
    
    const settings = { ...defaults, ...options };
    
    // Créer le portail
    const portalGeometry = new THREE.TorusGeometry(
      settings.radius, 
      settings.radius * 0.2, 
      16, 
      100
    );
    
    const portalMaterial = new THREE.MeshStandardMaterial({
      color: settings.color,
      emissive: settings.color,
      emissiveIntensity: settings.intensity,
      side: THREE.DoubleSide,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.copy(position);
    portal.rotation.x = Math.PI / 2;
    
    // Ajouter des particules au portail
    const particleCount = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = settings.radius * (0.8 + Math.random() * 0.4);
      
      particlesPositions[i * 3] = Math.cos(angle) * radius;
      particlesPositions[i * 3 + 1] = Math.sin(angle) * radius;
      particlesPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    
    particlesGeometry.setAttribute(
      'position', 
      new THREE.BufferAttribute(particlesPositions, 3)
    );
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: settings.color,
      size: 0.05,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    portal.add(particles);
    
    // Animation du portail
    portal.userData.rotationSpeed = settings.rotationSpeed;
    portal.userData.time = 0;
    
    const originalAnimate = this.animate;
    this.animate = () => {
      requestAnimationFrame(() => this.animate());
      
      // Animer le portail
      portal.rotation.z += portal.userData.rotationSpeed;
      portal.userData.time += 0.01;
      
      // Faire pulser le portail
      const scale = 1 + Math.sin(portal.userData.time) * 0.05;
      portal.scale.set(scale, scale, 1);
      
      // Animer les particules
      particles.rotation.z -= portal.userData.rotationSpeed * 0.5;
      
      this.renderer.render(this.scene, this.camera);
    };
    
    this.scene.add(portal);
    return portal;
  }
} 