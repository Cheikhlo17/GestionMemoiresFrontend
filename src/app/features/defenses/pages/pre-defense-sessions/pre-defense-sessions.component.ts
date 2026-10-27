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
import { AuthService } from '../../../../core/services/auth.service';
import { Department } from '../../../../core/models/department.model';
import { LookupService } from '../../../../core/services/lookup.service';
import { PreDefenseService } from '../../../../core/services/pre-defense.service';
import {
  PreDefensePassage,
  PreDefensePassageOutcome,
  PreDefenseSession,
} from '../../../../core/models/pre-defense.model';

@Component({
  selector: 'app-pre-defense-sessions',
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
  templateUrl: './pre-defense-sessions.component.html',
  styleUrl: './pre-defense-sessions.component.scss',
})
export class PreDefenseSessionsComponent implements OnInit {
  private readonly preDefense = inject(PreDefenseService);
  private readonly auth = inject(AuthService);
  private readonly lookupService = inject(LookupService);
  private readonly snackBar = inject(MatSnackBar);

  sessions: PreDefenseSession[] = [];
  departments: Department[] = [];
  selectedSession: PreDefenseSession | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  departmentLookupError = '';
  showCreateForm = false;
  showEditForm = false;
  showPassageForm = false;
  sessionForm = this.emptySessionForm();
  passageForm = this.emptyPassageForm();
  readonly passageOutcome: Record<number, PreDefensePassageOutcome> = {};

  get canCreate(): boolean {
    return this.auth.hasRole('administrator', 'head-of-department', 'supervisor');
  }

  ngOnInit(): void {
    this.loadSessions();
    this.lookupService.departments().subscribe({
      next: (response) => {
        this.departments = response.data;
      },
      error: (error: HttpErrorResponse) => {
        this.departmentLookupError = this.errorText(error);
      },
    });
  }

  loadSessions(): void {
    this.loading = true;
    this.errorMessage = '';
    this.preDefense.list().subscribe({
      next: (response) => {
        this.sessions = response.data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.loading = false;
      },
    });
  }

  openSession(session: PreDefenseSession): void {
    this.errorMessage = '';
    this.preDefense.get(session.id).subscribe({
      next: (response) => {
        this.selectedSession = response.data;
        this.sessionForm = this.formFromSession(response.data);
        for (const passage of response.data.passages ?? []) {
          this.passageOutcome[passage.id] = passage.outcome;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
      },
    });
  }

  closeDetails(): void {
    this.selectedSession = null;
    this.showEditForm = false;
    this.showPassageForm = false;
  }

  canManage(session: PreDefenseSession): boolean {
    return (
      this.auth.hasRole('administrator', 'head-of-department') ||
      session.responsible?.id === this.auth.currentUser()?.id ||
      session.responsible_user_id === this.auth.currentUser()?.id
    );
  }

  outcomeLabel(outcome: PreDefensePassageOutcome): string {
    const map: Record<PreDefensePassageOutcome, string> = {
      pending: 'En attente',
      ready: 'Prêt',
      needs_revision: 'À revoir',
    };
    return map[outcome] ?? outcome;
  }

  createSession(): void {
    const userId = this.auth.currentUser()?.id;
    if (
      this.saving ||
      !this.sessionForm.department_id ||
      !this.sessionForm.location.trim() ||
      !this.sessionForm.scheduled_at ||
      !userId
    ) {
      this.errorMessage = 'Complétez les champs obligatoires de la séance.';
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.preDefense
      .create({
        department_id: this.sessionForm.department_id,
        responsible_user_id: userId,
        location: this.sessionForm.location.trim(),
        scheduled_at: this.toIso(this.sessionForm.scheduled_at),
        duration_minutes: this.sessionForm.duration_minutes || undefined,
      })
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Séance créée.', 'Fermer', { duration: 4000 });
          this.saving = false;
          this.showCreateForm = false;
          this.sessionForm = this.emptySessionForm();
          this.loadSessions();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.errorText(error);
          this.saving = false;
        },
      });
  }

  updateSession(): void {
    const session = this.selectedSession;
    if (!session || this.saving || !this.sessionForm.location.trim() || !this.sessionForm.scheduled_at) {
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.preDefense
      .update(session.id, {
        location: this.sessionForm.location.trim(),
        scheduled_at: this.toIso(this.sessionForm.scheduled_at),
        duration_minutes: this.sessionForm.duration_minutes || undefined,
      })
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Séance mise à jour.', 'Fermer', { duration: 4000 });
          this.saving = false;
          this.showEditForm = false;
          this.refreshSelectedSession(session.id);
          this.loadSessions();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.errorText(error);
          this.saving = false;
        },
      });
  }

  setSessionStatus(status: 'completed' | 'cancelled'): void {
    const session = this.selectedSession;
    if (!session || this.saving) return;
    if (
      status === 'cancelled' &&
      !window.confirm('Confirmer l’annulation de cette séance ?')
    ) {
      return;
    }
    if (
      status === 'completed' &&
      (session.passages ?? []).some((passage) => passage.outcome === 'pending')
    ) {
      this.errorMessage = 'Tous les passages doivent avoir un résultat avant la clôture.';
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.preDefense.updateStatus(session.id, status).subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Statut de séance mis à jour.', 'Fermer', {
          duration: 4000,
        });
        this.saving = false;
        this.refreshSelectedSession(session.id);
        this.loadSessions();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
        this.saving = false;
      },
    });
  }

  addPassage(): void {
    const session = this.selectedSession;
    const form = this.passageForm;
    if (
      !session ||
      this.saving ||
      !form.thesis_id ||
      !form.position ||
      !form.scheduled_at
    ) {
      this.errorMessage = 'Complétez l’identifiant du mémoire, la position et l’horaire.';
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.preDefense
      .addPassage(session.id, {
        thesis_id: form.thesis_id,
        position: form.position,
        scheduled_at: this.toIso(form.scheduled_at),
        duration_minutes: form.duration_minutes || undefined,
        observations: form.observations.trim() || undefined,
        recommendations: form.recommendations.trim() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Passage ajouté.', 'Fermer', { duration: 4000 });
          this.saving = false;
          this.showPassageForm = false;
          this.passageForm = this.emptyPassageForm();
          this.refreshSelectedSession(session.id);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.errorText(error);
          this.saving = false;
        },
      });
  }

  updatePassage(passage: PreDefensePassage): void {
    const session = this.selectedSession;
    const outcome = this.passageOutcome[passage.id];
    if (!session || !outcome || this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    this.preDefense
      .updatePassage(session.id, passage.id, {
        outcome,
        observations: passage.observations ?? undefined,
        recommendations: passage.recommendations ?? undefined,
      })
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Passage mis à jour.', 'Fermer', { duration: 4000 });
          this.saving = false;
          this.refreshSelectedSession(session.id);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.errorText(error);
          this.saving = false;
        },
      });
  }

  private refreshSelectedSession(id: number): void {
    this.preDefense.get(id).subscribe({
      next: (response) => {
        this.selectedSession = response.data;
        this.sessionForm = this.formFromSession(response.data);
        for (const passage of response.data.passages ?? []) {
          this.passageOutcome[passage.id] = passage.outcome;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.errorText(error);
      },
    });
  }

  private formFromSession(session: PreDefenseSession): ReturnType<PreDefenseSessionsComponent['emptySessionForm']> {
    return {
      department_id: session.department_id,
      location: session.location,
      scheduled_at: this.toLocalInput(session.scheduled_at),
      duration_minutes: session.duration_minutes,
    };
  }

  private emptySessionForm(): {
    department_id: number | null;
    location: string;
    scheduled_at: string;
    duration_minutes: number | null;
  } {
    return { department_id: null, location: '', scheduled_at: '', duration_minutes: 240 };
  }

  private emptyPassageForm(): {
    thesis_id: number | null;
    position: number | null;
    scheduled_at: string;
    duration_minutes: number | null;
    observations: string;
    recommendations: string;
  } {
    return {
      thesis_id: null,
      position: null,
      scheduled_at: '',
      duration_minutes: 15,
      observations: '',
      recommendations: '',
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
