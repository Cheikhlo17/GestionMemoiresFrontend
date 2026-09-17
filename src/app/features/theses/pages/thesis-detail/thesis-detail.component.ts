import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../../core/services/auth.service';
import { Thesis, ThesisStatus } from '../../../../core/models/thesis.model';
import { ThesisService } from '../../../../core/services/thesis.service';
import {
  StatusChangeDialogComponent,
} from '../../components/status-change-dialog/status-change-dialog.component';

const NEXT_STATUSES: Record<ThesisStatus, ThesisStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['revision_required', 'approved', 'rejected'],
  revision_required: ['submitted'],
  approved: ['archived'],
  rejected: [],
  archived: [],
};

@Component({
  selector: 'app-thesis-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './thesis-detail.component.html',
  styleUrl: './thesis-detail.component.scss',
})
export class ThesisDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly thesisService = inject(ThesisService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly authService = inject(AuthService);

  readonly thesis = signal<Thesis | null>(null);
  readonly isLoading = signal(false);
  readonly isUploading = signal(false);
  readonly isCommenting = signal(false);
  readonly selectedFile = signal<File | null>(null);

  readonly commentForm = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(3000)]],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadThesis(id);
  }

  private loadThesis(id: number): void {
    this.isLoading.set(true);
    this.thesisService.get(id).subscribe({
      next: (res) => {
        this.thesis.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  get isOwner(): boolean {
    return this.authService.currentUser()?.full_name === this.thesis()?.student.full_name
      && this.authService.hasRole('student');
  }

  get allowedNextStatuses(): ThesisStatus[] {
    const t = this.thesis();
    return t ? NEXT_STATUSES[t.status] : [];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  uploadFile(): void {
    const file = this.selectedFile();
    const thesis = this.thesis();
    if (!file || !thesis) return;

    this.isUploading.set(true);
    this.thesisService.uploadVersion(thesis.id, file).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.selectedFile.set(null);
        this.snackBar.open('File uploaded successfully.', 'Close', { duration: 3000 });
        this.loadThesis(thesis.id);
      },
      error: () => this.isUploading.set(false),
    });
  }

  downloadVersion(versionId: number, fileName: string): void {
    const thesis = this.thesis();
    if (!thesis) return;

    this.thesisService.downloadVersion(thesis.id, versionId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  submitThesis(): void {
    const thesis = this.thesis();
    if (!thesis) return;

    this.thesisService.submit(thesis.id).subscribe({
      next: () => {
        this.snackBar.open('Thesis submitted for review.', 'Close', { duration: 3000 });
        this.loadThesis(thesis.id);
      },
    });
  }

  openStatusDialog(): void {
    const thesis = this.thesis();
    if (!thesis) return;

    const dialogRef = this.dialog.open(StatusChangeDialogComponent, {
      data: { allowedStatuses: this.allowedNextStatuses },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.thesisService.changeStatus(thesis.id, result).subscribe({
        next: () => {
          this.snackBar.open('Status updated successfully.', 'Close', { duration: 3000 });
          this.loadThesis(thesis.id);
        },
      });
    });
  }

  addComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const thesis = this.thesis();
    if (!thesis) return;

    this.isCommenting.set(true);
    this.thesisService
      .addComment(thesis.id, { content: this.commentForm.getRawValue().content })
      .subscribe({
        next: () => {
          this.isCommenting.set(false);
          this.commentForm.reset();
          this.loadThesis(thesis.id);
        },
        error: () => this.isCommenting.set(false),
      });
  }
}