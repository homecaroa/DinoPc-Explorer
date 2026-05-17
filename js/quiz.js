/**
 * DinoPC Explorer — quiz.js v2
 * Bancos de preguntas: 2 type:'math' + 1 type:'concept' por dino.
 * Las preguntas matemáticas usan contextos de archivos/carpetas.
 */

const Quiz = {

  // ─── Bancos de preguntas ──────────────────────────

  BANKS: {

    spinosaurus: [
      { type:'math', operation:'multiplication',
        q:'Spinosaurus creó 3 carpetas. En cada carpeta guardó 4 archivos. ¿Cuántos archivos tiene en total?',
        opts:['7','12','8','15'], ans:1, hint:'3 × 4 = ?',
        fact:'¡Correcto! La multiplicación te ahorra contar uno a uno: 3 grupos de 4 = 12 archivos.' },
      { type:'concept',
        q:'¿Para qué sirve una carpeta en un sistema de archivos?',
        opts:['Organizar y agrupar archivos','Escribir texto directamente','Ejecutar programas','Borrar archivos automáticamente'], ans:0,
        fact:'Las carpetas son contenedores que agrupan archivos relacionados, como un archivador físico.' },
      { type:'math', operation:'subtraction',
        q:'Tenías 45 KB de espacio libre. Guardaste un archivo de 17 KB. ¿Cuántos KB te quedan?',
        opts:['62 KB','28 KB','25 KB','30 KB'], ans:1, hint:'45 − 17 = ?',
        fact:'¡Exacto! 45 − 17 = 28 KB. La resta te indica cuánto espacio libre queda en tu carpeta.' }
    ],

    trex: [
      { type:'concept',
        q:'¿Qué significa "guardar" un archivo en informática?',
        opts:['Escribir los datos en el almacenamiento permanente','Borrar el archivo','Copiar al portapapeles','Enviarlo por internet'], ans:0,
        fact:'Guardar escribe los datos en el disco. Sin guardar, los cambios desaparecen al cerrar el programa.' },
      { type:'math', operation:'multiplication',
        q:'Hay 6 carpetas. Cada una contiene 8 archivos. ¿Cuántos archivos en total?',
        opts:['14','48','42','36'], ans:1, hint:'6 × 8 = ?',
        fact:'¡Perfecto! 6 × 8 = 48. La multiplicación es ideal para calcular totales cuando los grupos son iguales.' },
      { type:'math', operation:'division',
        q:'Moviste 24 archivos en 4 minutos. ¿Cuántos archivos por minuto?',
        opts:['6','8','5','10'], ans:0, hint:'24 ÷ 4 = ?',
        fact:'¡Correcto! 24 ÷ 4 = 6 archivos/minuto. La división calcula promedios y repartos iguales.' }
    ],

    triceratops: [
      { type:'math', operation:'mixed',
        q:'En 3 carpetas guardaste 5 archivos cada una. Luego moviste 2 archivos a otra carpeta. ¿Cuántos archivos quedan en las 3 carpetas originales?',
        opts:['13','15','12','18'], ans:0, hint:'(3 × 5) − 2 = ?',
        fact:'¡Bien! 3 × 5 = 15, luego 15 − 2 = 13. Mezclar operaciones es el primer paso hacia las fórmulas.' },
      { type:'concept',
        q:'¿Qué enseña el Triceratops sobre la organización de archivos?',
        opts:['Organizar por categorías protege tu información','Los archivos no necesitan orden','Más carpetas = más lento','Solo guardar los recientes'], ans:0,
        fact:'El Triceratops usa sus tres cuernos para defenderse, igual que 3 categorías bien organizadas protegen tus datos.' },
      { type:'math', operation:'addition',
        q:'Spinosaurus guardó 12 archivos y T-Rex guardó 15. ¿Cuántos archivos en total?',
        opts:['27','25','30','28'], ans:0, hint:'12 + 15 = ?',
        fact:'¡Exacto! 12 + 15 = 27. La suma te da el total cuando combinas colecciones.' }
    ],

    velociraptor: [
      { type:'math', operation:'division',
        q:'El equipo descargó 120 archivos en 4 sesiones iguales. ¿Cuántos archivos por sesión?',
        opts:['25','30','35','40'], ans:1, hint:'120 ÷ 4 = ?',
        fact:'¡Perfecto! 120 ÷ 4 = 30. Dividir en partes iguales ayuda a planificar el trabajo en equipo.' },
      { type:'concept',
        q:'¿Qué significa trabajar con archivos en equipo?',
        opts:['Varios usuarios comparten y modifican archivos coordinadamente','Es más lento que hacerlo solo','Se pierden los datos','No hay ventajas'], ans:0,
        fact:'El trabajo colaborativo con archivos permite que varias personas contribuyan al mismo proyecto, como un equipo de Velociraptors cazando juntos.' },
      { type:'math', operation:'multiplication',
        q:'Velociraptor abrió 5 ventanas. En cada ventana guardó 3 archivos. ¿Total de archivos?',
        opts:['8','15','12','18'], ans:1, hint:'5 × 3 = ?',
        fact:'¡Correcto! 5 × 3 = 15. Calcular rápido te hace eficiente, ¡como un Velociraptor!' }
    ],

    ankylosaurus: [
      { type:'math', operation:'subtraction',
        q:'Tienes 500 KB. Usaste 180 KB en documentos y 120 KB en imágenes. ¿Espacio libre restante?',
        opts:['300 KB','200 KB','180 KB','220 KB'], ans:1, hint:'500 − 180 − 120 = ?',
        fact:'¡Exacto! 500 − 180 − 120 = 200 KB. Controlar el espacio evita que te quedes sin almacenamiento.' },
      { type:'concept',
        q:'¿Por qué es importante hacer copias de seguridad de tus archivos?',
        opts:['Protegen tus datos si se dañan o eliminan accidentalmente','Ocupan menos espacio','Son más rápidos de abrir','Solo los profesionales las necesitan'], ans:0,
        fact:'El Ankylosaurus tiene armadura para protegerse. Las copias de seguridad son la armadura de tus datos.' },
      { type:'math', operation:'multiplication',
        q:'Hiciste 3 copias de seguridad. Cada una ocupa 50 KB. ¿Cuánto espacio total usan?',
        opts:['100 KB','150 KB','200 KB','120 KB'], ans:1, hint:'3 × 50 = ?',
        fact:'¡Perfecto! 3 × 50 = 150 KB. Saber cuánto espacio necesitas antes de guardar es fundamental.' }
    ],

    stegosaurus: [
      { type:'concept',
        q:'¿Qué es un virus informático?',
        opts:['Software dañino que infecta y copia archivos','Un archivo de texto dañado','Una carpeta bloqueada','Un tipo de conexión de red'], ans:0,
        fact:'Un virus informático se copia a sí mismo y puede dañar archivos o el sistema. ¡El Estegosaurio con sus placas protectoras nos protege!' },
      { type:'math', operation:'subtraction',
        q:'Tienes 10 archivos. El antivirus detecta que 3 están infectados. ¿Cuántos son seguros?',
        opts:['5','7','8','6'], ans:1, hint:'10 − 3 = ?',
        fact:'¡Exacto! 10 − 3 = 7 archivos seguros. El antivirus elimina las amenazas y protege el resto de tu sistema.' },
      { type:'concept',
        q:'¿Qué hace la "cuarentena" en un programa antivirus?',
        opts:['Aísla el archivo sospechoso sin eliminarlo','Lo borra permanentemente','Lo copia a otro equipo','No hace nada'], ans:0,
        fact:'La cuarentena aisla el archivo sospechoso para que no infecte otros. Es como un hospital para archivos enfermos: separados pero no borrados.' }
    ],

    parasaurolophus: [
      { type:'concept',
        q:'¿Qué significa comprimir un archivo?',
        opts:['Reducir su tamaño sin perder datos importantes','Eliminar partes del archivo','Crear varias copias del archivo','Moverlo a otra carpeta'], ans:0,
        fact:'La compresión usa algoritmos matemáticos para almacenar los mismos datos ocupando menos espacio. ¡Parasaurolofus optimiza todo!' },
      { type:'math', operation:'division',
        q:'Un archivo ocupa 200 KB. Después de comprimirlo ocupa 50 KB. ¿Cuál es el ratio de compresión?',
        opts:['2:1','3:1','4:1','5:1'], ans:2, hint:'200 ÷ 50 = ?',
        fact:'¡Correcto! 200 ÷ 50 = 4. Un ratio 4:1 significa que el archivo comprimido es 4 veces más pequeño. ¡Parasaurolofus es eficientísimo!' },
      { type:'concept',
        q:'¿Qué extensión tienen normalmente los archivos comprimidos?',
        opts:['.zip o .rar','.txt o .doc','.png o .jpg','.exe o .bat'], ans:0,
        fact:'.zip es el formato de compresión más usado en el mundo. .rar es otra alternativa. Ambos reducen el tamaño sin perder datos.' }
    ],

    carnotaurus: [
      { type:'math', operation:'multiplication',
        q:'Carnotaurus organizó 5 carpetas con 6 archivos cada una. ¿Cuántos archivos en total?',
        opts:['11','30','25','24'], ans:1, hint:'5 × 6 = ?',
        fact:'¡Exacto! 5 × 6 = 30. Un Carnotaurus organizado es un sistema de archivos eficiente.' },
      { type:'concept',
        q:'¿Qué significa "copiar" un archivo (a diferencia de "mover")?',
        opts:['El original permanece y se crea una copia en el destino','El archivo desaparece del origen','Se crea un acceso directo','Se comprime el archivo'], ans:0,
        fact:'Copiar = el original queda donde está + aparece una copia. Mover = el original desaparece y aparece en otro lugar.' },
      { type:'math', operation:'division',
        q:'Tienes 100 KB de espacio. Cada archivo pesa 35 KB. ¿Cuántos archivos completos caben?',
        opts:['2','3','4','1'], ans:0, hint:'100 ÷ 35 = ? (solo enteros)',
        fact:'¡Correcto! 100 ÷ 35 = 2 archivos completos (sobran 30 KB). La división con resto es útil para calcular capacidad.' }
    ],

    brachiosaurus: [
      { type:'math', operation:'addition',
        q:'Archivos guardados por cada dino: Spino 12, T-Rex 15, Tricera 9, Veloci 18, Ankylo 11. ¿Total?',
        opts:['60','65','70','55'], ans:1, hint:'12+15+9+18+11 = ?',
        fact:'¡Perfecto! 12+15+9+18+11 = 65. Sumar muchos valores es el fundamento de las estadísticas en informática.' },
      { type:'concept',
        q:'¿Qué significa "escalar" un sistema de archivos?',
        opts:['Aumentar su capacidad para manejar más datos sin perder rendimiento','Hacerlo más pequeño','Borrar los archivos viejos','Cambiar su nombre'], ans:0,
        fact:'Como el Braquiosaurio, ¡el más grande! "Escalar" en informática = crecer sin romperse.' },
      { type:'math', operation:'multiplication',
        q:'Tienes 6 carpetas principales. Cada una tiene 10 subcarpetas. ¿Total de subcarpetas?',
        opts:['16','60','50','70'], ans:1, hint:'6 × 10 = ?',
        fact:'¡Exacto! 6 × 10 = 60. Una jerarquía de carpetas bien organizada hace los sistemas escalables.' }
    ],

    // ── BANCOS AVANZADOS ───────────────────────────────

    pteranodon: [
      { type:'math', operation:'division',
        q:'Envías un archivo de 150 KB a 50 KB/s. ¿Cuántos segundos tarda la transferencia?',
        opts:['2 seg','3 seg','4 seg','5 seg'], ans:1, hint:'150 ÷ 50 = ?',
        fact:'¡Correcto! 150 ÷ 50 = 3 segundos. La velocidad de red se mide en KB/s o MB/s para calcular tiempos de transferencia.' },
      { type:'concept',
        q:'¿Qué permite hacer una red de ordenadores?',
        opts:['Compartir archivos e información entre máquinas','Solo crear carpetas','Solo ver imágenes','Nada que no puedas hacer solo'], ans:0,
        fact:'Una red conecta ordenadores para compartir recursos. ¡Como el Pteranodón volando mensajes entre dinosaurios!' },
      { type:'concept',
        q:'¿Qué es un protocolo de red?',
        opts:['Reglas que permiten la comunicación entre dispositivos','Un tipo de archivo especial','Un virus informático','Una carpeta de red'], ans:0,
        fact:'Los protocolos son las "reglas del idioma" de la red. Sin ellos, los ordenadores no podrían entenderse.' }
    ],

    iguanodon: [
      { type:'concept',
        q:'¿Qué es la encriptación de datos?',
        opts:['Convertir información en un código secreto ilegible sin clave','Crear una copia de seguridad','Comprimir un archivo','Mover archivos a una carpeta'], ans:0,
        fact:'La encriptación convierte texto normal en código secreto. Solo quien tiene la "llave" puede leerlo.' },
      { type:'math', operation:'division',
        q:'Tienes 5 archivos: 3 privados y 2 públicos. ¿Qué porcentaje son privados?',
        opts:['40%','60%','50%','80%'], ans:1, hint:'(3 ÷ 5) × 100 = ?',
        fact:'¡Exacto! (3/5) × 100 = 60%. Calcular porcentajes ayuda a gestionar permisos y políticas de seguridad.' },
      { type:'concept',
        q:'¿Qué significa "R W X" en los permisos de un archivo?',
        opts:['Lectura, Escritura, Ejecución','Red, Wifi, Extra','Rápido, Wip, Xifrex','Nada especial'], ans:0,
        fact:'R = Read (leer), W = Write (escribir), X = eXecute (ejecutar). Son los tres permisos básicos de cualquier sistema de archivos.' }
    ]

  }, // fin BANKS

  // ─── Estado de partida ─────────────────────────────

  forDino:       'spinosaurus',
  questions:     [],
  current:       0,
  score:         0,
  answered:      false,
  quizStartTime: 0,
  correctStreak: 0,
  mathCorrect:   0,
  mathTotal:     0,

  get currentQuiz() { return this.questions; }, // alias para compatibilidad

  // ─── HTML base ────────────────────────────────────

  buildHTML() {
    return '<div class="quiz-wrap" id="quiz-wrap"></div>';
  },

  init() {
    var bank = this.BANKS[this.forDino] || this.BANKS.spinosaurus;
    // Seleccionar todas las preguntas del banco (ya son 3)
    this.questions     = bank.slice().sort(function() { return Math.random() - 0.5; });
    this.current       = 0;
    this.score         = 0;
    this.answered      = false;
    this.quizStartTime = Date.now();
    this.correctStreak = 0;
    this.mathCorrect   = 0;
    this.mathTotal     = 0;
    this._renderQuestion();
  },

  // ─── Cálculo de puntuación matemática ─────────────

  getMathScore() {
    return {
      correct:    this.mathCorrect,
      total:      this.mathTotal,
      percentage: this.mathTotal > 0
        ? ((this.mathCorrect / this.mathTotal) * 100).toFixed(1)
        : '0.0'
    };
  },

  // ─── Renderizado de pregunta ──────────────────────

  _renderQuestion() {
    var wrap = document.getElementById('quiz-wrap');
    if (!wrap) return;

    var q     = this.questions[this.current];
    var total = this.questions.length;

    var dinoNames = {
      spinosaurus:'Spinosaurio', trex:'T-Rex', triceratops:'Triceratops',
      velociraptor:'Velociraptor', ankylosaurus:'Ankylosaurus',
      stegosaurus:'Stegosaurus', parasaurolophus:'Parasaurolophus',
      carnotaurus:'Carnotaurus', brachiosaurus:'Braquiosaurio'
    };
    var dinoLabel = dinoNames[this.forDino] || 'Dinosaurio';
    var typeLabel = q.type === 'math'
      ? '<span class="quiz-type-math">🧮 Matemáticas</span>'
      : '<span class="quiz-type-concept">💡 Concepto</span>';

    var hintHtml = q.hint
      ? '<div class="quiz-hint">💡 Pista: <code>' + q.hint + '</code></div>'
      : '';

    wrap.innerHTML =
      '<div class="quiz-header">' +
        '<span class="quiz-progress">Pregunta ' + (this.current+1) + '/' + total + ' · ' + dinoLabel + '</span>' +
        '<span class="quiz-score">⭐ ' + this.score + ' pts</span>' +
      '</div>' +
      '<div class="quiz-q">' + typeLabel + ' ' + q.q + '</div>' +
      hintHtml +
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

  // ─── Responder ────────────────────────────────────

  answer(idx) {
    if (this.answered) return;
    this.answered = true;

    var q  = this.questions[this.current];
    var ok = idx === q.ans;
    if (ok) this.score += 10;

    // ── Tracking por tipo ──
    if (q.type === 'math') {
      this.mathTotal++;
      if (ok) this.mathCorrect++;

      // Sonido diferenciado para matemáticas
      AudioEngine.play(ok ? 'math-success' : 'math-error');

      if (ok) {
        // Acumulado de respuestas math correctas (para logro math-whiz)
        var prevCount = Achievements.getProgress('math-correct-count').current;
        Achievements.check('math-correct-count', prevCount + 1);

        // Racha por operación
        if (q.operation === 'multiplication' || q.operation === 'division') {
          var opKey  = 'ach_op_' + q.operation;
          var streak = (parseInt(sessionStorage.getItem(opKey) || '0')) + 1;
          sessionStorage.setItem(opKey, String(streak));
          if (q.operation === 'multiplication') Achievements.check('multiplication-streak', streak);
          if (q.operation === 'division')       Achievements.check('division-streak',       streak);
        }

        // Mostrar resultado de la operación
        if (q.hint) Desktop.showGuide('✓ ' + q.hint + ' = ' + q.opts[q.ans], 3500);

      } else {
        // Resetear racha de operación si falla
        if (q.operation === 'multiplication') sessionStorage.setItem('ach_op_multiplication', '0');
        if (q.operation === 'division')       sessionStorage.setItem('ach_op_division',       '0');
      }
    } else {
      AudioEngine.play(ok ? 'success' : 'error');
    }

    this.correctStreak = ok ? this.correctStreak + 1 : 0;

    // ── Colorear opciones ──
    q.opts.forEach(function(_, i) {
      var btn = document.getElementById('qopt-' + i);
      if (!btn) return;
      btn.disabled = true;
      if (i === q.ans)        btn.classList.add('correct');
      if (i === idx && !ok)   btn.classList.add('wrong');
    });

    // ── Feedback ──
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
    var dinoNames = { spinosaurus:'Spinosaurio', trex:'T-Rex', triceratops:'Triceratops',
                      velociraptor:'Velociraptor', ankylosaurus:'Ankylosaurus',
                      stegosaurus:'Stegosaurus', parasaurolophus:'Parasaurolophus',
                      carnotaurus:'Carnotaurus', brachiosaurus:'Braquiosaurio' };
    var dinoLabel = dinoNames[this.forDino] || 'dinosaurio';

    var msg = pct >= 50
      ? '¡Mereces la ficha del ' + dinoLabel + '! ¡A desbloquear!'
      : 'Estudia más e inténtalo de nuevo.';

    // Desglose matemático
    var mathHtml = '';
    if (this.mathTotal > 0) {
      var ms = this.getMathScore();
      mathHtml = '<div class="quiz-math-score">🧮 Matemáticas: <strong>' +
                 ms.correct + '/' + ms.total + '</strong> (' + ms.percentage + '%)</div>';
      // Mostrar en guía
      Desktop.showGuide('🧮 Matemáticas: ' + ms.correct + '/' + ms.total + ' (' + ms.percentage + '%)', 5000);
    }

    var actionBtn = pct >= 50
      ? '<button class="btn-primary" onclick="Quiz._unlock()" style="margin-top:8px">🏆 ¡Desbloquear ficha del ' + dinoLabel + '!</button>'
      : '<button class="quiz-next" onclick="Quiz.init()" style="margin-top:8px">🔄 Intentar de nuevo</button>';

    // ── Logros ──
    var elapsed = Date.now() - (this.quizStartTime || Date.now());
    Achievements.check('quiz-time', elapsed);
    if (this.correctStreak >= 3) Achievements.check('quiz-streak', 3);
    if (this.mathTotal > 0 && this.mathCorrect === this.mathTotal) {
      Achievements.check('perfect-math-quiz', 1);
    }

    // ── DinoLog ──
    DinoLog.track('quiz', { correct: Math.round(this.score / 10), total: total });
    if (this.mathTotal > 0) {
      DinoLog.track('math-quiz', { correct: this.mathCorrect, total: this.mathTotal });
    }

    wrap.innerHTML =
      '<div class="quiz-result">' +
        '<div class="qr-stars">' + stars + '</div>' +
        '<div class="qr-title">' + title + '</div>' +
        '<div class="qr-score">Puntuación: ' + this.score + ' / ' + (total * 10) + '</div>' +
        mathHtml +
        '<p class="qr-msg">' + msg + '</p>' +
        actionBtn +
      '</div>';
  },

  _unlock() {
    App.unlockDino(this.forDino);
  }
};
