-- SensiThrive schema. Run with `supabase db push` or paste into the Supabase SQL editor.
-- Content tables are public-read. Writes happen only with the service-role key
-- (build scripts and Vercel functions), never from the browser.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- content (from the EHANS guide)
create table if not exists public.sections (
  slug        text primary key,
  title       text not null,
  intro       jsonb not null default '[]',
  position    int  not null default 0
);

create table if not exists public.groups (
  slug        text primary key,
  section     text not null references public.sections(slug) on update cascade,
  title       text not null,
  revised     text,
  blocks      jsonb not null default '[]',
  position    int  not null default 0
);

create table if not exists public.categories (
  slug        text primary key,
  section     text not null references public.sections(slug) on update cascade,
  group_slug  text references public.groups(slug) on update cascade,
  title       text not null,
  revised     text,
  blocks      jsonb not null default '[]',   -- original text, verbatim, as structured blocks
  position    int  not null default 0,
  update_2026 jsonb,                         -- {"text": "...", "date": "2026-10-19", "reviewer": "...", "sources": [{"title": "...", "url": "..."}]}
  updated_at  timestamptz not null default now()
);

create table if not exists public.articles (
  slug        text primary key,
  section     text not null,
  title       text not null,
  byline      text,
  blocks      jsonb not null default '[]',
  ingredient_context text,
  position    int  not null default 0,
  update_2026 jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.brands (
  slug        text primary key,
  name        text not null,
  websites    text[] not null default '{}'
);

create table if not exists public.products (
  slug          text primary key,
  name          text not null,
  brand_slug    text references public.brands(slug) on update cascade,
  brand_name    text,
  websites      text[] not null default '{}',     -- websites printed in the 2011 guide
  -- 2026 review layer (edited by you; never overwritten by the guide import)
  status        text not null default 'unverified'
                check (status in ('unverified','active','reformulated','renamed','discontinued')),
  official_url  text,                              -- manufacturer product page
  affiliate_url text,                              -- your tracked link; wins over official_url
  affiliate_network text,                          -- e.g. 'amazon-ca', 'awin', 'impact', 'iherb'
  retailer_name text,                              -- shown on the button: "Check price at ..."
  update_2026   jsonb,
  last_verified date,
  notes_internal text,                             -- private editor notes (not published)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists products_brand_idx on public.products(brand_slug);
create index if not exists products_status_idx on public.products(status);

-- each time a product is listed in a category in the guide
create table if not exists public.product_appearances (
  id            text primary key,                  -- "<category>:<index>"
  product_slug  text not null references public.products(slug) on update cascade on delete cascade,
  category_slug text not null references public.categories(slug) on update cascade on delete cascade,
  tier          text not null,
  original_text text not null,
  position      int not null default 0
);
create index if not exists appearances_product_idx on public.product_appearances(product_slug);
create index if not exists appearances_category_idx on public.product_appearances(category_slug);

create table if not exists public.ingredients (
  id          text primary key,                    -- "<context>:<slug>"
  slug        text not null,
  name        text not null,
  context     text not null check (context in ('cleaning','personal-care')),
  blocks      jsonb not null default '[]',
  position    int not null default 0,
  update_2026 jsonb
);

-- ---------------------------------------------------------------- activity
create table if not exists public.link_clicks (
  id            bigint generated always as identity primary key,
  product_slug  text,
  destination   text,
  link_type     text,          -- affiliate | official | search
  referrer_path text,
  created_at    timestamptz not null default now()
);
create index if not exists link_clicks_product_idx on public.link_clicks(product_slug, created_at desc);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  topic      text,
  ref        text,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- updated_at triggers
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();
drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- row level security
alter table public.sections            enable row level security;
alter table public.groups              enable row level security;
alter table public.categories          enable row level security;
alter table public.articles            enable row level security;
alter table public.brands              enable row level security;
alter table public.products            enable row level security;
alter table public.product_appearances enable row level security;
alter table public.ingredients         enable row level security;
alter table public.link_clicks         enable row level security;
alter table public.contact_messages    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['sections','groups','categories','articles','brands','product_appearances','ingredients'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

-- products are public, but private editor notes are hidden from the anon key via a column grant
drop policy if exists "public read" on public.products;
create policy "public read" on public.products for select to anon, authenticated using (true);
revoke select on public.products from anon, authenticated;
grant select (slug, name, brand_slug, brand_name, websites, status, official_url, affiliate_url, affiliate_network,
              retailer_name, update_2026, last_verified, created_at, updated_at) on public.products to anon, authenticated;

-- link_clicks and contact_messages: no anon policies at all (service role only)

-- ---------------------------------------------------------------- helpful views for editors
create or replace view public.review_queue as
  select p.slug, p.name, p.brand_name, p.status, p.official_url, p.affiliate_url, p.last_verified,
         count(c.id) filter (where c.created_at > now() - interval '90 days') as clicks_90d
  from public.products p
  left join public.link_clicks c on c.product_slug = p.slug
  group by p.slug
  order by clicks_90d desc nulls last, p.name;
revoke all on public.review_queue from anon, authenticated;
