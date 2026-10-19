// Trust pages (About / Editorial standards / Disclosure / Privacy / Terms / Contact)
// and app-tool shells (Search / Check / Swaps / Saved / Offline / 404).
import { site, tiers, statuses } from '../../site.config.mjs';
import { esc, html } from '../lib/html.mjs';
import { aboutPageLD } from '../lib/seo.mjs';
import { layout } from '../templates/layout.mjs';
import { icon } from '../templates/icons.mjs';
import { tierBadge } from '../templates/components.mjs';

const H = (name, href) => [{ name: 'Home', href: '/' }, { name, href }];
const editorLine = () => (site.editorName ? esc(site.editorName) : `the ${esc(site.name)} editorial team`);

export function about(d) {
  const s = site.source;
  const content = html`
<header class="page-h">
  <p class="eyebrow">Our roots</p>
  <h1>About ${site.name}</h1>
  <p class="lede">${site.name} is the continuation of <em>The Guide to Less Toxic Products</em>, a free resource researched and written by volunteers of the ${esc(s.org)}.</p>
</header>
<div class="prose">
  <h2>The original guide</h2>
  <p>EHANS (formerly the Nova Scotia Allergy and Environmental Health Association) is a community-based, non-profit charity founded in 1985 and run entirely by volunteers. Its work focuses on the health effects of common hazards in our indoor and outdoor environments, and on support for people living with environmental illnesses.</p>
  <p>Its <em>Guide to Less Toxic Products</em> went online in the mid-2000s at lesstoxicguide.ca. It rated personal care, baby care and household cleaning products by their ingredients, explained the hazards of common chemicals, and shared tips and home-made alternatives from people with chemical sensitivities. After it was featured on CBC’s <em>Marketplace</em> in 2006, more than 600 people a day consulted it. The Globe and Mail, Environmental Defence’s <em>Toxic Nation</em> reports and Clean Nova Scotia all drew on it. The last revision was made in 2011, and the site has since been kept online as an archive.</p>
  <p>You can read EHANS’s own account in <a href="/learn/about-ehans">EHANS: Who We Are and What We Do</a> and <a href="/learn/why-a-guide">Why a Guide to Less Toxic Products?</a>, or visit the <a href="${s.guideArchiveUrl}" rel="noopener" target="_blank">archived original</a>.</p>

  <h2>The people behind it</h2>
  <p>The guide was researched and written by EHANS volunteers. The original credits name these contributors and supporters:</p>
  <ul class="bullets">${s.contributors.map((c) => `<li>${esc(c)}</li>`)}</ul>
  <p>The 2011 revision was funded by:</p>
  <ul class="bullets">${s.funders.map((c) => `<li>${esc(c)}</li>`)}</ul>
  <p>If you contributed to the guide and are not named here, please <a href="/contact">tell us</a> so we can credit you.</p>

  <h2>What ${site.name} adds</h2>
  <ul class="bullets">
    <li><strong>Everything kept.</strong> The original wording, ratings and recipes are reproduced as written and marked as original text. Nothing is deleted. Products that are no longer sold stay listed with a “Discontinued” status.</li>
    <li><strong>2026 updates, clearly marked.</strong> New information appears in separate “2026 update” panels with a date and sources, never mixed into the original text.</li>
    <li><strong>Easier to use.</strong> Search, an ingredient checker, safe-swap suggestions and a saved list that works on your phone, even offline.</li>
    <li><strong>Where to buy.</strong> Links to current retailers for products we have re-checked.</li>
  </ul>

  <h2 id="editor">Who maintains this site</h2>
  <p>${site.name} is maintained by ${editorLine()}.${site.editorBio ? ' ' + esc(site.editorBio) : ''} We are independent of the brands listed. Read our <a href="/editorial-standards">editorial standards</a> and <a href="/affiliate-disclosure">affiliate disclosure</a>.</p>

  <h2>Copyright and permission</h2>
  <p>Original guide text ${esc(s.copyright)}. ${esc(s.permissionNote)} If you represent EHANS and have questions or concerns, please <a href="/contact">contact us</a> and we will respond promptly.</p>

  <h2>Support the original authors</h2>
  <p>EHANS is a registered charity. If this guide has helped you, consider <a href="${s.donateUrl}" rel="noopener" target="_blank">supporting their work</a>.</p>
</div>`;
  return { path: '/about', html: layout({ title: `About ${site.name}: the story of the Guide to Less Toxic Products`, description: `How ${site.name} carries forward the Environmental Health Association of Nova Scotia's Guide to Less Toxic Products, who wrote it, and what we add.`, path: '/about', content, crumbs: H('About', '/about'), jsonld: [aboutPageLD()] }) };
}

export function editorial() {
  const content = html`
<header class="page-h"><p class="eyebrow">Trust</p><h1>Editorial standards</h1><p class="lede">How ratings are made, how we update them, and how we keep commissions out of it.</p></header>
<div class="prose">
  <h2>Ratings come from the original method</h2>
  <p>Every rating on this site was assigned by EHANS using the process described in <a href="/learn/product-selection-process">Our Product Selection Process</a>. In short: a product had to contain fewer hazardous ingredients than most products of its type; no listed product contains synthetic fragrance; and ingredient lists were checked against the guide’s <a href="/ingredients">common hazardous ingredients</a>. Some products were recommended by people with chemical sensitivities who could tolerate them.</p>
  <dl class="rating-defs">${Object.entries(tiers).filter(([k]) => k !== 'avoid').map(([k, t]) => `<div><dt>${tierBadge(k)}</dt><dd>${esc(t.short)}</dd></div>`).join('')}</dl>
  <p>When we review a product for 2026, we apply the same criteria, so a 2026 “Best” means the same as a 2011 “Best”.</p>

  <h2>How a product is re-checked</h2>
  <ol>
    <li>Confirm the product is still sold, under which name, and by whom.</li>
    <li>Read the current full ingredient list from the label or the manufacturer’s official page.</li>
    <li>Compare it with the common hazardous ingredients list and the original rating rules.</li>
    <li>Record the result, the date and the sources. The product’s status changes to one of:</li>
  </ol>
  <ul class="bullets">${Object.values(statuses).map((s) => `<li><strong>${esc(s.label)}:</strong> ${esc(s.help)}</li>`).join('')}</ul>

  <h2>Original text vs. updates</h2>
  <p>Original EHANS text is never rewritten. It appears with a note naming the source and revision date. Anything new appears in a separate, dated “2026 update” panel with its sources. If research has moved on (for example, new regulations or new studies), the update says so plainly, and the original stays visible for the record.</p>

  <h2>Sources we use</h2>
  <p>Manufacturer ingredient lists; government sources such as Health Canada, the US FDA and the European Chemicals Agency; peer-reviewed research; and established databases such as the Campaign for Safe Cosmetics and the Environmental Working Group, which the original guide also cited. We link the sources used in every update.</p>

  <h2>Independence and money</h2>
  <p>Some “Check price” links are affiliate links. A product’s rating is never changed because of a commission, and products with no affiliate program are listed and linked the same way. Brands cannot pay to be listed or rated. See the <a href="/affiliate-disclosure">affiliate disclosure</a>.</p>

  <h2>Corrections</h2>
  <p>If something is wrong, out of date, or you have a product to suggest, please <a href="/contact">tell us</a>. We correct factual errors as quickly as we can and note the date of the change in the update panel.</p>

  <h2>Not medical advice</h2>
  <p>This guide describes ingredients. It cannot tell you how your body will react. People with allergies, asthma, chemical sensitivities, or who are pregnant should talk to a health professional. See our <a href="/terms">terms and medical disclaimer</a>.</p>
</div>`;
  return { path: '/editorial-standards', html: layout({ title: 'Editorial standards: how products are rated and updated', description: 'How SensiThrive rates and re-checks less toxic products using the original EHANS method, keeps original text intact, and keeps affiliate commissions out of ratings.', path: '/editorial-standards', content, crumbs: H('Editorial standards', '/editorial-standards') }) };
}

export function disclosure() {
  const content = html`
<header class="page-h"><p class="eyebrow">Trust</p><h1>Affiliate disclosure</h1></header>
<div class="prose">
  <p>${site.name} is free to use. To cover hosting and the work of re-checking products, some links to retailers are <strong>affiliate links</strong>. If you buy through one, the retailer may pay us a small commission. You pay the same price.</p>
  <ul class="bullets">
    <li>Affiliate links are marked with the “Check price” button and use <code>rel="sponsored"</code>.</li>
    <li>Ratings come from the EHANS guide and our <a href="/editorial-standards">editorial standards</a>. Commissions never change a rating, an order or a recommendation.</li>
    <li>Products without an affiliate program are listed and linked exactly the same way.</li>
    <li>We do not accept payment from brands to be listed, reviewed or rated.</li>
  </ul>
  <p>As an Amazon Associate, ${site.name} may earn from qualifying purchases. <span class="muted">(Keep this sentence only if you join Amazon Associates.)</span></p>
  <p>Questions? <a href="/contact">Contact us</a>.</p>
</div>`;
  return { path: '/affiliate-disclosure', html: layout({ title: 'Affiliate disclosure', description: `How ${site.name} uses affiliate links, and why commissions never affect product ratings.`, path: '/affiliate-disclosure', content, crumbs: H('Affiliate disclosure', '/affiliate-disclosure') }) };
}

export function privacy() {
  const content = html`
<header class="page-h"><p class="eyebrow">Legal</p><h1>Privacy policy</h1><p class="muted">Last updated ${esc(site.lastReviewed)}</p></header>
<div class="prose">
  <p>We collect as little as possible.</p>
  <h2>On your device</h2>
  <p>Your saved products and recent searches are stored in your browser’s local storage. They never leave your device, and you can clear them at any time from the <a href="/saved">Saved</a> page or your browser settings.</p>
  <h2>Outbound link clicks</h2>
  <p>When you click a “Check price” or “Find it online” button, we record which product was clicked, the time, and the referring page, so we can see which products people look for. We do not store your IP address or any identifier that could identify you.</p>
  <h2>Contact form</h2>
  <p>If you write to us, we keep your name, email and message only to reply and to fix any issue you report.</p>
  <h2>Hosting and fonts</h2>
  <p>The site is hosted on Vercel and data is stored with Supabase. Fonts are loaded from Google Fonts. These providers process standard request data (such as IP address) to deliver the service. Retailers you visit through our links have their own privacy policies.</p>
  <h2>Contact</h2>
  <p>Questions or deletion requests: <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>
</div>`;
  return { path: '/privacy', html: layout({ title: 'Privacy policy', description: `What ${site.name} collects (very little) and how it is used.`, path: '/privacy', content, crumbs: H('Privacy', '/privacy') }) };
}

export function terms() {
  const content = html`
<header class="page-h"><p class="eyebrow">Legal</p><h1>Terms &amp; medical disclaimer</h1><p class="muted">Last updated ${esc(site.lastReviewed)}</p></header>
<div class="prose">
  <h2>Not medical advice</h2>
  <p>${site.name} provides general information about product ingredients. It is not medical advice and is not a substitute for advice from a doctor, allergist, pharmacist or other qualified professional. Individual sensitivities vary widely; a product rated “Best” may still cause a reaction for you.</p>
  <h2>Information may change</h2>
  <p>As the original guide warned, “product formulations change frequently” and scientific understanding develops. Ratings marked “Not yet re-checked” reflect the 2011 guide. Always read the current label before buying or using a product.</p>
  <h2>Original content</h2>
  <p>Original guide text ${esc(site.source.copyright)}. ${esc(site.source.permissionNote)} Do not copy it from this site without permission from EHANS.</p>
  <h2>Links</h2>
  <p>We link to retailers and other websites we do not control. Some links are affiliate links (see the <a href="/affiliate-disclosure">disclosure</a>). Old website addresses from the 2011 guide link to archived copies at the Internet Archive.</p>
  <h2>Liability</h2>
  <p>We work to keep information accurate but make no warranty that it is complete or current. Use of this site is at your own risk.</p>
</div>`;
  return { path: '/terms', html: layout({ title: 'Terms and medical disclaimer', description: `Terms of use and medical disclaimer for ${site.name}.`, path: '/terms', content, crumbs: H('Terms', '/terms') }) };
}

export function contact() {
  const content = html`
<header class="page-h"><p class="eyebrow">Contact</p><h1>Contact &amp; corrections</h1><p class="lede">Spotted an outdated product, a broken link or a mistake? Want to suggest a product? We read everything.</p></header>
<form class="form card" method="post" action="/api/contact" data-ajax>
  <label>Your name <input name="name" autocomplete="name" maxlength="120"></label>
  <label>Email <input name="email" type="email" autocomplete="email" required maxlength="200"></label>
  <label>Topic
    <select name="topic">
      <option value="correction">Correction or outdated product</option>
      <option value="suggestion">Suggest a product</option>
      <option value="ehans">EHANS / original authors</option>
      <option value="other">Something else</option>
    </select>
  </label>
  <label>Product or page (optional) <input name="ref" maxlength="300"></label>
  <label>Message <textarea name="message" rows="6" required maxlength="5000"></textarea></label>
  <label class="hp" aria-hidden="true">Leave empty <input name="website" tabindex="-1" autocomplete="off"></label>
  <button class="btn btn-primary" type="submit">Send message</button>
  <p class="form-status" role="status"></p>
</form>
<p class="muted">Or email <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>`;
  return { path: '/contact', html: layout({ title: 'Contact & corrections', description: `Report an outdated product, suggest a product or contact the ${site.name} team.`, path: '/contact', content, crumbs: H('Contact', '/contact') }) };
}

// ------------------------------------------------------------------ app tools
export function searchPage() {
  const content = html`
<header class="page-h"><h1>Search</h1></header>
<form class="bigsearch" action="/search" role="search" data-search-form>
  <label class="sr" for="sq">Search products, brands, categories or ingredients</label>
  ${icon('search')}
  <input id="sq" name="q" type="search" placeholder="Try “unscented laundry” or “parabens”" autocomplete="off" enterkeyhint="search" autofocus>
  <button type="submit">Search</button>
</form>
<div class="filters" role="group" aria-label="Filter by rating" data-filters>
  <button type="button" class="filter" data-tier="" aria-pressed="true">All</button>
  ${['best', 'good', 'less-toxic', 'unscented'].map((t) => `<button type="button" class="filter" data-tier="${t}" aria-pressed="false">${tiers[t].label}</button>`)}
</div>
<div id="results" class="results" aria-live="polite"><p class="muted">Start typing to search ${'the whole guide'}.</p></div>
<noscript><p>Search needs JavaScript. You can browse the <a href="/guide">guide</a>, <a href="/products">products A–Z</a> or <a href="/brands">brands A–Z</a> instead.</p></noscript>`;
  return { path: '/search', html: layout({ title: 'Search the guide', description: 'Search less toxic products, brands, categories and hazardous ingredients from the EHANS Guide to Less Toxic Products.', path: '/search', content, noindex: true, bodyClass: 'page-search' }) };
}

export function checkPage(d) {
  const content = html`
<header class="page-h">
  <p class="eyebrow">Tool</p>
  <h1>Ingredient checker</h1>
  <p class="lede">Paste the ingredient list from a label. We highlight anything on the guide’s lists of common hazardous ingredients and link to the explanation.</p>
</header>
<form class="card checker" data-checker>
  <label for="ingr">Ingredient list</label>
  <textarea id="ingr" rows="6" placeholder="e.g. Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Parfum, Methylparaben…"></textarea>
  <div class="row"><button class="btn btn-primary" type="submit">Check ingredients</button><button class="btn btn-ghost" type="button" data-clear>Clear</button></div>
</form>
<div id="check-results" aria-live="polite"></div>
<p class="muted small">${icon('info', { size: 16 })} This tool matches names only. Labels may not list everything (fragrance ingredients, contaminants such as 1,4-dioxane). No flags does not mean a product is safe for you. It is not medical advice.</p>
<section class="band"><h2 class="h-sec">What it checks for</h2><ul class="cols">${d.ingredients.map((i) => `<li><a href="${i.url}">${esc(i.name)}</a></li>`).join('')}</ul></section>`;
  return { path: '/check', html: layout({ title: 'Ingredient checker: scan a label for hazardous ingredients', description: 'Paste a cosmetic, personal care or cleaning product ingredient list and see which ingredients appear on the EHANS list of common hazardous ingredients.', path: '/check', content, bodyClass: 'page-check' }) };
}

export function swapsPage(d) {
  const cats = d.categories.filter((c) => c.products.length);
  const content = html`
<header class="page-h">
  <p class="eyebrow">Tool</p>
  <h1>Safe swaps</h1>
  <p class="lede">What are you using now? Pick the product type and see the guide’s Best and Good alternatives.</p>
</header>
<form class="bigsearch" data-swap-form onsubmit="return false">
  <label class="sr" for="swq">Product type</label>
  ${icon('swap')}
  <input id="swq" type="search" placeholder="e.g. shampoo, dish soap, diaper cream" autocomplete="off" list="swap-types">
  <datalist id="swap-types">${cats.map((c) => `<option value="${esc(c.title)}">`).join('')}</datalist>
</form>
<div id="swap-results" aria-live="polite"></div>
<section class="band" data-swap-all>
  <h2 class="h-sec">All product types</h2>
  <ul class="cols">${cats.map((c) => `<li><a href="${c.url}" data-swap-cat="${c.slug}">${esc(c.title)}</a> <span class="muted">${c.products.length}</span></li>`).join('')}</ul>
</section>`;
  return { path: '/swaps', html: layout({ title: 'Safe swaps: less toxic alternatives to everyday products', description: 'Find less toxic alternatives to the shampoo, deodorant, laundry detergent, cleaners and baby products you use now, from the EHANS guide.', path: '/swaps', content }) };
}

export function savedPage() {
  const content = html`
<header class="page-h"><h1>Saved</h1><p class="lede">Your shortlist, stored on this device only. Works offline.</p></header>
<div id="saved-list" class="pgrid"></div>
<div id="saved-empty" class="empty" hidden>${icon('bookmark', { size: 32 })}<p>Nothing saved yet. Tap the bookmark on any product to keep it here.</p><a class="btn btn-primary" href="/guide">Browse the guide</a></div>
<div class="row" id="saved-actions" hidden><button class="btn btn-ghost" type="button" data-share-saved>${icon('share', { size: 18 })} Share list</button><button class="btn btn-ghost" type="button" data-clear-saved>Clear all</button></div>
<noscript><p>Saving products needs JavaScript.</p></noscript>`;
  return { path: '/saved', html: layout({ title: 'Saved products', description: 'Your saved less toxic products.', path: '/saved', content, noindex: true }) };
}

export function offlinePage() {
  const content = html`<div class="empty">${icon('leaf', { size: 36 })}<h1>You’re offline</h1><p>This page isn’t saved on your device yet. Pages you have opened before, and your <a href="/saved">saved list</a>, still work.</p><a class="btn btn-primary" href="/">Go home</a></div>`;
  return { path: '/offline', html: layout({ title: 'Offline', description: 'You are offline.', path: '/offline', content, noindex: true }) };
}

export function notFound() {
  const content = html`<div class="empty">${icon('search', { size: 36 })}<h1>Page not found</h1><p>The page may have moved. Try searching the guide.</p><form class="bigsearch" action="/search">${icon('search')}<input name="q" type="search" placeholder="Search the guide" aria-label="Search the guide"><button>Search</button></form></div>`;
  return { path: '/404', html: layout({ title: 'Page not found', description: 'Page not found.', path: '/404', content, noindex: true }) };
}
