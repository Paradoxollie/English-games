// Simple Game Events bus with lightweight UI banner
(function(){
  const listeners = new Map();

  function on(eventType, handler) {
    if (!listeners.has(eventType)) listeners.set(eventType, new Set());
    listeners.get(eventType).add(handler);
    return () => listeners.get(eventType)?.delete(handler);
  }

  function emit(eventType, payload = {}) {
    const set = listeners.get(eventType);
    if (set) {
      for (const h of set) {
        try { h(payload); } catch(e) { console.warn('[GameEvents] handler error', e); }
      }
    }
    // UI banner
    showBanner(eventType, payload);
  }

  function ensureStyles() {
    if (document.getElementById('game-events-styles')) return;
    const style = document.createElement('style');
    style.id = 'game-events-styles';
    style.textContent = `
      .game-event-banner { position: fixed; top: 80px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 8px; }
      .game-event-item { background: rgba(30,30,30,.95); color: #fff; border: 1px solid rgba(255,255,255,.1); border-left: 4px solid #2ecc71; padding: 10px 12px; border-radius: 10px; box-shadow: 0 6px 18px rgba(0,0,0,.3); font-family: 'Exo 2', sans-serif; min-width: 220px; opacity:.95; transform: translateX(30px); transition: transform .25s ease, opacity .25s ease; }
      .game-event-item.show { transform: translateX(0); }
      .game-event-item.error { border-left-color: #e74c3c; }
      .game-event-item.info { border-left-color: #3498db; }
      .game-event-item.record { border-left-color: #f1c40f; }
      .game-event-title { font-weight: 700; margin-bottom: 2px; }
      .game-event-desc { opacity: .85; font-size: .9rem; }
    `;
    document.head.appendChild(style);
  }

  function showBanner(type, payload) {
    ensureStyles();
    let container = document.querySelector('.game-event-banner');
    if (!container) {
      container = document.createElement('div');
      container.className = 'game-event-banner';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = 'game-event-item ' + (type === 'record' ? 'record' : type === 'error' ? 'error' : type === 'info' ? 'info' : '');
    const { points, combo, message, score } = payload || {};
    const titleMap = {
      'start': 'Départ !',
      'score': `+${points||0} points`,
      'combo': `Combo x${combo||1}`,
      'record': 'Nouveau record !',
      'end': 'Fin de partie',
      'error': 'Erreur',
      'info': 'Info'
    };
    const descMap = {
      'start': 'Bonne chance !',
      'score': message || 'Bien joué !',
      'combo': 'Continue !',
      'record': message || `Score: ${score||0}`,
      'end': message || `Score final: ${score||0}`
    };
    el.innerHTML = `<div class="game-event-title">${titleMap[type]||'Événement'}</div><div class="game-event-desc">${descMap[type]||''}</div>`;
    container.appendChild(el);
    requestAnimationFrame(()=> el.classList.add('show'));
    setTimeout(()=> {
      el.classList.remove('show');
      setTimeout(()=> el.remove(), 250);
    }, 2500);
  }

  window.gameEvents = { on, emit };
  window.emitGameEvent = (type, payload) => emit(type, payload);
  console.log('✅ [GameEvents] ready');
})();


