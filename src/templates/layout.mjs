import { site } from '../../site.config.mjs';
import { esc, html } from '../lib/html.mjs';
import { abs, breadcrumbLD } from '../lib/seo.mjs';
import { icon } from './icons.mjs';

export const ASSET_VERSION = { css: '', js: '' }; // filled by build with content hashes

const NAV = [
  { href: '/guide', label: 'Guide' },
  { href: '/search', label: 'Search' },
  { href: '/check', label: 'Ingredient Checker' },
  { href: '/swaps', label: 'Safe Swaps' },
  { href: '/ingredients', label: 'Ingredients' },
  { href: '/about', label: 'About' },
];

const TABS = [
  { href: '/', label: 'Discover', icon: 'compass' },
  { href: '/guide', label: 'Guide', icon: 'book' },
  { href: '/search', label: 'Search', icon: 'search' },
  { href: '/check', label: 'Check', icon: 'flask' },
  { href: '/saved', label: 'Saved', icon: 'bookmark' },
];

const isActive = (href, path) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/'));

export function breadcrumbs(crumbs) {
  if (!crumbs?.length) return '';
  return html`<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(
    (c, i) =>
      `<li>${c.href && i < crumbs.length - 1 ? `<a href="${c.href}">${esc(c.name)}</a>` : `<span aria-current="page">${esc(c.name)}</span>`}</li>`
  )}</ol></nav>`;
}

export function layout({ title, description, path, content, jsonld = [], crumbs, noindex = false, ogType = 'website', ogImage = '/og-default.png', bodyClass = '', fullTitle = false }) {
  const pageTitle = fullTitle ? title : `${title} | ${site.name}`;
  const robots = !site.allowIndexing || noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  const ld = [...jsonld];
  if (crumbs?.length > 1) ld.push(breadcrumbLD(crumbs));
  const canonical = abs(path === '/' ? '/' : path);
  return html`<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="light">
<meta property="og:site_name" content="${site.name}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs(ogImage)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="${site.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs(ogImage)}">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">` : ''}
${site.bingSiteVerification ? `<meta name="msvalidate.01" content="${esc(site.bingSiteVerification)}">` : ''}
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/icons/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${site.name}">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500&family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap">
<link rel="stylesheet" href="/assets/app.css?v=${ASSET_VERSION.css}">
${ld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)}
<script src="/assets/app.js?v=${ASSET_VERSION.js}" defer></script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <div class="wrap topbar-in">
    <details class="drawer">
      <summary class="icon-btn" aria-label="Open menu">${icon('menu', { size: 22 })}</summary>
      <div class="drawer-panel" role="dialog" aria-label="Menu">
        <nav aria-label="Main">
          <a href="/">Home</a>
          ${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`)}
          <a href="/saved">Saved products</a>
          <a href="/recipes">Home-made recipes</a>
          <a href="/brands">Brands A–Z</a>
          <a href="/products">Products A–Z</a>
          <a href="/editorial-standards">Editorial standards</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </details>
    <a class="brand" href="/" aria-label="${site.name} home">
      <img src="/brand/mark.png" alt="" width="26" height="42">
      <span class="wordmark">SensiThrive</span>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${NAV.map((n) => `<a href="${n.href}"${isActive(n.href, path) ? ' aria-current="page"' : ''}>${n.label}</a>`)}
    </nav>
    <a class="icon-btn" href="/search" aria-label="Search">${icon('search', { size: 22 })}</a>
  </div>
</header>
<main id="main" class="wrap">
${breadcrumbs(crumbs)}
${content}
</main>
${footer()}
<nav class="tabbar" aria-label="App">
  ${TABS.map(
    (t) => `<a href="${t.href}"${isActive(t.href, path) ? ' aria-current="page"' : ''}>${icon(t.icon, { size: 22 })}<span>${t.label}</span>${t.href === '/saved' ? '<b class="saved-count" hidden></b>' : ''}</a>`
  )}
</nav>
</body>
</html>`;
}

function footer() {
  const s = site.source;
  return html`<footer class="footer">
  <div class="wrap">
    <section class="credit" aria-labelledby="credit-h">
      <h2 id="credit-h">Built on the work of ${s.orgShort}</h2>
      <p>The product ratings and original text on this site come from <em>The Guide to Less Toxic Products</em>, written and researched by volunteers of the ${esc(s.org)} and last revised in ${s.lastRevised}. ${esc(s.copyright)}. ${esc(s.permissionNote)}</p>
      <p><a href="/about">Read the history of the guide</a> · <a href="${s.donateUrl}" rel="noopener" target="_blank">Support EHANS</a></p>
    </section>
    <div class="footer-cols">
      <div>
        <h3>Guide</h3>
        <a href="/guide/personal-care">Cosmetics &amp; personal care</a>
        <a href="/guide/household-cleaners">Household cleaners</a>
        <a href="/guide/baby-care">Baby care</a>
        <a href="/ingredients">Hazardous ingredients</a>
        <a href="/recipes">Home-made recipes</a>
      </div>
      <div>
        <h3>Tools</h3>
        <a href="/search">Search</a>
        <a href="/check">Ingredient checker</a>
        <a href="/swaps">Safe swaps</a>
        <a href="/saved">Saved</a>
      </div>
      <div>
        <h3>About</h3>
        <a href="/about">Our roots</a>
        <a href="/editorial-standards">Editorial standards</a>
        <a href="/affiliate-disclosure">Affiliate disclosure</a>
        <a href="/contact">Contact &amp; corrections</a>
      </div>
      <div>
        <h3>Legal</h3>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms &amp; medical disclaimer</a>
      </div>
    </div>
    <p class="fine">Some links on this site may earn us a commission, at no cost to you. Commissions never decide ratings. ${site.name} is not medical advice; talk to a health professional about your own sensitivities.</p>
    <p class="fine">© ${new Date().getFullYear()} ${esc(site.publisherName)}. Original guide text © EHANS.</p>
  </div>
</footer>`;
}
