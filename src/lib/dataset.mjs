// Loads the guide content and the 2026 review layer, and builds lookup indexes.
// Source: local JSON (data/guide.json + data/overrides.json) or Supabase (phase 3).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tiers } from '../../site.config.mjs';
import { loadFromSupabase, supabaseConfigured } from './supabase.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const url = {
  section: (s) => `/guide/${s}`,
  category: (c) => `/guide/${c.section}/${c.slug}`,
  group: (g) => `/guide/${g.section}/${g.slug}`,
  article: (a) => `/learn/${a.slug}`,
  product: (p) => `/products/${typeof p === 'string' ? p : p.slug}`,
  brand: (b) => `/brands/${typeof b === 'string' ? b : b.slug}`,
  ingredient: (i) => `/ingredients/${typeof i === 'string' ? i : i.slug}`,
  go: (p) => `/go/${typeof p === 'string' ? p : p.slug}`,
};

function readJSON(rel, fallback) {
  const f = path.join(ROOT, rel);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : fallback;
}

function slugify(s) {
  return s.toLowerCase().replace(/&/g, ' and ').replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
}

export async function loadDataset({ source = process.env.CONTENT_SOURCE || 'local' } = {}) {
  let raw;
  if (source === 'supabase' && supabaseConfigured()) {
    raw = await loadFromSupabase();
    raw._source = 'supabase';
  } else {
    raw = readJSON('data/guide.json');
    const ov = readJSON('data/overrides.json', { products: {}, categories: {}, articles: {} });
    for (const p of raw.products) Object.assign(p, ov.products?.[p.slug] || {});
    for (const c of raw.categories) Object.assign(c, ov.categories?.[c.slug] || {});
    for (const a of raw.articles) Object.assign(a, ov.articles?.[a.slug] || {});
    raw._source = 'local';
  }
  return index(raw);
}

function index(d) {
  const by = (arr) => new Map(arr.map((x) => [x.slug, x]));
  d.sectionMap = by(d.sections);
  d.groupMap = by(d.groups);
  d.categoryMap = by(d.categories);
  d.articleMap = by(d.articles);
  d.productMap = by(d.products);
  d.brandMap = by(d.brands);

  // products: derived fields
  for (const p of d.products) {
    p.appearances = (p.appearances || []).filter((a) => d.categoryMap.has(a.category));
    let best = null;
    for (const a of p.appearances) {
      if (!best || (tiers[a.tier]?.rank ?? 0) > (tiers[best]?.rank ?? 0)) best = a.tier;
    }
    p.topTier = best;
    p.categorySlugs = [...new Set(p.appearances.map((a) => a.category))];
    p.status = p.status || 'unverified';
    p.url = url.product(p);
  }
  // categories: product lists per tier
  for (const c of d.categories) {
    c.url = url.category(c);
    c.products = [];
    for (const b of c.blocks) {
      if (b.type !== 'tier') continue;
      for (const it of b.items) if (it.product && d.productMap.has(it.product)) c.products.push({ slug: it.product, tier: b.tier });
    }
    const g = c.group ? d.groupMap.get(c.group) : null;
    c.groupTitle = g?.title;
  }
  for (const g of d.groups) g.url = url.group(g);
  for (const a of d.articles) a.url = url.article(a);
  for (const b of d.brands) {
    b.url = url.brand(b);
    b.products = b.products.filter((s) => d.productMap.has(s));
  }
  d.brands = d.brands.filter((b) => b.products.length);
  d.brandMap = by(d.brands);

  // ingredients: merge same-name entries from the cleaning and personal-care lists
  const SAME = { 'sodium-lauryl-sulfate-sodium-laureth-sulfate': 'sodium-lauryl-sulfate', 'polyethylene-glycol': 'peg' };
  const merged = new Map();
  for (const i of d.ingredients) {
    let key = slugify(i.name.split('(')[0]);
    key = SAME[key] || key;
    if (!merged.has(key)) merged.set(key, { slug: key, name: i.name, entries: [] });
    const m = merged.get(key);
    if (i.name.length > m.name.length && key !== 'peg') m.name = i.name;
    if (key === 'peg') m.name = 'PEG (Polyethylene Glycol)';
    m.entries.push({ context: i.context, blocks: i.blocks });
    if (i.update2026 && !m.update2026) m.update2026 = i.update2026;
  }
  d.ingredients = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  for (const i of d.ingredients) i.url = url.ingredient(i);
  d.ingredientMap = by(d.ingredients);

  // navigation order
  d.navSections = ['personal-care', 'household-cleaners', 'baby-care', 'consumer-advice', 'chemical-hazards', 'institutional', 'using-this-guide']
    .map((s) => d.sectionMap.get(s)).filter(Boolean);

  d.stats = {
    products: d.products.length,
    categories: d.categories.length,
    brands: d.brands.length,
    ingredients: d.ingredients.length,
    verified: d.products.filter((p) => p.status === 'active').length,
  };
  return d;
}

export { slugify };
