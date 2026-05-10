/**
 * DinoPC Explorer — achievements.js
 * Sistema de logros de sesión. Usa sessionStorage (NO localStorage).
 * Los logros se reinician con cada nueva sesión de juego.
 */

const Achievements = {

  // ─── Catálogo de logros ───────────────────────────

  DATA: [
    {
      id: 'first-file',
      icon: '📝', title: 'Primer Paso',
      description: 'Guarda tu primer archivo de expedición',
      category: 'files', trigger: 'file-count', goal: 1
    },
    {
      id: 'file-master',
      icon: '💾', title: 'Guardián de Archivos',
      description: 'Guarda 5 archivos en una sola sesión',
      category: 'files', trigger: 'file-count', goal: 5
    },
    {
      id: 'speedrunner',
      icon: '⚡', title: 'Rayo Veloz',
      description: 'Completa un quiz en menos de 60 segundos',
      category: 'quiz', trigger: 'quiz-time', goal: 60000, compare: 'lte'
    },
    {
      id: 'collector',
      icon: '🦖', title: 'Coleccionista',
      description: 'Desbloquea los 3 dinosaurios del laboratorio',
      category: 'missions', trigger: 'dino-unlock', goal: 3
    },
    {
      id: 'minigame-pro',
      icon: '🎮', title: 'Maestro del Rescate',
      description: 'Consigue 100 puntos o más en el Rescate del Río',
      category: 'minigame', trigger: 'minigame-score', goal: 100
    },
    {
      id: 'perfect-mission',
      icon: '✨', title: 'Misión Perfecta',
      description: 'Completa tu primera expedición científica',
      category: 'missions', trigger: 'mission-complete', goal: 1
    },
    {
      id: 'explorer',
      icon: '🔍', title: 'Explorador',
      description: 'Abre todas las ventanas del sistema',
      category: 'exploration', trigger: 'exploration', goal: 7
    },
    {
      id: 'quiz-master',
      icon: '🧠', title: 'Cerebro de Dinosaurio',
      description: 'Responde 3 preguntas del quiz seguidas correctamente',
      category: 'quiz', trigger: 'quiz-streak', goal: 3
    },
    {
      id: 'dino-researcher',
      icon: '🔬', title: 'Investigador Jurásico',
      description: 'Completa las 3 expediciones del laboratorio',
      category: 'missions', trigger: 'mission-complete', goal: 3
    },
    {
      id: 'minigame-legend',
      icon: '🌟', title: 'Leyenda del Río',
      description: 'Consigue 200 puntos o más en el minijuego',
      category: 'minigame', trigger: 'minigame-score', goal: 200
    },
    // ── Logros Matemáticos ──
    {
      id: 'math-whiz',
      icon: '🧮', title: 'Genio Matemático',
      description: 'Responde 10 preguntas matemáticas correctamente',
      category: 'quiz', trigger: 'math-correct-count', goal: 10
    },
    {
      id: 'perfect-math',
      icon: '✨', title: 'Perfección Matemática',
      description: 'Contesta todas las preguntas matemáticas de un quiz sin errores',
      category: 'quiz', trigger: 'perfect-math-quiz', goal: 1
    },
    {
      id: 'multiplication-master',
      icon: '×', title: 'Maestro de Multiplicaciones',
      description: 'Resuelve 5 multiplicaciones seguidas sin error',
      category: 'quiz', trigger: 'multiplication-streak', goal: 5
    },
    {
      id: 'division-champion',
      icon: '÷', title: 'Campeón de Divisiones',
      description: 'Resuelve 5 divisiones seguidas sin error',
      category: 'quiz', trigger: 'division-streak', goal: 5
    },
    // ── Logros de Almacenamiento ──
    {
      id: 'storage-master',
      icon: '💾', title: 'Maestro de Almacenamiento',
      description: 'Usa 95%+ del espacio disponible sin excederte',
      category: 'files', trigger: 'storage-efficiency', goal: 0.95
    },
    {
      id: 'efficient-files',
      icon: '⚡', title: 'Guardián Eficiente',
      description: 'Guarda 5 archivos usando menos de 150 KB en total',
      category: 'files', trigger: 'file-efficiency', goal: 5
    },
    {
      id: 'no-overflow',
      icon: '🎯', title: 'Nunca Lleno',
      description: 'Completa una misión sin exceder el límite de espacio',
      category: 'files', trigger: 'mission-complete-no-overflow', goal: 1
    }
  ],

  // ─── Claves de sessionStorage (prefijo 'ach_') ────

  _K_UNLOCKED: 'ach_unlocked',   // JSON array de IDs desbloqueados
  _K_PROG:     'ach_prog_',      // + triggerType → valor numérico actual
  _K_EXPLORED: 'ach_explored',   // JSON array de ventanas abiertas

  // ═══════════════════════════════════════════
  //  API PÚBLICA
  // ═══════════════════════════════════════════

  /**
   * Evalúa todos los logros del tipo indicado contra el valor dado.
   * Desbloquea los que cumplan la condición y muestra toast.
   * @param   {string} type   - trigger type ('file-count', 'quiz-time', ...)
   * @param   {number} value  - valor actual de la métrica
   * @returns {string[]}      - IDs de logros recién desbloqueados
   */
  check(type, value) {
    const justUnlocked = [];

    this.DATA.forEach(ach => {
      if (ach.trigger !== type) return;
      if (this.isUnlocked(ach.id)) return;

      const passes = ach.compare === 'lte'
        ? value <= ach.goal
        : value >= ach.goal;

      if (passes) {
        this._unlock(ach.id);
        justUnlocked.push(ach.id);
        this._showToast(ach);
      }
    });

    this._storeProgress(type, value);
    return justUnlocked;
  },

  /**
   * ¿Está desbloqueado este logro en la sesión actual?
   * @param   {string} id
   * @returns {boolean}
   */
  isUnlocked(id) {
    try {
      return JSON.parse(sessionStorage.getItem(this._K_UNLOCKED) || '[]').includes(id);
    } catch (e) { return false; }
  },

  /**
   * Devuelve el progreso almacenado para un tipo de trigger.
   * @param   {string} type
   * @returns {{ current: number, goal: number }}
   */
  getProgress(type) {
    const matching = this.DATA.filter(a => a.trigger === type);
    if (!matching.length) return { current: 0, goal: 0 };

    // Para comparaciones 'gte': mayor goal del grupo
    const goal    = Math.max(...matching.map(a => a.goal));
    let   current = 0;
    try { current = Number(sessionStorage.getItem(this._K_PROG + type)) || 0; } catch (e) {}

    return { current, goal };
  },

  /**
   * Registra una ventana abierta para el logro 'explorer'.
   * Llamar desde Desktop.openWindow(id).
   * @param {string} windowId
   */
  trackExploration(windowId) {
    try {
      const explored = new Set(
        JSON.parse(sessionStorage.getItem(this._K_EXPLORED) || '[]')
      );
      explored.add(windowId);
      sessionStorage.setItem(this._K_EXPLORED, JSON.stringify([...explored]));
      this.check('exploration', explored.size);
    } catch (e) {}
  },

  /**
   * Obtiene todos los logros desbloqueados en esta sesión (como objetos).
   * @returns {object[]}
   */
  getAllUnlocked() {
    try {
      const ids = JSON.parse(sessionStorage.getItem(this._K_UNLOCKED) || '[]');
      return this.DATA.filter(a => ids.includes(a.id));
    } catch (e) { return []; }
  },

  /**
   * Limpia todos los datos de logros de la sesión (clave prefijo 'ach_').
   * Llamar en App.startDesktop() para empezar limpio.
   */
  resetSession() {
    try {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('ach_')) toRemove.push(key);
      }
      toRemove.forEach(k => sessionStorage.removeItem(k));
    } catch (e) {}
  },

  // ═══════════════════════════════════════════
  //  PRIVADO
  // ═══════════════════════════════════════════

  _unlock(id) {
    try {
      const arr = JSON.parse(sessionStorage.getItem(this._K_UNLOCKED) || '[]');
      if (!arr.includes(id)) {
        arr.push(id);
        sessionStorage.setItem(this._K_UNLOCKED, JSON.stringify(arr));
      }
    } catch (e) {}
  },

  _storeProgress(type, value) {
    try {
      sessionStorage.setItem(this._K_PROG + type, String(value));
    } catch (e) {}
  },

  /**
   * Muestra un toast de logro desbloqueado durante 5 segundos.
   * Se apilan verticalmente si hay varios al mismo tiempo.
   * @param {object} ach - objeto del logro
   */
  _showToast(ach) {
    // Sonido si AudioEngine está disponible
    if (typeof AudioEngine !== 'undefined' && !AudioEngine.isMuted) {
      AudioEngine.play('success');
    }

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML =
      '<span>' + ach.icon + '</span>' +
      '<div>' +
        '<strong>¡Logro desbloqueado! ' + ach.title + '</strong>' +
        '<p>' + ach.description + '</p>' +
      '</div>';

    // Apilar hacia arriba si ya hay toasts visibles
    const existing = document.querySelectorAll('.achievement-toast');
    toast.style.bottom = (20 + existing.length * 88) + 'px';

    document.body.appendChild(toast);

    // Retirar al finalizar la animación CSS de 5 s
    setTimeout(() => toast.remove(), 5000);
  }
};
