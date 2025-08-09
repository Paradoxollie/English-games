// DOM-only Avatar Renderer – aligne comme le profil et expose l'API enigmaAvatar
(function installGameAvatarDom() {
  function getUser() {
    try {
      const s = localStorage.getItem('english_quest_current_user') || localStorage.getItem('currentUser');
      return s ? JSON.parse(s) : null;
    } catch (_) { return null; }
  }
  function normalize(avatar) {
    const v = avatar || {};
    return {
      head: v.head || 'default_boy_head',
      body: v.body || 'default_boy_body',
      accessory: (v.accessory && v.accessory !== 'none') ? v.accessory : 'default',
      background: v.background || 'default_background',
    };
  }
  function mapId(id, type) {
    if (type === 'head' && id.endsWith('_head')) return id.replace('_head','');
    if (type === 'body' && id.endsWith('_body')) return id.replace('_body','');
    if (type === 'background' && id.endsWith('_background')) return id.replace('_background','');
    return id;
  }
  function assets(av) {
    const base = '../assets/avatars/';
    return {
      head: `${base}heads/${mapId(av.head,'head')}.png`,
      body: `${base}bodies/${mapId(av.body,'body')}.png`,
      accessory: `${base}accessories/${av.accessory === 'default' ? 'default' : av.accessory}.png`,
      background: `${base}backgrounds/${mapId(av.background,'background')}.png`,
    };
  }
  function ensureContainer() {
    let el = document.getElementById('ultra-adventurer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ultra-adventurer';
      el.className = 'ultra-reactive-adventurer';
      document.body.appendChild(el);
    }
    const setImp = (p,v)=> el.style.setProperty(p,v,'important');
    setImp('position','fixed');
    setImp('right','24px');
    setImp('bottom','24px');
    setImp('width','150px');
    setImp('height','220px');
    setImp('z-index','3000');
    setImp('display','block');
    setImp('visibility','visible');
    setImp('opacity','1');
    setImp('pointer-events','none');
    setImp('transform','translateZ(0)');
    return el;
  }
  function renderDOM(container, a) {
    const html = `
      <div class="adventurer-avatar-ultra" style="position: relative; width:100%; height:100%;">
        <div class="avatar-display-ultra">
          <img src="${a.body}" class="avatar-body-ultra" onerror="this.src='../assets/avatars/bodies/default_boy.png'">
          <img src="${a.head}" class="avatar-head-ultra" onerror="this.src='../assets/avatars/heads/default_boy.png'">
          <div class="avatar-accessory-ultra"><img src="${a.accessory}" onerror="this.style.display='none'"></div>
        </div>
      </div>
      <div class="adventure-effects-ultra" id="adventureEffectsUltra"></div>
      <div class="adventure-speech-bubble" id="adventureSpeech" style="display:none;"></div>
      <div class="adventure-aura" id="adventureAura"></div>
    `;
    // Avoid flicker: replace content atomically
    while (container.firstChild) container.removeChild(container.firstChild);
    container.insertAdjacentHTML('afterbegin', html);
  }
  function api(container) {
    const speech = () => container.querySelector('#adventureSpeech');
    const effects = () => container.querySelector('#adventureEffectsUltra');
    const aura = () => container.querySelector('#adventureAura');
    const avatar = () => container.querySelector('.adventurer-avatar-ultra');

    const showMsg = (text, duration=2000) => {
      const el = speech(); if (!el) return;
      el.textContent = text; el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, duration);
    };
    const doAnim = (css, time=800) => {
      const el = avatar(); if (!el) return;
      el.style.animation = '';
      void el.offsetWidth; // reflow
      el.style.animation = css;
      setTimeout(()=>{ el.style.animation = ''; }, time);
    };
    const pulse = (s=1.12, d=250) => {
      const el = avatar(); if (!el) return;
      el.style.transformOrigin = 'center bottom';
      el.style.transition = `transform ${d}ms ease-in-out`;
      el.style.transform = `scale(${s})`;
      setTimeout(()=>{ el.style.transform=''; }, d);
    };
    const shake = (d=300) => doAnim('physicalShake '+d+'ms ease-in-out', d);
    const auraBurst = (type='success', d=800) => {
      const el = aura(); if (!el) return;
      el.className = `adventure-aura ${type}-aura`;
      setTimeout(()=>{ el.className = 'adventure-aura'; }, d);
    };

    window.enigmaAvatar = {
      reactToKeyboardClick: ()=>{},
      reactToLetterDeletion: ()=>{},
      reactToWordSubmission: ()=> pulse(1.08,220),
      reactToPowerUp: (t)=> { if(t==='time'){ doAnim('physicalSpin 600ms ease-in-out'); auraBurst('victory',900);} else if(t==='hint'){ pulse(1.1,280); auraBurst('success',800);} else { pulse(1.12,300);} },
      reactToGameStart: ()=> { pulse(1.15,300); auraBurst('victory',900); },
      reactToNewGame: ()=> pulse(1.1,250),
      reactToScoreIncrease: (p)=> { if(p>=50){ doAnim('physicalSpin 700ms ease-in-out'); auraBurst('victory',1200);} else if(p>=20){ pulse(1.14,350); auraBurst('success',900);} else { pulse(1.08,250);} },
      reactToCombo: (c)=> { if(c>=5){ doAnim('physicalSpin 600ms ease-in-out'); auraBurst('fire',1100);} else if(c>=3){ pulse(1.12,320);} else { pulse(1.06,220);} },
      reactToGameMessage: (m='')=> { const mm=String(m).toLowerCase(); if(mm.includes('non valide')||mm.includes('invalid')) shake(350); if(mm.includes('félicitations')||mm.includes('bravo')||mm.includes('congrats')) auraBurst('victory',1200); },
      playAnimation: (a)=> { if(a==='physicalTilt'){ doAnim('physicalTilt 600ms ease-in-out'); } else if(a==='physicalBounce'){ doAnim('physicalBounce 900ms ease-in-out'); } else if(a==='physicalSpin'){ doAnim('physicalSpin 1000ms ease-in-out'); } else { pulse(1.1,250); } },
      isInitialized: true
    };
  }

  function init() {
    const user = getUser() || { username: 'Joueur', avatar: {} };
    const av = normalize(user.avatar);
    const container = ensureContainer();
    const a = assets(av);
    renderDOM(container, a);
    api(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



