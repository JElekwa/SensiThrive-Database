// Tiny HTML helpers (no dependencies).
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const html = (strings, ...vals) =>
  strings.reduce((out, s, i) => out + s + (i < vals.length ? flat(vals[i]) : ''), '');
const flat = (v) => (v == null || v === false ? '' : Array.isArray(v) ? v.map(flat).join('') : String(v));

// Turn old URLs in guide text into links to the Internet Archive copy (many 2011 sites are gone).
export function linkifyArchived(text) {
  const e = esc(text);
  return e.replace(/\b((?:https?:\/\/)?(?:www\.)[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s,;)<]*)?)/gi, (m) => {
    const clean = m.replace(/[.]+$/, '');
    const tail = m.slice(clean.length);
    const target = clean.startsWith('http') ? clean : `http://${clean}`;
    return `<a href="https://web.archive.org/web/2011/${esc(target)}" rel="nofollow noopener" target="_blank" class="archived" title="Opens the archived 2011 copy">${clean}</a>${tail}`;
  });
}

export const truncate = (s, n = 155) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
};

export const initials = (name = '') =>
  name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '•';
