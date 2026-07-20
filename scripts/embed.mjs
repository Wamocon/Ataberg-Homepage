/**
 * Build-time embedding index for the assistant's knowledge base.
 *
 * Runs once at build, not per-request: the KB only changes when we change it,
 * and embedding 21 chunks on every question would add latency and cost for a
 * result that is byte-identical every time.
 */
import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { CHUNKS } from '../server/kb.js';

const { AI_API_URL, AI_API_KEY } = process.env;
if (!AI_API_URL || !AI_API_KEY) {
  console.error('Missing AI_API_URL / AI_API_KEY. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

async function embed(input) {
  const r = await fetch(`${AI_API_URL}/embeddings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'embedding', input }),
  });
  if (!r.ok) throw new Error(`embeddings ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return j.data[0].embedding;
}

console.log(`Embedding ${CHUNKS.length} chunks…`);
const out = [];
for (const c of CHUNKS) {
  // Title carries real signal ("Mahmutlar district") that the body sometimes
  // only implies, so embed both together.
  const v = await embed(`${c.title}\n\n${c.text}`);
  out.push({ id: c.id, title: c.title, url: c.url, text: c.text, v });
  process.stdout.write('.');
}
console.log();

const dims = out[0].v.length;
if (!out.every((c) => c.v.length === dims)) throw new Error('inconsistent embedding dims');

await writeFile('server/kb-index.json', JSON.stringify({ dims, model: 'embedding', built: new Date().toISOString(), chunks: out }));
console.log(`Wrote server/kb-index.json — ${out.length} chunks, ${dims} dims`);
