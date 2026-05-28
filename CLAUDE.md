# TrainerBoost — Guía de desarrollo

## Stack
Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · Supabase · Stripe · Vercel

## URLs
- Producción: https://app.trainerboost.es
- Repo: github.com/ilyaalvarez/trainerboost
- Rama principal: `main` (deploy automático a producción en cada push)

---

## Flujo de trabajo obligatorio

```bash
git checkout -b feature/nombre-tarea
# ... código ...
git add <archivos-específicos>   # NUNCA git add . sin revisar
git commit -m "feat: descripción clara"
git push origin feature/nombre-tarea
# → Vercel genera Preview URL automáticamente
# → revisar, mergear a main → deploy en ~60s
```

**Nunca commitear `.env.local` ni ningún secreto.**

---

## Supabase — reglas que no se rompen nunca

### Qué cliente usar

| Contexto | Import | Cliente |
|---|---|---|
| Server Component, layout, API route | `@/lib/supabase/server` → `createClient()` | `createServerClient` (SSR) |
| Componente cliente (`'use client'`) | `@/lib/supabase/client` → `createClient()` | `createBrowserClient` |
| Webhook Stripe, operaciones admin | `@/lib/supabase/server` → `createServiceClient()` | service role, bypasa RLS |

**`SUPABASE_SERVICE_ROLE_KEY` nunca en `NEXT_PUBLIC_*` ni en código cliente.**

### RLS
- RLS activo en todas las tablas. Las queries devuelven solo datos del usuario autenticado sin filtros extra en el código.
- Si una query devuelve vacío sin error → falta política RLS o el usuario no está autenticado.

### Regenerar tipos tras cambiar el schema
```bash
npm run db:types   # requiere SUPABASE_PROJECT_ID en .env.local
```

---

## Variables de entorno

Deben estar en **dos sitios**:
1. `.env.local` → desarrollo local
2. Vercel → Settings → Environment Variables → producción

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # solo servidor
STRIPE_SECRET_KEY=sk_...                  # solo servidor
STRIPE_WEBHOOK_SECRET=whsec_...           # solo servidor
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_UNLIMITED=price_...
NEXT_PUBLIC_APP_URL=https://app.trainerboost.es
SUPABASE_PROJECT_ID=xxxx                  # solo para npm run db:types
```

---

## Checklist antes de escribir código

- [ ] ¿El archivo usa `createClient` del import correcto (server vs client)?
- [ ] ¿La query respeta RLS (filtra por `trainer_id` o `auth.uid()`)?
- [ ] ¿Estoy en la rama correcta o creo una nueva?
- [ ] ¿Las env vars necesarias están en `.env.local` Y en Vercel?
- [ ] ¿Voy a commitear algún secreto? (revisar antes de `git add`)

---

## Convenciones de código

- TypeScript strict — sin `any` salvo workarounds documentados con `// eslint-disable`
- Sin comentarios excepto cuando el WHY no es obvio
- Tailwind sobre CSS inline. Clases utilitarias: `.card`, `.btn-primary`, `.input`, `.badge-*`
- Planes: `starter(1) < pro(2) < unlimited(3)` — usar `PlanGuard` para gates
- Toast: `sonner` (`toast.success`, `toast.error`)
- Iconos: `lucide-react`
- Fechas: `date-fns` con helpers de `@/lib/utils`
