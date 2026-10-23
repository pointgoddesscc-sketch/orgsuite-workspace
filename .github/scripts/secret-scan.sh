#!/usr/bin/env bash
set -eu

# Scan tracked text files, preserving the existing assignment pattern and
# Markdown exclusion. Never emit matching values into CI logs.
echo "Scanning tracked files for common secret patterns..."
if matches="$(git grep -l -I -E -i "(api[_-]?key|secret|token|password|private[_-]?key)\s*[=:]\s*['\"]?[A-Za-z0-9_\-]{20,}" -- . ':!*.md')"; then
  printf 'Possible secret assignments found in these files:\n%s\n' "$matches"
  exit 1
else
  scan_status=$?
  if [ "$scan_status" -eq 1 ]; then
    echo "No obvious secret patterns detected."
  else
    printf 'Secret scan failed (git grep exit %s).\n' "$scan_status" >&2
    exit "$scan_status"
  fi
fi
