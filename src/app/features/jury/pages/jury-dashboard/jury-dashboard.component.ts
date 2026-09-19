import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DefenseSchedule } from '../../../../core/models/defense-schedule.model';
import { DefenseScheduleService } from '../../../../core/services/defense-schedule.service';

@Component({
  selector: 'app-jury-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatChipsModule, MatIconModule, MatTabsModule],
  templateUrl: './jury-dashboard.component.html',
  styleUrl: './jury-dashboard.component.scss',
})
export class JuryDashboardComponent implements OnInit {
  private readonly defenseService = inject(DefenseScheduleService);

  readonly schedules = signal<DefenseSchedule[]>([]);
  readonly isLoading = signal(false);

  readonly upcoming = computed(() =>
    this.schedules().filter(
      (s) => s.status === 'scheduled' && new Date(s.scheduled_at) >= new Date()
    )
  );

  readonly history = computed(() =>
    this.schedules().filter(
      (s) => s.status === 'completed' || new Date(s.scheduled_at) < new Date()
    )
  );

  ngOnInit(): void {
    this.isLoading.set(true);
    this.defenseService.mine().subscribe({
      next: (res) => {
        this.schedules.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}