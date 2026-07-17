@echo off
echo ============================================
echo   IR-Feel - Git Push + Vercel Deploy
echo ============================================
echo.

cd /d "d:\System Downloads\high-performance-website"

echo [1/5] Staging updated files...
git add .

echo.
echo [2/5] Creating commit with fixes...
git commit -m "Fix sitemap build error and update gitignore"

echo.
echo [3/5] Setting branch to main...
git branch -M main

echo.
echo [4/5] Pushing to GitHub...
git push -u origin main --force

echo.
echo ============================================
echo   GitHub push complete!
echo ============================================
echo.
echo [5/5] Now deploying to Vercel...
echo.
echo NOTE: If this is your first time, Vercel will 
echo ask you to log in. Follow the prompts.
echo.

npx -y vercel --yes --prod

echo.
echo ============================================
echo   ALL DONE! Check your Vercel dashboard
echo   for the live URL.
echo ============================================
echo.
pause
