# Tasks — TrainerBoost
> Memoria de sesión a sesión. Claude lee esto al arrancar.
> Última actualización: 2026-06-21

## 🔴 Prioridad máxima
- [ ] DEPLOY: Push a producción (main) — lleva semanas pendiente → +200 XP al completar
- [ ] FIX: Demo carga con datos vacíos → blocker crítico de conversión
- [ ] SEC: 13 API routes sin validación Zod (detectado codeflow 2026-06-04)
- [ ] SEC: 4 vulnerabilidades npm high → `npm audit fix` + review manual

## 🟡 Sprint actual (feature/waitlist-hero)
- [x] Landing redesign v7 — nivel ForgeTales ✓
- [x] GSAP 3.15 + SplitText + ScrollTrigger funcionando ✓
- [x] Acceso directo escritorio (scripts/start-kirito.bat) ✓
- [x] Ciclo de memoria Kirito OS activado ✓
- [x] Página /kirito dashboard de control ✓
- [ ] FEATURE: Sistema de waitlist con infraestructura funcional
- [ ] MEJORA: Botón "Ver demo en vivo" — bajo contraste sobre negro (añadir borde)
- [ ] FIX: Progress bars dashboard flashean 0% hasta que GSAP inicializa

## 🟢 Backlog ordenado por impacto
- [ ] FEATURE: Perfil público `/[trainer]` — herramienta adquisición Instagram
- [ ] FEATURE: Biblioteca de ejercicios Fase 1.3 (200+ ejercicios en DB)
- [ ] FEATURE: Check-in semanal automatizado Fase 1.4 (Vercel Cron lunes 9:00)
- [ ] FEATURE: Multi-trainer teams → desbloquea segmento gym, alto ARR
- [ ] MEJORA: Video demo del producto (elimina blocker de confianza)
- [ ] REFACTOR: 2 componentes >1400 líneas (routines, clients/[id])
- [ ] FIX: 33 console.log en producción → limpiar antes del próximo deploy
- [ ] FIX: Headers de seguridad en next.config

## ✅ Completado
- [x] Sistema Kirito OS v3.0 instalado y configurado
- [x] CLAUDE.md con contexto completo de TrainerBoost
- [x] Hooks de seguridad, memoria y arranque configurados
- [x] 3 subagentes: security-auditor, code-reviewer, ui-guardian
- [x] Stripe Connect implementado (cobros directos trainer→cliente, 5% comisión)
- [x] Sentry integrado (error boundaries, capturas)
- [x] RLS activo en 18 tablas
- [x] Landing page v7 completa

## 📌 Contexto permanente
- Stack: Next.js 14 + Supabase EU + Stripe Connect + Vercel
- Rama activa: feature/waitlist-hero → merge a develop → deploy a main
- Nivel XP: 750 / 1500 para Craftsman (Nivel 3)
- Próximo XP significativo: +200 por deploy a producción
- Deuda técnica conocida: ver knowledge/index.md sección "Deuda técnica"

---
*Actualizar al inicio y al final de cada sesión*
