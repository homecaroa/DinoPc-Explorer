/**
 * DinoPC Explorer — desktop.js
 * Gestiona ventanas arrastrables, barra de tareas, menú inicio,
 * explorador de archivos (FileExplorer) y editor DinoWord.
 */

/**
 * Estima el tamaño en KB de un contenido de texto.
 * Determinístico: mismo input → mismo output.
 * Rango: 5 KB mínimo, 500 KB máximo.
 */
function estimateFileSize(content) {
  if (!content) return 5;
  return Math.min(500, Math.max(5, Math.ceil(content.length * 0.5)));
}

// ═══════════════════════════════════════════════════
//  DESKTOP  — gestor de ventanas
// ═══════════════════════════════════════════════════
const Desktop = {
  openWins:   {},   // { id: { minimized: bool } }
  zCounter:   100,
  guideTimer: null,

  /** Plantillas de ventanas */
  templates: {
    'file-explorer': { title: '📁 Explorador — Mis Expediciones', w: 580, h: 400, init: () => FileExplorer.init() },
    'dinoword':      { title: '📝 DinoWord',                      w: 520, h: 430, init: () => DinoWord.init()     },
    'minigame':      { title: '🎮 Rescate del Río',               w: 746, h: 432, init: () => Minigame.start()    },
    'quiz':          { title: '🧠 DinoQuiz',                      w: 500, h: 430, init: () => Quiz.init()         },
    'settings':      { title: '⚙️ Configuración del Laboratorio', w: 430, h: 330, init: () => Settings.init()     },
    'dinoLog':       { title: '📊 Diario DinoPC',                 w: 450, h: 410, init: null                      },
    'trash':         { title: '🗑️ Papelera de Reciclaje',         w: 340, h: 220, init: null                      }
  },

  /** Contenido HTML de cada ventana */
  _buildContent(id) {
    switch (id) {
      case 'file-explorer': return FileExplorer.buildHTML();
      case 'dinoword':      return DinoWord.buildHTML();
      case 'minigame':      return `<div class="game-container"><canvas id="game-canvas" width="724" height="396"></canvas></div>`;
      case 'quiz':          return Quiz.buildHTML();
      case 'settings':      return Settings.buildHTML();
      case 'dinoLog':       return DinoLog.buildHTML();
      case 'trash':         return `<div class="trash-empty"><span>🗑️</span><p>La papelera está vacía</p></div>`;
      default:              return '<p style="padding:20px;color:var(--txt-dim)">Sin contenido</p>';
    }
  },

  // ─── Inicialización ───────────────────────────────

  init() {
    // Actualizar reloj cada minuto
    setInterval(() => {
      const now = new Date();
      const el  = document.getElementById('tb-clock');
      if (el) el.textContent =
        String(now.getHours()).padStart(2,'0') + ':' +
        String(now.getMinutes()).padStart(2,'0');
    }, 60000);

    // Cerrar menú inicio al hacer clic fuera
    document.addEventListener('click', (e) => {
      const sm = document.getElementById('start-menu');
      if (!sm.classList.contains('hidden') &&
          !sm.contains(e.target) &&
          !e.target.closest('.tb-start')) {
        sm.classList.add('hidden');
      }

      // Deseleccionar icono si se hace clic en el escritorio (no en un icono)
      if (!e.target.closest('.desktop-icon') && this._selectedIcon) {
        this._selectedIcon.classList.remove('selected');
        clearTimeout(this._iconTimers[this._selectedIcon.id]);
        this._selectedIcon = null;
      }
    });
  },

  // ─── Ventanas ─────────────────────────────────────

  openWindow(id) {
    const tpl = this.templates[id];
    if (!tpl) return;

    // Si ya existe, enfocar — y refrescar DinoWord si es necesario
    if (this.openWins[id]) {
      this.focusWindow(id);
      // Bug fix: DinoWord abierto entre misiones no notificaba el paso
      // ni actualizaba el texto objetivo. Se reinicializa aquí.
      if (id === 'dinoword') {
        DinoWord.init();
        Mission.onAction('window-opened', { id });
      }
      this.closeStart();
      return;
    }

    // Offset en cascada
    const offset = Object.keys(this.openWins).length;

    const win = document.createElement('div');
    win.className = 'window';
    win.id = 'win-' + id;
    win.style.cssText = [
      `width:${tpl.w}px`,
      `height:${tpl.h}px`,
      `left:${110 + offset * 28}px`,
      `top:${60 + offset * 28}px`,
      `z-index:${++this.zCounter}`
    ].join(';');

    win.innerHTML = `
      <div class="win-titlebar">
        <span class="win-title">${tpl.title}</span>
        <div class="win-controls">
          <button class="win-btn minimize" title="Minimizar"  onclick="Desktop.minimizeWindow('${id}')">─</button>
          <button class="win-btn maximize" title="Maximizar"  onclick="Desktop.maximizeWindow('${id}')">□</button>
          <button class="win-btn close"    title="Cerrar"     onclick="Desktop.closeWindow('${id}')">✕</button>
        </div>
      </div>
      <div class="win-content" id="wc-${id}">${this._buildContent(id)}</div>
    `;

    document.getElementById('windows-container').appendChild(win);
    this._makeDraggable(win, win.querySelector('.win-titlebar'));
    this.openWins[id] = { minimized: false };
    this._addTaskbarItem(id, tpl.title);

    // Inicializar módulo
    if (tpl.init) tpl.init();

    // Notificar misión — solo cuando se abre DinoWord
    if (id === 'dinoword') Mission.onAction('window-opened', { id });

    // Logro explorador: registrar ventana abierta
    Achievements.trackExploration(id);
  },

  closeWindow(id) {
    if (id === 'minigame') Minigame.stop();
    const el = document.getElementById('win-' + id);
    if (el) el.remove();
    delete this.openWins[id];
    this._removeTaskbarItem(id);
  },

  minimizeWindow(id) {
    const win = document.getElementById('win-' + id);
    if (!win) return;
    win.style.display = 'none';
    this.openWins[id].minimized = true;
    document.querySelector(`.tb-item[data-id="${id}"]`)?.classList.add('minimized');
  },

  maximizeWindow(id) {
    const win = document.getElementById('win-' + id);
    if (!win) return;
    const isMax = win.dataset.max === '1';

    if (isMax) {
      // ── Restaurar ──
      win.style.width    = win.dataset.pw;
      win.style.height   = win.dataset.ph;
      win.style.left     = win.dataset.px;
      win.style.top      = win.dataset.py;
      win.style.zIndex   = win.dataset.pz || this.zCounter;
      win.style.borderRadius = '';
      win.dataset.max    = '0';
      // Volver a mostrar panel de misión
      document.getElementById('mission-panel').style.display = '';
      // Quitar botón de restauración y volver a cuadrado
      const btn = win.querySelector('.win-btn.maximize');
      if (btn) btn.textContent = '□';
    } else {
      // ── Guardar estado previo y maximizar ──
      win.dataset.pw   = win.style.width;
      win.dataset.ph   = win.style.height;
      win.dataset.px   = win.style.left;
      win.dataset.py   = win.style.top;
      win.dataset.pz   = win.style.zIndex;

      win.style.width        = '100vw';
      win.style.height       = 'calc(100vh - 44px)';
      win.style.left         = '0';
      win.style.top          = '0';
      win.style.borderRadius = '0';
      // Z-index por encima del panel de misión (900) y de otros iconos,
      // pero por debajo de la barra de tareas (1000)
      win.style.zIndex = '960';
      win.dataset.max  = '1';
      // Ocultar panel de misión para que no tape los controles
      document.getElementById('mission-panel').style.display = 'none';
      // Cambiar icono a símbolo de restaurar
      const btn = win.querySelector('.win-btn.maximize');
      if (btn) btn.textContent = '❐';
    }
  },

  focusWindow(id) {
    const win = document.getElementById('win-' + id);
    if (!win) return;
    win.style.display = '';
    // Solo cambiar z-index si no está maximizado (si está maximizado, se queda en 960)
    if (win.dataset.max !== '1') {
      win.style.zIndex = ++this.zCounter;
    }
    if (this.openWins[id]) this.openWins[id].minimized = false;
    document.querySelector(`.tb-item[data-id="${id}"]`)?.classList.remove('minimized');
  },

  // ─── Clic en iconos del escritorio ───────────────
  // Sistema de doble-clic manual: primer clic → seleccionar + tooltip,
  // segundo clic rápido (o espera breve) → abrir ventana.

  _iconTimers:   {},
  _selectedIcon: null,

  clickIcon(windowId, el) {
    // Deseleccionar el anterior si es diferente
    if (this._selectedIcon && this._selectedIcon !== el) {
      this._selectedIcon.classList.remove('selected');
      clearTimeout(this._iconTimers[this._selectedIcon.id]);
    }

    if (el.classList.contains('selected')) {
      // ── Segundo clic en el mismo icono seleccionado → abrir ──
      clearTimeout(this._iconTimers[el.id]);
      el.classList.remove('selected');
      this._selectedIcon = null;
      this.openWindow(windowId);
    } else {
      // ── Primer clic → seleccionar ──
      el.classList.add('selected');
      this._selectedIcon = el;
      // Auto-abrir tras 600 ms sin un segundo clic (mejora UX para niños)
      this._iconTimers[el.id] = setTimeout(() => {
        if (el.classList.contains('selected')) {
          el.classList.remove('selected');
          this._selectedIcon = null;
          this.openWindow(windowId);
        }
      }, 650);
    }
  },

  // ─── Barra de tareas ──────────────────────────────

  _addTaskbarItem(id, title) {
    const item = document.createElement('button');
    item.className = 'tb-item';
    item.dataset.id = id;
    // Mostrar solo emoji + nombre corto
    item.textContent = title.slice(0, 22);
    item.title       = title;
    item.onclick = () => {
      const w = this.openWins[id];
      if (w && w.minimized) this.focusWindow(id);
      else this.minimizeWindow(id);
    };
    document.getElementById('tb-items').appendChild(item);
  },

  _removeTaskbarItem(id) {
    document.querySelector(`.tb-item[data-id="${id}"]`)?.remove();
  },

  // ─── Draggable ────────────────────────────────────

  _makeDraggable(win, handle) {
    let ox, oy, ol, ot;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('win-btn')) return;
      if (win.dataset.max === '1') return;

      ox = e.clientX; oy = e.clientY;
      ol = parseInt(win.style.left) || 0;
      ot = parseInt(win.style.top)  || 0;
      win.style.zIndex = ++this.zCounter;

      const onMove = (e) => {
        win.style.left = Math.max(0, ol + e.clientX - ox) + 'px';
        win.style.top  = Math.max(0, ot + e.clientY - oy) + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  },

  // ─── Menú Inicio ─────────────────────────────────

  toggleStart() {
    document.getElementById('start-menu').classList.toggle('hidden');
  },

  closeStart() {
    document.getElementById('start-menu').classList.add('hidden');
  },

  // ─── Guía Spinosaurio ─────────────────────────────

  showGuide(text, ms = 7000) {
    const guide = document.getElementById('spino-guide');
    document.getElementById('guide-text').textContent = text;
    guide.classList.remove('hidden');
    clearTimeout(this.guideTimer);
    this.guideTimer = setTimeout(() => guide.classList.add('hidden'), ms);
  },

  closeGuide() {
    document.getElementById('spino-guide').classList.add('hidden');
    clearTimeout(this.guideTimer);
  }
};

// ═══════════════════════════════════════════════════
//  FILE EXPLORER — explorador de archivos virtual
// ═══════════════════════════════════════════════════
const FileExplorer = {

  buildHTML() {
    return `
      <div class="file-explorer">
        <div class="fe-toolbar">
          <button class="fe-btn" id="btn-new-folder" onclick="FileExplorer.newFolder()">
            📁 Nueva Carpeta
          </button>
          <span class="fe-path">📁 Mis Expediciones</span>
        </div>
        <div id="fe-storage" class="fe-storage-wrap"></div>
        <div class="fe-grid" id="fe-grid"></div>
      </div>
    `;
  },

  init() {
    this.render();
  },

  render() {
    const grid = document.getElementById('fe-grid');
    if (!grid) return;

    this._renderStorageBar();

    const fs = App.state.fileSystem;
    const entries = Object.entries(fs.children);

    if (entries.length === 0) {
      grid.innerHTML = '<p class="fe-empty">📂 Vacío. ¡Crea una carpeta nueva para comenzar tu expedición!</p>';
      return;
    }

    grid.innerHTML = '';
    entries.forEach(([name, item]) => {
      const el = document.createElement('div');
      el.className = 'fe-item';

      if (item.type === 'folder') {
        el.innerHTML = `
          <div class="fe-icon folder-ico"></div>
          <span>${name}</span>
        `;
      } else {
        const sizeTag = item.size ? `<span class="fe-size">${item.size} KB</span>` : '';
        el.innerHTML = `
          <div class="fe-icon file-ico"></div>
          <div class="fe-item-info">
            <span>${name}</span>
            ${sizeTag}
          </div>
          <button class="fe-move-btn" onclick="FileExplorer.moveFile('${name}')">
            → Mover a carpeta
          </button>
        `;
      }
      grid.appendChild(el);
    });
  },

  _renderStorageBar() {
    const bar = document.getElementById('fe-storage');
    if (!bar) return;

    const fs   = App.state.fileSystem;
    const max  = fs.maxSpace  || 1000;
    const used = fs.usedSpace || 0;
    const pct  = Math.min(100, (used / max) * 100);
    const pctStr = pct.toFixed(1);
    const status = pct > 90 ? '⚠️ CASI LLENO'
                 : pct > 70 ? '⚠️ Espacio limitado'
                 : '✓ Espacio disponible';
    const barColor = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--amber)' : 'var(--neon)';

    bar.innerHTML = `
      <div class="storage-info">
        <span>${used} KB / ${max} KB</span>
        <span class="storage-pct" style="color:${barColor}">${pctStr}%</span>
      </div>
      <div class="storage-bar">
        <div class="storage-used" style="width:${pctStr}%;background:${barColor}"></div>
      </div>
      <div class="storage-status" style="color:${barColor}">${status}</div>
    `;
  },

  /** Crea la carpeta de la misión */
  newFolder() {
    const name = Mission.current.folderName;
    const fs   = App.state.fileSystem;

    if (fs.children[name]) {
      Desktop.showGuide('La carpeta "' + name + '" ya existe. ¡Ahora abre DinoWord! 📝');
      return;
    }

    fs.children[name] = { type: 'folder', children: {} };
    this.render();

    Mission.onAction('folder-created', { name });
    Desktop.showGuide('✅ ¡Carpeta "' + name + '" creada! Ahora abre DinoWord y escribe el informe.');
  },

  /** Añade un archivo guardado desde DinoWord al sistema de archivos virtual */
  addFile(name, content, size) {
    const fileSize  = (size !== undefined) ? size : estimateFileSize(content);
    const fs        = App.state.fileSystem;
    const freeSpace = (fs.maxSpace || 1000) - (fs.usedSpace || 0);

    if (fileSize > freeSpace) {
      return { success: false, reason: 'storage-exceeded', needed: fileSize - freeSpace };
    }

    fs.children[name]  = { type: 'file', content, size: fileSize };
    fs.usedSpace        = (fs.usedSpace || 0) + fileSize;
    this.render();
    return { success: true, size: fileSize };
  },

  /** Mueve un archivo a la primera carpeta disponible */
  moveFile(filename) {
    // Validar que el paso previo esté completado antes de mover
    const check = Mission.canDoStep('move-file');
    if (!check.allowed) {
      Desktop.showGuide('💡 ' + check.reason);
      return;
    }

    const fs = App.state.fileSystem;
    const folderEntry = Object.entries(fs.children)
      .find(([, v]) => v.type === 'folder');

    if (!folderEntry) {
      Desktop.showGuide('⚠️ Primero crea una carpeta para poder mover el archivo.');
      return;
    }

    const [folderName, folder] = folderEntry;
    folder.children[filename]  = fs.children[filename];
    delete fs.children[filename];
    this.render();

    Mission.onAction('file-moved', { filename, folder: folderName });
    Desktop.showGuide('🗂️ "' + filename + '" movido a "' + folderName + '". ¡Paso completado! 🎉');
  }
};

// ═══════════════════════════════════════════════════
//  DINOWORD — editor de texto educativo
// ═══════════════════════════════════════════════════
const DinoWord = {

  TARGET_TEXT: 'El Spinosaurio encontró peces gigantes en el río.',
  _textTyped:   false,

  buildHTML() {
    const m = (typeof Mission !== 'undefined' && Mission.current) ? Mission.current : {
      targetText: 'El Spinosaurio encontró peces gigantes en el río.',
      fileName:   'informe_spino.doc'
    };
    return `
      <div class="dinoword">
        <div class="dw-toolbar">
          <div class="dw-fname-wrap">
            <label>📄 Nombre:</label>
            <input type="text" id="dw-filename" class="dw-filename"
                   value="${m.fileName}" placeholder="nombre_archivo.doc">
          </div>
          <button class="dw-save" onclick="DinoWord.save()">💾 Guardar</button>
        </div>
        <div class="dw-hint">
          <span>💡 Escribe exactamente:</span>
          <em id="dw-hint-text">"${m.targetText}"</em>
        </div>
        <textarea id="dw-content" class="dw-textarea"
          placeholder="Escribe tu informe de expedición aquí..."
          oninput="DinoWord.onChange(this.value)"></textarea>
        <div class="dw-status" id="dw-status">✏️ Listo para escribir…</div>
      </div>
    `;
  },

  init() {
    const m = (typeof Mission !== 'undefined' && Mission.current) ? Mission.current : {
      targetText: 'El Spinosaurio encontró peces gigantes en el río.',
      fileName:   'informe_spino.doc'
    };
    this.TARGET_TEXT = m.targetText;
    this._textTyped  = false;

    // Refrescar DOM — crítico cuando la ventana se reutiliza entre misiones
    const hintEl = document.getElementById('dw-hint-text');
    if (hintEl) hintEl.textContent = '"' + m.targetText + '"';

    const fnEl = document.getElementById('dw-filename');
    if (fnEl) fnEl.value = m.fileName;

    const ta = document.getElementById('dw-content');
    if (ta) ta.value = '';

    const st = document.getElementById('dw-status');
    if (st) { st.textContent = '✏️ Listo para escribir…'; st.className = 'dw-status'; }

    setTimeout(() => document.getElementById('dw-content')?.focus(), 100);
  },

  onChange(value) {
    const status = document.getElementById('dw-status');
    if (!status) return;

    if (value.includes(this.TARGET_TEXT)) {
      if (!this._textTyped) {
        // Verificar que el paso anterior esté completo antes de registrar
        const check = Mission.canDoStep('type-text');
        if (!check.allowed) {
          Desktop.showGuide('💡 ' + check.reason);
          status.textContent = '⚠️ ' + check.reason;
          status.className   = 'dw-status';
          return;
        }
        this._textTyped = true;
        Mission.onAction('text-typed', { value });
        status.textContent = '✅ ¡Texto correcto! Ahora guarda el archivo con "💾 Guardar".';
        status.className   = 'dw-status ok';
        const fn = Mission.current ? Mission.current.fileName : 'el archivo';
        Desktop.showGuide('¡Perfecto! 🦕 Guarda el archivo. Asegúrate de que el nombre sea "' + fn + '".');
      }
    } else {
      status.textContent = '✏️ Escribiendo… ' + value.length + ' caracteres';
      status.className   = 'dw-status';
    }
  },

  save() {
    const filenameEl = document.getElementById('dw-filename');
    const contentEl  = document.getElementById('dw-content');
    const status     = document.getElementById('dw-status');

    const filename = filenameEl?.value.trim();
    this._currentFileName = filename;
    const content  = contentEl?.value.trim();

    if (!filename) {
      alert('📄 Escribe un nombre para el archivo antes de guardar.');
      filenameEl?.focus();
      return { success: false };
    }
    if (!content) {
      alert('✏️ El documento está vacío. Escribe tu informe primero.');
      contentEl?.focus();
      return { success: false };
    }

    // ── Calcular tamaño y verificar espacio ──
    const fileSize  = estimateFileSize(content);
    const fs        = App.state.fileSystem;
    const freeSpace = (fs.maxSpace || 1000) - (fs.usedSpace || 0);

    if (fileSize > freeSpace) {
      const needed = fileSize - freeSpace;
      Desktop.showGuide(`⚠️ ¡Sin espacio! Necesitas ${needed} KB más. El archivo pesa ${fileSize} KB pero solo quedan ${freeSpace} KB.`, 5000);
      AudioEngine.play('error');
      if (status) { status.textContent = `⚠️ Sin espacio: ${fileSize} KB necesarios, ${freeSpace} KB disponibles`; status.className = 'dw-status'; }
      Mission.onAction('storage-exceeded', { filename, fileSize, needed });
      return { success: false, reason: 'storage-exceeded' };
    }

    // ── Guardar ──
    const addResult = FileExplorer.addFile(filename, content, fileSize);
    if (!addResult.success) {
      Desktop.showGuide(`⚠️ Error al guardar: sin espacio suficiente.`, 4000);
      return { success: false };
    }

    DinoLog.track('file', { size: fileSize });
    AudioEngine.play('file-saved');
    Achievements.check('file-count', DinoLog.data.files);

    // Logro eficiencia: 5+ archivos con total < 150 KB
    if (DinoLog.data.files >= 5 && DinoLog.data.total_files_size <= 150) {
      Achievements.check('file-efficiency', DinoLog.data.files);
    }
    // Logro almacenamiento eficiente: 95%+ usado
    const pct = (fs.usedSpace || 0) / (fs.maxSpace || 1000);
    if (pct >= 0.95) Achievements.check('storage-efficiency', pct);

    if (status) {
      status.textContent = `💾 Guardado: ${filename} (${fileSize} KB) ✅`;
      status.className   = 'dw-status ok';
    }

    Mission.onAction('file-saved', { filename, content });
    Desktop.showGuide(`💾 "${filename}" guardado (${fileSize} KB). Ve al Explorador y muévelo a la carpeta.`);

    return { success: true, fileSize };
  }
};

// ═══════════════════════════════════════════════════
//  SETTINGS — personalización del laboratorio
// ═══════════════════════════════════════════════════
const Settings = {

  SCHEMES: {
    neon:   { neon: '#00ff88', dim: '#00cc6a', label: 'Verde Neón',       dot: '#00ff88' },
    amber:  { neon: '#ffb700', dim: '#cc9200', label: 'Ámbar Solar',      dot: '#ffb700' },
    blue:   { neon: '#4499ff', dim: '#2277dd', label: 'Azul Eléctrico',   dot: '#4499ff' },
    purple: { neon: '#cc66ff', dim: '#aa44dd', label: 'Púrpura Jurásico', dot: '#cc66ff' }
  },

  buildHTML() {
    const s = (typeof App !== 'undefined') ? App.state.settings : { labName: 'DinoPC Lab', accent: 'neon' };
    const swatches = Object.entries(this.SCHEMES).map(([key, scheme]) =>
      `<button class="swatch-btn ${s.accent === key ? 'active' : ''}"
               data-key="${key}" onclick="Settings.selectColor('${key}')" title="${scheme.label}">
         <span class="swatch-dot" style="background:${scheme.dot}"></span>
         <span class="swatch-name">${scheme.label}</span>
       </button>`
    ).join('');

    return `
      <div class="settings-wrap">
        <div class="settings-sec">
          <label class="setting-lbl">🔊 Sonido</label>
          <label class="sound-toggle-lbl">
            <input type="checkbox" id="sound-check"
                   ${!AudioEngine.isMuted ? 'checked' : ''}
                   onchange="AudioEngine[this.checked ? 'unmute' : 'mute']();
                             const btn=document.getElementById('tb-sound');
                             if(btn) btn.textContent=AudioEngine.isMuted?'🔇':'🔊'">
            <span>Efectos de sonido activados</span>
          </label>
        </div>
        <div class="settings-sec">
          <label class="setting-lbl">🏷️ Nombre del Laboratorio</label>
          <input type="text" id="lab-name-input" class="setting-input"
                 value="${s.labName}" maxlength="32" placeholder="Mi Lab Jurásico">
        </div>
        <div class="settings-sec">
          <label class="setting-lbl">🎨 Color de Acento</label>
          <div class="swatches-row">${swatches}</div>
        </div>
        <div class="settings-preview" id="settings-preview"></div>
        <button class="btn-primary settings-apply" onclick="Settings.apply()">✅ Aplicar cambios</button>
        <p class="settings-note">Los cambios se guardan automáticamente</p>
      </div>`;
  },

  init() {
    const s = (typeof App !== 'undefined') ? App.state.settings : { accent: 'neon' };
    this._updatePreview(s.accent);
  },

  selectColor(key) {
    document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.swatch-btn[data-key="${key}"]`)?.classList.add('active');
    this._updatePreview(key);
  },

  _updatePreview(key) {
    const scheme = this.SCHEMES[key];
    if (!scheme) return;
    const prev = document.getElementById('settings-preview');
    if (prev) {
      prev.innerHTML =
        `<span style="color:${scheme.neon}">●</span> Vista previa:
         <b style="color:${scheme.neon}">${scheme.label}</b>
         <button style="background:${scheme.neon};color:#000;padding:3px 10px;
                        border-radius:4px;font-size:11px;margin-left:8px">Botón</button>`;
      prev.style.borderColor = scheme.neon + '55';
    }
  },

  apply() {
    const name = document.getElementById('lab-name-input')?.value.trim() || 'DinoPC Lab';
    const key  = document.querySelector('.swatch-btn.active')?.dataset.key || 'neon';
    App.applySettings({ labName: name, accent: key });
    Desktop.showGuide(`✅ ¡Configuración guardada! Laboratorio: "${name}"`);
  }
};
