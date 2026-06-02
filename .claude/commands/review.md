Analiza los cambios en $ARGUMENTS con este criterio exacto:

1. SEGURIDAD
   - ¿Hay secrets hardcodeados o en NEXT_PUBLIC_* que no deberían estar?
   - ¿SQL injection, XSS, auth bypass?
   - ¿SUPABASE_SERVICE_ROLE_KEY expuesto en cliente?
   - ¿API routes sin validación de sesión?

2. BUGS
   - ¿Edge cases no manejados? ¿null/undefined sin verificar?
   - ¿Cliente Supabase incorrecto (server vs client)?
   - ¿Queries que bypasean RLS sin justificación?
   - ¿Promesas sin await o sin manejo de error?

3. CONVENCIONES (verificar contra CLAUDE.md)
   - ¿Usa `any` sin eslint-disable documentado?
   - ¿Tailwind inline en lugar de clases utilitarias?
   - ¿Toast con librería distinta a sonner?
   - ¿Iconos con librería distinta a lucide-react?
   - ¿Fechas sin date-fns?

4. RENDIMIENTO
   - ¿Queries N+1 en Server Components?
   - ¿Re-renders innecesarios (falta useMemo/useCallback)?
   - ¿Imágenes sin next/image?
   - ¿Componentes cliente innecesarios (podría ser Server Component)?

5. TIPOS
   - ¿Tipos correctos de database.ts usados?
   - ¿Interfaces en lugar de types donde corresponde?

Formato de respuesta OBLIGATORIO:
🚨 CRÍTICO: [bloquea merge — lista con bullets]
⚠️ IMPORTANTE: [debe resolverse pronto — lista con bullets]
💡 SUGERENCIA: [mejoras opcionales — lista con bullets]
✅ BIEN: [qué está correcto — lista con bullets]

Si no hay nada en una categoría, omítela. Sin explicaciones largas — bullets directos.
