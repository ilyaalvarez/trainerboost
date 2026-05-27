/* ============================================================
   TRAINERFLOW — DASHBOARD PRINCIPAL
   ============================================================ */

const DashboardPage = {

  render() {
    const u     = STATE.currentUser;
    const stats = ClientService.globalStats();
    const ciStats = CheckinService.weekStats();
    const attention = ClientService.needsAttention();
    const recentCheckins = CheckinService.getAll().slice(0, 5);

    const greeting = UTILS.greeting();
    const date = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' });

    return `
    <div id="dashboard-view" class="animate-in">

      <!-- Greeting -->
      <div class="dash-greeting">
        <div>
          <div class="dash-greeting-name">${greeting}, ${u ? u.name.split(' ')[0] : ''} 👋</div>
          <div class="dash-greeting-sub">${date} · ${stats.active} clientes activos</div>
        </div>
        <div class="flex gap-2 items-center flex-wrap">
          ${ciStats.done > 0 ? `<span class="badge badge-accent">${UTILS.icon('clipboard-check',11)} ${ciStats.done} check-ins hoy</span>` : ''}
          <button class="btn btn-outline btn-sm" onclick="APP.navigate('checkins')">
            ${UTILS.icon('calendar', 14)} Ver semana
          </button>
          <button class="btn btn-accent btn-sm" onclick="DashboardPage.quickCheckin()">
            ${UTILS.icon('plus', 14)} Check-in rápido
          </button>
        </div>
      </div>

      <!-- KPI Row -->
      <div class="grid-4 mb-6">
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('users',13)} Clientes activos</div>
          <div class="metric-value accent">${stats.active}</div>
          <div class="metric-change up">${UTILS.icon('trending-up',11)} +2 este mes</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('clipboard-check',13)} Check-ins esta semana</div>
          <div class="metric-value">${ciStats.done}<span style="font-size:16px;color:var(--text-muted)">/${ciStats.total}</span></div>
          <div class="metric-change ${ciStats.done/ciStats.total >= 0.7 ? 'up' : 'down'}">
            ${UTILS.icon(ciStats.done/ciStats.total >= 0.7 ? 'trending-up' : 'trending-down',11)}
            ${ciStats.total ? Math.round((ciStats.done/ciStats.total)*100) : 0}% completados
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('bar-chart-2',13)} Adherencia media</div>
          <div class="metric-value accent">${stats.avgAdherence}%</div>
          <div class="metric-change up">${UTILS.icon('trending-up',11)} +4% vs semana ant.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('shield-check',13)} Tasa retención</div>
          <div class="metric-value">${stats.retention}%</div>
          <div class="metric-change neutral">${UTILS.icon('minus',11)} Sin cambios</div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid-2 mb-6">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Adherencia semanal</div>
            <span class="card-action">Últimas 8 semanas</span>
          </div>
          <div class="chart-container" style="height:180px">
            <canvas id="chart-adherence"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">Distribución de objetivos</div>
            <span class="card-action">${stats.active} clientes</span>
          </div>
          <div class="chart-container" style="height:180px">
            <canvas id="chart-goals"></canvas>
          </div>
        </div>
      </div>

      <!-- Activity + Quick actions -->
      <div class="grid-2 mb-6">
        <!-- Recent checkins -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Check-ins recientes</div>
            <span class="card-action" onclick="APP.navigate('checkins')">Ver todos →</span>
          </div>
          ${recentCheckins.length ? recentCheckins.map(ci => {
            const client = ClientService.getById(ci.clientId);
            if (!client) return '';
            const cls = UTILS.adherenceClass(ci.adherence);
            return `
            <div class="list-row" onclick="APP.navigate('clients');STATE.activeClientId='${client.id}'">
              <div class="status-dot ${ci.adherence >= 80 ? 'green' : ci.adherence >= 60 ? 'yellow' : 'red'}"></div>
              <div class="avatar avatar-${client.avatar}" style="width:34px;height:34px;font-size:12px;flex-shrink:0">${UTILS.initials(client.name)}</div>
              <div style="flex:1;min-width:0">
                <div class="list-row-name truncate">${UTILS.esc(client.name)}</div>
                <div class="list-row-meta">Energía ${ci.energy}/10 · Adherencia ${ci.adherence}%</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <span class="badge badge-${cls}" style="font-size:10px">${ci.adherence >= 80 ? 'Bien' : ci.adherence >= 60 ? 'Revisar' : 'Atención'}</span>
                <div class="text-xs text-muted mt-1">${UTILS.timeAgo(ci.date)}</div>
              </div>
            </div>`;
          }).join('') : `<div class="empty-state"><div class="text-muted text-sm">Sin check-ins esta semana aún</div></div>`}
        </div>

        <!-- Quick actions -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Acciones rápidas</div>
          </div>
          <div class="quick-actions mb-4">
            ${[
              {icon:'user-plus', label:'Añadir cliente', color:'var(--accent)', act:"APP.navigate('clients')"},
              {icon:'dumbbell',  label:'Nueva rutina',   color:'var(--info)',   act:"APP.navigate('routines')"},
              {icon:'send',      label:'Mensaje grupal', color:'var(--success)',act:"APP.navigate('messages')"},
              {icon:'bar-chart-2',label:'Ver analytics',color:'var(--warning)',act:"APP.navigate('analytics')"}
            ].map(a => `
              <div class="quick-action-btn" onclick="${a.act}">
                <div class="quick-action-icon" style="background:rgba(0,0,0,0.2)">
                  ${UTILS.icon(a.icon, 20, `color:${a.color}`)}
                </div>
                <div class="quick-action-label">${a.label}</div>
              </div>
            `).join('')}
          </div>

          <!-- Progreso de plan -->
          <div class="card-sm">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs text-muted">Clientes activos</span>
              <span class="text-xs font-semibold">${stats.active} / ${STATE.plan.maxClients === Infinity ? '∞' : STATE.plan.maxClients}</span>
            </div>
            <div class="progress-wrap">
              <div class="progress-bar" style="width:${STATE.plan.maxClients === Infinity ? 30 : Math.round((stats.active / STATE.plan.maxClients)*100)}%"></div>
            </div>
            ${STATE.currentUser?.plan !== 'pro' ? `
              <div class="flex justify-between items-center mt-3">
                <span class="text-xs text-muted">Plan ${STATE.plan.badge}</span>
                <button class="btn btn-accent btn-sm" onclick="APP.navigate('billing')">
                  ${UTILS.icon('arrow-up',12)} Actualizar
                </button>
              </div>` : ''}
          </div>
        </div>
      </div>

      <!-- Attention alerts -->
      ${attention.length ? `
      <div class="card">
        <div class="card-header">
          <div class="card-title" style="color:var(--warning)">${UTILS.icon('alert-triangle',16, 'color:var(--warning);margin-right:6px')} Clientes que necesitan atención</div>
          <span class="badge badge-warning">${attention.length}</span>
        </div>
        <div class="grid-${Math.min(attention.length, 3)}">
          ${attention.map(c => {
            const days = UTILS.daysSince(c.lastCheckin);
            return `
            <div class="card-sm card-hover" onclick="STATE.activeClientId='${c.id}';APP.navigate('clients')">
              <div class="flex items-center gap-3 mb-3">
                <div class="avatar avatar-${c.avatar}" style="width:36px;height:36px;font-size:13px">${UTILS.initials(c.name)}</div>
                <div style="flex:1;min-width:0">
                  <div class="font-semibold text-sm truncate">${UTILS.esc(c.name)}</div>
                  <div class="text-xs text-muted">${UTILS.esc(c.goal)}</div>
                </div>
              </div>
              ${c.adherence < 55 ? `<span class="badge badge-danger text-xs">Adherencia ${c.adherence}%</span>` : ''}
              ${days > 7 ? `<span class="badge badge-warning text-xs">${days}d sin check-in</span>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

    </div>`;
  },

  afterRender() {
    UTILS.initIcons();
    // Inicializar charts tras render del DOM
    requestAnimationFrame(() => {
      CHARTS.adherenceLine('chart-adherence');
      CHARTS.goalDoughnut('chart-goals');
    });
  },

  quickCheckin() {
    const clients = ClientService.getAll();
    const options = clients.map(c => `<option value="${c.id}">${UTILS.esc(c.name)}</option>`).join('');

    MODAL.open({
      title: 'Check-in rápido',
      size: 'md',
      body: `
        <div class="form-group">
          <label class="form-label">Cliente</label>
          <select class="form-select" id="qci-client">${options}</select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Energía (1-10)</label>
            <input type="number" class="form-input" id="qci-energy" min="1" max="10" value="7">
          </div>
          <div class="form-group">
            <label class="form-label">Sueño (1-10)</label>
            <input type="number" class="form-input" id="qci-sleep" min="1" max="10" value="7">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Adherencia (%)</label>
            <input type="number" class="form-input" id="qci-adherence" min="0" max="100" value="85">
          </div>
          <div class="form-group">
            <label class="form-label">Peso (kg)</label>
            <input type="number" class="form-input" id="qci-weight" placeholder="70.5" step="0.1">
          </div>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Notas</label>
          <textarea class="form-textarea" id="qci-notes" placeholder="Observaciones de la semana..."></textarea>
        </div>`,
      footer: `
        <button class="btn btn-outline" onclick="MODAL.close()">Cancelar</button>
        <button class="btn btn-accent" onclick="DashboardPage._saveQuickCheckin()">
          ${UTILS.icon('save', 14)} Guardar check-in
        </button>`
    });
  },

  _saveQuickCheckin() {
    const clientId  = document.getElementById('qci-client')?.value;
    const energy    = parseFloat(document.getElementById('qci-energy')?.value) || 7;
    const sleep     = parseFloat(document.getElementById('qci-sleep')?.value) || 7;
    const adherence = parseInt(document.getElementById('qci-adherence')?.value) || 85;
    const weight    = parseFloat(document.getElementById('qci-weight')?.value) || 0;
    const notes     = document.getElementById('qci-notes')?.value || '';

    const res = CheckinService.create({ clientId, energy, sleep, adherence, weight, notes });
    if (res.ok) {
      MODAL.close();
      TOAST.success('Check-in registrado correctamente ✓');
      APP.renderCurrentView();
    }
  }
};
