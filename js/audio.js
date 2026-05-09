/**
 * DinoPC Explorer — audio.js
 * Motor de audio completo con Web Audio API pura.
 *
 * ─ Sin archivos MP3/OGG/WAV externos
 * ─ Sin setTimeout para loops de audio (OscillatorNode.stop(time))
 * ─ Compatible: Chrome, Firefox, Safari (webkitAudioContext fallback)
 * ─ Contexto lazy: se crea en el primer play() tras gesto del usuario
 */

const AudioEngine = {

  ctx:           null,   // AudioContext (creado lazy)
  masterGain:    null,   // Nodo master conectado a destination
  isMuted:       false,
  _ambientNodes: [],     // Nodos del drone ambiental activo

  // ═══════════════════════════════════════════
  //  API PÚBLICA
  // ═══════════════════════════════════════════

  /**
   * Cargar estado guardado y crear AudioContext.
   * Llamar desde App.init() — si el navegador requiere gesto
   * de usuario, el contexto se crea en el primer play().
   */
  init() {
    try {
      const saved = JSON.parse(localStorage.getItem('dinopc_audio') || '{}');
      this.isMuted = saved.muted === true;
    } catch (e) { /* localStorage no disponible */ }

    this._ensureCtx(); // intento inicial; puede quedar null en Chrome sin gesto
  },

  /**
   * Reproducir un efecto de sonido.
   * @param   {string} soundType  'success'|'error'|'click'|'file-saved'|'mission-complete'|'coin'
   * @param   {object} options    Opcionales: { freq, duration, volume }
   * @returns {{ started: boolean, duration: number }}
   */
  play(soundType, options = {}) {
    if (this.isMuted)       return { started: false, duration: 0 };
    if (!this._ensureCtx()) return { started: false, duration: 0 };

    // Reanudar si el navegador suspendió el contexto (política autoplay)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const SOUNDS = {
      'success':          { freq: 800,  duration: 0.30, pattern: 'beepup',   type: 'sine',     volume: 0.25 },
      'error':            { freq: 280,  duration: 0.50, pattern: 'beepdown', type: 'sawtooth', volume: 0.18 },
      'click':            { freq: 600,  duration: 0.08, pattern: 'click',    type: 'square',   volume: 0.12 },
      'file-saved':       { freq: 880,  duration: 0.28, pattern: 'beepup',   type: 'sine',     volume: 0.20 },
      'mission-complete': { freq: 523,  duration: 0.90, pattern: 'arpeggio', type: 'sine',     volume: 0.28 },
      'coin':             { freq: 1050, duration: 0.18, pattern: 'ding',     type: 'sine',     volume: 0.22 }
    };

    const base = SOUNDS[soundType];
    if (!base) return { started: false, duration: 0 };

    const cfg = { ...base, ...options };

    try {
      this._dispatch(cfg);
    } catch (e) {
      console.warn('AudioEngine.play("' + soundType + '") error:', e.message);
      return { started: false, duration: 0 };
    }

    return { started: true, duration: cfg.duration };
  },

  mute()   { this.isMuted = true;  this._saveState(); },
  unmute() { this.isMuted = false; this._saveState(); },

  /** Alterna mute/unmute. Retorna true si el sonido quedó ACTIVO. */
  toggle() {
    this.isMuted ? this.unmute() : this.mute();
    return !this.isMuted;
  },

  // ═══════════════════════════════════════════
  //  MÚSICA AMBIENTAL (drone jurásico)
  // ═══════════════════════════════════════════

  /**
   * Inicia un drone ambiental suave (A1 + A2 con LFO de amplitud).
   * Llamar en App.startDesktop(). No usa bucles ni setTimeout.
   */
  startAmbient() {
    if (this.isMuted || this._ambientNodes.length) return;
    if (!this._ensureCtx()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});

    const t = this.ctx.currentTime;

    // Oscilador base 55 Hz (A1) — frecuencia fundamental del drone
    const osc1   = this._createOsc(55,  'sine');
    const gain1  = this.ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    gain1.gain.setValueAtTime(0.001, t);
    gain1.gain.linearRampToValueAtTime(0.040, t + 5);  // fade-in 5 s

    // Segunda armónica 110 Hz (A2), más suave
    const osc2   = this._createOsc(110, 'sine');
    const gain2  = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.linearRampToValueAtTime(0.020, t + 5);

    // LFO de amplitud 0.18 Hz (pulso lento)
    const lfo     = this._createOsc(0.18, 'sine');
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.012;                         // profundidad ±0.012
    lfo.connect(lfoGain);
    lfoGain.connect(gain1.gain);                         // modula el volumen principal

    // Arrancar
    osc1.start(t); osc2.start(t); lfo.start(t);

    this._ambientNodes = [osc1, osc2, lfo, lfoGain, gain1, gain2];
  },

  /**
   * Detiene el drone con fade-out de 1 s.
   * Usa OscillatorNode.stop(time) — sin setTimeout para audio.
   */
  stopAmbient() {
    if (!this._ambientNodes.length || !this.ctx) return;
    const t     = this.ctx.currentTime;
    const nodes = this._ambientNodes;
    this._ambientNodes = [];

    // Fade-out de gain nodes
    [nodes[4], nodes[5]].forEach(g => {
      if (!g) return;
      g.gain.setValueAtTime(g.gain.value || 0.001, t);
      g.gain.linearRampToValueAtTime(0.0001, t + 1);
    });

    // Parar osciladores con timing nativo de AudioContext (sin setTimeout)
    [nodes[0], nodes[1], nodes[2]].forEach(o => {
      if (!o) return;
      try { o.stop(t + 1.1); } catch (e) {}
      o.onended = () => { try { o.disconnect(); } catch (e) {} };
    });

    // Desconectar nodos de gain (cleanup; no es bucle de audio)
    setTimeout(() => {
      [nodes[3], nodes[4], nodes[5]].forEach(n => { try { n.disconnect(); } catch(e) {} });
    }, 1200);
  },

  // ═══════════════════════════════════════════
  //  PRIVADO: CONTEXTO
  // ═══════════════════════════════════════════

  _ensureCtx() {
    if (this.ctx) return true;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.masterGain.connect(this.ctx.destination);
      return true;
    } catch (e) {
      console.warn('AudioEngine: AudioContext no disponible —', e.message);
      return false;
    }
  },

  _saveState() {
    try { localStorage.setItem('dinopc_audio', JSON.stringify({ muted: this.isMuted })); } catch (e) {}
  },

  // ═══════════════════════════════════════════
  //  PRIVADO: HELPERS DE NODOS
  // ═══════════════════════════════════════════

  /** Crea OscillatorNode sin conectar */
  _createOsc(freq, type) {
    const o = this.ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.value = freq;
    return o;
  },

  /** Crea par OscillatorNode + GainNode conectados al master */
  _node(freq, type) {
    const osc  = this._createOsc(freq, type);
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(this.masterGain);
    return { osc, gain };
  },

  // ═══════════════════════════════════════════
  //  PRIVADO: DISPATCHER DE PATRONES
  // ═══════════════════════════════════════════

  _dispatch(cfg) {
    const P = {
      beepup:   c => this._beepup(c),
      beepdown: c => this._beepdown(c),
      click:    c => this._click(c),
      arpeggio: c => this._arpeggio(c),
      ding:     c => this._ding(c),
      beep:     c => this._beep(c)
    };
    (P[cfg.pattern] || P.beep)(cfg);
  },

  // ═══════════════════════════════════════════
  //  PRIVADO: PATRONES DE SONIDO
  // ═══════════════════════════════════════════

  /** Tono neutro con decay exponencial */
  _beep({ freq, duration, type, volume }) {
    const { osc, gain } = this._node(freq, type);
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  },

  /** Frecuencia sube +220 Hz → señal de ÉXITO */
  _beepup({ freq, duration, type, volume }) {
    const { osc, gain } = this._node(freq, type);
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(freq + 220, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  },

  /** Frecuencia baja −220 Hz → señal de ERROR */
  _beepdown({ freq, duration, type, volume }) {
    const { osc, gain } = this._node(freq, type);
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(Math.max(60, freq - 220), t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  },

  /** Click corto con pitch drop → feedback de UI */
  _click({ freq, duration, type, volume }) {
    const { osc, gain } = this._node(freq, type);
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(50, freq * 0.55), t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  },

  /**
   * Tríada mayor ascendente → MISIÓN COMPLETADA
   * Notas: fundamental, tercera mayor (×1.25), quinta justa (×1.5)
   * Usa stop(time) nativo — sin setTimeout
   */
  _arpeggio({ freq, type, volume }) {
    [1, 1.25, 1.5].forEach((ratio, i) => {
      const { osc, gain } = this._node(freq * ratio, type);
      const t = this.ctx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0,      t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  },

  /**
   * Ding con armónica → RECOGER OBJETO
   * Fundamental + quinta (×1.5), decay exponencial tipo campana
   */
  _ding({ freq, duration, volume }) {
    [[freq, volume], [freq * 1.5, volume * 0.32]].forEach(([f, v]) => {
      const { osc, gain } = this._node(f, 'sine');
      const t = this.ctx.currentTime;
      gain.gain.setValueAtTime(v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    });
  }

};
