alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

alter table public.transactions enable row level security;

create policy "txns_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "txns_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "txns_update_own" on public.transactions
  for update using (auth.uid() = user_id);
create policy "txns_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

alter table public.assets enable row level security;

create policy "assets_select_authenticated" on public.assets
  for select using (auth.role() = 'authenticated');

alter table public.price_snapshots enable row level security;

create policy "snapshots_select_authenticated" on public.price_snapshots
  for select using (auth.role() = 'authenticated');
