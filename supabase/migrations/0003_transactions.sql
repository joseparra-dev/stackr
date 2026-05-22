create type public.transaction_type as enum ('buy', 'sell');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  asset_id text references public.assets(id) not null,
  type public.transaction_type not null,
  quantity numeric(28, 12) not null check (quantity > 0),
  price_per_unit_usd numeric(20, 8) not null check (price_per_unit_usd >= 0),
  fee_usd numeric(20, 8) not null default 0 check (fee_usd >= 0),
  executed_at timestamptz not null check (executed_at <= now()),
  notes text check (length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_txns_user_executed on public.transactions(user_id, executed_at desc);
create index idx_txns_user_asset on public.transactions(user_id, asset_id);

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();
