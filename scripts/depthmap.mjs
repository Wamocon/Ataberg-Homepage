/**
 * Generate a plausible depth map for the hero aerial WITHOUT an ML model.
 *
 * The depth-displacement effect needs grayscale depth: white = near (parallaxes
 * most), black = far (barely moves). A monocular-depth network would be ideal,
 * but we don't have one locally — and for THIS shot a heuristic is genuinely
 * good enough, because the composition is a textbook depth ramp: shot from a
 * hill looking DOWN over Mahmutlar to the sea, so the horizon/sea sits at the
 * top (far) and the foreground buildings are at the bottom (near).
 *
 * Recipe (documented so the "magic" is inspectable):
 *   depth = 0.62 * verticalRamp        // bottom≈near, top≈far — the dominant cue
 *         + 0.30 * blurredLuminance     // bright rooftops read as nearer relief
 *         + 0.08 * localDetail          // a little micro-relief on structure
 * then a gentle blur so the displacement doesn't tear on hard edges.
 *
 * Output is a small (960px) single-channel-ish grayscale WebP — the shader only
 * samples the red channel, and a soft map compresses to a few KB.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'raw/orig/alanya-hero.jpg';
const OUT = 'public/img/hero-coast-depth.webp';
const W = 960;

await mkdir('public/img', { recursive: true });

const src = sharp(SRC).resize(W, null, { withoutEnlargement: true });
const meta = await src.clone().metadata();
const w = Math.min(W, meta.width);
const h = Math.round(w * (meta.height / meta.width));

// 1) Vertical ramp — bottom (near) bright, top (far) dark. Eased so the sea
//    band at the very top flattens to far rather than a linear fade.
const ramp = Buffer.alloc(w * h);
for (let y = 0; y < h; y++) {
  const tRaw = y / (h - 1); // 0 top .. 1 bottom
  // ease-in so the top third stays genuinely far, then rise toward the foreground
  const eased = Math.pow(tRaw, 1.35);
  const v = Math.round(eased * 255);
  ramp.fill(v, y * w, y * w + w);
}
const rampImg = sharp(ramp, { raw: { width: w, height: h, channels: 1 } });

// 2) Luminance, heavily blurred — soft large-scale "brighter = nearer" cue.
const lum = sharp(SRC)
  .resize(w, h, { fit: 'fill' })
  .grayscale()
  .blur(14)
  .normalise();

// 3) A touch of local structure so rooftops get micro-relief (mild blur only).
const detail = sharp(SRC).resize(w, h, { fit: 'fill' }).grayscale().blur(2.2);

const [rampPng, lumPng, detailPng] = await Promise.all([
  rampImg.png().toBuffer(),
  lum.png().toBuffer(),
  detail.png().toBuffer(),
]);

// Weighted blend via linear compositing: 0.62 ramp + 0.30 lum + 0.08 detail.
const blend = await sharp(rampPng)
  .composite([
    { input: await sharp(lumPng).ensureAlpha(0.38).png().toBuffer(), blend: 'over' },
    { input: await sharp(detailPng).ensureAlpha(0.12).png().toBuffer(), blend: 'over' },
  ])
  .grayscale()
  .blur(3)
  .linear(1.1, -8) // a little contrast so parallax has range
  .toBuffer();

const info = await sharp(blend).webp({ quality: 82 }).toFile(OUT);
console.log(`wrote ${OUT} — ${w}x${h}, ${(info.size / 1024).toFixed(1)} KB`);

// Preview strip: source | depth, so a human can sanity-check the map.
const strip = await sharp({ create: { width: w * 2 + 8, height: h, channels: 3, background: '#000' } })
  .composite([
    { input: await sharp(SRC).resize(w, h, { fit: 'fill' }).toBuffer(), left: 0, top: 0 },
    { input: await sharp(blend).toColourspace('srgb').toBuffer(), left: w + 8, top: 0 },
  ])
  .jpeg({ quality: 82 })
  .toFile('raw/depth-preview.jpg');
console.log(`preview: raw/depth-preview.jpg (${strip.width}x${strip.height})`);
