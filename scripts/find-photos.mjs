#!/usr/bin/env node
// Product photo candidates from Open Beauty Facts (openly licensed, CC BY-SA), for human review.
// Nothing goes on the site until you approve it.
//
//   node scripts/find-photos.mjs find sun-protection
//       searches each product in the category and writes
//       data/photo-candidates/sun-protection.json  (machine-readable)
//       data/photo-candidates/sun-protection.html  (review page with thumbnails, open in a browser)
//
//   node scripts/find-photos.mjs apply sun-protection 3a,7b
//       for each approved candidate id: downloads the photo to public/products/<slug>.jpg and adds
//       image + imageCredit to data/overrides.json. Then run node scripts/build.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDataset } from '../src/lib/dataset.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data/photo-candidates');
const UA = 'SensiThrive/0.1 (https://sensithrive.com)';
const API = 'https://world.openbeautyfacts.org/cgi/search.pl';
const LICENCE = 'CC BY-SA 3.0';
const LICENCE_URL = 'https://creativecommons.org/licenses/by-sa/3.0/';
const DELAY = 6500; // Open Beauty Facts asks for at most ~10 search requests a minute
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const STOP = new Set(['the', 'and', 'for', 'with', 'of', 'a', 'an', 'by', 'in', 'to', 'natural', 'organic', 'organics']);
const words = (s) => (s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
const spf = (s) => (s || '').toLowerCase().match(/spf\s*(\d+)/)?.[1] || null;

const FIELDS = 'code,product_name,brands,image_front_url,url';
async function get(u) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(u, { headers: { 'user-agent': UA } }).catch(() => null);
    if (r?.ok) return (await r.json()).products || [];
    await sleep(15000 * (attempt + 1));
  }
  throw new Error(`request failed: ${u}`);
}
// Whole-name searches need every word to match, so 2011 names rarely hit. Instead fetch each
// brand's catalogue once (by brand tag, then by plain brand search) and score locally.
const brandCache = new Map();
async function brandProducts(brand) {
  if (brandCache.has(brand)) return brandCache.get(brand);
  const tag = brand.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let list = await get(`https://world.openbeautyfacts.org/api/v2/search?brands_tags=${encodeURIComponent(tag)}&page_size=200&fields=${FIELDS}`);
  await sleep(DELAY);
  if (!list.length) {
    list = await get(`${API}?search_terms=${encodeURIComponent(brand)}&search_simple=1&json=1&page_size=100&fields=${FIELDS}`);
    await sleep(DELAY);
  }
  brandCache.set(brand, list);
  return list;
}

// How well does an Open Beauty Facts product match the guide's product?
function score(p, c) {
  const brandW = words(p.brand);
  const candBrand = words(c.brands);
  // the brand must be in the brand field itself, not just somewhere in the product name
  const brandOk = brandW.length && brandW.every((w) => candBrand.includes(w));
  const want = words(p.name).filter((w) => !brandW.includes(w));
  const have = new Set([...words(c.product_name), ...candBrand]);
  const overlap = want.length ? want.filter((w) => have.has(w)).length / want.length : 0;
  const s1 = spf(p.name), s2 = spf(c.product_name);
  const spfClash = s1 && s2 && s1 !== s2;
  // a sun product should look like one (avoids matching the same brand's moisturiser or gel)
  const SUN = /spf|sun|solar|solaire|soleil|screen|block|bloc|uv/i;
  const typeOk = !SUN.test(p.name) || SUN.test(c.product_name);
  let level = 'weak';
  if (brandOk && typeOk && !spfClash && overlap >= 0.75) level = 'strong';
  else if (brandOk && typeOk && overlap >= 0.4) level = 'possible';
  const notes = [];
  if (!brandOk) notes.push('brand differs');
  if (spfClash) notes.push(`SPF ${s2}, guide lists SPF ${s1}`);
  if (s1 && !s2) notes.push('no SPF in name');
  return { level, overlap: Math.round(overlap * 100), notes };
}

async function find(catSlug) {
  const d = await loadDataset();
  const cat = d.categoryMap.get(catSlug);
  if (!cat) throw new Error(`no category ${catSlug}`);
  const prods = [...new Map(cat.products.map((x) => [x.slug, x])).values()].map((x) => ({ ...d.productMap.get(x.slug), tier: x.tier }));
  const rank = { strong: 0, possible: 1, weak: 2 };
  const results = [];
  for (const [n, p] of prods.entries()) {
    process.stdout.write(`${n + 1}/${prods.length} ${p.name} … `);
    const hits = await brandProducts(p.brand);
    const cands = hits
      .filter((c) => c.image_front_url && c.product_name)
      .map((c) => ({ ...score(p, c), code: c.code, name: c.product_name, brands: c.brands, image: c.image_front_url, url: c.url }))
      .filter((c) => c.level !== 'weak')
      .sort((a, b) => rank[a.level] - rank[b.level] || b.overlap - a.overlap)
      .slice(0, 3)
      .map((c, i) => ({ id: `${n + 1}${'abc'[i]}`, ...c }));
    results.push({ n: n + 1, slug: p.slug, name: p.name, brand: p.brand, tier: p.tier, candidates: cands });
    console.log(`${hits.length} brand products; ${cands.length ? cands.map((c) => `${c.id}:${c.level}`).join(' ') : 'no match'}`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `${catSlug}.json`);
  fs.writeFileSync(file, JSON.stringify({ category: catSlug, source: 'Open Beauty Facts', licence: LICENCE, searched: new Date().toISOString(), results }, null, 2));
  fs.writeFileSync(path.join(OUT, `${catSlug}.html`), reviewPage(cat, results));
  const c = (lvl) => results.filter((r) => r.candidates[0]?.level === lvl).length;
  console.log(`\n${results.length} products: ${c('strong')} strong, ${c('possible')} possible only, ${results.filter((r) => !r.candidates.length).length} no match`);
  console.log(`Review: ${path.relative(ROOT, path.join(OUT, `${catSlug}.html`))}`);
}

function reviewPage(cat, results) {
  const row = (r) => `<tr><td class="n">${r.n}</td><td><strong>${esc(r.name)}</strong><br><small>${esc(r.brand)} · ${esc(r.tier)}</small></td><td>${
    r.candidates.length
      ? r.candidates.map((c) => `<div class="c ${c.level}"><img src="${esc(c.image)}" alt="" loading="lazy"><div><b>${c.id}</b> <span class="lvl">${c.level}</span><br>${esc(c.name)}<br><small>${esc(c.brands)} · ${c.overlap}% of words${c.notes.length ? ' · ' + esc(c.notes.join('; ')) : ''}</small><br><a href="${esc(c.url)}" target="_blank" rel="noopener">source</a></div></div>`).join('')
      : '<em>No match. Keep the illustration.</em>'
  }</td></tr>`;
  return `<!doctype html><meta charset="utf-8"><title>Photo review: ${esc(cat.title)}</title>
<style>body{font:15px/1.45 system-ui,sans-serif;margin:24px;color:#1c1b1b;background:#fcf9f8}table{border-collapse:collapse;width:100%}td{border-top:1px solid #ddd;padding:10px;vertical-align:top}.n{color:#888;width:2em}
.c{display:flex;gap:10px;margin:0 0 10px;padding:8px;border-radius:8px;background:#fff;border:1px solid #e2e3dc}.c img{width:84px;height:84px;object-fit:contain;background:#fff}
.lvl{font-size:11px;font-weight:700;text-transform:uppercase;padding:2px 6px;border-radius:3px;color:#fff;background:#8b8f84}.strong .lvl{background:#4e6537}.possible .lvl{background:#7a5735}small{color:#6b6f63}</style>
<h1>Photo candidates: ${esc(cat.title)}</h1>
<p>From <a href="https://world.openbeautyfacts.org">Open Beauty Facts</a>. Photos are licensed <a href="${LICENCE_URL}">${LICENCE}</a>: you may publish them with credit, and edited versions must keep the same licence.
<b>Strong</b> = same brand, the guide's product words and SPF all match. <b>Possible</b> = same brand but a different or newer variant: only approve it if the photo really is the product the guide rates.</p>
<table>${results.map(row).join('')}</table>`;
}

async function apply(catSlug, ids) {
  const data = JSON.parse(fs.readFileSync(path.join(OUT, `${catSlug}.json`), 'utf8'));
  const ovFile = path.join(ROOT, 'data/overrides.json');
  const ov = JSON.parse(fs.readFileSync(ovFile, 'utf8'));
  fs.mkdirSync(path.join(ROOT, 'public/products'), { recursive: true });
  for (const id of ids) {
    const r = data.results.find((x) => x.candidates.some((c) => c.id === id));
    const c = r?.candidates.find((x) => x.id === id);
    if (!c) { console.log(`${id}: not found, skipped`); continue; }
    const res = await fetch(c.image, { headers: { 'user-agent': UA } });
    if (!res.ok) { console.log(`${id}: download failed (${res.status}), skipped`); continue; }
    const rel = `/products/${r.slug}.jpg`;
    fs.writeFileSync(path.join(ROOT, 'public', rel), Buffer.from(await res.arrayBuffer()));
    ov.products[r.slug] = { ...(ov.products[r.slug] || {}), image: rel, imageCredit: `Photo: Open Beauty Facts contributors, ${LICENCE} (${c.url.replace(/^https?:\/\//, '')})` };
    console.log(`${id}: ${r.name} -> public${rel}`);
    await sleep(1000);
  }
  fs.writeFileSync(ovFile, JSON.stringify(ov, null, 2) + '\n');
  console.log('Updated data/overrides.json. Run node scripts/build.mjs to see them on the site.');
}

const [cmd, cat, list] = process.argv.slice(2);
if (cmd === 'find' && cat) await find(cat);
else if (cmd === 'apply' && cat && list) await apply(cat, list.split(',').map((s) => s.trim()).filter(Boolean));
else console.log('usage: node scripts/find-photos.mjs find <category-slug>\n       node scripts/find-photos.mjs apply <category-slug> <id,id,...>');
