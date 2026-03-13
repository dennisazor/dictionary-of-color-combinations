@echo off
echo Installing dependencies...
call npm install
echo.
echo Starting dev server...
call npm run dev
pause
