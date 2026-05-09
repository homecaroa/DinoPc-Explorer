/**
 * DinoPC Explorer — auth.js
 * Sistema de perfiles de explorador + notificaciones por email vía mailto:.
 *
 * NOTA TÉCNICA: El envío de email usa window.location = 'mailto:...'
 * que abre el cliente de correo del usuario. NO es envío automático;
 * requiere que el usuario pulse "Enviar" en su cliente de correo.
 * Para envío automático se necesita un backend o EmailJS (API externa).
 *
 * PRIVACIDAD: El email registrado es del padre/tutor, nunca del menor.
 * Todos los datos se guardan solo en localStorage del dispositivo.
 */

// ═══════════════════════════════════════════════════
//  AUTH — gestión de perfiles
// ═══════════════════════════════════════════════════
const Auth = {

  _K_USERS:   'dinopc_users',
  _K_CURRENT: 'dinopc_current_user',
  _SALT:      'dpc_v1_salt',

  // ─── API pública ────────────────────────────────

  /**
   * Registrar nuevo explorador.
   * @param {{ username:string, email?:string, password?:string }} opts
   * @returns {{ success:boolean, user?:object, error?:string }}
   */
  register({ username, email, password }) {
    username = (username || '').trim();
    email    = (email    || '').trim().toLowerCase();
    password = (password || '').trim();

    // Validaciones
    if (username.length < 2)
      return { success: false, error: 'El nombre debe tener al menos 2 caracteres.' };
    if (username.length > 30)
      return { success: false, error: 'El nombre es demasiado largo (máx. 30 caracteres).' };
    if (email && !this._validEmail(email))
      return { success: false, error: 'El email no tiene un formato válido.' };
    if (password && password.length < 4)
      return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };

    const users = this._getUsers();

    // Email único (si se proporciona)
    if (email && users.find(u => u.email === email))
      return { success: false, error: 'Este email ya está registrado.' };

    const user = {
      id:        Date.now().toString(36),
      username,
      email:     email   || null,
      password:  password ? this._hash(password) : null,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    this._saveUsers(users);
    this._setCurrentId(user.id);

    return { success: true, user: this._safe(user) };
  },

  /**
   * Iniciar sesión con email/nombre de usuario + contraseña opcional.
   * @returns {{ success:boolean, user?:object, error?:string }}
   */
  login(identifier, password) {
    identifier = (identifier || '').trim().toLowerCase();
    password   = (password   || '').trim();

    const users = this._getUsers();
    const user  = users.find(u =>
      (u.email    && u.email    === identifier) ||
      u.username.toLowerCase() === identifier
    );

    if (!user)
      return { success: false, error: 'No se encontró un perfil con ese nombre o email.' };

    // Si tiene contraseña, verificar
    if (user.password && user.password !== this._hash(password))
      return { success: false, error: 'Contraseña incorrecta.' };

    this._setCurrentId(user.id);
    return { success: true, user: this._safe(user) };
  },

  logout() {
    try { localStorage.removeItem(this._K_CURRENT); } catch (e) {}
  },

  /** ¿Hay un perfil activo? */
  isLoggedIn() {
    return !!this.getUser();
  },

  /** Devuelve el usuario activo (sin contraseña) o null. */
  getUser() {
    try {
      const id = localStorage.getItem(this._K_CURRENT);
      if (!id) return null;
      const u = this._getUsers().find(u => u.id === id);
      return u ? this._safe(u) : null;
    } catch (e) { return null; }
  },

  /** Lista todos los perfiles registrados (sin contraseñas). */
  listUsers() {
    return this._getUsers().map(u => this._safe(u));
  },

  /** Elimina todos los datos de auth (para tests / reset). */
  _clearAll() {
    try {
      localStorage.removeItem(this._K_USERS);
      localStorage.removeItem(this._K_CURRENT);
    } catch (e) {}
  },

  // ─── UI helpers ────────────────────────────────

  showTab(tab) {
    const loginF = document.getElementById('login-form');
    const regF   = document.getElementById('register-form');
    const tabs   = document.querySelectorAll('.login-tab');
    if (!loginF || !regF) return;

    loginF.classList.toggle('hidden', tab !== 'login');
    regF.classList.toggle('hidden',   tab !== 'register');
    tabs.forEach((t, i) => t.classList.toggle('active', (i === 0) === (tab === 'login')));

    // Limpiar errores
    ['login-err','reg-err'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.classList.add('hidden'); }
    });
  },

  doLogin() {
    const identifier = document.getElementById('login-user')?.value || '';
    const password   = document.getElementById('login-pass')?.value || '';
    const errEl      = document.getElementById('login-err');

    const result = this.login(identifier, password);
    if (!result.success) {
      if (errEl) { errEl.textContent = result.error; errEl.classList.remove('hidden'); }
      return;
    }
    App.onAuthSuccess(result.user);
  },

  doRegister() {
    const username = document.getElementById('reg-name')?.value  || '';
    const email    = document.getElementById('reg-email')?.value || '';
    const password = document.getElementById('reg-pass')?.value  || '';
    const errEl    = document.getElementById('reg-err');

    const result = this.register({ username, email, password });
    if (!result.success) {
      if (errEl) { errEl.textContent = result.error; errEl.classList.remove('hidden'); }
      return;
    }

    // Enviar email de bienvenida si tiene email
    if (result.user.email) EmailService.sendWelcome(result.user);

    App.onAuthSuccess(result.user);
  },

  // ─── Privado ────────────────────────────────────

  _validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  },

  /** Codificación simple — NO apta para producción. */
  _hash(str) {
    return btoa(str + this._SALT);
  },

  _safe(u) {
    const { password: _, ...safe } = u;
    return safe;
  },

  _getUsers() {
    try { return JSON.parse(localStorage.getItem(this._K_USERS) || '[]'); }
    catch (e) { return []; }
  },

  _saveUsers(arr) {
    try { localStorage.setItem(this._K_USERS, JSON.stringify(arr)); } catch (e) {}
  },

  _setCurrentId(id) {
    try { localStorage.setItem(this._K_CURRENT, id); } catch (e) {}
  }
};

// ═══════════════════════════════════════════════════
//  EMAIL SERVICE — vía mailto: (abre cliente de correo)
// ═══════════════════════════════════════════════════
const EmailService = {

  /**
   * Email de bienvenida al registrarse.
   * Abre el cliente de correo del dispositivo.
   */
  sendWelcome(user) {
    if (!user.email) return;

    const subject = '¡Bienvenido a DinoPC Explorer! 🦕';
    const body = [
      'Hola ' + user.username + ',',
      '',
      '¡Tu perfil de explorador ha sido creado en DinoPC Explorer!',
      '',
      '▸ Nombre de explorador: ' + user.username,
      '▸ Email registrado: ' + user.email,
      '',
      'DinoPC Explorer es un juego educativo de informática',
      'para aprender sobre archivos, carpetas y sistemas operativos',
      'de forma divertida con dinosaurios jurásicos. 🦖',
      '',
      '¡Buena suerte en las expediciones!',
      '',
      '— DinoPC Explorer Labs'
    ].join('\n');

    this._send(user.email, subject, body);
  },

  /**
   * Notificación al completar una misión.
   * @param {object} user         - Perfil del explorador
   * @param {string} missionTitle - Nombre de la misión completada
   * @param {string} dinoName     - Dinosaurio desbloqueado
   */
  sendMissionComplete(user, missionTitle, dinoName) {
    if (!user.email) return;

    const subject = '🏆 ¡Misión completada! — DinoPC Explorer';
    const body = [
      'Hola ' + user.username + ',',
      '',
      '¡Enhorabuena! Tu explorador ha completado una expedición:',
      '',
      '🏆 Misión completada: ' + missionTitle,
      '🦕 Dinosaurio desbloqueado: ' + dinoName,
      '',
      '¡Sigue explorando el Jurásico!',
      '',
      '— DinoPC Explorer Labs',
      '',
      '---',
      'Este mensaje fue generado automáticamente por DinoPC Explorer.',
      'Todos los datos se guardan localmente en tu dispositivo.'
    ].join('\n');

    this._send(user.email, subject, body);
  },

  /**
   * Abre el cliente de correo con el mensaje pre-rellenado.
   * El usuario debe pulsar "Enviar" en su cliente de correo.
   * @param {string} to
   * @param {string} subject
   * @param {string} body
   */
  _send(to, subject, body) {
    try {
      const a   = document.createElement('a');
      a.href    = 'mailto:' + encodeURIComponent(to) +
                  '?subject=' + encodeURIComponent(subject) +
                  '&body='    + encodeURIComponent(body);
      a.target  = '_blank';
      a.rel     = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.warn('EmailService: no se pudo abrir el cliente de correo.', e);
    }
  }
};
