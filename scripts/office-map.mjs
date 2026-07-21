/**
 * Capture a real, premium static map of the Alanya office and encode it as a
 * LOCAL responsive asset — so the site keeps its offline guarantee (no tile
 * calls at runtime) while still showing a genuine map.
 *
 * Renders Leaflet + CARTO "Positron" (a clean, light basemap that suits the
 * warm editorial theme) in headless Chromium, screenshots the office at retina
 * scale, then downscales to webp/avif/jpg. The pin is NOT baked in — the site
 * overlays its own animated terracotta pin dead-centre, and the map is centred
 * on the office, so the pin is accurate.
 *
 * Coordinates resolved from the company's own Google Maps link
 * (maps.app.goo.gl/ry9JpmXuPwenhFiu7 -> @36.5563221,31.977053).
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const LAT = 36.5563221;
const LNG = 31.977053;
const ZOOM = 15;
const OUT = 'public/img';
const RAW = 'raw/orig/office-map.png';

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#m{margin:0;height:100%;width:100%;background:#eee}</style>
</head><body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('m', { zoomControl: false, attributionControl: false, keyboard: false, dragging: false })
    .setView([${LAT}, ${LNG}], ${ZOOM});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 20, subdomains: 'abcd', detectRetina: true,
  }).addTo(map);
  window.__tiles = { loaded: 0, total: 0 };
  map.eachLayer((l) => {
    if (l.on) {
      l.on('tileload', () => window.__tiles.loaded++);
      l.on('loading', () => { window.__tiles.total = 999; });
    }
  });
</script></body></html>`;

await mkdir(path.dirname(RAW), { recursive: true });
await mkdir(OUT, { recursive: true });

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: 'networkidle' });
// Positron tiles paint fast, but give them a beat to settle at retina.
await p.waitForTimeout(3500);
await p.locator('#m').screenshot({ path: RAW });
await b.close();

const src = await readFile(RAW);
const meta = await sharp(src).metadata();
console.log(`captured ${meta.width}x${meta.height}`);

for (const w of [640, 1024, 1600]) {
  const base = sharp(src).resize(w, null, { withoutEnlargement: true });
  await base.clone().webp({ quality: 82 }).toFile(path.join(OUT, `office-map-${w}.webp`));
  await base.clone().avif({ quality: 60, effort: 6 }).toFile(path.join(OUT, `office-map-${w}.avif`));
}
await sharp(src).resize(1600, null, { withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, 'office-map-1600.jpg'));
console.log('encoded office-map 640/1024/1600 (webp+avif) + jpg');
