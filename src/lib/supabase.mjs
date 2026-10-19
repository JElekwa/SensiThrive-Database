// Load the full dataset from Supabase and return it in the same shape as data/guide.json.
import { hasSupabase, selectAll } from './rest.mjs';

export const supabaseConfigured = () => hasSupabase();

const PRODUCT_COLS = 'slug,name,brand_slug,brand_name,websites,status,official_url,affiliate_url,affiliate_network,retailer_name,update_2026,last_verified';

export async function loadFromSupabase() {
  const [sections, groups, categories, articles, brands, products, appearances, ingredients] = await Promise.all([
    selectAll('sections'),
    selectAll('groups'),
    selectAll('categories'),
    selectAll('articles'),
    selectAll('brands', '*', 'name'),
    selectAll('products', PRODUCT_COLS, 'slug'),
    selectAll('product_appearances', '*', 'category_slug,position'),
    selectAll('ingredients'),
  ]);

  const apps = new Map();
  for (const a of appearances) {
    if (!apps.has(a.product_slug)) apps.set(a.product_slug, []);
    apps.get(a.product_slug).push({ category: a.category_slug, tier: a.tier, text: a.original_text });
  }
  const brandProducts = new Map();
  for (const p of products) {
    if (!brandProducts.has(p.brand_slug)) brandProducts.set(p.brand_slug, []);
    brandProducts.get(p.brand_slug).push(p.slug);
  }

  return {
    source: { title: 'The Guide to Less Toxic Products' },
    sections: sections.map((s) => ({
      slug: s.slug, title: s.title, intro: s.intro,
      groups: groups.filter((g) => g.section === s.slug).map((g) => g.slug),
      categories: categories.filter((c) => c.section === s.slug && !c.group_slug).map((c) => c.slug),
      articles: articles.filter((a) => a.section === s.slug).map((a) => a.slug),
    })),
    groups: groups.map((g) => ({
      slug: g.slug, title: g.title, section: g.section, revised: g.revised, blocks: g.blocks,
      categories: categories.filter((c) => c.group_slug === g.slug).map((c) => c.slug),
    })),
    categories: categories.map((c) => ({
      slug: c.slug, title: c.title, section: c.section, group: c.group_slug, revised: c.revised, blocks: c.blocks, update2026: c.update_2026,
    })),
    articles: articles.map((a) => ({
      slug: a.slug, title: a.title, section: a.section, byline: a.byline || undefined, blocks: a.blocks,
      ingredientContext: a.ingredient_context || undefined, update2026: a.update_2026,
    })),
    brands: brands.map((b) => ({ slug: b.slug, name: b.name, websites: b.websites || [], products: brandProducts.get(b.slug) || [] })),
    products: products.map((p) => ({
      slug: p.slug, name: p.name, brand: p.brand_name, brandSlug: p.brand_slug, websites: p.websites || [],
      appearances: apps.get(p.slug) || [],
      status: p.status, officialUrl: p.official_url, affiliateUrl: p.affiliate_url, affiliateNetwork: p.affiliate_network,
      retailerName: p.retailer_name, update2026: p.update_2026, lastVerified: p.last_verified,
    })),
    ingredients: ingredients.map((i) => ({ slug: i.slug, name: i.name, context: i.context, blocks: i.blocks, update2026: i.update_2026 })),
  };
}
