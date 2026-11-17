# 4/4 Fretboard prototype

## Brief and accepted choices

Desktop-first local prototype, 17 November 2026. Closely follow the tactile mood, spatial hierarchy and floating photographic discs of https://a24.raviklaassens.com/, translated into four playable diagonal metallic strings. First click unlocks sound; no entry gate. Horizontal wheel/trackpad/drag and arrow navigation move between chords, with four photographs of one project at its chord’s actual fret positions. NBA House expands into a full-screen case study; browser Back and the visible Back action restore the fretboard. Other project breakdowns are explicitly previews.

## Concept exploration within the chosen direction

The user has chosen the instrument concept; these are treatments within that direction, not alternate concepts proposed for approval.

| Treatment / territory | Signature / screenshot | Anchor | Originality / fit / feasibility / portability |
| --- | --- | --- | --- |
| Four-string archive / music material | Photographic fingertip circles pluck four strings, then a note expands into a project | 4/4's music and cultural work; four strings explicitly requested | 4 / 5 / 5 / 2 |
| Chord score / formal notation | A strict musical score labels four project notes | Four-beat identity | 3 / 4 / 5 / 3 |
| Backstage rig / production process | Production cables carry floating project images | Live-event production practice | 4 / 4 / 3 / 3 |

Selected: Four-string archive. It follows the brief and makes discovery, audio, layout and transitions the same interaction.

Idea: Play your way through 4/4's work.
Metaphor: The four highest strings of a guitar, shown as an abstract fretboard.
Signature: Hover pluck; click strums the current chord and the NBA circle irises into its full-screen hero.
Emotion: Dark, tactile, intimate, confident.
Motion verb: Pluck, resonate, resolve.
Screenshot: One dominant photographic disc and three discs 30% smaller, spaced along diagonal metallic strings on a dark field.

## System

Ground #f2f2ee; ink #20211f; muted #60615a; line #c7c8bf; metal #e1e2dd; curtain #20211f. Colour comes from actual project photography. This pale ground is an explicit reference choice, with no terracotta accent or generic gradient identity.

Typography: Helvetica throughout, with Arial as a fallback. Chord and navigation labels are micro type, 10–14px; the actual supplied logo is the strongest identity element. Case-study text uses the same family. Body 18px. 32px desktop gutters; one circular shape rule for project notes, otherwise square layouts.

Four loose diagonal strings rise from lower left to upper right. D3/G3/B3/E4 tuning; Gmaj7 [5,4,3,2], Amaj7 [7,6,5,4], Fmaj7 [3,2,1,0]. Each chord carries four photographs of one project. Main disc sits near 58% width / 49% height. Other discs are exactly 30% smaller. A 1.55 viewport chapter interval and size limits preserve clearance, including hover growth. Header and footer zones clip the instrument clear of navigation.

The sound uses softly enveloped detuned sine voices and a quiet harmonic through a low-pass filter, with stereo chorus. A warm sine/triangle drone follows the chord. Scroll speed increases modulation and harmonic brightness, settling smoothly when scrolling stops. First click enables sound; the Sound toggle controls both layers. Everything visual runs on one GSAP ticker.

Hover and keyboard focus reveal large project text inside the photo and a cursor-positioned metallic rim highlight. The hub is 6% of the disc. Two-second introductory motion places the discs on their own strings without a common pile. Zoom out scales the entire archive and strings together; auxiliary photos become white circles. Short service words interrupt individual strings only in moving, uncovered interludes.

Case study: full-bleed image/title → asymmetric context and role → large photograph → paired detail photographs → credits and return action. About/index use quiet native dialogs. Narrow screens preserve four strings with smaller notes, visible arrows and touch drag; desktop is the requested design target.

Day and night themes are explicit user controls. The day palette follows the pale reference; night uses charcoal/olive ground, warm pale ink, and the actual white logo. A two-second arrangement introduces the discs; reduced motion skips it. Sound never autoplays before interaction. The instrument is intentionally still at rest, like a real string instrument. Its life comes from the user's plucks and damped physical response, rather than an unprompted loop.

## Scope and assumptions

All eight starter names and their cover photographs are real supplied library content. NBA copy and role credits come from the company profile. Other project breakdowns remain placeholders as authorised. The three scenes are NBA House, Red Bull 64 Bars and PUMA × Jaipur Rugs, each using its own supplied photographs. No invented clients, awards or outcome metrics. Unimplemented case studies are labelled Preview in the index and on hover. Service captions may be placeholder editorial copy, as authorised. Contact uses the profile's general company email. Chord choice and tuning are implementation decisions for this prototype.

Local-only build. No hosting registration or external publication. If deployed later, use NPCLABS-19 / GitHub Pages unless the user says otherwise.

## Accepted refinement
The user requested larger 3D discs with no overlaps, clear photography, actual logo, Helvetica, hover overlays, metallic diagonal strings, a muted electric chorus with a warm drone, black default and day mode. The final system follows these constraints. The visual string path has slight deterministic irregularity at rest and responds physically to pointer crossings.
