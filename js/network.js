/**
 * DinoPC Explorer — network.js
 * Misión 7: DinoNetwork — transferencia de archivos por red simulada.
 */

const Network = {

  _transferring: false,

  buildHTML() {
    return `
      <div class="feat-wrap" id="net-wrap">
        <div class="feat-intro">
          <span class="feat-icon">🌐</span>
          <p>Selecciona el archivo que quieres enviar y elige el dinosaurio destinatario.</p>
        </div>
        <div class="net-file-list" id="net-files"></div>
        <div class="net-target">
          <label class="feat-label">Enviar a:</label>
          <div class="net-dinos" id="net-dinos">
            <button class="dino-target-btn active" data-target="triceratops">🦏 Triceratops</button>
            <button class="dino-target-btn" data-target="velociraptor">🦎 Velociraptor</button>
            <button class="dino-target-btn" data-target="brachiosaurus">🦒 Braquiosaurio</button>
          </div>
        </div>
        <div class="net-progress hidden" id="net-progress">
          <div class="net-speed" id="net-speed"></div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" id="net-bar"></div>
          </div>
          <div class="net-eta" id="net-eta"></div>
        </div>
        <button class="btn-primary" id="net-send-btn" onclick="Network.send()">🚀 Enviar por red</button>
        <div class="feat-status" id="net-status"></div>
      </div>
    `;
  },

  init() {
    this._transferring = false;
    this._renderFiles();
    // Selección de dino-target
    document.querySelectorAll('.dino-target-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.dino-target-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });
  },

  _renderFiles() {
    const list = document.getElementById('net-files');
    if (!list) return;
    const files = Object.entries(App.state.fileSystem.children)
      .filter(([, v]) => v.type === 'file');

    if (!files.length) {
      list.innerHTML = '<p class="feat-empty">No hay archivos guardados. Primero escribe y guarda el mensaje.</p>';
      return;
    }
    list.innerHTML = files.map(([name, f]) =>
      `<label class="net-file-item">
         <input type="radio" name="net-file" value="${name}" ${files.length === 1 ? 'checked' : ''}>
         <span class="file-ico-sm">📄</span>
         <span>${name}</span>
         <span class="fe-size">${f.size || 0} KB</span>
       </label>`
    ).join('');
  },

  calculateTransferTime(fileSizeKB, speedKBs) {
    return Math.max(1, Math.ceil(fileSizeKB / speedKBs));
  },

  send() {
    if (this._transferring) return;

    const selected = document.querySelector('input[name="net-file"]:checked');
    if (!selected) {
      this._setStatus('⚠️ Selecciona un archivo para enviar.', false);
      return;
    }

    const canStep = Mission.canDoStep('send-file');
    if (!canStep.allowed) {
      this._setStatus('⚠️ ' + canStep.reason, false);
      return;
    }

    const filename  = selected.value;
    const file      = App.state.fileSystem.children[filename];
    const fileSize  = file ? (file.size || 20) : 20;
    const speed     = Mission.current.networkSpeed || 50;  // KB/s
    const duration  = this.calculateTransferTime(fileSize, speed) * 1000; // ms
    const target    = (document.querySelector('.dino-target-btn.active') || {}).dataset?.target || 'triceratops';

    this._transferring = true;
    document.getElementById('net-send-btn').disabled = true;

    const progressWrap = document.getElementById('net-progress');
    const bar          = document.getElementById('net-bar');
    const eta          = document.getElementById('net-eta');
    const speedEl      = document.getElementById('net-speed');

    if (progressWrap) progressWrap.classList.remove('hidden');
    if (speedEl) speedEl.textContent = `Velocidad: ${speed} KB/s · Archivo: ${fileSize} KB`;

    AudioEngine.play('click');

    const start  = Date.now();
    const tick   = () => {
      const elapsed = Date.now() - start;
      const pct     = Math.min(100, (elapsed / duration) * 100);
      if (bar)  bar.style.width = pct.toFixed(1) + '%';
      if (eta)  eta.textContent = pct < 100
        ? `Transfiriendo… ${pct.toFixed(0)}%`
        : '✅ ¡Transferencia completa!';

      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        this._onTransferComplete(filename, target, fileSize);
      }
    };
    requestAnimationFrame(tick);
  },

  _onTransferComplete(filename, target, fileSize) {
    this._transferring = false;
    AudioEngine.play('mission-complete');
    this._setStatus(`✅ "${filename}" enviado correctamente a ${target} (${fileSize} KB transferidos).`, true);
    Mission.onAction('file-sent', { filename, target, fileSize });
    Achievements.check('file-sent', 1);
    DinoLog.track('step');
  },

  _setStatus(msg, ok) {
    const s = document.getElementById('net-status');
    if (s) { s.textContent = msg; s.className = 'feat-status ' + (ok ? 'ok' : 'warn'); }
  }
};
