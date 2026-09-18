# BCS Linktree

One mobile-first page of Birds Connect Seattle links: the page the 3D-printed walk QR codes
point at, so the tags never need reprinting when links change. Sister site to
`bcs-calendar` and `bcs-birdweb`, and shares their brand tokens.

```
pixi run install     # npm dependencies
pixi run dev         # http://localhost:4321/
pixi run dev-lan     # same, reachable from a phone on your wifi
pixi run test-all    # astro check + Vitest + Playwright (iPhone/WebKit + Pixel/Chromium)
```
(First time running the browser suite: `pixi run install-browsers`.)

## Editing links
Everything is in `src/config/links.ts`. Order in that list is order on the page; `tier:
"primary"` gets the big coloured buttons.

## Referral tracking
Links to BCS forms (sign-in, donate, the owl campaign) carry
`ms=nextgen_linktree[_<event>]` for EveryAction and
`utm_source=nextgen_linktree&utm_medium=qr&utm_campaign=<event or nextgen_event>` for Google
Analytics. The event comes from `?src=` on the page address, or else from whichever
NextGen event is on in the BCS calendar right now (Tockify, fetched by the phone).

**[docs/TRACKING.md](docs/TRACKING.md)** is the guide for BCS staff: what each value means,
and how to filter for it in EveryAction and GA4. Code: `src/lib/referral.ts`,
`src/lib/activeEvent.ts`.

## Deploying
Live at **https://bcs.pedro.ai**, on GitHub Pages from
[EntilZha/bcs-links](https://github.com/EntilZha/bcs-links).

- Every push to `main` runs `.github/workflows/deploy.yml`: type-check, unit tests, the phone
  browser suite, then build and deploy. A failing test blocks the deploy.
- `public/CNAME` holds the domain; DNS is a CNAME record `bcs` → `entilzha.github.io` at
  Namecheap (pedro.ai's DNS host).

## Bird art
No AI-generated art: every bird is a person's work under an open licence, credited on
`/credits/` (linked from the footer), which is generated from `src/art/registry.ts`.

- **Today:** silhouettes from [PhyloPic](https://www.phylopic.org) (public domain or CC BY),
  used as a stencil with flat field-mark colours added inside the outline
  (`src/art/paint.ts`). `pixi run silhouettes` re-vendors them; it refuses NC/SA licences.
  Where PhyloPic lacks the species, a same-shape relative is used and named as such.
- **Adding an artist's piece:** drop the file in `src/assets/art/`, then change that bird's
  entry in `src/art/registry.ts` to `{ kind: "image", src, alt, credit }` (there is a
  commented example). It replaces the silhouette everywhere and appears on `/credits/`.
- **Browsing candidates:** `pixi run silhouette-gallery` opens a contact sheet of every
  usable PhyloPic silhouette for ~90 local species, owls first.

## Seeing it as a phone does
`pixi run dev`, then `pixi run mobile` opens a visible WebKit window emulating an iPhone 13
(`pixi run mobile -- "Pixel 7"` for Android).

