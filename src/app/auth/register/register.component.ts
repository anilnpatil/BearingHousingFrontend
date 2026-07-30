import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../validators/custom-validators';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm: FormGroup;
  isLoading = false;
  error = '';
  success = false;

  @Input() disableRedirect = false;
  @Output() registrationSuccess = new EventEmitter<{ username: string }>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required]
    }, {
      validators: CustomValidators.passwordMatch('password', 'confirmPassword')
    });
  }

  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get role() {
    return this.registerForm.get('role');
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const { username, password, role } = this.registerForm.value;

    this.authService.register(username, password, role).subscribe({
      next: () => {
        console.log('Registration successful');
        this.isLoading = false;
        this.success = true;
        this.cdr.detectChanges();

        if (this.disableRedirect) {          
          this.registrationSuccess.emit({ username });          
          setTimeout(() => {
            this.success = false;
            this.registerForm.reset({ role: 'USER' });
            this.cdr.detectChanges();
          }, 2000);
        } else {
          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (err) => {
        console.log('Registration error:', err);
        this.isLoading = false;
        
        let errorMessage = 'Registration failed. Please try again.';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.error) {
            errorMessage = err.error.error;
          }
        }
        this.error = errorMessage;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
