/* ============================================================
   TRAINERFLOW — MÓDULO DE RUTINAS
   Lista + Builder completo
   ============================================================ */

const RoutinesPage = {
  _filter: 'all',
  _builderRoutineId: null,
  _builderExerciseFilter: '',

  render() {
    if (this._builderRoutineId) {
      return this.renderBuilder(this._builderRoutineId);
    }

    const routines = RoutineService.getAll({ status: this._filter });

    return `
    <div id="routines-view" class="animate-in">
      <div class="page-header">
        <div>
          <div class="page-title">Rutinas</div>
          <div class="page-subtitle">${routines.length} rutinas · ${DATA.clients.filter(c=>c.trainerId===STATE.currentUser?.id&&c.routineId).length} asignadas</div>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" onclick="RoutinesPage._duplicate()">
            ${UTILS.icon('copy', 14)} Duplicar
          </button>
          <button class="btn btn-accent btn-sm" onclick="RoutinesPage.createNew()">
            ${UTILS.icon('plus', 14)} Nueva rutina
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filter-chips mb-5">
        ${[{id:'all',label:'Todas'},{id:'active',label:'Activas'},{id:'draft',label:'Borradores'}].map(f => `
          <div class="chip ${this._filter===f.id?'active':''}" onclick="RoutinesPage.setFilter('${f.id}')">${f.label}</div>
        `).join('')}
      </div>

      <!-- Grid de rutinas -->
      <div class="grid-2">
        ${routines.map(r => this._renderRoutineCard(r)).join('')}
        <div class="card-dashed" onclick="RoutinesPage.createNew()">
          ${UTILS.icon('plus', 28)}
          <div class="text-sm font-semibold">Crear nueva rutina</div>
        </div>
      </div>
    </div>`;
  },

  _renderRoutineCard(r) {
    const assignedClients = DATA.clients.filter(c => c.routineId === r.id);
    return `
    <div class="card card-hover" style="padding:0;overflow:hidden" onclick="RoutinesPage.openBuilder('${r.id}')">
      <div style="padding:var(--space-5);border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between">
        <div>
          <div class="font-bold text-base mb-1">${UTILS.esc(r.name)}</div>
          <div class="text-xs text-muted">
            ${r.days.length} días/sem · ${r.exercises.length} ejercicios ·
            ${assignedClients.length} cliente${assignedClients.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <span class="badge badge-${r.status === 'active' ? 'accent' : 'neutral'}">${r.status === 'active' ? 'Activa' : 'Borrador'}</span>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();RoutinesPage.toggleStatus('${r.id}')">
            ${UTILS.icon(r.status==='active'?'pause':'play', 14)}
          </button>
        </div>
      </div>
      ${r.exercises.slice(0, 4).map((e, i) => `
        <div class="exercise-row">
          <div class="exercise-num">${i+1}</div>
          <div class="exercise-name">${UTILS.esc(e.name)}</div>
          <div class="exercise-sets">${e.sets}×${e.reps}</div>
        </div>
      `).join('')}
      ${r.exercises.length > 4 ? `
        <div class="text-xs text-muted" style="padding:10px 20px;border-top:1px solid var(--border)">
          + ${r.exercises.length - 4} ejercicios más
        </div>` : ''}
    </div>`;
  },

  /* ════════════════════════════
     ROUTINE BUILDER
  ════════════════════════════ */
  renderBuilder(routineId) {
    const r = RoutineService.getById(routineId);
    if (!r) return `<div class="text-muted p-8">Rutina no encontrada</div>`;

    const assigned = DATA.clients.filter(c => c.routineId === routineId);

    return `
    <div id="routine-builder-view" class="animate-in">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <button class="btn btn-ghost btn-sm" onclick="RoutinesPage.closeBuilder()">
          ${UTILS.icon('arrow-left', 14)} Volver
        </button>
        <div style="flex:1">
          <input class="form-input" id="routine-name-input" value="${UTILS.esc(r.name)}"
                 style="font-family:var(--font-display);font-size:var(--text-xl);background:transparent;border:none;padding:0;border-bottom:1px dashed var(--border)"
                 onchange="RoutinesPage.updateName('${routineId}',this.value)">
        </div>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" onclick="RoutinesPage.toggleStatus('${routineId}')">
            ${r.status === 'active' ? `${UTILS.icon('pause',14)} Pausar` : `${UTILS.icon('play',14)} Activar`}
          </button>
          <button class="btn btn-accent btn-sm" onclick="RoutinesPage.saveRoutine('${routineId}')">
            ${UTILS.icon('save', 14)} Guardar
          </button>
        </div>
      </div>

      <div class="grid-2 gap-5">
        <!-- Left: Days + Exercises -->
        <div>
          <!-- Days selector -->
          <div class="card mb-4">
            <div class="card-title mb-3">Días de entrenamiento</div>
            <div class="day-selector" id="builder-days">
              ${CONFIG.days.map((d, i) => `
                <button type="button" class="day-btn ${r.days.includes(i)?'active':''}"
                        data-day="${i}" onclick="RoutinesPage.toggleDay('${routineId}',${i},this)">
                  ${d}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Exercise list -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <div class="card-title">${r.exercises.length} ejercicios</div>
              <button class="btn btn-outline btn-sm" onclick="RoutinesPage.openExPicker('${routineId}')">
                ${UTILS.icon('plus', 14)} Añadir ejercicio
              </button>
            </div>

            <div id="exercise-list-${routineId}">
              ${r.exercises.length ? r.exercises.map((e, i) => this._renderExerciseRow(e, i, routineId)).join('')
                : `<div class="text-center text-muted p-6 text-sm">Sin ejercicios. Añade el primero.</div>`}
            </div>
          </div>
        </div>

        <!-- Right: Info + Assign -->
        <div>
          <div class="card mb-4">
            <div class="card-title mb-3">Información</div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea class="form-textarea" placeholder="Describe el objetivo de esta rutina..."
                        id="routine-desc" style="height:80px"
                        onchange="RoutinesPage.updateDesc('${routineId}',this.value)">${UTILS.esc(r.description || '')}</textarea>
            </div>
            <div class="grid-2 text-center" style="gap:var(--space-3)">
              <div class="card-sm">
                <div class="font-bold text-xl">${r.days.length}</div>
                <div class="text-xs text-muted">días/semana</div>
              </div>
              <div class="card-sm">
                <div class="font-bold text-xl">${r.exercises.length}</div>
                <div class="text-xs text-muted">ejercicios</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title mb-3">Clientes asignados</div>
            ${assigned.length ? assigned.map(c => `
              <div class="flex items-center gap-3 mb-3">
                <div class="avatar avatar-${c.avatar}" style="width:32px;height:32px;font-size:11px">${UTILS.initials(c.name)}</div>
                <div style="flex:1;min-width:0">
                  <div class="text-sm font-semibold truncate">${UTILS.esc(c.name)}</div>
                  <div class="text-xs text-muted">${UTILS.esc(c.goal)}</div>
                </div>
                <button class="btn btn-ghost btn-sm btn-icon" onclick="RoutinesPage.unassign('${routineId}','${c.id}')">
                  ${UTILS.icon('x', 13)}
                </button>
              </div>
            `).join('') : `<div class="text-center text-muted text-sm p-4">Ningún cliente asignado</div>`}
            <button class="btn btn-outline btn-sm w-full mt-2" onclick="RoutinesPage.openAssignModal('${routineId}')">
              ${UTILS.icon('user-plus', 13)} Asignar a cliente
            </button>
          </div>
        </div>
      </div>
    </div>`;
  },

  _renderExerciseRow(e, idx, routineId) {
    return `
    <div class="exercise-builder-row" id="ex-row-${e.id}">
      <div class="exercise-handle">
        <div class="handle-dot"></div><div class="handle-dot"></div>
        <div class="handle-dot"></div><div class="handle-dot"></div>
      </div>
      <div class="exercise-num">${idx + 1}</div>
      <div style="flex:1;min-width:0">
        <div class="font-medium text-sm mb-1 truncate">${UTILS.esc(e.name)}</div>
        <div class="flex gap-3">
          <div>
            <input class="ex-mini-input" value="${e.sets}" placeholder="4"
                   onchange="RoutinesPage.updateExField('${routineId}','${e.id}','sets',this.value)">
            <div class="ex-mini-label">series</div>
          </div>
          <div>
            <input class="ex-mini-input" value="${e.reps}" placeholder="10"
                   onchange="RoutinesPage.updateExField('${routineId}','${e.id}','reps',this.value)">
            <div class="ex-mini-label">reps</div>
          </div>
          <div>
            <input class="ex-mini-input" value="${e.rest}" placeholder="60"
                   onchange="RoutinesPage.updateExField('${routineId}','${e.id}','rest',this.value)">
            <div class="ex-mini-label">seg</div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="RoutinesPage.moveEx('${routineId}','${e.id}','up')">${UTILS.icon('chevron-up',13)}</button>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="RoutinesPage.moveEx('${routineId}','${e.id}','down')">${UTILS.icon('chevron-down',13)}</button>
      </div>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="RoutinesPage.removeEx('${routineId}','${e.id}')">
        ${UTILS.icon('trash-2',14,'color:var(--danger)')}
      </button>
    </div>`;
  },

  /* ── Exercise picker modal ── */
  openExPicker(routineId) {
    const catalog = RoutineService.catalog;
    const grouped = {};
    catalog.forEach(e => {
      if (!grouped[e.muscle]) grouped[e.muscle] = [];
      grouped[e.muscle].push(e);
    });

    MODAL.open({
      title: 'Añadir ejercicio',
      size: 'md',
      body: `
        <div class="input-wrap mb-4">
          ${UTILS.icon('search', 14)}
          <input class="form-input" id="ex-search" placeholder="Buscar ejercicio..."
                 oninput="RoutinesPage.filterCatalog(this.value)">
        </div>
        <div id="ex-catalog" style="max-height:360px;overflow-y:auto">
          ${Object.entries(grouped).map(([muscle, exs]) => `
            <div class="text-xs font-semibold text-muted uppercase tracking-wide mb-2 mt-3">${muscle}</div>
            ${exs.map(e => `
              <div class="list-row" style="padding:10px 0"
                   onclick="RoutinesPage.addEx('${routineId}','${UTILS.esc(e.name)}');MODAL.close()">
                <div style="flex:1">
                  <div class="text-sm font-medium">${UTILS.esc(e.name)}</div>
                  <div class="text-xs text-muted">${UTILS.esc(e.equipment)}</div>
                </div>
                ${UTILS.icon('plus', 14, 'color:var(--accent);flex-shrink:0')}
              </div>
            `).join('')}
          `).join('')}
        </div>`
    });
  },

  filterCatalog(val) {
    const q = val.toLowerCase();
    const container = document.getElementById('ex-catalog');
    if (!container) return;
    const rows = container.querySelectorAll('.list-row');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  },

  /* ── Actions ── */
  createNew() {
    const res = RoutineService.create({ name: 'Nueva rutina', days: [0,2,4] });
    if (res.ok) {
      this._builderRoutineId = res.routine.id;
      APP.renderCurrentView();
    }
  },

  openBuilder(id) {
    this._builderRoutineId = id;
    APP.renderCurrentView();
  },

  closeBuilder() {
    this._builderRoutineId = null;
    APP.renderCurrentView();
  },

  setFilter(f) { this._filter = f; APP.renderCurrentView(); },

  toggleStatus(id) {
    const r = RoutineService.getById(id);
    if (!r) return;
    r.status === 'active' ? RoutineService.deactivate(id) : RoutineService.activate(id);
    TOAST.success(`Rutina ${r.status === 'active' ? 'pausada' : 'activada'}.`);
    APP.renderCurrentView();
  },

  updateName(id, name) {
    RoutineService.update(id, { name });
  },

  updateDesc(id, description) {
    RoutineService.update(id, { description });
  },

  toggleDay(routineId, dayIdx, btn) {
    const r = RoutineService.getById(routineId);
    if (!r) return;
    let days = [...r.days];
    if (days.includes(dayIdx)) {
      days = days.filter(d => d !== dayIdx);
      btn.classList.remove('active');
    } else {
      days.push(dayIdx);
      btn.classList.add('active');
    }
    RoutineService.update(routineId, { days });
  },

  addEx(routineId, name) {
    RoutineService.addExercise(routineId, { name, sets: 3, reps: '10', rest: 60, notes: '' });
    this._builderRoutineId = routineId;
    APP.renderCurrentView();
    TOAST.success(`"${name}" añadido ✓`);
  },

  removeEx(routineId, exId) {
    MODAL.confirm({
      title: '¿Eliminar ejercicio?',
      message: 'Se eliminará de esta rutina. No afecta a los historiales.',
      confirmLabel: 'Eliminar',
      danger: true,
      onConfirm: () => {
        RoutineService.removeExercise(routineId, exId);
        this._refreshExList(routineId);
      }
    });
  },

  moveEx(routineId, exId, dir) {
    RoutineService.moveExercise(routineId, exId, dir);
    this._refreshExList(routineId);
  },

  updateExField(routineId, exId, field, value) {
    const r = RoutineService.getById(routineId);
    if (!r) return;
    const exs = r.exercises.map(e => e.id === exId ? {...e, [field]: field==='sets'||field==='rest' ? parseInt(value)||0 : value} : e);
    RoutineService.update(routineId, { exercises: exs });
  },

  _refreshExList(routineId) {
    const r = RoutineService.getById(routineId);
    const container = document.getElementById(`exercise-list-${routineId}`);
    if (!container || !r) return;
    container.innerHTML = r.exercises.length
      ? r.exercises.map((e, i) => this._renderExerciseRow(e, i, routineId)).join('')
      : `<div class="text-center text-muted p-6 text-sm">Sin ejercicios.</div>`;
    UTILS.initIcons();
  },

  openAssignModal(routineId) {
    const clients = ClientService.getAll().filter(c => c.routineId !== routineId);
    MODAL.open({
      title: 'Asignar rutina a cliente',
      body: clients.length ? clients.map(c => `
        <div class="list-row">
          <div class="avatar avatar-${c.avatar}" style="width:34px;height:34px;font-size:12px">${UTILS.initials(c.name)}</div>
          <div style="flex:1">
            <div class="text-sm font-semibold">${UTILS.esc(c.name)}</div>
            <div class="text-xs text-muted">${UTILS.esc(c.goal)}</div>
          </div>
          <button class="btn btn-accent btn-sm" onclick="RoutinesPage._assignTo('${routineId}','${c.id}')">
            Asignar
          </button>
        </div>
      `).join('') : `<div class="text-center text-muted p-6">Todos los clientes ya tienen esta rutina asignada.</div>`
    });
  },

  _assignTo(routineId, clientId) {
    ClientService.assignRoutine(clientId, routineId);
    MODAL.close();
    TOAST.success('Rutina asignada correctamente ✓');
    APP.renderCurrentView();
  },

  unassign(routineId, clientId) {
    const c = ClientService.getById(clientId);
    MODAL.confirm({
      title: `Desasignar rutina a ${c?.name}`,
      message: 'El cliente perderá acceso a esta rutina en su portal.',
      onConfirm: () => {
        ClientService.update(clientId, { routineId: null });
        TOAST.info('Rutina desasignada.');
        APP.renderCurrentView();
      }
    });
  },

  saveRoutine(id) {
    TOAST.success('Rutina guardada correctamente ✓');
  },

  _duplicate() {
    TOAST.info('Selecciona una rutina para duplicarla.');
  },

  afterRender() {
    UTILS.initIcons();
  }
};
