# RGPD Checklist — TrainerBoost

## Estado: En progreso

### Recolección de datos
- [x] Tabla `waitlist` solo almacena email + ip_hash (no IP en claro)
- [x] Honeypot anti-spam (campo `website` oculto)
- [x] Texto de consentimiento visible en el formulario con enlace a /privacy
- [x] Usuarios solo pueden insertar en `waitlist`, no leer (RLS)
- [ ] Implementar endpoint DELETE /api/waitlist (derecho al olvido)
- [ ] Email de confirmación con enlace de baja

### Almacenamiento
- [x] Datos en servidores EU (Supabase eu-west-1)
- [x] RLS activado en todas las tablas
- [x] SUPABASE_SERVICE_ROLE_KEY nunca con prefijo NEXT_PUBLIC_
- [x] Backups automáticos Supabase

### Consentimiento
- [x] Cookie banner (RGPDConsent.tsx) con "Solo esenciales" / "Aceptar"
- [x] Consentimiento guardado en localStorage con clave `tb_rgpd_consent`
- [ ] Actualizar privacy/page.tsx con política de cookies detallada
- [ ] Actualizar terms/page.tsx con versión 2026

### Analytics
- [ ] Verificar que Plausible/Vercel Analytics respeta la elección del usuario
- [ ] No cargar scripts de terceros sin consentimiento

### Formularios
- [x] Email normalizado (trim + lowercase) antes de guardar
- [x] Rate limiting en /api/waitlist (5 req/hora por IP)
- [x] No se exponen errores del servidor al cliente

### Documentación
- [x] RGPD-CHECKLIST.md (este archivo)
- [ ] Actualizar /privacy con lista explícita de datos recogidos
- [ ] Añadir fecha de última actualización en /privacy y /terms
- [ ] DPA (Data Processing Agreement) si se usan procesadores EU

### Derechos del usuario (ARCO)
- [ ] Acceso: endpoint para exportar datos del entrenador
- [ ] Rectificación: ya disponible via Settings
- [ ] Cancelación/Supresión: endpoint DELETE en /api/account/delete
- [ ] Oposición: email de contacto visible en /privacy
