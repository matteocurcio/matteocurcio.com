#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repo: $(pwd)" >&2
  exit 1
fi

timestamp="$(date '+%Y%m%d-%H%M%S')"
branch="codex/checkpoint-${timestamp}"
message="${1:-checkpoint ${timestamp}}"

git fetch origin --prune >/dev/null 2>&1 || true
git checkout -b "$branch"
git add -A

if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to checkpoint."
  exit 0
fi

git commit -m "$message"
git push -u origin "$branch"

echo "Checkpoint created and pushed:"
echo "  branch: $branch"
