#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
target_root="${HOME}/Library/Mobile Documents/com~apple~CloudDocs/HomeLab/Website/matteocurcio.com"

mkdir -p "$target_root/research" "$target_root/tools/qnap-admin"

copy_if_exists() {
  local source_path="$1"
  local target_path="$2"

  if [ -f "$source_path" ]; then
    cp "$source_path" "$target_path"
  fi
}

copy_if_exists "$repo_root/README.md" "$target_root/README.md"
copy_if_exists "$repo_root/PROJECT_STATE.md" "$target_root/PROJECT_STATE.md"

find "$repo_root/research" -maxdepth 1 -type f -name '*.md' -print0 | while IFS= read -r -d '' file; do
  cp "$file" "$target_root/research/$(basename "$file")"
done

copy_if_exists "$repo_root/tools/qnap-admin/README.md" "$target_root/tools/qnap-admin/README.md"

echo "Synced markdown docs to:"
echo "  $target_root"
