/* ============================================================
   TRAINERFLOW — VISTAS DE AUTENTICACIÓN
   Login, Register (4 pasos), Plan Select
   ============================================================ */

const AuthPage = {

  /* ════════════════════════════
     LOGIN
  ════════════════════════════ */
  renderLogin() {
    return `
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-mark">TF</div>
          <div class="logo-text">Trainer<span>Flow</span></div>
        </div>
        <h1 class="auth-title">Bienvenido de vuelta</h1>
        <p class="auth-subtitle">Inicia sesión en tu cuenta</p>

        <form id="login-form" onsubmit="AuthPage.submitLogin(event)">
          <div class="form-group">
            <label class="form-label">Email <span class="required">*</span></label>
            <div class="input-wrap">
              ${UTILS.icon('mail', 16)}
              <input type="email" id="login-email" class="form-input" placeholder="tu@email.com" autocomplete="email">
            </div>
          </div>
          <div class="form-group mb-5">
            <label class="form-label">Contraseña <span class="required">*</span></label>
            <div class="input-wrap">
              ${UTILS.icon('lock', 16)}
              <input type="password" id="login-pass" class="form-input" placeholder="••••••••" autocomplete="current-password">
            </div>
          </div>
          <div id="login-error" class="form-error mb-3" style="display:none">
            ${UTILS.icon('alert-circle', 14)} <span id="login-error-text"></span>
          </div>
          <button type="submit" class="btn btn-accent btn-block btn-lg" id="login-submit-btn">
            Iniciar sesión
          </button>
        </form>

        <div style="display:flex;justify-content:center;margin-top:var(--space-3)">
          <button class="btn btn-ghost btn-sm" onclick="AuthPage._forgotPassword()">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div class="demo-btn-wrap">
          <div class="demo-hint">¿Solo quieres explorar?</div>
          <div class="flex gap-2 justify-center">
            <button class="btn btn-outline btn-sm" onclick="AuthPage.demoTrainer()">
              ${UTILS.icon('user', 14)} Demo entrenador
            </button>
            <button class="btn btn-outline btn-sm" onclick="AuthPage.demoClient()">
              ${UTILS.icon('user-check', 14)} Demo cliente
            </button>
          </div>
        </div>

        <div class="auth-footer-link">
          ¿No tienes cuenta? <a onclick="APP.navigate('register')" style="cursor:pointer">Regístrate gratis</a>
        </div>
      </div>
    </div>`;
  },

  submitLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');
    const errTx = document.getElementById('login-error-text');
    const btn   = document.getElementById('login-submit-btn');

    errEl.style.display = 'none';
    btn.classList.add('loading');
    btn.textContent = 'Entrando...';

    setTimeout(() => {
      const res = AuthService.login(email, pass);
      btn.classList.remove('loading');
      btn.innerHTML = 'Iniciar sesión';

      if (!res.ok) {
        errEl.style.display = 'flex';
        errTx.textContent = res.error;
        return;
      }

      if (res.user.role === 'client') {
        APP.navigate('portal');
      } else {
        APP.navigate('dashboard');
      }
      TOAST.success(`¡Hola de nuevo, ${res.user.name.split(' ')[0]}! 👋`);
    }, 400);
  },

  demoTrainer() {
    const res = AuthService.demoLogin();
    if (res.ok) {
      TOAST.success('Demo del entrenador cargada 💪');
      APP.navigate('dashboard');
    }
  },

  demoClient() {
    const res = AuthService.demoClientLogin();
    if (res.ok) {
      TOAST.success('Demo del cliente cargada 🏃');
      APP.navigate('portal');
    }
  },

  _forgotPassword() {
    TOAST.info('Email de recuperación enviado a tu correo.');
  },

  /* ════════════════════════════
     REGISTER — 4 PASOS
  ════════════════════════════ */
  _regData: { step: 1, name:'', email:'', password:'', plan:'starter', specialty:'', city:'' },

  renderRegister() {
    const s = this._regData;
    return `
    <div class="auth-shell">
      <div class="auth-card" style="max-width:500px">
        <div class="auth-logo">
          <div class="logo-mark">TF</div>
          <div class="logo-text">Trainer<span>Flow</span></div>
        </div>

        <!-- Step indicator -->
        <div class="step-indicator mb-6">
          ${[1,2,3,4].map(n => `
            <div class="step-dot ${n < s.step ? 'done' : n === s.step ? 'active' : ''}">
              ${n < s.step ? UTILS.icon('check', 12) : n}
            </div>
            ${n < 4 ? `<div class="step-line ${n < s.step ? 'done' : ''}"></div>` : ''}
          `).join('')}
        </div>

        ${s.step === 1 ? this._regStep1() : ''}
        ${s.step === 2 ? this._regStep2() : ''}
        ${s.step === 3 ? this._regStep3() : ''}
        ${s.step === 4 ? this._regStep4() : ''}

        ${s.step === 1 ? `
          <div class="auth-footer-link mt-4">
            ¿Ya tienes cuenta? <a onclick="APP.navigate('login')" style="cursor:pointer">Inicia sesión</a>
          </div>` : ''}
      </div>
    </div>`;
  },

  _regStep1() {
    return `
      <h2 class="auth-title">Crea tu cuenta</h2>
      <p class="auth-subtitle">Paso 1 de 4 — Datos de acceso</p>
      <form id="reg-form-1" onsubmit="AuthPage.regNext1(event)">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre <span class="required">*</span></label>
            <input class="form-input" id="reg-name" placeholder="Tu nombre completo"
                   value="${UTILS.esc(this._regData.name)}" autocomplete="name">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email <span class="required">*</span></label>
          <div class="input-wrap">
            ${UTILS.icon('mail', 16)}
            <input type="email" class="form-input" id="reg-email"
                   placeholder="tu@email.com" value="${UTILS.esc(this._regData.email)}" autocomplete="email">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña <span class="required">*</span></label>
          <div class="input-wrap">
            ${UTILS.icon('lock', 16)}
            <input type="password" class="form-input" id="reg-pass" placeholder="Mín. 6 caracteres">
          </div>
        </div>
        <div class="form-group mb-5">
          <label class="form-label">Confirmar contraseña <span class="required">*</span></label>
          <div class="input-wrap">
            ${UTILS.icon('lock', 16)}
            <input type="password" class="form-input" id="reg-pass2" placeholder="Repite la contraseña">
          </div>
        </div>
        <div id="reg-error-1" class="form-error mb-3" style="display:none">
          ${UTILS.icon('alert-circle', 14)} <span id="reg-err-1-txt"></span>
        </div>
        <button type="submit" class="btn btn-accent btn-block btn-lg">
          Continuar ${UTILS.icon('arrow-right', 16)}
        </button>
      </form>`;
  },

  _regStep2() {
    const plans = [
      { id:'free',    name:'FREE',    price:'Gratis',  clients:'3 clientes', highlight:false },
      { id:'starter', name:'STARTER', price:'14€/mes', clients:'20 clientes', highlight:true },
      { id:'pro',     name:'PRO',     price:'29€/mes', clients:'Ilimitados',  highlight:false }
    ];
    return `
      <h2 class="auth-title">Elige tu plan</h2>
      <p class="auth-subtitle">Paso 2 de 4 — Puedes cambiar en cualquier momento</p>
      <div class="plan-grid" id="plan-grid">
        ${plans.map(p => `
          <div class="plan-option ${p.highlight ? 'featured-opt' : ''} ${this._regData.plan === p.id ? 'selected' : ''}"
               onclick="AuthPage.selectPlan('${p.id}')">
            <div class="plan-option-name">${p.name}</div>
            <div class="plan-option-price">${p.price}</div>
            <div class="plan-option-period">${p.clients}</div>
          </div>
        `).join('')}
      </div>
      <div class="flex gap-3 mt-5">
        <button class="btn btn-outline flex-1" onclick="AuthPage.regBack()">Atrás</button>
        <button class="btn btn-accent flex-1" onclick="AuthPage.regNext2()">
          Continuar ${UTILS.icon('arrow-right', 16)}
        </button>
      </div>`;
  },

  _regStep3() {
    const isPaid = this._regData.plan !== 'free';
    if (!isPaid) {
      // Plan gratis, saltamos facturación
      setTimeout(() => { this._regData.step = 4; APP.renderCurrentView(); }, 100);
      return `<div class="text-center text-muted">Redirigiendo...</div>`;
    }
    return `
      <h2 class="auth-title">Datos de pago</h2>
      <p class="auth-subtitle">Paso 3 de 4 — Simulación segura (demo)</p>
      <div class="form-group">
        <label class="form-label">Número de tarjeta</label>
        <div class="input-wrap">
          ${UTILS.icon('credit-card', 16)}
          <input class="form-input card-number-input" id="card-num" maxlength="19"
                 placeholder="1234 5678 9012 3456"
                 oninput="this.value=UTILS.formatCard(this.value)">
        </div>
      </div>
      <div class="card-form-row">
        <div class="form-group">
          <label class="form-label">Caducidad</label>
          <input class="form-input" id="card-exp" maxlength="5" placeholder="MM/AA"
                 oninput="this.value=UTILS.formatExpiry(this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">CVV</label>
          <input class="form-input" id="card-cvv" maxlength="4" placeholder="123"
                 oninput="this.value=this.value.replace(/\D/g,'').slice(0,4)">
        </div>
      </div>
      <div class="card-sm mb-5" style="background:var(--accent-dim);border-color:var(--accent-glow)">
        <div class="text-xs text-accent font-semibold mb-1">🔒 Pago 100% seguro</div>
        <div class="text-xs text-muted">Esta es una demo. No se realizará ningún cargo real.</div>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-outline flex-1" onclick="AuthPage.regBack()">Atrás</button>
        <button class="btn btn-accent flex-1" onclick="AuthPage.regNext3()">
          Confirmar ${UTILS.icon('check', 16)}
        </button>
      </div>`;
  },

  _regStep4() {
    return `
      <h2 class="auth-title">Configura tu perfil</h2>
      <p class="auth-subtitle">Paso 4 de 4 — Cuéntanos sobre ti</p>
      <div class="form-group">
        <label class="form-label">Especialidad principal</label>
        <select class="form-select" id="reg-specialty">
          <option value="">Selecciona tu especialidad</option>
          ${CONFIG.specialties.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group mb-5">
        <label class="form-label">Ciudad</label>
        <div class="input-wrap">
          ${UTILS.icon('map-pin', 16)}
          <input class="form-input" id="reg-city" placeholder="Tu ciudad">
        </div>
      </div>
      <button class="btn btn-accent btn-block btn-lg" onclick="AuthPage.regFinish()">
        ${UTILS.icon('rocket', 16)} ¡Listo! Ir a mi panel
      </button>`;
  },

  regNext1(e) {
    e && e.preventDefault();
    const name  = document.getElementById('reg-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const pass  = document.getElementById('reg-pass')?.value;
    const pass2 = document.getElementById('reg-pass2')?.value;
    const errEl = document.getElementById('reg-error-1');
    const errTx = document.getElementById('reg-err-1-txt');

    const showErr = (msg) => {
      errEl.style.display = 'flex';
      errTx.textContent = msg;
    };

    if (!name || name.length < 2)       { showErr('El nombre debe tener al menos 2 caracteres.'); return; }
    if (!UTILS.isEmail(email))           { showErr('Email no válido.'); return; }
    if (!UTILS.isStrongPassword(pass))   { showErr('La contraseña debe tener mínimo 6 caracteres.'); return; }
    if (pass !== pass2)                  { showErr('Las contraseñas no coinciden.'); return; }

    // Check email único
    if (DATA.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      showErr('Ya existe una cuenta con ese email. ¿Quieres iniciar sesión?'); return;
    }

    this._regData = { ...this._regData, name, email, password: pass, step: 2 };
    APP.renderCurrentView();
  },

  selectPlan(planId) {
    this._regData.plan = planId;
    document.querySelectorAll('.plan-option').forEach(el => {
      el.classList.toggle('selected', el.onclick?.toString().includes(planId));
    });
    // Re-render
    const grid = document.getElementById('plan-grid');
    if (grid) {
      const plans = [
        { id:'free', name:'FREE', price:'Gratis', clients:'3 clientes', highlight:false },
        { id:'starter', name:'STARTER', price:'14€/mes', clients:'20 clientes', highlight:true },
        { id:'pro', name:'PRO', price:'29€/mes', clients:'Ilimitados', highlight:false }
      ];
      grid.innerHTML = plans.map(p => `
        <div class="plan-option ${p.highlight ? 'featured-opt' : ''} ${this._regData.plan === p.id ? 'selected' : ''}"
             onclick="AuthPage.selectPlan('${p.id}')">
          <div class="plan-option-name">${p.name}</div>
          <div class="plan-option-price">${p.price}</div>
          <div class="plan-option-period">${p.clients}</div>
        </div>
      `).join('');
    }
  },

  regNext2() {
    this._regData.step = this._regData.plan === 'free' ? 4 : 3;
    APP.renderCurrentView();
  },

  regNext3() {
    const num = document.getElementById('card-num')?.value.replace(/\s/g,'');
    const exp = document.getElementById('card-exp')?.value;
    const cvv = document.getElementById('card-cvv')?.value;

    if (!num || num.length < 15) { TOAST.error('Número de tarjeta inválido.'); return; }
    if (!exp || exp.length < 5)  { TOAST.error('Fecha de caducidad inválida.'); return; }
    if (!cvv || cvv.length < 3)  { TOAST.error('CVV inválido.'); return; }

    TOAST.success('Pago procesado correctamente ✓');
    this._regData.step = 4;
    APP.renderCurrentView();
  },

  regBack() {
    this._regData.step = Math.max(1, this._regData.step - 1);
    APP.renderCurrentView();
  },

  regFinish() {
    const specialty = document.getElementById('reg-specialty')?.value || '';
    const city      = document.getElementById('reg-city')?.value.trim() || '';

    const res = AuthService.register({
      name: this._regData.name,
      email: this._regData.email,
      password: this._regData.password,
      plan: this._regData.plan,
      specialty, city
    });

    if (!res.ok) { TOAST.error(res.error); return; }

    this._regData = { step: 1, name:'', email:'', password:'', plan:'starter', specialty:'', city:'' };
    TOAST.success(`¡Cuenta creada! Bienvenido/a, ${res.user.name.split(' ')[0]} 🎉`);
    APP.navigate('onboarding');
  }
};
