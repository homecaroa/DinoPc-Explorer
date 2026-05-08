/**
 * DinoPC Explorer — dinoLog.js
 * Diario de Expedición: registra estadísticas de juego
 * y las persiste en localStorage.
 */

const DinoLog = {

  data: {
    sessions:    0,
    files:       0,
    steps:       0,
    missions:    0,
    quizCorrect: 0,
    quizTotal:   0,
    firstPlay:   null,
    lastPlay:    null
  },

  // ─── Persistencia ─────────────────────────────────

  load() {
    try {
      const s = localStorage.getItem('dinopc_log');
      if (s) this.data = { ...this.data, ...JSON.parse(s) };
    } catch (e) { /* datos corruptos → ignorar */ }
  },

  save() {
    localStorage.setItem('dinopc_log', JSON.stringify(this.data));
  },

  // ─── Registro de eventos ──────────────────────────

  /**
   * @param {'session'|'file'|'step'|'mission'|'quiz'} event
   * @param {*} value  - Para 'quiz': { correct: n, total: n }
   */
  track(event, value) {
    switch (event) {
      case 'session':
        this.data.sessions++;
        const today = new Date().toLocaleDateString('es-ES');
        if (!this.data.firstPlay) this.data.firstPlay = today;
        this.data.lastPlay = today;
        break;
      case 'file':    this.data.files++;    break;
      case 'step':    this.data.steps++;    break;
      case 'mission': this.data.missions++; break;
      case 'quiz':
        this.data.quizCorrect += value?.correct || 0;
        this.data.quizTotal   += value?.total   || 0;
        break;
    }
    this.save();
    this._refresh();
  },

  // ─── HTML del diario ──────────────────────────────

  buildHTML() {
    return `<div class="dl-wrap" id="dl-wrap">${this._getContent()}</div>`;
  },

  _getContent() {
    const d   = this.data;
    const acc = d.quizTotal > 0
      ? `${d.quizCorrect}/${d.quizTotal} (${Math.round(d.quizCorrect / d.quizTotal * 100)}%)`
      : '—';

    const missionRows = (typeof Mission !== 'undefined' ? Mission.MISSIONS : []).map(m => {
      const done = typeof App !== 'undefined' && App.state.unlockedDinos.includes(m.dino);
      return `
        <div class="dl-mission-row ${done ? 'done' : ''}">
          <span class="dl-m-dot">${done ? '✓' : '○'}</span>
          <span>${m.title}</span>
        </div>`;
    }).join('');

    const labName = (typeof App !== 'undefined' && App.state.settings?.labName) || 'DinoPC Lab';

    return `
      <div class="dl-head">
        <span class="dl-head-emoji">📒</span>
        <div>
          <div class="dl-head-title">Diario de Expedición</div>
          <div class="dl-head-sub">${labName} · ${d.lastPlay || 'Sin sesiones'}</div>
        </div>
      </div>

      <div class="dl-grid">
        <div class="dl-stat"><div class="dl-si">🔬</div><div class="dl-sv">${d.sessions}</div><div class="dl-sl">Sesiones</div></div>
        <div class="dl-stat"><div class="dl-si">📄</div><div class="dl-sv">${d.files}</div><div class="dl-sl">Archivos creados</div></div>
        <div class="dl-stat"><div class="dl-si">✅</div><div class="dl-sv">${d.steps}</div><div class="dl-sl">Pasos completados</div></div>
        <div class="dl-stat"><div class="dl-si">🏆</div><div class="dl-sv">${d.missions}/3</div><div class="dl-sl">Misiones</div></div>
        <div class="dl-stat"><div class="dl-si">🧠</div><div class="dl-sv dl-sv-sm">${acc}</div><div class="dl-sl">Aciertos Quiz</div></div>
        <div class="dl-stat"><div class="dl-si">📅</div><div class="dl-sv dl-sv-sm">${d.firstPlay || '—'}</div><div class="dl-sl">Primera sesión</div></div>
      </div>

      <div class="dl-missions-title">Progreso de expediciones</div>
      <div class="dl-missions">${missionRows}</div>

      <button class="dl-reset" onclick="DinoLog.confirmReset()">🗑️ Resetear estadísticas</button>
    `;
  },

  _refresh() {
    const el = document.getElementById('dl-wrap');
    if (el) el.innerHTML = this._getContent();
  },

  confirmReset() {
    if (confirm('¿Borrar estadísticas del diario?\n(Los dinosaurios desbloqueados no se borran)')) {
      this.data = { sessions:0, files:0, steps:0, missions:0, quizCorrect:0, quizTotal:0, firstPlay:null, lastPlay:null };
      this.save();
      this._refresh();
    }
  }
};
