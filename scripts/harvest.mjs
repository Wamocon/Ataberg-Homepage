/**
 * Re-harvest listing photos, validating what we actually got.
 *
 * The first pass at this checked HTTP status codes and kept the body regardless
 * — so 51 of 154 "downloaded" files were 404 HTML pages wearing a .jpg
 * extension, and 5 were HEIC. Lesson: validate the bytes, not the status line.
 *
 * Strategy per photo:
 *   1. the Drupal original            (/sites/default/files/<path>) — best quality
 *   2. extension/case variants        (.jpg/.jpeg/.JPG/.png)
 *   3. the styled 420x280 derivative  — guaranteed to exist; it is what the
 *      live site actually renders, and it is exactly card-sized
 * Anything that still fails is reported, never silently skipped.
 */
import sharp from 'sharp';
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SRC = 'raw/orig';
const { listings } = JSON.parse(await readFile('raw/original-listings.json', 'utf8'));
const home = await readFile('raw/home.html', 'utf8');
const BASE = 'https://www.ataberkhomes.com';

const local = (p) => path.join(SRC, p.replace(/^\/sites\/default\/files\//, '').replace(/\//g, '_'));

/** Real image, or a 404 page in a trench coat? */
async function valid(file) {
  if (!existsSync(file)) return false;
  try {
    const m = await sharp(file).metadata();
    return Boolean(m.width && m.height);
  } catch {
    return false;
  }
}

async function grab(url, file) {
  try {
    const r = await fetch(url);
    if (!r.ok) return false;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1024) return false; // 404 bodies are ~220-280 bytes
    await writeFile(file, buf);
    if (await valid(file)) return true;
    await unlink(file).catch(() => {});
    return false;
  } catch {
    return false;
  }
}

/** The styled derivative for a given original path, lifted from the page HTML
 *  so we keep the ?itok= token — Drupal 404s image styles without it. */
function styledFor(photoPath) {
  const tail = photoPath.replace(/^\/sites\/default\/files\//, '');
  const esc = tail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = home.match(new RegExp(`data-lazy="([^"]*420x280[^"]*${esc}[^"]*)"`));
  return m ? m[1] : null;
}

await mkdir(SRC, { recursive: true });

let okOrig = 0, okStyled = 0, failed = [];
const report = [];

for (const l of listings) {
  const got = [];
  for (const photo of l.photos) {
    const file = local(photo);

    if (await valid(file)) { got.push(file); okOrig++; continue; }
    if (existsSync(file)) await unlink(file).catch(() => {}); // drop the 404 page

    // 2. extension / case variants
    let done = false;
    const stem = photo.replace(/\.[^.]+$/, '');
    const ext = photo.split('.').pop();
    for (const e of [ext, ext.toUpperCase(), 'jpg', 'jpeg', 'JPG', 'JPEG', 'png']) {
      if (await grab(`${BASE}${stem}.${e}`, file)) { got.push(file); okOrig++; done = true; break; }
    }
    if (done) continue;

    // 3. styled derivative — card-sized, but it definitely exists
    const styled = styledFor(photo);
    if (styled && (await grab(`${BASE}${styled}`, file))) { got.push(file); okStyled++; continue; }

    failed.push(photo);
  }
  report.push({ id: l.id, want: l.photos.length, got: got.length });
}

console.log(`originals   : ${okOrig}`);
console.log(`styled 420px: ${okStyled}   (fallback — card-sized, soft on retina)`);
console.log(`failed      : ${failed.length}`);

const dead = report.filter((r) => r.got === 0);
const thin = report.filter((r) => r.got > 0 && r.got < r.want);
console.log(`\nlistings with a usable cover: ${report.filter((r) => r.got > 0).length}/${report.length}`);
if (thin.length) console.log(`  partial photo sets: ${thin.map((r) => `${r.id}(${r.got}/${r.want})`).join(', ')}`);
if (dead.length) console.error(`  ! NO usable photo: ${dead.map((r) => r.id).join(', ')}`);
