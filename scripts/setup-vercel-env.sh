#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-vercel-env.sh
# Añade las variables necesarias para las nuevas funcionalidades a Vercel.
# Ejecución: bash scripts/setup-vercel-env.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Comprobaciones previas ────────────────────────────────────────────────────

if ! command -v vercel &>/dev/null; then
  echo "❌  Vercel CLI no encontrado. Instálalo con: npm i -g vercel"
  exit 1
fi

if ! vercel whoami &>/dev/null; then
  echo "⚠️  No estás autenticado. Iniciando login..."
  vercel login
fi

echo ""
echo "🚀  Añadiendo variables de entorno a Vercel (production + preview + development)..."
echo ""

add_var() {
  local KEY=$1
  local VALUE=$2
  for ENV in production preview development; do
    vercel env rm "$KEY" "$ENV" --yes &>/dev/null 2>&1 || true
    printf '%s' "$VALUE" | vercel env add "$KEY" "$ENV" --yes &>/dev/null 2>&1
  done
  echo "  ✅  $KEY"
}

echo "📦 Web Push (VAPID):"
add_var "NEXT_PUBLIC_VAPID_PUBLIC_KEY" "BLn2kGh-Fu5IAlTTsR9FKIsbifigyejmnMOz_mxMNCpScKrBNcTMX06YdfVrRh7yky7pZXtKLSej0AsWSQUeaxw"
add_var "VAPID_PRIVATE_KEY"           "cXEg6GMUJAvFcn2PDPV5zUeVWjhy5hkzg0djfR0dgFw"
add_var "VAPID_EMAIL"                 "mailto:hola@trainerboost.es"

echo ""
echo "🔐 Seguridad interna:"
add_var "INTERNAL_API_SECRET" "de9d94fd9c6a41568ed01ff316dd15484f08eab524669b7f7ee1f02c1364c630"

echo ""
echo "────────────────────────────────────────"
echo "  NOTA: CRON_SECRET lo genera Vercel    "
echo "  automáticamente — no hace falta       "
echo "  añadirlo manualmente.                 "
echo "────────────────────────────────────────"
echo ""
echo "✅  Variables añadidas. Lanzando redeploy en producción..."
vercel --prod --yes

echo ""
echo "🎉  ¡Listo! TrainerBoost se está desplegando con todas las variables."
