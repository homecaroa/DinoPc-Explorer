/**
 * DinoPC Explorer — encryption.js
 * Misión 10: DinoEncrypt — encriptación ROT13 + permisos de archivo.
 */

const Encryption = {

  _selectedFile: null,
  _permissions:  { r: true, w: true, x: false },

  buildHTML() {
    return `
      <div class="feat-wrap" id="enc-wrap">
        <div class="feat-intro">
          <span class="feat-icon">🔐</span>
          <p>Selecciona un archivo, establece los permisos y encríptalo con ROT13.</p>
        </div>
        <div id="enc-files"></div>
        <div class="enc-perms-wrap">
          <label class="feat-label">Permisos del archivo:</label>
          <div class="enc-perms">
            <label class="enc-perm-item">
              <input type="checkbox" id="enc-r" checked onchange="Encryption.togglePerm('r', this.checked)">
              <span class="perm-badge r">R</span> Lectura
            </label>
            <label class="enc-perm-item">
              <input type="checkbox" id="enc-w" checked onchange="Encryption.togglePerm('w', this.checked)">
              <span class="perm-badge w">W</span> Escritura
            </label>
            <label class="enc-perm-item">
              <input type="checkbox" id="enc-x" onchange="Encryption.togglePerm('x', this.checked)">
              <span class="perm-badge x">X</span> Ejecución
            </label>
          </div>
          <div class="enc-perm-display" id="enc-perm-display">RW-</div>
        </div>
        <div class="enc-preview hidden" id="enc-preview">
          <label class="feat-label">Vista previa ROT13:</label>
          <div class="enc-compare">
            <div class="enc-col">
              <div class="enc-col-title">Original:</div>
              <div class="enc-text" id="enc-original"></div>
            </div>
            <div class="enc-arrow">→</div>
            <div class="enc-col">
              <div class="enc-col-title">Encriptado:</div>
              <div class="enc-text encrypted" id="enc-encrypted"></div>
            </div>
          </div>
        </div>
        <button class="btn-primary" id="enc-btn" onclick="Encryption.encrypt()">🔐 Encriptar archivo</button>
        <div class="feat-status" id="enc-status"></div>
      </div>
    `;
  },

  init() {
    this._selectedFile = null;
    this._permissions  = { r: true, w: true, x: false };
    this._renderFiles();
    this._updatePermDisplay();
  },

  _renderFiles() {
    const div   = document.getElementById('enc-files');
    if (!div) return;
    const files = Object.entries(App.state.fileSystem.children)
      .filter(([, v]) => v.type === 'file' && !v.encrypted);

    if (!files.length) {
      div.innerHTML = '<p class="feat-empty">No hay archivos para encriptar. Guarda primero el archivo secreto.</p>';
      return;
    }
    div.innerHTML = files.map(([name, f], i) =>
      `<label class="net-file-item">
         <input type="radio" name="enc-file" value="${name}" ${i === 0 ? 'checked' : ''}
                onchange="Encryption._onFileSelect('${name}')">
         <span class="file-ico-sm">📄</span>
         <span>${name}</span>
         <span class="fe-size">${f.size || 0} KB</span>
       </label>`
    ).join('');

    // Auto-select first file
    if (files.length) this._onFileSelect(files[0][0]);
  },

  _onFileSelect(filename) {
    this._selectedFile = filename;
    const file = App.state.fileSystem.children[filename];
    if (!file) return;

    const content = file.content || 'La encriptación protege tus datos privados.';
    const preview = content.slice(0, 60) + (content.length > 60 ? '…' : '');
    const encrypted = this.applyROT13(preview);

    const wrap = document.getElementById('enc-preview');
    if (wrap) wrap.classList.remove('hidden');
    this._el('enc-original',  preview);
    this._el('enc-encrypted', encrypted);
  },

  togglePerm(perm, value) {
    this._permissions[perm] = value;
    this._updatePermDisplay();
  },

  _updatePermDisplay() {
    const p   = this._permissions;
    const str = (p.r ? 'R' : '-') + (p.w ? 'W' : '-') + (p.x ? 'X' : '-');
    const el  = document.getElementById('enc-perm-display');
    if (el) el.textContent = str;
  },

  applyROT13(text) {
    return text.replace(/[a-zA-Z]/g, ch => {
      const code = ch.charCodeAt(0);
      const base = code >= 65 && code <= 90 ? 65 : 97;
      return String.fromCharCode(base + (code - base + 13) % 26);
    });
  },

  encrypt() {
    const canStep = Mission.canDoStep('encrypt-file');
    if (!canStep.allowed) {
      this._setStatus('⚠️ ' + canStep.reason, false);
      return;
    }

    const filename = this._selectedFile ||
      (document.querySelector('input[name="enc-file"]:checked') || {}).value;

    if (!filename) {
      this._setStatus('⚠️ Selecciona un archivo para encriptar.', false);
      return;
    }

    const file = App.state.fileSystem.children[filename];
    if (!file) {
      this._setStatus('⚠️ Archivo no encontrado.', false);
      return;
    }

    const p   = this._permissions;
    const pStr = (p.r ? 'R' : '-') + (p.w ? 'W' : '-') + (p.x ? 'X' : '-');

    const btn = document.getElementById('enc-btn');
    if (btn) btn.disabled = true;

    setTimeout(() => {
      // Aplicar encriptación al archivo
      file.originalContent  = file.content;
      file.content          = this.applyROT13(file.content || '');
      file.encrypted        = true;
      file.encryptionMethod = 'rot13';
      file.permissions      = pStr;

      AudioEngine.play('success');
      this._setStatus(
        `🔐 "${filename}" encriptado con ROT13. Permisos: ${pStr}`,
        true
      );
      Mission.onAction('file-encrypted', { filename, permissions: pStr, method: 'rot13' });
      Achievements.check('file-encrypted-success', 1);
      DinoLog.track('step');
    }, 800);
  },

  _el(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  _setStatus(msg, ok) {
    const s = document.getElementById('enc-status');
    if (s) { s.textContent = msg; s.className = 'feat-status ' + (ok ? 'ok' : 'warn'); }
  }
};
