// src/app/features/admin/pages/users/users.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserListItem } from '../../../../core/models/user-list.model';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['full_name', 'email', 'role', 'status', 'actions'];

  readonly users = signal<UserListItem[]>([]);
  readonly totalItems = signal(0);
  readonly pageSize = signal(15);
  readonly pageIndex = signal(0);

  readonly filterForm = this.fb.nonNullable.group({ search: [''] });

  ngOnInit(): void {
    this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });
    this.load();
  }

  load(): void {
    this.adminService
      .listUsers({
        search: this.filterForm.getRawValue().search || undefined,
        per_page: this.pageSize(),
        page: this.pageIndex() + 1,
      })
      .subscribe((res) => {
        this.users.set(res.data);
        this.totalItems.set(res.meta.total);
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  toggleActive(user: UserListItem): void {
    this.adminService.toggleUserActive(user.id).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Fermer', { duration: 3000 });
        this.load();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message ?? 'Action impossible.', 'Fermer', {
          duration: 4000,
        });
      },
    });
  }
}