#!/usr/bin/env bash
# Tests for scripts/deploy.sh + scripts/rollback.sh.
# Runs against a throwaway temp dir — never touches the live site.
# Usage: bash scripts/tests/test-deploy.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY="$HERE/../deploy.sh"
ROLLBACK="$HERE/../rollback.sh"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/www"
PASS=0

ok()   { PASS=$((PASS + 1)); echo "  ok - $1"; }
fail() { echo "  FAIL - $1"; exit 1; }

# make_build <dir> <text>: fake static export with the required files
make_build() {
  mkdir -p "$1/_next/static"
  echo "<html>$2</html>" > "$1/index.html"
  echo "<html>404</html>" > "$1/404.html"
  echo "css" > "$1/_next/static/app.css"
}
live() { cat "$ROOT/current/index.html"; }

echo "test-deploy.sh"

# 1. first deploy creates releases/ + current
make_build "$TMP/b1" "v1"
"$DEPLOY" "$TMP/b1" "$ROOT" sha1 >/dev/null
[[ -L "$ROOT/current" ]] || fail "current is a symlink"
[[ "$(live)" == "<html>v1</html>" ]] || fail "v1 is live"
ok "first deploy makes v1 live"

# 2. current is a RELATIVE link (works inside CI container + on host)
[[ "$(readlink "$ROOT/current")" == releases/* ]] || fail "relative symlink"
ok "current is a relative symlink"

# 3. second deploy switches to v2
make_build "$TMP/b2" "v2"
"$DEPLOY" "$TMP/b2" "$ROOT" sha2 >/dev/null
[[ "$(live)" == "<html>v2</html>" ]] || fail "v2 is live"
ok "second deploy makes v2 live"

# 4. no leftover temp dirs/links after deploy
[[ -z "$(find "$ROOT" -name '*.tmp')" ]] || fail "no .tmp leftovers"
ok "no .tmp leftovers"

# 5. rollback goes back to v1
"$ROLLBACK" "$ROOT" >/dev/null
[[ "$(live)" == "<html>v1</html>" ]] || fail "rollback to v1"
ok "rollback restores previous release"

# 6. rollback to an explicit release id
id2="$(basename "$ROOT"/releases/*-sha2)"
"$ROLLBACK" "$ROOT" "$id2" >/dev/null
[[ "$(live)" == "<html>v2</html>" ]] || fail "rollback to explicit id"
ok "rollback to explicit release id"

# 7. broken build (missing 404.html) is refused, live site untouched
mkdir -p "$TMP/bad" && echo "<html>bad</html>" > "$TMP/bad/index.html"
if "$DEPLOY" "$TMP/bad" "$ROOT" bad >/dev/null 2>&1; then fail "bad build refused"; fi
[[ "$(live)" == "<html>v2</html>" ]] || fail "live untouched after bad build"
[[ -z "$(find "$ROOT/releases" -name '*bad*')" ]] || fail "no bad release left behind"
ok "incomplete build refused, live site untouched"

# 8. build containing secrets / source maps is refused
make_build "$TMP/leak" "leak" && echo "SECRET=1" > "$TMP/leak/.env"
if "$DEPLOY" "$TMP/leak" "$ROOT" leak >/dev/null 2>&1; then fail ".env refused"; fi
make_build "$TMP/map" "map" && echo "{}" > "$TMP/map/_next/static/app.js.map"
if "$DEPLOY" "$TMP/map" "$ROOT" map >/dev/null 2>&1; then fail ".map refused"; fi
[[ "$(live)" == "<html>v2</html>" ]] || fail "live untouched after leak"
ok "build with .env / .map refused"

# 9. keeps only the last 5 releases, never deletes the live one
for i in 3 4 5 6 7 8; do make_build "$TMP/b$i" "v$i"; "$DEPLOY" "$TMP/b$i" "$ROOT" "sha$i" >/dev/null; done
n="$(find "$ROOT/releases" -mindepth 1 -maxdepth 1 -type d ! -name '.*' | wc -l)"
[[ "$n" -eq 5 ]] || fail "expected 5 releases, got $n"
[[ "$(live)" == "<html>v8</html>" ]] || fail "v8 live after prune"
ok "prunes to 5 releases, newest live"

# 10. rollback with nothing older refuses cleanly
ROOT2="$TMP/www2"; make_build "$TMP/only" "only"
"$DEPLOY" "$TMP/only" "$ROOT2" only >/dev/null
if "$ROLLBACK" "$ROOT2" >/dev/null 2>&1; then fail "rollback with 1 release"; fi
[[ "$(cat "$ROOT2/current/index.html")" == "<html>only</html>" ]] || fail "still live"
ok "rollback with no previous release refuses"

# 11. files are world-readable (Caddy runs as user 'caddy')
perm="$(stat -c '%a' "$ROOT/current/index.html")"
[[ "$perm" == 644 ]] || fail "index.html perm $perm"
dperm="$(stat -c '%a' "$(readlink -f "$ROOT/current")")"
[[ "$dperm" == 755 ]] || fail "release dir perm $dperm"
ok "files 644 / dirs 755 (readable by caddy)"

# 12. /building built from the sample data is refused (P7.9): fake numbers
#     must never reach visitors, staging or production.
make_build "$TMP/sample" "sample"
echo '<main data-live="sample">sample numbers</main>' > "$TMP/sample/building.html"
if "$DEPLOY" "$TMP/sample" "$ROOT" sample >/dev/null 2>&1; then fail "sample /building refused"; fi
[[ "$(live)" == "<html>v8</html>" ]] || fail "live untouched after sample"
make_build "$TMP/real" "real"
echo '<main data-live="real">real numbers</main>' > "$TMP/real/building.html"
"$DEPLOY" "$TMP/real" "$ROOT" real >/dev/null || fail "real /building deploys"
[[ "$(live)" == "<html>real</html>" ]] || fail "real is live"
ok "sample /building refused, real /building deploys"

# 13. a /building page with no data marker at all is refused too
make_build "$TMP/nomark" "nomark"
echo '<main>who knows</main>' > "$TMP/nomark/building.html"
if "$DEPLOY" "$TMP/nomark" "$ROOT" nomark >/dev/null 2>&1; then fail "unmarked /building refused"; fi
ok "/building without a data marker refused"

# 14. a second deploy WAITS for the lock (CI + the daily job), then runs
make_build "$TMP/wait" "wait"
( exec 8>"$ROOT/.deploy.lock"; flock 8; sleep 2 ) &
holder=$!
sleep 0.3
DEPLOY_LOCK_WAIT=10 "$DEPLOY" "$TMP/wait" "$ROOT" wait >/dev/null || fail "deploy waits for the lock"
wait "$holder"
[[ "$(live)" == "<html>wait</html>" ]] || fail "waited deploy is live"
ok "deploy waits for a running deploy, then goes live"

# 15. ... but not forever: a stuck lock fails clearly, live untouched
make_build "$TMP/stuck" "stuck"
( exec 8>"$ROOT/.deploy.lock"; flock 8; sleep 4 ) &
holder=$!
sleep 0.3
if DEPLOY_LOCK_WAIT=1 "$DEPLOY" "$TMP/stuck" "$ROOT" stuck >/dev/null 2>&1; then fail "stuck lock times out"; fi
wait "$holder"
[[ "$(live)" == "<html>wait</html>" ]] || fail "live untouched after lock timeout"
ok "stuck lock times out, live untouched"

# 16. a rollback never lands on a release that was itself rolled back
#     (2026-10-28: two failed Lighthouse runs in a row sent staging back to
#     the FIRST failed build, not the last good one)
ROOT3="$TMP/www3"
make_build "$TMP/g1" "good"; "$DEPLOY" "$TMP/g1" "$ROOT3" s1 >/dev/null
make_build "$TMP/x2" "bad1"; "$DEPLOY" "$TMP/x2" "$ROOT3" s2 >/dev/null
"$ROLLBACK" "$ROOT3" >/dev/null
[[ "$(cat "$ROOT3/current/index.html")" == "<html>good</html>" ]] || fail "first rollback -> good"
make_build "$TMP/x3" "bad2"; "$DEPLOY" "$TMP/x3" "$ROOT3" s3 >/dev/null
"$ROLLBACK" "$ROOT3" >/dev/null
[[ "$(cat "$ROOT3/current/index.html")" == "<html>good</html>" ]] || fail "second rollback skips bad1, lands on good"
ok "rollback skips releases that were rolled back"

# 17. the bad-release list lives outside every release (never served)
[[ -s "$ROOT3/rolled-back.txt" ]] || fail "rolled-back.txt written"
[[ -z "$(grep -rl "rolled" "$ROOT3/releases" 2>/dev/null)" ]] || fail "no marker inside a release"
ok "bad-release list is outside the served folders"

echo "PASS: $PASS/17"
