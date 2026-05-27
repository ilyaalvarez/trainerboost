/* ============================================================
   TRAINERFLOW — FACTURACIÓN
   ============================================================ */

const BillingPage = {

  render() {
    const u    = STATE.currentUser;
    const plan = CONFIG.plans[u?.plan || 'free'];
    const stats= ClientService.globalStats();

    return `
    <div id="billing-view" class="animate-in">
      <div class="page-header">
        <div>
          <div class="page-title">Facturación</div>
          <div class="page-subtitle">Gestiona tu plan y métodos de pago</div>
        </div>
      </div>

      <div class="grid-2 gap-5">
        <!-- Left column -->
        <div>
          <!-- Plan actual -->
          <div class="card mb-5">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="font-bold text-md mb-1">
                  Plan ${plan.name}
                  <span class="plan-badge ${u?.plan} ml-2">${plan.badge}</span>
                </div>
                <div class="text-xs text-muted">Facturación mensual · Próximo cargo: 15 Jun 2026</div>
              </div>
              <span class="badge badge-success">Activo</span>
            </div>

            <div style="font-family:var(--font-display);font-size:40px;color:var(--accent);letter-spacing:-0.01em;margin-bottom:var(--space-1)">
              ${plan.price}€<span style="font-size:16px;color:var(--text-muted);font-family:var(--font-body)">/mes</span>
            </div>
            ${plan.price > 0 ? `<div class="text-xs text-muted mb-4">O ${UTILS.formatCurrency(plan.priceAnnual)}/año con facturación anual (−20%)</div>` : ''}

            <!-- Usage meters -->
            <div class="mb-3">
              <div class="flex justify-between text-xs mb-2">
                <span class="text-muted">Clientes activos</span>
                <span class="font-semibold">${stats.active} / ${plan.maxClients === Infinity ? '∞' : plan.maxClients}</span>
              </div>
              <div class="progress-wrap">
                <div class="progress-bar ${plan.maxClients !== Infinity && stats.active/plan.maxClients > 0.8 ? 'warning' : ''}"
                     style="width:${plan.maxClients === Infinity ? 25 : Math.min(100, Math.round((stats.active/plan.maxClients)*100))}%"></div>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex justify-between text-xs mb-2">
                <span class="text-muted">Rutinas creadas</span>
                <span class="font-semibold">${DATA.routines.filter(r=>r.trainerId===u?.id).length} / ${plan.maxRoutines === Infinity ? '∞' : plan.maxRoutines}</span>
              </div>
              <div class="progress-wrap">
                <div class="progress-bar" style="width:${plan.maxRoutines === Infinity ? 15 : 0}%"></div>
              </div>
            </div>

            <div class="flex gap-3">
              ${u?.plan !== 'pro' ? `
                <button class="btn btn-accent flex-1" onclick="BillingPage.openUpgrade()">
                  ${UTILS.icon('arrow-up',14)} Actualizar a Pro
                </button>` : ''}
              <button class="btn btn-outline flex-1" onclick="BillingPage.openAnnualOffer()">
                Anual −20%
              </button>
            </div>
          </div>

          <!-- Historial facturas -->
          <div class="card">
            <div class="card-title mb-4">Historial de pagos</div>
            <div class="table-wrap" style="border:none">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${DATA.invoices.map(inv => `
                    <tr>
                      <td class="text-xs">${UTILS.formatDate(inv.date, {day:'numeric',month:'short',year:'numeric'})}</td>
                      <td class="text-sm">${UTILS.esc(inv.concept)}</td>
                      <td class="font-semibold">${UTILS.formatCurrency(inv.amount)}</td>
                      <td><span class="badge badge-success text-xs">${UTILS.icon('check',10)} Pagado</span></td>
                      <td>
                        <button class="btn btn-ghost btn-sm" onclick="BillingPage.downloadInvoice('${inv.id}')">
                          ${UTILS.icon('download', 12)} PDF
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div>
          <!-- Payment method -->
          <div class="card mb-5">
            <div class="card-title mb-4">Método de pago</div>
            <div class="card-sm flex items-center gap-3 mb-4">
              ${UTILS.icon('credit-card', 24, 'color:var(--info);flex-shrink:0')}
              <div style="flex:1">
                <div class="font-semibold text-sm">Visa •••• •••• •••• 4242</div>
                <div class="text-xs text-muted">Caduca 12/28</div>
              </div>
              <span class="badge badge-success">Principal</span>
            </div>
            <div class="flex gap-3">
              <button class="btn btn-outline btn-sm flex-1" onclick="BillingPage.addPayment()">
                ${UTILS.icon('plus', 13)} Añadir método
              </button>
              <button class="btn btn-ghost btn-sm" onclick="BillingPage.editPayment()">
                ${UTILS.icon('edit', 13)} Editar
              </button>
            </div>
          </div>

          <!-- Plan comparison -->
          <div class="card mb-5">
            <div class="card-title mb-4">Comparativa de planes</div>
            ${['Clientes','Rutinas','Check-ins','Mensajes','Alertas automáticas','Analytics avanzado','Export CSV','Soporte WhatsApp'].map(f => {
              const freeHas    = ['Clientes','Rutinas','Check-ins','Mensajes'].includes(f);
              const starterHas = !['Analytics avanzado','Export CSV','Soporte WhatsApp'].includes(f);
              const proHas     = true;
              const limits = {
                'Clientes': ['3', '20', '∞'],
                'Rutinas':  ['2', '∞', '∞']
              };
              return `
              <div class="flex items-center gap-3 py-2 border-b" style="border-color:var(--border)">
                <div style="flex:1;font-size:var(--text-sm)">${f}</div>
                <div class="text-center" style="width:48px">
                  ${limits[f] ? `<span class="text-xs font-semibold">${limits[f][0]}</span>` : (freeHas ? UTILS.icon('check',13,'color:var(--success)') : UTILS.icon('minus',13,'color:var(--text-dim)'))}
                </div>
                <div class="text-center" style="width:64px">
                  ${limits[f] ? `<span class="text-xs font-semibold">${limits[f][1]}</span>` : (starterHas ? UTILS.icon('check',13,'color:var(--success)') : UTILS.icon('minus',13,'color:var(--text-dim)'))}
                </div>
                <div class="text-center" style="width:48px">
                  ${limits[f] ? `<span class="text-xs font-semibold text-accent">${limits[f][2]}</span>` : UTILS.icon('check',13,'color:var(--accent)')}
                </div>
              </div>`;
            }).join('')}
            <div class="flex gap-3 pt-3">
              <div style="flex:1"></div>
              <div class="text-center text-xs text-muted" style="width:48px">Free</div>
              <div class="text-center text-xs text-muted" style="width:64px">Starter</div>
              <div class="text-center text-xs text-accent font-bold" style="width:48px">Pro</div>
            </div>
          </div>

          <!-- Danger zone -->
          ${u?.plan !== 'free' ? `
          <div class="card" style="border-color:rgba(255,68,68,0.15)">
            <div class="card-title mb-3" style="color:var(--danger)">Zona de peligro</div>
            <p class="text-xs text-muted mb-4">Si cancelas tu suscripción, perderás acceso a las funciones de pago al final del período actual.</p>
            <button class="btn btn-danger btn-sm w-full" onclick="BillingPage.cancelSubscription()">
              ${UTILS.icon('x-circle', 13)} Cancelar suscripción
            </button>
          </div>` : ''}
        </div>
      </div>
    </div>`;
  },

  openUpgrade() {
    MODAL.open({
      title: 'Actualizar a Pro',
      size: 'md',
      body: `
        <div class="text-center mb-5">
          <div style="font-family:var(--font-display);font-size:48px;color:var(--accent);letter-spacing:-0.02em">29€</div>
          <div class="text-muted text-sm">/mes · o 278€/año (−20%)</div>
        </div>
        <div class="feature-list mb-5">
          ${['Clientes ilimitados','Analytics avanzado','Export CSV','Soporte WhatsApp priority','Todo lo de Starter incluido'].map(f => `
            <div class="feature-item">${UTILS.icon('check',14)} ${f}</div>
          `).join('')}
        </div>
        <div class="card-sm" style="background:var(--accent-dim);border-color:var(--accent-glow)">
          <div class="text-xs text-accent font-semibold mb-1">💳 Tarjeta guardada</div>
          <div class="text-xs text-muted">Visa •••• 4242 · Se cobrará hoy y cada mes</div>
        </div>`,
      footer: `
        <button class="btn btn-outline" onclick="MODAL.close()">Cancelar</button>
        <button class="btn btn-accent" onclick="BillingPage.confirmUpgrade('pro')">
          ${UTILS.icon('zap',14)} Actualizar ahora
        </button>`
    });
  },

  confirmUpgrade(planId) {
    AuthService.changePlan(planId);
    MODAL.close();
    TOAST.success('¡Plan actualizado a Pro! 🎉 Disfruta de todas las funciones.');
    APP.renderCurrentView();
  },

  openAnnualOffer() {
    const u = STATE.currentUser;
    const plan = CONFIG.plans[u?.plan || 'free'];
    const save = plan.price * 12 - plan.priceAnnual;
    MODAL.open({
      title: 'Facturación anual',
      body: `
        <div class="card-sm mb-4" style="background:var(--success-dim);border-color:rgba(34,197,94,0.2);text-align:center">
          <div style="font-family:var(--font-display);font-size:var(--text-2xl);color:var(--success)">${UTILS.formatCurrency(save)}/año</div>
          <div class="text-xs text-muted mt-1">de ahorro cambiando a facturación anual</div>
        </div>
        <p class="text-sm text-muted" style="line-height:1.6">
          En lugar de ${UTILS.formatCurrency(plan.price)}/mes pagas ${UTILS.formatCurrency(plan.priceAnnual)} una sola vez al año.
          El cambio se aplica en el próximo período de facturación.
        </p>`,
      footer: `
        <button class="btn btn-outline" onclick="MODAL.close()">Cancelar</button>
        <button class="btn btn-accent" onclick="BillingPage._switchAnnual()">Cambiar a anual</button>`
    });
  },

  _switchAnnual() {
    MODAL.close();
    TOAST.success('Cambiado a facturación anual. Ahorra 2 meses gratis 🎉');
  },

  cancelSubscription() {
    MODAL.confirm({
      title: '¿Seguro que quieres cancelar?',
      message: '¿Seguro? Perderás acceso a Analytics, exportación y soporte priority. Te ofrecemos 1 mes gratis si te quedas.',
      confirmLabel: 'Cancelar de todas formas',
      cancelLabel: '1 mes gratis → Quedarme',
      danger: true,
      onConfirm: () => {
        AuthService.changePlan('free');
        TOAST.info('Suscripción cancelada. Acceso hasta el 15 Jun 2026.');
        APP.renderCurrentView();
      }
    });
  },

  downloadInvoice(invId) {
    TOAST.success('PDF generado y descargado ✓');
  },

  addPayment() {
    TOAST.info('Redirigiendo al gestor de pagos seguro...');
  },

  editPayment() {
    TOAST.info('Editor de método de pago disponible próximamente.');
  },

  afterRender() {
    UTILS.initIcons();
  }
};
