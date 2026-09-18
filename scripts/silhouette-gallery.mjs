// Builds a browsable contact sheet of every reuse-friendly PhyloPic silhouette for birds
// Birds Connect Seattle talks about, to choose from before adding one to
// scripts/fetch-silhouettes.mjs. Writes .cache/silhouette-gallery.html and opens it.
//
// Only public-domain and CC BY images are shown (NC/SA are filtered out). Where PhyloPic
// has nothing for a species, the genus is searched instead and the result is marked as a
// stand-in, since a relative's silhouette is not the bird itself.
import fs from "node:fs";
import { execFile } from "node:child_process";

const BUILD = 557;
const ALLOWED = /creativecommons\.org\/(publicdomain\/(zero|mark)\/1\.0|licenses\/by\/\d\.\d)\/?$/;

const GROUPS = {
  Owls: [
    ["Great Horned Owl", "Bubo virginianus"], ["Barred Owl", "Strix varia"],
    ["Barn Owl", "Tyto alba"], ["Western Screech-Owl", "Megascops kennicottii"],
    ["Northern Saw-whet Owl", "Aegolius acadicus"], ["Snowy Owl", "Bubo scandiacus"],
    ["Short-eared Owl", "Asio flammeus"], ["Long-eared Owl", "Asio otus"],
    ["Northern Pygmy-Owl", "Glaucidium gnoma"], ["Spotted Owl", "Strix occidentalis"],
    ["Burrowing Owl", "Athene cunicularia"],
  ],
  Raptors: [
    ["Bald Eagle", "Haliaeetus leucocephalus"], ["Osprey", "Pandion haliaetus"],
    ["Red-tailed Hawk", "Buteo jamaicensis"], ["Cooper's Hawk", "Accipiter cooperii"],
    ["Peregrine Falcon", "Falco peregrinus"], ["Merlin", "Falco columbarius"],
    ["American Kestrel", "Falco sparverius"], ["Turkey Vulture", "Cathartes aura"],
  ],
  "Water & shore": [
    ["Great Blue Heron", "Ardea herodias"], ["Mallard", "Anas platyrhynchos"],
    ["Bufflehead", "Bucephala albeola"], ["Hooded Merganser", "Lophodytes cucullatus"],
    ["Common Merganser", "Mergus merganser"], ["Wood Duck", "Aix sponsa"],
    ["American Wigeon", "Mareca americana"], ["Canada Goose", "Branta canadensis"],
    ["Double-crested Cormorant", "Nannopterum auritum"], ["Pied-billed Grebe", "Podilymbus podiceps"],
    ["Common Loon", "Gavia immer"], ["Pigeon Guillemot", "Cepphus columba"],
    ["Rhinoceros Auklet", "Cerorhinca monocerata"], ["Tufted Puffin", "Fratercula cirrhata"],
    ["Glaucous-winged Gull", "Larus glaucescens"], ["Caspian Tern", "Hydroprogne caspia"],
    ["Killdeer", "Charadrius vociferus"], ["Black Oystercatcher", "Haematopus bachmani"],
    ["Belted Kingfisher", "Megaceryle alcyon"], ["American Coot", "Fulica americana"],
    ["Harlequin Duck", "Histrionicus histrionicus"], ["Surf Scoter", "Melanitta perspicillata"],
  ],
  "Yard, park & forest": [
    ["Anna's Hummingbird", "Calypte anna"], ["Rufous Hummingbird", "Selasphorus rufus"],
    ["Black-capped Chickadee", "Poecile atricapillus"], ["Chestnut-backed Chickadee", "Poecile rufescens"],
    ["Steller's Jay", "Cyanocitta stelleri"], ["California Scrub-Jay", "Aphelocoma californica"],
    ["American Crow", "Corvus brachyrhynchos"], ["Common Raven", "Corvus corax"],
    ["Dark-eyed Junco", "Junco hyemalis"], ["American Robin", "Turdus migratorius"],
    ["Varied Thrush", "Ixoreus naevius"], ["Swainson's Thrush", "Catharus ustulatus"],
    ["Bushtit", "Psaltriparus minimus"], ["Song Sparrow", "Melospiza melodia"],
    ["White-crowned Sparrow", "Zonotrichia leucophrys"], ["Spotted Towhee", "Pipilo maculatus"],
    ["Bewick's Wren", "Thryomanes bewickii"], ["Pacific Wren", "Troglodytes pacificus"],
    ["Red-breasted Nuthatch", "Sitta canadensis"], ["Brown Creeper", "Certhia americana"],
    ["Golden-crowned Kinglet", "Regulus satrapa"], ["Cedar Waxwing", "Bombycilla cedrorum"],
    ["House Finch", "Haemorhous mexicanus"], ["American Goldfinch", "Spinus tristis"],
    ["Pine Siskin", "Spinus pinus"], ["Evening Grosbeak", "Coccothraustes vespertinus"],
    ["Black-headed Grosbeak", "Pheucticus melanocephalus"], ["Western Tanager", "Piranga ludoviciana"],
    ["Yellow-rumped Warbler", "Setophaga coronata"], ["Wilson's Warbler", "Cardellina pusilla"],
    ["Violet-green Swallow", "Tachycineta thalassina"], ["Barn Swallow", "Hirundo rustica"],
    ["Red-winged Blackbird", "Agelaius phoeniceus"], ["Band-tailed Pigeon", "Patagioenas fasciata"],
    ["Northern Flicker", "Colaptes auratus"], ["Downy Woodpecker", "Dryobates pubescens"],
    ["Hairy Woodpecker", "Dryobates villosus"], ["Pileated Woodpecker", "Dryocopus pileatus"],
    ["Red-breasted Sapsucker", "Sphyrapicus ruber"],
  ],
};

async function getJson(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(url);
      if (r.status === 404) return {}; // PhyloPic answers "no matches" with a 404
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return await r.json();
    } catch (e) {
      if (attempt >= 2) throw e;
      await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
    }
  }
}

async function search(name) {
  const j = await getJson(
    `https://api.phylopic.org/images?build=${BUILD}&filter_name=${encodeURIComponent(name.toLowerCase())}&embed_items=true&page=0`,
  );
  return (j._embedded?.items ?? []).filter((i) => ALLOWED.test(i._links.license?.href ?? ""));
}

async function toCard(item) {
  const svg = await (await fetch(item._links.vectorFile.href)).text();
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 100 100";
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<metadata>[\s\S]*?<\/metadata>/, "")
    .replace(/fill="#000000"/g, 'fill="currentColor"');
  const license = item._links.license.href;
  return {
    uuid: item.uuid,
    node: item._links.specificNode?.title ?? "",
    license,
    licenseShort: /publicdomain/.test(license) ? "Public domain" : "CC BY — credit needed",
    attribution: item.attribution ?? "",
    svg: `<svg viewBox="${viewBox}" fill="currentColor" aria-hidden="true">${inner}</svg>`,
  };
}

// Small worker pool so ~90 species don't hammer the API all at once.
async function pool(tasks, n = 6) {
  const out = new Array(tasks.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < tasks.length) {
        const i = next++;
        out[i] = await tasks[i]();
      }
    }),
  );
  return out;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const sections = [];
let total = 0;
for (const [group, species] of Object.entries(GROUPS)) {
  const results = await pool(
    species.map(([common, sci]) => async () => {
      let items = await search(sci);
      let standIn = false;
      if (!items.length) {
        items = (await search(sci.split(" ")[0])).filter((i) => i._links.specificNode?.title !== sci);
        standIn = items.length > 0;
      }
      const cards = await Promise.all(items.slice(0, 8).map(toCard));
      process.stdout.write(".");
      return { common, sci, standIn, cards };
    }),
  );
  sections.push({ group, results });
  total += results.reduce((n, r) => n + r.cards.length, 0);
}
console.log(`\n${total} silhouettes`);

const cardHtml = (r, c) => `
  <figure class="card" data-search="${esc(`${r.common} ${r.sci} ${c.node}`.toLowerCase())}" data-license="${c.licenseShort.startsWith("Public") ? "pd" : "by"}">
    <div class="art">${c.svg}</div>
    <figcaption>
      ${r.standIn ? `<span class="warn">Stand-in: ${esc(c.node)}</span>` : c.node !== r.sci ? `<span class="node">${esc(c.node)}</span>` : ""}
      <span class="lic ${c.licenseShort.startsWith("Public") ? "pd" : "by"}">${esc(c.licenseShort)}</span>
      ${c.attribution ? `<span class="by">${esc(c.attribution)}</span>` : ""}
      <span class="links"><a href="https://www.phylopic.org/images/${c.uuid}" target="_blank" rel="noopener">PhyloPic ↗</a>
      <button type="button" data-uuid="${c.uuid}">Copy id</button></span>
    </figcaption>
  </figure>`;

const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PhyloPic bird silhouettes — BCS linktree</title>
<style>
  :root { --brand:#0a3c23; --sage:#7cc68d; --cream:#faf5f0; --pop:#e6ff55; --ink:#1c1c1c; --muted:#5f5d5b; }
  * { box-sizing: border-box; }
  body { margin:0; font:14px/1.4 system-ui, sans-serif; background:var(--cream); color:var(--ink); }
  header { position:sticky; top:0; z-index:2; background:var(--brand); color:#fff; padding:12px 16px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  header h1 { font-size:16px; margin:0 12px 0 0; }
  header input { flex:1 1 200px; padding:8px 10px; border-radius:8px; border:0; font:inherit; }
  header label { font-size:13px; color:var(--sage); display:flex; gap:6px; align-items:center; }
  .bg button { background:none; border:1px solid var(--sage); color:#fff; border-radius:999px; padding:4px 10px; cursor:pointer; font:inherit; font-size:12px; }
  .bg button[aria-pressed=true] { background:var(--pop); color:var(--brand); border-color:var(--pop); }
  main { padding:8px 16px 40px; max-width:1200px; margin:0 auto; }
  h2 { color:var(--brand); margin:28px 0 4px; }
  h3 { margin:18px 0 6px; font-size:15px; } h3 i { color:var(--muted); font-weight:400; }
  .none { color:var(--muted); font-style:italic; margin:0 0 6px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:10px; }
  .card { margin:0; background:#fff; border:1px solid #cfe8d5; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; }
  .art { height:130px; display:grid; place-items:center; padding:12px; color:var(--brand); background:var(--art-bg, #fff); }
  body.dark .art { --art-bg: var(--brand); color: var(--sage); }
  body.black .art { color:#111; }
  .art svg { max-width:100%; max-height:100%; width:100%; height:100%; }
  figcaption { padding:8px 10px; display:flex; flex-direction:column; gap:3px; font-size:12px; border-top:1px solid #eef5ef; }
  .lic { font-weight:600; } .lic.pd { color:#1f6b35; } .lic.by { color:#8a5a00; }
  .by, .node { color:var(--muted); } .warn { color:#a0331c; font-weight:600; }
  .links { display:flex; justify-content:space-between; align-items:center; margin-top:2px; }
  .links a { color:var(--brand); }
  .links button { font:inherit; font-size:11px; border:1px solid var(--sage); background:#fff; border-radius:6px; padding:2px 6px; cursor:pointer; }
  .owls h2::after { content:"  ← owl campaign"; font-size:13px; color:#8a5a00; font-weight:600; }
</style>
<header>
  <h1>PhyloPic bird silhouettes</h1>
  <input id="q" type="search" placeholder="Filter by name… (e.g. owl, heron, strix)">
  <label><input type="checkbox" id="pdonly"> Public domain only</label>
  <span class="bg">Preview on: <button type="button" data-bg="" aria-pressed="true">White</button> <button type="button" data-bg="dark" aria-pressed="false">Header green</button> <button type="button" data-bg="black" aria-pressed="false">Black</button></span>
</header>
<main>
<p>${total} images, all public domain or CC BY. <b>Stand-in</b> means PhyloPic has nothing for that species, so a relative from the same genus is shown. Use <b>Copy id</b>, then add it to <code>PICKS</code> in <code>scripts/fetch-silhouettes.mjs</code> and run <code>pixi run silhouettes</code>.</p>
${sections
  .map(
    ({ group, results }) => `<section class="${group === "Owls" ? "owls" : ""}"><h2>${esc(group)}</h2>
  ${results
    .map(
      (r) => `<div class="species"><h3>${esc(r.common)} <i>${esc(r.sci)}</i></h3>
    ${r.cards.length ? `<div class="grid">${r.cards.map((c) => cardHtml(r, c)).join("")}</div>` : `<p class="none">Nothing on PhyloPic with a reuse-friendly licence.</p>`}</div>`,
    )
    .join("")}</section>`,
  )
  .join("")}
</main>
<script>
  const q = document.getElementById("q"), pd = document.getElementById("pdonly");
  function filter() {
    const t = q.value.trim().toLowerCase();
    document.querySelectorAll(".card").forEach((c) => {
      c.hidden = (t && !c.dataset.search.includes(t) && !c.closest(".species").querySelector("h3").textContent.toLowerCase().includes(t)) || (pd.checked && c.dataset.license !== "pd");
    });
    document.querySelectorAll(".species").forEach((s) => {
      const cards = s.querySelectorAll(".card");
      s.hidden = cards.length ? [...cards].every((c) => c.hidden) : !!t && !s.textContent.toLowerCase().includes(t);
    });
  }
  q.addEventListener("input", filter); pd.addEventListener("change", filter);
  document.querySelectorAll(".bg button").forEach((b) => b.addEventListener("click", () => {
    document.body.className = b.dataset.bg;
    document.querySelectorAll(".bg button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-uuid]"); if (!b) return;
    await navigator.clipboard.writeText(b.dataset.uuid); b.textContent = "Copied!"; setTimeout(() => (b.textContent = "Copy id"), 1500);
  });
</script>`;

fs.mkdirSync(new URL("../.cache/", import.meta.url), { recursive: true });
const outFile = new URL("../.cache/silhouette-gallery.html", import.meta.url);
fs.writeFileSync(outFile, html);
console.log(`Wrote ${outFile.pathname}`);
if (!process.argv.includes("--no-open")) execFile("open", [outFile.pathname]);
