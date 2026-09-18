import type { SilhouetteId } from "../components/silhouettes";

/**
 * Colour for the PhyloPic silhouettes.
 *
 * The drawing of each bird is a person's silhouette from PhyloPic, used unaltered as a
 * stencil: `layers` are flat fills in the silhouette's own coordinate space, and are only
 * ever visible *inside* its outline (Bird.astro masks them to it). So the shape is always
 * the artist's; this file only says which parts are which colour — the field marks a
 * birder checks first. `overlay` is drawn unmasked, for eyes; `underlay` is drawn behind,
 * for silhouettes whose artist cut the white parts out.
 *
 * Coordinates were read off each silhouette on a grid. The /credits/ page shows every bird,
 * which is the quickest way to check an edit.
 */
export interface Paint {
  silhouette: SilhouetteId;
  /** drawn first, unmasked: a backing that shows through cut-outs in the silhouette */
  underlay?: string;
  layers: string;
  overlay?: string;
}

const eye = (x: number, y: number, r: number, ring?: string) =>
  (ring ? `<circle cx="${x}" cy="${y}" r="${r * 1.45}" fill="${ring}"/>` : "") +
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#111"/>` +
  `<circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.4}" fill="#fff"/>`;

export const PAINTS = {
  // Anna's Hummingbird, male: rose-magenta crown and gorget, green back, grey belly.
  hummingbird: {
    silhouette: "hummingbird",
    layers: `
      <rect width="1536" height="1344" fill="#4f9a5a"/>
      <path d="M540 900 Q640 760 720 640 L1536 900 L1536 1344 L600 1344 Z" fill="#2f6b3f"/>
      <ellipse cx="470" cy="640" rx="125" ry="270" transform="rotate(-18 470 640)" fill="#dfe4d9"/>
      <polygon points="700,330 900,-10 1536,-10 1536,300 690,625" fill="#d3e6d7"/>
      <polygon points="700,330 780,230 820,560 690,625" fill="#b9d6c0"/>
      <g stroke="#9fc2a7" stroke-width="10" fill="none"><path d="M760 470 L1450 60"/><path d="M780 540 L1500 200"/></g>
      <ellipse cx="470" cy="165" rx="200" ry="195" fill="#d81b60"/>
      <path d="M330 190 Q380 380 640 360 Q540 320 520 240 Z" fill="#d81b60"/>
      <path d="M370 300 Q470 370 600 352" stroke="#a3104a" stroke-width="12" fill="none" stroke-linecap="round"/>
      <polygon points="-10,-10 332,-10 332,128 -10,128" fill="#222"/>
      <polygon points="470,860 580,860 580,1000 470,1000" fill="#3a3530"/>`,
    overlay: eye(548, 102, 26),
  },

  // Great Blue Heron in flight: blue-grey, dark flight feathers, pale neck, white face with
  // a black crown stripe, yellow dagger bill.
  heron: {
    silhouette: "heron",
    layers: `
      <rect width="1536" height="1043" fill="#7d93a8"/>
      <path d="M430 -10 L1120 -10 Q900 250 700 330 Q600 520 610 900 L430 900 Z" fill="#556a7e"/>
      <ellipse cx="1035" cy="915" rx="150" ry="95" fill="#b3c2cf"/>
      <ellipse cx="1195" cy="850" rx="75" ry="55" fill="#f2f2ee"/>
      <path d="M1140 812 Q1195 790 1250 818" stroke="#1d1d1d" stroke-width="18" fill="none"/>
      <polygon points="1255,798 1536,850 1536,878 1255,905" fill="#e2b43a"/>
      <polygon points="-10,925 470,925 470,1050 -10,1050" fill="#5a4a3a"/>`,
    overlay: eye(1222, 846, 11, "#e2b43a"),
  },

  // American Robin: brick-orange breast, near-black head, slate back, yellow bill,
  // white undertail.
  robin: {
    silhouette: "robin",
    layers: `
      <rect width="1536" height="1194" fill="#4f4b47"/>
      <ellipse cx="1215" cy="560" rx="245" ry="330" fill="#d9622b"/>
      <ellipse cx="1210" cy="125" rx="215" ry="175" fill="#262524"/>
      <ellipse cx="880" cy="805" rx="95" ry="32" fill="#f1ece4"/>
      <polygon points="1360,30 1536,30 1536,170 1360,170" fill="#e8b82a"/>
      <polygon points="840,860 1536,860 1536,1194 840,1194" fill="#8a7766"/>`,
    overlay: `${eye(1290, 97, 20)}
      <path d="M1262 80 A34 34 0 0 1 1318 80 M1262 114 A34 34 0 0 0 1318 114" stroke="#fff" stroke-width="9" fill="none"/>`,
  },

  // Barn Owl: white heart-shaped face rimmed tawny, dark eyes, golden-buff back washed grey
  // and finely spotted, white underparts, long pale legs. The eyelids blink (see global.css
  // `.lid`).
  owl: {
    silhouette: "owl",
    layers: `
      <rect width="1324" height="1536" fill="#c9975a"/>
      <ellipse cx="470" cy="1060" rx="330" ry="240" transform="rotate(-42 470 1060)" fill="#b3a28a"/>
      <g fill="#f4ecdc">${[[380,900],[480,820],[560,960],[330,1060],[450,1120],[620,860],[250,1230],[390,1250]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14"/>`).join("")}</g>
      <g fill="#3a2d22">${[[410,930],[510,850],[590,990],[360,1090],[480,1150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join("")}</g>
      <ellipse cx="1060" cy="790" rx="235" ry="390" fill="#f7f1e6"/>
      <g fill="#8a6a4a">${[[980,640],[1080,700],[1000,820],[1110,880],[1020,980],[1150,760]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10"/>`).join("")}</g>
      <path d="M1080 110 Q950 10 885 150 Q870 330 1080 450 Q1290 330 1275 150 Q1210 10 1080 110 Z" fill="#fbf8f2" stroke="#b07a45" stroke-width="22"/>
      <polygon points="700,1150 1110,1150 1110,1400 700,1400" fill="#efe6d6"/>
      <polygon points="600,1400 1200,1400 1200,1536 600,1536" fill="#4a4038"/>`,
    overlay: `
      <circle cx="1005" cy="235" r="34" fill="#1a120c"/><circle cx="1017" cy="222" r="11" fill="#fff"/>
      <circle cx="1155" cy="235" r="34" fill="#1a120c"/><circle cx="1167" cy="222" r="11" fill="#fff"/>
      <g class="lid" fill="#fbf8f2"><circle cx="1005" cy="235" r="36"/><circle cx="1155" cy="235" r="36"/></g>
      <path d="M1080 270 Q1095 320 1080 360 Q1065 320 1080 270 Z" fill="#e3cdb4"/>`,
  },

  // Downy Woodpecker, male: the artist drew its black-and-white pattern as cut-outs, so a
  // white backing, edged in the drawing's black for one clean outline, shows through them;
  // add the red patch on the back of the head.
  downy: {
    silhouette: "downy",
    underlay: `<path d="M605 70 L640 42 L720 24 L800 27 L880 47 L950 78 L1002 118 L1030 200 L1032 300 L1008 430 L958 640 L888 860 L760 1020 L620 1200 L420 1470 L270 1605 L235 1618 L205 1540 L215 1440 L262 1380 L306 1290 L315 1200 L322 1100 L315 1000 L296 900 L284 800 L292 700 L300 600 L345 500 L402 400 L516 300 L598 252 Z" fill="#f7f5f0" stroke="#161616" stroke-width="16" stroke-linejoin="round"/>`,
    layers: `
      <rect width="1044" height="1628" fill="#161616"/>
      <ellipse cx="985" cy="150" rx="75" ry="62" fill="#d8322b"/>`,
  },
} satisfies Record<string, Paint>;

export type PaintedBird = keyof typeof PAINTS;
