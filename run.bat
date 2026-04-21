@echo off
echo ==============================================
echo Starting AI Summarizer Application...
echo ==============================================

echo [1/2] Starting Django Backend on port 8000...
start "Backend (Django)" cmd /k "cd back && python manage.py runserver"

echo [2/2] Starting Frontend (Vite) on port 5173...
start "Frontend (Vite)" cmd /k "cd front && npm install && npm run dev"

echo ==============================================
echo Applications are launching!
echo Backend API: http://127.0.0.1:8000
echo Frontend UI: http://localhost:5173
echo ==============================================
