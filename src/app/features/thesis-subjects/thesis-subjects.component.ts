import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { Department } from '../../core/models/department.model';
import { LookupService } from '../../core/services/lookup.service';
import { ThesisSubjectService } from '../../core/services/thesis-subject.service';
import { PaginatedResponse } from '../../core/interfaces/student.interface';
import {
  ThesisSubject,
  ThesisSubjectPayload,
  ThesisSubjectStatus,
} from '../../core/models/thesis-subject.model';

type FormMode = 'proposal' | 'publish' | 'edit';

@Component({
  selector: 'app-thesis-subjects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './thesis-subjects.component.html',
  styleUrl: './thesis-subjects.component.scss',
})
export class ThesisSubjectsComponent implements OnInit {
  private readonly subjectsService = inject(ThesisSubjectService);
  private readonly auth = inject(AuthService);
  private readonly lookupService = inject(LookupService);
  private readonly snackBar = inject(MatSnackBar);

  readonly statuses: ThesisSubjectStatus[] = [
    'draft',
    'submitted',
    'under_review',
    'accepted',
    'rejected',
    'published',
  ];
  subjects: ThesisSubject[] = [];
  departments: Department[] = [];
  page = 1;
  lastPage = 1;
  total = 0;
  loading = false;
  saving = false;
  errorMessage = '';
  departmentLookupError = '';
  statusFilter: ThesisSubjectStatus | '' = '';
  mode: FormMode | null = null;
  editingSubject: ThesisSubject | null = null;
  reviewSubjectId: number | null = null;
  reviewStatus: Extract<ThesisSubjectStatus, 'under_review' | 'accepted' | 'rejected'> =
    'under_review';
  reviewRemarks = '';
  departmentId: number | null = null;
  form = this.emptyForm();

  get role(): string | null {
    return this.auth.currentRole();
  }

  get isStudent(): boolean {
    return this.role === 'student';
  }

  get canManage(): boolean {
    return this.role === 'administrator' || this.role === 'head-of-department';
  }

  ngOnInit(): void {
    this.loadSubjects();
    this.lookupService.departments().subscribe({
      next: (response) => {
        this.departments = response.data;
      },
      error: (error: HttpErrorResponse) => {
        this.departmentLookupError = this.errorText(error);
      },
    });
  }

  loadSubjects(page = 1): void {
    this.loading = true;
    this.errorMessage = '';
    this.subjectsService
      .list({ page, per_page: 15, ...(this.statusFilter ? { status: this.statusFilter } : {}) })
      .subscribe({
        next: (response: PaginatedResponse<ThesisSubject>) => {
          this.subjects = response.data;
          this.page = response.meta.current_page;
          this.lastPage = response.meta.last_page;
          this.total = response.meta.total;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.errorText(error);
          this.loading = false;
        },
      });
  }

  openForm(mode: FormMode, subject?: ThesisSubject): void {
    this.mode = mode;
    this.editingSubject = subject ?? null;
    this.form = subject
      ? {
          title: subject.title,
          problem_statement: subject.problem_statement ?? '',
          objectives: subject.objectives ?? '',
          keywords: (subject.keywords ?? []).join(', '),
          additional_information: subject.additional_information ?? '',
        }
      : this.emptyForm();
    this.departmentId = null;
    this.errorMessage = '';
  }

  closeForm(): void {
    this.mode = null;
    this.editingSubject = null;
  }

  saveForm(): void {
    if (this.saving || !this.mode || !this.form.title.trim()) {
      return;
    }
    if (this.mode === 'publish' && (!this.departmentId || this.departmentId < 1)) {
      this.errorMessage = 'Indiquez un identifiant de département valide.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const payload = this.toPayload();
    const request =
      this.mode === 'publish'
        ? this.subjectsService.publish(this.departmentId!, payload)
        : this.mode === 'edit' && this.editingSubject
          ? this.subjectsService.update(this.editingSubject.id, payload)
          : this.subjectsService.create(payload);

    request.subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Sujet enregistré.', 'Fermer', {
          duration: 4000,
        });
        this.closeForm();
        this.saving = false;
        this.loadSubjects(this.page);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.saving = false;
      },
    });
  }

  submitProposal(subject: ThesisSubject): void {
    this.runAction(() => this.subjectsService.submit(subject.id), 'Proposition soumise.');
  }

  selectSubject(subject: ThesisSubject): void {
    this.runAction(() => this.subjectsService.select(subject.id), 'Sujet sélectionné.');
  }

  review(subject: ThesisSubject): void {
    if (this.reviewStatus === 'rejected' && !this.reviewRemarks.trim()) {
      this.errorMessage = 'Un motif est obligatoire pour rejeter un sujet.';
      return;
    }
    this.runAction(
      () => this.subjectsService.review(subject.id, this.reviewStatus, this.reviewRemarks.trim()),
      'Décision enregistrée.',
      () => {
        this.reviewSubjectId = null;
        this.reviewRemarks = '';
      }
    );
  }

  private runAction(
    request: () => ReturnType<ThesisSubjectService['submit']>,
    fallbackMessage: string,
    afterSuccess: () => void = () => undefined
  ): void {
    if (this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    request().subscribe({
      next: (response) => {
        this.snackBar.open(response.message || fallbackMessage, 'Fermer', { duration: 4000 });
        this.saving = false;
        afterSuccess();
        this.loadSubjects(this.page);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.saving = false;
      },
    });
  }

  private toPayload(): ThesisSubjectPayload {
    return {
      title: this.form.title.trim(),
      problem_statement: this.form.problem_statement.trim() || null,
      objectives: this.form.objectives.trim() || null,
      keywords: this.form.keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      additional_information: this.form.additional_information.trim() || null,
    };
  }

  private emptyForm(): {
    title: string;
    problem_statement: string;
    objectives: string;
    keywords: string;
    additional_information: string;
  } {
    return {
      title: '',
      problem_statement: '',
      objectives: '',
      keywords: '',
      additional_information: '',
    };
  }

  private errorText(error: HttpErrorResponse): string {
    const validation = error.error?.errors as Record<string, string[]> | undefined;
    const firstValidation = validation ? Object.values(validation).flat()[0] : undefined;
    return firstValidation || error.error?.message || 'Une erreur est survenue. Réessayez.';
  }
}
