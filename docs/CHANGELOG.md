# TrainerBoost — Changelog

---

## 2026-06-18 — Master Prompt v1.0 (Fases 0–2)

### FASE 0 — Auditoría
- Generado `docs/AUDIT_REPORT.md` con estado completo del proyecto
- 31 tablas Supabase identificadas, todas con RLS excepto `achievements`
- Todas las rutas Next.js mapeadas (31 páginas + 14 API routes)
- Stack confirmado: Next.js 16.2.9, Supabase, Stripe, GSAP 3.15, Sentry, Resend, Upstash

### FASE 1.1 — Seguridad
- RLS activado en `public.achievements` con política `SELECT` pública
- Security headers ya estaban en `next.config.mjs` (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting ya operativo en `lib/ratelimit.ts` (4 niveles via Upstash)
- `/api/health` y `/p/` añadidos a rutas públicas del middleware

### FASE 1.2 — Schema base de datos
- Migración `add_missing_schema_tables` aplicada en Supabase
- Nuevas tablas con RLS: `teams`, `team_members`, `measurements`, `workout_templates`, `workout_plans`, `workout_sessions`, `client_subscriptions`
- Índices de performance añadidos para todas las tablas nuevas
- Triggers `updated_at` para workout_templates y workout_plans

### FASE 2 — Landing y Demo
- `src/lib/demo-data.ts` creado con datos ficticios ultrarrealistas (6 clientes, citas, mensajes, rutinas, progreso)
- `DEMO_TRAINER` y `DEMO_CLIENT` exportados para uso en páginas de demo
- ROI Calculator interactivo añadido en `/pricing` (sliders de clientes y precio)
- Sección "¿Sois más de uno en el equipo?" añadida en landing (entre pricing y FAQ)
- Mini mockup de dashboard multi-entrenador con datos realistas
- `/api/health` endpoint creado: `{ status, db, latency_ms, timestamp }`

### Pendiente (próximas fases)
- FASE 3.1: Dashboard principal — alertas inteligentes y actividad en tiempo real
- FASE 3.2: Gestión de clientes — ver/usar demo-data en demo
- FASE 3.3: Constructor de rutinas — integrar workout_templates
- FASE 3.4: Sistema de retos — poblar con datos de prueba
- FASE 4.3: Ejecución de rutina — usar workout_sessions
- FASE 6: Stripe Connect — webhook para client_subscriptions
- FASE 10: Lighthouse audit

---

## 2026-06-18 — Landing Redesign (sesión anterior)

- GSAP 3.15.0 + ScrollTrigger + SplitText + microinteractions
- `src/lib/gsap.ts` y `src/lib/gsap-animations.ts` creados
- `src/app/styles/landing.css` para pricing spotlight, métricas, CTA verde
- `src/app/page.tsx` reescrito completamente (hero, dolor/solución, steps, features, portal móvil, métricas 2×2, demo cards, pricing, FAQ, CTA verde)
- Build verificado en Playwright 1440×900

---

## 2026-06-09 — Sesión anterior

- Auditoría completa estático/dinámico + gap analysis
- 3 fixes de seguridad IDOR
- Historial de sesiones, bucket fotos progress-photos
- Next.js 16 proxy migration (middleware.ts → proxy.ts)
- Analytics + Speed Insights en producción
