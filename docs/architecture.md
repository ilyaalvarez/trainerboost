# TrainerBoost — Decisiones de Arquitectura

## Stack Tecnológico
- **Framework**: Next.js 14 (App Router) con TypeScript strict
- **Auth + DB**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Pagos**: Stripe (suscripciones + webhooks)
- **Email**: Resend
- **Push Notifications**: Web Push API + service worker
- **Deploy**: Vercel (auto-deploy en push a `main`)
- **Estilos**: Tailwind CSS con clases utilitarias propias
- **Charts**: Recharts
- **PDF**: jsPDF + html2canvas
- **Formularios**: react-hook-form + zod
- **Fechas**: date-fns
- **Toast**: sonner
- **Iconos**: lucide-react

---

## Estructura de Rutas

```
/                          → Landing page pública
/pricing                   → Página de precios
/demo                      → Demo pública del producto
/contact                   → Formulario de contacto
/terms, /privacy           → Páginas legales

/(auth)/                   → Rutas de autenticación (login, signup, onboarding, forgot-password)

/dashboard/                → App del entrenador (requiere auth)
  clients/                 → Gestión de clientes
  routines/                → Creación y asignación de rutinas
  nutrition/               → Planes nutricionales
  appointments/            → Gestión de citas
  messages/                → Mensajería con clientes
  analytics/               → Métricas y estadísticas
  settings/                → Configuración de cuenta y suscripción

/client/                   → Portal del cliente (acceso con invitación)
  appointments/            → Ver sus citas
  nutrition/               → Ver su plan nutricional
  ...

/api/                      → API Routes
  checkout/                → Crear sesión de pago Stripe
  webhooks/stripe/         → Webhook de Stripe (service role)
  invite/                  → Invitar clientes
  push/                    → Gestionar suscripciones push
  email/                   → Envío de emails via Resend
  contact/                 → Formulario de contacto
  account/                 → Operaciones de cuenta (eliminar)
  portal/                  → Portal de cliente Stripe
  cron/                    → Tareas programadas
```

---

## Patrones Establecidos

### Clientes Supabase
| Contexto | Import | Función |
|---|---|---|
| Server Component, layout, API route | `@/lib/supabase/server` | `createClient()` |
| Componente `'use client'` | `@/lib/supabase/client` | `createClient()` |
| Webhook Stripe, admin | `@/lib/supabase/server` | `createServiceClient()` |

### Planes de suscripción
- `starter = 1` → plan básico
- `pro = 2` → plan intermedio
- `unlimited = 3` → plan completo
- Gate de features: componente `PlanGuard` de `src/components/ui/PlanGuard.tsx`
- Lógica de planes en `src/lib/plans.ts`

### Autenticación y RLS
- Middleware en `src/middleware.ts` protege rutas `/dashboard/*` y `/client/*`
- RLS activo en todas las tablas — sin filtros extra en código si RLS ya lo hace
- Query vacía sin error = falta política RLS o usuario no autenticado

### Naming
- Componentes: PascalCase (`DashboardSidebar.tsx`)
- Hooks: `useNombre.ts` en `src/hooks/`
- API routes: `src/app/api/[recurso]/route.ts`
- Tipos DB: autogenerados en `src/types/database.ts` con `npm run db:types`
- Utils compartidos: `src/lib/utils.ts`

### Push Notifications
- Service worker en `public/sw.js`
- Suscripciones gestionadas via `src/hooks/usePushSubscription.ts`
- Envío desde `src/lib/push.ts`
- Registro en `src/components/ServiceWorkerRegistration.tsx`

---

## Decisiones Tomadas

**¿Por qué App Router y no Pages Router?**
Permite Server Components por defecto, reduciendo JS enviado al cliente y simplificando el fetching de datos con Supabase SSR.

**¿Por qué Supabase sobre un backend propio?**
Auth, RLS, realtime y storage out-of-the-box. Reduce tiempo de desarrollo en infraestructura.

**¿Por qué sonner y no react-hot-toast u otra librería?**
API limpia, soporte nativo de promesas, sin configuración de Toaster compleja.

**¿Por qué react-hook-form + zod?**
Validación type-safe en cliente y servidor con el mismo schema. Mínimo re-render.

---

## Última Actualización
2026-06-02 — Documento inicial creado a partir del análisis de la codebase
