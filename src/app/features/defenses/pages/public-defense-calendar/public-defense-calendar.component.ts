import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicDefenseCalendarEvent } from '../../../../core/models/public-defense-calendar.model';
import { PublicDefenseCalendarService } from '../../../../core/services/public-defense-calendar.service';

@Component({
  selector: 'app-public-defense-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './public-defense-calendar.component.html',
  styleUrl: './public-defense-calendar.component.scss',
})
export class PublicDefenseCalendarComponent implements OnInit {
  private readonly calendarService = inject(PublicDefenseCalendarService);

  readonly today = this.formatDate(new Date());
  from = this.today;
  to = this.addDays(this.today, 30);
  departmentId: number | null = null;
  roomId: number | null = null;
  events: PublicDefenseCalendarEvent[] = [];
  loading = false;
  errorMessage = '';
  hasSearched = false;

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    if (!this.from || !this.to || this.from > this.to) {
      this.errorMessage = 'Choisissez une période valide.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.hasSearched = true;
    this.calendarService
      .list({
        from: this.toIso(this.from, false),
        to: this.toIso(this.to, true),
        department_id: this.departmentId,
        room_id: this.roomId,
      })
      .subscribe({
        next: (response) => {
          this.events = response.data;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.error?.message || 'Le calendrier public est momentanément indisponible.';
          this.loading = false;
        },
      });
  }

  private addDays(date: string, days: number): string {
    const next = new Date(`${date}T00:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + days);
    return next.toISOString().slice(0, 10);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toIso(date: string, endOfDay: boolean): string {
    const value = new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00'}`);
    return value.toISOString();
  }
}
