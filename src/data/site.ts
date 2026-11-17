export const projects = {
  nba: { title: 'BUDX NBA House', category: 'Branded experiences', year: '2025', image: '/images/nba-cover-new.webp', alt: 'A basketball dunk above the crowd at BUDX NBA House', ready: true },
  redbull: { title: 'Red Bull 64 Bars', category: 'Branded experiences', year: '2025', image: '/images/red-bull-cover-new.webp', alt: 'People gathering at the Red Bull 64 Bars event', ready: false },
  puma: { title: 'Suede Sounds', category: 'PUMA × Jaipur Rugs', year: '2026', image: '/images/puma-cover-new.webp', alt: 'PUMA and Jaipur Rugs listening room with speakers, rugs and a music curator', ready: false },
  spotify: { title: 'Spotify EQUAL', category: 'Branded experiences', year: '2026', image: '/images/spotify-cover.jpg', alt: 'Spotify EQUAL project photograph', ready: false },
  cad: { title: 'Control Alt Delete', category: 'Our own IPs', year: 'Since 2011', image: '/images/cad-cover.jpg', alt: 'Live music at Control Alt Delete, photograph by Aadarsh Parmar', ready: false },
  nwo: { title: 'New World Order', category: 'Our own IPs', year: 'Since 2022', image: '/images/nwo-cover.jpg', alt: 'A performance at New World Order', ready: false },
  lolla: { title: 'Lollapalooza India', category: 'Festivals', year: '2025', image: '/images/lolla-cover.jpg', alt: 'Festival production at Lollapalooza India', ready: false },
  spoken: { title: 'Spoken Fest', category: 'Festivals', year: '2026', image: '/images/spoken-cover.jpg', alt: 'The Spoken Fest experience', ready: false },
} as const;

export type ProjectKey = keyof typeof projects;

export const chords: { name: string; description: string; frets: number[]; project: ProjectKey; images: string[]; roles: string[]; mainRow: number }[] = [
  { name: 'Gmaj7', description: 'BUDX NBA House', frets: [5, 4, 3, 2], project: 'nba', mainRow: 1, images: ['/images/nba-1.webp', '/images/nba-cover-new.webp', '/images/nba-5.webp', '/images/nba-3.webp'], roles: ['Creative development', 'Production / 2025', 'Showrunning', 'On-ground execution'] },
  { name: 'Amaj7', description: 'Red Bull 64 Bars', frets: [7, 6, 5, 4], project: 'redbull', mainRow: 1, images: ['/images/red-bull-cover.jpg', '/images/red-bull-cover-new.webp', '/images/red-bull-detail-1.webp', '/images/red-bull-detail-2.webp'], roles: ['Booth design', 'Production / 2025', 'Artist programming', 'On-ground execution'] },
  { name: 'Fmaj7', description: 'PUMA × Jaipur Rugs', frets: [3, 2, 1, 0], project: 'puma', mainRow: 1, images: ['/images/puma-cover.jpg', '/images/puma-cover-new.webp', '/images/puma-detail-1.webp', '/images/puma-detail-2.webp'], roles: ['Space design', 'Curation / 2026', 'Production', 'Brand experience'] },
];

export const tuning = [146.8324, 195.9977, 246.9417, 329.6276];
export const tuningNames = ['D', 'G', 'B', 'E'];
export const tuningMidi = [50, 55, 59, 64];
export function noteName(row: number, fret: number) {
  const midi = tuningMidi[row] + fret;
  return ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][midi % 12] + (Math.floor(midi / 12) - 1);
}

export const canvasTitles = [
  { lines: ['NBA', 'HOUSE'], label: '“BUDX” / 2025', credit: 'Creative development\nShowrunning + on-ground execution', foot: 'END-TO-END\nPRODUCTION.' },
  { lines: ['64 BARS'], label: '“RED BULL” / 2025', credit: 'Booth design\nArtist programming + production', foot: 'EXPERIENCE DESIGN\n+ PRODUCTION.' },
  { lines: ['SUEDE', 'SOUNDS'], label: '“PUMA × JAIPUR RUGS” / 2026', credit: 'Space design\nCuration + brand experience', foot: 'SPACE DESIGN\n+ CURATION.' },
];
