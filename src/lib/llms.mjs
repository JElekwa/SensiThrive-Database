// llms.txt (https://llmstxt.org) summary and a full-text companion for AI search / assistants.
import { site, tiers } from '../../site.config.mjs';

const line = (s) => String(s || '').replace(/\s+/g, ' ').trim();

export function llmsTxt(d) {
  const out = [];
  out.push(`# ${site.name}`);
  out.push('');
  out.push(`> ${site.description}`);
  out.push('');
  out.push(`${site.name} reproduces and updates "The Guide to Less Toxic Products" by the ${site.source.org}, last revised ${site.source.lastRevised}. Please credit EHANS when citing the original ratings and text, and ${site.name} when citing 2026 updates.`);
  out.push('');
  out.push('Rating categories (from the original guide):');
  for (const k of ['best', 'good', 'less-toxic', 'unscented']) out.push(`- ${tiers[k].label}: ${tiers[k].short}`);
  out.push('');
  out.push(`Totals: ${d.stats.products} products, ${d.stats.categories} categories, ${d.stats.brands} brands, ${d.stats.ingredients} hazardous ingredients explained.`);
  out.push('');
  out.push('## Key pages');
  out.push(`- [About and history](${site.url}/about): who wrote the guide and what is new`);
  out.push(`- [Editorial standards](${site.url}/editorial-standards): how ratings are made and updated`);
  out.push(`- [Hazardous ingredients](${site.url}/ingredients): the ingredient list used to rate products`);
  out.push(`- [Home-made recipes](${site.url}/recipes)`);
  out.push(`- [Full text for LLMs](${site.url}/llms-full.txt)`);
  for (const s of d.navSections) {
    out.push('');
    out.push(`## ${s.title}`);
    const cats = [...(s.categories || []), ...d.groups.filter((g) => g.section === s.slug).flatMap((g) => g.categories)].map((c) => d.categoryMap.get(c));
    for (const c of cats) out.push(`- [${c.title}](${site.url}${c.url})${c.products.length ? `: ${c.products.length} rated products` : ''}`);
    for (const a of (s.articles || []).map((x) => d.articleMap.get(x))) out.push(`- [${a.title}](${site.url}${a.url})`);
  }
  out.push('');
  return out.join('\n');
}

export function llmsFullTxt(d) {
  const out = [`# ${site.name}: The Guide to Less Toxic Products (full text)`, '', `Source: ${site.source.org}, ${site.source.lastRevised}. ${site.source.copyright}. ${site.source.permissionNote}`, ''];
  for (const s of d.navSections) {
    const cats = [...(s.categories || []), ...d.groups.filter((g) => g.section === s.slug).flatMap((g) => g.categories)].map((c) => d.categoryMap.get(c));
    for (const c of cats) {
      out.push(`## ${c.title} (${s.title})`, `URL: ${site.url}${c.url}`, '');
      for (const b of c.blocks) {
        if (b.type === 'p') out.push(line(b.text), '');
        else if (b.type === 'list') out.push(...b.items.map((i) => `- ${line(i)}`), '');
        else if (b.type === 'tier') {
          out.push(`### ${tiers[b.tier]?.label || b.label}`);
          for (const n of b.notes) out.push(line(n));
          for (const it of b.items) out.push(`- ${line(it.text)}`);
          out.push('');
        } else if (b.blocks) {
          out.push(`### ${b.label}`);
          for (const x of b.blocks) {
            if (x.type === 'p') out.push(line(x.text));
            if (x.type === 'list') out.push(...x.items.map((i) => `- ${line(i)}`));
            if (x.type === 'lines') out.push(...x.lines.map(line));
          }
          out.push('');
        }
      }
    }
  }
  out.push('## Common hazardous ingredients', '');
  for (const i of d.ingredients) {
    out.push(`### ${i.name}`, `URL: ${site.url}${i.url}`);
    for (const e of i.entries) for (const b of e.blocks) if (b.type === 'p') out.push(line(b.text));
    out.push('');
  }
  return out.join('\n');
}
