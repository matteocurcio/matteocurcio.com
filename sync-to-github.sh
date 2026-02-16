#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

msg="${1:-}" 

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repo: $(pwd)" >&2
  exit 1
fi

# Optional: build before pushing (set SYNC_BUILD=0 to skip)
if [ "${SYNC_BUILD:-1}" != "0" ]; then
  if command -v npm >/dev/null 2>&1; then
    npm run build >/dev/null
  else
    echo "npm not found; skipping build" >&2
  fi
fi

# Stage everything
if [ -n "$(git status --porcelain)" ]; then
  git add -A
else
  echo "No changes to commit."
  exit 0
fi

if [ -z "$msg" ]; then
  msg="sync $(date '+%Y-%m-%d %H:%M:%S')"
fi

git commit -m "$msg" >/dev/null || true

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' is not set. Add it first:" >&2
  echo "  git remote add origin <repo-url>" >&2
  exit 2
fi

branch="$(git branch --show-current)"
if [ -z "$branch" ]; then
  branch="main"
  git checkout -b "$branch" >/dev/null
fi

# Push (assumes you have SSH keys or credential helper/PAT configured)
git push -u origin "$branch"

echo "Pushed to origin/$branch"
