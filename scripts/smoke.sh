#!/usr/bin/env bash
# Post-deploy smoke test for lubobali.com (Gate 7 S7).
#
#   smoke.sh <site_url> <build_dir> [staging|prod]
#
# Checks the LIVE site, through nginx, exactly as a visitor sees it:
#   1. homepage body is byte-identical to <build_dir>/index.html
#      (proves the NEW release is live — not just "some 200")
#   2. unknown path -> real 404
#   3. security headers present (CSP enforced, HSTS 1 year); staging also has noindex
#   4. SEO + AI files served as built (sitemap, llms.txt, social image);
#      robots.txt: staging = "Disallow: /" (nginx), prod = the built file
#   5. one URL style: "/page/" -> 301 "/page"
#   6. good bots get the same homepage as people (no blocking, no cloaking)
# Never requests scanner paths (/.env etc.): CI traffic would feed our own
# fail2ban jail. Exit 0 = healthy, 1 = broken (caller rolls back).
set -euo pipefail

die() { printf 'smoke: FAIL: %b\n' "$*" >&2; exit 1; }

[[ $# -ge 2 && $# -le 3 ]] || die "usage: smoke.sh <site_url> <build_dir> [staging|prod]"
url="${1%/}"
build="${2%/}"
env="${3:-staging}"
[[ -s "$build/index.html" ]] || die "no $build/index.html to compare against"

get() { curl -sS --max-time 10 --retry 3 --retry-delay 2 --retry-all-errors "$@"; }

# 1. new release is live (retry: allow a moment for the link switch)
want="$(sha256sum < "$build/index.html" | cut -d' ' -f1)"
got=""
for _ in 1 2 3 4 5; do
  got="$(get "$url/" | sha256sum | cut -d' ' -f1)"
  [[ "$got" == "$want" ]] && break
  sleep 2
done
[[ "$got" == "$want" ]] || die "homepage is not the new build (sha256 $got != $want)"
echo "smoke: ok  homepage = new build"

# 2. real 404 (not a homepage fallback)
code="$(get -o /dev/null -w '%{http_code}' "$url/smoke-test-does-not-exist")"
[[ "$code" == 404 ]] || die "unknown path returned $code, want 404"
echo "smoke: ok  unknown path -> 404"

# 3. security headers
headers="$(get -o /dev/null -D - "$url/" | tr -d '\r' | tr '[:upper:]' '[:lower:]')"
for h in strict-transport-security x-content-type-options x-frame-options \
         referrer-policy permissions-policy content-security-policy; do
  grep -q "^$h:" <<<"$headers" || die "missing header: $h"
done
# CSP: nginx header = what a <meta> can't do (framing); the page's own
# <meta> policy = strict script hashes (scripts/csp.mjs). Both enforced.
grep -q "^content-security-policy:.*frame-ancestors 'none'" <<<"$headers" \
  || die "CSP header must enforce frame-ancestors 'none'"
grep -q '<meta http-equiv="Content-Security-Policy"' "$build/index.html" \
  || die "homepage has no CSP meta policy"
grep -q '^strict-transport-security: max-age=31536000' <<<"$headers" \
  || die "HSTS must be 1 year"
if [[ "$env" == staging ]]; then
  grep -q '^x-robots-tag: noindex' <<<"$headers" || die "staging missing x-robots-tag noindex"
fi
grep -q '^server: nginx$' <<<"$headers" || die "server header leaks a version"
echo "smoke: ok  security headers ($env)"

# 4. SEO + AI discovery files, byte-identical to the build
same_as_build() { # <path> <file in build>
  local want got
  [[ -s "$build/$2" ]] || die "build has no $2"
  want="$(sha256sum < "$build/$2" | cut -d' ' -f1)"
  got="$(get "$url$1" | sha256sum | cut -d' ' -f1)"
  [[ "$got" == "$want" ]] || die "$1 is not the built $2"
}
for f in sitemap.xml llms.txt og.png; do same_as_build "/$f" "$f"; done
robots="$(get "$url/robots.txt")"
if [[ "$env" == staging ]]; then
  grep -qx 'Disallow: /' <<<"$robots" || die "staging robots.txt must be Disallow: /"
else
  same_as_build /robots.txt robots.txt
fi
grep -q '<link rel="canonical"' "$build/index.html" || die "homepage has no canonical"
grep -q 'application/ld+json' "$build/index.html" || die "homepage has no JSON-LD"
echo "smoke: ok  sitemap, llms.txt, og.png, robots.txt ($env)"

# 5. one URL style (no trailing slash)
read -r code loc < <(get -o /dev/null -w '%{http_code} %{redirect_url}\n' "$url/smoke-test-page/")
[[ "$code" == 301 && "$loc" == "$url/smoke-test-page" ]] \
  || die "trailing slash: got $code $loc, want 301 $url/smoke-test-page"
echo "smoke: ok  /page/ -> 301 /page"

# 6. good bots (search + AI): 200 and byte-identical to the build
for bot in "Googlebot/2.1; +http://www.google.com/bot.html" "GPTBot/1.3; +https://openai.com/gptbot" \
           "ClaudeBot/1.0; +claudebot@anthropic.com" "PerplexityBot/1.0; +https://perplexity.ai/perplexitybot"; do
  got="$(get -A "Mozilla/5.0 (compatible; $bot)" "$url/" | sha256sum | cut -d' ' -f1)"
  [[ "$got" == "$want" ]] || die "${bot%%;*} does not get the built homepage"
done
echo "smoke: ok  Googlebot, GPTBot, ClaudeBot, PerplexityBot get the same homepage"

echo "smoke: PASS $url"
