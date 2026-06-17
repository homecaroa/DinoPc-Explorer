/**
 * DinoPC Explorer — robot.js
 * Laboratorio de Robots: programación visual con instrucciones simples.
 * Misión 11 — ExcavadorMK1
 */

const RobotLab = {

  COLS: 6, ROWS: 6,

  // ─── Niveles ──────────────────────────────────────
  LEVELS: [
    {
      id: 1, name: 'Primer Viaje',
      desc: 'El robot debe recoger el fósil y llevarlo al almacén. Usa AVANZAR y RECOGER.',
      robot:   { x:0, y:5, dir:'N' },
      items:   [{ x:0, y:2, kind:'fosil', emoji:'🦴', id:'f1' }],
      targets: [{ x:0, y:0, emoji:'📦', label:'Almacén' }],
      hint: '💡 Necesitas: AVANZAR (×3) → RECOGER → AVANZAR (×2) → SOLTAR'
    },
    {
      id: 2, name: 'Bucle Eficiente',
      desc: 'El camino es largo. Usa REPETIR para no repetir la misma instrucción una y otra vez.',
      robot:   { x:2, y:5, dir:'N' },
      items:   [{ x:2, y:1, kind:'fosil', emoji:'🦕', id:'f2' }],
      targets: [{ x:5, y:1, emoji:'🗄️', label:'Almacén B' }],
      hint: '💡 REPETIR 4 AVANZAR → RECOGER → GIRAR DERECHA → REPETIR 3 AVANZAR → SOLTAR'
    },
    {
      id: 3, name: 'Decisión Inteligente',
      desc: 'Hay una roca en el camino. Usa SI para recoger solo si hay un fósil.',
      robot:   { x:3, y:5, dir:'N' },
      items:   [
        { x:3, y:3, kind:'roca',  emoji:'🪨', id:'r1' },
        { x:3, y:1, kind:'fosil', emoji:'🦴', id:'f3' }
      ],
      targets: [{ x:3, y:0, emoji:'🔬', label:'Laboratorio' }],
      hint: '💡 AVANZAR(×2) → SI hay_fosil RECOGER → AVANZAR → SI hay_fosil RECOGER → AVANZAR → SOLTAR'
    }
  ],

  // ─── Estado ───────────────────────────────────────
  robot:    { x:0, y:5, dir:'N', holding:null },
  items:    [],
  targets:  [],
  program:  [],
  _lvl:     0,
  _running: false,
  _won:     false,

  INST_DEFS: [
    { type:'AVANZAR',    emoji:'⬆️', label:'AVANZAR',        color:'#00cc88' },
    { type:'RETROCEDER', emoji:'⬇️', label:'RETROCEDER',     color:'#4488ff' },
    { type:'GIRAR_IZQ',  emoji:'↺',  label:'GIRAR IZQ',      color:'#aa66ff' },
    { type:'GIRAR_DER',  emoji:'↻',  label:'GIRAR DER',      color:'#ff8800' },
    { type:'RECOGER',    emoji:'✋', label:'RECOGER',         color:'#ffcc00' },
    { type:'SOLTAR',     emoji:'📤', label:'SOLTAR',          color:'#ff6688' },
    { type:'REPETIR',    emoji:'🔁', label:'REPETIR…',        color:'#22ddff' },
    { type:'SI',         emoji:'❓', label:'SI condición…',   color:'#dd88ff' }
  ],

  // ─── HTML ──────────────────────────────────────────
  buildHTML() {
    return `
    <div class="rl-wrap" id="rl-wrap">
      <div class="rl-top">
        <select class="rl-lvl-sel" id="rl-lvl-sel"
                onchange="RobotLab.loadLevel(parseInt(this.value))">
          ${this.LEVELS.map((l,i)=>`<option value="${i}">${l.id}. ${l.name}</option>`).join('')}
        </select>
        <span class="rl-status" id="rl-status">● Listo</span>
      </div>
      <div class="rl-desc" id="rl-desc"></div>
      <div class="rl-body">
        <div class="rl-grid-col">
          <div class="rl-grid" id="rl-grid"></div>
          <div class="rl-hint" id="rl-hint"></div>
        </div>
        <div class="rl-editor-col">
          <div class="rl-palette-title">Instrucciones:</div>
          <div class="rl-palette" id="rl-palette"></div>
          <div class="rl-prog-title">📋 Mi programa:
            <button class="rl-clear-btn" onclick="RobotLab.clearProgram()">🗑</button>
          </div>
          <div class="rl-program" id="rl-program"></div>
          <div class="rl-btns">
            <button class="btn-primary rl-run-btn" onclick="RobotLab.run()">▶ Ejecutar</button>
            <button class="btn-secondary" onclick="RobotLab.reset()">↺ Reset</button>
          </div>
        </div>
      </div>
    </div>`;
  },

  init() {
    this.loadLevel(0);
    this._renderPalette();
  },

  // ─── Nivel ────────────────────────────────────────
  loadLevel(idx) {
    this._lvl  = idx;
    this._won  = false;
    this._running = false;
    const lvl  = this.LEVELS[idx];
    this.robot   = { ...lvl.robot, holding: null };
    this.items   = lvl.items.map(i => ({ ...i }));
    this.targets = lvl.targets.map(t => ({ ...t, filled: 0 }));
    this.program = [];
    this._set('rl-desc', lvl.desc);
    this._set('rl-hint', lvl.hint);
    this._renderGrid();
    this._renderProgram();
    this._setStatus('● Listo', '');
  },

  // ─── Paleta ───────────────────────────────────────
  _renderPalette() {
    const p = document.getElementById('rl-palette');
    if (!p) return;
    p.innerHTML = this.INST_DEFS.map(d =>
      `<button class="rl-inst-btn" style="border-color:${d.color};color:${d.color}"
               onclick="RobotLab.addInstruction('${d.type}')" title="${d.label}">
         ${d.emoji} ${d.label}
       </button>`
    ).join('');
  },

  // ─── Programa ─────────────────────────────────────
  addInstruction(type) {
    if (this._running || this._won) return;
    if (type === 'REPETIR') {
      const count = this._askCount();
      if (!count) return;
      const action = this._askAction(['AVANZAR','RETROCEDER','GIRAR_IZQ','GIRAR_DER','RECOGER','SOLTAR']);
      if (!action) return;
      this.program.push({ type:'REPETIR', count, action });
    } else if (type === 'SI') {
      const cond = this._askCondition();
      if (!cond) return;
      const action = this._askAction(['AVANZAR','RETROCEDER','RECOGER','SOLTAR']);
      if (!action) return;
      this.program.push({ type:'SI', condition: cond, action });
    } else {
      this.program.push({ type });
    }
    AudioEngine.play('click');
    this._renderProgram();
  },

  _askCount() {
    const r = prompt('¿Cuántas veces? (2-6)', '3');
    const n = parseInt(r);
    return (!r || n < 1 || n > 6) ? null : n;
  },

  _askAction(options) {
    const defs = this.INST_DEFS.filter(d => options.includes(d.type));
    const labels = defs.map((d,i) => `${i+1}. ${d.emoji} ${d.label}`).join('\n');
    const r = prompt('¿Qué instrucción repetir?\n' + labels, '1');
    const idx = parseInt(r) - 1;
    return (idx >= 0 && idx < defs.length) ? defs[idx].type : null;
  },

  _askCondition() {
    const r = prompt('Condición:\n1. hay_fosil\n2. hay_roca\n3. llevo_algo', '1');
    return { '1':'hay_fosil','2':'hay_roca','3':'llevo_algo' }[r] || null;
  },

  clearProgram() {
    if (this._running) return;
    this.program = [];
    this._renderProgram();
  },

  removeInstruction(idx) {
    if (this._running) return;
    this.program.splice(idx, 1);
    this._renderProgram();
  },

  _renderProgram() {
    const el = document.getElementById('rl-program');
    if (!el) return;
    if (!this.program.length) {
      el.innerHTML = '<div class="rl-prog-empty">Añade instrucciones →</div>';
      return;
    }
    el.innerHTML = this.program.map((inst, i) => {
      const def   = this.INST_DEFS.find(d => d.type === inst.type) || {};
      let label   = (def.emoji || '?') + ' ' + inst.type;
      if (inst.type === 'REPETIR') label = `🔁 ×${inst.count} ${inst.action}`;
      if (inst.type === 'SI')      label = `❓ SI ${inst.condition} → ${inst.action}`;
      return `<div class="rl-prog-item" id="ri-${i}"
                   style="border-left:3px solid ${def.color||'#888'}">
                ${i+1}. ${label}
                <button class="rl-del-inst" onclick="RobotLab.removeInstruction(${i})">✕</button>
              </div>`;
    }).join('');
  },

  // ─── Ejecución ────────────────────────────────────
  async run() {
    if (this._running || !this.program.length) return;
    this._running = true;
    this.reset(true);  // reset grid only, keep program
    this._setStatus('⚙️ Ejecutando…', 'running');
    for (let i = 0; i < this.program.length && this._running; i++) {
      this._highlightStep(i);
      await this._execute(this.program[i]);
      await this._delay(480);
    }
    this._running = false;
    this._checkWin();
  },

  async _execute(inst) {
    switch (inst.type) {
      case 'AVANZAR':    this._move(1);  break;
      case 'RETROCEDER': this._move(-1); break;
      case 'GIRAR_IZQ':  this._turn('L'); break;
      case 'GIRAR_DER':  this._turn('R'); break;
      case 'RECOGER':    this._pickup();  break;
      case 'SOLTAR':     this._drop();    break;
      case 'REPETIR':
        for (let i = 0; i < inst.count && this._running; i++) {
          await this._execute({ type: inst.action });
          await this._delay(400);
        }
        break;
      case 'SI':
        if (this._checkCondition(inst.condition)) {
          await this._execute({ type: inst.action });
        }
        break;
    }
    this._renderGrid();
  },

  _move(steps) {
    const dirs = { N:[0,-1], S:[0,1], E:[1,0], W:[-1,0] };
    const [dx,dy] = dirs[this.robot.dir];
    const nx = this.robot.x + dx * steps;
    const ny = this.robot.y + dy * steps;
    if (nx >= 0 && nx < this.COLS && ny >= 0 && ny < this.ROWS) {
      this.robot.x = nx; this.robot.y = ny;
    } else {
      AudioEngine.play('error');
    }
  },

  _turn(side) {
    const seq = ['N','E','S','W'];
    const i   = seq.indexOf(this.robot.dir);
    this.robot.dir = seq[(i + (side === 'R' ? 1 : 3)) % 4];
  },

  _pickup() {
    const item = this.items.find(i =>
      i.x === this.robot.x && i.y === this.robot.y && i.kind !== 'roca');
    if (item && !this.robot.holding) {
      this.robot.holding = item;
      this.items = this.items.filter(i => i !== item);
      AudioEngine.play('coin');
    }
  },

  _drop() {
    if (!this.robot.holding) return;
    const tgt = this.targets.find(t => t.x === this.robot.x && t.y === this.robot.y);
    if (tgt) {
      tgt.filled = (tgt.filled || 0) + 1;
      this.robot.holding = null;
      AudioEngine.play('file-saved');
    } else {
      // Drop on ground
      this.items.push({ ...this.robot.holding, x: this.robot.x, y: this.robot.y });
      this.robot.holding = null;
    }
  },

  _checkCondition(cond) {
    switch (cond) {
      case 'hay_fosil':  return this.items.some(i => i.x===this.robot.x && i.y===this.robot.y && i.kind==='fosil');
      case 'hay_roca':   return this.items.some(i => i.x===this.robot.x && i.y===this.robot.y && i.kind==='roca');
      case 'llevo_algo': return !!this.robot.holding;
    }
    return false;
  },

  _checkWin() {
    const allDelivered = this.targets.every(t => t.filled > 0);
    const noFossilLeft = !this.items.some(i => i.kind === 'fosil');
    if (allDelivered || noFossilLeft) {
      this._won = true;
      this._setStatus('🏆 ¡Misión completada!', 'won');
      AudioEngine.play('mission-complete');
      Mission.onAction('run-robot', { level: this._lvl + 1 });
      Desktop.showGuide('🤖 ¡El robot completó la tarea! Nivel ' + (this._lvl+1) + ' superado.', 5000);
    } else {
      this._setStatus('❌ Robot parado. Revisa tu programa.', 'error');
      AudioEngine.play('error');
    }
  },

  // ─── Grid rendering ───────────────────────────────
  _renderGrid() {
    const el = document.getElementById('rl-grid');
    if (!el) return;
    const dirArrow = { N:'⬆', E:'➡', S:'⬇', W:'⬅' };
    const cells = [];
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        const isRobot  = this.robot.x === x && this.robot.y === y;
        const item     = this.items.find(i => i.x===x && i.y===y);
        const target   = this.targets.find(t => t.x===x && t.y===y);
        let cls = 'rl-cell';
        let content = '';
        if (isRobot) {
          cls += ' rl-robot';
          const holding = this.robot.holding ? this.robot.holding.emoji : '';
          content = `<span class="rl-robot-emoji">${dirArrow[this.robot.dir]}🤖</span>${holding?'<span class="rl-held">'+holding+'</span>':''}`;
        } else if (item) {
          content = `<span class="rl-item">${item.emoji}</span>`;
        } else if (target) {
          cls += target.filled ? ' rl-target-done' : ' rl-target';
          content = `<span>${target.emoji}</span><span class="rl-tlabel">${target.label}</span>`;
        }
        cells.push(`<div class="${cls}">${content}</div>`);
      }
    }
    el.style.gridTemplateColumns = `repeat(${this.COLS}, 1fr)`;
    el.innerHTML = cells.join('');
  },

  _highlightStep(i) {
    document.querySelectorAll('.rl-prog-item').forEach(el => el.classList.remove('rl-active'));
    const el = document.getElementById('ri-' + i);
    if (el) el.classList.add('rl-active');
  },

  reset(keepProgram = false) {
    this._running = false;
    const lvl = this.LEVELS[this._lvl];
    this.robot  = { ...lvl.robot, holding: null };
    this.items  = lvl.items.map(i => ({ ...i }));
    this.targets = lvl.targets.map(t => ({ ...t, filled: 0 }));
    this._won   = false;
    this._renderGrid();
    if (!keepProgram) { this.program = []; this._renderProgram(); }
    this._setStatus('● Listo', '');
  },

  // ─── Utils ────────────────────────────────────────
  _delay(ms) { return new Promise(r => setTimeout(r, ms)); },
  _set(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; },
  _setStatus(msg, cls) {
    const el = document.getElementById('rl-status');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'rl-status ' + (cls||'');
  }
};
