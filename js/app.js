/**
 * DinoPC Explorer — app.js
 * Estado global, transiciones de pantalla, settings y recompensas.
 */

const App = {

  state: {
    currentScreen: 'splash',
    unlockedDinos: JSON.parse(localStorage.getItem('dinopc_unlocked') || '[]'),
    settings:      JSON.parse(localStorage.getItem('dinopc_settings')  || '{"labName":"DinoPC Lab","accent":"neon"}'),
    fileSystem: {
      name:     'Mis Expediciones',
      type:     'folder',
      children: {}
    }
  },

  // ─── Arranque ─────────────────────────────────────

  init() {
    DinoLog.load();
    this.showSplash();
    this._applyAccent(this.state.settings.accent);
    console.log('🦕 DinoPC Explorer v1.1 iniciado');
  },

  // ─── Navegación ───────────────────────────────────

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    this.state.currentScreen = id;
  },

  showSplash() { this.showScreen('splash'); },

  /**
   * Desde el botón JUGAR: nuevos jugadores ven el tutorial,
   * jugadores que ya desbloquearon algo van directo al escritorio.
   */
  startGame() {
    if (this.state.unlockedDinos.length === 0) {
      Tutorial.show();
    } else {
      this.startDesktop();
    }
  },

  /** Inicia el escritorio (llamado desde tutorial o directamente) */
  startDesktop() {
    // Limpiar sistema de archivos de sesiones anteriores
    this.state.fileSystem.children = {};
    this.showScreen('desktop');
    Desktop.init();
    Mission.init();
    DinoLog.track('session');
    this._applyLabName(this.state.settings.labName);
  },

  showCollection() {
    this.showScreen('collection');
    Collection.render();
  },

  // ─── Desbloqueo de dinosaurios ───────────────────

  unlockDino(dinoId) {
    const dino = Collection.data[dinoId];
    if (!dino) return;

    if (!this.state.unlockedDinos.includes(dinoId)) {
      this.state.unlockedDinos.push(dinoId);
      localStorage.setItem('dinopc_unlocked', JSON.stringify(this.state.unlockedDinos));
    }

    this._renderReward(dino);
    document.getElementById('reward-modal').classList.remove('hidden');
  },

  closeReward() {
    document.getElementById('reward-modal').classList.add('hidden');
    // Si hay una siguiente misión, reiniciar pasos
    if (!Mission.allComplete) {
      Mission._completedSteps = [];
      Mission._renderPanel();
      Desktop.showGuide(Mission.current.intro, 9000);
    }
  },

  // ─── Settings ────────────────────────────────────

  applySettings({ labName, accent }) {
    this.state.settings = { labName, accent };
    localStorage.setItem('dinopc_settings', JSON.stringify(this.state.settings));
    this._applyAccent(accent);
    this._applyLabName(labName);
  },

  _applyAccent(key) {
    const schemes = (typeof Settings !== 'undefined') ? Settings.SCHEMES : null;
    if (!schemes || !schemes[key]) return;
    const s = schemes[key];
    document.documentElement.style.setProperty('--neon',      s.neon);
    document.documentElement.style.setProperty('--neon-dim',  s.dim);
    document.documentElement.style.setProperty('--neon-glow', s.neon + '33');
  },

  _applyLabName(name) {
    const tbStart = document.querySelector('.tb-start');
    if (tbStart) tbStart.innerHTML = `<span>🦕</span> ${name}`;
    const smName = document.querySelector('.sm-info b');
    if (smName) smName.textContent = name;
  },

  // ─── Reward modal ─────────────────────────────────

  _renderReward(dino) {
    document.getElementById('reward-name').textContent = dino.name;

    const artEl = document.getElementById('reward-dino-art');
    if (dino.cardImg) {
      artEl.innerHTML = `
        <img src="${dino.cardImg}" class="reward-dino-img" alt="${dino.name}"
             onerror="this.replaceWith(Object.assign(document.createElement('span'),
               {textContent:'${dino.emoji}',style:'font-size:60px'}))">`;
    } else {
      artEl.textContent = dino.emoji;
    }

    document.getElementById('reward-stats').innerHTML = `
      <div><b>⚖️ Peso</b><span>${dino.weight}</span></div>
      <div><b>📏 Longitud</b><span>${dino.size}</span></div>
      <div><b>🍖 Dieta</b><span>${dino.diet}</span></div>
      <div><b>🕰️ Período</b><span>${dino.period}</span></div>`;

    document.getElementById('reward-fact').textContent = '💡 ' + dino.fact;
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
