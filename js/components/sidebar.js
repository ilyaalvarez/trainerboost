/* ============================================================
   TRAINERFLOW — SIDEBAR COMPONENT
   ============================================================ */

const SIDEBAR = {

  render() {
    const u = STATE.currentUser;
    if (!u) return '';

    const unreadNotifs = DATA.notifications.filter(n => !n.read).length;
    const unreadMsgs   = DATA.messages.reduce((s, c) => s + (c.unread || 0), 0);

    const nav = [
      { id:'dashboard', label:'Dashboard',    icon:'layout-dashboard' },
      { id:'clients',   label:'Clientes',     icon:'users',        badge: DATA.clients.filter(c=>c.trainerId===u.id&&c.status==='active').length },
      { id:'routines',  label:'Rutinas',      icon:'dumbbell' },
      { id:'checkins',  label:'Check-ins',    icon:'clipboard-check' },
      { id:'messages',  label:'Mensajes',     icon:'message-circle', badge: unreadMsgs || null },
      { id:'analytics', label:'Analytics',   icon:'bar-chart-2' },
      { id:'billing',   label:'Facturación', icon:'credit-card' },
      { id:'settings',  label:'Ajustes',     icon:'settings' }
    ];

    const plan = CONFIG.plans[u.plan];
    const collapsed = STATE.sidebarCollapsed;

    return `
    <aside class="sidebar ${collapsed ? 'collapsed' : ''}" id="app-sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">TF</div>
        <div class="logo-text">Trainer<span>Flow</span></div>
      </div>

      <nav class="nav-scroll">
        <div class="nav-section">
          ${nav.map(item => `
            <div class="nav-item ${STATE.currentView === item.id ? 'active' : ''}"
                 data-view="${item.id}" onclick="APP.navigate('${item.id}')">
              ${UTILS.icon(item.icon, 18)}
              <span class="nav-item-label">${item.label}</span>
              ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user" onclick="APP.navigate('settings')">
          <div class="user-avatar avatar-${u.avatar}">${UTILS.initials(u.name)}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${UTILS.truncate(u.name, 20)}</div>
            <div class="sidebar-user-plan">
              <span class="plan-badge ${u.plan}">${plan.badge}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
    `;
  },

  toggle() {
    STATE.sidebarCollapsed = !STATE.sidebarCollapsed;
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed', STATE.sidebarCollapsed);
  },

  setActive(view) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });
  }
};
