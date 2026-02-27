@echo off
title PrintSpec — Printing Method Recommendation System
color 0A

echo.
echo  ============================================================
echo   PrintSpec — Printing Method Recommendation System
echo  ============================================================
echo.
echo  Starting Backend  (FastAPI on http://localhost:8000) ...
echo  Starting Frontend (React  on http://localhost:5173) ...
echo.

:: Start Backend in a new window
start "PrintSpec Backend" cmd /k "cd /d "d:\Specification System\backend" && python -m uvicorn main:app --port 8000 --reload"

:: Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend in a new window
start "PrintSpec Frontend" cmd /k "cd /d "d:\Specification System\frontend" && npm run dev"

:: Wait 4 seconds then open browser
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo  ============================================================
echo   Both servers are running!
echo   Browser opened at: http://localhost:5173
echo   API Docs:          http://localhost:8000/docs
echo   Admin Login:       admin / admin123
echo  ============================================================
echo.
echo  Close this window anytime. Servers run in their own windows.
echo  To stop: close the "PrintSpec Backend" and "PrintSpec Frontend" windows.
echo.
pause
