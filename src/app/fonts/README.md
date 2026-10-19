# Fonts

Self-hosted with `next/font/local` — no requests to Google, at build time
or in the browser.

| File | Font | Weights | Source |
|---|---|---|---|
| `InterTight-latin-wght400-600.woff2` | Inter Tight (variable, latin, normal), **trimmed** | 400–600 | `@fontsource-variable/inter-tight@5.3.0`, trimmed by `scripts/fonts/trim-inter-tight.py` |
| `JetBrainsMono-latin-wght.woff2` | JetBrains Mono (variable, latin, normal) | 100–800 | `@fontsource-variable/jetbrains-mono@5.3.0` |

sha256:
```
c30be788a121b402e7e3cd4658818243e2b4b1992ea6055533a30a22d4d2c7b4  InterTight-latin-wght400-600.woff2
77fefe8ca19b9f69b5284832c519e0493127c1f091f0a8936884be7721c4e618  (original InterTight-latin-wght.woff2, input of the trim)
18be452724bfdc236c074ca94a249a7f41a86752c7d04ab258ce9ed5651f6a7e  JetBrainsMono-latin-wght.woff2
```

Both fonts are licensed under the SIL Open Font License 1.1 — see
`InterTight-OFL.txt` and `JetBrainsMono-OFL.txt`.

To update: `npm pack` the package (npm checks its integrity hash), copy the
`files/*-latin-wght-normal.woff2` file + `LICENSE`, update this table.

Inter Tight trim (Phase 3 H12, 2026-10-19): the site only uses weights 400,
500 and 600 and Latin text, so the variable font was cut to the 400–600
range and Latin-1 + punctuation + arrows + euro (all OpenType features
kept): 45 KB → 26 KB, rendered side by side = identical. It is the hero
text font (the phone LCP), so every KB counts. **New weight or script?**
(e.g. bold 700, or Bulgarian) → re-run the trim with a wider range from
the original file. The trimmed file is still under the OFL.
