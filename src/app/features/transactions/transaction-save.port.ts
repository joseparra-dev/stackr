import { inject, InjectionToken } from '@angular/core';

import {
  formValueToInput,
  type TransactionFormValue,
} from './transaction-form/transaction-form.types';
import { TransactionsStore } from './transactions.store';

export interface TransactionSavePort {
  save(value: TransactionFormValue): Promise<void>;
}

export const TRANSACTION_SAVE_PORT = new InjectionToken<TransactionSavePort>(
  'TRANSACTION_SAVE_PORT',
  {
    providedIn: 'root',
    factory: () => {
      const store = inject(TransactionsStore);
      return {
        save: (value: TransactionFormValue): Promise<void> => {
          const input = formValueToInput(value);
          return value.id ? store.edit(value.id, input) : store.add(input);
        },
      };
    },
  },
);
