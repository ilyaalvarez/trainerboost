#!/usr/bin/env bash
# start-session.sh — Inicio inteligente de sesión con Claude Code
# Uso: ./scripts/start-session.sh [--auto]

set -euo pipefail

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; BOLD='\033[1m'; NC='\033[0m'

AUTO_MODE="${1:-}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
SESSION_LOG=".session-log.md"

echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  🚀 TrainerBoost — Inicio de sesión Claude Code${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# ── 0. Verificar dependencias ────────────────────────────────────────────
for cmd in git node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "${RED}Error: '$cmd' no está instalado o no está en PATH.${NC}"
    exit 1
  fi
done

# ── 1. Git checkpoint automático ─────────────────────────────────────────
echo -e "${BOLD}[1/5] Git checkpoint...${NC}"
if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo -e "  ${YELLOW}⚠ Cambios sin commitear detectados — guardando en stash automático${NC}"
  echo -e "  ${YELLOW}  Para recuperarlos después: git stash pop${NC}"
  git add -A
  git stash push -m "auto-checkpoint-$(date '+%Y%m%d-%H%M')" --quiet
  echo -e "  ${GREEN}✓${NC} Cambios guardados en stash"
else
  echo -e "  ${GREEN}✓${NC} Árbol de trabajo limpio"
fi

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "desconocida")
echo -e "  ${CYAN}Rama actual:${NC} $CURRENT_BRANCH"

# ── 2. Auto-detección del stack ──────────────────────────────────────────
echo -e "\n${BOLD}[2/5] Detectando stack...${NC}"

STACK_INFO=""
if [[ -f "package.json" ]]; then
  # fs.readFileSync + JSON.parse: compatible con proyectos ESM y CJS
  NEXT_VERSION=$(node -e "
    try {
      const fs = require('fs');
      const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      console.log(p.dependencies?.next || p.devDependencies?.next || 'no detectado');
    } catch(e) { console.log('no detectado'); }
  " 2>/dev/null || echo "no detectado")
  STACK_INFO+="Next.js $NEXT_VERSION"
fi
if [[ -f "prisma/schema.prisma" ]]; then
  STACK_INFO+=", Prisma"
  DB_PROVIDER=$(grep -m1 'provider' prisma/schema.prisma | awk -F'"' '{print $2}' 2>/dev/null || echo "?")
  STACK_INFO+=" ($DB_PROVIDER)"
fi
if [[ -f "package.json" ]] && grep -q '"@supabase/supabase-js"' package.json 2>/dev/null; then
  STACK_INFO+=", Supabase"
fi
if [[ -f "package.json" ]] && grep -q '"stripe"' package.json 2>/dev/null; then
  STACK_INFO+=", Stripe"
fi
if [[ -f "package.json" ]] && grep -q '"next-auth"' package.json 2>/dev/null; then
  STACK_INFO+=", NextAuth"
fi

echo -e "  ${GREEN}✓${NC} Stack: ${STACK_INFO:-"no detectado (ejecutar en raíz del proyecto)"}"

# ── 3. Health check rápido ───────────────────────────────────────────────
echo -e "\n${BOLD}[3/5] Health check...${NC}"

ISSUES=0

if git ls-files --error-unmatch .env &>/dev/null; then
  echo -e "  ${RED}⚠ CRÍTICO: .env está trackeado en git. Elimínalo con: git rm --cached .env${NC}"
  ISSUES=$((ISSUES + 1))
fi

# Solo verificar el último commit si existe uno previo (evita error en repos nuevos)
if git rev-parse HEAD~1 &>/dev/null; then
  if git diff HEAD~1 HEAD 2>/dev/null | grep -qE '(sk_live|sk_test|STRIPE_SECRET|JWT_SECRET)\s*=\s*["'"'"'][^$]'; then
    echo -e "  ${RED}⚠ ADVERTENCIA: Posible secret hardcodeado en el último commit.${NC}"
    ISSUES=$((ISSUES + 1))
  fi
fi

if command -v npm &>/dev/null && [[ -f "package.json" ]]; then
  # ; true captura el JSON aunque npm audit salga 1 (hay vulns), sin contaminar con fallback
  AUDIT_JSON=$(npm audit --json 2>/dev/null; true)
  CRITICAL_VULNS=$(echo "$AUDIT_JSON" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{
      try { const a=JSON.parse(d); console.log(a.metadata?.vulnerabilities?.critical||0); }
      catch { console.log(0); }
    });
  " 2>/dev/null) || CRITICAL_VULNS=0
  if [[ "$CRITICAL_VULNS" -gt 0 ]]; then
    echo -e "  ${RED}⚠ $CRITICAL_VULNS vulnerabilidades críticas en npm${NC}"
    ISSUES=$((ISSUES + 1))
  fi
fi

if [[ "$ISSUES" -eq 0 ]]; then
  echo -e "  ${GREEN}✓${NC} Sin issues críticos detectados"
else
  echo -e "  ${YELLOW}→ $ISSUES issue(s) a resolver antes de trabajar${NC}"
fi

# ── 4. Estado del roadmap ────────────────────────────────────────────────
echo -e "\n${BOLD}[4/5] Roadmap — tareas pendientes:${NC}"

if [[ -f "TRAINERBOOST_CONTEXT.md" ]]; then
  echo -e ""
  echo -e "  ${RED}⬛ FASE 0 (urgente):${NC}"
  # Extraer solo las tareas entre "Fase 0" y "Fase 1" (rango awk por sección)
  awk '/[Ff]ase 0/,/[Ff]ase 1/' TRAINERBOOST_CONTEXT.md | grep "⬜ Pendiente" | head -3 | \
    while IFS= read -r line; do
      TASK=$(echo "$line" | awk -F'|' '{print $2}' | xargs)
      [[ -n "$TASK" ]] && echo -e "    ${RED}→${NC} $TASK"
    done

  echo -e "  ${YELLOW}⬛ FASE 1 (MVP):${NC}"
  awk '/[Ff]ase 1/,/[Ff]ase 2/' TRAINERBOOST_CONTEXT.md | grep "⬜ Pendiente" | head -3 | \
    while IFS= read -r line; do
      TASK=$(echo "$line" | awk -F'|' '{print $2}' | xargs)
      [[ -n "$TASK" ]] && echo -e "    ${YELLOW}→${NC} $TASK"
    done
else
  echo -e "  ${YELLOW}⚠ TRAINERBOOST_CONTEXT.md no encontrado en este directorio${NC}"
fi

# ── 5. Selección de tarea ────────────────────────────────────────────────
echo -e "\n${BOLD}[5/5] ¿Cuál es la tarea de esta sesión?${NC}\n"

if [[ "$AUTO_MODE" == "--auto" ]]; then
  echo -e "  ${CYAN}[AUTO]${NC} Leyendo primera tarea pendiente del roadmap..."
  TAREA=""
  if [[ -f "TRAINERBOOST_CONTEXT.md" ]]; then
    TAREA=$(grep "⬜ Pendiente" TRAINERBOOST_CONTEXT.md 2>/dev/null | head -1 | awk -F'|' '{print $2}' | xargs || echo "")
  fi
  if [[ -z "$TAREA" ]]; then
    TAREA="Revisar el estado del proyecto y proponer la próxima tarea según el roadmap."
  fi
  echo -e "  ${BOLD}→ $TAREA${NC}"
else
  echo -e "  ${CYAN}[0]${NC} ${RED}Fase 0:${NC} Rellenar demo con datos ficticios"
  echo -e "  ${CYAN}[1]${NC} ${RED}Fase 0:${NC} Completar demo del cliente (nutrición y citas)"
  echo -e "  ${CYAN}[2]${NC} ${YELLOW}Fase 1:${NC} Builder de rutinas con plantillas"
  echo -e "  ${CYAN}[3]${NC} ${YELLOW}Fase 1:${NC} Biblioteca de ejercicios mínima"
  echo -e "  ${CYAN}[4]${NC} ${YELLOW}Fase 1:${NC} Check-in semanal automatizado"
  echo -e "  ${CYAN}[5]${NC} ${MAGENTA}Seguridad:${NC} Auditoría completa de endpoints"
  echo -e "  ${CYAN}[6]${NC} Escribir tarea personalizada"
  echo ""
  read -rp "  Opción [0-6]: " OPCION

  case "$OPCION" in
    0) TAREA="Demo del trainer: rellenar con datos ficticios completos. 18 clientes activos, 2.840€ ingresos (+12%), 6 citas hoy, gráfica de ingresos realista 6 meses, 3 clientes con progreso visible (nombres españoles), feed de actividad reciente con 5 eventos. Solo tocar /app/demo o /components/demo." ;;
    1) TAREA="Demo del cliente: rellenar secciones de nutrición y citas con datos ficticios creíbles. El cliente debe ver un plan de nutrición de ejemplo y 2-3 citas próximas. Solo tocar las secciones correspondientes del portal del cliente en demo." ;;
    2) TAREA="Builder de rutinas: implementar plantillas reutilizables de 4, 8 y 12 semanas. Soporte para supersets, AMRAP y duplicar semanas. El trainer debe poder crear una rutina completa en menos de 5 minutos." ;;
    3) TAREA="Biblioteca de ejercicios: crear estructura de datos y UI para mínimo 200 ejercicios con imagen y categorías (músculo principal, equipamiento, dificultad). Los trainers deben poder buscar y filtrar rápido." ;;
    4) TAREA="Check-in semanal automatizado: formulario que se envía automáticamente cada lunes al cliente (energía, dolor, cumplimiento, peso). Los resultados llegan al dashboard del trainer ordenados y pendientes de revisar." ;;
    5) TAREA="Auditoría de seguridad: revisar todos los endpoints de API para verificar que incluyen verificación de sesión y filtrado por trainerId. Generar informe con hallazgos y aplicar correcciones." ;;
    6) read -rp "  Describe la tarea: " TAREA ;;
    *) TAREA="Revisar el estado del proyecto y proponer la próxima tarea según el roadmap." ;;
  esac
fi

# ── Crear rama de trabajo ────────────────────────────────────────────────
# Transliterar acentos y limpiar caracteres para nombres de rama válidos
RAMA_BASE=$(iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null <<< "$TAREA" || echo "$TAREA")
RAMA_BASE=$(echo "$RAMA_BASE" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:] ' | \
  awk '{print $1"-"$2"-"$3}' | tr ' ' '-' | sed 's/--*/-/g; s/^-//; s/-$//')
[[ -z "$RAMA_BASE" ]] && RAMA_BASE="tarea"
RAMA="feature/${RAMA_BASE}-$(date '+%m%d')"

if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  git checkout -b "$RAMA" 2>/dev/null || git checkout "$RAMA" 2>/dev/null
  echo -e "\n  ${GREEN}✓${NC} Rama creada: ${BOLD}$RAMA${NC}"
else
  # Ya en feature branch — continuar sin crear sub-rama
  RAMA="$CURRENT_BRANCH"
  echo -e "\n  ${YELLOW}→${NC} Continuando en rama existente: ${BOLD}$RAMA${NC}"
fi

# ── Contexto de sesión anterior (continuidad automática) ─────────────────
LAST_SESSION=""
if [[ -f "$SESSION_LOG" ]]; then
  LAST_SESSION=$(grep -E "^\*\*(Completado|Pendiente):" "$SESSION_LOG" 2>/dev/null | tail -4 || echo "")
fi

# ── Generar prompt para Claude Code ─────────────────────────────────────
echo -e "\n${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  📋 PROMPT PARA CLAUDE CODE — Copiar y pegar${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

PROMPT="Lee los archivos CLAUDE.md, TRAINERBOOST_CONTEXT.md e ILYA.md en la raíz del proyecto, en ese orden. No escribas código todavía.

Cuando los hayas leído, confirma en máximo 4 líneas:
1. Qué entiendes del estado actual del proyecto
2. Stack que detectas (verifica leyendo package.json y config real)
3. La tarea de esta sesión
4. Qué archivos vas a tocar y cuáles NO tocarás

─────────────────────────────────────────────
TAREA DE ESTA SESIÓN:
$TAREA
─────────────────────────────────────────────"

if [[ -n "$LAST_SESSION" ]]; then
  PROMPT+="

CONTEXTO SESIÓN ANTERIOR:
$LAST_SESSION
─────────────────────────────────────────────"
fi

PROMPT+="

Stack detectado: ${STACK_INFO:-"(ejecutar en raíz del proyecto)"}
Rama de trabajo: $RAMA
Fecha: $TIMESTAMP

Reglas para esta sesión:
- Propón antes de ejecutar cualquier cambio de más de 20 líneas
- No toques main directamente
- Commits en español con formato: tipo(scope): descripción
- Al terminar: lista exacta de archivos modificados y qué quedó pendiente"

echo "$PROMPT"

# ── Guardar log de sesión ────────────────────────────────────────────────
{
  echo ""
  echo "## Sesión — $TIMESTAMP"
  echo "**Rama:** $RAMA"
  echo "**Stack:** ${STACK_INFO:-desconocido}"
  echo "**Tarea:** $TAREA"
  echo "**Issues detectados:** $ISSUES"
  echo "**Estado al inicio:** pendiente de cierre"
} >> "$SESSION_LOG"

echo -e "\n${GREEN}✓ Log guardado en $SESSION_LOG${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
