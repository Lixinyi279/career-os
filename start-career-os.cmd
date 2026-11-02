@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or newer is required.
  echo Opening the Node.js download page...
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)
if "%PORT%"=="" set PORT=4173
echo Starting Career OS at http://127.0.0.1:%PORT%
start "" "http://127.0.0.1:%PORT%"
node server.js
if errorlevel 1 pause
