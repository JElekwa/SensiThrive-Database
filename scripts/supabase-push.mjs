#!/usr/bin/env node
// Import the guide (data/guide.json) into Supabase. Safe to re-run: it upserts the original-guide
// columns only, so your 2026 edits (status, URLs, affiliate links, updates) are never overwritten.
// Add --with-overrides to also push data/overrides.json (useful once, when moving from local to Supabase).
//
// usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/supabase-push.mjs [--with-overrides]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasSupabase, upsert, updateWhere } from '../src/lib/rest.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!hasSupabase(true)) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).');
  process.exit(1);
}
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/guide.json'), 'utf8'));
const ov = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/overrides.json'), 'utf8'));
const withOverrides = process.argv.includes('--with-overrides');
const step = async (name, fn) => { process.stdout.write(`${name}… `); await fn(); console.log('ok'); };

await step(`sections (${d.sections.length})`, () =>
  upsert('sections', d.sections.map((s, i) => ({ slug: s.slug, title: s.title, intro: s.intro || [], position: i }))));
await step(`groups (${d.groups.length})`, () =>
  upsert('groups', d.groups.map((g, i) => ({ slug: g.slug, section: g.section, title: g.title, revised: g.revised, blocks: g.blocks || [], position: i }))));
await step(`categories (${d.categories.length})`, () =>
  upsert('categories', d.categories.map((c, i) => ({ slug: c.slug, section: c.section, group_slug: c.group || null, title: c.title, revised: c.revised, blocks: c.blocks, position: i }))));
await step(`articles (${d.articles.length})`, () =>
  upsert('articles', d.articles.map((a, i) => ({ slug: a.slug, section: a.section, title: a.title, byline: a.byline || null, blocks: a.blocks, ingredient_context: a.ingredientContext || null, position: i }))));
await step(`brands (${d.brands.length})`, () =>
  upsert('brands', d.brands.map((b) => ({ slug: b.slug, name: b.name, websites: b.websites || [] }))));
await step(`products (${d.products.length})`, () =>
  upsert('products', d.products.map((p) => ({ slug: p.slug, name: p.name, brand_slug: p.brandSlug, brand_name: p.brand, websites: p.websites || [] }))));
const apps = [];
for (const c of d.categories) {
  let i = 0;
  for (const b of c.blocks) {
    if (b.type !== 'tier') continue;
    for (const it of b.items) {
      i++;
      if (it.product) apps.push({ id: `${c.slug}:${i}`, product_slug: it.product, category_slug: c.slug, tier: b.tier, original_text: it.text, position: i });
    }
  }
}
await step(`product appearances (${apps.length})`, () => upsert('product_appearances', apps));
await step(`ingredients (${d.ingredients.length})`, () =>
  upsert('ingredients', d.ingredients.map((x, i) => ({ id: `${x.context}:${x.slug}`, slug: x.slug, name: x.name, context: x.context, blocks: x.blocks, position: i }))));

if (withOverrides) {
  const prods = Object.entries(ov.products || {}).map(([slug, o]) => ({
    slug,
    status: o.status || 'unverified', official_url: o.officialUrl || null, affiliate_url: o.affiliateUrl || null,
    affiliate_network: o.affiliateNetwork || null, retailer_name: o.retailerName || null, image_url: o.image || null, image_credit: o.imageCredit || null, update_2026: o.update2026 || null, last_verified: o.lastVerified || null,
  }));
  if (prods.length) await step(`product overrides (${prods.length})`, async () => { for (const { slug, ...v } of prods) await updateWhere('products', 'slug', slug, v); });
  const storeLinks = Object.entries(ov.products || {}).flatMap(([slug, o]) => (o.links || []).slice(0, 3).map((l, i) => ({
    product_slug: slug, position: Number(l.position) || i + 1, store: l.store, url: l.url, network: l.network || null, active: l.active !== false,
  })));
  if (storeLinks.length) await step(`store links (${storeLinks.length})`, () => upsert('product_links', storeLinks, { onConflict: 'product_slug,position' }));
  for (const t of ['categories', 'articles']) {
    const rows = Object.entries(ov[t] || {}).filter(([, o]) => o.update2026);
    if (rows.length) await step(`${t} updates (${rows.length})`, async () => { for (const [slug, o] of rows) await updateWhere(t, 'slug', slug, { update_2026: o.update2026 }); });
  }
}
console.log('Done. Trigger a Vercel redeploy (or your Deploy Hook) to publish.');
