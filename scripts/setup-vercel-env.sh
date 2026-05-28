#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-vercel-env.sh
# Sube todas las variables de .env.local a Vercel (entorno production).
# Ejecución: bash scripts/setup-vercel-env.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ENV_FILE=".env.local"
ENVIRONMENT="production"

# ── Comprobaciones previas ────────────────────────────────────────────────────

if ! command -v vercel &>/dev/null; then
  echo "❌  Vercel CLI no encontrado. Instálalo con:"
  echo "    npm i -g vercel"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "❌  No se encontró el archivo $ENV_FILE en el directorio actual."
  echo "    Ejecuta el script desde la raíz del proyecto."
  exit 1
fi

# ── Verificar sesión ──────────────────────────────────────────────────────────

if ! vercel whoami &>/dev/null; then
  echo "⚠️   No estás autenticado en Vercel. Iniciando login..."
  vercel login
fi

echo ""
echo "🚀  Subiendo variables de $ENV_FILE a Vercel ($ENVIRONMENT)..."
echo ""

ADDED=0
SKIPPED=0
FAILED=0

# ── Leer y subir cada variable ────────────────────────────────────────────────

while IFS= read -r line || [[ -n "$line" ]]; do
  # Ignorar comentarios y líneas vacías
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]]           && continue

  # Separar clave y valor
  key="${line%%=*}"
  value="${line#*=}"

  # Ignorar si la clave está vacía
  [[ -z "$key" ]] && continue

  # Quitar comillas del valor si las tiene
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  # Subir a Vercel (--yes acepta sin confirmación interactiva)
  if printf '%s' "$value" | vercel env add "$key" "$ENVIRONMENT" --yes &>/dev/null 2>&1; then
    echo "  ✅  $key"
    ((ADDED++)) || true
  else
    # Si ya existe, intentar sobreescribir con rm + add
    vercel env rm "$key" "$ENVIRONMENT" --yes &>/dev/null 2>&1 || true
    if printf '%s' "$value" | vercel env add "$key" "$ENVIRONMENT" --yes &>/dev/null 2>&1; then
      echo "  🔄  $key  (actualizada)"
      ((ADDED++)) || true
    else
      echo "  ⚠️   $key  (no se pudo añadir — comprueba el valor)"
      ((FAILED++)) || true
    fi
  fi

done < "$ENV_FILE"

# ── Resumen ───────────────────────────────────────────────────────────────────

echo ""
echo "────────────────────────────────────────"
echo "  Variables subidas:  $ADDED"
echo "  Con error:          $FAILED"
echo "────────────────────────────────────────"

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "⚠️   Algunas variables fallaron. Añádelas manualmente en:"
  echo "    vercel.com → tu proyecto → Settings → Environment Variables"
fi

echo ""
echo "✅  Lanzando redeploy en producción..."
vercel --prod --yes

echo ""
echo "🎉  ¡Listo! Vercel está desplegando con las nuevas variables."
