import { site, tiers, statuses } from '../../site.config.mjs';
import { esc, html, linkifyArchived, initials } from '../lib/html.mjs';
import { url } from '../lib/dataset.mjs';
import { icon } from './icons.mjs';
import { productVisual } from './visuals.mjs';

export const tierBadge = (tier, { label } = {}) =>
  tier ? `<span class="badge t-${tier}" title="${esc(tiers[tier]?.short || '')}">${esc(label || tiers[tier]?.label || tier)}</span>` : '';

export const statusChip = (status) => {
  const s = statuses[status] || statuses.unverified;
  return `<span class="chip s-${s.tone}" title="${esc(s.help)}">${esc(s.label)}</span>`;
};

export const saveButton = (slug, name, { compact = false } = {}) =>
  `<button type="button" class="save${compact ? ' save-sm' : ''}" data-save="${esc(slug)}" data-name="${esc(name)}" aria-pressed="false" aria-label="Save ${esc(name)}">${icon('bookmark', { size: compact ? 18 : 20, cls: 'off' })}${icon('bookmarkFill', { size: compact ? 18 : 20, cls: 'on' })}${compact ? '' : '<span>Save</span>'}</button>`;

export const monogram = (name, tier) => `<span class="mono t-${tier || 'none'}" aria-hidden="true">${esc(initials(name))}</span>`;

// "Where to buy": data for the hover (desktop) / tap (phone) panel that app.js builds. Store URLs are not
// in the page: each button goes to /go/<slug>/<position>, which looks the link up live and logs the click.
export const buyAttrs = (p) =>
  p.shopLinks?.length
    ? ` data-buy="${esc(p.slug)}" data-name="${esc(p.name)}" data-brand="${esc(p.brand)}" data-status="${esc(p.status)}" data-stores="${esc(JSON.stringify(p.shopLinks.map((l) => [l.position, l.store])))}"`
    : '';

export function buyButton(p) {
  const n = p.shopLinks?.length || 0;
  if (!n) return `<a class="buy-btn buy-none" href="/go/${esc(p.slug)}" rel="nofollow noopener" target="_blank">${icon('search', { size: 15 })}<span>Find it online</span></a>`;
  return `<a class="buy-btn" href="${p.url}#buy" data-buy-open aria-haspopup="dialog">${icon('bag', { size: 16 })}<span>Where to buy</span><span class="buy-n" aria-label="${n} store${n === 1 ? '' : 's'}">${n}</span></a>`;
}

export function storeButtons(p) {
  return p.shopLinks.map((l, i) => `<a class="btn ${i === 0 ? 'btn-primary' : 'btn-ghost'} btn-block" href="/go/${esc(p.slug)}/${l.position}" rel="sponsored nofollow noopener" target="_blank">${esc(l.store)} ${icon('external', { size: 18 })}</a>`).join('');
}

export function productCard(p, d, { tier } = {}) {
  const t = tier || p.topTier;
  const cat = d.categoryMap.get(p.categorySlugs[0]);
  return html`<article class="pcard"${buyAttrs(p)}>
  <a class="pcard-link" href="${p.url}">
    <span class="pcard-img">${productVisual(p, { tier: t })}</span>
    <span class="pcard-body">
      <span class="pcard-meta">${tierBadge(t)} ${cat ? `<span class="muted">${esc(cat.title)}</span>` : ''}</span>
      <span class="pcard-name">${esc(p.name)}</span>
      <span class="pcard-brand">${esc(p.brand)}</span>
    </span>
  </a>
  ${p.shopLinks?.length ? `<a class="buy-ic" href="${p.url}#buy" data-buy-open aria-haspopup="dialog" aria-label="Where to buy ${esc(p.name)}">${icon('bag', { size: 18 })}</a>` : ''}
  ${saveButton(p.slug, p.name, { compact: true })}
</article>`;
}

function itemRow(it, d, tier) {
  if (it.subhead) return `<li class="subhead">${esc(it.text)}</li>`;
  const p = it.product && d.productMap.get(it.product);
  if (!p) return `<li class="plain">${linkifyArchived(it.text)}</li>`;
  // show the original line, linking the product name part
  const extra = it.text.length > p.name.length + 3 ? `<span class="orig">${linkifyArchived(it.text)}</span>` : '';
  return html`<li class="prow">
    <a href="${p.url}">${monogram(p.name, tier)}<span><strong>${esc(p.name)}</strong>${extra}</span></a>
    ${saveButton(p.slug, p.name, { compact: true })}
  </li>`;
}

export function blocks(list, d, { headingLevel = 2 } = {}) {
  const h = `h${headingLevel}`;
  return list
    .map((b) => {
      switch (b.type) {
        case 'p':
          return `<p>${linkifyArchived(b.text)}</p>`;
        case 'lines':
          return `<p class="lines">${b.lines.map((l) => linkifyArchived(l)).join('<br>')}</p>`;
        case 'list':
          return `<ul class="bullets">${b.items.map((i) => `<li>${linkifyArchived(i)}</li>`).join('')}</ul>`;
        case 'tier':
          return html`<section class="tier tier-${b.tier}">
  <header class="tier-h">${tierBadge(b.tier)}<${h}>${esc(cleanTierLabel(b.label, b.tier))}</${h}></header>
  <p class="tier-def">${esc(tiers[b.tier]?.short || '')}</p>
  ${b.notes.map((n) => `<p class="note">${linkifyArchived(n)}</p>`)}
  ${b.items.length ? `<ul class="plist">${b.items.map((it) => itemRow(it, d, b.tier)).join('')}</ul>` : ''}
</section>`;
        case 'tips':
          return box('tips', 'bulb', b.label || 'Tips', b.blocks, d, h);
        case 'homemade':
          return box('homemade', 'bowl', b.label || 'Home-made Alternatives', b.blocks, d, h);
        case 'alert':
          return box('alert', 'alert', b.label || 'Health Alert', b.blocks, d, h);
        default:
          return '';
      }
    })
    .join('\n');
}

export function cleanTierLabel(label, tier) {
  const base = tiers[tier]?.label || label;
  const extra = label.replace(/^(Best|Good|Simply Unscented|Less[- ]?toxic Alternatives?|Not as Good as Good but Widely Available)/i, '').trim();
  return extra ? `${base} ${extra}` : label.match(/alternatives/i) ? 'Less Toxic Alternatives' : base;
}

const box = (cls, ic, label, inner, d, h) =>
  `<aside class="box box-${cls}"><${h} class="box-h">${icon(ic)}${esc(label)}</${h}>${blocks(inner, d, { headingLevel: 3 })}</aside>`;

export function originalNote({ revised }) {
  return html`<p class="source-note">${icon('history', { size: 18 })}<span>Original text from the <a href="/about">EHANS Guide to Less Toxic Products</a>${revised ? `, revised ${esc(revised)}` : ''}. Product formulas change, so always read the current label.</span></p>`;
}

export function updatePanel(update, { what = 'this page' } = {}) {
  if (update?.text) {
    return html`<aside class="update">
  <h2>${icon('leaf')} 2026 update</h2>
  <div>${update.text.split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`)}</div>
  ${update.sources?.length ? `<p class="sources">Sources: ${update.sources.map((s) => `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a>`).join(' · ')}</p>` : ''}
  <p class="muted small">Reviewed ${esc(update.date || site.lastReviewed)}${update.reviewer ? ` by ${esc(update.reviewer)}` : ''}.</p>
</aside>`;
  }
  return html`<aside class="update update-pending">
  <h2>${icon('leaf')} 2026 review in progress</h2>
  <p>We are re-checking ${what} against current formulas and research. The original guide text is shown unchanged until that review is published. <a href="/editorial-standards">How we review</a></p>
</aside>`;
}

export const sectionIcon = (slug) =>
  ({ 'personal-care': 'drop', 'household-cleaners': 'spray', 'baby-care': 'baby', 'consumer-advice': 'info', 'chemical-hazards': 'alert', institutional: 'shield', 'using-this-guide': 'book' })[slug] || 'leaf';

export function linkTile({ href, title, text, ic, count }) {
  return html`<a class="tile" href="${href}">
  <span class="tile-ic">${icon(ic || 'leaf', { size: 22 })}</span>
  <span class="tile-t">${esc(title)}</span>
  ${text ? `<span class="tile-d">${esc(text)}</span>` : ''}
  ${count != null ? `<span class="tile-c">${count}</span>` : ''}
  ${icon('chevron', { size: 18, cls: 'tile-go' })}
</a>`;
}

export const disclosureLine = () =>
  `<p class="disclosure">${icon('info', { size: 16 })}<span>Some outbound links may earn ${site.name} a commission at no cost to you. Ratings come from the EHANS guide and our published standards, never from commissions. <a href="/affiliate-disclosure">Disclosure</a></span></p>`;

export { url };
