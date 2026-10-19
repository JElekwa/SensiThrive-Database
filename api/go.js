// /go/:slug -> retailer. Prefers the live Supabase record (so affiliate links update without a rebuild),
// falls back to the link table generated at build time, then to a web search. Logs the click.
import LINKS from './_lib/links.mjs';
import { hasSupabase, selectOne, insert } from '../src/lib/rest.mjs';

const search = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
const safe = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null);

export default async function handler(req, res) {
  const slug = String(req.query?.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  if (!slug) return res.redirect(302, '/search');

  let rec = LINKS[slug] || null; // { a: affiliateUrl, o: officialUrl, q: search query }
  if (hasSupabase()) {
    try {
      const p = await selectOne('products', `slug=eq.${slug}`, 'name,brand_name,official_url,affiliate_url');
      if (p) rec = { a: p.affiliate_url, o: p.official_url, q: `${p.name}${p.name.includes(p.brand_name || '') ? '' : ' ' + (p.brand_name || '')}` };
    } catch { /* fall back to build-time table */ }
  }
  if (!rec) return res.redirect(302, `/search?q=${encodeURIComponent(slug.replace(/-/g, ' '))}`);

  const dest = safe(rec.a) || safe(rec.o) || search(rec.q);
  const type = safe(rec.a) ? 'affiliate' : safe(rec.o) ? 'official' : 'search';

  if (hasSupabase(true)) {
    let ref = '';
    try { ref = new URL(req.headers.referer || '').pathname.slice(0, 200); } catch {}
    try { await insert('link_clicks', [{ product_slug: slug, destination: dest.slice(0, 1000), link_type: type, referrer_path: ref }]); } catch { /* never block the redirect */ }
  }
  return res.redirect(302, dest);
}
