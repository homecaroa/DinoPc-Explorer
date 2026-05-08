/**
 * DinoPC Explorer — mission.js
 * Sistema de misión: detecta automáticamente los 5 pasos
 * y gestiona el progreso del jugador.
 */

const Mission = {

  /** Definición de los 5 pasos */
  STEPS: [
    { id: 'create-folder', label: 'Crear carpeta "Expedición Spinosaurio"' },
    { id: 'open-dinoword', label: 'Abrir el editor DinoWord'               },
    { id: 'type-text',     label: 'Escribir el texto del informe'           },
    { id: 'save-file',     label: 'Guardar como "informe_spino.doc"'        },
    { id: 'move-file',     label: 'Mover el archivo a la carpeta'           }
  ],

  completed:   [],   // IDs de pasos completados
  panelHidden: false,

  // ─── Inicialización ───────────────────────────────

  init() {
    this.completed = [];
    this._renderPanel();
  },

  // ─── Detector de acciones ─────────────────────────

  /**
   * Punto de entrada: cualquier módulo llama a este método
   * cuando ocurre una acción relevante.
   *
   * @param {string} action - Tipo de acción ('open-window', 'create-folder', ...)
   * @param {object} data   - Datos adicionales de la acción
   */
  onAction(action, data = {}) {
    switch (action) {

      case 'create-folder':
        // Paso 1: cualquier carpeta creada cuenta
        this._complete('create-folder');
        break;

      case 'open-window':
        // Paso 2: abrir DinoWord
        if (data.id === 'dinoword') {
          this._complete('open-dinoword');
        }
        break;

      case 'type-text':
        // Paso 3: escribir el texto correcto
        this._complete('type-text');
        break;

      case 'save-file':
        // Paso 4: guardar con nombre correcto
        if (data.filename && data.filename.toLowerCase().trim() === 'informe_spino.doc') {
          this._complete('save-file');
        } else {
          // Guardar con nombre incorrecto → orientar al jugador
          Desktop.showGuide(
            '⚠️ El archivo se guardó como "' + data.filename + '". ' +
            'La misión requiere guardarlo como "informe_spino.doc". ¡Inténtalo de nuevo!'
          );
        }
        break;

      case 'move-file':
        // Paso 5: mover el archivo a una carpeta
        this._complete('move-file');
        break;
    }
  },

  // ─── Lógica interna ───────────────────────────────

  /** Marca un paso como completado */
  _complete(stepId) {
    if (this.completed.includes(stepId)) return; // ya completado

    this.completed.push(stepId);
    this._renderPanel();
    this._animateStep(stepId);

    // ¿Misión completa?
    if (this.completed.length === this.STEPS.length) {
      setTimeout(() => this._onMissionComplete(), 800);
    }
  },

  /** Se llama cuando los 5 pasos están completos */
  _onMissionComplete() {
    Desktop.showGuide(
      '🏆 ¡MISIÓN COMPLETADA! Has hecho un trabajo científico increíble. ' +
      '¡Ahora demuestra tus conocimientos en el DinoQuiz para desbloquear la ficha del Spinosaurio!',
      10000
    );

    // Abrir quiz automáticamente
    setTimeout(() => {
      Desktop.openWindow('quiz');
    }, 2500);
  },

  // ─── Panel visual ─────────────────────────────────

  _renderPanel() {
    const container = document.getElementById('mp-steps');
    if (!container) return;

    const allDone = this.completed.length === this.STEPS.length;

    container.innerHTML = this.STEPS.map((step, i) => {
      const done   = this.completed.includes(step.id);
      const active = !done && this.completed.length === i;
      const cls    = done ? 'done' : (active ? 'active' : '');
      const icon   = done ? '✓' : (active ? '→' : String(i + 1));

      return `
        <div class="mp-step ${cls}" id="mstep-${step.id}">
          <div class="step-dot">${icon}</div>
          <span>${step.label}</span>
        </div>
      `;
    }).join('');

    // Si misión completa, poner cabecera dorada
    const header = document.querySelector('.mp-header span');
    if (header && allDone) {
      header.textContent = '🏆 ¡MISIÓN COMPLETADA!';
    }
  },

  /** Pequeña animación de destello en el paso recién completado */
  _animateStep(stepId) {
    const el = document.getElementById('mstep-' + stepId);
    if (!el) return;
    el.style.transition = 'none';
    el.style.background = 'rgba(0,255,136,0.2)';
    setTimeout(() => {
      el.style.transition = 'background 1s ease';
      el.style.background = '';
    }, 50);
  },

  /** Colapsar/expandir el panel */
  togglePanel() {
    const steps  = document.getElementById('mp-steps');
    const btn    = document.querySelector('.mp-toggle');
    this.panelHidden = !this.panelHidden;
    steps.style.display = this.panelHidden ? 'none' : '';
    if (btn) btn.classList.toggle('up', !this.panelHidden);
  }
};
