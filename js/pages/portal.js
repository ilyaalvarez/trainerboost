/* ============================================================
   TRAINERFLOW — PORTAL DEL CLIENTE
   ============================================================ */

const PortalPage = {
  _tab: 'rutina',
  _checkinSubmitted: false,

  render() {
    const u = STATE.currentUser;
    if (!u || u.role !== 'client') {
      AuthService.logout();
      return '';
    }

    // Find client data (match by email)
    const client = DATA.clients.find(c => c.email === u.email) || DATA.clients[0];
    STATE._portalClient = client;

    return `
    <div id="portal-shell" class="animate-in">
      <!-- Portal Top Nav -->
      <div class="portal-topbar">
        <div class="portal-brand">
          <span style="font-family:var(--font-display);font-size:20px;letter-spacing:0.05em;color:var(--accent)">TRAINER</span>
          <span style="font-family:var(--font-display);font-size:20px;letter-spacing:0.05em;color:var(--text)">FLOW</span>
        </div>
        <div class="flex gap-2 items-center">
          <span class="text-sm text-muted">Hola, <strong class="text-text">${UTILS.esc(u.name?.split(' ')[0] || '')}</strong></span>
          <div class="avatar avatar-${client?.avatar||0}" style="width:34px;height:34px;font-size:12px">
            ${UTILS.initials(u.name||'?')}
          </div>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="AuthService.logout()" title="Salir">
            ${UTILS.icon('log-out', 15)}
          </button>
        </div>
      </div>

      <!-- Portal Tab Nav -->
      <div class="portal-tabs">
        ${[
          { id:'rutina',   icon:'dumbbell',     label:'Mi Rutina' },
          { id:'progreso', icon:'trending-up',  label:'Mi Progreso' },
          { id:'checkin',  icon:'check-square', label:'Check-in' },
          { id:'mensajes', icon:'message-circle',label:'Mensajes' }
        ].map(t => `
          <button class="portal-tab-btn ${this._tab===t.id?'active':''}"
                  onclick="PortalPage.setTab('${t.id}')">
            ${UTILS.icon(t.icon, 16)}
            <span>${t.label}</span>
          </button>
        `).join('')}
      </div>

      <!-- Tab Content -->
      <div id="portal-content" class="portal-content">
        ${this._renderTab(client)}
      </div>
    </div>`;
  },

  _renderTab(client) {
    switch (this._tab) {
      case 'rutina':   return this._tabRutina(client);
      case 'progreso': return this._tabProgreso(client);
      case 'checkin':  return this._tabCheckin(client);
      case 'mensajes': return this._tabMensajes(client);
      default: return this._tabRutina(client);
    }
  },

  /* ── MI RUTINA ────────────────────────────────────────── */
  _tabRutina(client) {
    if (!client) return '<div class="text-center text-muted p-8">No hay datos disponibles.</div>';

    const routine = client.activeRoutineId
      ? DATA.routines.find(r => r.id === client.activeRoutineId)
      : null;

    if (!routine) {
      return `
      <div class="portal-card text-center">
        ${UTILS.icon('dumbbell', 48, 'color:var(--text-muted);display:block;margin:0 auto 16px')}
        <div class="font-bold mb-2">Sin rutina asignada</div>
        <div class="text-sm text-muted">Tu entrenador aún no te ha asignado una rutina. Escríbele un mensaje para solicitarla.</div>
      </div>`;
    }

    const today     = new Date().getDay(); // 0=Sun, 1=Mon...
    const dayMap    = { 'Lun':1,'Mar':2,'Mié':3,'Jue':4,'Vie':5,'Sáb':6,'Dom':0 };
    const todayDay  = Object.entries(dayMap).find(([,v]) => v === today)?.[0];
    const isToday   = routine.days?.includes(todayDay);
    const sessions  = STATE._portalSessions || {};
    const done      = sessions[routine.id] || {};

    const completedCount = routine.exercises?.filter(ex => done[ex.id]).length || 0;
    const totalCount     = routine.exercises?.length || 0;
    const pct            = totalCount ? Math.round((completedCount/totalCount)*100) : 0;

    return `
    <div class="max-w-2xl mx-auto">
      <!-- Header routine card -->
      <div class="portal-card mb-4">
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="font-bold text-md mb-1">${UTILS.esc(routine.name)}</div>
            <div class="text-xs text-muted">Días: ${routine.days?.join(', ') || '—'}</div>
          </div>
          ${isToday
            ? `<span class="badge badge-accent">Toca hoy 💪</span>`
            : `<span class="badge badge-neutral">No toca hoy</span>`}
        </div>

        <!-- Session progress -->
        <div class="flex justify-between text-xs mb-2">
          <span class="text-muted">Progreso sesión</span>
          <span class="font-semibold">${completedCount}/${totalCount} ejercicios</span>
        </div>
        <div class="progress-wrap mb-3">
          <div class="progress-bar ${pct===100?'':'accent'}" style="width:${pct}%;transition:width 0.4s ease;background:${pct===100?'var(--success)':'var(--accent)'}"></div>
        </div>

        ${pct === 100 ? `
          <div class="flex items-center gap-2" style="color:var(--success)">
            ${UTILS.icon('check-circle', 18, 'color:var(--success)')}
            <span class="font-semibold text-sm">¡Sesión completada! Buen trabajo 🎉</span>
          </div>` : ''}
      </div>

      <!-- Exercise list -->
      ${routine.exercises?.length ? `
      <div class="portal-card">
        <div class="card-title mb-4">Ejercicios</div>
        <div class="flex flex-col gap-0">
          ${routine.exercises.map((ex, i) => {
            const isDone = !!done[ex.id];
            return `
            <div class="exercise-portal-row ${isDone?'done':''}"
                 onclick="PortalPage.toggleExercise('${routine.id}','${ex.id}')">
              <div class="exercise-num ${isDone?'done':''}">${isDone ? UTILS.icon('check',12) : i+1}</div>
              <div style="flex:1;min-width:0">
                <div class="font-semibold text-sm ${isDone?'line-through text-muted':''}">${UTILS.esc(ex.name)}</div>
                <div class="text-xs text-muted mt-0.5">${[ex.sets?`${ex.sets} series`:null, ex.reps?`${ex.reps} reps`:null, ex.duration?ex.duration:null].filter(Boolean).join(' · ')}</div>
              </div>
              <div class="exercise-check-circle ${isDone?'checked':''}">
                ${isDone ? UTILS.icon('check', 14, 'color:#000') : ''}
              </div>
            </div>`;
          }).join('')}
        </div>

        ${totalCount > 0 ? `
        <div class="mt-4 flex gap-3">
          <button class="btn btn-outline btn-sm" onclick="PortalPage.resetSession('${routine.id}')">
            ${UTILS.icon('refresh-cw',13)} Reiniciar
          </button>
          ${pct === 100 ? '' : `
          <button class="btn btn-accent btn-sm ml-auto" onclick="PortalPage.finishSession('${routine.id}')">
            ${UTILS.icon('check-circle',13)} Marcar todo completo
          </button>`}
        </div>` : ''}
      </div>` : `
      <div class="portal-card text-center text-muted text-sm">Esta rutina no tiene ejercicios todavía.</div>`}
    </div>`;
  },

  /* ── MI PROGRESO ──────────────────────────────────────── */
  _tabProgreso(client) {
    if (!client) return '';

    const checkins   = CheckinService.getAll(client.id);
    const last5      = [...checkins].slice(-5);
    const streak     = client.streak || 0;
    const adherence  = client.adherence || 0;
    const lastFeedback = checkins.filter(ci => ci.trainerFeedback).slice(-1)[0];
    const weightHistory = CheckinService.weightHistory(client.id);

    return `
    <div class="max-w-2xl mx-auto">
      <!-- Stats row -->
      <div class="grid-2 gap-4 mb-4">
        <div class="portal-card text-center">
          <div class="metric-value accent" style="font-size:42px;line-height:1">${streak}</div>
          <div class="text-xs text-muted mt-1">Semanas de racha 🔥</div>
        </div>
        <div class="portal-card text-center">
          <div class="metric-value ${UTILS.adherenceClass(adherence)}" style="font-size:42px;line-height:1">${adherence}%</div>
          <div class="text-xs text-muted mt-1">Adherencia media</div>
        </div>
      </div>

      <!-- Trainer message -->
      ${lastFeedback ? `
      <div class="portal-card mb-4" style="border-color:var(--accent-glow);background:var(--accent-dim)">
        <div class="flex items-center gap-2 mb-3">
          ${UTILS.icon('message-square', 16, 'color:var(--accent)')}
          <span class="text-xs font-semibold text-accent">Mensaje de tu entrenador</span>
          <span class="text-xs text-muted ml-auto">${UTILS.timeAgo(lastFeedback.date)}</span>
        </div>
        <div class="text-sm" style="line-height:1.6;font-style:italic">"${UTILS.esc(lastFeedback.trainerFeedback)}"</div>
      </div>` : ''}

      <!-- Weight chart -->
      ${weightHistory.length > 1 ? `
      <div class="portal-card mb-4">
        <div class="card-title mb-3">Evolución de peso</div>
        <div style="height:180px;position:relative">
          <canvas id="portal-weight-chart" data-client-id="${client.id}"></canvas>
        </div>
      </div>` : ''}

      <!-- Recent check-ins -->
      <div class="portal-card">
        <div class="card-title mb-4">Últimos check-ins</div>
        ${last5.length ? last5.reverse().map(ci => `
          <div class="list-row" style="padding:10px 0">
            <div>
              <div class="text-xs text-muted">${UTILS.formatDate(ci.date, {day:'numeric',month:'short'})}</div>
            </div>
            <div class="flex gap-4 flex-1 justify-end flex-wrap">
              <div class="text-center">
                <div class="text-xs text-muted mb-0.5">⚡ Energía</div>
                <div class="font-bold text-sm">${ci.energy}/10</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-muted mb-0.5">😴 Sueño</div>
                <div class="font-bold text-sm">${ci.sleep}/10</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-muted mb-0.5">📋 Adherencia</div>
                <div class="font-bold text-sm">${ci.adherence}%</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-muted mb-0.5">⚖️ Peso</div>
                <div class="font-bold text-sm">${ci.weight} kg</div>
              </div>
            </div>
          </div>
        `).join('') : `
        <div class="text-center text-muted text-sm p-4">
          Aún no tienes check-ins registrados. ¡Envía el primero!
        </div>`}
      </div>
    </div>`;
  },

  /* ── CHECK-IN ─────────────────────────────────────────── */
  _tabCheckin(client) {
    if (!client) return '';

    // Check if already submitted this week
    const thisWeek = CheckinService.thisWeek().find(ci => ci.clientId === client.id);
    if (thisWeek || this._checkinSubmitted) {
      return `
      <div class="max-w-xl mx-auto">
        <div class="portal-card text-center" style="padding:var(--space-10) var(--space-6)">
          ${UTILS.icon('check-circle', 60, 'color:var(--success);display:block;margin:0 auto 20px')}
          <div style="font-family:var(--font-display);font-size:var(--text-2xl);letter-spacing:0.03em;margin-bottom:8px">
            ¡Check-in enviado!
          </div>
          <div class="text-muted text-sm mb-6" style="max-width:300px;margin-inline:auto;line-height:1.6">
            Tu entrenador revisará tus datos y te enviará feedback pronto.
          </div>
          <div class="grid-2 gap-3 text-left">
            <div class="card-sm text-center">
              <div class="text-xs text-muted mb-1">Energía</div>
              <div class="font-bold">${thisWeek?.energy || '—'}/10</div>
            </div>
            <div class="card-sm text-center">
              <div class="text-xs text-muted mb-1">Sueño</div>
              <div class="font-bold">${thisWeek?.sleep || '—'}/10</div>
            </div>
            <div class="card-sm text-center">
              <div class="text-xs text-muted mb-1">Adherencia</div>
              <div class="font-bold">${thisWeek?.adherence || '—'}%</div>
            </div>
            <div class="card-sm text-center">
              <div class="text-xs text-muted mb-1">Peso</div>
              <div class="font-bold">${thisWeek?.weight || '—'} kg</div>
            </div>
          </div>
          <div class="mt-4 text-xs text-muted">
            Semana ${UTILS.currentWeek()} · ${UTILS.formatDate(new Date(), {weekday:'long',day:'numeric',month:'long'})}
          </div>
        </div>
      </div>`;
    }

    return `
    <div class="max-w-xl mx-auto">
      <div class="portal-card">
        <div class="card-title mb-1">Check-in semanal</div>
        <div class="text-xs text-muted mb-5">Semana ${UTILS.currentWeek()} · Cuéntale a tu entrenador cómo ha ido la semana</div>

        <!-- Weight -->
        <div class="form-group">
          <label class="form-label flex justify-between">
            <span>⚖️ Peso actual</span>
            <span class="text-accent font-bold" id="ci-weight-val">${client.weight || 75} kg</span>
          </label>
          <input type="range" class="form-range" id="ci-weight"
                 min="40" max="160" step="0.5"
                 value="${client.weight || 75}"
                 oninput="document.getElementById('ci-weight-val').textContent=this.value+' kg'">
          <div class="flex justify-between text-xs text-muted mt-1"><span>40 kg</span><span>160 kg</span></div>
        </div>

        <!-- Energy -->
        <div class="form-group">
          <label class="form-label flex justify-between">
            <span>⚡ Nivel de energía</span>
            <span class="text-accent font-bold" id="ci-energy-val">7</span>
          </label>
          <input type="range" class="form-range" id="ci-energy" min="1" max="10" step="1" value="7"
                 oninput="document.getElementById('ci-energy-val').textContent=this.value">
          <div class="flex justify-between text-xs text-muted mt-1">
            <span>1 — Agotado</span><span>10 — Con toda la energía</span>
          </div>
        </div>

        <!-- Sleep -->
        <div class="form-group">
          <label class="form-label flex justify-between">
            <span>😴 Calidad del sueño</span>
            <span class="text-accent font-bold" id="ci-sleep-val">7</span>
          </label>
          <input type="range" class="form-range" id="ci-sleep" min="1" max="10" step="1" value="7"
                 oninput="document.getElementById('ci-sleep-val').textContent=this.value">
          <div class="flex justify-between text-xs text-muted mt-1">
            <span>1 — Muy mal</span><span>10 — Perfecto</span>
          </div>
        </div>

        <!-- Adherence -->
        <div class="form-group">
          <label class="form-label flex justify-between">
            <span>📋 % Rutina completada</span>
            <span class="text-accent font-bold" id="ci-adherence-val">80%</span>
          </label>
          <input type="range" class="form-range" id="ci-adherence" min="0" max="100" step="5" value="80"
                 oninput="document.getElementById('ci-adherence-val').textContent=this.value+'%'">
          <div class="flex justify-between text-xs text-muted mt-1"><span>0%</span><span>100%</span></div>
        </div>

        <!-- Notes -->
        <div class="form-group mb-0">
          <label class="form-label">💬 Notas (opcional)</label>
          <textarea class="form-textarea" id="ci-notes" style="min-height:80px"
                    placeholder="¿Algo especial esta semana? Lesión, viaje, estrés laboral..."></textarea>
        </div>

        <button class="btn btn-accent w-full mt-5" onclick="PortalPage.submitCheckin('${client.id}')">
          ${UTILS.icon('send', 15)} Enviar check-in
        </button>
      </div>
    </div>`;
  },

  /* ── MENSAJES ─────────────────────────────────────────── */
  _tabMensajes(client) {
    if (!client) return '';

    const conv = DATA.messages.find(m => m.clientId === client.id);
    const u    = STATE.currentUser;

    if (!conv) {
      return `
      <div class="portal-card text-center">
        ${UTILS.icon('message-circle', 48, 'color:var(--text-muted);display:block;margin:0 auto 16px')}
        <div class="font-bold mb-2">Sin conversación</div>
        <div class="text-sm text-muted">Tu entrenador iniciará la conversación contigo pronto.</div>
      </div>`;
    }

    return `
    <div class="max-w-2xl mx-auto">
      <div class="portal-card" style="padding:0;overflow:hidden">
        <!-- Trainer info header -->
        <div class="chat-header" style="border-radius:var(--radius) var(--radius) 0 0">
          <div class="avatar avatar-0" style="width:38px;height:38px;font-size:13px">TF</div>
          <div style="flex:1">
            <div class="font-semibold">Tu Entrenador</div>
            <div class="text-xs" style="color:var(--success)">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--success);margin-right:4px"></span>
              TrainerFlow
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" id="portal-chat-messages" style="max-height:400px">
          ${conv.messages.map(msg => {
            const isMine = msg.senderId === u?.id || msg.senderId === client.id;
            return `
            <div class="message-row ${isMine ? 'mine' : ''}">
              ${!isMine ? `<div class="avatar avatar-0" style="width:28px;height:28px;font-size:10px;flex-shrink:0">TF</div>` : ''}
              <div>
                <div class="msg-bubble ${isMine ? 'mine' : 'theirs'}">${UTILS.esc(msg.text)}</div>
                <div class="msg-time">${UTILS.timeAgo(msg.timestamp)}</div>
              </div>
              ${isMine ? `<div class="avatar avatar-${client.avatar}" style="width:28px;height:28px;font-size:10px;flex-shrink:0">${UTILS.initials(u?.name||'?')}</div>` : ''}
            </div>`;
          }).join('')}
        </div>

        <!-- Input -->
        <div class="chat-input-area" style="border-radius:0 0 var(--radius) var(--radius)">
          <div class="chat-input-row">
            <input class="chat-input" id="portal-msg-input"
                   placeholder="Escribe un mensaje..."
                   onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();PortalPage.sendMsg('${conv.convId}')}">
            <button class="chat-send-btn" onclick="PortalPage.sendMsg('${conv.convId}')">
              ${UTILS.icon('send', 16)}
            </button>
          </div>
        </div>
      </div>
    </div>`;
  },

  /* ── ACTIONS ──────────────────────────────────────────── */
  setTab(tab) {
    this._tab = tab;
    const client = STATE._portalClient;
    const content = document.getElementById('portal-content');
    if (content) {
      content.innerHTML = this._renderTab(client);
      UTILS.initIcons();
      this._initCharts(client);
      this._scrollChat();
    }
    // Update tab buttons
    document.querySelectorAll('.portal-tab-btn').forEach(b => {
      const label = b.querySelector('span')?.textContent?.trim().toLowerCase();
      const tabMap = { 'mi rutina':'rutina', 'mi progreso':'progreso', 'check-in':'checkin', 'mensajes':'mensajes' };
      b.classList.toggle('active', tabMap[label] === tab);
    });
  },

  toggleExercise(routineId, exId) {
    if (!STATE._portalSessions) STATE._portalSessions = {};
    if (!STATE._portalSessions[routineId]) STATE._portalSessions[routineId] = {};
    STATE._portalSessions[routineId][exId] = !STATE._portalSessions[routineId][exId];
    this.setTab('rutina');
  },

  finishSession(routineId) {
    const routine = DATA.routines.find(r => r.id === routineId);
    if (!routine) return;
    if (!STATE._portalSessions) STATE._portalSessions = {};
    STATE._portalSessions[routineId] = {};
    routine.exercises?.forEach(ex => {
      STATE._portalSessions[routineId][ex.id] = true;
    });
    TOAST.success('¡Sesión completada! Sigue así 💪');
    this.setTab('rutina');
  },

  resetSession(routineId) {
    if (STATE._portalSessions) STATE._portalSessions[routineId] = {};
    this.setTab('rutina');
  },

  submitCheckin(clientId) {
    const weight    = parseFloat(document.getElementById('ci-weight')?.value) || 75;
    const energy    = parseInt(document.getElementById('ci-energy')?.value) || 7;
    const sleep     = parseInt(document.getElementById('ci-sleep')?.value) || 7;
    const adherence = parseInt(document.getElementById('ci-adherence')?.value) || 80;
    const notes     = document.getElementById('ci-notes')?.value?.trim() || '';

    CheckinService.create({ clientId, weight, energy, sleep, adherence, notes });
    this._checkinSubmitted = true;
    TOAST.success('Check-in enviado ✓ Tu entrenador lo revisará pronto.');
    this.setTab('checkin');
  },

  sendMsg(convId) {
    const input = document.getElementById('portal-msg-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const conv = DATA.messages.find(c => c.convId === convId);
    if (!conv) return;

    conv.messages.push({
      id: UTILS.uid('msg'),
      senderId: STATE._portalClient?.id,
      text,
      timestamp: new Date().toISOString(),
      read: false
    });

    input.value = '';
    this.setTab('mensajes');
  },

  _scrollChat() {
    requestAnimationFrame(() => {
      const msgs = document.getElementById('portal-chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  },

  _initCharts(client) {
    if (this._tab === 'progreso' && client) {
      requestAnimationFrame(() => {
        const canvas = document.getElementById('portal-weight-chart');
        if (canvas) {
          const cid = canvas.dataset.clientId || client.id;
          CHARTS.weightLine('portal-weight-chart', cid);
        }
      });
    }
  },

  afterRender() {
    UTILS.initIcons();
    const client = STATE._portalClient;
    this._initCharts(client);
    this._scrollChat();
  }
};
