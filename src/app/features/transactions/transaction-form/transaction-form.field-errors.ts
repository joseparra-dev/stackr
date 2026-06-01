import type { ValidationErrors } from '@angular/forms';

export function controlErrorMessage(errors: ValidationErrors): string {
  if (errors['required']) {
    return 'This field is required.';
  }

  if (errors['min']) {
    return 'Value must be zero or greater.';
  }

  if (errors['maxlength']) {
    return 'Maximum 500 characters.';
  }

  if (errors['quantityPositive']) {
    return 'Quantity must be greater than zero.';
  }

  if (errors['futureDate']) {
    return 'Date cannot be in the future.';
  }

  return 'Invalid value.';
}
