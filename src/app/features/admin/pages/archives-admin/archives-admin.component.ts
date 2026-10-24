// src/app/features/admin/pages/archives-admin/archives-admin.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ThesisArchiveAdmin } from '../../../../core/models/thesis-archive.model';
import { Thesis } from '../../../../core/models/thesis.model';
import { AdminArchiveService } from '../../../../core/services/admin-archive.service';
import { ThesisService } from '../../../../core/services/thesis.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ArchiveDialogComponent } from '../../../theses/components/archive-dialog/archive-dialog.component';
import {
  VisibilityDialogComponent,
} from '../../components/visibility-dialog/visibility-dialog.component';

@Component({
  selector: 'app-archives-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './archives-admin.component.html',
  styleUrl: './archives-admin.component.scss',
})
export class ArchivesAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminArchiveService = inject(AdminArchiveService);
  private readonly thesisService = inject(ThesisService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['title', 'student', 'archived_at', 'visibility', 'actions'];
  readonly pendingColumns = ['title', 'student', 'action'];

  readonly archives = signal<ThesisArchiveAdmin[]>([]);
  readonly pending = signal<Thesis[]>([]);
  readonly totalItems = signal(0);
  readonly pageSize = signal(20);
  readonly pageIndex = signal(0);

  readonly filterForm = this.fb.nonNullable.group({
    search: [''],
    visibility: [null as string | null],
  });

  ngOnInit(): void {
    this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });
    this.load();
    this.loadPending();
  }

  load(): void {
    const filters = this.filterForm.getRawValue();
    this.adminArchiveService
      .list({
        search: filters.search || undefined,
        visibility: filters.visibility as any,
        per_page: this.pageSize(),
        page: this.pageIndex() + 1,
      })
      .subscribe((res) => {
        this.archives.set(res.data);
        this.totalItems.set(res.meta.total);
      });
  }

  loadPending(): void {
    this.thesisService
      .list({ status: 'approved', per_page: 50 })
      .subscribe((res) => this.pending.set(res.data));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  openArchiveDialog(thesis: Thesis): void {
    const dialogRef = this.dialog.open(ArchiveDialogComponent, {
      data: { thesisId: thesis.id },
      width: '460px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.snackBar.open('Mémoire archivé avec succès.', 'Fermer', { duration: 3000 });
      this.loadPending();
      this.load();
    });
  }

  openVisibilityDialog(archive: ThesisArchiveAdmin): void {
    const dialogRef = this.dialog.open(VisibilityDialogComponent, {
      data: {
        visibility: archive.visibility,
        showFinalGrade: archive.show_final_grade,
        keywords: archive.keywords ?? [],
      },
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.adminArchiveService.update(archive.id, result).subscribe({
        next: () => {
          this.snackBar.open('Archive mise à jour.', 'Fermer', { duration: 3000 });
          this.load();
        },
      });
    });
  }

  remove(archive: ThesisArchiveAdmin): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Supprimer l'archive",
        message: `Voulez-vous vraiment supprimer l'archive de "${archive.title}" ? Le mémoire original ne sera pas supprimé.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.adminArchiveService.delete(archive.id).subscribe({
        next: () => {
          this.snackBar.open('Archive supprimée.', 'Fermer', { duration: 3000 });
          this.load();
          this.loadPending();
        },
      });
    });
  }

  download(archive: ThesisArchiveAdmin): void {
    this.adminArchiveService.downloadBlob(archive.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = archive.final_version.file_name;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}