import { defineConfig } from 'vite';
import 'dotenv/config';
import { aiMiddleware } from './server/ai.js';
import { SLOTS } from './src/render.js';
import { makeT, DEFAULT_LANG } from './src/i18n.js';

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Localize the STATIC markup to the default language at build time, so the very
 * first paint is fully in the primary language (Turkish) with no client-side
 * swap or flash. Mirrors what applyLang() does at runtime for the other three:
 *   - data-i18n="key"       -> replace the element's first text run
 *   - data-i18n-attr="a:key" -> set attribute a on that element
 * English stays the source of truth in i18n.js; ru/pl/en swap in on demand.
 */
const localize = (html, lang) => {
  const t = makeT(lang);
  let out = html.replace(/(data-i18n="([^"]+)"[^>]*>)([^<]*)/g, (_m, open, key) => open + escapeHtml(t(key)));
  out = out.replace(/<([a-zA-Z][\w-]*)([^>]*\sdata-i18n-attr="([^:"]+):([^"]+)"[^>]*)>/g, (_m, tag, attrs, attr, key) => {
    const v = escapeHtml(t(key));
    const re = new RegExp(`(\\s${attr})="[^"]*"`);
    const a = re.test(attrs) ? attrs.replace(re, `$1="${v}"`) : `${attrs} ${attr}="${v}"`;
    return `<${tag}${a}>`;
  });
  return out;
};

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
      // Bake the primary language into the static markup (SLOTS already render in
      // it via render.js). English/Russian/Polish still swap in at runtime.
      if (DEFAULT_LANG !== 'en') out = localize(out, DEFAULT_LANG);
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
