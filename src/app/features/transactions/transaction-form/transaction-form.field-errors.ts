import type { ValidationErrors } from '@angular/forms';

export function controlErrorKey(errors: ValidationErrors): string {
  if (errors['required']) {
    return 'errors.validation.required';
  }

  if (errors['min']) {
    return 'errors.validation.minZero';
  }

  if (errors['maxlength']) {
    return 'errors.validation.maxLength500';
  }

  if (errors['quantityPositive']) {
    return 'errors.validation.quantityPositive';
  }

  if (errors['futureDate']) {
    return 'errors.validation.futureDate';
  }

  return 'errors.validation.invalidValue';
}
