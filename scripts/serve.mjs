#!/usr/bin/env node
// Local preview server that mimics Vercel: clean URLs for dist/*.html, /go/:slug and /api/* functions.
// usage: node scripts/serve.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.argv[2] || process.env.PORT || 3000);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };

async function runFunction(name, req, res, query) {
  const file = path.join(ROOT, 'api', name + '.js');
  if (!fs.existsSync(file)) return false;
  const mod = await import(pathToFileURL(file).href + '?t=' + Date.now());
  let body = '';
  for await (const chunk of req) body += chunk;
  req.query = query;
  req.body = body && (req.headers['content-type'] || '').includes('json') ? JSON.parse(body) : Object.fromEntries(new URLSearchParams(body));
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (o) => (res.setHeader('content-type', 'application/json'), res.end(JSON.stringify(o)));
  res.send = (s) => res.end(s);
  res.redirect = (c, u) => (res.writeHead(c, { location: u }), res.end());
  await mod.default(req, res);
  return true;
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  let p = decodeURIComponent(u.pathname);
  const query = Object.fromEntries(u.searchParams);
  try {
    const go = p.match(/^\/go\/([^/]+)(?:\/([1-3]))?$/);
    if (go && (await runFunction('go', req, res, { ...query, slug: go[1], ...(go[2] ? { n: go[2] } : {}) }))) return;
    const api = p.match(/^\/api\/([a-z-]+)$/);
    if (api && (await runFunction(api[1], req, res, query))) return;
    let f = path.join(DIST, p);
    if (!f.startsWith(DIST)) throw new Error('bad path');
    if (p.endsWith('/') ) f = path.join(f, 'index.html');
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = fs.existsSync(f + '.html') ? f + '.html' : path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404, { 'content-type': TYPES['.html'] }); return res.end(fs.readFileSync(path.join(DIST, '404.html'))); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).on('error', () => res.end()).pipe(res);
  } catch (e) {
    // e.g. dist/ was being rebuilt mid-request: don't crash the preview
    if (!res.headersSent) res.writeHead(500);
    res.end(String(e));
  }
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
