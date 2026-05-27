/* ============================================================
   TRAINERFLOW — ESTADO GLOBAL Y DATOS DE EJEMPLO
   ============================================================ */

const STATE = {
  /* ── Usuario actual ── */
  currentUser: null,
  currentView: 'landing',
  previousView: null,
  activeClientId: null,
  activeRoutineId: null,
  activeConvId: null,
  sidebarCollapsed: false,
  notifOpen: false,
  annualBilling: false,

  /* ── Listeners (pub/sub simple) ── */
  _listeners: {},

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  },
  emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  },

  /* ── Helpers de plan ── */
  get plan() {
    return this.currentUser ? CONFIG.plans[this.currentUser.plan] : CONFIG.plans.free;
  },
  hasFeature(feat) {
    return this.plan.features[feat] === true;
  },
  canAddClient() {
    const max = this.plan.maxClients;
    const active = DATA.clients.filter(c => c.status === 'active').length;
    return active < max;
  }
};

/* ============================================================
   DATOS DE EJEMPLO
   ============================================================ */

const DATA = {

  /* ────────────────────────────────
     USUARIOS
  ──────────────────────────────── */
  users: [
    {
      id: 'u1', role: 'trainer', plan: 'pro',
      name: 'Alejandro Vega', email: 'trainer@demo.com', password: 'demo123',
      avatar: 0, specialty: 'Pérdida de grasa y ganancia muscular',
      city: 'Madrid', bio: 'Entrenador personal certificado con 8 años de experiencia. Especializado en transformación corporal.',
      maxClients: 30, joinedAt: '2024-01-15'
    },
    {
      id: 'u2', role: 'client', plan: 'free',
      name: 'María García', email: 'cliente@demo.com', password: 'demo123',
      avatar: 0, clientId: 'c1', trainerId: 'u1',
      joinedAt: '2024-02-01'
    }
  ],

  /* ────────────────────────────────
     CLIENTES (8 realistas)
  ──────────────────────────────── */
  clients: [
    {
      id: 'c1', trainerId: 'u1', name: 'María García', email: 'maria.garcia@email.com',
      avatar: 0, goal: 'Pérdida de peso', status: 'active',
      currentWeight: 76.5, goalWeight: 65, startWeight: 78,
      adherence: 85, streak: 6, sessionsCompleted: 29,
      joinedAt: '2024-02-01', lastCheckin: _daysAgo(2),
      routineId: 'r1', notes: 'Muy motivada. Prefiere entrenar por las mañanas. Sin lesiones.',
      tags: ['pérdida de grasa', 'principiante']
    },
    {
      id: 'c2', trainerId: 'u1', name: 'Carlos Ruiz', email: 'carlos.ruiz@email.com',
      avatar: 1, goal: 'Ganancia muscular', status: 'active',
      currentWeight: 73.2, goalWeight: 80, startWeight: 72,
      adherence: 92, streak: 11, sessionsCompleted: 44,
      joinedAt: '2024-01-10', lastCheckin: _daysAgo(1),
      routineId: 'r2', notes: 'Muy constante. Trabaja turno de tarde, entrena noche.',
      tags: ['hipertrofia', 'avanzado']
    },
    {
      id: 'c3', trainerId: 'u1', name: 'Ana Martínez', email: 'ana.martinez@email.com',
      avatar: 2, goal: 'Tonificación', status: 'active',
      currentWeight: 62.0, goalWeight: 60, startWeight: 63,
      adherence: 70, streak: 0, sessionsCompleted: 18,
      joinedAt: '2024-03-05', lastCheckin: _daysAgo(9),
      routineId: 'r3', notes: 'Última semana sin check-in. Contactar.',
      tags: ['tonificación', 'intermedio']
    },
    {
      id: 'c4', trainerId: 'u1', name: 'Pedro López', email: 'pedro.lopez@email.com',
      avatar: 3, goal: 'Rendimiento deportivo', status: 'active',
      currentWeight: 84.5, goalWeight: 82, startWeight: 86,
      adherence: 95, streak: 18, sessionsCompleted: 68,
      joinedAt: '2023-11-20', lastCheckin: _daysAgo(1),
      routineId: 'r5', notes: 'Deportista amateur. Corre 10k los fines de semana. ⭐ Top cliente.',
      tags: ['rendimiento', 'running', 'avanzado']
    },
    {
      id: 'c5', trainerId: 'u1', name: 'Laura Sánchez', email: 'laura.sanchez@email.com',
      avatar: 4, goal: 'Rehabilitación', status: 'active',
      currentWeight: 70.2, goalWeight: 68, startWeight: 71,
      adherence: 60, streak: 2, sessionsCompleted: 14,
      joinedAt: '2024-04-01', lastCheckin: _daysAgo(5),
      routineId: 'r4', notes: 'Lesión de rodilla derecha en 2023. Trabajo de bajo impacto.',
      tags: ['rehabilitación', 'bajo impacto']
    },
    {
      id: 'c6', trainerId: 'u1', name: 'Diego Fernández', email: 'diego.fernandez@email.com',
      avatar: 5, goal: 'Pérdida de peso', status: 'active',
      currentWeight: 91.0, goalWeight: 80, startWeight: 95,
      adherence: 78, streak: 4, sessionsCompleted: 32,
      joinedAt: '2024-01-25', lastCheckin: _daysAgo(3),
      routineId: 'r6', notes: 'Progresando bien. Viaja por trabajo 1-2 veces al mes.',
      tags: ['pérdida de grasa', 'intermedio']
    },
    {
      id: 'c7', trainerId: 'u1', name: 'Sofía Torres', email: 'sofia.torres@email.com',
      avatar: 6, goal: 'Preparación competición', status: 'active',
      currentWeight: 57.8, goalWeight: 56, startWeight: 60,
      adherence: 99, streak: 24, sessionsCompleted: 88,
      joinedAt: '2023-09-01', lastCheckin: _daysAgo(0),
      routineId: 'r5', notes: '⭐ Atleta de competición. Preparando campeonato en septiembre.',
      tags: ['competición', 'élite']
    },
    {
      id: 'c8', trainerId: 'u1', name: 'Miguel Álvarez', email: 'miguel.alvarez@email.com',
      avatar: 7, goal: 'Salud general', status: 'active',
      currentWeight: 80.5, goalWeight: 75, startWeight: 82,
      adherence: 45, streak: 0, sessionsCompleted: 9,
      joinedAt: '2024-04-20', lastCheckin: _daysAgo(14),
      routineId: 'r1', notes: '⚠️ Riesgo abandono. 2 semanas sin check-in. Llamar.',
      tags: ['salud general', 'principiante']
    }
  ],

  /* ────────────────────────────────
     CHECK-INS (12 semanas por cliente)
  ──────────────────────────────── */
  checkins: _generateCheckins(),

  /* ────────────────────────────────
     RUTINAS (6 pre-creadas)
  ──────────────────────────────── */
  routines: [
    {
      id: 'r1', trainerId: 'u1', name: 'Fuerza Full Body 3x/semana',
      status: 'active', days: [0,2,4], clientCount: 2,
      description: 'Rutina de fuerza para cuerpo completo, ideal para principiantes e intermedios.',
      exercises: [
        { id:'e1', name:'Sentadilla con barra',    sets:4, reps:'10', rest:90, notes:'Profundidad paralela' },
        { id:'e2', name:'Press banca plano',        sets:4, reps:'8',  rest:90, notes:'Agarre medio' },
        { id:'e3', name:'Remo con barra',           sets:4, reps:'10', rest:90, notes:'Espalda neutra' },
        { id:'e4', name:'Press militar',            sets:3, reps:'10', rest:75, notes:'' },
        { id:'e5', name:'Peso muerto rumano',       sets:3, reps:'12', rest:90, notes:'Cadenas largas' },
        { id:'e6', name:'Dominadas asistidas',      sets:3, reps:'8',  rest:75, notes:'Agarre supino' },
        { id:'e7', name:'Plancha abdominal',        sets:3, reps:'45s',rest:45, notes:'' }
      ],
      updatedAt: _daysAgo(3)
    },
    {
      id: 'r2', trainerId: 'u1', name: 'Hipertrofia Upper/Lower Split',
      status: 'active', days: [0,1,3,4], clientCount: 1,
      description: 'Split Upper/Lower de 4 días para maximizar volumen muscular.',
      exercises: [
        { id:'e8',  name:'Press inclinado mancuernas', sets:4, reps:'10', rest:90, notes:'30° inclinación' },
        { id:'e9',  name:'Jalón al pecho',             sets:4, reps:'12', rest:75, notes:'Agarre ancho' },
        { id:'e10', name:'Aperturas cable',            sets:3, reps:'15', rest:60, notes:'Cruce alto' },
        { id:'e11', name:'Curl bíceps barra',          sets:3, reps:'12', rest:60, notes:'' },
        { id:'e12', name:'Extensión tríceps polea',    sets:3, reps:'15', rest:60, notes:'' },
        { id:'e13', name:'Prensa de pierna',           sets:4, reps:'15', rest:90, notes:'Pies altos' },
        { id:'e14', name:'Leg curl tumbado',           sets:3, reps:'12', rest:75, notes:'' },
        { id:'e15', name:'Hip thrust barra',           sets:4, reps:'12', rest:90, notes:'' }
      ],
      updatedAt: _daysAgo(1)
    },
    {
      id: 'r3', trainerId: 'u1', name: 'HIIT + Cardio Mix',
      status: 'active', days: [1,3,5], clientCount: 1,
      description: 'Combinación de HIIT y cardio moderado para tonificación y quema de grasa.',
      exercises: [
        { id:'e16', name:'Calentamiento cardio',    sets:1, reps:'10 min', rest:0,  notes:'Intensidad baja' },
        { id:'e17', name:'Burpees',                 sets:4, reps:'15',     rest:30, notes:'20s ON / 10s OFF' },
        { id:'e18', name:'Mountain climbers',       sets:4, reps:'20',     rest:30, notes:'' },
        { id:'e19', name:'Sentadilla jump',         sets:4, reps:'15',     rest:30, notes:'' },
        { id:'e20', name:'Zancadas con peso',       sets:3, reps:'12',     rest:45, notes:'Mancuernas 8kg' },
        { id:'e21', name:'Abdominales bicicleta',   sets:3, reps:'20',     rest:30, notes:'' },
        { id:'e22', name:'Cardio final',            sets:1, reps:'15 min', rest:0,  notes:'Bicicleta o elíptica' }
      ],
      updatedAt: _daysAgo(7)
    },
    {
      id: 'r4', trainerId: 'u1', name: 'Movilidad y Flexibilidad',
      status: 'active', days: [0,2,4,6], clientCount: 1,
      description: 'Programa de bajo impacto para rehabilitación y mejora de movilidad articular.',
      exercises: [
        { id:'e23', name:'Foam roller cuerpo completo', sets:1, reps:'10 min', rest:0, notes:'Lento y controlado' },
        { id:'e24', name:'Hip 90/90 mobility',          sets:2, reps:'10 cada lado', rest:30, notes:'' },
        { id:'e25', name:'Bird dog',                    sets:3, reps:'10', rest:30, notes:'Core activado' },
        { id:'e26', name:'Glute bridge',                sets:3, reps:'15', rest:45, notes:'Peso corporal' },
        { id:'e27', name:'Wall slides',                 sets:3, reps:'12', rest:30, notes:'Espalda pegada' },
        { id:'e28', name:'Estiramiento cadena posterior', sets:1, reps:'5 min', rest:0, notes:'' }
      ],
      updatedAt: _daysAgo(5)
    },
    {
      id: 'r5', trainerId: 'u1', name: 'Rendimiento Atlético',
      status: 'active', days: [0,1,2,3,4], clientCount: 2,
      description: 'Programa de alto rendimiento para deportistas. Combina fuerza, potencia y cardio.',
      exercises: [
        { id:'e29', name:'Sentadilla olímpica',      sets:5, reps:'5',  rest:120, notes:'Intensidad 80-85%' },
        { id:'e30', name:'Peso muerto convencional', sets:4, reps:'5',  rest:120, notes:'Máximo técnico' },
        { id:'e31', name:'Clean & jerk (técnica)',   sets:5, reps:'3',  rest:120, notes:'Solo con técnico' },
        { id:'e32', name:'Box jumps',                sets:4, reps:'6',  rest:90,  notes:'Máxima altura segura' },
        { id:'e33', name:'Sprints 100m',             sets:6, reps:'1',  rest:120, notes:'90% esfuerzo' },
        { id:'e34', name:'Planchas dinámicas',       sets:3, reps:'60s',rest:60,  notes:'' }
      ],
      updatedAt: _daysAgo(0)
    },
    {
      id: 'r6', trainerId: 'u1', name: 'Pérdida de Peso Progresiva',
      status: 'active', days: [0,2,4], clientCount: 1,
      description: 'Combinación de fuerza y cardio progresivo para déficit calórico sostenido.',
      exercises: [
        { id:'e35', name:'Sentadilla goblet',        sets:3, reps:'15', rest:60, notes:'Mancuerna 16kg' },
        { id:'e36', name:'Press mancuernas banco',   sets:3, reps:'12', rest:60, notes:'14kg cada mano' },
        { id:'e37', name:'Remo mancuerna',           sets:3, reps:'12', rest:60, notes:'Por lado' },
        { id:'e38', name:'Peso muerto mancuernas',   sets:3, reps:'15', rest:75, notes:'' },
        { id:'e39', name:'Cardio HIIT circuito',     sets:4, reps:'5 min', rest:60, notes:'Elíptica/cinta' },
        { id:'e40', name:'Core finisher',            sets:2, reps:'3 ejercicios', rest:30, notes:'Plancha, crunch, ruso' }
      ],
      updatedAt: _daysAgo(2)
    }
  ],

  /* ────────────────────────────────
     MENSAJES
  ──────────────────────────────── */
  messages: _generateMessages(),

  /* ────────────────────────────────
     NOTIFICACIONES
  ──────────────────────────────── */
  notifications: [
    {
      id: 'n1', type: 'checkin', clientId: 'c7', read: false,
      title: 'Check-in recibido · Sofía Torres',
      text: 'Completó su check-in semanal. Energía 9/10, adherencia 99%. Está on fire 🔥',
      time: _daysAgo(0), link: 'checkins'
    },
    {
      id: 'n2', type: 'alert', clientId: 'c8', read: false,
      title: '⚠️ Cliente inactivo · Miguel Álvarez',
      text: '14 días sin check-in. Riesgo de abandono alto. Recomendamos contactar.',
      time: _daysAgo(0), link: 'clients'
    },
    {
      id: 'n3', type: 'message', clientId: 'c2', read: false,
      title: 'Mensaje nuevo · Carlos Ruiz',
      text: '"Profe, me duele el hombro desde ayer... ¿cancelo el entreno?"',
      time: _daysAgo(0), link: 'messages'
    },
    {
      id: 'n4', type: 'checkin', clientId: 'c4', read: false,
      title: 'Check-in recibido · Pedro López',
      text: 'Peso: 84.5 kg · Adherencia 95% · 18 semanas de racha 💪',
      time: _daysAgo(1), link: 'checkins'
    },
    {
      id: 'n5', type: 'alert', clientId: 'c3', read: true,
      title: '⚠️ Sin check-in · Ana Martínez',
      text: '9 días sin actividad. Considera enviar un recordatorio.',
      time: _daysAgo(2), link: 'clients'
    },
    {
      id: 'n6', type: 'checkin', clientId: 'c1', read: true,
      title: 'Check-in recibido · María García',
      text: 'Buena semana. Energía 8/10, perdió 0.3 kg esta semana.',
      time: _daysAgo(2), link: 'checkins'
    }
  ],

  /* ────────────────────────────────
     FACTURAS (simuladas)
  ──────────────────────────────── */
  invoices: [
    { id: 'inv1', date: '2026-05-01', concept: 'Plan Pro · Mayo 2026',   amount: 29, status: 'paid' },
    { id: 'inv2', date: '2026-04-01', concept: 'Plan Pro · Abril 2026',  amount: 29, status: 'paid' },
    { id: 'inv3', date: '2026-03-01', concept: 'Plan Pro · Marzo 2026',  amount: 29, status: 'paid' },
    { id: 'inv4', date: '2026-02-01', concept: 'Plan Pro · Febrero 2026',amount: 29, status: 'paid' },
    { id: 'inv5', date: '2026-01-01', concept: 'Plan Pro · Enero 2026',  amount: 29, status: 'paid' }
  ]
};

/* ============================================================
   HELPERS DE GENERACIÓN DE DATOS
   ============================================================ */

function _daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function _generateCheckins() {
  const checkins = [];
  const clients = [
    { id:'c1', baseW:78,   baseAdh:85, baseE:7.5, baseS:7 },
    { id:'c2', baseW:72,   baseAdh:92, baseE:8,   baseS:7.5 },
    { id:'c3', baseW:63,   baseAdh:70, baseE:6,   baseS:6.5 },
    { id:'c4', baseW:86,   baseAdh:95, baseE:9,   baseS:8 },
    { id:'c5', baseW:71,   baseAdh:60, baseE:6,   baseS:6 },
    { id:'c6', baseW:95,   baseAdh:78, baseE:7,   baseS:7 },
    { id:'c7', baseW:60,   baseAdh:99, baseE:9,   baseS:8.5 },
    { id:'c8', baseW:82,   baseAdh:45, baseE:5,   baseS:5.5 }
  ];

  const weightDeltas = { c1:-0.35, c2:0.15, c3:-0.1, c4:-0.2, c5:-0.15, c6:-0.4, c7:-0.25, c8:-0.1 };

  clients.forEach(c => {
    let w = c.baseW;
    for (let week = 11; week >= 0; week--) {
      const d = new Date();
      d.setDate(d.getDate() - (week * 7));

      // Ana y Miguel faltan algunas semanas
      if (c.id === 'c3' && week < 2) continue;
      if (c.id === 'c8' && week < 3) continue;

      const rand = (base, range) => Math.round((base + (Math.random()-0.5)*range) * 10) / 10;
      w += weightDeltas[c.id] + (Math.random() - 0.5) * 0.4;

      const adh = Math.min(100, Math.max(20, c.baseAdh + (Math.random()-0.5)*20));
      const notes = [
        'Semana tranquila, sin novedades.',
        'Buena semana, noté más energía.',
        'Algo cansada por el trabajo, pero cumplí.',
        'Fui al 100%, muy motivado/a.',
        'Tuve un resfrío leve, bajé un poco el ritmo.',
        'Excelente semana, batí mi récord personal.',
        'Semana normal, todo bien.',
        'Me costó más de lo habitual pero lo saqué.'
      ];

      checkins.push({
        id: `chk_${c.id}_${week}`,
        clientId: c.id,
        week: 12 - week,
        date: d.toISOString(),
        weight: Math.round(w * 10) / 10,
        energy: rand(c.baseE, 3),
        sleep: rand(c.baseS, 2.5),
        adherence: Math.round(adh),
        notes: notes[Math.floor(Math.random() * notes.length)],
        trainerFeedback: week > 2 ? '¡Buen trabajo! Sigue así 💪' : '',
        reviewed: week > 1
      });
    }
  });

  return checkins;
}

function _generateMessages() {
  const convos = [];

  const templates = [
    // c2 - Carlos Ruiz
    {
      convId: 'conv_c2',
      clientId: 'c2',
      msgs: [
        { from:'c2', text:'Profe, me duele el hombro desde ayer. Hice press banca y algo crujió 😬', t:_daysAgo(0) },
        { from:'trainer', text:'¿Duele al levantar el brazo o solo con peso? Descansa mañana el día de empuje. Te mando alternativas ahora.', t:_daysAgo(0) },
        { from:'c2', text:'Solo con peso. Sin eso no molesta. Gracias profe 🙏', t:_daysAgo(0) },
        { from:'trainer', text:'Perfecto, eso es buena señal. Hoy haz solo cardio y legs. Mañana vemos cómo evoluciona.', t:_daysAgo(0) }
      ]
    },
    // c1 - María García
    {
      convId: 'conv_c1',
      clientId: 'c1',
      msgs: [
        { from:'c1', text:'¡Profe! Esta semana bajé 0.4kg 🎉🎉', t:_daysAgo(2) },
        { from:'trainer', text:'¡Eso es increíble María! El déficit está funcionando perfecto. ¿Cómo te sentiste en los entrenos?', t:_daysAgo(2) },
        { from:'c1', text:'Con más energía que nunca. Ya no me cuesta levantarme para ir al gym 💪', t:_daysAgo(2) },
        { from:'trainer', text:'Me alegra mucho. Esta semana subimos un poco la intensidad en piernas, ¿lista?', t:_daysAgo(1) },
        { from:'c1', text:'¡Siempre lista! 😄', t:_daysAgo(1) }
      ]
    },
    // c3 - Ana Martínez
    {
      convId: 'conv_c3',
      clientId: 'c3',
      msgs: [
        { from:'trainer', text:'Hola Ana, ¿todo bien? Llevas 9 días sin check-in, me preocupa no saber de ti.', t:_daysAgo(3) },
        { from:'c3', text:'Perdona profe, tuve semanas muy caóticas en el trabajo. Esta semana retomo, lo prometo.', t:_daysAgo(3) },
        { from:'trainer', text:'No te preocupes, lo importante es que estés bien. Cuando retomes avísame y ajustamos la rutina.', t:_daysAgo(2) }
      ]
    },
    // c4 - Pedro López
    {
      convId: 'conv_c4',
      clientId: 'c4',
      msgs: [
        { from:'c4', text:'Profe, la semana que viene tengo la carrera de 10k. ¿Paramos el entrenamiento de fuerza?', t:_daysAgo(4) },
        { from:'trainer', text:'Hacemos semana de descarga. Solo cardio suave y movilidad hasta el jueves. El viernes descanso completo.', t:_daysAgo(4) },
        { from:'c4', text:'Perfecto. Voy a por el sub-50min este año 🏃', t:_daysAgo(4) },
        { from:'trainer', text:'Con el entrenamiento que llevas, tienes todo para conseguirlo. ¡A por ello!', t:_daysAgo(3) }
      ]
    },
    // c7 - Sofía Torres
    {
      convId: 'conv_c7',
      clientId: 'c7',
      msgs: [
        { from:'c7', text:'Profe, acabo de terminar el entreno de hoy. 6 series al 90% de RM. Todo perfecto 💯', t:_daysAgo(0) },
        { from:'trainer', text:'¡Bestia total Sofía! ¿Cómo estuvo la técnica en el clean & jerk?', t:_daysAgo(0) },
        { from:'c7', text:'Mucho mejor que la semana pasada. El codo ya no cae tan rápido.', t:_daysAgo(0) }
      ]
    }
  ];

  templates.forEach(t => convos.push({
    convId: t.convId,
    clientId: t.clientId,
    messages: t.msgs.map((m, i) => ({
      id: `msg_${t.convId}_${i}`,
      senderId: m.from === 'trainer' ? 'u1' : m.from,
      text: m.text,
      timestamp: m.t,
      read: true
    })),
    unread: t.clientId === 'c2' ? 0 : 0
  }));

  // Marcar el último mensaje de c2 como no leído
  const c2conv = convos.find(c => c.clientId === 'c2');
  if (c2conv) c2conv.unread = 1;

  return convos;
}
