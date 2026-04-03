#!/usr/bin/env bash
# Espelha o repositório atual para gfmcosta08/<nome-do-repo>.
# Uso: export GFMCOSTA_TOKEN=ghp_xxx && ./scripts/mirror-to-gfmcosta.sh

set -euo pipefail
if [[ -z "${GFMCOSTA_TOKEN:-}" ]]; then
  echo "Defina GFMCOSTA_TOKEN (PAT da conta gfmcosta08 com escopo repo)." >&2
  exit 1
fi

REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
MIRROR_URL="https://x-access-token:${GFMCOSTA_TOKEN}@github.com/gfmcosta08/${REPO_NAME}.git"

git remote remove mirror 2>/dev/null || true
git remote add mirror "$MIRROR_URL"
git push mirror --mirror --force
echo "Espelhamento concluído: -> gfmcosta08/${REPO_NAME}"
