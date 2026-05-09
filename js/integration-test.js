/**
 * DinoPC Explorer — integration-test.js
 * ⚠️  SOLO DESARROLLO — no cargar en producción
 *
 * Verifica que AudioEngine + Mission.STEPS + Achievements funcionan
 * correctamente juntos a lo largo del flujo completo de misión 1.
 *
 * INSTRUCCIONES:
 *   1. Abre el juego y llega a la pantalla del ESCRITORIO
 *   2. Abre DevTools → Console
 *   3. Pega todo este archivo y pulsa Enter
 *   4. O bien: incluye el script y llama IntegrationTest.run()
 *
 * NOTAS SOBRE EL CHECKLIST DEL SPEC:
 *   - Mission.STEPS es un objeto (no array) → usar Object.keys(Mission.STEPS).length
 *   - sessionStorage key real de logros: 'ach_unlocked' (no 'dinopc_achievements')
 *   - AudioEngine.ctx puede estar en state 'suspended' antes del primer gesto de usuario
 */

const IntegrationTest = {

  // ─── Infraestructura ───────────────────────────────

  _pass: 0,
  _fail: 0,

  _assert(label, condition, extra) {
    if (condition) {
      console.log(`  ✅ ${label}`);
      this._pass++;
    } else {
      console.error(`  ❌ ${label}`, extra !== undefined ? `→ got: ${JSON.stringify(extra)}` : '');
      this._fail++;
    }
  },

  _section(title) {
    console.groupEnd();
    console.group(`\n📋 ${title}`);
  },

  // ─── Entrada principal ─────────────────────────────

  run() {
    this._pass = 0;
    this._fail = 0;

    console.group('🧪 DinoPC Explorer — Integration Test');
    console.group(''); // abre el primer grupo vacío que cierra _section

    // Guardar estado original para restaurar al final
    const origDinos     = [...App.state.unlockedDinos];
    const origFS        = JSON.parse(JSON.stringify(App.state.fileSystem.children));
    const origSteps     = [...Mission._completedSteps];

    if (App.state.currentScreen !== 'desktop') {
      console.warn('⚠️  Ejecutar desde la pantalla del ESCRITORIO (App.startDesktop())');
      console.groupEnd();
      return { passed: 0, failed: 1, total: 1 };
    }

    // ─── Setup ──────────────────────────────────────
    this._section('SETUP');
    console.log('Limpiando estado para prueba limpia...');

    AudioEngine.init();
    Achievements.resetSession();
    Mission._completedSteps     = [];
    DinoWord._textTyped         = false;
    App.state.fileSystem.children = {};
    App.state.unlockedDinos     = App.state.unlockedDinos.filter(
      id => !['spinosaurus'].includes(id)        // retirar spino para poder desbloquearlo
    );
    Mission._renderPanel();

    this._assert('Mission en misión 1', Mission.currentIdx === 0, Mission.currentIdx);
    this._assert('_completedSteps vacío', Mission._completedSteps.length === 0);
    this._assert('fileSystem limpio', Object.keys(App.state.fileSystem.children).length === 0);

    // ─── 1. AudioEngine ─────────────────────────────
    this._section('1. AudioEngine');

    const ctxOk = AudioEngine.ctx !== null;
    this._assert('ctx creado', ctxOk, AudioEngine.ctx);

    const rClick = AudioEngine.play('click');
    this._assert('play("click") → started:true', rClick.started === true, rClick);

    AudioEngine.mute();
    this._assert('mute() → play() started:false', AudioEngine.play('success').started === false);
    AudioEngine.unmute();
    this._assert('unmute() → play() started:true', AudioEngine.play('success').started === true);

    // ─── 2. Mission.STEPS ───────────────────────────
    this._section('2. Mission.STEPS (objeto, no array)');

    const stepKeys = Object.keys(Mission.STEPS);
    this._assert('STEPS tiene 5 pasos', stepKeys.length === 5, stepKeys.length);
    this._assert('save-file label correcto',
      Mission.STEPS['save-file']?.label === '💾 Guardar archivo',
      Mission.STEPS['save-file']?.label);
    this._assert('requires chain: open-dinoword requiere create-folder',
      Mission.STEPS['open-dinoword']?.requires === 'create-folder');
    this._assert('canDoStep vacío → not allowed',
      Mission.canDoStep('save-file').allowed === false);
    this._assert('getNextStep() = "create-folder" al inicio',
      Mission.getNextStep() === 'create-folder', Mission.getNextStep());

    // ─── 3. Paso 1: Crear carpeta ────────────────────
    this._section('3. Flujo misión — Paso 1: Crear carpeta');

    FileExplorer.newFolder();

    this._assert('carpeta creada en fileSystem',
      Object.keys(App.state.fileSystem.children).length > 0);
    this._assert('create-folder en _completedSteps',
      Mission._completedSteps.includes('create-folder'));
    this._assert('canDoStep("create-folder") → ya completo',
      Mission.canDoStep('create-folder').allowed === false);

    const panelNextEl = document.querySelector('[data-step="open-dinoword"]');
    this._assert('panel: open-dinoword tiene clase step-next',
      panelNextEl?.classList.contains('step-next'), panelNextEl?.className);

    const panelDoneEl = document.querySelector('[data-step="create-folder"]');
    this._assert('panel: create-folder tiene clase step-done',
      panelDoneEl?.classList.contains('step-done'), panelDoneEl?.className);

    // ─── 4. Paso 2: Abrir DinoWord ──────────────────
    this._section('4. Flujo misión — Paso 2: Abrir DinoWord');

    // Desktop.openWindow() ya llama Mission.onAction internamente
    Desktop.openWindow('dinoword');

    this._assert('open-dinoword en _completedSteps',
      Mission._completedSteps.includes('open-dinoword'));
    this._assert('onAction("window-opened") ahora bloqueado (ya completado)',
      Mission.onAction('window-opened', { id: 'dinoword' }).success === false);

    const explP = Achievements.getProgress('exploration');
    this._assert('exploration progress ≥ 1 tras abrir DinoWord',
      explP.current >= 1, explP.current);

    // ─── 5. Paso 3: Escribir texto ───────────────────
    this._section('5. Flujo misión — Paso 3: Escribir texto');

    // Inyectar valores en el DOM de DinoWord (ventana ya abierta)
    const dwContent  = document.getElementById('dw-content');
    const dwFilename = document.getElementById('dw-filename');

    if (dwContent)  dwContent.value  = Mission.current.targetText;
    if (dwFilename) dwFilename.value = Mission.current.fileName;

    DinoWord._textTyped = false;           // reset para que onChange() dispare de nuevo
    DinoWord.onChange(Mission.current.targetText);

    this._assert('type-text en _completedSteps',
      Mission._completedSteps.includes('type-text'));
    this._assert('panel: save-file es step-next ahora',
      document.querySelector('[data-step="save-file"]')?.classList.contains('step-next'));

    // ─── 6. Paso 4: Guardar archivo ──────────────────
    this._section('6. Flujo misión — Paso 4: Guardar archivo');

    const filesBefore = DinoLog.data.files;
    DinoWord.save();

    this._assert('save-file en _completedSteps',
      Mission._completedSteps.includes('save-file'));
    this._assert('DinoLog.data.files incrementó',
      DinoLog.data.files > filesBefore, DinoLog.data.files);
    this._assert('_currentFileName asignado en DinoWord',
      !!DinoWord._currentFileName, DinoWord._currentFileName);

    const fileP = Achievements.getProgress('file-count');
    this._assert('Achievements file-count progress ≥ 1', fileP.current >= 1, fileP.current);

    // ─── 7. Paso 5: Mover archivo ────────────────────
    this._section('7. Flujo misión — Paso 5: Mover archivo');

    // Usar _currentFileName si disponible, si no buscar en fileSystem
    const fileToMove = DinoWord._currentFileName ||
      Object.keys(App.state.fileSystem.children)
        .find(k => App.state.fileSystem.children[k]?.type === 'file');

    this._assert('hay archivo para mover', !!fileToMove, fileToMove);

    if (fileToMove) FileExplorer.moveFile(fileToMove);

    this._assert('move-file en _completedSteps',
      Mission._completedSteps.includes('move-file'));
    this._assert('5/5 pasos completados',
      Mission._completedSteps.length === 5, Mission._completedSteps.length);

    // ─── 8. Quiz ────────────────────────────────────
    this._section('8. Quiz + logros de tiempo');

    // Abrir quiz con dino correcto (normalmente ocurre tras 2.6s automático)
    Quiz.forDino     = Mission.current.dino;
    Quiz.quizStartTime = Date.now() - 45000; // simular 45 s (< 60 s)
    Quiz.correctStreak = 3;
    Quiz.score       = 30;

    this._assert('Quiz.forDino = spinosaurus', Quiz.forDino === 'spinosaurus', Quiz.forDino);

    Desktop.openWindow('quiz');

    // Forzar resultado del quiz
    Quiz._showResult();

    const speedP = Achievements.getProgress('quiz-time');
    this._assert('quiz-time registrado', speedP.current > 0, speedP.current);
    this._assert('speedrunner desbloqueado (45s < 60s)',
      Achievements.isUnlocked('speedrunner'));
    this._assert('quiz-master desbloqueado (streak 3)',
      Achievements.isUnlocked('quiz-master'));

    // ─── 9. Desbloquear Spinosaurio ──────────────────
    this._section('9. Desbloquear Spinosaurio');

    App.unlockDino('spinosaurus');

    this._assert('spinosaurus en unlockedDinos',
      App.state.unlockedDinos.includes('spinosaurus'));

    const collP = Achievements.getProgress('dino-unlock');
    this._assert('dino-unlock progress ≥ 1', collP.current >= 1, collP.current);

    // ─── 10. Transición misión 1 → 2 ────────────────
    this._section('10. Transición misión 1 → 2');

    App.closeReward();

    this._assert('_completedSteps reiniciado a 0',
      Mission._completedSteps.length === 0, Mission._completedSteps.length);
    this._assert('currentIdx avanzó a misión 2 (T-Rex)',
      Mission.currentIdx === 1, Mission.currentIdx);
    this._assert('misión 2 es T-Rex',
      Mission.current.dino === 'trex', Mission.current.dino);
    this._assert('panel refleja misión 2',
      document.querySelector('.mp-header span')?.textContent.includes('T-REX') ||
      document.querySelector('.mp-header span')?.textContent.includes('2'));

    // ─── 11. Checklist de estado global ─────────────
    this._section('11. Checklist estado global');

    this._assert('window.AudioEngine existe',      typeof AudioEngine    !== 'undefined');
    this._assert('window.Achievements existe',     typeof Achievements   !== 'undefined');
    this._assert('Mission.STEPS es objeto',        typeof Mission.STEPS  === 'object' && !Array.isArray(Mission.STEPS));
    this._assert('Object.keys(Mission.STEPS) = 5', Object.keys(Mission.STEPS).length === 5);
    this._assert('Achievements usa sessionStorage (no localStorage)',
      sessionStorage.getItem('ach_unlocked') !== null);
    this._assert('localStorage dinopc_settings intacto',
      !!localStorage.getItem('dinopc_settings'));
    this._assert('localStorage dinopc_audio intacto (no corrompido)',
      localStorage.getItem('dinopc_settings') !== localStorage.getItem('dinopc_audio'));
    this._assert('Quiz.forDino string válido',
      typeof Quiz.forDino === 'string' && Quiz.forDino.length > 0, Quiz.forDino);
    this._assert('Mission._completedSteps es array',
      Array.isArray(Mission._completedSteps));
    this._assert('sessionStorage limpio de valores ajenos',
      !sessionStorage.getItem('dinopc_audio')); // audio usa localStorage, no session

    // ─── Restaurar estado original ───────────────────
    console.groupEnd();
    console.group('\n🔄 Restaurando estado original');
    App.state.unlockedDinos       = origDinos;
    App.state.fileSystem.children = origFS;
    Mission._completedSteps       = origSteps;
    Mission._renderPanel();
    Achievements.resetSession();
    console.log('Estado restaurado ✓');
    console.groupEnd();

    // ─── Resumen final ───────────────────────────────
    const total = this._pass + this._fail;
    const allOk = this._fail === 0;
    const style = allOk
      ? 'font-size:14px;font-weight:bold;color:#00ff88'
      : 'font-size:14px;font-weight:bold;color:#ff8844';

    console.groupEnd(); // cierra grupo raíz
    console.log('');
    console.log('%c' + (allOk ? '✅ INTEGRACIÓN EXITOSA' : '⚠️  INTEGRACIÓN CON ERRORES'),
      style);
    console.log(`%c${this._pass}/${total} checks pasados`,
      'font-weight:bold;color:' + (allOk ? '#00cc66' : '#cc6600'));

    if (!allOk) {
      console.warn(`${this._fail} check(s) fallaron. Revisa los ❌ arriba.`);
    } else {
      console.log('Resumen:');
      console.log('  • Pasos de misión: 5/5');
      console.log('  • Logros: speedrunner + quiz-master + first-file');
      console.log('  • Dino desbloqueado: Spinosaurio');
      console.log('  • Transición misión 1→2: OK');
      console.log('  • sessionStorage limpio');
    }

    return { passed: this._pass, failed: this._fail, total };
  }
};

// Auto-ejecutar si se pega en la consola
IntegrationTest.run();
