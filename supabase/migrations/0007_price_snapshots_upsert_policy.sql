grant insert, update on table public.price_snapshots to authenticated;

create policy "snapshots_insert_authenticated" on public.price_snapshots
  for insert
  to authenticated
  with check (true);

create policy "snapshots_update_authenticated" on public.price_snapshots
  for update
  to authenticated
  using (true)
  with check (true);
