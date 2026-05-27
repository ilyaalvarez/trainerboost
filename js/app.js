/* ============================================================
   TRAINERFLOW — APP ROUTER & INIT
   ============================================================ */

const APP = {

  /* ── VIEW MAP ─────────────────────────────────────────── */
  _trainerViews: {
    dashboard:    DashboardPage,
    clients:      ClientsPage,
    routines:     RoutinesPage,
    checkins:     CheckinsPage,
    messages:     MessagesPage,
    analytics:    AnalyticsPage,
    billing:      BillingPage,
    settings:     SettingsPage,
  },

  /* ── NAVIGATE ─────────────────────────────────────────── */
  navigate(view) {
    STATE.currentView = view;
    this.renderCurrentView();
    // Scroll to top
    const main = document.querySelector('.content-area') || document.querySelector('.main-area');
    if (main) main.scrollTop = 0;
  },

  /* ── RENDER ───────────────────────────────────────────── */
  renderCurrentView() {
    const u = STATE.currentUser;

    // ── Not logged in: show landing or auth
    if (!u) {
      const v = STATE.currentView;
      if (v === 'register') {
        this._renderFullPage(AuthPage.renderRegister());
      } else if (v === 'login') {
        this._renderFullPage(AuthPage.renderLogin());
      } else {
        this._renderFullPage(LandingPage.render());
        LandingPage.afterRender?.();
      }
      return;
    }

    // ── Client portal
    if (u.role === 'client') {
      this._renderFullPage(PortalPage.render());
      PortalPage.afterRender?.();
      return;
    }

    // ── Trainer: onboarding (full-page, no shell)
    if (STATE.currentView === 'onboarding') {
      this._renderFullPage(OnboardingPage.render());
      OnboardingPage.afterRender?.();
      return;
    }

    // ── Trainer: main app shell
    const view   = STATE.currentView || 'dashboard';
    const page   = this._trainerViews[view];

    this._renderAppShell();

    const contentEl = document.getElementById('main-content');
    if (!contentEl) return;

    if (page) {
      contentEl.innerHTML = page.render();
      page.afterRender?.();
    } else {
      contentEl.innerHTML = `
        <div class="flex items-center justify-center" style="height:60vh;flex-direction:column;gap:12px">
          ${UTILS.icon('alert-circle', 40, 'color:var(--text-muted)')}
          <div class="text-muted">Vista no encontrada: ${UTILS.esc(view)}</div>
          <button class="btn btn-outline btn-sm" onclick="APP.navigate('dashboard')">Ir al inicio</button>
        </div>`;
    }

    // Sync sidebar active state
    SIDEBAR.setActive(view);
  },

  /* ── SHELL ────────────────────────────────────────────── */
  _renderAppShell() {
    const root = document.getElementById('app-root');
    if (!root) return;

    // If shell already exists, only update dynamic parts
    if (document.getElementById('main-content')) {
      // Update sidebar & topbar in place
      const sidebarEl = document.getElementById('app-sidebar');
      if (sidebarEl) sidebarEl.outerHTML = SIDEBAR.render();

      const topbarEl  = document.getElementById('app-topbar');
      if (topbarEl)  topbarEl.outerHTML  = this._renderTopbar();

      UTILS.initIcons();
      return;
    }

    root.innerHTML = `
      <div class="app-shell">
        <!-- Sidebar -->
        ${SIDEBAR.render()}

        <!-- Main area -->
        <div class="main-area">
          <!-- Topbar -->
          ${this._renderTopbar()}

          <!-- Content -->
          <main class="content-area" id="main-content"></main>
        </div>
      </div>`;

    UTILS.initIcons();
  },

  _renderTopbar() {
    const u = STATE.currentUser;
    const unread = NOTIF.unreadCount();
    const viewLabels = {
      dashboard: 'Panel',
      clients:   'Clientes',
      routines:  'Rutinas',
      checkins:  'Check-ins',
      messages:  'Mensajes',
      analytics: 'Analytics',
      billing:   'Facturación',
      settings:  'Ajustes',
    };

    return `
    <div class="topbar" id="app-topbar">
      <button class="btn btn-ghost btn-icon" id="sidebar-toggle-btn"
              onclick="SIDEBAR.toggle()" title="Colapsar menú">
        ${UTILS.icon('menu', 18)}
      </button>

      <div class="topbar-title">
        ${viewLabels[STATE.currentView] || 'TrainerFlow'}
      </div>

      <div class="topbar-right">
        <!-- Notifications -->
        <div style="position:relative">
          <button class="btn btn-ghost btn-icon" onclick="NOTIF.toggle()" id="notif-btn" title="Notificaciones">
            ${UTILS.icon('bell', 17)}
            ${unread > 0 ? `<span class="notif-badge">${unread}</span>` : ''}
          </button>
        </div>

        <!-- User menu -->
        <div class="flex items-center gap-2" style="cursor:pointer" onclick="APP.navigate('settings')">
          <div class="avatar avatar-${u?.avatar||0}" style="width:32px;height:32px;font-size:11px">
            ${UTILS.initials(u?.name||'?')}
          </div>
          <div class="hidden-mobile">
            <div class="text-sm font-semibold leading-none">${UTILS.esc(u?.name?.split(' ')[0]||'')}</div>
            <div class="text-xs text-muted">${u?.plan ? CONFIG.plans[u.plan]?.badge : ''}</div>
          </div>
        </div>
      </div>
    </div>`;
  },

  /* ── FULL PAGE ────────────────────────────────────────── */
  _renderFullPage(html) {
    const root = document.getElementById('app-root');
    if (root) root.innerHTML = html;
    UTILS.initIcons();
  },

  /* ── INIT ─────────────────────────────────────────────── */
  init() {
    // Initialize Chart.js defaults
    CHARTS.init();

    // Restore session from localStorage
    AuthService.restoreSession();

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      APP.renderCurrentView();
    });

    // Global keyboard shortcut: ESC closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') MODAL.close();
    });

    // Render initial view
    this.renderCurrentView();
  }
};

/* ── BOOT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  APP.init();
});
