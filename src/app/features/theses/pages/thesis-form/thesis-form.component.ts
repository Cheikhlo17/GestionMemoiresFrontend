import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AcademicYear } from '../../../../core/models/academic-year.model';
import { Department } from '../../../../core/models/department.model';
import { Program } from '../../../../core/models/program.model';
import { LookupService } from '../../../../core/services/lookup.service';
import { ThesisService } from '../../../../core/services/thesis.service';

@Component({
  selector: 'app-thesis-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './thesis-form.component.html',
  styleUrl: './thesis-form.component.scss',
})
export class ThesisFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly thesisService = inject(ThesisService);
  private readonly lookupService = inject(LookupService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly departments = signal<Department[]>([]);
  readonly programs = signal<Program[]>([]);
  readonly academicYears = signal<AcademicYear[]>([]);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    abstract: [''],
    department_id: [null as number | null, [Validators.required]],
    program_id: [null as number | null, [Validators.required]],
    academic_year_id: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.lookupService.departments().subscribe((res) => this.departments.set(res.data));
    this.lookupService.academicYears().subscribe((res) => this.academicYears.set(res.data));

    this.form.get('department_id')?.valueChanges.subscribe((deptId) => {
      this.lookupService
        .programs(deptId ?? undefined)
        .subscribe((res) => this.programs.set(res.data));
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();

    this.thesisService
      .create({
        title: raw.title,
        abstract: raw.abstract || undefined,
        department_id: raw.department_id as number,
        program_id: raw.program_id as number,
        academic_year_id: raw.academic_year_id as number,
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.snackBar.open('Thesis draft created.', 'Close', { duration: 3000 });
          this.router.navigate(['/theses', res.data.id]);
        },
        error: () => this.isSubmitting.set(false),
      });
  }
}