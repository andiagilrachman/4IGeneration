#!/usr/bin/env bash
# ============================================================
# 4IGeneration — Auto-update RESUME.md
#
# Cara pakai:
#   ./scripts/resume.sh "Implementasi Auth register/login"            # status: Selesai
#   ./scripts/resume.sh "Integrasi Midtrans" --status "🚧 Dikerjakan"
#   ./scripts/resume.sh "Refactor cache layer" --in-progress
#   ./scripts/resume.sh "Deskripsi" --commit                           # langsung commit
#
# Atau via pnpm: pnpm resume "deskripsi"
# ============================================================
set -euo pipefail

# --- lokasi repo root (relatif dari folder script) ---
cd "$(dirname "$0")/.."
RESUME="RESUME.md"
MARKER="<!-- LOG-START -->"

DESC=""
STATUS="✅ Selesai"
AUTO_COMMIT=0

usage() {
  echo "Usage: $0 \"<deskripsi pekerjaan>\" [--status STATUS] [--in-progress] [--commit]"
  exit 1
}

# --- parse argumen ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --status)
      [[ $# -ge 2 ]] || usage
      STATUS="$2"
      shift
      ;;
    --in-progress)
      STATUS="🚧 Sedang dikerjakan"
      ;;
    --commit)
      AUTO_COMMIT=1
      ;;
    --help|-h)
      usage
      ;;
    *)
      DESC="${DESC:+$DESC }$1"
      ;;
  esac
  shift
done

[[ -n "$DESC" ]] || usage

[[ -f "$RESUME" ]] || { echo "ERROR: $RESUME tidak ditemukan di $(pwd)"; exit 1; }
grep -qF "$MARKER" "$RESUME" || { echo "ERROR: marker $MARKER tidak ada di $RESUME"; exit 1; }

TODAY=$(date +%F)
# strip karakter pipe dari deskripsi agar tidak merusak tabel markdown
DESC_CLEAN="${DESC//|/¦}"
ROW="| $TODAY | $DESC_CLEAN | $STATUS | |"

# --- insert baris log tepat setelah marker + update "Terakhir diperbarui" ---
awk -v marker="$MARKER" -v row="$ROW" -v today="$TODAY" '
  {
    if ($0 ~ /^> 🕒 Terakhir diperbarui:/) { print "> 🕒 Terakhir diperbarui: " today }
    else { print }
    if ($0 ~ marker) { print row }
  }
' "$RESUME" > "$RESUME.tmp" && mv "$RESUME.tmp" "$RESUME"

echo "✅ RESUME.md diupdate:"
echo "   $ROW"

git add "$RESUME"

if [[ $AUTO_COMMIT -eq 1 ]]; then
  git commit -q -m "docs(resume): $DESC_CLEAN"
  echo "   Committed: docs(resume): $DESC_CLEAN"
else
  echo ""
  echo "👉 Commit manual (atau jalankan ulang dengan --commit):"
  echo "   git commit -m \"docs(resume): $DESC_CLEAN\""
fi
