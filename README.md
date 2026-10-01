# Sovereign of Aethra — Novel

Public bilingual illustrated-novel reader for *Sovereign of Aethra*. The SOA Wiki remains the separate encyclopedia and lore experience.

## Editions

- [Indonesian edition](_chapters/id/prologue.md)
- [English edition](_chapters/en/prologue.md)

## Status

The Indonesian and English Prologues are approved final manuscript versions. Approved manuscript prose must not be automatically rewritten; only minimal front matter is added for rendering.

## Adding content

Add public chapters under `_chapters/<language>/` and keep matching chapter IDs across language editions. Public, web-optimized artwork belongs under `assets/novel/`; production masters stay outside this repository. Missing artwork must not create broken reader images.

## Development and deployment

GitHub Pages builds this Jekyll site. To preview locally, run `bundle exec jekyll serve --baseurl ""` in a compatible Ruby/Jekyll environment. The expected public URL is `https://iron-bloom-studio.github.io/sovereign-of-aethra-novel/`.

If Pages is not enabled, select **Settings → Pages → Deploy from a branch → main → /(root)** in GitHub.
