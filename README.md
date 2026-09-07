# vikram.builds

Personal site for **vikram.builds** — fitness, endurance sports, and storytelling.

**Live:** https://vikram899.github.io/vikram-builds/

Single-page, hand-illustrated "field journal" concept: a corkboard/logbook aesthetic
with pinned SVG line-art illustrations, ink-stamp checkpoint markers, and a mix of
typewriter, serif, and handwritten type instead of a conventional dashboard/card layout.

## Status

All content (bio, stats, race info, social links) is **placeholder** — swap in real
details as they're finalized. See the artifact history for design rationale.

## Deployment

Deployed via GitHub Pages, serving straight from `main` / root — every push to
`main` triggers an automatic rebuild, no CI config needed.

## Running locally

It's a single static file, no build step:

```bash
open index.html
```

or serve it with any static server, e.g.:

```bash
npx serve .
```
