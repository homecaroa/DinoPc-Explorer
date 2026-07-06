/**
 * DinoPC Explorer — app.js
 * Estado global, transiciones de pantalla, settings y recompensas.
 */

// Suprimir error de extensiones del navegador (no es un bug del juego)
window.addEventListener('unhandledrejection', function(e) {
  if (e.reason && e.reason.message &&
      e.reason.message.includes('message channel closed')) {
    e.preventDefault();
  }
});

const App = {

  state: {
    currentScreen: 'splash',
    unlockedDinos: JSON.parse(localStorage.getItem('dinopc_unlocked') || '[]'),
    settings:      JSON.parse(localStorage.getItem('dinopc_settings')  || '{"labName":"DinoPC Lab","accent":"neon"}'),
    fileSystem: {
      name:      'Mis Expediciones',
      type:      'folder',
      maxSpace:  1000,   // KB disponibles (se ajusta por misión en Mission.init())
      usedSpace: 0,      // KB actualmente usados
      children:  {}
    }
  },

  // ─── Arranque ─────────────────────────────────────

  init() {
    DinoLog.load();
    AudioEngine.init();
    this._applyAccent(this.state.settings.accent);
    // Si ya hay un perfil activo, ir a splash directamente
    if (Auth.isLoggedIn()) {
      this.showSplash();
    } else {
      this.showScreen('login');
    }
    console.log('🦕 DinoPC Explorer v1.1 iniciado');
  },

  // ─── Navegación ───────────────────────────────────

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    this.state.currentScreen = id;
  },

  showSplash() {
    AudioEngine.stopAmbient();
    this.showScreen('splash');
    // Mostrar nombre del explorador activo si existe
    const user = Auth.getUser();
    const hint = document.querySelector('.splash-version');
    if (hint && user) hint.textContent = '👤 ' + user.username + ' · v1.0 · 🦕 DinoPC Labs';
  },

  /** Botón JUGAR del splash → va a login si no hay sesión */
  goToLogin() {
    if (Auth.isLoggedIn()) {
      this.startGame();
    } else {
      this.showScreen('login');
    }
  },

  /** Callback tras login/registro exitoso en Auth */
  onAuthSuccess(user) {
    this.showSplash();
    Desktop.showGuide && setTimeout(() =>
      Desktop.showGuide && Desktop.showGuide('¡Hola, ' + user.username + '! 🦕 Bienvenido al laboratorio.'), 200
    );
  },

  /**
   * Desde el botón JUGAR: nuevos jugadores ven el tutorial,
   * jugadores que ya desbloquearon algo van directo al escritorio.
   */
  startGame() {
    if (this.state.unlockedDinos.length === 0) {
      Tutorial.show();
    } else {
      this.startDesktop();
    }
  },

  /** Inicia el escritorio (llamado desde tutorial o directamente) */
  startDesktop() {
    this.state.fileSystem.children  = {};
    this.state.fileSystem.usedSpace = 0;
    this.showScreen('desktop');
    Desktop.init();
    Mission.init();
    DinoLog.track('session');
    Achievements.resetSession();
    this._applyLabName(this.state.settings.labName);
    AudioEngine.startAmbient();
    // Sincronizar botón de sonido en taskbar
    const btn = document.getElementById('tb-sound');
    if (btn) btn.textContent = AudioEngine.isMuted ? '🔇' : '🔊';
  },

  showCollection() {
    this.showScreen('collection');
    Collection.render();
  },

  // ─── Desbloqueo de dinosaurios ───────────────────

  unlockDino(dinoId) {
    const dino = Collection.data[dinoId];
    if (!dino) return;

    if (!this.state.unlockedDinos.includes(dinoId)) {
      this.state.unlockedDinos.push(dinoId);
      localStorage.setItem('dinopc_unlocked', JSON.stringify(this.state.unlockedDinos));
      Achievements.check('dino-unlock', this.state.unlockedDinos.length);
      // Logro final: todos los dinos desbloqueables
      Achievements.check('all-dinos-unlocked', this.state.unlockedDinos.length);
    }

    this._renderReward(dino);
    document.getElementById('reward-modal').classList.remove('hidden');
  },

  closeReward() {
    document.getElementById('reward-modal').classList.add('hidden');
    if (!Mission.allComplete) {
      // Resetear filesystem y reiniciar misión completa
      App.state.fileSystem.children  = {};
      App.state.fileSystem.usedSpace = 0;
      Mission.init(); // resetea pasos, hadNoOverflow, maxSpace, muestra intro
    }
  },

  // ─── Settings ────────────────────────────────────

  applySettings({ labName, accent }) {
    this.state.settings = { labName, accent };
    localStorage.setItem('dinopc_settings', JSON.stringify(this.state.settings));
    this._applyAccent(accent);
    this._applyLabName(labName);
  },

  _applyAccent(key) {
    const schemes = (typeof Settings !== 'undefined') ? Settings.SCHEMES : null;
    if (!schemes || !schemes[key]) return;
    const s = schemes[key];
    document.documentElement.style.setProperty('--neon',      s.neon);
    document.documentElement.style.setProperty('--neon-dim',  s.dim);
    document.documentElement.style.setProperty('--neon-glow', s.neon + '33');
  },

  _applyLabName(name) {
    const tbStart = document.querySelector('.tb-start');
    if (tbStart) tbStart.innerHTML = `<span>🦕</span> ${name}`;
    const smName = document.querySelector('.sm-info b');
    if (smName) smName.textContent = name;
  },

  // ─── Reward modal ─────────────────────────────────

  _renderReward(dino) {
    document.getElementById('reward-name').textContent = dino.name;

    const artEl = document.getElementById('reward-dino-art');
    if (dino.cardImg) {
      artEl.innerHTML = `
        <img src="${dino.cardImg}" class="reward-dino-img" alt="${dino.name}"
             onerror="this.replaceWith(Object.assign(document.createElement('span'),
               {textContent:'${dino.emoji}',style:'font-size:60px'}))">`;
    } else {
      artEl.textContent = dino.emoji;
    }

    document.getElementById('reward-stats').innerHTML = `
      <div><b>⚖️ Peso</b><span>${dino.weight}</span></div>
      <div><b>📏 Longitud</b><span>${dino.size}</span></div>
      <div><b>🍖 Dieta</b><span>${dino.diet}</span></div>
      <div><b>🕰️ Período</b><span>${dino.period}</span></div>`;

    document.getElementById('reward-fact').textContent = '💡 ' + dino.fact;
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());

/* ═══════════════════════════════════════════════════
   PROMPT HUNTER — incrustado en app.js para evitar
   un script tag separado (prompt_hunter.js -> 404)
   ═══════════════════════════════════════════════════ */
const PromptHunter = {
  CHALLENGES: [
    { id:1,
      scenario:'🤖 El robot está en (0,5) mirando al norte. Fósil en (0,2). Almacén en (0,0).',
      task:'¿Cuál es la secuencia correcta para recoger el fósil y entregarlo?',
      options:[
        {text:'AVANZAR×3, RECOGER, AVANZAR×2, SOLTAR', score:100, feedback:'✅ ¡Perfecto! Secuencia exacta.'},
        {text:'AVANZAR muchas veces y luego RECOGER',   score:20,  feedback:'❌ Impreciso. Los robots necesitan instrucciones exactas.'},
        {text:'Ir al norte, coger cosa, llevar a caja', score:5,   feedback:'❌ Los robots no entienden lenguaje vago.'},
        {text:'REPETIR 6 AVANZAR, RECOGER, SOLTAR',    score:30,  feedback:'⚠️ El REPETIR es excesivo — solo hay 3 casillas hasta el fósil.'}
      ], best:0 },
    { id:2,
      scenario:'🤖 Debes inspeccionar 4 casillas en fila.',
      task:'¿Cuál es la instrucción más eficiente?',
      options:[
        {text:'AVANZAR, AVANZAR, AVANZAR, AVANZAR', score:70,  feedback:'✅ Correcto pero no óptimo — puedes usar REPETIR.'},
        {text:'REPETIR 4 AVANZAR',                  score:100, feedback:'✅ ¡Perfecto! REPETIR es más claro y eficiente.'},
        {text:'REPETIR 3 AVANZAR',                  score:20,  feedback:'❌ Solo inspecciona 3 casillas.'},
        {text:'AVANZAR hasta el final',              score:0,   feedback:'❌ "Hasta el final" no es una instrucción válida.'}
      ], best:1 },
    { id:3,
      scenario:'🤖 El robot puede encontrar fósil 🦴 o roca 🪨.',
      task:'¿Cómo recoge SOLO los fósiles?',
      options:[
        {text:'RECOGER todo lo que encuentre',  score:10,  feedback:'❌ Recogerá también rocas.'},
        {text:'SI hay_fosil → RECOGER',         score:100, feedback:'✅ ¡Exacto! La condición SI filtra correctamente.'},
        {text:'SI hay_roca → RECOGER',          score:0,   feedback:'❌ Al revés — recogería rocas, no fósiles.'},
        {text:'AVANZAR y luego decidir',        score:5,   feedback:'❌ "Decidir" no es una instrucción ejecutable.'}
      ], best:1 },
    { id:4,
      scenario:'🐛 Error: REPETIR 2 AVANZAR cuando debería avanzar 5 casillas.',
      task:'¿Cuál es la descripción más precisa del bug?',
      options:[
        {text:'El robot no llega. Hay que arreglarlo.',              score:10,  feedback:'❌ Demasiado vago.'},
        {text:'El número del REPETIR es incorrecto: dice 2, debe ser 5.', score:100, feedback:'✅ ¡Diagnóstico preciso!'},
        {text:'Falta un AVANZAR al final.',                         score:30,  feedback:'⚠️ Parcial — no identifica el REPETIR como causa.'},
        {text:'El programa está roto.',                             score:0,   feedback:'❌ No aporta información útil.'}
      ], best:1 },
    { id:5,
      scenario:'⚙️ Regla para enviar fósiles pesados (>5000 kg) al almacén especial.',
      task:'¿Cuál es la regla correcta en formato SI/ENTONCES?',
      options:[
        {text:'SI fósil es grande → almacén especial', score:20,  feedback:'❌ "Grande" es subjetivo.'},
        {text:'SI peso > 5000 → almacén_pesado',       score:100, feedback:'✅ ¡Perfecto! Condición numérica precisa.'},
        {text:'SI peso = 5000 → almacén_pesado',       score:50,  feedback:'⚠️ = solo aplica exactamente a 5000.'},
        {text:'Mover los pesados al especial',         score:5,   feedback:'❌ Sin formato SI/ENTONCES ni valor numérico.'}
      ], best:1 }
  ],
  _current:0, _total:0, _answers:[], _completed:false,

  buildHTML() {
    return `<div class="ph-wrap" id="ph-wrap">
      <div class="ph-header">
        <div class="ph-title">🎯 Prompt Hunter</div>
        <div class="ph-progress" id="ph-progress">1 / ${this.CHALLENGES.length}</div>
        <div class="ph-score-display" id="ph-score-display">Puntos: 0</div>
      </div>
      <div class="ph-challenge" id="ph-challenge"></div>
      <div class="ph-final hidden" id="ph-final"></div>
    </div>`;
  },

  init() {
    this._current=0; this._total=0; this._answers=[]; this._completed=false;
    this._render();
  },

  _render() {
    const ch=this.CHALLENGES[this._current], el=document.getElementById('ph-challenge');
    const p=document.getElementById('ph-progress');
    if(p) p.textContent=(this._current+1)+' / '+this.CHALLENGES.length;
    if(!el) return;
    el.innerHTML=`<div class="ph-scenario">${ch.scenario}</div>
      <div class="ph-task">❓ <strong>${ch.task}</strong></div>
      <div class="ph-options">${ch.options.map((o,i)=>
        `<button class="ph-option" id="ph-opt-${i}" onclick="PromptHunter.answer(${i})">
          <span class="ph-opt-label">${String.fromCharCode(65+i)}.</span>${o.text}</button>`
      ).join('')}</div>
      <div class="ph-feedback hidden" id="ph-feedback"></div>
      <button class="btn-primary ph-next hidden" id="ph-next" onclick="PromptHunter.next()">
        ${this._current+1<this.CHALLENGES.length?'Siguiente →':'Ver resultado →'}</button>`;
  },

  answer(idx) {
    const ch=this.CHALLENGES[this._current], opt=ch.options[idx];
    document.querySelectorAll('.ph-option').forEach((b,i)=>{
      b.disabled=true;
      if(i===idx)     b.classList.add(opt.score>=80?'ph-correct':'ph-wrong');
      if(i===ch.best) b.classList.add('ph-best');
    });
    this._total+=opt.score;
    const fb=document.getElementById('ph-feedback');
    if(fb){ fb.innerHTML=`<div class="ph-fb-score ${opt.score>=80?'good':'bad'}">+${opt.score} pts</div><div class="ph-fb-text">${opt.feedback}</div>`; fb.classList.remove('hidden'); }
    const nx=document.getElementById('ph-next'); if(nx) nx.classList.remove('hidden');
    const sc=document.getElementById('ph-score-display'); if(sc) sc.textContent='Puntos: '+this._total;
    if(typeof AudioEngine!=='undefined') AudioEngine.play(opt.score>=80?'success':'error');
  },

  next() {
    this._current++;
    if(this._current>=this.CHALLENGES.length) this._final();
    else this._render();
  },

  _final() {
    const max=this.CHALLENGES.length*100, pct=Math.round(this._total/max*100);
    const stars=pct>=85?'⭐⭐⭐':pct>=60?'⭐⭐':'⭐';
    const title=pct>=85?'¡MAESTRO DE INSTRUCCIONES!':pct>=60?'¡BUEN TRABAJO!':'¡SIGUE PRACTICANDO!';
    const ch=document.getElementById('ph-challenge'), fi=document.getElementById('ph-final');
    if(ch) ch.classList.add('hidden');
    if(fi){ fi.classList.remove('hidden');
      fi.innerHTML=`<div class="ph-final-stars">${stars}</div><div class="ph-final-title">${title}</div>
        <div class="ph-final-score">${this._total}/${max} pts (${pct}%)</div>
        <p class="ph-final-msg">La precisión es la base de la programación. ¡Lo demostraste!</p>
        <button class="btn-primary" onclick="PromptHunter.init()">🔄 Jugar de nuevo</button>`; }
    if(typeof AudioEngine!=='undefined') AudioEngine.play('mission-complete');
    if(typeof Mission!=='undefined') Mission.onAction('complete-hunt',{score:this._total,pct});
    if(typeof Achievements!=='undefined') Achievements.check('prompt-hunter-score',pct);
    if(typeof DinoLog!=='undefined') DinoLog.track('step');
    if(typeof Desktop!=='undefined') Desktop.showGuide('🎯 Prompt Hunter: '+pct+'% precisión '+stars,5000);
  }
};
