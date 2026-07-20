/**
 * Harvest a high-resolution cover for each listing — the same REAL photo the
 * live site uses, just larger.
 *
 * The homepage only exposes 420x280 thumbnails. Each detail page declares its
 * canonical cover as og:image at 1200x630, and carries an 850x566_v2 derivative
 * of the same file (850x566 is ~3:2, exactly the card aspect). We take the
 * og:image as the anchor so we get the site's own chosen cover — distinct per
 * listing, which also settles the duplicate-reference-number pairs — and prefer
 * the 850x566 version, falling back to 1200x630.
 *
 * Writes raw/hires/<id>.webp and raw/hires-map.json.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const BASE = 'https://www.ataberkhomes.com';
// Some EN detail pages return HTTP 500; the same listings serve fine on the RU
// primary domain. Same files, same tokens (the derivative token is per-file, not
// per-domain), so a URL harvested from RU downloads happily from either host.
const HOSTS = ['https://www.ataberkhomes.com', 'https://www.ataberkestate.com'];
const { LISTINGS } = await import('../src/listings.js');
await mkdir('raw/hires', { recursive: true });

const baseFile = (url) => (url.match(/\/public\/(.+?)\.webp/) || [])[1]; // "2026-03/x.jpg"

async function download(url, file) {
  try {
    const abs = /^https?:\/\//.test(url) ? url : BASE + url;
    const r = await fetch(abs, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) return false;
    const buf = Buffer.from(await r.arrayBuffer());
    const meta = await sharp(buf).metadata();
    if (!meta.width || meta.width < 500) return false;
    await writeFile(file, buf);
    return meta.width;
  } catch {
    return false;
  }
}

const map = {};
const failed = [];

for (const l of LISTINGS) {
  let html = '';
  for (const host of HOSTS) {
    try {
      const r = await fetch(`${host}${l.href}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (r.ok) { html = await r.text(); break; }
    } catch { /* try next host */ }
  }

  const og = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  const ogBase = og && baseFile(og);
  if (!ogBase) { failed.push(l.id); process.stdout.write('x'); continue; }

  // Gallery, high-res: the og cover plus the other 850x566_v2 frames of the same
  // photo shoot. The shoot shares a stem — og "ataberkestate-1_39.jpg" sits with
  // "ataberkestate-2_..", "ataberkestate-3_..". Grabbing several gives the
  // duplicate-reference-number pairs a distinct high-res frame each, instead of
  // one falling back to the 420px thumb.
  const stem = ogBase.replace(/-\d+(_\d+)?\.[a-z]+$/i, ''); // ".../ataberkestate"
  const all = [...html.matchAll(/\/sites\/default\/files\/styles\/850x566_v2\/public\/([^"' )]+?)\.webp\?itok=[^"' )]+/g)];
  const ordered = [
    // the cover first (prefer its 850 form, else the 1200 og)
    (html.match(new RegExp(`/sites/default/files/styles/850x566_v2/public/${ogBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.webp\\?itok=[^"' )]+`)) || [og])[0],
    // then same-shoot frames, in page order
    ...all.filter((m) => m[1].startsWith(stem)).map((m) => m[0]),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);

  const files = [];
  let n = 0;
  for (const url of ordered) {
    const f = `raw/hires/${l.id}-${n}.webp`;
    if (existsSync(f) || (await download(url, f))) { files.push(f); n++; }
    if (n >= 4) break;
  }

  if (files.length) { map[l.id] = files; process.stdout.write('.'); }
  else { failed.push(l.id); process.stdout.write('x'); }
}

await writeFile('raw/hires-map.json', JSON.stringify(map, null, 1));
const got = Object.keys(map).length;
const frames = Object.values(map).reduce((s, a) => s + a.length, 0);
console.log(`\n\nhigh-res: ${got}/${LISTINGS.length} listings, ${frames} frames`);
if (failed.length) console.log(`  no hi-res (keeping the real 420px thumb): ${failed.join(', ')}`);
