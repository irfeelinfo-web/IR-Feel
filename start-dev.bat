@echo off
title IR Feel - Dev Server
echo.
echo ========================================
echo   IR Feel Dev Server Starting...
echo ========================================
echo.
cd /d "d:\System Downloads\high-performance-website"
echo Project: %CD%
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting Next.js dev server on http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.
npm run dev

pause
