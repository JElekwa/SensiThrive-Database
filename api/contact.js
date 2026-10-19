// POST /api/contact -> saves the message in Supabase (contact_messages). Accepts JSON or form posts.
import { hasSupabase, insert } from '../src/lib/rest.mjs';

const clean = (v, n) => String(v ?? '').trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  const wantsJson = (req.headers.accept || '').includes('json') || (req.headers['content-type'] || '').includes('json');
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = Object.fromEntries(new URLSearchParams(b)); } }
  const done = (status, payload) => (wantsJson ? res.status(status).json(payload) : res.redirect(303, status < 300 ? '/contact?sent=1' : '/contact?error=1'));

  if (b.website) return done(200, { ok: true }); // honeypot: silently accept bots
  const row = {
    name: clean(b.name, 120), email: clean(b.email, 200), topic: clean(b.topic, 40), ref: clean(b.ref, 300), message: clean(b.message, 5000),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return done(400, { error: 'Please enter a valid email address' });
  if (row.message.length < 5) return done(400, { error: 'Please write a short message' });
  if (!hasSupabase(true)) return done(503, { error: 'The contact form is not connected yet' });
  try {
    await insert('contact_messages', [row]);
    return done(200, { ok: true });
  } catch (e) {
    console.error(e);
    return done(500, { error: 'Could not save your message' });
  }
}
