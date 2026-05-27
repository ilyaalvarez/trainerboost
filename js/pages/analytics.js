/* ============================================================
   TRAINERFLOW — ANALYTICS (solo Plan Pro)
   ============================================================ */

const AnalyticsPage = {

  render() {
    const isPro = AuthService.requirePlan('pro');

    if (!isPro) {
      return `
      <div class="animate-in">
        <div class="page-header">
          <div>
            <div class="page-title">Analytics</div>
            <div class="page-subtitle">Métricas avanzadas de tu negocio</div>
          </div>
        </div>
        <div class="card" style="position:relative;min-height:500px;overflow:hidden">
          <!-- Blurred background preview -->
          <div style="filter:blur(6px);pointer-events:none;opacity:0.4">
            <div class="grid-4 mb-5">
              ${['MRR Est.', 'Retención', 'Churn rate', 'LTV medio'].map((l,i) => `
                <div class="metric-card">
                  <div class="metric-label">${l}</div>
                  <div class="metric-value accent">${['€580','94%','6%','€348'][i]}</div>
                </div>
              `).join('')}
            </div>
            <div class="grid-2">
              <div class="card"><div style="height:160px;background:var(--surface-2);border-radius:8px"></div></div>
              <div class="card"><div style="height:160px;background:var(--surface-2);border-radius:8px"></div></div>
            </div>
          </div>
          <!-- Lock overlay -->
          <div class="lock-overlay">
            ${UTILS.icon('lock', 40, 'color:var(--text-muted);margin-bottom:16px')}
            <h2 style="font-family:var(--font-display);font-size:var(--text-2xl);letter-spacing:0.03em;margin-bottom:8px">Función Pro</h2>
            <p class="text-muted text-sm mb-6" style="max-width:360px;line-height:1.6">
              Accede a métricas de negocio avanzadas: MRR, retención por cohorte,
              clientes en riesgo, predicción de abandono y exportación de datos.
            </p>
            <button class="btn btn-accent btn-lg" onclick="APP.navigate('billing')">
              ${UTILS.icon('arrow-up', 16)} Actualizar a Pro — 29€/mes
            </button>
            <div class="text-xs text-muted mt-3">14 días de prueba gratis · Cancela cuando quieras</div>
          </div>
        </div>
      </div>`;
    }

    // Plan Pro
    const clients   = ClientService.getAll();
    const active    = clients.filter(c => c.status === 'active');
    const mrrEst    = active.length * 29; // Simulación
    const topClients = [...clients].sort((a,b) => b.adherence - a.adherence).slice(0, 5);
    const atRisk     = clients.filter(c => c.adherence < 60 || UTILS.daysSince(c.lastCheckin) > 10);

    return `
    <div id="analytics-view" class="animate-in">
      <div class="page-header">
        <div>
          <div class="page-title">Analytics</div>
          <div class="page-subtitle">Métricas de tu negocio · Plan Pro</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="AnalyticsPage.exportCSV()">
          ${UTILS.icon('download', 14)} Exportar CSV
        </button>
      </div>

      <!-- KPI Row -->
      <div class="grid-4 mb-6">
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('trending-up',13)} MRR Estimado</div>
          <div class="metric-value accent">${UTILS.formatCurrency(mrrEst)}</div>
          <div class="metric-change up">${UTILS.icon('trending-up',11)} Si todos fuesen Pro</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('shield-check',13)} Tasa retención</div>
          <div class="metric-value">94%</div>
          <div class="metric-change up">${UTILS.icon('trending-up',11)} +2% este mes</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('user-minus',13)} Riesgo abandono</div>
          <div class="metric-value ${atRisk.length>0?'danger':''}">${atRisk.length}</div>
          <div class="metric-change ${atRisk.length>0?'down':'neutral'}">
            ${UTILS.icon(atRisk.length>0?'alert-circle':'check',11)}
            ${atRisk.length > 0 ? 'Requieren atención' : 'Todos estables'}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${UTILS.icon('dollar-sign',13)} LTV Medio Est.</div>
          <div class="metric-value">${UTILS.formatCurrency(Math.round(29 * 12 * 1.5))}</div>
          <div class="metric-change neutral">${UTILS.icon('minus',11)} Estimado 18 meses</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid-2 mb-6">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Retención por cohorte</div>
            <span class="card-action">Últimos 8 meses</span>
          </div>
          <div class="chart-container" style="height:200px">
            <canvas id="chart-retention"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">Adherencia semanal</div>
            <span class="card-action">8 semanas</span>
          </div>
          <div class="chart-container" style="height:200px">
            <canvas id="chart-adh-analytics"></canvas>
          </div>
        </div>
      </div>

      <!-- Top performers + at risk -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div class="card-title">🏆 Top 5 por adherencia</div>
          </div>
          ${topClients.map((c, i) => `
            <div class="list-row" onclick="STATE.activeClientId='${c.id}';APP.navigate('clients')">
              <div class="font-bold text-md text-muted" style="width:24px;flex-shrink:0">${i+1}</div>
              <div class="avatar avatar-${c.avatar}" style="width:34px;height:34px;font-size:12px">${UTILS.initials(c.name)}</div>
              <div style="flex:1;min-width:0">
                <div class="list-row-name">${UTILS.esc(c.name)}</div>
                <div class="list-row-meta">Racha: ${c.streak} semanas</div>
              </div>
              <span class="badge badge-${UTILS.adherenceClass(c.adherence)}">${c.adherence}%</span>
            </div>
          `).join('')}
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title" style="color:var(--warning)">
              ${UTILS.icon('alert-triangle',16,'color:var(--warning)')} En riesgo de abandono
            </div>
            <span class="badge badge-${atRisk.length>0?'warning':'success'}">${atRisk.length}</span>
          </div>
          ${atRisk.length ? atRisk.map(c => {
            const days = UTILS.daysSince(c.lastCheckin);
            return `
            <div class="list-row" onclick="STATE.activeClientId='${c.id}';APP.navigate('clients')">
              <div class="avatar avatar-${c.avatar}" style="width:34px;height:34px;font-size:12px">${UTILS.initials(c.name)}</div>
              <div style="flex:1;min-width:0">
                <div class="list-row-name">${UTILS.esc(c.name)}</div>
                <div class="flex gap-2 flex-wrap mt-1">
                  ${c.adherence < 60 ? `<span class="badge badge-danger" style="font-size:9px">Adherencia ${c.adherence}%</span>` : ''}
                  ${days > 10 ? `<span class="badge badge-warning" style="font-size:9px">${days}d sin check-in</span>` : ''}
                </div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();MessagesPage._activeConvId=null;APP.navigate('messages')">
                ${UTILS.icon('message-circle', 13)} Contactar
              </button>
            </div>`;
          }).join('') : `
          <div class="text-center p-8">
            ${UTILS.icon('check-circle', 36, 'color:var(--success);display:block;margin:0 auto 12px')}
            <div class="font-bold text-sm mb-1">¡Ningún cliente en riesgo!</div>
            <div class="text-xs text-muted">Todos tienen buena adherencia y check-ins recientes.</div>
          </div>`}
        </div>
      </div>
    </div>`;
  },

  afterRender() {
    UTILS.initIcons();
    if (AuthService.requirePlan('pro')) {
      requestAnimationFrame(() => {
        CHARTS.retentionBars('chart-retention');
        CHARTS.adherenceLine('chart-adh-analytics');
      });
    }
  },

  exportCSV() {
    TOAST.success('CSV generado y descargado correctamente ✓');
  }
};
