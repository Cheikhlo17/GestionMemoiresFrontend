import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { UiLabelPipe } from '../../shared/pipes/ui-label.pipe';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';
import { strongPasswordValidator } from '../../shared/validators/strong-password.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    UiLabelPipe,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.currentUser;
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator('password', 'password_confirmation') }
  );

  ngOnInit(): void {
    this.isLoading.set(true);
    this.authService.fetchMe().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les informations du compte.');
      },
    });
  }

  changePassword(): void {
    if (this.isSubmitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset();
        this.successMessage.set('Votre mot de passe a été modifié.');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Impossible de modifier le mot de passe. Vérifiez votre mot de passe actuel.');
      },
    });
  }
}
