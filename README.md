# 4/4 fretboard prototype

Live development preview: http://127.0.0.1:4321

```sh
npm install
npm run dev
```

Astro serves the local preview with live updates. The project includes its own compatible Node runtime as a development dependency.

## Interactions

- Default black theme; Day switches the palette.
- First click unlocks sound. Sound toggles both the muted electric notes and the warm drone.
- Cross a string to play it; click the chord label or press Space to hear the rising chord. Keys 1–4 play individual notes.
- Wheel, horizontal trackpad, drag, or arrow keys move between projects.
- Hover or focus a disc for its image overlay and cursor-lit rim.
- Zoom out shows the full fretboard; auxiliary image dots become white circles.
- NBA House opens a full-screen case study; Back restores the fretboard.
- Other project breakdowns remain previews. Service captions and editorial labels are prototype copy.

## Content and music

Three project chords are implemented. All four images in each chord come from that project:

| Project | Chord | D / G / B / E string frets | Sounding notes |
| --- | --- | --- | --- |
| BUDX NBA House | Gmaj7 | 5 / 4 / 3 / 2 | G3 / B3 / D4 / F♯4 |
| Red Bull 64 Bars | Amaj7 | 7 / 6 / 5 / 4 | A3 / C♯4 / E4 / G♯4 |
| PUMA × Jaipur Rugs | Fmaj7 | 3 / 2 / 1 / 0 | F3 / A3 / C4 / E4 |

The main disc is larger; other discs are exactly 30% smaller. Chapter spacing includes a long service interlude and keeps neighbouring projects apart. The introductory arrangement lasts two seconds.

Photographs and actual black/white logos came from the supplied Drive library. Source ledgers are in `public/images/asset-sources.json` and `cover-candidates.json`. Personal contact details from the chat are not included.

GitHub Pages: https://npclabs-19.github.io/four-four-fretboard/

Source: https://github.com/NPCLABS-19/four-four-fretboard

Deploy updates with `npm run deploy` after committing source changes to `main`. The script checks types, builds with the GitHub Pages base path and pushes only generated website files to `gh-pages`. GitHub Pages serves that branch. Local previews continue to use `/` at port 4321. The public prototype remains excluded from search indexing while case-study placeholders are in use.

## Checks

```sh
npm run check
npm run build
```
