/* ============================================================
   TRAINERFLOW — MÓDULO DE CHECK-INS
   ============================================================ */

const CheckinsPage = {
  _expandedId: null,

  render() {
    const stats   = CheckinService.weekStats();
    const thisWeek= CheckinService.thisWeek();
    const missing = CheckinService.missingClients();
    const pending = CheckinService.pendingReview();
    const allClients = ClientService.getAll({ status: 'active' });

    return `
    <div id="checkins-view" class="animate-in">
      <div class="page-header">
        <div>
          <div class="page-title">Check-ins</div>
          <div class="page-subtitle">
            Semana ${UTILS.currentWeek()} ·
            ${stats.done}/${stats.total} recibidos ·
            ${pending.length} pendientes de revisión
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" onclick="CheckinsPage.sendReminder()">
            ${UTILS.icon('send', 14)} Recordatorio masivo
          </button>
          <button class="btn btn-accent btn-sm" onclick="DashboardPage.quickCheckin()">
            ${UTILS.icon('plus', 14)} Añadir manual
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-4 mb-6">
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('check-circle',13)} Completados</div>
          <div class="metric-value accent">${stats.done}</div>
          <div class="metric-change neutral">${UTILS.icon('users',11)} de ${stats.total} clientes</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('clock',13)} Pendientes</div>
          <div class="metric-value ${stats.pending > 0 ? 'warning' : ''}">${stats.pending}</div>
          <div class="metric-change ${stats.pending>0?'down':'neutral'}">
            ${UTILS.icon(stats.pending>0?'alert-circle':'check',11)}
            ${stats.pending > 0 ? 'Sin responder' : 'Todo al día'}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('zap',13)} Energía media</div>
          <div class="metric-value accent">${stats.avgEnergy}</div>
          <div class="metric-change neutral">${UTILS.icon('minus',11)} /10 esta semana</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('bar-chart',13)} Adherencia media</div>
          <div class="metric-value">${stats.avgAdherence}%</div>
          <div class="metric-change ${stats.avgAdherence>=75?'up':'down'}">
            ${UTILS.icon(stats.avgAdherence>=75?'trending-up':'trending-down',11)}
            ${stats.avgAdherence >= 75 ? 'Buen ritmo' : 'Por debajo del objetivo'}
          </div>
        </div>
      </div>

      <div class="grid-2 gap-5">
        <!-- Check-ins recibidos -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Recibidos esta semana</div>
            <div class="flex gap-2">
              <span class="badge badge-accent">${thisWeek.length} ok</span>
              ${pending.length ? `<span class="badge badge-warning">${pending.length} sin revisar</span>` : ''}
            </div>
          </div>
          ${thisWeek.length ? thisWeek.map(ci => this._renderCheckinRow(ci)).join('')
            : `<div class="text-center text-muted p-6 text-sm">Aún no hay check-ins esta semana</div>`}
        </div>

        <!-- Pendientes -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Sin check-in esta semana</div>
            <span class="badge badge-${missing.length>0?'danger':'success'}">${missing.length} clientes</span>
          </div>
          ${missing.length ? missing.map(c => {
            const days = UTILS.daysSince(c.lastCheckin);
            return `
            <div class="list-row">
              <div class="status-dot ${days > 14 ? 'red' : 'yellow'}"></div>
              <div class="avatar avatar-${c.avatar}" style="width:34px;height:34px;font-size:12px">${UTILS.initials(c.name)}</div>
              <div style="flex:1;min-width:0">
                <div class="list-row-name">${UTILS.esc(c.name)}</div>
                <div class="list-row-meta">${c.lastCheckin ? `Último: ${UTILS.timeAgo(c.lastCheckin)}` : 'Nunca ha enviado'}</div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="CheckinsPage.sendSingleReminder('${c.id}')">
                ${UTILS.icon('send', 12)} Recordar
              </button>
            </div>`;
          }).join('') : `
          <div class="text-center p-8">
            ${UTILS.icon('check-circle', 40, 'color:var(--success);display:block;margin:0 auto 12px')}
            <div class="font-bold text-sm mb-1">¡Todo al día!</div>
            <div class="text-xs text-muted">Todos tus clientes han enviado su check-in</div>
          </div>`}
        </div>
      </div>

      <!-- Full list -->
      <div class="card mt-5">
        <div class="card-header">
          <div class="card-title">Todos los clientes — Semana ${UTILS.currentWeek()}</div>
        </div>
        ${allClients.map(c => {
          const ci = thisWeek.find(ci => ci.clientId === c.id);
          return this._renderClientWeekRow(c, ci);
        }).join('')}
      </div>
    </div>`;
  },

  _renderCheckinRow(ci) {
    const c = ClientService.getById(ci.clientId);
    if (!c) return '';
    const isExpanded = this._expandedId === ci.id;
    const cls = UTILS.adherenceClass(ci.adherence);

    return `
    <div>
      <div class="list-row" style="cursor:pointer" onclick="CheckinsPage.toggleExpand('${ci.id}')">
        <div class="status-dot ${ci.adherence>=80?'green':ci.adherence>=60?'yellow':'red'}"></div>
        <div class="avatar avatar-${c.avatar}" style="width:34px;height:34px;font-size:12px">${UTILS.initials(c.name)}</div>
        <div style="flex:1;min-width:0">
          <div class="list-row-name">${UTILS.esc(c.name)}</div>
          <div class="flex gap-3 mt-1 flex-wrap">
            <span class="text-xs text-muted">⚡ <strong>${ci.energy}</strong>/10</span>
            <span class="text-xs text-muted">😴 <strong>${ci.sleep}</strong>/10</span>
            <span class="text-xs text-muted">📋 <span class="text-${cls} font-semibold">${ci.adherence}%</span></span>
            <span class="text-xs text-muted">⚖️ <strong>${ci.weight}</strong> kg</span>
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <span class="badge badge-${ci.reviewed ? 'success' : 'warning'} text-xs">${ci.reviewed ? 'Revisado' : 'Pendiente'}</span>
          ${UTILS.icon(isExpanded ? 'chevron-up' : 'chevron-down', 14, 'color:var(--text-muted)')}
        </div>
      </div>
      ${isExpanded ? this._expandedCheckin(ci, c) : ''}
    </div>`;
  },

  _expandedCheckin(ci, c) {
    return `
    <div class="card-sm mb-2" style="margin-left:60px;animation:fadeInUp 0.15s ease both">
      ${ci.notes ? `<div class="text-sm text-muted mb-3 italic">"${UTILS.esc(ci.notes)}"</div>` : ''}
      ${!ci.trainerFeedback ? `
        <div class="form-group mb-2">
          <label class="form-label">Responder al cliente</label>
          <textarea class="form-textarea" id="fb-${ci.id}" style="height:60px"
                    placeholder="¡Buen trabajo! Sigue así..."></textarea>
        </div>
        <div class="flex gap-2">
          ${['¡Buen trabajo! 💪', '¿Cómo fue la semana?', 'Recuerda tu check-in'].map(t => `
            <button class="btn btn-ghost btn-sm" onclick="document.getElementById('fb-${ci.id}').value='${t}'">${t}</button>
          `).join('')}
          <button class="btn btn-accent btn-sm ml-auto" onclick="CheckinsPage.sendFeedback('${ci.id}')">
            ${UTILS.icon('send', 13)} Enviar
          </button>
        </div>
      ` : `
        <div class="text-xs text-accent font-semibold mb-1">✓ Feedback enviado</div>
        <div class="text-xs text-muted italic">"${UTILS.esc(ci.trainerFeedback)}"</div>
      `}
    </div>`;
  },

  _renderClientWeekRow(c, ci) {
    if (ci) {
      const cls = UTILS.adherenceClass(ci.adherence);
      return `
      <div class="list-row">
        <div class="avatar avatar-${c.avatar}" style="width:36px;height:36px;font-size:12px">${UTILS.initials(c.name)}</div>
        <div style="flex:1;min-width:0">
          <div class="list-row-name">${UTILS.esc(c.name)}</div>
          <div class="list-row-meta">${UTILS.esc(c.goal)}</div>
        </div>
        <span class="badge badge-success text-xs">${UTILS.icon('check',10)} Recibido</span>
        <div class="text-right flex-shrink-0" style="width:80px">
          <span class="badge badge-${cls}">${ci.adherence}%</span>
        </div>
      </div>`;
    } else {
      const days = UTILS.daysSince(c.lastCheckin);
      return `
      <div class="list-row">
        <div class="avatar avatar-${c.avatar}" style="width:36px;height:36px;font-size:12px">${UTILS.initials(c.name)}</div>
        <div style="flex:1;min-width:0">
          <div class="list-row-name">${UTILS.esc(c.name)}</div>
          <div class="list-row-meta">${UTILS.esc(c.goal)}</div>
        </div>
        <span class="badge badge-${days>14?'danger':'warning'} text-xs">Pendiente</span>
        <button class="btn btn-ghost btn-sm" onclick="CheckinsPage.sendSingleReminder('${c.id}')">
          ${UTILS.icon('send', 12)} Recordar
        </button>
      </div>`;
    }
  },

  toggleExpand(ciId) {
    this._expandedId = this._expandedId === ciId ? null : ciId;
    APP.renderCurrentView();
  },

  sendFeedback(ciId) {
    const text = document.getElementById(`fb-${ciId}`)?.value.trim();
    if (!text) { TOAST.error('Escribe un mensaje antes de enviar.'); return; }
    CheckinService.addFeedback(ciId, text);
    TOAST.success('Feedback enviado ✓');
    APP.renderCurrentView();
  },

  sendReminder() {
    const missing = CheckinService.missingClients();
    if (!missing.length) { TOAST.info('Todos los clientes ya respondieron esta semana.'); return; }
    TOAST.success(`Recordatorio enviado a ${missing.length} clientes vía WhatsApp 📱`);
  },

  sendSingleReminder(clientId) {
    const c = ClientService.getById(clientId);
    TOAST.success(`Recordatorio enviado a ${c?.name} ✓`);
  },

  afterRender() {
    UTILS.initIcons();
  }
};
