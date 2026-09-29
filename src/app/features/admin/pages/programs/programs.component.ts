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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Department } from '../../../../core/models/department.model';
import { Program } from '../../../../core/models/program.model';
import { AdminService } from '../../../../core/services/admin.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss',
})
export class ProgramsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly lookupService = inject(LookupService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['name', 'code', 'department', 'level', 'actions'];

  readonly programs = signal<Program[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly editingId = signal<number | null>(null);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    department_id: [null as number | null, [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
    degree_level: ['bachelor' as 'bachelor' | 'master' | 'phd', [Validators.required]],
    is_active: [true],
  });

  ngOnInit(): void {
    this.lookupService.departments().subscribe((res) => this.departments.set(res.data));
    this.load();
  }

  load(): void {
    this.adminService.listPrograms().subscribe((res) => this.programs.set(res.data));
  }

  edit(program: Program): void {
    this.editingId.set(program.id);
    this.form.patchValue({
      department_id: program.department?.id ?? null,
      name: program.name,
      code: program.code,
      degree_level: program.degree_level,
      is_active: true,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ department_id: null, name: '', code: '', degree_level: 'bachelor', is_active: true });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    const payload = { ...raw, department_id: raw.department_id as number };
    const editingId = this.editingId();

    const request$ = editingId
      ? this.adminService.updateProgram(editingId, payload)
      : this.adminService.createProgram(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open(editingId ? 'Formation mise à jour.' : 'Formation créée.', 'Fermer', {
          duration: 3000,
        });
        this.cancelEdit();
        this.load();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  remove(program: Program): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer la formation',
        message: `Voulez-vous vraiment supprimer "${program.name}" ?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.adminService.deleteProgram(program.id).subscribe({
        next: () => {
          this.snackBar.open('Formation supprimée.', 'Fermer', { duration: 3000 });
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