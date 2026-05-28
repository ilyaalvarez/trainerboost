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
| `STRIPE_STARTER_PRICE_ID` | Stripe Dashboard → Products |
| `STRIPE_PRO_PRICE_ID` | Stripe Dashboard → Products |
| `STRIPE_UNLIMITED_PRICE_ID` | Stripe Dashboard → Products |
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

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables from step 2
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. In Stripe Dashboard → Webhooks, add `https://your-domain.vercel.app/api/webhooks/stripe`

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
