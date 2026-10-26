import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { UpdateProfilePayload } from '../../core/interfaces/auth.interface';
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
  readonly isUpdatingProfile = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly profileError = signal<string | null>(null);
  readonly profileSuccess = signal<string | null>(null);
  readonly selectedAvatar = signal<File | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    first_name: ['', [Validators.maxLength(100)]],
    last_name: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.maxLength(30)]],
  });

  readonly form = this.fb.nonNullable.group(
    {
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator('password', 'password_confirmation') }
  );

  ngOnInit(): void {
    const cachedUser = this.user();
    if (cachedUser) this.patchProfileForm(cachedUser);

    this.isLoading.set(true);
    this.authService.fetchMe().subscribe({
      next: (res) => {
        this.patchProfileForm(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les informations du compte.');
      },
    });
  }

  private patchProfileForm(user: User): void {
    this.profileForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone ?? '',
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.profileError.set(null);

    if (file && !file.type.startsWith('image/')) {
      this.selectedAvatar.set(null);
      input.value = '';
      this.profileError.set('Le fichier sélectionné doit être une image.');
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      this.selectedAvatar.set(null);
      input.value = '';
      this.profileError.set('La taille de l’image ne doit pas dépasser 2 Mo.');
      return;
    }

    this.selectedAvatar.set(file);
  }

  updateProfile(): void {
    if (this.isUpdatingProfile()) return;
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const payload = this.buildProfilePayload();
    const avatar = this.selectedAvatar();
    if (avatar) payload.avatar = avatar;
    if (!Object.keys(payload).length) {
      this.profileSuccess.set('Aucune modification à enregistrer.');
      return;
    }

    this.isUpdatingProfile.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    this.authService
      .updateProfile(payload)
      .subscribe({
        next: (response) => {
          this.isUpdatingProfile.set(false);
          this.selectedAvatar.set(null);
          this.patchProfileForm(response.data);
          this.profileSuccess.set('Vos informations ont été mises à jour.');
        },
        error: (error: HttpErrorResponse) => {
          this.isUpdatingProfile.set(false);
          this.profileError.set(this.errorText(error));
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
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.errorText(error));
      },
    });
  }

  private errorText(error: HttpErrorResponse): string {
    const errors = error.error?.errors as Record<string, string[]> | undefined;
    const first = errors ? Object.values(errors).flat()[0] : undefined;
    return first || error.error?.message || 'Une erreur est survenue. Réessayez.';
  }

  private buildProfilePayload(): UpdateProfilePayload {
    const values = this.profileForm.getRawValue();
    const current = this.user();
    const payload: UpdateProfilePayload = {};
    const firstName = values.first_name.trim();
    const lastName = values.last_name.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();

    if (firstName && firstName !== current?.first_name) payload.first_name = firstName;
    if (lastName && lastName !== current?.last_name) payload.last_name = lastName;
    if (email && email !== current?.email) payload.email = email;
    if (phone !== (current?.phone ?? '')) payload.phone = phone || null;
    return payload;
  }
}
