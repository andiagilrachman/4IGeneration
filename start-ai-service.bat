@echo off
chcp 65001 >nul
REM ================================================================
REM  AKTIFKAN AI SERVICE 4IG (port 8000) - Windows
REM  Fitur AI web (screener, analisis, market recap, RAG) butuh ini.
REM  Membutuhkan Python 3.11/3.12 (bukan 3.14 - belum didukung).
REM ================================================================
setlocal
cd /d "%~dp0apps\ai-service"

echo ============================================================
echo  AKTIFKAN AI SERVICE 4IG (port 8000)
echo ============================================================

REM --- 1) Cari Python 3.11 / 3.12 ---
set "PY="
for %%V in (3.12 3.11) do (
    if not defined PY (
        py -%%V --version >nul 2>nul && set "PY=py -%%V"
    )
)
if not defined PY (
    where python >nul 2>nul && set "PY=python"
)
if not defined PY (
    echo.
    echo [ERROR] Python TIDAK ditemukan.
    echo Install Python 3.12 dari https://www.python.org/downloads/
    echo Lalu centang "Add Python to PATH", dan jalankan ulang file ini.
    echo.
    pause
    exit /b 1
)
echo Python yang dipakai: 
%PY% --version
echo.

REM --- 2) Buat venv (sekali saja) ---
if not exist ".venv" (
    echo [1/3] Membuat environment Python (.venv)...
    %PY% -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Gagal membuat venv.
        pause
        exit /b 1
    )
)
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Gagal mengaktifkan .venv
    pause
    exit /b 1
)

REM --- 3) Install dependensi ---
echo [2/3] Install dependensi (fastapi, uvicorn, yfinance, dll)...
python -m pip install --upgrade pip >nul 2>nul
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo [ERROR] Install dependensi gagal. Lihat pesan di atas.
    echo Coba jalankan ulang file ini.
    echo.
    pause
    exit /b 1
)

REM --- 4) Jalankan server ---
echo [3/3] Menjalankan AI Service di http://localhost:8000 ...
echo        (biarkan jendela ini terbuka - tutup = AI mati)
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
echo.
echo [INFO] Server berhenti. Tekan tombol untuk menutup.
pause
