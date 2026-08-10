@echo off
REM ============================================================
REM  4IGeneration — Setup Otomatis untuk Windows
REM  Jalankan SEKALI setelah clone project (butuh XAMPP MySQL jalan)
REM ============================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo  ============================================
echo   4IGeneration v2.0 - Setup Otomatis (Windows)
echo  ============================================
echo.

REM ---------- 1. Cek prasyarat ----------
where node >nul 2>nul || (echo [ERROR] Node.js belum terinstall! Download di nodejs.org & coba lagi. & pause & exit /b 1)
where python >nul 2>nul || (echo [ERROR] Python belum terinstall! Download di python.org & coba lagi. & pause & exit /b 1)
where git >nul 2>nul || (echo [ERROR] Git belum terinstall! Download di git-scm.com & coba lagi. & pause & exit /b 1)
echo [OK] Prasyarat: Node, Python, Git terdeteksi.

REM ---------- 2. pnpm ----------
where pnpm >nul 2>nul || (
  echo [..] Menginstall pnpm...
  call npm install -g pnpm@9
)
echo [OK] pnpm siap.

REM ---------- 3. Install dependencies ----------
echo [..] Menginstall dependencies (bisa beberapa menit)...
call pnpm install
if errorlevel 1 (echo [ERROR] pnpm install gagal. & pause & exit /b 1)
echo [OK] Dependencies terinstall.

REM ---------- 4. Env files ----------
if not exist "apps\web\.env.local" copy "apps\web\.env.example" "apps\web\.env.local" >nul
if not exist "apps\admin\.env.local" copy "apps\admin\.env.example" "apps\admin\.env.local" >nul
if not exist "apps\api\.env" copy "apps\api\.env.example" "apps\api\.env" >nul
echo [OK] File .env dibuat.

REM ---------- 4b. Pilih koneksi database ----------
echo.
echo  Pilih koneksi MySQL:
echo   [1] root tanpa password (XAMPP default)  ^<- REKOMENDASI
echo   [2] user khusus 4ig / 4ig_pass
set /p DBCHOICE="Pilihan (1/2): "
if "%DBCHOICE%"=="2" (
  set DBURL=mysql://4ig:4ig_pass@localhost:3306/4igeneration
) else (
  set DBURL=mysql://root:@localhost:3306/4igeneration
)
echo [OK] DATABASE_URL = %DBURL%
echo Setelah setup, pastikan nilai di apps\api\.env sama dengan di atas.

REM ---------- 5. Prisma generate + migrate + seed ----------
echo [..] Prisma generate...
cd apps\api
call npx prisma generate
echo.
echo  ============================================
echo   DATABASE - pastikan MySQL XAMPP sudah JALAN
echo   dan database '4igeneration' sudah dibuat
echo   (lihat PANDUAN-INSTALL-WINDOWS.md langkah 3)
echo  ============================================
echo.
set /p LANJUT="Database sudah siap? Tekan Enter untuk migrasi..."
set DATABASE_URL=%DBURL%
call npx prisma migrate deploy
call npx ts-node scripts\seed-admin.ts
call npx ts-node scripts\seed-plans.ts
cd ..\..

REM ---------- 8. Python AI deps ----------
echo [..] Install Python dependencies (AI Service)...
cd apps\ai-service
call pip install -r requirements.txt
cd ..\..

echo.
echo  ============================================
echo   ✅ SETUP SELESAI!
echo   Sekarang jalankan START-ALL.BAT untuk
echo   menyalakan 4 aplikasi sekaligus.
echo  ============================================
echo.
pause
