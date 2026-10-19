# Managing content

## The two layers

| Layer | What | Where | Edited? |
|---|---|---|---|
| **Original** | EHANS text, ratings, recipes (2011) | `blocks` columns; `product_appearances.original_text` | **Never rewritten.** Fix only clear extraction errors. |
| **2026** | Status, links, updates, sources | `products.*`, `categories.update_2026`, `articles.update_2026`, `ingredients.update_2026` | Yes, this is your work. |

## Re-checking a product (Supabase → Table Editor → `products`)

1. Find the product (filter by `slug` or `name`). The `review_queue` view lists products by recent clicks: start with what people are looking for.
2. Check the current label against [/ingredients](https://sensithrive.com/ingredients) and the rating rules in `/editorial-standards`.
3. Fill in:

| Column | Example | Notes |
|---|---|---|
| `status` | `active` | `unverified` · `active` · `reformulated` · `renamed` · `discontinued` |
| `official_url` | `https://druide.ca/…` | the manufacturer's product page |
| `affiliate_url` | `https://www.amazon.ca/dp/…?tag=sensithrive-20` | used instead of `official_url` when set |
| `affiliate_network` | `amazon-ca` | for your own reporting |
| `retailer_name` | `Amazon.ca` | button reads “Check price at Amazon.ca” |
| `image_url` | `https://…/badger-spf30.jpg` | product photo on cards and the product page. Only use photos you have the right to publish (brand press kit or written permission, your own photo, an affiliate program's licensed image, or an openly licensed source). Empty = the built-in illustration |
| `image_credit` | `Photo: Badger Balm press kit` | shown under the photo on the product page; required for openly licensed photos |
| `last_verified` | `2026-10-19` | |
| `update_2026` | see below | optional note shown on the product page |
| `notes_internal` | anything | private, never published |

`update_2026` is JSON:

```json
{
  "text": "Still sold. The 2026 formula adds sodium benzoate as a preservative, which is not on the guide's hazard list.\n\nNow sold in recyclable aluminium bottles.",
  "date": "2026-10-19",
  "reviewer": "Jane Smith",
  "sources": [{ "title": "Druide ingredient list", "url": "https://…" }]
}
```

Blank lines in `text` become paragraphs. Use the same format for `categories.update_2026` (for example new regulations, or a discontinued Best pick) and for articles and ingredients.

**Discontinued products stay listed.** Set `status = discontinued` and use `update_2026` to point to the closest alternative.

## Affiliate links

- All outbound buttons go through `/go/<product-slug>`. That function reads Supabase **live**, so a new `affiliate_url` works immediately with no rebuild. Clicks are logged in `link_clicks`.
- Links are marked `rel="sponsored nofollow"` when an affiliate URL is set.
- Products with no URL open a web search for the product name. Replace these over time.
- Useful programs for this audience: Amazon.ca / Amazon.com Associates, Well.ca, iHerb, brand programs on Awin, Impact or ShareASale. Many smaller natural brands run their own programs.

## "Where to buy" store links (up to 3 per product)

Hovering a product card (desktop) or tapping **Where to buy** (phone) shows a panel with up to three store buttons. They come from the `product_links` table (run `supabase/migrations/20261020000000_product_links.sql` once).

1. Re-check the product first and set its `status` in `products` to `active`, `renamed` or `reformulated`. **Links on `unverified` or `discontinued` products are never shown** (the build log lists any that are hidden), so nobody is sent to a product EHANS never rated.
2. Supabase → Table Editor → `product_links` → **Insert row**:

   | Column | Example | Notes |
   |---|---|---|
   | `product_slug` | `badger-sunscreen-for-face-and-body-spf-30-unscented` | the end of the product page URL |
   | `position` | `1` | 1, 2 or 3: button order; 1 is the highlighted button |
   | `store` | `Amazon.ca` | button label |
   | `url` | `https://amzn.to/…` | your affiliate link (Amazon: SiteStripe → Text → Short link); must start with `https://` |
   | `network` | `amazon-ca` | optional, for your own reporting |
   | `active` | ✓ | untick to hide a link without deleting it |
3. The URL works at once (buttons go through `/go/<slug>/<position>`, which reads the table live and logs the click with the store name). The panel itself appears after the next deploy; add a Supabase webhook on `product_links` to your Vercel Deploy Hook (see LAUNCH.md) to make that automatic.

Amazon's rules: link to the exact product, don't show Amazon prices or images unless they come from Amazon's API, and keep the Amazon Associates sentence on the disclosure page.

## Adding a product that wasn't in the guide

New products must meet the same criteria. Insert a row in `products` (slug, name, brand_slug, brand_name, status `active`, URLs, an `update_2026` explaining why it qualifies), then a row in `product_appearances`: `id` = `<category>:new-<n>`, the `category_slug`, the `tier`, and `original_text` = the product name. It will appear on the product page and in search. It will **not** appear inside the category's original text, which stays exactly as EHANS wrote it. A "2026 additions" list on category pages is an easy future enhancement.

## Local-only mode (no Supabase)

Put the same fields in `data/overrides.json` (camelCase: `status`, `officialUrl`, `affiliateUrl`, `retailerName`, `image`, `imageCredit`, `update2026`, `lastVerified`) and run `node scripts/build.mjs`. `node scripts/supabase-push.mjs --with-overrides` copies them into Supabase later.

## Re-parsing the original guide

`scripts/source/parse.py` turns `scripts/source/guide.txt` (text of the print guide) into `data/guide.json`:

```bash
python3 scripts/source/parse.py scripts/source/guide.txt data/guide.json
```

Product names and brands were extracted automatically. About 5% need a human tidy-up (for example a long store note left in the name, or two items fused by the PDF). Fix those in Supabase (`products.name`, `brand_name`, `brand_slug`), not in the parser output.
