@echo off
chcp 65001 >nul
REM ================================================================
REM  TES CEPAT PIPELINE LLM 4IG-Finance (Windows)
REM  Menjalankan pipeline uji (--quick) di apps\ai-training:
REM  tokenizer + packing + smoke train (< 5 menit, CPU saja).
REM ================================================================
setlocal
cd /d "%~dp0apps\ai-training"

echo ============================================================
echo  TES CEPAT PIPELINE LLM 4IG-Finance (--quick)
echo ============================================================

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python tidak ditemukan. Install Python 3.11/3.12 dulu.
    pause
    exit /b 1
)

if not exist ".venv" (
    echo [..] Membuat environment (.venv)...
    python -m venv .venv
)
call .venv\Scripts\activate.bat

echo [..] Install dependensi...
python -m pip install --upgrade pip >nul
pip install -r requirements.txt

echo [..] Menjalankan pipeline uji...
python pipeline.py --quick --no-install

echo.
echo ============================================================
echo  Selesai. Untuk data sungguhan (corpus 1.3 miliar token):
echo  python pipeline.py --steps corpus,build,tokenizer,pack
echo ============================================================
pause
