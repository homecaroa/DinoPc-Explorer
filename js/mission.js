/**
 * DinoPC Explorer — mission.js
 * Sistema de misiones múltiples: 3 expediciones secuenciales.
 * La misión activa se determina por los dinos ya desbloqueados.
 */

const Mission = {

  // ─── Definición de las 3 misiones ────────────────

  MISSIONS: [
    {
      id:         'spinosaurus',
      num:        1,
      title:      'Expedición Spinosaurio',
      dino:       'spinosaurus',
      folderName: 'Expedición Spinosaurio',
      targetText: 'El Spinosaurio encontró peces gigantes en el río.',
      fileName:   'informe_spino.doc',
      intro:      '¡Bienvenido al laboratorio! 🦕 Tu primera misión: documenta al Spinosaurio, el mayor carnívoro que existió. Empieza creando una carpeta en "Mis Expediciones".'
    },
    {
      id:         'trex',
      num:        2,
      title:      'Expedición T-Rex',
      dino:       'trex',
      folderName: 'Expedición TRex',
      targetText: 'El Tiranosaurio Rex fue el depredador más temido del Cretácico tardío.',
      fileName:   'informe_trex.doc',
      intro:      '¡Increíble trabajo! 🦖 Ahora estudiaremos al legendario T-Rex. Crea una nueva carpeta y redacta su informe científico en DinoWord.'
    },
    {
      id:         'triceratops',
      num:        3,
      title:      'Expedición Triceratops',
      dino:       'triceratops',
      folderName: 'Expedición Triceratops',
      targetText: 'El Triceratops usaba sus tres cuernos para defenderse de los depredadores.',
      fileName:   'informe_triceratops.doc',
      intro:      '¡Última expedición! 🦏 El Triceratops nos espera. Es el herbívoro con armadura más famoso del Cretácico. ¡Crea su expedición y documenta sus datos!'
    }
  ],

  STEPS: [
    { id: 'create-folder', label: 'Crear carpeta de expedición' },
    { id: 'open-dinoword', label: 'Abrir DinoWord'              },
    { id: 'type-text',     label: 'Escribir el informe'          },
    { id: 'save-file',     label: 'Guardar el archivo'           },
    { id: 'move-file',     label: 'Mover archivo a la carpeta'   }
  ],

  _completedSteps: [],
  panelHidden:     false,

  // ─── Getters de misión activa ─────────────────────

  get currentIdx() {
    const unlocked = App.state.unlockedDinos;
    const idx = this.MISSIONS.findIndex(m => !unlocked.includes(m.dino));
    return idx === -1 ? this.MISSIONS.length - 1 : idx;
  },

  get current() { return this.MISSIONS[this.currentIdx]; },

  get allComplete() {
    return this.MISSIONS.every(m => App.state.unlockedDinos.includes(m.dino));
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

  onAction(action, data) {
    data = data || {};
    if (this.allComplete) return;

    switch (action) {
      case 'create-folder':
        this._complete('create-folder');
        break;

      case 'open-window':
        if (data.id === 'dinoword') this._complete('open-dinoword');
        break;

      case 'type-text':
        this._complete('type-text');
        break;

      case 'save-file': {
        const expected = this.current.fileName;
        if (data.filename && data.filename.toLowerCase().trim() === expected) {
          this._complete('save-file');
        } else {
          Desktop.showGuide(
            '⚠️ El archivo debe llamarse exactamente "' + expected + '". Lo guardaste como "' + data.filename + '". ¡Inténtalo de nuevo!'
          );
        }
        break;
      }

      case 'move-file':
        this._complete('move-file');
        break;
    }
  },

  // ─── Lógica interna ───────────────────────────────

  _complete(stepId) {
    if (this._completedSteps.includes(stepId)) return;
    this._completedSteps.push(stepId);
    this._renderPanel();
    this._animateStep(stepId);
    DinoLog.track('step');

    if (this._completedSteps.length === this.STEPS.length) {
      setTimeout(function() { Mission._onMissionComplete(); }, 800);
    }
  },

  _onMissionComplete() {
    var m = this.current;
    DinoLog.track('mission');
    Desktop.showGuide(
      '🏆 ¡Expedición "' + m.title + '" completada! Ahora demuestra tus conocimientos en el DinoQuiz para desbloquear la ficha.',
      10000
    );
    Quiz.forDino = m.dino;
    setTimeout(function() { Desktop.openWindow('quiz'); }, 2600);
  },

  // ─── Renderizado del panel ────────────────────────

  _renderPanel() {
    var container = document.getElementById('mp-steps');
    var header    = document.querySelector('.mp-header span');
    if (!container) return;

    var m   = this.current;
    var all = this.allComplete;

    if (header) {
      header.textContent = all
        ? '🏆 ¡TODAS COMPLETADAS!'
        : '🦕 MISIÓN ' + m.num + '/3 · ' + m.title.toUpperCase();
    }

    if (all) {
      container.innerHTML =
        '<div class="mp-all-done"><div>¡Eres un paleontólogo experto!</div><div class="mp-dinos">🦕 🦖 🦏</div></div>';
      return;
    }

    var self = this;
    container.innerHTML = this.STEPS.map(function(step, i) {
      var done   = self._completedSteps.includes(step.id);
      var active = !done && self._completedSteps.length === i;
      var cls    = done ? 'done' : active ? 'active' : '';
      var icon   = done ? '✓' : active ? '→' : String(i + 1);
      return '<div class="mp-step ' + cls + '" id="mstep-' + step.id + '">' +
             '<div class="step-dot">' + icon + '</div>' +
             '<span>' + step.label + '</span></div>';
    }).join('');

    // Barra de progreso de misiones
    var dots = this.MISSIONS.map(function(mission, i) {
      var isDone    = App.state.unlockedDinos.includes(mission.dino);
      var isCurrent = i === self.currentIdx;
      var cls       = isDone ? 'done' : isCurrent ? 'active' : '';
      return '<span class="mp-mdot ' + cls + '" title="' + mission.title + '"></span>';
    }).join('');

    container.innerHTML +=
      '<div class="mp-mbar">' + dots +
      '<span class="mp-mlabel">misión ' + (this.currentIdx + 1) + ' de ' + this.MISSIONS.length + '</span></div>';
  },

  _animateStep(stepId) {
    var el = document.getElementById('mstep-' + stepId);
    if (!el) return;
    el.style.transition = 'none';
    el.style.background = 'rgba(0,255,136,0.22)';
    setTimeout(function() { el.style.transition = 'background 1.2s'; el.style.background = ''; }, 50);
  },

  togglePanel() {
    var steps = document.getElementById('mp-steps');
    var btn   = document.querySelector('.mp-toggle');
    this.panelHidden = !this.panelHidden;
    steps.style.display = this.panelHidden ? 'none' : '';
    if (btn) btn.classList.toggle('up', !this.panelHidden);
  }
};
