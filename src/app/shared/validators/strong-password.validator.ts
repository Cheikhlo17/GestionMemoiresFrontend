import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';

    if (!value) {
      return null;
    }

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);
    const hasMinLength = value.length >= 8;

    const valid = hasUpper && hasLower && hasNumber && hasSymbol && hasMinLength;

    return valid
      ? null
      : {
          strongPassword: {
            hasUpper,
            hasLower,
            hasNumber,
            hasSymbol,
            hasMinLength,
          },
        };
  };
}