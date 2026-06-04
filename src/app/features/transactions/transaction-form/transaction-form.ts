import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
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

import { AppError } from '@core/errors/app-error';
import { I18nService } from '@core/i18n/i18n.service';
import { AssetCombobox } from '@features/assets/asset-combobox';
import type { AssetSearchResult } from '@features/assets/assets.types';
import type { TransactionFormDialogData } from '@features/transactions/transaction-form/transaction-form.dialog.types';
import { controlErrorKey } from '@features/transactions/transaction-form/transaction-form.field-errors';
import {
  toDatetimeLocalValue,
  toFormValue,
  type TransactionFormValue,
} from '@features/transactions/transaction-form/transaction-form.types';
import {
  notFutureDateValidator,
  quantityPositiveValidator,
} from '@features/transactions/transaction-form/transaction-form.validator';
import { TRANSACTION_SAVE_PORT } from '@features/transactions/transaction-save.port';
import type { TransactionType } from '@features/transactions/transactions.types';
import { DatetimeInput, ToastService, TranslatePipe } from '@shared/ui';

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
  imports: [ReactiveFormsModule, AssetCombobox, DatetimeInput, TranslatePipe],
  templateUrl: './transaction-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(DialogRef<boolean>, { optional: true });
  private readonly dialogData = inject<TransactionFormDialogData | null>(DIALOG_DATA, {
    optional: true,
  });
  private readonly savePort = inject(TRANSACTION_SAVE_PORT);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly submitting = signal(false);
  readonly submitError = signal<AppError | null>(null);

  protected readonly translateError = this.i18n.translateError.bind(this.i18n);

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

  protected readonly titleKey = computed(() =>
    this.dialogData?.mode === 'edit' ? 'transactions.form.editTitle' : 'transactions.form.addTitle',
  );
  protected readonly submitLabelKey = computed(() =>
    this.dialogData?.mode === 'edit'
      ? 'transactions.form.saveChanges'
      : 'transactions.form.save',
  );

  protected readonly inputClass =
    'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60';
  protected readonly labelClass = 'mb-1.5 block text-sm font-medium text-(--color-text)';

  private readonly notesValue = toSignal(
    this.form.controls.notes.valueChanges.pipe(startWith(this.form.controls.notes.value)),
    { initialValue: '' },
  );
  protected readonly notesCount = computed(() => this.notesValue().length);

  constructor() {
    this.applyDialogData();
  }

  protected fieldError(name: keyof TransactionFormControls): string | null {
    const control = this.form.controls[name];
    if (!control.touched || !control.errors) {
      return null;
    }

    this.i18n.locale();
    return this.i18n.translate(controlErrorKey(control.errors));
  }

  protected hasFieldError(name: keyof TransactionFormControls): boolean {
    return this.fieldError(name) !== null;
  }

  protected onCancel(): void {
    this.dialogRef?.close(false);
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);
    this.form.disable();

    try {
      await this.savePort.save(this.form.getRawValue() as TransactionFormValue);
      this.toast.success(
        this.i18n.translate(
          this.dialogData?.mode === 'edit'
            ? 'transactions.toast.updated'
            : 'transactions.toast.saved',
        ),
      );
      this.dialogRef?.close(true);
    } catch (cause) {
      this.submitError.set(AppError.from(cause));
    } finally {
      this.form.enable();
      this.submitting.set(false);
    }
  }

  private applyDialogData(): void {
    const data = this.dialogData;
    if (data?.mode !== 'edit' || !data.transaction || !data.asset) {
      return;
    }

    this.form.patchValue(toFormValue(data.transaction, data.asset));
  }
}
