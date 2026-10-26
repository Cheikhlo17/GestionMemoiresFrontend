import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  SupervisionAction,
  SupervisionActionStatus,
  SupervisionMeeting,
} from '../../core/models/supervision-meeting.model';
import { SupervisionMeetingService } from '../../core/services/supervision-meeting.service';

@Component({
  selector: 'app-supervision-meetings',
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
  templateUrl: './supervision-meetings.component.html',
  styleUrl: './supervision-meetings.component.scss',
})
export class SupervisionMeetingsComponent implements OnInit {
  private readonly meetingService = inject(SupervisionMeetingService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  meetings: SupervisionMeeting[] = [];
  selectedMeeting: SupervisionMeeting | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  showForm = false;
  editing = false;
  showActionForm = false;
  meetingForm = this.emptyMeetingForm();
  actionForm = { assigned_to: null as number | null, description: '', due_at: '' };
  actionStatuses: Record<number, SupervisionActionStatus> = {};

  ngOnInit(): void {
    const thesisId = Number(this.route.snapshot.queryParamMap.get('thesis_id'));
    if (Number.isInteger(thesisId) && thesisId > 0) {
      this.meetingForm.thesis_id = thesisId;
      this.showForm = true;
    }
    this.loadMeetings();
  }

  loadMeetings(): void {
    this.loading = true;
    this.errorMessage = '';
    this.meetingService.list().subscribe({
      next: (response) => {
        this.meetings = response.data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.loading = false;
      },
    });
  }

  openMeeting(meeting: SupervisionMeeting): void {
    this.errorMessage = '';
    this.meetingService.get(meeting.id).subscribe({
      next: (response) => {
        this.selectedMeeting = response.data;
        this.meetingForm = this.formFromMeeting(response.data);
        for (const action of response.data.actions ?? []) {
          this.actionStatuses[action.id] = action.status;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
      },
    });
  }

  closeMeeting(): void {
    this.selectedMeeting = null;
    this.editing = false;
    this.showActionForm = false;
  }

  createMeeting(): void {
    const form = this.meetingForm;
    if (this.saving || !form.thesis_id || !form.scheduled_at || !form.mode.trim()) {
      this.errorMessage = 'Renseignez le mémoire, la date et le mode de la réunion.';
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.meetingService
      .create(form.thesis_id, this.toPayload(form))
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Réunion créée.', 'Fermer', { duration: 4000 });
          this.saving = false;
          this.showForm = false;
          this.meetingForm = this.emptyMeetingForm();
          this.loadMeetings();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.errorText(error);
          this.saving = false;
        },
      });
  }

  updateMeeting(): void {
    const meeting = this.selectedMeeting;
    const form = this.meetingForm;
    if (!meeting || this.saving || !form.scheduled_at || !form.mode.trim()) return;
    this.saving = true;
    this.errorMessage = '';
    this.meetingService.update(meeting.id, this.toPayload(form)).subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Réunion mise à jour.', 'Fermer', { duration: 4000 });
        this.saving = false;
        this.editing = false;
        this.refreshMeeting(meeting.id);
        this.loadMeetings();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.saving = false;
      },
    });
  }

  addAction(): void {
    const meeting = this.selectedMeeting;
    const form = this.actionForm;
    if (
      !meeting ||
      this.saving ||
      !form.assigned_to ||
      !form.description.trim() ||
      !form.due_at
    ) {
      this.errorMessage = 'Renseignez le responsable, la description et l’échéance de l’action.';
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.meetingService
      .addAction(meeting.id, {
        assigned_to: form.assigned_to,
        description: form.description.trim(),
        due_at: this.toIso(form.due_at),
      })
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Action ajoutée.', 'Fermer', { duration: 4000 });
          this.saving = false;
          this.showActionForm = false;
          this.actionForm = { assigned_to: null, description: '', due_at: '' };
          this.refreshMeeting(meeting.id);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.errorText(error);
          this.saving = false;
        },
      });
  }

  updateAction(action: SupervisionAction): void {
    const meeting = this.selectedMeeting;
    if (!meeting || this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    this.meetingService.updateAction(meeting.id, action.id, this.actionStatuses[action.id]).subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Statut de l’action mis à jour.', 'Fermer', {
          duration: 4000,
        });
        this.saving = false;
        this.refreshMeeting(meeting.id);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.saving = false;
      },
    });
  }

  private refreshMeeting(id: number): void {
    this.meetingService.get(id).subscribe({
      next: (response) => {
        this.selectedMeeting = response.data;
        this.meetingForm = this.formFromMeeting(response.data);
        for (const action of response.data.actions ?? []) {
          this.actionStatuses[action.id] = action.status;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
      },
    });
  }

  private formFromMeeting(meeting: SupervisionMeeting): ReturnType<SupervisionMeetingsComponent['emptyMeetingForm']> {
    return {
      thesis_id: meeting.thesis_id,
      scheduled_at: this.toLocalInput(meeting.scheduled_at),
      mode: meeting.mode,
      duration_minutes: meeting.duration_minutes,
      location: meeting.location ?? '',
      agenda: meeting.agenda ?? '',
      minutes: meeting.minutes ?? '',
      difficulties: meeting.difficulties ?? '',
      decisions: meeting.decisions ?? '',
    };
  }

  private emptyMeetingForm(): {
    thesis_id: number | null;
    scheduled_at: string;
    mode: string;
    duration_minutes: number | null;
    location: string;
    agenda: string;
    minutes: string;
    difficulties: string;
    decisions: string;
  } {
    return {
      thesis_id: null,
      scheduled_at: '',
      mode: '',
      duration_minutes: 60,
      location: '',
      agenda: '',
      minutes: '',
      difficulties: '',
      decisions: '',
    };
  }

  private toPayload(form: ReturnType<SupervisionMeetingsComponent['emptyMeetingForm']>) {
    return {
      scheduled_at: this.toIso(form.scheduled_at),
      mode: form.mode.trim(),
      duration_minutes: form.duration_minutes || undefined,
      location: form.location.trim() || null,
      agenda: form.agenda.trim() || null,
      minutes: form.minutes.trim() || null,
      difficulties: form.difficulties.trim() || null,
      decisions: form.decisions.trim() || null,
    };
  }

  private toIso(value: string): string {
    return new Date(value).toISOString();
  }

  private toLocalInput(value: string): string {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
  }

  private errorText(error: HttpErrorResponse): string {
    const errors = error.error?.errors as Record<string, string[]> | undefined;
    const first = errors ? Object.values(errors).flat()[0] : undefined;
    return first || error.error?.message || 'Une erreur est survenue. Réessayez.';
  }
}
