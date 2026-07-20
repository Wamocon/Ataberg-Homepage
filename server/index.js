/**
 * Static server for dist/ plus the grounded assistant endpoint.
 *
 * This exists rather than a Vite preview plugin because the assistant needs a
 * real server in production regardless: AI_API_KEY must stay off the client, so
 * something server-side has to hold it. Running the same process in
 * verification and production means we test what we ship.
 *
 * To deploy inside Drupal instead, port aiMiddleware() to a controller — the
 * retrieval and prompt logic is framework-agnostic on purpose.
 */
import 'dotenv/config';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aiMiddleware } from './ai.js';

const ROOT = fileURLToPath(new URL('../dist', import.meta.url));
const PORT = Number(process.env.PORT || 4173);
const ai = aiMiddleware();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

createServer((req, res) => {
  ai(req, res, async () => {
    try {
      const url = new URL(req.url, 'http://x');
      // normalize + prefix check: never serve outside dist/
      let p = normalize(join(ROOT, decodeURIComponent(url.pathname)));
      if (!p.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }

      let s = await stat(p).catch(() => null);
      if (s?.isDirectory()) { p = join(p, 'index.html'); s = await stat(p).catch(() => null); }
      // SPA-ish fallback so deep links render the homepage rather than 404.
      if (!s) { p = join(ROOT, 'index.html'); s = await stat(p).catch(() => null); }
      if (!s) { res.writeHead(404).end('Not found'); return; }

      const ext = extname(p);
      const body = await readFile(p);
      res.writeHead(200, {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Content-Length': body.length,
        // Hashed assets are immutable; HTML must revalidate or deploys stick.
        'Cache-Control': p.includes('assets') || p.includes('/img/') || p.includes('/fonts/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      });
      res.end(body);
    } catch {
      res.writeHead(500).end('Server error');
    }
  });
}).listen(PORT, () => {
  const ok = Boolean(process.env.AI_API_KEY && process.env.AI_API_URL);
  console.log(`  serving dist/ on http://localhost:${PORT}`);
  console.log(`  assistant: ${ok ? 'configured' : 'NOT configured (set AI_API_URL / AI_API_KEY in .env)'}`);
});
