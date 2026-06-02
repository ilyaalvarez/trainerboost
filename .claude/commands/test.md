Genera tests para: $ARGUMENTS

Contexto del proyecto:
- Stack de testing: TypeScript estricto (no hay framework de test configurado aún — usa el patrón existente si hay tests, o propón vitest)
- Tipos desde src/types/database.ts

Proceso:

1. IDENTIFICA qué testear
   - Lógica de negocio en src/lib/ (utils, plans, stripe, push)
   - Server actions y API routes (comportamiento con inputs válidos e inválidos)
   - Hooks con lógica compleja
   - NO testear componentes UI simples que solo renderizan

2. ESTRUCTURA de cada test
   - Arrange: setup del estado inicial con mocks mínimos
   - Act: ejecuta la función
   - Assert: verifica el resultado exacto

3. CASOS a cubrir siempre
   - Happy path (flujo normal)
   - Input inválido / null / undefined
   - Error de Supabase simulado
   - Usuario no autenticado (si aplica)
   - Límite de plan (starter vs pro vs unlimited) si la función usa PlanGuard

4. MOCKS
   - Mockear @/lib/supabase/server y @/lib/supabase/client
   - Mockear stripe desde @/lib/stripe
   - No mockear lógica propia — testearla directamente

5. NOMENCLATURA
   - Archivo: [nombre].test.ts junto al archivo testeado, o en tests/unit/
   - Describe: nombre del módulo/función
   - It: "should [comportamiento] when [condición]"

Formato de respuesta:
- Código completo listo para ejecutar
- Sin explicaciones obvias en los comentarios del test
- Si faltan mocks de infraestructura, listarlos al final
