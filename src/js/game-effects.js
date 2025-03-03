// Effets visuels et 3D pour le jeu Speed Verb Challenge
class GameEffects {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.stars = [];
        this.runeSymbols = [
            'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 
            'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 
            'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'
        ];
        
        this.init();
        this.generateRunePattern();
        this.createMagicPortal();
    }
    
    // Initialisation de la scène Three.js
    init() {
        // Vérifier si Three.js est chargé
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded yet, using fallback effects');
            this.useFallbackEffects();
            return;
        }
        
        // Créer la scène
        this.scene = new THREE.Scene();
        
        // Créer la caméra
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;
        
        // Créer le renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Ajouter le renderer au DOM
        const bgScene = document.getElementById('bg-scene');
        if (bgScene) {
            bgScene.appendChild(this.renderer.domElement);
            
            // Créer les étoiles
            this.createStars();
            
            // Animation
            this.animate();
            
            // Gestion du redimensionnement
            window.addEventListener('resize', () => this.handleResize());
        }
    }
    
    // Créer des étoiles en arrière-plan
    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const starVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute(
            'position', 
            new THREE.Float32BufferAttribute(starVertices, 3)
        );
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.stars.push(stars);
    }
    
    // Générer un motif de runes pour l'arrière-plan
    generateRunePattern() {
        const runesContainer = document.querySelector('.floating-runes');
        if (!runesContainer) return;
        
        // Créer un canvas pour générer le motif
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Fond avec un dégradé radial
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        gradient.addColorStop(0, '#1e3a8a');   // Bleu foncé au centre
        gradient.addColorStop(1, '#0f172a');   // Presque noir aux bords
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ajouter des étoiles
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2;
            const opacity = Math.random() * 0.8 + 0.2;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dessiner des runes aléatoires
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const rune = this.runeSymbols[Math.floor(Math.random() * this.runeSymbols.length)];
            const size = 24 + Math.random() * 48;
            
            ctx.font = `${size}px serif`;
            ctx.fillStyle = `rgba(255, 215, 0, ${0.1 + Math.random() * 0.3})`;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.fillText(rune, 0, 0);
            ctx.restore();
        }
        
        // Ajouter un effet de nébuleuse
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 50 + Math.random() * 200;
            
            const nebulaGradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, radius
            );
            
            // Couleurs aléatoires pour la nébuleuse (bleu, violet ou cyan)
            const colors = [
                [62, 116, 245],  // Bleu
                [134, 88, 255],  // Violet
                [0, 208, 255]    // Cyan
            ];
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            nebulaGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`);
            nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = nebulaGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Appliquer le motif comme background
        const dataUrl = canvas.toDataURL('image/png');
        runesContainer.style.backgroundImage = `url(${dataUrl})`;
    }
    
    // Créer un portail magique
    createMagicPortal() {
        const portalElement = document.getElementById('magic-portal');
        if (!portalElement) return;
        
        // Animation du portail
        let scale = 0;
        let opacity = 0;
        let direction = 1;
        
        const animatePortal = () => {
            if (direction > 0) {
                scale += 0.01;
                opacity += 0.01;
                if (scale >= 1) {
                    direction = -1;
                }
            } else {
                scale -= 0.01;
                opacity -= 0.01;
                if (scale <= 0) {
                    direction = 1;
                }
            }
            
            portalElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
            portalElement.style.opacity = opacity;
            
            requestAnimationFrame(animatePortal);
        };
        
        animatePortal();
    }
    
    // Créer des particules pour les effets
    createParticles(x, y, count = 20, color = '#ffd700') {
        const particlesContainer = document.getElementById('particles-container');
        if (!particlesContainer) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.position = 'absolute';
            particle.style.width = `${3 + Math.random() * 5}px`;
            particle.style.height = particle.style.width;
            particle.style.backgroundColor = color;
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = `0 0 10px ${color}`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.opacity = Math.random();
            
            // Vitesse et direction aléatoires
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            particlesContainer.appendChild(particle);
            
            // Animation de la particule
            let posX = x;
            let posY = y;
            let opacity = 1;
            
            const animateParticle = () => {
                posX += vx;
                posY += vy;
                opacity -= 0.01;
                
                particle.style.left = `${posX}px`;
                particle.style.top = `${posY}px`;
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particlesContainer.removeChild(particle);
                }
            };
            
            animateParticle();
        }
    }
    
    // Effet de réussite
    successEffect(element) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.createParticles(x, y, 30, '#22c55e');
    }
    
    // Effet d'échec
    failureEffect(element) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.createParticles(x, y, 20, '#ef4444');
    }
    
    // Effet de montée de niveau
    levelUpEffect() {
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;
        
        this.createParticles(x, y, 100, '#ffd700');
        
        // Faire pulser le portail
        const portalElement = document.getElementById('magic-portal');
        if (portalElement) {
            portalElement.style.opacity = '0.8';
            portalElement.style.transform = 'translate(-50%, -50%) scale(1.5)';
            
            setTimeout(() => {
                portalElement.style.opacity = '0';
                portalElement.style.transform = 'translate(-50%, -50%) scale(0)';
            }, 2000);
        }
    }
    
    // Animation de la scène Three.js
    animate() {
        if (!this.scene || !this.camera || !this.renderer) return;
        
        requestAnimationFrame(() => this.animate());
        
        // Rotation des étoiles
        this.stars.forEach(star => {
            star.rotation.x += 0.0005;
            star.rotation.y += 0.0005;
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Gestion du redimensionnement
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Utiliser des effets de secours si Three.js n'est pas disponible
    useFallbackEffects() {
        // Générer un motif de runes pour l'arrière-plan
        this.generateRunePattern();
        
        // Créer un portail magique
        this.createMagicPortal();
    }
}

// Exporter la classe
window.GameEffects = GameEffects; 