import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { AuthService } from '../../../../core/services/auth.service';
import { Thesis, ThesisStatus } from '../../../../core/models/thesis.model';
import { ThesisService } from '../../../../core/services/thesis.service';
import { ThesisCorrectionService } from '../../../../core/services/thesis-correction.service';
import {
  CreateThesisCorrectionPayload,
  ThesisCorrection,
  ThesisCorrectionPriority,
  ThesisCorrectionStatus,
} from '../../../../core/models/thesis-correction.model';

import {
  StatusChangeDialogComponent,
} from '../../components/status-change-dialog/status-change-dialog.component';

import {
  AssignSupervisorDialogComponent,
} from '../../components/assign-supervisor-dialog/assign-supervisor-dialog.component';

import {
  ArchiveDialogComponent,
} from '../../components/archive-dialog/archive-dialog.component';

import { UiLabelPipe } from '../../../../shared/pipes/ui-label.pipe';

const NEXT_STATUSES: Record<ThesisStatus, ThesisStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['revision_required', 'approved', 'rejected'],
  revision_required: ['submitted'],
  approved: [],
  rejected: [],
  archived: [],
};

export function isThesisOwner(
  userId: number | undefined,
  studentId: number | undefined,
  isStudent: boolean
): boolean {
  return isStudent && userId !== undefined && userId === studentId;
}

@Component({
  selector: 'app-thesis-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    UiLabelPipe,
  ],
  templateUrl: './thesis-detail.component.html',
  styleUrl: './thesis-detail.component.scss',
})
export class ThesisDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly thesisService = inject(ThesisService);
  private readonly correctionService = inject(ThesisCorrectionService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly authService = inject(AuthService);

  readonly thesis = signal<Thesis | null>(null);
  readonly isLoading = signal(false);
  readonly isUploading = signal(false);
  readonly isCommenting = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly corrections = signal<ThesisCorrection[]>([]);
  readonly correctionsLoading = signal(false);
  readonly correctionsError = signal('');
  readonly isSavingCorrection = signal(false);
  readonly isUpdatingCorrection = signal(false);
  readonly correctionForm = this.fb.group({
    thesis_version_id: [null as number | null, Validators.required],
    remark: ['', Validators.required],
    page_number: [null as number | null, Validators.min(1)],
    section: [''],
    anchor: [''],
    priority: ['medium' as ThesisCorrectionPriority, Validators.required],
  });

  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(3000)]],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadThesis(id);
  }

  private loadThesis(id: number): void {
    this.isLoading.set(true);

    this.thesisService.get(id).subscribe({
      next: (res) => {
        this.thesis.set(res.data);
        this.isLoading.set(false);
        if (this.isCorrectionParticipant(res.data.id)) {
          this.loadCorrections(res.data.id);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  get isOwner(): boolean {
    return isThesisOwner(
      this.authService.currentUser()?.id,
      this.thesis()?.student.id,
      this.authService.hasRole('student')
    );
  }

  get isAssignedSupervisor(): boolean {
    const thesis = this.thesis();
    return (
      this.authService.hasRole('supervisor') &&
      !!thesis?.supervisor &&
      thesis.supervisor.id === this.authService.currentUser()?.id
    );
  }

  private isCorrectionParticipant(_thesisId: number): boolean {
    return this.isOwner || this.isAssignedSupervisor;
  }

  private loadCorrections(thesisId: number): void {
    this.correctionsLoading.set(true);
    this.correctionsError.set('');
    this.correctionService.list(thesisId).subscribe({
      next: (response) => {
        this.corrections.set(response.data);
        this.correctionsLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.correctionsError.set(this.errorText(error));
        this.correctionsLoading.set(false);
      },
    });
  }

  createCorrection(): void {
    if (this.correctionForm.invalid || this.isSavingCorrection()) {
      this.correctionForm.markAllAsTouched();
      return;
    }
    const thesis = this.thesis();
    if (!thesis) return;

    const value = this.correctionForm.getRawValue();
    const payload: CreateThesisCorrectionPayload = {
      thesis_version_id: value.thesis_version_id!,
      remark: value.remark!.trim(),
      priority: value.priority!,
    };
    if (value.page_number) payload.page_number = value.page_number;
    if (value.section?.trim()) payload.section = value.section.trim();
    if (value.anchor?.trim()) payload.anchor = value.anchor.trim();

    this.isSavingCorrection.set(true);
    this.correctionsError.set('');
    this.correctionService.create(thesis.id, payload).subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Correction ajoutée.', 'Fermer', {
          duration: 4000,
        });
        this.correctionForm.reset({ priority: 'medium' });
        this.isSavingCorrection.set(false);
        this.loadCorrections(thesis.id);
      },
      error: (error: HttpErrorResponse) => {
        this.correctionsError.set(this.errorText(error));
        this.isSavingCorrection.set(false);
      },
    });
  }

  changeCorrectionStatus(
    correction: ThesisCorrection,
    status: ThesisCorrectionStatus
  ): void {
    const thesis = this.thesis();
    if (!thesis) return;
    this.correctionsError.set('');
    if (this.isUpdatingCorrection()) return;
    this.isUpdatingCorrection.set(true);
    this.correctionService.updateStatus(thesis.id, correction.id, status).subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Statut de correction mis à jour.', 'Fermer', {
          duration: 4000,
        });
        this.isUpdatingCorrection.set(false);
        this.loadCorrections(thesis.id);
      },
      error: (error: HttpErrorResponse) => {
        this.correctionsError.set(this.errorText(error));
        this.isUpdatingCorrection.set(false);
      },
    });
  }

  correctionVersionLabel(versionId: number): string {
    const version = this.thesis()?.versions.find((item) => item.id === versionId);
    if (!version) {
      const correction = this.corrections().find((item) => {
        const nested = item.thesis_version;
        if (typeof nested === 'object' && nested !== null) {
          return nested.id === versionId;
        }
        return nested === versionId;
      });
      if (correction && typeof correction.thesis_version === 'object' && correction.thesis_version) {
        return `Version ${correction.thesis_version.version_number}`;
      }
      return `Version #${versionId}`;
    }
    return version ? `v${version.version_number} — ${version.file_name}` : `Version ${versionId}`;
  }

  correctionVersionId(correction: ThesisCorrection): number {
    const nested = correction.thesis_version;
    return typeof nested === 'object' && nested !== null ? nested.id : nested;
  }

  private errorText(error: HttpErrorResponse): string {
    const errors = error.error?.errors as Record<string, string[]> | undefined;
    const first = errors ? Object.values(errors).flat()[0] : undefined;
    return first || error.error?.message || 'Une erreur est survenue. Réessayez.';
  }

  get canAssignSupervisor(): boolean {
    return this.authService.hasRole(
      'administrator',
      'head-of-department'
    );
  }

  get allowedNextStatuses(): ThesisStatus[] {
    const t = this.thesis();
    return t ? NEXT_STATUSES[t.status] : [];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  uploadFile(): void {
    const file = this.selectedFile();
    const thesis = this.thesis();

    if (!file || !thesis) return;

    this.isUploading.set(true);

    this.thesisService.uploadVersion(thesis.id, file).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.selectedFile.set(null);

        this.snackBar.open(
          'Fichier déposé avec succès.',
          'Fermer',
          { duration: 3000 }
        );

        this.loadThesis(thesis.id);
      },
      error: () => this.isUploading.set(false),
    });
  }

  downloadVersion(versionId: number, fileName: string): void {
    const thesis = this.thesis();

    if (!thesis) return;

    this.thesisService
      .downloadVersion(thesis.id, versionId)
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = fileName;
        a.click();

        window.URL.revokeObjectURL(url);
      });
  }

  submitThesis(): void {
    const thesis = this.thesis();

    if (!thesis) return;

    this.thesisService.submit(thesis.id).subscribe({
      next: () => {
        this.snackBar.open(
          'Mémoire soumis pour examen.',
          'Fermer',
          { duration: 3000 }
        );

        this.loadThesis(thesis.id);
      },
    });
  }

  openAssignSupervisorDialog(): void {
    const thesis = this.thesis();

    if (!thesis) return;

    const dialogRef = this.dialog.open(
      AssignSupervisorDialogComponent,
      {
        data: {
          departmentId: thesis.department.id,
          currentSupervisorId: thesis.supervisor?.id ?? null,
        },
        width: '420px',
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.thesisService
        .assignSupervisor(thesis.id, result)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Encadrant attribué avec succès.',
              'Fermer',
              { duration: 3000 }
            );

            this.loadThesis(thesis.id);
          },
          error: () => {
            this.snackBar.open(
              'Impossible d’attribuer l’encadrant.',
              'Fermer',
              { duration: 4000 }
            );
          },
        });
    });
  }

  openStatusDialog(): void {
    const thesis = this.thesis();

    if (!thesis) return;

    const dialogRef = this.dialog.open(
      StatusChangeDialogComponent,
      {
        data: {
          allowedStatuses: this.allowedNextStatuses,
        },
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.thesisService
        .changeStatus(thesis.id, result)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Statut mis à jour avec succès.',
              'Fermer',
              { duration: 3000 }
            );

            this.loadThesis(thesis.id);
          },
        });
    });
  }

  openArchiveDialog(): void {
    const thesis = this.thesis();

    if (!thesis) return;

    const dialogRef = this.dialog.open(
      ArchiveDialogComponent,
      {
        data: {
          thesisId: thesis.id,
        },
        width: '460px',
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.snackBar.open(
        'Mémoire archivé avec succès.',
        'Fermer',
        { duration: 3000 }
      );

      this.loadThesis(thesis.id);
    });
  }

  addComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const thesis = this.thesis();

    if (!thesis) return;

    this.isCommenting.set(true);

    this.thesisService
      .addComment(thesis.id, {
        content: this.commentForm.getRawValue().content,
      })
      .subscribe({
        next: () => {
          this.isCommenting.set(false);
          this.commentForm.reset();
          this.loadThesis(thesis.id);
        },
        error: () => this.isCommenting.set(false),
      });
  }
}