Implementa la feature: $ARGUMENTS

Proceso obligatorio en este orden:

1. LEE el contexto
   - Repasa CLAUDE.md para convenciones y reglas
   - Identifica archivos afectados antes de escribir una línea
   - Busca una feature similar ya implementada en src/ y sigue ese patrón EXACTO

2. DEFINE tipos primero
   - Añade o reutiliza tipos en src/types/database.ts o tipos locales
   - Sin `any`. Sin tipos de conveniencia que se pueden inferir.

3. IMPLEMENTA de dentro hacia afuera
   - Datos: query/mutation en Server Component o API route
   - Lógica: hooks o server actions si aplica
   - UI: componente con Tailwind, clases utilitarias existentes (.card, .btn-primary, .input, .badge-*)
   - Toast con sonner para feedback (toast.success / toast.error)

4. SUPABASE
   - Server Components/layouts/API routes → createClient() de @/lib/supabase/server
   - Componentes cliente → createClient() de @/lib/supabase/client
   - Operaciones admin → createServiceClient() de @/lib/supabase/server
   - No añadir filtros extra si RLS ya lo hace

5. PLANES (si la feature es premium)
   - Usar PlanGuard: starter(1) < pro(2) < unlimited(3)
   - Importar desde src/lib/plans.ts

6. VERIFICA
   - Sin errores TypeScript: npm run typecheck
   - Sin errores lint: npm run lint
   - Actualiza CLAUDE.md si hubo cambios de arquitectura

Restricciones:
- No instalar dependencias nuevas sin preguntar
- No cambiar archivos fuera del scope de la feature
- Máximo 150 líneas por función/componente
