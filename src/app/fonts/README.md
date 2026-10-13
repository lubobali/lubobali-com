# Fonts

Self-hosted with `next/font/local` — no requests to Google, at build time
or in the browser.

| File | Font | Weights | Source |
|---|---|---|---|
| `InterTight-latin-wght.woff2` | Inter Tight (variable, latin, normal) | 100–900 | `@fontsource-variable/inter-tight@5.3.0` |
| `JetBrainsMono-latin-wght.woff2` | JetBrains Mono (variable, latin, normal) | 100–800 | `@fontsource-variable/jetbrains-mono@5.3.0` |

sha256:
```
77fefe8ca19b9f69b5284832c519e0493127c1f091f0a8936884be7721c4e618  InterTight-latin-wght.woff2
18be452724bfdc236c074ca94a249a7f41a86752c7d04ab258ce9ed5651f6a7e  JetBrainsMono-latin-wght.woff2
```

Both fonts are licensed under the SIL Open Font License 1.1 — see
`InterTight-OFL.txt` and `JetBrainsMono-OFL.txt`.

To update: `npm pack` the package (npm checks its integrity hash), copy the
`files/*-latin-wght-normal.woff2` file + `LICENSE`, update this table.
