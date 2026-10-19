# SensiThrive

**sensithrive.com**: *The Guide to Less Toxic Products* by the Environmental Health Association of Nova Scotia (EHANS), carried forward as a fast, mobile, installable web app with 2026 updates and retailer links.

- **2,300+ pages** generated from the original guide: 95 product categories, 1,575 products, 526 brands, 60 hazardous ingredients, 25 articles, home-made recipes.
- **Original text preserved** and attributed on every page; new information goes in dated **2026 update** panels.
- **App features**: instant search, ingredient checker, safe swaps, saved list, offline support, add-to-home-screen.
- **Supabase** for content, product status, affiliate links, click tracking and contact messages.
- **Vercel** hosting: static HTML plus two serverless functions. **No npm dependencies.**
- **SEO**: canonical URLs, Open Graph, JSON-LD (Organization, WebSite + SearchAction, Article, BreadcrumbList, ItemList, Product + editorial Review, DefinedTerm), XML sitemap, robots.txt, `llms.txt` for AI search, Search Console verification.

## Quick start

```bash
node scripts/build.mjs        # builds dist/ from data/guide.json (+ data/overrides.json)
node scripts/serve.mjs        # preview at http://localhost:3000 (clean URLs, /go and /api work)
node scripts/check-site.mjs   # QA: broken links, titles, descriptions, JSON-LD
```

Requires Node 20+. Nothing to install.

## How it fits together

```
data/guide.json          ← parsed from the EHANS print guide (scripts/source/)
data/overrides.json      ← 2026 layer for local builds (statuses, URLs, updates)
        │                         or
Supabase tables ─────────┤  CONTENT_SOURCE=supabase
        ▼
scripts/build.mjs  →  dist/   static HTML, sitemap.xml, robots.txt, llms.txt,
                              search-index.json, manifest, service worker
api/go.js          →  /go/:slug   reads live affiliate/official URL from Supabase, logs click, redirects
api/contact.js     →  /api/contact saves messages to Supabase
```

| Folder | What's in it |
|---|---|
| `site.config.mjs` | Name, URLs, attribution, editor, indexing switch, rating definitions |
| `src/pages/` | Page templates (content pages, trust pages, app tools) |
| `src/templates/` | Layout, components, icons |
| `src/assets/` | `app.css` (design system), `app.js` (app features), `sw.js` (offline) |
| `src/lib/` | Data loading, Supabase REST client, SEO/JSON-LD, search index, llms.txt |
| `api/` | Vercel serverless functions |
| `supabase/migrations/` | Database schema + row-level security |
| `scripts/` | Build, preview, QA, Supabase import, icon generation, guide parser |
| `docs/` | Launch guide, content guide, SEO notes, design system |

## The three phases

1. **Content site** (commit 1): the guide parsed into structured data; every section, category, product, brand and ingredient page; design system; trust pages.
2. **App** (commit 2): search, ingredient checker, safe swaps, saved list, PWA (manifest, icons, offline service worker), mobile tab bar.
3. **Launch-ready** (commit 3): Supabase schema/import/loader, `/go` affiliate redirect + click log, contact form, full structured data, sitemap/robots/llms.txt, indexing safeguards, Vercel config, docs.

## Before you launch

Read **[docs/LAUNCH.md](docs/LAUNCH.md)**. In short: get EHANS’s permission in writing, fill in the editor name, connect Supabase and Vercel, point the Namecheap domain, verify Search Console, then set `ALLOW_INDEXING=true`.
