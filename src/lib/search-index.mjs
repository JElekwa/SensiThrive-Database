// Compact client-side index for search, safe swaps and the ingredient checker.
import { tiers } from '../../site.config.mjs';
import { ingredientKeywords } from '../pages/content.mjs';

// Extra label spellings for the ingredient checker, keyed by a word in the ingredient's name.
// Only synonyms / INCI spellings of the same substance (no new hazard claims).
const ALIASES = {
  paraben: ['paraben'],
  fragrance: ['fragrance', 'parfum', 'perfume', 'aroma'],
  'sodium lauryl sulfate': ['sodium lauryl sulfate', 'sodium laureth sulfate', 'sodium lauryl sulphate', 'sodium laureth sulphate', 'sls', 'sles'],
  peg: ['peg-', 'polyethylene glycol'],
  'polyethylene glycol': ['peg-', 'polyethylene glycol'],
  'dmdm hydantoin': ['dmdm hydantoin', 'diazolidinyl urea', 'imidazolidinyl urea'],
  bronopol: ['bronopol', '2-bromo-2-nitropropane-1,3-diol'],
  'butylated hydroxy': ['bha', 'bht', 'butylated hydroxyanisole', 'butylated hydroxytoluene'],
  'coal tar': ['coal tar', 'fd&c', 'd&c'],
  'fd&c': ['fd&c', 'd&c'],
  'tea, dea': ['triethanolamine', 'diethanolamine', 'monoethanolamine', 'tea', 'dea', 'mea', 'cocamide dea', 'lauramide dea', 'cocamide mea'],
  'diethanolamine': ['diethanolamine', 'dea', 'cocamide dea', 'lauramide dea'],
  monoethanolamine: ['monoethanolamine', 'mea'],
  triclosan: ['triclosan', 'triclocarban'],
  quaternary: ['benzalkonium chloride', 'quaternium-', 'cetrimonium chloride', 'behentrimonium chloride', 'cetrimonium bromide'],
  methylisothiazolinone: ['methylisothiazolinone', 'methylchloroisothiazolinone', 'mit', 'cmit'],
  phthalate: ['phthalate', 'dbp', 'dep', 'dehp'],
  musk: ['musk', 'galaxolide', 'tonalide'],
  talc: ['talc', 'talcum'],
  'titanium dioxide': ['titanium dioxide', 'ci 77891'],
  oxybenzone: ['oxybenzone', 'benzophenone-3'],
  aluminum: ['aluminum', 'aluminium'],
  'alpha hydroxy': ['glycolic acid', 'lactic acid', 'salicylic acid', 'alpha hydroxy', 'beta hydroxy'],
  'boric acid': ['boric acid', 'sodium borate', 'borax'],
  'propylene glycol': ['propylene glycol'],
  polysorbate: ['polysorbate 60', 'polysorbate 80', 'polysorbate-60', 'polysorbate-80'],
  nonylphenol: ['nonylphenol', 'nonoxynol'],
  'ethoxylated nonyl': ['nonylphenol ethoxylate', 'nonoxynol'],
  phenylenediamine: ['phenylenediamine', 'ppd'],
  thimerosol: ['thimerosal', 'thimerosol'],
  iodoproponyl: ['iodopropynyl butylcarbamate', 'iodoproponyl butylcarbamate'],
  'benzyl alcohol': ['benzyl alcohol', 'isopropyl alcohol'],
  'd-limonene': ['limonene', 'd-limonene'],
  'sodium hypochlorite': ['sodium hypochlorite', 'chlorine bleach'],
  nanoparticles: ['nano', '(nano)'],
};

export function buildSearchIndex(d) {
  const catIdx = new Map(d.categories.map((c, i) => [c.slug, i]));
  const rank = (t) => tiers[t]?.rank ?? 0;
  const c = d.categories.map((x) => {
    const s = d.sectionMap.get(x.section);
    const picks = [...x.products].sort((a, b) => rank(b.tier) - rank(a.tier)).filter((p) => rank(p.tier) >= 2).slice(0, 16).map((p) => [p.slug, p.tier]);
    return [x.slug, x.title, x.url, x.groupTitle || s.title, x.products.length, picks];
  });
  const p = d.products.filter((x) => x.categorySlugs.length).map((x) => [x.slug, x.name, x.brand, x.topTier || '', catIdx.get(x.categorySlugs[0]), x.status === 'unverified' ? 0 : 1]);
  const b = d.brands.map((x) => [x.slug, x.name, x.products.length]);
  const i = d.ingredients.map((x) => {
    const n = x.name.toLowerCase();
    const extra = Object.entries(ALIASES).filter(([k]) => n.includes(k)).flatMap(([, v]) => v);
    return [x.slug, x.name, [...new Set([...ingredientKeywords(x), ...extra])]];
  });
  const a = d.articles.map((x) => [x.url, x.title]);
  return { v: 1, c, p, b, i, a };
}
