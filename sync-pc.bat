@echo off
chcp 65001 >nul
REM ================================================================
REM  SYNC 4IGeneration KE PC (Windows) - target E:\4igeneration
REM  - Clone / pull repo dari GitHub
REM  - Setup Python venv + dependensi (apps/ai-training)
REM  - Opsi jalankan pipeline (unduh corpus / uji cepat)
REM  Cara pakai: double-click file ini, atau jalankan dari cmd.
REM ================================================================
setlocal
set "TARGET=E:\4igeneration"
if not exist "E:\" set "TARGET=C:\4Igeneration"
set "BRANCH=arena/01a02969-4igeneration"
set "REPO=https://github.com/andiagilrachman/4IGeneration.git"

echo ============================================================
echo  SYNC 4IGeneration - target: %TARGET%
echo ============================================================

REM --- 0) Cek Git ---
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git belum terinstall. Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM --- 0b) Pastikan branch kerja benar (LLM ada di arena/01a02969-4igeneration) ---
for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURBRANCH=%%i"
if not "%CURBRANCH%"=="%BRANCH%" (
    echo [0/5] Repo di branch "%CURBRANCH%" - pindah ke %BRANCH% ...
    git fetch origin --prune
    git checkout %BRANCH% 2>nul
    if errorlevel 1 git checkout -b %BRANCH% origin/%BRANCH%
)

REM --- 1) Clone atau Pull ---
if exist "%TARGET%\.git" (
    echo [1/5] Repo sudah ada - menarik update terbaru...
    cd /d "%TARGET%"
    git fetch origin --prune
    git checkout %BRANCH% 2>nul
    if errorlevel 1 git checkout -b %BRANCH% origin/%BRANCH%
    git pull origin %BRANCH%
) else (
    echo [1/5] Clone repo ke %TARGET% ...
    git clone %REPO% "%TARGET%"
    if errorlevel 1 (
        echo [ERROR] Clone gagal. Cek koneksi internet / nama repo.
        pause
        exit /b 1
    )
    cd /d "%TARGET%"
    git checkout -b %BRANCH% origin/%BRANCH%
)

REM --- 2) Cek Python ---
where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python belum terinstall. Download: https://www.python.org/downloads/
    echo         Centang "Add Python to PATH" saat install.
    pause
    exit /b 1
)
python --version

REM --- 3) venv + dependensi ---
cd /d "%TARGET%\apps\ai-training"
if not exist ".venv" (
    echo [2/5] Membuat environment Python (.venv)...
    python -m venv .venv
)
call .venv\Scripts\activate.bat
echo [3/5] Install dependensi (numpy, datasets, tokenizers, torch)...
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Install dependensi gagal.
    pause
    exit /b 1
)

REM --- 4) Cek data yang sudah ada ---
echo [4/5] Cek data yang sudah ada...
if exist "data\tokens\train.bin" (
    echo        OK - data tokens sudah ada (train.bin)
) else (
    echo        Belum ada data - akan diunduh/dibangun di langkah berikut.
)

REM --- 5) Opsi pipeline ---
echo.
echo [5/5] Pipeline siap. Pilih:
echo    A = Jalankan LENGKAP (unduh corpus ~1.3 miliar token, butuh waktu lama)
echo    B = Jalankan UJI CEPAT (--quick, kurang dari 5 menit)
echo    C = Selesai - saya jalankan manual nanti
choice /c ABC /n /m "Pilih [A/B/C]: "
if errorlevel 3 goto :selesai
if errorlevel 2 (
    python pipeline.py --quick
    goto :selesai
)
python pipeline.py

:selesai
echo.
echo ============================================================
echo  Selesai! Proyek ada di %TARGET%
echo  Untuk update berikutnya: double-click sync-pc.bat lagi
echo  Panduan lengkap: docs\SYNC-PC.md
echo ============================================================
pause
