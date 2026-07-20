/**
 * Grounded RAG endpoint for the assistant.
 *
 * Runs server-side for one non-negotiable reason: AI_API_KEY must never reach
 * the browser. An OpenAI-compatible key in client JS is visible in devtools to
 * anyone who opens the page, and is billable. Everything here — key, KB index,
 * model choice, prompt — stays on the server. The client sends a question and
 * receives tokens.
 */
import { readFile } from 'node:fs/promises';
import { SYSTEM_PROMPT } from './kb.js';

const cfg = () => ({
  url: process.env.AI_API_URL,
  key: process.env.AI_API_KEY,
  path: process.env.AI_CHAT_COMPLETIONS_PATH || '/chat/completions',
  fast: process.env.AI_MODEL_FAST || 'sokrates-fast',
  pro: process.env.AI_MODEL_PRO || 'sokrates-pro',
  reasoning: process.env.AI_MODEL_REASONING || 'qwen3.6-35b',
});

let INDEX = null;
async function index() {
  if (!INDEX) {
    const raw = await readFile(new URL('./kb-index.json', import.meta.url), 'utf8');
    INDEX = JSON.parse(raw);
    // Pre-normalise so retrieval is a dot product rather than a full cosine
    // per chunk per request.
    for (const c of INDEX.chunks) {
      const n = Math.hypot(...c.v);
      c.v = c.v.map((x) => x / n);
    }
  }
  return INDEX;
}

async function embed(text) {
  const c = cfg();
  const r = await fetch(`${c.url}/embeddings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'embedding', input: text }),
  });
  if (!r.ok) throw new Error(`embeddings ${r.status}`);
  return (await r.json()).data[0].embedding;
}

/**
 * Hybrid retrieval: dense vectors, plus an exact lexical hook for listing IDs.
 *
 * Vectors alone fail on reference numbers. Measured: "listing 12502" retrieved
 * 12505/12504/12506 and the model then answered "I do not have any information
 * regarding a listing with reference 12502" — for a listing that exists. A
 * confident denial of your own stock is worse than a refusal, so any ID the
 * user names is pinned into the context regardless of cosine score.
 */
async function retrieve(q, k = 4) {
  const idx = await index();
  const qv = await embed(q);
  const n = Math.hypot(...qv);
  const u = qv.map((x) => x / n);

  const scored = idx.chunks
    .map((c) => {
      let s = 0;
      for (let i = 0; i < u.length; i++) s += u[i] * c.v[i];
      return { id: c.id, title: c.title, url: c.url, text: c.text, score: s };
    })
    .sort((a, b) => b.score - a.score);

  const ids = [...new Set(q.match(/\b\d{4,6}\b/g) || [])];
  const pinned = [];
  for (const id of ids) {
    const hit = scored.find((c) => c.id === `listing-${id}`);
    if (hit) pinned.push({ ...hit, pinned: true, score: Math.max(hit.score, FLOOR + 0.01) });
  }

  const rest = scored.filter((c) => !pinned.some((p) => p.id === c.id));
  return [...pinned, ...rest].slice(0, Math.max(k, pinned.length + 2));
}

/**
 * Relevance floor. Below this the KB genuinely has nothing to say, and we would
 * rather hand over to a human than let the model improvise from four unrelated
 * chunks. Tuned against the probe set in scripts/ask.mjs.
 */
const FLOOR = 0.35;

/** Hand-over copy for the below-the-floor path, which never sees the model. */
const REFUSE = {
  tr: "Yalnızca Ataberk'in kendi ilanlarına ve sayfalarına göre yanıt verebiliyorum ve bu konuda elimde bir şey yok. Bir danışman yardımcı olur. +90 549 557 7 557'yi arayın ya da WhatsApp'tan yazın, veya info@ataberkestate.com adresine e-posta gönderin.",
  en: "I can only answer from Ataberk's own listings and pages, and I don't have anything on that. A manager will know. Call or WhatsApp +90 549 557 7 557, or email info@ataberkestate.com.",
  ru: 'Я отвечаю только по данным сайта Ataberk, и по этому вопросу у меня ничего нет. Менеджер подскажет. Позвоните или напишите в WhatsApp: +90 549 557 7 557, либо на info@ataberkestate.com.',
  pl: 'Odpowiadam wyłącznie na podstawie danych Ataberk i nie mam nic na ten temat. Doradca będzie wiedział. Proszę zadzwonić lub napisać na WhatsApp: +90 549 557 7 557, albo na info@ataberkestate.com.',
};

const readBody = (req) =>
  new Promise((res, rej) => {
    let d = '';
    req.on('data', (c) => {
      d += c;
      if (d.length > 8000) req.destroy(); // no essays
    });
    req.on('end', () => res(d));
    req.on('error', rej);
  });

export function aiMiddleware() {
  return async (req, res, next) => {
    if (!req.url.startsWith('/api/ask') || req.method !== 'POST') return next();

    const send = (code, obj) => {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(obj));
    };

    try {
      const c = cfg();
      if (!c.url || !c.key) return send(500, { error: 'AI is not configured on this server.' });

      const { question, history = [], lang = 'en' } = JSON.parse((await readBody(req)) || '{}');
      if (!question || typeof question !== 'string' || question.length > 600) {
        return send(400, { error: 'Ask a question of up to 600 characters.' });
      }

      const hits = await retrieve(question);
      const top = hits[0]?.score ?? 0;

      // Nothing relevant — answer deterministically. Do not spend a model call
      // to have it improvise a refusal.
      if (top < FLOOR) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        res.write(`data: ${JSON.stringify({ sources: [] })}\n\n`);
        // This path never reaches the model, so the refusal has to be written
        // in the visitor's language here — otherwise a Russian speaker asking
        // something off-topic gets turned away in English.
        res.write(`data: ${JSON.stringify({ delta: REFUSE[lang] || REFUSE.en })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      const sources = hits.map((h) => ({ id: h.id, title: h.title, url: h.url, score: Number(h.score.toFixed(3)) }));
      const context = hits.map((h) => `[${h.id}] ${h.title}\n${h.text}`).join('\n\n---\n\n');

      // Open the stream and ship sources the moment retrieval is done, rather
      // than after the model replies. Retrieval finishes seconds before the
      // first token (measured: sources ready at ~2s, first token at ~2–10s), so
      // holding them back wastes the only fast part of the pipeline. The client
      // shows what it is reading while the model works.
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write(`data: ${JSON.stringify({ sources })}\n\n`);

      // Only the last two turns: enough for "and in Oba?" to resolve, short
      // enough that the model cannot drift away from the retrieved sources.
      const turns = history
        .slice(-4)
        .filter((m) => m && typeof m.content === 'string' && ['user', 'assistant'].includes(m.role))
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

      const upstream = await fetch(`${c.url}${c.path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: c.fast,
          stream: true,
          temperature: 0.2, // grounded Q&A; creativity here is a defect
          max_tokens: 400,
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}

The visitor is browsing the site in ${{ en: 'English', ru: 'Russian', pl: 'Polish' }[lang] || 'English'}. Answer in that language unless they clearly write in another one.` },
            ...turns,
            { role: 'user', content: `SOURCES:\n\n${context}\n\n---\n\nQUESTION: ${question}` },
          ],
        }),
      });

      // Headers are already sent, so failures have to travel as stream events.
      if (!upstream.ok || !upstream.body) {
        res.write(`data: ${JSON.stringify({
          delta: `The assistant is unavailable right now (${upstream.status}). Please call or WhatsApp +90 549 557 7 557.`,
        })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      const reader = upstream.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const p = line.slice(5).trim();
          if (!p || p === '[DONE]') continue;
          try {
            const d = JSON.parse(p).choices?.[0]?.delta?.content;
            if (d) res.write(`data: ${JSON.stringify({ delta: d })}\n\n`);
          } catch { /* upstream keepalive or partial frame */ }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (e) {
      if (!res.headersSent) send(500, { error: 'Something went wrong reaching the assistant.' });
      else res.end();
    }
  };
}
