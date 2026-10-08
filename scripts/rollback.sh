#!/usr/bin/env bash
# Instant rollback for lubobali.com (Gate 7 S4).
#
#   rollback.sh <deploy_root> [release_id]
#
# Without release_id: switch `current` to the release just before the live
# one. With release_id: switch to that exact release (see `ls releases/`).
# Same atomic link swap as deploy.sh — takes effect on the next request.
set -euo pipefail

die() { printf 'rollback: ERROR: %b\n' "$*" >&2; exit 1; }

[[ $# -ge 1 && $# -le 2 ]] || die "usage: rollback.sh <deploy_root> [release_id]"
root="${1%/}"
[[ -L "$root/current" ]] || die "no live release at $root/current"

exec 9>"$root/.deploy.lock"
flock -n 9 || die "a deploy is running"

live="$(basename "$(readlink "$root/current")")"
mapfile -t all < <(find "$root/releases" -mindepth 1 -maxdepth 1 -type d ! -name '.*' \
                     -printf '%f\n' | sort)

if [[ $# -eq 2 ]]; then
  target="$2"
  [[ -d "$root/releases/$target" ]] || die "release not found: $target"
else
  target=""
  for r in "${all[@]}"; do
    [[ "$r" == "$live" ]] && break
    target="$r"
  done
  [[ -n "$target" ]] || die "no release older than live ($live)"
fi

[[ "$target" != "$live" ]] || die "$target is already live"
[[ -s "$root/releases/$target/index.html" ]] || die "release $target has no index.html"

ln -sfn "releases/$target" "$root/.current.tmp"
mv -T "$root/.current.tmp" "$root/current"
echo "rollback: live $live -> $target"
