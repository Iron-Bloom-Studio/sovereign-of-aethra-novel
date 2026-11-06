# Sovereign of Aethra — Novel

Public bilingual illustrated-novel reader for *Sovereign of Aethra*. The SOA Wiki remains the separate encyclopedia and lore experience.

## Read online

- [Animated bilingual book](https://iron-bloom-studio.github.io/sovereign-of-aethra-novel/book/)
- [Indonesian scroll edition](https://iron-bloom-studio.github.io/sovereign-of-aethra-novel/read/)
- [English scroll edition](https://iron-bloom-studio.github.io/sovereign-of-aethra-novel/read/en/)

## Editions

- [Indonesian edition](_chapters/id/prologue.md)
- [English edition](_chapters/en/prologue.md)

## Status

Volume I contains the Prologue, Chapters 1–40, and an Epilogue in Indonesian and English. Chapters 12–40 and the Epilogue are published as a complete continuity-review draft.

## Adding content

Add public chapters under `_chapters/<language>/` and keep matching chapter IDs across language editions. Public, web-optimized artwork belongs under `assets/novel/`; production masters stay outside this repository. Missing artwork must not create broken reader images.

## Development and deployment

GitHub Pages builds this Jekyll site from `main` and `/(root)`. To preview locally, run `bundle exec jekyll serve --baseurl "/sovereign-of-aethra-novel"` in a compatible Ruby/Jekyll environment.
