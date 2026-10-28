#!/usr/bin/env bash
# Instant rollback for lubobali.com (Gate 7 S4).
#
#   rollback.sh <deploy_root> [release_id]
#
# Without release_id: switch `current` to the newest release older than the
# live one that was NOT itself rolled back. With release_id: switch to that
# exact release (see `ls releases/`). Same atomic link swap as deploy.sh —
# takes effect on the next request.
#
# Every rollback writes the release it leaves to <deploy_root>/rolled-back.txt
# (outside releases/, never served). 2026-10-28: two failed Lighthouse runs
# in a row sent staging back to the FIRST failed build, not the last good one.
set -euo pipefail

die() { printf 'rollback: ERROR: %b\n' "$*" >&2; exit 1; }

[[ $# -ge 1 && $# -le 2 ]] || die "usage: rollback.sh <deploy_root> [release_id]"
root="${1%/}"
[[ -L "$root/current" ]] || die "no live release at $root/current"

exec 9>"$root/.deploy.lock"
flock -n 9 || die "a deploy is running"

live="$(basename "$(readlink "$root/current")")"
bad="$root/rolled-back.txt"
is_bad() { [[ -f "$bad" ]] && grep -qxF "$1" "$bad"; }
mapfile -t all < <(find "$root/releases" -mindepth 1 -maxdepth 1 -type d ! -name '.*' \
                     -printf '%f\n' | sort)

if [[ $# -eq 2 ]]; then
  target="$2"
  [[ -d "$root/releases/$target" ]] || die "release not found: $target"
else
  target=""
  for r in "${all[@]}"; do
    [[ "$r" == "$live" ]] && break
    is_bad "$r" || target="$r"
  done
  [[ -n "$target" ]] || die "no good release older than live ($live)"
fi

[[ "$target" != "$live" ]] || die "$target is already live"
[[ -s "$root/releases/$target/index.html" ]] || die "release $target has no index.html"

ln -sfn "releases/$target" "$root/.current.tmp"
mv -T "$root/.current.tmp" "$root/current"
is_bad "$live" || echo "$live" >> "$bad"
echo "rollback: live $live -> $target"
