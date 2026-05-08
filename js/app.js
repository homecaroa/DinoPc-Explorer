/**
 * DinoPC Explorer — app.js
 * Estado global, transiciones de pantalla y sistema de recompensas.
 */

const App = {

  /** Estado global de la aplicación */
  state: {
    currentScreen: 'splash',
    unlockedDinos:  JSON.parse(localStorage.getItem('dinopc_unlocked') || '[]'),
    fileSystem: {
      name:     'Mis Expediciones',
      type:     'folder',
      children: {}
    }
  },

  /** Punto de entrada: arranca al cargar el DOM */
  init() {
    this.showSplash();
    this._updateClock(); // Iniciar reloj aunque el escritorio no esté visible aún
    console.log('🦕 DinoPC Explorer v1.0 iniciado');
  },

  // ─── Navegación entre pantallas ─────────────────────────────

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    this.state.currentScreen = id;
  },

  showSplash() {
    this.showScreen('splash');
  },

  /** Inicia el juego: muestra el escritorio e inicializa módulos */
  startGame() {
    this.showScreen('desktop');
    Desktop.init();
    Mission.init();

    // Saludo del guía al entrar
    setTimeout(() => {
      Desktop.showGuide(
        '¡Bienvenido! Soy Rex 🦕, tu guía científico. ' +
        'Tu misión: crear una expedición para el Spinosaurio. ' +
        '¡Empieza abriendo "Mis Expediciones" con doble clic!'
      );
    }, 600);
  },

  /** Muestra la pantalla de colección */
  showCollection() {
    this.showScreen('collection');
    Collection.render();
  },

  // ─── Sistema de desbloqueo ───────────────────────────────────

  /**
   * Desbloquea un dinosaurio y muestra su recompensa.
   * @param {string} dinoId  - Clave del dinosaurio en Collection.data
   */
  unlockDino(dinoId) {
    const dino = Collection.data[dinoId];
    if (!dino) return;

    // Registrar en colección si no estaba
    if (!this.state.unlockedDinos.includes(dinoId)) {
      this.state.unlockedDinos.push(dinoId);
      localStorage.setItem('dinopc_unlocked', JSON.stringify(this.state.unlockedDinos));
    }

    this._renderReward(dino);
    document.getElementById('reward-modal').classList.remove('hidden');
  },

  closeReward() {
    document.getElementById('reward-modal').classList.add('hidden');
  },

  // ─── Privado ─────────────────────────────────────────────────

  _renderReward(dino) {
    document.getElementById('reward-name').textContent = dino.name;

    // Mostrar imagen real si existe; si no, emoji de fallback
    const artEl = document.getElementById('reward-dino-art');
    if (dino.id === 'spinosaurus') {
      artEl.innerHTML = `
        <img src="assets/images/spinosaurus_victory.png"
             class="reward-dino-img"
             alt="${dino.name}"
             onerror="this.replaceWith(Object.assign(document.createElement('span'),
               {textContent:'${dino.emoji}',style:'font-size:60px'}))">
      `;
    } else {
      artEl.textContent = dino.emoji;
    }

    document.getElementById('reward-stats').innerHTML = `
      <div><b>⚖️ Peso</b><span>${dino.weight}</span></div>
      <div><b>📏 Longitud</b><span>${dino.size}</span></div>
      <div><b>🍖 Dieta</b><span>${dino.diet}</span></div>
      <div><b>🕰️ Período</b><span>${dino.period}</span></div>
    `;

    document.getElementById('reward-fact').textContent = '💡 ' + dino.fact;
  },

  _updateClock() {
    const el = document.getElementById('tb-clock');
    if (!el) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    el.textContent = h + ':' + m;
    setTimeout(() => this._updateClock(), 10000);
  }

};

// Arrancar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => App.init());
