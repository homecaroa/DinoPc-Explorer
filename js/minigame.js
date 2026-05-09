/**
 * DinoPC Explorer — minigame.js
 * Minijuego "Rescate del Río": Spinosaurio nada y recoge documentos
 * evitando virus rojos. Canvas 2D puro, sin dependencias externas.
 */

const Minigame = {

  // ─── Estado del juego ─────────────────────────────
  canvas:  null,
  ctx:     null,
  raf:     null,       // requestAnimationFrame handle
  timers:  [],         // setInterval handles
  keys:    {},

  cfg: {
    W:         724,
    H:         396,
    SPINO_X:   130,
    SPINO_SPEED: 4.5,
    ITEM_BASE_SPEED: 2.8,
    SPAWN_MS:  1400,
    DURATION:  60,
  },

  game: null,  // Objeto de estado de partida

  // ─── Arranque ─────────────────────────────────────

  start() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) return;
    this.ctx    = this.canvas.getContext('2d');
    this.keys   = {};

    // Load spinosaurus sprite (screen blend will drop the dark background)
    this.spinoImg  = new Image();
    this.spinoImg.src = 'assets/images/spinosaurus_idle.png';
    this.victoryImg = new Image();
    this.victoryImg.src = 'assets/images/spinosaurus_victory.png';

    // Load river background
    this.riverBg = new Image();
    this.riverBg.src = 'assets/images/river_rescue_background.png';

    this.game = {
      spinoY:    this.cfg.H / 2,
      items:     [],
      score:     0,
      timeLeft:  this.cfg.DURATION,
      running:   true,
      over:      false,
      particles: []
    };

    // Listeners de teclado
    this._keyDown = (e) => { this.keys[e.key] = true; };
    this._keyUp   = (e) => { this.keys[e.key] = false; };
    document.addEventListener('keydown', this._keyDown);
    document.addEventListener('keyup',   this._keyUp);

    // Touch: mitad superior = subir, inferior = bajar
    this._touchHandler = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const ty   = e.touches[0].clientY - rect.top;
      this.keys['ArrowUp']   = ty < rect.height / 2;
      this.keys['ArrowDown'] = ty >= rect.height / 2;
    };
    this._touchEnd = () => { this.keys['ArrowUp'] = this.keys['ArrowDown'] = false; };
    this.canvas.addEventListener('touchstart', this._touchHandler, { passive: false });
    this.canvas.addEventListener('touchend',   this._touchEnd);

    // Spawner de items
    const spawnTimer = setInterval(() => this._spawnItem(), this.cfg.SPAWN_MS);
    // Cuenta regresiva
    const countTimer = setInterval(() => {
      if (!this.game || !this.game.running) return;
      this.game.timeLeft--;
      if (this.game.timeLeft <= 0) this._endGame();
    }, 1000);

    this.timers.push(spawnTimer, countTimer);

    this._loop();
  },

  stop() {
    if (this.game) this.game.running = false;
    cancelAnimationFrame(this.raf);
    this.timers.forEach(clearInterval);
    this.timers = [];
    document.removeEventListener('keydown', this._keyDown);
    document.removeEventListener('keyup',   this._keyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this._touchHandler);
      this.canvas.removeEventListener('touchend',   this._touchEnd);
    }
  },

  // ─── Game loop ────────────────────────────────────

  _loop() {
    if (!this.game || !this.game.running) return;
    this._update();
    this._draw();
    this.raf = requestAnimationFrame(() => this._loop());
  },

  _update() {
    const g   = this.game;
    const cfg = this.cfg;

    // Mover Spinosaurio
    const up   = this.keys['ArrowUp']   || this.keys['w'] || this.keys['W'];
    const down = this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'];
    if (up   && g.spinoY > 45)            g.spinoY -= cfg.SPINO_SPEED;
    if (down && g.spinoY < cfg.H - 55)   g.spinoY += cfg.SPINO_SPEED;

    // Mover items y detectar colisiones
    g.items = g.items.filter(item => {
      item.x -= item.speed;

      const dx = Math.abs(item.x - cfg.SPINO_X);
      const dy = Math.abs(item.y - g.spinoY);

      if (dx < 38 && dy < 28) {
        if (item.type === 'doc') {
          g.score += 10;
          this._burst(item.x, item.y, '#ffb700', 8);
          AudioEngine.play('coin');
          return false;
        } else if (item.type === 'virus' && !item.hit) {
          g.score  = Math.max(0, g.score - 5);
          item.hit = true;
          this._burst(item.x, item.y, '#ff2244', 6);
          AudioEngine.play('error');
          setTimeout(() => { if (item) item.hit = false; }, 400);
        }
      }
      return item.x > -50;
    });

    // Partículas
    g.particles = g.particles.filter(p => {
      p.x  += p.vx; p.y += p.vy; p.life--;
      p.vy += 0.15;
      return p.life > 0;
    });
  },

  _spawnItem() {
    if (!this.game || !this.game.running) return;
    const isVirus = Math.random() < 0.38;
    this.game.items.push({
      type:  isVirus ? 'virus' : 'doc',
      x:     this.cfg.W + 20,
      y:     50 + Math.random() * (this.cfg.H - 100),
      speed: this.cfg.ITEM_BASE_SPEED + Math.random() * 2.2,
      hit:   false,
      wave:  Math.random() * Math.PI * 2  // fase inicial para movimiento ondulatorio
    });
  },

  _burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      this.game.particles.push({
        x, y,
        vx:   Math.cos(a) * (1.5 + Math.random() * 2),
        vy:   Math.sin(a) * (1.5 + Math.random() * 2),
        color,
        life: 20 + Math.random() * 15 | 0
      });
    }
  },

  _endGame() {
    this.game.running = false;
    this.game.over    = true;
    this.timers.forEach(clearInterval);
    this.timers = [];
    Achievements.check('minigame-score', this.game.score);
    this._draw(); // Frame final
  },

  // ─── Render ───────────────────────────────────────

  _draw() {
    const ctx  = this.ctx;
    const g    = this.game;
    const W    = this.cfg.W;
    const H    = this.cfg.H;
    const t    = Date.now() / 1000;

    // ── Fondo del río ──
    if (this.riverBg && this.riverBg.complete && this.riverBg.naturalWidth > 0) {
      ctx.drawImage(this.riverBg, 0, 0, W, H);
      // Dark tint over photo for contrast
      ctx.fillStyle = 'rgba(2,8,24,0.40)';
      ctx.fillRect(0, 0, W, H);
    } else {
      // CSS fallback gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0,   '#081428');
      bgGrad.addColorStop(0.4, '#0a2050');
      bgGrad.addColorStop(1,   '#041030');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Ondas del agua (siempre encima del bg)
    ctx.strokeStyle = 'rgba(0,150,255,0.18)';
    ctx.lineWidth   = 2;
    for (let i = 0; i < 9; i++) {
      const wy = 30 + i * 40;
      ctx.beginPath();
      ctx.moveTo(0, wy);
      for (let x = 0; x < W; x += 4) {
        ctx.lineTo(x, wy + Math.sin((x / W) * Math.PI * 4 + t + i) * 6);
      }
      ctx.stroke();
    }

    // ── Items ──
    g.items.forEach(item => {
      // Ligero movimiento ondulatorio vertical
      const visualY = item.y + Math.sin(t * 2.5 + item.wave) * 4;

      if (item.type === 'doc') {
        this._drawDoc(ctx, item.x, visualY);
      } else {
        this._drawVirus(ctx, item.x, visualY, item.hit);
      }
    });

    // ── Partículas ──
    g.particles.forEach(p => {
      ctx.globalAlpha = p.life / 35;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ── Spinosaurio ──
    this._drawSpino(ctx, this.cfg.SPINO_X, g.spinoY, t);

    // ── HUD ──
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, 40);

    ctx.fillStyle    = '#00ff88';
    ctx.font         = 'bold 17px "Courier New"';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐ ' + g.score, 14, 20);

    // Timer — rojo cuando queda poco
    ctx.fillStyle = g.timeLeft <= 10 ? '#ff4466' : '#ffb700';
    ctx.textAlign = 'right';
    ctx.fillText('⏱ ' + g.timeLeft + 's', W - 14, 20);

    ctx.fillStyle = 'rgba(150,200,255,0.7)';
    ctx.font      = '13px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('↑ ↓ / W S para nadar', W / 2, 20);

    // ── Game Over ──
    if (g.over) {
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.fillRect(0, 0, W, H);

      // Imagen de victoria con screen blend
      if (this.victoryImg && this.victoryImg.complete && this.victoryImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const vW = 200, vH = 140;
        ctx.drawImage(this.victoryImg, W / 2 - vW / 2, H / 2 - vH / 2 - 20, vW, vH);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }

      ctx.fillStyle = '#00ff88';
      ctx.font      = 'bold 36px Impact';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('¡RESCATE COMPLETADO!', W / 2, 46);

      ctx.fillStyle = '#ffb700';
      ctx.font      = 'bold 24px "Courier New"';
      ctx.fillText('Puntuación final: ' + g.score, W / 2, H - 54);

      ctx.fillStyle = 'rgba(150,200,255,0.8)';
      ctx.font      = '15px "Courier New"';
      ctx.fillText('Cierra esta ventana para continuar', W / 2, H - 24);
    }
  },

  // ─── Dibujo del Spinosaurio ───────────────────────

  _drawSpino(ctx, x, y, t) {
    const bob = Math.sin(t * 3) * 3;

    // Si la imagen real está cargada, usarla con screen blend
    // (elimina el fondo negro de la foto)
    if (this.spinoImg && this.spinoImg.complete && this.spinoImg.naturalWidth > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen'; // fondo negro → transparente
      const iW = 160, iH = 110;
      ctx.drawImage(this.spinoImg, x - iW / 2 + 22, y - iH / 2 + bob, iW, iH);
      ctx.globalCompositeOperation = 'source-over';

      // Contorno de selección / hitbox helper (debug off)
      // ctx.strokeStyle='rgba(0,255,136,0.3)'; ctx.strokeRect(x-38,y-28+bob,76,56);

      ctx.restore();
    } else {
      // Fallback: Spinosaurio dibujado con canvas API
      this._drawSpinoCss(ctx, x, y + bob, t);
    }
  },

  _drawSpinoCss(ctx, x, y, t) {

    // Cola
    ctx.fillStyle = '#2a7a3a';
    ctx.beginPath();
    ctx.moveTo(x - 52, y - 4);
    ctx.quadraticCurveTo(x - 72, y - 18, x - 78, y + 14);
    ctx.quadraticCurveTo(x - 62, y + 18, x - 52, y + 10);
    ctx.fill();

    // Cuerpo principal
    const grad = ctx.createRadialGradient(x, y - 8, 5, x, y, 52);
    grad.addColorStop(0, '#4aaa55');
    grad.addColorStop(1, '#2a7a3a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, 52, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vela dorsal (característica del Spinosaurio) — animada
    const sailSway = Math.sin(t * 1.5) * 2;
    ctx.fillStyle = '#1a6a2a';
    ctx.beginPath();
    ctx.moveTo(x - 28, y - 22);
    ctx.lineTo(x - 12 + sailSway, y - 58);
    ctx.lineTo(x + 3 + sailSway,  y - 62);
    ctx.lineTo(x + 18 + sailSway, y - 54);
    ctx.lineTo(x + 32, y - 22);
    ctx.closePath();
    ctx.fill();

    // Costillas de la vela
    ctx.strokeStyle = '#0f4a1a';
    ctx.lineWidth   = 1.5;
    for (let i = -20; i <= 26; i += 8) {
      ctx.beginPath();
      ctx.moveTo(x + i, y - 22);
      ctx.lineTo(x + i + sailSway * 0.6 + 2, y - 55);
      ctx.stroke();
    }

    // Cuello
    ctx.fillStyle = '#3a8a4a';
    ctx.beginPath();
    ctx.ellipse(x + 52, y - 10, 22, 15, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza
    ctx.fillStyle = '#3a8a4a';
    ctx.beginPath();
    ctx.ellipse(x + 76, y - 14, 24, 13, -0.18, 0, Math.PI * 2);
    ctx.fill();

    // Hocico largo (característica del Spinosaurio)
    ctx.fillStyle = '#338844';
    ctx.beginPath();
    ctx.ellipse(x + 96, y - 8, 20, 8, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Ojo
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.arc(x + 82, y - 18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(x + 83, y - 18, 3, 0, Math.PI * 2);
    ctx.fill();
    // Brillo del ojo
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(x + 84, y - 20, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Fosas nasales
    ctx.fillStyle = '#1a5530';
    ctx.beginPath();
    ctx.ellipse(x + 106, y - 8, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Patas (aletas natorias en el agua)
    const legWave = Math.sin(t * 4) * 6;
    ctx.fillStyle = '#2a7a3a';
    ctx.beginPath();
    ctx.ellipse(x + 18, y + 26 + legWave, 14, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 12, y + 24 - legWave, 14, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // ─── Game Over con imagen victoria ───────────────

  _drawDoc(ctx, x, y) {
    // Papel con doblez esquina
    ctx.fillStyle = '#f0e080';
    ctx.fillRect(x - 14, y - 18, 28, 36);

    // Doblez superior derecho
    ctx.fillStyle = '#c8b860';
    ctx.beginPath();
    ctx.moveTo(x + 5,  y - 18);
    ctx.lineTo(x + 14, y - 18);
    ctx.lineTo(x + 14, y - 9);
    ctx.closePath();
    ctx.fill();

    // Líneas de texto simuladas
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x - 8, y - 10, 12, 2.5);
    ctx.fillRect(x - 8, y - 4,  16, 2.5);
    ctx.fillRect(x - 8, y + 2,  14, 2.5);
    ctx.fillRect(x - 8, y + 8,  10, 2.5);

    // Icono pequeño
    ctx.fillStyle = 'rgba(255,150,0,0.7)';
    ctx.font      = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📄', x - 3, y + 15);
  },

  _drawVirus(ctx, x, y, hit) {
    const color   = hit ? '#ff8899' : '#ff2244';
    const glow    = hit ? 'rgba(255,136,153,0.4)' : 'rgba(255,34,68,0.35)';

    // Aura
    ctx.shadowColor = glow;
    ctx.shadowBlur  = 14;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();

    // Pinchos
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    for (let i = 0; i < 8; i++) {
      const a  = (i / 8) * Math.PI * 2;
      const r1 = 13, r2 = 20;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Símbolo
    ctx.fillStyle    = '#fff';
    ctx.font         = 'bold 14px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕', x, y + 1);
  }
};
