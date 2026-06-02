Optimiza: $ARGUMENTS

Analiza y aplica mejoras en estas áreas (solo las que apliquen):

1. QUERIES SUPABASE
   - ¿Hay N+1 queries? (query dentro de un loop → un solo query con join o .in())
   - ¿Se selecciona `*` cuando solo se necesitan 3 campos? → seleccionar columnas explícitas
   - ¿Falta índice en columna usada en .eq() o .order()? → proponer migración
   - ¿Se puede usar .single() en lugar de .maybeSingle() si el resultado es siempre uno?

2. REACT / NEXT.JS
   - ¿Componente cliente que podría ser Server Component? → moverlo
   - ¿useEffect con fetch que podría ser Server Component? → eliminar
   - ¿Datos que se recalculan en cada render sin useMemo?
   - ¿Event handlers recreados sin useCallback en componentes con muchos hijos?
   - ¿Imágenes con <img> en lugar de next/image?

3. BUNDLE
   - ¿Imports completos de librerías grandes? (import * from 'date-fns' → import { format } from 'date-fns')
   - ¿Componentes pesados sin React.lazy() o dynamic import?

4. TOKENS / CONTEXTO (si se trata de prompts o agentes)
   - Identificar repeticiones de contexto
   - Sugerir uso del modelo correcto por tipo de tarea

Formato de respuesta:
- Lista de problemas encontrados con impacto estimado (alto/medio/bajo)
- Código de solución directo para cada uno
- Migración SQL si aplica (con nombre: YYYYMMDD_optimize_[tabla].sql)
- Sin sugerencias de "podrías también" — solo cambios con impacto medible
