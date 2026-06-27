# Landing Cinematográfico TrainerBoost — Spec
**Fecha:** 2026-06-27
**Rama:** feature/waitlist-hero
**Estado:** Aprobado — listo para implementación

---

## Contexto y objetivo

Reemplazar el landing actual (hero con dashboard mockup) por un landing nivel cinematográfico inspirado en ciaoenergy.com. El objeto protagonista no es el dashboard — es la **ficha de cliente**: la tarjeta que un entrenador personal gestiona todos los días.

El landing sigue en **modo waitlist**. Todos los CTAs van al formulario de lista de espera. No hay registro, trial, pricing, ni copy de escasez/urgencia.

---

## Decisiones de diseño

### El objeto protagonista
Una tarjeta formato 3:4 (360×500px desktop) en dark mode. Representa el trabajo real del PT. Cuatro variantes de progreso del cliente:
- Variante 1 — Alejandro M., Madrid, 12%, NUEVO
- Variante 2 — Sara L., Barcelona, 45%, EN PROGRESO
- Variante 3 — Carlos R., Valencia, 78%, TRANSFORMANDO
- Variante 4 — María G., Sevilla, 100%, COMPLETADO

Todos los datos son ejemplos ficticios. No afirman ser reales. No hay métricas de negocio ni números de usuarios inventados.

### Modo waitlist — reglas de copy
- Sin "plazas limitadas", sin "acceso anticipado", sin "oferta", sin "promo"
- Hero badge: solo "Beta privada" — ningún claim de urgencia
- Hero CTA primario: "Unirse a la lista de espera"
- Hero CTA secundario: "Ver cómo funciona →" (scroll suave a FichasScroll)
- CTA final: "Unirse a la lista →" (52px, el más grande)
- Prueba social: omitida completamente
- Pricing: omitido completamente

---

## Arquitectura de componentes

### Nuevos archivos
| Archivo | Propósito |
|---|---|
| `src/providers/SmoothScrollProvider.tsx` | Lenis extraído de page.tsx, wrappea layout.tsx |
| `src/components/landing/GymLights.tsx` | SVG fullscreen con 12 segmentos LED verdes pulsantes |
| `src/components/landing/ClientCard.tsx` | Ficha atómica: props tipadas, barra de progreso GSAP |
| `src/components/landing/FichasScroll.tsx` | Scroll horizontal pinneado con 4 fichas + crossfade de fondo |
| `src/components/landing/ProfileSelector.tsx` | 4 tabs (Fuerza/Cardio/Nutrición/Online) + crossfade ficha+texto |
| `src/components/ui/TextReveal.tsx` | Reveal línea a línea con GSAP + ScrollTrigger |

### Archivos editados
| Archivo | Cambio |
|---|---|
| `src/app/layout.tsx` | Wrappear `<body>` con `SmoothScrollProvider` |
| `src/app/page.tsx` | Reescritura completa — 6 secciones nuevas |
| `src/app/styles/landing.css` | Añadir tokens: `--shadow-sm/md/lg`, `--s2…--s32`, `--r-card`, `--r-pill`, tipografía clamp |
| `src/components/landing/BootLoader.tsx` | Añadir tagline "Software para entrenadores personales" debajo del logo |

### Archivos reutilizados sin cambios
- `src/components/landing/WaitlistForm.tsx`
- `src/components/ui/Accordion.tsx`
- `src/components/logo/LogoFull.tsx`
- `src/components/logo/LogoIcon.tsx`

### Archivos obsoletos (no borrar hasta PR merge)
- `src/components/landing/FeatureScroll.tsx`
- `src/components/landing/ModuleSelector.tsx`

---

## Estructura de page.tsx — 6 secciones

```
<BootLoader />          — pantalla de carga, 2.2s, sessionStorage guard
<nav>                   — logo izq + anchors + "Lista de espera" CTA
<S1: Hero>              — 2 col: copy+CTA left / ClientCard v3 right + GymLights fondo
<S2: FichasScroll>      — scroll horizontal pinneado, 4 fichas, fondo crossfade
<S3: Problema>          — texto tachado → solución, stagger scroll reveal
<S4: ProfileSelector>   — 4 tabs de tipo de entrenador + ficha + descripción
<S5: FAQ>               — Accordion con preguntas reales (sin preguntas de precio)
<S6: CTA Final>         — ficha decorativa opacity 0.15 + CTA 52px waitlist
<footer>                — logo + links legales + copyright
```

Secciones eliminadas del scope: Prueba Social, Pricing.

### FAQ — preguntas permitidas (sin mencionar precios ni planes)
1. "¿Cuándo estará disponible?"
2. "¿Tengo que instalar alguna app?"
3. "¿Mis clientes necesitan descargarse algo?"
4. "¿Qué pasa con mis datos si cancelo?"
5. "¿Funciona para entrenadores con muchos clientes?"
6. "¿En qué se diferencia de una app genérica de fitness?"

---

## Contratos técnicos

### SmoothScrollProvider
```tsx
// Registra ScrollTrigger UNA SOLA VEZ aquí — no en cada componente
gsap.registerPlugin(ScrollTrigger)
// Lenis: lerp 0.08, smoothWheel true
// lenis.on('scroll', ScrollTrigger.update)
// gsap.ticker.add(time => lenis.raf(time * 1000))
// gsap.ticker.lagSmoothing(0)
```

### ClientCard props
```typescript
interface ClientData {
  variant: 1 | 2 | 3 | 4
  name: string
  city: string
  goal: string
  progress: number        // 0-100
  weeks: number
  metrics: { weight: string; strength: string; label: string }
  badge: string
  bg: string              // gradiente para crossfade de fondo
}
```

### FichasScroll — mecánica de scroll
- `pin: true`, `scrub: 1.5`
- `end: () => \`+=\${Math.abs(trackWidth - windowWidth + 160)}\``
- `onUpdate`: mover track con `gsap.set`, escalar fichas por distancia al centro, crossfade fondo
- Mobile (< 768px): ScrollTrigger desactivado, fichas apiladas con overflow-x scroll nativo

### TextReveal — contrato
```tsx
<TextReveal as="h2">{"Línea uno\nLínea dos"}</TextReveal>
// Divide por \n → overflow:hidden + span.trl por línea
// gsap.from('.trl', { y:'108%', scrollTrigger: { once: true } })
```

### GSAP — regla absoluta
Todo GSAP dentro de `gsap.context()` con `return () => ctx.revert()`. Sin excepción.

---

## Tokens CSS nuevos a añadir en landing.css

```css
--shadow-sm: 0 0 8px rgba(143,212,58,0.15), 0 2px 4px rgba(0,0,0,0.5);
--shadow-md: 0 0 24px rgba(143,212,58,0.20), 0 4px 20px rgba(0,0,0,0.6);
--shadow-lg: 0 0 48px rgba(143,212,58,0.25), 0 8px 40px rgba(0,0,0,0.7);

--font-display: var(--font-outfit, 'Outfit'), sans-serif;
--font-body:    var(--font-sans, 'Inter'), sans-serif;

--text-hero: clamp(52px, 8vw, 96px);
--text-xl:   clamp(32px, 5vw, 56px);
--text-lg:   clamp(20px, 3vw, 32px);
--text-md:   18px;

--s2:8px;  --s3:12px; --s4:16px; --s5:20px; --s6:24px;
--s8:32px; --s10:40px; --s12:48px; --s16:64px;
--s20:80px; --s24:96px; --s32:128px;

--r-sm:4px; --r-md:6px; --r-lg:8px; --r-card:16px; --r-pill:999px;

--tb-brand-glow: rgba(143,212,58,0.12);
```

---

## Reglas de diseño (no negociables)

- `--tb-brand` máximo 3 apariciones por viewport
- `border-radius`: `--r-lg` (8px) en cards normales, `--r-card` (16px) solo en fichas de cliente
- CTA altura exacta 44px (excepto CTA final: 52px)
- `cursor: pointer` en todo lo interactivo
- Sin `transition: all` — siempre propiedad específica
- Sin `#000000` ni `#FFFFFF` — usar tokens
- Sin datos inventados que afirmen ser reales
- Sin copy de escasez, urgencia u oferta

---

## Checklist pre-merge

- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin warnings
- [ ] Todo GSAP en `gsap.context()` con cleanup
- [ ] Mobile 375px: H1 legible, FichasScroll desactivado, fichas apiladas
- [ ] `--tb-brand` máximo 3×/viewport en cada sección
- [ ] BootLoader salta en visitas posteriores (sessionStorage)
- [ ] WaitlistForm funciona en hero y CTA final
- [ ] FAQ Accordion funciona con GSAP
- [ ] Cero menciones de precio, oferta, plaza, promo o dato de negocio

---

## Fuera de scope

- Sección de prueba social (sin testimonios reales)
- Sección de pricing (sin decisión pública de precio aún)
- Registro / trial / acceso anticipado
- Copy de urgencia o escasez ("plazas limitadas", "oferta", etc.)
- Métricas de negocio inventadas (usuarios, ingresos, trainers)
- Dark/light mode toggle
- i18n
