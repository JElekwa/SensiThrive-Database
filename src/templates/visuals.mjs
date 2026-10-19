// Visual helpers: product-type illustrations, chemical "element" tiles for hazardous
// ingredients, and ingredient detection in guide text. Pure SVG/HTML, no images to license.
import { esc, initials } from '../lib/html.mjs';

// ------------------------------------------------------------------ product illustrations
// 120x120 line drawings. .il-b = body, .il-k = cap/accent, .il-l = label. Colours come from CSS.
const SHAPES = {
  bottle: { d: '<rect class="il-k" x="50" y="12" width="20" height="12" rx="2"/><rect class="il-b" x="54" y="24" width="12" height="9"/><rect class="il-b" x="34" y="33" width="52" height="76" rx="14"/>', label: [42, 56, 36, 30] },
  pump: { d: '<path class="il-k" d="M48 12h26v6H64v8h-8v-8h-8z"/><rect class="il-b" x="50" y="26" width="20" height="9" rx="2"/><rect class="il-b" x="36" y="35" width="48" height="74" rx="11"/>', label: [43, 56, 34, 30] },
  tube: { d: '<rect class="il-k" x="38" y="10" width="44" height="8" rx="2"/><path class="il-b" d="M40 18h40l-8 72H48z"/><rect class="il-k" x="49" y="90" width="22" height="18" rx="3"/>', label: [47, 36, 26, 28] },
  jar: { d: '<rect class="il-k" x="28" y="36" width="64" height="16" rx="4"/><rect class="il-b" x="24" y="52" width="72" height="56" rx="12"/>', label: [36, 64, 48, 30] },
  spray: { d: '<path class="il-k" d="M42 14h30l8 10h-10v6H46v-6h-4z"/><path class="il-k" d="M50 30h14v8H50z"/><rect class="il-b" x="38" y="38" width="42" height="71" rx="11"/><path class="il-s" d="M84 16h6M86 22h6M84 10h4"/>', label: [44, 58, 30, 28] },
  jug: { d: '<path class="il-b" d="M38 30h10v10h-6a8 8 0 0 0-8 8"/><rect class="il-k" x="64" y="16" width="18" height="14" rx="2"/><rect class="il-b" x="24" y="30" width="72" height="79" rx="12"/>', label: [34, 58, 52, 32] },
  box: { d: '<rect class="il-k" x="30" y="20" width="60" height="12" rx="3"/><circle class="il-dot" cx="48" cy="26" r="1.8"/><circle class="il-dot" cx="56" cy="26" r="1.8"/><circle class="il-dot" cx="64" cy="26" r="1.8"/><circle class="il-dot" cx="72" cy="26" r="1.8"/><rect class="il-b" x="28" y="32" width="64" height="77" rx="5"/>', label: [36, 54, 48, 34] },
  bar: { d: '<circle class="il-s" cx="40" cy="30" r="7"/><circle class="il-s" cx="56" cy="22" r="4"/><circle class="il-s" cx="80" cy="34" r="5"/><rect class="il-b" x="16" y="50" width="88" height="44" rx="18"/>', label: [30, 60, 60, 24] },
  stick: { d: '<rect class="il-k" x="40" y="10" width="40" height="32" rx="6"/><rect class="il-b" x="38" y="44" width="44" height="65" rx="6"/>', label: [44, 60, 32, 30] },
  compact: { d: '<rect class="il-k" x="52" y="18" width="16" height="6" rx="2"/><circle class="il-b" cx="60" cy="66" r="42"/><circle class="il-l" cx="60" cy="66" r="28"/>', label: null },
  wand: { d: '<rect class="il-k" x="51" y="8" width="18" height="54" rx="6"/><rect class="il-b" x="49" y="62" width="22" height="48" rx="6"/>', label: [51, 72, 18, 30], small: true },
  polish: { d: '<rect class="il-k" x="49" y="10" width="22" height="34" rx="4"/><rect class="il-b" x="30" y="44" width="60" height="64" rx="18"/>', label: [40, 62, 40, 30] },
  diaper: { d: '<path class="il-b" d="M16 38h88v14c-14 6-20 18-22 34-2 14-10 22-22 22s-20-8-22-22c-2-16-8-28-22-34z"/><rect class="il-k" x="16" y="38" width="14" height="14" rx="3"/><rect class="il-k" x="90" y="38" width="14" height="14" rx="3"/>', label: null },
  leaf: { d: '<circle class="il-b" cx="60" cy="60" r="44"/><path class="il-k" d="M38 82c0-26 16-42 44-42 0 26-14 44-40 44"/><path class="il-s" d="M38 82c8-12 18-20 32-26"/>', label: null },
};

const CATEGORY_SHAPE = {
  bottle: ['shampoo', 'conditioner', 'body-wash', 'bath-products', 'bubble-bath', 'baby-shampoo', 'dishwashing-liquid', 'mouthwash', 'hair-colouring', 'body-massage-oil', 'baby-oil', 'makeup-remover', 'toners', 'after-shave', 'permanent-waves', 'douches', 'drain-opener', 'nail-polish-remover', 'toilet-bowl-cleaner', 'cradle-cap', 'lime-mineral-remover', 'bottles-nipples'],
  pump: ['lotions-moisturizers', 'baby-lotion', 'foundation'],
  tube: ['sun-protection', 'toothpaste', 'lubricants', 'shaving', 'concealer', 'tooth-whiteners'],
  jar: ['facial-masks', 'exfoliants', 'hair-oils-pomades', 'hair-relaxers', 'waxing-sugaring', 'metal-polish', 'shoe-care'],
  spray: ['all-purpose-cleaner', 'glass-cleaner', 'window-cleaner', 'air-freshener', 'facial-mists', 'hair-styling', 'disinfectant', 'sink-tub-tile', 'mould-mildew-cleaner', 'oven-cleaner', 'spot-remover', 'upholstery-cleaner', 'carpet-cleaner', 'laundry-stain-remover', 'heavy-duty-cleaner', 'dusting', 'floor-furniture-polish', 'laundry-starch', 'anti-bacterials'],
  jug: ['laundry-detergent', 'fabric-softener', 'bleach', 'floor-cleaner'],
  box: ['scouring-powder', 'baby-powder', 'body-powder', 'dishwasher-detergent', 'carpet-deodorizer', 'denture-cleaners', 'dental-floss', 'menstrual-products', 'baby-wipes'],
  bar: ['soap', 'baby-soap'],
  stick: ['deodorant', 'lip-balm', 'lipstick'],
  compact: ['blush', 'eye-shadow', 'face-powder'],
  wand: ['mascara', 'eyeliner'],
  polish: ['nail-polish', 'artificial-nails'],
  diaper: ['diapers'],
};
const shapeOf = new Map(Object.entries(CATEGORY_SHAPE).flatMap(([shape, slugs]) => slugs.map((s) => [s, shape])));
export const categoryShape = (slug) => shapeOf.get(slug) || 'leaf';

// Sun accent for sunscreen pages, sparkle for cleaners: small extras that make each type recognisable.
const ACCENT = {
  'sun-protection': '<g class="il-sun"><circle cx="96" cy="24" r="9"/><path d="M96 8v4M96 36v4M80 24h4M108 24h4M85 13l3 3M104 32l3 3M85 35l3-3M104 16l3-3"/></g>',
};

export function illustration(shape, { text = '', tier = 'none', accent = '', size = null, cls = '' } = {}) {
  const s = SHAPES[shape] || SHAPES.leaf;
  const L = s.label;
  const label = L
    ? `<rect class="il-l" x="${L[0]}" y="${L[1]}" width="${L[2]}" height="${L[3]}" rx="4"/>${text ? `<text class="il-t${s.small ? ' il-t-sm' : ''}" x="${L[0] + L[2] / 2}" y="${L[1] + L[3] / 2 + 1}">${esc(text)}</text>` : ''}`
    : text && shape === 'compact' ? `<text class="il-t" x="60" y="67">${esc(text)}</text>`
    : text && shape === 'diaper' ? `<text class="il-t" x="60" y="72">${esc(text)}</text>` : '';
  const dims = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="il il-${shape} ilt-${tier} ${cls}" viewBox="0 0 120 120"${dims} aria-hidden="true" focusable="false">${ACCENT[accent] || ''}${s.d}${label}</svg>`;
}

// Product picture: a real photo when one has been added (p.image), otherwise the illustration.
export function productVisual(p, { tier, category, size } = {}) {
  const t = tier || p.topTier || 'none';
  const cat = category || p.categorySlugs?.[0];
  if (p.image) {
    return `<img class="pimg" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async"${size ? ` width="${size}" height="${size}"` : ''}>`;
  }
  return illustration(categoryShape(cat), { text: initials(p.brand || p.name), tier: t, accent: cat, size });
}

// ------------------------------------------------------------------ chemical tiles
// Formula or symbol for each hazardous ingredient (keys are merged ingredient slugs).
// Elements carry their atomic number; mixtures and families use their common abbreviation.
const CHEM = {
  acetone: { f: 'C3H6O' },
  ammonia: { f: 'NH3' },
  diethanolamine: { f: 'C4H11NO2', ab: 'DEA' },
  'd-limonene': { f: 'C10H16' },
  formaldehyde: { f: 'CH2O' },
  'methylene-chloride': { f: 'CH2Cl2' },
  monoethanolamine: { f: 'C2H7NO', ab: 'MEA' },
  morpholine: { f: 'C4H9NO' },
  naphthalene: { f: 'C10H8' },
  paradichlorobenzene: { f: 'C6H4Cl2' },
  'phosphoric-acid': { f: 'H3PO4' },
  'sodium-hypochlorite': { f: 'NaClO' },
  'sodium-lauryl-sulfate': { ab: 'SLS' },
  toluene: { f: 'C7H8' },
  xylene: { f: 'C8H10' },
  'boric-acid-and-sodium-borate': { f: 'H3BO3' },
  bronopol: { f: 'C3H6BrNO4' },
  '1-4-dioxane': { f: 'C4H8O2' },
  hydroquinone: { f: 'C6H6O2' },
  oxybenzone: { f: 'C14H12O3' },
  'propylene-glycol': { f: 'C3H8O2', ab: 'PG' },
  'selenium-sulfide': { f: 'SeS2' },
  'titanium-dioxide': { f: 'TiO2' },
  'triclosan-and-triclocarban': { f: 'C12H7Cl3O2' },
  'iodoproponyl-butylcarbamate': { f: 'C8H12INO2', ab: 'IPBC' },
  thimerosol: { f: 'C9H9HgNaO2S' },
  phenylenediamine: { f: 'C6H8N2', ab: 'PPD' },
  'methylisothiazolinone-and-methylchloroisothiazolinone': { f: 'C4H5NOS', ab: 'MIT' },
  nonylphenol: { f: 'C15H24O' },
  'sodium-dichloroisocyanurate-dihydrate': { ab: 'NaDCC' },
  aluminum: { el: 'Al', n: 13 },
  lead: { el: 'Pb', n: 82 },
  mercury: { el: 'Hg', n: 80 },
  'ethoxylated-nonyl-phenol': { ab: 'NPE' },
  'alpha-hydroxy-acids': { ab: 'AHA' },
  'butylated-hydroxy-anisole': { ab: 'BHA' },
  peg: { ab: 'PEG' },
  'tea-dea-and-mea': { ab: 'TEA' },
  'quaternary-ammonium-compounds': { ab: 'Quats' },
  'fd-and-c-colours': { ab: 'FD&C' },
  'dmdm-hydantoin-diazolidinyl-urea-and-imidazolidinyl-urea': { ab: 'DMDM' },
  nanoparticles: { ab: 'nm' },
  phthalates: { ab: 'PAEs' },
  parabens: { ab: 'Para' },
  fragrance: { ab: 'Parfum' },
  musks: { ab: 'Musk' },
  talc: { ab: 'Talc' },
  'coal-tar-dyes': { ab: 'CI' },
};
const sub = (f) => esc(f).replace(/(\d+)/g, '<sub>$1</sub>');

export function chemTile(i) {
  const c = CHEM[i.slug] || {};
  const short = i.name.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  let face;
  if (c.el) face = `<span class="chem-n">${c.n}</span><span class="chem-sym">${esc(c.el)}</span>`;
  else if (c.f) face = `<span class="chem-f${c.f.length > 8 ? ' chem-f-long' : ''}">${sub(c.f)}</span>${c.ab ? `<span class="chem-ab">${esc(c.ab)}</span>` : ''}`;
  else if (c.ab) face = `<span class="chem-sym chem-sym-ab">${esc(c.ab)}</span>`;
  else face = `<span class="chem-sym chem-sym-ab">${esc(short.split(/\s+/).map((w) => w[0]).join('').slice(0, 3))}</span>`;
  return `<a class="chem" href="${i.url}"><span class="chem-face" aria-hidden="true">${face}</span><span class="chem-name">${esc(short)}</span></a>`;
}

// ------------------------------------------------------------------ ingredient detection
// Which hazardous ingredients does a piece of guide text mention? Returns ingredients with a
// regex for the keyword that matched, so the same rule can highlight the term in the prose.
const AMBIGUOUS = { lead: /\blead\b(?!\s+(?:to|the|a|an|you|people|us|them|in to)\b)(?!-)/i };

export function ingredientMatchers(d, keywordsFor) {
  return d.ingredients.map((i) => {
    const res = keywordsFor(i)
      .filter((k) => k.length > 3 || AMBIGUOUS[k])
      .map((k) => AMBIGUOUS[k] || new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:e?s)?\\b`, 'i'));
    return { i, res };
  }).filter((m) => m.res.length);
}

export function mentionedIngredients(text, matchers) {
  return matchers.filter((m) => m.res.some((re) => re.test(text)));
}

// Link the first mention of each ingredient inside already-rendered HTML, skipping tags and
// existing links. Purely presentational: the words themselves are unchanged.
export function linkIngredientTerms(htmlStr, matchers) {
  const done = new Set();
  let inLink = 0;
  return htmlStr.split(/(<[^>]+>)/).map((part) => {
    if (part.startsWith('<')) {
      if (/^<a[\s>]/i.test(part)) inLink++;
      else if (/^<\/a>/i.test(part)) inLink = Math.max(0, inLink - 1);
      return part;
    }
    if (inLink || !part.trim()) return part;
    let out = part;
    for (const m of matchers) {
      if (done.has(m.i.slug)) continue;
      for (const re of m.res) {
        const g = new RegExp(re.source, 'i');
        const hit = out.match(g);
        if (!hit) continue;
        // don't match inside a link we just inserted
        const before = out.slice(0, hit.index);
        if ((before.match(/<a /g) || []).length > (before.match(/<\/a>/g) || []).length) continue;
        out = `${before}<a class="term" href="${m.i.url}">${hit[0]}</a>${out.slice(hit.index + hit[0].length)}`;
        done.add(m.i.slug);
        break;
      }
    }
    return out;
  }).join('');
}
