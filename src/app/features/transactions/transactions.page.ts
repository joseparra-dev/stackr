import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucidePlus } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';

import { DeleteTransactionDialog } from '@features/transactions/delete-transaction-dialog';
import type { DeleteTransactionDialogData } from '@features/transactions/delete-transaction-dialog';
import { TransactionForm } from '@features/transactions/transaction-form/transaction-form';
import type { TransactionFormDialogData } from '@features/transactions/transaction-form/transaction-form.dialog.types';
import { TransactionFilterBar } from '@features/transactions/transaction-filter-bar';
import { TransactionList } from '@features/transactions/transaction-list';
import {
  applyTransactionFilters,
  describeActiveFilters,
  EMPTY_TRANSACTION_FILTERS,
  filtersToQueryParams,
  hasActiveFilters,
  parseFiltersFromParamMap,
  uniqueAssetsFromTransactions,
  type TransactionFilters,
} from '@features/transactions/transactions-filter';
import { TransactionsStore } from '@features/transactions/transactions.store';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';
import { EmptyState, ErrorState, Skeleton, ToastService } from '@shared/ui';

const DIALOG_OPTIONS = {
  width: '100%',
  maxWidth: '32rem',
  panelClass: 'stackr-dialog-panel',
  backdropClass: 'stackr-dialog-backdrop',
} as const;

@Component({
  selector: 'app-transactions-page',
  imports: [EmptyState, ErrorState, LucidePlus, Skeleton, TransactionFilterBar, TransactionList],
  templateUrl: './transactions.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsPage {
  private readonly dialog = inject(Dialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(TransactionsStore);
  private readonly toast = inject(ToastService);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly hasTransactions = this.store.hasTransactions;

  readonly filters = computed(() => parseFiltersFromParamMap(this.queryParamMap()));

  readonly assetOptions = computed(() => uniqueAssetsFromTransactions(this.store.transactions()));

  readonly transactions = computed(() =>
    applyTransactionFilters(this.store.transactions(), this.filters()),
  );

  readonly hasActiveFilters = computed(() => hasActiveFilters(this.filters()));

  readonly hasFilteredTransactions = computed(() => this.transactions().length > 0);

  readonly filtersDescription = computed(() =>
    describeActiveFilters(this.store.transactions(), this.filters()),
  );

  constructor() {
    void this.store.load();
  }

  retryLoad(): void {
    void this.store.load();
  }

  onFiltersChange(next: TransactionFilters): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtersToQueryParams(next),
    });
  }

  clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtersToQueryParams(EMPTY_TRANSACTION_FILTERS),
    });
  }

  protected openCreateDialog(): void {
    this.dialog.open<boolean, TransactionFormDialogData>(TransactionForm, {
      ...DIALOG_OPTIONS,
      data: { mode: 'create' },
    });
  }

  protected openEditDialog(tx: TransactionWithAsset): void {
    this.dialog.open<boolean, TransactionFormDialogData>(TransactionForm, {
      ...DIALOG_OPTIONS,
      data: { mode: 'edit', transaction: tx, asset: tx.asset },
    });
  }

  protected async confirmDelete(tx: TransactionWithAsset): Promise<void> {
    const confirmed = await firstValueFrom(
      this.dialog.open<boolean, DeleteTransactionDialogData>(DeleteTransactionDialog, {
        ...DIALOG_OPTIONS,
        maxWidth: '28rem',
        data: { assetSymbol: tx.asset.symbol, type: tx.type },
      }).closed,
    );

    if (!confirmed) return;

    try {
      await this.store.remove(tx.id);
      this.toast.success('Transaction deleted.');
    } catch {
      const code = this.store.error()?.code ?? 'unknown';
      this.toast.error(code);
    }
  }
}
