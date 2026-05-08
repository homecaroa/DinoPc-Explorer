/**
 * DinoPC Explorer — desktop.js
 * Gestiona ventanas arrastrables, barra de tareas, menú inicio,
 * explorador de archivos (FileExplorer) y editor DinoWord.
 */

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
    'trash':         { title: '🗑️ Papelera de Reciclaje',         w: 340, h: 220, init: null                      }
  },

  /** Contenido HTML de cada ventana */
  _buildContent(id) {
    switch (id) {
      case 'file-explorer': return FileExplorer.buildHTML();
      case 'dinoword':      return DinoWord.buildHTML();
      case 'minigame':      return `<div class="game-container"><canvas id="game-canvas" width="724" height="396"></canvas></div>`;
      case 'quiz':          return Quiz.buildHTML();
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
    });
  },

  // ─── Ventanas ─────────────────────────────────────

  openWindow(id) {
    const tpl = this.templates[id];
    if (!tpl) return;

    // Si ya existe, enfocar
    if (this.openWins[id]) {
      this.focusWindow(id);
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

    // Notificar a la misión
    Mission.onAction('open-window', { id });
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
      // Restaurar
      win.style.width  = win.dataset.pw;
      win.style.height = win.dataset.ph;
      win.style.left   = win.dataset.px;
      win.style.top    = win.dataset.py;
      win.dataset.max  = '0';
    } else {
      // Guardar estado previo
      win.dataset.pw   = win.style.width;
      win.dataset.ph   = win.style.height;
      win.dataset.px   = win.style.left;
      win.dataset.py   = win.style.top;
      win.style.width  = '100vw';
      win.style.height = 'calc(100vh - 44px)';
      win.style.left   = '0';
      win.style.top    = '0';
      win.dataset.max  = '1';
    }
  },

  focusWindow(id) {
    const win = document.getElementById('win-' + id);
    if (!win) return;
    win.style.display = '';
    win.style.zIndex  = ++this.zCounter;
    if (this.openWins[id]) this.openWins[id].minimized = false;
    document.querySelector(`.tb-item[data-id="${id}"]`)?.classList.remove('minimized');
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
        el.innerHTML = `
          <div class="fe-icon file-ico"></div>
          <span>${name}</span>
          <button class="fe-move-btn" onclick="FileExplorer.moveFile('${name}')">
            → Mover a carpeta
          </button>
        `;
      }
      grid.appendChild(el);
    });
  },

  /** Crea la carpeta de la misión */
  newFolder() {
    const name = 'Expedición Spinosaurio';
    const fs   = App.state.fileSystem;

    // Evitar duplicados
    if (fs.children[name]) {
      Desktop.showGuide('La carpeta "' + name + '" ya existe. ¡Ahora abre DinoWord! 📝');
      return;
    }

    fs.children[name] = { type: 'folder', children: {} };
    this.render();

    Mission.onAction('create-folder', { name });
    Desktop.showGuide(
      '✅ ¡Carpeta "' + name + '" creada! Ahora abre DinoWord y escribe tu informe sobre el Spinosaurio.'
    );
  },

  /** Añade un archivo guardado desde DinoWord al sistema de archivos virtual */
  addFile(name, content) {
    App.state.fileSystem.children[name] = { type: 'file', content };
    this.render();
  },

  /** Mueve un archivo a la primera carpeta disponible */
  moveFile(filename) {
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

    Mission.onAction('move-file', { filename, folder: folderName });
    Desktop.showGuide(
      '🗂️ "' + filename + '" movido a "' + folderName + '". ¡Paso completado! 🎉'
    );
  }
};

// ═══════════════════════════════════════════════════
//  DINOWORD — editor de texto educativo
// ═══════════════════════════════════════════════════
const DinoWord = {

  TARGET_TEXT: 'El Spinosaurio encontró peces gigantes en el río.',
  _textTyped:   false,

  buildHTML() {
    return `
      <div class="dinoword">
        <div class="dw-toolbar">
          <div class="dw-fname-wrap">
            <label>📄 Nombre:</label>
            <input type="text" id="dw-filename" class="dw-filename"
                   value="informe_spino.doc" placeholder="nombre_archivo.doc">
          </div>
          <button class="dw-save" onclick="DinoWord.save()">💾 Guardar</button>
        </div>
        <div class="dw-hint">
          <span>💡 Escribe exactamente:</span>
          <em>"El Spinosaurio encontró peces gigantes en el río."</em>
        </div>
        <textarea id="dw-content" class="dw-textarea"
          placeholder="Escribe tu informe de expedición aquí..."
          oninput="DinoWord.onChange(this.value)"></textarea>
        <div class="dw-status" id="dw-status">✏️ Listo para escribir…</div>
      </div>
    `;
  },

  init() {
    // Auto-foco al textarea
    setTimeout(() => document.getElementById('dw-content')?.focus(), 100);
    this._textTyped = false;
  },

  onChange(value) {
    const status = document.getElementById('dw-status');
    if (!status) return;

    if (value.includes(this.TARGET_TEXT)) {
      if (!this._textTyped) {
        this._textTyped = true;
        Mission.onAction('type-text', { value });
        status.textContent = '✅ ¡Texto correcto! Ahora guarda el archivo con el botón "💾 Guardar".';
        status.className   = 'dw-status ok';
        Desktop.showGuide('¡Perfecto! 🦕 Ahora guarda el archivo. Asegúrate de que el nombre sea "informe_spino.doc".');
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
    const content  = contentEl?.value.trim();

    if (!filename) {
      alert('📄 Escribe un nombre para el archivo antes de guardar.');
      filenameEl?.focus();
      return;
    }
    if (!content) {
      alert('✏️ El documento está vacío. Escribe tu informe primero.');
      contentEl?.focus();
      return;
    }

    // Añadir al sistema de archivos virtual
    FileExplorer.addFile(filename, content);

    if (status) {
      status.textContent = '💾 Guardado: ' + filename + ' ✅';
      status.className   = 'dw-status ok';
    }

    Mission.onAction('save-file', { filename, content });

    Desktop.showGuide(
      '💾 Archivo "' + filename + '" guardado. ' +
      'Ve al Explorador de Archivos y mueve el documento a la carpeta de la expedición.'
    );
  }
};
