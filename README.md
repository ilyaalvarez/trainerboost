# TrainerBoost

SaaS platform for Hispanic personal trainers. Manage clients, routines, nutrition plans, appointments, and real-time messaging — with subscription tiers powered by Stripe.

## Stack

- **Next.js 14** (App Router, Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS** (dark design system)
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Stripe** (subscriptions + customer portal)
- **Vercel** (deploy)

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/ilyaalvarez/trainerboost
cd trainerboost
npm install
```

### 2. Environment variables

Edit `.env.local` with your credentials:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks |
| `STRIPE_PRICE_ID_STARTER` | Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_PRO` | Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_UNLIMITED` | Stripe Dashboard → Products |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 3. Supabase database

Run the migration in your Supabase project's SQL editor:

```bash
# Via Supabase CLI (requires supabase login)
supabase db push

# Or manually: paste the contents of supabase/migrations/001_initial_schema.sql
# into Supabase Dashboard → SQL Editor → New query → Run
```

Enable in Supabase Dashboard:
- **Authentication → Providers → Google** — add your OAuth credentials
- **Authentication → URL Configuration** — set Site URL to your app URL

### 4. Stripe products

Create three recurring products in Stripe Dashboard:

| Product | Price | Metadata key | Value |
|---|---|---|---|
| TrainerBoost Starter | 29€/month | `plan` | `starter` |
| TrainerBoost Pro | 59€/month | `plan` | `pro` |
| TrainerBoost Unlimited | 99€/month | `plan` | `unlimited` |

Add the resulting Price IDs to `.env.local`.

### 5. Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

### 6. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Conectar servicios (GitHub → Vercel → Supabase)

### GitHub (ya listo)
El repositorio `ilyaalvarez/trainerboost` ya existe y el CI corre en cada push vía `.github/workflows/ci.yml` (TypeScript + ESLint + build).

### Vercel — 3 pasos
1. Ve a [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → selecciona `ilyaalvarez/trainerboost`
2. Framework: **Next.js** (autodetectado). No cambies nada más.
3. Expande **Environment Variables** y pega todas las de `.env.local.example` con los valores reales → **Deploy**

Vercel redespliega automáticamente en cada push a `main`.

### Supabase — 4 pasos
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** → pega el contenido de `supabase/migrations/001_initial_schema.sql` → **Run**
3. Ve a **Authentication → Providers → Google** → activa y añade tus credenciales OAuth
4. Ve a **Settings → API** → copia `URL`, `anon key` y `service_role key` → pégalos en Vercel (Settings → Environment Variables)

### Stripe webhook producción — 2 pasos
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
   - URL: `https://tu-dominio.vercel.app/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
2. Copia el **Signing secret** → añádelo como `STRIPE_WEBHOOK_SECRET` en Vercel → **Redeploy**

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, onboarding
│   ├── api/             # checkout, portal, webhooks/stripe, invite/[code]
│   ├── client/          # Client portal (routine, progress, nutrition, appointments, messages)
│   ├── dashboard/       # Trainer dashboard (clients, routines, nutrition, appointments, messages, settings)
│   └── pricing/         # Pricing page
├── components/
│   ├── layout/          # DashboardSidebar, ClientTopbar
│   └── ui/              # Avatar, Badge, EmptyState, Modal, PlanGuard, Skeleton, StatsCard
├── hooks/               # useProfile, useUnreadMessages
├── lib/
│   ├── supabase/        # client.ts, server.ts
│   ├── stripe.ts
│   └── utils.ts
└── types/
    └── database.ts      # All TypeScript types + PLAN_LIMITS
supabase/
├── config.toml          # Local dev config
└── migrations/
    └── 001_initial_schema.sql
```

## Subscription Plans

| Plan | Price | Clients | Features |
|---|---|---|---|
| Free | 0€ | 3 | Basic dashboard |
| Starter | 29€/mo | 5 | Routines + Nutrition |
| Pro | 59€/mo | 20 | + Appointments + Analytics |
| Unlimited | 99€/mo | ∞ | All features + priority support |
