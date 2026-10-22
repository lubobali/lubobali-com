# Fonts

Self-hosted with `next/font/local` — no requests to Google, at build time
or in the browser.

| File | Font | Weights | Source |
|---|---|---|---|
| `InterTight-latin-wght400-600.woff2` | Inter Tight (variable, latin, normal), **trimmed** | 400–600 | `@fontsource-variable/inter-tight@5.3.0`, trimmed by `scripts/fonts/trim-inter-tight.py` |
| `JetBrainsMono-latin-wght.woff2` | JetBrains Mono (variable, latin, normal) | 100–800 | `@fontsource-variable/jetbrains-mono@5.3.0` |
| `Fraunces-latin-400.woff2` | Fraunces (latin, normal) | 400 | the LuBot Publisher card fonts (`/srv/lubot-publisher/static/fonts`), same files |

sha256:
```
c30be788a121b402e7e3cd4658818243e2b4b1992ea6055533a30a22d4d2c7b4  InterTight-latin-wght400-600.woff2
77fefe8ca19b9f69b5284832c519e0493127c1f091f0a8936884be7721c4e618  (original InterTight-latin-wght.woff2, input of the trim)
18be452724bfdc236c074ca94a249a7f41a86752c7d04ab258ce9ed5651f6a7e  JetBrainsMono-latin-wght.woff2
e558f39453a9c611908be04294b50dea5f21ae6c49b41c6e47f4115e91f90209  Fraunces-latin-400.woff2
```

Fraunces (Phase 5, 2026-10-22) = the brand-card serif, the same as Lubo's
Publisher cards (Lubo: "luxury cards"). Preloaded only on the routes that
show a brand card, never on the home page. Space Grotesk was tried and
dropped the same day: a second font on the critical path pushed a slow
phone's LCP to the 2.5 s budget; the labels use Inter Tight 600 instead.

All fonts are licensed under the SIL Open Font License 1.1 — see
`InterTight-OFL.txt`, `JetBrainsMono-OFL.txt` and `Fraunces-OFL.txt`.

To update: `npm pack` the package (npm checks its integrity hash), copy the
`files/*-latin-wght-normal.woff2` file + `LICENSE`, update this table.

Inter Tight trim (Phase 3 H12, 2026-10-19): the site only uses weights 400,
500 and 600 and Latin text, so the variable font was cut to the 400–600
range and Latin-1 + punctuation + arrows + euro (all OpenType features
kept): 45 KB → 26 KB, rendered side by side = identical. It is the hero
text font (the phone LCP), so every KB counts. **New weight or script?**
(e.g. bold 700, or Bulgarian) → re-run the trim with a wider range from
the original file. The trimmed file is still under the OFL.
