/* ============================================================
   TRAINERFLOW — ONBOARDING (entrenador nuevo)
   ============================================================ */

const OnboardingPage = {
  _step: 1,

  render() {
    const u = STATE.currentUser;
    return `
    <div class="auth-shell">
      <div class="auth-card" style="max-width:520px">
        <div class="auth-logo">
          <div class="logo-mark">TF</div>
          <div class="logo-text">Trainer<span>Flow</span></div>
        </div>

        ${this._step === 1 ? this._step1(u) : ''}
        ${this._step === 2 ? this._step2() : ''}
        ${this._step === 3 ? this._step3() : ''}

        <div class="onboarding-dots">
          ${[1,2,3].map(n => `<div class="ob-dot ${this._step === n ? 'active' : ''}"></div>`).join('')}
        </div>
      </div>
    </div>`;
  },

  _step1(u) {
    return `
      <div class="success-screen">
        <div class="success-icon">${UTILS.icon('check', 32, 'color:var(--success)')}</div>
        <h2 class="auth-title">¡Bienvenido/a, ${u ? u.name.split(' ')[0] : ''}! 🎉</h2>
        <p class="auth-subtitle mb-6">
          Tu cuenta está lista. Vamos a configurar TrainerFlow en 3 pasos rápidos
          para que empieces a gestionar clientes hoy mismo.
        </p>
        <div class="card-sm mb-6" style="text-align:left">
          ${[
            {icon:'users',           txt:'Añade tu primer cliente'},
            {icon:'dumbbell',        txt:'Crea tu primera rutina'},
            {icon:'clipboard-check', txt:'Empieza a recibir check-ins'}
          ].map(i => `
            <div class="flex items-center gap-3 mb-3">
              <div style="width:32px;height:32px;border-radius:8px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--accent)">
                ${UTILS.icon(i.icon, 15)}
              </div>
              <span class="text-sm">${i.txt}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-accent btn-block btn-lg" onclick="OnboardingPage.next()">
          Empezar configuración ${UTILS.icon('arrow-right', 16)}
        </button>
        <button class="btn btn-ghost btn-sm w-full mt-2" onclick="OnboardingPage.skip()">
          Saltar y explorar solo
        </button>
      </div>`;
  },

  _step2() {
    return `
      <h2 class="auth-title">Añade tu primer cliente</h2>
      <p class="auth-subtitle">Paso 1 de 2 — Siempre puedes añadir más después</p>
      <form id="ob-client-form" onsubmit="OnboardingPage.submitClient(event)">
        <div class="form-group">
          <label class="form-label">Nombre completo <span class="required">*</span></label>
          <input class="form-input" id="ob-client-name" placeholder="Ej: Ana García López">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <div class="input-wrap">
            ${UTILS.icon('mail', 16)}
            <input type="email" class="form-input" id="ob-client-email" placeholder="cliente@email.com">
          </div>
        </div>
        <div class="form-group mb-5">
          <label class="form-label">Objetivo principal</label>
          <select class="form-select" id="ob-client-goal">
            ${CONFIG.goals.map(g => `<option>${g}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-3">
          <button type="button" class="btn btn-outline flex-1" onclick="OnboardingPage.skip()">
            Saltar
          </button>
          <button type="submit" class="btn btn-accent flex-1">
            Añadir cliente ${UTILS.icon('arrow-right', 16)}
          </button>
        </div>
      </form>`;
  },

  _step3() {
    return `
      <h2 class="auth-title">Crea tu primera rutina</h2>
      <p class="auth-subtitle">Paso 2 de 2 — La rutina más sencilla</p>
      <div class="form-group">
        <label class="form-label">Nombre de la rutina</label>
        <input class="form-input" id="ob-routine-name" placeholder="Ej: Full Body Básico">
      </div>
      <div class="form-group mb-5">
        <label class="form-label">Días de entrenamiento</label>
        <div class="day-selector" id="ob-day-selector">
          ${CONFIG.days.map((d, i) => `
            <button type="button" class="day-btn ${i===0||i===2||i===4 ? 'active' : ''}"
                    data-day="${i}" onclick="OnboardingPage.toggleDay(this)">
              ${d}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="card-sm mb-5" style="background:var(--accent-dim);border-color:var(--accent-glow)">
        <div class="text-xs text-accent font-semibold mb-1">💡 Tip</div>
        <div class="text-xs text-muted">Puedes personalizar los ejercicios en detalle desde el módulo Rutinas.</div>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-outline flex-1" onclick="OnboardingPage.skip()">
          Saltar
        </button>
        <button class="btn btn-accent flex-1" onclick="OnboardingPage.submitRoutine()">
          Crear y entrar al panel ${UTILS.icon('arrow-right', 16)}
        </button>
      </div>`;
  },

  next() {
    this._step++;
    APP.renderCurrentView();
  },

  skip() {
    this._step = 1;
    TOAST.info('Puedes configurar todo desde el panel principal.');
    APP.navigate('dashboard');
  },

  toggleDay(btn) {
    btn.classList.toggle('active');
  },

  submitClient(e) {
    e.preventDefault();
    const name  = document.getElementById('ob-client-name')?.value.trim();
    const email = document.getElementById('ob-client-email')?.value.trim();
    const goal  = document.getElementById('ob-client-goal')?.value;

    if (!name) { TOAST.error('El nombre es obligatorio.'); return; }

    const res = ClientService.create({ name, email, goal, currentWeight: 0, startWeight: 0, goalWeight: 0 });
    if (res.ok) {
      TOAST.success(`¡${name} añadido/a como cliente! 🎉`);
      this._step = 3;
      APP.renderCurrentView();
    } else {
      TOAST.error(res.error);
    }
  },

  submitRoutine() {
    const name = document.getElementById('ob-routine-name')?.value.trim() || 'Mi primera rutina';
    const activeDays = [...document.querySelectorAll('#ob-day-selector .day-btn.active')]
      .map(b => parseInt(b.dataset.day));

    RoutineService.create({ name, days: activeDays, status: 'active' });
    TOAST.success('¡Rutina creada! Ya puedes añadir ejercicios.');
    this._step = 1;
    APP.navigate('dashboard');
  },

  afterRender() {
    UTILS.initIcons();
  }
};
