import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const quantityPositiveValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;
  return Number(value) > 0 ? null : { quantityPositive: true };
};

export const notFutureDateValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value as string;
  if (!value) return null;
  return new Date(value) > new Date() ? { futureDate: true } : null;
};
