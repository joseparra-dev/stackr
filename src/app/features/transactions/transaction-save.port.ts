import { InjectionToken } from '@angular/core';

import type { TransactionFormValue } from '@features/transactions/transaction-form/transaction-form.types';

export interface TransactionSavePort {
  save(value: TransactionFormValue): Promise<void>;
}

export const TRANSACTION_SAVE_PORT = new InjectionToken<TransactionSavePort>(
  'TRANSACTION_SAVE_PORT',
);

export const transactionSaveStub: TransactionSavePort = {
  save: () => new Promise((resolve) => setTimeout(resolve, 400)),
};
