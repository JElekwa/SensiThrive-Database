#!/usr/bin/env node
// Static site build: data -> dist/ (HTML + assets + sitemap + robots + llms.txt + search index)
// usage: node scripts/build.mjs        (CONTENT_SOURCE=supabase to read content from Supabase)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { site } from '../site.config.mjs';
import { loadDataset } from '../src/lib/dataset.mjs';
import { ASSET_VERSION } from '../src/templates/layout.mjs';
import * as C from '../src/pages/content.mjs';
import * as S from '../src/pages/static.mjs';
import { buildSearchIndex } from '../src/lib/search-index.mjs';
import { llmsTxt, llmsFullTxt } from '../src/lib/llms.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const t0 = Date.now();

function write(rel, body) {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, body);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), t = path.join(dst, e.name);
    if (e.isDirectory()) { fs.mkdirSync(t, { recursive: true }); copyDir(s, t); }
    else fs.copyFileSync(s, t);
  }
}
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

const d = await loadDataset();
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
copyDir(path.join(ROOT, 'public'), DIST);

// assets with cache-busting versions
const css = fs.readFileSync(path.join(ROOT, 'src/assets/app.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'src/assets/app.js'), 'utf8');
ASSET_VERSION.css = hash(css);
ASSET_VERSION.js = hash(js);
write('assets/app.css', css);
write('assets/app.js', js);

// ---------------------------------------------------------------- pages
const pages = [];
const add = (p) => pages.push(p);
add(C.home(d));
add(C.guideIndex(d));
for (const s of d.navSections) add(C.sectionPage(d, s));
for (const g of d.groups) add(C.groupPage(d, g));
for (const c of d.categories) add(C.categoryPage(d, c));
for (const a of d.articles) add(C.articlePage(d, a));
for (const p of d.products) if (p.categorySlugs.length) add(C.productPage(d, p));
for (const b of d.brands) add(C.brandPage(d, b));
add(C.brandsIndex(d));
add(C.productsIndex(d));
add(C.ingredientsIndex(d));
// ingredient -> categories that mention it (internal linking)
const catText = new Map(d.categories.map((c) => [c.slug, JSON.stringify(c.blocks.filter((b) => b.type !== 'tier')).toLowerCase()]));
for (const i of d.ingredients) {
  const kws = C.ingredientKeywords(i);
  const mentions = d.categories.filter((c) => kws.some((k) => k.length > 3 && catText.get(c.slug).includes(k))).slice(0, 12);
  add(C.ingredientPage(d, i, mentions));
}
add(C.recipesPage(d));
for (const f of ['about', 'editorial', 'disclosure', 'privacy', 'terms', 'contact', 'searchPage', 'checkPage', 'swapsPage', 'savedPage', 'offlinePage']) add(S[f](d));

// write: /a/b -> a/b.html (served at /a/b with cleanUrls)
const seen = new Set();
for (const p of pages) {
  if (seen.has(p.path)) throw new Error('duplicate path ' + p.path);
  seen.add(p.path);
  write(p.path === '/' ? 'index.html' : p.path.slice(1) + '.html', p.html);
}
write('404.html', S.notFound(d).html);

// ---------------------------------------------------------------- machine files
const noindexPaths = new Set(['/search', '/saved', '/offline']);
const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter((p) => !noindexPaths.has(p.path)).map((p) => {
  const pri = p.path === '/' ? '1.0' : p.path.startsWith('/guide') ? '0.8' : p.path.startsWith('/products/') ? '0.6' : '0.5';
  return `<url><loc>${site.url}${p.path === '/' ? '/' : p.path}</loc><lastmod>${site.lastReviewed || today}</lastmod><priority>${pri}</priority></url>`;
});
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

write('robots.txt', site.allowIndexing
  ? `# ${site.name}\nUser-agent: *\nAllow: /\nDisallow: /go/\nDisallow: /api/\nDisallow: /saved\nDisallow: /search?\n\n# AI search and assistants are welcome to read and cite the guide (with credit to EHANS)\nUser-agent: GPTBot\nAllow: /\nDisallow: /go/\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nDisallow: /go/\nUser-agent: Claude-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: Applebot-Extended\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`
  : `# Indexing disabled until launch (set ALLOW_INDEXING=true)\nUser-agent: *\nDisallow: /\n`);

write('llms.txt', llmsTxt(d));
write('llms-full.txt', llmsFullTxt(d));
write('search-index.json', JSON.stringify(buildSearchIndex(d)));

write('manifest.webmanifest', JSON.stringify({
  name: `${site.name}: Less Toxic Guide`,
  short_name: site.name,
  description: site.description,
  id: '/',
  start_url: '/?source=pwa',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: site.backgroundColor,
  theme_color: site.themeColor,
  categories: ['health', 'lifestyle', 'shopping'],
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  shortcuts: [
    { name: 'Search', url: '/search', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    { name: 'Ingredient checker', url: '/check', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    { name: 'Saved', url: '/saved', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
  ],
}, null, 1));

// service worker with build version
const sw = fs.readFileSync(path.join(ROOT, 'src/assets/sw.js'), 'utf8')
  .replace('__VERSION__', hash(ASSET_VERSION.css + ASSET_VERSION.js + d.stats.products + Date.now()))
  .replace('__PRECACHE__', JSON.stringify(['/', '/offline', '/saved', '/search', '/check', '/guide', `/assets/app.css?v=${ASSET_VERSION.css}`, `/assets/app.js?v=${ASSET_VERSION.js}`, '/search-index.json', '/brand/mark.png', '/manifest.webmanifest']));
write('sw.js', sw);

console.log(`Built ${pages.length} pages from ${d._source} data in ${((Date.now() - t0) / 1000).toFixed(1)}s -> dist/  (indexing ${site.allowIndexing ? 'ON' : 'OFF'})`);
