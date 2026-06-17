# TRAINERBOOST — AUDIT REPORT
**Fecha:** 2026-06-17  
**Auditor:** Claude Code (Fase 0 del TRAINERBOOST_MASTER_PROMPT)  
**Stack confirmado:** Next.js 16.2.9 · TypeScript strict · Tailwind · Supabase · Stripe · Vercel

---

## 1. ESTRUCTURA DEL PROYECTO

```
src/
├── app/
│   ├── (auth)/          → login, register, forgot-password, reset-password, onboarding
│   ├── api/             → 13 API routes (checkout, webhooks, invite, push, email, cron, contact, portal)
│   ├── auth/callback/   → OAuth callback
│   ├── client/          → Portal del cliente (7 secciones)
│   ├── dashboard/       → Panel del entrenador (8 secciones)
│   ├── demo/            → Demo interactiva (trainer + client)
│   ├── contact/         → Página de contacto
│   ├── pricing/         → Planes y precios
│   ├── privacy/ terms/  → Legal
│   └── page.tsx         → Landing page principal
├── components/
│   ├── layout/          → DashboardShell, DashboardSidebar, ClientTopbar
│   └── ui/              → 12 componentes (StatsCard, Modal, Avatar, Badge, etc.)
├── hooks/               → 5 hooks (useProfile, useNotifications, usePushSubscription, etc.)
├── lib/
│   ├── supabase/        → client.ts + server.ts (separados correctamente)
│   ├── stripe.ts        → SDK de Stripe
│   ├── email.ts         → Resend
│   ├── push.ts          → Web Push
│   ├── plans.ts         → SSOT para planes/precios
│   ├── ratelimit.ts     → Upstash Redis
│   ├── validation.ts    → Zod schemas
│   └── exportPdf.ts     → jsPDF + html2canvas
├── types/database.ts    → Tipos TypeScript del schema
└── proxy.ts             → Middleware Next.js 16 (auth + role routing)
```

---

## 2. DEPENDENCIAS INSTALADAS

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | 16.2.9 | Framework |
| @supabase/ssr + supabase-js | 0.10.3 / 2.106.2 | Auth + DB |
| stripe + @stripe/stripe-js | 22.2.0 / 9.7.0 | Pagos |
| resend | 6.12.4 | Emails transaccionales |
| web-push | 3.6.7 | Push notifications |
| @upstash/ratelimit + redis | 2.0.8 / 1.38.0 | Rate limiting |
| framer-motion | 12.40.0 | Animaciones |
| recharts | 3.8.1 | Gráficas |
| react-hook-form + @hookform/resolvers | 7.76.1 / 5.4.0 | Formularios |
| zod | 4.4.3 | Validación |
| jspdf + html2canvas | 4.2.1 / 1.4.1 | Export PDF |
| date-fns | 4.3.0 | Utilidades de fecha |
| sonner | 2.0.7 | Toast notifications |
| lucide-react | 1.17.0 | Iconos |
| @vercel/analytics + speed-insights | 2.0.1 / 2.0.0 | Métricas |

---

## 3. SCHEMA DE BASE DE DATOS (22 migraciones aplicadas)

### Tablas existentes:
| Tabla | Estado RLS | Descripción |
|-------|-----------|-------------|
| profiles | ✅ RLS activo | Usuario (trainer + client), extiende auth.users |
| trainer_clients | ✅ RLS activo | Relación trainer↔cliente |
| invitations | ✅ RLS activo | Tokens de invitación para clientes |
| routines | ✅ RLS activo | Rutinas de entrenamiento |
| routine_exercises | ✅ RLS activo | Ejercicios dentro de rutinas |
| exercise_completions | ✅ RLS activo | Cliente marca ejercicio como hecho |
| set_logs | ✅ RLS activo | Log por serie (peso × reps) |
| meal_plans | ✅ RLS activo | Planes nutricionales |
| meals | ✅ RLS activo | Comidas del plan |
| appointments | ✅ RLS activo | Citas presenciales/online |
| messages | ✅ RLS activo | Mensajería trainer↔cliente |
| subscriptions | ✅ RLS activo | Suscripciones Stripe |
| notifications | ✅ RLS activo | Notificaciones in-app |
| push_subscriptions | ✅ RLS activo | Endpoints Web Push |
| daily_checkins | ✅ RLS activo | Check-in diario del cliente |
| progress_logs | ✅ RLS activo | Medidas corporales (peso, grasa, músculo, etc.) |
| progress_photos | ✅ RLS activo | Fotos de progreso (bucket Supabase) |
| recetas | ✅ RLS activo | Biblioteca de 200+ recetas |
| diet_assignments | ✅ RLS activo | Recetas asignadas a cliente por slot/día |
| library_exercises | ✅ RLS activo | Biblioteca de ejercicios del entrenador |
| contact_requests | ✅ RLS activo | Solicitudes del formulario de contacto |

### Tablas DEL PROMPT que NO existen aún:
| Tabla | Prioridad |
|-------|-----------|
| workout_templates | Alta — plantillas reutilizables de rutina |
| workout_sessions | Alta — historial de sesiones completadas |
| challenges + challenge_participants | Media — sistema de retos |
| payments + client_subscriptions | Media — cobros trainer→cliente (Stripe Connect) |
| habits + habit_logs | Media — seguimiento de hábitos |
| check_ins (semanal, 7 preguntas) | Media — el check-in actual es diario y simple |
| trainer_public_profiles | Alta — página pública del entrenador |
| teams + team_members | Baja — multi-trainer |
| exercise_library global | Media — ejercicios precargados globales |

---

## 4. RUTAS NEXT.JS EXISTENTES

### Autenticación
- `/login` · `/register` · `/forgot-password` · `/reset-password` · `/onboarding`
- `/auth/callback` (OAuth)

### Panel del entrenador (`/dashboard`)
- `/dashboard` — Dashboard principal ✅ (Server Component, datos reales)
- `/dashboard/clients` — Lista de clientes ✅
- `/dashboard/clients/[id]` — Perfil individual ✅
- `/dashboard/routines` — Gestión de rutinas ✅ (con builder y biblioteca)
- `/dashboard/messages` — Mensajería realtime ✅
- `/dashboard/appointments` — Gestión de citas ✅
- `/dashboard/nutrition` — Planes nutricionales + recetario ✅
- `/dashboard/nutrition/recetas` — Biblioteca de recetas ✅
- `/dashboard/analytics` — Analytics ✅
- `/dashboard/checkins` — Check-ins de clientes ✅
- `/dashboard/settings` — Ajustes del entrenador ✅

### Portal del cliente (`/client`)
- `/client` — Dashboard del cliente ✅
- `/client/routine` — Rutina activa + ejecución ✅
- `/client/progress` — Progreso con gráficas ✅
- `/client/messages` — Chat con entrenador ✅
- `/client/appointments` — Citas ✅
- `/client/nutrition` — Plan nutricional ✅
- `/client/checkin` — Check-in diario ✅
- `/client/settings` — Ajustes del cliente ✅

### Marketing
- `/` — Landing page ✅
- `/pricing` — Página de precios ✅
- `/demo` — Demo selector ✅
- `/demo/trainer` — Demo panel entrenador ✅ (muy rica, datos realistas)
- `/demo/client` — Demo portal cliente ✅
- `/contact` — Formulario de contacto ✅
- `/privacy` · `/terms` — Legal ✅

### API Routes
- `/api/checkout` — Crear sesión de pago Stripe ✅
- `/api/portal` — Portal de facturación Stripe ✅
- `/api/webhooks/stripe` — Webhooks Stripe ✅
- `/api/invite/send` · `/api/invite/[code]` · `/api/invite/accept` — Sistema de invitaciones ✅
- `/api/push/subscribe` · `/api/push/send` · `/api/push/notify-event` · `/api/push/notify-message` — Push ✅
- `/api/email/welcome` — Email de bienvenida ✅
- `/api/contact` — Formulario de contacto ✅
- `/api/free-plan` — Activar plan gratuito ✅
- `/api/account/delete` — Eliminar cuenta ✅
- `/api/cron/appointment-reminders` — Recordatorios de citas ✅
- `/api/cron/weekly-checkins` — Check-ins semanales ✅

### RUTAS FALTANTES (del Master Prompt):
- `/p/[slug]` — Página pública del entrenador ❌
- `/dashboard/challenges` — Sistema de retos ❌
- `/dashboard/habits` — Gestión de hábitos ❌
- `/client/habits` — Hábitos del cliente ❌
- `/client/achievements` — Logros/badges ❌

---

## 5. ESTADO DE SEGURIDAD

### ✅ Implementado correctamente:
- **RLS:** Activo en todas las tablas (22 migraciones de RLS)
- **Headers HTTP:** X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, Permissions-Policy
- **Rate limiting:** Upstash Redis en endpoints de auth y pagos
- **Validación Zod:** En endpoints críticos (validation.ts)
- **SUPABASE_SERVICE_ROLE_KEY:** Solo en servidor, jamás con NEXT_PUBLIC_
- **Stripe webhooks:** Verifican `stripe.webhooks.constructEvent()`
- **Separación cliente/servidor:** `@/lib/supabase/client.ts` vs `@/lib/supabase/server.ts`
- **IDOR fixes:** Auditoría de seguridad previa (commit `sec: auditoria 7 fixes`)
- **Proxy/middleware:** `src/proxy.ts` maneja autenticación y routing por rol

### ⚠️ A mejorar:
- **HSTS:** Falta `Strict-Transport-Security` en headers (el prompt lo pide)
- **X-DNS-Prefetch-Control:** Falta en headers (no crítico)
- **Logs:** Verificar que no hay `console.log` con datos de usuario en producción
- **Error boundaries:** No se detectaron en dashboards (solo `error.tsx` de Next.js)
- **Sentry:** No instalado — sin monitoreo de errores en producción

---

## 6. MÓDULOS IMPLEMENTADOS VS MOCKUP

| Módulo | Estado | Notas |
|--------|--------|-------|
| Auth (login/register/invite) | ✅ Funcional | Supabase Auth completo |
| Dashboard trainer | ✅ Funcional | Server Component, datos reales |
| Gestión de clientes | ✅ Funcional | Lista + perfil individual |
| Constructor de rutinas | ✅ Funcional | Con biblioteca de ejercicios propia |
| Planes nutricionales | ✅ Funcional | Con recetario de 200+ recetas |
| Mensajería realtime | ✅ Funcional | Supabase Realtime |
| Gestión de citas | ✅ Funcional | Con recordatorios por cron |
| Analytics | ✅ Funcional | Gráficas con datos reales |
| Check-ins (diarios) | ✅ Funcional | Check-in simple de cliente |
| Portal del cliente | ✅ Funcional | 8 secciones completas |
| Ejecución de rutina | ✅ Funcional | Con log de sets |
| Progreso (gráficas) | ✅ Funcional | Peso, grasa, músculo + fotos |
| Export PDF | ✅ Funcional | jsPDF + html2canvas |
| Push notifications | ✅ Funcional | Web Push API |
| Emails transaccionales | ✅ Funcional | Resend (welcome, invites, citas) |
| Stripe (suscripciones TB) | ✅ Funcional | Checkout + webhooks + portal |
| Demo interactiva | ✅ Funcional | Muy rica, todos los módulos |
| Landing page | ✅ Funcional | Con testimonios, pricing, FAQ |
| PWA / Service Worker | ✅ Funcional | Con push notifications |
| **Página pública entrenador** | ❌ No existe | `/p/[slug]` por implementar |
| **Sistema de retos** | ❌ No existe | Challenges por implementar |
| **Hábitos diarios** | ❌ No existe | Habits por implementar |
| **Stripe Connect** | ❌ No existe | Cobros trainer→cliente |
| **Logros/Badges** | ❌ No existe | Gamificación por implementar |
| **i18n (preparación)** | ❌ No existe | Strings hardcoded |
| **Check-in semanal (7 preguntas)** | ⚠️ Parcial | Existe cron pero form simple |
| **Calculadora ROI** | ❌ No existe | Pricing page |
| **VideoDemo** | ❌ No existe | Landing page |
| **Multi-trainer/teams** | ❌ No existe | Schema + UI |

---

## 7. PLANES Y PRECIOS ACTUALES

```
Free:      0€  → hasta 3 clientes
Starter:  19€  → hasta 10 clientes
Pro:      39€  → hasta 30 clientes
Business: 79€  → ilimitados (max_clients = 999999)
```

El prompt pide renombrar a: "Independiente" / "Profesional" / "Equipo" — pendiente de implementar.

---

## 8. GAPS CRÍTICOS PARA EL NEXT SPRINT

### Alta prioridad (bloquean conversión):
1. **Página pública del entrenador** (`/p/[slug]`) — herramienta de captación
2. **Hábito + tabla workout_sessions** — registro real de sesiones completadas (ahora solo `exercise_completions`)
3. **VideoDemo + ROI calculator** — mejora landing

### Media prioridad (diferenciación):
4. **Sistema de retos** (challenges) — feature estrella del prompt
5. **Stripe Connect** — cobros trainer→cliente
6. **Gamificación/logros** — engagement del cliente
7. **Check-in semanal con 7 preguntas** (el cron existe pero el formulario es básico)

### Baja prioridad (futuro):
8. **i18n** (preparación de strings)
9. **Teams/multi-trainer**
10. **Sentry** (monitoreo de errores)
11. **HSTS header**

---

## 9. CONCLUSIÓN DE LA AUDITORÍA

TrainerBoost tiene una base **sólida y funcional**. El ~70% del scope del Master Prompt ya está implementado con buena calidad técnica:
- Seguridad robusta (RLS + headers + rate limiting + IDOR fixes)
- Arquitectura limpia (Server Components, tipos estrictos, separación cliente/servidor)
- Demo muy completa (el problema de "datos a cero" ya está resuelto)
- Portal del cliente funcional end-to-end

Los **3 gaps más impactantes** para el negocio son:
1. Página pública del entrenador → captación de leads
2. Sistema de retos → diferenciación vs competidores
3. Stripe Connect → monetización trainer→cliente

**No se necesitan cambios destructivos de schema.** El schema actual es coherente y tiene RLS en todo. Las nuevas features se añaden encima.

---

*Auditoría generada automáticamente por Claude Code — Fase 0 del TRAINERBOOST_MASTER_PROMPT*
