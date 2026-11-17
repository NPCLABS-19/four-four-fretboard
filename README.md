# 4/4 fretboard prototype

Local preview: http://127.0.0.1:4321/

```sh
npm install
npm run dev
```

Astro, TypeScript, GSAP and Web Audio. A compatible Node runtime is included as a development dependency.

## Current local revision

- Original supplied 4/4 logo, with black and white assets for day/night modes.
- Sound defaults to on each load. Playback starts immediately where permitted, otherwise the first user interaction unlocks it. The Sound button still allows muting.
- No Zoom out control or project-score view. About and Index retain their hover animation and do not open panels.
- Three project chords, each with four supplied photographs. Surrounding discs are 30% smaller, with spacing designed to prevent overlaps.
- Hover/focus reveals large project typography on the canvas. Each project uses a different composition. Larger service headings describe production, experience design or spatial curation.
- Strings are playable; wheel, drag and arrows navigate projects. Scroll speed modulates the drone.
- NBA House opens a full case study; Back restores the fretboard. Other case studies are labelled previews.
- A two-second arrangement introduces the discs; reduced motion skips it.

## Review and publication

Approved revision: original logo, larger service-led hover typography, no Zoom out, hover-only About and Index, and sound on by default. Live site: https://npclabs-19.github.io/four-four-fretboard/.

Repository: https://github.com/NPCLABS-19/four-four-fretboard

`npm run deploy` checks types, builds with the GitHub Pages base path and pushes generated output to `gh-pages`. Approved source changes are tracked on `main`. GitHub / NPCLABS-19 is the only authorised hosting destination.

## Checks

```sh
npm run check
npm run build
```
