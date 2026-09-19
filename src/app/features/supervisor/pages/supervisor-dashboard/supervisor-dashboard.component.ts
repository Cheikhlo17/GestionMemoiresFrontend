import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Supervisor } from '../../../../core/models/supervisor.model';
import { Thesis } from '../../../../core/models/thesis.model';
import { SupervisorService } from '../../../../core/services/supervisor.service';
import { ThesisService } from '../../../../core/services/thesis.service';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrl: './supervisor-dashboard.component.scss',
})
export class SupervisorDashboardComponent implements OnInit {
  private readonly supervisorService = inject(SupervisorService);
  private readonly thesisService = inject(ThesisService);

  readonly displayedColumns = ['student', 'title', 'status', 'lastActivity', 'actions'];

  readonly supervisor = signal<Supervisor | null>(null);
  readonly theses = signal<Thesis[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly pendingCount = computed(
    () => this.theses().filter((t) => t.status === 'under_review').length
  );

  readonly capacityLabel = computed(() => {
    const s = this.supervisor();
    return s ? `${this.theses().length} / ${s.max_students} students` : '';
  });

  ngOnInit(): void {
    this.isLoading.set(true);

    this.supervisorService.me().subscribe({
      next: (res) => {
        this.supervisor.set(res.data);
        this.loadTheses(res.data.id);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(
          'No supervisor profile is linked to your account yet. Contact an administrator.'
        );
      },
    });
  }

  private loadTheses(supervisorId: number): void {
    this.thesisService
      .list({ supervisor_id: supervisorId, per_page: 100, sort_by: 'status', sort_direction: 'asc' })
      .subscribe({
        next: (res) => {
          this.theses.set(res.data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  needsAction(thesis: Thesis): boolean {
    return thesis.status === 'under_review';
  }
}