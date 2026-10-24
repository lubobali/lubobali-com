# Brand image fonts (not served on the site)

Static instances (wght 400 and 600) of `src/app/fonts/InterTight-latin-wght400-600.woff2`,
made with fontTools 4.61.1 `varLib.instancer` (2026-10-24). Used only by
`scripts/brand/resume.html`, not served on the site. A variable font prints as
Type 3 glyphs in Chrome's PDFs, which some ATS can't read; static fonts embed
as TrueType. License: SIL OFL 1.1, see `src/app/fonts/InterTight-OFL.txt`.

`InterTight-latin-wght.woff2`: the full variable font (weights 100-900) from
before the Phase 3 H12 trim (git `58148c7^:src/app/fonts/`), restored
2026-10-24 for `og.html` and `icon.html`: the icon draws at weight 700 and the
share image must look exactly as before. The site serves the trimmed copy.
