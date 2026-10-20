#!/usr/bin/env bash
# Build + (re)start the Blueprint API container (Phase 3b B4).
#   scripts/blueprint-deploy.sh [staging]        build HEAD, swap, health-check
#   scripts/blueprint-deploy.sh rollback <tag>   run an older image again
# Never touches lubot-* / graphguard-* containers. Secrets: env file on the
# server only. Reachable only from this machine (127.0.0.1:PORT, nginx in front).
set -euo pipefail

ENV_NAME=staging
NAME=lubobali-blueprint-$ENV_NAME
NET=lubobali-blueprint-net
PORT=8095
SECRETS=/srv/lubobali-secrets/blueprint.env
DATA=/srv/lubobali-blueprint/data
REPO="$(cd "$(dirname "$0")/.." && pwd)"

run() {
  local tag=$1
  docker network inspect "$NET" >/dev/null 2>&1 || docker network create "$NET" >/dev/null
  local gw; gw=$(docker network inspect "$NET" -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}')
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  docker run -d --name "$NAME" \
    --network "$NET" -p 127.0.0.1:$PORT:8000 \
    --env-file "$SECRETS" \
    -e BLUEPRINT_DB=/data/blueprint.sqlite \
    -e BLUEPRINT_TRUSTED_PROXIES="$gw" \
    -v "$DATA":/data \
    --read-only --tmpfs /tmp:rw,size=16m \
    --cap-drop ALL --security-opt no-new-privileges \
    --cpus 0.5 --memory 384m --pids-limit 128 \
    --log-opt max-size=10m --log-opt max-file=3 \
    --restart unless-stopped \
    "lubobali-blueprint:$tag" >/dev/null
  for _ in $(seq 1 30); do
    if curl -fsS "http://127.0.0.1:$PORT/api/blueprint/health" >/dev/null 2>&1; then
      echo "blueprint: $NAME running lubobali-blueprint:$tag (trusted proxy $gw)"; return 0
    fi
    sleep 1
  done
  echo "blueprint: health check FAILED for $tag"; docker logs --tail 30 "$NAME"; return 1
}

if [[ "${1:-}" == "rollback" ]]; then
  run "${2:?usage: rollback <tag>}"; exit
fi

tag=$(git -C "$REPO" log -1 --format=%h -- blueprint-api)
docker build -q -t "lubobali-blueprint:$tag" "$REPO/blueprint-api" >/dev/null
prev=$(docker inspect -f '{{.Config.Image}}' "$NAME" 2>/dev/null || true)
if ! run "$tag"; then
  [[ -n "$prev" ]] && { echo "blueprint: rolling back to $prev"; run "${prev#lubobali-blueprint:}"; }
  exit 1
fi
[[ -n "$prev" && "$prev" != "lubobali-blueprint:$tag" ]] && echo "blueprint: previous image kept for rollback: $prev"
exit 0
