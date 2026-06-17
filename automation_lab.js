/**
 * DinoPC Explorer — automation_lab.js
 * Sistema de automatización: reglas SI/ENTONCES para clasificar fósiles.
 * Misión 13 — RaptorScout
 */

const AutomationLab = {

  FOSSILS: [
    { id:'f01', name:'Spinosaurio',   diet:'carnívoro',  weight:9000, era:'Cretácico', color:'#4488ff' },
    { id:'f02', name:'Triceratops',   diet:'herbívoro',  weight:8000, era:'Cretácico', color:'#44cc44' },
    { id:'f03', name:'Velociraptor',  diet:'carnívoro',  weight:15,   era:'Cretácico', color:'#ff8800' },
    { id:'f04', name:'Braquiosaurio', diet:'herbívoro',  weight:60000,era:'Jurásico',  color:'#22ddff' },
    { id:'f05', name:'T-Rex',         diet:'carnívoro',  weight:9000, era:'Cretácico', color:'#ff4422' },
    { id:'f06', name:'Estegosaurio',  diet:'herbívoro',  weight:4500, era:'Jurásico',  color:'#aacc00' },
    { id:'f07', name:'Pteranodón',    diet:'piscívoro',  weight:25,   era:'Cretácico', color:'#4488ff' },
    { id:'f08', name:'Iguanodón',     diet:'herbívoro',  weight:3000, era:'Cretácico', color:'#ffcc00' }
  ],

  WAREHOUSES: [
    { id:'almacen_rojo',   label:'🔴 Almacén Rojo',   desc:'Carnívoros' },
    { id:'almacen_verde',  label:'🟢 Almacén Verde',  desc:'Herbívoros' },
    { id:'almacen_pesado', label:'⚫ Almacén Pesado', desc:'>5000 kg'   },
    { id:'almacen_juras',  label:'🟤 Almacén Jurásico',desc:'Era Jurásica'},
    { id:'almacen_general',label:'⬜ Almacén General', desc:'Sin regla'  }
  ],

  CONDITION_FIELDS:  ['diet','weight','era'],
  CONDITION_OPS:     ['igual_a','mayor_que','menor_que','contiene'],
  CONDITION_LABELS:  { diet:'Dieta', weight:'Peso (kg)', era:'Era' },
  OP_LABELS:         { igual_a:'= igual a', mayor_que:'> mayor que', menor_que:'< menor que', contiene:'contiene' },

  rules:   [],
  results: {},

  buildHTML() {
    return `
    <div class="auto-wrap" id="auto-wrap">
      <div class="auto-intro">
        <span class="feat-icon">⚙️</span>
        <p>Crea reglas para que el sistema clasifique los fósiles automáticamente.</p>
      </div>
      <div class="auto-rule-builder" id="auto-rule-builder">
        <div class="auto-builder-title">➕ Nueva regla:</div>
        <div class="auto-rule-row">
          <span class="auto-if">SI</span>
          <select id="auto-field" class="auto-sel" onchange="AutomationLab._previewRule()">
            <option value="diet">Dieta</option>
            <option value="weight">Peso (kg)</option>
            <option value="era">Era</option>
          </select>
          <select id="auto-op" class="auto-sel" onchange="AutomationLab._previewRule()">
            <option value="igual_a">= igual a</option>
            <option value="mayor_que">&gt; mayor que</option>
            <option value="menor_que">&lt; menor que</option>
          </select>
          <input id="auto-val" class="auto-input" type="text" placeholder="valor..."
                 oninput="AutomationLab._previewRule()">
          <span class="auto-then">→ ENTONCES mover a</span>
          <select id="auto-dest" class="auto-sel">
            ${this.WAREHOUSES.map(w =>
              `<option value="${w.id}">${w.label}</option>`
            ).join('')}
          </select>
          <button class="btn-primary auto-add-btn" onclick="AutomationLab.addRule()">
            + Añadir regla
          </button>
        </div>
        <div class="auto-preview" id="auto-preview"></div>
      </div>

      <div class="auto-rules-list" id="auto-rules-list">
        <div class="auto-rules-title">📋 Reglas activas:
          <span class="auto-rule-count" id="auto-rule-count">0 reglas</span>
        </div>
        <div id="auto-rules"></div>
      </div>

      <div class="auto-controls">
        <button class="btn-primary"   onclick="AutomationLab.applyRules()">▶ Aplicar reglas</button>
        <button class="btn-secondary" onclick="AutomationLab.clearRules()">🗑 Limpiar</button>
      </div>

      <div class="auto-results-title" id="auto-results-title" style="display:none">
        📊 Resultados de clasificación:
      </div>
      <div class="auto-results" id="auto-results"></div>
      <div class="feat-status" id="auto-status"></div>
    </div>`;
  },

  init() {
    this.rules   = [];
    this.results = {};
    this._renderRules();
    this._previewRule();
  },

  _previewRule() {
    const field = this._val('auto-field');
    const op    = this._val('auto-op');
    const val   = this._val('auto-val');
    const dest  = this._val('auto-dest');
    const wh    = this.WAREHOUSES.find(w => w.id === dest);
    const preview = document.getElementById('auto-preview');
    if (!preview) return;
    if (!val) { preview.textContent = ''; return; }
    const label = this.CONDITION_LABELS[field] || field;
    const opLabel = this.OP_LABELS[op] || op;
    const matching = this.FOSSILS.filter(f => this._testCondition(f, field, op, val)).length;
    preview.innerHTML = `<span class="auto-prev-rule">SI ${label} ${opLabel} "${val}" → ${wh?.label}</span>
      <span class="auto-prev-match">(${matching} fósiles coinciden)</span>`;
  },

  addRule() {
    const field = this._val('auto-field');
    const op    = this._val('auto-op');
    const val   = this._val('auto-val')?.trim();
    const dest  = this._val('auto-dest');
    if (!val) {
      this._setStatus('⚠️ Escribe un valor para la condición.', false);
      return;
    }
    this.rules.push({ field, op, val, dest, id: Date.now() });
    AudioEngine.play('click');
    this._renderRules();
    document.getElementById('auto-val').value = '';
    this._previewRule();
  },

  removeRule(id) {
    this.rules = this.rules.filter(r => r.id !== id);
    this._renderRules();
  },

  clearRules() {
    this.rules   = [];
    this.results = {};
    this._renderRules();
    document.getElementById('auto-results').innerHTML = '';
    const t = document.getElementById('auto-results-title');
    if (t) t.style.display = 'none';
  },

  _renderRules() {
    const el = document.getElementById('auto-rules');
    const cnt = document.getElementById('auto-rule-count');
    if (cnt) cnt.textContent = this.rules.length + ' regla(s)';
    if (!el) return;
    if (!this.rules.length) {
      el.innerHTML = '<div class="auto-no-rules">Aún no hay reglas. Añade una arriba.</div>';
      return;
    }
    el.innerHTML = this.rules.map((r, i) => {
      const wh     = this.WAREHOUSES.find(w => w.id === r.dest);
      const opLbl  = this.OP_LABELS[r.op] || r.op;
      const fldLbl = this.CONDITION_LABELS[r.field] || r.field;
      const count  = this.FOSSILS.filter(f => this._testCondition(f, r.field, r.op, r.val)).length;
      return `<div class="auto-rule-item">
                <span class="auto-rule-num">${i+1}</span>
                <span class="auto-rule-text">
                  SI <strong>${fldLbl}</strong> ${opLbl} "<em>${r.val}</em>"
                  → ${wh?.label}
                  <span class="auto-rule-match">(${count} fósiles)</span>
                </span>
                <button class="fe-del-btn" onclick="AutomationLab.removeRule(${r.id})">✕</button>
              </div>`;
    }).join('');
  },

  applyRules() {
    if (!this.rules.length) {
      this._setStatus('⚠️ Añade al menos una regla antes de aplicar.', false);
      return;
    }
    // Classify each fossil
    const assignments = {};
    this.WAREHOUSES.forEach(w => assignments[w.id] = []);

    this.FOSSILS.forEach(fossil => {
      let assigned = false;
      for (const rule of this.rules) {
        if (this._testCondition(fossil, rule.field, rule.op, rule.val)) {
          assignments[rule.dest].push(fossil);
          assigned = true;
          break;
        }
      }
      if (!assigned) assignments['almacen_general'].push(fossil);
    });

    this.results = assignments;
    this._renderResults(assignments);
    AudioEngine.play('mission-complete');
    this._setStatus('✅ ¡Reglas aplicadas! ' + this.FOSSILS.length + ' fósiles clasificados.', true);
    Mission.onAction('apply-rules', { rulesCount: this.rules.length });
    DinoLog.track('step');
    Achievements.check('automation-rules', this.rules.length);
    Desktop.showGuide('⚙️ ¡Sistema automatizado! ' + this.rules.length + ' reglas procesaron ' + this.FOSSILS.length + ' fósiles.', 5000);
  },

  _renderResults(assignments) {
    const el = document.getElementById('auto-results');
    const title = document.getElementById('auto-results-title');
    if (title) title.style.display = 'block';
    if (!el) return;
    el.innerHTML = this.WAREHOUSES.map(wh => {
      const fossils = assignments[wh.id] || [];
      if (!fossils.length) return '';
      return `<div class="auto-wh-group">
                <div class="auto-wh-title">${wh.label} — ${fossils.length} fósil(es)</div>
                <div class="auto-wh-items">
                  ${fossils.map(f =>
                    `<span class="auto-fossil-tag" style="border-color:${f.color}">${f.name}</span>`
                  ).join('')}
                </div>
              </div>`;
    }).join('');
  },

  _testCondition(fossil, field, op, val) {
    const fval = String(fossil[field] || '').toLowerCase();
    const v    = String(val).toLowerCase();
    const fnum = parseFloat(fossil[field]) || 0;
    const vnum = parseFloat(val) || 0;
    switch(op) {
      case 'igual_a':    return fval === v;
      case 'mayor_que':  return fnum > vnum;
      case 'menor_que':  return fnum < vnum;
      case 'contiene':   return fval.includes(v);
    }
    return false;
  },

  _val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  },
  _setStatus(msg, ok) {
    const s = document.getElementById('auto-status');
    if (s) { s.textContent = msg; s.className = 'feat-status '+(ok?'ok':'warn'); }
  }
};
