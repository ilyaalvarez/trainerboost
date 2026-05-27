/* ============================================================
   TRAINERFLOW — SISTEMA DE TOASTS
   ============================================================ */

const TOAST = {
  _container: null,

  _icons: {
    success: 'check-circle',
    error:   'x-circle',
    info:    'info',
    warning: 'alert-triangle'
  },

  show(message, type = 'success', duration = CONFIG.toastDuration) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const id   = UTILS.uid('toast');
    const icon = this._icons[type] || 'info';

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.id = id;
    el.innerHTML = `
      <div class="toast-icon">${UTILS.icon(icon, 16)}</div>
      <div class="toast-content">
        <div class="toast-title">${UTILS.esc(message)}</div>
      </div>
      <button class="toast-close" onclick="TOAST.dismiss('${id}')">${UTILS.icon('x', 14)}</button>
    `;

    container.appendChild(el);
    UTILS.initIcons();

    setTimeout(() => this.dismiss(id), duration);
  },

  dismiss(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 200);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
  info(msg)    { this.show(msg, 'info'); },
  warning(msg) { this.show(msg, 'warning'); }
};
