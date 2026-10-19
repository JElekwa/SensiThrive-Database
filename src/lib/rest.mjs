// Minimal Supabase REST (PostgREST) client using fetch. No npm packages needed.
const env = (k) => (typeof process !== 'undefined' ? process.env[k] : undefined);

export const sbUrl = () => (env('SUPABASE_URL') || '').replace(/\/$/, '');
export const anonKey = () => env('SUPABASE_ANON_KEY') || '';
export const serviceKey = () => env('SUPABASE_SERVICE_ROLE_KEY') || '';

export const hasSupabase = (needService = false) => !!(sbUrl() && (needService ? serviceKey() : anonKey() || serviceKey()));

function headers(service, extra = {}) {
  const key = service ? serviceKey() : anonKey() || serviceKey();
  return { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', ...extra };
}

async function request(path, { method = 'GET', body, service = false, prefer, range, timeoutMs = 15000 } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const h = headers(service);
    if (prefer) h.prefer = prefer;
    if (range) { h['range-unit'] = 'items'; h.range = range; }
    const r = await fetch(`${sbUrl()}/rest/v1/${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined, signal: ctl.signal });
    if (!r.ok) throw new Error(`Supabase ${method} ${path.split('?')[0]} -> ${r.status} ${await r.text()}`);
    const txt = await r.text();
    return txt ? JSON.parse(txt) : null;
  } finally {
    clearTimeout(t);
  }
}

// Fetch every row of a table, 1000 at a time.
export async function selectAll(table, select = '*', order = 'position') {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const rows = await request(`${table}?select=${encodeURIComponent(select)}${order ? `&order=${order}` : ''}`, { range: `${from}-${from + 999}` });
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

export const selectOne = async (table, query, select = '*') => (await request(`${table}?${query}&select=${encodeURIComponent(select)}&limit=1`))?.[0] || null;

export const insert = (table, rows, { service = true } = {}) =>
  request(table, { method: 'POST', body: rows, service, prefer: 'return=minimal', timeoutMs: 4000 });

// Upsert only the given columns (existing editorial columns are left untouched).
export async function upsert(table, rows, { onConflict, batch = 500 } = {}) {
  for (let i = 0; i < rows.length; i += batch) {
    const chunk = rows.slice(i, i + batch);
    const cols = Object.keys(chunk[0]).join(',');
    await request(`${table}?columns=${cols}${onConflict ? `&on_conflict=${onConflict}` : ''}`, {
      method: 'POST', body: chunk, service: true, prefer: 'resolution=merge-duplicates,return=minimal', timeoutMs: 60000,
    });
  }
}

// Update existing rows matching a column value (used for editorial fields).
export const updateWhere = (table, column, value, values) =>
  request(`${table}?${column}=eq.${encodeURIComponent(value)}`, { method: 'PATCH', body: values, service: true, prefer: 'return=minimal' });
