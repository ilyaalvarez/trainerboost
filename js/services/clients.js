/* ============================================================
   TRAINERFLOW — SERVICIO DE CLIENTES
   ============================================================ */

const ClientService = {

  /* ── Obtener todos los clientes del trainer actual ── */
  getAll(filters = {}) {
    let list = DATA.clients.filter(c => c.trainerId === STATE.currentUser?.id);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.goal.toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.includes(q))
      );
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'attention') {
        list = list.filter(c => UTILS.daysSince(c.lastCheckin) > 7 || c.adherence < 60);
      } else {
        list = list.filter(c => c.status === filters.status);
      }
    }

    if (filters.sort) {
      list = [...list].sort((a, b) => {
        switch (filters.sort) {
          case 'name':       return a.name.localeCompare(b.name);
          case 'adherence':  return b.adherence - a.adherence;
          case 'lastCheckin':return new Date(b.lastCheckin) - new Date(a.lastCheckin);
          case 'joinedAt':   return new Date(b.joinedAt) - new Date(a.joinedAt);
          default: return 0;
        }
      });
    }

    return list;
  },

  /* ── Obtener un cliente ── */
  getById(id) {
    return DATA.clients.find(c => c.id === id) || null;
  },

  /* ── Crear cliente ── */
  create(fields) {
    if (!STATE.canAddClient()) {
      return { ok: false, error: `Tu plan permite máximo ${STATE.plan.maxClients} clientes activos. Actualiza a Pro.` };
    }
    const client = {
      id: UTILS.uid('c'),
      trainerId: STATE.currentUser.id,
      status: 'active',
      adherence: 0,
      streak: 0,
      sessionsCompleted: 0,
      joinedAt: new Date().toISOString(),
      lastCheckin: null,
      routineId: null,
      avatar: Math.floor(Math.random() * 8),
      tags: [],
      notes: fields.notes || '',
      ...fields
    };
    DATA.clients.push(client);
    return { ok: true, client };
  },

  /* ── Actualizar cliente ── */
  update(id, fields) {
    const idx = DATA.clients.findIndex(c => c.id === id);
    if (idx === -1) return { ok: false };
    DATA.clients[idx] = { ...DATA.clients[idx], ...fields };
    return { ok: true, client: DATA.clients[idx] };
  },

  /* ── Clientes que necesitan atención ── */
  needsAttention() {
    return DATA.clients.filter(c =>
      c.trainerId === STATE.currentUser?.id &&
      c.status === 'active' &&
      (UTILS.daysSince(c.lastCheckin) > 7 || c.adherence < 55)
    );
  },

  /* ── Checkins del cliente ── */
  getCheckins(clientId) {
    return DATA.checkins
      .filter(ci => ci.clientId === clientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /* ── Check-in más reciente ── */
  lastCheckin(clientId) {
    const all = this.getCheckins(clientId);
    return all[0] || null;
  },

  /* ── Asignar rutina ── */
  assignRoutine(clientId, routineId) {
    return this.update(clientId, { routineId });
  },

  /* ── Stats globales del trainer ── */
  globalStats() {
    const clients = DATA.clients.filter(c => c.trainerId === STATE.currentUser?.id);
    const active  = clients.filter(c => c.status === 'active');
    const week    = this._thisWeekCheckins();
    const avg     = active.length
      ? Math.round(active.reduce((s, c) => s + c.adherence, 0) / active.length)
      : 0;

    return {
      total: clients.length,
      active: active.length,
      weekCheckins: week.length,
      expectedCheckins: active.length,
      avgAdherence: avg,
      retention: active.length ? Math.round((active.length / clients.length) * 100) : 0
    };
  },

  _thisWeekCheckins() {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0,0,0,0);
    return DATA.checkins.filter(ci => {
      const trainerClients = DATA.clients
        .filter(c => c.trainerId === STATE.currentUser?.id)
        .map(c => c.id);
      return trainerClients.includes(ci.clientId) && new Date(ci.date) >= monday;
    });
  },

  /* ── Datos para gráfica de adherencia (8 semanas) ── */
  adherenceChartData(weeks = 8) {
    const result = [];
    const clients = DATA.clients.filter(c => c.trainerId === STATE.currentUser?.id && c.status === 'active');
    for (let i = weeks - 1; i >= 0; i--) {
      const weekNum = UTILS.currentWeek() - i;
      const weekCheckins = DATA.checkins.filter(ci => {
        const cliIds = clients.map(c => c.id);
        return cliIds.includes(ci.clientId) && ci.week === weekNum;
      });
      const avg = weekCheckins.length
        ? Math.round(weekCheckins.reduce((s,ci) => s + ci.adherence, 0) / weekCheckins.length)
        : null;
      result.push({ week: `S${weekNum}`, avg });
    }
    return result;
  },

  /* ── Distribución de objetivos ── */
  goalDistribution() {
    const clients = DATA.clients.filter(c => c.trainerId === STATE.currentUser?.id && c.status === 'active');
    const dist = {};
    clients.forEach(c => {
      dist[c.goal] = (dist[c.goal] || 0) + 1;
    });
    return Object.entries(dist).map(([label, value]) => ({ label, value }));
  }
};
