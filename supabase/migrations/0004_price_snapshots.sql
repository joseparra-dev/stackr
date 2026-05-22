create table public.price_snapshots (
  asset_id text references public.assets(id) on delete cascade not null,
  snapshot_date date not null,
  price_usd numeric(20, 8) not null check (price_usd >= 0),
  primary key (asset_id, snapshot_date)
);

create index idx_snapshots_date on public.price_snapshots(snapshot_date desc);
