/**
 * Depth-parallax 3D hero — raw WebGL, no framework.
 *
 * Turns the flat aerial into a living one: a fragment shader samples a depth map
 * and offsets the photo's UVs per-pixel, so near buildings parallax more than
 * the far sea as the pointer moves and the page scrolls. This is the "3D photo"
 * technique (Codrops / relief-mapping) — real depth cue, no 3D models, using
 * Ataberk's own photograph. Vignette + film grain ride in the same pass.
 *
 * Written against the raw WebGL context on purpose. The three.js version of this
 * cost 518 KB (130 KB gzip) as its own chunk — for a fullscreen quad with two
 * textures. Raw GL is the same effect in ~3 KB, and it is the same call I made
 * for the grain layer this replaces.
 *
 * Non-negotiables (ANALYSIS.md §4.5 + the perf notes):
 *   - The <img> underneath stays first paint / LCP. This canvas initialises
 *     AFTER load and fades in on top; if it never loads, the page is complete.
 *   - Gated on capability + prefers-reduced-motion — static image on mobile,
 *     low-power, save-data, touch-first, or no-WebGL.
 *   - Renders only while on screen and the tab is visible; rAF paused otherwise.
 */

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main(){ vUv = p*0.5+0.5; gl_Position = vec4(p,0.0,1.0); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2  uPointer;   // smoothed, -1..1
uniform float uStrength;  // parallax amount (grows on scroll)
uniform float uZoom;      // push into the frame on scroll
uniform float uTime;
uniform vec2  uImgAspect; // cover-fit correction
uniform float uVignette;

float hash(vec2 p){ p = fract(p*vec2(443.897,441.423)); p += dot(p,p.yx+19.19); return fract((p.x+p.y)*p.x); }

void main(){
  // object-fit: cover, then a subtle scroll-driven zoom toward the centre.
  vec2 uv = (vUv - 0.5) / uImgAspect / uZoom + 0.5;

  // Depth drives parallax: near (depth->1) shifts most, far (->0) barely.
  float depth = texture2D(uDepth, uv).r;

  // Auto-sway so it breathes even when the pointer is still.
  vec2 sway = vec2(sin(uTime*0.25), cos(uTime*0.19)) * 0.004;
  vec2 shift = (uPointer + sway) * uStrength * depth;

  // Micro chromatic split on the nearest layer for an extra depth cue. Kept
  // subtle on purpose — enough to read as depth, never as a glitch.
  float ca = depth * uStrength * 0.2;
  vec2 dir = normalize(uPointer + 0.0001);
  float r = texture2D(uImage, uv + shift + dir*ca).r;
  vec2  gb = texture2D(uImage, uv + shift).gb;
  vec3 col = vec3(r, gb.x, gb.y);

  // Vignette (squared shoulder) + faint grain.
  vec2 c = vUv - 0.5;
  float vig = clamp(1.0 - dot(c,c) * uVignette, 0.0, 1.0); vig *= vig;
  col *= mix(1.0, vig, 0.55);
  col += (hash(vUv*uZoom + uTime) - 0.5) * 0.03;

  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

/** Upload an already-loaded image as a clamped, non-mipmapped NPOT texture. */
function texture(gl, img) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  return t;
}

const load = (src) => new Promise((res, rej) => {
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = src;
});

export function initHero3d(canvas, viewport, imgEl) {
  if (!canvas || !viewport || !imgEl) return null;

  const nav = navigator;
  if (nav.connection?.saveData) return null;
  if ((nav.hardwareConcurrency || 4) < 4) return null;
  if (nav.deviceMemory && nav.deviceMemory < 4) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  // Pointer-driven and battery-costly — a phone gets the (excellent) flat photo.
  if (window.matchMedia('(hover: none)').matches || window.innerWidth < 900) return null;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch {
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n) => gl.getUniformLocation(prog, n);
  const u = {
    image: U('uImage'), depth: U('uDepth'), pointer: U('uPointer'),
    strength: U('uStrength'), zoom: U('uZoom'), time: U('uTime'),
    aspect: U('uImgAspect'), vignette: U('uVignette'),
  };
  gl.uniform1i(u.image, 0);
  gl.uniform1i(u.depth, 1);
  gl.uniform1f(u.vignette, 1.15);

  const IMG_ASPECT = 1600 / 914;
  const dpr = Math.min(window.devicePixelRatio, 1.75);
  const size = () => {
    const w = viewport.clientWidth, h = viewport.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
    // object-fit: cover. Viewport WIDER than the image → crop the sides (shrink
    // the sampled uv.x to a centred subset, full height). Narrower → crop top
    // and bottom. Getting this backwards samples past the texture edge and
    // CLAMP_TO_EDGE smears horizontal streaks — which is exactly what it did.
    const view = w / h;
    if (view > IMG_ASPECT) gl.uniform2f(u.aspect, view / IMG_ASPECT, 1);
    else gl.uniform2f(u.aspect, 1, IMG_ASPECT / view);
  };
  size();
  addEventListener('resize', size, { passive: true });

  // Pointer, smoothed toward the target each frame.
  const target = [0, 0];
  const cur = [0, 0];
  const onMove = (e) => {
    const r = viewport.getBoundingClientRect();
    target[0] = ((e.clientX - r.left) / r.width) * 2 - 1;
    target[1] = -(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  viewport.addEventListener('pointermove', onMove, { passive: true });
  viewport.addEventListener('pointerleave', () => { target[0] = 0; target[1] = 0; }, { passive: true });

  // Base overscan (zoom > 1 at rest) leaves margin so the parallax shift never
  // reaches the texture edge — belt and braces alongside the cover math above.
  const BASE_ZOOM = 1.06;
  let strength = 0.015, zoom = BASE_ZOOM;
  const setScroll = (p) => {
    const k = Math.min(1, Math.max(0, p));
    strength = 0.015 + k * 0.045;
    zoom = BASE_ZOOM + k * 0.12;
  };

  let live = false, raf = 0;
  const start = performance.now();
  const loop = () => {
    if (!live) return;
    cur[0] += (target[0] - cur[0]) * 0.06;
    cur[1] += (target[1] - cur[1]) * 0.06;
    gl.uniform1f(u.time, (performance.now() - start) / 1000);
    gl.uniform2f(u.pointer, cur[0], cur[1]);
    gl.uniform1f(u.strength, strength);
    gl.uniform1f(u.zoom, zoom);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(loop);
  };
  const play = (on) => { live = on; if (on) loop(); else cancelAnimationFrame(raf); };

  let onScreen = false;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; play(onScreen && !document.hidden); }, { threshold: 0 }).observe(viewport);
  document.addEventListener('visibilitychange', () => play(onScreen && !document.hidden));

  // A lost context (GPU reset, driver hiccup, backgrounded too long) must freeze
  // to the poster underneath, not leave a black rectangle over the hero.
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    live = false;
    canvas.style.opacity = '0';
  });

  // Load both textures, then fade the canvas in over the flat <img>.
  const imgURL = imgEl.currentSrc || imgEl.src;
  Promise.all([load(imgURL), load('/img/hero-coast-depth.webp')])
    .then(([image, depth]) => {
      gl.activeTexture(gl.TEXTURE0); texture(gl, image);
      gl.activeTexture(gl.TEXTURE1); texture(gl, depth);
      canvas.style.transition = 'opacity 1s ease';
      requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    })
    .catch(() => { /* the flat photo is a complete hero on its own */ });

  return {
    setScroll,
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', size); },
  };
}
