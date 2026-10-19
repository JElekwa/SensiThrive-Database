# SEO, E-E-A-T and AI search

## Built in

| Area | Implementation |
|---|---|
| Crawlability | Every page is pre-rendered HTML (no JavaScript needed to read content); clean URLs; ~144k internal links, 0 broken (`scripts/check-site.mjs`) |
| URLs | `/guide/<section>/<category>`, `/products/<slug>`, `/brands/<slug>`, `/ingredients/<slug>`, `/learn/<article>` |
| Meta | Unique `<title>` and meta description per page, canonical URL, Open Graph + Twitter cards, `en-CA` |
| Structured data | `Organization` (SensiThrive + EHANS as author), `WebSite` + `SearchAction`, `Article` (EHANS author, `isBasedOn` the original guide, `dateModified`), `BreadcrumbList`, `ItemList` (category product lists), `Product` + editorial `Review` by EHANS (rating Best=3 / Good=2 / Unscented=1), `DefinedTerm` (ingredients), `AboutPage` |
| Sitemaps | `/sitemap.xml`: indexable pages only, with lastmod and priority |
| robots.txt | Blocks everything until `ALLOW_INDEXING=true`; then allows all, disallows `/go/`, `/api/`, `/saved`, and explicitly welcomes GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended |
| AI search | `/llms.txt` (site summary + every category) and `/llms-full.txt` (full text of the guide, with attribution) |
| Thin content | Unverified product pages and 1-product brand pages are `noindex, follow` and out of the sitemap until re-checked |
| Speed | Static files on Vercel's CDN, one CSS and one JS file (~45 KB uncompressed, ~12 KB gzipped), system font fallbacks, no images above the fold except the logo |
| Mobile | Responsive, 16px gutters, tab bar, safe-area aware, installable PWA, offline |
| Verification | `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` env vars (or DNS TXT) |

## E-E-A-T: what Google looks for and where it lives

- **Experience**: real tips from people with chemical sensitivities (original guide); add your own first-hand notes in `update_2026`.
- **Expertise**: EHANS's documented method (`/learn/product-selection-process`), ingredient explanations with sources, named reviewer.
- **Authoritativeness**: EHANS as the author in structured data; the guide's press history (CBC Marketplace, Globe and Mail, Environmental Defence) on `/about`. Earn links: ask EHANS to link to SensiThrive from environmentalhealth.ca; contact the organisations that cited the guide.
- **Trust**: `/about`, `/editorial-standards`, `/affiliate-disclosure`, `/privacy`, `/terms` (medical disclaimer), `/contact` with corrections, clear original-vs-update labelling, dates everywhere.

## Your ongoing work (in order of impact)

1. **Write 2026 updates for the top categories** (shampoo, deodorant, laundry detergent, all-purpose cleaner, baby lotion, sun protection, toothpaste, lotions). 150–400 words each, with sources. This is what turns the archive into a living resource.
2. **Verify products people click** (`review_queue` view). Each verified product page becomes indexable.
3. **Name the reviewer.** A real person with relevant experience beats an anonymous team.
4. **Links from relevant sites**: EHANS, environmental health groups, scent-free workplace programmes, allergy/asthma communities.
5. **Watch Search Console**: Pages report (indexing issues), Performance (queries), Enhancements (structured data warnings).

## Notes

- The `Product` + `Review` markup represents EHANS's published editorial rating. If you prefer not to use it, set `PRODUCT_REVIEW_SCHEMA=false`.
- Google may show "missing field offers" warnings on Product markup. These are non-critical and expected, since the site doesn't sell products.
- Don't add FAQ markup with invented questions. If you write a real FAQ section, it can be added.
