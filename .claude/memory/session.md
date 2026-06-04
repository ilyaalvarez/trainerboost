---
proyecto: TrainerBoost
última_sesión: 2026-06-03
rama_git: main
---

# Memoria del Proyecto — TrainerBoost UI Redesign

## Estado actual
Plan de rediseño UI confirmado. AÚN NO SE HA TOCADO NINGÚN ARCHIVO.
Próximo paso: empezar por Fase 1 (tokens).

## Tarea en curso
Rediseño visual completo al estilo Whoop/fitness premium.
Referencia visual: Whoop, Trainwell, TrueCoach.

## Decisiones de arquitectura tomadas

### Paleta nueva (CONFIRMADA)
- Base: `#0A0A0A` (reemplaza `#0F172A`)
- Primary/accent: `#A3FF4A` (neon lime — reemplaza `#0EA5E9` sky blue)
- Surfaces: `#141414` / `#1A1A1A` / `#222222` (reemplaza slate series)
- Border: `#222222` (reemplaza `#334155`)
- Text muted: `#888888`
- Semánticos intactos: success `#10B981`, warning `#F59E0B`, danger `#EF4444`

### Tipografía nueva (CONFIRMADA)
- Añadir: Barlow Condensed Bold → variable `--font-display`
- Números dashboard: Barlow Condensed, 48px, color `#A3FF4A`
- Mantener: Inter (body) + JetBrains Mono (código/valores)

### Dependencia nueva
- `framer-motion` — instalar con npm antes de Fase 5

## Tareas pendientes (empezar AQUÍ la próxima sesión)

### FASE 1 — Tokens (hacer primero)
- [ ] `tailwind.config.ts` → nuevos tokens de color + glow-green shadows
- [ ] `src/app/globals.css` → CSS vars, btn-primary verde, gradient-text lime, grain texture
- [ ] `src/app/layout.tsx` → añadir Barlow Condensed font, themeColor `#A3FF4A`

### FASE 2 — Componentes base
- [ ] `src/components/ui/StatsCard.tsx` → números Barlow 48px verde, bg `#141414`
- [ ] `src/components/layout/DashboardSidebar.tsx` → bg `#0D0D0D`, active verde

### FASE 3 — Landing
- [ ] `src/app/page.tsx` → hero grain + perspective mockup + CTA verde glow, testimonios avatar borde degradado

### FASE 4 — Dashboard
- [ ] `src/app/dashboard/page.tsx` → animated counter con Framer Motion

### FASE 5 — Animaciones
- [ ] Instalar framer-motion
- [ ] Hero fade + translateY, features stagger, pulsing badge

## Archivos clave del proyecto
- `tailwind.config.ts` → tokens de diseño centralizados
- `src/app/globals.css` → utilidades CSS (card, btn-*, badge-*, animaciones)
- `src/app/layout.tsx` → fuentes Google, metadata
- `src/components/ui/StatsCard.tsx` → cards de métricas del dashboard
- `src/components/layout/DashboardSidebar.tsx` → sidebar del dashboard
- `src/app/page.tsx` → landing page completa (1003 líneas)
- `src/app/dashboard/page.tsx` → dashboard principal

## Reglas del proyecto (de CLAUDE.md)
- Sin `any` en TypeScript
- Sin colores hardcodeados fuera de tokens CSS
- Sin comentarios salvo WHY no obvio
- Tailwind sobre CSS inline
- Iconos: lucide-react
- NO tocar funcionalidad (APIs, Supabase, Stripe, lógica de negocio)
- Rama: crear feature branch antes de cambios

## Próximos pasos recomendados
1. Crear branch: `git checkout -b feat/ui-redesign-whoop`
2. Editar `tailwind.config.ts` — nuevo sistema de tokens
3. Editar `globals.css` — CSS vars + utilities actualizadas
4. Editar `layout.tsx` — Barlow Condensed
5. Continuar con fases 2-5 en orden
