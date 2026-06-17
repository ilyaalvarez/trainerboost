# TrainerBoost — Reporte de Auditoría
## Fecha: 2026-06-18

---

## 1. Stack Confirmado

| Componente | Versión | Estado |
|-----------|---------|--------|
| Next.js | 16.2.9 (App Router) | OK |
| TypeScript | 5.x strict | OK |
| Tailwind CSS | 3.4.1 | OK |
| Supabase | @supabase/ssr 0.10.3 | OK |
| Stripe | 22.2.0 | OK |
| GSAP | 3.15.0 + @gsap/react | OK |
| Sentry | 10.58.0 | OK |
| Resend | 6.12.4 | OK |
| Upstash | @upstash/ratelimit 2.0.8 | OK |
| web-push | 3.6.7 | OK |
| Recharts | 3.8.1 | OK |
| Zod | 4.4.3 | OK |

---

## 2. Rutas Next.js (31 páginas + 14 API routes)

### Públicas
- / — Landing (GSAP completo)
- /pricing — Pricing
- /demo, /demo/trainer, /demo/client
- /p/[slug] — Página pública entrenador
- /contact, /privacy, /terms

### Dashboard (entrenador): /dashboard/*
clients, clients/[id], routines, nutrition, messages, appointments,
challenges, checkins, habits, analytics, public-profile, settings

### Portal cliente: /client/*
routine, nutrition, progress, messages, habits, checkin,
appointments, achievements, invoices, settings

### API routes: checkout, portal, webhooks/stripe, stripe/connect/*,
invite/*, push/*, email/*, cron/*, contact, free-plan, account/delete

---

## 3. Base de Datos — 31 tablas

CRITICO: public.achievements — RLS DESACTIVADO (expone datos a anon key)

Tablas con RLS activo (30): profiles, trainer_clients, routines,
routine_exercises, global_exercises, exercise_library, exercise_completions,
set_logs, meal_plans, diet_assignments, meals, recetas, progress_logs,
messages, appointments, challenges, challenge_participants, habits,
habit_logs, daily_checkins, weekly_checkins, notifications,
push_subscriptions, invitations, subscriptions, invoices, stripe_events,
trainer_public_profiles, client_achievements, contact_requests

Tablas del Master Prompt NO existentes (a crear):
- teams, team_members (multi-trainer)
- measurements (medidas corporales detalladas)
- workout_templates (plantillas reutilizables)
- workout_plans (planes asignados a cliente)
- workout_sessions (sesiones completadas detalladas)
- client_subscriptions (suscripciones recurrentes)

---

## 4. Seguridad

OK: Security headers HTTP (next.config.mjs)
OK: CSP configurado
OK: Rate limiting (Upstash — 4 niveles)
OK: Validacion Zod (lib/validation.ts)
OK: Webhook Stripe verificado
OK: CRON_SECRET + INTERNAL_API_SECRET
CRITICO: achievements sin RLS

---

## 5. Estado por Fase

| Fase | Estado |
|------|--------|
| 0 — Auditoria | Completo (este archivo) |
| 1.1 — Seguridad | Pendiente: achievements RLS |
| 1.2 — Schema | Parcial — faltan 6 tablas |
| 2 — Demo/Landing | Demo trainer muy completa |
| 2.4 — Pricing | Pendiente: renombrar planes + ROI calc |
| 3.1-3.6 — Dashboard | Implementado |
| 4.1-4.4 — Portal cliente | Implementado |
| 5 — Pagina publica | Implementado |
| 6 — Stripe Connect | Implementado |
| 7 — Push + Emails | Implementado |
| 8 — Check-ins | Implementado |
| 9 — Habitos | Implementado |
| 10 — Performance | Sentry activo, Lighthouse pendiente |
| 11 — Accesibilidad | Parcial |
| 12 — i18n prep | lib/i18n.ts existe |

---

## 6. Prioridades

1. CRITICO: RLS en achievements
2. Schema: tablas faltantes
3. Pricing: renombrar planes + ROI calculator
4. Health check endpoint
5. demo-data.ts para la demo
