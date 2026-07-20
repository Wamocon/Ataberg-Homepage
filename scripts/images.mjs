/**
 * Build-time image pipeline.
 *
 * Encoding is deliberately ahead-of-time: AVIF costs up to ~50x JPEG CPU, so
 * doing this per-request would be indefensible. AVIF is skipped below ~5000px
 * because the HEIF header (~300B) eats the gain on thumbnails.
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SRC = 'raw/orig';
const OUT = 'public/img';

/** A live photo path -> the local file harvested from it. */
const local = (photo) => path.join(SRC, photo.replace(/^\/sites\/default\/files\//, '').replace(/\//g, '_'));

// Editorial picks for the descent + section art. Curated by eye from raw/sheet.jpg.
const PICKS = {
  'hero-coast': '2026-03_ataberkestate-d28-3.jpg',
  'hero-coast-2': '2026-03_ataberkestate-d28-2.jpg',
  'aerial-complex': '2026-03_ataberkestate-d28-1.jpg',
  'stage-towers': '2026-07_ataberkestate-d12-12.jpg',
  'stage-facade': '2026-07_ataberkestate-d12-11_3.jpg',
  'stage-pool': '2026-07_ataberkestate-d03-2_9.jpg',
};

const WIDTHS = [640, 1024, 1600, 1920];
const AVIF_MIN_PX = 5000;

// The hero is the LCP-adjacent element and a dense aerial cityscape — worst-case
// for any codec. It sits under a scrim, so it takes a harder squeeze than
// content images: q44/effort6 lands ~168KB vs ~251KB at q55.
const HERO = new Set(['hero-coast']);
const q = (name) => (HERO.has(name) ? { quality: 44, effort: 6 } : { quality: 55, effort: 4 });

async function emit(name, input, widths = WIDTHS) {
  if (!existsSync(input)) return { made: 0, missing: true };
  const meta = await sharp(input).metadata();
  let made = 0;

  // 51 covers fall back to the site's own 420px derivative because the Drupal
  // original 404s. Skipping every width above the source would emit NOTHING for
  // those and leave broken cards, so clamp to the source width instead and
  // always produce at least one file.
  const usable = [...new Set(widths.map((w) => Math.min(w, meta.width)))].sort((a, b) => a - b);

  for (const w of usable) {
    const base = sharp(input).resize(w, null, { withoutEnlargement: true });

    await base.clone().webp({ quality: 78 }).toFile(path.join(OUT, `${name}-${w}.webp`));
    made++;

    if (w * (w / (meta.width / meta.height)) >= AVIF_MIN_PX) {
      await base.clone().avif(q(name)).toFile(path.join(OUT, `${name}-${w}.avif`));
      made++;
    }

    // JPEG floor for the widest only — the <picture> last resort.
    const widest = Math.max(...widths.filter((x) => x <= meta.width));
    if (w === widest) {
      await base.clone().jpeg({ quality: 76, mozjpeg: true }).toFile(path.join(OUT, `${name}-${w}.jpg`));
      made++;
    }
  }
  return { made, missing: false };
}

await mkdir(OUT, { recursive: true });

console.log('Editorial art…');
for (const [name, src] of Object.entries(PICKS)) {
  const r = await emit(name, path.join(SRC, src));
  console.log(`  ${name.padEnd(16)} ${r.missing ? 'MISSING SOURCE' : r.made + ' files'}`);
}

// Listing covers. Cards render at most ~22rem wide, so 640/1024 is the whole
// useful range — encoding 1600 for a card would be waste we never serve.
const { LISTINGS } = await import('../src/listings.js');
const { listings } = JSON.parse(await import('node:fs').then((m) => m.promises.readFile('raw/original-listings.json', 'utf8')));
const photoOf = Object.fromEntries(listings.map((l) => [l.id, l.photos]));

/**
 * Listing covers.
 *
 * One size, no srcset. Cards render at ~352 CSS px, and 51 of the 32 covers'
 * source photos are the site's own 420px derivative (the Drupal originals 404).
 * A srcset advertising "640w" for a 420px file would lie to the browser's
 * candidate selection, so we ship a single cover per listing at up to 640px and
 * let the intrinsic size speak for itself. Retina is slightly soft on the
 * fallback covers — that is the source material, not the pipeline.
 */
console.log(`\nListing covers (${LISTINGS.length})…`);
let ok = 0;
const thin = [];
const missing = [];

// Ataberk lists some properties under two reference numbers with byte-identical
// photo sets (e.g. 12502/8611). Two identical cards side by side read as a bug,
// so we hash each chosen cover and, on a collision, walk that listing's own
// photos for a different frame of the same building. Honest (same property) and
// visually distinct.
const usedHashes = new Set();
const hashOf = (f) => createHash('md5').update(readFileSync(f)).digest('hex');

// Prefer the high-res cover harvested from each listing's detail page (the
// site's own og:image, 840-1200px) over the 420px homepage thumbnail. Same real
// photo, ~2.5x the resolution. Falls back to the thumbnail where the detail page
// 500s (see scripts/harvest-hires.mjs).
const hires = existsSync('raw/hires-map.json')
  ? JSON.parse(readFileSync('raw/hires-map.json', 'utf8'))
  : {};

for (const l of LISTINGS) {
  // High-res frames first (array of 850-1200px covers), then the 420px thumbs.
  // The dedup below walks this list, so a duplicate-reference-number pair can
  // each land a different high-res frame of the same building.
  const candidates = [
    ...(hires[l.id] || []).filter(existsSync),
    ...(photoOf[l.id] || []).map(local).filter(existsSync),
  ];
  if (!candidates.length) { missing.push(l.id); continue; }

  // Prefer the first frame whose pixels we have not already used as a cover.
  const src = candidates.find((f) => !usedHashes.has(hashOf(f))) || candidates[0];
  usedHashes.add(hashOf(src));

  const meta = await sharp(src).metadata();
  const w = Math.min(1024, meta.width); // hi-res covers support a retina 1024
  if (w < 640) thin.push(`${l.id}(${meta.width}px)`);

  // Cover-crop to the card's 3:2 so a wide 1.9:1 og:image never letterboxes.
  const base = sharp(src).resize(w, Math.round(w * 2 / 3), { fit: 'cover', position: 'attention' });
  await base.clone().webp({ quality: 78 }).toFile(path.join(OUT, `${l.img}.webp`));
  await base.clone().avif({ quality: 55, effort: 4 }).toFile(path.join(OUT, `${l.img}.avif`));
  ok++;
}
console.log(`  encoded ${ok}/${LISTINGS.length}`);
if (thin.length) console.log(`  below 640px (styled fallback): ${thin.length} — ${thin.slice(0, 6).join(', ')}${thin.length > 6 ? '…' : ''}`);
if (missing.length) console.error(`  ! NO photo for: ${missing.join(', ')}`);

const files = await readdir(OUT);
let total = 0;
const byExt = {};
for (const f of files) {
  const s = await stat(path.join(OUT, f));
  total += s.size;
  const e = path.extname(f);
  byExt[e] = (byExt[e] || 0) + s.size;
}
console.log('\nOn disk:');
for (const [e, b] of Object.entries(byExt)) console.log(`  ${e.padEnd(6)} ${(b / 1024).toFixed(0).padStart(6)} KB`);
console.log(`  TOTAL  ${(total / 1024 / 1024).toFixed(2)} MB across ${files.length} files (per-page load is a small subset)`);
