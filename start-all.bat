@echo off
REM ============================================================
REM  4IGeneration — Nyalakan Semua Aplikasi Sekaligus (Windows)
REM  Jalankan SETUP.BAT dulu (sekali saja) sebelum ini.
REM ============================================================
cd /d "%~dp0"

echo  Menyalakan 4 aplikasi 4IGeneration...
echo  - AI Service  : http://localhost:8000
echo  - API Server  : http://localhost:3001
echo  - Web App     : http://localhost:3000
echo  - Admin Panel : http://localhost:3002
echo.

start "4IG AI Service (8000)" cmd /k "cd /d %~dp0apps\ai-service && if exist .venv\Scripts\python.exe (.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000) else (python -m uvicorn app.main:app --host 0.0.0.0 --port 8000)"
start "4IG API (3001)" cmd /k "cd /d %~dp0apps\api && set DATABASE_URL=mysql://root:@localhost:3306/4igeneration && set JWT_SECRET=test-secret-4ig && set JWT_REFRESH_SECRET=test-refresh-4ig && set AI_SERVICE_URL=http://localhost:8000 && set CORS_ORIGINS=http://localhost:3000,http://localhost:3002 && set PORT=3001 && npm run dev"
start "4IG Web (3000)" cmd /k "cd /d %~dp0apps\web && npm run dev"
start "4IG Admin (3002)" cmd /k "cd /d %~dp0apps\admin && npm run dev"

echo.
echo  4 jendela terminal terbuka. Tunggu masing-masing selesai start,
echo  lalu buka http://localhost:3000 di browser.
echo.
pause
