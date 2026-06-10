# TRAINERBOOST_CONTEXT.md
# Contexto completo del producto — para Claude Code

> Este archivo define el producto, el negocio, la competencia y el roadmap.
> Claude Code: léelo completo antes de proponer cualquier feature o cambio de producto.

---

## 1. Qué es TrainerBoost

**Problema que resuelve:** El personal trainer independiente gestiona su negocio con WhatsApp, Excel y PDFs. Pasa horas haciendo trabajo manual que debería estar automatizado. Sus clientes se van porque no hay seguimiento real. No cobra a tiempo porque el proceso es incómodo.

**La solución:** Una plataforma SaaS en español, con precios en euros y adaptada al mercado hispanohablante, que centraliza la gestión completa del negocio de un personal trainer: clientes, rutinas, nutrición, citas, pagos y comunicación.

**La ventaja real:** No es la tecnología. Es la localización. Nadie está haciendo esto bien en español para el mercado ibérico y latinoamericano. Ese es el foso.

---

## 2. Dos tipos de usuario

### Trainer (entrenador)
- Gestiona su cartera de clientes
- Crea y asigna rutinas y planes de nutrición
- Gestiona citas y pagos
- Ve métricas de su negocio
- Accede vía `/dashboard`
- **Aislamiento crítico:** solo ve SUS clientes, nunca los de otro trainer

### Client (cliente del entrenador)
- Ve sus rutinas, nutrición y progreso
- Registra check-ins semanales
- Chatea con su entrenador
- Accede vía `/client` o app móvil (futura)
- **Aislamiento crítico:** solo ve SU información, nunca la de otros clientes

---

## 3. Dolores del target por orden de intensidad

1. **Tiempo** — Pasa horas creando rutinas en PDF, mandándolas por WhatsApp, respondiendo la misma pregunta a 10 clientes. Recuperar 5-10h semanales es el argumento de venta principal.

2. **Profesionalidad percibida** — Quiere que su cliente le vea como alguien organizado y serio, no como alguien que manda capturas de WhatsApp. El portal del cliente profesional le permite cobrar más caro.

3. **Retención de clientes** — El mayor problema de negocio no es conseguir clientes, es que se queden. Una herramienta que mantiene al cliente enganchado vale mucho más que una que solo organiza rutinas.

4. **Cobro automático** — Los impagos y retrasos son fuente de estrés. Automatizar el cobro mensual es una de las cosas más agradecidas cuando se descubre.

### Qué le haría recomendar TrainerBoost
Que un cliente suyo le diga *"oye, ¿qué app usas? Está muy bien"*. El boca a boca en este sector es brutal. Si el portal del cliente es bonito y funcional, el trainer lo recomienda solo.

### Qué le haría abandonar TrainerBoost
- Que el builder de rutinas sea lento o torpe
- Que los clientes digan que no entienden cómo usarla
- Bugs en momentos clave (cita que no aparece, mensaje que no llega)
- Soporte que tarda más de 24h en responder un problema crítico

---

## 4. Análisis de competencia

### Líderes del mercado (todos en inglés)

| Plataforma | Fortaleza | Debilidad |
|-----------|-----------|-----------|
| TrueCoach | Builder rápido, 1200+ vídeos ejercicios, drag & drop | Se siente como PDF digital, no moderno |
| Trainerize | Más grande del sector, integraciones wearables | Curva de aprendizaje alta, se siente viejo tras adquisición por ABC |
| MyPTHub | Clientes ilimitados a precio fijo, all-in-one económico | Interfaz menos pulida |
| Everfit | Automatizaciones e integraciones avanzadas | Complejo para trainers sin perfil técnico |

### Lo que ninguno hace bien
- Interfaz en español nativo
- Precios en euros sin conversión
- Facturación adaptada a autónomos españoles (IVA, modelo 130)
- Soporte en horario europeo y en español
- Comunidad hispanohablante
- Terminología adaptada al mercado español/latinoamericano

### La oportunidad de TrainerBoost
Ser **la plataforma de los entrenadores españoles**. Esa percepción vale más que cualquier feature técnica que TrueCoach tardará años en quitarte si inviertes en construirla.

---

## 5. Problemas críticos actuales (ordenados por severidad)

### 🔴 Crítico — Daña la credibilidad ahora mismo

**1. Demo con datos a cero**
La demo del entrenador muestra: 0 clientes, 0€, 0 sesiones. Cualquier potencial cliente que la visita asume que el producto no funciona o nadie lo usa. Necesita datos ficticios creíbles:
- 18 clientes activos
- 2.840€ ingresos del mes (+12% vs mes anterior)
- 6 citas hoy
- Gráfica de ingresos 6 meses con curva realista
- 3 clientes con progreso visible (nombres ficticios españoles)
- Feed de actividad reciente con 4-5 eventos

**2. Demo del cliente: secciones vacías**
Nutrición y citas no muestran contenido. Si la demo está rota, el visitante asume que la feature no existe.

**3. Testimonios sin credibilidad**
Todos ★5.0, todos genéricos. Los testimonios creíbles dicen cosas específicas: *"Tardaba 2 horas al día enviando PDFs. Ahora en 20 minutos tengo todo listo"*. La especificidad es la que convierte.

**4. Claim "500+ entrenadores" no verificable**
Si es verdad, bien. Si no, es el tipo de afirmación que destruye la confianza cuando alguien la cuestiona. Si estás en fase early, sé honesto: *"Primeros 50 entrenadores en beta"*.

### 🟡 Importante — Limita la propuesta de valor

**5. Sin biblioteca de ejercicios**
La competencia tiene entre 200 y 7.500 ejercicios con vídeo. TrainerBoost no menciona cuántos tiene. Es un dealbreaker para cualquier trainer que quiera crear rutinas rápido.

**6. Builder de rutinas no demostrado**
La demo no muestra cómo funciona el builder. La competencia más fuerte diferencia aquí: velocidad de creación, supersets, AMRAP, porcentajes de RM, duplicar semanas.

**7. Gestión de pagos sin detalle**
Se menciona Stripe pero no hay transparencia sobre comisiones, qué pasa con impagos, cómo funciona exactamente. Los trainers son muy sensibles a este punto.

**8. Pricing desajustado**
El plan Starter limita a 10 clientes por 19€/mes. Un trainer con 10 clientes ingresa entre 1.000-2.500€/mes. Para ese perfil, 19€ es irrelevante. El problema es la escalera de precios agresiva al crecer.

**9. "API access" en plan Business**
Un personal trainer independiente no va a usar una API. Solo genera confusión y la pregunta *"¿esto es para mí o para empresas?"*.

---

## 6. Roadmap por fases

### Fase 0 — Correcciones urgentes (hacerlas ANTES de buscar clientes)

| Tarea | Impacto | Complejidad | Estado |
|-------|---------|-------------|--------|
| Demo trainer con datos ficticios completos | 🔥 Máximo | Baja | ⬜ Pendiente |
| Demo cliente: rellenar nutrición y citas | 🔥 Máximo | Baja | ⬜ Pendiente |
| Testimonios específicos y creíbles | Alto | Baja | ⬜ Pendiente |
| Ajustar claim de usuarios a cifra real | Alto | Muy baja | ⬜ Pendiente |
| Flujo "3 pasos" con flujo real del producto | Alto | Baja | ⬜ Pendiente |
| Añadir argumento de ROI al pricing | Alto | Baja | ⬜ Pendiente |

### Fase 1 — MVP funcional

| Tarea | Impacto | Complejidad | Estado |
|-------|---------|-------------|--------|
| Builder de rutinas con plantillas (4/8/12 sem) | 🔥 Máximo | Alta | ⬜ Pendiente |
| Biblioteca de ejercicios mínima 200 items + imagen | 🔥 Máximo | Media | ⬜ Pendiente |
| Check-in semanal automatizado | Alto | Media | ⬜ Pendiente |
| Portal del cliente completo en móvil | Alto | Media | ⬜ Pendiente |
| Gestión de pagos Stripe documentada | Alto | Media | ⬜ Pendiente |
| Plantillas de programas reutilizables | Alto | Media | ⬜ Pendiente |

### Fase 2 — Diferenciación

| Tarea | Impacto | Complejidad | Estado |
|-------|---------|-------------|--------|
| Seguimiento de hábitos del cliente | Alto | Media | ⬜ Pendiente |
| Subida de vídeos de ejecución por cliente | Alto | Alta | ⬜ Pendiente |
| Branding básico del entrenador en portal | Medio | Baja | ⬜ Pendiente |
| Recordatorios automáticos de citas por email | Alto | Media | ⬜ Pendiente |
| PWA instalable con push notifications reales | Alto | Alta | ⬜ Pendiente |
| Biblioteca de ejercicios 500+ con vídeo | Alto | Alta | ⬜ Pendiente |

### Fase 3 — Escalado

| Tarea | Impacto | Complejidad | Estado |
|-------|---------|-------------|--------|
| Página pública del entrenador para captación | Alto | Alta | ⬜ Pendiente |
| Integración Google Calendar / Calendly | Medio | Media | ⬜ Pendiente |
| Apple Health / Google Fit / Garmin | Medio | Alta | ⬜ Pendiente |
| Multi-entrenador para centros pequeños | Alto | Alta | ⬜ Pendiente |
| IA para sugerencias de ajuste de carga | Medio | Muy alta | ⬜ Pendiente |

---

## 7. Seguridad — Checklist completo

### Autenticación y sesión
- [ ] JWT con expiración corta (15min access, 7d refresh)
- [ ] Refresh tokens rotatorios
- [ ] Rate limiting en endpoints de login (5 intentos / 15min por IP)
- [ ] Protección CSRF en formularios
- [ ] Logout invalida tokens en servidor
- [ ] Cookies HttpOnly y Secure en producción

### Autorización y aislamiento de datos (CRÍTICO)
- [ ] Toda query incluye `trainerId` del usuario autenticado
- [ ] Los clientes solo ven sus propios datos (`clientId` verificado)
- [ ] Middleware verifica rol antes de cada ruta protegida
- [ ] IDs no secuenciales (cuid o uuid) — nunca autoincrement expuesto
- [ ] Nunca devolver más campos de los necesarios en API responses

### Datos sensibles — RGPD
- [ ] Fotos corporales = categoría especial (encriptadas en reposo)
- [ ] Datos de salud encriptados en base de datos
- [ ] Política de retención de datos definida
- [ ] Derecho al olvido implementado (borrado real, no soft delete)
- [ ] Consentimiento explícito para datos de salud
- [ ] DPA firmado si usas subprocesadores (Vercel, Supabase)
- [ ] Registro de actividades de tratamiento

### Pagos (Stripe)
- [ ] Webhooks verificados con `stripe.webhooks.constructEvent()`
- [ ] Nunca almacenar datos de tarjeta, solo Stripe customer ID
- [ ] Idempotency keys en creación de cobros
- [ ] Logs de todas las transacciones (sin datos sensibles)
- [ ] Manejo explícito de todos los estados: pagado, fallido, reembolsado, disputado

### Subida de archivos
- [ ] Validación de tipo MIME en servidor (nunca confiar en extensión)
- [ ] Límite de tamaño por archivo y por usuario
- [ ] Almacenamiento aislado por trainer (nunca URLs predecibles)
- [ ] Scan de malware si subes vídeos o imágenes de usuarios

### Infraestructura y código
- [ ] Headers de seguridad: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] Variables de entorno nunca en cliente (sin `NEXT_PUBLIC_` para secrets)
- [ ] Dependencias npm auditadas regularmente (`npm audit`)
- [ ] Logs de errores sin datos de usuario identificables
- [ ] Monitoring de errores (Sentry o similar)
- [ ] Backups automáticos de base de datos verificados

---

## 8. Variables de entorno requeridas

```bash
# Autenticación
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Base de datos
DATABASE_URL=
DIRECT_URL= # si usas Supabase con connection pooling

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY= # o SENDGRID_API_KEY

# Storage
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # solo en servidor, NUNCA en cliente

# Monitoring
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 9. Esquema de datos — Relaciones principales

```
User (trainer)
  ├── id: cuid
  ├── email: string (unique)
  ├── plan: enum(FREE, STARTER, PRO, BUSINESS)
  └── Clients[]

Client
  ├── id: cuid
  ├── trainerId: string (FK → User.id) ← SIEMPRE presente en queries
  ├── email: string
  ├── personalInfo: encrypted
  └── Progress[]

Program
  ├── id: cuid
  ├── trainerId: string (FK → User.id)
  ├── isTemplate: boolean
  └── Workouts[]

Workout
  ├── id: cuid
  ├── programId: string (FK → Program.id)
  └── Exercises[]

ClientProgram (asignación)
  ├── clientId: string
  ├── programId: string
  ├── startDate: datetime
  └── status: enum

CheckIn (check-in semanal)
  ├── clientId: string
  ├── trainerId: string ← para queries del trainer
  ├── weekOf: date
  └── responses: json (encriptado)

Payment
  ├── clientId: string
  ├── trainerId: string
  ├── stripePaymentId: string
  ├── amount: int (centavos)
  └── status: enum
```

---

## 10. Mensajes de producto y copy

**Mensaje principal (elegir uno, no todos):**
> *"La app que hace que tus clientes no se vayan"*
> o bien:
> *"Gestiona 20 clientes en el tiempo que antes tardabas con 5"*

**Argumento de ROI (para pricing):**
> *"Si un cliente te paga 150€/mes y TrainerBoost te ayuda a retenerlo 2 meses más, el coste de la app es irrelevante. El coste de que se vaya es de 300€."*

**Lo que NO comunicar todo a la vez:** eficiencia, profesionalidad, centralización, ahorro de tiempo, retención, pagos. Elige uno como mensaje principal. El resto son beneficios secundarios.

---

## 11. Checklist antes de abrir a usuarios reales

- [ ] Demo con datos ficticios completos y creíbles
- [ ] Flujo de onboarding de nuevo trainer (< 5 min hasta primera rutina creada)
- [ ] Flujo de invitación a cliente funcionando end-to-end
- [ ] Stripe en producción (no test mode)
- [ ] Emails transaccionales funcionando (confirmación, invitación, recordatorios)
- [ ] Política de privacidad y términos de servicio adaptados a España
- [ ] Gestión de cookies y consentimiento (RGPD)
- [ ] Backup automático de base de datos activo
- [ ] Monitoring de errores activo (Sentry)
- [ ] Plan de soporte: canal, SLA, responsable
- [ ] Página de estado del servicio
- [ ] Proceso de baja y exportación de datos del usuario

---

*Versión: 2.0 | Actualizar roadmap en cada sesión de trabajo*
