/**
 * DinoPC Explorer — debugger_lab.js
 * Modo Debugging: encuentra y corrige errores en programas de robot.
 * Misión 12 — TriceraBot
 */

const DebuggerLab = {

  CHALLENGES: [
    {
      id: 1,
      title: 'Dirección Equivocada',
      desc: 'El robot quería ir al norte pero el programa lo gira al lado incorrecto. Encuentra el error.',
      goal: 'Llevar el fósil desde (0,4) al almacén (0,0) en línea recta.',
      buggy: [
        { type:'AVANZAR',   correct:true  },
        { type:'AVANZAR',   correct:true  },
        { type:'GIRAR_DER', correct:false, fix:'GIRAR_IZQ', note:'⚠️ Debería ser GIRAR IZQ' },
        { type:'RECOGER',   correct:true  },
        { type:'AVANZAR',   correct:true  },
        { type:'AVANZAR',   correct:true  },
        { type:'SOLTAR',    correct:true  }
      ],
      explanation: 'El robot necesita girar a la IZQUIERDA para quedar mirando al almacén, no a la derecha.'
    },
    {
      id: 2,
      title: 'Repetición Incorrecta',
      desc: 'El REPETIR tiene el número equivocado. El robot se queda corto y no llega al fósil.',
      goal: 'Avanzar 5 casillas con un solo REPETIR.',
      buggy: [
        { type:'REPETIR', count:3, action:'AVANZAR', correct:false, fix:'REPETIR 5 AVANZAR', note:'⚠️ Debe ser ×5, no ×3' },
        { type:'RECOGER',  correct:true },
        { type:'REPETIR', count:2, action:'AVANZAR', correct:true },
        { type:'SOLTAR',   correct:true }
      ],
      explanation: 'El fósil está a 5 casillas de distancia. REPETIR 3 solo mueve 3 casillas, ¡le faltan 2!'
    },
    {
      id: 3,
      title: 'Error Lógico: SI mal puesto',
      desc: 'El SI está después de RECOGER. ¡Primero debes comprobar si hay un fósil antes de recogerlo!',
      goal: 'Recoger solo si hay un fósil (hay_fosil).',
      buggy: [
        { type:'AVANZAR',   correct:true },
        { type:'AVANZAR',   correct:true },
        { type:'RECOGER',   correct:false, fix:'SI hay_fosil → RECOGER', note:'⚠️ Falta el SI antes de RECOGER' },
        { type:'SI', condition:'hay_fosil', action:'AVANZAR', correct:false, fix:'(eliminar)', note:'⚠️ Este SI está de más' },
        { type:'SOLTAR',    correct:true }
      ],
      explanation: 'En programación, la condición SI siempre va ANTES de la acción que quiere controlar.'
    }
  ],

  _challenge: 0,
  _scanned:   false,
  _fixed:     [],
  _score:     0,

  buildHTML() {
    return `
    <div class="dbg-wrap" id="dbg-wrap">
      <div class="dbg-top">
        <div class="dbg-challenge-sel">
          ${this.CHALLENGES.map((c,i) =>
            `<button class="dbg-ch-btn" id="dbg-ch-${i}"
                     onclick="DebuggerLab.loadChallenge(${i})">${c.id}. ${c.title}</button>`
          ).join('')}
        </div>
        <span class="dbg-score" id="dbg-score">Errores encontrados: 0</span>
      </div>
      <div class="dbg-desc" id="dbg-desc"></div>
      <div class="dbg-goal" id="dbg-goal"></div>
      <div class="dbg-body">
        <div class="dbg-prog-wrap">
          <div class="dbg-prog-title">🐛 Programa con errores:</div>
          <div class="dbg-program" id="dbg-program"></div>
        </div>
        <div class="dbg-panel">
          <div class="dbg-panel-title">🔍 Panel de Diagnóstico</div>
          <div class="dbg-panel-content" id="dbg-panel">
            Pulsa "Escanear" para buscar errores.
          </div>
        </div>
      </div>
      <div class="dbg-controls">
        <button class="btn-primary"   onclick="DebuggerLab.scan()">🔍 Escanear bugs</button>
        <button class="btn-secondary" onclick="DebuggerLab.fixAll()">🔧 Corregir todo</button>
        <button class="btn-secondary" onclick="DebuggerLab.submit()">✅ Enviar corrección</button>
      </div>
      <div class="feat-status" id="dbg-status"></div>
    </div>`;
  },

  init() {
    this.loadChallenge(0);
  },

  loadChallenge(idx) {
    this._challenge = idx;
    this._scanned   = false;
    this._fixed     = [];
    const ch = this.CHALLENGES[idx];
    this._set('dbg-desc', ch.desc);
    this._set('dbg-goal', '🎯 Objetivo: ' + ch.goal);
    this._renderProgram(false);
    this._set('dbg-panel', 'Pulsa "Escanear" para buscar errores.');
    this._setStatus('', null);
    // Highlight selected button
    document.querySelectorAll('.dbg-ch-btn').forEach((b,i) =>
      b.classList.toggle('active', i === idx));
  },

  _renderProgram(showBugs) {
    const el  = document.getElementById('dbg-program');
    const ch  = this.CHALLENGES[this._challenge];
    if (!el) return;
    el.innerHTML = ch.buggy.map((inst, i) => {
      let label = this._instLabel(inst);
      let cls   = 'dbg-line';
      if (showBugs && !inst.correct) cls += ' dbg-bug';
      if (this._fixed.includes(i))   cls += ' dbg-fixed';
      const bugBadge = (showBugs && !inst.correct)
        ? `<span class="dbg-note">${inst.note}</span>` : '';
      const fixBadge = this._fixed.includes(i)
        ? `<span class="dbg-fix-note">✅ ${inst.fix}</span>` : '';
      return `<div class="${cls}" id="dbg-line-${i}">
                <span class="dbg-linenum">${i+1}.</span>
                <span class="dbg-inst">${label}</span>
                ${bugBadge}${fixBadge}
              </div>`;
    }).join('');
  },

  _instLabel(inst) {
    const defs = { AVANZAR:'⬆️ AVANZAR', RETROCEDER:'⬇️ RETROCEDER',
                   GIRAR_IZQ:'↺ GIRAR IZQ', GIRAR_DER:'↻ GIRAR DER',
                   RECOGER:'✋ RECOGER', SOLTAR:'📤 SOLTAR' };
    if (inst.type === 'REPETIR') return `🔁 REPETIR ×${inst.count} ${inst.action}`;
    if (inst.type === 'SI')      return `❓ SI ${inst.condition} → ${inst.action}`;
    return defs[inst.type] || inst.type;
  },

  scan() {
    this._scanned = true;
    const ch   = this.CHALLENGES[this._challenge];
    const bugs = ch.buggy.filter(i => !i.correct);
    AudioEngine.play('error');
    this._renderProgram(true);
    const panel = document.getElementById('dbg-panel');
    if (panel) {
      panel.innerHTML = `<div class="dbg-bug-count">🐛 Encontrados: <strong>${bugs.length}</strong> error(es)</div>` +
        bugs.map(b => `<div class="dbg-bug-item">⚠️ ${b.note}<br>
          <span class="dbg-fix-hint">Corrección: ${b.fix}</span></div>`).join('') +
        `<div class="dbg-explanation">📖 ${ch.explanation}</div>`;
    }
    this._set('dbg-score', 'Errores encontrados: ' + bugs.length);
    Achievements.check('bugs-found', bugs.length);
  },

  fixAll() {
    if (!this._scanned) { this.scan(); return; }
    const ch = this.CHALLENGES[this._challenge];
    this._fixed = ch.buggy.map((inst, i) => !inst.correct ? i : null).filter(i => i !== null);
    AudioEngine.play('success');
    this._renderProgram(true);
    this._setStatus('✅ Errores corregidos. Pulsa "Enviar corrección" para completar.', true);
  },

  submit() {
    const ch   = this.CHALLENGES[this._challenge];
    const bugs = ch.buggy.filter(i => !i.correct).length;
    if (!this._scanned) {
      this._setStatus('⚠️ Primero escanea el programa para detectar errores.', false);
      return;
    }
    this._score += bugs;
    this._set('dbg-score', 'Total bugs resueltos: ' + this._score);

    AudioEngine.play('mission-complete');
    this._setStatus('🏆 ¡Corrección enviada! ' + bugs + ' bug(s) resueltos.', true);
    Mission.onAction('fix-debug', { challenge: this._challenge + 1, bugs });
    DinoLog.track('step');
    Desktop.showGuide('🐛 ¡Bug cazado! Eres un gran debugger. ' + bugs + ' error(es) corregidos.', 5000);
  },

  _set(id, txt) { const el=document.getElementById(id); if(el) el.textContent=txt; },
  _setStatus(msg, ok) {
    const s=document.getElementById('dbg-status');
    if(s){ s.textContent=msg; s.className='feat-status '+(ok===true?'ok':ok===false?'warn':''); }
  }
};
