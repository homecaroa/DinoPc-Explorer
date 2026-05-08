/**
 * DinoPC Explorer — quiz.js
 * DinoQuiz: 10 preguntas científicas sobre dinosaurios,
 * se seleccionan 3 aleatoriamente por partida.
 * Completar el quiz desbloquea la ficha del Spinosaurio.
 */

const Quiz = {

  // ─── Banco de preguntas ───────────────────────────
  BANK: [
    {
      q:    '¿Qué dinosaurio era principalmente piscívoro (comía peces)?',
      opts: ['Tiranosaurio Rex', 'Spinosaurio', 'Triceratops', 'Diplodocus'],
      ans:  1,
      fact: 'El Spinosaurio tenía dientes cónicos perfectos para atrapar peces, y sus fosas nasales estaban retrasadas para poder meter el hocico en el agua.'
    },
    {
      q:    '¿En qué período vivió el Spinosaurio?',
      opts: ['Triásico tardío', 'Jurásico temprano', 'Cretácico temprano-medio', 'Paleógeno'],
      ans:  2,
      fact: 'El Spinosaurio vivió en el Cretácico hace unos 95-100 millones de años, en lo que hoy es el norte de África.'
    },
    {
      q:    '¿Cuál es la longitud estimada del Spinosaurio, el mayor carnívoro terrestre conocido?',
      opts: ['8–10 metros', '12–13 metros', '14–18 metros', 'Más de 25 metros'],
      ans:  2,
      fact: 'Con hasta 18 metros, el Spinosaurio superaba en longitud al Tiranosaurio Rex, aunque parte de esa longitud era el cuello y la cola.'
    },
    {
      q:    '¿Para qué servía la enorme vela dorsal del Spinosaurio?',
      opts: ['Solo para correr más rápido', 'Regulación térmica y comunicación visual', 'Volar largas distancias', 'Almacenar agua como un camello'],
      ans:  1,
      fact: 'Los científicos creen que la vela pudo servir para absorber calor solar, disipar calor o atraer pareja. Algunos proponen que era más bien una joroba muscular.'
    },
    {
      q:    '¿Qué dinosaurio vivió más tarde en la historia de la Tierra?',
      opts: ['Diplodocus', 'Braquiosaurio', 'Spinosaurio', 'Tiranosaurio Rex'],
      ans:  3,
      fact: 'El T-Rex vivió en el Cretácico tardío (~68-66 Ma), más reciente que el Spinosaurio (~95 Ma), el Diplodocus y el Braquiosaurio del Jurásico (~150 Ma).'
    },
    {
      q:    '¿Cuánto podía pesar el Spinosaurio adulto según estimaciones modernas?',
      opts: ['1–2 toneladas', '3–5 toneladas', '7–14 toneladas', 'Más de 30 toneladas'],
      ans:  2,
      fact: 'Las estimaciones actuales sitúan el peso del Spinosaurio entre 7 y 14 toneladas, dependiendo del individuo y el método de cálculo.'
    },
    {
      q:    '¿Qué dinosaurio era el más grande de todos en longitud total?',
      opts: ['Tiranosaurio Rex', 'Argentinosaurio', 'Spinosaurio', 'Estegosaurio'],
      ans:  1,
      fact: 'El Argentinosaurio, un titanosaurio sudamericano, alcanzó unos 30–40 metros de longitud, convirtiéndolo probablemente en el dinosaurio más grande conocido.'
    },
    {
      q:    '¿Qué caracterizaba a los dientes del Spinosaurio frente al T-Rex?',
      opts: ['Eran planos y anchos para masticar plantas', 'Eran cónicos y rectos, ideales para peces', 'No tenía dientes, usaba pico', 'Eran en forma de hoz como los del Velociraptor'],
      ans:  1,
      fact: 'Los dientes cónicos del Spinosaurio son similares a los de los cocodrilos actuales, perfectos para sujetar peces resbaladizos.'
    },
    {
      q:    '¿En qué continente vivió principalmente el Spinosaurio?',
      opts: ['América del Sur', 'Europa', 'Asia', 'África (norte)'],
      ans:  3,
      fact: 'Los fósiles del Spinosaurio se han encontrado principalmente en Marruecos y Egipto. En la época del Cretácico esa región era un gran delta fluvial tropical.'
    },
    {
      q:    '¿Cuál de estos dinosaurios era herbívoro?',
      opts: ['Velociraptor', 'Spinosaurio', 'Triceratops', 'Allosaurio'],
      ans:  2,
      fact: 'El Triceratops era un ceratópsido herbívoro del Cretácico tardío. Usaba su pico córneo para arrancar plantas duras. Los demás de la lista eran carnívoros.'
    }
  ],

  // ─── Estado de la partida ─────────────────────────
  questions: [],  // 3 preguntas seleccionadas
  current:   0,
  score:     0,
  answered:  false,

  // ─── HTML base ────────────────────────────────────

  buildHTML() {
    return `<div class="quiz-wrap" id="quiz-wrap"></div>`;
  },

  init() {
    // Mezclar y elegir 3 preguntas
    const shuffled  = [...this.BANK].sort(() => Math.random() - 0.5);
    this.questions  = shuffled.slice(0, 3);
    this.current    = 0;
    this.score      = 0;
    this.answered   = false;
    this._renderQuestion();
  },

  // ─── Renderizado ──────────────────────────────────

  _renderQuestion() {
    const wrap = document.getElementById('quiz-wrap');
    if (!wrap) return;

    const q    = this.questions[this.current];
    const total = this.questions.length;

    wrap.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-progress">Pregunta ${this.current + 1} de ${total}</span>
        <span class="quiz-score">⭐ ${this.score} pts</span>
      </div>
      <div class="quiz-q">${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((opt, i) => `
          <button class="quiz-opt" id="qopt-${i}"
                  onclick="Quiz.answer(${i})">
            <span style="color:var(--amber);margin-right:8px">${['A','B','C','D'][i]}.</span>${opt}
          </button>
        `).join('')}
      </div>
      <div id="quiz-feedback"></div>
      <button class="quiz-next hidden" id="quiz-next" onclick="Quiz.next()">
        ${this.current + 1 < total ? 'Siguiente pregunta →' : 'Ver resultado →'}
      </button>
    `;

    this.answered = false;
  },

  answer(idx) {
    if (this.answered) return;
    this.answered = true;

    const q   = this.questions[this.current];
    const ok  = idx === q.ans;
    if (ok) this.score += 10;

    // Colorear opciones
    q.opts.forEach((_, i) => {
      const btn = document.getElementById('qopt-' + i);
      if (!btn) return;
      btn.disabled = true;
      if (i === q.ans)  btn.classList.add('correct');
      if (i === idx && !ok) btn.classList.add('wrong');
    });

    // Feedback
    const fb = document.getElementById('quiz-feedback');
    if (fb) {
      fb.className  = 'quiz-feedback ' + (ok ? 'correct-fb' : 'wrong-fb');
      fb.innerHTML  =
        (ok ? '✅ <b>¡Correcto!</b> ' : '❌ <b>Incorrecto.</b> La respuesta era: <b>' + q.opts[q.ans] + '</b>. ') +
        '<br>💡 ' + q.fact;
    }

    // Mostrar botón siguiente
    document.getElementById('quiz-next')?.classList.remove('hidden');
  },

  next() {
    this.current++;
    if (this.current < this.questions.length) {
      this._renderQuestion();
    } else {
      this._showResult();
    }
  },

  // ─── Resultado final ──────────────────────────────

  _showResult() {
    const wrap  = document.getElementById('quiz-wrap');
    if (!wrap) return;

    const total   = this.questions.length;
    const pct     = Math.round((this.score / (total * 10)) * 100);
    const stars   = pct >= 80 ? '⭐⭐⭐' : pct >= 50 ? '⭐⭐' : '⭐';
    const title   = pct >= 80 ? '¡PALEONTÓLOGO EXPERTO!' : pct >= 50 ? '¡BUEN TRABAJO!' : '¡SIGUE PRACTICANDO!';
    const msg     = pct >= 50
      ? '¡Has demostrado ser un verdadero experto en dinosaurios! El Spinosaurio te da la bienvenida. 🦕'
      : 'Estudiaste bien, pero hay más por aprender. ¡Inténtalo de nuevo para mejorar tu puntuación!';

    wrap.innerHTML = `
      <div class="quiz-result">
        <div class="qr-stars">${stars}</div>
        <div class="qr-title">${title}</div>
        <div class="qr-score">Puntuación: ${this.score} / ${total * 10}</div>
        <p class="qr-msg">${msg}</p>
        ${pct >= 50
          ? `<button class="btn-primary" onclick="Quiz._unlock()" style="margin-top:8px">
               🏆 ¡Desbloquear ficha del Spinosaurio!
             </button>`
          : `<button class="quiz-next" onclick="Quiz.init()" style="margin-top:8px">
               🔄 Intentar de nuevo
             </button>`
        }
      </div>
    `;
  },

  _unlock() {
    App.unlockDino('spinosaurus');
  }
};
