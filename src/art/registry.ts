/**
 * Every bird picture on the site, and who made it.
 *
 * Two kinds:
 *  - "painted": a PhyloPic silhouette (a person's drawing, public domain or CC BY) with
 *    flat colour added inside its outline — see src/art/paint.ts.
 *  - "image": artwork contributed by an artist. To add one: put the file (SVG, PNG or
 *    WebP, ideally square with a transparent background) in src/assets/art/, import it
 *    below, and swap the entry to `{ kind: "image", src, alt, credit }`. The page and the
 *    /credits/ page pick it up; nothing else needs to change.
 *
 * Credit is required for anything not public domain, and CC BY asks that changes be
 * noted — /credits/ does both from what is recorded here.
 */
import type { ImageMetadata } from "astro";
import type { PaintedBird } from "./paint";

export interface ArtistCredit {
  artist: string;
  /** e.g. "CC BY 4.0", or "Used with permission" */
  license: string;
  licenseUrl?: string;
  /** artist's page or the original work */
  source?: string;
}

export type Art =
  | { kind: "painted"; paint: PaintedBird }
  | { kind: "image"; src: ImageMetadata; alt: string; credit: ArtistCredit };

// Example, once an artist sends a hummingbird:
//   import annasHummingbird from "../assets/art/annas-hummingbird.webp";
//   hummingbird: { kind: "image", src: annasHummingbird, alt: "Anna's Hummingbird",
//     credit: { artist: "Jane Doe", license: "CC BY 4.0",
//       licenseUrl: "https://creativecommons.org/licenses/by/4.0/", source: "https://…" } },
export const ART = {
  hummingbird: { kind: "painted", paint: "hummingbird" },
  heron: { kind: "painted", paint: "heron" },
  robin: { kind: "painted", paint: "robin" },
  owl: { kind: "painted", paint: "owl" },
  downy: { kind: "painted", paint: "downy" },
} satisfies Record<string, Art>;

export type ArtId = keyof typeof ART;
