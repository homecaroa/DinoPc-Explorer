/**
 * DinoPC Explorer — antivirus.js
 * Misión 8: AntiVirus Guardian — escaneo y eliminación de amenazas.
 */

const AntiVirus = {

  DANGEROUS_EXT: ['.exe', '.scr', '.bat', '.cmd', '.vbs', '.pif'],

  // Amenazas simuladas que el escáner siempre encuentra (para la demo educativa)
  _FAKE_THREATS: [
    { name: 'dino_virus.exe',   size: 88,  threat: 'Troyano DinoRex' },
    { name: 'spam_script.bat',  size: 12,  threat: 'Script Malicioso' },
    { name: 'spyware.scr',      size: 55,  threat: 'Spyware Jurásico' }
  ],

  _threats:   [],
  _scanned:   false,
  _quarantine: [],

  buildHTML() {
    return `
      <div class="feat-wrap" id="av-wrap">
        <div class="feat-intro">
          <span class="feat-icon">🛡️</span>
          <p>Escanea tu carpeta para detectar archivos maliciosos y ponlos en cuarentena.</p>
        </div>
        <div class="av-files" id="av-files">
          <p class="feat-empty">Pulsa "Iniciar escaneo" para analizar tus archivos.</p>
        </div>
        <div class="av-quarantine-wrap hidden" id="av-quarantine-wrap">
          <p class="av-section-title">🚨 Amenazas detectadas:</p>
          <div id="av-threats"></div>
        </div>
        <div class="av-controls">
          <button class="btn-primary" id="av-scan-btn" onclick="AntiVirus.scan()">🔍 Iniciar escaneo</button>
          <button class="btn-secondary hidden" id="av-quarantine-btn" onclick="AntiVirus.quarantineAll()">
            🔒 Poner todo en cuarentena
          </button>
        </div>
        <div class="feat-status" id="av-status"></div>
      </div>
    `;
  },

  init() {
    this._threats    = [];
    this._scanned    = false;
    this._quarantine = [];
    this._renderFiles();
  },

  _renderFiles() {
    const div  = document.getElementById('av-files');
    if (!div) return;
    const safe = Object.entries(App.state.fileSystem.children)
      .filter(([, v]) => v.type === 'file');

    if (!safe.length) {
      div.innerHTML = '<p class="feat-empty">No hay archivos para analizar.</p>';
      return;
    }
    div.innerHTML = '<p class="av-section-title">📂 Archivos en el sistema:</p>' +
      safe.map(([name, f]) =>
        `<div class="av-file-row">
           <span class="file-ico-sm">📄</span>
           <span>${name}</span>
           <span class="fe-size">${f.size || 0} KB</span>
           <span class="av-badge safe">✓ Seguro</span>
         </div>`
      ).join('');
  },

  detectThreats() {
    // Combina archivos del sistema con las amenazas simuladas educativas
    const fromFS = Object.entries(App.state.fileSystem.children)
      .filter(([name, v]) => v.type === 'file' &&
              this.DANGEROUS_EXT.some(ext => name.toLowerCase().endsWith(ext)))
      .map(([name, f]) => ({ name, size: f.size || 0, threat: 'Archivo sospechoso' }));

    return [...fromFS, ...this._FAKE_THREATS];
  },

  scan() {
    const canStep = Mission.canDoStep('scan-virus');
    if (!canStep.allowed) {
      this._setStatus('⚠️ ' + canStep.reason, false);
      return;
    }

    const btn = document.getElementById('av-scan-btn');
    if (btn) btn.disabled = true;
    this._setStatus('🔍 Escaneando… por favor espera.', null);

    // Simular tiempo de escaneo
    setTimeout(() => {
      this._threats = this.detectThreats();
      this._scanned = true;
      this._renderThreats();
    }, 1800);
  },

  _renderThreats() {
    const wrap = document.getElementById('av-quarantine-wrap');
    const div  = document.getElementById('av-threats');
    const qBtn = document.getElementById('av-quarantine-btn');

    if (!div) return;

    if (!this._threats.length) {
      if (wrap) wrap.classList.remove('hidden');
      div.innerHTML = '<p style="color:var(--neon)">✅ ¡Sistema limpio! No se encontraron amenazas.</p>';
      this._completeStep();
      return;
    }

    if (wrap) wrap.classList.remove('hidden');
    if (qBtn) qBtn.classList.remove('hidden');

    AudioEngine.play('error');
    this._setStatus(`🚨 ${this._threats.length} amenaza(s) detectada(s). Ponlas en cuarentena.`, false);

    div.innerHTML = this._threats.map((t, i) =>
      `<div class="av-threat-row" id="av-threat-${i}">
         <span class="file-ico-sm">⚠️</span>
         <span>${t.name}</span>
         <span class="av-badge threat">${t.threat}</span>
         <button class="av-btn-quarantine" onclick="AntiVirus.quarantine(${i})">🔒 Cuarentena</button>
       </div>`
    ).join('');
  },

  quarantine(idx) {
    const row = document.getElementById('av-threat-' + idx);
    if (row) {
      row.querySelector('.av-btn-quarantine').disabled = true;
      row.querySelector('.av-badge').className = 'av-badge quarantined';
      row.querySelector('.av-badge').textContent = '🔒 En cuarentena';
    }
    this._quarantine.push(idx);
    if (this._quarantine.length >= this._threats.length) {
      setTimeout(() => this._completeStep(), 500);
    }
  },

  quarantineAll() {
    this._threats.forEach((_, i) => {
      if (!this._quarantine.includes(i)) this.quarantine(i);
    });
  },

  _completeStep() {
    AudioEngine.play('success');
    this._setStatus('✅ Sistema protegido. ¡Amenazas en cuarentena!', true);
    Mission.onAction('virus-scanned', { threatsFound: this._threats.length, quarantined: this._quarantine.length });
    Achievements.check('virus-all-removed', 1);
    DinoLog.track('step');
  },

  _setStatus(msg, ok) {
    const s = document.getElementById('av-status');
    if (s) { s.textContent = msg; s.className = 'feat-status ' + (ok === true ? 'ok' : ok === false ? 'warn' : ''); }
  }
};
