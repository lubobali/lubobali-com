# lubobali.com

Source for [lubobali.com](https://lubobali.com) — portfolio and freelance site of
**Lubo Bali**, AI & Data Platform Engineer (builder of [LuBot](https://lubot.ai)).

> Work in progress. The current live site is still the old one; this rebuild ships
> to staging first.

## Stack

- **Next.js 16** (App Router, static export — no server runtime), **React 19**, **TypeScript**
- **Tailwind CSS 4**, `motion` for animation
- **pnpm**, Node 22

## How it ships

Every push to `develop` runs a CI/CD pipeline on a self-hosted
[Forgejo Actions](https://forgejo.org/docs/latest/user/actions/) runner
(`.forgejo/workflows/build-and-deploy.yml`):

```
gitleaks (full history) → pnpm install --frozen-lockfile → pnpm audit
→ lint → type check → build → test the deploy scripts
→ atomic deploy → smoke test → auto-rollback if the smoke test fails
```

- **Atomic releases** — `scripts/deploy.sh` copies the build into its own
  release folder and switches a `current` symlink in one rename. No half-copied
  site, last 5 releases kept, rollback in one command (`scripts/rollback.sh`).
- **Build guard** — deploy refuses a build that is missing pages or contains
  `.env*`, source maps, keys or `node_modules`.
- **Smoke test** — `scripts/smoke.sh` checks the live site byte-for-byte against
  the new build, plus a real 404 and the security headers. Fail → roll back.
- **Tested scripts** — `scripts/tests/test-deploy.sh` (11 tests), all shell
  scripts pass `shellcheck`.

## Security notes

- Dedicated, sandboxed CI runner (own CPU / memory / process limits, no Docker
  socket, one writable folder) — isolated from other projects on the host.
- Pinned toolchain: CI image in `ci/Dockerfile` (base image + gitleaks pinned by
  digest), lockfile-only installs, dependency install scripts blocked.
- Secrets scanning on every push (`.gitleaks.toml`).
- Served as static files behind a hardened reverse proxy (rate limits,
  scanner blocking, security headers).

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static export to ./out
bash scripts/tests/test-deploy.sh
```

## License

Code © Lubo Bali. Photos and personal content are not licensed for reuse.
