@echo off
title TrainerBoost -- Kirito OS
chcp 65001 > nul

:: ── BRIEFING ──────────────────────────────────────────────────
echo.
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  KIRITO OS  .  TrainerBoost
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Git status rapido
cd /d C:\Users\ilyaa\trainerboost
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set BRANCH=%%i
for /f "tokens=*" %%i in ('git log -1 --pretty^=format:%%s 2^>nul') do set COMMIT=%%i

echo  RAMA     %BRANCH%
echo  COMMIT   %COMMIT%
echo.
echo  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Dev server en ventana minimizada
start "TrainerBoost Dev" /min cmd /k "cd /d C:\Users\ilyaa\trainerboost && npm run dev"

:: Espera a Next.js
echo  Arrancando servidor...
timeout /t 5 /nobreak > nul

:: Chrome en modo app
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --app=http://localhost:3000 ^
  --window-size=1440,900 ^
  --window-position=40,40 ^
  --no-first-run ^
  --no-default-browser-check

:: Claude Code desde el directorio del proyecto (carga CLAUDE.md completo)
echo  Abriendo Claude Code desde trainerboost...
start "Kirito" cmd /k "cd /d C:\Users\ilyaa\trainerboost && claude"

echo  Entorno listo: http://localhost:3000
timeout /t 2 /nobreak > nul
exit
