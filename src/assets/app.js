/* SensiThrive client: saved list, search, ingredient checker, safe swaps, contact form, PWA.
   No dependencies. Everything degrades to plain links when JavaScript is off. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const TIER = { best: 'Best', good: 'Good', 'less-toxic': 'Less Toxic', unscented: 'Simply Unscented', 'widely-available': 'Widely Available', avoid: 'Avoid' };
  const RANK = { best: 3, good: 2, 'less-toxic': 2, unscented: 1, 'widely-available': 1, avoid: 0 };
  const badge = (t) => (t ? `<span class="badge t-${t}">${TIER[t] || t}</span>` : '');
  const initials = (n) => n.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '•';

  // ---------------------------------------------------------------- storage (safe)
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const SAVED = 'st:saved';
  const saved = () => store.get(SAVED, []);
  const isSaved = (slug) => saved().some((x) => x.slug === slug);

  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => (t.hidden = true), 2200);
  }

  function syncSaveButtons() {
    const set = new Set(saved().map((x) => x.slug));
    $$('[data-save]').forEach((b) => b.setAttribute('aria-pressed', set.has(b.dataset.save) ? 'true' : 'false'));
    $$('.saved-count').forEach((c) => { c.hidden = !set.size; c.textContent = set.size; });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-save]');
    if (!b) return;
    e.preventDefault();
    const list = saved();
    const i = list.findIndex((x) => x.slug === b.dataset.save);
    if (i >= 0) { list.splice(i, 1); toast('Removed from Saved'); }
    else { list.unshift({ slug: b.dataset.save, name: b.dataset.name, t: Date.now() }); toast('Saved. Find it under Saved'); }
    store.set(SAVED, list);
    syncSaveButtons();
    if (location.pathname === '/saved') renderSaved();
  });
  window.addEventListener('storage', (e) => e.key === SAVED && syncSaveButtons());

  // ---------------------------------------------------------------- index
  let IDX;
  async function index() {
    if (IDX) return IDX;
    const r = await fetch('/search-index.json');
    const j = await r.json();
    IDX = {
      cats: j.c.map(([slug, title, url, section, n, picks]) => ({ slug, title, url, section, n, picks, hay: `${title} ${section}`.toLowerCase() })),
      brands: j.b.map(([slug, name, n]) => ({ slug, name, n, url: `/brands/${slug}`, hay: name.toLowerCase() })),
      ings: j.i.map(([slug, name, kw]) => ({ slug, name, kw, url: `/ingredients/${slug}`, hay: `${name} ${kw.join(' ')}`.toLowerCase() })),
      arts: j.a.map(([url, title]) => ({ url, title, hay: title.toLowerCase() })),
    };
    IDX.prods = j.p.map(([slug, name, brand, tier, ci, verified]) => {
      const cat = IDX.cats[ci];
      return { slug, name, brand, tier, cat, verified, url: `/products/${slug}`, hay: `${name} ${brand} ${cat ? cat.title : ''}`.toLowerCase() };
    });
    IDX.prodMap = new Map(IDX.prods.map((p) => [p.slug, p]));
    return IDX;
  }

  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9&%' -]+/g, ' ').trim();
  const STOP = new Set(['the', 'a', 'an', 'for', 'and', 'of', 'free', 'products', 'product', 'less', 'toxic', 'natural']);
  function tokens(q) {
    return norm(q).split(/\s+/).filter((t) => t && !STOP.has(t)).map((t) => t.replace(/(ies)$/, 'y').replace(/([^s])s$/, '$1'));
  }
  function score(hay, toks, name) {
    let s = 0, hit = 0;
    for (const t of toks) {
      const i = hay.indexOf(t);
      if (i < 0) continue;
      hit++; s += 10;
      if (i === 0 || hay[i - 1] === ' ') s += 5;
      if (name && name.toLowerCase().startsWith(t)) s += 8;
    }
    // every word must match for short queries; longer queries may miss one word
    if (!hit || hit < toks.length - (toks.length > 2 ? 1 : 0) && !(toks.length === 2 && hit === 1)) return 0;
    return s + hit * 100;
  }
  const hl = (text, toks) => {
    let out = esc(text);
    for (const t of toks) if (t.length > 1) out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
    return out;
  };

  function prodCard(p, toks = []) {
    return `<article class="pcard"><a class="pcard-link" href="${p.url}"><span class="mono t-${p.tier || 'none'}" aria-hidden="true">${esc(initials(p.name))}</span><span class="pcard-body"><span class="pcard-meta">${badge(p.tier)} ${p.cat ? `<span class="muted">${esc(p.cat.title)}</span>` : ''}</span><span class="pcard-name">${hl(p.name, toks)}</span><span class="pcard-brand">${hl(p.brand, toks)}</span></span></a><button type="button" class="save save-sm" data-save="${esc(p.slug)}" data-name="${esc(p.name)}" aria-pressed="false" aria-label="Save ${esc(p.name)}"><svg class="ic off" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg><svg class="ic on" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" fill="currentColor"/></svg></button></article>`;
  }

  // ---------------------------------------------------------------- search page
  function initSearch() {
    const form = $('[data-search-form]');
    if (!form) return;
    const input = $('#sq', form), out = $('#results');
    let tier = '';
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    tier = params.get('tier') || '';
    $$('[data-filters] .filter').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tier === tier)));

    async function run() {
      const q = input.value.trim();
      const u = new URL(location.href);
      q ? u.searchParams.set('q', q) : u.searchParams.delete('q');
      tier ? u.searchParams.set('tier', tier) : u.searchParams.delete('tier');
      history.replaceState(null, '', u);
      if (!q && !tier) { out.innerHTML = '<p class="muted">Start typing to search the whole guide.</p>'; return; }
      const I = await index();
      const toks = tokens(q);
      const rank = (list, f = (x) => x.title || x.name) => list.map((x) => ({ x, s: toks.length ? score(x.hay, toks, f(x)) : 1 })).filter((r) => r.s).sort((a, b) => b.s - a.s).map((r) => r.x);
      let prods = I.prods.map((x) => ({ x, s: toks.length ? score(x.hay, toks, x.name) : 1 })).filter((r) => r.s);
      if (tier) prods = prods.filter((r) => r.x.tier === tier);
      prods = prods.sort((a, b) => Math.floor(b.s / 100) - Math.floor(a.s / 100) || (RANK[b.x.tier] || 0) - (RANK[a.x.tier] || 0) || b.s - a.s).map((r) => r.x);
      const cats = tier ? [] : rank(I.cats);
      const ings = tier ? [] : rank(I.ings, (i) => i.name);
      const brands = tier ? [] : rank(I.brands, (b) => b.name);
      const arts = tier ? [] : rank(I.arts);
      const parts = [];
      if (cats.length) parts.push(`<section><h2>Product types</h2><div class="res-list">${cats.slice(0, 6).map((c) => `<a class="res-cat" href="${c.url}"><span><strong>${hl(c.title, toks)}</strong><br><span class="muted small">${esc(c.section)}</span></span><span class="muted">${c.n || ''}</span></a>`).join('')}</div></section>`);
      if (prods.length) parts.push(`<section><h2>Products (${prods.length})</h2><div class="pgrid">${prods.slice(0, 60).map((p) => prodCard(p, toks)).join('')}</div>${prods.length > 60 ? '<p class="muted small">Showing the top 60. Add a word to narrow it down.</p>' : ''}</section>`);
      if (ings.length) parts.push(`<section><h2>Ingredients</h2><div class="res-list">${ings.slice(0, 6).map((i) => `<a class="res-cat" href="${i.url}"><strong>${hl(i.name, toks)}</strong><span class="muted small">Hazardous ingredient</span></a>`).join('')}</div></section>`);
      if (brands.length) parts.push(`<section><h2>Brands</h2><div class="res-list">${brands.slice(0, 8).map((b) => `<a class="res-cat" href="${b.url}"><strong>${hl(b.name, toks)}</strong><span class="muted">${b.n}</span></a>`).join('')}</div></section>`);
      if (arts.length) parts.push(`<section><h2>Articles</h2><div class="res-list">${arts.slice(0, 6).map((a) => `<a class="res-cat" href="${a.url}"><strong>${hl(a.title, toks)}</strong></a>`).join('')}</div></section>`);
      out.innerHTML = parts.join('') || `<div class="empty"><p>No matches for “${esc(q)}”. Try a product type such as “shampoo” or “laundry”.</p><a class="btn btn-ghost" href="/contact?topic=suggestion">Suggest a product</a></div>`;
      syncSaveButtons();
    }
    let timer;
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 120); });
    form.addEventListener('submit', (e) => { e.preventDefault(); run(); input.blur(); });
    $$('[data-filters] .filter').forEach((b) => b.addEventListener('click', () => {
      tier = b.dataset.tier;
      $$('[data-filters] .filter').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      run();
    }));
    run();
  }

  // ---------------------------------------------------------------- ingredient checker
  function initChecker() {
    const form = $('[data-checker]');
    if (!form) return;
    const ta = $('textarea', form), out = $('#check-results');
    ta.value = store.get('st:lastLabel', '');
    $('[data-clear]', form).addEventListener('click', () => { ta.value = ''; out.innerHTML = ''; store.set('st:lastLabel', ''); ta.focus(); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const I = await index();
      const raw = ta.value;
      store.set('st:lastLabel', raw);
      const items = raw.split(/[,;\n•·]+|\.\s/).map((s) => s.trim()).filter(Boolean);
      if (!items.length) { out.innerHTML = ''; return; }
      const hits = new Map();
      for (const item of items) {
        const low = ' ' + item.toLowerCase().replace(/[()]/g, ' ').replace(/\s+/g, ' ') + ' ';
        const exactItem = low.trim();
        const paren = (item.toLowerCase().match(/\(([^)]+)\)/) || [])[1];
        for (const ing of I.ings) {
          for (const k of ing.kw) {
            // short abbreviations (TEA, DEA, SLS…) only match a whole list entry, so "tea tree oil" isn't flagged
            const short = k.length <= 3 && !k.includes(' ');
            const ok = short ? exactItem === k || paren === k : low.includes(k);
            if (ok) {
              if (!hits.has(ing.slug)) hits.set(ing.slug, { ing, found: new Set() });
              hits.get(ing.slug).found.add(item);
              break;
            }
          }
        }
      }
      if (!hits.size) {
        out.innerHTML = `<div class="ok"><strong>No ingredients from the guide’s hazard lists were found</strong> in the ${items.length} ingredients you entered. Labels don’t always show everything (for example, what is inside “fragrance”), so this isn’t a guarantee.</div>`;
        return;
      }
      out.innerHTML = `<h2 class="h-sec">${hits.size} flagged</h2><p class="muted">Found in ${items.length} listed ingredients.</p><ul class="flag-list">${[...hits.values()].map((h) => `<li class="flag"><a href="${h.ing.url}">${esc(h.ing.name)}</a><span class="small">Matched: ${[...h.found].map(esc).join(', ')}</span></li>`).join('')}</ul>`;
    });
  }

  // ---------------------------------------------------------------- safe swaps
  const SYN = { 'dish soap': 'dishwashing', 'dish detergent': 'dishwashing', 'dishwasher': 'dishwasher', soap: 'soap', bodywash: 'body wash', 'body wash': 'body wash', lotion: 'lotion', cream: 'lotion', moisturizer: 'moisturizer', sunscreen: 'sun', sunblock: 'sun', spf: 'sun', 'diaper cream': 'diaper ointment', 'diaper rash': 'diaper', wipes: 'wipes', 'air freshener': 'air freshener', febreze: 'air freshener', 'fabric softener': 'fabric softener', 'dryer sheets': 'fabric softener', bleach: 'bleach', 'window cleaner': 'glass', 'glass cleaner': 'glass', lipstick: 'lipstick', 'lip balm': 'lip', chapstick: 'lip', antiperspirant: 'deodorant', deodorant: 'deodorant', 'hair dye': 'hair colouring', 'hair color': 'hair colouring', 'hair colour': 'hair colouring', hairspray: 'hair styling', 'hair spray': 'hair styling', gel: 'styling', mousse: 'styling', tampons: 'menstrual', pads: 'menstrual', 'nail polish': 'nail polish', 'nail polish remover': 'remover', 'toilet cleaner': 'toilet', detergent: 'laundry detergent', laundry: 'laundry detergent', 'stain remover': 'stain', 'oven cleaner': 'oven', mouthwash: 'mouthwash', toothpaste: 'toothpaste', floss: 'floss', 'baby powder': 'baby powder', powder: 'powder', 'make up remover': 'make-up remover', makeup: 'foundation', foundation: 'foundation', mascara: 'mascara', eyeliner: 'eyeliner', concealer: 'concealer', blush: 'blush', toner: 'toner', 'shaving cream': 'shaving', aftershave: 'after shave', scrub: 'exfoliant', 'face wash': 'cleanser', cleanser: 'cleanser', 'all purpose': 'all-purpose', 'all-purpose cleaner': 'all-purpose', 'carpet cleaner': 'carpet cleaner', polish: 'polish', 'drain cleaner': 'drain', mould: 'mould', mold: 'mould', mildew: 'mould', lubricant: 'lubricant', conditioner: 'conditioner', shampoo: 'shampoo' };
  function initSwaps() {
    const form = $('[data-swap-form]');
    if (!form) return;
    const input = $('#swq'), out = $('#swap-results');
    async function show(cat) {
      const I = await index();
      const picks = cat.picks.map(([s, t]) => ({ ...I.prodMap.get(s), tier: t })).filter((p) => p.slug);
      out.innerHTML = `<section class="card swap-card"><p class="eyebrow">Instead of a conventional ${esc(cat.title.toLowerCase())}</p><h2>${esc(cat.title)}: Best &amp; Good picks</h2>${picks.length ? `<div class="pgrid">${picks.map((p) => prodCard(p)).join('')}</div>` : '<p>The guide has advice and home-made alternatives for this one.</p>'}<p class="row"><a class="btn btn-primary" href="${cat.url}">See all ${cat.n} rated, plus tips &amp; recipes</a></p></section>`;
      syncSaveButtons();
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    async function find(q) {
      const I = await index();
      let s = q.toLowerCase().trim();
      if (!s) { out.innerHTML = ''; return; }
      const syn = Object.keys(SYN).sort((a, b) => b.length - a.length).find((k) => s.includes(k));
      const term = syn ? SYN[syn] : s;
      const toks = tokens(term);
      const exact = I.cats.find((c) => c.title.toLowerCase() === s);
      const ranked = exact ? [exact] : I.cats.map((c) => ({ c, sc: score(c.title.toLowerCase(), toks, c.title) + (c.n ? 1 : 0) })).filter((r) => r.sc > 1).sort((a, b) => b.sc - a.sc).map((r) => r.c);
      if (ranked.length) show(ranked[0]);
      else out.innerHTML = `<p class="muted">No product type found for “${esc(q)}”. Pick one from the list below or <a href="/search?q=${encodeURIComponent(q)}">search the guide</a>.</p>`;
    }
    let timer;
    input.addEventListener('change', () => find(input.value));
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => input.value.length > 2 && find(input.value), 350); });
    form.addEventListener('submit', (e) => { e.preventDefault(); find(input.value); });
    $$('[data-swap-cat]').forEach((a) => a.addEventListener('click', async (e) => {
      e.preventDefault();
      const I = await index();
      const c = I.cats.find((x) => x.slug === a.dataset.swapCat);
      input.value = c.title; show(c);
    }));
    const q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; find(q); }
  }

  // ---------------------------------------------------------------- saved page
  async function renderSaved() {
    const wrap = $('#saved-list');
    if (!wrap) return;
    // import a shared list: /saved?items=a,b,c
    const shared = new URLSearchParams(location.search).get('items');
    if (shared) {
      const list = saved();
      for (const slug of shared.split(',').slice(0, 100)) if (!list.some((x) => x.slug === slug)) list.push({ slug, name: slug, t: Date.now() });
      store.set(SAVED, list);
      history.replaceState(null, '', '/saved');
      toast('Shared list added');
    }
    const list = saved();
    $('#saved-empty').hidden = !!list.length;
    $('#saved-actions').hidden = !list.length;
    if (!list.length) { wrap.innerHTML = ''; return; }
    let I = null;
    try { I = await index(); } catch {}
    wrap.innerHTML = list.map((x) => {
      const p = I?.prodMap.get(x.slug) || { slug: x.slug, name: x.name, brand: '', url: `/products/${x.slug}` };
      return prodCard(p);
    }).join('');
    syncSaveButtons();
  }
  function initSaved() {
    if (!$('#saved-list')) return;
    renderSaved();
    $('[data-clear-saved]')?.addEventListener('click', () => { if (confirmClear()) { store.set(SAVED, []); renderSaved(); syncSaveButtons(); } });
    $('[data-share-saved]')?.addEventListener('click', async () => {
      const link = `${location.origin}/saved?items=${saved().map((x) => x.slug).join(',')}`;
      try {
        if (navigator.share) await navigator.share({ title: 'My SensiThrive list', url: link });
        else { await navigator.clipboard.writeText(link); toast('Link copied'); }
      } catch {}
    });
  }
  // two-tap confirm without a blocking dialog
  function confirmClear() {
    const b = $('[data-clear-saved]');
    if (b.dataset.armed) return true;
    b.dataset.armed = '1'; b.textContent = 'Tap again to clear';
    setTimeout(() => { delete b.dataset.armed; b.textContent = 'Clear all'; }, 3000);
    return false;
  }

  // ---------------------------------------------------------------- contact form
  function initForms() {
    $$('form[data-ajax]').forEach((f) => {
      const topic = new URLSearchParams(location.search).get('topic');
      if (topic && f.topic) f.topic.value = topic;
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = $('.form-status', f);
        const btn = $('button[type=submit]', f);
        btn.disabled = true; status.textContent = 'Sending…';
        try {
          const r = await fetch(f.action, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(f))) });
          const j = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(j.error || 'Could not send');
          f.reset(); status.textContent = 'Thank you. Your message was sent.';
        } catch (err) {
          status.textContent = `${err.message}. You can also email us directly.`;
        } finally { btn.disabled = false; }
      });
    });
  }

  // ---------------------------------------------------------------- shell
  function initShell() {
    const d = $('.drawer');
    if (d) {
      document.addEventListener('keydown', (e) => e.key === 'Escape' && d.removeAttribute('open'));
      document.addEventListener('click', (e) => { if (d.open && !d.contains(e.target)) d.removeAttribute('open'); });
    }
    // header search icon on the search page focuses the field instead of reloading
    if (location.pathname === '/search') $$('a[href="/search"].icon-btn').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); $('#sq')?.focus(); }));
  }

  function initSW() {
    if (!('serviceWorker' in navigator) || location.search.includes('nosw')) return;
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }

  function boot() {
    initShell(); syncSaveButtons(); initSearch(); initChecker(); initSwaps(); initSaved(); initForms(); initSW();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
