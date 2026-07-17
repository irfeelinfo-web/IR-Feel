@echo off
echo ============================================
echo   IR-Feel - Vercel Deployment Script
echo ============================================
echo.

cd /d "d:\System Downloads\high-performance-website"

echo [1/6] Initializing Git...
git init
if errorlevel 1 (echo ERROR: git init failed & pause & exit /b 1)

echo.
echo [2/6] Adding remote repository...
git remote add origin https://github.com/irfeelinfo-web/IR-Feel.git 2>nul
if errorlevel 1 (
    echo Remote already exists, updating...
    git remote set-url origin https://github.com/irfeelinfo-web/IR-Feel.git
)

echo.
echo [3/6] Staging all files...
git add .

echo.
echo [4/6] Creating first commit...
git commit -m "Initial commit - IR-Feel e-commerce website"

echo.
echo [5/6] Setting branch to main...
git branch -M main

echo.
echo [6/6] Pushing to GitHub...
git push -u origin main

echo.
echo ============================================
echo   GitHub push complete!
echo ============================================
echo.
echo Now deploying to Vercel...
echo.

npx -y vercel --yes

echo.
echo ============================================
echo   DEPLOYMENT COMPLETE!
echo ============================================
echo.
pause
