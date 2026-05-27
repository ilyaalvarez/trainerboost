/* ============================================================
   TRAINERFLOW — SERVICIO DE RUTINAS
   ============================================================ */

const RoutineService = {

  getAll(filters = {}) {
    let list = DATA.routines.filter(r => r.trainerId === STATE.currentUser?.id);
    if (filters.status && filters.status !== 'all') {
      list = list.filter(r => r.status === filters.status);
    }
    return list;
  },

  getById(id) {
    return DATA.routines.find(r => r.id === id) || null;
  },

  create(fields) {
    const routine = {
      id: UTILS.uid('r'),
      trainerId: STATE.currentUser.id,
      status: 'draft',
      clientCount: 0,
      days: [],
      exercises: [],
      updatedAt: new Date().toISOString(),
      ...fields
    };
    DATA.routines.push(routine);
    return { ok: true, routine };
  },

  update(id, fields) {
    const idx = DATA.routines.findIndex(r => r.id === id);
    if (idx === -1) return { ok: false };
    DATA.routines[idx] = { ...DATA.routines[idx], ...fields, updatedAt: new Date().toISOString() };
    return { ok: true, routine: DATA.routines[idx] };
  },

  delete(id) {
    const idx = DATA.routines.findIndex(r => r.id === id);
    if (idx === -1) return { ok: false };
    DATA.routines.splice(idx, 1);
    return { ok: true };
  },

  addExercise(routineId, exercise) {
    const r = this.getById(routineId);
    if (!r) return { ok: false };
    const ex = { id: UTILS.uid('ex'), ...exercise };
    return this.update(routineId, { exercises: [...r.exercises, ex] });
  },

  removeExercise(routineId, exId) {
    const r = this.getById(routineId);
    if (!r) return { ok: false };
    return this.update(routineId, { exercises: r.exercises.filter(e => e.id !== exId) });
  },

  moveExercise(routineId, exId, direction) {
    const r = this.getById(routineId);
    if (!r) return { ok: false };
    const exs = [...r.exercises];
    const idx = exs.findIndex(e => e.id === exId);
    if (idx === -1) return { ok: false };
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= exs.length) return { ok: false };
    [exs[idx], exs[newIdx]] = [exs[newIdx], exs[idx]];
    return this.update(routineId, { exercises: exs });
  },

  activate(id) { return this.update(id, { status: 'active' }); },
  deactivate(id) { return this.update(id, { status: 'draft' }); },

  getForClient(clientId) {
    const client = DATA.clients.find(c => c.id === clientId);
    if (!client?.routineId) return null;
    return this.getById(client.routineId);
  },

  /* Catálogo de 30 ejercicios pre-cargados */
  catalog: [
    // Piernas
    { name:'Sentadilla con barra',      muscle:'Piernas',  equipment:'Barra' },
    { name:'Prensa de pierna',          muscle:'Piernas',  equipment:'Máquina' },
    { name:'Zancadas con mancuernas',   muscle:'Piernas',  equipment:'Mancuernas' },
    { name:'Leg curl tumbado',          muscle:'Piernas',  equipment:'Máquina' },
    { name:'Extensión de cuádriceps',   muscle:'Piernas',  equipment:'Máquina' },
    { name:'Hip thrust con barra',      muscle:'Glúteos',  equipment:'Barra' },
    { name:'Puente de glúteos',         muscle:'Glúteos',  equipment:'Peso corporal' },
    // Empuje
    { name:'Press banca plano',         muscle:'Pecho',    equipment:'Barra' },
    { name:'Press inclinado mancuernas',muscle:'Pecho',    equipment:'Mancuernas' },
    { name:'Aperturas con cable',       muscle:'Pecho',    equipment:'Cable' },
    { name:'Fondos en paralelas',       muscle:'Pecho',    equipment:'Peso corporal' },
    { name:'Press militar',             muscle:'Hombros',  equipment:'Barra' },
    { name:'Elevaciones laterales',     muscle:'Hombros',  equipment:'Mancuernas' },
    { name:'Press Arnold',              muscle:'Hombros',  equipment:'Mancuernas' },
    // Tirón
    { name:'Dominadas',                 muscle:'Espalda',  equipment:'Peso corporal' },
    { name:'Jalón al pecho',            muscle:'Espalda',  equipment:'Cable' },
    { name:'Remo con barra',            muscle:'Espalda',  equipment:'Barra' },
    { name:'Remo con mancuerna',        muscle:'Espalda',  equipment:'Mancuernas' },
    { name:'Peso muerto convencional',  muscle:'Espalda',  equipment:'Barra' },
    { name:'Curl de bíceps barra',      muscle:'Bíceps',   equipment:'Barra' },
    { name:'Curl martillo',             muscle:'Bíceps',   equipment:'Mancuernas' },
    // Tríceps
    { name:'Extensión tríceps polea',   muscle:'Tríceps',  equipment:'Cable' },
    { name:'Press francés',             muscle:'Tríceps',  equipment:'Barra' },
    // Core
    { name:'Plancha abdominal',         muscle:'Core',     equipment:'Peso corporal' },
    { name:'Crunch con cable',          muscle:'Core',     equipment:'Cable' },
    { name:'Rueda abdominal',           muscle:'Core',     equipment:'Rueda' },
    { name:'Hollow body',               muscle:'Core',     equipment:'Peso corporal' },
    // Cardio
    { name:'Sprints 100m',             muscle:'Cardio',   equipment:'Pista' },
    { name:'Burpees',                   muscle:'Cardio',   equipment:'Peso corporal' },
    { name:'HIIT en bicicleta',         muscle:'Cardio',   equipment:'Bicicleta' }
  ]
};
