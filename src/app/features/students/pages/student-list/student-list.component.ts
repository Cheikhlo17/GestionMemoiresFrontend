import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Department } from '../../../../core/models/department.model';
import { Program } from '../../../../core/models/program.model';
import { Student, StudentStatus } from '../../../../core/models/student.model';
import { LookupService } from '../../../../core/services/lookup.service';
import { StudentService } from '../../../../core/services/student.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-student-list',
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
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly lookupService = inject(LookupService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = [
    'student_number',
    'full_name',
    'email',
    'department',
    'program',
    'status',
    'actions',
  ];

  readonly students = signal<Student[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly programs = signal<Program[]>([]);
  readonly isLoading = signal(false);
  readonly totalItems = signal(0);
  readonly pageSize = signal(15);
  readonly pageIndex = signal(0);

  readonly statusOptions: StudentStatus[] = ['active', 'graduated', 'suspended', 'withdrawn'];

  readonly filterForm = this.fb.nonNullable.group({
    search: [''],
    department_id: [null as number | null],
    program_id: [null as number | null],
    status: [null as StudentStatus | null],
  });

  private sortBy = 'created_at';
  private sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    this.lookupService.departments().subscribe((res) => this.departments.set(res.data));
    this.lookupService.programs().subscribe((res) => this.programs.set(res.data));

    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadStudents();
      });

    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading.set(true);
    const filters = this.filterForm.getRawValue();

    this.studentService
      .list({
        search: filters.search || undefined,
        department_id: filters.department_id ?? undefined,
        program_id: filters.program_id ?? undefined,
        status: filters.status ?? undefined,
        sort_by: this.sortBy,
        sort_direction: this.sortDirection,
        per_page: this.pageSize(),
        page: this.pageIndex() + 1,
      })
      .subscribe({
        next: (res) => {
          this.students.set(res.data);
          this.totalItems.set(res.meta.total);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadStudents();
  }

  onSortChange(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.sortBy = 'created_at';
      this.sortDirection = 'desc';
    } else {
      this.sortBy = sort.active;
      this.sortDirection = sort.direction as 'asc' | 'desc';
    }
    this.loadStudents();
  }

  deleteStudent(student: Student): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Student',
        message: `Are you sure you want to delete ${student.full_name}? This action cannot be undone.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.studentService.delete(student.id).subscribe({
        next: () => {
          this.snackBar.open('Student deleted successfully.', 'Close', { duration: 3000 });
          this.loadStudents();
        },
      });
    });
  }
}