/**
 * DinoPC Explorer — quiz.js
 * DinoQuiz con bancos de preguntas por dinosaurio.
 * Quiz.forDino se establece antes de abrir la ventana.
 */

const Quiz = {

  // ─── Bancos de preguntas por dinosaurio ──────────

  BANKS: {

    spinosaurus: [
      { q: '¿Qué dinosaurio era principalmente piscívoro (comía peces)?',
        opts: ['Tiranosaurio Rex','Spinosaurio','Triceratops','Diplodocus'], ans: 1,
        fact: 'El Spinosaurio tenía dientes cónicos perfectos para atrapar peces, y sus fosas nasales retrasadas le permitían meter el hocico en el agua.' },
      { q: '¿En qué período vivió el Spinosaurio?',
        opts: ['Triásico tardío','Jurásico temprano','Cretácico temprano-medio','Paleógeno'], ans: 2,
        fact: 'El Spinosaurio vivió hace unos 95-100 millones de años en lo que hoy es el norte de África.' },
      { q: '¿Cuál es la longitud estimada del Spinosaurio?',
        opts: ['8-10 metros','12-13 metros','14-18 metros','Más de 25 metros'], ans: 2,
        fact: 'Con hasta 18 metros, el Spinosaurio superaba al T-Rex en longitud. Tenía proporciones semiacuáticas.' },
      { q: '¿Para qué servía la enorme vela dorsal del Spinosaurio?',
        opts: ['Solo para correr rápido','Regulación térmica y comunicación visual','Volar','Almacenar agua'], ans: 1,
        fact: 'La vela pudo servir para absorber calor, disipar calor o atraer pareja. Algunos creen que era una joroba muscular.' },
      { q: '¿Qué caracterizaba los dientes del Spinosaurio?',
        opts: ['Planos para masticar plantas','Cónicos y rectos, como los del cocodrilo','No tenía dientes','En forma de hoz'], ans: 1,
        fact: 'Sus dientes cónicos son casi idénticos a los del cocodrilo actual, perfectos para sujetar peces resbaladizos.' },
      { q: '¿En qué continente se encontraron sus principales fósiles?',
        opts: ['América del Sur','Europa','Asia','África (norte)'], ans: 3,
        fact: 'Los mejores fósiles del Spinosaurio aparecieron en Marruecos y Egipto, en lo que era un gran delta fluvial tropical.' },
      { q: '¿Cuánto podía pesar el Spinosaurio?',
        opts: ['1-2 toneladas','3-5 toneladas','7-14 toneladas','Más de 30 toneladas'], ans: 2,
        fact: 'Las estimaciones modernas sitúan su peso entre 7 y 14 toneladas, dependiendo del individuo.' }
    ],

    trex: [
      { q: '¿En qué período vivió el Tiranosaurio Rex?',
        opts: ['Jurásico tardío','Triásico','Cretácico tardío','Paleógeno'], ans: 2,
        fact: 'El T-Rex vivió entre 68 y 66 millones de años atrás, siendo uno de los últimos grandes dinosaurios antes del asteroide.' },
      { q: '¿Qué característica tenía la mordida del T-Rex?',
        opts: ['Similar a un cocodrilo','La más poderosa de todos los animales conocidos','Débil, solo para carne blanda','Igual que el Spinosaurio'], ans: 1,
        fact: 'La mordida del T-Rex generaba hasta 57.000 Newtons de fuerza, la mayor registrada en la historia animal.' },
      { q: '¿Cuánto medía el T-Rex de longitud?',
        opts: ['4-5 metros','8-9 metros','12-13 metros','20 metros'], ans: 2,
        fact: 'El T-Rex alcanzaba 12-13 metros de largo y unos 4 metros de altura a la cadera.' },
      { q: '¿Qué caracterizaba los brazos del T-Rex?',
        opts: ['Eran muy largos y fuertes','Cortos pero con 2 dedos muy poderosos','No tenía brazos','Tenía alas rudimentarias'], ans: 1,
        fact: 'Sus brazos eran cortos pero musculosos, capaces de levantar hasta 200 kg con cada uno.' },
      { q: '¿Cómo detectaba sus presas el T-Rex?',
        opts: ['Solo con la vista','Solo con el olfato','Vista en 3D, olfato y oído excepcionales','Mediante vibraciones'], ans: 2,
        fact: 'El T-Rex tenía ojos frontales para visión 3D, una región olfativa enorme y oído muy desarrollado.' },
      { q: '¿Cuánto pesaba un T-Rex adulto?',
        opts: ['2-3 toneladas','4-5 toneladas','8-14 toneladas','20 toneladas'], ans: 2,
        fact: 'Un T-Rex adulto pesaba entre 8 y 14 toneladas, siendo uno de los bípedos más pesados de la historia.' },
      { q: '¿Cuántos dedos tenía el T-Rex en cada pie?',
        opts: ['2 dedos','3 dedos funcionales','5 dedos','Ninguno'], ans: 1,
        fact: 'El T-Rex tenía 3 dedos funcionales en cada pie más uno vestigial, lo que le daba gran estabilidad al correr.' }
    ],

    triceratops: [
      { q: '¿Cuántos cuernos tenía el Triceratops?',
        opts: ['1','2','3','4'], ans: 2,
        fact: 'Tenía 3 cuernos: dos largos sobre los ojos (hasta 1 metro) y uno corto sobre el hocico.' },
      { q: '¿Para qué usaba el Triceratops su gran collarín óseo?',
        opts: ['Para nadar más rápido','Solo decoración','Protección del cuello y comunicación visual','Almacenar comida'], ans: 2,
        fact: 'El collarín reforzado con hueso protegía el cuello y servía para reconocerse entre la especie.' },
      { q: '¿Qué comía el Triceratops?',
        opts: ['Peces','Insectos','Plantas y vegetación','Otros dinosaurios'], ans: 2,
        fact: 'Era herbívoro y usaba su pico córneo para arrancar plantas duras, helechos y cicadas del suelo.' },
      { q: '¿Qué dinosaurio era el principal depredador del Triceratops?',
        opts: ['Velociraptor','Spinosaurio','Tiranosaurio Rex','Diplodocus'], ans: 2,
        fact: 'Se han encontrado fósiles de Triceratops con marcas de mordidas del T-Rex, evidencia de sus enfrentamientos.' },
      { q: '¿Cuánto pesaba un Triceratops adulto?',
        opts: ['500 kg','2 toneladas','6-12 toneladas','20 toneladas'], ans: 2,
        fact: 'Pesaba entre 6 y 12 toneladas, siendo uno de los herbívoros más masivos del Cretácico tardío.' },
      { q: '¿Cuándo vivió el Triceratops?',
        opts: ['Jurásico medio','Triásico tardío','Cretácico tardío (68-66 Ma)','Paleógeno'], ans: 2,
        fact: 'El Triceratops vivió en el mismo período que el T-Rex, siendo contemporáneos en el Cretácico tardío.' },
      { q: '¿Qué significa "Triceratops"?',
        opts: ['Tres cuernos en la cara','Cara con tres cuernos','Escudo de tres puntas','Tres huesos grandes'], ans: 1,
        fact: '"Triceratops" viene del griego: tri (tres) + kéras (cuerno) + ops (cara). ¡El nombre lo dice todo!' }
    ]
  },

  // ─── Estado de partida ────────────────────────────

  forDino:   'spinosaurus',
  questions: [],
  current:   0,
  score:     0,
  answered:  false,

  // ─── HTML base ────────────────────────────────────

  buildHTML() {
    return '<div class="quiz-wrap" id="quiz-wrap"></div>';
  },

  init() {
    var bank = this.BANKS[this.forDino] || this.BANKS.spinosaurus;
    this.questions = bank.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 3);
    this.current   = 0;
    this.score     = 0;
    this.answered  = false;
    this._renderQuestion();
  },

  // ─── Renderizado ──────────────────────────────────

  _renderQuestion() {
    var wrap = document.getElementById('quiz-wrap');
    if (!wrap) return;

    var q     = this.questions[this.current];
    var total = this.questions.length;

    var dinoNames = { spinosaurus: 'Spinosaurio', trex: 'T-Rex', triceratops: 'Triceratops' };
    var dinoLabel = dinoNames[this.forDino] || 'Dinosaurio';

    wrap.innerHTML =
      '<div class="quiz-header">' +
      '<span class="quiz-progress">Pregunta ' + (this.current + 1) + ' de ' + total + ' · ' + dinoLabel + '</span>' +
      '<span class="quiz-score">⭐ ' + this.score + ' pts</span>' +
      '</div>' +
      '<div class="quiz-q">' + q.q + '</div>' +
      '<div class="quiz-options">' +
      q.opts.map(function(opt, i) {
        return '<button class="quiz-opt" id="qopt-' + i + '" onclick="Quiz.answer(' + i + ')">' +
               '<span style="color:var(--amber);margin-right:8px">' + ['A','B','C','D'][i] + '.</span>' + opt +
               '</button>';
      }).join('') +
      '</div>' +
      '<div id="quiz-feedback"></div>' +
      '<button class="quiz-next hidden" id="quiz-next" onclick="Quiz.next()">' +
      (this.current + 1 < total ? 'Siguiente →' : 'Ver resultado →') +
      '</button>';

    this.answered = false;
  },

  answer(idx) {
    if (this.answered) return;
    this.answered = true;

    var q  = this.questions[this.current];
    var ok = idx === q.ans;
    if (ok) this.score += 10;

    q.opts.forEach(function(_, i) {
      var btn = document.getElementById('qopt-' + i);
      if (!btn) return;
      btn.disabled = true;
      if (i === q.ans)        btn.classList.add('correct');
      if (i === idx && !ok)   btn.classList.add('wrong');
    });

    var fb = document.getElementById('quiz-feedback');
    if (fb) {
      fb.className = 'quiz-feedback ' + (ok ? 'correct-fb' : 'wrong-fb');
      fb.innerHTML = (ok ? '✅ <b>¡Correcto!</b> ' : '❌ <b>Incorrecto.</b> Respuesta: <b>' + q.opts[q.ans] + '</b>. ') +
                     '<br>💡 ' + q.fact;
    }

    var nextBtn = document.getElementById('quiz-next');
    if (nextBtn) nextBtn.classList.remove('hidden');
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
    var wrap  = document.getElementById('quiz-wrap');
    if (!wrap) return;

    var total   = this.questions.length;
    var pct     = Math.round((this.score / (total * 10)) * 100);
    var stars   = pct >= 80 ? '⭐⭐⭐' : pct >= 50 ? '⭐⭐' : '⭐';
    var title   = pct >= 80 ? '¡PALEONTÓLOGO EXPERTO!' : pct >= 50 ? '¡BUEN TRABAJO!' : '¡SIGUE PRACTICANDO!';
    var dinoNames = { spinosaurus: 'Spinosaurio', trex: 'T-Rex', triceratops: 'Triceratops' };
    var dinoLabel = dinoNames[this.forDino] || 'dinosaurio';

    var msg = pct >= 50
      ? '¡Mereces la ficha del ' + dinoLabel + '! ¡A desbloquear!'
      : 'Estudia más sobre el ' + dinoLabel + ' e inténtalo de nuevo.';

    var actionBtn = pct >= 50
      ? '<button class="btn-primary" onclick="Quiz._unlock()" style="margin-top:8px">🏆 ¡Desbloquear ficha del ' + dinoLabel + '!</button>'
      : '<button class="quiz-next" onclick="Quiz.init()" style="margin-top:8px">🔄 Intentar de nuevo</button>';

    DinoLog.track('quiz', { correct: Math.round(this.score / 10), total: total });

    wrap.innerHTML =
      '<div class="quiz-result">' +
      '<div class="qr-stars">' + stars + '</div>' +
      '<div class="qr-title">' + title + '</div>' +
      '<div class="qr-score">Puntuación: ' + this.score + ' / ' + (total * 10) + '</div>' +
      '<p class="qr-msg">' + msg + '</p>' +
      actionBtn +
      '</div>';
  },

  _unlock() {
    App.unlockDino(this.forDino);
  }
};
