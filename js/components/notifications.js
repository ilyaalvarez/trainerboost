/* ============================================================
   TRAINERFLOW — SISTEMA DE NOTIFICACIONES
   ============================================================ */

const NOTIF = {

  /* ── Dropdown HTML ── */
  renderDropdown() {
    const unread = DATA.notifications.filter(n => !n.read);
    const all    = DATA.notifications.slice(0, 10);

    return `
    <div class="notif-dropdown" id="notif-dropdown">
      <div class="notif-dropdown-header">
        <span class="font-semibold text-sm">Notificaciones</span>
        <div class="flex gap-2 items-center">
          ${unread.length ? `<span class="badge badge-accent">${unread.length} nuevas</span>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="NOTIF.markAllRead()">Marcar leídas</button>
        </div>
      </div>
      <div class="notif-list">
        ${all.length ? all.map(n => this._renderItem(n)).join('') : `
          <div class="text-center text-muted text-sm" style="padding:var(--space-8)">
            ${UTILS.icon('bell-off', 24, 'margin:0 auto var(--space-3);display:block;')}
            Todo al día
          </div>
        `}
      </div>
    </div>`;
  },

  _renderItem(n) {
    const icons = {
      checkin:    { icon:'clipboard-check', cls:'accent' },
      message:    { icon:'message-circle',  cls:'info' },
      alert:      { icon:'alert-triangle',  cls:'warning' },
      new_client: { icon:'user-plus',       cls:'accent' },
      billing:    { icon:'credit-card',     cls:'info' }
    };
    const cfg = icons[n.type] || icons.checkin;

    return `
    <div class="notif-item ${n.read ? '' : 'unread'}" onclick="NOTIF.clickItem('${n.id}')">
      <div class="notif-icon ${cfg.cls}">${UTILS.icon(cfg.icon, 16)}</div>
      <div style="flex:1;min-width:0">
        <div class="notif-content-title">${UTILS.esc(n.title)}</div>
        <div class="notif-content-text">${UTILS.esc(UTILS.truncate(n.text, 80))}</div>
        <div class="notif-content-time">${UTILS.timeAgo(n.time)}</div>
      </div>
      ${!n.read ? `<div style="width:7px;height:7px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:4px;"></div>` : ''}
    </div>`;
  },

  toggle() {
    STATE.notifOpen = !STATE.notifOpen;
    if (STATE.notifOpen) {
      this._openDropdown();
    } else {
      this._closeDropdown();
    }
  },

  _openDropdown() {
    // Remover dropdown existente
    document.getElementById('notif-dropdown')?.remove();

    const btn = document.getElementById('notif-bell-btn');
    if (!btn) return;

    const wrapper = btn.parentElement;
    wrapper.style.position = 'relative';
    wrapper.insertAdjacentHTML('beforeend', this.renderDropdown());
    UTILS.initIcons();

    // Click fuera para cerrar
    setTimeout(() => {
      document.addEventListener('click', this._outsideClick.bind(this), { once: true });
    }, 10);
  },

  _closeDropdown() {
    document.getElementById('notif-dropdown')?.remove();
    STATE.notifOpen = false;
  },

  _outsideClick(e) {
    const dropdown = document.getElementById('notif-dropdown');
    const btn      = document.getElementById('notif-bell-btn');
    if (dropdown && !dropdown.contains(e.target) && e.target !== btn) {
      this._closeDropdown();
    }
  },

  markAllRead() {
    DATA.notifications.forEach(n => n.read = true);
    // Actualizar badge
    const dot = document.querySelector('.notif-dot');
    if (dot) dot.style.display = 'none';
    this._closeDropdown();
    TOAST.info('Todas las notificaciones marcadas como leídas.');
  },

  clickItem(id) {
    const n = DATA.notifications.find(n => n.id === id);
    if (!n) return;
    n.read = true;
    this._closeDropdown();
    if (n.link) APP.navigate(n.link);
  },

  unreadCount() {
    return DATA.notifications.filter(n => !n.read).length;
  },

  badge() {
    const count = this.unreadCount();
    if (!count) return '';
    return `<span class="notif-dot"></span>`;
  }
};
