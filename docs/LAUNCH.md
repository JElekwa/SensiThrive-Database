# Launch guide: Supabase + Vercel + Namecheap + Google Search Console

Allow about an hour. Commands are shown for Windows PowerShell; on Mac/Linux use `export NAME=value` instead of `$env:NAME="value"`.

---

## 0. Before anything is public

- [ ] **EHANS permission.** Email EHANS (environmentalhealth.ca, 1-800-449-1995) asking for written permission to reproduce and update the guide. When you have it, set `EHANS_PERMISSION_NOTE="Reproduced with permission of EHANS."`
- [ ] **Editor (E-E-A-T).** Set `EDITOR_NAME` and `EDITOR_BIO` to the real person who reviews updates. Google and readers trust named, accountable people. Never invent credentials.
- [ ] **Mailbox.** Create `hello@sensithrive.com` (Namecheap Private Email, or forwarding under *Domain List → Manage → Redirect Email*).
- [ ] **Affiliate disclosure.** Remove the Amazon sentence from `src/pages/static.mjs` if you don't join Amazon Associates.

Until you flip `ALLOW_INDEXING=true`, every page is `noindex` and `robots.txt` blocks crawlers, so you can safely deploy and test on the real domain first.

---

## 1. Put the code on GitHub

1. Create a **private** repository at github.com (for example `sensithrive`).
2. Upload this folder: `git remote add origin https://github.com/YOU/sensithrive.git` then `git push -u origin main`. Alternatively, drag the files into GitHub's web uploader.

---

## 2. Supabase (database)

1. Go to supabase.com → **New project**. Name: `sensithrive`. Region: **Canada (Central)** is closest to your Nova Scotia audience. Save the database password somewhere safe.
2. **SQL Editor → New query** → paste all of `supabase/migrations/20261019000000_init.sql` → **Run**.
   (Or with the Supabase CLI: `supabase link` then `supabase db push`.)
3. **Project Settings → API**: copy the **Project URL**, the **anon public** key and the **service_role** key.
4. Import the guide from your computer (Node 20+ installed, inside this folder):

   ```powershell
   $env:SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
   node scripts/supabase-push.mjs --with-overrides
   ```

   You should see 8 tables fill (1,575 products, 1,626 product listings…). Re-running is safe: it never overwrites your 2026 edits.
5. **Table Editor → products** is now your control panel (see [CONTENT.md](CONTENT.md)).

> The **service_role** key bypasses security. Put it only in Vercel environment variables and your local terminal. Never put it in browser code or commit it to Git.

---

## 3. Vercel (hosting)

1. vercel.com → **Add New → Project** → import your GitHub repo.
2. Framework preset: **Other**. Vercel reads `vercel.json`, so leave the build settings alone (build `node scripts/build.mjs`, output `dist`).
3. **Environment Variables** (Production and Preview):

   | Name | Value |
   |---|---|
   | `SITE_URL` | `https://sensithrive.com` |
   | `CONTENT_SOURCE` | `supabase` |
   | `SUPABASE_URL` | from step 2 |
   | `SUPABASE_ANON_KEY` | from step 2 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from step 2 (server-only) |
   | `ALLOW_INDEXING` | `false` for now |
   | `EDITOR_NAME`, `EDITOR_BIO`, `CONTACT_EMAIL` | yours |
   | `LAST_REVIEWED` | today's date, `YYYY-MM-DD` |

4. **Deploy.** Open the `*.vercel.app` URL and click through: home, a category, a product, search, checker, saved. Then submit the contact form and confirm a row appears in Supabase → `contact_messages`.

### Auto-rebuild when you edit Supabase

Page text and buttons are built at deploy time. (The `/go` links read Supabase live, so affiliate links switch over immediately.) To republish pages after edits:

1. Vercel → Project → **Settings → Git → Deploy Hooks** → create `supabase-content`, branch `main` → copy the URL.
2. Supabase → **Database → Webhooks → Create**: table `products` (add `categories` and `articles` as separate webhooks), events *Insert / Update*, type **HTTP Request**, method **POST**, URL = the deploy hook.

   Each save then triggers a rebuild (about 1 minute). If you are editing many rows, pause the webhook and press **Redeploy** once at the end.

---

## 4. Namecheap domain → Vercel

1. Vercel → Project → **Settings → Domains** → add `sensithrive.com` and `www.sensithrive.com`. Choose to **redirect www → sensithrive.com**.
2. Namecheap → **Domain List → Manage → Advanced DNS**. Delete the default *parking* CNAME/URL redirect records, then add the records Vercel shows you. Typically:

   | Type | Host | Value |
   |---|---|---|
   | A Record | `@` | `76.76.21.21` |
   | CNAME Record | `www` | `cname.vercel-dns.com.` |

   (If Vercel shows different values for your project, use Vercel's.)
3. Wait for Vercel to show **Valid Configuration** (minutes to a few hours). HTTPS is issued automatically.

---

## 5. Google Search Console

1. search.google.com/search-console → **Add property → Domain** → `sensithrive.com`.
2. Google gives you a TXT value. In Namecheap **Advanced DNS** add: *TXT Record*, Host `@`, Value `google-site-verification=…` → **Verify**.
   (Alternative: a *URL-prefix* property with the HTML tag method. Put just the `content` value in `GOOGLE_SITE_VERIFICATION` and redeploy.)
3. When EHANS permission and editor details are in place: set `ALLOW_INDEXING=true` in Vercel → **Redeploy**.
4. Search Console → **Sitemaps** → submit `https://sensithrive.com/sitemap.xml`.
5. **URL Inspection** → home page, `/guide`, `/about` and a few category pages → **Request indexing**.
6. Bing Webmaster Tools → **Import from Google Search Console** (this also feeds DuckDuckGo, Copilot and ChatGPT search).

### What gets indexed at launch

- About 450 strong pages: home, sections, all 95 category pages, articles, ingredients, brands with 2+ products, tools and trust pages.
- Product pages stay `noindex, follow` (and out of the sitemap) **until you mark the product `active`, `reformulated`, `renamed` or `discontinued`** in Supabase. This avoids Google seeing 1,500 thin pages at once. Each verified product joins the sitemap on the next build. Override with `INDEX_UNVERIFIED_PRODUCTS=true`.

---

## 6. Launch checklist

- [ ] EHANS permission in writing; permission note updated
- [ ] Editor name/bio set; About page reads correctly
- [ ] `hello@` mailbox works; contact form saves to Supabase
- [ ] At least the top 10 categories have a written **2026 update** with sources (see CONTENT.md)
- [ ] A few dozen most-searched products verified with official/affiliate URLs
- [ ] `node scripts/check-site.mjs` reports no problems
- [ ] PageSpeed Insights (pagespeed.web.dev) on mobile for home + a category page
- [ ] Rich Results Test (search.google.com/test/rich-results) on a category and a verified product page
- [ ] `ALLOW_INDEXING=true`, redeployed, sitemap submitted
- [ ] Phone test: open the site in Safari/Chrome → *Add to Home Screen* → opens like an app; saved list works offline
