#!/usr/bin/env bash
# ============================================================
# 4IGeneration — Pasang post-commit hook (auto-update RESUME)
#
# Setelah ini, SETIAP git commit otomatis menambahkan entri ke
# RESUME.md (apa yang dikerjakan pada commit tsb) — sesuai
# keinginan: "setiap pekerjaan langsung update resume".
#
# Cara hapus: ./scripts/install-hooks.sh --remove
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."
HOOK=".git/hooks/post-commit"

if [[ "${1:-}" == "--remove" ]]; then
  rm -f "$HOOK"
  echo "✅ post-commit hook dihapus. Resume kini hanya update manual via ./scripts/resume.sh"
  exit 0
fi

[[ -d ".git" ]] || { echo "ERROR: bukan git repo. Jalankan 'git init' dulu."; exit 1; }

cat > "$HOOK" <<'HOOK'
#!/usr/bin/env bash
# AUTO-GENERATED oleh scripts/install-hooks.sh — jangan edit manual.
# Guard anti-loop: jangan jalan saat proses amend resume itu sendiri.
if [[ "${RESUME_HOOK_RUNNING:-0}" == "1" ]]; then
  exit 0
fi

cd "$(dirname "$0")/../.." || exit 0

RESUME="RESUME.md"
[[ -f "$RESUME" ]] || exit 0

# Ambil pesan commit terbaru
MSG=$(git log -1 --pretty=%s 2>/dev/null || echo "update")
# Jangan duplikasi entri untuk commit resume itu sendiri
if [[ "$MSG" == docs\(resume\)* ]]; then
  exit 0
fi

DESC_CLEAN="${MSG//|/¦}"
ROW="| $(date +%F) | $DESC_CLEAN | ✅ Selesai | auto (post-commit hook) |"
MARKER="<!-- LOG-START -->"
TODAY=$(date +%F)

awk -v marker="$MARKER" -v row="$ROW" -v today="$TODAY" '
  {
    if ($0 ~ /^> 🕒 Terakhir diperbarui:/) { print "> 🕒 Terakhir diperbarui: " today }
    else { print }
    if ($0 ~ marker) { print row }
  }
' "$RESUME" > "$RESUME.tmp" && mv "$RESUME.tmp" "$RESUME"

export RESUME_HOOK_RUNNING=1
git add "$RESUME"
git commit -q --amend --no-edit
HOOK

chmod +x "$HOOK"
echo "✅ post-commit hook terpasang:"
echo "   setiap 'git commit' → entri baru otomatis ditambahkan ke RESUME.md"
