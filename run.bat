@echo off
title TaskFlow (React) - Local Server
cd /d "%~dp0"

echo ============================================
echo   TaskFlow React - Local Dev Server
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Download it from https://nodejs.org and try again.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies for the first time, this may take a minute...
    call npm install
    echo.
)

echo Starting Vite dev server...
echo Press Ctrl+C to stop the server.
echo.

call npm run dev

echo.
echo Server stopped.
pause


// aabbcc@test.com aabbcc


//  abc@test.com  aabbcc