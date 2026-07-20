# Ataberk Estate — homepage rebuild

A ground-up rebuild of the ataberkhomes.com homepage. Same company, same
persona, same claims, same photography — corrected English, a 2026 front end,
and a grounded assistant that answers only from Ataberk's own content.

**Read [ANALYSIS.md](ANALYSIS.md) first.** It carries the audit of the live
site, the Alanya competitor field, the success criteria, the measured results,
and — importantly — what is *not* established.

## Setup

```bash
npm install
cp .env.example .env      # fill in AI_API_URL / AI_API_KEY
npm run img               # encode AVIF/WebP/JPEG from raw/orig
npm run embed             # build the assistant's vector index
```

## Run

```bash
npm run dev               # http://localhost:5173 — Vite, assistant mounted
npm run preview           # build + serve on :4173 (what production looks like)
```

The assistant needs `npm run dev` or `npm run preview`, not a static file
server: the API key lives on the server and a static host cannot answer.

## Verify

With `npm run preview` running:

```bash
npm run perf              # LCP / CLS / bytes, desktop + throttled mobile
npm run ask               # 12-probe assistant test — half SHOULD be refused
npm run layout            # overflow / clipping / overlap / tap targets, 8 widths
npm run layout ru         # ...and again in Russian, which runs ~25% longer
npm run shots             # screenshots each section
```

`npm run layout` is the one that earns its keep — it found the header colliding
with the hero in Russian, the filter panel shipping permanently open, and tap
targets under 24px. It is also fallible: it exempted the header and ignored
`<select>`/`<svg>`, so a screenshot caught what it missed. **Look at the page.**

## Languages

English is prerendered into the HTML (so it survives with no JS); Russian and
Polish swap in on demand. ~170 UI strings live in `src/i18n.js`.

Listing titles are **not** machine-translated — they are lifted from Ataberk's
own RU/PL sites by `npm run i18n`, so buyers read the agency's own wording.
Coverage: **ru 32/32, pl 24/32**; the remaining 8 fall back to English because
their Polish site does not carry those listings. An English title is honest; a
machine-translated one would only look finished.

## Layout

```
index.html          markup, schema.org, preloads
src/styles.css      brand tokens, layout, motion
src/main.js         scroll rig, descent, rail, currency, form, assistant client
src/gl.js           raw-WebGL grain/vignette (lazy, capability-gated)
src/listings.js     the 8 real homepage listings + indicative FX rates
server/index.js     static server + API (production shape)
server/ai.js        retrieval + grounded chat — holds the key
server/kb.js        knowledge base + system prompt
scripts/            image pipeline, embedding, perf, probes, screenshots
raw/                harvested source assets (gitignored)
```

## Decisions worth knowing

- **The API key is server-side and must stay there.** An OpenAI-compatible key
  in client JS is public and billable. Verified across all 84 built files: no
  key, no upstream host, no KB index in `dist/`; the browser only ever calls
  `localhost`.
- **The assistant refuses by default.** Below a 0.35 relevance floor it declines
  without calling the model at all (322ms). It will not quote a law, a tax rate,
  a discount, or availability. Sources are linked so a person can check it.
- **Vector search cannot do reference numbers.** "listing 12502" originally
  retrieved the wrong listings and the model denied 12502 existed — for a
  listing that exists. Hybrid retrieval now pins any ID in the question.
  ANALYSIS.md §4.7.
- **The hero is real 3D — depth-displacement parallax.** A fragment shader
  samples a depth map of the aerial and offsets the photo's UVs per-pixel, so
  near buildings parallax more than the far sea under the pointer, and the frame
  pushes in as you scroll. It's the "3D photo" technique (Codrops/relief-mapping)
  on Ataberk's own photograph — no 3D models needed. Written in **raw WebGL
  (~2.5 KB gzip)**, not three.js: three.js cost 130 KB gzip for the same single
  shader. The chunk is lazy-imported (fetches *after* load, off the critical
  path), capability-gated (skipped on mobile, low-power, save-data, no-WebGL),
  and inert under `prefers-reduced-motion` — the flat photo carries those cases.
  The depth map is generated with no ML model: see `scripts/depthmap.mjs`.
  Measured: LCP unchanged at 104ms with the 3D on. See `src/hero3d.js`.
- **The descent below the hero is 2.5D.** Ataberk has no interior photography good
  enough to fly into — their interiors are unfurnished rooms and a kitchen
  mid-installation. The aerials are excellent, so the narrative descends from
  the Mediterranean into Alanya instead. ANALYSIS.md §7.
- **A full-bleed hero cannot be the LCP element.** Measured: Chromium excludes
  viewport-filling images from LCP. Our LCP is the H1, so the font is on the
  critical path and is self-hosted. ANALYSIS.md §4.5.
- **Three.js cost 130 KB gzip to draw a grain shader.** Rewritten in raw WebGL:
  1.4 KB. Same result.
- **`loading="lazy"` does not defer absolutely-positioned in-viewport images.**
  The descent stages were eagerly fetching 395 KB at opacity 0.
- **The page itself is offline.** No external requests. The assistant obviously
  needs the network.

## Deploying inside Drupal

`server/ai.js` is framework-agnostic on purpose. Port `aiMiddleware()` to a
Drupal controller and keep the key in Drupal's settings — the retrieval, prompt
and streaming logic move unchanged. The one rule that cannot bend: the key never
goes client-side.

## Not done

- **Section 3 of ANALYSIS.md is not researched.** Conversion benchmarks and
  which AI features actually convert are reasoned, not cited — that research run
  hit a session limit. Labelled in place. Do not show those numbers to a client.
- Contact form has no endpoint — it says so rather than faking success.
- Currency rates are dated constants, not a live feed.
- Only the homepage exists; other links point at live-site URLs.
- Interior photography: needs a shot list and a photographer, not code.
