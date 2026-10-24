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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AcademicYear } from '../../../../core/models/academic-year.model';
import { Department } from '../../../../core/models/department.model';
import { Program } from '../../../../core/models/program.model';
import { ThesisArchivePublic } from '../../../../core/models/thesis-archive.model';
import { ArchiveService } from '../../../../core/services/archive.service';
import { LookupService } from '../../../../core/services/lookup.service';

@Component({
  selector: 'app-archive-list',
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
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
  ],
  templateUrl: './archive-list.component.html',
  styleUrl: './archive-list.component.scss',
})
export class ArchiveListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly archiveService = inject(ArchiveService);
  private readonly lookupService = inject(LookupService);

  readonly archives = signal<ThesisArchivePublic[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly academicYears = signal<AcademicYear[]>([]);
  readonly programs = signal<Program[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly totalItems = signal(0);
  readonly pageSize = signal(20);
  readonly pageIndex = signal(0);

  readonly filterForm = this.fb.nonNullable.group({
    search: [''],
    department_id: [null as number | null],
    academic_year_id: [null as number | null],
    program_id: [null as number | null],
    degree_level: [null as string | null],
  });

  ngOnInit(): void {
    this.lookupService.departments().subscribe((res) => this.departments.set(res.data));
    this.lookupService.academicYears().subscribe((res) => this.academicYears.set(res.data));
    this.loadPrograms();

    this.filterForm.controls.department_id.valueChanges.subscribe((departmentId) => {
      this.filterForm.controls.program_id.setValue(null, { emitEvent: false });
      this.loadPrograms(departmentId ?? undefined);
    });

    this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });

    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const filters = this.filterForm.getRawValue();

    this.archiveService
      .list({
        search: filters.search || undefined,
        department_id: filters.department_id ?? undefined,
        academic_year_id: filters.academic_year_id ?? undefined,
        program_id: filters.program_id ?? undefined,
        degree_level: filters.degree_level ?? undefined,
        per_page: this.pageSize(),
        page: this.pageIndex() + 1,
      })
      .subscribe({
        next: (res) => {
          this.archives.set(res.data);
          this.totalItems.set(res.meta.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Impossible de charger les archives. Veuillez réessayer.');
        },
      });
  }

  private loadPrograms(departmentId?: number): void {
    this.lookupService
      .programs(departmentId)
      .subscribe((res) => this.programs.set(res.data));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }
}