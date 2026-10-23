#!/usr/bin/env bash
set -eu

scanner_path="$(cd "$(dirname "$0")" && pwd)/secret-scan.sh"
fixture_root="$(mktemp -d)"
trap 'rm -rf "$fixture_root"' EXIT
mkdir "$fixture_root/repository" "$fixture_root/not-a-repository"
cd "$fixture_root/repository"
git init -q

run_scan() {
  if scan_output="$(bash "$scanner_path" 2>&1)"; then
    scan_status=0
  else
    scan_status=$?
  fi
}

# An environment reference without a committed default must remain valid.
printf '%s\n' 'POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set a local password}' > compose.yml
git add compose.yml
run_scan
test "$scan_status" -eq 0

# Synthetic credential contents are constructed at runtime and never logged.
fixture_value="$(printf '%024d' 0)"
printf 'password=%s\n' "$fixture_value" > credential.conf
git add credential.conf
run_scan
test "$scan_status" -eq 1
case "$scan_output" in
  *credential.conf*) ;;
  *) echo 'Scanner did not report the affected filename.' >&2; exit 1 ;;
esac
case "$scan_output" in
  *"$fixture_value"*) echo 'Scanner disclosed a matching value.' >&2; exit 1 ;;
esac

# Docker Compose fallbacks containing literal credentials must still fail.
printf 'POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-%s}\n' "$fixture_value" > compose.yml
git rm -q -f credential.conf
run_scan
test "$scan_status" -eq 1

# Files outside the index cannot fail CI because of a local dependency/cache.
printf '%s\n' 'POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set a local password}' > compose.yml
printf 'password=%s\n' "$fixture_value" > untracked.conf
run_scan
test "$scan_status" -eq 0

# git failures must never be interpreted as a clean scan.
cd "$fixture_root/not-a-repository"
run_scan
test "$scan_status" -gt 1

echo 'Secret scanner regression checks passed (5 scenarios).'
