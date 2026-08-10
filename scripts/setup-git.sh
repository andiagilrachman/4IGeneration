#!/usr/bin/env bash
# ============================================================
# 4IGeneration — Setup identitas git lokal + remote
#
# Catatan: file .git/config TIDAK ikut tersimpan antar sesi
# workspace, jadi jalankan ulang ini sekali per sesi baru.
#
#   ./scripts/setup-git.sh                        # identitas default
#   GIT_USER_NAME="Nama Kamu" GIT_USER_EMAIL="a@b.c" ./scripts/setup-git.sh
#   ./scripts/setup-git.sh --remote https://github.com/USER/4igeneration.git
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

git config user.name "${GIT_USER_NAME:-4IGeneration Dev}"
git config user.email "${GIT_USER_EMAIL:-dev@4igeneration.com}"
echo "✅ Git identity: $(git config user.name) <$(git config user.email)>"

if [[ "${1:-}" == "--remote" ]]; then
  REMOTE="${2:-}"
  if [[ -z "$REMOTE" ]]; then
    echo "Usage: $0 --remote <git-url>"
    exit 1
  fi
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REMOTE"
  echo "✅ Remote origin: $REMOTE"
  echo "   Push pertama: git push -u origin main"
fi

echo "👉 (opsional) Pasang auto-update resume: ./scripts/install-hooks.sh"
