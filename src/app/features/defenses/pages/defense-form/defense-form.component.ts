import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefenseRoom } from '../../../../core/models/defense-room.model';
import { Thesis } from '../../../../core/models/thesis.model';
import { DefenseScheduleService } from '../../../../core/services/defense-schedule.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ThesisService } from '../../../../core/services/thesis.service';

@Component({
  selector: 'app-defense-form',
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
  templateUrl: './defense-form.component.html',
  styleUrl: './defense-form.component.scss',
})
export class DefenseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly defenseService = inject(DefenseScheduleService);
  private readonly lookupService = inject(LookupService);
  private readonly thesisService = inject(ThesisService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly rooms = signal<DefenseRoom[]>([]);
  readonly approvedTheses = signal<Thesis[]>([]);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    thesis_id: [null as number | null, [Validators.required]],
    defense_room_id: [null as number | null, [Validators.required]],
    date: [null as Date | null, [Validators.required]],
    time: ['09:00', [Validators.required]],
    duration_minutes: [60, [Validators.required, Validators.min(30), Validators.max(240)]],
  });

  ngOnInit(): void {
    this.lookupService.defenseRooms().subscribe((res) => this.rooms.set(res.data));
    this.thesisService
      .list({ status: 'approved', per_page: 100 })
      .subscribe((res) => this.approvedTheses.set(res.data));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const date = raw.date as Date;
    const [hours, minutes] = raw.time.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.defenseService
      .schedule({
        thesis_id: raw.thesis_id as number,
        defense_room_id: raw.defense_room_id as number,
        scheduled_at: date.toISOString(),
        duration_minutes: raw.duration_minutes,
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.snackBar.open('Defense scheduled successfully.', 'Close', { duration: 3000 });
          this.router.navigate(['/defenses', res.data.id]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err.error?.message ?? 'Unable to schedule the defense. Please check for conflicts.'
          );
        },
      });
  }
}