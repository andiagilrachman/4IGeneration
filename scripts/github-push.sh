#!/usr/bin/env bash
# ============================================================
# 4IGeneration — Push ke GitHub dengan aman
#
# Prasyarat (sekali saja, lakukan di GitHub):
#   1. Buat repo di https://github.com/new  → nama: 4IGeneration
#      (repo sudah ada? lewati)
#   2. Buat Personal Access Token (PAT):
#      https://github.com/settings/tokens
#      → Generate new token (classic) → centang scope: [x] repo
#      → Salin token (ghp_...)
#
# Cara pakai (di folder 4igeneration):
#   GITHUB_TOKEN=ghp_xxxxxxxx ./scripts/github-push.sh
#
# Token hanya dipakai saat push lalu dihapus dari git config,
# jadi TIDAK tersimpan permanen.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

REPO_URL="${REPO_URL:-https://github.com/andiagilrachman/4IGeneration.git}"
TOKEN="${GITHUB_TOKEN:-}"

# --- pastikan remote origin ---
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO_URL"
else
  git remote set-url origin "$REPO_URL"
fi
echo "✅ Remote origin: $REPO_URL"

if [[ -z "$TOKEN" ]]; then
  cat <<'EOF'
❌ GITHUB_TOKEN belum diisi.

Cara 1 (script ini):
   GITHUB_TOKEN=ghp_xxxxxxxx ./scripts/github-push.sh

Cara 2 (manual, sekali):
   git push -u origin main
   → Username: <username GitHub Anda>
   → Password: <tempel token> (bukan password login)
EOF
  exit 1
fi

# --- ambil username (override opsional via GITHUB_USERNAME) ---
USERNAME="${GITHUB_USERNAME:-$(basename "$(dirname "$REPO_URL")")}"

echo "🔄 Push ke GitHub sebagai: $USERNAME ..."
# remote sementara berisi token untuk sekali push
git remote set-url origin "https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/4IGeneration.git"
git push -u origin main
git remote set-url origin "$REPO_URL"  # hapus token dari config

echo ""
echo "✅ Push berhasil!"
echo "   Remote dikembalikan ke: $REPO_URL (tanpa token)"
git log --oneline -3
