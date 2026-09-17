import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { DefenseRoom } from '../../../../core/models/defense-room.model';
import { DefenseSchedule } from '../../../../core/models/defense-schedule.model';
import { DefenseScheduleService } from '../../../../core/services/defense-schedule.service';
import { LookupService } from '../../../../core/services/lookup.service';

interface CalendarDay {
  date: Date;
  isToday: boolean;
  defenses: DefenseSchedule[];
}

@Component({
  selector: 'app-defense-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './defense-calendar.component.html',
  styleUrl: './defense-calendar.component.scss',
})
export class DefenseCalendarComponent implements OnInit {
  private readonly defenseService = inject(DefenseScheduleService);
  private readonly lookupService = inject(LookupService);
  readonly authService = inject(AuthService);

  readonly weekStart = signal(this.getStartOfWeek(new Date()));
  readonly schedules = signal<DefenseSchedule[]>([]);
  readonly rooms = signal<DefenseRoom[]>([]);
  readonly selectedRoomId = signal<number | null>(null);
  readonly isLoading = signal(false);

  readonly days = computed<CalendarDay[]>(() => {
    const start = this.weekStart();
    const today = new Date();
    const schedules = this.schedules();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const dayDefenses = schedules.filter((s) => {
        const d = new Date(s.scheduled_at);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );
      });

      return {
        date,
        isToday: date.toDateString() === today.toDateString(),
        defenses: dayDefenses.sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        ),
      };
    });
  });

  get canSchedule(): boolean {
    return this.authService.hasRole('administrator', 'head-of-department');
  }

  ngOnInit(): void {
    this.lookupService.defenseRooms().subscribe((res) => this.rooms.set(res.data));
    this.loadWeek();
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  loadWeek(): void {
    this.isLoading.set(true);
    const from = this.weekStart();
    const to = new Date(from);
    to.setDate(from.getDate() + 7);

    this.defenseService
      .calendar({
        from: from.toISOString(),
        to: to.toISOString(),
        room_id: this.selectedRoomId(),
      })
      .subscribe({
        next: (res) => {
          this.schedules.set(res.data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  onRoomChange(): void {
    this.loadWeek();
  }

  previousWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d);
    this.loadWeek();
  }

  nextWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d);
    this.loadWeek();
  }

  today(): void {
    this.weekStart.set(this.getStartOfWeek(new Date()));
    this.loadWeek();
  }
}