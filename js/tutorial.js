/**
 * DinoPC Explorer — tutorial.js
 * Tutorial interactivo de bienvenida (5 pasos con Rex).
 * Se muestra solo a jugadores nuevos (sin dinos desbloqueados).
 */

const Tutorial = {

  STEPS: [
    {
      icon:  '📄',
      title: '¿Qué es un ARCHIVO?',
      body:  'Un archivo guarda información en tu computadora, como una hoja de papel con cosas escritas. Puede ser texto, imágenes o música. ¡En DinoPC Explorer crearás informes de tus expediciones jurásicas!',
      rex:   'tutorial',
      visual: `
        <div class="tv-file-wrap">
          <div class="tv-doc">
            <div class="tv-doc-corner"></div>
            <div class="tv-line w70"></div><div class="tv-line w90"></div>
            <div class="tv-line w60"></div><div class="tv-line w80"></div>
            <div class="tv-line w50"></div>
          </div>
          <div class="tv-label">informe_spino.doc</div>
        </div>`
    },
    {
      icon:  '📁',
      title: '¿Qué es una CARPETA?',
      body:  'Una carpeta organiza tus archivos. Es como una mochila donde guardas tus papeles ordenados. Puedes darles nombres descriptivos para encontrar todo enseguida.',
      rex:   'talking',
      visual: `
        <div class="tv-folder-wrap">
          <div class="tv-folder">
            <div class="tv-folder-tab"></div>
            <div class="tv-folder-body">
              <span class="tv-mini-doc">📄</span>
              <span class="tv-mini-doc">📄</span>
              <span class="tv-mini-doc">📄</span>
            </div>
          </div>
          <div class="tv-label">Expedición Spinosaurio/</div>
        </div>`
    },
    {
      icon:  '💾',
      title: '¿Qué es GUARDAR?',
      body:  '¡Guardar es muy importante! Cuando guardas, la computadora recuerda tu trabajo para siempre. Si cierras un programa sin guardar… ¡se pierde todo! Es como anotar en tu libreta antes de dormir.',
      rex:   'tutorial',
      visual: `
        <div class="tv-save-wrap">
          <div class="tv-save-before">
            <span class="tv-save-icon">📝</span>
            <span class="tv-save-txt">Sin guardar</span>
            <span class="tv-save-warn">⚠️</span>
          </div>
          <div class="tv-save-arrow">→</div>
          <div class="tv-save-after">
            <span class="tv-save-icon">💾</span>
            <span class="tv-save-txt">¡Guardado!</span>
            <span class="tv-save-ok">✅</span>
          </div>
        </div>`
    },
    {
      icon:  '🖥️',
      title: 'El ESCRITORIO',
      body:  'El escritorio es tu espacio de trabajo principal. Haz clic en los iconos para abrir programas y carpetas. ¡Es como la mesa de un científico jurásico con todo a mano!',
      rex:   'talking',
      visual: `
        <div class="tv-desktop-wrap">
          <div class="tv-dsk">
            <div class="tv-dsk-icon">📁</div>
            <div class="tv-dsk-icon">📝</div>
            <div class="tv-dsk-icon">🎮</div>
            <div class="tv-dsk-icon">🧠</div>
          </div>
          <div class="tv-taskbar-mini">
            <span>🦕 DinoPC</span>
          </div>
        </div>`
    },
    {
      icon:  '🦕',
      title: '¡Listo para explorar!',
      body:  '¡Perfecto! Ya sabes lo necesario. Tu primera misión: crea una expedición y escribe un informe sobre el Spinosaurio. ¡Yo, Rex, te guiaré en cada paso!',
      rex:   'victory',
      visual: `
        <div class="tv-ready-wrap">
          <img src="assets/images/spinosaurus_victory.png"
               class="tv-victory-img" alt="Rex victorioso"
               onerror="this.style.display='none'">
          <div class="tv-ready-badge">¡A explorar!</div>
        </div>`
    }
  ],

  step: 0,

  // ─── Mostrar tutorial ─────────────────────────────

  show() {
    this.step = 0;
    App.showScreen('tutorial');
    this._render();
  },

  _render() {
    const s   = this.STEPS[this.step];
    const tot = this.STEPS.length;

    // Textos
    document.getElementById('tut-icon').textContent  = s.icon;
    document.getElementById('tut-title').textContent = s.title;
    document.getElementById('tut-body').textContent  = s.body;

    // Visual dinámico
    const vis = document.getElementById('tut-visual');
    if (vis) vis.innerHTML = s.visual;

    // Imagen de Rex (alterna entre poses)
    const img = document.getElementById('tut-rex-img');
    if (img) {
      img.src = `assets/images/spinosaurus_${s.rex}.png`;
      img.style.animation = 'none';
      void img.offsetWidth;
      img.style.animation = '';
    }

    // Dots de progreso
    document.getElementById('tut-dots').innerHTML = this.STEPS.map((_, i) =>
      `<span class="tut-dot ${i < this.step ? 'done' : i === this.step ? 'active' : ''}"></span>`
    ).join('');

    // Botón
    const btn = document.getElementById('tut-next-btn');
    if (btn) btn.textContent = this.step < tot - 1 ? 'Siguiente →' : '¡Comenzar expedición! 🦕';

    // Animación de entrada
    const card = document.getElementById('tut-card');
    if (card) {
      card.classList.remove('tut-slide');
      void card.offsetWidth;
      card.classList.add('tut-slide');
    }
  },

  // ─── Navegación ───────────────────────────────────

  next() {
    if (this.step < this.STEPS.length - 1) {
      this.step++;
      this._render();
    } else {
      App.startDesktop();
    }
  },

  skip() {
    App.startDesktop();
  }
};
