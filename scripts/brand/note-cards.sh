#!/usr/bin/env bash
# Render every note's share card (Phase 9 P9.7) in the Playwright image.
# From the repo root: scripts/brand/note-cards.sh   (then commit the .jpg + cards.json)
set -euo pipefail
cd "$(dirname "$0")/../.."
docker run --rm --init -v "$PWD":/w -w /tmp mcr.microsoft.com/playwright:v1.64.0-noble bash -c \
  'npm i --silent playwright@1.64.0 >/dev/null 2>&1 && cp /w/scripts/brand/note-cards.mjs . \
   && node --import /w/scripts/lib/ts-paths.mjs note-cards.mjs /w'
