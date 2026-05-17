/**
 * DinoPC Explorer — compressor.js
 * Misión 9: DinoCompressor — compresión de archivos con ratio visual.
 */

const Compressor = {

  RATIOS: { fast: 0.75, normal: 0.50, maximum: 0.25 },
  _level: 'normal',

  buildHTML() {
    return `
      <div class="feat-wrap" id="cmp-wrap">
        <div class="feat-intro">
          <span class="feat-icon">📦</span>
          <p>Comprime tus archivos para ahorrar espacio. Elige el nivel y pulsa comprimir.</p>
        </div>
        <div id="cmp-files"></div>
        <div class="cmp-level-wrap">
          <label class="feat-label">Nivel de compresión:</label>
          <div class="cmp-levels">
            <button class="cmp-lvl-btn" data-level="fast"    onclick="Compressor.setLevel('fast')">⚡ Rápida (75%)</button>
            <button class="cmp-lvl-btn active" data-level="normal"  onclick="Compressor.setLevel('normal')">🔧 Normal (50%)</button>
            <button class="cmp-lvl-btn" data-level="maximum" onclick="Compressor.setLevel('maximum')">💪 Máxima (25%)</button>
          </div>
        </div>
        <div class="cmp-preview hidden" id="cmp-preview">
          <div class="cmp-row">
            <span>📄 Tamaño original:</span><strong id="cmp-orig">—</strong>
          </div>
          <div class="cmp-row">
            <span>📦 Tamaño comprimido:</span><strong id="cmp-new">—</strong>
          </div>
          <div class="cmp-row">
            <span>📉 Ahorro:</span><strong id="cmp-saving" style="color:var(--neon)">—</strong>
          </div>
          <div class="cmp-ratio-bar-wrap">
            <div class="cmp-ratio-bar" id="cmp-ratio-bar"></div>
          </div>
        </div>
        <button class="btn-primary" id="cmp-btn" onclick="Compressor.compress()">📦 Comprimir archivos</button>
        <div class="feat-status" id="cmp-status"></div>
      </div>
    `;
  },

  init() {
    this._level = 'normal';
    this._renderFiles();
  },

  setLevel(level) {
    this._level = level;
    document.querySelectorAll('.cmp-lvl-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.level === level);
    });
    this._updatePreview();
  },

  _getFiles() {
    return Object.entries(App.state.fileSystem.children)
      .filter(([, v]) => v.type === 'file')
      .map(([name, v]) => ({ name, size: v.size || 5 }));
  },

  _renderFiles() {
    const div = document.getElementById('cmp-files');
    if (!div) return;
    const files = this._getFiles();
    if (!files.length) {
      div.innerHTML = '<p class="feat-empty">No hay archivos para comprimir.</p>';
      return;
    }
    div.innerHTML = files.map(f =>
      `<div class="av-file-row">
         <span class="file-ico-sm">📄</span>
         <span>${f.name}</span>
         <span class="fe-size">${f.size} KB</span>
       </div>`
    ).join('');
    this._updatePreview();
  },

  _updatePreview() {
    const files    = this._getFiles();
    if (!files.length) return;

    const original   = files.reduce((s, f) => s + f.size, 0);
    const compressed = this.calculateCompressed(original, this._level);
    const saving     = original - compressed;
    const ratio      = (original / compressed).toFixed(1);
    const pct        = (compressed / original * 100).toFixed(0);

    const preview = document.getElementById('cmp-preview');
    if (preview) preview.classList.remove('hidden');
    this._el('cmp-orig',  original    + ' KB');
    this._el('cmp-new',   compressed  + ' KB (ratio ' + ratio + ':1)');
    this._el('cmp-saving', '−' + saving + ' KB (' + (100 - pct) + '% menos)');

    const bar = document.getElementById('cmp-ratio-bar');
    if (bar) bar.style.width = pct + '%';
  },

  calculateCompressed(originalKB, level) {
    return Math.max(1, Math.ceil(originalKB * (this.RATIOS[level] || 0.5)));
  },

  compress() {
    const canStep = Mission.canDoStep('compress-files');
    if (!canStep.allowed) {
      this._setStatus('⚠️ ' + canStep.reason, false);
      return;
    }

    const files    = this._getFiles();
    if (!files.length) {
      this._setStatus('⚠️ No hay archivos para comprimir. Guarda primero el informe.', false);
      return;
    }

    const original   = files.reduce((s, f) => s + f.size, 0);
    const compressed = this.calculateCompressed(original, this._level);
    const ratio      = +(original / compressed).toFixed(1);
    const zipName    = Mission.current.fileName || 'archivo.zip';

    const btn = document.getElementById('cmp-btn');
    if (btn) btn.disabled = true;

    // Simular tiempo de compresión
    setTimeout(() => {
      // Reemplazar archivos en filesystem con el .zip virtual
      App.state.fileSystem.children[zipName] = {
        type: 'file', size: compressed,
        compressed: true, originalSize: original
      };
      App.state.fileSystem.usedSpace = compressed;

      AudioEngine.play('file-saved');
      this._setStatus(
        `✅ ¡Comprimido! ${original} KB → ${compressed} KB (ratio ${ratio}:1). Archivo: ${zipName}`,
        true
      );
      Mission.onAction('files-compressed', { originalSize: original, compressedSize: compressed, ratio });
      Achievements.check('compression-ratio', ratio);
      DinoLog.track('step');
    }, 1200);
  },

  _el(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  _setStatus(msg, ok) {
    const s = document.getElementById('cmp-status');
    if (s) { s.textContent = msg; s.className = 'feat-status ' + (ok ? 'ok' : 'warn'); }
  }
};
