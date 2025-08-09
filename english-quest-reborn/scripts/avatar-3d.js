/*
 * Avatar 3D Renderer - Compositing saved profile avatar parts in a lightweight 3D scene
 * - Uses Three.js planes with textures (head/body/accessory) to fake depth and add game-like polish
 * - Provides a window.enigmaAvatar-compatible API (reactToScoreIncrease, reactToCombo, etc.)
 * - Falls back gracefully if WebGL/THREE is unavailable
 */

(function installAvatar3D() {
  const hasThree = typeof window.THREE !== 'undefined';

  function getStoredUser() {
    try {
      const data = localStorage.getItem('english_quest_current_user') || localStorage.getItem('currentUser');
      return data ? JSON.parse(data) : null;
    } catch (_) { return null; }
  }

  function normalizeAvatar(avatar) {
    const v = avatar || {};
    const result = {
      head: v.head || 'default_boy_head',
      body: v.body || 'default_boy_body',
      accessory: (v.accessory && v.accessory !== 'none') ? v.accessory : 'default',
      background: v.background || 'default_background'
    };
    return result;
  }

  function mapSkinIdToFile(id, type) {
    // Convert new IDs to file stems
    if (type === 'head') {
      if (id.endsWith('_head')) return id.replace('_head', '');
      return id;
    }
    if (type === 'body') {
      if (id.endsWith('_body')) return id.replace('_body', '');
      return id;
    }
    if (type === 'background') {
      if (id.endsWith('_background')) return id.replace('_background', '');
      return id;
    }
    return id;
  }

  function resolveAvatarAssetPaths(avatar) {
    const base = '../assets/avatars/';
    const headFile = mapSkinIdToFile(avatar.head, 'head');
    const bodyFile = mapSkinIdToFile(avatar.body, 'body');
    const bgFile = mapSkinIdToFile(avatar.background, 'background');
    const accFile = avatar.accessory === 'default' ? 'default' : avatar.accessory;
    return {
      head: `${base}heads/${headFile}.png`,
      body: `${base}bodies/${bodyFile}.png`,
      background: `${base}backgrounds/${bgFile}.png`,
      accessory: `${base}accessories/${accFile}.png`
    };
  }

  class Avatar3DRenderer {
    constructor() {
      this.container = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.root = null; // group for whole avatar
      this.planes = {};
      this.clock = null;
      this.anim = { t: 0, reacting: false };
      this.user = getStoredUser() || { username: 'Joueur', avatar: {} };
      this.avatar = normalizeAvatar(this.user.avatar);
      this.assets = resolveAvatarAssetPaths(this.avatar);
      this.active = false;
      this._raf = null;
    }

    ensureContainer() {
      let el = document.getElementById('ultra-adventurer');
      if (!el) {
        el = document.createElement('div');
        el.id = 'ultra-adventurer';
        el.className = 'ultra-reactive-adventurer';
        document.body.appendChild(el);
      }
      // Force a compact, game-like size overriding any !important CSS
      const setImp = (prop, value) => el.style.setProperty(prop, value, 'important');
      setImp('position', 'fixed');
      setImp('right', '24px');
      setImp('bottom', '24px');
      setImp('width', '180px');
      setImp('height', '260px');
      setImp('min-width', '160px');
      setImp('min-height', '240px');
      setImp('max-width', '260px');
      setImp('max-height', '380px');
      setImp('z-index', '2000');
      this.container = el;
    }

    init() {
      this.ensureContainer();
      if (hasThree) {
        this.initThree();
      }
      // Always render DOM overlay for perfect alignment
      this.renderFallback();
      if (hasThree) {
        this.loadAurasOnly();
        this.animate();
        this.raiseDomAboveCanvas();
      }
      this.installAPI(!hasThree);
    }

    renderFallback() {
      // DOM overlay using exact CSS classes to mirror profile layout
      const html = `
        <div class="adventurer-avatar-ultra" style="position: absolute; inset: 0; z-index: 2;">
          <div class="avatar-display-ultra">
            <img src="${this.assets.body}" class="avatar-body-ultra" onerror="this.src='../assets/avatars/bodies/default_boy.png'">
            <img src="${this.assets.head}" class="avatar-head-ultra" onerror="this.src='../assets/avatars/heads/default_boy.png'">
            <div class="avatar-accessory-ultra">
              <img src="${this.assets.accessory}" onerror="this.style.display='none'">
            </div>
          </div>
        </div>`;
      // Keep existing children (e.g., WebGL canvas), append overlay
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      this.container.appendChild(wrapper.firstElementChild);
      this.domWrapper = this.container.querySelector('.adventurer-avatar-ultra');
      this.active = true;
    }

    initThree() {
      this.scene = new THREE.Scene();
      const aspect = this.container.clientWidth / Math.max(1, this.container.clientHeight);
      // Orthographic camera for crisp UI-like look
      const w = 2.8, h = w / aspect;
      this.camera = new THREE.OrthographicCamera(-w, w, h, -h, 0.01, 10);
      this.camera.position.set(0, 0, 5);
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1.0, 2));
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      // Place canvas as background layer
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.inset = '0';
      this.renderer.domElement.style.zIndex = '1';
      this.container.appendChild(this.renderer.domElement);
      this.clock = new THREE.Clock();

      // Subtle background gradient using CSS to emulate polished UI
      this.container.style.background = 'radial-gradient(ellipse at bottom, rgba(255,255,255,0.04), rgba(0,0,0,0) 70%)';
      window.addEventListener('resize', () => this.onResize());

      // Root group for auras/effects behind DOM
      this.root = new THREE.Group();
      this.scene.add(this.root);

      // Mouse parallax for more depth
      this.container.addEventListener('mousemove', (e) => {
        const rect = this.container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        const maxRot = 0.18; // radians
        this.root.rotation.y = -nx * maxRot;
        this.root.rotation.x = ny * maxRot * 0.6;
      });
    }

    createPlane(textureUrl, size = { w: 1, h: 1 }, z = 0) {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(textureUrl);
      tex.anisotropy = 4;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: true });
      const geo = new THREE.PlaneGeometry(size.w, size.h);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = z;
      return mesh;
    }

    loadAurasOnly() {
      // Aura/ambient planes only (DOM handles precise alignment of parts)
      const aura = this.createPlane('../assets/avatars/accessories/default.png', { w: 3.0, h: 3.8 }, -0.05);
      aura.material.opacity = 0.25;
      const shadow = this.createPlane('../assets/avatars/accessories/default.png', { w: 2.2, h: 0.5 }, -0.06);
      shadow.material.opacity = 0.18;
      shadow.position.y = -0.9;
      this.root.add(aura);
      this.root.add(shadow);
      this.planes = { aura, shadow };
      this.active = true;
    }

    onResize() {
      if (!this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.renderer.setSize(w, h);
      const aspect = w / Math.max(1, h);
      const worldW = 2.0, worldH = worldW / aspect;
      this.camera.left = -worldW;
      this.camera.right = worldW;
      this.camera.top = worldH;
      this.camera.bottom = -worldH;
      this.camera.updateProjectionMatrix();
    }

    animate() {
      if (!this.active) return;
      const dt = this.clock ? this.clock.getDelta() : 0.016;
      this.anim.t += dt;
      const t = this.anim.t;

      // Idle breathing and head bobbing
      if (this.root) {
        // Global idle breathing
        const s = 1 + Math.sin(t * 1.2) * 0.035;
        this.root.scale.set(s, s, 1);
      }
      if (this.planes.aura) {
        const pulse = 0.22 + (Math.sin(t * 2.0) * 0.12 + 0.1);
        this.planes.aura.material.opacity = pulse;
        this.planes.aura.scale.setScalar(1 + Math.sin(t * 1.2) * 0.05);
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this._raf = requestAnimationFrame(() => this.animate());
    }

    // Reactions
    pulse(scale = 1.12, duration = 250) {
      if (!this.domWrapper) return;
      const start = performance.now();
      const base = 1;
      const anim = (now) => {
        const k = Math.min(1, (now - start) / duration);
        const s = base + (scale - base) * Math.sin(k * Math.PI);
        this.domWrapper.style.transform = `scale(${s})`;
        this.domWrapper.style.transformOrigin = 'center bottom';
        if (k < 1) requestAnimationFrame(anim);
        else this.domWrapper.style.transform = '';
      };
      requestAnimationFrame(anim);
    }

    spin(duration = 600) {
      if (!this.domWrapper) return;
      const start = performance.now();
      const anim = (now) => {
        const k = Math.min(1, (now - start) / duration);
        const deg = k * 360;
        this.domWrapper.style.transform = `rotate(${deg}deg)`;
        this.domWrapper.style.transformOrigin = 'center bottom';
        if (k < 1) requestAnimationFrame(anim);
        else this.domWrapper.style.transform = '';
      };
      requestAnimationFrame(anim);
    }

    shake(duration = 300, intensity = 0.05) {
      if (!this.domWrapper) return;
      const start = performance.now();
      const anim = (now) => {
        const k = Math.min(1, (now - start) / duration);
        const amp = intensity * (1 - k);
        const x = (Math.random() - 0.5) * 2 * amp;
        const y = (Math.random() - 0.5) * 2 * amp;
        this.domWrapper.style.transform = `translate(${x * 50}px, ${y * 40}px)`;
        if (k < 1) requestAnimationFrame(anim);
        else {
          this.domWrapper.style.transform = '';
        }
      };
      requestAnimationFrame(anim);
    }

    raiseDomAboveCanvas() {
      if (!this.domWrapper) return;
      this.domWrapper.style.zIndex = '2';
    }

    auraBurst(type = 'success', duration = 800) {
      if (!this.planes.aura) return;
      const col = type === 'fire' ? 0xff4500 : (type === 'victory' ? 0xffd700 : 0x2ecc71);
      this.planes.aura.material.color = new THREE.Color(col);
      const start = performance.now();
      const anim = (now) => {
        const k = Math.min(1, (now - start) / duration);
        this.planes.aura.material.opacity = 0.2 + (1 - k) * 0.6;
        this.planes.aura.scale.setScalar(1 + k * 0.35);
        if (k < 1) requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);
    }

    // Public API
    reactToGameStart() { this.pulse(1.15, 300); this.auraBurst('victory', 900); }
    reactToNewGame() { this.pulse(1.1, 250); }
    reactToScoreIncrease(points) {
      if (points >= 50) { this.spin(700); this.auraBurst('victory', 1200); }
      else if (points >= 20) { this.pulse(1.14, 350); this.auraBurst('success', 900); }
      else { this.pulse(1.08, 250); }
    }
    reactToCombo(combo) {
      if (combo >= 5) { this.spin(600); this.auraBurst('fire', 1100); }
      else if (combo >= 3) { this.pulse(1.12, 320); }
      else { this.pulse(1.06, 220); }
    }
    reactToPowerUp(type) {
      if (type === 'time') { this.spin(500); this.auraBurst('victory', 900); }
      else if (type === 'hint') { this.pulse(1.1, 280); this.auraBurst('success', 800); }
      else { this.pulse(1.12, 300); }
    }
    reactToGameMessage(msg) {
      const m = String(msg || '').toLowerCase();
      if (m.includes('non valide') || m.includes('invalid')) this.shake(350, 0.06);
      if (m.includes('félicitations') || m.includes('bravo') || m.includes('congrats')) this.auraBurst('victory', 1200);
    }
    playAnimation(type) {
      const map = {
        physicalHop: () => this.pulse(1.12, 250),
        physicalSpin: () => this.spin(600),
        physicalShake: () => this.shake(350, 0.06),
        physicalGlow: () => this.auraBurst('success', 900)
      };
      (map[type] || map.physicalHop)();
    }
  }

  function initAvatar3D() {
    try {
      const renderer = new Avatar3DRenderer();
      renderer.init();

      // Expose compact API compatible with window.enigmaAvatar usage
      window.enigmaAvatar = {
        reactToKeyboardClick: () => {},
        reactToLetterDeletion: () => {},
        reactToWordSubmission: () => renderer.pulse(1.08, 220),
        reactToPowerUp: (t) => renderer.reactToPowerUp(t),
        reactToGameStart: () => renderer.reactToGameStart(),
        reactToNewGame: () => renderer.reactToNewGame(),
        reactToScoreIncrease: (p) => renderer.reactToScoreIncrease(p),
        reactToCombo: (c) => renderer.reactToCombo(c),
        reactToGameMessage: (m) => renderer.reactToGameMessage(m),
        playAnimation: (a) => renderer.playAnimation(a),
        isInitialized: true
      };
      return true;
    } catch (e) {
      console.error('[Avatar3D] Init error:', e);
      return false;
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAvatar3D);
  } else {
    initAvatar3D();
  }
})();


