# TrainerBoost — Git Flow

## Rama principal
- `main` — producción. NUNCA commit directo.
- `develop` — integración. Merges desde feature branches.

## Feature branches activas
| Rama | Scope |
|------|-------|
| `feature/waitlist-hero` | Landing de waitlist + FOMO + Achievement Bento |
| `feature/gsap-animations` | Sistema GSAP centralizado (`src/lib/gsap/`) |
| `feature/logo-identity` | Logo SVG en 3 variantes (`src/components/logo/`) |
| `feature/rgpd-compliance` | RGPD banner, privacy, terms, checklist |
| `feature/seo-foundation` | Metadata helper, structured data, robots, SEO docs |
| `feature/social-strategy` | Docs de estrategia de contenido |

## Proceso
```
feature/* → develop → release/* → main
```

1. Crear rama desde `develop`
2. Commit con conventional commits: `feat(scope): descripción`
3. PR hacia `develop`
4. Review + merge → `develop`
5. Cuando `develop` está estable → merge a `main` + Vercel deploy

## Convención de commits
```
feat(waitlist): añade hero waitlist con FOMO counter
fix(api): corrige validación email en /api/waitlist
sec(rls): activa RLS en tabla waitlist
style(landing): añade estilos gaming × fitness
docs(seo): añade SEO-STRATEGY.md
```
