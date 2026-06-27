# SEO Strategy — TrainerBoost

## Objetivo
Posicionarse como la referencia #1 para "software para entrenadores personales España" en 6-12 meses desde lanzamiento.

## Keywords objetivo

### Primarias (alta intención)
- `software entrenador personal`
- `app para entrenadores personales España`
- `gestión clientes entrenador personal`
- `plataforma entrenador personal online`

### Long-tail (baja competencia, alta conversión)
- `cómo gestionar clientes entrenador personal`
- `alternativa Trainerize en español`
- `cobrar a clientes entrenador personal online`
- `rutinas personalizadas app entrenador`

### Semánticas de soporte
- `plan nutricional entrenador`
- `seguimiento progreso cliente fitness`
- `facturación entrenador personal`
- `chat entrenador cliente app`

## Estructura de contenido

### Páginas optimizadas (ya implementadas)
- `/` — H1 "Sube de nivel tu negocio" + metadata completa
- `/pricing` — keyword "precio software entrenador personal"
- `/p/[slug]` — páginas públicas de entrenadores (contenido UGC)

### Blog / Contenido SEO (por crear)
1. "Cómo escalar tu negocio de entrenamiento personal en 2026"
2. "Las 5 mejores apps para entrenadores personales (comparativa)"
3. "Cómo cobrar a tus clientes de fitness sin complicaciones"
4. "Trainerize vs TrainerBoost: cuál usar en España"

## Technical SEO — implementado

### Meta & Structured Data
- [x] `src/lib/seo/metadata.ts` — helper para buildMetadata()
- [x] `src/lib/seo/structured-data.ts` — SoftwareApp + Organization + FAQ schemas
- [x] `app/layout.tsx` — JSON-LD SoftwareApplication schema
- [x] OG tags + Twitter cards en todas las páginas
- [x] `metadataBase` en layout.tsx

### Crawling
- [x] `/sitemap.ts` — sitemap dinámico con perfiles públicos
- [x] `/robots.ts` — reglas correctas (bloquea /dashboard, /client)
- [x] `lang="es"` en html tag
- [x] `hreflang="es_ES"` via OG locale

### Performance (objetivo Lighthouse 90+)
- [x] next/font para fuentes (sin CLS)
- [x] `display: swap` en todas las fuentes
- [x] Imágenes con priority en above-the-fold
- [ ] Core Web Vitals audit pendiente
- [ ] Image optimization para og-image.png

## Link building

### Quick wins
- Directorios de entrenadores personales en España
- Foros: r/Fitness_es, foros de NSCA/CSCS España
- Product Hunt launch
- Colaboraciones con influencers fitness en Instagram/TikTok

### Objetivo DA inicial
- 10-15 backlinks de calidad en los primeros 3 meses
- Focus en dominios .es con relevancia fitness/negocio
