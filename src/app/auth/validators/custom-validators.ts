import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Custom validators for forms */
export class CustomValidators {

  /**
   * Validator to check if two password fields match
   * @param passwordField Name of the password field
   * @param confirmPasswordField Name of the confirm password field
   * @returns Validator function
   */
  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirmPassword = control.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        confirmPassword.setErrors(null);
        return null;
      }
    };
  }
}
