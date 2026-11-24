@echo off
title EduMaster.ai Enterprise - Launcher
echo =====================================================================
echo           INICIANDO ECOSISTEMA EDUMASTER.AI ENTERPRISE
echo =====================================================================
echo.
echo [1/2] Levantando Backend (FastAPI + SQLite local, sin PyTorch) en puerto 8000...
start "EduMaster API - FastAPI" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Levantando Frontend (React 19 + Vite en puerto 5173)...
start "EduMaster Frontend - React 19" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo Servicios iniciados en ventanas independientes:
echo  - Frontend PC:         http://localhost:5173
echo  - Frontend celular:    http://192.168.18.36:5173  (misma Wi-Fi; usa ipconfig si cambio la IP)
echo  - API Swagger Docs:    http://localhost:8000/docs
echo  - API Healthcheck:     http://localhost:8000/health
echo  - QR certificados:     apunta a VITE_PUBLIC_ORIGIN (IP Wi-Fi de la PC)
echo  - Modo datos:          DEMO con nucleo REAL por HTTP (VITE_CORE_API_BASE_URL)
echo =====================================================================
pause
