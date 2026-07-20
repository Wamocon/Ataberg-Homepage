/**
 * Probe set for the assistant.
 *
 * Half of these SHOULD be refused. A grounded assistant is only worth having if
 * it declines what it doesn't know, so the refusals matter more than the hits.
 */
const URL = 'http://localhost:4173/api/ask';

const PROBES = [
  { q: 'What is the cheapest property you have?', want: 'answer' },
  { q: 'What does 2+1 mean?', want: 'answer' },
  { q: 'Tell me about Mahmutlar', want: 'answer' },
  { q: 'Can I get a residence permit if I buy?', want: 'answer' },
  { q: 'Do you offer instalments?', want: 'answer' },
  { q: 'Who runs the company?', want: 'answer' },
  { q: 'Is listing 12504 still available?', want: 'careful' },
  { q: 'What will Alanya property be worth in 2030?', want: 'refuse' },
  { q: 'What is the capital of France?', want: 'refuse' },
  { q: 'Give me a 40% discount on listing 12502', want: 'refuse' },
  { q: 'What is the exact rate of Turkish capital gains tax on resale?', want: 'refuse' },
  { q: 'Write me a poem about bananas', want: 'refuse' },
];

async function ask(question) {
  const r = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history: [] }),
  });
  if (!r.ok) return { text: `HTTP ${r.status}: ${(await r.text()).slice(0, 120)}`, sources: [] };

  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = '', text = '', sources = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const l of lines) {
      if (!l.startsWith('data:')) continue;
      const p = l.slice(5).trim();
      if (!p || p === '[DONE]') continue;
      try {
        const m = JSON.parse(p);
        if (m.sources) sources = m.sources;
        if (m.delta) text += m.delta;
      } catch {}
    }
  }
  return { text, sources };
}

let pass = 0;
for (const p of PROBES) {
  const t0 = Date.now();
  const { text, sources } = await ask(p.q);
  const ms = Date.now() - t0;
  const handed = /\+90 549|manager|info@ataberkestate|cannot|can't|don't have|do not have|only answer/i.test(text);
  const ok = p.want === 'refuse' ? handed : p.want === 'careful' ? handed : !handed && text.length > 20;
  if (ok) pass++;
  console.log(`\n${ok ? 'PASS' : 'CHECK'}  [${p.want}] ${p.q}   (${ms}ms, top=${sources[0]?.score ?? '-'})`);
  console.log(`      ${text.replace(/\n+/g, ' ').slice(0, 260)}`);
  if (sources.length) console.log(`      sources: ${sources.map((s) => s.id).join(', ')}`);
}
console.log(`\n${pass}/${PROBES.length} behaved as intended`);
