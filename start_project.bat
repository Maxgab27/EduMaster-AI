@echo off
title EduMaster.ai Enterprise - Launcher
echo =====================================================================
echo           INICIANDO ECOSISTEMA EDUMASTER.AI ENTERPRISE
echo =====================================================================
echo.
echo [1/2] Levantando Backend (FastAPI + SQLite local, sin PyTorch) en puerto 8000...
start "EduMaster API - FastAPI" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Levantando Frontend (React 19 + Vite en puerto 5173)...
start "EduMaster Frontend - React 19" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo Servicios iniciados en ventanas independientes:
echo  - Frontend Web:        http://localhost:5173
echo  - API Swagger Docs:    http://localhost:8000/docs
echo  - API Healthcheck:     http://localhost:8000/health
echo  - Modo datos:          DEMO (el frontend no llama a la API sin VITE_API_BASE_URL)
echo =====================================================================
pause
