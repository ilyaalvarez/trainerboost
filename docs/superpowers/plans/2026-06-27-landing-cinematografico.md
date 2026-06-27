# Landing Cinematográfico TrainerBoost — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace current landing (dashboard mockup hero) with a cinematic 6-section landing where the client profile card is the visual protagonist — inspired by ciaoenergy.com. Mode: waitlist only, no pricing, no offers.

**Architecture:** 7 atomic components built independently, assembled in `page.tsx`. `SmoothScrollProvider` in `layout.tsx` registers ScrollTrigger globally. `clientData.ts` is the single source of truth for the 4 client profiles used across Hero, FichasScroll, and ProfileSelector.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, GSAP 3.15 + ScrollTrigger (already installed), Lenis 1.3 (already installed), CSS custom properties.

---

## File Map

| Action | File |
|---|---|
| Create | `src/providers/SmoothScrollProvider.tsx` |
| Create | `src/components/landing/clientData.ts` |
| Create | `src/components/landing/GymLights.tsx` |
| Create | `src/components/landing/ClientCard.tsx` |
| Create | `src/components/landing/FichasScroll.tsx` |
| Create | `src/components/landing/ProfileSelector.tsx` |
| Create | `src/components/ui/TextReveal.tsx` |
| Modify | `src/app/layout.tsx` (wrap children with SmoothScrollProvider) |
| Modify | `src/app/styles/landing.css` (append new tokens + component CSS) |
| Modify | `src/components/landing/BootLoader.tsx` (add tagline) |
| Rewrite | `src/app/page.tsx` |
| Keep as-is | `src/components/landing/WaitlistForm.tsx` |
| Keep as-is | `src/components/ui/Accordion.tsx` |
| Keep as-is | `src/components/logo/LogoFull.tsx`, `LogoIcon.tsx` |

---

## Task 1: CSS Tokens

**Files:**
- Modify: `src/app/styles/landing.css` (append at end of file)

- [ ] **Step 1: Append new token block to landing.css**

Add this block at the very end of `src/app/styles/landing.css`:

```css
/* ─── LANDING CINEMATOGRÁFICO — tokens nuevos ───────────────────────────────── */
:root {
  --shadow-sm: 0 0 8px rgba(143,212,58,0.15), 0 2px 4px rgba(0,0,0,0.5);
  --shadow-md: 0 0 24px rgba(143,212,58,0.20), 0 4px 20px rgba(0,0,0,0.6);
  --shadow-lg: 0 0 48px rgba(143,212,58,0.25), 0 8px 40px rgba(0,0,0,0.7);

  --font-display: var(--font-outfit, 'Outfit'), sans-serif;

  --text-hero: clamp(52px, 8vw, 96px);
  --text-xl:   clamp(32px, 5vw, 56px);
  --text-lg:   clamp(20px, 3vw, 32px);
  --text-md:   18px;
  --text-sm:   14px;
  --text-xs:   12px;

  --s2:8px;   --s3:12px;  --s4:16px;  --s5:20px;  --s6:24px;
  --s8:32px;  --s10:40px; --s12:48px; --s16:64px;
  --s20:80px; --s24:96px; --s32:128px;

  --r-sm:4px; --r-md:6px; --r-lg:8px; --r-card:16px; --r-pill:999px;

  --tb-brand-glow: rgba(143,212,58,0.12);
}

/* ─── HERO ───────────────────────────────────────────────────────────────────── */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 55fr 45fr;
  align-items: center;
  padding: 0 clamp(24px, 6vw, 80px);
  overflow: hidden;
  gap: 40px;
  padding-top: 80px;
}
.hero-left { display: flex; flex-direction: column; gap: var(--s6); max-width: 560px; }
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--tb-border);
  border-radius: var(--r-pill);
  padding: 6px 14px;
  background: rgba(143,212,58,0.04);
  font-family: monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--tb-muted);
  width: fit-content;
}
.hero-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--tb-brand);
  animation: badge-pulse 2s ease-in-out infinite;
}
@keyframes badge-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

.hero-h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-hero);
  line-height: 1.0;
  letter-spacing: -0.03em;
  color: var(--tb-text);
  margin: 0;
}
.hero-sub {
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--tb-muted);
  line-height: 1.6;
  max-width: 480px;
  margin: 0;
}
.hero-ctas { display: flex; gap: var(--s4); flex-wrap: wrap; align-items: center; }
.hero-cta-primary {
  height: 44px;
  padding: 0 24px;
  background: var(--tb-brand);
  color: var(--tb-void);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  border: none;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.hero-cta-primary:hover { background: var(--tb-brand-dim); box-shadow: var(--shadow-md); }
.hero-cta-secondary {
  height: 44px;
  padding: 0 20px;
  background: transparent;
  color: var(--tb-muted);
  font-family: var(--font-body);
  font-size: 15px;
  border: 1px solid var(--tb-border);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.hero-cta-secondary:hover { color: var(--tb-brand); border-color: var(--tb-brand); }

.hero-right {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.hero-card-wrap {
  perspective: 1200px;
  position: relative;
}
.hero-card-inner {
  transform: rotate(-3deg) rotateX(5deg);
  transform-style: preserve-3d;
}
.hero-card-glow {
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 48px;
  background: radial-gradient(ellipse, rgba(143,212,58,0.35) 0%, transparent 70%);
  filter: blur(18px);
  pointer-events: none;
}

@media (max-width: 900px) {
  .hero-section {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding-top: 100px;
    padding-bottom: 60px;
    gap: 48px;
  }
  .hero-right { order: -1; }
}

/* ─── FICHAS SCROLL ──────────────────────────────────────────────────────────── */
.fichas-wrap { overflow: hidden; background: var(--tb-void); position: relative; }
.fichas-label {
  position: absolute;
  top: 36px;
  left: var(--s8);
  z-index: 10;
  font-family: monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--tb-muted);
  text-transform: uppercase;
}
.fichas-track {
  display: flex;
  align-items: center;
  gap: 40px;
  padding-inline: 80px;
  height: 100vh;
  width: max-content;
  will-change: transform;
}
@media (max-width: 767px) {
  .fichas-track {
    flex-direction: column;
    width: 100%;
    height: auto;
    padding: 80px 20px 48px;
    gap: 24px;
    align-items: center;
  }
  .fichas-track .client-card {
    width: min(360px, 100%) !important;
    height: auto !important;
    min-height: 460px;
  }
}

/* ─── DOLOR ──────────────────────────────────────────────────────────────────── */
.pain-section {
  background: var(--tb-surface);
  padding: var(--s32) clamp(24px, 6vw, 80px);
}
.pain-section-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-xl);
  color: var(--tb-text);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 var(--s16);
}
.pain-list { display: flex; flex-direction: column; }
.pain-item {
  border-top: 1px solid var(--tb-border);
  padding: var(--s8) 0;
}
.pain-item:last-child { border-bottom: 1px solid var(--tb-border); }
.pain-bad {
  font-family: var(--font-body);
  font-size: clamp(15px, 2.2vw, 20px);
  color: rgba(192, 57, 43, 0.55);
  text-decoration: line-through;
  text-decoration-color: rgba(192, 57, 43, 0.4);
  margin: 0 0 var(--s3);
}
.pain-good {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(15px, 2.2vw, 20px);
  color: var(--tb-text);
  margin: 0;
  display: flex;
  gap: var(--s4);
  align-items: baseline;
}
.pain-arrow { color: var(--tb-brand); flex-shrink: 0; }
.pain-close-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-xl);
  color: var(--tb-text);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: var(--s16) 0 0;
}

/* ─── PROFILE SELECTOR ───────────────────────────────────────────────────────── */
.profile-section {
  padding: var(--s32) clamp(24px, 6vw, 80px);
  background: var(--tb-void);
}
.profile-section-label {
  font-family: monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--tb-muted);
  text-transform: uppercase;
  margin-bottom: var(--s8);
}
.profile-tabs {
  display: flex;
  gap: 0;
  margin-bottom: var(--s16);
  border-bottom: 1px solid var(--tb-border);
  flex-wrap: wrap;
}
.profile-tab {
  padding: var(--s3) var(--s6);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--tb-muted);
  cursor: pointer;
  margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
}
.profile-tab--active { color: var(--tb-brand); border-bottom-color: var(--tb-brand); }
.profile-tab:hover:not(.profile-tab--active) { color: var(--tb-text); }
.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s16);
  align-items: center;
}
@media (max-width: 900px) {
  .profile-content { grid-template-columns: 1fr; }
  .profile-card-col { display: none; }
}
.profile-text-col { display: flex; flex-direction: column; gap: var(--s6); }
.profile-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-xl);
  color: var(--tb-text);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}
.profile-desc {
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--tb-muted);
  line-height: 1.7;
  margin: 0;
}
.profile-bullets { display: flex; flex-direction: column; gap: var(--s3); list-style: none; padding: 0; margin: 0; }
.profile-bullet {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--tb-text);
  display: flex;
  gap: var(--s3);
  align-items: baseline;
}
.profile-bullet::before { content: '—'; color: var(--tb-brand); flex-shrink: 0; }
.profile-card-col { display: flex; justify-content: center; }

/* ─── FAQ ────────────────────────────────────────────────────────────────────── */
.faq-section {
  padding: var(--s32) clamp(24px, 6vw, 80px);
  background: var(--tb-surface);
}
.faq-section-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-xl);
  color: var(--tb-text);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 var(--s12);
  max-width: 680px;
}
.faq-inner { max-width: 680px; }

/* ─── CTA FINAL ──────────────────────────────────────────────────────────────── */
.cta-final-section {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--s32) clamp(24px, 6vw, 80px);
  overflow: hidden;
  background: var(--tb-surface-up);
}
.cta-final-card-bg {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
}
.cta-final-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s8);
  max-width: 500px;
}
.cta-final-h2 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-xl);
  color: var(--tb-text);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}
.cta-final-sub {
  font-family: var(--font-body);
  font-size: var(--text-base, 16px);
  color: var(--tb-muted);
  margin: 0;
}

/* ─── NAV ────────────────────────────────────────────────────────────────────── */
.lp-nav-v2 {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 clamp(24px, 5vw, 64px);
  justify-content: space-between;
  background: rgba(5,8,5,0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(26,35,26,0.6);
}
.lp-nav-v2-logo {
  display: flex;
  align-items: center;
  gap: var(--s3);
  background: transparent;
  border: none;
  cursor: pointer;
}
.lp-nav-v2-anchors {
  display: flex;
  gap: var(--s6);
}
.lp-nav-v2-anchor {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--tb-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.lp-nav-v2-anchor:hover { color: var(--tb-text); }
.lp-nav-v2-cta {
  height: 36px;
  padding: 0 16px;
  background: transparent;
  border: 1px solid var(--tb-border);
  border-radius: var(--r-md);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--tb-muted);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.lp-nav-v2-cta:hover { color: var(--tb-brand); border-color: var(--tb-brand); }
@media (max-width: 600px) {
  .lp-nav-v2-anchors { display: none; }
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────────── */
.lp-footer-v2 {
  padding: var(--s12) clamp(24px, 5vw, 64px);
  border-top: 1px solid var(--tb-border);
  background: var(--tb-void);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--s6);
}
.lp-footer-v2-links { display: flex; gap: var(--s6); }
.lp-footer-v2-link {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--tb-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.lp-footer-v2-link:hover { color: var(--tb-text); }
.lp-footer-v2-copy {
  font-family: monospace;
  font-size: 11px;
  color: var(--tb-faint);
}
```

- [ ] **Step 2: Verify no CSS syntax errors**

```bash
npm run build 2>&1 | head -30
```

Expected: build continues (CSS errors stop it immediately). If it shows a CSS parse error, fix the specific line reported.

- [ ] **Step 3: Commit**

```bash
git add src/app/styles/landing.css
git commit -m "style(landing): tokens y CSS base para landing cinematografico"
```

---

## Task 2: SmoothScrollProvider + layout.tsx

**Files:**
- Create: `src/providers/SmoothScrollProvider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create SmoothScrollProvider**

Create `src/providers/SmoothScrollProvider.tsx`:

```tsx
'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

// Module-level registration: runs before any useEffect in any child component.
// If inside useEffect, React runs child effects BEFORE parent effects —
// ScrollTrigger would not be registered when ClientCard/FichasScroll animate.
gsap.registerPlugin(ScrollTrigger)

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => { lenis.raf(time * 1000) }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      lenis.destroy()
      gsap.ticker.remove(tick)
    }
  }, [])
  return <>{children}</>
}
```

- [ ] **Step 2: Update layout.tsx — wrap children**

In `src/app/layout.tsx`, add the import at the top (after other imports):

```tsx
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'
```

Then in the `<body>` JSX, wrap `{children}` only (not Toaster/Analytics/etc.):

Find this in layout.tsx:
```tsx
        {children}
        <Toaster
```

Replace with:
```tsx
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Toaster
```

- [ ] **Step 3: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds. If you see "lenis is not defined" or similar, it means the import path is wrong — check `node_modules/lenis/dist/lenis.mjs` exists.

- [ ] **Step 4: Commit**

```bash
git add src/providers/SmoothScrollProvider.tsx src/app/layout.tsx
git commit -m "feat(landing): SmoothScrollProvider con Lenis + GSAP ScrollTrigger"
```

---

## Task 3: GymLights

**Files:**
- Create: `src/components/landing/GymLights.tsx`

- [ ] **Step 1: Create GymLights.tsx**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const SEGS: [number, number, number, number][] = [
  [0,18,38,46], [100,12,62,42],
  [8,35,8,65],  [92,28,92,58],
  [12,54,42,54],[58,50,90,50],
  [28,22,48,22],[55,68,78,68],
  [3,72,22,72], [76,16,88,16],
  [15,80,35,55],[65,78,88,60],
]

export function GymLights() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gl-seg', {
        opacity: 0,
        duration: 1.4,
        stagger: { amount: 1.0, from: 'random' },
        ease: 'expo.out',
        delay: 0.2,
      })
      gsap.to('.gl-seg', {
        opacity: () => 0.4 + Math.random() * 0.5,
        duration: () => 2 + Math.random() * 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { amount: 4, from: 'random' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient id="gym-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="55%" stopColor="#050805" stopOpacity="0" />
          <stop offset="100%" stopColor="#050805" stopOpacity="1" />
        </linearGradient>
      </defs>
      {SEGS.map(([x1, y1, x2, y2], i) => {
        const d = (y1 + y2) / 200
        return (
          <line
            key={i}
            className="gl-seg"
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#8FD43A"
            strokeWidth={0.06 + d * 0.14}
            strokeLinecap="round"
            opacity={0.2 + d * 0.55}
            style={{
              filter: `drop-shadow(0 0 ${0.2 + d * 0.4}px #8FD43A) drop-shadow(0 0 ${0.6 + d}px rgba(143,212,58,0.3))`,
            }}
          />
        )
      })}
      <rect x="0" y="0" width="100" height="100" fill="url(#gym-fade)" />
    </svg>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npm run typecheck 2>&1 | grep GymLights
```

Expected: no output (no errors for this file).

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/GymLights.tsx
git commit -m "feat(landing): GymLights SVG con segmentos LED verdes pulsantes"
```

---

## Task 4: TextReveal

**Files:**
- Create: `src/components/ui/TextReveal.tsx`

- [ ] **Step 1: Create TextReveal.tsx**

```tsx
'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

interface Props {
  children: string
  as?: 'h1' | 'h2' | 'h3'
  delay?: number
  style?: React.CSSProperties
  className?: string
}

export function TextReveal({ children, as: Tag = 'h2', delay = 0, style, className }: Props) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    el.innerHTML = children
      .split('\n')
      .map(line =>
        `<span style="display:block;overflow:hidden;line-height:1.15"><span class="tr-line" style="display:block">${line}</span></span>`
      )
      .join('')

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.tr-line'), {
        y: '108%',
        duration: 0.85,
        stagger: 0.1,
        ease: 'expo.out',
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [children, delay])

  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement>} style={style} className={className}>
      {children}
    </Tag>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npm run typecheck 2>&1 | grep TextReveal
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/TextReveal.tsx
git commit -m "feat(ui): TextReveal con GSAP line-by-line reveal"
```

---

## Task 5: clientData + ClientCard

**Files:**
- Create: `src/components/landing/clientData.ts`
- Create: `src/components/landing/ClientCard.tsx`

- [ ] **Step 1: Create clientData.ts**

```ts
export interface ClientData {
  variant: 1 | 2 | 3 | 4
  name: string
  city: string
  goal: string
  progress: number
  weeks: number
  metrics: { weight: string; strength: string; label: string }
  badge: string
  bg: string
}

export const CLIENTS: ClientData[] = [
  {
    variant: 1,
    name: 'Alejandro M.',
    city: 'Madrid',
    goal: 'Pérdida de peso',
    progress: 12,
    weeks: 2,
    metrics: { weight: '-1.2kg', strength: '+0%', label: 'Empezando' },
    badge: 'NUEVO',
    bg: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(143,212,58,0.04) 0%, transparent 70%)',
  },
  {
    variant: 2,
    name: 'Sara L.',
    city: 'Barcelona',
    goal: 'Ganancia muscular',
    progress: 45,
    weeks: 10,
    metrics: { weight: '+2.1kg', strength: '+28%', label: 'En progreso' },
    badge: 'EN PROGRESO',
    bg: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(143,212,58,0.08) 0%, transparent 70%)',
  },
  {
    variant: 3,
    name: 'Carlos R.',
    city: 'Valencia',
    goal: 'Rendimiento deportivo',
    progress: 78,
    weeks: 24,
    metrics: { weight: '-12kg', strength: '+41%', label: 'Transformando' },
    badge: 'TRANSFORMANDO',
    bg: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(143,212,58,0.14) 0%, transparent 70%)',
  },
  {
    variant: 4,
    name: 'María G.',
    city: 'Sevilla',
    goal: 'Maratón completado',
    progress: 100,
    weeks: 32,
    metrics: { weight: '-15kg', strength: '×2', label: 'Objetivo cumplido' },
    badge: 'COMPLETADO',
    bg: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(180,220,80,0.18) 0%, transparent 70%)',
  },
]

export const HERO_CLIENT = CLIENTS[2]
```

- [ ] **Step 2: Create ClientCard.tsx**

`gsap.context(fn, ref)` scopes all selector strings inside `fn` to `ref.current`, so `.progress-fill` and `.metric-val` are safe to use without variant suffixes.

```tsx
'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import type { ClientData } from './clientData'

interface Props {
  client: ClientData
  animateMode?: 'scroll' | 'immediate' | 'none'
  className?: string
  style?: React.CSSProperties
}

export function ClientCard({ client, animateMode = 'scroll', className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isComplete = client.progress === 100

  useEffect(() => {
    if (animateMode === 'none') return
    const ctx = gsap.context(() => {
      const trigger =
        animateMode === 'scroll'
          ? { scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } }
          : {}

      gsap.from('.progress-fill', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'expo.out',
        delay: animateMode === 'immediate' ? 0.15 : 0,
        ...trigger,
      })
      gsap.from('.metric-val', {
        opacity: 0,
        y: 8,
        duration: 0.6,
        stagger: 0.1,
        ease: 'expo.out',
        delay: animateMode === 'immediate' ? 0.25 : 0,
        ...trigger,
      })
    }, ref)
    return () => ctx.revert()
  }, [client.variant, animateMode])

  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div
      ref={ref}
      className={`client-card${className ? ` ${className}` : ''}`}
      style={{
        width: '360px',
        height: '500px',
        background: 'var(--tb-surface-up)',
        border: `1px solid ${isComplete ? 'var(--tb-brand)' : 'var(--tb-border)'}`,
        borderRadius: 'var(--r-card)',
        padding: 'var(--s8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s5)',
        flexShrink: 0,
        boxShadow: isComplete ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* Badge + semana */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.1em',
          color: 'var(--tb-brand)',
          border: '1px solid rgba(143,212,58,0.3)',
          borderRadius: 'var(--r-pill)',
          padding: '3px 10px',
        }}>{client.badge}</span>
        <span style={{
          fontFamily: 'monospace', fontSize: '9px',
          color: 'var(--tb-muted)', letterSpacing: '0.06em',
        }}>SEM. {client.weeks}</span>
      </div>

      {/* Avatar + nombre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: isComplete
            ? 'linear-gradient(135deg, rgba(143,212,58,0.3), rgba(143,212,58,0.1))'
            : 'var(--tb-surface)',
          border: `1.5px solid ${isComplete ? 'var(--tb-brand)' : 'var(--tb-border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '18px', color: 'var(--tb-brand)', flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'var(--text-md)', color: 'var(--tb-text)', lineHeight: 1.2,
          }}>{client.name}</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
            color: 'var(--tb-muted)', marginTop: '2px',
          }}>{client.city}</div>
        </div>
      </div>

      {/* Objetivo */}
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
        color: 'var(--tb-muted)', fontStyle: 'italic',
      }}>Objetivo: {client.goal}</div>

      {/* Barra de progreso */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--tb-muted)', letterSpacing: '0.06em' }}>PROGRESO</span>
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--tb-brand)', fontWeight: 700 }}>{client.progress}%</span>
        </div>
        <div style={{ height: '3px', background: 'var(--tb-border)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
          <div
            className="progress-fill"
            style={{
              height: '100%',
              width: `${client.progress}%`,
              background: isComplete ? 'linear-gradient(90deg, #8FD43A, #B5E860)' : 'var(--tb-brand)',
              borderRadius: 'var(--r-pill)',
              boxShadow: '0 0 6px rgba(143,212,58,0.5)',
            }}
          />
        </div>
      </div>

      {/* Divisor */}
      <div style={{ height: '1px', background: 'var(--tb-border)' }} />

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--s3)' }}>
        {([
          { label: 'Peso',   value: client.metrics.weight },
          { label: 'Fuerza', value: client.metrics.strength },
          { label: 'Tiempo', value: `${client.weeks} sem` },
        ] as const).map((m) => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div className="metric-val" style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'var(--text-md)', color: 'var(--tb-brand)', lineHeight: 1,
            }}>{m.value}</div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '9px',
              color: 'var(--tb-muted)', marginTop: '4px',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          fontFamily: 'monospace', fontSize: '9px',
          color: isComplete ? 'var(--tb-brand)' : 'var(--tb-faint)',
          letterSpacing: '0.06em',
          borderTop: '1px solid var(--tb-border)',
          paddingTop: 'var(--s3)',
        }}>
          {isComplete ? '✓ OBJETIVO ALCANZADO' : client.metrics.label}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
npm run typecheck 2>&1 | grep -E "ClientCard|clientData"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/clientData.ts src/components/landing/ClientCard.tsx
git commit -m "feat(landing): ClientCard y clientData -- ficha de cliente como objeto protagonista"
```

---

## Task 6: FichasScroll

**Files:**
- Create: `src/components/landing/FichasScroll.tsx`

- [ ] **Step 1: Create FichasScroll.tsx**

```tsx
'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { ClientCard } from './ClientCard'
import { CLIENTS } from './clientData'

export function FichasScroll() {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bgRef    = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.innerWidth < 768) return

    const ctx = gsap.context(() => {
      const getX = () =>
        -(trackRef.current!.scrollWidth - window.innerWidth + 160)

      ScrollTrigger.create({
        trigger: wrapRef.current,
        pin: true,
        scrub: 1.5,
        start: 'top top',
        end: () => `+=${Math.abs(getX())}`,
        onUpdate(self) {
          gsap.set(trackRef.current, { x: getX() * self.progress })

          const cards = trackRef.current!.querySelectorAll<HTMLElement>('.client-card')
          const center = window.innerWidth / 2
          cards.forEach((card) => {
            const rect = card.getBoundingClientRect()
            const cardCenter = rect.left + rect.width / 2
            const dist = Math.abs(cardCenter - center)
            const scale = Math.max(0.88, 1 - (dist / window.innerWidth) * 0.3)
            const opacity = Math.max(0.45, 1 - (dist / window.innerWidth) * 0.8)
            gsap.to(card, { scale, opacity, duration: 0.3, ease: 'power2.out' })
          })

          const idx = Math.min(
            Math.round(self.progress * (CLIENTS.length - 1)),
            CLIENTS.length - 1
          )
          if (bgRef.current) {
            bgRef.current.style.background = CLIENTS[idx].bg
          }
        },
      })
    }, wrapRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapRef} className="fichas-wrap">
      {/* Fondo dinámico crossfade */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          transition: 'background 0.6s cubic-bezier(0.16,1,0.3,1)',
          background: CLIENTS[0].bg,
        }}
      />

      <span className="fichas-label" aria-hidden="true">Tus clientes</span>

      <div ref={trackRef} className="fichas-track">
        {CLIENTS.map((client) => (
          <ClientCard key={client.variant} client={client} animateMode="scroll" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npm run typecheck 2>&1 | grep FichasScroll
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FichasScroll.tsx
git commit -m "feat(landing): FichasScroll -- scroll horizontal cinematografico con 4 fichas"
```

---

## Task 7: ProfileSelector

**Files:**
- Create: `src/components/landing/ProfileSelector.tsx`

- [ ] **Step 1: Create ProfileSelector.tsx**

```tsx
'use client'
import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ClientCard } from './ClientCard'
import { CLIENTS } from './clientData'
import type { ClientData } from './clientData'

interface Profile {
  tab: string
  title: string
  desc: string
  bullets: string[]
  client: ClientData
}

const PROFILES: Profile[] = [
  {
    tab: '🏋️ Fuerza',
    title: 'Para entrenadores\nde fuerza y musculación',
    desc: 'Seguimiento de cargas, RPE y progresión de fuerza. Tus clientes ven cómo sus récords personales suben cada semana.',
    bullets: [
      'Registro de 1RM automático',
      'Progresión de series y pesos',
      'Gráficas de fuerza por grupo muscular',
    ],
    client: CLIENTS[2], // Carlos R. — 78%
  },
  {
    tab: '🏃 Cardio',
    title: 'Para entrenadores\nde running y resistencia',
    desc: 'Planes de entrenamiento por zonas de frecuencia cardíaca. Seguimiento de ritmos, distancias y evolución aeróbica.',
    bullets: [
      'Zonas FC integradas',
      'Planes por semanas de carrera',
      'Historial de entrenamientos outdoor',
    ],
    client: CLIENTS[3], // María G. — completado
  },
  {
    tab: '🥗 Nutrición',
    title: 'Para entrenadores\ncon enfoque nutricional',
    desc: 'Combina entrenamiento y hábitos alimenticios. Seguimiento de composición corporal y adherencia al plan.',
    bullets: [
      'Registro de peso corporal',
      'Evolución de % grasa',
      'Adherencia al plan nutricional',
    ],
    client: CLIENTS[0], // Alejandro M. — 12%
  },
  {
    tab: '⚡ Online',
    title: 'Para entrenadores\nque trabajan 100% en remoto',
    desc: 'Gestiona clientes de toda España sin reuniones presenciales. Todo el seguimiento y los cobros de forma digital.',
    bullets: [
      'Chat con todos los clientes centralizado',
      'Pagos recurrentes sin facturas manuales',
      'Seguimiento sin necesidad de vernos',
    ],
    client: CLIENTS[1], // Sara L. — 45%
  },
]

export function ProfileSelector() {
  const [active, setActive] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardRef    = useRef<HTMLDivElement>(null)

  const handleTab = (idx: number) => {
    if (idx === active) return
    const els = [contentRef.current, cardRef.current].filter(Boolean)
    gsap.to(els, {
      opacity: 0,
      y: -6,
      duration: 0.25,
      ease: 'power2.out',
      onComplete: () => {
        setActive(idx)
        gsap.fromTo(
          els,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }
        )
      },
    })
  }

  const profile = PROFILES[active]

  return (
    <section className="profile-section" id="sistema">
      <p className="profile-section-label">Para cada tipo de entrenador</p>

      {/* Tabs */}
      <div className="profile-tabs" role="tablist">
        {PROFILES.map((p, i) => (
          <button
            key={p.tab}
            role="tab"
            aria-selected={active === i}
            className={`profile-tab${active === i ? ' profile-tab--active' : ''}`}
            onClick={() => handleTab(i)}
          >
            {p.tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="profile-content">
        <div ref={contentRef} className="profile-text-col">
          <h2 className="profile-title">
            {profile.title.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block' }}>{line}</span>
            ))}
          </h2>
          <p className="profile-desc">{profile.desc}</p>
          <ul className="profile-bullets">
            {profile.bullets.map((b) => (
              <li key={b} className="profile-bullet">{b}</li>
            ))}
          </ul>
        </div>

        <div ref={cardRef} className="profile-card-col">
          <ClientCard
            key={active}
            client={profile.client}
            animateMode="immediate"
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npm run typecheck 2>&1 | grep ProfileSelector
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/ProfileSelector.tsx
git commit -m "feat(landing): ProfileSelector con 4 perfiles de entrenador y crossfade GSAP"
```

---

## Task 8: BootLoader update

**Files:**
- Modify: `src/components/landing/BootLoader.tsx`

- [ ] **Step 1: Add tagline below logo**

In `src/components/landing/BootLoader.tsx`, find the logo div:

```tsx
      <div
        className="boot-logo"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(22px, 4vw, 38px)',
          letterSpacing: '0.2em',
          color: 'var(--tb-brand)',
        }}
      >
        TRAINERBOOST
      </div>
```

Replace with:

```tsx
      <div style={{ textAlign: 'center' }}>
        <div
          className="boot-logo"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(22px, 4vw, 38px)',
            letterSpacing: '0.2em',
            color: 'var(--tb-brand)',
            marginBottom: '8px',
          }}
        >
          TRAINERBOOST
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--tb-muted)',
            letterSpacing: '0.06em',
          }}
        >
          Software para entrenadores personales
        </div>
      </div>
```

- [ ] **Step 2: TypeScript check**

```bash
npm run typecheck 2>&1 | grep BootLoader
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/BootLoader.tsx
git commit -m "style(landing): tagline en BootLoader"
```

---

## Task 9: page.tsx rewrite

**Files:**
- Rewrite: `src/app/page.tsx`

This is the assembly task. All components are ready. The page replaces the entire current file.

FAQ items — only non-pricing questions:

```typescript
const FAQ_ITEMS = [
  {
    q: '¿Cuándo estará disponible?',
    a: 'Estamos en beta privada con entrenadores seleccionados. El lanzamiento público está previsto para más adelante en 2026. Únete a la lista para tener acceso antes que nadie.',
  },
  {
    q: '¿Tengo que instalar alguna app?',
    a: 'No. TrainerBoost funciona desde el navegador, en cualquier dispositivo.',
  },
  {
    q: '¿Mis clientes necesitan descargarse algo?',
    a: 'Tampoco. Tus clientes acceden a su área desde el móvil o la tablet directamente, sin descargar nada.',
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Son tuyos. Puedes exportar clientes, historial y rutinas en cualquier momento, en formatos estándar.',
  },
  {
    q: '¿Funciona para entrenadores con muchos clientes?',
    a: 'Sí. Desde 5 hasta más de 100 clientes sin cambiar de herramienta. La plataforma escala contigo.',
  },
  {
    q: '¿En qué se diferencia de una app genérica de fitness?',
    a: 'Las apps de fitness están pensadas para el cliente final. TrainerBoost está pensado para ti: para gestionar tu negocio, hacer seguimiento y cobrar. Sin ruido extra.',
  },
]
```

- [ ] **Step 1: Write the new page.tsx**

Replace the entire content of `src/app/page.tsx` with:

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { BootLoader } from '@/components/landing/BootLoader'
import { GymLights } from '@/components/landing/GymLights'
import { ClientCard } from '@/components/landing/ClientCard'
import { FichasScroll } from '@/components/landing/FichasScroll'
import { ProfileSelector } from '@/components/landing/ProfileSelector'
import { TextReveal } from '@/components/ui/TextReveal'
import { Accordion } from '@/components/ui/Accordion'
import WaitlistForm from '@/components/landing/WaitlistForm'
import LogoFull from '@/components/logo/LogoFull'
import LogoIcon from '@/components/logo/LogoIcon'
import { CLIENTS, HERO_CLIENT } from '@/components/landing/clientData'
import './styles/landing.css'

const PAIN_ITEMS = [
  {
    bad: 'Planes de entrenamiento en PDF por WhatsApp',
    good: 'Rutinas digitales que el cliente ve desde su móvil',
  },
  {
    bad: 'Cobros manuales y recordatorios incómodos',
    good: 'Stripe integrado — el cobro llega solo, sin perseguir',
  },
  {
    bad: 'Clientes que abandonan porque no ven su progreso',
    good: 'Gráficas automáticas que los mantienen comprometidos',
  },
]

const FAQ_ITEMS = [
  {
    q: '¿Cuándo estará disponible?',
    a: 'Estamos en beta privada con entrenadores seleccionados. El lanzamiento público está previsto para más adelante en 2026. Únete a la lista para tener acceso antes que nadie.',
  },
  {
    q: '¿Tengo que instalar alguna app?',
    a: 'No. TrainerBoost funciona desde el navegador, en cualquier dispositivo.',
  },
  {
    q: '¿Mis clientes necesitan descargarse algo?',
    a: 'Tampoco. Tus clientes acceden a su área desde el móvil o la tablet directamente, sin descargar nada.',
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Son tuyos. Puedes exportar clientes, historial y rutinas en cualquier momento, en formatos estándar.',
  },
  {
    q: '¿Funciona para entrenadores con muchos clientes?',
    a: 'Sí. Desde 5 hasta más de 100 clientes sin cambiar de herramienta. La plataforma escala contigo.',
  },
  {
    q: '¿En qué se diferencia de una app genérica de fitness?',
    a: 'Las apps de fitness están pensadas para el cliente final. TrainerBoost está pensado para ti: para gestionar tu negocio, hacer seguimiento y cobrar. Sin ruido extra.',
  },
]

function DualCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return
    let mx = 0, my = 0, rx = 0, ry = 0
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      gsap.set(dot, { x: mx, y: my })
      dot.style.opacity = ring.style.opacity = '1'
      const isLink = !!(e.target as HTMLElement).closest('a, button, [role="button"], input')
      dot.classList.toggle('cursor-dot--hover', isLink)
      ring.classList.toggle('cursor-ring--hover', isLink)
    }
    document.addEventListener('mousemove', onMove)
    let raf: number
    const tick = () => {
      rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11
      gsap.set(ring, { x: rx, y: ry })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}

function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const update = () => {
      const max = document.body.scrollHeight - window.innerHeight
      if (fillRef.current && max > 0) {
        fillRef.current.style.height = `${(window.scrollY / max) * 100}%`
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={fillRef} className="scroll-progress-fill" />
    </div>
  )
}

export default function LandingPage() {
  const [booted, setBooted] = useState(false)
  const heroCardRef = useRef<HTMLDivElement>(null)

  // Hero entrance + floating after boot
  useEffect(() => {
    if (!booted) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero-badge',     { opacity: 0, y: 16, duration: 0.6 }, 0.1)
        .from('.hero-h1',        { opacity: 0, y: 32, duration: 0.8 }, 0.2)
        .from('.hero-sub',       { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.hero-ctas',      { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
        .from('.hero-card-wrap', { opacity: 0, y: 60, scale: 0.92, rotateX: 10, duration: 1.0 }, 0.3)

      if (heroCardRef.current) {
        gsap.to(heroCardRef.current, {
          y: 12, repeat: -1, yoyo: true, duration: 4, ease: 'sine.inOut',
        })
      }
    })
    return () => ctx.revert()
  }, [booted])

  // Mouse parallax on hero card
  useEffect(() => {
    if (!booted) return
    const card = heroCardRef.current
    if (!card) return
    const quickX = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3.out' })
    const quickY = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3.out' })
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      quickX((e.clientX - (rect.left + rect.width  / 2)) / rect.width  *  12)
      quickY((e.clientY - (rect.top  + rect.height / 2)) / rect.height * -8)
    }
    const onLeave = () => { quickX(0); quickY(0) }
    window.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => { window.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave) }
  }, [booted])

  // Pain section scroll reveals
  useEffect(() => {
    if (!booted) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.pain-item').forEach((item) => {
        gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 84%', once: true } })
          .from(item.querySelector('.pain-bad'),  { opacity: 0, x: -16, duration: 0.5, ease: 'expo.out' })
          .from(item.querySelector('.pain-good'), { opacity: 0, x: -16, duration: 0.5, ease: 'expo.out' }, '-=0.2')
      })
    })
    return () => ctx.revert()
  }, [booted])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {!booted && <BootLoader onComplete={() => setBooted(true)} />}

      <div
        className="landing-root"
        style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        <DualCursor />
        <ScrollProgressBar />

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="lp-nav-v2" aria-label="Navegación principal">
          <button
            className="lp-nav-v2-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Ir al inicio"
          >
            <LogoIcon size={24} />
          </button>
          <div className="lp-nav-v2-anchors">
            <a href="#sistema" className="lp-nav-v2-anchor">Cómo funciona</a>
            <a href="#faq"     className="lp-nav-v2-anchor">FAQ</a>
          </div>
          <button
            className="lp-nav-v2-cta"
            onClick={() => scrollTo('cta-final')}
          >
            Lista de espera
          </button>
        </nav>

        <main id="main-content">

          {/* ── S1: Hero ──────────────────────────────────────────────────── */}
          <section className="hero-section" aria-labelledby="hero-heading">
            <GymLights />

            <div className="hero-left" style={{ position: 'relative', zIndex: 1 }}>
              <div className="hero-badge" aria-hidden="true">
                <span className="hero-badge-dot" />
                Beta privada
              </div>

              <h1 id="hero-heading" className="hero-h1">
                Gestiona tu PT<br />como un profesional
              </h1>

              <p className="hero-sub">
                Clientes organizados. Seguimiento automático.<br />
                Cobros sin perseguir a nadie. Todo en un sitio.
              </p>

              <div className="hero-ctas">
                <button
                  className="hero-cta-primary"
                  onClick={() => scrollTo('cta-final')}
                >
                  Unirse a la lista de espera
                </button>
                <button
                  className="hero-cta-secondary"
                  onClick={() => scrollTo('fichas')}
                >
                  Ver cómo funciona →
                </button>
              </div>
            </div>

            <div className="hero-right" style={{ position: 'relative', zIndex: 1 }}>
              <div className="hero-card-wrap">
                <div ref={heroCardRef} className="hero-card-inner">
                  <div className="hero-card-glow" aria-hidden="true" />
                  <ClientCard client={HERO_CLIENT} animateMode="none" />
                </div>
              </div>
            </div>
          </section>

          {/* ── S2: Fichas Scroll ──────────────────────────────────────────── */}
          <div id="fichas">
            <FichasScroll />
          </div>

          {/* ── S3: Problema ──────────────────────────────────────────────── */}
          <section className="pain-section" aria-label="El problema">
            <TextReveal
              as="h2"
              className="pain-section-title"
            >
              {"Sin TrainerBoost, así\nes el día de un PT"}
            </TextReveal>

            <div className="pain-list">
              {PAIN_ITEMS.map((p, i) => (
                <div key={i} className="pain-item">
                  <p className="pain-bad">{p.bad}</p>
                  <p className="pain-good">
                    <span className="pain-arrow" aria-hidden="true">→</span>
                    {p.good}
                  </p>
                </div>
              ))}
            </div>

            <TextReveal
              as="h2"
              className="pain-close-title"
              delay={0.1}
            >
              {"Todo lo que necesitas\npara gestionar mejor\ny cobrar a tiempo."}
            </TextReveal>
          </section>

          {/* ── S4: Profile Selector ──────────────────────────────────────── */}
          <ProfileSelector />

          {/* ── S5: FAQ ──────────────────────────────────────────────────── */}
          <section className="faq-section" id="faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="faq-section-title">
              Preguntas que<br />se hacen los PTs
            </h2>
            <div className="faq-inner">
              <Accordion items={FAQ_ITEMS} />
            </div>
          </section>

          {/* ── S6: CTA Final ─────────────────────────────────────────────── */}
          <section
            className="cta-final-section"
            id="cta-final"
            aria-labelledby="cta-final-heading"
          >
            <div className="cta-final-card-bg" aria-hidden="true">
              <ClientCard
                client={CLIENTS[3]}
                animateMode="none"
                style={{ opacity: 0.12, transform: 'rotate(6deg)' }}
              />
            </div>

            <div className="cta-final-content">
              <h2 id="cta-final-heading" className="cta-final-h2">
                Empieza hoy.
              </h2>
              <p className="cta-final-sub">
                Apúntate. Te avisamos antes del lanzamiento.
              </p>
              <WaitlistForm />
            </div>
          </section>

        </main>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="lp-footer-v2" aria-label="Pie de página">
          <LogoFull height={24} />
          <nav className="lp-footer-v2-links" aria-label="Páginas legales">
            <a href="/privacidad" className="lp-footer-v2-link">Privacidad</a>
            <a href="/terminos"   className="lp-footer-v2-link">Términos</a>
            <a href="/cookies"    className="lp-footer-v2-link">Cookies</a>
          </nav>
          <p className="lp-footer-v2-copy">&copy; 2026 TrainerBoost &middot; España</p>
        </footer>

      </div>
    </>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` (or equivalent). If you see TypeScript errors, fix them before proceeding.

- [ ] **Step 3: Lint check**

```bash
npm run lint 2>&1 | grep -v "^$" | head -40
```

Expected: no errors. Warnings about `any` are acceptable if they can't be removed without breaking the build.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(landing): reescritura completa -- landing cinematografico con fichas de cliente"
```

---

## Task 10: Final verification

- [ ] **Step 1: Full build + typecheck**

```bash
npm run build && npm run typecheck
```

Expected: both pass with no errors.

- [ ] **Step 2: Start dev server and verify manually**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:

- [ ] BootLoader aparece, dura ~2.2s, desaparece con clip-path
- [ ] Hero: badge visible, H1 con dos líneas, subtítulo, dos CTAs, ficha de Carlos R. flotando
- [ ] GymLights: líneas verdes visibles pulsando en el hero
- [ ] Mouse parallax: la ficha se inclina al mover el ratón
- [ ] FichasScroll: scroll vertical mueve las fichas horizontalmente, fondo crossfade
- [ ] ProfileSelector: 4 tabs, click cambia contenido con fade, ficha cambia
- [ ] FAQ: Accordion abre/cierra con GSAP, sin preguntas de precio
- [ ] CTA final: ficha decorativa a baja opacidad detrás del formulario
- [ ] WaitlistForm funciona en hero CTA (scroll to bottom) y en CTA final
- [ ] BootLoader NO aparece en segunda visita (sessionStorage)
- [ ] Mobile 375px: hero apilado, fichas verticales, sin crash

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore(landing): verificacion final -- landing cinematografico completo"
```

---

## Spec coverage check

| Spec requirement | Task |
|---|---|
| BootLoader 2.2s, sessionStorage guard, clip-path exit | Task 8 |
| Lenis + GSAP ScrollTrigger integrado | Task 2 |
| GymLights SVG pulsante | Task 3 |
| TextReveal línea a línea | Task 4 |
| ClientCard 4 variantes, barra de progreso GSAP | Task 5 |
| FichasScroll horizontal pinneado, scale por distancia, crossfade fondo | Task 6 |
| ProfileSelector 4 tabs, crossfade GSAP, ficha por perfil | Task 7 |
| Hero: 2 columnas, badge, H1, CTA waitlist, mouse parallax, floating | Task 9 |
| Sección problema: tachado → solución, stagger reveal | Task 9 |
| FAQ: Accordion GSAP, sin preguntas de precio | Task 9 |
| CTA final: ficha decorativa 0.12 opacity, CTA 52px | Task 9 |
| Sin pricing, sin plazas limitadas, sin datos inventados | Spec + FAQ + copy |
| Todo GSAP en gsap.context() con cleanup | Tasks 3,4,5,6,7,9 |
| Mobile 375px funcional | CSS Task 1 + FichasScroll Task 6 |
| --tb-brand máx 3×/viewport | CSS design rules |
