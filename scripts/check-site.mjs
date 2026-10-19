#!/usr/bin/env node
// Post-build QA: broken internal links, missing SEO tags, invalid JSON-LD, duplicate titles.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(DIST);
const exists = (u) => {
  const p = u.split(/[?#]/)[0];
  if (p === '/' || p === '') return true;
  if (/^\/(go|api)\//.test(p)) return true;
  const f = path.join(DIST, p);
  return fs.existsSync(f + '.html') || (fs.existsSync(f) && fs.statSync(f).isFile()) || fs.existsSync(path.join(f, 'index.html'));
};
const problems = []; const titles = new Map(); let links = 0;
for (const f of files) {
  const rel = '/' + path.relative(DIST, f).replace(/\.html$/, '').replace(/index$/, '');
  const h = fs.readFileSync(f, 'utf8');
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (!title) problems.push(`${rel}: no <title>`);
  else if (rel !== '/404') titles.set(title, [...(titles.get(title) || []), rel]);
  const skip = ['/404', '/offline', '/saved', '/search'].includes(rel);
  if (!skip && (desc.length < 50 || desc.length > 170)) problems.push(`${rel}: description length ${desc.length}`);
  if (!/rel="canonical"/.test(h)) problems.push(`${rel}: no canonical`);
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${rel}: ${h1} <h1>`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { problems.push(`${rel}: bad JSON-LD`); } }
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) { links++; if (!exists(m[1].replace(/&amp;/g, '&'))) problems.push(`${rel}: broken link ${m[1]}`); }
}
for (const [t, ps] of titles) if (ps.length > 1) problems.push(`duplicate title "${t}" on ${ps.slice(0, 4).join(', ')}${ps.length > 4 ? '…' : ''}`);
console.log(`Checked ${files.length} pages, ${links} internal links.`);
if (problems.length) { console.log(problems.slice(0, 80).join('\n')); console.log(`${problems.length} problem(s)`); process.exitCode = 1; } else console.log('No problems found.');
