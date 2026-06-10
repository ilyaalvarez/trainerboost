# TrainerBoost — Instrucciones para Claude Code

> Este archivo lo lees ANTES de hacer cualquier cosa. Si no lo has leído completo, no empieces.

---

## 0. PROTOCOLO OBLIGATORIO (nunca omitir)

### Antes de escribir código:
1. Lee este archivo completo
2. Lee `TRAINERBOOST_CONTEXT.md` si existe en la raíz
3. Lee `ILYA.md` si existe en la raíz — define cómo trabaja Ilya y cómo debes responder
4. Confirma en 3 líneas: qué entiendes del proyecto, rama actual, y cuál es la tarea
5. Espera aprobación antes de ejecutar

### Reglas absolutas:
- **NUNCA** modifiques `main` o `master` directamente
- **NUNCA** hagas deploy a producción sin confirmación explícita de Ilya
- **NUNCA** instales dependencias nuevas sin decirlo y esperar OK
- **NUNCA** cambies arquitectura sin proponer y esperar OK
- **NUNCA** expongas secrets, API keys o datos de usuarios en logs
- **SIEMPRE** trabaja en una rama de feature (`feature/nombre-tarea`)
- **SIEMPRE** propón antes de ejecutar en cambios de más de 20 líneas
- **SIEMPRE** di qué archivos vas a tocar antes de tocarlos

### Formato de respuesta preferido:
- Directo. Sin florituras ni relleno.
- Si hay un problema, dilo primero. Luego la solución.
- Si hay varias opciones, da máximo 2 con pro/contra de cada una.
- Si pides confirmación, una sola pregunta, no cinco.

---

## 1. Stack técnico

```
Framework:    Next.js 14 (App Router)
Lenguaje:     TypeScript (strict mode)
Estilos:      Tailwind CSS
Auth:         [confirmar: NextAuth / Supabase Auth]
Database:     [confirmar: Supabase / Prisma + PostgreSQL]
ORM:          [confirmar: Prisma / Supabase client]
Pagos:        Stripe (con webhooks)
Deploy:       Vercel
Estado:       [confirmar: Zustand / Context API / ninguno]
Email:        [confirmar: Resend / SendGrid]
Storage:      [confirmar: Supabase Storage / Cloudinary]
```

> Si algo no está confirmado, LEE los archivos del proyecto para deducirlo. No inventes.

---

## 2. Estructura del proyecto

```
/app
  /(auth)          → rutas de autenticación
  /(dashboard)     → panel del entrenador
  /(client)        → portal del cliente
  /api             → endpoints API
/components        → componentes reutilizables
/lib               → utilidades, clientes, helpers
/types             → tipos TypeScript
/prisma o /supabase → schema de base de datos
```

> Confirma la estructura real leyendo el proyecto antes de asumir.

---

## 3. Dos tipos de usuario — CRÍTICO para seguridad

**Trainer (entrenador):**
- Crea y gestiona clientes
- Ve solo SUS clientes, nunca los de otro trainer
- Accede al dashboard `/dashboard`

**Client (cliente del entrenador):**
- Ve solo SU información
- Accede al portal `/client`
- No puede ver información de otros clientes ni del negocio del trainer

**Regla de oro:** Toda query a base de datos que devuelva datos de usuario DEBE incluir `trainerId` del usuario autenticado. Sin excepción.

---

## 4. Reglas de seguridad como código

```typescript
// ✅ CORRECTO — siempre filtra por trainerId
const clients = await db.client.findMany({
  where: { trainerId: session.user.id }
})

// ❌ INCORRECTO — nunca hagas esto
const clients = await db.client.findMany()

// ✅ CORRECTO — valida en servidor con Zod
const schema = z.object({ name: z.string().min(1).max(100) })
const data = schema.parse(body)

// ✅ CORRECTO — IDs no secuenciales (usa cuid o uuid)
id: cuid()

// ❌ INCORRECTO — nunca IDs predecibles
id: autoincrement()
```

**Checklist obligatorio antes de cualquier endpoint nuevo:**
- [ ] Verifica sesión activa antes de cualquier operación
- [ ] Filtra por `trainerId` o `clientId` según contexto
- [ ] Valida input con Zod en servidor
- [ ] No devuelve más campos de los necesarios
- [ ] Rate limiting en endpoints de auth y pagos
- [ ] Stripe webhooks verifican `stripe.webhooks.constructEvent()`

---

## 5. Convenciones de código

```typescript
// Componentes: PascalCase, sufijo descriptivo
ClientCard.tsx
TrainerDashboard.tsx

// Hooks: camelCase con prefijo use
useClientProgress.ts
useTrainerStats.ts

// API routes: kebab-case
/api/trainer/clients/[id]/route.ts

// Server Actions: camelCase con sufijo Action
createClientAction.ts
updateProgressAction.ts

// Tipos: PascalCase, sin prefijo I
type Client = { ... }
type TrainerStats = { ... }
```

**Patrones preferidos:**
- Server Components por defecto, `use client` solo cuando necesario
- Server Actions para mutaciones, no endpoints REST cuando sea posible
- `loading.tsx` y `error.tsx` en cada segmento de ruta
- Manejo de errores explícito, nunca `catch(e) {}` vacío

---

## 6. Commits y git

```bash
# Formato obligatorio:
tipo(scope): descripción en español en minúsculas

# Tipos válidos:
feat:     nueva funcionalidad
fix:      corrección de bug
sec:      mejora de seguridad
perf:     optimización de rendimiento
refactor: refactoring sin cambio de comportamiento
style:    cambios de UI/CSS
docs:     documentación
test:     tests

# Ejemplos correctos:
feat(demo): rellena datos ficticios del dashboard del trainer
fix(auth): corrige redirección tras login de cliente
sec(api): añade validación de trainerId en endpoint de clientes
```

---

## 7. Estado actual del proyecto (actualizar en cada sesión)

```
FASE 0 — Correcciones urgentes:
[ ] Demo trainer: datos a cero (0 clientes, 0€, 0 sesiones)
[ ] Demo cliente: secciones nutrición y citas vacías
[ ] Testimonios genéricos — reemplazar por testimonios específicos y creíbles
[ ] Claim "500+ entrenadores" — verificar o cambiar a cifra real

FASE 1 — MVP:
[ ] Builder de rutinas con plantillas
[ ] Biblioteca de ejercicios mínima (200 ejercicios con imagen/vídeo)
[ ] Check-in semanal automatizado
[ ] Portal del cliente completo en móvil
[ ] Gestión de pagos Stripe documentada y transparente

FASE 2 — Diferenciación:
[ ] Seguimiento de hábitos del cliente
[ ] Subida de vídeos de ejecución por cliente
[ ] Branding básico del entrenador en portal del cliente
[ ] PWA instalable con push notifications reales

FASE 3 — Escalado:
[ ] Página pública del entrenador para captación
[ ] Integración Google Calendar / Calendly
[ ] Apple Health / Google Fit
[ ] Multi-entrenador para centros pequeños
[ ] IA para sugerencias de ajuste de carga
```

---

## 8. Lo que nunca debes hacer

- Inventar datos de usuarios reales, testimonios, métricas o afirmaciones de negocio
- Cambiar el esquema de base de datos sin proponer la migración primero
- Añadir `console.log` con datos de usuario en código de producción
- Usar `any` en TypeScript sin justificación explícita
- Poner lógica de negocio en componentes — va en Server Actions o API routes
- Dejar `TODO` sin crear una tarea documentada
- Decir "listo" sin haber verificado que funciona

---

## 9. Prioridad de trabajo en cada sesión

Siempre en este orden:
1. **Seguridad** — si hay un bug de seguridad, va primero
2. **Fase 0** — correcciones críticas que dañan la credibilidad
3. **Fase 1** — funcionalidades MVP
4. **Fase 2** — diferenciación
5. **Optimización** — performance, refactoring

---

*Versión: 2.0 | Última actualización: manual por Ilya*
*Leer también: TRAINERBOOST_CONTEXT.md y ILYA.md*
