create table public.assets (
  id text primary key,
  symbol text not null,
  name text not null,
  image_url text,
  market_cap_rank int,
  last_synced_at timestamptz not null default now()
);

create index idx_assets_symbol on public.assets(symbol);
create index idx_assets_rank on public.assets(market_cap_rank) where market_cap_rank is not null;
