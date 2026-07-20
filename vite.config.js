import { defineConfig } from 'vite';
import 'dotenv/config';
import { aiMiddleware } from './server/ai.js';
import { SLOTS } from './src/render.js';

/**
 * Two plugins.
 *
 * prerender — renders the tabs, cards, articles, footer and search filters into
 * index.html at build time. They used to be injected by client JS, which cost
 * 0.5088 CLS on a throttled phone because ~90 elements landed after first paint.
 * As a bonus the page's content now works with JavaScript disabled.
 *
 * ai (dev only) — mounts the assistant endpoint. Preview and production are
 * served by server/index.js, which holds the same middleware. The key must stay
 * server-side, so a static preview cannot answer questions on its own.
 */
const prerender = () => ({
  name: 'ataberk-prerender',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      let out = html;
      for (const [slot, markup] of Object.entries(SLOTS())) {
        if (!out.includes(slot)) throw new Error(`prerender: slot ${slot} missing from index.html`);
        out = out.replace(slot, markup);
      }
      // Strip HTML comments from the shipped file. They are developer notes
      // (some with em dashes), useful in source but pointless in the payload and
      // visible to anyone who views source. Runs after slot filling so it never
      // eats a placeholder. Keeps the two schema/ld+json script blocks intact.
      out = out.replace(/<!--[\s\S]*?-->/g, '');
      return out;
    },
  },
});

const ai = () => ({
  name: 'ataberk-ai-dev',
  configureServer: (s) => { s.middlewares.use(aiMiddleware()); },
});

export default defineConfig({
  plugins: [prerender(), ai()],
  build: { target: 'es2022' },
});
