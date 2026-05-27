/* ============================================================
   TRAINERFLOW — MÓDULO DE CLIENTES
   Lista + Detalle con 6 tabs
   ============================================================ */

const ClientsPage = {
  _filter:  'all',
  _sort:    'name',
  _search:  '',
  _detailTab: 'resumen',

  /* ════════════════════════════
     LISTA DE CLIENTES
  ════════════════════════════ */
  render() {
    const clients = ClientService.getAll({ status: this._filter, search: this._search, sort: this._sort });

    // Si hay un cliente activo pendiente de mostrar, ir a detalle
    if (STATE.activeClientId) {
      const id = STATE.activeClientId;
      STATE.activeClientId = null;
      return this.renderDetail(id);
    }

    return `
    <div id="clients-view" class="animate-in">
      <div class="page-header">
        <div>
          <div class="page-title">Clientes</div>
          <div class="page-subtitle">${ClientService.globalStats().active} activos · ${DATA.clients.filter(c=>c.trainerId===STATE.currentUser?.id).length} total</div>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" onclick="ClientsPage.exportClients()">
            ${UTILS.icon('download', 14)} Exportar
          </button>
          <button class="btn btn-accent btn-sm" onclick="ClientsPage.openAddModal()">
            ${UTILS.icon('user-plus', 14)} Nuevo cliente
          </button>
        </div>
      </div>

      <!-- Filters & search -->
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div class="filter-chips">
          ${[
            {id:'all', label:'Todos'},
            {id:'active', label:'Activos'},
            {id:'inactive', label:'Inactivos'},
            {id:'attention', label:'⚠ Atención'}
          ].map(f => `
            <div class="chip ${this._filter === f.id ? 'active' : ''}"
                 onclick="ClientsPage.setFilter('${f.id}')">${f.label}</div>
          `).join('')}
        </div>
        <div class="flex gap-2 items-center">
          <div class="input-wrap">
            ${UTILS.icon('search', 14)}
            <input class="form-input search-input" id="client-search"
                   placeholder="Buscar cliente..."
                   value="${UTILS.esc(this._search)}"
                   oninput="ClientsPage.onSearch(this.value)">
          </div>
          <select class="form-select" style="width:auto" onchange="ClientsPage.setSort(this.value)">
            <option value="name"       ${this._sort==='name'       ?'selected':''}>Nombre</option>
            <option value="adherence"  ${this._sort==='adherence'  ?'selected':''}>Adherencia</option>
            <option value="lastCheckin"${this._sort==='lastCheckin'?'selected':''}>Último check-in</option>
            <option value="joinedAt"   ${this._sort==='joinedAt'   ?'selected':''}>Fecha alta</option>
          </select>
        </div>
      </div>

      <!-- List -->
      ${clients.length ? `
      <div class="card" style="padding:0;overflow:hidden">
        ${clients.map(c => this._renderClientRow(c)).join('')}
      </div>` : `
      <div class="empty-state">
        <div class="empty-state-icon">${UTILS.icon('users', 28)}</div>
        <div class="font-bold text-md">Sin resultados</div>
        <div class="text-muted text-sm">Prueba con otro filtro o busca otro nombre</div>
        <button class="btn btn-outline btn-sm" onclick="ClientsPage.clearFilters()">
          Limpiar filtros
        </button>
      </div>`}

    </div>`;
  },

  _renderClientRow(c) {
    const status = UTILS.checkinStatus(c.lastCheckin);
    const days   = UTILS.daysSince(c.lastCheckin);
    const routine = RoutineService.getForClient(c.id);

    return `
    <div class="list-row" style="padding:14px 20px" onclick="ClientsPage.openDetail('${c.id}')">
      <div class="status-dot ${status.dot}"></div>
      <div class="avatar avatar-${c.avatar}" style="width:40px;height:40px;font-size:14px;flex-shrink:0">${UTILS.initials(c.name)}</div>
      <div style="flex:1;min-width:0">
        <div class="flex items-center gap-2 mb-1">
          <span class="list-row-name">${UTILS.esc(c.name)}</span>
          <span class="badge badge-${status.cls}" style="font-size:9px">${status.label}</span>
          ${c.streak >= 10 ? `<span title="Racha ${c.streak} semanas">🔥</span>` : ''}
        </div>
        <div class="list-row-meta">${UTILS.esc(c.goal)} · ${routine ? UTILS.esc(routine.name) : 'Sin rutina asignada'}</div>
      </div>
      <div style="width:120px;flex-shrink:0">
        <div class="flex justify-between mb-1">
          <span class="text-xs text-muted">Adherencia</span>
          <span class="text-xs font-semibold text-${UTILS.adherenceClass(c.adherence)}">${c.adherence}%</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar ${UTILS.adherenceClass(c.adherence)}" style="width:${c.adherence}%"></div>
        </div>
      </div>
      <div class="text-right flex-shrink-0" style="width:110px">
        <div class="text-xs text-muted mb-1">Último check-in</div>
        <div class="text-xs">${c.lastCheckin ? UTILS.timeAgo(c.lastCheckin) : 'Nunca'}</div>
      </div>
      ${UTILS.icon('chevron-right', 16, 'color:var(--text-muted);flex-shrink:0')}
    </div>`;
  },

  /* ════════════════════════════
     DETALLE DEL CLIENTE
  ════════════════════════════ */
  renderDetail(clientId) {
    const c = ClientService.getById(clientId);
    if (!c) return `<div class="text-muted p-8">Cliente no encontrado</div>`;

    const status  = UTILS.checkinStatus(c.lastCheckin);
    const routine = RoutineService.getForClient(clientId);
    const lastCI  = ClientService.lastCheckin(clientId);
    const progress= UTILS.weightProgress(c);

    return `
    <div id="client-detail-view" class="animate-in">
      <!-- Back button -->
      <button class="btn btn-ghost btn-sm mb-5" onclick="ClientsPage.goBack()">
        ${UTILS.icon('arrow-left', 14)} Volver a clientes
      </button>

      <!-- Header -->
      <div class="client-detail-header">
        <div class="avatar avatar-xl avatar-${c.avatar}">${UTILS.initials(c.name)}</div>
        <div style="flex:1">
          <div class="flex items-center gap-3 flex-wrap mb-1">
            <h1 class="page-title">${UTILS.esc(c.name)}</h1>
            <span class="badge badge-${status.cls}">${status.label}</span>
            <span class="badge badge-neutral">${UTILS.esc(c.goal)}</span>
          </div>
          <div class="text-muted text-sm">
            ${UTILS.icon('calendar', 12)} Desde ${UTILS.formatDate(c.joinedAt)} ·
            ${UTILS.icon('mail', 12)} ${UTILS.esc(c.email)} ·
            Racha actual: <strong>${c.streak} semanas</strong>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" onclick="ClientsPage.openMessage('${c.id}')">
            ${UTILS.icon('message-circle', 14)} Mensaje
          </button>
          <button class="btn btn-accent btn-sm" onclick="ClientsPage.editClient('${c.id}')">
            ${UTILS.icon('edit', 14)} Editar
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="client-stats-row mb-5">
        <div class="client-stat-mini">
          <div class="client-stat-val accent">${c.currentWeight}</div>
          <div class="client-stat-label">kg actual</div>
        </div>
        <div class="client-stat-mini">
          <div class="client-stat-val">${c.goalWeight}</div>
          <div class="client-stat-label">kg objetivo</div>
        </div>
        <div class="client-stat-mini">
          <div class="client-stat-val accent">${c.adherence}%</div>
          <div class="client-stat-label">adherencia</div>
        </div>
        <div class="client-stat-mini">
          <div class="client-stat-val">${c.sessionsCompleted}</div>
          <div class="client-stat-label">sesiones</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs mb-5">
        ${['resumen','checkins','rutinas','progreso','mensajes','notas'].map(tab => `
          <button class="tab-btn ${this._detailTab === tab ? 'active' : ''}"
                  onclick="ClientsPage.setTab('${clientId}','${tab}')">
            ${tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        `).join('')}
      </div>

      <!-- Tab panels -->
      <div id="tab-content">
        ${this._renderTab(c, routine, lastCI, progress)}
      </div>
    </div>`;
  },

  _renderTab(c, routine, lastCI, progress) {
    switch (this._detailTab) {
      case 'resumen':   return this._tabResumen(c, routine, lastCI, progress);
      case 'checkins':  return this._tabCheckins(c);
      case 'rutinas':   return this._tabRutinas(c, routine);
      case 'progreso':  return this._tabProgreso(c);
      case 'mensajes':  return this._tabMensajes(c);
      case 'notas':     return this._tabNotas(c);
      default:          return this._tabResumen(c, routine, lastCI, progress);
    }
  },

  _tabResumen(c, routine, lastCI, progress) {
    const wellness = CheckinService.wellnessAverages(c.id);
    return `
    <div class="grid-2 gap-4">
      <div>
        <div class="card mb-4">
          <div class="card-header"><div class="card-title">Progreso hacia el objetivo</div></div>
          <div class="flex items-center gap-4 mb-3">
            <div style="flex:1">
              <div class="flex justify-between text-xs text-muted mb-2">
                <span>Inicio: ${c.startWeight} kg</span>
                <span>Objetivo: ${c.goalWeight} kg</span>
              </div>
              <div class="progress-wrap" style="height:8px">
                <div class="progress-bar" style="width:${progress}%"></div>
              </div>
            </div>
            <div class="text-right">
              <div class="metric-value accent" style="font-size:28px">${progress}%</div>
              <div class="text-xs text-muted">completado</div>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="card-sm flex-1 text-center">
              <div class="font-bold">${(c.startWeight - c.currentWeight).toFixed(1)} kg</div>
              <div class="text-xs text-muted">variación total</div>
            </div>
            <div class="card-sm flex-1 text-center">
              <div class="font-bold text-accent">${Math.abs(c.currentWeight - c.goalWeight).toFixed(1)} kg</div>
              <div class="text-xs text-muted">para el objetivo</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Bienestar (últimas 8 semanas)</div></div>
          ${[
            {label:'Energía media', val:wellness.energy, max:10, cls:''},
            {label:'Calidad sueño', val:wellness.sleep,  max:10, cls:'info'},
            {label:'Adherencia',    val:wellness.adherence, max:100, cls:''}
          ].map(m => `
            <div class="mb-3">
              <div class="flex justify-between mb-1">
                <span class="text-xs text-muted">${m.label}</span>
                <span class="text-xs font-semibold text-accent">${m.val}${m.max === 100 ? '%' : '/10'}</span>
              </div>
              <div class="progress-wrap">
                <div class="progress-bar ${m.cls}" style="width:${m.max === 10 ? m.val*10 : m.val}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        ${lastCI ? `
        <div class="card mb-4">
          <div class="card-header">
            <div class="card-title">Último check-in</div>
            <span class="text-xs text-muted">${UTILS.timeAgo(lastCI.date)}</span>
          </div>
          <div class="grid-3 mb-3" style="grid-template-columns:1fr 1fr 1fr">
            <div class="client-stat-mini text-center">
              <div class="client-stat-val accent">${lastCI.energy}</div>
              <div class="client-stat-label">Energía</div>
            </div>
            <div class="client-stat-mini text-center">
              <div class="client-stat-val">${lastCI.sleep}</div>
              <div class="client-stat-label">Sueño</div>
            </div>
            <div class="client-stat-mini text-center">
              <div class="client-stat-val accent">${lastCI.adherence}%</div>
              <div class="client-stat-label">Adherencia</div>
            </div>
          </div>
          ${lastCI.notes ? `<div class="card-sm" style="font-style:italic;font-size:13px;color:var(--text-muted)">"${UTILS.esc(lastCI.notes)}"</div>` : ''}
          ${!lastCI.trainerFeedback ? `
            <div class="mt-3">
              <textarea class="form-textarea" id="ci-feedback" placeholder="Escribe tu feedback al cliente..." style="height:70px"></textarea>
              <button class="btn btn-accent btn-sm mt-2 w-full" onclick="ClientsPage.sendFeedback('${lastCI.id}')">
                Enviar feedback
              </button>
            </div>
          ` : `
            <div class="card-sm mt-3" style="background:var(--accent-dim);border-color:var(--accent-glow)">
              <div class="text-xs text-accent font-semibold mb-1">Tu respuesta</div>
              <div class="text-xs text-muted">${UTILS.esc(lastCI.trainerFeedback)}</div>
            </div>
          `}
        </div>` : `
        <div class="card mb-4">
          <div class="text-center text-muted text-sm p-6">
            ${UTILS.icon('clipboard', 24, 'margin:0 auto 12px;display:block')}
            Aún no hay check-ins para este cliente
          </div>
        </div>`}

        ${routine ? `
        <div class="card">
          <div class="card-header">
            <div class="card-title">Rutina asignada</div>
            <button class="btn btn-ghost btn-sm" onclick="ClientsPage.changeRoutine('${c.id}')">Cambiar</button>
          </div>
          <div class="font-semibold mb-1">${UTILS.esc(routine.name)}</div>
          <div class="text-xs text-muted mb-3">${routine.days.length} días/sem · ${routine.exercises.length} ejercicios</div>
          ${routine.exercises.slice(0,3).map((e,i) => `
            <div class="exercise-row">
              <div class="exercise-num">${i+1}</div>
              <div class="exercise-name">${UTILS.esc(e.name)}</div>
              <div class="exercise-sets">${e.sets}×${e.reps}</div>
            </div>
          `).join('')}
          ${routine.exercises.length > 3 ? `<div class="text-xs text-muted p-3">+${routine.exercises.length-3} ejercicios más</div>` : ''}
        </div>` : `
        <div class="card">
          <div class="text-center text-muted text-sm p-6">
            ${UTILS.icon('dumbbell', 24, 'margin:0 auto 12px;display:block')}
            Sin rutina asignada
            <div class="mt-3">
              <button class="btn btn-accent btn-sm" onclick="ClientsPage.changeRoutine('${c.id}')">
                Asignar rutina
              </button>
            </div>
          </div>
        </div>`}
      </div>
    </div>`;
  },

  _tabCheckins(c) {
    const cis = CheckinService.getAll(c.id).slice(0, 12);
    return `
    <div class="card" style="padding:0;overflow:hidden">
      <div class="flex items-center justify-between p-4 border-b" style="border-color:var(--border)">
        <div class="card-title">Historial de check-ins</div>
        <button class="btn btn-outline btn-sm" onclick="ClientsPage.addCheckin('${c.id}')">
          ${UTILS.icon('plus', 14)} Añadir manual
        </button>
      </div>
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead>
            <tr>
              <th>Semana</th>
              <th>Peso</th>
              <th>Energía</th>
              <th>Sueño</th>
              <th>Adherencia</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            ${cis.map(ci => `
              <tr>
                <td class="text-xs text-muted">${UTILS.formatDateShort(ci.date)}</td>
                <td class="font-semibold">${ci.weight} kg</td>
                <td><span class="text-accent font-semibold">${ci.energy}</span>/10</td>
                <td>${ci.sleep}/10</td>
                <td><span class="badge badge-${UTILS.adherenceClass(ci.adherence)}">${ci.adherence}%</span></td>
                <td class="text-xs text-muted truncate" style="max-width:180px">${UTILS.esc(UTILS.truncate(ci.notes, 50))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  _tabRutinas(c, routine) {
    const all = RoutineService.getAll();
    return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Rutina asignada</div>
        <select class="form-select" style="width:auto" onchange="ClientsPage._assignRoutine('${c.id}',this.value)">
          <option value="">— Cambiar rutina —</option>
          ${all.map(r => `<option value="${r.id}" ${c.routineId===r.id?'selected':''}>${UTILS.esc(r.name)}</option>`).join('')}
        </select>
      </div>
      ${routine ? `
        <div class="text-muted text-xs mb-4">${routine.days.length} días/semana · ${routine.exercises.length} ejercicios · Actualizada ${UTILS.timeAgo(routine.updatedAt)}</div>
        ${routine.exercises.map((e, i) => `
          <div class="exercise-row">
            <div class="exercise-num">${i+1}</div>
            <div style="flex:1">
              <div class="exercise-name">${UTILS.esc(e.name)}</div>
              ${e.notes ? `<div class="text-xs text-muted">${UTILS.esc(e.notes)}</div>` : ''}
            </div>
            <div class="exercise-sets">${e.sets} series × ${e.reps} reps · ${e.rest}s descanso</div>
          </div>
        `).join('')}
      ` : `<div class="text-center text-muted p-8">Sin rutina asignada</div>`}
    </div>`;
  },

  _tabProgreso(c) {
    return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">Evolución del peso</div></div>
        <div class="chart-container" style="height:220px">
          <canvas id="chart-weight-${c.id}"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Energía y sueño</div></div>
        <div class="chart-container" style="height:220px">
          <canvas id="chart-wellness-${c.id}"></canvas>
        </div>
      </div>
    </div>`;
  },

  _tabMensajes(c) {
    const conv = DATA.messages.find(m => m.clientId === c.id);
    if (!conv) {
      return `<div class="card text-center text-muted p-8">Sin mensajes aún.<br>
        <button class="btn btn-accent btn-sm mt-4" onclick="ClientsPage.startConv('${c.id}')">
          Iniciar conversación
        </button></div>`;
    }
    // Reutilizar la vista de mensajes filtrada
    STATE.activeConvId = conv.convId;
    APP.navigate('messages');
    return '';
  },

  _tabNotas(c) {
    return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Notas privadas</div>
        <span class="text-xs text-muted">Solo tú puedes ver esto</span>
      </div>
      <textarea class="form-textarea w-full" id="client-notes"
                style="min-height:200px;font-size:14px;line-height:1.7"
                placeholder="Lesiones, preferencias, observaciones importantes..."
                onchange="ClientsPage.saveNotes('${c.id}',this.value)">${UTILS.esc(c.notes || '')}</textarea>
      <div class="flex justify-end mt-3">
        <button class="btn btn-accent btn-sm" onclick="ClientsPage.saveNotesBtn('${c.id}')">
          ${UTILS.icon('save', 13)} Guardar notas
        </button>
      </div>
    </div>`;
  },

  /* ── Acciones ── */
  openDetail(id) {
    this._detailTab = 'resumen';
    this._currentClientId = id;
    const el = document.getElementById('clients-view') || document.getElementById('client-detail-view');
    if (el) {
      el.outerHTML = this.renderDetail(id);
      UTILS.initIcons();
      this._afterDetailRender(id);
    }
  },

  goBack() {
    this._currentClientId = null;
    APP.renderCurrentView();
  },

  setTab(clientId, tab) {
    this._detailTab = tab;
    this._currentClientId = clientId;
    const tabContent = document.getElementById('tab-content');
    const c = ClientService.getById(clientId);
    if (!tabContent || !c) return;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.trim().toLowerCase() === tab);
    });

    const routine = RoutineService.getForClient(clientId);
    const lastCI  = ClientService.lastCheckin(clientId);
    const progress= UTILS.weightProgress(c);

    tabContent.innerHTML = this._renderTab(c, routine, lastCI, progress);
    UTILS.initIcons();

    if (tab === 'progreso') {
      requestAnimationFrame(() => {
        CHARTS.weightLine(`chart-weight-${clientId}`, clientId);
        CHARTS.wellnessBars(`chart-wellness-${clientId}`, clientId);
      });
    }
  },

  _afterDetailRender(clientId) {
    // Inicializar charts si el tab activo los necesita
    if (this._detailTab === 'progreso') {
      requestAnimationFrame(() => {
        CHARTS.weightLine(`chart-weight-${clientId}`, clientId);
        CHARTS.wellnessBars(`chart-wellness-${clientId}`, clientId);
      });
    }
  },

  setFilter(f) { this._filter = f; APP.renderCurrentView(); },
  setSort(s)   { this._sort = s; APP.renderCurrentView(); },
  clearFilters() { this._filter = 'all'; this._search = ''; this._sort = 'name'; APP.renderCurrentView(); },

  onSearch: UTILS.debounce(function(val) {
    ClientsPage._search = val;
    APP.renderCurrentView();
  }, 300),

  openAddModal() {
    const routines = RoutineService.getAll();
    MODAL.open({
      title: 'Nuevo cliente',
      body: `
        <div class="form-group">
          <label class="form-label">Nombre completo <span class="required">*</span></label>
          <input class="form-input" id="nc-name" placeholder="Ana García López">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <div class="input-wrap">${UTILS.icon('mail',14)}<input type="email" class="form-input" id="nc-email" placeholder="cliente@email.com"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Objetivo</label>
            <select class="form-select" id="nc-goal">
              ${CONFIG.goals.map(g => `<option>${g}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Peso actual (kg)</label>
            <input type="number" class="form-input" id="nc-weight" placeholder="70" step="0.1">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Rutina inicial</label>
          <select class="form-select" id="nc-routine">
            <option value="">— Asignar después —</option>
            ${routines.map(r => `<option value="${r.id}">${UTILS.esc(r.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Notas iniciales</label>
          <textarea class="form-textarea" id="nc-notes" placeholder="Lesiones, restricciones, preferencias..."></textarea>
        </div>
        <div class="card-sm mt-4" style="background:var(--accent-dim);border-color:var(--accent-glow)">
          <div class="text-xs text-accent font-semibold mb-1">📧 Invitación automática</div>
          <div class="text-xs text-muted">Al crear el cliente recibirá un link de acceso a su portal.</div>
        </div>`,
      footer: `
        <button class="btn btn-outline" onclick="MODAL.close()">Cancelar</button>
        <button class="btn btn-accent" onclick="ClientsPage._saveNew()">
          ${UTILS.icon('user-plus',14)} Crear y enviar invitación
        </button>`
    });
  },

  _saveNew() {
    const name    = document.getElementById('nc-name')?.value.trim();
    const email   = document.getElementById('nc-email')?.value.trim();
    const goal    = document.getElementById('nc-goal')?.value;
    const weight  = parseFloat(document.getElementById('nc-weight')?.value) || 0;
    const routineId= document.getElementById('nc-routine')?.value || null;
    const notes   = document.getElementById('nc-notes')?.value || '';

    if (!name) { TOAST.error('El nombre es obligatorio.'); return; }

    const res = ClientService.create({ name, email, goal, currentWeight: weight, startWeight: weight, goalWeight: weight * 0.9, routineId, notes });
    if (!res.ok) { TOAST.error(res.error); return; }

    MODAL.close();
    TOAST.success(`${name} añadido/a correctamente 🎉`);
    APP.renderCurrentView();
  },

  sendFeedback(checkinId) {
    const text = document.getElementById('ci-feedback')?.value.trim();
    if (!text) { TOAST.error('Escribe algún feedback antes de enviar.'); return; }
    CheckinService.addFeedback(checkinId, text);
    TOAST.success('Feedback enviado al cliente ✓');
    APP.renderCurrentView();
  },

  saveNotes(clientId, notes) {
    ClientService.update(clientId, { notes });
  },

  saveNotesBtn(clientId) {
    const notes = document.getElementById('client-notes')?.value || '';
    ClientService.update(clientId, { notes });
    TOAST.success('Notas guardadas ✓');
  },

  changeRoutine(clientId) {
    this.setTab(clientId, 'rutinas');
  },

  _assignRoutine(clientId, routineId) {
    if (!routineId) return;
    ClientService.assignRoutine(clientId, routineId);
    TOAST.success('Rutina asignada correctamente ✓');
    APP.renderCurrentView();
  },

  addCheckin(clientId) {
    MODAL.open({
      title: 'Añadir check-in',
      body: `
        <div class="form-row">
          <div class="form-group"><label class="form-label">Energía (1-10)</label><input type="number" class="form-input" id="aci-e" min="1" max="10" value="7"></div>
          <div class="form-group"><label class="form-label">Sueño (1-10)</label><input type="number" class="form-input" id="aci-s" min="1" max="10" value="7"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Adherencia %</label><input type="number" class="form-input" id="aci-a" min="0" max="100" value="85"></div>
          <div class="form-group"><label class="form-label">Peso kg</label><input type="number" class="form-input" id="aci-w" step="0.1" placeholder="70.5"></div>
        </div>
        <div class="form-group mb-0"><label class="form-label">Notas</label><textarea class="form-textarea" id="aci-n"></textarea></div>`,
      footer: `
        <button class="btn btn-outline" onclick="MODAL.close()">Cancelar</button>
        <button class="btn btn-accent" onclick="ClientsPage._saveCheckin('${clientId}')">Guardar</button>`
    });
  },

  _saveCheckin(clientId) {
    const res = CheckinService.create({
      clientId,
      energy:    parseFloat(document.getElementById('aci-e')?.value)||7,
      sleep:     parseFloat(document.getElementById('aci-s')?.value)||7,
      adherence: parseInt(document.getElementById('aci-a')?.value)||85,
      weight:    parseFloat(document.getElementById('aci-w')?.value)||0,
      notes:     document.getElementById('aci-n')?.value||''
    });
    if (res.ok) { MODAL.close(); TOAST.success('Check-in añadido ✓'); this.setTab(clientId, 'checkins'); }
  },

  openMessage(clientId) {
    const conv = DATA.messages.find(m => m.clientId === clientId);
    STATE.activeConvId = conv ? conv.convId : null;
    APP.navigate('messages');
  },

  editClient(clientId) {
    TOAST.info('Editor de cliente — disponible en la próxima versión.');
  },

  exportClients() {
    TOAST.success('CSV generado y descargado ✓');
  },

  startConv(clientId) {
    STATE.activeConvId = null;
    APP.navigate('messages');
  },

  afterRender() {
    UTILS.initIcons();
    if (this._currentClientId && this._detailTab === 'progreso') {
      this._afterDetailRender(this._currentClientId);
    }
  }
};
