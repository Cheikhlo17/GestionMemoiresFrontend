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
import { DefenseSchedule } from '../../../../core/models/defense-schedule.model';
import { DefenseScheduleService } from '../../../../core/services/defense-schedule.service';
import {
  AssignJuryDialogComponent,
} from '../../components/assign-jury-dialog/assign-jury-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

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
  ],
  templateUrl: './defense-detail.component.html',
  styleUrl: './defense-detail.component.scss',
})
export class DefenseDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly defenseService = inject(DefenseScheduleService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly authService = inject(AuthService);

  readonly schedule = signal<DefenseSchedule | null>(null);
  readonly isLoading = signal(false);
  readonly isDownloading = signal(false);

  readonly resultForm = this.fb.nonNullable.group({
    final_grade: [null as number | null],
    verdict: [null as string | null, [Validators.required]],
    remarks: [''],
  });

  get canManage(): boolean {
    return this.authService.hasRole('administrator', 'head-of-department');
  }

  get canRecordResult(): boolean {
    return this.canManage || this.authService.hasRole('jury-member');
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSchedule(id);
  }

  private loadSchedule(id: number): void {
    this.isLoading.set(true);
    this.defenseService.get(id).subscribe({
      next: (res) => {
        this.schedule.set(res.data);
        if (res.data.result) {
          this.resultForm.patchValue({
            final_grade: res.data.result.final_grade,
            verdict: res.data.result.verdict,
            remarks: res.data.result.remarks ?? undefined,
          });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAssignJuryDialog(): void {
    const schedule = this.schedule();
    if (!schedule) return;

    const dialogRef = this.dialog.open(AssignJuryDialogComponent, {
      data: {
        departmentId: 0, // resolved server-side via jury pool; frontend allows all active jury
        existingJury: schedule.jury_members,
      },
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.defenseService.assignJury(schedule.id, result).subscribe({
        next: () => {
          this.snackBar.open('Jury assigned successfully.', 'Close', { duration: 3000 });
          this.loadSchedule(schedule.id);
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message ?? 'Unable to assign jury.',
            'Close',
            { duration: 4000 }
          );
        },
      });
    });
  }

  cancelDefense(): void {
    const schedule = this.schedule();
    if (!schedule) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Defense',
        message: 'Are you sure you want to cancel this defense? Participants will be notified.',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.defenseService.cancel(schedule.id, 'Cancelled by administration').subscribe({
        next: () => {
          this.snackBar.open('Defense cancelled.', 'Close', { duration: 3000 });
          this.loadSchedule(schedule.id);
        },
      });
    });
  }

  submitResult(): void {
    if (this.resultForm.invalid) {
      this.resultForm.markAllAsTouched();
      return;
    }

    const schedule = this.schedule();
    if (!schedule) return;

    const raw = this.resultForm.getRawValue();

    this.defenseService
      .recordResult(schedule.id, {
        final_grade: raw.final_grade,
        verdict: raw.verdict as any,
        remarks: raw.remarks || undefined,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Result recorded successfully.', 'Close', { duration: 3000 });
          this.loadSchedule(schedule.id);
        },
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
      error: () => this.isDownloading.set(false),
    });
  }
}