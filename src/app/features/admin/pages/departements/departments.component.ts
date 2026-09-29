import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DepartmentDetail } from '../../../../core/models/department-detail.model';
import { AdminService } from '../../../../core/services/admin.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-departments',
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
    MatDialogModule,
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss',
})
export class DepartmentsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['name', 'code', 'programs', 'students', 'status', 'actions'];

  readonly departments = signal<DepartmentDetail[]>([]);
  readonly editingId = signal<number | null>(null);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
    is_active: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.listDepartments().subscribe((res) => this.departments.set(res.data));
  }

  edit(dept: DepartmentDetail): void {
    this.editingId.set(dept.id);
    this.form.patchValue({ name: dept.name, code: dept.code, is_active: dept.is_active });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', code: '', is_active: true });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    const editingId = this.editingId();

    const request$ = editingId
      ? this.adminService.updateDepartment(editingId, raw)
      : this.adminService.createDepartment(raw);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open(
          editingId ? 'Département mis à jour.' : 'Département créé.',
          'Fermer',
          { duration: 3000 }
        );
        this.cancelEdit();
        this.load();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  remove(dept: DepartmentDetail): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le département',
        message: `Voulez-vous vraiment supprimer "${dept.name}" ?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.adminService.deleteDepartment(dept.id).subscribe({
        next: () => {
          this.snackBar.open('Département supprimé.', 'Fermer', { duration: 3000 });
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