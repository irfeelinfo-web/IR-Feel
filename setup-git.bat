@echo off
cd /d "d:\System Downloads\high-performance-website"
git init
git remote add origin https://github.com/irfeelinfo-web/IR-Feel.git
git add .
git commit -m "first commit"
git branch -M main
git push -u origin main
echo Done!
pause
