#!/usr/bin/env bash
# health-check.sh — Diagnóstico completo del proyecto sin tocar nada
# Uso: ./scripts/health-check.sh

set -euo pipefail

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

SCORE=100
ISSUES=0

echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  🏥 TrainerBoost — Health Check${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# ── Verificar dependencias ───────────────────────────────────────────────
for cmd in git node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "${RED}Error: '$cmd' no está disponible. Instálalo antes de continuar.${NC}"
    exit 1
  fi
done

penalize() {
  local points=$1
  local msg=$2
  SCORE=$((SCORE - points))
  ISSUES=$((ISSUES + 1))
  echo -e "  ${RED}✗ (-$points pts) $msg${NC}"
}

ok() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }

# ── Sistema de archivos ──────────────────────────────────────────────────
echo -e "${BOLD}[Archivos del sistema]${NC}"
[[ -f "CLAUDE.md" ]]                  && ok "CLAUDE.md presente"                  || penalize 15 "CLAUDE.md no encontrado — Claude Code arranca sin contexto"
[[ -f "ILYA.md" ]]                    && ok "ILYA.md presente"                    || penalize 10 "ILYA.md no encontrado — Claude Code no sabe cómo trabajar contigo"
[[ -f "TRAINERBOOST_CONTEXT.md" ]]    && ok "TRAINERBOOST_CONTEXT.md presente"    || penalize 10 "Contexto de producto no encontrado"
[[ -f "scripts/start-session.sh" ]]   && ok "start-session.sh presente"           || warn "start-session.sh no instalado"
[[ -f "scripts/end-session.sh" ]]     && ok "end-session.sh presente"             || warn "end-session.sh no instalado"
[[ -f ".gitignore" ]]                 && ok ".gitignore presente"                 || penalize 10 ".gitignore no existe — tus .env podrían commitearse"

# ── Git hooks ────────────────────────────────────────────────────────────
echo -e "\n${BOLD}[Git hooks]${NC}"
for HOOK in pre-commit commit-msg post-merge pre-push; do
  if [[ -x ".git/hooks/$HOOK" ]]; then
    ok "Hook $HOOK instalado y ejecutable"
  elif [[ -f ".git/hooks/$HOOK" ]]; then
    penalize 5 "Hook $HOOK existe pero no es ejecutable — ejecuta: chmod +x .git/hooks/$HOOK"
  else
    penalize 10 "Hook $HOOK no instalado — ejecuta install.sh para recuperarlo"
  fi
done

# ── Seguridad Git ────────────────────────────────────────────────────────
echo -e "\n${BOLD}[Seguridad Git]${NC}"

# .env sin .gitignore = riesgo máximo
if [[ -f ".env" ]] && [[ ! -f ".gitignore" ]]; then
  penalize 40 "CRÍTICO: .env existe pero no hay .gitignore — ejecuta: echo '.env*' > .gitignore"
fi

if git ls-files --error-unmatch .env &>/dev/null; then
  penalize 30 "CRÍTICO: .env está trackeado en git — ejecutar: git rm --cached .env"
else
  ok ".env no está en git"
fi

if git ls-files --error-unmatch .env.local &>/dev/null; then
  penalize 20 ".env.local está trackeado en git"
else
  ok ".env.local no está en git"
fi

if [[ -f ".gitignore" ]] && grep -q "^\.env" .gitignore; then
  ok ".env ignorado en .gitignore"
else
  penalize 15 ".env no está en .gitignore — añadir: echo '.env*' >> .gitignore"
fi

BRANCH=$(git branch --show-current 2>/dev/null || echo "?")
if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
  warn "Estás en $BRANCH. Considera trabajar en una feature branch."
else
  ok "Rama de trabajo: $BRANCH"
fi

# ── Secrets en código ────────────────────────────────────────────────────
echo -e "\n${BOLD}[Secrets en código]${NC}"

SECRETS_FOUND=0

# -q (quiet): detecta sin imprimir las líneas con el secret al terminal
if grep -rq "sk_live_" \
    --include="*.ts" --include="*.tsx" --include="*.js" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next \
    . 2>/dev/null; then
  penalize 25 "Stripe live key hardcodeada — localiza con: grep -r 'sk_live_' --include='*.ts' ."
  SECRETS_FOUND=$((SECRETS_FOUND + 1))
fi

if grep -rq "sk_test_" \
    --include="*.ts" --include="*.tsx" --include="*.js" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next \
    . 2>/dev/null; then
  penalize 10 "Stripe test key hardcodeada — localiza con: grep -r 'sk_test_' --include='*.ts' ."
  SECRETS_FOUND=$((SECRETS_FOUND + 1))
fi

[[ "$SECRETS_FOUND" -eq 0 ]] && ok "Sin secrets hardcodeados detectados"

# ── Dependencias ─────────────────────────────────────────────────────────
echo -e "\n${BOLD}[Dependencias]${NC}"

if [[ -f "package.json" ]]; then
  # ; true garantiza que el subshell siempre sale 0 aunque npm audit salga 1 por vulns
  AUDIT_OUTPUT=$(npm audit --json 2>/dev/null; true)
  CRITICAL=$(echo "$AUDIT_OUTPUT" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{
      try{const a=JSON.parse(d);console.log(a.metadata?.vulnerabilities?.critical||0);}
      catch{console.log(0);}
    })" 2>/dev/null) || CRITICAL=0
  HIGH=$(echo "$AUDIT_OUTPUT" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{
      try{const a=JSON.parse(d);console.log(a.metadata?.vulnerabilities?.high||0);}
      catch{console.log(0);}
    })" 2>/dev/null) || HIGH=0

  if [[ "$CRITICAL" -gt 0 ]]; then
    penalize 20 "$CRITICAL vulnerabilidades críticas npm — ejecuta: npm audit fix"
  else
    ok "0 vulnerabilidades críticas"
  fi
  if [[ "$HIGH" -gt 3 ]]; then
    penalize 10 "$HIGH vulnerabilidades altas npm"
  else
    ok "Vulnerabilidades altas: $HIGH"
  fi
else
  warn "package.json no encontrado"
fi

# ── Estado del roadmap ───────────────────────────────────────────────────
echo -e "\n${BOLD}[Roadmap]${NC}"

if [[ -f "TRAINERBOOST_CONTEXT.md" ]]; then
  # || VAR=0: si grep no encuentra nada (exit 1) no contamina la variable con doble output
  TOTAL_TASKS=$(grep -c "⬜ Pendiente\|✅ Hecho" TRAINERBOOST_CONTEXT.md 2>/dev/null) || TOTAL_TASKS=0
  DONE_TASKS=$(grep -c "✅ Hecho" TRAINERBOOST_CONTEXT.md 2>/dev/null) || DONE_TASKS=0
  PENDING_TASKS=$(grep -c "⬜ Pendiente" TRAINERBOOST_CONTEXT.md 2>/dev/null) || PENDING_TASKS=0

  echo -e "  ${CYAN}Total:${NC} $TOTAL_TASKS tareas | ${GREEN}Completadas:${NC} $DONE_TASKS | ${YELLOW}Pendientes:${NC} $PENDING_TASKS"
  echo ""
  echo -e "  ${RED}Próximas 3 tareas críticas:${NC}"
  grep "⬜ Pendiente" TRAINERBOOST_CONTEXT.md 2>/dev/null | head -3 | while IFS= read -r line; do
    TASK=$(echo "$line" | awk -F'|' '{print $2}' | xargs)
    [[ -n "$TASK" ]] && echo -e "    ${YELLOW}→${NC} $TASK"
  done
fi

# ── TypeScript ───────────────────────────────────────────────────────────
echo -e "\n${BOLD}[TypeScript]${NC}"

if [[ -f "tsconfig.json" ]]; then
  echo -e "  ${CYAN}Verificando tipos (máx. 30s)...${NC}"
  # Separar captura y conteo: evita que pipefail + || produzca "N\n0" en la variable
  TS_OUTPUT=$(timeout 30 npx tsc --noEmit 2>&1; true)
  TS_ERRORS=$(echo "$TS_OUTPUT" | grep -c "error TS") || TS_ERRORS=0
  if [[ "$TS_ERRORS" -gt 0 ]]; then
    penalize 15 "$TS_ERRORS errores TypeScript — ejecuta: npx tsc --noEmit para ver detalles"
  else
    ok "Sin errores TypeScript"
  fi

  # Excluir subpalabras (: anything, : anyValue) con [^a-zA-Z] al final
  # || ANY_COUNT=0: grep sale con 1 cuando no hay matches (proyecto limpio) → no crashear
  ANY_COUNT=$(grep -r ": any[^a-zA-Z]" \
    --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next \
    . 2>/dev/null | wc -l | tr -d ' ') || ANY_COUNT=0
  if [[ "$ANY_COUNT" -gt 10 ]]; then
    warn "$ANY_COUNT usos de ':any' — considerar tipado explícito"
  else
    ok "Uso de ':any' controlado ($ANY_COUNT)"
  fi
else
  warn "tsconfig.json no encontrado — TypeScript no verificado"
fi

# ── Score final ──────────────────────────────────────────────────────────
[[ "$SCORE" -lt 0 ]] && SCORE=0

echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Estado del proyecto:${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [[ "$SCORE" -ge 90 ]]; then
  echo -e "  ${GREEN}${BOLD}$SCORE/100 — Excelente. Listo para trabajar.${NC}"
elif [[ "$SCORE" -ge 70 ]]; then
  echo -e "  ${YELLOW}${BOLD}$SCORE/100 — Bien. $ISSUES issues menores a revisar.${NC}"
elif [[ "$SCORE" -ge 50 ]]; then
  echo -e "  ${YELLOW}${BOLD}$SCORE/100 — Aceptable. Corregir issues antes de producción.${NC}"
else
  echo -e "  ${RED}${BOLD}$SCORE/100 — Crítico. $ISSUES issues que requieren atención inmediata.${NC}"
fi

echo -e "\n  ${CYAN}Siguiente paso:${NC} ./scripts/start-session.sh\n"
