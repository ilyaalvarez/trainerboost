/* ============================================================
   TRAINERFLOW — UTILIDADES TRANSVERSALES
   ============================================================ */

const UTILS = {

  /* ── Formato de fecha ── */
  formatDate(iso, opts = {}) {
    if (!iso) return '—';
    const d = new Date(iso);
    const defaults = { day:'numeric', month:'short', year:'numeric' };
    return d.toLocaleDateString('es-ES', { ...defaults, ...opts });
  },

  formatDateShort(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { day:'numeric', month:'short' });
  },

  formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
  },

  timeAgo(iso) {
    if (!iso) return '';
    const now = new Date();
    const d   = new Date(iso);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)   return 'Ahora mismo';
    if (diff < 3600) return `Hace ${Math.floor(diff/60)} min`;
    if (diff < 86400)return `Hace ${Math.floor(diff/3600)}h`;
    if (diff < 172800) return 'Ayer';
    const days = Math.floor(diff/86400);
    if (days < 7)    return `Hace ${days} días`;
    if (days < 30)   return `Hace ${Math.floor(days/7)} sem`;
    return this.formatDateShort(iso);
  },

  /* ── Iniciales ── */
  initials(name) {
    if (!name) return '?';
    return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  },

  /* ── Número con formato ── */
  formatNumber(n, decimals = 0) {
    return Number(n).toLocaleString('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  formatCurrency(n) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency', currency: 'EUR',
      minimumFractionDigits: 0
    }).format(n);
  },

  /* ── Adherencia → color clase ── */
  adherenceClass(pct) {
    if (pct >= 80) return 'success';
    if (pct >= 60) return 'warning';
    return 'danger';
  },

  adherenceBadge(pct) {
    const cls = this.adherenceClass(pct);
    return `<span class="badge badge-${cls}">${pct}%</span>`;
  },

  /* ── Días desde fecha ── */
  daysSince(iso) {
    if (!iso) return 999;
    const diff = new Date() - new Date(iso);
    return Math.floor(diff / 86400000);
  },

  /* ── Estado de último check-in ── */
  checkinStatus(lastCheckin) {
    const days = this.daysSince(lastCheckin);
    if (days <= 7)  return { label: 'Al día',  cls: 'success', dot: 'green' };
    if (days <= 14) return { label: 'Tardío',  cls: 'warning', dot: 'yellow' };
    return           { label: 'Inactivo', cls: 'danger',  dot: 'red' };
  },

  /* ── Debounce ── */
  debounce(fn, ms = CONFIG.searchDebounce) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  /* ── Sanitizar HTML básico ── */
  esc(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  /* ── Icones Lucide (helper) ── */
  icon(name, size = 16, extra = '') {
    return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;${extra}" class="lucide-icon"></i>`;
  },

  /* ── Re-render icons después de inyectar HTML ── */
  initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  /* ── Scroll to top del content area ── */
  scrollTop() {
    const el = document.querySelector('.content-area');
    if (el) el.scrollTop = 0;
  },

  /* ── Clamp ── */
  clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  },

  /* ── Generar ID único ── */
  uid(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  },

  /* ── LocalStorage helpers ── */
  save(key, val) {
    try { localStorage.setItem(`tf_${key}`, JSON.stringify(val)); } catch(e) {}
  },
  load(key, fallback = null) {
    try {
      const v = localStorage.getItem(`tf_${key}`);
      return v !== null ? JSON.parse(v) : fallback;
    } catch(e) { return fallback; }
  },
  remove(key) {
    try { localStorage.removeItem(`tf_${key}`); } catch(e) {}
  },

  /* ── Semanas del año ── */
  currentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  },

  /* ── Días de la semana actuales ── */
  weekDays() {
    const days = [];
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  },

  /* ── Validación email ── */
  isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  },

  /* ── Validación contraseña ── */
  isStrongPassword(str) {
    return str && str.length >= 6;
  },

  /* ── Formato tarjeta crédito ── */
  formatCard(val) {
    return val.replace(/\D/g, '').slice(0,16).replace(/(.{4})/g, '$1 ').trim();
  },

  formatExpiry(val) {
    return val.replace(/\D/g, '').slice(0,4).replace(/^(.{2})(.+)/, '$1/$2');
  },

  /* ── Truncar texto ── */
  truncate(str, max = 60) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '…' : str;
  },

  /* ── Porcentaje progreso peso ── */
  weightProgress(client) {
    const total = client.startWeight - client.goalWeight;
    const done  = client.startWeight - client.currentWeight;
    if (total === 0) return 100;
    return Math.round(this.clamp((done / total) * 100, 0, 100));
  },

  /* ── Nombre del día actual ── */
  todayName() {
    return new Date().toLocaleDateString('es-ES', { weekday: 'long' });
  },

  /* ── Saludo según hora ── */
  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
};
