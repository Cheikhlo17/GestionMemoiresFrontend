import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ThesisService } from '../../../../core/services/thesis.service';
import { Thesis, ThesisStatus } from '../../../../core/models/thesis.model';

@Component({
  selector: 'app-thesis-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './thesis-list.component.html',
  styleUrl: './thesis-list.component.scss',
})
export class ThesisListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly thesisService = inject(ThesisService);
  readonly authService = inject(AuthService);

  readonly displayedColumns = ['title', 'student', 'supervisor', 'department', 'status', 'actions'];

  readonly theses = signal<Thesis[]>([]);
  readonly isLoading = signal(false);
  readonly totalItems = signal(0);
  readonly pageSize = signal(15);
  readonly pageIndex = signal(0);

  readonly statusOptions: ThesisStatus[] = [
    'draft',
    'submitted',
    'under_review',
    'revision_required',
    'approved',
    'rejected',
    'archived',
  ];

  readonly filterForm = this.fb.nonNullable.group({
    search: [''],
    status: [null as ThesisStatus | null],
  });

  get canCreate(): boolean {
    return this.authService.hasRole('student');
  }

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadTheses();
      });

    this.loadTheses();
  }

  loadTheses(): void {
    this.isLoading.set(true);
    const filters = this.filterForm.getRawValue();

    this.thesisService
      .list({
        search: filters.search || undefined,
        status: filters.status ?? undefined,
        per_page: this.pageSize(),
        page: this.pageIndex() + 1,
      })
      .subscribe({
        next: (res) => {
          this.theses.set(res.data);
          this.totalItems.set(res.meta.total);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadTheses();
  }
}