import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminImportPreview, AdminImportType } from '../../../../core/models/admin-import.model';
import { AdminImportService } from '../../../../core/services/admin-import.service';

@Component({
  selector: 'app-admin-imports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-imports.component.html',
  styleUrl: './admin-imports.component.scss',
})
export class AdminImportsComponent {
  private readonly importService = inject(AdminImportService);
  private readonly snackBar = inject(MatSnackBar);
  @ViewChild('csvFile') private csvFileInput?: ElementRef<HTMLInputElement>;

  readonly importTypes: { value: AdminImportType; label: string }[] = [
    { value: 'students', label: 'Étudiants' },
    { value: 'jury-members', label: 'Membres du jury' },
  ];
  type: AdminImportType = 'students';
  file: File | null = null;
  preview: AdminImportPreview | null = null;
  loadingTemplate = false;
  previewing = false;
  confirming = false;
  errorMessage = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.item(0) ?? null;
    this.clearPreview();
    this.errorMessage = '';
    if (selected && selected.size > 5 * 1024 * 1024) {
      this.file = null;
      input.value = '';
      this.errorMessage = 'Le fichier dépasse la limite contractuelle de 5 Mo.';
      return;
    }
    this.file = selected;
  }

  onImportTypeChange(): void {
    this.file = null;
    this.clearPreview();
    this.errorMessage = '';
    if (this.csvFileInput) this.csvFileInput.nativeElement.value = '';
  }

  downloadTemplate(): void {
    this.loadingTemplate = true;
    this.errorMessage = '';
    this.importService.downloadTemplate(this.type).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${this.type}-template.csv`;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.loadingTemplate = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.loadingTemplate = false;
      },
    });
  }

  runPreview(): void {
    if (!this.file || this.previewing || this.confirming) return;
    this.previewing = true;
    this.errorMessage = '';
    this.importService.preview(this.type, this.file).subscribe({
      next: (response) => {
        this.preview = response.data;
        this.previewing = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.previewing = false;
      },
    });
  }

  confirmImport(): void {
    if (!this.file || !this.preview || this.confirming || this.previewing) return;
    const validCount = this.preview.rows.filter((row) => row.valid && !row.duplicate).length;
    if (
      !window.confirm(
        `Confirmer l’import définitif de ${validCount} ligne(s) valide(s) ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    this.confirming = true;
    this.errorMessage = '';
    this.importService.confirm(this.type, this.file, this.preview.preview_hash).subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Import terminé.', 'Fermer', { duration: 5000 });
        this.confirming = false;
        this.file = null;
        this.clearPreview();
        if (this.csvFileInput) this.csvFileInput.nativeElement.value = '';
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.confirming = false;
      },
    });
  }

  clearPreview(): void {
    this.preview = null;
  }

  rowErrors(row: AdminImportPreview['rows'][number]): string[] {
    if (Array.isArray(row.errors)) return row.errors;
    return Object.entries(row.errors).flatMap(([field, errors]) =>
      errors.map((message) => `${field}: ${message}`)
    );
  }

  countValid(): number {
    return this.preview?.rows.filter((row) => row.valid && !row.duplicate).length ?? 0;
  }

  countDuplicates(): number {
    return this.preview?.rows.filter((row) => row.duplicate).length ?? 0;
  }

  countInvalid(): number {
    return this.preview?.rows.filter((row) => !row.valid && !row.duplicate).length ?? 0;
  }

  private errorText(error: HttpErrorResponse): string {
    const errors = error.error?.errors as Record<string, string[]> | undefined;
    const first = errors ? Object.values(errors).flat()[0] : undefined;
    return first || error.error?.message || 'Une erreur est survenue. Réessayez.';
  }
}
