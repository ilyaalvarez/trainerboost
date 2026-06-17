# Sprint 01 Summary — TrainerBoost Design System v2 + Waitlist Landing

**Fechas:** 2026-06-17 / 2026-06-18  
**Rama principal:** `feature/waitlist-hero` → `develop`

## Objetivo del sprint
Reemplazar la landing de producto completo por una landing de waitlist Gaming × Fitness con un único objetivo: capturar el email del entrenador y generarle el deseo de estar en el lanzamiento.

## Entregables completados

### Config layer (single source of truth)
- `config/site.ts` — nombre, tagline, URL, colores, social, waitlist params, precios
- `config/waitlist.ts` — rate limit, honeypot field, email provider

### Base de datos
- Tabla `waitlist` aplicada en Supabase (eu-west-1):
  - `id`, `email` (UNIQUE), `source`, `position` (IDENTITY), `created_at`, `ip_hash`, `confirmed`
  - RLS: INSERT público, SELECT denegado al cliente
  - Índice por `created_at`

### API
- `src/app/api/waitlist/route.ts`
  - POST: valida email, honeypot, rate limit (5/hora por IP), inserta, retorna `{ success, total }`
  - GET: retorna `{ total, spotsLeft }` para el FOMO counter
  - IP almacenada como SHA-256 hash (RGPD)

### Componentes
- `src/components/landing/WaitlistForm.tsx` — 4 estados (idle/loading/success/error), FOMO bar, honeypot
- `src/components/landing/StatsBar.tsx` — 4 métricas con IntersectionObserver reveal
- `src/components/landing/RGPDConsent.tsx` — banner RGPD con localStorage

### Logo system
- `src/components/logo/LogoIcon.tsx` — hexágono + bolt (32×32)
- `src/components/logo/LogoFull.tsx` — icono + wordmark horizontal
- `src/components/logo/LogoVertical.tsx` — icono + wordmark vertical

### GSAP centralizado
- `src/lib/gsap/config.ts` — `getGSAP()` y `getGSAPWithSplit()` con dynamic import
- `src/lib/gsap/animations.ts` — `createScrollFadeUp`, `createBentoReveal`, `animateHeroHeadline`, `shakeElement`, `countUp`

### SEO
- `src/lib/seo/metadata.ts` — `buildMetadata()` helper para todas las páginas
- `src/lib/seo/structured-data.ts` — `getSoftwareAppSchema()`, `getOrganizationSchema()`, `getFAQSchema()`

### Landing page rewrite
- `src/app/page.tsx` reescrito como waitlist landing:
  - Nav minimalista (logo + "Ya tengo cuenta")
  - Hero Gaming × Fitness (Barlow Condensed H1, FOMO tag, WaitlistForm)
  - StatsBar (4 métricas)
  - Achievement Bento 2×2 (descuento vitalicio, beta, sin comisiones, soporte fundador)
  - Social proof minimal (sin estrellas, sin testimonios genéricos)
  - FAQ minimal (3 preguntas)
  - CTA final con WaitlistForm
  - Footer minimal con links a pricing, demo, legal
  - RGPDConsent (lazy loaded)
- `src/app/styles/landing.css` — añadidos: hero-tag, FOMO bar, waitlist form, stats bar, achievement bento, RGPD banner, GSAP scroll classes

### Documentación
- `BRANCHES.md` — Git flow y convenciones
- `docs/RGPD-CHECKLIST.md` — estado del cumplimiento RGPD
- `docs/SEO-STRATEGY.md` — keywords, estructura, technical SEO, link building
- `docs/SOCIAL-STRATEGY.md` — canales, pilares, calendario, voz de marca

### Seguridad reforzada
- `/api/waitlist` añadido a ROUTE_LIMITS con limiter `strict` (5/hora)
- IPs hasheadas con SHA-256 antes de guardar

## Anti-patrones evitados (Gaming × Fitness)
- No Lucide/Heroicons — SVG custom con 1.75px stroke
- No pill CTAs — botones rectangulares
- No radial gradient blobs
- No star testimonials
- No pill "Popular" badge
- No 3-col symmetric grid en bento — 2×2
- `#8FD43A` usado max 3 veces por viewport

## Pendiente para Sprint 02
- Verificar build en Vercel
- Actualizar /privacy y /terms con RGPD v2
- Exportar logos a public/brand/ como SVG estático
- Tests Playwright de la waitlist form
- Webhook Stripe para marcar invoice como 'paid'
- Dashboard alertas inteligentes (Fase 3.1 del Master Prompt v1.0)
