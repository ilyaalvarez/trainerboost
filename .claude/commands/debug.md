Diagnostica y resuelve: $ARGUMENTS

Proceso sistemático — NO saltar pasos:

1. REPRODUCE
   - Define las condiciones exactas: ¿qué usuario, qué ruta, qué acción?
   - ¿Es consistente o intermitente?
   - ¿Error en cliente, servidor, o Supabase?

2. AÍSLA
   - Lee el archivo/función exacta donde falla
   - Revisa si el error viene de RLS (query vacía sin error = RLS bloqueando)
   - Revisa si el cliente Supabase es correcto (server vs client vs service)

3. HIPÓTESIS (ordenadas de más a menos probable)
   H1: [causa más probable]
   H2: [segunda causa]
   H3: [tercera causa]
   Verifica cada una antes de pasar a la siguiente.

4. SOLUCIÓN MÍNIMA
   - Cambia solo lo necesario para resolver el bug
   - No refactorices de paso
   - No cambies comportamiento de otras rutas

5. VERIFICA
   - npm run typecheck → sin errores TS
   - El flujo que fallaba ahora funciona
   - Ningún otro flujo se rompe

Checklist de causas comunes en TrainerBoost:
- [ ] Cliente Supabase incorrecto (server vs browser)
- [ ] RLS sin política para el usuario autenticado
- [ ] Env var faltante en Vercel (solo en .env.local)
- [ ] `trainer_id` no pasado en INSERT
- [ ] Stripe webhook secret incorrecto (whsec_...)
- [ ] Server Component usando hook de React
- [ ] 'use client' faltante en componente con useState/useEffect
