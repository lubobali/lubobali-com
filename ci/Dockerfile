# lubobali-ci — job image for the lubobali-runner (Gate 7 S6).
# Small + pinned: Node 22 slim + git (for checkout) + pnpm baked in, so
# every CI run uses the exact same tools and doesn't download pnpm.
#
# Build (on the Hetzner box):
#   docker build -t lubobali-ci:node22-pnpm12.6.0 ci/
# Runner label: lubobali:docker://lubobali-ci:node22-pnpm12.6.0
FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

# Must match "packageManager" in package.json.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate && pnpm --version

LABEL org.opencontainers.image.title="lubobali-ci" \
      org.opencontainers.image.source="https://git.lubot.ai/lubo/lubobali-com"
