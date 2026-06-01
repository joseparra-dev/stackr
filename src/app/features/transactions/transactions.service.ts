import { inject, Injectable } from '@angular/core';

import { mapSupabaseError } from '@core/errors/map-supabase-error';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

import { rowToTransaction, rowToTransactionWithAsset, toRpcArgs } from './transactions.mapper';
import type {
  Transaction,
  TransactionInput,
  TransactionRow,
  TransactionWithAsset,
  TransactionWithAssetRow,
} from './transactions.types';

const TABLE = 'transactions';

const LIST_SELECT = `
  id,
  user_id,
  asset_id,
  type,
  quantity,
  price_per_unit_usd,
  fee_usd,
  executed_at,
  notes,
  created_at,
  updated_at,
  assets ( id, symbol, name, image_url, market_cap_rank )
`;

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly client = inject(SUPABASE_CLIENT);

  async list(): Promise<TransactionWithAsset[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(LIST_SELECT)
      .order('executed_at', { ascending: false });

    if (error) throw mapSupabaseError(error);

    return ((data ?? []) as unknown as TransactionWithAssetRow[]).map(rowToTransactionWithAsset);
  }

  async getById(id: string): Promise<TransactionWithAsset | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(LIST_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw mapSupabaseError(error);

    return data ? rowToTransactionWithAsset(data as unknown as TransactionWithAssetRow) : null;
  }

  async create(input: TransactionInput): Promise<Transaction> {
    const { data, error } = await this.client.rpc('create_transaction', toRpcArgs(input));
    if (error) throw mapSupabaseError(error);

    return rowToTransaction(data as TransactionRow);
  }

  async update(id: string, input: TransactionInput): Promise<Transaction> {
    const { data, error } = await this.client.rpc('update_transaction', {
      p_id: id,
      ...toRpcArgs(input),
    });
    if (error) throw mapSupabaseError(error);

    return rowToTransaction(data as TransactionRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq('id', id);
    if (error) throw mapSupabaseError(error);
  }
}
