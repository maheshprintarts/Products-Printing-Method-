@echo off
title Stop PrintSpec Servers
color 0C

echo.
echo  Stopping PrintSpec servers...
echo.

:: Kill uvicorn (backend)
taskkill /f /fi "WINDOWTITLE eq PrintSpec Backend" >nul 2>&1

:: Kill npm / node (frontend)
taskkill /f /fi "WINDOWTITLE eq PrintSpec Frontend" >nul 2>&1

echo  All servers stopped.
echo.
timeout /t 2 /nobreak >nul
