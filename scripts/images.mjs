/**
 * Build-time image pipeline.
 *
 * Encoding is deliberately ahead-of-time: AVIF costs up to ~50x JPEG CPU, so
 * doing this per-request would be indefensible. AVIF is skipped below ~5000px
 * because the HEIF header (~300B) eats the gain on thumbnails.
 */
import sharp from 'sharp';
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
for (const l of LISTINGS) {
  const photos = photoOf[l.id] || [];
  const src = photos.map(local).find(existsSync);
  if (!src) { missing.push(l.id); continue; }

  const meta = await sharp(src).metadata();
  const w = Math.min(640, meta.width);
  if (w < 640) thin.push(`${l.id}(${meta.width}px)`);

  const base = sharp(src).resize(w, null, { withoutEnlargement: true });
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
