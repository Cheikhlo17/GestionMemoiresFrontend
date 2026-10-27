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
import { ThesisSubject } from '../../../../core/models/thesis-subject.model';
import { LookupService } from '../../../../core/services/lookup.service';
import { ThesisSubjectService } from '../../../../core/services/thesis-subject.service';
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
  private readonly thesisSubjectService = inject(ThesisSubjectService);
  private readonly lookupService = inject(LookupService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly departments = signal<Department[]>([]);
  readonly programs = signal<Program[]>([]);
  readonly academicYears = signal<AcademicYear[]>([]);
  readonly acceptedSubjects = signal<ThesisSubject[]>([]);
  readonly isLoadingSubjects = signal(false);
  readonly subjectLoadError = signal('');
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    abstract: [''],
    thesis_subject_id: [null as number | null, [Validators.required]],
    department_id: [null as number | null, [Validators.required]],
    program_id: [null as number | null, [Validators.required]],
    academic_year_id: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadAcceptedSubjects();
    this.lookupService.departments().subscribe((res) => this.departments.set(res.data));
    this.lookupService.academicYears().subscribe((res) => this.academicYears.set(res.data));

    this.form.get('thesis_subject_id')?.valueChanges.subscribe((subjectId) => {
      const subject = this.acceptedSubjects().find((item) => item.id === subjectId);
      this.form.get('department_id')?.setValue(subject?.department?.id ?? null);
    });

    this.form.get('department_id')?.valueChanges.subscribe((deptId) => {
      this.lookupService
        .programs(deptId ?? undefined)
        .subscribe((res) => this.programs.set(res.data));
    });
  }

  private loadAcceptedSubjects(): void {
    this.isLoadingSubjects.set(true);
    this.subjectLoadError.set('');
    this.thesisSubjectService.list({ status: 'accepted', per_page: 100 }).subscribe({
      next: (response) => {
        this.acceptedSubjects.set(response.data);
        if (response.data.length === 1) {
          this.form.controls.thesis_subject_id.setValue(response.data[0].id);
        }
        this.isLoadingSubjects.set(false);
      },
      error: () => {
        this.subjectLoadError.set('Impossible de charger vos sujets acceptés. Réessayez.');
        this.isLoadingSubjects.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoadingSubjects() || this.acceptedSubjects().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();

    this.thesisService
      .create({
        title: raw.title,
        abstract: raw.abstract || undefined,
        thesis_subject_id: raw.thesis_subject_id as number,
        department_id: raw.department_id as number,
        program_id: raw.program_id as number,
        academic_year_id: raw.academic_year_id as number,
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.snackBar.open('Brouillon du mémoire créé.', 'Fermer', { duration: 3000 });
          this.router.navigate(['/theses', res.data.id]);
        },
        error: () => this.isSubmitting.set(false),
      });
  }
}