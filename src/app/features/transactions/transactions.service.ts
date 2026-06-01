import { inject, Injectable } from '@angular/core';

import { mapSupabaseError } from '@core/errors/map-supabase-error';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

import { rowToTransaction, toRpcArgs } from './transactions.mapper';
import type { Transaction, TransactionInput, TransactionRow } from './transactions.types';

const TABLE = 'transactions';

/**
 * Thin async wrapper over Supabase for transaction CRUD. Every method resolves
 * with domain types or rejects with an {@link AppError} (never a raw Supabase
 * error). Promise-based on purpose — no RxJS here.
 */
@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly client = inject(SUPABASE_CLIENT);

  async list(): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .order('executed_at', { ascending: false });

    if (error) throw mapSupabaseError(error);

    return ((data ?? []) as TransactionRow[]).map(rowToTransaction);
  }

  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.client.from(TABLE).select('*').eq('id', id).maybeSingle();

    if (error) throw mapSupabaseError(error);

    return data ? rowToTransaction(data as TransactionRow) : null;
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
