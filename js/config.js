/* ============================================================
   TRAINERFLOW — CONFIGURACIÓN Y CONSTANTES
   ============================================================ */

const CONFIG = {
  appName: 'TrainerFlow',
  version: '1.0.0',

  /* ── Planes y sus límites ── */
  plans: {
    free: {
      id: 'free', name: 'Free', price: 0, priceAnnual: 0,
      maxClients: 3, maxRoutines: 2,
      features: {
        checkins: true, routines: true, messages: true,
        analytics: false, export: false, whatsapp: false
      },
      badge: 'FREE'
    },
    starter: {
      id: 'starter', name: 'Starter', price: 14, priceAnnual: 134,
      maxClients: 20, maxRoutines: 999,
      features: {
        checkins: true, routines: true, messages: true,
        analytics: false, export: false, whatsapp: false
      },
      badge: 'STARTER'
    },
    pro: {
      id: 'pro', name: 'Pro', price: 29, priceAnnual: 278,
      maxClients: Infinity, maxRoutines: Infinity,
      features: {
        checkins: true, routines: true, messages: true,
        analytics: true, export: true, whatsapp: true
      },
      badge: 'PRO'
    }
  },

  /* ── Cuentas demo ── */
  demoTrainer: { email: 'trainer@demo.com', password: 'demo123' },
  demoClient:  { email: 'cliente@demo.com', password: 'demo123' },

  /* ── Objetivos disponibles ── */
  goals: [
    'Pérdida de peso',
    'Ganancia muscular',
    'Tonificación',
    'Rendimiento deportivo',
    'Rehabilitación',
    'Preparación competición',
    'Salud general',
    'Flexibilidad y movilidad'
  ],

  /* ── Especialidades de entrenador ── */
  specialties: [
    'Pérdida de grasa',
    'Hipertrofia y volumen',
    'Rendimiento atlético',
    'Rehabilitación física',
    'Nutrición deportiva',
    'Crossfit y HIIT',
    'Yoga y movilidad',
    'Preparación competición'
  ],

  /* ── Días de la semana ── */
  days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  daysLong: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],

  /* ── Tipos de notificación ── */
  notifTypes: {
    CHECKIN:  'checkin',
    MESSAGE:  'message',
    ALERT:    'alert',
    NEW_CLIENT: 'new_client',
    BILLING:  'billing'
  },

  /* ── Colores avatar (ciclado por índice) ── */
  avatarColors: [0, 1, 2, 3, 4, 5, 6, 7],

  /* ── Toast duración (ms) ── */
  toastDuration: 3500,

  /* ── Debounce búsqueda (ms) ── */
  searchDebounce: 300,

  /* ── Semanas de historial ── */
  historyWeeks: 12
};
