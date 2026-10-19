// /go/:slug -> retailer. Prefers the live Supabase record (so affiliate links update without a rebuild),
// falls back to the link table generated at build time, then to a web search. Logs the click.
import LINKS from './_lib/links.mjs';
import { hasSupabase, selectOne, insert } from '../src/lib/rest.mjs';

const search = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
const SHOP = new Set(['active', 'renamed', 'reformulated']); // keep in step with SHOP_STATUSES in src/lib/dataset.mjs
const safe = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null);

async function logClick(req, row) {
  if (!hasSupabase(true)) return;
  let ref = '';
  try { ref = new URL(req.headers.referer || '').pathname.slice(0, 200); } catch {}
  const base = { ...row, destination: row.destination.slice(0, 1000), referrer_path: ref };
  try { await insert('link_clicks', [base]); } catch {
    // link_clicks.store arrives with migration 20261020000000; log without it until then
    const { store, ...rest } = base;
    try { if (store) await insert('link_clicks', [rest]); } catch { /* never block the redirect */ }
  }
}

export default async function handler(req, res) {
  const slug = String(req.query?.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  if (!slug) return res.redirect(302, '/search');

  // /go/:slug/:n -> the product's "Where to buy" store link at position n (1-3)
  const n = Number(req.query?.n);
  if (n >= 1 && n <= 3) {
    let link = LINKS[slug]?.s?.[n] ? { store: LINKS[slug].s[n][0], url: LINKS[slug].s[n][1] } : null;
    if (hasSupabase()) {
      try {
        const live = await selectOne('product_links', `product_slug=eq.${slug}&position=eq.${n}&active=is.true`, 'store,url');
        const p = await selectOne('products', `slug=eq.${slug}`, 'status');
        // when Supabase answers, it wins: a removed/inactive link or an un-verified product sends no one there
        link = live && p && SHOP.has(p.status) ? live : null;
      } catch { /* fall back to build-time table */ }
    }
    if (link && safe(link.url) && /^https:/i.test(link.url)) {
      await logClick(req, { product_slug: slug, destination: link.url, link_type: 'store', store: String(link.store || '').slice(0, 40) });
      return res.redirect(302, link.url);
    }
    // unknown position: fall through to the product's default link
  }

  let rec = LINKS[slug] || null; // { a: affiliateUrl, o: officialUrl, s: {n: [store, url]}, q: search query }
  if (hasSupabase()) {
    try {
      const p = await selectOne('products', `slug=eq.${slug}`, 'name,brand_name,official_url,affiliate_url');
      if (p) rec = { a: p.affiliate_url, o: p.official_url, q: `${p.name}${p.name.includes(p.brand_name || '') ? '' : ' ' + (p.brand_name || '')}` };
    } catch { /* fall back to build-time table */ }
  }
  if (!rec) return res.redirect(302, `/search?q=${encodeURIComponent(slug.replace(/-/g, ' '))}`);

  const dest = safe(rec.a) || safe(rec.o) || search(rec.q);
  const type = safe(rec.a) ? 'affiliate' : safe(rec.o) ? 'official' : 'search';

  await logClick(req, { product_slug: slug, destination: dest, link_type: type });
  return res.redirect(302, dest);
}
