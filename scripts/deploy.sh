#!/usr/bin/env bash
# Atomic static-site deploy for lubobali.com (Gate 7 S4).
#
#   deploy.sh <build_dir> <deploy_root> <label>
#
#   build_dir    Next.js static export (usually ./out)
#   deploy_root  e.g. /srv/lubobali-www/staging
#   label        short id, usually the git sha (shown in release name)
#
# Layout:
#   <deploy_root>/releases/<UTC-timestamp>-<label>/   one folder per deploy
#   <deploy_root>/current -> releases/<id>            what Caddy serves
#
# Steps: validate build -> copy to releases/<id>.tmp -> rename -> switch
# `current` with an atomic rename -> keep last KEEP_RELEASES (default 5).
# Visitors never see a half-copied site; a failed step leaves the live
# release untouched. Rollback: scripts/rollback.sh.
set -euo pipefail

KEEP_RELEASES="${KEEP_RELEASES:-5}"

die() { printf 'deploy: ERROR: %b\n' "$*" >&2; exit 1; }

[[ $# -eq 3 ]] || die "usage: deploy.sh <build_dir> <deploy_root> <label>"
build="${1%/}"
root="${2%/}"
label="$3"

[[ "$label" =~ ^[A-Za-z0-9._-]+$ ]] || die "label must be [A-Za-z0-9._-]: '$label'"
[[ -d "$build" ]] || die "build dir not found: $build"

# --- validate the build BEFORE touching anything live ---------------------
for f in index.html 404.html; do
  [[ -s "$build/$f" ]] || die "build is missing $f (incomplete export?)"
done
# Never publish secrets, source maps, or dependencies.
leaks="$(find "$build" \( -name '.env*' -o -name '*.map' -o -name 'node_modules' \
          -o -name '.git' -o -name '*.pem' -o -name '*.key' \) -print | head -5)"
[[ -z "$leaks" ]] || die "build contains files that must never be public:\n$leaks"
# /building must be built from the daily job's real data (P7.9): the sample
# fixture (fake numbers) or a page with no data marker never goes live.
if [[ -f "$build/building.html" ]]; then
  grep -q 'data-live="real"' "$build/building.html" \
    || die "/building was built without real data (LIVE_DATA_FILE not set?): refusing"
fi

mkdir -p "$root/releases"

# One deploy at a time: CI and the daily /building job (P7.9) may meet, so
# wait for the other one (bounded), never fail at once and never overlap.
exec 9>"$root/.deploy.lock"
flock -w "${DEPLOY_LOCK_WAIT:-900}" 9 || die "another deploy held the lock for ${DEPLOY_LOCK_WAIT:-900}s"

id="$(date -u +%Y%m%dT%H%M%SZ)-$label"
tmp="$root/releases/.$id.tmp"
dest="$root/releases/$id"
[[ ! -e "$dest" ]] || die "release already exists: $id"

# --- copy into a hidden temp dir, then rename (atomic on same filesystem) --
rm -rf "$tmp"
trap 'rm -rf "$tmp" "$root/.current.tmp"' EXIT
mkdir -p "$tmp"
cp -a "$build/." "$tmp/"
chmod -R u=rwX,go=rX "$tmp"          # caddy user must read everything
mv "$tmp" "$dest"

# --- switch: relative link + rename() = atomic, works in CI container too --
ln -sfn "releases/$id" "$root/.current.tmp"
mv -T "$root/.current.tmp" "$root/current"

# --- prune: keep newest KEEP_RELEASES, never the live one ------------------
live="$(readlink "$root/current")"
mapfile -t old < <(find "$root/releases" -mindepth 1 -maxdepth 1 -type d ! -name '.*' \
                     -printf '%f\n' | sort -r | tail -n +"$((KEEP_RELEASES + 1))")
for r in "${old[@]}"; do
  [[ "releases/$r" == "$live" ]] && continue
  rm -rf "${root:?}/releases/${r:?}"
done

echo "deploy: live -> $id"
