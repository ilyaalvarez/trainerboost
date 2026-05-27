/* ============================================================
   TRAINERFLOW — AJUSTES
   ============================================================ */

const SettingsPage = {
  _tab: 'perfil',

  render() {
    const u = STATE.currentUser;
    return `
    <div id="settings-view" class="animate-in">
      <div class="page-header">
        <div>
          <div class="page-title">Ajustes</div>
          <div class="page-subtitle">Personaliza tu cuenta y preferencias</div>
        </div>
      </div>

      <div class="tabs mb-5" style="max-width:500px">
        ${['perfil','notificaciones','apariencia','integraciones'].map(t => `
          <button class="tab-btn ${this._tab===t?'active':''}"
                  onclick="SettingsPage.setTab('${t}')">
            ${t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        `).join('')}
      </div>

      <div id="settings-tab-content">
        ${this._renderTab(u)}
      </div>
    </div>`;
  },

  _renderTab(u) {
    switch (this._tab) {
      case 'perfil':         return this._tabPerfil(u);
      case 'notificaciones': return this._tabNotificaciones();
      case 'apariencia':     return this._tabApariencia();
      case 'integraciones':  return this._tabIntegraciones();
      default: return this._tabPerfil(u);
    }
  },

  _tabPerfil(u) {
    return `
    <div class="grid-2 gap-5">
      <div class="card">
        <div class="card-title mb-4">Datos personales</div>
        <div class="flex items-center gap-4 mb-5">
          <div class="avatar avatar-xl avatar-${u?.avatar||0}">${UTILS.initials(u?.name||'?')}</div>
          <div>
            <div class="font-bold mb-1">${UTILS.esc(u?.name || '')}</div>
            <div class="text-xs text-muted mb-2">${UTILS.esc(u?.email || '')}</div>
            <button class="btn btn-outline btn-sm" onclick="SettingsPage._changeAvatar()">
              ${UTILS.icon('user', 13)} Cambiar avatar
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input class="form-input" id="s-name" value="${UTILS.esc(u?.name||'')}">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="s-email" value="${UTILS.esc(u?.email||'')}">
        </div>
        <div class="form-group">
          <label class="form-label">Especialidad</label>
          <select class="form-select" id="s-specialty">
            ${CONFIG.specialties.map(s => `<option ${u?.specialty===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ciudad</label>
          <div class="input-wrap">
            ${UTILS.icon('map-pin', 14)}
            <input class="form-input" id="s-city" value="${UTILS.esc(u?.city||'')}" placeholder="Tu ciudad">
          </div>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Bio pública</label>
          <textarea class="form-textarea" id="s-bio" style="min-height:80px"
                    placeholder="Cuéntales a tus clientes sobre ti...">${UTILS.esc(u?.bio||'')}</textarea>
        </div>
        <button class="btn btn-accent btn-sm mt-4" onclick="SettingsPage.saveProfile()">
          ${UTILS.icon('save', 13)} Guardar cambios
        </button>
      </div>

      <div>
        <div class="card mb-4">
          <div class="card-title mb-4">Seguridad</div>
          <div class="flex flex-col gap-3">
            <button class="btn btn-outline btn-sm justify-start" onclick="SettingsPage.changePassword()">
              ${UTILS.icon('lock', 14)} Cambiar contraseña
            </button>
            <button class="btn btn-outline btn-sm justify-start" onclick="SettingsPage.exportData()">
              ${UTILS.icon('download', 14)} Exportar mis datos (RGPD)
            </button>
            <button class="btn btn-danger btn-sm justify-start" onclick="SettingsPage.deleteAccount()">
              ${UTILS.icon('trash-2', 14)} Eliminar cuenta
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-title mb-4">Sesión actual</div>
          <div class="text-sm text-muted mb-4">
            <div class="mb-2">Conectado como: <strong class="text-accent">${UTILS.esc(u?.name||'')}</strong></div>
            <div class="mb-2">Rol: <strong>${u?.role === 'trainer' ? 'Entrenador' : 'Cliente'}</strong></div>
            <div>Plan: <span class="plan-badge ${u?.plan}">${CONFIG.plans[u?.plan||'free'].badge}</span></div>
          </div>
          <button class="btn btn-outline btn-sm w-full" onclick="AuthService.logout()">
            ${UTILS.icon('log-out', 13)} Cerrar sesión
          </button>
        </div>
      </div>
    </div>`;
  },

  _tabNotificaciones() {
    const notifs = [
      { id:'checkin',  label:'Check-in recibido',     sub:'Notificación inmediata',   on:true },
      { id:'message',  label:'Mensaje nuevo',          sub:'Email + notificación',     on:true },
      { id:'alert',    label:'Alerta de bienestar',    sub:'Energía o sueño bajo',     on:true },
      { id:'weekly',   label:'Resumen semanal',        sub:'Cada lunes a las 9:00',    on:false },
      { id:'inactive', label:'Cliente inactivo',       sub:'+7 días sin check-in',     on:true },
      { id:'billing',  label:'Avisos de facturación',  sub:'Días antes del cargo',     on:true }
    ];
    return `
    <div class="card" style="max-width:600px">
      <div class="card-title mb-4">Preferencias de notificaciones</div>
      <div class="flex flex-col gap-0">
        ${notifs.map(n => `
          <div class="flex items-center justify-between py-4 border-b" style="border-color:var(--border)">
            <div>
              <div class="font-semibold text-sm">${n.label}</div>
              <div class="text-xs text-muted">${n.sub}</div>
            </div>
            <div class="switch ${n.on?'on':''}" id="sw-${n.id}" onclick="SettingsPage.toggleSwitch('${n.id}')">
              <div class="switch-track"></div>
              <div class="switch-thumb"></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="mt-4 text-xs text-muted">
        Las notificaciones push requieren permisos del navegador.
        <a href="#" class="text-accent">Gestionar permisos →</a>
      </div>
    </div>`;
  },

  _tabApariencia() {
    const accentColors = [
      { name:'Electric Green', val:'#00FF87', cls:'accent' },
      { name:'Blue',           val:'#3B82F6', cls:'info' },
      { name:'Purple',         val:'#a855f7', cls:'' },
      { name:'Orange',         val:'#f97316', cls:'' },
      { name:'Pink',           val:'#ec4899', cls:'' }
    ];
    return `
    <div class="card" style="max-width:500px">
      <div class="card-title mb-5">Personalización</div>

      <div class="form-group mb-5">
        <label class="form-label">Color de acento</label>
        <div class="flex gap-3 mt-2">
          ${accentColors.map(c => `
            <div style="width:36px;height:36px;border-radius:50%;background:${c.val};cursor:pointer;border:2px solid transparent;transition:all 0.15s;${c.val==='#00FF87'?'border-color:white;box-shadow:0 0 12px '+c.val:''};"
                 title="${c.name}"
                 onclick="SettingsPage.setAccent('${c.val}')"></div>
          `).join('')}
        </div>
      </div>

      <div class="form-group mb-5">
        <label class="form-label">Tamaño de fuente</label>
        <div class="toggle-wrap" style="max-width:240px">
          ${['Pequeño','Normal','Grande'].map(s => `
            <button class="toggle-option ${s==='Normal'?'active':''}"
                    onclick="SettingsPage.setFontSize('${s}')">
              ${s}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="card-sm" style="background:var(--accent-dim);border-color:var(--accent-glow)">
        <div class="text-xs text-accent font-semibold mb-1">🎨 Tema oscuro</div>
        <div class="text-xs text-muted">TrainerFlow está optimizado para el tema oscuro. Tema claro disponible próximamente.</div>
      </div>
    </div>`;
  },

  _tabIntegraciones() {
    const integrations = [
      { name:'WhatsApp Business', desc:'Envía recordatorios automáticos a tus clientes', icon:'message-circle', status: STATE.currentUser?.plan === 'pro' ? 'available' : 'pro' },
      { name:'Google Calendar',   desc:'Sincroniza tus sesiones con Google Calendar',    icon:'calendar',       status: 'soon' },
      { name:'Stripe',            desc:'Cobra a tus clientes directamente desde TrainerFlow', icon:'credit-card', status: 'soon' },
      { name:'Notion',            desc:'Exporta rutinas y check-ins a Notion',           icon:'file-text',     status: 'soon' }
    ];
    return `
    <div class="grid-2 gap-4" style="max-width:800px">
      ${integrations.map(int => `
        <div class="card flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div style="width:44px;height:44px;border-radius:var(--radius-sm);background:var(--surface-2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              ${UTILS.icon(int.icon, 22, 'color:var(--accent)')}
            </div>
            <div>
              <div class="font-bold text-sm">${int.name}</div>
              <div class="text-xs text-muted">${int.desc}</div>
            </div>
          </div>
          ${int.status === 'available' ? `
            <button class="btn btn-accent btn-sm" onclick="SettingsPage.connectIntegration('${int.name}')">
              ${UTILS.icon('link', 13)} Conectar
            </button>` : int.status === 'pro' ? `
            <div class="flex items-center gap-2">
              <span class="badge badge-info text-xs">Requiere Plan Pro</span>
              <button class="btn btn-accent btn-sm" onclick="APP.navigate('billing')">Actualizar</button>
            </div>` : `
            <span class="badge badge-neutral text-xs">${UTILS.icon('clock',10)} Próximamente</span>`}
        </div>
      `).join('')}
    </div>`;
  },

  setTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.trim().toLowerCase() === tab);
    });
    const u = STATE.currentUser;
    const content = document.getElementById('settings-tab-content');
    if (content) {
      content.innerHTML = this._renderTab(u);
      UTILS.initIcons();
    }
  },

  saveProfile() {
    const name      = document.getElementById('s-name')?.value.trim();
    const email     = document.getElementById('s-email')?.value.trim();
    const specialty = document.getElementById('s-specialty')?.value;
    const city      = document.getElementById('s-city')?.value.trim();
    const bio       = document.getElementById('s-bio')?.value;

    if (!name) { TOAST.error('El nombre no puede estar vacío.'); return; }
    if (!UTILS.isEmail(email)) { TOAST.error('Email no válido.'); return; }

    AuthService.updateProfile({ name, email, specialty, city, bio });
    TOAST.success('Perfil actualizado correctamente ✓');
    // Re-render sidebar para actualizar el nombre
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.outerHTML = SIDEBAR.render();
    UTILS.initIcons();
  },

  toggleSwitch(id) {
    const sw = document.getElementById(`sw-${id}`);
    if (sw) sw.classList.toggle('on');
  },

  setAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-dim', `${color}1A`);
    TOAST.success('Color de acento actualizado ✓');
  },

  setFontSize(size) {
    const map = { 'Pequeño': '13px', 'Normal': '14px', 'Grande': '16px' };
    document.documentElement.style.setProperty('--text-base', map[size] || '14px');
    document.querySelectorAll('.toggle-option').forEach(b => b.classList.toggle('active', b.textContent.trim() === size));
    TOAST.success(`Tamaño de fuente: ${size}`);
  },

  changePassword() {
    MODAL.open({
      title: 'Cambiar contraseña',
      body: `
        <div class="form-group"><label class="form-label">Contraseña actual</label>
          <input type="password" class="form-input" id="cp-old" placeholder="••••••••"></div>
        <div class="form-group"><label class="form-label">Nueva contraseña</label>
          <input type="password" class="form-input" id="cp-new" placeholder="Mín. 6 caracteres"></div>
        <div class="form-group mb-0"><label class="form-label">Confirmar nueva</label>
          <input type="password" class="form-input" id="cp-confirm" placeholder="Repite la contraseña"></div>`,
      footer: `
        <button class="btn btn-outline" onclick="MODAL.close()">Cancelar</button>
        <button class="btn btn-accent" onclick="SettingsPage._savePassword()">Cambiar contraseña</button>`
    });
  },

  _savePassword() {
    const oldP = document.getElementById('cp-old')?.value;
    const newP = document.getElementById('cp-new')?.value;
    const conf = document.getElementById('cp-confirm')?.value;
    if (!oldP) { TOAST.error('Introduce tu contraseña actual.'); return; }
    if (!UTILS.isStrongPassword(newP)) { TOAST.error('La nueva contraseña debe tener mín. 6 caracteres.'); return; }
    if (newP !== conf) { TOAST.error('Las contraseñas no coinciden.'); return; }
    MODAL.close();
    TOAST.success('Contraseña cambiada correctamente ✓');
  },

  exportData() {
    TOAST.success('Exportación RGPD iniciada. Recibirás el archivo por email en 24h.');
  },

  deleteAccount() {
    MODAL.confirm({
      title: '¿Eliminar cuenta?',
      message: 'Esta acción es irreversible. Se eliminarán todos tus datos, clientes y rutinas permanentemente.',
      confirmLabel: 'Sí, eliminar todo',
      cancelLabel: 'Cancelar',
      danger: true,
      onConfirm: () => {
        AuthService.logout();
        TOAST.error('Cuenta eliminada. Esperamos verte de nuevo pronto.');
      }
    });
  },

  connectIntegration(name) {
    TOAST.info(`Conectando con ${name}... Redirigiendo al proceso de autorización.`);
  },

  _changeAvatar() {
    TOAST.info('Selector de avatar disponible próximamente.');
  },

  afterRender() {
    UTILS.initIcons();
  }
};
