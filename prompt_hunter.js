/**
 * DinoPC Explorer — prompt_hunter.js
 * Minijuego: elige la instrucción más precisa para que el robot complete la tarea.
 * Misión 14 — PteroDrone (misión final de la expansión AI & Robotics Lab)
 */

const PromptHunter = {

  CHALLENGES: [
    {
      id: 1,
      scenario: '🤖 El robot está en la posición (0,5) mirando al norte. Hay un fósil en (0,2). El almacén está en (0,0).',
      task:     'Escribe la secuencia correcta para recoger el fósil y entregarlo.',
      options: [
        { text: 'AVANZAR, AVANZAR, AVANZAR, RECOGER, AVANZAR, AVANZAR, SOLTAR',
          score: 100, feedback: '✅ ¡Perfecto! Secuencia exacta y completa.' },
        { text: 'AVANZAR muchas veces y luego RECOGER',
          score: 20,  feedback: '❌ Demasiado impreciso. Los robots necesitan instrucciones exactas.' },
        { text: 'AVANZAR×3, RECOGER, AVANZAR×2, SOLTAR',
          score: 90,  feedback: '✅ Muy bien. La notación ×N es equivalente a REPETIR.' },
        { text: 'Ir hacia el norte, coger cosa, llevar a caja',
          score: 5,   feedback: '❌ Los robots no entienden lenguaje natural vago.' }
      ],
      best: 0
    },
    {
      id: 2,
      scenario: '🤖 Tienes un robot que debe inspeccionar 4 casillas en fila. En cada casilla puede o no haber una roca.',
      task:     '¿Cuál es la instrucción más eficiente para avanzar y mirar las 4 casillas?',
      options: [
        { text: 'AVANZAR, AVANZAR, AVANZAR, AVANZAR',
          score: 70,  feedback: '✅ Correcto pero no óptimo — puedes usar REPETIR.' },
        { text: 'REPETIR 4 AVANZAR',
          score: 100, feedback: '✅ ¡Perfecto! REPETIR es más eficiente y claro.' },
        { text: 'REPETIR 3 AVANZAR',
          score: 20,  feedback: '❌ Solo inspecciona 3 casillas, te falta una.' },
        { text: 'AVANZAR hasta el final',
          score: 0,   feedback: '❌ "Hasta el final" no es una instrucción válida — sin límite definido.' }
      ],
      best: 1
    },
    {
      id: 3,
      scenario: '🤖 El robot encuentra distintos objetos al avanzar: puede ser un fósil 🦴 o una roca 🪨.',
      task:     '¿Cuál es la instrucción correcta para recoger SOLO los fósiles?',
      options: [
        { text: 'RECOGER todo lo que encuentre',
          score: 10,  feedback: '❌ Recogerá también rocas. Necesitas una condición.' },
        { text: 'SI hay_fosil → RECOGER',
          score: 100, feedback: '✅ ¡Exacto! La condición SI filtra correctamente.' },
        { text: 'SI hay_roca → RECOGER',
          score: 0,   feedback: '❌ ¡Al revés! Esto recogería las rocas, no los fósiles.' },
        { text: 'AVANZAR y luego decidir',
          score: 5,   feedback: '❌ "Decidir" no es una instrucción. Debe ser explícito.' }
      ],
      best: 1
    },
    {
      id: 4,
      scenario: '🐛 Un programa de robot tiene este error: REPETIR 2 AVANZAR cuando debería avanzar 5 casillas.',
      task:     '¿Cuál es la descripción más precisa del bug?',
      options: [
        { text: 'El robot no llega. Hay que arreglarlo.',
          score: 10,  feedback: '❌ Demasiado vago. No identifica el tipo de error.' },
        { text: 'El número del REPETIR es incorrecto: dice 2 pero debe ser 5.',
          score: 100, feedback: '✅ ¡Diagnóstico preciso! Indica exactamente dónde y qué está mal.' },
        { text: 'Falta un AVANZAR al final.',
          score: 30,  feedback: '⚠️ Parcialmente correcto pero no identifica el REPETIR como causa.' },
        { text: 'El programa está roto.',
          score: 0,   feedback: '❌ No aporta información útil para corregirlo.' }
      ],
      best: 1
    },
    {
      id: 5,
      scenario: '⚙️ Quieres crear una regla de automatización para enviar fósiles pesados (más de 5000 kg) al almacén especial.',
      task:     '¿Cuál es la regla correcta en el formato SI/ENTONCES?',
      options: [
        { text: 'SI fósil es grande → almacén especial',
          score: 20,  feedback: '❌ "Grande" es subjetivo. Necesitas un número concreto.' },
        { text: 'SI peso > 5000 → almacén_pesado',
          score: 100, feedback: '✅ ¡Perfecto! Condición numérica precisa con umbral definido.' },
        { text: 'SI peso = 5000 → almacén_pesado',
          score: 50,  feedback: '⚠️ Casi, pero = solo aplica a exactamente 5000, no a más de 5000.' },
        { text: 'Mover los pesados al especial',
          score: 5,   feedback: '❌ Sin formato SI/ENTONCES y sin valor numérico definido.' }
      ],
      best: 1
    }
  ],

  _current:   0,
  _answers:   [],
  _total:     0,
  _completed: false,

  buildHTML() {
    return `
    <div class="ph-wrap" id="ph-wrap">
      <div class="ph-header">
        <div class="ph-title">🎯 Prompt Hunter</div>
        <div class="ph-progress" id="ph-progress">1 / ${this.CHALLENGES.length}</div>
        <div class="ph-score-display" id="ph-score-display">Puntos: 0</div>
      </div>
      <div class="ph-challenge" id="ph-challenge"></div>
      <div class="feat-status" id="ph-status"></div>
      <div class="ph-final hidden" id="ph-final"></div>
    </div>`;
  },

  init() {
    this._current   = 0;
    this._answers   = [];
    this._total     = 0;
    this._completed = false;
    this._renderChallenge();
  },

  _renderChallenge() {
    const ch   = this.CHALLENGES[this._current];
    const el   = document.getElementById('ph-challenge');
    const prog = document.getElementById('ph-progress');
    if (prog) prog.textContent = (this._current + 1) + ' / ' + this.CHALLENGES.length;
    if (!el) return;

    el.innerHTML = `
      <div class="ph-scenario">${ch.scenario}</div>
      <div class="ph-task">❓ <strong>${ch.task}</strong></div>
      <div class="ph-options" id="ph-options">
        ${ch.options.map((opt, i) =>
          `<button class="ph-option" id="ph-opt-${i}" onclick="PromptHunter.answer(${i})">
             <span class="ph-opt-label">${String.fromCharCode(65 + i)}.</span>
             ${opt.text}
           </button>`
        ).join('')}
      </div>
      <div class="ph-feedback hidden" id="ph-feedback"></div>
      <button class="btn-primary ph-next hidden" id="ph-next" onclick="PromptHunter.next()">
        ${this._current + 1 < this.CHALLENGES.length ? 'Siguiente →' : 'Ver resultado →'}
      </button>`;
  },

  answer(idx) {
    const ch  = this.CHALLENGES[this._current];
    const opt = ch.options[idx];

    // Deshabilitar todas las opciones
    document.querySelectorAll('.ph-option').forEach((b, i) => {
      b.disabled = true;
      if (i === idx)      b.classList.add(opt.score >= 80 ? 'ph-correct' : 'ph-wrong');
      if (i === ch.best)  b.classList.add('ph-best');
    });

    this._total += opt.score;
    this._answers.push({ challenge: this._current, score: opt.score });

    // Mostrar feedback
    const fb = document.getElementById('ph-feedback');
    if (fb) {
      fb.innerHTML = `<div class="ph-fb-score ${opt.score >= 80 ? 'good' : 'bad'}">+${opt.score} pts</div>
                      <div class="ph-fb-text">${opt.feedback}</div>`;
      fb.classList.remove('hidden');
    }

    const next = document.getElementById('ph-next');
    if (next) next.classList.remove('hidden');

    const scoreEl = document.getElementById('ph-score-display');
    if (scoreEl) scoreEl.textContent = 'Puntos: ' + this._total;

    if (opt.score >= 80) AudioEngine.play('success');
    else                 AudioEngine.play('error');
  },

  next() {
    this._current++;
    if (this._current >= this.CHALLENGES.length) {
      this._showFinal();
    } else {
      this._renderChallenge();
    }
  },

  _showFinal() {
    this._completed = true;
    const maxScore  = this.CHALLENGES.length * 100;
    const pct       = Math.round((this._total / maxScore) * 100);
    const stars     = pct >= 85 ? '⭐⭐⭐' : pct >= 60 ? '⭐⭐' : '⭐';
    const title     = pct >= 85 ? '¡MAESTRO DE INSTRUCCIONES!'
                    : pct >= 60 ? '¡BUEN TRABAJO!'
                    : '¡SIGUE PRACTICANDO!';

    const ch = document.getElementById('ph-challenge');
    const fi = document.getElementById('ph-final');
    if (ch) ch.classList.add('hidden');
    if (fi) {
      fi.classList.remove('hidden');
      fi.innerHTML = `
        <div class="ph-final-stars">${stars}</div>
        <div class="ph-final-title">${title}</div>
        <div class="ph-final-score">${this._total} / ${maxScore} puntos (${pct}%)</div>
        <p class="ph-final-msg">La precisión en las instrucciones es la base de la programación. ¡Lo has demostrado!</p>
        <button class="btn-primary" onclick="PromptHunter.init()">🔄 Jugar de nuevo</button>`;
    }

    AudioEngine.play('mission-complete');

    if (typeof Mission !== 'undefined') {
      Mission.onAction('complete-hunt', { score: this._total, pct });
    }
    if (typeof Achievements !== 'undefined') {
      Achievements.check('prompt-hunter-score', pct);
    }
    if (typeof DinoLog !== 'undefined') {
      DinoLog.track('step');
    }
    if (typeof Desktop !== 'undefined') {
      Desktop.showGuide('🎯 ¡Prompt Hunter completado! ' + pct + '% de precisión. ' + stars, 6000);
    }
  }
};
