import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type FormControl,
  type FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { startWith } from 'rxjs';

import { AssetCombobox } from '@features/assets/asset-combobox';
import type { AssetSearchResult } from '@features/assets/assets.types';
import { controlErrorMessage } from '@features/transactions/transaction-form/transaction-form.field-errors';
import {
  notFutureDateValidator,
  quantityPositiveValidator,
} from '@features/transactions/transaction-form/transaction-form.validator';
import { toDatetimeLocalValue } from '@features/transactions/transaction-form/transaction-form.types';
import type { TransactionType } from '@features/transactions/transactions.types';

interface TransactionFormControls {
  readonly id: FormControl<string>;
  readonly asset: FormControl<AssetSearchResult | null>;
  readonly type: FormControl<TransactionType>;
  readonly quantity: FormControl<number | null>;
  readonly pricePerUnitUsd: FormControl<number | null>;
  readonly feeUsd: FormControl<number>;
  readonly executedAt: FormControl<string>;
  readonly notes: FormControl<string>;
}

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule, AssetCombobox],
  templateUrl: './transaction-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly submitting = signal(false);

  protected readonly form: FormGroup<TransactionFormControls> =
    this.fb.group<TransactionFormControls>({
      id: this.fb.control(''),
      asset: this.fb.control<AssetSearchResult | null>(null, Validators.required),
      type: this.fb.control<TransactionType>('buy', Validators.required),
      quantity: this.fb.control<number | null>(null, [
        Validators.required,
        quantityPositiveValidator,
      ]),
      pricePerUnitUsd: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(0),
      ]),
      feeUsd: this.fb.control(0, Validators.min(0)),
      executedAt: this.fb.control(toDatetimeLocalValue(new Date().toISOString()), [
        Validators.required,
        notFutureDateValidator,
      ]),
      notes: this.fb.control('', Validators.maxLength(500)),
    });

  protected readonly inputClass =
    'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60';
  protected readonly inputErrorClass = 'border-danger focus-visible:outline-danger';
  protected readonly labelClass = 'mb-1.5 block text-sm font-medium text-(--color-text)';

  private readonly notesValue = toSignal(
    this.form.controls.notes.valueChanges.pipe(startWith(this.form.controls.notes.value)),
    { initialValue: '' },
  );
  protected readonly notesCount = computed(() => this.notesValue().length);

  protected fieldError(name: keyof TransactionFormControls): string | null {
    const control = this.form.controls[name];
    if (!control.touched || !control.errors) {
      return null;
    }

    return controlErrorMessage(control.errors);
  }

  protected hasFieldError(name: keyof TransactionFormControls): boolean {
    return this.fieldError(name) !== null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitting.set(false);
  }
}
