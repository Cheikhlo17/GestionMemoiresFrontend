// src/app/features/admin/pages/academic-years/academic-years.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AcademicYear } from '../../../../core/models/academic-year.model';
import { AdminService } from '../../../../core/services/admin.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-academic-years',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  templateUrl: './academic-years.component.html',
  styleUrl: './academic-years.component.scss',
})
export class AcademicYearsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['label', 'start', 'end', 'current', 'actions'];

  readonly years = signal<AcademicYear[]>([]);
  readonly editingId = signal<number | null>(null);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(20)]],
    start_date: [null as Date | null, [Validators.required]],
    end_date: [null as Date | null, [Validators.required]],
    is_current: [false],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.listAcademicYears().subscribe((res) => this.years.set(res.data));
  }

  edit(year: AcademicYear): void {
    this.editingId.set(year.id);
    this.form.patchValue({
      label: year.label,
      start_date: new Date(year.start_date),
      end_date: new Date(year.end_date),
      is_current: year.is_current,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ label: '', start_date: null, end_date: null, is_current: false });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      label: raw.label,
      start_date: raw.start_date!.toISOString().split('T')[0],
      end_date: raw.end_date!.toISOString().split('T')[0],
      is_current: raw.is_current,
    };
    const editingId = this.editingId();

    const request$ = editingId
      ? this.adminService.updateAcademicYear(editingId, payload)
      : this.adminService.createAcademicYear(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open(editingId ? 'Année mise à jour.' : 'Année créée.', 'Fermer', {
          duration: 3000,
        });
        this.cancelEdit();
        this.load();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  remove(year: AcademicYear): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Supprimer l'année académique",
        message: `Voulez-vous vraiment supprimer "${year.label}" ?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.adminService.deleteAcademicYear(year.id).subscribe({
        next: () => {
          this.snackBar.open('Année supprimée.', 'Fermer', { duration: 3000 });
          this.load();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message ?? 'Suppression impossible.', 'Fermer', {
            duration: 4000,
          });
        },
      });
    });
  }
}