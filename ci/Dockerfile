# lubobali-ci — job image for the lubobali-runner (Gate 7 S6).
# Small + pinned: Node 22 slim + git (for checkout) + pnpm baked in, so
# every CI run uses the exact same tools and doesn't download pnpm.
#
# Tools + versions (bump the image tag when any of these change):
#   node 22 (bookworm-slim, digest-pinned) · pnpm 12.6.0 · gitleaks 8.30.1
#   · chromium (Debian bookworm-security; for Lighthouse, Phase 2 P9)
#
# Build (on the Hetzner box):
#   docker build -t lubobali-ci:node22-pnpm12.6.0-gl8.30.1-chromium155 ci/
# Runner label (in /srv/lubobali-www/runner/.runner):
#   lubobali:docker://lubobali-ci:node22-pnpm12.6.0-gl8.30.1-chromium155

# gitleaks binary from the official image, pinned by digest (same digest
# verified in Gate 7 S5) — no download + checksum dance at job time.
FROM ghcr.io/gitleaks/gitleaks@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f AS gitleaks

FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl chromium \
 && rm -rf /var/lib/apt/lists/* \
 && chromium --version

# Lighthouse (project devDependency) finds Chrome here.
ENV CHROME_PATH=/usr/bin/chromium

# Must match "packageManager" in package.json.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate && pnpm --version

COPY --from=gitleaks /usr/bin/gitleaks /usr/local/bin/gitleaks
RUN gitleaks version

LABEL org.opencontainers.image.title="lubobali-ci" \
      org.opencontainers.image.source="https://git.lubot.ai/lubo/lubobali-com"
