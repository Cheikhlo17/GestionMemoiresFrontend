import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { DefenseJuryEvaluation } from '../../../../core/models/defense-evaluation.model';
import { DefenseSchedule, DefenseVerdict } from '../../../../core/models/defense-schedule.model';
import { DefenseScheduleService } from '../../../../core/services/defense-schedule.service';
import { ThesisService } from '../../../../core/services/thesis.service';
import {
  AssignJuryDialogComponent,
} from '../../components/assign-jury-dialog/assign-jury-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UiLabelPipe } from '../../../../shared/pipes/ui-label.pipe';

@Component({
  selector: 'app-defense-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    UiLabelPipe,
  ],
  templateUrl: './defense-detail.component.html',
  styleUrl: './defense-detail.component.scss',
})
export class DefenseDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly defenseService = inject(DefenseScheduleService);
  private readonly thesisService = inject(ThesisService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly authService = inject(AuthService);

  readonly schedule = signal<DefenseSchedule | null>(null);
  readonly evaluations = signal<DefenseJuryEvaluation[]>([]);
  readonly isLoading = signal(false);
  readonly isDownloading = signal(false);
  readonly isLoadingJury = signal(false);
  readonly isAssigningJury = signal(false);
  readonly isSubmittingEvaluation = signal(false);
  readonly isSubmittingResult = signal(false);
  readonly isCancelling = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly evaluationForm = this.fb.group({
    grade: [null as number | null, [Validators.min(0), Validators.max(20)]],
    verdict: ['' as DefenseVerdict, [Validators.required]],
    remarks: [null as string | null],
  });

  readonly resultForm = this.fb.group({
    final_grade: [null as number | null, [Validators.min(0), Validators.max(20)]],
    verdict: ['' as DefenseVerdict, [Validators.required]],
    remarks: [null as string | null],
  });

  get canManage(): boolean {
    return this.authService.hasRole('administrator', 'head-of-department');
  }

  get isJuryMember(): boolean {
    return this.authService.hasRole('jury-member');
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSchedule(id);
  }

  private loadSchedule(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.defenseService.get(id).subscribe({
      next: (res) => {
        this.schedule.set(res.data);
        if (res.data.result) {
          this.resultForm.patchValue({
            final_grade: res.data.result.final_grade,
            verdict: res.data.result.verdict,
            remarks: res.data.result.remarks,
          });
        }
        this.isLoading.set(false);

        if (this.canManage || this.isJuryMember) {
          this.loadEvaluations(id);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les informations de la soutenance.');
      },
    });
  }

  private loadEvaluations(id: number): void {
    this.defenseService.listEvaluations(id).subscribe({
      next: (res) => {
        this.evaluations.set(res.data);
        const mine = res.data.find(
          (e) => e.jury_member.full_name === this.authService.currentUser()?.full_name
        );
        if (mine) {
          this.evaluationForm.patchValue({
            grade: mine.grade,
            verdict: mine.verdict,
            remarks: mine.remarks,
          });
        }
      },
    });
  }

  openAssignJuryDialog(): void {
    const schedule = this.schedule();
    if (!schedule || this.isLoadingJury() || this.isAssigningJury()) return;

    this.isLoadingJury.set(true);
    this.thesisService.get(schedule.thesis.id).subscribe({
      next: (res) => {
        this.isLoadingJury.set(false);
        const dialogRef = this.dialog.open(AssignJuryDialogComponent, {
          data: {
            departmentId: res.data.department.id,
            existingJury: schedule.jury_members,
          },
          width: '480px',
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (!result) return;

          this.isAssigningJury.set(true);
          this.defenseService.assignJury(schedule.id, result).subscribe({
            next: () => {
              this.isAssigningJury.set(false);
              this.snackBar.open('Jury attribué avec succès.', 'Fermer', { duration: 3000 });
              this.loadSchedule(schedule.id);
            },
            error: () => {
              this.isAssigningJury.set(false);
              this.snackBar.open('Impossible d’attribuer le jury.', 'Fermer', {
                duration: 4000,
              });
            },
          });
        });
      },
      error: () => {
        this.isLoadingJury.set(false);
        this.snackBar.open(
          'Impossible de charger le département du mémoire pour filtrer les membres du jury.',
          'Fermer',
          { duration: 5000 }
        );
      },
    });
  }

  cancelDefense(): void {
    const schedule = this.schedule();
    if (!schedule) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Annuler la soutenance',
        message: 'Voulez-vous vraiment annuler cette soutenance ? Les participants en seront informés.',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.isCancelling.set(true);
      this.defenseService.cancel(schedule.id, 'Cancelled by administration').subscribe({
        next: () => {
          this.isCancelling.set(false);
          this.snackBar.open('Soutenance annulée.', 'Fermer', { duration: 3000 });
          this.loadSchedule(schedule.id);
        },
        error: () => {
          this.isCancelling.set(false);
          this.snackBar.open('Impossible d’annuler la soutenance.', 'Fermer', {
            duration: 4000,
          });
        },
      });
    });
  }

  submitEvaluation(): void {
    if (this.isSubmittingEvaluation()) return;
    if (this.evaluationForm.invalid) {
      this.evaluationForm.markAllAsTouched();
      return;
    }

    const schedule = this.schedule();
    if (!schedule) return;

    const raw = this.evaluationForm.getRawValue();
    if (!raw.verdict) return;

    this.isSubmittingEvaluation.set(true);
    this.defenseService
      .submitEvaluation(schedule.id, {
        grade: raw.grade,
        verdict: raw.verdict,
        remarks: raw.remarks || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmittingEvaluation.set(false);
          this.snackBar.open('Votre évaluation a été enregistrée.', 'Fermer', { duration: 3000 });
          this.loadEvaluations(schedule.id);
        },
        error: () => this.isSubmittingEvaluation.set(false),
      });
  }

  submitResult(): void {
    if (this.isSubmittingResult()) return;
    if (this.resultForm.invalid) {
      this.resultForm.markAllAsTouched();
      return;
    }

    const schedule = this.schedule();
    if (!schedule) return;

    const raw = this.resultForm.getRawValue();
    if (!raw.verdict) return;

    this.isSubmittingResult.set(true);
    this.defenseService
      .recordResult(schedule.id, {
        final_grade: raw.final_grade,
        verdict: raw.verdict,
        remarks: raw.remarks || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmittingResult.set(false);
          this.snackBar.open('Décision finale enregistrée avec succès.', 'Fermer', { duration: 3000 });
          this.loadSchedule(schedule.id);
        },
        error: () => this.isSubmittingResult.set(false),
      });
  }

  downloadReport(): void {
    const schedule = this.schedule();
    if (!schedule) return;

    this.isDownloading.set(true);
    this.defenseService.downloadReport(schedule.id).subscribe({
      next: (blob) => {
        this.isDownloading.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `defense-report-${schedule.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.isDownloading.set(false);
        this.snackBar.open('Impossible de télécharger le procès-verbal.', 'Fermer', {
          duration: 4000,
        });
      },
    });
  }
}