/* ============================================================
   TRAINERFLOW — SERVICIO DE CHECK-INS
   ============================================================ */

const CheckinService = {

  getAll(clientId = null) {
    let list = DATA.checkins;
    if (clientId) {
      list = list.filter(ci => ci.clientId === clientId);
    } else {
      const trainerClientIds = DATA.clients
        .filter(c => c.trainerId === STATE.currentUser?.id)
        .map(c => c.id);
      list = list.filter(ci => trainerClientIds.includes(ci.clientId));
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /* ── Checkins de esta semana ── */
  thisWeek() {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0,0,0,0);

    return this.getAll().filter(ci => new Date(ci.date) >= monday);
  },

  /* ── Crear check-in ── */
  create(fields) {
    const checkin = {
      id: UTILS.uid('chk'),
      week: UTILS.currentWeek(),
      date: new Date().toISOString(),
      trainerFeedback: '',
      reviewed: false,
      ...fields
    };

    DATA.checkins.push(checkin);

    // Actualizar lastCheckin del cliente
    const cidx = DATA.clients.findIndex(c => c.id === fields.clientId);
    if (cidx !== -1) {
      DATA.clients[cidx].lastCheckin = checkin.date;
      // Recalcular adherencia media
      const allAdh = DATA.checkins
        .filter(ci => ci.clientId === fields.clientId)
        .slice(0, 8)
        .map(ci => ci.adherence);
      if (allAdh.length) {
        DATA.clients[cidx].adherence = Math.round(allAdh.reduce((s,a) => s+a, 0) / allAdh.length);
      }
    }

    // Crear notificación
    const client = DATA.clients.find(c => c.id === fields.clientId);
    if (client) {
      DATA.notifications.unshift({
        id: UTILS.uid('n'),
        type: 'checkin',
        clientId: fields.clientId,
        read: false,
        title: `Check-in recibido · ${client.name}`,
        text: `Energía ${fields.energy}/10 · Adherencia ${fields.adherence}%`,
        time: new Date().toISOString(),
        link: 'checkins'
      });
    }

    return { ok: true, checkin };
  },

  /* ── Responder con feedback ── */
  addFeedback(checkinId, feedback) {
    const idx = DATA.checkins.findIndex(ci => ci.id === checkinId);
    if (idx === -1) return { ok: false };
    DATA.checkins[idx].trainerFeedback = feedback;
    DATA.checkins[idx].reviewed = true;
    return { ok: true };
  },

  /* ── Pendientes de revisión esta semana ── */
  pendingReview() {
    return this.thisWeek().filter(ci => !ci.reviewed);
  },

  /* ── Clientes que NO enviaron check-in esta semana ── */
  missingClients() {
    const doneIds = new Set(this.thisWeek().map(ci => ci.clientId));
    return DATA.clients.filter(c =>
      c.trainerId === STATE.currentUser?.id &&
      c.status === 'active' &&
      !doneIds.has(c.id)
    );
  },

  /* ── Stats de la semana ── */
  weekStats() {
    const week = this.thisWeek();
    const total = DATA.clients.filter(c => c.trainerId === STATE.currentUser?.id && c.status === 'active').length;
    const done  = week.length;
    const avgE  = done ? (week.reduce((s,ci) => s + ci.energy, 0) / done).toFixed(1) : 0;
    const avgAdh= done ? Math.round(week.reduce((s,ci) => s + ci.adherence, 0) / done) : 0;
    return { total, done, pending: total - done, avgEnergy: avgE, avgAdherence: avgAdh };
  },

  /* ── Historial de peso (para gráfica) ── */
  weightHistory(clientId, weeks = 12) {
    return DATA.checkins
      .filter(ci => ci.clientId === clientId)
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .slice(-weeks)
      .map(ci => ({ date: UTILS.formatDateShort(ci.date), weight: ci.weight }));
  },

  /* ── Promedios de bienestar ── */
  wellnessAverages(clientId, last = 8) {
    const cis = DATA.checkins
      .filter(ci => ci.clientId === clientId)
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, last);
    if (!cis.length) return { energy: 0, sleep: 0, adherence: 0 };
    return {
      energy:    parseFloat((cis.reduce((s,ci) => s+ci.energy, 0) / cis.length).toFixed(1)),
      sleep:     parseFloat((cis.reduce((s,ci) => s+ci.sleep, 0)  / cis.length).toFixed(1)),
      adherence: Math.round(cis.reduce((s,ci) => s+ci.adherence, 0) / cis.length)
    };
  },

  /* ── Datos para gráfica Chart.js ── */
  weightChartData(clientId) {
    const history = this.weightHistory(clientId);
    return {
      labels: history.map(h => h.date),
      datasets: [{
        label: 'Peso (kg)',
        data: history.map(h => h.weight),
        borderColor: '#00FF87',
        backgroundColor: 'rgba(0,255,135,0.08)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00FF87',
        pointRadius: 4
      }]
    };
  },

  wellnessChartData(clientId) {
    const cis = DATA.checkins
      .filter(ci => ci.clientId === clientId)
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .slice(-8);
    return {
      labels: cis.map(ci => UTILS.formatDateShort(ci.date)),
      datasets: [
        {
          label: 'Energía',
          data: cis.map(ci => ci.energy),
          backgroundColor: 'rgba(0,255,135,0.7)',
          borderRadius: 4
        },
        {
          label: 'Sueño',
          data: cis.map(ci => ci.sleep),
          backgroundColor: 'rgba(59,130,246,0.7)',
          borderRadius: 4
        }
      ]
    };
  }
};
