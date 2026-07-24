import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AcademicYear } from '../../../../core/models/academic-year.model';
import { Department } from '../../../../core/models/department.model';
import { Program } from '../../../../core/models/program.model';
import { StudentStatus } from '../../../../core/models/student.model';
import { LookupService } from '../../../../core/services/lookup.service';
import { StudentService } from '../../../../core/services/student.service';

@Component({
  selector: 'app-student-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly lookupService = inject(LookupService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly departments = signal<Department[]>([]);
  readonly programs = signal<Program[]>([]);
  readonly academicYears = signal<AcademicYear[]>([]);
  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);
  readonly studentId = signal<number | null>(null);

  readonly statusOptions: StudentStatus[] = ['active', 'graduated', 'suspended', 'withdrawn'];

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(100)]],
    last_name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    department_id: [null as number | null, [Validators.required]],
    program_id: [null as number | null, [Validators.required]],
    academic_year_id: [null as number | null, [Validators.required]],
    student_number: ['', [Validators.required, Validators.maxLength(50)]],
    enrollment_date: [null as Date | null, [Validators.required]],
    status: ['active' as StudentStatus],
  });

  ngOnInit(): void {
    this.lookupService.departments().subscribe((res) => this.departments.set(res.data));
    this.lookupService.academicYears().subscribe((res) => this.academicYears.set(res.data));

    this.form.get('department_id')?.valueChanges.subscribe((deptId) => {
      this.lookupService
        .programs(deptId ?? undefined)
        .subscribe((res) => this.programs.set(res.data));
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.studentId.set(Number(idParam));
      this.loadStudent(Number(idParam));
      this.form.get('email')?.clearValidators();
      this.form.get('email')?.addValidators([Validators.email]);
    }
  }

  private loadStudent(id: number): void {
    this.studentService.get(id).subscribe((res) => {
      const s = res.data;
      this.form.patchValue({
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        phone: s.phone ?? '',
        department_id: s.department.id,
        program_id: s.program.id,
        academic_year_id: s.academic_year.id,
        student_number: s.student_number,
        enrollment_date: new Date(s.enrollment_date),
        status: s.status,
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      department_id: raw.department_id as number,
      program_id: raw.program_id as number,
      academic_year_id: raw.academic_year_id as number,
      enrollment_date: raw.enrollment_date
        ? raw.enrollment_date.toISOString().split('T')[0]
        : '',
    };

    const request$ = this.isEditMode()
      ? this.studentService.update(this.studentId()!, payload)
      : this.studentService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open(
          `Student ${this.isEditMode() ? 'updated' : 'created'} successfully.`,
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/students']);
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}