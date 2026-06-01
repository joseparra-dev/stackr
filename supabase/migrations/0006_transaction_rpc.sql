-- Atomic create/update for a transaction.
--
-- A transaction references public.assets via FK, but assets has SELECT-only RLS
-- for authenticated users. These SECURITY DEFINER functions run as the owner so
-- they can upsert the (public, non-user-owned) asset reference row and then
-- write the transaction in a single statement. Ownership is enforced inside the
-- function via auth.uid() — the client never supplies user_id.

create or replace function public.create_transaction(
  p_asset_id text,
  p_asset_symbol text,
  p_asset_name text,
  p_asset_image_url text,
  p_asset_rank int,
  p_type public.transaction_type,
  p_quantity numeric,
  p_price_per_unit_usd numeric,
  p_fee_usd numeric,
  p_executed_at timestamptz,
  p_notes text
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.transactions;
begin
  if v_uid is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  insert into public.assets (id, symbol, name, image_url, market_cap_rank, last_synced_at)
  values (p_asset_id, p_asset_symbol, p_asset_name, p_asset_image_url, p_asset_rank, now())
  on conflict (id) do update
    set symbol = excluded.symbol,
        name = excluded.name,
        image_url = excluded.image_url,
        market_cap_rank = excluded.market_cap_rank,
        last_synced_at = now();

  insert into public.transactions (
    user_id, asset_id, type, quantity, price_per_unit_usd, fee_usd, executed_at, notes
  ) values (
    v_uid, p_asset_id, p_type, p_quantity, p_price_per_unit_usd, p_fee_usd, p_executed_at, p_notes
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.update_transaction(
  p_id uuid,
  p_asset_id text,
  p_asset_symbol text,
  p_asset_name text,
  p_asset_image_url text,
  p_asset_rank int,
  p_type public.transaction_type,
  p_quantity numeric,
  p_price_per_unit_usd numeric,
  p_fee_usd numeric,
  p_executed_at timestamptz,
  p_notes text
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.transactions;
begin
  if v_uid is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;

  insert into public.assets (id, symbol, name, image_url, market_cap_rank, last_synced_at)
  values (p_asset_id, p_asset_symbol, p_asset_name, p_asset_image_url, p_asset_rank, now())
  on conflict (id) do update
    set symbol = excluded.symbol,
        name = excluded.name,
        image_url = excluded.image_url,
        market_cap_rank = excluded.market_cap_rank,
        last_synced_at = now();

  update public.transactions
    set asset_id = p_asset_id,
        type = p_type,
        quantity = p_quantity,
        price_per_unit_usd = p_price_per_unit_usd,
        fee_usd = p_fee_usd,
        executed_at = p_executed_at,
        notes = p_notes
    where id = p_id and user_id = v_uid
    returning * into v_row;

  -- No row matched: either it doesn't exist or it belongs to another user.
  -- Fail closed without leaking which case it was.
  if not found then
    raise exception 'transaction not found' using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

-- Least privilege: only authenticated users may call these.
revoke all on function public.create_transaction(
  text, text, text, text, int, public.transaction_type,
  numeric, numeric, numeric, timestamptz, text
) from public;
grant execute on function public.create_transaction(
  text, text, text, text, int, public.transaction_type,
  numeric, numeric, numeric, timestamptz, text
) to authenticated;

revoke all on function public.update_transaction(
  uuid, text, text, text, text, int, public.transaction_type,
  numeric, numeric, numeric, timestamptz, text
) from public;
grant execute on function public.update_transaction(
  uuid, text, text, text, text, int, public.transaction_type,
  numeric, numeric, numeric, timestamptz, text
) to authenticated;
