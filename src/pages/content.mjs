// Content pages generated from the guide: home, guide index, sections, groups, categories,
// articles, products, brands, ingredients, recipes, A–Z indexes.
import { site, tiers, statuses } from '../../site.config.mjs';
import { esc, html, truncate, linkifyArchived } from '../lib/html.mjs';
import { url } from '../lib/dataset.mjs';
import { articleLD, itemListLD, productLD, definedTermLD, websiteLD, abs } from '../lib/seo.mjs';
import { layout } from '../templates/layout.mjs';
import { icon } from '../templates/icons.mjs';
import {
  tierBadge, statusChip, saveButton, productCard, blocks, originalNote, updatePanel, sectionIcon, linkTile, disclosureLine, monogram,
} from '../templates/components.mjs';

const firstText = (bl) => {
  for (const b of bl || []) {
    if (b.type === 'p' && b.text.length > 60) return b.text;
  }
  return '';
};
const countTiers = (c) => {
  const n = {};
  for (const p of c.products) n[p.tier] = (n[p.tier] || 0) + 1;
  return n;
};
const crumbsFor = (d, c) => {
  const s = d.sectionMap.get(c.section);
  const out = [{ name: 'Home', href: '/' }, { name: 'Guide', href: '/guide' }, { name: s.title, href: url.section(s.slug) }];
  if (c.group) {
    const g = d.groupMap.get(c.group);
    out.push({ name: g.title, href: g.url });
  }
  out.push({ name: c.title, href: c.url });
  return out;
};

// ------------------------------------------------------------------ home
export function home(d) {
  const featured = ['laundry-detergent', 'shampoo', 'deodorant', 'all-purpose-cleaner', 'baby-lotion', 'sun-protection', 'toothpaste', 'lotions-moisturizers']
    .map((s) => d.categoryMap.get(s)).filter(Boolean);
  const content = html`
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">${icon('history', { size: 16 })} The EHANS Guide to Less Toxic Products, carried forward</p>
    <h1>Less toxic choices for <em>sensitive living</em></h1>
    <p class="lede">${d.stats.products.toLocaleString()} products across ${d.stats.categories} categories, rated by volunteers of the Environmental Health Association of Nova Scotia, now searchable and being re-checked for 2026.</p>
    <form class="bigsearch" action="/search" role="search">
      <label class="sr" for="q">Search products, brands or ingredients</label>
      ${icon('search')}
      <input id="q" name="q" type="search" placeholder="Search products, brands or ingredients" autocomplete="off" enterkeyhint="search">
      <button type="submit">Search</button>
    </form>
    <div class="chips" aria-label="Popular categories">
      ${featured.map((c) => `<a class="chip-link" href="${c.url}">${esc(c.title)}</a>`)}
    </div>
  </div>
  <div class="hero-art" aria-hidden="true">
    <img src="/brand/mark.png" alt="" width="195" height="313">
  </div>
</section>

<section class="band">
  <h2 class="h-sec">Browse the guide</h2>
  <div class="tiles">
    ${d.navSections.slice(0, 3).map((s) => {
      const n = (s.categories?.length || 0) + d.groups.filter((g) => g.section === s.slug).reduce((a, g) => a + g.categories.length, 0);
      return linkTile({ href: url.section(s.slug), title: s.title, text: `${n} product categories`, ic: sectionIcon(s.slug) });
    })}
    ${linkTile({ href: '/ingredients', title: 'Hazardous ingredients', text: `${d.stats.ingredients} ingredients explained`, ic: 'flask' })}
  </div>
</section>

<section class="band tools">
  <h2 class="h-sec">Tools</h2>
  <div class="tool-grid">
    <a class="tool" href="/check">${icon('flask', { size: 26 })}<strong>Ingredient checker</strong><span>Paste a label. We flag ingredients from the guide’s hazard lists.</span></a>
    <a class="tool" href="/swaps">${icon('swap', { size: 26 })}<strong>Safe swaps</strong><span>Tell us what you use now and see the guide’s Best and Good picks.</span></a>
    <a class="tool" href="/recipes">${icon('bowl', { size: 26 })}<strong>Home-made recipes</strong><span>Simple cleaners and care products from pantry ingredients.</span></a>
    <a class="tool" href="/saved">${icon('bookmark', { size: 26 })}<strong>Saved list</strong><span>Keep a shopping list on this device. Works offline.</span></a>
  </div>
</section>

<section class="band ratings">
  <h2 class="h-sec">How products are rated</h2>
  <p class="muted">These categories come straight from the original guide. They describe ingredients, not effectiveness.</p>
  <dl class="rating-defs">
    ${['best', 'good', 'unscented', 'less-toxic'].map((t) => `<div><dt>${tierBadge(t)}</dt><dd>${esc(tiers[t].short)}</dd></div>`)}
  </dl>
  <p><a href="/learn/rating-categories">Read EHANS’s full definitions ${icon('arrow', { size: 16 })}</a></p>
</section>

<section class="band roots">
  <div>
    <h2 class="h-sec">Our roots</h2>
    <p>The Guide to Less Toxic Products was researched and written by volunteers of the ${esc(site.source.org)}, founded in 1985. It was consulted by more than 600 people a day and cited by CBC Marketplace, The Globe and Mail and Environmental Defence. Its last revision was in 2011.</p>
    <p>SensiThrive keeps every word of that work, credits the people behind it, and adds what has changed since, clearly marked as 2026 updates.</p>
    <p><a class="btn btn-ghost" href="/about">Read the story</a></p>
  </div>
</section>`;
  return {
    path: '/',
    html: layout({
      title: `${site.name}: The Guide to Less Toxic Products, updated`,
      fullTitle: true,
      description: site.description,
      path: '/',
      content,
      jsonld: [websiteLD()],
      bodyClass: 'home',
    }),
  };
}

// ------------------------------------------------------------------ guide index
export function guideIndex(d) {
  const content = html`
<header class="page-h">
  <p class="eyebrow">The guide</p>
  <h1>The Guide to Less Toxic Products</h1>
  <p class="lede">Every section of the original EHANS guide, organised for quick browsing. Product ratings, background on harmful ingredients, tips and home-made alternatives.</p>
</header>
${d.navSections.map((s) => {
  const groups = d.groups.filter((g) => g.section === s.slug);
  const cats = (s.categories || []).map((c) => d.categoryMap.get(c));
  const arts = (s.articles || []).map((a) => d.articleMap.get(a));
  return html`<section class="band">
  <h2 class="h-sec"><a href="${url.section(s.slug)}">${esc(s.title)}</a></h2>
  ${groups.map((g) => `<h3 class="h-sub"><a href="${g.url}">${esc(g.title)}</a></h3><ul class="linklist">${g.categories.map((c) => d.categoryMap.get(c)).map((c) => `<li><a href="${c.url}">${esc(c.title)}</a> <span class="muted">${c.products.length || ''}</span></li>`).join('')}</ul>`)}
  ${cats.length ? `<ul class="linklist">${cats.map((c) => `<li><a href="${c.url}">${esc(c.title)}</a> <span class="muted">${c.products.length || ''}</span></li>`).join('')}</ul>` : ''}
  ${arts.length ? `<ul class="linklist articles">${arts.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join('')}</ul>` : ''}
</section>`;
})}`;
  return {
    path: '/guide',
    html: layout({
      title: 'The Guide to Less Toxic Products: all sections',
      description: 'Browse every section of the EHANS Guide to Less Toxic Products: cosmetics and personal care, household cleaners, baby care, consumer advice and chemical hazards.',
      path: '/guide',
      content,
      crumbs: [{ name: 'Home', href: '/' }, { name: 'Guide', href: '/guide' }],
    }),
  };
}

// ------------------------------------------------------------------ sections
export function sectionPage(d, s) {
  const groups = d.groups.filter((g) => g.section === s.slug);
  const cats = (s.categories || []).map((c) => d.categoryMap.get(c));
  const arts = (s.articles || []).map((a) => d.articleMap.get(a));
  const path = url.section(s.slug);
  // single-article sections (e.g. Chemical Hazards) still get a hub page
  const content = html`
<header class="page-h">
  <p class="eyebrow">${icon(sectionIcon(s.slug), { size: 16 })} Guide section</p>
  <h1>${esc(s.title)}</h1>
</header>
${s.intro?.length ? `<div class="prose original">${blocks(s.intro, d)}</div>${originalNote({ revised: '2011' })}` : ''}
${groups.length ? html`<section class="band"><h2 class="h-sec">Product types</h2>${groups.map((g) => html`
  <h3 class="h-sub"><a href="${g.url}">${esc(g.title)}</a> <span class="muted small">revised ${esc(g.revised || '2011')}</span></h3>
  <div class="tiles tiles-sm">${g.categories.map((c) => d.categoryMap.get(c)).map((c) => linkTile({ href: c.url, title: c.title, count: c.products.length || null, ic: sectionIcon(s.slug) }))}</div>`)}</section>` : ''}
${cats.length ? html`<section class="band"><h2 class="h-sec">Topics &amp; product types</h2><div class="tiles tiles-sm">${cats.map((c) => linkTile({ href: c.url, title: c.title, count: c.products.length || null, ic: sectionIcon(s.slug) }))}</div></section>` : ''}
${arts.length ? html`<section class="band"><h2 class="h-sec">Background reading</h2><div class="tiles tiles-sm">${arts.map((a) => linkTile({ href: a.url, title: a.title, ic: 'book' }))}</div></section>` : ''}
`;
  const desc = truncate(firstText(s.intro) || `${s.title} in the EHANS Guide to Less Toxic Products: product ratings, harmful ingredients to avoid, tips and home-made alternatives.`);
  return {
    path,
    html: layout({
      title: `${s.title}: less toxic options`,
      description: desc,
      path,
      content,
      crumbs: [{ name: 'Home', href: '/' }, { name: 'Guide', href: '/guide' }, { name: s.title, href: path }],
      jsonld: [itemListLD(s.title, [...groups.map((g) => ({ url: g.url, name: g.title })), ...cats.map((c) => ({ url: c.url, name: c.title })), ...arts.map((a) => ({ url: a.url, name: a.title }))])],
    }),
  };
}

export function groupPage(d, g) {
  const s = d.sectionMap.get(g.section);
  const cats = g.categories.map((c) => d.categoryMap.get(c));
  const content = html`
<header class="page-h">
  <p class="eyebrow">${esc(s.title)}</p>
  <h1>${esc(g.title)}</h1>
  <p class="muted">Revised ${esc(g.revised || '2011')} in the original guide · ${cats.reduce((a, c) => a + c.products.length, 0)} products</p>
</header>
<div class="tiles tiles-sm">${cats.map((c) => linkTile({ href: c.url, title: c.title, count: c.products.length || null, ic: sectionIcon(s.slug) }))}</div>
${g.blocks?.length ? `<div class="prose original">${blocks(g.blocks, d)}</div>${originalNote({ revised: g.revised })}` : ''}
`;
  return {
    path: g.url,
    html: layout({
      title: `${g.title}: less toxic product ratings`,
      description: truncate(firstText(g.blocks) || `Less toxic ${g.title.toLowerCase()} products rated Best, Good and Simply Unscented in the EHANS Guide to Less Toxic Products.`),
      path: g.url,
      content,
      crumbs: [{ name: 'Home', href: '/' }, { name: 'Guide', href: '/guide' }, { name: s.title, href: url.section(s.slug) }, { name: g.title, href: g.url }],
      jsonld: [itemListLD(g.title, cats.map((c) => ({ url: c.url, name: c.title })))],
    }),
  };
}

// ------------------------------------------------------------------ category
export function categoryPage(d, c) {
  const s = d.sectionMap.get(c.section);
  const n = countTiers(c);
  const tierBlocks = c.blocks.filter((b) => b.type === 'tier');
  const siblings = (c.group ? d.groupMap.get(c.group).categories : s.categories || []).filter((x) => x !== c.slug).map((x) => d.categoryMap.get(x));
  const lead = firstText(c.blocks);
  const content = html`
<header class="page-h">
  <p class="eyebrow">${esc(c.groupTitle || s.title)}</p>
  <h1>${esc(c.title)}</h1>
  <div class="meta-row">
    ${Object.entries(n).sort((a, b) => (tiers[b[0]]?.rank ?? 0) - (tiers[a[0]]?.rank ?? 0)).map(([t, k]) => `<a class="meta-pill" href="#tier-${t}">${tierBadge(t)} ${k}</a>`)}
    <span class="muted small">Revised ${esc(c.revised)}</span>
  </div>
</header>
${originalNote({ revised: c.revised })}
<div class="prose original">
${blocks(c.blocks, d).replace(/<section class="tier tier-([a-z-]+)">/g, (m, t) => m.replace('<section', `<section id="tier-${t}"`))}
</div>
${updatePanel(c.update2026, { what: `these ${c.title.toLowerCase()} recommendations` })}
${c.products.length ? disclosureLine() : ''}
${siblings.length ? html`<section class="band"><h2 class="h-sec">Related in ${esc(c.groupTitle || s.title)}</h2><div class="tiles tiles-sm">${siblings.slice(0, 8).map((x) => linkTile({ href: x.url, title: x.title, count: x.products.length || null, ic: sectionIcon(s.slug) }))}</div>${siblings.length > 8 ? `<p><a href="${c.group ? d.groupMap.get(c.group).url : url.section(s.slug)}">All ${siblings.length + 1} topics in ${esc(c.groupTitle || s.title)} ${icon('arrow', { size: 16 })}</a></p>` : ''}</section>` : ''}
`;
  const prods = c.products.map((p) => d.productMap.get(p.slug));
  const desc = c.products.length
    ? truncate(`Less toxic ${c.title.toLowerCase()}: ${c.products.length} products rated ${Object.keys(n).map((t) => tiers[t]?.label).join(', ')} by EHANS. ${lead}`)
    : truncate(lead || `${c.title}: harmful ingredients to avoid, tips and home-made alternatives from the EHANS Guide to Less Toxic Products.`);
  return {
    path: c.url,
    html: layout({
      title: c.products.length ? `Less Toxic ${c.title}: Ratings & Alternatives` : `${c.title}: Less Toxic Alternatives`,
      description: desc,
      path: c.url,
      content,
      ogType: 'article',
      crumbs: crumbsFor(d, c),
      jsonld: [
        articleLD({ title: `Less toxic ${c.title}`, description: desc, path: c.url, revised: c.revised, modified: c.update2026?.date }),
        ...(prods.length ? [itemListLD(`Less toxic ${c.title}`, prods.map((p) => ({ url: p.url, name: p.name })))] : []),
      ],
    }),
  };
}

// ------------------------------------------------------------------ article
export function articlePage(d, a) {
  const s = d.sectionMap.get(a.section);
  const sib = (s?.articles || []).filter((x) => x !== a.slug).map((x) => d.articleMap.get(x));
  const isIng = !!a.ingredientContext;
  const ings = isIng ? d.ingredients.filter((i) => i.entries.some((e) => e.context === a.ingredientContext)) : [];
  const content = html`
<header class="page-h">
  <p class="eyebrow">${esc(s?.title || 'Guide')}</p>
  <h1>${esc(a.title)}</h1>
  ${a.byline ? `<p class="muted">${esc(a.byline)}</p>` : ''}
</header>
${originalNote({ revised: '2011' })}
<div class="prose original">${blocks(a.blocks, d)}</div>
${isIng ? html`<section class="band"><h2 class="h-sec">The ingredients</h2><div class="tiles tiles-sm">${ings.map((i) => linkTile({ href: i.url, title: i.name, ic: 'flask' }))}</div></section>` : ''}
${a.slug === 'what-people-are-saying' || a.slug === 'help-fund-the-guide' || a.section === 'about' ? '' : updatePanel(a.update2026, { what: 'this article' })}
${sib.length ? html`<section class="band"><h2 class="h-sec">More from ${esc(s.title)}</h2><div class="tiles tiles-sm">${sib.map((x) => linkTile({ href: x.url, title: x.title, ic: 'book' }))}</div></section>` : ''}
`;
  const desc = truncate(firstText(a.blocks) || a.title);
  const crumbs = [{ name: 'Home', href: '/' }];
  if (s && a.section !== 'about') crumbs.push({ name: 'Guide', href: '/guide' }, { name: s.title, href: url.section(s.slug) });
  crumbs.push({ name: a.title, href: a.url });
  return {
    path: a.url,
    html: layout({ title: a.title, description: desc, path: a.url, content, ogType: 'article', crumbs, jsonld: [articleLD({ title: a.title, description: desc, path: a.url })] }),
  };
}

// ------------------------------------------------------------------ product
export function productPage(d, p) {
  const brand = d.brandMap.get(p.brandSlug);
  const st = statuses[p.status] || statuses.unverified;
  const hasLink = !!(p.affiliateUrl || p.officialUrl);
  const cats = p.categorySlugs.map((c) => d.categoryMap.get(c));
  // alternatives: other top-rated products in the same categories
  const alts = [];
  for (const c of cats) {
    for (const x of c.products) {
      if (x.slug === p.slug || alts.find((a) => a.slug === x.slug)) continue;
      if ((tiers[x.tier]?.rank ?? 0) >= 2) alts.push({ slug: x.slug, tier: x.tier });
      if (alts.length >= 6) break;
    }
  }
  const archived = [...new Set([...(p.websites || []), ...(brand?.websites || [])])];
  const content = html`
<article class="product">
  <header class="product-h">
    ${monogram(p.name, p.topTier)}
    <div>
      <p class="eyebrow">${brand ? `<a href="${brand.url}">${esc(brand.name)}</a>` : esc(p.brand)}</p>
      <h1>${esc(p.name)}</h1>
      <div class="meta-row">${tierBadge(p.topTier)} ${statusChip(p.status)}</div>
    </div>
  </header>

  <div class="product-grid">
    <div>
      <section class="card">
        <h2 class="card-h">How the EHANS guide rated it</h2>
        <ul class="ratings-list">
          ${p.appearances.map((a) => {
            const c = d.categoryMap.get(a.category);
            return html`<li>
              <div class="r-top">${tierBadge(a.tier)} <a href="${c.url}">${esc(c.title)}</a></div>
              <blockquote>${linkifyArchived(a.text)}</blockquote>
              <p class="muted small">${esc(tiers[a.tier]?.short || '')}</p>
            </li>`;
          })}
        </ul>
        <p class="muted small">From the ${esc(site.source.org)} guide, revised ${esc(cats[0]?.revised || '2011')}.</p>
      </section>

      ${p.update2026?.text ? updatePanel(p.update2026) : html`<aside class="update update-pending">
        <h2>${icon('leaf')} Status: ${esc(st.label)}</h2>
        <p>${esc(st.help)} Formulas change, so check the current ingredient list against the <a href="/ingredients">guide’s hazardous ingredients</a> or paste it into the <a href="/check">ingredient checker</a>.</p>
      </aside>`}
    </div>

    <aside class="buy card">
      <h2 class="card-h">Where to find it</h2>
      <a class="btn btn-primary btn-block" href="/go/${p.slug}" rel="${p.affiliateUrl ? 'sponsored nofollow' : 'nofollow'} noopener" target="_blank">
        ${hasLink ? `Check price${p.retailerName ? ` at ${esc(p.retailerName)}` : ''}` : 'Find it online'} ${icon('external', { size: 18 })}
      </a>
      ${hasLink ? '' : '<p class="muted small">We have not matched this product to a retailer yet, so this opens a web search.</p>'}
      ${saveButton(p.slug, p.name)}
      ${archived.length ? html`<p class="small">Website listed in the 2011 guide: ${archived.map((w) => linkifyArchived(w)).join(', ')} <span class="muted">(archived copy)</span></p>` : ''}
      ${disclosureLine()}
    </aside>
  </div>

  ${alts.length ? html`<section class="band"><h2 class="h-sec">Other well-rated options</h2><div class="pgrid">${alts.map((a) => productCard(d.productMap.get(a.slug), d, { tier: a.tier }))}</div></section>` : ''}
</article>`;
  const c0 = cats[0];
  const desc = truncate(`${p.name} by ${brand?.name || p.brand}: rated ${tiers[p.topTier]?.label || 'listed'} for ${c0?.title.toLowerCase()} in the EHANS Guide to Less Toxic Products. ${tiers[p.topTier]?.short || ''}`);
  const s = d.sectionMap.get(c0.section);
  const crumbs = [{ name: 'Home', href: '/' }, { name: s.title, href: url.section(s.slug) }, { name: c0.title, href: c0.url }, { name: p.name, href: p.url }];
  const noindex = p.status === 'unverified' && !site.indexUnverifiedProducts;
  return {
    path: p.url,
    noindex,
    html: layout({ title: `${p.name}: EHANS rating & where to buy`, description: desc, path: p.url, content, crumbs, noindex, jsonld: [productLD(p, brand?.name || p.brand)] }),
  };
}

// ------------------------------------------------------------------ brands
export function brandPage(d, b) {
  const prods = b.products.map((s) => d.productMap.get(s)).sort((a, z) => (tiers[z.topTier]?.rank ?? 0) - (tiers[a.topTier]?.rank ?? 0));
  const content = html`
<header class="page-h">
  <p class="eyebrow">Brand</p>
  <h1>${esc(b.name)}</h1>
  <p class="muted">${prods.length} product${prods.length === 1 ? '' : 's'} listed in the EHANS guide${b.websites?.length ? ` · ${b.websites.map((w) => linkifyArchived(w)).join(', ')} (archived)` : ''}</p>
</header>
<div class="pgrid">${prods.map((p) => productCard(p, d))}</div>
`;
  const noindex = prods.length < site.minBrandProductsToIndex;
  return {
    path: b.url,
    noindex,
    html: layout({
      noindex,
      title: `${b.name} products: EHANS less toxic ratings`,
      description: truncate(`${prods.length} ${b.name} products rated in the EHANS Guide to Less Toxic Products, including ${prods.slice(0, 3).map((p) => p.name).join(', ')}.`),
      path: b.url,
      content,
      crumbs: [{ name: 'Home', href: '/' }, { name: 'Brands', href: '/brands' }, { name: b.name, href: b.url }],
      jsonld: [itemListLD(`${b.name} products`, prods.map((p) => ({ url: p.url, name: p.name })))],
    }),
  };
}

const azGroups = (items, key) => {
  const g = new Map();
  for (const it of items) {
    const ch = (key(it)[0] || '#').toUpperCase();
    const k = /[A-Z]/.test(ch) ? ch : '#';
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(it);
  }
  return [...g.entries()].sort((a, b) => a[0].localeCompare(b[0]));
};

export function brandsIndex(d) {
  const groups = azGroups([...d.brands].sort((a, b) => a.name.localeCompare(b.name)), (b) => b.name);
  const content = html`
<header class="page-h"><h1>Brands A–Z</h1><p class="lede">${d.brands.length} brands named in the EHANS Guide to Less Toxic Products.</p></header>
<nav class="az" aria-label="Jump to letter">${groups.map(([k]) => `<a href="#b-${k}">${k}</a>`)}</nav>
${groups.map(([k, list]) => `<section class="az-sec" id="b-${k}"><h2>${k}</h2><ul class="cols">${list.map((b) => `<li><a href="${b.url}">${esc(b.name)}</a> <span class="muted">${b.products.length}</span></li>`).join('')}</ul></section>`)}`;
  return { path: '/brands', html: layout({ title: 'Brands A–Z', description: `All ${d.brands.length} brands rated in the EHANS Guide to Less Toxic Products, from personal care to household cleaners.`, path: '/brands', content, crumbs: [{ name: 'Home', href: '/' }, { name: 'Brands', href: '/brands' }] }) };
}

export function productsIndex(d) {
  const groups = azGroups([...d.products].sort((a, b) => a.name.localeCompare(b.name)), (p) => p.name);
  const content = html`
<header class="page-h"><h1>Products A–Z</h1><p class="lede">All ${d.products.length.toLocaleString()} products from the EHANS Guide to Less Toxic Products. Use <a href="/search">search</a> to filter by rating or category.</p></header>
<nav class="az" aria-label="Jump to letter">${groups.map(([k]) => `<a href="#p-${k}">${k}</a>`)}</nav>
${groups.map(([k, list]) => `<section class="az-sec" id="p-${k}"><h2>${k}</h2><ul class="cols">${list.map((p) => `<li><a href="${p.url}">${esc(p.name)}</a> ${tierBadge(p.topTier)}</li>`).join('')}</ul></section>`)}`;
  return { path: '/products', html: layout({ title: 'Products A–Z', description: `Every product rated in the EHANS Guide to Less Toxic Products: ${d.products.length} cosmetics, personal care, baby care and cleaning products.`, path: '/products', content, crumbs: [{ name: 'Home', href: '/' }, { name: 'Products', href: '/products' }] }) };
}

// ------------------------------------------------------------------ ingredients
export function ingredientKeywords(i) {
  const base = i.name.replace(/\(.*?\)/g, '').toLowerCase();
  const parts = base.split(/,| and |\//).map((s) => s.trim()).filter((s) => s.length > 2);
  const abbrev = [...i.name.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].toLowerCase()).filter((s) => s.length <= 6);
  return [...new Set([...parts, ...abbrev])];
}

export function ingredientsIndex(d) {
  const ctx = (i) => i.entries.map((e) => (e.context === 'cleaning' ? 'Cleaning products' : 'Personal care')).join(' · ');
  const content = html`
<header class="page-h">
  <p class="eyebrow">Reference</p>
  <h1>Common hazardous ingredients</h1>
  <p class="lede">The ingredients EHANS screened for when rating products, with the guide’s explanation of each. Products in the Best category contain none of them.</p>
  <p><a class="btn btn-primary" href="/check">${icon('flask', { size: 18 })} Check a product label</a></p>
</header>
<ul class="ing-list">${d.ingredients.map((i) => `<li><a href="${i.url}"><strong>${esc(i.name)}</strong><span class="muted small">${ctx(i)}</span></a></li>`).join('')}</ul>
<p class="muted small">Sources: <a href="/learn/personal-care-ingredients">Common Hazardous Ingredients in Personal Care Products</a> and <a href="/learn/cleaning-product-ingredients">Common Hazardous Ingredients in Cleaning Products</a> (EHANS, 2011).</p>`;
  return { path: '/ingredients', html: layout({ title: 'Common Hazardous Ingredients in Personal Care & Cleaning Products', description: `${d.ingredients.length} hazardous ingredients found in cosmetics, personal care and cleaning products, explained by the Environmental Health Association of Nova Scotia.`, path: '/ingredients', content, crumbs: [{ name: 'Home', href: '/' }, { name: 'Ingredients', href: '/ingredients' }] }) };
}

export function ingredientPage(d, i, mentions) {
  const content = html`
<header class="page-h">
  <p class="eyebrow">Hazardous ingredient</p>
  <h1>${esc(i.name)}</h1>
</header>
${originalNote({ revised: '2011' })}
${i.entries.map((e) => html`<section class="prose original"><h2 class="h-sub">${e.context === 'cleaning' ? 'In cleaning products' : 'In cosmetics &amp; personal care'}</h2>${blocks(e.blocks, d, { headingLevel: 3 })}</section>`)}
${updatePanel(i.update2026, { what: 'this ingredient summary' })}
${mentions.length ? html`<section class="band"><h2 class="h-sec">Mentioned in these guide sections</h2><div class="tiles tiles-sm">${mentions.map((c) => linkTile({ href: c.url, title: c.title, ic: 'leaf' }))}</div></section>` : ''}
<p><a class="btn btn-ghost" href="/check">Check a label for ${esc(i.name.split('(')[0].trim())}</a></p>`;
  let desc = `${i.name}: ${i.entries[0].blocks.find((b) => b.type === 'p')?.text || ''}`;
  if (desc.length < 90) desc += ` Why it is on the EHANS list of common hazardous ingredients, and where it is found.`;
  desc = truncate(desc);
  return { path: i.url, html: layout({ title: `${i.name}: health concerns & where it’s found`, description: desc, path: i.url, content, ogType: 'article', crumbs: [{ name: 'Home', href: '/' }, { name: 'Ingredients', href: '/ingredients' }, { name: i.name, href: i.url }], jsonld: [definedTermLD(i, i.url), articleLD({ title: i.name, description: desc, path: i.url })] }) };
}

// ------------------------------------------------------------------ recipes
export function recipesPage(d) {
  const withRecipes = d.categories.filter((c) => c.blocks.some((b) => b.type === 'homemade'));
  const bySection = d.navSections.map((s) => [s, withRecipes.filter((c) => c.section === s.slug)]).filter(([, l]) => l.length);
  const content = html`
<header class="page-h">
  <p class="eyebrow">Home-made alternatives</p>
  <h1>Less toxic recipes you can make at home</h1>
  <p class="lede">Simple cleaners and personal care products from the EHANS guide, made with baking soda, vinegar, castile soap and other pantry staples. ${withRecipes.length} topics.</p>
  <div class="box box-alert"><p>${icon('alert', { size: 18 })} Never mix bleach with vinegar or ammonia. Label every container. If you are very sensitive, test a small amount first; even natural ingredients and essential oils can cause reactions (see <a href="/learn/essential-oils">Essential Oils: Tips &amp; Cautions</a>).</p></div>
</header>
<nav class="toc"><ul>${bySection.map(([s, l]) => `<li><a href="#r-${s.slug}">${esc(s.title)}</a> <span class="muted">${l.length}</span></li>`).join('')}</ul></nav>
${bySection.map(([s, list]) => html`<section class="band" id="r-${s.slug}"><h2 class="h-sec">${esc(s.title)}</h2>
${list.map((c) => html`<details class="recipe"><summary><span>${esc(c.title)}</span>${icon('chevron', { size: 18 })}</summary>
<div class="prose">${blocks(c.blocks.filter((b) => b.type === 'homemade').flatMap((b) => b.blocks), d, { headingLevel: 3 })}<p><a href="${c.url}">More about ${esc(c.title.toLowerCase())} ${icon('arrow', { size: 16 })}</a></p></div></details>`)}
</section>`)}`;
  return { path: '/recipes', html: layout({ title: 'Home-made Less Toxic Cleaners & Personal Care Recipes', description: 'Home-made alternatives from the EHANS Guide to Less Toxic Products: all-purpose cleaner, laundry, dishwasher, glass cleaner, baby wipes, toothpaste and more.', path: '/recipes', content, crumbs: [{ name: 'Home', href: '/' }, { name: 'Recipes', href: '/recipes' }] }) };
}
