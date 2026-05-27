/* ============================================================
   TRAINERFLOW — SISTEMA DE MODALES
   ============================================================ */

const MODAL = {
  _stack: [],

  /* ── Abrir modal genérico ── */
  open(opts = {}) {
    const {
      title = '',
      body  = '',
      footer = '',
      size  = 'md',
      onClose = null
    } = opts;

    const id = UTILS.uid('modal');

    const maxW = { sm: '400px', md: '520px', lg: '720px', xl: '920px' }[size] || '520px';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = id;
    overlay.innerHTML = `
      <div class="modal" style="max-width:${maxW}">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close" id="${id}-close">${UTILS.icon('x', 16)}</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);
    UTILS.initIcons();

    // Abrir con micro-animación
    requestAnimationFrame(() => overlay.classList.add('open'));

    // Cierre al click en overlay
    overlay.addEventListener('click', e => {
      if (e.target === overlay) this.close(id, onClose);
    });

    document.getElementById(`${id}-close`)?.addEventListener('click', () => {
      this.close(id, onClose);
    });

    // ESC para cerrar
    const escHandler = e => {
      if (e.key === 'Escape') { this.close(id, onClose); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);

    this._stack.push({ id, onClose, escHandler });
    return id;
  },

  /* ── Cerrar modal ── */
  close(id = null, cb = null) {
    const modalId = id || (this._stack.length ? this._stack[this._stack.length - 1].id : null);
    if (!modalId) return;

    const overlay = document.getElementById(modalId);
    if (!overlay) return;

    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 220);

    this._stack = this._stack.filter(m => m.id !== modalId);
    if (cb) cb();
  },

  closeAll() {
    [...this._stack].forEach(m => this.close(m.id));
  },

  /* ── Confirm dialog ── */
  confirm(opts = {}) {
    const {
      title   = '¿Estás seguro?',
      message = '',
      confirmLabel = 'Confirmar',
      cancelLabel  = 'Cancelar',
      danger       = false,
      onConfirm    = null
    } = opts;

    const id = this.open({
      title,
      body: `<p class="text-muted text-sm" style="line-height:1.6">${UTILS.esc(message)}</p>`,
      footer: `
        <button class="btn btn-outline" id="modal-cancel-btn">${cancelLabel}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-accent'}" id="modal-confirm-btn">${confirmLabel}</button>
      `
    });

    setTimeout(() => {
      document.getElementById('modal-cancel-btn')?.addEventListener('click', () => this.close(id));
      document.getElementById('modal-confirm-btn')?.addEventListener('click', () => {
        this.close(id);
        if (onConfirm) onConfirm();
      });
    }, 50);

    return id;
  },

  /* ── Alert ── */
  alert(title, message) {
    return this.open({
      title,
      body: `<p class="text-muted text-sm" style="line-height:1.6">${UTILS.esc(message)}</p>`,
      footer: `<button class="btn btn-accent" id="modal-ok-btn">Entendido</button>`
    });
  }
};
