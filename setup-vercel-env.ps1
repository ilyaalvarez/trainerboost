# TrainerBoost — Configurar env vars en Vercel
# Ejecuta este script desde PowerShell en el directorio del proyecto
#
# INSTRUCCIONES:
# 1. Crea un token en: https://vercel.com/account/tokens
# 2. Rellena las 4 variables marcadas con <PEGA_AQUI>
# 3. Ejecuta: .\setup-vercel-env.ps1

# ── RELLENA ESTOS 4 VALORES ───────────────────────────────────────────────────
$VERCEL_TOKEN                   = "<PEGA_AQUI>"  # https://vercel.com/account/tokens
$SUPABASE_SERVICE_ROLE_KEY      = "<PEGA_AQUI>"  # Supabase > Settings > API > service_role
$STRIPE_SECRET_KEY              = "<PEGA_AQUI>"  # Stripe > Dashboard > sk_test_...
$NEXT_PUBLIC_STRIPE_PUBLISHABLE = "<PEGA_AQUI>"  # Stripe > Dashboard > pk_test_...
$RESEND_API_KEY                 = "<PEGA_AQUI>"  # Resend > API Keys > re_...
# ─────────────────────────────────────────────────────────────────────────────

# Valores ya obtenidos automáticamente
$PROJECT_ID = "prj_B1jQ3S0JVScOSrUF8nZhBJtXNHZb"
$TEAM_ID    = "team_S79KAO4KjfW40q3bkLlUuS1O"

$vars = @{
    # Supabase
    "NEXT_PUBLIC_SUPABASE_URL"      = "https://bxqvpnzwoeozyvgrtixh.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cXZwbnp3b2Vvenl2Z3J0aXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjM0OTQsImV4cCI6MjA5NTUzOTQ5NH0.W4URviHbztUEL2VecO0ExC-jMi_4_x4eHXvQtGSjZRk"
    "SUPABASE_SERVICE_ROLE_KEY"     = $SUPABASE_SERVICE_ROLE_KEY
    "SUPABASE_PROJECT_ID"           = "bxqvpnzwoeozyvgrtixh"

    # App
    "NEXT_PUBLIC_APP_URL"           = "https://trainerboost.vercel.app"

    # Stripe
    "STRIPE_SECRET_KEY"                      = $STRIPE_SECRET_KEY
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"     = $NEXT_PUBLIC_STRIPE_PUBLISHABLE
    "STRIPE_PRICE_ID_STARTER"               = "price_1TeKfsHdYsbusZcdeduwl1bH"
    "STRIPE_PRICE_ID_PRO"                   = "price_1TeKftHdYsbusZcdQxpqUBzK"
    "STRIPE_PRICE_ID_UNLIMITED"             = "price_1TeKftHdYsbusZcdkb8oNkRk"

    # Email
    "RESEND_API_KEY"                = $RESEND_API_KEY

    # Push notifications (VAPID — generadas automáticamente)
    "VAPID_PUBLIC_KEY"              = "BNuBsmsE57KN3_4Ta0T-dBiNI03Bn3yWkUhR2LHAGR-ugg_g4CxLf6b4Q5MhpACK61bPG9czOfa5V1JgM1dMFo4"
    "VAPID_PRIVATE_KEY"             = "QP_szxPwj8sUiUtmFka662mUEdsNWTTOba9mr6ZW7uc"
}

$headers = @{
    "Authorization" = "Bearer $VERCEL_TOKEN"
    "Content-Type"  = "application/json"
}

$url = "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID"

$ok = 0; $fail = 0
foreach ($key in $vars.Keys) {
    $val = $vars[$key]
    if ($val -like "<PEGA_AQUI>") {
        Write-Host "  SKIP  $key  (rellena el valor arriba)" -ForegroundColor Yellow
        continue
    }
    $type = if ($key.StartsWith("NEXT_PUBLIC_")) { "plain" } else { "encrypted" }
    $body = @{ key = $key; value = $val; type = $type; target = @("production", "preview") } | ConvertTo-Json
    try {
        $r = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "  OK    $key" -ForegroundColor Green
        $ok++
    } catch {
        $msg = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($msg.error.code -eq "ENV_ALREADY_EXISTS") {
            Write-Host "  EXIST $key  (ya existe, skipping)" -ForegroundColor Cyan
            $ok++
        } else {
            Write-Host "  FAIL  $key  $($_.Exception.Message)" -ForegroundColor Red
            $fail++
        }
    }
}

Write-Host ""
Write-Host "Listo: $ok OK, $fail errores" -ForegroundColor White
if ($ok -gt 0) {
    Write-Host "Redesplegando en Vercel..." -ForegroundColor White
    Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments?teamId=$TEAM_ID" -Method Post `
        -Headers $headers -Body (@{ name = "trainerboost"; gitSource = @{ type = "github"; org = "ilyaalvarez"; repo = "trainerboost"; ref = "main" } } | ConvertTo-Json -Depth 5)
    Write-Host "Redeploy lanzado. En ~2 min estara live con todas las vars." -ForegroundColor Green
}
