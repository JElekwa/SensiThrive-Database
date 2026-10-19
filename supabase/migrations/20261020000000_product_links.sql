-- "Where to buy" store links: up to 3 per product (positions 1-3), shown in the hover/tap panel.
-- Phase 1: add rows by hand (e.g. Amazon.ca SiteStripe links). Every button goes through /go/<slug>/<position>,
-- which reads this table live and logs the click, so a changed URL works without a rebuild.
-- Links are only shown for products whose status is active, renamed or reformulated.
-- Paste into Supabase > SQL Editor > Run. Safe to run more than once.

create table if not exists public.product_links (
  id           bigint generated always as identity primary key,
  product_slug text not null references public.products(slug) on update cascade on delete cascade,
  position     int  not null default 1 check (position between 1 and 3),
  store        text not null check (length(store) between 2 and 40),   -- button label, e.g. 'Amazon.ca'
  url          text not null check (url ~* '^https://'),             -- your affiliate (or plain) product link
  network      text,                                                   -- e.g. 'amazon-ca', 'awin', 'impact'
  active       boolean not null default true,                          -- untick to hide without deleting
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (product_slug, position)
);
create index if not exists product_links_product_idx on public.product_links(product_slug);

drop trigger if exists product_links_touch on public.product_links;
create trigger product_links_touch before update on public.product_links for each row execute function public.touch_updated_at();

-- public may read active links (they are public on the site anyway); only the service role can write
alter table public.product_links enable row level security;
drop policy if exists "public read" on public.product_links;
create policy "public read" on public.product_links for select to anon, authenticated using (active);
revoke insert, update, delete on public.product_links from anon, authenticated;

-- which store a click went to
alter table public.link_clicks add column if not exists store text;
