/**
 * DinoPC Explorer — mission.js v2
 * Sistema de 3 misiones con STEPS encadenados, validación de requisitos
 * y panel visual con clases done / next / todo.
 */

const Mission = {

  // ─── Definición de misiones ───────────────────────

  MISSIONS: [
    {
      id: 'spinosaurus', num: 1,
      title: 'Expedición Spinosaurio', dino: 'spinosaurus',
      folderName: 'Expedición Spinosaurio',
      targetText: 'El Spinosaurio encontró peces gigantes en el río.',
      fileName:   'informe_spino.doc',
      intro: '¡Bienvenido al laboratorio! 🦕 Tu primera misión: documenta al Spinosaurio, el mayor carnívoro que existió. Empieza creando una carpeta en "Mis Expediciones".'
    },
    {
      id: 'trex', num: 2,
      title: 'Expedición T-Rex', dino: 'trex',
      folderName: 'Expedición TRex',
      targetText: 'El Tiranosaurio Rex fue el depredador más temido del Cretácico tardío.',
      fileName:   'informe_trex.doc',
      intro: '¡Increíble trabajo! 🦖 Ahora estudiaremos al legendario T-Rex. Crea una nueva carpeta y redacta su informe científico en DinoWord.'
    },
    {
      id: 'triceratops', num: 3,
      title: 'Expedición Triceratops', dino: 'triceratops',
      folderName: 'Expedición Triceratops',
      targetText: 'El Triceratops usaba sus tres cuernos para defenderse de los depredadores.',
      fileName:   'informe_triceratops.doc',
      intro: '¡Última expedición! 🦏 El Triceratops nos espera. Es el herbívoro con armadura más famoso del Cretácico.'
    }
  ],

  // ─── Pasos con cadena de requisitos ──────────────

  STEPS: {
    'create-folder': { label: '📁 Crear carpeta',   requires: null,            action: 'folder-created' },
    'open-dinoword': { label: '📝 Abrir DinoWord',   requires: 'create-folder', action: 'window-opened'  },
    'type-text':     { label: '⌨️ Escribir texto',   requires: 'open-dinoword', action: 'text-typed'     },
    'save-file':     { label: '💾 Guardar archivo',  requires: 'type-text',     action: 'file-saved'     },
    'move-file':     { label: '🚚 Mover archivo',    requires: 'save-file',     action: 'file-moved'     }
  },

  _completedSteps: [],
  panelHidden:     false,

  // ─── Getters ──────────────────────────────────────

  get currentIdx() {
    const unlocked = App.state.unlockedDinos;
    const idx = this.MISSIONS.findIndex(m => !unlocked.includes(m.dino));
    return idx === -1 ? this.MISSIONS.length - 1 : idx;
  },

  get current() { return this.MISSIONS[this.currentIdx]; },

  get allComplete() {
    return this.MISSIONS.every(m => App.state.unlockedDinos.includes(m.dino));
  },

  // ─── API pública ──────────────────────────────────

  /** Primer paso aún no completado, o null si todos hechos */
  getNextStep() {
    return Object.keys(this.STEPS).find(id => !this._completedSteps.includes(id)) || null;
  },

  /**
   * Comprueba si un paso puede ejecutarse ahora.
   * @returns {{ allowed: boolean, reason?: string }}
   */
  canDoStep(stepId) {
    const step = this.STEPS[stepId];
    if (!step)
      return { allowed: false, reason: 'Paso desconocido: ' + stepId };
    if (this._completedSteps.includes(stepId))
      return { allowed: false, reason: 'Este paso ya está completado.' };
    if (step.requires && !this._completedSteps.includes(step.requires)) {
      const reqLabel = (this.STEPS[step.requires] || {}).label || step.requires;
      return { allowed: false, reason: 'Primero debes completar: ' + reqLabel };
    }
    return { allowed: true };
  },

  // ─── Inicialización ───────────────────────────────

  init() {
    this._completedSteps = [];
    this._renderPanel();
    setTimeout(() => Desktop.showGuide(
      this.allComplete
        ? '🏆 ¡Has completado las 3 expediciones! Eres un paleontólogo experto.'
        : this.current.intro
    ), 400);
  },

  // ─── Detector de acciones ─────────────────────────

  /**
   * Punto de entrada para todos los módulos.
   * Mapea la acción → stepId → valida → completa.
   * @returns {{ success: boolean, reason?: string }}
   */
  onAction(action, data) {
    data = data || {};
    if (this.allComplete) return { success: false };

    const stepId = this._resolveStep(action, data);
    if (!stepId) return { success: false };

    const check = this.canDoStep(stepId);
    if (!check.allowed) {
      console.warn('Mission.onAction bloqueado [' + stepId + ']:', check.reason);
      return { success: false, reason: check.reason };
    }

    this._complete(stepId);
    return { success: true };
  },

  // ─── Internos ─────────────────────────────────────

  /**
   * Mapea string de acción → stepId usando STEPS[].action.
   * Aplica validación especial para 'file-saved' (comprueba nombre).
   */
  _resolveStep(action, data) {
    for (const [id, step] of Object.entries(this.STEPS)) {
      if (step.action !== action) continue;

      if (id === 'save-file') {
        const expected = this.current.fileName;
        const given    = (data.filename || '').toLowerCase().trim();
        if (given !== expected) {
          Desktop.showGuide('⚠️ Guarda el archivo como "' + expected +
            '". Lo guardaste como "' + (data.filename || 'sin nombre') + '".');
          return null;
        }
      }

      return id;
    }
    return null;
  },

  _complete(stepId) {
    if (this._completedSteps.includes(stepId)) return;
    this._completedSteps.push(stepId);
    this._renderPanel();
    this._animateStep(stepId);
    DinoLog.track('step');
    AudioEngine.play('success');

    if (this._completedSteps.length === Object.keys(this.STEPS).length) {
      setTimeout(() => Mission._onMissionComplete(), 800);
    }
  },

  _onMissionComplete() {
    const m = this.current;
    DinoLog.track('mission');
    AudioEngine.play('mission-complete');
    Achievements.check('mission-complete', DinoLog.data.missions);

    // Notificación por email al padre/tutor (abre cliente de correo)
    const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
    if (user && user.email) {
      EmailService.sendMissionComplete(user, m.title, m.title.split(' ').pop());
    }
    Desktop.showGuide(
      '🏆 ¡Expedición "' + m.title + '" completada! ' +
      'Demuestra tus conocimientos en el DinoQuiz para desbloquear la ficha.',
      10000
    );
    Quiz.forDino = m.dino;
    setTimeout(() => Desktop.openWindow('quiz'), 2600);
  },

  // ─── Panel visual ─────────────────────────────────

  _renderPanel() {
    const container = document.getElementById('mp-steps');
    const header    = document.querySelector('.mp-header span');
    if (!container) return;

    const m   = this.current;
    const all = this.allComplete;

    if (header) {
      header.textContent = all
        ? '🏆 ¡TODAS COMPLETADAS!'
        : '🦕 MISIÓN ' + m.num + '/3 · ' + m.title.toUpperCase();
    }

    if (all) {
      container.innerHTML =
        '<div class="mp-all-done">' +
          '<div>¡Eres un paleontólogo experto!</div>' +
          '<div class="mp-dinos">🦕 🦖 🦏</div>' +
        '</div>';
      return;
    }

    const nextStep = this.getNextStep();

    // Lista de pasos con clases semánticas
    const stepsHTML = '<div class="steps-list">' +
      Object.entries(this.STEPS).map(([id, step]) => {
        const done   = this._completedSteps.includes(id);
        const isNext = id === nextStep;
        const cls    = done ? 'step step-done'
                     : isNext ? 'step step-next'
                     : 'step step-todo';
        const icon   = done ? '✓' : isNext ? '⬜' : '•';
        return '<div class="' + cls + '" data-step="' + id + '">' +
               icon + ' ' + step.label + '</div>';
      }).join('') +
    '</div>';

    // Indicador de progreso de misiones
    const dots = this.MISSIONS.map((mission, i) => {
      const isDone    = App.state.unlockedDinos.includes(mission.dino);
      const isCurrent = i === this.currentIdx;
      const cls       = isDone ? 'done' : isCurrent ? 'active' : '';
      return '<span class="mp-mdot ' + cls + '" title="' + mission.title + '"></span>';
    }).join('');

    container.innerHTML = stepsHTML +
      '<div class="mp-mbar">' + dots +
      '<span class="mp-mlabel">misión ' + (this.currentIdx + 1) +
      ' de ' + this.MISSIONS.length + '</span></div>';
  },

  /** Destellar brevemente el paso recién completado */
  _animateStep(stepId) {
    const el = document.querySelector('[data-step="' + stepId + '"]');
    if (!el) return;
    el.style.transition = 'none';
    el.style.background = 'rgba(0,255,136,0.25)';
    setTimeout(() => { el.style.transition = 'background 1.2s'; el.style.background = ''; }, 50);
  },

  togglePanel() {
    const steps = document.getElementById('mp-steps');
    const btn   = document.querySelector('.mp-toggle');
    this.panelHidden = !this.panelHidden;
    steps.style.display = this.panelHidden ? 'none' : '';
    if (btn) btn.classList.toggle('up', !this.panelHidden);
  }
};
