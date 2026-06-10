#!/usr/bin/env bash
# end-session.sh — Cierre inteligente de sesión con análisis de seguridad
# Uso: ./scripts/end-session.sh

set -euo pipefail

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
SESSION_LOG=".session-log.md"

echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  🔒 TrainerBoost — Cierre de sesión Claude Code${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# ── 1. Análisis del diff de seguridad ───────────────────────────────────
echo -e "${BOLD}[1/5] Análisis de seguridad del diff...${NC}"

SECURITY_ISSUES=()
DIFF_CONTENT=$(git diff HEAD 2>/dev/null || echo "")
STAGED_CONTENT=$(git diff --cached 2>/dev/null || echo "")
# Separar con newline real para no contaminar patrones de grep
ALL_DIFF="${DIFF_CONTENT}"$'\n'"${STAGED_CONTENT}"

# Secrets hardcodeados
if echo "$ALL_DIFF" | grep -qE '(sk_live_|sk_test_|whsec_|eyJ[A-Za-z0-9]|postgres://|mongodb://|redis://)[A-Za-z0-9]'; then
  SECURITY_ISSUES+=("⚠️  CRÍTICO: Posible secret hardcodeado en el diff")
fi

# IDOR: comparar conteo de findMany() nuevos vs filtros trainerId nuevos
# Más preciso que un check global binario
FINDMANY_COUNT=$(echo "$ALL_DIFF" | grep -cE '^\+.*findMany\(') || FINDMANY_COUNT=0
TRAINERID_COUNT=$(echo "$ALL_DIFF" | grep -cE '^\+.*trainerId:') || TRAINERID_COUNT=0
if [[ "$FINDMANY_COUNT" -gt 0 ]] && [[ "$TRAINERID_COUNT" -lt "$FINDMANY_COUNT" ]]; then
  SECURITY_ISSUES+=("⚠️  Posible IDOR: $FINDMANY_COUNT findMany() pero solo $TRAINERID_COUNT filtro(s) trainerId en líneas añadidas")
fi

# console.log con datos sensibles
if echo "$ALL_DIFF" | grep -qE 'console\.(log|warn|error)\(.*\b(user|client|email|password|token)\b'; then
  SECURITY_ISSUES+=("⚠️  console.log con posibles datos sensibles")
fi

# use client + DB: check por archivo para evitar falsos positivos entre archivos distintos
STAGED_FILES_LIST=$(git diff --cached --name-only 2>/dev/null || echo "")
if [[ -n "$STAGED_FILES_LIST" ]]; then
  while IFS= read -r staged_file; do
    [[ -z "$staged_file" ]] && continue
    FILE_DIFF=$(git diff --cached -- "$staged_file" 2>/dev/null || echo "")
    if echo "$FILE_DIFF" | grep -qE "\+'use client'" && echo "$FILE_DIFF" | grep -qE '\+(prisma|supabase)\.'; then
      SECURITY_ISSUES+=("⚠️  '$staged_file': 'use client' con llamadas a DB — mover a Server Action")
    fi
  done <<< "$STAGED_FILES_LIST"
fi

# any en TypeScript
TS_ANY_COUNT=$(echo "$ALL_DIFF" | grep -c ': any') || TS_ANY_COUNT=0
if [[ "$TS_ANY_COUNT" -gt 3 ]]; then
  SECURITY_ISSUES+=("ℹ️  $TS_ANY_COUNT usos de ':any' añadidos — revisar tipado")
fi

if [[ ${#SECURITY_ISSUES[@]} -eq 0 ]]; then
  echo -e "  ${GREEN}✓${NC} Sin issues de seguridad detectados"
else
  for issue in "${SECURITY_ISSUES[@]}"; do
    echo -e "  ${RED}$issue${NC}"
  done
  echo ""
  read -rp "  ¿Continuar de todas formas? (escribe 'sí' para confirmar): " CONFIRM
  if [[ "$CONFIRM" != "sí" && "$CONFIRM" != "si" ]]; then
    echo -e "\n${YELLOW}Sesión no cerrada. Corrige los issues antes de commitear.${NC}\n"
    exit 1
  fi
fi

# ── 2. Resumen de archivos cambiados ─────────────────────────────────────
echo -e "\n${BOLD}[2/5] Archivos modificados en esta sesión:${NC}"

git diff --name-only HEAD 2>/dev/null | while IFS= read -r file; do
  [[ -n "$file" ]] && echo -e "  ${CYAN}→${NC} $file"
done
git diff --cached --name-only 2>/dev/null | while IFS= read -r file; do
  [[ -n "$file" ]] && echo -e "  ${GREEN}+${NC} $file (staged)"
done

# Contar tanto staged como unstaged para el total correcto
UNSTAGED=$(git diff --name-only HEAD 2>/dev/null | wc -l | tr -d ' ')
STAGED_COUNT=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
CHANGED_FILES=$((UNSTAGED + STAGED_COUNT))
echo -e "  ${BOLD}Total: $CHANGED_FILES archivos${NC}"

# ── 3. Preguntas de cierre ───────────────────────────────────────────────
echo -e "\n${BOLD}[3/5] Resumen de sesión (para el log):${NC}"

read -rp "  ¿Qué se completó en esta sesión? (1-2 líneas): " QUE_SE_HIZO
read -rp "  ¿Qué quedó pendiente para la próxima? (1 línea): " QUE_QUEDA
read -rp "  ¿Algún aprendizaje o patrón nuevo? (enter para saltar): " APRENDIZAJE

# ── 4. Commit guiado ─────────────────────────────────────────────────────
echo -e "\n${BOLD}[4/5] Commit de cierre:${NC}"

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  # Inferir scope del primer archivo cambiado: usa el subdirectorio más específico
  FIRST_FILE=$({ git diff --name-only HEAD 2>/dev/null; git diff --cached --name-only 2>/dev/null; } | head -1 || echo "")
  FIRST_DIR=$(dirname "$FIRST_FILE" 2>/dev/null || echo ".")
  # Segundo segmento del path (ej: app/demo/page.tsx → demo), con fallback al primero
  INFERRED_SCOPE=$(echo "$FIRST_DIR" | awk -F'/' '{print ($2 != "" ? $2 : $1)}' | \
    tr -cd '[:alnum:]-' | tr '[:upper:]' '[:lower:]')
  [[ -z "$INFERRED_SCOPE" || "$INFERRED_SCOPE" == "." ]] && INFERRED_SCOPE="app"

  COMMIT_SUGERIDO="feat($INFERRED_SCOPE): $QUE_SE_HIZO"
  echo -e "  Mensaje sugerido: ${CYAN}$COMMIT_SUGERIDO${NC}"
  read -rp "  ¿Usar este mensaje? (enter = sí, o escribe otro): " COMMIT_CUSTOM
  COMMIT_MSG="${COMMIT_CUSTOM:-$COMMIT_SUGERIDO}"

  git add -A
  git commit -m "$COMMIT_MSG" --quiet
  echo -e "  ${GREEN}✓${NC} Commit creado: $COMMIT_MSG"
else
  echo -e "  ${YELLOW}Sin cambios sin commitear${NC}"
fi

# ── 5. Log y bloque Obsidian ─────────────────────────────────────────────
echo -e "\n${BOLD}[5/5] Generando log y entrada Obsidian...${NC}"

OBSIDIAN_ENTRY="
---
## 📝 Sesión $TIMESTAMP

**Completado:** $QUE_SE_HIZO
**Pendiente próxima sesión:** $QUE_QUEDA
**Archivos tocados:** $CHANGED_FILES
**Issues de seguridad:** ${#SECURITY_ISSUES[@]}
${APRENDIZAJE:+"**Aprendizaje:** $APRENDIZAJE"}

### Para el ILYA.md (si hay aprendizaje):
\`\`\`
[$TIMESTAMP] — Aprendido: $APRENDIZAJE
\`\`\`
---"

{
  echo ""
  echo "### Cierre — $TIMESTAMP"
  echo "**Completado:** $QUE_SE_HIZO"
  echo "**Pendiente:** $QUE_QUEDA"
  echo "**Issues seguridad:** ${#SECURITY_ISSUES[@]}"
  [[ -n "$APRENDIZAJE" ]] && echo "**Aprendizaje:** $APRENDIZAJE"
} >> "$SESSION_LOG"

echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  📓 COPIAR A OBSIDIAN (registro de sesiones):${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "$OBSIDIAN_ENTRY"

# Copiar al portapapeles — soporte multiplataforma
if command -v pbcopy &>/dev/null; then
  echo "$OBSIDIAN_ENTRY" | pbcopy
  echo -e "\n${GREEN}✓ Copiado al portapapeles (macOS)${NC}"
elif command -v xclip &>/dev/null; then
  echo "$OBSIDIAN_ENTRY" | xclip -selection clipboard
  echo -e "\n${GREEN}✓ Copiado al portapapeles (Linux/xclip)${NC}"
elif command -v xsel &>/dev/null; then
  echo "$OBSIDIAN_ENTRY" | xsel --clipboard --input
  echo -e "\n${GREEN}✓ Copiado al portapapeles (Linux/xsel)${NC}"
elif command -v clip.exe &>/dev/null; then
  echo "$OBSIDIAN_ENTRY" | clip.exe
  echo -e "\n${GREEN}✓ Copiado al portapapeles (Windows/WSL)${NC}"
elif [[ -f "/mnt/c/Windows/System32/clip.exe" ]]; then
  echo "$OBSIDIAN_ENTRY" | /mnt/c/Windows/System32/clip.exe
  echo -e "\n${GREEN}✓ Copiado al portapapeles (WSL → clip.exe)${NC}"
else
  echo -e "\n${YELLOW}⚠ Portapapeles no disponible — copia manualmente el bloque de arriba${NC}"
fi

# Actualizar ILYA.md si hay aprendizaje (con deduplicación)
if [[ -n "$APRENDIZAJE" && -f "ILYA.md" ]]; then
  ENTRY="[$TIMESTAMP] — Aprendido: $APRENDIZAJE"
  if ! grep -qF "$ENTRY" ILYA.md; then
    echo "" >> ILYA.md
    echo "$ENTRY" >> ILYA.md
    echo -e "${GREEN}✓ ILYA.md actualizado${NC}"
  else
    echo -e "${YELLOW}→ Este aprendizaje ya estaba en ILYA.md${NC}"
  fi
fi

echo -e "\n${BOLD}${GREEN}Sesión cerrada correctamente. ✓${NC}"
echo -e "${CYAN}Próxima sesión empieza con: ${BOLD}./scripts/start-session.sh${NC}\n"
