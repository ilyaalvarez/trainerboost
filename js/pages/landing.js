/* ============================================================
   TRAINERFLOW — LANDING PAGE
   ============================================================ */

const LandingPage = {

  render() {
    return `
    <div id="landing-view">

      <!-- ════ NAV ════ -->
      <nav class="landing-nav">
        <div class="landing-nav-logo">
          <div class="logo-mark">TF</div>
          <div class="logo-text">Trainer<span>Flow</span></div>
        </div>
        <div class="landing-nav-links">
          <a href="#features">Funciones</a>
          <a href="#pricing">Precios</a>
          <a href="#testimonials">Testimonios</a>
          <a href="#faq">FAQ</a>
        </div>
        <div class="landing-nav-ctas">
          <button class="btn btn-ghost btn-sm" onclick="APP.navigate('login')">Iniciar sesión</button>
          <button class="btn btn-accent btn-sm" onclick="APP.navigate('register')">Empezar gratis</button>
        </div>
      </nav>

      <!-- ════ HERO ════ -->
      <section class="hero-section" id="hero">
        <div class="hero-bg">
          <div class="hero-grid"></div>
          <div class="hero-orb"></div>
        </div>
        <div class="hero-content">
          <div class="hero-eyebrow">
            ${UTILS.icon('zap', 12)} Para entrenadores personales hispanohablantes
          </div>
          <h1 class="hero-headline">
            Gestiona.<br>
            <span class="accent-word">Fideliza.</span><br>
            Escala.
          </h1>
          <p class="hero-sub">
            La plataforma que los mejores PTs usan para dejar de perder horas en
            WhatsApp y Excel, y empezar a construir un negocio de verdad.
          </p>
          <div class="hero-ctas">
            <button class="btn btn-accent btn-xl" onclick="APP.navigate('register')">
              ${UTILS.icon('rocket', 18)} Empezar gratis — sin tarjeta
            </button>
            <button class="btn btn-outline btn-xl" onclick="LandingPage._demoLogin()">
              ${UTILS.icon('play', 18)} Ver demo en vivo
            </button>
          </div>
          <div class="hero-stats">
            <div class="hero-stat-item">
              <div class="hero-stat-num">2.400+</div>
              <div class="hero-stat-label">Entrenadores activos</div>
            </div>
            <div class="hero-stat-item">
              <div class="hero-stat-num">18.000+</div>
              <div class="hero-stat-label">Check-ins procesados</div>
            </div>
            <div class="hero-stat-item">
              <div class="hero-stat-num">4.9★</div>
              <div class="hero-stat-label">Valoración media</div>
            </div>
            <div class="hero-stat-item">
              <div class="hero-stat-num">98%</div>
              <div class="hero-stat-label">Tasa de retención</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ════ PROBLEM ════ -->
      <section class="problem-section" id="problem">
        <div class="section-eyebrow">El problema</div>
        <h2 class="section-heading">
          El 87% de los PTs pierde<br>8+ horas/semana en gestión
        </h2>
        <p class="text-muted text-base" style="max-width:580px;line-height:1.7">
          WhatsApp desordenado, Excel roto, PDFs de rutinas, sin seguimiento real...
          mientras tanto, tus clientes se pierden y tú no puedes escalar.
        </p>
        <div class="problem-cards">
          <div class="problem-card">
            <div class="problem-icon">${UTILS.icon('message-square', 22)}</div>
            <h3 class="font-bold text-md mb-2">Caos en las comunicaciones</h3>
            <p class="text-muted text-sm" style="line-height:1.6">
              Mensajes perdidos, clientes respondiendo en hilos mezclados,
              imposible hacer seguimiento de quién preguntó qué.
            </p>
          </div>
          <div class="problem-card">
            <div class="problem-icon">${UTILS.icon('trending-down', 22)}</div>
            <h3 class="font-bold text-md mb-2">Sin datos de progreso reales</h3>
            <p class="text-muted text-sm" style="line-height:1.6">
              Tus clientes te dicen "voy bien" pero no tienes métricas.
              Sin check-ins estructurados, no puedes optimizar ni demostrar resultados.
            </p>
          </div>
          <div class="problem-card">
            <div class="problem-icon">${UTILS.icon('alert-circle', 22)}</div>
            <h3 class="font-bold text-md mb-2">Imposible escalar</h3>
            <p class="text-muted text-sm" style="line-height:1.6">
              Con 10 clientes ya estás al límite. Añadir más significa más caos.
              Sin sistema, el techo de ingresos llega pronto.
            </p>
          </div>
        </div>
      </section>

      <!-- ════ FEATURES ════ -->
      <section class="features-section" id="features">
        <div style="text-align:center;margin-bottom:var(--space-12)">
          <div class="section-eyebrow">La solución</div>
          <h2 class="section-heading">Todo lo que necesitas, nada que no</h2>
        </div>

        <!-- Feature 1 -->
        <div class="feature-row">
          <div>
            <div class="badge badge-accent mb-4">Check-ins automáticos</div>
            <h3 class="font-display text-3xl mb-4" style="font-size:var(--text-2xl);letter-spacing:0.03em">
              Saber cómo están tus clientes sin preguntar
            </h3>
            <p class="text-muted text-sm mb-5" style="line-height:1.7">
              Cada cliente envía su check-in semanal en 2 minutos. Peso, energía, sueño,
              adherencia y notas. Tú ves todo centralizado con alertas automáticas si algo va mal.
            </p>
            <div class="feature-list">
              ${['Formulario guiado para el cliente','Alertas si energía o adherencia bajan','Historial de 12 semanas por cliente','Tendencias y comparativas automáticas'].map(f => `
                <div class="feature-item">${UTILS.icon('check', 14)} ${f}</div>
              `).join('')}
            </div>
          </div>
          <div class="feature-mockup">
            <div class="mockup-header">
              <div class="mockup-dot red"></div>
              <div class="mockup-dot yellow"></div>
              <div class="mockup-dot green"></div>
              <span class="text-xs text-muted ml-2">Check-in semanal</span>
            </div>
            <div class="mockup-body">
              ${this._checkInMockup()}
            </div>
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="feature-row reverse">
          <div>
            <div class="badge badge-info mb-4">Rutinas profesionales</div>
            <h3 class="font-display text-3xl mb-4" style="font-size:var(--text-2xl);letter-spacing:0.03em">
              Crea, asigna y actualiza rutinas en segundos
            </h3>
            <p class="text-muted text-sm mb-5" style="line-height:1.7">
              Builder visual con 30 ejercicios pre-cargados.
              Selecciona días, series, reps y descansos. Asigna a múltiples clientes con un click.
            </p>
            <div class="feature-list">
              ${['30 ejercicios pre-cargados por categoría','Selección de días de la semana','Asignación masiva a clientes','El cliente ve su rutina de hoy en su portal'].map(f => `
                <div class="feature-item">${UTILS.icon('check', 14)} ${f}</div>
              `).join('')}
            </div>
          </div>
          <div class="feature-mockup">
            <div class="mockup-header">
              <div class="mockup-dot red"></div>
              <div class="mockup-dot yellow"></div>
              <div class="mockup-dot green"></div>
              <span class="text-xs text-muted ml-2">Rutina — Fuerza Full Body</span>
            </div>
            <div class="mockup-body">
              ${this._routineMockup()}
            </div>
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="feature-row">
          <div>
            <div class="badge badge-warning mb-4">Dashboard de progreso</div>
            <h3 class="font-display text-3xl mb-4" style="font-size:var(--text-2xl);letter-spacing:0.03em">
              Ve el progreso de todos tus clientes de un vistazo
            </h3>
            <p class="text-muted text-sm mb-5" style="line-height:1.7">
              KPIs en tiempo real, alertas de clientes en riesgo,
              gráficas de adherencia y retención. Gestiona 30 clientes con la misma facilidad que 5.
            </p>
            <div class="feature-list">
              ${['KPIs en tiempo real','Alertas de abandono temprano','Gráficas de peso y adherencia','Informes exportables (Pro)'].map(f => `
                <div class="feature-item">${UTILS.icon('check', 14)} ${f}</div>
              `).join('')}
            </div>
          </div>
          <div class="feature-mockup">
            <div class="mockup-header">
              <div class="mockup-dot red"></div>
              <div class="mockup-dot yellow"></div>
              <div class="mockup-dot green"></div>
              <span class="text-xs text-muted ml-2">Dashboard</span>
            </div>
            <div class="mockup-body">
              ${this._dashMockup()}
            </div>
          </div>
        </div>
      </section>

      <!-- ════ TESTIMONIALS ════ -->
      <section class="testimonials-section" id="testimonials">
        <div class="testimonials-inner">
          <div class="section-eyebrow">Testimonios</div>
          <h2 class="section-heading">Lo que dicen nuestros PTs</h2>
          <div class="testimonial-cards">
            ${[
              { name:'Rodrigo Méndez', city:'Barcelona', stars:5, text:'"Pasé de gestionar 12 clientes con WhatsApp y Excel a 28 clientes con TrainerFlow. Recupero 6 horas a la semana y mis clientes están más comprometidos que nunca."', initials:'RM', avatar:1 },
              { name:'Valentina Cruz', city:'México DF', stars:5, text:'"El portal del cliente fue un antes y un después. Mis clientas envían su check-in solas, sin que yo tenga que perseguirlas. La retención subió un 40%."', initials:'VC', avatar:6 },
              { name:'Javier Morales', city:'Buenos Aires', stars:5, text:'"La función de alertas me salvó a 3 clientes que iban a abandonar. Los detecté a tiempo con el sistema y ahora llevan 6 meses más conmigo."', initials:'JM', avatar:3 }
            ].map(t => `
              <div class="testimonial-card">
                <div class="stars">${'★'.repeat(t.stars)}</div>
                <p class="testimonial-text">${t.text}</p>
                <div class="testimonial-author">
                  <div class="avatar avatar-${t.avatar}" style="width:38px;height:38px;font-size:13px">${t.initials}</div>
                  <div>
                    <div class="testimonial-name">${t.name}</div>
                    <div class="testimonial-city">${t.city}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="stats-bar">
            <div class="stats-bar-item">2.400+ entrenadores</div>
            <div class="stats-bar-sep"></div>
            <div class="stats-bar-item">18.000+ check-ins</div>
            <div class="stats-bar-sep"></div>
            <div class="stats-bar-item">4.9★ valoración</div>
            <div class="stats-bar-sep"></div>
            <div class="stats-bar-item">98% retención</div>
          </div>
        </div>
      </section>

      <!-- ════ PRICING ════ -->
      <section class="pricing-section" id="pricing">
        <div class="section-eyebrow">Precios</div>
        <h2 class="section-heading">Simple y transparente</h2>
        <p class="text-muted text-base">Sin sorpresas. Cancela cuando quieras.</p>

        <div class="pricing-toggle">
          <span>Mensual</span>
          <div class="pricing-toggle-switch ${STATE.annualBilling ? 'active' : ''}" id="billing-toggle"
               onclick="LandingPage._toggleBilling()"></div>
          <span>Anual</span>
          <span class="pricing-annual-badge">−20%</span>
        </div>

        <div class="pricing-cards">
          ${this._renderPricingCards()}
        </div>
      </section>

      <!-- ════ FAQ ════ -->
      <section class="faq-section" id="faq">
        <div class="section-eyebrow">FAQ</div>
        <h2 class="section-heading">Preguntas frecuentes</h2>
        <div class="faq-list" id="faq-list">
          ${[
            { q:'¿Necesito saber de tecnología para usar TrainerFlow?', a:'No. Si sabes usar WhatsApp, sabes usar TrainerFlow. La interfaz está diseñada para que tú y tus clientes estéis en marcha en menos de 10 minutos.' },
            { q:'¿Mis clientes necesitan descargar una app?', a:'No. Tus clientes acceden a su portal desde el navegador del móvil. Les envías un link y listo, sin apps, sin cuentas complicadas.' },
            { q:'¿Puedo cambiar de plan en cualquier momento?', a:'Sí. Puedes subir o bajar de plan cuando quieras. Si bajas de plan, mantienes el acceso al nivel actual hasta que acabe el período de facturación.' },
            { q:'¿Qué pasa con mis datos si cancelo?', a:'Tienes 30 días para exportar toda tu información. Tus datos son tuyos y te los entregamos en formato CSV/PDF.' },
            { q:'¿Hay descuento para facturación anual?', a:'Sí. Pagando anualmente ahorras un 20% en todos los planes. Para Pro, son casi 70€ de ahorro al año.' },
            { q:'¿Tiene integración con WhatsApp?', a:'En el plan Pro disponemos de recordatorios automáticos vía WhatsApp Business API. En planes inferiores puedes enviar recordatorios manuales con un click.' }
          ].map((item, i) => `
            <div class="faq-item" id="faq-${i}">
              <div class="faq-question" onclick="LandingPage._toggleFaq(${i})">
                <span>${item.q}</span>
                ${UTILS.icon('chevron-down', 16)}
              </div>
              <div class="faq-answer">${item.a}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ════ FOOTER ════ -->
      <footer class="landing-footer">
        <div class="landing-footer-inner">
          <div class="flex items-center gap-3">
            <div class="logo-mark" style="width:28px;height:28px;font-size:11px">TF</div>
            <span class="font-bold text-sm">TrainerFlow</span>
          </div>
          <div class="footer-links">
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="#">Cookies</a>
            <a href="#">Contacto</a>
          </div>
          <div class="footer-copy">© 2026 TrainerFlow. Hecho con 💚 para PTs hispanos.</div>
        </div>
      </footer>

    </div>
    `;
  },

  afterRender() {
    UTILS.initIcons();
  },

  /* ── Mockups CSS para features ── */
  _checkInMockup() {
    return `
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="text-xs text-muted">Energía esta semana</span>
          <span class="text-accent font-bold">8/10</span>
        </div>
        <div class="progress-wrap"><div class="progress-bar" style="width:80%"></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="text-xs text-muted">Calidad sueño</span>
          <span style="color:var(--info);font-weight:600">7/10</span>
        </div>
        <div class="progress-wrap"><div class="progress-bar info" style="width:70%"></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="text-xs text-muted">Adherencia al plan</span>
          <span class="text-accent font-bold">92%</span>
        </div>
        <div class="progress-wrap"><div class="progress-bar" style="width:92%"></div></div>
        <div class="card-sm mt-2" style="font-size:11px;color:var(--text-muted);font-style:italic">
          "Muy bien esta semana, noté más energía en los entrenos"
        </div>
      </div>`;
  },

  _routineMockup() {
    const exs = [
      {n:'Sentadilla con barra', s:'4×10'},
      {n:'Press banca', s:'4×8'},
      {n:'Dominadas', s:'3×8'},
      {n:'Peso muerto', s:'3×6'}
    ];
    return `
      <div style="display:flex;flex-direction:column;gap:6px">
        ${exs.map((e, i) => `
          <div class="exercise-row" style="background:var(--surface-3);border:1px solid var(--border);border-radius:6px;padding:8px 12px;font-size:12px">
            <div class="exercise-num" style="width:20px;height:20px;font-size:10px">${i+1}</div>
            <span style="flex:1">${e.n}</span>
            <span class="text-muted text-xs">${e.s}</span>
          </div>
        `).join('')}
      </div>`;
  },

  _dashMockup() {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${[
          {l:'Clientes activos', v:'14', c:'var(--accent)'},
          {l:'Check-ins semana', v:'11/14', c:'var(--text)'},
          {l:'Adherencia media', v:'87%', c:'var(--accent)'},
          {l:'Retención', v:'94%', c:'var(--success)'}
        ].map(m => `
          <div style="background:var(--surface-3);border:1px solid var(--border);border-radius:8px;padding:10px">
            <div style="font-size:9px;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.1em">${m.l}</div>
            <div style="font-family:var(--font-display);font-size:20px;color:${m.c};letter-spacing:0.02em">${m.v}</div>
          </div>
        `).join('')}
      </div>`;
  },

  _renderPricingCards() {
    const annual = STATE.annualBilling;
    const plans = [
      {
        id:'free', name:'Free', price:0, priceA:0,
        desc:'Para probar TrainerFlow',
        features:['Hasta 3 clientes','2 rutinas','Check-ins básicos','Portal cliente'],
        disabled:['Analytics avanzado','Export CSV','Soporte WhatsApp'],
        cta:'Empezar gratis', ctaAct:'register', featured:false
      },
      {
        id:'starter', name:'Starter', price:14, priceA:134,
        desc:'Para PTs con cartera establecida',
        features:['Hasta 20 clientes','Rutinas ilimitadas','Check-ins + alertas','Mensajes','Historial 12 semanas'],
        disabled:['Analytics avanzado','Export CSV'],
        cta:'Empezar gratis 14 días', ctaAct:'register', featured:true
      },
      {
        id:'pro', name:'Pro', price:29, priceA:278,
        desc:'Para PTs que quieren escalar',
        features:['Clientes ilimitados','Todo Starter +','Analytics avanzado','Export CSV','Soporte WhatsApp priority'],
        disabled:[],
        cta:'Empezar Pro', ctaAct:'register', featured:false
      }
    ];

    return plans.map(p => {
      const displayPrice = annual && p.price > 0
        ? Math.round(p.priceA / 12)
        : p.price;
      const save = annual && p.price > 0
        ? `Ahorras ${UTILS.formatCurrency(p.price * 12 - p.priceA)}/año`
        : '';

      return `
      <div class="pricing-card ${p.featured ? 'featured' : ''}">
        <div class="pricing-plan-name">${p.name}</div>
        <div class="pricing-plan-desc">${p.desc}</div>
        <div class="pricing-amount">
          <div class="pricing-price">${p.price === 0 ? '0' : displayPrice}€</div>
          <div class="pricing-period">${p.price === 0 ? 'siempre gratis' : annual ? '/mes (anual)' : '/mes'}</div>
        </div>
        <div class="pricing-save">${save}</div>
        <button class="btn ${p.featured ? 'btn-accent' : 'btn-outline'} btn-block pricing-cta"
                onclick="APP.navigate('${p.ctaAct}')">
          ${p.cta}
        </button>
        <div class="feature-list">
          ${p.features.map(f => `<div class="feature-item">${UTILS.icon('check',13)} ${f}</div>`).join('')}
          ${p.disabled.map(f => `<div class="feature-item disabled">${UTILS.icon('minus',13)} ${f}</div>`).join('')}
        </div>
      </div>`;
    }).join('');
  },

  _toggleBilling() {
    STATE.annualBilling = !STATE.annualBilling;
    const toggle = document.getElementById('billing-toggle');
    if (toggle) toggle.classList.toggle('active', STATE.annualBilling);
    // Re-render solo los cards
    const container = document.querySelector('.pricing-cards');
    if (container) container.innerHTML = this._renderPricingCards();
  },

  _toggleFaq(idx) {
    const item = document.getElementById(`faq-${idx}`);
    if (!item) return;
    item.classList.toggle('open');
  },

  _demoLogin() {
    const res = AuthService.demoLogin();
    if (res.ok) {
      TOAST.success('¡Demo cargada! Bienvenido al panel del entrenador.');
      APP.navigate('dashboard');
    }
  }
};
