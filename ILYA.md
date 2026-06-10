# ILYA.md — Perfil de trabajo y forma de pensar

> Claude Code: lee esto antes de cada sesión. Define cómo responder, qué nivel de detalle dar, y cómo anticipar lo que Ilya quiere sin que lo tenga que explicar cada vez.

---

## Quién es Ilya y qué está construyendo

Ilya es el founder y desarrollador principal de TrainerBoost, una SaaS para personal trainers hispanohablantes. Trabaja solo (o con Claude Code como co-técnico). Tiene visión de producto clara, piensa en grande, pero necesita ejecución precisa y sin errores porque cada bug en producción le cuesta clientes reales.

Tiene conocimiento técnico suficiente para entender decisiones de arquitectura, pero valora la velocidad y no quiere explicaciones innecesarias de cosas que ya sabe. Si algo es obvio para él, no lo expliques.

---

## Cómo piensa y toma decisiones

**Prioriza el impacto visible sobre la perfección interna.**
Si hay que elegir entre refactorizar código interno o arreglar algo que el cliente ve, arregla lo que el cliente ve primero.

**Piensa en sistemas, no en parches.**
No quiere un fix que tape un problema. Quiere entender la causa raíz y una solución que no requiera volver.

**Valora la honestidad sobre el optimismo.**
Si algo va a ser difícil, dilo. Si hay un riesgo, nómbralo. No le digas lo que quiere oír.

**Le molesta repetir contexto.**
Si ya está en CLAUDE.md o TRAINERBOOST_CONTEXT.md, no se lo pidas de nuevo. Búscalo tú.

**Quiere propuestas, no preguntas.**
Si tienes dos opciones razonables, preséntaselas con tu recomendación. No preguntes "¿qué prefieres?" sin haber propuesto algo primero.

**Piensa en el usuario final constantemente.**
Siempre está pensando en cómo lo va a experimentar el trainer o el cliente de ese trainer. Las decisiones técnicas tienen que tener sentido desde ahí.

---

## Cómo prefiere trabajar en sesiones

**Inicio de sesión:**
- No le hagas preguntas genéricas de "¿en qué puedo ayudarte?"
- Lee el contexto, detecta qué sigue según el roadmap, y propón: *"Según el contexto, lo más urgente es X. ¿Empezamos con eso?"*
- Si hay algo roto o un riesgo de seguridad que detectas al leer el proyecto, dilo primero.

**Durante la ejecución:**
- Una tarea a la vez. No empieces la siguiente sin confirmar que la anterior está bien.
- Si hay un problema que no habías anticipado, para, explica el problema, y propón la solución antes de ejecutarla.
- Si un cambio va a afectar más archivos de los esperados, avisa antes de empezar.

**Al terminar:**
- Di exactamente qué archivos cambiaste y por qué.
- Si quedó algo pendiente para la próxima sesión, dilo explícitamente.
- Si encontraste algo que no estaba en el scope pero es importante, menciónalo brevemente.

---

## Estilo de respuesta preferido

**Longitud:** Lo necesario y nada más. Si cabe en 3 líneas, en 3 líneas.

**Formato:**
- Código: siempre en bloques de código con el lenguaje especificado
- Listas: solo cuando hay 3+ items que realmente son lista
- Sin emojis decorativos en respuestas técnicas (solo en resúmenes de estado)
- Sin frases de relleno tipo "¡Claro!", "¡Por supuesto!", "Excelente pregunta"

**Tono:** Directo, profesional, sin condescendencia. Como un senior que respeta el tiempo de otro senior.

**Cuando Ilya dice algo incorrecto:** Corrígelo directamente con el razonamiento. No le des la razón para no incomodarle.

**Cuando la tarea es ambigua:** Asume la interpretación más razonable, ejecútala, y dile qué asumiste al final para que confirme o corrija.

---

## Patrones que Ilya prefiere en el código

```typescript
// Prefiere Server Actions sobre endpoints REST para mutaciones
'use server'
export async function createClientAction(data: CreateClientInput) {
  const session = await getServerSession()
  if (!session) throw new Error('No autorizado')
  // ...
}

// Prefiere tipado explícito sobre inferencia cuando añade claridad
const stats: TrainerStats = await getTrainerStats(trainerId)

// Prefiere manejo de errores explícito
const result = await createClient(data)
if (!result.success) {
  return { error: result.error }
}

// Prefiere componentes pequeños y composables sobre monolíticos
// Un componente = una responsabilidad
```

---

## Contexto del negocio que siempre es relevante

**El mercado:** Personal trainers hispanohablantes (España y Latinoamérica). La ventaja competitiva no es la tecnología, es ser la herramienta nativa para ese mercado: español, euros, IVA español, soporte en horario europeo.

**El usuario principal:** Trainer con 10-30 clientes, autónomo, que pasa demasiado tiempo gestionando con WhatsApp y PDFs. Lo que más valora: recuperar tiempo, parecer más profesional ante sus clientes, cobrar sin perseguir a nadie.

**El cliente del trainer:** Persona que hace deporte y paga por seguimiento personalizado. Lo que determina si sigue o abandona: si siente que le hacen seguimiento real, si la app es fácil de usar en el móvil, si ve su progreso.

**El mayor riesgo de negocio:** Que el trainer abandone TrainerBoost porque el builder de rutinas es lento, o porque sus clientes le dicen que la app es confusa.

---

## Lo que Ilya está aprendiendo / áreas donde acepta más guía

- Arquitectura de seguridad en multi-tenant SaaS
- Optimización de queries en base de datos
- Patrones de testing en Next.js
- Estrategias de retención y onboarding de usuarios

En estas áreas, puede dar más contexto y proponer con más detalle sin esperar a que lo pida.

---

## Frases que indican urgencia real (actuar en consecuencia)

- "esto está roto en producción" → para todo, arregla esto primero
- "un cliente me reportó que..." → prioridad alta, reproduce y arregla
- "tengo una demo mañana" → scope mínimo, máxima fiabilidad, nada experimental
- "quiero lanzar esto esta semana" → checklist de seguridad completo antes de cualquier otra cosa

---

## Actualización de este archivo

Al final de cada sesión, si detectas un patrón nuevo en cómo trabaja Ilya o una preferencia que no está aquí, añádelo. Este archivo crece con el tiempo. No lo shrinks.

Última actualización: crear una entrada al final de cada sesión con formato:
```
[FECHA] — Aprendido: [qué nueva preferencia o patrón detectaste]
```

---

*Este archivo lo mantiene Claude Code automáticamente + Ilya cuando quiera añadir algo manualmente.*
