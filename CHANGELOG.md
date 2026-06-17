# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — branch `feature/master-prompt-all-phases`

### Phase 0 — Audit
- Created `docs/AUDIT_REPORT.md` with full project state analysis

### Phase 1 — Security & Migrations
- Added HSTS and X-DNS-Prefetch-Control headers to `next.config.mjs`
- Changed `X-Frame-Options` from `DENY` to `SAMEORIGIN` for embedded content
- Created `supabase/migrations/023_master_prompt_tables.sql` with 10 new tables:
  - `workout_templates`, `workout_sessions`, `challenges`, `challenge_participants`
  - `habits`, `habit_logs`, `weekly_checkins`, `trainer_public_profiles`
  - `achievements`, `client_achievements`
- Added RLS policies on all new tables
- Seeded 13 achievements

### Phase 2 — Landing Page
- Added `VideoDemo` component (4-step animated carousel) to landing
- Added `TeamSection` targeting gym/multi-trainer use case
- Added `RoiCalculator` component with sliders (clients 1–30, price 30–300€)
- Renamed plans: Starter → Independiente, Pro → Profesional, Business → Equipo
- Updated plan features for Equipo tier

### Phase 3/4 — Trainer Dashboard Features
- Created `/dashboard/challenges` — challenge creation, participant management, progress tracking
- Created `/dashboard/habits` — habit assignment with preset suggestions, 30-day adherence tracking
  - Fixed N+1 query: batch-fetches all habit logs in one query instead of one per habit
- Created `/dashboard/public-profile` — full WYSIWYG public profile editor

### Phase 5 — Public Trainer Profile
- Created `/p/[slug]` — public trainer profile page (Server Component + Client rendering)
- Features: hero, about, services grid, gallery, testimonials with star ratings, contact form

### Phase 6 — Stripe Connect
- Pending (requires manual Stripe Connect setup in dashboard)

### Phase 7 — Notifications
- Created `/api/cron/streak-alerts` — cron at 20:00 UTC, alerts clients when daily habit streaks are at risk
- Added `streak_danger` notification type
- Registered cron in `vercel.json`

### Phase 8 — Weekly Check-ins (upgraded to 7 questions)
- Rewrote `/client/checkin` — 7-step wizard with new schema fields:
  - energy_level (1–10), mood (1–10), sleep_hours, adherence_pct
  - biggest_win, biggest_challenge, questions_for_trainer
- Rewrote `/dashboard/checkins` — shows all 7 fields, trainer response textarea + send button
  - Sends in-app notification to client on response
  - Shows "sin responder" counter badge

### Phase 9 — Habits (Client Portal)
- Created `/client/habits` — daily habit tracker with toggle, 7-day history, streak counter
- Added to ClientTopbar navigation

### Phase 10 — Performance
- Fixed N+1 in `dashboard/habits`: single batch query replaces per-habit loop
- Created `src/instrumentation.ts` for Sentry (requires `npm i @sentry/nextjs` + `SENTRY_DSN` env var)

### Phase 11 — Accessibility
- Added skip-to-main-content link in root layout (visible on focus, WCAG SC 2.4.1)
- Added `id="main-content"` to `<main>` in dashboard shell and client layout
- Improved `aria-label` and `aria-expanded` on mobile hamburger button

### Phase 12 — i18n Preparation
- Created `src/lib/i18n.ts` — `t()` wrapper ready for multi-language expansion
- Created `locales/es.json` — full Spanish string catalog covering all UI areas

### Other
- Added `loading.tsx` for all new pages:
  - `/dashboard/challenges`, `/dashboard/habits`, `/dashboard/public-profile`
  - `/p/[slug]`, `/client/achievements`, `/client/habits`, `/client/checkin`
- Created `/client/achievements` — achievements page showing locked/unlocked badges
- Added Logros link to ClientTopbar (replaces Progreso on mobile bottom nav slot)
- Added streak-alerts cron to `vercel.json` schedule
- Updated TypeScript types for all new tables
